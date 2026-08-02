import { parseGameTitle } from '../utils/titleParser';
import { KNOWN_GAME_ART } from '../data/gameArtMap';

// RAWG API Service & Cover Art Manager
// API Key provided by user: 290390ff53654730a48aa3e86f3ddf4f

const RAWG_API_KEY = '290390ff53654730a48aa3e86f3ddf4f';
const RAWG_BASE_URL = 'https://api.rawg.io/api/games';

// In-memory queue to limit simultaneous API requests (batching/throttling)
let activeRequestsCount = 0;
const MAX_CONCURRENT_REQUESTS = 3;
const requestQueue: Array<() => void> = [];

function processQueue() {
  if (activeRequestsCount < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const nextTask = requestQueue.shift();
    if (nextTask) {
      activeRequestsCount++;
      nextTask();
    }
  }
}

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const task = () => {
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequestsCount--;
          processQueue();
        });
    };
    requestQueue.push(task);
    processQueue();
  });
}

/**
 * Check if a given URL is a generic stock/unsplash/placeholder image
 */
export function isStockPhotoUrl(url: string | undefined | null): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('unsplash.com') ||
    lower.includes('placeholder') ||
    lower.includes('dummyimage') ||
    lower.includes('via.placeholder')
  );
}

/**
 * Clean title to improve RAWG search accuracy.
 * First extracts cleanTitle using parseGameTitle, then strips custom store/mod/edition suffixes, extra tags, emojis, brackets, etc.
 * E.g., "🔥🔥 FINAL FANTASY VII — QUÁN GAME XÓM EDITION" -> "FINAL FANTASY VII"
 */
export function cleanTitleForSearch(rawTitle: string): string {
  if (!rawTitle) return '';
  // 1. Use titleParser to separate clean base title from subtitle/branding
  const { cleanTitle } = parseGameTitle(rawTitle);
  let t = cleanTitle || rawTitle;

  // 2. Replace colons, dashes, slashes, and special punctuation with spaces
  t = t.replace(/[:\-\—\–\/\_\.\,]/g, ' ');

  // 3. Strip emojis and special symbols
  t = t.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[⭐🇻🇳🔥💥✦⚡✨🎮👑💎]/gu, ' ');

  // 4. Remove content inside parentheses, brackets, or braces like (GTA 5), [PC], {Mod}
  t = t.replace(/[\(\[\{].*?[\)\]\}]/g, ' ');

  // 5. Remove common Vietnamese/release/mod keywords if still lingering
  t = t.replace(/quán game xóm|qgx edition|edition|việt hóa|việt hoá|viethoa|resynced|remastered|re-?make|repack|full iso|iso|crack|online|mobile|pc|android|ps1|ps2|ps3|ps4|ps5|switch|deluxe|gold|goty|ultimate|complete|definitive|enhanced|v\d+\.\d+(\.\d+)*/gi, ' ');

  // 6. Replace multiple spaces and trim
  t = t.replace(/\s+/g, ' ').trim();

  return t || cleanTitle || rawTitle.trim();
}

/**
 * Helper to match best result from RAWG search response
 */
function findBestGameMatch(results: any[], cleanedTitle: string): any {
  if (!results || results.length === 0) return null;
  const targetLower = cleanedTitle.toLowerCase().trim();
  const targetSlug = targetLower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // 1. Exact name match
  const exactName = results.find((r: any) => r.name && r.name.toLowerCase().trim() === targetLower);
  if (exactName) return exactName;

  // 2. Exact or leading slug match
  const exactSlug = results.find((r: any) => r.slug === targetSlug || r.slug?.startsWith(targetSlug));
  if (exactSlug) return exactSlug;

  // 3. Name starts with cleanedTitle
  const nameStartsWith = results.find((r: any) => r.name && r.name.toLowerCase().startsWith(targetLower));
  if (nameStartsWith) return nameStartsWith;

  // 4. Name contains cleanedTitle
  const nameContains = results.find((r: any) => r.name && r.name.toLowerCase().includes(targetLower));
  if (nameContains) return nameContains;

  // 5. Fallback to first result
  return results[0];
}

/**
 * Helper to get manual cover override from localStorage
 */
