// East Jetty (Sep 29 2026 as a timber pier; Sep 30 2026 reworked into a stone jetty with a nautilus spiral end). From the
// Farmers Market seawall: the whole spiral is walkable and ride-able, the curved edges hold walkers and riders, jetpack landings
// find it, it sits inside the flyable zone and clear of the Deep Sea Boat, the causeway and its sharks; the fishing spot, the
// shooting-challenge ring and both islanders are reachable; the seawall has a gap; heat rules (no loops, merged scenery).
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,JSON,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(f,'utf8');
const {stepPlayer,blocked,flightBlocked}=load('lib/town/simulation.ts');
const pier=load('lib/town/eastPier.ts'),{EAST_PIER:P,EAST_PIER_DECKS,JETTY_PATH:S,onEastPier,onEastPierHead,underEastPier,jettyOffset,jettySide,spiralRadius}=pier;
const {onIsland}=load('lib/town/shoreline.ts'),{onLand}=load('lib/town/landmass.ts'),{landableDecks}=load('lib/town/landableDecks.ts');
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts'),cay=load('lib/town/coralCay.ts'),{ballGround}=load('lib/town/ballSea.ts');
const boat=load('lib/town/fishing/deepSeaBoatData.ts'),cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts');
const last=S[S.length-1],pathLength=last.s;

// ---- Shape: straight out from the market seawall on the banner axis, then a 1–1.5 turn spiral winding inward (≈20 → 6 m)
// to a round plaza; walkway ≥ 4.5 m; smooth (no kinks between samples).
assert.equal(P.z,98,'on the EAST COAST FARMERS MARKET banner axis (farmersMarket.ts sign at z 98)');
assert(onIsland(P.wallX,P.z)&&!onIsland(P.shoreX+.5,P.z),'starts at the seawall on the island and leaves over water');
assert(P.turns>=1.75&&P.turns<=2&&P.r0>=28&&P.r0<=32&&P.r1<=10,`spiral ${P.turns} turns, ${P.r0} → ${P.r1} m`);
assert(P.cx-P.wallX>=100&&P.cx-P.wallX<=110,`straight section ${(P.cx-P.wallX).toFixed(0)} m`);
assert(P.plazaR-pier.JETTY_BEACON.r-.8>=4&&pier.JETTY_BEACON.height>=14&&pier.JETTY_BEACON.height<=18,'a 14–18 m lighthouse on a plaza with room to walk round it');
assert(P.walkHalf*2>=4.5&&P.kerbHalf>P.walkHalf&&P.railHalf>P.kerbHalf&&P.flankHalf>P.railHalf,'≥ 4.5 m walkable, kerbs outside it, rock armour outside the kerbs');
for(let i=1;i<S.length;i++){const a=S[i-1],b=S[i],turn=Math.acos(Math.max(-1,Math.min(1,a.tx*b.tx+a.tz*b.tz)));assert(turn<.12,`smooth curve at sample ${i} (${turn.toFixed(3)} rad)`);}
{const inner=spiralRadius(pier.SPIRAL_THETA0-Math.PI*2),pitch=P.r0-inner;assert(pitch-2*P.flankHalf>2,`open water between the coils (${(pitch-2*P.flankHalf).toFixed(1)} m)`);}
assert(onEastPier(P.cx-5,P.cz)&&onEastPier(P.cx-2,P.cz+5)&&!blocked(P.cx-5,P.cz,[],.32),'the centre plaza is walkable');
{const water=[{x:P.cx+12,z:P.cz},{x:P.cx,z:P.cz-13},{x:P.cx,z:P.cz+14}].filter(p=>!onEastPier(p.x,p.z));assert(water.length>=1&&water.every(p=>ballGround(p.x,p.z)==='sea'),'the water inside the coils is open sea');}
assert(EAST_PIER_DECKS.every(d=>landableDecks().some(r=>r.id===d.id&&r.height===0&&typeof r.contains==='function')),'one landable deck with a curved-walkway test, floor at y 0');

