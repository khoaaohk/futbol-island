/**
 * The Island Line's static scenery (train Phase 1, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §9.1).
 * Built inside buildTown (world.ts) before the batching pass, so every solid piece is a plain palette paint and folds into the
 * island's existing 50 m paint batches (vertex colours, one shared material): on land that is NO new draw call.
 *
 *  - Track: rails, sleepers and ballast as ~100 m chunks of merged geometry along the line (one mesh per paint per chunk, each
 *    placed at its chunk's centre so it lands in, and is culled with, that chunk's batch). Over the sea the chunk also carries
 *    the trestle (deck girders, cap beams and the piers' columns) or the south sea wall; ~3 new sea cells, culled per chunk.
 *  - Catenary: wooden poles every ~30 m with a cantilever arm, one contact wire (thin 4-sided tube), merged into the same chunks.
 *  - Summit Isle tunnel: two stone portals (headwall with an arched mouth, dark inside, a hood over the carve behind it) and ONE
 *    tube mesh (walls, track and baked lamp light in vertex colours, unlit material) shown only while the camera is within
 *    TUBE_SHOW m of a portal or inside (update(), one distance test per frame).
 *  - Five static stations: platform (yellow edge strip), a small wooden Japanese-style station house (tiled hip roof, cream walls,
 *    dark timber, warm panes that glow at night through machineNightGlow, four paper lanterns), a bench and two boards (station
 *    name board, line board) cut from ONE canvas atlas: one textured material for all five stations (one draw where one is seen).
 *  - Five static level crossings (yellow-black poles, crossbuck, unlit twin lamps, a crossing deck); barriers and bells: Phase 2.
 * Colliders: house footprints, board posts, catenary poles and crossing poles on land; platforms are walk surfaces (one step up);
 * the South platform over the water is a landable deck. Swimmers meet the piers and the sea wall (trainLayout.trainSwimBlocked).
 * Nothing here animates and nothing runs per frame except the tube's visibility test.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {summitGround} from './summitIsle';
import {TRACK,TRACK_DS,TrackKind,TRAIN_STATIONS,TRAIN_CROSSINGS,TUNNEL,TUNNEL_BED,TUNNEL_HALF_WIDTH,STATION_HALF,STATION_PLATFORM_Y,MOUTH_CARVE,trackAt,leftNormal,wrapS,type TrainStation} from './trainTrack';
import {trainLayout,PIER_COLUMN_OFFSET,PIER_COLUMN_HALF,SEA_WALL_HALF} from './trainLayout';
import {onWalkPath} from './westParkLayout';

type Surface=Obstacle&{height:number};
export type TrainTools={
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 lit:(m:T.Mesh,w:number,warm?:boolean)=>T.Mesh;
 /** A textured board material registered with the island's sign list (disposal, night emissive). */
 boardMaterial:(canvas:HTMLCanvasElement)=>T.Material;
 town:T.Group;obstacles:Obstacle[];walkSurfaces:Surface[];
};
const C={rail:'#5d6166',railTop:'#a7abae',sleeper:'#6f5843',ballast:'#9a948a',girder:'#6d5640',pier:'#cbc4b5',wall:'#b8b0a1',wallTop:'#cfc8ba',pole:'#7a5c3e',wire:'#33393a',
 platform:'#d3cbbb',platformSide:'#a8a091',edge:'#f2c230',plaster:'#f0e6cc',timber:'#5e4630',deck:'#a57f57',roof:'#566270',ridge:'#3d4650',pane:'#a9c9d2',lantern:'#d9483a',cap:'#2c2a28',
 bench:'#b48a5e',yellow:'#f2c230',black:'#26231f',lampOff:'#7a2420',crossDeck:'#55524d',stone:'#aaa395',stoneDark:'#8d8679',mouth:'#121110'} as const;
export const TUBE_SHOW=60,CHUNK_LENGTH=100,POLE_STEP=30,RAIL_HALF_GAUGE=.68,BALLAST_TOP=.12,SLEEPER_TOP=.2,RAIL_TOP=.34,WIRE_Y=5.15;

