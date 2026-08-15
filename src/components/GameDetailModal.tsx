import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { X, Download, Star, Monitor, Cpu, HardDrive, Gamepad2, ExternalLink, Image as ImageIcon, Sparkles, CheckCircle, Camera, RefreshCw } from 'lucide-react';
import { useGameCover, useGameBanner } from '../hooks/useGameCover';
import { useAdminMode } from '../hooks/useAdminMode';
import { parseGameTitle } from '../utils/titleParser';
import { ImageUploadModal } from './ImageUploadModal';
import { ShareGameMenu } from './ShareGameMenu';

interface GameDetailModalProps {
  game: GameItem | null;
  onClose: () => void;
  onOpenDownload: (game: GameItem) => void;
}

export const GameDetailModal: React.FC<GameDetailModalProps> = ({
  game,
  onClose,
  onOpenDownload
}) => {
  const { isAdmin } = useAdminMode();
  const [activeTab, setActiveTab] = useState<'overview' | 'reqs' | 'screenshots'>('overview');
  const [uploadModalType, setUploadModalType] = useState<'cover' | 'banner' | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Hook for avatar / cover art
  const coverState = useGameCover(game || { id: '', title: '', coverArt: '', downloadLinks: [], platforms: [], isHot: false, hasVietHoa: false });
  // Hook for top hero banner
  const bannerState = useGameBanner(game || { id: '', title: '', coverArt: '', downloadLinks: [], platforms: [], isHot: false, hasVietHoa: false });

  const [bannerError, setBannerError] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  const [bannerImgSrc, setBannerImgSrc] = useState<string | null>(bannerState.bannerUrl);
  const [avatarImgSrc, setAvatarImgSrc] = useState<string | null>(coverState.coverUrl);

  React.useEffect(() => {
    setBannerImgSrc(bannerState.bannerUrl);
    setBannerError(false);
  }, [bannerState.bannerUrl]);

  React.useEffect(() => {
    setAvatarImgSrc(coverState.coverUrl);
    setAvatarError(false);
  }, [coverState.coverUrl]);

  const handleBannerImgError = () => {
    if (bannerImgSrc && bannerImgSrc.includes('library_600x900.jpg')) {
      setBannerImgSrc(bannerImgSrc.replace('library_600x900.jpg', 'header.jpg'));
    } else if (game?.backdropArt && bannerImgSrc !== game.backdropArt) {
      setBannerImgSrc(game.backdropArt);
    } else {
      setBannerError(true);
    }
  };

  const handleAvatarImgError = () => {
    if (avatarImgSrc && avatarImgSrc.includes('library_600x900.jpg')) {
      setAvatarImgSrc(avatarImgSrc.replace('library_600x900.jpg', 'header.jpg'));
    } else if (game?.coverArt && avatarImgSrc !== game.coverArt) {
      setAvatarImgSrc(game.coverArt);
    } else {
      setAvatarError(true);
    }
  };

  if (!game) return null;

  const { cleanTitle, subtitle } = parseGameTitle(game.title, game.subtitle);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      await bannerState.uploadBanner(file);
      setBannerError(false);
    } catch (err) {
      console.error('Lỗi upload banner:', err);
      alert('Lỗi tải banner: Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      await coverState.uploadFile(file);
      setAvatarError(false);
    } catch (err) {
      console.error('Lỗi upload avatar:', err);
      alert('Lỗi tải avatar: Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP).');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const hasBannerImage = bannerState.bannerUrl && !bannerError;
  const hasAvatarImage = coverState.coverUrl && !avatarError;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Hidden File Inputs for Banner & Avatar Upload */}
        <input
          type="file"
          ref={bannerInputRef}
          onChange={handleBannerUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] glass-modal rounded-3xl z-10 overflow-hidden flex flex-col"
        >

          {/* Top Hero Banner */}
          <div className="relative h-48 sm:h-64 overflow-hidden bg-slate-950 shrink-0 group/banner">
            
            {/* Banner Skeleton Loading State */}
            {(bannerState.isLoading || isUploadingBanner) && (
              <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-500 gap-2 z-10">
                <RefreshCw className="w-7 h-7 animate-spin text-amber-500/80" />
                <span className="text-xs font-mono text-slate-400">
                  {isUploadingBanner ? 'Đang lưu ảnh banner...' : 'Đang tải RAWG.io Banner...'}
                </span>
              </div>
            )}

            {/* Banner Image Display */}
            {bannerImgSrc && !bannerError ? (
              <img
                src={bannerImgSrc}
                alt={game.title}
                onError={handleBannerImgError}
                className="w-full h-full object-cover object-center filter brightness-90 group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            ) : !bannerState.isLoading && (
              <div
                onClick={isAdmin ? () => setUploadModalType('banner') : undefined}
                className={`w-full h-full bg-gradient-to-b from-[#0e1322] via-[#090d18] to-[#05070e] flex flex-col items-center justify-center p-4 text-center border border-slate-800/80 transition-colors ${isAdmin ? 'hover:border-amber-400/60 cursor-pointer' : ''}`}
              >
                <Gamepad2 className="w-10 h-10 text-slate-600/90 mb-1.5 stroke-[1.5]" />
                <span className="text-xs font-display font-medium text-slate-400">Chưa có ảnh banner</span>
                {isAdmin && <span className="text-[10px] font-mono text-amber-400 underline mt-1">Upload / Dán Link URL Banner</span>}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pointer-events-none" />

            {/* Close Button & Banner Upload Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-30">
              {isAdmin && bannerState.isManual && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    bannerState.resetBanner();
                    setBannerError(false);
                  }}
                  className="px-2 py-1 bg-cyan-950/90 hover:bg-red-600 text-cyan-300 hover:text-white border border-cyan-500/40 rounded-lg text-[10px] font-mono transition-all backdrop-blur-md cursor-pointer"
                  title="Đặt lại banner mặc định"
                >
                  Reset Banner
                </button>
              )}

              {/* Explicit Upload Banner Button (Admin Only) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setUploadModalType('banner')}
                  className="px-3 py-1.5 text-xs font-bold font-mono text-amber-300 hover:text-slate-950 bg-slate-950/80 hover:bg-amber-400 border border-amber-500/50 rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  title="Upload hoặc Dán link URL ảnh Banner nền"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">📸 Sửa Banner</span>
                </button>
              )}

              {/* Share Game Button (Top-Right) */}
              <ShareGameMenu
                game={game}
                variant="button"
                align="right"
              />

              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-900 rounded-full border border-slate-700 transition-colors cursor-pointer"
                title="Đóng popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Title & Cover Frame */}
            <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4 z-20">
              
              {/* Avatar / Square Cover Container */}
              <div className="relative w-20 h-28 sm:w-28 sm:h-36 rounded-xl border-2 border-amber-500/50 shadow-2xl shrink-0 overflow-hidden bg-slate-950 group/avatar">
                
                {(coverState.isLoading || isUploadingAvatar) && (
                  <div className="absolute inset-0 bg-slate-900 animate-pulse flex flex-col items-center justify-center text-slate-600 gap-1 z-10">
                    <RefreshCw className="w-5 h-5 animate-spin text-amber-500/80" />
                    <span className="text-[9px] font-mono">Cover...</span>
                  </div>
                )}

                {avatarImgSrc && !avatarError ? (
                  <img
                    src={avatarImgSrc}
                    alt={game.title}
                    onError={handleAvatarImgError}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                ) : !coverState.isLoading && (
                  <div
                    onClick={isAdmin ? () => setUploadModalType('cover') : undefined}
                    className={`w-full h-full bg-gradient-to-b from-[#0e1322] via-[#090d18] to-[#05070e] flex flex-col items-center justify-center p-2 text-center border border-slate-800/80 transition-colors ${isAdmin ? 'hover:border-amber-400/60 cursor-pointer' : ''}`}
                  >
                    <Gamepad2 className="w-6 h-6 text-slate-600/90 mb-1 stroke-[1.5]" />
                    <span className="text-[9px] font-medium text-slate-400">Chưa có ảnh</span>
                    {isAdmin && <span className="text-[8px] font-mono text-amber-400 underline mt-0.5">Upload</span>}
                  </div>
                )}

                {/* Avatar Camera Upload Icon Overlay (Admin Only) */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadModalType('cover');
                    }}
                    className="absolute bottom-1 right-1 px-2 py-1 rounded-lg bg-slate-950/90 hover:bg-amber-400 text-amber-300 hover:text-slate-950 border border-amber-500/60 font-mono text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer z-20 shadow-lg backdrop-blur-md"
                    title="Upload hoặc Dán link ảnh Cover Art"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Sửa Cover</span>
                  </button>
                )}
              </div>

              <div className="mb-1">
                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                  {game.platforms.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-slate-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold rounded">
                      {p}
                    </span>
                  ))}
                  {game.hasVietHoa && (
                    <span className="px-2 py-0.5 bg-amber-500/90 text-slate-950 text-[10px] font-bold rounded flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-950" />
                      Việt Hóa ⭐
                    </span>
                  )}
                  {coverState.rawgRating && (
                    <span className="px-2 py-0.5 bg-emerald-500/90 text-slate-950 text-[10px] font-mono font-bold rounded flex items-center gap-1">
                      ★ RAWG: {coverState.rawgRating}/100
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {cleanTitle}
                </h2>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-amber-400 font-medium tracking-wide mt-1 line-clamp-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950/50 backdrop-blur-md border-b border-white/10 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              TỔNG QUAN GAME
            </button>

            <button
              onClick={() => setActiveTab('reqs')}
              className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
                activeTab === 'reqs'
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              CẤU HÌNH YÊU CẦU
            </button>

            {game.screenshots && game.screenshots.length > 0 && (
              <button
                onClick={() => setActiveTab('screenshots')}
                className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer ${
                  activeTab === 'screenshots'
                    ? 'border-amber-400 text-amber-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                HÌNH ANH PREVIEW ({game.screenshots.length})
              </button>
            )}
          </div>

          {/* Tab Contents */}
          <div className="p-6 overflow-y-auto flex-1 text-slate-300 text-sm space-y-4">
            
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 glass-panel p-4 rounded-2xl border border-white/10 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block">NĂM PHÁT HÀNH</span>
                    <strong className="text-amber-300">{game.releaseYear || '2024'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">DUNG LƯỢNG</span>
                    <strong className="text-amber-300">{game.fileSize || 'Standard'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">ĐÁNH GIÁ LAUNCHBOX</span>
                    <strong className="text-emerald-400">★ {game.rating || 4.9} / 5.0</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">NGÔN NGỮ</span>
                    <strong className="text-white">{game.language || 'Tiếng Việt'}</strong>
                  </div>
                </div>

                <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">NỘI DUNG & NỔI BẬT:</h4>
                  <p className="text-slate-200 leading-relaxed text-xs sm:text-sm">
                    {game.description || `${game.title} là siêu phẩm được đông đảo cộng đồng game thủ săn đón. Tải ngay bản chuẩn sắc nét từ Quán Game Xóm, cài đặt siêu mượt không lo lỗi.`}
                  </p>
                </div>

                {game.developer && (
                  <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                    <span>Nhà phát triển: <strong className="text-white">{game.developer}</strong></span>
                    {game.publisher && <span>Nhà xuất bản: <strong className="text-white">{game.publisher}</strong></span>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reqs' && (
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
                <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sm">
                  <Monitor className="w-4 h-4" />
                  CẤU HÌNH HỆ THỐNG KHUYÊN DÙNG:
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white/[0.05] rounded-2xl border border-white/15 backdrop-blur-md shadow-md">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider">HỆ ĐIỀU HÀNH (OS)</span>
                    <span className="text-slate-100 font-semibold">{game.systemReqs?.os || "Windows 10/11 64-bit"}</span>
                  </div>

                  <div className="p-3.5 bg-white/[0.05] rounded-2xl border border-white/15 backdrop-blur-md shadow-md">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider">VI XỬ LÝ (CPU)</span>
                    <span className="text-slate-100 font-semibold">{game.systemReqs?.cpu || "Intel Core i5-8400 / AMD Ryzen 5 2600"}</span>
                  </div>

                  <div className="p-3.5 bg-white/[0.05] rounded-2xl border border-white/15 backdrop-blur-md shadow-md">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider">BỘ NHỚ (RAM)</span>
                    <span className="text-slate-100 font-semibold">{game.systemReqs?.ram || "8 GB RAM hoặc 16 GB RAM (Khuyên dùng)"}</span>
                  </div>

                  <div className="p-3.5 bg-white/[0.05] rounded-2xl border border-white/15 backdrop-blur-md shadow-md">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider">CARD ĐỒ HỌA (GPU)</span>
                    <span className="text-slate-100 font-semibold">{game.systemReqs?.gpu || "NVIDIA GTX 1060 (6GB) / AMD Radeon RX 580"}</span>
                  </div>

                  <div className="p-3.5 bg-white/[0.05] rounded-2xl border border-white/15 backdrop-blur-md shadow-md sm:col-span-2">
                    <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono tracking-wider">Ổ CỨNG TRỐNG (SSD)</span>
                    <span className="text-amber-300 font-bold">{game.systemReqs?.storage || game.fileSize || "Khuyên dùng cài trên ổ SSD"}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'screenshots' && game.screenshots && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {game.screenshots.map((img, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-44">
                    <img src={img} alt={`Screenshot ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Footer Action */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              Pass giải nén: <strong className="text-amber-300">quangamexom</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setUploadModalType('cover')}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  title="Tải lên hoặc dán link URL ảnh bìa game"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Upload Ảnh</span>
                </button>
              )}

              {/* Share Button in Footer */}
              <ShareGameMenu
                game={game}
                variant="footer"
                align="left"
              />

              {game.fbPreviewUrl && (
                <a
                  href={game.fbPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-xl text-xs font-bold transition-all border border-blue-500/40"
                >
                  Bài Viết FB
                </a>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenDownload(game);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 fill-slate-950" />
                <span>MỞ TẢI GAME ({game.fileSize || 'Link Tốc Độ Cao'})</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Admin Image Upload Modal (Cover or Banner) */}
      {isAdmin && uploadModalType && (
        <ImageUploadModal
          game={game}
          imageType={uploadModalType}
          isOpen={true}
          onClose={() => setUploadModalType(null)}
          onSuccess={(newUrl) => {
            if (uploadModalType === 'cover') {
              setAvatarImgSrc(newUrl);
              setAvatarError(false);
            } else {
              setBannerImgSrc(newUrl);
              setBannerError(false);
            }
          }}
        />
      )}
    </AnimatePresence>
  );
};
