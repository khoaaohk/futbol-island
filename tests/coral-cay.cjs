// Coral Cay (Sep 29 2026, revision 2): winding, beach-lined causeway walkability for every ground ride, both sandbar
// stops, the curved flight corridor (inside allowed, off-corridor sea blocked), the traced map outline matching
// flightBlocked, safe landings over the corridor, the irregular cay's size and the teaching NPCs' placement.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const {stepPlayer,blocked,flightBlocked,FLIGHT_BOUNDS,MAIN_FLIGHT_BOUNDS}=load('lib/town/simulation.ts');
const cay=load('lib/town/coralCay.ts'),{ISLAND_SHORE,onIsland}=load('lib/town/shoreline.ts'),{onLand}=load('lib/town/landmass.ts');
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const {CORAL_CAY_NPCS}=load('lib/town/coralCayNpcs.ts');
const area=pts=>Math.abs(pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p.x*q.z-q.x*p.z;},0)/2);
const P=cay.CAUSEWAY_PATH,CORRIDOR_X0=cay.CORRIDOR.x0,CORRIDOR_X1=cay.CORRIDOR.x1;

// Size and shape: a quarter of the main island's area, irregular (not an ellipse), beach all round.
const ratio=area(cay.CAY_SHORE)/area(ISLAND_SHORE);
assert(ratio>.22&&ratio<.28,'cay is about 1/4 of the main island: '+ratio.toFixed(3));
{const C=cay.CAY_CENTER,r=cay.CAY_SHORE.map(p=>Math.hypot(p.x-C.x,p.z-C.z));let turns=0;for(let i=0;i<r.length;i++){const a=r[(i+r.length-1)%r.length],b=r[i],c=r[(i+1)%r.length];if(b<a&&b<c)turns++;}
 assert(turns>=8,'the cay outline has coves and headlands, not an oval: '+turns+' coves');}
for(const s of cay.SANDBARS){const r=s.outline.map(p=>Math.hypot(p.x-s.x,p.z-s.z));assert(Math.max(...r)/Math.min(...r)>1.6,s.id+' is irregular');}
assert(cay.CAY_SAND.every(s=>cay.onCay((s.outer.x+s.inner.x)/2,(s.outer.z+s.inner.z)/2)),'sand ring lies on the cay');
{const widths=cay.CAY_SAND.map(s=>Math.hypot(s.outer.x-s.inner.x,s.outer.z-s.inner.z));assert(Math.min(...widths)>=8&&Math.max(...widths)-Math.min(...widths)>6,'uneven beach width all round');}

// The causeway winds: longer than the straight distance, bends both ways, x only increases.
assert(cay.CAUSEWAY.waterSpan>=1.5*165&&cay.CAUSEWAY.waterSpan<=2*165+10,'water span 1.5-2x the first causeway: '+cay.CAUSEWAY.waterSpan.toFixed(0));
assert(Math.min(...P.map(p=>p.z))<-185&&Math.max(...P.map(p=>p.z))>-135,'S-curve: bends north and south of z -159');
assert(P.every((p,i)=>!i||p.x>P[i-1].x),'centre line x is monotonic (walking lookups rely on it)');
for(const side of [-1,1]){const beach=P.filter(p=>cay.shoulderWidth(p.s,side)>0).length*2;assert(beach>cay.CAUSEWAY.waterSpan*.4,`side ${side}: beach along ${beach} m`);}

