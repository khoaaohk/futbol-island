/**
 * Holo foil frame policy (card lab, Oct 8 2026). Phone heat first: the foil draws only
 *  - while the card's own tilt spring moves (PlayerCard's one rAF loop calls drive() from inside its frame: no second loop),
 *  - for one short arrival glint (GLINT_MS, its own rAF, then it stops), or
 *  - once, to put up a still frame after a resize, a new player or coming back into view.
 * At rest nothing is scheduled. Hidden pages and off-screen cards draw nothing (the next visible moment draws one frame).
 * No imports and an injected clock, so tests/holo-foil.cjs can drive it in Node.
 */
export type HoloPose={rx:number;ry:number;px:number;py:number};
/** The flat card under the resting light (the CSS foil's rest hotspot sits at --py -.4). */
export const REST_POSE:HoloPose={rx:0,ry:0,px:0,py:-.4};
export type FrameClock={raf:(cb:(t:number)=>void)=>number;caf:(id:number)=>void;now:()=>number};
export type LoopStats={frames:number;interactions:number;currentFrames:number;lastInteractionFrames:number;lastGlintFrames:number;looping:boolean;lastFrameAt:number};
export type HoloLoop={
 /** A frame of the card's spring: draw now (inside the caller's frame). Cancels a running glint. */
 drive(pose:HoloPose):void;
 /** The spring caught up: the interaction ends, nothing more is drawn until the next drive. */
 settle():void;
 /** Back to the flat rest pose: one still frame, then idle. */
 rest():void;
 /** The arrival glint: GLINT_MS of light sweep on its own rAF, then a still frame and idle. Requested while hidden or
  *  off-screen, it waits and plays when the card first comes into view (an interrupted glint is not replayed). */
 glint(ms:number):void;
 /** One still frame of the current pose (resize, new art). Deferred while hidden. */
 still():void;
 setVisible(visible:boolean):void;
 stats():LoopStats;
 dispose():void;
};
/** `render(pose, glint)`: glint is -1, or the sweep's progress 0..1. */
export function createHoloLoop(clock:FrameClock,render:(pose:HoloPose,glint:number)=>void,onSettle?:(stats:LoopStats)=>void):HoloLoop{
 let pose:HoloPose=REST_POSE,visible=true,dirty=false,raf=0,glintFrom=0,glintMs=0,pendingGlint=0,disposed=false;
 const st:LoopStats={frames:0,interactions:0,currentFrames:0,lastInteractionFrames:0,lastGlintFrames:0,looping:false,lastFrameAt:0};
 const frame=(g:number)=>{if(disposed)return;render(pose,g);st.frames++;st.currentFrames++;st.lastFrameAt=clock.now();};
 const end=()=>{if(!st.currentFrames)return;st.interactions++;st.lastInteractionFrames=st.currentFrames;st.currentFrames=0;onSettle?.({...st});};
 const stopGlint=()=>{if(raf)clock.caf(raf);raf=0;st.looping=false;};
 const tick=(t:number)=>{raf=0;if(disposed||!visible){st.looping=false;return;}
  const g=Math.min(1,Math.max(0,(t-glintFrom)/glintMs));
  if(g>=1){st.looping=false;frame(-1);st.lastGlintFrames=st.currentFrames;end();return;}// last frame of the sweep: the still pose, then nothing is scheduled
  frame(g);raf=clock.raf(tick);};
 const api:HoloLoop={
  drive(next){pose=next;pendingGlint=0;if(raf)stopGlint();if(!visible){dirty=true;return;}frame(-1);},
  settle(){end();},
  rest(){pose=REST_POSE;stopGlint();if(!visible){dirty=true;end();return;}frame(-1);end();},
  glint(ms){if(disposed)return;stopGlint();if(!visible){pendingGlint=ms;dirty=true;return;}pendingGlint=0;glintFrom=clock.now();glintMs=Math.max(1,ms);st.looping=true;raf=clock.raf(tick);},
  still(){if(raf)return;if(!visible){dirty=true;return;}frame(-1);end();},
  setVisible(v){if(v===visible)return;visible=v;if(!v){if(raf){stopGlint();dirty=true;}end();return;}if(pendingGlint){const ms=pendingGlint;dirty=false;api.glint(ms);return;}if(dirty){dirty=false;frame(-1);end();}},
  stats:()=>({...st}),
  dispose(){disposed=true;stopGlint();},
 };
 return api;
}
