import {DAILY_PLAY_COINS,LEGACY_DAILY_PLAY_MAX,localPlayDay,type DailyPlayResult} from '../town/dailyPlay';
import {LEGEND_PACK_PRICE,MYSTERY_PACK_OPTIONS,PACKS_PER_DAY,PACK_RESTOCK_MESSAGE} from './legendPacks';
import {trainingPay} from '../town/dailyMeter';
/** `learn`: one-off learning coins (lessons, hidden balls, stories, journeys, explore, paths), paid once ever and never metered. */
export type ArcadeCoinGame='runner'|'pinball'|'tennis'|'live'|'puzzle'|'island'|'learn';
export const ARCADE_PLAY_COST=3;
/** Explicit one-time local testing credit; ordinary gameplay caps remain unchanged. */
export const TEST_COIN_GRANT_ID='testing-credit-2026-09-27';
export const TEST_COIN_GRANT_AMOUNT=50000;
export type ArcadeSpend={cost:number;reason:string;source:'arcade'|'vending';at:number;itemId?:string};
export type SpendResult={ok:true}|{ok:false;reason:string};
export type LegendPack={id:string;player:string;cost:number;at:number;cards?:string[];legends?:string[];packSize?:3|5};
export type CoinHistory={id:string;game:ArcadeCoinGame;amount:number;reason:string;at:number};
/** `training`: coins the Training meter (lib/town/dailyMeter.ts) has paid on `day` (local), for the pocket drawer's meter. */
export type ArcadeWalletSnapshot={balance:number;lifetimeEarned:number;byGame:Record<ArcadeCoinGame,number>;history:CoinHistory[];packs:LegendPack[];vendingPurchases:{id:string;debitId:string;cost:number;at:number}[];training:{day:string;earned:number}};
/** `raw` is set only on metered (training) runs: the earning before the Training meter, so a growing run is metered once. */
type Run={game:ArcadeCoinGame;paid:number;reason:string;at:number;raw?:number};
type State={version:1;spends:Record<string,ArcadeSpend>;runs:Record<string,Run>;best:Record<string,number>;attempts:Record<string,true>;visits:Record<string,number>;packs:(LegendPack&{granted?:boolean})[]};
/** Per-run caps. Raising a cap is always safe; lowering one would shrink saved receipts (sanitizeArcadeWallet clamps to it).
 *  puzzle 8 = first solve 5 + 3 stars; learn 75 = a finished path, the biggest learning reward. */
