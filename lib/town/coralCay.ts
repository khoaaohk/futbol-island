// Coral Cay (Sep 29 2026; revision 2 the same day): a tropical island east of the Community Hall, reached by a winding,
// beach-lined causeway that continues the Club Grounds street (z -159) out to sea and bends past two sandbar stops.
// Pure data and point tests only (no three.js): movement (simulation.blocked), flight (flightBlocked), landing searches,
// the 3D build (coralCayWorld.ts), the traced flight outline (flightOutline.ts) and both maps read these same shapes.
export type CayPoint={x:number;z:number};

/** Catmull-Rom spline through anchors (closed ring or open path), `seg` samples per span — as shoreline.ts does. */
function spline(anchors:number[][],closed:boolean,seg:number):CayPoint[]{
 const out:CayPoint[]=[],n=anchors.length,spans=closed?n:n-1,get=(k:number)=>anchors[closed?(k+n)%n:Math.max(0,Math.min(n-1,k))];
 for(let i=0;i<spans;i++)for(let j=0;j<seg;j++){
  const t=j/seg,p0=get(i-1),p1=get(i),p2=get(i+1),p3=get(i+2);
  const at=(k:number)=>.5*(2*p1[k]+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
  out.push({x:at(0),z:at(1)});
 }
 if(!closed)out.push({x:anchors[n-1][0],z:anchors[n-1][1]});
 return out;
}
function insidePolygon(poly:CayPoint[],x:number,z:number){
 let inside=false;
 for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}
 return inside;
}
const box=(pts:CayPoint[],pad=0)=>({minX:Math.min(...pts.map(p=>p.x))-pad,maxX:Math.max(...pts.map(p=>p.x))+pad,minZ:Math.min(...pts.map(p=>p.z))-pad,maxZ:Math.max(...pts.map(p=>p.z))+pad});
const inBox=(b:{minX:number;maxX:number;minZ:number;maxZ:number},x:number,z:number)=>x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ;
function segmentDistance(x:number,z:number,a:CayPoint,b:CayPoint){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
const ringDistance=(ring:CayPoint[],x:number,z:number)=>{let best=Infinity;for(let i=0;i<ring.length;i++)best=Math.min(best,segmentDistance(x,z,ring[i],ring[(i+1)%ring.length]));return best;};
/** Deterministic variation (no Math.random: the island must look the same on every load). */
export const cayJitter=(i:number,k=1)=>{const s=Math.sin(i*12.9898+k*78.233)*43758.5453;return s-Math.floor(s);};

// ---------------------------------------------------------------------------------------------------------------
// The cay: an irregular, star-shaped outline (headlands, a north-east bay, a south cove, a south-east spit).
export const CAY_CENTER={x:612,z:-160};
export const CAY_NAME='Coral Cay';
/** Anchors relative to CAY_CENTER, scaled by 0.955: area ≈ 34,950 m² = 25.0% of the main island. */
const CAY_ANCHORS=[[-107,-8],[-104,-30],[-118,-55],[-108,-72],[-86,-80],[-62,-104],[-30,-110],[-5,-96],[22,-112],[52,-104],[66,-86],[56,-64],[80,-48],[106,-40],[124,-12],[112,14],[96,40],[110,70],[88,86],[60,80],[38,104],[4,98],[-26,110],[-58,92],[-74,64],[-100,52],[-96,28],[-110,10]];
export const CAY_SHORE:CayPoint[]=spline(CAY_ANCHORS.map(([x,z])=>[CAY_CENTER.x+x*.955,CAY_CENTER.z+z*.955]),true,8);
const shoreBox=box(CAY_SHORE);
export const CAY_BOX=shoreBox;
export const onCay=(x:number,z:number)=>inBox(shoreBox,x,z)&&insidePolygon(CAY_SHORE,x,z);
/** Beach all the way round with an uneven width: each shore point moves toward the centre by 12–20% of its radius
 *  (like the main island's INTERIOR_GRASS scaling), so headlands get wide beaches and coves narrow ones, and the
 *  star-shaped lawn can never fold over itself. */
export const CAY_SAND=CAY_SHORE.map((p,i)=>{const k=.84-.05*Math.sin(i*.29)-.025*Math.sin(i*.83+1);return {outer:p,inner:{x:CAY_CENTER.x+(p.x-CAY_CENTER.x)*k,z:CAY_CENTER.z+(p.z-CAY_CENTER.z)*k}};});
export const CAY_LAWN=CAY_SAND.map(s=>s.inner);
export const distanceToCayShore=(x:number,z:number)=>ringDistance(CAY_SHORE,x,z);

// ---------------------------------------------------------------------------------------------------------------
// The causeway: one centre line from the Community Hall junction to the end of the cay boulevard. It runs straight
// through the seawall gap, then bends north past Starfish Sandbar, south past Turtle Sandbar, and settles onto z -159
// on the cay. Both bend apexes have horizontal tangents (symmetric neighbours), so each spur leaves square to the road.
const ROAD_ANCHORS=[[200,-159],[250,-159],[282,-166],[312,-184],[342,-194],[372,-184],[398,-160],[424,-136],[454,-126],[484,-136],[506,-153],[530,-159],[560,-159],[578,-159]];
export type PathSample={x:number;z:number;s:number;tx:number;tz:number};
/** Centre line resampled every ~2 m of arc, with arc length s and unit tangent. x increases monotonically. */
export const CAUSEWAY_PATH:PathSample[]=(()=>{
 const raw=spline(ROAD_ANCHORS,false,48),arc=[0];for(let i=1;i<raw.length;i++)arc.push(arc[i-1]+Math.hypot(raw[i].x-raw[i-1].x,raw[i].z-raw[i-1].z));
 const total=arc[arc.length-1],count=Math.ceil(total/2),out:PathSample[]=[];let j=1;
 for(let k=0;k<=count;k++){const s=total*k/count;while(j<raw.length-1&&arc[j]<s)j++;const a=raw[j-1],b=raw[j],t=(s-arc[j-1])/(arc[j]-arc[j-1]||1);out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,s,tx:0,tz:0});}
 for(let k=0;k<out.length;k++){const a=out[Math.max(0,k-1)],b=out[Math.min(out.length-1,k+1)],l=Math.hypot(b.x-a.x,b.z-a.z)||1;out[k].tx=(b.x-a.x)/l;out[k].tz=(b.z-a.z)/l;}
 return out;
})();
export const CAUSEWAY_LENGTH=CAUSEWAY_PATH[CAUSEWAY_PATH.length-1].s;
/** Main-island coast at z -159 (shoreline.ts); the seawall gap in eastCoast.ts is cut at CAUSEWAY.z ± deckHalf. */
export const MAIN_SHORE_X=237.5;
const waterEnd=(()=>{const p=CAUSEWAY_PATH.find(p=>p.x>MAIN_SHORE_X+20&&onCay(p.x,p.z));return p??CAUSEWAY_PATH[CAUSEWAY_PATH.length-1];})();
const waterStart=CAUSEWAY_PATH.find(p=>p.x>=MAIN_SHORE_X)!;
/** z: the street it continues. x0/x1: walkable deck start and the cay landfall. Walkable deck ±5.4 m; rails at ±6.2 m;
 *  deck/skirt ±7 m. waterSpan: arc length over the sea (main coast to cay landfall). */
