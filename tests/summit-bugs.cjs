// Summit Isle's Bug squad, catching lane (Oct 20 2026): one job (bugs by Day / Sunset, fireflies at Night) catching FROM THE island's
// bug swarm with real net swings, the catch zoom + story card, the squad of 20 + formation release, the Bug book by species id, rides
// (never flying; caught on foot), the hint, and the end rules (only the water or leaving the island). usage: node tests/summit-bugs.cjs
// usage: node tests/summit-bugs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const storage=new Map(),localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
const cache=new Map(),gradient={addColorStop(){}},docEl={attrs:new Set(),toggleAttribute(n,on){if(on)this.attrs.add(n);else this.attrs.delete(n);}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage,document:{documentElement:docEl,createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const B=load('lib/town/jobs/bugScout.ts'),C=load('lib/town/jobs/jobCatalog.ts'),E=load('lib/town/jobs/jobEconomy.ts'),M=load('lib/town/jobs/jobMoves.ts'),R=load('lib/town/jobs/jobRules.ts');
const K=load('lib/town/jobs/bugCatch.ts'),BB=load('lib/town/jobs/bugBook.ts'),SP=load('lib/town/jobs/bugSpecies.ts'),NET=load('lib/town/jobs/bugNet.ts'),JP=load('lib/graphics/jobPoses.ts');
const SI=load('lib/town/summitIsle.ts'),V=load('lib/town/venues.ts'),floor=(x,z)=>V.fieldSurfaceHeight(x,z);
const day=C.jobVariant('bug-scout','bugs'),night=C.jobVariant('bug-scout','fireflies');

// ---- 1. One job, two sets, the 20 realistic species and the 8 fireflies ----
{assert(day&&night);assert.equal(C.JOBS.filter(j=>j.id==='bug-scout').length,1,'one catalog entry');assert.equal(C.jobById('firefly-floodlights')?.id,'bug-scout');
 same(['day','sunset','night'].map(B.activeSet),['bugs','bugs','fireflies']);assert.equal(C.jobVariant('bug-scout','night'),night,'memoised');
 assert.equal(B.bugRoster('bugs').length,20,'a roster of 20');assert.equal(B.bugRoster('fireflies').length,8,'8 fireflies');
 same(B.bugRoster('bugs').map(b=>b.id),SP.BUG_SPECIES.map(b=>b.id),'the roster is the species table');
 const groups=SP.BUG_SPECIES.reduce((o,b)=>(o[b.role.group]=(o[b.role.group]??0)+1,o),{});assert.equal(groups.starter,11,'11 starters');assert(groups.sub>0&&groups.staff>0,'subs and staff');
 for(const job of [day,night]){assert(job.swing,'catches with net swings');assert.equal(job.work.target[0].mode,'tap','a swing, not a hold');assert(job.deliver&&job.work.deliver);
  for(const b of B.bugRoster(job.set)){assert(b.stories.length>=1,'every species has a real football story: '+b.id);assert(b.name&&b.role&&b.note.length>30);}
  for(const t of job.targets){const h=t;assert(SI.onSummitIsle(h.x,h.z)||SP.onSummitSand(h.x,h.z),'homes on Summit Isle');}}
 for(const h of SP.BUG_HOMES)assert(SP.bugHomeAllowed(h),'none on the north end except beaches: '+h.id);
 assert.equal(K.shiftGoal('bugs',12),6);assert.equal(K.shiftGoal('fireflies',4),4,'fewer out (heat) = fewer to catch');}

// ---- 2. Swing rules: a bigger sweep, generous auto-aim and tap range (named constants) ----
{assert(K.NET_SWEEP_RADIUS>=1.8*K.NET_BASE_REACH,'the sweep is about 2x the first lane reach (2.2 m after the Oct 21 pull-in)');assert(K.AUTO_AIM_HALF_ANGLE>=Math.PI/3,'a wide auto-aim cone');
 assert(K.TAP_RANGE>=K.AUTO_AIM_RANGE&&K.TAP_RANGE<=K.LUNGE_MAX+K.NET_SWEEP_RADIUS*K.LOCKED_SLACK,'a tapped bug is always within the lunge');
 const hit=(id,x,z,y=1)=>({id,x,y,z});
 assert.equal(K.autoAim([hit('a',0,3),hit('b',0,-2)].sort((p,q)=>Math.hypot(p.x,p.z)-Math.hypot(q.x,q.z)),0,0,0)?.id,'a','the nearest IN FRONT, not the one behind');
 assert.equal(K.autoAim([hit('a',3,1)],0,0,0)?.id,'a','a wide cone (72 degrees off the facing)');assert.equal(K.autoAim([hit('a',0,9)],0,0,0),null,'out of range');
 const c=K.sweepCentre(0,0,0,0,{x:0,y:0,z:0});assert(K.inSweep(c,hit('a',1.2,3,2)),'3.5 m round the sweep centre');assert(!K.inSweep(c,hit('a',0,5)),'too far');
 assert(K.inSweep(c,hit('a',0,3.7),true)&&!K.inSweep(c,hit('a',0,3.7)),'Net down reaches further');
 assert.equal(K.swingResult([hit('a',0,4)],c,'a')?.id,'a','a locked target gets slack');assert.equal(K.swingResult([hit('a',0,4)],c,null),null,'unlocked: a miss');
 // The swing timeline and the 20-bug formation.
 same(['windup','sweep','sweep','recover','done'].map((ph,i)=>K.swingPhase([.1,.4,K.SWING.hit,1,1.3][i]).phase),['windup','sweep','sweep','recover','done']);
 same(K.FORMATION_CAP,[20,14,11]);const ord=K.formationOrder();assert.equal(ord.length,20);assert.equal(new Set(ord).size,20);assert.equal(ord[0],'ladybug','the goalkeeper first');
 assert.equal(K.formationSlots(20).length,20);
 assert.equal(K.storyFor([{text:'a'},{text:'b'}],1).text,'a');assert.equal(K.storyFor([{text:'a'},{text:'b'}],2).text,'b','rotates on repeat catches');assert.equal(K.storyFor([{text:'a'},{text:'b'}],3).text,'a');
 // Rides: scooter / bike / moped allowed on the Bug squad, never the jetpack; other jobs stay on foot.
 same(['walk','scooter','bike','moped','jetpack'].map(m=>M.rideAllowed(m,true,'bug-scout')),[true,true,true,true,false]);same(['bike','walk'].map(m=>M.rideAllowed(m,true,'leaf-rake')),[false,true]);
 same(['walk','bike'].map(r=>K.netCarryMode({ride:r,stalk:false,swinging:false,raised:false})),['carry','pack'],'riding: strapped to the backpack');
 assert.equal(K.netCarryMode({ride:'walk',stalk:true,swinging:false,raised:false}),'low');
 // Hint: the nearest uncaught (live first, then homes), all caught = none.
 const homes=[{id:'x',x:100,z:0},{id:'y',x:10,z:0}];
 assert.equal(K.nearestUncaught([{id:'a',x:5,z:0},{id:'b',x:2,z:0}],h=>h.id,homes,id=>id==='b',0,0).id,'a','skips the caught');
 assert.equal(K.nearestUncaught([],h=>h.id,homes,()=>false,0,0).id,'y','not out: the nearest home');assert.equal(K.nearestUncaught([],h=>h.id,homes,()=>true,0,0),null,'all caught');}

// ---- 3. The Bug book: 20 + 8 pages by species id, migration from the old index format, size cap ----
{const port=()=>{let v=null;return {get:()=>v,set:x=>{v=x;}};};
 assert.equal(BB.BUG_BOOK_PAGES.length,28,'20 bug pages + 8 firefly pages');assert(BB.BUG_BOOK_PAGES.every(p=>p.id&&p.stories.length),'keyed by id, with stories');
 const old={version:1,bugs:[2,0,1,0,3,0,0,1],fireflies:[0,1,0,0,0,0,0,4],reward:false};const v2=BB.sanitizeBugBook(old);
 same([v2.version,v2.bugs.ladybug,v2.bugs.grasshopper,v2.bugs.swallowtail,v2.bugs.bumblebee,v2.fireflies.time,v2.fireflies.mine],[2,2,1,3,1,1,4],'old index order maps to species ids');
 same(v2.squad.sort(),['bumblebee','grasshopper','ladybug','swallowtail'],'old catches start the squad');
 same(BB.sanitizeBugBook(JSON.parse(JSON.stringify(v2))),v2,'round-trips');
 const p=port();let r=BB.recordBugCatch('bug','ladybug',p);assert(r.first&&r.squadNew&&r.count===1);r=BB.recordBugCatch('bug','ladybug',p);assert(!r.first&&!r.squadNew&&r.count===2,'once per squad');
 assert.equal(BB.recordBugCatch('bug','nope',p).count,0,'unknown ids ignored');
 let done=0,squad=0;for(const id of BB.BUG_IDS){const x=BB.recordBugCatch('bug',id,p);if(x.completed)done++;if(x.squadComplete)squad++;}
 assert.equal(done,1,'the 20th species completes the book once');assert.equal(squad,1,'and the squad');const s=BB.readBugBook(p);same([s.squad.length,s.squads],[0,1],'a new squad starts');
 for(const id of BB.FIREFLY_IDS)BB.recordBugCatch('firefly',id,p);assert(BB.nightBookComplete(BB.readBugBook(p)));
 const worst={version:2,bugs:Object.fromEntries(BB.BUG_IDS.map(i=>[i,9999])),fireflies:Object.fromEntries(BB.FIREFLY_IDS.map(i=>[i,9999])),squad:BB.BUG_IDS.slice(0,19),squads:9999,reward:true,nightReward:true};
 assert(JSON.stringify(BB.sanitizeBugBook(worst)).length<1100,'the whole book stays tiny: '+JSON.stringify(worst).length);}

// ---- 4. A shift on the real job scene, catching from a (fake) swarm ----
function fakeSwarm(list){const bugs=list.map(b=>({...b,hidden:false}));let pinned=null;
 return {bugs,reseeds:[],startled:[],caught:[],
  query(x,y,z,r){return bugs.filter(b=>!b.hidden&&b!==pinned&&Math.hypot(b.x-x,b.y-y,b.z-z)<=r).map(b=>({id:b.id,kind:b.kind,species:b.kind==='bug'?{id:b.id}:null,call:b.kind==='firefly'?{id:b.id}:null,x:b.x,y:b.y,z:b.z,dist:Math.hypot(b.x-x,b.y-y,b.z-z)})).sort((a,b)=>a.dist-b.dist);},
  startle(id){this.startled.push(id);return true;},catch(id){const b=bugs.find(q=>q.id===id);if(b){b.hidden=true;this.caught.push(id);}return b;},
  pin(id){pinned=id?bugs.find(q=>q.id===id):null;return true;},reseed(s){this.reseeds.push(s);},
  position(id,out){const b=bugs.find(q=>q.id===id);if(!b||b.hidden)return null;out.x=b.x;out.y=b.y;out.z=b.z;return out;}};}
const S=load('lib/town/jobs/jobScene.ts'),DT=1/30;let tod='day',reduced=false,tier=0;const book=new Map(),store={getItem:k=>book.get(k)??null,setItem:(k,v)=>book.set(k,v)};
let swarm=null;const api=S.createJobScene(new T.Scene(),{storage:store,now:()=>Date.parse('2026-10-20T10:00:00'),timeOfDay:()=>tod,bugs:()=>swarm,tier:()=>tier});
const cam=new T.PerspectiveCamera(50,1.6,.1,500);
// The catch stage's ports (Town.tsx): a stand-in rig (hands either side of the chest), a counting renderer, the island scene.
const world=new T.Scene(),rigRoot=new T.Object3D();world.add(rigRoot);let stageRenders=0,stageClock=0;
api.setStagePorts({player:{root:rigRoot,update(x,z){rigRoot.position.x=x;rigRoot.position.z=z;rigRoot.updateMatrixWorld(true);},handPositions(l,r){l.set(rigRoot.position.x-.15,rigRoot.position.y+1.1,rigRoot.position.z+.3);r.set(rigRoot.position.x+.1,rigRoot.position.y+.95,rigRoot.position.z+.15);}},
 renderer:{render(){stageRenders++;},domElement:{clientWidth:800,clientHeight:500,width:800,height:500}},scene:world,host:()=>null});
const at=q=>({x:q.x,y:floor(q.x,q.z),z:q.z}),frames=(p,s,water=false)=>{for(let t=0;t<s-1e-9;t+=DT){stageClock+=DT;if(api.staging){api.stageFrame(DT,stageClock);continue;}api.setPlayer(0,ride,water);api.update(DT,p,null,true,true,reduced);cam.position.set(p.x,p.y+12,p.z-18);cam.lookAt(p.x,p.y,p.z);api.applyCamera(cam,DT,reduced);}};
let ride='walk';
// Bugs placed round a test spot on the meadow, the player facing +z (yaw 0).
const P0=at({x:SP.BUG_HOMES[0].x,z:SP.BUG_HOMES[0].z}),ids=B.bugRoster('bugs').map(b=>b.id);
const put=(id,dx,dz,dy=1)=>({id,kind:'bug',x:P0.x+dx,y:P0.y+dy,z:P0.z+dz});
{swarm=fakeSwarm([put(ids[0],0,2),put(ids[1],.5,-5),put(ids[2],3,3.5),put(ids[3],-1,2.5),put(ids[4],0,3),put(ids[5],1,2),put(ids[6],-.5,2),put(ids[7],60,60)]);
 frames(at(day.board),.4);assert.equal(api.start('bug-scout'),true);assert(swarm.reseeds.length===1,'a per-shift seed for the swarm');
 assert.equal(api.swarmJob,'bugs','the swarm shows the job set (not hidden)');assert.equal(api.run.goal,6,'catch 6 this shift (12 out at tier 0)');
 const props=api.root.getObjectByName('job-props-bug-scout');assert(!props.children.some(o=>o.isInstancedMesh&&o.count===20),'no job-owned bug meshes');
 const net=props.getObjectByName('job-net');assert(net&&net.getObjectByName('job-net-bag')&&net.getObjectByName('job-net-frame'),'the new net: frame + mesh bag');
 const hoop=api.net;assert(NET.NET_HOOP_RADIUS>=.42,'a hoop twice as wide as the old 0.21 m');
 assert.equal(api.getView().active.squad.total,20,'the pill counts the squad of 20');
 const btn=api.getView().active.buttons;same(btn.map(b=>[b.slot,b.key,b.id]),[['shoot','Space','net'],['juggle','J','letfree'],['ride','R','ride'],['extra','E','netlow']]);assert(btn[0].enabled&&btn[2].enabled);
 // A swing at a bug right in front: hit → zoom (controls held) → into the jar, the story card, the book.
 // The catch stage (Oct 21 2026): a swing that will connect pushes in on the character, then the whole swing and catch play on the
 // sealed stage (the island not drawn), the catch counting at the stage's hit frame.
 frames(P0,.1);const r0=stageRenders;api.act('net');assert(!api.swinging&&api.zooming,'a swing that connects plays as the catch stage');assert.equal(api.locked,true);assert(docEl.attrs.has('data-catch-stage'),'the HUD hides for the catch');assert.equal(api.walkScale,0);
 frames(P0,.3);assert(!api.staging&&Math.hypot(cam.position.x-P0.x,cam.position.z-(P0.z-18))>1,'first the camera pushes in on the character');
 frames(P0,.4);assert(api.staging,'then the stage');assert.equal(rigRoot.parent?.name,'catch-stage','the rig is on the stage');assert(!api.getView().caught,'not counted before the hit frame');
 frames(P0,.3);assert(stageRenders>r0,'the stage renders instead of the island');frames(P0,.7);
 const c0=api.getView().caught;assert(c0&&c0.id===ids[0]&&c0.story.length>20&&c0.isNew&&c0.coins===K.NEW_SPECIES_COINS,'the story card: name, story, NEW, +coin');
 assert.equal(api.run.got[0],true,'caught from the swarm');assert(api.zooming,'the card waits for the card phase');
 frames(P0,3.6);assert(!api.zooming&&!api.locked&&!api.staging,'stage over');assert.equal(rigRoot.parent,world,'the rig is back on the island');assert(!docEl.attrs.has('data-catch-stage'),'and comes back after');assert(swarm.caught.includes(ids[0]),'the swarm bug went into the jar');
 assert.equal(JSON.parse(book.get(BB.BUG_BOOK_KEY)).bugs[ids[0]],1,'in the Bug book by id');frames(P0,1.5);assert.equal(cam.fov,50,'camera back');
 // Tap skip.
 api.act('net');frames(P0,.8);assert(api.staging);api.skipZoom();assert(!api.zooming,'tap skips to the card');frames(P0,.7);assert(!api.locked&&!api.staging&&rigRoot.parent===world,'and back');frames(P0,1);
 // A miss: nothing within auto-aim range (8 m, all round) → the nearest bug (9 m behind) startles.
 swarm.bugs.forEach(b=>{if(!b.hidden&&b.id!==ids[1])b.hidden=true;if(b.id===ids[1])b.z=P0.z-9;});frames(P0,.1);api.act('net');frames(P0,.7);assert(!api.zooming,'a miss');assert(swarm.startled.includes(ids[1]),'the bug behind startles');
 assert.match(api.getView().active.note,/missed/i);assert(!/missed/i.test(api.getView().active.hint),'notes are a toast, not the pill');
 // Tap near a bug on screen swings at it (even 5 m away: the lunge).
 frames(P0,.7);swarm.bugs.forEach(b=>{b.hidden=b.id!==ids[2];});const b2=swarm.bugs.find(b=>b.id===ids[2]);cam.updateMatrixWorld();const v=new T.Vector3(b2.x,b2.y,b2.z).project(cam);
 assert.equal(api.tapSwing(v.x+.05,v.y,cam),true,'tap near the bug swings');frames(P0,.7);assert(api.zooming,'and catches it');api.skipZoom();frames(P0,.7);assert(!api.staging);
 // Riding: no swing (bugs are caught on foot), the button reads Hop off; the net rides on the backpack.
 ride='bike';frames(P0,.2);swarm.bugs.forEach(b=>{b.hidden=b.id!==ids[3];});api.act('net');assert(!api.swinging,'no swing from a bike');
 assert.equal(api.getView().active.buttons[0].label,'Hop off');ride='walk';frames(P0,.2);
 // The hint: nearest uncaught, cooldown.
 swarm.bugs.forEach(b=>{b.hidden=true;});frames(at(day.board),.1);const exp=K.nearestUncaught([],h=>h.id,B.bugRoster('bugs'),id=>api.run.got[ids.indexOf(id)],day.board.x,day.board.z);
 assert.equal(api.hint(),true);assert.equal(api.hinting.name,SP.bugSpeciesById(exp.id).name,'no bug out: the nearest home of an uncaught species');assert(api.root.getObjectByName('bug-hint-arrow').visible);assert.equal(api.hint(),false,'cooling down');
 // The shift never ends on the trail, slopes, beaches or far from the sign; only in the water or off the island.
 for(const h of [...SP.BUG_HOMES,...SP.FIREFLY_HOMES])frames(at(h),.05);assert(api.run,'walked to every bug home: still on shift');
 const got=api.run.got.filter(Boolean).length;assert.equal(got,3);
 frames(P0,.1,true);assert.equal(api.run,null,'stepping into the water ends it');assert.match(api.getView().ended.text,/water/);
 assert.equal(JSON.parse(book.get(BB.BUG_BOOK_KEY)).squad.length,3,'progress kept');
 // Off the island another way (zipline, ferry): ends too.
 api.start('bug-scout');frames(at({x:SI.SUMMIT_CENTER.x+400,z:SI.SUMMIT_CENTER.z}),.1);assert.equal(api.run,null);assert.match(api.getView().ended.text,/left Summit Isle/);
 // A full shift: catch the goal, Release at the hotel (regression: Release always works), payday.
 swarm=fakeSwarm(ids.slice(3,9).map((id,i)=>put(id,0,2)));frames(at(day.board),.2);api.start('bug-scout');
 for(let i=0;i<6;i++){api.act('net');frames(P0,.7);api.skipZoom();frames(P0,.7);}
 assert.equal(api.run.phase,'deliver','the jar is full: off to the bug hotel');assert.match(api.disabledHint('letfree'),/bug hotel/);
 const d=day.deliver,pd=at({x:d.x+2,z:d.z});frames(pd,.3);assert.equal(api.getView().active.buttons[1].enabled,true);api.act('letfree');assert.equal(api.getView().releasing,true);
 frames(pd,6);assert(api.getView().done&&api.getView().done.id==='bug-scout','payday after the release');assert.equal(api.locked,false);api.dismissDone();
 // Squad completion: the 20th species → the formation release with 20 (tier 0) or 11 (tier 2).
 const bk=JSON.parse(book.get(BB.BUG_BOOK_KEY));bk.squad=ids.slice(0,19);book.set(BB.BUG_BOOK_KEY,JSON.stringify(bk));
 tier=2;swarm=fakeSwarm([put(ids[19],0,2)]);frames(at(day.board),.2);api.start('bug-scout');api.act('net');frames(P0,.7);assert.equal(api.getView().caught.squadComplete,true,'squad complete');api.skipZoom();
 api.run.got=api.run.got.map(()=>true);api.run.phase='deliver';frames(pd,.3);api.act('letfree');const fl=api.root.getObjectByName('bug-release-flyers');assert.equal(fl.count,11,'formation capped at tier 2');
 frames(pd,8);assert(api.getView().done);api.dismissDone();tier=0;
 // Night: the same job catches fireflies.
 tod='night';swarm=fakeSwarm([{id:'man-on',kind:'firefly',x:P0.x,y:P0.y+1,z:P0.z+2}]);frames(at(day.board),.3);api.start('bug-scout');assert.equal(api.run.def.set,'fireflies');assert.equal(api.swarmJob,'fireflies');
 api.act('jar');frames(P0,.7);assert.equal(api.getView().caught.kind,'firefly');assert.equal(api.getView().caught.story.length>20,true,'a story per call');api.skipZoom();
 // Day breaks mid-shift: the set swaps, the shift goes on.
 tod='day';frames(P0,.4);assert.equal(api.run.def.set,'bugs');api.quit();
 // Reduced motion: no zoom, caught at once.
 tod='day';reduced=true;swarm=fakeSwarm([put(ids[5],0,2)]);api.start('bug-scout');frames(P0,.05);api.act('net');frames(P0,.7);assert(!api.zooming&&swarm.caught.includes(ids[5]),'reduced motion: no zoom');reduced=false;
 api.quit();assert.equal(api.locked,false);api.dispose();}

// ---- 5. Net in both hands, poses, pay, analytics, wiring ----
{const net=NET.createBugNet(x=>x,false),o={x:0,y:0,z:0},dd={x:0,y:0,z:0},dist=(h)=>{const vx=h.x-o.x,vy=h.y-o.y,vz=h.z-o.z,t=vx*dd.x+vy*dd.y+vz*dd.z;return Math.hypot(vx-t*dd.x,vy-t*dd.y,vz-t*dd.z);};
 for(const [mode,l,r] of [['carry',{x:.1,y:1,z:.2},{x:-.2,y:1.35,z:.05}],['low',{x:0,y:.9,z:.45},{x:-.1,y:1,z:.15}],['swing',{x:.05,y:1.1,z:.35},{x:-.15,y:1.15,z:.1}]]){
  net.layout(l,r,0,mode==='swing'?.2:-1,mode,1/60,false);net.poleLine(o,dd);for(const h of [l,r])assert(dist(h)<.1,`${mode}: both hands on the pole (${dist(h).toFixed(3)} m)`);}
 // Riding (bug-polish): the pole rests on the backpack's side socket (its world matrix; pack axes = rig axes, +z into the body),
 // tilted back by the ride's poleTilt, the strap point on the socket, the hoop behind and above.
 {const sock=new T.Matrix4().makeTranslation(.25,1.16,-.3);net.pack(sock,0,.55,1/60,false);net.poleLine(o,dd);
  const sx=o.x+dd.x*NET.NET_PACK.strap,sy=o.y+dd.y*NET.NET_PACK.strap,sz=o.z+dd.z*NET.NET_PACK.strap;
  assert(Math.hypot(sx-.25-NET.NET_PACK.out,sy-1.16,sz+.3)<.01,'riding: the pole rests on the backpack side socket');
  assert(dd.z<0&&dd.y>0&&Math.abs(Math.acos(dd.y)-.55)<.01,'riding: tilted back by the ride tilt');
  const hc={x:0,y:0,z:0};net.hoopCentre(hc);assert(hc.z<-.5&&hc.y>1.9,'riding: the hoop rides behind and above');}
 for(const kind of ['netswing','netcatch']){assert(M.POSE_TIME[kind]>0);let prev=null;for(let k=0;k<=1;k+=.02){const t=JP.jobPoseTarget({kind,progress:k},0,false),v=[t.py,t.tx,t.ty,...t.al,...t.ar];if(prev)assert(v.every((x,i)=>Math.abs(x-prev[i])<.5),`${kind}: continuous at ${k.toFixed(2)}`);prev=v;}}
 for(const kind of ['netcarry','netsneak'])assert(M.UPPER_POSES.has(kind),'the legs keep walking: '+kind);
 const run=R.startRun(day,1);assert.equal(M.heldPose(run,0,0).kind,'netcarry');run.stalk=true;assert.equal(M.heldPose(run,0,0).kind,'netsneak');
 assert.equal(M.poseForEvent(day,{type:'swing',x:1,z:1}).kind,'netswing');assert.equal(M.poseForEvent(day,{type:'netcatch',x:1,z:1}).kind,'netcatch');
 // Oct 21 2026: at Night the tool is the firefly jar: Cup (jarcup), the jar held up (jarcatch), carried in both hands (jarcarry /
 // jarsneak); the button reads Cup the jar with the cup icon, Net down reads Jar low; the catch reach is the net's (same rules).
 {const nr=R.startRun(night,1);assert.equal(M.heldPose(nr,0,0).kind,'jarcarry');nr.stalk=true;assert.equal(M.heldPose(nr,0,0).kind,'jarsneak');
  assert.equal(M.poseForEvent(night,{type:'swing',x:1,z:1}).kind,'jarcup');assert.equal(M.poseForEvent(night,{type:'netcatch',x:1,z:1}).kind,'jarcatch');
  assert(M.POSE_TIME.jarcup===M.POSE_TIME.netswing&&M.UPPER_POSES.has('jarcarry')&&M.UPPER_POSES.has('jarsneak'),'the jar poses time like the net');
  const nb=M.jobButtons(R.startRun(night,1)),cupB=nb.find(b=>b.id==='jar');assert(cupB&&cupB.label==='Cup the jar'&&cupB.icon==='cup','Cup the jar, cup icon');
  assert(nb.some(b=>b.label==='Jar low'),'Jar low (the stalk) at night');assert(/Cup/.test(night.howTo)&&!/Swing net/.test(night.intro+night.howTo),'night copy says Cup, not Swing net');
  for(let k=0;k<=1;k+=.05){const t=JP.jobPoseTarget({kind:'jarcup',progress:k},0,false);assert([t.py,t.tx,t.ty,...t.al].every(Number.isFinite),'jarcup finite');}
  assert(/createBugJar/.test(read('lib/town/jobs/jobScene.ts'))&&/def\.prop==='firefly'\?createBugJar/.test(read('lib/town/jobs/jobScene.ts')),'the shift builds the jar at night');
  assert(/cup:'/.test(read('components/TravelIcon.tsx'))&&/jar:'Cup'/.test(read('components/JobActionButton.tsx')),'Cup icon and word');}
 assert.equal(E.JOB_BASE_PAY['bug-scout'],5,'pay unchanged');let l=E.emptyJobLedger('2026-10-20');const p=[];for(let i=0;i<4;i++){const x=E.jobPayout('bug-scout',l);p.push(x.coins);l=E.recordCompletion(l,'bug-scout',x.coins,60);}same(p,[9,5,3,3]);
 const CID=load('lib/analytics/countIds.ts'),ev=read('lib/analytics/summitEvents.ts'),admin=read('app/admin/SummitKitSection.tsx');
 for(const id of ['su:bug_catch','su:bug_squad','su:firefly_catch','su:firefly_shift','su:bug_swing','su:bug_miss','su:bug_story','su:bug_hint']){assert(CID.isCountId(id),'allowlisted '+id);assert(ev.includes(`'${id}'`),'call site '+id);assert(admin.includes(`'${id}'`),'in /admin '+id);}
 const town=read('components/Town.tsx');assert.match(town,/createJobScene\(scene,\{timeOfDay:\(\)=>timeRef\.current,bugs:\(\)=>wildBugs,tier:\(\)=>heat\.tier\}\)/,'the job catches from the swarm');
 assert.match(town,/busy:!!jobs\.run&&!jobs\.swarmJob,job:jobs\.swarmJob/,'the swarm stays visible during the shift');assert.match(town,/jobs\.tapSwing\(/);assert.match(town,/jobs\.setPlayer\(player\.root\.rotation\.y,rideRef\.current,water\.inWater\)/);
 const ij=read('components/IslandJobs.tsx');assert.match(ij,/Real football fact/);assert.match(ij,/aria-label=\{a\.set==='fireflies'\?'Show nearest firefly':'Show nearest bug'\}/);assert.match(ij,/skipZoom/);assert.match(ij,/onClick=\{e=>\{if\(e\.detail===0\)runtime\?\.skipRelease\(\);\}\}/,'the Release tap\'s trailing click never skips');}
console.log('PASS summit bugs: 20 species + 8 fireflies caught from the swarm with real net swings (2x sweep, auto-aim, tap, lunge), catch zoom + story card, squad of 20 with the formation release, book by id with migration, rides (no flying, catch on foot), hint, ends only in the water or off the island, pay unchanged');
function same(a,b,m){assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),m);}
})().catch(e=>{console.error(e);process.exit(1);});