// Walk, scooter, bike and moped follow the curve from the Community Hall junction to the plaza on steering that
// aims at the centre line a little ahead (like a player), never stepping off land.
for(const mode of ['walk','scooter','bike','moped']){
 const p={x:205,z:-159},v={x:0,z:0};
 for(let i=0;i<60*200&&p.x<cay.CAY_BOULEVARD.x1-3;i++){const f=cay.causewayFrame(p.x,p.z),ahead=cay.causewayAt(Math.min(cay.CAUSEWAY_LENGTH,f.s+8));stepPlayer(p,v,{x:ahead.x-p.x,z:ahead.z-p.z,sprint:true},1/60,[],mode);assert(!blocked(p.x,p.z,[],0),`${mode} stays on land at ${p.x.toFixed(1)},${p.z.toFixed(1)}`);}
 assert(p.x>=cay.CAY_BOULEVARD.x1-3&&cay.onCay(p.x,p.z),`${mode} reaches the Coral Cay boulevard (x=${p.x.toFixed(1)})`);
}
// Deck edges hold on a curve: pushing sideways (outward on a bend with no beach) stops at the rail line.
for(const mode of ['walk','moped']){for(const s of cay.SANDBARS){const at=cay.causewayAt(s.spur.s+ (s.side<0?-9:9)),side=s.side;
 const p={x:at.x,z:at.z},v={x:0,z:0},n={x:-at.tz*side,z:at.tx*side};
 for(let i=0;i<600;i++)stepPlayer(p,v,{x:n.x,z:n.z,sprint:true},1/60,[],mode);
 const f=cay.causewayFrame(p.x,p.z),limit=cay.shoulderWidth(f.s,side)>0?cay.CAUSEWAY.deckHalf+cay.shoulderWidth(f.s,side):cay.CAUSEWAY.walkHalf+.2;
 assert(f.dist<=limit&&onLand(p.x,p.z),`${mode} stops at the edge beside ${s.id} (${f.dist.toFixed(2)} ≤ ${limit.toFixed(2)})`);}}
// Beach shoulders are walkable sand; beyond them is sea.
{const s=P.find(p=>cay.shoulderWidth(p.s,1)>6),w=cay.shoulderWidth(s.s,1),on=cay.offsetPoint(s,cay.CAUSEWAY.deckHalf+w*.5),off=cay.offsetPoint(s,cay.CAUSEWAY.deckHalf+w+1.5);
 assert(!blocked(on.x,on.z,[],0)&&blocked(off.x,off.z,[],0),'beach bank walkable, sea beyond it');}
// Both sandbar stops: from the deck at the bend, down the spur onto the sand, on foot, by scooter and by moped.
for(const s of cay.SANDBARS)for(const mode of ['walk','scooter','moped']){
 const p={x:s.spur.x,z:s.spur.roadZ},v={x:0,z:0};for(let i=0;i<60*12;i++)stepPlayer(p,v,{x:(s.x-p.x)*.05,z:s.side,sprint:false},1/60,[],mode);
 assert(Math.hypot(p.x-s.x,p.z-s.z)<s.radius&&cay.onSandbarStop(p.x,p.z),`${s.name} is reachable by ${mode} (reached ${p.x.toFixed(1)},${p.z.toFixed(1)})`);
 assert(blocked(s.spur.x+7,s.spur.roadZ+s.side*11,[],0),'water beside the spur');
}
assert(onLand(600,-160)&&!onIsland(600,-160)&&onLand(342,-194)&&!onLand(342,-160),'landmass joins the cay and the winding deck; shoreline stays main-island only');

// Flight: the jetpack follows the corridor from the main island to the cay without touching the boundary.
{const p={x:190,z:-159},v={x:0,z:0};for(let i=0;i<60*90&&p.x<cay.CAY_CENTER.x;i++){const f=cay.causewayFrame(p.x,p.z,true),ahead=cay.causewayAt(Math.min(cay.CAUSEWAY_LENGTH,f.s+15));stepPlayer(p,v,ahead.s>=cay.CAUSEWAY_LENGTH-1?{x:1,z:0,sprint:false}:{x:ahead.x-p.x,z:ahead.z-p.z,sprint:false},1/60,[],'jetpack');assert(!flightBlocked(p.x,p.z));}
 assert(p.x>=cay.CAY_CENTER.x,'jetpack reaches Coral Cay along the corridor');}