export const CAUSEWAY={z:-159,x0:228,x1:waterEnd.x,walkHalf:5.4,railHalf:6.2,deckHalf:7,roadStart:200,sWater0:waterStart.s,sWater1:waterEnd.s,waterSpan:waterEnd.s-waterStart.s} as const;
export const causewayAt=(s:number)=>{const i=Math.max(0,Math.min(CAUSEWAY_PATH.length-1,Math.round(s/CAUSEWAY_LENGTH*(CAUSEWAY_PATH.length-1))));return CAUSEWAY_PATH[i];};

/** Nearest point on the centre line: arc position s, signed offset d (+ = right of travel, i.e. south at the start)
 *  and unsigned distance. Walking queries search a ±30-sample window around a binary search on x (x is monotonic);
 *  `exhaustive` scans every segment (flight corridor queries far from the line). */
export function causewayFrame(x:number,z:number,exhaustive=false){
 const P=CAUSEWAY_PATH;let lo=0,hi=P.length-1;
 if(!exhaustive){while(hi-lo>1){const mid=(lo+hi)>>1;if(P[mid].x<x)lo=mid;else hi=mid;}}
 const from=exhaustive?0:Math.max(0,lo-30),to=exhaustive?P.length-2:Math.min(P.length-2,lo+30);
 let best=Infinity,bs=0,bd=0;
 for(let i=from;i<=to;i++){
  const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,len2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/len2));
  const px=a.x+dx*t,pz=a.z+dz*t,dist=Math.hypot(x-px,z-pz);
  if(dist<best){best=dist;bs=a.s+(b.s-a.s)*t;const l=Math.sqrt(len2);bd=((x-px)*(-dz)+(z-pz)*dx)/l;}
 }
 // (-dz, dx) points to the right of travel (east→ south). Sign of the cross product gives the side.
 return {s:bs,d:bd,dist:best};
}
/** Side +1 = right of travel (south of the road at the start), -1 = left (north). */
export type RoadSide=-1|1;

