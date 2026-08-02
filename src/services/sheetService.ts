import { GameItem, PlatformType } from '../types';
import { INITIAL_GAMES } from '../data/initialGames';

export function parseCSVRow(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function extractPlatforms(raw: string): PlatformType[] {
  const platforms: PlatformType[] = [];
  const upper = raw.toUpperCase();
  
  if (upper.includes('PC')) platforms.push('PC');
  if (upper.includes('PS4')) platforms.push('PS4');
  if (upper.includes('PS5')) platforms.push('PS5');
  if (upper.includes('PS1')) platforms.push('PS1');
  if (upper.includes('PS2')) platforms.push('PS2');
  if (upper.includes('PS3')) platforms.push('PS3');
  if (upper.includes('ANDROID')) platforms.push('Android');
  if (upper.includes('SWITCH')) platforms.push('Switch');
  if (upper.includes('IOS')) platforms.push('iOS');
  
  if (platforms.length === 0) {
    if (upper.includes('MOBILE')) platforms.push('Android');
    else platforms.push('PC');
  }
  
  return platforms;
}

export function parseGoogleSheetCSV(csvText: string): GameItem[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return INITIAL_GAMES;

  let headerIndex = -1;
  let headers: string[] = [];

  // Find header line containing TÊN GAME or COVER ART
  for (let i = 0; i < Math.min(lines.length, 25); i++) {
    const row = parseCSVRow(lines[i]);
    const rowStr = row.join(' ').toUpperCase();
    if (rowStr.includes('TÊN GAME') || rowStr.includes('COVER ART') || rowStr.includes('LINK DOWNLOAD')) {
      headerIndex = i;
      headers = row.map(h => h.toUpperCase());
      break;
    }
  }

  if (headerIndex === -1) {
    console.warn("Could not detect standard header row in Google Sheet CSV, returning initial list.");
    return INITIAL_GAMES;
  }

  // Find column indices
  const coverIdx = headers.findIndex(h => h.includes('COVER'));
  const platformIdx = headers.findIndex(h => h.includes('HỆ MÁY') || h.includes('PLATFORM'));
  const titleIdx = headers.findIndex(h => h.includes('TÊN GAME') || h.includes('TITLE'));
  const langIdx = headers.findIndex(h => h.includes('NGÔN NGỮ') || h.includes('LANGUAGE'));
  const fbIdx = headers.findIndex(h => h.includes('LINK BÀI VIẾT') || h.includes('PREVIEW') || h.includes('FACEBOOK'));
  const dlIdx = headers.findIndex(h => h.includes('LINK DOWNLOAD') || h.includes('DOWNLOAD'));
  const m1Idx = headers.findIndex(h => h.includes('MIRROR 1'));
  const m2Idx = headers.findIndex(h => h.includes('MIRROR 2'));
  const onlineIdx = headers.findIndex(h => h.includes('CHƠI ONLINE') || h.includes('ONLINE'));

  const parsedGames: GameItem[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    const titleRaw = titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : '';
    
    if (!titleRaw || titleRaw.length < 2) continue;

    // Clean title and subtitle
    const parts = titleRaw.split(/[\n•·]/);
    const title = parts[0].replace(/[*_~]/g, '').trim();
    const subtitle = parts.slice(1).join(' ').trim();

    const platformRaw = platformIdx !== -1 && row[platformIdx] ? row[platformIdx] : 'PC';
    const langRaw = langIdx !== -1 && row[langIdx] ? row[langIdx] : 'Tiếng Việt ⭐';
    const coverRaw = coverIdx !== -1 && row[coverIdx] ? row[coverIdx] : '';
    const fbRaw = fbIdx !== -1 && row[fbIdx] ? row[fbIdx] : '';
    const dlRaw = dlIdx !== -1 && row[dlIdx] ? row[dlIdx] : '';
    const m1Raw = m1Idx !== -1 && row[m1Idx] ? row[m1Idx] : '';
    const m2Raw = m2Idx !== -1 && row[m2Idx] ? row[m2Idx] : '';
    const onlineRaw = onlineIdx !== -1 && row[onlineIdx] ? row[onlineIdx] : '';

    // Match with fallback default images if coverRaw is empty or invalid
    let coverUrl = coverRaw.startsWith('http') ? coverRaw : '';
    if (!coverUrl) {
      // Find matching initial game or select aesthetic default poster
      const match = INITIAL_GAMES.find(g => g.title.toLowerCase().includes(title.toLowerCase()));
      if (match) coverUrl = match.coverArt;
      else coverUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop";
    }

    const hasVietHoa = langRaw.toLowerCase().includes('việt') || titleRaw.toLowerCase().includes('việt hóa');

    parsedGames.push({
      id: `sheet-game-${i}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      title: title,
      subtitle: subtitle || (hasVietHoa ? "Bản chuẩn Việt Hóa • Quán Game Xóm" : undefined),
      coverArt: coverUrl,
      backdropArt: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1600&auto=format&fit=crop",
      platforms: extractPlatforms(platformRaw),
      language: langRaw,
      hasVietHoa: hasVietHoa,
      rating: 4.8,
      downloadUrl: dlRaw.startsWith('http') ? dlRaw : undefined,
      mirror1Url: m1Raw.startsWith('http') ? m1Raw : undefined,
      mirror2Url: m2Raw.startsWith('http') ? m2Raw : undefined,
      fbPreviewUrl: fbRaw.startsWith('http') ? fbRaw : undefined,
      onlinePlayUrl: onlineRaw.startsWith('http') ? onlineRaw : undefined,
      addedDate: new Date().toISOString().split('T')[0]
    });
  }

  return parsedGames.length > 0 ? parsedGames : INITIAL_GAMES;
}

export async function fetchSheetData(sheetUrlOrId: string, gid = '0'): Promise<GameItem[]> {
  try {
    // Call server endpoint first
    const res = await fetch(`/api/sheet-sync?url=${encodeURIComponent(sheetUrlOrId)}&gid=${gid}`);
    if (res.ok) {
      const data = await res.json();
      if (data.games && data.games.length > 0) {
        return data.games;
      }
    }
  } catch (err) {
    console.warn("Server sheet-sync fetch failed, trying direct public CSV export:", err);
  }

  // Fallback direct CSV fetch
  let csvUrl = '';
  if (sheetUrlOrId.includes('docs.google.com/spreadsheets')) {
    const idMatch = sheetUrlOrId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = sheetUrlOrId.match(/gid=([0-9]+)/);
    const id = idMatch ? idMatch[1] : '1UafcEOp-1R6LWnnu36EQRp5V0b12K4fqho9X0qJYPy4';
    const targetGid = gidMatch ? gidMatch[1] : gid;
    csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${targetGid}`;
  } else {
    csvUrl = `https://docs.google.com/spreadsheets/d/${sheetUrlOrId}/export?format=csv&gid=${gid}`;
  }

  try {
    const res = await fetch(csvUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();
    return parseGoogleSheetCSV(csvText);
  } catch (error) {
    console.error("Error fetching Google Sheet CSV directly:", error);
    return INITIAL_GAMES;
  }
}
