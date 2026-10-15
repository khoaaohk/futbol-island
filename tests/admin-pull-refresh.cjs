// Admin pull-to-refresh (Oct 15 2026 QA): drag-down-to-reload for the admin portal on touch devices. Source checks only
// (no DOM/touch simulation here — see Playwright coverage for the live gesture): the resistance/threshold constants
// exist, preventDefault() is scoped to the actual pull (never called unconditionally on touchstart/touchend, and
// gated behind the "still pulling down" check inside touchmove), overscroll-behavior is set on the admin page only
// (not globally), and the admin dashboard reuses its existing `load` reload instead of a page reload.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');

const ptr=read('app/admin/PullToRefresh.tsx');
const css=read('app/admin/admin.module.css');
const dash=read('app/admin/AnalyticsDashboard.tsx');

// 1. The gesture's tuning constants exist: ~0.5x resistance, ~90px cap, ~64px release threshold.
assert.match(ptr,/THRESHOLD\s*=\s*64/,'a 64px release threshold');
assert.match(ptr,/MAX_PULL\s*=\s*90/,'a 90px cap on the pull distance');
assert.match(ptr,/RESISTANCE\s*=\s*0\.5/,'0.5x resistance on finger travel');
assert.match(ptr,/Math\.min\(raw\s*\*\s*RESISTANCE\s*,\s*MAX_PULL\)/,'distance = resisted travel, capped at MAX_PULL');

// 2. preventDefault is scoped to an active downward pull from the top, never called unconditionally.
const onStart=ptr.match(/const onStart=\(e:TouchEvent\)=>\{([\s\S]*?)\n  \};/);
const onMove=ptr.match(/const onMove=\(e:TouchEvent\)=>\{([\s\S]*?)\n  \};/);
const onEnd=ptr.match(/const onEnd=\(\)=>\{([\s\S]*?)\n  \};/);
assert.ok(onStart&&onMove&&onEnd,'onStart/onMove/onEnd handlers are present');
assert.ok(!/preventDefault/.test(onStart[1]),'touchstart never calls preventDefault (passive)');
assert.match(onStart[1],/closest\?\.\('\[data-pull-ignore\]'\)\)return;/,'a touch inside the On now slide-out never starts a pull (Oct 15 2026)');
assert.match(fs.readFileSync(path.join(__dirname,'..','app/admin/LivePanel.tsx'),'utf8'),/data-open=\{open\} aria-hidden=\{!open\} data-pull-ignore/,'the slide-out is marked');
assert.ok(!/preventDefault/.test(onEnd[1]),'touchend never calls preventDefault (passive)');
// Inside touchmove, preventDefault must come after the bail-out for "not actually pulling down from the top".
const bailIdx=onMove[1].indexOf('reset();return;');
const pdIdx=onMove[1].indexOf('preventDefault');
assert.ok(bailIdx>=0&&pdIdx>bailIdx,'preventDefault is only reached once the not-pulling case has already returned');
assert.match(ptr,/addEventListener\('touchstart',onStart,\{passive:true\}\)/,'touchstart listener is passive');
assert.match(ptr,/addEventListener\('touchend',onEnd,\{passive:true\}\)/,'touchend listener is passive');
assert.match(ptr,/addEventListener\('touchmove',onMove,\{passive:false\}\)/,'touchmove is non-passive (it conditionally preventDefaults)');

// 3. Don't trigger while a fetch is already running, and only from the scrolled-to-top position.
assert.match(ptr,/if\(refreshing\|\|loading\|\|e\.touches\.length!==1\|\|!atTop\(\)\)return;/,'bails out while loading/refreshing, on multi-touch, or when not scrolled to the top');

// 4. prefers-reduced-motion: no translate/bounce, spinner reveal by opacity only.
assert.match(ptr,/matchMedia\('\(prefers-reduced-motion: reduce\)'\)/,'reads the reduced-motion preference');
assert.match(ptr,/reduced\.current\?0:/,'translateY is forced to 0 (no bounce) under reduced motion');
assert.match(read('app/admin/PullToRefresh.module.css'),/prefers-reduced-motion:reduce\)\{[\s\S]*?\.spin\{animation:none\}/,'the spin animation is disabled under reduced motion');

// 5. transform/opacity only; no animation frame loop runs at rest.
assert.match(ptr,/transform:`translate\(-50%, \$\{translateY\}px\)`,opacity\}/,'only transform and opacity are animated');
assert.ok(!/requestAnimationFrame/.test(ptr),'no rAF loop (state changes only on touch events)');

// 6. overscroll-behavior-y:contain is set on the admin page's own CSS module (so it can't bleed into other routes).
assert.match(css,/\.page\{[\s\S]*?overscroll-behavior-y:contain/,'.page declares overscroll-behavior-y:contain');

// 7. The dashboard reuses its existing reload (`load`) — never a full page/location reload.
assert.match(dash,/import PullToRefresh from '\.\/PullToRefresh';/,'AnalyticsDashboard imports PullToRefresh');
assert.match(dash,/const pullRefresh=useCallback\(\(\)=>\{setPreset\('today'\);return load\('range=today'\);\},\[load\]\);/,'the pull-to-refresh callback calls the existing load(), not a new fetch path, and like a reload comes back to Today');
const page=fs.readFileSync(path.join(root,'app/admin/page.tsx'),'utf8');
assert.ok(page.includes('initialRange="today"')&&!/range:'7d'/.test(page),'the admin page opens on Today on every load or reload');
assert.match(dash,/<PullToRefresh onRefresh=\{pullRefresh\} loading=\{loading\} updated=\{updatedAt\}\/>/,'PullToRefresh is wired to the existing loading state and reload');
assert.ok(!/location\.reload/.test(dash)&&!/window\.location\.reload/.test(ptr),'no full page reload anywhere in this path (would risk the admin session)');

// 8. An "Updated hh:mm" time is shown (persistent line + the indicator both read the same updatedAt/updated state).
assert.match(dash,/const \[updatedAt,setUpdatedAt\]=useState<number\|null>\(null\);/,'tracks a last-updated timestamp');
assert.match(dash,/setUpdatedAt\(Date\.now\(\)\)/,'stamps the time after a successful load');
assert.match(dash,/Updated \{new Date\(updatedAt\)\.toLocaleTimeString/,'renders an "Updated hh:mm" line');
assert.match(ptr,/`Updated \$\{hhmm\}`/,'the indicator itself can also show the updated time');

console.log('PASS admin pull-to-refresh: threshold/resistance/cap set, preventDefault scoped to an active pull, passive listeners elsewhere, overscroll-behavior scoped to the admin page, reduced-motion respected, no rAF loop, and the existing reload/session is reused (no page reload).');
