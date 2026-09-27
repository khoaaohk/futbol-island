import {MYSTERY_PACK_OPTIONS} from './legendPacks';
export type ArcadeCoinGame='runner'|'pinball'|'tennis'|'live'|'puzzle';
export type LegendPack={id:string;player:string;cost:number;at:number;cards?:string[];legends?:string[];packSize?:3|5};
export type CoinHistory={id:string;game:ArcadeCoinGame;amount:number;reason:string;at:number};
export type ArcadeWalletSnapshot={balance:number;lifetimeEarned:number;byGame:Record<ArcadeCoinGame,number>;history:CoinHistory[];packs:LegendPack[]};
type Run={game:ArcadeCoinGame;paid:number;reason:string;at:number};
type State={version:1;runs:Record<string,Run>;best:Record<string,number>;attempts:Record<string,true>;visits:Record<string,number>;packs:(LegendPack&{granted?:boolean})[]};
export const ARCADE_COIN_CAPS={runner:12,pinball:15,tennis:18,live:20,puzzle:7} as const;
const games:ArcadeCoinGame[]=['runner','pinball','tennis','live','puzzle'];
const integer=(n:unknown,max=1e9)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.floor(n))):0;
const key=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<180&&s!=='__proto__'&&s!=='constructor'&&s!=='prototype';
const empty=():State=>({version:1,runs:{},best:{},attempts:{},visits:{},packs:[]});
export const EMPTY_ARCADE_WALLET:ArcadeWalletSnapshot={balance:0,lifetimeEarned:0,byGame:{runner:0,pinball:0,tennis:0,live:0,puzzle:0},history:[],packs:[]};
export function sanitizeArcadeWallet(value:unknown,valid:ReadonlySet<string>):State{
 const out=empty();if(!value||typeof value!=='object')return out;const v=value as Partial<State>;
 for(const [id,r]of Object.entries(v.runs??{}))if(key(id)&&r&&games.includes(r.game)){const paid=integer(r.paid,ARCADE_COIN_CAPS[r.game]);if(paid)out.runs[id]={game:r.game,paid,reason:typeof r.reason==='string'?r.reason.slice(0,120):'Arcade play',at:integer(r.at,9e15)};}
 for(const [id,n]of Object.entries(v.best??{}))if(key(id))out.best[id]=integer(n,3);
 for(const [id,yes]of Object.entries(v.attempts??{}))if(key(id)&&yes===true)out.attempts[id]=true;
 for(const [id,n]of Object.entries(v.visits??{}))if(key(id))out.visits[id]=integer(n,6);
 let available=Object.values(out.runs).reduce((n,r)=>n+r.paid,0);const ids=new Set<string>(),players=new Set<string>();
 if(Array.isArray(v.packs))for(const p of v.packs){
  if(!p||!key(p.id)||!valid.has(p.player)||ids.has(p.id))continue;
  const multi=p.packSize===3||p.packSize===5;
  if(multi&&(!Array.isArray(p.cards)||p.cards.length!==p.packSize||new Set(p.cards).size!==p.cards.length||!p.cards.every(n=>valid.has(n))||!Array.isArray(p.legends)||p.legends.length<1||p.legends.length>(p.packSize===5?2:1)||new Set(p.legends).size!==p.legends.length||p.player!==p.legends[0]||!p.legends.every(n=>p.cards!.includes(n))))continue;
  if(!multi&&players.has(p.player))continue;
  const cost=integer(p.cost,1000);if(cost<1||cost>available)continue;available-=cost;ids.add(p.id);players.add(p.player);
  out.packs.push({id:p.id,player:p.player,cost,at:integer(p.at,9e15),...(multi?{packSize:p.packSize,cards:[...p.cards!],legends:[...p.legends!]}:{}),...(p.granted?{granted:true}:{})});
 }

 return out;
}
function merge(a:State,b:State,valid:ReadonlySet<string>):State{const runs={...a.runs};for(const [id,r]of Object.entries(b.runs))if(!runs[id]||r.paid>runs[id].paid)runs[id]=r;const max=(x:Record<string,number>,y:Record<string,number>)=>{const o={...x};for(const [k,n]of Object.entries(y))o[k]=Math.max(o[k]??0,n);return o;};const packs=new Map(a.packs.map(p=>[p.id,p]));for(const p of b.packs)packs.set(p.id,{...packs.get(p.id),...p,granted:p.granted||packs.get(p.id)?.granted});return sanitizeArcadeWallet({version:1,runs,best:max(a.best,b.best),visits:max(a.visits,b.visits),attempts:{...a.attempts,...b.attempts},packs:[...packs.values()]},valid);}
export function arcadeCoinTarget(game:Exclude<ArcadeCoinGame,'puzzle'>,s:{goals?:number;collected?:number;moves?:number;cleanReturns?:number;points?:number;won?:boolean;passes?:number;finished?:boolean;engaged?:boolean}){
 const n=(v:number|undefined)=>integer(v);let value=0;
 if(game==='runner')value=n(s.goals)*2+Math.floor(n(s.collected)/5);
 if(game==='pinball')value=n(s.goals)*3+n(s.moves)*2;
 if(game==='tennis')value=Math.floor(n(s.cleanReturns)/3)+n(s.points)*2+(s.won?4:0);
 if(game==='live'&&s.engaged)value=Math.floor(n(s.passes)/3)+n(s.goals)*3+(s.finished?5+(s.won?3:0):0);
 return Math.min(ARCADE_COIN_CAPS[game],value);
}
type Ports={read:()=>unknown;write:(value:unknown)=>void;lock:<T>(fn:()=>T|Promise<T>,purchase:boolean)=>Promise<T>;valid:ReadonlySet<string>;grant:(name:string)=>boolean;notify:(name:string)=>void;now:()=>number;id:()=>string;random:()=>number};
export function createArcadeWallet(ports:Ports){
 let state=empty(),snapshot=EMPTY_ARCADE_WALLET,loaded=false;const listeners=new Set<()=>void>();
 const readSaved=()=>{try{return sanitizeArcadeWallet(ports.read(),ports.valid);}catch{return empty();}};
 const refresh=(next:State)=>{state=next;const byGame={...EMPTY_ARCADE_WALLET.byGame};const history:CoinHistory[]=Object.entries(state.runs).map(([id,r])=>{byGame[r.game]+=r.paid;return{id,game:r.game,amount:r.paid,reason:r.reason,at:r.at};});const lifetimeEarned=Object.values(byGame).reduce((a,b)=>a+b,0);snapshot={balance:Math.max(0,lifetimeEarned-state.packs.reduce((a,p)=>a+p.cost,0)),lifetimeEarned,byGame,history:history.sort((a,b)=>b.at-a.at).slice(0,40),packs:state.packs.map(({granted:_g,...p})=>p)};listeners.forEach(f=>f());};
 const current=()=>merge(state,readSaved(),ports.valid);
 const save=(next:State,memory=false)=>{try{ports.write(next);}catch{if(!memory)return false;}refresh(next);return true;};
 function load(){if(!loaded){loaded=true;refresh(readSaved());}return snapshot;}
 const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};};
 function reconcile(next:State){let changed=false;const granted:string[]=[];const packs=next.packs.map(p=>{if(p.granted)return p;const names=p.cards??[p.player];let confirmed=true;for(const name of names)try{if(!ports.grant(name))confirmed=false;}catch{confirmed=false;}if(!confirmed)return p;changed=true;granted.push(...names);return{...p,granted:true};});if(changed&&save({...next,packs}))for(const name of new Set(granted))try{ports.notify(name);}catch{}}

 const reconcilePacks=()=>ports.lock(()=>{load();const next=current();refresh(next);reconcile(next);},false).catch(()=>{});
 function creditRun(id:string,game:ArcadeCoinGame,target:number,reason:string){if(!key(id)||!games.includes(game))return Promise.resolve(0);return ports.lock(()=>{load();const next=current(),old=next.runs[id];if(old&&old.game!==game)return 0;const paid=Math.max(old?.paid??0,integer(target,ARCADE_COIN_CAPS[game])),delta=paid-(old?.paid??0);if(!delta)return 0;save({...next,runs:{...next.runs,[id]:{game,paid,reason:reason.slice(0,120),at:ports.now()}}},true);return delta;},false).catch(()=>0);}
 function recordPuzzleBest(levelId:string,stars:number,attemptID:string,visitID:string){if(![levelId,attemptID,visitID].every(key))return Promise.resolve(0);return ports.lock(()=>{load();const next=current();if(next.attempts[attemptID])return 0;const best=next.best[levelId]??0,value=integer(stars,3);if(!value)return 0;const improved=value>best,repeat=!improved&&(next.visits[visitID]??0)<6,amount=(best===0?4:0)+Math.max(0,value-best)+(repeat?1:0);const id=`puzzle:${attemptID}`;save({...next,best:{...next.best,[levelId]:Math.max(best,value)},attempts:{...next.attempts,[attemptID]:true},visits:{...next.visits,[visitID]:(next.visits[visitID]??0)+(repeat?1:0)},runs:amount?{...next.runs,[id]:{game:'puzzle',paid:amount,reason:best===0?'First puzzle solve':improved?'New puzzle stars':'Puzzle solved again',at:ports.now()}}:next.runs},true);return amount;},false).catch(()=>0);}
 async function purchaseLegendPack(candidates:readonly string[],cost=30):Promise<{ok:true;pack:LegendPack}|{ok:false;reason:string}>{try{return await ports.lock(()=>{load();const next=current(),price=integer(cost,1000);if(!price||cost!==price)return{ok:false as const,reason:'Invalid pack price.'};const pool=[...new Set(candidates)].filter(n=>ports.valid.has(n)&&!next.packs.some(p=>p.player===n));if(!pool.length)return{ok:false as const,reason:'You have collected every legend in this series.'};const earned=Object.values(next.runs).reduce((n,r)=>n+r.paid,0),spent=next.packs.reduce((n,p)=>n+p.cost,0);if(earned-spent<price)return{ok:false as const,reason:'Earn more arcade coins to open this pack.'};const player=pool[Math.min(pool.length-1,Math.floor(Math.max(0,ports.random())*pool.length))],pack={id:ports.id(),player,cost:price,at:ports.now()};const updated={...next,packs:[...next.packs,pack]};if(!save(updated))return{ok:false as const,reason:'This browser could not save the pack. Your coins were not spent.'};reconcile(updated);return{ok:true as const,pack};},true);}catch{return{ok:false,reason:'Purchases need browser storage and a secure tab lock. Your coins were not spent.'};}}
 async function purchaseMysteryPack(size:3|5,legendCandidates:readonly string[],regularCandidates:readonly string[]):Promise<{ok:true;pack:LegendPack}|{ok:false;reason:string}>{
  try{return await ports.lock(()=>{
   load();const next=current(),offer=MYSTERY_PACK_OPTIONS.find(p=>p.size===size);if(!offer)return{ok:false as const,reason:'Choose a 3-card or 5-card pack.'};
   const balance=Object.values(next.runs).reduce((n,r)=>n+r.paid,0)-next.packs.reduce((n,p)=>n+p.cost,0);if(balance<offer.price)return{ok:false as const,reason:'Earn more arcade coins to open this pack.'};
   const legends=[...new Set(legendCandidates)].filter(n=>ports.valid.has(n)),regular=[...new Set(regularCandidates)].filter(n=>ports.valid.has(n)&&!legends.includes(n));
   if(legends.length<2||regular.length<size-1)return{ok:false as const,reason:'These packs are temporarily unavailable. Your coins were not spent.'};
   const count=size===5&&ports.random()<offer.secondLegendChance?2:1,seen=new Set(next.packs.flatMap(p=>p.cards??[p.player]));
   const draw=(pool:string[],amount:number)=>{const result:string[]=[];for(let i=0;i<amount;i++){const fresh=pool.filter(n=>!seen.has(n)&&!result.includes(n)),available=fresh.length?fresh:pool.filter(n=>!result.includes(n));result.push(available[Math.min(available.length-1,Math.floor(Math.max(0,ports.random())*available.length))]);}return result;};
   const special=draw(legends,count),cards=[...special,...draw(regular,size-count)],pack:LegendPack={id:ports.id(),player:special[0],cards,legends:special,packSize:size,cost:offer.price,at:ports.now()},updated={...next,packs:[...next.packs,pack]};
   if(!save(updated))return{ok:false as const,reason:'This browser could not save the pack. Your coins were not spent.'};reconcile(updated);return{ok:true as const,pack};
  },true);}catch{return{ok:false,reason:'Purchases need browser storage and a secure tab lock. Your coins were not spent.'};}
 }
 return{load,subscribe,creditRun,recordPuzzleBest,purchaseLegendPack,purchaseMysteryPack,reconcilePacks,refresh:()=>{load();refresh(current());},beginArcadeRun:(_game:ArcadeCoinGame)=>ports.id()};
}
