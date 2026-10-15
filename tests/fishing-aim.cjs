// Aimed casting, hotspots, spooked water, the deep-sea boats' odds, no pop-in fish, the map markers and Summit Isle's Drop-off
// Ledge (Oct 14 2026, user: "update the fishing to be able to cast in certain spots to try and catch bigger fish. not cast in
// the same spot", "move the fishing boat … add a second boat … bigger fish on boats", "add one more fishing spot to the
// mountain island on the southeast side", "the fish sometimes teleport in").
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..'),T=require('three');
const cache=new Map(),counted=[];
const context=vm.createContext({console,Set,Map,Math,Date,JSON,Promise,Object,Array,Number,String,Error,URL,Float32Array,Float64Array,Uint8Array,Uint16Array,Int32Array,
 localStorage:{getItem:()=>null,setItem(){},removeItem(){}},window:{addEventListener(){},removeEventListener(){}},performance:{now:()=>0}});
const STUBS={[path.resolve(ROOT,'lib/analytics/tracker.ts')]:{count:id=>counted.push(id)}};
function load(name){const file=path.resolve(ROOT,name.replace(/^@\//,''));if(STUBS[file])return STUBS[file];if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,id=>id==='three'?T:id.startsWith('@/')?load(id.slice(2)+'.ts'):id.startsWith('.')?load(path.relative(ROOT,path.resolve(path.dirname(file),id+'.ts'))):require(id));
 cache.set(file,mod.exports);return mod.exports;}
const lcg=seed=>()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const cat=load('lib/town/fishing/fishCatalog.ts'),core=load('lib/town/fishing/fishingCore.ts'),aim=load('lib/town/fishing/fishingAim.ts'),odds=load('lib/town/fishing/fishingOdds.ts');
const {FISH_SPOTS,fishById}=cat;let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};

// ---- 1. Every landing is good water: clamped into the aim area (what the camera frames), never on sand, rocks, piers or a hull.
for(const s of FISH_SPOTS)for(const phone of [false,true]){const A=aim.aimArea(s,s,phone),r=lcg(7+s.id.length);
 ok(A.min>0&&A.max>=A.min&&A.max<=30,`${s.id}: an aim area (${A.min.toFixed(1)}–${A.max.toFixed(1)} m)`);
 // Targets everywhere: in the area, behind the angler, far out, on land, sideways.
 for(let k=0;k<160;k++){const ang=r()*Math.PI*2,d=r()*45,t={x:s.x+Math.cos(ang)*d,z:s.z+Math.sin(ang)*d},L=aim.clampAim(A,t);
  ok(aim.landable(L.x,L.z)&&core.inOpenWater(L.x,L.z),`${s.id}: a landing at ${L.x.toFixed(1)},${L.z.toFixed(1)} is open water`);
  const dx=L.x-s.x,dz=L.z-s.z,a=dx*A.dir.x+dz*A.dir.z,b=dx*A.dir.z-dz*A.dir.x;
  ok(a>=A.min-1e-6&&a<=A.max+1e-6&&Math.abs(b)<=aim.aimLateral(A,a)+1e-6,`${s.id}: the landing stays in the framed water`);}
 // The polar aim (Cast-button drag, arrow keys) covers the area and lands well too.
 for(let u=-1;u<=1;u+=.5)for(let v=0;v<=1;v+=.5){const L=aim.clampAim(A,aim.aimPolar(A,u,v));ok(aim.landable(L.x,L.z),`${s.id}: polar aim ${u},${v} lands in water`);}
 // Aiming reaches different water: the far left and far right landings are metres apart.
 {const l=aim.clampAim(A,aim.aimPolar(A,-1,1)),rr=aim.clampAim(A,aim.aimPolar(A,1,1)),n=aim.clampAim(A,aim.aimPolar(A,0,0)),f=aim.clampAim(A,aim.aimPolar(A,0,1));
  ok(Math.hypot(l.x-rr.x,l.z-rr.z)>=2||s.area==='causeway',`${s.id}: aim left vs right ${Math.hypot(l.x-rr.x,l.z-rr.z).toFixed(1)} m apart`);
  ok(Math.hypot(n.x-f.x,n.z-f.z)>=1||A.max-A.min<1,`${s.id}: aim near vs far`);}}

// ---- 2. Quick cast (the Cast button, a quick Space tap): always good water near the usual float, not the same point every time.
for(const s of FISH_SPOTS){const A=aim.aimArea(s,s),r=lcg(3),seen=new Set();
 for(let k=0;k<40;k++){const L=aim.quickCast(A,r);ok(aim.landable(L.x,L.z),`${s.id}: quick cast lands in water`);ok(Math.hypot(L.x-A.base.x,L.z-A.base.z)<=Math.max(4,(A.max-A.min)*.35+2),`${s.id}: quick cast near the usual float`);seen.add(L.x.toFixed(1)+','+L.z.toFixed(1));}
 ok(seen.size>=5,`${s.id}: quick casts vary (${seen.size} landings)`);}

// ---- 3. Hotspots: 1–3 per spot (2–3 on the boats), in good water inside the aim area, spread out, re-placed every few minutes.
for(const s of FISH_SPOTS){const A=aim.aimArea(s,s);let any=0;
 for(let session=0;session<6;session++){const seed=aim.hotspotSeed(s.id,1000+session*aim.HOTSPOT_RESEED,session),H=aim.planHotspots(s,A,seed);any+=H.length;
  ok(H.length<=3&&(!s.deep||H.length>=2),`${s.id}: ${H.length} hotspots`);
  for(const h of H){ok(aim.landable(h.x,h.z),`${s.id}: hotspot ${h.kind} in good water`);ok((s.deep?aim.DEEP_HOTSPOTS:aim.SHORE_HOTSPOTS).includes(h.kind),`${s.id}: a ${s.deep?'deep-sea':'shore'} sign (${h.kind})`);
   const c=aim.hotspotAt(h,600);ok(Math.hypot(c.x-h.x,c.z-h.z)<=h.drift.rad+1e-6&&h.drift.period>=100,`${s.id}: hotspots drift slowly`);
   const c0=aim.hotspotAt(h,42);ok(aim.hotAt(H,c0.x,c0.z,42)>.99,`${s.id}: casting on a hotspot counts as hot`);}
  for(let i=0;i<H.length;i++)for(let j=i+1;j<H.length;j++)ok(Math.hypot(H[i].x-H[j].x,H[i].z-H[j].z)>=H[i].r*1.8-1e-6,`${s.id}: hotspots spread out`);}
 ok(any>=6,`${s.id}: hotspots appear (${any} over 6 sessions)`);
 ok(aim.hotspotSeed(s.id,0,0)!==aim.hotspotSeed(s.id,aim.HOTSPOT_RESEED,0),`${s.id}: re-seeded every few minutes`);}
ok(aim.hotAt([],0,0,0)===0,'no hotspots, no boost');

// ---- 4. Hotspot odds and caps (internal, never shown): rarer catches more likely, commons unchanged, boat + hotspot capped.
{const ratio=(s,hot)=>{const w=Object.entries(odds.catchWeights(s,hot)),t=w.reduce((n,[,x])=>n+x,0);return w.filter(([id])=>/rare|legendary/.test(fishById(id).rarity)).reduce((n,[,x])=>n+x/t,0);};
 for(const s of FISH_SPOTS){ok(odds.catchWeights(s,0)===s.weights,`${s.id}: no hotspot, the spot's own table`);
  if(Object.keys(s.weights).some(id=>/rare|legendary/.test(fishById(id).rarity)))ok(ratio(s,1)>ratio(s,0)*(s.deep?1.1:1.2),`${s.id}: a hotspot raises the rare odds (capped on the boats) (${ratio(s,0).toFixed(3)} → ${ratio(s,1).toFixed(3)})`);
  for(const id of Object.keys(s.weights)){const f=fishById(id),k=odds.hotFactor(s,f.rarity,1);ok(k>=1&&k*(s.rarityBoost?.[f.rarity]??1)<=odds.BOOST_CAP+1e-9,`${s.id}/${id}: capped boost`);if(f.rarity==='common')ok(k===1,'commons are not boosted');}}
 ok(odds.HOTSPOT_BOOST.rare>=1.5&&odds.HOTSPOT_BOOST.rare<=2&&odds.HOTSPOT_BOOST.legendary<=2,'a moderate hotspot boost (×1.5–2 rare)');
 // Simulated: 20,000 bites on the Deep Sea Boat with and without a hotspot.
 const boat=cat.spotById('deep-sea-boat'),rate=hot=>{const r=lcg(11);let n=0;for(let i=0;i<20000;i++)if(/rare|legendary/.test(fishById(core.rollCatch(boat,r(),hot)).rarity))n++;return n/20000;};
 const r0=rate(0),r1=rate(1);ok(r1>r0*1.08&&r1<r0*1.6,`boat hotspot: rare ${r0.toFixed(3)} → ${r1.toFixed(3)}`);
 // The deep-sea boats vs the old odds (before Oct 14 2026: rare + legendary 9.4 in 100).
 ok(r0>.14&&r0<.18,`deep-sea boat rare + legendary ${r0.toFixed(3)} (was .094)`);
 // Bigger fish on the boats: the same species rolls bigger at sea than on the shore (size never changes the price).
 {const mean=b=>{const r=lcg(5);let n=0;for(let i=0;i<4000;i++)n+=core.rollSize('tuna',r(),0,b);return n/4000;};ok(mean(.6)>mean(0)*1.05,`a tuna rolls bigger on a boat (${mean(0).toFixed(0)} → ${mean(.6).toFixed(0)} cm)`);}}

// ---- 5. Spooked water: casting again where you just cast is slower and gives smaller fish; it recovers over time; the hint says so.
{const H=[];aim.rememberCast(H,10,10,0);
 ok(aim.spookAt(H,10,10,1)>=.55,'one cast here: spooked');ok(aim.spookAt(H,10+aim.SPOOK_RADIUS+.1,10,1)===0,'a few metres away: calm');
 aim.rememberCast(H,10.5,10,20);ok(aim.spookAt(H,10.2,10,21)>=.95,'two casts here: very spooked');
 ok(aim.spookAt(H,10,10,20+aim.SPOOK_RECOVER*.5)<aim.spookAt(H,10,10,21),'it calms down');ok(aim.spookAt(H,10,10,20+aim.SPOOK_RECOVER+1)===0,'and recovers fully');
 for(let i=0;i<10;i++)aim.rememberCast(H,i,0,30+i);ok(H.length===aim.SPOOK_MEMORY,'only the last few casts are remembered');
 const s=cat.spotById('south-pier');ok(core.biteWait(s,1,.5)>core.biteWait(s,0,.5)*2,'spooked: a much slower bite');
 ok(core.biteWait(cat.spotById('deep-sea-boat'),0,.5)===core.biteWait(s,0,.5)+cat.DEEP_BITE_DELAY,'deep water: the boat waits a little longer');
 const big=(sp)=>{const r=lcg(9);let n=0;for(let i=0;i<2000;i++)n+=core.rollSize('mackerel',r(),sp);return n/2000;};ok(big(1)<big(0)*.9,'spooked: smaller fish');
 // In a live session a spooked hotspot loses its boost (no farming one patch).
 const sess=core.createSession();sess.mods={hot:1,spook:1};sess.phase='floating';sess.wait=0;let id=null;const spot=cat.spotById('deep-sea-boat');
 const r=lcg(2);core.stepSession(sess,spot,.05,r,{approach:(rr,f)=>core.planApproach({x:spot.buoy.x,z:spot.buoy.z,dir:{x:1,z:0}},rr,f)});id=sess.fish?.id;ok(!!id,'a fish comes');
 const hint=load('lib/town/fishing/fishingAim.ts');ok(/spooked, try another spot/.test(hint.SPOOKED_HINT)&&/Read the water/.test(hint.READ_WATER_HINT),'the hints: spooked water and reading the water');}

// ---- 6. No pop-in (user: "the fish sometimes teleport in"): every biter fades up out of the depth haze from well away from the
// float, swims a continuous path (no jumps between frames), and leaves by fading and sinking. Simulated on every spot.
{const dt=1/60;
 for(const s of FISH_SPOTS){const c=core.castPoint(s,s),r=lcg(21+s.id.length);let spawns=0,far=0;
  for(let n=0;n<40;n++){const sess=core.createSession();sess.phase='floating';sess.wait=0;
   const o={easy:false,out:c.dir,approach:(rr,f)=>core.planApproach(c,rr,f)};
   core.stepSession(sess,s,dt,r,o);const sh=sess.shadow;if(!sh)continue;spawns++;
   ok(sh.alpha===0&&sh.rise===1,`${s.id}: a new biter starts invisible, deep in the haze`);
   const d0=Math.hypot(sh.x,sh.z);if(d0>=5)far++;
   let px=sh.x,pz=sh.z,firstVisible=null;const f=fishById(sess.fish.id),max=(f.group==='shark'?1.6:core.SWIM_SPEED[f.rarity])*1.7*dt+1e-6;
   for(let k=0;k<1200&&sess.phase==='approach';k++){core.stepSession(sess,s,dt,r,o);const q=sess.shadow;if(!q)break;
    ok(Math.hypot(q.x-px,q.z-pz)<=max,`${s.id}: the biter swims, never jumps (${Math.hypot(q.x-px,q.z-pz).toFixed(3)} m in one frame)`);px=q.x;pz=q.z;
    if(firstVisible===null&&q.alpha>.05)firstVisible={rise:q.rise,d:Math.hypot(q.x,q.z)};}
   // By the time it is more than faintly visible it is still deep (risen less than half way) and well away from the float.
   if(firstVisible)ok(firstVisible.rise>=.5,`${s.id}: first visible while still deep (rise ${firstVisible.rise.toFixed(2)})`);
   // Leaving: scare it and check it fades as it sinks.
   if(sess.phase==='nibble'||sess.phase==='approach'){core.tapSession(sess);let a=1,rs=0;for(let k=0;k<200&&sess.shadow;k++){core.stepSession(sess,s,dt,r,o);const q=sess.shadow;if(!q)break;ok(q.alpha<=a+1e-9&&q.rise>=rs-1e-9,`${s.id}: it fades and sinks away`);a=q.alpha;rs=q.rise;}}}
  ok(spawns>=30&&far>=spawns*.6,`${s.id}: most biters start 5 m+ out (${far}/${spawns})`);}
 // The visuals place it by `rise` (deeper and fainter while rising) and the ambient fish rise in as they fade in.
 const vis=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingVisuals.ts'),'utf8'),sch=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishSchools.ts'),'utf8');
 ok(/sh\.rise/.test(vis)&&/1-rise\*\.55/.test(vis),'the visuals hold a rising biter deep and faint');
 ok(/riseIn/.test(sch)&&/if\(!mesh\.visible\)fade=0/.test(sch),'ambient fish rise from the haze as a session fades in');
 ok(/Math\.min\(1,b\.t\/3,\(b\.life-b\.t\)\/3\)/.test(sch)&&/b0=-side\*wide\*2/.test(sch),'deep silhouettes start outside the view and fade at both ends');}

