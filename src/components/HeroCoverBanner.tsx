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
  gameItem?: GameItem;
}

interface HeroCoverBannerProps {
  onGoToGames: () => void;
  onGoToArticles: () => void;
  onOpenDonate: () => void;
  onSelectGame?: (game: GameItem) => void;
  featuredGames?: GameItem[];
}

const DEFAULT_SNES_SLIDES: HeroSlide[] = [
  {
    id: 'snes-1',
    label: 'SIÊU PHẨM SNES 16-BIT ⭐ VIỆT HÓA',
    title: 'YU YU HAKUSHO: TOKUBETSU HEN',
    subtitle: 'Nhất Dương Chỉ - Hành Trình U Meshi Đấu Sĩ Võ Đài',
    description: 'Tuyệt tác game đối kháng nhập vai đỉnh cao trên hệ máy Super Nintendo (SNES). Hóa thân vào Yusuke Urameshi, Kuwabara, Kurama và Hiei tung chưởng Linh Quang Đạn mãn nhãn với bản dịch Tiếng Việt chuẩn ngữ cảnh.',
    date: 'SNES 16-Bit',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1920&auto=format&fit=crop'
  },
  {
    id: 'snes-2',
    label: 'VIỆT HÓA HOÀN CHỈNH ⭐ HUYỀN THOẠI SNES',
    title: 'MEGA MAN X2 (ROCKMAN X2)',
    subtitle: 'Hành Trình Phục Sinh Zero & Đánh Bại X-Hunters',
    description: 'Phần tiếp theo kinh điển của dòng game hành động đi cảnh Mega Man X trên Super Nintendo. Sử dụng giáp Giga Armor, lướt Air Dash và thu thập đủ mảnh giáp để hồi sinh Zero cứu thế giới.',
    date: 'SNES Edition',
    badgeColor: 'border-cyan-400 text-cyan-300 bg-cyan-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920&auto=format&fit=crop'
  },
  {
    id: 'snes-3',
    label: 'KINH ĐIỂN 16-BIT ⭐ TUỔI THƠ NINTENDO',
    title: 'SUPER MARIO WORLD',
    subtitle: 'Khám Phá Vùng Đất Khủng Long Cùng Mario & Chú Rồng Yoshi',
    description: 'Tựa game platformer định hình toàn bộ kỷ nguyên 16-bit Super Nintendo với hơn 96 màn chơi bí mật, cưỡi chú rồng Yoshi và giải cứu Công chúa Peach khỏi tay Bowser.',
    date: 'Super Nintendo',
    badgeColor: 'border-emerald-400 text-emerald-300 bg-emerald-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?w=1920&auto=format&fit=crop'
  },
  {
    id: 'snes-4',
    label: 'ĐỐI KHÁNG ĐỒNG ĐỘI ⭐ 2 NGƯỜI CHƠI CO-OP',
    title: 'BATTLETOADS & DOUBLE DRAGON',
    subtitle: 'Song Long Hiệp Đấu Cùng Binh Đoàn Ếch Chiến Binh',
    description: 'Sự kết hợp lịch sử giữa 2 tượng đài game đi cảnh đối kháng beat-em-up hay nhất mọi thời đại trên Super Nintendo. Hỗ trợ 2 người chơi co-op phá đảo cực cuốn.',
    date: 'SNES Co-Op',
    badgeColor: 'border-rose-400 text-rose-300 bg-rose-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&auto=format&fit=crop'
  },
  {
    id: 'snes-5',
    label: 'SIÊU NHÂN 5 ANH EM ⭐ ĐẠI CHIẾN MEGAZORD',
    title: 'MIGHTY MORPHIN POWER RANGERS',
    subtitle: 'The Fighting Edition - Đại Chiến Robot Khổng Lồ',
    description: 'Game đối kháng Robot khổng lồ Megazord, Dragonzord và quái vật kinh điển của 5 Anh Em Siêu Nhân với các đòn đánh combo uy lực trên Super Nintendo SNES.',
    date: 'SNES 16-Bit',
    badgeColor: 'border-amber-400 text-amber-300 bg-amber-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop'
  },
  {
    id: 'snes-6',
    label: 'TƯỢNG ĐÀI NHẬP VAI RPG ⭐ 16-BIT VĨ ĐẠI',
    title: 'CHRONO TRIGGER',
    subtitle: 'Du Hành Xuyên Không Gian Thời Gian Cứu Rỗi Nhân Loại',
    description: 'Tuyệt tác game nhập vai kinh điển số 1 trên Super Nintendo SNES bởi sự hợp tác của Hironobu Sakaguchi, Yuji Horii và Akira Toriyama. Cốt truyện đa kết thúc với chiều sâu bất hủ.',
    date: 'SNES RPG Legend',
    badgeColor: 'border-purple-400 text-purple-300 bg-purple-500/20',
    fallbackCover: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?w=600&auto=format&fit=crop',
    fallbackBanner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop'
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
    if (slide.gameItem) return slide.gameItem;

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
      platforms: ['SNES', 'Other'],
      system: 'snes',
      emulatorCore: 'snes',
      language: 'Tiếng Việt',
      hasVietHoa: true,
      downloadUrl: ''
    };
  }, [slide, featuredGames]);

  // RAWG Hooks for Cover Boxart & Hero Banner
  const { coverUrl, isLoading: isCoverLoading } = useGameCover(slideGame);
  const { bannerUrl, isLoading: isBannerLoading } = useGameBanner(slideGame);

  const effectiveBanner = slideGame.backdropArt || bannerUrl || slide.fallbackBanner;
  const effectiveCover = slideGame.coverArt || coverUrl || slide.fallbackCover;

  const { cleanTitle, subtitle } = parseGameTitle(slide.title, slide.subtitle);

  const handleGameClick = () => {
    if (onSelectGame) {
      onSelectGame(slideGame);
    } else {
      onGoToGames();
    }
  };

  const handlePlayEmulator = () => {
    const emulatorSection = document.getElementById('emulator-zone');
    if (emulatorSection) {
      emulatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (onSelectGame) {
      onSelectGame(slideGame);
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
            title={`Xem chi tiết & chơi ${cleanTitle}`}
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
                onClick={handlePlayEmulator}
                className="px-4 py-2.5 sm:px-6 sm:py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/50"
              >
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-950 text-slate-950" />
                <span>CHƠI TRỰC TIẾP TRÊN SNES</span>
              </button>

              <button
                onClick={handleGameClick}
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
  onGoToArticles,
  onOpenDonate,
  onSelectGame,
  featuredGames = []
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Compute active SNES slides dynamically from library or fallback to rich SNES classic presets
  const slides: HeroSlide[] = useMemo(() => {
    const isSnesGame = (g: GameItem) => {
      return (
        g.emulatorCore === 'snes' ||
        g.system === 'snes' ||
        g.platforms?.some(p => p.toLowerCase().includes('snes') || p.toLowerCase().includes('super nintendo')) ||
        g.genres?.some(gen => gen.toLowerCase().includes('snes') || gen.toLowerCase().includes('super nintendo')) ||
        Boolean(g.romUrl && (g.romUrl.toLowerCase().endsWith('.snes') || g.romUrl.toLowerCase().endsWith('.smc') || g.romUrl.toLowerCase().endsWith('.sfc')))
      );
    };

    const snesGames = featuredGames.filter(isSnesGame);

    if (snesGames.length > 0) {
      return snesGames.slice(0, 8).map((g, idx) => {
        const isVn = g.hasVietHoa || g.title.toLowerCase().includes('việt hóa') || g.title.toLowerCase().includes('(vn)');
        return {
          id: g.id || `snes-dynamic-${idx}`,
          label: isVn ? 'SIÊU PHẨM SNES 16-BIT ⭐ VIỆT HÓA' : 'HUYỀN THOẠI SUPER NINTENDO (SNES)',
          title: g.title,
          subtitle: g.subtitle || 'Trải Nghiệm Trực Tiếp Trên Trình Giả Lập SNES 16-Bit',
          description: g.description || 'Tựa game kinh điển trên hệ máy Super Nintendo (SNES). Hỗ trợ chơi trực tiếp trên trình giả lập mượt mà, lưu game tức thì và chiến cùng bạn bè.',
          date: 'SNES 16-Bit',
          badgeColor: isVn ? 'border-amber-400 text-amber-300 bg-amber-500/20' : 'border-cyan-400 text-cyan-300 bg-cyan-500/20',
          fallbackCover: g.coverArt,
          fallbackBanner: g.backdropArt || g.coverArt,
          gameItem: g
        };
      });
    }

    return DEFAULT_SNES_SLIDES;
  }, [featuredGames]);

  // Keep currentIndex in bounds if slides length changes
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Auto advance slide every 6 seconds
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentIndex] || slides[0] || DEFAULT_SNES_SLIDES[0];

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
              <span>HỆ MÁY: <strong className="text-amber-300">{slide.date}</strong></span>
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

