// Summit Isle ball hunt (Oct 15 2026, lib/town/summitBalls.ts): fifteen new balls take the hunt from 100 to 115, found up the
// fruit trees, at four huts (one on its roof), in two caves, from the riddle board's riddles, by a Summit Kick score, on a padded
// crate on the summit, on a buoy in the whale shark's sea and high in the sky (the telescope was removed on Oct 15 2026). Checked against the island the game really builds (summitIsleWorld.ts with
// stub tools, as tests/summit-rides.cjs does):
//  1. count, ids, order (appended), save migration (a 100-ball save keeps the fox and every costume);
//  2. one new concept each: a concept tag no other ball has, no scene kind reused, no title/keyword overlap with the first 100,
//     a lesson, a practice prompt, and an IFAB source for every Law;
//  3. the mechanic mix;
//  4. placement: off the trails (≥ 4 m), the pitch, the kiosk, the lookout, the Summit Kick post, fishing posts, NPCs, orchard
//     trees and beach-find spots; huts and caves clear of all of them too; ≥ 10 m between balls;
//  5. reachable: a walk (flood fill over the walkable ground, round every collider) from the sandbar landing reaches every ground
//     ball; the buoy, the roof ball and the sky ball sit in open flight space; the buoy can be seen from the summit lookout;
//  6. each mechanic's trigger on the real coin-hunt runtime (tree kick/shake, Summit Kick reveal, loose pickup, the landing crate,
//     riddle board, parachute: roof, buoy, sky), and heat: no parcels or colliders for the new balls, the buoys still one draw, idle costs nothing;
//  7. rocks (user, Oct 15 2026: "fix running through rocks"): every rock bigger than a pebble has a collider covering its footprint.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {createLoader,browser}=require('./summit-harness.cjs');
const ROOT=path.join(__dirname,'..');
browser();
const T=require('three');
const load=createLoader({three:T});
const {COIN_QUEST,PRE_SUMMIT_IDS,sanitizeCoinProgress,coinRewardEarned,allCostumesEarned,costumeEarned,COSTUME_UNLOCK_ORDER,COIN_REWARD_ID,COIN_STORAGE_KEY}=load('lib/town/coinQuest.ts');
const SB=load('lib/town/summitBalls.ts'),S=load('lib/town/summitIsle.ts');
const {BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,SCENES}=load('lib/town/ballHuntLessons.ts'),{BALL_HUNT_SOURCES}=load('lib/town/ballHuntSources.ts');
const spots=SB.SUMMIT_BALL_SPOTS,first=COIN_QUEST.slice(0,100);

// ---- 1. Count, ids, order, saves.
assert.equal(spots.length,15,'fifteen Summit Isle balls');assert.equal(COIN_QUEST.length,115,'the hunt has 115 balls');
assert.equal(new Set(COIN_QUEST.map(s=>s.id)).size,115,'ids are unique');
assert.deepEqual(COIN_QUEST.slice(100).map(s=>s.id),SB.SUMMIT_BALL_IDS,'the new balls are appended, so saved ids keep their order');
assert.deepEqual(PRE_SUMMIT_IDS,first.map(s=>s.id));assert(spots.every(s=>s.summit),'every new ball is marked as a Summit Isle ball');
assert.equal(COIN_STORAGE_KEY,'fi2-matchday-coins-v1','the same save key (no new key to classify)');
{const old={version:5,revealed:PRE_SUMMIT_IDS,collected:PRE_SUMMIT_IDS,hint:null,celebrated:true,rewardUnlocked:false};
 const m=sanitizeCoinProgress(old);assert.equal(m.version,6);assert(m.rewardUnlocked&&coinRewardEarned(m)&&allCostumesEarned(m)&&COSTUME_UNLOCK_ORDER.every(id=>costumeEarned(m,id)),'a 100-ball save keeps the fox and every costume');
 assert(!m.celebrated,'the 115-ball finale is still ahead');assert(sanitizeCoinProgress(JSON.parse(JSON.stringify(m))).rewardUnlocked,'and keeps it after a re-save');
 assert(!coinRewardEarned(sanitizeCoinProgress({...old,collected:PRE_SUMMIT_IDS.slice(0,99)})),'99 of the old 100 does not unlock the fox');
 assert(!coinRewardEarned(sanitizeCoinProgress({...old,version:6})),'a version 6 save needs all 115');
 const all=sanitizeCoinProgress({version:6,collected:COIN_QUEST.map(s=>s.id)});assert(coinRewardEarned(all),'all 115 earn the fox');}
