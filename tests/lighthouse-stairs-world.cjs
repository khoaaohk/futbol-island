// East Jetty lighthouse spiral stair, drawn and wired (Oct 26 2026): the merged geometry (one piece per colour, a small vertex
// budget, treads matching the walking ramp, nothing inside the tower or across the gallery's opening), the scenery changes
// (round tower footprint, benches and the hunt ball clear of the band), and the runtime wiring in rooftopTravel.ts / Town.tsx.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,Float64Array,Uint16Array,Uint32Array,Int32Array,ArrayBuffer,JSON,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const src=f=>fs.readFileSync(f,'utf8');
const T=require('three');
const LS=load('lib/town/lighthouseStairs.ts'),{LIGHTHOUSE_STAIRS:L,STAIR_SPAN,STAIR_END,stairHeight,towerSolidRadius}=LS;
const W=load('lib/town/lighthouseStairsWorld.ts');

// ---- Geometry: a handful of merged pieces, a small vertex budget, built once.
const g=W.buildLighthouseStairGeometry();
const counts=Object.fromEntries(Object.entries(g).map(([k,v])=>[k,v.getAttribute('position').count]));
const total=Object.values(counts).reduce((a,b)=>a+b,0);
assert(total<36000,`stair + gallery under 36k vertices (${total}: ${JSON.stringify(counts)})`);
for(const [k,v] of Object.entries(g)){const p=v.getAttribute('position').array;for(let i=0;i<p.length;i++)assert(Number.isFinite(p[i]),k+' finite');assert(v.getAttribute('normal'),k+' has normals');}
{const puts=[];const put=(geo,c,x,y,z)=>{const m=new T.Mesh(geo);m.position.set(x,y,z);puts.push({c,m});return m;};W.buildLighthouseStairs(put);
 assert(puts.length<=7,`at most 7 merged pieces (${puts.length})`);
 assert(puts.every(p=>Math.abs(p.m.position.x-L.cx)<1e-9&&Math.abs(p.m.position.z-L.cz)<1e-9),'all at the tower axis: one 50 m chunk');
 assert(new Set(puts.map(p=>p.c)).size<=5&&puts.some(p=>p.c==='#ffe8ae'),'existing palette colours only; lamps use the shared lens');}

// ---- Treads follow the ramp: every walkable band sample has a tread top within half a riser + a little of the ramp height,
//      and no stone or iron enters the tower below the gallery (the tower stays visible and solid).
{const p=g.stone.getAttribute('position').array,tops=new Map();
 for(let i=0;i<p.length;i+=3){const x=p[i],y=p[i+1],z=p[i+2],r=Math.hypot(x,z);assert(r>=Math.min(L.galleryR-.06,towerSolidRadius(y))-1e-6||y>L.top-.25,`stone outside the tower at y ${y.toFixed(2)} (r ${r.toFixed(2)})`);}
 // Ray-cast down through the treads at sample points: the hit is within 0.12 m of the ramp.
 const mesh=new T.Mesh(g.stone,new T.MeshBasicMaterial({side:T.DoubleSide})),ray=new T.Raycaster();
 for(let i=1;i<160;i++){const phi=STAIR_SPAN*i/160;for(const r of [L.rIn+.35,(L.rIn+L.rOut)/2,L.rOut-.35]){const a=L.theta0+phi,x=Math.cos(a)*r,z=Math.sin(a)*r,h=stairHeight(phi);
  ray.set(new T.Vector3(x,h+.5,z),new T.Vector3(0,-1,0));ray.far=1.2;const hit=ray.intersectObject(mesh)[0];
  assert(hit&&Math.abs(hit.point.y-h)<.12,`a tread under the ramp at φ ${phi.toFixed(2)} r ${r} (${hit?hit.point.y.toFixed(3):'none'} vs ${h.toFixed(3)})`);}}
 // The landing is flat at the gallery height across the band and the opening's threshold.
 for(const phi of [STAIR_SPAN+.1,STAIR_SPAN+.5])for(const r of [L.galleryR+.02,L.rIn+.4,L.rOut-.3]){const a=L.theta0+phi;ray.set(new T.Vector3(Math.cos(a)*r,L.top+.5,Math.sin(a)*r),new T.Vector3(0,-1,0));const hit=ray.intersectObject(mesh)[0];assert(hit&&Math.abs(hit.point.y-L.top)<.01,'landing slab at '+phi.toFixed(2)+','+r);}}
