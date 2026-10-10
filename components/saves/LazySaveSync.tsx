'use client';
import dynamic from 'next/dynamic';
/**
 * SaveSync (components/saves/SaveSync.tsx) loaded after hydration, so it adds nothing to a page's first-load JS. The start
 * check still runs well inside the island's loading screen; the rooms (boot={false}) only need the tab-hide listener.
 */
const SaveSync=dynamic(()=>import('./SaveSync'),{ssr:false});
export default function LazySaveSync({boot=true}:{boot?:boolean}){return <SaveSync boot={boot}/>;}