// ---------------------------------------------------------------------------------------------------------------
// Sandbar stops at the two bend apexes, each reached by a short boardwalk spur through a gap in the rail.
export type Sandbar={id:string;name:string;x:number;z:number;side:RoadSide;outline:CayPoint[];walk:CayPoint[];radius:number;spur:{x:number;z0:number;z1:number;half:number;s:number;roadZ:number}};
function sandbar(id:string,name:string,apex:{x:number;z:number},side:RoadSide,radii:number[][]):Sandbar{
 // side -1 = north of the apex (Starfish), +1 = south (Turtle). The spur runs square to the road for 10 m.
 const edge=apex.z+side*7,shoreZ=edge+side*10,cz=shoreZ+side*11.5,cx=apex.x;
 const outline=spline(radii.map(([a,r])=>[cx+Math.cos(a)*r*1.35,cz+Math.sin(a)*r]),true,6);
 // Walkable: the sand pulled 8% toward its centre, so feet stay off the waterline (star-shaped, like the cay lawn).
 const walk=outline.map(p=>({x:cx+(p.x-cx)*.92,z:cz+(p.z-cz)*.92}));
 const s=causewayFrame(apex.x,apex.z).s;
 return {id,name,x:cx,z:cz,side,outline,walk,radius:Math.max(...outline.map(p=>Math.hypot(p.x-cx,p.z-cz))),
  spur:{x:cx,z0:Math.min(apex.z+side*4.5,shoreZ+side*4),z1:Math.max(apex.z+side*4.5,shoreZ+side*4),half:1.8,s,roadZ:apex.z}};
}
/** Polar anchors [angle, radius]: irregular sandbars with a hooked spit, a notch and a flattened landing side. */
export const SANDBARS:Sandbar[]=[
 sandbar('starfish','Starfish Sandbar',{x:342,z:-194},-1,[[0,11],[.6,9],[1.1,12],[1.6,10],[2.1,12.5],[2.7,15],[3.1,13],[3.5,8],[3.9,8.5],[4.4,11],[4.75,11.5],[5.1,11],[5.6,7.5],[5.95,10]]),
 sandbar('turtle','Turtle Sandbar',{x:454,z:-126},1,[[0,14],[.45,10],[.95,11],[1.45,11.5],[1.8,11],[2.2,9],[2.7,12],[3.15,15.5],[3.5,11],[4.0,8],[4.55,12],[5.0,9.5],[5.5,10],[5.9,13]]),
];
const sandbarBoxes=SANDBARS.map(s=>box(s.outline));
export function onSandbarStop(x:number,z:number){
 for(let i=0;i<SANDBARS.length;i++){const s=SANDBARS[i];
  if(Math.abs(x-s.spur.x)<=s.spur.half&&z>=s.spur.z0&&z<=s.spur.z1)return true;
  if(inBox(sandbarBoxes[i],x,z)&&insidePolygon(s.walk,x,z))return true;
 }
 return false;
}

// ---------------------------------------------------------------------------------------------------------------
// Beach shoulders: sand banks outside the deck on either side, in irregular stretches (continuous function of arc
// length, so the sand edge never jumps). Zero near the main coast, near each spur (the rail stays there) and on the cay.
const shoulderRaw=(s:number,side:RoadSide)=>4.2+4.4*Math.sin(s/29+(side>0?1.9:.4))+2.6*Math.sin(s/10.7+(side>0?2.6:1.1))+.35*Math.sin(s/3.3+side);
const smoothstep=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Sand-bank width: a continuous function of arc length, so banks taper in and out to a point (never a square end).
 *  Faded to nothing near the main coast (the seawall gate) and each spur (the rail stays there). At the cay landfall
 *  (Sep 29 2026 seam fix) the bank instead widens into a landfall beach that runs on under the cay's own beach, so the
 *  causeway's sand meets the cay's sand in one continuous surface (no rail stub, no stone step, no seam). */
export function shoulderWidth(s:number,side:RoadSide){
 const W1=CAUSEWAY.sWater1,onto=smoothstep(W1+10,W1+4,s);
 let fade=smoothstep(CAUSEWAY.sWater0+8,CAUSEWAY.sWater0+24,s)*onto;
 for(const b of SANDBARS)if(b.side===side)fade*=smoothstep(7,19,Math.abs(s-b.spur.s));
 const landfall=6*smoothstep(W1-27,W1-4,s)*onto;
 const w=Math.max(Math.min(10.5,Math.max(0,shoulderRaw(s,side)))*fade,landfall);return w<.05?0:w;
}
/** Half-width of walkable ground on one side at arc s: the deck, blending smoothly into the deck plus its sand bank. */
const walkHalfAt=(s:number,side:RoadSide)=>{const w=shoulderWidth(s,side);return CAUSEWAY.walkHalf+Math.max(0,CAUSEWAY.deckHalf+w-.8-CAUSEWAY.walkHalf)*Math.min(1,w/.8);};
const causewayBox=box(CAUSEWAY_PATH,CAUSEWAY.deckHalf+11);
export function onCauseway(x:number,z:number){
 if(x<CAUSEWAY.x0||!inBox(causewayBox,x,z))return false;
 const f=causewayFrame(x,z);if(f.s<=0&&x<CAUSEWAY.roadStart)return false;
 return f.dist<=walkHalfAt(f.s,f.d>=0?1:-1);
}
/** Everything walkable that is not the main island: causeway and its beaches, sandbar stops, and the cay itself. */
export function onCayLand(x:number,z:number){
 if(x<CAUSEWAY.x0)return false; // Cheap reject for every main-island point west of the beach.
 return onCauseway(x,z)||onSandbarStop(x,z)||onCay(x,z);
}
const rectDistance=(x:number,z:number,x0:number,x1:number,z0:number,z1:number)=>Math.hypot(Math.max(x0-x,0,x-x1),Math.max(z0-z,0,z-z1));
/** Distance to the nearest walkable cay ground (0 on it); lets landing searches skip open water like distanceToShore. */
export function distanceToCayLand(x:number,z:number){
 if(onCayLand(x,z))return 0;
 const f=causewayFrame(x,z,true);let best=Math.max(0,f.dist-walkHalfAt(f.s,f.d>=0?1:-1));
 for(const s of SANDBARS)best=Math.min(best,rectDistance(x,z,s.spur.x-s.spur.half,s.spur.x+s.spur.half,s.spur.z0,s.spur.z1),Math.max(0,ringDistance(s.walk,x,z)));
 if(best<1)return best;
 return Math.min(best,distanceToCayShore(x,z));
}

