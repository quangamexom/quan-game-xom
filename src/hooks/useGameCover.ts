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

    // Check manual upload first
    const existingManual = getManualCover(game.id, game.title);
    if (existingManual) {
      setManualUrl(existingManual);
      setIsLoading(false);
      return;
    }

    // Otherwise fetch from RAWG
    setIsLoading(true);

    fetchRawgCover(game.title)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.backgroundImage) {
          setRawgCover(res.backgroundImage);
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

    return () => {
      isMounted = false;
    };
  }, [game.id, game.title]);

  const uploadFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File không phải là định dạng hình ảnh valid.'));
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

  // Determine active coverUrl: Manual > RAWG > non-stock game.coverArt > null
  const fallbackCover = isStockPhotoUrl(game.coverArt) ? null : game.coverArt;
  const effectiveCover = manualUrl || rawgCover || fallbackCover || null;

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

    // Check manual upload first
    const existingManual = getManualBanner(game.id, game.title);
    if (existingManual) {
      setManualBanner(existingManual);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    fetchRawgCover(game.title)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.backgroundImage) {
          setRawgBanner(res.backgroundImage);
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

    return () => {
      isMounted = false;
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

  const fallbackBanner = isStockPhotoUrl(game.backdropArt)
    ? (isStockPhotoUrl(game.coverArt) ? null : game.coverArt)
    : game.backdropArt;
  const effectiveBanner = manualBanner || rawgBanner || fallbackBanner || null;

  return {
    bannerUrl: effectiveBanner,
    isLoading,
    isManual: !!manualBanner,
    uploadBanner,
    resetBanner
  };
}
