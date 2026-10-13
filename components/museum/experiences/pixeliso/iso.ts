/**
 * pixeliso · the isometric projection (Oct 10 2026). The anatomy kit's camera (azimuth 45°, elevation 30°) snapped to pixel art:
 * at that camera the floor projects at exactly 2:1, the pixel artist's "isometric" line (two across, one down), so every floor
 * edge steps cleanly. World units are metres: x runs to the screen's lower right, y to the lower left, z up.
 *
 *   1 m on the floor = one 16 × 8 px tile (TILE_W × TILE_H);   1 m up = Z_PX = 10 px (the true 9.8, rounded).
 *
 * Screen points are always whole pixels (Math.round), so parts never shimmer. depth() is the painter's key: bigger = nearer.
 */
export const TILE_W=16,TILE_H=8,Z_PX=10,HALF_W=TILE_W/2,HALF_H=TILE_H/2;
export type P3=readonly [number,number,number];
export type Px=[number,number];
export type Camera={ox:number;oy:number};

/** World metres → buffer pixel (whole pixels). */
export function toScreen(cam:Camera,x:number,y:number,z=0):Px{
 return [Math.round(cam.ox+(x-y)*HALF_W),Math.round(cam.oy+(x+y)*HALF_H-z*Z_PX)];}
/** Unrounded projection (for sub-pixel motion that is rounded once at draw time). */
export function toScreenF(cam:Camera,x:number,y:number,z=0):Px{return [cam.ox+(x-y)*HALF_W,cam.oy+(x+y)*HALF_H-z*Z_PX];}
/** Buffer pixel → the point on the plane z (default the floor) under it. */
export function toWorld(cam:Camera,sx:number,sy:number,z=0){
 const u=(sx-cam.ox)/HALF_W,v=(sy-cam.oy+z*Z_PX)/HALF_H;return {x:(u+v)/2,y:(v-u)/2};}
/** Painter's key: nearer the viewer (bigger x + y) draws later; height breaks ties a little. */
export const depth=(x:number,y:number,z=0)=>x+y+z*.001;

/** A camera that puts world point (cx, cy, cz) at the buffer's centre (plus an optional pixel nudge). */
export function centreOn(w:number,h:number,cx:number,cy:number,cz=0,nudge:Px=[0,0]):Camera{
 return {ox:Math.round(w/2-(cx-cy)*HALF_W+nudge[0]),oy:Math.round(h/2-(cx+cy)*HALF_H+cz*Z_PX+nudge[1])};}
/** Screen-space box of a world box (for fitting and hit areas). */
export function boundsOf(cam:Camera,x:number,y:number,z:number,w:number,d:number,h:number){
 const pts=[[x,y,z],[x+w,y,z],[x,y+d,z],[x+w,y+d,z],[x,y,z+h],[x+w,y,z+h],[x,y+d,z+h],[x+w,y+d,z+h]].map(p=>toScreen(cam,p[0],p[1],p[2]));
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)};}
/** Pixel size of a world box once drawn (to check a scene fits its stage). */
export function extentOf(w:number,d:number,h:number){return {w:(w+d)*HALF_W,h:(w+d)*HALF_H+h*Z_PX};}

/** A stage's grid: pixel size px (CSS px per art pixel) and buffer w × h. */
export type StageSize={w:number;h:number;px:number};
/** The pixel size and buffer for a box: P ∈ {4,3,2} (1 only if even P = 2 cannot fit), buffer between min and max. */
export function fitGrid(availW:number,availH:number,min:readonly [number,number],max:readonly [number,number]=min):StageSize{
 let px=1;for(const p of [4,3,2])if(min[0]*p<=availW&&min[1]*p<=availH){px=p;break;}
 const w=Math.max(min[0],Math.min(max[0],Math.floor(availW/px))),h=Math.max(min[1],Math.min(max[1],Math.floor(availH/px)));
 return {w,h,px};}

