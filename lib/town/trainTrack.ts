/**
 * The Island Line (train Phase 1, Nov 23 2026; plan: .claude/worktrees/_recovery-nov20/train/PLAN.md). One closed loop of track,
 * one way round: North (North Beach) → West Beach (Drip FC) → South (Museum) → Summit Isle → Coral Cay → North.
 *
 * Pure: no three.js, no DOM and NO imports (summitIsle.ts imports this for the cutting carve, landmass imports summitIsle, so this
 * file must stand alone). The route is the Phase 0 waypoint list (phase0/route.cjs; its CAUSEWAY_NORTH samples resolved from
 * coralCay.ts CAUSEWAY_PATH, offset 24 m north), smoothed the same way as phase0/check.cjs (closed Catmull-Rom, 25 passes of an
 * 11-point mean) and then resampled every TRACK_STEP m by arc length, so `s` (metres along the line from the start, by the
 * Kit Shop corner; the North station stands ~137 m along since Nov 24 2026) is exact and cheap: trackAt(s) is one table lookup and a lerp.
 *
 * Heights (the track bed: the top of the ground the ballast sits on):
 *  - main island and Coral Cay land: 0 (the ground there is flat at 0);
 *  - over the sea: a trestle deck at TRESTLE_BED, reached on 5 % ramps from the nearest land (trackProfile); the south sea run is the
 *    South Bridge instead (southBridgeBed: up to a 6 m boat channel and down again on 4.5 % grades);
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
export const TUNNEL={west:{x:538.5,z:169.5,s:sNear(538.5,169.5)},east:{x:670.5,z:43.1,s:sNear(670.5,43.1)}} as const;// east portal 2.5 m out from the PLAN spot (668.5,45.5): the climb trail crosses the hill just behind it
export const inTunnelS=(s:number)=>s>TUNNEL.west.s&&s<TUNNEL.east.s;

// ---- Summit Isle's track bed: piecewise linear in s (beach → station flat → west portal; east portal → north beach).
/** Where the line steps onto / off Summit Isle's sand (the trestles' ends) and the Summit station's middle. */
export const SUMMIT_TRACK={landWest:sNear(489,213.5),station:sNear(512,202),landEast:sNear(698,-6)} as const;
export const STATION_HALF=15,STATION_PLATFORM_Y=.55,SUMMIT_STATION_BED=.9;
// ---- The South Bridge (Nov 24 2026, owner: "where the tracks go across the water on the south there's no way for a boat to get out —
// make the tracks go higher to make room for boats"). The sea run from the Ferry Dock shore (242,231) to Summit Isle's landfall
// (487,212) climbs from the South station's flat to a girder-and-truss bridge whose main span leaves a navigation channel of
// SOUTH_BRIDGE.span m with the deck underside >= 6 m over the water (WATER_LEVEL -0.43), then falls to the Summit station's flat.
// Two tangents at BRIDGE_GRADE (4.5 %, under the line's 5 % ramps) meeting over the channel, joined by parabolic vertical curves of
// one radius (~670 m: BRIDGE_CURVE m at the sags, twice that at the crest, which tops out at BRIDGE_TOP ~6.4); the stations' flats
// are untouched (the sag curves end where they start). The bed is the one source: trains, riders, catenary, piers and walk height
// all read it from the profile. (Steeper or longer was not available: the two stations fix the ends, 326 m apart.)
export const BRIDGE_GRADE=.045,BRIDGE_CURVE=30,BRIDGE_SPAN=24;
const BRIDGE_FROM=sNear(160,223)+STATION_HALF+1/* the South station's flat ends (TRAIN_STATIONS 'south' stands at sNear(160,223)) */,
 BRIDGE_TO=SUMMIT_TRACK.station-STATION_HALF-1/* the Summit station's flat starts, at SUMMIT_STATION_BED */;
