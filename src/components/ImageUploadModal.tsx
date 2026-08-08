import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Check, Loader2, Save, Sparkles, ShieldCheck } from 'lucide-react';
import { GameItem } from '../types';
import { saveManualCover, saveManualBanner, cleanTitleForSearch } from '../services/rawgService';

interface ImageUploadModalProps {
  game: GameItem;
  imageType?: 'cover' | 'banner';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newUrl: string) => void;
}

export const ImageUploadModal: React.FC<ImageUploadModalProps> = ({
  game,
  imageType = 'cover',
  isOpen,
  onClose,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn định dạng file ảnh (JPG, PNG, WEBP).');
      return;
    }

    setErrorMsg(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      if (result) setFilePreview(result);
    };
    reader.readAsDataURL(file);
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrlInput(val);
    setErrorMsg(null);
    if (val.trim().startsWith('http://') || val.trim().startsWith('https://')) {
      setUrlPreview(val.trim());
    } else {
      setUrlPreview(null);
    }
  };

  // Save handler (File or URL)
  const handleSave = async () => {
    const finalImageSrc = activeTab === 'file' ? filePreview : urlInput.trim();

    if (!finalImageSrc) {
      setErrorMsg(activeTab === 'file' ? 'Vui lòng chọn một file ảnh từ máy tính.' : 'Vui lòng dán đường dẫn URL hợp lệ.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Đang lưu và đồng bộ dữ liệu...');
    setErrorMsg(null);

    try {
      // 1. Call Backend API to save to gameArtMap.ts and attempt GitHub commit
      const res = await fetch('/api/save-game-art', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId: game.id,
          title: game.title,
          imageType,
          mode: activeTab,
          imageUrl: activeTab === 'url' ? urlInput.trim() : undefined,
          fileData: activeTab === 'file' ? filePreview : undefined
        })
      });

      const data = await res.json();

      // 2. Update local state immediately for instant feedback
      if (imageType === 'cover') {
        saveManualCover(game.id, game.title, finalImageSrc);
      } else {
        saveManualBanner(game.id, game.title, finalImageSrc);
      }

      if (onSuccess) {
        onSuccess(finalImageSrc);
      }

      setStatusMessage(data.savedToGithub ? '✅ Đã lưu và commit thành công lên GitHub Repo!' : '✅ Đã lưu ảnh thành công vào hệ thống!');

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error('Error saving image:', err);
      // Fallback: local override still works even if backend server error
      if (imageType === 'cover') {
        saveManualCover(game.id, game.title, finalImageSrc);
      } else {
        saveManualBanner(game.id, game.title, finalImageSrc);
      }

      if (onSuccess) {
        onSuccess(finalImageSrc);
      }

      setIsSaving(false);
      onClose();
    }
  };

  const previewSrc = activeTab === 'file' ? filePreview : urlPreview;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg glass-modal rounded-3xl p-6 shadow-2xl z-10 border border-amber-500/40 text-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Cập Nhật {imageType === 'banner' ? 'Hero Banner' : 'Ảnh Cover Art'}
                </h3>
                <p className="text-xs text-slate-400 font-mono line-clamp-1 max-w-[280px]">
                  Game: <strong className="text-amber-300">{cleanTitleForSearch(game.title)}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex gap-2 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 my-4">
            <button
              type="button"
              onClick={() => { setActiveTab('file'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>1. Chọn File Máy Tính</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('url'); setErrorMsg(null); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>2. Dán Link URL Web</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <label className="block w-full border-2 border-dashed border-slate-700 hover:border-amber-500/80 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900/80 transition-all group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-200 block">
                  {selectedFile ? selectedFile.name : 'Nhấp để chọn file ảnh từ máy tính'}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono mt-1">
                  Hỗ trợ định dạng: JPG, PNG, WEBP (Tối đa 10MB)
                </span>
              </label>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block font-mono">
                ĐƯỜNG DẪN ẢNH (STEAMGRIDDB / STEAM / WEB):
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={urlInput}
                  onChange={handleUrlChange}
                  placeholder="https://cdn2.steamgriddb.com/file/steamgriddb/grid/...jpg"
                  className="w-full bg-slate-900/90 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder:text-slate-500 outline-none transition-all font-mono"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Dán URL trực tiếp từ SteamGridDB, Steam CDN, hoặc Imgur.
              </p>
            </div>
          )}

          {/* Image Preview Box */}
          {previewSrc && (
            <div className="mt-4 p-2 bg-slate-950 rounded-2xl border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1.5 px-1">
                Xem trước ảnh ({imageType === 'banner' ? 'Nền Banner ngang' : 'Bìa Cover đứng (3:4)'}):
              </span>
              <div className={`relative w-full ${imageType === 'banner' ? 'h-36' : 'max-w-xs mx-auto aspect-[3/4]'} overflow-hidden rounded-xl bg-slate-950 border border-slate-800`}>
                <img
                  src={previewSrc}
                  alt="Preview"
                  onError={() => setErrorMsg('URL ảnh không thể tải hoặc bị chặn CORS. Vui lòng thử URL khác.')}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          )}

          {/* Error & Status messages */}
          {errorMsg && (
            <div className="mt-3 p-2.5 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs font-medium text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {statusMessage && (
            <div className="mt-3 p-2.5 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs font-medium text-center flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !previewSrc}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu & Sync Dữ Liệu</span>
                </>
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
