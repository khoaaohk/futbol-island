import * as T from 'three';
import {SHORE_GLSL,SWIM_CLEAR,SWIM_CLEAR_UNIFORMS,WATER_UNIFORMS} from './waterSurface';

/**
 * The swimmer's clear water (Oct 19 2026, docs/water-look-research.md §4, phase 1; docs/performance-guide.md "Swimmer clear disc").
 * The island ocean is opaque, and a swimmer's rig sits under its plane, so the legs and the kick were never drawn. While the
 * player swims (swim pose w > 0):
 *  - the ocean ('surrounding-ocean', world.ts) switches to normal alpha blending and draws after the other opaque meshes
 *    (createOceanClear's render order). It keeps writing depth, so sprites and rings under the surface (the player's ground
 *    marker at the root, splash bits) stay hidden exactly as today; the body and the seabed are opaque, drawn first. Its shader lowers alpha inside a SWIM_CLEAR.radius disc round the
 *    swimmer (one vec2 + one float uniform, eased; waterSurface.ts SWIM_CLEAR_GLSL);
 *  - one opaque quad (the "virtual seabed", SWIM_BED) sits under the disc at the shelf depth so the see-through water shows the
 *    sea's own colour (the ocean's material and depth gradient off the same island field, a little deeper), not the sky behind
 *    it, with a soft dark ellipse (the swimmer's shadow) in its middle: the disc itself does not read, only what is in it;
 *  - the player's bean parts take the underwater look below the water line (beanSkin.ts BEAN_UNDER, per-material `beanUnder`).
 * Off (strength 0) everything is restored exactly: the ocean's blending, blend factors and render order, the quad
 * hidden, beanUnder 0. The program swap is between two cached programs (the first swim compiles the blended one once).
 * Nothing is allocated per frame. Works on every heat tier (one disc, one quad).
 */
export const SWIM_CLEAR_FADE=.35;
/** How fast the dive clears the disc: full at 1 / SWIM_DIVE_CLEAR of the way under (also the body's underwater-tint floor, Town.tsx). */
export const SWIM_DIVE_CLEAR=3;
/** The seabed quad: half-size (covers the disc plus the parallax of looking down through ~1.6 m of water), colour, shadow. */
export const SWIM_BED={half:SWIM_CLEAR.radius+4,deep:1.02,shadow:.5,shadowR:[.55,.95] as const,floor:.55} as const;

type Saved={blending:T.Blending;blendSrc:T.BlendingSrcFactor;blendDst:T.BlendingDstFactor;blendEquation:T.BlendingEquation;blendSrcAlpha:number|null;blendDstAlpha:number|null;blendEquationAlpha:number|null;renderOrder:number};
/**
 * The ocean's blended state, shared by the swim disc and the clear water window (lib/town/water/clearWindow.ts): the first holder
 * saves the render state and switches it, the last one to let go restores it exactly. The count and the saved state live on the
 * ocean mesh's userData (oceanBlend / oceanBlendSaved), the late render order on the shared oceanBaseOrder / oceanLate counters
 * (createOceanClear uses the same ones), so no holder ever restores a stale value.
 */
export function createOceanBlend(scene:T.Scene){
 let ocean:T.Mesh|null=null,held=false;
 const material=()=>{ocean??=(scene.getObjectByName('surrounding-ocean') as T.Mesh|undefined)??null;const m=ocean?.material;return m&&!Array.isArray(m)?m:null;};
 return {
  hold(){
   const m=material();if(held||!ocean||!m)return;held=true;const u=ocean.userData;u.oceanBlend=(u.oceanBlend??0)+1;if(u.oceanBlend>1)return;
   u.oceanBlendSaved={blending:m.blending,blendSrc:m.blendSrc,blendDst:m.blendDst,blendEquation:m.blendEquation,blendSrcAlpha:m.blendSrcAlpha,blendDstAlpha:m.blendDstAlpha,blendEquationAlpha:m.blendEquationAlpha,renderOrder:ocean.renderOrder} satisfies Saved;
   m.blending=T.CustomBlending;m.blendSrc=T.SrcAlphaFactor;m.blendDst=T.OneMinusSrcAlphaFactor;m.blendEquation=T.AddEquation;
   // The canvas keeps its alpha (1): blending the alpha channel too would let the page behind the canvas show through the disc.
   m.blendSrcAlpha=T.ZeroFactor;m.blendDstAlpha=T.OneFactor;m.blendEquationAlpha=T.AddEquation;
   u.oceanBaseOrder??=ocean.renderOrder;u.oceanLate=(u.oceanLate??0)+1;ocean.renderOrder=Math.max(u.oceanBaseOrder,.25);m.needsUpdate=true;
  },
  release(){
   const m=material();if(!held||!ocean||!m)return;held=false;const u=ocean.userData;u.oceanBlend=Math.max(0,(u.oceanBlend??1)-1);if(u.oceanBlend)return;
   const sv=u.oceanBlendSaved as Saved;u.oceanBlendSaved=null;
   m.blending=sv.blending;m.blendSrc=sv.blendSrc;m.blendDst=sv.blendDst;m.blendEquation=sv.blendEquation;m.blendSrcAlpha=sv.blendSrcAlpha;m.blendDstAlpha=sv.blendDstAlpha;m.blendEquationAlpha=sv.blendEquationAlpha;
   u.oceanLate=Math.max(0,(u.oceanLate??1)-1);if(!u.oceanLate)ocean.renderOrder=u.oceanBaseOrder;m.needsUpdate=true;
  },
  get held(){return held;},
 };
}
type BeanPart={material:T.Material|T.Material[]};
const underOf=(m:T.Material|T.Material[])=>Array.isArray(m)?undefined:(m as {beanUniforms?:{beanUnder?:{value:number}}}).beanUniforms?.beanUnder;

