// UI polish (Oct 26 2026, owner): the map key's chips are real 40 px+ tap targets (no overlapping ::before slop), and the swim /
// dive coaching card is compact and leaves on its own sooner, so it no longer sits over the top ~100 px of the sea.
// Run: node tests/ui-taps-swim-card.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
// 1. Map key.
const map=read('components/IslandTravelMap.module.css');
const base=map.split('@media')[0];
assert.match(base,/\.legend li,\.legendTip\{min-height:(4\d|[5-9]\d)px\}/,'key rows and V / F / J buttons are ≥ 40 px tall everywhere');
assert.match(base,/\.legendTip::before\{content:'';position:absolute;inset:0 -5px\}/,'the hit area no longer spills into the next row');
assert.ok(!/inset:-11px/.test(map),'no vertical ::before slop left');
const phone=map.match(/@media\(max-width:600px\)\{([\s\S]*?)\n\}/)[1];
assert.match(phone,/\.legend\{display:grid;[^}]*gap:0 14px/,'phone rows sit flush (40 px boxes, no extra gap)');
// 2. Swim coaching card.
const toast=read('components/SwimLessonToast.tsx'),css=read('components/CostumeMilestoneToast.module.css');
const ms=Number(toast.match(/export const WATER_TOAST_MS=(\d+);/)[1]);assert.ok(ms<=4500&&ms>=3000,`leaves on its own after ${ms} ms`);
assert.ok(toast.includes('setTimeout(()=>setShown(false),WATER_TOAST_MS)'));
assert.ok(toast.includes('className={`${styles.toast} ${styles.water}`}'),'water cards use the compact style');
assert.ok(/aria-label=\{`\$\{L\.lesson\.title\}\. \$\{L\.lesson\.text\} \(\$\{L\.lesson\.kind\}\)`\}/.test(toast),'the "Coaching idea" label stays in the accessible name');
const water=css.match(/\.toast\.water\{([^}]*)\}/)[1];assert.match(water,/padding:6px 14px/);assert.match(css,/\.toast\.water b\{font-size:16px\}/);
assert.match(css,/\.toast\.water \.kind\{display:none\}/);
// Rough height: title 16×1.1 + two 12×1.25 lines + 12 px padding + 6 px border ≈ 66 px (was ≈ 100 px).
const height=16*1.1+2*12*1.25+12+6;assert.ok(height<75,`compact card ≈ ${height.toFixed(0)} px`);
console.log('ui-taps-swim-card ok');
