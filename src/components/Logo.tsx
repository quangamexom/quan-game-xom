import React, { useState, useEffect, useRef } from 'react';
import { Upload, Link as LinkIcon, Camera } from 'lucide-react';
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
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Fetch current official logo from server
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

      // Save to server & GitHub repository
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
    }
  };

  const resetToDefaultLogo = () => {
    const defaultUrl = DEFAULT_LOGO_URL || '/assets/logo/logo-qgx-default.svg';
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

  const handlePasteUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      saveLogoToServerAndLocal(urlInput.trim());
      setIsUrlModalOpen(false);
      setUrlInput('');
    }
  };

  const dimensions = {
    sm: { box: 'w-8 h-8 sm:w-10 sm:h-10', text: 'text-xs sm:text-base' },
    md: { box: 'w-10 h-10 sm:w-12 sm:h-12', text: 'text-sm sm:text-xl' },
    lg: { box: 'w-10 h-10 sm:w-14 sm:h-14 lg:w-16 lg:h-16', text: 'text-xs xs:text-sm sm:text-xl lg:text-2xl' },
    xl: { box: 'w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24', text: 'text-base sm:text-2xl lg:text-3xl' }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Hidden file input for custom logo upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* QUÁN GAME XÓM Circular Badge Logo */}
      <div 
        className={`relative group shrink-0 ${dimensions.box} ${allowUpload ? 'cursor-pointer' : ''}`}
        onClick={() => allowUpload && fileInputRef.current?.click()}
        title={allowUpload ? "Click để tải lên hình ảnh logo gốc (PNG)" : undefined}
      >
        {/* Ambient Cyan/Purple Outer Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-purple-600 rounded-full blur-md opacity-80 group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />
        
        {customImage && !imgError ? (
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.7)] group-hover:scale-105 transition-transform duration-300 bg-slate-950">
            <img 
              src={customImage} 
              alt="QUÁN GAME XÓM Logo" 
              className="w-full h-full object-cover"
              onError={() => {
                setImgError(true);
              }}
            />
          </div>
        ) : (
          <svg
            viewBox="0 0 300 300"
            className="relative w-full h-full drop-shadow-[0_0_15px_rgba(34,211,238,0.7)] transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              {/* Outer Circular Gradient Border */}
              <linearGradient id="outerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="35%" stopColor="#22D3EE" />
                <stop offset="70%" stopColor="#E087FF" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>

              {/* Inner Dark Circuit Board Gradient */}
              <radialGradient id="circuitBg" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="60%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>

              {/* Shield Neon Border Gradient */}
              <linearGradient id="shieldNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00F0FF" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>

              {/* QUÁN 3D Gold Gradient */}
              <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="25%" stopColor="#FFE17D" />
                <stop offset="65%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>

              <linearGradient id="goldTextStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#78350F" />
                <stop offset="100%" stopColor="#451A03" />
              </linearGradient>

              {/* GAME XÓM Metallic Cyan/Silver Gradient */}
              <linearGradient id="gameXomGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="40%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>

              {/* Glow Filter */}
              <filter id="neonGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. Outer Gradient Ring */}
            <circle cx="150" cy="150" r="145" fill="none" stroke="url(#outerRingGrad)" strokeWidth="8" />

            {/* 2. Inner Cyber Circle Canvas */}
            <circle cx="150" cy="150" r="140" fill="url(#circuitBg)" stroke="#090D16" strokeWidth="4" />

            {/* 3. Circuit Board Lines & Nodes in Background */}
            <g stroke="#334155" strokeWidth="2" opacity="0.6">
              <line x1="30" y1="100" x2="80" y2="100" />
              <line x1="80" y1="100" x2="100" y2="120" />
              <circle cx="30" cy="100" r="4" fill="#22D3EE" />

              <line x1="270" y1="100" x2="220" y2="100" />
              <line x1="220" y1="100" x2="200" y2="120" />
              <circle cx="270" cy="100" r="4" fill="#E087FF" />

              <line x1="40" y1="200" x2="90" y2="200" />
              <circle cx="40" cy="200" r="4" fill="#3B82F6" />

              <line x1="260" y1="200" x2="210" y2="200" />
              <circle cx="260" cy="200" r="4" fill="#EC4899" />
            </g>

            {/* 4. Central Tech Shield Badge */}
            <path
              d="M 150 40 C 210 40, 240 60, 240 90 C 240 180, 200 235, 150 260 C 100 235, 60 180, 60 90 C 60 60, 90 40, 150 40 Z"
              fill="#0B0F19"
              stroke="url(#shieldNeonGrad)"
              strokeWidth="6"
              filter="url(#neonGlow)"
            />

            {/* Inner Shield Bevel Line */}
            <path
              d="M 150 52 C 200 52, 225 70, 225 95 C 225 170, 190 220, 150 242 C 110 220, 75 170, 75 95 C 75 70, 100 52, 150 52 Z"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* 5. Top Character Avatar (Guy with Spiked Brown Hair & Sunglasses & Smirk) */}
            <g transform="translate(0, 5)">
              {/* Spiky Anime Hair Background layer */}
              <path
                d="M 110 90 Q 95 60, 115 50 Q 120 25, 150 22 Q 180 25, 185 50 Q 205 60, 190 90 Q 200 100, 195 110 L 105 110 Q 100 100, 110 90 Z"
                fill="#543310"
                stroke="#090D16"
                strokeWidth="3"
              />
              {/* Spiky Hair Tufts */}
              <path
                d="M 125 45 L 140 28 L 150 42 L 165 28 L 175 48 L 190 40 L 180 65 L 195 72 L 180 90 L 120 90 L 105 72 L 120 65 L 110 40 Z"
                fill="#744210"
                stroke="#F59E0B"
                strokeWidth="2"
              />
              {/* Hair Highlights */}
              <path d="M 135 38 L 145 32 M 155 35 L 168 30" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />

              {/* Character Face */}
              <path
                d="M 115 90 C 115 90, 115 130, 150 135 C 185 130, 185 90, 185 90 Z"
                fill="#FDBA74"
                stroke="#090D16"
                strokeWidth="3"
              />

              {/* Ears */}
              <circle cx="112" cy="100" r="7" fill="#FDBA74" stroke="#090D16" strokeWidth="2" />
              <circle cx="188" cy="100" r="7" fill="#FDBA74" stroke="#090D16" strokeWidth="2" />

              {/* Black Cool Sunglasses */}
              <path
                d="M 114 85 L 147 88 L 150 93 L 153 88 L 186 85 L 182 110 C 178 116, 157 118, 154 110 L 150 97 L 146 110 C 143 118, 122 116, 118 110 Z"
                fill="#090D16"
                stroke="#38BDF8"
                strokeWidth="3"
              />
              {/* Glare on Sunglasses */}
              <line x1="120" y1="90" x2="138" y2="104" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" strokeLinecap="round" />
              <line x1="160" y1="90" x2="178" y2="104" stroke="#FFFFFF" strokeWidth="3" opacity="0.7" strokeLinecap="round" />

              {/* Smirk & Goatee */}
              <path d="M 134 121 Q 150 130, 166 121" fill="none" stroke="#7C2D12" strokeWidth="3" strokeLinecap="round" />
              <path d="M 138 122 Q 150 128, 162 122" fill="#FFFFFF" />
              <path d="M 145 130 Q 150 135, 155 130" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* 6. Gold Ribbon Banner with "QUÁN" */}
            <g transform="translate(0, 10)">
              {/* Banner Background Outer Ribbon */}
              <path
                d="M 60 135 L 240 135 L 255 175 L 235 185 L 65 185 L 45 175 Z"
                fill="#090D16"
                stroke="#F59E0B"
                strokeWidth="4"
                filter="url(#neonGlow)"
              />
              {/* Banner Gold Fill */}
              <path
                d="M 64 139 L 236 139 L 248 171 L 230 181 L 70 181 L 52 171 Z"
                fill="url(#goldTextGrad)"
                stroke="#FFFBEB"
                strokeWidth="1.5"
              />
              {/* "QUÁN" 3D Bold Font */}
              <text
                x="150"
                y="173"
                textAnchor="middle"
                fill="#451A03"
                fontWeight="900"
                fontSize="40"
                fontFamily="Arial Black, Impact, sans-serif"
                letterSpacing="3"
              >
                QUÁN
              </text>
              <text
                x="150"
                y="170"
                textAnchor="middle"
                fill="url(#goldTextGrad)"
                stroke="url(#goldTextStroke)"
                strokeWidth="1.5"
                fontWeight="900"
                fontSize="40"
                fontFamily="Arial Black, Impact, sans-serif"
                letterSpacing="3"
              >
                QUÁN
              </text>
            </g>

            {/* 7. Bottom Metallic Container with "GAME XÓM" */}
            <g transform="translate(0, 5)">
              <rect
                x="72"
                y="196"
                width="156"
                height="38"
                rx="6"
                fill="#070A14"
                stroke="#22D3EE"
                strokeWidth="3"
                filter="url(#neonGlow)"
              />
              <text
                x="150"
                y="223"
                textAnchor="middle"
                fill="#0284C7"
                fontWeight="900"
                fontSize="20"
                fontFamily="Arial Black, sans-serif"
                letterSpacing="2"
              >
                GAME XÓM
              </text>
              <text
                x="150"
                y="221"
                textAnchor="middle"
                fill="url(#gameXomGrad)"
                fontWeight="900"
                fontSize="20"
                fontFamily="Arial Black, sans-serif"
                letterSpacing="2"
              >
                GAME XÓM
              </text>
            </g>
          </svg>
        )}

        {/* Admin Overlay Camera Icon (If hovered) */}
        {isAdmin && (
          <div 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold text-center p-1 cursor-pointer"
            title="Đổi logo"
          >
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
        )}
      </div>

      {/* Brand Title Text & Admin Logo Buttons */}
      <div className="flex flex-col min-w-0">
        {showText && (
          <>
            <div className="flex items-center gap-1 sm:gap-1.5">
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
          </>
        )}

        {/* 3 Admin Logo Action Buttons - STRICTLY RENDERED ONLY FOR ADMIN */}
        {isAdmin && (
          <div className="flex items-center gap-1.5 mt-1 z-30 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-500/50 rounded-md text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
              title="Upload file ảnh logo cố định từ máy tính"
            >
              <Upload className="w-2.5 h-2.5" />
              <span>a) Upload Ảnh</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsUrlModalOpen(true);
              }}
              className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 border border-cyan-500/50 rounded-md text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
              title="Dán link URL ảnh logo ngoài"
            >
              <LinkIcon className="w-2.5 h-2.5" />
              <span>b) Dán Link</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetToDefaultLogo();
              }}
              className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-400 hover:text-slate-950 text-purple-300 border border-purple-500/50 rounded-md text-[9px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
              title="Reset về Logo Gốc mặc định"
            >
              <span>c) Reset Gốc</span>
            </button>
          </div>
        )}
      </div>

      {/* Paste URL Modal for Admin */}
      {isAdmin && isUrlModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            setIsUrlModalOpen(false);
          }}
        >
          <div 
            className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-amber-300 font-display flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-cyan-400" />
                <span>DÁN LINK URL LOGO MỚI</span>
              </h3>
              <button 
                onClick={() => setIsUrlModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePasteUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">URL Ảnh Logo:</label>
                <input 
                  type="url" 
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
                >
                  {isSaving ? 'Đang lưu...' : 'Cập Nhật Logo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

