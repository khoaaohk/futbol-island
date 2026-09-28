import {readableBook} from '../books/catalog';
import {HOME_DECOR_ENABLED} from './homeFeature';
import type {PackSpec,VendingItem} from './vendingCatalog';
import {LEGEND_PACK_CANDIDATES,PACKS_PER_DAY,PACK_RESTOCK_MESSAGE} from '../arcade/legendPacks';
/** The six mental-strength legends keep their guaranteed pack slot even before the Icon tier gate opens (user, 28 Sep 2026). */
const MENTAL_LEGENDS=new Set<string>(LEGEND_PACK_CANDIDATES);

/**
 * Vending ledger rules (pure; browser wiring in vendingWallet.ts, tests in tests/vending-machines.cjs).
 *
 * - Owned = the free starters + everything bought + the one-time "already yours" snapshot. The snapshot runs on the first read
 *   and keeps every ride the player had unlocked, every costume they had earned and whatever they had equipped, so nothing a
 *   player already has is ever locked again (docs/vending-machines.md, "No re-locking").
 * - Unlock rules stay where they are: rides need finished paths (rideUnlocks.ts), costumes need found balls (coinQuest.ts). A
 *   locked item can't be bought; once unlocked it costs coins. Specials and balls have no unlock rule.
 * - Production spending and ownership receipts live in the shared wallet. This ledger mirrors history and old unlock grants. Card packs use the wallet's
 *   own purchaseMysteryPack, so their cost stays in the wallet (not here), with the candidates filtered to cards the player
 *   doesn't have yet, so a pack never hands out a duplicate.
 */
