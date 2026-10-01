/**
 * Parental gate (G-09 / G-17). A grown-up check before parent-only areas and any link that leaves the game.
 * It is a speed bump, not identity verification: a multiplication question written in words, typed as a number.
 * Nothing is stored: a pass is remembered in memory for a few minutes, so a reload always asks again.
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
 * reopening a gate (or opening another one) does not restart the 30 s wait. Memory only, like the pass: a reload clears it.
 */
let wrongTries=0,lockedUntil=0;
const expireLockout=(now:number)=>{if(lockedUntil&&lockedUntil<=now){lockedUntil=0;wrongTries=0;}};
export const parentGatePassed=(now=Date.now())=>passedAt>0&&now-passedAt<GATE_PASS_MS;
export function passParentGate(now=Date.now()){passedAt=now;wrongTries=0;lockedUntil=0;}
export function resetParentGate(){passedAt=0;wrongTries=0;lockedUntil=0;}
/** When the current cooldown ends (0 when not cooling down). */
export function gateLockedUntil(now=Date.now()){expireLockout(now);return lockedUntil;}
/** Wrong answers in a row so far (shared by every gate). */
export function gateWrongTries(now=Date.now()){expireLockout(now);return wrongTries;}
/** Records one wrong answer; the GATE_MAX_TRIES-th starts the shared cooldown. */
export function recordGateWrong(now=Date.now()){expireLockout(now);if(lockedUntil)return {tries:wrongTries,lockedUntil};wrongTries++;if(wrongTries>=GATE_MAX_TRIES)lockedUntil=now+GATE_COOLDOWN_MS;return {tries:wrongTries,lockedUntil};}
