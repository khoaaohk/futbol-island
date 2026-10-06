// Freestyle routines (Oct 4 2026): each freestyler's seeded, looping timeline of tricks, idle beats and pair tricks
// (lib/graphics/freestyleTricks.ts). Built once per NPC; sampling is a lookup into it, so the square looks alive without a visible
// loop (the shortest cycle is ~2 minutes) and costs nothing extra per frame.
// Pairs share one timeline skeleton: the pair tricks start at the same clock time on both partners, so the ball they pass is in
// the right place for both. Every segment starts and ends with a sole on the ball at TRICK_REST, so segments chain with no jumps.
import {trickById,type TrickDef} from './freestyleTricks';

export type RoutineSeg={start:number;dur:number;kind:'idle'|'trick'|'pair';trick:TrickDef|null;side:-1|1;to:-1|1;role:'solo'|'lead'|'follow';seed:number};
export type Routine={segs:RoutineSeg[];cycle:number;offset:number};
/** Speciality pools (trick id, weight) per freestyler. Court: Teo lowers, Zuri ball mastery, Kei thighs and sit-downs, Iza uppers. */
export const FREESTYLE_POOLS:Record<string,readonly (readonly [string,number])[]>={
 'court-nico':[['aroundWorld',3],['aroundWorldIn',3],['crossover',3],['toeStall',2],['heelFlick',2],['keepUps',1],['instepCatch',1]],
 'court-zuri':[['soleRolls',3],['toeTaps',3],['insideOutside',3],['keepUps',2],['sitJuggle',1.5],['instepCatch',1.5],['toeStall',1]],
 'court-kei':[['kneeJuggles',3],['thighFoot',3],['sitJuggle',2],['lieJuggle',2],['sitToStand',2],['sitCatch',2],['keepUps',1]],
 'court-iza':[['headJuggles',3],['headStall',3],['chestJuggles',3],['neckStall',2],['shoulderRoll',2],['kneeJuggles',1],['keepUps',1]],
 // Coral Cay's soft sand suits sit-downs; the jetty (East Pier) keeps to standing touches.
 'cay-lua':[['sitJuggle',3],['lieJuggle',2],['keepUps',2],['kneeJuggles',2],['headJuggles',2],['chestJuggles',1.5],['toeStall',1.5]],
 'cay-tavi':[['kneeJuggles',3],['thighFoot',3],['chestJuggles',2],['headJuggles',2],['sitCatch',1.5],['heelFlick',1.5],['keepUps',1]],
 'pier-ollie':[['keepUps',3],['toeStall',2],['instepCatch',2],['toeTaps',2],['soleRolls',2],['insideOutside',2],['kneeJuggles',2]],
};
const FALLBACK_POOLS=['court-nico','court-zuri','court-kei','court-iza'];
/** Probability of the right foot (Teo right-footed, Kei left-footed, the others mixed). */
const FOOT:Record<string,number>={'court-nico':.8,'court-zuri':.5,'court-kei':.3,'court-iza':.6};
/** Partners stand ~5 m apart on the court (Teo–Kei and Zuri–Iza); the first id leads the first pair trick. */
export const FREESTYLE_PAIRS:readonly (readonly [string,string])[]=[['court-nico','court-kei'],['court-zuri','court-iza']];
export const PAIR_TRICK_IDS=['pairVolley','pairHeader','pairGround'] as const;
/** If a partner is busy (talking to you, or knocked over), the pair window is played solo as keep-ups, time-scaled. */
export const PAIR_FALLBACK='keepUps';

export const hashId=(id:string)=>{let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
export function rng(seed:number){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const poolFor=(id:string,variant:number)=>FREESTYLE_POOLS[id]??FREESTYLE_POOLS[FALLBACK_POOLS[((variant%4)+4)%4]];
/** Idle beats and solo tricks filling exactly `length` seconds, from a sole on the ball with foot `from` to foot `to`. */
function stretch(out:RoutineSeg[],t0:number,length:number,from:-1|1,to:-1|1,id:string,variant:number,r:()=>number){
 const pool=poolFor(id,variant).map(([k,w])=>({def:trickById(k)!,w})).filter(p=>p.def),foot=FOOT[id]??.6,recent:string[]=[];
 let t=0,side=from;
 for(let guard=0;guard<64;guard++){
  const choices=pool.filter(p=>!recent.includes(p.def.id)),total=choices.reduce((s,p)=>s+p.w,0);let pick=r()*total,chosen=choices[0];
  for(const c of choices){pick-=c.w;if(pick<=0){chosen=c;break;}}
  const idle=1.2+r()*2.3,next:-1|1=r()<foot?1:-1;
  if(t+idle+chosen.def.seconds+1.2>length)break;
  out.push({start:t0+t,dur:idle,kind:'idle',trick:null,side,to:next,role:'solo',seed:r()*6});t+=idle;
  out.push({start:t0+t,dur:chosen.def.seconds,kind:'trick',trick:chosen.def,side:next,to:next,role:'solo',seed:0});t+=chosen.def.seconds;side=next;
  recent.push(chosen.def.id);if(recent.length>Math.min(4,pool.length-2))recent.shift();
 }
 out.push({start:t0+t,dur:length-t,kind:'idle',trick:null,side,to,role:'solo',seed:r()*6});
}
/** A solo freestyler: ~2.5 minutes of seeded tricks, starting at a seeded point of the loop. */
export function buildSoloRoutine(id:string,variant:number):Routine{
 const r=rng(hashId(id)^0x51ed),segs:RoutineSeg[]=[],cycle=140+r()*30;
 stretch(segs,0,cycle,1,1,id,variant,r);
 return {segs,cycle,offset:r()*cycle};
}
/** Two partners: four periods of solo play, each ending in a pair trick that both start at the same time. */
export function buildPairRoutines(a:string,b:string,variantA=0,variantB=0):[Routine,Routine]{
 const shared=rng(hashId(a+'|'+b)),ra=rng(hashId(a)^0x9e37),rb=rng(hashId(b)^0x9e37),A:RoutineSeg[]=[],B:RoutineSeg[]=[];
 const periods=Array.from({length:4},(_,k)=>({solo:30+shared()*14,trick:trickById(PAIR_TRICK_IDS[k%PAIR_TRICK_IDS.length])!,side:(shared()<.7?1:-1) as -1|1,aLeads:k%2===0}));
 let t=0,side=periods[periods.length-1].side;
 for(const p of periods){
  stretch(A,t,p.solo,side,p.side,a,variantA,ra);stretch(B,t,p.solo,side,p.side,b,variantB,rb);t+=p.solo;
  A.push({start:t,dur:p.trick.seconds,kind:'pair',trick:p.trick,side:p.side,to:p.side,role:p.aLeads?'lead':'follow',seed:0});
  B.push({start:t,dur:p.trick.seconds,kind:'pair',trick:p.trick,side:p.side,to:p.side,role:p.aLeads?'follow':'lead',seed:0});
  t+=p.trick.seconds;side=p.side;
 }
 return [{segs:A,cycle:t,offset:0},{segs:B,cycle:t,offset:0}];
}