/** A tiny triangle soup builder (positions + flat normals, indexed later by the batching pass). */
class Geo{
 p:number[]=[];n:number[]=[];
 tri(a:number[],b:number[],c:number[]){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  this.p.push(...a,...b,...c);for(let i=0;i<3;i++)this.n.push(nx,ny,nz);}
 /** Quad facing away from `inside` (a point the face should not face). */
 quad(a:number[],b:number[],c:number[],d:number[],inside?:number[]){
  if(inside){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,mx=(a[0]+c[0])/2-inside[0],my=(a[1]+c[1])/2-inside[1],mz=(a[2]+c[2])/2-inside[2];
   if(nx*mx+ny*my+nz*mz<0){this.tri(a,c,b);this.tri(a,d,c);return;}}
  this.tri(a,b,c);this.tri(a,c,d);}
 /** Box round centre c with half sizes hl along (tx,tz), hw across, hh up. */
 box(cx:number,cy:number,cz:number,tx:number,tz:number,hl:number,hw:number,hh:number,skipBottom=true,ends=true){
  const nx=tz,nz=-tx,P=(a:number,b:number,h:number)=>[cx+tx*hl*a+nx*hw*b,cy+hh*h,cz+tz*hl*a+nz*hw*b],c=[cx,cy,cz];
  this.quad(P(-1,-1,1),P(1,-1,1),P(1,1,1),P(-1,1,1),c);if(!skipBottom)this.quad(P(-1,-1,-1),P(1,-1,-1),P(1,1,-1),P(-1,1,-1),c);
  if(ends){this.quad(P(-1,-1,-1),P(1,-1,-1),P(1,-1,1),P(-1,-1,1),c);this.quad(P(-1,1,-1),P(1,1,-1),P(1,1,1),P(-1,1,1),c);}
  this.quad(P(-1,-1,-1),P(-1,1,-1),P(-1,1,1),P(-1,-1,1),c);this.quad(P(1,-1,-1),P(1,1,-1),P(1,1,1),P(1,-1,1),c);}
 /** Box between two points (a thin beam / post / wire piece), square section r. */
 beam(a:number[],b:number[],r:number){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(...s1);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:number[],i:number,j:number)=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  for(const [i,j,k,m] of [[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),c);}
 get empty(){return this.p.length===0;}
 build(ox:number,oz:number){const g=new T.BufferGeometry(),p=new Float32Array(this.p);for(let i=0;i<p.length;i+=3){p[i]-=ox;p[i+2]-=oz;}
  g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(this.n),3));return g;}
}

