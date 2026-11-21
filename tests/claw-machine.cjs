// Claw Club (Nov 21 2026, lib/claw): the deterministic physics (the pendulum settles, the pile settles and sleeps, grab / hold /
// slip outcomes are the same for the same seed and inputs, a toy dropped over the chute tumbles past the flap into the tray),
// the prize pool, the coins (one charge per play id, refunds only for unfinished tries, never twice), the award into the
// gashapon save (+ repeat refund), the pity rule, and the room LOD's cost. usage: node tests/claw-machine.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,structuredClone,Float32Array,Float64Array,Uint8Array,Uint16Array,Uint32Array,Int16Array,Int32Array,Array,Object,Number,String,Error,Symbol,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index');if(!fs.existsSync(file))for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.includes('RoomEnvironment')?{RoomEnvironment:class{}}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const P=load('lib/claw/clawPhysics.ts'),Z=load('lib/claw/clawPrizes.ts'),CS=load('lib/claw/clawStore.ts'),St=load('lib/gashapon/store.ts'),Y=load('lib/gashapon/toys.ts');
const make=seed=>{const {pile}=Z.clawPile(seed);return {pile,sim:P.createClawSim(seed,pile.map(id=>Z.clawToyBody(Z.clawPrize(id))))};};
const centre=(sim,i)=>[(sim.px[2*i]+sim.px[2*i+1])/2,(sim.py[2*i]+sim.py[2*i+1])/2,(sim.pz[2*i]+sim.pz[2*i+1])/2];
/** A scripted player: steer to (tx + off, tz), drop when still, then let the machine finish. Returns the try's record. */
function attempt(sim,target,off=0,opts={}){
 const s=sim.state,[tx,,tz]=centre(sim,target);sim.begin({jitterSeed:opts.jitter??1,firm:!!opts.firm});const ev=[];let steps=0;
 while(s.phase==='aim'&&steps<4000){const dx=tx+off-s.cx,dz=tz-s.cz,d=Math.hypot(dx,dz);sim.step(d>.01?Math.max(-1,Math.min(1,dx*6)):0,d>.01?Math.max(-1,Math.min(1,dz*6)):0,d<.01&&Math.hypot(s.vx,s.vz)<.01);steps++;}
 let grabQ=-1,grabbed=-1;while(s.phase!=='done'&&steps<20000){sim.step(0,0,false);steps++;if(opts.onStep)opts.onStep(s,sim);for(let e=0;e<sim.events.count;e++){ev.push(sim.events.code[e]);if(sim.events.code[e]===13){grabQ=s.quality;grabbed=s.held;}}sim.events.clear();}
 return {result:s.result,q:grabQ,grabbed,events:ev,steps};
}
const top=sim=>{let best=-1,by=-1;for(let i=0;i<sim.count;i++){if(!sim.active[i])continue;const t=centre(sim,i);if(t[1]>by&&Math.abs(t[0])<.6&&Math.abs(t[2])<.38){by=t[1];best=i;}}return best;};