// ---------------------------------------------------------------------------------------------------------------
// Flight: the jetpack may leave the main island's 35 m water margin only along the causeway corridor — 36 m either
// side of the centre line, widening into funnels near both coasts — plus a halo round each sandbar and the same 35 m
// margin round the cay. flightOutline.ts traces the maps' boundary from this exact test.
export const CAY_FLIGHT_MARGIN=50; // Matches the main island's FLIGHT_WATER_MARGIN (simulation.ts).
/** The corridor is a broad band around the route, not a tube that follows each bend. North edge: the road's northmost
 *  position within ±40 m, 40 m beyond it, widened into funnels near both coasts and smoothed with a ±30 m moving average.
 *  South edge: CORRIDOR_SOUTH (a near-straight line with a rounded corner). No arches or V shapes on either side. */
export const CORRIDOR={x0:215,x1:545,north:40,window:40,smooth:30,funnel:.85,funnelMax:45} as const;
/** South edge (user's red line, Sep 29 2026): one broad block of water south of the causeway, a near-straight edge at
 *  z -55 that bends south with a generous rounded corner into the main island's east margin (no wiggles). */
export const CORRIDOR_SOUTH={z:-55,cornerX:345,k:.02} as const;
const southEdgeAt=(x:number)=>CORRIDOR_SOUTH.z+Math.max(0,CORRIDOR_SOUTH.cornerX-x)**2*CORRIDOR_SOUTH.k;
const roadZAt=(x:number)=>{const P=CAUSEWAY_PATH;if(x<=P[0].x)return P[0].z;if(x>=P[P.length-1].x)return P[P.length-1].z;let lo=0,hi=P.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(P[mid].x<x)lo=mid;else hi=mid;}const t=(x-P[lo].x)/(P[hi].x-P[lo].x);return P[lo].z+(P[hi].z-P[lo].z)*t;};
const CORRIDOR_EDGES=(()=>{
 const n=CORRIDOR.x1-CORRIDOR.x0+1,road=Array.from({length:n+2*CORRIDOR.window},(_,i)=>roadZAt(CORRIDOR.x0-CORRIDOR.window+i));
 const raw=Array.from({length:n},(_,i)=>{const x=CORRIDOR.x0+i,win=road.slice(i,i+2*CORRIDOR.window+1),extra=Math.min(CORRIDOR.funnelMax,CORRIDOR.funnel*(Math.max(0,285-x)+Math.max(0,x-470)));
  return {north:Math.min(...win)-CORRIDOR.north-extra};});
 return raw.map((_,i)=>{let north=0,count=0;for(let k=Math.max(0,i-CORRIDOR.smooth);k<=Math.min(n-1,i+CORRIDOR.smooth);k++){north+=raw[k].north;count++;}return {north:north/count,south:southEdgeAt(CORRIDOR.x0+i)};});
})();
/** North (smaller z) and south edge of the flight corridor at x (linear between 1 m samples); null outside it. */
export function corridorEdges(x:number){
 if(x<CORRIDOR.x0||x>CORRIDOR.x1)return null;const f=x-CORRIDOR.x0,i=Math.min(CORRIDOR_EDGES.length-2,Math.floor(f)),t=f-i,a=CORRIDOR_EDGES[i],b=CORRIDOR_EDGES[i+1];
 return {north:a.north+(b.north-a.north)*t,south:a.south+(b.south-a.south)*t};
}
export const sandbarFlightRadius=(s:Sandbar)=>s.radius+38;
/** South-east extension (user's red line, Sep 29 2026): open sea south of the cay. Its west edge follows the red line
 *  (711,-41) → (652,3) → (659,91); a generous rounded bottom and east side close it back into the cay's margin. */
export const CAY_SE_EXTENSION:CayPoint[]=spline([[711,-43],[680,-24],[652,3],[653,48],[659,91],[682,113],[728,122],[775,112],[806,82],[818,35],[815,-10],[800,-44],[760,-50]],true,6);
const seBox=box(CAY_SE_EXTENSION);
/** South-east sea (user's second red line, Sep 29 2026): fills all the open water between the main island's east margin,
 *  the south block and the cay's south-east lobe. Its south-east edge follows the red diagonal drawn on the travel map,
 *  (855,111) → (712,152) → (597,270), and a smooth curve west closes it into the main island's south-east margin. The
 *  north and west vertices sit inside the neighbouring flyable pieces (south block, cay margin, main margin) so the union
 *  is one region with no notches or fingers. */
