'use client';
/**
 * First-party error beacon (Nov 10 2026, security audit). On window.onerror / unhandledrejection, sends at most 3 reports per
 * tab session to /api/error-report with navigator.sendBeacon: the message's first line, the top frame's file and line, and
 * the route PATH (no query, no fragment). No stack, no ids, no user agent (the server never reads it). Off in development,
 * under Do Not Track / Global Privacy Control, and on /admin. No timers, no polling: it only listens.
 */
import {useEffect} from 'react';

const KEY='fi2-err-beacon-n',MAX=3;
/** Chrome/Firefox/Safari noise that is not a bug and costs nothing (lib/siteReports.ts drops it too). */
/** Benign browser noise, never sent. Nov 25 2026: a skipped view transition ("Transition was skipped" / "Skipping view transition
 *  because skipTransition() was called"): an animation the browser dropped, no user-facing effect (the sources now catch it too). */
export const BENIGN_ERROR=/^(Uncaught )?(ResizeObserver loop (completed with undelivered notifications|limit exceeded)|(AbortError: )?(Transition was skipped|Skipping view transition))/;
/** A short, data-free name for a rejection that is not an Error (Nov 20 2026: these all showed as "unhandled rejection @ unknown"). */
export function rejectionText(r:unknown):string{
 if(r instanceof Error)return r.message||r.name||'Error';
 if(typeof r==='string')return r;
 if(r===null||r===undefined||typeof r!=='object')return `unhandled rejection: ${r===null?'null':typeof r}`;
 const o=r as {message?:unknown;type?:unknown;target?:unknown;constructor?:{name?:unknown}};
 const kind=typeof o.constructor?.name==='string'&&o.constructor.name?o.constructor.name:'object';
 if(typeof o.message==='string'&&o.message)return `${kind}: ${o.message}`;
 const tag=o.target&&typeof (o.target as {tagName?:unknown}).tagName==='string'?` on ${(o.target as {tagName:string}).tagName}`:'';
 return `unhandled rejection: ${kind}${typeof o.type==='string'?` ${o.type}`:''}${tag}`;
}
export default function ErrorBeacon(){
 useEffect(()=>{
  const n=navigator as Navigator&{globalPrivacyControl?:boolean};
  if(n.doNotTrack==='1'||n.globalPrivacyControl===true||typeof n.sendBeacon!=='function')return;
  if(/^\/admin(\/|$)/.test(location.pathname)||/^\/embed(\/|$)/.test(location.pathname))return;/* + club embeds (lib/embed/isEmbed.ts) */
  let sent=0;try{sent=Number(sessionStorage.getItem(KEY))||0;}catch{}
  const send=(m:unknown,f:unknown,l:unknown)=>{
   if(sent>=MAX||BENIGN_ERROR.test(String(m??'')))return;sent++;try{sessionStorage.setItem(KEY,String(sent));}catch{}
   const body=JSON.stringify({m:String(m??'').split('\n')[0].slice(0,300),f:typeof f==='string'?f.split(/[?#]/)[0].slice(0,300):'',l:Number(l)||0,r:location.pathname.slice(0,200)});
   try{n.sendBeacon('/api/error-report',new Blob([body],{type:'application/json'}));}catch{}
  };
  // The top frame of an Error's stack: "at fn (https://site/_next/static/chunks/x.js:12:34)" or "fn@https://...:12:34".
  const top=(e:unknown):[string,number]=>{const s=e instanceof Error&&typeof e.stack==='string'?e.stack:'';const m=s.match(/(https?:\/\/[^\s)]+?):(\d+)(?::\d+)?\)?(?:\n|$)/);return m?[m[1],Number(m[2])]:['',0];};
  const onError=(ev:ErrorEvent)=>{if(!ev.message&&!ev.error)return;const [f,l]=ev.filename?[ev.filename,ev.lineno]:top(ev.error);send(ev.message||(ev.error as Error)?.message,f,l);};
  const onRejection=(ev:PromiseRejectionEvent)=>{if(ev.defaultPrevented)return;const r=ev.reason,[f,l]=top(r);send(rejectionText(r),f,l);};
  window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onRejection);
  return()=>{window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onRejection);};
 },[]);
 return null;
}
