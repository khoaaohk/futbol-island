// Summit Isle fruit trees (Oct 13 2026, user: "for the mountain island, let's have the trees have fruit on some of them for the
// character to forage and collect … shake the tree to have it drop to pick up"). Covers: the fruit trees exist, are spread out and
// reachable on foot (not inside colliders, on walkable ground, connected to the sandbar landing); a shake drops 1–3 fruit that fall,
// bounce and rest; pickups go into the market basket; the regrow clock and the daily cap; nothing runs at rest (no rAF, no timers,
// no instance writes); dispose. Rules: lib/town/summitForage.ts; runtime: lib/graphics/fruitTrees.ts. usage: node tests/summit-forage.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');
const timers={raf:0,timeout:0,interval:0},winListeners=new Map();
const fakeWindow={addEventListener:(t,fn)=>{if(!winListeners.has(t))winListeners.set(t,new Set());winListeners.get(t).add(fn);},removeEventListener:(t,fn)=>winListeners.get(t)?.delete(fn),
 requestAnimationFrame:()=>{timers.raf++;return 1;},setTimeout:()=>{timers.timeout++;return 1;},setInterval:()=>{timers.interval++;return 1;}};
const cache=new Map();
function load(file){
 file=path.isAbsolute(file)?file:path.resolve(ROOT,file);
 if(cache.has(file))return cache.get(file).exports;
 const mod={exports:{}};cache.set(file,mod);
 if(file.endsWith('.json'))return mod.exports=JSON.parse(fs.readFileSync(file,'utf8'));
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
 vm.runInNewContext(code,{exports:mod.exports,module:mod,Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,console,Date,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
  window:fakeWindow,requestAnimationFrame:fakeWindow.requestAnimationFrame,setTimeout:fakeWindow.setTimeout,setInterval:fakeWindow.setInterval,navigator:undefined,document:undefined,
  require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return id==='react'?{useSyncExternalStore:(_s,get)=>get()}:require(id);
   const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.js',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
 return mod.exports;
}
const T=require('three');
const S=load('lib/town/summitIsle.ts'),W=load('lib/town/summitIsleWorld.ts'),F=load('lib/town/summitForage.ts'),Sim=load('lib/town/simulation.ts');
const RT=load('lib/graphics/fruitTrees.ts'),goods=load('lib/town/market/goods.ts'),pocket=load('lib/town/market/pocket.ts');

// ---- Build the island (stub tools, like tests/summit-isle.cjs) to get its trees, palms and colliders.
const town=new T.Group(),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
const tools={box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
 sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles:[],assets:[],surfaceAreas:[]};
W.buildSummitIsle(tools);
const sites=W.SUMMIT_TREE_SITES.map(s=>({...s,top:{...s.top}}));
assert(sites.some(s=>s.kind==='tree')&&sites.some(s=>s.kind==='palm'),'the build lists its trees and palms (SUMMIT_TREE_SITES)');
const obstacles=tools.obstacles,blockedAt=(x,z)=>Sim.blocked(x,z,obstacles,.32),ground=(x,z)=>S.summitGround(x,z)-S.SUMMIT_VISUAL_DROP;

// ---- 1. The fruit trees: 8–12, mango/orange trees on the lower slopes and coconut palms on the beach, spread out.
const world={walkable:S.onSummitIsle,blocked:blockedAt,ground,paths:S.SUMMIT_PATHS,landing:S.SUMMIT_LANDMARKS.sandbarLanding,beach:(x,z)=>S.beachPoint(Math.atan2(z-S.SUMMIT_CENTER.z,x-S.SUMMIT_CENTER.x),.5),view:(x,z,y)=>S.summitCameraPull(x,z,y,x+F.FOLLOW_CAMERA.x,y+F.FOLLOW_CAMERA.y,z+F.FOLLOW_CAMERA.z)};
const picks=F.pickFruitTrees(sites,world);
assert(picks.length>=8&&picks.length<=12,`8–12 fruit trees (${picks.length})`);
assert.deepEqual(F.pickFruitTrees(sites,world).map(t=>t.id),picks.map(t=>t.id),'deterministic: the same trees on every device');
const kinds=new Set(picks.map(t=>t.fruit));for(const k of ['mango','orange','coconut'])assert(kinds.has(k),'grows '+k);
for(const t of picks){
 assert(goods.goodById(t.fruit)&&pocket.pocketCategory(goods.goodById(t.fruit))==='fruit',`${t.fruit} is a basket good in the Fruit pocket`);
 if(t.fruit==='coconut')assert(t.kind==='palm'&&t.y<1,'coconut palms stand on the beach');else assert(t.kind==='tree'&&t.y<=18,`${t.id} is on the lower slopes (${t.y.toFixed(1)} m)`);
 assert(S.onSummitIsle(t.x,t.z),`${t.id} roots on walkable Summit Isle ground (not a cliff)`);
 assert(world.view(t.stand.x,t.stand.z,ground(t.stand.x,t.stand.z))>=F.MIN_VIEW,`${t.id}: the follow camera sees it (not pulled in against the hill)`);
 assert(S.onSummitIsle(t.stand.x,t.stand.z)&&!blockedAt(t.stand.x,t.stand.z),`${t.id}: its stand spot is walkable and clear of every collider`);
 assert(Math.abs(Math.hypot(t.stand.x-t.x,t.stand.z-t.z)-F.FORAGE.standOff)<1e-6,'the stand spot is an arm’s length from the trunk');
 const others=obstacles.filter(o=>Sim.insideObstacle(t.x,t.z,o,0));assert.equal(others.length,1,`${t.id}: only its own trunk collider is there`);
 for(const u of picks)if(u!==t)assert(Math.hypot(u.x-t.x,u.z-t.z)>=F.FORAGE.spacing,`${t.id} and ${u.id} are spread out`);}
const L=S.SUMMIT_LANDMARKS.sandbarLanding,nearest=Math.min(...picks.map(t=>Math.hypot(t.x-L.x,t.z-L.z)));
assert(nearest<60,`a fruit tree near the sandbar landing for a first-time visitor (${nearest.toFixed(0)} m)`);

// Reachable on foot: a 1 m walk grid (walkable ground, clear of colliders) flood-filled from the sandbar landing reaches every stand.
{const B=S.SUMMIT_BOX,x0=Math.floor(B.minX),z0=Math.floor(B.minZ),nx=Math.ceil(B.maxX-x0)+1,nz=Math.ceil(B.maxZ-z0)+1;
 const cell=new Map();for(const o of obstacles){const r=Math.max(o.w,o.d)/2+1;for(let x=Math.floor(o.x-r);x<=Math.ceil(o.x+r);x++)for(let z=Math.floor(o.z-r);z<=Math.ceil(o.z+r);z++){const k=x*4096+z;if(!cell.has(k))cell.set(k,[]);cell.get(k).push(o);}}
 const free=(x,z)=>S.onSummitIsle(x,z)&&!(cell.get(Math.round(x)*4096+Math.round(z))??[]).some(o=>Sim.insideObstacle(x,z,o,.32));
 const seen=new Uint8Array(nx*nz),queue=[];let sx=Math.round(L.x),sz=Math.round(L.z);
 for(let r=0;r<6&&!free(sx,sz);r++){sx+=1;}
 assert(free(sx,sz),'the landing is walkable');queue.push((sx-x0)*nz+(sz-z0));seen[queue[0]]=1;
 const cache2=new Int8Array(nx*nz);const ok=(i,j)=>{const k=i*nz+j;if(!cache2[k])cache2[k]=free(x0+i,z0+j)?1:-1;return cache2[k]>0;};
 for(let h=0;h<queue.length;h++){const c=queue[h],i=Math.floor(c/nz),j=c%nz;
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz)continue;const k=a*nz+b;if(seen[k]||!ok(a,b))continue;
   if(di&&dj&&!(ok(i+di,j)||ok(i,j+dj)))continue;seen[k]=1;queue.push(k);}}
 for(const t of picks){let reached=false;for(let dx=-1;dx<=1&&!reached;dx++)for(let dz=-1;dz<=1&&!reached;dz++){const i=Math.round(t.stand.x)+dx-x0,j=Math.round(t.stand.z)+dz-z0;if(i>=0&&j>=0&&i<nx&&j<nz&&seen[i*nz+j])reached=true;}
  assert(reached,`${t.id} can be walked to from the sandbar landing`);}}

