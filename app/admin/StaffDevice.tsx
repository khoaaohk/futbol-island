'use client';
/**
 * "This device is mine" (Nov 13 2026; owner: keep my own devices out of all analytics). Opening /admin flags this device as staff
 * (lib/analytics/staff.ts: the tracker then sends nothing) and, once, registers it on the server so its past rows leave the
 * numbers too (POST /api/admin/staff with this device's player key; only its short hashes are stored). The switch turns both off.
 * Below it: the excluded hashes (Remove counts them again) and, when known, the day before which numbers may still include
 * staff visits (frozen before the exclusion; their raw rows are gone). Admin-only, small: one line plus a details list.
 */
import {useCallback,useEffect,useState} from 'react';
import {isStaffDevice,markStaffOnAdminLoad,setStaffDevice} from '@/lib/analytics/staff';
import {readPlayerKey} from '@/lib/analytics/deviceMarks';
import type {StaffList} from '@/lib/analytics/staffAdmin';
import styles from './admin.module.css';
import d from './dash.module.css';

const ls=()=>{try{return window.localStorage;}catch{return null;}};
const REGISTERED='fi-staff-sent';
const fmt=(day:string)=>{const t=Date.parse(day+'T12:00:00Z');return Number.isFinite(t)?new Date(t).toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric'}):day;};
const deviceKey=()=>{try{return readPlayerKey(ls(),n=>crypto.getRandomValues(new Uint8Array(n)));}catch{return null;}};
const deviceLabel=()=>{const ua=typeof navigator==='undefined'?'':navigator.userAgent;return /iPad|Tablet/i.test(ua)?'Owner tablet':/Mobi|iPhone|Android/i.test(ua)?'Owner phone':'Owner computer';};

export default function StaffDevice(){
 const [mine,setMine]=useState<boolean|null>(null),[list,setList]=useState<StaffList|null>(null),[msg,setMsg]=useState('');
 const load=useCallback(()=>fetch('/api/admin/staff',{cache:'no-store'}).then(r=>r.ok?r.json() as Promise<StaffList>:null).then(setList).catch(()=>setList(null)),[]);
 const send=useCallback(async(method:'POST'|'DELETE',body:unknown)=>{
  const r=await fetch('/api/admin/staff',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>null);
  const j=r?await r.json().catch(()=>null) as {ok?:boolean;status?:string}|null:null;
  if(j?.status==='needs-migration')setMsg('Saved on this device. Past rows leave the numbers once the staff-exclusion SQL has run.');
  else if(!j?.ok)setMsg('Saved on this device; the server list could not be updated just now.');
  else setMsg('');
  void load();return !!j?.ok;
 },[load]);
 useEffect(()=>{
  const on=markStaffOnAdminLoad(ls());setMine(on);
  // First admin visit on this device: exclude its past rows too (once; the switch can undo it).
  let sent=false;try{sent=ls()?.getItem(REGISTERED)==='1';}catch{}
  const key=on&&!sent?deviceKey():null;
  if(key)void send('POST',{device:key,label:deviceLabel()}).then(ok=>{if(ok)try{ls()?.setItem(REGISTERED,'1');}catch{}});else void load();
 },[load,send]);
 const toggle=async(on:boolean)=>{
  setStaffDevice(ls(),on);setMine(isStaffDevice(ls()));
  const key=deviceKey();if(!key)return;
  const ok=await send(on?'POST':'DELETE',on?{device:key,label:deviceLabel()}:{device:key});
  try{if(ok)ls()?.setItem(REGISTERED,on?'1':'0');}catch{}
 };
 const remove=async(pid:string)=>{await send('DELETE',{pid});};
 if(mine===null)return null;
 return <section className={styles.note} aria-label="Staff devices" data-staff={mine?'on':'off'} style={{display:'grid',gap:6}}>
  <label style={{display:'flex',gap:8,alignItems:'center',cursor:'pointer'}}>
   <input type="checkbox" checked={mine} onChange={e=>void toggle(e.target.checked)}/>
   <span>This device is mine (excluded from analytics){mine?' ✓':''}</span>
  </label>
  {msg&&<span role="status">{msg}</span>}
  {list?.status==='needs-migration'&&<span>Past rows from your devices still count: run <code>supabase/migrations/20261121_analytics_staff_exclusion.sql</code> in Supabase.</span>}
  {list?.status==='ok'&&<details>
   <summary>Excluded players ({list.rows.length}){list.cleanFrom?` · Days before ${fmt(list.cleanFrom)} may include staff visits`:''}</summary>
   <ul style={{margin:'6px 0 0',paddingLeft:18}}>
    {list.rows.map(r=><li key={r.pid}>#{r.pid.slice(0,6)}{r.label?` · ${r.label}`:''} <button type="button" className={d.linkBtn} onClick={()=>void remove(r.pid)}>Count again</button></li>)}
   </ul>
   {list.cleanFrom&&<p style={{margin:'6px 0 0'}}>Days before {fmt(list.cleanFrom)} were totalled before the exclusion. Days from {fmt(list.oldestFixable)} on can be recomputed
    from raw rows (<code>select public.analytics_recompute_rollups(current_date - 14, current_date);</code>); older days may include staff visits for good (their raw rows are deleted after 14 days).</p>}
  </details>}
 </section>;
}
