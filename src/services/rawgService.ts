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
 * Clean title to improve RAWG search accuracy.
 * Removes brackets, tags like "Việt Hóa", "VH", "Resynced", platform markers, etc.
 */
export function cleanTitleForSearch(rawTitle: string): string {
  if (!rawTitle) return '';
  let t = rawTitle;
  // Remove content inside parentheses or brackets like (GTA 5), [PC], etc.
  t = t.replace(/[\(\[\{].*?[\)\]\}]/g, ' ');
  // Remove common Vietnamese game release keywords
  t = t.replace(/việt hóa|việt hoá|viethoa|vh|resynced|remastered|remake|repack|full iso|iso|crack|online|mobile|pc|android|ps1|ps2|ps3|ps4|ps5|switch/gi, ' ');
  // Remove special emojis
  t = t.replace(/[⭐🇻🇳🔥💥✦⚡✨]/g, '');
  // Replace multiple spaces
  t = t.replace(/\s+/g, ' ').trim();
  return t || rawTitle.trim();
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

export interface RawgGameResult {
  backgroundImage: string | null;
  rating: number | null;
  genres: string[];
}

/**
 * Fetch game cover art from RAWG.io API with caching & queueing
 */
export async function fetchRawgCover(title: string): Promise<RawgGameResult | null> {
  const cleanedTitle = cleanTitleForSearch(title);
  if (!cleanedTitle) return null;

  const cacheKey = `rawg_cache_${cleanedTitle.toLowerCase()}`;
  const failKey = `rawg_failed_${cleanedTitle.toLowerCase()}`;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return {
        backgroundImage: parsed.backgroundImage || null,
        rating: parsed.rating || null,
        genres: parsed.genres || []
      };
    }

    const failed = localStorage.getItem(failKey);
    if (failed) {
      // Failed cache valid for 24h
      const failTime = parseInt(failed, 10);
      if (Date.now() - failTime < 24 * 60 * 60 * 1000) {
        return null;
      }
    }
  } catch (e) {
    // ignore cache read errors
  }

  // Queue request to prevent exceeding RAWG rate limits
  return enqueueRequest(async () => {
    try {
      const url = `${RAWG_BASE_URL}?key=${RAWG_API_KEY}&search=${encodeURIComponent(cleanedTitle)}&page_size=1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`RAWG API error HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data && data.results && data.results.length > 0) {
        const first = data.results[0];
        const bgImage = first.background_image || null;
        const rating = first.rating ? Math.round(first.rating * 20) : null;
        const genres = first.genres ? first.genres.map((g: any) => g.name) : [];

        const resultObj: RawgGameResult = {
          backgroundImage: bgImage,
          rating: rating,
          genres: genres
        };

        // Store in cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify(resultObj));
        } catch (e) {
          // localStorage might be full
        }

        return resultObj;
      } else {
        // Mark failed search in cache
        try {
          localStorage.setItem(failKey, Date.now().toString());
        } catch (e) {}
        return null;
      }
    } catch (error) {
      console.warn(`RAWG API fetch failed for "${title}" (${cleanedTitle}):`, error);
      try {
        localStorage.setItem(failKey, Date.now().toString());
      } catch (e) {}
      return null;
    }
  });
}