// ---- 2. Pure rules: drop count, regrow clock, daily cap, save sanitising.
{const R=F.FORAGE;
 for(let r=0;r<1;r+=.05){const n=F.dropCount(r,3,99);assert(n>=1&&n<=3,'a shake drops 1–3');}
 assert.equal(F.dropCount(.99,1,99),1,'never more than hang there');assert.equal(F.dropCount(.99,3,2),2,'never past today’s cap');assert.equal(F.dropCount(.5,3,0),0,'none once the cap is reached');
 const t0=Date.UTC(2026,9,13,10,0,0);let s=F.emptyForage(t0);const id='tree-593-45';
 assert.equal(F.hangingNow(s,id,t0),R.perTree,'a tree starts full');
 s=F.recordPick(s,id,t0);s=F.recordPick(s,id,t0+1000);assert.equal(F.hangingNow(s,id,t0+1000),R.perTree-2);assert.equal(s.today,2);
 assert.equal(F.hangingNow(s,id,t0+R.regrowMs-1),R.perTree-2,'nothing regrows early');assert.equal(F.hangingNow(s,id,t0+R.regrowMs),R.perTree-1,'one fruit back after one regrow period');
 assert.equal(F.nextRegrowAt(s,id,t0+5),t0+R.regrowMs);
 // Picking mid-regrow keeps the clock's progress.
 const mid=t0+R.regrowMs*1.5;s=F.recordPick(s,id,mid);assert.equal(F.hangingNow(s,id,mid),R.perTree-2);assert.equal(F.hangingNow(s,id,t0+R.regrowMs*2),R.perTree-1,'the half-grown fruit still arrives on time');
 assert.equal(F.hangingNow(s,id,t0+R.regrowMs*4),R.perTree,'full again after an hour or so');
 assert(R.regrowMs>=10*60e3&&R.dailyCap>=5&&R.dailyCap<=12,'regrows over real minutes; a sensible daily cap');
 // The cap vs the economy: a day's forage at full price stays inside the market's daily full-price allowance.
 const best=Math.max(...['mango','orange','coconut'].map(g=>goods.goodById(g).price));const M=load('lib/town/market/market.ts');
 assert(R.dailyCap*best<=M.MARKET_FULL_PRICE_COINS,`a day's fruit (${R.dailyCap*best} coins) fits in the market's full-price allowance`);
 let c=F.emptyForage(t0);for(let i=0;i<R.dailyCap;i++)c=F.recordPick(c,'palm-569-27',t0+i);assert.equal(F.capLeft(c,t0+10),0,'cap reached');
 assert.equal(F.capLeft(c,t0+864e5),R.dailyCap,'a new day, a new allowance');assert.equal(F.recordPick(c,'palm-569-27',t0+864e5).today,1);
 const dirty=F.sanitizeForage({version:1,day:F.localForageDay(t0),today:99,tip:'yes',trees:{'tree-1-2':{n:9,t:t0},'__proto__':{n:1,t:1},'bad':{n:1,t:1},'palm-3-4':{n:1,t:t0+9e9}}},t0);
 assert.equal(dirty.today,R.dailyCap);assert.equal(dirty.tip,false);assert.deepEqual(Object.keys(dirty.trees).sort(),['palm-3-4','tree-1-2']);assert.equal(dirty.trees['tree-1-2'].n,R.perTree);assert.equal(dirty.trees['palm-3-4'].t,t0,'no future clocks');
 assert.deepEqual(F.sanitizeForage('nonsense',t0),F.emptyForage(t0));}

