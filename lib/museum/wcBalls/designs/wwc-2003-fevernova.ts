import type {Decal} from '../decals';
/**
 * 2003 Fevernova (Women's World Cup, USA), rebuilt Oct 6 2026. Construction: the 2002 Fevernova (32 hand-stitched panels,
 * 12 pentagons + 20 hexagons, syntactic foam; Wikipedia: "technically identical to the Fevernova"); the skin and seams are
 * drawn here, the print comes from six cube-face decals (transparent where the ball is bare).
 * Print ("new Fevernova design for USA 2003", FIFA): four identical tetrahedral motifs, each a navy core on a hexagon, three
 * hooked gold arms with a thin navy keyline and red flame bursts running from the core along each arm. The motif is redrawn
 * in its four inks (gold #b79850, red #b51f10, navy #0a2979 on the pearl skin, measured on the studio views) from four
 * registered studio photographs of the ball (one per motif), voted over the 12 rotations of the tetrahedral group.
 * Core marks, each from the view that faces it: 'FEVERNOVA™ / adidas / size 5', 'OFFICIAL MATCH BALL / USA 2003 emblem /
 * ©2003 FIFA TM', the adidas Badge of Sport + wordmark, 'FIFA APPROVED 202.X3U'; navy text round the valve pentagon
 * ('made in Morocco', 'Druck-pression-pressure', 'engineered in Germany', 'B 77 09 03').
 * The photographs (a retailer's studio set of the ball, and football-balls.com) are reference only: every pixel in the
 * decals is our own posterised redraw. Which core sits on which of the four motifs, and each core mark's turn, follow the
 * registrations of single-core views and are not cross-checked by a view showing two cores (see BALL_SOURCES.md).
 */
export default /* glsl */`
float fv3_foam(vec2 q){q/=.037;vec2 s=vec2(1.,1.7320508);vec2 a=mod(q,s)-s*.5,b=mod(q-s*.5,s)-s*.5;vec2 g=dot(a,a)<dot(b,b)?a:b;return length(g);}
Surf design(vec3 p){
 Cell c=truncIcoCell(p);
 vec3 N=c.c,f1=normalize(cross(N,vec3(.31,.52,.79))),f2=cross(N,f1);vec2 pq=vec2(dot(p,f1),dot(p,f2))/dot(p,N);
 float cell=fv3_foam(pq);
 vec3 col=hex(0xedeeea)*(.975+.035*fbm(p*30.));
 col*=1.-.09*smoothstep(.36,.46,cell)*(1.-smoothstep(.46,.5,cell));
 col*=1.-.04*(1.-smoothstep(.0,.04,c.edge));
 float g=panelGroove(c.edge,.009,.045);
 return Surf(col,g,.55);}
`;
const CREDIT = 'Redrawn (posterised to the ball\'s four inks) by Futbol Island from registered photographs of the 2003 ball used as reference only; adidas, Fevernova and FIFA marks are trademarks of their owners';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2003-fevernova-${n}.webp`, dir, up, w: .74, h: .74, gloss: .6, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
 // The valve pentagon (at a flame tip of the 'USA 2003' motif, between the adidas and FIFA APPROVED motifs): care text ring and the outlined valve mark.
 {src: '/museum/wcballs/decals/wwc-2003-fevernova-7.webp', dir: [0, -.5257, .8507], up: [-.9842, -.1507, -.0931], w: .42, h: .42, gloss: .6, credit: CREDIT},
];
