import * as T from 'three';
import {PART,base,clamp,heelBorder,heelCounterTop,hsec,rim,sAt,shape,surface,tongueAnchor} from './bootGeometry';
import type {Collar,ColourZone,DecalZone,Laces} from './boots';

/**
 * Where stickers, flags and words may go on the active boot shape (Oct 12 2026), split out of bootScene.ts so the tests can check
 * every silhouette's safe areas without a browser. A zone maps (x, y) ∈ [−1, 1]² to a ray that projects onto the upper:
 *  - outside / inside: across the wall from heel to toe, between the plate and the collar (or 78 % of the wall height);
 *  - heel: above the heel counter (low on the classics, tall on the speed cage) and below the padded collar;
 *  - toe: the front of the toe box; tongue: the tongue (a fold-over flap is aimed at from above), else the vamp or collar front.
 * All of it follows the active shape (bootGeometry.ts useShape), so it is computed per call: tiny numbers, no geometry.
 */
export type ZoneRay={o:T.Vector3;d:T.Vector3;up:T.Vector3};
export type ZoneCtx={collar:Collar;laces:Laces};
export const ZONE_SIZE:Record<DecalZone,number>={outside:.12,inside:.12,toe:.075,heel:.07,tongue:.06};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const inv=(a:number,b:number,v:number)=>(v-a)/(b-a);
export const SIDE_X0=-.62,SIDE_X1=.66;
export function sideY(X:number){const s=sAt(X),top=Math.min(.78*hsec(s),s<.4?rim(s)-.11:1);return {y0:base(s)+.1,y1:base(s)+Math.max(.2,top)};}
/** The heel band (above base(0)): over the counter, under the padded collar. */
export function heelBand(){const y1=rim(0)-.12,y0=Math.min(y1-.2,Math.max(.12,heelCounterTop()+.06));return {y0,y1};}
const TOE_D=new T.Vector3(-.6,-.45,-.66).normalize();
function planeBasis(d:T.Vector3){const r=new T.Vector3().crossVectors(d,new T.Vector3(0,1,0)).normalize(),u=new T.Vector3().crossVectors(r,d).normalize();return {r,u};}
function toeAnchor(){return {t0:surface(.84,Math.PI*.68),d:TOE_D,rx:.13,ry:.07};}
function anchor(zone:'toe'|'tongue',ctx:ZoneCtx){return zone==='toe'?toeAnchor():tongueAnchor(ctx.collar,ctx.laces);}
export function zoneRay(zone:DecalZone,x:number,y:number,ctx:ZoneCtx):ZoneRay{
 const up=new T.Vector3(0,1,0);
 if(zone==='outside'||zone==='inside'){
  // inside: mirror x so "forward" on screen stays toward the toe when you look at the inside wall (and take the wall's height
  // band at that mirrored spot: before Oct 12 2026 it came from the unmirrored one, so inside decals sat off their band)
  const sgn=zone==='outside'?1:-1,X=zone==='inside'?lerp(SIDE_X1,SIDE_X0,(x+1)/2):lerp(SIDE_X0,SIDE_X1,(x+1)/2),{y0,y1}=sideY(X),Y=lerp(y0,y1,(y+1)/2);
  return {o:new T.Vector3(X,Y,3*sgn),d:new T.Vector3(0,0,-sgn),up};}
 if(zone==='heel'){const {y0,y1}=heelBand(),Y=base(0)+lerp(y0,y1,(y+1)/2),Z=lerp(-.13,.13,(x+1)/2);return {o:new T.Vector3(-3,Y,Z),d:new T.Vector3(1,0,0),up};}
 const a=anchor(zone,ctx),{r,u}=planeBasis(a.d);
 const t=a.t0.clone().addScaledVector(r,x*a.rx).addScaledVector(u,y*a.ry);
 return {o:t.addScaledVector(a.d,-3),d:a.d.clone(),up:u};
}
/** Inverse: a point on the boot → the zone's (x, y), clamped to the safe area. */
export function zoneParams(zone:DecalZone,p:T.Vector3,ctx:ZoneCtx){
 let x=0,y=0;
 if(zone==='outside'||zone==='inside'){x=inv(SIDE_X0,SIDE_X1,p.x)*2-1;if(zone==='inside')x=-x;const {y0,y1}=sideY(p.x);y=inv(y0,y1,p.y)*2-1;}
 else if(zone==='heel'){const {y0,y1}=heelBand();x=inv(-.13,.13,p.z)*2-1;y=inv(base(0)+y0,base(0)+y1,p.y)*2-1;}
 else{const a=anchor(zone,ctx),{r,u}=planeBasis(a.d),q=p.clone().sub(a.t0);x=q.dot(r)/a.rx;y=q.dot(u)/a.ry;}
 const snap=(v:number)=>Math.abs(v)<.07?0:v;
 return {x:snap(clamp(x,-1,1)),y:snap(clamp(y,-1,1))};
}
/** Parts a decal may land on: the outer upper, the tongue's face (its flap's top beyond a fold), the collar. */
export function decalPart(part:number,vv:number,fold:number){
 return part===PART.outer||part===PART.collar||(part===PART.tongue&&vv<=fold)||(part===PART.tongueBack&&vv>fold);
}
/** Which zone a point (and its normal) on the boot belongs to. */
export function zoneAt(p:T.Vector3,n:T.Vector3,part:number):DecalZone{
 if(part===PART.tongue||part===PART.tongueBack||part===PART.collar)return p.x>-.6&&n.x>-.2?'tongue':(n.z>=0?'outside':'inside');
 const s=sAt(p.x);
 if(s<.1&&n.x<-.35)return 'heel';
 if(s>.76)return 'toe';
 if(s>.38&&s<.76&&n.y>.75)return 'tongue';
 return n.z>=0?'outside':'inside';
}
/** Which colour zone a tapped point is (mirrors the bake's zone borders and the shape's lacing). */
export function paintAt(h:{part:number;s:number;yr:number;rimd:number;across:number;laced:boolean}):ColourZone{
 const sh=shape(),e=sh.eyes;
 if(h.part===PART.fin)return 'accent';
 if(h.part===PART.cover||h.part===PART.coverIn)return 'laces';
 if(h.part===PART.tongue||h.part===PART.tongueBack)return 'mid';
 if(h.part!==PART.outer)return 'collar';
 if(h.rimd<.07)return 'collar';
 const gap=Math.abs(h.across-sh.laceC);
 if(h.laced?(h.s>e.s0-.02&&h.s<e.s1+.03&&gap<e.hw*1.43):(h.s>.4&&h.s<.75&&gap<.15))return 'laces';
 if(h.s>.705+.085*h.yr)return 'toe';
 if(h.s<heelBorder(h.yr))return 'heel';
 return 'mid';
}
