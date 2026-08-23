import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, ChevronLeft, ChevronRight, Calendar, Star, Info, Gamepad2 } from 'lucide-react';
import { GameItem } from '../types';
import { useGameCover, useGameBanner } from '../hooks/useGameCover';
import { parseGameTitle } from '../utils/titleParser';

interface HeroSlide {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  date: string;
  badgeColor?: string;
  fallbackCover?: string;
  fallbackBanner?: string;
}

interface HeroCoverBannerProps {
  onGoToGames: () => void;
  onGoToArticles: () => void;
  onOpenDonate: () => void;
  onSelectGame?: (game: GameItem) => void;
  featuredGames?: GameItem[];
}

const DEFAULT_RETRO_SLIDES: HeroSlide[] = [
  {
    id: 'snes-1',
    label: 'VIỆT HÓA ⭐ SNES 16-BIT',
    title: 'Yu Yu Hakusho (Việt Hóa)',
    subtitle: 'Hành Trình U Meshi • Nhất Dương Chỉ',
    description: 'Hóa thân thành Yusuke Urameshi và đồng đội trong Đại Hội Võ Thuật Bóng Tối đỉnh cao. Bản dịch Tiếng Việt chuẩn 100% ngữ cảnh trên hệ máy Super Nintendo (SNES).',
    date: '22/08',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop'
  },
  {
    id: 'snes-2',
    label: 'VIỆT HÓA ⭐ HUYỀN THOẠI SNES',
    title: 'Mega Man X2 (Việt Hóa)',
    subtitle: 'Rockman X2 • Phục Sinh Zero',
    description: 'Đồng hành cùng chiến binh X săn lùng 8 trùm Maverick và đánh bại nhóm X-Hunters để giải cứu các bộ phận của Zero. Bản Việt Hóa hoàn chỉnh Quán Game Xóm.',
    date: '22/08',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop'
  },
  {
    id: 'snes-3',
    label: 'ĐỐI KHÁNG ĐI CẢNH 16-BIT',
    title: 'Battletoads & Double Dragon',
    subtitle: 'The Ultimate Team • SNES 16-Bit',
    description: 'Cú bắt tay lịch sử giữa binh đoàn ếch chiến binh Battletoads và hai anh em song long Billy & Jimmy của Double Dragon trên Super Nintendo.',
    date: '15/08',
    badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'snes-4',
    label: 'SIÊU NHÂN ĐỐI KHÁNG RETRO',
    title: 'Mighty Morphin Power Rangers',
    subtitle: 'The Fighting Edition • Super Nintendo',
    description: 'Đại chiến Robot khổng lồ Megazord, Dragonzord và quái vật kinh điển của 5 Anh Em Siêu Nhân trên hệ máy Super Nintendo (SNES).',
    date: '15/08',
    badgeColor: 'border-red-400 text-red-300 bg-red-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=600&auto=format&fit=crop'
  }
];

interface HeroSlideContentProps {
  slide: HeroSlide;
  featuredGames?: GameItem[];
  onGoToGames: () => void;
  onGoToArticles: () => void;
  onSelectGame?: (game: GameItem) => void;
}

