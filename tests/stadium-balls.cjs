// DRIP FC Stadium ball hunt (Nov 13 2026, lib/town/stadiumBalls.ts): twelve balls take the hunt from 116 to 128, and (Nov 13 2026, owner) a target on the big screen's west post takes it to 129. Since the owner's
// Nov 13 feedback ("too easy to find"; "like the targets on buildings", "some balls in the crowd"): seven round kick targets on the
// stadium (both gate pillars, the east / north / west stands' back walls, the big screen's east post), three balls on free seats
// among the fans and two loose balls on the long stands' roofs. Checked against the town the game really builds (world.ts, the same
// rooftop travel and ball collisions Town drives):
//  1. count, ids, order (appended after the East Jetty ball), every place the hunt is counted;
//  2. one new concept each: no scene kind or concept tag any island or reef ball already has, no title / tip overlap, no topic
//     words taught elsewhere, a lesson + scene + practice prompt each, an IFAB source for every Law, no links in kid UI;
//  3. placement: nothing loose on the ground (plaza, apron, park); each target on a real stadium solid's outer face (one on each gate
//     pillar, clear of the walk and below the sign), round the bowl, its ball dropping on clear ground; crowd balls on the seat
//     beside an aisle that the crowd never fills, among fans, clear of the aisle, the flags and the roof; roof balls on the slabs;
//     every ball ≥ 10 m from every other ball;
//  4. reachable and hittable: a walk (flood fill round every collider) from the plaza reaches every target's ball and its kicker's
//     spot; a real charged kick (walkBall.ts, Town's collisions) from there hits each target, a tap does not; a real walk climbs each
//     crowd ball's aisle into its row;
//  5. the coin-hunt runtime: a target opens only on a shot into it and drops its ball; crowd and roof balls are collected where they
//     rest, one mesh each, no collider (heat);
//  6. the card offer: a collected ball goes to earnForBall (kind 'ball', the child picks a card) and the lesson card;
//  7. saves: same key, version 10; a version 8/9 save keeps its pending lesson, a 116- or 128-ball save keeps the fox and every costume.
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
assert.equal(spots.length,13,'thirteen stadium balls');assert.equal(COIN_QUEST.length,129,'the hunt has 129 balls');assert.equal(new Set(COIN_QUEST.map(s=>s.id)).size,129,'ids are unique');
assert.deepEqual(COIN_QUEST.slice(116).map(s=>s.id),SB.STADIUM_BALL_IDS,'appended last, so saved ids keep their order');assert.equal(COIN_QUEST[115].id,'jetty-lighthouse','after the East Jetty ball');
assert.deepEqual(Q.PRE_STADIUM_IDS,COIN_QUEST.slice(0,116).map(s=>s.id));assert.equal(COIN_QUEST.at(-1).id,'stadium-screen-west','the west post ball is appended last');assert.deepEqual(Q.PRE_SCREEN_WEST_IDS,COIN_QUEST.slice(0,128).map(s=>s.id));assert(spots.every(s=>s.stadium&&!s.parachute&&!s.summit&&(s.wall?s.kind==='kick'&&!s.loose:s.kind==='hidden'&&s.loose)),'stadium balls: kick targets or loose balls');
assert(spots.every(s=>s.id.startsWith('stadium-')&&Number.isFinite(s.x+s.y+s.z)));
{const txt=read('lib/site/learnFeatures.ts');assert(txt.includes('counts:{hiddenBalls:129}')&&txt.includes("'129 hidden balls to find'")&&!/\b12[68] hidden balls/.test(txt),'the learn page counts 129 (tests/learn-content.cjs checks it against COIN_QUEST)');}
assert.equal(Q.costumeMilestones().at(-1),129,'the Matchday Fox needs every ball (129)');assert.equal(Q.costumesAtMilestone(116),0,'116 unlocks nothing now');assert.equal(Q.costumesAtMilestone(128),0,'nor 128');
console.log('PASS 13 stadium balls appended (129 in all, after the East Jetty ball; the west screen post last), unique ids; the learn page and the fox milestone count 129');

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
 'stadium-east-stand':['technical area'],'stadium-north-stand':['away kit','second kit','colour clash','changes kit'],'stadium-screen':['var','video assistant','replay'],'stadium-screen-west':['scoreboard','match clock']};
