// Comprehensive Game Art Mapping for Popular Retro & Modern Games
// Uses high-definition official Steam App posters (600x900) & headers, plus curated art for retro classics.

export interface StaticGameArt {
  steamId?: string;
  coverImage: string;
  bannerImage: string;
  rating?: number;
  genres?: string[];
}

export const KNOWN_GAME_ART: Record<string, StaticGameArt> = {
  // Wukong
  'black myth wukong': {
    steamId: '2358720',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2358720/header.jpg',
    rating: 96,
    genres: ['Hành Động', 'Nhập Vai', 'Quán Game Xóm']
  },
  // God of War
  'god of war ragnarok': {
    steamId: '2322010',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2322010/header.jpg',
    rating: 98,
    genres: ['Hành Động', 'Thần Thoại', 'Việt Hóa']
  },
  'god of war': {
    steamId: '1593500',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1593500/header.jpg',
    rating: 97,
    genres: ['Hành Động', 'Thần Thoại']
  },
  'god of war chains of olympus': {
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    rating: 92,
    genres: ['Giả Lập PSP', 'Hành Động']
  },
  'god of war ghost of sparta': {
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    rating: 93,
    genres: ['Giả Lập PSP', 'Hành Động']
  },
  // Starcraft
  'starcraft gundam century': {
    steamId: '208650',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    rating: 95,
    genres: ['Chiến Thuật', 'RTS', 'Kinh Điển']
  },
  'starcraft': {
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    rating: 96,
    genres: ['Chiến Thuật', 'RTS']
  },
  // Resident Evil
  'resident evil 3': {
    steamId: '952060',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/952060/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/952060/header.jpg',
    rating: 90,
    genres: ['Kinh Dị', 'Hành Động']
  },
  'resident evil 3 nemesis': {
    steamId: '952060',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/952060/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/952060/header.jpg',
    rating: 94,
    genres: ['Kinh Dị', 'Giả Lập PS1']
  },
  'resident evil 2': {
    steamId: '883710',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/883710/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/883710/header.jpg',
    rating: 96,
    genres: ['Kinh Dị', 'Hành Động']
  },
  'resident evil 4': {
    steamId: '2050650',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2050650/header.jpg',
    rating: 97,
    genres: ['Kinh Dị', 'Hành Động', 'Việt Hóa']
  },
  // GTA
  'grand theft auto vice city': {
    steamId: '1547000',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547000/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547000/header.jpg',
    rating: 95,
    genres: ['Thế Giới Mở', 'Hành Động']
  },
  'gta vice city': {
    steamId: '1547000',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547000/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1547000/header.jpg',
    rating: 95,
    genres: ['Thế Giới Mở', 'Hành Động']
  },
  'grand theft auto v': {
    steamId: '271590',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
    rating: 97,
    genres: ['Thế Giới Mở', 'Hành Động']
  },
  'grand theft auto iv': {
    steamId: '12210',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/12210/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/12210/header.jpg',
    rating: 94,
    genres: ['Thế Giới Mở', 'Hành Động']
  },
  // Ghost of Tsushima
  'ghost of tsushima': {
    steamId: '2215430',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2215430/header.jpg',
    rating: 96,
    genres: ['Hành Động', 'Thế Giới Mở', 'Samurai']
  },
  // Witcher
  'the witcher 3': {
    steamId: '292030',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
    rating: 98,
    genres: ['RPG', 'Thế Giới Mở', 'Việt Hóa']
  },
  'the witcher 2': {
    steamId: '20920',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/20920/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/20920/header.jpg',
    rating: 91,
    genres: ['RPG']
  },
  // Red Dead Redemption 2
  'red dead redemption 2': {
    steamId: '1174180',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
    rating: 97,
    genres: ['Thế Giới Mở', 'Hành Động', 'Cao Bồi']
  },
  // Cyberpunk 2077
  'cyberpunk 2077': {
    steamId: '1091500',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
    rating: 92,
    genres: ['Sci-Fi', 'Thế Giới Mở', 'RPG']
  },
  // Elden Ring
  'elden ring': {
    steamId: '1245620',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
    rating: 96,
    genres: ['Souls-like', 'RPG', 'Thế Giới Mở']
  },
  // Sekiro
  'sekiro shadows die twice': {
    steamId: '814380',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/814380/header.jpg',
    rating: 95,
    genres: ['Souls-like', 'Hành Động', 'Samurai']
  },
  // Silent Hill 2
  'silent hill 2': {
    steamId: '2124490',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2124490/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2124490/header.jpg',
    rating: 95,
    genres: ['Kinh Dị', 'Việt Hóa']
  },
  // Final Fantasy VII
  'final fantasy vii remake': {
    steamId: '1462040',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1462040/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1462040/header.jpg',
    rating: 93,
    genres: ['RPG', 'Việt Hóa']
  },
  'final fantasy vii': {
    steamId: '39140',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/39140/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/39140/header.jpg',
    rating: 95,
    genres: ['RPG', 'Kinh Điển']
  },
  'final fantasy ix': {
    steamId: '377840',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/377840/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/377840/header.jpg',
    rating: 94,
    genres: ['RPG']
  },
  'final fantasy viii': {
    steamId: '1026680',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1026680/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1026680/header.jpg',
    rating: 90,
    genres: ['RPG']
  },
  'final fantasy x': {
    steamId: '359870',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/359870/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/359870/header.jpg',
    rating: 92,
    genres: ['RPG']
  },
  // Battle Realms
  'battle realms': {
    steamId: '1025600',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1025600/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/1025600/header.jpg',
    rating: 93,
    genres: ['RTS', 'Chiến Thuật']
  },
  // Red Alert 2 / C&C
  'command conquer red alert 2': {
    steamId: '2229850',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2229850/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2229850/header.jpg',
    rating: 96,
    genres: ['RTS', 'Chiến Thuật']
  },
  'red alert 2': {
    steamId: '2229850',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2229850/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/2229850/header.jpg',
    rating: 96,
    genres: ['RTS', 'Chiến Thuật']
  },
  // Heroes of Might and Magic 3
  'heroes of might magic 3': {
    steamId: '297000',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/297000/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/297000/header.jpg',
    rating: 95,
    genres: ['Chiến Thuật Theo Lượt']
  },
  // Metal Gear Solid V
  'metal gear solid v': {
    steamId: '287700',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/287700/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/287700/header.jpg',
    rating: 94,
    genres: ['Hành Động', 'Lén Lút']
  },
  // Sleeping Dogs
  'sleeping dogs': {
    steamId: '307690',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/307690/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/307690/header.jpg',
    rating: 93,
    genres: ['Hành Động', 'Thế Giới Mở']
  },
  // Devil May Cry 5
  'devil may cry 5': {
    steamId: '601150',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/601150/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/601150/header.jpg',
    rating: 95,
    genres: ['Hành Động', 'Chặt Chém']
  },
  // Yu-Gi-Oh Forbidden Memories
  'yu gi oh forbidden memories': {
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    rating: 90,
    genres: ['Thẻ Bài', 'Giả Lập PS1']
  }
};
