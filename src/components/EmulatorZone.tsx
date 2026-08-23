import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2,
  Upload,
  Play,
  RotateCcw,
  Save,
  Download,
  Users,
  Sparkles,
  Layers,
  HelpCircle,
  FolderOpen,
  Check,
  Share2,
  Copy,
  Info,
  Maximize2,
  Loader2,
  RefreshCw,
  Zap,
  Flame,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  Cloud,
  Crown,
  Link2,
  Edit3,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { DEFAULT_SNES_TEST_GAMES } from '../services/sheetService';
import { GameItem } from '../types';
import { ShareGameMenu } from './ShareGameMenu';
import { useAdminMode } from '../hooks/useAdminMode';
import { AdminRomManagerModal } from './AdminRomManagerModal';
import { EditGameDescriptionModal } from './EditGameDescriptionModal';
import { requestSafeAction } from '../utils/emulatorManager';
import { copyTextToClipboard, getGameShareUrl } from '../utils/shareUtils';
import { LoadingWordsSpinner } from './LoadingWordsSpinner';

export interface PresetRom {
  id: string;
  title: string;
  system: string; // 'nes' | 'snes' | 'gba' | 'gbc' | 'n64' | 'nds' | 'segaMD'
  systemName: string;
  romUrl: string;
  coverArt: string;
  description: string;
  isSnesSheet?: boolean;
}

export function normalizeRomUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const trimmed = rawUrl.trim();

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  // If already a relative path, convert to absolute URL
  if (trimmed.startsWith('/')) {
    if (typeof window !== 'undefined' && window.location?.origin) {
      return encodeURI(`${window.location.origin}${trimmed}`);
    }
    return encodeURI(trimmed);
  }

  // Check if it's a Google Drive link
  const driveMatch = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=|uc\?export=download&id=)|id=)([a-zA-Z0-9_-]{25,})/);
  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    // Route Google Drive files through /api/proxy-rom?id=...
    if (typeof window !== 'undefined' && window.location?.origin) {
      return `${window.location.origin}/api/proxy-rom?id=${fileId}`;
    }
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Safe URI encoding for spaces and special characters
  try {
    return encodeURI(decodeURI(trimmed));
  } catch (e) {
    return encodeURI(trimmed);
  }
}

// Map user-friendly or legacy core names to exact EmulatorJS core identifiers
export const EMULATOR_CORE_MAP: Record<string, string> = {
  'snes': 'snes9x',
  'snes9x': 'snes9x',
  'nes': 'fceumm',
  'fceumm': 'fceumm',
  'nestopia': 'nestopia',
  'gba': 'mgba',
  'mgba': 'mgba',
  'gbc': 'gambatte',
  'gb': 'gambatte',
  'gambatte': 'gambatte',
  'n64': 'mupen64plus_next',
  'mupen64plus_next': 'mupen64plus_next',
  'nds': 'desmume',
  'desmume': 'desmume',
  'melonds': 'melonds',
  'segaMD': 'genesis_plus_gx',
  'genesis_plus_gx': 'genesis_plus_gx',
  'megadrive': 'genesis_plus_gx',
  'genesis': 'genesis_plus_gx',
  'psx': 'pcsx_rearmed',
  'pcsx_rearmed': 'pcsx_rearmed'
};

export function resolveEmulatorCore(core: string): string {
  const normalized = (core || '').trim().toLowerCase();
  return EMULATOR_CORE_MAP[normalized] || EMULATOR_CORE_MAP[core] || core || 'snes9x';
}

const CLASSIC_PRESET_ROMS: PresetRom[] = [
  {
    id: 'blob-rom-yuyuhakusho-vn',
    title: 'Yu Yu Hakusho (Việt Hóa)',
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    romUrl: 'https://qdextdpa7wktpocb.public.blob.vercel-storage.com/roms/YuyuHakusho_VN.smc',
    coverArt: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
    description: 'Yu Yu Hakusho (Nhất Dương Chỉ / Hành Trình U Meshi) bản Việt Hóa chuẩn SNES 16-bit. Đại chiến võ đài bóng tối đỉnh cao cùng Yusuke và đồng đội.',
    isSnesSheet: true
  },
  {
    id: 'blob-rom-megaman-x2-vn',
    title: 'Mega Man X2 (Việt Hóa)',
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    romUrl: 'https://qdextdpa7wktpocb.public.blob.vercel-storage.com/roms/Mega%20Man%20X2%20VN.smc',
    coverArt: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop',
    description: 'Mega Man X2 (Rockman X2) bản Việt Hóa hoàn chỉnh trên SNES 16-bit. Đồng hành cùng X tiêu diệt binh đoàn X-Hunters và phục sinh Zero.',
    isSnesSheet: true
  },
  {
    id: 'blob-rom-battletoads-double-dragon',
    title: 'Battletoads & Double Dragon',
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    romUrl: 'https://qdextdpa7wktpocb.public.blob.vercel-storage.com/roms/Battletoads___Double_Dragon_-_The_Ultimate_Team__E_.smc',
    coverArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    description: 'Game đối kháng kết hợp kinh điển giữa binh đoàn ếch chiến binh Battletoads và anh em song long Billy & Jimmy của Double Dragon trên Super Nintendo 16-bit.',
    isSnesSheet: true
  },
  {
    id: 'blob-rom-power-rangers-fighting',
    title: 'Mighty Morphin Power Rangers',
    system: 'snes',
    systemName: 'Super Nintendo (SNES)',
    romUrl: 'https://qdextdpa7wktpocb.public.blob.vercel-storage.com/roms/Mighty_Morphin_Power_Rangers_-_The_Fighting_Edition__E_.smc',
    coverArt: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    description: 'Game đối kháng Robot khổng lồ Megazord và quái vật kinh điển của 5 Anh Em Siêu Nhân trên hệ máy Super Nintendo (SNES).',
    isSnesSheet: true
  }
];

const SYSTEM_CORES = [
  { id: 'snes', name: 'Super Nintendo SNES (16-bit)', exts: ['.snes', '.smc', '.sfc'] },
  { id: 'nes', name: 'Nintendo NES (8-bit)', exts: ['.nes'] },
  { id: 'gba', name: 'Game Boy Advance (GBA)', exts: ['.gba'] },
  { id: 'gbc', name: 'Game Boy Color (GBC)', exts: ['.gbc', '.gb'] },
  { id: 'n64', name: 'Nintendo 64 (N64)', exts: ['.n64', '.z64', '.v64'] },
  { id: 'nds', name: 'Nintendo DS (NDS)', exts: ['.nds'] },
  { id: 'segaMD', name: 'Sega Genesis / MegaDrive', exts: ['.md', '.smd', '.gen', '.bin'] },
  { id: 'psx', name: 'PlayStation 1 (PSX)', exts: ['.iso', '.cue', '.chd'] }
];

export const presetRomToGameItem = (rom: PresetRom): GameItem => ({
  id: rom.id,
  title: rom.title,
  subtitle: rom.systemName,
  platforms: ['Other'],
  language: 'Gốc / Tiếng Anh',
  hasVietHoa: false,
  coverArt: rom.coverArt,
  description: rom.description,
  fileSize: rom.systemName,
  emulatorCore: rom.system,
  romUrl: rom.romUrl,
  downloadUrl: rom.romUrl
});

/**
 * Helper to fetch ROM as binary ArrayBuffer, package it as application/octet-stream Blob,
 * and create a clean local Object URL. This completely solves Vercel Blob "unknown" content-type
 * header and CORS or download-trigger issues in production.
 */
export async function fetchRomAsBlobUrl(
  url: string,
  onStepUpdate?: (text: string) => void
): Promise<{ blobUrl: string; sizeBytes: number }> {
  // If already a local blob/data URL, return directly
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return { blobUrl: url, sizeBytes: 0 };
  }

  const cleanUrl = normalizeRomUrl(url);

  try {
    if (onStepUpdate) onStepUpdate(`Đang kết nối nạp dữ liệu ROM từ ${cleanUrl.includes('vercel-storage') ? 'Vercel Blob Storage' : 'máy chủ'}...`);
    console.log(`[ROM Fetcher] Fetching binary data from: ${cleanUrl}`);

    let response: Response;
    try {
      response = await fetch(cleanUrl);
    } catch (networkErr: any) {
      console.warn(`[ROM Fetcher] Direct fetch failed (${networkErr.message}). Attempting proxy fallback...`);
      response = await fetch(`/api/proxy-rom?url=${encodeURIComponent(cleanUrl)}`);
    }

    if (!response.ok) {
      // If direct fetch returned error, try server proxy fallback
      if (!cleanUrl.startsWith('/') && !cleanUrl.includes('/api/proxy-rom')) {
        console.warn(`[ROM Fetcher] Direct fetch returned ${response.status}. Attempting proxy fallback...`);
        response = await fetch(`/api/proxy-rom?url=${encodeURIComponent(cleanUrl)}`);
      }
    }

    if (!response.ok) {
      throw new Error(`Máy chủ phản hồi mã lỗi HTTP ${response.status} (${response.statusText || 'Không tìm thấy file ROM'})`);
    }

    if (onStepUpdate) onStepUpdate(`Đang tạo vùng nhớ nhị phân ROM (ArrayBuffer -> Blob)...`);
    const arrayBuffer = await response.arrayBuffer();
    const sizeBytes = arrayBuffer.byteLength;

    if (sizeBytes < 512) {
      // Check if it returned a short HTML error text instead of a game
      const textDecoder = new TextDecoder();
      const firstChunk = textDecoder.decode(arrayBuffer.slice(0, 200));
      if (firstChunk.includes('<html') || firstChunk.includes('<!DOCTYPE') || firstChunk.includes('Error')) {
        throw new Error('Dữ liệu tải về là trang web HTML thay vì file ROM game binary.');
      }
    }

    console.log(`[ROM Fetcher] Successfully packaged ${(sizeBytes / 1024 / 1024).toFixed(2)} MB (${sizeBytes} bytes) into application/octet-stream Blob.`);

    // Force application/octet-stream MIME type
    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    const blobUrl = URL.createObjectURL(blob);
    return { blobUrl, sizeBytes };
  } catch (err: any) {
    console.error('[ROM Fetcher Error]:', err);
    throw err;
  }
}

