// Island elevation system (lib/town/elevation.ts) and its first region, Coral Cay's raised interior (coralCayElevation.ts).
// Flag off: nothing changes. Flag on: the beach, the court, the roundabout, the Island Line and its station stay at sea level;
// terraces are level; slopes stay walkable; the boulevard's grade suits traffic; the walked height reads the same function.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function sandbox(){const loaded=new Map();return function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;};}

// ---- Flag off (the default): 0 everywhere, the walked height is unchanged, placed records are untouched.
{const load=sandbox(),E=load('lib/town/elevation.ts'),C=load('lib/town/coralCayElevation.ts'),V=load('lib/town/venues.ts'),B=load('lib/town/coralCayBalls.ts');
 assert.equal(E.ELEVATION_DEFAULT,false,'elevation ships OFF until the owner approves it (one line to flip)');
 assert.equal(E.elevationOn(),false);
 for(const [x,z] of [[591,-159],[556,-120],[630,-111],[612,-160]]){assert.equal(C.cayGround(x,z),0);assert.equal(E.groundLift(x,z),0);assert.equal(V.fieldSurfaceHeight(x,z),0);}
 assert.equal(B.CORAL_CAY_SPOTS.find(s=>s.id==='cay-rest').y,0);
 const o={x:591,z:-159,y:1};assert.equal(E.onGround(o),o,'onGround returns the same record where nothing is raised');}

// ---- Flag on.
const load=sandbox(),E=load('lib/town/elevation.ts');E.setElevation(true);
const C=load('lib/town/coralCayElevation.ts'),cay=load('lib/town/coralCay.ts'),V=load('lib/town/venues.ts'),TT=load('lib/town/trainTrack.ts'),B=load('lib/town/coralCayBalls.ts');
const g=C.cayGround,inside=(poly,x,z)=>E.insidePolygon(poly,x,z);
// The interior is 1.5–3.5 m up; the peak is modest (a cay, not a hill).
assert.ok(C.cayPeak()>2.4&&C.cayPeak()<3.6,'peak '+C.cayPeak());
assert.ok(g(cay.CAY_PLAZA.x,cay.CAY_PLAZA.z)>1.8,'the plaza stands on the raised interior');
// Sea level: the whole beach ring, the court and its sand, the roundabout, the Konbini, every track sample and the station.
for(const s of cay.CAY_SAND){assert.ok(g(s.outer.x,s.outer.z)<.03);const mx=(s.outer.x+s.inner.x)/2,mz=(s.outer.z+s.inner.z)/2;assert.ok(g(mx,mz)<.02,'beach at '+mx+','+mz+' '+g(mx,mz));}
const K=cay.BEACH_COURT;for(let x=K.x-K.length/2-3;x<=K.x+K.length/2+3;x+=3)for(let z=K.z-K.width/2-3;z<=K.z+K.width/2+3;z+=3)assert.ok(g(x,z)<.03,'court flat at '+x+','+z+': '+g(x,z));
for(let a=0;a<12;a++){const R=cay.ROUNDABOUT;assert.ok(g(R.x+Math.cos(a)*R.walkOuter,R.z+Math.sin(a)*R.walkOuter)<.03,'roundabout');}
assert.ok(g(cay.CAY_KONBINI_DOOR.x,cay.CAY_KONBINI_DOOR.z+1.5)<.03,'the Konbini doors stay at street level');
let trackOnCay=0;for(let i=0;i<TT.TRACK.n;i++){const x=TT.TRACK.x[i],z=TT.TRACK.z[i];if(!cay.onCay(x,z))continue;trackOnCay++;
 for(const d of [-4,-2,0,2,4]){const px=x+TT.TRACK.tz[i]*d,pz=z-TT.TRACK.tx[i]*d;assert.ok(g(px,pz)<.03,'the line keeps its height at '+px.toFixed(1)+','+pz.toFixed(1)+': '+g(px,pz));}}
assert.ok(trackOnCay>60,'track samples on the cay: '+trackOnCay);
const ST=TT.TRAIN_STATIONS.find(s=>s.id==='cay');if(ST){const p=TT.trackAt(ST.s);for(const d of [-6,-3,0,3,6])assert.ok(g(p.x+p.tz*d,p.z-p.tx*d)<.03,'station platform level');}
// Terraces: level under every pad.
C.CAY_PADS.forEach((p,i)=>{const h=g(p.x,p.z);for(const a of [-1,0,1])for(const b of [-1,0,1])assert.ok(Math.abs(g(p.x+a*(p.w/2-1),p.z+b*(p.d/2-1))-h)<.06,'pad '+i+' is level');});
// Slopes: walkable everywhere (well under Summit Isle's trails), no step between neighbouring samples.
let maxSlope=0,raised=0;const X=C.CAY_ELEVATION_BOX;for(let x=X.minX;x<=X.maxX;x+=1)for(let z=X.minZ;z<=X.maxZ;z+=1){const s=C.caySlope(x,z);if(s>maxSlope)maxSlope=s;const h=g(x,z);if(h>0){raised++;assert.ok(inside(cay.CAY_LAWN,x,z)||h<.05,'raised ground only on the lawn');}
 assert.ok(Math.abs(g(x+.5,z)-h)<.25&&Math.abs(g(x,z+.5)-h)<.25,'no step at '+x+','+z);}
