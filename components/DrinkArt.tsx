'use client';
import {useEffect,useRef} from 'react';
import {drawDrink,type DrinkLayer,type DrinkView} from '@/lib/graphics/drinkArt';
import type {DrinkArt as Art} from '@/lib/town/drinkMachines';
/** One drink package (or one reveal layer), painted once per mount: no animation loop or renderer. */
/** `base`/`height`: where the package stands and how tall it is, as fractions of the canvas (the shelf slot leaves room for its name). */
/** `view`: 'front' (default: the machine glass, slots and tray are a flat, straight-on face) or 'iso'. */
/** `yaw`/`pitch` (degrees, both given): paint the package as seen from that camera direction instead (the in-use machine face, whose
 *  drink pictures turn to face the zoom camera; VendingMachines.productView). Numbers, so a re-render with the same angles paints nothing. */
/** `stand`: the package's base point (canvas height × `base`) lands exactly on the parent's bottom edge (the shelf line): the canvas is a
 *  square `1/base` of the parent's height, centred, overflowing below by the rest (room for the base ellipse and the floor shadow). */
export default function DrinkArt({art,layer,size=128,className,base=.94,height=.84,view='front',yaw,pitch,stand=false}:{art:Art;layer?:DrinkLayer;size?:number;className?:string;base?:number;height?:number;view?:DrinkView;yaw?:number;pitch?:number;stand?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current?.getContext('2d');if(!c)return;c.clearRect(0,0,size,size);drawDrink(c,art,size/2,size*base,size*height,layer,yaw!==undefined&&pitch!==undefined?{yaw,pitch}:view);},[art,layer,size,base,height,view,yaw,pitch]);
 return <canvas ref={ref} width={size} height={size} className={className} aria-hidden="true" style={stand?{position:'absolute',left:'50%',top:0,height:`${(100/base).toFixed(3)}%`,width:'auto',aspectRatio:'1',maxWidth:'none',maxHeight:'none',transform:'translateX(-50%)',pointerEvents:'none'}:{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom',pointerEvents:'none'}}/>;
}
