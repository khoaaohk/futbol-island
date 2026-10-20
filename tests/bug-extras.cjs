// Summit bug extras (Oct 20 2026, docs/island-jobs.md §15 "Bug extras"): the saved Bug book, the wild meadow bugs and the bug job
// sounds. Headless:
//  1. the Bug book: 16 pages teaching football, catches recorded across shifts, sanitised, synced (SYNC_KEYS) and tiny inside a
//     full save snapshot (192 KB gzip cap), round-tripped through buildSnapshot / applySnapshot, completion fires once;
//  2. a real shift records its catches in the book (jobScene), and the completion bonus is the once-ever learning id;
//  3. wild bugs: the cap by heat tier (12 / 6 / 0, 0 with reduced motion), half at night, one instanced draw built only near the
//     meadow, disposed when leaving, 15 Hz when far, hidden while a bug job runs, a bug flutters away (counted, one hint a visit);
//  4. the sounds: net, cup, jar, squad and eight distinct firefly chimes registered in islandSound.ts, audible through the master,
//     silent when muted; analytics ids allowlisted with call sites and shown in /admin; the UI wiring.
// usage: node tests/bug-extras.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),zlib=require('node:zlib'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k),get length(){return storage.size;},key:i=>[...storage.keys()][i]??null};
const winEvents=[],docEvents=[];
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
class Ev{constructor(type,o){this.type=type;this.detail=o?.detail;}}
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,TextEncoder,Event:Ev,CustomEvent:Ev,
 window:{addEventListener(){},removeEventListener(){},dispatchEvent:e=>{winEvents.push(e.type);return true;},matchMedia:()=>({matches:false})},localStorage,
 document:{createElement:()=>({width:0,height:0,getContext:()=>ctx}),dispatchEvent:e=>{docEvents.push([e.type,e.detail]);return true;}}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const BB=load('lib/town/jobs/bugBook.ts'),B=load('lib/town/jobs/bugScout.ts'),SN=load('lib/saves/snapshot.ts');

// ---- 1. The Bug book ----
{assert.equal(BB.BUG_BOOK_SIZE,16);assert.equal(BB.BUG_BOOK_PAGES.length,16,'8 bugs + 8 firefly calls');
 for(const p of BB.BUG_BOOK_PAGES){assert(p.name.length>3&&p.role.length>3,'a name and a role');assert(p.lesson.length>40&&!/in the jar/i.test(p.lesson),'the lesson without the catch line: '+p.lesson);}
 for(const role of ['Goalkeeper','Centre-back','Full-back','Midfielder','Winger','Captain','Striker','Referee'])assert(BB.BUG_BOOK_PAGES.some(p=>p.role.startsWith(role)),'a page for the '+role);
 assert(BB.BUG_BOOK_PAGES.some(p=>p.name.includes('Man on!')),'firefly pages are named by their call');
 // Fresh, then a garbage save, then catches across "shifts".
 same(BB.readBugBook(),BB.emptyBugBook());storage.set(BB.BUG_BOOK_KEY,'{"bugs":[1,"x",-4,1e9],"fireflies":"no","reward":"yes","extra":1}');
 same(BB.readBugBook(),{version:1,bugs:[1,0,0,9999,0,0,0,0],fireflies:[0,0,0,0,0,0,0,0],reward:false},'sanitised: counts clamped, junk dropped');
 storage.set(BB.BUG_BOOK_KEY,'not json');same(BB.readBugBook(),BB.emptyBugBook(),'unreadable: an empty book');storage.delete(BB.BUG_BOOK_KEY);
 let r=BB.recordBugCatch('bug',0);assert(r.first&&!r.completed);r=BB.recordBugCatch('bug',0);assert(!r.first,'second catch of the same bug');
 assert.equal(BB.recordBugCatch('bug',8).first,false,'out of range ignored');assert.equal(BB.readBugBook().bugs[0],2,'counted twice, remembered');
 let completed=0;for(let i=0;i<8;i++){if(BB.recordBugCatch('bug',i).completed)completed++;if(BB.recordBugCatch('firefly',i).completed)completed++;}
 assert.equal(completed,1,'the 16th new kind completes the book, once');assert(BB.bugBookComplete(BB.readBugBook()));
 assert.equal(BB.recordBugCatch('firefly',3).completed,false,'never completes twice');
 assert.equal(BB.markBugBookReward().reward,true);
 // Synced and tiny: a full book, worst-case counts, inside a full snapshot under the 192 KB gzip cap, and round-tripped.
 assert(SN.SYNC_KEYS.includes(BB.BUG_BOOK_KEY)&&SN.isSyncKey(BB.BUG_BOOK_KEY),'the book syncs with the save');
 assert(read('docs/accounts-design.md').includes('`fi2-bug-book-v1`'),'documented in the save allowlist doc');
 const worst={version:1,bugs:Array(8).fill(9999),fireflies:Array(8).fill(9999),reward:true};BB.writeBugBook(worst);
 assert(storage.get(BB.BUG_BOOK_KEY).length<140,'the whole book is under 140 bytes: '+storage.get(BB.BUG_BOOK_KEY).length);
 storage.set('fi2-backpack-v1','x'.repeat(40000));// other progress in the save
 const snap=SN.buildSnapshot(localStorage,Date.parse('2026-10-20T10:00:00'));assert.equal(snap.keys[BB.BUG_BOOK_KEY],storage.get(BB.BUG_BOOK_KEY));
 assert(zlib.gzipSync(JSON.stringify(snap)).length<SN.MAX_GZIP_BYTES,'within the gzip cap');
 const before=storage.get(BB.BUG_BOOK_KEY);storage.clear();SN.applySnapshot(localStorage,snap);same(BB.readBugBook(),worst,'restored from the save code: '+before);storage.clear();}