const BK0=BRIDGE_FROM+BRIDGE_CURVE/2,BK3=BRIDGE_TO-BRIDGE_CURVE/2,BPV=((BK3-BK0)*BRIDGE_GRADE+SUMMIT_STATION_BED)/2/* tangents' meeting height */,BK1=BK0+BPV/BRIDGE_GRADE;
export const BRIDGE_TOP=BPV-BRIDGE_GRADE*BRIDGE_CURVE/2;// the crest: 2 x grade over a 2 x BRIDGE_CURVE parabola drops G*L/4 below the meeting point
/** The channel's middle (the crest) and the main span's two piers (on table rows), plus the run the profile covers. */
export const SOUTH_BRIDGE=(()=>{const mid=BK1,a=Math.round((mid-BRIDGE_SPAN/2)/TRACK_DS)*TRACK_DS,b=Math.round((mid+BRIDGE_SPAN/2)/TRACK_DS)*TRACK_DS;
 return {from:BRIDGE_FROM,to:BRIDGE_TO,mid,spanA:a,spanB:b};})();
export const inSouthBridgeS=(s:number)=>s>SOUTH_BRIDGE.from&&s<SOUTH_BRIDGE.to;
/** The South Bridge's bed at s (0 before the run, the Summit station bed after it). */
export function southBridgeBed(s:number){
 if(s<=BRIDGE_FROM)return 0;if(s>=BRIDGE_TO)return SUMMIT_STATION_BED;const G=BRIDGE_GRADE,L=BRIDGE_CURVE;
 const line=s<=BK0?0:s<=BK1?(s-BK0)*G:s<=BK3?BPV-(s-BK1)*G:SUMMIT_STATION_BED;
 // each kink rounded by a parabola of length l centred on it (C1: the grade changes linearly through it)
 const c=(x:number,l:number)=>Math.abs(x)>=l/2?0:(x+l/2)**2/(2*l)-Math.max(0,x);
 return line+G*(c(s-BK0,L)-2*c(s-BK1,2*L)+c(s-BK3,L));}
const SUMMIT_KEYS:[number,number][]=[[SUMMIT_TRACK.station-STATION_HALF-1,SUMMIT_STATION_BED],[SUMMIT_TRACK.station+STATION_HALF+1,SUMMIT_STATION_BED],[TUNNEL.west.s,TUNNEL_BED],[TUNNEL.east.s,TUNNEL_BED],[SUMMIT_TRACK.landEast-12,0]];
export const onSummitTrackS=(s:number)=>s>=SUMMIT_TRACK.landWest&&s<=SUMMIT_TRACK.landEast;
/** Summit Isle's bed at s (0 outside its stretch). West of the station it is the South Bridge's fall (southBridgeBed). */
export function summitBedAt(s:number){const K=SUMMIT_KEYS;if(inSouthBridgeS(s))return southBridgeBed(s);if(s<=K[0][0]||s>=K[K.length-1][0])return 0;// (east: flat on the last 12 m of sand)
 for(let i=0;i<K.length-1;i++)if(s<=K[i+1][0]){const t=(s-K[i][0])/(K[i+1][0]-K[i][0]||1);return K[i][1]+(K[i+1][1]-K[i][1])*t;}return 0;}

/** The Summit cutting / embankment: the ground within `flat` m of the centre line is the bed; beyond, banks of CUT_BANK (rise per
 *  metre) back to the natural slope. Not inside the tunnel (the hill stays over it). Station stretch: a wider flat (house, path). */
export const CUT_FLAT=3.4,CUT_STATION_FLAT=10,CUT_BANK=1.3,CUT_REACH=26,STATION_BANK=.55,LANDFALL_BANK=.4,LANDFALL_REACH=10;
const SUMMIT_BOX=(()=>{let a=Infinity,b=-Infinity,c=Infinity,d=-Infinity;for(let i=0;i<TRACK.n;i++){const s=i*TRACK_DS;if(!onSummitTrackS(s))continue;a=Math.min(a,TRACK.x[i]);b=Math.max(b,TRACK.x[i]);c=Math.min(c,TRACK.z[i]);d=Math.max(d,TRACK.z[i]);}
 return {minX:a-CUT_REACH-CUT_STATION_FLAT,maxX:b+CUT_REACH+CUT_STATION_FLAT,minZ:c-CUT_REACH-CUT_STATION_FLAT,maxZ:d+CUT_REACH+CUT_STATION_FLAT};})();
