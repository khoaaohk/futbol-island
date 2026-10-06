'use client';
import {useEffect,useRef} from 'react';
import {drawVendingProduct} from '@/lib/graphics/vendingProductArt';
/** Paint once per product; no animation or background renderer. */
/** `stand` (the in-use vending face's shelf slots): the art's lowest solid pixel lands exactly on the parent's bottom edge, the shelf
 *  slab's top (Oct 5 2026, "these items are floating still"). The canvas is a square as tall as the parent, centred, and moved down by
 *  the transparent rows under the art, measured once after the paint (one 128×128 read; no re-render). */
export default function VendingProductArt({id,kind,stand=false}:{id:string;kind:string;stand?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current?.getContext('2d');if(!c)return;c.clearRect(0,0,128,128);
  // Stand the product on the canvas's bottom edge (the shelf line): a pack is 2 s tall, a book 1.7 s.
  if(kind==='pack')drawVendingProduct(c,id,kind,64,124-52,52,false);else drawVendingProduct(c,id,kind,64,71,64,false);
  if(stand&&ref.current){let low=128;try{const d=c.getImageData(0,0,128,128).data;low=0;for(let y=127;y>=0&&!low;y--)for(let x=0;x<128;x++)if(d[(y*128+x)*4+3]>200){low=y+1;break;}}catch{low=128;}
   ref.current.style.transform=`translateX(-50%) translateY(${((128-(low||128))/128*100).toFixed(3)}%)`;}},[id,kind,stand]);
 return <canvas ref={ref} width={128} height={128} aria-hidden="true" style={stand?{position:'absolute',left:'50%',bottom:0,height:'100%',width:'auto',aspectRatio:'1',maxWidth:'none',maxHeight:'none',transform:'translateX(-50%)',pointerEvents:'none'}:{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center bottom',pointerEvents:'none'}}/>;
}
