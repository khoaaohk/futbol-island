'use client';
import {useEffect,useState} from 'react';
import ParentGate from '../ParentGate';
import {DONATION_AMOUNTS,NONPROFITS} from '../DonationLinks';
import {parentGatePassed} from '@/lib/parentGate';
import styles from './Title.module.css';
import {trackStart} from '@/lib/analytics/startEvents';
import {nonprofitSlug} from '@/lib/analytics/startIds';

/**
 * /start For grown-ups → "Local non-profits" (user, Oct 9 2026): the same non-profits and Stripe tiers as Settings → About
 * (components/DonationLinks.tsx), behind the shared grown-up check because donations use real money. Returns to /start.
 */
export default function Donate({returnTo='start'}:{returnTo?:'start'|'about'}={}){
 const [step,setStep]=useState<'closed'|'gate'|'open'>('closed');
 useEffect(()=>{if(parentGatePassed())setStep('open');},[]);
 const last=NONPROFITS.length-1;
 return <>
  <p>We also work with local non-profits growing the game in our community. Every dollar donated goes straight to them. We’re proud to support {NONPROFITS.map((n,i)=><span key={n.name}>{i===last?'and ':''}<a href={n.href} data-track={'sg:'+nonprofitSlug(n.name)} target="_blank" rel="noopener noreferrer">{n.name}</a>{i<last?', ':'.'}</span>)}</p>
  {step==='closed'&&<button type="button" className={styles.donateButton} data-track="sg:donate" onClick={()=>setStep(parentGatePassed()?'open':'gate')}>Donate</button>}
  {step==='gate'&&<ParentGate reason="Donations use real money and open a payment page." onCancel={()=>{trackStart('sg:gate_no');setStep('closed');}} onPass={()=>{trackStart('sg:gate_ok');setStep('open');}}/>}
  {step==='open'&&<div className={styles.donateBox}>
   <div className={styles.donateAmounts}>{DONATION_AMOUNTS.map(a=><a key={a} href={`/coffee/checkout?amount=${a*100}&return=${returnTo}`} data-track={'sg:amt_'+a} target="_blank" rel="noopener noreferrer" aria-label={`Donate $${a} through Stripe`}>${a}</a>)}</div>
   <p className={styles.donateNote}>Choose an amount. You can increase the quantity at checkout. Secure by Stripe.</p>
  </div>}
 </>;
}