assert.deepEqual(Object.keys(TOPIC).sort(),[...ids].sort());
const concepts=spots.map(s=>s.concept);assert(concepts.every(c=>typeof c==='string'&&/^[a-z0-9-]+$/.test(c)),'a concept tag each');assert.equal(new Set(concepts).size,13,'no two share a tag');
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
assert.equal(new Set([...COIN_QUEST.map(s=>BALL_HUNT_LESSONS[s.id].kind),...Object.values(DIVE_BALL_LESSONS).map(l=>l.kind)]).size,129+7,'136 different scenes across the island and the reef');
const laws=concepts.filter(c=>c.startsWith('law')).length;assert(laws>=4&&laws<=8,`a mix of Laws (${laws}) and stadium/matchday ideas (${13-laws})`);
console.log(`PASS concepts: 13 new ideas (${laws} Laws of the Game, ${13-laws} stadium and matchday), no scene, tag, title, tip or topic shared with the other 116 balls or the 7 reef balls; IFAB sources; no links`);
console.log('     '+spots.map(s=>`${s.id}=${s.concept}`).join(', '));

// ---- 3. Placement against the built town.
const world=load('lib/town/world.ts').buildTown(new T.Scene());
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts'),SW=load('lib/town/stadiumWorld.ts'),CR=load('lib/town/stadiumCrowd.ts');
const G=L.STADIUM_GATE,P=L.STADIUM_PLAZA,ST=L.STADIUM;
const travel=(x=G.x+8,z=G.z)=>createRooftopTravel([...world.buildings,...world.walkSurfaces],world.obstacles,{x,z},world.roofObstacles,()=>0,world.landingExclusions,world.canopies);
const trees=world.assets.filter(a=>a.kind==='tree'||a.kind==='palm'),orchard=load('lib/town/stadiumOrchard.ts').stadiumOrchardTrees();
const ROOF_TOP=S.ROOF.y+S.ROOF.thick/2;assert.equal(SB.STADIUM_ROOF_TOP,ROOF_TOP);
const kindOf=s=>s.wall?'target':s.y>10?'roof':'crowd';
const tally={};for(const s of spots)tally[kindOf(s)]=(tally[kindOf(s)]||0)+1;
assert.deepEqual(tally,{target:8,roof:2,crowd:3},'the spread '+JSON.stringify(tally));
const targets=spots.filter(s=>s.wall),crowd=spots.filter(s=>kindOf(s)==='crowd'),roofs=spots.filter(s=>kindOf(s)==='roof');
assert(targets.every(s=>s.kind==='kick'&&!s.loose&&s.wall.high&&s.wall.round),'targets: the island\'s round high kick targets (no parcel box, no collider)');
assert([...crowd,...roofs].every(s=>s.kind==='hidden'&&s.loose&&!s.parachute),'crowd and roof balls: loose, walked to');
// No stadium ball lies loose on the ground: not on the plaza, the apron, the ring path, the park or the gate.
for(const s of spots.filter(s=>s.loose))assert(s.y>=S.rowHeight(0),`${s.id}: never loose on the ground`);
for(const s of spots.filter(s=>s.loose)){const inPlaza=s.x>P.minX-6&&s.x<P.maxX&&s.z>P.minZ&&s.z<P.maxZ;assert(!inPlaza&&L.inStadiumFootprint(s.x,s.z),`${s.id}: not on the plaza or the apron`);}
const t0=travel(),solid=(x,z,r)=>sim.blocked(x,z,world.obstacles,r);
const AX={east:[1,0],west:[-1,0],south:[0,1],north:[0,-1]},axis=s=>AX[s.wall.facing??'south'];
// Targets: on real stadium geometry, both sides of the gate, spread round the bowl, pickups on open ground (or the concourse).
const mounts=new Set();
for(const s of targets){const [nx,nz]=axis(s),w=s.wall,inside=(x,z)=>world.obstacles.filter(o=>sim.insideObstacle(x,z,o));
 assert(L.inStadiumFootprint(w.x,w.z,1),`${s.id}: on the stadium (${w.x}, ${w.z})`);
 const behind=inside(w.x-nx*.25,w.z-nz*.25);assert(behind.length,`${s.id}: mounted on a real solid (a stand's back wall, a gate pillar or a screen post)`);
 assert(!inside(w.x+nx*.2,w.z+nz*.2).length,`${s.id}: on the solid's outer face`);
 if(!s.id.startsWith('stadium-screen'))for(const t of [-.55,.55])assert(inside(w.x-nx*.25+nz*t,w.z-nz*.25+nx*t).length,`${s.id}: the whole target fits on the face`);
 mounts.add(behind[0]);
 assert(Math.hypot(s.x-w.x,s.z-w.z)<=SB.TARGET_DROP+.01,`${s.id}: the ball drops just in front`);assert(s.y===0?!solid(s.x,s.z,.6):!world.roofObstacles.some(o=>o.top>s.y&&o.floor<s.y+1.8&&sim.insideObstacle(s.x,s.z,o,.6)),`${s.id}: the pickup is clear of colliders (rails and props on the concourse)`);
 assert(Math.abs(t0.surface(s.x,s.z,s.y+.1)-s.y)<1e-6,`${s.id}: the pickup is on the floor (${s.y})`);
 assert(Math.min(...trees.map(t=>Math.hypot(t.x-s.x,t.z-s.z)),...orchard.map(t=>Math.hypot(t.x-s.x,t.z-s.z)))>=2.5,`${s.id}: clear of trees`);
 if(s.y===0)assert(onIsland(s.x,s.z)&&!L.inPond(s.x,s.z,L.POND_RIM+3),`${s.id}: on the island's ground`);}
{const posts=SW.screenPosts(),so=S.STANDS.find(q=>q.id==='south');
 for(const [id,i,side] of [['stadium-screen',1,'east'],['stadium-screen-west',0,'west']]){const scr=spots.find(s=>s.id===id),p=S.standLocal(so,scr.x,scr.z);
  assert(Math.abs(posts[i].x-scr.wall.x)<.01&&Math.abs(posts[i].z+SB.SCREEN_POST_R-scr.wall.z)<.01&&scr.wall.facing==='south',`${id}: on the ${side} post's south face`);
  assert(scr.y+scr.wall.y+.55<posts[i].top,`${id}: below the screen frame`);assert(scr.y===0&&p.d>S.standBack(so),`${id}: its ball drops on the ground behind the south stand`);
  for(const q of posts)assert(Math.hypot(q.x-scr.x,q.z-scr.z)>=2,`${id}: clear of the posts`);}
 const [e,w]=['stadium-screen','stadium-screen-west'].map(id=>spots.find(s=>s.id===id));assert(e.wall.y===w.wall.y&&e.wall.z===w.wall.z&&Math.abs(e.wall.x+w.wall.x-2*ST.x)<.01,'the west post target mirrors the east one (same height and facing)');}
{const gate=['stadium-gate','stadium-plaza-flags'].map(id=>spots.find(s=>s.id===id)),gx=S.GATE_ARCH_X+.8;
 assert.deepEqual(gate.map(s=>Math.sign(s.wall.z-G.z)),[-1,1],'one target on each pillar: both sides of the entrance');
 for(const s of gate){assert(s.wall.facing==='east'&&Math.abs(s.wall.x-gx)<.01,`${s.id}: on the pillar's plaza (east) face`);
  assert(s.wall.y+.55<8.2,`${s.id}: below the arch beam, well clear of the DRIP FC sign over the gate`);assert(s.wall.y-.55>2.2,`${s.id}: above head height`);
  assert(Math.abs(s.wall.z-G.z)-.55>=G.halfWidth&&Math.abs(s.z-G.z)>=G.halfWidth+.5&&!S.inGate(s.x,s.z),`${s.id}: clear of the walk through the gate`);}}