console.log('PASS 15 Summit Isle balls appended (115 in all), unique ids, same save key; 100-ball saves keep the fox and costumes');

// ---- 2. One new concept per ball, no overlap with the first 100.
const STOP=new Set('a an the and or of to in on at is it its you your if as be are for with by from can than that this they them their then so it’s don’t can’t one two up out off not no'.split(' '));
const words=t=>new Set(t.toLowerCase().replace(/[^a-z0-9’' -]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)));
const jaccard=(a,b)=>{const A=words(a),B=words(b);let n=0;for(const w of A)if(B.has(w))n++;return n/Math.max(1,new Set([...A,...B]).size);};
const title=s=>s.teaching.slice(0,s.teaching.indexOf('.'));
const oldKinds=new Set(first.map(s=>BALL_HUNT_LESSONS[s.id].kind));
const concepts=spots.map(s=>s.concept);assert(concepts.every(c=>typeof c==='string'&&/^[a-z0-9-]+$/.test(c)),'every ball has a concept tag');
assert.equal(new Set(concepts).size,15,'no two Summit balls share a concept tag');
for(const s of spots){const l=BALL_HUNT_LESSONS[s.id];
 assert(l&&SCENES[l.kind]&&BALL_HUNT_PRACTICE[s.id],`${s.id}: lesson, scene and practice prompt`);
 assert(!oldKinds.has(l.kind),`${s.id}: its scene (${l.kind}) is not one the first 100 balls teach`);
 const bare=s.concept.replace(/^(law\d+|skill|team|keeper)-/,'');assert(!oldKinds.has(bare)&&!oldKinds.has(s.concept),`${s.id}: concept ${s.concept} is new`);
 assert(s.teaching.length>=90&&s.teaching.length<=230&&s.clue.length>20&&s.detail.length>40,`${s.id}: tip, clue and detail`);
 for(const o of first){assert(jaccard(title(s),title(o))<.5,`${s.id} title overlaps ${o.id}: "${title(s)}" / "${title(o)}"`);
  assert(jaccard(s.teaching,o.teaching)<.3,`${s.id} tip overlaps ${o.id} (${jaccard(s.teaching,o.teaching).toFixed(2)})`);}
 if(s.concept.startsWith('law')){const n=s.concept.match(/^law(\d+)/)[1],src=BALL_HUNT_SOURCES[s.id];
  assert(src&&src.some(r=>r.url.startsWith('https://www.theifab.com/laws/')&&r.title.includes(`Law ${n} `)),`${s.id}: cites IFAB Law ${n}`);}}
const laws=concepts.filter(c=>c.startsWith('law')).length;assert(laws>=8&&laws<=11,`a mix of Laws (${laws}) and skills/teamwork (${15-laws})`);
console.log(`PASS concepts: 15 new tags (${laws} Laws of the Game, ${15-laws} skills, goalkeeping and teamwork), new scenes, no title or keyword overlap with the first 100, IFAB sources`);
console.log('     '+spots.map(s=>`${s.id}=${s.concept}`).join(', '));

// ---- 3. Mechanics.
const mech=s=>s.reveal==='tree'?'tree':s.reveal==='score'?'summit-kick':s.buoy?'buoy':s.id==='summit-hut-roof'?'hut-roof':s.parachute?'sky':s.kind==='landing'?'crate':s.riddle?'riddle':/hut/.test(s.id)?'hut':/cave/.test(s.id)?'cave':'?';
const tally={};for(const s of spots)tally[mech(s)]=(tally[mech(s)]||0)+1;
assert.deepEqual(tally,{tree:2,'hut-roof':1,crate:1,hut:3,cave:2,riddle:3,'summit-kick':1,buoy:1,sky:1},'mechanic mix '+JSON.stringify(tally));
assert(!spots.some(s=>s.reveal==='scope'),'nothing depends on the (removed) telescope');assert.equal(SB.SUMMIT_HUTS.length,4);assert.equal(SB.SUMMIT_CAVES.length,2);
console.log('PASS mechanics',JSON.stringify(tally));

// ---- 4. Placement against the built island.
const obstacles=[],town=new T.Group(),W=load('lib/town/summitIsleWorld.ts'),mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
W.buildSummitIsle({box:(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder:(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,10));m.position.set(x,y,z);return m;},
 sign:(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;},town,obstacles,assets:[],surfaceAreas:[]});
const {insideObstacle,flightBlocked}=load('lib/town/simulation.ts');
const scope={x:602.8,z:101.45}/* where the lookout telescope stood (removed Oct 15 2026): kept clear */,kick=load('lib/town/summitKick.ts').kickLayout(),snack=load('lib/town/vendingPlaces.ts').summitSnackSpot();
const npcs=load('lib/town/summitIsleNpcs.ts').SUMMIT_ISLE_NPCS,fish=load('lib/town/fishing/fishCatalog.ts').FISH_SPOTS.filter(s=>s.area==='summit');
const BC=load('lib/town/beachcombing.ts'),beach=BC.BEACH_ZONES.filter(z=>z.island==='summit').flatMap(z=>BC.zoneCandidates(z));
const trees=W.SUMMIT_TREE_SITES,P=S.SUMMIT_PITCH,F=S.SUMMIT_FENCE;
const seg=(x,z,a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);};
const trail=(x,z)=>{let d=Infinity;for(const p of S.SUMMIT_PATHS)for(let i=0;i<p.length-1;i++)d=Math.min(d,seg(x,z,p[i],p[i+1]));return d;};
const near=(list,x,z)=>Math.min(...list.map(p=>Math.hypot(p.x-x,p.z-z)));
const inFence=(x,z,pad=0)=>Math.abs(x-P.x)<F.halfX+pad&&Math.abs(z-P.z)<F.halfZ+pad;
// The orchard and the forage pool are unchanged by the new huts and caves (they are added after the orchard is planned).
{const tm=SB.TREE_BALL_TREES;for(const t of Object.values(tm)){const site=trees.find(s=>s.form&&Math.hypot(s.x-t.x,s.z-t.z)<.3);assert(site,`tree ball tree (${t.x}, ${t.z}) is an orchard tree`);assert(Math.abs(site.top.y-t.top)<.3,'and its canopy top matches');}}
const ground=spots.filter(s=>!s.parachute&&s.reveal!=='score');
for(const s of ground){
 assert(S.onSummitGround(s.x,s.z),`${s.id} is on Summit Isle ground`);assert(Math.abs(S.summitGround(s.x,s.z)-s.y)<.02,`${s.id}: y is the walked ground`);
 assert(trail(s.x,s.z)>=4,`${s.id} is ≥ 4 m from every trail (${trail(s.x,s.z).toFixed(1)})`);
 assert(!inFence(s.x,s.z,.8),`${s.id} is outside the pitch's fence`);
 assert(Math.hypot(s.x-scope.x,s.z-scope.z)>=8,`${s.id} clear of the lookout shoulder (the old telescope spot)`);assert(Math.hypot(s.x-snack.x,s.z-snack.z)>=6,`${s.id} clear of the kiosk`);
 assert(Math.hypot(s.x-kick.post.x,s.z-kick.post.z)>=6,`${s.id} clear of the Summit Kick post`);
 assert(near(fish,s.x,s.z)>=12,`${s.id} clear of the fishing posts and their floats (${near(fish,s.x,s.z).toFixed(1)})`);
 assert(near(npcs,s.x,s.z)>=8,`${s.id} clear of the NPCs' spots (${near(npcs,s.x,s.z).toFixed(1)})`);
 const own=s.tree?trees.filter(t=>!(Math.hypot(t.x-s.tree.x,t.z-s.tree.z)<.3)):trees;assert(near(own,s.x,s.z)>=2.5,`${s.id} clear of the trees (${near(own,s.x,s.z).toFixed(1)})`);
 if(s.tree){const d=Math.hypot(s.x-s.tree.x,s.z-s.tree.z);assert(d>=1.5&&d<=3,`${s.id} drops beside its trunk (${d.toFixed(1)} m)`);}
 assert(near(beach,s.x,s.z)>=2,`${s.id} clear of the beach-find spots (${near(beach,s.x,s.z).toFixed(1)})`);
 assert(!obstacles.some(o=>insideObstacle(s.x,s.z,o,.05)),`${s.id} is not inside a collider`);}
{const score=spots.find(s=>s.reveal==='score');assert(Math.hypot(score.x-kick.post.x,score.z-kick.post.z)<.6&&Math.abs(score.y-kick.ground)<.1,'the Summit Kick ball pops out of the kick post');}
// Huts and caves: their colliders and footprints clear of trails, the pitch, the kiosk, the lookout shoulder, fishing posts, NPCs,
// trees and beach finds.
const R=SB.SUMMIT_HUT_RADIUS,footprints=[...SB.SUMMIT_HUTS.map(h=>({id:'hut '+h.id,x:h.x,z:h.z,r:R+(h.porch?1.8:.6)})),
 ...SB.SUMMIT_CAVES.map(c=>({id:'cave '+c.id,x:c.x-c.mouth.x*1.4,z:c.z-c.mouth.z*1.4,r:3.6}))];
for(const f of footprints){
 assert(trail(f.x,f.z)-f.r>=4,`${f.id} is ≥ 4 m from every trail (${(trail(f.x,f.z)-f.r).toFixed(1)})`);assert(!inFence(f.x,f.z,f.r+3),`${f.id} clear of the pitch`);
 for(const [what,list,gap] of [['lookout shoulder',[scope],8],['kiosk',[snack],8],['kick post',[kick.post],8],['fishing post',fish,10],['NPC',npcs,6]])assert(near(list,f.x,f.z)-f.r>=gap,`${f.id} clear of the ${what}`);
 assert(near(trees,f.x,f.z)-f.r>=1.5,`${f.id} clear of the trees (${(near(trees,f.x,f.z)-f.r).toFixed(1)})`);
 assert(!beach.some(b=>Math.hypot(b.x-f.x,b.z-f.z)<f.r+.7),`${f.id} covers no beach-find spot`);}
let closest=Infinity;for(const a of spots)for(const b of COIN_QUEST){if(a===b||b.truck!==undefined)continue;const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);closest=Math.min(closest,d);assert(d>=10,`${a.id} and ${b.id} are only ${d.toFixed(1)} m apart`);}
console.log(`PASS placement: trails ≥ 4 m, the pitch, kiosk, lookout shoulder, kick post, fishing posts, NPCs, trees, beach finds; huts and caves clear too; balls ≥ 10 m apart (closest ${closest.toFixed(1)} m)`);

