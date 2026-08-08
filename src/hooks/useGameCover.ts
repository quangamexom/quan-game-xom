import { useState, useEffect } from 'react';
import { GameItem } from '../types';
import {
  getManualCover,
  saveManualCover,
  removeManualCover,
  getManualBanner,
  saveManualBanner,
  removeManualBanner,
  fetchRawgCover,
  fetchRawgBanner,
  isStockPhotoUrl
} from '../services/rawgService';

export interface UseGameCoverResult {
  coverUrl: string | null;
  isLoading: boolean;
  isManual: boolean;
  rawgRating: number | null;
  uploadFile: (file: File) => Promise<void>;
  resetCover: () => void;
}

export function useGameCover(game: GameItem): UseGameCoverResult {
  const [manualUrl, setManualUrl] = useState<string | null>(() => {
    return getManualCover(game.id, game.title);
  });
  const [rawgCover, setRawgCover] = useState<string | null>(null);
  const [rawgRating, setRawgRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!manualUrl);

  useEffect(() => {
    let isMounted = true;

    const syncManualCover = () => {
      const existingManual = getManualCover(game.id, game.title);
      if (existingManual) {
        setManualUrl(existingManual);
        setIsLoading(false);
      } else {
        setManualUrl(null);
      }
    };

    // Check manual upload first
    syncManualCover();

    const handleCoverEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { gameId, title } = customEvent.detail;
        if (
          gameId === game.id ||
          cleanTitleForSearch(title).toLowerCase() === cleanTitleForSearch(game.title).toLowerCase()
        ) {
          syncManualCover();
        }
      } else {
        syncManualCover();
      }
    };

    window.addEventListener('game-cover-updated', handleCoverEvent);
    window.addEventListener('storage', syncManualCover);

    const existingManual = getManualCover(game.id, game.title);
    if (!existingManual) {
      setIsLoading(true);

      fetchRawgCover(game.title)
        .then((res) => {
          if (!isMounted) return;
          if (res && res.coverImage) {
            setRawgCover(res.coverImage);
            if (res.rating) setRawgRating(res.rating);
          } else {
            setRawgCover(null);
          }
        })
        .catch((err) => {
          console.warn('RAWG load error for:', game.title, err);
          if (isMounted) setRawgCover(null);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
      window.removeEventListener('game-cover-updated', handleCoverEvent);
      window.removeEventListener('storage', syncManualCover);
    };
  }, [game.id, game.title]);

  const uploadFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File không phải là định dạng hình ảnh hợp lệ.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          saveManualCover(game.id, game.title, result);
          setManualUrl(result);
          resolve();
        } else {
          reject(new Error('Không thể đọc dữ liệu file.'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file.'));
      reader.readAsDataURL(file);
    });
  };

  const resetCover = () => {
    removeManualCover(game.id, game.title);
    setManualUrl(null);
  };

  // Determine active coverUrl: Manual > RAWG/Steam > game.coverArt (if valid) > game.backdropArt (if valid) > null
  const validCoverArt = isStockPhotoUrl(game.coverArt) ? null : game.coverArt;
  const validBackdropArt = isStockPhotoUrl(game.backdropArt) ? null : game.backdropArt;
  const effectiveCover = manualUrl || rawgCover || validCoverArt || validBackdropArt || null;

  return {
    coverUrl: effectiveCover,
    isLoading,
    isManual: !!manualUrl,
    rawgRating,
    uploadFile,
    resetCover
  };
}

export interface UseGameBannerResult {
  bannerUrl: string | null;
  isLoading: boolean;
  isManual: boolean;
  uploadBanner: (file: File) => Promise<void>;
  resetBanner: () => void;
}

export function useGameBanner(game: GameItem): UseGameBannerResult {
  const [manualBanner, setManualBanner] = useState<string | null>(() => {
    return getManualBanner(game.id, game.title);
  });
  const [rawgBanner, setRawgBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!manualBanner);

  useEffect(() => {
    let isMounted = true;

    const syncManualBanner = () => {
      const existingManual = getManualBanner(game.id, game.title);
      if (existingManual) {
        setManualBanner(existingManual);
        setIsLoading(false);
      } else {
        setManualBanner(null);
      }
    };

    // Check manual upload first
    syncManualBanner();

    const handleBannerEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { gameId, title } = customEvent.detail;
        if (
          gameId === game.id ||
          cleanTitleForSearch(title).toLowerCase() === cleanTitleForSearch(game.title).toLowerCase()
        ) {
          syncManualBanner();
        }
      } else {
        syncManualBanner();
      }
    };

    window.addEventListener('game-banner-updated', handleBannerEvent);
    window.addEventListener('storage', syncManualBanner);

    const existingManual = getManualBanner(game.id, game.title);
    if (!existingManual) {
      setIsLoading(true);

      fetchRawgBanner(game.title)
        .then((res) => {
          if (!isMounted) return;
          if (res && res.bannerImage) {
            setRawgBanner(res.bannerImage);
          } else {
            setRawgBanner(null);
          }
        })
        .catch((err) => {
          console.warn('RAWG banner load error for:', game.title, err);
          if (isMounted) setRawgBanner(null);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
      window.removeEventListener('game-banner-updated', handleBannerEvent);
      window.removeEventListener('storage', syncManualBanner);
    };
  }, [game.id, game.title]);

  const uploadBanner = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File không phải là định dạng hình ảnh hợp lệ.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          saveManualBanner(game.id, game.title, result);
          setManualBanner(result);
          resolve();
        } else {
          reject(new Error('Không thể đọc dữ liệu file.'));
        }
      };
      reader.onerror = () => reject(new Error('Lỗi khi đọc file.'));
      reader.readAsDataURL(file);
    });
  };

  const resetBanner = () => {
    removeManualBanner(game.id, game.title);
    setManualBanner(null);
  };

  // Banner strictly uses backdropArt or RAWG banner, never stock photos
  const validBackdropArt = isStockPhotoUrl(game.backdropArt) ? null : game.backdropArt;
  const validCoverArt = isStockPhotoUrl(game.coverArt) ? null : game.coverArt;
  const effectiveBanner = manualBanner || rawgBanner || validBackdropArt || validCoverArt || null;

  return {
    bannerUrl: effectiveBanner,
    isLoading,
    isManual: !!manualBanner,
    uploadBanner,
    resetBanner
  };
}

