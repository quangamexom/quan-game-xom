import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Sparkles, ChevronLeft, ChevronRight, Calendar, Star, Info, Gamepad2, Play } from 'lucide-react';
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
  romUrl?: string;
}

interface HeroCoverBannerProps {
  onGoToGames: () => void;
  onGoToArticles?: () => void;
  onOpenDonate: () => void;
  onSelectGame?: (game: GameItem) => void;
  featuredGames?: GameItem[];
}

const SNES_FEATURED_SLIDES: HeroSlide[] = [
  {
    id: 'snes-1',
    label: 'GIẢ LẬP SNES ⭐ VIỆT HÓA',
    title: 'CHRONO TRIGGER',
    subtitle: 'Tuyệt Phẩm Nhập Vai Du Hành Thời Gian Kinh Điển 16-Bit',
    description: 'Kiệt tác RPG vĩ đại nhất mọi thời đại trên Super Nintendo. Trải nghiệm cốt truyện du hành thời gian với bản Việt Hóa hoàn chỉnh, chơi trực tiếp mượt mà 60 FPS.',
    date: '2026',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
    fallbackCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7e.jpg',
    fallbackBanner: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc8602.jpg',
    romUrl: 'https://archive.org/download/super-nintendo-snes-rom-collection-by-ghostware/Chrono%20Trigger%20%28USA%29.zip'
  },
  {
    id: 'snes-2',
    label: 'GIẢ LẬP SNES ⭐ HUYỀN THOẠI TUỔI THƠ',
    title: 'SUPER MARIO WORLD',
    subtitle: 'Hành Trình Giải Cứu Công Chúa Peach & Khủng Long Yoshi',
    description: 'Tựa game biểu tượng của hệ máy Super Famicom / SNES. Khám phá hàng chục thế giới bí ẩn cùng Yoshi với đồ họa 16-bit rực rỡ và âm nhạc tuổi thơ.',
    date: '2026',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-500/20',
    fallbackCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1qsf.jpg',
    fallbackBanner: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc84vt.jpg',
    romUrl: 'https://archive.org/download/super-nintendo-snes-rom-collection-by-ghostware/Super%20Mario%20World%20%28USA%29.zip'
  },
  {
    id: 'snes-3',
    label: 'GIẢ LẬP SNES ⭐ ĐỐI KHÁNG ĐỈNH CAO',
    title: 'STREET FIGHTER II TURBO',
    subtitle: 'Võ Sĩ Đường Phố Huyền Thoại - Tốc Độ Turbo Cực Đại',
    description: 'Tượng đài game song đấu đối kháng thập niên 90 với dàn võ sĩ Ryu, Ken, Chun-Li, Guile. Tương thích hoàn hảo mọi bàn phím & tay cầm gamepad.',
    date: '2026',
    badgeColor: 'border-red-400 text-red-300 bg-red-500/20',
    fallbackCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r3q.jpg',
    fallbackBanner: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc869k.jpg',
    romUrl: 'https://archive.org/download/super-nintendo-snes-rom-collection-by-ghostware/Street%20Fighter%20II%20Turbo%20%28USA%29.zip'
  },
  {
    id: 'snes-4',
    label: 'GIẢ LẬP SNES ⭐ ĐỒ HỌA 3D ĐỘT PHÁ',
    title: 'DONKEY KONG COUNTRY',
    subtitle: 'Cuộc Phiêu Lưu Khỉ Đột Đồ Họa Silicon Graphics Huyền Ảo',
    description: 'Đột phá công nghệ đồ họa CGI tiền kết xuất trên SNES. Cùng Donkey và Diddy vượt rừng rậm, mỏ than với tiết tấu dồn dập hấp dẫn.',
    date: '2026',
    badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-500/20',
    fallbackCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1v2o.jpg',
    fallbackBanner: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc85vd.jpg',
    romUrl: 'https://archive.org/download/super-nintendo-snes-rom-collection-by-ghostware/Donkey%20Kong%20Country%20%28USA%29.zip'
  },
  {
    id: 'snes-5',
    label: 'GIẢ LẬP SNES ⭐ HÀNH ĐỘNG MECHA',
    title: 'MEGA MAN X',
    subtitle: 'Cuộc Chiến Chống Lại Sigma Của Robot Chiến Binh Siêu Cấp X',
    description: 'Phần mở đầu huyền thoại cho dòng game X. Gameplay lướt tường, nạp đạn, nâng cấp giáp độc đáo cùng nhạc nền Rock 16-bit sôi động.',
    date: '2026',
    badgeColor: 'border-indigo-400 text-indigo-300 bg-indigo-500/20',
    fallbackCover: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1t9u.jpg',
    fallbackBanner: 'https://images.igdb.com/igdb/image/upload/t_screenshot_huge/sc86o8.jpg',
    romUrl: 'https://archive.org/download/super-nintendo-snes-rom-collection-by-ghostware/Mega%20Man%20X%20%28USA%29.zip'
  }
];

