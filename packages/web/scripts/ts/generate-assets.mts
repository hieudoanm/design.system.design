/**
 * Turns the video from the navigation e2e test into `assets/navigation.mp4`
 * and `assets/navigation.gif`.
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

/** Find the navigation test recording (video.webm inside a folder named like navigation-*). */
const findNavigationVideo = (folder: string): string | null => {
  if (!existsSync(folder)) return null;

  const entries = readdirSync(folder, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) {
      // Look for navigation test folder
      if (entry.name.includes('navigation')) {
        // Inside navigation folder, look for video.webm
        const nestedEntries = readdirSync(path, { withFileTypes: true });
        for (const nested of nestedEntries) {
          if (!nested.isDirectory() && nested.name === 'video.webm') {
            return join(path, 'video.webm');
          }
        }
        // Fallback: recurse deeper
        const deeper = findNavigationVideo(path);
        if (deeper) return deeper;
      }
      // Recurse into other directories
      const nested = findNavigationVideo(path);
      if (nested) return nested;
    }
  }
  return null;
};

const file = findNavigationVideo(source);
if (!file) {
  console.error('No navigation test video found in test-results/. Run the tests first: pnpm e2e');
  process.exit(1);
}

mkdirSync(target, { recursive: true });

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
