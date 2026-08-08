import React from 'react';
import { ChevronRight, Facebook, Youtube, MessageSquare } from 'lucide-react';
import { GameItem } from '../types';

interface FooterProps {
  onOpenDonate: () => void;
  onOpenAdminModal?: () => void;
  defaultPassword?: string;
  featuredGames?: GameItem[];
  onSelectGame?: (game: GameItem) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onOpenDonate, 
  onOpenAdminModal,
  defaultPassword = "quangamexom",
  featuredGames = [],
  onSelectGame 
}) => {
  // Sample avatars if featuredGames not passed or empty
  const avatarList = featuredGames.length > 0 ? featuredGames : [
    { id: '1', title: 'God of War', coverArt: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=300&auto=format&fit=crop' },
    { id: '2', title: 'Final Fantasy IX', coverArt: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop' },
    { id: '3', title: 'Yu-Gi-Oh!', coverArt: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=300&auto=format&fit=crop' },
    { id: '4', title: 'Resident Evil 3', coverArt: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop' },
    { id: '5', title: 'Black Myth Wukong', coverArt: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=300&auto=format&fit=crop' },
    { id: '6', title: 'GTA V', coverArt: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=300&auto=format&fit=crop' },
    { id: '7', title: 'Dynasty Warriors 8', coverArt: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=300&auto=format&fit=crop' },
    { id: '8', title: 'Elden Ring', coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop' },
  ];

  return (
    <footer className="bg-[#03040A] border-t border-slate-900/90 text-slate-400 text-xs pt-8 pb-12 relative z-10">
      
      {/* 1. TOP CAROUSEL RIBBON: Circular Game Avatars */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="text-center mb-3">
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-slate-500">
            KHO GAME NỔI BẬT & BÀI VIẾT TẢI NHIỀU
          </span>
        </div>

        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto py-3 scrollbar-none px-2">
          {avatarList.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectGame && (item as GameItem).id && onSelectGame(item as GameItem)}
              className="group relative shrink-0 cursor-pointer flex flex-col items-center gap-1.5"
              title={item.title}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-800 group-hover:border-amber-400 shadow-lg group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:scale-110 transition-all duration-300">
                <img
                  src={item.coverArt}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <span className="text-[10px] font-body text-slate-400 group-hover:text-amber-300 transition-colors max-w-[70px] truncate text-center">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 text-center space-y-6 pt-6 border-t border-slate-900/80">
        
        {/* 2. CENTER: © [YEAR] QUÁN GAME XÓM WITH ARROW ICON */}
        <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider">
          <ChevronRight className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
          <span>© 2026 QUÁN GAME XÓM</span>
        </div>

        {/* 3. CENTER SOCIAL ICONS (Facebook, Youtube, Discord) */}
        <div className="flex items-center justify-center gap-4 pt-1">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-blue-600 hover:text-white border border-slate-800 text-slate-300 flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
            aria-label="Facebook"
            title="Facebook Quán Game Xóm"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-red-600 hover:text-white border border-slate-800 text-slate-300 flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
            aria-label="YouTube"
            title="YouTube"
          >
            <Youtube className="w-4 h-4" />
          </a>
          <a
            href="https://discord.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-indigo-600 hover:text-white border border-slate-800 text-slate-300 flex items-center justify-center transition-all shadow-md cursor-pointer hover:scale-110"
            aria-label="Discord"
            title="Discord"
          >
            <MessageSquare className="w-4 h-4" />
          </a>
        </div>

        {/* Password Notice */}
        <div className="text-[11px] font-mono text-slate-500">
          Mật khẩu giải nén chung: <strong className="text-amber-400 font-bold">{defaultPassword}</strong>
        </div>

        {/* 4. BOTTOM LINE CREDIT */}
        <div className="pt-4 text-[10px] font-mono text-slate-600 tracking-widest uppercase flex items-center justify-center gap-3">
          <span>CODE & DESIGN BY QUÁN GAME XÓM</span>
          {onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="text-slate-600 hover:text-amber-400 transition-colors cursor-pointer underline text-[10px]"
              title="Mở khóa quyền Admin"
            >
              [ CHỦ QUÁN ]
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};