// ---- 3. The runtime: prompt, shake, fall + bounce, pickups into the basket, regrow, cap, forget, idle, dispose.
function rig(opts={}){
 const store=new Map(opts.store??[]),calls={pose:[],gather:[],cue:[]};let clock=opts.now??Date.UTC(2026,9,13,10,0,0),seed=7;
 const scene=new T.Scene();
 const f=RT.createSummitForage(scene,{obstacles,sites:()=>sites,budgetMs:opts.budgetMs??Infinity,pose:p=>calls.pose.push(p),gather:id=>{if(opts.full)return 0;calls.gather.push(id);return 1;},cue:k=>calls.cue.push(k),
  now:()=>clock,random:()=>{seed=(seed*16807)%2147483647;return seed/2147483647;},read:()=>store.get(F.FORAGE_SAVE_KEY)??null,write:v=>store.set(F.FORAGE_SAVE_KEY,v)});
 const el={hidden:true,placed:0},camera=new T.PerspectiveCamera(50,390/844,.1,500);
 const ctx=(x,z,extra={})=>({dt:1/60,x,z,onFoot:true,canEnter:true,frozen:false,reduced:!!opts.reduced,camera,width:390,height:844,focusKey:'forage',ui:()=>el,place:()=>{el.placed++;},hide:(e,h)=>{e.hidden=h;},...extra});
 const aim=(x,z)=>{camera.position.set(x+18,ground(x,z)+23,z+30);camera.lookAt(x,ground(x,z),z);camera.updateMatrixWorld();};
 return {f,scene,store,calls,el,ctx,aim,tick:ms=>{clock+=ms;},get now(){return clock;}};
}
{const r=rig(),f=r.f;
 // Off the island: nothing is built, one box test a frame.
 assert.equal(f.update(r.ctx(103,-8)),null);assert.equal(f.stats.built,false,'built only near Summit Isle');assert.equal(r.scene.children.length,0);
 const t=picks[0];r.aim(t.stand.x,t.stand.z);
 const want=f.update(r.ctx(t.stand.x,t.stand.z));assert(want&&want.key==='forage'&&want.distance<F.FORAGE.reach,'walking up to a fruit tree offers the prompt');
 assert.equal(r.el.hidden,false,'"Shake the tree" shows');assert.match(F.forageStore.get().label,/^Shake the (mango tree|orange tree|coconut palm)$/);
 const view0=f.view(),tree0=view0.trees.find(x=>x.id===t.id);assert.equal(tree0.hanging,F.FORAGE.perTree,'a full tree hangs '+F.FORAGE.perTree);
 const fruitMesh=f.root.children.find(o=>o.isInstancedMesh&&o.name==='summit-fruit');
 assert(fruitMesh&&fruitMesh.count===picks.length*F.FORAGE.perTree,'ALL the island’s fruit is one instanced mesh');assert.equal(fruitMesh.castShadow,false);
 assert(fruitMesh.boundingSphere&&fruitMesh.boundingSphere.center.x>400,'a fixed bounding sphere over Summit Isle (culled off screen, never stretched to the origin)');
 // Shake.
 assert.equal(f.shake(),true,'tap: shake');assert.equal(JSON.stringify(r.calls.pose),JSON.stringify([{x:t.x,z:t.z}]),'the character steps to the trunk and pushes (jobMoves treeshake)');
 assert.equal(f.shake(),false,'one shake at a time');
 let sawSway=false,sawFall=false,maxBounces=0,dropped=0;
 for(let i=0;i<60*3;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));if(f.root.children.some(o=>o.name==='summit-fruit-tree-sway'))sawSway=true;const v=f.view();
  if(v.fallen.some(q=>q.mode==='fall'))sawFall=true;for(const q of v.fallen)maxBounces=Math.max(maxBounces,q.bounces);dropped=Math.max(dropped,v.fallen.length);}
 assert(sawSway,'the canopy sways while it is shaken');assert(sawFall,'fruit falls');assert.equal(r.calls.cue.filter(k=>k==='rustle').length,load('lib/graphics/jobPoses.ts').TREE_SHAKE_PUSHES.length,'a rustle on each push');
 assert(f.stats.dropped>=1&&f.stats.dropped<=3,`1–3 fruit drop (${f.stats.dropped})`);assert(r.calls.cue.includes('thud'),'a thud as fruit lands');assert(maxBounces>=1,'it bounces');
 // Settle; whatever lands within reach is picked up by itself; walk over the rest.
 for(let i=0;i<60*3;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));}
 for(const q of f.view().fallen)assert.equal(q.mode,'ground','the fruit comes to rest on the ground');
 for(const q of f.view().fallen)assert(Math.abs(q.y-ground(q.x,q.z))<.4&&S.onSummitIsle(q.x,q.z),'resting on walkable ground, not floating or sunk');
 for(let guard=0;f.view().fallen.length&&guard<20;guard++){const q=f.view().fallen[0];for(let i=0;i<40;i++){r.tick(1000/60);f.update(r.ctx(q.x+.3,q.z));}}
 assert.equal(f.view().fallen.length,0,'every fallen fruit picked up');
 assert.equal(r.calls.gather.length,f.stats.dropped,'each pickup = +1 in the basket');for(const g of r.calls.gather)assert.equal(g,t.fruit);
 assert(r.calls.cue.includes('pick'),'a pickup sound');
 const save=JSON.parse(r.store.get(F.FORAGE_SAVE_KEY));assert.equal(save.today,f.stats.dropped,'saved: today’s count');assert.equal(save.tip,true,'the first-time tip shown once');
 assert.equal(f.view().trees.find(x=>x.id===t.id).hanging,F.FORAGE.perTree-f.stats.dropped,'the tree is lighter');
 assert(F.forageStore.get().notes>=1,'a note after the pickup');
 // Regrow: the tree fills up again over real minutes.
 for(let i=0;i<120;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));}// let the sway and sparkles finish
 r.tick(F.FORAGE.regrowMs*3);f.update(r.ctx(t.stand.x,t.stand.z));assert.equal(f.view().trees.find(x=>x.id===t.id).hanging,F.FORAGE.perTree,'regrown and saved across time');
 // At rest: no rAF, no timers, no instance writes, no per-frame work.
 assert.equal(f.view().swaying,false,'the sway shell is gone once it settles');assert(!f.root.children.some(o=>o.name==='summit-fruit-tree-sway'));
 const v0=fruitMesh.instanceMatrix.version,b0=f.stats.busyFrames;
 for(let i=0;i<300;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));}
 assert.equal(fruitMesh.instanceMatrix.version,v0,'nothing animates at rest (no instance uploads)');assert.equal(f.stats.busyFrames,b0,'no per-frame work at rest');
 const fxMesh=f.root.children.find(o=>o.name==='job-fx-particles');assert(fxMesh&&fxMesh.visible===false,'pooled particles hidden when idle');
 assert.deepEqual(timers,{raf:0,timeout:0,interval:0},'no rAF and no timers of its own');
 // E shakes when the prompt shows.
 const keys=winListeners.get('keydown');assert(keys&&keys.size===1,'one keydown listener');
 const press=k=>{for(const fn of keys)fn({key:k,repeat:false,target:null,preventDefault(){}});};press('e');assert.equal(r.calls.pose.length,2,'E shakes too');
 for(let i=0;i<60*5;i++){r.tick(1000/60);f.update(r.ctx(t.stand.x,t.stand.z));}
 // Walk away from fallen fruit: it goes back up the tree, nothing lost.
 {const r2=rig(),g=r2.f,u=picks[1];r2.aim(u.stand.x,u.stand.z);g.update(r2.ctx(u.stand.x,u.stand.z));g.shake();
  for(let i=0;i<60*3;i++){r2.tick(1000/60);g.update(r2.ctx(u.stand.x,u.stand.z,{onFoot:i<50}));}// hop on a ride after the shake: no pickups
  const down=g.view().fallen.length;assert(down>=1);
  const far={x:u.x+(u.x>S.SUMMIT_CENTER.x?-35:35),z:u.z};for(let i=0;i<10;i++){r2.tick(1000/60);g.update(r2.ctx(far.x,far.z));}
  assert.equal(g.view().fallen.length,0);assert.equal(g.view().trees.find(x=>x.id===u.id).hanging,F.FORAGE.perTree,'left behind = back on the tree');assert.equal(r2.calls.gather.length,0);g.dispose();}
 // Dispose.
 f.dispose();assert.equal(f.root.parent,null,'removed from the scene');assert.equal(winListeners.get('keydown').size,0,'listener removed');
 assert.equal(F.forageStore.get().note,'','store reset');
}
// The daily cap: past it a shake still plays, but nothing falls and a friendly note explains.
{const t0=Date.UTC(2026,9,13,15,0,0);let s=F.emptyForage(t0);for(let i=0;i<F.FORAGE.dailyCap;i++)s=F.recordPick(s,'palm-999-999',t0);
 const r=rig({now:t0+1000,store:[[F.FORAGE_SAVE_KEY,JSON.stringify(s)]]}),t=picks[2];r.aim(t.stand.x,t.stand.z);r.f.update(r.ctx(t.stand.x,t.stand.z));
 assert.equal(r.f.shake(),true);for(let i=0;i<60*2;i++){r.tick(1000/60);r.f.update(r.ctx(t.stand.x,t.stand.z));}
 assert.equal(r.f.stats.dropped,0,'nothing drops past the daily cap');assert.match(F.forageStore.get().note,/foraged \d+ fruit today/);r.f.dispose();}
