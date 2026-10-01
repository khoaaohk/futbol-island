/** Event/frame-driven daily play qualification. No timers, browser globals or storage. */
/** 30 coins since the economy pass (docs/economy/ECONOMY_PROPOSAL.md, applied 28 Sep 2026; was 40). */
export const DAILY_PLAY_COINS=30,DAILY_PLAY_SECONDS=30;
/** Receipts saved before 28 Sep 2026 paid 40: the wallet keeps them whole, so lowering the bonus never shrinks a balance. */
export const LEGACY_DAILY_PLAY_MAX=40;
export function localPlayDay(now:number){const d=new Date(now);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export type DailyPlayResult={ok:boolean;amount:number};
export function createDailyPlay(ports:{now:()=>number;claim:(day:string)=>Promise<DailyPlayResult>;earned:(amount:number)=>void}){
 let day='',midnight=0,seconds=0,pending=false,done=false,retry=0;
 function step(dt:number,active:boolean,visible=true){
  if(!active||!visible||!Number.isFinite(dt)||dt<=0)return;
  const now=ports.now();if(!day||now>=midnight||now<midnight-27*3600000){const date=new Date(now),next=localPlayDay(now);if(next!==day){day=next;seconds=0;done=false;retry=0;}midnight=new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime();}
  if(done||pending)return;
  const elapsed=Math.min(.1,dt);seconds=Math.min(DAILY_PLAY_SECONDS,seconds+elapsed);retry=Math.max(0,retry-elapsed);
  if(seconds<DAILY_PLAY_SECONDS-1e-8||retry>0)return;
  pending=true;const claimedDay=day;
  void ports.claim(claimedDay).then(result=>{if(day===claimedDay){done=result.ok;if(!result.ok)retry=5;}if(result.ok&&result.amount>0)ports.earned(result.amount);},()=>{if(day===claimedDay)retry=5;}).finally(()=>{pending=false;});
 }
 return{step,inspect:()=>({day,seconds,done,pending})};
}
/**
 * Which frames count toward the daily bonus (G-11, Sep 30 2026). Sessions start on the jetpack (the island's arrival), so the old
 * walk-only rule meant a child who flew around all session never earned the bonus and was never told why. Now any movement the
 * child STEERS counts: walking, dribbling, the jetpack, parachute and every ride (bike, scooter, skateboard...). Still excluded:
 * idle time, hidden tabs, menus, lessons, and riding an automatic street truck (the truck drives itself). Both steering input and
 * real displacement are still required, so holding a key against a wall or watching a match earns nothing.
 */
export function dailyPlayCounts(f:{active:boolean;menuOpen:boolean;inLesson:boolean;onTruck:boolean;steering:boolean;moved:boolean}):boolean{
 return f.active&&!f.menuOpen&&!f.inLesson&&!f.onTruck&&f.steering&&f.moved;
}
