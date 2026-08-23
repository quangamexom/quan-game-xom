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

export async function uploadImageToBlob(
  pathname: string, 
  buffer: Buffer, 
  contentType: string = "image/png"
): Promise<string | null> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) return null;
  try {
    const blob = await put(pathname, buffer, {
      access: "public",
      token: blobToken,
      addRandomSuffix: true,
      contentType
    });
    console.log(`[Storage Helper] Successfully uploaded image to Vercel Blob: ${blob.url}`);
    return blob.url;
  } catch (err) {
    console.warn(`[Storage Helper] Failed to upload image to Vercel Blob (${pathname}):`, err);
    return null;
  }
}

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

export interface SyncBlobsResult {
  success: boolean;
  hasToken: boolean;
  totalBlobs: number;
  totalGames: number;
  newGamesAdded: number;
  syncedGames: PersistentGameCard[];
  message: string;
}

const EXT_SYSTEM_MAP: Record<string, { system: string; systemName: string; platform: string; cover: string; backdrop: string; genres: string[] }> = {
  '.sfc': {
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['SNES 16-Bit', 'Retro', 'Quán Game Xóm']
  },
  '.smc': {
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['SNES 16-Bit', 'Retro', 'Quán Game Xóm']
  },
  '.snes': {
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['SNES 16-Bit', 'Retro', 'Quán Game Xóm']
  },
  '.nes': {
    system: 'nes',
    systemName: 'NES / Điện Tử 4 Nút',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['NES 8-Bit', 'Retro', 'Kinh Điển']
  },
  '.gba': {
    system: 'gba',
    systemName: 'Game Boy Advance (GBA)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    genres: ['GBA 32-Bit', 'Retro', 'Cầm Tay']
  },
  '.gbc': {
    system: 'gbc',
    systemName: 'Game Boy Color (GBC)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['Game Boy', 'Retro', 'Kinh Điển']
  },
  '.gb': {
    system: 'gb',
    systemName: 'Game Boy (GB)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['Game Boy 8-Bit', 'Retro', 'Nintendo']
  },
  '.n64': {
    system: 'n64',
    systemName: 'Nintendo 64 (N64)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
    genres: ['N64 64-Bit', '3D Retro', 'Nintendo']
  },
  '.z64': {
    system: 'n64',
    systemName: 'Nintendo 64 (N64)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
    genres: ['N64 64-Bit', '3D Retro', 'Nintendo']
  },
  '.nds': {
    system: 'nds',
    systemName: 'Nintendo DS (NDS)',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    genres: ['Nintendo DS', '2 Màn Hình', 'Cầm Tay']
  },
  '.md': {
    system: 'segamd',
    systemName: 'Sega Genesis / Mega Drive',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['Sega 16-Bit', 'Retro', 'Huyền Thoại']
  },
  '.gen': {
    system: 'segamd',
    systemName: 'Sega Genesis / Mega Drive',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['Sega 16-Bit', 'Retro', 'Huyền Thoại']
  },
  '.iso': {
    system: 'psx',
    systemName: 'Sony PlayStation 1 (PS1)',
    platform: 'PS1',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
    genres: ['PS1 32-Bit', 'Sony', 'Kinh Điển']
  },
  '.chd': {
    system: 'psx',
    systemName: 'Sony PlayStation 1 (PS1)',
    platform: 'PS1',
    cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
    genres: ['PS1 32-Bit', 'Sony', 'Kinh Điển']
  },
  '.zip': {
    system: 'snes',
    systemName: 'Super Nintendo / Arcade',
    platform: 'Other',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    genres: ['Retro', 'Quán Game Xóm', 'Arcade']
  }
};

/**
 * Scan all ROM blobs in Vercel Blob Storage and automatically register any new ROMs
 * into the persistent games library metadata.
 */
