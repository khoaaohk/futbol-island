// West Stadium layout (Nov 12 2026, docs/stadium/PLAN.md): the numbers shared by the 3D build (westPark.ts), the maps and later
// phases (stands, match venue, sponsor slots). Pure data, no three.js, so the map component can import it cheaply.
import {onIsland,distanceToShore,INTERIOR_GRASS} from './shoreline';
/** The stadium bowl: centre, outer size (x × z) and the full-size pitch inside (long axis north–south). */
export const STADIUM={x:-205,z:-30,bowlW:124,bowlL:164,pitchW:63,pitchL:100} as const;
/** The gate on the bowl's east side, facing the plaza. */
export const STADIUM_GATE={x:STADIUM.x+STADIUM.bowlW/2,z:STADIUM.z,halfWidth:7} as const;
/** Stadium Plaza: the fan walk from Old Town's west street (x -45) to the gate. */
/** Map travel ("Stadium", phase 3): you land on the plaza just outside the gate, facing it. */
export const STADIUM_ARRIVAL={x:STADIUM_GATE.x+8,z:STADIUM_GATE.z,yaw:-Math.PI/2} as const;
export const STADIUM_PLAZA={minX:-140,maxX:-52,minZ:STADIUM.z-22,maxZ:STADIUM.z+22} as const;
/** The x of the 7 flag poles on each side of the plaza, west (the stadium apron) to east (owner, Nov 13 2026: no pole on a path):
 *  on the grass verge 0.8 m outside the plaza's long edges, clear of the apron (x < -132) and the trail mouths at x -106. */
export const PLAZA_FLAG_X=[-129,-120,-111,-99,-88,-77,-66] as const;
/** The plaza's player-facing name (Nov 13 2026, owner: "Plaza", not "Stadium Plaza"; analytics ids keep stadium_plaza). */
export const PLAZA_LABEL='PLAZA';
/** The park pond (an ellipse, radii in m). Nov 13 2026 (owner): bigger, grown south toward the coast, away from the bowl's ring;
 *  its north edge stays where it was. A shallow pond you can wade (POND_WADE m deep at the middle), ringed by a stone rim. */
export const PARK_POND={x:-150,z:84,rx:27,rz:20} as const;
export const POND_RIM=2.2,POND_WADE=.22,POND_Y=-.015;
/** The pond's ellipse "radius" at (x, z): < 1 inside the water (margin m added to both radii). */
export const pondQ=(x:number,z:number,margin=0)=>Math.hypot((x-PARK_POND.x)/(PARK_POND.rx+margin),(z-PARK_POND.z)/(PARK_POND.rz+margin));
export const inPond=(x:number,z:number,margin=0)=>pondQ(x,z,margin)<1;
/** How far a walker sinks at (x, z): 0 on the bank, easing to POND_WADE ~3 m in from the water's edge. */
export function pondWade(x:number,z:number){const q=pondQ(x,z);if(q>=1)return 0;const inside=(1-q)*Math.min(PARK_POND.rx,PARK_POND.rz),k=Math.min(1,inside/3);return POND_WADE*k*k*(3-2*k);}
/** Mown lawns (ellipses). Nov 13 2026 (owner): moved clear of every path, the bowl's apron and the pond (the middle one north). */
export const PARK_LAWNS=[{x:-262,z:-160,rx:20,rz:12},{x:-150,z:-150,rx:20,rz:11},{x:-300,z:-72,rx:12,rz:18}] as const;
export type P=readonly [number,number];
export type Curve=readonly [P,P,P,P];
const bezier=([a,b,c,d]:Curve,t:number):P=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
/** The ring path round the bowl (a rounded rectangle, 8 m out from the stands). */
export const BOWL_RING={x:STADIUM.x,z:STADIUM.z,w:STADIUM.bowlW+16,d:STADIUM.bowlL+16,r:40,width:5} as const;
/** The bowl's apron (Nov 13 2026, owner: "a strip of grass separates the plaza from the gate"): one paved rounded rectangle from
 *  the stands out to the ring path's outer edge, under the bowl, so the gate, every back stair and the four open corners land on
 *  paving that runs on into the plaza and the trails. */
