// DRIP FC Stadium ball hunt (Nov 13 2026, lib/town/stadiumBalls.ts): twelve loose balls take the hunt from 116 to 128, on the
// plaza, by the gate, in the park (a lawn, the lily pond's shore, an orchard), on both long stands' roofs, in an aisle of three
// stands and on the south concourse under the big screen. Checked against the town the game really builds (world.ts, the same
// rooftop travel Town drives, as tests/west-stadium.cjs does):
//  1. count, ids, order (appended after the East Jetty ball), every place the hunt is counted;
//  2. one new concept each: no scene kind or concept tag any island or reef ball already has, no title / tip overlap, no topic
//     words taught elsewhere, a lesson + scene + practice prompt each, an IFAB source for every Law, no links in kid UI;
//  3. placement: ground balls on the island, clear of colliders, trees, the pond and (park balls) the paths; plaza balls on the
//     plaza clear of its flags, benches and planters; stand balls on an aisle tread, never in a seat or by a stand flag; the
//     screen ball under the screen; roof balls on the slab top; every ball ≥ 10 m from every other ball;
//  4. reachable: a walk (flood fill round every collider) from the plaza reaches every ground ball; a real walk with the rooftop
//     travel climbs each stand ball's aisle to it (and the south aisle to the screen ball); a landing from the sky puts the feet
//     on each roof ball's slab;
//  5. the coin-hunt runtime collects each one where it rests (and not from below / afar), with no parcel and no collider (heat);
//  6. the card offer: a collected ball goes to earnForBall (kind 'ball', the child picks a card) and the lesson card;
//  7. saves: same key, version 9; a version 8 save keeps its pending lesson, a 116-ball save keeps the fox and every costume.
// usage: node tests/stadium-balls.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const store=new Map();
const context=vm.createContext({console,Math,Set,Map,performance,Date,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,
 window:{addEventListener:()=>{},removeEventListener:()=>{},matchMedia:()=>({matches:false})},requestAnimationFrame:()=>1,setTimeout:()=>1,setInterval:()=>1,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){const file=path.resolve(base,name);if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='react'?{useSyncExternalStore:(_s,get)=>get()}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):id.startsWith('@/')?load(path.resolve(base,id.slice(2))+'.ts'):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id));cache.set(file,mod.exports);return mod.exports;}

const Q=load('lib/town/coinQuest.ts'),SB=load('lib/town/stadiumBalls.ts'),{COIN_QUEST}=Q,spots=SB.STADIUM_BALL_SPOTS;
const {BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,DIVE_BALL_LESSONS,DIVE_BALL_PRACTICE,SCENES,ballLessonFrames}=load('lib/town/ballHuntLessons.ts'),{BALL_HUNT_SOURCES}=load('lib/town/ballHuntSources.ts');
const L=load('lib/town/westParkLayout.ts'),S=load('lib/town/stadiumSeats.ts'),sim=load('lib/town/simulation.ts'),{onIsland}=load('lib/town/shoreline.ts');

// ---- 1. Count, ids, order, counted everywhere.
assert.equal(spots.length,12,'twelve stadium balls');assert.equal(COIN_QUEST.length,128,'the hunt has 128 balls');assert.equal(new Set(COIN_QUEST.map(s=>s.id)).size,128,'ids are unique');
assert.deepEqual(COIN_QUEST.slice(116).map(s=>s.id),SB.STADIUM_BALL_IDS,'appended last, so saved ids keep their order');assert.equal(COIN_QUEST[115].id,'jetty-lighthouse','after the East Jetty ball');
assert.deepEqual(Q.PRE_STADIUM_IDS,COIN_QUEST.slice(0,116).map(s=>s.id));assert(spots.every(s=>s.stadium&&s.loose&&s.kind==='hidden'&&!s.parachute&&!s.summit),'loose stadium balls (walked to)');
assert(spots.every(s=>s.id.startsWith('stadium-')&&Number.isFinite(s.x+s.y+s.z)));
{const txt=read('lib/site/learnFeatures.ts');assert(txt.includes('counts:{hiddenBalls:128}')&&txt.includes("'128 hidden balls to find'")&&!/\b116 hidden balls/.test(txt),'the learn page counts 128 (tests/learn-content.cjs checks it against COIN_QUEST)');}
assert.equal(Q.costumeMilestones().at(-1),128,'the Matchday Fox needs every ball (128)');assert.equal(Q.costumesAtMilestone(116),0,'116 unlocks nothing now');
console.log('PASS 12 stadium balls appended (128 in all, after the East Jetty ball), unique ids; the learn page and the fox milestone count 128');