// ---- 2. A real shift fills the book; the bonus is the once-ever learning id ----
{const C=load('lib/town/jobs/jobCatalog.ts'),V=load('lib/town/venues.ts'),floor=(x,z)=>V.fieldSurfaceHeight(x,z),S=load('lib/town/jobs/jobScene.ts'),DT=1/30;
 const api=S.createJobScene(new T.Scene(),{storage:null,now:()=>Date.parse('2026-10-20T10:00:00'),timeOfDay:()=>'day'}),day=C.jobById('bug-scout');
 const at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),frames=(p,s)=>{for(let t=0;t<s-1e-9;t+=DT)api.update(DT,p,null,true,true,false);};
 frames(at(day.board),.5);assert(api.start('bug-scout'));docEvents.length=0;
 for(const i of [0,1]){frames(at(day.targets[i]),2.2);api.act('net');frames(at(day.targets[i]),1);api.act('net:up');}
 same(BB.readBugBook().bugs.slice(0,3),[1,1,0],'two bugs caught on the shift are in the book');
 const cues=docEvents.filter(([n])=>n==='fi2-job-cue').map(([,d])=>d);assert(cues.includes('net')&&cues.includes('jar'),'net and jar cues: '+cues.join(','));
 api.stop?.();api.dispose();
 const reward=read('lib/town/jobs/bugBookReward.ts');assert.match(reward,/learnCoins\.pay\('book',BUG_BOOK_REWARD_ID/,'the bonus is learn:book:bug-book (creditOnce, once ever)');
 assert.match(read('lib/town/jobs/jobScene.ts'),/recordBugCatch\(def\.prop,i\)\.completed\)\{countBugBookComplete\(\);cue\(BUG_BOOK_COMPLETE_EVENT/);
 storage.clear();}

// ---- 3. Wild bugs (since Bug flight: the island's bug swarm, lib/graphics/bugSwarm.ts; details in tests/bug-flight.cjs) ----
{const W=load('lib/graphics/wildBugsCore.ts'),SI=load('lib/town/summitIsle.ts');
 same([0,1,2,3,4].map(tier=>W.wildBugCount({tier,reduced:false,night:false})),[12,10,8,0,0],'12 / 10 / 8 by heat tier (pickBugsOnMap caps), none hot or on Battery saver (tier 4)');
 same([0,1,3].map(tier=>W.wildBugCount({tier,reduced:false,night:true})),[8,6,0],'fireflies at night');
 assert.equal(W.wildBugCount({tier:0,reduced:true,night:false}),0,'none with reduced motion');
 const {createWildBugs}=load('lib/graphics/wildBugs.ts'),scene=new T.Scene(),wb=createWildBugs(scene,()=>0,99);
 const step=(o,n=1)=>{for(let i=0;i<n;i++)wb.update({dt:1/60,night:false,tier:0,reduced:false,busy:false,...o});};
 const C=SI.SUMMIT_CENTER;
 step({x:0,z:0},5);assert.equal(wb.set,null,'nothing built far away (main island)');assert.equal(scene.children.length,0);
 const off={x:C.x+200,z:C.z};step(off);assert.equal(wb.count,12,'12 bugs out when nearing Summit Isle');assert.equal(scene.children.length,1);
 const far=wb.far;assert(far.isInstancedMesh&&far.boundingSphere,'one far-silhouette draw with a fixed bound');
 assert(far.geometry.getAttribute('color'),'vertex colours, no textures');assert(!far.material.map);
 const f0=wb.farSteps;step(off,60);assert(wb.farSteps-f0>=13&&wb.farSteps-f0<=17,'15 Hz for bugs not close: '+(wb.farSteps-f0));
 step({...off,tier:1});assert.equal(wb.count,10,'heat tier 1: rebuilt with 10');step({...off,tier:3});assert.equal(wb.set,null,'tier 3: disposed');assert.equal(scene.children.length,0);
 step({...off,busy:true});assert.equal(wb.root.visible,false,'hidden while a bug job runs');step(off);assert.equal(wb.root.visible,true);
 step({x:C.x+270,z:C.z});assert(wb.set,'kept between BUILD_M and DROP_M (hysteresis)');step({x:C.x+300,z:C.z});assert.equal(wb.set,null,'disposed after leaving');
 wb.dispose();assert.equal(scene.children.length,0);
 const town=read('components/Town.tsx');assert.match(town,/wildBugs\.update\(\{dt:[^}]*tier:heat\.tier,reduced,busy:!!jobs\.run\}\)/,'Town drives it with the heat tier and the job');assert.match(town,/wildBugs\.dispo/);}

