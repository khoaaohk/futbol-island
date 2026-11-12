/**
 * Air Futbol finger book-keeping (Nov 11 2026; one player only, owner decision the same day): which pointer
 * drives the child's striker. Pure (tests/airhockey-core.cjs); the shell feeds it pointer and touch events. Rules: the first
 * finger down drives the striker; while it is down, other touches are ignored (a palm, a second finger); the striker can never stay
 * glued to a finger that has lifted.
 * iOS WebKit can end a touch without the element's pointerup (lib/arcade/stickRelease.ts tells the story), so three safety nets:
 * the shell also listens on the window; every touchstart / touchend / touchcancel reconciles the owner against the touches that
 * are really on the glass (`reconcile`); and a finger that was turned away because the owner was a ghost takes over.
 */
export type StrikerTouches=ReturnType<typeof createStrikerTouches>;
export function createStrikerTouches(onRelease:()=>void,onTake?:(x:number,y:number)=>void){
 let id=-1,x=0,y=0;const wait={id:-1,x:0,y:0};
 const free=()=>{id=-1;onRelease();};
 return {
  /** The pointer that drives the striker, or -1. */
  owner:()=>id,
  /** A finger went down. True when it now drives the striker. */
  down(pointer:number,px:number,py:number){if(id>=0&&id!==pointer){wait.id=pointer;wait.x=px;wait.y=py;return false;}id=pointer;x=px;y=py;wait.id=-1;return true;},
  /** A pointer moved. True when it is the one driving the striker. */
  move(pointer:number,px:number,py:number){if(id===pointer&&pointer>=0){x=px;y=py;return true;}if(wait.id===pointer){wait.x=px;wait.y=py;}return false;},
  up(pointer:number){if(wait.id===pointer)wait.id=-1;if(id===pointer&&pointer>=0)free();},
  /** The touches really on the glass (client px, flat [x0,y0,x1,y1,...]). An owner with no touch within `slack` px is a ghost:
   *  it is released, and a finger that was waiting takes over. */
  reconcile(points:ArrayLike<number>,slack=48){
   const n=points.length>>1;
   if(id>=0){let near=false;for(let k=0;k<n&&!near;k++){const dx=points[k*2]-x,dy=points[k*2+1]-y;near=dx*dx+dy*dy<=slack*slack;}
    if(!near){if(wait.id>=0){id=wait.id;x=wait.x;y=wait.y;wait.id=-1;onTake?.(x,y);}else free();}}
   if(wait.id>=0&&n===0)wait.id=-1;
  },
  /** Everything lets go (pause, blur, hidden tab, page hide). */
  clear(){wait.id=-1;if(id>=0)free();},
 };
}
