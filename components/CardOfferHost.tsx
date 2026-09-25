'use client';
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {CARD_COMPLETE,CARD_OFFER_OPEN,cardRewardsActive,readCardOffers,useCardOffers} from '@/lib/town/cardRewardStore';
import {CARD_EXPLORE_ITEMS,earnForExplore,earnForJourney} from '@/lib/town/cardRewardTriggers';
import {LEARNING_STAGE_COMPLETE} from '@/lib/town/learningProgress';
import {useExploreChecklist} from '@/lib/town/exploreChecklist';
const CardOffer=dynamic(()=>import('./CardOffer'),{ssr:false});

/** Shown once per page session: the "every card collected" message. */
let completeShown=false;
/** Explore items already complete when the watcher first ran; only later completions pay. */
let exploreBaseline:Set<string>|null=null;
const CARD_EXPLORE_IDS=new Set<string>(CARD_EXPLORE_ITEMS.map(item=>item.id));

/**
 * Explore items have no completion event (completion is derived from four stores), so this watcher compares the checklist
 * with the items already complete when it first ran. Mounted only while rewards are on (no subscriptions otherwise).
 */
function ExploreCardWatcher(){
 const done=useExploreChecklist().filter(item=>item.complete&&CARD_EXPLORE_IDS.has(item.id)).map(item=>item.id),key=done.join('|');
 useEffect(()=>{
  if(exploreBaseline===null){exploreBaseline=new Set(done);return;}
  for(const id of done)if(!exploreBaseline.has(id)){exploreBaseline.add(id);earnForExplore(id);}
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 return null;
}
/**
 * Mounted once in Town. Nothing renders (and the offer code is not loaded) until there is an offer to show. A new offer opens
 * at the next calm moment (`blocked` is false: no ball lesson, chat or other card dialog in the way); an offer set aside opens
 * again from the Paths badge or the binder pill (CARD_OFFER_OPEN). `onOpenChange` lets Town sleep the 3D island behind it.
 */
export default function CardOfferHost({blocked,onOpenChange}:{blocked:boolean;onOpenChange:(open:boolean)=>void}){
 const offers=useCardOffers(),fresh=offers.find(offer=>!offer.seen);
 const [openId,setOpenId]=useState<string|null>(null),[complete,setComplete]=useState(false);
 useEffect(()=>{if(!openId&&!complete&&!blocked&&fresh)setOpenId(fresh.id);},[openId,complete,blocked,fresh]);
 useEffect(()=>{if(!cardRewardsActive())return;
  const open=()=>{const first=readCardOffers()[0];if(first)setOpenId(first.id);};
  const done=()=>{if(completeShown)return;completeShown=true;setComplete(true);};
  // Learning Journey stages: learningProgress fires this after a stage is newly completed.
  const stage=(event:Event)=>{const detail=(event as CustomEvent<{id:string;stage:number}>).detail;if(detail)earnForJourney(detail.id,detail.stage);};
  window.addEventListener(CARD_OFFER_OPEN,open);window.addEventListener(CARD_COMPLETE,done);window.addEventListener(LEARNING_STAGE_COMPLETE,stage);
  return()=>{window.removeEventListener(CARD_OFFER_OPEN,open);window.removeEventListener(CARD_COMPLETE,done);window.removeEventListener(LEARNING_STAGE_COMPLETE,stage);};},[]);
 const showing=!!openId||(complete&&!blocked);
 useEffect(()=>{onOpenChange(showing);},[showing,onOpenChange]);
 const watcher=cardRewardsActive()&&<ExploreCardWatcher/>;
 if(!showing)return watcher||null;
 return <>{watcher}<CardOffer key={openId??'note'} offerId={openId} complete={complete&&!openId}
  onClose={()=>{setOpenId(null);setComplete(false);}}/></>;
}
