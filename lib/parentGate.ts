/**
 * Parental gate (G-09 / G-17). A grown-up check before parent-only areas and any link that leaves the game.
 * It is a speed bump, not identity verification: a multiplication question written in words, typed as a number.
 * A pass is remembered in memory for a few minutes, so a reload always asks again. Only the wrong-answer cooldown's end time is
 * kept in sessionStorage (this tab only, cleared when it closes), so a reload does not skip the wait (bug audit B17).
 */
const WORDS=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'];
export type GateQuestion={a:number;b:number;text:string};
/** Tables 6–12 × 3–9: beyond what most 5–8-year-olds can do in their head, easy for an adult. */
export function makeGateQuestion(random:()=>number=Math.random):GateQuestion{
 const a=6+Math.floor(random()*7),b=3+Math.floor(random()*7);
 return {a,b,text:`What is ${WORDS[a]} times ${WORDS[b]}?`};
}
export function checkGateAnswer(q:Pick<GateQuestion,'a'|'b'>,answer:string):boolean{
 const clean=String(answer).trim();
 return /^\d{1,3}$/.test(clean)&&Number(clean)===q.a*q.b;
}
/** Remembered for this long after a pass (in memory only). */
export const GATE_PASS_MS=10*60*1000;
/** After this many wrong answers in a row, wait GATE_COOLDOWN_MS before trying again. */
export const GATE_MAX_TRIES=3,GATE_COOLDOWN_MS=30*1000;
let passedAt=0;
/**
 * QA11 B-1: the wrong-answer count and the cooldown live here (module memory), not in each gate's React state, so closing and
 * reopening a gate (or opening another one) does not restart the 30 s wait. The cooldown's end also survives a reload in this
 * tab (sessionStorage, bug audit B17); it stays a speed bump, not a lock.
 */
let wrongTries=0,lockedUntil=0;
/** sessionStorage key for the cooldown's end time (ms since epoch). Nothing else is stored, and nothing is sent anywhere. */
export const GATE_LOCK_KEY='fi2-parent-gate-lock-v1';
let hydrated=false;
const session=():Storage|null=>{try{return typeof sessionStorage==='undefined'?null:sessionStorage;}catch{return null;}};
function saveLock(){const s=session();if(!s)return;try{if(lockedUntil)s.setItem(GATE_LOCK_KEY,String(lockedUntil));else s.removeItem(GATE_LOCK_KEY);}catch{}}
/** After a reload, pick up a cooldown still running in this tab (capped at one cooldown from now, so a bad value can't lock for long). */
function hydrate(now:number){if(hydrated)return;hydrated=true;const s=session();if(!s)return;
 try{const v=Number(s.getItem(GATE_LOCK_KEY));if(Number.isFinite(v)&&v>now){lockedUntil=Math.min(v,now+GATE_COOLDOWN_MS);wrongTries=GATE_MAX_TRIES;}else if(s.getItem(GATE_LOCK_KEY)!==null)s.removeItem(GATE_LOCK_KEY);}catch{}}
const expireLockout=(now:number)=>{hydrate(now);if(lockedUntil&&lockedUntil<=now){lockedUntil=0;wrongTries=0;saveLock();}};
export const parentGatePassed=(now=Date.now())=>passedAt>0&&now-passedAt<GATE_PASS_MS;
export function passParentGate(now=Date.now()){hydrate(now);passedAt=now;wrongTries=0;lockedUntil=0;saveLock();}
export function resetParentGate(){hydrated=true;passedAt=0;wrongTries=0;lockedUntil=0;saveLock();}
/** When the current cooldown ends (0 when not cooling down). */
export function gateLockedUntil(now=Date.now()){expireLockout(now);return lockedUntil;}
/** Wrong answers in a row so far (shared by every gate). */
export function gateWrongTries(now=Date.now()){expireLockout(now);return wrongTries;}
/** Records one wrong answer; the GATE_MAX_TRIES-th starts the shared cooldown. */
export function recordGateWrong(now=Date.now()){expireLockout(now);if(lockedUntil)return {tries:wrongTries,lockedUntil};wrongTries++;if(wrongTries>=GATE_MAX_TRIES){lockedUntil=now+GATE_COOLDOWN_MS;saveLock();}return {tries:wrongTries,lockedUntil};}