export function createSwimClear(scene:T.Scene){
 let k=0,hideBed=false,lastBody:readonly BeanPart[]|null=null;
 const bedUniforms={uSwimShadow:{value:0}};
 // The ocean's own material values (world.ts oceanMat) and depth gradient (waterSurface.ts), so the blend matches the sea.
 const bedMat=new T.MeshStandardMaterial({color:'#368eb3',emissive:'#185a94',emissiveIntensity:.3,roughness:.52,metalness:.02});
 bedMat.onBeforeCompile=sh=>{
  Object.assign(sh.uniforms,WATER_UNIFORMS,bedUniforms);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vBedP,vBedXZ;').replace('#include <project_vertex>','#include <project_vertex>\nvBedP=position.xz;vBedXZ=(modelMatrix*vec4(transformed,1.)).xz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vBedP,vBedXZ;uniform float uSwimShadow;\n'+SHORE_GLSL)
   .replace('#include <color_fragment>',`#include <color_fragment>
   {float d=isleSample(vBedXZ).r;vec3 shallowC=mix(vec3(.17,.56,.57),vec3(.05,.42,.53),smoothstep(.3,5.,d));
    diffuseColor.rgb=mix(diffuseColor.rgb*.95,shallowC,(1.-smoothstep(3.,24.,d))*.85)*${SWIM_BED.deep.toFixed(2)};
    // Out past the shallows the floor sinks into the dark sea (no pale patch): darker and bluer with the shore distance.
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.1,.4,.46),smoothstep(6.,24.,d)*.6);
    float e=length(vBedP/vec2(${SWIM_BED.shadowR[0].toFixed(2)},${SWIM_BED.shadowR[1].toFixed(2)}));diffuseColor.rgb*=1.-uSwimShadow*(1.-smoothstep(.35,1.,e));}`);
 };
 bedMat.customProgramCacheKey=()=>'swim-bed-v2';
 const bedGeo=new T.PlaneGeometry(SWIM_BED.half*2,SWIM_BED.half*2);bedGeo.rotateX(-Math.PI/2);
 const bed=new T.Mesh(bedGeo,bedMat);bed.name='swim-seabed';bed.visible=false;bed.castShadow=false;bed.receiveShadow=false;bed.frustumCulled=false;
 bed.matrixAutoUpdate=false;scene.add(bed);
 const blend=createOceanBlend(scene),open=()=>blend.hold(),close=()=>blend.release();
 const setBody=(body:readonly BeanPart[]|null,v:number)=>{if(!body)return;for(let i=0;i<body.length;i++){const u=underOf(body[i].material);if(u&&u.value!==v)u.value=v;}};
 return {
  /**
   * Once per frame. `swimW` the swim pose weight (0 = not swimming), (x, z, yaw) the swimmer, `depth` the shelf depth there
   * (waterDepth.ts depthForDistance of the probe's distance), `body` the player's bean parts (beanSkinOf(player).meshes), `dive`
   * 0..1 how far into a dive (waterState under): out in deep water the disc clears further (SWIM_CLEAR.diveAlpha).
   */
  update(dt:number,x:number,z:number,yaw:number,swimW:number,depth:number,waterY:number,rootDepth:number,body:readonly BeanPart[]|null,dive=0){
   const target=swimW>0?1:0;
   if(target===0&&k===0&&!blend.held){if(lastBody){setBody(lastBody,0);lastBody=null;}return;}
   k=target>k?Math.min(target,k+dt/SWIM_CLEAR_FADE):Math.max(target,k-dt/SWIM_CLEAR_FADE);
   if(k>0)open();
   const s=k*k*(3-2*k);
   SWIM_CLEAR_UNIFORMS.uSwimClear.value=s;SWIM_CLEAR_UNIFORMS.uSwimXZ.value.set(x,z);
   // Oct 19 2026: the disc clears as the head goes under (full at a third of the dive, eased fast), not at the bottom: on the way down
   // (head first, seen end on) the body was lost under the open sea's 0.86 alpha.
   {const dv=Math.max(0,Math.min(1,dive*SWIM_DIVE_CLEAR))*s,u=SWIM_CLEAR_UNIFORMS.uSwimDive;u.value+=(dv-u.value)*Math.min(1,dt*10);if(u.value<1e-3&&dv===0)u.value=0;}
   bedUniforms.uSwimShadow.value=SWIM_BED.shadow*s;
   if(body!==lastBody){setBody(lastBody,0);lastBody=body;}
   setBody(body,s);
   if(k>0){bed.visible=!hideBed;bed.position.set(x,waterY-Math.max(depth,rootDepth+SWIM_BED.floor),z);bed.rotation.set(0,yaw,0);bed.updateMatrix();}
   else{bed.visible=false;close();setBody(lastBody,0);lastBody=null;}
  },
  get strength(){return k;},
  get open(){return blend.held;},
  /** The clear water window draws its own seabed and coral: the disc's quad would cover them (clearWindow.ts). */
  set hideBed(v:boolean){hideBed=v;if(v)bed.visible=false;},
  dispose(){close();SWIM_CLEAR_UNIFORMS.uSwimClear.value=0;SWIM_CLEAR_UNIFORMS.uSwimDive.value=0;setBody(lastBody,0);bed.removeFromParent();bedGeo.dispose();bedMat.dispose();},
 };
}
export type SwimClear=ReturnType<typeof createSwimClear>;
