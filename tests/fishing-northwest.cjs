// North-west coast fishing (Nov 13 2026, owner): three spots round the DRIP FC Stadium (lib/town/fishing/fishSpots.ts north-point,
// stadium-rocks, sunset-shoals), two north of the bowl and one south, each on walkable shore sand casting into the sea, clear of the
// trails' beach ends, palms, orchards, pond and park props; their own spot-only species (northWestFish.ts) with sourced split facts,
// one legend each, and a shore-level mean catch.
// usage: node tests/fishing-northwest.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..');
let n=0;const ok=(c,m)=>{assert(c,m);n++;};
(async()=>{
const {L,world}=await loadIslandWorld(ROOT);
const cat=L('lib/town/fishing/fishCatalog.ts'),core=L('lib/town/fishing/fishingCore.ts'),sh=L('lib/town/shoreline.ts'),W=L('lib/town/westParkLayout.ts');
const NW=L('lib/town/fishing/northWestFish.ts').NORTH_WEST_FISH,LG=L('lib/town/fishing/legendary.ts'),K=L('lib/town/fishing/fishingKiosk.ts');
const CH=L('lib/town/fishing/fishChapters.ts'),UW=L('lib/town/fishing/underwater.ts'),M=L('lib/town/fishing/fishModels.ts'),H=L('lib/town/fishing/fishingHooks.ts');
const IDS=['north-point','stadium-rocks','sunset-shoals'],spots=IDS.map(id=>cat.spotById(id));
const {STADIUM}=W,north=STADIUM.z-STADIUM.bowlL/2,south=STADIUM.z+STADIUM.bowlL/2;

// 1. Placement: on the main island's shore sand, casting square out into the sea.
ok(spots.every(Boolean)&&cat.FISH_SPOTS.slice(-3).map(s=>s.id).join()===IDS.join(),'the three spots, appended after the pond');
for(const s of spots){
 ok(!s.pond&&!s.area&&!s.deep&&!s.boat,`${s.id}: a main-island sea shore post`);
 ok(sh.onIsland(s.x,s.z)&&!W.onGrass(s.x,s.z),`${s.id}: stands on the island's sand`);
 const d=sh.distanceToShore(s.x,s.z);ok(d>=2&&d<=8,`${s.id}: a few steps up from the waterline (${d.toFixed(1)} m)`);
 ok(core.inOpenWater(s.buoy.x,s.buoy.z)&&!core.inPondWater(s.buoy.x,s.buoy.z)&&!sh.onIsland(s.buoy.x,s.buoy.z),`${s.id}: the float sits in the open sea`);
 const c=core.castPoint(s,s);ok(core.inOpenWater(c.x,c.z)&&!sh.onIsland(c.x,c.z)&&Math.hypot(c.x-s.buoy.x,c.z-s.buoy.z)<3&&c.distance>=14,`${s.id}: the cast lands at sea by the float (${c.distance.toFixed(1)} m)`);
 for(let k=1;k<Math.hypot(s.buoy.x-s.x,s.buoy.z-s.z);k+=1){const t=k/Math.hypot(s.buoy.x-s.x,s.buoy.z-s.z),x=s.x+(s.buoy.x-s.x)*t,z=s.z+(s.buoy.z-s.z)*t;
  if(!sh.onIsland(x,z)){for(let j=k;j<Math.hypot(s.buoy.x-s.x,s.buoy.z-s.z);j+=1){const u=j/Math.hypot(s.buoy.x-s.x,s.buoy.z-s.z);ok(!sh.onIsland(s.x+(s.buoy.x-s.x)*u,s.z+(s.buoy.z-s.z)*u),`${s.id}: the cast line never crosses land again`);}break;}}
 // A clear approach: the 6 m walk in from inland is island ground, off the stadium, the plaza and the pond.
 const dx=s.buoy.x-s.x,dz=s.buoy.z-s.z,l=Math.hypot(dx,dz);
 for(let a=0;a<=6;a+=.5){const x=s.x-dx/l*a,z=s.z-dz/l*a;ok(sh.onIsland(x,z)&&!W.inStadiumFootprint(x,z,4)&&!W.inPond(x,z,W.POND_RIM+2),`${s.id}: walkable approach`);}
 for(const o of cat.FISH_SPOTS)if(o!==s)ok(Math.hypot(o.x-s.x,o.z-s.z)>60,`${s.id}: 60+ m from ${o.id}`);
 // Clear of the trails' beach ends, the orchards, the pond, the plaza and its flags, the park signs.
 for(const t of W.PARK_TRAILS){const e=t.to==='beach'?t.curve[3]:null;if(e)ok(Math.hypot(e[0]-s.x,e[1]-s.z)>25,`${s.id}: clear of the ${t.id} trail's beach end`);
  ok(W.segDistance(s.x,s.z,W.pathPoints(t.curve))>W.TRAIL_WIDTH/2+6,`${s.id}: off the ${t.id} trail`);}
 for(const o of L('lib/town/stadiumOrchard.ts').stadiumOrchardTrees())ok(Math.hypot(o.x-s.x,o.z-s.z)>20,`${s.id}: clear of the orchards`);
 ok(!W.inPond(s.x,s.z,30)&&s.x<W.STADIUM_PLAZA.minX-50,`${s.id}: far from the pond and the plaza flags`);
 for(const [x,z] of W.PARK_SIGNS)ok(Math.hypot(x-s.x,z-s.z)>30,`${s.id}: clear of the park signs`);
 // Palms, lamps, benches, signs and flags (the world's real props): none crowd the angler or the stall.
 const k=K.kioskAt(s);
 for(const p of world.propSpecs){const x=(p.min.x+p.max.x)/2,z=(p.min.z+p.max.z)/2,need=p.kind==='palm'?6:p.kind==='tree'?5:8;
  ok(Math.hypot(x-s.x,z-s.z)>need&&Math.hypot(x-k.x,z-k.z)>need-1,`${s.id}: a ${p.kind} at ${x.toFixed(0)},${z.toFixed(0)} is too close`);}
}
ok(spots[0].z<north&&spots[1].z<north&&spots[2].z>south,'two north of the stadium, one south of it');
ok(spots.every(s=>s.x<-200),'all three on the west side of the island');
ok(new Set(IDS.map(K.stallType)).size===3&&IDS.every(id=>K.STALL_BY_SPOT[id]),'each has its own stall type');
ok(IDS.every(id=>UW.REEF_THEMES[cat.spotById(id).reef])&&new Set(spots.map(s=>UW.REEF_THEMES[s.reef].layout)).size===3,'a rocky, a kelp and a sandy reef theme');
ok(H.VISITOR_AREAS.find(a=>a.id==='main').spots.every(Boolean)&&IDS.every(id=>H.VISITOR_AREAS.find(a=>a.id==='main').spots.includes(id)),'main-island visitors can swim here');
ok(H.setById('area-northwest')&&H.setById('area-northwest').species.length===NW.length,'the Stadium coast set holds every new special');

// 2. Species: real, new, spot-only; the harder ones (uncommon, rare, legendary) only at their own spot.
const others=cat.FISH_SPOTS.filter(s=>!IDS.includes(s.id));
ok(NW.length>=12&&NW.length<=18&&NW.every(f=>cat.FISH.includes(f)),`${NW.length} new Fishbook species`);
ok(new Set(cat.FISH.map(f=>f.name.toLowerCase())).size===cat.FISH.length,'no duplicate names in the catalogue');
for(const id of IDS){const own=NW.filter(f=>f.spots[0]===id);ok(own.length>=4&&own.length<=6,`${id}: 4-6 species of its own (${own.length})`);
 ok(['common','uncommon','rare'].every(r=>own.some(f=>f.rarity===r)),`${id}: commons to rares`);}
for(const f of NW){ok(f.spots.length===1&&IDS.includes(f.spots[0])&&cat.isExclusive(f),`${f.id}: spot-only`);
 ok(others.every(s=>!(f.id in s.weights))&&f.id in cat.spotById(f.spots[0]).weights,`${f.id}: catchable only at ${f.spots[0]}`);
 ok(M.MODELLED_SPECIES.includes(f.id),`${f.id}: its own 3D model`);}

// 3. One legend per new spot: released, never sold, with a chapter and a sourced football fact.
for(const id of IDS){const leg=LG.legendsAt(id);ok(leg.length===1&&leg[0].price===0&&!cat.FISH.includes(leg[0])&&CH.LEGEND_CHAPTERS[leg[0].id],`${id}: one Island Legend`);
 ok(/^https:\/\//.test(leg[0].club.source)&&leg[0].club.fact.includes(leg[0].club.entity.name),`${id}: the legend's football fact names its player`);}

// 4. Facts: the split "Fun fish fact … Football: …" form, naming the entity, kid-safe, every source listed in the docs.
const doc=fs.readFileSync(path.join(ROOT,'docs/fishing-content-sources.md'),'utf8');
const SCARY=/\b(kill\w*|dead|death|die[sd]?|blood\w*|attack\w*|scary|danger\w*|monsters?)\b/i;
for(const f of [...NW,...IDS.map(id=>LG.legendsAt(id)[0])]){const c=f.club,urls=[c.source,...(c.sources??[])];
 if(NW.includes(f))ok(c.link==='Fun fish fact'&&/^Fun fish fact: .+ Football: .+/.test(c.fact)&&f.story&&f.story.length>=60,`${f.id}: a split fish + football fact and a story`);
 ok(c.entity&&c.fact.includes(c.entity.name)&&c.fact.length<=230&&!SCARY.test(c.fact)&&!SCARY.test(f.story??''),`${f.id}: names ${c.entity?.name}, kid-safe`);
 ok(urls.every(u=>/^https:\/\//.test(u)&&doc.includes(u))&&doc.includes('`'+f.id+'`'),`${f.id}: every source in docs/fishing-content-sources.md`);}

// 5. Economy: each new spot's mean catch is the shore's (≈ 4 coins), like the causeway and the pond.
const ev=s=>{const w=Object.entries(s.weights),t=w.reduce((a,[,x])=>a+x,0);return w.reduce((a,[id,x])=>a+x/t*cat.fishById(id).price,0);};
const evs=spots.map(ev);for(let i=0;i<3;i++)ok(evs[i]>3.7&&evs[i]<4.3,`${IDS[i]}: mean catch ${evs[i].toFixed(2)} ≈ the shore's 4.0`);
const mean=evs.reduce((a,b)=>a+b,0)/3;ok(mean>3.8&&mean<4.2,`the three average ${mean.toFixed(2)}`);
console.log(`PASS fishing north-west: 3 spots (${spots.map(s=>s.name).join(', ')}), ${NW.length} spot-only species, 3 legends, mean catch ${evs.map(x=>x.toFixed(2)).join(' / ')} (${n} checks)`);
})().catch(e=>{console.error(e);process.exit(1);});
