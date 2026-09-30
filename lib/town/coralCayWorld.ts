// Coral Cay scenery (Sep 29 2026, revision 2): the winding, beach-lined causeway, its two sandbar stops and the
// irregular tropical cay with its beach-soccer court. Built inside buildTown with the island's own helpers
// (box/palm/house/sign…), so every mesh joins the existing 50 m spatial paint batches: no new materials beyond palette
// colours, no animation, no per-frame work. Shapes come from coralCay.ts, which movement, flight and the maps also read.
import * as T from 'three';
import type {Obstacle} from './simulation';
import {CAUSEWAY,CAUSEWAY_PATH,SANDBARS,CAY_SHORE,CAY_SAND,CAY_LAWN,CAY_CENTER,CAY_BOULEVARD,CAY_PLAZA,BEACH_COURT,CAY_HOUSES,CAY_HUTS,CAY_HUT_RADIUS,MAIN_SHORE_X,SHARKS_BEACH,COURT_BEACH,COURT_SCOREBOARD,onCourtBeach,ROUNDABOUT,WELCOME_ARCH,CAY_KONBINI,CAY_KONBINI_DOOR,FARM,FARM_FENCE_OBSTACLES,HOSTEL,CAY_HOMES,HOSTEL_PATHS,MINI_GOAL,inHostelArea,shoulderWidth,causewayRuns,offsetPoint,onCay,onSandbarStop,distanceToCayShore,cayJitter as jitter,type Sandbar,type PathSample,type RoadSide} from './coralCay';
import {INTERIOR_GRASS_COLOR} from './shoreline';
import {fadeBand} from './shallows';
import type {DecorPart,DecorPlant} from '../graphics/farmDecor';
type Mesh=T.Mesh;
export type CayTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 line:(a:T.Vector3,b:T.Vector3,r:number,c:string)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 palm:(x:number,z:number,height?:number)=>void;
 house:(x:number,z:number,w:number,d:number,h:number,label:string,index:number)=>void;
 table:(x:number,z:number)=>void;
 planter:(x:number,z:number)=>void;
 path:(x:number,z:number,w:number,d:number)=>void;
 districtSign:(text:string,x:number,z:number)=>void;
 /** Adds a shallows band geometry (shallows.ts fadeBand, built relative to x/z) with the shared fading material. */
 shallows:(g:T.BufferGeometry,x:number,z:number)=>void;
 obstacles:Obstacle[];
 buildings:{x:number;z:number;w:number;d:number;height:number;name:string;cornerRadius?:number}[];
 assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;canopyHeight?:number;baseY?:number}[];
 surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[];
};
export type CayLampSite={x:number;z:number;ground:number;region:'coral-cay';poolWidth?:number;poolDepth?:number};
const V=(x:number,y:number,z:number)=>new T.Vector3(x,y,z);
/** Merge simple same-attribute boxes (the farm's soil rows) into one geometry. */
function mergeRows(parts:T.BufferGeometry[]){const pos:number[]=[],nor:number[]=[],idx:number[]=[];let o=0;for(const g of parts){const p=g.getAttribute('position'),n=g.getAttribute('normal');for(let i=0;i<p.count;i++){pos.push(p.getX(i),p.getY(i),p.getZ(i));nor.push(n.getX(i),n.getY(i),n.getZ(i));}const index=g.index!;for(let i=0;i<index.count;i++)idx.push(index.getX(i)+o);o+=p.count;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);return g;}

