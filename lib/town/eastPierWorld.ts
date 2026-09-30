// East Jetty scenery (Sep 30 2026; replaces the Sep 29 timber pier). Built inside buildTown with the island's own helpers before
// the batching pass, so every piece joins the existing 50 m spatial paint batches (vertex colours, one shared material per chunk):
// the stone walkway, kerbs, sloping rock armour, foam line and boulders are merged geometry, with no new materials beyond the
// sign canvases and the shared shallows material. No animation, no per-frame work. The causeway's look is reused on purpose:
// the same stone skirt, pale foam line, riprap boulders and fading shallows (coralCayWorld.ts). Lamps reuse the street-lamp
// pieces: the '#ffe8ae' lens is the shared emissive lamp lens and each lamp adds a site to the night light-pool batch.
import * as T from 'three';
import type {Obstacle} from './simulation';
import {onIsland} from './shoreline';
import {fadeBand} from './shallows';
import {EAST_PIER,JETTY_PATH,JETTY_BEACON,KEEPER_HUT,PIER_KICK_SPOT,coilAt,jettyOffset,walkwayOffset,jettySide,type JettySample} from './eastPier';
type Mesh=T.Mesh;
export type PierTools={
 box:(w:number,h:number,d:number,c:string,x:number,y:number,z:number)=>Mesh;
 cylinder:(r:number,h:number,c:string,x:number,y:number,z:number)=>Mesh;
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>Mesh;
 sign:(text:string,w:number,h:number,x:number,y:number,z:number,bg?:string,ink?:string,rotation?:number)=>Mesh;
 shallows:(g:T.BufferGeometry,x:number,z:number)=>void;
 obstacles:Obstacle[];
 assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;baseY?:number}[];
};
export type PierLampSite={x:number;z:number;ground:number;region:'east-pier';poolWidth?:number;poolDepth?:number};
const WALK='#e2d5b5',KERB='#bca987',ROCK='#bca987',ROCK2='#d2bc94',FOAM='#f5e9cb',IRON='#384443',POST='#9d805b';
const jitter=(i:number,k=1)=>{const s=Math.sin(i*12.9898+k*78.233)*43758.5453;return s-Math.floor(s);};

