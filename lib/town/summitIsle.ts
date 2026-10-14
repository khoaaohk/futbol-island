// Summit Isle (Oct 12 2026, user: "build a medium size island and extend the borders like how i drew it. this island will have a
// small mountain in the middle that slopes down. the medium island is connected to coral cay island via a sandbar", then "this
// island will have a small 5v5 field at the top"). Drawn on the travel map south and south-east of Coral Cay, in the open sea
// that was the south-east flight lobe. Pure data and point tests only (no three.js, no imports): movement and flight
// (simulation.ts blocked / flightBlocked), land tests (landmass.ts), ground height (venues.ts fieldSurfaceHeight), the 3D build
// (summitIsleWorld.ts) and the maps all read these same shapes. coralCay.ts stays import-free (many tests load it on its own).
//
// One polar description keeps every query O(1): the coast is a radius per bearing from SUMMIT_CENTER (a 720-entry table traced
// once from a smooth outline), the summit plateau a rounded rectangle (superellipse) round the same centre, and the ground
// between them a height profile along each ray. The 3D mesh is built on exactly these rays, so the walked height matches it.
export type IslePoint={x:number;z:number};

export const SUMMIT_NAME='Summit Isle';
export const SUMMIT_CENTER={x:640,z:130} as const;
/** Summit (the flat top) height above the beach, m: a sheer tower ~1.5× its base radius (user, Oct 12 2026). */
export const SUMMIT_HEIGHT=50;
/** Ground is drawn this far below the walked height on sand and grass, like Coral Cay's sand (-0.105 under a walked 0). */
export const SUMMIT_VISUAL_DROP=.105;

/** Catmull-Rom spline through anchors (closed ring), `seg` samples per span — as coralCay.ts does. */
function ring(anchors:number[][],seg:number):IslePoint[]{
 const out:IslePoint[]=[],n=anchors.length,get=(k:number)=>anchors[(k+n)%n];
 for(let i=0;i<n;i++)for(let j=0;j<seg;j++){
  const t=j/seg,p0=get(i-1),p1=get(i),p2=get(i+1),p3=get(i+2);
  const at=(k:number)=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
  out.push({x:at(0),z:at(1)});
 }
 return out;
}
function open(anchors:number[][],seg:number):IslePoint[]{
 const out:IslePoint[]=[],n=anchors.length,get=(k:number)=>anchors[Math.max(0,Math.min(n-1,k))];
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){
  const t=j/seg,p0=get(i-1),p1=get(i),p2=get(i+1),p3=get(i+2);
  const at=(k:number)=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
  out.push({x:at(0),z:at(1)});
 }
 out.push({x:anchors[n-1][0],z:anchors[n-1][1]});
 return out;
}
export function insidePolygon(poly:IslePoint[],x:number,z:number){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}
 return inside;
}
function segmentDistance(x:number,z:number,a:IslePoint,b:IslePoint){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
const box=(pts:IslePoint[],pad=0)=>({minX:Math.min(...pts.map(p=>p.x))-pad,maxX:Math.max(...pts.map(p=>p.x))+pad,minZ:Math.min(...pts.map(p=>p.z))-pad,maxZ:Math.max(...pts.map(p=>p.z))+pad});
const inBox=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ;
const clamp01=(v:number)=>v<0?0:v>1?1:v;
const smooth=(a:number,b:number,x:number)=>{const t=clamp01((x-a)/(b-a));return t*t*(3-2*t);};
/** Deterministic variation (no Math.random: the island looks the same on every load). */
export const isleJitter=(i:number,k=1)=>{const s=Math.sin(i*91.7+k*47.3)*43758.5453;return s-Math.floor(s);};

// ---------------------------------------------------------------------------------------------------------------
// The coast: the user's red outline on the travel map (screenshot pixels → world with the map's own projection: 1.88 px per m,
// x = (px − 30) / 1.88 − 160, z = (py − 489) / 1.88 − 104, checked against the East Jetty lighthouse and three fishing marks),
// pulled ~6 m in so the new flight border keeps ~45 m of sea round it. Rounded, slightly irregular, wider at the top right.
const COAST_ANCHORS=[[583,13],[614,8],[676,7],[736,17],[775,42],[801,77],[811,113],[806,155],[791,187],[786,219],[779,242],[727,250],[662,252],[622,249],[551,238],[496,218],[478,197],[472,148],[484,107],[499,80],[515,46],[550,24]];
const COAST_OUTLINE=ring(COAST_ANCHORS,10);
/** Coast radius per bearing (720 bearings, ½° apart), traced once from the outline (it is star-shaped from the centre). */
const BEARINGS=720;
const COAST_R=(()=>{const out=new Float64Array(BEARINGS+1),C=SUMMIT_CENTER,P=COAST_OUTLINE;
 for(let k=0;k<BEARINGS;k++){const a=k/BEARINGS*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a);let best=0;
  for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],ex=q.x-p.x,ez=q.z-p.z,den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)continue;
   const t=((p.x-C.x)*ez-(p.z-C.z)*ex)/den,u=((p.x-C.x)*dz-(p.z-C.z)*dx)/den;if(t>0&&u>=0&&u<=1)best=Math.max(best,t);}
  out[k]=best;}
 out[BEARINGS]=out[0];return out;})();
// Wrapped into [0, BEARINGS): a bearing a hair below 0 rounds to exactly BEARINGS in floating point, so clamp it back.
const bearingIndex=(a:number)=>{let f=a/(Math.PI*2)*BEARINGS;f-=Math.floor(f/BEARINGS)*BEARINGS;return f>=BEARINGS||!(f>=0)?0:f;};
/** Distance from the centre to the waterline at bearing `a` (radians, atan2(z, x)). */
export function coastRadius(a:number){const f=bearingIndex(a),i=Math.floor(f),t=f-i;return COAST_R[i]+(COAST_R[i+1]-COAST_R[i])*t;}

// ---------------------------------------------------------------------------------------------------------------
// The mountain (Oct 12 2026; user: "a small mountain in the middle that slopes down", "much steeper", "the mountain is good height,
// but have it gradually slope down", then "doesn't look like a plateau … should be green with ridges, contours and different
// depths"): a 58 m green peak with a rounded summit, one long concave sweep down to the beaches (steep near the top, gentle
// foothills below), and spurs and gullies radiating from the summit (radial ridged noise, domain-warped so they bend). The
// 5-a-side pitch sits on the summit itself ("the field should be at the top"): a flat just big enough for it, with the green slopes
// falling away from its edge in every direction.
// A switchback trail climbs the smoother north-east face (ridges damped there) to the terrace; the jetpack reaches the summit.
// Anything steeper than SUMMIT_WALK_SLOPE cannot be walked.
/** The summit (the peak's top, 58 m) and the terrace that carries the pitch. */
/** The summit's flat (Oct 12 2026, user: "the field should be at the top"): a rounded rectangle just big enough for the pitch,
 *  its fence and a walkway, the green slopes falling away from its edge with a rounded shoulder (no table edge). */
