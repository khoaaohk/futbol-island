// Surface craft, layer 3 (lib/town/surfaceEdges.ts, ?surf=1, default OFF): the lawn's soft edges. Flag off: nothing is built.
// Flag on: the rim round the island lawn and the lips along the paths are finite, face up, carry an edge value in 0..1 that is 0 on
// the lawn side and 1 on the bare rim, never sit on open lawn with a bare value, and stay a small part of the lawn's triangles.
const assert=require('node:assert/strict');
const {createLoader}=require('./summit-harness.cjs');
{const load=createLoader(),E=load('lib/town/surfaceEdges.ts');assert.equal(E.SURF_DEFAULT,false,'ships OFF until the owner approves it');assert.equal(E.surfOn(),false);
 E.setSurfaceInput({paths:[{x:0,z:0,w:20,d:3}],blocked:()=>false});assert.equal(E.mainLawnEdges(),null,'nothing with the flag off');}
const load=createLoader(),E=load('lib/town/surfaceEdges.ts'),S=load('lib/town/shoreline.ts');E.setSurfaces(true);
const inside=(poly,x,z)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
const check=(p,label)=>{assert.ok(p.position.every(Number.isFinite)&&p.edge.every((v,i)=>v>=0&&v<=(i%2?5:1)),label+': finite, edge in 0..1, what lies beyond in 0..1 or a wear code');assert.equal(p.edge.length/2,p.position.length/3);
 let down=0;for(let i=0;i<p.index.length;i+=3){const [a,b,d]=[0,1,2].map(k=>p.index[i+k]*3),P=p.position,ny=(P[b+2]-P[a+2])*(P[d]-P[a])-(P[b]-P[a])*(P[d+2]-P[a+2]);if(ny<-1e-9)down++;}
 assert.equal(down,0,label+': no triangle faces down');};
