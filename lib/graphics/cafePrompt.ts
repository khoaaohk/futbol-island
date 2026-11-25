/**
 * Half-Time Café: the "Visit café" prompt (Nov 24 2026; lib/town/seasideCafe.ts). The station stamp prompt's shape
 * (stationStampPrompt.ts):
 *  - Desktop: hover(ray) tests the café's box (ground floor to ridge, plus the front deck); while hovered it gets the island's shared
 *    green building outline (buildingGlow.ts 'cafe') and wants the HUD 'enter' slot as explicit intent (distance -1). The pointer
 *    resting on the button holds the hover (holdHover).
 *  - Walking up (phones and desktop): within CAFE_PROMPT.reach of the front deck the button shows (key CAFE_PROMPT.key, arbitrated
 *    with Talk, Board, Enter and the rest by distance).
 *  - A tap on the café (pick) or the button opens Malia's conversation (match-day food and drink, today's fixtures, the garden).
 * Hover and tap count only within CAFE_PROMPT.hover metres. Heat: one squared distance per frame; a ray test only while the pointer
 * is over the canvas; one projection while the button shows. The outline draws only while shown (no light).
 */
import * as T from 'three';
import {createBuildingGlow} from './buildingGlow';
import {CAFE,CAFE_PROMPT} from '../town/seasideCafe';

const HOVER_GRACE=600,FRONT={x:CAFE.x,z:CAFE.front+3.75};
export type CafePromptUpdate={x:number;z:number;onFoot:boolean;canEnter:boolean;focusKey:string|null;camera:T.Camera;width:number;height:number;
 ui:<E extends HTMLElement>(selector:string)=>E|null|undefined;place:(el:HTMLElement,x:number,y:number)=>void;hide:(el:HTMLElement,hidden:boolean)=>void;dt?:number;reduced?:boolean};

export function createCafePrompt(scene?:T.Object3D){
 const boxes=[new T.Box3(new T.Vector3(CAFE.x-C2(CAFE.w),0,CAFE.z-C2(CAFE.d)-.6),new T.Vector3(CAFE.x+C2(CAFE.w),CAFE.floor+CAFE.wallH+CAFE.upperH+CAFE.roofRise+.4,CAFE.front+.2)),
  new T.Box3(new T.Vector3(700,0,CAFE.front),new T.Vector3(713.8,CAFE.floor+2.9,-88)),new T.Box3(new T.Vector3(712,0,-106),new T.Vector3(719,CAFE.floor+1.2,-95.5))];
 const hit=new T.Vector3(),anchor=new T.Vector3(),H2=CAFE_PROMPT.hover**2,R2=CAFE_PROMPT.reach**2;
 let hovered=false,hoverUntil=0,near=false,px=0,pz=0;
 const glowRoot=scene?new T.Group():null,glow=glowRoot?createBuildingGlow(glowRoot,CAFE.w,CAFE.d,CAFE.floor+CAFE.wallH,'cafe'):null;
 if(glowRoot){glowRoot.name='cafe-selection';glowRoot.position.set(CAFE.x,0,CAFE.z);scene!.add(glowRoot);glowRoot.updateMatrixWorld(true);}
 const inRange=()=>(px-CAFE.x)**2+(pz-CAFE.z)**2<H2;
 const pick=(ray:T.Raycaster)=>inRange()&&boxes.some(b=>ray.ray.intersectBox(b,hit)!==null);
 return {
  get hovered(){return hovered;},
  get near(){return near;},
  hover(ray:T.Raycaster|null,now=0){const h=ray?pick(ray):false;if(h){hovered=true;hoverUntil=now+HOVER_GRACE;}else if(!ray||now>=hoverUntil)hovered=false;return hovered;},
  holdHover(now=0){hovered=true;hoverUntil=now+HOVER_GRACE;return hovered;},
  /** True when a tap ray hits the café (within range). */
  pick(ray:T.Raycaster){return pick(ray);},
  update(c:CafePromptUpdate):{key:string;distance:number}|null{
   px=c.x;pz=c.z;const over=c.canEnter&&hovered&&inRange(),d2=(c.x-FRONT.x)**2+(c.z-FRONT.z)**2;
   near=over||(c.canEnter&&c.onFoot&&d2<R2);
   glow?.update(over,c.dt??1/60,c.reduced??false);
   const el=c.ui<HTMLButtonElement>('[data-cafe-go]');
   if(el){let hidden=!(near&&c.focusKey===CAFE_PROMPT.key);
    if(!hidden){anchor.set(CAFE.x,CAFE.floor+CAFE.wallH+.6,CAFE.front+.5).project(c.camera);hidden=anchor.z< -1||anchor.z>1;
     if(!hidden)c.place(el,T.MathUtils.clamp((anchor.x+1)*c.width/2,75,c.width-75),T.MathUtils.clamp((1-anchor.y)*c.height/2,90,c.height-160));}
    c.hide(el,hidden);}
   return near?{key:CAFE_PROMPT.key,distance:over?-1:Math.sqrt(d2)}:null;
  },
  dispose(){glow?.dispose();glowRoot?.removeFromParent();},
 };
}
function C2(v:number){return v/2+.15;}
export type CafePrompt=ReturnType<typeof createCafePrompt>;