export const TERRACE={x:632,z:118,a:24.5,b:16.5,r:6,h:SUMMIT_HEIGHT} as const;
export const SUMMIT_PEAK={x:TERRACE.x,z:TERRACE.z} as const;
export const PITCH_HEIGHT=SUMMIT_HEIGHT;
/** Beach width (waterline to the dune line) per bearing: 9–19 m, wider on the headlands. */
export const beachWidth=(a:number)=>14+3.5*Math.sin(3*a+1)+1.6*Math.sin(7*a+.5);
/** Height of the dune line above the beach. */
const DUNE=.32;
/** Shape of the profile (see profileAt): larger = a fuller dome on top and longer, flatter foothills. */
const SLOPE_POWER=2.6;
/** Steepest walkable ground (m per m, ~32°). */
export const SUMMIT_WALK_SLOPE=.62;
/** Steepest walkable ground on a trail's bank (m per m, ~42°): stepping or riding off the trail sideways is never blocked. */
export const SUMMIT_TRAIL_BANK_SLOPE=.9;
const D2R=Math.PI/180;
const angleDiff=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
/** Distance from the peak to the waterline per bearing round the peak (the outline is star-shaped from it too). */
const PEAK_R=(()=>{const out=new Float64Array(BEARINGS+1),C=SUMMIT_PEAK,P=COAST_OUTLINE;
 for(let k=0;k<BEARINGS;k++){const a=k/BEARINGS*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a);let best=0;
  for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],ex=q.x-p.x,ez=q.z-p.z,den=dx*ez-dz*ex;if(Math.abs(den)<1e-12)continue;
   const t=((p.x-C.x)*ez-(p.z-C.z)*ex)/den,u=((p.x-C.x)*dz-(p.z-C.z)*dx)/den;if(t>0&&u>=0&&u<=1)best=Math.max(best,t);}
  out[k]=best;}
 out[BEARINGS]=out[0];return out;})();
/** Waterline distance from the peak at bearing `a` (atan2(z, x) round the peak). */
export function peakCoastRadius(a:number){const f=bearingIndex(a),i=Math.min(BEARINGS-1,Math.floor(f)),t=f-i;return PEAK_R[i]+(PEAK_R[i+1]-PEAK_R[i])*t;}
/** The smooth profile at fraction u of the way from the summit's edge (0) to the dune line (1): a bell (1 − u)^p · (1 + p·u), level
 *  where it meets the summit (a rounded, domed top round the pitch, never a table edge), steepest a third of the way down, then a
 *  long concave sweep easing to level at the beach. */
export function profileAt(u:number){const v=Math.max(0,Math.min(1,u)),p=SLOPE_POWER;return DUNE+(SUMMIT_HEIGHT-DUNE)*Math.pow(1-v,p)*(1+p*v);}
/** Ridge relief per bearing: the north-east face, where the trail climbs, is kept smooth. */
const ridgeDamp=(a:number)=>1-.85*smooth(46*D2R,32*D2R,Math.abs(angleDiff(a,-18*D2R)));
/** Spurs and gullies (m): ridged noise round the peak, the ridge lines bending with height (domain warp); none at the summit, the
 *  foothills' edge or on the terrace. 1 at a crest, 0 deepest in a gully (for colour: `ridgeShade`). */
function ridges(a:number,u:number){
 const w=a+.22*Math.sin(3*a+4.5*u)+.1*Math.sin(7*a-6*u+1);
 const r1=1-Math.abs(Math.sin(4.5*w+.6*Math.sin(2*a))),r2=1-Math.abs(Math.sin(11.5*w+2.1+1.3*u));
 return .72*r1*r1+.28*r2;
}
const ridgeAmp=(a:number,u:number)=>9*smooth(.05,.22,u)*(1-smooth(.42,.86,u))*ridgeDamp(a);
/** Polar position round the peak. */
function peakPolar(x:number,z:number){const dx=x-SUMMIT_PEAK.x,dz=z-SUMMIT_PEAK.z,a=Math.atan2(dz,dx);return {a,rho:Math.hypot(dx,dz),rc:peakCoastRadius(a)};}
/** The summit's flat: 1 on it (a rounded rectangle round the pitch), 0 off it. */
export function terraceWeight(x:number,z:number){const T=TERRACE,qx=Math.max(0,Math.abs(x-T.x)-(T.a-T.r)),qz=Math.max(0,Math.abs(z-T.z)-(T.b-T.r));return Math.hypot(qx,qz)<=T.r?1:0;}
/** Distance from the summit's centre to the flat's edge per bearing (½° table, by bisection on the rounded rectangle). */
const EDGE_R=(()=>{const out=new Float64Array(BEARINGS+1),T=TERRACE;for(let k=0;k<BEARINGS;k++){const a=k/BEARINGS*Math.PI*2;let lo=0,hi=Math.hypot(T.a,T.b)+1;
  for(let i=0;i<30;i++){const m=(lo+hi)/2;if(terraceWeight(T.x+Math.cos(a)*m,T.z+Math.sin(a)*m)>=1)lo=m;else hi=m;}out[k]=(lo+hi)/2;}out[BEARINGS]=out[0];return out;})();
export function summitEdgeRadius(a:number){const f=bearingIndex(a),i=Math.min(BEARINGS-1,Math.floor(f)),t=f-i;return EDGE_R[i]+(EDGE_R[i+1]-EDGE_R[i])*t;}
/** Climb fraction u on bearing `a` at distance `rho` from the summit's centre: 0 at the flat's edge, 1 at the dune line. */
const climbU=(a:number,rho:number,rc:number)=>{const re=summitEdgeRadius(a),rd=rc-beachWidth(a);return Math.max(0,(rho-re)/Math.max(1,rd-re));};
/** The mountain before the trails are carved: the flat summit, then the profile from its edge down to the dune line. */
function naturalHeight(x:number,z:number){
 const p=peakPolar(x,z),s=p.rc-p.rho;if(s<=0)return 0;
 const bw=beachWidth(p.a);if(s<bw){const t=s/bw;return DUNE*t*t;}
 const u=climbU(p.a,p.rho,p.rc);return profileAt(u)+ridgeAmp(p.a,u)*(ridges(p.a,u)-.42);
}
export const SUMMIT_BOX=box(COAST_OUTLINE,2);
/** The mountain with the pitch's terrace cut in (before the trails are carved). */
function shapedHeight(x:number,z:number){return terraceWeight(x,z)>=1?PITCH_HEIGHT:naturalHeight(x,z);}
/** The trails carved into the slope (a 1 m grid of distance to the nearest trail and the trail's height there; built once below,
 *  after the trails are laid out). */
type TrailGrid={x0:number;z0:number;nx:number;nz:number;dist:Float32Array;height:Float32Array};
let TRAIL_GRID:TrailGrid|null=null;
/** Carved trail cross-section: flat for TRAIL_FLAT m either side of the centre line (a 3.4 m tread), cut or filled back to the slope
 *  by TRAIL_EDGE (Oct 13 2026: 8 m, was 3.4, so the cut banks are gentle enough to step or ride off and onto the trail anywhere). */
const TRAIL_FLAT=1.7,TRAIL_EDGE=8;
/** How far either side of a trail's centre line its carve reaches (m): the 3D build draws this corridor finer. */
export const SUMMIT_TRAIL_CARVE=TRAIL_EDGE;
function trailCarve(x:number,z:number,h:number){const g=TRAIL_GRID;if(!g)return h;const fx=x-g.x0,fz=z-g.z0;if(fx<0||fz<0||fx>=g.nx-1||fz>=g.nz-1)return h;
 const i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j,k=j*g.nx+i,k2=k+g.nx;
 const lerp2=(a:Float32Array)=>(a[k]*(1-tx)+a[k+1]*tx)*(1-tz)+(a[k2]*(1-tx)+a[k2+1]*tx)*tz;
 const d=lerp2(g.dist);if(d>=TRAIL_EDGE)return h;const w=d<=TRAIL_FLAT?1:1-smooth(TRAIL_FLAT,TRAIL_EDGE,d);return h+(lerp2(g.height)-h)*w;}
