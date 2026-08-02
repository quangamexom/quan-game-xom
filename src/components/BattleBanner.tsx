import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, ArrowRight, Flame } from 'lucide-react';

interface BattleBannerProps {
  onExplore: () => void;
}

export const BattleBanner: React.FC<BattleBannerProps> = ({ onExplore }) => {
  return (
    <section className="relative py-20 lg:py-28 bg-[#070A10] border-b border-slate-900 overflow-hidden text-center text-white">
      {/* Background Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1920&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070A10] via-[#070A10]/80 to-[#070A10]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10 space-y-4">
        <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block">
          JOIN THE COMMUNITY
        </span>
        
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight">
          BATTLE OF THE ANCIENTS <br />
          <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
            TRẬN CHIẾN TỐI CAO
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Hàng ngàn game thủ cùng thảo luận, chia sẻ kinh nghiệm Việt Hóa, cập nhật link tải không quảng cáo độc quyền tại Quán Game Xóm.
        </p>

        <div className="pt-4">
          <button
            onClick={onExplore}
            className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>SEE WHAT'S NEW / XEM CÓ GÌ MỚI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
