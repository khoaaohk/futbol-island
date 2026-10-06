/**
 * 2014 Brazuca Final Rio (the 13 July 2014 final ball): the Brazuca's 6 interlocking propeller panels (see
 * 2014-brazuca.ts) with gold swooshes edged in black and green bands on white. The match text and logos are left off.
 */
import {BZ_CORE} from './2014-brazuca';
export default BZ_CORE+/* glsl */`
Surf design(vec3 p){return bz_surf(p,1);}
`;
