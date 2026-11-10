'use client';
/**
 * Where the Toy Shelf and the 3D toy viewer appear (round 3A, Nov 8 2026): mounted once on the island (GashaponHud) and once in
 * the Arcade room. Both load only when first opened (lib/gashapon/gashaponBrowser.ts toyOverlay: openToyShelf / openToyViewer).
 */
import dynamic from 'next/dynamic';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {toyOverlay,toyViewerHost,useToyOverlay,useToyViewerClaimed} from '@/lib/gashapon/gashaponBrowser';

const Shelf=dynamic(()=>import('./GashaponToyShelf'),{ssr:false});
const Viewer=dynamic(()=>import('./GashaponToyViewer'),{ssr:false});
/** `nested`: the viewer only, inside a modal dialog (the backpack's Toys, Nov 9 2026); it claims the viewer while mounted. */
export default function GashaponToyLayer({nested=false}:{nested?:boolean}){
 const o=useToyOverlay(),claimed=useToyViewerClaimed(),mark=useRef<HTMLSpanElement>(null),[host,setHost]=useState<HTMLElement|null>(null);
 // Nested: portalled to the enclosing <dialog> itself, above the backpack's sticky chips and stacking contexts.
 useEffect(()=>{if(!nested)return;setHost(mark.current?.closest('dialog')??document.body);return toyViewerHost.claim();},[nested]);
 const viewer=o.toy?<Viewer key={o.toy} toyId={o.toy} source={o.source} onClose={toyOverlay.closeViewer}/>:null;
 if(nested)return <><span ref={mark} hidden/>{viewer&&host?createPortal(viewer,host):null}</>;
 return <>
  {o.shelf&&<Shelf onClose={toyOverlay.closeShelf}/>}
  {!claimed&&viewer}
 </>;
}