const sides=new Set(targets.map(s=>s.wall.facing));assert.deepEqual([...sides].sort(),['east','north','south','west'],'targets round the bowl: the gate and east stand, the north stand, the west stand, the screen at the south end');
assert(targets.some(s=>s.id==='stadium-screen'&&s.z>ST.z+50)&&targets.some(s=>s.wall.z<ST.z-70),'north and south ends too');
// Crowd balls: on the free seat beside an aisle, among fans, clear of the stand flags and the roof's shade.
const fans=CR.crowdSeats(),shown=f=>fans.slice(0,CR.crowdCount(fans,f)),flags=CR.standFlagSpots(8);
for(const s of crowd){const st=S.STANDS.find(q=>{const p=S.standLocal(q,s.x,s.z);return p.d>q.inner&&p.d<q.inner+S.ROWS*S.ROW_DEPTH&&Math.abs(p.a)<=q.to;});assert(st,`${s.id}: in a stand's rows`);
 const p=S.standLocal(st,s.x,s.z),row=Math.floor((p.d-st.inner)/S.ROW_DEPTH);
 assert(Math.abs(p.d-(st.inner+row*S.ROW_DEPTH+S.SEAT_DEPTH-.04))<.01&&Math.abs(s.y-(S.rowHeight(row)+S.SEAT_TOP))<.01,`${s.id}: on a seat pad in row ${row+1}`);
 const span=S.standSpans(st).seats.find(([a0,a1])=>p.a>a0&&p.a<a1);assert(span,`${s.id}: in a seat span, not on an aisle or a stair`);const {n,start}=S.spanSeats(span[0],span[1]);
 const k=Math.round((p.a-start)/S.SEAT_PITCH);assert(Math.abs(start+k*S.SEAT_PITCH-p.a)<.01&&(k===0||k===n-1),`${s.id}: on the end seat of its span`);
 const aisle=st.aisles.find(a=>Math.abs(Math.abs(p.a-a)-(Math.abs(p.a-(k===0?span[0]:span[1]))+S.AISLE_WIDTH/2))<.01);assert(aisle!==undefined,`${s.id}: the seat right beside an aisle`);
 assert(Math.abs(p.a-aisle)>=S.AISLE_WIDTH/2+.2,`${s.id}: the aisle and its stairs stay clear`);
 assert(!fans.some(f=>Math.hypot(f.x-s.x,f.z-s.z)<.3),`${s.id}: no fan ever sits in its seat (every fill)`);
 const by=f=>shown(f).filter(q=>Math.hypot(q.x-s.x,q.z-s.z)<1.5).length;assert(by(CR.crowdFill(true,0))>=2&&by(CR.crowdFill(false,0))>=2,`${s.id}: among fans (${by(.3)} beside it on a phone)`);
 if(st.roof)assert(p.d<S.ROOF.front-1.5,`${s.id}: in front of the roof (its fade never needs to clear it)`);
 assert(Math.min(...flags.map(f=>Math.hypot(f.x-s.x,f.z-s.z)))>=1.2,`${s.id}: clear of the stand flags`);}
