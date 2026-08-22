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
  Cloud
} from 'lucide-react';
import { DEFAULT_SNES_TEST_GAMES } from '../services/sheetService';
import { GameItem } from '../types';
import { ShareGameMenu } from './ShareGameMenu';
import { useAdminMode } from '../hooks/useAdminMode';
import { AdminRomManagerModal } from './AdminRomManagerModal';
import { requestSafeAction } from '../utils/emulatorManager';

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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

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

  // Netplay State
  const [netplayRoom, setNetplayRoom] = useState<string>('');
  const [isCopiedRoom, setIsCopiedRoom] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'play' | 'library' | 'saves' | 'netplay'>('library');

  const playerContainerRef = useRef<HTMLDivElement>(null);

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

  const activeBlobUrlRef = useRef<string | null>(null);

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
    setIsLoadingRom(false);
    setRomError(null);
    setActiveTab('library');
    setUploadFileName(null);

    // 4. Update global flags
    if (typeof window !== 'undefined') {
      window.__QGX_IS_PLAYING_EMULATOR__ = false;
      window.dispatchEvent(new CustomEvent('qgx_emulator_state_changed', { detail: { isPlaying: false } }));
    }
  };

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

  // Launch ROM directly into EmulatorJS Engine (ArrayBuffer -> Application/octet-stream Blob -> ObjectURL)
  const launchRom = async (romUrl: string, gameName: string, core: string = 'snes') => {
    if (!romUrl || romUrl.trim().length === 0) {
      setRomError({
        title: "Không Có File ROM",
        message: `Game "${gameName}" chưa có đường dẫn romUrl trong cơ sở dữ liệu.`,
        hint: "Vui lòng upload file ROM lên Vercel Blob Storage để kích hoạt chơi trực tiếp."
      });
      return;
    }

    setIsLoadingRom(true);
    setRomError(null);
    setLoadingStepText(`Đang kết nối tải ROM cho ${gameName}...`);
    setActiveTab('play');

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

      // Convert remote Vercel Blob or local ROM to a pure application/octet-stream Blob ObjectURL
      const { blobUrl, sizeBytes } = await fetchRomAsBlobUrl(cleanUrl, (step) => {
        setLoadingStepText(step);
      });

      if (blobUrl.startsWith('blob:')) {
        activeBlobUrlRef.current = blobUrl;
      }

      setLoadingStepText(`Khởi động lõi giả lập ${core.toUpperCase()} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)...`);
      setCurrentRomUrl(blobUrl);
      setCurrentRomName(gameName);
      setSelectedCore(core);
      setIsPlaying(true);
      setIsLoadingRom(false);
    } catch (err: any) {
      console.error("[Launch ROM Error]:", err);
      setRomError({
        title: "Lỗi Nạp File ROM",
        message: err.message || "Không thể nạp ROM vào bộ nhớ trình giả lập.",
        hint: "Hãy thử tải lại trang hoặc nạp ROM trực tiếp từ máy tính.",
        originalUrl: romUrl
      });
      setIsLoadingRom(false);
      setIsPlaying(false);
    }
  };

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

  // Generate isolated clean HTML for EmulatorJS iframe with default controls and deep debugging
  const iframeSrcDoc = useMemo(() => {
    if (!isPlaying || !currentRomUrl) return '';

    const effectiveRomUrl = normalizeRomUrl(currentRomUrl);
    const resolvedCore = resolveEmulatorCore(selectedCore || 'snes');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${currentRomName || 'Emulator'}</title>
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
    console.group("🎮 [EmulatorJS Diagnostic]");
    console.log("➡️ Target Game:", ${JSON.stringify(currentRomName || 'Quán Game Xóm SNES ROM')});
    console.log("➡️ Selected Core:", ${JSON.stringify(selectedCore)}, "-> Resolved Core:", ${JSON.stringify(resolvedCore)});
    console.log("➡️ Effective ROM URL:", ${JSON.stringify(effectiveRomUrl)});
    console.groupEnd();

    // 1. Diagnostic pre-check: verify ROM byte size & content type
    (function verifyRom() {
      var romUrl = ${JSON.stringify(effectiveRomUrl)};
      if (romUrl && !romUrl.startsWith("blob:") && !romUrl.startsWith("data:")) {
        fetch(romUrl, { method: "HEAD" })
          .then(function(res) {
            var len = res.headers.get("content-length");
            var type = res.headers.get("content-type");
            console.log("📦 [ROM Pre-flight Check] Status:", res.status, "| Content-Length:", len ? (parseInt(len) / 1024 / 1024).toFixed(2) + " MB (" + len + " bytes)" : "Unknown", "| Content-Type:", type);
            if (type && type.includes("text/html")) {
              console.error("⚠️ [ROM Integrity Warning] The ROM URL returned HTML instead of binary data! This will cause a black screen or crash.");
            }
          })
          .catch(function(err) {
            console.warn("⚠️ [ROM Pre-flight Check Failed]:", err.message);
          });
      }
    })();

    // 2. EmulatorJS Core Configuration
    window.EJS_player = '#ejs-game-container';
    window.EJS_core = ${JSON.stringify(resolvedCore)};
    window.EJS_gameName = ${JSON.stringify(currentRomName || 'Quán Game Xóm SNES ROM')};
    window.EJS_gameUrl = ${JSON.stringify(effectiveRomUrl)};
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    window.EJS_startOnLoaded = true;
    window.EJS_color = '#f59e0b';
    ${netplayRoom.trim() ? `window.EJS_room = ${JSON.stringify(netplayRoom.trim())};` : ''}

    // 3. Detailed Callbacks & Error Listeners
    window.EJS_onLoad = function() {
      console.log("✅ [EmulatorJS] System Core loaded successfully.");
    };

    window.EJS_onGameStart = function() {
      console.log("🚀 [EmulatorJS] Game execution loop started! Audio/Video initialized.");
    };

    window.EJS_onLogError = function(err) {
      console.error("❌ [EmulatorJS Engine Error Callback]:", err);
    };

    window.addEventListener("error", function(e) {
      console.error("💥 [Window Error in Emulator Frame]:", e.message, "at", e.filename, ":", e.lineno);
    });

    window.addEventListener("unhandledrejection", function(e) {
      console.error("💥 [Unhandled Promise Rejection in Emulator Frame]:", e.reason);
    });

    // 4. Forceful Teardown & Audio Termination Listener
    window.addEventListener("message", function(e) {
      if (e.data === "QGX_TEARDOWN_EMULATOR") {
        console.log("🛑 [Emulator Frame] Received shutdown signal. Destroying audio & video contexts...");
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
      }
    });
  </script>
  <script src="https://cdn.emulatorjs.org/stable/data/loader.js"></script>
</body>
</html>`;
  }, [isPlaying, currentRomUrl, selectedCore, currentRomName, netplayRoom]);

  const handleCreateRoom = () => {
    const randomRoom = 'QGX-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setNetplayRoom(randomRoom);
  };

  const handleCopyRoom = () => {
    if (!netplayRoom) return;
    navigator.clipboard.writeText(netplayRoom);
    setIsCopiedRoom(true);
    setTimeout(() => setIsCopiedRoom(false), 2000);
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
              <span>EMULATORJS WEB ENGINE • VERCEL BLOB STORAGE DIRECT</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
              KHU VỰC <span className="text-amber-400 text-glow-amber">GIẢ LẬP GAME RETRO</span>
            </h1>
            <p className="text-xs sm:text-sm font-body text-slate-300 leading-relaxed">
              Chơi ngay game SNES & Retro kinh điển qua EmulatorJS stream trực tiếp từ kho Vercel Blob Storage tốc độ cao của Quán Game Xóm. Tải tức thì 100%, không lag, 60 FPS mượt mà!
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
            disabled={!isPlaying && !isLoadingRom}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'play'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : isPlaying || isLoadingRom
                ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'opacity-40 cursor-not-allowed text-slate-500'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Màn Hình Chơi Game {isPlaying && `(${currentRomName})`}</span>
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
            <span>Chơi Online (Netplay)</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {snesGames.map((game) => (
                <div
                  key={game.id}
                  id={`card-snes-${game.id}`}
                  className="group relative glass-card rounded-3xl overflow-hidden border border-amber-500/40 hover:border-amber-400 transition-all duration-300 flex flex-col sm:flex-row shadow-2xl hover:shadow-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-amber-950/30"
                >
                  <div className="relative sm:w-2/5 aspect-[4/3] sm:aspect-auto overflow-hidden bg-slate-950 shrink-0">
                    <img
                      src={game.coverArt}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/90 backdrop-blur-md rounded-lg border border-amber-400/60 text-xs font-mono font-black text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>SNES 16-BIT</span>
                    </div>
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

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        id={`btn-play-snes-${game.id}`}
                        onClick={() => launchRom(game.romUrl || '', game.title, 'snes')}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg hover:shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>CHƠI NGAY (SNES)</span>
                      </button>

                      <ShareGameMenu
                        game={game}
                        variant="compact"
                        align="right"
                      />

                      {game.downloadUrl && (
                        <a
                          href={game.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                          title="Mở link chia sẻ Google Drive"
                        >
                          <Download className="w-4 h-4" />
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
                  Chọn core và game mẫu để thử nghiệm trình giả lập EmulatorJS.
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
                  className="group glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-amber-500/50 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
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
                        onClick={() => launchRom(rom.romUrl, rom.title, rom.system)}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>CHƠI NGAY</span>
                      </button>

                      <ShareGameMenu
                        game={presetRomToGameItem(rom)}
                        variant="compact"
                        align="right"
                      />
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
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${isLoadingRom ? 'bg-amber-400 animate-spin' : 'bg-emerald-400 animate-pulse'}`} />
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Đang Chơi: <span className="text-amber-300">{currentRomName || 'ROM Game'}</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Hệ Máy Core: {SYSTEM_CORES.find(c => c.id === selectedCore)?.name || selectedCore.toUpperCase()} • Server Proxy CORS Safe
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShareGameMenu
                game={{
                  id: currentRomName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  title: currentRomName || 'Retro Emulator Game',
                  platforms: ['Other'],
                  language: 'Gốc / Tiếng Anh',
                  hasVietHoa: false,
                  fileSize: selectedCore.toUpperCase(),
                  coverArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop'
                }}
                variant="compact"
                align="right"
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

              <button
                id="btn-exit-emulator"
                onClick={() => {
                  if (isPlaying) {
                    requestSafeAction(() => {
                      terminateActiveEmulator();
                    }, 'dừng phiên chơi game');
                  } else {
                    terminateActiveEmulator();
                  }
                }}
                className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-600 border border-red-500/50 text-red-200 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
              >
                Thoát Game
              </button>
            </div>
          </div>

          {/* EMULATORJS IFRAME CONTAINER, LOADING SPINNER & ERROR STATE */}
          <div className="relative w-full aspect-[4/3] max-h-[720px] bg-black rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Loading Spinner Overlay when fetching ROM via proxy */}
            <AnimatePresence>
              {isLoadingRom && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 p-6 text-center"
                >
                  <div className="relative flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
                    <Gamepad2 className="w-6 h-6 text-amber-300 absolute" />
                  </div>

                  <div className="space-y-1 max-w-md">
                    <h4 className="text-base font-bold text-white font-display uppercase tracking-wide">
                      Đang Tải ROM SNES Qua Server Proxy
                    </h4>
                    <p className="text-xs font-mono text-amber-300">
                      {loadingStepText || "Đang kết nối ROM..."}
                    </p>
                    <p className="text-[11px] text-slate-400 font-body mt-2">
                      Trình duyệt đang tải ROM an toàn qua route /api/rom-proxy nhằm vượt lỗi CORS Google Drive.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message Container when Google Drive link is invalid or private */}
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
                      onClick={() => launchRom(romError.originalUrl || '', currentRomName, selectedCore)}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Thử Lại Ngay</span>
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
                key={`${currentRomUrl}-${selectedCore}`}
                srcDoc={iframeSrcDoc}
                className="w-full h-full border-0"
                allow="autoplay; gamepad; fullscreen; microphone"
                title="Retro Emulator Engine"
              />
            ) : !isLoadingRom && !romError ? (
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
            ) : null}
          </div>

          {/* Quick Control Hints & Keybindings Guide */}
          <div className="p-5 glass-modal rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3 font-mono shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Info className="w-4 h-4 text-amber-400" />
                <span>CẤU HÌNH PHÍM MẶC ĐỊNH EMULATORJS & TỐC ĐỘ 60 FPS</span>
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
                Trình giả lập EmulatorJS tự động sao lưu save state vào bộ nhớ IndexedDB của trình duyệt.
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
                Trong khi đang chơi, hãy di chuột vào cạnh dưới của màn hình EmulatorJS hoặc bấm phím Esc để mở Menu chính. Bấm nút <strong>Save State</strong> để lưu lại ngay vị trí đang đứng.
              </p>
            </div>

            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>2. Tải File Save Về Máy Để Dự Phòng</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-body">
                Bạn có thể bấm xuất file Save State (.state) từ menu của trình giả lập và lưu vào máy tính, sau đó nạp lại bất cứ khi nào đổi thiết bị hoặc trình duyệt khác.
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
              <h2 className="text-lg font-bold text-white font-display">Tạo Phòng & Chia Sẻ Chơi Online (Netplay)</h2>
              <p className="text-xs text-slate-400 font-body">
                Kết nối P2P WebRTC giữa 2 người chơi cùng 1 game giả lập qua mạng Internet mà không cần chung máy!
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
              Mã Phòng Netplay (Room Code):
            </label>

            <div className="flex items-center gap-3">
              <input
                id="input-netplay-room"
                type="text"
                value={netplayRoom}
                onChange={(e) => setNetplayRoom(e.target.value)}
                placeholder="Nhập mã phòng hoặc bấm Tạo Mã..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-amber-300 font-mono font-bold outline-none"
              />

              <button
                id="btn-create-netplay-room"
                type="button"
                onClick={handleCreateRoom}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Tạo Mã Mới
              </button>

              {netplayRoom && (
                <button
                  id="btn-copy-netplay-room"
                  type="button"
                  onClick={handleCopyRoom}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isCopiedRoom ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopiedRoom ? 'Đã chép!' : 'Sao Chép'}</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200/90 leading-relaxed font-body">
              <strong>💡 Hướng dẫn chơi cùng bạn bè:</strong>
              <ol className="list-decimal list-inside space-y-1 mt-1.5 text-slate-300">
                <li>Tạo hoặc dán mã phòng ở trên.</li>
                <li>Chọn 1 game mẫu từ Thư viện ROM SNES và bấm Chơi Ngay.</li>
                <li>Gửi mã phòng này cho bạn bè, họ cũng nhập đúng mã này và nạp cùng 1 file ROM để bắt đầu kết nối Netplay Player 2!</li>
              </ol>
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
    </div>
  );
};
