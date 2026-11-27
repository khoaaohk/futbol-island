import * as T from 'three';
import {subscribeHeatTier,effectiveTier} from '../graphics/heatTier';
import {puffLevel,roundCyl,domeCap,puffBall} from '../graphics/softBox';

// Promenade lamp (owner, Nov 26 2026, shot 145: "fix these light poles so they don't feel so generic and blocky"). Replaces the
// black square stick on a puck under a flat slab: a stepped octagonal plinth SUNK 0.15 m into the ground (its grounding), a tapered
// round post with a collar, a seat, a six-sided lantern whose glass is the shared '#ffe8ae' lamp lens (so the night glow and the
// light pools stay exactly as they were), three frame bars, an eave ring, a hipped cap and a finial. Three looks, chosen by place:
//  - 'beach' (North Beach, the pier, Coral Cay, the east pier): white post, sea-green lantern, a rope-coloured collar;
//  - 'town' (streets, squares, venue doors): dark green cast iron;
//  - 'park' (garden paths): the same iron, a shorter post.
// Same plain paints (the chunk batches merge them: no new draw); the body casts a shadow now (the lens does not), ~230 triangles.
// `?ground=0` (grounding.ts) keeps the old lamp: callers pick oldLamp then.
export type LampStyle='beach'|'town'|'park';
export const LAMP_LENS='#ffe8ae';
const LOOK:Record<LampStyle,{post:string;trim:string;collar:string;height:number}>={
 beach:{post:'#eef0e8',trim:'#3f8f86',collar:'#c9a66b',height:3.55},
 town:{post:'#2f4a3c',trim:'#22302a',collar:'#2f4a3c',height:3.55},
 park:{post:'#384443',trim:'#2f4a3c',collar:'#384443',height:2.95}};
export type LampPut=(g:T.BufferGeometry,colour:string,x:number,y:number,z:number)=>T.Mesh;
/** Builds one lamp standing on `base` (the drawn ground) at (x, z). Returns the lantern's centre height (for pools / colliders). */
export function lampPost(put:LampPut,x:number,z:number,base:number,style:LampStyle):number{
 const L=LOOK[style],H=L.height,at:[number,number,number]=[x,base+H*.5,z];
 // every body piece of the detailed lamp is near-only (world.ts draws it within LAMP_LOD.near m); the lens is shared by both
 const near=(m:T.Mesh)=>{m.userData.lampNear=at;return m;};
 const put0=put;put=(g,c,px,py,pz)=>{const m=put0(g,c,px,py,pz);if(c!==LAMP_LENS)near(m);return m;};
 const cyl=(rt:number,rb:number,h:number,n:number,c:string,y:number,open=false,shadow=true)=>{const m=put(new T.CylinderGeometry(rt,rb,h,n,1,open),c,x,base+y,z);m.castShadow=shadow;return m;};
 farLamp(put0,x,z,base,style,at);
 if(puffLevel()>0){// Inflate pass 2 (owner shot 180: "make all the lights more rounded too instead of sharp corners"): rolled plinth step,
  // round collar and seat, an 8-sided lantern, a rolled eave ring and a domed cap with a ball finial (same heights, lens, glow, LOD).
  const rc=(rt:number,rb:number,h:number,c:string,y:number,e?:number,shadow=true)=>{const m=put(roundCyl(rt,rb,h,8,e,true),c,x,base+y,z);m.castShadow=shadow;return m;};
  cyl(.17,.21,.37,8,style==='beach'?'#d9d3c4':L.trim,.035,true);rc(.12,.145,.2,style==='beach'?'#d9d3c4':L.trim,.32,.06);
  cyl(.048,.07,H-.42,8,L.post,.42+(H-.42)/2,true);
  rc(.085,.085,.08,L.collar,1.05,.03);if(style==='beach')rc(.081,.081,.05,L.collar,1.16,.02);
  const g0=H+.06;rc(.13,.075,.12,L.trim,H,.04);
  cyl(.165,.12,.36,8,LAMP_LENS,g0+.18,false,false);
  for(let k=0;k<3;k++){const a=k/3*Math.PI*2,bar=put(new T.BoxGeometry(.03,.38,.03),L.trim,x+Math.cos(a)*.142,base+g0+.18,z+Math.sin(a)*.142);bar.rotation.y=-a;bar.rotation.z=-.125;}
  rc(.205,.205,.06,L.trim,g0+.38,.028);const cap=put(domeCap(.23,.2,8),L.trim,x,base+g0+.4,z);cap.castShadow=true;
  put(puffBall(.05),L.trim,x,base+g0+.64,z).castShadow=true;
  return base+g0+.18;}
 // stepped plinth: a wide foot 0.15 m into the ground, a narrower step, then the post
 cyl(.17,.21,.37,8,style==='beach'?'#d9d3c4':L.trim,.035);cyl(.115,.14,.2,8,style==='beach'?'#d9d3c4':L.trim,.32);
 cyl(.048,.07,H-.42,8,L.post,.42+(H-.42)/2,true);
 cyl(.083,.083,.08,8,L.collar,1.05,true);if(style==='beach')cyl(.079,.079,.05,8,L.collar,1.16,true);
 // lantern: seat, glass (the shared lens), three frame bars, eave ring, cap, finial
 const g0=H+.06;cyl(.13,.07,.12,6,L.trim,H);
 cyl(.165,.12,.36,6,LAMP_LENS,g0+.18,false,false);
 for(let k=0;k<3;k++){const a=k/3*Math.PI*2,bar=put(new T.BoxGeometry(.03,.38,.03),L.trim,x+Math.cos(a)*.142,base+g0+.18,z+Math.sin(a)*.142);bar.rotation.y=-a;bar.rotation.z=-.125;/* leans out with the tapered glass */}
 cyl(.2,.2,.04,6,L.trim,g0+.38,true);cyl(.02,.23,.2,6,L.trim,g0+.5);
 const fin=put(new T.OctahedronGeometry(.045,0),L.trim,x,base+g0+.63,z);fin.scale.y=1.4;
 return base+g0+.18;
}
/** Far lamps (Leftovers A, Nov 26 night: ~122 lamps at ~230 triangles each, no far version). Every lamp also builds a cheap twin
 *  (userData.lampFar: 72 triangles; the lens is the same piece for both): a 6-sided plinth (foot and step in one), a 6-sided post, the
 *  lantern's seat, three frame bars and one cone for cap, eave and finial. world.ts orders each 50 m paint batch [far twins | the rest | kerb | near lamps]
 *  and picks one contiguous draw range per frame (onBeforeRender, a few distance checks per chunk): the detailed lamps while any lamp
 *  of the chunk is within LAMP_LOD.near m of the camera, the twins beyond. 0 draws, 0 materials; the shadow pass draws the twins. */