export async function syncAllBlobsToLibrary(): Promise<SyncBlobsResult> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  const currentLibrary = await readGamesLibrary();

  if (!blobToken) {
    return {
      success: true,
      hasToken: false,
      totalBlobs: 0,
      totalGames: currentLibrary.length,
      newGamesAdded: 0,
      syncedGames: currentLibrary,
      message: "Chưa cấu hình BLOB_READ_WRITE_TOKEN. Đang sử dụng danh sách game hiện hành."
    };
  }

  try {
    // 1. Fetch all blobs from Vercel Blob storage
    const { blobs } = await list({ token: blobToken });
    
    // 2. Filter for ROM files
    const romBlobs = blobs.filter(b => {
      const lower = b.pathname.toLowerCase();
      // Skip metadata or cover images
      if (lower.includes('roms-metadata') || lower.includes('covers/') || lower.includes('logo/')) return false;
      return Object.keys(EXT_SYSTEM_MAP).some(ext => lower.endsWith(ext));
    });

    let newGamesCount = 0;
    const updatedLibrary = [...currentLibrary];

    for (const blob of romBlobs) {
      const exists = updatedLibrary.some(
        g => g.romUrl === blob.url || 
             (g.downloadUrl && g.downloadUrl === blob.url) ||
             (blob.pathname && g.id && blob.pathname.includes(g.id))
      );

      if (!exists) {
        // Extract raw filename
        const rawFilename = blob.pathname.split('/').pop() || 'game.sfc';
        const ext = Object.keys(EXT_SYSTEM_MAP).find(e => rawFilename.toLowerCase().endsWith(e)) || '.sfc';
        const sysInfo = EXT_SYSTEM_MAP[ext] || EXT_SYSTEM_MAP['.sfc'];

        // Clean title
        const cleanTitle = rawFilename
          .replace(/\.[^/.]+$/, '') // remove extension
          .replace(/[\(\[\{].*?[\)\]\}]/g, ' ') // remove (USA), [!], etc.
          .replace(/[_.-]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() || 'Game Vercel Blob';

        const displayTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        const formattedSize = blob.size < 1024 * 1024
          ? `${(blob.size / 1024).toFixed(1)} KB`
          : `${(blob.size / (1024 * 1024)).toFixed(2)} MB`;

        const uniqueId = `blob-auto-${Date.now()}-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 6)}`;

        const newGameCard: PersistentGameCard = {
          id: uniqueId,
          title: displayTitle,
          subtitle: `${sysInfo.systemName} • Vercel Blob Cloud ROM`,
          system: sysInfo.system,
          systemName: sysInfo.systemName,
          romUrl: blob.url,
          coverArt: sysInfo.cover,
          backdropArt: sysInfo.backdrop,
          platforms: [sysInfo.platform],
          language: "Gốc / Tiếng Anh ⭐",
          hasVietHoa: false,
          releaseYear: new Date(blob.uploadedAt).getFullYear() || new Date().getFullYear(),
          fileSize: formattedSize,
          rating: 5.0,
          genres: sysInfo.genres,
          description: `${displayTitle} — Game ${sysInfo.systemName} được cập nhật từ Vercel Blob Storage tốc độ cao, chơi mượt mà trên trình giả lập EmulatorJS của Quán Game Xóm.`,
          downloadUrl: blob.url,
          emulatorCore: sysInfo.system,
          isFeatured: true,
          isPopular: true,
          isNewUpdate: true,
          addedDate: new Date(blob.uploadedAt).toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          isHidden: false
        };

        updatedLibrary.unshift(newGameCard);
        newGamesCount++;
      }
    }

    // 3. Save merged library if new games were discovered
    if (newGamesCount > 0) {
      await writeGamesLibrary(updatedLibrary);
    }

    return {
      success: true,
      hasToken: true,
      totalBlobs: blobs.length,
      totalGames: updatedLibrary.length,
      newGamesAdded: newGamesCount,
      syncedGames: updatedLibrary,
      message: newGamesCount > 0
        ? `Đã đồng bộ thành công! Tìm thấy và thêm ${newGamesCount} game mới từ Vercel Blob Storage.`
        : `Đã kiểm tra Vercel Blob: Thư viện game (${updatedLibrary.length} game) đã hoàn toàn đồng bộ và cập nhật mới nhất!`
    };
  } catch (err: any) {
    console.error("[Sync Blobs Error]:", err);
    return {
      success: false,
      hasToken: true,
      totalBlobs: 0,
      totalGames: currentLibrary.length,
      newGamesAdded: 0,
      syncedGames: currentLibrary,
      message: `Lỗi đồng bộ từ Vercel Blob: ${err.message || err}`
    };
  }
}
