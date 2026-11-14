// Overnight QA, learning + web pages (Nov 14 2026). Guards the small fixes from that pass:
//  1. The reading pages' gold ink (eyebrows, "Lesson 3" labels) reads at WCAG AA (4.5:1) on every surface it sits on
//     (axe flagged #8a6620 on the #ecefdf cards at 4.49:1).
//  2. Tables that scroll sideways on a phone can be reached and scrolled with a keyboard (axe scrollable-region-focusable).
//  3. On a 320 px phone the menu, the wordmark and the gold Play pill fit the bar (Play ran 21 px off the edge).
//  4. The Explore checklist's done / not-done marks are read out (aria-label on a bare <span> is ignored).
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const lum=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};

// 1. Gold ink contrast, read from the tokens themselves.
const site=read('app/(site)/site.module.css'),learn=read('components/learn/learn.module.css');
const token=(css,name)=>{const m=css.match(new RegExp(`--${name}:(#[0-9a-f]{6})`,'i'));assert(m,`--${name} token`);return m[1];};
const accent=token(site,'accent');
for(const bg of ['paper','surface','well'])assert(ratio(accent,token(site,bg))>=4.5,`site --accent on --${bg}: ${ratio(accent,token(site,bg)).toFixed(2)}`);
assert(ratio(token(learn,'goldInk'),'#fbf7ee')>=4.5&&ratio(token(learn,'goldInk'),'#ecefdf')>=4.5,'learn --goldInk on paper and tint');
assert.equal(token(learn,'goldInk').toLowerCase(),accent.toLowerCase(),'one gold ink across the home bar and the reading pages');

// 2. Sideways-scrolling tables are focusable regions with a name and a focus ring.
for(const f of ['components/privacy/PrivacyPolicy.tsx','app/(site)/learn/soccer-positions/page.tsx','components/site/tools/RotationPlanner.tsx','lib/site/GuideParts.tsx','lib/site/FormatGuideView.tsx'])
 assert.match(read(f),/tableWrap[^>]*tabIndex=\{0\} role="region" aria-label=("[^"]+"|\{)/,`${f}: scrolling table is a focusable, named region`);
assert.match(read('components/privacy/PrivacyPolicy.module.css'),/\.tableWrap:focus-visible\{outline:/);
assert.match(site,/\.tableWrap:focus-visible\{outline:/);

// 3. 320 px bar: below 360 px the wordmark steps down so menu (76) + wordmark + Play (76) + gaps fit inside 16 px gutters.
assert.match(site,/@media\(max-width:359px\)\{\.nav\{gap:4px\}\.page \.brand\{font-size:20px\}\}/,'reading pages bar');
assert.match(learn,/@media\(max-width:359px\)\{\.subnavIn\{gap:4px\}\.root \.logo\{font-size:20px\}\}/,'home / learn bar');
// "Futbol Island" in IslandBrush measures ~157 px at 26 px (headless Chrome, Nov 14), so ~121 px at 20 px.
const brandAt=px=>157*px/26,need=px=>2*16+76+76+2*4+brandAt(px);
assert(need(26)>320,'the bug: 26 px does not fit');assert(need(20)<=320,`20 px fits: ${need(20).toFixed(0)} px`);

// 4. Explore checklist marks have a role so their label is announced.
assert.match(read('components/IslandQuests.tsx'),/className=\{styles\.exploreIndicator\} data-complete=\{item\.complete\} role="img" aria-label=/);
// 5. The expanded pitch radar folds away when a lesson's end buttons (or "Back to the question") appear: on phones it sat
//    over Quiz yourself / Watch again and swallowed the taps.
const field=read('components/FieldLearning.tsx');
assert.match(field,/const endButtons=endActionsAvailable\|\|rewatch!==null;\n useEffect\(\(\)=>\{if\(endButtons\)setRadarOpen\(false\);\},\[endButtons\]\);/,'radar closes for the end buttons');
console.log('qa-learn-nov14: ok');
