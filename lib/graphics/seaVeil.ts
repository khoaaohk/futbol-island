// "Seen through water" for the island's sea creatures (Oct 19 2026, user: the whale shark, manta rays and sharks "look like they are
// just floating on top of the water"). ONE shared shader patch used by whaleShark.ts, cayMantas.ts and caySharks.ts:
//  - DEPTH ("the surface layer"): the island's sea floor is a thin stylised layer (the clear window's bed is at most 1.6 m down,
//    waterDepth.ts DEPTH_MAX) while the whale shark's belly is ~4.5 m down, so the animals can NOT use their real depth: they would
//    sink through the bed and the shore slopes. And the ocean plane (opaque, or alpha-blended in the clear window / swim disc) writes
//    the surface depth over everything under it. So every submerged vertex keeps its true screen position but takes the depth of
//    the sea surface ON ITS OWN VIEW RAY, moved SEA_DEPTH_NEAR (12 cm) toward the camera, plus SEA_DEPTH_STEP (1.5 cm) per metre of
//    depth back (clamped at SEA_DEPTH_SPAN), so: anything above the water (land, beach, jetties, boats, the swimmer's head) still
//    hides it; the ocean, the beds, coral, sand and every other thing under the surface never do; a body's own parts (and two
//    animals) keep their real order along each pixel ray (deeper = farther), 1.5 cm per metre, no top/belly z-fight.
//    Why it is exact (Oct 20 2026, user, third report: the whale shark and mantas "going in and out ... show partial", measured: 28%
//    of the whale's pixels lost to the sea's depth test): the depth of a plane is affine in screen space, the rasterizer
//    interpolates depth affinely too, so a triangle whose corners all sit a fixed distance in front of the plane at their OWN pixels
//    stays in front at every pixel between them. That breaks only if a corner is moved off its ray after the squeeze: the old
//    refraction wobble shifted gl_Position.xy (~2 px), onto a farther patch of sea, by more than the 1.6-10 cm margin, so whole
//    strips (the deep rear body, the tail, the lower fins) failed the test frame by frame. The wobble is now a small WORLD-space
//    shift applied BEFORE the squeeze (the vertex stays on its ray), and the margin is 3-12 cm (float32 / 24-bit depth hold it to
//    the 260 m draw distance). A camera within the near plane of the water clamps the surface point to just past the near plane.
//    Parts above the surface (a fin tip, a breaching ray) use their real depth, and a camera under the water uses real depth too.
//    This is also the tier 3-4 (opaque ocean) look: a darker, softer shape under the surface. No extra draw, no state change.
//    tests/manta-rays.cjs and tests/summit-sealife.cjs pin this; docs/water/animals-solid-*.png is the measured proof.
//  - VEIL: below the line the colour loses saturation and contrast, then mixes 55-75% (by depth) toward the local sea colour, with a
//    floor so a faint shape and its markings still read; slow surface light bands slide over it; an optional rim fade (needs
//    normals) softens the silhouette; a slow wobble of the outline stands in for refraction.
// Heat: no extra draws, no textures, no uniform but one shared clock value per consumer; ~three projections per vertex.
import type * as T from 'three';
export const SEA_LEVEL=-.43;
/** The surrounding sea's teal as seen from above (linear working space, close to the ocean material's colour). */
export const SEA_COLOR='vec3(.05,.27,.33)';// Oct 19 2026 audit: lighter, so submerged animals read as soft blue shapes, not dark holes
export const SEA_VEIL_VERTEX_HEAD=`uniform float uVeilTime;varying float vVeilY;varying vec2 vVeilXZ;varying vec3 vVeilW;varying vec3 vVeilN;const float VEIL_SEA=${SEA_LEVEL.toFixed(2)};const float SEA_DEPTH_SPAN=6.;const float SEA_DEPTH_NEAR=.12;const float SEA_DEPTH_STEP=.015;`;
export const SEA_VEIL_FRAGMENT_HEAD=`uniform float uVeilTime;varying float vVeilY;varying vec2 vVeilXZ;varying vec3 vVeilW;varying vec3 vVeilN;const float VEIL_SEA=${SEA_LEVEL.toFixed(2)};const vec3 VEIL_COLOR=${SEA_COLOR};`;
/** After project_vertex (so after any vertex animation in `transformed`). */
export const SEA_VEIL_VERTEX=`
{vec4 vlP=vec4(transformed,1.);vec3 vlN=normal;
#ifdef USE_INSTANCING
 vlP=instanceMatrix*vlP;vlN=mat3(instanceMatrix)*vlN;
#endif
 vec4 vlW=modelMatrix*vlP;vVeilY=vlW.y;vVeilXZ=vlW.xz;vVeilW=vlW.xyz;vVeilN=mat3(modelMatrix)*vlN;
 if(vlW.y<VEIL_SEA&&cameraPosition.y>VEIL_SEA+.005){
  float vlD=VEIL_SEA-vlW.y;
  vlW.xz+=vec2(sin(uVeilTime*.9+vlW.x*.55+vlW.y),cos(uVeilTime*.8+vlW.z*.5))*.035*min(vlD,2.);
  gl_Position=projectionMatrix*viewMatrix*vlW;
  vec3 vlS=cameraPosition+(vlW.xyz-cameraPosition)*((cameraPosition.y-VEIL_SEA)/(cameraPosition.y-vlW.y));
  float vlNear=projectionMatrix[3][2]/(projectionMatrix[2][2]-1.)*1.05,vlV=-(viewMatrix*vec4(vlS,1.)).z;
  if(vlV<vlNear)vlS=cameraPosition+(vlS-cameraPosition)*(vlNear/max(vlV,1e-4));
  vec3 vlDir=normalize(cameraPosition-vlS);
  vec4 vlA=projectionMatrix*viewMatrix*vec4(vlS,1.),vlB=projectionMatrix*viewMatrix*vec4(vlS-vlDir,1.);
  float vlZ=vlA.z/vlA.w,vlSt=vlB.z/vlB.w-vlZ;
  gl_Position.z=(vlZ+vlSt*(min(vlD,SEA_DEPTH_SPAN)*SEA_DEPTH_STEP-SEA_DEPTH_NEAR))*gl_Position.w;}}`;