export function getManualCover(gameId: string, title: string): string | null {
  try {
    const keyById = `manual_cover_id_${gameId}`;
    const keyByTitle = `manual_cover_title_${cleanTitleForSearch(title).toLowerCase()}`;
    return localStorage.getItem(keyById) || localStorage.getItem(keyByTitle) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save manual cover override to localStorage (Base64 data URL)
 */
export function saveManualCover(gameId: string, title: string, base64DataUrl: string): void {
  try {
    const keyById = `manual_cover_id_${gameId}`;
    const keyByTitle = `manual_cover_title_${cleanTitleForSearch(title).toLowerCase()}`;
    localStorage.setItem(keyById, base64DataUrl);
    localStorage.setItem(keyByTitle, base64DataUrl);
  } catch (e) {
    console.warn('Failed to save manual cover to localStorage:', e);
  }
}

/**
 * Remove manual cover override from localStorage
 */
export function removeManualCover(gameId: string, title: string): void {
  try {
    const keyById = `manual_cover_id_${gameId}`;
    const keyByTitle = `manual_cover_title_${cleanTitleForSearch(title).toLowerCase()}`;
    localStorage.removeItem(keyById);
    localStorage.removeItem(keyByTitle);
  } catch (e) {
    console.warn('Failed to remove manual cover:', e);
  }
}

/**
 * Helper to get manual banner override from localStorage
 */
export function getManualBanner(gameId: string, title: string): string | null {
  try {
    const keyById = `manual_banner_id_${gameId}`;
    const keyByTitle = `manual_banner_title_${cleanTitleForSearch(title).toLowerCase()}`;
    return localStorage.getItem(keyById) || localStorage.getItem(keyByTitle) || null;
  } catch (e) {
    return null;
  }
}

/**
 * Save manual banner override to localStorage (Base64 data URL)
 */
export function saveManualBanner(gameId: string, title: string, base64DataUrl: string): void {
  try {
    const keyById = `manual_banner_id_${gameId}`;
    const keyByTitle = `manual_banner_title_${cleanTitleForSearch(title).toLowerCase()}`;
    localStorage.setItem(keyById, base64DataUrl);
    localStorage.setItem(keyByTitle, base64DataUrl);
  } catch (e) {
    console.warn('Failed to save manual banner to localStorage:', e);
  }
}

/**
 * Remove manual banner override from localStorage
 */
export function removeManualBanner(gameId: string, title: string): void {
  try {
    const keyById = `manual_banner_id_${gameId}`;
    const keyByTitle = `manual_banner_title_${cleanTitleForSearch(title).toLowerCase()}`;
    localStorage.removeItem(keyById);
    localStorage.removeItem(keyByTitle);
  } catch (e) {
    console.warn('Failed to remove manual banner:', e);
  }
}

export interface RawgCoverResult {
  coverImage: string | null;
  rating: number | null;
  genres: string[];
}

export interface RawgBannerResult {
  bannerImage: string | null;
  rating: number | null;
}

/**
 * Robust helper to fetch RAWG API results trying direct connection first, then CORS proxy fallbacks.
 */
async function queryRawgSearchResults(cleanedTitle: string): Promise<any[] | null> {
  const primaryUrl = `${RAWG_BASE_URL}?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanedTitle)}&page_size=5`;

  // 1. Direct fetch
  try {
    const res = await fetch(primaryUrl);
    if (res.ok) {
      const text = await res.text();
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    }
  } catch (e) {
    // direct fetch failed
  }

  // 2. AllOrigins proxy fallback
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(primaryUrl)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const text = await res.text();
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    }
  } catch (e) {
    // proxy fetch failed
  }

  // 3. Corsproxy.io fallback
  try {
    const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(primaryUrl)}`;
    const res = await fetch(proxyUrl2);
    if (res.ok) {
      const text = await res.text();
      if (text.startsWith('{')) {
        const data = JSON.parse(text);
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          return data.results;
        }
      }
    }
  } catch (e) {
    // corsproxy failed
  }

  return null;
}

/**
 * Resolves game cover & banner using Known Art Map -> Steam Search API -> RAWG API.
 */
async function queryGameArtFromProviders(cleanedTitle: string): Promise<{ coverImage: string | null; bannerImage: string | null; rating: number | null; genres: string[] } | null> {
  const normKey = cleanedTitle.toLowerCase().replace(/[:\-\—\–\/\_\.\,]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check KNOWN_GAME_ART first (Instant, zero latency)
  if (KNOWN_GAME_ART[normKey]) {
    const ka = KNOWN_GAME_ART[normKey];
    return {
      coverImage: ka.coverImage,
      bannerImage: ka.bannerImage,
      rating: ka.rating || 95,
      genres: ka.genres || ['Game Quán Xóm']
    };
  }

  for (const [key, ka] of Object.entries(KNOWN_GAME_ART)) {
    if (normKey.includes(key) || key.includes(normKey)) {
      return {
        coverImage: ka.coverImage,
        bannerImage: ka.bannerImage,
        rating: ka.rating || 95,
        genres: ka.genres || ['Game Quán Xóm']
      };
    }
  }

  // 2. Query Steam Store Search API (100% open CORS, fast 2:3 vertical covers)
  try {
    const steamUrl = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(cleanedTitle)}&l=english&cc=US`;
    const res = await fetch(steamUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        const item = data.items[0];
        const appId = item.id;
        const coverImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
        const bannerImage = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
        return {
          coverImage,
          bannerImage,
          rating: 94,
          genres: item.genres ? item.genres.map((g: any) => g.name || g) : ['Game PC']
        };
      }
    }
  } catch (e) {
    // Steam search failed
  }

  // 3. Fallback to RAWG API
  try {
    const results = await queryRawgSearchResults(cleanedTitle);
    if (results && results.length > 0) {
      const matched = findBestGameMatch(results, cleanedTitle);
      const coverImg = matched.background_image || matched.background_image_additional || matched.short_screenshots?.[0]?.image || null;
      const bannerImg = matched.background_image || matched.background_image_additional || null;
      const rating = matched.rating ? Math.round(matched.rating * 20) : null;
      const genres = matched.genres ? matched.genres.map((g: any) => g.name) : [];
      if (coverImg || bannerImg) {
        return {
          coverImage: coverImg,
          bannerImage: bannerImg,
          rating,
          genres
        };
      }
    }
  } catch (e) {
    // RAWG search failed
  }

  return null;
}