// The gallery railing leaves the opening clear: no iron post or rail in it at the gallery's radius above the floor.
{const p=g.iron.getAttribute('position').array;let inOpening=0;
 for(let i=0;i<p.length;i+=3){const x=p[i],y=p[i+1],z=p[i+2],r=Math.hypot(x,z);if(y<L.top+.1||Math.abs(r-L.galleryR)>.12)continue;let a=Math.atan2(z,x)-L.theta0;a%=Math.PI*2;if(a<0)a+=Math.PI*2;
  if(a>=STAIR_SPAN-Math.PI*4-L.openBefore+2*Math.PI+.02||a<=L.landing-.02)inOpening++;}
 assert.equal(inOpening,0,'the gallery railing is open where the landing meets it');}

// ---- Scenery: round tower footprint, benches and the hunt ball clear of the band; the old 2 m gallery is gone.
{const w=src('lib/town/eastPierWorld.ts');
 assert(/cornerRadius:TOWER_FOOT_R/.test(w)&&/buildLighthouseStairs\(put\)/.test(w),'round footprint and the merged stair');
 assert(!/CylinderGeometry\(2\.05,2\.05/.test(w)&&!/TorusGeometry\(1\.95/.test(w),'the old narrow gallery is replaced');
 const m=w.match(/bench\(P\.cx-\.8,P\.cz-([\d.]+),-1\);bench\(P\.cx-\.8,P\.cz\+([\d.]+),1\)/);assert(m&&Math.hypot(.8,Number(m[1])-.35)>L.rOut+.45,'benches clear of the stair band');}

// ---- Runtime wiring: the level-aware floor, rails, assist, landing and narrow ride radius in rooftopTravel; the ball, jet dash,
//      ride pose and hidden-player marker in Town.
{const r=src('lib/town/rooftopTravel.ts'),t=src('components/Town.tsx');
 assert(/lighthouseFloor\(x,z,from\)/.test(r)&&/lighthouseConstrain\(fromX,fromZ,p,v,state\.height,collisionRadius\)/.test(r)&&/lighthouseLanding\(x,z,from\)/.test(r)&&/lighthouseAssist\.steer/.test(r)&&/nearLighthouse\(p\.x,p\.z\)\)collisionRadius=Math\.min\(collisionRadius,RIDE_STAIR_RADIUS\)/.test(r),'rooftopTravel wiring');
 assert(/floor:ballFloor/.test(t)&&/lighthouseFloor\(x,z,walkBall\.state\.y/.test(t),'the ball sees the stair level under it');
 assert(/summitSolid\(x,z,y\)\|\|lighthouseSolid\(x,z,y\)/.test(t)&&/!isLighthouseTower\(o\)/.test(t),'the ball hits the tower, treads and rails by height (not the footprint column)');
 assert(/lighthouseSolid\(x,z,flight\.height\)/.test(t),'jet dashes stop at the tower');
 assert(/rooftop\.state\.height,riderSurface,stairRidePose/.test(t),'ride wheels pose on the stair level under the rider');
 assert(/lighthouseHides\(visualLocation\.x,groundY/.test(t),'the hidden-player marker shows behind the tower');
 assert(!/new T\.|\[\]|=>\{/.test(LS.lighthouseConstrain.toString().replace(/\/\/.*$/gm,'')),'lighthouseConstrain allocates nothing');}
console.log(`PASS lighthouse stairs world: ${total} vertices in ${Object.keys(g).length} merged pieces (+ deck and corbel), wiring checked`);
