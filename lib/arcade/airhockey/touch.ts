/**
 * Air Futbol finger book-keeping (Nov 11 2026): which pointer drives which striker. Pure (tests/airhockey-core.cjs); the shell feeds
 * it pointer and touch events. Rules: a touch that STARTS in a half drives only that half's striker; while a side has a finger,
 * other touches in that half are ignored (a palm, a second finger); a striker can never stay glued to a finger that has lifted.
 * iOS WebKit can end a touch without the element's pointerup (lib/arcade/stickRelease.ts tells the story), so three safety nets:
 * the shell also listens on the window; every touchstart / touchend / touchcancel reconciles the owners against the touches that
 * are really on the glass (`reconcile`); and a finger that was turned away because the side's owner was a ghost takes over.
 */
export type StrikerTouches=ReturnType<typeof createStrikerTouches>;
export function createStrikerTouches(onRelease:(side:number)=>void,onTake?:(side:number,x:number,y:number)=>void){
 const id=[-1,-1],x=[0,0],y=[0,0],wait=[{id:-1,x:0,y:0},{id:-1,x:0,y:0}];
 const free=(side:number)=>{id[side]=-1;onRelease(side);};
 return {
  /** The pointer that owns a side, or -1. */
  owner:(side:number)=>id[side],
  sideOf:(pointer:number)=>pointer===id[0]&&pointer>=0?0:pointer===id[1]&&pointer>=0?1:-1,
  /** A finger went down in `side`'s half. True when it now drives that striker. */
  down(pointer:number,side:number,px:number,py:number){if(id[side]>=0&&id[side]!==pointer){const w=wait[side];w.id=pointer;w.x=px;w.y=py;return false;}id[side]=pointer;x[side]=px;y[side]=py;wait[side].id=-1;return true;},
  /** The owner moved. Returns its side, or -1 for a pointer that drives nothing. */
  move(pointer:number,px:number,py:number){for(let s=0;s<2;s++){if(id[s]===pointer&&pointer>=0){x[s]=px;y[s]=py;return s;}if(wait[s].id===pointer){wait[s].x=px;wait[s].y=py;}}return -1;},
  up(pointer:number){for(let s=0;s<2;s++){if(wait[s].id===pointer)wait[s].id=-1;if(id[s]===pointer&&pointer>=0)free(s);}},
  /** The touches really on the glass (client px, flat [x0,y0,x1,y1,...]). An owner with no touch within `slack` px is a ghost:
   *  it is released, and a finger that was waiting for that side takes over. Each touch can vouch for one owner only. */
  reconcile(points:ArrayLike<number>,slack=48){
   const n=points.length>>1;let used=0;
   for(let s=0;s<2;s++){if(id[s]<0)continue;let best=-1,bd=slack*slack;for(let k=0;k<n;k++){if(used>>k&1)continue;const dx=points[k*2]-x[s],dy=points[k*2+1]-y[s],d=dx*dx+dy*dy;if(d<=bd){bd=d;best=k;}}
    if(best>=0){used|=1<<best;continue;}
    const w=wait[s];if(w.id>=0){id[s]=w.id;x[s]=w.x;y[s]=w.y;w.id=-1;onTake?.(s,x[s],y[s]);}else free(s);}
   for(let s=0;s<2;s++)if(wait[s].id>=0&&n===0)wait[s].id=-1;
  },
  /** Everything lets go (pause, blur, hidden tab, page hide). */
  clear(){for(let s=0;s<2;s++){wait[s].id=-1;if(id[s]>=0)free(s);}},
 };
}
