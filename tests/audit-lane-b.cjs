// Bug audit (Deploy 11, Sep 30 2026), lane B regressions: vending/drink face parallax (B1), Konbini effect keys (B6), the pop-up
// book's "Take it to your game" card (B11), graduation focus restore (B12), Ferry exam dots (B13), About "Story music" heading
// (B16), the phone vending face's header/LED fit (B18) and the muted Konbini browser scripts. Welcome back (B14) is covered in
// tests/new-player-flow.cjs, the parent-gate cooldown (B17) in tests/parent-gate.cjs. usage: node tests/audit-lane-b.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');

// B1: one placement for both machine kinds, and it carries the parallax shifts and the widen correction.
{
 const vend=read('components/VendingMachine.tsx'),drink=read('components/DrinkMachine.tsx');
 assert.match(vend,/export function facePlacement\(/,'shared placement helper');
 const helper=vend.slice(vend.indexOf('export function facePlacement('),vend.indexOf('export default function VendingMachine('));
 assert.match(helper,/shifts:depth\?machines\?\.\(\)\?\.productShift\?\.\(machineId\)\?\?\[\]:\[\]/,'shifts come from productShift when in depth');
 assert.match(helper,/widen:/,'widen is part of the placement');
 assert.match(vend,/useMemo\(\(\)=>facePlacement\(quad,machines,machineId\)/,'the shop machine uses it');
 assert.match(drink,/useMemo\(\(\)=>facePlacement\(quad,machines,machine\.id\)/,'the drink machine uses it too');
 assert.doesNotMatch(drink,/faceDepthMatrix\(|quadMatrix\(/,'no private placement copy left in DrinkMachine');
 // The helper's maths, run for real: shifts only with a depth matrix, widen clamped to [1, 1.25].
 const src=helper.replace(/^export /,'');
 const out=ts.transpileModule(`${src}\nmodule.exports={facePlacement};`,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const FACE_SIZE={w:1,h:2},m={exports:{}};let depth=null;
 vm.runInNewContext(out,{module:m,exports:m.exports,Math,Boolean,FACE_SIZE,faceDepthMatrix:()=>depth,quadMatrix:()=>'flat'});
 const quad=[{x:0,y:0},{x:100,y:0},{x:100,y:400},{x:0,y:400}],shift=[.05,.06,.07];
 const machines=()=>({productShift:id=>id==='drinksplaza'?shift:[]});
 let p=m.exports.facePlacement(quad,machines,'drinksplaza');assert.equal(p.depth,false);assert.equal(JSON.stringify(p.shifts),'[]','no depth: no shift');assert.equal(p.transform,'flat');
 depth='matrix3d(1)';p=m.exports.facePlacement(quad,machines,'drinksplaza');assert.equal(JSON.stringify(p.shifts),JSON.stringify(shift),'drinks get the parallax shifts');assert.equal(p.widen,1.25,'foreshortened face widens, clamped');
 assert.equal(m.exports.facePlacement(null,machines,'drinksplaza'),null);
 // VendingFace turns each shift into the slot's --shift-x (fraction × face width).
 assert.match(read('components/VendingFace.tsx'),/'--shift-x':`\$\{\(\(v\.placement\.shifts\?\.\[index\]\?\?0\)\*v\.placement\.w\)\.toFixed\(1\)\}px`/);
}

// B6: Konbini one-shot effects get monotonic, prefixed keys (the coin burst and the receipt are siblings).
{
 const k=read('components/KonbiniRoom.tsx');
 assert.doesNotMatch(k,/key:Date\.now\(\)/,'no Date.now() effect keys');
 assert.match(k,/let fxKey=0;\nconst nextFxKey=\(\)=>\+\+fxKey;/,'a monotonic counter');
 assert.equal((k.match(/key:nextFxKey\(\)/g)||[]).length,4,'coins, both receipts and the streak use it');
 for(const pre of ['receipt-','coins-','streak-'])assert(k.includes(`key={'${pre}'+`),pre+' key is prefixed');
}

// Hygiene: the Konbini browser checks never play sound on the user's speakers.
for(const f of ['scripts/check-konbini-browser.cjs','scripts/check-konbini-taps.cjs']){
 const s=read(f);
 assert.match(s,/chromium\.launch\(\{[^}]*args:\[[^\]]*'--mute-audio'/,f+' launches with --mute-audio');
 assert.doesNotMatch(s,/'fi2-sound-muted','false'|'fi2-music-enabled':'true'|'fi2-sound-muted':'false'/,f+' never turns sound on');
 for(const [key,v] of [['fi2-audio-mix','4-50-v1'],['fi2-sound-muted','true'],['fi2-music-enabled','false'],['fi2-voice-enabled','false']])assert(s.includes(`'${key}':'${v}'`),`${f} seeds ${key}=${v}`);
}

// B11: the book's Escape and Tab trap are scoped to the "Take it to your game" card while it is open; focus moves in and back.
{
 const b=read('components/PlayerPopUpBook.tsx'),c=read('components/BookGameCheck.tsx');
 assert.match(b,/const check=root\.current\?\.querySelector<HTMLElement>\('\[data-book-check\]'\)\?\?null,trap=check\?\?root\.current;/);
 assert.match(b,/if\(e\.key==='Escape'&&check\)\{e\.preventDefault\(\);e\.stopPropagation\(\);check\.querySelector<HTMLButtonElement>\('\[data-book-check-close\]'\)\?\.click\(\);return;\}/,'Escape closes only the card');
 assert(b.indexOf("e.key==='Escape'&&check")<b.indexOf("close.current?.click()"),'the card is checked before the book closes');
 assert.match(b,/trap\?\.querySelectorAll<HTMLElement>\(/,'Tab cycles inside the card');
 assert.match(b,/\[data-story-playback-bar\],\[data-book-check\]'\)\)\)return;/,'arrow keys in the card do not turn pages');
 assert.match(c,/data-book-check-close/,'the card close button is findable');
 assert.match(c,/if\(open\)\{wasOpen\.current=true;card\.current\?\.querySelector<HTMLElement>\('button:not\(\[disabled\]\)'\)\?\.focus/,'focus moves into the card');
 assert.match(c,/opener\.current\?\.focus\(/,'and back to its opener on close');
}

// B12: GraduationHost keeps EndgameDialog mounted and closes it through `open`, so its restore-focus branch runs.
{
 const g=read('components/GraduationHost.tsx'),d=read('components/EndgameDialog.tsx');
 assert.doesNotMatch(g,/if\(!showing\)return null;/,'no unmount while the dialog is open');
 assert.match(g,/<EndgameDialog open=\{showing\} /);
 assert.match(d,/else if\(!open&&el\.open\)\{el\.close\(\);restore\.current\?\.focus\(/,'closing restores focus');
 assert.match(d,/\{open&&children\}/,'the ceremony code still loads only while open');
 // Simulate EndgameDialog's effect on a fake <dialog>: open from a trigger, then close via open=false.
 let active='trigger';const trigger={focus:()=>{active='trigger';}},close={focus:()=>{active='close';}};
 const el={open:false,showModal(){this.open=true;},close(){this.open=false;}};const restore={current:null};
 const run=open=>{if(open&&!el.open){restore.current=trigger;el.showModal();close.focus();}else if(!open&&el.open){el.close();restore.current?.focus();}};
 run(true);assert.equal(active,'close');run(false);assert.equal(active,'trigger','focus is back on the trigger');
}

// B13: the next Ferry round starts at question 0, so the loading card shows round×2 done dots.
{
 const f=read('components/MatchdayFinale.tsx');
 assert.match(f,/else if\(round\+1<GRADUATION_FORMATS\.length\)\{setRound\(round\+1\);setIndex\(0\);setAnswer\(null\);\}/);
 assert.match(f,/const done=round\*EXAM_PER_FORMAT\+index;/);
}

// B16: "Story music" stays a level-3 heading (accordion pattern), toggled by a button with aria-expanded.
{
 const s=read('components/IslandSettings.tsx');
 assert.doesNotMatch(s,/<summary><h3/,'no heading inside <summary>');
 assert.match(s,/<h3 id="story-music-credit"><button type="button" aria-expanded=\{musicOpen\} aria-controls="story-music-credit-body"/);
 assert.match(s,/<div id="story-music-credit-body" hidden=\{!musicOpen\}>/);
}

// B18: on phone-width faces the shelf header and LED fit (smaller type for long text, never below 12 px), no clipped copy.
{
 const f=read('components/VendingFace.tsx'),css=read('components/VendingFace.module.css');
 assert.match(f,/data-long-title=/,'long shelf titles are flagged');
 assert.match(css,/\.face\[data-narrow\] \.ledMsg\{[^}]*-webkit-line-clamp:2/,'narrow faces let the LED message wrap to two lines');
 for(const m of css.matchAll(/font-size:max\((\d+)px/g))assert(Number(m[1])>=12,'never below 12 px');
}
console.log('PASS audit lane B: drink parallax shifts, Konbini keys, muted Konbini scripts, book card Escape/Tab, graduation focus, Ferry dots, Story music heading, phone vending header/LED');