export const SOUTH_EAST_SEA:CayPoint[]=spline([[280,-50],[300,-58],[360,-63],[450,-63],[520,-60],[565,-40],[640,-25],[700,-10],[790,-2],[842,28],[862,72],[855,111],[790,133],[712,152],[650,207],[597,270],[520,293],[420,299],[330,291],[270,283],[205,275],[232,240],[268,190],[281,100]],true,6);
const seaBox=box(SOUTH_EAST_SEA);
// minX includes both sea outlines (the south-east sea reaches x 205; code review finding 15).
export const CAY_FLIGHT_BOUNDS={minX:Math.floor(Math.min(CORRIDOR.x0,shoreBox.minX-CAY_FLIGHT_MARGIN,seBox.minX,seaBox.minX)),maxX:Math.ceil(Math.max(shoreBox.maxX+CAY_FLIGHT_MARGIN,seBox.maxX,seaBox.maxX)),minZ:Math.floor(Math.min(...CORRIDOR_EDGES.map(e=>e.north),shoreBox.minZ-CAY_FLIGHT_MARGIN,...SANDBARS.map(s=>s.z-sandbarFlightRadius(s)))),maxZ:Math.ceil(Math.max(...CORRIDOR_EDGES.map(e=>e.south),shoreBox.maxZ+CAY_FLIGHT_MARGIN,...SANDBARS.map(s=>s.z+sandbarFlightRadius(s)),seBox.maxZ,seaBox.maxZ))};
const cayMarginBox={minX:shoreBox.minX-CAY_FLIGHT_MARGIN,maxX:shoreBox.maxX+CAY_FLIGHT_MARGIN,minZ:shoreBox.minZ-CAY_FLIGHT_MARGIN,maxZ:shoreBox.maxZ+CAY_FLIGHT_MARGIN};
export function inCayFlightZone(x:number,z:number){
 if(!inBox(CAY_FLIGHT_BOUNDS,x,z))return false;
 const band=corridorEdges(x);if(band&&z>=band.north&&z<=band.south)return true;
 // Sandbar halos never poke past the band's straight south edge (the user's red line stays straight).
 for(const s of SANDBARS)if(Math.hypot(x-s.x,z-s.z)<=sandbarFlightRadius(s)&&z<=southEdgeAt(x))return true;
 if(inBox(seBox,x,z)&&insidePolygon(CAY_SE_EXTENSION,x,z))return true;
 if(inBox(seaBox,x,z)&&insidePolygon(SOUTH_EAST_SEA,x,z))return true;
 if(!inBox(cayMarginBox,x,z))return false;
 return onCay(x,z)||distanceToCayShore(x,z)<=CAY_FLIGHT_MARGIN;
}

// ---------------------------------------------------------------------------------------------------------------
/** Village layout shared by the 3D build and the maps. Houses face south (+z) onto the boulevard, like the main island's. */
export const CAY_BOULEVARD={x0:CAUSEWAY.x1,x1:578,z:CAUSEWAY.z,half:6} as const;
export const CAY_PLAZA={x:591,z:-159,w:26,d:30} as const;
/** FIFA Beach Soccer Laws (2024-25) Law 1: pitch 35–37 m × 26–28 m; goals 5.5 m × 2.2 m. Long axis runs east–west.
 *  Sep 29 2026: moved east (was x 638, z -159) onto the east beach, joined to it by COURT_BEACH (user request). */
export const BEACH_COURT={x:680,z:-161,length:36,width:27,goalWidth:5.5,goalHeight:2.2,penalty:9} as const;
export const CAY_HOUSES:[number,number,number,number,number,string][]=[
 [543,-176,14,11,5.5,'COCONUT CAFÉ'],[562,-176,14,11,6,'SURF SHOP'],[580,-181,13,12,8,'CAY GUESTHOUSE'],
];
/** Sand joining the court to the east beach: one organic outline (a rounded, wobbly blob round the court, its stands
 *  and boards) that runs east into the beach ring, pulled back 4 m from the waterline. Built as one flat sand mesh in the
 *  cay's batch (coralCayWorld.ts) and drawn on both maps. */
/** Court scoreboard wall (Sep 29 2026, replaces the Beach Soccer Club building, removed at the user's request): a sturdy
 *  freestanding wall behind the info boards on the court's north side, its face (front, +z) toward the pitch. Same shape
 *  as a CAY_HOUSES record read by coralCayBalls.ts: x, z centre; w, d footprint; h height; roof top; front face z. */
export const COURT_SCOREBOARD=(()=>{const w=8,d=.8,h=6,x=BEACH_COURT.x,z=BEACH_COURT.z-BEACH_COURT.width/2-15.5;return {x,z,w,d,h,roof:h+.23,front:z+d/2};})();
export const COURT_BEACH:CayPoint[]=(()=>{const cx=BEACH_COURT.x+6,cz=BEACH_COURT.z+.5,a=38,bN=36,bS=28,n=72,out:CayPoint[]=[];
 for(let i=0;i<n;i++){const t=i/n*Math.PI*2,c=Math.cos(t),sn=Math.sin(t);
  // Superellipse (rounded rectangle) with a soft two-frequency wobble, like the coast.
  const r=1+.05*Math.sin(t*5+1.3)+.03*Math.sin(t*11+.4);let x=cx+a*r*Math.sign(c)*Math.abs(c)**.55,z=cz+(sn<0?bN:bS)*r*Math.sign(sn)*Math.abs(sn)**.55;
  for(let k=0;k<60&&!(onCay(x,z)&&ringDistance(CAY_SHORE,x,z)>=4);k++){x+=(cx-x)*.04;z+=(cz-z)*.04;}
  out.push({x,z});}
 return out;})();
export const onCourtBeach=(x:number,z:number)=>insidePolygon(COURT_BEACH,x,z);
/** Round thatched huts (obstacles only: their cone roofs are not landing roofs). */
export const CAY_HUTS:CayPoint[]=[{x:531,z:-139},{x:550,z:-134},{x:569,z:-139},{x:626,z:-222},{x:651,z:-190}];
export const CAY_HUT_RADIUS=2.7;
/** Travel-map arrival: the plaza, facing the court. */
export const CORAL_CAY_ARRIVAL={x:588,z:-153};

