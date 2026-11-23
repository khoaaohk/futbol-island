/**
 * Practice plan generator (Nov 22 2026; /tools/soccer-practice-plan-generator, and later the /coach app's practice planner).
 * Pure and import-free (tests/more-tools.cjs): it takes the drill catalog as an argument, so the site passes its own drills
 * (lib/site/tools/practicePlanDrills.ts reads lib/site/drills.ts) and the coach app can pass the same list.
 *
 * SHAPE: warm-up, two drills for the focus, a water break, a small-sided game, a cool-down; a second water break from 75
 * minutes. This follows U.S. Soccer's Play-Practice-Play model (lib/site/drills.ts sources: a playful start, a practice phase
 * of game-like activities, and the session ends in a real game) and the session lengths of US Youth Soccer's "How to Write a
 * Training Session Plan" (U6 45 min, U8 45 to 60, U10 60 to 75, U12 75), which the plan uses for its age note.
 * SAFETY (the drills cluster's rules): no goalkeeper drills before U10, no heading drill exists, every drill on the plan
 * lists the chosen age group on its own page.
 * The minutes always add up to the chosen length exactly (tests). Choices are deterministic: the same seed and swaps give the
 * same plan, so a shared link shows the same practice.
 */
export type PlanAge='U6'|'U8'|'U10'|'U12';
export type Focus='passing'|'shooting'|'dribbling'|'defending'|'goalkeeping'|'fun';
export type BlockKind='warm'|'drill'|'water'|'game'|'cool';
export type CatalogDrill={slug:string;name:string;skill:string;ages:readonly string[];minMin:number;maxMin:number;line:string};
export type PlanOptions={age:PlanAge;minutes:number;players:number;focus:Focus;seed:number;swaps?:readonly number[]};
export type Block={kind:BlockKind;start:number;minutes:number;slug?:string;name?:string;line?:string;swappable:boolean};
export type Plan={blocks:Block[];total:number;ageNote:'ok'|'long'|'short';gkFallback:boolean;groups:string};
export const PLAN_AGES:readonly PlanAge[]=['U6','U8','U10','U12'];
export const PLAN_LENGTHS:readonly number[]=[45,60,75,90];
export const FOCUSES:readonly Focus[]=['passing','shooting','dribbling','defending','goalkeeping','fun'];
/** US Youth Soccer session lengths by age, in minutes (lowest and highest). */
export const AGE_LENGTH:Record<PlanAge,readonly [number,number]>={U6:[45,45],U8:[45,60],U10:[60,75],U12:[75,75]};
export const MIN_PLAYERS=4,MAX_PLAYERS=30;
/** Skills that serve each focus, in order of preference (ids from lib/site/drills.ts SKILLS). */
export const FOCUS_SKILLS:Record<Focus,readonly string[]>={passing:['passing','first-touch'],shooting:['shooting','attacking-1v1'],dribbling:['dribbling','attacking-1v1'],
 defending:['defending-1v1'],goalkeeping:['goalkeeper'],fun:['warm-up','dribbling','scanning','attacking-1v1']};
const WARM_SKILLS=['warm-up','dribbling','scanning'];

