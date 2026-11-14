// Beach islanders and the Beach Kitchen square (Nov 13 2026, owner screenshots): nobody lies still in the sea (anyone whose spot is
// in the water swims a loop in swimming-depth water with the player's swim poses, lib/town/npcSwim.ts); nobody lies on bare ground
// (every lying islander is on a lounger pad under an umbrella, reclined on the back, lib/town/beachLoungers.ts + npcSeatPose 'lie');
// and the Beach Kitchen / Surf & Repair square is paved to both facades and fades into the sand along the grass line
// (lib/town/beachKitchenSquare.ts). Builds the real town. usage: node tests/beach-npcs.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}},listeners=new Map();
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:(t,f)=>{if(!listeners.has(t))listeners.set(t,new Set());listeners.get(t).add(f);},removeEventListener:(t,f)=>listeners.get(t)?.delete(f),matchMedia:()=>({matches:false}),location:{search:''}},
 requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(path.join(base,f),'utf8');
let n=0;const t=(name,fn)=>{try{fn();n++;console.log('ok   '+name);}catch(e){console.error('FAIL '+name);throw e;}};

const world=load('lib/town/world.ts').buildTown(new T.Scene());
const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts'),W=load('lib/town/water/waterDepth.ts'),{onLandableDeck}=load('lib/town/landableDecks.ts');
const S=load('lib/town/npcSwim.ts'),Lg=load('lib/town/beachLoungers.ts'),P=load('lib/graphics/npcSeatPose.ts'),Q=load('lib/town/beachKitchenSquare.ts');
const {onGrass}=load('lib/town/westParkLayout.ts'),{onIsland,distanceToShore,NORTH_BEACH_UMBRELLAS}=load('lib/town/shoreline.ts');
const inRect=(r,x,z,pad=0)=>Math.abs(x-r.x)<=r.w/2+pad&&Math.abs(z-r.z)<=r.d/2+pad;
const paved=(x,z)=>world.surfaceAreas.some(a=>a.kind==='path'&&inRect(a,x,z));
const surfaced=(x,z)=>world.surfaceAreas.some(a=>(a.kind==='path'||a.kind==='sand')&&inRect(a,x,z));

// ---------------------------------------------------------------- 1) the Beach Kitchen square
t('the square is paved right up to both facades (no grass strip between)',()=>{
 for(const f of Q.BEACH_KITCHEN_FRONTS){const b=world.buildings.find(b=>b.name===f.name);assert(b,f.name);const front=b.z+b.d/2;
  for(let x=b.x-b.w/2+.3;x<=b.x+b.w/2-.3;x+=.5)for(let dz=.05;dz<=4;dz+=.25)assert(paved(x,front+dz),`${f.name}: paving at (${x.toFixed(1)}, ${(front+dz).toFixed(2)})`);}
 // its west and east sides run to the buildings' outer walls too
 assert.equal(Q.BK_SQUARE.minX,Math.min(...Q.BEACH_KITCHEN_FRONTS.map(f=>f.x-f.w/2)));assert.equal(Q.BK_SQUARE.maxX,Math.max(...Q.BEACH_KITCHEN_FRONTS.map(f=>f.x+f.w/2)));
 assert(Q.BK_SQUARE.northZ<=Math.min(...Q.BEACH_KITCHEN_FRONTS.map(f=>f.z+f.d/2)),'the paving starts at (under) the nearer front');
});
t('the south edge follows the grass line and fades into the sand (no straight edge across the beach)',()=>{
 const edges=[];
 for(let x=Q.BK_SQUARE.minX;x<=Q.BK_SQUARE.maxX;x+=.5){const e=Q.squareEdge(x);edges.push(e.paved);
  assert(onGrass(x,e.grass-.1)&&!onGrass(x,e.grass+.1),`grass line at x ${x}`);
  assert(paved(x,e.grass-.2)||surfaced(x,e.grass-.2),`no lawn left between the paving and the sand at x ${x}`);
  assert(Q.squareFade(x,e.paved)===0&&Q.squareFade(x,e.sand)===1&&Q.squareFade(x,(e.paved+e.sand)/2)>.3,'a feathered colour fade');
  assert(!onGrass(x,e.sand)&&onIsland(x,e.sand)&&distanceToShore(x,e.sand)>3,`the fade ends on dry sand at x ${x}`);
  for(let z=e.grass;z<=e.sand;z+=.5)assert(surfaced(x,z),`a walk surface over the fade at (${x}, ${z.toFixed(1)})`);}
 assert(Math.max(...edges)-Math.min(...edges)>5,'the edge follows the diagonal sand line, not one straight z');
 const mesh=world.town?.getObjectByName?.('beach-kitchen-square')??null;
 assert(/m\.name='beach-kitchen-square'/.test(src('lib/town/world.ts'))&&!/path\(-62,97,25,13\)/.test(src('lib/town/world.ts')),'the old box is gone, the faded mesh is built');void mesh;
});
t('tables, bench, vending machine, gashapon and the square islanders stay on the paving',()=>{
 const spots=[[-68,96],[-58,96],[-71,101],[-60,92],[-55,92]];
 const sq=NPC_DIALOGUES.filter(d=>d.x>Q.BK_SQUARE.minX&&d.x<Q.BK_SQUARE.maxX&&d.z>Q.BK_SQUARE.northZ&&d.z<Q.squareEdge(d.x).grass);assert(sq.length>=2,'islanders on the square');for(const d of sq)spots.push([d.x,d.z]);
 for(const [x,z] of spots)assert(paved(x,z),`(${x}, ${z}) on the square`);
 assert(/name:'Beach Kitchen Courtyard',x:-63,z:94/.test(src('lib/town/world.ts')),'the destination id is unchanged');
});

