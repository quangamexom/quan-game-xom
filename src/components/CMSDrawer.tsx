import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem } from '../types';
import { X, RefreshCw, Database, Link, Plus, Check, Save, ShieldAlert, Sparkles, Key, FileSpreadsheet } from 'lucide-react';
import { DEFAULT_SHEET_URL } from '../data/initialGames';

interface CMSDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetUrl: string;
  onUpdateSheetUrl: (url: string) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncedAt?: string;
  defaultPassword: string;
  onUpdatePassword: (pass: string) => void;
  onAddCustomGame: (game: GameItem) => void;
  gameCount: number;
}

export const CMSDrawer: React.FC<CMSDrawerProps> = ({
  isOpen,
  onClose,
  currentSheetUrl,
  onUpdateSheetUrl,
  onManualSync,
  isSyncing,
  lastSyncedAt,
  defaultPassword,
  onUpdatePassword,
  onAddCustomGame,
  gameCount
}) => {
  const [sheetUrlInput, setSheetUrlInput] = useState(currentSheetUrl || DEFAULT_SHEET_URL);
  const [passwordInput, setPasswordInput] = useState(defaultPassword);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Quick Add Game Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPlatform, setNewPlatform] = useState('PC');
  const [newLang, setNewLang] = useState('Tiếng Việt ⭐');
  const [newDlUrl, setNewDlUrl] = useState('');

  if (!isOpen) return null;

  const handleSaveSheetConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSheetUrl(sheetUrlInput);
    onUpdatePassword(passwordInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
    onManualSync();
  };

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newGame: GameItem = {
      id: `custom-cms-${Date.now()}`,
      title: newTitle,
      subtitle: "Added via Admin CMS",
      coverArt: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      platforms: [newPlatform as any],
      language: newLang,
      hasVietHoa: newLang.includes('Việt'),
      downloadUrl: newDlUrl || "https://drive.google.com",
      rating: 5.0,
      addedDate: new Date().toISOString().split('T')[0]
    };

    onAddCustomGame(newGame);
    setNewTitle('');
    setNewDlUrl('');
    setShowAddForm(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Slide-over Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-full max-w-md bg-slate-900 border-l border-amber-500/30 h-full shadow-2xl z-10 p-6 flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">Google Sheet CMS Studio</h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sync Controller Section */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                ĐỒNG BỘ DỮ LIỆU GOOGLE SHEET
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <p className="text-xs text-slate-400">
              Trang web tự động kết nối và tải danh sách game mới nhất từ link Google Sheet được cấp.
            </p>

            <form onSubmit={handleSaveSheetConfig} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-mono text-slate-300 font-bold block mb-1">
                  GOOGLE SHEET URL / CSV FEED:
                </label>
                <div className="relative">
                  <Link className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sheetUrlInput}
                    onChange={(e) => setSheetUrlInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 font-bold block mb-1">
                  PASS GIẢI NÉN MẶC ĐỊNH (PASS WIDGET):
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-amber-300 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSyncing}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 fill-slate-950 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Đang Tải Sheet...' : 'Lưu & Sync Sheet'}</span>
                </button>
              </div>

              {savedSuccess && (
                <div className="p-2 bg-emerald-500/20 text-emerald-300 text-xs rounded-xl text-center border border-emerald-500/40 font-bold flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" />
                  Đã cập nhật cấu hình Google Sheet!
                </div>
              )}
            </form>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <span>Số lượng game đang hiển thị:</span>
              <strong className="text-amber-400">{gameCount} Game</strong>
            </div>
          </div>

          {/* Quick Add Custom Game */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                THÊM GAME THỦ CÔNG (ADMIN)
              </span>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="p-1 text-amber-400 hover:bg-slate-800 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleCreateGame} className="space-y-3 pt-2">
                <div>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Tên game (VD: GTA VI Việt hóa)..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                  >
                    <option value="PC">PC</option>
                    <option value="PS4">PS4</option>
                    <option value="PS1">PS1</option>
                    <option value="Android">Android</option>
                    <option value="Switch">Switch</option>
                  </select>

                  <input
                    type="text"
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    placeholder="Ngôn ngữ..."
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <input
                    type="url"
                    value={newDlUrl}
                    onChange={(e) => setNewDlUrl(e.target.value)}
                    placeholder="Link Google Drive / Download URL..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  + Thêm Vào Kho Game
                </button>
              </form>
            )}
          </div>

          {/* Preset Standard Sheet Button */}
          <div className="mt-auto pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setSheetUrlInput(DEFAULT_SHEET_URL);
                onUpdateSheetUrl(DEFAULT_SHEET_URL);
                onManualSync();
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono font-medium transition-all"
            >
              Reset về Sheet Mặc Định Quán Game Xóm
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
