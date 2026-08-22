import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { Download, Sparkles, ChevronRight, Play, Eye, Star, Shield, ArrowRight } from 'lucide-react';

interface HeroWildRiftProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onOpenDownload: (game: GameItem) => void;
}

export const HeroWildRift: React.FC<HeroWildRiftProps> = ({ games, onSelectGame, onOpenDownload }) => {
  const featuredList = games.filter(g => g.isFeatured || (g.rating && g.rating >= 4.8)).slice(0, 4);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentGame = featuredList[activeIndex] || games[0];

  if (!currentGame) return null;

  // Background artwork list matching the reference design
  const backgroundArts = [
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop"
  ];

  return (
    <div className="relative w-full min-h-[520px] lg:min-h-[620px] bg-[#0A0D14] overflow-hidden text-white flex items-center border-b border-indigo-950/60 shadow-2xl">
      
      {/* 1. Atmospheric Dark Fantasy Wallpaper Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentGame.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.35, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center pointer-events-none filter brightness-90 saturate-125"
          style={{ backgroundImage: `url(${currentGame.backdropArt || backgroundArts[activeIndex % backgroundArts.length]})` }}
        />
      </AnimatePresence>

      {/* Vignette Gradient Masks matching Riot WildRift website UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/70 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Hero Content Section */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
          
          {/* Tagline Badge */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="px-3 py-1 bg-indigo-950/80 border border-indigo-500/30 rounded-full text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              HOT TRENDING • QUÁN GAME XÓM 2026
            </span>
          </div>

          {/* Large Hero Headline matching screenshot: "BEAUTIFUL GAME, INTENSE REALITY" */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] text-white font-sans drop-shadow-lg">
            GAME ĐỈNH CAO, <br />
            <span className="bg-gradient-to-r from-indigo-200 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              TRẢI NGHIỆM THẬT
            </span>
          </h1>

          {/* Subtitle description */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal opacity-90">
            {currentGame.description || "Kho game PC, Mobile, Việt Hóa & Giả Lập được tuyển chọn kỹ lưỡng. Tải nhanh full băng thông, hướng dẫn chi tiết từ Quán Game Xóm."}
          </p>

          {/* Primary Action Buttons matching Screenshot 2 (Indigo Button) */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onOpenDownload(currentGame)}
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-lg shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:shadow-[0_0_35px_rgba(99,102,241,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer border border-indigo-400/40"
            >
              <Download className="w-4 h-4 fill-white" />
              <span>TẢI GAME MIỄN PHÍ</span>
            </button>

            <button
              onClick={() => onSelectGame(currentGame)}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm rounded-lg hover:border-indigo-500/40 transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>XEM CHI TIẾT</span>
            </button>
          </div>

          {/* Slider Pagination Dots (Matching Screenshot 2 bottom left) */}
          <div className="flex items-center gap-2 pt-4">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'w-8 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Right Floating Preview Cards Section matching Screenshot 2 */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end items-end">
          {featuredList.slice(0, 4).map((game, idx) => (
            <motion.div
              key={game.id}
              whileHover={{ scale: 1.02, y: -2 }}
              onClick={() => {
                setActiveIndex(idx);
                onSelectGame(game);
              }}
              className={`w-full max-w-sm cursor-pointer rounded-2xl overflow-hidden border ${
                activeIndex === idx 
                  ? 'border-indigo-500/80 shadow-[0_0_25px_rgba(99,102,241,0.4)] bg-slate-900/90' 
                  : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700'
              } backdrop-blur-xl p-2.5 flex gap-3 transition-all relative group`}
            >
              {/* Thumbnail Image */}
              <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0 relative">
                <img
                  src={game.coverArt}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {game.hasVietHoa && (
                  <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    VIỆT HÓA
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 flex flex-col justify-between py-0.5">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold block mb-0.5">
                    {game.addedDate || "CẬP NHẬT MỚI"}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {game.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-300">{game.fileSize || "Full Version"}</span>
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {game.rating || 4.9}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </div>
  );
};
