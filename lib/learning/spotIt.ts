import {conceptForFeed,conceptForStat,conceptWords,type ConceptId} from './conceptMap';
/**
 * Live-match "Spot it!" callouts (docs/learning/apply-in-play.md). When the live sim plays a concept the child has already
 * learned (a one-two, an overlap, a switch of play, an offside call…), a small "You learned this!" card offers the lesson.
 *
 * Heat: nothing here runs per frame. matchEffects already compares the combos feed serial and the sim's stat counters once
 * per update; it calls reportMatchConcept only when one of those CHANGES and only while that pitch is on screen, not in a
 * lesson and the camera is near (the `watching` flag from fieldRuntime). The gate then throttles: one callout per
 * SPOT_IT_GAP_MS on the whole island, the same concept at most once per SPOT_IT_CONCEPT_GAP_MS, SPOT_IT_SESSION_MAX per visit.
 * The UI (LearningHost) shows one DOM card with a single timeout. With nothing connected (host not mounted), it is a no-op.
 */
export const SPOT_IT_GAP_MS=90_000,SPOT_IT_CONCEPT_GAP_MS=10*60_000,SPOT_IT_SESSION_MAX=6,SPOT_IT_SHOW_MS=8_000;
export type SpotItOffer={format:string;concept:ConceptId;lesson:string;title:string;line:string;at:number};
export type SpotItContext={watching:boolean;now:number;learned:(concept:ConceptId,format:string)=>string|null};
export function createSpotItGate(opts:{gap?:number;conceptGap?:number;max?:number}={}){
 const gap=opts.gap??SPOT_IT_GAP_MS,conceptGap=opts.conceptGap??SPOT_IT_CONCEPT_GAP_MS,max=opts.max??SPOT_IT_SESSION_MAX;
 let last=-Infinity,shown=0;const per=new Map<ConceptId,number>();
 return {
  offer(format:string,concept:ConceptId|null,ctx:SpotItContext):SpotItOffer|null{
   // Cheapest checks first: off screen / not near / throttled never touch the learning store.
   if(!concept||!ctx.watching||shown>=max||ctx.now-last<gap||ctx.now-(per.get(concept)??-Infinity)<conceptGap)return null;
   const lesson=ctx.learned(concept,format);if(!lesson)return null;
   last=ctx.now;shown++;per.set(concept,ctx.now);
   // Words scale with the pitch being watched (7v7 simplest → 11v11 fullest); the beach court reads like futsal/7v7.
   const words=conceptWords(concept,format);
   return {format,concept,lesson,title:words.title,line:words.line,at:ctx.now};
  },
  get shown(){return shown;},
 };
}
let gate=createSpotItGate(),sink:((offer:SpotItOffer)=>void)|null=null,learned:SpotItContext['learned']|null=null;
/** LearningHost connects the UI and the "has the child learned it" lookup; returns the disconnect. */
export function connectSpotIt(lookup:SpotItContext['learned'],show:(offer:SpotItOffer)=>void){learned=lookup;sink=show;return()=>{if(sink===show){sink=null;learned=null;}};}
/** Tests: a fresh gate. */
export function resetSpotIt(opts?:Parameters<typeof createSpotItGate>[0]){gate=createSpotItGate(opts);}
/** Called by matchEffects when a concept happens on a live pitch. Returns the offer shown, if any. */
export function reportMatchConcept(format:string,concept:ConceptId|null,watching:boolean,now=Date.now()):SpotItOffer|null{
 if(!sink||!learned||!watching||!concept)return null;
 let offer:SpotItOffer|null=null;try{offer=gate.offer(format,concept,{watching,now,learned});}catch{return null;}
 if(offer)sink(offer);return offer;
}
/** matchEffects helpers: a combos feed line or a sim counter that ticked → concept. */
export const matchFeedConcept=conceptForFeed;
export const matchStatConcept=conceptForStat;