await ok('the pile settles and sleeps; no toy starts in the chute or the tray (300 seeds)',()=>{
 for(let seed=1;seed<=300;seed++){const {sim}=make(seed);assert.equal(sim.sleeping,true,`seed ${seed} asleep`);
  for(let i=0;i<sim.count;i++){assert(sim.py[2*i]>.02,`seed ${seed} toy ${i} on the play floor`);assert.equal(sim.delivered[i],0);}}
});
await ok('the cable pendulum swings after a carriage stop and settles (damped)',()=>{
 const {sim}=make(4),s=sim.state;sim.begin({});for(let k=0;k<120;k++)sim.step(1,0,false);// 1 s full right
 let peak=0;for(let k=0;k<240;k++){sim.step(0,0,false);peak=Math.max(peak,Math.abs(s.hx-s.cx));}
 assert(peak>.02,`it swings (${peak.toFixed(3)} m)`);
 for(let k=0;k<720;k++)sim.step(0,0,false);let late=0;for(let k=0;k<120;k++){sim.step(0,0,false);late=Math.max(late,Math.abs(s.hx-s.cx));}
 assert(late<peak*.3,`and settles (${late.toFixed(4)} < 30 % of ${peak.toFixed(3)})`);
});
await ok('carriage: ramps up and stops with a deceleration, stays inside its rails',()=>{
 const {sim}=make(5),s=sim.state;sim.begin({});sim.step(1,0,false);assert(s.vx>0&&s.vx<P.CARRIAGE.vmax*.1,'no instant top speed');
 for(let k=0;k<600;k++)sim.step(1,1,false);assert(s.cx<=P.CARRIAGE.maxX+1e-9&&s.cz<=P.CARRIAGE.maxZ+1e-9,'clamped');
 sim.step(-1,0,false);assert(s.vx>-P.CARRIAGE.vmax,'turnaround is not instant');
});
await ok('same seed + same inputs → the same try, particle for particle',()=>{
 const a=make(11),b=make(11),ra=attempt(a.sim,top(a.sim),.03),rb=attempt(b.sim,top(b.sim),.03);
 assert.equal(ra.result,rb.result);assert.equal(ra.q,rb.q);assert.deepEqual(ra.events,rb.events);assert.deepEqual([...a.sim.px],[...b.sim.px]);assert.deepEqual([...a.sim.py],[...b.sim.py]);
});
await ok('a centred grab on the top toy is solid and wins; an off-centre grab is weaker',()=>{
 let wins=0,offWins=0,tries=0,qc=0,qo=0,n=0;
 for(let seed=1;seed<=8;seed++){const a=make(seed),b=make(seed),ra=attempt(a.sim,top(a.sim),0),rb=attempt(b.sim,top(b.sim),.2);
  tries++;if(ra.result>=0)wins++;if(ra.q>0){qc+=ra.q;qo+=Math.max(0,rb.q);n++;}if(rb.result>=0)offWins++;}
 assert(wins/tries>=.6,`centred aim wins most of the time (${wins}/${tries})`);assert(qc/n>qo/n,`centred quality ${(qc/n).toFixed(2)} > off-centre ${(qo/n).toFixed(2)}`);assert(offWins<wins,`off-centre wins less (${offWins} vs ${wins})`);
});
await ok('a weak hold slips out while lifting (and the toy falls back), deterministically; a firm (pity) try holds the same grab',()=>{
 const run=firm=>{const {sim}=make(3);let forced=false;return attempt(sim,top(sim),0,{firm,onStep:(s)=>{if(s.phase==='lift'&&s.held>=0&&!forced){forced=true;s.grip=P.gripFor(.3,firm);}}});};
 const weak=run(false),weak2=run(false);assert(weak.events.includes(12),'a slip event');assert.equal(weak.result,-1,'the toy fell back');assert.deepEqual(weak.events,weak2.events,'same slip, same steps');
 assert(P.gripFor(.3,true)>P.gripFor(.3,false)*1.25,'firm grip is ~30 % stronger');assert(P.gripFor(.5,false)>9.8,'a medium grab holds its own weight');assert(P.gripFor(.3,false)<9.8,'a poor grab does not');
});
await ok('chute: a toy dropped over the hole tumbles down the shaft, swings the flap open and lands in the tray',()=>{
 const {sim}=make(6),s=sim.state;sim.place(0,(P.CHUTE.x0+P.CHUTE.x1)/2,.6,(P.CHUTE.z0+P.CHUTE.z1)/2);sim.begin({});sim.abort();
 const ev=[];let flap=0;for(let k=0;k<1200;k++){sim.step(0,0,false);flap=Math.max(flap,s.flap);for(let e=0;e<sim.events.count;e++)ev.push(sim.events.code[e]);sim.events.clear();}
 assert.equal(sim.delivered[0],1,'in the tray');assert(ev.includes(11),'Deliver event');assert(ev.includes(9),'chute clunk');assert(flap>.2,`flap opened (${flap.toFixed(2)})`);
 assert(sim.pz[0]>P.CHUTE.z1&&sim.py[0]<P.CHUTE.flapTop,'past the flap');assert(s.flap<.6,'flap swings back toward shut');
});
await ok('a try left in aim can be aborted (no result), and fast-forward plays a dropped try out',()=>{
 const {sim}=make(8),s=sim.state;sim.begin({});assert.equal(sim.abort(),true);assert.equal(s.phase,'done');assert.equal(s.result,-1);
 sim.begin({});for(let k=0;k<60;k++)sim.step(0,0,true);assert.equal(s.phase,'drop');sim.finish();assert.equal(s.phase,'done');
});
await ok('prize pool: real toys with facts, the Bean always in the pile, no duplicates after refills',()=>{
 for(const p of Z.CLAW_PRIZES){assert(Y.gashaponToy(p.id),p.id);assert(p.fact.length>20&&p.fact.length<130,p.id);const b=Z.clawToyBody(p);assert(b.r>=.085&&b.r<=.13&&b.d>=.03,p.id);}
 const {pile,refill}=Z.clawPile(42);assert.equal(pile.length,Z.CLAW_PILE_SIZE);assert.equal(new Set(pile).size,pile.length);assert.equal(pile[0],'claw-club-bean');
 for(let k=0;k<20;k++){const slot=k%pile.length,next=Z.nextRefill(pile,refill,pile[slot]);pile[slot]=next;assert.equal(new Set(pile).size,pile.length,'unique after refill');}
});
// ---- coins + prizes -----------------------------------------------------------------------------------------------------------
function ports(){const st={raw:null,spent:new Map(),credited:new Map(),balance:100,failWrite:false,now:1000,day:'2026-11-21'};
 return {st,p:{read:()=>st.raw,write:s=>{if(st.failWrite)throw new Error('full');st.raw=JSON.parse(JSON.stringify(s));},now:()=>++st.now,day:()=>st.day,
  spend:async(id,cost)=>{if(st.spent.has(id))return {ok:true};if(st.balance<cost)return {ok:false,reason:'Not enough coins'};st.balance-=cost;st.spent.set(id,cost);return {ok:true};},
  refund:async(id,coins)=>{if(st.credited.has(id))return 0;st.credited.set(id,coins);st.balance+=coins;return coins;}}};}
