import {Palette} from './palette';
import type {Px} from './iso';
import {glyph,GLYPH_W,GLYPH_H} from './font';

/**
 * pixeliso · the pixel rasteriser (Oct 10 2026). A tiny software renderer into an INDEXED buffer (one byte per pixel, a palette
 * index; 0 = transparent), blitted once per frame to a small canvas that the browser upscales by a whole number with
 * image-rendering: pixelated. Nothing is anti-aliased: polygons fill by the pixel-centre rule (shared edges never gap or double),
 * lines are Bresenham, shading is flat ramps plus the 4×4 Bayer dither (the penalty cabinet's console look). Pure: runs in Node.
 */
export type Paint=string|{a?:string|null;b:string;level:number};
/** 4×4 ordered (Bayer) dither: a pixel is "on" for level L (0–16) when BAYER[y&3][x&3] < L. */
export const BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]] as const;
export const dither=(x:number,y:number,level:number)=>BAYER[y&3][x&3]<level;

export class Pixmap{
 readonly data:Uint8Array;readonly pal:Palette;
 /** Pick buffer: while `tag` is non-zero every pixel drawn also records it (exact, painter-correct tap targets). */
 readonly ids:Uint8Array;tag=0;
 constructor(readonly w:number,readonly h:number,pal?:Palette){this.data=new Uint8Array(w*h);this.ids=new Uint8Array(w*h);this.pal=pal??new Palette();}
 clear(c:string|0=0){this.data.fill(c===0?0:this.pal.id(c));this.ids.fill(0);}
 private put(x:number,y:number,p:Paint){if(x<0||y<0||x>=this.w||y>=this.h)return;const i=y*this.w+x;
  if(typeof p==='string'){this.data[i]=this.pal.id(p);this.ids[i]=this.tag;return;}
  const on=dither(x,y,p.level);const c=on?p.b:p.a;if(c){this.data[i]=this.pal.id(c);this.ids[i]=this.tag;}}
 /** The tag drawn last at (x, y), or the nearest tag within r pixels (fingers are wide: r ≈ 22 CSS px / pixel size). */
 pick(x:number,y:number,r=0){x=Math.round(x);y=Math.round(y);let best=0,bd=Infinity;
  for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){const X=x+i,Y=y+j;if(X<0||Y<0||X>=this.w||Y>=this.h)continue;const t=this.ids[Y*this.w+X];if(!t)continue;const d=i*i+j*j;if(d<bd&&d<=r*r+.5){bd=d;best=t;}}
  return best;}
 set(x:number,y:number,p:Paint){this.put(x|0,y|0,p);}
 get(x:number,y:number){return x<0||y<0||x>=this.w||y>=this.h?0:this.data[(y|0)*this.w+(x|0)];}
 hexAt(x:number,y:number){const i=this.get(x,y);return i?this.pal.hexOf(i):null;}
 rect(x:number,y:number,w:number,h:number,p:Paint){for(let j=Math.max(0,y|0);j<Math.min(this.h,(y|0)+h);j++)for(let i=Math.max(0,x|0);i<Math.min(this.w,(x|0)+w);i++)this.put(i,j,p);}
 /** Fill a polygon (any simple or self-touching ring) by the pixel-centre rule, even-odd. */
 poly(pts:readonly Px[],p:Paint){if(pts.length<3)return;
  let y0=Infinity,y1=-Infinity;for(const q of pts){y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
  const xs:number[]=[];
  for(let y=Math.max(0,Math.floor(y0));y<=Math.min(this.h-1,Math.ceil(y1));y++){const cy=y+.5;xs.length=0;
   for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [ax,ay]=pts[i],[bx,by]=pts[j];
    if((ay<=cy&&by>cy)||(by<=cy&&ay>cy))xs.push(ax+(cy-ay)/(by-ay)*(bx-ax));}
   xs.sort((a,b)=>a-b);
   for(let k=0;k+1<xs.length;k+=2){const a=Math.ceil(xs[k]-.5),b=Math.ceil(xs[k+1]-.5);for(let x=Math.max(0,a);x<Math.min(this.w,b);x++)this.put(x,y,p);}}}
 /** A 1-px Bresenham line (2:1 iso edges come out as clean two-pixel steps). */
 line(x0:number,y0:number,x1:number,y1:number,p:Paint){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
  const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(let n=0;n<4096;n++){this.put(x0,y0,p);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
 polyline(pts:readonly Px[],p:Paint,closed=false){for(let i=0;i+1<pts.length;i++)this.line(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],p);
  if(closed&&pts.length>2)this.line(pts[pts.length-1][0],pts[pts.length-1][1],pts[0][0],pts[0][1],p);}
 /** A filled ellipse (centre and radii in pixels). `ring` draws only the 1-px rim. */
 ellipse(cx:number,cy:number,rx:number,ry:number,p:Paint,ring=false){if(rx<=0||ry<=0)return;
  const inside=(x:number,y:number,a:number,b:number)=>((x+.5-cx)/a)**2+((y+.5-cy)/b)**2<=1;
  for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){
   if(!inside(x,y,rx,ry))continue;
   if(ring&&inside(x-1,y,rx,ry)&&inside(x+1,y,rx,ry)&&inside(x,y-1,rx,ry)&&inside(x,y+1,rx,ry))continue;
   this.put(x,y,p);}}
 /**
  * A sprite from a string grid ('.' or ' ' = transparent, any other char = keys[char]). (x, y) is the grid's top-left; `flip`
  * mirrors it left–right (a player facing the other way).
  */
 sprite(grid:readonly string[],keys:Record<string,Paint|undefined>,x:number,y:number,flip=false){
  x=Math.round(x);y=Math.round(y);for(let j=0;j<grid.length;j++){const row=grid[j];for(let i=0;i<row.length;i++){const ch=row[i];if(ch==='.'||ch===' ')continue;const p=keys[ch];if(!p)continue;
   this.put(flip?x+row.length-1-i:x+i,y+j,p);}}}
 /**
  * 3×5 pixel text (font.ts). dir 'screen' = upright; 'x' = painted on a face that runs along +x (a wall facing the viewer's
  * left): each glyph stays upright and the baseline steps down 1 px per 2 px across (the 2:1 floor slope); 'y' = along a face
  * that runs along −y (the right-hand wall): the baseline steps up. Returns the width in pixels.
  */
 text(str:string,x:number,y:number,p:Paint,dir:'screen'|'x'|'y'='screen'){let u=0;x=Math.round(x);y=Math.round(y);
  for(const ch of str.toUpperCase()){const g=glyph(ch),dy=dir==='x'?Math.floor(u/2):dir==='y'?-Math.floor(u/2):0;
   for(let gy=0;gy<GLYPH_H;gy++)for(let gx=0;gx<GLYPH_W;gx++)if(g[gy]&(1<<(GLYPH_W-1-gx)))this.put(x+u+gx,y+gy+dy,p);
   u+=GLYPH_W+1;}
  return Math.max(0,u-1);}
 /** Add a 1-px outline in `c` around every opaque pixel inside the box (for parts drawn without their own rim). */
 outline(c:string,box?:{x0:number;y0:number;x1:number;y1:number}){const id=this.pal.id(c),{w,h}=this,d=this.data,src=d.slice();
  const x0=Math.max(0,box?.x0??0),y0=Math.max(0,box?.y0??0),x1=Math.min(w-1,box?.x1??w-1),y1=Math.min(h-1,box?.y1??h-1);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(src[y*w+x])continue;
   if((x>0&&src[y*w+x-1])||(x<w-1&&src[y*w+x+1])||(y>0&&src[(y-1)*w+x])||(y<h-1&&src[(y+1)*w+x]))d[y*w+x]=id;}}
 /** Copy into RGBA (little-endian Uint32 view of an ImageData buffer). Transparent pixels get `bg`. */
 toRGBA(out:Uint32Array,bg=0xff000000){const {data,pal}=this;for(let i=0;i<data.length;i++){const c=data[i];out[i]=c?pal.rgba[c]:bg;}return out;}
 /** Count distinct colours used (the palette check in tests). */
 coloursUsed(){const s=new Set<number>();for(const c of this.data)if(c)s.add(c);return [...s].map(i=>this.pal.hexOf(i)!);}
}
