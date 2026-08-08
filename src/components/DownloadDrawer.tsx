import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { X, Download, Key, Copy, Check, ShieldCheck, Zap, HardDrive, ExternalLink, Gamepad2 } from 'lucide-react';
import { useGameCover } from '../hooks/useGameCover';
import { parseGameTitle } from '../utils/titleParser';

interface DownloadDrawerProps {
  game: GameItem | null;
  onClose: () => void;
  defaultPassword?: string;
}

export const DownloadDrawer: React.FC<DownloadDrawerProps> = ({
  game,
  onClose,
  defaultPassword = "quangamexom"
}) => {
  const [copiedPass, setCopiedPass] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);

  const coverState = useGameCover(game || { id: '', title: '', coverArt: '', downloadLinks: [], platforms: [], isHot: false, hasVietHoa: false });
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!game) return;
    setCountdown(3);
    setIsReady(false);
    setImgError(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReady(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [game]);

  if (!game) return null;

  const { cleanTitle, subtitle } = parseGameTitle(game.title, game.subtitle);
  const displayCover = coverState.coverUrl;

  const handleCopyPass = () => {
    navigator.clipboard.writeText(defaultPassword);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleDownloadClick = (url?: string) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        
        {/* Backdrop Click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl glass-modal rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 overflow-hidden border border-amber-500/30 text-slate-100"
        >
          {/* Top Decorative Line */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Info */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl border border-amber-500/40 shrink-0 overflow-hidden bg-slate-950 shadow-lg flex items-center justify-center">
              {displayCover && !imgError ? (
                <img
                  src={displayCover}
                  alt={game.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-1 text-center">
                  <Gamepad2 className="w-6 h-6 text-amber-400 mb-1" />
                  <span className="text-[8px] font-mono text-slate-400">Quán Game Xóm</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold rounded border border-amber-500/30">
                  {game.platforms.join(' • ')}
                </span>
                {game.hasVietHoa && (
                  <span className="px-2 py-0.5 bg-red-600/30 text-red-300 border border-red-500/40 text-[10px] font-bold rounded flex items-center gap-1">
                    🇻🇳 Việt Hóa ⭐
                  </span>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                {cleanTitle}
              </h3>
              {(subtitle || game.subtitle) && (
                <p className="text-xs text-amber-400/90 font-medium">
                  {subtitle || game.subtitle}
                </p>
              )}

              <p className="text-xs text-slate-400 mt-1 font-mono">
                Dung lượng: <strong className="text-amber-300">{game.fileSize || 'Standard Full ISO/Install'}</strong>
              </p>
            </div>
          </div>

          {/* Password Quick-Copy Bar */}
          <div className="glass-panel border border-amber-500/40 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">PASS GIẢI NÉN MẶC ĐỊNH</span>
                <span className="text-sm font-bold text-amber-300 font-mono">{defaultPassword}</span>
              </div>
            </div>

            <button
              onClick={handleCopyPass}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer"
            >
              {copiedPass ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Đã Chép Pass!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao Chép Pass</span>
                </>
              )}
            </button>
          </div>

          {/* Download Mirrors Section */}
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-amber-400" />
              CHỌN LINK TẢI TỐC ĐỘ CAO (VIP SPEED):
            </h4>

            {/* Main Link */}
            <button
              onClick={() => handleDownloadClick(game.downloadUrl || 'https://drive.google.com')}
              className="w-full p-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-sm shadow-xl flex items-center justify-between transition-all hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 fill-slate-950" />
                <div className="text-left">
                  <span className="block leading-tight font-extrabold">LINK TẢI CHÍNH (GOOGLE DRIVE / VIP DIRECT)</span>
                  <span className="text-[10px] font-mono text-slate-900 opacity-90">Băng thông tối đa • Đã quét virus 100%</span>
                </div>
              </div>

              {!isReady ? (
                <span className="px-3 py-1 bg-slate-950/20 rounded-lg text-xs font-mono font-bold animate-pulse">
                  Chuẩn bị link... {countdown}s
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-950 text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1">
                  TẢI NGAY <ExternalLink className="w-3.5 h-3.5" />
                </span>
              )}
            </button>

            {/* Mirror Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {game.mirror1Url && (
                <button
                  onClick={() => handleDownloadClick(game.mirror1Url)}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    <span>MIRROR 1 (TERABOX / MEGA)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}

              {game.mirror2Url && (
                <button
                  onClick={() => handleDownloadClick(game.mirror2Url)}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>MIRROR 2 (FSHARE / BACKUP)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Notes & Instructions */}
          <div className="glass-panel p-3.5 border border-white/10 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>LƯU Ý KHI CÀI ĐẶT GAME:</span>
            </div>
            <p>• Dùng <strong>WinRAR</strong> hoặc <strong>7-Zip</strong> mới nhất để giải nén với mật khẩu <code className="text-amber-300 font-mono">quangamexom</code>.</p>
            <p>• Tắt tạm thời Antivirus / Windows Defender nếu game có phần mềm bẻ khóa / patch Việt Hóa.</p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
