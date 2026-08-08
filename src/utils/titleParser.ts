export interface ParsedTitle {
  cleanTitle: string;
  subtitle: string;
  originalTitle: string;
}

/**
 * Parses game titles into a main standard title (cleanTitle) and a branding/mod/note suffix (subtitle).
 * Handles separators like em-dash "—", en-dash "–", double-dash "--", space-dash-space " - ",
 * parentheses "(...)", square brackets "[...]", and leading/trailing emojis.
 *
 * Examples:
 * "🔥🔥 FINAL FANTASY VII — QUÁN GAME XÓM EDITION"
 * => cleanTitle: "FINAL FANTASY VII"
 * => subtitle: "🔥🔥 QUÁN GAME XÓM EDITION"
 *
 * "FINAL FANTASY VII — SIMPLE MOD - QUÁN GAME XÓM EDITION"
 * => cleanTitle: "FINAL FANTASY VII"
 * => subtitle: "SIMPLE MOD - QUÁN GAME XÓM EDITION"
 *
 * "STORY OF SEASONS: Friends of Mineral Town (Bản Việt Hóa Full)"
 * => cleanTitle: "STORY OF SEASONS: Friends of Mineral Town"
 * => subtitle: "Bản Việt Hóa Full"
 */
export function parseGameTitle(rawTitle: string, existingSubtitle?: string): ParsedTitle {
  if (!rawTitle) {
    return {
      cleanTitle: '',
      subtitle: existingSubtitle || '',
      originalTitle: ''
    };
  }

  const originalTitle = rawTitle.trim();
  let text = originalTitle;

  // Extract leading emojis or symbols (e.g. 🔥🔥, ⭐, 💥, ⚡, etc.)
  const emojiRegex = /^([\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}⭐🇻🇳🔥💥✦⚡✨🎮👑💎\s]+)/u;
  const emojiMatch = text.match(emojiRegex);
  let leadingEmoji = '';
  if (emojiMatch) {
    leadingEmoji = emojiMatch[1].trim();
    text = text.slice(emojiMatch[0].length).trim();
  }

  let cleanTitle = text;
  let subtitle = existingSubtitle ? existingSubtitle.trim() : '';

  // 1. Check for prominent dash separators: "—", "–", "--", or " - "
  const dashMatch = text.match(/^(.*?)(?:\s*—\s*|\s*–\s*|\s*--\s*|\s+-\s+)(.*)$/s);

  if (dashMatch && dashMatch[1].trim()) {
    cleanTitle = dashMatch[1].trim();
    const extractedSub = dashMatch[2].trim();
    subtitle = subtitle ? `${extractedSub} • ${subtitle}` : extractedSub;
  } else {
    // 2. Check for bracket separators: (...), [...], {...}
    const bracketMatch = text.match(/^(.*?)\s*[\(\[\{](.*?)[\)\]\}]\s*(.*)$/s);
    if (bracketMatch && bracketMatch[1].trim()) {
      cleanTitle = bracketMatch[1].trim();
      const insideBracket = bracketMatch[2].trim();
      const afterBracket = bracketMatch[3].trim();
      const extractedSub = [insideBracket, afterBracket].filter(Boolean).join(' ');
      subtitle = subtitle ? `${extractedSub} • ${subtitle}` : extractedSub;
    } else {
      // 3. Check for dash keyword matches (e.g. "- QUÁN GAME XÓM EDITION")
      const keywordDashIndex = text.search(/\s*-\s*(quán game xóm|qgx|simple mod|edition|việt hóa|bản việt hóa|full|mod|remastered)/i);
      if (keywordDashIndex > 0) {
        cleanTitle = text.slice(0, keywordDashIndex).trim();
        const extractedSub = text.slice(keywordDashIndex).replace(/^\s*-\s*/, '').trim();
        subtitle = subtitle ? `${extractedSub} • ${subtitle}` : extractedSub;
      }
    }
  }

  // Attach leadingEmoji into subtitle if present
  if (leadingEmoji) {
    if (subtitle) {
      if (!subtitle.includes(leadingEmoji)) {
        subtitle = `${leadingEmoji} ${subtitle}`;
      }
    } else {
      subtitle = leadingEmoji;
    }
  }

  // Strip trailing/leading punctuation from cleanTitle
  cleanTitle = cleanTitle.replace(/^[\s—–:-]+|[\s—–:-]+$/g, '').trim();

  // If cleanTitle ended up empty, fallback to original title without emojis
  if (!cleanTitle) {
    cleanTitle = text || originalTitle;
  }

  return {
    cleanTitle,
    subtitle,
    originalTitle
  };
}

export function cleanTitleForSearch(title: string): string {
  if (!title) return '';
  const parsed = parseGameTitle(title);
  return parsed.cleanTitle || title;
}