export function buildEastPier({box,cylinder,put,sign,shallows,obstacles,assets}:PierTools){
 const P=EAST_PIER,S=JETTY_PATH,last=S.length-1,lampSites:PierLampSite[]=[];
 const overWater=(p:{x:number;z:number})=>!onIsland(p.x,p.z);
 /** Index runs where keep(i) holds. */
 const runs=(keep:(i:number)=>boolean)=>{const out:[number,number][]=[];let a=-1;for(let i=0;i<=last;i++){if(keep(i)){if(a<0)a=i;}else if(a>=0){if(i-1>a)out.push([a,i-1]);a=-1;}}if(a>=0&&last>a)out.push([a,last]);return out;};
 /** A strip between two signed offsets (+ = right of travel = the spiral's outer side) at heights ya/yb, cut into ≤ 24 m
  *  pieces built relative to their middle sample, so each joins its own chunk. `face` is the wanted normal in the cross-section
  *  (lateral, up); the winding is flipped to match it. */
 function band(a:number,b:number,oa:number,ya:number,ob:number,yb:number,color:string,face:[number,number]){
  for(let i0=a;i0<b;i0+=24){const i1=Math.min(b,i0+24),mid=S[(i0+i1)>>1],pos:number[]=[],idx:number[]=[];
   for(let i=i0;i<=i1;i++){const p=S[i],q=jettySide(p,oa),r=jettySide(p,ob);pos.push(q.x-mid.x,ya,q.z-mid.z,r.x-mid.x,yb,r.z-mid.z);if(i<i1){const k=(i-i0)*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}}
   // Normal of the first triangle vs the wanted direction at the first sample.
   const v=(j:number)=>new T.Vector3(pos[j*3],pos[j*3+1],pos[j*3+2]),n=new T.Vector3().subVectors(v(1),v(0)).cross(new T.Vector3().subVectors(v(2),v(0)));
   const p0=S[i0],want=new T.Vector3(-p0.tz*face[0],face[1],p0.tx*face[0]);if(n.dot(want)<0)for(let t=0;t<idx.length;t+=3)[idx[t+1],idx[t+2]]=[idx[t+2],idx[t+1]];
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();put(g,color,mid.x,0,mid.z);
  }
 }
 // ---- Walkway: a stone-paved top (y 0, flush with the promenade), trimmed where it runs into the plaza disc.
 const start=S.findIndex(p=>p.x>=P.x0);
 // 2 cm proud of the promenade: where the walkway overlaps the promenade paving at the seawall gap, two coplanar
 // surfaces z-fought (flashing boards under the arch, Sep 30 2026). The walking floor stays at deckY.
 band(start,last,-P.kerbHalf,.02,P.kerbHalf,.02,WALK,[0,1]);
 // Kerbs on both edges, cut where they would cross the plaza or another stretch of walkway (the spiral's join).
 for(const side of [-1,1]){
  // The kerb's middle line must be clear of the plaza and not nearer to another stretch of walkway than to its own.
  const kerbOk=(i:number)=>{const k=jettySide(S[i],side*(P.kerbHalf+P.railHalf)/2);return S[i].x>=P.wallX+.6&&Math.hypot(k.x-P.cx,k.z-P.cz)>P.plazaEdge&&walkwayOffset(k.x,k.z)>P.kerbHalf-.05;};
  for(const [a,b] of runs(kerbOk)){
   band(a,b,side*P.kerbHalf,.22,side*P.railHalf,.22,KERB,[0,1]);
   band(a,b,side*P.kerbHalf,0,side*P.kerbHalf,.22,KERB,[-side,0]);
   band(a,b,side*P.railHalf,.22,side*P.railHalf,-.12,KERB,[side,0]);
  }
  // Rock armour sloping into the sea and the foam line where it meets the water (over the sea only).
  const seaOk=(i:number)=>overWater(jettySide(S[i],side*P.flankHalf))&&Math.hypot(jettySide(S[i],side*P.flankHalf).x-P.cx,jettySide(S[i],side*P.flankHalf).z-P.cz)>P.plazaEdge+1.4;
  for(const [a,b] of runs(seaOk)){
   band(a,b,side*P.railHalf,-.12,side*P.flankHalf,-.5,ROCK,[side,1]);
   band(a,b,side*(P.flankHalf-.3),-.405,side*(P.flankHalf+.35),-.405,FOAM,[0,1]);
  }
  // Riprap boulders at the waterline, both sides; skipped where they would sit on another coil's walkway.
  for(let i=start+2;i<last;i+=2){const p=S[i],o=P.flankHalf-.2+jitter(i,side)*.7,q=jettySide(p,side*o);
   if(!overWater(q)||jettyOffset(q.x,q.z)<P.railHalf+.4)continue;
   const r=.5+jitter(i,side+3)*.45,rock=put(new T.IcosahedronGeometry(r,0),jitter(i,side+5)>.5?ROCK2:ROCK,q.x,-.36,q.z);rock.scale.y=.55;rock.rotation.y=i;}
  // Fading shallows off both flanks (the causeway's band, shared material); inside the coils the sea keeps them too.
  const water=runs(i=>overWater(jettySide(S[i],side*P.flankHalf)));
  for(const [a,b] of water)for(let i0=a;i0<b;i0+=60){const i1=Math.min(b,i0+60),run=S.slice(i0,i1+1),mid=S[(i0+i1)>>1],ends=(j:number)=>Math.min(1,(j-a)/6,(b-j)/6);
   shallows(fadeBand(run.map(p=>({x:p.x,z:p.z})),run.map(p=>({x:-p.tz*side,z:p.tx*side})),P.flankHalf,4.2,false,mid.x,mid.z,j=>{const t=Math.max(0,ends(i0+j));return t*t*(3-2*t);}),mid.x,mid.z);}
 }
 // ---- Plaza at the spiral's centre: paved disc, a stone skirt and a kerb ring open where the walkway comes in.
 {const disc=new T.CircleGeometry(P.plazaEdge-.2,36);disc.rotateX(-Math.PI/2);put(disc,WALK,P.cx,.004,P.cz);
  const skirt=put(new T.CylinderGeometry(P.plazaEdge,P.plazaEdge+1.5,.62,28,1,true),ROCK,P.cx,-.31,P.cz);skirt.userData.skipRoofObstacle=true;
  const N=72;for(let i=0;i<N;i++){const a0=i/N*Math.PI*2,a1=(i+1)/N*Math.PI*2,am=(a0+a1)/2,r=(P.plazaR+P.plazaEdge)/2,m={x:P.cx+Math.cos(am)*r,z:P.cz+Math.sin(am)*r};
   if(walkwayOffset(m.x,m.z)<=P.walkHalf+.3)continue;
   const seg=box(.4,.22,r*(a1-a0)+.02,KERB,m.x,.11,m.z);seg.rotation.y=-am;}}
 // ---- Lighthouse at the centre (≈16.6 m): stone plinth, tapered white tower in stacked frusta with red bands, a gallery
 // (balcony ring, railing posts), a glazed lantern room in the shared lamp-lens colour (so it glows at night with every lamp)
 // and a red cap with a finial. A keeper's hut stands at its foot, on the east side away from where the walkway comes in.
 // All static paint geometry: it merges into the chunk's paint batch (one existing shadow caster), no new material.
 {const {x,z,r}=JETTY_BEACON;
  put(new T.CylinderGeometry(r+.5,r+.8,1,16),ROCK,x,.5,z);
  const tiers=[[0,3.4,'#f3ecdc'],[3.4,4.6,'#bf6658'],[4.6,8,'#f3ecdc'],[8,9.2,'#bf6658'],[9.2,12.4,'#f3ecdc']] as const;
  const radiusAt=(y:number)=>r-(r-1.35)*y/12.4;
  for(const [y0,y1,c] of tiers)put(new T.CylinderGeometry(radiusAt(y1),radiusAt(y0),y1-y0,16),c,x,1+(y0+y1)/2,z);
  // A door and two small windows facing the plaza entrance (west).
  box(.12,1.9,1.1,'#2f4f4a',x-radiusAt(.95)+.02,1.95,z);for(const y of [6.2,10.6])box(.12,.7,.5,'#2f4f4a',x-radiusAt(y-1)+.03,y,z);
  put(new T.CylinderGeometry(2.05,2.05,.22,20),'#f3ecdc',x,13.5,z);// gallery deck
  for(let k=0;k<16;k++){const a=k/16*Math.PI*2;cylinder(.04,.75,IRON,x+Math.cos(a)*1.95,13.98,z+Math.sin(a)*1.95);}
  put(new T.TorusGeometry(1.95,.045,4,24),IRON,x,14.35,z).rotation.x=Math.PI/2;
  cylinder(1.1,.25,IRON,x,13.73,z);put(new T.CylinderGeometry(1.05,1.05,1.5,12),'#ffe8ae',x,14.6,z);// the lit lantern glass
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2;box(.07,1.5,.07,IRON,x+Math.cos(a)*1.07,14.6,z+Math.sin(a)*1.07);}
  put(new T.ConeGeometry(1.35,1.3,12),'#bf6658',x,16,z);put(new T.SphereGeometry(.18,8,6),IRON,x,16.72,z);
  obstacles.push({x,z,w:(r+.8)*2,d:(r+.8)*2});assets.push({kind:'beacon',x,z,w:(r+.8)*2,d:(r+.8)*2});
  lampSites.push({x,z,ground:.01,region:'east-pier',poolWidth:10,poolDepth:10});
  sign('EAST JETTY LIGHTHOUSE',3,.42,x-r-.85,1.2,z,'#294f43','#f4cc7c',-Math.PI/2);
  // Keeper's hut: whitewashed walls, a red pitched roof, a green door facing the plaza.
  const h=KEEPER_HUT;box(h.w,h.h,h.d,'#efe6d2',h.x,h.h/2,h.z);
  for(const sd of [-1,1]){const roof=box(h.w+.5,.14,h.d/2+.55,'#bf6658',h.x,h.h+.45,h.z+sd*(h.d/4+.05));roof.rotation.x=sd*.52;}
  box(.1,1.6,.9,'#477c6a',h.x+h.w/2+.03,.8,h.z);box(.1,.55,.7,'#2f4f4a',h.x-h.w/2-.03,1.45,h.z+.9);
  obstacles.push({x:h.x,z:h.z,w:h.w+.2,d:h.d+.2});assets.push({kind:'keeper-hut',x:h.x,z:h.z,w:h.w,d:h.d});}
 // ---- Gate piers close the two cut ends of the seawall (eastCoast.ts gap), like the causeway's; short kerb footprints on the
 // island strip stop walkers stepping round the kerb ends (out over the water the walkway edge itself holds).
 for(const s of [-1,1]){const z=P.z+s*(P.railHalf+.55);box(1,1.5,1,'#bca987',P.wallX,.55,z);box(1.25,.2,1.25,'#eddfbb',P.wallX,1.4,z);obstacles.push({x:P.wallX,z,w:1,d:1});
  for(let x=P.wallX+.6;x<=P.shoreX+.6;x+=.5)obstacles.push({x,z:P.z+s*(P.railHalf+.15),w:.55,d:.3});}
 // ---- "EAST JETTY" arch just past the seawall, signed both ways (market-green boards).
 {const x=P.wallX+1.4,pz=P.railHalf+.35;for(const s of [-1,1]){box(.34,4.3,.34,POST,x,2.15,P.z+s*pz);obstacles.push({x,z:P.z+s*pz,w:.34,d:.34});}
  box(.5,.7,pz*2+.8,'#477c6a',x,4.1,P.z);box(.62,.12,pz*2+1.1,'#eddfbb',x,4.5,P.z);
  sign('EAST JETTY',5.6,.62,x-.26,4.1,P.z,'#294f43','#f4cc7c',-Math.PI/2);
  sign('FARMERS MARKET',5.6,.62,x+.26,4.1,P.z,'#294f43','#f4cc7c',Math.PI/2);}
 // ---- Lamps every 20 m of walkway, alternating sides, standing on the kerb (outside the walkable width).
 const lamp=(x:number,z:number,ground:number)=>{
  cylinder(.19,.22,IRON,x,ground+.11,z);cylinder(.065,4.2,IRON,x,ground+2.1,z);box(.62,.12,.62,IRON,x,ground+4.22,z);box(.43,.32,.43,'#ffe8ae',x,ground+3.99,z);
  assets.push({kind:'pier-lamp',x,z,w:.38,d:.38,visualW:.65,visualD:.65});lampSites.push({x,z,ground:.005,region:'east-pier',poolWidth:8,poolDepth:8});
 };
 {let k=0;for(let s=10;s<S[last].s-8;s+=20,k++){const p=S.find(q=>q.s>=s)!,side=k%2?1:-1,q=jettySide(p,side*(P.kerbHalf+P.railHalf)/2);
  if(Math.hypot(q.x-P.cx,q.z-P.cz)<P.plazaEdge+.5||walkwayOffset(q.x,q.z)<P.kerbHalf-.05)continue;lamp(q.x,q.z,.22);}}
 // ---- Benches on the plaza (backs to the beacon), bollards and lifebuoys on the kerbs.
 const bench=(x:number,z:number,facing:1|-1)=>{
  box(2,.12,.65,'#a67d55',x,.58,z);box(2,.45,.09,'#a67d55',x,.91,z-facing*.25);
  for(const dx of [-.75,.75])box(.13,.5,.5,'#385a4e',x+dx,.27,z);
  obstacles.push({x,z,w:2,d:.7});assets.push({kind:'bench',x,z,w:2,d:.7});
 };
 bench(P.cx-.8,P.cz-5,-1);bench(P.cx-.8,P.cz+5,1);
 const bollard=(x:number,z:number)=>{cylinder(.17,.5,IRON,x,.47,z);put(new T.SphereGeometry(.19,8,5,0,Math.PI*2,0,Math.PI/2),IRON,x,.72,z);};
 const lifebuoy=(x:number,z:number,yaw:number)=>{
  cylinder(.06,1.5,POST,x,.97,z);const ring=put(new T.TorusGeometry(.34,.085,6,14),'#e0513f',x,1.27,z);ring.rotation.y=yaw;
  for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4,band2=box(.1,.2,.2,'#fff3df',x+Math.cos(yaw)*Math.cos(a)*.34,1.27+Math.sin(a)*.34,z-Math.sin(yaw)*Math.cos(a)*.34);band2.rotation.set(0,yaw,a);}
 };
 const kerbLine=(P.kerbHalf+P.railHalf)/2;
 for(const x of [252,276])for(const s of [-1,1])bollard(x,P.z+s*kerbLine);
 for(const th of [Math.PI*.2,-Math.PI*.15,-Math.PI*.75]){const c=coilAt(th,kerbLine);bollard(c.x,c.z);}
 for(const [th,side] of [[Math.PI*.35,1],[-Math.PI*.95,1],[-Math.PI*1.3,-1]] as [number,number][]){const c=coilAt(th,side*kerbLine);lifebuoy(c.x,c.z,Math.atan2(c.tx,c.tz)+Math.PI/2);}
 {const x=264,z=P.z+kerbLine;lifebuoy(x,z,0);}
 // ---- Shooting challenge: a painted kick spot on the outer north stretch and a board on the outer kerb beside it.
 box(1.3,.3,1.3,'#f3ecdc',PIER_KICK_SPOT.x,-.147,PIER_KICK_SPOT.z);
 {const c=coilAt(-Math.PI/2+.32,kerbLine+.05),yaw=Math.atan2(c.tz,-c.tx),ix=c.tz*.07,iz=-c.tx*.07;// faces inward, across the walkway
  for(const d of [-1.3,1.3])cylinder(.07,2.2,POST,c.x+c.tx*d,1.32,c.z+c.tz*d);
  box(3.1,1.05,.12,'#294f43',c.x,1.97,c.z).rotation.y=yaw;
  sign('JETTY SHOOTING CHALLENGE',2.9,.42,c.x+ix,2.27,c.z+iz,'#294f43','#f4cc7c',yaw);
  sign('PICK YOUR SPOT · LAND IT IN THE RING',2.9,.34,c.x+ix,1.77,c.z+iz,'#294f43','#fff0cf',yaw);}
 return {lampSites,destination:{name:'East Jetty',x:P.cx,z:P.cz}};
}