// ---- Walkable everywhere along the centre line and ±walkHalf; the sea just beyond the kerbs is not.
for(const p of S){if(p.x<P.shoreX||p.s>pathLength-1)continue;/* the square-cut inner end meets the plaza */for(const d of [-P.walkHalf+.05,0,P.walkHalf-.05]){const q=jettySide(p,d);assert(!blocked(q.x,q.z,[],0)&&onLand(q.x,q.z),`walkable at s ${p.s.toFixed(1)} offset ${d}`);}
 for(const d of [-(P.railHalf+.3),P.railHalf+.3]){const q=jettySide(p,d);if(jettyOffset(q.x,q.z)>P.walkHalf)assert(blocked(q.x,q.z,[],0),`sea past the kerb at s ${p.s.toFixed(1)}`);}}

// ---- Walk and every ride follow the jetty from the promenade to the plaza (steering at the centre line a few metres ahead,
// like a player), never leaving it; pushing sideways into either kerb stops at the walkable edge on the curves too.
const nearestS=(p,from)=>{let best=from,d=Infinity;for(let i=Math.max(0,from-20);i<Math.min(S.length,from+40);i++){const e=Math.hypot(S[i].x-p.x,S[i].z-p.z);if(e<d){d=e;best=i;}}return best;};
for(const mode of ['walk','scooter','bike','moped']){
 const p={x:230,z:P.z},v={x:0,z:0};let k=0;
 for(let i=0;i<60*400&&Math.hypot(p.x-(P.cx-4.5),p.z-P.cz)>1.5;i++){k=nearestS(p,k);const ahead=S[Math.min(S.length-1,k+(mode==='walk'?3:5))],target=k>=S.length-8?{x:P.cx-4.5,z:P.cz}:ahead;
  stepPlayer(p,v,{x:target.x-p.x,z:target.z-p.z,sprint:true},1/60,[],mode);assert(!blocked(p.x,p.z,[],0),`${mode} stays on the jetty at ${p.x.toFixed(1)},${p.z.toFixed(2)}`);}
 assert(Math.hypot(p.x-P.cx,p.z-P.cz)<=P.plazaR-.5,`${mode} reaches the lighthouse at the spiral centre (${p.x.toFixed(1)},${p.z.toFixed(1)}, sample ${k}/${S.length})`);
 for(const frac of [.2,.45,.6,.75,.9])for(const side of [-1,1]){const at=S.find(q=>q.s>=pathLength*frac),q={x:at.x,z:at.z},w={x:0,z:0},n={x:-at.tz*side,z:at.tx*side};
  for(let i=0;i<240;i++)stepPlayer(q,w,{x:n.x,z:n.z,sprint:true},1/60,[],mode);
  assert(jettyOffset(q.x,q.z)<=P.walkHalf+1e-6&&!blocked(q.x,q.z,[],0),`${mode}: the ${side>0?'outer':'inner'} edge holds at ${Math.round(frac*100)}% (${q.x.toFixed(1)},${q.z.toFixed(1)})`);}
}

// ---- Jetpack: the flyable zone covers the jetty and the rings; landing finds the walkway; the walkway is a floor at y 0.
for(const p of S)for(const d of [-12,0,12]){const q=jettySide(p,d);assert(!flightBlocked(q.x,q.z),`flyable at ${q.x.toFixed(0)},${q.z.toFixed(0)}`);}
for(const t of pier.PIER_TARGET_SPOTS)assert(!flightBlocked(t.x,t.z-10),'flyable round the ring');
{const lander=createRooftopTravel([],[],{x:0,z:0});
 for(const [x,z] of [[270,P.z+7],[P.cx+P.r0+5,P.cz+3],[P.cx-5,P.cz+1],[P.cx-pier.spiralRadius(-Math.PI)-6,P.cz]]){const safe=lander.findLanding(x,z);assert(safe&&onEastPier(safe.x,safe.z)&&Math.hypot(safe.x-x,safe.z-z)<10.5,`landing near ${x},${z} finds the jetty: ${JSON.stringify(safe)}`);}
 assert.equal(lander.surface(P.cx-5,P.cz),0,'the walkway is a floor at 0');}

// ---- Clear of the Deep Sea Boat (≥ 25 m from its deck plus 12 m of fishing water), the causeway and its sharks.
{const m=boat.BOAT_MOORING,near=(x,z)=>Math.min(...S.map(p=>Math.hypot(p.x-x,p.z-z)))-P.flankHalf;
 assert(near(m.x,m.z)>25+12+6,`boat clear by ${near(m.x,m.z).toFixed(0)} m`);
 assert(Math.min(...S.map(p=>p.z))-P.flankHalf-cay.CAUSEWAY.z>150,'far south of the causeway');
 assert(cay.SHARK_LOOPS.every(l=>l.points.every(p=>near(p.x,p.z)>100)),'sharks patrol nowhere near the pier');}

