'use client';
import {useEffect,useState} from 'react';
import dynamicImport from 'next/dynamic';
import {GROWNUPS_OPEN,type GrownUpsOpen} from '@/lib/grownups/prefs';
import type {GrownUpSettings} from './GrownUps';
/** Loaded only when a grown-up opens it (heat: nothing runs until the first open; static DOM, no loops). */
const GrownUps=dynamicImport(()=>import('./GrownUps'),{ssr:false});

/** Listens for `openGrownUps()` (Settings, Coaches Centre) and shows the gated "For grown-ups" dialog. */
export default function GrownUpsHost({settings,onLaunch,onOpenChange}:{settings?:GrownUpSettings;onLaunch?:()=>void;onOpenChange?:(open:boolean)=>void}){
 const [state,setState]=useState<{open:boolean;view:'home'|'plan';nonce:number}|null>(null);
 // QA11 H-1 (heat): the sheet covers the island, so Town sleeps its render loop while it is open (like GraduationHost).
 const showing=!!state?.open;
 useEffect(()=>{onOpenChange?.(showing);return()=>{if(showing)onOpenChange?.(false);};},[showing,onOpenChange]);
 useEffect(()=>{const show=(e:Event)=>{const d=(e as CustomEvent<GrownUpsOpen>).detail;setState({open:true,view:d?.view??'home',nonce:Date.now()});};
  window.addEventListener(GROWNUPS_OPEN,show);return()=>window.removeEventListener(GROWNUPS_OPEN,show);},[]);
 if(!state)return null;
 return <GrownUps key={state.nonce} open={state.open} view={state.view} settings={settings} onClose={()=>setState(s=>s&&{...s,open:false})} onLaunch={()=>onLaunch?.()}/>;
}
