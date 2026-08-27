import fs from 'fs';

const games = JSON.parse(fs.readFileSync('src/data/initialGames.json', 'utf-8'));

async function runAudit() {
  console.log('Total games in dataset:', games.length);

  const realBlobRoms = [];
  const missingOrBrokenRoms = [];
  const pcGames = [];

  for (const g of games) {
    const isRomCandidate = Boolean(
      g.romUrl ||
      g.emulatorCore ||
      g.system === 'snes' ||
      g.system === 'nes' ||
      g.system === 'gba' ||
      (g.genres && g.genres.some(genre => /snes|retro|giả lập|console/i.test(genre)))
    );

    if (!isRomCandidate) {
      pcGames.push({ id: g.id, title: g.title, system: g.system || 'PC' });
      continue;
    }

    if (!g.romUrl) {
      missingOrBrokenRoms.push({
        id: g.id,
        title: g.title,
        system: g.system || g.emulatorCore || 'snes',
        reason: 'Chưa có đường dẫn romUrl (chỉ có metadata)'
      });
      continue;
    }

    if (!g.romUrl.startsWith('http')) {
      missingOrBrokenRoms.push({
        id: g.id,
        title: g.title,
        system: g.system || g.emulatorCore || 'snes',
        romUrl: g.romUrl,
        reason: 'Đường dẫn cục bộ / chưa upload lên Cloud Blob'
      });
      continue;
    }

    try {
      const res = await fetch(g.romUrl, {
        method: 'GET',
        headers: { Range: 'bytes=0-50' }
      });

      if (res.status === 200 || res.status === 206) {
        realBlobRoms.push({
          id: g.id,
          title: g.title,
          system: g.system || g.emulatorCore || 'snes',
          romUrl: g.romUrl
        });
      } else {
        missingOrBrokenRoms.push({
          id: g.id,
          title: g.title,
          system: g.system || g.emulatorCore || 'snes',
          romUrl: g.romUrl,
          reason: `HTTP ${res.status} (File không tồn tại trên Cloud Storage)`
        });
      }
    } catch (e) {
      missingOrBrokenRoms.push({
        id: g.id,
        title: g.title,
        system: g.system || g.emulatorCore || 'snes',
        romUrl: g.romUrl,
        reason: `Lỗi kết nối: ${e.message}`
      });
    }
  }

  console.log('\n========================================');
  console.log(`TỔNG SỐ GAME: ${games.length}`);
  console.log(`1. Game PC (chỉ tải về, không qua giả lập): ${pcGames.length}`);
  console.log(`2. Game ROM đã xác nhận CÓ FILE THẬT trên Vercel Blob (chơi được ngay): ${realBlobRoms.length}`);
  console.log(`3. Game ROM có metadata nhưng CHƯA có file thật / cần upload: ${missingOrBrokenRoms.length}`);
  console.log('========================================\n');

  console.log('--- DANH SÁCH GAME ROM ĐÃ CÓ FILE THẬT TRÊN BLOB (' + realBlobRoms.length + ') ---');
  realBlobRoms.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.id}] ${r.title} (${r.system})`);
  });

  console.log('\n--- DANH SÁCH GAME ROM CHƯA CÓ FILE THẬT TRÊN BLOB (' + missingOrBrokenRoms.length + ') ---');
  missingOrBrokenRoms.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.id}] ${r.title} (${r.system}) => ${r.reason}`);
  });
}

runAudit();