// ---- 2. Concepts: new, one each, accurate format.
const words=t=>new Set(t.toLowerCase().replace(/[^a-z0-9’' -]/g,' ').split(/\s+/).filter(w=>w.length>2&&!STOP.has(w)));
const STOP=new Set('a an the and or of to in on at is it its you your if as be are for with by from can than that this they them their then so it’s don’t can’t one two up out off not no'.split(' '));
const jaccard=(a,b)=>{const A=words(a),B=words(b);let n=0;for(const w of A)if(B.has(w))n++;return n/Math.max(1,new Set([...A,...B]).size);};
const title=s=>s.teaching.slice(0,s.teaching.indexOf('.'));
const ids=new Set(SB.STADIUM_BALL_IDS),others=COIN_QUEST.filter(s=>!ids.has(s.id));
const oldKinds=new Set([...others.map(s=>BALL_HUNT_LESSONS[s.id].kind),...Object.values(DIVE_BALL_LESSONS).map(l=>l.kind)]);
const oldConcepts=new Set(others.map(s=>s.concept).filter(Boolean));
const otherText=[...others.map(s=>s.teaching),...others.flatMap(s=>BALL_HUNT_LESSONS[s.id].steps),...Object.values(DIVE_BALL_LESSONS).flatMap(l=>l.steps),...Object.values(DIVE_BALL_PRACTICE)].join(' ').toLowerCase();
// The topic words of each idea: none may appear in any other ball's tip or steps (island or reef).
const TOPIC={'stadium-gate':['steward'],'stadium-plaza-flags':['anthem','shake hands','shakes hands'],'stadium-plaza-street':['added time','added minutes','time lost'],
 'stadium-lawn':['stripe','mow'],'stadium-pond':['centre circle','9.15'],'stadium-orchard':['corner arc','quarter-circle','corner flag'],
 'stadium-west-roof':['goal-line technology','watch buzzes'],'stadium-east-roof':['floodlight'],'stadium-west-stand':['all-seater','terrace','numbered seat'],
 'stadium-east-stand':['technical area'],'stadium-north-stand':['away kit','second kit','colour clash','changes kit'],'stadium-screen':['var','video assistant','replay']};
assert.deepEqual(Object.keys(TOPIC).sort(),[...ids].sort());
const concepts=spots.map(s=>s.concept);assert(concepts.every(c=>typeof c==='string'&&/^[a-z0-9-]+$/.test(c)),'a concept tag each');assert.equal(new Set(concepts).size,12,'no two share a tag');
for(const s of spots){const l=BALL_HUNT_LESSONS[s.id];
 assert(l&&SCENES[l.kind]&&BALL_HUNT_PRACTICE[s.id]&&ballLessonFrames(l.kind).length===3,`${s.id}: lesson, three-step scene and practice prompt`);
 assert(!oldKinds.has(l.kind),`${s.id}: its scene (${l.kind}) is not one any other ball teaches`);
 const bare=s.concept.replace(/^(law\d+|world|rules|team|skill|keeper)-/,'');assert(!oldConcepts.has(s.concept)&&!oldKinds.has(bare),`${s.id}: concept ${s.concept} is new`);
 assert.equal(bare,l.kind,`${s.id}: the tag names the scene it teaches`);
 assert(s.teaching.length>=90&&s.teaching.length<=230&&s.clue.length>20&&s.detail.length>40&&s.near,`${s.id}: tip, clue, detail, hint`);
 for(const o of others){assert(jaccard(title(s),title(o))<.5,`${s.id} title overlaps ${o.id}: "${title(s)}" / "${title(o)}"`);assert(jaccard(s.teaching,o.teaching)<.3,`${s.id} tip overlaps ${o.id} (${jaccard(s.teaching,o.teaching).toFixed(2)})`);}
 for(const w of TOPIC[s.id]){assert(!new RegExp(`\\b${w.replace('.','\\.')}`).test(otherText),`${s.id}: “${w}” is already taught by another ball`);}
 assert(TOPIC[s.id].some(w=>(s.teaching+' '+l.steps.join(' ')).toLowerCase().includes(w)),`${s.id}: its own lesson teaches its topic`);
 const kid=[s.teaching,s.clue,s.detail,s.near,...l.steps,...l.actions,BALL_HUNT_PRACTICE[s.id],...ballLessonFrames(l.kind).flatMap(f=>[f.note,...f.tags.map(t=>t.text),...f.zones.map(z=>z.label),...f.nodes.map(n=>n.label)])];
 for(const t of kid)assert(!/https?:|www\.|\.com|\.org/.test(t),`${s.id}: no links in kid UI (${t})`);
 const src=BALL_HUNT_SOURCES[s.id];assert(src&&src.length&&src.every(r=>r.title&&/^https:\/\//.test(r.url)),`${s.id}: a source`);
 if(s.concept.startsWith('law')){const n=s.concept.match(/^law(\d+)/)[1];assert(src.some(r=>r.url.startsWith('https://www.theifab.com/laws/')&&r.title.includes(`Law ${n} `)),`${s.id}: cites IFAB Law ${n}`);}
 assert.equal(l.level,s.y>10?3:2,`${s.id}: level 2 (3 on a roof)`);}
assert.equal(new Set([...COIN_QUEST.map(s=>BALL_HUNT_LESSONS[s.id].kind),...Object.values(DIVE_BALL_LESSONS).map(l=>l.kind)]).size,128+7,'135 different scenes across the island and the reef');
const laws=concepts.filter(c=>c.startsWith('law')).length;assert(laws>=4&&laws<=8,`a mix of Laws (${laws}) and stadium/matchday ideas (${12-laws})`);
console.log(`PASS concepts: 12 new ideas (${laws} Laws of the Game, ${12-laws} stadium and matchday), no scene, tag, title, tip or topic shared with the other 116 balls or the 7 reef balls; IFAB sources; no links`);
console.log('     '+spots.map(s=>`${s.id}=${s.concept}`).join(', '));

// ---- 3. Placement against the built town.
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const G=L.STADIUM_GATE,P=L.STADIUM_PLAZA,ST=L.STADIUM;
const travel=()=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x:G.x+8,z:G.z},world.roofObstacles,()=>0,world.landingExclusions,world.canopies);
const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm'),orchard=load('lib/town/stadiumOrchard.ts').stadiumOrchardTrees();
const ROOF_TOP=S.ROOF.y+S.ROOF.thick/2;assert.equal(SB.STADIUM_ROOF_TOP,ROOF_TOP);
const kindOf=s=>s.y>10?'roof':s.id==='stadium-screen'?'screen':s.y>0?'stand':L.inStadiumFootprint(s.x,s.z)?'?':s.x>P.minX-6&&s.x<P.maxX&&s.z>P.minZ&&s.z<P.maxZ?'plaza':'park';
const tally={};for(const s of spots)tally[kindOf(s)]=(tally[kindOf(s)]||0)+1;
assert.deepEqual(tally,{plaza:3,park:3,roof:2,stand:3,screen:1},'the spread '+JSON.stringify(tally));
const t0=travel(),solid=(x,z,r)=>sim.blocked(x,z,world.obstacles,r);
const flags=load('lib/town/stadiumCrowd.ts').standFlagSpots(8);
for(const s of spots){const k=kindOf(s);
 if(k==='plaza'||k==='park'){
  assert(onIsland(s.x,s.z)&&s.y===0,`${s.id}: on the island's ground`);assert(!solid(s.x,s.z,.9),`${s.id}: clear of every collider (0.9 m)`);
  assert(Math.min(...trees.map(t=>Math.hypot(t.x-s.x,t.z-s.z)))>=2.5,`${s.id}: clear of trees and palms`);assert(Math.min(...orchard.map(t=>Math.hypot(t.x-s.x,t.z-s.z)))>=2.5,`${s.id}: clear of the orchard trees`);
  assert(!L.inPond(s.x,s.z,L.POND_RIM+3),`${s.id}: not in (or on the rim of) the pond`);assert(Math.abs(t0.surface(s.x,s.z,1))<.05,`${s.id}: at ground height`);
  if(k==='park'){assert(!L.onParkPaving(s.x,s.z,3),`${s.id}: off the paths (≥ 3 m beyond their edges)`);assert(L.onGrass(s.x,s.z),`${s.id}: on the lawn`);}
  else{assert(L.onParkPaving(s.x,s.z),`${s.id}: on the plaza paving`);for(const f of S.plazaFlagPoles())assert(Math.hypot(f.x-s.x,f.z-s.z)>=3,`${s.id}: clear of the plaza flags`);}}
 if(k==='stand'){const st=S.STANDS.find(q=>{const p=S.standLocal(q,s.x,s.z);return p.d>q.inner&&p.d<q.inner+S.ROWS*S.ROW_DEPTH&&Math.abs(p.a)<=q.to;});assert(st,`${s.id}: in a stand's rows`);
  const p=S.standLocal(st,s.x,s.z),a=st.aisles.find(c=>Math.abs(c-p.a)<.01);assert(a!==undefined,`${s.id}: on an aisle's centre line, not in a seat span`);
  const row=Math.floor((p.d-st.inner)/S.ROW_DEPTH);assert.equal(s.y,S.rowHeight(row),`${s.id}: at its row's height`);assert(Math.abs(t0.surface(s.x,s.z,s.y+.1)-s.y)<1e-6,`${s.id}: on the aisle's upper tread`);
  for(const [a0,a1] of S.standSpans(st).seats){const {n,start}=S.spanSeats(a0,a1);for(let i=0;i<n;i++)assert(Math.abs(start+i*S.SEAT_PITCH-p.a)>=S.AISLE_WIDTH/2,`${s.id}: no seat under it`);}
  assert(Math.min(...flags.map(f=>Math.hypot(f.x-s.x,f.z-s.z)))>=1.2,`${s.id}: clear of the stand flags`);}
 if(k==='screen'){const so=S.STANDS.find(q=>q.id==='south'),p=S.standLocal(so,s.x,s.z);assert(p.d>so.inner+S.ROWS*S.ROW_DEPTH&&p.d<S.standBack(so)-.5,'the screen ball is on the south concourse');
  assert.equal(s.y,S.CONCOURSE_HEIGHT);assert(Math.abs(t0.surface(s.x,s.z,s.y+.1)-s.y)<1e-6,'on the concourse floor');
  assert(Math.abs(s.x-ST.x)<S.SCREEN.w/2&&Math.abs(ST.z+S.SCREEN.z-s.z)<3,'right under the big screen');for(const q of load('lib/town/stadiumWorld.ts').screenPosts())assert(Math.hypot(q.x-s.x,q.z-s.z)>=2,'clear of its posts');}
 if(k==='roof'){assert(t0.canLand(s.x,s.z,Infinity),`${s.id}: a landing from the sky`);assert(Math.abs(t0.surface(s.x,s.z,Infinity)-ROOF_TOP)<.01&&s.y===ROOF_TOP,`${s.id}: on the slab top`);
  const st=S.STANDS.find(q=>q.roof&&S.standLocal(q,s.x,s.z).d>S.ROOF.front&&S.standLocal(q,s.x,s.z).d<S.ROOF.back);assert(st,`${s.id}: over a roofed stand`);const p=S.standLocal(st,s.x,s.z);
  assert(p.d-S.ROOF.front>=3&&S.ROOF.back-p.d>=3&&Math.abs(p.a)<=st.to-3,`${s.id}: ≥ 3 m in from every roof edge`);}}
{const gate=spots.find(s=>s.id==='stadium-gate');assert(Math.hypot(gate.x-G.x,gate.z-G.z)<=14&&!S.inGate(gate.x,gate.z)&&Math.abs(gate.z-G.z)>=G.halfWidth+2,'the gate ball is by the gate, off the walk through it');}
let closest=Infinity;for(const a of spots)for(const b of COIN_QUEST){if(a===b||b.truck!==undefined)continue;const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);closest=Math.min(closest,d);assert(d>=10,`${a.id} and ${b.id} are only ${d.toFixed(1)} m apart`);}
console.log(`PASS placement ${JSON.stringify(tally)}: ground balls clear of colliders, trees, the pond and (park) the paths; plaza balls clear of the flags; stand balls on aisle treads (no seat, no flag); the screen ball on the concourse; roof balls on the slabs; ≥ 10 m apart (closest ${closest.toFixed(1)} m)`);

// ---- 4. Reachable.
// Ground: a 0.5 m flood fill over the island from the plaza, round every collider (the walker's radius).
{const step=.5,x0=-345,z0=-250,nx=Math.ceil(310/step),nz=Math.ceil(400/step),C=4,cells=new Map(),key=(i,j)=>i*100000+j;
 for(const o of world.obstacles){if(o.floor!==undefined&&o.floor>1)continue;const r=Math.max(o.w,o.d)/2+.5;for(let i=Math.floor((o.x-r)/C);i<=Math.floor((o.x+r)/C);i++)for(let j=Math.floor((o.z-r)/C);j<=Math.floor((o.z+r)/C);j++){let l=cells.get(key(i,j));if(!l)cells.set(key(i,j),l=[]);l.push(o);}}
 const hit=(x,z)=>(cells.get(key(Math.floor(x/C),Math.floor(z/C)))??[]).some(o=>sim.insideObstacle(x,z,o,.32));
 const seen=new Uint8Array(nx*nz),q=[],si=Math.round((-100-x0)/step),sj=Math.round((-30-z0)/step);seen[sj*nx+si]=1;q.push(si,sj);
 for(let h=0;h<q.length;h+=2){const i=q[h],j=q[h+1];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz||seen[b*nx+a])continue;const x=x0+a*step,z=z0+b*step;
  if(x>-45||!onIsland(x,z)||hit(x,z))continue;seen[b*nx+a]=1;q.push(a,b);}}
 const reached=(x,z,r)=>{for(let i=Math.floor((x-r-x0)/step);i<=Math.ceil((x+r-x0)/step);i++)for(let j=Math.floor((z-r-z0)/step);j<=Math.ceil((z+r-z0)/step);j++)if(i>=0&&j>=0&&i<nx&&j<nz&&seen[j*nx+i]&&Math.hypot(x0+i*step-x,z0+j*step-z)<=r)return true;return false;};
 for(const s of spots.filter(s=>s.y===0))assert(reached(s.x,s.z,1),`${s.id} can be walked to from the plaza`);
 console.log(`PASS walk: a flood fill from the plaza (${q.length/2} cells round every collider) reaches every ground ball`);}
