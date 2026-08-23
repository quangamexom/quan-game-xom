import fs from 'fs';
import path from 'path';
import { GameItem } from '../src/types';

/**
 * Utility script to consolidate, synchronize and export the latest complete games library
 * directly to `src/data/initialGames.ts` and associated JSON caches.
 *
 * Usage:
 *   npx tsx scripts/sync-data.ts
 */

const ROOT_DIR = process.cwd();

const PATHS = {
  initialGamesTs: path.join(ROOT_DIR, 'src', 'data', 'initialGames.ts'),
  initialGamesJson: path.join(ROOT_DIR, 'src', 'data', 'initialGames.json'),
  googleSheetJson: path.join(ROOT_DIR, 'src', 'data', 'googleSheetGames.json'),
  adminLibraryJson: path.join(ROOT_DIR, 'src', 'data', 'adminGamesLibrary.json'),
  publicLibraryJson: path.join(ROOT_DIR, 'public', 'assets', 'games-library.json'),
};

function readJsonSafe<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed as T[];
      }
    }
  } catch (err) {
    console.warn(`[SyncData] Could not read JSON from ${filePath}:`, (err as Error).message);
  }
  return [];
}

export async function syncGamesData(): Promise<GameItem[]> {
  console.log('🔄 [SyncData] Starting games data consolidation and export...');

  // 1. Gather all game sources
  const publicLib = readJsonSafe<GameItem>(PATHS.publicLibraryJson);
  const adminLib = readJsonSafe<GameItem>(PATHS.adminLibraryJson);
  const initialJson = readJsonSafe<GameItem>(PATHS.initialGamesJson);
  const sheetJson = readJsonSafe<GameItem>(PATHS.googleSheetJson);

  console.log(`📊 [SyncData] Loaded sources:`);
  console.log(`   - public/assets/games-library.json: ${publicLib.length} games`);
  console.log(`   - src/data/adminGamesLibrary.json:   ${adminLib.length} games`);
  console.log(`   - src/data/initialGames.json:       ${initialJson.length} games`);
  console.log(`   - src/data/googleSheetGames.json:   ${sheetJson.length} games`);

  // Priority order: adminLib > publicLib > initialJson > sheetJson
  const rawPool = [...adminLib, ...publicLib, ...initialJson, ...sheetJson];

  // 2. Deduplicate while preserving richest metadata
  const gameMap = new Map<string, GameItem>();

  for (const item of rawPool) {
    if (!item) continue;
    const key = (item.id || item.title || '').trim().toLowerCase();
    if (!key) continue;

    if (!gameMap.has(key)) {
      gameMap.set(key, { ...item });
    } else {
      // Merge properties if existing item lacks something
      const existing = gameMap.get(key)!;
      gameMap.set(key, {
        ...item,
        ...existing,
        // Ensure critical fields are retained
        romUrl: existing.romUrl || item.romUrl,
        downloadUrl: existing.downloadUrl || item.downloadUrl,
        coverArt: existing.coverArt || item.coverArt,
        backdropArt: existing.backdropArt || item.backdropArt,
        description: existing.description || item.description,
        genres: (existing.genres && existing.genres.length > 0) ? existing.genres : item.genres,
        platforms: (existing.platforms && existing.platforms.length > 0) ? existing.platforms : item.platforms,
      });
    }
  }

  const consolidatedGames: GameItem[] = Array.from(gameMap.values());
  console.log(`✨ [SyncData] Total consolidated unique games: ${consolidatedGames.length}`);

  // 3. Generate TypeScript export content
  const tsContent = `import { GameItem } from '../types';

export const DEFAULT_SHEET_URL = "https://docs.google.com/spreadsheets/d/1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM/edit?gid=0#gid=0";
export const DEFAULT_SHEET_ID = "1VA8Wv9OQmrR4nDpf0SUFQiqC4IAoVSCswCjY37ChplM";

export const INITIAL_GAMES: GameItem[] = ${JSON.stringify(consolidatedGames, null, 2)};
`;

  // 4. Write all target files
  fs.writeFileSync(PATHS.initialGamesTs, tsContent, 'utf-8');
  console.log(`💾 [SyncData] Wrote ${PATHS.initialGamesTs}`);

  const formattedJson = JSON.stringify(consolidatedGames, null, 2);
  fs.writeFileSync(PATHS.initialGamesJson, formattedJson, 'utf-8');
  fs.writeFileSync(PATHS.googleSheetJson, formattedJson, 'utf-8');
  fs.writeFileSync(PATHS.publicLibraryJson, formattedJson, 'utf-8');
  fs.writeFileSync(PATHS.adminLibraryJson, formattedJson, 'utf-8');
  console.log(`💾 [SyncData] Synchronized all JSON dataset files.`);

  // 5. Optional GitHub auto-commit if credentials are set
  const ghToken = process.env.GITHUB_TOKEN;
  const ghRepo = process.env.GITHUB_REPO || 'quangamexom/quan-game-xom';

  if (ghToken) {
    console.log(`🚀 [SyncData] GitHub token detected. Pushing updated dataset to ${ghRepo}...`);
    try {
      await pushFileToGithub(ghToken, ghRepo, 'src/data/initialGames.ts', tsContent);
      await pushFileToGithub(ghToken, ghRepo, 'src/data/initialGames.json', formattedJson);
      await pushFileToGithub(ghToken, ghRepo, 'src/data/googleSheetGames.json', formattedJson);
      await pushFileToGithub(ghToken, ghRepo, 'public/assets/games-library.json', formattedJson);
      await pushFileToGithub(ghToken, ghRepo, 'src/data/adminGamesLibrary.json', formattedJson);
      console.log(`✅ [SyncData] Pushed updated dataset files to GitHub successfully!`);
    } catch (pushErr) {
      console.warn(`⚠️ [SyncData] GitHub push skipped or failed:`, (pushErr as Error).message);
    }
  }

  console.log(`🎉 [SyncData] Completed synchronization of ${consolidatedGames.length} games!`);
  return consolidatedGames;
}

async function pushFileToGithub(token: string, repo: string, filePath: string, contentStr: string) {
  const base64Content = Buffer.from(contentStr).toString('base64');
  const ghUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

  let sha: string | undefined = undefined;
  try {
    const getRes = await fetch(ghUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'QuanGameXom-DataSync'
      }
    });
    if (getRes.ok) {
      const data: any = await getRes.json();
      sha = data.sha;
      if (data.content && data.content.replace(/\n/g, '') === base64Content.replace(/\n/g, '')) {
        return; // Identical
      }
    }
  } catch (e) {}

  const putRes = await fetch(ghUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'QuanGameXom-DataSync'
    },
    body: JSON.stringify({
      message: `feat(data): sync latest games dataset (${new Date().toISOString().split('T')[0]})`,
      content: base64Content,
      branch: 'main',
      ...(sha ? { sha } : {})
    })
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    console.error(`❌ [SyncData] GitHub upload failed for ${filePath}:`, errText.substring(0, 100));
  } else {
    console.log(`✅ [SyncData] Uploaded ${filePath} to GitHub`);
  }
}

// Execute directly if run via CLI
if (process.argv[1]?.includes('sync-data')) {
  syncGamesData().catch(err => {
    console.error('❌ [SyncData] Fatal error:', err);
    process.exit(1);
  });
}