/** Distance (m) to the nearest trail centre line, from the trail grid (1e3 away from the trails). */
export function summitTrailDistance(x:number,z:number){const g=TRAIL_GRID;if(!g)return 1e3;const fx=x-g.x0,fz=z-g.z0;if(fx<0||fz<0||fx>=g.nx-1||fz>=g.nz-1)return 1e3;
 const i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j,k=j*g.nx+i,k2=k+g.nx,a=g.dist;return (a[k]*(1-tx)+a[k+1]*tx)*(1-tz)+(a[k2]*(1-tx)+a[k2+1]*tx)*tz;}
export function summitGround(x:number,z:number){
 if(x<SUMMIT_BOX.minX||x>SUMMIT_BOX.maxX||z<SUMMIT_BOX.minZ||z>SUMMIT_BOX.maxZ)return 0;
 // The terrace's flat stays exactly level (the trail arrives at its edge).
 const w=terraceWeight(x,z);if(w>=.999)return PITCH_HEIGHT;
 return trailCarve(x,z,w<=0?naturalHeight(x,z):shapedHeight(x,z));
}
/** For colour: 0 deep in a gully … 1 on a crest, weighted by how much relief there is (0.5 = no relief). */
export function ridgeShade(x:number,z:number){const p=peakPolar(x,z),u=climbU(p.a,p.rho,p.rc),amp=ridgeAmp(p.a,u)/9;return .5+(ridges(p.a,u)-.5)*amp;}
/** Ground slope (m per m) at (x, z), from four nearby heights. */
export function summitSlope(x:number,z:number){const e=.6;return Math.hypot(summitGround(x+e,z)-summitGround(x-e,z),summitGround(x,z+e)-summitGround(x,z-e))/(2*e);}
/** Walkable island: the sand (feet ~0.9 m off the waterline, like Coral Cay's 8% inset) and any ground gentler than the walk
 *  limit; never the steep upper slopes, the terrace's cut banks or the steepest spurs. */
export function onSummitIsle(x:number,z:number){
 if(!inBox(SUMMIT_BOX,x,z))return false;
 const dx=x-SUMMIT_CENTER.x,dz=z-SUMMIT_CENTER.z,a=Math.atan2(dz,dx),rc=coastRadius(a),rho=Math.hypot(dx,dz);if(rho>rc-.9)return false;
 if(rho>=rc-beachWidth(a)+.8)return true;
 if(terraceWeight(x,z)>=1&&terraceWeight(x+.7,z)>=1&&terraceWeight(x-.7,z)>=1&&terraceWeight(x,z+.7)>=1&&terraceWeight(x,z-.7)>=1)return true;
 // Beside a trail (its cut or fill bank) a little steeper is fine: the bank is short, and the trail must never be walled in.
 return summitSlope(x,z)<=(summitTrailDistance(x,z)<TRAIL_EDGE+.5?SUMMIT_TRAIL_BANK_SLOPE:SUMMIT_WALK_SLOPE);
}
/** A point on bearing `a` round the peak at fraction u of the way down to the dune line (u > 1: onto the beach). */
export function peakPoint(a:number,u:number):IslePoint{const rc=peakCoastRadius(a),bw=beachWidth(a),re=summitEdgeRadius(a),r=u<=1?re+u*(rc-bw-re):rc-bw*(2-u);return {x:SUMMIT_PEAK.x+Math.cos(a)*r,z:SUMMIT_PEAK.z+Math.sin(a)*r};}
/** Fraction u down the smooth profile where it stands `h` m high. */
export function profileU(h:number){let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(profileAt(m)>h)lo=m;else hi=m;}return (lo+hi)/2;}
/** A point on bearing `a` round the peak where the smooth profile stands `h` m high. */
export const heightPoint=(a:number,h:number)=>peakPoint(a,profileU(h));
/** A point on bearing `a` round the island's centre, `back` beach widths in from the waterline (1 = on the dune line). */
export function beachPoint(a:number,back:number):IslePoint{const r=coastRadius(a)-beachWidth(a)*back;return {x:SUMMIT_CENTER.x+Math.cos(a)*r,z:SUMMIT_CENTER.z+Math.sin(a)*r};}
/** The coastline as points every ½° (for the maps and distance queries). */
export const SUMMIT_SHORE:IslePoint[]=Array.from({length:BEARINGS/2},(_,k)=>{const a=k/(BEARINGS/2)*Math.PI*2,r=COAST_R[k*2];return {x:SUMMIT_CENTER.x+Math.cos(a)*r,z:SUMMIT_CENTER.z+Math.sin(a)*r};});
/** The dune line (beach / grass edge), for the maps. */
export const SUMMIT_LAWN:IslePoint[]=Array.from({length:180},(_,k)=>beachPoint(k/180*Math.PI*2,1));
/** The terrace's edge, for the maps. */
export const SUMMIT_TERRACE:IslePoint[]=Array.from({length:96},(_,k)=>{const a=k/96*Math.PI*2,r=summitEdgeRadius(a);return {x:TERRACE.x+Math.cos(a)*r,z:TERRACE.z+Math.sin(a)*r};});
/** A contour line at `height` m round the peak, for the maps (outermost crossing on each bearing, so spurs bulge and gullies dip). */
export function summitContour(height:number,count=144):IslePoint[]{
 return Array.from({length:count},(_,k)=>{const a=k/count*Math.PI*2,rc=peakCoastRadius(a);let r=0;
  for(let rr=rc;rr>0;rr-=1){const x=SUMMIT_PEAK.x+Math.cos(a)*rr,z=SUMMIT_PEAK.z+Math.sin(a)*rr;if(summitGround(x,z)>=height){r=rr;break;}}
  return {x:SUMMIT_PEAK.x+Math.cos(a)*r,z:SUMMIT_PEAK.z+Math.sin(a)*r};});
}
const shoreBox=box(SUMMIT_SHORE);
export const distanceToSummitShore=(x:number,z:number)=>{let best=Infinity;const P=SUMMIT_SHORE;for(let i=0;i<P.length;i++)best=Math.min(best,segmentDistance(x,z,P[i],P[(i+1)%P.length]));return best;};

// ---------------------------------------------------------------------------------------------------------------
// The sandbar (a tombolo): a natural sand spit from Coral Cay's south cove straight down to the island's north beach, where the
// user drew two parallel lines (x ≈ 600–616). Shallow water either side; the strip's sand runs on under both islands' beaches.
const BAR_ANCHORS=[[607,-80],[606,-62],[608,-44],[611,-26],[613,-8],[614,9],[615,24]];
/** Centre line every ~2 m with arc length. */
export const SANDBAR_PATH=(()=>{const raw=open(BAR_ANCHORS,12),out:{x:number;z:number;s:number}[]=[];let s=0;
 raw.forEach((p,i)=>{if(i)s+=Math.hypot(p.x-raw[i-1].x,p.z-raw[i-1].z);out.push({x:p.x,z:p.z,s});});return out;})();
