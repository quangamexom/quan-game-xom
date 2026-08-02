import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { 
  Search, RefreshCw, Database, Coffee, Sparkles, User, Download, 
  ChevronDown, ChevronRight, Facebook, Youtube, MessageSquare, Filter, Star
} from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCMS: () => void;
  onOpenDonate: () => void;
  onRefreshSync: () => void;
  isSyncing: boolean;
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
  onOpenCMS,
  onOpenDonate,
  onRefreshSync,
  isSyncing,
  gameCount,
  activeCategory,
  onCategoryChange,
  onSelectPlatformFilter,
  onSelectGenreFilter,
  onSelectVietHoaFilter
}) => {
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
      onCategoryChange('GAMES');
      if (onSelectPlatformFilter) onSelectPlatformFilter('ALL');
      if (onSelectVietHoaFilter) onSelectVietHoaFilter(false);
    } else if (type === 'platform') {
      onCategoryChange('GAMES');
      if (onSelectPlatformFilter) onSelectPlatformFilter(value);
    } else if (type === 'genre') {
      onCategoryChange('GAMES');
      if (onSelectGenreFilter) onSelectGenreFilter(value);
    } else if (type === 'viethoa') {
      onCategoryChange('GAMES');
      if (onSelectVietHoaFilter) onSelectVietHoaFilter(true);
    }

    setIsGameDropdownOpen(false);
    
    // Scroll to game catalog
    const catalogEl = document.getElementById('game-catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#05070E]/98 backdrop-blur-xl border-b border-indigo-950/80 shadow-2xl">
      
      {/* 1. TOP UTILITY BAR: Social Icons (Left) + Search & Quick Actions (Right) */}
      <div className="bg-[#030409] border-b border-slate-900/90 py-1.5 px-2 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4 text-xs">
          
          {/* Top Left: Social Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest hidden md:inline-block mr-1">
              COMMUNITY:
            </span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              title="Facebook Quán Game Xóm"
            >
              <Facebook className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-900 hover:bg-red-600 hover:text-white border border-slate-800 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              title="YouTube Channel"
            >
              <Youtube className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
            <a
              href="https://discord.com"
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

            {/* Sync Badge */}
            <button
              onClick={onRefreshSync}
              disabled={isSyncing}
              className="hidden md:flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full px-2.5 py-1 text-[11px] font-mono transition-all cursor-pointer"
              title="Đồng bộ Google Sheet"
            >
              <RefreshCw className={`w-3 h-3 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-[10px] text-slate-300">
                {isSyncing ? 'Syncing' : `${gameCount} Games`}
              </span>
            </button>

            {/* CMS Button */}
            <button
              onClick={onOpenCMS}
              className="hidden sm:flex items-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <Database className="w-3 h-3 text-cyan-400" />
              <span>CMS</span>
            </button>

          </div>

        </div>
      </div>

      {/* 2. MAIN HEADER NAVIGATION - 3 ZONES: [MENU TRÁI] - [LOGO Ở GIỮA, TO] - [MENU PHẢI] */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-1 sm:gap-4">
          
          {/* ZONE 1: LEFT MENU (TRANG CHỦ | DANH SÁCH GAME) */}
          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-start">
            
            {/* TRANG CHỦ */}
            <button
              onClick={() => {
                onCategoryChange('HOME');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase whitespace-nowrap ${
                activeCategory === 'HOME'
                  ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-glow-amber' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              TRANG CHỦ
            </button>

            {/* DANH SÁCH GAME (WITH MEGA DROPDOWN) */}
            <div 
              className="relative" 
              ref={dropdownRef}
              onMouseEnter={() => setIsGameDropdownOpen(true)}
              onMouseLeave={() => setIsGameDropdownOpen(false)}
            >
              <button
                onClick={() => {
                  onCategoryChange('GAMES');
                  setIsGameDropdownOpen(!isGameDropdownOpen);
                }}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all cursor-pointer font-display text-[10px] xs:text-xs sm:text-sm font-black tracking-wider uppercase flex items-center gap-1 whitespace-nowrap ${
                  activeCategory === 'GAMES' || isGameDropdownOpen
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] text-glow-amber' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <span className="hidden sm:inline">DANH SÁCH GAME</span>
                <span className="sm:hidden">DANH SÁCH</span>
                <ChevronDown className={`w-3 h-3 text-amber-400 transition-transform duration-200 ${isGameDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isGameDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[320px] sm:w-[580px] bg-[#04060D]/98 backdrop-blur-2xl border border-indigo-900/80 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.95)] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* GROUP 1: TRẠNG THÁI */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-display font-black text-amber-400 uppercase tracking-widest pb-1.5 border-b border-amber-500/20 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>TRẠNG THÁI</span>
                    </div>
                    <ul className="space-y-1 text-xs font-body">
                      {[
                        { label: 'Tất Cả Game', type: 'all', val: 'ALL' },
                        { label: 'Game Việt Hóa ⭐', type: 'viethoa', val: true },
                        { label: 'Mới Cập Nhật 2026', type: 'all', val: 'ALL' },
                        { label: 'Game Top Đánh Giá', type: 'all', val: 'ALL' }
                      ].map((item, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => handleSelectFilter(item.type as any, item.val, item.label)}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* GROUP 2: THỂ LOẠI */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-display font-black text-cyan-400 uppercase tracking-widest pb-1.5 border-b border-cyan-500/20 flex items-center gap-1.5">
                      <Filter className="w-3 h-3 text-cyan-400" />
                      <span>THỂ LOẠI</span>
                    </div>
                    <ul className="space-y-1 text-xs font-body">
                      {[
                        'Hành động',
                        'Nhập vai (RPG)',
                        'Chiến thuật',
                        'Bắn súng',
                        'Kinh dị',
                        'Giả lập PS1/PS2'
                      ].map((genre, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => handleSelectFilter('genre', genre, genre)}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>{genre}</span>
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* GROUP 3: NỀN TẢNG */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-display font-black text-indigo-400 uppercase tracking-widest pb-1.5 border-b border-indigo-500/20 flex items-center gap-1.5">
                      <Download className="w-3 h-3 text-indigo-400" />
                      <span>NỀN TẢNG</span>
                    </div>
                    <ul className="space-y-1 text-xs font-body">
                      {[
                        { label: 'Game PC Windows', val: 'PC' },
                        { label: 'PlayStation 1 (PS1)', val: 'PS1' },
                        { label: 'PlayStation 2 (PS2)', val: 'PS2' },
                        { label: 'PlayStation 4/5', val: 'PS4' },
                        { label: 'Nintendo Switch', val: 'Switch' },
                        { label: 'Android Mobile', val: 'Android' }
                      ].map((plat, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => handleSelectFilter('platform', plat.val, plat.label)}
                            className="w-full text-left py-1.5 px-2 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-indigo-500/10 flex items-center justify-between transition-all cursor-pointer"
                          >
                            <span>{plat.label}</span>
                            <ChevronRight className="w-3 h-3 text-slate-500" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* ZONE 2: CENTER LOGO (DISPLAYED LARGER + CLICK TO CHANGE IMAGE) */}
          <div className="flex flex-col items-center justify-center shrink-0 px-2 sm:px-4">
            <div 
              onClick={() => {
                onCategoryChange('HOME');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="cursor-pointer transition-transform hover:scale-105 group"
            >
              <Logo size="lg" showText={true} allowUpload={true} />
            </div>
          </div>

          {/* ZONE 3: RIGHT MENU (BÀI VIẾT | DONATE | LIÊN HỆ) */}
          <div className="flex items-center gap-1 sm:gap-4 flex-1 justify-end">
            
            {/* BÀI VIẾT */}
            <button
              onClick={() => {
                onCategoryChange('ARTICLES');
                const articlesEl = document.getElementById('articles-section');
                if (articlesEl) articlesEl.scrollIntoView({ behavior: 'smooth' });
              }}
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
              onClick={() => {
                onCategoryChange('COMMUNITY');
                const commEl = document.getElementById('community-section');
                if (commEl) commEl.scrollIntoView({ behavior: 'smooth' });
              }}
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
