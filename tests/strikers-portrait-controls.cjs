// Strikers upright on a phone: the stick and the coach tip stay off Gold's goal mouth (Oct 26 2026, owner). Gold's own goal is
// at the bottom centre in portrait; the controls fold into the bottom corners, the tip moves right and fades, the pitch lifts.
// Run: node tests/strikers-portrait-controls.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=read('components/LiveArcadeMatch.module.css'),match=read('components/LiveArcadeMatch.tsx'),scene=read('lib/arcade/strikerScene.ts');
const blocks=[...css.matchAll(/@media\(pointer:coarse\) and \(orientation:portrait\)\{([\s\S]*?)\n\}/g)].map(m=>m[1]);
const last=blocks[blocks.length-1];assert.ok(last,'a portrait block');
const rule=sel=>{const i=last.lastIndexOf(sel+'{');assert.ok(i>=0,sel);return last.slice(i,last.indexOf('}',i));};
// Measured on a 390 px phone with the follow cam zoomed in (Oct 26 screenshot): the posts sit at about x 112 and 262.
const W=390,mouth=[W/2-80,W/2+70];
const px=(r,prop)=>Number((r.match(new RegExp(prop+':(?:calc\\()?(\\d+)px'))||[])[1]);
const stick=rule('.root .movement'),stickLeft=px(stick,'left'),stickW=px(stick,'width');
assert.ok(stickLeft+stickW<mouth[0],`stick ends at ${stickLeft+stickW}px, left of the goal mouth`);
const acts=rule('.root .actions'),cols=(acts.match(/grid-template-columns:([^;]+)/)||[])[1].split(' ').map(parseFloat),gap=px(acts,'gap'),right=px(acts,'right');
const actsLeft=W-right-cols.reduce((a,b)=>a+b,0)-gap*(cols.length-1);
assert.equal(cols.length,2,'two columns');assert.ok(actsLeft>mouth[1],`buttons start at ${actsLeft}px, right of the goal mouth`);
assert.match(acts,/grid-template-areas:'pass sprint' 'through shoot' 'switch shoot'/);
const tip=rule('.root .footer>p');assert.match(tip,/left:auto;right:/,'tip is right-aligned');assert.match(tip,/animation:tipFade/,'tip fades');
assert.match(tip,/max-width:min\(220px,calc\(100% - 170px\)\)/);
assert.match(css,/@keyframes tipFade\{0%,78%\{opacity:1\}100%\{opacity:0\}\}/);
assert.ok(match.includes('<footer className={styles.footer}><p key={view.message}>'),'a new coach line shows again');
assert.match(scene,/const PORTRAIT_LIFT=\.1;/);assert.ok(scene.includes('camera.setViewOffset(w,h,0,h*PORTRAIT_LIFT,w,h)'));
console.log('strikers-portrait-controls ok');
