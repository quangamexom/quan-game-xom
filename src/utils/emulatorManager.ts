/**
 * EmulatorJS Engine & Session Manager
 * Provides global state management, event hooks, and clean teardown utilities.
 */

declare global {
  interface Window {
    __QGX_IS_PLAYING_EMULATOR__?: boolean;
    __QGX_STOP_EMULATOR__?: () => void;
    __QGX_ACTIVE_GAME_TITLE__?: string;
  }
}

/**
 * Checks if EmulatorJS is currently active and running in the DOM
 */
export function isEmulatorActive(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.__QGX_IS_PLAYING_EMULATOR__);
}

/**
 * Gets the current active game title if playing
 */
export function getActiveGameTitle(): string {
  if (typeof window === 'undefined') return '';
  return window.__QGX_ACTIVE_GAME_TITLE__ || '';
}

/**
 * Dispatches a global event to immediately terminate active EmulatorJS processes,
 * clean canvas, suspend AudioContext, and reset emulator states.
 */
export function stopActiveEmulator(): void {
  if (typeof window === 'undefined') return;
  console.log('[EmulatorManager] Discarding active emulator session...');
  window.__QGX_IS_PLAYING_EMULATOR__ = false;
  window.__QGX_ACTIVE_GAME_TITLE__ = '';
  window.dispatchEvent(new CustomEvent('qgx_stop_emulator'));
  window.dispatchEvent(new CustomEvent('qgx_emulator_state_changed', { detail: { isPlaying: false } }));
}

/**
 * Helper to request a safe navigation or action while intercepting if game is active
 */
export function requestSafeAction(action: () => void, targetLabel?: string): void {
  if (!isEmulatorActive()) {
    action();
    return;
  }

  // Dispatch event to open confirmation modal
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('qgx_request_exit_confirm', {
      detail: {
        action,
        targetLabel: targetLabel || 'chuyển hướng trang',
        gameTitle: getActiveGameTitle()
      }
    }));
  }
}
