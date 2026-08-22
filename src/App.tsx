import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameItem, FilterState } from './types';
import { INITIAL_GAMES } from './data/initialGames';
import { Article } from './data/articles';
import { useScrollSpy } from './hooks/useScrollSpy';
import { isEmulatorActive, stopActiveEmulator } from './utils/emulatorManager';

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
import { EmulatorZone } from './components/EmulatorZone';
import { DonateModal } from './components/DonateModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { AdminBadge } from './components/AdminBadge';
import { AdminAuthModal } from './components/AdminAuthModal';
import { ExitGameConfirmModal } from './components/ExitGameConfirmModal';
import { Pagination } from './components/Pagination';

const SECTIONS = [
  { id: 'home-section', category: 'HOME' },
  { id: 'game-catalog', category: 'GAMES' },
  { id: 'emulator-zone', category: 'EMULATOR' },
  { id: 'articles-section', category: 'ARTICLES' },
  { id: 'community-section', category: 'COMMUNITY' }
];

const PAGE_SIZE = 16;

export default function App() {
  const [games, setGames] = useState<GameItem[]>(INITIAL_GAMES);
  const [defaultPassword, setDefaultPassword] = useState<string>("quangamexom");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadLibraryGames = async () => {
    try {
      const res = await fetch('/api/games/admin-library');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.games) && data.games.length > 0) {
          const uploadedGames: GameItem[] = data.games.filter((g: any) => !g.isHidden);
          
          // Merge uploaded games at the beginning while keeping initial list
          const combined = [...uploadedGames];
          INITIAL_GAMES.forEach(initGame => {
            if (!combined.some(g => g.id === initGame.id || (initGame.title && g.title === initGame.title))) {
              combined.push(initGame);
            }
          });
          setGames(combined);
          return;
        }
      }
    } catch (err) {
      console.warn("Load admin library error, using static INITIAL_GAMES:", err);
    }
    setGames(INITIAL_GAMES);
  };

  useEffect(() => {
    loadLibraryGames();

    // Listen to real-time updates from Admin ROM Upload / Visibility Toggle
    const handleGameUpdate = () => {
      loadLibraryGames();
    };

    window.addEventListener('qgx_games_updated', handleGameUpdate);
    return () => window.removeEventListener('qgx_games_updated', handleGameUpdate);
  }, []);

  // Scroll Spy Hook for Intelligent Navbar Active Highlight & Smooth Scrolling
  const { activeCategory, scrollToCategory } = useScrollSpy(SECTIONS, 140);

  // Modals & Drawers
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [downloadGame, setDownloadGame] = useState<GameItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Helper: Extract Game ID or Slug from URL search query (?game_id=:id or ?game=:id) or pathname (/game/:id)
  const getGameIdFromUrl = (): string | null => {
    if (typeof window === 'undefined') return null;
    const searchParams = new URLSearchParams(window.location.search);
    const paramId = searchParams.get('game_id') || searchParams.get('game');
    if (paramId) return paramId;

    const pathname = window.location.pathname;
    const match = pathname.match(/^\/game\/(.+)$/);
    if (match && match[1]) {
      return decodeURIComponent(match[1].replace(/\/$/, ''));
    }
    return null;
  };

  // Helper: Match game by ID, encoded ID, or slugified title
  const findGameMatch = (targetId: string, list: GameItem[]): GameItem | null => {
    if (!targetId || !list || list.length === 0) return null;
    const lower = targetId.toLowerCase().trim();
    return list.find((g) => {
      if (g.id.toLowerCase() === lower) return true;
      if (encodeURIComponent(g.id).toLowerCase() === lower) return true;
      const slug = g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (slug === lower) return true;
      return false;
    }) || null;
  };

  // Synchronize URL on initial load or whenever games change
  useEffect(() => {
    const urlId = getGameIdFromUrl();
    if (urlId && games.length > 0) {
      const match = findGameMatch(urlId, games);
      if (match) {
        // If it's not an emulator ROM being loaded directly by EmulatorZone, open detail modal
        if (!match.romUrl && !window.location.search.includes('netplay_room=')) {
          setSelectedGame(match);
        }
      }
    }
  }, [games]);

  // Listen to browser Back / Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = () => {
      const urlId = getGameIdFromUrl();
      if (urlId) {
        const match = findGameMatch(urlId, games);
        if (match && !match.romUrl) {
          setSelectedGame(match);
        }
      } else {
        setSelectedGame(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [games]);

  // Open Game Detail Modal and synchronize browser URL to /?game_id=:id
  const handleOpenGameDetail = (game: GameItem) => {
    setSelectedGame(game);
    if (typeof window !== 'undefined') {
      const targetUrl = `/?game_id=${encodeURIComponent(game.id)}`;
      if (window.location.search !== `?game_id=${encodeURIComponent(game.id)}`) {
        window.history.pushState({ gameId: game.id }, '', targetUrl);
      }
    }
  };

  // Close Game Detail Modal and restore browser URL
  const handleCloseGameDetail = () => {
    setSelectedGame(null);
    if (typeof window !== 'undefined') {
      if (window.location.pathname.startsWith('/game/') || window.location.search.includes('game_id=') || window.location.search.includes('game=')) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Exit Confirmation Modal State
  const [exitConfirmModal, setExitConfirmModal] = useState<{
    isOpen: boolean;
    targetActionName?: string;
    gameName?: string;
    onConfirm: () => void;
  } | null>(null);

  // 1. Listen for browser beforeunload event (Closing Tab / Reload / Navigating away)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEmulatorActive()) {
        e.preventDefault();
        e.returnValue = 'Bạn có chắc chắn muốn thoát game không? Tiến trình chơi chưa lưu sẽ bị mất.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 2. Global Event Listener for Safe Exit Confirmations across any component
  useEffect(() => {
    const handleExitConfirmRequest = (e: any) => {
      const { action, targetLabel, gameTitle } = e.detail || {};
      setExitConfirmModal({
        isOpen: true,
        targetActionName: targetLabel || 'chuyển hướng trang',
        gameName: gameTitle || '',
        onConfirm: () => {
          setExitConfirmModal(null);
          stopActiveEmulator();
          if (typeof action === 'function') {
            action();
          }
        }
      });
    };

    window.addEventListener('qgx_request_exit_confirm' as any, handleExitConfirmRequest);
    return () => {
      window.removeEventListener('qgx_request_exit_confirm' as any, handleExitConfirmRequest);
    };
  }, []);

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
    setCurrentPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    const isPlaying = isEmulatorActive();

    // 1. Direct navigation to EMULATOR Zone - do not stop the running game!
    if (cat === 'EMULATOR') {
      scrollToCategory('EMULATOR');
      return;
    }

    const executeCategoryNav = () => {
      if (cat === 'HOME') {
        setFilterState({
          searchQuery: '',
          selectedPlatform: 'ALL',
          vietHoaOnly: false,
          selectedGenre: 'ALL',
          sortBy: 'latest',
          viewMode: 'grid'
        });
        setCurrentPage(1);
        setSelectedGame(null);
        setDownloadGame(null);
        setSelectedArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollToCategory('HOME');
      } else {
        scrollToCategory(cat);
      }
    };

    // 2. Intercept if user is currently playing a game
    if (isPlaying) {
      const targetLabels: Record<string, string> = {
        HOME: 'quay về Trang chủ',
        GAMES: 'chuyển sang Thư viện game',
        ARTICLES: 'xem mục Bài viết & Tin tức',
        COMMUNITY: 'mở mục Cộng đồng & Liên hệ'
      };

      setExitConfirmModal({
        isOpen: true,
        targetActionName: targetLabels[cat] || `chuyển sang mục ${cat}`,
        onConfirm: () => {
          setExitConfirmModal(null);
          console.log('[Navigation] User confirmed leaving game. Stopping emulator and navigating to:', cat);
          stopActiveEmulator();
          executeCategoryNav();
        }
      });
      return;
    }

    executeCategoryNav();
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

  // Pagination Logic
  const totalPages = Math.ceil(filteredGames.length / PAGE_SIZE) || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredGames.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredGames, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const catalogElement = document.getElementById('game-catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    handleCategoryChange('HOME');
  };

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 font-sans selection:bg-[#22D3EE] selection:text-slate-950 pb-20 md:pb-0 relative">
      
      {/* Dynamic Glassmorphism Background Ambient Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Blob 1: Warm Amber/Orange (Top-Left) */}
        <div className="absolute top-[-5%] left-[-5%] w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-br from-amber-500/28 via-orange-600/20 to-transparent blur-[100px] animate-blob-1" />
        {/* Blob 2: Cyan/Indigo (Middle-Right) */}
        <div className="absolute top-[32%] right-[-5%] w-[400px] h-[400px] sm:w-[650px] sm:h-[650px] rounded-full bg-gradient-to-bl from-cyan-500/25 via-indigo-600/20 to-transparent blur-[110px] animate-blob-2" />
        {/* Blob 3: Rose/Purple/Amber (Bottom-Left) */}
        <div className="absolute bottom-[8%] left-[10%] w-[450px] h-[450px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-tr from-purple-600/22 via-amber-600/24 to-transparent blur-[120px] animate-blob-3" />
      </div>

      {/* 1. Top Header Navigation (3 Zones with Centered Logo & Social Bar) */}
      <Navbar
        searchQuery={filterState.searchQuery}
        onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        gameCount={games.length}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onSelectPlatformFilter={(p) => handleFilterChange({ selectedPlatform: p })}
        onSelectGenreFilter={(g) => handleFilterChange({ selectedGenre: g })}
        onSelectVietHoaFilter={(v) => handleFilterChange({ vietHoaOnly: v })}
      />

      {/* 2. SECTION 1: HOME - Hero Full-Bleed Slider Carousel */}
      <div id="home-section">
        <HeroCoverBanner
          onGoToGames={() => handleCategoryChange('GAMES')}
          onGoToArticles={() => handleCategoryChange('ARTICLES')}
          onOpenDonate={() => setIsDonateOpen(true)}
          onSelectGame={(g) => handleOpenGameDetail(g)}
          featuredGames={games.slice(0, 10)}
        />
      </div>

      {/* 3. SECTION 2: GAME CATALOG - Displays Game Grid & Filter Controls */}
      <main id="game-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-900/60">
        
        {/* Header Bar: DANH SÁCH GAME + Hiển thị pagination count + Dropdown Mới Nhất */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl sm:text-4xl font-display font-black text-white uppercase tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent text-glow-amber">
                DANH SÁCH GAME
              </span>
            </h2>
            <p className="text-xs sm:text-sm font-body text-slate-400 mt-1">
              Hiển thị <strong className="text-amber-300 font-bold">{filteredGames.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredGames.length)}</strong> của <strong className="text-amber-300 font-bold">{filteredGames.length}</strong> kết quả {totalPages > 1 && <span className="text-slate-500 font-mono text-xs">(Trang {currentPage}/{totalPages})</span>}
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
              key={`grid-view-page-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
            >
              {paginatedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onSelect={(g) => handleOpenGameDetail(g)}
                  onOpenDownload={(g) => setDownloadGame(g)}
                  onSelectGenre={(g) => handleFilterChange({ selectedGenre: g })}
                />
              ))}
            </motion.div>
          ) : filterState.viewMode === 'launchbox' ? (
            <motion.div
              key={`launchbox-view-page-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-5"
            >
              {paginatedGames.map((game) => (
                <LaunchBoxCard
                  key={game.id}
                  game={game}
                  onSelect={(g) => handleOpenGameDetail(g)}
                  onOpenDownload={(g) => setDownloadGame(g)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`table-view-page-${currentPage}`}
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
                  {paginatedGames.map((game, idx) => (
                    <GameListRow
                      key={game.id}
                      game={game}
                      index={(currentPage - 1) * PAGE_SIZE + idx}
                      onSelect={(g) => handleOpenGameDetail(g)}
                      onOpenDownload={(g) => setDownloadGame(g)}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredGames.length}
          pageSize={PAGE_SIZE}
          onPageChange={handlePageChange}
        />

      </main>

      {/* 4. SECTION: EMULATOR ZONE */}
      <div id="emulator-zone" className="border-t border-slate-900/60">
        <EmulatorZone />
      </div>

      {/* 5. SECTION: ARTICLES SECTION */}
      <div id="articles-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-900/60">
        <ArticleSection onReadArticle={(article) => setSelectedArticle(article)} />
      </div>

      {/* 5. SECTION 4: COMMUNITY & CONTACT SECTION */}
      <div id="community-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-900/60">
        <SocialCommunitySection />
      </div>

      {/* 6. Footer */}
      <Footer
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        defaultPassword={defaultPassword}
        featuredGames={games.slice(0, 10)}
        onSelectGame={(g) => {
          handleOpenGameDetail(g);
          handleCategoryChange('GAMES');
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
        onClose={handleCloseGameDetail}
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

      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <AdminBadge />

      {/* Exit Game Confirmation Modal */}
      <ExitGameConfirmModal
        isOpen={Boolean(exitConfirmModal?.isOpen)}
        targetActionName={exitConfirmModal?.targetActionName}
        gameName={exitConfirmModal?.gameName}
        onCancel={() => setExitConfirmModal(null)}
        onConfirm={() => {
          if (exitConfirmModal?.onConfirm) {
            exitConfirmModal.onConfirm();
          }
        }}
      />

    </div>
  );
}
