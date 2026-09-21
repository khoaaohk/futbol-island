/** Riso engine — forward passage: the camera travels into a painted material
 * of the outgoing composition and the next composition is revealed inside it.
 * Never zoom in and shrink back out; at progress 1 the frame equals `to`
 * drawn normally at its chapterTime 0 (the seam pixel test relies on this). */
import type {Sheet} from './sheet';
import {polyPath,rectPath,clamp,type Pt} from './motion';
export const PASSAGE={departure:.65,arrival:.72,preview:.68,seam:.88} as const;
/** Arrival scale of an incoming chapter: .88 at chapterTime 0 → 1 after .72 s. Applied automatically by playChapters via sheet.arrival. */
export function passageArrival(seconds:number){const tail=Math.pow(1-clamp(seconds/PASSAGE.arrival),3);return 1-(1-PASSAGE.seam)*tail;}
const polys=new WeakMap<Path2D,Pt[]>();
/** aperture(points): a convex polygon in the outgoing world (a ball panel, a pupil, a lantern glass, a chalk dust cloud). Returns the Path2D forwardPassage expects. */
export function aperture(points:Pt[]):Path2D{const p=polyPath(points,true);polys.set(p,points);return p;}
/** aperture helper: a regular polygon (n sides) around a point — the usual convex material. */
export function apertureDisc(x:number,y:number,r:number,n=10,rot=0){const pts:Pt[]=[];for(let i=0;i<n;i++){const a=rot+i/n*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}return aperture(pts);}
export type Passage={aperture:Path2D;from:(t:number)=>void;to:(t:number)=>void};
/** forwardPassage(sheet, {aperture, from, to}, progress 0..1, tOut, tIn):
 * `from` is drawn with its own camera plus an accelerating zoom so the aperture's inscribed circle passes every canvas corner at progress 1
 * while its centre travels straight to the view centre; inside the (zoomed) aperture the outgoing ink is knocked out and `to` is drawn at
 * scale .68→.88. Registration offsets ease toward the next print during the passage so the seam is pixel-continuous. */
export function forwardPassage(sheet:Sheet,p:Passage,progress:number,tOut:number,tIn:number){
 const pts=polys.get(p.aperture);if(!pts||pts.length<3)throw new Error('riso: build the aperture with aperture(points) — a convex polygon in the outgoing world');
 // the last ~1.3 ms of a passage snap to 1 so a frame held at the chapter boundary is the destination's frame 0 exactly
 const prog=progress>=1-2e-3?1:Math.max(0,progress),savedArrival=sheet.arrival;
 sheet._passage.pending={points:pts,progress:prog};sheet._passage.screen=undefined;
 if(prog<1){sheet.save();p.from(tOut);sheet.restore();}
 const screen=sheet._passage.screen;sheet._passage.pending=undefined;
 sheet.save();
 if(screen&&prog<1)sheet._clipDevice(screen);
 sheet.arrival=1;sheet.camera(sheet.cx,sheet.cy,1,0);
 sheet.knockout(rectPath(-1e6,-1e6,2e6,2e6));
 sheet.arrival=prog>=1?PASSAGE.seam:PASSAGE.preview+(PASSAGE.seam-PASSAGE.preview)*prog;
 p.to(tIn);
 sheet.restore();sheet.arrival=savedArrival;
 sheet._passage.blend={p:prog};
}
