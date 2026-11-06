import type {MatchSim,TouchKind} from './matchSim';
/**
 * Friends' screens (multiplayer slice 2): a puppet sim never steps, so its touch ring (MatchSim.touches) stays empty and the
 * render layers that read it (choreo reactions, the combos view's tackles and celebrations, live ball sounds, the kick effects)
 * had nothing to play. This writes the SAME events into the puppet's own ring from what the snapshots already carry (the ball's
 * owner, its interpolated velocity, the lofted flag and the score): no protocol change, render-only, owner sims untouched.
 *   owner → nobody, ball moving ≥ KICK_MIN: a kick by the old owner (speed, lofted height);
 *   owner → nobody, slower: knocked loose (a poke-away); the next owner of the other side is credited with a tackle;
 *   A → B on the other side: a tackle (B wins it from A); same side / from loose: a receive (other side: an intercept);
 *   a score change: a goal by the last kicker (team = the scoring side).
 * No allocation: the ring's preallocated events are overwritten in place.
 */
export const PUPPET_TOUCH={kickMin:45,pokeWindow:.6} as const;
export function createPuppetTouches(){
 let prev:string|null|undefined,lastKicker:string|null=null,looseFrom:string|null=null,looseT=99,poked=false,gold=-1,blue=-1,lastSpeed=0;
 function emit(sim:MatchSim,kind:TouchKind,id:string,other:string|null,height:number,speed:number,team?:'gold'|'blue'){
  const e=sim.touches[sim.touchSerial%sim.touches.length];sim.touchSerial++;
  e.serial=sim.touchSerial;e.kind=kind;e.id=id;e.other=other;e.team=team??sim.players[id]?.team??'gold';e.height=height;e.speed=speed;e.heavy=false;e.time=sim.stats.time;
 }
 return {
  /** After each puppet sample: compare with the last drawn state and add the touches it implies. `dt` real seconds. */
  step(sim:MatchSim,dt:number){
   const own=sim.ball.owner,b=sim.ball,speed=Math.hypot(b.vx,b.vy);
   if(prev===undefined){prev=own;gold=sim.score.gold;blue=sim.score.blue;return;}
   looseT+=dt;
   if(own!==prev){
    const was=prev?sim.players[prev]:undefined,now=own?sim.players[own]:undefined;
    if(was&&!now){looseFrom=prev!;looseT=0;
     if(speed>=PUPPET_TOUCH.kickMin){poked=false;lastKicker=prev!;emit(sim,'kick',prev!,null,b.lofted?1:0,speed);}else poked=true;}
    else if(was&&now){if(was.team!==now.team)emit(sim,'tackle',own!,prev!,0,Math.hypot(now.vx,now.vy));else emit(sim,'receive',own!,prev!,0,Math.max(speed,lastSpeed));}
    else if(now){const from=looseFrom?sim.players[looseFrom]:undefined;
     if(poked&&from&&from.team!==now.team&&looseT<PUPPET_TOUCH.pokeWindow)emit(sim,'tackle',own!,looseFrom,0,Math.hypot(now.vx,now.vy));
     else emit(sim,from&&from.team!==now.team?'intercept':'receive',own!,looseFrom,b.height??0,lastSpeed);
     poked=false;}
    prev=own;
   }
   if(!own)lastSpeed=speed;
   if(sim.score.gold!==gold||sim.score.blue!==blue){const up=sim.score.gold>gold||sim.score.blue>blue,team=sim.score.gold>gold?'gold':'blue';gold=sim.score.gold;blue=sim.score.blue;
    const id=!up?null:lastKicker&&sim.players[lastKicker]?lastKicker:sim.ids.find(i=>sim.players[i].team===team);if(id)emit(sim,'goal',id,null,0,lastSpeed,team);}
  },
  reset(){prev=undefined;lastKicker=looseFrom=null;poked=false;looseT=99;},
 };
}
