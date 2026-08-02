import React from 'react';
import { Download, Sparkles } from 'lucide-react';

interface BottomCTABannerProps {
  onOpenDownloadAny: () => void;
}

export const BottomCTABanner: React.FC<BottomCTABannerProps> = ({ onOpenDownloadAny }) => {
  return (
    <section className="py-12 bg-[#06090F] border-b border-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block">
              GET STARTED NOW
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              JOIN THE BATTLE NOW / <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">TẢI GAME VỀ MÁY</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Hơn 100+ tựa game Việt Hóa & Giả Lập chọn lọc sẵn sàng cho bạn trải nghiệm hoàn toàn miễn phí.
            </p>
          </div>

          <button
            onClick={onOpenDownloadAny}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:scale-105 transition-all shrink-0 flex items-center gap-2 cursor-pointer border border-indigo-400/40"
          >
            <Download className="w-4 h-4 fill-white" />
            <span>TẢI GAME MIỄN PHÍ</span>
          </button>
        </div>
      </div>
    </section>
  );
};
