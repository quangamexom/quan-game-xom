import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { GameItem } from '../types';
import { Download, Star, HardDrive, Gamepad2, Info, Camera, Image as ImageIcon, RefreshCw, Edit3 } from 'lucide-react';
import { useGameCover } from '../hooks/useGameCover';
import { useAdminMode } from '../hooks/useAdminMode';
import { parseGameTitle } from '../utils/titleParser';
import { ShareGameMenu } from './ShareGameMenu';
import { EditGameDescriptionModal } from './EditGameDescriptionModal';

interface LaunchBoxCardProps {
  game: GameItem;
  onSelect: (game: GameItem) => void;
  onOpenDownload: (game: GameItem) => void;
}

export const LaunchBoxCard: React.FC<LaunchBoxCardProps> = ({ game, onSelect, onOpenDownload }) => {
  const { isAdmin } = useAdminMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isDescModalOpen, setIsDescModalOpen] = useState<boolean>(false);
  const [currentDesc, setCurrentDesc] = useState<string>(game.description || '');

  const { coverUrl, isLoading, isManual, uploadFile } = useGameCover(game);
  const { cleanTitle, subtitle } = parseGameTitle(game.title, game.subtitle);

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadFile(file);
      setImageError(false);
    } catch (err) {
      console.error('Error uploading custom cover:', err);
    }
  };

  const hasValidImage = coverUrl && !imageError;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => onSelect(game)}
        className={`group relative glass-card rounded-2xl overflow-visible hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row h-auto sm:h-52 cursor-pointer border border-slate-800/80 hover:border-amber-500/50 shadow-lg hover:shadow-2xl hover:shadow-amber-500/10 ${
          isShareOpen ? 'z-50 relative' : 'relative z-1'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Left Cover Art Frame */}
        <div
          className="relative w-full sm:w-44 h-52 sm:h-full shrink-0 bg-slate-900 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden flex items-center justify-center"
        >
          {isLoading ? (
            <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-600 gap-1">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500/80" />
              <span className="text-[9px] font-mono text-slate-500 uppercase">RAWG Cover</span>
            </div>
          ) : hasValidImage ? (
            <img
              src={coverUrl}
              alt={game.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              onClick={isAdmin ? handleUploadClick : undefined}
              className={`w-full h-full bg-[#0B0F1C] flex flex-col items-center justify-center p-2 text-center group/placeholder border border-slate-800 transition-colors ${isAdmin ? 'hover:border-amber-400/60 cursor-pointer' : ''}`}
            >
              <ImageIcon className="w-6 h-6 text-slate-600 group-hover/placeholder:text-amber-400 mb-1" />
              <span className="text-[10px] font-medium text-slate-400">Chưa có ảnh</span>
              {isAdmin && <span className="text-[8px] font-mono text-amber-400 underline">Upload</span>}
            </div>
          )}

          {/* Upload Button (Admin Only) */}
          {isAdmin && (
            <button
              type="button"
              onClick={handleUploadClick}
              title="Upload / Đổi ảnh cover (Admin)"
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/90 hover:bg-amber-400 hover:text-slate-950 border border-amber-500/60 text-amber-300 flex items-center justify-center opacity-85 group-hover:opacity-100 transition-all cursor-pointer z-10 shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="absolute top-2 left-2 bg-slate-950/90 text-amber-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-500/30">
            RAWG/LAUNCHBOX
          </div>

          {game.rating && (
            <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow z-10">
              ★ {game.rating}
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white/[0.04] backdrop-blur-md border-t sm:border-t-0 sm:border-l border-white/10 group-hover:bg-amber-500/10 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {game.platforms.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-slate-800 text-amber-300 font-mono text-[10px] font-bold rounded border border-slate-700">
                    {p}
                  </span>
                ))}
                <span className="text-[10px] text-slate-400 font-mono">{game.releaseYear || '2026'}</span>
              </div>

              {game.hasVietHoa && (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-300" />
                  Việt Hóa
                </span>
              )}
            </div>

            <h4
              onClick={() => onSelect(game)}
              className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 cursor-pointer"
            >
              {cleanTitle}
            </h4>
            {subtitle && (
              <p className="text-xs text-amber-400/90 font-medium tracking-wide mt-0.5 line-clamp-1">
                {subtitle}
              </p>
            )}

            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {currentDesc || game.description || `Ngôn ngữ: ${game.language}. Phiên bản Việt hóa Quán Game Xóm.`}
            </p>

            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
              {game.fileSize && (
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-amber-400" />
                  {game.fileSize}
                </span>
              )}
              {game.developer && (
                <span className="flex items-center gap-1 truncate max-w-[140px]">
                  <Gamepad2 className="w-3 h-3 text-amber-400" />
                  {game.developer}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/80 flex-wrap">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDownload(game);
                  }}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 fill-slate-950" />
                  <span>TẢI GAME</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescModalOpen(true);
                  }}
                  title="Sửa mô tả game (Lưu vào Vercel Blob)"
                  className="px-2.5 py-1.5 bg-slate-800/90 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa mô tả</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(game);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-all flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Chi Tiết</span>
            </button>

            <div onClick={(e) => e.stopPropagation()}>
              <ShareGameMenu
                game={game}
                variant="compact"
                align="right"
                onOpenChange={setIsShareOpen}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Admin Edit Description Modal */}
      {isAdmin && (
        <EditGameDescriptionModal
          game={{ ...game, description: currentDesc }}
          isOpen={isDescModalOpen}
          onClose={() => setIsDescModalOpen(false)}
          onSuccess={(_id, newDesc) => setCurrentDesc(newDesc)}
        />
      )}
    </>
  );
};