// the rim: bare vertices lie OUTSIDE the lawn polygon, lawn-side vertices inside it; it never rises more than 2 cm
{const out={position:[],index:[],edge:[]},tris=E.lawnFringe(S.INTERIOR_GRASS,out);check(out,'rim');let bareIn=0,lawnOut=0,n=0;
 for(let i=0;i<out.edge.length/2;i++){const e=out.edge[i*2],x=out.position[i*3],y=out.position[i*3+1],z=out.position[i*3+2];assert.ok(y>0&&y<=E.EDGE.rise+1e-9);n++;
  if(e===1&&inside(S.INTERIOR_GRASS,x,z))bareIn++;if(e===0&&!inside(S.INTERIOR_GRASS,x,z))lawnOut++;}
 assert.ok(bareIn<n*.01,'bare rim vertices inside the lawn: '+bareIn);assert.ok(lawnOut<n*.01,'lawn-side vertices outside the lawn: '+lawnOut);
 const low={position:[],index:[],edge:[]},lowTris=E.lawnFringe(S.INTERIOR_GRASS,low,true);assert.ok(tris>800&&tris<3200,'rim triangles '+tris);assert.ok(lowTris<tris*.6,'the lowest tier uses the simpler rim');
 // lips: only beside open lawn; the bare value only ON the path
 const cx=100,cz=-100,path={x:cx,z:cz,w:30,d:3};
 E.setSurfaceInput({paths:[path],blocked:(x,z)=>x>cx+5});const lip={position:[],index:[],edge:[]},lipTris=E.pathLips(lip);check(lip,'lips');assert.ok(inside(S.INTERIOR_GRASS,cx,cz));assert.ok(lipTris>20,'lips '+lipTris);
 for(let i=0;i<lip.edge.length/2;i++){const x=lip.position[i*3],z=lip.position[i*3+2],on=Math.abs(x-path.x)<path.w/2+1e-6&&Math.abs(z-path.z)<path.d/2+1e-6;if(lip.edge[i*2]===1)assert.ok(on,'a bare lip vertex lies on the path');assert.ok(x<cx+5+4.1,'no lip beside covered ground');const y=lip.edge[i*2+1];assert.ok(y>=E.WEAR_BASE-2-1e-9&&y<=E.WEAR_BASE+1+1e-9,'paving beyond, with its wear: '+y);}
 // wear: a sheet over the walkway only, paving everywhere (edge 1), dusty at the outline (-1), trodden in the middle (+1), every
 // triangle up; a second walkway crossing it is cut in, never laid twice; a square (wider than WEAR.max) gets none; none on the lowest tier
 {const wear={position:[],index:[],edge:[]},t=E.pathWear(wear);check(wear,'wear');assert.ok(t>20&&t<400,'wear triangles '+t);let lo=9,hi=-9;
  for(let i=0;i<wear.edge.length/2;i++){const x=wear.position[i*3],z=wear.position[i*3+2],w=wear.edge[i*2+1]-E.WEAR_BASE;assert.equal(wear.edge[i*2],1);assert.ok(Math.abs(x-path.x)<=path.w/2+1e-6&&Math.abs(z-path.z)<=path.d/2+1e-6,'on the walkway');
   const d=Math.min(path.w/2-Math.abs(x-path.x),path.d/2-Math.abs(z-path.z));assert.ok(Math.abs(w-E.wearOf(d))<1e-6,'wear follows the distance to the outline');lo=Math.min(lo,w);hi=Math.max(hi,w);}
  assert.ok(lo===-1&&hi===E.WEAR.light,'dusty edge to trodden middle: '+lo+' .. '+hi);assert.equal(E.wearOf(0),-1);assert.equal(E.wearOf(E.WEAR.edge),0);assert.equal(E.wearOf(9),E.WEAR.light);
  assert.equal(E.pathWear({position:[],index:[],edge:[]},true),0,'no wear on the simpler edge');
  const area=p=>{let a=0;for(let i=0;i<p.index.length;i+=3){const [A,B,C]=[0,1,2].map(k=>p.index[i+k]*3),P=p.position;a+=Math.abs((P[B]-P[A])*(P[C+2]-P[A+2])-(P[C]-P[A])*(P[B+2]-P[A+2]))/2;}return a;};
  assert.ok(Math.abs(area(wear)-path.w*path.d)<1e-6,'the sheet covers the walkway once: '+area(wear));
  const cross={x:cx-6,z:cz+4,w:3,d:14},square={x:cx-40,z:cz,w:20,d:20};E.setSurfaceInput({paths:[path,cross,square],blocked:()=>false});
  const two={position:[],index:[],edge:[]};E.pathWear(two);check(two,'wear at a junction');assert.ok(Math.abs(area(two)-(path.w*path.d+cross.w*cross.d-3*3))<1e-6,'a junction is covered once, a square not at all: '+area(two));
  // straight through the junction: on the first walkway's centre line, inside the crossing, the tone stays the trodden middle
  let mid=0;for(let i=0;i<two.edge.length/2;i++){const x=two.position[i*3],z=two.position[i*3+2];if(Math.abs(z-cz)<1e-6&&Math.abs(x-cross.x)<1.6){assert.ok(two.edge[i*2+1]-E.WEAR_BASE>E.WEAR.light-.01,'trodden through the junction');mid++;}}assert.ok(mid>=3);
  E.setSurfaceInput({paths:[path],blocked:(x,z)=>x>cx+5});}
 // Coral Cay: the rim climbs onto the sand ring (which lies over the lawn), skipped where told; lips and wear laid on the raised ground
 {const C=load('lib/town/coralCay.ts'),hx=C.HOSTEL_PATHS[0];E.setSurfaceInput({paths:C.HOSTEL_PATHS.map(([x,z,w,d])=>({x,z,w,d})),blocked:()=>false});
  const flat=E.cayLawnEdges(false,null,()=>false,.112),hill=(x,z)=>.3*Math.max(0,x-hx[0]+3),raised=E.cayLawnEdges(false,hill,(x,z)=>z>-150,.112);
  check(flat,'cay flat');check(raised,'cay raised');assert.ok(flat.fringe>300&&flat.lips>20&&flat.wear>20,'cay: rim '+flat.fringe+', lips '+flat.lips+', wear '+flat.wear);assert.ok(raised.fringe<flat.fringe,'the rim is skipped where the outline is not sand');
  let top=0;for(let i=0;i<flat.position.length/3;i++)if(flat.edge[i*2+1]===0&&flat.edge[i*2]>=.5)top=Math.max(top,Math.abs(flat.position[i*3+1]-.132));assert.ok(top<1e-9,'the rim lies 2 cm over the sand ring');
  let lifted=0,cut=0;for(let i=0;i<raised.position.length/3;i++){if(raised.edge[i*2+1]<1.5)continue;const x=raised.position[i*3],y=raised.position[i*3+1],z=raised.position[i*3+2];assert.ok(y>=hill(x,z)-1e-9,'laid on the ground, never under it');if(hill(x,z)>.2)lifted++;if(raised.edge[i*2+1]<E.WEAR_BASE-1.5)cut++;}
  assert.ok(lifted>20,'lips and wear on the raised ground');assert.ok(cut>4,'the uphill verge is a cut bank: '+cut);
  E.setSurfaceInput({paths:[path],blocked:(x,z)=>x>cx+5});}
 const all=E.mainLawnEdges();assert.ok(all&&all.triangles===all.fringe+all.lips+all.wear);
 console.log('  rim triangles',tris,'(lowest tier',lowTris+'), lips for one 30 m path',lipTris);}
console.log('surface-edges: ok');