/** After the colour is final (pattern included): reads and writes diffuseColor. `fade` needs a normal attribute. */
export const seaVeilFragment=(fade:boolean)=>`
{
 vec3 shade=diffuseColor.rgb;
 float dep=max(0.,VEIL_SEA-vVeilY),veil=smoothstep(0.,.5,dep)*(.55+.2*(1.-exp(-dep*.9)));
 shade=mix(shade,vec3(dot(shade,vec3(.3,.59,.11))),.3*step(.01,dep));
 shade=mix(shade,VEIL_COLOR,veil);
 float b1=sin(vVeilXZ.x*.9+uVeilTime*.6+sin(vVeilXZ.y*.7-uVeilTime*.4)*1.3),b2=sin(vVeilXZ.y*1.1-uVeilTime*.5+sin(vVeilXZ.x*.8+uVeilTime*.3)*1.1);
 shade+=vec3(.07,.12,.12)*smoothstep(.55,1.,.25*(b1+b2)+.5)*smoothstep(0.,.4,dep);
 diffuseColor.rgb=shade;
${fade?' float face=abs(dot(normalize(cameraPosition-vVeilW),normalize(vVeilN)));diffuseColor.a=mix(1.,smoothstep(.04,.55,face)*.92+.06,step(.01,dep));':''}
}`;
/** Patch a material's compiled shader. `vertexAnim` runs after begin_vertex, `colorBody` before the veil (a pattern). */
export function patchSeaVeil(shader:T.WebGLProgramParametersWithUniforms,time:{value:number},o:{fade?:boolean;vertexHead?:string;vertexAnim?:string;fragmentHead?:string;colorBody?:string}={}){
 shader.uniforms.uVeilTime=time;
 shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\n'+SEA_VEIL_VERTEX_HEAD+(o.vertexHead??'')).replace('#include <begin_vertex>','#include <begin_vertex>'+(o.vertexAnim??'')).replace('#include <project_vertex>','#include <project_vertex>'+SEA_VEIL_VERTEX);
 shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\n'+SEA_VEIL_FRAGMENT_HEAD+(o.fragmentHead??'')).replace('#include <color_fragment>','#include <color_fragment>'+(o.colorBody??'')+seaVeilFragment(!!o.fade));
}
