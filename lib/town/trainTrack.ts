/**
 * The Island Line (train Phase 1, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md). One closed loop of track,
 * one way round: North (Kit Shop) → West Beach (Drip FC) → South (Museum) → Summit Isle → Coral Cay → North.
 *
 * Pure: no three.js, no DOM and NO imports (summitIsle.ts imports this for the cutting carve, landmass imports summitIsle, so this
 * file must stand alone). The route is the Phase 0 waypoint list (phase0/route.cjs; its CAUSEWAY_NORTH samples resolved from
 * coralCay.ts CAUSEWAY_PATH, offset 24 m north), smoothed the same way as phase0/check.cjs (closed Catmull-Rom, 25 passes of an
 * 11-point mean) and then resampled every TRACK_STEP m by arc length, so `s` (metres along the line from the start, by the
 * North station) is exact and cheap: trackAt(s) is one table lookup and a lerp.
 *
 * Heights (the track bed: the top of the ground the ballast sits on):
 *  - main island and Coral Cay land: 0 (the ground there is flat at 0);
 *  - over the sea: a trestle deck at TRESTLE_BED, reached on 5 % ramps from the nearest land (trackProfile);
 *  - the south coast stretch in front of the boardwalk: a sea wall at 0 (Enoden-style, on the waterline);
 *  - Summit Isle: a ramp from the beach up to the station's flat, then on up to the straight tunnel at TUNNEL_BED; the ground is
 *    carved to the bed in a cutting (trainCut, called by summitGround) so the walked height, the drawn terrain and the track agree.
 */
export const TRACK_STEP=2;
/** Route waypoints (world x, z), loop order (phase0/route.cjs with the causeway samples resolved). */
export const TRAIN_WAYPOINTS:readonly (readonly [number,number])[]=[
 [150,-207],[60,-207],[-60,-205],[-200,-203],[-258,-193],[-292,-163],[-305,-110],[-305,-30],[-304,40],[-288,78],[-255,108],[-205,126],[-150,128],[-100,116],[-55,100],[-20,99],[12,108],[33,130],[40,160],[29,195],[28,226],[58,229],[95,224],[160,223],[215,224],[252,233],[300,242],[380,243],[445,230],[490,213],
 [515,198],[536,172],[664,51],[688,27],[699,5],[701,-40],[699,-76],[688,-90],[655,-87],[630,-74],[600,-70],[572,-71],[552,-82],[526,-100],[511,-116],[503,-136],[496,-152],[488,-160],
 [459.2,-151.1],[455.2,-150.1],[452.9,-150.1],[449.2,-150.7],[444.6,-152.3],[439.6,-154.7],[435.3,-157.3],[431.5,-160.5],[426.7,-165.1],[421.2,-170.8],[414.8,-177.2],[409.7,-182.1],[404.2,-187.8],[397.7,-194.2],[389.5,-201.1],[380,-207.1],[370.7,-211.6],[360.3,-215.3],[348.5,-217.6],[334.9,-217.5],[322.8,-214.7],[313.2,-211],[305.3,-207.4],[296.6,-203],[288.2,-197.8],[281.6,-193.3],[276.3,-189.9],[272.2,-187.9],[266.6,-186],[261.1,-184.6],[254.9,-183.6],[248,-182.9],[241.3,-182.6],
 [222,-196],[195,-206],
];

