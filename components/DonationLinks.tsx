'use client';
import {useEffect,useState} from 'react';
import ParentGate from './ParentGate';
import {Icon} from './Icon';
import {parentGatePassed} from '@/lib/parentGate';
import styles from './IslandSettings.module.css';
/**
 * About → "Support Futbol Island" (G-17, Sep 30 2026). Donations and links that leave the game sit behind the shared grown-up
 * check (components/ParentGate.tsx, lib/parentGate.ts), the usual kids'-app pattern (COPPA-minded; app-store kids' category
 * rules ask for a parental gate before purchases and external links). Children see one plain button; nothing is stored.
 * Also used by /coffee (app/coffee/CoffeeGate.tsx wraps its tiers the same way).
 */
export const DONATION_AMOUNTS=[5,10,15,25] as const;
/** The local non-profits donations go to (shared with the title screen's For grown-ups sheet). */
export const NONPROFITS=[{name:'FC YAP',href:'https://www.instagram.com/fc_yap/'},{name:'Street Soccer San Diego',href:'https://www.instagram.com/streetsoccersd/'},{name:'Ronin Futsal',href:'https://www.instagram.com/roninfutsal/'}] as const;
export default function DonationLinks(){
 const [step,setStep]=useState<'closed'|'gate'|'open'>('closed');
 useEffect(()=>{if(parentGatePassed())setStep('open');},[]);
 if(step==='closed')return <button type="button" className={`${styles.mapButton} ${styles.secondaryButton}`} data-donation-gate onClick={()=>setStep(parentGatePassed()?'open':'gate')}><span className={styles.entryCopy}><strong>For grown-ups</strong><small>Ways to support the island.</small></span><span aria-hidden="true"><Icon name="arrow"/></span></button>;
 if(step==='gate')return <ParentGate reason="Donations use real money and open a payment page." onCancel={()=>setStep('closed')} onPass={()=>setStep('open')}/>;
 return <div data-donation-links>
  <p>If it’s helped you and you’d like to chip in, feel free to buy us a coffee. Every dollar goes straight to non-profits growing the game in our community. We’re proud to support <a href="https://www.instagram.com/fc_yap/" target="_blank" rel="noopener noreferrer">FC YAP</a>, <a href="https://www.instagram.com/streetsoccersd/" target="_blank" rel="noopener noreferrer">Street Soccer San Diego</a>, and <a href="https://www.instagram.com/roninfutsal/" target="_blank" rel="noopener noreferrer">Ronin Futsal</a>.</p>
  <div className={styles.donations}>{DONATION_AMOUNTS.map(amount=><a key={amount} href={`/coffee/checkout?amount=${amount*100}&return=about`} target="_blank" rel="noopener noreferrer" aria-label={`Donate $${amount} through Stripe`}>${amount}</a>)}</div>
  <p className={styles.donationNote}>Choose an amount. You can increase the quantity at checkout. Secure by Stripe.</p>
 </div>;
}
