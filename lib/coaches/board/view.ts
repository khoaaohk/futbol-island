import type {Rect} from './pitch';

/**
 * Screen ↔ pitch transform. 'h': the home team attacks to the right (landscape boards). 'v': it attacks up the screen
 * (portrait phones), with its left touchline on the left. One uniform scale, so circles stay round and arrows keep their
 * curve. The pitch SVG uses `matrix` directly; chips and ink go through toScreen/toModel.
 */
export type Orient='h'|'v';
export type View={orient:Orient;rect:Rect;s:number;w:number;h:number};
export function fitView(rect:Rect,boxW:number,boxH:number,orient:Orient):View{
 const lw=rect.x1-rect.x0,lh=rect.y1-rect.y0;
 const s=orient==='h'?Math.min(boxW/lw,boxH/lh):Math.min(boxW/lh,boxH/lw);
 return {orient,rect,s,w:Math.round((orient==='h'?lw:lh)*s),h:Math.round((orient==='h'?lh:lw)*s)};
}
/**
 * Whichever way round gives the bigger pitch: portrait phones stand it up (attacking up the screen), landscape screens and
 * short phone windows lay it across. A near tie keeps it across, like most real boards.
 */
export function bestView(rect:Rect,boxW:number,boxH:number):View{
 const h=fitView(rect,boxW,boxH,'h'),v=fitView(rect,boxW,boxH,'v');return v.s>h.s*1.06?v:h;
}
export function toScreen(v:View,m:[number,number]):[number,number]{
 const {rect:r,s}=v;return v.orient==='h'?[(m[0]-r.x0)*s,(m[1]-r.y0)*s]:[(m[1]-r.y0)*s,(r.x1-m[0])*s];
}
export function toModel(v:View,p:[number,number]):[number,number]{
 const {rect:r,s}=v;return v.orient==='h'?[r.x0+p[0]/s,r.y0+p[1]/s]:[r.x1-p[1]/s,r.y0+p[0]/s];
}
/** A screen-space delta (px) as a pitch delta (m): keyboard arrows move chips the way the screen points. */
export function deltaToModel(v:View,dx:number,dy:number):[number,number]{return v.orient==='h'?[dx/v.s,dy/v.s]:[-dy/v.s,dx/v.s];}
/** The SVG transform that draws pitch metres on screen. */
export function svgMatrix(v:View):string{
 const {rect:r,s}=v;return v.orient==='h'?`matrix(${s} 0 0 ${s} ${-r.x0*s} ${-r.y0*s})`:`matrix(0 ${-s} ${s} 0 ${-r.y0*s} ${r.x1*s})`;
}