// A straight line east from the Community Hall stays inside the corridor all the way (it is 36+ m wide on the bends).
for(let x=196;x<=560;x+=2)assert(!flightBlocked(x,-159),`straight east at x=${x} is flyable`);
// Funnel entry near both coasts; off-corridor open sea stays blocked.
assert(!flightBlocked(250,-215)&&!flightBlocked(262,-100)&&!flightBlocked(480,-230),'forgiving corridor entry at both coasts');
for(const [x,z] of [[330,-285],[800,-160],[400,-270],[FLIGHT_BOUNDS.maxX+5,-160]])assert(flightBlocked(x,z),`open sea at ${x},${z} is blocked`);
for(const s of cay.SANDBARS)assert(!flightBlocked(s.x,s.z+s.side*(s.radius+10)),s.id+' halo is flyable');
// South edge = the user's red line: near-straight at z -55 east of the rounded corner; inside near it, outside well south.
assert(!flightBlocked(420,-57)&&!flightBlocked(505,-57)&&!flightBlocked(330,-52)&&!flightBlocked(300,-17),'points just inside the red line are flyable');
// Sep 29 2026 (user's second red line): the sea south of that first line is now flyable too (the south-east sea).
for(const [x,z] of [[420,-40],[380,-30],[500,-35],[350,-35],[400,0],[450,20],[560,10]])assert(!flightBlocked(x,z),`the south-east sea at (${x},${z}) is flyable`);
{let flat=0;for(let x=350;x<=540;x+=5)flat=Math.max(flat,Math.abs(cay.corridorEdges(x).south-cay.CORRIDOR_SOUTH.z));assert(flat<.01,'south edge is straight east of the corner');}
// South-east extension below the cay (user's red line): inside east of it, outside well west of it.
assert(!flightBlocked(700,60)&&!flightBlocked(760,100)&&!flightBlocked(800,0),'the south-east extension is flyable');
// South-east sea (second red line (855,111) → (712,152) → (597,270)): everything north-west of it is flyable, one region.
for(const [x,z] of [[450,150],[560,60],[620,60],[300,200],[520,280],[700,140],[840,100],[282.5,-93.5]])assert(!flightBlocked(x,z),`north-west of the second red line (${x},${z}) is flyable`);
for(const [x,z] of [[750,250],[740,165],[640,250],[870,111],[600,300],[430,315]])assert(flightBlocked(x,z),`south-east of the second red line (${x},${z}) is blocked`);
{const sea=cay.SOUTH_EAST_SEA;let near=0;for(const [x,z] of [[855,111],[712,152],[597,270]])near+=sea.some(p=>Math.hypot(p.x-x,p.z-z)<1)?1:0;assert(near===3,'the fill passes through the red line points');}
{let blockedIn=0;for(let x=300;x<=760;x+=6)for(let z=-44;z<=110;z+=6)if(flightBlocked(x,z)&&!onLand(x,z))blockedIn++;assert(blockedIn===0,`no notches between the old pieces (${blockedIn} blocked water points)`);}
// The corridor is a broad smoothed band: ≥70 m south and ≥38 m north of the road everywhere, no pinch at the bends.
for(let x=240;x<=520;x+=4){const e=cay.corridorEdges(x),road=P.reduce((b,p)=>Math.abs(p.x-x)<Math.abs(b.x-x)?p:b).z;assert(e.south-road>=70&&road-e.north>=38,`band at x=${x}: north ${(road-e.north).toFixed(0)} m, south ${(e.south-road).toFixed(0)} m`);}
{let sharpest=0;for(let x=CORRIDOR_X0+2;x<=CORRIDOR_X1-2;x++){const a=cay.corridorEdges(x-2),b=cay.corridorEdges(x),c=cay.corridorEdges(x+2);sharpest=Math.max(sharpest,Math.abs(a.south-2*b.south+c.south),Math.abs(a.north-2*b.north+c.north));}assert(sharpest<1.2,'corridor edges curve gently (no arches or V shapes): '+sharpest.toFixed(2));}
{const at=cay.causewayAt(cay.SANDBARS[0].spur.s),p={x:at.x,z:at.z},v={x:0,z:0};for(let i=0;i<60*40;i++)stepPlayer(p,v,{x:0,z:1,sprint:false},1/60,[],'jetpack');
 // Since the south-east sea (Sep 29 2026) the flight carries on past the old band edge to the fill's south edge.
 assert(!flightBlocked(p.x,p.z)&&flightBlocked(p.x,p.z+1.5)&&p.z>250&&Math.min(...cay.SOUTH_EAST_SEA.map(q=>Math.hypot(q.x-p.x,q.z-p.z)))<8,`flying south from the Starfish bend stops at the south-east sea's edge (z ${p.z.toFixed(0)})`);}