/** A point `d` metres right of travel (negative = left) from a centre-line sample. */
export const offsetPoint=(p:PathSample,d:number):CayPoint=>({x:p.x-p.tz*d,z:p.z+p.tx*d});
/** Contiguous runs of centre-line sample indices where `keep` holds (for rails, beaches and their map shapes). */
export function causewayRuns(keep:(p:PathSample)=>boolean){const runs:[number,number][]=[];let start=-1;
 CAUSEWAY_PATH.forEach((p,i)=>{if(keep(p)){if(start<0)start=i;}else if(start>=0){runs.push([start,i-1]);start=-1;}});
 if(start>=0)runs.push([start,CAUSEWAY_PATH.length-1]);return runs.filter(([a,b])=>b>a);}
/** Beach-shoulder outlines (deck edge to sand edge) for the maps; the 3D build uses the same widths. */
export const CAUSEWAY_BEACHES:CayPoint[][]=([-1,1] as RoadSide[]).flatMap(side=>causewayRuns(p=>shoulderWidth(p.s,side)>0).map(([a,b])=>{
 const run=CAUSEWAY_PATH.slice(a,b+1);return [...run.map(p=>offsetPoint(p,side*CAUSEWAY.deckHalf)),...run.slice().reverse().map(p=>offsetPoint(p,side*(CAUSEWAY.deckHalf+shoulderWidth(p.s,side))))];}));

/** Where each side of the causeway meets the sea: the stone skirt's waterline, or the foot of the sand bank's slope. */
export const causewayWaterline=(s:number,side:RoadSide)=>{const w=shoulderWidth(s,side);return Math.max(CAUSEWAY.deckHalf+2.05,CAUSEWAY.deckHalf+w+2.4*Math.min(1,w/1.5)*.9);};

// ---------------------------------------------------------------------------------------------------------------
// Sharks Beach: the cay's north-east bay, the nearest shore to the beach-soccer court. The friendly sharks themselves
// patrol only along the causeway, on both sides (user request): caySharks.ts animates them only when near and on screen.
const cayAngle=(p:CayPoint)=>Math.atan2(p.z-CAY_CENTER.z,p.x-CAY_CENTER.x);
/** Shore points of Sharks Beach (bearing -64°…-18° from the cay centre, i.e. north-east). */
export const SHARKS_BEACH_SHORE=CAY_SHORE.filter(p=>{const a=cayAngle(p)*180/Math.PI;return a>-64&&a<-18;}).sort((a,b)=>cayAngle(a)-cayAngle(b));
export const SHARKS_BEACH=(()=>{const mid=SHARKS_BEACH_SHORE[SHARKS_BEACH_SHORE.length>>1],d=cayAngle(mid);return {name:'Sharks Beach',x:mid.x-Math.cos(d)*12,z:mid.z-Math.sin(d)*12,shoreX:mid.x,shoreZ:mid.z};})();
/** Closed patrol loops (world x/z). Out along one offset, back along a wider one: a long lazy S-loop. */
export type SharkLoop={id:string;region:'causeway';points:CayPoint[];speed:number};
function causewayLoop(id:string,side:RoadSide,s0:number,s1:number,gap:number,speed:number):SharkLoop{
 const run=CAUSEWAY_PATH.filter(p=>p.s>=s0&&p.s<=s1);
 // Clear of the widest waterline within ±16 m, so the loop never grazes a bank.
 const clear=(p:PathSample)=>Math.max(...CAUSEWAY_PATH.filter(q=>Math.abs(q.s-p.s)<=16).map(q=>causewayWaterline(q.s,side)));
 const out=run.map((p,i)=>offsetPoint(p,side*(clear(p)+gap+1.6*Math.sin(i*.35)))),back=run.slice().reverse().map((p,i)=>offsetPoint(p,side*(clear(p)+gap+7+1.8*Math.sin(i*.28+1))));
 return {id,region:'causeway',points:[...out,...back],speed};
}
export const SHARK_LOOPS:SharkLoop[]=[
 causewayLoop('north-a',-1,60,118,9,1.6),causewayLoop('north-b',-1,190,300,11,1.4),causewayLoop('north-c',-1,62,112,22,1.3),
 causewayLoop('south-a',1,62,160,10,1.5),causewayLoop('south-b',1,186,250,9,1.7),causewayLoop('south-c',1,196,255,22,1.25),
];

