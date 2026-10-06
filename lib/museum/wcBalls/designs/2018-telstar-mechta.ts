/** 2018 Telstar Mechta (Russia, knockout stage and final): the Telstar 18 build (6 bonded panels, pixel-mosaic patches) with
 *  the mosaics recoloured in reds, crimson and black. No logos or wordmarks. */
import {ts18Glsl} from './2018-telstar-18';
export default ts18Glsl+/* glsl */`
Surf design(vec3 p){return ts_ball(p,hex(0xf5f5f3),hex(0xc8102e),hex(0x141414),hex(0xe8433a),hex(0xf38b8b));}
`;