export function buildTrainWorld(tools:TrainTools){
 const {put,lit,town,obstacles,walkSurfaces}=tools;
 const L=trainLayout(),K=L.profile.kind,BED=L.profile.bed,n=TRACK.n;
 const solid=(...os:Obstacle[])=>{for(const o of os){(o as Obstacle&{train?:boolean}).train=true;obstacles.push(o);}};
 const skip=(m:T.Mesh)=>{m.userData.skipRoofObstacle=true;m.userData.train=true;return m;};
 const emit=(g:Geo,color:string,ox:number,oz:number,y=0)=>{if(g.empty)return null;return skip(put(g.build(ox,oz),color,ox,y,oz));};
 const stationAt=(s:number)=>TRAIN_STATIONS.find(st=>Math.abs(wrapS(s-st.s+TRACK.length/2)-TRACK.length/2)<STATION_HALF+1);
 const crossingAt=(s:number,pad=0)=>TRAIN_CROSSINGS.find(c=>Math.abs(wrapS(s-c.s+TRACK.length/2)-TRACK.length/2)<c.width/2+pad);
 const isTunnel=(i:number)=>K[i]===TrackKind.Tunnel;
 const pt=(i:number)=>({x:TRACK.x[i%n],z:TRACK.z[i%n],tx:TRACK.tx[i%n],tz:TRACK.tz[i%n],bed:BED[i%n],kind:K[i%n],s:(i%n)*TRACK_DS});
 const off=(p:{x:number;z:number;tx:number;tz:number},v:number,y:number)=>[p.x+p.tz*v,y,p.z-p.tx*v];
 let poleNext=POLE_STEP/2,moved=0;

 // ------------------------------------------------------------------ track chunks
 const perChunk=Math.round(CHUNK_LENGTH/TRACK_DS);
 for(let c0=0;c0<n;c0+=perChunk){
  const c1=Math.min(n,c0+perChunk),mid=pt((c0+c1)>>1),ox=Math.round(mid.x),oz=Math.round(mid.z);
  const rails=new Geo(),railTops=new Geo(),sleepers=new Geo(),ballast=new Geo(),girders=new Geo(),piers=new Geo(),wall=new Geo(),wallTop=new Geo(),poles=new Geo(),wire=new Geo(),xdeck=new Geo();
  for(let i=c0;i<c1;i++){
   const a=pt(i),b=pt(i+1);if(isTunnel(i)||isTunnel(i+1))continue;
   // Rails: a top and two sides per rail per row (no ends, no bottom).
   for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.055;
    const A0=off(a,v-w,a.bed+RAIL_TOP),A1=off(a,v+w,a.bed+RAIL_TOP),B0=off(b,v-w,b.bed+RAIL_TOP),B1=off(b,v+w,b.bed+RAIL_TOP);
    railTops.quad(A0,B0,B1,A1,[A0[0],A0[1]-1,A0[2]]);
    const a0=off(a,v-w,a.bed+SLEEPER_TOP),a1=off(a,v+w,a.bed+SLEEPER_TOP),b0=off(b,v-w,b.bed+SLEEPER_TOP),b1=off(b,v+w,b.bed+SLEEPER_TOP),mid=off(a,v,a.bed+.27);
    rails.quad(a0,b0,B0,A0,mid);rails.quad(a1,b1,B1,A1,mid);}
   const xing=crossingAt(a.s);
   if(xing){// The crossing deck: dark panels level with the rail heads, the full width of the path.
    xdeck.box((a.x+b.x)/2,a.bed+RAIL_TOP-.08,(a.z+b.z)/2,a.tx,a.tz,TRACK_DS/2+.02,1.9,.08,true);}
   // Sleepers every 1 m (two per row) on ballast; the sea wall and the trestle carry them too.
   for(const f of [.25,.75]){const x=a.x+(b.x-a.x)*f,z=a.z+(b.z-a.z)*f,y=a.bed+(b.bed-a.bed)*f;if(!xing)sleepers.box(x,y+SLEEPER_TOP-.05,z,a.tx,a.tz,.13,1.15,.05,true,false);/* no end faces: 0.26 × 0.1 m, unseen (heat) */}
   if(a.kind===TrackKind.Land||a.kind===TrackKind.Wall){// Ballast: a low trapezoid strip.
    const t0=off(a,-1.45,a.bed+BALLAST_TOP),t1=off(a,1.45,a.bed+BALLAST_TOP),u0=off(b,-1.45,b.bed+BALLAST_TOP),u1=off(b,1.45,b.bed+BALLAST_TOP),
     f0=off(a,-1.9,a.bed-.06),f1=off(a,1.9,a.bed-.06),g0=off(b,-1.9,b.bed-.06),g1=off(b,1.9,b.bed-.06),inside=off(a,0,a.bed-1);
    ballast.quad(t0,u0,u1,t1,inside);ballast.quad(f0,g0,u0,t0,inside);ballast.quad(t1,u1,g1,f1,inside);}
   if(a.kind===TrackKind.Wall){// The sea wall: a stone top and two faces down into the water (Enoden-style).
    const h=SEA_WALL_HALF,top=-.02,foot=-2.6,inside=off(a,0,-1);
    wallTop.quad(off(a,-h,top),off(b,-h,top),off(b,h,top),off(a,h,top),inside);
    wall.quad(off(a,-h,foot),off(b,-h,foot),off(b,-h,top),off(a,-h,top),inside);wall.quad(off(a,h,foot),off(b,h,foot),off(b,h,top),off(a,h,top),inside);}
   if(a.kind===TrackKind.Sea){// Trestle deck: two girders under the rails.
    for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.2,top=a.bed+SLEEPER_TOP-.1,bot=a.bed-.4,topB=b.bed+SLEEPER_TOP-.1,botB=b.bed-.4,inside=off(a,v,a.bed-.15);
     girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v-w,topB),off(a,v-w,top),inside);girders.quad(off(a,v+w,bot),off(b,v+w,botB),off(b,v+w,topB),off(a,v+w,top),inside);girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v+w,botB),off(a,v+w,bot),inside);}}
   // Catenary: a pole with its cantilever arm every ~POLE_STEP m (right side; platforms are all on the left), not at crossings.
   // (and never on a west-park trail: the pole slides along to the next row clear of it)
   if(a.s>=poleNext&&!crossingAt(a.s,2)&&!(a.x<-100&&onWalkPath(off(a,-2.7,0)[0],off(a,-2.7,0)[2],.4))){poleNext=a.s+POLE_STEP;
    const base=a.kind===TrackKind.Sea?a.bed-.4:a.bed,top=a.bed+WIRE_Y+.55,P=off(a,-2.7,0),r=.11;
    poles.box(P[0],(base+top)/2,P[2],a.tx,a.tz,r,r,(top-base)/2);
    poles.beam([P[0],a.bed+WIRE_Y+.4,P[2]],off(a,.25,a.bed+WIRE_Y+.4),.05);poles.beam(off(a,-2.6,a.bed+WIRE_Y-.3),off(a,-.2,a.bed+WIRE_Y+.38),.035);
    poles.beam(off(a,0,a.bed+WIRE_Y+.4),off(a,0,a.bed+WIRE_Y),.025);
    if(a.kind!==TrackKind.Sea)solid({x:P[0],z:P[2],w:.4,d:.4});}
   wire.beam(off(a,0,a.bed+WIRE_Y),off(b,0,b.bed+WIRE_Y),.022);
  }
  // Trestle piers in this chunk: a cap beam across and two columns down into the sea.
  for(const p of L.piers){const i=Math.round(p.s/TRACK_DS);if(i<c0||i>=c1)continue;
   const capY=p.bed-.6;piers.box(p.x,capY,p.z,p.tx,p.tz,.35,1.55,.2,false);
   for(const side of [-1,1]){const x=p.x+p.tz*PIER_COLUMN_OFFSET*side,z=p.z-p.tx*PIER_COLUMN_OFFSET*side,top=capY-.2,foot=-3.2;piers.box(x,(top+foot)/2,z,p.tx,p.tz,PIER_COLUMN_HALF,PIER_COLUMN_HALF,(top-foot)/2);}}
  emit(rails,C.rail,ox,oz);emit(railTops,C.railTop,ox,oz);emit(sleepers,C.sleeper,ox,oz);emit(ballast,C.ballast,ox,oz);emit(girders,C.girder,ox,oz);emit(piers,C.pier,ox,oz);
  emit(wall,C.wall,ox,oz);emit(wallTop,C.wallTop,ox,oz);emit(poles,C.pole,ox,oz);emit(wire,C.wire,ox,oz);emit(xdeck,C.crossDeck,ox,oz);
 }

 // ------------------------------------------------------------------ level crossings (static)
 for(const c of TRAIN_CROSSINGS){const a=trackAt(c.s),i=Math.round(c.s/TRACK_DS)%n,bed=BED[i],g=new Geo(),gy=new Geo(),gk=new Geo(),gl=new Geo();
  for(const [u,v] of [[-(c.width/2+.5),2.6],[c.width/2+.5,-2.6]]){const x=a.x+a.tx*u+a.tz*v,z=a.z+a.tz*u-a.tx*v,base=bed;
   for(let k=0;k<7;k++)(k%2?gk:gy).box(x,base+.2+k*.32,z,a.tx,a.tz,.075,.075,.16);
   // Crossbuck (two crossed boards) facing the path, and the twin lamps under it (unlit: Phase 2 flashes them).
   const cy=base+2.75,fx=a.tx*Math.sign(u)*-1,fz=a.tz*Math.sign(u)*-1;
   for(const sgn of [-1,1]){const dx=a.tz*.55,dz=-a.tx*.55;g.beam([x-dx,cy-.42*sgn,z-dz],[x+dx,cy+.42*sgn,z+dz],.07);}
   gl.box(x+fx*.12+a.tz*.32,base+2.05,z+fz*.12-a.tx*.32,a.tx,a.tz,.06,.13,.13);gl.box(x+fx*.12-a.tz*.32,base+2.05,z+fz*.12+a.tx*.32,a.tx,a.tz,.06,.13,.13);
   gk.box(x,base+2.05,z,a.tx,a.tz,.05,.48,.04);
   if(K[i]!==TrackKind.Sea)solid({x,z,w:.3,d:.3});}
  const ox=Math.round(a.x),oz=Math.round(a.z);emit(gy,C.yellow,ox,oz);emit(gk,C.black,ox,oz);emit(g,C.yellow,ox,oz);emit(gl,C.lampOff,ox,oz);}

 // ------------------------------------------------------------------ stations
 const atlas=stationAtlas();const boardMat=tools.boardMaterial(atlas);
 for(const st of TRAIN_STATIONS)buildStation(st);
 function buildStation(st:TrainStation){
  const c=trackAt(st.s),i0=Math.round(st.s/TRACK_DS)%n,bed=BED[i0],south=st.id==='south',top=bed+STATION_PLATFORM_Y,sg=st.side;
  const nrm=leftNormal(c.tx,c.tz),P=(u:number,v:number,y:number)=>[c.x+c.tx*u+nrm.x*sg*v,y,c.z+c.tz*u+nrm.z*sg*v];
  const ox=Math.round(c.x),oz=Math.round(c.z);
  const plat=new Geo(),platSide=new Geo(),edge=new Geo(),plaster=new Geo(),timber=new Geo(),deck=new Geo(),roof=new Geo(),ridge=new Geo(),pane=new Geo(),lantern=new Geo(),cap=new Geo(),bench=new Geo();
  const v0=1.45,v1=south?8.1:5.45,depth=v1-v0;
  // Platform in 5 m pieces along the curve (each on its own frame), with the yellow edge strip.
  for(let u=-STATION_HALF;u<STATION_HALF;u+=5){const f=trackAt(st.s+u+2.5),fn=leftNormal(f.tx,f.tz),Q=(v:number,y:number)=>[f.x+fn.x*sg*v,y,f.z+fn.z*sg*v];
   const m=Q(v0+depth/2,0),foot=bed-.05;
   plat.box(m[0],top-.04,m[2],f.tx,f.tz,2.53,depth/2,.04);platSide.box(m[0],(top-.08+foot)/2,m[2],f.tx,f.tz,2.5,depth/2-.02,(top-.08-foot)/2);
   const e=Q(v0+.28,0);edge.box(e[0],top+.005,e[2],f.tx,f.tz,2.53,.18,.006);
   // Walk surfaces: one box when the piece is near square to the axes, else overlapping 2.3 m tiles (no gaps at any yaw).
   const square=Math.min(Math.abs(f.tx),Math.abs(f.tz))<.2;
   {if(square){const ax=Math.abs(f.tx),az=Math.abs(f.tz);walkSurfaces.push({x:m[0],z:m[2],w:5*ax+depth*az,d:5*az+depth*ax,height:top,stepUp:.6});}
    else for(let a=.8;a<5;a+=1.6)for(let b=v0+1.1;b<v1-.6;b+=1.6){const q=trackAt(st.s+u+a),qn=leftNormal(q.tx,q.tz);walkSurfaces.push({x:q.x+qn.x*sg*b,z:q.z+qn.z*sg*b,w:2.3,d:2.3,height:top,stepUp:.6});}}}
  if(south){// The beach strip between the boardwalk rail and the line: a step down to the boardwalk along the rail's openings.
   const s=P(0,v1+.35,0);walkSurfaces.push({x:s[0],z:s[2],w:STATION_HALF*2,d:.7,height:top/2,stepUp:.6});
   deck.box(s[0],top/2-.04,s[2],c.tx,c.tz,STATION_HALF,.35,.04);platSide.box(s[0],(top/2-.08-.1)/2,s[2],c.tx,c.tz,STATION_HALF,.33,(top/2-.08+.1)/2);}
  // The station house behind the platform (South: on it, back to the boardwalk): 8 m along the line, cream walls, dark timber.
  const hd=south?3.8:4.6,hv0=south?v1-hd:v1,hv1=hv0+hd,hm=(hv0+hv1)/2,H=2.9,y0=top;
  const hc=P(0,hm,0);deck.box(hc[0],y0+.05,hc[2],c.tx,c.tz,4.3,hd/2+.3,.05);
  // Walls: back and two ends solid; the platform side open in the middle (ticket window and doorway) with posts and a lintel.
  const wall=(u0:number,u1:number,v:number,y1:number,y2:number,thick=.09)=>{const m=P((u0+u1)/2,v,0);plaster.box(m[0],(y1+y2)/2,m[2],c.tx,c.tz,(u1-u0)/2,thick,(y2-y1)/2);};
  wall(-4,4,hv1-.09,y0+.1,y0+H);
  {const e=(u:number)=>{const a=P(u,hm,0);plaster.box(a[0],y0+.1+(H-.1)/2,a[2],c.tx,c.tz,.09,hd/2-.1,(H-.1)/2);};e(-3.91);e(3.91);}
  wall(-4,-2.4,hv0+.09,y0+.1,y0+H);wall(2.4,4,hv0+.09,y0+.1,y0+H);wall(-2.4,2.4,hv0+.09,y0+2.25,y0+H);
  // Ticket-window panes on the front and both ends: warm at night (machineNightGlow).
  for(const u of [-3.2,3.2]){const a=P(u,hv0+.03,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.5,.03,.42);}
  for(const u of [-3.97,3.97]){const a=P(u,hm,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.03,.8,.42);}
  {const a=P(0,hv0+.6,0);pane.box(a[0],y0+1.3,a[2],c.tx,c.tz,1.6,.03,.75);}
  // Dark timber: corner and door posts, a sill band and the eave beam.
  for(const [u,v] of [[-4,hv0],[4,hv0],[-4,hv1],[4,hv1],[-2.4,hv0],[2.4,hv0]]){const a=P(u,v,0);timber.box(a[0],y0+H/2+.05,a[2],c.tx,c.tz,.11,.11,H/2+.05);}
  {const a=P(0,hv0,0);timber.box(a[0],y0+2.3,a[2],c.tx,c.tz,2.4,.12,.07);timber.box(a[0],y0+.45,a[2],c.tx,c.tz,4,.1,.05);const b=P(0,hm,0);timber.box(b[0],y0+H+.07,b[2],c.tx,c.tz,4.15,hd/2+.12,.07);}
  // Tiled hip roof (kawara grey-blue), its eaves well out over the platform, a dark ridge and two ridge ends.
  {const ew=4.8,ed=hd/2+1.25,rh=1.9,ry=y0+H+.14,ridgeL=ew-ed*.75,R=(u:number,v:number,y:number)=>P(u,hm+v,y),inside=R(0,0,ry);
   const e1=R(-ew,-ed,ry),e2=R(ew,-ed,ry),e3=R(ew,ed,ry),e4=R(-ew,ed,ry),r1=R(-ridgeL,0,ry+rh),r2=R(ridgeL,0,ry+rh);
   roof.quad(e1,e2,r2,r1,inside);roof.quad(e3,e4,r1,r2,inside);roof.tri(e2,e3,r2);roof.tri(e4,e1,r1);roof.quad(e1,e4,e3,e2,R(0,0,ry+1));
   ridge.beam(R(-ridgeL-.1,0,ry+rh+.05),R(ridgeL+.1,0,ry+rh+.05),.12);
   for(const s of [-1,1])for(const t of [-1,1])ridge.beam(R(s*ridgeL,0,ry+rh+.03),R(s*ew,t*ed,ry+.05),.06);
   // Tile courses: three thin darker bands across each long slope.
   for(const k of [.3,.55,.8])for(const t of [-1,1]){const y=ry+rh*k,v=t*ed*(1-k),u=ew-(ew-ridgeL)*k;ridge.beam(R(-u,v,y+.02),R(u,v,y+.02),.025);}
   // Four paper lanterns under the front eave.
   for(const u of [-3.3,-1.1,1.1,3.3]){const a=R(u,-ed+.55,0);lantern.box(a[0],ry-.75,a[2],c.tx,c.tz,.21,.21,.24);cap.box(a[0],ry-.48,a[2],c.tx,c.tz,.14,.14,.03);cap.box(a[0],ry-1.02,a[2],c.tx,c.tz,.14,.14,.03);cap.beam([a[0],ry-.45,a[2]],[a[0],ry,a[2]],.012);}}
  // A bench on the platform, by the house's down-line end.
  {const a=P(-9,v0+2.2,0);bench.box(a[0],top+.45,a[2],c.tx,c.tz,1,.24,.04);const b=P(-9,v0+2.42,0);bench.box(b[0],top+.75,b[2],c.tx,c.tz,1,.03,.18);
   for(const u of [-9.8,-8.2]){const l=P(u,v0+2.2,0);timber.box(l[0],top+.22,l[2],c.tx,c.tz,.04,.2,.22);}}
  emit(plat,C.platform,ox,oz);emit(platSide,C.platformSide,ox,oz);emit(edge,C.edge,ox,oz);emit(plaster,C.plaster,ox,oz);emit(timber,C.timber,ox,oz);emit(deck,C.deck,ox,oz);
  emit(roof,C.roof,ox,oz);emit(ridge,C.ridge,ox,oz);emit(cap,C.cap,ox,oz);emit(bench,C.bench,ox,oz);
  {const m=emit(pane,C.pane,ox,oz);if(m)lit(m,.9,true);}{const m=emit(lantern,C.lantern,ox,oz);if(m)lit(m,1);}
  // Colliders: the house (axis-aligned stations one box; the diagonal Summit one a ring of 1.2 m tiles round its walls).
  // Within ~12° of the axes the house's own bounding box (a few cm larger than the house).
  const sq=Math.min(Math.abs(c.tx),Math.abs(c.tz))<.2;
  if(sq){const ax=Math.abs(c.tx),az=Math.abs(c.tz);solid({x:hc[0],z:hc[2],w:8.2*ax+(hd+.2)*az,d:8.2*az+(hd+.2)*ax});}
  else{for(let u=-4;u<=4.01;u+=1.2)for(const v of [hv0,hv1]){const a=P(u,v,0);solid({x:a[0],z:a[2],w:1.2,d:1.2});}
   for(let v=hv0;v<=hv1+.01;v+=1.2)for(const u of [-4,4]){const a=P(u,v,0);solid({x:a[0],z:a[2],w:1.2,d:1.2});}}
  // The boards: station name board (two faces, the far side's arrows mirrored) on two posts at the up-line end, and the line board.
  const board=(u:number,v:number,y:number,w:number,h:number,face:number,uv:[number,number,number,number])=>{
   const g=new T.PlaneGeometry(w,h),a=g.getAttribute('uv') as T.BufferAttribute;for(let k=0;k<a.count;k++)a.setXY(k,uv[0]+a.getX(k)*(uv[2]-uv[0]),1-uv[3]+a.getY(k)*(uv[3]-uv[1]));
   const m=new T.Mesh(g,boardMat),p=P(u,v,y),fx=-nrm.x*sg*face,fz=-nrm.z*sg*face;m.position.set(p[0],p[1],p[2]);m.rotation.y=Math.atan2(fx,fz);m.userData.train=true;m.userData.skipRoofObstacle=true;town.add(m);};
  const row=TRAIN_STATIONS.indexOf(st),rv=(r:number)=>[r*ATLAS_ROW/1024,(r+1)*ATLAS_ROW/1024] as const,[r0,r1]=rv(row);
  board(9.5,v0+2.1,top+1.95,2.9,1,1,[0,r0,.5,r1]);board(9.5,v0+2.14,top+1.95,2.9,1,-1,[.5,r0,1,r1]);
  {const posts=new Geo();for(const u of [8.3,10.7]){const a=P(u,v0+2.12,0);posts.box(a[0],top+1.2,a[2],c.tx,c.tz,.06,.06,1.2);solid({x:a[0],z:a[2],w:.3,d:.3});}
   const lb=P(-12.5,v0+2.12,0);posts.box(lb[0],top+.9,lb[2],c.tx,c.tz,.05,.05,.9);emit(posts,C.timber,ox,oz);solid({x:lb[0],z:lb[2],w:.3,d:.3});}
  board(-12.5,v0+2.08,top+1.75,1.9,.54,1,[0,LINE_ROW0/1024,.5,1]);board(-12.5,v0+2.16,top+1.75,1.9,.54,-1,[0,LINE_ROW0/1024,.5,1]);
 }

 // ------------------------------------------------------------------ Summit tunnel: portals (paint) and the tube (own mesh)
 const portalArch=()=>{const s=new T.Shape(),r=TUNNEL_HALF_WIDTH,spring=2.4;s.moveTo(-r,-.3);s.lineTo(-r,spring);s.absarc(0,spring,r,Math.PI,0,true);s.lineTo(r,-.3);s.lineTo(-r,-.3);return s;};
 for(const p of [TUNNEL.west,TUNNEL.east]){const west=p===TUNNEL.west,t=trackAt(p.s),o={x:west?-t.tx:t.tx,z:west?-t.tz:t.tz},a={x:o.z,z:-o.x};
  const ground=summitGround(p.x-o.x*1.5,p.z-o.z*1.5),Htop=Math.max(TUNNEL_BED+7.2,summitGround(p.x+o.x*-4,p.z+o.z*-4)+.8)-TUNNEL_BED,half=10.5;void ground;
  const shape=new T.Shape();shape.moveTo(-half,-.6);shape.lineTo(half,-.6);shape.lineTo(half,Htop);shape.lineTo(-half,Htop);shape.lineTo(-half,-.6);shape.holes.push(portalArch());
  const basis=new T.Matrix4().makeBasis(new T.Vector3(a.x,0,a.z),new T.Vector3(0,1,0),new T.Vector3(o.x,0,o.z));
  const wallG=new T.ExtrudeGeometry(shape,{depth:1.2,bevelEnabled:false,curveSegments:10});wallG.applyMatrix4(basis);
  skip(put(wallG,C.stone,p.x,TUNNEL_BED,p.z));
  // Coping on top, a darker arch ring and the dark mouth just inside; a hood over the carve behind the headwall.
  const g=new Geo(),gd=new Geo();g.box(p.x+o.x*.6,TUNNEL_BED+Htop+.12,p.z+o.z*.6,a.x,a.z,half+.2,.8,.12,false);
  for(let k=0;k<=10;k++){const ang=Math.PI*k/10,x0=Math.cos(ang)*(TUNNEL_HALF_WIDTH+.25),y0=2.4+Math.sin(ang)*(TUNNEL_HALF_WIDTH+.25);gd.box(p.x+a.x*x0+o.x*1.22,TUNNEL_BED+y0,p.z+a.z*x0+o.z*1.22,a.x,a.z,.32,.04,.32);}
  const hoodIn=MOUTH_CARVE+.6,hoodY0=TUNNEL_BED+2.4+TUNNEL_HALF_WIDTH+.2;g.box(p.x-o.x*hoodIn/2,(hoodY0+TUNNEL_BED+Htop)/2,p.z-o.z*hoodIn/2,a.x,a.z,TUNNEL_HALF_WIDTH+2.2,hoodIn/2,(TUNNEL_BED+Htop-hoodY0)/2,false);
  for(const sgn of [-1,1])g.box(p.x-o.x*hoodIn/2+a.x*sgn*(TUNNEL_HALF_WIDTH+.25),TUNNEL_BED+1.6,p.z-o.z*hoodIn/2+a.z*sgn*(TUNNEL_HALF_WIDTH+.25),a.x,a.z,.25,hoodIn/2,2.4,false);
  const ox=Math.round(p.x),oz=Math.round(p.z);emit(g,C.stoneDark,ox,oz);emit(gd,C.stoneDark,ox,oz);
  const mouth=new T.ShapeGeometry(portalArch(),10);mouth.applyMatrix4(basis);skip(put(mouth,C.mouth,p.x-o.x*.35,TUNNEL_BED,p.z-o.z*.35));
  solid(...portalColliders(p.x,p.z,o,a,half));
 }
 const W=TUNNEL.west,E=TUNNEL.east,cam=new T.Vector3();
 const tubeRoot=new T.Group();tubeRoot.name='train-tunnel';const tube=buildTube();tubeRoot.add(tube);tube.visible=false;
 return {
  /** Added to the scene after the batching pass (its own mesh, never merged). */
  tubeRoot,
  movedProps:()=>moved,addMoved:(k:number)=>{moved+=k;},
  /** The tube shows only near a portal or inside (one distance test per frame). */
  update(camera:T.Camera){camera.getWorldPosition(cam);const near=Math.hypot(cam.x-W.x,cam.z-W.z)<TUBE_SHOW||Math.hypot(cam.x-E.x,cam.z-E.z)<TUBE_SHOW||insideTunnel(cam.x,cam.z);if(near!==tube.visible)tube.visible=near;},
  dispose(){tube.geometry.dispose();(tube.material as T.Material).dispose();tubeRoot.removeFromParent();},
 };
 function insideTunnel(x:number,z:number){const t=trackAt(W.s),dx=E.x-W.x,dz=E.z-W.z,l2=dx*dx+dz*dz,f=((x-W.x)*dx+(z-W.z)*dz)/l2;void t;if(f<0||f>1)return false;return Math.abs((x-W.x)*dz-(z-W.z)*dx)/Math.sqrt(l2)<TUNNEL_HALF_WIDTH+2;}
 function buildTube(){
  const pos:number[]=[],col:number[]=[],idx:number[]=[],prof:[number,number][]=[[-TUNNEL_HALF_WIDTH,0],[-TUNNEL_HALF_WIDTH,2.4]];for(let k=1;k<10;k++){const a=Math.PI-Math.PI*k/10;prof.push([Math.cos(a)*TUNNEL_HALF_WIDTH,2.4+Math.sin(a)*TUNNEL_HALF_WIDTH]);}prof.push([TUNNEL_HALF_WIDTH,2.4],[TUNNEL_HALF_WIDTH,0]);
  const len=E.s-W.s,step=3,rings=Math.ceil(len/step)+1,wallC=new T.Color('#4a4642'),lampC=new T.Color('#ffd99a'),tmp=new T.Color();
  for(let r=0;r<rings;r++){const s=W.s-.3+Math.min(len+.6,r*step),q=trackAt(s),lamp=Math.exp(-((((s-W.s)%15)-7.5)**2)/5);
   for(const [v,y] of prof){pos.push(q.x+q.tz*v,TUNNEL_BED+y,q.z-q.tx*v);const up=y/(2.4+TUNNEL_HALF_WIDTH);tmp.copy(wallC).multiplyScalar(.35+.4*up).lerp(lampC,.75*lamp*Math.max(0,1-Math.abs(up-.55)*2.2));col.push(tmp.r,tmp.g,tmp.b);}}
  const per=prof.length;for(let r=0;r<rings-1;r++)for(let k=0;k<per-1;k++){const a=r*per+k,b=a+1,c=a+per,d=c+1;idx.push(a,c,b,b,c,d);}
  // The track inside: ballast floor, sleepers and rails in dim baked colours.
  const add=(g:Geo,color:string,shade:number)=>{const base=pos.length/3;tmp.set(color).multiplyScalar(shade);for(let k=0;k<g.p.length;k+=3){pos.push(g.p[k],g.p[k+1],g.p[k+2]);col.push(tmp.r,tmp.g,tmp.b);}for(let k=0;k<g.p.length/3;k++)idx.push(base+k);};
  const floor=new Geo(),sl=new Geo(),rl=new Geo();
  for(let s=W.s-.3;s<E.s+.3;s+=TRACK_DS){const a=trackAt(s),b=trackAt(s+TRACK_DS),A=(q:typeof a,v:number,y:number)=>[q.x+q.tz*v,y,q.z-q.tx*v];
   floor.quad(A(a,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,0,TUNNEL_BED-1));
   for(const f of [.25,.75])sl.box(a.x+(b.x-a.x)*f,TUNNEL_BED+SLEEPER_TOP-.05,a.z+(b.z-a.z)*f,a.tx,a.tz,.13,1.15,.05);
   for(const v of [-RAIL_HALF_GAUGE,RAIL_HALF_GAUGE])rl.quad(A(a,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v,0));}
  add(floor,C.ballast,.3);add(sl,C.sleeper,.35);add(rl,C.railTop,.55);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeBoundingSphere();
  const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}));m.name='train-tunnel-tube';m.matrixAutoUpdate=false;m.userData.ownDraw=true;return m;
 }
 function portalColliders(x:number,z:number,o:{x:number;z:number},a:{x:number;z:number},half:number){const out:Obstacle[]=[];
  // The headwall either side of the arch (the arch itself stays open; the hill behind it is too steep to walk).
  for(let v=TUNNEL_HALF_WIDTH+.6;v<=half;v+=1.2)for(const sgn of [-1,1])out.push({x:x+a.x*v*sgn+o.x*.6,z:z+a.z*v*sgn+o.z*.6,w:1.3,d:1.3});return out;}
}

