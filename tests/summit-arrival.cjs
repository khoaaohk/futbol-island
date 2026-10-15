// Arriving fast at Summit Isle's slopes (Oct 14 2026, user: "when zooming fast to the mountain, it collides for a second, it should
// move smoothly up the mountain"). The rides already climbed once on the slope (summit-rides.cjs starts there, at a moderate speed);
// this drives in from the beach at full speed, the way a player does:
//  - from the beach all round the island (every 10°, mid-beach) and from the sandbar landing, straight up the slope and 30° either
//    side, at full speed (the walk's sprint too), the stick read at 20/30/60 fps on Town's 60 Hz ticks, for 5 s;
//  - on open ground (no collider within reach) the speed never falls by more than a third in 0.2 s: a ride's momentum carries it
//    up and eases down to its climbing speed (it used to brake at its acceleration rate, a hard stop at the foot);
//  - brushing a tree, a palm or a rock (one round collider; the huts are buildings), a ride keeps at least 40% of its speed through the contact, even dead-on (it used to
//    grind round it, each blocked sub-step cutting the speed, down to walking pace for most of a second);
//  - nothing holds a rider still (under 80% of the crawl for over 0.5 s) except a real dead end: a cave's mouth, a hut, a corner
//    two colliders make (the stick held into it) or the sea;
//  - a walker walking dead into a trunk still stops (can't walk through trees), and off-centre slides round it.
// usage: node tests/summit-arrival.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Float32Array,Float64Array,Uint8Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const S=load('lib/town/summitIsle.ts'),RS=load('lib/town/rideSlope.ts'),{createRooftopTravel}=load('lib/town/rooftopTravel.ts'),SB=load('lib/town/summitBalls.ts');
const {insideObstacle,groundBlocked,stepPlayer}=load('lib/town/simulation.ts'),{TRAVEL_MODES}=load('lib/town/travelModes.ts');
const T=require('three');
// The island's colliders, as summit-rides.cjs builds them (terrain props, activity props with the Ball Cannon, the easel).
const obstacles=[],town=new T.Group();{const mk=g=>{const m=new T.Mesh(g,new T.MeshStandardMaterial());town.add(m);return m;};
 const box=(w,h,d,c,x,y,z)=>{const m=mk(new T.BoxGeometry(w,h,d));m.position.set(x,y,z);return m;},cylinder=(r,h,c,x,y,z)=>{const m=mk(new T.CylinderGeometry(r,r,h,8));m.position.set(x,y,z);return m;},
  put=(g,c,x,y,z)=>{const m=mk(g);m.position.set(x,y,z);return m;},sign=(t,w,h,x,y,z)=>{const m=mk(new T.PlaneGeometry(w,h));m.position.set(x,y,z);return m;};
 load('lib/town/summitIsleWorld.ts').buildSummitIsle({box,cylinder,sign,town,obstacles,assets:[],surfaceAreas:[]});
 load('lib/town/summitActivitiesWorld.ts').buildSummitActivityProps({box,cylinder,put,sign,obstacles});
 load('lib/town/paintEaselWorld.ts').buildPaintEasel({box,cylinder,put,obstacles});}
const PK=S.SUMMIT_PEAK,L=S.SUMMIT_LANDMARKS,TICK=1/60,SECS=5;
const radiusOf=mode=>mode==='walk'?.32:.8;
// The colliders within reach of (x, z), through a 4 m bucket grid (the checks below ask for every tick of every run).
const CELL=4,grid=new Map();for(const o of obstacles){const r=Math.max(o.w,o.d)/2+1.2;for(let i=Math.floor((o.x-r)/CELL);i<=Math.floor((o.x+r)/CELL);i++)for(let j=Math.floor((o.z-r)/CELL);j<=Math.floor((o.z+r)/CELL);j++){const k=i+','+j;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(o);}}
const touching=(x,z,mode,pad=.3)=>(grid.get(Math.floor(x/CELL)+','+Math.floor(z/CELL))??[]).filter(o=>insideObstacle(x,z,o,radiusOf(mode)+pad));
// A real dead end: inside a cave's reach, against a hut, in a corner two colliders make (the stick held into it: the ball crate
// beside the cannon's deck), or with the sea a step away.
const deadEnd=(x,z,mode)=>touching(x,z,mode,.05).length>=2||SB.SUMMIT_CAVES.some(c=>Math.hypot(c.x-x,c.z-z)<7)||SB.SUMMIT_HUTS.some(h=>Math.hypot(h.x-x,h.z-z)<SB.SUMMIT_HUT_RADIUS+2.5)||
 [0,1,2,3,4,5,6,7].some(k=>groundBlocked(x+Math.cos(k*Math.PI/4)*1.3,z+Math.sin(k*Math.PI/4)*1.3,[],.32));