// ---- 5. Reachable.
// Walk: flood fill on a 0.5 m grid over Summit Isle's walkable ground (onSummitGround, as movement uses) from the sandbar landing,
// round every collider with the walker's radius; each ground ball must have a reached cell within its pickup radius.
{const step=.5,B=S.SUMMIT_BOX,x0=B.minX-2,z0=B.minZ-2,nx=Math.ceil((B.maxX-x0+2)/step),nz=Math.ceil((B.maxZ-z0+2)/step);
 const cells=new Map(),C=4,key=(i,j)=>i*100000+j;for(const o of obstacles){const r=Math.max(o.w,o.d)/2+.5;for(let i=Math.floor((o.x-r)/C);i<=Math.floor((o.x+r)/C);i++)for(let j=Math.floor((o.z-r)/C);j<=Math.floor((o.z+r)/C);j++){let l=cells.get(key(i,j));if(!l)cells.set(key(i,j),l=[]);l.push(o);}}
 const solid=(x,z)=>(cells.get(key(Math.floor(x/C),Math.floor(z/C)))??[]).some(o=>insideObstacle(x,z,o,.32));
 const seen=new Uint8Array(nx*nz),q=[];const L=S.SUMMIT_LANDMARKS.sandbarLanding,si=Math.round((L.x-x0)/step),sj=Math.round((L.z-z0)/step);seen[sj*nx+si]=1;q.push(si,sj);
 for(let h=0;h<q.length;h+=2){const i=q[h],j=q[h+1];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz||seen[b*nx+a])continue;const x=x0+a*step,z=z0+b*step;
  if(!S.onSummitGround(x,z)||solid(x,z))continue;seen[b*nx+a]=1;q.push(a,b);}}
 const reached=(x,z,r)=>{for(let i=Math.floor((x-r-x0)/step);i<=Math.ceil((x+r-x0)/step);i++)for(let j=Math.floor((z-r-z0)/step);j<=Math.ceil((z+r-z0)/step);j++){if(i<0||j<0||i>=nx||j>=nz)continue;if(seen[j*nx+i]&&Math.hypot(x0+i*step-x,z0+j*step-z)<=r)return true;}return false;};
 for(const s of [...ground,spots.find(s=>s.reveal==='score')])assert(reached(s.x,s.z,s.reveal==='score'?3.5:1),`${s.id} can be walked to from the sandbar landing`);
 console.log(`PASS walk: a flood fill from the sandbar landing (${q.length/2} cells round every collider) reaches every ground ball`);}
