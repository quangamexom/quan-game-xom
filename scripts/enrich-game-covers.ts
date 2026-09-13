import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { put } from '@vercel/blob';

dotenv.config();

// RAWG Configuration
const RAWG_API_KEY = '290390ff53654730a48aa3e86f3ddf4f';
const RAWG_BASE_URL = 'https://api.rawg.io/api/games';

// Storage URLs & Paths
const BLOB_DATABASE_URL = 'https://qdextdpa7wktpocb.public.blob.vercel-storage.com/games-database.json';
const GAMES_DATABASE_BLOB_PATH = 'games-database.json';
const LEGACY_METADATA_PATH = 'roms-metadata/games-library.json';

const ROOT_DIR = process.cwd();
const PATHS = {
  publicLibrary: path.join(ROOT_DIR, 'public', 'assets', 'games-library.json'),
  adminLibrary: path.join(ROOT_DIR, 'src', 'data', 'adminGamesLibrary.json'),
  initialGames: path.join(ROOT_DIR, 'src', 'data', 'initialGames.json'),
  initialGamesTs: path.join(ROOT_DIR, 'src', 'data', 'initialGames.ts'),
  googleSheetJson: path.join(ROOT_DIR, 'src', 'data', 'googleSheetGames.json'),
  missingLog: path.join(ROOT_DIR, 'missing-images-log.json')
};

// Map system / platform names to RAWG platform IDs & slugs
const PLATFORM_MAP: Record<string, { id: number; name: string }> = {
  snes: { id: 79, name: 'SNES' },
  nes: { id: 49, name: 'NES' },
  gba: { id: 24, name: 'Game Boy Advance' },
  gbc: { id: 43, name: 'Game Boy Color' },
  gb: { id: 26, name: 'Game Boy' },
  n64: { id: 83, name: 'Nintendo 64' },
  nds: { id: 9, name: 'Nintendo DS' },
  segamd: { id: 167, name: 'Genesis' },
  genesis: { id: 167, name: 'Genesis' },
  psx: { id: 27, name: 'PlayStation' },
  ps1: { id: 27, name: 'PlayStation' },
  ps2: { id: 15, name: 'PlayStation 2' },
  pc: { id: 4, name: 'PC' }
};

