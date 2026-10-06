'use client';
import dynamic from 'next/dynamic';
import type {ComponentType} from 'react';
import type {ExperienceProps} from './types';
/**
 * Exhibit id → its lazily loaded full-screen experience. Only REVIEWED experiences are wired here (READY); the rest show the
 * placeholder, so work in progress never breaks the museum page. Agents build and test theirs at /museum-lab/<id>.
 */
const load=(f:()=>Promise<{default:ComponentType<ExperienceProps>}>)=>dynamic(f,{ssr:false,loading:()=><p role="status" style={{position:'fixed',inset:0,zIndex:20,display:'grid',placeItems:'center',margin:0,background:'#111',color:'#fff'}}>Opening the exhibit…</p>});
const placeholder=load(()=>import('./Placeholder'));
const READY:Record<string,ComponentType<ExperienceProps>>={
 'timeline':load(()=>import('./timeline/Experience')),
 'laced-leather':load(()=>import('./laced-leather/Experience')),
 'cards-1970':load(()=>import('./cards-1970/Experience')),
 'telstar-1970':load(()=>import('./telstar-1970/Experience')),
 'var-2018':load(()=>import('./var-2018/Experience')),
 'wwc-1991':load(()=>import('./wwc-1991/Experience')),
 'penalty-1891':load(()=>import('./penalty-1891/Experience')),
 'futsal-1989':load(()=>import('./futsal-1989/Experience')),
 'worldcup-1930':load(()=>import('./worldcup-1930/Experience')),
 'hall-of-fame':load(()=>import('./hall-of-fame/Experience')),
 'backpass-1992':load(()=>import('./backpass-1992/Experience')),
 'shirts':load(()=>import('./shirts/Experience')),
 'laws-1863':load(()=>import('./laws-1863/Experience')),
};
const IDS=['timeline','laws-1863','penalty-1891','cards-1970','backpass-1992','var-2018','worldcup-1930','wwc-1991','futsal-1989','laced-leather','telstar-1970','shirts','hall-of-fame'] as const;
export const EXPERIENCES:Readonly<Record<string,ComponentType<ExperienceProps>>>=Object.fromEntries(IDS.map(id=>[id,READY[id]??placeholder]));