export const SANDBAR_LENGTH=SANDBAR_PATH[SANDBAR_PATH.length-1].s;
/** Half-width of the sand top (m) along the bar (user: "the sandbar needs to be skinnier"): 2.4–3.4 m, a slim strip with
 *  3.2–5.2 m of walkable sand, flaring smoothly into both beaches over its last ~14 m. */
export function sandbarHalfWidth(s:number){
 const flare=Math.max(smooth(14,0,s),smooth(SANDBAR_LENGTH-16,SANDBAR_LENGTH,s));
 return 2.9+.35*Math.sin(s/8.5+.4)+.2*Math.sin(s/3.7+1.3)+6*flare;
}
/** The skirt: wet sand sloping from the sand top into the sea over this width (m). */
export const SANDBAR_SKIRT=2;
export const SANDBAR_NAME='Summit Sandbar';
const barBox=box(SANDBAR_PATH,18);
/** Nearest centre-line point: arc length s and distance d (signed: + = east of the bar). */
export function sandbarFrame(x:number,z:number){
 const P=SANDBAR_PATH;let best=Infinity,bs=0,bd=0;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2)),px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);
  if(d<best){best=d;bs=a.s+(b.s-a.s)*t;const l=Math.sqrt(l2);bd=((x-px)*dz-(z-pz)*dx)/l;}}
 return {s:bs,d:bd,dist:best};
}
export function onSummitSandbar(x:number,z:number){if(!inBox(barBox,x,z))return false;const f=sandbarFrame(x,z);return f.dist<=sandbarHalfWidth(f.s)-.8;}
/** Ground anyone on foot or on a ride can move over (Oct 13 2026, user: "still stuck and can't go up the mountain with the bike",
 *  "some areas can't go down"): the sandbar and the whole island inside its waterline, at any slope. The mountain is grass all
 *  over (no rock faces), so steepness is never a wall: how steep a climb is taken head-on is the hill assist's job
 *  (rideSlope.ts createHillAssist: slower uphill, angling across the slope above the climb limit). Landing still asks for
 *  onSummitLand (a gentle spot). Box rejects first: four comparisons away from the island. */
export function onSummitGround(x:number,z:number){
 if(onSummitSandbar(x,z))return true;if(!inBox(SUMMIT_BOX,x,z))return false;
 const dx=x-SUMMIT_CENTER.x,dz=z-SUMMIT_CENTER.z;return Math.hypot(dx,dz)<=coastRadius(Math.atan2(dz,dx))-.9;
}
/** Everything walkable here: the island and its sandbar. Cheap box rejects first (called from movement and landing tests). */
export function onSummitLand(x:number,z:number){return onSummitSandbar(x,z)||onSummitIsle(x,z);}
/** Distance to walkable Summit Isle ground (0 on it). */
export function distanceToSummitLand(x:number,z:number){
 if(onSummitLand(x,z))return 0;
 // On the island itself but too steep to stand on (a face of the mountain): walkable ground is close by, so 0 is the honest lower
 // bound (Oct 13 2026: the shore distance here sent a landing over a steep face ~60 m away to the beach instead of the slope).
 if(inBox(SUMMIT_BOX,x,z)&&summitGround(x,z)>.5)return 0;
 let best=Infinity;
 if(inBox(barBox,x,z)){const f=sandbarFrame(x,z);best=Math.max(0,f.dist-(sandbarHalfWidth(f.s)-.8));}
 else{const f=sandbarFrame(x,z);best=Math.max(0,f.dist-10);}
 const dx=Math.max(shoreBox.minX-x,0,x-shoreBox.maxX),dz=Math.max(shoreBox.minZ-z,0,z-shoreBox.maxZ);
 if(Math.hypot(dx,dz)>=best)return best;
 return Math.min(best,distanceToSummitShore(x,z)+.9);
}

// ---------------------------------------------------------------------------------------------------------------
// The flight border (user's red line, Oct 12 2026): the playable sea grows south and east round the island, ~45 m of open water
// past every beach. It joins the existing south-east sea (coralCay.ts SOUTH_EAST_SEA) along its north and west sides, and stays
// inside x ≤ 864, z ≤ 300 so the maps' extent and the analytics heat-map grid (islandIds.ts GRID) are unchanged.
export const SUMMIT_SEA:IslePoint[]=ring([[700,-25],[790,-12],[838,14],[856,60],[858,120],[856,190],[858,250],[842,284],[796,295],[700,296],[610,296],[540,293],[480,284],[440,262],[425,215],[430,150],[452,90],[500,35],[580,-8],[640,-28]],6);
const seaBox=box(SUMMIT_SEA);
export const SUMMIT_FLIGHT_BOX=seaBox;
export const inSummitSea=(x:number,z:number)=>inBox(seaBox,x,z)&&insidePolygon(SUMMIT_SEA,x,z);

// ---------------------------------------------------------------------------------------------------------------
// The 5-a-side pitch on the terrace ("Summit 5s"). Long axis east–west (x), along the shoulder's contour, so the terrace's cut
// bank (uphill, north) and embankment (downhill, south) stay small. Small-sided dimensions: 36 m × 22 m; 5-a-side goals
// 3.66 m × 1.83 m (12 × 6 ft); 6 m goal areas (quarter circles from the posts, as in futsal-style small-sided games).
export const SUMMIT_PITCH={name:'Summit 5s',x:TERRACE.x,z:TERRACE.z,length:36,width:22,goalWidth:3.66,goalHeight:1.83,goalDepth:1.2,box:6,runoff:2.4} as const;
/** The ball-stop fence: a low timber rail round the run-off (halfX along the length), with a gate in the south touchline near the
 *  east end, where the trail arrives along the shoulder. */
export const SUMMIT_FENCE={halfX:SUMMIT_PITCH.length/2+SUMMIT_PITCH.runoff+.6,halfZ:SUMMIT_PITCH.width/2+SUMMIT_PITCH.runoff,height:1.1,gate:{x0:TERRACE.x+9,x1:TERRACE.x+12}} as const;
/** Fence and goals as collision boxes (players and the walking ball bounce off them). */
export const SUMMIT_OBSTACLES=(()=>{const P=SUMMIT_PITCH,F=SUMMIT_FENCE,out:{x:number;z:number;w:number;d:number}[]=[],t=.24;
 // West and east ends.
 for(const side of [-1,1])out.push({x:P.x+side*F.halfX,z:P.z,w:t,d:F.halfZ*2+t});
 // North touchline whole; south touchline in two pieces either side of the gate.
 const x0=P.x-F.halfX,x1=P.x+F.halfX,gz=P.z+F.halfZ;
 out.push({x:P.x,z:P.z-F.halfZ,w:F.halfX*2+t,d:t});
 out.push({x:(x0+F.gate.x0)/2,z:gz,w:F.gate.x0-x0,d:t},{x:(F.gate.x1+x1)/2,z:gz,w:x1-F.gate.x1,d:t});
 // Goals: two posts and the back net (the ball stops in the net; you walk round the frame).
 for(const side of [-1,1]){const gx=P.x+side*P.length/2,back=gx+side*P.goalDepth;
  for(const s2 of [-1,1])out.push({x:(gx+back)/2,z:P.z+s2*P.goalWidth/2,w:P.goalDepth+.1,d:.14});
  out.push({x:back,z:P.z,w:.12,d:P.goalWidth+.14});}
 return out;})();
