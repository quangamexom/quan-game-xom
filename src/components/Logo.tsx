import React, { useState, useEffect } from 'react';
import { OFFICIAL_LOGO_URL, CUSTOM_LOGO_URL } from '../data/customLogo';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showText = true,
  onClick
}) => {
  const [imgSrc, setImgSrc] = useState<string>(OFFICIAL_LOGO_URL || CUSTOM_LOGO_URL || '/assets/logo/logo-qgx-default.png');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Initial fetch to get latest logo from server
    fetch('/api/get-logo')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.logoUrl) {
          setImgSrc(data.logoUrl);
          setHasError(false);
        }
      })
      .catch(() => {});

    // Listen to real-time custom logo update events
    const handleLogoUpdate = (e: any) => {
      if (e?.detail?.logoUrl) {
        setImgSrc(e.detail.logoUrl);
        setHasError(false);
      } else {
        fetch('/api/get-logo')
          .then(res => res.json())
          .then(data => {
            if (data.success && data.logoUrl) {
              setImgSrc(data.logoUrl);
              setHasError(false);
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener('qgx_logo_updated', handleLogoUpdate);
    return () => window.removeEventListener('qgx_logo_updated', handleLogoUpdate);
  }, []);

  const dimensions = {
    sm: { box: 'w-9 h-9', text: 'text-xs sm:text-base' },
    md: { box: 'w-11 h-11 sm:w-12 sm:h-12', text: 'text-sm sm:text-xl' },
    lg: { box: 'w-12 h-12 sm:w-16 sm:h-16', text: 'text-base sm:text-2xl' },
    xl: { box: 'w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24', text: 'text-xl sm:text-3xl' }
  }[size];

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className={`flex items-center gap-3 select-none cursor-pointer group ${className}`}
      onClick={handleLogoClick}
      title="Quán Game Xóm - Trang Chủ"
    >
      {/* Circular Logo Container */}
      <div className={`relative shrink-0 ${dimensions.box}`}>
        {/* Outer Glowing Neon Aura */}
        <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-400 via-cyan-400 to-purple-600 rounded-full blur-sm opacity-80 group-hover:opacity-100 group-hover:blur-md transition-all duration-300" />
        
        {/* Inner Circle Frame */}
        <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-950 border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          {!hasError ? (
            <img 
              src={imgSrc} 
              alt="Logo Quán Game Xóm" 
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
              loading="eager"
              onError={() => {
                // Fallback to SVG if PNG fails
                if (imgSrc !== '/assets/logo/logo-qgx-default.svg') {
                  setImgSrc('/assets/logo/logo-qgx-default.svg');
                } else {
                  setHasError(true);
                }
              }}
            />
          ) : (
            /* Fallback Vector Emblem */
            <svg viewBox="0 0 100 100" className="w-full h-full p-1 text-amber-400">
              <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#f59e0b" strokeWidth="3" />
              <path d="M 30 50 L 70 50 M 50 30 L 50 70" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" />
              <circle cx="35" cy="35" r="5" fill="#f43f5e" />
              <circle cx="65" cy="35" r="5" fill="#10b981" />
            </svg>
          )}
        </div>
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
          <p className="hidden sm:block text-[10px] lg:text-[11px] text-slate-400 font-medium truncate group-hover:text-slate-300 transition-colors">
            Cổng Game Việt Hóa & Giả Lập Đỉnh Cao
          </p>
        </div>
      )}
    </div>
  );
};