export interface GameItem {
  id: string;
  title: string;
  subtitle?: string;
  system?: string;
  systemName?: string;
  romUrl?: string;
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

/**
 * Check if URL is considered a placeholder or empty
 */
export function isPlaceholderImage(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string' || url.trim().length === 0) return true;
  const l = url.toLowerCase();
  return (
    l.includes('unsplash.com') ||
    l.includes('placeholder') ||
    l.includes('dummyimage') ||
    l.includes('via.placeholder')
  );
}

/**
 * Known title aliases for retro titles with varied localization names
 */
const TITLE_ALIASES: Record<string, string> = {
  'der langrisser': 'Langrisser II',
  'mitsume ga tooru': 'Mitsume ga Tooru',
  'pokemon emerald version': 'Pokemon Emerald',
  'pokémon emerald version': 'Pokemon Emerald',
  'pokemon emerald': 'Pokemon Emerald',
  'pokémon emerald': 'Pokemon Emerald',
  'fire emblem: seisen no keifu': 'Fire Emblem: Genealogy of the Holy War',
  'fire emblem seisen no keifu': 'Fire Emblem: Genealogy of the Holy War'
};

/**
 * Clean raw title for higher search matching accuracy
 */
export function cleanTitle(raw: string): string {
  if (!raw) return '';
  let t = raw.trim();

  // Strip emojis & unicode symbols
  t = t.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

  // Strip file extensions
  t = t.replace(/\.(smc|sfc|nes|gba|gbc|gb|n64|z64|nds|md|gen|bin|iso|cue|chd|zip|7z|rar)$/i, '');

  // Strip bracketed content (e.g. "(USA)", "[!]", "(En,Ja)", "(Beta)")
  t = t.replace(/[\(\[\{].*?[\)\]\}]/g, ' ');

  // Strip custom store/mod branding tags
  t = t.replace(/—\s*QUÁN GAME XÓM.*$/i, '');
  t = t.replace(/QUÁN GAME XÓM EDITION/gi, '');
  t = t.replace(/Bản mod.*$/i, '');
  t = t.replace(/Việt Hóa.*$/i, '');
  t = t.replace(/Full HD.*$/i, '');

  // Normalize special characters to spaces
  t = t.replace(/[_.-]+/g, ' ');
  t = t.replace(/\s+/g, ' ');
  t = t.trim();

  const lower = t.toLowerCase();
  if (TITLE_ALIASES[lower]) {
    return TITLE_ALIASES[lower];
  }

  // Remove accents (e.g. Pokémon -> Pokemon)
  const normalized = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (TITLE_ALIASES[normalized.toLowerCase()]) {
    return TITLE_ALIASES[normalized.toLowerCase()];
  }

  return normalized;
}

/**
 * Find best matching game in RAWG response results
 */
function findBestMatch(results: any[], targetTitle: string, targetPlatformId?: number): any {
  if (!results || results.length === 0) return null;
  const targetLower = targetTitle.toLowerCase();
  const targetSlug = targetLower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // 1. Exact name match with matching platform
  if (targetPlatformId) {
    const exactNameWithPlatform = results.find(
      r => r.name?.toLowerCase() === targetLower &&
           r.platforms?.some((p: any) => p.platform?.id === targetPlatformId)
    );
    if (exactNameWithPlatform) return exactNameWithPlatform;
  }

  // 2. Exact name match
  const exactName = results.find(r => r.name?.toLowerCase() === targetLower);
  if (exactName) return exactName;

  // 3. Exact slug match
  const exactSlug = results.find(r => r.slug === targetSlug);
  if (exactSlug) return exactSlug;

  // 4. Name with targetPlatform
  if (targetPlatformId) {
    const withPlatform = results.find(r =>
      r.platforms?.some((p: any) => p.platform?.id === targetPlatformId)
    );
    if (withPlatform) return withPlatform;
  }

  // 5. Name starts with target
  const startsWith = results.find(r => r.name?.toLowerCase().startsWith(targetLower));
  if (startsWith) return startsWith;

  // 6. Name contains target
  const contains = results.find(r => r.name?.toLowerCase().includes(targetLower));
  if (contains) return contains;

  // 7. Fallback to top result
  return results[0];
}

/**
 * Fetch game art from RAWG with platform targeting and graceful fallback
 */
async function fetchRawgArt(title: string, system?: string, platforms?: string[]) {
  const cleaned = cleanTitle(title);
  if (!cleaned) return null;

  // Determine platform ID
  let platId: number | undefined;
  const sysKey = (system || '').toLowerCase();
  if (PLATFORM_MAP[sysKey]) {
    platId = PLATFORM_MAP[sysKey].id;
  } else if (Array.isArray(platforms) && platforms.length > 0) {
    for (const p of platforms) {
      const pKey = p.toLowerCase();
      if (PLATFORM_MAP[pKey]) {
        platId = PLATFORM_MAP[pKey].id;
        break;
      }
    }
  }

  // 1. Try search with platform filter first if available
  let results: any[] = [];
  if (platId) {
    try {
      const url = `${RAWG_BASE_URL}?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleaned)}&platforms=${platId}&page_size=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          // Verify if any result matches title
          const testMatch = findBestMatch(data.results, cleaned, platId);
          if (testMatch && (testMatch.name?.toLowerCase().includes(cleaned.toLowerCase()) || cleaned.toLowerCase().includes(testMatch.name?.toLowerCase()))) {
            results = data.results;
          }
        }
      }
    } catch (err) {
      // ignore
    }
  }

  // 2. Fallback to general search if platform search gave no matching results
  if (results.length === 0) {
    try {
      const url = `${RAWG_BASE_URL}?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleaned)}&page_size=5`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results)) {
          results = data.results;
        }
      }
    } catch (err) {
      // ignore
    }
  }

  if (results.length === 0) return null;

  const match = findBestMatch(results, cleaned, platId);
  if (!match) return null;

  const cover = match.background_image || match.short_screenshots?.[0]?.image || null;
  const backdrop = match.background_image_additional || match.background_image || null;

  return {
    matchedTitle: match.name,
    coverArt: cover,
    backdropArt: backdrop,
    rating: match.rating ? Math.round(match.rating * 20) : undefined,
    genres: match.genres ? match.genres.map((g: any) => g.name) : undefined
  };
}

/**
 * Main enrichment pipeline
 */
async function main() {
  console.log('================================================================');
  console.log('🎮 QUÁN GAME XÓM — TỰ ĐỘNG BỔ SUNG COVER & BANNER GAME (RAWG API)');
  console.log('================================================================\n');

  // Command-line options
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const tokenArg = args.find(a => a.startsWith('--token='))?.split('=')[1];
  const blobToken = tokenArg || process.env.BLOB_READ_WRITE_TOKEN;
  const delayMs = 450; // Rate-limiting delay between RAWG calls

  // 1. Load games database
  console.log('📥 1. Đang tải cơ sở dữ liệu game từ Vercel Blob Storage...');
  let games: GameItem[] = [];
  try {
    const res = await fetch(`${BLOB_DATABASE_URL}?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (res.ok) {
      games = await res.json();
      console.log(`   ✓ Tải thành công ${games.length} game từ Vercel Blob.`);
    }
  } catch (err) {
    console.warn('   ⚠️ Không thể kết nối trực tiếp Vercel Blob URL, thử đọc file local...');
  }

