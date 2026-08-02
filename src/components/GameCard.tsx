import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { GameItem } from '../types';
import { useGameCover } from '../hooks/useGameCover';

interface GameCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  onOpenDownload?: (game: GameItem) => void;
  onSelectGenre?: (genre: string) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onSelect }) => {
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

  const hasValidImage = coverUrl && !imageError;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="group relative bg-[#0C101D] border border-slate-800/90 hover:border-amber-400/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_8px_30px_rgba(245,158,11,0.22)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full"
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
              {isUploading ? 'Đang lưu ảnh...' : 'RAWG.io Cover...'}
            </span>
          </div>
        )}

        {/* Cover Image Display */}
        {hasValidImage ? (
          <img
            src={coverUrl}
            alt={game.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : !isLoading && (
          /* Placeholder state when no image is found or failed to load */
          <div
            onClick={handleUploadClick}
            className="w-full h-full bg-[#0B0F1C] flex flex-col items-center justify-center p-3 text-center group/placeholder border border-dashed border-slate-800 hover:border-amber-400/60 transition-colors"
          >
            <ImageIcon className="w-7 h-7 text-slate-600 group-hover/placeholder:text-amber-400 transition-colors mb-1" />
            <span className="text-[11px] font-display font-medium text-slate-400 group-hover/placeholder:text-slate-200">
              Chưa có ảnh
            </span>
            <span className="text-[9px] font-mono text-amber-400/80 underline mt-0.5">
              Click để upload
            </span>
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

        {/* 3. Camera / Upload Button (Top-Right, Hover Only) */}
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
      </div>

      {/* 4. Dedicated Game Title Box Below Image (Clean, Steam/PlayStation Style) */}
      <div className="p-3.5 sm:p-4 bg-[#090D18] border-t border-slate-800/60 flex-1 flex flex-col justify-center">
        <h3 className="text-sm sm:text-base font-display font-bold text-slate-100 group-hover:text-amber-300 transition-colors leading-snug line-clamp-2 tracking-wide">
          {game.title}
        </h3>
      </div>
    </motion.div>
  );
};