/** Free-play goals on the Summit 5s (the walking ball): true when the ball crossed a goal line between the posts and under the bar. */
export function summitGoalCrossed(from:{x:number;z:number},to:{x:number;z:number},y:number){
 const P=SUMMIT_PITCH;if(Math.abs(to.x-P.x)>P.length||Math.abs(to.z-P.z)>P.width)return false;
 for(const side of [-1,1]){const plane=P.x+side*P.length/2;if((from.x-plane)*side>=0||(to.x-plane)*side<0)continue;
  if(y-PITCH_HEIGHT>P.goalHeight)continue;const t=(plane-from.x)/(to.x-from.x);if(Math.abs(from.z+(to.z-from.z)*t-P.z)<P.goalWidth/2-.1)return true;}
 return false;
}

// ---------------------------------------------------------------------------------------------------------------
// Paths (dirt tracks). Main route: from the sandbar's landing onto the northern foothills, then one long rising traverse round the
// mountain to the summit, and round the pitch on the walkway to its south gate. A beach path from the east beach joins the climb.
// Built from the mountain's own shape (bearing round the summit, height on its profile), and carved into the slope below.
const H_=(deg:number,h:number)=>{const p=heightPoint(deg*D2R,h);return [p.x,p.z];};
const B_=(deg:number,back:number)=>{const p=beachPoint(deg*D2R,back);return [p.x,p.z];};
/** Switchbacks: legs across the face at an even climb, joined by round hairpins. turns: [bearing°, height] at each leg end. */
function switchbacks(turns:number[][],hairpin:number){
 const out:number[][]=[];
 for(let k=0;k<turns.length-1;k++){const [a0,h0]=turns[k],[a1,h1]=turns[k+1],n=Math.max(4,Math.round(Math.abs(a1-a0)/2));
  for(let i=k?1:0;i<=n;i++){const t=i/n;out.push(H_(a0+(a1-a0)*t,h0+(h1-h0)*t));}
  if(k===turns.length-2)break;
  const end=H_(a1,h1),next=H_(a1,h1+hairpin),cx=(end[0]+next[0])/2,cz=(end[1]+next[1])/2,R=Math.hypot(next[0]-end[0],next[1]-end[1])/2||.5;
  const ex=(end[0]-cx)/R,ez=(end[1]-cz)/R,dir=Math.sign(a1-a0)||1;let px=-ez,pz=ex;const tb=H_(a1+dir*2,h1+hairpin/2);if((tb[0]-cx)*px+(tb[1]-cz)*pz<0){px=-px;pz=-pz;}
  for(let i=1;i<8;i++){const f=i/8*Math.PI;out.push([cx+R*(Math.cos(f)*ex+Math.sin(f)*px),cz+R*(Math.cos(f)*ez+Math.sin(f)*pz)]);}
  turns[k+1]=[a1,h1+hairpin];}
 return out;
}
/** The climb: one long rising traverse round the mountain (no hairpins, so the carved trail never doubles back on itself), from the
 *  northern foothills clockwise round the east, south and west faces, its height rising with the distance walked (grade ~0.17),
 *  onto the summit by the lookout. */
const CLIMB:number[][]=(()=>{const out:number[][]=[],step=1.5*D2R,top=PITCH_HEIGHT-.4;let a=-100*D2R,h=3;
 while(h<top&&out.length<400){const p=heightPoint(a,h);out.push([p.x,p.z]);const q=heightPoint(a+step,h),r=Math.hypot(q.x-p.x,q.z-p.z);h=Math.min(top,h+.17*r);a+=step;}
 const p=heightPoint(a,top);out.push([p.x,p.z]);return out;})();
const CLIMB_END=CLIMB[CLIMB.length-1];
/** Where the east beach path meets the climb: the climb's point nearest bearing −37° round the peak (~19 m up, ~120 m from the beach,
 *  so the joining path rises at ~0.16, like the climb). */
const EAST_JOIN=(()=>{let best=0,bd=Infinity;CLIMB.forEach(([x,z],i)=>{const d=Math.abs(angleDiff(Math.atan2(z-SUMMIT_PEAK.z,x-SUMMIT_PEAK.x),-37*D2R));if(d<bd){bd=d;best=i;}});return best;})();
const GATE_OUT=[(SUMMIT_FENCE.gate.x0+SUMMIT_FENCE.gate.x1)/2,TERRACE.z+SUMMIT_FENCE.halfZ+1.6];
const PATH_ANCHORS:number[][][]=[
 // Sandbar landing → the start of the climb on the northern foothills.
 [[615,22],H_(-104,1.6),CLIMB[0]],
 // The climb (dense, unsmoothed), then over the summit's edge to the walkway and the south gate.
 [...CLIMB,...(()=>{const dx=CLIMB_END[0]-TERRACE.x,dz=CLIMB_END[1]-TERRACE.z,l=Math.hypot(dx,dz),entry=[TERRACE.x+dx*(l-1.6)/l,TERRACE.z+dz*(l-1.6)/l];
  // Round the pitch on the walkway to the south gate: straight along the south side (arriving there from the south-west), or
  // down the west side first.
  return dz>0?[entry]:[entry,[TERRACE.x-22.9,TERRACE.z-2],[TERRACE.x-21.6,TERRACE.z+15]];})(),GATE_OUT],
 // From the east beach up to the climb, joining it on the east face (Oct 13 2026: it used to stop short in the foothills, 45 m
 // from the climb; now one connected network).
 // It meets the climb at an angle, coming up from below it (not alongside it, where two treads would sit side by side).
 [B_(0,.5),B_(0,1.15),H_(-16,6),H_(-29,12.5),CLIMB[EAST_JOIN]],
];
/** Paths as polylines: the foothill and beach anchors are smoothed (Catmull-Rom). The climb is already dense; where it reaches the
 *  summit's shoulder (1.2 m below the top) it turns onto the walkway on a round bend (TURN_R m, so the drawn path never folds on
 *  itself; Oct 13 2026: it hairpinned there through 77°–95° corners) and runs along the walkway to the gate. */
const TURN_R=3.2;
export const SUMMIT_PATHS:IslePoint[][]=PATH_ANCHORS.map((a,i)=>{if(i!==1)return open(a,6);
 const pts=a.map(([x,z])=>({x,z})),walk={x:GATE_OUT[0]-10,z:GATE_OUT[1]},gate={x:GATE_OUT[0],z:GATE_OUT[1]};
 let j=pts.findIndex(p=>shapedHeight(p.x,p.z)>=PITCH_HEIGHT-1.2);if(j<2)j=CLIMB.length-1;j=Math.min(j,CLIMB.length-1);
 const out=pts.slice(0,j+1);let p=pts[j],h=Math.atan2(p.z-pts[j-1].z,p.x-pts[j-1].x);
 const toWalk=()=>angleDiff(Math.atan2(walk.z-p.z,walk.x-p.x),h),side=Math.sign(toWalk())||1,step=.5;
 for(let n=0;n<80&&Math.abs(toWalk())>.05;n++){const dh=Math.min(step/TURN_R,Math.abs(toWalk()));h+=side*dh;p={x:p.x+Math.cos(h)*step,z:p.z+Math.sin(h)*step};out.push(p);}
 // Then straight onto the walkway along the pitch's south side (clear of the board and bench) and along it to the gate.
 for(const q of [walk,gate]){const l=Math.hypot(q.x-p.x,q.z-p.z),n=Math.max(1,Math.ceil(l/2));for(let m=1;m<=n;m++)out.push({x:p.x+(q.x-p.x)*m/n,z:p.z+(q.z-p.z)*m/n});p=q;}
 return out;});
