// HUD focus rule (Oct 16 2026): a mouse/touch press on a HUD button must not leave keyboard focus on it, or the next Space opens
// that button's menu instead of kicking. Keyboard users (Tab) keep focus and still activate buttons with Space / Enter.
// Run: node tests/hud-focus.cjs   (browser check: see the report in the Oct 16 fix; Playwright clicks ride / settings, then Space kicks)
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../lib/town/hudFocus.ts'),'utf8');
const town=fs.readFileSync(path.join(__dirname,'../components/Town.tsx'),'utf8');
// Wired exactly once, from Town, and not re-implemented per button.
assert.equal((town.match(/installHudFocusRule\(\)/g)||[]).length,1,'Town installs the HUD focus rule once');
assert.match(town,/import \{installHudFocusRule\} from '@\/lib\/town\/hudFocus'/);
for(const f of fs.readdirSync(path.join(__dirname,'../components')).filter(f=>/\.tsx$/.test(f)&&f!=='Town.tsx'))
 assert(!fs.readFileSync(path.join(__dirname,'../components',f),'utf8').includes('installHudFocusRule('),f+' must not install a second rule');
assert.match(src,/e\.detail === 0\) return/,'keyboard activations (detail 0) keep focus');
assert.match(src,/e\.key === 'Tab'\) modality = 'keyboard'/,'Tab switches to keyboard modality');
// Behaviour with a fake document.
const m={exports:{}},ctx={module:m,exports:m.exports};vm.runInNewContext(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,ctx);
const H=m.exports;
const timers=[];class El{constructor(name,kinds){this.name=name;this.kinds=new Set(kinds);}closest(sel){const parts=sel.split(',');
 if(parts.includes('button'))return this.kinds.has('button')?this:null;if(sel===H.HUD_FOCUS_ROOT)return this.kinds.has('hud')?{}:null;return this.kinds.has('keep')?{}:null;}
 blur(){if(doc.activeElement===this)doc.activeElement=null;}focus(){doc.activeElement=this;fire('focusin',{target:this});}}
const handlers={};const fire=(type,e)=>(handlers[type]||[]).forEach(h=>h(e));const flush=()=>{while(timers.length)timers.shift()();};
const win={setTimeout:f=>timers.push(f)};const doc={activeElement:null,defaultView:win,addEventListener:(t,h)=>(handlers[t]=handlers[t]||[]).push(h),removeEventListener:(t,h)=>{handlers[t]=handlers[t].filter(x=>x!==h);}};
ctx.Element=El;
const ride=new El('ride',['button','hud']),done=new El('done',['button','hud','keep']),outside=new El('page',['button']);
const dispose=H.installHudFocusRule(doc);assert.equal(H.installHudFocusRule(doc),dispose,'second install is a no-op');
const pointerClick=el=>{fire('pointerdown',{target:el});el.focus();fire('pointerup',{target:el});fire('click',{target:el,detail:1});flush();};
pointerClick(ride);assert.equal(doc.activeElement,null,'mouse click on a HUD button drops its focus');
pointerClick(done);assert.equal(doc.activeElement,done,'controls in a dialog keep focus');
pointerClick(outside);assert.equal(doc.activeElement,outside,'buttons outside the island HUD are untouched');
// A panel opened by mouse restores focus to its opener on close: dropped too.
fire('pointerdown',{target:ride});fire('pointerup',{target:ride});ride.focus();flush();assert.equal(doc.activeElement,null,'scripted focus restore after a pointer press is dropped');
// Keyboard: Tab to the ride button, Space/Enter (click detail 0) keep focus there.
fire('keydown',{key:'Tab'});ride.focus();flush();assert.equal(doc.activeElement,ride,'Tab focus is kept');
fire('click',{target:ride,detail:0});flush();assert.equal(doc.activeElement,ride,'keyboard activation keeps focus');
dispose();assert(Object.values(handlers).every(a=>a.length===0),'dispose removes every listener');
console.log('hud-focus: ok');