export function buildCoralCay(t:CayTools){
 const {box,cylinder,put,line,sign,palm,house,table,planter,path,districtSign,shallows,obstacles,buildings,assets,surfaceAreas}=t;
 const lampSites:CayLampSite[]=[];
 const farmDecor:DecorPlant[]=[];
 const z0=CAUSEWAY.z,P=CAUSEWAY_PATH,deck=CAUSEWAY.deckHalf;
 const flat=(m:Mesh)=>{m.castShadow=false;return m;};
 const overWater=(p:PathSample)=>p.s>=CAUSEWAY.sWater0-3&&p.s<=CAUSEWAY.sWater1;

 // ---- Curved strips along the centre line. Each strip is cut into ≤12-sample (~24 m) pieces, built relative to the
 // piece's middle and placed there, so it joins its own 50 m chunk. inner/outer are signed offsets (+ = right of
 // travel) and may vary along the road (beach widths); yInner/yOuter give sloped faces (the beach running into the sea).
 function strip(from:number,to:number,inner:(p:PathSample)=>number,outer:(p:PathSample)=>number,yInner:number,yOuter:number,color:string,shadow=false,piece=12){
  for(let a=from;a<to;a+=piece){
   const b=Math.min(to,a+piece),mid=P[(a+b)>>1],positions:number[]=[],indices:number[]=[];
   for(let i=a;i<=b;i++){const p=P[i],q=offsetPoint(p,inner(p)),r=offsetPoint(p,outer(p));positions.push(q.x-mid.x,yInner,q.z-mid.z,r.x-mid.x,yOuter,r.z-mid.z);if(i<b){const k=(i-a)*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
   if(g.getAttribute('normal').getY(0)<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);g.computeVertexNormals();}
   const m=put(g,color,mid.x,0,mid.z);m.castShadow=shadow;
  }
 }
 const last=P.length-1,firstWater=P.findIndex(p=>p.s>=CAUSEWAY.sWater0-3),lastWater=P.findIndex(p=>p.s>=CAUSEWAY.sWater1);
 // ---- Road surface: the Club Grounds street continues east and winds out to the cay. Sidewalks and asphalt never
 // overlap (performance guide: coplanar layers flicker at parachute distance).
 // The roundabout replaces the straight road where the causeway reaches the cay: the road stops at its outer edge.
 // The road ribbons stop where each roundabout arm flares out (5 m outside the ring); the flare shapes below meet their end edges exactly.
 const ARM_END=ROUNDABOUT.roadOuter+5,inRing=(p:{x:number;z:number})=>Math.hypot(p.x-ROUNDABOUT.x,p.z-ROUNDABOUT.z)<ARM_END;
 const iW=P.findIndex(inRing),iE=P.length-1-[...P].reverse().findIndex(inRing);
 for(const [a,b] of [[0,iW],[iE,last]] as [number,number][]){
  strip(a,b,()=>-4,()=>4,-.01,-.01,'#737c75');
  for(const side of [-1,1])strip(a,b,()=>side*4,()=>side*deck,-.02,-.02,'#eddfbb');
 }
 // Over the water the embankment slopes gently into the sea (no vertical cliff): a stone skirt, then — wherever sand or
 // stone meets the sea — a soft foam line (the main coast's pale waterline colour) and two shallow-water tints.
 // Shoreline widths: `contact` is where each side reaches the water. Long pieces keep these extra colours to a few batches.
 const slopeOf=(w:number)=>2.4*Math.min(1,w/1.5);
 const contact=(p:PathSample,side:RoadSide)=>{const w=shoulderWidth(p.s,side);return Math.max(deck+2.05,deck+w+slopeOf(w)*.9);};
 const wobble=(p:PathSample,side:RoadSide,k:number)=>.35*Math.sin(p.s/4.1+side*k)+.25*Math.sin(p.s/1.7+k);
 // Seam fix (Sep 29 2026): the cay coast meets the causeway at an angle, so each side reaches land at its own point.
 // Skirt, foam and shallows run on to that point (plus a few metres, tucked under the beach), and the shallows band
 // tapers its alpha to nothing over its first and last ~14 m, blending into the main-coast and cay-coast bands.
 const landIndex=(side:RoadSide)=>{let i=lastWater;while(i<last){const q=offsetPoint(P[i],side*(deck+2.6));if(onCay(q.x,q.z))break;i++;}return Math.min(last,i+3);};
 for(const side of [-1,1] as RoadSide[]){
  const end=landIndex(side),b0=Math.max(0,firstWater-5),b1=Math.min(last,end+6),taper=7;
  strip(firstWater,end,()=>side*deck,()=>side*(deck+2.4),-.02,-.5,'#bca987');
  strip(firstWater,end,p=>side*(contact(p,side)-.25),p=>side*(contact(p,side)+.3+wobble(p,side,1)*.3),-.405,-.405,'#f5e9cb',false,60);
  // One wide shallows band fading out to sea (shared material, smooth outer edge); pieces share their end samples.
  const ends=(j:number)=>Math.min(1,(j-b0)/taper,(b1-j)/taper);
  for(let a=b0;a<b1;a+=60){const b=Math.min(b1,a+60),run=P.slice(a,b+1),mid=P[(a+b)>>1];
   shallows(fadeBand(run.map(p=>offsetPoint(p,0)),run.map(p=>({x:-p.tz*side,z:p.tx*side})),i=>contact(run[i],side),5.2,false,mid.x,mid.z,i=>{const t=ends(a+i);return t*t*(3-2*t);}),mid.x,mid.z);}
 }
 // Centre dashes share a 6 m rhythm along the curve, turned to the road's heading.
 for(let s=8;s<P[last].s-4;s+=6){const p=P[Math.round(s/P[last].s*last)];if(Math.hypot(p.x-ROUNDABOUT.x,p.z-ROUNDABOUT.z)<ARM_END+2)continue;const d=box(2,.008,.12,'#e6d7b5',p.x,.008,p.z);d.rotation.y=-Math.atan2(p.tz,p.tx);}
 // Lamps must stay off this paving on the main island, like every other street.
 surfaceAreas.push({kind:'path',x:(CAUSEWAY.roadStart+MAIN_SHORE_X)/2,z:z0,w:MAIN_SHORE_X-CAUSEWAY.roadStart,d:12});
 // Gate piers close both cut ends of the seawall (the road is still straight at the coast).
 for(const side of [-1,1]){const z=z0+side*(deck+.55);box(1,1.5,1,'#bca987',MAIN_SHORE_X-2.6,.55,z);box(1.25,.2,1.25,'#eddfbb',MAIN_SHORE_X-2.6,1.4,z);obstacles.push({x:MAIN_SHORE_X-2.6,z,w:1,d:1});}
 districtSign('CORAL CAY CAUSEWAY',215,-170.5);

 // ---- Beach shoulders: sand banks outside the deck in irregular stretches, sloping into the sea (coralCay.ts widths).
 for(const side of [-1,1] as RoadSide[])for(const [a,b] of causewayRuns(p=>shoulderWidth(p.s,side)>0)){
  const w=(p:PathSample)=>shoulderWidth(p.s,side);
  // Sand top, then a wet-sand slope into the sea whose width tapers with the bank, so bank tips stay pointed and soft.
  strip(a,b,()=>side*deck,p=>side*(deck+w(p)),-.09,-.09,'#f1d6a1');
  strip(a,b,p=>side*(deck+w(p)),p=>side*(deck+w(p)+slopeOf(w(p))),-.09,-.47,'#dfc99e');
  // Palms and a few umbrellas on the widest banks; shells at the tide line.
  for(let i=a+3;i<=b-3;i+=4){const p=P[i],wi=w(p);if(wi<5.5)continue;
   if(i%13===0&&wi>8){const q=offsetPoint(p,side*(deck+wi*.5));umbrella(q.x,q.z,i);continue;}
   if(i%8<3){const q=offsetPoint(p,side*(deck+wi*(.55+jitter(i,side)*.2)));palm(q.x,q.z,5+jitter(i,3)*1.2);}}
  for(let i=a+1;i<b;i+=5){const p=P[i],q=offsetPoint(p,side*(deck+w(p)+slopeOf(w(p))*.4)),rock=put(new T.IcosahedronGeometry(.2+jitter(i,side+9)*.2,0),'#d2bc94',q.x,-.28,q.z);rock.scale.y=.5;}
 }
 // ---- Rails: pier-style timber posts and cream rails where there is no beach, open at the two sandbar spurs.
 const railAt=(p:PathSample,side:RoadSide)=>overWater(p)&&p.s>CAUSEWAY.sWater0-1&&shoulderWidth(p.s,side)===0&&!SANDBARS.some(b=>b.side===side&&Math.abs(p.s-b.spur.s)<b.spur.half+.5);
 for(const side of [-1,1] as RoadSide[])for(const [a,b] of causewayRuns(p=>railAt(p,side))){
  for(let i=a;i<b;i+=2){const j=Math.min(b,i+2),p=offsetPoint(P[i],side*CAUSEWAY.railHalf),q=offsetPoint(P[j],side*CAUSEWAY.railHalf);for(const y of [1.05,.55])line(V(p.x,y,p.z),V(q.x,y,q.z),y>1?.045:.032,'#eddfbb');}
  for(let i=a;i<=b;i+=2){const p=offsetPoint(P[i],side*CAUSEWAY.railHalf);cylinder(.065,1.05,'#9d805b',p.x,.525,p.z);}
  // Finished rail ends: a stouter capped post with a couple of boulders tucked at its foot, never a cut-off rail.
  for(const [i,dir] of [[a,-1],[b,1]] as [number,number][]){const p=offsetPoint(P[i],side*CAUSEWAY.railHalf);cylinder(.12,1.25,'#9d805b',p.x,.625,p.z);put(new T.SphereGeometry(.15,8,6),'#eddfbb',p.x,1.3,p.z);
   for(let k=0;k<2;k++){const q=offsetPoint(P[Math.max(0,Math.min(last,i+dir*(1+k)))],side*(CAUSEWAY.railHalf+.45+k*.2)),rock=put(new T.IcosahedronGeometry(.32-k*.08,0),'#d2bc94',q.x,-.02+.12,q.z);rock.scale.y=.6;}}
  // Riprap boulders at the waterline where the flank meets the sea.
  for(let i=a+1;i<b;i+=2){const r=.55+jitter(i,side)*.5,p=offsetPoint(P[i],side*(deck+1.4+jitter(i,side+7)*.6)),rock=put(new T.IcosahedronGeometry(r*.8,0),jitter(i,side+3)>.5?'#d2bc94':'#bca987',p.x,-.38,p.z);rock.scale.y=.55;rock.rotation.y=i;}
 }
 // Warm lamps every 24 m, alternating sides on the sidewalk edge. Same pieces as the street lamps, so the shared lamp
 // lens material and the night pool batches light them.
 const lamp=(x:number,z:number,ground:number)=>{
  cylinder(.19,.22,'#384443',x,ground+.11,z).castShadow=false;cylinder(.065,4.2,'#384443',x,ground+2.1,z).castShadow=false;
  box(.62,.12,.62,'#384443',x,ground+4.22,z).castShadow=false;box(.43,.32,.43,'#ffe8ae',x,ground+3.99,z).castShadow=false;
  obstacles.push({x,z,w:.38,d:.38});assets.push({kind:'cay-lamp',x,z,w:.38,d:.38,visualW:.65,visualD:.65});
  lampSites.push({x,z,ground:ground+.005,region:'coral-cay',poolWidth:9,poolDepth:9});
 };
 for(let s=CAUSEWAY.sWater0+8,k=0;s<CAUSEWAY.sWater1-6;s+=24,k++){const p=P[Math.round(s/P[last].s*last)],side=(k%2?1:-1) as RoadSide;
  if(SANDBARS.some(b=>b.side===side&&Math.abs(p.s-b.spur.s)<5))continue;const q=offsetPoint(p,side*6.65);lamp(q.x,q.z,-.02);}
 // Welcome arch where the road straightens on the cay: two stucco piers and a beam over the road, signed both ways.
 // The piers stand on the pavement (between the 4 m kerb and the 7 m deck edge), clear of the carriageway and the zebra.
 {const x=WELCOME_ARCH.x,pz=WELCOME_ARCH.pierOffset,pw=WELCOME_ARCH.pierWidth;for(const side of [-1,1]){box(pw,6.2,pw,'#d6b58a',x,3.1,z0+side*pz);box(pw+.3,.3,pw+.3,'#eddfbb',x,6.3,z0+side*pz);obstacles.push({x,z:z0+side*pz,w:pw,d:pw});}
  box(1.1,.9,pz*2+1.4,'#477c6a',x,6.1,z0);box(1.3,.18,pz*2+1.8,'#eddfbb',x,6.63,z0);
  sign('WELCOME TO CORAL CAY',11,.8,x-.57,6.1,z0,'#294f43','#f4cc7c',-Math.PI/2);
  sign('CAUSEWAY · MAIN ISLAND',11,.8,x+.57,6.1,z0,'#294f43','#f4cc7c',Math.PI/2);}

 // ---- Roundabout (Sep 29 2026): one-way, anticlockwise on the map, where the causeway reaches the cay. Cars follow
 // lib/town/cayTraffic.ts. Asphalt ring, painted lane edges, give-way lines and zebra crossings on both arms, and a kerbed
 // central island with a palm and a football sculpture. All static palette meshes in the spatial batches.
 {const R=ROUNDABOUT,Rp=R.roadOuter+3,V2=(x:number,z:number)=>({x,z});
  // Arms: the road's end cross-section (the ribbon's last/first sample) and the outward direction along the road.
  const arms=[{p:P[iW],out:{x:-P[iW].tx,z:-P[iW].tz}},{p:P[iE],out:{x:P[iE].tx,z:P[iE].tz}}].map(({p,out})=>{
   const ang=Math.atan2(p.z-R.z,p.x-R.x),gap=Math.hypot(p.x-R.x,p.z-R.z);
   // Edge points at ±w (the ribbon's own offsetPoint, so the seam is shared exactly), ordered by angle round the ring.
   const edge=(w:number)=>{const a=offsetPoint(p,w),b=offsetPoint(p,-w),aa=Math.atan2(a.z-R.z,a.x-R.x),ba=Math.atan2(b.z-R.z,b.x-R.x);return Math.atan2(Math.sin(aa-ba),Math.cos(aa-ba))<0?[a,b]:[b,a];};
   const fillet=(from:{x:number;z:number},to:{x:number;z:number},back:number,n=10)=>{const k={x:to.x-out.x*back*.75,z:to.z-out.z*back*.75};return Array.from({length:n+1},(_,i)=>{const u=i/n,v=1-u;return V2(v*v*from.x+2*v*u*k.x+u*u*to.x,v*v*from.z+2*v*u*k.z+u*u*to.z);});};
   const circ=(r:number,a:number)=>V2(R.x+Math.cos(a)*r,R.z+Math.sin(a)*r);
   const fa=Math.asin(4/R.roadOuter)+.32,fp=Math.asin(7/Rp)+.32,[aLo,aHi]=edge(4),[pLo,pHi]=edge(7);
   return {ang,lo:ang-fa,hi:ang+fa,plo:ang-fp,phi:ang+fp,
    asLo:fillet(circ(R.roadOuter,ang-fa),aLo,gap-R.roadOuter),asHi:fillet(circ(R.roadOuter,ang+fa),aHi,gap-R.roadOuter),
    pvLo:fillet(circ(Rp,ang-fp),pLo,gap-Rp),pvHi:fillet(circ(Rp,ang+fp),pHi,gap-Rp),p,out};
  }).sort((a,b)=>a.ang-b.ang);
  const arc=(r:number,a0:number,a1:number,n=18)=>{while(a1<a0)a1+=Math.PI*2;return Array.from({length:n+1},(_,i)=>V2(R.x+Math.cos(a0+(a1-a0)*i/n)*r,R.z+Math.sin(a0+(a1-a0)*i/n)*r));};
  // One continuous asphalt surface: the ring plus both arm flares (curved entry/exit radii), the island as a hole.
  const outline:{x:number;z:number}[]=[];
  arms.forEach((m,k)=>{const next=arms[(k+1)%arms.length];
   outline.push(...m.asLo);                          // circle (lo angle) → road edge (lo side)
   outline.push(...m.asHi.slice().reverse());        // road edge (hi side) → circle (hi angle)
   outline.push(...arc(R.roadOuter,m.hi,next.lo).slice(1,-1));});
  const shape=new T.Shape();outline.forEach((q,i)=>{const x=q.x-R.x,y=-(q.z-R.z);i?shape.lineTo(x,y):shape.moveTo(x,y);});shape.closePath();
  const hole=new T.Path();hole.absarc(0,0,R.roadInner,0,Math.PI*2,true);shape.holes.push(hole);
  {const g=new T.ShapeGeometry(shape,24);g.rotateX(-Math.PI/2);flat(put(g,'#737c75',R.x,-.01,R.z));}
  // Pavement: fillet strips between the asphalt and pavement fillets, and sectors between the arms (same sample counts).
  const quadStrip=(inner:{x:number;z:number}[],outer:{x:number;z:number}[],color:string,y:number)=>{const positions:number[]=[],indices:number[]=[];
   inner.forEach((q,i)=>{const o=outer[i];positions.push(q.x-R.x,y,q.z-R.z,o.x-R.x,y,o.z-R.z);if(i<inner.length-1){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}});
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
   if(g.getAttribute('normal').getY(0)<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);g.computeVertexNormals();}
   flat(put(g,color,R.x,0,R.z));};
  arms.forEach((m,k)=>{const next=arms[(k+1)%arms.length];quadStrip(m.asLo,m.pvLo,'#eddfbb',-.02);quadStrip(m.asHi,m.pvHi,'#eddfbb',-.02);
   let a1=next.lo,b1=next.plo;while(a1<m.hi)a1+=Math.PI*2;while(b1<m.phi)b1+=Math.PI*2;
   quadStrip(Array.from({length:25},(_,i)=>V2(R.x+Math.cos(m.hi+(a1-m.hi)*i/24)*R.roadOuter,R.z+Math.sin(m.hi+(a1-m.hi)*i/24)*R.roadOuter)),Array.from({length:25},(_,i)=>V2(R.x+Math.cos(m.phi+(b1-m.phi)*i/24)*Rp,R.z+Math.sin(m.phi+(b1-m.phi)*i/24)*Rp)),'#eddfbb',-.02);});
  // Markings: dashed island edge; the outer edge line breaks cleanly across each arm opening; give-way dashes where each
  // arm meets the ring (entering lane only); a zebra crossing a few metres back on each arm, fully on asphalt.
  for(let k=0;k<40;k+=2){const a0=k/40*Math.PI*2,a1=(k+1)/40*Math.PI*2,g=new T.RingGeometry(R.roadInner+.15,R.roadInner+.3,4,1,a0,a1-a0);g.rotateX(-Math.PI/2);flat(put(g,'#e6d7b5',R.x,.004,R.z));}
  arms.forEach((m,k)=>{const next=arms[(k+1)%arms.length];let a1=next.lo-.12,a0=m.hi+.12;while(a1<a0)a1+=Math.PI*2;
   // RingGeometry angles run anticlockwise in its own plane; after rotateX(-π/2) world angle θ maps to -θ.
   const g=new T.RingGeometry(R.roadOuter-.3,R.roadOuter-.15,24,1,-a1,a1-a0);g.rotateX(-Math.PI/2);flat(put(g,'#e6d7b5',R.x,.004,R.z));
   // Entering traffic drives toward the ring (-out); its lane is on its right: (out.z, -out.x) in this road's convention.
   const ax=Math.cos(m.ang),az=Math.sin(m.ang),rx=m.out.z,rz=-m.out.x,yaw=Math.atan2(m.out.x,m.out.z);
   for(let d=.5;d<=3.7;d+=.8){const q=V2(R.x+ax*(R.roadOuter+.45)+rx*d,R.z+az*(R.roadOuter+.45)+rz*d);const dash=box(.5,.012,.18,'#f5eed5',q.x,.012,q.z);dash.rotation.y=yaw+Math.PI/2;}
   const zp=P.reduce((b,q)=>Math.abs(Math.hypot(q.x-R.x,q.z-R.z)-(R.roadOuter+3.2))<Math.abs(Math.hypot(b.x-R.x,b.z-R.z)-(R.roadOuter+3.2))&&(q.x-R.x)*ax+(q.z-R.z)*az>0?q:b,m.p);
   for(let n=-3;n<=3;n+=1.5){const q=offsetPoint(zp,n);const stripe=box(1.6,.009,.65,'#f5eed5',q.x,.01,q.z);stripe.rotation.y=-Math.atan2(zp.tz,zp.tx);}});
  // Central island: kerb, lawn, a palm and a beach-soccer ball on a plinth (a nod to the court up the road).
  cylinder(R.island,.3,'#d2bc94',R.x,.12,R.z);const lawn=new T.CircleGeometry(R.island-.35,32);lawn.rotateX(-Math.PI/2);flat(put(lawn,'#739568',R.x,.285,R.z));
  palm(R.x-2,R.z-1.5,6.2);for(let k=0;k<6;k++){const a=k*1.05,b=put(new T.IcosahedronGeometry(.4,0),k%2?'#c2458f':'#f4cc7c',R.x+Math.cos(a)*4.6,.55,R.z+Math.sin(a)*4.6);b.scale.y=.7;}
  box(1.6,.9,1.6,'#eddfbb',R.x+2,.75,R.z+1.2);const ball=put(new T.IcosahedronGeometry(1.1,1),'#f4edd3',R.x+2,2.3,R.z+1.2);ball.userData.skipRoofObstacle=true;
  for(const [dx,dy,dz] of [[0,1,0],[1,.2,.3],[-.8,.3,.6],[.3,.4,-1],[-.5,-.2,-.8]] as [number,number,number][]){const l=Math.hypot(dx,dy,dz),patch=put(new T.IcosahedronGeometry(.34,0),'#294f43',R.x+2+dx/l*1.02,2.3+dy/l*1.02,R.z+1.2+dz/l*1.02);patch.scale.set(1,.35,1);}
  obstacles.push({x:R.x,z:R.z,w:R.island*2,d:R.island*2,cornerRadius:R.island});}
 // ---- Coral Cay Konbini (Sep 29 2026): Island Square's convenience store, again, facing the roundabout. Same recipe
 // (sign style, glazed front, sliding doors, stripe fascia, flat canopy) but its own beach look (user: "vary slightly"):
 // sun-bleached pastel stripes, a scalloped seafoam awning with a timber-and-thatch canopy edge, a surfboard rack, potted
 // tropical plants by the door, a bench and a chalkboard. The doors (CAY_KONBINI_DOOR) and 3 m in front stay clear.
 {const K=CAY_KONBINI,x=K.x,z=K.front-K.d/2,front=K.front;
  path(x,front+2,K.w+2,4);
  box(K.w,4.3,K.d,'#f1ecdd',x,2.15,z);box(K.w+.5,.22,K.d+.6,'#dde4dc',x,4.41,z);
  box(K.w+.5,.12,1.7,'#fff4dc',x,3.35,front+.55);box(K.w+.5,.9,1.15,'#fff4dc',x,3.9,front+.35);
  for(const [y,h,c] of [[4.18,.13,'#f0b49a'],[4.03,.1,'#f4d98f'],[3.85,.2,'#8fcfc0']] as const){box(K.w+.54,h,.06,c,x,y,front+.96);for(const side of [-1,1])box(.06,h,K.d+.6,c,x+side*(K.w/2+.26),y,z+.25);}
  sign('KONBINI',3.15,.66,x-.3,3.95,front+1.01,'#fff7e5','#3f8f6c');
  // Timber canopy edge with a short thatch fringe, then a scalloped seafoam-and-cream awning over the two windows.
  box(K.w+.6,.16,.18,'#9d805b',x,3.26,front+1.38);const fringe=box(K.w+.7,.2,.42,'#d7ad62',x,3.12,front+1.5);fringe.castShadow=false;
  for(const wx of [x-3.4,x+2.8])for(let i=0;i<6;i++){const flap=box(.42,.34,.05,i%2?'#fff4dc':'#8fcfc0',wx-1.05+i*.42,2.9,front+.55);flap.rotation.x=.35;flap.castShadow=false;}
  box(K.w-.6,2.6,.08,'#284e50',x,1.85,front+.04);
  for(const wx of [x-3.4,x+2.8]){box(2.4,2.1,.07,'#759f98',wx,1.75,front+.09);for(const y of [.9,1.5,2.1]){box(2.25,.08,.13,'#eee9d8',wx,y,front+.17);for(let i=0;i<5;i++)box(.24,.3,.08,['#f3d88e','#e2856a','#9fd0b4'][i%3],wx-.96+i*.46,y+.19,front+.14);}}
  const door=CAY_KONBINI_DOOR.x;for(const side of [-1,1]){box(.86,2.55,.08,'#87b1ad',door+side*.46,1.5,front+.22);box(.035,2.6,.06,'#e8e7d5',door+side*.92,1.5,front+.28);}
  box(.04,2.6,.06,'#e8e7d5',door,1.5,front+.28);box(2.15,.07,.75,'#879b92',door,.04,front+.35);
  for(const side of [-1,1])box(.18,3.1,.22,'#eee9d8',x+side*(K.w/2-.2),1.6,front+.14);
  sign('CORAL CAY',1.8,.5,x+2.8,2.55,front+.23,'#fff4dc','#3f8f6c');
  box(1.8,.6,1.3,'#bac5bc',x+2.4,4.85,z-2);
  palm(x-K.w/2-2,front-1.5,6);planter(x+K.w/2+2.8,front+1.4);// 1 m further east: clear of the drinks machine (Sep 29 2026)
  // A potted tropical plant west of the doors (outside the door's 2.2 m clearance). The east one was dropped when the
  // snack + drinks machines moved in flush beside the doors (Sep 29 2026).
  for(const px of [door-2.25]){cylinder(.34,.55,'#bd7657',px,.27,front+.6);for(let k=0;k<4;k++){const leaf=put(new T.IcosahedronGeometry(.34,0),k%2?'#3f7a4f':'#5b895e',px+Math.cos(k*1.6)*.22,.85+(k%2)*.22,front+.6+Math.sin(k*1.6)*.22);leaf.scale.set(1,.55,1.5);leaf.rotation.y=k*1.6;}obstacles.push({x:px,z:front+.6,w:.7,d:.7});}
  // Bench in front of the west window, facing the roundabout.
  {const bx=x-3.4,bz=front+2.2;box(2.2,.1,.55,'#a67d55',bx,.48,bz);box(2.2,.45,.08,'#a67d55',bx,.78,bz-.25);for(const ex of [-.9,.9])box(.1,.45,.5,'#385a4e',bx+ex,.23,bz);obstacles.push({x:bx,z:bz,w:2.2,d:.7});}
  // Chalkboard A-frame at the east corner, past the drinks machine (clear of the machines' buying spots): the day's refuel pick.
  {const cx=x+K.w/2+.7,cz=front+1.6;for(const dz of [-.16,.16]){const leg=box(.72,1.05,.05,'#384443',cx,.5,cz+dz);leg.rotation.x=dz>0?-.28:.28;}
   sign('WATER + FRUIT',.6,.34,cx,.62,cz+.33,'#384443','#fff4dc');obstacles.push({x:cx,z:cz,w:.8,d:.6});}
  // Surfboard rack against the west wall.
  {const rx=x-K.w/2-.55,rz=front-2.6;box(.14,1.1,3.2,'#9d805b',rx-.3,.55,rz);for(let i=0;i<3;i++){const b=box(.08,2.2,.58,['#8fcfc0','#f0b49a','#f4d98f'][i],rx,1.1,rz-1+i*1);b.rotation.z=-.16;}obstacles.push({x:rx-.1,z:rz,w:.9,d:3.2});}
  buildings.push({x,z,w:K.w,d:K.d,height:4.52,name:'CORAL CAY KONBINI'});obstacles.push({x,z,w:K.w,d:K.d});}
 // ---- Shared beach props.
 function umbrella(x:number,z:number,i:number){
  assets.push({kind:'beach-umbrella',x,z,w:.25,d:.25,visualW:4.2,visualD:4.2});
  cylinder(.055,2.7,'#9d805b',x,1.35,z);const canopy=put(new T.ConeGeometry(2.1,.7,10),i%2?'#477c6a':'#bd7657',x,2.8,z);canopy.rotation.y=i*.4;
  const targets:Mesh[]=[];canopy.userData.umbrellaTargets=targets;obstacles.push({x,z,w:.25,d:.25});
  for(const dx of [-1.1,1.1]){targets.push(box(.8,.18,2.2,'#eddfbb',x+dx,.12,z+1.2));const back=box(.8,.1,.75,i%2?'#589aa0':'#c8734f',x+dx,.38,z+.4);back.rotation.x=-.55;targets.push(back);obstacles.push({x:x+dx,z:z+1,w:.8,d:2.5});}
  const towel=box(1.1,.015,1.7,i%2?'#d69b61':'#8b9e6b',x+3,.008,z+1);towel.rotation.y=.15*i;targets.push(towel);
 }
 function lifeguardChair(x:number,z:number){
  for(const dx of [-1,1])for(const dz of [-1,1])line(V(x+dx*1.05,0,z+dz*1.05),V(x+dx*.7,2.2,z+dz*.7),.07,'#9d805b');
  box(1.7,.14,1.7,'#eddfbb',x,2.27,z);box(1.7,.9,.12,'#bd7657',x,2.8,z-.8);
  for(const y of [.55,1.1,1.65])box(1.35,.07,.07,'#9d805b',x,y,z+.95+(2.2-y)*.16);
  cylinder(.05,1.7,'#9d805b',x+.7,3.1,z-.7);box(2.3,.08,2.3,'#eddfbb',x,3.95,z);
  box(.04,.34,.5,'#d9534a',x+.7,3.7,z-.45);
  obstacles.push({x,z,w:2.4,d:2.4});
 }
 function star(x:number,z:number,r:number,yaw:number){
  const s=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,rr=i%2?r*.42:r;i?s.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):s.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}s.closePath();
  const g=new T.ShapeGeometry(s);g.rotateX(-Math.PI/2);const m=flat(put(g,'#d69b61',x,-.035,z));m.rotation.y=yaw;
 }
 function teachingBoard(text:string,x:number,z:number,w=7.4){
  box(w+.2,.8,.14,'#9d805b',x,1.8,z);for(const dx of [-w/2+.3,w/2-.3])cylinder(.075,2.15,'#9d805b',x+dx,1.075,z);
  sign(text,w,.65,x,1.8,z+.08,'#477c6a');obstacles.push({x,z,w:w+.2,d:.3});
 }
 /** Name board on two posts over a spur entrance, clear of the spur rails. */
 function postSign(text:string,x:number,z:number){box(6.3,.7,.12,'#294f43',x,2.2,z);for(const dx of [-3.1,3.1]){cylinder(.07,2.5,'#9d805b',x+dx,1.25,z);obstacles.push({x:x+dx,z,w:.2,d:.2});}sign(text,6,.55,x,2.2,z+.07,'#294f43','#f4cc7c');}
 /** Flat outline slab (built relative to its centre) — the sandbars' irregular sand and wet rim. */
 function outlineSlab(points:{x:number;z:number}[],cx:number,cz:number,scale:number,top:number,depth:number,color:string){
  const shape=new T.Shape();points.forEach((p,i)=>{const x=(p.x-cx)*scale,z=-(p.z-cz)*scale;i?shape.lineTo(x,z):shape.moveTo(x,z);});shape.closePath();
  const m=flat(put(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1}),color,cx,top-depth,cz));m.rotation.x=-Math.PI/2;return m;
 }
 /** Soft shoreline round a star-shaped outline (sandbars, the cay): a wet-sand skirt sloping into the sea, a foam line
  *  where it meets the water and two shallow-water tints, offset along each point's outward radial direction. One mesh
  *  per band, built relative to the centre. */
 function shoreRings(points:{x:number;z:number}[],cx:number,cz:number,topY:number,skirt=2.6){
  const n=points.length,dirs=points.map(p=>{const dx=p.x-cx,dz=p.z-cz,l=Math.hypot(dx,dz)||1;return {x:dx/l,z:dz/l};});
  const ring=(d0:(i:number)=>number,d1:(i:number)=>number,y0:number,y1:number,color:string)=>{const positions:number[]=[],indices:number[]=[];
   for(let i=0;i<n;i++){const p=points[i],d=dirs[i];positions.push(p.x-cx+d.x*d0(i),y0,p.z-cz+d.z*d0(i),p.x-cx+d.x*d1(i),y1,p.z-cz+d.z*d1(i));const a=i*2,b=((i+1)%n)*2;indices.push(a,b,a+1,b,b+1,a+1);}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
   if(g.getAttribute('normal').getY(0)<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);g.computeVertexNormals();}
   flat(put(g,color,cx,0,cz));};
  const w=(i:number,k:number)=>.35*Math.sin(i*.9+k)+.25*Math.sin(i*2.3+k*2),edge=skirt*(.43+topY)/(.47+topY)*.97;
  ring(()=>0,()=>skirt,topY,-.47,'#dfc99e');
  ring(()=>edge-.25,i=>edge+.3+w(i,1)*.3,-.405,-.405,'#f5e9cb');
  shallows(fadeBand(points,dirs,edge,5.2,true,cx,cz),cx,cz);
 }
 /** A prop spot on the sandbar: the requested offset, pulled toward the centre until it stands on walkable sand. */
 const onBar=(s:Sandbar,dx:number,dz:number,margin=0)=>{for(let k=1;k>.2;k-=.05){const x=s.x+dx*k,z=s.z+dz*k;if([[0,0],[margin,0],[-margin,0],[0,margin],[0,-margin]].every(([a,b])=>onSandbarStop(x+a,z+b)))return {x,z};}return {x:s.x,z:s.z};};

 // ---- Sandbar stops at the two bends: boardwalk spur through the rail gap, irregular sand, shade and a teaching sign.
 function sandbar(s:Sandbar,index:number){
  outlineSlab(s.outline,s.x,s.z,1,-.05,.45,'#f1d6a1');
  shoreRings(s.outline,s.x,s.z,-.05);
  surfaceAreas.push({kind:'sand',x:s.x,z:s.z,w:s.radius*2,d:s.radius*2});
  const zRail=s.spur.roadZ+s.side*CAUSEWAY.railHalf,zSand=s.side<0?s.spur.z0+1:s.spur.z1-1,len=Math.abs(zSand-zRail),zc=(zRail+zSand)/2;
  box(4,.2,len,'#b98f62',s.spur.x,-.1,zc);for(let d=.3;d<len;d+=.6)box(3.8,.008,.025,'#91704d',s.spur.x,.004,Math.min(zRail,zSand)+d);
  for(const side of [-1,1]){const x=s.spur.x+side*2;line(V(x,1.05,zRail),V(x,1.05,zSand),.045,'#eddfbb');const n=Math.round(len/3);for(let i=0;i<=n;i++){const z=zRail+(zSand-zRail)*i/n;cylinder(.065,1.05,'#9d805b',x,.525,z);cylinder(.12,1.2,'#9d805b',x,-.75,z);}}
  const far=-s.side; // Away from the road.
  for(const [dx,dz,h] of [[-10,far*3,5.8],[11,far*-2,5.2]] as [number,number,number][]){const p=onBar(s,dx,dz,1);palm(p.x,p.z,h);}
  {const p=onBar(s,index?-6:2,far*(index?4:4),3.5);umbrella(p.x,p.z,index);}
  for(let i=0;i<7;i++){const k=Math.floor(i*s.outline.length/7),o=s.outline[k],rock=put(new T.IcosahedronGeometry(.25+jitter(i,index)*.25,0),'#d2bc94',s.x+(o.x-s.x)*.9,-.05,s.z+(o.z-s.z)*.9);rock.scale.y=.55;}
  for(let i=0;i<3;i++){const p=onBar(s,-4+i*1.7,far*7-i*.4);star(p.x,p.z,.28+i*.04,i);}
 }
 sandbar(SANDBARS[0],0);sandbar(SANDBARS[1],1);
 // Starfish Sandbar: the barefoot stop (lifeguard lookout). Turtle Sandbar: restarts (kick-in or throw-in).
 {const s=SANDBARS[0],far=-s.side;{const p=onBar(s,6,far*6,1.5);lifeguardChair(p.x,p.z);}{const p=onBar(s,-7,-far*3.5,4);teachingBoard('BEACH SOCCER · PLAY BAREFOOT',p.x,p.z);}postSign('STARFISH SANDBAR',s.spur.x,s.spur.roadZ+s.side*(CAUSEWAY.railHalf+.5));}
 {const s=SANDBARS[1],far=-s.side;{const p=onBar(s,4,-far*6,4.5);teachingBoard('KICK-IN OR THROW-IN: YOUR CHOICE',p.x,p.z,8.4);}
  // A small practice goal on the sand for kick-ins toward a teammate.
  const g=onBar(s,-9,-far*4,2),gx=g.x,gz=g.z;for(const dx of [-1,1])box(.09,1.2,.09,'#fff1d3',gx+dx*1.2,.6,gz);box(2.5,.09,.09,'#fff1d3',gx,1.2,gz);for(let dx=-1.1;dx<=1.11;dx+=.275)box(.02,1.15,.02,'#c3d1b9',gx+dx,.6,gz-.6).castShadow=false;obstacles.push({x:gx,z:gz-.3,w:2.6,d:.8});
  postSign('TURTLE SANDBAR',s.spur.x,s.spur.roadZ+s.side*(CAUSEWAY.railHalf+.9));}

 // ---- The cay: foundation, an uneven sand ring (beach all round) and the lawn. Geometry is built relative to the cay
 // centre and placed there, so the three big surfaces sit in the cay's own chunk (never inflating a main-island batch).
 const C=CAY_CENTER;
 {const outline=new T.Shape();CAY_SHORE.forEach((p,i)=>i?outline.lineTo(p.x-C.x,-(p.z-C.z)):outline.moveTo(p.x-C.x,-(p.z-C.z)));outline.closePath();
  const land=flat(put(new T.ExtrudeGeometry(outline,{depth:.64,bevelEnabled:false,steps:1}),'#dfc99e',C.x,-.82,C.z));land.rotation.x=-Math.PI/2;land.name='coral-cay-foundation';}
 {const positions:number[]=[],indices:number[]=[];
  CAY_SAND.forEach((s,i)=>{positions.push(s.outer.x-C.x,-.105,s.outer.z-C.z,s.inner.x-C.x,-.105,s.inner.z-C.z);const a=i*2,b=((i+1)%CAY_SAND.length)*2;indices.push(a,b,a+1,b,b+1,a+1);});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
  if(g.getAttribute('normal').getY(0)<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);g.computeVertexNormals();}
  const sand=flat(put(g,'#f1d6a1',C.x,0,C.z));sand.name='coral-cay-sand';}
 {const lawnShape=new T.Shape();CAY_LAWN.forEach((p,i)=>i?lawnShape.lineTo(p.x-C.x,-(p.z-C.z)):lawnShape.moveTo(p.x-C.x,-(p.z-C.z)));lawnShape.closePath();
  const g=new T.ShapeGeometry(lawnShape);g.rotateX(-Math.PI/2);const lawn=flat(put(g,INTERIOR_GRASS_COLOR,C.x,-.112,C.z));lawn.name='coral-cay-lawn';}
 // A soft coast all round: wet sand sloping into the sea, the main coast's pale waterline colour as foam, and shallows.
 shoreRings(CAY_SHORE,C.x,C.z,-.11,3);

 // ---- Village: boulevard, plaza and a row of shops facing the road (house() fronts face +z, like the main island).
 CAY_HOUSES.forEach(([x,z,w,d,h,label],i)=>house(x,z,w,d,h,label,[2,0,1,3][i]));
 for(let i=0,x=CAY_BOULEVARD.x0+36;x<CAY_BOULEVARD.x1-4;x+=24,i++)lamp(x,z0+(i%2?1:-1)*6.8,-.1);
 path(CAY_PLAZA.x,CAY_PLAZA.z,CAY_PLAZA.w,CAY_PLAZA.d);
 for(const side of [-1,1])box(CAY_PLAZA.w,.12,.22,'#d2bc94',CAY_PLAZA.x,-.03,CAY_PLAZA.z+side*CAY_PLAZA.d/2);
 for(let x=CAY_PLAZA.x-CAY_PLAZA.w/2+3;x<CAY_PLAZA.x+CAY_PLAZA.w/2;x+=3)box(.035,.008,CAY_PLAZA.d-.4,'#d2bc94',x,-.03,CAY_PLAZA.z);
 // A ring of palms around a planted centre; tables and planters at the edges keep the crossing open.
 cylinder(3,.5,'#d2bc94',CAY_PLAZA.x+4,.2,CAY_PLAZA.z-6);put(new T.IcosahedronGeometry(1.6,0),'#739568',CAY_PLAZA.x+4,1,CAY_PLAZA.z-6);obstacles.push({x:CAY_PLAZA.x+4,z:CAY_PLAZA.z-6,w:6,d:6,cornerRadius:3});
 palm(CAY_PLAZA.x+4,CAY_PLAZA.z-6,6.4);
 for(const [x,z] of [[CAY_PLAZA.x-9,CAY_PLAZA.z+10],[CAY_PLAZA.x+9,CAY_PLAZA.z+10]])palm(x,z,6);
 table(CAY_PLAZA.x-8,CAY_PLAZA.z-9);table(CAY_PLAZA.x+10,CAY_PLAZA.z+3);planter(CAY_PLAZA.x-11,CAY_PLAZA.z-13);planter(CAY_PLAZA.x+11,CAY_PLAZA.z-13);
 for(let i=0;i<3;i++)lamp(CAY_PLAZA.x-12+i*12,CAY_PLAZA.z+13.5,-.03);
 // Café terrace tables and surfboards leaning outside the surf shop.
 {const [cx,cz,,cd]=CAY_HOUSES[0];for(const dx of [-5,4])table(cx+dx,cz+cd/2+4.4);}
 {const [sx,sz,,sd]=CAY_HOUSES[1];['#589aa0','#f4cc7c','#bd7657'].forEach((c,i)=>{const board=box(.62,2.3,.09,c,sx+3+i*.85,1.12,sz+sd/2+.35);board.rotation.x=-.18;board.rotation.z=(i-1)*.05;});obstacles.push({x:sx+3.85,z:sz+sd/2+.45,w:2.6,d:.6});}
 // Paths: plaza → court, road → huts, plaza → south beach.
 path(628,z0,48,3);path(CAY_HUTS[1].x,-146.5,3,13);path(CAY_HUTS[0].x,-144.6,3,6.2);path(CAY_HUTS[2].x,-147,3,11);path(CAY_PLAZA.x,-117,3,54);
 // Thatched huts: stucco drum, dark door, straw cone roof. Obstacles only (the cone is not a landing roof).
 CAY_HUTS.forEach((h,i)=>{
  cylinder(CAY_HUT_RADIUS-.35,2.6,i%2?'#e2c69a':'#d6b58a',h.x,1.3,h.z);box(1.05,1.9,.12,'#365b56',h.x,.95,h.z+CAY_HUT_RADIUS-.37);
  cylinder(CAY_HUT_RADIUS+.55,.22,'#b9955a',h.x,2.62,h.z);put(new T.ConeGeometry(CAY_HUT_RADIUS+.75,1.9,10),i%2?'#d7ad62':'#d69b61',h.x,3.65,h.z);
  obstacles.push({x:h.x,z:h.z,w:CAY_HUT_RADIUS*2-.5,d:CAY_HUT_RADIUS*2-.5,cornerRadius:CAY_HUT_RADIUS-.25});
  assets.push({kind:'hut',x:h.x,z:h.z,w:CAY_HUT_RADIUS*2-.5,d:CAY_HUT_RADIUS*2-.5,visualW:CAY_HUT_RADIUS*2+1.5,visualD:CAY_HUT_RADIUS*2+1.5,canopyHeight:4.6});
 });

 // ---- Beach soccer court (FIFA Beach Soccer Laws 2024-25, Law 1): 36 × 27 m sand pitch; 10 cm tape lines, preferably
 // blue; no line between the goalposts; red flags at the corners and both ends of the halfway line, yellow flags where
 // the imaginary penalty-area line (9 m) meets each touchline; goals 5.5 m wide × 2.2 m high.
 const K=BEACH_COURT,halfL=K.length/2,halfW=K.width/2,blue='#4a8bb0';
 // No sand box on a lawn: the court sits on COURT_BEACH, one organic sand surface that runs east into the beach ring
 // (same sand colour, a hair under the ring so the overlap never shows). Built relative to the cay centre (cay chunk).
 {const shape=new T.Shape();COURT_BEACH.forEach((p,i)=>i?shape.lineTo(p.x-C.x,-(p.z-C.z)):shape.moveTo(p.x-C.x,-(p.z-C.z)));shape.closePath();
  const g=new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);flat(put(g,'#f1d6a1',C.x,-.108,C.z)).name='beach-court-sand';}
 surfaceAreas.push({kind:'sand',x:K.x,z:K.z,w:K.length+16,d:K.width+13});assets.push({kind:'beach-soccer-court',x:K.x,z:K.z,w:K.length,d:K.width});
 for(const side of [-1,1])box(K.length,.014,.1,blue,K.x,-.095,K.z+side*halfW);
 for(const end of [-1,1])for(const side of [-1,1]){const inner=K.goalWidth/2,len=halfW-inner;box(.1,.014,len,blue,K.x+end*halfL,-.095,K.z+side*(inner+len/2));}
 // Five-metre substitution zone in front of the team benches (Law 3: rolling substitutions through this zone).
 for(const dx of [-2.5,2.5])box(.1,.014,1.2,blue,K.x+dx,-.095,K.z+halfW+.6);
 const flag=(x:number,z:number,color:string)=>{cylinder(.03,1.5,'#eddfbb',x,.75,z);box(.02,.34,.5,color,x,1.33,z+.26);obstacles.push({x,z,w:.12,d:.12});};
 for(const sx of [-1,1])for(const sz of [-1,1])flag(K.x+sx*(halfL+.8),K.z+sz*(halfW+.8),'#d9534a');
 for(const sz of [-1,1]){flag(K.x,K.z+sz*(halfW+1),'#d9534a');for(const sx of [-1,1])flag(K.x+sx*(halfL-K.penalty),K.z+sz*(halfW+1),'#f4cc7c');}
 // Goals: posts and bar on the goal line, shallow nets behind (same build as the pocket futsal court's goals).
 for(const end of [-1,1]){
  const gx=K.x+end*halfL,back=gx+end*1.5,gw=K.goalWidth/2,h=K.goalHeight;
  for(const side of [-1,1]){box(.12,h,.12,'#fff1d3',gx,h/2,K.z+side*gw);box(1.5,.07,.07,'#fff1d3',(gx+back)/2,h,K.z+side*gw);box(1.5,.07,.07,'#fff1d3',(gx+back)/2,.06,K.z+side*gw);}
  box(.12,.12,K.goalWidth+.12,'#fff1d3',gx,h,K.z);box(.07,.07,K.goalWidth,'#fff1d3',back,h*.55,K.z);
  for(let y=.2;y<=h;y+=.3)box(.022,.022,K.goalWidth,'#c3d1b9',back,y,K.z).castShadow=false;
  for(let z=-gw;z<=gw+.01;z+=.3){box(.022,h,.022,'#c3d1b9',back,h/2,K.z+z).castShadow=false;box(1.5,.022,.022,'#c3d1b9',(gx+back)/2,h,K.z+z).castShadow=false;}
  for(const o of [{x:(gx+back)/2,z:K.z-gw,w:1.5,d:.14},{x:(gx+back)/2,z:K.z+gw,w:1.5,d:.14},{x:back,z:K.z,w:.14,d:K.goalWidth}])obstacles.push(o);
 }
 // Team benches face the pitch behind the substitution zone; low bleachers beyond them.
 for(const dx of [-6,6]){const x=K.x+dx,z=K.z+halfW+3.4;box(4,.12,.65,'#a67d55',x,.55,z);box(4,.5,.09,'#a67d55',x,.9,z+.28);for(const ex of [-1.5,1.5])box(.13,.5,.5,'#385a4e',x+ex,.26,z);obstacles.push({x,z,w:4,d:.8});}
 for(let row=0;row<3;row++){const h=.4+row*.4,z=K.z+halfW+7.2+row;box(24,h,.95,'#d2bc94',K.x,h/2,z);for(let x=K.x-11.5;x<=K.x+11.5;x+=1)box(.7,.1,.7,'#477c6a',x,h+.05,z);}
 obstacles.push({x:K.x,z:K.z+halfW+8.2,w:24,d:3});
 // Court scoreboard (it replaced the Beach Soccer Club building, removed at the user's request): a sturdy stucco wall
 // behind the boards, its dark score panel facing the pitch (a ball-hunt target mounts high on its east half).
 {const S=COURT_SCOREBOARD;box(S.w,S.h,S.d,'#d6b58a',S.x,S.h/2,S.z);box(S.w+.3,.25,S.d+.3,'#eddfbb',S.x,S.h+.1,S.z);
  box(S.w-1.2,1.9,.08,'#294f43',S.x,2.35,S.front+.02);sign('SHARKS BEACH COURT',S.w-1.6,.55,S.x,5.1,S.front+.05,'#477c6a','#f4cc7c');
  sign('HOME  0 – 0  AWAY',S.w-2,.7,S.x,2.7,S.front+.08,'#294f43','#f4cc7c');sign('PERIOD 1 · 12:00',S.w-3.4,.45,S.x,1.85,S.front+.08,'#294f43','#eddfbb');
  obstacles.push({x:S.x,z:S.z,w:S.w,d:S.d});assets.push({kind:'scoreboard',x:S.x,z:S.z,w:S.w,d:S.d,visualW:S.w+.3,visualD:S.d+.3});}
 umbrella(BEACH_COURT.x+7,COURT_SCOREBOARD.z-8,3);palm(BEACH_COURT.x-6,COURT_SCOREBOARD.z-9,5.8);
 // The three rules boards on the court's north side were removed (user, Sep 29 2026): the court islanders and the live
 // match commentary teach the format. The lane to the scoreboard's east half stays clear (a ball-hunt target is mounted there).
 for(const dx of [-17,17])palm(K.x+dx,K.z-halfW-11,6.2);

 // ---- Coral Cay Farm (south of the court): fuel for football. Every plant and prop is a plain palette mesh, so the
 // whole farm merges into the existing 50 m paint batches (a handful of draws); crops are very low-poly and never move.
 {const F=FARM,rnd=(i:number,k:number)=>jitter(i,k);
  const flatBox=(w:number,d:number,color:string,x:number,y:number,z:number)=>flat(box(w,.06,d,color,x,y,z));
  // Soil: one tilled field bed, its rows merged into a single geometry.
  flatBox(F.crops.x1-F.crops.x0+2,-89-(-129)-2,'#6e5540',(F.crops.x0+F.crops.x1)/2,-.07,-109);
  {const rows:T.BufferGeometry[]=[],cx=(F.crops.x0+F.crops.x1)/2,gap=F.beachTrack.w/2+.4;for(let z=-127.2;z<=-90.6;z+=1.4){if(Math.abs(z-F.track.z)<1.6)continue;
    // Each row stops either side of the beach track's aisle.
    for(const [a,b] of [[F.crops.x0,F.beachTrack.x-gap],[F.beachTrack.x+gap,F.crops.x1]]){const g=new T.BoxGeometry(b-a,.12,.7);g.translate((a+b)/2-cx,0,z+109);rows.push(g);}}
   const merged=mergeRows(rows);rows.forEach(g=>g.dispose());flat(put(merged,'#8b6a4a',(F.crops.x0+F.crops.x1)/2,-.02,-109));}
  flatBox(F.orchard.x1-F.orchard.x0+4,F.orchard.z1-F.orchard.z0+4,'#7a9e67',(F.orchard.x0+F.orchard.x1)/2,-.08,(F.orchard.z0+F.orchard.z1)/2);
  flatBox(F.pineapples.x1-F.pineapples.x0+1,F.pineapples.z1-F.pineapples.z0+1,'#8b6a4a',(F.pineapples.x0+F.pineapples.x1)/2,-.07,(F.pineapples.z0+F.pineapples.z1)/2);
  flatBox(F.melons.x1-F.melons.x0+1,F.melons.z1-F.melons.z0+1,'#8b6a4a',(F.melons.x0+F.melons.x1)/2,-.07,(F.melons.z0+F.melons.z1)/2);
  // Dirt tracks: path gate → across the farm, and a branch to the beach gate.
  flatBox(F.track.x1-F.track.x0,F.track.w,'#c9a878',(F.track.x0+F.track.x1)/2,-.06,F.track.z);
  flatBox(F.beachTrack.w,F.beachTrack.z1-F.beachTrack.z0,'#c9a878',F.beachTrack.x,-.06,(F.beachTrack.z0+F.beachTrack.z1)/2);
  surfaceAreas.push({kind:'farm',x:(F.fence[0].x+F.fence[1].x)/2,z:-109,w:F.fence[1].x-F.fence[0].x,d:40});
  // Row crops, each at a different growth stage. Rows run east–west; the band z order teaches a rotation.
  const rowsIn=(z0:number,z1:number)=>{const out:number[]=[];for(let z=-127.2;z<=-90.6;z+=1.4)if(z>=z0&&z<=z1&&Math.abs(z-F.track.z)>=1.6)out.push(z);return out;};
  const along=(i:number)=>{const out:number[]=[];for(let x=F.crops.x0+.8;x<=F.crops.x1-.8;x+=1.5)if(Math.abs(x-F.beachTrack.x)>F.beachTrack.w/2+.5)out.push(x);void i;return out;};
  let n=0;
  for(const z of rowsIn(-128,-122.5))for(const x of along(0)){const h=1.3+rnd(n,1)*.4;cylinder(.05,h,'#8baa69',x,h/2,z);for(const s of [-1,1]){const leaf=box(.5,.04,.12,'#7a9e67',x+s*.2,h*.55,z);leaf.rotation.z=s*.5;}box(.1,.28,.1,'#e8be71',x+.08,h*.7,z);n++;} // Maize
  for(const z of rowsIn(-122,-117.5))for(const x of along(1)){const g=put(new T.IcosahedronGeometry(.3+rnd(n,2)*.08,0),n%2?'#8baa69':'#7a9e67',x,.18,z);g.scale.y=.6;n++;} // Leafy greens
  for(const z of rowsIn(-117,-113))for(const x of along(2)){box(.04,1.1,.04,'#9d805b',x,.55,z);put(new T.IcosahedronGeometry(.32,0),'#5b895e',x,.7,z);for(let k=0;k<3;k++)put(new T.IcosahedronGeometry(.08,0),'#d9534a',x+(k-1)*.18,.55+k*.12,z+.2);n++;} // Tomatoes on stakes
  for(const z of rowsIn(-110,-104.5))for(const x of along(3)){if(Math.hypot(x-F.scarecrow.x,z-F.scarecrow.z)<1.4)continue;const m=put(new T.IcosahedronGeometry(.34,0),'#8b6a4a',x,.05,z);m.scale.y=.4;put(new T.IcosahedronGeometry(.18,0),'#739568',x,.22,z);n++;} // Sweet potatoes
  for(const z of rowsIn(-104,-91))for(const x of along(4)){put(new T.IcosahedronGeometry(.26,0),'#5b895e',x,.3,z);box(.08,.14,.08,n%3?'#e8a33d':'#d9534a',x+.12,.34,z+.1);n++;} // Peppers
  // Orchard: mango and citrus trees in rows, papayas at the ends, bananas along the east fence.
  const trees:[number,number,'mango'|'citrus'|'papaya'][]=[[655,-124,'mango'],[664,-124,'citrus'],[673,-124,'mango'],[682,-124,'citrus'],[655,-117.5,'citrus'],[664,-117.5,'mango'],[673,-117.5,'citrus'],[682,-117.5,'papaya'],[651.5,-120.5,'papaya']];
  trees.forEach(([x,z,kind],i)=>{
   if(kind==='papaya'){cylinder(.12,3.2,'#9d805b',x,1.6,z);for(let k=0;k<6;k++){const leaf=box(1.3,.04,.3,'#739568',x+Math.cos(k)*.55,3.25,z+Math.sin(k)*.55);leaf.rotation.y=-k;leaf.rotation.z=.25;}for(let k=0;k<4;k++)put(new T.IcosahedronGeometry(.16,0),'#e8be71',x+Math.cos(k*1.6)*.18,2.8,z+Math.sin(k*1.6)*.18);}
   else{cylinder(.16,1.6,'#9d805b',x,.8,z);const c=put(new T.IcosahedronGeometry(kind==='mango'?1.55:1.3,0),kind==='mango'?'#5b895e':'#739568',x,2.4,z);c.scale.y=.85;
    for(let k=0;k<5;k++)put(new T.IcosahedronGeometry(.13,0),kind==='mango'?'#e6a341':'#f4a53d',x+Math.cos(k*1.3+i)*1.05,1.9+rnd(i,k)*.7,z+Math.sin(k*1.3+i)*1.05);}
   obstacles.push({x,z,w:.5,d:.5});assets.push({kind:'fruit-tree',x,z,w:.5,d:.5,visualW:3.2,visualD:3.2,canopyHeight:3.4});
  });
  for(let z=-127;z<=-116;z+=2.8){const x=687;cylinder(.16,1.8,'#8baa69',x,.9,z);for(let k=0;k<5;k++){const leaf=box(1.5,.03,.38,'#7a9e67',x+Math.cos(k*1.25)*.55,1.95,z+Math.sin(k*1.25)*.55);leaf.rotation.y=-k*1.25;leaf.rotation.z=-.35;}put(new T.IcosahedronGeometry(.2,0),'#e8d25a',x+.2,1.4,z);obstacles.push({x,z,w:.4,d:.4});}
  // Pineapple patch and a melon/pumpkin patch on the ground.
  for(let x=F.pineapples.x0+.8;x<=F.pineapples.x1-.6;x+=1.2)for(let z=F.pineapples.z0+.6;z<=F.pineapples.z1-.5;z+=1.3){const b=put(new T.IcosahedronGeometry(.2,0),'#d7ad62',x,.28,z);b.scale.y=1.35;put(new T.ConeGeometry(.2,.36,5),'#5b895e',x,.66,z);}
  {let k=0;for(let x=F.melons.x0+.9;x<=F.melons.x1-.6;x+=1.8)for(let z=F.melons.z0+.8;z<=F.melons.z1-.6;z+=1.7){const melon=k++%2===0,m=put(new T.IcosahedronGeometry(melon?.42:.36,0),melon?'#4f8a4f':'#e0873a',x+rnd(k,4)*.3,melon?.25:.22,z);m.scale.set(melon?1.3:1,.75,1);put(new T.IcosahedronGeometry(.12,0),'#739568',x+.35,.12,z+.3);}}
  // Farmhouse (tropical, Sep 29 2026 restyle): a raised, open-sided timber house on stilts under a steep thatched hip
  // roof with deep overhangs, woven screens on the back and sides, a shaded verandah and hanging fruit baskets.
  {const B=F.barn,deck=1.05;
   for(let i=0;i<=4;i++)for(const dz of [-1,1])cylinder(.14,deck,'#9d805b',B.x-B.w/2+.3+i*(B.w-.6)/4,deck/2,B.z+dz*(B.d/2-.3));
   box(B.w,.22,B.d,'#a67d55',B.x,deck,B.z);for(let x=B.x-B.w/2+.25;x<B.x+B.w/2;x+=.5)box(.03,.012,B.d-.1,'#91704d',x,deck+.12,B.z).castShadow=false;
   for(let i=0;i<=4;i++)for(const dz of [-1,1])cylinder(.1,2.8,'#9d805b',B.x-B.w/2+.3+i*(B.w-.6)/4,deck+1.4,B.z+dz*(B.d/2-.3));
   box(B.w-.6,2.2,.12,'#d7ad62',B.x,deck+1.2,B.z-B.d/2+.35);for(let y=deck+.3;y<deck+2.3;y+=.28)box(B.w-.6,.05,.14,'#c9a26b',B.x,y,B.z-B.d/2+.35).castShadow=false;
   for(const dx of [-1,1]){box(.12,1.2,B.d-.8,'#d7ad62',B.x+dx*(B.w/2-.35),deck+.7,B.z);for(let y=deck+.25;y<deck+1.3;y+=.25)box(.14,.05,B.d-.8,'#c9a26b',B.x+dx*(B.w/2-.35),y,B.z).castShadow=false;}
   const roof=new T.ConeGeometry(Math.SQRT1_2,1,4);roof.rotateY(Math.PI/4);const r=put(roof,'#d7ad62',B.x,deck+2.8+1.6,B.z);r.scale.set(B.w+3,3.2,B.d+3);
   box(B.w+3.1,.12,B.d+3.1,'#b9955a',B.x,deck+2.82,B.z);
   for(let k=0;k<3;k++)box(2.4-k*.5,.2,.9,'#a67d55',B.x,.1+k*.3,B.z+B.d/2+.45+(2-k)*.35);
   for(const dx of [-3.6,3.6]){cylinder(.25,.3,'#a67d55',B.x+dx,deck+2.15,B.z+B.d/2+.2);for(let k=0;k<3;k++)put(new T.IcosahedronGeometry(.12,0),['#e8d25a','#e6a341','#4f8a4f'][k],B.x+dx-.12+k*.12,deck+2.36,B.z+B.d/2+.2);line(V(B.x+dx,deck+2.3,B.z+B.d/2+.2),V(B.x+dx,deck+2.8,B.z+B.d/2+.2),.01,'#6e5540');}
   obstacles.push({x:B.x,z:B.z,w:B.w,d:B.d});}
  // Windmill (static) and a water tank on legs: water is the drink that matters most on a hot beach.
  {const W=F.windmill;for(const [dx,dz] of [[-.8,-.8],[.8,-.8],[.8,.8],[-.8,.8]])line(V(W.x+dx,0,W.z+dz),V(W.x+dx*.25,6,W.z+dz*.25),.06,'#9d805b');
   for(let k=0;k<6;k++){const blade=box(.28,1.8,.05,'#eddfbb',W.x,6.3,W.z+.35);blade.rotation.z=k*Math.PI/3;blade.position.x+=Math.sin(k*Math.PI/3)*.9;blade.position.y+=Math.cos(k*Math.PI/3)*.9;}
   box(.2,.2,1.4,'#9d805b',W.x,6.3,W.z-.4);box(.05,.8,.9,'#bd7657',W.x,6.3,W.z-1.1);obstacles.push({x:W.x,z:W.z,w:1.8,d:1.8});}
  {const K=F.tank;for(const [dx,dz] of [[-.6,-.6],[.6,-.6],[.6,.6],[-.6,.6]])cylinder(.07,1.8,'#9d805b',K.x+dx,.9,K.z+dz);cylinder(.95,1.5,'#8fc3bd',K.x,2.55,K.z);put(new T.ConeGeometry(1.25,.7,8),'#d7ad62',K.x,3.65,K.z);obstacles.push({x:K.x,z:K.z,w:1.6,d:1.6});}
  // Produce stand at the path gate: a counter under a striped awning, crates of the harvest in front.
  {const S=F.stand;box(S.w,.9,S.d,'#a67d55',S.x,.45,S.z);for(const dx of [-1,1])for(const dz of [-1,1])cylinder(.05,2.3,'#9d805b',S.x+dx*(S.w/2-.1),1.15,S.z+dz*(S.d/2-.1));
   const thatch=new T.ConeGeometry(Math.SQRT1_2,1,4);thatch.rotateY(Math.PI/4);put(thatch,'#d7ad62',S.x,2.75,S.z).scale.set(S.w+1.4,1,S.d+1.8);
   sign('FRESH FROM THE FARM',S.w-.2,.42,S.x,1.62,S.z+S.d/2+.06,'#e8a33d','#294f43');box(S.w-.1,.5,.06,'#294f43',S.x,1.62,S.z+S.d/2+.02);
   obstacles.push({x:S.x,z:S.z,w:S.w,d:S.d});}
  const crate=(x:number,z:number,fruit:string,i:number)=>{box(.8,.42,.55,'#a67d55',x,.21,z);for(let k=0;k<4;k++)put(new T.IcosahedronGeometry(.11,0),fruit,x-.24+k*.16,.46,z+(k%2?.1:-.1));assets.push({kind:'crate',x,z,w:.8,d:.55});obstacles.push({x,z,w:.8,d:.55});void i;};
  ['#e8d25a','#d9534a','#e6a341','#4f8a4f'].forEach((c,i)=>crate(F.stand.x-1.5+i*1,F.stand.z+1.6,c,i));
  crate(F.barn.x+7.2,F.barn.z+3,'#e8be71',9);crate(F.barn.x+7.2,F.barn.z+1.9,'#e0873a',10);
  // Scarecrow in a football shirt keeps watch over the sweet potatoes.
  {const C=F.scarecrow;cylinder(.06,2.2,'#9d805b',C.x,1.1,C.z);box(1.6,.08,.08,'#9d805b',C.x,1.75,C.z);box(.8,.75,.3,'#477c6a',C.x,1.55,C.z);box(.36,.32,.02,'#fff0cf',C.x,1.6,C.z+.16);
   box(.7,.36,.28,'#eddfbb',C.x,1.05,C.z);put(new T.IcosahedronGeometry(.26,0),'#e8d5a3',C.x,2.2,C.z);put(new T.ConeGeometry(.42,.3,8),'#d7ad62',C.x,2.46,C.z);obstacles.push({x:C.x,z:C.z,w:.4,d:.4});}
  // Fence: timber posts and rails, open at the gates (same pieces as the causeway rails; collision in FARM_FENCE_OBSTACLES).
  for(const o of FARM_FENCE_OBSTACLES){const horizontal=o.w>=o.d,len=Math.max(o.w,o.d);if(len<1){cylinder(.06,1,'#9d805b',o.x,.5,o.z);obstacles.push(o);continue;}
   for(const y of [.45,.85]){const r=box(horizontal?len:.06,.07,horizontal?.06:len,'#a67d55',o.x,y,o.z);r.castShadow=false;}
   const posts=Math.max(1,Math.round(len/2.4));for(let k=0;k<=posts;k++){const t=-len/2+k*len/posts;cylinder(.07,1.05,'#9d805b',o.x+(horizontal?t:0),.525,o.z+(horizontal?0:t));}
   obstacles.push(o);}
  // Lush tropical planting (Sep 29 2026): sugar cane along the west fence, taro and hibiscus by the stand, bird-of-paradise
  // at the farmhouse steps, bougainvillea on the fences, monstera and ferns under the orchard, two breadfruit trees and
  // palms of varied heights outside the fence. All very low-poly and static, merged into the spatial batches.
  // Decorative plants are collected (not built here): lib/graphics/farmDecor.ts draws them as four instanced meshes that
  // thin on warm phones. Walk-through (no collisions), so a thinned plant never leaves an invisible obstacle.
  const plant=(...parts:DecorPart[])=>{farmDecor.push({parts});};
  const blob=(x:number,y:number,z:number,sx:number,sy:number,sz:number,color:string,ry=0,rz=0):DecorPart=>({kind:'blob',x,y,z,sx,sy,sz,ry,rz,color});
  const broadLeaf=(x:number,z:number,size:number,yaw:number,color='#4f8a4f')=>blob(x,size*.45+.15,z,size,size*.16,size*.62,color,yaw,.35);
  // Sugar cane clumps along the west fence (clear of the path gate).
  for(let z=-128;z<=-90.5;z+=1.7){if(z>-116&&z<-107)continue;const parts:DecorPart[]=[];for(let k=0;k<3;k++){const h=2.1+rnd(z*3+k,5)*.9,x=599.2+(k-1)*.3,zz=z+(k%2)*.3;parts.push({kind:'stem',x,y:h/2,z:zz,sx:.04,sy:h,sz:.04,rz:(k-1)*.06,color:k%2?'#8baa69':'#a1ac6d'},{kind:'blade',x,y:h*.8,z,sx:.9,sy:.03,sz:.1,ry:k,color:'#7a9e67'});}plant(...parts);}
  // Taro (elephant ears) by the stand and the south fence.
  for(const [x,z] of [[614,-91.2],[616.5,-92],[618.6,-91],[606.5,-98.4],[616,-96]] as [number,number][])plant(...[0,1,2].map(k=>broadLeaf(x+Math.cos(k*2.1)*.5,z+Math.sin(k*2.1)*.5,.75,k*2.1,'#5b895e')),{kind:'stem',x,y:.25,z,sx:.05,sy:.5,sz:.05,color:'#739568'});
  // Hibiscus shrubs with red flowers.
  const flowerShrub=(x:number,z:number,flower:string)=>plant(blob(x,.5,z,.55,.47,.55,'#5b895e'),...[0,1,2,3,4].map(k=>blob(x+Math.cos(k*1.3)*.45,.55+(k%2)*.3,z+Math.sin(k*1.3)*.45,.11,.11,.11,flower)));
  for(const [x,z] of [[608.2,-102.6],[614,-102.6],[603.5,-127]] as [number,number][])flowerShrub(x,z,'#d9534a');
  // Bird-of-paradise at the farmhouse steps.
  for(const [x,z] of [[F.barn.x-2.2,F.barn.z+F.barn.d/2+1],[F.barn.x+2.2,F.barn.z+F.barn.d/2+1]] as [number,number][])plant(...[0,1,2,3].flatMap(k=>[{kind:'blade',x:x+(k-1.5)*.18,y:.5,z,sx:.12,sy:1,sz:.04,rz:(k-1.5)*.2,color:'#5b895e'} as DecorPart,{kind:'cone',x:x+(k-1.5)*.18,y:1.05,z,sx:.08,sy:.34,sz:.08,rz:1.2,color:k%2?'#f08a3c':'#4a8bb0'} as DecorPart]));
  // Bougainvillea on the long fence runs: a clump every 3.3 m.
  for(const o of FARM_FENCE_OBSTACLES){if(o.w<3&&o.d<3)continue;const horizontal=o.w>=o.d,len=Math.max(o.w,o.d);for(let t=-len/2+1.4;t<len/2-1;t+=3.3){const x=o.x+(horizontal?t:0),z=o.z+(horizontal?0:t);plant(...[0,1,2].map(k=>{const r=.2+rnd(t,k)*.08;return blob(x+(horizontal?(k-1)*.3:0),.75+(k%2)*.25,z+(horizontal?0:(k-1)*.3),r,r,r,k===1?'#739568':'#c2458f');}));}}
  // Monstera and ferns under the orchard trees.
  for(const [x,z] of trees.map(([x,z])=>[x,z]) as [number,number][])plant(...[0,1].map(k=>broadLeaf(x+Math.cos(k*3+x)*1.1,z+Math.sin(k*3+x)*1.1,.55,k*3+x,k?'#3f7a4f':'#5b895e')));
  for(const [x,z] of [[647.8,-126.2],[647.8,-115.5]] as [number,number][]){cylinder(.2,2.2,'#8a6a4a',x,1.1,z);const c=put(new T.IcosahedronGeometry(1.75,0),'#3f7a4f',x,3.1,z);c.scale.y=.9;for(let k=0;k<4;k++)put(new T.IcosahedronGeometry(.2,0),'#9cc05a',x+Math.cos(k*1.6)*1.3,2.5,z+Math.sin(k*1.6)*1.3);obstacles.push({x,z,w:.6,d:.6});assets.push({kind:'fruit-tree',x,z,w:.6,d:.6,visualW:3.5,visualD:3.5,canopyHeight:4.6});}
  for(const [x,z,h] of [[594,-127,6.8],[594.5,-94,5.2],[660,-96,6.2],[681,-97,4.8],[692.5,-120,5.6],[640,-86,5.4]] as [number,number,number][])palm(x,z,h);
  // Signs: the farm's name at the path gate and two short fuelling lessons (the farmers explain more).
  // Farm gateway over the track at the west fence gate (off the tan path): timber posts on the gate edges, a crossbeam
  // with a small thatch cap, and the farm's name facing both ways.
  {const gx=F.fence[0].x,g=F.gates.find(q=>q.segment===5)!,za=Math.min(g.from,g.to)-.35,zb=Math.max(g.from,g.to)+.35,zc=(za+zb)/2,span=zb-za;
   for(const z of [za,zb]){box(.36,3.9,.36,'#9d805b',gx,1.95,z);obstacles.push({x:gx,z,w:.4,d:.4});}
   box(.42,.3,span+.9,'#9d805b',gx,3.8,zc);const cap=box(1.1,.22,span+1.4,'#d7ad62',gx,4.06,zc);cap.castShadow=false;
   box(.14,.85,span-1.1,'#477c6a',gx,3.15,zc);
   sign('CORAL CAY FARM',span-1.4,.62,gx-.09,3.15,zc,'#477c6a','#f4cc7c',-Math.PI/2);sign('CORAL CAY FARM',span-1.4,.62,gx+.09,3.15,zc,'#477c6a','#f4cc7c',Math.PI/2);}
  teachingBoard('FOOD IS FUEL · CARBS GIVE ENERGY',F.crops.x0+10,F.fence[0].z-1.6,8.6);
  teachingBoard('HOT DAY? WATER FIRST',F.tank.x+5,F.tank.z+2.6,6.6);
 }
 // ---- Hostel neighbourhood (Sep 29 2026): where visiting youth teams stay for beach-soccer tournaments, plus seven small
 // islander homes (stilted cottages, pastel bungalows with pitched tin roofs, thatched huts) with porches and gardens.
 // Everything is a static palette mesh (windows use the shared window colours, so they glow at night with the rest).
 // Six homes remain (one stilted cottage in front of the verandah was removed, user request Sep 29 2026).
 {const H=HOSTEL;
  house(H.x,H.z,H.w,H.d,H.h,'CORAL CAY HOSTEL',1);
  // Verandah across the front: timber deck, posts, a pastel tin roof, hammocks and a big bright sign on the parapet.
  const vz=H.z+H.d/2+H.verandah.d/2;box(H.w,.18,H.verandah.d,'#a67d55',H.x,.09,vz);
  for(let i=0;i<=6;i++){const x=H.x-H.w/2+.2+i*(H.w-.4)/6;cylinder(.09,3.1,'#eddfbb',x,1.55,vz+H.verandah.d/2-.2);}
  const tin=box(H.w+.6,.12,H.verandah.d+.5,'#8fc3bd',H.x,3.15,vz);tin.rotation.x=.12;
  for(const [a,b] of [[1,2],[4,5]]){const x0=H.x-H.w/2+.2+a*(H.w-.4)/6,x1=H.x-H.w/2+.2+b*(H.w-.4)/6,zz=vz+H.verandah.d/2-.25;for(let k=0;k<6;k++){const t0=k/6,t1=(k+1)/6,sag=(t:number)=>1.25-Math.sin(t*Math.PI)*.45;line(V(x0+(x1-x0)*t0,sag(t0),zz),V(x0+(x1-x0)*t1,sag(t1),zz),.09,a===1?'#bd7657':'#589aa0');}}
  box(10.4,1.5,.2,'#294f43',H.x,H.h+1.1,H.z+H.d/2-.4);sign('CORAL CAY HOSTEL',10,1.2,H.x,H.h+1.1,H.z+H.d/2-.28,'#e8a33d','#294f43');
  for(const dx of [-4.6,4.6])box(.16,1.4,.16,'#294f43',H.x+dx,H.h+.45,H.z+H.d/2-.4);
  // Surfboards and bikes by the steps.
  ['#589aa0','#f4cc7c','#d9534a'].forEach((c,i)=>{const b=box(.6,2.2,.08,c,H.x+H.w/2-1.2-i*.8,1.1,vz+H.verandah.d/2+.5);b.rotation.x=-.2;});
  for(let i=0;i<2;i++){const bx=H.x-H.w/2+2+i*1.4,bz=vz+H.verandah.d/2+.8;for(const dx of [-.45,.45]){const w=put(new T.TorusGeometry(.32,.04,5,12),'#294f43',bx+dx,.36,bz);w.castShadow=false;}line(V(bx-.45,.36,bz),V(bx,.8,bz),.03,i?'#d9534a':'#4a8bb0');line(V(bx,.8,bz),V(bx+.45,.36,bz),.03,i?'#d9534a':'#4a8bb0');line(V(bx-.1,.95,bz),V(bx+.25,.95,bz),.03,'#294f43');}
  obstacles.push({x:H.x,z:vz+H.verandah.d/2+.6,w:H.w-1,d:.8});
  // Team-kit washing line: visiting clubs' shirts drying in the sea breeze.
  {const x0=567,x1=575.5,z=-120.5;for(const x of [x0,x1]){cylinder(.06,2.1,'#9d805b',x,1.05,z);obstacles.push({x,z,w:.2,d:.2});}line(V(x0,1.95,z),V(x1,1.95,z),.012,'#eddfbb');
   ['#477c6a','#d9534a','#4a8bb0','#f4cc7c','#477c6a','#d9534a'].forEach((c,i)=>{const x=x0+.8+i*1.35;box(.62,.62,.05,c,x,1.62,z);box(.9,.2,.05,c,x,1.82,z);box(.22,.18,.06,'#fff0cf',x,1.62,z+.02);});}
  lamp(H.x-H.w/2-1.2,-113.2,-.05);lamp(573,-101.9,-.05);
 }
 for(const [x,z,w,d] of HOSTEL_PATHS)path(x,z,w,d);
 CAY_HOMES.forEach((h,i)=>{
  const porchZ=h.z+2.9;
  if(h.style==='hut'){cylinder(2.2,2.5,h.color,h.x,1.25,h.z);box(1,1.85,.12,'#365b56',h.x,.93,h.z+2.15);cylinder(2.7,.2,'#b9955a',h.x,2.52,h.z);put(new T.ConeGeometry(2.95,1.8,10),h.roof,h.x,3.5,h.z);
   box(2.6,.16,1.3,'#a67d55',h.x,.08,h.z+2.75);for(const dx of [-1.1,1.1])cylinder(.06,1.9,'#9d805b',h.x+dx,.95,h.z+3.3);
   obstacles.push({x:h.x,z:h.z,w:4.2,d:4.2,cornerRadius:2});}
  else{const stilt=h.style==='stilt',floor=stilt?1.2:.35,wall=2.5,w=stilt?4.8:5.4,d=stilt?4.2:4.6;
   if(stilt)for(const dx of [-1,1])for(const dz of [-1,1])cylinder(.1,floor,'#9d805b',h.x+dx*(w/2-.2),floor/2,h.z+dz*(d/2-.2));
   box(w+.3,.2,d+.3,'#a67d55',h.x,floor,h.z);box(w,wall,d,h.color,h.x,floor+wall/2,h.z);
   // Door and two windows on the porch side (window colour joins the shared night-glow window batches).
   box(.9,1.8,.08,'#365b56',h.x-.8,floor+.95,h.z+d/2+.04);for(const dx of [.9,-2])box(.8,.8,.08,'#3d625c',h.x+dx+(dx<0?0:.2),floor+1.4,h.z+d/2+.04);
   for(const side of [-1,1]){const r=box(w+1,.1,d/2+1,h.roof,h.x,floor+wall+.55,h.z+side*(d/4+.25));r.rotation.x=side*.42;}
   const gable=new T.Shape();gable.moveTo(-d/2,0);gable.lineTo(d/2,0);gable.lineTo(0,1.05);gable.closePath();for(const end of [-1,1]){const g=new T.ExtrudeGeometry(gable,{depth:.1,bevelEnabled:false});g.rotateY(Math.PI/2);put(g,h.color,h.x+end*(w/2)-.05,floor+wall,h.z);}
   // Porch: deck, two posts, a lean-to roof and steps down to the garden.
   box(w,.16,1.5,'#a67d55',h.x,floor,porchZ-.4);for(const dx of [-1,1])cylinder(.06,wall,'#eddfbb',h.x+dx*(w/2-.2),floor+wall/2,porchZ+.2);
   const lean=box(w+.4,.08,1.8,h.roof,h.x,floor+wall-.05,porchZ-.35);lean.rotation.x=.18;
   if(stilt)for(let k=0;k<3;k++)box(1.2,.14,.35,'#a67d55',h.x+w/2-.9,floor-(k+1)*.35,porchZ+.5+k*.3);
   obstacles.push({x:h.x,z:h.z+.8,w:w+.4,d:d+2});}
  // A small garden: flower shrubs and a low side fence on the garden side.
  const gx=h.x+(i%2?-3.6:3.6);for(let k=0;k<2;k++){const b=put(new T.IcosahedronGeometry(.45,0),'#5b895e',gx,.4,h.z+1+k*1.4);b.scale.y=.8;put(new T.IcosahedronGeometry(.12,0),k?'#c2458f':'#f4cc7c',gx+.2,.8,h.z+1+k*1.4);}
  box(.06,.6,3.2,'#eddfbb',gx+(i%2?-.8:.8),.3,h.z+1.6);obstacles.push({x:gx+(i%2?-.8:.8),z:h.z+1.6,w:.12,d:3.2});
 });
 // Kids' mini goal in the south-east yard, a ball in front of it.
 {const G=MINI_GOAL;for(const dx of [-1.1,1.1])box(.08,1,.08,'#fff1d3',G.x+dx,.5,G.z);box(2.3,.08,.08,'#fff1d3',G.x,1,G.z);for(let dx=-1;dx<=1.01;dx+=.25)box(.02,.95,.02,'#c3d1b9',G.x+dx,.5,G.z-.5).castShadow=false;
  put(new T.IcosahedronGeometry(.19,1),'#f4edd3',G.x+.3,.19,G.z+1.8);obstacles.push({x:G.x,z:G.z-.25,w:2.4,d:.7});}
 // Palms and a second washing line among the homes.
 for(const [x,z,hgt] of [[542.5,-109.5,6],[586,-117.5,5.2],[589,-107.5,6.4],[569.5,-97,4.8],[552.8,-96,5.5]] as [number,number,number][])palm(x,z,hgt);
 {const z=-102.5,x0=583.4,x1=587.4;for(const x of [x0,x1]){cylinder(.05,1.8,'#9d805b',x,.9,z);obstacles.push({x,z,w:.2,d:.2});}line(V(x0,1.7,z),V(x1,1.7,z),.01,'#eddfbb');['#f4cc7c','#589aa0','#e9b8c4'].forEach((c,i)=>box(.7,.5,.04,c,x0+.8+i*1.2,1.4,z));}
 // ---- Sharks Beach: the north-east bay nearest the court, where the friendly sharks circle offshore (caySharks.ts).
 {const b=SHARKS_BEACH;postSign('SHARKS BEACH',b.x,b.z);teachingBoard('BLUE SHARKS = CAPE VERDE NATIONAL TEAM',b.x-2,b.z+5,9.4);}
 // ---- Beach ring: palms and umbrellas around the whole (uneven) beach, a lifeguard tower on the easternmost headland,
 // rocks at the tide line. `inward(i, f)` is a point a fraction f of the way from the waterline to the lawn.
 // The lifeguard tower's spot is also exported as CAY_LANDMARKS.lifeguardTower (coralCay.ts) — keep the two rules in step.
 const n=CAY_SHORE.length,inward=(i:number,f:number)=>{const s=CAY_SAND[i];return {x:s.outer.x+(s.inner.x-s.outer.x)*f,z:s.outer.z+(s.inner.z-s.outer.z)*f};};
 const onBuilding=(p:{x:number;z:number})=>CAY_HOUSES.some(([x,z,w,d])=>Math.abs(p.x-x)<w/2+3&&Math.abs(p.z-z)<d/2+3);
 const onCourt=(p:{x:number;z:number})=>onBuilding(p)||Math.abs(p.x-BEACH_COURT.x)<BEACH_COURT.length/2+5&&p.z>BEACH_COURT.z-BEACH_COURT.width/2-12&&p.z<BEACH_COURT.z+BEACH_COURT.width/2+12;
 const nearCauseway=(p:{x:number;z:number})=>onCourt(p)||p.x<CAY_BOULEVARD.x0+30&&Math.abs(p.z-z0)<18||Math.abs(p.x-CAY_KONBINI.x)<CAY_KONBINI.w/2+4&&p.z>CAY_KONBINI.z-CAY_KONBINI.d/2-4&&p.z<ROUNDABOUT.z;
 for(let i=0;i<n;i+=5){const p=inward(i,.6+jitter(i)*.2);if(nearCauseway(p))continue;palm(p.x,p.z,5.3+jitter(i,2)*1.3);}
 let u=0;for(let i=2;i<n;i+=17){const p=inward(i,.4);if(nearCauseway(p))continue;umbrella(p.x,p.z,u++);}
 for(let i=0;i<n;i+=3){const p=inward(i,.08+jitter(i,4)*.06),rock=put(new T.IcosahedronGeometry(.22+jitter(i,6)*.3,0),'#d2bc94',p.x,-.1,p.z);rock.scale.y=.5;}
 {let best=0;for(let i=0;i<n;i++)if(CAY_SHORE[i].x>CAY_SHORE[best].x)best=i;const p=inward(best,.45);lifeguardChair(p.x,p.z);}
 // Grove palms and shrub clumps on the open lawn: kept only where they stand well inside the (irregular) coast.
 // The farm (FARM fence, plus a metre) keeps its own planting: no lawn palms or shrub clumps inside it.
 const inFarm=(x:number,z:number)=>x>FARM.fence[0].x-1.5&&x<FARM.fence[1].x+1.5&&z>FARM.fence[0].z-1.5&&z<FARM.fence[5].z+1.5;
 const inland=(x:number,z:number,margin:number)=>onCay(x,z)&&distanceToCayShore(x,z)>margin&&!inFarm(x,z)&&!inHostelArea(x,z)&&!onCourtBeach(x,z);
 for(const [x,z] of [[523,-170],[541,-168.6],[560,-168.6],[578,-172.5],[617,-186],[659,-186],[604,-140]])if(inland(x,z,14)){for(const [dx,r,c] of [[-.6,.7,'#5b895e'],[.5,.6,'#7a9e67']] as [number,number,string][]){const shrub=put(new T.IcosahedronGeometry(r,1),c,x+dx,.45,z);shrub.scale.y=.75;}obstacles.push({x,z,w:1.8,d:1.2});}
 [[525,-205],[543,-216],[559,-199],[585,-222],[604,-209],[619,-233],[667,-222],[686,-181],[696,-150],[673,-101],[648,-112],[620,-101],[568,-110],[548,-112],[610,-127],[531,-118],[640,-240],[700,-130],[626,-173],[646,-146],[621,-146],[636,-193],[560,-80],[620,-78]].forEach(([x,z],i)=>{if(inland(x,z,12))palm(x,z,5.4+jitter(i,9)*1.4);});
 for(const [x,z] of [[537,-200],[577,-205],[612,-218],[681,-160],[660,-104],[577,-120],[540,-124]])if(inland(x,z,12)){for(let k=0;k<3;k++){const shrub=put(new T.IcosahedronGeometry(.55+k*.12,1),k%2?'#7a9e67':'#5b895e',x+(k-1)*.9,.4,z+(k%2)*.5);shrub.scale.y=.75;}obstacles.push({x,z:z+.25,w:3,d:1.4});}
 return {lampSites,farmDecor,destinations:[{name:'Coral Cay Plaza',x:CAY_PLAZA.x,z:CAY_PLAZA.z+8},{name:'Beach Soccer Court',x:BEACH_COURT.x,z:BEACH_COURT.z+BEACH_COURT.width/2+2},{name:'Sharks Beach',x:SHARKS_BEACH.x,z:SHARKS_BEACH.z+8},{name:'Coral Cay Farm',x:FARM.crops.x0-1.5,z:FARM.track.z},{name:'Coral Cay Hostel',x:HOSTEL.x,z:HOSTEL_PATHS[0][1]},{name:'Hostel homes',x:HOSTEL_PATHS[2][0],z:-104},{name:'Farm beach gate',x:FARM.beachTrack.x,z:FARM.beachTrack.z1+1},...SANDBARS.map(s=>({name:s.name,x:s.x,z:s.z}))]};
}
