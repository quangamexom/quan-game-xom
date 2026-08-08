import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2
} from 'lucide-react';

export interface PresetRom {
  id: string;
  title: string;
  system: string; // 'nes' | 'snes' | 'gba' | 'gbc' | 'n64' | 'nds' | 'segaMD'
  systemName: string;
  romUrl: string;
  coverArt: string;
  description: string;
}

const PRESET_ROMS: PresetRom[] = [
  {
    id: 'nes-2048',
    title: '2048 (NES Edition)',
    system: 'nes',
    systemName: 'Nintendo (NES)',
    romUrl: 'https://raw.githubusercontent.com/pubby/2048-nes/master/2048.nes',
    coverArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    description: 'Trò chơi xếp số 2048 nổi tiếng được lập trình riêng cho hệ máy NES cổ điển.'
  },
  {
    id: 'gba-celeste',
    title: 'Celeste Classic (GBA Port)',
    system: 'gba',
    systemName: 'Game Boy Advance',
    romUrl: 'https://raw.githubusercontent.com/K3333333333/celeste-gba/master/celeste.gba',
    coverArt: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=600&auto=format&fit=crop',
    description: 'Bản leo núi Celeste huyền thoại được chuyển thể mượt mà lên Game Boy Advance.'
  },
  {
    id: 'gbc-tobu',
    title: 'Tobu Tobu Girl Deluxe (GBC)',
    system: 'gbc',
    systemName: 'Game Boy Color',
    romUrl: 'https://raw.githubusercontent.com/tangramgames/tobu-tobu-girl-deluxe/master/tobutobugirl.gbc',
    coverArt: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop',
    description: 'Game Arcade leo tháp phong cách Anime cực hay dành cho Game Boy Color.'
  },
  {
    id: 'nes-flappy',
    title: 'Flappy Bird (NES)',
    system: 'nes',
    systemName: 'Nintendo (NES)',
    romUrl: 'https://raw.githubusercontent.com/gutiguti/flappy-bird-nes/master/flappy.nes',
    coverArt: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop',
    description: 'Flappy Bird phiên bản 8-bit đồ họa hoài niệm cho máy điện tử băng NES.'
  }
];

const SYSTEM_CORES = [
  { id: 'nes', name: 'Nintendo NES (8-bit)', exts: ['.nes'] },
  { id: 'snes', name: 'Super Nintendo SNES (16-bit)', exts: ['.snes', '.smc', '.sfc'] },
  { id: 'gba', name: 'Game Boy Advance (GBA)', exts: ['.gba'] },
  { id: 'gbc', name: 'Game Boy Color (GBC)', exts: ['.gbc', '.gb'] },
  { id: 'n64', name: 'Nintendo 64 (N64)', exts: ['.n64', '.z64', '.v64'] },
  { id: 'nds', name: 'Nintendo DS (NDS)', exts: ['.nds'] },
  { id: 'segaMD', name: 'Sega Genesis / MegaDrive', exts: ['.md', '.smd', '.gen', '.bin'] },
  { id: 'psx', name: 'PlayStation 1 (PSX)', exts: ['.iso', '.cue', '.chd'] }
];

