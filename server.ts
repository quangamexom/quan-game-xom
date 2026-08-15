import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { put, list, del } from "@vercel/blob";
import googleSheetBackup from "./src/data/googleSheetGames.json";
import { 
  readGamesLibrary, 
  writeGamesLibrary, 
  addGameToLibrary, 
  updateGameInLibrary, 
  removeGameFromLibrary 
} from "./server/metadataStorage";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Normalize request URL for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/assets")) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Express Static Serving for Public Uploaded Assets
app.use("/assets", express.static(path.join(process.cwd(), "public", "assets")));

// Helper function to read persistent art map overrides
function getArtMapOverrides(): Record<string, { coverImage?: string; bannerImage?: string; rating?: number; genres?: string[] }> {
  try {
    const overridesPath = path.join(process.cwd(), "public", "assets", "covers", "gameArtOverrides.json");
    if (fs.existsSync(overridesPath)) {
      const content = fs.readFileSync(overridesPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn("[getArtMapOverrides error]:", err);
  }
  return {};
}

// Save persistent art map overrides
function saveArtMapOverrides(overrides: Record<string, any>) {
  try {
    const publicDir = path.join(process.cwd(), "public", "assets", "covers");
    const srcDir = path.join(process.cwd(), "src", "assets", "covers");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });

    const content = JSON.stringify(overrides, null, 2);
    fs.writeFileSync(path.join(publicDir, "gameArtOverrides.json"), content, "utf-8");
    fs.writeFileSync(path.join(srcDir, "gameArtOverrides.json"), content, "utf-8");
  } catch (err) {
    console.warn("[saveArtMapOverrides error]:", err);
  }
}

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
      sheetId: "1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM",
      sheetUrl: "https://docs.google.com/spreadsheets/d/1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM/edit?gid=0#gid=0",
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

    let finalImageSrc = fileData || imageUrl;
    const isBanner = imageType === "banner";

    // A. Handle base64 image saving to disk as image files in /public/assets/covers
    if (finalImageSrc && finalImageSrc.startsWith("data:image/")) {
      try {
        const matches = finalImageSrc.match(/^data:image\/([a-zA-Z0-9\+\=]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const rawExt = matches[1];
          const ext = rawExt.includes("svg") ? "svg" : rawExt.includes("jpeg") || rawExt.includes("jpg") ? "jpg" : rawExt.includes("webp") ? "webp" : "png";
          const buffer = Buffer.from(matches[2], "base64");
          
          const publicCoversDir = path.join(process.cwd(), "public/assets/covers");
          const srcCoversDir = path.join(process.cwd(), "src/assets/covers");
          
          if (!fs.existsSync(publicCoversDir)) fs.mkdirSync(publicCoversDir, { recursive: true });
          if (!fs.existsSync(srcCoversDir)) fs.mkdirSync(srcCoversDir, { recursive: true });

          const safeFilenameKey = cleanKey.replace(/[^a-z0-9]/g, '_');
          const filename = `${safeFilenameKey}-${isBanner ? 'banner' : 'cover'}.${ext}`;
          
          fs.writeFileSync(path.join(publicCoversDir, filename), buffer);
          fs.writeFileSync(path.join(srcCoversDir, filename), buffer);

          finalImageSrc = `/assets/covers/${filename}?t=${Date.now()}`;
        }
      } catch (fileWriteErr) {
        console.warn("[Save Game Cover File Disk Warning]:", fileWriteErr);
      }
    }

    // B. Update persistent gameArtOverrides.json
    const overrides = getArtMapOverrides();
    const rawLower = title.toLowerCase().trim();
    const normKey = title.toLowerCase().replace(/[:\-\—\–\/\_\.\,]/g, ' ').replace(/\s+/g, ' ').trim();
    const keysToUpdate = Array.from(new Set([cleanKey, rawLower, normKey])).filter(Boolean);

    for (const k of keysToUpdate) {
      overrides[k] = overrides[k] || {
        coverImage: finalImageSrc,
        bannerImage: finalImageSrc,
        rating: 95,
        genres: ['Game Quán Xóm']
      };

      if (isBanner) {
        overrides[k].bannerImage = finalImageSrc;
      } else {
        overrides[k].coverImage = finalImageSrc;
      }
    }
    saveArtMapOverrides(overrides);

    // C. Update local gameArtMap.ts on disk
    const artMapPath = path.join(process.cwd(), "src", "data", "gameArtMap.ts");
    let fileContent = "";
    if (fs.existsSync(artMapPath)) {
      fileContent = fs.readFileSync(artMapPath, "utf-8");
    }

    const keyEntry = `'${cleanKey}':`;

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

    // D. Attempt GitHub API Commit if GITHUB_TOKEN & GITHUB_REPO present
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
      finalImageSrc,
      savedToGithub,
      artMap: overrides,
      message: savedToGithub
        ? "Đã lưu ảnh và commit thành công lên GitHub Repository!"
        : "Đã lưu ảnh thành công vào gameArtMap trên Server!"
    });
  } catch (err: any) {
    console.error("[Save Game Art Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to save game art" });
  }
});

