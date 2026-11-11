import * as T from 'three';

/** Arcade comic house style (owner ruling, Nov 10 2026): the print shading Breakaway Run introduced, shared by every arcade game.
 * One fragment edit chained onto a game's lit materials (MeshStandard / Lambert / Phong): no pass, no draw, no texture.
 * Light is quantised into a shadow band and a light band (plus a slightly hotter band square to the sun); the turn between the two
 * is a 45 degree halftone screen in screen space, so soft shadow edges and terminators print as Ben-Day dots. Shadows are tinted,
 * not darkened. `rim` materials (characters, balls) also get a sun-side rim and an ink edge of constant pixel width.
 * See README.md in this folder for how a game adopts it. */
export const COMIC_INK='#231a2e',COMIC_PAPER='#fff3d6';

export type ComicParams={
 /** Lit/albedo ratio where the shadow band ends and where the light band starts (three's lights are divided by pi). The defaults fit comicLook()'s sun + hemisphere. */
 bands?:[number,number];
 /** Halftone cell in CSS px (multiplied by the renderer pixel ratio in comicDotCell). */
 dot?:number;
 /** Multiply tints of the two bands: shadows go violet instead of dark, lights go warm. */
 shade?:T.ColorRepresentation;light?:T.ColorRepresentation;
 /** Sun-side rim colour and strength (0 turns it off) on `rim` materials. */
 rim?:T.ColorRepresentation;rimStrength?:number;
 ink?:T.ColorRepresentation;
};
/** One game's uniform set (its palette). Share one set across all of a game's materials; change values live (weather, cup tints). */
export function createComicUniforms(p:ComicParams={}){
 const [lo,hi]=p.bands??[.24,.335];
 return{/** x,y: the lit/albedo ratios where the shadow band ends and the light band starts (three's lights are divided by pi), z: dot cell in px, w: rim strength. */uInkBand:{value:new T.Vector4(lo,hi,p.dot??5,p.rimStrength??1)},
  uInkShade:{value:p.shade===undefined?new T.Color().setRGB(.55,.47,.74):new T.Color(p.shade)},uInkLight:{value:p.light===undefined?new T.Color().setRGB(1,.96,.86):new T.Color(p.light)},
  uInkRim:{value:new T.Color(p.rim??'#ffd98a')},/** Sun direction in VIEW space (aimComicSun keeps it current). */uInkSunV:{value:new T.Vector3(0,.3,-1)},uInkCol:{value:new T.Color(p.ink??COMIC_INK)}};
}
export type ComicUniforms=ReturnType<typeof createComicUniforms>;
/** The halftone cell follows the device pixel ratio so the dots keep their printed size (Breakaway: 3.4 px per ratio unit). */
export function comicDotCell(u:ComicUniforms,renderer:{getPixelRatio():number},cssPx=3.4){u.uInkBand.value.z=cssPx*renderer.getPixelRatio();}
const sunQ=new T.Quaternion();
/** Point the rim at the sun: `dir` is the world-space direction TOWARD the sun; call when the camera or the sun moves. */
export function aimComicSun(u:ComicUniforms,dir:T.Vector3,camera:T.Camera){u.uInkSunV.value.copy(dir).applyQuaternion(sunQ.copy(camera.quaternion).invert());}