export type Track={x:Float64Array;z:Float64Array;tx:Float64Array;tz:Float64Array;n:number;length:number};
function buildTrack():Track{
 const P=TRAIN_WAYPOINTS,n=P.length,samp:[number,number][]=[];
 const cr=(a:number,b:number,c:number,d:number,t:number)=>.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
 for(let i=0;i<n;i++){const a=P[(i-1+n)%n],b=P[i],c=P[(i+1)%n],d=P[(i+2)%n],seg=Math.hypot(c[0]-b[0],c[1]-b[1]),k=Math.max(2,Math.ceil(seg/2));
  for(let j=0;j<k;j++){const t=j/k;samp.push([cr(a[0],b[0],c[0],d[0],t),cr(a[1],b[1],c[1],d[1],t)]);}}
 const N=samp.length;
 for(let it=0;it<25;it++){const next=samp.map((_,i)=>{let sx=0,sz=0;for(let k=-5;k<=5;k++){const q=samp[(i+k+N)%N];sx+=q[0];sz+=q[1];}return [sx/11,sz/11] as [number,number];});for(let i=0;i<N;i++)samp[i]=next[i];}
 const cum=[0];for(let i=1;i<=N;i++){const p=samp[i-1],q=samp[i%N];cum.push(cum[i-1]+Math.hypot(q[0]-p[0],q[1]-p[1]));}
 const length=cum[N],m=Math.round(length/TRACK_STEP),x=new Float64Array(m),z=new Float64Array(m),tx=new Float64Array(m),tz=new Float64Array(m);
 let j=0;for(let i=0;i<m;i++){const s=i*length/m;while(cum[j+1]<s)j++;const f=(s-cum[j])/(cum[j+1]-cum[j]||1),p=samp[j],q=samp[(j+1)%N];x[i]=p[0]+(q[0]-p[0])*f;z[i]=p[1]+(q[1]-p[1])*f;}
 for(let i=0;i<m;i++){const a=(i-1+m)%m,b=(i+1)%m,dx=x[b]-x[a],dz=z[b]-z[a],l=Math.hypot(dx,dz)||1;tx[i]=dx/l;tz[i]=dz/l;}
 return {x,z,tx,tz,n:m,length};
}
export const TRACK=buildTrack();
/** Metres between table rows (≈ TRACK_STEP; the loop length divided evenly). */
export const TRACK_DS=TRACK.length/TRACK.n;
export const wrapS=(s:number)=>((s%TRACK.length)+TRACK.length)%TRACK.length;
/** The track's centre line at `s` (m along the loop): position and unit tangent (direction of travel). Allocation-free with `out`. */
export function trackAt(s:number,out={x:0,z:0,tx:1,tz:0}){
 const f=wrapS(s)/TRACK_DS,i=Math.floor(f)%TRACK.n,k=(i+1)%TRACK.n,t=f-Math.floor(f),T=TRACK;
 out.x=T.x[i]+(T.x[k]-T.x[i])*t;out.z=T.z[i]+(T.z[k]-T.z[i])*t;const ax=T.tx[i]+(T.tx[k]-T.tx[i])*t,az=T.tz[i]+(T.tz[k]-T.tz[i])*t,l=Math.hypot(ax,az)||1;out.tx=ax/l;out.tz=az/l;return out;
}
/** Left of travel (seen from above, +y up): (tz, -tx). `side` +1 = left, -1 = right. */
export const leftNormal=(tx:number,tz:number)=>({x:tz,z:-tx});

// ---- Nearest point on the line (16 m hash of the table rows; the tunnel rows included).
const CELL=16;const grid=new Map<number,number[]>();
const key=(cx:number,cz:number)=>cx*100003+cz;
for(let i=0;i<TRACK.n;i++){const cx=Math.floor(TRACK.x[i]/CELL),cz=Math.floor(TRACK.z[i]/CELL),k=key(cx,cz);const l=grid.get(k);if(l)l.push(i);else grid.set(k,[i]);}
export type TrackHit={s:number;d:number;side:number;i:number};
/** Nearest point on the track within ~`reach` m (≤ 32): s, distance and side (+1 left of travel, -1 right); null when farther. */
export function trackNearest(x:number,z:number,reach=16,from=0,to=TRACK.length):TrackHit|null{
 const r=Math.ceil(Math.min(reach,32)/CELL),cx=Math.floor(x/CELL),cz=Math.floor(z/CELL);let best:TrackHit|null=null;
 for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){const l=grid.get(key(cx+a,cz+b));if(!l)continue;
  for(const i of l){const s0=i*TRACK_DS;if(s0<from-TRACK_DS||s0>to)continue;const k=(i+1)%TRACK.n,ax=TRACK.x[i],az=TRACK.z[i],dx=TRACK.x[k]-ax,dz=TRACK.z[k]-az,l2=dx*dx+dz*dz||1e-9;
   const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/l2)),px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);
   if(d<=reach&&(!best||d<best.d)){const cross=dx*(z-az)-dz*(x-ax);best={s:s0+t*TRACK_DS,d,side:cross<0?1:-1,i};}}}
 return best;
}
/** s of the table row nearest a world point (whole loop). */
export function sNear(x:number,z:number){let b=0,bd=Infinity;for(let i=0;i<TRACK.n;i++){const d=(TRACK.x[i]-x)**2+(TRACK.z[i]-z)**2;if(d<bd){bd=d;b=i;}}return b*TRACK_DS;}

// ---- The tunnel through Summit Isle's summit (owner ruling: straight through). Portals sit where the hill above clears the tube
// roof by ≥ 1.5 m; the east one 6 m out from the Phase 0 spot so the climb trail (which crosses there) runs over the tunnel roof.
export const TUNNEL_BED=2.2,TUNNEL_HALF_WIDTH=3.6,TUNNEL_HEIGHT=5.6;
export const TUNNEL={west:{x:538.5,z:169.5,s:sNear(538.5,169.5)},east:{x:668.5,z:45.5,s:sNear(668.5,45.5)}} as const;
export const inTunnelS=(s:number)=>s>TUNNEL.west.s&&s<TUNNEL.east.s;