export const EmulatorZone: React.FC = () => {
  const [selectedCore, setSelectedCore] = useState<string>('nes');
  const [currentRomUrl, setCurrentRomUrl] = useState<string | null>(null);
  const [currentRomName, setCurrentRomName] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);

  // Netplay State
  const [netplayRoom, setNetplayRoom] = useState<string>('');
  const [isCopiedRoom, setIsCopiedRoom] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'play' | 'library' | 'saves' | 'netplay'>('library');

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Auto detect core from filename
  const detectCoreFromFilename = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.nes')) return 'nes';
    if (lower.endsWith('.gba')) return 'gba';
    if (lower.endsWith('.gbc') || lower.endsWith('.gb')) return 'gbc';
    if (lower.endsWith('.snes') || lower.endsWith('.smc') || lower.endsWith('.sfc')) return 'snes';
    if (lower.endsWith('.n64') || lower.endsWith('.z64') || lower.endsWith('.v64')) return 'n64';
    if (lower.endsWith('.nds')) return 'nds';
    if (lower.endsWith('.md') || lower.endsWith('.smd') || lower.endsWith('.gen')) return 'segaMD';
    if (lower.endsWith('.iso') || lower.endsWith('.cue') || lower.endsWith('.chd')) return 'psx';
    return selectedCore;
  };

  // Launch ROM into EmulatorJS Engine
  const launchRom = (romUrl: string, gameName: string, core: string) => {
    setCurrentRomUrl(romUrl);
    setCurrentRomName(gameName);
    setSelectedCore(core);
    setIsPlaying(true);
    setActiveTab('play');

    // Scroll smoothly to player container
    setTimeout(() => {
      if (playerContainerRef.current) {
        playerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
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

  // Effect to load EmulatorJS scripts dynamically
  useEffect(() => {
    if (!isPlaying || !currentRomUrl) return;

    // Clean up existing instance if any
    const container = document.getElementById('ejs-game-container');
    if (container) {
      container.innerHTML = '';
    }

    // Configure EmulatorJS globals on window
    (window as any).EJS_player = '#ejs-game-container';
    (window as any).EJS_core = selectedCore;
    (window as any).EJS_gameName = currentRomName || 'Quán Game Xóm ROM';
    (window as any).EJS_gameUrl = currentRomUrl;
    (window as any).EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';
    (window as any).EJS_startOnLoaded = true;
    (window as any).EJS_color = '#f59e0b'; // Amber theme
    (window as any).EJS_fps = 60; // Ép cố định 60 FPS tối ưu độ mượt
    (window as any).EJS_targetFps = 60;

    // Phím điều khiển mặc định (Default Keybindings)
    // Di chuyển: W = Lên, A = Trái, S = Xuống, D = Phải
    // NES: K = A, L = B, C = Start, V = Select
    // SNES: J = Y, K = B, I = X, L = A, Q = L (shoulder), O = R (shoulder), C = Start, V = Select
    (window as any).EJS_defaultControls = {
      0: {
        0: 'KeyW',   // Up (W)
        1: 'KeyS',   // Down (S)
        2: 'KeyA',   // Left (A)
        3: 'KeyD',   // Right (D)
        4: 'KeyK',   // A / B
        5: 'KeyL',   // B / A
        6: 'KeyV',   // Select (V)
        7: 'KeyC',   // Start (C)
        8: 'KeyJ',   // Y (SNES)
        9: 'KeyI',   // X (SNES)
        10: 'KeyQ',  // L Shoulder (SNES)
        11: 'KeyO'   // R Shoulder (SNES)
      }
    };

    if (netplayRoom.trim()) {
      (window as any).EJS_room = netplayRoom.trim();
    }

    // Inject EmulatorJS loader script
    const script = document.createElement('script');
    script.id = 'emulatorjs-loader-script';
    script.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    script.async = true;

    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('emulatorjs-loader-script');
      if (existingScript) existingScript.remove();
      if (container) container.innerHTML = '';
    };
  }, [isPlaying, currentRomUrl, selectedCore, netplayRoom]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-10 mb-8 border border-amber-500/30 bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>EMULATORJS WEB ENGINE 2026</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
              KHU VỰC <span className="text-amber-400 text-glow-amber">GIẢ LẬP GAME</span>
            </h1>
            <p className="text-xs sm:text-sm font-body text-slate-300 leading-relaxed">
              Trải nghiệm game Retro cổ điển (NES, SNES, GBA, N64, NDS, PS1...) chạy trực tiếp 100% trên trình duyệt web. Không cần cài đặt phần mềm ngoài, mượt mà và cực kỳ tiện lợi!
            </p>
          </div>

          {/* Quick Action Load File Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <label className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl text-xs font-mono uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer">
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
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            <span>Thư Viện ROM Có Sẵn</span>
          </button>

          <button
            onClick={() => setActiveTab('play')}
            disabled={!isPlaying}
            className={`px-4 py-2 rounded-xl text-xs font-display font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'play'
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : isPlaying
                ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                : 'opacity-40 cursor-not-allowed text-slate-500'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Màn Hình Mới Chơi {isPlaying && `(${currentRomName})`}</span>
          </button>

          <button
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
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>THƯ VIỆN ROM MẪU & TẢI FILE CÁ NHÂN</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Bấm vào game bên dưới để chơi ngay lập tức, hoặc tải file ROM cá nhân của bạn từ máy tính!
              </p>
            </div>

            {/* Core Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 whitespace-nowrap">Hệ máy mặc định:</span>
              <select
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRESET_ROMS.map((rom) => (
              <div
                key={rom.id}
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

                  <button
                    onClick={() => launchRom(rom.romUrl, rom.title, rom.system)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>NẠP GAME & CHƠI NGAY</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Local File Upload Box */}
          <div className="mt-8 p-6 glass-modal rounded-3xl border border-dashed border-amber-500/40 text-center space-y-3 bg-gradient-to-b from-slate-950 to-amber-950/20">
            <Upload className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white font-display">Tải Lên File ROM Từ Máy Cá Nhân</h3>
            <p className="text-xs text-slate-400 max-w-xl mx-auto font-body">
              Hỗ trợ các file đuôi: <strong className="text-amber-300 font-mono">.nes, .gba, .gbc, .snes, .n64, .nds, .iso, .md</strong>. File sẽ được nạp trực tiếp vào bộ nhớ trình duyệt, hoàn toàn bảo mật và không lưu file lên server.
            </p>
            <label className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 hover:text-white rounded-2xl text-xs font-bold font-mono transition-all cursor-pointer shadow-lg">
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
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white font-display">
                  Đang Chơi: <span className="text-amber-300">{currentRomName || 'ROM Game'}</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  Hệ Máy Core: {SYSTEM_CORES.find(c => c.id === selectedCore)?.name || selectedCore}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentRomUrl(null);
                setActiveTab('library');
              }}
              className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-600 border border-red-500/50 text-red-200 hover:text-white rounded-xl text-xs font-bold font-mono transition-all cursor-pointer"
            >
              Thoát Game
            </button>
          </div>

          {/* EMULATORJS CONTAINER CONTAINER */}
          <div className="relative w-full aspect-[4/3] max-h-[720px] bg-black rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl flex items-center justify-center">
            <div id="ejs-game-container" className="w-full h-full" />
          </div>

          {/* Quick Control Hints & Keybindings Guide */}
          <div className="p-5 glass-modal rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-3 font-mono shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Info className="w-4 h-4 text-amber-400" />
                <span>CẤU HÌNH PHÍM MẶC ĐỊNH & TỐC ĐỘ KhUNG HÌNH (60 FPS)</span>
              </div>
              <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                ⚡ FPS: 60 FPS Locked
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] leading-relaxed">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">🎮 Di Chuyển (D-Pad):</span>
                <span>W = Lên | A = Trái | S = Xuống | D = Phải</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-red-400 font-bold block mb-1">🔴 Hệ NES (8-bit):</span>
                <span>K = Nút A | L = Nút B | C = Start | V = Select</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-indigo-400 font-bold block mb-1">🟣 Hệ SNES (16-bit):</span>
                <span>J = Y | K = B | I = X | L = A | Q = L | O = R | C = Start | V = Select</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans italic text-right">
              * Bạn vẫn có thể tùy chỉnh lại phím điều khiển theo sở thích cá nhân trong menu Cài Đặt góc dưới EmulatorJS.
            </p>
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
                type="text"
                value={netplayRoom}
                onChange={(e) => setNetplayRoom(e.target.value)}
                placeholder="Nhập mã phòng hoặc bấm Tạo Mã..."
                className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-amber-300 font-mono font-bold outline-none"
              />

              <button
                type="button"
                onClick={handleCreateRoom}
                className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
              >
                Tạo Mã Mới
              </button>

              {netplayRoom && (
                <button
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
                <li>Chọn 1 game mẫu từ Thư viện ROM và bấm Nạp Game.</li>
                <li>Gửi mã phòng này cho bạn bè, họ cũng nhập đúng mã này và nạp cùng 1 file ROM để bắt đầu kết nối Netplay Player 2!</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
