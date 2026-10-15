/**
 * B5 (docs/fishing-research.md): the record board, the 3 biggest catches at each fishing spot. Pure (no storage): the browser
 * store (fishingLog.ts / fishingLogStore.ts) keeps them in the synced fishing log, so a record follows the player's save.
 * Size never sets a price (fixed prices per species), so records are pride only: no coins.
 *
 * Records API for Agent A's catch reveal ("RECORD" stamp): `wouldSetRecord(board, spot, size)` asks before landing, and the store's
 * `lastCatchRecord()` says what the last landed catch did (rank 1 = the spot's new biggest).
 */
export type RecordEntry={f:string;s:number;t:number};
export type RecordBoard=Record<string,RecordEntry[]>;
export const RECORDS_PER_SPOT=3;
const clean=(e:unknown):RecordEntry|null=>{const v=e as Partial<RecordEntry>;if(!v||typeof v.f!=='string'||v.f.length>40)return null;
 const s=typeof v.s==='number'&&Number.isFinite(v.s)?Math.max(0,Math.min(2000,Math.round(v.s*10)/10)):0;if(!s)return null;
 return {f:v.f,s,t:typeof v.t==='number'&&Number.isFinite(v.t)?Math.max(0,Math.floor(v.t)):0};};
const sortTop=(list:RecordEntry[])=>[...list].sort((a,b)=>b.s-a.s||a.t-b.t).slice(0,RECORDS_PER_SPOT);
export function sanitizeRecords(v:unknown,spots:readonly string[]):RecordBoard{
 const out:RecordBoard={};if(!v||typeof v!=='object')return out;
 for(const id of spots){const list=(v as Record<string,unknown>)[id];if(!Array.isArray(list))continue;const top=sortTop(list.map(clean).filter((e):e is RecordEntry=>!!e));if(top.length)out[id]=top;}
 return out;
}
/** Where a catch of `size` would rank on the spot's board (1-based), or 0 if it would not make the board. */
export function recordRank(board:RecordBoard,spot:string,size:number):number{
 const list=board[spot]??[];const rank=list.filter(e=>e.s>=size).length+1;return rank<=RECORDS_PER_SPOT?rank:0;
}
/** True when the catch would be the spot's new biggest (A's "RECORD" stamp). An empty board's first catch counts. */
export const wouldSetRecord=(board:RecordBoard,spot:string,size:number)=>recordRank(board,spot,size)===1;
export function addRecord(board:RecordBoard,spot:string,entry:RecordEntry):{board:RecordBoard;rank:number}{
 const rank=recordRank(board,spot,entry.s);if(!rank)return {board,rank:0};
 return {board:{...board,[spot]:sortTop([...(board[spot]??[]),entry])},rank};
}
export function mergeRecords(a:RecordBoard,b:RecordBoard):RecordBoard{
 const out:RecordBoard={};
 for(const id of new Set([...Object.keys(a),...Object.keys(b)])){const seen=new Set<string>(),all:RecordEntry[]=[];
  for(const e of [...(a[id]??[]),...(b[id]??[])]){const k=`${e.f}:${e.s}:${e.t}`;if(!seen.has(k)){seen.add(k);all.push(e);}}
  out[id]=sortTop(all);}
 return out;
}