assert.equal(new Set(crowd.map(s=>S.STANDS.find(q=>Math.abs(S.standLocal(q,s.x,s.z).a)<=q.to&&S.standLocal(q,s.x,s.z).d>q.inner&&S.standLocal(q,s.x,s.z).d<S.standBack(q)).id)).size,3,'one in each of three stands');
for(const s of roofs){assert(t0.canLand(s.x,s.z,Infinity),`${s.id}: a landing from the sky`);assert(Math.abs(t0.surface(s.x,s.z,Infinity)-ROOF_TOP)<.01&&s.y===ROOF_TOP,`${s.id}: on the slab top`);
 const st=S.STANDS.find(q=>q.roof&&S.standLocal(q,s.x,s.z).d>S.ROOF.front&&S.standLocal(q,s.x,s.z).d<S.ROOF.back);assert(st,`${s.id}: over a roofed stand`);const p=S.standLocal(st,s.x,s.z);
 assert(p.d-S.ROOF.front>=3&&S.ROOF.back-p.d>=3&&Math.abs(p.a)<=st.to-3,`${s.id}: ≥ 3 m in from every roof edge`);}
let closest=Infinity;for(const a of spots)for(const b of COIN_QUEST){if(a===b||b.truck!==undefined)continue;const d=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);closest=Math.min(closest,d);assert(d>=10,`${a.id} and ${b.id} are only ${d.toFixed(1)} m apart`);}
console.log(`PASS placement ${JSON.stringify(tally)}: targets on ${mounts.size} stadium solids (both gate pillars, the east/west/north back walls, the screen post), facing ${[...sides].join('/')}, pickups clear; crowd balls on the free aisle seat among fans (no aisle, flag or roof); roof balls on the slabs; nothing loose on the ground; ≥ 10 m apart (closest ${closest.toFixed(1)} m)`);

