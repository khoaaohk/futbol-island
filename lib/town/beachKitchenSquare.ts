// Beach Kitchen square (Nov 13 2026, owner): the paved square in front of BEACH KITCHEN and SURF & REPAIR (West Market, x -63,
// z 95). It used to be a 25 × 13 m box that left a grass strip below both facades and laid a straight edge across the sand. Now
// the paving runs from the facades' feet (no grass strip) south to the island's grass line, and from there eases into the sand
// over BLEND metres (the west park's TRAIL_BEACH way: colour fade + a small drop to the sand's height), so the join follows the
// sand outline. Pure data, no three.js: world.ts builds the mesh, tests/beach-npcs.cjs checks the edges.
import {onGrass} from './westParkLayout';

/** The two facades the square fronts (house() footprints in world.ts: x, z centre, w, d). The door side is +z (south). */
export const BEACH_KITCHEN_FRONTS=[{name:'BEACH KITCHEN',x:-70,z:82,w:12,d:10},{name:'SURF & REPAIR',x:-49,z:83,w:12,d:10}] as const;
/** West/east limits: both buildings' full widths. North: the Beach Kitchen front (the paving tucks under Surf & Repair's 1 m deeper front). */
export const BK_SQUARE={minX:-76,maxX:-43,northZ:87,
 /** Full paving runs PAST m beyond the grass line (covers the lawn's edge), then fades to sand over BLEND m. */
 past:.6,blend:5,
 /** Top of a path box (y -0.055 + 0.035/2) and the sand height the blend settles to (TRAIL_BEACH.y). */
 y:-.0375,sandY:-.09,
 /** Grid step along x for the mesh and the walk-surface columns. */
 step:.5,column:6.6} as const;

/** z where the island's lawn ends (sand begins) at x, scanning south from the square's north edge. */
export function grassLineZ(x:number):number{
 let z:number=BK_SQUARE.northZ;while(z<140&&onGrass(x,z))z+=.25;
 // refine the 0.25 m bracket
 let lo=z-.25,hi=z;for(let i=0;i<6;i++){const m=(lo+hi)/2;if(onGrass(x,m))lo=m;else hi=m;}return hi;
}
/** The south edges at x: full paving ends at `paved`, the fade reaches pure sand at `sand`. */
export function squareEdge(x:number){const g=grassLineZ(x);return {grass:g,paved:g+BK_SQUARE.past,sand:g+BK_SQUARE.past+BK_SQUARE.blend};}
const smooth=(v:number)=>{const k=Math.min(1,Math.max(0,v));return k*k*(3-2*k);};
/** Fade 0 (paving) … 1 (sand) at (x, z) inside the square's x span. */
export function squareFade(x:number,z:number){const e=squareEdge(x);return smooth((z-e.paved)/BK_SQUARE.blend);}
/** Walk surfaces: 6.6 m columns (wide enough that a bench or table never pinches one) of path from the facades to the fade's midpoint, sand beyond it to the fade's end. */
export function squareSurfaces(){
 const out:{kind:'path'|'sand';x:number;z:number;w:number;d:number}[]=[];
 for(let x0:number=BK_SQUARE.minX;x0<BK_SQUARE.maxX-1e-6;x0+=BK_SQUARE.column){
  const x1=Math.min(BK_SQUARE.maxX,x0+BK_SQUARE.column),cx=(x0+x1)/2,w=x1-x0;
  // the column's shallowest edge keeps the path rect on paving across its whole width
  const e=[x0,cx,x1].map(squareEdge),mid=Math.min(...e.map(v=>v.paved+BK_SQUARE.blend/2)),end=Math.max(...e.map(v=>v.sand));
  out.push({kind:'path',x:cx,z:(BK_SQUARE.northZ+mid)/2,w,d:mid-BK_SQUARE.northZ});
  out.push({kind:'sand',x:cx,z:(mid+end)/2,w,d:end-mid});
 }
 return out;
}
