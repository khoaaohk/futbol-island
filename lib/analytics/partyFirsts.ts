/**
 * The "first party on this device" flags (Phase B of docs/analytics-multiplayer-plan.md §4, the fi2-water-firsts-v1 precedent in
 * waterEvents.ts): one localStorage string holding 'p' (played in a party here before) and 'h' (hosted one here before), so
 * mp:first_party / mp:first_host fire once per device. Two letters only: no date, no count, nothing about the party. A device key
 * (lib/saves/snapshot.ts DEVICE_KEYS): it never travels with a save code. Privacy policy §11 names it.
 */
export const PARTY_FIRSTS_KEY='fi2-mp-firsts-v1';
let firsts:string|null=null;
const readFirsts=()=>{if(firsts===null){try{firsts=localStorage.getItem(PARTY_FIRSTS_KEY)??'';}catch{firsts='';}}return firsts;};
/** True the first time `flag` is marked on this device (then never again). */
export function markPartyFirst(flag:'p'|'h'):boolean{
 const f=readFirsts();if(f.includes(flag))return false;
 firsts=f+flag;try{localStorage.setItem(PARTY_FIRSTS_KEY,firsts);}catch{}
 return true;
}
/** Tests: forget the cached flags. */
export function resetPartyFirsts(){firsts=null;}
