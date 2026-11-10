'use client';
/**
 * The island's gashapon HUD (round 2, Nov 8 2026): the world-anchored "Gashapon" prompt (placed by lib/graphics/gashaponPrompt.ts
 * from Town's HUD block) and, once the camera has zoomed onto the machine, its controls pinned on the machine itself
 * (components/GashaponMachineFace.tsx, round 5: no modal; loaded only on first open), plus the Toy Shelf / 3D toy viewer layer
 * (components/GashaponToyLayer.tsx, round 3A).
 */
import dynamic from 'next/dynamic';
import {gashaponOpener,useGashaponPanel} from '@/lib/gashapon/gashaponBrowser';
import GashaponToyLayer from './GashaponToyLayer';

const GashaponMachineFace=dynamic(()=>import('./GashaponMachineFace'),{ssr:false});
export default function GashaponHud(){
 const open=useGashaponPanel();
 return <>
  <button type="button" className="store-enter-prompt" data-gashapon-go="" aria-label="Open the capsule machine" hidden
   onClick={e=>{const id=e.currentTarget.dataset.gashaponGo;if(id)gashaponOpener.open(id);}}>Gashapon</button>
  {open&&<GashaponMachineFace/>}
  <GashaponToyLayer/>
 </>;
}
