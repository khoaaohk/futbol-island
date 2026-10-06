'use client';
import type {ComponentType} from 'react';
import {EXHIBITS} from '@/lib/endgame/museum';
import type {ExperienceProps} from '@/components/museum/experiences/types';
/** Mounts one experience on its own page for building and screenshots (each route calls guardLabRoute: 404 in production). */
export default function Lab({id,Experience}:{id:string;Experience:ComponentType<ExperienceProps>}){
 const exhibit=EXHIBITS.find(e=>e.id===id);if(!exhibit)return null;
 return <Experience exhibit={exhibit} earned={[]} openCertificate={id=>console.info('certificate',id)} onClose={()=>console.info('close')}/>;
}
