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
  },
  'yu gi oh': {
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    rating: 91,
    genres: ['Thẻ Bài', 'Quán Game Xóm']
  },
  // Eggsucker
  'eggsucker': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 92,
    genres: ['Arcade', 'Quán Game Xóm']
  },
  // Chocobo Racing
  'chocobo racing': {
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    rating: 95,
    genres: ['Đua Xe', 'Giả Lập PS1']
  },
  // Goemon
  'ganbare goemon': {
    coverImage: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?q=80&w=1200&auto=format&fit=crop',
    rating: 90,
    genres: ['Hành Động', 'Giả Lập SNES']
  },
  // Legend of Dragoon
  'legend of dragoon': {
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    rating: 94,
    genres: ['JRPG', 'Giả Lập PS1']
  },
  // Power Rangers
  'mighty morphin power rangers': {
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    rating: 89,
    genres: ['Đối Kháng', 'Giả Lập SNES']
  },
  // Tiny Toon
  'tiny toon adventures': {
    coverImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
    rating: 88,
    genres: ['Thể Thao', 'Giả Lập SNES']
  },
  // Contra
  'contra': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 96,
    genres: ['Bắn Súng', 'Giả Lập NES']
  },
  // Super Robot Taisen
  'super robot taisen': {
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    rating: 93,
    genres: ['Chiến Thuật', 'Mecha', 'Giả Lập SNES']
  },
  // Road Rash
  'road rash': {
    coverImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop',
    rating: 95,
    genres: ['Đua Xe', 'Hành Động', 'Kinh Điển']
  },
  // Dragon Ball
  'dragon ball': {
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    rating: 92,
    genres: ['Đối Kháng', 'Giả Lập GBA']
  },
  // Commandos
  'commandos': {
    steamId: '6830',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/6830/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/6830/header.jpg',
    rating: 94,
    genres: ['Chiến Thuật', 'Lén Lút']
  },
  // Fire Emblem
  'fire emblem': {
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    rating: 95,
    genres: ['Chiến Thuật Theo Lượt', 'Giả Lập GBA']
  },
  // Harvest Moon
  'harvest moon': {
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop',
    rating: 96,
    genres: ['Nông Trại', 'Giả Lập PS1']
  },
  // Captain Tsubasa
  'captain tsubasa': {
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    rating: 91,
    genres: ['Bóng Đá', 'Giả Lập SNES']
  },
  // Diablo II
  'diablo ii': {
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    rating: 98,
    genres: ['Hành Động', 'RPG', 'Kinh Điển']
  },
  // Zoo Tycoon
  'zoo tycoon': {
    coverImage: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1200&auto=format&fit=crop',
    rating: 92,
    genres: ['Mô Phỏng', 'Quản Lý']
  },
  // Tearring Saga
  'tearring saga': {
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
    rating: 94,
    genres: ['Chiến Thuật', 'Giả Lập PS1']
  },
  // PopCap Games
  'popcap': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 90,
    genres: ['Giải Đố', 'Mini Game']
  },
  // Kyatto Ninden / Pizza Cats
  'kyatto ninden teyandee': {
    coverImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1200&auto=format&fit=crop',
    rating: 89,
    genres: ['Đi Màn', 'Giả Lập NES']
  },
  // Yu Yu Hakusho
  'yu yu hakusho': {
    coverImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
    rating: 91,
    genres: ['Đối Kháng', 'Giả Lập MegaDrive']
  },
  // Tenchu
  'tenchu': {
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
    rating: 93,
    genres: ['Lén Lút', 'Ninja', 'Giả Lập PS1']
  },
  // Mitsume Ga Tooru
  'mitsume ga tooru': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 92,
    genres: ['Hành Động', 'Giả Lập NES']
  },
  // Cossacks
  'cossacks': {
    steamId: '4880',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/4880/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/4880/header.jpg',
    rating: 93,
    genres: ['RTS', 'Chiến Thuật']
  },
  // Neighbours from Hell
  'neighbours from hell': {
    steamId: '260730',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/260730/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/260730/header.jpg',
    rating: 95,
    genres: ['Vui Nhộn', 'Giải Đố']
  },
  // Gamehouse 150
  'gamehouse': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 90,
    genres: ['Gamehouse', 'Mini Game']
  },
  // Chaos Legion
  'chaos legion': {
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop',
    rating: 91,
    genres: ['Chặt Chém', 'Hành Động']
  },
  // Bomberman
  'bomberman': {
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    rating: 94,
    genres: ['Đặt Bom', 'Vui Nhộn']
  },
  // RollerCoaster Tycoon
  'rollercoaster tycoon': {
    steamId: '285330',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/285330/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/285330/header.jpg',
    rating: 95,
    genres: ['Quản Lý', 'Mô Phỏng']
  },
  // Dynasty Warriors
  'dynasty warriors': {
    steamId: '278080',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/278080/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/278080/header.jpg',
    rating: 93,
    genres: ['Chặt Chém', 'Tam Quốc']
  },
  'dynasty warrior': {
    steamId: '278080',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/278080/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/278080/header.jpg',
    rating: 93,
    genres: ['Chặt Chém', 'Tam Quốc']
  },
  // Samurai Warriors
  'samurai warriors': {
    steamId: '348490',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/348490/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/348490/header.jpg',
    rating: 92,
    genres: ['Chặt Chém', 'Samurai']
  },
  // Warriors Orochi
  'warriors orochi': {
    steamId: '838010',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/838010/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/838010/header.jpg',
    rating: 94,
    genres: ['Chặt Chém', 'Hành Động']
  },
  'musou orochi': {
    steamId: '838010',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/838010/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/838010/header.jpg',
    rating: 94,
    genres: ['Chặt Chém', 'Hành Động']
  },
  // Hitman Absolution
  'hitman absolution': {
    steamId: '203140',
    coverImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/203140/library_600x900.jpg',
    bannerImage: 'https://cdn.cloudflare.steamstatic.com/steam/apps/203140/header.jpg',
    rating: 92,
    genres: ['Lén Lút', 'Hành Động']
  }
};
