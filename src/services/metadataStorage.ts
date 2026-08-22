import { put, list, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

export interface PersistentGameCard {
  id: string;
  title: string;
  subtitle?: string;
  system: string;
  systemName?: string;
  romUrl: string;
  coverArt?: string;
  backdropArt?: string;
  platforms?: string[];
  language?: string;
  hasVietHoa?: boolean;
  releaseYear?: number;
  fileSize?: string;
  rating?: number;
  genres?: string[];
  description?: string;
  downloadUrl?: string;
  emulatorCore?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNewUpdate?: boolean;
  addedDate?: string;
  isHidden?: boolean;
}

const METADATA_PATHNAME = "roms-metadata/games-library.json";

/**
 * Server-side metadata storage helper.
 * Reads and writes game metadata persistently to Vercel Blob,
 * with graceful local filesystem fallbacks when running in local dev environments.
 */

export async function readGamesLibrary(): Promise<PersistentGameCard[]> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  let localDefaults: PersistentGameCard[] = [];

  // Read local defaults from public/assets/games-library.json
  try {
    const publicPath = path.join(process.cwd(), "public", "assets", "games-library.json");
    if (fs.existsSync(publicPath)) {
      const content = fs.readFileSync(publicPath, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) localDefaults = parsed;
    }
  } catch (diskErr) {
    console.warn("[Local Disk Storage Helper Read Warning]:", diskErr);
  }

  // 1. Try reading directly from Vercel Blob (Primary Cloud Persistence)
  if (blobToken) {
    try {
      const { blobs } = await list({ token: blobToken, prefix: "roms-metadata/" });
      const metadataBlob = blobs.find(b => b.pathname.includes("games-library.json"));
      if (metadataBlob) {
        // Fetch latest version bypassing edge/proxy cache
        const res = await fetch(`${metadataBlob.url}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (res.ok) {
          const listData = await res.json();
          if (Array.isArray(listData) && listData.length > 0) {
            // Merge remote with local defaults by romUrl/id
            const existingUrls = new Set(listData.map(g => g.romUrl || g.id));
            const missingFromRemote = localDefaults.filter(g => !existingUrls.has(g.romUrl) && !existingUrls.has(g.id));
            return [...listData, ...missingFromRemote];
          }
        }
      }
    } catch (blobErr) {
      console.warn("[Vercel Blob Storage Helper Read Error]:", blobErr);
    }
  }

  return localDefaults;
}

export async function writeGamesLibrary(games: PersistentGameCard[]): Promise<boolean> {
  const jsonContent = JSON.stringify(games, null, 2);
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  let writeSuccess = false;

  // 1. Always attempt saving to Vercel Blob Storage first if token exists
  if (blobToken) {
    try {
      await put(METADATA_PATHNAME, Buffer.from(jsonContent), {
        access: "public",
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json"
      });
      console.log(`[Storage Helper] Successfully saved ${games.length} games to Vercel Blob (${METADATA_PATHNAME})`);
      writeSuccess = true;
    } catch (blobErr) {
      console.error("[Storage Helper] Error writing metadata to Vercel Blob:", blobErr);
      throw new Error(`Failed to write game metadata to Vercel Blob: ${(blobErr as Error).message}`);
    }
  }

  // 2. Also write to local disk (safely ignored if filesystem is read-only like on Vercel Serverless)
  try {
    const publicAssetsDir = path.join(process.cwd(), "public", "assets");
    const srcDataDir = path.join(process.cwd(), "src", "data");
    if (!fs.existsSync(publicAssetsDir)) fs.mkdirSync(publicAssetsDir, { recursive: true });
    if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });

    fs.writeFileSync(path.join(publicAssetsDir, "games-library.json"), jsonContent, "utf-8");
    fs.writeFileSync(path.join(srcDataDir, "adminGamesLibrary.json"), jsonContent, "utf-8");
    if (!blobToken) {
      writeSuccess = true; // In local dev without blob token, disk save is considered success
    }
  } catch (fsErr) {
    // Read-only filesystem is expected on Vercel Lambda
    if (!blobToken) {
      console.warn("[Storage Helper] Disk write warning (ephemeral/read-only filesystem):", fsErr);
    }
  }

  return writeSuccess;
}

export async function addGameToLibrary(game: PersistentGameCard): Promise<PersistentGameCard[]> {
  const currentLibrary = await readGamesLibrary();
  // Filter out any duplicate by ID or ROM URL
  const updated = currentLibrary.filter(g => g.id !== game.id && g.romUrl !== game.romUrl);
  // Prepend newest game
  updated.unshift(game);
  await writeGamesLibrary(updated);
  return updated;
}

export async function updateGameInLibrary(id: string, updates: Partial<PersistentGameCard>): Promise<PersistentGameCard | null> {
  const currentLibrary = await readGamesLibrary();
  const gameIndex = currentLibrary.findIndex(g => g.id === id || g.romUrl === id);
  if (gameIndex === -1) return null;

  currentLibrary[gameIndex] = {
    ...currentLibrary[gameIndex],
    ...updates
  };

  await writeGamesLibrary(currentLibrary);
  return currentLibrary[gameIndex];
}

export async function removeGameFromLibrary(idOrUrl: string): Promise<PersistentGameCard[]> {
  const currentLibrary = await readGamesLibrary();
  const updated = currentLibrary.filter(g => g.id !== idOrUrl && g.romUrl !== idOrUrl);
  await writeGamesLibrary(updated);
  return updated;
}