export const ARCADE_COIN_CAPS={runner:12,pinball:15,tennis:18,live:20,puzzle:8,island:20,learn:75} as const;
/** Pass Puzzles (economy pass, 28 Sep 2026): free to play, first solve pays PUZZLE_FIRST_SOLVE_COINS + new stars, a repeat pays 0. */
export const PUZZLE_FIRST_SOLVE_COINS=5;
const games:ArcadeCoinGame[]=['runner','pinball','tennis','live','puzzle','island','learn'];
const integer=(n:unknown,max=1e9)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
const key=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<180&&s!=='__proto__'&&s!=='constructor'&&s!=='prototype';
const empty=():State=>({version:1,spends:{},runs:{},best:{},attempts:{},visits:{},packs:[]});
export const EMPTY_ARCADE_WALLET:ArcadeWalletSnapshot={balance:0,lifetimeEarned:0,byGame:{runner:0,pinball:0,tennis:0,live:0,puzzle:0,island:0,learn:0},history:[],packs:[],vendingPurchases:[],training:{day:'',earned:0}};
/** Training coins (metered runs) paid on a local day. */
const trainingPaidOn=(runs:Record<string,Run>,day:string)=>Object.values(runs).reduce((n,r)=>n+(r.raw!==undefined&&localPlayDay(r.at)===day?r.paid:0),0);
export function sanitizeArcadeWallet(value:unknown,valid:ReadonlySet<string>):State{
 const out=empty();if(!value||typeof value!=='object')return out;const v=value as Partial<State>;
 for(const [id,r]of Object.entries(v.runs??{}))if(key(id)&&r&&games.includes(r.game)){const paid=integer(r.paid,id===TEST_COIN_GRANT_ID&&r.game==='island'?TEST_COIN_GRANT_AMOUNT:r.game==='island'&&/^daily-play:\d{4}-\d{2}-\d{2}$/.test(id)?Math.max(DAILY_PLAY_COINS,LEGACY_DAILY_PLAY_MAX):ARCADE_COIN_CAPS[r.game]);if(paid)out.runs[id]={game:r.game==='live'&&/^(island-job:|island-starter-coins|market:|market-sale:|card-trade:)/.test(id)?'island':r.game,paid,reason:typeof r.reason==='string'?r.reason.slice(0,120):'Arcade play',at:integer(r.at,9e15),...(typeof r.raw==='number'?{raw:Math.max(paid,integer(r.raw,ARCADE_COIN_CAPS[r.game]))}:{})};}
 for(const [id,n]of Object.entries(v.best??{}))if(key(id))out.best[id]=integer(n,3);
 for(const [id,yes]of Object.entries(v.attempts??{}))if(key(id)&&yes===true)out.attempts[id]=true;
 for(const [id,n]of Object.entries(v.visits??{}))if(key(id))out.visits[id]=integer(n,6);
 let available=Object.values(out.runs).reduce((n,r)=>n+r.paid,0);const ids=new Set<string>(),players=new Set<string>();
 if(Array.isArray(v.packs))for(const p of v.packs){
  if(!p||!key(p.id)||!valid.has(p.player)||ids.has(p.id))continue;
  const multi=p.packSize===3||p.packSize===5;
  // A multi-card pack holds 1..packSize distinct cards: top-up packs (economy pass, 28 Sep 2026) may have no legend, or fewer
  // cards than the pack size when fewer new cards were left, so the binder can always be finished.
  if(multi&&(!Array.isArray(p.cards)||p.cards.length<1||p.cards.length>(p.packSize??0)||new Set(p.cards).size!==p.cards.length||!p.cards.every(n=>valid.has(n))||!Array.isArray(p.legends)||p.legends.length>(p.packSize===5?2:1)||new Set(p.legends).size!==p.legends.length||p.player!==(p.legends[0]??p.cards[0])||!p.legends.every(n=>p.cards!.includes(n))))continue;
  if(!multi&&players.has(p.player))continue;
  const cost=integer(p.cost,1000);if(cost<1||cost>available)continue;available-=cost;ids.add(p.id);players.add(p.player);
  out.packs.push({id:p.id,player:p.player,cost,at:integer(p.at,9e15),...(multi?{packSize:p.packSize,cards:[...p.cards!],legends:[...p.legends!]}:{}),...(p.granted?{granted:true}:{})});
 }

 for(const [id,d] of Object.entries(v.spends??{}).sort((a,b)=>integer(a[1]?.at,9e15)-integer(b[1]?.at,9e15)||a[0].localeCompare(b[0]))){
  if(!key(id)||!d||(d.source!=='arcade'&&d.source!=='vending'))continue;
  const cost=integer(d.cost,10000);if(!cost||cost!==d.cost)continue;available-=cost;
  out.spends[id]={cost,source:d.source,reason:typeof d.reason==='string'?d.reason.slice(0,120):'Coins spent',at:integer(d.at,9e15),...(d.source==='vending'&&key(d.itemId)?{itemId:d.itemId}:{})};
 }
 return out;
}
function merge(a:State,b:State,valid:ReadonlySet<string>):State{const runs={...a.runs};for(const [id,r]of Object.entries(b.runs))if(!runs[id]||r.paid>runs[id].paid)runs[id]=r;const max=(x:Record<string,number>,y:Record<string,number>)=>{const o={...x};for(const [k,n]of Object.entries(y))o[k]=Math.max(o[k]??0,n);return o;};const packs=new Map(a.packs.map(p=>[p.id,p]));for(const p of b.packs)packs.set(p.id,{...packs.get(p.id),...p,granted:p.granted||packs.get(p.id)?.granted});return sanitizeArcadeWallet({version:1,spends:{...a.spends,...b.spends},runs,best:max(a.best,b.best),visits:max(a.visits,b.visits),attempts:{...a.attempts,...b.attempts},packs:[...packs.values()]},valid);}
export function arcadeCoinTarget(game:Exclude<ArcadeCoinGame,'puzzle'|'island'>,s:{goals?:number;collected?:number;moves?:number;cleanReturns?:number;points?:number;won?:boolean;passes?:number;finished?:boolean;engaged?:boolean}){
 const n=(v:number|undefined)=>integer(v);let value=0;
 if(game==='runner')value=n(s.goals)*2+Math.floor(n(s.collected)/5);
 if(game==='pinball')value=n(s.goals)*3+n(s.moves)*2;
 if(game==='tennis')value=Math.floor(n(s.cleanReturns)/3)+n(s.points)*2+(s.won?4:0);
 if(game==='live'&&s.engaged)value=Math.floor(n(s.passes)/3)+n(s.goals)*3+(s.finished?5+(s.won?3:0):0);
 return Math.min(ARCADE_COIN_CAPS[game],value);
}
/** `meter`: which credits the Training meter applies to (browser wiring passes dailyMeter.isTrainingRun); omitted = none. */
type Ports={meter?:(id:string,game:ArcadeCoinGame)=>boolean;read:()=>unknown;write:(value:unknown)=>void;lock:<T>(fn:()=>T|Promise<T>,purchase:boolean)=>Promise<T>;valid:ReadonlySet<string>;grant:(name:string)=>boolean;notify:(name:string)=>void;now:()=>number;id:()=>string;random:()=>number;legacyVending?:()=>{id:string;cost:number;at:number;debitId?:string}[]};
export function createArcadeWallet(ports:Ports){
 let state=empty(),snapshot=EMPTY_ARCADE_WALLET,loaded=false,migrationPending=false;const listeners=new Set<()=>void>();
 const readSaved=()=>{let raw:State;try{raw=sanitizeArcadeWallet(ports.read(),ports.valid);}catch{raw=empty();}
  // Old gear debits remain authoritative, even if a previously separate wallet was overspent.
  // Stable IDs and receipt-backed new history prevent a second migration charge.
  let legacy:ReturnType<NonNullable<Ports['legacyVending']>>=[];try{legacy=ports.legacyVending?.()??[];}catch{}
  const occurrences=new Map<string,number>();
  legacy.forEach(d=>{if(!d||d.debitId||!key(d.id)||d.id.length>=120||!Number.isInteger(d.cost)||d.cost<1||d.cost>=1000)return;
   const at=integer(Number(d.at)||0,9e15),identity=`${d.id}:${d.cost}:${at}`,occurrence=(occurrences.get(identity)??0)+1;occurrences.set(identity,occurrence);
   // Identity does not depend on array position: sanitizing/reordering an old ledger cannot charge again.
   const matched=Object.entries(raw.spends).filter(([id,p])=>id.startsWith('legacy-vending:')&&p.itemId===d.id&&p.cost===d.cost&&p.at===at).length;
   if(matched>=occurrence)return;const id=`legacy-vending:${identity}:${occurrence}`;migrationPending=true;raw.spends[id]={source:'vending',cost:d.cost,at,reason:'Vending purchase',itemId:d.id};});
  return sanitizeArcadeWallet(raw,ports.valid);};
 const refresh=(next:State)=>{state=next;const byGame={...EMPTY_ARCADE_WALLET.byGame};const history:CoinHistory[]=Object.entries(state.runs).map(([id,r])=>{byGame[r.game]+=r.paid;return{id,game:r.game,amount:r.paid,reason:r.reason,at:r.at};});const lifetimeEarned=Object.values(byGame).reduce((a,b)=>a+b,0);snapshot={vendingPurchases:Object.entries(state.spends).filter(([,d])=>d.source==='vending'&&d.itemId).map(([debitId,d])=>({id:d.itemId!,debitId,cost:d.cost,at:d.at})),balance:Math.max(0,lifetimeEarned-state.packs.reduce((a,p)=>a+p.cost,0)-Object.values(state.spends).reduce((a,d)=>a+d.cost,0)),lifetimeEarned,byGame,history:history.sort((a,b)=>b.at-a.at).slice(0,40),packs:state.packs.map(({granted:_g,...p})=>p),training:(()=>{const day=localPlayDay(ports.now());return{day,earned:trainingPaidOn(state.runs,day)};})()};listeners.forEach(f=>f());};
 const current=()=>merge(state,readSaved(),ports.valid);
 const save=(next:State,memory=false)=>{try{ports.write(next);}catch{if(!memory)return false;}refresh(next);return true;};
 function load(){if(!loaded){loaded=true;refresh(readSaved());}return snapshot;}
 const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
 function reconcile(next:State){let changed=false;const granted:string[]=[];const packs=next.packs.map(p=>{if(p.granted)return p;const names=p.cards??[p.player];let confirmed=true;for(const name of names)try{if(!ports.grant(name))confirmed=false;}catch{confirmed=false;}if(!confirmed)return p;changed=true;granted.push(...names);return{...p,granted:true};});if(changed&&save({...next,packs}))for(const name of new Set(granted))try{ports.notify(name);}catch{}}

 const reconcilePacks=()=>ports.lock(()=>{load();const next=current();if(migrationPending&&save(next))migrationPending=false;else refresh(next);reconcile(next);},false).catch(()=>{});
 /** A run's new record: plain runs keep max(paid); metered runs meter the whole run's raw earning against today's other
  * training coins, so retries and a growing arcade run pay as one earning (never twice, never shrinking). Null = nothing new. */
 function runRecord(runs:Record<string,Run>,id:string,game:ArcadeCoinGame,target:number,reason:string):Run|null{
  const old=runs[id],raw=integer(target,ARCADE_COIN_CAPS[game]),at=ports.now();
  if(!ports.meter?.(id,game)){const paid=Math.max(old?.paid??0,raw);return paid>(old?.paid??0)?{game,paid,reason:reason.slice(0,120),at}:null;}
  const oldRaw=old?.raw??old?.paid??0;if(raw<=oldRaw)return null;
  const day=localPlayDay(at),others=trainingPaidOn(runs,day)-(old&&old.raw!==undefined&&localPlayDay(old.at)===day?old.paid:0);
  return {game,paid:Math.max(old?.paid??0,trainingPay(others,raw)),reason:reason.slice(0,120),at,raw};
 }
 function creditRun(id:string,game:ArcadeCoinGame,target:number,reason:string){if(!key(id)||id.startsWith('daily-play:')||!games.includes(game))return Promise.resolve(0);return ports.lock(()=>{load();const next=current(),old=next.runs[id];if(old&&old.game!==game)return 0;const run=runRecord(next.runs,id,game,target,reason);if(!run)return 0;const delta=run.paid-(old?.paid??0);save({...next,runs:{...next.runs,[id]:run}},true);return delta;},false).catch(()=>0);}
 /** One-off credit (learning coins): pays `amount` only if this id has never been paid, so a later, better run of the same
  *  lesson cannot top it up. Never metered. */
 function creditOnce(id:string,game:ArcadeCoinGame,amount:number,reason:string){if(!key(id)||id.startsWith('daily-play:')||!games.includes(game))return Promise.resolve(0);return ports.lock(()=>{load();const next=current();if(next.runs[id])return 0;const paid=integer(amount,ARCADE_COIN_CAPS[game]);if(!paid)return 0;save({...next,runs:{...next.runs,[id]:{game,paid,reason:reason.slice(0,120),at:ports.now()}}},true);return paid;},false).catch(()=>0);}
 /** Requested testing grant, recorded once even across reloads/tabs; never falls back to a memory-only balance. */
 function grantTestingCoins(){return ports.lock(()=>{load();const next=current();if(next.runs[TEST_COIN_GRANT_ID])return 0;return save({...next,runs:{...next.runs,[TEST_COIN_GRANT_ID]:{game:'island',paid:TEST_COIN_GRANT_AMOUNT,reason:'Testing coin grant',at:ports.now()}}})?TEST_COIN_GRANT_AMOUNT:0;},false).catch(()=>0);}
 /** Daily qualification is supplied by active movement, never by wallet load.
  * A strict shared lock and persisted receipt prevent duplicate cross-tab grants. */
 function grantDailyPlayCoins(day:string):Promise<DailyPlayResult>{return ports.lock(()=>{const at=ports.now();if(day!==localPlayDay(at))return{ok:false,amount:0};load();const next=current(),id=`daily-play:${day}`;if(next.runs[id]){refresh(next);return{ok:true,amount:0};}const ok=save({...next,runs:{...next.runs,[id]:{game:'island',paid:DAILY_PLAY_COINS,reason:'Daily play · 30 seconds exploring',at}}});return{ok,amount:ok?DAILY_PLAY_COINS:0};},true).catch(()=>({ok:false,amount:0}));}
 /** Idempotent, persisted debit under the same cross-tab lock as credits and packs. */
 function spend(id:string,cost:number,reason:string,source:ArcadeSpend['source']='arcade',itemId?:string):Promise<SpendResult>{
  if(!key(id)||!Number.isInteger(cost)||cost<1||cost>10000||(itemId!==undefined&&!key(itemId)))return Promise.resolve({ok:false,reason:'Invalid coin amount.'});
  return ports.lock(()=>{load();const next=current(),old=next.spends[id];if(old)return old.cost===cost&&old.source===source&&old.itemId===itemId?{ok:true as const}:{ok:false as const,reason:'This payment already has a different amount.'};
   const available=Object.values(next.runs).reduce((n,r)=>n+r.paid,0)-next.packs.reduce((n,p)=>n+p.cost,0)-Object.values(next.spends).reduce((n,d)=>n+d.cost,0);
   if(available<cost)return {ok:false as const,reason:`You need ${cost-available} more coin${cost-available===1?'':'s'}. Island jobs can help you earn them.`};
   return save({...next,spends:{...next.spends,[id]:{cost,source,reason:reason.slice(0,120),at:ports.now(),...(itemId?{itemId}:{})}}})?{ok:true as const}:{ok:false as const,reason:'Your payment could not be saved. Your coins were not spent.'};
  },true).catch(()=>({ok:false as const,reason:'Your payment could not be saved. Your coins were not spent.'}));
 }
 function payArcadePlay(game:Exclude<ArcadeCoinGame,'island'>,id:string){return spend(`play:${id}`,ARCADE_PLAY_COST,`${game} arcade play`);}
 function recordPuzzleBest(levelId:string,stars:number,attemptID:string,visitID:string){if(![levelId,attemptID,visitID].every(key))return Promise.resolve(0);return ports.lock(()=>{load();const next=current();if(next.attempts[attemptID])return 0;const best=next.best[levelId]??0,value=integer(stars,3);if(!value||value<=best)return 0;const amount=(best===0?PUZZLE_FIRST_SOLVE_COINS:0)+Math.max(0,value-best);const id=`puzzle:${attemptID}`;const run=amount?runRecord(next.runs,id,'puzzle',amount,best===0?'First puzzle solve':'New puzzle stars'):null;save({...next,best:{...next.best,[levelId]:Math.max(best,value)},attempts:{...next.attempts,[attemptID]:true},runs:run?{...next.runs,[id]:run}:next.runs},true);return run?.paid??0;},false).catch(()=>0);}
 async function purchaseLegendPack(candidates:readonly string[],cost=LEGEND_PACK_PRICE):Promise<{ok:true;pack:LegendPack}|{ok:false;reason:string}>{try{return await ports.lock(()=>{load();const next=current(),price=integer(cost,1000);if(!price||cost!==price)return{ok:false as const,reason:'Invalid pack price.'};const pool=[...new Set(candidates)].filter(n=>ports.valid.has(n)&&!next.packs.some(p=>p.player===n));if(!pool.length)return{ok:false as const,reason:'You have collected every legend in this series.'};const earned=Object.values(next.runs).reduce((n,r)=>n+r.paid,0),spent=next.packs.reduce((n,p)=>n+p.cost,0)+Object.values(next.spends).reduce((n,d)=>n+d.cost,0);if(earned-spent<price)return{ok:false as const,reason:'Earn more arcade coins to open this pack.'};const player=pool[Math.min(pool.length-1,Math.floor(Math.max(0,ports.random())*pool.length))],pack={id:ports.id(),player,cost:price,at:ports.now()};const updated={...next,packs:[...next.packs,pack]};if(!save(updated))return{ok:false as const,reason:'This browser could not save the pack. Your coins were not spent.'};reconcile(updated);return{ok:true as const,pack};},true);}catch{return{ok:false,reason:'Purchases need browser storage and a secure tab lock. Your coins were not spent.'};}}
 /** Opens a pack. `legendCandidates`/`regularCandidates` are the pack's own missing cards (the caller filters out owned cards and
  * gated tiers); `extraCandidates` are other missing cards that only fill slots the pack's own pool cannot (economy pass,
  * 28 Sep 2026): a pack stays on sale while it can give at least one new card, never gives a duplicate, and may hold fewer
  * cards than its size when fewer new cards are left. At most PACKS_PER_DAY packs per local day. */
 async function purchaseMysteryPack(size:3|5,legendCandidates:readonly string[],regularCandidates:readonly string[],extraCandidates:readonly string[]=[]):Promise<{ok:true;pack:LegendPack}|{ok:false;reason:string}>{
  try{return await ports.lock(()=>{
   load();const next=current(),offer=MYSTERY_PACK_OPTIONS.find(p=>p.size===size);if(!offer)return{ok:false as const,reason:'Choose a 3-card or 5-card pack.'};
   const balance=Object.values(next.runs).reduce((n,r)=>n+r.paid,0)-next.packs.reduce((n,p)=>n+p.cost,0)-Object.values(next.spends).reduce((n,d)=>n+d.cost,0);if(balance<offer.price)return{ok:false as const,reason:'Earn more arcade coins to open this pack.'};
   const legends=[...new Set(legendCandidates)].filter(n=>ports.valid.has(n)),regular=[...new Set(regularCandidates)].filter(n=>ports.valid.has(n)&&!legends.includes(n)),extra=[...new Set(extraCandidates)].filter(n=>ports.valid.has(n)&&!legends.includes(n)&&!regular.includes(n));
   if(!legends.length&&!regular.length)return{ok:false as const,reason:'You already have every card this pack can give. Try another pack.'};
   const today=localPlayDay(ports.now());if(next.packs.filter(p=>p.packSize&&localPlayDay(p.at)===today).length>=PACKS_PER_DAY)return{ok:false as const,reason:PACK_RESTOCK_MESSAGE};
   const count=Math.min(legends.length,size===5&&ports.random()<offer.secondLegendChance?2:1),seen=new Set(next.packs.flatMap(p=>p.cards??[p.player])),taken:string[]=[];
   const draw=(pool:string[],amount:number)=>{const result:string[]=[];for(let i=0;i<amount;i++){const left=pool.filter(n=>!result.includes(n)&&!taken.includes(n));if(!left.length)break;const fresh=left.filter(n=>!seen.has(n)),available=fresh.length?fresh:left;result.push(available[Math.min(available.length-1,Math.floor(Math.max(0,ports.random())*available.length))]);}taken.push(...result);return result;};
   // The legend slot(s) first, then the pack's own cards, then other missing cards (and any legends left) for the empty slots.
   const special=draw(legends,count),cards=[...special];for(const pool of [regular,extra,legends])cards.push(...draw(pool,size-cards.length));
   const pack:LegendPack={id:ports.id(),player:special[0]??cards[0],cards,legends:special,packSize:size,cost:offer.price,at:ports.now()},updated={...next,packs:[...next.packs,pack]};
   if(!save(updated))return{ok:false as const,reason:'This browser could not save the pack. Your coins were not spent.'};reconcile(updated);return{ok:true as const,pack};
  },true);}catch{return{ok:false,reason:'Purchases need browser storage and a secure tab lock. Your coins were not spent.'};}
 }
 return{load,subscribe,spend,payArcadePlay,creditRun,creditOnce,grantTestingCoins,grantDailyPlayCoins,recordPuzzleBest,purchaseLegendPack,purchaseMysteryPack,reconcilePacks,refresh:()=>{load();refresh(current());},beginArcadeRun:(_game:ArcadeCoinGame)=>ports.id()};
}