assert.ok(maxSlope<.5,'steepest slope '+maxSlope.toFixed(3));assert.ok(raised>18000,'raised area m2 '+raised);
// The boulevard: level across the carriageway, at most a 9% grade along it.
for(let x=cay.WELCOME_ARCH.x;x<cay.CAY_PLAZA.x-cay.CAY_PLAZA.w/2;x+=2){const c=g(x,cay.CAY_BOULEVARD.z);for(const d of [-6,-3,3,6])assert.ok(Math.abs(g(x,cay.CAY_BOULEVARD.z+d)-c)<.04,'carriageway level across at x '+x);
 assert.ok(Math.abs(g(x+2,cay.CAY_BOULEVARD.z)-c)/2<.09,'grade at x '+x+': '+(Math.abs(g(x+2,cay.CAY_BOULEVARD.z)-c)/2).toFixed(3));}
// One function: the walked height, the placed records.
for(const [x,z] of [[591,-159],[556,-120],[630,-111],[570,-159]])assert.equal(V.fieldSurfaceHeight(x,z),g(x,z));
const rest=B.CORAL_CAY_SPOTS.find(s=>s.id==='cay-rest');assert.ok(Math.abs(rest.y-g(rest.x,rest.z))<1e-6&&rest.y>1,'the hostel ball stands on the raised ground');
assert.equal(B.CORAL_CAY_SPOTS.find(s=>s.parachute).y,90,'sky balls keep their height');
// The generic primitives: a pinned pad and a ribbon in a tiny region.
{const R=E.createRegion({id:'t',box:{minX:0,maxX:100,minZ:0,maxZ:100},depth:(x,z)=>Math.min(x,z,100-x,100-z),profile:d=>4*E.smooth(d/20),pads:[{x:50,z:50,w:20,d:10,level:1}],ribbons:[{path:[{x:0,z:80},{x:50,z:80}],half:4,blend:4}]});
 assert.equal(R.ground(50,50),1);assert.equal(R.ground(58,53),1);assert.ok(Math.abs(R.ground(20,80)-R.ground(20,83))<.02,'ribbon level across');assert.ok(R.ground(50,20)>3.9);assert.equal(R.ground(0,50),0);assert.equal(R.ground(-5,50),0);}
