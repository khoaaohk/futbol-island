/**
 * Match focus (owner, Nov 5 2026: "make sure to pause everything else on the island while playing the game to not draw additional
 * heat"). ONE flag for the island loop, on while a human is JOINED in a live match (7v7, futsal, 9v9, 11v11, beach: `liveJoin.joined`),
 * off the frame after any leave (the Leave button, a forced leave from a lesson / menu / ride, a friend-match disconnect that presses
 * Leave, a failed join). Spectators watching a match are not joined and are left alone. `?matchfocus=0` turns it off (A/B runs).
 *
 * What it does (Town reads the flag; docs/join-live-game-design.md "Match focus" has the measured cost ranking):
 * - HOLDS STILL, exactly where they are (no hiding, no teleport): every townsperson (islandNpcs.setFocus with `still`: one held pass
 *   so the name tag hides, then the update returns at once), street traffic, the volleyball and coach-wall groups, the ferry, the
 *   lighthouse beam, sea life (open-sea whales / rays, the Coral Cay sharks and mantas), the bug swarms, Summit fruit trees and the
 *   beach finds (the fishing focus mode's `backgroundFrozen` gates, reused).
 * - The ball hunt (coins) sleeps: coins never count in a match (owner rule), so its update and its few draws stop until you leave.
 * - KEEPS: the match sim + render, matchLink / presence pose sending and its governor, the island save / autosave, analytics beats,
 *   match sound, the Leave flow, characterArrival, the goal replay, the water surface and the lighting (no pitch-side look change:
 *   the water clock costs nothing on the CPU and its shading is the same frozen or moving), shadows every frame (the players move),
 *   the pixel ratio and the heat governor.
 * - On resume the held systems take a clamped dt for a few frames (RESUME_DT for RESUME_FRAMES), so a long leave frame (rig rebuild,
 *   the arrival restart) never becomes one big catch-up step; held systems never accumulated time, so nothing jumps.
 * Nothing here allocates per frame.
 */
export const MATCH_FOCUS_RESUME_DT=1/30,MATCH_FOCUS_RESUME_FRAMES=3;
/** Which background groups keep running under match focus (the fishing focus mode's `focusLive` shape): only the matches. The joined
 *  match is the only one awake anyway (every other field is dormant off screen, fieldRuntime heat pass 5). */
export const MATCH_FOCUS_LIVE=Object.freeze({games:true,traffic:false,volleyball:false,coaches:false});
export type MatchFocusEvent='enter'|'exit'|null;
export function createMatchFocus(allowed=true){
 let on=false,resume=0,held=0;
 const stats={active:false,enters:0,exits:0,heldFrames:0,resumeClamps:0,format:null as string|null,allowed};
 return {stats,
  get active(){return on;},
  /** The dt every held system takes this frame (set by step): 0 while focused, clamped for the first frames after resume, else dt. */
  get dt(){return held;},
  /** Once per island frame, before any held system runs. `joined` = liveJoin.joined (state 'joined' with a slot). */
  step(joined:boolean,format:string|null,dt:number):MatchFocusEvent{
   const want=allowed&&joined;let ev:MatchFocusEvent=null;
   if(want!==on){on=want;stats.active=on;
    if(on){stats.enters++;stats.format=format;resume=0;ev='enter';}
    else{stats.exits++;stats.format=null;resume=MATCH_FOCUS_RESUME_FRAMES;ev='exit';}}
   if(on){stats.heldFrames++;held=0;}
   else if(resume>0){resume--;held=dt>MATCH_FOCUS_RESUME_DT?MATCH_FOCUS_RESUME_DT:dt;if(dt>MATCH_FOCUS_RESUME_DT)stats.resumeClamps++;}
   else held=dt;
   return ev;
  },
 };
}
export type MatchFocus=ReturnType<typeof createMatchFocus>;