/** Into the hill past each portal plane the ground is still carved for MOUTH_CARVE m (flat, steep MOUTH_BANK sides) so the
 *  terrain's step back up to the slope lies behind the portal's dark mouth, under its hood (trainWorld.ts), never across the arch. */
export const MOUTH_CARVE=3.2,MOUTH_BANK=4;
/** The east portal's carve is shallower (1.4 m, just past its 1.2 m headwall): the climb trail crosses the hill 3 m behind it. */
export const MOUTH_CARVE_EAST=1.4,MOUTH_RAMP=12;
export const mouthCarveAt=(s:number)=>s-TUNNEL.west.s<TUNNEL.east.s-s?MOUTH_CARVE:MOUTH_CARVE_EAST;
/** Nov 23 2026 (owner: the tube stuck out of the hill behind the arch): past MOUTH_LIFT m into the hill the ground is never lower
 *  than the tube's crown + TUBE_COVER (it was carved DOWN to the bed for MOUTH_CARVE m, leaving an open trench over the tube once
 *  the hood went). The flat strip in front of that (inside the arch) is just long enough that the terrain's step up (one FINE
 *  2.5 m grid cell, summitIsleWorld.ts) lies behind the portal's dark mouth plane. Outside, the cutting's flat floor widens to
 *  PORTAL_FLAT either side near each portal so no bank rises inside the arch. */
/** Looks 2 (Nov 24 2026, owner shot 37: behind the east portal the hill rose over 2.5 m from the bed, so the arch ring stood proud of
 *  it and a train's roof and pantograph showed over the hill there): the DRAWN hill (trainCut drawn, summitIsle summitDrawnGround) has its full
 *  cover from the mouth plane on (the fine and grid vertices either side of the plane snap onto it, so it rises as a cliff hidden
 *  behind the dark mouth and inside the leaning headwall; the flanks beside the tube keep the hill's own height, never the cutting's
 *  carve), and for HOOD_RUN m behind the plane it is also never lower than the headwall's own top (the arch ring + HOOD_OVER, out to
 *  the ring's edge): the headwall sits IN the hill, no gap over or beside the
 *  arch. The WALKED ground keeps its ramp from MOUTH_IN to MOUTH_LIFT behind the dark mouth (a walker never steps up through the
 *  ground; past MOUTH_LIFT walked and drawn agree, where the climb trail crosses the east tube). Cover over the pantograph band: rail top + 4.8 + 0.5 m all along the tube
 *  (scripts/train-clearance.cjs). TUBE_COVER 1.2 (was 0.7): the 2.5 m drawn grid still clears the crown by 0.5 m between its points. */
export const MOUTH_LIFT=2.9,MOUTH_IN=.45,TUBE_COVER=1.2,PORTAL_FLAT=TUNNEL_HALF_WIDTH+.9,HOOD_RUN=3.5,HOOD_OVER=.15;
/** trainWorld.ts portal: the arch ring's outer radius, its springing over the bed and the headwall's top cap (over the bed). */
export const PORTAL_RING_R=TUNNEL_HALF_WIDTH+.85,PORTAL_SPRING=2.4,PORTAL_TOP_CAP=PORTAL_SPRING+PORTAL_RING_R+.6;
/** Past the tube's side the cover falls at TUBE_BANK per metre (Looks 2: at MOUTH_BANK the tube's side wall showed from the side, the
 *  train inside it seen through the hill where the natural slope is low, by the east portal). */