export const BOWL_APRON={x:STADIUM.x,z:STADIUM.z,w:BOWL_RING.w+BOWL_RING.width,d:BOWL_RING.d+BOWL_RING.width,r:BOWL_RING.r+BOWL_RING.width/2} as const;
export function onApron(x:number,z:number,margin=0){const {w,d,r}=BOWL_APRON,ax=Math.abs(x-BOWL_APRON.x)-(w/2-r),az=Math.abs(z-BOWL_APRON.z)-(d/2-r);
 return Math.hypot(Math.max(ax,0),Math.max(az,0))+Math.min(Math.max(ax,az),0)<r+margin;}
/** Trail width (m), the same on every trail. */
export const TRAIL_WIDTH=4.5;
/** Where a trail starts and ends: 'ring' / 'plaza' / 'pond' (on that paving), 'trail' (on another trail's centreline: a junction)
 *  or 'beach' (it runs on onto the sand, its paving blending into the beach). */
export type TrailEnd='ring'|'plaza'|'pond'|'trail'|'beach';
export type Trail={id:string;curve:Curve;from:TrailEnd;to:TrailEnd};
// Winding gravel trails (Nov 13 2026 rework, owner: no kinks, no stubs, every coast-bound trail runs onto the beach). Each is one
// cubic Bézier that leaves the ring (on a straight side) or the plaza edge square to it, so the join is tangent-smooth.
const T_SOUTH_EAST:Curve=[[-106,-8.5],[-106,40],[-100,72],[-99,116]];
const SPUR_T=.69,spurStart=bezier(T_SOUTH_EAST,SPUR_T);
export const PARK_TRAILS:readonly Trail[]=[
 {id:'north',curve:[[-205,-120],[-205,-152],[-168,-165],[-152,-200]],from:'ring',to:'beach'},
 {id:'south-west',curve:[[-205,60],[-205,86],[-240,90],[-257,111]],from:'ring',to:'beach'},
 {id:'west',curve:[[-275,-30],[-293,-30],[-300,12],[-320,22]],from:'ring',to:'beach'},
 {id:'north-east',curve:[[-106,-51.5],[-106,-100],[-100,-150],[-99,-193]],from:'plaza',to:'beach'},
 {id:'south-east',curve:T_SOUTH_EAST,from:'plaza',to:'beach'},
 // The pond walk: off the south-east trail to the pond's east rim (its benches and sign).
 {id:'pond',curve:[spurStart,[spurStart[0]-7,spurStart[1]],[-114,86],[PARK_POND.x+PARK_POND.rx+POND_RIM*.5,86]],from:'trail',to:'pond'},
];
/** The trails' curves (the older name; the map and tests read either). */
export const PARK_PATHS:readonly Curve[]=PARK_TRAILS.map(t=>t.curve);
/** Groves: where the park's trees cluster (centre, radius); a few more trees stand alone between them. */
export const PARK_GROVES:readonly [number,number,number][]=[[-255,-185,30],[-160,-175,28],[-110,-120,22],[-290,-110,24],[-295,10,22],[-250,95,26],[-190,100,22],[-110,100,20],[-120,40,18],[-150,-80,16],[-280,-60,16]];
/** The LILY POND sign (Nov 13 2026, owner: it stood on the sandy path): on the grass verge north of the pond walk, facing walkers
 *  coming from the trail (east, rotation π/2), clear of the walk, the rim and the water. */
export const POND_SIGN={x:-116,z:78.2,rotation:Math.PI/2} as const;
/** Signs that trees keep clear of: STADIUM PARK, LILY POND (westPark.ts's trees and the stadium orchards, stadiumOrchard.ts). */
export const PARK_SIGNS:readonly (readonly [number,number])[]=[[-114,30],[POND_SIGN.x,POND_SIGN.z]];
/** The pond's two benches, on the rim verge looking over the water. */
export const POND_BENCHES:readonly P[]=[150,35].map(a=>{const t=a*Math.PI/180;return [PARK_POND.x+Math.cos(t)*(PARK_POND.rx+POND_RIM+1.8),PARK_POND.z+Math.sin(t)*(PARK_POND.rz+POND_RIM+1.8)] as P;});