// Stands and the screen: a real walk with the rooftop travel, from the pitch-level ring up the ball's aisle (no falls).
function walk(points,secs=40){const t=travel(),p={x:points[0][0],z:points[0][1]},v={x:0,z:0};t.reset(p.x,p.z);let fell=false,i=1;
 for(let f=0;f<secs*60&&i<points.length;f++){const [tx,tz]=points[i],dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);if(l<.3){i++;continue;}t.update(1/60,p,v,{x:dx/l,z:dz/l,sprint:false},'walk');if(t.state.falling||t.state.recovery>0)fell=true;}
 return {x:p.x,z:p.z,h:t.state.height,fell,reached:i>=points.length};}
for(const s of spots.filter(s=>s.y>0&&s.y<10)){
 const st=s.id==='stadium-screen'?S.STANDS.find(q=>q.id==='south'):S.STANDS.find(q=>{const p=S.standLocal(q,s.x,s.z);return p.d>q.inner&&p.d<S.standBack(q)&&Math.abs(p.a)<=q.to;});const p=S.standLocal(st,s.x,s.z);
 const a=s.id==='stadium-screen'?st.aisles[1]:p.a,w=(d,al)=>{const q=S.standWorld(st,d,al);return [q.x,q.z];};
 const route=s.id==='stadium-screen'?[w(st.inner-2,a),w(st.inner+.2,a),w(S.standBack(st)-2,a),w(p.d,p.a)]:[w(st.inner-2,a),w(st.inner+.2,a),w(p.d,a)];
 const r=walk(route);assert(r.reached&&!r.fell&&Math.abs(r.h-s.y)<.01&&Math.hypot(r.x-s.x,r.z-s.z)<.5,`${s.id}: walked up the aisle to it ${JSON.stringify(r)}`);}
