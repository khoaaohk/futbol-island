// Kicking the ball out to sea (Sep 29 2026): the real walking ball (walkBall.ts) with the real land/sea test (ballSea.ts).
// A shot from a main-island beach and from the Coral Cay causeway flies over the water, splashes once, floats and bobs, then
// returns to the player; kick or walking away brings it back at once; past the flyable edge it is recalled (never lost);
// land shots still bounce as before; the buoy ball is collected by a real shot from its chalk mark, and the buoy stays solid.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const {ballGround,SEA_LEVEL,OUT_OF_PLAY_NOTE}=load('lib/town/ballSea.ts'),{createWalkBall,BALL_FLOAT_TIME}=load('lib/town/walkBall.ts'),{ISLAND_SHORE}=load('lib/town/shoreline.ts'),cay=load('lib/town/coralCay.ts');
const src=fs.readFileSync(path.join(base,'lib/town/walkBall.ts'),'utf8');
assert(/IFAB|Law 9/.test(fs.readFileSync(path.join(base,'lib/town/ballSea.ts'),'utf8'))&&/WHOLE ball/.test(OUT_OF_PLAY_NOTE),'the out-of-play note cites Law 9');

/** Runs one shot like Town does: open water is not a wall, land has no walls here, `hit` is the coin hunt when given. */
function shoot(start,yaw,{charge=0,hunt,walkAway=0,kickAt=-1,seconds=14}={}){
 const ball=createWalkBall(),p={x:start.x,z:start.z,y:0,yaw},log={splashes:[],impacts:0,maxOut:0,wet:0,modes:new Set(),floatY:[],attachedAt:-1};
 const env={floor:()=>0,sea:ballGround,splash:(x,y,z)=>log.splashes.push({x,y,z}),impact:()=>log.impacts++,strike(){},
  blocked:(x,z,y)=>{if(hunt&&hunt.hit(x,y,z,ball.state.vx,ball.state.vz))return false;return ballGround(x,z)!=='land'&&!!hunt&&hunt.buoySolid(x,y,z);},
  hit:(x,y,z,vx,vz)=>!!hunt&&hunt.hit(x,y,z,vx,vz)};
 ball.reset(p);ball.shoot(p,yaw,charge);
 for(let i=0;i<seconds*60;i++){const t=i/60;if(walkAway&&ball.state.floating>0){p.x+=Math.sin(yaw+Math.PI)*walkAway/60;p.z+=Math.cos(yaw+Math.PI)*walkAway/60;}
  if(kickAt>=0&&ball.state.floating>kickAt&&ball.state.mode==='shot')ball.reset(p);
  ball.update(1/60,p,env);log.modes.add(ball.state.mode);if(ball.state.floating>0){log.wet++;log.floatY.push(ball.state.y);assert.equal(ballGround(ball.state.x,ball.state.z),'sea','a floating ball stays on open water');}
  log.maxOut=Math.max(log.maxOut,Math.hypot(ball.state.x-start.x,ball.state.z-start.z));
  if(ball.state.mode==='attached'&&t>.6&&log.attachedAt<0){log.attachedAt=t;break;}}
 return {ball,log};
}
// 1. From a main-island beach: step outward from the island's centre until the next metre is open sea.
{const cx=ISLAND_SHORE.reduce((a,p)=>a+p.x,0)/ISLAND_SHORE.length,cz=ISLAND_SHORE.reduce((a,p)=>a+p.z,0)/ISLAND_SHORE.length;
 let tested=0;for(const k of [0,.25,.5,.75].map(f=>Math.floor(f*ISLAND_SHORE.length))){const s=ISLAND_SHORE[k],dx=s.x-cx,dz=s.z-cz,l=Math.hypot(dx,dz),ux=dx/l,uz=dz/l;
  let start=null;for(let r=l-12;r<l+2;r+=.25){const x=cx+ux*r,z=cz+uz*r;if(ballGround(x,z)==='land'&&ballGround(x+ux*3,z+uz*3)==='sea'){start={x,z};break;}}if(!start)continue;
  const {ball,log}=shoot(start,Math.atan2(ux,uz));tested++;
  assert.equal(log.splashes.length,1,`beach ${k}: one splash`);assert(Math.abs(log.splashes[0].y-SEA_LEVEL)<1e-9,'the splash is on the water');
  assert(log.wet>30,`beach ${k}: the ball floats for a moment (${log.wet} frames)`);assert(log.wet<=Math.ceil(BALL_FLOAT_TIME*60)+2,'then comes back');
  const lo=Math.min(...log.floatY),hi=Math.max(...log.floatY);assert(hi-lo>.03&&hi-lo<.2&&Math.abs((hi+lo)/2-(SEA_LEVEL+.1))<.05,'it bobs gently at the surface');
  assert(log.modes.has('return')&&log.attachedAt>0,`beach ${k}: the ball returns to the player's feet (${log.attachedAt.toFixed(2)} s)`);assert.equal(ball.state.floating,0);}
 assert(tested>=3,'shots tested from several beaches');}