// The main island's margin is 50 m everywhere else (east coast at z 0 is x≈246, west coast at z 0 is x≈-99).
assert(!flightBlocked(292,0)&&!flightBlocked(-145,0)&&flightBlocked(-156,0),'50 m main margin on the other coasts');

// The maps' flight outline is traced from flightBlocked: re-trace and compare, then sample both sides of it.
{const {trace,render}=require('../scripts/generate-flight-outline.cjs'),t=trace(),stored=fs.readFileSync('lib/town/flightOutline.data.ts','utf8');
 assert.equal(stored,render(t),'lib/town/flightOutline.data.ts is stale: run node scripts/generate-flight-outline.cjs');
 assert.equal(t.loops,1,'one continuous outline (main island + corridor + sandbars + cay)');
 const pts=[...t.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map(m=>({x:+m[1],z:+m[2]}));
 const inside=(x,z)=>{let r=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)r=!r;}return r;};
 let checked=0,wrong=0;for(let x=FLIGHT_BOUNDS.minX;x<=FLIGHT_BOUNDS.maxX;x+=7)for(let z=FLIGHT_BOUNDS.minZ;z<=FLIGHT_BOUNDS.maxZ;z+=7){checked++;if(inside(x,z)===flightBlocked(x,z))wrong++;}
 assert(wrong/checked<.01,`outline agrees with flightBlocked at ${checked-wrong}/${checked} samples`);}

// Sharks (causeway only, user request): every patrol loop stays in open water, clear of the sand, the shallows and the
// sandbars; 6 along the causeway on both sides, all inside the flight zone (seen from the air, never over land).
{const {distanceToLand}=load('lib/town/landmass.ts');const loops=cay.SHARK_LOOPS;
 assert(loops.length===6&&loops.every(l=>l.region==='causeway'),'6 sharks, all along the causeway');
 assert(loops.every(l=>l.points.every(p=>cay.causewayFrame(p.x,p.z,true).dist<60)),'every shark stays beside the road');
 assert(new Set(loops.filter(l=>l.region==='causeway').map(l=>Math.sign(cay.causewayFrame(l.points[0].x,l.points[0].z,true).d))).size===2,'causeway sharks on both sides');
 for(const l of loops)for(let i=0;i<l.points.length;i++){const a=l.points[i],b=l.points[(i+1)%l.points.length];for(let t=0;t<=1;t+=.25){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;
  assert(!onLand(x,z)&&distanceToLand(x,z)>=8,`${l.id} stays in open water at ${x.toFixed(1)},${z.toFixed(1)}`);
  for(const s of cay.SANDBARS)assert(Math.hypot(x-s.x,z-s.z)>s.radius+12,`${l.id} keeps off ${s.id}'s shallows`);
  assert(!flightBlocked(x,z),`${l.id} swims inside the flight zone`);}}
 const beach=cay.SHARKS_BEACH;assert(cay.onCay(beach.x,beach.z)&&Math.hypot(beach.x-cay.BEACH_COURT.x,beach.z-cay.BEACH_COURT.z)<80,'Sharks Beach is the shore by the court');
 }