function arrive(mode,sprint,x,z,dx,dz,fps){
 const p={x,z},M=TRAVEL_MODES[mode],top=mode==='walk'?(sprint?6:M.maxSpeed):M.maxSpeed,v={x:dx*top,z:dz*top},roof=createRooftopTravel([],obstacles,p);roof.reset(p.x,p.z);
 const stick={x:dx,z:dz,sprint},out=[];let acc=0;
 for(let f=0;f<fps*SECS;f++){acc+=1/fps;while(acc>=TICK-1e-9){acc-=TICK;roof.update(TICK,p,v,stick,mode);out.push({x:p.x,z:p.z,sp:Math.hypot(v.x,v.z)});}if(!S.onSummitLand(p.x,p.z))break;}
 return out;
}
const stats={runs:0,terrainWorst:1,brushWorst:1,brushes:0,holds:0,deadEnds:0},seen=new Set();
const starts=[];for(let deg=0;deg<360;deg+=10){const b=S.beachPoint(deg*Math.PI/180,.5);starts.push({tag:deg+'°',x:b.x,z:b.z});}
starts.push({tag:'sandbar landing',x:L.sandbarLanding.x,z:L.sandbarLanding.z});
for(const [mode,sprint] of [['moped',false],['bike',false],['scooter',false],['walk',true],['walk',false]])for(const fps of [20,30,60])for(const s of starts){
 if(groundBlocked(s.x,s.z,obstacles,radiusOf(mode)+.1))continue;
 const ux=PK.x-s.x,uz=PK.z-s.z,ul=Math.hypot(ux,uz);
 for(const off of [0,-.52,.52]){const c=Math.cos(off),sn=Math.sin(off),dx=(ux*c-uz*sn)/ul,dz=(ux*sn+uz*c)/ul,tr=arrive(mode,sprint,s.x,s.z,dx,dz,fps),tag=`${mode}${sprint?' sprinting':''} @${fps} fps from ${s.tag} (${off?(off>0?'+':'-')+'30°':'straight up'})`;stats.runs++;
  const W=12,crawl=mode==='walk'?1:RS.RIDE_CRAWL[mode]*.8;for(const t of tr)t.touch=touching(t.x,t.z,mode);
  for(let i=0;i+W<tr.length;i++){const a=tr[i],b=tr[i+W];if(a.sp<1)continue;
   // Open ground over the whole window: the momentum carries (no sudden stop at the foot of the slope).
   let clear=true,hit=new Set();for(let k=i;k<=i+W;k++){const t=tr[k].touch;if(t.length)clear=false;for(const o of t)hit.add(o);}
   if(clear){const r=b.sp/a.sp;stats.terrainWorst=Math.min(stats.terrainWorst,r);assert(r>=2/3,`${tag}: on open ground the speed eases (${a.sp.toFixed(1)} → ${b.sp.toFixed(1)} m/s in 0.2 s at ${a.x.toFixed(1)}, ${a.z.toFixed(1)})`);}
   // A ride brushing one round collider (a trunk, a palm, a rock) keeps at least half its speed through the contact.
   else if(mode!=='walk'&&a.sp>4&&!a.touch.length){const end=Math.min(tr.length-1,i+W*1.5);for(let k=i+W+1;k<=end;k++)for(const o of tr[k].touch)hit.add(o);
    const o=[...hit][0];if(hit.size!==1||!o.cornerRadius||SB.SUMMIT_HUTS.some(h=>Math.hypot(h.x-o.x,h.z-o.z)<1))continue;let low=Infinity;for(let k=i;k<=end;k++)low=Math.min(low,tr[k].sp);
    const key=mode+fps+s.tag+off+o.x;if(!seen.has(key)){seen.add(key);stats.brushes++;}
    stats.brushWorst=Math.min(stats.brushWorst,low/a.sp);assert(low>=.4*a.sp,`${tag}: brushing the round collider at (${o.x.toFixed(1)}, ${o.z.toFixed(1)}) keeps 40% of its speed (${a.sp.toFixed(1)} → ${low.toFixed(1)} m/s)`);}}
  // Never held still, except in a real dead end.
  let slow=0;for(const t of tr){if(t.sp<crawl)slow+=TICK;else slow=0;if(slow>.5){if(deadEnd(t.x,t.z,mode)){stats.deadEnds++;break;}stats.holds++;assert.fail(`${tag}: held still at ${t.x.toFixed(1)}, ${t.z.toFixed(1)} (${touching(t.x,t.z,mode).map(o=>`collider ${o.x.toFixed(1)},${o.z.toFixed(1)} ${o.w.toFixed(1)} m`).join(', ')||'no collider'})`);}}}
}
// A walker walking dead into a trunk still stops; one aiming 20° off its centre slides round it at a fair pace.
{const tree=obstacles.find(o=>o.cornerRadius&&o.cornerRadius<.6&&S.summitSlope(o.x,o.z)<.15&&S.onSummitIsle(o.x-6,o.z)&&!obstacles.some(q=>q!==o&&Math.hypot(q.x-o.x,q.z-o.z)<4));assert(tree,'a lone trunk on gentle ground');
 const go=(ax,az,secs)=>{const p={x:tree.x-6,z:tree.z},v={x:0,z:0};for(let i=0;i<secs*60;i++)stepPlayer(p,v,{x:ax,z:az,sprint:false},1/60,obstacles);return p;};
 assert(go(1,0,4).x<tree.x-tree.w/2,'a walker walking dead into a trunk stops at it');
 const p=go(Math.cos(.35),Math.sin(.35),4);assert(p.x>tree.x+1,`a walker 20° off-centre slides round it (${(p.x-tree.x).toFixed(1)} m past)`);}
