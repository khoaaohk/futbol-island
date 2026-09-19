'use client';
import {useEffect,useRef} from 'react';
import {drawPixelPortrait} from '@/lib/town/pixelPortrait';
export default function PlayerPortrait({name,size=64}:{name:string;size?:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ratio=Math.min(2,devicePixelRatio||1);canvas.width=size*ratio;canvas.height=size*ratio;const ctx=canvas.getContext('2d');if(!ctx)return;ctx.scale(ratio,ratio);ctx.imageSmoothingEnabled=false;drawPixelPortrait(ctx,size,name);},[name,size]);
 return <canvas ref={ref} width={size} height={size} style={{width:size,height:size,imageRendering:'pixelated'}} aria-hidden="true"/>;
}