// ---- The west side (westElevation.ts): the line, the beaches, West station, the pond and the town pinned; the stadium terrace
// level at WEST.terrace; a retaining wall where the natural ground does not reach it; the plaza a gentle ramp; stairs through the wall.
{const Wt=load('lib/town/westElevation.ts'),L=load('lib/town/westParkLayout.ts'),S=load('lib/town/shoreline.ts'),w=Wt.westGround,nat=Wt.westNatural,H=Wt.WEST.terrace;
 assert.ok(E.elevationRegions().some(r=>r.id==='west'),'the west region is registered');assert.ok(H>=4&&H<=4.5,'terrace '+H);
 assert.equal(E.groundLift(L.STADIUM.x,L.STADIUM.z),H);assert.equal(Wt.STADIUM_BASE,H);
 assert.equal(V.fieldSurfaceHeight(L.STADIUM.x,L.STADIUM.z),H,'the pitch is walked at the terrace height');assert.ok(Math.abs(V.STADIUM_VENUE.elevation-(H+V.STADIUM_PITCH_Y-V.FIELD_SURFACE_Y))<1e-9,'the live match (rigs, goals) stands on the terrace');
 for(let i=0;i<TT.TRACK.n;i++){const x=TT.TRACK.x[i],z=TT.TRACK.z[i];for(const d of [-6,-3,0,3,6])assert.ok(w(x+TT.TRACK.tz[i]*d,z-TT.TRACK.tx[i]*d)<.03,'west: the line keeps its height at '+x.toFixed(0)+','+z.toFixed(0));}
 // The whole apron (bowl, ring walk) and the plaza's top are exactly level.
 const A=L.BOWL_APRON;for(let x=A.x-A.w/2;x<=A.x+A.w/2;x+=2.5)for(let z=A.z-A.d/2;z<=A.z+A.d/2;z+=2.5)if(L.onApron(x,z))assert.equal(w(x,z),H,'apron level at '+x+','+z);
 for(const z of [-50,-30,-10])for(let x=-140;x<=-127;x+=1)assert.ok(Math.abs(w(x,z)-H)<.02,'plaza top level at '+x+': '+w(x,z));
 // The pond: its water and stone rim at today's height, the terrace's wall clear of the rim.
 for(let a=0;a<6.28;a+=.1){const p=L.pondEdge(a,L.POND_RIM);assert.ok(w(p.x,p.z)<.03,'pond rim pinned at '+a.toFixed(1)+': '+w(p.x,p.z));assert.ok(!Wt.onWestTerrace(p.x,p.z),'the wall stands clear of the pond rim');}
 assert.equal(w(L.PARK_POND.x,L.PARK_POND.z),0);
 // The town, the beaches: untouched.
 assert.ok(w(-52,-30)===0&&w(-71,-30)<.02&&w(-90,-30)>.9&&w(-90,-30)<2&&w(-110,-30)>2.6,'the plaza walks up from the town, west of its last row of buildings');
 for(let x=-330;x<=-40;x+=3)for(let z=-215;z<=140;z+=3)if(!E.insidePolygon(S.INTERIOR_GRASS,x,z)||x>=-72)assert.ok(w(x,z)<.03,'only the lawn is raised: '+x+','+z);
 // The plaza: level across, at most a 9.5% grade along it.
 for(let x=-140;x<=-52;x+=2){const c=w(x,-30);for(const d of [-22,-10,10,22])assert.ok(Math.abs(w(x,-30+d)-c)<.03,'plaza level across at x '+x);assert.ok(Math.abs(w(x+2,-30)-c)/2<.095,'plaza grade at x '+x);}
 // Natural ground: smooth and walkable everywhere outside the terrace (the terrace's own edge is the wall).
 let steep=0,area=0,wallMax=0;for(let x=-316;x<=-58;x+=2)for(let z=-206;z<=130;z+=2){const h=nat(x,z);if(w(x,z)>.5)area+=4;const s=Math.hypot(nat(x+1,z)-nat(x-1,z),nat(x,z+1)-nat(x,z-1))/2;if(s>steep)steep=s;
  assert.ok(h<=H+1e-6&&Math.abs(nat(x+1,z)-h)<.4&&Math.abs(nat(x,z+1)-h)<.4,'west: no step in the natural ground at '+x+','+z);}
 assert.ok(steep<.36,'west steepest '+steep.toFixed(3));
 // The wall: tallest by the pond and over West station; none on the north, the east or at the trails' mouths (N, SW, the plaza).
 const o=Wt.terraceOutline(1);for(const p of o){const d=Math.hypot(p.x-Wt.WEST_TERRACE.x,p.z-Wt.WEST_TERRACE.z),f=nat(p.x+(p.x-Wt.WEST_TERRACE.x)/d*.3,p.z+(p.z-Wt.WEST_TERRACE.z)/d*.3);wallMax=Math.max(wallMax,H-f);}
 assert.ok(wallMax>3.5,'the wall stands '+wallMax.toFixed(2)+' m at its tallest');
 for(const [x,z] of [[-205,-128],[-127.5,-30],[-205,64.5],[-127.5,-80]])assert.ok(H-nat(x,z)<.05,'no wall at '+x+','+z+': '+(H-nat(x,z)));
 assert.ok(H-nat(-289.5,-60)>2.5,'a wall over West station');
 // Stairs: a steady ramp from the terrace's edge to the ground, no step at either end.
 for(const s of Wt.WEST_STAIRS){let prev=H,met=false;for(let d=.25;d<=s.len+1;d+=.25){const h=w(s.x+s.dx*d,s.z+s.dz*d);assert.ok(prev-h<s.slope*.25+.03&&h<=prev+1e-6,'stair '+s.id+' steps evenly at '+d+': '+prev+' → '+h);if(h<=nat(s.x+s.dx*d,s.z+s.dz*d)+1e-6)met=true;prev=h;}assert.ok(met,'stair '+s.id+' reaches the ground');}
 console.log('west: terrace '+H+' m, wall up to '+wallMax.toFixed(2)+' m, steepest bank '+steep.toFixed(3)+', raised '+area+' m2');}
console.log('elevation ok: peak '+C.cayPeak().toFixed(2)+' m, steepest '+maxSlope.toFixed(3)+', raised '+raised+' m2, track samples '+trackOnCay);