// Coral Cay Farm: the fence keeps its gates open — from the plaza's south path you can walk into the farm, through it to
// the beach gate and on to the sand, and the path itself stays clear. Farmers stand inside, off the fence.
{const fence=cay.FARM_FENCE_OBSTACLES,F=cay.FARM;
 assert(fence.every(o=>!(Math.abs(o.x-591)<o.w/2+1.8&&o.z-o.d/2<-90&&o.z+o.d/2>-144)),'the plaza south path stays clear of the fence');
 const S=.5,x0=580,z0=-136,W=Math.ceil(130/S),H=Math.ceil(70/S),seen=new Uint8Array(W*H),q=[];const idx=(x,z)=>Math.round((z-z0)/S)*W+Math.round((x-x0)/S);
 const open=(x,z)=>!blocked(x,z,fence,.32);const start=idx(591,-112);seen[start]=1;q.push(start);
 for(let h=0;h<q.length;h++){const c=q[h],cx=c%W,cz=(c-cx)/W;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,nz=cz+dz;if(nx<0||nz<0||nx>=W||nz>=H)continue;const n=nz*W+nx;if(seen[n])continue;const x=x0+nx*S,z=z0+nz*S;if(!open(x,z))continue;seen[n]=1;q.push(n);}}
 for(const [name,x,z] of [['farm track',620,-111.5],['orchard',668,-121],['pineapples',658,-106],['beach gate',630,-88],['south beach',630,-78],['east gate',692,-111.5]])assert(seen[idx(x,z)],`walkable from the path to the ${name}`);
 for(const npc of CORAL_CAY_NPCS.filter(n=>n.id.startsWith('farm-')))assert(!blocked(npc.x,npc.z,fence,.4)&&npc.z>-129&&npc.z<-89,npc.id+' works inside the farm');
 assert(CORAL_CAY_NPCS.filter(n=>n.id.startsWith('farm-')).length===3,'three farmers');}

// Hostel neighbourhood: hostel and homes on the lawn, paths on the cay, clear of the farm, the plaza path and the huts.
{const lawn=(x,z)=>{let r=false;const L=cay.CAY_LAWN;for(let i=0,j=L.length-1;i<L.length;j=i++){const a=L[i],b=L[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)r=!r;}return r;};
 const H=cay.HOSTEL;for(const [dx,dz] of [[-1,-1],[1,-1],[-1,1],[1,1]])assert(lawn(H.x+dx*H.w/2,H.z+dz*H.d/2),'hostel stands on the lawn');
 for(const h of cay.CAY_HOMES)for(const [dx,dz] of [[-2.8,-2.4],[2.8,-2.4],[-2.8,3.6],[2.8,3.6]])assert(lawn(h.x+dx,h.z+dz),`home at ${h.x},${h.z} stands on the lawn`);
 for(const [x,z,w,d] of cay.HOSTEL_PATHS){assert(cay.onCay(x-w/2,z)&&cay.onCay(x+w/2,z),'hostel paths are on the cay');assert(x+w/2<=592.5,'paths join the plaza path without crossing it');}
 for(const h of [...cay.CAY_HOMES,H])assert(!(h.x>cay.FARM.fence[0].x-2)&&cay.CAY_HUTS.slice(0,3).every(t=>Math.hypot(t.x-h.x,t.z-h.z)>9),'homes keep clear of the farm and the huts');
 for(const id of ['hostel-ari','home-koa','home-lina']){const n=CORAL_CAY_NPCS.find(n=>n.id===id);assert(n&&onLand(n.x,n.z)&&cay.inHostelArea(n.x,n.z),id+' lives in the neighbourhood');}}

// Stable helpers for other features (ball hunt): every landmark sits on walkable cay ground; causewayPoint spans the route.
for(const [name,p] of Object.entries(cay.CAY_LANDMARKS))if(name!=='deepSeaMooring')assert(cay.isOnCayLand(p.x,p.z),`landmark ${name} is on cay land`);
// The deep-sea mooring (the user's spot, just west of the south block) sits in open, flyable water, clear of the sharks.
{const m=cay.CAY_LANDMARKS.deepSeaMooring;assert(!onLand(m.x,m.z)&&!flightBlocked(m.x,m.z),'mooring is open, flyable water');
 assert(cay.SHARK_LOOPS.every(l=>l.points.every(p=>Math.hypot(p.x-m.x,p.z-m.z)>30)),'mooring is clear of the shark patrols');
 assert(!cay.isInSouthSeaBlock(420,-150)&&!cay.isInSouthSeaBlock(454,-97.5)&&!cay.isInSouthSeaBlock(420,-40),'south block excludes the road, sandbars and sea beyond the edge');}
