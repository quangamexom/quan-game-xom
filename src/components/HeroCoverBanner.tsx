import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, ChevronLeft, ChevronRight, Calendar, Star, Info, Gamepad2 } from 'lucide-react';
import { GameItem } from '../types';

interface HeroSlide {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  bgImage: string;
  gameId?: string;
  badgeColor?: string;
}

interface HeroCoverBannerProps {
  onGoToGames: () => void;
  onGoToArticles: () => void;
  onOpenDonate: () => void;
  onSelectGame?: (game: GameItem) => void;
  featuredGames?: GameItem[];
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: '1',
    label: 'VIỆT HÓA ⭐ HOT 2026',
    title: 'BLACK MYTH: WUKONG',
    subtitle: 'Siêu phẩm Nhập Vai Hành Động Thần Thoại Tây Du',
    description: 'Hóa thân thành Ngộ Không trong hành trình phục thù hoành tráng, đồ họa Unreal Engine 5 đỉnh cao, bản Việt Hóa chuẩn 100% ngữ cảnh từ Quán Game Xóm.',
    date: '04/10',
    bgImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920&auto=format&fit=crop',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20'
  },
  {
    id: '2',
    label: 'BẢN QUYỀN VIỆT HÓA',
    title: 'GOD OF WAR RAGNARÖK',
    subtitle: 'Hành Trình Cuối Cùng Của Kratos & Atreus Tại Cửu Giới',
    description: 'Trải nghiệm cuộc chiến định mệnh chống lại các thần Bắc Âu. Bản Việt Hóa trọn bộ thoại và giao diện, đồ họa rực rỡ tốc độ cao không cần giả lập rườm rà.',
    date: '12/08',
    bgImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-500/20'
  },
  {
    id: '3',
    label: 'KINH DỊ HỒI HỘP',
    title: 'RESIDENT EVIL 3 RE-MAKE',
    subtitle: 'Chạy Trốn Nemesis Trong Thành Phố Raccoon Sụp Đổ',
    description: 'Thoát khỏi thảm họa T-Virus cùng Jill Valentine. Đồ họa RE Engine siêu chân thực, hỗ trợ giả lập và bản dịch Việt Hóa trọn vẹn từng trang tài liệu.',
    date: '15/06',
    bgImage: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
    badgeColor: 'border-red-400 text-red-300 bg-red-500/20'
  },
  {
    id: '4',
    label: 'KÝ ỨC RETRO PS1',
    title: 'FINAL FANTASY IX VIỆT HÓA',
    subtitle: 'Hành Trình Của Zidane & Dagger - Đỉnh Cao PS1 Tuổi Thơ',
    description: 'Sống lại những đêm thức trắng cắm mặt màn hình CRT cùng nhóm bạn quán net. Bản giả lập PS1 sẵn kèm Việt Hóa chuẩn phong cách Quán Game Xóm.',
    date: '01/05',
    bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop',
    badgeColor: 'border-indigo-400 text-indigo-300 bg-indigo-500/20'
  }
];

export const HeroCoverBanner: React.FC<HeroCoverBannerProps> = ({
  onGoToGames,
  onGoToArticles,
  onOpenDonate,
  onSelectGame,
  featuredGames = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto advance slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = DEFAULT_SLIDES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % DEFAULT_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + DEFAULT_SLIDES.length) % DEFAULT_SLIDES.length);
  };

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-0 sm:h-[620px] lg:h-[680px] bg-[#05070E] overflow-hidden text-white border-b border-indigo-950/80 shadow-2xl">
      
      {/* Background Slide Image with Animated Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center filter brightness-[0.7] saturate-125"
          style={{ backgroundImage: `url('${slide.bgImage}')` }}
        />
      </AnimatePresence>

      {/* Dark Gradient Overlay for optimal legibility (Dark at bottom-up & left-right) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 crt-scanlines opacity-30 z-10 pointer-events-none" />

      {/* Content Container (pb-20 on mobile ensures bottom nav bar doesn't overlap) */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 h-full flex flex-col justify-end pt-12 pb-20 sm:pb-16 z-20">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl space-y-2 sm:space-y-4"
          >
            {/* Small Editorial Label above title */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-amber-400/40 bg-slate-950/70 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
              <span className="font-cinematic italic text-sm sm:text-2xl font-normal tracking-[0.05em] text-amber-200 drop-shadow">
                {slide.label}
              </span>
            </div>

            {/* Main Cinematic Title */}
            <div className="space-y-1 pt-0.5 sm:pt-1">
              <h1 className="font-cinematic font-black text-2xl xs:text-3xl sm:text-5xl lg:text-[70px] uppercase text-white tracking-normal leading-tight sm:leading-[1.05] drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] line-clamp-2">
                {slide.title}
              </h1>
              <p className="font-cinematic italic font-semibold text-xs xs:text-sm sm:text-2xl text-amber-300/90 tracking-wide drop-shadow-md line-clamp-1">
                "{slide.subtitle}"
              </p>
            </div>

            {/* Short 2-line description */}
            <p className="text-xs sm:text-[17px] text-slate-200/95 font-body leading-relaxed sm:leading-[1.6] max-w-2xl line-clamp-2 drop-shadow-md">
              {slide.description}
            </p>

            {/* CTA Button & Actions */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={onGoToGames}
                className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950" />
                <span>XEM THÔNG TIN & TẢI GAME</span>
              </button>

              <button
                onClick={onGoToArticles}
                className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-display font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>KÝ ỨC RETRO</span>
              </button>
            </div>

          </motion.div>
        </AnimatePresence>

        {/* Bottom Bar Controls: Date & Index on Left, Dot Pagination in Center, Nav Arrows on Right */}
        <div className="pt-3 sm:pt-6 flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-t border-slate-800/60 mt-3 sm:mt-6">
          
          {/* Bottom Left Date & Slide Counter */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono font-bold text-slate-400">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-800">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>CẬP NHẬT: <strong className="text-amber-300">{slide.date}</strong></span>
            </div>
            <div className="text-amber-400/90 font-mono text-xs sm:text-sm tracking-wider">
              0{currentIndex + 1} <span className="text-slate-600">/</span> 0{DEFAULT_SLIDES.length}
            </div>
          </div>

          {/* Center Dot Pagination */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {DEFAULT_SLIDES.map((s, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'w-6 sm:w-8 h-2 sm:h-2.5 bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Right Prev/Next Manual Arrow Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrev}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/80 text-slate-300 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Slide trước"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/80 text-slate-300 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
              title="Slide kế tiếp"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
