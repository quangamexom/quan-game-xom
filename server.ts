import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

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
