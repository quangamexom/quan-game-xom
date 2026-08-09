import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Camera, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { useAdminMode } from '../hooks/useAdminMode';
import { DEFAULT_LOGO_URL, CUSTOM_LOGO_URL } from '../data/customLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  allowUpload?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  allowUpload = false
}) => {
  const { isAdmin } = useAdminMode();
  const [customImage, setCustomImage] = useState<string>(CUSTOM_LOGO_URL || DEFAULT_LOGO_URL);
  const [imgError, setImgError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<'file' | 'url'>('file');
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canEdit = isAdmin || allowUpload;

  useEffect(() => {
    // Fetch current logo from server
    fetch('/api/get-logo')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.logoUrl) {
          setCustomImage(data.logoUrl);
          setImgError(false);
          localStorage.setItem('quan_game_xom_custom_logo', data.logoUrl);
        }
      })
      .catch((err) => console.warn('Get logo API error:', err));

    const updateLogoFromStorage = () => {
      const savedLogo = localStorage.getItem('quan_game_xom_custom_logo');
      if (savedLogo) {
        setCustomImage(savedLogo);
        setImgError(false);
      }
    };

    const handleCustomLogoEvent = (e: any) => {
      if (e.detail?.logoUrl) {
        setCustomImage(e.detail.logoUrl);
        setImgError(false);
      }
    };

    window.addEventListener('custom-logo-updated', handleCustomLogoEvent);
    window.addEventListener('storage', updateLogoFromStorage);
    return () => {
      window.removeEventListener('custom-logo-updated', handleCustomLogoEvent);
      window.removeEventListener('storage', updateLogoFromStorage);
    };
  }, []);

  const saveLogoToServerAndLocal = async (logoUrlOrData: string) => {
    setIsSaving(true);
    setImgError(false);
    try {
      setCustomImage(logoUrlOrData);
      localStorage.setItem('quan_game_xom_custom_logo', logoUrlOrData);
      window.dispatchEvent(new CustomEvent('custom-logo-updated', { detail: { logoUrl: logoUrlOrData } }));

      const res = await fetch('/api/save-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logoUrl: logoUrlOrData })
      });
      const data = await res.json();
      if (data.success && data.logoUrl) {
        setCustomImage(data.logoUrl);
        setImgError(false);
        localStorage.setItem('quan_game_xom_custom_logo', data.logoUrl);
        window.dispatchEvent(new CustomEvent('custom-logo-updated', { detail: { logoUrl: data.logoUrl } }));
      }
    } catch (err) {
      console.warn('Save logo warning:', err);
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const resetToDefaultLogo = () => {
    const defaultUrl = DEFAULT_LOGO_URL || '/assets/logo/logo-qgx-default.png';
    localStorage.removeItem('quan_game_xom_custom_logo');
    saveLogoToServerAndLocal(defaultUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          saveLogoToServerAndLocal(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      saveLogoToServerAndLocal(urlInput.trim());
      setUrlInput('');
    }
  };

  const dimensions = {
    sm: { box: 'w-9 h-9', text: 'text-xs sm:text-base' },
    md: { box: 'w-11 h-11 sm:w-12 sm:h-12', text: 'text-sm sm:text-xl' },
    lg: { box: 'w-12 h-12 sm:w-16 sm:h-16', text: 'text-base sm:text-2xl' },
    xl: { box: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24', text: 'text-xl sm:text-3xl' }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Circular Logo Placeholder Container */}
      <div 
        className={`relative group shrink-0 ${dimensions.box} ${canEdit ? 'cursor-pointer' : ''}`}
        onClick={() => canEdit && setIsModalOpen(true)}
        title={canEdit ? "Bấm để thay đổi logo (Tải ảnh từ máy / Dán Link)" : undefined}
      >
        {/* Outer Glowing Ring */}
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-400 via-cyan-400 to-purple-600 rounded-full blur-sm opacity-80 group-hover:opacity-100 group-hover:blur-md transition-all duration-300" />
        
        {/* Inner Circle Frame */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          {customImage && !imgError ? (
            <img 
              src={customImage} 
              alt="Logo Quán Game Xóm" 
              className="w-full h-full object-cover rounded-full"
              onError={() => {
                if (customImage !== DEFAULT_LOGO_URL && customImage !== '/assets/logo/logo-qgx-default.png') {
                  setCustomImage('/assets/logo/logo-qgx-default.png');
                } else {
                  setImgError(true);
                }
              }}
            />
          ) : (
            /* Vector SVG Placeholder */
            <svg viewBox="0 0 100 100" className="w-full h-full p-1 text-amber-400">
              <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
              <path d="M 30 50 L 70 50 M 50 30 L 50 70" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="35" cy="35" r="5" fill="#f43f5e" />
              <circle cx="65" cy="35" r="5" fill="#10b981" />
            </svg>
          )}

          {/* Hover Camera Overlay / Badge */}
          {canEdit && (
            <div className="absolute inset-0 bg-slate-950/70 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-amber-300">
              <Camera className="w-4 h-4 text-amber-400" />
              <span className="text-[8px] font-bold mt-0.5 uppercase tracking-tighter">Đổi</span>
            </div>
          )}
        </div>

        {/* Small Corner Upload Icon Badge if editable */}
        {canEdit && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-slate-950 p-1 rounded-full border border-slate-900 shadow-md group-hover:scale-110 transition-transform">
            <Camera className="w-2.5 h-2.5" />
          </div>
        )}
      </div>

      {/* Brand Title Text */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className={`font-black tracking-tight text-white ${dimensions.text} flex items-center shrink-0`}>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)] font-black whitespace-nowrap">
                QUÁN GAME XÓM
              </span>
            </h1>
            <span className="hidden xs:inline-block px-1 py-0.2 text-[9px] sm:text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded shadow-sm shrink-0">
              UX/UI
            </span>
          </div>
          <p className="hidden sm:block text-[10px] lg:text-[11px] text-slate-400 font-medium truncate">
            Cổng Game Việt Hóa & Giả Lập Đỉnh Cao
          </p>

          {/* Quick Upload Button under title if Admin */}
          {canEdit && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-1 self-start px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Upload className="w-2.5 h-2.5 text-amber-400" />
              <span>Cấu hình Logo</span>
            </button>
          )}
        </div>
      )}

      {/* Combined Upload Modal: Device Upload & Paste Link URL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl text-left relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300 font-display">TẢI LÊN LẠI LOGO</h3>
                  <p className="text-[11px] text-slate-400">Thay đổi logo hình tròn hiển thị cho ứng dụng</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-xl mb-4 border border-slate-800">
              <button
                type="button"
                onClick={() => setUploadTab('file')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  uploadTab === 'file' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải Từ Máy</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadTab('url')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  uploadTab === 'url' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Dán Link URL</span>
              </button>
            </div>

            {/* Tab Content: Upload File */}
            {uploadTab === 'file' && (
              <div className="space-y-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-950/60 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-slate-950 group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-amber-200">Bấm vào đây để chọn tệp từ thiết bị</p>
                  <p className="text-[10px] text-slate-400 mt-1">Hỗ trợ PNG, JPG, WEBP, SVG (Khuyên dùng hình vuông/tròn)</p>
                </div>
              </div>
            )}

            {/* Tab Content: Paste Link URL */}
            {uploadTab === 'url' && (
              <form onSubmit={handleUrlSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Dán liên kết ảnh từ trang khác:</label>
                  <input 
                    type="url" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/hinh-anh-logo.png"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSaving || !urlInput.trim()}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Đang áp dụng...' : 'Xác Nhận Sử Dụng Link Này'}</span>
                </button>
              </form>
            )}

            {/* Bottom Actions: Reset to Default */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  resetToDefaultLogo();
                  setIsModalOpen(false);
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Logo Về Mặc Định</span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