const HeroSlideContent: React.FC<HeroSlideContentProps> = ({
  slide,
  featuredGames,
  onGoToGames,
  onGoToArticles,
  onSelectGame
}) => {
  // Construct game object for hooks
  const slideGame: GameItem = useMemo(() => {
    const match = featuredGames?.find(g =>
      g.title.toLowerCase().includes(slide.title.toLowerCase()) ||
      slide.title.toLowerCase().includes(g.title.toLowerCase())
    );
    if (match) return match;

    return {
      id: `hero-slide-${slide.id}`,
      title: slide.title,
      subtitle: slide.subtitle,
      description: slide.description,
      coverArt: slide.fallbackCover || '',
      backdropArt: slide.fallbackBanner || '',
      platforms: ['Other'],
      language: slide.title.includes('Việt Hóa') ? 'Tiếng Việt 🇻🇳' : 'Tiếng Anh',
      hasVietHoa: slide.title.includes('Việt Hóa'),
      downloadUrl: '',
      emulatorCore: 'snes'
    };
  }, [slide, featuredGames]);

  // RAWG Hooks for Cover Boxart & Hero Banner
  const { coverUrl, isLoading: isCoverLoading } = useGameCover(slideGame);
  const { bannerUrl, isLoading: isBannerLoading } = useGameBanner(slideGame);

  const effectiveBanner = bannerUrl || slideGame.backdropArt || slide.fallbackBanner;
  const effectiveCover = coverUrl || slideGame.coverArt || slide.fallbackCover;

  const { cleanTitle, subtitle } = parseGameTitle(slide.title, slide.subtitle);

  const handleGameClick = () => {
    if (onSelectGame) {
      onSelectGame(slideGame);
    } else {
      onGoToGames();
    }
  };

  return (
    <div className="absolute inset-0">
      {/* Background Slide Image with RAWG Banner & Skeleton */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isBannerLoading && !effectiveBanner ? (
          <div className="absolute inset-0 bg-slate-950 animate-pulse">
            <div className="w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 animate-pulse" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute inset-0 bg-cover bg-center filter brightness-[0.65] saturate-125 transition-all duration-700"
            style={{ backgroundImage: `url('${effectiveBanner}')` }}
          />
        )}
      </div>

      {/* Dark Gradient Overlay for optimal legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/70 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 crt-scanlines opacity-30 z-10 pointer-events-none" />

      {/* Slide Content Box */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 h-full flex flex-col justify-end pt-12 pb-20 sm:pb-16 z-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 max-w-5xl"
        >
          {/* Vertical Boxart Poster (2:3 aspect ratio, glassmorphic border) */}
          <div
            onClick={handleGameClick}
            className="shrink-0 group cursor-pointer relative"
            title={`Xem chi tiết ${cleanTitle}`}
          >
            <div className="relative w-28 xs:w-32 sm:w-36 md:w-44 lg:w-48 aspect-[2/3] rounded-2xl p-1 bg-slate-900/80 border border-amber-400/40 shadow-[0_15px_35px_rgba(0,0,0,0.9)] backdrop-blur-md overflow-hidden transition-all duration-300 group-hover:border-amber-400/80 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.35)]">
              {isCoverLoading && !effectiveCover ? (
                <div className="w-full h-full rounded-xl bg-slate-800/80 animate-pulse flex flex-col items-center justify-center p-2 text-slate-500">
                  <Gamepad2 className="w-7 h-7 sm:w-9 sm:h-9 animate-bounce text-amber-400/60 mb-2" />
                  <span className="text-[10px] font-mono tracking-wider text-slate-400">LOADING...</span>
                </div>
              ) : (
                <img
                  src={effectiveCover}
                  alt={cleanTitle}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Badge overlay on poster */}
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 border border-amber-400/60 text-[10px] font-mono font-bold text-amber-300 shadow-md backdrop-blur-md flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>SNES</span>
              </div>
            </div>
          </div>

          {/* Main Text Content */}
          <div className="flex-1 space-y-2 sm:space-y-3.5">
            {/* Small Editorial Label */}
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full border border-amber-400/40 bg-slate-950/75 backdrop-blur-md shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />
              <span className="font-cinematic italic text-xs sm:text-lg font-medium tracking-[0.05em] text-amber-200 drop-shadow">
                {slide.label}
              </span>
            </div>

            {/* Main Cinematic Title */}
            <div className="space-y-1 pt-0.5 sm:pt-1">
              <h1 className="font-cinematic font-black text-2xl xs:text-3xl sm:text-4xl lg:text-[52px] uppercase text-white tracking-tight leading-tight sm:leading-[1.08] drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] line-clamp-2">
                {cleanTitle}
              </h1>
              {subtitle && (
                <p className="font-cinematic italic font-semibold text-xs xs:text-sm sm:text-xl text-amber-300/90 tracking-wide drop-shadow-md line-clamp-1">
                  "{subtitle}"
                </p>
              )}
            </div>

            {/* Short 2-line description */}
            <p className="text-xs sm:text-base text-slate-200/95 font-body leading-relaxed sm:leading-[1.55] max-w-2xl line-clamp-2 drop-shadow-md">
              {slide.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 pt-1 sm:pt-2">
              <button
                onClick={handleGameClick}
                className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
              >
                <Gamepad2 className="w-4 h-4 fill-slate-950" />
                <span>XEM CHI TIẾT & CHƠI NGAY</span>
              </button>

              <button
                onClick={onGoToArticles}
                className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-display font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>KÝ ỨC RETRO</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const HeroCoverBanner: React.FC<HeroCoverBannerProps> = ({
  onGoToGames,
  onGoToArticles,
  onOpenDonate,
  onSelectGame,
  featuredGames = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Derive slides dynamically from SNES / Retro featuredGames or default SNES slides
  const slides: HeroSlide[] = useMemo(() => {
    if (featuredGames && featuredGames.length > 0) {
      return featuredGames.slice(0, 6).map((g, idx) => ({
        id: g.id || `snes-slide-${idx}`,
        label: g.hasVietHoa ? 'VIỆT HÓA ⭐ SNES 16-BIT RETRO' : 'SUPER NINTENDO (SNES) RETRO',
        title: g.title,
        subtitle: g.subtitle || 'Kinh Điển Super Nintendo (SNES)',
        description: g.description || `${g.title} — Siêu phẩm kinh điển tuổi thơ hệ máy Super Nintendo (SNES) 16-bit. Trải nghiệm ngay trên Quán Game Xóm.`,
        date: g.addedDate ? g.addedDate.slice(5) : '22/08',
        badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
        fallbackCover: g.coverArt,
        fallbackBanner: g.backdropArt
      }));
    }
    return DEFAULT_RETRO_SLIDES;
  }, [featuredGames]);

  // Keep currentIndex in valid bounds if slides change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto advance slide every 6 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentIndex] || slides[0] || DEFAULT_RETRO_SLIDES[0];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full min-h-[620px] sm:min-h-0 sm:h-[620px] lg:h-[680px] bg-[#05070E] overflow-hidden text-white border-b border-indigo-950/80 shadow-2xl">
      
      {/* Slide Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div key={slide.id} className="absolute inset-0">
          <HeroSlideContent
            slide={slide}
            featuredGames={featuredGames}
            onGoToGames={onGoToGames}
            onGoToArticles={onGoToArticles}
            onSelectGame={onSelectGame}
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom Bar Controls: Date & Index on Left, Dot Pagination in Center, Nav Arrows on Right */}
      <div className="absolute bottom-0 inset-x-0 z-30 max-w-7xl mx-auto px-3 sm:px-6 pb-4">
        <div className="pt-3 flex flex-wrap items-center justify-between gap-2 sm:gap-4 border-t border-slate-800/60">
          
          {/* Bottom Left Date & Slide Counter */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono font-bold text-slate-400">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-slate-800 backdrop-blur-md">
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>CẬP NHẬT: <strong className="text-amber-300">{slide.date}</strong></span>
            </div>
            <div className="text-amber-400/90 font-mono text-xs sm:text-sm tracking-wider">
              0{currentIndex + 1} <span className="text-slate-600">/</span> 0{slides.length}
            </div>
          </div>

          {/* Center Dot Pagination */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {slides.map((s, idx) => {
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
