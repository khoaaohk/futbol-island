/**
 * The Claw Club's prizes (Nov 21 2026). Pure data + the pile pick, no three.js. Every prize is an existing gashapon toy, so a toy
 * you win is the SAME toy (same 3D model, same Toy Shelf slot, same save: lib/gashapon/store.ts `owned`) as one from a capsule.
 * Picked for the claw: soft plush / vinyl figures that sit in a pile, plus the machine's own mascot, the Claw Club Bean.
 *
 * `fact`: the one-line football lesson shown when you win it (house rule: everything teaches football). Kid-level and true.
 * `h`/`w`: the model's height and half-width in model units (toyKit rig.height / rig.radius, measured Nov 21 2026), used to size
 * its physics body so the toy you see is the toy the claw touches.
 */
import type {ToyBody} from './clawPhysics';
import {clawRng} from './clawPhysics';

export type ClawPrize={id:string;fact:string;h:number;w:number};
export const CLAW_PRIZES:readonly ClawPrize[]=[
 {id:'claw-club-bean',h:.99,w:.71,fact:'Only goalkeepers may grab the ball with their hands, and only inside their own penalty area.'},
 {id:'maneki-mika',h:1.01,w:.51,fact:'In many leagues the two teams line up and shake hands before kick-off.'},
 {id:'mango-max',h:1.02,w:.51,fact:'Half-time lasts up to 15 minutes: time for water and a fruit snack before the second 45.'},
 {id:'breakaway-bolt',h:1.03,w:.52,fact:'You cannot be offside in your own half, so a fast breakaway can start from right there.'},
 {id:'tennis-tess',h:.65,w:.52,fact:'Football starts with a coin toss too: the winner picks which goal to attack first.'},
 {id:'pixel-ball',h:.77,w:.48,fact:'Kids about 8 to 12 often play with a size 4 ball; grown-ups use a size 5.'},
 {id:'beachball-bea',h:.76,w:.53,fact:'Beach soccer is played barefoot on sand, five a side, in three periods of 12 minutes.'},
 {id:'glove-frog',h:.86,w:.55,fact:'Goalkeepers wear grippy gloves and a different colour from everyone else on the pitch.'},
 {id:'seagull-sully',h:.77,w:.44,fact:'Head the ball with your forehead: eyes open, neck firm, push through the ball.'},
 {id:'clownfish-coco',h:.75,w:.46,fact:'Teammates talk all game: “Man on!” warns a friend that a defender is right behind them.'},
 {id:'scarf-skye',h:.75,w:.46,fact:'Fans wear scarves in their team’s colours and sing songs together called chants.'},
 {id:'juice-box-jun',h:1.17,w:.59,fact:'Drink before you feel thirsty: top players can run more than 10 km in one match.'},
 {id:'curry-bun-cooper',h:1.01,w:.66,fact:'A penalty is taken from the penalty mark, 11 metres from the goal line.'},
 {id:'ramune-rin',h:.99,w:.5,fact:'When the ball goes over the sideline, the other team takes a throw-in with both hands from behind and over the head.'},
];
export const clawPrize=(id:string)=>CLAW_PRIZES.find(p=>p.id===id);
/** Toys in the machine at once (one of each, never two of the same in the pile). */
export const CLAW_PILE_SIZE=12;
/** Overall size of a prize in the machine (metres, its longest side). */
export const CLAW_TOY_SIZE=.34;

/** The model → machine scale, and the physics body (two spheres) that fits inside the model. */
export function clawToyScale(p:Pick<ClawPrize,'h'|'w'>){return Math.min(CLAW_TOY_SIZE/p.h,CLAW_TOY_SIZE/(1.6*p.w));}
export function clawToyBody(p:Pick<ClawPrize,'h'|'w'>):ToyBody{
 const s=clawToyScale(p),r=Math.min(.13,Math.max(.085,.5*Math.min(p.h,1.6*p.w)*s*.62));
 return {r,d:Math.max(.03,p.h*s-2*r)};
}
/** Today's pile: the Bean always, then the rest in a seeded order; `refill` is the queue a won toy is replaced from. */
export function clawPile(seed:number):{pile:string[];refill:string[]}{
 const rand=clawRng(seed),rest=CLAW_PRIZES.slice(1).map(p=>p.id);
 for(let i=rest.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[rest[i],rest[j]]=[rest[j],rest[i]];}
 const pile=['claw-club-bean',...rest.slice(0,CLAW_PILE_SIZE-1)];
 return {pile,refill:rest.slice(CLAW_PILE_SIZE-1)};
}
/** The next toy for an emptied slot: the first queued toy not already in the pile (the won one goes to the back of the queue). */
export function nextRefill(pile:readonly string[],refill:string[],won:string):string{
 const at=refill.findIndex(id=>!pile.includes(id)||id===won);const next=at>=0?refill.splice(at,1)[0]:won;refill.push(won);return next;
}
