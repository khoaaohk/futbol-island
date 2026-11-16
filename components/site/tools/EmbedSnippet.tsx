'use client';
import {useState} from 'react';
import site from '@/app/(site)/site.module.css';
/**
 * "Use this on your club's website" (seo-extras, Nov 15 2026): the iframe snippet for this tool's /embed twin, selectable and
 * copyable. Server-rendered text first, so it works without JavaScript; the Copy button only adds the clipboard.
 */
export default function EmbedSnippet({snippet,name}:{snippet:string;name:string}){
 const [done,setDone]=useState('');
 const copy=()=>{navigator.clipboard?.writeText(snippet).then(()=>setDone('Copied. Paste it into your club’s web page.'),()=>setDone('Select the code and copy it.'));};
 return <section className={site.section} aria-labelledby="embed" data-embed-snippet="">
  <h2 className={site.h2} id="embed">Use this on your club’s website</h2>
  <p>Paste this code into your club or league web page to show the {name} there, for your coaches and parents.</p>
  <p className={site.caption}>No ads, no tracking, no sign-up; names typed into it stay on each visitor’s device.</p>
  <label className={site.caption} htmlFor="embed-code">Embed code</label>
  <textarea id="embed-code" readOnly rows={4} value={snippet} onFocus={e=>e.currentTarget.select()} style={{width:'100%',maxWidth:'var(--measure)',boxSizing:'border-box',font:'14px/1.4 ui-monospace,Menlo,monospace',padding:12,borderRadius:12,border:'1px solid var(--rule)',background:'var(--surface)',color:'var(--ink)'}}/>
  <p><button type="button" onClick={copy} style={{minHeight:44,padding:'0 18px',borderRadius:22,border:'1px solid var(--rule)',background:'var(--paper)',color:'var(--ink)',font:'600 15px var(--sans)',cursor:'pointer'}}>Copy embed code</button> <span role="status" className={site.caption}>{done}</span></p>
 </section>;
}