export type ComicShaderOptions={
 uniforms:Record<string,T.IUniform>;
 /** Sun rim + ink edge (characters, balls, hero props). */
 rim?:boolean;
 /** Ink edge width multiplier (1 = Breakaway's line). Compile-time. */
 inkWidth?:number;
 /** Lines put before the fragment shader (#define ...). */
 defines?:string;
 /** Extra declarations after <common> (a game's own uniforms / varyings used by its hooks). */
 pars?:string;
 /** GLSL bool expression: shade only when true (a material shared with a renderer that must stay unshaded). */
 gate?:string;
 /** Hooks (GLSL statements). afterLit: may change rkLit / rkT before the bands are cut. afterTone: add to rkCol (glows).
  * rimLight: after rkNV / rkSun exist, before the rim. rimAfter: after the rim, before the ink edge. */
 afterLit?:string;afterTone?:string;rimLight?:string;rimAfter?:string;
};
const PARS=/* glsl */`uniform vec4 uInkBand;uniform vec3 uInkShade,uInkLight,uInkRim,uInkSunV,uInkCol;`;
/** The comic shading edit (fragment side). Skips unlit and depth shaders and never applies twice. */
export function comicShaderEdit<S extends {fragmentShader?:string;uniforms:Record<string,T.IUniform>}>(shader:S,o:ComicShaderOptions):S{
 const f=shader.fragmentShader;if(!f||f.includes('rkLit')||!f.includes('#include <opaque_fragment>')||!f.includes('#include <lights_fragment_begin>'))return shader;
 Object.assign(shader.uniforms,o.uniforms);const w=o.inkWidth??1,n=(v:number)=>{const s=String(+v.toFixed(4));return s.includes('.')?s:s+'.';},wa=w===1?'uInkBand.z*.34':`uInkBand.z*${n(.34*w)}`,wb=w===1?'uInkBand.z*.5':`uInkBand.z*${n(.5*w)}`;
 const frag=/* glsl */`${o.gate?`if(${o.gate})`:''}{vec3 rkBase=diffuseColor.rgb;
 float rkLit=dot(outgoingLight-totalEmissiveRadiance,vec3(.3,.59,.11))/max(dot(rkBase,vec3(.3,.59,.11)),.03);
 vec2 rkP=mat2(.7071,-.7071,.7071,.7071)*gl_FragCoord.xy/uInkBand.z;
 float rkD=length(fract(rkP)-.5)*1.4142,rkT=clamp((rkLit-uInkBand.x)/(uInkBand.y-uInkBand.x),0.,1.);
 ${o.afterLit??''}
 float rkBand=1.-smoothstep(rkT*1.25-.2,rkT*1.25-.05,rkD);
 vec3 rkCol=rkBase*mix(uInkShade,uInkLight,rkBand)*(1.+.1*step(.67,rkLit));
 ${o.afterTone??''}
${o.rim?/* glsl */` float rkNV=1.-abs(dot(normalize(vViewPosition),normal)),rkSun=clamp(dot(normal,uInkSunV)*.6+.5,0.,1.);
 ${o.rimLight??''}
 // Long rim from the low sun: wider on the faces turned to it.
 rkCol=mix(rkCol,uInkRim,smoothstep(.5-.14*rkSun,.6-.14*rkSun,rkNV)*rkSun*uInkBand.w);
 ${o.rimAfter??''}
 // Ink outline of a constant width on screen (distance to the silhouette from the slope of the grazing term), so thin
 // limbs keep their line at phone size; the grazing band stays as the fallback on large round shapes.
 float rkPx=(1.-rkNV)/max(fwidth(rkNV),1e-4)*.5;
 rkCol=mix(rkCol,uInkCol,max(smoothstep(.72,.8,rkNV),(1.-smoothstep(${wa},${wb},rkPx))*smoothstep(.25,.4,rkNV)));
`:''} outgoingLight=rkCol+totalEmissiveRadiance;}
#include <opaque_fragment>`;
 shader.fragmentShader=(o.defines??'')+f.replace('#include <common>','#include <common>\n'+PARS+'\n'+(o.pars??'')).replace('#include <opaque_fragment>',frag);return shader;
}
const defaultKey=T.Material.prototype.customProgramCacheKey;
/** Chain the comic edit onto a material's own shader edits (keeps its onBeforeCompile and program key). For games with no shader
 * chain of their own; a game that already chains edits (Breakaway's route bend) calls comicShaderEdit inside its chain instead. */
export function comicMaterial<M extends T.Material>(m:M,o:ComicShaderOptions,tag='comic-1'):M{
 if(m.userData.comicInk||(m as unknown as T.ShaderMaterial).isShaderMaterial)return m;m.userData.comicInk=true;
 const base=m.onBeforeCompile,baseKey=m.customProgramCacheKey,key=baseKey===defaultKey?base.toString():null;
 m.onBeforeCompile=(shader,renderer)=>{base.call(m,shader,renderer);comicShaderEdit(shader,o);};
 m.customProgramCacheKey=()=>(key??baseKey.call(m))+'|'+tag+(o.rim?'|rim':'')+'|w'+(o.inkWidth??1);
 m.needsUpdate=true;return m;
}
/** comicMaterial for every lit material under `root`; materials (or their objects) flagged userData.comicRim get the rim + ink edge. */
export function comicTree(root:T.Object3D,o:Omit<ComicShaderOptions,'rim'>,tag?:string){root.traverse(obj=>{const mesh=obj as T.Mesh;if(!mesh.isMesh||obj.userData.comicSkip)return;for(const m of Array.isArray(mesh.material)?mesh.material:[mesh.material])if(m&&!m.userData.comicInk)comicMaterial(m,{...o,rim:!!(m.userData.comicRim||obj.userData.comicRim||'beanUniforms' in m)},tag);});}
