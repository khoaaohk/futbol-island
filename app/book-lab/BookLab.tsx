'use client';
/**
 * /book-lab?book=<id> (dev only, lib/dev/labRoutes.ts): the game's 3D paper pop-up reader (components/PlayerPopUpBook.tsx, site
 * mode) on its own page, opened at page 0 with sound off. ?shot adds the capture look: no chapter line, buttons or story tray, so
 * the picture fills the window. scripts/capture-book-spreads.cjs drives it to make public/books/spreads/<book>/<chapter>.webp.
 */
import dynamic from 'next/dynamic';
import {useEffect,useState} from 'react';
import {BOOK_PROGRESS_KEY} from '@/lib/books/messi';
import type {PlayerBookId} from '@/lib/books/catalog';
const Reader=dynamic(()=>import('@/components/PlayerPopUpBook'),{ssr:false});
const SHOT=`[data-player-book]{--bottom:0px!important}[data-chapter-line]{display:none!important}
[data-player-book] header,[data-player-book] nav,[data-player-book] nav *,[data-story-playback-bar]{opacity:0!important}`;
export default function BookLab(){
 const [book,setBook]=useState<{id:PlayerBookId;shot:boolean}|null>(null);
 useEffect(()=>{const q=new URLSearchParams(location.search),id=(q.get('book')??'cafu') as PlayerBookId;
  try{localStorage.setItem(BOOK_PROGRESS_KEY,JSON.stringify({version:1,[id]:Number(q.get('page')??0)||0}));localStorage.setItem('fi2-sound-muted','true');}catch{/* storage off */}
  setBook({id,shot:q.has('shot')});},[]);
 if(!book)return null;
 return <main style={{minHeight:'100dvh',background:'#3a7fa4'}}>
  {book.shot&&<style>{SHOT}</style>}
  <Reader key={book.id} bookId={book.id} site onClose={()=>{}}/>
 </main>;
}
