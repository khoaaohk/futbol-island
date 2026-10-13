import {SORT_CARDS,type SortCard} from './sort';
import type {Era,RefEvent} from './refcalls';
import {KW as K,BW as B,type Actor,type BallKey} from './film';

/**
 * laws-1863 · the two machines' model (Oct 12 2026 anatomy Paper restyle of the Oct 10 game; user: "these games should not be
 * the pixel style … the rest of the game should be in this style" — the anatomy isometric technical-illustration, Paper theme).
 * Pure: no DOM, so tests/museum-exp-laws-1863.cjs runs it in Node. The facts come from sort.ts (eight 1863 Laws, kept or
 * changed) and refcalls.ts (ten match moments, judged by the 1863 Laws or today's), both checked against LAW_SOURCES /
 * SORT_SOURCES. The drawing lives in Press.tsx and Pitch.tsx (anatomy kit, world units of about 1 cm on the press and
 * 10 units = 1 m on the pitch).
 *
 * 1. THE RULE PRESS. A cast-iron lever press on a base plate, a law card on its bed, two trays in front: ✓ (still a rule today)
 *    and ✗ (changed since). Tap a tray to set the die, then drag the lever down: the ram drives the platen onto the card
 *    (pull 0 → 1), the card is stamped, and it slides out of the press into its tray. Then the truth.
 * 2. REF THE MATCH. A table-top pitch under the rulebook of the day: in 1863 two bare posts with flags, no bar, no net, no lines;
 *    today the goal, the net and the markings. A short film of pegs plays a moment; you have CALL_MS to make the call (speed and
 *    a streak score more, refcalls.callPoints); a stopwatch on the table counts it down.
 */
export type Die='kept'|'changed';
export const PRESS_N=6,MATCH_N=6;
export const PRESS_PTS=100;
/** Six rule cards for a press round: three still in force, three changed, in a shuffled order. */
export function pressRound(r:()=>number):SortCard[]{
 const sh=<T,>(a:T[])=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 return sh([...sh(SORT_CARDS.filter(c=>c.kept)).slice(0,3),...sh(SORT_CARDS.filter(c=>!c.kept)).slice(0,3)]);
}
export const truthOf=(c:SortCard):Die=>c.kept?'kept':'changed';
export function matchVerdict(right:number,total:number){
 if(right===total)return 'A perfect match! You could referee in 1863 AND today.';
 if(right>=total-2)return 'A strong game, ref. The rules that changed are the tricky ones.';
 return 'Tough match! Watch the board: 1863 or today changes the answer. Try again.';
}
export function pressVerdict(right:number,total:number){
 if(right===total)return 'Every rule sorted right! You know your football history.';
 if(right>=total-2)return 'Nearly all right! A few of the 1863 Laws surprised you.';
 return 'The 1863 Laws surprised you! Lots has changed since the tavern.';
}

// ── 1. The rule press (world units ≈ 1 cm; the bed's top is at BED_Z, the card lies on it) ─────────────────────────────────
export type PressState={
 card:SortCard|null;die:Die;
 /** the lever's pull, 0 (rest) → 1 (platen down on the card) */pull:number;
 /** the stamp the card carries (null = not yet stamped) */stamped:Die|null;
 /** 0 → 1 while the stamped card slides into its tray */slide:number;
 stacks:{kept:number;changed:number};
};
export const pressInit=():PressState=>({card:null,die:'kept',pull:0,stamped:null,slide:0,stacks:{kept:0,changed:0}});
export const BED_Z=17,CARD_T=.8,DIE_T=2.4,PLATEN_T=8;
/** The platen's underside for a pull: up at PLATEN_UP, down with the die face on the card. Eased: it gathers speed. */
export const PLATEN_UP=64,PLATEN_DOWN=BED_Z+CARD_T+DIE_T;
export const platenZ=(pull:number)=>PLATEN_UP+(PLATEN_DOWN-PLATEN_UP)*easeIn(clamp(pull,0,1));
/** The lever's angle (radians above the horizontal, swinging in the x–z plane): raised at rest, down when pulled. */
export const barAngle=(pull:number)=>lerp(.72,-.36,clamp(pull,0,1));
export const LEVER={x:11,y:0,z:142,len:74};
/** The trays in front of the press (centre of each tray's floor, world units). */
export const TRAY:Record<Die,{x:number;y:number}>={kept:{x:-82,y:52},changed:{x:82,y:52}};
export const CARD={w:44,d:30};
/** Where the card's centre is while it slides (bed → its tray, out of the front of the press with a hop). */
export function cardPos(s:PressState,trays:Record<Die,{x:number;y:number}>=TRAY){const to=trays[s.stamped??'kept'],u=easeInOut(s.slide),n=s.stacks[s.stamped??'kept'];
 // first out through the front (+y), then across to the tray: a quadratic path through a point in front of the bed
 const mx=0,my=Math.max(46,to.y),x=(1-u)*(1-u)*0+2*(1-u)*u*mx+u*u*to.x,y=(1-u)*(1-u)*0+2*(1-u)*u*my+u*u*to.y;
 return {x,y,z:lerp(BED_Z,3+n*CARD_T,u)+Math.sin(u*Math.PI)*26};}

