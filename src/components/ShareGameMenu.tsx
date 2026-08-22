import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import {
  Share2,
  Link2,
  Send,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { copyTextToClipboard, getGameShareActions, NetplayShareOptions } from '../utils/shareUtils';

interface ShareGameMenuProps {
  game: GameItem;
  variant?: 'icon' | 'button' | 'compact' | 'footer';
  className?: string;
  align?: 'left' | 'right' | 'center';
  netplay?: NetplayShareOptions;
}

export const ShareGameMenu: React.FC<ShareGameMenuProps> = ({
  game,
  variant = 'button',
  className = '',
  align = 'right',
  netplay
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<'link' | 'discord' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    shareUrl,
    facebookUrl,
    telegramUrl,
    zaloUrl,
    discordCopyText
  } = getGameShareActions(game, netplay);

  // Close dropdown on outside click or ESC key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      setCopiedType(null);
    }, 2800);
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTextToClipboard(shareUrl);
    if (success) {
      setCopiedType('link');
      showToast('Đã copy link!');
    } else {
      showToast('Không thể copy link tự động!');
    }
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleShareTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleShareZalo = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(zaloUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleCopyDiscord = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyTextToClipboard(discordCopyText);
    if (success) {
      setCopiedType('discord');
      showToast('Đã copy, dán vào Discord để chia sẻ!');
    } else {
      showToast('Không thể copy text tự động!');
    }
  };

  const alignmentClasses = {
    right: 'right-0 sm:right-0 origin-top-right',
    left: 'left-0 sm:left-0 origin-top-left',
    center: 'left-1/2 -translate-x-1/2 origin-top'
  }[align];

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Trigger Button Variants */}
      {variant === 'icon' && (
        <button
          type="button"
          id={`btn-share-icon-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-400 text-slate-300 hover:text-slate-950 border border-slate-700/80 hover:border-amber-500 flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-md"
          title="Chia sẻ game này"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          id={`btn-share-compact-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700/80 hover:border-amber-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-md"
          title="Chia sẻ game"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Share</span>
        </button>
      )}

      {variant === 'footer' && (
        <button
          type="button"
          id={`btn-share-footer-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/90 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          title="Chia sẻ liên kết game này"
        >
          <Share2 className="w-4 h-4 text-amber-400" />
          <span>Chia Sẻ Game</span>
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          id={`btn-share-main-${game.id}`}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="px-3.5 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-slate-700 hover:border-amber-500/60 text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg backdrop-blur-md"
          title="Chia sẻ game"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Share</span>
        </button>
      )}

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute z-50 bottom-auto top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-32px)] p-2 rounded-2xl bg-[#090D18]/95 border border-slate-800 shadow-2xl backdrop-blur-xl ${alignmentClasses}`}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                Chia Sẻ Game
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]" title={game.title}>
                {game.title}
              </span>
            </div>

            {/* Share Options List */}
            <div className="py-1.5 space-y-1">
              
              {/* 1. Copy Link */}
              <button
                type="button"
                id={`btn-action-copy-link-${game.id}`}
                onClick={handleCopyLink}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/[0.07] text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20">
                    {copiedType === 'link' ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Copy Link</div>
                    <div className="text-[10px] text-slate-400">Sao chép URL chi tiết game</div>
                  </div>
                </div>
                {copiedType === 'link' && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 rounded">
                    Đã copy
                  </span>
                )}
              </button>

              {/* 2. Share qua Facebook */}
              <button
                type="button"
                id={`btn-action-share-fb-${game.id}`}
                onClick={handleShareFacebook}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/[0.07] text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Share qua Facebook</div>
                    <div className="text-[10px] text-slate-400">Đăng bài hoặc gửi messenger</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
              </button>

              {/* 3. Share qua Telegram */}
              <button
                type="button"
                id={`btn-action-share-tele-${game.id}`}
                onClick={handleShareTelegram}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/[0.07] text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Share qua Telegram</div>
                    <div className="text-[10px] text-slate-400">Gửi đến nhóm hoặc tin nhắn</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
              </button>

              {/* 4. Share qua Zalo */}
              <button
                type="button"
                id={`btn-action-share-zalo-${game.id}`}
                onClick={handleShareZalo}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/[0.07] text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Share qua Zalo</div>
                    <div className="text-[10px] text-slate-400">Chia sẻ qua Zalo chat / feed</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
              </button>

              {/* 5. Share qua Discord */}
              <button
                type="button"
                id={`btn-action-share-discord-${game.id}`}
                onClick={handleCopyDiscord}
                className="w-full px-3 py-2 rounded-xl text-left hover:bg-white/[0.07] text-slate-200 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20">
                    {copiedType === 'discord' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">Share qua Discord</div>
                    <div className="text-[10px] text-slate-400">Copy tin nhắn kèm link để dán</div>
                  </div>
                </div>
                {copiedType === 'discord' ? (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-500/30 rounded">
                    Đã copy
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-300">
                    Copy format
                  </span>
                )}
              </button>

            </div>

            {/* Quick URL Preview & Direct Copy Footer */}
            <div className="mt-1 pt-2 border-t border-slate-800/80 px-2 flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onClick={handleCopyLink}
                className="w-full bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400 select-all cursor-pointer focus:outline-none focus:border-amber-500/50"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1 text-slate-400 hover:text-amber-400 transition-colors shrink-0"
                title="Sao chép nhanh"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-amber-500/50 shadow-2xl text-white font-mono text-xs flex items-center gap-2 backdrop-blur-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-100">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
