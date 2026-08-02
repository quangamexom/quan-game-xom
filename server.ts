import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { parseGoogleSheetCSV } from "./src/services/sheetService";

const app = express();
const PORT = 3000;

app.use(express.json());

// 1. Google Sheet Proxy Route
app.get("/api/sheet-sync", async (req, res) => {
  try {
    const rawUrl = req.query.url as string || "https://docs.google.com/spreadsheets/d/1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4/edit?gid=0#gid=0";
    const gid = (req.query.gid as string) || "0";

    let sheetId = "1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4";
    const idMatch = rawUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) sheetId = idMatch[1];
    
    const gidMatch = rawUrl.match(/gid=([0-9]+)/);
    const targetGid = gidMatch ? gidMatch[1] : gid;

    const exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${targetGid}`;

    console.log(`[Sheet Sync] Proxying request to: ${exportUrl}`);

    const response = await fetch(exportUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/csv,application/csv,text/plain"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Failed to fetch Google Sheet CSV: HTTP ${response.status}`,
        sheetId,
        gid: targetGid
      });
    }

    const csvText = await response.text();
    const games = parseGoogleSheetCSV(csvText);

    return res.json({
      success: true,
      count: games.length,
      sheetId,
      gid: targetGid,
      syncedAt: new Date().toISOString(),
      games
    });

  } catch (err: any) {
    console.error("[Sheet Sync Error]:", err);
    return res.status(500).json({ error: err.message || "Internal server error fetching sheet" });
  }
});

// 2. LaunchBox / Gemini AI metadata enrichment route
app.post("/api/enrich-game", async (req, res) => {
  try {
    const { title, platform } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Game title is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: "No Gemini API Key provided, returning standard metadata template.",
        enriched: {
          developer: "LaunchBox DB Verified",
          publisher: "Quán Game Xóm Verified",
          rating: 4.9,
          genres: ["Action", "Adventure", "Việt Hóa"],
          releaseYear: 2024
        }
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Return a JSON object for game metadata matching LaunchBox Games DB standards for "${title}" (${platform || 'PC'}).
JSON schema ONLY:
{
  "releaseYear": number,
  "developer": string,
  "publisher": string,
  "genres": string[],
  "rating": number (between 4.0 and 5.0),
  "fileSize": string,
  "description": string (in Vietnamese, elegant tone),
  "systemReqs": {
    "os": string,
    "cpu": string,
    "ram": string,
    "gpu": string,
    "storage": string
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const contentText = response.text || "{}";
    const enriched = JSON.parse(contentText);

    return res.json({
      success: true,
      enriched
    });

  } catch (err: any) {
    console.error("[Enrich Game Error]:", err);
    return res.status(500).json({ error: err.message || "Failed to enrich metadata" });
  }
});

// 3. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🎮 Quán Game Xóm Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
