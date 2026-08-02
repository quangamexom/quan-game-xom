import React from 'react';
import { Trophy, Tv, Play, Flame, Award } from 'lucide-react';

export const TournamentBanner: React.FC = () => {
  return (
    <section className="py-12 lg:py-16 bg-[#080B12] border-b border-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/30 bg-slate-950 p-6 sm:p-10 lg:p-12 text-center shadow-2xl">
          {/* Background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter brightness-50 opacity-40"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1600&auto=format&fit=crop')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

          {/* Content */}
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="px-3 py-1 bg-indigo-600/90 text-white font-mono font-bold text-[10px] rounded-full uppercase tracking-widest inline-flex items-center gap-1.5 shadow">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              TOURNAMENT 2026
            </span>

            <h3 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              QUÁN GAME XÓM <br />
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                CHAMPIONS TOURNAMENT
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 opacity-90 leading-relaxed font-normal">
              Giải đấu giao lưu esports hấp dẫn hàng tháng với những phần thưởng code game bản quyền và linh kiện máy tính độc quyền.
            </p>

            <div className="pt-3">
              <button
                onClick={() => alert("Chương trình giải đấu sắp diễn ra! Hãy theo dõi Fanpage Quán Game Xóm để cập nhật lịch thi đấu.")}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] hover:scale-105 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Tv className="w-4 h-4" />
                <span>WATCH STREAM / XEM GIẢI ĐẤU</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
