import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem, FilterState } from './types';
import { INITIAL_GAMES, DEFAULT_SHEET_URL } from './data/initialGames';
import { fetchSheetData } from './services/sheetService';
import { Article } from './data/articles';

import { Navbar } from './components/Navbar';
import { HeroCoverBanner } from './components/HeroCoverBanner';
import { ArticleSection } from './components/ArticleSection';
import { ArticleReaderModal } from './components/ArticleReaderModal';
import { SocialCommunitySection } from './components/SocialCommunitySection';
import { FilterBar } from './components/FilterBar';
import { GameCard } from './components/GameCard';
import { LaunchBoxCard } from './components/LaunchBoxCard';
import { GameListRow } from './components/GameListRow';
import { GameDetailModal } from './components/GameDetailModal';
import { DownloadDrawer } from './components/DownloadDrawer';
import { DonateModal } from './components/DonateModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { AdminBadge } from './components/AdminBadge';

export default function App() {
  const [games, setGames] = useState<GameItem[]>(INITIAL_GAMES);
  const [defaultPassword, setDefaultPassword] = useState<string>("quangamexom");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    setIsSyncing(true);
    fetchSheetData(DEFAULT_SHEET_URL)
      .then((data) => {
        if (data && data.length > 0) {
          setGames(data);
        }
      })
      .catch((err) => console.error("Sync sheet error:", err))
      .finally(() => setIsSyncing(false));
  }, []);

  
  // Active Navigation Category: 'HOME' by default
  const [activeCategory, setActiveCategory] = useState<string>('HOME');

  // Modals & Drawers
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [downloadGame, setDownloadGame] = useState<GameItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);

  // Filters State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedPlatform: 'ALL',
    vietHoaOnly: false,
    selectedGenre: 'ALL',
    sortBy: 'latest',
    viewMode: 'grid'
  });

  const handleFilterChange = (newState: Partial<FilterState>) => {
    setFilterState(prev => ({ ...prev, ...newState }));
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'HOME') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (cat === 'GAMES') {
      setTimeout(() => {
        const catalogEl = document.getElementById('game-catalog');
        if (catalogEl) {
          catalogEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else if (cat === 'ARTICLES') {
      setTimeout(() => {
        const articlesEl = document.getElementById('articles-section');
        if (articlesEl) {
          articlesEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else if (cat === 'COMMUNITY') {
      setTimeout(() => {
        const commEl = document.getElementById('community-section');
        if (commEl) {
          commEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleAddCustomGame = (newGame: GameItem) => {
    setGames(prev => [newGame, ...prev]);
  };

  // Filter & Sort Logic
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      // 1. Search filter
      if (filterState.searchQuery) {
        const q = filterState.searchQuery.toLowerCase();
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchSub = g.subtitle?.toLowerCase().includes(q);
        const matchPlatform = g.platforms.some(p => p.toLowerCase().includes(q));
        const matchLang = g.language?.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchPlatform && !matchLang) return false;
      }

      // 2. Platform filter
      if (filterState.selectedPlatform !== 'ALL') {
        const targetP = filterState.selectedPlatform.toUpperCase();
        const hasPlatform = g.platforms.some(p => p.toUpperCase().includes(targetP));
        if (!hasPlatform) return false;
      }

      // 3. Viet Hoa Filter
      if (filterState.vietHoaOnly && !g.hasVietHoa) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filterState.sortBy === 'popular') return (b.rating || 0) - (a.rating || 0);
      if (filterState.sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (filterState.sortBy === 'title_asc') return a.title.localeCompare(b.title);
      if (filterState.sortBy === 'size') return (b.fileSize || '').localeCompare(a.fileSize || '');
      return 0;
    });
  }, [games, filterState]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 font-sans selection:bg-[#22D3EE] selection:text-slate-950 pb-20 md:pb-0 relative">
      
      {/* Dynamic Glassmorphism Background Ambient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1: Warm Amber/Orange (Top-Left) */}
        <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-br from-amber-500/18 via-orange-600/12 to-transparent blur-[110px] animate-blob-1" />
        {/* Blob 2: Cyan/Indigo (Middle-Right) */}
        <div className="absolute top-[30%] right-[-5%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-bl from-cyan-500/16 via-indigo-600/12 to-transparent blur-[120px] animate-blob-2" />
        {/* Blob 3: Rose/Purple/Amber (Bottom-Left) */}
        <div className="absolute bottom-[10%] left-[15%] w-[450px] h-[450px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-tr from-purple-600/12 via-amber-600/14 to-transparent blur-[125px] animate-blob-3" />
      </div>

      {/* 1. Top Header Navigation (3 Zones with Centered Logo & Social Bar) */}
      <Navbar
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        onOpenDonate={() => setIsDonateOpen(true)}
        gameCount={games.length}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSelectPlatformFilter={(p) => handleFilterChange({ selectedPlatform: p })}
        onSelectGenreFilter={(g) => handleFilterChange({ selectedGenre: g })}
        onSelectVietHoaFilter={(v) => handleFilterChange({ vietHoaOnly: v })}
      />

      {/* 2. HOME VIEW: Hero Full-Bleed Slider Carousel + Articles + Community */}
      {activeCategory === 'HOME' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Hero Slider/Carousel */}
          <HeroCoverBanner
            onGoToGames={() => handleCategoryChange('GAMES')}
            onGoToArticles={() => handleCategoryChange('ARTICLES')}
            onOpenDonate={() => setIsDonateOpen(true)}
            featuredGames={games.slice(0, 5)}
          />

          {/* Article Section */}
          <div id="articles-section">
            <ArticleSection onReadArticle={(article) => setSelectedArticle(article)} />
          </div>

          {/* Social Community Section */}
          <div id="community-section">
            <SocialCommunitySection />
          </div>
        </motion.div>
      )}

      {/* 3. GAME CATALOG VIEW: Displays Game Grid ONLY when in 'GAMES' mode */}
      {activeCategory === 'GAMES' && (
        <main id="game-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          
          {/* Header Bar matching Requirement 4: DANH SÁCH VIỆT HOÁ + Hiển thị 1-25 + Dropdown Mới Nhất */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
            <div>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent text-glow-amber">
                  DANH SÁCH VIỆT HOÁ
                </span>
              </h2>
              <p className="text-xs sm:text-sm font-body text-slate-400 mt-1">
                Hiển thị 1–{Math.min(25, filteredGames.length)} của <strong className="text-amber-300 font-bold">{filteredGames.length}</strong> kết quả
              </p>
            </div>

            {/* Dropdown Mới Nhất ở Góc Phải */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-mono text-slate-400">Sắp xếp:</span>
              <div className="relative bg-[#090D18] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 shadow-md">
                <select
                  value={filterState.sortBy}
                  onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                  className="bg-transparent text-amber-300 font-display font-bold text-xs focus:outline-none cursor-pointer pr-2"
                >
                  <option value="latest" className="bg-slate-900 text-slate-200">Mới nhất</option>
                  <option value="popular" className="bg-slate-900 text-slate-200">Phổ biến nhất</option>
                  <option value="rating" className="bg-slate-900 text-slate-200">Đánh giá cao nhất</option>
                  <option value="title_asc" className="bg-slate-900 text-slate-200">Tên A - Z</option>
                  <option value="size" className="bg-slate-900 text-slate-200">Dung lượng nhỏ gọn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter & Controls Bar */}
          <FilterBar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            totalResults={filteredGames.length}
          />

          {/* Games Grid / LaunchBox / Table View */}
          <AnimatePresence mode="wait">
            {filteredGames.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 text-center bg-slate-900/60 rounded-3xl border border-slate-800 my-8"
              >
                <div className="text-4xl mb-3">🕹️</div>
                <h3 className="text-lg font-bold text-white">Không tìm thấy trò chơi nào phù hợp</h3>
                <p className="text-xs text-slate-400 mt-1">Thử đổi từ khóa tìm kiếm hoặc chọn hệ máy khác xem sao!</p>
                <button
                  onClick={() => {
                    setFilterState({ searchQuery: '', selectedPlatform: 'ALL', vietHoaOnly: false, selectedGenre: 'ALL', sortBy: 'latest', viewMode: 'grid' });
                  }}
                  className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Đặt Lại Bộ Lọc
                </button>
              </motion.div>
            ) : filterState.viewMode === 'grid' ? (
              <motion.div
                key="grid-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    onSelect={(g) => setSelectedGame(g)}
                    onOpenDownload={(g) => setDownloadGame(g)}
                    onSelectGenre={(g) => handleFilterChange({ selectedGenre: g })}
                  />
                ))}
              </motion.div>
            ) : filterState.viewMode === 'launchbox' ? (
              <motion.div
                key="launchbox-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-5"
              >
                {filteredGames.map((game) => (
                  <LaunchBoxCard
                    key={game.id}
                    game={game}
                    onSelect={(g) => setSelectedGame(g)}
                    onOpenDownload={(g) => setDownloadGame(g)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="table-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl"
              >
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-b border-indigo-500/30 text-[11px] font-mono font-black uppercase text-cyan-300 tracking-wider">
                      <th className="p-3 text-center w-20">COVER ART</th>
                      <th className="p-3">HỆ MÁY GỐC</th>
                      <th className="p-3">TÊN GAME & CHI TIẾT</th>
                      <th className="p-3">NGÔN NGỮ</th>
                      <th className="p-3 text-center">PREVIEW FB</th>
                      <th className="p-3 text-center">LINK DOWNLOAD</th>
                      <th className="p-3 text-center">MIRROR 1</th>
                      <th className="p-3 text-center">MIRROR 2</th>
                      <th className="p-3 text-center">CHƠI ONLINE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGames.map((game, idx) => (
                      <GameListRow
                        key={game.id}
                        game={game}
                        index={idx}
                        onSelect={(g) => setSelectedGame(g)}
                        onOpenDownload={(g) => setDownloadGame(g)}
                      />
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>

        </main>
      )}

      {/* 4. ARTICLES VIEW ONLY */}
      {activeCategory === 'ARTICLES' && (
        <div id="articles-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <ArticleSection onReadArticle={(article) => setSelectedArticle(article)} />
        </div>
      )}

      {/* 5. COMMUNITY VIEW ONLY */}
      {activeCategory === 'COMMUNITY' && (
        <div id="community-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <SocialCommunitySection />
        </div>
      )}

      {/* 6. Footer */}
      <Footer
        onOpenDonate={() => setIsDonateOpen(true)}
        defaultPassword={defaultPassword}
        featuredGames={games.slice(0, 10)}
        onSelectGame={(g) => {
          setSelectedGame(g);
          setActiveCategory('GAMES');
        }}
      />

      {/* 7. Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenDonate={() => setIsDonateOpen(true)}
        onScrollTop={scrollToTop}
        gameCount={games.length}
      />

      {/* Modals & Drawers */}
      <GameDetailModal
        game={selectedGame}
        onClose={() => setSelectedGame(null)}
        onOpenDownload={(g) => setDownloadGame(g)}
      />

      <DownloadDrawer
        game={downloadGame}
        onClose={() => setDownloadGame(null)}
        defaultPassword={defaultPassword}
      />

      <ArticleReaderModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
      />

      <AdminBadge />

    </div>
  );
}