export const TUBE_BANK=.8;
const tubeCover=(d:number)=>d<TUNNEL_HALF_WIDTH?2.4+Math.sqrt(TUNNEL_HALF_WIDTH*TUNNEL_HALF_WIDTH-d*d)+TUBE_COVER:2.4+TUBE_COVER-Math.max(0,d-TUNNEL_HALF_WIDTH-.6)*TUBE_BANK;
/** The headwall's top over the arch at lateral d (trainWorld portal: ring + 0.25, capped), banked down past the ring's edge. */
const hoodCover=(d:number)=>{const r=PORTAL_RING_R;return HOOD_OVER+(d<r?Math.min(PORTAL_TOP_CAP,PORTAL_SPRING+.25+Math.sqrt(r*r-d*d)):PORTAL_SPRING+.25-(d-r)*HOOD_SHOULDER_BANK);};
/** POLISH 4 (owner shot 70): past the ring's edge the hill behind the headwall falls at 1.2 per metre (was MOUTH_BANK 4: a pit behind
 *  the headwall's shoulder, where the tube's dark crown showed, and with the tube now drawn only from inside, a train in it). */
export const HOOD_SHOULDER_BANK=1.2;
/** How far into the tunnel (m, along the line) a point lies past the nearer portal plane (negative outside). */
function inward(x:number,z:number,s:number){const west=s-TUNNEL.west.s<TUNNEL.east.s-s,p=west?TUNNEL.west:TUNNEL.east,t=trackAt(p.s);return ((x-p.x)*t.tx+(z-p.z)*t.tz)*(west?1:-1);}
/** Distance to the carved Summit corridor's centre line (1e3 outside it): summitIsleWorld draws the terrain finer there. */
export function trainCutDistance(x:number,z:number){
 if(x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ)return 1e3;
 const hit=trackNearest(x,z,CUT_REACH+CUT_STATION_FLAT,SUMMIT_TRACK.landWest,SUMMIT_TRACK.landEast);if(!hit)return 1e3;
 if(inTunnelS(hit.s)&&inward(x,z,hit.s)>mouthCarveAt(hit.s)+MOUTH_RAMP)return 1e3;return hit.d;}
/** Carve Summit Isle's ground `h` at (x, z) to the track bed (cut and fill). summitGround calls this last. */
/** Where the drawn hill rises (m behind the portal plane, at lateral d): the mouth plane in front of the arch; beside it, right at the
 *  headwall's back (no slot between the headwall and the hill to see into the tube through). */
export const drawnPlane=(d:number)=>d>TUNNEL_HALF_WIDTH+.3?0:MOUTH_IN;
/** drawn (Looks 2, summitDrawnGround): behind a portal's mouth plane the hill's full cover at once (no walked ramp: drawn as a cliff). */
export function trainCut(x:number,z:number,h:number,drawn=false){
 if(x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ)return h;
 const hit=trackNearest(x,z,CUT_REACH+CUT_STATION_FLAT,SUMMIT_TRACK.landWest,SUMMIT_TRACK.landEast);if(!hit||!onSummitTrackS(hit.s))return h;
 if(inTunnelS(hit.s)){// Past the carve the clamp opens at MOUTH_BANK per metre too, so the ground ramps back up to the hill (no cliff to step up).
  // The hill always covers the tube past MOUTH_LIFT; from the mouth plane (MOUTH_IN) to there it rises smoothly (behind the dark
  // mouth, so never seen through the arch; a walker meets a slope, not a step).
  const inw=inward(x,z,hit.s),tc=tubeCover(hit.d),hood=inw<HOOD_RUN?Math.max(0,hoodCover(hit.d)-tc)*Math.min(1,HOOD_RUN-inw):0;// the hood eases out over its last metre
  const lifted=Math.max(h,TUNNEL_BED+tc+hood);if(inw>=MOUTH_LIFT||drawn&&inw>=drawnPlane(hit.d))return lifted;
  const k=Math.max(0,hit.d-PORTAL_FLAT)*MOUTH_BANK,carved=Math.min(Math.max(h,TUNNEL_BED-k),TUNNEL_BED+k);
  return inw<=MOUTH_IN?carved:carved+(lifted-carved)*(inw-MOUTH_IN)/(MOUTH_LIFT-MOUTH_IN);}
 const st=Math.abs(hit.s-SUMMIT_TRACK.station),pd=Math.min(Math.abs(hit.s-TUNNEL.west.s),Math.abs(hit.s-TUNNEL.east.s)),
  flat=st<STATION_HALF+6?CUT_STATION_FLAT:st<STATION_HALF+14?CUT_FLAT+(CUT_STATION_FLAT-CUT_FLAT)*(STATION_HALF+14-st)/8:pd<2.5?PORTAL_FLAT:pd<6?PORTAL_FLAT+(CUT_FLAT-PORTAL_FLAT)*(pd-2.5)/3.5:CUT_FLAT;
 // Along the station stretch the banks are walkable (it stands on the beach): STATION_BANK, under the walk limit.
 // Just east of the east portal the cut has steep wing-wall banks (MOUTH_BANK for 8 m, easing to CUT_BANK by 16 m): the climb
 // trail runs out along the portal's line there and keeps its ground.
 // (Nov 24 2026: at the west landfall the South Bridge comes down onto a low fill over the beach's own fall: LANDFALL_BANK there.)
 const pe=hit.s-TUNNEL.east.s,bank=hit.s<SUMMIT_TRACK.landWest+LANDFALL_REACH?LANDFALL_BANK:st<STATION_HALF+14?STATION_BANK:pd<6?MOUTH_BANK/* behind the headwall and wing walls: meets the hill's carve at the face with no step */:pe>=0&&pe<16?CUT_BANK+(MOUTH_BANK-CUT_BANK)*Math.min(1,(16-pe)/8):CUT_BANK;
 const bed=summitBedAt(hit.s),k=Math.max(0,hit.d-flat)*bank;
 if(h<=0&&hit.d>flat)return h;// no bank fill out over the sea past the coast (the trestle carries the line there)
 return Math.min(Math.max(h,bed-k),bed+k);
}

