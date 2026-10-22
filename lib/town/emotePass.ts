// Two ball emotes (user, Oct 22 2026), both played with the player's ONE existing ball (Town drives `ball.position` from these functions and gives
// it back at the end: no second ball mesh exists).
//  - PASS IT (emote 6): GROUND passing between you and the townsperson, ~3-3.6 m apart; six rotating routines (lib/town/emoteBallPlay.ts):
//    one-touch wall passes, skill then pass, heel back-passes, trap-turn-and-pass, a no-look pass with a spin, a drag-back through-ball.
//  - JUGGLE WITH ME (emote 3): the ball goes back and forth IN THE AIR, ~2.7-3.4 m apart (the pair and the arcs fit one zoomed frame); six
//    rotating routines: thigh keep-ups and a header across, around-the-world and volleys, chest-and-flick, shoulder roll and neck stall,
//    rainbow heel flicks, a counted knee run ending in a catch behind the back and a bow. Alone: three solo keep-up routines.
// Each start draws the next routine from a shuffled bag (never the same twice in a row). Pure math, no three.js, no allocation per frame.
export {
  KICK_FROM, contactAfterWindup, PASS_REACH, PASS_SECONDS, JUGGLE_SECONDS, JUGGLE_SOLO_SECONDS, AIR_PARTNER, PASS_GAP, JUGGLE_GAP,
  createPassBallOut, passBallAt, juggleBallAt, juggleSoloAt, pickBallRoutine, actorMotion, friendBallMotion, clearBallMotion, PASS_ROUTINES, JUGGLE_ROUTINES, JUGGLE_SOLO_ROUTINES,
} from './emoteBallPlay';
export type {ActorPose, PassBallOut, Touch, BallRigMotion} from './emoteBallPlay';
