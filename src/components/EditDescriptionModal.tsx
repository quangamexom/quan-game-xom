import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { GameItem } from '../types';

interface EditDescriptionModalProps {
  game: GameItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newDescription: string) => void;
  onSave?: (newDescription: string) => void;
}

export const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess,
  onSave
}) => {
  const [description, setDescription] = useState<string>(game.description || '');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync state if game changes
  React.useEffect(() => {
    setDescription(game.description || '');
    setErrorMessage(null);
    setStatusMessage(null);
  }, [game, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setStatusMessage('Đang lưu và đồng bộ lên Vercel Blob...');

    try {
      const res = await fetch('/api/admin/games/update-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: game.id,
          description: description.trim(),
          fallbackGame: game
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể lưu mô tả');
      }

      setStatusMessage('✅ Đã cập nhật mô tả game thành công!');
      if (onSuccess) onSuccess(description.trim());
      if (onSave) onSave(description.trim());

      // Trigger global event for real-time UI synchronization
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('qgx_games_updated', {
          detail: { id: game.id, description: description.trim() }
        }));
      }

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('[EditDescriptionModal Error]:', err);
      setErrorMessage(err.message || 'Lỗi khi cập nhật mô tả');
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg glass-modal rounded-3xl p-6 shadow-2xl z-10 border border-amber-500/40 text-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">
                  Sửa Mô Tả Game (Admin)
                </h3>
                <p className="text-xs text-amber-300 font-mono truncate max-w-[280px]">
                  {game.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 font-bold">
                Nội dung mô tả giới thiệu game:
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập tóm tắt cốt truyện, hướng dẫn hoặc thông tin bản dịch Việt hóa..."
                className="w-full bg-slate-900/90 border border-slate-700/90 focus:border-amber-500 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all leading-relaxed"
                autoFocus
              />
              <span className="text-[10px] font-mono text-slate-400 block mt-1">
                Mô tả này sẽ được lưu trữ vĩnh viễn vào Vercel Blob và hiển thị đồng bộ trên thẻ game.
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl flex items-center gap-2 text-xs text-red-300 font-mono">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300 font-mono">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
              >
                Hủy Bỏ
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-xs font-mono font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 border border-amber-400 transition-all cursor-pointer shadow-lg flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu Mô Tả</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
