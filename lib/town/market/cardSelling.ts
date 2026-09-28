/**
 * Card trade-ins at the farmers-market sell stand (docs/sell-shop.md "Cards"). Owned by the sell-shop agent; the stand
 * itself (components/FishMarket.tsx, fishing agent) renders the Cards section (components/MarketCardsSection.tsx).
 *
 * Pure core only: no React, no storage, no JSON imports, so tests can run it directly. The browser binding with the real
 * collection, tiers and wallet is ./cardSellingStore.ts.
 *
 * Kid-safety rules (docs/card-rewards.md): cards are earned by learning and the binder never holds duplicates, so a trade-in
 * takes the card OUT of the binder. To protect the collection loop:
 *  - CARD_TRADE_MODE ships 'off' (the safest behaviour) until the user confirms the trade-in design;
 *  - one flat, low price for every tradeable card (no tier or rarity is revealed by price);
 *  - the game's greatest players (Icon tier) and every coin-bought pack legend can never be traded;
 *  - a small daily limit (CARD_TRADES_PER_DAY), and the UI always asks for a confirmation;
 *  - no money loop: every pack costs more than the most its cards could ever trade for (see maxPackTradeValue).
 * In-game coins only, never real money.
 */
export type CardTradeMode='off'|'trade-in';
/** SHIPPED DEFAULT. 'off' = cards cannot be sold (the Cards section explains why). Switch to 'trade-in' once the user confirms. */
export const CARD_TRADE_MODE:CardTradeMode='trade-in'; // switched on by the user, Sep 27 2026
/** Coins for any tradeable card. Deliberately tiny next to a 7-10 coin island job and a 40-coin pack. */
export const CARD_TRADE_COINS=2;
/** Cards a child can trade in per local day. */
export const CARD_TRADES_PER_DAY=3;
export const CARD_TRADE_STORAGE_KEY='fi2-card-trade-v1';
const HISTORY_LIMIT=20;

export type CardTrade={name:string;coins:number;at:number};
export type CardTradeLedger={version:1;day:string;today:string[];trades:number;lifetime:number;history:CardTrade[]};
export type TradeBlock='off'|'not-owned'|'protected'|'day-limit';
export type TradeVerdict={ok:true;coins:number}|{ok:false;reason:TradeBlock};
export type TradeResult={ok:true;name:string;coins:number;credited:number;left:number;message:string}|{ok:false;reason:TradeBlock|'storage';message:string};

const whole=(v:unknown,max=1e9)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
const name=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<120;
export const emptyCardTradeLedger=(day=''):CardTradeLedger=>({version:1,day,today:[],trades:0,lifetime:0,history:[]});
export function sanitizeCardTradeLedger(value:unknown,day:string):CardTradeLedger{
 const v=value&&typeof value==='object'?value as Partial<CardTradeLedger>:{},out=emptyCardTradeLedger(day);
 if(v.day===day&&Array.isArray(v.today))out.today=[...new Set(v.today.filter(name))].slice(0,CARD_TRADES_PER_DAY);
 out.trades=Math.max(whole(v.trades),out.today.length);out.lifetime=whole(v.lifetime);
 if(Array.isArray(v.history))out.history=v.history.filter(t=>t&&name(t.name)).slice(-HISTORY_LIMIT).map(t=>({name:t.name,coins:whole(t.coins,CARD_TRADE_COINS),at:whole(t.at,9e15)}));
 return out;
}
export const tradesLeft=(ledger:CardTradeLedger)=>Math.max(0,CARD_TRADES_PER_DAY-ledger.today.length);

