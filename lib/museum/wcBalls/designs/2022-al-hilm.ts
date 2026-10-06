/** 2022 Al Hilm (Qatar, semi-finals and final): the Al Rihla build (20 bonded panels: 8 triangles + 12 thin propellers)
 *  on a pale gold base, with the propellers and triangle-edge dashes in maroon and deep red. No logos or wordmarks. */
import {arGlsl} from './2022-al-rihla';
export default arGlsl+/* glsl */`
Surf design(vec3 p){return ar_ball(p,hex(0xd9c79a),hex(0xc0283a),hex(0x7a1f2e),hex(0xe0b85a),hex(0xc0283a),hex(0x4a0a17),.66);}
`;
