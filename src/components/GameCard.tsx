import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Gamepad2, RefreshCw } from 'lucide-react';
import { GameItem } from '../types';
import { useGameCover } from '../hooks/useGameCover';
import { useAdminMode } from '../hooks/useAdminMode';
import { parseGameTitle } from '../utils/titleParser';

interface GameCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  onOpenDownload?: (game: GameItem) => void;
  onSelectGenre?: (genre: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
  const { isAdmin } = useAdminMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const {
    coverUrl,
    isLoading,
    isManual,
    uploadFile,
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
      // 1. Steam library_600x900 -> Fallback to Steam header.jpg (100% reliable on all Steam games)
      setCurrentImgSrc(currentImgSrc.replace('library_600x900.jpg', 'header.jpg'));
    } else if (currentImgSrc && game.backdropArt && !game.backdropArt.includes('unsplash') && currentImgSrc !== game.backdropArt) {
      // 2. Fallback to game's backdrop art
      setCurrentImgSrc(game.backdropArt);
    } else if (currentImgSrc && game.coverArt && !game.coverArt.includes('unsplash') && currentImgSrc !== game.coverArt) {
      // 3. Fallback to game's cover art
      setCurrentImgSrc(game.coverArt);
    } else {
      // 4. Mark image as failed to display fallback gaming badge
      setImageError(true);
    }
  };

  // Trigger hidden file input
  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadFile(file);
      setImageError(false);
    } catch (err) {
      console.error('Error uploading custom cover:', err);
      alert('Lỗi tải ảnh: Hãy chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const hasValidImage = currentImgSrc && !imageError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative glass-card rounded-2xl overflow-hidden hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full border border-slate-800/80 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/10"
      onClick={() => onSelect(game)}
    >
      {/* Hidden File Input for Custom Cover Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. Full-Width Cover Image Container (16:9 Aspect Ratio) */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
        
        {/* Loading Skeleton */}
        {(isLoading || isUploading) && (
          <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-600 gap-2 z-10">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500/80" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              {isUploading ? 'Đang lưu ảnh...' : 'Đang tải cover...'}
            </span>
          </div>
        )}

        {/* Cover Image Display */}
        {hasValidImage ? (
          <img
            src={currentImgSrc}
            alt={game.title}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : !isLoading && (
          /* Custom Styled Retro Gaming Badge Placeholder */
          <div
            onClick={isAdmin ? handleUploadClick : undefined}
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
                + Upload ảnh
              </span>
            )}
          </div>
        )}

        {/* 2. Compact "VIỆT HÓA" Badge (Top-Left Pill/Tag) */}
        {game.hasVietHoa && (
          <div className="absolute top-2 left-2 z-20">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-gradient-to-r from-red-700 to-rose-700 text-white font-display font-bold text-[10px] sm:text-[11px] uppercase tracking-wider rounded-md shadow-md shadow-red-950/80 border border-red-500/40 flex items-center gap-1 backdrop-blur-md">
              <span className="text-[10px] sm:text-[11px] leading-none">🇻🇳</span>
              <span>VIỆT HÓA</span>
            </span>
          </div>
        )}

        {/* 3. Camera / Upload Button (Top-Right, Hover Only, Admin Only) */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-30 flex items-center gap-1">
            {isManual && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  resetCover();
                  setImageError(false);
                }}
                title="Đặt lại ảnh mặc định"
                className="px-1.5 py-0.5 rounded bg-cyan-950/90 hover:bg-red-600 text-cyan-300 hover:text-white border border-cyan-500/40 text-[9px] font-mono transition-all backdrop-blur-md"
              >
                Custom
              </span>
            )}
            <button
              type="button"
              onClick={handleUploadClick}
              title={isManual ? 'Thay đổi ảnh cover thủ công' : 'Upload ảnh cover thủ công'}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700/80 text-slate-300 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md backdrop-blur-md cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Dedicated Game Title Box Below Image (Clean, Steam/PlayStation Style) */}
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
  );
};
