// Town kerb depth (lib/town/townDepth.ts, ?depth=1, default OFF). Flag off: nothing changes. Flag on: the carriageway sinks 15 cm
// behind a bevelled kerb, cambers to the crown, drops its kerb at every zebra, and returns to today's height at the Island Line and
// at a dead end; the walked height (venues.ts fieldSurfaceHeight) and groundLift read the same function; pitches keep their slab.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
function sandbox(){const loaded=new Map();return function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;};}
// The main island's streets as world.ts builds them (Nov 26 2026: x, z, w, d, vertical) and their junctions.
const ROADS=[[-16,-47,12,224,1],[48,-47,12,224,1],[21.5,65,133,12,0],[16,-118,64,12,0],[-45,-47,12,224,1],[1.5,-37.5,93,12,0],[124,-85.5,12,147,1],[196,-110,12,98,1],[75.5,-159,241,12,0],[160,-61,72,12,0],[88,76.5,12,177,1],[182,99.5,12,131,1],[135,34,94,12,0],[135,165,94,12,0],[86,-80,76,12,0],[86,-12,76,12,0]].map(([x,z,w,d,v])=>({x,z,w,d,vertical:!!v,carriageway:8}));
const JUNCTIONS=[[-16,65],[-16,-118],[-16,-37.5],[-16,-159],[48,65],[48,-118],[48,-37.5],[48,-159],[48,-80],[48,-12],[-45,65],[-45,-37.5],[-45,-159],[124,-159],[124,-61],[124,-80],[124,-12],[196,-159],[196,-61],[88,65],[88,34],[88,165],[88,-12],[182,34],[182,165]].map(([x,z])=>({x,z}));
const crossings=[];for(const j of JUNCTIONS)for(const vertical of [true,false])for(const side of [-1,1]){const x=j.x+(vertical?0:side*6),z=j.z+(vertical?side*6:0);
 if(ROADS.some(r=>r.vertical===vertical&&Math.abs((vertical?r.x:r.z)-(vertical?x:z))<.001&&(vertical?z:x)>(vertical?r.z-r.d/2:r.x-r.w/2)+1&&(vertical?z:x)<(vertical?r.z+r.d/2:r.x+r.w/2)-1))crossings.push({x,z,vertical});}
const INPUT={roads:ROADS,junctions:JUNCTIONS,crossings,hard:[{kind:'path',x:110,z:-60,w:3,d:16}]};

// ---- Shipping (Nov 26 2026: the owner approved the layer): on by default, `?depth=0` still switches it off.
require('./layer-flags-helper.cjs').assertShipsOn(assert,{file:'lib/town/townDepth.ts',constant:'DEPTH_DEFAULT',isOn:'townDepthOn',key:'depth',name:'kerb depth'});
// ---- Flag off (`?elev=0&depth=0&surf=0`: the flat town).
{const load=require('./layer-flags-helper.cjs').loaderWithQuery('?elev=0&depth=0&surf=0'),D=load('lib/town/townDepth.ts'),E=load('lib/town/elevation.ts'),V=load('lib/town/venues.ts');
 assert.equal(D.townDepthOn(),false);
 D.setDepthStreets(INPUT);assert.equal(D.depthStreets(),null,'nothing is registered with the flag off');
 for(const [x,z] of [[124,-100],[120.1,-100],[86,-80],[130,-74]]){assert.equal(D.depthLift(x,z),0);assert.equal(D.lawnRise(x,z),0);assert.equal(E.groundLift(x,z),0);assert.equal(V.fieldSurfaceHeight(x,z),0);}
 assert.equal(D.depthLawn(null),null);assert.equal(D.pavementCell(118,120,-100,-90),null);}