// A full basket: the fruit stays on the ground (nothing lost) and the note says where to sell.
{const r=rig({full:true}),t=picks[3];r.aim(t.stand.x,t.stand.z);r.f.update(r.ctx(t.stand.x,t.stand.z));r.f.shake();
 for(let i=0;i<60*3;i++){r.tick(1000/60);r.f.update(r.ctx(t.stand.x,t.stand.z));}
 const q=r.f.view().fallen[0];for(let i=0;i<30;i++){r.tick(1000/60);r.f.update(r.ctx(q.x,q.z));}
 assert(r.f.view().fallen.length>=1,'the fruit waits on the ground');assert.match(F.forageStore.get().note,/basket is full/i);assert.equal(JSON.parse(r.store.get(F.FORAGE_SAVE_KEY)??'{"today":0}').today,0,'not counted');r.f.dispose();}
// Reduced motion: no sway or leaves; the fruit is on the ground at once.
{const r=rig({reduced:true}),t=picks[4];r.aim(t.stand.x,t.stand.z);r.f.update(r.ctx(t.stand.x,t.stand.z));r.f.shake();let sway=false;
 for(let i=0;i<60;i++){r.tick(1000/60);r.f.update(r.ctx(t.stand.x,t.stand.z));if(r.f.view().swaying)sway=true;}
 assert.equal(sway,false,'no sway with reduced motion');assert(r.f.view().fallen.every(q=>q.mode==='ground'),'lands at once');r.f.dispose();}