for(const s of spots.filter(s=>s.parachute)){assert(!flightBlocked(s.x,s.z),`${s.id} is inside the flight zone`);
 if(s.buoy){assert(S.inSummitSea(s.x,s.z)&&S.distanceToSummitLand(s.x,s.z)>10&&s.y===0,'the buoy floats in open sea, off the island');
  const shark=load('lib/town/summitSeaLife.ts').WHALE_SHARK_LOOP.points,d=near(shark,s.x,s.z);assert(d>=10&&d<=25,`the buoy is near the whale shark's loop, not on it (${d.toFixed(1)} m)`);}
 else if(s.id!=='summit-hut-roof')assert(s.y-S.summitGround(s.x,s.z)>=60,'the sky ball floats high above the slopes');}
{const L=S.SUMMIT_LANDMARKS.lookout,ex=L.x-6,ez=L.z-1.5/* the lookout's grassy edge, a few steps west of the flag */,eye={x:ex,y:S.summitGround(ex,ez)+1.5,z:ez},los=(x,y,z)=>{for(let i=5;i<200;i++){const t=i/200,px=eye.x+(x-eye.x)*t,pz=eye.z+(z-eye.z)*t,py=eye.y+(y-eye.y)*t;if(S.summitGround(px,pz)>py-.2)return false;}return true;};
 const buoy=spots.find(s=>s.buoy);assert(los(buoy.x,.6,buoy.z),'the whale-shark buoy can be seen from the summit lookout');}
{const roof=spots.find(s=>s.id==='summit-hut-roof'),h=SB.SUMMIT_HUTS.find(h=>h.id==='sunset');assert(Math.hypot(roof.x-h.x,roof.z-h.z)<.01&&Math.abs(roof.y-(SB.hutRoofTip(h)+S.SUMMIT_VISUAL_DROP))<.02,'the roof ball sits on the sunset hut\'s roof tip');}
console.log('PASS fly: the buoy, the roof ball and the sky ball are in open flight space; the buoy is in sight of the lookout; the roof ball sits on its hut');
// Hut roofs (Oct 15 2026, user: "it's not possible to land on this hut"): every hut's straw cone is a landable, walkable roof.
{const {createRooftopTravel}=load('lib/town/rooftopTravel.ts'),rt=createRooftopTravel([],obstacles,{x:600,z:100});
 const K=SB.HUT_CONE/SB.HUT_CONE_RADIUS;
 for(const h of SB.SUMMIT_HUTS){const apex=SB.hutRoofTip(h)+S.SUMMIT_VISUAL_DROP,steps=SB.hutRoofSteps(h);
  const drum=obstacles.find(o=>Math.hypot(o.x-h.x,o.z-h.z)<.01&&o.cornerRadius);assert(drum&&drum.w===steps.at(-1).w&&drum.d===steps.at(-1).d,`${h.id}: the outer roof step shares the drum collider's footprint`);
  assert(steps[0].w>=1&&Math.abs(steps[0].height-apex)<=.1,`${h.id}: a landing disc at the apex`);
  for(let i=1;i<steps.length;i++)assert(steps[i-1].height-steps[i].height<=.35&&steps[i].height<steps[i-1].height,`${h.id}: roof steps ≤ .35 m apart, a walk down the cone`);
  for(const r of [0,.3,.7,1.1,1.5,1.9,2]){const f=rt.surface(h.x+r,h.z,Infinity),cone=apex-K*r;assert(f>=cone-.15&&f<=cone+.15,`${h.id}: the roof floor follows the cone at ${r} m (${f.toFixed(2)} vs ${cone.toFixed(2)})`);}
  assert(rt.canLand(h.x,h.z,Infinity)&&Math.abs(rt.surface(h.x,h.z,Infinity)-apex)<.1,`${h.id}: the jetpack can land on the apex`);
  for(const [dx,dz] of [[0,0],[1.5,.5],[-2.5,1],[.3,-2.8]]){const at=rt.findLanding(h.x+dx,h.z+dz);assert(at&&Math.hypot(at.x-h.x,at.z-h.z)<=SB.HUT_LAND_RADIUS,`${h.id}: findLanding from above the roof (${dx}, ${dz}) lands on its apex`);}
  // From the ground the drum is a wall: standing beside it, the floor is the grass, and the roof is not a step up.
  const gx=h.x+SB.SUMMIT_HUT_RADIUS+.6,gz=h.z;assert(rt.surface(gx,gz)<apex-2,`${h.id}: beside the hut is the grass`);
  rt.reset(h.x,h.z,rt.surface(h.x,h.z,Infinity));const p={x:h.x,z:h.z},v={x:0,z:0};for(let i=0;i<20;i++)rt.update(1/30,p,v,{x:0,z:0,sprint:false},'walk');
  assert(Math.abs(rt.state.height-(apex-.08))<.02&&!rt.state.falling,`${h.id}: standing on the apex holds`);
  const p2={x:h.x,z:h.z},v2={x:0,z:0};let fell=false;for(let i=0;i<150&&!fell;i++){rt.update(1/30,p2,v2,{x:1,z:0,sprint:false},'walk');fell=rt.state.falling||rt.jump.active||rt.state.height<apex-2;}
  assert(fell||Math.hypot(p2.x-h.x,p2.z-h.z)>SB.HUT_DRUM_W/2,`${h.id}: walking off the roof leaves it`);}
 const roof=spots.find(s=>s.id==='summit-hut-roof'),sunset=SB.SUMMIT_HUTS.find(h=>h.id==='sunset');assert(roof.perch&&Math.abs(rt.surface(sunset.x,sunset.z,Infinity)-roof.y)<.1,'the roof ball sits at the apex floor (reachable by landing on it)');}