// GET Server Art Map
app.get("/api/get-server-art-map", (req, res) => {
  try {
    const overrides = getArtMapOverrides();
    return res.json({ success: true, artMap: overrides });
  } catch (err: any) {
    return res.json({ success: true, artMap: {} });
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

// System metadata helpers for Auto-Generated Game Cards
function getSystemMeta(systemCode: string = 'snes') {
  const code = systemCode.toLowerCase();
  switch (code) {
    case 'nes':
      return {
        systemName: 'NES / Điện Tử 4 Nút',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        genres: ['NES 8-Bit', 'Retro', 'Kinh Điển']
      };
    case 'gba':
      return {
        systemName: 'Game Boy Advance (GBA)',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        genres: ['GBA 32-Bit', 'Retro', 'Cầm Tay']
      };
    case 'gbc':
    case 'gb':
      return {
        systemName: 'Game Boy Color (GBC)',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        genres: ['Game Boy', 'Retro', 'Kinh Điển']
      };
    case 'n64':
      return {
        systemName: 'Nintendo 64 (N64)',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
        genres: ['N64 64-Bit', '3D Retro', 'Nintendo']
      };
    case 'nds':
      return {
        systemName: 'Nintendo DS (NDS)',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
        genres: ['Nintendo DS', '2 Màn Hình', 'Cầm Tay']
      };
    case 'segamd':
    case 'sega':
    case 'md':
      return {
        systemName: 'Sega Genesis / Mega Drive',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        genres: ['Sega 16-Bit', 'Retro', 'Huyền Thoại']
      };
    case 'psx':
    case 'ps1':
      return {
        systemName: 'Sony PlayStation 1 (PS1)',
        platform: 'PS1' as const,
        cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
        genres: ['PS1 32-Bit', 'Sony', 'Kinh Điển']
      };
    case 'snes':
    default:
      return {
        systemName: 'Super Nintendo (SNES)',
        platform: 'Other' as const,
        cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
        genres: ['SNES 16-Bit', 'Retro', 'Quán Game Xóm']
      };
  }
}

// 4. Vercel Blob Storage Admin Routes for direct public ROM storage & Metadata Library

// Public API to get Admin Uploaded Games Library
app.get("/api/games/admin-library", async (req, res) => {
  try {
    const includeHidden = req.query.includeHidden === 'true';
    const allGames = await readGamesLibrary();
    const result = includeHidden ? allGames : allGames.filter(g => !g.isHidden);
    
    // Send standard cache control headers (no-cache for always-fresh metadata)
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.json({
      success: true,
      count: result.length,
      games: result
    });
  } catch (err: any) {
    console.error("[Admin Library API Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to load admin library" });
  }
});

// Upload ROM file directly to Vercel Blob & Auto Register in Games Library
app.post("/api/admin/blob/upload", async (req, res) => {
  try {
    const { filename, fileData, contentType, title, system, coverArt } = req.body;
    if (!filename || !fileData) {
      return res.status(400).json({ 
        success: false, 
        error: "Thiếu tên file (filename) hoặc nội dung tệp (fileData)!" 
      });
    }

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      return res.status(400).json({
        success: false,
        error: "Chưa cấu hình biến môi trường BLOB_READ_WRITE_TOKEN trên Vercel/Server!",
        hint: "Vui lòng cấu hình BLOB_READ_WRITE_TOKEN trong Settings / Environment Variables trên Vercel."
      });
    }

    // Convert base64 data to Buffer
    let buffer: Buffer;
    if (fileData.startsWith("data:")) {
      const base64Data = fileData.split(",")[1];
      buffer = Buffer.from(base64Data, "base64");
    } else {
      buffer = Buffer.from(fileData, "base64");
    }

    // Sanitize filename and organize under roms/
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobPath = `roms/${cleanFilename}`;

    let blobResult;
    try {
      blobResult = await put(blobPath, buffer, {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        contentType: contentType || "application/octet-stream"
      });
      console.log(`[Vercel Blob] Uploaded ROM successfully: ${blobResult.url} (${buffer.length} bytes)`);
    } catch (uploadErr: any) {
      console.error("[Vercel Blob Upload Error]:", uploadErr);
      return res.status(500).json({
        success: false,
        error: `Lỗi khi tải file ROM lên Vercel Blob Storage: ${uploadErr.message || uploadErr}`
      });
    }

    // Prepare Game Card details
    const selectedSystem = (system || 'snes').toLowerCase();
    const systemMeta = getSystemMeta(selectedSystem);
    
    // Auto-generate title from filename if not explicitly provided
    const displayTitle = (title && title.trim().length > 0)
      ? title.trim()
      : filename.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ').trim();

    const formattedSize = buffer.length < 1024 * 1024 
      ? `${(buffer.length / 1024).toFixed(1)} KB`
      : `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`;

    const uniqueId = `blob-rom-${Date.now()}-${displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    const newGameCard = {
      id: uniqueId,
      title: displayTitle,
      subtitle: `${systemMeta.systemName} • Vercel Blob Cloud ROM`,
      system: selectedSystem,
      systemName: systemMeta.systemName,
      romUrl: blobResult.url,
      coverArt: coverArt || systemMeta.cover,
      backdropArt: systemMeta.backdrop,
      platforms: [systemMeta.platform],
      language: "Gốc / Tiếng Anh ⭐",
      hasVietHoa: false,
      releaseYear: new Date().getFullYear(),
      fileSize: formattedSize,
      rating: 5.0,
      genres: [systemMeta.systemName, "Retro", "Quán Game Xóm"],
      description: `${displayTitle} — Game ${systemMeta.systemName} được lưu trữ trực tiếp trên Vercel Blob Storage tốc độ cao, chơi mượt mà trên trình giả lập EmulatorJS của Quán Game Xóm.`,
      downloadUrl: blobResult.url,
      emulatorCore: selectedSystem,
      isFeatured: true,
      isPopular: true,
      isNewUpdate: true,
      addedDate: new Date().toISOString().split('T')[0],
      isHidden: false
    };

    // Save metadata using dedicated storage helper (Cloud-first persistence on Vercel Blob)
    try {
      await addGameToLibrary(newGameCard);
    } catch (metaErr: any) {
      console.error("[Vercel Blob Metadata Save Error]:", metaErr);
      return res.status(500).json({
        success: false,
        error: `ROM uploaded but metadata save failed: ${metaErr.message || metaErr}`,
        romUrl: blobResult.url,
        hint: "File ROM đã tải lên thành công nhưng không thể ghi metadata vào Vercel Blob. Vui lòng thử lại hoặc kiểm tra quyền ghi của BLOB_READ_WRITE_TOKEN."
      });
    }

    return res.json({
      success: true,
      url: blobResult.url,
      pathname: blobResult.pathname,
      contentType: blobResult.contentType,
      size: buffer.length,
      game: newGameCard,
      message: `Tải file ROM "${displayTitle}" lên Vercel Blob và tạo thẻ game thành công!`
    });
  } catch (err: any) {
    console.error("[Vercel Blob Handler Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Lỗi xử lý upload ROM."
    });
  }
});

// Toggle Game Visibility in Library (Admin)
app.post("/api/admin/games/toggle-visibility", async (req, res) => {
  try {
    const { id, isHidden } = req.body;
    if (!id) {
      return res.status(400).json({ success: false, error: "Thiếu ID game cần chuyển trạng thái." });
    }

    const currentLibrary = await readGamesLibrary();
    const game = currentLibrary.find(g => g.id === id || g.romUrl === id);
    if (!game) {
      return res.status(404).json({ success: false, error: "Không tìm thấy game trong danh sách metadata." });
    }

    const nextHiddenState = typeof isHidden === 'boolean' ? isHidden : !game.isHidden;
    const updatedGame = await updateGameInLibrary(game.id, { isHidden: nextHiddenState });

    return res.json({
      success: true,
      id: game.id,
      isHidden: updatedGame?.isHidden ?? nextHiddenState,
      message: nextHiddenState ? "Đã ẩn game khỏi Thư Viện Công Khai." : "Đã hiện game lên Thư Viện Công Khai."
    });
  } catch (err: any) {
    console.error("[Toggle Visibility Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Lỗi khi cập nhật trạng thái hiển thị." });
  }
});

// List all uploaded ROMs in Vercel Blob + their metadata status
app.get("/api/admin/blob/list", async (req, res) => {
  try {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const library = await readGamesLibrary();

    if (!blobToken) {
      return res.json({
        success: true,
        hasToken: false,
        blobs: [],
        library,
        message: "Chưa cấu hình biến môi trường BLOB_READ_WRITE_TOKEN."
      });
    }

    const { blobs } = await list({
      token: blobToken,
      prefix: "roms/"
    });

    return res.json({
      success: true,
      hasToken: true,
      count: blobs.length,
      library,
      blobs: blobs.map(b => {
        const matchedMeta = library.find(g => g.romUrl === b.url || b.pathname.includes(g.id));
        return {
          url: b.url,
          pathname: b.pathname,
          size: b.size,
          uploadedAt: b.uploadedAt,
          title: matchedMeta?.title,
          system: matchedMeta?.system,
          systemName: matchedMeta?.systemName,
          id: matchedMeta?.id,
          isHidden: matchedMeta?.isHidden ?? false
        };
      })
    });
  } catch (err: any) {
    console.error("[Vercel Blob List Error]:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Lỗi khi lấy danh sách ROM từ Vercel Blob."
    });
  }
});

// Delete a ROM from Vercel Blob and remove from games-library.json
app.delete("/api/admin/blob/delete", async (req, res) => {
  try {
    const { url, id } = req.body;
    if (!url && !id) {
      return res.status(400).json({ success: false, error: "Thiếu tham số 'url' hoặc 'id' cần xóa." });
    }

    // 1. Delete from persistent games-library.json
    await removeGameFromLibrary(id || url);

    // 2. Delete ROM file from Vercel Blob if url provided
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken && url) {
      try {
        await del(url, { token: blobToken });
      } catch (delErr) {
        console.warn("[Vercel Blob Del File Warning]:", delErr);
      }
    }

    return res.json({ success: true, message: "Đã xóa game khỏi Thư viện và Vercel Blob Storage." });
  } catch (err: any) {
    console.error("[Vercel Blob Delete Error]:", err);
    return res.status(500).json({ success: false, error: err.message || "Lỗi khi xóa file từ Vercel Blob." });
  }
});

// 5. SNES Google Sheet games endpoint (Merged with Vercel Blob SNES Games)
app.get("/api/snes-games", async (req, res) => {
  const defaultTestGames = [
    {
      id: "snes-aladdin",
      title: "Aladdin",
      subtitle: "Disney's Aladdin • Super Nintendo (SNES) 16-Bit",
      coverArt: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
      backdropArt: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
      platforms: ["Other"],
      language: "Tiếng Anh ⭐",
      hasVietHoa: false,
      releaseYear: 1993,
      fileSize: "1.3 MB",
      rating: 4.9,
      genres: ["SNES", "Hành Động", "Kinh Điển"],
      description: "Hóa thân thành Aladdin cùng chú khỉ Abu trong chuyến phiêu lưu kinh điển qua vương quốc Agrabah trên hệ máy Super Nintendo 16-bit mượt mà.",
      romUrl: "https://archive.org/download/snes-romset-ultra/Aladdin%20%28USA%29.sfc",
      downloadUrl: "https://archive.org/download/snes-romset-ultra/Aladdin%20%28USA%29.sfc",
      emulatorCore: "snes",
      isFeatured: true,
      isPopular: true,
      isNewUpdate: true,
      addedDate: "2026-08-15"
    },
    {
      id: "snes-biker-mice",
      title: "Biker Mice from Mars",
      subtitle: "Đua xe bắn súng chuột không gian • Konami SNES",
      coverArt: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop",
      backdropArt: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop",
      platforms: ["Other"],
      language: "Tiếng Anh ⭐",
      hasVietHoa: false,
      releaseYear: 1994,
      fileSize: "1.0 MB",
      rating: 4.95,
      genres: ["SNES", "Đua Xe", "Bắn Súng"],
      description: "Game đua xe mô tô chiến đấu huyền thoại của Konami trên SNES với 3 chú chuột chiến binh Throttle, Modo và Vinnie cùng kho vũ khí tối tân.",
      romUrl: "https://archive.org/download/snes-romset-ultra/Biker%20Mice%20from%20Mars%20%28USA%29.sfc",
      downloadUrl: "https://archive.org/download/snes-romset-ultra/Biker%20Mice%20from%20Mars%20%28USA%29.sfc",
      emulatorCore: "snes",
      isFeatured: true,
      isPopular: true,
      isNewUpdate: true,
      addedDate: "2026-08-15"
    }
  ];

  try {
    // Load admin blob games for SNES (or retro)
    const adminGames = await readGamesLibrary();
    const activeAdminGames = adminGames.filter(g => !g.isHidden && (g.emulatorCore === 'snes' || g.system === 'snes' || !g.emulatorCore));

    const sheetId = (req.query.sheetId as string) || "103Kz3v0fGN30BIhlaKMQ2IJNJ82GPif92OSgt_LtyG0";
    console.log(`[SNES API] Fetching games from Google Sheet ID: ${sheetId}`);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    const response = await fetch(csvUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    let sheetGames: any[] = [];
    if (response.ok) {
      const csvText = await response.text();
      if (csvText && !csvText.includes("<!DOCTYPE html>") && !csvText.includes("accounts.google.com") && !csvText.includes("document-root")) {
        const rows = csvText.split(/\r?\n/).map(line => line.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
        if (rows.length > 1) {
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue;
            const title = row[1] || row[0];
            const platform = row[2] || "SNES";
            const shareUrl = row[3] || "";
            const romUrl = row[4] || "";

            if (title && romUrl) {
              sheetGames.push({
                id: `snes-sheet-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
                title: title,
                subtitle: `${platform} • Quán Game Xóm Cloud ROM`,
                coverArt: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop",
                platforms: ["Other"],
                language: "Tiếng Anh ⭐",
                hasVietHoa: false,
                releaseYear: 1994,
                fileSize: "SNES ROM",
                rating: 4.9,
                genres: ["SNES", "Kinh Điển"],
                description: `${title} — Game SNES chuẩn được nạp trực tiếp qua Google Sheet của Quán Game Xóm.`,
                downloadUrl: shareUrl || romUrl,
                romUrl: romUrl,
                emulatorCore: "snes",
                isFeatured: true,
                isPopular: true,
                isNewUpdate: true,
                addedDate: "2026-08-15"
              });
            }
          }
        }
      }
    }

    const baseList = sheetGames.length > 0 ? sheetGames : defaultTestGames;
    // Prepend active admin-uploaded SNES games (deduplicated by romUrl/id)
    const existingUrls = new Set(baseList.map(g => g.romUrl));
    const newFromAdmin = activeAdminGames.filter(g => !existingUrls.has(g.romUrl));
    const combinedGames = [...newFromAdmin, ...baseList];

    return res.json({
      success: true,
      sheetId,
      source: "merged-sheet-and-blob",
      count: combinedGames.length,
      games: combinedGames
    });
  } catch (err: any) {
    console.warn("[SNES Sheet Fetch Warning]:", err);
    return res.json({
      success: true,
      sheetId: "103Kz3v0fGN30BIhlaKMQ2IJNJ82GPif92OSgt_LtyG0",
      source: "verified-test-games",
      count: defaultTestGames.length,
      games: defaultTestGames
    });
  }
});

// 6. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global Express Error Handler for structured JSON responses
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Express Error Handler]:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    success: false,
    stage: "server_unhandled_error",
    error: err.message || "Internal server error"
  });
});

export { app };
export default app;

async function startServer() {
  if (process.env.VERCEL) {
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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

if (!process.env.VERCEL) {
  startServer();
}

