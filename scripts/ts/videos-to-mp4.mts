/**
 * Turns the videos Playwright records into `assets/navigation.mp4` and
 * `assets/navigation.gif`.
 *
 * Playwright records WebM (VP8/VP9) and its bundled ffmpeg cannot encode
 * H.264, so the conversion uses the ffmpeg build from `ffmpeg-static`, which
 * has libx264. `pnpm e2e:video` runs the tests and then this script.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const root = resolve(import.meta.dirname, '../..');
const source = join(root, 'test-results');
const target = join(root, 'assets');
const movie = join(target, 'navigation.mp4');
const animation = join(target, 'navigation.gif');

/** The ffmpeg binary, downloading it first if the install script was skipped. */
const ffmpeg = () => {
  const fromEnv = process.env.FFMPEG_BIN;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const binary = require('ffmpeg-static') as string;
  if (existsSync(binary)) return binary;

  // pnpm ignores build scripts by default, so the binary may be missing.
  const install = join(dirname(require.resolve('ffmpeg-static/package.json')), 'install.js');
  execFileSync(process.execPath, [install], { stdio: 'inherit' });
  if (!existsSync(binary)) throw new Error(`ffmpeg not found at ${binary}`);
  return binary;
};

/** Every `.webm` under a folder, recursively. */
const videosIn = (folder: string): string[] => {
  if (!existsSync(folder)) return [];

  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return videosIn(path);
    return entry.name.endsWith('.webm') ? [path] : [];
  });
};

const files = videosIn(source);
if (files.length === 0) {
  console.error('No videos in test-results/. Run the tests first: pnpm e2e');
  process.exit(1);
}
if (files.length > 1) {
  console.warn(`${files.length} recordings found, the last one wins.`);
}

mkdirSync(target, { recursive: true });

const file = files.at(-1) as string;

// H.264 in an MP4, playable everywhere.
execFileSync(ffmpeg(), [
  '-y',
  '-i',
  file,
  '-vf',
  'scale=trunc(iw/2)*2:trunc(ih/2)*2',
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '23',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  movie,
]);

// The same run as a GIF: fewer frames, smaller, with its own palette.
execFileSync(ffmpeg(), [
  '-y',
  '-i',
  file,
  '-vf',
  'fps=15,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse',
  '-loop',
  '0',
  animation,
]);

for (const output of [movie, animation]) {
  console.log(`${basename(output)} (${Math.round(statSync(output).size / 1024)} kB)`);
}