/** Carve the trails: each trail's height follows the slope it crosses (smoothed, and never steeper than 0.3 along it), stamped into
 *  a 1 m grid of (distance to the nearest trail, trail height). Built once at load (~3k segment–cell tests). */
TRAIL_GRID=(()=>{const pad=TRAIL_EDGE+2,pts=SUMMIT_PATHS.flat(),x0=Math.floor(Math.min(...pts.map(p=>p.x))-pad),z0=Math.floor(Math.min(...pts.map(p=>p.z))-pad);
 const nx=Math.ceil(Math.max(...pts.map(p=>p.x))+pad-x0)+1,nz=Math.ceil(Math.max(...pts.map(p=>p.z))+pad-z0)+1,dist=new Float32Array(nx*nz).fill(1e3),height=new Float32Array(nx*nz);
 // The climb first; the sandbar path and the east beach path then meet it at its own height (one connected network, no step
 // where they join).
 let climbP:IslePoint[]=[],climbH:number[]=[],climbD=new Float32Array(0);
 for(const index of [1,0,2]){const path=SUMMIT_PATHS[index];
  // Resample every ~1 m, then the trail heights: the shaped slope, smoothed, grade-limited both ways.
  const P:IslePoint[]=[path[0]];for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)));for(let k=1;k<=n;k++)P.push({x:a.x+(b.x-a.x)*k/n,z:a.z+(b.z-a.z)*k/n});}
  const raw=P.map(p=>shapedHeight(p.x,p.z)),hp=raw.map((_,i)=>{let s2=0,n=0;for(let k=Math.max(0,i-4);k<=Math.min(raw.length-1,i+4);k++){s2+=raw[k];n++;}return s2/n;});
  // Onto the terrace the trail meets its level exactly (no smoothing across the terrace's edge).
  for(let i=0;i<P.length;i++){const w=terraceWeight(P[i].x,P[i].z);if(w>0)hp[i]=hp[i]+(raw[i]-hp[i])*Math.min(1,w*2);}
  for(let pass=0;pass<2;pass++){for(let i=1;i<hp.length;i++){const d=Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z);hp[i]=Math.min(hp[i],hp[i-1]+.3*d);hp[i]=Math.max(hp[i],hp[i-1]-.3*d);}
   for(let i=hp.length-2;i>=0;i--){const d=Math.hypot(P[i].x-P[i+1].x,P[i].z-P[i+1].z);hp[i]=Math.min(hp[i],hp[i+1]+.3*d);hp[i]=Math.max(hp[i],hp[i+1]-.3*d);}}
  // Round off the limiter's corners: two ±6 m running means (a mean of a grade-limited profile stays grade-limited), so the
  // grade changes gradually instead of in kinks a rider feels as bumps; the terrace's own points keep their exact level.
  for(let pass=0;pass<2;pass++){const src=hp.slice();for(let i=0;i<hp.length;i++){if(terraceWeight(P[i].x,P[i].z)>0)continue;let s2=0,n=0;for(let k=Math.max(0,i-6);k<=Math.min(hp.length-1,i+6);k++){s2+=src[k];n++;}hp[i]=s2/n;}}
  if(index===1){climbP=P;climbH=hp;}
  else{// Meet the climb at its height: the difference is spread evenly along the whole path (its start stays put).
   const end=P[P.length-1];let best=0,bd=Infinity;climbP.forEach((q,i)=>{const d=Math.hypot(q.x-end.x,q.z-end.z);if(d<bd){bd=d;best=i;}});
   const shift=climbH[best]-hp[hp.length-1],cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].z-P[i-1].z));
   const total=cum[cum.length-1]||1;for(let i=0;i<hp.length;i++)hp[i]+=shift*cum[i]/total;}
  const pd=new Float32Array(nx*nz).fill(1e3),ph=new Float32Array(nx*nz);
  for(let s2=0;s2<P.length-1;s2++){const a=P[s2],b=P[s2+1],dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz||1e-9;
   const i0=Math.max(0,Math.floor(Math.min(a.x,b.x)-pad-x0)),i1=Math.min(nx-1,Math.ceil(Math.max(a.x,b.x)+pad-x0)),j0=Math.max(0,Math.floor(Math.min(a.z,b.z)-pad-z0)),j1=Math.min(nz-1,Math.ceil(Math.max(a.z,b.z)+pad-z0));
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=x0+i,z=z0+j,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/l2)),d=Math.hypot(x-a.x-dx*t,z-a.z-dz*t),k=j*nx+i;
    if(d<pd[k]){pd[k]=d;ph[k]=hp[s2]+(hp[s2+1]-hp[s2])*t;}}}
  // Merge: where a joining path runs inside the climb's carve, the two heights blend by distance (no seam at the join).
  for(let k=0;k<pd.length;k++){if(pd[k]>=1e3)continue;
   if(index!==1&&climbD[k]<TRAIL_EDGE){const wc=1.001-smooth(0,TRAIL_EDGE,climbD[k]),wo=1.001-smooth(0,TRAIL_EDGE,pd[k]);height[k]=(height[k]*wc+ph[k]*wo)/(wc+wo);dist[k]=Math.min(dist[k],pd[k]);}
   else if(pd[k]<dist[k]){dist[k]=pd[k];height[k]=ph[k];}}
  if(index===1)climbD=pd;}
 return {x0,z0,nx,nz,dist,height};})();
export const SUMMIT_PATH_WIDTH=2;

// ---------------------------------------------------------------------------------------------------------------
/** Named anchor points (world x/z, all walkable): for the build, the maps and any future feature placing things here. */
export const SUMMIT_LANDMARKS={
 center:{x:SUMMIT_CENTER.x,z:SUMMIT_CENTER.z},
 pitch:{x:SUMMIT_PITCH.x,z:SUMMIT_PITCH.z},
 gate:{x:(SUMMIT_FENCE.gate.x0+SUMMIT_FENCE.gate.x1)/2,z:SUMMIT_PITCH.z+SUMMIT_FENCE.halfZ+1.4},
 /** The lookout (a flag and a cairn) on the summit's north-west walkway, looking out over Coral Cay and the main island. */
 lookout:{x:TERRACE.x-20,z:TERRACE.z-14.8},
 sandbarLanding:{x:615,z:20},
 sandbarMiddle:{x:611,z:-26},
 northBeach:{x:660,z:22},
 southBeach:{x:690,z:238},
 westBeach:{x:488,z:150},
 eastBeach:{x:796,z:120},
} as const;