// ---- The board atlas: 1024 × 1024. Rows 0-4: one station each, its name board's two faces (x 0-512 front, 512-1024 back, the
// back's arrows swapped so they point the right way from that side). LINE_ROW0 down: the line board (same on every station).
export const ATLAS_ROW=176,LINE_ROW0=5*ATLAS_ROW+8;
function stationAtlas(){
 const cv=document.createElement('canvas');cv.width=1024;cv.height=1024;const g=cv.getContext('2d');if(!g)return cv;
 const sans='system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',LINE='#2f7d5b';
 TRAIN_STATIONS.forEach((st,r)=>{const prev=TRAIN_STATIONS[(r+4)%5],next=TRAIN_STATIONS[(r+1)%5];
  for(const face of [0,1]){const x0=face*512,y0=r*ATLAS_ROW,W=512,H=ATLAS_ROW;
   g.fillStyle='#fbfaf4';g.fillRect(x0,y0,W,H);g.fillStyle='#2b2b2b';g.fillRect(x0,y0,W,5);g.fillRect(x0,y0+H-5,W,5);
   // Number badge and name.
   g.fillStyle=LINE;g.beginPath();g.arc(x0+62,y0+56,30,0,Math.PI*2);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.font=`800 36px ${sans}`;g.fillText(String(st.number),x0+62,y0+58);
   g.fillStyle='#1f1f1f';g.font=`800 ${st.name.length>9?50:60}px ${sans}`;g.fillText(st.name,x0+W/2+22,y0+52);
   g.fillStyle='#555';g.font=`600 21px ${sans}`;g.fillText(st.sub,x0+W/2+22,y0+94);
   // The football line: the station number read as a shirt number.
   g.fillStyle='#7a5c3e';g.font=`italic 600 17px ${sans}`;g.fillText(`${st.number} · ${st.shirt}`,x0+W/2,y0+119);
   // Line band: previous ← · → next (mirrored on the back face).
   g.fillStyle=LINE;g.fillRect(x0+5,y0+132,W-10,36);g.fillStyle='#fff';g.font=`700 20px ${sans}`;
   const left=face===0?prev:next,right=face===0?next:prev;g.textAlign='left';g.fillText(`◀ ${left.name}`,x0+16,y0+151);g.textAlign='right';g.fillText(`${right.name} ▶`,x0+W-16,y0+151);}});
 {const y0=LINE_ROW0,W=512,H=1024-LINE_ROW0;g.fillStyle='#244d49';g.fillRect(0,y0,W,H);g.fillStyle='#fff0cf';g.textAlign='center';g.textBaseline='middle';
  g.font=`800 34px ${sans}`;g.fillText('ISLAND LINE',W/2,y0+30);g.font=`600 19px ${sans}`;g.fillText('North · West Beach · South · Summit Isle · Coral Cay',W/2,y0+68);
  g.font=`700 19px ${sans}`;g.fillStyle='#f2c230';g.fillText('Trains every 2 minutes · Free ride',W/2,y0+102);}
 return cv;
}
