import {FOOTER_ES,FOOTER_GROUPS} from '@/lib/site/footerHubs';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';
/**
 * The footer's map of the Library (Nov 20 2026, owner: "do we need these in the footer?"; kept for search, tidied): four short
 * labelled columns in the Library's groups and order, English or Spanish. Static markup, no client code. Layout rules:
 * site.module.css `.footHubs` (four columns, two from 600 px down, one stacked group per row on phones with its links in a row).
 */
export default function FooterHubs({es=false}:{es?:boolean}){
 return <nav className={styles.footHubs} aria-label={es?'Guías':'Guides'}>
  {FOOTER_GROUPS.map(g=><div key={g.id} className={styles.footGroup}>
   <p className={styles.footHead}>{es?g.titleEs:g.title}</p>
   <ul>{g.links.map(([href,label])=>{const h=es&&hasEs(href)?toEs(href):href,name=es?FOOTER_ES[href]+(hasEs(href)?'':' (en inglés)'):label;
    return <li key={href}><a href={h}>{name}</a></li>;})}</ul>
  </div>)}
  {/* Nov 26 2026 (Search Console: Spanish guides "Crawled / Discovered, not indexed"; seo-crawl: every Spanish child page sat 3
      clicks from /, every English one 2): the English footer names the Spanish sections once, so each Spanish hub is one click
      from any English page and its pages two. Only sections with a Spanish version (hasEs). */}
  {!es&&<div className={`${styles.footGroup} ${styles.footEs}`} lang="es">
   <p className={styles.footHead}>En español</p>
   <ul><li><a href="/es/library" hrefLang="es">Biblioteca</a></li>{FOOTER_GROUPS.flatMap(g=>g.links).filter(([href])=>hasEs(href)).map(([href])=>
    <li key={href}><a href={toEs(href)} hrefLang="es">{FOOTER_ES[href]}</a></li>)}</ul>
  </div>}
 </nav>;
}
