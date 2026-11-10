/**
 * The playing-time planner's scheduler (Nov 10 2026, /tools/soccer-playing-time-calculator). A pure function: the same
 * input always gives the same table, nothing is random, nothing is stored. tests/tools-rotation.cjs checks the promises:
 *  - the field is full in every block and nobody is on it twice;
 *  - every rotating player's number of blocks is within one of everyone else's (a fixed goalkeeper plays the whole game
 *    and is left out of that count);
 *  - with one goalkeeper for the whole game, nobody sits out two blocks in a row while there are enough outfield places to
 *    avoid it; with a rotating goalkeeper the same holds for small benches, and a repair pass trades away every double wait
 *    it can in larger squads (a keeper's long stint can make a few unavoidable);
 *  - a rotating goalkeeper keeps for a whole period where that is fair, and for a shorter stint when the squad is so big
 *    that a whole period in goal would be more than a fair share.
 * How it works: the game is cut into blocks (a period divided by the substitution interval). Each player gets a quota of
 * blocks (the fair share rounded down or up). Goalkeeper stints are set first; each block then takes the players who can
 * least afford to wait (fewest free blocks left for the blocks they are still owed), then the ones who just sat out.
 */
export type RotationInput={players:number;onField:number;periods:number;periodMin:number;subEvery:number;keeperRotates:boolean;names?:readonly string[]};
export type Block={period:number;start:number;end:number;minutes:number;keeper:number;on:number[];off:number[];comingOn:number[]};
export type Rotation={input:RotationInput;names:string[];blocks:Block[];counts:number[];minutes:number[];keeperBlocks:number[];blocksPerPeriod:number;gameMin:number;fairShare:number};
const int=(v:unknown,lo:number,hi:number,d:number)=>{const n=Math.round(Number(v));return Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):d;};
export const MAX_PLAYERS=30;
/** Clamp anything a form or a shared link can hold to a plan that makes sense. */
export function cleanInput(i:Partial<RotationInput>):RotationInput{
 const players=int(i.players,1,MAX_PLAYERS,10),onField=Math.min(players,int(i.onField,1,11,7)),periods=int(i.periods,1,6,2),periodMin=int(i.periodMin,1,60,25);
 return {players,onField,periods,periodMin,subEvery:int(i.subEvery,1,periodMin,Math.min(5,periodMin)),keeperRotates:!!i.keeperRotates,
  names:(i.names??[]).slice(0,players).map(cleanName)};
}
export const cleanName=(s:unknown)=>String(s??'').replace(/[\u0000-\u001f\u007f<>]/g,' ').replace(/\s+/g,' ').trim().slice(0,24);
/** Whole-minute block lengths for one period: as equal as possible, the longer ones last. */
export function blockLengths(periodMin:number,subEvery:number):number[]{
 const n=Math.max(1,Math.min(periodMin,Math.round(periodMin/subEvery))),base=Math.floor(periodMin/n),extra=periodMin-base*n;
 return Array.from({length:n},(_,i)=>base+(i>=n-extra?1:0));
}
export function planRotation(raw:Partial<RotationInput>):Rotation{
 const input=cleanInput(raw),{players:P,onField:F,periods}=input,lens=blockLengths(input.periodMin,input.subEvery),bpp=lens.length,B=periods*bpp;
 const names=Array.from({length:P},(_,i)=>input.names?.[i]||`Player ${i+1}`);
 const fixed=!input.keeperRotates;
 /* keeper of every block */
 const keeperOf:number[]=[];
 if(fixed)for(let b=0;b<B;b++)keeperOf.push(0);
 else{const share=Math.floor(B*F/P),stint=Math.max(1,Math.min(bpp,share));let k=-1,run=0;
  for(let b=0;b<B;b++){if(b%bpp===0||run>=stint){k=(k+1)%P;run=0;}keeperOf.push(k);run++;}}
 const keeperBlocks=Array(P).fill(0);for(const k of keeperOf)keeperBlocks[k]++;
 /* quotas: the fair share of blocks, rounded down or up so they add up to every place in every block */
 const quota=Array(P).fill(0);
 if(fixed){quota[0]=B;const pool=P-1,slots=B*(F-1);if(pool>0){const lo=Math.floor(slots/pool);let extra=slots-lo*pool;for(let p=1;p<P;p++)quota[p]=lo+(extra-->0?1:0);}}
 else{const lo=Math.floor(B*F/P);let extra=B*F-lo*P;
  /* a keeper's stint counts toward the share; if stints leave someone above the low share, they take the extra blocks first */
  for(let p=0;p<P;p++)quota[p]=Math.max(lo,Math.min(keeperBlocks[p],lo+1));
  extra-=quota.reduce((a,q)=>a+(q-lo),0);
  for(let p=0;p<P&&extra>0;p++)if(quota[p]===lo){quota[p]++;extra--;}}
 const need=quota.map((q,p)=>q-keeperBlocks[p]);/* blocks still owed as an outfield player */
 const freeAfter=(p:number,b:number)=>{let n=0;for(let x=b;x<B;x++)if(keeperOf[x]!==p)n++;return n;};
 const counts=Array(P).fill(0),minutes=Array(P).fill(0),blocks:Block[]=[];
 let prevOn=new Set<number>();const onAt:Set<number>[]=[];
 for(let b=0;b<B;b++){
  const k=keeperOf[b],places=F-1,cand:number[]=[];
  for(let p=0;p<P;p++)if(p!==k)cand.push(p);
  const slack=(p:number)=>need[p]>0?freeAfter(p,b)-need[p]:1e6+counts[p];
  const sat=(p:number)=>b>0&&!prevOn.has(p)?0:1;
  const behind=(p:number)=>Math.round((quota[p]*(b+1)/B-counts[p])*1e6);/* how far behind an even pace through the game */
  cand.sort((x,y)=>{const sx=slack(x),sy=slack(y);
   if((sx<=0)!==(sy<=0))return sx<=0?-1:1;/* must play now or the quota is lost */
   if((need[x]>0)!==(need[y]>0))return need[x]>0?-1:1;
   return sat(x)-sat(y)||behind(y)-behind(x)||sx-sy||counts[x]-counts[y]||((x-b*places+P*B)%P)-((y-b*places+P*B)%P);});
  const picked=cand.slice(0,places);
  for(const p of picked){need[p]--;counts[p]++;}
  onAt.push(new Set([k,...picked]));prevOn=onAt[b];
 }
 /* Repair pass: where someone still sits out two blocks in a row, trade one of those blocks with a teammate's block elsewhere.
    Both keep their number of blocks, so the fair shares do not change; a trade is kept only if it removes a double sit. */
 const sits=()=>{let n=0;for(let b=1;b<B;b++)for(let p=0;p<P;p++)if(!onAt[b].has(p)&&!onAt[b-1].has(p))n++;return n;};
 const trade=(p:number,q:number,t:number,c:number)=>{onAt[t].delete(q);onAt[t].add(p);onAt[c].delete(p);onAt[c].add(q);};
 let cost=sits();
 for(let pass=0;pass<60&&cost>0;pass++){let better=false;
  search:for(let b=1;b<B;b++)for(let p=0;p<P;p++){if(onAt[b].has(p)||onAt[b-1].has(p))continue;
   for(const t of [b,b-1])for(const q of [...onAt[t]]){if(q===keeperOf[t])continue;
    for(let c=0;c<B;c++){if(c===t||!onAt[c].has(p)||onAt[c].has(q)||keeperOf[c]===p)continue;
     trade(p,q,t,c);const now=sits();if(now<cost){cost=now;better=true;break search;}trade(q,p,t,c);}}}
  if(!better)break;}
 counts.fill(0);prevOn=new Set<number>();
 for(let b=0;b<B;b++){
  const k=keeperOf[b],on=[k,...[...onAt[b]].filter(p=>p!==k).sort((x,y)=>x-y)];
  const period=Math.floor(b/bpp),inP=b%bpp,start=lens.slice(0,inP).reduce((a,n)=>a+n,0),len=lens[inP];
  for(const p of on){counts[p]++;minutes[p]+=len;}
  const onSet=onAt[b],off:number[]=[];for(let p=0;p<P;p++)if(!onSet.has(p))off.push(p);
  blocks.push({period,start,end:start+len,minutes:len,keeper:k,on,off,comingOn:b===0?[]:on.filter(p=>!prevOn.has(p))});
  prevOn=onSet;
 }
 return {input,names,blocks,counts,minutes,keeperBlocks,blocksPerPeriod:bpp,gameMin:periods*input.periodMin,fairShare:periods*input.periodMin*F/P};
}
export const periodName=(i:number,periods:number)=>periods===2?['1st half','2nd half'][i]:periods===4?`Quarter ${i+1}`:periods===1?'Game':`Period ${i+1}`;
/** The plan as plain text for a team chat. */
export function rotationText(r:Rotation,team=''):string{
 const i=r.input,out=[`${team?team+': ':''}playing time plan`,`${i.players} players, ${i.onField} on the field, ${i.periods} x ${i.periodMin} min, changes every ${r.blocks[0].minutes} min or so`,''];
 r.blocks.forEach((b,n)=>{if(n%r.blocksPerPeriod===0)out.push(periodName(b.period,i.periods).toUpperCase());
  out.push(`${b.start}-${b.end} min: GK ${r.names[b.keeper]} | ${b.on.filter(p=>p!==b.keeper).map(p=>r.names[p]).join(', ')}${b.off.length?` | Off: ${b.off.map(p=>r.names[p]).join(', ')}`:''}`);
  if(n%r.blocksPerPeriod===r.blocksPerPeriod-1)out.push('');});
 out.push('MINUTES',r.names.map((n,p)=>`${n} ${r.minutes[p]}`).join(', '),'','Made with futbolisland.app/tools/soccer-playing-time-calculator');
 return out.join('\n');
}
/* ---- the plan in a link (#r=...): everything stays in the URL fragment, which browsers never send to a server ---- */
const b64e=(s:string)=>{let bin='';for(const c of new TextEncoder().encode(s))bin+=String.fromCharCode(c);return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');};
const b64d=(s:string)=>{const bin=atob(s.replace(/-/g,'+').replace(/_/g,'/'));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)));};
export const base64url={encode:b64e,decode:b64d};
export type PlanState=RotationInput&{team:string};
export function encodePlan(s:PlanState):string{
 return b64e(JSON.stringify([1,s.players,s.onField,s.periods,s.periodMin,s.subEvery,s.keeperRotates?1:0,cleanName(s.team),(s.names??[]).map(cleanName)]));
}
export function decodePlan(code:string):PlanState|null{
 try{const a=JSON.parse(b64d(code));if(!Array.isArray(a)||a[0]!==1)return null;
  return {...cleanInput({players:a[1],onField:a[2],periods:a[3],periodMin:a[4],subEvery:a[5],keeperRotates:!!a[6],names:Array.isArray(a[8])?a[8]:[]}),team:cleanName(a[7])};
 }catch{return null;}
}
