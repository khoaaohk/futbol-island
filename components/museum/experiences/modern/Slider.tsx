'use client';
import type {ReactNode} from 'react';
import c from './slider.module.css';
/**
 * A thumb-sized range slider for the Paper play docks (Oct 14 2026; additive shared piece: free-kick-wall, ball-curve, throw-in).
 * A real <input type="range"> (keyboard and screen readers for free), 44 px tall, a 30 px thumb in the exhibit's --accent,
 * the label left and the live value right.
 */
export default function Slider({label,value,min,max,step=1,onChange,show,disabled,name}:{label:ReactNode;value:number;min:number;max:number;step?:number;
 onChange:(v:number)=>void;show:ReactNode;disabled?:boolean;name:string}){
 const f=(value-min)/(max-min||1);
 return <label className={c.slider} data-slider={name}>
  <span className={c.head}><span>{label}</span><b>{show}</b></span>
  <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-valuetext={typeof show==='string'?show:undefined}
   onChange={e=>onChange(Number(e.currentTarget.value))} style={{'--f':f} as React.CSSProperties}/>
 </label>;
}
