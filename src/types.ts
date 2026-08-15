export type PlatformType = 'PC' | 'PS4' | 'PS5' | 'PS1' | 'PS2' | 'PS3' | 'Android' | 'Switch' | 'iOS' | 'Other';

export interface DownloadMirror {
  label: string;
  url: string;
  type: 'direct' | 'drive' | 'mega' | 'terabox' | 'fshare' | 'torrent';
  isVip?: boolean;
}

export interface GameItem {
  id: string;
  title: string;
  subtitle?: string;
  coverArt: string;
  backdropArt?: string;
  platforms: PlatformType[];
  language: string; // e.g. "Tiếng Việt ⭐", "Tiếng Anh x Tiếng Việt ⭐"
  hasVietHoa: boolean;
  version?: string;
  releaseYear?: number;
  fileSize?: string;
  rating?: number;
  genres?: string[];
  description?: string;
  
  // Spreadsheet specific links
  fbPreviewUrl?: string;
  downloadUrl?: string; // Main download
  mirror1Url?: string;
  mirror2Url?: string;
  onlinePlayUrl?: string;
  romUrl?: string; // Direct ROM URL for EmulatorJS
  emulatorCore?: string; // e.g. 'snes', 'nes', 'gba'
  system?: string;
  isHidden?: boolean;
  
  // LaunchBox metadata
  developer?: string;
  publisher?: string;
  systemReqs?: {
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
    storage?: string;
  };
  screenshots?: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  isNewUpdate?: boolean;
  addedDate?: string;
}

export interface SheetConfig {
  sheetId: string;
  gid: string;
  sheetUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  defaultPassword?: string;
}

export type ViewMode = 'grid' | 'table' | 'launchbox';
export type SortOption = 'latest' | 'popular' | 'rating' | 'title_asc' | 'size';

export interface FilterState {
  searchQuery: string;
  selectedPlatform: string;
  vietHoaOnly: boolean;
  selectedGenre: string;
  sortBy: SortOption;
  viewMode: ViewMode;
}
