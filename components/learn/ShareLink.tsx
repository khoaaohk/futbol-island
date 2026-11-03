'use client';
import {useState} from 'react';
import s from './learn.module.css';

/** "Share this page": the system share sheet where there is one, otherwise copy the link. Nothing is sent anywhere by us. */
export default function ShareLink({url,title}:{url:string;title:string}){
 const [done,setDone]=useState('');
 const share=async()=>{
  const nav=navigator as Navigator&{share?:(d:ShareData)=>Promise<void>};
  try{if(nav.share){await nav.share({url,title});return;}}catch{return;}
  try{await navigator.clipboard.writeText(url);setDone('Link copied');}catch{setDone(url);}
 };
 return <span className={s.share}><button type="button" className={s.ghostBtn} onClick={share}>Share this page</button><span aria-live="polite" className={s.shareNote}>{done}</span></span>;
}
