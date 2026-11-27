import * as T from 'three';

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
 const L=LOOK[style],H=L.height,cyl=(rt:number,rb:number,h:number,n:number,c:string,y:number,open=false,shadow=true)=>{const m=put(new T.CylinderGeometry(rt,rb,h,n,1,open),c,x,base+y,z);m.castShadow=shadow;return m;};
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
/** The place a lamp stands decides its look (deterministic: the site's region, else the street). */
export function lampStyleFor(region:string|undefined):LampStyle{
 return region==='pier'||region==='north-beach'||region==='coral-cay'||region==='east-pier'?'beach':region==='garden'?'park':'town';
}
