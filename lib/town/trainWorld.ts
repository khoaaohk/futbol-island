/**
 * The Island Line's static scenery (train Phase 1, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md §9.1).
 * Built inside buildTown (world.ts) before the batching pass, so every solid piece is a plain palette paint and folds into the
 * island's existing 50 m paint batches (vertex colours, one shared material): on land that is NO new draw call.
 *
 *  - Track: rails, sleepers and ballast as ~100 m chunks of merged geometry along the line (one mesh per paint per chunk, each
 *    placed at its chunk's centre so it lands in, and is culled with, that chunk's batch). Over the sea the chunk also carries
 *    the trestle (deck girders, cap beams and the piers' columns) or the south sea wall; ~3 new sea cells, culled per chunk.
 *  - Catenary: wooden poles every ~30 m (in the chunks); the arms and ONE continuous contact wire are their own mesh with a
 *    near-camera fade (buildCatenary, Looks 2).
 *  - Summit Isle tunnel: two stone portals (headwall with an arched mouth, dark inside, a hood over the carve behind it) and ONE
 *    tube mesh (walls, track and baked lamp light in vertex colours, unlit material) shown only while the camera is within
 *    TUBE_SHOW m of a portal or inside (update(), one distance test per frame).
 *  - Five static stations: platform (yellow edge strip), a small wooden Japanese-style station house (tiled hip roof, cream walls,
 *    dark timber, warm panes that glow at night through machineNightGlow, four paper lanterns), a bench and two boards (station
 *    name board, line board) cut from ONE canvas atlas: one textured material for all five stations (one draw where one is seen).
 *  - Five level crossing decks; poles, lamps, barriers and bells are Phase 2's crossing machines (trainRunning.ts).
 * Colliders: house footprints, board posts, catenary poles and crossing poles on land; platforms are walk surfaces (one step up);
 * the South platform over the water is a landable deck. Swimmers meet the piers and the sea wall (trainLayout.trainSwimBlocked).
 * Nothing here animates and nothing runs per frame except the tube's visibility test.
 */
import * as T from 'three';
import type {Obstacle} from './simulation';
import {summitGround} from './summitIsle';
import {TRACK,TRACK_DS,TrackKind,onSummitTrackS,SOUTH_BRIDGE,bedAt,TRAIN_STATIONS,TRAIN_CROSSINGS,TUNNEL,TUNNEL_BED,TUNNEL_HALF_WIDTH,STATION_HALF,STATION_PLATFORM_Y,trackAt,leftNormal,wrapS,type TrainStation} from './trainTrack';
import {trainLayout,PIER_COLUMN_OFFSET,PIER_COLUMN_HALF,MAIN_COLUMN_HALF,SEA_WALL_HALF,XING_FOOT} from './trainLayout';
import {onWalkPath} from './westParkLayout';
import {onLand} from './landmass';
import {effectiveTier,LOWEST_TIER} from '../graphics/heatTier';

type Surface=Obstacle&{height:number};
export type TrainTools={
 put:(g:T.BufferGeometry,c:string,x:number,y:number,z:number)=>T.Mesh;
 lit:(m:T.Mesh,w:number,warm?:boolean)=>T.Mesh;
 /** A textured board material registered with the island's sign list (disposal, night emissive). */
 boardMaterial:(canvas:HTMLCanvasElement)=>T.Material;
 town:T.Group;obstacles:Obstacle[];walkSurfaces:Surface[];
 /** Lighter line (Nov 23 2026, efficiency): default = the heat tier when the world is built is the lowest one (Battery saver). */
 lite?:boolean;
};
const C={rail:'#5d6166',railTop:'#a7abae',sleeper:'#6f5843',sleeperBed:'#897c6e',ballast:'#9a948a',girder:'#6d5640',pier:'#cbc4b5',wall:'#b8b0a1',wallTop:'#cfc8ba',pole:'#7a5c3e',wire:'#33393a',
 platform:'#d3cbbb',platformSide:'#a8a091',footing:'#6f675b',edge:'#f2c230',plaster:'#f0e6cc',timber:'#5e4630',deck:'#a57f57',roof:'#566270',ridge:'#3d4650',pane:'#a9c9d2',lantern:'#d9483a',cap:'#2c2a28',
 bench:'#b48a5e',crossDeck:'#55524d',stone:'#aaa395',stoneDark:'#8d8679',mouth:'#121110'} as const;
/** Spots a catenary pole must not stand on (it slides to the next row): the Starfish sandbar's hidden ball (coralCayBalls.ts cay-barefoot). */
const POLE_KEEP_CLEAR:readonly (readonly [number,number])[]=[[340.3,-214.85]];
/** Summit portals: headwall half width, its batter (m back per m up) and the wing walls' run out along the banks. */
export const PORTAL_HALF=6.6,PORTAL_LEAN=.16,WING_LENGTH=4;
export const TUBE_SHOW=60,CHUNK_LENGTH=100,POLE_STEP=30,RAIL_HALF_GAUGE=.68,BALLAST_TOP=.12,SLEEPER_TOP=.2,RAIL_TOP=.34,WIRE_Y=5.15;
/** The contact wire's half section (m: a 3.6 cm diamond) and the catenary's near-camera fade: gone within CAT_FADE_NEAR m, dithered in by CAT_FADE_FAR m. */
export const WIRE_R=.014,CAT_FADE_NEAR=4.5,CAT_FADE_FAR=8;// POLISH 3 (owner: the wire read thick from a roof camera 3-6 m off): thinner (2.8 cm), faded out to 4.5 m and dithered in by 8 m

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
 beam(a:number[],b:number[],r:number,diamond=false){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz)||1e-6,d=[dx/l,dy/l,dz/l];
  const up=Math.abs(d[1])>.9?[1,0,0]:[0,1,0],s1=[d[1]*up[2]-d[2]*up[1],d[2]*up[0]-d[0]*up[2],d[0]*up[1]-d[1]*up[0]],l1=Math.hypot(...s1);for(let i=0;i<3;i++)s1[i]/=l1;
  const s2=[d[1]*s1[2]-d[2]*s1[1],d[2]*s1[0]-d[0]*s1[2],d[0]*s1[1]-d[1]*s1[0]],c=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const P=(e:number[],i:number,j:number)=>[e[0]+(s1[0]*i+s2[0]*j)*r,e[1]+(s1[1]*i+s2[1]*j)*r,e[2]+(s1[2]*i+s2[2]*j)*r];
  // diamond: corners on the axes, so no face is level (wires, arms, ridges: nothing to land on from the air).
  for(const [i,j,k,m] of diamond?[[1,0,0,-1],[0,-1,-1,0],[-1,0,0,1],[0,1,1,0]]:[[1,1,1,-1],[1,-1,-1,-1],[-1,-1,-1,1],[-1,1,1,1]])this.quad(P(a,i,j),P(b,i,j),P(b,k,m),P(a,k,m),c);}
 get empty(){return this.p.length===0;}
 build(ox:number,oz:number){const g=new T.BufferGeometry(),p=new Float32Array(this.p);for(let i=0;i<p.length;i+=3){p[i]-=ox;p[i+2]-=oz;}
  g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(new Float32Array(this.n),3));return g;}
}

