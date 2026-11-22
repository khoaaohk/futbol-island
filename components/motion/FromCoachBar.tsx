'use client';
import {useEffect,useState} from 'react';
import s from './FromCoachBar.module.css';
/**
 * A site page opened from the coach app's Home (the Practice plans tile: /learn/soccer-practice-plans?from=coach) shows a way back:
 * one "Back to the Coach app" pill at the bottom (owner, Nov 22 2026: every tool on Home needs a way back to it). Only with
 * ?from=coach in this page's address, so a visitor from search never sees it. It also notes this page as the last site page seen
 * (sessionStorage fi-site-last), which the coach apps' Exit returns to.
 */
export default function FromCoachBar(){
 const [es,setEs]=useState<boolean|null>(null);
 useEffect(()=>{/* the last site page seen this session: the coach apps' Exit returns here (the site sends only its origin as the referrer) */
  try{window.sessionStorage.setItem('fi-site-last',location.pathname+location.search);}catch{/* optional */}
  const q=new URLSearchParams(window.location.search);if(q.get('from')==='coach')setEs(location.pathname.startsWith('/es/')||q.get('lang')==='es');},[]);
 if(es===null)return null;
 return <a className={s.bar} href={es?'/coach?lang=es':'/coach'} data-from-coach="">
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 6 8.5 12l6 6"/></svg>
  {es?'Volver a la app del entrenador':'Back to the Coach app'}</a>;
}
