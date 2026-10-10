/**
 * Wallet compaction for a save (docs/accounts-design.md §4.1, Oct 9 2026). The coin ledger (fi2-arcade-wallet-v1) keeps one
 * receipt per credit and spend forever (~100–130 B each), so a year of play is mostly receipts. Before a snapshot is uploaded,
 * receipts older than 90 days that can never be paid again are folded into a few totals. Balances stay exact.
 *
 * What may be folded (everything else is kept as it is, so no id that still stops a double credit is ever lost):
 *  - runs whose id is a random run id (arcade runs, beginArcadeRun → randomUUID): that id is never credited again;
 *  - `daily-play:<day>` runs: only today's day can be granted;
 *  - `puzzle:<attempt>` runs: the attempt id stays in `attempts`, which is what blocks a repeat;
 *  - earlier folds (`fold:*`), so folding again keeps the list short;
 *  - arcade spends `play:<random id>` (a play's fee). Vending spends are kept: they are what proves an item is owned.
 *
 * Folded totals are written as ordinary receipts of the existing format (`fold:<game>:<n>`, each at most that game's per-run
 * cap; `fold:play:<n>` spends of at most 10,000), so sanitizeArcadeWallet, older open tabs and older clients read them
 * unchanged. Only the uploaded copy is compacted; this device's own ledger is never rewritten (two tabs merging an old and a
 * compacted ledger by receipt id would count coins twice).
 */
import {ARCADE_COIN_CAPS,type ArcadeCoinGame} from '../arcade/arcadeWalletCore';

export const COMPACT_AFTER_DAYS=90;
const RANDOM_ID=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|arcade-\d+-[a-z0-9]+)$/;
const SPEND_CAP=10000;
type Run={game:ArcadeCoinGame;paid:number;reason?:string;at?:number;raw?:number};
type Spend={cost:number;source:string;reason?:string;at?:number;itemId?:string};
type Wallet={version?:number;runs?:Record<string,Run>;spends?:Record<string,Spend>;[k:string]:unknown};

export function foldableRun(id:string,run:Run,cutoff:number):boolean{
 if(id.startsWith('fold:'))return true;
 if(typeof run.at!=='number'||run.at>=cutoff)return false;
 return RANDOM_ID.test(id)||/^daily-play:\d{4}-\d{2}-\d{2}$/.test(id)||(id.startsWith('puzzle:')&&run.game==='puzzle');
}
export function foldableSpend(id:string,s:Spend,cutoff:number):boolean{
 if(s.source!=='arcade')return false;
 if(id.startsWith('fold:play:'))return true;
 return typeof s.at==='number'&&s.at<cutoff&&id.startsWith('play:')&&RANDOM_ID.test(id.slice(5));
}

/** Returns the compacted ledger string, or the input unchanged when there is nothing to fold or it does not parse. */
export function compactWallet(raw:string,now:number,days=COMPACT_AFTER_DAYS):string{
 let w:Wallet;try{w=JSON.parse(raw);}catch{return raw;}
 if(!w||typeof w!=='object'||!w.runs||typeof w.runs!=='object')return raw;
 const cutoff=now-days*864e5,runs:Record<string,Run>={},totals=new Map<ArcadeCoinGame,number>();let folded=0;
 for(const [id,r] of Object.entries(w.runs)){
  if(r&&typeof r==='object'&&typeof r.paid==='number'&&r.paid>0&&r.game in ARCADE_COIN_CAPS&&foldableRun(id,r,cutoff)){totals.set(r.game,(totals.get(r.game)??0)+Math.floor(r.paid));folded++;}
  else runs[id]=r;
 }
 const spends:Record<string,Spend>={};let spent=0,foldedSpends=0;
 for(const [id,s] of Object.entries(w.spends??{})){
  if(s&&typeof s==='object'&&Number.isInteger(s.cost)&&s.cost>0&&foldableSpend(id,s,cutoff)){spent+=s.cost;foldedSpends++;}
  else spends[id]=s;
 }
 if(!folded&&!foldedSpends)return raw;
 for(const [game,total] of totals){
  const cap=ARCADE_COIN_CAPS[game];let left=total,n=0;
  while(left>0){const paid=Math.min(cap,left);runs[`fold:${game}:${n++}`]={game,paid,reason:'Older coins'};left-=paid;}
 }
 {let left=spent,n=0;while(left>0){const cost=Math.min(SPEND_CAP,left);spends[`fold:play:${n++}`]={cost,source:'arcade',reason:'Older arcade plays'};left-=cost;}}
 return JSON.stringify({...w,runs,spends});
}

/** Coins the ledger holds (earned − packs − spends), for checks and the restore summary. Mirrors the wallet's own sum. */
export function walletBalance(raw:string|null|undefined):number{
 let w:Wallet&{packs?:{cost?:number}[]};try{w=JSON.parse(raw??'null');}catch{return 0;}
 if(!w||typeof w!=='object')return 0;
 const earned=Object.values(w.runs??{}).reduce((n,r)=>n+(r&&typeof r.paid==='number'?Math.max(0,Math.floor(r.paid)):0),0);
 const packs=(Array.isArray(w.packs)?w.packs:[]).reduce((n,p)=>n+(p&&typeof p.cost==='number'?p.cost:0),0);
 const spent=Object.values(w.spends??{}).reduce((n,s)=>n+(s&&typeof s.cost==='number'?s.cost:0),0);
 return Math.max(0,earned-packs-spent);
}