  if (games.length === 0 && fs.existsSync(PATHS.publicLibrary)) {
    games = JSON.parse(fs.readFileSync(PATHS.publicLibrary, 'utf-8'));
    console.log(`   ✓ Đọc thành công ${games.length} game từ local file.`);
  }

  if (games.length === 0) {
    console.error('❌ Không tìm thấy dữ liệu game để xử lý! Dừng script.');
    process.exit(1);
  }

  // 2. Backup original database to local before modifying
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `games-library-backup-${timestamp}.json`;
  const backupFilePath = path.join(ROOT_DIR, backupFileName);
  fs.writeFileSync(backupFilePath, JSON.stringify(games, null, 2), 'utf-8');
  console.log(`💾 2. Đã tạo bản sao lưu an toàn (backup): ${backupFileName}\n`);

  // 3. Filter games missing real cover art
  const gamesNeedingCover = games.filter(g => isPlaceholderImage(g.coverArt));
  console.log(`📊 3. Thống kê ban đầu:`);
  console.log(`   - Tổng số game trong kho:    ${games.length}`);
  console.log(`   - Số game ĐÃ CÓ ảnh thật:    ${games.length - gamesNeedingCover.length}`);
  console.log(`   - Số game CẦN BỔ SUNG ảnh:   ${gamesNeedingCover.length}\n`);

  if (isDryRun) {
    console.log('🔍 [DRY RUN] Chế độ chạy thử, hiển thị danh sách 15 game đầu tiên:');
    gamesNeedingCover.slice(0, 15).forEach((g, idx) => {
      console.log(`   ${idx + 1}. [${g.system || g.platforms?.[0] || 'Unknown'}] ${g.title}`);
    });
    console.log(`\n(Tổng cộng ${gamesNeedingCover.length} game). Để chạy thật, hãy bỏ cờ --dry-run.`);
    return;
  }

  // 4. Processing loop
  console.log(`🚀 4. Bắt đầu tìm kiếm và cập nhật ảnh từ RAWG API (delay: ${delayMs}ms/request)...`);
  console.log('----------------------------------------------------------------');

  let updatedCount = 0;
  let skippedOrNotFoundCount = 0;
  const missingLogList: Array<{ id: string; title: string; system?: string; reason: string }> = [];

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const needsCover = isPlaceholderImage(game.coverArt);
    const needsBackdrop = isPlaceholderImage(game.backdropArt);

    if (!needsCover && !needsBackdrop) {
      continue; // Game already has complete custom art
    }

    const progressStr = `[${updatedCount + skippedOrNotFoundCount + 1}/${gamesNeedingCover.length}]`;
    console.log(`${progressStr} Đang quét: "${game.title}" (${game.system || 'other'})...`);

    try {
      const artResult = await fetchRawgArt(game.title, game.system, game.platforms);

      if (artResult && (artResult.coverArt || artResult.backdropArt)) {
        if (needsCover && artResult.coverArt) {
          game.coverArt = artResult.coverArt;
        }
        if (needsBackdrop && artResult.backdropArt) {
          game.backdropArt = artResult.backdropArt;
        }
        console.log(`   ✅ CẬP NHẬT THÀNH CÔNG:`);
        console.log(`      • Khớp với: "${artResult.matchedTitle}"`);
        if (needsCover && artResult.coverArt) {
          console.log(`      • Cover:    ${artResult.coverArt.substring(0, 75)}...`);
        }
        if (needsBackdrop && artResult.backdropArt) {
          console.log(`      • Backdrop: ${artResult.backdropArt.substring(0, 75)}...`);
        }
        updatedCount++;
      } else {
        console.log(`   ⚠️ Không tìm thấy ảnh phù hợp trên RAWG. Giữ nguyên placeholder.`);
        skippedOrNotFoundCount++;
        missingLogList.push({
          id: game.id,
          title: game.title,
          system: game.system,
          reason: 'RAWG API returned no matching results'
        });
      }
    } catch (err: any) {
      console.warn(`   ❌ Lỗi khi xử lý game "${game.title}":`, err.message);
      skippedOrNotFoundCount++;
      missingLogList.push({
        id: game.id,
        title: game.title,
        system: game.system,
        reason: `Request error: ${err.message}`
      });
    }

