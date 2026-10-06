import type {Decal} from '../decals';
/**
 * 1999 Icon (Women's World Cup, USA), rebuilt Oct 6 2026. Construction: the Tricolore build (32 hand-stitched panels, 12
 * pentagons + 20 hexagons, syntactic-foam skin; Wikipedia: "technically identical to the Tricolore"); the shader draws the
 * white skin, seams and stitching, and six cube-face decals carry the print.
 * Print (Smithsonian NMAAHC 2015.58.15 record; photos below): the Tango triad on all 20 hexagons, each triad navy with one
 * city 'icon' in a second ink (red Golden Gate Bridge, teal Statue of Liberty with stars, pink film camera and Walk-of-Fame
 * star, lime-yellow portrait and circuit-board, orange skylines), a double navy line along each concave side; 'ICON' with
 * three red stars, 'OFFICIAL MATCH BALL OF THE FIFA WOMEN'S WORLD CUP 1999' and the adidas EQUIPMENT logo on three pentagons.
 * Built by scripts/wwc-balls/build_icon.py: each triad posterised from the best-facing registered photograph — the
 * original 1999 ball (football-balls.com studio photo) where it shows the triad, otherwise the 2024 adidas reissue IW5503
 * (adidas product photos, whose triads match the original on every triad both show) — and the three marks from the
 * original. All photos are reference only; every decal pixel is our own posterised redraw.
 * NOT exact: 9 of the 20 triads appear in no photo we could use; each takes its antipode's icon (the seen antipodal pairs
 * all share their icon) turned by the ball's 2-fold symmetry, so their art and its turn are inferred. The other pentagon
 * texts (FIFA APPROVED 202.P7R, the guarantee and pressure texts) and the reflective star overlay are not drawn: no photo
 * shows where they sit.
 */
export default /* glsl */`
float wic_honey(vec2 q){vec2 s=vec2(1.,1.7320508);vec2 a=mod(q,s)-s*.5,b=mod(q-s*.5,s)-s*.5;vec2 g=dot(a,a)<dot(b,b)?a:b;
 g=abs(g);return .5-max(dot(g,normalize(s)),g.x);}
Surf design(vec3 p){
 Cell c=truncIcoCell(p);
 vec3 N=c.c,f1=normalize(cross(N,vec3(.31,.52,.79))),f2=cross(N,f1);vec2 pq=vec2(dot(p,f1),dot(p,f2))/dot(p,N);
 float hc=wic_honey(pq*95.);
 vec3 col=hex(0xf2f2ee)*(.975+.03*fbm(p*40.));
 col*=.94+.06*smoothstep(.02,.16,hc);
 col*=1.-.04*(1.-smoothstep(.0,.04,c.edge));
 float g=panelGroove(c.edge,.009,.05);
 float st=stitches(p,c,.03,.005);col=mix(col,col*.8,st*.35);
 return Surf(col,g,.5);}
`;
const CREDIT = 'Redrawn (posterised to the ball\'s inks) by Futbol Island from photographs of the 1999 ball and of the 2024 adidas reissue used as reference only; 9 triads inferred; adidas, ICON and FIFA marks are trademarks of their owners';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-1999-icon-${n}.webp`, dir, up, w: .74, h: .74, gloss: .5, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