interface HeroSlideContentProps {
  slide: HeroSlide;
  featuredGames?: GameItem[];
  onGoToGames: () => void;
  onSelectGame?: (game: GameItem) => void;
}

const HeroSlideContent: React.FC<HeroSlideContentProps> = ({
  slide,
  featuredGames,
  onGoToGames,
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
      platforms: ['SNES'],
      language: 'Tiếng Việt',
      hasVietHoa: true,
      romUrl: slide.romUrl || '',
      downloadUrl: slide.romUrl || ''
    };
  }, [slide, featuredGames]);

  // RAWG Hooks for Cover Boxart & Hero Banner
  const { coverUrl, isLoading: isCoverLoading } = useGameCover(slideGame);
  const { bannerUrl, isLoading: isBannerLoading } = useGameBanner(slideGame);

  const effectiveBanner = bannerUrl || slideGame.backdropArt || slide.fallbackBanner;
  const effectiveCover = coverUrl || slideGame.coverArt || slide.fallbackCover;

  const { cleanTitle, subtitle } = parseGameTitle(slide.title, slide.subtitle);

  const handlePlayNow = () => {
    if (slideGame.romUrl) {
      window.dispatchEvent(new CustomEvent('qgx_load_emulator_rom', {
        detail: {
          title: slideGame.title,
          romUrl: slideGame.romUrl,
          core: 'snes',
          coverArt: effectiveCover
        }
      }));
      const emuEl = document.getElementById('emulator-zone');
      if (emuEl) {
        emuEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (onSelectGame) {
      onSelectGame(slideGame);
    } else {
      onGoToGames();
    }
  };

  const handleViewDetail = () => {
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
            onClick={handlePlayNow}
            className="shrink-0 group cursor-pointer relative"
            title={`Chơi ngay ${cleanTitle}`}
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
                onClick={handlePlayNow}
                className="px-5 py-3 sm:px-7 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>CHƠI NGAY</span>
              </button>

              <button
                onClick={handleViewDetail}
                className="px-4 py-2.5 sm:px-5 sm:py-3.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-display font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
              >
                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                <span>CHI TIẾT GAME</span>
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
  onOpenDonate,
  onSelectGame,
  featuredGames = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dynamic slides combining SNES games from library + default SNES slides
  const slides = useMemo(() => {
    const snesFromLibrary: HeroSlide[] = featuredGames
      .filter(g => g.platforms?.includes('SNES') || g.romUrl || g.title.toLowerCase().includes('snes'))
      .slice(0, 5)
      .map((g, idx) => ({
        id: `lib-snes-${g.id || idx}`,
        label: 'GIẢ LẬP SNES ⭐ NỔI BẬT',
        title: g.title,
        subtitle: g.subtitle || 'Siêu phẩm Super Nintendo chất lượng cao',
        description: g.description || 'Thưởng thức siêu phẩm SNES cổ điển trên nền tảng Quán Game Xóm với tốc độ 60 FPS mượt mà.',
        date: '2026',
        badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
        fallbackCover: g.coverArt,
        fallbackBanner: g.backdropArt,
        romUrl: g.romUrl
      }));

    if (snesFromLibrary.length >= 3) {
      return snesFromLibrary;
    }

    return SNES_FEATURED_SLIDES;
  }, [featuredGames]);

  // Auto advance slide every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentIndex] || slides[0] || SNES_FEATURED_SLIDES[0];

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
