// Strikers landscape thumb buttons + simplified start card (owner, Oct 26 2026, docs/STRIKERS_LANDSCAPE_OCT26.md).
// Buttons: five circles on a right-thumb arc round Hold / Shoot (the biggest, in the bottom-right corner), >= 64 px (Shoot 88-96),
// >= 10 px apart, labels >= 13 px bold, inside their cluster box, clear of the stick, the coach pill and the meters on 667-932 px
// wide phones. Start card: one-tap Kick off, star goals as chips, Options (segmented, 48 px, no <select>) and Leaderboard.
// Browser check: scratchpad qa.cjs / menu.cjs (844x390, 932x430, 667x375, 1180x820, 1440x900; no overlaps, no scroll).
// Run: node tests/strikers-landscape-controls.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const css=read('components/LiveArcadeMatch.module.css'),live=read('components/LiveArcadeMatch.tsx');
const i=css.indexOf('@media(pointer:coarse) and (orientation:landscape),(pointer:coarse) and (min-width:501px){\n .root{--control-bottom');assert.ok(i>0,'the landscape block');
const block=css.slice(i,css.indexOf('\n}',i));
const num=(re,src=block)=>{const m=src.match(re);assert.ok(m,String(re));return Number(m[1]);};
const CW=num(/--cluster-w:(\d+)px/),CH=num(/--cluster-h:(\d+)px/),RIGHT=14,BOTTOM=10;
const base=block.match(/\.root \.actions button\[data-action\]\{([^}]*)\}/)[1];
assert.match(base,/font-size:13px;font-weight:800/,'labels 13 px bold');assert.match(base,/touch-action:none/);assert.match(base,/border-radius:50%/);
const D0=num(/--d:(\d+)px/,base);
const btn={};for(const a of ['shoot','pass','through','sprint','switchPlayer']){const m=block.match(new RegExp(`\\.root \\.actions button\\[data-action=${a}\\]\\{([^}]*)\\}`));const r=m?m[1]:'';
 const v=p=>{const x=r.match(new RegExp(`--${p}:(-?\\d+)px`));return x?Number(x[1]):null;};btn[a]={d:v('d')??D0,x:v('x')??0,y:v('y')??0};}