// The first visit spreads the tree choice over frames (one check per frame at a 0 ms budget) and lands on the same trees.
{const r=rig({budgetMs:0}),t=picks[0];let frames=0;while(!r.f.stats.built&&frames<500){r.f.update(r.ctx(t.stand.x,t.stand.z));frames++;}
 assert(r.f.stats.built&&frames>5,`the choice is time-sliced (${frames} frames)`);assert.deepEqual(r.f.view().trees.map(x=>x.id).join(),picks.map(x=>x.id).join(),'same trees');r.f.dispose();}
// Frozen (the fishing focus) or off the island: no work.
{const r=rig(),t=picks[0];const before=r.f.stats.busyFrames;r.f.update(r.ctx(t.stand.x,t.stand.z,{frozen:true}));assert.equal(r.f.stats.built,false,'nothing while the fishing focus holds the island still');assert.equal(r.f.stats.busyFrames,before);r.f.dispose();}

// ---- 4. Wiring and data.
{const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8'),town=read('components/Town.tsx'),world=read('lib/town/summitIsleWorld.ts'),rt=read('lib/graphics/fruitTrees.ts');
 assert(town.includes('createSummitForage(')&&town.includes('forage.dispose()')&&town.includes('<ForagePrompt/>')&&town.includes("jobMoves.start('treeshake'"),'Town builds, shows and disposes it; the pose is a job pose');
 assert(town.includes("cands.push({kind:'enter',key:forageWant.key"),'the prompt competes in the HUD stack (one prompt at a time)');
 assert(read('lib/graphics/jobPoses.ts').includes('treeshake:[')&&read('lib/town/jobs/jobMoves.ts').includes("'treeshake'"),'push-and-shake pose');
 // The sway copies the baked canopy: keep fruitTrees.ts canopyCopy() in step with summitIsleWorld.ts tree() / palm().
 for(const src of ["IcosahedronGeometry(1.7*s,0),i%3?'#5b895e':'#4f7f55',at(x,y+2.9*s,z,0,i)","IcosahedronGeometry(1.15*s,0),i%2?'#6f9a62':'#5b895e',at(x+.6*s,y+3.9*s,z-.3*s,0,i*2)",
  "bakeBox(piece,2.6,.06,.5,k%2?'#5b895e':'#3f7a4f',tx+Math.cos(a)*1.15,ty-.25,tz+Math.sin(a)*1.15,0,-a,-.42)"])assert(world.includes(src),'summitIsleWorld still bakes: '+src.slice(0,40));
 assert(rt.includes("i%3?'#5b895e':'#4f7f55'")&&rt.includes("f%2?'#5b895e':'#3f7a4f'"),'the sway copy uses the same colours');
 assert(load('lib/saves/snapshot.ts').SYNC_KEYS.includes(F.FORAGE_SAVE_KEY),'the forage save syncs with the island');
 const coconut=goods.goodById('coconut');assert(coconut&&coconut.kind==='produce'&&coconut.price===3&&coconut.lesson.length<=85&&/^https:\/\//.test(coconut.source),'coconut: a fairly priced basket good that teaches');}

console.log(`PASS Summit Isle fruit trees: ${picks.filter(t=>t.kind==='tree').length} mango/orange trees + ${picks.filter(t=>t.kind==='palm').length} coconut palms, reachable from the landing; a shake drops 1–3 that fall, bounce and rest; pickups fill the basket; regrow every ${F.FORAGE.regrowMs/60e3} min, ${F.FORAGE.dailyCap} a day; idle = no work, no timers`);