    // Rate-limiting delay to prevent 429 Too Many Requests
    await new Promise(r => setTimeout(r, delayMs));
  }

  console.log('\n----------------------------------------------------------------');
  console.log('💾 5. Đang lưu cơ sở dữ liệu đã cập nhật...');

  const finalJson = JSON.stringify(games, null, 2);

  // Write to local project paths
  fs.writeFileSync(PATHS.publicLibrary, finalJson, 'utf-8');
  fs.writeFileSync(PATHS.adminLibrary, finalJson, 'utf-8');
  fs.writeFileSync(PATHS.initialGames, finalJson, 'utf-8');
  fs.writeFileSync(PATHS.googleSheetJson, finalJson, 'utf-8');

  const tsContent = `import { GameItem } from '../types';

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM/edit?gid=0#gid=0";
export const DEFAULT_SHEET_ID = "1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM";

export const INITIAL_GAMES: GameItem[] = ${finalJson};
`;
  fs.writeFileSync(PATHS.initialGamesTs, tsContent, 'utf-8');
  fs.writeFileSync(PATHS.missingLog, JSON.stringify(missingLogList, null, 2), 'utf-8');
  console.log(`   ✓ Đã cập nhật file public/assets/games-library.json`);
  console.log(`   ✓ Đã cập nhật file src/data/adminGamesLibrary.json`);
  console.log(`   ✓ Đã cập nhật file src/data/initialGames.json`);
  console.log(`   ✓ Đã cập nhật file src/data/googleSheetGames.json`);
  console.log(`   ✓ Đã cập nhật file src/data/initialGames.ts (Frontend React Dataset)`);
  console.log(`   ✓ Đã ghi log các game thiếu ảnh vào missing-images-log.json (${missingLogList.length} game)`);

  // Write to Vercel Blob if token is available
  if (blobToken) {
    try {
      console.log(`   ☁️ Đang đồng bộ đè lên Vercel Blob (${GAMES_DATABASE_BLOB_PATH})...`);
      const blobResult = await put(GAMES_DATABASE_BLOB_PATH, Buffer.from(finalJson), {
        access: 'public',
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      });
      console.log(`   ✓ Đồng bộ thành công lên Vercel Blob Cloud: ${blobResult.url}`);

      // Also update legacy path for compatibility
      await put(LEGACY_METADATA_PATH, Buffer.from(finalJson), {
        access: 'public',
        token: blobToken,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json'
      }).catch(() => {});
    } catch (blobErr: any) {
      console.error(`   ⚠️ Không thể ghi lên Vercel Blob:`, blobErr.message);
      console.log(`   👉 Bạn có thể đồng bộ sau bằng cách git push hoặc dùng nút Admin Sync trên web.`);
    }
  } else {
    console.log(`   ℹ️ Chưa phát hiện BLOB_READ_WRITE_TOKEN. File đã được lưu ở local sẵn sàng git commit & push!`);
  }

  // 6. Summary report
  console.log('\n================================================================');
  console.log('🎉 TỔNG KẾT KẾT QUẢ HOÀN THÀNH:');
  console.log(`   • Tổng số game trong thư viện:     ${games.length}`);
  console.log(`   • Số game ban đầu cần bổ sung ảnh: ${gamesNeedingCover.length}`);
  console.log(`   • Số game ĐÃ CẬP NHẬT ẢNH MỚI:     ${updatedCount} (Thành công ${Math.round((updatedCount / gamesNeedingCover.length) * 100)}%)`);
  console.log(`   • Số game vẫn thiếu (cần xử lý tay): ${skippedOrNotFoundCount}`);
  console.log(`   • File sao lưu (Backup):           ${backupFileName}`);
  console.log(`   • File nhật ký game thiếu ảnh:     missing-images-log.json`);
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal Script Error:', err);
  process.exit(1);
});
