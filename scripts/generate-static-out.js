// Generate an "out" folder from Next.js output: 'export' build artifacts.
// For Electron with file:// protocol, we need absolute paths for assets.
// This script copies the static export and ensures all _next assets are available.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const NEXT_DIR = path.join(ROOT, '.next');
const SERVER_APP_DIR = path.join(NEXT_DIR, 'server', 'app');
const OUT_DIR = path.join(ROOT, 'out');
const STATIC_DIR = path.join(NEXT_DIR, 'static');

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
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.lstatSync(s);
    if (stat.isDirectory()) {
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

  // Copy all app routes
  copyDir(SERVER_APP_DIR, OUT_DIR);

  // Reorganize day/[date].html files into day/[date]/index.html structure
  const dayDir = path.join(OUT_DIR, 'day');
  if (fs.existsSync(dayDir)) {
    const entries = fs.readdirSync(dayDir);
    for (const entry of entries) {
      // Match files like "2025-11-29.html"
      const match = entry.match(/^(\d{4}-\d{2}-\d{2})\.html$/);
      if (match) {
        const date = match[1];
        const dateDir = path.join(dayDir, date);
        fs.mkdirSync(dateDir, { recursive: true });
        
        // Move .html file to date/index.html
        const oldPath = path.join(dayDir, entry);
        const newPath = path.join(dateDir, 'index.html');
        fs.renameSync(oldPath, newPath);
        
        // Move associated files (.meta, .rsc, .segments/)
        const baseName = date;
        const metaFile = path.join(dayDir, `${baseName}.meta`);
        const rscFile = path.join(dayDir, `${baseName}.rsc`);
        const segmentsDir = path.join(dayDir, `${baseName}.segments`);
        
        if (fs.existsSync(metaFile)) {
          fs.renameSync(metaFile, path.join(dateDir, 'index.meta'));
        }
        if (fs.existsSync(rscFile)) {
          fs.renameSync(rscFile, path.join(dateDir, 'index.rsc'));
        }
        if (fs.existsSync(segmentsDir)) {
          fs.renameSync(segmentsDir, path.join(dateDir, 'index.segments'));
        }
      }
    }
  }

  // Copy _next static assets to root level
  if (fs.existsSync(STATIC_DIR)) {
    const nextOut = path.join(OUT_DIR, '_next', 'static');
    copyDir(STATIC_DIR, nextOut);
    
    // Copy _next folder into day subdirectories for relative path resolution
    const dayDir = path.join(OUT_DIR, 'day');
    if (fs.existsSync(dayDir)) {
      const dayEntries = fs.readdirSync(dayDir);
      for (const entry of dayEntries) {
        const entryPath = path.join(dayDir, entry);
        if (fs.statSync(entryPath).isDirectory() && entry !== '[date]') {
          const dayNextDir = path.join(entryPath, '_next', 'static');
          copyDir(STATIC_DIR, dayNextDir);
        }
      }
    }
  } else {
    console.warn('[generate-static-out] Warning: Missing static assets', STATIC_DIR);
  }

  console.log('[generate-static-out] Prepared static out folder at', OUT_DIR);
}

main();