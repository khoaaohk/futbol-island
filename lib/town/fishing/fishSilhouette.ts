import * as T from 'three';
import {WATER_UNIFORMS} from '../../graphics/waterSurface';

/*
 * Seabed silhouettes (Oct 20 2026, user: "when fishing, there are these shadows that are moving, not sure if they are fish or not,
 * based on the shape"). Since the water became clear, a fish's shadow lies on the sand under a visible fish, so it must read as THAT
 * animal: its outline (tail, fins, snout), soft-edged, oriented and scaled with it.
 *
 * silhouetteOf() rasterizes a model's own triangles (CPU, once per model, ~1 ms) into a small alpha texture, softened by two box blurs,
 * and returns a flat grid that maps it, in the MODEL's own frame (same scale, same nose axis), lying in the model's XZ plane. The view:
 *  - 'side': the outline seen from the side (x, y) laid flat: the classic fish shape (forked tail, dorsal and belly fins). Used for
 *    laterally flat bodies (most fish, sharks, eels), whose top view is only a sliver.
 *  - 'top': the outline from above (x, z): rays, turtles, crabs, octopus, the whale shark.
 *  - 'auto': whichever covers more area.
 * One texture + one geometry per model; drawn with any basic transparent material (map = the texture). No DOM needed.
 */
export type SilhouetteView='side'|'top'|'auto';
export type Silhouette={texture:T.DataTexture;geometry:T.BufferGeometry;view:'side'|'top';/** Extent along the length (model x), model units. */length:number;width:number};

/** How far a seabed shadow is pushed away from the sun per metre the animal swims above the sand (a share of the true cast, so
 *  the shadow stays near its fish and reads as its own), and the most it moves (m). */
export const SEABED_SUN={pull:.45,max:1.2} as const;
/** The (x, z) offset of a seabed shadow for an animal `h` metres above the sand (along the island sun, WATER_UNIFORMS.uSunDir). */
export function sunShadowOffset(h:number,out:{x:number;z:number}={x:0,z:0}){
 const s=WATER_UNIFORMS.uSunDir.value,k=Math.max(0,h)*SEABED_SUN.pull/Math.max(s.y,.35);let x=-s.x*k,z=-s.z*k;const l=Math.hypot(x,z);
 if(l>SEABED_SUN.max){x*=SEABED_SUN.max/l;z*=SEABED_SUN.max/l;}out.x=x;out.z=z;return out;
}
/** GLSL: the same offset (needs `uniform vec3 uSunDir`). */
export const SUN_OFFSET_GLSL=/* glsl */`vec2 seabedSunOffset(float h){vec2 o=-uSunDir.xz*max(h,0.)*${SEABED_SUN.pull.toFixed(3)}/max(uSunDir.y,.35);float l=length(o);return l>${SEABED_SUN.max.toFixed(3)}?o*(${SEABED_SUN.max.toFixed(3)}/l):o;}\n`;

function raster(pos:ArrayLike<number>,index:ArrayLike<number>|null,count:number,ax:number,ay:number,W:number,H:number,x0:number,y0:number,s:number){
 const m=new Float32Array(W*H),v=(i:number)=>(index?index[i]:i)*3;
 for(let t=0;t+2<count;t+=3){
  const a=v(t),b=v(t+1),c=v(t+2);
  const px=[(pos[a+ax]-x0)*s,(pos[b+ax]-x0)*s,(pos[c+ax]-x0)*s],py=[(pos[a+ay]-y0)*s,(pos[b+ay]-y0)*s,(pos[c+ay]-y0)*s];
  const d=(px[1]-px[0])*(py[2]-py[0])-(py[1]-py[0])*(px[2]-px[0]);if(Math.abs(d)<1e-9)continue;
  const minX=Math.max(0,Math.floor(Math.min(...px))),maxX=Math.min(W-1,Math.ceil(Math.max(...px))),minY=Math.max(0,Math.floor(Math.min(...py))),maxY=Math.min(H-1,Math.ceil(Math.max(...py)));
  for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++){
   const qx=x+.5,qy=y+.5,w0=((px[1]-qx)*(py[2]-qy)-(py[1]-qy)*(px[2]-qx))/d,w1=((px[2]-qx)*(py[0]-qy)-(py[2]-qy)*(px[0]-qx))/d,w2=1-w0-w1;
   if(w0>=-.02&&w1>=-.02&&w2>=-.02)m[y*W+x]=1;}
 }
 return m;
}
function blur(m:Float32Array,W:number,H:number){
 const o=new Float32Array(m.length);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0;for(let i=-1;i<=1;i++){const xx=Math.min(W-1,Math.max(0,x+i));s+=m[y*W+xx];}o[y*W+x]=s/3;}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0;for(let i=-1;i<=1;i++){const yy=Math.min(H-1,Math.max(0,y+i));s+=o[yy*W+x];}m[y*W+x]=s/3;}
}
const area=(m:Float32Array)=>{let a=0;for(const v of m)a+=v;return a;};

/** The silhouette of `geometry` (see above). `segments` = grid cells along the length (for a tail wag on the CPU or GPU). */
export function silhouetteOf(geometry:T.BufferGeometry,view:SilhouetteView='auto',o:{W?:number;H?:number;segments?:number;soft?:number}={}):Silhouette{
 const W=o.W??128,H=o.H??64,P=3,pos=geometry.getAttribute('position').array as ArrayLike<number>,index=geometry.index?geometry.index.array as ArrayLike<number>:null;
 const count=index?index.length:pos.length/3;
 // Symmetric extents round the model origin (so the grid's centre is the model's centre and it moves with the mesh).
 const ext=[0,0,0];for(let i=0;i<pos.length;i+=3)for(let k=0;k<3;k++)ext[k]=Math.max(ext[k],Math.abs(pos[i+k]));
 const build=(ay:number)=>{const s=Math.min((W-2*P)/(2*ext[0]||1),(H-2*P)/(2*ext[ay]||1)),hx=W/2/s,hy=H/2/s;return {m:raster(pos,index,count,0,ay,W,H,-hx,-hy,s),hx,hy};};
 let pick:'side'|'top'=view==='top'?'top':'side',r=build(pick==='side'?1:2);
 if(view==='auto'){const t=build(2);if(area(t.m)*(t.hx*t.hy)>area(r.m)*(r.hx*r.hy)*1.15){pick='top';r=t;}}
 for(let i=0;i<(o.soft??2);i++)blur(r.m,W,H);
 const data=new Uint8Array(W*H*4);for(let i=0;i<W*H;i++){data[i*4]=data[i*4+1]=data[i*4+2]=255;data[i*4+3]=Math.round(Math.min(1,r.m[i])*255);}
 const texture=new T.DataTexture(data,W,H,T.RGBAFormat);texture.magFilter=texture.minFilter=T.LinearFilter;texture.needsUpdate=true;
 // The grid: x along the length (model x), z across (model y for the side view, model z for the top view), y = 0.
 const seg=o.segments??1,p:number[]=[],uv:number[]=[],idx:number[]=[];
 for(let i=0;i<=seg;i++)for(const j of [0,1]){const u=i/seg;p.push(-r.hx+2*r.hx*u,0,(j?1:-1)*r.hy);uv.push(u,j);}
 for(let i=0;i<seg;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);
 return {texture,geometry:g,view:pick,length:2*r.hx,width:2*r.hy};
}
