'use client';
import {useState} from 'react';
import site from '@/app/(site)/site.module.css';
import fx from '../siteForms.module.css';
import {EMBED_ES as W} from './toolWordsEs';
/**
 * "Use this on your club's website" (seo-extras, Nov 15 2026): the iframe snippet for this tool's /embed twin, selectable and
 * copyable. Server-rendered text first, so it works without JavaScript; the Copy button only adds the clipboard.
 */
/** `lang="es"`: Spanish words (./toolWordsEs.ts); English output is unchanged without it. */
export default function EmbedSnippet({snippet,name,lang}:{snippet:string;name:string;lang?:'es'}){
 const es=lang==='es';
 const [done,setDone]=useState('');
 const copy=()=>{navigator.clipboard?.writeText(snippet).then(()=>setDone(es?W.copied:'Copied. Paste it into your club’s web page.'),()=>setDone(es?W.select:'Select the code and copy it.'));};
 /* visual pass Nov 17 2026: folded like the pages' other "more detail" sections (lib/site/GuideParts.tsx Section fold) */
 return <section className={`${site.section} ${site.fold}`} aria-labelledby="embed" data-embed-snippet="" data-fold=""><details className={site.foldBox}>
  <summary className={site.foldSum}><h2 className={site.h2} id="embed">{es?W.title:'Use this on your club’s website'}</h2><span className={site.plus} aria-hidden="true"/></summary>
  <div className={site.foldBody}>
  {es?<p>{W.line(name)}</p>:<p>Paste this code into your club or league web page to show the {name} there, for your coaches and parents.</p>}
  <p className={site.caption}>{es?W.caption:'No ads, no tracking, no sign-up; names typed into it stay on each visitor’s device.'}</p>
  {/* Nov 20 2026: the code ends with one plain credit line (lib/site/tools/embed.ts) */}
  <p className={site.caption} data-embed-credit="">{es?'El código termina con una línea de crédito pequeña, “Hecho con Futbol Island”. Puedes borrarla.':'The code ends with one small credit line, “Made with Futbol Island”. You can delete it.'}</p>
  <label className={site.caption} htmlFor="embed-code">{es?W.code:'Embed code'}</label>
  <textarea id="embed-code" readOnly rows={6} value={snippet} onFocus={e=>e.currentTarget.select()} className={fx.embedCode}/>
  <p><button type="button" onClick={copy} className={fx.copyBtn}>{es?W.copy:'Copy embed code'}</button> <span role="status" className={site.caption}>{done}</span></p>
  </div></details>
 </section>;
}
