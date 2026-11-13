'use client';
/**
 * Stadium sponsors on /admin's "Island and games" tab (Nov 12 2026; lib/stadium/sponsors, GET/POST/DELETE
 * /api/admin/stadium-sponsors). Upload a picture to a slot with its dates, see how it sits on that slot (with the "Sponsor" tag
 * the game adds), and remove it. Loads once when the tab opens and after each change: no polling. Pictures are fetched and shown
 * as blob: URLs (the page's CSP allows Supabase for fetch, not for <img>). The same checks run again on the server.
 */
import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {SLOT_SPECS,SPONSOR_SLOTS,aspectText,checkSponsorImage,type SponsorSlot} from '@/lib/stadium/sponsors/slots';
import styles from './admin.module.css';
import s from './StadiumSponsors.module.css';

type Row={id:string;slot:SponsorSlot;label:string;image_path:string;starts_on:string;ends_on:string|null;position:number;url:string;active:boolean};
type List={ok:boolean;status:'ok'|'missing'|'error'|'unconfigured';today:string;rows:Row[]};

const statusNote=(st:List['status'])=>st==='missing'?'Needs supabase/migrations/20261118_stadium_sponsors.sql. Until it runs, the stadium shows Futbol Island’s own panels.'
 :st==='unconfigured'?'No database on this server: uploads are off here.':st==='error'?'The database did not answer. Try again.':null;
const stateOf=(r:Row,today:string)=>r.active?'Showing':r.starts_on>today?'Starts '+r.starts_on:'Ended';

/** A stored picture as a blob: URL (revoked on unmount). */
function useBlobUrl(url:string|null){
 const [src,setSrc]=useState<string|null>(null);
 useEffect(()=>{if(!url){setSrc(null);return;}let live=true,made:string|null=null;
  fetch(url,{credentials:'omit'}).then(r=>r.ok?r.blob():null).then(b=>{if(b&&live){made=URL.createObjectURL(b);setSrc(made);}}).catch(()=>{});
  return ()=>{live=false;if(made)URL.revokeObjectURL(made);};},[url]);
 return src;
}

/** The picture on its slot: the slot's shape, boards repeated along a strip, the centre clipped round, the "Sponsor" tag on. */
function SlotPreview({slot,src}:{slot:SponsorSlot;src:string|null}){
 const spec=SLOT_SPECS[slot],board=slot==='board'||slot==='fascia';
 return <figure className={s.preview} data-slot={slot}>
  <div className={s.stage} style={{aspectRatio:String(board?spec.aspect*2:spec.aspect)}}>
   {src?<div className={s.art} style={{backgroundImage:`url("${src}")`,backgroundSize:board?'50% 100%':'100% 100%'}}/>:<span className={s.empty}>No picture yet</span>}
   {src&&<span className={s.tag}>Sponsor</span>}
  </div>
  <figcaption>{spec.name} · {aspectText(spec.aspect)}{board?' · shown twice along a board':''}</figcaption>
 </figure>;
}

function Thumb({row}:{row:Row}){
 const src=useBlobUrl(row.url);
 return <span className={s.thumb} role="img" aria-label={row.label} style={{aspectRatio:String(Math.min(4,SLOT_SPECS[row.slot].aspect)),backgroundImage:src?`url("${src}")`:undefined}}/>;
}