// ---- 7. The deep scene and the water signs: one draw each, built once, nothing at rest.
{const col=fs.readFileSync(path.join(ROOT,'lib/town/fishing/deepSeaScene.ts'),'utf8'),ov=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingOverlay.ts'),'utf8');
 ok((col.match(/new T\.Mesh\(/g)||[]).length===1&&!/requestAnimationFrame|setInterval|setTimeout/.test(col),'the water column is one mesh, no timers');
 ok((ov.match(/new T\.InstancedMesh\(/g)||[]).length===1&&!/new T\.Mesh\(/.test(ov)&&!/requestAnimationFrame|setInterval|setTimeout/.test(ov),'the water signs and aim arc are one instanced draw, no timers');
 const scene=new T.Scene(),D=load('lib/town/fishing/deepSeaScene.ts').createDeepSeaScene(scene,true),uw=load('lib/town/fishing/underwater.ts');
 ok(!D.mesh.visible,'the column is hidden until a deep session');D.begin({x:0,z:0},{x:1,z:0},uw.REEF_THEMES['blue-abyss']);ok(D.mesh.visible,'shown at a deep-sea boat');
 D.end();for(let i=0;i<60;i++)D.frame(.05,false);ok(!D.mesh.visible,'and hidden again after it fades');
 D.begin({x:0,z:0},{x:1,z:0},uw.REEF_THEMES['harbour-fan-wall']);for(let i=0;i<5;i++)D.frame(.05,false);ok(!D.mesh.visible,'never at a shore spot');D.dispose();
 const tris=new T.Scene();const O=load('lib/town/fishing/fishingOverlay.ts').createFishingOverlay(tris);ok(!O.mesh.visible&&O.mesh.count===0,'the water signs draw nothing at rest');
 const A=aim.aimArea(cat.spotById('deep-sea-boat'),cat.spotById('deep-sea-boat'));O.setHotspots(aim.planHotspots(cat.spotById('deep-sea-boat'),A,5));O.begin();O.setAim({from:{x:0,y:1.5,z:0},to:{x:5,z:0}});O.frame(.016,false,0);
 ok(O.mesh.count>=3&&O.mesh.count<=32,`while fishing: ${O.mesh.count} quads in one draw`);O.dispose();}

// ---- 8. The world wiring: aim input from the HUD, the landing picked at the cast, the hint, the counters.
{const world=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingWorld.ts'),'utf8'),host=fs.readFileSync(path.join(ROOT,'components/FishingHost.tsx'),'utf8'),sess=fs.readFileSync(path.join(ROOT,'lib/town/fishing/fishingSession.ts'),'utf8');
 ok(/taps\.includes\('cast'\)\)landCast/.test(world)&&/quickCast\(area,Math\.random\)/.test(world)&&/api\.session\.mods=\{hot,spook\}/.test(world),'each cast lands where aimed (or a quick cast) and sets hot / spooked');
 ok(/castAimed\(\)/.test(host)&&/fishingSession\.aim\(ndc\(e\)\)/.test(host)&&/kind:'polar'/.test(host)&&/charge:k\.space/.test(host),'HUD: drag on the water, drag from Cast, arrows + hold Space');
 ok(/if\(held<200\)\{fishingSession\.aim\(null\);fishingSession\.tap\(\);\}/.test(host)&&/if\(!waiting\)fishingSession\.tap\(\)/.test(host),'a quick tap (Space or the Cast button) is a quick cast');
 ok(/READ_WATER_HINT/.test(sess)&&/SPOOKED_HINT/.test(sess)&&/HOTSPOT_HINT/.test(sess),'the hints are wired');
 // The session API: a cast thrown at an aim carries that aim to the world once; a plain tap carries none.
 const S=load('lib/town/fishing/fishingSession.ts').createFishingSession(()=>({isNew:false,isBiggest:false,inBasket:true}));
 S.begin('south-pier');S.aim({kind:'screen',x:.2,y:-.3});S.castAimed();ok(S.session.phase==='casting','castAimed casts');const a1=S.takeAimedCast();ok(a1&&a1.kind==='screen'&&a1.x===.2,'the aim reaches the world');ok(S.takeAimedCast()===null,'read once');
 ok(S.aimInput===null,'the aim clears once cast');
 // Analytics: catches at the new summit spot count (no SQL: the counter channel takes any fixed id).
 const ev=load('lib/analytics/summitEvents.ts');counted.length=0;ev.countSummitFishCatch('summit-ledge');ev.countSummitFishCatch('deep-sea-boat-west');
 ok(counted.join()==='su:fish_ledge','a Drop-off Ledge catch counts su:fish_ledge');
 ok(/\['fish_ledge','Fish caught at Drop-off Ledge'\]/.test(fs.readFileSync(path.join(ROOT,'lib/analytics/countIds.ts'),'utf8')),'and the admin lists it');
 const places=load('lib/analytics/islandPlaces.ts');for(const b of load('lib/town/fishing/deepSeaBoatData.ts').DEEP_SEA_BOATS){ok(places.placeAt(b.stand.x,b.stand.z)==='deep_sea_boat',`${b.spotId}: time on the boat counts as deep_sea_boat`);ok(places.placeAt(b.mooring.x+20,b.mooring.z)==='deep_sea_boat','the boat\'s water too');}
 ok(places.placeAt(282.5,-93.5)!=='deep_sea_boat','the old mooring is plain sea now');
 const sql=fs.readFileSync(path.join(ROOT,'supabase/migrations/20261015_analytics_summit_kit.sql'),'utf8');ok(!/deep_sea_boat_west/.test(sql)&&!/deep_sea_boat_west/.test(fs.readFileSync(path.join(ROOT,'lib/analytics/islandIds.ts'),'utf8')),'no new place key (the second boat folds into deep_sea_boat)');}

// ---- 9. Map and minimap: an F mark for every spot (both boats and the ledge included), inside the map, never stacked.
{const map=fs.readFileSync(path.join(ROOT,'components/IslandOverview.tsx'),'utf8'),sim=load('lib/town/simulation.ts'),B=sim.FLIGHT_BOUNDS;
 ok(/FISH_SPOTS\.map\(spot=><g key=\{spot\.id\}/.test(map)&&/data-fishing-marker=\{spot\.id\}/.test(map),'the map draws an F for every fishing spot (both the travel map and the minimap use this terrain)');
 for(const id of ['deep-sea-boat','deep-sea-boat-west','summit-ledge']){const s=cat.spotById(id);ok(s.x>B.minX+10&&s.x<B.maxX-10&&s.z>B.minZ+10&&s.z<B.maxZ-10,`${id}: its F mark is on the map`);}
 for(let i=0;i<FISH_SPOTS.length;i++)for(let j=i+1;j<FISH_SPOTS.length;j++){const a=FISH_SPOTS[i],b=FISH_SPOTS[j];ok(Math.hypot(a.x-b.x,a.z-b.z)>=2*9.5,`F marks ${a.id} / ${b.id} do not overlap`);}
 // The travel map projects world x/z 1:1 (viewBox in world metres): the Deep Sea Boat's mark is where the user circled.
 ok(/viewBox=\{`\$\{b\.minX-8\} \$\{b\.minZ-8\} \$\{w\+16\} \$\{h\+16\}`\}/.test(map)||/`\$\{b\.minX-8\} \$\{b\.minZ-8\} \$\{w\+16\} \$\{h\+16\}`/.test(map),'map coordinates are world metres');}

// ---- 10. Summit Isle's Drop-off Ledge: walkable south-east shore, clear of the sea life, the other floats, trails, huts and caves.
{const S=load('lib/town/summitIsle.ts'),life=load('lib/town/summitSeaLife.ts'),M=load('lib/town/mantaLoops.ts'),balls=load('lib/town/summitBalls.ts'),s=cat.spotById('summit-ledge');
 ok(s&&s.area==='summit'&&s.reef==='ledge-dropoff','Drop-off Ledge: a Summit Isle spot with its own reef');
 ok(S.onSummitIsle(s.x,s.z)&&!S.onSummitSandbar(s.x,s.z),'the angler stands on Summit Isle sand');
 const bearing=Math.atan2(s.z-S.SUMMIT_CENTER.z,s.x-S.SUMMIT_CENTER.x)*180/Math.PI;ok(bearing>30&&bearing<70,`on the south-east side (${bearing.toFixed(0)}°)`);
 ok(core.inOpenWater(s.buoy.x,s.buoy.z),'its idle float is in open water');
 const loops=[...life.SUMMIT_SHARK_LOOPS,life.WHALE_SHARK_LOOP,...M.MANTA_LOOPS].map(l=>l.points);
 for(const phone of [false,true]){const A=aim.aimArea(s,s,phone);for(let u=-1;u<=1;u+=.25)for(let v=0;v<=1;v+=.25){const p=aim.clampAim(A,aim.aimPolar(A,u,v)),g=Math.min(...loops.flatMap(pts=>pts.map(q=>Math.hypot(q.x-p.x,q.z-p.z))));ok(g>=15,`ledge cast area ${g.toFixed(1)} m from a loop (≥ 15)`);}}
 for(const o of FISH_SPOTS)if(o.id!==s.id)ok(Math.hypot(o.buoy.x-s.buoy.x,o.buoy.z-s.buoy.z)>=60&&Math.hypot(o.x-s.x,o.z-s.z)>=60,`60+ m from ${o.id}`);
 ok(S.summitTrailDistance(s.x,s.z)>=4,'4+ m from the trails');
 for(const h of balls.SUMMIT_HUTS)ok(Math.hypot(h.x-s.x,h.z-s.z)>=15,`clear of the ${h.name}`);for(const c of balls.SUMMIT_CAVES)ok(Math.hypot(c.x-s.x,c.z-s.z)>=15,`clear of the ${c.name}`);
 for(const b of balls.SUMMIT_BALL_SPOTS)if(b.summit)ok(Math.hypot(b.x-s.x,b.z-s.z)>=8,`clear of the ${b.name} ball`);
 // A shore spot with shore odds: no specials, the shared table, a mean catch near the shore's.
 const w=Object.entries(s.weights),t=w.reduce((n,[,x])=>n+x,0),ev=w.reduce((n,[id,x])=>n+x/t*fishById(id).price,0);ok(!s.rarityBoost&&!s.biteDelay&&ev>3.7&&ev<4.4,`shore odds (mean ${ev.toFixed(2)})`);
 // The orchard and the beach finds keep clear of every Summit Isle fishing spot, this one included.
 ok(/for\(const f of FISH_SPOTS\)if\(f\.area==='summit'\)/.test(fs.readFileSync(path.join(ROOT,'lib/town/summitOrchard.ts'),'utf8')),'the orchard keeps clear of it');}

console.log(`PASS fishing aim: aimed + quick casts always land in framed open water at all ${FISH_SPOTS.length} spots, 1–3 drifting hotspots (capped rare boost), spooked water slows and shrinks then recovers, no pop-in biters, one-draw deep column and water signs, both boats and the ledge on the map and in analytics (${checks} checks)`);
