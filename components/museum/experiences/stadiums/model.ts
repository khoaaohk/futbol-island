import {LAYERS,LAYER_NAME,STADIUMS,type LayerId} from './data';
/**
 * stadiums · the game's rules (pure; tests/museum-exp-stadiums.cjs runs them in Node).
 *  - Build it: snap the five layers back on from the bottom up. A wrong pick says what has to go underneath first.
 *  - Which stadium?: five rounds, alternating a silhouette on the turntable and a written clue; four names to pick from.
 *  - Score: 2 points a right answer (10) + the build (5, minus one a wrong pick) = 15.
 */
export const ROUNDS=5,BUILD_POINTS=5,QUIZ_POINTS=2,MAX_POINTS=ROUNDS*QUIZ_POINTS+BUILD_POINTS;
/** Why a layer can't go on yet (the next one the model needs is `need`). */
export const WHY_NOT:Readonly<Record<LayerId,string>>={
 ground:'The foundations go in first: everything else stands on them.',
 pitch:'The pitch lies on the foundations, inside the ring where the stands will go.',
 stands:'The stands wrap round the pitch, so the pitch goes down first.',
 roof:'The roof rests on top of the stands, so the stands come first.',
 outside:'The outside wraps round the stands and meets the roof, so it goes on last.',
};
export type Pick={ok:boolean;need:LayerId;say:string};
export function pickLayer(built:number,id:LayerId):Pick{
 const need=LAYERS[Math.min(built,LAYERS.length-1)];
 if(id===need)return {ok:true,need,say:`${LAYER_NAME[id]}: in place.`};
 const placed=LAYERS.indexOf(id)<built;
 return {ok:false,need,say:placed?`${LAYER_NAME[id]} is already on.`:`Not yet. ${WHY_NOT[need]}`};
}
export const buildScore=(mistakes:number)=>Math.max(0,BUILD_POINTS-mistakes);

/** A tiny seeded random (mulberry32), so a round can be replayed in a test. */
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const shuffle=<T,>(list:readonly T[],r:()=>number)=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
export type Round={answer:string;kind:'shape'|'clue';options:string[];azimuth:number};
/** Five different stadiums; even rounds show the silhouette, odd rounds the clue; three other names as options. */
export function makeRounds(r:()=>number=Math.random):Round[]{
 const ids=STADIUMS.map(s=>s.id),answers=shuffle(ids,r).slice(0,ROUNDS);
 return answers.map((answer,i)=>({answer,kind:i%2?'clue':'shape',options:shuffle([answer,...shuffle(ids.filter(x=>x!==answer),r).slice(0,3)],r),azimuth:20+Math.round(r()*14)*10}));
}
export const total=(quizRight:number,mistakes:number)=>quizRight*QUIZ_POINTS+buildScore(mistakes);
export function verdict(points:number){
 if(points>=MAX_POINTS)return 'Master builder!';
 if(points>=12)return 'Stadium expert';
 if(points>=8)return 'Good eye for a stadium';
 return 'Keep exploring';
}
/** Seats as a share of the biggest stadium here (the capacity bars). */
export const MAX_SEATS=Math.max(...STADIUMS.map(s=>s.seats));
export const seatShare=(seats:number)=>seats/MAX_SEATS;
/** Calm motion: exponential follow toward a target (snaps when close, so the loop can stop). */
export function follow(v:number,to:number,dt:number,rate=7,eps=.002){const n=to+(v-to)*Math.exp(-rate*dt);return Math.abs(n-to)<eps?to:n;}
/** Shortest turn between two azimuths (degrees). */
export const turnTo=(from:number,to:number)=>from+((((to-from)%360)+540)%360-180);
export const easeOut=(t:number)=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
