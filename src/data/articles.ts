export interface Article {
  id: string;
  title: string;
  category: 'Ký Ức' | 'Hướng Dẫn' | 'Review' | 'Cộng Đồng';
  author: string;
  date: string;
  readTime: string;
  views: number;
  likes: number;
  coverImage: string;
  excerpt: string;
  content: string[];
  tags: string[];
}

export const ARTICLES_DATA: Article[] = [
  {
    id: 'ky-uc-crt-ps1',
    title: 'Ký Ức Tuổi Thơ: Thời Cắm Mặt Vào Màn Hình CRT & Những Chiếc Đĩa PS1 Trầy Xước',
    category: 'Ký Ức',
    author: 'Chủ Quán Game Xóm',
    date: '01/08/2026',
    readTime: '6 phút đọc',
    views: 4820,
    likes: 382,
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Nhớ cái thời trốn học ra quán net 2000đ/giờ, cầm chiếc tay cầm PS1 nút bấm chai sần, thở phào khi chiếc đĩa trầy xước đọc được logo PlayStation đỏ chói...',
    tags: ['Nostalgia', 'PS1', 'CRT', 'Tuổi Thơ', '8x9x'],
    content: [
      'Có những âm thanh chỉ cần cất lên thôi là cả một vùng trời tuổi thơ 8x 9x lại ùa về. Đó là tiếng quạt tản nhiệt rên rỉ của những chiếc tivi CRT dày cộp, là tiếng "bíp" giòn tan khi bật máy PlayStation 1, và âm thanh logo PlayStation đỏ chói huyền thoại xuất hiện trên màn hình.',
      'Ngày đó, không có mạng cáp quang tốc độ cao, không có Steam hay Epic Games. Muốn chơi một tựa game mới, bọn mình phải dành dụm từng tờ 500đ, 1000đ ăn sáng, đạp xe cả chục cây số ra hàng đĩa đúc. Nhìn những chiếc đĩa mặt bạc, mặt tím trầy xước chéo nheo mà lòng nơm nớp lo sợ không biết mang về máy có nhận được không.',
      'Nếu may mắn đĩa đọc được, cả quán game hò reo như vừa vô địch World Cup. Những trận Đấu Trường Thú (Bloody Roar 2) căng thẳng, những đêm thức trắng luyện Final Fantasy IX hay Yu-Gi-Oh! Forbidden Memories ép bài thần bài... chính là kho báu ký ức không thể thay thế.',
      'Quán Game Xóm được sinh ra chính từ tình yêu ấy. Nơi lưu giữ những bản game Việt Hóa tâm huyết, những bản ROM giả lập nguyên bản để bạn dù ở lứa tuổi U40/50 vẫn có thể chạm lại giấc mơ tuổi thơ.'
    ]
  },
  {
    id: 'top-10-game-ps1-viet-hoa',
    title: 'Top 10 Tựa Game PS1 & PC Việt Hóa Gắn Liền Với Ký Ức Game Thủ Việt',
    category: 'Review',
    author: 'Quán Game Xóm Team',
    date: '28/07/2026',
    readTime: '8 phút đọc',
    views: 6210,
    likes: 540,
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Điểm mặt những huyền thoại được cộng đồng Việt Hóa tỉ mỉ từng dòng hội thoại: Final Fantasy IX, Yu-Gi-Oh!, Resident Evil 3, Chrono Cross...',
    tags: ['Top Game', 'Việt Hóa', 'PS1', 'PC', 'JRPG'],
    content: [
      'Chơi game bằng tiếng Anh với cuốn từ điển dày cộp bên cạnh từng là trải nghiệm quen thuộc của thế hệ trước. Nhưng khi có các bản Việt Hóa chuẩn chỉnh, câu chuyện trong game mới thực sự đi sâu vào lòng người.',
      '1. **Final Fantasy IX Việt Hóa**: Bản dịch xuất sắc truyền tải trọn vẹn sự lãng mạn, hài hước và triết lý sống của Zidane, Vivi cùng công chúa Garnet.',
      '2. **Yu-Gi-Oh! Forbidden Memories (Thần Bài PS1)**: Bản dịch tên lá bài và hiệu ứng chuẩn xác, đi kèm các bản Mod drop bài cực kỳ hấp dẫn.',
      '3. **Resident Evil 3: Nemesis**: Cảm giác hồi hộp tột cùng khi đọc từng mảnh nhật ký còn sót lại ở Raccoon City bằng tiếng mẹ đẻ.',
      '4. **Castlevania: Symphony of the Night**: Hành trình của Alucard trong lâu đài ác ma trở nên lôi cuốn gấp bội.',
      'Tất cả các tựa game trên đều có sẵn link tải trực tiếp full tốc độ tại Quán Game Xóm!'
    ]
  },
  {
    id: 'huong-dan-gia-lap-duckstation',
    title: 'Hướng Dẫn Cấu Hình DuckStation & PCSX2 Chơi Game Mượt 60FPS Không Giật Lag',
    category: 'Hướng Dẫn',
    author: 'Kỹ Thuật Viên Xóm',
    date: '25/07/2026',
    readTime: '5 phút đọc',
    views: 3490,
    likes: 290,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Tối ưu hóa trình giả lập PS1 & PS2 trên PC và Android. Hướng dẫn sửa lỗi màn hình đen, tăng độ phân giải lên 4K sắc nét.',
    tags: ['Giả Lập', 'DuckStation', 'PCSX2', 'Hướng Dẫn', 'PC'],
    content: [
      'DuckStation hiện là trình giả lập PS1 tốt nhất thế giới với khả năng nâng cấp đồ họa tuyệt vời, loại bỏ hoàn toàn hiện tượng méo hình polygon cổ điển.',
      '**Bước 1: Tải bộ cài DuckStation & BIOS PS1**',
      'Tải ngay gói DuckStation Pre-configured tại Quán Game Xóm (đã tích hợp sẵn BIOS scph1001.bin và tay cầm Xbox/DualSense).',
      '**Bước 2: Cấu hình đồ họa Widescreen & PGXP**',
      'Vào Settings -> Graphics -> chọn Render Vulkan hoặc D3D11. Bật PGXP Geometry Correction để hình ảnh phẳng lỳ không bị rung giật.',
      '**Bước 3: Thưởng thức game Việt Hóa**',
      'Kéo thả file ISO game từ Quán Game Xóm vào DuckStation và tận hưởng!'
    ]
  },
  {
    id: 'tuyet-ky-contra-rong-den',
    title: 'Bí Mật Bùa 30 Mạng Contra & Nhớ Nằm Lòng Tuyệt Kỹ Rồng Đen (Mortal Kombat 3)',
    category: 'Ký Ức',
    author: 'Chủ Quán Game Xóm',
    date: '20/07/2026',
    readTime: '4 phút đọc',
    views: 5120,
    likes: 410,
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
    excerpt: 'Lên Lên Xuống Xuống Trái Phải Trái Phải B A Select Start - Mã thần thánh mà bất kỳ game thủ 8x 9x nào cũng thuộc lòng hơn cả bảng cửu chương!',
    tags: ['Contra', 'Mortal Kombat', 'Konami Code', 'Mẹo Game'],
    content: [
      'Năm 1988, Konami tạo ra một trong những đoạn mã huyền thoại nhất lịch sử ngành game: "Up, Up, Down, Down, Left, Right, Left, Right, B, A". Khi gõ câu thần chú này ở màn hình Start của Contra 4 nút (NES), bạn sẽ nhận ngay 30 mạng.',
      'Còn ở dòng game Mortal Kombat 3 (Rồng Đen SEGA), cuốn sổ tay nguệch ngoạc ghi chép Fatality của Sub-Zero, Scorpion, Liu Kang chính là báu vật truyền tay qua bao hệ game thủ.',
      'Hãy đến với Quán Game Xóm để tải bộ game 4 nút NES & SEGA đính kèm giả lập chơi mượt trên cả điện thoại và máy tính!'
    ]
  }
];