// The slide never lets anyone into a collider.
{let inside=0;for(const mode of ['walk','bike','moped'])for(let k=0;k<40;k++){const o=obstacles[(k*37)%obstacles.length];if(!S.onSummitIsle(o.x,o.z))continue;
  for(const a of [0,1.3,2.6,3.9,5.2]){const p={x:o.x-Math.cos(a)*(o.w/2+3),z:o.z-Math.sin(a)*(o.w/2+3)},v={x:0,z:0};if(groundBlocked(p.x,p.z,obstacles,radiusOf(mode)))continue;
   for(let i=0;i<180;i++){stepPlayer(p,v,{x:Math.cos(a),z:Math.sin(a),sprint:true},1/60,obstacles,mode);if(obstacles.some(q=>insideObstacle(p.x,p.z,q,radiusOf(mode)-.02)))inside++;}}}
 assert.equal(inside,0,'never inside a collider');}
console.log(`PASS summit arrival: ${stats.runs} full-speed arrivals (5 modes × ${starts.length} starts × 3 headings × 20/30/60 fps): open ground ≥ ${(stats.terrainWorst*100).toFixed(0)}% of the speed 0.2 s before; ${stats.brushes} brushes past a round collider keep ≥ ${(stats.brushWorst*100).toFixed(0)}%; no holds (${stats.deadEnds} stops in a cave mouth, a corner, at a hut or the sea); walkers stop dead-on at a trunk and slide round it off-centre; never inside a collider`);
