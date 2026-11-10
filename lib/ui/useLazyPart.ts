'use client';
import {useEffect,useState,type ComponentType} from 'react';

/**
 * A component that is NOT in the boot chunk, loaded the first time it is wanted (load-time pass, Nov 10 2026,
 * docs/performance-guide.md "Rare activities load on demand"). Returns null until the chunk lands. Once loaded it is kept for
 * the page (a remount gets it at once). Fail soft: a failed load calls `onFail` (the activity simply is not offered this time) and
 * is forgotten, so the next time `want` turns true the import runs again. No timers, no polling: one import per want.
 */
type Loader<P>=()=>Promise<{default:ComponentType<P>}>;
const loaded=new Map<Loader<never>,ComponentType<never>>();
export function useLazyPart<P>(loader:Loader<P>,want:boolean,onFail?:()=>void):ComponentType<P>|null{
 const key=loader as unknown as Loader<never>;
 const [C,setC]=useState<ComponentType<P>|null>(()=>(loaded.get(key) as ComponentType<P>|undefined)??null);
 useEffect(()=>{
  if(!want||C)return;let live=true;
  loader().then(m=>{loaded.set(key,m.default as ComponentType<never>);if(live)setC(()=>m.default);},()=>{if(live)onFail?.();});
  return()=>{live=false;};
 },[want,C,loader,key,onFail]);
 return C;
}
