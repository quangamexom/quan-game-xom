import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Send, Share2, Users, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const SocialCommunitySection: React.FC = () => {
  const socialLinks = [
    {
      name: 'Facebook Fanpage',
      handle: '@quangamexomreboot',
      description: 'Cập nhật tin tức game mới, link tải dự phòng và bài viết hoài niệm hàng ngày.',
      url: 'https://www.facebook.com/quangamexomreboot/',
      icon: (
        <svg className="w-8 h-8 fill-current text-blue-400" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      badge: 'CỘNG ĐỒNG 45K+',
      gradient: 'from-blue-600/20 to-indigo-900/30',
      borderColor: 'border-blue-500/40 hover:border-blue-400',
      btnBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
    },
    {
      name: 'Telegram Chính Thức',
      handle: '👉 Telegram Quán Game Xóm',
      description: 'Kênh thông báo tải game siêu tốc, cập nhật fix lỗi và nhận request game Việt Hóa 24/7.',
      url: 'https://t.me/quangamexomofficial',
      icon: (
        <Send className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
      ),
      badge: 'LINK TẢI FAST 24/7',
      gradient: 'from-cyan-600/20 to-blue-900/30',
      borderColor: 'border-cyan-500/40 hover:border-cyan-400',
      btnBg: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-cyan-500/30'
    },
    {
      name: 'Discord Quán Game Xóm',
      handle: '👉 Discord Quán Game Xóm',
      description: 'Phòng trà chém gió, chia sẻ mã cheat, giao lưu đấu giải PS1 & Yugioh trực tuyến.',
      url: 'https://discord.gg/4XG76eeXWp',
      icon: (
        <MessageSquare className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
      ),
      badge: 'VOICE CHÁT & GIẢ LẬP',
      gradient: 'from-indigo-600/20 to-purple-900/30',
      borderColor: 'border-indigo-500/40 hover:border-indigo-400',
      btnBg: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/30'
    }
  ];

  return (
    <section className="relative py-14 lg:py-20 bg-[#060812] border-t border-white/10 text-white overflow-hidden">
      {/* Background Neon Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-pink-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-display font-bold uppercase tracking-wider mb-3 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>KẾT NỐI ANH EM GAME THỦ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-white leading-tight">
            LIÊN HỆ & CỘNG ĐỒNG <br />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent text-glow-cyan">
              QUÁN GAME XÓM
            </span>
          </h2>
          <p className="text-slate-200/90 font-body text-sm sm:text-base mt-3 leading-relaxed">
            Không quảng cáo làm phiền - Không rút gọn link rác. Tham gia ngay các kênh chính thức bên dưới để nhận cập nhật mới nhất!
          </p>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {socialLinks.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative glass-card rounded-3xl p-6 sm:p-8 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-display font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-1 rounded-full uppercase tracking-tag">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-xl font-display font-black text-white group-hover:text-cyan-300 transition-colors">
                  {item.name}
                </h3>
                <div className="text-xs font-mono text-cyan-400 font-bold mt-1 mb-3">
                  {item.handle}
                </div>
                <p className="text-xs sm:text-sm font-body text-slate-300/90 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`w-full py-3.5 px-4 rounded-2xl ${item.btnBg} font-display font-black text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer border border-white/20`}
              >
                <span>THAM GIA NGAY</span>
                <ExternalLink className="w-4 h-4" />
              </a>

            </motion.div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="mt-12 glass-panel border border-emerald-500/40 hover:border-emerald-400/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <span className="bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  Cam kết 100% Không Quảng Cáo Bẩn
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <div className="text-xs text-slate-300 mt-0.5">Tất cả link tải game tại Quán Game Xóm đều trực tiếp, an toàn và sạch sẽ tuyệt đối.</div>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-emerald-300 bg-emerald-950/80 px-3.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-sm whitespace-nowrap">
            QUÁN GAME XÓM REBOOT 2026
          </span>
        </div>

      </div>
    </section>
  );
};
