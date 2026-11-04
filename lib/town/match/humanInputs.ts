// Human players in a live MatchSim (join a live game, slice 1, Nov 4 2026). The sim keeps one HumanInput per human-
// controlled SLOT (keyed by the slot's player id), so N humans can share a match: solo play uses one entry, the
// multiplayer slice feeds the others from the network. Pure data + helpers, no three.js, safe in tests.

export type HumanTeam='gold'|'blue';
/** One frame of controls, as a client sends it (screen stick already turned into sim space by the caller). */
export type HumanFrame={mx:number;my:number;pass?:boolean;shoot?:boolean;shootPower?:number;through?:boolean;tackle?:boolean;jockey?:boolean;sprint?:boolean;call?:boolean};
export type HumanInput={
  id:string;team:HumanTeam;
  moveX:number;moveY:number;mag:number;faceX:number;faceY:number;
  sprint:boolean;jockey:boolean;
  /** One-shot actions stay armed for `INPUT_BUFFER` seconds so a press just before the ball arrives still fires. */
  pass:number;shoot:number;through:number;tackle:number;
  shootPower:number;
  /** "Call for the ball": seconds the call stays heard by the carrier. */
  call:number;
};
export const INPUT_BUFFER=.16;
export const CALL_HEARD=1.4;

export function createHumanInput(id:string,team:HumanTeam):HumanInput{
  return {id,team,moveX:0,moveY:0,mag:0,faceX:0,faceY:team==='gold'?-1:1,sprint:false,jockey:false,pass:0,shoot:0,through:0,tackle:0,shootPower:1,call:0};
}
/** Write one frame of controls (no allocation). */
export function writeHumanInput(h:HumanInput,f:HumanFrame){
  h.moveX=f.mx;h.moveY=f.my;h.mag=Math.min(1,Math.hypot(f.mx,f.my));
  if(h.mag>.05){h.faceX=f.mx;h.faceY=f.my;}
  h.sprint=!!f.sprint;h.jockey=!!f.jockey;
  if(f.pass)h.pass=INPUT_BUFFER;
  if(f.shoot){h.shoot=INPUT_BUFFER;h.shootPower=f.shootPower??1;}
  if(f.through)h.through=INPUT_BUFFER;
  if(f.tackle)h.tackle=INPUT_BUFFER;
  if(f.call)h.call=CALL_HEARD;
}
/** Age the buffers; while the human is on the ball nothing expires (he acts on his next decision). */
export function tickHumanInput(h:HumanInput,dt:number,onBall:boolean){
  h.call=Math.max(0,h.call-dt);
  if(onBall)return;
  h.pass=Math.max(0,h.pass-dt);h.shoot=Math.max(0,h.shoot-dt);h.through=Math.max(0,h.through-dt);h.tackle=Math.max(0,h.tackle-dt);
}
export function clearHumanActions(h:HumanInput){h.pass=h.shoot=h.through=h.tackle=0;}

/** Humans per team in a roster (any iterable of inputs). */
export function humanCounts(humans:Iterable<{team:HumanTeam}>){
  let gold=0,blue=0;for(const h of humans){if(h.team==='gold')gold++;else blue++;}return {gold,blue};
}