// A registered landable deck (e.g. a moored boat) is walkable, landable and a floor; unregistering removes it.
{const decks=load('lib/town/landableDecks.ts'),m=cay.CAY_LANDMARKS.deepSeaMooring;
 assert(blocked(m.x,m.z,[],0),'open water before a deck exists');
 const off=decks.registerLandableDeck({id:'test-boat',x:m.x,z:m.z,w:10,d:4,yaw:.4,height:1.2});
 assert(!blocked(m.x,m.z,[],0)&&onLand(m.x,m.z),'the deck is walkable ground');
 const lander=createRooftopTravel([],[],{x:0,z:0}),safe=lander.findLanding(m.x+12,m.z+8);assert(safe&&Math.hypot(safe.x-m.x,safe.z-m.z)<6,'a nearby landing finds the deck: '+JSON.stringify(safe));
 assert(Math.abs(lander.surface(m.x,m.z)-1.2)<1e-9,'the deck is a floor at its height');
 off();assert(blocked(m.x,m.z,[],0)&&!decks.landableDecks().some(d=>d.id==='test-boat')&&!onLand(m.x,m.z),'unregistered: water again (other decks, e.g. the East Pier, may stay registered)');}
for(let t=0;t<=1;t+=.05){const p=cay.causewayPoint(t);assert(cay.isOnCayLand(p.x,p.z)||onIsland(p.x,p.z),`causewayPoint(${t.toFixed(2)}) is on the road`);assert(p.deckHalf===cay.CAUSEWAY.walkHalf&&Math.abs(Math.hypot(p.dirX,p.dirZ)-1)<1e-6);}
assert(cay.causewayPoint(0).x<cay.causewayPoint(.5).x&&Math.abs(cay.causewayPoint(1).x-cay.CAY_BOULEVARD.x1)<.01,'t runs from the junction to the cay');

// Landing over the corridor water finds the causeway, its beach or a sandbar — never the main island far away.
{const landing=createRooftopTravel([],[],{x:0,z:0});
 for(const [x,z] of [[320,-150],[400,-190],[430,-110],[342,-240],[480,-160],[728,110],[700,60],[420,-58]]){const safe=landing.findLanding(x,z);assert(safe&&landing.canLand(safe.x,safe.z)&&safe.x>250,`safe landing near ${x},${z}: ${JSON.stringify(safe)}`);}}

