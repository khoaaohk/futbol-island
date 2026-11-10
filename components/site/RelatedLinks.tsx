import type {Related,SiteLink} from '@/lib/site/related';
import styles from '@/app/(site)/site.module.css';
/**
 * "More like this" on a card, exhibit or fish page (SEO, Nov 10 2026): the groups and the reading links computed by
 * lib/site/related.ts, as the reading pages' own index lists, then a quiet previous / next line. Plain links, server-rendered.
 */
const Item=({l}:{l:SiteLink})=><li><a href={l.path}><span className={styles.itemTitle}>{l.name}</span>{l.meta&&<span className={styles.itemMeta}>{l.meta}</span>}</a></li>;
export default function RelatedLinks({related,heading,readHeading}:{related:Related;heading:string;readHeading:string}){
 return <>
  <section className={styles.section} aria-labelledby="more">
   <h2 className={styles.h2} id="more">{heading}</h2>
   {related.groups.map(g=><div key={g.title} className={styles.section}><h3 className={styles.h3}>{g.title}</h3><ul className={styles.list}>{g.links.map(l=><Item key={l.path} l={l}/>)}</ul></div>)}
   <div className={styles.section}><h3 className={styles.h3}>{readHeading}</h3><ul className={styles.list}>{related.read.map(l=><Item key={l.path} l={l}/>)}</ul></div>
  </section>
  <nav className={styles.pager} aria-label="Previous and next">
   <a rel="prev" href={related.prev.path}>‹ Previous: {related.prev.name}</a>
   <a rel="next" href={related.next.path}>Next: {related.next.name} ›</a>
  </nav>
 </>;
}
