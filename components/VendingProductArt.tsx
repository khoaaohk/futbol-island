'use client';
import {useEffect,useRef} from 'react';
import {drawVendingProduct} from '@/lib/graphics/vendingProductArt';
/** Paint once per product; no animation or background renderer. */
export default function VendingProductArt({id,kind}:{id:string;kind:string}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current?.getContext('2d');if(!c)return;c.clearRect(0,0,128,128);
  // Stand the product on the canvas's bottom edge (the shelf line): a pack is 2 s tall, a book 1.7 s.
  if(kind==='pack')drawVendingProduct(c,id,kind,64,124-52,52,false);else drawVendingProduct(c,id,kind,64,71,64,false);},[id,kind]);
 return <canvas ref={ref} width={128} height={128} aria-hidden="true" style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom',pointerEvents:'none'}}/>;
}
