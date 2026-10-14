'use client';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import type {BootDesign} from '@/lib/shop/boots';
/** Lazy like the shop: three.js and the studio load only when it opens. */
const BootStudio=dynamic(()=>import('@/components/shop/BootStudio'),{ssr:false});
export default function BootLab(){
 const [open,setOpen]=useState(true);
 const buy=(d:BootDesign)=>{const w=window as unknown as {__bootBuys?:BootDesign[]};(w.__bootBuys??=[]).push(d);console.info('buy boots',d);};
 return <main style={{minHeight:'100svh',display:'grid',placeItems:'center',background:'#244d40'}}>
  {open?<BootStudio onClose={()=>setOpen(false)} onBuy={buy}/>:<button type="button" onClick={()=>setOpen(true)} style={{padding:'14px 22px',borderRadius:999,border:'3px solid #fff2cd',background:'#e9c16b',font:'700 16px Arial'}}>Open the boot studio</button>}
 </main>;
}
