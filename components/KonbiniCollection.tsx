'use client';
import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './Backpack.module.css';
import own from './KonbiniCollection.module.css';
import KonbiniReveal,{revealItemFor,type RevealItem} from './KonbiniReveal';
import {collectionGroups,collectionProgress,consumable,foodNote} from '@/lib/konbini/food';
import {foodBitmap} from '@/lib/konbini/foodArt';
import {useKonbiniCollection,eatFromPouch} from '@/lib/konbini/foodStore';
import type {BackpackItem} from '@/lib/town/backpack';

/**
 * Backpack → Konbini Collection (user, Sep 29 2026): every Konbini item grouped by store (plus any registered group, e.g. the
 * drink machines), collected ones in colour, the rest as silhouettes that say where they're sold, and a progress count.
 * Tapping a collected item replays its layered reveal. Static tiles: each thumbnail is the item's iso art, painted once per size
 * into foodArt's bitmap cache and blitted.
 */
/** The item's iso art, blitted from foodArt's cached bitmap (painted once per item and size); the silhouette is the same shapes
 *  filled dark by CSS. */
export function FoodArt({id,silhouette=false,size=64}:{id:string;silhouette?:boolean;size?:number}){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{const c=ref.current?.getContext('2d');if(!c)return;const px=Math.round(size*Math.min(2,window.devicePixelRatio||1)),bmp=foodBitmap(id,px);if(!bmp)return;
  c.canvas.width=px;c.canvas.height=px;c.clearRect(0,0,px,px);c.drawImage(bmp,0,0);},[id,size]);
 return <canvas ref={ref} width={size} height={size} aria-hidden="true" className={silhouette?own.silhouette:undefined} style={{width:size,height:size}}/>;
}
export function KonbiniCollection(){
 const col=useKonbiniCollection(),progress=collectionProgress(col),[replay,setReplay]=useState<RevealItem|null>(null);
 return <div className={own.collection} data-konbini-collection>
  <p className={own.progress} data-konbini-progress>Konbini Collection <b>{progress.have}/{progress.total}</b></p>
  {collectionGroups().map(g=>{const p=progress.groups.find(x=>x.id===g.id);return <section key={g.id} data-konbini-group={g.id}>
   <h5 className={own.groupTitle}>{g.label} <span className={styles.count}>{p?.have??0}/{p?.total??g.items.length}</span></h5>
   <ul className={styles.grid} role="list">{g.items.map(i=>{const got=!!col.items[i.id];return <li key={i.id}>
    <button type="button" className={styles.tile} data-konbini-collected={got||undefined} data-konbini-item={i.id} disabled={!got} aria-label={got?`${i.label}. Replay its reveal.`:`Not collected yet. ${i.hint}.`}
     onClick={()=>{const r=revealItemFor(i.id,'YOUR KONBINI COLLECTION');if(r)setReplay(r);}}>
     <span className={styles.art}><FoodArt id={i.id} silhouette={!got} size={96}/></span>
     <span className={styles.name}>{got?i.label:'???'}</span><span className={styles.meta}>{got?(i.jp??''):i.hint}</span></button></li>;})}</ul></section>;})}
  {/* The replay covers the whole screen: mounted on the open modal dialog (Make it yours sits in the top layer), else the page,
      so the panel's header can't sit over it (Sep 29 2026). */}
  {replay&&createPortal(<KonbiniReveal item={replay} onDone={()=>setReplay(null)}/>,(typeof document!=='undefined'&&document.querySelector('dialog[open]'))||document.body)}
 </div>;
}
/** Backpack renderer for the Snacks pouch: the food art, and Eat (with its football-nutrition note). */
export const snackRenderer={art:(item:BackpackItem)=><FoodArt id={item.ref.split('|')[1]??''}/>,
 action:(item:BackpackItem)=>{const food=item.ref.split('|')[1]??'',drink=/^drink-/.test(food);return {verb:drink?'Drink':'Eat',run:()=>{const [purchase]=item.ref.split('|');const r=eatFromPouch(purchase);return r.ok?`${drink?'Refreshing':'Yum'}, ${consumable(food)?.label??'snack'}! ${r.note??foodNote(food)}`:'Already finished.';}};}};