// The way into the bowl: the gate from the plaza to the ring (tests/west-stadium.cjs walks it too).
{const r=walk([[G.x+10,G.z],[G.x-1,G.z],[ST.x+38,ST.z]]);assert(r.reached&&!r.fell,'plaza → gate → ring');}
for(const s of spots.filter(s=>s.y>10)){const t=travel(),at=t.findLanding(s.x+2,s.z-3)??{x:s.x+2,z:s.z-3};assert(Math.abs(t.surface(at.x,at.z,Infinity)-ROOF_TOP)<.01,`${s.id}: a landing beside it is on the roof too`);}
console.log('PASS reach: every stand ball and the screen ball by a real walk up an aisle (no falls), the gate into the bowl, both roof balls by a landing on the slab');

// ---- 5. Runtime: the coin hunt collects each where it rests; loose balls are one mesh, no parcel, no collider.
const H=require('./summit-harness.cjs');
function hunt(){H.browser();const L2=H.createLoader({three:T}),got=[],near=[];const h=L2('lib/graphics/coinHunt.ts').createCoinHunt(new T.Scene(),s=>got.push(s.id),t=>near.push(t));return {h,got,near};}
{const {h,got,near}=hunt();
 for(const s of spots){const g=h.root.getObjectByName('coin-spot-'+s.id);let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,1,`${s.id}: one mesh (the ball), no parcel`);
  h.update(.1,{x:s.x+2.2,y:s.y,z:s.z},true,false);assert(!got.includes(s.id),`${s.id}: not from 2.2 m`);assert(near.at(-1),`${s.id}: a nearby hint`);
  if(s.y>0){h.update(.1,{x:s.x+.4,y:s.y>10?S.rowHeight(8):0,z:s.z},true,false);assert(!got.includes(s.id),`${s.id}: not from the floor below`);}
  h.update(.1,{x:s.x+.4,y:s.y,z:s.z},true,false);assert(got.includes(s.id),`${s.id}: collected where it rests`);}
 assert.equal(got.length,12);const props=[],obs=[];h.connectCollisions(obs,props);assert(!props.some(p=>spots.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<.5)),'no colliders for the stadium balls');h.dispose();}
