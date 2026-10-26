// Back closes the open sheet (QA audit Oct 25 2026, docs/QA_AUDIT_OCT25.md #5): on the island the phone's back button closes the
// topmost dialog (Escape keydown, or `cancel` on a native modal <dialog>) and keeps the guard entry; with nothing open it leaves
// exactly as before. Browser check: /private scratch s10-back.cjs (Settings, Paths, pocket drawer each closed by back; bare back leaves).
// Run: node tests/back-closes.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../lib/town/backCloses.ts'),'utf8');
const town=fs.readFileSync(path.join(__dirname,'../components/Town.tsx'),'utf8');
assert.equal((town.match(/installBackCloses\(\)/g)||[]).length,1,'Town installs the back guard once');
assert.match(town,/import \{installBackCloses,registerBackCloser\} from '@\/lib\/town\/backCloses'/);
assert(!/setTimeout|setInterval|requestAnimationFrame/.test(src.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'')),'no timers or polling');

// Fake window / history / dialogs.
class Ev{constructor(type,o={}){this.type=type;this.key=o.key;this.cancelable=!!o.cancelable;this.defaultPrevented=false;}preventDefault(){if(this.cancelable)this.defaultPrevented=true;}}
class El{constructor(name,{native=false,modal=true,onKey,onCancel}={}){this.name=name;this.native=native;this.modal=modal;this.open=true;this.onKey=onKey;this.onCancel=onCancel;this.isConnected=true;}
 getBoundingClientRect(){return this.open?{width:300,height:400}:{width:0,height:0};}closest(){return null;}contains(x){return x===this;}
 matches(sel){if(sel===':modal')return this.native&&this.modal&&this.open;return false;}
 close(){this.open=false;}
 dispatchEvent(e){if(e.type==='keydown'&&this.onKey)this.onKey(e,this);if(e.type==='cancel'&&this.onCancel)this.onCancel(e,this);return !e.defaultPrevented;}}
class Dlg extends El{}
const dialogs=[];
const doc={activeElement:null,querySelectorAll:()=>dialogs.filter(d=>d.open)};
const entries=[{__NA:true}];let index=0;const handlers={};
const history={get state(){return entries[index];},pushState(s){entries.splice(index+1);entries.push(s);index++;},back(){if(index>0){index--;(handlers.popstate||[]).forEach(h=>h({state:entries[index]}));}},get length(){return entries.length;}};
const win={location:{get href(){return entries[index].url||'/';}},document:doc,history,addEventListener:(t,h)=>(handlers[t]=handlers[t]||[]).push(h),removeEventListener:(t,h)=>{handlers[t]=(handlers[t]||[]).filter(x=>x!==h);}};
const ctx={KeyboardEvent:Ev,Event:Ev,HTMLDialogElement:Dlg,getComputedStyle:()=>({visibility:'visible',display:'block'}),window:win};
const m={exports:{}};vm.runInNewContext(ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{...ctx,module:m,exports:m.exports});
const B=m.exports;

const dispose=B.installBackCloses(win);
assert.equal(B.installBackCloses(win),dispose,'second install is a no-op (StrictMode remount)');
assert.equal(entries.length,2,'one guard entry pushed');assert.equal(entries[1].__NA,true,'guard keeps the router state');assert.equal(entries[1][B.BACK_GUARD_KEY],1);

// 1. A React sheet that closes on Escape keydown.
const sheet=new El('settings',{onKey:(e,d)=>{if(e.key==='Escape')d.open=false;}});dialogs.push(sheet);
history.back();
assert.equal(sheet.open,false,'back closes the sheet');assert.equal(index,1,'still on the island, guard back on top');assert.equal(entries.length,2);

// 2. A native modal <dialog> that animates shut from onCancel (the pocket drawer).
let animating=false;const pocket=new Dlg('pocket',{native:true,onCancel:(e)=>{e.preventDefault();animating=true;}});dialogs.push(pocket);
history.back();
assert.equal(animating,true,'cancel reached the drawer');assert.equal(pocket.open,true,'drawer closes itself (prevented the native close)');assert.equal(index,1);
pocket.open=false;
// 3. A native modal <dialog> with no cancel handler: closed like a real Escape.
const plain=new Dlg('plain',{native:true});dialogs.push(plain);history.back();assert.equal(plain.open,false,'plain modal dialog closed');assert.equal(index,1);
// 4. Two open: only the topmost closes.
const under=new El('under',{onKey:(e,d)=>{d.open=false;}}),over=new El('over',{onKey:(e,d)=>{d.open=false;}});dialogs.push(under,over);
history.back();assert.equal(over.open,false);assert.equal(under.open,true,'only the topmost sheet closes');
under.open=false;
// 5. A sheet that ignores Escape keeps the island (no trap: it has its own Done) and the guard stays.
const stubborn=new El('stubborn');dialogs.push(stubborn);history.back();assert.equal(stubborn.open,true);assert.equal(index,1,'guard back on');
stubborn.open=false;
// 5b. Non-dialog states (Oct 26 2026, owner): the minimap, a lesson, fishing register closers; back closes the newest first, a
// dialog still goes before any of them, and an unregistered state no longer catches back.
const closed=[];const offMap=B.registerBackCloser(()=>closed.push('minimap')),offLesson=B.registerBackCloser(()=>closed.push('lesson'));
const offFish=B.registerBackCloser(()=>{closed.push('fishing');offFish();});
assert.equal(B.backCloserCount(),3);
const over2=new El('over2',{onKey:(e,d)=>{d.open=false;}});dialogs.push(over2);
history.back();assert.equal(over2.open,false,'a dialog closes before any state');assert.deepEqual(closed,[]);assert.equal(index,1);
history.back();assert.deepEqual(closed,['fishing'],'newest state first (fishing)');assert.equal(index,1,'guard back on');
history.back();assert.deepEqual(closed,['fishing','lesson']);offLesson();
history.back();assert.deepEqual(closed,['fishing','lesson','minimap']);offMap();assert.equal(B.backCloserCount(),0);
offMap();assert.equal(B.backCloserCount(),0,'unregister twice is harmless');
// Wiring: Town registers the pitch lesson, the coach lesson and the phone minimap; FishingHost registers live fishing.
const fishing=fs.readFileSync(path.join(__dirname,'../components/FishingHost.tsx'),'utf8');
assert.ok(town.includes('fieldOpen?registerBackCloser(')&&town.includes('coachLessonOpen?registerBackCloser(')&&town.includes('registerBackCloser(()=>setMinimapCollapsed(true))'),'Town registers lesson + minimap closers');
assert.ok(fishing.includes('view.active?registerBackCloser(()=>fishingSession.stop())'),'fishing stops on back');
// 6. Nothing open: back leaves as before (past the guard and the island's own entry).
entries.unshift({prev:true});index++;
history.back();
assert.equal(index,0,'bare back carries on to the previous page');
// 7. A popped entry for another URL (soft navigation from another page) is never chained further back.
entries.splice(0,entries.length,{url:'/arcade'},{__NA:true});index=1;history.pushState({__NA:true,[B.BACK_GUARD_KEY]:1});
history.back();assert.equal(index,0,'bare back from the island lands on /arcade');assert.equal(entries[0].url,'/arcade');
dispose();assert.equal((handlers.popstate||[]).length,0,'dispose removes the listener');
console.log('back-closes ok');