// ---- Kinds and heights along the loop.
export const TRESTLE_BED=1.05,RAMP_GRADE=.05,SHORT_LAND=10,RAMP_LAND=6;
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
 // Nov 23 2026: a land run shorter than SHORT_LAND m between two sea stretches (the Starfish Sandbar's tip) stays trestle: the
 // deck runs over it instead of dipping to the sand and climbing straight back up.
 for(let i=0;i<n;i++){if(kind[i]!==TrackKind.Land||kind[(i-1+n)%n]!==TrackKind.Sea)continue;let j=i;while(kind[j%n]===TrackKind.Land&&j-i<n)j++;
  if(kind[j%n]===TrackKind.Sea&&(j-i)*TRACK_DS<SHORT_LAND)for(let k=i;k<j;k++)kind[k%n]=TrackKind.Sea;}
 // Distance along the line to the nearest non-sea row, both ways (the trestle's ramps).
 // Nov 23 2026: off Summit Isle the ramp starts RAMP_LAND m inland on a low embankment (a bridge head at the shore, the deck already
 // clear of the water at the first pier) instead of at the waterline. `toSummit`: distance to Summit Isle's land rows (its own bed);
 // `toMain`: to the main island's / Coral Cay's; `toSea`: from a land row to the nearest sea row.
 const spread=(arr:Float32Array,src:(i:number)=>boolean,through:(i:number)=>boolean)=>{arr.fill(1e9);for(const dir of [1,-1])for(let pass=0;pass<2;pass++)for(let k=0;k<2*n;k++){const i=dir>0?k%n:(2*n-1-k)%n,p=(i-dir+n)%n;arr[i]=src(i)?0:through(i)?Math.min(arr[i],arr[p]+TRACK_DS):1e9;}};
 const isSea=(i:number)=>kind[i]===TrackKind.Sea,summitLand=(i:number)=>kind[i]===TrackKind.Land&&onSummitTrackS(i*TRACK_DS),mainLand=(i:number)=>kind[i]===TrackKind.Land&&!onSummitTrackS(i*TRACK_DS);
 const toSummit=new Float32Array(n),toMain=new Float32Array(n),toSea=new Float32Array(n);
 spread(toSummit,summitLand,isSea);spread(toMain,mainLand,isSea);spread(toSea,isSea,mainLand);
 for(let i=0;i<n;i++){const s=i*TRACK_DS;
  bed[i]=isSea(i)?Math.max(Math.min(TRESTLE_BED,RAMP_GRADE*toSummit[i],RAMP_GRADE*(toMain[i]-TRACK_DS/2+RAMP_LAND)),summitBedAt(s))
   :onSummitTrackS(s)?summitBedAt(s):kind[i]===TrackKind.Land?Math.max(0,RAMP_GRADE*(RAMP_LAND-(toSea[i]-TRACK_DS/2))):0;
  if(inSouthBridgeS(s)&&kind[i]!==TrackKind.Wall)bed[i]=southBridgeBed(s);}// Nov 24 2026: the South Bridge (land approach on an embankment, then the bridge)
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
 // Nov 24 2026 (owner: "move the train station on the north beach side more to the center of the main island and not near the kit
 // shop"): the middle of North Beach, above the 7v7 pitch, on the straight between the two beach crossings (was 170,-207 by the Kit Shop).
 station('north',1,'North','North Beach',15,-206,15,-170,"No. 1 is the goalkeeper's shirt"),
 station('west',2,'West Beach','Drip FC Stadium',-305,-30,-260,-30,'No. 2 is the right-back'),
 station('south',3,'South','Museum',160,223,160,185,'No. 3 is the left-back'),
 station('summit',4,'Summit Isle','Summit 5s',512,202,498,188,'No. 4: a centre-back or holding midfielder'),
 station('cay',5,'Coral Cay','Hostel · Farm',588,-72,591,-100,'No. 5 is a centre-back'),
];
/** `ped`: a footpath crossing (train Phase 4): the same machine, smaller (shorter posts, arms at hip height). `width`: the deck along the line. */
export type TrainCrossing={id:string;s:number;width:number;ped?:boolean;/** a footpath meeting the line at an angle: its centre moves `skew` m along the line per m across (the machine's posts follow it) */skew?:number};
/** Rail fixes (Nov 26 2026, owner 151): a crossing's s is the exact foot of its path point on the line (sNear snapped it to the 2 m
 *  table, up to 1 m off the path; the deck and the machine centre on c.s). */