// ---- 4. Reachable and hittable.
// Ground: a 0.5 m flood fill over the island from the plaza, round every collider (the walker's radius).
const step=.5,x0=-345,z0=-250,nx=Math.ceil(310/step),nz=Math.ceil(400/step),seen=new Uint8Array(nx*nz);
{const C=4,cells=new Map(),key=(i,j)=>i*100000+j;
 for(const o of world.obstacles){if(o.floor!==undefined&&o.floor>1)continue;const r=Math.max(o.w,o.d)/2+.5;for(let i=Math.floor((o.x-r)/C);i<=Math.floor((o.x+r)/C);i++)for(let j=Math.floor((o.z-r)/C);j<=Math.floor((o.z+r)/C);j++){let l=cells.get(key(i,j));if(!l)cells.set(key(i,j),l=[]);l.push(o);}}
 const hit=(x,z)=>(cells.get(key(Math.floor(x/C),Math.floor(z/C)))??[]).some(o=>sim.insideObstacle(x,z,o,.32));
 const q=[],si=Math.round((-100-x0)/step),sj=Math.round((-30-z0)/step);seen[sj*nx+si]=1;q.push(si,sj);
 for(let h=0;h<q.length;h+=2){const i=q[h],j=q[h+1];for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=nx||b>=nz||seen[b*nx+a])continue;const x=x0+a*step,z=z0+b*step;
  if(x>-45||!onIsland(x,z)||hit(x,z))continue;seen[b*nx+a]=1;q.push(a,b);}}
 console.log(`     flood fill from the plaza: ${q.length/2} cells`);}
const reached=(x,z,r)=>{for(let i=Math.floor((x-r-x0)/step);i<=Math.ceil((x+r-x0)/step);i++)for(let j=Math.floor((z-r-z0)/step);j<=Math.ceil((z+r-z0)/step);j++)if(i>=0&&j>=0&&i<nx&&j<nz&&seen[j*nx+i]&&Math.hypot(x0+i*step-x,z0+j*step-z)<=r)return true;return false;};
for(const s of targets.filter(s=>s.y===0))assert(reached(s.x,s.z,1),`${s.id}: its ball can be walked to from the plaza`);
// A real walk with the rooftop travel (no falls).
function walk(points,secs=40){const t=travel(),p={x:points[0][0],z:points[0][1]},v={x:0,z:0};t.reset(p.x,p.z);let fell=false,i=1;
 for(let f=0;f<secs*60&&i<points.length;f++){const [tx,tz]=points[i],dx=tx-p.x,dz=tz-p.z,l=Math.hypot(dx,dz);if(l<.3){i++;continue;}t.update(1/60,p,v,{x:dx/l,z:dz/l,sprint:false},'walk');if(t.state.falling||t.state.recovery>0)fell=true;}
 return {x:p.x,z:p.z,h:t.state.height,fell,reached:i>=points.length};}
{const r=walk([[G.x+10,G.z],[G.x-1,G.z],[ST.x+38,ST.z]]);assert(r.reached&&!r.fell,'plaza → gate → ring');}
const H=require('./summit-harness.cjs');
function hunt(){H.browser();const L2=H.createLoader({three:T}),got=[],near=[];const h=L2('lib/graphics/coinHunt.ts').createCoinHunt(new T.Scene(),s=>got.push(s.id),t=>near.push(t));
 return {h,got,near,progress:()=>L2('lib/town/coinProgress.ts').readCoinProgress(),createWalkBall:L2('lib/town/walkBall.ts').createWalkBall};}
