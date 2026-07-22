// Minimal build-time artifact assertions (no E2E framework). Confirms the build
// actually produced a lesson page and the manifest, so a silently empty or
// broken build fails the Pages workflow instead of deploying nothing.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(process.cwd(), 'dist');

function assert(condition, message) {
  if (!condition) {
    console.error(`build assertion failed: ${message}`);
    process.exit(1);
  }
}

assert(existsSync(dist), 'dist/ was not produced');
assert(existsSync(join(dist, 'manifest.webmanifest')), 'dist/manifest.webmanifest is missing');
assert(existsSync(join(dist, 'icon.svg')), 'dist/icon.svg is missing');

const lessonsDir = join(dist, 'lessons');
assert(existsSync(lessonsDir), 'dist/lessons/ is missing');

const routes = readdirSync(lessonsDir, { withFileTypes: true }).filter((d) => d.isDirectory());
assert(routes.length > 0, 'no lesson routes were generated');
assert(
  existsSync(join(lessonsDir, routes[0].name, 'index.html')),
  `lesson route ${routes[0].name} has no index.html`,
);

console.log(`build assertions passed: manifest + icon + ${routes.length} lesson route(s)`);