/** The South Bridge's main-span trusses (Nov 24 2026): two Pratt pony trusses (bottom chord at the cross girders, top chord
 *  TRUSS_H above the bed, verticals, diagonals falling to mid-span, inclined end posts) outside the cars (half width 1.4) and
 *  inside the catenary poles (2.7 m out), plus a cross girder under the deck at every panel point. ~400 tris. */
export const TRUSS_OFFSET=2.05,TRUSS_H=2.5,TRUSS_PANELS=6;
function bridgeTruss(profile:ReturnType<typeof trainLayout>['profile']):Geo{
 const g=new Geo(),A=SOUTH_BRIDGE.spanA,B=SOUTH_BRIDGE.spanB,N=TRUSS_PANELS;
 const at=(k:number,v:number,dy:number)=>{const s=A+(B-A)*k/N,t=trackAt(s);return [t.x+t.tz*v,bedAt(profile,s)+dy,t.z-t.tx*v];};
 const BOT=-.32,TOP=TRUSS_H;
 for(let k=0;k<=N;k++)g.beam(at(k,-TRUSS_OFFSET,BOT-.08),at(k,TRUSS_OFFSET,BOT-.08),.13);// cross girders (under the sleepers and girders)
 for(const side of [-1,1]){const v=side*TRUSS_OFFSET,b=(k:number)=>at(k,v,BOT),t=(k:number)=>at(k,v,TOP);
  for(let k=0;k<N;k++)g.beam(b(k),b(k+1),.14);
  for(let k=1;k<N-1;k++)g.beam(t(k),t(k+1),.14);
  g.beam(b(0),t(1),.14);g.beam(b(N),t(N-1),.14);
  for(let k=1;k<N;k++)g.beam(b(k),t(k),.08);
  for(let k=1;k<N-1;k++)k<N/2?g.beam(t(k),b(k+1),.08):g.beam(b(k),t(k+1),.08);}
 return g;}