console.log('PASS hut roofs: every hut has a landable apex disc and a stepped walkable cone, findLanding over a hut picks its apex, the roof ball is on the floor');

// ---- 6. Mechanics on the real runtime (a fresh module graph per scenario: coin progress is module state).
async function hunt(){const b=browser();const T2=require('three');const L2=createLoader({three:T2});const got=[],near=[];const h=L2('lib/graphics/coinHunt.ts').createCoinHunt(new T2.Scene(),s=>got.push(s.id),t=>near.push(t));return {h,got,near,L:L2,b};}
(async()=>{
 const at=(s,dx=0,dz=0)=>({x:s.x+dx,y:s.y,z:s.z+dz});
 // Loose balls (huts, caves, riddles): no parcel, picked up by walking to them.
 {const {h,got,near}=await hunt();for(const s of spots.filter(s=>s.loose)){const g=h.root.getObjectByName('coin-spot-'+s.id);let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,1,`${s.id}: one mesh (the ball), no parcel`);
   h.update(.1,at(s,2.2),true,false);assert(!got.includes(s.id),`${s.id}: not collected from 2.2 m`);assert(near.at(-1),`${s.id}: a nearby hint`);
   h.update(.1,at(s,.5),true,false);assert(got.includes(s.id),`${s.id}: collected at the spot`);}
  assert.equal(got.length,8,'eight loose balls collected (3 huts, 2 caves, 3 riddles)');h.dispose();}
 // Tree balls: hidden until the trunk is hit (a kick) or the tree shaken; then the ball drops beside it.
 {const {h,got,near}=await hunt();const s=spots.find(s=>s.reveal==='tree'),g=h.root.getObjectByName('coin-spot-'+s.id),coin=g.children[1];
  h.update(.1,at(s,.3),true,false);assert(!got.length&&!coin.visible,'the tree ball is invisible and cannot be collected before the tree is hit');assert.equal(near.at(-1),s.near,'its hint says to kick or shake the tree');
  assert(!h.treeHit(s.tree.x+3,s.tree.z,s.y+1),'a kick that misses the trunk does nothing');assert(!h.treeHit(s.tree.x,s.tree.z,s.y+9),'a ball high over the canopy does nothing');
  assert(h.treeHit(s.tree.x+.4,s.tree.z,s.y+1),'a kick at the trunk drops it');h.update(.05,at(s,.3),true,false);assert(coin.visible&&coin.position.y>2,'it falls from the canopy');
  for(let i=0;i<12;i++)h.update(.1,at(s,.3),true,false);assert.deepEqual(got,[s.id],'then it is picked up beside the trunk');h.dispose();}
 {const {h,got}=await hunt();const s=spots.filter(s=>s.reveal==='tree')[1];h.update(.1,at(s,6),true,false);assert(h.treeHit(s.tree.x,s.tree.z),'a hand shake of the tree (no height) drops it too');for(let i=0;i<8;i++)h.update(.1,at(s,.4),true,false);assert.deepEqual(got,[s.id]);h.dispose();}
 // The padded crate on the summit: land on it (or kick its target), then pick the ball up.
 {const {h,got}=await hunt();const s=spots.find(s=>s.kind==='landing');h.update(.1,at(s,.3),true,false);assert(!got.length,'not before it is opened');
  h.land({x:s.x+.4,y:s.y+.3,z:s.z});for(let i=0;i<8;i++)h.update(.1,at(s,.4),true,false);assert.deepEqual(got,[s.id],'landed on, then picked up');h.dispose();}
 {const {h,got}=await hunt();const s=spots.find(s=>s.kind==='landing');h.update(.1,at(s,3),true,false);assert(h.hit(s.x,s.y+.4,s.z+.7,0,-6),'a kick opens it too');for(let i=0;i<8;i++)h.update(.1,at(s,.4),true,false);assert.deepEqual(got,[s.id]);h.dispose();}
 // Summit Kick: revealed by a qualifying round, then picked up anywhere near the post.
 {const {h,got,near,L:L2}=await hunt();const s=spots.find(s=>s.reveal==='score');h.update(.1,at(s,2),true,false);assert(!got.length);assert(near.at(-1).includes('Summit Kick'),'the post hint names the challenge');
  L2('lib/town/coinProgress.ts').recordCoin(s.id,'reveal');for(let i=0;i<8;i++)h.update(.1,at(s,3),true,false);assert.deepEqual(got,[s.id]);h.dispose();}
 // The riddle board reads out the riddles still to solve.
 {const {h,near}=await hunt();const B=SB.RIDDLE_BOARD;h.update(.1,{x:B.x+.8,y:S.summitGround(B.x+.8,B.z+1),z:B.z+1},true,false);const t=near.at(-1);
  assert(t.startsWith('Riddle board')&&spots.filter(s=>s.riddle).every(s=>t.includes(s.riddle)),'standing at the board shows its three riddles');h.dispose();}
 // Parachute balls: the roof tip, the buoy and the sky ball.
 {const {h,got}=await hunt();for(const s of spots.filter(s=>s.parachute)){h.update(.1,{x:s.x+1,y:s.y+1,z:s.z},true,false,null,false,true);assert(!got.includes(s.id),`${s.id}: not without the parachute`);
   h.update(.1,{x:s.x+1,y:s.y+1,z:s.z},true,false,null,true,true);assert(got.includes(s.id),`${s.id}: an open parachute collects it`);}
  {const {h:h2,got:g2}=await hunt(),s=spots.find(s=>s.perch);assert.deepEqual(spots.filter(s=>s.perch).map(s=>s.id),['summit-hut-roof']);
   for(let i=0;i<8;i++)h2.update(.1,{x:s.x+.4,y:s.y-.08,z:s.z},true,false);assert(g2.includes(s.id),'standing on the hut roof (landed, not parachuting) collects the roof ball');h2.dispose();}
  const buoys=h.buoyScenery;assert(buoys.children.length===1,'every buoy (Coral Cay\'s and the whale-shark one) is still one packed draw');h.dispose();}
 // Heat: no colliders for the new balls, nothing animates far away.
 {const {h}=await hunt();const props=[],obs=[];h.connectCollisions(obs,props);const ids=new Set(SB.SUMMIT_BALL_IDS);assert(!props.some(p=>spots.some(s=>(s.loose||s.reveal)&&s.x===p.x&&Math.abs(s.z-p.z)<.3)),'loose and event balls add no colliders');assert.equal(props.filter(p=>spots.some(s=>s.x===p.x&&s.z===p.z)).length,1,'only the landing crate is solid');
  h.update(.1,{x:-200,y:0,z:0},true,false);assert(!spots.some(s=>{const g=h.root.getObjectByName('coin-spot-'+s.id);return g.children[1].scale.x!==1&&!s.parachute;}),'no twinkle when far');void ids;h.dispose();}
 console.log('PASS runtime: loose pickups, tree kick/shake drop, the summit crate (landing or kick), Summit Kick reveal, riddle board, parachute roof tip, buoy and sky ball; no parcels or colliders for loose balls, buoys one draw');

 // Wiring: who reveals what (Town, fruitTrees, summitActivities), and the counter.
 const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
 assert.match(src('components/Town.tsx'),/forage\.ballHit\(x,y,z,walkBall\.state\.vx,walkBall\.state\.vz\);coinHunt\.treeHit\(x,z,y\);/,'a kicked ball hitting a trunk calls treeHit (collision only, never per frame)');
 assert.match(src('components/Town.tsx'),/shook:\(x,z\)=>coinHunt\.treeHit\(x,z\)/,'the forage shake calls treeHit');
 assert.match(src('lib/graphics/fruitTrees.ts'),/if\(last\)ports\.shook\?\.\(t\.x,t\.z\)/,'on the shake\'s last push');
 const sa=src('lib/graphics/summitActivities.ts');assert.match(sa,/s\.hits>=SCORE_BALL_HOOPS&&!ballRevealed\(SCORE_BALL\.id\)&&recordCoin\(SCORE_BALL\.id,'reveal'\)/,'a Summit Kick round with enough hoops reveals the kick-post ball');
 assert.match(src('lib/graphics/coinHunt.ts'),/if\(s\.summit\)countSummitBall\(\)/,'admin analytics: one count per Summit ball found');
 console.log('PASS wiring: trunk hits and shakes, Summit Kick, analytics counter');

 // ---- 7. Rocks: every rock bigger than a pebble blocks to (at least 80% of) its footprint.
 let checked=0;for(const r of W.SUMMIT_ROCK_SITES){if(r.reach<W.SUMMIT_PEBBLE)continue;checked++;
  const o=obstacles.find(o=>Math.hypot(o.x-r.x,o.z-r.z)<.3&&Math.min(o.w,o.d)/2>=.8*r.reach-.01);assert(o,`the rock at (${r.x.toFixed(1)}, ${r.z.toFixed(1)}) reach ${r.reach.toFixed(2)} has a collider covering its footprint`);}
 assert(checked>=30,`${checked} rocks checked`);
 console.log(`PASS rocks: ${checked} rocks and boulders (headlands, crests, terrace banks, cairn, caves) each block ≥ 80% of their reach; pebbles stay walk-through`);
})().catch(e=>{console.error(e);process.exit(1);});
