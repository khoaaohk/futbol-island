/**
 * laws-1863 · "Ref the match: 1863 or today?" (Oct 10 2026 play pass; user: "the other exhibits need to be more interactive").
 * A timed referee round: each call is a match moment plus the rulebook you are refereeing by (the 1863 Laws or today's). You
 * decide fast, by drag/flick or a button; right AND fast scores best; a streak multiplies. Every answer is checked against the
 * 1863 Laws as settled on 1 December 1863 and today's IFAB Laws (the same sources as laws.ts / sort.ts: LAW_SOURCES,
 * SORT_SOURCES). Pure data + maths, no DOM, so tests/museum-exp-laws-1863.cjs runs it in Node.
 */
export type Era='1863'|'today';
export type RefEvent={
 id:string;
 /** What happens, in plain words (no verdict). */
 text:string;
 /** The two answers: [left, right]. */
 options:readonly [string,string];
 /** Index of the right answer under each rulebook. */
 answer:Record<Era,0|1>;
 /** One line per rulebook saying why. */
 why:Record<Era,string>;
 /** The rulebook thread it belongs to (opens the rule in the living rulebook). */
 thread?:string;
};

export const REF_EVENTS:readonly RefEvent[]=[
 {id:'high',thread:'goal',text:'A shot flies between the posts, high above where a crossbar would be.',options:['No goal','Goal'],answer:{'1863':1,today:0},
  why:{'1863':'Goal! In 1863 there was no crossbar: a ball between the posts counted at whatever height.',today:'No goal. Today the ball must go under the crossbar, 2.44 metres up.'}},
 {id:'catch',thread:'hands',text:'In midfield, a defender catches the ball cleanly out of the air.',options:['Free kick to him','Handball'],answer:{'1863':0,today:1},
  why:{'1863':'A fair catch! In 1863 he could mark the spot with his heel and take a free kick.',today:'Handball. Today only the goalkeeper, in their own penalty area, may handle the ball.'}},
 {id:'throw',thread:'throw',text:'Red kicks the ball out over the side line. A Red player gets to it first.',options:['Red throws it in','Blue throws it in'],answer:{'1863':0,today:1},
  why:{'1863':'Red throws. In 1863 it was a race: the first player to touch the ball threw it in.',today:'Blue throws. Since 1873 the throw-in goes to the team that did NOT kick it out.'}},
 {id:'ends',text:'Blue scores a goal. Before the kick-off, do the teams swap ends?',options:['Swap ends','Stay where they are'],answer:{'1863':0,today:1},
  why:{'1863':'Swap! In 1863 the teams changed ends after every goal.',today:'Stay. Today the teams swap ends only once, at half-time.'}},
 {id:'forward',thread:'offside',text:'Blue passes the ball forward to a team-mate in front of the ball. Three defenders are between him and the goal.',options:['Offside','Play on'],answer:{'1863':0,today:1},
  why:{'1863':'Offside. In 1863 anyone in front of the ball when a team-mate kicked it was out of play.',today:'Play on. Today he is onside: he is not nearer the goal line than the second-last opponent.'}},
 {id:'pickup',thread:'hands',text:'The player guarding Red’s goal, standing right in front of it, picks the ball up off the ground with his hands.',options:['Allowed','Handball'],answer:{'1863':1,today:0},
  why:{'1863':'Handball. In 1863 there was no goalkeeper, and nobody could take the ball from the ground with his hands.',today:'Allowed: today he is the goalkeeper, inside his own penalty area (as long as it is not a back-pass from a team-mate).'}},
 {id:'trip',thread:'fair',text:'A Red player sticks out a leg and trips a Blue player on purpose.',options:['Foul','Play on'],answer:{'1863':0,today:0},
  why:{'1863':'Foul. “Neither tripping nor hacking shall be allowed”: 1863, Law X.',today:'Foul. Tripping is still against the Laws today: a free kick to Blue.'}},
 {id:'kickoff',text:'Red lets in a goal. Which team kicks off?',options:['Red','Blue'],answer:{'1863':0,today:0},
  why:{'1863':'Red. In 1863 the team that let the goal in kicked off.',today:'Red. Today’s Law 8 says the same: the team that let the goal in kicks off.'}},
 {id:'hack',thread:'fair',text:'A player kicks his opponent’s shins on purpose to get the ball.',options:['Allowed','Foul'],answer:{'1863':1,today:1},
  why:{'1863':'Foul. That is hacking, and the FA’s 1863 Laws banned it. Blackheath left the FA because it wanted to keep hacking.',today:'Foul. Kicking an opponent is a free kick today, and a card if it is reckless or dangerous.'}},
 {id:'nails',text:'A player runs on with nails sticking out of the soles of his boots.',options:['Allowed','Not allowed'],answer:{'1863':1,today:1},
  why:{'1863':'Not allowed. Law XIII of 1863 banned nails and iron plates on boots.',today:'Not allowed. Today’s Law 4: you may not wear anything dangerous.'}},
];

/** How long a call lasts (ms), how many calls make a round, and the scoring. */
export const CALL_MS=6000,ROUND=8,BASE=100,SPEED_MAX=50,STREAK_STEP=25,STREAK_MAX=100;

/** Points for one call: a right call scores BASE, plus up to SPEED_MAX for speed (none in untimed play), plus a streak bonus
 *  (STREAK_STEP for every right call in a row before this one, up to STREAK_MAX). A wrong call or a timeout scores 0. */
export function callPoints(right:boolean,ms:number|null,streakBefore:number){
 if(!right)return 0;
 const speed=ms==null?0:Math.round(SPEED_MAX*Math.max(0,Math.min(1,1-ms/CALL_MS)));
 return BASE+speed+Math.min(STREAK_MAX,STREAK_STEP*Math.max(0,streakBefore));
}
/** The best possible round score (all right, instant, full streak). */
export function maxRound(n=ROUND,timed=true){let t=0;for(let i=0;i<n;i++)t+=BASE+(timed?SPEED_MAX:0)+Math.min(STREAK_MAX,STREAK_STEP*i);return t;}

/** A small seeded random (mulberry32) so a round can be replayed in a test. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

export type RefCall={event:RefEvent;era:Era};
/** A round: ROUND different moments in a shuffled order, each under a rulebook. Half the calls are 1863, half today, and at
 *  least three are moments where the two rulebooks DISAGREE (so the year really matters). */
export function makeRound(seed=Date.now(),n=ROUND):RefCall[]{
 const r=rng(seed),pool=[...REF_EVENTS];
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const differs=(e:RefEvent)=>e.answer['1863']!==e.answer.today;
 // Keep at least 5 moments where the rulebooks disagree in the round.
 const pick=[...pool.filter(differs).slice(0,5),...pool.filter(e=>!differs(e))].slice(0,n);
 const rest=pool.filter(e=>!pick.includes(e));while(pick.length<n&&rest.length)pick.push(rest.shift()!);
 for(let i=pick.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[pick[i],pick[j]]=[pick[j],pick[i]];}
 const eras:Era[]=pick.map((_,i)=>i%2?'today':'1863');
 for(let i=eras.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[eras[i],eras[j]]=[eras[j],eras[i]];}
 return pick.map((event,i)=>({event,era:eras[i]}));
}

/** The line under the final score. */
export function refVerdict(right:number,total:number){
 if(right===total)return 'A perfect match! You could referee in 1863 AND today.';
 if(right>=total-2)return 'A strong game, ref. The changed rules are the tricky ones.';
 return 'Tough match! Drag the year in the rulebook above, then try again.';
}
