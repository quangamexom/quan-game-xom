import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Clock, Eye, Heart, Sparkles, ChevronRight, ArrowRight, Tag } from 'lucide-react';
import { ARTICLES_DATA, Article } from '../data/articles';

interface ArticleSectionProps {
  onReadArticle: (article: Article) => void;
}

export const ArticleSection: React.FC<ArticleSectionProps> = ({ onReadArticle }) => {
  const [activeTab, setActiveTab] = useState<string>('Tất Cả');

  const categories = ['Tất Cả', 'Ký Ức', 'Hướng Dẫn', 'Review'];

  const filteredArticles = activeTab === 'Tất Cả' 
    ? ARTICLES_DATA 
    : ARTICLES_DATA.filter(a => a.category === activeTab);

  return (
    <section className="relative py-12 lg:py-16 bg-[#070A14] border-t border-white/10 text-white overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-tag">
                GÓC ĐỌC & HOÀI NIỆM
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2 text-glow-cyan">
              <BookOpen className="w-8 h-8 text-cyan-400 shrink-0" />
              <span>Bài Viết & Ký Ức Game Retro</span>
            </h2>
            <p className="text-slate-300 font-body text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
              Những câu chuyện tuổi thơ cắm mặt màn hình CRT, bí kíp giả lập mượt mà và cảm nhận tựa game Việt Hóa sắc nét.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md font-display">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === cat
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onReadArticle(article)}
              className="group relative bg-[#0F1424]/80 hover:bg-[#131A30] border border-white/10 hover:border-cyan-400/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl cursor-pointer backdrop-blur-xl flex flex-col justify-between"
            >
              {/* Glass subtle border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

              <div>
                {/* Article Cover Image */}
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1424] via-[#0F1424]/30 to-transparent" />

                  {/* Badge */}
                  <span className="absolute top-4 left-4 px-3 py-1 bg-cyan-500/90 text-slate-950 font-display font-black text-[11px] uppercase tracking-wider rounded-lg shadow-md backdrop-blur-md">
                    {article.category}
                  </span>

                  <span className="absolute bottom-3 right-4 text-xs font-mono font-bold text-slate-300 bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {article.readTime}
                  </span>
                </div>

                {/* Article Body */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{article.author}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-display font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-body text-slate-300/90 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-white/5 text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" /> {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-pink-400 font-bold">
                    <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" /> {article.likes}
                  </span>
                </div>

                <div className="flex items-center gap-1 font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

            </motion.article>
          ))}
        </div>

      </div>
    </section>
  );
};