assert.ok(btn.shoot.d>=88&&btn.shoot.d<=96,'Shoot 88-96 px');
for(const [a,b] of Object.entries(btn)){assert.ok(b.d>=64,`${a} >= 64 px`);if(a!=='shoot')assert.ok(b.d<btn.shoot.d,`${a} smaller than Shoot`);}
assert.ok(btn.pass.d>D0,'Pass is the second biggest');
assert.ok(btn.pass.x<0&&Math.abs(btn.pass.y)<20,'Pass sits beside Shoot (left)');
// Shoot centre in the cluster box: (CW-46, CH-46). Every button inside the box, >= 10 px gaps.
const c=b=>({x:CW-46+b.x,y:CH-46+b.y,r:b.d/2});
for(const [a,b] of Object.entries(btn)){const p=c(b);assert.ok(p.x-p.r>=0&&p.x+p.r<=CW&&p.y-p.r>=0&&p.y+p.r<=CH+1e-9,`${a} inside the cluster box`);}
const names=Object.keys(btn);let minGap=1e9;
for(let m=0;m<names.length;m++)for(let n=m+1;n<names.length;n++){const p=c(btn[names[m]]),q=c(btn[names[n]]),gap=Math.hypot(p.x-q.x,p.y-q.y)-p.r-q.r;minGap=Math.min(minGap,gap);assert.ok(gap>=10,`${names[m]}/${names[n]} gap ${gap.toFixed(1)} px`);}
// A thumb arc: every other button is 90-210 px from Shoot's centre, ordered Switch → Pass → Through → Sprint going round.
for(const a of ['pass','through','sprint','switchPlayer']){const d=Math.hypot(btn[a].x,btn[a].y);assert.ok(d>=90&&d<=210,`${a} on the arc (${d|0} px)`);}
const ang=a=>(Math.atan2(-btn[a].y,btn[a].x)*180/Math.PI+360)%360;assert.ok(ang('pass')>ang('through')&&ang('through')>ang('sprint')&&ang('sprint')>=90,'round the arc: Pass (left) → Through → Sprint (above)');
// Layout on phones: nothing collides with the stick's rest spot, the coach pill or the meters bar.
const stick=css.match(/--stick:clamp\((\d+)px,calc\(100vh - (\d+)px\),(\d+)px\)/).slice(1).map(Number);
assert.match(block,/\.root \.movement\{left:calc\(20px \+ env\(safe-area-inset-left,0px\)\);bottom:var\(--control-bottom\)/);
assert.match(block,/\.root \.footer>p\{position:absolute;z-index:2;left:calc\(var\(--stick\) \+ 30px [^;]+;right:calc\(var\(--cluster-w\) \+ 24px /,'coach pill sits between the stick and the arc');
assert.match(block,/\.root \.meters\{position:absolute;z-index:2;top:calc\(56px \+ env\(safe-area-inset-top,0px\)\);bottom:auto;left:50%/,'meters: a slim bar under the score');
for(const [Wd,H] of [[667,375],[844,390],[932,430]]){const ring=Math.min(stick[2],Math.max(stick[0],H-stick[1]));
 const clusterLeft=Wd-RIGHT-CW,stickRight=20+ring;assert.ok(clusterLeft-stickRight>=150,`${Wd}x${H}: ${clusterLeft-stickRight} px between stick and buttons for the coach pill`);
 assert.ok(H-BOTTOM-CH>56+20+60,`${Wd}x${H}: the arc top (${H-BOTTOM-CH}) stays well below the header and meters`);}
// Pressed feedback + optional haptic; the old portrait grid stays for tall tablets.
assert.match(css,/\.root \.actions button\[data-pressed\]\{/);assert.match(live,/import \{tapHaptic\} from '@\/lib\/town\/haptics';/);
assert.match(live,/startCharge\(event\.pointerId\)/,'hold-to-charge Shoot unchanged');

// Start card: one tap to play.
const start=live.slice(live.indexOf("{phase==='ready'&&!failed&&<div className={styles.overlay}>"),live.indexOf("{phase!=='playing'&&!outroOn&&(phase!=='ready'||failed)&&"));
assert.ok(start.length>200,'a dedicated start card');
assert.ok(!/<select/.test(start),'no dropdowns: segmented buttons');
assert.ok(!/Fast feet\. Big finishes\./.test(live),'no headline + paragraph');
assert.match(start,/<button className=\{styles\.primary\}[^\n]*?>Kick off<\/button>/,"one big Kick off");
assert.match(start,/aria-expanded=\{optionsOpen\} aria-controls="strikers-options"/,'Options is a disclosure, closed by default');
assert.match(live,/\[optionsOpen,setOptionsOpen\]=useState\(false\)/);
assert.match(start,/className=\{styles\.goals\} aria-label="Star goals"><li>Win<\/li>/,'star goals as three chips');
assert.match(start,/\{firstTime&&<ol className=\{styles\.howTo\}/,'how-to strip only for first-timers');
assert.match(live,/localStorage\.setItem\(HOWTO_SEEN_KEY,'1'\)/,'hidden once they have kicked off');
assert.match(start,/3 coins per match/);assert.match(start,/Leaderboard/);assert.match(start,/disabled=\{!cupOpen\}/,'Island Cup unlock state kept');
assert.match(start,/disabled=\{i\+1>unlocked\}/,'locked rounds stay locked');
assert.match(css,/\.root \.seg>button\{flex:1;min-width:0;display:grid;place-items:center;align-content:center;min-height:48px/,'48 px option targets');
assert.match(css,/\.root \.startRow>\.optionsToggle,\.root \.startRow>\.boards\{[^}]*min-height:48px/);
assert.match(css,/@media\(max-height:500px\) and \(min-width:600px\)\{\.root \.overlay>\.start\[data-options\]\{display:grid;grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\)/,'landscape: Options open beside the card, no scroll');
// The best unlocked round is pre-selected (unchanged), and the shape choice is remembered (unchanged).
assert.match(live,/match\.state\.level=Math\.min\(4,saved\.unlocked\)/);assert.match(live,/saveStrikerShape\(next\)/);
console.log(`strikers-landscape-controls ok (min gap ${minGap.toFixed(1)} px)`);
