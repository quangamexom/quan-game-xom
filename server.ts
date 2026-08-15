import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import googleSheetBackup from "./src/data/googleSheetGames.json";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// 4. ROM Proxy Route for EmulatorJS (Streams romUrl and prevents CORS issues with Google Drive)
app.get("/api/rom-proxy", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl || typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
      console.warn("[ROM Proxy] Bad Request: Missing 'url' parameter");
      return res.status(400).json({ 
        success: false, 
        error: "Thiếu tham số 'url' của file ROM." 
      });
    }

    let targetUrl = decodeURIComponent(rawUrl.trim());
    console.log(`[ROM Proxy] Received request for ROM URL: "${targetUrl}"`);

    let fileId = "";
    const isGoogleDrive = targetUrl.includes("drive.google.com") || 
                          targetUrl.includes("docs.google.com") || 
                          targetUrl.includes("drive.usercontent.google.com");

    if (isGoogleDrive) {
      const fileMatch = targetUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const idMatch = targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      } else if (idMatch) {
        fileId = idMatch[1];
      }
      console.log(`[ROM Proxy] Detected Google Drive File ID: "${fileId || 'None'}"`);
    }

    // List of candidate URLs to fetch from (for Google Drive, test direct download endpoints)
    const candidateUrls: string[] = [];
    if (fileId) {
      candidateUrls.push(`https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`);
      candidateUrls.push(`https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`);
      candidateUrls.push(`https://docs.google.com/uc?export=download&id=${fileId}&confirm=t`);
    }
    candidateUrls.push(targetUrl);

    let finalBuffer: Buffer | null = null;
    let finalContentType = "application/octet-stream";
    let lastStatus = 500;
    let lastErrorDetails = "";
    let isPermissionError = false;

    // Helper to fetch with full redirect following and cookie extraction
    for (const urlToTry of candidateUrls) {
      console.log(`[ROM Proxy] Attempting fetch from: ${urlToTry}`);
      try {
        let cookieHeader = "";
        let response = await fetch(urlToTry, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9,vi;q=0.8"
          },
          redirect: "follow"
        });

        lastStatus = response.status;
        const contentType = response.headers.get("content-type") || "";
        const contentLength = response.headers.get("content-length") || "unknown";

        // Capture Set-Cookie if any for confirmation redirects
        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          cookieHeader = setCookie.split(";")[0];
        }

        console.log(`[ROM Proxy] -> Response Status: ${response.status}, Content-Type: "${contentType}", Content-Length: ${contentLength}`);

        if (!response.ok) {
          console.warn(`[ROM Proxy] Fetch returned non-OK status: ${response.status}`);
          lastErrorDetails = `Server từ chối kết nối (Mã HTTP: ${response.status}).`;
          if (response.status === 403 || response.status === 401) {
            isPermissionError = true;
          }
          continue;
        }

        // If response is HTML, Google Drive might be returning a confirmation page or login page
        if (contentType.includes("text/html")) {
          const htmlText = await response.text();
          console.log(`[ROM Proxy] Received HTML (${htmlText.length} bytes). Checking page contents...`);

          // 1. Check if permission is denied / required login
          const lowerHtml = htmlText.toLowerCase();
          if (
            lowerHtml.includes("servicelogin") ||
            lowerHtml.includes("accounts.google.com") ||
            lowerHtml.includes("you need access") ||
            lowerHtml.includes("yêu cầu quyền truy cập") ||
            lowerHtml.includes("không có quyền truy cập") ||
            lowerHtml.includes("access denied") ||
            lowerHtml.includes("request access")
          ) {
            console.warn("[ROM Proxy] Permission Denied: Google Drive file requires login or is not shared publicly.");
            isPermissionError = true;
            lastErrorDetails = "File Google Drive chưa được mở quyền chia sẻ công khai ('Anyone with the link' / 'Bất kỳ ai có liên kết').";
            break;
          }

          // 2. Check for virus scan confirmation form or link
          const downloadLinkMatch = htmlText.match(/href="(\/uc\?export=download[^"]+)"/) ||
                                    htmlText.match(/id="uc-download-link"[^>]+href="([^"]+)"/) ||
                                    htmlText.match(/action="([^"]+download[^"]*)"/);

          const confirmTokenMatch = htmlText.match(/name="confirm" value="([^"]+)"/);

          if (downloadLinkMatch || confirmTokenMatch) {
            let confirmUrl = "";
            if (downloadLinkMatch) {
              confirmUrl = downloadLinkMatch[1];
              if (confirmUrl.startsWith("/")) {
                confirmUrl = `https://drive.google.com${confirmUrl}`;
              }
            } else if (confirmTokenMatch && fileId) {
              confirmUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=${confirmTokenMatch[1]}`;
            }

            if (confirmUrl) {
              console.log(`[ROM Proxy] Following Google Drive confirmation link: ${confirmUrl}`);
              const confirmRes = await fetch(confirmUrl, {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                  "Accept": "*/*",
                  ...(cookieHeader ? { "Cookie": cookieHeader } : {})
                },
                redirect: "follow"
              });

              const confirmCt = confirmRes.headers.get("content-type") || "";
              console.log(`[ROM Proxy] -> Confirmation Response Status: ${confirmRes.status}, Content-Type: "${confirmCt}"`);

              if (confirmRes.ok && !confirmCt.includes("text/html")) {
                finalBuffer = Buffer.from(await confirmRes.arrayBuffer());
                finalContentType = confirmCt || "application/octet-stream";
                break;
              }
            }
          }

          lastErrorDetails = "Google Drive trả về trang HTML thay vì dữ liệu tệp ROM nhị phân.";
          continue;
        }

        // Successfully got binary content!
        const arrayBuf = await response.arrayBuffer();
        finalBuffer = Buffer.from(arrayBuf);
        finalContentType = contentType || "application/octet-stream";
        console.log(`[ROM Proxy] Successfully downloaded ROM binary (${finalBuffer.length} bytes)`);
        break;
      } catch (tryErr: any) {
        console.error(`[ROM Proxy] Error attempting ${urlToTry}:`, tryErr.message || tryErr);
        lastErrorDetails = tryErr.message || "Lỗi kết nối khi tải ROM";
      }
    }

    if (finalBuffer && finalBuffer.length > 0) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS, HEAD");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.setHeader("Content-Type", finalContentType);
      res.setHeader("Content-Length", finalBuffer.length);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(finalBuffer);
    }

    // If we reach here, we could not fetch the binary ROM
    if (isPermissionError) {
      return res.status(403).json({
        success: false,
        error: "File Google Drive chưa được mở quyền chia sẻ công khai ('Anyone with the link' / 'Bất kỳ ai có liên kết').",
        details: "Trang Google Drive yêu cầu đăng nhập hoặc yêu cầu cấp quyền truy cập để tải file.",
        driveFileId: fileId || undefined,
        originalUrl: rawUrl,
        statusCode: lastStatus,
        hint: "Để khắc phục: Mở Google Drive -> Nhấp chuột phải vào file ROM -> Chọn Chia sẻ (Share) -> Chuyển thành 'Bất kỳ ai có đường liên kết' (Anyone with the link)."
      });
    }

    return res.status(422).json({
      success: false,
      error: "Không thể tải file ROM từ Google Drive.",
      details: lastErrorDetails || `Google Drive trả về mã HTTP ${lastStatus} hoặc trang HTML thay vì tệp nhị phân.`,
      driveFileId: fileId || undefined,
      originalUrl: rawUrl,
      statusCode: lastStatus,
      hint: "Vui lòng kiểm tra lại liên kết file hoặc chắc chắn file ở chế độ chia sẻ công khai."
    });
  } catch (err: any) {
    console.error("[ROM Proxy Unhandled Exception]:", err);
    return res.status(500).json({
      success: false,
      error: "Lỗi hệ thống khi proxy tải ROM từ Google Drive.",
      details: err.message || "Internal Proxy Server Error"
    });
  }
});

// 5. SNES Google Sheet games endpoint with fallback
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
      romUrl: "https://drive.google.com/uc?export=download&id=1QGgmop-JEIKZ6kyV2HcHjHugdzb88Q7f",
      downloadUrl: "https://drive.google.com/file/d/1QGgmop-JEIKZ6kyV2HcHjHugdzb88Q7f/view?usp=sharing",
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
      romUrl: "https://drive.google.com/uc?export=download&id=1i9fsfy5lM-eKcQIh1raZpx7etQlGd-Mt",
      downloadUrl: "https://drive.google.com/file/d/1i9fsfy5lM-eKcQIh1raZpx7etQlGd-Mt/view?usp=sharing",
      emulatorCore: "snes",
      isFeatured: true,
      isPopular: true,
      isNewUpdate: true,
      addedDate: "2026-08-15"
    }
  ];

  try {
    const sheetId = (req.query.sheetId as string) || "103Kz3v0fGN30BIhlaKMQ2IJNJ82GPif92OSgt_LtyG0";
    console.log(`[SNES API] Fetching games from Google Sheet ID: ${sheetId}`);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    const response = await fetch(csvUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    if (response.ok) {
      const csvText = await response.text();
      // If it's valid CSV text and not Google login html
      if (csvText && !csvText.includes("<!DOCTYPE html>") && !csvText.includes("accounts.google.com") && !csvText.includes("document-root")) {
        const rows = csvText.split(/\r?\n/).map(line => line.split(',').map(cell => cell.replace(/^"(.*)"$/, '$1').trim()));
        if (rows.length > 1) {
          const snesGames: any[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue;
            const title = row[1] || row[0];
            const platform = row[2] || "SNES";
            const shareUrl = row[3] || "";
            const romUrl = row[4] || "";

            if (title && romUrl) {
              snesGames.push({
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
                description: `${title} — Game SNES chuẩn được nạp trực tiếp qua Google Sheet và Server Proxy của Quán Game Xóm.`,
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

          if (snesGames.length > 0) {
            console.log(`[SNES API] Successfully loaded ${snesGames.length} games directly from Google Sheet ID: ${sheetId}`);
            return res.json({
              success: true,
              sheetId,
              source: "google-sheet",
              count: snesGames.length,
              games: snesGames
            });
          }
        }
      } else {
        console.warn(`[SNES API] Google Sheet ID ${sheetId} returned HTML/Login page (Sheet might be private or requires permission). Using verified fallback with real Google Drive IDs.`);
      }
    }
  } catch (err: any) {
    console.warn("[SNES Sheet Fetch Warning]:", err);
  }

  console.log(`[SNES API] Serving verified SNES Games: Aladdin (1QGgmop-JEIKZ6kyV2HcHjHugdzb88Q7f), Biker Mice from Mars (1i9fsfy5lM-eKcQIh1raZpx7etQlGd-Mt)`);
  return res.json({
    success: true,
    sheetId: "103Kz3v0fGN30BIhlaKMQ2IJNJ82GPif92OSgt_LtyG0",
    source: "verified-test-games",
    count: defaultTestGames.length,
    games: defaultTestGames
  });
});

// 6. Health check
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
