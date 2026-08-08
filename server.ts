import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import googleSheetBackup from "./src/data/googleSheetGames.json";

const app = express();
const PORT = 3000;

app.use(express.json());

// 0. Secure Admin Password Verification Route
app.post("/api/admin/verify", (req, res) => {
  try {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD || "20266Namm$$@";
    
    if (password === expectedPassword) {
      return res.json({ success: true, token: "qgx_admin_authenticated" });
    }
    return res.status(401).json({ success: false, error: "Mật khẩu Admin không chính xác!" });
  } catch (err: any) {
    console.error("[Admin Verify Error]:", err);
    return res.status(500).json({ success: false, error: "Lỗi hệ thống khi xác thực Admin" });
  }
});

// 1. Google Sheet Games route
app.get("/api/sheet-games", async (req, res) => {
  try {
    // Return Google Sheet games data
    return res.json({
      success: true,
      count: googleSheetBackup.length,
      sheetId: "1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4",
      sheetUrl: "https://docs.google.com/spreadsheets/d/1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4/edit?gid=0#gid=0",
      syncedAt: new Date().toISOString(),
      games: googleSheetBackup
    });
  } catch (err: any) {
    console.error("[Sheet Games API Error]:", err);
    return res.json({
      success: true,
      count: googleSheetBackup.length,
      games: googleSheetBackup
    });
  }
});

// 2. Steam Store Search Proxy route (Bypasses browser CORS & provides high quality posters)
app.get("/api/steam-search", async (req, res) => {
  try {
    const term = req.query.term as string;
    if (!term || typeof term !== 'string' || term.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Search term required" });
    }

    const cleanedTerm = term.trim();
    const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanedTerm)}&l=english&cc=US`;
    
    const response = await fetch(steamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      return res.status(502).json({ success: false, error: "Steam API HTTP error" });
    }

    const data = await response.json();
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      const item = data.items[0];
      const appId = item.id;
      return res.json({
        success: true,
        appId: String(appId),
        name: item.name,
        coverImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`,
        bannerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
        rating: 95,
        genres: item.genres ? item.genres.map((g: any) => g.name || g) : ['Game PC']
      });
    }

    return res.json({ success: false, message: "No Steam game found" });
  } catch (err: any) {
    console.error("[Steam Search API Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Steam search failed" });
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

