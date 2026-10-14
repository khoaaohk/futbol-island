import {TROPHIES,byId,type Trophy,type TrophyId} from './trophies';

/**
 * Trophy room · the rules (Oct 12 2026). Pure: the test plays both games in Node.
 *  - Match: six rounds, each shows three trophies (or one silhouette) and asks for the one that fits a story, a tournament or a
 *    shape. Fixed rounds (no randomness), and the right answer moves between the three places.
 *  - Measure and weigh: six pairs on the bench. "Which is taller?" reads the big ruler; "Which is heavier?" unlocks the balance.
 *    Only trophies with a published height and weight are measured (never the Africa Cup of Nations trophy).
 * Progress is kept under the exhibit's old key (fi2-museum-hof-arena-v1, already synced by lib/saves/snapshot.ts); the old Legends
 * Arena scores that may sit there are dropped by `sanitizeSave`.
 */
export type MatchKind='story'|'tournament'|'silhouette';
export type MatchRound={kind:MatchKind;ask:string;choices:readonly [TrophyId,TrophyId,TrophyId];right:TrophyId;why:string};
export const MATCH:readonly MatchRound[]=[
 {kind:'story',ask:'A dog called Pickles found the first World Cup trophy under a hedge. Which trophy took its place?',choices:['facup','worldcup','copa'],right:'worldcup',
  why:'The Jules Rimet trophy was found by Pickles in 1966. Today’s gold World Cup trophy was first won in 1974.'},
 {kind:'tournament',ask:'Which trophy do champions lift at the Champions League?',choices:['ucl','euro','asian'],right:'ucl',why:'The “big ears”: 74 cm of silver with two huge handles.'},
 {kind:'silhouette',ask:'Whose shape is this? Spiral band, football on top.',choices:['worldcup','afcon','womens'],right:'womens',why:'The Women’s World Cup trophy: a spiral band holding a ball.'},
 {kind:'story',ask:'The first one, the “little tin idol”, was stolen from a shoe-shop window in 1895. Which cup?',choices:['copa','facup','ucl'],right:'facup',
  why:'The FA Cup. Aston Villa held it when it was stolen in Birmingham, and it was never seen again.'},
 {kind:'silhouette',ask:'Whose shape is this? Five petals, like a lotus flower.',choices:['asian','womens','euro'],right:'asian',why:'The AFC Asian Cup trophy: five petals for the five zones of Asian football.'},
 {kind:'tournament',ask:'Which trophy stands on three wooden levels covered in winners’ plaques?',choices:['afcon','euro','copa'],right:'copa',why:'The Copa América trophy, bought in Buenos Aires in 1916.'},
];
export const MATCH_SILHOUETTE=(r:MatchRound)=>r.kind==='silhouette';

export type CompareRound={ask:'taller'|'heavier';left:TrophyId;right:TrophyId;why:string};
export const COMPARE:readonly CompareRound[]=[
 {ask:'taller',left:'worldcup',right:'womens',why:'The Women’s World Cup trophy is 47 cm, the men’s 36.8 cm.'},
 {ask:'heavier',left:'worldcup',right:'womens',why:'Surprise! The smaller men’s trophy is solid gold: 6.175 kg against 4.6 kg.'},
 {ask:'taller',left:'ucl',right:'copa',why:'The Copa América trophy is 77 cm, just 3 cm taller than the “big ears” (74 cm).'},
 {ask:'heavier',left:'ucl',right:'copa',why:'The shorter Champions League cup is heavier: 11 kg against 9 kg.'},
 {ask:'heavier',left:'euro',right:'asian',why:'The Asian Cup trophy is 15 kg of silver, almost twice the Euro trophy’s 8 kg.'},
 {ask:'taller',left:'facup',right:'euro',why:'So close! The FA Cup is 61.5 cm, the Euro trophy 60 cm: 1.5 cm apart.'},
];
const measure=(t:Trophy,ask:'taller'|'heavier')=>ask==='taller'?t.heightCm:t.weightKg;
/** Which side wins a comparison (both sides must have the number). */
export function winner(r:CompareRound):'left'|'right'{const a=measure(byId(r.left)!,r.ask),b=measure(byId(r.right)!,r.ask);
 if(a==null||b==null)throw new Error('unmeasured trophy in a comparison');return a>b?'left':'right';}
/** The balance's tilt (radians, + = the right pan goes down): the heavier side always goes down, 5° plus up to 5° more for a big gap
 *  (a real beam would tip all the way to its stop; ours stops early so both trophies stay in view). */
export const tiltFor=(left:number,right:number)=>right===left?0:Math.sign(right-left)*(5+5*Math.min(1,Math.abs(right-left)/6))*Math.PI/180;

export const BEST_KEY='fi2-museum-hof-arena-v1';
export type Save={v:2;seen:TrophyId[];match:number;compare:number};
const IDS=new Set<string>(TROPHIES.map(t=>t.id));
/** Only what this room writes: the trophies looked at and the best scores (0..6). Anything else (old arena scores) → empty. */
export function sanitizeSave(raw:unknown):Save{
 const out:Save={v:2,seen:[],match:0,compare:0};
 if(!raw||typeof raw!=='object'||(raw as {v?:unknown}).v!==2)return out;
 const r=raw as Record<string,unknown>,n=(x:unknown,max:number)=>typeof x==='number'&&Number.isFinite(x)?Math.max(0,Math.min(max,Math.round(x))):0;
 out.seen=Array.isArray(r.seen)?[...new Set(r.seen.filter((x):x is TrophyId=>typeof x==='string'&&IDS.has(x)))]:[];
 out.match=n(r.match,MATCH.length);out.compare=n(r.compare,COMPARE.length);return out;
}
export const stars=(score:number,of:number)=>score>=of?3:score>=Math.ceil(of*.66)?2:score>0?1:0;
/** Exponential follow (frame-rate independent): the kit's calm motion. */
export const follow=(v:number,to:number,dt:number,tau:number)=>to+(v-to)*Math.exp(-dt/tau);
/** Turntable inertia: the spin speed decays (rad/s), and stops below a crawl. */
export const coast=(vel:number,dt:number)=>{const v=vel*Math.exp(-dt*2.4);return Math.abs(v)<.05?0:v;};