export default function StadiumSponsorsSection(){
 const [list,setList]=useState<List|null>(null),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false);
 const [slot,setSlot]=useState<SponsorSlot>('board'),[file,setFile]=useState<File|null>(null),[dims,setDims]=useState<[number,number]|null>(null);
 const load=useCallback(()=>{fetch('/api/admin/stadium-sponsors',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(setList).catch(()=>setList(null));},[]);
 useEffect(load,[load]);
 const local=useMemo(()=>file?URL.createObjectURL(file):null,[file]);
 useEffect(()=>()=>{if(local)URL.revokeObjectURL(local);},[local]);
 useEffect(()=>{setDims(null);if(!local)return;const img=new Image();img.onload=()=>setDims([img.naturalWidth,img.naturalHeight]);img.src=local;},[local]);
 const check=file&&dims?checkSponsorImage(slot,file.type,file.size,dims[0],dims[1]):null;
 const note=list?statusNote(list.status):null,canWrite=list?.status==='ok';

 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();if(!check?.ok||busy)return;
  const form=e.currentTarget,fd=new FormData(form);fd.set('slot',slot);if(file)fd.set('file',file);
  setBusy(true);setMsg('');
  const r=await fetch('/api/admin/stadium-sponsors',{method:'POST',body:fd}).catch(()=>null);
  const b=r?await r.json().catch(()=>null):null;setBusy(false);
  if(b?.ok){setMsg(`Saved to ${SLOT_SPECS[slot].name.toLowerCase()}. The game picks it up within the hour.`);setFile(null);form.reset();load();}
  else setMsg(b?.message||'That did not upload. Try again.');
 };
 const remove=async(r:Row)=>{
  if(!window.confirm(`Remove ${r.label} from ${SLOT_SPECS[r.slot].name.toLowerCase()}? The picture is deleted too.`))return;
  const res=await fetch('/api/admin/stadium-sponsors?id='+encodeURIComponent(r.id),{method:'DELETE'}).catch(()=>null);
  setMsg(res?.ok?'Removed. The game drops it within the hour.':'That did not work. Try again.');if(res?.ok)load();
 };

 return <section className={styles.island} aria-labelledby="sec-stadium-sponsors">
  <div className={styles.sectionHead}><h2 id="sec-stadium-sponsors">Stadium sponsors</h2>
   <p>Pictures on the stadium’s six sponsor spots. Pictures only: no links, no tracking, nothing to buy. The game adds a small “Sponsor” tag to each one, and shows its own panels on any spot without a sponsor.</p></div>
  {note&&<p className={styles.note} role="status">{note}</p>}
  <div className={s.layout}>
   <form className={styles.card} onSubmit={submit}>
    <div className={styles.cardHead}><div><h2>Add a picture</h2><p>{SLOT_SPECS[slot].note}</p></div></div>
    <label className={s.field}><span>Spot</span>
     <select value={slot} onChange={e=>setSlot(e.target.value as SponsorSlot)}>{SPONSOR_SLOTS.map(id=><option key={id} value={id}>{SLOT_SPECS[id].name} ({aspectText(SLOT_SPECS[id].aspect)})</option>)}</select></label>
    <label className={s.field}><span>Sponsor name <small>for this page only</small></span><input name="label" required maxLength={60} autoComplete="off"/></label>
    <div className={s.pair}>
     <label className={s.field}><span>First day</span><input type="date" name="starts_on" defaultValue={list?.today}/></label>
     <label className={s.field}><span>Last day <small>blank = no end</small></span><input type="date" name="ends_on"/></label>
    </div>
    <label className={s.field}><span>Order <small>lower shows first</small></span><input type="number" name="position" min={0} max={99} defaultValue={0} inputMode="numeric"/></label>
    <label className={s.field}><span>Picture <small>PNG, WebP or JPG, up to 1 MB, {aspectText(SLOT_SPECS[slot].aspect)}, at least {SLOT_SPECS[slot].minWidth} px wide</small></span>
     <input type="file" accept="image/png,image/webp,image/jpeg" onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
    <SlotPreview slot={slot} src={local}/>
    {check&&!check.ok&&<p className={s.bad} role="alert">{check.message}</p>}
    {check?.ok&&dims&&<p className={styles.note}>{dims[0]} × {dims[1]} px, fits this spot.</p>}
    <div><button type="submit" className={styles.primary} disabled={!canWrite||!check?.ok||busy}>{busy?'Uploading…':'Upload'}</button></div>
    {msg&&<p className={styles.note} role="status">{msg}</p>}
   </form>
   <div className={styles.card}>
    <div className={styles.cardHead}><div><h2>On the stadium</h2><p>Every picture, by spot. “Showing” means live today (Pacific time).</p></div></div>
    {!list?<p className={styles.note}>Loading…</p>:!list.rows.length?<p className={styles.note}>No sponsor pictures yet. The stadium shows Futbol Island’s own panels.</p>:
     <div className={styles.tableScroll}><table className={styles.table}>
      <thead><tr><th scope="col">Picture</th><th scope="col" style={{textAlign:'left'}}>Spot</th><th scope="col" style={{textAlign:'left'}}>Sponsor</th><th scope="col">Days</th><th scope="col">State</th><th scope="col"><span className={s.sr}>Remove</span></th></tr></thead>
      <tbody>{list.rows.map(r=><tr key={r.id}>
       <td><Thumb row={r}/></td><td style={{textAlign:'left'}}>{SLOT_SPECS[r.slot].name}</td><td style={{textAlign:'left',wordBreak:'break-word'}}>{r.label}</td>
       <td>{r.starts_on} – {r.ends_on??'no end'}</td><td>{stateOf(r,list.today)}</td>
       <td><button type="button" className={styles.tableToggle} onClick={()=>remove(r)}>Remove</button></td></tr>)}</tbody>
     </table></div>}
   </div>
  </div>
 </section>;
}
