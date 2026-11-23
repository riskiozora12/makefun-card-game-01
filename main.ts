// Lantern Duel — hand-in program (Node 22, standard library only).
//
// The game itself is the static files under game/ (game/index.html opens in a
// desktop browser and plays offline). This program hands the entry in: it
// copies game/ and screenshots/ from beside this file into the output
// directory and writes output/dossier.json, the summary the judge reads,
// using the vendored make.fun library.
//
// Inside the grader the output directory is /output. Anywhere else, set
// MAKEFUN_OUTPUT_DIR to point at it first:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory this file lives in.
const root = fileURLToPath(new URL('.', import.meta.url));
// The grader writes to /output; local runs use MAKEFUN_OUTPUT_DIR.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps, as the gate publishes them: the text cap shapes the
// dossier's bytes; the rest refuse an entry the scorer would refuse — more
// than 4 screenshots or one over 256 KiB, more than 993 files in game/ or
// 48 MiB of game files in all, or a game path over 1000 bytes. game/ counts
// beside /output's own 1000-entry cap, together with screenshots/ and
// dossier.json, so the entry leaves them room.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outDir, { recursive: true });

  // The playable game, exactly as it sits in the repository.
  cpSync(join(root, 'game'), join(outDir, 'game'), { recursive: true });

  // The screenshots of the game itself, in name order (the first is the cover).
  mkdirSync(join(outDir, 'screenshots'), { recursive: true });
  if (existsSync(join(root, 'screenshots'))) {
    cpSync(join(root, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
  }

  // The judge's summary of the game, built by the vendored library.
  writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, DOSSIER_CAPS));
}

handIn();