// ---------------------------------------------------------------------------------------------------------------
// Coral Cay Farm (Sep 29 2026): the open lawn south of the court. Fuel for football — crops, tropical fruit and water.
// Shared by the 3D build (coralCayWorld.ts), the maps and tests/coral-cay.cjs (path, beach and NPC access).
export const FARM={
 name:'Coral Cay Farm',
 /** Fence corners (closed loop). The west side faces the plaza's south path (x 591); the south side faces the beach. */
 fence:[{x:597,z:-129},{x:689,z:-129},{x:689,z:-101},{x:646,z:-101},{x:643,z:-89},{x:597,z:-89}] as CayPoint[],
 /** Gate openings: [segment index, from, to] along that segment's main axis. */
 gates:[{segment:5,from:-114.5,to:-108.5},{segment:4,from:626,to:634},{segment:1,from:-114.5,to:-108.5}] as {segment:number;from:number;to:number}[],
 /** Dirt track from the tan path's east edge (x 592.5: a clean T, no overlap) through the west gate across the farm, and a branch south to the beach gate. */
 track:{x0:592.5,x1:688,z:-111.5,w:2.6},beachTrack:{x:630,z0:-110.2,z1:-86,w:2.6},
 barn:{x:608,z:-121.5,w:11,d:8,h:4.2},stand:{x:611,z:-101.5,w:4.2,d:1.6},windmill:{x:602.5,z:-95},tank:{x:607,z:-94},
 crops:{x0:620,x1:642},orchard:{x0:651,x1:686,z0:-127,z1:-115},pineapples:{x0:650,x1:667,z0:-108.5,z1:-103},melons:{x0:671,x1:686,z0:-108.5,z1:-103},
 scarecrow:{x:631,z:-104},
} as const;
/** Fence as axis-aligned collision boxes, with gate gaps (the one slanted piece is split into short boxes). */
export const FARM_FENCE_OBSTACLES=(()=>{const out:{x:number;z:number;w:number;d:number}[]=[],f=FARM.fence;
 for(let i=0;i<f.length;i++){const a=f[i],b=f[(i+1)%f.length],gates=FARM.gates.filter(g=>g.segment===i);
  if(a.x!==b.x&&a.z!==b.z){const len=Math.hypot(b.x-a.x,b.z-a.z),n=Math.ceil(len/.6);for(let k=0;k<n;k++){const t=(k+.5)/n;out.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,w:.7,d:.7});}continue;}
  const horizontal=a.z===b.z,lo=horizontal?Math.min(a.x,b.x):Math.min(a.z,b.z),hi=horizontal?Math.max(a.x,b.x):Math.max(a.z,b.z);
  const cuts=[lo,...gates.flatMap(g=>[g.from,g.to]),hi].sort((p,q)=>p-q);
  for(let k=0;k<cuts.length;k+=2){const s0=cuts[k],s1=cuts[k+1];if(s1-s0<.05)continue;out.push(horizontal?{x:(s0+s1)/2,z:a.z,w:s1-s0,d:.2}:{x:a.x,z:(s0+s1)/2,w:.2,d:s1-s0});}}
 return out;})();

// ---------------------------------------------------------------------------------------------------------------
// Hostel neighbourhood (Sep 29 2026): the lawn south of the huts, west of the plaza's south path. Visiting youth teams
// stay at the hostel for beach-soccer tournaments; a few islander homes make it a little neighbourhood.
export const HOSTEL={name:'Coral Cay Hostel',x:556,z:-120,w:18,d:11,h:7.5,verandah:{z:-112.2,d:3.4}} as const;
export type CayHome={x:number;z:number;style:'stilt'|'bungalow'|'hut';color:string;roof:string};
/** Six homes (a seventh, stilted cottage in front of the hostel verandah was removed at the user's request). */
export const CAY_HOMES:CayHome[]=[
 {x:566,z:-105,style:'bungalow',color:'#b9d7c9',roof:'#bd7657'},{x:579,z:-106,style:'stilt',color:'#f0c9b0',roof:'#477c6a'},
 {x:562,z:-94,style:'bungalow',color:'#f4d98f',roof:'#589aa0'},{x:575,z:-93.5,style:'hut',color:'#d6b58a',roof:'#d7ad62'},{x:580,z:-124.5,style:'bungalow',color:'#e9b8c4',roof:'#678f8d'},
 {x:585,z:-88.5,style:'hut',color:'#e2c69a',roof:'#d69b61'},
];
/** Footpaths [x, z, w, d]: from the plaza's south path west along the hostel verandah, and lanes between the homes. */
export const HOSTEL_PATHS:[number,number,number,number][]=[[571.75,-113.3,35.5,2.4],[572,-99.5,35,2.2],[571.5,-106,2.2,13]];
/** The yard with the kids' mini goal (in front of the south-east bungalow). */
export const MINI_GOAL={x:566.5,z:-88.5};
export const inHostelArea=(x:number,z:number)=>x>536&&x<589.5&&z>-131&&z<-84;

// ---------------------------------------------------------------------------------------------------------------
// Roundabout (Sep 29 2026): where the causeway reaches Coral Cay. One-way, anticlockwise as seen on the map (traffic
// keeps right; the circulating lane is on the outside of the node circle). Arms: west = causeway, east = boulevard.
export const ROUNDABOUT={x:524,z:-159,nodeRadius:8.5,island:6.6,roadInner:7,roadOuter:13,walkOuter:14.6,nodes:12} as const;
/** The welcome arch stands just east of the roundabout, where the boulevard starts. */
/** pierOffset: each pier's centre is this far either side of the road's centre line (z ± pierOffset), on the pavement
 *  between the 4 m kerb and the 7 m deck edge; pierWidth: the square piers' side (m). */
export const WELCOME_ARCH={x:541,z:CAUSEWAY.z,pierOffset:5.9,pierWidth:1.1} as const;
/** Coral Cay Konbini (a second store, like Island Square's): north of the roundabout, its glass front facing south onto it. */
export const CAY_KONBINI={x:524,z:-182.5,w:10,d:9,front:-178} as const;
/** Centre of the Konbini's sliding doors on its glass front (for the walk-in interior's entrance). yaw 0 = the doors
 *  face +z (south, onto the roundabout); a player walking in heads -z. Keep 2.2 m either side and 3 m in front clear. */
