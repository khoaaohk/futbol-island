import * as T from 'three';
/** Light shallow-water tint (linear-space RGB via THREE.Color) fading to transparent at sea. */
const TINT=new T.Color('#7fcfd6');
/** Fade rows across the band: [fraction of width, alpha]. A smooth outer edge: no wobble, straight interpolation. */
const ROWS:[number,number][]=[[0,.85],[.4,.4],[1,0]];
/**
 * One shallows band along a shoreline (world points + unit outward directions), starting `start` metres out and
 * `width` wide, built relative to (cx, cz) for its spatial chunk. RGBA vertex colours; y 0 (the mesh sits just above
 * the sea). `closed` joins the last point back to the first (islands and sandbars).
 */
/** `fade(i)` (optional, 0…1) scales point i's alpha, so an open band can taper out to nothing at its ends and blend
 *  softly into a neighbouring band instead of stopping on a hard edge. */
export function fadeBand(points:{x:number;z:number}[],dirs:{x:number;z:number}[],start:number|((i:number)=>number),width:number,closed:boolean,cx:number,cz:number,fade?:(i:number)=>number){
 const n=points.length,rows=ROWS.length,positions:number[]=[],colors:number[]=[],indices:number[]=[];
 for(let i=0;i<n;i++){const p=points[i],d=dirs[i],s0=typeof start==='number'?start:start(i);
  const k=fade?Math.max(0,Math.min(1,fade(i))):1;
  for(const [f,alpha] of ROWS){const o=s0+width*f;positions.push(p.x+d.x*o-cx,0,p.z+d.z*o-cz);colors.push(TINT.r,TINT.g,TINT.b,alpha*k);}}
 const segments=closed?n:n-1;
 for(let i=0;i<segments;i++){const a=i*rows,b=((i+1)%n)*rows;for(let r=0;r<rows-1;r++)indices.push(a+r,b+r,a+r+1,b+r,b+r+1,a+r+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();
 // Winding may face down depending on the direction of travel; the band is flat, so flip to face up.
 if(g.getAttribute('normal').getY(0)<0){for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];g.setIndex(indices);g.computeVertexNormals();}
 return g;
}
