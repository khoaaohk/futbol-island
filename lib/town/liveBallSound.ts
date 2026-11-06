import type {MatchSim} from './match/matchSim';

/**
 * Live-match ball sounds (Nov 4 2026, owner: "apply the same ball physics to the 7v7 game … add the sound effects").
 * The walking ball (Town.tsx → walkBall env) plays islandSound.ball('kick') on a strike, ('bounce') on every impact
 * (floor bounce, wall, post/bar, struck object) and ('receive') on a trap. A live match plays the SAME three sounds,
 * read from the sim's touch ring and the render-only bounce physics (liveBallPhysics.landing), with the volume set by
 * how hard the ball moves (real m/s at playback speed). Render-only: the sim is never touched, so AI matches stay
 * deterministic. Every touch is consumed even when silent, so a match coming back into view never replays old sounds.
 */
/** Layered match one-shots (Nov 5 2026, docs/join-live-game-design.md "Kick effects"; islandSound.match): a low thump under a hard
 *  strike (by power), a light tick on a pass, a tackle thud, a poke-away flick, the net swish and a crowd swell on a goal. */
export type LiveMatchSoundKind='thump'|'tick'|'thud'|'poke'|'swish'|'crowd'|'slow';
export type LiveBallSoundKind='kick'|'bounce'|'receive'|LiveMatchSoundKind;
export type LiveBallSoundPlay=(kind:LiveBallSoundKind,gain:number)=>void;
/** kickFull / receiveFull / bounceFull: real m/s that play at full volume; quiet: the softest touch's gain;
 *  bounceMin: a landing slower than this (m/s) is a settle, not a bounce; tackle / post: fixed gains. */
export const LIVE_BALL_SOUND={kickFull:20,receiveFull:10,bounceFull:6,bounceMin:1.1,quiet:.35,tackle:.7,post:1,/** real m/s: a strike this hard gets the thump layer (full at thumpFull) */thump:13,thumpFull:26,tick:.55,thud:.8,poke:.65,goal:1} as const;
const S=LIVE_BALL_SOUND;
const level=(speed:number,full:number)=>Number.isFinite(speed)?Math.max(S.quiet,Math.min(1,speed/full)):S.quiet;

export function createLiveBallSound(venue:{width:number;length:number},timeScale:number){
 // Sim units → real metres per second at live playback speed (250 units across, 380 along the pitch).
 const toReal=(venue.width/250+venue.length/380)/2*timeScale;
 let seen=-1,frame=-1;
 /** Call once per frame after liveBallPhysics.step. `landing` = its impact speed (m/s, 0 if none); `play` null = consume silently. */
 function update(sim:MatchSim,landing:number,play:LiveBallSoundPlay|null,gain=1){
  const latest=sim.touchSerial,frameSerial=sim.frameContact.serial;
  if(seen<0){seen=latest;frame=frameSerial;return;}
  const ring=sim.touches;
  if(play&&gain>0){
   let hitFrame=false;const layered=!(globalThis as {__fi2FxOff?:boolean}).__fi2FxOff;
   if(frameSerial!==frame){hitFrame=true;play('bounce',S.post*gain);}// off the post / bar: the walking ball's frame impact
   for(let serial=Math.max(seen+1,latest-ring.length+1);serial<=latest;serial++){
    const ev=ring[(serial-1)%ring.length];if(ev.serial!==serial)continue;
    const speed=ev.speed*toReal;
    if(ev.kind==='kick'){if(!(sim.isBeach&&sim.players[ev.id]?.isGK)){play('kick',level(speed,S.kickFull)*gain);// a beach keeper throws from the hands
      if(layered)play(speed>=S.thump?'thump':'tick',speed>=S.thump?Math.min(1,.35+.65*(speed-S.thump)/(S.thumpFull-S.thump))*gain:S.tick*level(speed,S.kickFull)*gain);}}
    else if(ev.kind==='tackle'){if(!layered)play('kick',S.tackle*gain);else if(sim.ball.owner===ev.id){play('thud',S.thud*gain);play('kick',S.tackle*.5*gain);}else play('poke',S.poke*gain);}// clean win: thud; knocked loose: a poke
    else if(ev.kind==='goal'){if(layered){play('swish',S.goal*gain);play('crowd',S.goal*gain);}}
    else if(ev.kind==='receive'||ev.kind==='intercept')play('receive',level(speed,S.receiveFull)*gain);
    else if(ev.kind==='heavy'||ev.kind==='parry')play('bounce',level(speed,S.bounceFull)*gain);
   }
   if(!hitFrame&&landing>=S.bounceMin)play('bounce',level(landing,S.bounceFull)*gain);
  }
  seen=latest;frame=frameSerial;
 }
 return {update};
}