// ── 2. Ref the match (film metres; the goal line is x = 0, the touch line y = 0) ──────────────────────────────────────────
export const POST_A=3.5,POST_B=10.82,MID=(POST_A+POST_B)/2;
export type Film={T:number;actors:Actor[];ball:BallKey[];hold?:boolean;star?:{t:number;x:number;y:number;z:number};boot?:{t:number;x:number;y:number}};
const R=(id:string,num:number,keys:Actor['keys']):Actor=>({id,num,kit:'red',keys}),Bl=(id:string,num:number,keys:Actor['keys']):Actor=>({id,num,kit:'blue',keys});
const KEEP=(x=.7,y=MID-.3)=>R('k',1,[K(0,x,y,'ready',{facing:'front'})]);
const goalFilm:Film={T:2,actors:[R('k',1,[K(0,.6,MID,'ready'),K(.75,.5,MID-1.3,'dive',{flip:true}),K(2,.5,MID-1.3,'dive',{flip:true})]),
  Bl('a',9,[K(0,9,8.2,'run',{facing:'back'}),K(.3,8.3,8,'kick',{facing:'back'}),K(.7,8,7.9,'stand',{facing:'back'}),K(1.1,8,7.9,'cheer')])],
 ball:[B(0,8.6,7.9),B(.3,8,7.8),B(1,-1,6.6,.9),B(1.3,-1.6,6.5,0),B(2,-1.6,6.5,0)]};
