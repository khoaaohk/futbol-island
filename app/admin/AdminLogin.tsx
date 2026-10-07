'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import gate from '@/components/ParentGate.module.css';
import styles from './admin.module.css';

/** Sign-in card: the grown-up gate's card and green primary, with a password field. */
export default function AdminLogin({configured}:{configured:boolean}){
 const router=useRouter();
 const [password,setPassword]=useState(''),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();if(busy||!password)return;setBusy(true);setStatus('');
  try{
   const res=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
   if(res.ok){setPassword('');router.refresh();return;}
   setStatus(res.status===429?'Too many tries. Wait 15 minutes and try again.':res.status===503?'Sign-in is not set up yet.':'That password did not work.');
  }catch{setStatus('Could not reach the server.');}
  setBusy(false);
 }
 return <main className={styles.signin}>
  <section className={gate.gate} aria-labelledby="admin-title">
   <span className={gate.lock} aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></span>
   <h3 id="admin-title">Admin</h3>
   {configured?<>
    <p className={gate.reason}>Island visitor numbers. For the people who run Futbol Island.</p>
    <form className={gate.form} onSubmit={submit}>
     <label className={gate.question} htmlFor="admin-password">Password</label>
     <input id="admin-password" className={styles.password} type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required maxLength={200} autoFocus/>
     <p className={gate.status} role="status" aria-live="polite">{status}</p>
     <button type="submit" className={gate.primary} disabled={busy||!password}>{busy?'Checking…':'Sign in'}</button>
    </form>
   </>:<p className={gate.reason}>Admin sign-in is off. Set <b>ADMIN_PASSWORD</b> (12 characters or more) in the server environment to turn it on.</p>}
  </section>
 </main>;
}
