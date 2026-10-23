// The phone emote bar (owner, Oct 23 2026): exactly FIVE emotes per page, evenly spaced; swipe or the arrows (one page = five, snapping);
// the left arrow disabled at the start, the right one at the end (scroll position with a small tolerance, on scroll / resize / rotation);
// five or fewer = no arrows. lib/town/emoteBar.ts (stubbed scroll model) + EmoteWheel.tsx / globals.css source checks.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const m={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/town/emoteBar.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math});
const B=m.exports;let n=0;const t=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};
const ten=[0,1,2,3,4,5,6,7,8,9];

t('pages of five: ten = two full pages, six = 5 + 1, five = one page',()=>{
 assert.equal(B.EMOTES_PER_PAGE,5);
 assert.equal(B.emotePages(ten).map(p=>p.join('')).join('|'),'01234|56789');
 assert.equal(B.emotePages([0,1,2,3,4,5]).map(p=>p.length).join(),'5,1');assert.equal(B.emotePages([1,2,3,4,5]).length,1);
});
t('arrows from a stubbed scroll model: left disabled at the start, right disabled at the end, both live in between (2 px tolerance)',()=>{
 const W=300,S={clientWidth:W,scrollWidth:2*W};
 let a=B.arrowState({...S,scrollLeft:0},10);assert.equal(a.single,false);assert.equal(a.left,false,'start: left off');assert.equal(a.right,true);assert.equal(a.page,0);assert.equal(a.pages,2);
 a=B.arrowState({...S,scrollLeft:1.5},10);assert.equal(a.left,false,'within tolerance of the start');
 a=B.arrowState({...S,scrollLeft:150},10);assert.equal(a.left,true);assert.equal(a.right,true,'mid-swipe: both live');
 a=B.arrowState({...S,scrollLeft:W},10);assert.equal(a.left,true);assert.equal(a.right,false,'end: right off');assert.equal(a.page,1);
 a=B.arrowState({...S,scrollLeft:W-1.2},10);assert.equal(a.right,false,'within tolerance of the end (sub-pixel scroll)');
 a=B.arrowState({...S,scrollLeft:W+40},10);assert.equal(a.right,false,'overscroll is clamped');
});
t('five or fewer emotes (fly / swim sets): one page, no arrows; a layout that already fits shows none either',()=>{
 for(const c of [5,4,1]){const a=B.arrowState({scrollLeft:0,clientWidth:300,scrollWidth:300},c);assert.equal(a.single,true);assert.equal(a.left,false);assert.equal(a.right,false);}
 const a=B.arrowState({scrollLeft:0,clientWidth:600,scrollWidth:600},10);assert.equal(a.left||a.right,false,'nothing to scroll: both off');
});
t('an arrow tap scrolls exactly one page (five emotes) and snaps to a page start',()=>{
 const S={clientWidth:300,scrollWidth:600};
 assert.equal(B.arrowTarget({...S,scrollLeft:0},1),300);assert.equal(B.arrowTarget({...S,scrollLeft:300},1),300,'clamped at the end');
 assert.equal(B.arrowTarget({...S,scrollLeft:300},-1),0);assert.equal(B.arrowTarget({...S,scrollLeft:0},-1),0,'clamped at the start');
 assert.equal(B.arrowTarget({...S,scrollLeft:120},1),300,'from mid-swipe to the next page start');assert.equal(B.arrowTarget({scrollLeft:0,clientWidth:0,scrollWidth:0},1),0);
});
t('EmoteWheel: pages of five, aria-disabled arrows that ignore taps, updates on scroll / resize / rotation, no arrows for a single page',()=>{
 const w=read('components/party/EmoteWheel.tsx');
 assert(/emotePages\(list\)/.test(w)&&/className="emote-wheel-page"/.test(w),'pages of five');
 assert(/aria-label="Earlier emotes" aria-disabled=\{!arrows\.left\}/.test(w)&&/aria-label="More emotes" aria-disabled=\{!arrows\.right\}/.test(w),'aria-disabled');
 assert(/if \(dir < 0 \? !arrows\.left : !arrows\.right\) return;/.test(w),'a disabled arrow does nothing');
 assert(/addEventListener\('scroll', sync, \{ passive: true \}\)/.test(w)&&/addEventListener\('resize', onResize\)/.test(w)&&/addEventListener\('orientationchange', onResize\)/.test(w),'scroll, resize and rotation');
 assert(/removeEventListener\('scroll', sync\)/.test(w)&&/removeEventListener\('orientationchange', onResize\)/.test(w),'listeners removed');
 assert(/\{!arrows\.single && <button/.test(w),'one page: no arrows');
 assert(/aria-label=\{x\.label\}/.test(w),'every emote keeps its label');
});
t('CSS: page snapping, five evenly spaced per page on phones (percent margins of the page), 44 px targets, greyed disabled arrows; desktop keeps 5 x 52 px',()=>{
 const c=read('app/globals.css');
 assert(/\.emote-wheel-page\{flex:0 0 100%;display:flex;[^}]*scroll-snap-align:start;scroll-snap-stop:always\}/.test(c),'a page is the strip width and snaps');
 assert(/\.emote-wheel-strip\{display:flex;gap:0;width:calc\(5 \* 52px \+ 4 \* 8px\);overflow-x:auto;scroll-snap-type:x mandatory/.test(c),'desktop: five 52 px buttons in view');
 assert(/\.town-app \.emote-wheel-strip \.emote-wheel-btn\{--eb:max\(44px,[^}]*margin-inline:calc\(\(20% - var\(--eb\)\) \/ 2\)\}/.test(c),'phones: each button centred in a fifth of the page');
 assert(/min-width:44px;min-height:44px;margin-inline/.test(c),'44 px targets');
 assert(/\.emote-wheel-arrow\[data-off\]\{opacity:\.35;filter:grayscale\(1\);cursor:default;pointer-events:none\}/.test(c),'greyed, no tap');
 assert(!/justify-content:space-between\}\.town-app \.emote-wheel-strip \.emote-wheel-btn/.test(c),'the old seven-across spread is gone');
});
console.log('emote-bar-pages: '+n+' tests passed');