export const LAMP_LOD={near:60,nearHot:32} as const;
let hot=false,watching=false;
/** The squared switch distance now (heat tier 2 and up: the twins from LAMP_LOD.nearHot m). One subscription, no per-frame reads. */
/** `?lamplod=0`: always the detailed lamps (before / after); `?lamplod=far`: always the twins (checks). */
const lodQuery=(()=>{try{return typeof window!=='undefined'&&window.location?(/[?&]lamplod=(0|far)(&|$)/.exec(window.location.search)?.[1]??null):null;}catch{return null;}})();
/** Measuring hook (scripts / tests): 'near' or 'far' forces one set for the next frames; null = by distance. */
export const lampLodDebug:{force:null|'near'|'far'}={force:null};
if(typeof window!=='undefined')(window as unknown as {__lampLod?:unknown}).__lampLod=lampLodDebug;
export function lampNear2(){const f=lampLodDebug.force??(lodQuery==='0'?'near':lodQuery==='far'?'far':null);if(f)return f==='near'?Infinity:0;if(!watching){watching=true;try{hot=effectiveTier()>=2;subscribeHeatTier(()=>{hot=effectiveTier()>=2;});}catch{hot=false;}}const d=hot?LAMP_LOD.nearHot:LAMP_LOD.near;return d*d;}
/** Triangles in one far twin (tests). */
export const FAR_LAMP_TRIANGLES=72;
function farLamp(put:LampPut,x:number,z:number,base:number,style:LampStyle,at:[number,number,number]){
 const L=LOOK[style],H=L.height,g0=H+.06,far=(g:T.BufferGeometry,c:string,y:number)=>{const m=put(g,c,x,base+y,z);m.userData.lampFar=at;m.castShadow=true;return m;};
 const noCaps=(g:T.CylinderGeometry,keep:'top'|'bottom'|'none')=>{const idx=g.index!,gr=g.groups,out:number[]=[];for(let k=0;k<gr.length;k++){const mi=gr[k].materialIndex;if(mi===1&&keep!=='top')continue;if(mi===2&&keep!=='bottom')continue;for(let i=gr[k].start;i<gr[k].start+gr[k].count;i++)out.push(idx.getX(i));}g.setIndex(out);g.clearGroups();return g;};
 // plinth: the foot's radius at the ground to the step's at its top (6 sides, top cap, no bottom: 18)
 far(noCaps(new T.CylinderGeometry(.13,.2,.57,6,1),'top'),style==='beach'?'#d9d3c4':L.trim,.135);
 far(new T.CylinderGeometry(.052,.068,H-.42,6,1,true),L.post,.42+(H-.42)/2);// post (12)
 far(new T.CylinderGeometry(.13,.07,.12,6,1,true),L.trim,H);// seat (12)
 // the three frame bars as thin 3-sided prisms leaning out with the glass (18): without them the far glass read paler than the near
 for(let k=0;k<3;k++){const a=k/3*Math.PI*2,g=new T.CylinderGeometry(.017,.017,.38,3,1,true);g.rotateZ(-.125);g.rotateY(-a);const m=put(g,L.trim,x+Math.cos(a)*.142,base+g0+.18,z+Math.sin(a)*.142);m.userData.lampFar=at;m.castShadow=true;}
 far(noCaps(new T.CylinderGeometry(0,.23,.3,6,1),'bottom'),L.trim,g0+.51);// cap, eave and finial as one cone (12: its underside is the eave seen from below)
}
/** The place a lamp stands decides its look (deterministic: the site's region, else the street). */
export function lampStyleFor(region:string|undefined):LampStyle{
 return region==='pier'||region==='north-beach'||region==='coral-cay'||region==='east-pier'?'beach':region==='garden'?'park':'town';
}