// 2. From the causeway deck, out over the rail.
const deckAt=(t,d)=>{const p=cay.causewayPoint(t);return {x:p.x-p.dirZ*d,z:p.z+p.dirX*d,yaw:Math.atan2(-p.dirZ*Math.sign(d),p.dirX*Math.sign(d))};};
for(const [t,side] of [[.3,-1],[.55,1],[.7,-1]]){const s=deckAt(t,side*4.8);assert.equal(ballGround(s.x,s.z),'land');
 const {log}=shoot(s,s.yaw);assert.equal(log.splashes.length,1,`causeway ${t}: splash beyond the rail`);assert(log.attachedAt>0,`causeway ${t}: returns`);
 const sp=log.splashes[0];assert(cay.causewayFrame(sp.x,sp.z,true).dist>cay.CAUSEWAY.railHalf,'it landed out past the rail');}
// 3. Quick returns: pressing kick while it floats brings it straight back; walking away recalls it early.
{const s=deckAt(.3,-4.8);const kick=shoot(s,s.yaw,{kickAt:.2});assert(kick.log.wet<20&&kick.ball.state.mode==='attached','kick brings the floating ball back at once');
 const away=shoot(s,s.yaw,{walkAway:5});assert(away.log.attachedAt>0&&away.log.wet<Math.ceil(BALL_FLOAT_TIME*60),'walking away recalls it early');}
// 4. Never lost at sea: a full-power shot out to sea ends back at the player, recalled at the flyable edge if it gets there.
{const s=deckAt(.45,-4.8);const {log}=shoot(s,s.yaw,{charge:1,seconds:16});assert(log.attachedAt>0,'a full-power shot out to sea always comes back');
 const far=shoot({x:s.x,z:s.z},s.yaw,{charge:1,seconds:16});assert(far.log.maxOut<200,'the ball never flies off beyond the zone');}
// 5. Land shots are unchanged: no splash, bounces on the ground.
{const c=cay.CAY_LANDMARKS.plaza,{log}=shoot({x:c.x,z:c.z},Math.PI/2,{seconds:4});assert.equal(log.splashes.length,0,'no splash on land');assert(log.impacts>0,'the ball still bounces on land');}
// 6. The buoy: a real shot from its chalk mark flies out and collects the ball; the found buoy stays and is solid.
{const {CORAL_CAY_SPOTS}=load('lib/town/coralCayBalls.ts'),b=CORAL_CAY_SPOTS.find(s=>s.buoy),k=b.kickFrom,{createCoinHunt}=load('lib/graphics/coinHunt.ts');
 const got=[],hunt=createCoinHunt(new T.Scene(),s=>got.push(s.id),()=>{});hunt.update(.1,{x:k.x,y:0,z:k.z},true,true);
 const yaw=Math.atan2(b.x-k.x,b.z-k.z),first=shoot(k,yaw,{hunt});assert.deepEqual([...got],[b.id],'a plain shot from the chalk mark reaches the buoy and collects its ball');
 hunt.update(.1,{x:k.x,y:0,z:k.z},true,true);assert(hunt.buoyScenery.parent&&hunt.buoyScenery.visible,'the buoy stays after');
 const second=shoot(k,yaw,{hunt});assert.equal(got.length,1,'no second reward');assert(second.log.impacts>0,'the next shot bounces off the buoy');assert(second.log.attachedAt>0);
 void first;hunt.dispose();}
// 7. Heat: the float runs only while wet (no timers), and nothing else was added to the loop.
assert(!/setInterval|setTimeout|requestAnimationFrame/.test(src),'walkBall has no timers or loops of its own');
{const town=fs.readFileSync(path.join(base,'components/Town.tsx'),'utf8');
 // Code review findings 9 and 10: a floating ball drops the shot trail/ghosts/charge; both sea notes share one tracked timer.
 assert(/walkBall\.state\.mode==='shot'&&!walkBall\.state\.floating\|\|walkBall\.state\.mode==='wall-juggle'/.test(town)&&/walkBall\.state\.mode==='shot'&&!walkBall\.state\.floating\?walkBall\.state\.charge:0/.test(town),'no shot effects while the ball floats');
 assert(/setSeaNote\(OUT_OF_PLAY_NOTE\);clearTimeout\(pierNoteTimer\);pierNoteTimer=setTimeout\(/.test(town)&&!/setSeaNote\(OUT_OF_PLAY_NOTE\);setTimeout\(/.test(town),'the first-splash note cannot clear the pier challenge note early');}
console.log('PASS ocean kicks: beaches and causeway fly over water, one pooled splash, a gentle float, return to the feet (kick or walking away sooner, edge recall, never lost); land shots unchanged; buoy collected by a real shot and stays solid');
})().catch(e=>{console.error(e);process.exit(1);});
