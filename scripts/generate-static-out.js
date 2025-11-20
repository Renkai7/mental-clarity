// Generate an "out" folder from Next.js output: 'export' build artifacts.
// Rationale: output:'export' with `assetPrefix: './'` places prerendered HTML under
// `.next/server/app`. We need a file:// friendly folder that mirrors route
// structure so Electron can load `out/index.html` and navigate to other routes
// without a server.
// This script copies prerendered HTML and duplicates the `_next` assets into
// each route folder to satisfy relative `./_next/` paths.
// NOTE: This is a pragmatic solution; for large apps consider adjusting
// assetPrefix and using a lightweight static server instead of duplication.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NEXT_DIR = path.join(ROOT, '.next');
const SERVER_APP_DIR = path.join(NEXT_DIR, 'server', 'app');
const OUT_DIR = path.join(ROOT, 'out');

function emptyDir(dir) {
  if (fs.existsSync(dir)) {
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      const stat = fs.lstatSync(p);
      if (stat.isDirectory()) {
        emptyDir(p);
        fs.rmdirSync(p);
      } else {
        fs.unlinkSync(p);
      }
    }
  } else {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      copyFile(s, d);
    }
  }
}

function main() {
  if (!fs.existsSync(SERVER_APP_DIR)) {
    console.error('[generate-static-out] Missing', SERVER_APP_DIR);
    process.exit(1);
  }
  emptyDir(OUT_DIR);

  // Copy root index & not-found if present.
  const rootHtml = path.join(SERVER_APP_DIR, 'index.html');
  if (fs.existsSync(rootHtml)) copyFile(rootHtml, path.join(OUT_DIR, 'index.html'));
  const notFoundHtml = path.join(SERVER_APP_DIR, '_not-found', 'index.html');
  if (fs.existsSync(notFoundHtml)) {
    copyDir(path.join(SERVER_APP_DIR, '_not-found'), path.join(OUT_DIR, '_not-found'));
  }

  // Enumerate immediate children representing routes.
  for (const entry of fs.readdirSync(SERVER_APP_DIR)) {
    if (entry === 'index.html' || entry === '_not-found') continue;
    const full = path.join(SERVER_APP_DIR, entry);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) {
      // Copy directory (contains index.html or static SSG variants)
      copyDir(full, path.join(OUT_DIR, entry));
    } else if (entry.endsWith('.html')) {
      // Single HTML file for a route (rare); place into folder.
      const routeName = entry.replace(/\.html$/, '');
      const destDir = path.join(OUT_DIR, routeName);
      fs.mkdirSync(destDir, { recursive: true });
      copyFile(full, path.join(destDir, 'index.html'));
    }
  }

  // Copy global assets `_next`.
  const nextStaticSrc = path.join(NEXT_DIR, 'static');
  if (!fs.existsSync(nextStaticSrc)) {
    console.error('[generate-static-out] Missing static assets', nextStaticSrc);
  }
  const nextTarget = path.join(OUT_DIR, '_next', 'static');
  fs.mkdirSync(nextTarget, { recursive: true });
  copyDir(nextStaticSrc, nextTarget);

  // Duplicate _next into each route folder for relative `./_next` references.
  const routeFolders = fs.readdirSync(OUT_DIR).filter(f => fs.lstatSync(path.join(OUT_DIR, f)).isDirectory() && !['_next'].includes(f));
  for (const rf of routeFolders) {
    const dest = path.join(OUT_DIR, rf, '_next', 'static');
    fs.mkdirSync(dest, { recursive: true });
    copyDir(nextStaticSrc, dest);
  }

  console.log('[generate-static-out] Prepared static out folder at', OUT_DIR);
}

main();