// ---- 4. Sounds, analytics, UI ----
{let now=0;const param=()=>({value:1,setValueAtTime(v){this.value=v},linearRampToValueAtTime(v){this.value=v},exponentialRampToValueAtTime(v){this.value=v},cancelScheduledValues(){},setTargetAtTime(v){this.value=v}});
 const node=()=>({gain:param(),frequency:param(),Q:param(),connect(){},disconnect(){}});const started=[];
 class AudioContext{constructor(){this.state='running';this.currentTime=0;this.sampleRate=100;this.destination={};}createOscillator(){return {...node(),type:'sine',start(){started.push(this)},stop(){}}}createGain(){return node()}createBiquadFilter(){return node()}
  createBuffer(ch,n){return {getChannelData:()=>new Float32Array(n)}}createBufferSource(){return {...node(),start(){started.push(this)},stop(){}}}resume(){return Promise.resolve()}suspend(){this.state='suspended';return Promise.resolve()}close(){return Promise.resolve()}}
 const make=muted=>{const docL=new Map(),g={window:{AudioContext,location:{pathname:'/'},addEventListener(){},removeEventListener(){}},document:{hidden:false,addEventListener:(k,f)=>docL.set(k,f),removeEventListener:k=>docL.delete(k)},navigator:{},performance:{now:()=>now},setTimeout:()=>0,clearTimeout(){},Audio:class{},CustomEvent:Ev};
  const m={exports:{}};vm.runInNewContext(ts.transpileModule(read('lib/audio/islandSound.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:()=>({}),Math,Map,Set,Number,Promise,String,...g});
  const s=m.exports.createIslandSound(muted,.5);s.unlock();return {s,fire:d=>docL.get('fi2-job-cue')({type:'fi2-job-cue',detail:d}),HZ:m.exports.FIREFLY_CHIME_HZ};};
 const {s,fire,HZ}=make(false);const kinds=['net','cup','jar','squad',...Array.from({length:8},(_,i)=>`firefly-${i}`)],freqs=[];
 for(const k of kinds){const n0=started.length;now+=1000;fire(k);assert(started.length>n0,`cue ${k} plays`);assert.equal(s.debug.counts['job:'+k],1,`cue ${k} counted`);if(k.startsWith('firefly-'))freqs.push(started[n0].frequency.value);}
 assert.equal(new Set(freqs).size,8,'eight distinct firefly chimes: '+freqs.join(','));assert.equal(HZ.length,8);
 const muted=make(true);now+=1000;muted.fire('squad');assert.equal(muted.s.debug.muted,true,'muted: the master stays at 0 (counted, not heard)');
 const scene=read('lib/town/jobs/jobScene.ts');for(const c of ["'net'","'cup'","'jar'","'squad'","`firefly-${i}`"])assert(scene.includes(c),'jobScene sends '+c);
 const CID=load('lib/analytics/countIds.ts'),ev=read('lib/analytics/summitEvents.ts'),admin=read('app/admin/SummitKitSection.tsx');
 for(const id of ['su:bugbook_open','su:bugbook_complete','su:wild_flutter']){assert(CID.isCountId(id),'allowlisted '+id);assert(ev.includes(`'${id}'`),'call site '+id);assert(admin.includes(`'${id}'`),'in /admin '+id);}
 assert.match(read('components/BugBook.tsx'),/countBugBookOpen\(\)/);assert.match(read('lib/graphics/bugSwarm.ts'),/countWildFlutter\(\)/);
 const jobsUi=read('components/IslandJobs.tsx');assert.match(jobsUi,/data-job-bugbook/);assert.match(jobsUi,/addEventListener\(OPEN_BUG_BOOK/);assert.match(jobsUi,/addEventListener\(WILD_BUG_HINT/);}
console.log('PASS bug extras: the Bug book (16 pages, saved and synced, tiny, completes once with a once-ever bonus), wild bugs (the island bug swarm, 12/10/8/0 by heat tier, near Summit Isle only), and the net / jar / firefly chime / squad sounds');
function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
})().catch(e=>{console.error(e);process.exit(1);});