export type VendingSpend={id:string;cost:number;at:number;debitId?:string};
type State={version:1;owned:string[];spend:VendingSpend[];found:string[]};
export type VendingLedgerSnapshot={ready:boolean;owned:readonly string[];spent:number;found:readonly string[];history:readonly VendingSpend[]};
export const EMPTY_VENDING:VendingLedgerSnapshot={ready:false,owned:[],spent:0,found:[],history:[]};
export const GEAR_KEYS=['ball','scooter','bike','moped','jetpack'] as const;
/** Free starters: the first ball and ride in every category, and no costume. */
export const VENDING_STARTERS=new Set(['ball:classic','scooter:classic','bike:classic','moped:classic','jetpack:classic','costume:none']);
export type BuyResult={ok:true;packId?:string}|{ok:false;reason:string};
type Ports={
 receipts?:()=>VendingSpend[];payItem?:(item:VendingItem)=>Promise<BuyResult>;
 read:()=>unknown;write:(value:unknown)=>void;readSavedLook:()=>unknown;readCollection:()=>string[];arcadeBalance:()=>number;
 lock:<T>(fn:()=>T|Promise<T>)=>Promise<T>;buyPack:(pack:PackSpec)=>Promise<{ok:true;pack:{id:string}}|{ok:false;reason:string}>;now:()=>number;
 /** Current unlock rules (rides: finished paths + remembered grants; costumes: balls found). */
 /** Economy pass (28 Sep 2026): the Icon tier gate for pack slots, every card (to top up a pack), and packs opened today. */
 iconsOpen?:()=>boolean;tierOf?:(name:string)=>string;allCards?:()=>readonly string[];packsToday?:()=>number;
 rideUnlocked?:(category:string,id:string)=>boolean;snapshotRideUnlocked?:(category:string,id:string)=>boolean;costumeEarned?:(id:string)=>boolean;allRides?:()=>{category:string;id:string}[];allCostumes?:()=>string[];
};
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<120;
export function sanitizeVending(value:unknown):State|null{
 if(!value||typeof value!=='object')return null;const v=value as Partial<State>;if(v.version!==1)return null;
 const owned=[...new Set(Array.isArray(v.owned)?v.owned.filter(text):[])];
 const spend=Array.isArray(v.spend)?v.spend.filter(s=>s&&text(s.id)&&Number.isInteger(s.cost)&&s.cost>0&&s.cost<=10000).map(s=>({id:s.id,cost:s.cost,at:Number(s.at)||0,...(typeof s.debitId==='string'&&s.debitId.length>0&&s.debitId.length<180?{debitId:s.debitId}:{})})):[];
 const found=[...new Set(Array.isArray(v.found)?v.found.filter(text):[])];
 return {version:1,owned:[...new Set([...owned,...spend.map(s=>s.id)])],spend,found};
}
export function createVendingLedger(ports:Ports){
 let state:State|null=null,snapshot=EMPTY_VENDING;const listeners=new Set<()=>void>();
 const refresh=(next:State)=>{state=next;snapshot={ready:true,owned:next.owned,spent:next.spend.reduce((n,s)=>n+s.cost,0),found:next.found,history:next.spend};listeners.forEach(fn=>fn());};
 /** First run: remember what the player already has (never re-lock). */
 function migrate():State{
  const owned=new Set<string>(),look=ports.readSavedLook() as Record<string,unknown>|null;
  if(look&&typeof look==='object'){for(const k of GEAR_KEYS)if(text(look[k]))owned.add(`${k}:${look[k]}`);if(text(look.costume)&&look.costume!=='none')owned.add(`costume:${look.costume}`);}
  for(const r of ports.allRides?.()??[])if((ports.snapshotRideUnlocked??ports.rideUnlocked)?.(r.category,r.id))owned.add(`${r.category}:${r.id}`);
  for(const id of ports.allCostumes?.()??[])if(ports.costumeEarned?.(id))owned.add(`costume:${id}`);
  for(const s of VENDING_STARTERS)owned.delete(s);
  return {version:1,owned:[...owned],spend:[],found:[]};
 }
 function load(){
  let saved:State|null=null;try{saved=sanitizeVending(ports.read());}catch{saved=null;}
  if(!saved){saved=migrate();try{ports.write(saved);}catch{/* this visit still knows */}}
  refresh(saved);return saved;
 }
 const current=()=>state??load();
 function recover(){const s=current(),receipts=ports.receipts?.()??[];const missing=receipts.filter(r=>!s.owned.includes(r.id)||!s.spend.some(d=>d.debitId===r.debitId||(!d.debitId&&d.id===r.id&&d.cost===r.cost&&d.at===r.at)));if(!missing.length)return;
  const next={...s,owned:[...new Set([...s.owned,...missing.map(r=>r.id)])],spend:[...s.spend,...missing.filter(r=>!s.spend.some(d=>d.debitId===r.debitId))]};try{ports.write(next);}catch{/* Core receipt is the durable ownership record; repair can retry later. */}refresh(next);
 }
 const spendable=()=>ports.arcadeBalance()-(ports.payItem?0:current().spend.reduce((n,s)=>n+s.cost,0));
 const save=(next:State)=>{try{ports.write(next);}catch{return false;}refresh(next);return true;};
 const isOwned=(id:string)=>{recover();return VENDING_STARTERS.has(id)||current().owned.includes(id);};
 function unlockState(item:VendingItem):{unlocked:boolean;reason?:string}{
  if(item.kind==='costume'&&item.costume&&item.costume!=='none'&&ports.costumeEarned&&!ports.costumeEarned(item.costume))return {unlocked:false};
  if(item.kind==='gear'&&item.storeItem&&item.storeItem.category!=='ball'&&ports.rideUnlocked&&!ports.rideUnlocked(item.storeItem.category,item.storeItem.option.id))return {unlocked:false};
  return {unlocked:true};
 }
 /**
  * Cards this pack could still give without a duplicate (economy pass, docs/economy/ECONOMY_PROPOSAL.md §5.3, 28 Sep 2026):
  * - on sale while its own pool still holds at least one missing card; `extra` (other missing cards) only fills empty slots,
  *   so the binder can always be finished (the old ≥2-legends rule left the last Icons unobtainable);
  * - light Icon gate: until the tier gate opens (cardRewards.tierGate(progress,'quiz').icon), Icon cards are left out of every
  *   slot except the guaranteed mental-strength legend slot;
  * - at most PACKS_PER_DAY packs a local day (`restock`: "This machine restocks at midnight.").
  */
 function packFreshness(pack:PackSpec){
  const have=new Set(ports.readCollection()),open=ports.iconsOpen?.()??true,gated=(n:string)=>!open&&ports.tierOf?.(n)==='icon';
  const legends=pack.legends.filter(n=>!have.has(n)&&(MENTAL_LEGENDS.has(n)||!gated(n))),regular=pack.regular.filter(n=>!have.has(n)&&!legends.includes(n)&&!gated(n));
  const extra=regular.length<pack.size?(ports.allCards?.()??[]).filter(n=>!have.has(n)&&!legends.includes(n)&&!regular.includes(n)&&!gated(n)):[];
  const restock=(ports.packsToday?.()??0)>=PACKS_PER_DAY;
  return {legends,regular,extra,restock,available:legends.length+regular.length>0&&!restock};
 }
 async function buy(item:VendingItem):Promise<BuyResult>{
  if(item.kind==='display'&&!HOME_DECOR_ENABLED&&!readableBook(item))return {ok:false,reason:'Preview only. Home decorating is coming later.'};
  if(item.kind==='pack'&&item.pack){
   const fresh=packFreshness(item.pack);if(!fresh.available)return {ok:false,reason:fresh.restock?PACK_RESTOCK_MESSAGE:'You already have every card this pack can give. Try another pack.'};
   if(spendable()<item.price)return {ok:false,reason:'Not enough coins yet. Play in the arcade to earn more.'};
   try{const result=await ports.buyPack({...item.pack,legends:fresh.legends,regular:fresh.regular,extra:fresh.extra});return result.ok?{ok:true,packId:result.pack.id}:{ok:false,reason:result.reason};}
   catch{return {ok:false,reason:'The pack could not be opened. Your coins were not spent.'};}
  }
  try{return await ports.lock(async()=>{
   let latest:State;try{latest=sanitizeVending(ports.read())??current();}catch{latest=current();}refresh(latest);recover();latest=current();
   if(VENDING_STARTERS.has(item.id)||latest.owned.includes(item.id))return {ok:true} as BuyResult;
   if(!unlockState(item).unlocked)return {ok:false,reason:'This one is still locked.'} as BuyResult;
   const balance=spendable();
   if(!Number.isInteger(item.price)||item.price<1)return {ok:false,reason:'This item has no price.'} as BuyResult;
   if(balance<item.price)return {ok:false,reason:'Not enough coins yet. Play in the arcade to earn more.'} as BuyResult;
   if(ports.payItem){const paid=await ports.payItem(item);if(!paid.ok)return paid;recover();return {ok:true} as BuyResult;}
   const next:State={...latest,owned:[...latest.owned,item.id],spend:[...latest.spend,{id:item.id,cost:item.price,at:ports.now()}]};
   return (save(next)?{ok:true}:{ok:false,reason:'This browser could not save. Your coins were not spent.'}) as BuyResult;
  });}catch{return {ok:false,reason:'Purchases need browser storage. Your coins were not spent.'};}
 }
 /** Swap anything not owned for the free starter (after the ride-unlock rule), so no unpaid item can be equipped. */
 function enforce<T extends Record<(typeof GEAR_KEYS)[number]|'costume',string>>(value:T):T{
  let next=value;for(const k of GEAR_KEYS)if(!isOwned(`${k}:${value[k]}`))next={...next,[k]:'classic'};
  if(value.costume&&value.costume!=='none'&&!isOwned(`costume:${value.costume}`))next={...next,costume:'none'};
  return next;
 }
 function markFound(id:string){const s=current();if(s.found.includes(id))return false;return save({...s,found:[...s.found,id]});}
 return {read:()=>{recover();return snapshot;},isOwned,unlockState,packFreshness,buy,enforce,markFound,
  reload:()=>{state=null;load();},subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};}};
}