// ---------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------
// Height grids (Oct 13 2026, user: "when flying up and down the mountain, it's a little bumpy, can we have that be more smooth?").
// Sampled once, the first time something asks (Town creates the flight lift and the camera pull at load): summitGround every
// 2 m over the island and a 24 m apron of sea (~35k samples, a few ms). Per frame, a lookup is one bilinear read instead of the
// polar profile, the ridge noise and the trail carve.
//  - raw: the ground itself (the camera's sight-line tests, the rides' slope and pitch).
//  - env: a smoothed envelope for flying over: the highest ground within 14 m (a square max filter), then two 6 m box blurs.
//    Each blur stays inside the max filter's reach, so env never dips below the ground sampled around it, and the ridge and
//    gully noise is gone: one broad, rounded dome to follow.
export type SummitHeightGrid={x0:number;z0:number;nx:number;nz:number;step:number;raw:Float32Array;env:Float32Array};
const HG_STEP=2,HG_PAD=24,HG_MAX=7,HG_BLUR=3;
let HEIGHT_GRID:SummitHeightGrid|null=null;
/** Max (or mean) over ±r cells along one axis, for every row (or column): a sliding window, O(cells · r). */
function filterAxis(src:Float32Array,nx:number,nz:number,r:number,alongX:boolean,max:boolean){
 const out=new Float32Array(src.length),n=alongX?nx:nz,m=alongX?nz:nx,at=(line:number,i:number)=>alongX?line*nx+i:i*nx+line;
 for(let line=0;line<m;line++)for(let i=0;i<n;i++){let acc=max?-Infinity:0,count=0;
  for(let k=Math.max(0,i-r),e=Math.min(n-1,i+r);k<=e;k++){const v=src[at(line,k)];if(max){if(v>acc)acc=v;}else{acc+=v;count++;}}
  out[at(line,i)]=max?acc:acc/count;}
 return out;
}
export function summitHeightGrid():SummitHeightGrid{
 if(HEIGHT_GRID)return HEIGHT_GRID;
 const B=SUMMIT_BOX,x0=B.minX-HG_PAD,z0=B.minZ-HG_PAD,nx=Math.ceil((B.maxX-B.minX+2*HG_PAD)/HG_STEP)+1,nz=Math.ceil((B.maxZ-B.minZ+2*HG_PAD)/HG_STEP)+1;
 const raw=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)raw[j*nx+i]=summitGround(x0+i*HG_STEP,z0+j*HG_STEP);
 let env=filterAxis(filterAxis(raw,nx,nz,HG_MAX,true,true),nx,nz,HG_MAX,false,true);
 for(let pass=0;pass<2;pass++)env=filterAxis(filterAxis(env,nx,nz,HG_BLUR,true,false),nx,nz,HG_BLUR,false,false);
 return HEIGHT_GRID={x0,z0,nx,nz,step:HG_STEP,raw,env};
}
function gridSample(g:SummitHeightGrid,a:Float32Array,x:number,z:number){
 const fx=(x-g.x0)/g.step,fz=(z-g.z0)/g.step;if(!(fx>=0&&fz>=0&&fx<g.nx-1&&fz<g.nz-1))return 0;
 const i=Math.floor(fx),j=Math.floor(fz),tx=fx-i,tz=fz-j,k=j*g.nx+i,k2=k+g.nx;
 return (a[k]*(1-tx)+a[k+1]*tx)*(1-tz)+(a[k2]*(1-tx)+a[k2+1]*tx)*tz;
}
/** Ground height from the 2 m grid (bilinear; within ~0.3 m of summitGround on the slopes). 0 off the grid. */
export const summitGridGround=(x:number,z:number)=>gridSample(summitHeightGrid(),summitHeightGrid().raw,x,z);
/** The smoothed flying envelope (≥ the ground within ~12 m, no ridge noise). 0 off the grid. */
export const summitEnvelope=(x:number,z:number)=>gridSample(summitHeightGrid(),summitHeightGrid().env,x,z);

/**
 * Follow-camera framing on the tower (Town's camera sits ~35 m south-east of the player and 23 m above them, at a fixed angle).
 * The camera must stay ≥ 2.5 m above the ground under it and the sight line to the player must clear the hill by ≥ 1.5 m.
 * Oct 13 2026 (after a landing on a steep slope zoomed the camera right into the player's back, at 12% of its distance): it now
 * first rises (up to CAMERA_LIFT_FREE m, at the normal distance), then dollies in along its view line but never closer than
 * CAMERA_MIN_PULL of the way, and only then rises further. Returns {pull: the fraction of the offset to keep, lift: metres to add
 * to the camera's height}; {1, 0} after four comparisons away from the island. Continuous (bisections on the 2 m grid, each
 * stage starting where the last one ended), so it changes gradually as the ground does; createSummitCameraPull eases it.
 */
export const CAMERA_MIN_PULL=.35,CAMERA_LIFT_FREE=8,CAMERA_LIFT_MAX=30;
const FRAME={pull:1,lift:0};
export function summitCameraFrame(px:number,pz:number,py:number,cx:number,cy:number,cz:number){
 FRAME.pull=1;FRAME.lift=0;
 const B=SUMMIT_BOX,m=45;if(px<B.minX-m||px>B.maxX+m||pz<B.minZ-m||pz>B.maxZ+m)return FRAME;
 const ground=summitGridGround,eye=py+1.2,clear=(f:number,lift:number)=>{const fx=px+(cx-px)*f,fz=pz+(cz-pz)*f,fy=py+(cy-py)*f+lift;if(ground(fx,fz)+2.5>fy)return false;
  for(let i=1;i<=8;i++){const u=i/9,x=px+(fx-px)*u,z=pz+(fz-pz)*u,y=eye+(fy-eye)*u;if(ground(x,z)+1.5>y)return false;}return true;};
 const bisect=(ok:(v:number)=>boolean,lo:number,hi:number)=>{for(let i=0;i<7;i++){const mid=(lo+hi)/2;if(ok(mid))hi=mid;else lo=mid;}return hi;};
 if(clear(1,0))return FRAME;
 // 1. Rise a little at the normal distance.
 if(clear(1,CAMERA_LIFT_FREE)){FRAME.lift=bisect(l=>clear(1,l),0,CAMERA_LIFT_FREE);return FRAME;}
 // 2. Dolly in (risen), never closer than CAMERA_MIN_PULL.
 FRAME.lift=CAMERA_LIFT_FREE;
 if(clear(CAMERA_MIN_PULL,CAMERA_LIFT_FREE)){let lo=CAMERA_MIN_PULL,hi=1;for(let i=0;i<7;i++){const mid=(lo+hi)/2;if(clear(mid,CAMERA_LIFT_FREE))lo=mid;else hi=mid;}FRAME.pull=lo;return FRAME;}
 // 3. At the closest, rise as far as it takes.
 FRAME.pull=CAMERA_MIN_PULL;FRAME.lift=bisect(l=>clear(CAMERA_MIN_PULL,l),CAMERA_LIFT_FREE,CAMERA_LIFT_MAX);return FRAME;
}
/** The pull-in alone (summitCameraFrame's pull). */
export function summitCameraPull(px:number,pz:number,py:number,cx:number,cy:number,cz:number){return summitCameraFrame(px,pz,py,cx,cy,cz).pull;}
/** The framing, damped: it closes in / rises at ~5/s (rock coming between) and lets out / settles at ~1.6/s, so brushing a ridge
 *  never makes the camera jump. update() returns the pull; `lift` is the eased rise (m). 1 / 0 and no work away from the island. */
