'use client';
import {useEffect,useState} from 'react';
import type {GuideFormat} from '@/lib/site/pitch';
import {LINEUP_FORMAT_EVENT,lineupHeading} from '@/lib/site/tools/lineupHeading';
import {lineupHeadingEs} from './toolWordsEs';

/** A format landing's h1 (QA Nov 14 2026): the server renders the landing's own format (what search engines read), and the heading
 *  follows the builder when a coach switches the format select, so "7v7" no longer sits over an 11v11 lineup. */
export default function LineupHeading({format,className,lang}:{format:GuideFormat;className?:string;lang?:'es'}){
 const [f,setF]=useState(format);
 useEffect(()=>{const on=(e:Event)=>{const d=(e as CustomEvent<GuideFormat>).detail;if(d)setF(d);};window.addEventListener(LINEUP_FORMAT_EVENT,on);return()=>window.removeEventListener(LINEUP_FORMAT_EVENT,on);},[]);
 return <h1 className={className} data-lineup-heading={f}>{(lang==='es'?lineupHeadingEs:lineupHeading)(f)}</h1>;
}