/** "8 to 10 minutes", "15 minutes, in games of four minutes", "12 to 15 minutes": the drill page's own time, as [min, max]. */
export function parseTime(s:string):[number,number]{const m=/^(\d+)(?:\s*to\s*(\d+))?\s*minutes/.exec(s.trim());if(!m)throw new Error(`practicePlan: cannot read the time "${s}"`);const a=Number(m[1]);return [a,m[2]?Number(m[2]):a];}
function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffled<T>(a:readonly T[],r:()=>number){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
/** The minutes of each block for a practice of `total` minutes. Sums to `total` exactly. */
export function timings(total:number){
 const t=Math.max(30,Math.min(120,Math.round(total))),water=t>=75?2:1,cool=5,rest=t-cool-water*2;
 const warm=Math.round(rest*.2),d1=Math.round(rest*.24),d2=Math.round(rest*.24),game=rest-warm-d1-d2;
 return {warm,d1,d2,game,cool,water,waterMin:2,total:t};
}
/** The largest side for a practice game at each age: 4v4 is the U6-U8 game format (U.S. Soccer), and practice games stay
 * small at every age so each child is close to the ball (the Play-Practice-Play model's 2v2 to 4v4, a little bigger later). */
export const MAX_SIDE:Record<PlanAge,number>={U6:3,U8:4,U10:5,U12:6};
/** How to split the players into teams for the game: as few games as fit the age's largest side; extra players rotate in. */
export function groups(players:number,age:PlanAge='U12'){
 const n=Math.max(MIN_PLAYERS,Math.min(MAX_PLAYERS,Math.round(players))),cap=MAX_SIDE[age]??6;
 const games=Math.max(1,Math.round(n/(2*cap))),perSide=Math.min(cap,Math.floor(n/(2*games))),spare=n-perSide*2*games;
 return {players:n,games,perSide,spare};
}
function candidates(cat:readonly CatalogDrill[],skills:readonly string[],age:PlanAge,used:Set<string>){
 return skills.flatMap(sk=>cat.filter(d=>d.skill===sk&&d.ages.includes(age)&&!used.has(d.slug)));
}
/** The plan. `swaps[i]` is how many times the coach pressed "swap" on block i (warm-up 0, drill 1, drill 2, game 3). */
export function makePlan(cat:readonly CatalogDrill[],o:PlanOptions):Plan{
 const age=PLAN_AGES.includes(o.age)?o.age:'U8',gkFallback=o.focus==='goalkeeping'&&(age==='U6'||age==='U8');
 const focus:Focus=gkFallback?'fun':FOCUSES.includes(o.focus)?o.focus:'fun',tm=timings(o.minutes),r=rng(o.seed),sw=o.swaps??[];
 const used=new Set<string>();
 const choose=(skills:readonly string[],i:number,first=false)=>{let list=candidates(cat,skills,age,used);
  if(!list.length)list=candidates(cat,['dribbling','warm-up','passing'],age,used);
  const prefer=first?list.filter(d=>d.skill===skills[0]):list,pool=shuffled(prefer.length?prefer:list,r),d=pool[(sw[i]??0)%pool.length];used.add(d.slug);return d;};
 const warm=choose(WARM_SKILLS,0),d1=choose(FOCUS_SKILLS[focus],1,true),d2=choose(FOCUS_SKILLS[focus],2),game=choose(['small-sided'],3);
 const blocks:Block[]=[];let at=0;
 const add=(kind:BlockKind,minutes:number,d?:CatalogDrill)=>{blocks.push({kind,start:at,minutes,slug:d?.slug,name:d?.name,line:d?.line,swappable:!!d});at+=minutes;};
 add('warm',tm.warm,warm);add('drill',tm.d1,d1);if(tm.water===2)add('water',tm.waterMin);add('drill',tm.d2,d2);add('water',tm.waterMin);add('game',tm.game,game);add('cool',tm.cool);
 const [lo,hi]=AGE_LENGTH[age],g=groups(o.players,age);
 return {blocks,total:at,ageNote:tm.total>hi?'long':tm.total<lo?'short':'ok',gkFallback,groups:`${g.games}x${g.perSide}v${g.perSide}+${g.spare}`};
}
/** URL state: ?age=U8&min=60&p=10&focus=passing&s=17&w=0.1.0.0 (unknown or broken values fall back to the defaults). */
export const DEFAULT_PLAN:PlanOptions={age:'U8',minutes:60,players:10,focus:'passing',seed:1,swaps:[0,0,0,0]};
export function encodePlan(o:PlanOptions){return `age=${o.age}&min=${o.minutes}&p=${o.players}&focus=${o.focus}&s=${o.seed}&w=${(o.swaps??[0,0,0,0]).join('.')}`;}
export function decodePlan(q:string):PlanOptions{
 const p=new Map(q.replace(/^\?/,'').split('&').filter(Boolean).map(kv=>{const i=kv.indexOf('=');return [decodeURIComponent(i<0?kv:kv.slice(0,i)),decodeURIComponent(i<0?'':kv.slice(i+1))] as [string,string];}));
 const age=p.get('age') as PlanAge,min=Number(p.get('min')),pl=Number(p.get('p')),focus=p.get('focus') as Focus,s=Number(p.get('s'));
 const w=(p.get('w')??'').split('.').map(Number);
 return {age:PLAN_AGES.includes(age)?age:DEFAULT_PLAN.age,minutes:PLAN_LENGTHS.includes(min)?min:DEFAULT_PLAN.minutes,players:Number.isFinite(pl)&&pl>=MIN_PLAYERS&&pl<=MAX_PLAYERS?Math.round(pl):DEFAULT_PLAN.players,
  focus:FOCUSES.includes(focus)?focus:DEFAULT_PLAN.focus,seed:Number.isInteger(s)&&s>0&&s<1e9?s:DEFAULT_PLAN.seed,swaps:[0,1,2,3].map(i=>Number.isInteger(w[i])&&w[i]>=0&&w[i]<100?w[i]:0)};
}
/** "0:00" style clock offsets for the printed plan. */
export const mmss=(min:number)=>`${Math.floor(min/60)}:${String(min%60).padStart(2,'0')}`;