const sOn=(x:number,z:number)=>trackNearest(x,z)?.s??sNear(x,z);
export const TRAIN_CROSSINGS:readonly TrainCrossing[]=[
 {id:'north-beach-west',s:sOn(-45,-205),width:3.4,ped:true},
 {id:'north-beach-east',s:sOn(80,-207),width:3.4,ped:true},
 {id:'west-beach',s:sOn(-305,-52),width:3,ped:true},
 {id:'cay-beach',s:sOn(562,-76),width:3,ped:true},
 {id:'causeway',s:sOn(492.4,-142.2),width:16},// Nov 23 2026: centred on the road and the full skewed width of its 14 m deck (was 9 m at 494,-148: ballast stood on the road edges)
 // Phase 4 (Nov 23 2026, owner: "every path that meets the line gets a way across"): the west park's three beach trails and the
 // Beach Kitchen square's walk down to the sand (westParkLayout PARK_TRAILS 'west' / 'south-west' / 'south-east', TRAIL_WIDTH 4.5,
 // and beachKitchenSquare.ts). Width = the trail's footprint along the line (4.5 m / sin of the crossing angle) + a little.
 {id:'park-west-trail',s:sOn(-304.6,5.5),width:9.6,ped:true,skew:-1.43},// meets the line at 34° (8.1 m along it; its paving boxes reach 9.6 m)
 {id:'park-south-west-trail',s:sOn(-249.11,106.97),width:5.4,ped:true,skew:.4},
 {id:'park-south-east-trail',s:sOn(-99.36,114.87),width:5,ped:true,skew:.24},
 {id:'beach-kitchen-square',s:sOn(-59.5,104.4),width:6.6,ped:true},// the square's middle 6.6 m column, in line with its vending machine
];