// Targets: a kick from a reachable spot in front of each one hits it, with the island's own ball (walkBall.ts) and the collisions
// Town gives it (every obstacle at the ball's 0.19 m radius, rails and roofs by height; the coin hunt's hit() first). A tap
// (no charge) falls short: it is a high target, like the island's.
const ballGrid=load('lib/town/obstacleGrid.ts'),obsGrid=ballGrid.createObstacleGrid(world.obstacles),roofGrid=ballGrid.createObstacleGrid(world.roofObstacles);
const yawOf={east:-Math.PI/2,west:Math.PI/2,south:Math.PI,north:0},shots={};
for(const s of targets){const [ax,az]=axis(s),w=s.wall,stand=10,px=w.x+ax*stand,pz=w.z+az*stand;
 assert(s.y===0&&reached(px,pz,.6),`${s.id}: the kicker's spot ${stand} m out is on the ground, walkable from the plaza`);
 const tr=travel(px,pz);tr.reset(px,pz,s.y);const ok=[];
 for(let c=0;c<=1.001;c+=.05){const f=hunt(),ball=f.createWalkBall(),player={x:px,y:s.y,z:pz,yaw:yawOf[w.facing]};ball.reset(player);ball.shoot(player,player.yaw,c);
  const env={floor:(x,z)=>tr.surface(x,z,ball.state.y),blocked:(x,z,y)=>{if(f.h.hit(x,y,z,ball.state.vx,ball.state.vz))return false;
    return sim.blocked(x,z,obsGrid.query(x,z,.19),.19)||roofGrid.query(x,z,.19).some(o=>y>o.floor&&y<o.top+.2&&Math.abs(x-o.x)<o.w/2+.19&&Math.abs(z-o.z)<o.d/2+.19);},
   hit:(x,y,z,vx,vz)=>f.h.hit(x,y,z,vx,vz),impact(){},strike(){}};
  f.h.update(.016,player,true,true);for(let i=0;i<150;i++)ball.update(1/60,player,env);
  if(f.progress().revealed.includes(s.id))ok.push(+c.toFixed(2));f.h.dispose();}
 assert(ok.length>=2&&!ok.includes(0),`${s.id}: hit by a charged kick from ${stand} m (charges ${ok.join(', ')}), never by a tap`);shots[s.id]=`${ok[0]}–${ok.at(-1)}`;}
console.log('PASS hittable: every target hit by a real charged kick (island ball physics, Town\'s collisions) from a reachable spot on the ground 10 m out (the plaza, round the bowl), never by a tap; charges '+JSON.stringify(shots));
// Crowd balls: a real walk up the aisle to the ball's row, then a step into the row beside it.
const walkedTo={};
for(const s of crowd){const st=S.STANDS.find(q=>{const p=S.standLocal(q,s.x,s.z);return p.d>q.inner&&p.d<q.inner+S.ROWS*S.ROW_DEPTH&&Math.abs(p.a)<=q.to;}),p=S.standLocal(st,s.x,s.z);
 const row=Math.floor((p.d-st.inner)/S.ROW_DEPTH),aisle=st.aisles.reduce((b,a)=>Math.abs(a-p.a)<Math.abs(b-p.a)?a:b),side=Math.sign(p.a-aisle),w=(d,al)=>{const q=S.standWorld(st,d,al);return [q.x,q.z];};
 const front=st.inner+row*S.ROW_DEPTH,end=walk([w(st.inner-2,aisle),w(st.inner+.2,aisle),w(front+S.ROW_DEPTH*.75,aisle),w(front+.4,aisle+side*(S.AISLE_WIDTH/2+.5))]);
 assert(Math.hypot(end.x-s.x,end.z-s.z)<1,`${s.id}: the walker ends beside the seat`);
 assert(end.reached&&!end.fell&&Math.abs(end.h-S.rowHeight(row))<.01,`${s.id}: walked up the aisle to row ${row+1} ${JSON.stringify(end)}`);walkedTo[s.id]={x:end.x,y:end.h,z:end.z};}
{const so=S.STANDS.find(q=>q.id==='south'),c=S.standWorld(so,S.standBack(so)-2,0);assert(sim.blocked(c.x,c.z,obsGrid.query(c.x,c.z,.19),.19),'a stand is solid to a kicked ball: targets are shot from the ground');}
console.log('PASS reach: each crowd ball by a real walk up its aisle into its row (no falls), the gate into the bowl; the stands are solid to a kicked ball (so every target is shot from the ground)');

