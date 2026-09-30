/**
 * One purchase at a time, from the Buy tap until its reveal closes (code review Sep 29 2026, finding 1). Each deliberate Buy gets
 * a fresh purchase id, so the wallet's idempotent spend can't catch a second tap made during the ~900 ms receipt: the gate
 * must stay held until the reveal (or pack reveal / message) is dismissed. Used by components/KonbiniRoom.tsx; tested in
 * tests/konbini.cjs.
 */
export type PurchaseGate={readonly held:boolean;
 /** Try to start a purchase: false while another one is still being paid for or revealed. */
 begin():boolean;
 /** The purchase failed, or its reveal was closed: the next Buy may start. */
 end():void};
export function createPurchaseGate():PurchaseGate{let held=false;return {get held(){return held;},begin(){if(held)return false;held=true;return true;},end(){held=false;}};}
