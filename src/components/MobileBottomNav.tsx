import React from 'react';
import { Gamepad2, Search, Coffee, Database, Layers, Sparkles } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenDonate: () => void;
  onScrollTop: () => void;
  gameCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenDonate,
  onScrollTop,
  gameCount
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 py-2 md:hidden shadow-2xl">
      <div className="flex items-center justify-around gap-1">
        
        {/* Home / Explore */}
        <button
          onClick={onScrollTop}
          className="flex flex-col items-center gap-0.5 text-amber-400 cursor-pointer"
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">Kho Game ({gameCount})</span>
        </button>

        {/* Coffee / Donate */}
        <button
          onClick={onOpenDonate}
          className="flex flex-col items-center gap-0.5 text-emerald-400 cursor-pointer"
        >
          <div className="p-2 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/20 -mt-5 border-2 border-slate-950">
            <Coffee className="w-5 h-5 text-slate-950 fill-slate-950" />
          </div>
          <span className="text-[10px] font-bold text-amber-300">Ủng Hộ</span>
        </button>

      </div>
    </nav>
  );
};
