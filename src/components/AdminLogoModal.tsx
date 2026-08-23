import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Link as LinkIcon, Check, Loader2, Image as ImageIcon, ShieldCheck } from 'lucide-react';

interface AdminLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLogoModal: React.FC<AdminLogoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState<string>('');
  const [urlPreview, setUrlPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Vui lòng chọn định dạng file ảnh hợp lệ (PNG, JPG, SVG, WEBP).');
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

  const handleSave = async () => {
    const finalImageSrc = activeTab === 'file' ? filePreview : urlInput.trim();

    if (!finalImageSrc) {
      setErrorMsg(activeTab === 'file' ? 'Vui lòng chọn một file ảnh từ máy tính.' : 'Vui lòng dán đường dẫn URL hợp lệ.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Đang lưu và đồng bộ Logo...');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/save-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl: activeTab === 'url' ? urlInput.trim() : undefined,
          fileData: activeTab === 'file' ? filePreview : undefined
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage(data.message || 'Đã cập nhật Logo thành công!');
        window.dispatchEvent(new CustomEvent('qgx_logo_updated', {
          detail: { logoUrl: data.logoUrl || finalImageSrc }
        }));

        setTimeout(() => {
          setIsSaving(false);
          setStatusMessage(null);
          onClose();
        }, 1200);
      } else {
        throw new Error(data.error || 'Không thể lưu logo.');
      }
    } catch (err: any) {
      console.error('Lỗi khi lưu logo:', err);
      setErrorMsg(err.message || 'Lỗi mạng khi lưu logo.');
      setIsSaving(false);
      setStatusMessage(null);
    }
  };

  const activePreview = activeTab === 'file' ? filePreview : urlPreview;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 text-white z-10 space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>ĐỔI LOGO QUÁN GAME XÓM</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-black">
                  ADMIN
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-body">
                Thay đổi biểu tượng thương hiệu chính của website (đồng bộ Vercel Blob & GitHub)
              </p>
            </div>
          </div>

          {/* Tab Selector: Upload File or Direct URL */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-mono font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'file'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh Từ Máy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Dán Link URL Trực Tiếp</span>
            </button>
          </div>

          {/* Tab 1: Local File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <label
                className="w-full border-2 border-dashed border-slate-700 hover:border-amber-400/80 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition-all text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-amber-300">
                  {selectedFile ? selectedFile.name : 'Bấm để chọn file ảnh Logo (PNG, JPG, SVG, WEBP)'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Tối đa 15MB. Khuyên dùng ảnh vuông hoặc tròn sắc nét'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Tab 2: Direct URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-amber-300 uppercase">
                Đường dẫn hình ảnh (URL):
              </label>
              <input
                type="text"
                value={urlInput}
                onChange={handleUrlChange}
                placeholder="https://example.com/logo.png"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-mono outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 leading-relaxed font-body">
                Hỗ trợ link ảnh công khai từ Vercel Blob, Imgur, Discord CDN, GitHub, v.v.
              </p>
            </div>
          )}

          {/* Image Preview Box */}
          {activePreview && (
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-900 shrink-0 shadow-md">
                <img
                  src={activePreview}
                  alt="Logo Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-mono font-bold text-amber-300 block">Xem trước Logo</span>
                <span className="text-[11px] text-slate-400 truncate block">Logo sẽ tự động cập nhật ngay trên toàn bộ giao diện</span>
              </div>
            </div>
          )}

          {/* Status & Error Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          {statusMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !activePreview}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Lưu & Áp Dụng Logo</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