export const CAY_KONBINI_DOOR={x:CAY_KONBINI.x-.55,z:CAY_KONBINI.front,yaw:0,width:1.84} as const;

// ---------------------------------------------------------------------------------------------------------------
// STABLE PUBLIC HELPERS (Sep 29 2026) for other features that place things on Coral Cay (e.g. ball-hunt balls).
// Names and meanings are kept stable; coordinates follow any future reshaping automatically.
/** Point on the causeway centre line at t ∈ [0,1] (0 = Community Hall junction, 1 = end of the cay boulevard), with the
 *  unit direction of travel, the arc position s (m), the deck's walkable half-width and the extra beach bank width on
 *  each side (0 where there is a rail). `overWater` is true between the main coast and the cay landfall. */
export function causewayPoint(t:number){
 const s=Math.max(0,Math.min(1,t))*CAUSEWAY_LENGTH,p=causewayAt(s);
 return {x:p.x,z:p.z,s:p.s,dirX:p.tx,dirZ:p.tz,deckHalf:CAUSEWAY.walkHalf,bankLeft:shoulderWidth(p.s,-1),bankRight:shoulderWidth(p.s,1),overWater:p.s>=CAUSEWAY.sWater0&&p.s<=CAUSEWAY.sWater1};
}
/** True on any walkable Coral Cay ground: the causeway deck and its beach banks, the sandbar spurs and sand, the cay.
 *  (lib/town/landmass.ts onLand also includes the main island.) Obstacles (buildings, props) are not checked here. */
export const isOnCayLand=onCayLand;
/** Named anchor points (world x/z, all on walkable ground unless noted). */
export const CAY_LANDMARKS={
 starfishSandbar:{x:SANDBARS[0].x,z:SANDBARS[0].z},
 turtleSandbar:{x:SANDBARS[1].x,z:SANDBARS[1].z},
 starfishSpur:{x:SANDBARS[0].spur.x,z:(SANDBARS[0].spur.z0+SANDBARS[0].spur.z1)/2},
 turtleSpur:{x:SANDBARS[1].spur.x,z:(SANDBARS[1].spur.z0+SANDBARS[1].spur.z1)/2},
 welcomeArch:{x:WELCOME_ARCH.x,z:WELCOME_ARCH.z},
 roundabout:{x:ROUNDABOUT.x,z:ROUNDABOUT.z},
 cayKonbiniDoor:{x:CAY_KONBINI_DOOR.x,z:CAY_KONBINI_DOOR.z,yaw:CAY_KONBINI_DOOR.yaw},
 cayKonbini:{x:CAY_KONBINI.x,z:CAY_KONBINI.front+2.5},
 plaza:{x:CAY_PLAZA.x,z:CAY_PLAZA.z},
 beachSoccerCourt:{x:BEACH_COURT.x,z:BEACH_COURT.z},
 /** The court scoreboard's face (it replaced the Beach Soccer Club building on Sep 29 2026). */
 club:{x:COURT_SCOREBOARD.x,z:COURT_SCOREBOARD.front+1.5},
 sharksBeach:{x:SHARKS_BEACH.x,z:SHARKS_BEACH.z},
 farm:{x:(FARM.crops.x0+FARM.crops.x1)/2,z:FARM.track.z},
 farmStand:{x:FARM.stand.x,z:FARM.stand.z+2.5},
 hostel:{x:HOSTEL.x,z:HOSTEL.verandah.z+2.5},
 /** Open, deep water in the big south block (clear of the causeway sharks, the sandbars and the flight edge): the deep-sea
  *  fishing boat's mooring (owned by the fishing/boat feature, which may register it via landableDecks.ts). Not land. */
 /** The deep-sea boat's mooring (BOAT_MOORING in lib/town/fishing/deepSeaBoatData.ts; the user's spot, Sep 29 2026).
  *  Open, flyable sea just west of the south block. Informational: the boat no longer reads it. */
 deepSeaMooring:{x:282.5,z:-93.5},
 /** The lane junction among the homes (fixed point; stays valid if homes are added or removed). */
 homes:{x:571.5,z:-99.5},
 /** The lifeguard tower on the cay's easternmost headland (same rule as coralCayWorld.ts). */
 lifeguardTower:(()=>{let best=0;for(let i=0;i<CAY_SHORE.length;i++)if(CAY_SHORE[i].x>CAY_SHORE[best].x)best=i;const s=CAY_SAND[best];return {x:s.outer.x+(s.inner.x-s.outer.x)*.45,z:s.outer.z+(s.inner.z-s.outer.z)*.45};})(),
} as const;

/** The big open water block south of the causeway (user's red line): flyable sea at least 30 m south of the road,
 *  west of the cay margin, clear of the sandbars. For features that place things on the water (e.g. a boat). */
export function isInSouthSeaBlock(x:number,z:number){
 if(x<300||x>500||onCayLand(x,z)||!inCayFlightZone(x,z))return false;
 // The block keeps its own south edge (the first red line), although the south-east sea now continues beyond it.
 if(z<roadZAt(x)+30||z>southEdgeAt(x))return false;
 return SANDBARS.every(s=>Math.hypot(x-s.x,z-s.z)>s.radius+12);
}

