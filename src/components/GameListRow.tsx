import React from 'react';
import { GameItem } from '../types';
import { Download, Star, ExternalLink, Gamepad2, Radio, CheckCircle, Eye } from 'lucide-react';
import { parseGameTitle } from '../utils/titleParser';

interface GameListRowProps {
  game: GameItem;
  index: number;
  onSelect: (game: GameItem) => void;
  onOpenDownload: (game: GameItem) => void;
}

export const GameListRow: React.FC<GameListRowProps> = ({ game, index, onSelect, onOpenDownload }) => {
  const isEven = index % 2 === 0;
  const { cleanTitle, subtitle } = parseGameTitle(game.title, game.subtitle);

  return (
    <tr
      className={`border-b border-slate-800/80 hover:bg-slate-800/50 transition-colors text-xs text-slate-200 ${
        isEven ? 'bg-slate-900/40' : 'bg-slate-950/60'
      }`}
    >
      {/* 1. COVER ART */}
      <td className="p-2 sm:p-3 text-center align-middle w-16 sm:w-20 shrink-0">
        <div
          onClick={() => onSelect(game)}
          className="w-12 h-16 sm:w-14 sm:h-20 rounded-md overflow-hidden bg-slate-950 border border-slate-700/80 mx-auto cursor-pointer hover:scale-105 transition-transform shadow-md"
        >
          <img
            src={game.coverArt}
            alt={game.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </td>

      {/* 2. HỆ MÁY GỐC */}
      <td className="p-2 sm:p-3 align-middle whitespace-nowrap">
        <div className="flex flex-col gap-1 items-start">
          {game.platforms.map((p) => (
            <span
              key={p}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                p === 'PC'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : p === 'PS4' || p === 'PS5'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : p === 'PS1' || p === 'PS2'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </td>

      {/* 3. TÊN GAME */}
      <td className="p-2 sm:p-3 align-middle max-w-xs sm:max-w-md">
        <div
          onClick={() => onSelect(game)}
          className="font-bold text-sm text-white hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1.5 flex-wrap"
        >
          <span>{cleanTitle}</span>
          {game.hasVietHoa && (
            <span className="text-amber-400" title="Đã Việt Hóa">
              ⭐
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] text-amber-400/90 font-medium italic mt-0.5">
            {subtitle}
          </p>
        )}

        {game.fileSize && (
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Dung lượng: {game.fileSize}
          </p>
        )}
      </td>

      {/* 4. NGÔN NGỮ */}
      <td className="p-2 sm:p-3 align-middle whitespace-nowrap">
        <span className="inline-flex items-center gap-1 font-medium text-slate-300">
          {game.language || (game.hasVietHoa ? 'Tiếng Việt ⭐' : 'Tiếng Anh')}
        </span>
      </td>

      {/* 5. LINK BÀI VIẾT PREVIEW FACEBOOK */}
      <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
        {game.fbPreviewUrl ? (
          <a
            href={game.fbPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-500/40 text-[11px] font-semibold transition-all"
          >
            <Eye className="w-3 h-3" />
            <span>Xem bài</span>
          </a>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* 6. LINK DOWNLOAD */}
      <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
        <button
          onClick={() => onOpenDownload(game)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-bold text-xs shadow hover:scale-105 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 fill-slate-950" />
          <span>Tải Ngay</span>
        </button>
      </td>

      {/* 7. MIRROR 1 */}
      <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
        {game.mirror1Url ? (
          <button
            onClick={() => onOpenDownload(game)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium transition-all cursor-pointer"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>Tải Ngay (M1)</span>
          </button>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* 8. MIRROR 2 */}
      <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
        {game.mirror2Url ? (
          <button
            onClick={() => onOpenDownload(game)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 text-[11px] font-medium transition-all cursor-pointer"
          >
            <Download className="w-3 h-3 text-amber-400" />
            <span>Tải Ngay (M2)</span>
          </button>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>

      {/* 9. CHƠI ONLINE */}
      <td className="p-2 sm:p-3 align-middle text-center whitespace-nowrap">
        {game.onlinePlayUrl ? (
          <a
            href={game.onlinePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40 text-[11px] font-bold"
          >
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>Chơi Online</span>
          </a>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
    </tr>
  );
};
