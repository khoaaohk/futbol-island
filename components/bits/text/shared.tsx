'use client';
/**
 * Shared plumbing for components/bits/text (heat-safe text one-shots adapted from React Bits "Text Animations" by David Haz,
 * https://reactbits.dev/c/text-animations, MIT + Commons Clause: components/bits/LICENSE-react-bits.md, docs/third-party.md).
 *
 * Rules every text component here follows:
 *  - One-shot: it plays when it scrolls into view (trigger 'view', once), on mount, or when the `play` key changes ('manual').
 *    Nothing loops; a cycle or shimmer stops after a fixed number of passes.
 *  - Transform / opacity / stroke-dashoffset or CSS only; timers are bounded setTimeout chains, never an rAF loop at rest.
 *  - prefers-reduced-motion shows the final text straight away.
 *  - The real words are always in the DOM for screen readers (an SR-only copy when the visible text is scrambled or split).
 */
import {useEffect,useRef,useState,type RefObject} from 'react';
import {SR_ONLY,useOneShot,useReducedMotion,useTimers,type Trigger} from '../motion';

export type TextShotProps={
 /** 'view' (default): first time on screen. 'mount': straight away. 'manual': each time `play` changes to a truthy value. */
 trigger?:Trigger;
 play?:unknown;
 onDone?:()=>void;
 className?:string;
};
export type ShotState='idle'|'run'|'done';

/** idle → run → done for one play; replays bump `run` (use it as a React key to restart CSS animations). */
export function useTextShot(ref:RefObject<Element>,{trigger='view',play,onDone}:TextShotProps,totalMs:number){
 const reduced=useReducedMotion(),run=useOneShot(ref,{trigger,play}),timers=useTimers();
 const [state,setState]=useState<ShotState>('idle');
 const done=useRef(onDone);done.current=onDone;
 useEffect(()=>{
  if(reduced){setState('done');return;}
  if(!run)return;
  timers.clear();setState('run');
  timers.after(totalMs,()=>{setState('done');done.current?.();});
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[run,reduced]);
 return {state,run,reduced,timers};
}

export function SrText({children}:{children:string}){return <span style={SR_ONLY}>{children}</span>;}

/** Split into words, keeping the spaces as plain text between them. */
export const words=(text:string)=>text.split(/(\s+)/).filter(s=>s.length>0);

/** Tiny deterministic PRNG (mulberry32) so a scramble is stable within one play. */
export function seeded(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
export const UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ',DIGITS='0123456789';