// ---- Summit Isle's track bed: piecewise linear in s (beach → station flat → west portal; east portal → north beach).
/** Where the line steps onto / off Summit Isle's sand (the trestles' ends) and the Summit station's middle. */
export const SUMMIT_TRACK={landWest:sNear(489,213.5),station:sNear(512,202),landEast:sNear(698,-6)} as const;
export const STATION_HALF=15,STATION_PLATFORM_Y=.55,SUMMIT_STATION_BED=.9;
const SUMMIT_KEYS:[number,number][]=[[SUMMIT_TRACK.landWest-24,0],[SUMMIT_TRACK.station-STATION_HALF-1,SUMMIT_STATION_BED],[SUMMIT_TRACK.station+STATION_HALF+1,SUMMIT_STATION_BED],[TUNNEL.west.s,TUNNEL_BED],[TUNNEL.east.s,TUNNEL_BED],[SUMMIT_TRACK.landEast-12,0]];
export const onSummitTrackS=(s:number)=>s>=SUMMIT_TRACK.landWest&&s<=SUMMIT_TRACK.landEast;
/** Summit Isle's bed at s (0 outside its stretch). It starts rising 24 m out on the west trestle, so no grade passes ~5 %. */
export function summitBedAt(s:number){const K=SUMMIT_KEYS;if(s<=K[0][0]||s>=K[K.length-1][0])return 0;// (east: flat on the last 12 m of sand)
 for(let i=0;i<K.length-1;i++)if(s<=K[i+1][0]){const t=(s-K[i][0])/(K[i+1][0]-K[i][0]||1);return K[i][1]+(K[i+1][1]-K[i][1])*t;}return 0;}

/** The Summit cutting / embankment: the ground within `flat` m of the centre line is the bed; beyond, banks of CUT_BANK (rise per
 *  metre) back to the natural slope. Not inside the tunnel (the hill stays over it). Station stretch: a wider flat (house, path). */
export const CUT_FLAT=3.4,CUT_STATION_FLAT=10,CUT_BANK=1.3,CUT_REACH=26;
const SUMMIT_BOX=(()=>{let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;for(let i=0;i<TRACK.n;i++){const s=i*TRACK_DS;if(!onSummitTrackS(s))continue;a=Math.min(a,TRACK.x[i]);b=Math.max(b,TRACK.x[i]);c=Math.min(c,TRACK.z[i]);d=Math.max(d,TRACK.z[i]);}
 return {minX:a-CUT_REACH-CUT_STATION_FLAT,maxX:b+CUT_REACH+CUT_STATION_FLAT,minZ:c-CUT_REACH-CUT_STATION_FLAT,maxZ:d+CUT_REACH+CUT_STATION_FLAT};})();
/** Into the hill past each portal plane the ground is still carved for MOUTH_CARVE m (flat, steep MOUTH_BANK sides) so the
 *  terrain's step back up to the slope lies behind the portal's dark mouth, under its hood (trainWorld.ts), never across the arch. */
export const MOUTH_CARVE=3.2,MOUTH_BANK=4;
/** How far into the tunnel (m, along the line) a point lies past the nearer portal plane (negative outside). */
function inward(x:number,z:number,s:number){const west=s-TUNNEL.west.s<TUNNEL.east.s-s,p=west?TUNNEL.west:TUNNEL.east,t=trackAt(p.s);return ((x-p.x)*t.tx+(z-p.z)*t.tz)*(west?1:-1);}
/** Distance to the carved Summit corridor's centre line (1e3 outside it): summitIsleWorld draws the terrain finer there. */
export function trainCutDistance(x:number,z:number){
 if(x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ)return 1e3;
 const hit=trackNearest(x,z,CUT_REACH+CUT_STATION_FLAT,SUMMIT_TRACK.landWest,SUMMIT_TRACK.landEast);if(!hit)return 1e3;
 if(inTunnelS(hit.s)&&inward(x,z,hit.s)>MOUTH_CARVE+2.5)return 1e3;return hit.d;}
/** Carve Summit Isle's ground `h` at (x, z) to the track bed (cut and fill). summitGround calls this last. */
export function trainCut(x:number,z:number,h:number){
 if(x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ)return h;
 const hit=trackNearest(x,z,CUT_REACH+CUT_STATION_FLAT,SUMMIT_TRACK.landWest,SUMMIT_TRACK.landEast);if(!hit||!onSummitTrackS(hit.s))return h;
 if(inTunnelS(hit.s)){if(inward(x,z,hit.s)>MOUTH_CARVE)return h;const k=Math.max(0,hit.d-TUNNEL_HALF_WIDTH)*MOUTH_BANK;return Math.min(Math.max(h,TUNNEL_BED-k),TUNNEL_BED+k);}
 const st=Math.abs(hit.s-SUMMIT_TRACK.station),flat=st<STATION_HALF+6?CUT_STATION_FLAT:st<STATION_HALF+14?CUT_FLAT+(CUT_STATION_FLAT-CUT_FLAT)*(STATION_HALF+14-st)/8:CUT_FLAT;
 const bed=summitBedAt(hit.s),k=Math.max(0,hit.d-flat)*CUT_BANK;
 return Math.min(Math.max(h,bed-k),bed+k);
}

