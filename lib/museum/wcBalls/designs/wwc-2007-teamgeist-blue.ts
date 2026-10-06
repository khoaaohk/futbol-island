import type {Decal} from '../decals';
/**
 * 2007 Teamgeist (Women's World Cup, China; 'Teamgeist Blue'), rebuilt Oct 6 2026 (docs/museum/BALL_SOURCES.md, row 33).
 *
 * Construction: the +Teamgeist's 14 thermally bonded panels (6 hourglass propellers + 8 rounded triangles, TG_CORE from
 * 2006-teamgeist.ts; adidas: "the same performance characteristics as the +Teamgeist").
 *
 * Print: six cube-face bitmaps (decals), a posterised REDRAW (flat inks: white, silver keyline, Chinese red, royal blue)
 * traced by scripts/wwc-balls/build_tg07.py from the only photo of the real match ball found (a signed WWC 2007 match ball on
 * Flickr, all rights reserved: used for registration, measurement and tracing only, no photo pixels are shipped). Each
 * propeller carries a royal-blue lobe at each end, joined by a diagonal blue band through the waist, wrapped by a red line and
 * a white gap and red/silver swirl stripes that trail across the triangles; the six propellers are traced once in propeller
 * coordinates (they are congruent under the ball's tetrahedral rotations) from every propeller the photo shows. The +TEAMGEIST
 * roundel (white/red on blue) sits on one lobe. Not traced (unreadable or unseen in the photo): the small white lettering
 * along the blue lobes, the FIFA Women's World Cup China 2007 emblem and the adidas mark (their positions are not shown by any
 * photo found), so they are left off rather than guessed.
 */
import {TG_CORE} from './2006-teamgeist';
export default TG_CORE+/* glsl */`
Surf design(vec3 p){
 float dmin=9.;for(int i=0;i<6;i++){vec2 uv;dmin=min(dmin,tg_prop(p,i,uv));}
 vec3 a=abs(p);float edge=dmin<0.?-dmin:min(dmin,asin(min(a.x,min(a.y,a.z))));
 // Print comes from the decals; this is the bare white skin shown while they load.
 return Surf(vec3(.9,.9,.88),seamLine(edge,.009),.55);}
`;
const CREDIT = 'Redrawn (flat inks) by Futbol Island after a photo of a 2007 FIFA Women\'s World Cup match ball (Flickr, ykyeco, all rights reserved; used as a reference only, no photo pixels reproduced)';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2007-teamgeist-blue-${n}.webp`, dir, up, w: .74, h: .74, gloss: .55, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
