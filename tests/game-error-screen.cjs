// Game error screen (QA audit Oct 25 2026, docs/QA_AUDIT_OCT25.md #13): there was no error boundary, so a lazy HUD chunk failing to
// download on a flaky phone connection (Settings, the pocket, cards…) blanked the whole island. app/error.tsx now catches it with a
// kid-friendly screen; a download failure reloads (the lazy component caches the failure), other errors re-render in place; while
// offline the button waits. Browser-verified: offline → tap Settings → "No internet right now"; online → Try again → title → Play.
// Run: node tests/game-error-screen.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const file=path.join(__dirname,'../app/error.tsx');
assert(fs.existsSync(file),'app/error.tsx exists (Next mounts it around every page below the root layout)');
const src=fs.readFileSync(file,'utf8');
assert.match(src,/^'use client';/,'error boundaries are client components');
assert.match(src,/export default function GameError\(\{error,reset\}/,'default export takes error + reset');
assert.equal((src.match(/^export /gm)||[]).length,1,'only the default export (Next special file)');
assert.match(src,/isChunkError\(error\)\)window\.location\.reload\(\);else reset\(\);/,'chunk failures reload, other errors reset');
assert.match(src,/disabled=\{offline\}/,'Try again waits for the connection');
assert.match(src,/Your island is saved\./,'reassures the kid the save is kept');
assert(!/setInterval|setTimeout|requestAnimationFrame/.test(src),'no timers or polling (heat rule)');
const re=new RegExp(src.match(/const CHUNK=\/(.+)\/i;/)[1],'i');
for(const msg of ['ChunkLoadError: Loading chunk 123 failed.','Loading CSS chunk _app-pages-browser_components_IslandBottle_tsx failed.','Failed to fetch dynamically imported module: x.js','Importing a module script failed.'])assert(re.test(msg),'chunk error: '+msg);
for(const msg of ['TypeError: Cannot read properties of null','RangeError: Maximum call stack'])assert(!re.test(msg),'not a chunk error: '+msg);
console.log('game-error-screen ok');