await ok('coins: one charge per play id; refunds only for unfinished tries and never twice; short balance refused',async()=>{
 const {st,p}=ports(),c=CS.createClawStore(p);
 assert.equal(CS.CLAW_PRICE,10);assert((await c.pay('p1')).ok);assert((await c.pay('p1')).ok);assert.equal(st.balance,90,'charged once');
 assert.equal(await c.refund('p1'),10);assert.equal(await c.refund('p1'),0,'refund once');assert.equal(st.balance,100);
 assert((await c.pay('p2')).ok);await c.finish('p2',null);assert.equal(await c.refund('p2'),0,'a finished try is never refunded');
 st.balance=5;const short=await c.pay('p3');assert.equal(short.ok,false);assert.equal(st.balance,5,'never negative');
});
await ok('daily cap: 12 paid tries a play day; refunded tries do not count; at 0 no charge; the next day refills',async()=>{
 const {st,p}=ports(),c=CS.createClawStore(p);st.balance=1000;assert.equal(CS.CLAW_TRIES_PER_DAY,12);assert.equal(c.triesLeft(),12);
 assert((await c.pay('r1')).ok);assert.equal(c.triesLeft(),11);assert.equal(await c.refund('r1'),10);assert.equal(c.triesLeft(),12,'a refunded try is given back');
 for(let i=0;i<12;i++){assert((await c.pay('t'+i)).ok);await c.finish('t'+i,null);}
 assert.equal(c.triesLeft(),0);assert((await c.pay('t3')).ok,'the same id again is not a new try');const before=st.balance,no=await c.pay('t12');
 assert.equal(no.ok,false);assert.equal(no.daily,true);assert.match(no.reason,/12 claw tries today/);assert.equal(st.balance,before,'no charge at 0');assert(!st.spent.has('claw:t12'));
 assert.equal(St.sanitizeGashapon(st.raw).claw.paid.length,12,'the paid list survives the save sanitiser');
 st.day='2026-11-22';assert.equal(c.triesLeft(),12,'a new day refills');assert((await c.pay('t12')).ok);assert.equal(c.triesLeft(),11);
 assert.equal(c.streak(),12,'finish keeps the pity count with the daily list');
});
await ok('pile LOD: the low-poly pile toys are one merged mesh each and far cheaper than the full models',()=>{
 const Tm=load('lib/gashapon/toyModels/index.ts'),{pile}=Z.clawPile(42);let lo=0,hi=0;
 const tri=r=>r.meshes.reduce((n,m)=>n+(m.geometry.index?m.geometry.index.count:m.geometry.getAttribute('position').count)/3,0);
 for(const id of pile){const a=Tm.buildToy(id,{lo:true}),b=Tm.buildToy(id);assert(a&&b,id);assert.equal(a.hd,false);lo+=tri(a);hi+=tri(b);a.dispose();b.dispose();}
 console.log(`     (pile of ${pile.length}: full ${Math.round(hi)} → low ${Math.round(lo)} triangles)`);assert(lo<hi/3,`low ${lo} vs full ${hi}`);assert(lo<90000,`pile ${lo}`);
 const src=fs.readFileSync(path.join(base,'lib/claw/clawMachine3d.ts'),'utf8');assert(/function pileToy/.test(src)&&/setToy\(slot,pile\[slot\],true\)/.test(fs.readFileSync(path.join(base,'lib/claw/clawRoom.ts'),'utf8')),'pile toys low, the won toy full detail');
});
await ok('award: the won toy lands in the gashapon save; a repeat counts up and pays 5 back; same id → same answer',async()=>{
 const {st,p}=ports(),c=CS.createClawStore(p);
 const a=await c.finish('w1','maneki-mika');assert(a.ok&&!a.duplicate&&a.count===1&&a.refund===0);
 const again=await c.finish('w1','maneki-mika');assert(again.ok&&again.repeat);assert.equal(St.sanitizeGashapon(st.raw).owned['maneki-mika'].n,1,'no second award');
 const b=await c.finish('w2','maneki-mika');assert(b.ok&&b.duplicate&&b.count===2&&b.refund===St.GASHAPON_REFUND);
 assert.equal((await c.finish('w3','onigiri-ollie')).ok,false,'only claw prizes');
 // the gashapon spin keeps the claw record (one shared save)
 const g=St.createGashaponStore(p);await g.spin('gs-square-snacks','spin-1');const after=St.sanitizeGashapon(st.raw);assert(after.claw&&after.claw.plays.w1&&after.claw.plays.w2,'claw receipts survive a capsule spin');
});
await ok('save failure: the result can be retried with the same id (no second charge, no double award)',async()=>{
 const {st,p}=ports(),c=CS.createClawStore(p);await c.pay('s1');st.failWrite=true;const bad=await c.finish('s1','pixel-ball');assert.equal(bad.ok,false);assert.equal(bad.reason,'save');
 st.failWrite=false;const good=await c.finish('s1','pixel-ball');assert(good.ok&&good.count===1);assert.equal(st.balance,90);
});
await ok('pity rule: after 4 misses in a row the next try is firm; a win resets the count',async()=>{
 const {p}=ports(),c=CS.createClawStore(p);for(let i=0;i<4;i++){assert.equal(c.firmNext(),false);await c.finish('m'+i,null);}
 assert.equal(c.streak(),4);assert.equal(c.firmNext(),true);await c.finish('win','glove-frog');assert.equal(c.streak(),0);assert.equal(c.firmNext(),false);
});
await ok('save hygiene: junk claw receipts are dropped, the pending marker is a device key',()=>{
 const s=St.sanitizeGashapon({version:1,owned:{},spins:{},day:'',today:0,last:0,claw:{plays:{'ok-1':{toy:'pixel-ball',at:5,dup:false,refund:0},'bad id!':{toy:'pixel-ball'},'x':{toy:'nope'}},streak:3}});
 assert.deepEqual(Object.keys(s.claw.plays),['ok-1']);assert.equal(s.claw.streak,3);
 const S=load('lib/saves/snapshot.ts');assert(S.DEVICE_KEYS.includes('fi2-claw-pending'));assert.equal(S.isSyncKey('fi2-claw-pending'),false);
});
await ok('room LOD: 4 draws and a small triangle budget',()=>{
 const M=load('lib/claw/clawMachine3d.ts'),lod=M.buildClawLod();let draws=0,tris=0;lod.group.traverse(o=>{if(o.isMesh){draws++;const g=o.geometry;tris+=(g.index?g.index.count:g.getAttribute('position').count)/3;}});
 assert.equal(draws,4);assert(tris<9000,`LOD triangles ${tris}`);console.log(`     (room LOD: ${draws} draws, ${tris} triangles)`);lod.dispose();
});
await ok('wiring: the room zooms through the claw controller and the HUD charges through the store',()=>{
 const scene=fs.readFileSync(path.join(base,'lib/arcade/arcadeRoomScene.ts'),'utf8'),room=fs.readFileSync(path.join(base,'components/ArcadeRoom.tsx'),'utf8'),hud=fs.readFileSync(path.join(base,'components/ClawMachineHud.tsx'),'utf8');
 assert(/createClawRoom\(/.test(scene)&&/if\(claw\.active\)\{const open=claw\.update\(dt\)/.test(scene),'the room loop hands the frame to the zoom');
 assert(/<ClawMachineHud /.test(room)&&/clawStore\.pay\(/.test(hud)&&/clawStore\.refund\(/.test(hud)&&/clawStore\.finish\(/.test(hud),'pay / refund / finish');
 assert(/easeZoom/.test(fs.readFileSync(path.join(base,'lib/claw/clawRoom.ts'),'utf8')),'the vending zoom ease');
});
console.log(failed?`\n${failed} failed`:'\nall claw machine checks passed');process.exitCode=failed?1:0;
})();
