'use client';
/**
 * ClickSpark. Adapted from React Bits "Click Spark" by David Haz (https://reactbits.dev/animations/click-spark,
 * https://github.com/DavidHDev/react-bits). MIT + Commons Clause, Copyright (c) 2026 David Haz: see
 * components/bits/LICENSE-react-bits.md and docs/third-party.md.
 *
 * Futbol Island adaptation (Oct 10 2026): the original keeps a full-size canvas with a requestAnimationFrame loop running for
 * as long as it is mounted. This version draws nothing at rest: a tap appends a few short lines in a fixed layer at the tap
 * point, the compositor plays one WAAPI animation per line (transform/opacity), and the layer removes itself when they finish.
 * 0 rAF, at rest and while sparking. Keyboard activation sparks from the element's centre. Reduced motion: no sparks.
 * Use sparkFrom(event) inside an existing onClick (no wrapper element, so host layouts are untouched).
 */
import type {MouseEvent as ReactMouseEvent} from 'react';
import {prefersReducedMotion} from './motion';

export type SparkOptions={color?:string;count?:number;/** px the lines travel */radius?:number;/** px line length */size?:number;duration?:number};

let live=0;
const MAX_LIVE=3;// a burst of taps never stacks more than three layers

/** One burst at viewport point (x, y). Returns false when skipped (reduced motion, no WAAPI, too many live bursts). */
export function sparkAt(x:number,y:number,{color='#f2c230',count=8,radius=30,size=10,duration=420}:SparkOptions={}){
 if(typeof document==='undefined'||prefersReducedMotion()||live>=MAX_LIVE)return false;
 const layer=document.createElement('span');
 if(typeof layer.animate!=='function')return false;
 layer.setAttribute('aria-hidden','true');layer.dataset.clickSpark='';
 layer.style.cssText=`position:fixed;left:${x}px;top:${y}px;width:0;height:0;pointer-events:none;z-index:2147483000`;
 const lines:Animation[]=[];
 for(let i=0;i<count;i++){
  const a=(360/count)*i,line=document.createElement('i');
  line.style.cssText=`position:absolute;left:-1px;top:${-size/2}px;width:2px;height:${size}px;border-radius:2px;background:${color}`;
  layer.appendChild(line);
  lines.push(line.animate([
   {transform:`rotate(${a}deg) translate3d(0,-6px,0) scaleY(1)`,opacity:1},
   {transform:`rotate(${a}deg) translate3d(0,${-radius}px,0) scaleY(0.2)`,opacity:0},
  ],{duration,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'}));
 }
 document.body.appendChild(layer);live++;
 let removed=false;const remove=()=>{if(removed)return;removed=true;live--;layer.remove();};
 Promise.all(lines.map(l=>l.finished)).then(remove,remove);
 window.setTimeout(remove,duration+400);// belt and braces if a finished promise never settles
 return true;
}

/** Spark from a click: the tap point, or the element's centre for keyboard activation (detail 0). */
export function sparkFrom(event:ReactMouseEvent<Element>|MouseEvent,options?:SparkOptions){
 const target=event.currentTarget as Element|null;
 if(event.detail===0||(event.clientX===0&&event.clientY===0)){
  const r=target?.getBoundingClientRect();if(!r)return false;
  return sparkAt(r.left+r.width/2,r.top+r.height/2,options);
 }
 return sparkAt(event.clientX,event.clientY,options);
}
