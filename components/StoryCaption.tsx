'use client';
import {useLayoutEffect,useRef,useState} from 'react';
import {captionPages,type CaptionPage} from '@/lib/paths/captionPages';
import styles from './StoryPlaybackBar.module.css';

export default function StoryCaption({text,id,time,start=0,duration=1}:{text:string;id?:string;time:number;start?:number;duration?:number}){
 const element=useRef<HTMLParagraphElement>(null),[layout,setLayout]=useState<{text:string;pages:CaptionPage[]}|null>(null);
 useLayoutEffect(()=>{
  const node=element.current;if(!node)return;const media=matchMedia('(max-width:600px), (pointer:coarse), (max-height:520px)'),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');let active=true,lastKey='';
  const measure=()=>{if(!active)return;if(!media.matches){setLayout(null);lastKey='';return;}const style=getComputedStyle(node),width=node.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-2,key=width+style.font;if(!ctx||width<=0||key===lastKey)return;lastKey=key;ctx.font=style.font;setLayout({text,pages:captionPages(text,width,value=>ctx.measureText(value).width)});};
  measure();const observer=new ResizeObserver(measure);observer.observe(node);media.addEventListener('change',measure);void document.fonts.ready.then(()=>{lastKey='';measure();});return()=>{active=false;observer.disconnect();media.removeEventListener('change',measure);};
 },[text]);
 const progress=Math.max(0,Math.min(1,(time-start)/Math.max(.01,duration))),pages=layout?.text===text?layout.pages:null;
 const page=pages?.find(p=>progress<p.end)??pages?.[pages.length-1];
 return <p ref={element} id={id} className={styles.caption} data-caption-paged={!!pages}>{page?.text??text}</p>;
}
