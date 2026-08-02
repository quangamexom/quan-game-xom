import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Eye, Heart, Share2, Tag, BookOpen, User, Calendar } from 'lucide-react';
import { Article } from '../data/articles';

interface ArticleReaderModalProps {
  article: Article | null;
  onClose: () => void;
}

export const ArticleReaderModal: React.FC<ArticleReaderModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 cursor-pointer"
          onClick={onClose}
        />

        {/* Modal Window with Translucent Glass border */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          className="relative w-full max-w-4xl glass-modal rounded-3xl overflow-hidden z-10 my-auto text-white"
        >
          {/* Top Banner Image with Overlay */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover filter brightness-90 saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090D18] via-[#090D18]/60 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 text-slate-300 hover:text-white bg-slate-950/80 hover:bg-slate-900 border border-white/20 rounded-full transition-all cursor-pointer backdrop-blur-md z-20 shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Category Tag & Metadata */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs uppercase tracking-wider text-white rounded-full shadow-md">
                {article.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                {article.date}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {article.readTime}
              </span>
            </div>
          </div>

          {/* Article Header & Main Content */}
          <div className="p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
            
            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-display font-black text-white leading-tight tracking-tight text-glow-cyan">
              {article.title}
            </h1>

            {/* Author info & Actions */}
            <div className="flex items-center justify-between py-3 border-y border-white/10 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-white font-body font-bold">{article.author}</div>
                  <div className="text-[11px] text-slate-400">Biên tập viên Quán Game Xóm</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-cyan-400" /> {article.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-pink-400 font-bold">
                  <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> {article.likes}
                </span>
              </div>
            </div>

            {/* Excerpt Lead */}
            <p className="text-base sm:text-lg text-amber-200 font-body font-medium leading-relaxed italic bg-indigo-950/40 p-5 rounded-2xl border-l-4 border-cyan-400 shadow-inner">
              "{article.excerpt}"
            </p>

            {/* Content Paragraphs */}
            <div className="space-y-5 text-slate-200 font-body text-base sm:text-lg leading-[1.8] font-normal">
              {article.content.map((paragraph, idx) => (
                <p key={idx} className="whitespace-pre-line">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Article Tags */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-cyan-400" />
              {article.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Footer Call to Action */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl border border-cyan-500/30 text-center space-y-3">
              <h4 className="font-bold text-white text-base">Thấy bài viết hay? Chia sẻ ngay với đồng đội!</h4>
              <p className="text-xs text-slate-300">
                Gia nhập Telegram & Discord Quán Game Xóm để bàn luận và cùng nhau ôn lại kỷ niệm tuổi thơ!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <a
                  href="https://t.me/quangamexomofficial"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Tham Gia Telegram
                </a>
                <a
                  href="https://discord.gg/4XG76eeXWp"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Tham Gia Discord
                </a>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
