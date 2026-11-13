// West Stadium layout (Nov 12 2026, docs/stadium/PLAN.md): the numbers shared by the 3D build (westPark.ts), the maps and later
// phases (stands, match venue, sponsor slots). Pure data, no three.js, so the map component can import it cheaply.
/** The stadium bowl: centre, outer size (x × z) and the full-size pitch inside (long axis north–south). */
export const STADIUM={x:-205,z:-30,bowlW:124,bowlL:164,pitchW:63,pitchL:100} as const;
/** The gate on the bowl's east side, facing the plaza. */
export const STADIUM_GATE={x:STADIUM.x+STADIUM.bowlW/2,z:STADIUM.z,halfWidth:7} as const;
/** Stadium Plaza: the fan walk from Old Town's west street (x -45) to the gate. */
/** Map travel ("Stadium", phase 3): you land on the plaza just outside the gate, facing it. */
export const STADIUM_ARRIVAL={x:STADIUM_GATE.x+8,z:STADIUM_GATE.z,yaw:-Math.PI/2} as const;
export const STADIUM_PLAZA={minX:-140,maxX:-52,minZ:STADIUM.z-22,maxZ:STADIUM.z+22} as const;
/** The park pond (an ellipse, radii in m). */
export const PARK_POND={x:-150,z:72,rx:24,rz:13} as const;
/** Mown lawns (ellipses). */
export const PARK_LAWNS=[{x:-262,z:-150,rx:20,rz:12},{x:-150,z:-120,rx:22,rz:12},{x:-270,z:60,rx:18,rz:12}] as const;
export type P=readonly [number,number];
/** Winding gravel paths: cubic Béziers [start, control 1, control 2, end] (the concept page's paths). */
export const PARK_PATHS:readonly (readonly [P,P,P,P])[]=[
 [[-205,-118],[-215,-150],[-165,-170],[-120,-195]],
 [[-205,58],[-185,80],[-245,95],[-262,100]],
 [[-273,-30],[-285,-40],[-295,20],[-300,30]],
 [[-140,-52],[-120,-110],[-100,-140],[-80,-160]],
 [[-140,-8],[-120,50],[-100,70],[-80,90]],
 [[-128,62],[-140,52],[-165,52],[-178,64]],
];
/** The ring path round the bowl (a rounded rectangle, 8 m out from the stands). */
export const BOWL_RING={x:STADIUM.x,z:STADIUM.z,w:STADIUM.bowlW+16,d:STADIUM.bowlL+16,r:40,width:5} as const;
/** Groves: where the park's trees cluster (centre, radius); a few more trees stand alone between them. */
export const PARK_GROVES:readonly [number,number,number][]=[[-255,-185,30],[-160,-175,28],[-110,-120,22],[-290,-110,24],[-295,10,22],[-250,95,26],[-190,100,22],[-110,100,20],[-120,40,18],[-150,-80,16],[-280,-60,16]];

const bezier=([a,b,c,d]:readonly [P,P,P,P],t:number):P=>{const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];};
export const pathPoints=(curve:readonly [P,P,P,P],n=24)=>Array.from({length:n+1},(_,i)=>bezier(curve,i/n));
export const ringPoints=()=>{const {x,z,w,d,r}=BOWL_RING,a=w/2-r,b=d/2-r,pts:P[]=[];
 for(const [cx,cz,a0] of [[a,b,0],[-a,b,Math.PI/2],[-a,-b,Math.PI],[a,-b,Math.PI*1.5]] as const)for(let i=0;i<=8;i++){const t=a0+i/8*Math.PI/2;pts.push([x+cx+Math.cos(t)*r,z+cz+Math.sin(t)*r]);}
 pts.push(pts[0]);return pts;};
export const segDistance=(x:number,z:number,pts:readonly P[])=>{let best=Infinity;for(let i=0;i<pts.length-1;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));}return best;};
/** Every park path as a polyline (the winding paths, then the bowl's ring): the world's ribbons and the map draw these. */
export const parkPathLines=()=>[...PARK_PATHS.map(c=>pathPoints(c)),ringPoints()];
/** Inside the bowl's footprint (+ margin)? */
export const inStadiumFootprint=(x:number,z:number,margin=0)=>Math.abs(x-STADIUM.x)<STADIUM.bowlW/2+margin&&Math.abs(z-STADIUM.z)<STADIUM.bowlL/2+margin;