export const EmulatorZone: React.FC = () => {
  const { isAdmin } = useAdminMode();
  const isDev = Boolean(import.meta.env.DEV);
  const canShowAdmin = isDev || isAdmin;

  const [isAdminRomModalOpen, setIsAdminRomModalOpen] = useState<boolean>(false);

  const [selectedCore, setSelectedCore] = useState<string>('snes');
  const [currentRomUrl, setCurrentRomUrl] = useState<string | null>(null);
  const [currentRomName, setCurrentRomName] = useState<string>('');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  // Standby / Ready Game State (Idle State before user clicks 'CHƠI NGAY')
  const [standbyGame, setStandbyGame] = useState<{
    id?: string;
    title: string;
    subtitle?: string;
    romUrl: string;
    core: string;
    coverArt?: string;
    backdropArt?: string;
    fileSize?: string;
    hasVietHoa?: boolean;
    description?: string;
  } | null>(() => {
    const firstGame = DEFAULT_SNES_TEST_GAMES[0];
    return firstGame ? {
      id: firstGame.id,
      title: firstGame.title,
      subtitle: firstGame.subtitle,
      romUrl: firstGame.romUrl || '',
      core: 'snes',
      coverArt: firstGame.coverArt,
      backdropArt: firstGame.backdropArt,
      fileSize: firstGame.fileSize,
      hasVietHoa: firstGame.hasVietHoa,
      description: firstGame.description
    } : null;
  });

  // SNES / Vercel Blob Games State
  const [snesGames, setSnesGames] = useState<GameItem[]>(DEFAULT_SNES_TEST_GAMES);

  // Loading State for ROM Launch
  const [isLoadingRom, setIsLoadingRom] = useState<boolean>(false);
  const [loadingStepText, setLoadingStepText] = useState<string>('');
  const [romError, setRomError] = useState<{
    title: string;
    message: string;
    hint?: string;
    details?: string;
    originalUrl?: string;
  } | null>(null);

  // Netplay State (Online 2-Player)
  const [isNetplayActive, setIsNetplayActive] = useState<boolean>(false);
  const [netplayRoom, setNetplayRoom] = useState<string>('');
  const [netplayRole, setNetplayRole] = useState<'p1' | 'p2'>('p1');
  const [isCopiedRoom, setIsCopiedRoom] = useState<boolean>(false);
  const [isCopiedInviteLink, setIsCopiedInviteLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'play' | 'library' | 'saves' | 'netplay'>('library');

  // Netplay Waiting Room State Machine ('idle' | 'host_waiting' | 'joiner_waiting')
  const [netplayWaitingState, setNetplayWaitingState] = useState<'idle' | 'host_waiting' | 'joiner_waiting'>('idle');
  const [netplayRoomStatus, setNetplayRoomStatus] = useState<any>(null);
  const [isJoinerReady, setIsJoinerReady] = useState<boolean>(false);
  const [isStartingHost, setIsStartingHost] = useState<boolean>(false);
  const [isPreloadingRom, setIsPreloadingRom] = useState<boolean>(false);
  const preloadedBlobUrlRef = useRef<string | null>(null);
  const [waitingGame, setWaitingGame] = useState<{
    romUrl: string;
    title: string;
    core: string;
    id?: string;
    coverArt?: string;
  } | null>(null);
  const waitingPollTimerRef = useRef<any>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const activeBlobUrlRef = useRef<string | null>(null);
  const stateFileInputRef = useRef<HTMLInputElement>(null);
  const [stateActionStatus, setStateActionStatus] = useState<string | null>(null);

  // Admin and Card Interactive States
  const [editingDescGame, setEditingDescGame] = useState<GameItem | null>(null);
  const [activeShareCardId, setActiveShareCardId] = useState<string | null>(null);
  const [uploadingCoverGameId, setUploadingCoverGameId] = useState<string | null>(null);
  const [coverUploadStatus, setCoverUploadStatus] = useState<string | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const coverTargetGameRef = useRef<GameItem | null>(null);

  const triggerCoverUpload = (game: GameItem) => {
    coverTargetGameRef.current = game;
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = '';
      coverFileInputRef.current.click();
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetGame = coverTargetGameRef.current;
    if (!file || !targetGame) return;

    if (!file.type.startsWith('image/')) {
      setCoverUploadStatus('Vui lòng chọn file hình ảnh (PNG, JPG, WEBP)!');
      setTimeout(() => setCoverUploadStatus(null), 3500);
      return;
    }

    setUploadingCoverGameId(targetGame.id);
    setCoverUploadStatus(`Đang upload ảnh bìa cho "${targetGame.title}" lên Vercel Blob...`);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const base64Data = evt.target?.result as string;
        if (!base64Data) {
          setUploadingCoverGameId(null);
          setCoverUploadStatus('Lỗi đọc file ảnh.');
          setTimeout(() => setCoverUploadStatus(null), 3000);
          return;
        }

        try {
          const res = await fetch('/api/admin/games/update-cover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: targetGame.id,
              title: targetGame.title,
              fileData: base64Data,
              fallbackGame: targetGame
            })
          });

          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Lỗi khi upload ảnh bìa lên máy chủ');
          }

          const newCoverUrl = data.coverArt || data.url || base64Data;

          // Update SNES games list
          setSnesGames(prev => prev.map(g => g.id === targetGame.id ? { ...g, coverArt: newCoverUrl } : g));

          // Update Standby game if active
          setStandbyGame(prev => prev && prev.id === targetGame.id ? { ...prev, coverArt: newCoverUrl } : prev);

          setCoverUploadStatus(`✅ Đã cập nhật ảnh bìa mới cho "${targetGame.title}" thành công!`);
          window.dispatchEvent(new CustomEvent('qgx_games_updated'));
          setTimeout(() => setCoverUploadStatus(null), 4000);
        } catch (uploadErr: any) {
          console.error('Lỗi upload cover:', uploadErr);
          setCoverUploadStatus(`⚠️ ${uploadErr.message || 'Lỗi khi cập nhật ảnh bìa'}`);
          setTimeout(() => setCoverUploadStatus(null), 4000);
        } finally {
          setUploadingCoverGameId(null);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error('Lỗi đọc file:', err);
      setUploadingCoverGameId(null);
      setCoverUploadStatus(`⚠️ ${err.message || 'Lỗi xử lý file'}`);
      setTimeout(() => setCoverUploadStatus(null), 3000);
    }
  };

  // Listen for state export / import message responses from iframe
  useEffect(() => {
    const handleStateMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'QGX_EXPORT_STATE_SUCCESS' && e.data.stateData) {
        try {
          const uint8 = new Uint8Array(e.data.stateData);
          const blob = new Blob([uint8], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const safeName = (currentRomName || 'game').replace(/[^a-zA-Z0-9_-]+/g, '_');
          a.href = url;
          a.download = `${safeName}_save_${Date.now()}.state`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setStateActionStatus('Đã xuất file .state thành công!');
          setTimeout(() => setStateActionStatus(null), 3000);
        } catch (err) {
          console.error('Lỗi tải file state:', err);
        }
      } else if (e.data.type === 'QGX_IMPORT_STATE_SUCCESS') {
        setStateActionStatus('Đã nạp file .state thành công!');
        setTimeout(() => setStateActionStatus(null), 3000);
      } else if (e.data.type === 'QGX_STATE_ERROR') {
        setStateActionStatus(e.data.error || 'Lỗi khi xử lý save state');
        setTimeout(() => setStateActionStatus(null), 3000);
      }
    };

    window.addEventListener('message', handleStateMessage);
    return () => window.removeEventListener('message', handleStateMessage);
  }, [currentRomName]);

  const loadSnesGames = async () => {
    try {
      const res = await fetch('/api/games/admin-library');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.games) && data.games.length > 0) {
          // Merge uploaded games with default games, removing duplicates by id or romUrl
          const uploadedSnes = data.games.filter((g: any) => 
            !g.isHidden && (g.emulatorCore === 'snes' || g.system === 'snes' || g.genres?.includes('SNES') || g.genres?.includes('Super Nintendo (SNES)'))
          );
          
          const combined = [...uploadedSnes];
          DEFAULT_SNES_TEST_GAMES.forEach(defaultGame => {
            if (!combined.some(g => g.id === defaultGame.id || g.romUrl === defaultGame.romUrl)) {
              combined.push(defaultGame);
            }
          });
          setSnesGames(combined);
          return;
        }
      }
    } catch (err) {
      console.warn("Load Vercel Blob library error, using defaults:", err);
    }
    setSnesGames(DEFAULT_SNES_TEST_GAMES);
  };

  // Fetch SNES Games on mount & listen to updates
  useEffect(() => {
    loadSnesGames();

    const handleUpdate = () => {
      loadSnesGames();
    };

    window.addEventListener('qgx_games_updated', handleUpdate);
    return () => {
      window.removeEventListener('qgx_games_updated', handleUpdate);
    };
  }, []);

  // Auto detect core from filename
  const detectCoreFromFilename = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.snes') || lower.endsWith('.smc') || lower.endsWith('.sfc')) return 'snes';
    if (lower.endsWith('.nes')) return 'nes';
    if (lower.endsWith('.gba')) return 'gba';
    if (lower.endsWith('.gbc') || lower.endsWith('.gb')) return 'gbc';
    if (lower.endsWith('.n64') || lower.endsWith('.z64') || lower.endsWith('.v64')) return 'n64';
    if (lower.endsWith('.nds')) return 'nds';
    if (lower.endsWith('.md') || lower.endsWith('.smd') || lower.endsWith('.gen')) return 'segaMD';
    if (lower.endsWith('.iso') || lower.endsWith('.cue') || lower.endsWith('.chd')) return 'psx';
    return selectedCore;
  };

  const autoLoadedKeyRef = useRef<string>('');
  const isNetplayInitializingRef = useRef<boolean>(false);
  const netplaySessionRef = useRef<{ isNetplay: boolean; room: string; role: 'p1' | 'p2'; gameId?: string } | null>(null);

  // Complete and thorough teardown of active emulator session
  const terminateActiveEmulator = () => {
    console.log('🛑 [Emulator Teardown] Terminating active game session, destroying canvas & stopping audio...');

    // 1. Post message to iframe & clear iframe before removal to stop WebAudio/WebGL
    if (playerContainerRef.current) {
      const iframe = playerContainerRef.current.querySelector('iframe');
      if (iframe) {
        try {
          iframe.contentWindow?.postMessage('QGX_TEARDOWN_EMULATOR', '*');
        } catch (e) {}
        try {
          iframe.src = 'about:blank';
        } catch (e) {}
      }
    }

    // 2. Revoke any Blob Object URLs to prevent RAM leaks
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(activeBlobUrlRef.current);
      } catch (e) {}
      activeBlobUrlRef.current = null;
    }

    // 3. Reset internal React states
    setIsPlaying(false);
    setCurrentRomUrl(null);
    setCurrentRomName('');
    setCurrentGameId(null);
    setIsLoadingRom(false);
    setRomError(null);
    setActiveTab('library');
    setUploadFileName(null);
    setIsNetplayActive(false);
    setNetplayRoom('');
    setNetplayRole('p1');
    setNetplayWaitingState('idle');
    setNetplayRoomStatus(null);
    setIsJoinerReady(false);
    setIsStartingHost(false);
    setIsPreloadingRom(false);
    setWaitingGame(null);
    if (preloadedBlobUrlRef.current && preloadedBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(preloadedBlobUrlRef.current); } catch (e) {}
      preloadedBlobUrlRef.current = null;
    }
    if (waitingPollTimerRef.current) {
      clearInterval(waitingPollTimerRef.current);
      waitingPollTimerRef.current = null;
    }
    isNetplayInitializingRef.current = false;
    netplaySessionRef.current = null;
    autoLoadedKeyRef.current = '';

    // 4. Update global flags
    if (typeof window !== 'undefined') {
      window.__QGX_IS_PLAYING_EMULATOR__ = false;
      window.dispatchEvent(new CustomEvent('qgx_emulator_state_changed', { detail: { isPlaying: false } }));

      // Restore URL to clean root if it had game_id or netplay params
      if (window.location.search.includes('game_id=') || window.location.search.includes('netplay_room=') || window.location.search.includes('room_id=')) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Select a game for Standby / Idle Mode (Clean teardown of previous session, ready with 'CHƠI NGAY' button)
  const selectStandbyGame = (game: {
    id?: string;
    title: string;
    subtitle?: string;
    romUrl: string;
    core?: string;
    coverArt?: string;
    backdropArt?: string;
    fileSize?: string;
    hasVietHoa?: boolean;
    description?: string;
  }) => {
    console.log(`🎮 [Select Standby Game] Selected: ${game.title} (Core: ${game.core || 'snes'}). Entering Ready state...`);

    // 1. If currently playing a game, cleanly tear down active emulator instance
    if (playerContainerRef.current) {
      const iframe = playerContainerRef.current.querySelector('iframe');
      if (iframe) {
        try { iframe.contentWindow?.postMessage('QGX_TEARDOWN_EMULATOR', '*'); } catch (e) {}
        try { iframe.src = 'about:blank'; } catch (e) {}
      }
    }
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(activeBlobUrlRef.current); } catch (e) {}
      activeBlobUrlRef.current = null;
    }

    // 2. Reset playing & error states
    setIsPlaying(false);
    setIsLoadingRom(false);
    setRomError(null);
    setCurrentRomUrl(null);
    setIsNetplayActive(false);
    setNetplayWaitingState('idle');

    // 3. Set standby game information
    const resolvedCore = game.core || 'snes';
    setStandbyGame({
      id: game.id,
      title: game.title,
      subtitle: game.subtitle,
      romUrl: game.romUrl,
      core: resolvedCore,
      coverArt: game.coverArt,
      backdropArt: game.backdropArt,
      fileSize: game.fileSize,
      hasVietHoa: game.hasVietHoa,
      description: game.description
    });
    setCurrentGameId(game.id || null);
    setCurrentRomName(game.title);
    setSelectedCore(resolvedCore);
    setActiveTab('play');

    if (typeof window !== 'undefined') {
      window.__QGX_IS_PLAYING_EMULATOR__ = false;
      window.dispatchEvent(new CustomEvent('qgx_emulator_state_changed', { detail: { isPlaying: false } }));

      if (game.id) {
        const targetUrl = `/?game_id=${encodeURIComponent(game.id)}`;
        if (window.location.search !== `?game_id=${encodeURIComponent(game.id)}`) {
          window.history.pushState({ gameId: game.id, isEmulator: true }, '', targetUrl);
        }
      }
    }

    // 4. Smooth scroll to emulator container
    setTimeout(() => {
      if (playerContainerRef.current) {
        playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const zone = document.getElementById('emulator-zone');
        zone?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  // Helper to preload ROM binary in background without mounting emulator iframe
  const preloadRomBackground = async (romUrl: string) => {
    if (!romUrl || romUrl.trim().length === 0) return null;
    try {
      setIsPreloadingRom(true);
      const cleanUrl = normalizeRomUrl(romUrl);
      console.log(`[ROM Preloader] Pre-fetching binary in background: ${cleanUrl}`);
      const { blobUrl } = await fetchRomAsBlobUrl(cleanUrl);
      preloadedBlobUrlRef.current = blobUrl;
      console.log(`[ROM Preloader] ROM binary successfully pre-cached:`, blobUrl);
      setIsPreloadingRom(false);
      return blobUrl;
    } catch (err) {
      console.warn(`[ROM Preloader Warning] Could not preload ROM:`, err);
      setIsPreloadingRom(false);
      return null;
    }
  };

  // Start hosting a Netplay session (2-Step Waiting Room: Host P1)
  const startHostingNetplay = async (game: { romUrl: string; title: string; core?: string; id?: string; coverArt?: string }, customRoom?: string) => {
    const rawRoom = customRoom?.trim() || netplayRoom.trim() || ('qgx-' + Math.random().toString(36).substring(2, 8));
    const room = rawRoom.toLowerCase();
    
    // Teardown any running emulator before opening waiting room
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(activeBlobUrlRef.current); } catch (e) {}
      activeBlobUrlRef.current = null;
    }
    if (preloadedBlobUrlRef.current && preloadedBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(preloadedBlobUrlRef.current); } catch (e) {}
      preloadedBlobUrlRef.current = null;
    }

    setNetplayRoom(room);
    setNetplayRole('p1');
    setIsNetplayActive(true);
    setCurrentGameId(game.id || null);
    setCurrentRomName(game.title);
    setSelectedCore(game.core || 'snes');
    setWaitingGame({
      romUrl: game.romUrl,
      title: game.title,
      core: game.core || 'snes',
      id: game.id,
      coverArt: game.coverArt
    });
    setNetplayWaitingState('host_waiting');
    setNetplayRoomStatus({
      roomId: room,
      p1Ready: true,
      p2Joined: false,
      p2Ready: false,
      started: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setIsStartingHost(false);
    setActiveTab('play');
    setIsPlaying(false);
    setCurrentRomUrl(null);
    setRomError(null);
    setIsLoadingRom(false);

    // Update browser URL for P1 Host
    if (typeof window !== 'undefined' && game.id) {
      const targetUrl = `/?game_id=${encodeURIComponent(game.id)}&netplay_room=${encodeURIComponent(room)}&role=p1&netplay=true`;
      window.history.pushState({ gameId: game.id, isEmulator: true, isNetplay: true, room, role: 'p1' }, '', targetUrl);
    }

    // Scroll to player area
    setTimeout(() => {
      if (playerContainerRef.current) {
        playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // 1. Preload ROM binary in background immediately
    preloadRomBackground(game.romUrl);

    // 2. Register room on server / Vercel Blob
    try {
      console.log(`[Netplay Host] 👑 Calling POST /api/netplay/create-room for room="${room}"...`);
      const res = await fetch('/api/netplay/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room, gameId: game.id })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Netplay Host] ✅ Create-room response:`, data);
        if (data.status) setNetplayRoomStatus(data.status);
      } else {
        console.error(`[Netplay Host] ❌ Create-room failed: HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('[Netplay Create Room API Warning]:', err);
    }
  };

  // Join a Netplay session (2-Step Waiting Room: Joiner P2)
  const startJoinerNetplay = async (game: { romUrl: string; title: string; core?: string; id?: string; coverArt?: string }, room: string) => {
    const cleanRoom = room.trim().toLowerCase();
    
    // Teardown any running emulator before opening waiting room
    if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(activeBlobUrlRef.current); } catch (e) {}
      activeBlobUrlRef.current = null;
    }
    if (preloadedBlobUrlRef.current && preloadedBlobUrlRef.current.startsWith('blob:')) {
      try { URL.revokeObjectURL(preloadedBlobUrlRef.current); } catch (e) {}
      preloadedBlobUrlRef.current = null;
    }

    setNetplayRoom(cleanRoom);
    setNetplayRole('p2');
    setIsNetplayActive(true);
    setCurrentGameId(game.id || null);
    setCurrentRomName(game.title);
    setSelectedCore(game.core || 'snes');
    setWaitingGame({
      romUrl: game.romUrl,
      title: game.title,
      core: game.core || 'snes',
      id: game.id,
      coverArt: game.coverArt
    });
    setNetplayWaitingState('joiner_waiting');
    setIsJoinerReady(false);
    setNetplayRoomStatus({
      roomId: cleanRoom,
      p1Ready: true,
      p2Joined: true,
      p2Ready: false,
      started: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    setActiveTab('play');
    setIsPlaying(false);
    setCurrentRomUrl(null);
    setRomError(null);
    setIsLoadingRom(false);

    // Scroll to player area
    setTimeout(() => {
      if (playerContainerRef.current) {
        playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);

    // 1. Preload ROM binary in background immediately
    preloadRomBackground(game.romUrl);

    // 2. Notify server that P2 joined
    try {
      console.log(`[Netplay Joiner] 🎮 Calling POST /api/netplay/join-room for room="${cleanRoom}"...`);
      const res = await fetch('/api/netplay/join-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: cleanRoom })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Netplay Joiner] ✅ Join-room response:`, data);
        if (data.status) setNetplayRoomStatus(data.status);
      } else {
        console.error(`[Netplay Joiner] ❌ Join-room failed: HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('[Netplay Join Room API Warning]:', err);
    }
  };

  // Joiner clicks "Sẵn Sàng" button
  const handleJoinerSetReady = async () => {
    if (!netplayRoom) return;
    const cleanRoom = netplayRoom.trim().toLowerCase();
    setIsJoinerReady(true);
    console.log(`[Netplay Joiner] 🚀 Calling POST /api/netplay/set-ready for room="${cleanRoom}" (role: p2)...`);
    try {
      const res = await fetch('/api/netplay/set-ready', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: cleanRoom, role: 'p2' })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Netplay Joiner] ✅ Set-ready response received:`, data);
        if (data.status) setNetplayRoomStatus(data.status);
      } else {
        console.error(`[Netplay Joiner] ❌ Set-ready failed with HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn('[Netplay Set Ready API Warning]:', err);
    }
  };

  // Host clicks "Bắt Đầu Chơi" button
  const handleHostStartGame = async () => {
    if (!netplayRoom || !waitingGame || isStartingHost) return;
    const cleanRoom = netplayRoom.trim().toLowerCase();
    setIsStartingHost(true);
    console.log(`[Netplay Host] 🚀 Calling POST /api/netplay/start-room for room="${cleanRoom}"...`);
    try {
      const res = await fetch('/api/netplay/start-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: cleanRoom })
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Netplay Host] ✅ Start-room response:`, data);
      }
    } catch (err) {
      console.warn('[Netplay Start Room API Warning]:', err);
    }

    setNetplayWaitingState('idle');
    const targetRom = preloadedBlobUrlRef.current || waitingGame.romUrl;
    launchRom(
      targetRom,
      waitingGame.title,
      waitingGame.core,
      waitingGame.id,
      { isNetplay: true, room: cleanRoom, role: 'p1' }
    );
  };

  // Cancel / Exit Netplay waiting room & cleanup Blob storage
  const handleCancelNetplayRoom = async () => {
    const roomToCancel = (netplayRoom || '').trim().toLowerCase();
    if (roomToCancel) {
      try {
        fetch('/api/netplay/delete-room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ room: roomToCancel })
        }).catch(() => {});
      } catch (e) {}
    }
    terminateActiveEmulator();
  };

  // 2-Step Waiting Room Polling Effect (Every 2 seconds)
  useEffect(() => {
    if (netplayWaitingState === 'idle' || !netplayRoom || !waitingGame) {
      if (waitingPollTimerRef.current) {
        clearInterval(waitingPollTimerRef.current);
        waitingPollTimerRef.current = null;
      }
      return;
    }

    const cleanRoom = netplayRoom.trim().toLowerCase();

    const pollRoomStatus = async () => {
      try {
        console.log(`[Netplay Poll Request] 📡 Polling GET /api/netplay/room-status for room="${cleanRoom}" (Role: ${netplayRole}, State: ${netplayWaitingState})...`);
        const res = await fetch(`/api/netplay/room-status?room=${encodeURIComponent(cleanRoom)}&t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[Netplay Poll Response] 📥 Room status received for [${cleanRoom}]:`, data);
          if (data.success && data.status) {
            console.log(`[Netplay Poll Status Check] Room [${cleanRoom}] -> p1Ready: ${data.status.p1Ready}, p2Joined: ${data.status.p2Joined}, p2Ready: ${data.status.p2Ready}, started: ${data.status.started}`);
            setNetplayRoomStatus(data.status);

            // Joiner watches for Host starting the game
            if (netplayWaitingState === 'joiner_waiting' && data.status.started) {
              console.log(`🚀 [Netplay Joiner] Room [${cleanRoom}] has started! Launching core immediately with preloaded ROM...`);
              if (waitingPollTimerRef.current) {
                clearInterval(waitingPollTimerRef.current);
                waitingPollTimerRef.current = null;
              }
              setNetplayWaitingState('idle');
              const targetRom = preloadedBlobUrlRef.current || waitingGame.romUrl;
              launchRom(
                targetRom,
                waitingGame.title,
                waitingGame.core,
                waitingGame.id,
                { isNetplay: true, room: cleanRoom, role: 'p2' }
              );
            }
          }
        } else {
          console.warn(`[Netplay Poll Warning] HTTP ${res.status} when polling room status for ${cleanRoom}`);
        }
      } catch (err) {
        console.warn('[Netplay Poll Warning]:', err);
      }
    };

    pollRoomStatus();
    const interval = setInterval(pollRoomStatus, 2000);
    waitingPollTimerRef.current = interval;

    return () => {
      console.log(`[Netplay Poll Cleanup] Cleaning polling interval for room="${cleanRoom}"`);
      clearInterval(interval);
      waitingPollTimerRef.current = null;
    };
  }, [netplayWaitingState, netplayRoom, waitingGame?.romUrl, waitingGame?.title, waitingGame?.core, waitingGame?.id]);

  // Sync global state and register global teardown method & event
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__QGX_IS_PLAYING_EMULATOR__ = isPlaying;
      window.__QGX_STOP_EMULATOR__ = terminateActiveEmulator;
      window.dispatchEvent(new CustomEvent('qgx_emulator_state_changed', { detail: { isPlaying } }));
    }
  }, [isPlaying]);

  // Listen for global stop command
  useEffect(() => {
    const handleGlobalStop = () => {
      terminateActiveEmulator();
    };

    window.addEventListener('qgx_stop_emulator', handleGlobalStop);
    return () => {
      window.removeEventListener('qgx_stop_emulator', handleGlobalStop);
    };
  }, []);

  // Clean up object URLs and active sessions on unmount
  useEffect(() => {
    return () => {
      if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(activeBlobUrlRef.current);
        } catch (e) {}
      }
      if (typeof window !== 'undefined') {
        window.__QGX_IS_PLAYING_EMULATOR__ = false;
      }
    };
  }, []);

  // Reset or Reconnect active game without losing Netplay room or role
  const handleResetCurrentGame = () => {
    const targetRom = activeBlobUrlRef.current || currentRomUrl || '';
    if (!targetRom && !currentGameId) return;

    const currentNetplay = (isNetplayActive || isNetplayInitializingRef.current) && netplayRoom.trim() ? {
      isNetplay: true,
      room: netplayRoom.trim(),
      role: netplayRole
    } : undefined;

    console.log('[Reset Game] Re-initializing emulator with config:', {
      gameName: currentRomName,
      core: selectedCore,
      gameId: currentGameId,
      netplay: currentNetplay
    });

    launchRom(
      targetRom,
      currentRomName || 'SNES Game',
      selectedCore || 'snes',
      currentGameId || undefined,
      currentNetplay
    );
  };

  // Launch ROM directly into EmulatorJS Engine with strict Async/Await & simultaneous Netplay configuration
  const launchRom = async (
    romUrl: string, 
    gameName: string, 
    core: string = 'snes', 
    gameId?: string,
    netplayOpts?: { isNetplay?: boolean; room?: string; role?: 'p1' | 'p2' }
  ) => {
    if (!romUrl || romUrl.trim().length === 0) {
      setRomError({
        title: "Không Có File ROM",
        message: `Game "${gameName}" chưa có đường dẫn romUrl trong cơ sở dữ liệu.`,
        hint: "Vui lòng upload file ROM lên Vercel Blob Storage để kích hoạt chơi trực tiếp."
      });
      return;
    }

    const isNetplay = Boolean(netplayOpts?.isNetplay || (netplayOpts?.room && netplayOpts.room.trim().length > 0));
    const room = (netplayOpts?.room || netplayRoom || '').trim();
    const role = netplayOpts?.role || netplayRole || 'p2';

    // 1. Enter strict loading state & unmount any previous iframe
    setIsLoadingRom(true);
    setIsPlaying(false);
    setCurrentRomUrl(null);
    setRomError(null);
    setLoadingStepText(isNetplay ? `Đang chuẩn bị kết nối Netplay phòng [${room}] cho ${gameName}...` : `Đang kết nối tải ROM cho ${gameName}...`);
    setActiveTab('play');

    if (gameId) {
      setCurrentGameId(gameId);
    }

    // 2. Synchronously lock and update Netplay state before starting async fetch
    if (isNetplay && room) {
      isNetplayInitializingRef.current = true;
      setIsNetplayActive(true);
      setNetplayRoom(room);
      setNetplayRole(role);
      netplaySessionRef.current = { isNetplay: true, room, role, gameId };
    } else {
      isNetplayInitializingRef.current = false;
      setIsNetplayActive(false);
      netplaySessionRef.current = null;
    }

    // Synchronize browser URL to /?game_id=[id_game] (&netplay_room=...)
    if (typeof window !== 'undefined' && gameId) {
      let targetUrl = `/?game_id=${encodeURIComponent(gameId)}`;
      if (isNetplay && room) {
        targetUrl += `&netplay_room=${encodeURIComponent(room)}&room_id=${encodeURIComponent(room)}&role=${role}&netplay=true`;
      }
      if (window.location.search !== targetUrl.replace(/^\//, '')) {
        window.history.pushState({ gameId, isEmulator: true, isNetplay, room, role }, '', targetUrl);
      }
    }

    if (playerContainerRef.current) {
      playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    try {
      const cleanUrl = normalizeRomUrl(romUrl);

      // Clean up previous blob URL if different
      if (activeBlobUrlRef.current && activeBlobUrlRef.current.startsWith('blob:') && activeBlobUrlRef.current !== cleanUrl) {
        try {
          URL.revokeObjectURL(activeBlobUrlRef.current);
        } catch (e) {}
      }

      // 3. Await 100% binary download and packaging into application/octet-stream Blob ObjectURL
      const { blobUrl, sizeBytes } = await fetchRomAsBlobUrl(cleanUrl, (step) => {
        setLoadingStepText(step);
      });

      if (blobUrl.startsWith('blob:')) {
        activeBlobUrlRef.current = blobUrl;
      }

      setLoadingStepText(
        isNetplay 
          ? `Khởi động nhân Netplay ${core.toUpperCase()} (${role === 'p1' ? 'Host P1' : 'Joiner P2'} - Phòng ${room})...`
          : `Khởi động lõi giả lập ${core.toUpperCase()} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)...`
      );

      // 4. ONLY AFTER BLOB OBJECT URL IS CREATED: Set URL and trigger iframe compilation
      setCurrentRomUrl(blobUrl);
      setCurrentRomName(gameName);
      setSelectedCore(core);
      setIsPlaying(true);
      setIsLoadingRom(false);
      isNetplayInitializingRef.current = false;
    } catch (err: any) {
      console.error("[Launch ROM Error]:", err);
      setRomError({
        title: isNetplay ? "Lỗi Khởi Tạo Netplay ROM" : "Lỗi Nạp File ROM",
        message: err.message || "Không thể nạp ROM vào bộ nhớ trình giả lập.",
        hint: isNetplay 
          ? "Kiểm tra kết nối mạng và đảm bảo ROM của Chủ phòng (P1) và Khách (P2) có thể truy cập qua Vercel Blob."
          : "Hãy thử tải lại trang hoặc nạp ROM trực tiếp từ máy tính.",
        originalUrl: romUrl
      });
      setIsLoadingRom(false);
      setIsPlaying(false);
      isNetplayInitializingRef.current = false;
    }
  };

  // Feature 1: Deep Linking & Auto Load Game from URL on mount & popstate with Single-Player Lock Guard
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndAutoLoadFromUrl = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlGameId = searchParams.get('game_id') || searchParams.get('game');
      const urlNetplayRoom = (searchParams.get('netplay_room') || searchParams.get('room_id') || searchParams.get('room') || '').trim().toLowerCase();
      const isNetplayFlag = searchParams.get('netplay') === 'true' || Boolean(urlNetplayRoom);
      const urlRole = (searchParams.get('role') as 'p1' | 'p2') || (searchParams.get('is_p2') === 'true' ? 'p2' : (urlNetplayRoom ? 'p2' : 'p1'));

      // Check if this exact session was already triggered to prevent duplicate race calls on snesGames update
      const loadKey = `${urlGameId || ''}_${urlNetplayRoom}_${urlRole}_${isNetplayFlag}`;
      if (autoLoadedKeyRef.current === loadKey && (isPlaying || isLoadingRom)) {
        return;
      }

      // Netplay P2 / Joiner flow
      if (isNetplayFlag && urlNetplayRoom) {
        console.log(`[Netplay AutoLoad] Detected Netplay Room="${urlNetplayRoom}", Role="${urlRole}", GameId="${urlGameId}"`);
        setNetplayRoom(urlNetplayRoom);
        setIsNetplayActive(true);
        setNetplayRole(urlRole);
        setActiveTab('play');
        isNetplayInitializingRef.current = true;
      }

      if (urlGameId) {
        // Collect all available retro games to search
        const allCandidates = [
          ...snesGames,
          ...CLASSIC_PRESET_ROMS.map(presetRomToGameItem),
          ...DEFAULT_SNES_TEST_GAMES
        ];

        const lowerTarget = urlGameId.toLowerCase().trim();
        const matchedGame = allCandidates.find((g) => {
          if (g.id.toLowerCase() === lowerTarget) return true;
          if (encodeURIComponent(g.id).toLowerCase() === lowerTarget) return true;
          const slug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return slug === lowerTarget;
        });

        if (matchedGame && matchedGame.romUrl) {
          // SINGLE PLAYER LOCK GUARD: If Netplay is currently active or initializing, do not let generic single player overwrite it!
          if (!isNetplayFlag && (isNetplayActive || isNetplayInitializingRef.current)) {
            console.warn("[Single Player Blocked] Ignoring single player auto-load because Netplay session is active.");
            return;
          }

          autoLoadedKeyRef.current = loadKey;
          console.log(`[Deep Linking] Auto loading: ${matchedGame.title} (Netplay: ${isNetplayFlag ? `Room ${urlNetplayRoom} / ${urlRole}` : 'Single-Player'})`);
          
          if (isNetplayFlag && urlNetplayRoom) {
            if (urlRole === 'p2') {
              startJoinerNetplay({
                romUrl: matchedGame.romUrl,
                title: matchedGame.title,
                core: matchedGame.emulatorCore || 'snes',
                id: matchedGame.id,
                coverArt: matchedGame.coverArt
              }, urlNetplayRoom);
            } else {
              startHostingNetplay({
                romUrl: matchedGame.romUrl,
                title: matchedGame.title,
                core: matchedGame.emulatorCore || 'snes',
                id: matchedGame.id,
                coverArt: matchedGame.coverArt
              }, urlNetplayRoom);
            }
          } else {
            selectStandbyGame({
              romUrl: matchedGame.romUrl,
              title: matchedGame.title,
              subtitle: matchedGame.subtitle,
              core: matchedGame.emulatorCore || 'snes',
              id: matchedGame.id,
              coverArt: matchedGame.coverArt,
              backdropArt: matchedGame.backdropArt,
              description: matchedGame.description || matchedGame.subtitle,
              hasVietHoa: matchedGame.hasVietHoa,
              fileSize: matchedGame.fileSize
            });
          }
        }
      }
    };

    checkAndAutoLoadFromUrl();

    window.addEventListener('popstate', checkAndAutoLoadFromUrl);
    return () => {
      window.removeEventListener('popstate', checkAndAutoLoadFromUrl);
    };
  }, [snesGames]);

  // Global Event Listener for game selection & launch commands from other components
  useEffect(() => {
    const handleLaunchEvent = (e: any) => {
      const {
        romUrl,
        title,
        subtitle,
        core,
        gameId,
        isNetplay,
        room,
        role,
        coverArt,
        backdropArt,
        description,
        hasVietHoa,
        fileSize,
        forceAutoStart
      } = e.detail || {};

      if (romUrl) {
        // If current session is active Netplay, route to 2-step waiting room
        const shouldNetplay = isNetplay || ((isNetplayActive || isNetplayInitializingRef.current) && Boolean(netplayRoom));
        const effectiveRoom = (room || netplayRoom || '').trim();
        const effectiveRole = role || netplayRole || 'p2';

        if (shouldNetplay && effectiveRoom) {
          if (effectiveRole === 'p2') {
            startJoinerNetplay({ romUrl, title, core: core || 'snes', id: gameId, coverArt }, effectiveRoom);
          } else {
            startHostingNetplay({ romUrl, title, core: core || 'snes', id: gameId, coverArt }, effectiveRoom);
          }
        } else if (forceAutoStart) {
          launchRom(
            romUrl, 
            title, 
            core || 'snes', 
            gameId
          );
        } else {
          selectStandbyGame({
            romUrl,
            title,
            subtitle,
            core: core || 'snes',
            id: gameId,
            coverArt,
            backdropArt,
            description,
            hasVietHoa,
            fileSize
          });
        }
      }
    };

    window.addEventListener('qgx_launch_game', handleLaunchEvent);
    window.addEventListener('qgx_select_game_for_emulator', handleLaunchEvent);
    return () => {
      window.removeEventListener('qgx_launch_game', handleLaunchEvent);
      window.removeEventListener('qgx_select_game_for_emulator', handleLaunchEvent);
    };
  }, [isNetplayActive, netplayRoom, netplayRole]);

  // Handle local File ROM upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const detectedCore = detectCoreFromFilename(file.name);
    const objectUrl = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, "");

    setUploadFileName(file.name);
    launchRom(objectUrl, cleanName, detectedCore);
  };

  // Generate isolated clean HTML for iframe with default controls and state export/import
  const iframeSrcDoc = useMemo(() => {
    if (!isPlaying || !currentRomUrl) return '';

    const effectiveRomUrl = normalizeRomUrl(currentRomUrl);
    const resolvedCore = resolveEmulatorCore(selectedCore || 'snes');
    const safeGameId = currentGameId || (currentRomName ? currentRomName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'qgx-snes-game');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentRomName || 'Retro Game'}</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: #000;
      overflow: hidden;
    }
    #ejs-game-container {
      width: 100%;
      height: 100%;
      display: block;
      position: relative;
    }
    #ejs-game-container canvas {
      width: 100% !important;
      height: 100% !important;
      display: block !important;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div id="ejs-game-container"></div>
  <script>
    // 1. Core Configuration - Injected synchronously before loader.js
    window.EJS_player = '#ejs-game-container';
    window.EJS_core = ${JSON.stringify(resolvedCore)};
    window.EJS_gameName = ${JSON.stringify(currentRomName || 'Quán Game Xóm SNES ROM')};
    window.EJS_gameUrl = ${JSON.stringify(effectiveRomUrl)};
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_color = '#f59e0b';
    ${isNetplayActive && netplayRoom.trim() ? `
    // 2. Netplay Simultaneous Boot Config (Host P1 & Joiner P2 Synchronization)
    window.EJS_netplay = true;
    window.EJS_netplayUrl = 'wss://netplay.emulatorjs.org';
    window.EJS_room = ${JSON.stringify(netplayRoom.trim())};
    window.EJS_gameId = ${JSON.stringify(safeGameId)};
    window.EJS_playerName = ${JSON.stringify(netplayRole === 'p1' ? 'Chủ Phòng (P1)' : 'Khách Tham Gia (P2)')};
    window.EJS_playerNumber = ${netplayRole === 'p1' ? 1 : 2};
    ` : ''}

    // 3. Message Listeners for State Export / Import and Teardown
    window.addEventListener("message", async function(e) {
      if (!e.data) return;
      
      if (e.data === "QGX_TEARDOWN_EMULATOR") {
        try {
          if (window.EJS_emulator && typeof window.EJS_emulator.destroy === "function") {
            window.EJS_emulator.destroy();
          } else if (window.EJS_emulator && typeof window.EJS_emulator.pause === "function") {
            window.EJS_emulator.pause();
          }
        } catch(err) {}
        try {
          var container = document.getElementById("ejs-game-container");
          if (container) container.innerHTML = "";
          document.body.innerHTML = "";
        } catch(err) {}
      } else if (e.data.type === "QGX_EXPORT_STATE") {
        try {
          if (window.EJS_emulator && typeof window.EJS_emulator.gameManager?.getState === "function") {
            const state = await window.EJS_emulator.gameManager.getState();
            window.parent.postMessage({ type: "QGX_EXPORT_STATE_SUCCESS", stateData: Array.from(state) }, "*");
          } else {
            window.parent.postMessage({ type: "QGX_STATE_ERROR", error: "Trình giả lập chưa sẵn sàng để xuất State" }, "*");
          }
        } catch(err) {
          window.parent.postMessage({ type: "QGX_STATE_ERROR", error: err.message || "Lỗi khi xuất save state" }, "*");
        }
      } else if (e.data.type === "QGX_IMPORT_STATE" && e.data.stateData) {
        try {
          if (window.EJS_emulator && typeof window.EJS_emulator.gameManager?.loadState === "function") {
            const uint8 = new Uint8Array(e.data.stateData);
            await window.EJS_emulator.gameManager.loadState(uint8);
            window.parent.postMessage({ type: "QGX_IMPORT_STATE_SUCCESS" }, "*");
          } else {
            window.parent.postMessage({ type: "QGX_STATE_ERROR", error: "Trình giả lập chưa sẵn sàng để nạp State" }, "*");
          }
        } catch(err) {
          window.parent.postMessage({ type: "QGX_STATE_ERROR", error: err.message || "Lỗi khi nạp save state" }, "*");
        }
      }
    });
  </script>
  <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
