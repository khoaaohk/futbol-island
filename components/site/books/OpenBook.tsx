'use client';
import {useRef,useState,type ComponentType} from 'react';
import type {ReaderBook} from '@/lib/site/books';
import s from './books.module.css';
/**
 * "Open the pop-up book" (Nov 17 2026): a link to the story on the page (it works with no script) that, on tap, fetches the
 * game's 3D pop-up reader (./GameBookReader, its own chunk with three.js and the spreads) and opens it. Nothing is downloaded
 * before the tap.
 */
type Reader=ComponentType<{book:ReaderBook;onClose:()=>void}>;
export default function OpenBook({book,label='Open the pop-up book'}:{book:ReaderBook;label?:string}){
 const [Reader,setReader]=useState<Reader|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState(false);
 const btn=useRef<HTMLAnchorElement>(null);
 const go=(e:React.MouseEvent)=>{
  if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();if(Reader){setOpen(true);return;}
  setBusy(true);
  import('./GameBookReader').then(m=>{setReader(()=>m.default);setOpen(true);}).catch(()=>{location.hash='story';}).finally(()=>setBusy(false));
 };
 return <>
  <a ref={btn} href="#story" className={s.openBtn} onClick={go} aria-haspopup="dialog" aria-busy={busy||undefined} data-open-book="">
   {busy?'Opening the book…':label}
  </a>
  {open&&Reader&&<Reader book={book} onClose={()=>{setOpen(false);requestAnimationFrame(()=>btn.current?.focus({preventScroll:true}));}}/>}
 </>;
}
