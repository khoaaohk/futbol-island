'use client';
import {useEffect,useMemo,useState} from 'react';
import {AGE_BANDS,ANIMALS,COLOURS,STYLES,cleanPlace,generateNames,type AgeBand,type Style} from '@/lib/site/tools/teamNames';
import {store} from './toolAudio';
import s from './newTools.module.css';
import m from './moreTools.module.css';
/**
 * The soccer team name generator (Nov 22 2026; /tools/soccer-team-name-generator and its Spanish twin). Names come only from
 * the curated lists in lib/site/tools/teamNames.ts; the same seed gives the same names, so the server renders the example list
 * (seed 1) and Shuffle just moves the seed. Favourites and the last choices stay in localStorage on this device. No timers.
 */
const KEY='fi-team-names-v1';
const W={
 en:{example:'Example list',age:'Age group',ages:{'u6-u8':'U6 to U8','u9-u12':'U9 to U12','u13-up':'U13 and up'} as Record<AgeBand,string>,style:'Style',
  styles:{mix:'Mix',animal:'Animals',classic:'Club names',nature:'Weather and sky'} as Record<Style,string>,colour:'Shirt colour',animal:'Animal',any:'Any',place:'Town, school or park (optional)',placeHint:'Only letters are kept.',
  shuffle:'Shuffle names',fav:'Save to favourites',unfav:'Remove from favourites',favs:'Favourites',noFavs:'Tap the star on a name to keep it here.',copy:'Copy favourites',share:'Share list',clear:'Clear favourites',
  copied:'Copied. Paste it into your team chat.',noCopy:'Could not copy; select the names and copy them.',cleared:'Favourites cleared.',saved:'Favourites are saved on this device only.',
  shareTitle:'Team name ideas',list:'Name ideas'},
 es:{example:'Lista de ejemplo',age:'Categoría',ages:{'u6-u8':'U6 a U8','u9-u12':'U9 a U12','u13-up':'U13 en adelante'} as Record<AgeBand,string>,style:'Estilo',
  styles:{mix:'Mezcla',animal:'Animales',classic:'Nombres de club',nature:'Clima y cielo'} as Record<Style,string>,colour:'Color de la camiseta',animal:'Animal',any:'Cualquiera',place:'Ciudad, escuela o parque (opcional)',placeHint:'Solo se guardan las letras.',
  shuffle:'Otra tanda',fav:'Guardar en favoritos',unfav:'Quitar de favoritos',favs:'Favoritos',noFavs:'Toca la estrella de un nombre para guardarlo aquí.',copy:'Copiar favoritos',share:'Compartir lista',clear:'Borrar favoritos',
  copied:'Copiado. Pégalo en el chat del equipo.',noCopy:'No se pudo copiar; selecciona los nombres y cópialos.',cleared:'Favoritos borrados.',saved:'Los favoritos se guardan solo en este dispositivo.',
  shareTitle:'Ideas de nombres de equipo',list:'Ideas de nombres'},
};
const COLOUR_ES:Record<string,string>={red:'Rojo',blue:'Azul',green:'Verde',yellow:'Amarillo',orange:'Naranja',purple:'Morado',black:'Negro',white:'Blanco',gold:'Dorado',silver:'Plateado',sky:'Celeste',pink:'Rosa'};
type Saved={age:AgeBand;style:Style;colour:string;animal:string;place:string;favs:string[]};
export default function TeamNameGenerator({lang}:{lang?:'es'}){
 const L=lang==='es'?'es':'en',w=W[L];
 const [age,setAge]=useState<AgeBand>('u6-u8'),[style,setStyle]=useState<Style>('mix'),[colour,setColour]=useState(''),[animal,setAnimal]=useState(''),[place,setPlace]=useState('');
 const [seed,setSeed]=useState(1),[favs,setFavs]=useState<string[]>([]),[status,setStatus]=useState('');
 const [ready,setReady]=useState(false);
 useEffect(()=>{const v=store.get<Saved>(KEY);
  if(v){if(AGE_BANDS.includes(v.age))setAge(v.age);if(STYLES.includes(v.style))setStyle(v.style);if(COLOURS.some(c=>c.id===v.colour))setColour(v.colour);if(ANIMALS.some(a=>a.id===v.animal))setAnimal(v.animal);
   if(typeof v.place==='string')setPlace(cleanPlace(v.place));if(Array.isArray(v.favs))setFavs(v.favs.filter(x=>typeof x==='string').map(x=>x.slice(0,60)).slice(0,30));}
  setReady(true);},[]);
 useEffect(()=>{if(ready)store.set(KEY,{age,style,colour,animal,place,favs} satisfies Saved);},[ready,age,style,colour,animal,place,favs]);
 const ideas=useMemo(()=>generateNames({age,style,colour:colour||undefined,animal:animal||undefined,place,lang:L},seed),[age,style,colour,animal,place,L,seed]);
 const isExample=seed===1&&!place&&!colour&&!animal;
 const toggle=(n:string)=>setFavs(f=>f.includes(n)?f.filter(x=>x!==n):[...f,n].slice(-30));
 const text=()=>(favs.length?favs:ideas.map(i=>i.name)).join('\n');
 const copy=async()=>{try{await navigator.clipboard.writeText(text());setStatus(w.copied);}catch{setStatus(w.noCopy);}};
 const share=async()=>{const t=text();try{if(navigator.share){await navigator.share({title:w.shareTitle,text:t});return;}await navigator.clipboard.writeText(t);setStatus(w.copied);}catch{/* the person closed the share sheet */}};
 return <div className={s.tool} data-tool="">
  <div className={s.panel}>
   <div className={m.field}><span className={s.label} id="tn-age">{w.age}</span>
    <div className={s.seg} role="group" aria-labelledby="tn-age">{AGE_BANDS.map(a=><button key={a} type="button" aria-pressed={age===a} onClick={()=>{setAge(a);setStatus('');}}>{w.ages[a]}</button>)}</div></div>
   <div className={m.field}><span className={s.label} id="tn-style">{w.style}</span>
    <div className={`${s.seg} ${m.seg4}`} role="group" aria-labelledby="tn-style">{STYLES.map(x=><button key={x} type="button" aria-pressed={style===x} onClick={()=>setStyle(x)}>{w.styles[x]}</button>)}</div></div>
   <div className={s.grid}>
    <label className={s.label}>{w.colour}<select className={s.input} value={colour} onChange={e=>setColour(e.target.value)}><option value="">{w.any}</option>{COLOURS.map(c=><option key={c.id} value={c.id}>{L==='es'?COLOUR_ES[c.id]:c.en}</option>)}</select></label>
    <label className={s.label}>{w.animal}<select className={s.input} value={animal} onChange={e=>setAnimal(e.target.value)}><option value="">{w.any}</option>{ANIMALS.map(a=><option key={a.id} value={a.id}>{L==='es'?a.es:a.en}</option>)}</select></label>
    <label className={`${s.label} ${s.wide}`}>{w.place}<input className={s.input} value={place} maxLength={24} autoComplete="off" placeholder="Riverside" onChange={e=>setPlace(e.target.value.replace(/[^\p{L}\s'’-]/gu,''))} onBlur={()=>setPlace(cleanPlace(place))} aria-describedby="tn-place"/></label>
    <p className={`${s.hint} ${s.wide}`} id="tn-place">{w.placeHint}</p>
   </div>
  </div>
  <section className={m.results} aria-labelledby="tn-list">
   <div className={m.resultsHead}><h3 id="tn-list">{w.list}</h3>{isExample&&<span className={s.example}>{w.example}</span>}</div>
   <ul className={m.names} aria-live="polite">{ideas.map(i=>{const on=favs.includes(i.name);return <li key={i.name}>
    <div><b>{i.name}</b><p>{i.note}</p></div>
    <button type="button" className={m.star} aria-pressed={on} aria-label={`${on?w.unfav:w.fav}: ${i.name}`} onClick={()=>toggle(i.name)}>
     <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill={on?'currentColor':'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
    </button></li>;})}</ul>
   <button type="button" className={`${s.bigBtn} ${m.full}`} onClick={()=>{setSeed(x=>x+1);setStatus('');}}>{w.shuffle}</button>
  </section>
  <div className={s.panel}>
   <h3>{w.favs}</h3>
   {favs.length?<ul className={m.chips}>{favs.map(f=><li key={f}><span>{f}</span><button type="button" className={s.x} aria-label={`${w.unfav}: ${f}`} onClick={()=>toggle(f)}>×</button></li>)}</ul>:<p className={s.hint}>{w.noFavs}</p>}
   <div className={s.actions}><button type="button" className={s.btn} onClick={copy}>{w.copy}</button><button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={share}>{w.share}</button>
    {favs.length>0&&<button type="button" className={`${s.btn} ${s.btnQuiet}`} onClick={()=>{setFavs([]);setStatus(w.cleared);}}>{w.clear}</button>}</div>
   <p className={s.status} role="status">{status}</p><p className={s.hint}>{w.saved}</p>
  </div>
 </div>;
}
