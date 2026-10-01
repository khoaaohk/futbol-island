'use client';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {checkGateAnswer,gateLockedUntil,gateWrongTries,makeGateQuestion,parentGatePassed,passParentGate,recordGateWrong,type GateQuestion} from '@/lib/parentGate';
import styles from './ParentGate.module.css';

/**
 * Shared grown-up check (lib/parentGate.ts). Renders inline inside any modal body.
 *  - `<ParentGate onPass onCancel reason/>` shows the question and calls onPass when answered.
 *  - `<ParentGate.Guard reason>{children}</ParentGate.Guard>` renders children only after a pass (remembered ~10 min in memory).
 * Nothing typed here is stored or sent anywhere.
 */
export default function ParentGate({onPass,onCancel,title='For grown-ups',reason}:{onPass:()=>void;onCancel?:()=>void;title?:string;reason?:ReactNode}){
 const [q,setQ]=useState<GateQuestion|null>(null);
 const [answer,setAnswer]=useState(''),[wrong,setWrong]=useState(0),[waitUntil,setWaitUntil]=useState(0),[now,setNow]=useState(0);
 const input=useRef<HTMLInputElement>(null);
 // Unique per instance (QA11): two gates can be on screen at once (About's donation gate + a credit link's gate).
 const uid=useId(),titleId=`parent-gate-title-${uid}`,answerId=`parent-gate-answer-${uid}`,statusId=`parent-gate-status-${uid}`;
 // Question made after mount so server and client markup match. QA11 B-1: a cooldown started by any gate (this one before it
 // was closed, or another) carries on here: the tries and the lockout live in lib/parentGate.ts, not in this instance.
 useEffect(()=>{setQ(makeGateQuestion());setWrong(gateWrongTries());setWaitUntil(gateLockedUntil());},[]);
 // Cooldown: the countdown ticks once a second ONLY while waiting (QA11), and both timers are cleared when it ends or unmounts.
 useEffect(()=>{if(!waitUntil)return;const t=setTimeout(()=>{setWaitUntil(0);setWrong(0);setQ(makeGateQuestion());},Math.max(0,waitUntil-Date.now()));setNow(Date.now());const tick=setInterval(()=>setNow(Date.now()),1000);return()=>{clearTimeout(t);clearInterval(tick);};},[waitUntil]);
 const waiting=waitUntil>0;
 const submit=()=>{
  if(!q||waiting)return;
  if(checkGateAnswer(q,answer)){passParentGate();onPass();return;}
  const r=recordGateWrong();setWrong(r.tries);setAnswer('');
  if(r.lockedUntil)setWaitUntil(r.lockedUntil);else{setQ(makeGateQuestion());input.current?.focus();}
 };
 return <section className={styles.gate} data-parent-gate aria-labelledby={titleId}>
  <span className={styles.lock} aria-hidden="true"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/></svg></span>
  <h3 id={titleId}>{title}</h3>
  <p className={styles.reason}>{reason??'This part is for a parent, carer or coach.'} Kids, ask a grown-up to help.</p>
  <form className={styles.form} onSubmit={e=>{e.preventDefault();submit();}}>
   <label htmlFor={answerId} className={styles.question}>{waiting?'Too many tries. Please wait a moment.':q?.text??' '}</label>
   <div className={styles.row}>
    <input ref={input} id={answerId} data-parent-gate-answer inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={3} value={answer} disabled={waiting} onChange={e=>setAnswer(e.target.value.replace(/\D/g,''))} aria-describedby={statusId}/>
    <button type="submit" className={styles.primary} disabled={waiting||!answer}>Continue</button>
   </div>
   <p id={statusId} className={styles.status} role="status">{waiting?(s=>`Try again in ${s} second${s===1?'':'s'}.`)(Math.max(1,Math.ceil((waitUntil-now)/1000))):wrong?'Not quite. Here is a new one.':'Type the answer as a number.'}</p>
  </form>
  {onCancel&&<button type="button" className={styles.ghost} onClick={onCancel}>Go back</button>}
 </section>;
}

/** Shows children once a grown-up has passed the gate (this session, in memory). */
function Guard({children,reason,title,onCancel}:{children:ReactNode;reason?:ReactNode;title?:string;onCancel?:()=>void}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(parentGatePassed())setOpen(true);},[]);
 return open?<>{children}</>:<ParentGate title={title} reason={reason} onCancel={onCancel} onPass={()=>setOpen(true)}/>;
}
ParentGate.Guard=Guard;
