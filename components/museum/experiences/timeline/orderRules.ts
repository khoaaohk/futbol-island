/**
 * timeline · "Order it" (Oct 10 2026; user: the old pixel penalty "was more interactive", "the other exhibits need to be more
 * interactive"; pixel-iso pass the same day: the time machine's game, cases dealt as cartridges). Pure rules, so
 * tests/museum-exp-timeline.cjs can play it in Node.
 *
 * A 60-second round. A set of the museum's own cases is dealt face down on their years (titles only, shuffled). Drag them into
 * order, oldest at the top, and lock it in. Every case on its right step scores; the whole set right scores a bonus that grows
 * with the streak of perfect sets, and a quick perfect set adds a speed bonus. Sets 1–2 have three cases, then four. The clock
 * pauses while the answer shows (the years spring up, wrong cases slide to their places). Reduced motion: no clock, five sets.
 * The idea it teaches: football changed one rule, one idea at a time, and each change came after the one before.
 */
import {realYear,yearsBetween} from './machine';

export type Item={id:string;title:string;year:string;accent:string;y:number};
export const CLOCK_MS=60_000,HURRY_MS=10_000,SETS_REDUCED=5;
export const PLACE=50,PERFECT=100,STREAK_MAX=4,QUICK=50,QUICK_MS=8_000;
export const BEST_KEY='fi2-museum-timeline-order-best';

/** A tiny seeded generator (mulberry32), so a deal can be replayed and tested. */
export function rng(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
/** The pool: every case on the wall, with its year as a number (eras.ts order is already oldest first). */
export const toItem=(e:{id:string;title:string;year:string},accent:string,now?:number):Item=>({id:e.id,title:e.title,year:e.year,accent,y:realYear(e.year,now)});
/** Only cases with one exact year are dealt: "Before the 1960s" and "Today" could fairly go either way against a dated case. */
export const dated=(e:{year:string})=>/^\d{4}$/.test(e.year);
/** Set k (0-based) has three cases at first, then four. */
export const setSize=(k:number)=>k<2?3:4;
/** The right order for a set: oldest first. */
export const sorted=(items:readonly Item[])=>[...items].sort((a,b)=>a.y-b.y);
export const inOrder=(items:readonly Item[])=>items.every((x,i)=>i===0||items[i-1].y<=x.y);

/**
 * Deal set k: `setSize(k)` cases with different years (two cases from the same year could go either way), avoiding the last
 * set's cases when it can, shuffled so they are never already in order.
 */
export function deal(pool:readonly Item[],k:number,seed:number,avoid:readonly string[]=[]):Item[]{
 const r=rng(seed+k*7919),n=setSize(k),fresh=pool.filter(x=>!avoid.includes(x.id)),from=fresh.length>=n+2?fresh:[...pool];
 const bag=[...from];for(let i=bag.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
 const out:Item[]=[];for(const x of bag){if(out.length>=n)break;if(!out.some(o=>o.y===x.y))out.push(x);}
 if(inOrder(out)&&out.length>1)[out[0],out[out.length-1]]=[out[out.length-1],out[0]];
 return out;
}
/** Move the case at `from` to slot `to`; the others close up. */
export function move<T>(list:readonly T[],from:number,to:number):T[]{const a=[...list];const [x]=a.splice(from,1);a.splice(Math.max(0,Math.min(a.length,to)),0,x);return a;}
/** Swap two cases (tap one, then the other). */
export function swap<T>(list:readonly T[],a:number,b:number):T[]{const c=[...list];[c[a],c[b]]=[c[b],c[a]];return c;}
/** The slot a dragged card is over: its start slot plus how many rows the finger has travelled. */
export const slotAt=(dy:number,row:number,from:number,n:number)=>Math.max(0,Math.min(n-1,from+Math.round(dy/(row||1))));
/** For each step of the player's order: is the right case on it? */
export function marks(order:readonly Item[]):boolean[]{const s=sorted(order);return order.map((x,i)=>x.y===s[i].y);}

/** Points for a locked set. `ms` = time taken (null when untimed: no speed bonus). */
export function setPoints(m:readonly boolean[],streak:number,ms:number|null){
 const right=m.filter(Boolean).length,perfect=right===m.length,s=perfect?streak+1:0;
 const bonus=perfect?PERFECT*Math.min(STREAK_MAX,s):0,quick=perfect&&ms!=null?Math.round(QUICK*Math.max(0,1-ms/QUICK_MS)):0;
 return {points:right*PLACE+bonus+quick,right,perfect,streak:s,bonus,quick};
}

/** One sentence that teaches from the set: how far apart a perfect set spans, or the first pair the player had the wrong way. */
export function lesson(order:readonly Item[]):string{
 const s=sorted(order),a=s[0],b=s[s.length-1];
 if(inOrder(order)){const gap=yearsBetween(a.year,b.year);return `Right order! ${a.title} (${a.year}) came first${gap?`, ${gap} years before ${b.title}`:`, and ${b.title} (${b.year}) came last`}.`;}
 for(let i=1;i<order.length;i++){const x=order[i-1],y=order[i];if(x.y>y.y)return `Not quite: ${y.title} (${y.year}) came before ${x.title} (${x.year}).`;}
 return 'Not quite.';
}
/**
 * The round's quick check (Oct 12 2026 polish: the summary had no question): two of the museum's own dated cases, far enough
 * apart to be fair, "Which came first?". The why gives both years from the cases themselves; no new facts.
 */
export function orderCheck(pool:readonly Item[],seed:number):{q:string;options:[string,string];right:number;why:string}{
 const r=rng(seed^0x5eed),ds=pool.filter(x=>Number.isFinite(x.y));let a=ds[0],b=ds[ds.length-1];
 for(let i=0;i<24;i++){const x=ds[Math.floor(r()*ds.length)],y=ds[Math.floor(r()*ds.length)];if(x&&y&&Math.abs(x.y-y.y)>=8){a=x;b=y;break;}}
 const [old,neu]=a.y<=b.y?[a,b]:[b,a],mid=(t:string)=>t.replace(/^The /,'the '),flip=r()<.5,options:[string,string]=flip?[neu.title,old.title]:[old.title,neu.title],gap=yearsBetween(old.year,neu.year);
 return {q:'Which came first?',options,right:flip?1:0,why:`${old.title} (${old.year}) came first${gap?`, ${gap} years before ${mid(neu.title)} (${neu.year})`:`, then ${mid(neu.title)} (${neu.year})`}.`};
}
export const verdict=(score:number)=>score>=1400?'Time traveller':score>=900?'Historian':score>=450?'Curator':'Visitor';
