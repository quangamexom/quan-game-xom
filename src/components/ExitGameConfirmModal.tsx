import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Play, LogOut, ShieldAlert, Sparkles } from 'lucide-react';

interface ExitGameConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  gameName?: string;
  targetActionName?: string;
}

export const ExitGameConfirmModal: React.FC<ExitGameConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirm,
  gameName,
  targetActionName
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="modal-exit-game-confirm" 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exit-modal-title"
      >
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={onCancel}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-[#0A0D18] border-2 border-red-500/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-center overflow-hidden z-10"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-20 -left-20 w-44 h-44 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            id="btn-close-exit-modal"
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-full transition-colors cursor-pointer border border-white/10"
            title="Đóng & Tiếp tục chơi"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Warning Icon Badge with Glow Animation */}
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-2xl bg-red-500/30 blur-xl animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/60 flex items-center justify-center text-red-400 shadow-inner">
              <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
          </div>

          {/* Modal Header */}
          <h3 
            id="exit-modal-title" 
            className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-tight mb-2 flex items-center justify-center gap-2"
          >
            <span>XÁC NHẬN THOÁT GAME</span>
          </h3>

          {/* Modal Warning Message */}
          <p className="text-sm font-semibold text-slate-200 leading-relaxed mb-3">
            Bạn có chắc chắn muốn thoát game không?
          </p>

          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-xs text-red-200 mb-5 text-left flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-red-300">
                Tiến trình chơi chưa lưu sẽ bị mất!
              </p>
              <p className="text-[11px] text-slate-300">
                {targetActionName ? `Bạn đang chuẩn bị ${targetActionName}. ` : ''}
                Nếu game đang chơi có save state (F2/Save), hãy lưu lại trước khi rời khỏi.
              </p>
            </div>
          </div>

          {/* Action Buttons: 2 choices */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* 1. Cancel: Keep Playing */}
            <button
              id="btn-cancel-exit-game"
              type="button"
              onClick={onCancel}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white rounded-2xl text-xs sm:text-sm font-display font-black tracking-wide uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>HỦY (CHƠI TIẾP)</span>
            </button>

            {/* 2. Confirm: Quit Game & Teardown */}
            <button
              id="btn-confirm-exit-game"
              type="button"
              onClick={onConfirm}
              className="px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl text-xs sm:text-sm font-display font-black tracking-wide uppercase transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogOut className="w-4 h-4" />
              <span>ĐỒNG Ý THOÁT</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
