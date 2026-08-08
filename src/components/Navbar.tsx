import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { useAdminMode } from '../hooks/useAdminMode';
import { 
  Search, RefreshCw, Database, Coffee, Sparkles, User, Download, 
  ChevronDown, ChevronRight, Facebook, Send, MessageSquare, Filter, Star
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenDonate: () => void;
  onOpenAdminModal?: () => void;
  gameCount: number;
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  onSelectPlatformFilter?: (platform: string) => void;
  onSelectGenreFilter?: (genre: string) => void;
  onSelectVietHoaFilter?: (vietHoaOnly: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenDonate,
  onOpenAdminModal,
  gameCount,
  activeCategory,
  onCategoryChange,
  onSelectPlatformFilter,
  onSelectGenreFilter,
  onSelectVietHoaFilter
}) => {
  const { isAdmin, disableAdmin } = useAdminMode();
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);
  const [activeDropdownFilter, setActiveDropdownFilter] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsGameDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFilter = (type: 'platform' | 'genre' | 'viethoa' | 'all', value: any, filterLabel: string) => {
    setActiveDropdownFilter(filterLabel);
    if (type === 'all') {
      if (onSelectPlatformFilter) onSelectPlatformFilter('ALL');
      if (onSelectVietHoaFilter) onSelectVietHoaFilter(false);
    } else if (type === 'platform') {
      if (onSelectPlatformFilter) onSelectPlatformFilter(value);
    } else if (type === 'genre') {
      if (onSelectGenreFilter) onSelectGenreFilter(value);
    } else if (type === 'viethoa') {
      if (onSelectVietHoaFilter) onSelectVietHoaFilter(true);
    }

    setIsGameDropdownOpen(false);
    onCategoryChange('GAMES');
  };

  return (
    <header className="sticky top-0 z-50 glass-header">
      
      {/* 1. TOP UTILITY BAR: Social Icons (Left) + Search & Quick Actions (Right) */}
      <div className="bg-[#030409] border-b border-slate-900/90 py-1.5 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 text-xs">
          
          {/* Top Left: Social Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden md:inline-block mr-1">
              COMMUNITY:
            </span>
            <a
              href="https://www.facebook.com/quangamexomreboot/"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              title="Facebook Quán Game Xóm"
            >
              <Facebook className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
            <a
              href="https://t.me/quangamexomofficial"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 hover:bg-sky-500 hover:text-white border border-slate-800 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              title="Telegram Quán Game Xóm"
            >
              <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
            <a
              href="https://discord.gg/4XG76eeXWp"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              title="Discord Community"
            >
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
          </div>

          {/* Top Right: Search Box + Sync & CMS Tools */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Search Input Box */}
            <div className="relative w-32 xs:w-40 sm:w-60">
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (e.target.value && activeCategory !== 'GAMES') {
                    onCategoryChange('GAMES');
                  }
                }}
                placeholder="Tìm game..."
                className="w-full bg-[#080B16] hover:bg-[#0E1324] focus:bg-[#0E1324] border border-slate-800/80 focus:border-amber-500/60 rounded-full py-0.5 sm:py-1 pl-6 sm:pl-8 pr-5 text-[10px] sm:text-[11px] font-body text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[9px] bg-slate-800 rounded-full w-3.5 h-3.5 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Game Count Badge */}
            <div
              className="hidden md:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 rounded-full px-2.5 py-1 text-[11px] font-mono"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-[10px] text-slate-300">
                {gameCount} Games
              </span>
            </div>

            {/* Admin Upload Mode Button */}
            {isAdmin ? (
              <button
                type="button"
                onClick={disableAdmin}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all cursor-pointer bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                title="Bấm để thoát quyền Admin"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>ADMIN MODE: BẬT</span>
              </button>
            ) : onOpenAdminModal ? (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition-all cursor-pointer bg-slate-900 text-slate-400 border-slate-800 hover:text-amber-300 hover:border-amber-500/40"
                title="Mở khóa quyền Chủ Quán"
              >
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>CHỦ QUÁN</span>
              </button>
            ) : null}

          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION - 3 ZONES: [MENU TRÁI] - [LOGO Ở GIỮA, TO] - [MENU PHẢI] */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-1 sm:gap-4">
          
          {/* ZONE 1: LEFT MENU (TRANG CHỦ | THƯ VIỆN GAME | KHU VỰC GIẢ LẬP) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-start">
            
            {/* TRANG CHỦ */}
            <button
              onClick={() => onCategoryChange('HOME')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase whitespace-nowrap ${
                activeCategory === 'HOME'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-glow-amber' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              TRANG CHỦ
            </button>

            {/* THƯ VIỆN GAME (NO DROPDOWN, DIRECT NAVIGATION) */}
            <button
              onClick={() => onCategoryChange('GAMES')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase whitespace-nowrap ${
                activeCategory === 'GAMES'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-glow-amber' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <span className="hidden sm:inline">THƯ VIỆN GAME</span>
              <span className="sm:hidden">THƯ VIỆN</span>
            </button>

            {/* KHU VỰC GIẢ LẬP */}
            <button
              onClick={() => onCategoryChange('EMULATOR')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase whitespace-nowrap ${
                activeCategory === 'EMULATOR'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-glow-amber' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <span className="hidden sm:inline">KHU VỰC GIẢ LẬP</span>
              <span className="sm:hidden">GIẢ LẬP</span>
            </button>

          </div>

          {/* ZONE 2: CENTER LOGO (DISPLAYED LARGER + CLICK TO CHANGE IMAGE) */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4">
            <div 
              onClick={() => onCategoryChange('HOME')}
              className="cursor-pointer transition-transform hover:scale-105 group"
            >
              <Logo size="lg" showText={true} allowUpload={isAdmin} />
            </div>
          </div>

          {/* ZONE 3: RIGHT MENU (BÀI VIẾT | DONATE | LIÊN HỆ) */}
          <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
            
            {/* BÀI VIẾT */}
            <button
              onClick={() => onCategoryChange('ARTICLES')}
              className={`hidden md:block px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer font-display text-xs sm:text-sm font-black tracking-wider uppercase ${
                activeCategory === 'ARTICLES'
                  ? 'text-cyan-300 bg-indigo-600/30 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.3)] text-glow-cyan' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              BÀI VIẾT
            </button>

            {/* DONATE */}
            <button
              onClick={onOpenDonate}
              className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 flex items-center gap-1 shrink-0"
            >
              <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>DONATE</span>
            </button>

            {/* LIÊN HỆ */}
            <button
              onClick={() => onCategoryChange('COMMUNITY')}
              className={`hidden md:block px-3 sm:px-4 py-2 rounded-xl transition-all cursor-pointer font-display text-xs sm:text-sm font-black tracking-wider uppercase ${
                activeCategory === 'COMMUNITY'
                  ? 'text-cyan-300 bg-indigo-600/30 border border-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.3)] text-glow-cyan' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              LIÊN HỆ
            </button>

          </div>

        </div>
      </div>

    </header>
  );
};
