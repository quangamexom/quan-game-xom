import { GameItem, PlatformType } from '../types';
import { INITIAL_GAMES } from '../data/initialGames';
import { KNOWN_GAME_ART } from '../data/gameArtMap';

export const DEFAULT_SHEET_ID = "1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM";

export function parseCSVToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
    } else {
      currentCell += char;
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  return rows;
}

export function extractPlatforms(raw: string): PlatformType[] {
  const platforms: PlatformType[] = [];
  const upper = raw.toUpperCase();
  
  if (upper.includes('PC')) platforms.push('PC');
  if (upper.includes('PS5')) platforms.push('PS5');
  if (upper.includes('PS4')) platforms.push('PS4');
  if (upper.includes('PS3')) platforms.push('PS3');
  if (upper.includes('PS2')) platforms.push('PS2');
  if (upper.includes('PS1')) platforms.push('PS1');
  if (upper.includes('PSP')) platforms.push('PS1');
  if (upper.includes('ANDROID')) platforms.push('Android');
  if (upper.includes('SWITCH')) platforms.push('Switch');
  if (upper.includes('IOS')) platforms.push('iOS');
  
  if (platforms.length === 0) {
    if (upper.includes('MOBILE')) platforms.push('Android');
    else platforms.push('PC');
  }
  
  return Array.from(new Set(platforms));
}

function cleanKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[⭐🇻🇳🔥💥✦⚡✨🎮👑💎]/gu, " ")
    .replace(/[\(\[\{].*?[\)\]\}]/g, " ")
    .replace(/quán game xóm|qgx edition|edition|việt hóa|việt hoá|viethoa|resynced|remastered|re-?make|repack|full iso|iso|crack/gi, " ")
    .replace(/[:\-\—\–\/\_\.\,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseGoogleSheetCSV(csvText: string): GameItem[] {
  const rows = parseCSVToRows(csvText);
  if (rows.length === 0) return INITIAL_GAMES;

  let headerIndex = -1;
  let headers: string[] = [];

  // Find header line containing TÊN GAME or COVER ART
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const rowStr = rows[i].join(' ').toUpperCase();
    if (rowStr.includes('TÊN GAME') || rowStr.includes('COVER ART') || rowStr.includes('LINK DOWNLOAD')) {
      headerIndex = i;
      headers = rows[i].map(h => h.toUpperCase());
      break;
    }
  }

  const parsedGames: GameItem[] = [];
  const startIndex = headerIndex !== -1 ? headerIndex + 1 : 0;

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    let platformRaw = '';
    let titleRaw = '';
    let langRaw = '';
    let fbRaw = '';
    let dlRaw = '';
    let m1Raw = '';
    let m2Raw = '';
    let onlineRaw = '';
    let coverRaw = '';

    if (headerIndex !== -1) {
      const coverIdx = headers.findIndex(h => h.includes('COVER'));
      const platformIdx = headers.findIndex(h => h.includes('HỆ MÁY') || h.includes('PLATFORM'));
      const titleIdx = headers.findIndex(h => h.includes('TÊN GAME') || h.includes('TITLE'));
      const langIdx = headers.findIndex(h => h.includes('NGÔN NGỮ') || h.includes('LANGUAGE'));
      const fbIdx = headers.findIndex(h => h.includes('LINK BÀI VIẾT') || h.includes('PREVIEW') || h.includes('FACEBOOK'));
      const dlIdx = headers.findIndex(h => h.includes('LINK DOWNLOAD') || h.includes('DOWNLOAD'));
      const m1Idx = headers.findIndex(h => h.includes('MIRROR 1'));
      const m2Idx = headers.findIndex(h => h.includes('MIRROR 2'));
      const onlineIdx = headers.findIndex(h => h.includes('CHƠI ONLINE') || h.includes('ONLINE'));

      platformRaw = platformIdx !== -1 && row[platformIdx] ? row[platformIdx] : 'PC';
      titleRaw = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : '';
      langRaw = langIdx !== -1 && row[langIdx] ? row[langIdx] : 'Tiếng Việt ⭐';
      coverRaw = coverIdx !== -1 && row[coverIdx] ? row[coverIdx] : '';
      fbRaw = fbIdx !== -1 && row[fbIdx] ? row[fbIdx] : '';
      dlRaw = dlIdx !== -1 && row[dlIdx] ? row[dlIdx] : '';
      m1Raw = m1Idx !== -1 && row[m1Idx] ? row[m1Idx] : '';
      m2Raw = m2Idx !== -1 && row[m2Idx] ? row[m2Idx] : '';
      onlineRaw = onlineIdx !== -1 && row[onlineIdx] ? row[onlineIdx] : '';
    } else {
      // Direct positional schema for standard sheets without header row
      platformRaw = row[0] || 'PC';
      titleRaw = row[1] || '';
      langRaw = row[2] || 'Tiếng Việt ⭐';
      fbRaw = row[3] || '';
      dlRaw = row[4] || '';
      m1Raw = row[5] || '';
      m2Raw = row[6] || '';
      onlineRaw = row[7] || '';
    }

    if (!titleRaw || titleRaw.trim().length < 2) continue;

    // Clean title and subtitle
    const parts = titleRaw.split(/\r?\n/);
    const title = parts[0].replace(/[*_~]/g, '').trim();
    const subtitle = parts.slice(1).join(' ').trim();

    const hasVietHoa = langRaw.toLowerCase().includes('việt') || titleRaw.toLowerCase().includes('việt hóa') || titleRaw.toLowerCase().includes('việt hoá');

    const key = cleanKey(title);
    const knownArt = KNOWN_GAME_ART[key];

    let coverUrl = coverRaw.startsWith('http') ? coverRaw : (knownArt?.coverImage || '');
    if (!coverUrl) {
      const match = INITIAL_GAMES.find(g => g.title.toLowerCase().includes(title.toLowerCase()));
      if (match) coverUrl = match.coverArt;
      else coverUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop";
    }

    const backdropUrl = knownArt?.bannerImage || "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop";

    parsedGames.push({
      id: `sheet-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: title,
      subtitle: subtitle || (hasVietHoa ? "Bản chuẩn Việt Hóa • Quán Game Xóm" : undefined),
      coverArt: coverUrl,
      backdropArt: backdropUrl,
      platforms: extractPlatforms(platformRaw),
      language: langRaw,
      hasVietHoa: hasVietHoa,
      releaseYear: 2024,
      fileSize: "Google Drive / Link Kho",
      rating: knownArt?.rating ? knownArt.rating / 20 : 4.8,
      genres: knownArt?.genres || (hasVietHoa ? ["Quán Game Xóm", "Độc Quyền", "Việt Hóa"] : ["Quán Game Xóm", "Độc Quyền"]),
      description: `${title} — Bản game chuẩn từ Kho Game Quán Xóm Sharing. Tương thích mượt mà, tải nhanh không gián đoạn.`,
      downloadUrl: dlRaw.startsWith('http') ? dlRaw : (dlRaw && dlRaw.length > 5 ? dlRaw : undefined),
      mirror1Url: m1Raw.startsWith('http') ? m1Raw : (m1Raw && m1Raw.length > 5 ? m1Raw : undefined),
      mirror2Url: m2Raw.startsWith('http') ? m2Raw : (m2Raw && m2Raw.length > 5 ? m2Raw : undefined),
      fbPreviewUrl: fbRaw.startsWith('http') ? fbRaw : undefined,
      onlinePlayUrl: onlineRaw.startsWith('http') ? onlineRaw : undefined,
      isFeatured: i < 8,
      isPopular: i % 2 === 0,
      isNewUpdate: i < 20,
      addedDate: "2026-08-10"
    });
  }

  return parsedGames.length > 0 ? parsedGames : INITIAL_GAMES;
}

export async function fetchSheetData(sheetUrlOrId: string = DEFAULT_SHEET_ID, gid = '0'): Promise<GameItem[]> {
  try {
    const response = await fetch('/api/sheet-games');
    if (response.ok) {
      const data = await response.json();
      if (data && data.games && Array.isArray(data.games) && data.games.length > 0) {
        return data.games;
      }
    }
  } catch (err) {
    // API endpoint unavailable (e.g. static site on Vercel)
  }

  // Direct CSV fetch fallback for static hosts (Vercel, GitHub Pages)
  try {
    const targetId = sheetUrlOrId.includes('/')
      ? sheetUrlOrId.split('/d/')[1]?.split('/')[0] || DEFAULT_SHEET_ID
      : sheetUrlOrId;
    const csvUrl = `https://docs.google.com/spreadsheets/d/${targetId}/export?format=csv&gid=${gid}`;
    const csvRes = await fetch(csvUrl);
    if (csvRes.ok) {
      const csvText = await csvRes.text();
      const sheetGames = parseGoogleSheetCSV(csvText);
      if (sheetGames && sheetGames.length > 0) {
        return sheetGames;
      }
    }
  } catch (err) {
    console.warn("Direct CSV fetch fallback error, using pre-loaded dataset:", err);
  }

  return INITIAL_GAMES;
}

