/** 2026 Trionda Final (semi-finals, third-place match and final): the Trionda's 4 identical bonded pinwheel panels (geometry
 *  and print layout shared from 2026-trionda.ts) in the colours of the best photo (Commons "Trionda Final.jpg", Vincent Bush,
 *  CC BY-SA 4.0): white panels, the 12 fields black with rows of gold lettering (the four final host-city names; drawn as
 *  abstract strokes), gold outlines, gold ribbons and the gold centre triangles. Fox Sports gives gold/black/white, Wikipedia
 *  gold/black/red; the photo shows no red, so none is used. */
import {trGlsl} from './2026-trionda';
export default trGlsl+/* glsl */`
Surf design(vec3 p){return tr_ball(p,true);}
`;
