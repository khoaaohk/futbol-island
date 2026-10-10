import * as T from 'three';
/**
 * Mowing stripes ("grass lines", Oct 9 2026): the light and dark bands a groundskeeper's roller leaves on a real pitch.
 *
 * Heat: no new mesh, draw call, texture or shader. The bands are baked into the vertex colours of the geometry a pitch
 * already draws (its one ground slab), and the slab's material switches to `vertexColors`, which is the same shader
 * program the island's batched palette paint already uses. The light/dark factor multiplies the material colour, so the
 * night floodlight blend (fieldLighting.ts) and the time-of-day grade still drive one shared colour per pitch.
 *
 * Football: bands run across the pitch from touchline to touchline, an even number of them between the goal lines, so the
 * halfway line always falls on a band edge (kids can count bands: each one is about 5 m). On Eleven Park the band length is
 * chosen so the 6-yard (5.5 m) and 18-yard (16.5 m) box edges land on band edges, as a groundskeeper would mark it out.
 */

/** Linear multipliers for the light and dark bands (about ±3% displayed luminance: reads on a phone, never loud). */
export const STRIPE_LIGHT=1.06,STRIPE_DARK=.94;
/** Cross-mowing (Eleven Park): a fainter second pass along the length makes the stadium chequerboard. */
export const CROSS_LIGHT=1.02,CROSS_DARK=.98;

export type StripePlan={
 /** Whole bands between the two goal lines (always even, so halfway sits on a band edge). */
 bands:number;
 /** Band length along the pitch, metres. */
 bandLength:number;
 /** Lanes of the fainter lengthwise pass across the width (0 = plain stripes). */
 lanes:number;
};

/**
 * Picks an even band count near `target` metres per band. When `boxDepth` is given (a penalty-area depth), the count that
 * best lands the box edge on a band edge wins among the candidates 4.5–6.5 m wide.
 */
export function stripePlan(length:number,{target=5,boxDepth,lanesWidth,laneTarget=5.5}:{target?:number;boxDepth?:number;lanesWidth?:number;laneTarget?:number}={}):StripePlan{
 let best=0,bestScore=Infinity;
 for(let n=2;n<=64;n+=2){const band=length/n;if(band<4.5||band>6.5)continue;
  const offBox=boxDepth?Math.abs(boxDepth/band-Math.round(boxDepth/band))*band:0;
  const score=offBox*4+Math.abs(band-target);
  if(score<bestScore){bestScore=score;best=n;}}
 if(!best)best=Math.max(2,2*Math.round(length/target/2));
 const lanes=lanesWidth?Math.max(2,2*Math.round(lanesWidth/laneTarget/2)):0;
 return {bands:best,bandLength:length/best,lanes};
}

/** Light (1) or dark (0) band at a pitch-local position along the length (0 = halfway). Bands alternate from halfway. */
export const bandAt=(along:number,bandLength:number)=>((Math.floor(along/bandLength)%2)+2)%2;

/**
 * A pitch slab (same footprint as `BoxGeometry(width,height,length)`, centred on the origin) whose top face is cut into mown
 * bands carried in a `color` attribute. `pitchWidth` is the marked pitch inside the run-off (lanes start at its touchline); the bands keep
 * alternating into the run-off as on a real ground. The underside is left out (it rests on the island and is never seen).
 */
export function stripedSlabGeometry(width:number,height:number,length:number,plan:StripePlan,pitchWidth=width){
 const pos:number[]=[],nor:number[]=[],col:number[]=[],idx:number[]=[];
 const quad=(a:number[],b:number[],c:number[],d:number[],n:number[],k:number)=>{const i=pos.length/3;pos.push(...a,...b,...c,...d);for(let j=0;j<4;j++){nor.push(...n);col.push(k,k,k);}idx.push(i,i+1,i+2,i,i+2,i+3);};
 const hx=width/2,hy=height/2,hz=length/2,b=plan.bandLength;
 // Band edges along z: every multiple of the band length from halfway, clipped to the slab.
 const zs=[-hz];for(let k=Math.ceil(-hz/b+1e-6);k*b<hz-1e-6;k++)zs.push(k*b);zs.push(hz);
 const lane=plan.lanes?pitchWidth/plan.lanes:0,xs=[-hx];
 if(lane){for(let k=Math.ceil((-hx+pitchWidth/2)/lane+1e-6);-pitchWidth/2+k*lane<hx-1e-6;k++)xs.push(-pitchWidth/2+k*lane);}
 xs.push(hx);
 for(let i=0;i<zs.length-1;i++){const z0=zs[i],z1=zs[i+1],main=bandAt((z0+z1)/2,b)?STRIPE_LIGHT:STRIPE_DARK;
  for(let j=0;j<xs.length-1;j++){const x0=xs[j],x1=xs[j+1];
   const cross=lane?(bandAt((x0+x1)/2+pitchWidth/2,lane)?CROSS_LIGHT:CROSS_DARK):1;
   quad([x0,hy,z1],[x1,hy,z1],[x1,hy,z0],[x0,hy,z0],[0,1,0],main*cross);}}
 // Four plain sides (factor 1: the slab edge keeps the pitch's own colour).
 quad([-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz],[0,0,1],1);
 quad([hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz],[0,0,-1],1);
 quad([hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz],[1,0,0],1);
 quad([-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz],[-1,0,0],1);
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeBoundingSphere();g.computeBoundingBox();
 g.userData.stripes={bands:plan.bands,bandLength:plan.bandLength,lanes:plan.lanes};
 return g;
}

/**
 * Flat mown grass for the arcade pitches: the alternating bands that used to be one mesh per band, merged into one plane with
 * two geometry groups (light bands, dark bands) for a two-material mesh: 2 draws instead of one per band, and the same plain
 * standard-material program as before (no vertex-colour variant to compile in the arcade). Lies in XZ at y = 0, bands across
 * the `along` axis; band 0 (at -length/2) uses material 0.
 */
export function stripedPlaneGeometry(width:number,length:number,bands:number,along:'x'|'z'='z'){
 const pos:number[]=[],nor:number[]=[],idx:number[][]=[[],[]];
 for(let i=0;i<bands;i++){const a0=-length/2+i*length/bands,a1=a0+length/bands,v=pos.length/3,w=width/2;
  const pts=along==='z'?[[-w,a1],[w,a1],[w,a0],[-w,a0]]:[[a0,-w],[a0,w],[a1,w],[a1,-w]];
  for(const [x,z] of pts){pos.push(x,0,z);nor.push(0,1,0);}
  idx[i%2].push(v,v+1,v+2,v,v+2,v+3);}
 const g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));
 g.setIndex([...idx[0],...idx[1]]);g.addGroup(0,idx[0].length,0);g.addGroup(idx[0].length,idx[1].length,1);g.computeBoundingSphere();
 return g;
}

/** A hex colour shaded by a linear factor (for palette boxes that batch into vertex colours, e.g. the rooftop turf). */
export function shadeHex(hex:string,factor:number){return '#'+new T.Color(hex).multiplyScalar(factor).getHexString();}
