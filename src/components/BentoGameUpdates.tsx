import React from 'react';
import { motion } from 'motion/react';
import { GameItem } from '../types';
import { ArrowUpRight, Calendar, Star, Download, Flame, Eye } from 'lucide-react';

interface BentoGameUpdatesProps {
  games: GameItem[];
  onSelectGame: (game: GameItem) => void;
  onOpenDownload: (game: GameItem) => void;
  onViewAll?: () => void;
}

export const BentoGameUpdates: React.FC<BentoGameUpdatesProps> = ({
  games,
  onSelectGame,
  onOpenDownload,
  onViewAll
}) => {
  // Take top 5 latest/updated games
  const latestGames = games.slice(0, 5);
  const featuredTall = latestGames[0];
  const gridRight = latestGames.slice(1, 5);

  if (!featuredTall) return null;

  return (
    <section className="py-12 lg:py-16 bg-[#0A0E17] border-b border-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header Section matching Screenshot 4 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              UPDATES & NEW RELEASES
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              HERO UPDATES / <span className="bg-gradient-to-r from-indigo-300 via-indigo-400 to-cyan-300 bg-clip-text text-transparent">KHO GAME MỚI</span>
            </h2>
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>XEM TẤT CẢ</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bento Grid matching Screenshot 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Large Tall Vertical Poster Card */}
          <div className="lg:col-span-5">
            <motion.div
              whileHover={{ y: -4 }}
              onClick={() => onSelectGame(featuredTall)}
              className="relative h-[420px] lg:h-[480px] rounded-2xl overflow-hidden glass-card transition-all cursor-pointer group"
            >
              <img
                src={featuredTall.coverArt}
                alt={featuredTall.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-indigo-600/90 text-white text-[10px] font-mono font-bold rounded-full uppercase tracking-wider shadow">
                  FEATURED UPDATE
                </span>
                {featuredTall.hasVietHoa && (
                  <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow">
                    VIỆT HÓA ⭐
                  </span>
                )}
              </div>

              {/* Card Footer Details */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent">
                <span className="text-[11px] font-mono text-indigo-400 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {featuredTall.addedDate || 'MARCH 14, 2026'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                  {featuredTall.title}: {featuredTall.subtitle || 'Update Patch Revamp'}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-2 opacity-80 font-normal">
                  {featuredTall.description || 'Bản cập nhật mới nhất kèm đầy đủ DLC và sửa lỗi đồ họa mượt mà.'}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-xs font-mono text-amber-400 font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {featuredTall.rating || 4.9} / 5.0
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDownload(featuredTall);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải Game</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 4 Wide Cards in a 2x2 Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {gridRight.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ y: -3 }}
                onClick={() => onSelectGame(game)}
                className="relative h-[200px] lg:h-[230px] rounded-2xl overflow-hidden glass-card transition-all cursor-pointer group"
              >
                <img
                  src={game.backdropArt || game.coverArt}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono font-bold text-slate-300 rounded">
                    {game.platforms[0]}
                  </span>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4">
                  <span className="text-[10px] font-mono text-indigo-400 font-semibold block mb-0.5">
                    {game.addedDate || 'MARCH 11, 2026'}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {game.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {game.subtitle || 'Patch update & fixes'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
