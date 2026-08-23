import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Gamepad2, RefreshCw } from 'lucide-react';
import { GameItem } from '../types';
import { useGameCover } from '../hooks/useGameCover';
import { useAdminMode } from '../hooks/useAdminMode';
import { parseGameTitle } from '../utils/titleParser';
import { ImageUploadModal } from './ImageUploadModal';
import { ShareGameMenu } from './ShareGameMenu';

interface GameCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  onOpenDownload?: (game: GameItem) => void;
  onSelectGenre?: (genre: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const { isAdmin } = useAdminMode();
  const [imageError, setImageError] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const {
    coverUrl,
    isLoading,
    isManual,
    resetCover
  } = useGameCover(game);

  const [currentImgSrc, setCurrentImgSrc] = useState<string | null>(coverUrl);

  // Sync image source whenever coverUrl changes
  React.useEffect(() => {
    setCurrentImgSrc(coverUrl);
    setImageError(false);
  }, [coverUrl]);

  const { cleanTitle, subtitle } = parseGameTitle(game.title, game.subtitle);

  // Multi-tier image fallback handler
  const handleImageError = () => {
    if (currentImgSrc && currentImgSrc.includes('library_600x900.jpg')) {
      setCurrentImgSrc(currentImgSrc.replace('library_600x900.jpg', 'header.jpg'));
    } else if (currentImgSrc && game.backdropArt && !game.backdropArt.includes('unsplash') && currentImgSrc !== game.backdropArt) {
      setCurrentImgSrc(game.backdropArt);
    } else if (currentImgSrc && game.coverArt && !game.coverArt.includes('unsplash') && currentImgSrc !== game.coverArt) {
      setCurrentImgSrc(game.coverArt);
    } else {
      setImageError(true);
    }
  };

  const handleOpenUploadModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = (newUrl: string) => {
    setCurrentImgSrc(newUrl);
    setImageError(false);
  };

  const hasValidImage = currentImgSrc && !imageError;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        className={`group relative glass-card rounded-2xl overflow-visible hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full border border-slate-800/80 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10 ${
          isShareOpen ? 'z-50 relative' : 'relative z-1'
        }`}
        onClick={() => onSelect(game)}
      >
        {/* 1. Full-Width Cover Image Container (Vertical Portrait 3:4 Aspect Ratio) */}
        <div className="relative w-full aspect-[3/4] rounded-t-2xl overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
          
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-600 gap-2 z-10">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500/80" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Đang tải cover...
              </span>
            </div>
          )}

          {/* Cover Image Display (Full Edge-to-Edge Cover Art) */}
          {hasValidImage ? (
            <img
              src={currentImgSrc}
              alt={game.title}
              onError={handleImageError}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : !isLoading && (
            /* Custom Styled Retro Gaming Badge Placeholder */
            <div
              onClick={isAdmin ? handleOpenUploadModal : undefined}
              className={`w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 flex flex-col items-center justify-center p-3 text-center group/placeholder border border-slate-800/80 transition-all ${isAdmin ? 'hover:border-amber-400/60 cursor-pointer' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1.5 shadow-inner">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-display font-bold text-amber-300 line-clamp-1 max-w-[90%]">
                {cleanTitle}
              </span>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5 uppercase tracking-widest">
                Quán Game Xóm Edition
              </span>
              {isAdmin && (
                <span className="text-[9px] font-mono text-amber-400/90 underline mt-1">
                  + Upload / Dán URL
                </span>
              )}
            </div>
          )}

          {/* 2. Compact "VIỆT HÓA" Badge */}
          {game.hasVietHoa && (
            <div className="absolute top-2 left-2 z-20">
              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-red-700 to-rose-700 text-white font-display font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-md shadow-md shadow-red-950/80 border border-red-500/40 flex items-center gap-1 backdrop-blur-md">
                <span className="text-[10px] sm:text-[11px] leading-none">🇻🇳</span>
                <span>VIỆT HÓA</span>
              </span>
            </div>
          )}

          {/* 3. Action Buttons (Top-Right: Share & Admin Upload) */}
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1.5">
            <ShareGameMenu
              game={game}
              variant="icon"
              align="right"
              onOpenChange={setIsShareOpen}
            />
            {isAdmin && (
              <>
                {isManual && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      resetCover();
                      setImageError(false);
                    }}
                    title="Đặt lại ảnh mặc định"
                    className="px-1.5 py-0.5 rounded bg-cyan-950/90 hover:bg-red-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-[9px] font-mono transition-all backdrop-blur-md cursor-pointer"
                  >
                    Custom
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleOpenUploadModal}
                  title="Thay đổi ảnh cover (Upload file từ máy hoặc Dán link URL)"
                  className="w-8 h-8 rounded-full bg-slate-950/90 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/60 flex items-center justify-center transition-all opacity-90 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg backdrop-blur-md cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4. Dedicated Game Title Box Below Image */}
        <div className="p-3.5 sm:p-4 bg-white/[0.04] backdrop-blur-md border-t border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/40 transition-all duration-300 flex-1 flex flex-col justify-center">
          <h3 className="text-sm sm:text-base font-display font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2 tracking-wide">
            {cleanTitle}
          </h3>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-amber-400/90 group-hover:text-amber-300 font-medium tracking-wide mt-1 line-clamp-1 flex items-center gap-1">
              <span>{subtitle}</span>
            </p>
          )}
        </div>
      </motion.div>

      {/* Admin Upload Modal */}
      {isAdmin && (
        <ImageUploadModal
          game={game}
          imageType="cover"
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};
