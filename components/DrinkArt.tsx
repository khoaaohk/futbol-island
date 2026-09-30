'use client';
import {useEffect,useRef} from 'react';
import {drawDrink,type DrinkLayer,type DrinkView} from '@/lib/graphics/drinkArt';
import type {DrinkArt as Art} from '@/lib/town/drinkMachines';
/** One drink package (or one reveal layer), painted once per mount: no animation loop or renderer. */
/** `base`/`height`: where the package stands and how tall it is, as fractions of the canvas (the shelf slot leaves room for its name). */
/** `view`: 'front' (default: the machine glass, slots and tray are a flat, straight-on face) or 'iso'. */
export default function DrinkArt({art,layer,size=128,className,base=.94,height=.84,view='front'}:{art:Art;layer?:DrinkLayer;size?:number;className?:string;base?:number;height?:number;view?:DrinkView}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current?.getContext('2d');if(!c)return;c.clearRect(0,0,size,size);drawDrink(c,art,size/2,size*base,size*height,layer,view);},[art,layer,size,base,height,view]);
 return <canvas ref={ref} width={size} height={size} className={className} aria-hidden="true" style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom',pointerEvents:'none'}}/>;
}