// ---- Flag on.
const load=sandbox(),D=load('lib/town/townDepth.ts');D.setTownDepth(true);
const E=load('lib/town/elevation.ts'),V=load('lib/town/venues.ts'),TT=load('lib/town/trainTrack.ts');
D.setDepthStreets(INPUT);const K=D.KERB,lift=D.depthLift,near=(a,b,e=1e-6)=>Math.abs(a-b)<=e;
// A straight stretch of the Nursery street (x = 124, carriageway x 120..128): pavement, bevel, gutter, camber, crown.
assert.equal(lift(118.5,-110),0,'the pavement keeps today\'s height');assert.equal(lift(119.99,-110),0);
assert.ok(near(lift(120+K.bevel,-110),-K.gutter),'the gutter is 15 cm down at the bevel\'s foot: '+lift(120+K.bevel,-110));
assert.ok(near(lift(124,-110),-K.crown),'the crown: '+lift(124,-110));
assert.ok(near(lift(120+K.bevel/2,-110),-K.gutter/2,1e-3),'the kerb is a plane bevel (a shoulder, not a wall)');
for(let x=120.3;x<124;x+=.1)assert.ok(lift(x+.1,-110)>=lift(x,-110)-1e-9,'camber rises to the crown');
assert.ok(near(lift(127.9,-110),lift(120.1,-110),1e-6),'both kerbs alike');
// No cliff anywhere across streets and junctions: at most the bevel's own grade.
{let worst=0;for(const z of [-110,-80,-76,-85.5,-61,-12])for(let x=100;x<150;x+=.02){const s=Math.abs(lift(x+.02,z)-lift(x,z))/.02;if(s>worst)worst=s;}
 assert.ok(worst<=K.gutter/K.bevel+.02,'steepest grade is the kerb bevel ('+(K.gutter/K.bevel).toFixed(2)+'): '+worst.toFixed(3));}
// The Nursery crossing (junction 124, -80): the zebra on its north arm is at z = -86; people step off at x = 120 and 128.
assert.ok(crossings.some(k=>k.x===124&&k.z===-86&&k.vertical));
assert.ok(near(lift(119.99,-86),-(K.gutter-K.up),2e-3),'dropped kerb: the pavement is down to a 2 cm upstand at the zebra: '+lift(119.99,-86));
assert.ok(lift(119.2,-86)<-.02&&lift(119.2,-86)>-(K.gutter-K.up),'the ramp');assert.equal(lift(120-K.ramp-.01,-86),0,'the ramp ends 1.5 m back');
assert.equal(lift(119.9,-86-K.dropHalf-K.dropTaper-.05),0,'full kerb again beside the drop');
assert.ok(near(lift(124,-86),-K.crown),'the zebra itself rides the crown');
// The junction box is all carriageway.
assert.ok(lift(124,-80)<=-K.crown+1e-6&&lift(121,-77)<-K.crown+.001);
// Walked height and groundLift read it.
for(const [x,z] of [[124,-110],[120.1,-110],[119.5,-86],[86,-80],[60,-80.5]]){assert.equal(E.groundLift(x,z),lift(x,z));assert.equal(V.fieldSurfaceHeight(x,z),lift(x,z)||0);}
assert.equal(E.regionLift(124,-110),0,'build-time placement (regions) does not see the kerb depth');
// Pitches keep their slab; the garage roof keeps its height.
for(const v of V.VENUES)assert.equal(V.fieldSurfaceHeight(v.x,v.z),(v.elevation??0)+V.FIELD_SURFACE_Y);
// Island Line: nothing changes within 6 m of the rails; the street eases back over the next metres.
{let n=0,crossed=0;const S=D.depthStreets();for(let i=0;i<TT.TRACK.n;i++){const x=TT.TRACK.x[i],z=TT.TRACK.z[i];for(const o of [-6,-3,0,3,6]){const px=x+TT.TRACK.tz[i]*o,pz=z-TT.TRACK.tx[i]*o;n++;if(S.asphalt.inside(px,pz))crossed++;
   assert.ok(Math.abs(lift(px,pz))<1e-6,'the line keeps its height at '+px.toFixed(1)+','+pz.toFixed(1)+': '+lift(px,pz));assert.ok(D.lawnRise(px,pz)<1e-6);}}
 assert.ok(n>100);console.log('  track samples on a carriageway (level crossings):',crossed);}
