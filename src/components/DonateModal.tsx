import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Coffee, Copy, Check, Heart, QrCode, Sparkles } from 'lucide-react';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
  const [copiedBank, setCopiedBank] = useState(false);

  if (!isOpen) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText("1766393939");
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Window with Translucent Glass Border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg bg-[#0D1220]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] z-10 text-center overflow-hidden backdrop-blur-2xl"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-full transition-colors cursor-pointer border border-white/10 z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Character Speech Bubble & Visual Reference (Matching Image 3) */}
          <div className="relative mb-6">
            
            {/* Speech Bubble: "♪ Mời chủ Quán ly trà đá~ ❤️" */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-block relative bg-white text-slate-950 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-lg border border-pink-300 mb-3"
            >
              <span>♪ Mời chủ Quán ly trà đá~ ❤️</span>
              {/* Speech tail */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
            </motion.div>

            {/* Anime Character Artwork & QR Glass Frame (Inspired by Image 3) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-2">
              
              {/* Chibi Tifa SVG Representation */}
              <div className="relative w-36 h-48 shrink-0 flex flex-col items-center justify-center">
                <svg viewBox="0 0 160 200" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  <defs>
                    <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2D1D1E" />
                      <stop offset="100%" stopColor="#120B0C" />
                    </linearGradient>
                    <linearGradient id="gloveGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#991B1B" />
                    </linearGradient>
                  </defs>

                  {/* Long Dark Anime Hair Background */}
                  <path d="M 40 40 Q 20 70, 25 140 Q 30 170, 50 190 Q 70 180, 55 130 Z" fill="url(#hairGrad)" />
                  <path d="M 120 40 Q 140 70, 135 140 Q 130 170, 110 190 Q 90 180, 105 130 Z" fill="url(#hairGrad)" />

                  {/* Body & Clothes (White Tank top & Dark Skirt) */}
                  <path d="M 60 110 L 100 110 L 105 160 L 55 160 Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
                  <path d="M 55 150 L 105 150 L 108 175 L 52 175 Z" fill="#1E293B" />
                  <rect x="58" y="148" width="44" height="4" fill="#94A3B8" />

                  {/* Red Boots */}
                  <path d="M 52 175 L 72 175 L 75 198 L 48 198 Z" fill="url(#gloveGrad)" />
                  <path d="M 88 175 L 108 175 L 112 198 L 85 198 Z" fill="url(#gloveGrad)" />

                  {/* Face Base */}
                  <path d="M 48 60 Q 80 110, 112 60 Q 115 40, 80 30 Q 45 40, 48 60 Z" fill="#FFEDD5" />

                  {/* Cute Anime Eyes (Warm Brown & Big Sparkle) */}
                  <ellipse cx="62" cy="66" rx="9" ry="12" fill="#7C2D12" />
                  <ellipse cx="62" cy="66" rx="6" ry="9" fill="#9A3412" />
                  <circle cx="60" cy="61" r="3" fill="#FFFFFF" />

                  <ellipse cx="98" cy="66" rx="9" ry="12" fill="#7C2D12" />
                  <ellipse cx="98" cy="66" rx="6" ry="9" fill="#9A3412" />
                  <circle cx="96" cy="61" r="3" fill="#FFFFFF" />

                  {/* Cute Blushing Cheeks & Smile */}
                  <ellipse cx="56" cy="74" rx="6" ry="3" fill="#FCA5A5" opacity="0.7" />
                  <ellipse cx="104" cy="74" rx="6" ry="3" fill="#FCA5A5" opacity="0.7" />
                  <path d="M 74 76 Q 80 82, 86 76" fill="none" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />

                  {/* Hair Bangs */}
                  <path d="M 45 45 Q 60 35, 80 50 Q 100 35, 115 45 Q 120 25, 80 15 Q 40 25, 45 45 Z" fill="url(#hairGrad)" />

                  {/* Side Ponytail Tail */}
                  <path d="M 110 80 Q 135 90, 125 140 Q 115 145, 105 110 Z" fill="url(#hairGrad)" />

                  {/* Red Gloves Arms */}
                  <rect x="36" y="105" width="16" height="35" rx="4" fill="url(#gloveGrad)" transform="rotate(15 36 105)" />
                  <rect x="108" y="105" width="16" height="35" rx="4" fill="url(#gloveGrad)" transform="rotate(-15 108 105)" />
                </svg>
              </div>

              {/* Glass Frame QR Code Box (Matching Glassmorphic Holder in Image 3) */}
              <div className="relative group p-3 bg-slate-950/80 border-2 border-cyan-400/50 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.25)] backdrop-blur-md">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
                <div className="relative bg-white p-2 rounded-xl">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=STK%3A1766393939%20NganHang%3ATechcombank%20NoiDung%3AUngHoQuanGameXom"
                    alt="VietQR Quán Game Xóm"
                    className="w-40 h-40 object-contain"
                  />
                </div>
              </div>

            </div>

          </div>

          <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <span>Ủng Hộ Duy Trì Quán Game Xóm</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Mọi game chia sẻ tại đây đều <strong>FREE 100%</strong>, không chứa quảng cáo hay rút gọn link rác. Sự ủng hộ giúp duy trì server & Việt Hóa!
          </p>

          {/* Account Information Card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-4 my-5 text-left relative backdrop-blur-md">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> TECHCOMBANK (VIETQR)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                ỦNG HỘ TỰ NGUYỆN
              </span>
            </div>

            <div className="text-[11px] text-slate-400">TÊN TÀI KHOẢN:</div>
            <div className="text-sm font-black text-white tracking-wider mb-2">QUÁN GAME XÓM (QGX REBOOT)</div>

            <div className="text-[11px] text-slate-400">SỐ TÀI KHOẢN:</div>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-mono font-black text-amber-300 tracking-widest">1766393939</span>
              
              <button
                onClick={handleCopyAccount}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/30 active:scale-95"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã Sao Chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao Chép STK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-bounce" />
            <span>Cảm ơn sự yêu mến & đồng hành của bạn!</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
