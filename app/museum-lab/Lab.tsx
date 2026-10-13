'use client';
import type {ComponentType} from 'react';
import {EXHIBITS} from '@/lib/endgame/museum';
import type {ExperienceProps} from '@/components/museum/experiences/types';
/** Mounts one experience on its own page for building and screenshots (each route calls guardLabRoute: 404 in production). */
export default function Lab({id,Experience}:{id:string;Experience:ComponentType<ExperienceProps>}){
 const exhibit=EXHIBITS.find(e=>e.id===id);if(!exhibit)return null;
 // onComplete is counted on window.__museumComplete so a browser check can prove it fires once, only at the real end.
 return <Experience exhibit={exhibit} earned={[]} openCertificate={id=>console.info('certificate',id)} onClose={()=>console.info('close')}
  onComplete={()=>{const w=window as unknown as {__museumComplete?:number};w.__museumComplete=(w.__museumComplete??0)+1;console.info('complete',id);}}/>;
}
