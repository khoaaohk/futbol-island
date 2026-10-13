import type {ReactNode} from 'react';
import s from './modern.module.css';
/**
 * The gallery wall label (docs/museum-modern-style.md): **Title**, then a small "Year · Place" line in muted ink, then an optional
 * one-line caption. Left-aligned Swiss type. `as` picks the heading level so each exhibit keeps its own outline.
 */
export default function WallLabel({title,meta,caption,as:H='h2',id,className}:{title:ReactNode;meta?:ReactNode;caption?:ReactNode;as?:'h1'|'h2'|'h3';id?:string;className?:string}){
 return <div className={`${s.label}${className?' '+className:''}`} data-wall-label>
  <H id={id} className={s.labelTitle}>{title}</H>
  {meta!=null&&<p className={s.labelMeta}>{meta}</p>}
  {caption!=null&&<p className={s.labelCaption}>{caption}</p>}
 </div>;
}
