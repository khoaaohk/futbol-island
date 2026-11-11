// The deep-sea boats can never trap a player (Nov 11 2026, owner on an iPhone: "getting stuck here with the boat"; lib/town/fishing/
// boatHull.ts). For EVERY boat, on a fine grid round the hull: each point is walkable deck, free water, or inside the hull where the
// resolver moves it in ONE step to deck or free water (no enclosed pockets, nothing left in between). Then the flows: climbing aboard
// from the water beside the deck, hopping off each side and the stern, the wheelhouse refusing a deck walker, a restored save inside a
// hull freed, the safety net, and the water depth beside a boat (deep: swim, never wade on the open sea).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const H=load('lib/town/fishing/boatHull.ts'),D=load('lib/town/fishing/deepSeaBoatData.ts'),LD=load('lib/town/landableDecks.ts'),W=load('lib/town/water/waterDepth.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
// Register every boat's deck the way deepSeaBoat.ts does (floating), so deckLive and the depth read the real thing.
const unreg=D.DEEP_SEA_BOATS.map(b=>LD.registerLandableDeck({...b.deck,floating:true}));
const deckLive=(x,z)=>LD.onLandableDeck(x,z);
const local=(b,x,z)=>b.toLocal(x,z);
const classify=(b,x,z)=>{const p=local(b,x,z);if(H.onDeckLocal(b,p.x,p.z))return 'deck';if(!H.insideHullLocal(b,p.x,p.z))return 'water';return 'hull';};

ok('every boat is covered (the captains\' boats)',()=>{assert.equal(D.DEEP_SEA_BOATS.length,2);
 const caps=fs.readFileSync(path.resolve(__dirname,'../lib/town/fishing/boatCaptains.ts'),'utf8');assert.match(caps,/const \[B0,B1\]=DEEP_SEA_BOATS;/);});
ok('the registered deck and the hull rule agree on what is deck',()=>{for(const b of D.DEEP_SEA_BOATS)for(let lx=b.hull.x0-1;lx<=b.hull.x1+1;lx+=.1)for(let lz=-b.hull.halfBeam-1;lz<=b.hull.halfBeam+1;lz+=.1){
 const w=b.toWorld(lx,lz),a=H.onDeckLocal(b,lx,lz),r=deckLive(w.x,w.z);
 // within 1 cm of the edge either answer is fine (float rounding)
 const edge=Math.min(Math.abs(Math.abs(lz)-1.45*b.look.scale.beam),Math.abs(lx-(-5*b.look.scale.length)),Math.abs(lx-.2*b.look.scale.length));
 if(edge>.01)assert.equal(a,r,`${b.spotId} deck at local ${lx.toFixed(2)},${lz.toFixed(2)}`);}});
ok('fine grid: deck, water, or resolved in one step to deck or water (both arrivals), no pockets',()=>{
 for(const b of D.DEEP_SEA_BOATS){let hull=0;const counts={deck:0,water:0,hull:0};
  for(let lx=b.hull.x0-1.5;lx<=b.hull.x1+1.5;lx+=.1)for(let lz=-b.hull.halfBeam-1.5;lz<=b.hull.halfBeam+1.5;lz+=.1){
   const w=b.toWorld(lx,lz),c=classify(b,w.x,w.z);counts[c]++;
   if(c!=='hull'){const p={x:w.x,z:w.z};assert.equal(H.resolveBoatHull(p,null,deckLive),null);continue;}
   hull++;
   for(const prev of [null,{x:w.x+.05,z:w.z}]){const p={x:w.x,z:w.z},r=H.resolveBoatHull(p,prev,deckLive),after=classify(b,p.x,p.z);
    assert(r==='board'||r==='out',`${b.spotId} ${lx.toFixed(1)},${lz.toFixed(1)}: ${r}`);assert(after==='deck'||after==='water',`${b.spotId} ends in ${after}`);
    if(r==='board')assert(deckLive(p.x,p.z),'boards onto a live deck');
    assert(Math.hypot(p.x-w.x,p.z-w.z)<=b.hull.halfBeam+H.OUT_GAP+.01,'one short step');
    // and the landing point is free: water there is clear of every hull, deck is a floor
    assert.equal(H.boatHullAt(p.x,p.z),null);}
  }
  assert(hull>100&&counts.deck>100&&counts.water>100,JSON.stringify(counts));}});
ok('climb aboard from the water beside the deck: both sides and the stern',()=>{for(const b of D.DEEP_SEA_BOATS){const L=b.look.scale.length,Wd=b.look.scale.beam;
 for(const [lx,lz] of [[-2.4*L,b.hull.halfBeam-.1],[-2.4*L,-b.hull.halfBeam+.1],[b.hull.x0+.1,0],[b.hull.x0+.1,b.hull.halfBeam-.1],[b.hull.x0+.1,-b.hull.halfBeam+.1]]){
  const w=b.toWorld(lx,lz),p={...w},from=b.toWorld(lx<b.hull.x0+.5?lx-.3:lx,lx<b.hull.x0+.5?lz:lz+Math.sign(lz)*.3);
  assert.equal(H.resolveBoatHull(p,from,deckLive),'board',`${b.spotId} ${lx},${lz}`);assert(deckLive(p.x,p.z));}}});