// Dead ends ease back to today's height (no kerb across a street's end).
{const S=D.depthStreets();/* (today every street ends in a junction: 0 dead ends) */for(const e of S.ends){assert.ok(Math.abs(lift(e.x,e.z))<1e-6,'dead end at '+e.x+','+e.z);}}
// The verge: 5 cm over the pavement beside it, nothing under the paving, back to today's lawn 3.3 m out, dipping under a path.
assert.equal(D.lawnRise(119,-110),0,'no lawn rise under the pavement');
assert.ok(near(D.lawnRise(117.5,-110),-D.DRAWN.pave+D.DRAWN.lawn*-1+D.VERGE.lip-.04+.02,1e-3)||near(D.DRAWN.lawn+D.lawnRise(117.5,-110),D.DRAWN.pave+D.VERGE.lip,1e-3),'verge top is 5 cm over the pavement: '+(D.DRAWN.lawn+D.lawnRise(117.5,-110)));
assert.equal(D.lawnRise(118-D.VERGE.reach-.01,-110),0);
assert.ok(D.DRAWN.lawn+D.lawnRise(110,-67)<D.DRAWN.path,'the lawn stays under a path');
// Outline: every kerb segment has an outward normal pointing off the asphalt; the lawn's holes and blocks close.
{const S=D.depthStreets();for(const g of S.asphalt.segs){const mx=(g.ax+g.bx)/2,mz=(g.az+g.bz)/2;assert.ok(!S.asphalt.inside(mx+g.nx*.05,mz+g.nz*.05)&&S.asphalt.inside(mx-g.nx*.05,mz-g.nz*.05));}
 const lawn=D.depthLawn(null);assert.ok(lawn.holesOk,'the street network lies inside the lawn');assert.ok(lawn.holes.length>=1&&lawn.blocks.length>=4,'holes '+lawn.holes.length+', blocks '+lawn.blocks.length);
 if(process.env.LOOPS)console.log(lawn.blocks.map(b=>b.length+':'+b[0].x+','+b[0].z).join(' | '));
 assert.ok(lawn.patch.triangles>2000&&lawn.patch.position.every(Number.isFinite));
 // Kerb strips: finite, facing up, and the asphalt band they own is exactly the first half metre.
 const sink=new D.Sink();D.kerbStrips(sink);let tris=0,down=0;
 for(const c of sink.cells.values()){assert.ok(c.positions.every(Number.isFinite)&&c.colors.every(v=>Number.isFinite(v)&&v>=0));
  for(let i=0;i<c.indices.length;i+=3){const [a,b,d]=[0,1,2].map(k=>c.indices[i+k]*3),P=c.positions,ny=(P[b+2]-P[a+2])*(P[d]-P[a])-(P[b]-P[a])*(P[d+2]-P[a+2]);tris++;if(ny<-1e-9)down++;}}
 assert.equal(down,0,'no kerb triangle faces down');assert.ok(tris>3000&&tris<14000,'kerb triangles '+tris);
 assert.ok(D.asphaltBand(120.3,-110)&&!D.asphaltBand(120.6,-110)&&!D.asphaltBand(119.9,-110));
 const low=new D.Sink();D.kerbStrips(low,true);assert.ok(low.triangles<sink.triangles*.75,'the lowest tier uses a simpler kerb');
 console.log('  kerb triangles',sink.triangles,'(lowest tier',low.triangles+'), verge',lawn.patch.triangles,'(lowest tier',D.depthLawn(null,true).patch.triangles+'), kerb segments',S.asphalt.segs.length,'holes',lawn.holes.length,'blocks',lawn.blocks.length,'dead ends',S.ends.length,'zebras',crossings.length);}
// Reviewer pass: a paving sheet laid across a carriageway is a crossing (dropped kerbs); one beside a zebra or along a street is not.
{const sc=D.sheetCrossings(INPUT.roads,[{x:95,z:-17,w:4,d:10},{x:8,z:-41,w:8,d:3},{x:60,z:-35,w:24,d:4},{x:112,z:-104,w:10,d:3}],crossings);
 assert.ok(sc.some(k=>k.x===8&&k.z===-37.5&&!k.vertical),'the sheet at (8, -41) comes onto the z = -37.5 street: '+JSON.stringify(sc));assert.ok(!sc.some(k=>k.x===95),'the sheet at (95, -17) leads to the zebra at x = 94: no second crossing');
 assert.ok(!sc.some(k=>Math.abs(k.x-60)<1),'a path along a street is not a crossing');assert.ok(!sc.some(k=>Math.abs(k.z+104)<1),'a path that stops at the kerb is not a crossing');
 assert.ok(sc.every(k=>!crossings.some(o=>o.vertical===k.vertical&&Math.hypot(o.x-k.x,o.z-k.z)<5)),'never doubles a zebra');
 // the kerb stone keeps the pavement's hue (night: a neutral stone read lilac): every stone vertex has r > g > b like the paving
 const sink=new D.Sink();D.kerbStrips(sink);let stone=0;for(const c of sink.cells.values())for(let i=0;i<c.colors.length;i+=3){const y=c.positions[i+1];if(y>-.02){stone++;assert.ok(c.colors[i]>c.colors[i+1]&&c.colors[i+1]>c.colors[i+2],'warm stone');}}
 assert.ok(stone>1000);console.log('  sheet crossings',JSON.stringify(sc));}
console.log('town-depth: ok');