// ---- 5. Runtime: targets reveal on a hit and drop their ball; crowd and roof balls are one mesh, no parcel, no collider.
{const {h,got,near}=hunt();
 for(const s of targets){const [ax,az]=axis(s),w=s.wall,g=h.root.getObjectByName('coin-spot-'+s.id);let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;});assert(meshes>=2,`${s.id}: a target drawn with its ball`);
  h.update(.7,{x:s.x,y:s.y,z:s.z},true,false);assert(!got.includes(s.id),`${s.id}: not collected before the target is hit`);assert(near.at(-1),`${s.id}: a nearby hint`);
  h.land({x:s.x,y:s.y,z:s.z},true);const wy=s.y+w.y;
  assert(!h.hit(w.x+ax*.1,wy,w.z+az*.1,ax*8,az*8),`${s.id}: a ball going away does not open it`);assert(!h.hit(w.x+ax*.1,wy,w.z+az*.1,az*8,ax*8),`${s.id}: a sideways graze does not`);
  assert(!h.hit(w.x+ax*.1,wy+1.5,w.z+az*.1,-ax*8,-az*8),`${s.id}: a shot 1.5 m over it does not`);assert(h.hit(w.x+ax*.1,wy,w.z+az*.1,-ax*8,-az*8),`${s.id}: a shot into it opens it`);
  h.update(.7,{x:s.x+3,y:s.y,z:s.z+3},true,false);h.update(.1,{x:s.x+.4,y:s.y,z:s.z},true,false);assert(got.includes(s.id),`${s.id}: its ball collected where it drops`);}
 for(const s of [...crowd,...roofs]){const g=h.root.getObjectByName('coin-spot-'+s.id);let meshes=0;g.traverse(o=>{if(o.isMesh)meshes++;});assert.equal(meshes,1,`${s.id}: one mesh (the ball), no parcel`);
  h.update(.1,{x:s.x+2.2,y:s.y,z:s.z},true,false);assert(!got.includes(s.id),`${s.id}: not from 2.2 m`);assert(near.at(-1),`${s.id}: a nearby hint`);
  h.update(.1,{x:s.x+.4,y:s.y>10?S.rowHeight(8):0,z:s.z},true,false);assert(!got.includes(s.id),`${s.id}: not from the floor below`);
  const at=walkedTo[s.id]??{x:s.x+.4,y:s.y,z:s.z};h.update(.1,at,true,false);assert(got.includes(s.id),`${s.id}: collected ${walkedTo[s.id]?'from the row beside it':'where it rests'}`);}
 assert.equal(got.length,13);const props=[],obs=[];h.connectCollisions(obs,props);assert(!props.some(p=>spots.some(s=>Math.hypot(p.x-s.x,p.z-s.z)<.5)),'no colliders for the stadium balls');h.dispose();}
assert(!/stadium/i.test(read('lib/graphics/coinHunt.ts')),'the coin hunt has no stadium code: nothing new per frame (the same loop over COIN_QUEST)');
// The crowd balls are coin-hunt meshes, not crowd instances: the crowd shader's clears (round the player and CLEAR_FRIENDS) and the
// roof fade (roof meshes only) never touch them.
assert(!/coinHunt|COIN_QUEST/.test(read('lib/town/stadiumCrowd.ts')));
console.log('PASS runtime: targets reveal only on a shot into them (not away, sideways, over or by a landing) and drop a ball collected below; crowd balls collected from the row beside them, roof balls where they rest; not from 2.2 m or the floor below; no colliders');

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