ok('hop off the deck: each side and the stern into the sea; the wheelhouse refuses',()=>{for(const b of D.DEEP_SEA_BOATS){const L=b.look.scale.length,Wd=b.look.scale.beam;
 for(const [fx,fz,tx,tz] of [[-2.4*L,1.4*Wd,-2.4*L,1.6*Wd],[-2.4*L,-1.4*Wd,-2.4*L,-1.6*Wd],[-4.95*L,0,-5.1*L,0],[-4.95*L,1.4*Wd,-5.1*L,1.6*Wd]]){
  const f=b.toWorld(fx,fz),p=b.toWorld(tx,tz);assert.equal(H.resolveBoatHull(p,f,deckLive),'hop');assert.equal(classify(b,p.x,p.z),'water');}
 const f=b.toWorld(.15*L,0),p=b.toWorld(.3*L,0);assert.equal(H.resolveBoatHull(p,f,deckLive),'back');assert.equal(classify(b,p.x,p.z),'deck','stays on the deck');
 // a diagonal into the wheelhouse corner slides along the deck front
 const f2=b.toWorld(.1*L,.5),p2=b.toWorld(.3*L,.7);assert.equal(H.resolveBoatHull(p2,f2,deckLive),'back');assert.equal(classify(b,p2.x,p2.z),'deck');}});
ok('no flicker: a hop off right after climbing aboard waits FLIP_S (the edge holds), and the reverse',()=>{const b=D.DEEP_SEA_BOATS[0];H.resetBoatUnstick();
 const w=b.toWorld(-2.4,b.hull.halfBeam-.1),p={...w};assert.equal(H.resolveBoatHull(p,b.toWorld(-2.4,b.hull.halfBeam+.3),deckLive,10),'board');
 const f=b.toWorld(-2.4,1.4),q=b.toWorld(-2.4,1.6);assert.equal(H.resolveBoatHull(q,f,deckLive,10.2),'back');assert.equal(classify(b,q.x,q.z),'deck');
 const q2=b.toWorld(-2.4,1.6);assert.equal(H.resolveBoatHull(q2,f,deckLive,10+H.FLIP_S+.01),'hop');
 const r=b.toWorld(-2.4,b.hull.halfBeam-.1);assert.equal(H.resolveBoatHull(r,b.toWorld(-2.4,b.hull.halfBeam+.3),deckLive,10+H.FLIP_S+.2),'out');assert.equal(classify(b,r.x,r.z),'water');
 H.resetBoatUnstick();});
ok('the captain and the fishing stand are on the deck',()=>{for(const b of D.DEEP_SEA_BOATS){assert.equal(classify(b,b.stand.x,b.stand.z),'deck');const c=b.toWorld(b.captainLocal.x,b.captainLocal.z);assert.equal(classify(b,c.x,c.z),'deck');}});
ok('a save restored at the owner\'s spot (Deep Sea Boat starboard stern corner, inside the topsides) is freed on the first frame',()=>{
 const b=D.DEEP_SEA_BOATS[0];for(const [lx,lz] of [[-5.3,1.8],[-5.45,1.9],[-5.2,1.6]]){const w=b.toWorld(lx,lz),p={...w};const r=H.resolveBoatHull(p,{...w},deckLive);assert(r==='board'||r==='out');assert.notEqual(classify(b,p.x,p.z),'hull');}});
ok('the safety net: no progress for 1.5 s off the deck near a boat moves the player clear',()=>{const b=D.DEEP_SEA_BOATS[0];H.resetBoatUnstick();
 const w=b.toWorld(3,b.hull.halfBeam*.7+.3),p={...w};let freed=false;for(let t=0;t<2;t+=1/30){if(H.boatUnstick(1/30,p,true,false)){freed=true;break;}}
 assert(freed);assert.equal(classify(b,p.x,p.z),'water');assert(!H.boatUnstick(1/30,p,true,true),'never on the deck');H.resetBoatUnstick();
 const q={...w};for(let t=0;t<3;t+=1/30){q.x+=.05;assert(!H.boatUnstick(1/30,q,true,false),'moving is never stuck');}});
ok('beside a boat the sea is deep (swim), the swim range still counts the deck, piers keep their shelf',()=>{for(const b of D.DEEP_SEA_BOATS){
 const w=b.toWorld(-2.4*b.look.scale.length,b.hull.halfBeam+.4);assert.equal(W.waterDepthAt(w.x,w.z),W.DEPTH_MAX);
 const probe=W.createWaterProbe();probe.sample(w.x,w.z,1,true);assert.equal(probe.depth,W.DEPTH_MAX);assert(probe.d<1,'range from the deck');assert(probe.allowed(w.x+.5,w.z));
 assert.equal(W.canSplashDown(w.x,w.z),true,'a drop beside the boat is a splash');}});
ok('heat: no allocation-heavy calls, gated near a boat in Town',()=>{const src=fs.readFileSync(path.resolve(__dirname,'../lib/town/fishing/boatHull.ts'),'utf8'),town=fs.readFileSync(path.resolve(__dirname,'../components/Town.tsx'),'utf8');
 assert.doesNotMatch(src,/setInterval|setTimeout|requestAnimationFrame|new Array|\.map\(|\.filter\(/);
 assert.match(town,/if\(rideRef\.current==='walk'&&!rooftop\.state\.falling&&!rooftop\.jump\.active&&!animalRides\.riding&&nearBoat\(location\.x,location\.z\)\)\{const hr=resolveBoatHull\(location,rampBefore,onLandableDeck,performance\.now\(\)\/1000\);/);
 assert.match(fs.readFileSync(path.resolve(__dirname,'../lib/town/fishing/deepSeaBoat.ts'),'utf8'),/const deck=\{\.\.\.boat\.deck,floating:true\};/);});
unreg.forEach(u=>u());
if(failed){console.log(failed+' failed');process.exit(1);}console.log('boat-hull ok');
