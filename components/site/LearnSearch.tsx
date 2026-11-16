'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {SEARCH_INDEX_PATH,SEARCH_LABEL,searchEntries,type SearchEntry} from '@/lib/site/searchCore';
import site from '@/app/(site)/site.module.css';
import fx from './siteForms.module.css';
/**
 * The /learn search box (seo-extras, Nov 15 2026). Reads ?q= on load (the WebSite SearchAction in lib/site/seo.ts points here),
 * loads the small prebuilt index once (lib/site/searchIndex.ts, ~20 KB gzipped) and matches as you type, on the device: nothing
 * typed is sent anywhere, the address bar just keeps ?q= so a search can be shared. Results are grouped by type with the
 * answer snippet. Keyboard: arrow down from the box into the results, arrows to move, Escape back to the box. The count is
 * announced politely to screen readers.
 */
export default function LearnSearch(){
 const [q,setQ]=useState(''),[index,setIndex]=useState<SearchEntry[]|null>(null),[failed,setFailed]=useState(false);
 const box=useRef<HTMLInputElement>(null),list=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  try{const v=new URLSearchParams(window.location.search).get('q');if(v)setQ(v.slice(0,100));}catch{/* no query */}
  let live=true;fetch(SEARCH_INDEX_PATH).then(r=>r.ok?r.json():Promise.reject(r.status)).then(j=>{if(live)setIndex(j);},()=>{if(live)setFailed(true);});
  return()=>{live=false;};
 },[]);
 const groups=useMemo(()=>index?searchEntries(index,q):[],[index,q]);
 const total=groups.reduce((a,g)=>a+g.total,0);
 const change=(v:string)=>{setQ(v);try{const u=new URL(window.location.href);if(v.trim())u.searchParams.set('q',v);else u.searchParams.delete('q');window.history.replaceState(null,'',u.pathname+u.search);}catch{/* fine */}};
 const links=()=>Array.from(list.current?.querySelectorAll<HTMLAnchorElement>('a[data-hit]')??[]);
 const onBoxKey=(e:React.KeyboardEvent)=>{if(e.key==='ArrowDown'){const l=links();if(l[0]){e.preventDefault();l[0].focus();}}};
 const onListKey=(e:React.KeyboardEvent)=>{
  const l=links(),i=l.indexOf(document.activeElement as HTMLAnchorElement);if(i<0)return;
  if(e.key==='ArrowDown'&&l[i+1]){e.preventDefault();l[i+1].focus();}
  else if(e.key==='ArrowUp'){e.preventDefault();(i>0?l[i-1]:box.current)?.focus();}
  else if(e.key==='Escape'){e.preventDefault();box.current?.focus();}
 };
 const status=failed?'The search could not load. Try the guides below.':!index?(q?'Loading the search…':''):!q.trim()?'':total?`${total} result${total===1?'':'s'} for “${q.trim()}”.`:`Nothing found for “${q.trim()}”. Try a shorter word, such as offside, rondo or 4-3-3.`;
 return <div className={site.section} data-learn-search="">
  <form role="search" action="/learn" method="get" onSubmit={e=>{e.preventDefault();links()[0]?.focus();}} className={fx.searchForm}>
   <label htmlFor="learn-q" className={`${site.caption} ${fx.fullWidth}`}>Search rules, terms, positions, formations, drills, plans and lessons</label>
   <input ref={box} id="learn-q" name="q" type="search" value={q} onChange={e=>change(e.target.value)} onKeyDown={onBoxKey} autoComplete="off" spellCheck={false} enterKeyHint="search"
    placeholder="Try offside, rondo or 4-3-3" aria-describedby="learn-q-status" aria-controls="learn-results"
    className={fx.searchInput}/>
  </form>
  <p id="learn-q-status" role="status" aria-live="polite" className={site.caption}>{status}</p>
  <div id="learn-results" ref={list} onKeyDown={onListKey}>
   {groups.map(g=><section key={g.type} className={site.section} aria-labelledby={`r-${g.type}`}>
    <h2 className={site.h2} id={`r-${g.type}`}>{SEARCH_LABEL[g.type]} <span className={site.count}>({g.total})</span></h2>
    <ul className={site.list}>{g.items.map(e=><li key={e.t+e.p}><a href={e.p} data-hit=""><span className={site.itemTitle}>{e.n}</span><span className={site.itemMeta}>{e.s}</span></a></li>)}</ul>
   </section>)}
  </div>
 </div>;
}
