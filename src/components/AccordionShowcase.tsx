import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Zap, ShieldCheck, Gamepad, Sparkles, Trophy, Cpu, Flame } from 'lucide-react';

export const AccordionShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const accordionItems = [
    {
      id: 0,
      title: "Tải Game Tốc Độ High-Speed",
      tagline: "Fun Competition & Full Bandwidth",
      desc: "Hệ thống Google Drive, Terabox & Fshare VIP mirror cho phép bạn tải game với tốc độ tối đa đường truyền, không đứt gãy link hay gián đoạn trải nghiệm.",
      icon: Zap,
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 1,
      title: "Kho Việt Hóa Trau Chuốt 100%",
      tagline: "Real Champion & Full Story Sub",
      desc: "Mọi tựa game trên Quán Game Xóm đều được kiểm duyệt kỹ lưỡng, hỗ trợ tiếng Việt đầy đủ cốt truyện, hội thoại và giao diện, mang lại cảm xúc trọn vẹn.",
      icon: ShieldCheck,
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Vũ Trụ Giả Lập & PC Đa Dạng",
      tagline: "Living Universe & Multi Platform",
      desc: "Tổng hợp bộ cài giả lập sẵn (DuckStation, ePSXe, Yuzu, PCSX2) chỉ cần giải nén là chơi ngay mà không cần cấu hình phức tạp.",
      icon: Gamepad,
      image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1200&auto=format&fit=crop"
    }
  ];

  return (
    <section className="py-12 lg:py-16 bg-[#080B11] border-b border-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            ABOUT QUÁN GAME XÓM
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            WELCOME TO <span className="bg-gradient-to-r from-indigo-300 to-cyan-400 bg-clip-text text-transparent">QUÁN GAME XÓM</span>
          </h2>
        </div>

        {/* Content Layout matching Screenshot 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Accordion List */}
          <div className="lg:col-span-5 space-y-3">
            {accordionItems.map((item, index) => {
              const Icon = item.icon;
              const isOpen = activeTab === index;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveTab(index)}
                  className={`rounded-xl transition-all cursor-pointer overflow-hidden ${
                    isOpen 
                      ? 'glass-card border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                      : 'glass-panel border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isOpen ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-sm sm:text-base font-bold ${isOpen ? 'text-white' : 'text-slate-300'}`}>
                          {item.title}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {item.tagline}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 pt-1 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed"
                      >
                        {item.desc}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Featured Card Showcase with glowing outline frame */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl p-1 bg-gradient-to-tr from-indigo-500/40 via-cyan-500/30 to-purple-600/40 shadow-2xl overflow-hidden group">
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video">
                <img
                  src={accordionItems[activeTab].image}
                  alt={accordionItems[activeTab].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <span className="px-2.5 py-1 bg-indigo-600/90 text-white font-mono font-bold text-[10px] rounded uppercase tracking-wider">
                      QUÁN GAME XÓM FEATURE
                    </span>
                    <h4 className="text-lg font-bold text-white mt-1">
                      {accordionItems[activeTab].title}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
