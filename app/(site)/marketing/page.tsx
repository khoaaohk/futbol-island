import fs from 'node:fs';
import path from 'node:path';
import s from '@/components/marketing/marketing.module.css';
import learn from '@/components/learn/learn.module.css';
import LogoWord from '@/components/learn/LogoWord';
import title from '@/components/landing/Title.module.css';
import JsonLd from '@/components/seo/JsonLd';
import {abs,breadcrumbLd,pageMeta,PUBLISHER,SITE_NAME} from '@/lib/site/seo';
import {GAME_SHEET,LOGO_COLOURS,MARKETING_PATH,MARKETING_PDF,SITE_SHEET,type DesignSheet,type TypeSpec} from '@/lib/site/marketing';

/**
 * /marketing (Nov 4 2026, owner): an unlisted page for potential investors. At the top, the investor overview PDF to download
 * (public/marketing/futbol-island-overview.pdf, built by scripts/build-marketing-pdf.cjs from /marketing/overview); under it a
 * short design-system sheet for the marketing site and for the game. Since Nov 6 2026 (owner) this page is open to search and in the sitemap; only /marketing/* (print page, PDF) stays noindex (lib/site/marketing.ts, next.config.mjs, tests/marketing-page.cjs).
 * Static: no scripts and no video. The buttons are the real ones: the tour's gold `.cta` and the title screen's `.start` / `.haveCode`.
 */
export const dynamic='force-static';
/** Nov 6 2026 (owner): the page itself is open to search engines (canonical, Open Graph, in the sitemap); its print page and the PDF under /marketing/ stay noindex. Content unchanged. */
export const metadata=pageMeta('Marketing','Futbol Island marketing material: the overview PDF and the design system of the site and the game.',MARKETING_PATH,{type:'website'});

/** The PDF's size on disk at build time ("3.4 MB"); null while the file has not been built. */
function pdfSize():string|null{
 try{const b=fs.statSync(path.join(process.cwd(),'public',MARKETING_PDF)).size;return b>=1e6?`${(b/1e6).toFixed(1)} MB`:`${Math.max(1,Math.round(b/1e3))} KB`;}catch{return null;}
}

