import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { Download, Star, ExternalLink, ShieldCheck, Gamepad2, Layers, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface HeroSectionProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onOpenDownload: (game: GameItem) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ games, onSelectGame, onOpenDownload }) => {
  const featuredGames = games.filter(g => g.isFeatured || g.rating && g.rating >= 4.8).slice(0, 5);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (featuredGames.length === 0) return null;

  const currentGame = featuredGames[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredGames.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredGames.length) % featuredGames.length);
  };

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 border-b border-slate-800/80 mb-8 pt-4 pb-8">
      
      {/* Dynamic Fanart Backdrop */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.25, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none filter blur-sm"
          style={{ backgroundImage: `url(${currentGame.backdropArt || currentGame.coverArt})` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Top Tagline */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-400 font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              HOT SPOTS 2026 • KHO GAME TUYỂN CHỌN
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all cursor-pointer"
              aria-label="Previous Game"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 font-bold px-2">
              {currentIndex + 1} / {featuredGames.length}
            </span>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-full bg-slate-900/80 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all cursor-pointer"
              aria-label="Next Game"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Featured Card Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="lg:col-span-8 flex flex-col justify-center z-10">
            
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {currentGame.hasVietHoa && (
                <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                  VIỆT HÓA CHUẨN ⭐
                </span>
              )}

              {currentGame.platforms.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-full"
                >
                  {p}
                </span>
              ))}

              {currentGame.rating && (
                <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-full">
                  ★ {currentGame.rating} / 5.0
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              {currentGame.title}
            </h3>

            {currentGame.subtitle && (
              <p className="text-sm sm:text-base text-amber-300/90 font-medium mb-4">
                {currentGame.subtitle}
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl line-clamp-3 mb-6 leading-relaxed">
              {currentGame.description || "Tải game cực nhanh full băng thông, việt hóa chuẩn sắc nét, cài đặt đơn giản từ Quán Game Xóm."}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenDownload(currentGame)}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 fill-slate-950" />
                <span>TẢI GAME NGAY ({currentGame.fileSize || 'Full DLC'})</span>
              </button>

              <button
                onClick={() => onSelectGame(currentGame)}
                className="px-5 py-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Xem Thông Tin LaunchBox</span>
              </button>

              {currentGame.fbPreviewUrl && (
                <a
                  href={currentGame.fbPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Bài Viết Preview FB</span>
                </a>
              )}
            </div>

          </div>

          {/* Right Poster */}
          <div className="lg:col-span-4 flex justify-center z-10">
            <div className="relative group cursor-pointer" onClick={() => onSelectGame(currentGame)}>
              <div className="absolute -inset-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
              <img
                src={currentGame.coverArt}
                alt={currentGame.title}
                className="relative w-48 sm:w-60 lg:w-full max-w-[260px] h-64 sm:h-80 lg:h-96 object-cover rounded-xl shadow-2xl border border-amber-500/30 group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-slate-950/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-mono font-bold text-amber-300 border border-amber-500/40">
                {currentGame.platforms[0]}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