/**
 * Clear failed RAWG cache entries from localStorage to unblock fetches
 */
export function clearFailedRawgCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('rawg_cover_failed_') || key.startsWith('rawg_banner_failed_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (e) {}
}

// Automatically clear failed caches on load
clearFailedRawgCache();

/**
 * Fetch game avatar/cover image with dedicated cache key rawg_cover_[cleanTitle]
 */
export async function fetchRawgCover(title: string): Promise<RawgCoverResult | null> {
  const cleanedTitle = cleanTitleForSearch(title);
  if (!cleanedTitle) return null;

  const cacheKey = `rawg_cover_${cleanedTitle.toLowerCase()}`;
  const failKey = `rawg_cover_failed_${cleanedTitle.toLowerCase()}`;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.coverImage) {
        return {
          coverImage: parsed.coverImage,
          rating: parsed.rating || null,
          genres: parsed.genres || []
        };
      }
    }

    const failed = localStorage.getItem(failKey);
    if (failed) {
      const failTime = parseInt(failed, 10);
      if (Date.now() - failTime < 2 * 60 * 1000) { // 2 mins fail cache
        return null;
      } else {
        localStorage.removeItem(failKey);
      }
    }
  } catch (e) {
    // ignore cache read errors
  }

  return enqueueRequest(async () => {
    try {
      const art = await queryGameArtFromProviders(cleanedTitle);

      if (art && art.coverImage) {
        const resultObj: RawgCoverResult = {
          coverImage: art.coverImage,
          rating: art.rating,
          genres: art.genres
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(resultObj));
        } catch (e) {}

        return resultObj;
      }

      try {
        localStorage.setItem(failKey, Date.now().toString());
      } catch (e) {}
      return null;
    } catch (error) {
      console.warn(`Cover fetch error for "${title}" (${cleanedTitle}):`, error);
      return null;
    }
  });
}

/**
 * Fetch game wide top hero banner image with dedicated cache key rawg_banner_[cleanTitle]
 */
export async function fetchRawgBanner(title: string): Promise<RawgBannerResult | null> {
  const cleanedTitle = cleanTitleForSearch(title);
  if (!cleanedTitle) return null;

  const cacheKey = `rawg_banner_${cleanedTitle.toLowerCase()}`;
  const failKey = `rawg_banner_failed_${cleanedTitle.toLowerCase()}`;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.bannerImage) {
        return {
          bannerImage: parsed.bannerImage,
          rating: parsed.rating || null
        };
      }
    }

    const failed = localStorage.getItem(failKey);
    if (failed) {
      const failTime = parseInt(failed, 10);
      if (Date.now() - failTime < 2 * 60 * 1000) {
        return null;
      } else {
        localStorage.removeItem(failKey);
      }
    }
  } catch (e) {
    // ignore cache read errors
  }

  return enqueueRequest(async () => {
    try {
      const art = await queryGameArtFromProviders(cleanedTitle);

      if (art && (art.bannerImage || art.coverImage)) {
        const bannerImg = art.bannerImage || art.coverImage;
        const resultObj: RawgBannerResult = {
          bannerImage: bannerImg,
          rating: art.rating
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(resultObj));
        } catch (e) {}

        return resultObj;
      }

      try {
        localStorage.setItem(failKey, Date.now().toString());
      } catch (e) {}
      return null;
    } catch (error) {
      console.warn(`Banner fetch error for "${title}" (${cleanedTitle}):`, error);
      return null;
    }
  });
}

