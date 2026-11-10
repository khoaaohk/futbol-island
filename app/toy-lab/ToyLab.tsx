'use client';
/**
 * /toy-lab (dev only, lib/dev/labRoutes.ts): the gashapon toy viewer on its own page, every toy owned (a lab-only save written
 * before the viewer mounts). ?toy=<id> opens one; the list below opens any. scripts/check-gashapon-toys-browser.cjs drives it.
 */
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {GASHAPON_TOYS} from '@/lib/gashapon/toys';
import {GASHAPON_KEY} from '@/lib/gashapon/store';
import type {GashaponToy} from '@/lib/gashapon/toys';
import type {ToyViewerOpts} from '@/lib/gashapon/toyViewer';
type Lab={ids:string[];toy:(id:string)=>GashaponToy|null;hooks:NonNullable<ToyViewerOpts['lab']>};
const Viewer=dynamic(()=>import('@/components/GashaponToyViewer'),{ssr:false});
export default function ToyLab(){
 const [ready,setReady]=useState(false),[toy,setToy]=useState<string|null>(null),[lab,setLab]=useState<Lab|null>(null);
 // Round 3C sample models (dev only, never registered for players): loaded here only.
 useEffect(()=>{import('@/lib/gashapon/toyModels/_labSamples').then(m=>setLab({ids:m.LAB_SAMPLE_IDS,toy:m.labSampleToy,hooks:m.labSamples}));},[]);
 useEffect(()=>{try{const owned:Record<string,{n:number;first:number}>={};GASHAPON_TOYS.forEach((t,i)=>{owned[t.id]={n:1,first:i+1};});
  localStorage.setItem(GASHAPON_KEY,JSON.stringify({version:1,owned,spins:{},day:'',today:0,last:0}));localStorage.setItem('fi2-sound-muted','true');}catch{/* storage off */}
  setToy(new URLSearchParams(location.search).get('toy')??'onigiri-ollie');setReady(true);
  (window as unknown as {__toyLab?:unknown}).__toyLab={open:(id:string)=>setToy(id),close:()=>setToy(null)};},[]);
 if(!ready||!lab)return null;
 const sample=toy?lab.toy(toy):null;
 return <main style={{minHeight:'100dvh',background:'#244d40',color:'#fff3d1',fontFamily:'system-ui',padding:24}}>
  <h1 style={{margin:'0 0 12px',fontSize:22}}>Toy lab</h1>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{GASHAPON_TOYS.map(t=><button key={t.id} data-lab-toy={t.id} onClick={()=>setToy(t.id)} style={{padding:'8px 12px',borderRadius:999,border:0,background:'#fff3d1',color:'#244d40',fontWeight:800}}>{t.name}</button>)}</div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:12}}>{lab.ids.map(id=><button key={id} data-lab-toy={id} onClick={()=>setToy(id)} style={{padding:'8px 12px',borderRadius:999,border:0,background:'#ffd447',color:'#244d40',fontWeight:800}}>{lab.toy(id)?.name}</button>)}</div>
  {toy&&<Viewer key={toy} toyId={toy} source="shelf" onClose={()=>setToy(null)} lab={sample?{toy:sample,...lab.hooks}:undefined}/>}
 </main>;
}
