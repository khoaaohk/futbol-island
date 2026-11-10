'use client';
/**
 * First-party error beacon (Nov 10 2026, security audit). On window.onerror / unhandledrejection, sends at most 3 reports per
 * tab session to /api/error-report with navigator.sendBeacon: the message's first line, the top frame's file and line, and
 * the route PATH (no query, no fragment). No stack, no ids, no user agent (the server never reads it). Off in development,
 * under Do Not Track / Global Privacy Control, and on /admin. No timers, no polling: it only listens.
 */
import {useEffect} from 'react';

const KEY='fi2-err-beacon-n',MAX=3;
export default function ErrorBeacon(){
 useEffect(()=>{
  const n=navigator as Navigator&{globalPrivacyControl?:boolean};
  if(n.doNotTrack==='1'||n.globalPrivacyControl===true||typeof n.sendBeacon!=='function')return;
  if(/^\/admin(\/|$)/.test(location.pathname))return;
  let sent=0;try{sent=Number(sessionStorage.getItem(KEY))||0;}catch{}
  const send=(m:unknown,f:unknown,l:unknown)=>{
   if(sent>=MAX)return;sent++;try{sessionStorage.setItem(KEY,String(sent));}catch{}
   const body=JSON.stringify({m:String(m??'').split('\n')[0].slice(0,300),f:typeof f==='string'?f.split(/[?#]/)[0].slice(0,300):'',l:Number(l)||0,r:location.pathname.slice(0,200)});
   try{n.sendBeacon('/api/error-report',new Blob([body],{type:'application/json'}));}catch{}
  };
  // The top frame of an Error's stack: "at fn (https://site/_next/static/chunks/x.js:12:34)" or "fn@https://...:12:34".
  const top=(e:unknown):[string,number]=>{const s=e instanceof Error&&typeof e.stack==='string'?e.stack:'';const m=s.match(/(https?:\/\/[^\s)]+?):(\d+)(?::\d+)?\)?(?:\n|$)/);return m?[m[1],Number(m[2])]:['',0];};
  const onError=(ev:ErrorEvent)=>{if(!ev.message&&!ev.error)return;const [f,l]=ev.filename?[ev.filename,ev.lineno]:top(ev.error);send(ev.message||(ev.error as Error)?.message,f,l);};
  const onRejection=(ev:PromiseRejectionEvent)=>{const r=ev.reason,[f,l]=top(r);send(r instanceof Error?r.message:typeof r==='string'?r:'unhandled rejection',f,l);};
  window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onRejection);
  return()=>{window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onRejection);};
 },[]);
 return null;
}