const curveLength=(c:Curve)=>{let l=0,p=c[0];for(let i=1;i<=32;i++){const q=bezier(c,i/32);l+=Math.hypot(q[0]-p[0],q[1]-p[1]);p=q;}return l;};
/** A trail as a polyline, one point every ~1.2 m (smooth at the follow camera's distance; the map draws the same points). */
export const pathPoints=(curve:Curve,n=Math.max(12,Math.ceil(curveLength(curve)/1.2)))=>Array.from({length:n+1},(_,i)=>bezier(curve,i/n));
/** The ring as a closed polyline (first point repeated last), 16 points per rounded corner. */
export const ringPoints=()=>{const {x,z,w,d,r}=BOWL_RING,a=w/2-r,b=d/2-r,pts:P[]=[];
 for(const [cx,cz,a0] of [[a,b,0],[-a,b,Math.PI/2],[-a,-b,Math.PI],[a,-b,Math.PI*1.5]] as const)for(let i=0;i<=16;i++){const t=a0+i/16*Math.PI/2;pts.push([x+cx+Math.cos(t)*r,z+cz+Math.sin(t)*r]);}
 pts.push(pts[0]);return pts;};
export const segDistance=(x:number,z:number,pts:readonly P[])=>{let best=Infinity;for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));}return best;};
/** Every park path as a polyline (the trails, then the bowl's ring): the world's ribbons and the map draw these same points. */
export const parkPathLines=()=>[...PARK_PATHS.map(c=>pathPoints(c)),ringPoints()];
/** Inside the bowl's footprint (+ margin)? */
export const inStadiumFootprint=(x:number,z:number,margin=0)=>Math.abs(x-STADIUM.x)<STADIUM.bowlW/2+margin&&Math.abs(z-STADIUM.z)<STADIUM.bowlL/2+margin;
const inPoly=(poly:readonly {x:number;z:number}[],x:number,z:number)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)c=!c;}return c;};
/** On the island's lawn (not the beach sand)? */
export const onGrass=(x:number,z:number)=>inPoly(INTERIOR_GRASS,x,z);
let grassRing:P[]|null=null;
/** Distance (m) to the lawn's edge (the grass / sand line), either side of it. */
export const grassEdgeDistance=(x:number,z:number)=>{grassRing??=[...INTERIOR_GRASS.map(p=>[p.x,p.z] as P),[INTERIOR_GRASS[0].x,INTERIOR_GRASS[0].z]];return segDistance(x,z,grassRing);};
/** On the beach: land, off the lawn (the dry sand between the grass edge and the waterline). */
export const onBeach=(x:number,z:number)=>onIsland(x,z)&&!onGrass(x,z)&&distanceToShore(x,z)>=2;
let lines:P[][]|null=null;
/** On a walk path: the bowl's apron, a trail, the ring path or the pond's stone rim (+ margin m), the plaza itself not included.
 *  The "no props on paths" check (tests/west-stadium.cjs) is built on this; a prop's half size goes in `margin`. */
export function onWalkPath(x:number,z:number,margin=0){
 if(onApron(x,z,margin))return true;
 const q=pondQ(x,z,POND_RIM+margin);if(q<1&&!inPond(x,z,-margin))return true;
 lines??=parkPathLines();for(const l of lines)if(segDistance(x,z,l)<TRAIL_WIDTH/2+margin)return true;return false;
}
/** On any park paving (the plaza or a walk path)? */
export function onParkPaving(x:number,z:number,margin=0){
 if(x>STADIUM_PLAZA.minX-margin&&x<STADIUM_PLAZA.maxX+margin&&z>STADIUM_PLAZA.minZ-margin&&z<STADIUM_PLAZA.maxZ+margin)return true;
 return onWalkPath(x,z,margin);
}
/** How far a trail's paving point is past the lawn's edge onto the sand (m, 0 on the lawn): the blend runs on this. */
export function trailBeachRun(pts:readonly P[]){let s=0,out:number[]=[],start=-1;for(let i=0;i<pts.length;i++){if(i)s+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(start<0&&!onGrass(pts[i][0],pts[i][1]))start=s;out.push(start<0?0:s-start);}return out;}