/** Can this card be traded right now? Order matters for the message: off, then ownership, then protection, then the daily limit. */
export function cardTradeVerdict(card:string,{mode,owned,isProtected,ledger}:{mode:CardTradeMode;owned:ReadonlySet<string>;isProtected:(name:string)=>boolean;ledger:CardTradeLedger}):TradeVerdict{
 if(mode!=='trade-in')return {ok:false,reason:'off'};
 if(!owned.has(card))return {ok:false,reason:'not-owned'};
 if(isProtected(card))return {ok:false,reason:'protected'};
 if(!tradesLeft(ledger))return {ok:false,reason:'day-limit'};
 return {ok:true,coins:CARD_TRADE_COINS};
}
export const TRADE_MESSAGES:Record<TradeBlock|'storage',string>={
 off:'Your cards stay safe in your binder. You earned them by learning!',
 'not-owned':'That card is not in your binder.',
 protected:'The kit-man says this one is too special to trade. Keep it in your binder!',
 'day-limit':`That is ${CARD_TRADES_PER_DAY} trade-ins today. Come back tomorrow if you still want to swap.`,
 storage:'This browser could not save the trade, so your card is still in your binder.',
};

/** The most coins a pack's cards could EVER trade for, even if nothing were protected: every card at the flat price. */
export const maxPackTradeValue=(cardsInPack:number)=>Math.max(0,Math.floor(cardsInPack))*CARD_TRADE_COINS;
/** True when no pack in the list can be bought and traded back for as many coins as it cost. */
export const noPackLoop=(packs:readonly {size:number;price:number}[])=>packs.every(p=>maxPackTradeValue(p.size)<p.price);

export type CardTradePorts={
 mode:()=>CardTradeMode;
 readLedger:()=>unknown;writeLedger:(ledger:CardTradeLedger)=>void;
 readCollection:()=>string[];
 /** Removes the card from the binder; returns true only when it is really gone. */
 removeCard:(name:string)=>boolean;
 isProtected:(name:string)=>boolean;
 credit:(id:string,amount:number,reason:string)=>Promise<number>;
 day:(now:number)=>string;now?:()=>number;
};
export function createCardTrade(ports:CardTradePorts){
 const now=ports.now??(()=>Date.now()),listeners=new Set<()=>void>();
 const ledger=()=>{let raw:unknown=null;try{raw=ports.readLedger();}catch{}return sanitizeCardTradeLedger(raw,ports.day(now()));};
 const context=()=>({mode:ports.mode(),owned:new Set(ports.readCollection()),isProtected:ports.isProtected,ledger:ledger()});
 /** Owned cards that could be traded (ignoring the daily limit, so the list does not vanish after the third trade). */
 function tradeable(){const c=context();return c.mode==='trade-in'?[...c.owned].filter(n=>!c.isProtected(n)):[];}
 async function trade(card:string):Promise<TradeResult>{
  const c=context(),verdict=cardTradeVerdict(card,c);
  if(!verdict.ok)return {ok:false,reason:verdict.reason,message:TRADE_MESSAGES[verdict.reason]};
  // Ledger first (it is what enforces the daily limit), then the binder, then coins. A card is never paid for twice:
  // the wallet run id is fixed per day and trade number, and the wallet ignores a repeated id.
  const at=now(),l=c.ledger,next:CardTradeLedger={...l,today:[...l.today,card],trades:l.trades+1,lifetime:l.lifetime+verdict.coins,history:[...l.history,{name:card,coins:verdict.coins,at}].slice(-HISTORY_LIMIT)};
  try{ports.writeLedger(next);}catch{return {ok:false,reason:'storage',message:TRADE_MESSAGES.storage};}
  let removed=false;try{removed=ports.removeCard(card);}catch{}
  if(!removed){try{ports.writeLedger(l);}catch{}return {ok:false,reason:'storage',message:TRADE_MESSAGES.storage};}
  const credited=await ports.credit(`card-trade:${next.day}:${next.trades}`,verdict.coins,`Card trade-in · ${card}`.slice(0,110));
  listeners.forEach(f=>f());
  const left=tradesLeft(next);
  return {ok:true,name:card,coins:verdict.coins,credited,left,message:left?`${card} is off to a new fan. ${left} more trade-in${left===1?'':'s'} today.`:`${card} is off to a new fan. That is all the trade-ins for today.`};
 }
 return {
  mode:()=>ports.mode(),ledger,tradeable,trade,
  verdict:(card:string)=>cardTradeVerdict(card,context()),
  subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},
 };
}