const Word=({text}:{text:string})=><>{[...text].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</>;

const TYPE_CLASS:Record<TypeSpec['kind'],string>={display:s.tDisplay,line:s.tLine,body:s.tBody,brush:s.tBrush,button:s.tButton};

function Swatches({sheet}:{sheet:DesignSheet}){
 return <div>
  <h3 className={s.label}>Colour</h3>
  <ul className={s.swatches}>{sheet.swatches.map(w=><li key={w.name+w.hex}>
   <span className={s.chip} style={{background:w.hex}} aria-hidden="true"/>
   <span className={s.swName}>{w.name}</span><span className={s.swHex}>{w.hex}</span><span className={s.swUse}>{w.use}</span>
  </li>)}</ul>
 </div>;
}
function Types({sheet,game}:{sheet:DesignSheet;game?:boolean}){
 return <div>
  <h3 className={s.label}>Type</h3>
  <ul className={s.types}>{sheet.type.map(t=><li key={t.spec} className={s.type}>
   <span className={game&&t.kind==='body'?s.tGameBody:TYPE_CLASS[t.kind]}>{t.kind==='brush'&&!game?<Word text={t.sample}/>:t.sample}</span>
   <span className={s.typeSpec}>{t.face} · {t.spec}</span>
  </li>)}</ul>
 </div>;
}
const Notes=({sheet}:{sheet:DesignSheet})=><div><h3 className={s.label}>Spacing and shape</h3><ul className={s.notes}>{sheet.notes.map(n=><li key={n}>{n}</li>)}</ul></div>;

export default function Marketing(){
 const size=pdfSize();
 // The tour's own root and bar (learn.module.css .root/.subnav/.subnavIn/.logo + LogoWord): the same logo, size and place as on
 // `/` (far left on desktop, centred on phones), and the same hidden site header and footer "What's inside" link.
 return <div className={`${learn.root} ${s.root}`}>
  {/* Nov 7 2026 SEO: structured data only (no visible content change). */}
  <JsonLd data={{'@context':'https://schema.org','@type':'WebPage',name:`Marketing · ${SITE_NAME}`,url:abs(MARKETING_PATH),inLanguage:'en',isPartOf:{'@type':'WebSite',name:SITE_NAME,url:abs('/')},publisher:PUBLISHER}}/>
  <JsonLd data={breadcrumbLd([{name:'Home',path:'/'},{name:'Marketing',path:MARKETING_PATH}])}/>
  <div className={learn.subnav}><div className={learn.subnavIn}><a className={learn.logo} href="/" aria-label="Futbol Island home"><LogoWord text="Futbol Island"/></a></div></div>

  {/* ---- 1. the download ---- */}
  <section className={s.sec} aria-labelledby="mk-title">
   <div className={s.head}>
    <h1 className={s.h1} id="mk-title">Marketing material</h1>
    <p className={s.sub}>A short overview of Futbol Island for investors and partners: what the game is, every feature, and who builds it.</p>
    <div className={s.dl}>
     <a className={learn.cta} href={MARKETING_PDF} download="futbol-island-overview.pdf" type="application/pdf">Download marketing</a>
     <span className={s.meta}>PDF{size?` · ${size}`:''} · A4</span>
    </div>
   </div>
  </section>

  {/* ---- 2. the marketing site ---- */}
  <section className={`${s.sec} ${s.tint}`} aria-labelledby="mk-site">
   <div className={s.head}>
    <h2 className={s.h2} id="mk-site">Marketing site</h2>
    <p className={s.sub}>Soft paper, near-black ink and one gold accent. Big, tight headlines in the system sans.</p>
   </div>
   <div className={s.sheet}>
    <Swatches sheet={SITE_SHEET}/>
    <div className={s.cols}>
     <Types sheet={SITE_SHEET}/>
     <div className={s.types}>
      <div><h3 className={s.label}>Primary button</h3><div className={s.demo}><a className={learn.cta} href="/play">Start Playing</a></div></div>
      <Notes sheet={SITE_SHEET}/>
      <div className={s.logoRow}>{LOGO_COLOURS.map(c=><span key={c} className={s.dot} style={{background:c}} title={c}/>)}<span>Logo letters: {LOGO_COLOURS.join(' ')}</span></div>
     </div>
    </div>
   </div>
  </section>

  {/* ---- 3. the game ---- */}
  <section className={s.sec} aria-labelledby="mk-game">
   <div className={s.head}>
    <h2 className={s.h2} id="mk-game">The game</h2>
    <p className={s.sub}>Sea blue, cream panels and tactile buttons with a rim and a lip. IslandBrush for titles.</p>
   </div>
   <div className={s.sheet}>
    <Swatches sheet={GAME_SHEET}/>
    <div className={s.cols}>
     <div className={s.types}>
      <Types sheet={GAME_SHEET} game/>
      <Notes sheet={GAME_SHEET}/>
     </div>
     <div>
      <h3 className={s.label}>Buttons</h3>
      <div className={s.sea}>
       <span className={s.seaTitle}>Futbol Island</span>
       <div className={s.seaBtns}>
        <button type="button" className={title.start} tabIndex={-1}><span>Start</span><small>Get my save code</small></button>
        <button type="button" className={title.haveCode} tabIndex={-1}>I have a save code</button>
       </div>
      </div>
      <div className={s.demo} style={{marginTop:20,justifyContent:'center'}}>
       <span className={s.navBtn}>Done</span><span className={s.green}>Next question</span>
      </div>
      <p className={s.demoNote} style={{marginTop:12}}>The title screen’s own buttons, then Navigation and Primary green.</p>
     </div>
    </div>
   </div>
  </section>
 </div>;
}
