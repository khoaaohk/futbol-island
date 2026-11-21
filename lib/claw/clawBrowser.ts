'use client';
/**
 * Browser wiring for the Claw Club (Nov 21 2026): the store on the gashapon save ports (same localStorage save, same wallet), a
 * play id per try, and the "a paid try is still open" marker. A try paid for but never finished (the tab closed, the page crashed)
 * is refunded the next time the machine opens: lib/claw/clawStore.ts refunds only an id without a finished receipt, once.
 */
import {gashaponPorts} from '../gashapon/gashaponBrowser';
import {createClawStore} from './clawStore';

export const clawStore=createClawStore(gashaponPorts);
export const newPlayId=()=>`claw-${globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
const PENDING='fi2-claw-pending';
const ls=()=>{try{return typeof localStorage==='undefined'?null:localStorage;}catch{return null;}};
export const clawPending={
 get:()=>{try{return ls()?.getItem(PENDING)??null;}catch{return null;}},
 set(id:string){try{ls()?.setItem(PENDING,id);}catch{/* storage blocked: the session still refunds on Exit */}},
 clear(){try{ls()?.removeItem(PENDING);}catch{/* nothing to clear */}},
};
/** On open: refund a try left open by a closed tab (no-op when there is none, or it was finished). */
export async function settleOpenTry(){const id=clawPending.get();if(!id)return 0;const coins=await clawStore.refund(id);clawPending.clear();return coins;}