// ---- Seawall gap: no wall collision across the pier mouth; walls continue either side; gate piers close the ends.
{const T=require('three'),obstacles=[];const fake=()=>({rotation:{y:0}});load('lib/town/eastCoast.ts').buildEastCoast({box:fake,put:fake,obstacles});
 const wall=obstacles.filter(o=>o.w===.75&&o.d===.75&&o.x>230);
 assert(!wall.some(o=>Math.abs(o.z-P.z)<P.railHalf+.3),'the seawall opens for the pier');
 assert(wall.some(o=>o.z>P.z+4&&o.z<P.z+8)&&wall.some(o=>o.z<P.z-4&&o.z>P.z-8),'the seawall continues either side');
 assert(wall.some(o=>Math.abs(o.z-cay.CAUSEWAY.z)<12)&&!wall.some(o=>Math.abs(o.z-cay.CAUSEWAY.z)<cay.CAUSEWAY.deckHalf),'the causeway gap is unchanged');}

// ---- Fishing at the end: a spot on the head, the float lands in open water clear of the planks, shadows swim in the open.
{const s=cat.spotById('east-pier');assert(s&&onEastPier(s.x,s.z)&&Math.hypot(s.x-P.cx,s.z-P.cz)>P.r0-6,'fishing spot stands on the spiral\'s outer edge');
 const c=core.castPoint(s,s);assert(!underEastPier(c.x,c.z)&&core.inOpenWater(c.x,c.z)&&c.distance>3,'float lands in open water past the rail');
 assert(!core.inOpenWater(270,P.z)&&!core.inOpenWater(P.cx,P.cz)&&!core.inOpenWater(P.cx+pier.spiralRadius(0)+3.5,P.cz),'no shadow swims over the stone or rock armour');
 assert(!flightBlocked(s.buoy.x,s.buoy.z)&&!onLand(s.buoy.x,s.buoy.z),'its float is in the sea');}

