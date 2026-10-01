'use client';
/**
 * Browser binding for card trade-ins (pure rules in ./cardSelling.ts, design in docs/sell-shop.md "Cards").
 * Coins go through the island jobs bridge (lib/town/jobs/islandWallet.ts) into the shared wallet owned by the arcade,
 * whose files are only imported here, never edited. No timers or polling: everything runs on a tap.
 */
import {ALL_PLAYERS,CARD_STORAGE_KEY,UNLOCK_ALL_CARDS,cardDevEarn,readCollection} from '../cardCollection';
import {cardRewardsActive} from '../cardRewardStore';
import {cardTier} from '../cardTiers';
import {LEGEND_PACK_CANDIDATES} from '@/lib/arcade/legendPacks';
import {readArcadeWallet} from '@/lib/arcade/arcadeWallet';
import {islandJobWallet} from '../jobs/islandWallet';
import {localMarketDay} from './market';
import {CARD_TRADE_MODE,CARD_TRADE_STORAGE_KEY,createCardTrade,type CardTradeMode} from './cardSelling';
import {devUnlockHostAllowed} from '../../dev/devUnlockGate';

/** Fired after a card leaves the binder, so open card views can re-read the collection. */
export const CARD_REMOVED='fi2-card-removed';
/** Dev-only preview of trade-ins before the user confirms: `?cardtrade=on` / `?cardtrade=off`. Ignored in production builds. */
export const CARD_TRADE_DEV_KEY='fi2-card-trade-dev-v1';
let dev:boolean|null=null;
function devTradeIn():boolean{
 if(process.env.NODE_ENV==='production'||typeof window==='undefined'||!devUnlockHostAllowed({nodeEnv:process.env.NODE_ENV,hostname:window.location?.hostname??''}))return false;// QA11: dev flags need localhost too (lib/dev/devUnlockGate.ts)
 if(dev!==null)return dev;
 try{const q=new URLSearchParams(location.search).get('cardtrade');if(q==='on')localStorage.setItem(CARD_TRADE_DEV_KEY,'on');else if(q==='off')localStorage.removeItem(CARD_TRADE_DEV_KEY);dev=localStorage.getItem(CARD_TRADE_DEV_KEY)==='on';}catch{dev=false;}
 return dev;
}
/** Trade-ins need the real, earned collection: never while the testing "every card unlocked" switch is on. */
export function cardTradeMode():CardTradeMode{
 if(UNLOCK_ALL_CARDS&&!cardDevEarn())return 'off';
 if(!cardRewardsActive())return 'off';
 return devTradeIn()?'trade-in':CARD_TRADE_MODE;
}
const LEGENDS=new Set<string>(LEGEND_PACK_CANDIDATES);
/** Icons (the game's greatest players) and every legend a child bought with coins always stay in the binder. */
export function isProtectedCard(name:string):boolean{
 if(cardTier(name)==='icon'||LEGENDS.has(name))return true;
 try{return readArcadeWallet().packs.some(p=>p.player===name||(p.legends??[]).includes(name));}catch{return true;}
}
function removeCard(name:string):boolean{
 const saved=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');
 if(!Array.isArray(saved)||!saved.includes(name))return false;
 localStorage.setItem(CARD_STORAGE_KEY,JSON.stringify(saved.filter((n:unknown)=>typeof n==='string'&&n!==name&&ALL_PLAYERS.includes(n))));
 const after=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');
 const gone=Array.isArray(after)&&!after.includes(name);
 if(gone)window.dispatchEvent(new CustomEvent(CARD_REMOVED,{detail:{name}}));
 return gone;
}
export const cardTrade=createCardTrade({
 mode:cardTradeMode,
 readLedger:()=>JSON.parse(localStorage.getItem(CARD_TRADE_STORAGE_KEY)??'null'),
 writeLedger:v=>localStorage.setItem(CARD_TRADE_STORAGE_KEY,JSON.stringify(v)),
 readCollection,removeCard,isProtected:isProtectedCard,
 credit:(id,amount,reason)=>islandJobWallet.credit(id,amount,reason),
 day:localMarketDay,
});