// Islanders stand on walkable ground and each teaches a beach-soccer topic.
for(const npc of CORAL_CAY_NPCS){assert(onLand(npc.x,npc.z)&&!onIsland(npc.x,npc.z),npc.id+' stands on the cay or a sandbar');assert(npc.topics.length>0&&npc.topics.every(t=>t.answer&&t.followUp.answer),npc.id+' has a conversation');}
assert(cay.SANDBARS.every(s=>CORAL_CAY_NPCS.some(n=>cay.onSandbarStop(n.x,n.z)&&Math.hypot(n.x-s.x,n.z-s.z)<s.radius)),'each sandbar stop has an islander');
// FIFA Beach Soccer Laws 2024-25, Law 1: pitch 35–37 × 26–28 m, goal 5.5 × 2.2 m.
const K=cay.BEACH_COURT;assert(K.length>=35&&K.length<=37&&K.width>=26&&K.width<=28&&K.goalWidth===5.5&&K.goalHeight===2.2&&K.penalty===9,'court dimensions follow the Laws');
// Sep 29 2026: the court sits on the east beach. The pitch (with its 1 m flag margin) stays well clear of the waterline,
// and its sand (COURT_BEACH) is one closed outline on the cay, 4 m+ from the sea, joined to the beach ring on the east.
for(const sx of [-1,1])for(const sz of [-1,1]){const x=K.x+sx*(K.length/2+1),z=K.z+sz*(K.width/2+1);assert(cay.onCay(x,z)&&cay.distanceToCayShore(x,z)>12,'pitch well clear of the waterline');}
assert(cay.COURT_BEACH.length>40&&cay.COURT_BEACH.every(p=>cay.onCay(p.x,p.z)&&cay.distanceToCayShore(p.x,p.z)>=3.9),'court sand stays on the cay');
for(const sx of [-1,1])for(const sz of [-1,1])assert(cay.onCourtBeach(K.x+sx*(K.length/2+1),K.z+sz*(K.width/2+10)),'court, benches, stands and boards stand on the court sand');
{const inLawn=(x,z)=>{let ins=false;const P=cay.CAY_LAWN;for(let a=0,b=P.length-1;a<P.length;b=a++)if((P[a].z>z)!==(P[b].z>z)&&x<(P[b].x-P[a].x)*(z-P[a].z)/(P[b].z-P[a].z)+P[a].x)ins=!ins;return ins;};
 const east=cay.COURT_BEACH.filter(p=>p.x>K.x+K.length/2);assert(east.length>5&&east.filter(p=>!inLawn(p.x,p.z)).length>=5,'court sand runs out onto the east beach ring (no sand box in a lawn)');}
console.log(`PASS Coral Cay: ${(ratio*100).toFixed(1)}% of the main island, irregular coast + sandbars; ${cay.CAUSEWAY.waterSpan.toFixed(0)} m winding causeway (${(cay.CAUSEWAY.waterSpan/165).toFixed(2)}x) with beach banks; walk/scooter/bike/moped + both sandbars; corridor flight, off-corridor blocked; traced outline matches the rule; broad smoothed corridor band; 6 causeway sharks in open water; ${CORAL_CAY_NPCS.length} teaching islanders`);
// Shark model: only the fin and the tail tip, both thin upright shapes (no wake streaks or boxes left on the water).
{const T=require('three');globalThis.__T=T;const {finGeometry}=load('lib/graphics/caySharks.ts');const g=finGeometry();g.computeBoundingBox();const b=g.boundingBox;
 assert(b.min.y>=-.001&&b.max.y<=.8&&b.max.z-b.min.z<=.1&&b.min.x>=-2.1&&b.max.x<=.56,'shark fin geometry is only the fin + tail: '+JSON.stringify(b));
 const colors=g.getAttribute('color').array;for(let i=0;i<colors.length;i+=3)assert(colors[i]<.5&&colors[i+1]<.5,'no pale wake/foam parts on the shark');
 console.log('PASS shark model: fin + tail only');}
// Farm decorative planting thins on warm heat tiers by instance count only (full at tier 0, half at 1–3, 30% at the lowest).
{const T=require('three'),heat=load('lib/graphics/heatTier.ts'),D=load('lib/graphics/farmDecor.ts');
 const plants=Array.from({length:40},(_,i)=>({parts:[{kind:'blob',x:i,y:0,z:0,sx:1,sy:1,sz:1,color:'#5b895e'},{kind:'stem',x:i,y:0,z:0,sx:.1,sy:1,sz:.1,color:'#8baa69'}]}));
 const scene=new T.Scene(),decor=D.createFarmDecor(scene,plants),blob=decor.meshes[0],before=blob.geometry.uuid;
 for(const [tier,shown] of [[0,40],[1,20],[3,20],[4,12],[0,40]]){heat.forceHeatTier(tier);assert.equal(decor.stats.shown,shown,`tier ${tier}: ${shown} of 40 plants`);assert.equal(blob.count,shown,'blob instances follow');assert.equal(blob.geometry.uuid,before,'no rebuild, count only');}
 heat.forceHeatTier(null);decor.dispose();console.log('PASS farm decor thinning: 40 → 20 → 12 plants by heat tier, instance count only');}
