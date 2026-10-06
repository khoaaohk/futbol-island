/**
 * 2006 Teamgeist Berlin (the 9 July 2006 final ball): the Teamgeist's 14 curved panels (6 hourglass propellers + 8 rounded
 * triangles, see 2006-teamgeist.ts) with the propellers filled gold inside their black ribbon and gold contour lines on the
 * white triangles. The match text and the logos are left off.
 */
import {TG_CORE} from './2006-teamgeist';
export default TG_CORE+/* glsl */`
Surf design(vec3 p){return tg_surf(p,true);}
`;