// ---- 7. Saves: same key, version 10, older saves keep everything.
{const {sanitizeCoinProgress,coinRewardEarned,allCostumesEarned,costumeEarned,COSTUME_UNLOCK_ORDER,COIN_STORAGE_KEY,COIN_SAVE_VERSION,PRE_STADIUM_IDS}=Q;
 assert.equal(COIN_STORAGE_KEY,'fi2-matchday-coins-v1','the same save key (nothing new to classify or sync)');assert.equal(COIN_SAVE_VERSION,10);
 const v8={version:8,revealed:PRE_STADIUM_IDS,collected:PRE_STADIUM_IDS,hint:'jetty-lighthouse',celebrated:true,rewardUnlocked:false,pendingLesson:{id:'jetty-lighthouse',step:2}};
 const m=sanitizeCoinProgress(v8);assert.equal(m.version,10);assert.equal(m.collected.length,116);assert(m.rewardUnlocked&&coinRewardEarned(m)&&allCostumesEarned(m)&&COSTUME_UNLOCK_ORDER.every(id=>costumeEarned(m,id)),'a 116-ball save keeps the fox and every costume');
 assert(!m.celebrated,'the 129-ball finale is still ahead');assert.deepEqual({...m.pendingLesson},{id:'jetty-lighthouse',step:2},'a version 8 pending lesson survives');assert.equal(m.hint,'jetty-lighthouse');
 assert(sanitizeCoinProgress(JSON.parse(JSON.stringify(m))).rewardUnlocked,'and keeps it after a re-save as version 10');
 assert(!coinRewardEarned(sanitizeCoinProgress({...v8,collected:PRE_STADIUM_IDS.slice(0,115)})),'115 of the old 116 does not unlock the fox');
 assert(!coinRewardEarned(sanitizeCoinProgress({...v8,version:9,rewardUnlocked:false})),'a version 9 save needs all 128');
 const v9={version:9,revealed:Q.PRE_SCREEN_WEST_IDS,collected:Q.PRE_SCREEN_WEST_IDS,hint:null,celebrated:true,rewardUnlocked:false,pendingLesson:{id:'stadium-screen',step:1}},m9=sanitizeCoinProgress(v9);
 assert(m9.version===10&&m9.collected.length===128&&coinRewardEarned(m9)&&COSTUME_UNLOCK_ORDER.every(id=>costumeEarned(m9,id))&&!m9.celebrated,'a 128-ball version 9 save keeps the fox and every costume; the 129-ball finale is ahead');assert.deepEqual({...m9.pendingLesson},{id:'stadium-screen',step:1},'a version 9 pending lesson survives');
 assert(!coinRewardEarned(sanitizeCoinProgress({...v9,version:10})),'a version 10 save needs all 129');
 const all=sanitizeCoinProgress({version:10,collected:COIN_QUEST.map(s=>s.id)});assert(coinRewardEarned(all));
 const mid=sanitizeCoinProgress({version:10,collected:['stadium-gate','stadium-west-roof','fake'],pendingLesson:{id:'stadium-west-roof',step:1}});assert.deepEqual([...mid.collected],['stadium-gate','stadium-west-roof']);assert.deepEqual({...mid.pendingLesson},{id:'stadium-west-roof',step:1},'a stadium lesson resumes after a reload');
 const snap=read('lib/saves/snapshot.ts');assert(snap.includes("'fi2-matchday-coins-v1'"),'the hunt key is still a synced save key');}
console.log('PASS saves: same key (synced), version 10; a version 9 save with 128 keeps the fox, a version 8 save keeps its pending lesson and hint, a 116-ball save keeps the fox and every costume, a stadium lesson resumes after a reload');
})().catch(e=>{console.error(e);process.exit(1);});
