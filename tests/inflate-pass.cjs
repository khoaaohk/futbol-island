// Soft island sweep (Nov 27 2026; lib/graphics/softBox.ts, `?soft=0` = before). Node = ON.
// Harness: tests/prop-reactions.cjs's (the town builds headless in a vm with canvas stubs).
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');

(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),gradient={addColorStop(){}};
const ctx=new Proxy({measureText:t=>({width:t.length*20}),createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??(()=>{})});
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,performance,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Infinity,NaN,
 window:{addEventListener(){},removeEventListener(){},matchMedia:()=>({matches:false})},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},document:{createElement:()=>({width:0,height:0,getContext:()=>ctx})}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 const r=id=>id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
// Inflate pass (Nov 27 2026): puff shapes, budgets of the new pieces, and the seawall's pier joins (owner shot 178: no gap).
const S=load('lib/graphics/softBox.ts');
assert.ok(S.puffLevel()>0,'puff on by default');
{const a=new S.SoftBoxGeometry(2,.12,.65,{seg:0,puff:1.4}),b=new S.SoftBoxGeometry(2,.12,.65,{seg:0,puff:1.4,openBottom:true}),c=new S.SoftBoxGeometry(2,.12,.65,{seg:1,puff:1.4});
 assert.equal(a.index.count/3,46,'puffed chamfer + dome = 46 tris');assert.ok(b.index.count/3<=32,'open bottom drops the underside: '+b.index.count/3);assert.equal(c.index.count/3,110,'puffed 2-step arc + dome');
 assert.ok(c.userData.puff&&c.userData.puff.crown.some(v=>v===1),'puff shading key with a crown');
 c.computeBoundingBox();const bb=c.boundingBox;assert.ok(Math.abs(bb.max.x-1)<1e-3&&Math.abs(bb.min.z+.325)<1e-3,'footprint unchanged');
 const P=c.getAttribute('position');let sharp=0;for(let i=0;i<P.count;i++)if(Math.abs(P.getX(i))>.95&&Math.abs(P.getZ(i))>.28)sharp++;
 assert.equal(sharp,0,'plan corners rounded (pillow, no vertex near the old square corner)');}
{const g=S.puffBall(.37);assert.equal(g.index.count/3,20,'puff ball = 20 tris');}
const H=load('lib/town/thatchHut.ts');
{const w=H.hutWall(2.3,2.6,1),r=H.thatchRoof(3.05,1.8,1),d=H.hutDoor();const tris=g=>(g.index?g.index.count:g.getAttribute('position').count)/3;
 const n=tris(w.geo)+tris(r.geo)+d.reduce((s,p)=>s+tris(p.geo),0);console.log('hut tris',n);assert.ok(n<=2600,'hut budget '+n);
 r.geo.computeBoundingBox();const rb=r.geo.boundingBox;assert.ok(rb.max.x<=3.05*1.12&&rb.max.y<=1.8+.45,'thatch stays on the old cone envelope (+ knot)');
 assert.equal(w.tint.length,w.geo.getAttribute('position').count*3,'wall tint per vertex');assert.equal(r.tint.length,r.geo.getAttribute('position').count*3,'roof tint per vertex');}
const A=load('lib/town/islandArch.ts');
{const parts=A.islandArch({half:5.9,postR:.55,postTop:6.55,plankY:6.1,plankH:.95,plankW:13.4,plankT:1.1});let n=0,lowY=Infinity;
 for(const p of parts){const g=p.geo;n+=(g.index?g.index.count:g.getAttribute('position').count)/3;g.computeBoundingBox();const b=g.boundingBox;if(Math.abs(b.min.z+b.max.z)/2<4.5&&b.min.y>1)lowY=Math.min(lowY,b.min.y);}
 console.log('arch tris',n,'lowest piece over the road',lowY.toFixed(2));assert.ok(n<=6000,'arch budget');assert.ok(lowY>=4.6,'road clearance kept (buses ~3.6 m)');}
const E=load('lib/town/eastCoast.ts'),C=load('lib/town/coralCay.ts'),EP=load('lib/town/eastPier.ts');
for(const [z0,gap,off] of [[C.CAUSEWAY.z,C.CAUSEWAY.deckHalf+.6,C.CAUSEWAY.deckHalf+.55],[EP.EAST_PIER.z,EP.EAST_PIER.railHalf+.6,EP.EAST_PIER.railHalf+.55]])for(const s of [-1,1]){
 const pz=z0+s*off,px=E.seawallX(pz),end=z0+s*gap,wx=E.seawallX(end);assert.ok(px!==null&&wx!==null,'pier on the seawall run '+pz);
 assert.ok(Math.abs(wx-px)<.17&&Math.abs(end-pz)<.5,`wall end (${wx.toFixed(2)}, ${end.toFixed(2)}) inside the pier at (${px.toFixed(2)}, ${pz.toFixed(2)})`);}
