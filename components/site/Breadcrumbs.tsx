import type {Crumb} from '@/lib/site/seo';
import styles from '@/app/(site)/site.module.css';
/** Visible breadcrumbs for the static reading pages (the last crumb is the current page). */
export default function Breadcrumbs({crumbs}:{crumbs:readonly Crumb[]}){
 return <nav aria-label="Breadcrumb" className={styles.crumbs}><ol>{crumbs.map((c,i)=><li key={c.path}>{i<crumbs.length-1?<a href={c.path}>{c.name}</a>:<span aria-current="page">{c.name}</span>}</li>)}</ol></nav>;
}
