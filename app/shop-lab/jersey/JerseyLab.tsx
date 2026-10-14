'use client';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import type {JerseyDesign} from '@/lib/shop/jersey';
import {jerseyPrice} from '@/lib/shop/jersey';

// Loaded the same way the shop loads it: a separate chunk, three.js only once the studio mounts.
const JerseyStudio=dynamic(()=>import('@/components/shop/JerseyStudio'),{ssr:false});

export default function JerseyLab(){
 const [open,setOpen]=useState(()=>{if(typeof window!=='undefined'&&/[?&]debug\b/.test(location.search))(window as unknown as {__fiJerseyDebug:boolean}).__fiJerseyDebug=true;return true;});
 const [bought,setBought]=useState<JerseyDesign|null>(null);
 return <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',background:'#244d40',color:'#fff2cd',fontFamily:'Arial,sans-serif'}}>
  {!open&&<div style={{textAlign:'center'}}>
   <p>Studio closed.</p>
   {bought&&<p data-bought>Bought for {jerseyPrice(bought)} coins: {bought.pattern}, {bought.collar}, #{bought.number ?? '–'} {bought.name}</p>}
   <button type="button" onClick={()=>setOpen(true)} style={{padding:'12px 20px',borderRadius:999,border:'3px solid #fff2cd',background:'#e9c16b',fontWeight:800}}>Open the jersey studio</button>
  </div>}
  {open&&<JerseyStudio onClose={()=>setOpen(false)} onBuy={d=>{setBought(d);setOpen(false);}}/>}
 </main>;
}