// ---- Kinds and heights along the loop.
export const TRESTLE_BED=1.05,RAMP_GRADE=.05;
export const TrackKind={Land:0,Sea:1,Wall:2,Tunnel:3} as const;
/** The south coast sea wall: round the SW corner and along the museum boardwalk (Enoden-style, on the waterline). */
const isWallPoint=(x:number,z:number)=>x>24&&x<238&&z>174&&z<232;
export type TrackProfile={kind:Uint8Array;bed:Float32Array};
/** Per table row: what the track stands on and its bed height. `onLand` is landmass.onLand (the caller passes it: no imports here);
 *  `ground` the walked ground (Summit Isle's carved summitGround; 0 elsewhere). */
export function trackProfile(onLand:(x:number,z:number)=>boolean):TrackProfile{
 const n=TRACK.n,kind=new Uint8Array(n),bed=new Float32Array(n);
 for(let i=0;i<n;i++){const s=i*TRACK_DS,x=TRACK.x[i],z=TRACK.z[i];
  kind[i]=inTunnelS(s)?TrackKind.Tunnel:onSummitTrackS(s)?TrackKind.Land:onLand(x,z)?TrackKind.Land:isWallPoint(x,z)?TrackKind.Wall:TrackKind.Sea;}
 // Distance along the line to the nearest non-sea row, both ways (the trestle's ramps).
 const near=new Float32Array(n).fill(1e9);
 for(let pass=0;pass<2;pass++)for(let k=0;k<2*n;k++){const i=k%n,p=(i-1+n)%n;near[i]=kind[i]!==TrackKind.Sea?0:Math.min(near[i],near[p]+TRACK_DS);}
 for(let pass=0;pass<2;pass++)for(let k=2*n-1;k>=0;k--){const i=k%n,p=(i+1)%n;near[i]=kind[i]!==TrackKind.Sea?0:Math.min(near[i],near[p]+TRACK_DS);}
 for(let i=0;i<n;i++){const s=i*TRACK_DS;bed[i]=kind[i]===TrackKind.Sea?Math.max(Math.min(TRESTLE_BED,RAMP_GRADE*near[i]),summitBedAt(s)):onSummitTrackS(s)?summitBedAt(s):0;}
 return {kind,bed};
}
/** Bed height at s from a profile (lerp between rows). */
export function bedAt(p:TrackProfile,s:number){const f=wrapS(s)/TRACK_DS,i=Math.floor(f)%TRACK.n,k=(i+1)%TRACK.n,t=f-Math.floor(f);return p.bed[i]+(p.bed[k]-p.bed[i])*t;}

// ---- Stations (all five; platform on the `toward` side) and the level crossings (static in Phase 1; barriers come in Phase 2).
export type TrainStation={id:'north'|'west'|'south'|'summit'|'cay';number:number;name:string;sub:string;s:number;side:number;
 /** One light football line for the name board (AGENTS.md: everything teaches): the station number read as a shirt number. */
 shirt:string};
const station=(id:TrainStation['id'],number:number,name:string,sub:string,cx:number,cz:number,towardX:number,towardZ:number,shirt:string):TrainStation=>{
 const s=sNear(cx,cz),t=trackAt(s),n=leftNormal(t.tx,t.tz),side=(towardX-t.x)*n.x+(towardZ-t.z)*n.z>0?1:-1;return {id,number,name,sub,s,side,shirt};};
export const TRAIN_STATIONS:readonly TrainStation[]=[
 station('north',1,'North','Kit Shop',170,-207,170,-170,"No. 1 is the goalkeeper's shirt"),
 station('west',2,'West Beach','Drip FC Stadium',-305,-30,-260,-30,'No. 2 is the right-back'),
 station('south',3,'South','Museum',160,223,160,185,'No. 3 is the left-back'),
 station('summit',4,'Summit Isle','Summit 5s',512,202,498,188,'No. 4: a centre-back or holding midfielder'),
 station('cay',5,'Coral Cay','Hostel · Farm',588,-72,591,-100,'No. 5 is a centre-back'),
];
export type TrainCrossing={id:string;s:number;width:number};
export const TRAIN_CROSSINGS:readonly TrainCrossing[]=[
 {id:'north-beach-west',s:sNear(-45,-205),width:3.4},
 {id:'north-beach-east',s:sNear(80,-207),width:3.4},
 {id:'west-beach',s:sNear(-305,-52),width:3},
 {id:'cay-beach',s:sNear(562,-76),width:3},
 {id:'causeway',s:sNear(494,-148),width:9},
];