</body>
</html>`;
  }, [isPlaying, currentRomUrl, selectedCore, currentRomName, isNetplayActive, netplayRoom, netplayRole, currentGameId]);

  const handleCreateRoom = () => {
    const randomRoom = 'qgx-' + Math.random().toString(36).substring(2, 8).toLowerCase();
    setNetplayRoom(randomRoom);
    setNetplayRole('p1');
    setIsNetplayActive(true);
  };

  const handleCopyRoom = () => {
    if (!netplayRoom) return;
    const cleanRoom = netplayRoom.trim().toLowerCase();
    copyTextToClipboard(cleanRoom);
    setIsCopiedRoom(true);
    setTimeout(() => setIsCopiedRoom(false), 2000);
  };

  const handleCopyInviteLink = () => {
    const cleanRoom = (netplayRoom || 'qgx-room').trim().toLowerCase();
    const targetGame = waitingGame
      ? {
          id: waitingGame.id || currentGameId || 'qgx-game',
          title: waitingGame.title,
          coverArt: waitingGame.coverArt || '',
          platforms: ['Other'],
          language: 'Gốc / Tiếng Anh',
          hasVietHoa: false,
          fileSize: 'SNES ROM',
          description: waitingGame.title
        } as GameItem
      : (snesGames.find(g => g.id === currentGameId) || snesGames[0]);

    if (!targetGame) return;

    const shareUrl = getGameShareUrl(targetGame, {
      room: cleanRoom,
      role: 'p2'
    });

    console.log(`[Netplay Share] Generated Invite Link for P2: ${shareUrl}`);
    copyTextToClipboard(shareUrl);
    setIsCopiedInviteLink(true);
    setTimeout(() => setIsCopiedInviteLink(false), 2500);
  };

  return (
    <div id="emulator-zone" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-8 border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>TRÌNH GIẢ LẬP RETRO ONLINE • NETPLAY 2 NGƯỜI • VERCEL BLOB</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
              KHU VỰC <span className="text-amber-400 text-glow-amber">GIẢ LẬP GAME RETRO</span>
            </h1>
            <p className="text-xs sm:text-sm font-body text-slate-300 leading-relaxed">
              Chơi ngay game SNES & Retro kinh điển trực tiếp trên trình duyệt, hỗ trợ chơi Online 2 người (Netplay) cùng bạn bè qua liên kết chia sẻ tức thì!
            </p>
          </div>

          {/* Quick Action Load File & Admin Upload Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {canShowAdmin && (
              <button
                id="btn-open-admin-blob-modal"
                type="button"
                onClick={() => setIsAdminRomModalOpen(true)}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-white font-bold rounded-2xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                title="Upload file ROM lên Vercel Blob Storage và lấy URL công khai"
              >
                <Cloud className="w-4 h-4 text-amber-400" />
                <span>ADMIN UPLOAD BLOB</span>
              </button>
            )}

            <label
              id="btn-upload-local-rom"
              className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs font-mono uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-slate-950" />
              <span>TẢI ROM TỪ MÁY</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".nes,.snes,.smc,.sfc,.gba,.gbc,.gb,.n64,.z64,.v64,.nds,.md,.gen,.bin,.iso,.chd"
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2 mt-8 pt-6 border-t border-slate-800/80">
          <button
            id="tab-snes-library"
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Thư Viện ROM SNES & Retro</span>
          </button>

          <button
            id="tab-snes-play"
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'play'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Màn Hình Chơi Game {isPlaying ? `(Đang chạy)` : standbyGame ? `(Sẵn sàng)` : ''}</span>
          </button>

          <button
            id="tab-snes-saves"
            onClick={() => setActiveTab('saves')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saves'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>Tiến Trình & Save State</span>
          </button>

          <button
            id="tab-snes-netplay"
            onClick={() => setActiveTab('netplay')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'netplay'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Chơi Online (Netplay 2 Người)</span>
            {isNetplayActive && netplayRoom && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION CONTENT BASED ON ACTIVE TAB */}

      {/* TAB 1: PRESET ROM LIBRARY */}
      {activeTab === 'library' && (
        <div className="space-y-8">
          {/* 1. FEATURED SNES VERCEL BLOB GAMES */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-amber-500/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span>THƯ VIỆN GAME SNES (VERCEL BLOB)</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-black">
                      CHƠI NGAY
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tải ROM trực tiếp từ Vercel Blob Storage tốc độ cao — Nhấp chọn là chơi trực tiếp 60 FPS mượt mà!
                  </p>
                </div>
              </div>

              {canShowAdmin && (
                <div className="flex items-center gap-2.5">
                  <button
                    id="btn-snes-admin-upload"
                    type="button"
                    onClick={() => setIsAdminRomModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Upload ROM mới lên Vercel Blob"
                  >
                    <Cloud className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload ROM (Blob)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Grid of SNES Sheet Games */}
            {coverUploadStatus && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-mono flex items-center justify-between gap-2 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{coverUploadStatus}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCoverUploadStatus(null)}
                  className="text-amber-400 hover:text-white px-2 py-0.5 text-[10px] font-bold border border-amber-500/30 rounded"
                >
                  Đóng
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {snesGames.map((game) => (
                <div
                  key={game.id}
                  id={`card-snes-${game.id}`}
                  onClick={() => selectStandbyGame({
                    romUrl: game.romUrl || '',
                    title: game.title,
                    subtitle: game.subtitle,
                    core: 'snes',
                    id: game.id,
                    coverArt: game.coverArt,
                    backdropArt: game.backdropArt,
                    description: game.description || game.subtitle,
                    hasVietHoa: game.hasVietHoa,
                    fileSize: game.fileSize
                  })}
                  className={`group relative glass-card rounded-3xl overflow-visible border border-amber-500/40 hover:border-amber-400 transition-all duration-300 flex flex-col sm:flex-row shadow-2xl hover:shadow-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/30 cursor-pointer ${
                    activeShareCardId === game.id ? 'z-50 relative' : 'relative z-1'
                  }`}
                >
                  <div className="relative sm:w-2/5 aspect-[4/3] sm:aspect-auto rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={game.coverArt}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg border border-amber-400/60 text-xs font-mono font-black text-amber-300 flex items-center gap-1.5 z-10">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>SNES 16-BIT</span>
                    </div>

                    {/* Admin Change Cover Overlay Button */}
                    {canShowAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCoverUpload(game);
                        }}
                        title="Đổi ảnh bìa (Upload lên Vercel Blob)"
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/90 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/60 flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer z-20 backdrop-blur-md"
                      >
                        {uploadingCoverGameId === game.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                          Cloud ROM Direct
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {game.fileSize || 'SNES ROM'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors font-display">
                        {game.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-body line-clamp-2 mt-1.5 leading-relaxed">
                        {game.description || game.subtitle}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800 flex-wrap">
                      <button
                        id={`btn-play-snes-${game.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectStandbyGame({
                            romUrl: game.romUrl || '',
                            title: game.title,
                            subtitle: game.subtitle,
                            core: 'snes',
                            id: game.id,
                            coverArt: game.coverArt,
                            backdropArt: game.backdropArt,
                            description: game.description || game.subtitle,
                            hasVietHoa: game.hasVietHoa,
                            fileSize: game.fileSize
                          });
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>CHƠI NGAY</span>
                      </button>

                      <button
                        id={`btn-netplay-snes-${game.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          startHostingNetplay(
                            {
                              romUrl: game.romUrl || '',
                              title: game.title,
                              core: 'snes',
                              id: game.id,
                              coverArt: game.coverArt
                            }
                          );
                        }}
                        className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Tạo phòng chờ chơi 2 người trực tuyến qua mạng"
                      >
                        <Users className="w-4 h-4 text-cyan-400" />
                        <span className="hidden xs:inline">Netplay 2P</span>
                      </button>

                      {/* Admin Edit Description Button */}
                      {canShowAdmin && (
                        <button
                          id={`btn-edit-desc-snes-${game.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDescGame(game);
                          }}
                          className="py-2.5 px-2.5 bg-slate-900 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Sửa mô tả game (Lưu vào Vercel Blob)"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-[11px] hidden sm:inline">Mô tả</span>
                        </button>
                      )}

                      {/* Admin Change Cover Button */}
                      {canShowAdmin && (
                        <button
                          id={`btn-edit-cover-snes-${game.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerCoverUpload(game);
                          }}
                          disabled={uploadingCoverGameId === game.id}
                          className="py-2.5 px-2.5 bg-slate-900 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                          title="Đổi ảnh bìa game (Upload lên Vercel Blob)"
                        >
                          {uploadingCoverGameId === game.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          ) : (
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span className="text-[11px] hidden sm:inline">Ảnh bìa</span>
                        </button>
                      )}

                      <div onClick={(e) => e.stopPropagation()}>
                        <ShareGameMenu
                          game={game}
                          variant="compact"
                          align="right"
                          netplay={isNetplayActive && netplayRoom ? { room: netplayRoom, role: 'p2' } : undefined}
                          onOpenChange={(open) => setActiveShareCardId(open ? game.id : null)}
                        />
                      </div>

                      {canShowAdmin && game.downloadUrl && (
                        <a
                          href={game.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                          title="Mở link chia sẻ Google Drive (Admin Only)"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="sm:hidden">Tải ROM</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. ALL RETRO PRESET CORES & GAMES */}
          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>CÁC GAME MẪU KHÁC (NES, GBA, GBC)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chọn core và game mẫu để thử nghiệm trình giả lập Quán Game Xóm.
                </p>
              </div>

              {/* Core Selector Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Hệ máy mặc định:</span>
                <select
                  id="select-emulator-core"
                  value={selectedCore}
                  onChange={(e) => setSelectedCore(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {SYSTEM_CORES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid of Preset ROMs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CLASSIC_PRESET_ROMS.map((rom) => (
                <div
                  key={rom.id}
                  id={`card-preset-${rom.id}`}
                  onClick={() => selectStandbyGame({
                    romUrl: rom.romUrl,
                    title: rom.title,
                    core: rom.system,
                    id: rom.id,
                    coverArt: rom.coverArt,
                    description: rom.description,
                    fileSize: rom.systemName
                  })}
                  className="group glass-card rounded-2xl overflow-visible border border-slate-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer"
                >
                  <div className="relative aspect-[16/9] rounded-t-2xl overflow-hidden bg-slate-950">
                    <img
                      src={rom.coverArt}
                      alt={rom.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-slate-950/80 backdrop-blur-md rounded border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300">
                      {rom.systemName}
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {rom.title}
                      </h3>
                      <p className="text-xs text-slate-400 font-body line-clamp-2 mt-1.5 leading-relaxed">
                        {rom.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`btn-launch-rom-${rom.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectStandbyGame({
                            romUrl: rom.romUrl,
                            title: rom.title,
                            core: rom.system,
                            id: rom.id,
                            coverArt: rom.coverArt,
                            description: rom.description,
                            fileSize: rom.systemName
                          });
                        }}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>CHƠI NGAY</span>
                      </button>

                      <div onClick={(e) => e.stopPropagation()}>
                        <ShareGameMenu
                          game={presetRomToGameItem(rom)}
                          variant="compact"
                          align="right"
                          netplay={isNetplayActive && netplayRoom ? { room: netplayRoom, role: 'p2' } : undefined}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Local File Upload Box */}
          <div className="mt-8 p-6 glass-modal rounded-3xl border border-dashed border-amber-500/40 text-center space-y-3 bg-gradient-to-b from-slate-950 to-amber-950/20">
            <Upload className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white font-display">Tải Lên File ROM Từ Máy Cá Nhân (Tất Cả Hệ Máy)</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-body">
              Hỗ trợ các file đuôi: <strong className="text-amber-300 font-mono">.snes, .smc, .sfc, .nes, .gba, .gbc, .n64, .nds, .iso, .md</strong>. File sẽ được nạp trực tiếp vào bộ nhớ trình duyệt, hoàn toàn bảo mật và không lưu file lên server.
            </p>
            <label
              id="btn-upload-file-box"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white rounded-2xl text-xs font-bold font-mono transition-all cursor-pointer shadow-lg"
            >
              <FolderOpen className="w-4 h-4" />
              <span>{uploadFileName ? `File đã chọn: ${uploadFileName}` : 'Chọn File ROM Từ Máy Tính'}</span>
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".nes,.snes,.smc,.sfc,.gba,.gbc,.gb,.n64,.z64,.v64,.nds,.md,.gen,.bin,.iso,.chd"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE PLAYING EMULATORJS FRAME */}
      {activeTab === 'play' && (
        <div ref={playerContainerRef} className="space-y-4">
          {/* Active Netplay Banner (When Netplay is Active) */}
          {isNetplayActive && netplayRoom && (
            <div className="p-3.5 bg-gradient-to-r from-cyan-950 via-slate-950 to-amber-950/60 rounded-2xl border border-cyan-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                      🌐 NETPLAY ONLINE ĐANG BẬT
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 ${
                      netplayRole === 'p1' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {netplayRole === 'p1' ? <Crown className="w-3 h-3 text-amber-400" /> : <Users className="w-3 h-3 text-cyan-400" />}
                      <span>{netplayRole === 'p1' ? 'Player 1 (Host - Chủ Phòng)' : 'Player 2 (Khách Tham Gia)'}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-300">
                    Mã Phòng: <strong className="text-amber-300 tracking-wider font-mono">{netplayRoom}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {isCopiedInviteLink ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  <span>{isCopiedInviteLink ? 'Đã sao chép link!' : 'Copy Link Mời Bạn Bè (P2)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsNetplayActive(false)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono border border-slate-700 transition-all cursor-pointer"
                  title="Chuyển sang chế độ chơi đơn 1 người"
                >
                  Tắt Netplay
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-emerald-400 animate-pulse' : isLoadingRom ? 'bg-amber-400 animate-spin' : 'bg-amber-500/80'}`} />
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  {isPlaying ? (
                    <>Đang Chơi: <span className="text-amber-300">{currentRomName || 'ROM Game'}</span></>
                  ) : (
                    <>Sẵn Sàng: <span className="text-amber-300">{standbyGame?.title || currentRomName || 'Chưa chọn game'}</span></>
                  )}
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Hệ Máy Core: {SYSTEM_CORES.find(c => c.id === selectedCore)?.name || selectedCore.toUpperCase()} • {isPlaying ? 'Đang chạy 60 FPS' : 'Chế Độ Chờ Chơi (Idle)'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isPlaying && (
                <>
                  {/* Export / Import State Action Buttons */}
                  <button
                    type="button"
                    onClick={() => {
                      if (playerContainerRef.current) {
                        const iframe = playerContainerRef.current.querySelector('iframe');
                        if (iframe?.contentWindow) {
                          iframe.contentWindow.postMessage({ type: 'QGX_EXPORT_STATE' }, '*');
                        }
                      }
                    }}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5"
                    title="Tải file Save State (.state) về máy tính"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Lưu State</span>
                  </button>

                  <label
                    className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5"
                    title="Nạp file Save State (.state) từ máy tính vào game"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nạp State</span>
                    <input
                      ref={stateFileInputRef}
                      type="file"
                      accept=".state,.sav,.save"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const arrayBuffer = event.target?.result as ArrayBuffer;
                          if (arrayBuffer && playerContainerRef.current) {
                            const iframe = playerContainerRef.current.querySelector('iframe');
                            if (iframe?.contentWindow) {
                              const stateData = Array.from(new Uint8Array(arrayBuffer));
                              iframe.contentWindow.postMessage({ type: 'QGX_IMPORT_STATE', stateData }, '*');
                            }
                          }
                        };
                        reader.readAsArrayBuffer(file);
                        if (stateFileInputRef.current) stateFileInputRef.current.value = '';
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    id="btn-reset-current-game"
                    onClick={handleResetCurrentGame}
                    className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-amber-200 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5"
                    title={isNetplayActive ? "Khởi động lại Core và kết nối lại Netplay" : "Khởi động lại Game"}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isNetplayActive ? 'Reset Kết Nối' : 'Reset'}</span>
                  </button>
                </>
              )}

              <ShareGameMenu
                game={{
                  id: currentGameId || standbyGame?.id || currentRomName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  title: (isPlaying ? currentRomName : standbyGame?.title) || 'Retro Emulator Game',
                  platforms: ['Other'],
                  language: standbyGame?.hasVietHoa ? 'Tiếng Việt 🇻🇳' : 'Gốc / Tiếng Anh',
                  hasVietHoa: Boolean(standbyGame?.hasVietHoa),
                  fileSize: selectedCore.toUpperCase(),
                  coverArt: standbyGame?.coverArt || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop'
                }}
                variant="compact"
                align="right"
                netplay={isNetplayActive && netplayRoom ? { room: netplayRoom, role: 'p2' } : undefined}
              />

              <button
                id="btn-switch-to-library"
                onClick={() => {
                  if (isPlaying) {
                    requestSafeAction(() => {
                      terminateActiveEmulator();
                      setActiveTab('library');
                    }, 'quay lại thư viện ROM');
                  } else {
                    setActiveTab('library');
                  }
                }}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Đổi Game Khác
              </button>

              {isPlaying && (
                <button
                  id="btn-exit-emulator"
                  onClick={() => {
                    requestSafeAction(() => {
                      terminateActiveEmulator();
                    }, 'dừng phiên chơi game');
                  }}
                  className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-600 border border-red-500/50 text-red-200 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
                >
                  Thoát Game
                </button>
              )}
            </div>
          </div>

          {stateActionStatus && (
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs font-mono font-bold text-amber-300 text-center animate-fade-in">
              {stateActionStatus}
            </div>
          )}

          {/* EMULATORJS IFRAME CONTAINER, LOADING SPINNER & ERROR STATE */}
          <div className="relative w-full aspect-[4/3] max-h-[720px] bg-black rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* NETPLAY WAITING ROOM OVERLAY (2-STEP HANDSHAKE: 'host_waiting' | 'joiner_waiting') */}
            {netplayWaitingState !== 'idle' ? (
              <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center space-y-5 overflow-y-auto">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                    <Users className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
                    <span>PHÒNG CHỜ NETPLAY</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                      netplayWaitingState === 'host_waiting'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-cyan-500 text-slate-950'
                    }`}>
                      {netplayWaitingState === 'host_waiting' ? 'HOST / P1' : 'JOINER / P2'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md font-body">
                    {netplayWaitingState === 'host_waiting' ? (
                      netplayRoomStatus?.p2Ready ? (
                        <span className="text-emerald-300 font-bold">🎉 Player 2 đã sẵn sàng! Bấm "Bắt Đầu Chơi" để cùng vào trận ngay!</span>
                      ) : netplayRoomStatus?.p2Joined ? (
                        <span className="text-amber-300">👤 Player 2 đã vào phòng! Đang chờ Player 2 bấm Sẵn Sàng...</span>
                      ) : (
                        '👑 Bạn là Chủ Phòng (Player 1). Hãy gửi mã phòng hoặc link mời cho Bạn bè (Player 2) để cùng chiến game!'
                      )
                    ) : (
                      isJoinerReady ? (
                        <span className="text-emerald-300 font-bold">✅ Bạn đã sẵn sàng! Đang chờ Chủ phòng (Host) bấm Bắt Đầu... (Game sẽ tự khởi động)</span>
                      ) : (
                        `🎮 Bạn đã kết nối vào phòng [${netplayRoom}]. Hãy bấm "Sẵn Sàng" để Host biết bạn đã chuẩn bị xong!`
                      )
                    )}
                  </p>
                </div>

                {/* Room Details & Game Card */}
                <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3.5 text-left shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block">Trò chơi SNES:</span>
                      <span className="text-sm font-bold text-amber-300 font-display">{waitingGame?.title || currentRomName}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold">
                      SNES 16-BIT
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-mono font-bold text-slate-300 block">MÃ PHÒNG (ROOM CODE):</span>
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-amber-500/40">
                      <span className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-wider flex-1 px-2 select-all truncate">
                        {netplayRoom}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRoom}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {isCopiedRoom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopiedRoom ? 'Đã Chép' : 'Chép'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Players status list */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <div className="bg-slate-950/80 p-2.5 rounded-xl border border-emerald-500/40 text-left space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                          Player 1 (Host)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 font-body block">
                        {netplayWaitingState === 'host_waiting' ? '✅ Đã sẵn sàng (Bạn)' : '👑 Chủ Phòng'}
                      </span>
                    </div>

                    <div className={`p-2.5 rounded-xl border text-left space-y-1 ${
                      (netplayWaitingState === 'host_waiting' && netplayRoomStatus?.p2Ready) ||
                      (netplayWaitingState === 'joiner_waiting' && isJoinerReady)
                        ? 'bg-slate-950/80 border-emerald-500/40'
                        : 'bg-slate-950/80 border-amber-500/30'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          (netplayWaitingState === 'host_waiting' && netplayRoomStatus?.p2Ready) ||
                          (netplayWaitingState === 'joiner_waiting' && isJoinerReady)
                            ? 'bg-emerald-400'
                            : 'bg-amber-400 animate-ping'
                        }`} />
                        <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                          Player 2 (Khách)
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-300 font-body block truncate">
                        {netplayWaitingState === 'host_waiting' ? (
                          netplayRoomStatus?.p2Ready
                            ? '✅ Đã sẵn sàng!'
                            : netplayRoomStatus?.p2Joined
                            ? '🟡 Đã vào phòng'
                            : '⏳ Đang chờ vào...'
                        ) : (
                          isJoinerReady ? '✅ Đã sẵn sàng (Bạn)' : '🟡 Chưa bấm sẵn sàng'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons and Actions */}
                <div className="flex flex-col items-center gap-2.5 max-w-md w-full">
                  {netplayWaitingState === 'host_waiting' ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyInviteLink}
                        className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"
                      >
                        {isCopiedInviteLink ? <Check className="w-4 h-4 text-white" /> : <Link2 className="w-4 h-4" />}
                        <span>{isCopiedInviteLink ? 'ĐÃ CHÉP LINK MỜI!' : 'SAO CHÉP LINK MỜI BẠN BÈ (P2)'}</span>
                      </button>

                      {/* Start Game Button: Disabled until P2 is Ready */}
                      <button
                        type="button"
                        id="btn-host-start-game"
                        onClick={handleHostStartGame}
                        disabled={!netplayRoomStatus?.p2Ready || isStartingHost}
                        className={`w-full py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                          netplayRoomStatus?.p2Ready && !isStartingHost
                            ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse border border-amber-300 cursor-pointer active:scale-95'
                            : 'bg-slate-900 border border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>
                          {isStartingHost
                            ? 'ĐANG KHỞI ĐỘNG PHÒNG CHƠI...'
                            : netplayRoomStatus?.p2Ready
                            ? '🚀 BẮT ĐẦU CHƠI NGAY'
                            : '⏳ Chờ Player 2 Sẵn Sàng...'}
                        </span>
                      </button>
                    </>
                  ) : (
                    /* Joiner Waiting View */
                    <>
                      <button
                        type="button"
                        id="btn-joiner-ready"
                        onClick={handleJoinerSetReady}
                        disabled={isJoinerReady}
                        className={`w-full py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
                          !isJoinerReady
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95'
                            : 'bg-slate-900 border border-emerald-500/40 text-emerald-300 opacity-80 cursor-default'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {isJoinerReady
                            ? '⏳ ĐÃ SẴN SÀNG (ĐANG CHỜ HOST BẮT ĐẦU...)'
                            : '✅ BẤM ĐỂ SẴN SÀNG'}
                        </span>
                      </button>
                    </>
                  )}

                  <div className="flex items-center gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={handleCancelNetplayRoom}
                      className="w-full py-2.5 px-3.5 bg-slate-900 hover:bg-red-950/80 border border-slate-800 hover:border-red-500/50 text-slate-400 hover:text-red-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                    >
                      {netplayWaitingState === 'host_waiting' ? 'Hủy Phòng' : 'Rời Phòng'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Loading Spinner Overlay when fetching ROM via proxy */}
            <AnimatePresence>
              {isLoadingRom && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-5 p-6 text-center"
                >
                  {/* Uiverse Animated Words Spinner */}
                  <LoadingWordsSpinner
                    prefix="đang"
                    words={
                      isNetplayActive
                        ? ['kết nối netplay', 'tải rom snes', 'đồng bộ p2p', 'ghép phòng chơi', 'chuẩn bị game']
                        : ['tải rom', 'kết nối máy chủ', 'khởi động core', 'đồng bộ dữ liệu', 'chuẩn bị game']
                    }
                    color={isNetplayActive ? '#22D3EE' : '#f59e0b'}
                    bgColor="#05070e"
                  />

                  <div className="space-y-1.5 max-w-md">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-300 font-mono uppercase tracking-wider">
                      {isNetplayActive ? `🎮 Netplay Mode (${netplayRole === 'p1' ? 'Chủ Phòng P1' : 'Khách P2'})` : '🕹️ Giả Lập SNES 16-Bit'}
                    </h4>

                    {loadingStepText && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                        <span>{loadingStepText}</span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 font-body mt-2 leading-relaxed">
                      {isNetplayActive 
                        ? `Hệ thống nạp nhị phân ROM đầy đủ trước khi khởi tạo Netplay phòng [${netplayRoom}], đảm bảo đồng bộ mạng không bị giật lag.`
                        : 'Trình duyệt đang nạp ROM vào bộ nhớ nhị phân an toàn vượt lỗi CORS.'
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Container when ROM link is invalid or private */}
            {romError && !isLoadingRom && (
              <div className="absolute inset-0 z-10 p-6 sm:p-10 flex flex-col items-center justify-center bg-slate-950/95 text-center overflow-y-auto">
                <div className="p-4 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4 inline-flex">
                  <AlertTriangle className="w-10 h-10" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white font-display uppercase tracking-tight mb-2">
                  {romError.title}
                </h3>
                
                <p className="text-sm font-semibold text-red-300 max-w-lg mb-2 leading-relaxed">
                  {romError.message}
                </p>

                {romError.details && (
                  <p className="text-xs text-slate-400 font-mono mb-4 max-w-md">
                    {romError.details}
                  </p>
                )}

                {romError.hint && (
                  <div className="max-w-xl w-full p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 text-left font-body mb-6 space-y-1">
                    <strong className="text-amber-300 font-bold block flex items-center gap-1.5 font-mono">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      HƯỚNG DẪN KHẮC PHỤC:
                    </strong>
                    <p className="leading-relaxed text-slate-300">
                      {romError.hint}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {romError.originalUrl && (
                    <button
                      id="btn-retry-launch-rom"
                      onClick={() => launchRom(
                        romError.originalUrl || '', 
                        currentRomName, 
                        selectedCore, 
                        currentGameId || undefined,
                        isNetplayActive && netplayRoom.trim() ? { isNetplay: true, room: netplayRoom.trim(), role: netplayRole } : undefined
                      )}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Thử Lại Ngay {isNetplayActive ? '(Netplay 2P)' : ''}</span>
                    </button>
                  )}

                  {romError.originalUrl && (romError.originalUrl.includes('drive.google.com') || romError.originalUrl.includes('docs.google.com')) && (
                    <a
                      href={romError.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-400" />
                      <span>Mở File Trên Drive</span>
                    </a>
                  )}

                  <label
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>Tải ROM Từ Máy Tính</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      accept=".nes,.snes,.smc,.sfc,.gba,.gbc,.gb,.n64,.z64,.v64,.nds,.md,.gen,.bin,.iso,.chd"
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setActiveTab('library')}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    Đổi Game Khác
                  </button>
                </div>
              </div>
            )}

            {isPlaying && currentRomUrl && !romError ? (
              <iframe
                key={`${currentRomUrl}-${selectedCore}-${isNetplayActive ? netplayRoom : 'solo'}-${netplayRole}`}
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0"
                allow="autoplay; gamepad; fullscreen; microphone"
                title="Retro Emulator Engine"
              />
            ) : !isLoadingRom && !romError ? (
              standbyGame ? (
                <div className="relative w-full h-full min-h-[460px] sm:min-h-[540px] flex flex-col items-center justify-center p-6 sm:p-10 overflow-hidden select-none bg-slate-950">
                  {/* Background Artwork Layer with Blur & Vignette Overlay */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {standbyGame.backdropArt || standbyGame.coverArt ? (
                      <img
                        src={standbyGame.backdropArt || standbyGame.coverArt}
                        alt={standbyGame.title}
                        className="w-full h-full object-cover object-center filter blur-md brightness-[0.25] saturate-150 scale-110 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/50" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12),transparent_75%)]" />
                  </div>

                  {/* Standby Foreground Card */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center space-y-5 px-4"
                  >
                    {/* System & Viet Hoa Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>{SYSTEM_CORES.find(c => c.id === standbyGame.core)?.name || standbyGame.core.toUpperCase()}</span>
                      </div>

                      {standbyGame.hasVietHoa && (
                        <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-mono font-black uppercase tracking-wider flex items-center gap-1 backdrop-blur-md shadow-lg">
                          <span>🇻🇳 BẢN VIỆT HÓA</span>
                        </div>
                      )}

                      <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
                        <span>⚡ 60 FPS READY</span>
                      </div>
                    </div>

                    {/* Cover Boxart Thumbnail */}
                    {standbyGame.coverArt && (
                      <div className="relative w-28 h-36 sm:w-36 sm:h-48 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8)] border-2 border-amber-400/40 group hover:border-amber-400 transition-all duration-300">
                        <img
                          src={standbyGame.coverArt}
                          alt={standbyGame.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                      </div>
                    )}

                    {/* Game Title & Subtitle */}
                    <div className="space-y-1.5">
                      <h2 className="font-display font-black text-2xl sm:text-4xl uppercase text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                        {standbyGame.title}
                      </h2>
                      {standbyGame.subtitle && (
                        <p className="font-cinematic italic font-semibold text-xs sm:text-base text-amber-300/90 tracking-wide drop-shadow-md">
                          "{standbyGame.subtitle}"
                        </p>
                      )}
                      {standbyGame.description && (
                        <p className="text-xs sm:text-sm text-slate-300 font-body max-w-lg mx-auto line-clamp-2 leading-relaxed drop-shadow-md">
                          {standbyGame.description}
                        </p>
                      )}
                    </div>

                    {/* THE BIG PROMINENT "CHƠI NGAY" BUTTON */}
                    <div className="pt-2 flex flex-col items-center gap-3">
                      <button
                        id="btn-standby-play-now"
                        type="button"
                        onClick={() => {
                          launchRom(standbyGame.romUrl, standbyGame.title, standbyGame.core, standbyGame.id);
                        }}
                        className="group relative px-8 sm:px-14 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:via-yellow-300 hover:to-amber-400 text-slate-950 font-display font-black text-base sm:text-xl uppercase tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_55px_rgba(245,158,11,0.85)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3.5 cursor-pointer border-2 border-amber-200"
                      >
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400 translate-x-0.5" />
                        </div>
                        <span>CHƠI NGAY</span>
                      </button>

                      <p className="text-[11px] font-mono text-slate-400">
                        ⚡ Nhấp để nạp ROM và khởi chạy trình giả lập 60 FPS
                      </p>
                    </div>

                    {/* Secondary Navigation Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          startHostingNetplay({
                            romUrl: standbyGame.romUrl,
                            title: standbyGame.title,
                            core: standbyGame.core,
                            id: standbyGame.id,
                            coverArt: standbyGame.coverArt
                          });
                        }}
                        className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        title="Tạo phòng Netplay 2 người chơi online"
                      >
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Chơi Online (Netplay 2P)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('library')}
                        className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
                        <span>Đổi Game Khác</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center p-8 text-slate-500 font-mono text-xs space-y-3">
                  <Gamepad2 className="w-10 h-10 text-slate-700 mx-auto" />
                  <p>Vui lòng chọn một trò chơi SNES từ thư viện hoặc tải ROM từ máy để bắt đầu.</p>
                  <button
                    onClick={() => setActiveTab('library')}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase"
                  >
                    Xem Thư Viện ROM
                  </button>
                </div>
              )
            ) : null}
          </div>

          {/* Quick Control Hints & Keybindings Guide */}
          <div className="p-5 glass-modal rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3 font-mono shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Info className="w-4 h-4 text-amber-400" />
                <span>CẤU HÌNH PHÍM MẶC ĐỊNH & TỐC ĐỘ 60 FPS</span>
              </div>
              <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ Core: {selectedCore.toUpperCase()} (60 FPS Locked)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">🎮 Phím Mặc Định Chuẩn:</span>
                <span>Mũi tên = Di chuyển | Z / X = Nút A / B | Shift = Select | Enter = Start</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-red-400 font-bold block mb-1">🔴 Tay Cầm Gamepad:</span>
                <span>Tự động nhận diện tay cầm USB / Bluetooth cắm vào máy tính.</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">🟣 Đổi Phím Theo Ý Thích:</span>
                <span>Bấm nút Cài đặt (Hình bánh răng) ở góc giao diện giả lập để đổi phím bất cứ lúc nào.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAVE STATE / PROGRESS */}
      {activeTab === 'saves' && (
        <div className="glass-modal p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Quản Lý Tiến Trình & Save State</h2>
              <p className="text-xs text-slate-400 font-body">
                Trình giả lập tự động sao lưu save state vào bộ nhớ của trình duyệt.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-amber-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400" />
                <span>1. Lưu Nhanh Trực Tiếp Trong Game</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-body">
                Trong khi đang chơi, bạn có thể bấm nút <strong>Lưu State (.state)</strong> ngay trên thanh công cụ hoặc di chuột vào cạnh dưới màn hình giả lập để lưu nhanh vị trí hiện tại.
              </p>
            </div>

            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>2. Tải File Save Về Máy Để Dự Phòng</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-body">
                Bạn có thể bấm xuất file Save State (.state) và lưu vào máy tính, sau đó dùng nút <strong>Nạp State (.state)</strong> để nạp lại bất cứ khi nào đổi thiết bị.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NETPLAY ONLINE ROOM SHARING */}
      {activeTab === 'netplay' && (
        <div className="glass-modal p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">Tạo Phòng & Chia Sẻ Chơi Online (Netplay 2 Người)</h2>
              <p className="text-xs text-slate-400 font-body">
                Kết nối P2P WebRTC giữa 2 người chơi cùng 1 game giả lập qua mạng Internet mà không cần chung máy tính!
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Host P1 Action */}
              <div className={`p-4 rounded-2xl border transition-all ${
                netplayRole === 'p1' ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-300">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>CHỦ PHÒNG (PLAYER 1 - HOST)</span>
                  </div>
                  {netplayRole === 'p1' && (
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-mono font-bold">Đang Chọn</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Tạo mã phòng mới, gửi link cho bạn bè và điều khiển game ở vị trí Người chơi 1.
                </p>
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  👑 Tạo Mã Phòng Mới
                </button>
              </div>

              {/* Guest P2 Action */}
              <div className={`p-4 rounded-2xl border transition-all ${
                netplayRole === 'p2' ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800 bg-slate-900/60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>THAM GIA (PLAYER 2 - KHÁCH)</span>
                  </div>
                  {netplayRole === 'p2' && (
                    <span className="px-2 py-0.5 rounded bg-cyan-500 text-slate-950 text-[10px] font-mono font-bold">Đang Chọn</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Dán mã phòng do bạn bè gửi để tham gia vào game ở vị trí Người chơi 2.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setNetplayRole('p2');
                    setIsNetplayActive(true);
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  🎮 Tham Gia Với Vai Trò P2
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                Mã Phòng Netplay (Room Code):
              </label>

              <div className="flex items-center gap-3">
                <input
                  id="input-netplay-room"
                  type="text"
                  value={netplayRoom}
                  onChange={(e) => setNetplayRoom(e.target.value)}
                  placeholder="Nhập mã phòng (ví dụ: QGX-888888)..."
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-amber-300 font-mono font-bold outline-none"
                />

                {netplayRoom && (
                  <>
                    <button
                      id="btn-copy-netplay-room"
                      type="button"
                      onClick={handleCopyRoom}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Sao chép mã phòng"
                    >
                      {isCopiedRoom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{isCopiedRoom ? 'Đã chép mã!' : 'Chép Mã'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyInviteLink}
                      className="px-4 py-3 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                      title="Sao chép toàn bộ link web kèm mã phòng và game để gửi cho bạn bè"
                    >
                      {isCopiedInviteLink ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                      <span>{isCopiedInviteLink ? 'Đã chép link mời!' : 'Sao Chép Link Mời (P2)'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 leading-relaxed font-body">
              <strong>💡 Hướng dẫn chơi cùng bạn bè siêu nhanh:</strong>
              <ol className="list-decimal list-inside space-y-1.5 mt-2 text-slate-300">
                <li>Bấm <strong>Tạo Mã Phòng Mới</strong> hoặc nhập mã phòng tự đặt.</li>
                <li>Chọn 1 game SNES bên dưới và bấm <strong>Bắt Đầu Chơi Netplay</strong>.</li>
                <li>Bấm <strong>Sao Chép Link Mời (P2)</strong> và gửi qua Facebook / Zalo / Discord cho bạn bè. Bạn bè mở link sẽ tự động vào thẳng game ở vị trí Player 2!</li>
              </ol>
            </div>
          </div>

          {/* Direct Netplay Game Picker */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white uppercase font-display flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Chọn Game SNES 2 Người Để Bắt Đầu Phòng Chơi:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {snesGames.slice(0, 4).map((game) => (
                <div
                  key={game.id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-400/60 p-3 flex flex-col justify-between gap-3 bg-slate-900/90"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={game.coverArt}
                      alt={game.title}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-950 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{game.title}</h4>
                      <span className="text-[10px] font-mono text-amber-300">SNES 2 Người</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const room = (netplayRoom || 'qgx-' + Math.random().toString(36).substring(2, 8)).trim().toLowerCase();
                      if (netplayRole === 'p1') {
                        startHostingNetplay(
                          {
                            romUrl: game.romUrl || '',
                            title: game.title,
                            core: 'snes',
                            id: game.id,
                            coverArt: game.coverArt
                          },
                          room
                        );
                      } else {
                        startJoinerNetplay(
                          {
                            romUrl: game.romUrl || '',
                            title: game.title,
                            core: 'snes',
                            id: game.id,
                            coverArt: game.coverArt
                          },
                          room
                        );
                      }
                    }}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>{netplayRole === 'p1' ? 'Mở Phòng Chờ Netplay (P1)' : 'Vào Phòng Chờ (P2)'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Admin ROM Manager Modal */}
      <AdminRomManagerModal
        isOpen={isAdminRomModalOpen}
        onClose={() => setIsAdminRomModalOpen(false)}
        onPlayRom={(url, name, core) => launchRom(url, name, core || 'snes')}
        onGameUpdated={loadSnesGames}
      />

      {/* Admin Edit Description Modal */}
      {canShowAdmin && (
        <EditGameDescriptionModal
          game={editingDescGame}
          isOpen={Boolean(editingDescGame)}
          onClose={() => setEditingDescGame(null)}
          onSuccess={(gameId, newDesc) => {
            setSnesGames(prev => prev.map(g => g.id === gameId ? { ...g, description: newDesc } : g));
            setStandbyGame(prev => prev && prev.id === gameId ? { ...prev, description: newDesc } : prev);
          }}
        />
      )}

      {/* Hidden File Input for Cover Art Upload to Vercel Blob */}
      <input
        type="file"
        ref={coverFileInputRef}
        onChange={handleCoverFileChange}
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
      />
    </div>
  );
};