// Inflate pass 2: ONE swept pillowy run round a corner (no joints), smooth finite normals, crown + coping tint keys, pieces <= 12 m.
{const run=[{x:0,z:0,top:1,foot:-.3},{x:6,z:0,top:1,foot:-.3},{x:6,z:20,top:1,foot:-.3}],ps=S.puffRun(run,{half:.3,belly:.03,capTint:[1.5,1.5,1.5]});
 assert.ok(ps.length===2,'cut into <= 12 m pieces: '+ps.length);let tris=0;
 for(const p of ps){const g=p.geo,N=g.getAttribute('normal');tris+=g.index.count/3;for(let i=0;i<N.count;i++)assert.ok(Number.isFinite(N.getX(i))&&Math.abs(Math.hypot(N.getX(i),N.getY(i),N.getZ(i))-1)<1e-3,'unit normals');
  assert.equal(p.tint.length,g.getAttribute('position').count*3,'tint per vertex');assert.equal(g.userData.puff.crown.length,g.getAttribute('position').count,'crown per vertex');}
 const A=ps[0].geo.getAttribute('position'),B=ps[1].geo.getAttribute('position');let shared=0;// the cut ring is in both pieces at the same world spot
 for(let i=0;i<A.count;i++)for(let j=0;j<B.count;j++)if(Math.abs(A.getX(i)+ps[0].cx-B.getX(j)-ps[1].cx)<1e-4&&Math.abs(A.getY(i)-B.getY(j))<1e-4&&Math.abs(A.getZ(i)+ps[0].cz-B.getZ(j)-ps[1].cz)<1e-4)shared++;
 assert.ok(shared>=11,'pieces share their cut ring (no gap): '+shared);console.log('puff run tris',tris);assert.ok(tris<=3*24+2*40,'puff run budget');}
// Inflate pass 2: every swept wall's end lies inside a pier's footprint (plaza garden walls, stair cheek walls), and the seawall is
// one continuous run per stretch (no per-segment boxes left).
{const W=load('lib/town/westTerrain.ts'),puts=[],obstacles=[];
 W.buildWestWalls({put:(g,c,x,y,z)=>{const m=new T.Mesh(g);m.position.set(x,y,z);puts.push({g,x,y,z});return m;},obstacles});
 const runs=puts.filter(p=>p.g.userData.puff&&!(p.g instanceof T.BoxGeometry)),piers=puts.filter(p=>p.g instanceof T.BoxGeometry&&p.g.parameters.height>.5&&Math.abs(p.g.parameters.width-p.g.parameters.depth)<1e-6);
 assert.ok(runs.length>20&&piers.length>10,'swept runs + piers built: '+runs.length+' / '+piers.length);
 let ends=0;for(const r of runs){r.g.computeBoundingBox();const b=r.g.boundingBox,dx=b.max.x-b.min.x,dz=b.max.z-b.min.z;if(dz>1.2||dx<2||b.min.x+r.x<-126||b.max.x+r.x>-72)continue;// the plaza's straight x runs
  for(const x of [b.min.x+r.x,b.max.x+r.x]){const z=(b.min.z+b.max.z)/2+r.z,hit=piers.some(p=>Math.abs(p.x-x)<p.g.parameters.width/2&&Math.abs(p.z-z)<p.g.parameters.depth/2);
   assert.ok(hit,`plaza wall end (${x.toFixed(2)}, ${z.toFixed(2)}) inside a pier`);ends++;}}
 assert.ok(ends>=24,'plaza wall ends checked: '+ends);
 const E2=load('lib/town/eastCoast.ts'),eput=[];E2.buildEastCoast({box:(w,h,d)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d));eput.push(m.geometry);return m;},put:(g)=>{eput.push(g);return new T.Mesh(g);},obstacles:[]});
 const swept=eput.filter(g=>g.userData.puff&&!(g instanceof T.BoxGeometry)),long=eput.filter(g=>g instanceof T.BoxGeometry&&g.parameters.depth>3&&g.parameters.height>.9);
 assert.ok(swept.length>=3&&long.length===0,'seawall = swept runs, no box segments: '+swept.length+' / '+long.length);}
console.log('inflate pass: ok');
})().catch(e=>{console.error(e);process.exit(1);});