// ---------------------------------------------------------------- 2) nobody still in the sea
const {onEastPier}=load('lib/town/eastPier.ts');
const inSea=d=>!d.floor&&W.waterDepthAt(d.x,d.z)>0&&!onLandableDeck(d.x,d.z)&&!onEastPier(d.x,d.z);// a boat deck or the jetty walkway is a floor
t('every islander whose spot is in the sea swims (no still pose in the water)',()=>{
 const wet=NPC_DIALOGUES.filter(inSea);
 // a still pose keeps its exact spot (islandNpcs.ts: no walkable snap); anyone else snaps to the nearest walkable ground within 12 m
 const {distanceToLand}=load('lib/town/landmass.ts');
 for(const d of wet){if(d.swim)continue;assert(!d.pose,`${d.id} at (${d.x}, ${d.z}) is in the water with a still pose`);
  let near=false;for(let r=0;r<=12&&!near;r++)for(let a=0;a<16&&!near;a++){const x=d.x+Math.cos(a*Math.PI/8)*r,z=d.z+Math.sin(a*Math.PI/8)*r;near=W.waterDepthAt(x,z)===0||onEastPier(x,z);}
  assert(near,`${d.id} snaps ashore`);void distanceToLand;}
 const swimmers=NPC_DIALOGUES.filter(d=>d.swim);assert.equal(JSON.stringify(swimmers.map(d=>d.id).sort()),JSON.stringify(['folk-kiri','folk-tavita']));
 for(const d of NPC_DIALOGUES)if(d.pose)assert.equal(W.waterDepthAt(d.x,d.z),0,`${d.id}: a still pose on dry ground`);
});
t('swim loops stay in swimming-depth water, the head above it (the player\'s swim depth)',()=>{
 assert.equal(S.NPC_SWIM_ROOT_Y,W.SWIM_ROOT_Y,'the root at the player\'s swim depth');
 for(const d of NPC_DIALOGUES.filter(d=>d.swim)){const s=S.createNpcSwim(d.x,d.z,d.swim,3);
  for(let i=0;i<3000;i++){S.stepNpcSwim(s,.05,false,false);assert(W.waterDepthAt(s.x,s.z)>=W.ZONE_SWIM,`${d.id} at (${s.x.toFixed(1)}, ${s.z.toFixed(1)}) in swimming depth`);}}
});
t('a swimmer crawls a lap then treads water; holds (treads) while talked to; a floater floats, drifts and waves',()=>{
 const s=S.createNpcSwim(0,0,{kind:'swim',r:3.5},0),kinds=new Set();let moved=0,px=s.x;
 for(let i=0;i<800;i++){S.stepNpcSwim(s,.05,false,false);kinds.add(s.kind);moved+=Math.hypot(s.x-px,0);px=s.x;}
 assert(kinds.has('crawl')&&kinds.has('tread')&&moved>5,'crawl and tread');
 const x=s.x;for(let i=0;i<40;i++)S.stepNpcSwim(s,.05,false,true);assert.equal(s.kind,'tread');assert.equal(s.x,x,'held');
 // the crawl heading is the loop's tangent
 const h=S.createNpcSwim(0,0,{kind:'swim',r:3},1),x0=h.x,z0=h.z;S.stepNpcSwim(h,.05,false,false);assert(Math.abs(Math.atan2(h.x-x0,h.z-z0)-h.yaw)<.05,'faces where it swims');
 const f=S.createNpcSwim(0,0,{kind:'float',r:1.4},0);let waved=0;for(let i=0;i<600;i++){S.stepNpcSwim(f,.05,false,false);assert.equal(f.kind,'float');if(f.wave>.9)waved++;}
 assert(waved>20,'waves now and then');
 const r=S.createNpcSwim(0,0,{kind:'swim',r:3},0);for(let i=0;i<100;i++)S.stepNpcSwim(r,.05,true,false);assert.equal(r.phase,0,'reduced motion: no stroke clock');
});
t('wired: the swim rig pose, no snap ashore, ripples near the player',()=>{
 const npcs=src('lib/graphics/islandNpcs.ts'),town=src('components/Town.tsx');
 assert(/!definition\.pose&&!definition\.swim;/.test(npcs),'a swimmer keeps its sea spot');
 assert(/swim:npcSwimPose\(entry\.swimPose,entry\.swim,/.test(npcs),'the rig gets SwimRigPose (swimPose.ts)');
 assert(/definition\.swim\?NPC_SWIM_ROOT_Y/.test(npcs),'root at swim depth');
 assert(/npcRipples\[i\]\.update\(/.test(town)&&/e\.distance<NPC_SWIM\.ripples/.test(town)&&/si\.mode=reduced\?2:fx\?0:1/.test(town),'shared ripple pool, near only, heat-gated');
});

// ---------------------------------------------------------------- 3) nobody lying on bare ground
const umbrellas=[...world.assets.filter(a=>a.kind==='beach-umbrella'),...Lg.PALM_COAST_UMBRELLAS];
const pads=world.obstacles.filter(o=>(Math.abs(o.w-.8)<.01&&Math.abs(o.d-2.5)<.01)||(Math.abs(o.w-.85)<.01&&Math.abs(o.d-2.4)<.01));
t('every lying islander is on a lounger pad under an umbrella, head at the backrest',()=>{
 const lying=NPC_DIALOGUES.filter(d=>d.pose==='lie');assert(lying.length>=4,'the sunbathers are still there');
 for(const d of lying){
  const pad=pads.find(p=>inRect(p,d.x,d.z,-.05));assert(pad,`${d.id} (${d.x}, ${d.z}) on a lounger pad`);
  assert(umbrellas.some(u=>Math.hypot(u.x-d.x,u.z-d.z)<2.6),`${d.id} under an umbrella`);
  assert.equal(d.workYaw,0,`${d.id} lies along the lounger, feet to its foot`);
  assert(typeof d.lounger==='number'&&d.lounger>.15,`${d.id} knows the pad height`);
  const head=pad.z-pad.d/2;assert(d.z-head>.4&&d.z-head<1.1,`${d.id} hips just below the backrest`);}
 assert.equal(JSON.stringify(lying.map(d=>d.id).sort()),JSON.stringify(['folk-aroha','folk-fatou','folk-luana','folk-tama']));
});
t('the lounger pose: on the pad (not the ground), reclined on the back, hands behind the head',()=>{
 for(const top of [.21,.27])for(const scale of [.74,.88,1]){const o=P.npcSeatPose('lie',scale,undefined,top);
  assert(Math.abs(o.pelvisY*scale-(top+P.LOUNGE.lift))<1e-9,'pelvis on the pad');
  assert(o.pelvisPitch<-.6&&o.pelvisPitch>-1.3,'reclined on the back (not face down, not flat)');
  for(const l of o.legs)assert(Math.abs(l.y*scale-(top+P.LOUNGE.ankle))<1e-9,'heels on the pad');
  for(const a of o.arms)assert(a.sx<-2.4&&a.el<-1,'hands behind the head');}
 const base=P.npcSeatPose('lie',1),out=P.npcSeatPose('lie',1);let wave=0,sit=0,still=0;
 for(let t=0;t<120;t+=.1){const on=P.loungeIdle(base,out,t,2,-1,false);if(!on)still++;else if(out.pelvisPitch>base.pelvisPitch+.3)sit++;else if(out.arms[1].sx>-2.4)wave++;}
 assert(wave>5&&sit>5&&still>wave+sit,`occasional idles (wave ${wave}, sit up ${sit}, still ${still})`);
 assert(P.loungeIdle(base,out,1,2,.5,false)&&out.arms[1].sx>-2.4,'a wave hello when you come close');
 assert(!P.loungeIdle(base,out,1,2,.5,true),'reduced motion: no idles');
});
t('Luana\'s set is the cay\'s own south-beach umbrella (no new prop), on the sand',()=>{
 const u=Lg.CAY_SUNBATHER_UMBRELLA;assert(world.assets.some(a=>a.kind==='beach-umbrella'&&Math.hypot(a.x-u.x,a.z-u.z)<.01),'still built there');
 const cay=load('lib/town/coralCay.ts'),L=Lg.SUNBATHERS.luana;assert(cay.onCay(L.x,L.z)&&cay.distanceToCayShore(L.x,L.z)>3,'on the cay, clear of the water');
});
t('the backrest rises toward the head end',()=>{assert(Lg.LOUNGER.backTilt>0&&/back\.rotation\.x=LOUNGER\.backTilt/.test(src('lib/town/world.ts'))&&/back\.rotation\.x=LOUNGER\.backTilt/.test(src('lib/town/coralCayWorld.ts')));void NORTH_BEACH_UMBRELLAS;});
console.log(`beach-npcs: ${n} checks passed`);
})().catch(e=>{console.error(e);process.exit(1);});
