'use client';
import {useMemo,useRef} from 'react';
import {benchCamera,benchItems,carriageItems,slide,wheelHandle} from './bench';
import {useSize} from '../anatomy/hooks';
import Draw from './Draw';
import s from './Experience.module.css';

/** The cover's picture: the bench's first cases with the carriage at the start (static, built once per size). */
export default function CoverArt({ids}:{ids:readonly string[]}){
 const box=useRef<HTMLDivElement>(null),{w,h}=useSize(box);
 const art=useMemo(()=>{if(!w||!h)return null;const P=benchCamera(w,h),[dx,dy]=slide(P,1);
  return <svg className="iso-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="A long display bench with a stand for every case, and a carriage on rails in front.">
   <g transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`}><Draw items={benchItems(ids,P,1)}/></g><Draw items={[...carriageItems(P),...wheelHandle(P,-.9)]}/></svg>;},[w,h,ids]);
 return <div ref={box} className={s.coverArt}>{art}</div>;
}
