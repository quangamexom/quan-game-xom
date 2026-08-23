import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit3, Save, Loader2, Check } from 'lucide-react';
import { GameItem } from '../types';

interface EditGameDescriptionModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (gameId: string, newDescription: string) => void;
}

export const EditGameDescriptionModal: React.FC<EditGameDescriptionModalProps> = ({
  game,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (game) {
      setDescription(game.description || '');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

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
        throw new Error(data.error || 'Lỗi khi lưu mô tả lên máy chủ');
      }

      setSuccessMsg('Đã cập nhật mô tả game thành công lên Vercel Blob!');
      onSuccess(game.id, description.trim());

      window.dispatchEvent(new CustomEvent('qgx_games_updated'));

      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Error saving description:', err);
      setErrorMsg(err.message || 'Không thể lưu mô tả');
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col gap-4 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold font-display text-white uppercase tracking-wide">
                  Sửa Mô Tả Game (Admin)
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md font-mono">
                  {game.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Content */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              Nội dung mô tả (Lưu trữ trực tiếp trên Vercel Blob):
            </label>
            <textarea
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập tóm tắt cốt truyện, thông tin Việt hóa hoặc hướng dẫn chơi..."
              className="w-full p-3.5 bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-2xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 font-body focus:outline-none focus:ring-1 focus:ring-amber-500 resize-y"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Độ dài: {description.length} ký tự</span>
              <span>Tự động đồng bộ với Cloud ROM Library</span>
            </div>
          </div>

          {/* Status & Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-xs text-red-300 font-mono">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-display font-black uppercase tracking-wider shadow-lg hover:shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu Mô Tả</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
