import { GameItem } from '../types';

/**
 * Generates the canonical absolute URL for a game's detail page
 */
export function getGameShareUrl(game: GameItem): string {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : '';
  
  // Clean, URL-safe game identifier
  const safeId = encodeURIComponent(game.id);
  return `${origin}/game/${safeId}`;
}

/**
 * Copies text to clipboard with modern Clipboard API and fallback to execCommand
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Modern Navigator Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn('[copyTextToClipboard] Clipboard API failed, attempting fallback...', err);
    }
  }

  // 2. Legacy Fallback via textarea & execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('[copyTextToClipboard] ExecCommand fallback failed:', err);
    return false;
  }
}

/**
 * Prepares social share links and actions for a game
 */
export function getGameShareActions(game: GameItem) {
  const shareUrl = getGameShareUrl(game);
  const titleText = `${game.title} - Quán Game Xóm`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(titleText);

  return {
    shareUrl,
    titleText,
    facebookUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegramUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    zaloUrl: `https://zalo.me/share/link?u=${encodedUrl}&t=${encodedText}`,
    discordCopyText: `🎮 ${game.title} - Quán Game Xóm\n${shareUrl}`
  };
}
