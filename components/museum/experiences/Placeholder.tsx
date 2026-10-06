'use client';
import {NavigationButton} from '@/components/DoneButton';
import type {ExperienceProps} from './types';
/** Shown for an exhibit whose full-screen experience is still being built (the hall keeps working meanwhile). */
export default function Placeholder({exhibit,onClose}:ExperienceProps){
 return <section role="dialog" aria-modal="true" aria-label={exhibit.title} data-museum-experience={exhibit.id} style={{position:'fixed',inset:0,zIndex:20,background:'#111',color:'#fff',display:'grid',placeItems:'center',textAlign:'center',padding:24}}>
  <div style={{position:'absolute',top:20,left:20}}><NavigationButton back label="Back" onNavigate={onClose}/></div>
  <div><p style={{opacity:.6,letterSpacing:'.12em',textTransform:'uppercase',fontSize:12}}>Coming soon</p><h1 style={{margin:'8px 0'}}>{exhibit.year} · {exhibit.title}</h1></div>
 </section>;
}