/** One short film per match moment (world metres). */
export const FILMS:Record<string,Film>={
 high:{T:2,actors:[KEEP(),Bl('a',9,[K(0,10.6,7.6,'run',{facing:'back'}),K(.4,9.8,7.4,'kick',{facing:'back'}),K(.8,9.6,7.4,'stand',{facing:'back'}),K(2,9.6,7.4,'stand',{facing:'back'})])],
  ball:[B(0,10,7.3),B(.4,9.4,7.3),B(1,4,7.4,4.6),B(1.45,0,7.4,4.2),B(2,-3,7.4,2.6)]},
 catch:{T:2.2,hold:true,actors:[R('d',4,[K(0,7,5,'stand'),K(1.1,7,5,'stand'),K(1.25,7,5,'cheer'),K(2.2,7,5,'cheer')]),Bl('a',8,[K(0,12.4,9.4,'kick',{facing:'back'}),K(.5,12.4,9.4,'stand',{facing:'back'})])],
  ball:[B(0,12,9),B(.2,11.8,8.9),B(.8,9.5,7,3.6),B(1.25,7,5,2.1),B(2.2,7,5,2.1)]},
 throw:{T:2.2,hold:true,actors:[R('r',7,[K(0,4.6,4.2,'kick',{facing:'back'}),K(.4,4.6,4.2,'stand',{facing:'back'})]),R('q',11,[K(0,7.4,3,'run',{facing:'back'}),K(1.5,5.6,-.3,'run',{facing:'back'}),K(1.6,5.5,-.5,'cheer'),K(2.2,5.5,-.5,'cheer')]),
   Bl('b',3,[K(0,2.4,2.2,'run'),K(1.9,4.6,-.1,'run'),K(2,4.7,-.1,'stand')])],
  ball:[B(0,4.9,4),B(.3,5,3.6),B(1,5.4,-.4),B(1.5,5.6,-.9),B(1.6,5.5,-.5,2.1),B(2.2,5.5,-.5,2.1)]},
 ends:goalFilm,
 kickoff:goalFilm,
 forward:{T:2,actors:[KEEP(),R('d1',2,[K(0,2.8,5.4,'ready')]),R('d2',3,[K(0,2.4,9.4,'ready')]),R('d3',5,[K(0,3.5,7.4,'ready')]),
   Bl('a',8,[K(0,12.6,6.2,'run',{facing:'back'}),K(.3,12,6.1,'kick',{facing:'back'}),K(.6,11.8,6.1,'stand',{facing:'back'})]),
   Bl('b',9,[K(0,5.2,8.6,'stand',{facing:'back'}),K(1.1,5.2,8.6,'stand',{facing:'back'}),K(1.3,5,8.5,'run',{facing:'back'}),K(2,4.6,8.3,'run',{facing:'back'})])],
  ball:[B(0,12.2,6.1),B(.3,11.6,6.2),B(1.3,5.6,8.4),B(2,5,8.2)]},
 pickup:{T:2,hold:true,actors:[R('d',6,[K(0,1.3,7,'stand'),K(.9,1.3,7,'ready'),K(1.3,1.3,7,'cheer'),K(2,1.3,7,'cheer')]),Bl('a',9,[K(0,9.2,8.3,'kick',{facing:'back'}),K(.4,9.2,8.3,'stand',{facing:'back'})])],
  ball:[B(0,8.8,8.1),B(.2,8.6,8.1),B(1.1,1.8,7.1),B(1.3,1.3,7,2.1),B(2,1.3,7,2.1)]},
 trip:{T:2,star:{t:1.05,x:5.6,y:6.5,z:.3},actors:[R('d',4,[K(0,5,6.2,'stand'),K(.9,5,6.2,'stand'),K(1,5,6.2,'kick'),K(1.5,5,6.2,'kick'),K(1.7,5,6.2,'stand')]),
   Bl('a',9,[K(0,10,8,'run',{facing:'back'}),K(1,5.8,6.7,'run',{facing:'back'}),K(1.15,5.4,6.4,'stumble',{facing:'back'}),K(1.35,4.9,6.2,'dive',{flip:true}),K(2,4.8,6.1,'dive',{flip:true})])],
  ball:[B(0,9.4,7.7),B(1,5.2,6.4),B(2,2.2,5.6)]},
 hack:{T:2,star:{t:1,x:5.7,y:6.6,z:.4},actors:[R('d',4,[K(0,3,4.6,'run'),K(.9,5.2,6.2,'run'),K(1,5.3,6.3,'kick'),K(1.5,5.3,6.3,'kick'),K(1.7,5.3,6.3,'stand')]),
   Bl('a',9,[K(0,10,8,'run',{facing:'back'}),K(1,5.9,6.8,'run',{facing:'back'}),K(1.15,5.6,6.6,'stumble',{facing:'back'}),K(2,5.5,6.5,'stumble',{facing:'back'})])],
  ball:[B(0,9.4,7.7),B(1,5.4,6.6),B(2,3.6,6.1)]},
 nails:{T:2,boot:{t:1.1,x:5.6,y:3.4},actors:[Bl('a',7,[K(0,5.6,-1.6,'run'),K(1.1,5.6,3.4,'run'),K(1.2,5.6,3.4,'stand'),K(2,5.6,3.4,'stand')])],ball:[B(0,6,7.2)]},
};
export const ERA_LABEL:Record<Era,string>={'1863':'1863',today:'TODAY'};
export type MatchView={event:RefEvent;era:Era;t:number;/** 0..1 of the call's time left (null = untimed) */fuse:number|null;answered:boolean};

function clamp(v:number,a:number,b:number){return Math.max(a,Math.min(b,v));}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}
function easeIn(t:number){return t*t*(1.4-.4*t);}
function easeInOut(t:number){const u=clamp(t,0,1);return u<.5?2*u*u:1-(-2*u+2)**2/2;}
