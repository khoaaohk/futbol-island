'use client';
import dynamic from 'next/dynamic';
import {useState} from 'react';
import type {BallDesign} from '@/lib/shop/ball';
import {ballPrice} from '@/lib/shop/ball';
/** Loaded exactly as the shop loads it: next/dynamic, client only. */
const BallStudio=dynamic(()=>import('@/components/shop/BallStudio'),{ssr:false});
export default function BallLab(){
 const [open,setOpen]=useState(true),[bought,setBought]=useState<BallDesign|null>(null);
 return <main style={{minHeight:'100dvh',background:'#244d40',color:'#fff3d1',fontFamily:'system-ui',display:'grid',placeItems:'center',gap:12,padding:24}}>
  {open?<BallStudio onClose={()=>setOpen(false)} onBuy={d=>{setBought(d);}}/>:<button onClick={()=>setOpen(true)} style={{padding:'14px 22px',borderRadius:999,border:'3px solid #fff2cd',background:'#e9c16b',color:'#244d40',fontWeight:900}}>Open the ball studio</button>}
  {bought&&<p data-bought style={{position:'fixed',zIndex:200,left:12,bottom:12,margin:0,padding:'8px 12px',borderRadius:12,background:'#000a',fontSize:12}}>onBuy: {bought.layout} · {ballPrice(bought)} coins</p>}
 </main>;
}