// 3. Save Game Cover Art to gameArtMap.ts & Commit to GitHub (if GITHUB_TOKEN configured)
app.post("/api/save-game-art", async (req, res) => {
  try {
    const { gameId, title, imageType, imageUrl, fileData } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const cleanKey = title.split('\n')[0]
      .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[⭐🇻🇳🔥💥✦⚡✨🎮👑💎]/gu, ' ')
      .replace(/[\(\[\{].*?[\)\]\}]/g, ' ')
      .replace(/quán game xóm|qgx edition|edition|việt hóa|việt hoá|viethoa|resynced|remastered|re-?make|repack|full iso|iso|crack/gi, ' ')
      .replace(/[:\-\—\–\/\_\.\,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const finalImageSrc = fileData || imageUrl;

    // A. Update local gameArtMap.ts on disk
    const artMapPath = path.join(process.cwd(), "src", "data", "gameArtMap.ts");
    let fileContent = "";
    if (fs.existsSync(artMapPath)) {
      fileContent = fs.readFileSync(artMapPath, "utf-8");
    }

    const keyEntry = `'${cleanKey}':`;
    const isBanner = imageType === "banner";

    if (fileContent.includes(keyEntry)) {
      const coverProp = isBanner ? "bannerImage" : "coverImage";
      const propRegex = new RegExp(`('${cleanKey}':\\s*\\{[^}]*?${coverProp}:\\s*['"])([^'"]+)(['"])`, "s");
      if (propRegex.test(fileContent)) {
        fileContent = fileContent.replace(propRegex, `$1${finalImageSrc}$3`);
      } else {
        fileContent = fileContent.replace(
          new RegExp(`('${cleanKey}':\\s*\\{)`),
          `$1\n    ${coverProp}: '${finalImageSrc}',`
        );
      }
    } else {
      const newEntry = `\n  '${cleanKey}': {\n    coverImage: '${finalImageSrc}',\n    bannerImage: '${finalImageSrc}',\n    rating: 95,\n    genres: ['Game Quán Xóm']\n  },`;
      fileContent = fileContent.replace(
        "export const KNOWN_GAME_ART: Record<string, StaticGameArt> = {",
        `export const KNOWN_GAME_ART: Record<string, StaticGameArt> = {${newEntry}`
      );
    }

    fs.writeFileSync(artMapPath, fileContent, "utf-8");

    // B. Attempt GitHub API Commit if GITHUB_TOKEN & GITHUB_REPO present
    let savedToGithub = false;
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;

    if (githubToken && githubRepo) {
      try {
        const ghUrl = `https://api.github.com/repos/${githubRepo}/contents/src/data/gameArtMap.ts`;
        const getRes = await fetch(ghUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "QuanGameXom-App"
          }
        });

        if (getRes.ok) {
          const fileDataGh = await getRes.json();
          const sha = fileDataGh.sha;

          const putRes = await fetch(ghUrl, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${githubToken}`,
              Accept: "application/vnd.github.v3+json",
              "Content-Type": "application/json",
              "User-Agent": "QuanGameXom-App"
            },
            body: JSON.stringify({
              message: `chore(art): update ${imageType} for "${title}"`,
              content: Buffer.from(fileContent).toString("base64"),
              sha
            })
          });

          if (putRes.ok) {
            savedToGithub = true;
          }
        }
      } catch (ghErr) {
        console.warn("[GitHub Commit Warning]:", ghErr);
      }
    }

    return res.json({
      success: true,
      cleanKey,
      savedToGithub,
      message: savedToGithub
        ? "Đã lưu ảnh và commit thành công lên GitHub Repository!"
        : "Đã lưu ảnh thành công vào gameArtMap!"
    });
  } catch (err: any) {
    console.error("[Save Game Art Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to save game art" });
  }
});

// Get Current Custom Logo
app.get("/api/get-logo", (req, res) => {
  try {
    const customLogoPath = path.join(process.cwd(), "src/data/customLogo.ts");
    const defaultLogoUrl = "/assets/logo/logo-qgx-default.png";
    let logoUrl = defaultLogoUrl;

    if (fs.existsSync(customLogoPath)) {
      const content = fs.readFileSync(customLogoPath, "utf-8");
      const match = content.match(/CUSTOM_LOGO_URL\s*=\s*['"]([^'"]+)['"]/);
      if (match && match[1]) {
        logoUrl = match[1];
      }
    }

    return res.json({ success: true, logoUrl, defaultLogoUrl });
  } catch (err: any) {
    return res.json({ success: true, logoUrl: "/assets/logo/logo-qgx-default.png" });
  }
});

// Save Custom Logo & Commit to Local Disk & GitHub
app.post("/api/save-logo", async (req, res) => {
  try {
    const { logoUrl, fileData } = req.body;
    const rawLogo = fileData || logoUrl;
    if (!rawLogo) {
      return res.status(400).json({ success: false, error: "Logo URL or file data is required" });
    }

    let finalLogoUrl = rawLogo;

    // Handle base64 image saving to disk
    if (rawLogo.startsWith("data:image/")) {
      try {
        const matches = rawLogo.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const ext = matches[1] === "svg+xml" ? "svg" : matches[1] || "png";
          const buffer = Buffer.from(matches[2], "base64");
          
          const publicLogoDir = path.join(process.cwd(), "public/assets/logo");
          const srcLogoDir = path.join(process.cwd(), "src/assets/logo");
          
          if (!fs.existsSync(publicLogoDir)) fs.mkdirSync(publicLogoDir, { recursive: true });
          if (!fs.existsSync(srcLogoDir)) fs.mkdirSync(srcLogoDir, { recursive: true });

          const filename = `logo-uploaded.${ext}`;
          fs.writeFileSync(path.join(publicLogoDir, filename), buffer);
          fs.writeFileSync(path.join(srcLogoDir, filename), buffer);

          finalLogoUrl = `/assets/logo/${filename}?t=${Date.now()}`;
        }
      } catch (fileWriteErr) {
        console.warn("[Save Logo File Disk Warning]:", fileWriteErr);
      }
    }

    // Always update local src/data/customLogo.ts
    const customLogoFilePath = path.join(process.cwd(), "src/data/customLogo.ts");
    const logoFileContent = `export const DEFAULT_LOGO_URL = '/assets/logo/logo-qgx-default.png';\nexport const CUSTOM_LOGO_URL = '${finalLogoUrl.replace(/'/g, "\\'")}';\n`;
    
    fs.writeFileSync(customLogoFilePath, logoFileContent, "utf-8");

    let savedToGithub = false;
    const githubToken = process.env.GITHUB_TOKEN;
    const githubRepo = process.env.GITHUB_REPO;

    if (githubToken && githubRepo) {
      try {
        const ghUrl = `https://api.github.com/repos/${githubRepo}/contents/src/data/customLogo.ts`;
        let sha: string | undefined;

        const getRes = await fetch(ghUrl, {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "QuanGameXom-App"
          }
        });

        if (getRes.ok) {
          const fileDataGh = await getRes.json();
          sha = fileDataGh.sha;
        }

        const putRes = await fetch(ghUrl, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
            "User-Agent": "QuanGameXom-App"
          },
          body: JSON.stringify({
            message: "chore(logo): update custom logo",
            content: Buffer.from(logoFileContent).toString("base64"),
            ...(sha ? { sha } : {})
          })
        });

        if (putRes.ok) {
          savedToGithub = true;
        }
      } catch (ghErr) {
        console.warn("[GitHub Logo Commit Warning]:", ghErr);
      }
    }

    return res.json({
      success: true,
      savedToGithub,
      logoUrl: finalLogoUrl,
      message: savedToGithub
        ? "Đã lưu logo và commit lên GitHub thành công!"
        : "Đã cập nhật logo thành công trên server!"
    });
  } catch (err: any) {
    console.error("[Save Logo Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to save logo" });
  }
});

// 4. Health check
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