// ---- Pier shooting challenge: the ring is out at sea at tap-shot range; only kicks from the head count; hits move the ring.
{const {PIER_TARGET_SPOTS:R,PIER_KICK_SPOT:K,PIER_TARGET_RADIUS:r}=pier;
 assert(onEastPierHead(K.x,K.z)&&onEastPier(K.x,K.z)&&jettyOffset(K.x,K.z-P.walkHalf*1.2)>P.walkHalf,'kick spot on the outer north stretch, facing open water');
 for(const t of R){assert.equal(ballGround(t.x,t.z),'sea',`ring spot ${t.x},${t.z} is open sea`);const d=Math.hypot(t.x-K.x,t.z-K.z);assert(d>18&&d<28,`ring ${d.toFixed(1)} m from the kick spot (a tap shot carries ~23 m)`);}
 const st={spot:0,hits:0,streak:0,best:0};
 assert.equal(pier.scorePierSplash(st,{x:R[0].x,z:R[0].z},{x:270,z:P.z}).message,'','a kick from elsewhere is not part of the challenge');
 const miss=pier.scorePierSplash(st,{x:R[0].x+r+.5,z:R[0].z},K);assert(!miss.hit&&/pick your spot/i.test(miss.message)&&st.spot===0,'a miss says pick your spot, ring stays');
 const hit=pier.scorePierSplash(st,{x:R[0].x+r-.2,z:R[0].z},K);assert(hit.hit&&st.hits===1&&st.spot===1&&/Pick your spot/.test(hit.message),'a hit scores, teaches and moves the ring');
 const again=pier.scorePierSplash(st,R[1],K);assert(again.hit&&st.streak===2&&st.spot===2&&/2 in a row/.test(again.message),'streaks count');
 const toRing=Math.atan2(R[0].x-K.x,R[0].z-K.z),aim=pier.pierAimYaw({spot:0},K,toRing+.2);assert(Math.abs(aim-Math.atan2(R[0].x-K.x,R[0].z-K.z))<1e-9,'a shot that faces the ring gets gentle aim help');
 assert.equal(pier.pierAimYaw({spot:0},K,toRing+.6),null,'facing elsewhere is left alone');assert.equal(pier.pierAimYaw({spot:0},{x:270,z:P.z},Math.PI/2),null,'no help away from the kick spot');
 assert(/fifatrainingcentre\.com/.test(pier.PIER_CHALLENGE_SOURCE)&&/either side/.test(pier.PIER_CHALLENGE_TIP),'the tip cites the FIFA Training Centre coaching point');
 // Economy: one-off learning coins only (learn:explore:east-pier-target, 5), never a daily or repeatable payout.
 const {LEARN_COINS}=load('lib/town/learnCoins.ts');assert.equal(LEARN_COINS.explore,5);
 const ch=src('lib/town/eastPierChallenge.ts');assert(/learnCoins\.pay\('explore',PIER_CHALLENGE_REWARD_ID/.test(ch)&&pier.PIER_CHALLENGE_REWARD_ID==='east-pier-target','first hit pays once through creditOnce');
 // Heat: one merged mesh, no shadow, no loops or timers; moved only on a hit.
 assert(/mergeGeometries\(parts\)/.test(ch)&&(ch.match(/new T\.Mesh\(/g)||[]).length===1&&/castShadow=false/.test(ch)&&/matrixAutoUpdate=false/.test(ch),'ring is one static mesh without shadow');
 assert(!/requestAnimationFrame|setInterval|setTimeout|update\(/.test(ch),'the ring has no loop');}

// ---- Islanders on the deck, with verified football lines.
{const {EAST_PIER_NPCS}=load('lib/town/eastPierNpcs.ts');assert.equal(EAST_PIER_NPCS.length,2);
 for(const n of EAST_PIER_NPCS){assert(onEastPier(n.x,n.z),`${n.name} stands on the jetty`);assert(n.topics.length>=2&&n.topics.every(t=>t.answer.length>40&&t.followUp.answer.length>40),`${n.name}: football conversation`);}
 assert(EAST_PIER_NPCS.some(n=>n.freestyle!==undefined),'the kid practises keep-ups');
 assert(/NPC_DIALOGUES\.push\(\.\.\.EAST_PIER_NPCS\)/.test(src('lib/town/npcDialogues.ts')),'they join the standard NPC conversations');
 const s=src('lib/town/eastPierNpcs.ts');assert(/Bar-Eli/.test(s)&&/theifab\.com/.test(s)&&/fifatrainingcentre\.com/.test(s),'sources cited');}

// ---- Scenery heat + integration: built into the shared batches, lamps in the night pool batch, no traffic, maps drawn.
{const w=src('lib/town/eastPierWorld.ts'),world=src('lib/town/world.ts');
 assert(!/requestAnimationFrame|setInterval|setTimeout|new T\.Mesh\(|castShadow=true|street\(|roads/.test(w)&&/fadeBand\(/.test(w)&&/IcosahedronGeometry/.test(w),'static merged pieces only (walkway, kerbs, armour, boulders, shallows) through the shared helpers; no roads (traffic stays off)');
 assert(/lampSites\.push\(\.\.\.coralCay\.lampSites,\.\.\.eastPier\.lampSites\)/.test(world),'pier lamps join the night pools');
 assert(/cx<=7&&cz>=0&&cz<=2/.test(world),'pier chunks are not hidden by the Coral Cay region gate');
 const map=src('components/IslandOverview.tsx');assert(/data-east-pier="spiral"/.test(map)&&/data-lighthouse/.test(map)&&/JETTY_PATH/.test(map)&&/PIER_TARGET_SPOTS/.test(map),'minimap and travel map draw the spiral jetty and ring (fishing marker via FISH_SPOTS)');}
console.log(`PASS East Jetty: ${(P.cx-P.wallX).toFixed(0)} m straight + ${P.turns}-turn spiral (${P.r0} → ${P.r1} m, plaza r ${P.plazaR}, ${pier.JETTY_BEACON.height} m lighthouse), ${pathLength.toFixed(0)} m of walkway; walk/scooter/bike/moped to the centre, curved edges hold, landing, flyable, boat/causeway/sharks clear, seawall gap, fishing, shooting ring, 2 islanders, heat rules`);