export function createSummitCameraPull(){let pull=1,lift=0;
 return {get pull(){return pull;},get lift(){return lift;},reset(){pull=1;lift=0;},
  update(px:number,pz:number,py:number,cx:number,cy:number,cz:number,dt:number){
   const want=summitCameraFrame(px,pz,py,cx,cy,cz);if(want.pull===1&&want.lift===0&&pull>.9999&&lift<1e-4){pull=1;lift=0;return 1;}
   pull+=(want.pull-pull)*(1-Math.exp(-dt*(want.pull<pull?5:1.6)));if(pull>.9999)pull=1;
   lift+=(want.lift-lift)*(1-Math.exp(-dt*(want.lift>lift?5:1.6)));if(lift<1e-4)lift=0;return pull;}};
}

/**
 * Jetpack clearance over the mountain (user: "allow flying up the mountain", then "it's a little bumpy, can we have that be more
 * smooth?"). The jetpack cruises at a fixed height (Town's cruiseHeight, 28 m) that the 50 m peak would cut through, so near the
 * island the flight rises over it and settles back to the cruise height once past.
 *  - Target: the smoothed envelope (summitEnvelope, no ridge or gully noise) + FLIGHT_CLEARANCE m, here and up to ~2 s ahead along
 *    the flight direction, the look-ahead allowed FLIGHT_CLIMB_GRADE m lower per metre so the climb starts before the slope.
 *    Rising targets are taken at once; falling ones are eased (SETTLE_TAU), so after the peak the flight settles back gently.
 *  - Motion: a critically damped spring toward that target (natural frequency SPRING_W), integrated in fixed ≤ 1/120 s substeps
 *    with the target interpolated across them (the same path at 20, 30 or 60 fps), the acceleration tapered to zero as the
 *    vertical speed nears its cap (up FLIGHT_MAX_RISE, down FLIGHT_MAX_SINK m/s), so speed and acceleration both stay smooth.
 *  - Safety: never within FLIGHT_FLOOR m of the real ground (a hard floor, reached only in edge cases; `floorHits` counts them).
 * Returns the extra height above `base` to add this frame: exactly 0 and four comparisons away from the island once settled.
 */
export const FLIGHT_CLEARANCE=9,FLIGHT_FLOOR=2.5,FLIGHT_CLIMB_GRADE=.3,FLIGHT_MAX_RISE=20,FLIGHT_MAX_SINK=6.5,FLIGHT_MAX_JERK=25;
const SPRING_W=1.6,RISE_ACCEL=9,SINK_ACCEL=5,SETTLE_TAU=1.3,RISE_TAU=.3,BLEND_TAU=.25,LOOK_TURN=3.5,LOOK_TIMES=[.5,1,1.5,2,2.5,3],LIFT_RANGE=70;
export function createSummitFlightLift(){
 let y=NaN,v=0,acc=0,pre=NaN,target=NaN,prevBase=NaN,lookX=0,lookZ=0,floorHits=0;
 const settled=(base:number)=>Math.abs(y-base)<.01&&Math.abs(v)<.01&&Math.abs(target-base)<.01;
 return {get lift(){return Number.isFinite(y)&&Number.isFinite(prevBase)?y-prevBase:0;},get floorHits(){return floorHits;},get speed(){return v;},
  reset(){y=NaN;v=0;acc=0;pre=target=NaN;prevBase=NaN;lookX=lookZ=0;},
  update(x:number,z:number,vx:number,vz:number,base:number,dt:number){
   const B=SUMMIT_BOX,m=LIFT_RANGE,far=x<B.minX-m||x>B.maxX+m||z<B.minZ-m||z>B.maxZ+m;
   if(!Number.isFinite(y)||far&&settled(base)){y=base;v=0;acc=0;pre=target=base;prevBase=base;lookX=vx;lookZ=vz;if(far)return 0;}
   const rising=base>prevBase+1e-6,baseRate=dt>0&&rising?(base-prevBase)/dt:0;prevBase=base;
   if(!(dt>0))return y-base;
   let want=base;
   // The look-ahead swings round with the flight's heading over ~0.3 s (a sudden turn toward the peak eases the climb in).
   const turn=1-Math.exp(-dt*LOOK_TURN);lookX+=(vx-lookX)*turn;lookZ+=(vz-lookZ)*turn;
   if(!far){const sp=Math.hypot(lookX,lookZ),dx=sp>.5?lookX/sp:0,dz=sp>.5?lookZ/sp:0,reach=Math.min(sp,40);let need=summitEnvelope(x,z)+FLIGHT_CLEARANCE;
    if(sp>.5)for(const t of LOOK_TIMES){const d=reach*t;need=Math.max(need,summitEnvelope(x+dx*d,z+dz*d)+FLIGHT_CLEARANCE-FLIGHT_CLIMB_GRADE*d);}
    const gap=Math.max(0,8-Math.abs(need-base))/8;want=Math.max(base,need)+gap*gap*2;}// a smooth max (exact 8 m either side): the climb eases in
   // Take-off: the cruise height eases up from the ground and the flight rides on it (never below the base), keeping the
   // take-off's upward speed only as far as the mountain ahead needs it (carrying all of it sent the flight soaring).
   if(base>y&&(rising||base>y+.5)){y=base;v=Math.min(baseRate,FLIGHT_MAX_RISE,Math.max(0,(want-base)*SPRING_W));acc=0;}
   // Two easing stages (rises quickly, settles back slowly; then a short common one), so the target's own rate is smooth too.
   pre+=(want-pre)*(1-Math.exp(-dt/(want>=pre?RISE_TAU:SETTLE_TAU)));
   const from=target;target+=(pre-target)*(1-Math.exp(-dt/BLEND_TAU));
   const n=Math.max(1,Math.ceil(dt*120-1e-9)),h=dt/n,w2=SPRING_W*SPRING_W,c=2*SPRING_W;
   const goalV=(target-from)/dt;// the target's own rate: tracked too, so a steady climb has no lag behind it
   for(let k=1;k<=n;k++){const goal=from+(target-from)*k/n;let a=w2*(goal-y)+c*(goalV-v);
    a=a>0?Math.min(a,RISE_ACCEL*Math.max(0,1-v/FLIGHT_MAX_RISE)):Math.max(a,-SINK_ACCEL*Math.max(0,1+v/FLIGHT_MAX_SINK));
    acc+=Math.max(-FLIGHT_MAX_JERK*h,Math.min(FLIGHT_MAX_JERK*h,a-acc));v+=acc*h;y+=v*h;}// and the push itself ramps (jerk cap)
   // Never climbing once 12 m above what is asked for: a guard, so nothing can carry the flight away upward.
   if(y>Math.max(base,want,target)+12&&v>0){v=0;if(acc>0)acc=0;}
   const floor=summitGround(x,z)+FLIGHT_FLOOR;if(y<floor){y=floor;if(v<0)v=0;if(acc<0)acc=0;floorHits++;}
   return y-base;}};
}
/** Solid rock for anything moving at height `y` (the walking ball, a parachute drifting sideways): true where the mountain's
 *  surface stands above it, so it bounces off or is held back instead of popping up onto the slope. */
export function summitSolid(x:number,z:number,y:number){return x>=SUMMIT_BOX.minX&&x<=SUMMIT_BOX.maxX&&z>=SUMMIT_BOX.minZ&&z<=SUMMIT_BOX.maxZ&&summitGround(x,z)>y+.25;}
