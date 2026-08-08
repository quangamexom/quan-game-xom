import React, { useState } from 'react';
import { ShieldCheck, Lock, X, KeyRound, AlertCircle } from 'lucide-react';
import { useAdminMode } from '../hooks/useAdminMode';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose }) => {
  const { verifyAdminPassword } = useAdminMode();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu xác thực!');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await verifyAdminPassword(password);
    setIsSubmitting(false);

    if (res.success) {
      setPassword('');
      onClose();
    } else {
      setErrorMsg(res.error || 'Mật khẩu không chính xác!');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
            XÁC THỰC QUYỀN <span className="text-amber-400">CHỦ QUÁN</span>
          </h2>
          <p className="text-xs text-slate-400 font-body">
            Nhập mật khẩu quản trị để mở khóa quyền Upload và chỉnh sửa ảnh trên thiết bị này.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-amber-300 uppercase mb-2">
              Mật khẩu Admin:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-amber-300 font-mono outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-3.5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Đang xác thực...' : 'Mở Khóa Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
