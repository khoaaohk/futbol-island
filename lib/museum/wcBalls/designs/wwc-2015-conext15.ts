import type {Decal} from '../decals';
/**
 * 2015 Conext15 (Women's World Cup, Canada), rebuilt EXACT on Oct 6 2026 (docs/museum/BALL_SOURCES.md, row 35).
 *
 * Construction: 6 identical thermally bonded panels on a cube (adidas: "the same ground-breaking technology used in the
 * brazuca"; 3-panel Y-junctions at the 8 cube corners), but the seams measured on the photos are single S-curves along the
 * 12 cube edges (C15_CORE below), not the Brazuca's four-armed 'plus' outline: the Brazuca seam model misses the traced
 * seams by 2.8° rms, this one by under 1°.
 *
 * Print: six cube-face bitmaps (decals) built by scripts/wwc-balls/build_conext15.py from registered photos. The swoosh layout
 * (white panels, a black band swirling round each panel with red, green and blue streaks, inspired by 'earth, wind and fire')
 * repeats with the symmetry measured on the photos; marks: the adidas Badge of Sport (Commons SVG, placed by fitting it to
 * the photo), 'conext15 official match ball' and the FIFA Quality Pro badge (cut from the CC BY-SA 2.0 ANDES photos), the
 * Canada 2015 emblem (enwiki SVG, placed where adidas's WWC image shows it). The ANDES ball is the
 * same Conext15 OMB print as the tournament ball (adidas's launch images, reference only, show the same layout and inks).
 */
/** Seam geometry (ball-local; fitted Oct 6 2026, see docs/museum/BALL_PANELS.md): the cube's 12 edges replaced by S-curves,
 *  offset across the edge by q0 = C15_A·sin(2π·u) (u = 0..1 along the edge, radians on the sphere), so all 12 seams are the
 *  same odd S and the 6 panels identical (chiral, the cube's 24 rotations). C15_A fitted to 12 seam traces on the two CC
 *  ANDES photos (rms 0.98°, median 0.42°; the shared Brazuca outline from D696,737 fits those traces at 2.8°). */
export const C15_A=.503;
const CUBE=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const nrm=(v:number[])=>{const l=Math.hypot(v[0],v[1],v[2]);return v.map(x=>x/l);};
const cross=(a:number[],b:number[])=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const E:number[][][]=[];
for(let a=0;a<6;a++)for(let b=a+1;b<6;b++){const d=CUBE[a][0]*CUBE[b][0]+CUBE[a][1]*CUBE[b][1]+CUBE[a][2]*CUBE[b][2];if(Math.abs(d)>.5)continue;
 const M=nrm(CUBE[a].map((x,i)=>x+CUBE[b][i])),N=nrm(CUBE[a].map((x,i)=>x-CUBE[b][i]));E.push([M,cross(N,M),N]);}
const g3=(v:number[])=>`vec3(${v.map(x=>x.toFixed(6)).join(',')})`;
export const C15_CORE=/* glsl */`
const vec3 C15_M[12]=vec3[](${E.map(e=>g3(e[0])).join(',')});
const vec3 C15_T[12]=vec3[](${E.map(e=>g3(e[1])).join(',')});
const vec3 C15_N[12]=vec3[](${E.map(e=>g3(e[2])).join(',')});
/** Angular distance to the nearest S-seam. */
float c15_edge(vec3 p){const float L=1.2309594,A=${C15_A.toFixed(4)};float e=9.;
 for(int i=0;i<12;i++){float s=atan(dot(p,C15_T[i]),dot(p,C15_M[i]));float q=asin(clamp(dot(p,C15_N[i]),-1.,1.));
  if(abs(s)>L*.5||abs(q)>.6)continue;float u=s/L+.5,q0=A*sin(6.2831853*u),sl=A*6.2831853*cos(6.2831853*u)/L;
  e=min(e,abs(q-q0)/sqrt(1.+sl*sl));}
 return e;}
`;
export default C15_CORE+/* glsl */`
Surf design(vec3 p){float e=c15_edge(p);float pim=vnoise(p*260.);
 // Print comes from the decals; this is the bare white skin shown while they load.
 return Surf(vec3(.88,.88,.87)*(.97+.04*pim),max(panelGroove(e,.012,.035),.06*pim),.58);}
`;
const CREDIT = 'Built from "BALON DEL CAMPEONATO" (15774583044) and (16397047065) (Wikimedia Commons, Agencia de Noticias ANDES, CC BY-SA 2.0): unwrapped, folded over the print\'s symmetry, inks posterised; adidas logo from "Adidas Logo.svg" (Wikimedia Commons, public domain, trademark of adidas AG); FIFA Women\'s World Cup Canada 2015 emblem redrawn from the en.wikipedia non-free SVG (FIFA trademark), placed after adidas\'s WWC ball image (reference only). This bitmap CC BY-SA 2.0';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2015-conext15-${n}.webp`, dir, up, w: .74, h: .74, gloss: .58, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