export function buildTrainWorld(tools:TrainTools){
 const {put,lit,town,obstacles,walkSurfaces}=tools;
 // Lowest heat tier at build (the world builds once; Battery saver forces tier 4 from the first frame): no contact wire (poles keep
 // the post and arm, and their colliders), sleepers as ONE flat strip per row in a sleeper-over-ballast colour (on land it is the
 // ballast's own top, lifted to the sleeper top: 4 fewer tris a row; on the trestle 2 tris instead of 4), and the stations without
 // lanterns, tile courses, ridge ends or the bench. Same paints, same batches: no new draw or program. Higher tiers unchanged.
 const lite=tools.lite??effectiveTier()===LOWEST_TIER;
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
 const pierRows=new Set(L.piers.map(p=>Math.round(p.s/TRACK_DS)%n));

 // ------------------------------------------------------------------ bridge heads
 // Nov 24 2026 rebuild (owner shot 36: "not blending in nicely, there are gaps"): one continuous head at every land/trestle joint.
 // A stone abutment with a slight batter (faces lean out 8 cm per metre down), its back wall at the ballast's level with a coping
 // curb each side, and a bearing seat 0.42 m under the bed that the deck's two girders sit ON (they start at the seat, so the
 // sleepers over the joint rest on girders, never in mid-air). Where the line comes off a raised embankment, return wing walls
 // close the embankment's end along its own slope (top following the ballast slope, foot sunk into the sand / sea: no open end, no
 // floating slab). Rip-rap stones (the island's low-poly rock, merged into the chunk's paint batch) round the foot in the water.
 // Same paints, same batches: no new draw or program. Geometry goes into the head row's chunk Geos (set per chunk below).
 let G:{wall:Geo;wallTop:Geo;girders:Geo;ballast:Geo;rocks:Geo}|null=null;
 const ROCK=new T.IcosahedronGeometry(1,0),rockP=ROCK.getAttribute('position');
 function bridgeHead(a:ReturnType<typeof pt>,b:ReturnType<typeof pt>){
  if(!G)return;const {wall,wallTop,girders,ballast,rocks}=G;
  const land=a.kind!==TrackKind.Sea?a:b,sea=land===a?b:a,dir=land===a?1:-1,b0=land.bed,g=onSummitTrackS(land.s)?land.bed:0;
  const P=(u:number,v:number,y:number)=>[land.x+land.tx*u*dir+land.tz*v,y,land.z+land.tz*u*dir-land.tx*v];
  const foot=Math.min(g,0)-1.7,back=-1.1,seat=.35,front=1.25,bat=.08,hw=2.3,yTop=b0+.09,ySeat=b0-.42,inside=P((back+front)/2,0,ySeat-.6);
  const vAt=(y:number)=>hw+(yTop-y)*bat,uFoot=front+(ySeat-foot)*bat;
  // seat, back wall riser and top, front face, sides, back
  wallTop.quad(P(seat,-vAt(ySeat),ySeat),P(front,-vAt(ySeat),ySeat),P(front,vAt(ySeat),ySeat),P(seat,vAt(ySeat),ySeat),inside);
  wall.quad(P(seat,-hw,yTop),P(seat,hw,yTop),P(seat,vAt(ySeat),ySeat),P(seat,-vAt(ySeat),ySeat),P(seat-1,0,ySeat));
  wallTop.quad(P(back,-hw,yTop),P(seat,-hw,yTop),P(seat,hw,yTop),P(back,hw,yTop),inside);
  wall.quad(P(front,-vAt(ySeat),ySeat),P(front,vAt(ySeat),ySeat),P(uFoot,vAt(foot),foot),P(uFoot,-vAt(foot),foot),inside);
  for(const sg of [-1,1]){wall.quad(P(back,sg*hw,yTop),P(seat,sg*hw,yTop),P(seat,sg*vAt(foot),foot),P(back,sg*vAt(foot),foot),inside);
   wall.quad(P(seat,sg*vAt(ySeat),ySeat),P(front,sg*vAt(ySeat),ySeat),P(uFoot,sg*vAt(foot),foot),P(seat,sg*vAt(foot),foot),inside);
   // coping curb on the back wall, outside the ballast
   if(!crossingAt(land.s,4)){const c=P((back+seat)/2,sg*(1.5+hw+.12)/2,yTop+.04);wallTop.box(c[0],c[1],c[2],land.tx,land.tz,(seat-back)/2+.05,(hw+.12-1.5)/2,.04);}}
  wall.quad(P(back,-hw,yTop),P(back,hw,yTop),P(back,hw,foot),P(back,-hw,foot),inside);
  // ballast over the back wall up to the seat (the land rows' ballast top ends at the land point)
  if(land.kind===TrackKind.Land){const t=b0+(lite?SLEEPER_TOP:BALLAST_TOP);ballast.quad(P(-.02,-1.45,t),P(seat,-1.45,t),P(seat,1.45,t),P(-.02,1.45,t),inside);
   ballast.quad(P(seat,-1.45,t),P(seat,1.45,t),P(seat,1.45,yTop-.01),P(seat,-1.45,yTop-.01),P(seat-1,0,yTop));}
  // the joint's girders: from the seat out to the first sea row
  for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.2,A=(vv:number,y:number)=>P(seat+.05,vv,y),B=(vv:number,y:number)=>off(sea,vv,y),top=b0+SLEEPER_TOP-.1,bot=b0-.4,topB=sea.bed+SLEEPER_TOP-.1,botB=sea.bed-.4,ins=P(1,v,b0-.15);
   girders.quad(A(v-w,bot),B(v-w,botB),B(v-w,topB),A(v-w,top),ins);girders.quad(A(v+w,bot),B(v+w,botB),B(v+w,topB),A(v+w,top),ins);girders.quad(A(v-w,bot),B(v-w,botB),B(v+w,botB),A(v+w,bot),ins);
   girders.quad(A(v-w,bot),A(v+w,bot),A(v+w,top),A(v-w,top),P(2,v,b0-.15));}
  // return wing walls: close the embankment's end (its side slope runs from the ballast shoulder at 1.45 m to fa at the ground)
  const fa=land.kind===TrackKind.Land?1.9+(b0-g)*1.4:0,yS=(v:number)=>Math.max(g+.04,b0+.12-(v-1.45)/Math.max(.1,fa-1.45)*(b0+.12-(g-.06)))+.08;
  if(fa+.25>hw+.05)for(const sg of [-1,1]){const v0=hw-.15,v1=fa+.3,u0=-.05,u1=.3,y0=yS(v0),y1=yS(v1);
   wall.quad(P(u1,sg*v0,y0),P(u1,sg*v1,y1),P(u1,sg*v1,foot),P(u1,sg*v0,foot),P(u0-1,sg*(v0+v1)/2,foot));
   wallTop.quad(P(u0,sg*v0,y0),P(u1,sg*v0,y0),P(u1,sg*v1,y1),P(u0,sg*v1,y1),P((u0+u1)/2,sg*(v0+v1)/2,foot));
   wall.quad(P(u0,sg*v1,y1),P(u1,sg*v1,y1),P(u1,sg*v1,foot),P(u0,sg*v1,foot),P((u0+u1)/2,sg*v0,foot));}
  // rip-rap: stones round the foot where it stands in the sea
  if(!lite){let k=0;const put1=(u0:number,v:number)=>{const j=Math.sin(land.s*12.9898+v*78.233)*43758.5453,f=j-Math.floor(j),u=u0+(f-.5)*.6,q=P(u,v+(f-.5)*.3,0);if(onLand(q[0],q[2]))return;k++;const r=.26+f*.36,yaw=k*2.17+f*3,cy=Math.cos(yaw),sy=Math.sin(yaw);
    for(let t=0;t<rockP.count;t+=3){const tri:number[][]=[];for(let j=0;j<3;j++){const x=rockP.getX(t+j)*r,y=rockP.getY(t+j)*r*.55,z=rockP.getZ(t+j)*r;tri.push([q[0]+x*cy-z*sy,-.3-f*.12+y,q[2]+x*sy+z*cy]);}rocks.tri(tri[0],tri[1],tri[2]);}};
   for(let v=-hw-.5;v<=hw+.5;v+=.7){put1(uFoot+.3,v);if(Math.round(v*10)%3===0)put1(uFoot+.95,v+.35);}
   for(const sg of [-1,1]){put1(uFoot+.1,sg*(hw+.9));if(fa+.25>hw+.05)for(let v=hw+.9;v<=fa+.5;v+=.85)put1(.75,sg*v);}}
 }

 // ------------------------------------------------------------------ catenary (Looks 2, Nov 24 2026; owner shots 43, 46)
 // The contact wire is ONE continuous diamond tube round the whole loop (through the tunnel too, under the tube's crown): one ring
 // of 4 corners per track row, shared by the two rows either side, so there is no gap or step at a chunk, pole, bridge head or
 // station. With the poles' thin arms, braces and droppers it is one mesh with its own material that discards every fragment
 // within CAT_FADE_NEAR m of the camera (dithered out to CAT_FADE_FAR m): seen from a roof or a close ride view the wire no
 // longer fills the screen as a dark slab. One draw for the whole catenary (it was a paint per 50 m cell), no per-frame work.
 const catArm=new Geo(),catWire=new Geo();
 if(!lite){const r=WIRE_R,ring=(i:number)=>{const p=pt(i),y=p.bed+WIRE_Y,nx=p.tz,nz=-p.tx;return [[p.x+nx*r,y,p.z+nz*r],[p.x,y+r,p.z],[p.x-nx*r,y,p.z-nz*r],[p.x,y-r,p.z]];};
  let A=ring(0);for(let i=0;i<n;i++){const B=ring(i+1),c=[(A[0][0]+A[2][0])/2,A[0][1],(A[0][2]+A[2][2])/2];for(let k=0;k<4;k++)catWire.quad(A[k],B[k],B[(k+1)%4],A[(k+1)%4],c);A=B;}}

 // ------------------------------------------------------------------ track chunks
 const perChunk=Math.round(CHUNK_LENGTH/TRACK_DS);
 for(let c0=0;c0<n;c0+=perChunk){
  const c1=Math.min(n,c0+perChunk),mid=pt((c0+c1)>>1),ox=Math.round(mid.x),oz=Math.round(mid.z);
  const rails=new Geo(),railTops=new Geo(),sleepers=new Geo(),ballast=new Geo(),girders=new Geo(),piers=new Geo(),wall=new Geo(),wallTop=new Geo(),poles=new Geo(),xdeck=new Geo(),bedTop=new Geo();
  const rocks=new Geo();G={wall,wallTop,girders,ballast,rocks};
  for(let i=c0;i<c1;i++){
   const a=pt(i),b=pt(i+1);if(isTunnel(i)||isTunnel(i+1))continue;
   // Rails: a top and two sides per rail per row (no ends, no bottom).
   for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.055;
    const A0=off(a,v-w,a.bed+RAIL_TOP),A1=off(a,v+w,a.bed+RAIL_TOP),B0=off(b,v-w,b.bed+RAIL_TOP),B1=off(b,v+w,b.bed+RAIL_TOP);
    railTops.quad(A0,B0,B1,A1,[A0[0],A0[1]-1,A0[2]]);
    const a0=off(a,v-w,a.bed+SLEEPER_TOP),a1=off(a,v+w,a.bed+SLEEPER_TOP),b0=off(b,v-w,b.bed+SLEEPER_TOP),b1=off(b,v+w,b.bed+SLEEPER_TOP),mid=off(a,v,a.bed+.27);
    rails.quad(a0,b0,B0,A0,mid);rails.quad(a1,b1,B1,A1,mid);}
   const xing=crossingAt(a.s);
   if(xing){// The crossing deck (Nov 23 2026, owner: flush): a dark top just under the rail heads between and beside the rails, then
    // sloping down to the ground on both sides (to XING_FOOT, just past the ballast), so it reads as part of the road, not a slab.
    const yt=RAIL_TOP-.03,inside=off(a,0,a.bed-1),gy=(p:typeof a)=>onSummitTrackS(p.s)?p.bed:0;
    xdeck.quad(off(a,-1,a.bed+yt),off(b,-1,b.bed+yt),off(b,1,b.bed+yt),off(a,1,a.bed+yt),inside);
    for(const side of [-1,1])xdeck.quad(off(a,side,a.bed+yt),off(b,side,b.bed+yt),off(b,side*XING_FOOT,gy(b)+.01),off(a,side*XING_FOOT,gy(a)+.01),inside);
    // Nov 24 2026 (owner 13.png, "skewed slab" at West Beach): the deck's two ends are closed down to the ground (it was a thin
    // sheet with open ends over the cut ballast, reading as a plank lying askew); the end faces also cap the ballast's section.
    for(const [p,q,first] of [[a,b,!crossingAt(pt(i-1).s)],[b,a,!crossingAt(b.s)]] as const){if(!first)continue;
     const g=gy(p)-.06,inn=[p.x+(q.x-p.x)*.5,p.bed,p.z+(q.z-p.z)*.5];
     xdeck.quad(off(p,-1,p.bed+yt),off(p,1,p.bed+yt),off(p,1,g),off(p,-1,g),inn);
     for(const side of [-1,1])xdeck.quad(off(p,side,p.bed+yt),off(p,side*XING_FOOT,gy(p)+.01),off(p,side*XING_FOOT,g),off(p,side,g),inn);}}
   // Sleepers every 1 m (two per row) on ballast; the sea wall and the trestle carry them too.
   if(lite&&!xing){if(a.kind===TrackKind.Sea||b.kind===TrackKind.Sea)sleepers.quad(off(a,-1.15,a.bed+SLEEPER_TOP),off(b,-1.15,b.bed+SLEEPER_TOP),off(b,1.15,b.bed+SLEEPER_TOP),off(a,1.15,a.bed+SLEEPER_TOP),off(a,0,a.bed-1));}
   else for(const f of [.25,.75]){const x=a.x+(b.x-a.x)*f,z=a.z+(b.z-a.z)*f,y=a.bed+(b.bed-a.bed)*f;if(!xing){/* Nov 23 2026 (heat): the top face only (2 tris, was 6): the 0.1 m sides never read from the game's camera. */const T0=[x-a.tx*.13+a.tz*1.15,y+SLEEPER_TOP,z-a.tz*.13-a.tx*1.15],T1=[x+a.tx*.13+a.tz*1.15,y+SLEEPER_TOP,z+a.tz*.13-a.tx*1.15],T2=[x+a.tx*.13-a.tz*1.15,y+SLEEPER_TOP,z+a.tz*.13+a.tx*1.15],T3=[x-a.tx*.13-a.tz*1.15,y+SLEEPER_TOP,z-a.tz*.13+a.tx*1.15];sleepers.quad(T0,T1,T2,T3,[x,y,z]);}}
   if(a.kind!==TrackKind.Sea&&b.kind!==TrackKind.Sea&&!xing){// Ballast: one continuous trapezoid strip on every land row (Nov 23 2026: was broken into
    // slabs round the crossings); it stops only under a crossing deck. On the bridge-head embankment (bed above the ground, trackProfile
    // RAMP_LAND) its sides run on down to the ground, widening as they go.
    const gy=(p:typeof a)=>onSummitTrackS(p.s)?p.bed:0,fa=1.9+(a.bed-gy(a))*1.4,fb=1.9+(b.bed-gy(b))*1.4;
    const bt=lite?SLEEPER_TOP:BALLAST_TOP,t0=off(a,-1.45,a.bed+bt),t1=off(a,1.45,a.bed+bt),u0=off(b,-1.45,b.bed+bt),u1=off(b,1.45,b.bed+bt),
     f0=off(a,-fa,gy(a)-.06),f1=off(a,fa,gy(a)-.06),g0=off(b,-fb,gy(b)-.06),g1=off(b,fb,gy(b)-.06),inside=off(a,0,a.bed-1);
    (lite?bedTop:ballast).quad(t0,u0,u1,t1,inside);ballast.quad(f0,g0,u0,t0,inside);ballast.quad(t1,u1,g1,f1,inside);}
   if(a.kind!==TrackKind.Sea&&b.kind===TrackKind.Sea||a.kind===TrackKind.Sea&&b.kind!==TrackKind.Sea)bridgeHead(a,b);
   if(a.kind===TrackKind.Wall){// The sea wall: a stone top and two faces down into the water (Enoden-style).
    const h=SEA_WALL_HALF,top=-.02,foot=-2.6,inside=off(a,0,-1);
    wallTop.quad(off(a,-h,top),off(b,-h,top),off(b,h,top),off(a,h,top),inside);
    wall.quad(off(a,-h,foot),off(b,-h,foot),off(b,-h,top),off(a,-h,top),inside);wall.quad(off(a,h,foot),off(b,h,foot),off(b,h,top),off(a,h,top),inside);}
   if(a.kind===TrackKind.Sea&&b.kind===TrackKind.Sea){// Trestle deck: two girders under the rails (a bridge-head row: bridgeHead).
    for(const side of [-1,1]){const v=side*RAIL_HALF_GAUGE,w=.2,top=a.bed+SLEEPER_TOP-.1,bot=a.bed-.4,topB=b.bed+SLEEPER_TOP-.1,botB=b.bed-.4,inside=off(a,v,a.bed-.15);
     girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v-w,topB),off(a,v-w,top),inside);girders.quad(off(a,v+w,bot),off(b,v+w,botB),off(b,v+w,topB),off(a,v+w,top),inside);girders.quad(off(a,v-w,bot),off(b,v-w,botB),off(b,v+w,botB),off(a,v+w,bot),inside);}}
   // Catenary: a pole with its cantilever arm every ~POLE_STEP m (right side; platforms are all on the left), not at crossings.
   // (and never on a west-park trail: the pole slides along to the next row clear of it)
   if(a.s>=poleNext&&(a.kind!==TrackKind.Sea||pierRows.has(i%n))&&!crossingAt(a.s,2)&&!(a.x<-100&&onWalkPath(off(a,-2.7,0)[0],off(a,-2.7,0)[2],.4))&&!POLE_KEEP_CLEAR.some(([kx,kz])=>Math.hypot(off(a,-2.7,0)[0]-kx,off(a,-2.7,0)[2]-kz)<3)){poleNext=a.s+POLE_STEP;
    // (Nov 24 2026: over the sea a pole stands only on a pier, on a bracket off the cap beam's end: it floated beside the deck)
    const sea=a.kind===TrackKind.Sea,base=sea?a.bed-.8:a.bed,top=a.bed+WIRE_Y+.55,P=off(a,-2.7,0),r=.11;
    if(sea){const q=off(a,-2.25,a.bed-.63);piers.box(q[0],q[1],q[2],a.tx,a.tz,.28,.7,.16,false);}// (top 5 cm under the cap's: never coplanar)
    poles.box(P[0],(base+top)/2,P[2],a.tx,a.tz,r,r,(top-base)/2);
    // Looks 2 (Nov 24 2026): the thin arm, brace and dropper go in the catenary mesh (near-camera fade); lite keeps the arm here.
    if(lite)poles.beam([P[0],a.bed+WIRE_Y+.4,P[2]],off(a,.25,a.bed+WIRE_Y+.4),.05,true);
    else{catArm.beam([P[0],a.bed+WIRE_Y+.4,P[2]],off(a,.25,a.bed+WIRE_Y+.4),.05,true);catArm.beam(off(a,-2.6,a.bed+WIRE_Y-.3),off(a,-.2,a.bed+WIRE_Y+.38),.035,true);
     catArm.beam(off(a,0,a.bed+WIRE_Y+.4),off(a,0,a.bed+WIRE_Y),.025,true);}
    if(a.kind!==TrackKind.Sea)solid({x:P[0],z:P[2],w:.4,d:.4});}
  }
  // Trestle piers in this chunk: a cap beam across and two columns down into the sea. Nov 24 2026 (South Bridge): a pier taller
  // than 2.6 m gets a tie beam and X braces between its columns (a trestle bent); the main span's two piers are heavier.
  for(const p of L.piers){const i=Math.round(p.s/TRACK_DS);if(i<c0||i>=c1)continue;
   const capY=p.bed-.6,half=p.main?MAIN_COLUMN_HALF:PIER_COLUMN_HALF,top=capY-.2,foot=-3.2;piers.box(p.x,capY,p.z,p.tx,p.tz,p.main?.6:.35,p.main?1.75:1.55,.2,false);
   const col=(side:number,y:number)=>[p.x+p.tz*PIER_COLUMN_OFFSET*side,y,p.z-p.tx*PIER_COLUMN_OFFSET*side];
   for(const side of [-1,1]){const c=col(side,0);piers.box(c[0],(top+foot)/2,c[2],p.tx,p.tz,half,half,(top-foot)/2);}
   if(top>2.6){const lo=.6,mid=(lo+top)/2,r=.07;// braces stop short of the water (the bents' own feet stand in it)
    for(const y of [lo,mid])piers.beam(col(-1,y),col(1,y),r+.02);
    for(const [y0,y1] of [[lo,mid],[mid,top-.05]] as const){piers.beam(col(-1,y0),col(1,y1),r,true);piers.beam(col(1,y0),col(-1,y1),r,true);}}}
  // The main span over the channel: a steel pony truss each side (Pratt panels, inclined end posts) on cross girders under the deck,
  // merged into the rails' paint (same grey steel, no new paint or draw). Built once, in the chunk that holds the span's middle.
  {const mi=Math.round(SOUTH_BRIDGE.mid/TRACK_DS);if(mi>=c0&&mi<c1){const t=bridgeTruss(L.profile);rails.p.push(...t.p);rails.n.push(...t.n);}}
  emit(rails,C.rail,ox,oz);emit(railTops,C.railTop,ox,oz);emit(sleepers,C.sleeper,ox,oz);emit(ballast,C.ballast,ox,oz);emit(girders,C.girder,ox,oz);emit(piers,C.pier,ox,oz);
  emit(wall,C.wall,ox,oz);emit(wallTop,C.wallTop,ox,oz);emit(poles,C.pole,ox,oz);emit(xdeck,C.crossDeck,ox,oz);emit(bedTop,C.sleeperBed,ox,oz);emit(rocks,C.wall,ox,oz);/* the abutments' own stone paint: same batch, no new draw */
 }

 // Level crossings: the deck is in the row loop above; poles, crossbuck, lamps, arms, bell and colliders are Phase 2's crossing
 // machines (trainRunning.ts buildCrossing), so Phase 1's static unlit poles/lamps were removed at the Phase 3 merge.

 // ------------------------------------------------------------------ stations
 const atlas=stationAtlas();const boardMat=tools.boardMaterial(atlas);
 for(const st of TRAIN_STATIONS)buildStation(st);
 function buildStation(st:TrainStation){
  const c=trackAt(st.s),i0=Math.round(st.s/TRACK_DS)%n,bed=BED[i0],south=st.id==='south',top=bed+STATION_PLATFORM_Y,sg=st.side;
  const nrm=leftNormal(c.tx,c.tz),P=(u:number,v:number,y:number)=>[c.x+c.tx*u+nrm.x*sg*v,y,c.z+c.tz*u+nrm.z*sg*v];
  const ox=Math.round(c.x),oz=Math.round(c.z);
  const plat=new Geo(),footing=new Geo(),platSide=new Geo(),edge=new Geo(),plaster=new Geo(),timber=new Geo(),deck=new Geo(),roof=new Geo(),ridge=new Geo(),pane=new Geo(),lantern=new Geo(),cap=new Geo(),bench=new Geo();
  const v0=1.45,v1=south?8.1:5.45,depth=v1-v0;
  // Platform in 5 m pieces along the curve (each on its own frame), with the yellow edge strip.
  for(let u=-STATION_HALF;u<STATION_HALF;u+=5){const f=trackAt(st.s+u+2.5),fn=leftNormal(f.tx,f.tz),Q=(v:number,y:number)=>[f.x+fn.x*sg*v,y,f.z+fn.z*sg*v];
   const m=Q(v0+depth/2,0),foot=bed-.05;
   plat.box(m[0],top-.04,m[2],f.tx,f.tz,2.53,depth/2,.04);platSide.box(m[0],(top-.08+foot)/2,m[2],f.tx,f.tz,2.5,depth/2-.02,(top-.08-foot)/2);
   // AAA 2 (owner image 58: "it shouldn't be light near the platform"): the island's shadow map keeps a 2-texel normal offset (no
   // acne on parapets), which leaves a light strip between a wall's foot and its shadow on the sand. A dark concrete footing slopes
   // from the platform's back wall 0.4 m out and into the ground (and round the two ends): the base reads grounded, in the same
   // vertex-colour batch (no new draw), no global bias change.
   {const a=Q(v1-.02,bed+.12),b=Q(v1+.42,bed-.45),wl=2.5;footing.quad([a[0]-f.tx*wl,a[1],a[2]-f.tz*wl],[a[0]+f.tx*wl,a[1],a[2]+f.tz*wl],[b[0]+f.tx*wl,b[1],b[2]+f.tz*wl],[b[0]-f.tx*wl,b[1],b[2]-f.tz*wl],[m[0],bed-3,m[2]]);
    for(const end of [-1,1])if(end<0?u===-STATION_HALF:u+5>=STATION_HALF){const ea=Q(v0,bed+.12),eb=Q(v1,bed+.12),d=end*2.5,o=end*2.92;
     footing.quad([ea[0]+f.tx*d,ea[1],ea[2]+f.tz*d],[eb[0]+f.tx*d,eb[1],eb[2]+f.tz*d],[eb[0]+f.tx*o,bed-.45,eb[2]+f.tz*o],[ea[0]+f.tx*o,bed-.45,ea[2]+f.tz*o],[m[0],bed-3,m[2]]);}}
   const e=Q(v0+.28,0);edge.box(e[0],top+.012,e[2],f.tx,f.tz,2.53,.18,.008);// 2 cm proud of the platform top (was 1 cm: flickered at range)
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
  // Nov 23 2026 (owner: the house ends flickered): the panes stand 3 cm proud of the wall faces (their outer faces were coplanar with the plaster).
  for(const u of [-3.2,3.2]){const a=P(u,hv0,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.5,.03,.42);}
  for(const u of [-4,4]){const a=P(u,hm,0);pane.box(a[0],y0+1.55,a[2],c.tx,c.tz,.03,.8,.42);}
  {const a=P(0,hv0+.6,0);pane.box(a[0],y0+1.3,a[2],c.tx,c.tz,1.6,.03,.75);}
  // Dark timber: corner and door posts, a sill band and the eave beam.
  for(const [u,v] of [[-4,hv0],[4,hv0],[-4,hv1],[4,hv1],[-2.4,hv0],[2.4,hv0]]){const a=P(u,v,0);timber.box(a[0],y0+H/2+.05,a[2],c.tx,c.tz,.11,.11,H/2+.05);}
  {const a=P(0,hv0,0);timber.box(a[0],y0+2.3,a[2],c.tx,c.tz,2.4,.12,.07);timber.box(a[0],y0+.45,a[2],c.tx,c.tz,4,.1,.05);const b=P(0,hm,0);timber.box(b[0],y0+H+.07,b[2],c.tx,c.tz,4.15,hd/2+.12,.07);}
  // Tiled hip roof (kawara grey-blue), its eaves well out over the platform, a dark ridge and two ridge ends.
  {const ew=4.8,ed=hd/2+1.25,rh=1.9,ry=y0+H+.14,ridgeL=ew-ed*.75,R=(u:number,v:number,y:number)=>P(u,hm+v,y),inside=R(0,0,ry);
   const e1=R(-ew,-ed,ry),e2=R(ew,-ed,ry),e3=R(ew,ed,ry),e4=R(-ew,ed,ry),r1=R(-ridgeL,0,ry+rh),r2=R(ridgeL,0,ry+rh);
   roof.quad(e1,e2,r2,r1,inside);roof.quad(e3,e4,r1,r2,inside);roof.tri(e2,e3,r2);roof.tri(e4,e1,r1);roof.quad(e1,e4,e3,e2,R(0,0,ry+1));
   ridge.beam(R(-ridgeL-.1,0,ry+rh+.05),R(ridgeL+.1,0,ry+rh+.05),.12,true);
   if(!lite)for(const s of [-1,1])for(const t of [-1,1])ridge.beam(R(s*ridgeL,0,ry+rh+.03),R(s*ew,t*ed,ry+.05),.06,true);
   // Tile courses: three thin darker bands across each long slope.
   if(!lite)for(const k of [.3,.55,.8])for(const t of [-1,1]){const y=ry+rh*k,v=t*ed*(1-k),u=ew-(ew-ridgeL)*k;ridge.beam(R(-u,v,y+.02),R(u,v,y+.02),.025,true);}
   // Four paper lanterns under the front eave.
   if(!lite)for(const u of [-3.3,-1.1,1.1,3.3]){const a=R(u,-ed+.55,0);lantern.box(a[0],ry-.75,a[2],c.tx,c.tz,.21,.21,.24);cap.box(a[0],ry-.48,a[2],c.tx,c.tz,.14,.14,.03);cap.box(a[0],ry-1.02,a[2],c.tx,c.tz,.14,.14,.03);cap.beam([a[0],ry-.45,a[2]],[a[0],ry,a[2]],.012);}}
  // A bench on the platform, by the house's down-line end.
  // Phase 4 (Nov 23 2026): the island bench's own sizes (lib/graphics/npcSeatPose.ts BENCH: seat top .64, half depth .325, back face
  // .205 behind the centre, back .685…1.135), so a station islander sits on it exactly like on every other island bench.
  {/* every tier (a station islander sits here; 3 boxes in the existing bench batch) */const a=P(-9,v0+2.2,0);bench.box(a[0],top+.6,a[2],c.tx,c.tz,1,.325,.04);const b=P(-9,v0+2.2+.25,0);bench.box(b[0],top+.91,b[2],c.tx,c.tz,1,.045,.225);
   for(const u of [-9.8,-8.2]){const l=P(u,v0+2.2,0);timber.box(l[0],top+.28,l[2],c.tx,c.tz,.04,.26,.28);}}
  emit(plat,C.platform,ox,oz);emit(footing,C.footing,ox,oz);emit(platSide,C.platformSide,ox,oz);emit(edge,C.edge,ox,oz);emit(plaster,C.plaster,ox,oz);emit(timber,C.timber,ox,oz);emit(deck,C.deck,ox,oz);
  emit(roof,C.roof,ox,oz);emit(ridge,C.ridge,ox,oz);emit(cap,C.cap,ox,oz);emit(bench,lite?C.timber:C.bench,ox,oz);/* lite: in the timber batch (no new paint on the lowest tier) */
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
 // Nov 23 2026 (owner: the portals were upright 21 m slabs poking out of the hill, with a stray block on top): each portal is now a
 // battered stone headwall PORTAL_HALF m either side, leaning back into the slope (PORTAL_LEAN per metre up), its top edge laid
 // along the carved ground at its face (never above the hill), an arch ring round the mouth, and two wing walls running out along
 // the cutting's banks with their tops on the bank. No coping slab, no hood box. Same two paints as before (stone, stoneDark).
 for(const p of [TUNNEL.west,TUNNEL.east]){const west=p===TUNNEL.west,t=trackAt(p.s),o={x:west?-t.tx:t.tx,z:west?-t.tz:t.tz},a={x:o.z,z:-o.x};
  const R=TUNNEL_HALF_WIDTH,ringR=R+.85,depth=1.5,lean=PORTAL_LEAN,half=PORTAL_HALF;
  const groundAt=(v:number,u:number)=>summitGround(p.x+a.x*v+o.x*u,p.z+a.z*v+o.z*u)-TUNNEL_BED;
  // Nov 24 2026 (owner: a wing slab stood proud of the hillside by the west portal, fins at the headwall ends): the drawn hill is a
  // 2.5 m mesh, so in a crease it lies under the true ground at one point. The headwall top and the wing tops take the LOWEST ground
  // round the spot (± 0.8 m across, out to 2.5 m in front): a little buried in the hill, never standing out of it.
  const lowAt=(v:number,u:number)=>{let m=Infinity;for(const dv of [-.8,0,.8])for(const du of [-.6,0,.8,1.8])m=Math.min(m,groundAt(v+dv,u+du));return m;};
  const archTop=(v:number)=>Math.abs(v)<ringR?2.4+Math.sqrt(ringR*ringR-v*v):0;
  const shape=new T.Shape();shape.moveTo(-half,-.6);shape.lineTo(half,-.6);
  for(let v=half;v>=-half-1e-6;v-=.7){const top=Math.max(archTop(v)+.25,lowAt(v,depth*.5)+.25,Math.abs(v)<ringR+.6?1.1:-.35);/* past the ring the ends follow the ground down (no block where the bank falls away) */shape.lineTo(v,Math.min(top,2.4+ringR+.6));}
  shape.lineTo(-half,-.6);shape.holes.push(portalArch());
  const basis=new T.Matrix4().makeBasis(new T.Vector3(a.x,0,a.z),new T.Vector3(0,1,0),new T.Vector3(o.x,0,o.z));
  const wallG=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:10});
  {const q=wallG.getAttribute('position') as T.BufferAttribute;for(let k=0;k<q.count;k++)q.setZ(k,q.getZ(k)-Math.max(0,q.getY(k))*lean);q.needsUpdate=true;wallG.computeVertexNormals();}
  wallG.applyMatrix4(basis);
  skip(put(wallG,C.stone,p.x,TUNNEL_BED,p.z));// its top lies on the hill now, so no roof floor (a diagonal wall's bounding-box roof blocked rides)
  // Arch ring (voussoirs) on the leaning face, and the wing walls along the banks.
  const g=new Geo(),gd=new Geo(),B=TUNNEL_BED,P=(v:number,u:number,y:number)=>[p.x+a.x*v+o.x*u,B+y,p.z+a.z*v+o.z*u];
  for(let k=0;k<=10;k++){const ang=Math.PI*k/10,x0=Math.cos(ang)*(R+.25),y0=2.4+Math.sin(ang)*(R+.25),u=depth-y0*lean+.02;gd.box(p.x+a.x*x0+o.x*u,B+y0,p.z+a.z*x0+o.z*u,a.x,a.z,.32,.04,.32);}
  for(const sg of [-1,1]){const v0=sg*(R+.6),v1=sg*(R+1.4),inside=P(sg*(R+1),3,-2);let prev:number[][]|null=null;
   for(let u=depth-.1;u<=depth+WING_LENGTH+1e-6;u+=.75){const top=Math.max(.3,Math.min(lowAt(v1+sg*.3,u)-.05,1.5));/* low, on the bank behind it (no fins) */const cur=[P(v0,u,-.4),P(v0,u,top),P(v1,u,top),P(v1,u,-.4)];
    if(prev){g.quad(prev[0],cur[0],cur[1],prev[1],inside);g.quad(prev[1],cur[1],cur[2],prev[2],inside);g.quad(prev[2],cur[2],cur[3],prev[3],inside);}prev=cur;}
   if(prev)g.quad(prev[0],prev[1],prev[2],prev[3],P(sg*(R+1),0,-2));}
  const ox=Math.round(p.x),oz=Math.round(p.z);emit(g,C.stoneDark,ox,oz);emit(gd,C.stoneDark,ox,oz);
  const mouth=new T.ShapeGeometry(portalArch(),10);mouth.applyMatrix4(basis);skip(put(mouth,C.mouth,p.x+o.x*.12,TUNNEL_BED,p.z+o.z*.12));// POLISH 4 (owner shot 70): 0.12 m out from the headwall's back, inside its arched hole, so it is in front of the drawn hill's cliff at the plane (the summit grid snaps it to ±0.03 m; on the curved west portal a cliff triangle at +0.03 stood in front of the old cap at +0.05 in and showed as a green band inside the arch)
  // POLISH 4: a dark floor through the headwall's arched hole (the summit terrain is cut out of the opening: summitIsleWorld)
  {const fl=new Geo(),R2=TUNNEL_HALF_WIDTH;fl.quad(P(-R2,-.15,-.02),P(R2,-.15,-.02),P(R2,depth+.4,-.02),P(-R2,depth+.4,-.02),P(0,1,-2));emit(fl,C.mouth,ox,oz);}
  solid(...portalColliders(p.x,p.z,o,a,half));
 }
 const W=TUNNEL.west,E=TUNNEL.east,cam=new T.Vector3(),tW=trackAt(W.s),tE=trackAt(E.s);
 const tubeRoot=new T.Group();tubeRoot.name='train-tunnel';const tube=buildTube();tubeRoot.add(tube);
 const cat=catArm.empty&&catWire.empty?null:buildCatenary();if(cat)tubeRoot.add(cat);// starts visible so the load-time compileAsync (islandWarm.ts) builds its program; update() hides it on the first frame
 return {
  /** Added to the scene after the batching pass (its own mesh, never merged). */
  tubeRoot,
  movedProps:()=>moved,addMoved:(k:number)=>{moved+=k;},
  /** POLISH 4 (owner shot 70, a dark wedge beside the west arch): the tube shows only while the camera is INSIDE it, past both mouth
   *  planes and under its crown. From outside, each portal's opaque arch-shaped mouth already fills the opening, so the tube added
   *  nothing there but its crown showing dark through the hill's 2.5 m grid right behind the headwall. A few multiplies a frame. */
  update(camera:T.Camera){camera.getWorldPosition(cam);let inside=false;
   if(Math.hypot(cam.x-W.x,cam.z-W.z)<TUBE_SHOW||Math.hypot(cam.x-E.x,cam.z-E.z)<TUBE_SHOW||insideTunnel(cam.x,cam.z)){
    const inW=(cam.x-W.x)*tW.tx+(cam.z-W.z)*tW.tz,inE=-((cam.x-E.x)*tE.tx+(cam.z-E.z)*tE.tz);
    inside=inW>-.3&&inE>-.3&&insideTunnel(cam.x,cam.z)&&cam.y<TUNNEL_BED+2.4+TUNNEL_HALF_WIDTH+1.5;}
   if(inside!==tube.visible)tube.visible=inside;},
  dispose(){tube.geometry.dispose();(tube.material as T.Material).dispose();if(cat){cat.geometry.dispose();(cat.material as T.Material).dispose();}tubeRoot.removeFromParent();},
 };
 /** The catenary mesh (wire + thin arms) in vertex colours, with the near-camera fade (see the catenary section above). */
 function buildCatenary(){
  const pos:number[]=[],nor:number[]=[],col:number[]=[],tmp=new T.Color();
  for(const [g,c] of [[catWire,C.wire],[catArm,C.pole]] as const){tmp.set(c);pos.push(...g.p);nor.push(...g.n);for(let k=0;k<g.p.length;k+=3)col.push(tmp.r,tmp.g,tmp.b);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(nor,3));geo.setAttribute('color',new T.Float32BufferAttribute(col,3));geo.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85});
  mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vCatW;').replace('#include <project_vertex>','#include <project_vertex>\nvCatW=(modelMatrix*vec4(transformed,1.0)).xyz;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vCatW;').replace('#include <clipping_planes_fragment>',
    `#include <clipping_planes_fragment>\n{float cd=distance(vCatW,cameraPosition),ck=clamp((cd-${CAT_FADE_NEAR.toFixed(2)})/${(CAT_FADE_FAR-CAT_FADE_NEAR).toFixed(2)},0.,1.);if(ck<1.&&fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453)>=ck)discard;}`);};
  mat.customProgramCacheKey=()=>'train-catenary-fade';
  const m=new T.Mesh(geo,mat);m.name='train-catenary';m.matrixAutoUpdate=false;m.castShadow=false;m.receiveShadow=false;m.userData.train=true;m.userData.ownDraw=true;return m;}
 function insideTunnel(x:number,z:number){const t=trackAt(W.s),dx=E.x-W.x,dz=E.z-W.z,l2=dx*dx+dz*dz,f=((x-W.x)*dx+(z-W.z)*dz)/l2;void t;if(f<0||f>1)return false;return Math.abs((x-W.x)*dz-(z-W.z)*dx)/Math.sqrt(l2)<TUNNEL_HALF_WIDTH+2;}
 function buildTube(){
  const pos:number[]=[],col:number[]=[],idx:number[]=[],prof:[number,number][]=[[-TUNNEL_HALF_WIDTH,0],[-TUNNEL_HALF_WIDTH,2.4]];for(let k=1;k<10;k++){const a=Math.PI-Math.PI*k/10;prof.push([Math.cos(a)*TUNNEL_HALF_WIDTH,2.4+Math.sin(a)*TUNNEL_HALF_WIDTH]);}prof.push([TUNNEL_HALF_WIDTH,2.4],[TUNNEL_HALF_WIDTH,0]);
  const len=E.s-W.s,step=3,rings=Math.ceil(len/step)+1,wallC=new T.Color('#4a4642'),lampC=new T.Color('#ffd99a'),tmp=new T.Color();
  for(let r=0;r<rings;r++){const s=W.s-.3+Math.min(len+.6,r*step),q=trackAt(s),lamp=Math.exp(-((((s-W.s)%15)-7.5)**2)/5);
   for(const [v,y] of prof){pos.push(q.x+q.tz*v,TUNNEL_BED+y,q.z-q.tx*v);const up=y/(2.4+TUNNEL_HALF_WIDTH);tmp.copy(wallC).multiplyScalar(.35+.4*up).lerp(lampC,.75*lamp*Math.max(0,1-Math.abs(up-.55)*2.2));col.push(tmp.r,tmp.g,tmp.b);}}
  const per=prof.length;for(let r=0;r<rings-1;r++)for(let k=0;k<per-1;k++){const a=r*per+k,b=a+1,c=a+per,d=c+1;idx.push(a,b,c,b,d,c);}// wound to face the axis: single-sided, the tube's outside never draws (Nov 23 2026: it showed through the hill)
  // The track inside: ballast floor, sleepers and rails in dim baked colours.
  const add=(g:Geo,color:string,shade:number)=>{const base=pos.length/3;tmp.set(color).multiplyScalar(shade);for(let k=0;k<g.p.length;k+=3){pos.push(g.p[k],g.p[k+1],g.p[k+2]);col.push(tmp.r,tmp.g,tmp.b);}for(let k=0;k<g.p.length/3;k++)idx.push(base+k);};
  const floor=new Geo(),sl=new Geo(),rl=new Geo();
  for(let s=W.s-.3;s<E.s+.3;s+=TRACK_DS){const a=trackAt(s),b=trackAt(s+TRACK_DS),A=(q:typeof a,v:number,y:number)=>[q.x+q.tz*v,y,q.z-q.tx*v];
   floor.quad(A(a,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,-TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(b,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,TUNNEL_HALF_WIDTH,TUNNEL_BED+.02),A(a,0,TUNNEL_BED-1));
   for(const f of [.25,.75])sl.box(a.x+(b.x-a.x)*f,TUNNEL_BED+SLEEPER_TOP-.05,a.z+(b.z-a.z)*f,a.tx,a.tz,.13,1.15,.05);
   for(const v of [-RAIL_HALF_GAUGE,RAIL_HALF_GAUGE])rl.quad(A(a,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v-.055,TUNNEL_BED+RAIL_TOP),A(b,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v+.055,TUNNEL_BED+RAIL_TOP),A(a,v,0));}
  add(floor,C.ballast,.3);add(sl,C.sleeper,.35);add(rl,C.railTop,.55);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeBoundingSphere();
  const m=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true}));m.name='train-tunnel-tube';m.matrixAutoUpdate=false;m.userData.ownDraw=true;return m;
 }
 function portalColliders(x:number,z:number,o:{x:number;z:number},a:{x:number;z:number},half:number){const out:Obstacle[]=[];
  // The headwall either side of the arch (the arch itself stays open; the hill behind it is too steep to walk).
  for(let v=TUNNEL_HALF_WIDTH+.6;v<=half;v+=1.2)for(const sgn of [-1,1])out.push({x:x+a.x*v*sgn+o.x*.75,z:z+a.z*v*sgn+o.z*.75,w:1.3,d:1.3});
  // The wing walls along the banks (their outer, bank side is ground level near the top; the inner face is the cutting's wall).
  for(let u=2;u<=1.5+WING_LENGTH;u+=1.2)for(const sgn of [-1,1]){const v=(TUNNEL_HALF_WIDTH+1)*sgn;out.push({x:x+a.x*v+o.x*u,z:z+a.z*v+o.z*u,w:1.1,d:1.1});}return out;}
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