assert(!/stadium/i.test(read('lib/graphics/coinHunt.ts')),'the coin hunt has no stadium code: nothing new per frame (the same loop over COIN_QUEST)');
console.log('PASS runtime: each ball collected where it rests (stands, concourse, roofs, ground), not from 2.2 m or from the floor below; one mesh each, no parcel, no collider');

// ---- 6. The card offer: every collected hunt ball goes to earnForBall (kind 'ball': the child picks a card) and its lesson card.
{const calls=[];// The same stubs as tests/explore-ball-hunt.cjs (the trigger module's catalogue imports are not needed here).
 const L3=H.createLoader({'./cardRewardStore':{earnCardOffer:r=>{calls.push(r);return 'offered';},cardRewardsActive:()=>true},'./cardRewards':{TIER_TEACHING_LINE:'',themeFromText:t=>'theme:'+t},
  '../paths/formatPaths':{FORMAT_PATHS:[]},'./quizProgress':{CARD_QUIZ_FIRST_TRY:true,hasCorrectQuizAnswer:()=>false,quizCardEligible:()=>false},'./exploreChecklist':{EXPLORE_ITEMS:[]},
  './learningJourneys':{journeyById:()=>null},'../paths/stories':{STORY_CARDS:[]},'../paths/upcomingStories':{UPCOMING_STORIES:{}},'../arcade/arcadeWallet':{creditOnce:()=>Promise.resolve(0)},
  './learnCoins':{createLearnCoins:()=>({pay:()=>Promise.resolve(0)}),LEARN_COINS_EARNED:'x'}});
 const TR=L3('lib/town/cardRewardTriggers.ts');for(const s of spots)assert.equal(TR.earnForBall(s),'offered');
 assert.deepEqual(calls.map(c=>c.id),[...SB.STADIUM_BALL_IDS]);assert(calls.every(c=>c.kind==='ball'&&c.reason.includes(title(spots.find(s=>s.id===c.id)))),'a card choice (kind ball) for each, named after its lesson');
 const town=read('components/Town.tsx');assert(/c=>\{earnForBall\(c\);setBallLessons/.test(town),'Town hands every collected hunt ball to earnForBall and the lesson card');
 assert(/if\(!ballResumed\.current\)/.test(town),'a reload mid-lesson resumes it (pendingLesson)');}
console.log('PASS card offer: earnForBall offers a card choice (kind ball) for each stadium ball; Town wires it with the lesson card');

// ---- 7. Saves: same key, version 9, older saves keep everything.
{const {sanitizeCoinProgress,coinRewardEarned,allCostumesEarned,costumeEarned,COSTUME_UNLOCK_ORDER,COIN_STORAGE_KEY,COIN_SAVE_VERSION,PRE_STADIUM_IDS}=Q;
 assert.equal(COIN_STORAGE_KEY,'fi2-matchday-coins-v1','the same save key (nothing new to classify or sync)');assert.equal(COIN_SAVE_VERSION,9);
 const v8={version:8,revealed:PRE_STADIUM_IDS,collected:PRE_STADIUM_IDS,hint:'jetty-lighthouse',celebrated:true,rewardUnlocked:false,pendingLesson:{id:'jetty-lighthouse',step:2}};
 const m=sanitizeCoinProgress(v8);assert.equal(m.version,9);assert.equal(m.collected.length,116);assert(m.rewardUnlocked&&coinRewardEarned(m)&&allCostumesEarned(m)&&COSTUME_UNLOCK_ORDER.every(id=>costumeEarned(m,id)),'a 116-ball save keeps the fox and every costume');
 assert(!m.celebrated,'the 128-ball finale is still ahead');assert.deepEqual({...m.pendingLesson},{id:'jetty-lighthouse',step:2},'a version 8 pending lesson survives');assert.equal(m.hint,'jetty-lighthouse');
 assert(sanitizeCoinProgress(JSON.parse(JSON.stringify(m))).rewardUnlocked,'and keeps it after a re-save as version 9');
 assert(!coinRewardEarned(sanitizeCoinProgress({...v8,collected:PRE_STADIUM_IDS.slice(0,115)})),'115 of the old 116 does not unlock the fox');
 assert(!coinRewardEarned(sanitizeCoinProgress({...v8,version:9,rewardUnlocked:false})),'a version 9 save needs all 128');
 const all=sanitizeCoinProgress({version:9,collected:COIN_QUEST.map(s=>s.id)});assert(coinRewardEarned(all));
 const mid=sanitizeCoinProgress({version:9,collected:['stadium-gate','stadium-west-roof','fake'],pendingLesson:{id:'stadium-west-roof',step:1}});assert.deepEqual([...mid.collected],['stadium-gate','stadium-west-roof']);assert.deepEqual({...mid.pendingLesson},{id:'stadium-west-roof',step:1},'a stadium lesson resumes after a reload');
 const snap=read('lib/saves/snapshot.ts');assert(snap.includes("'fi2-matchday-coins-v1'"),'the hunt key is still a synced save key');}
console.log('PASS saves: same key (synced), version 9; a version 8 save keeps its pending lesson and hint, a 116-ball save keeps the fox and every costume, a stadium lesson resumes after a reload');
})().catch(e=>{console.error(e);process.exit(1);});
