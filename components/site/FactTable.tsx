import type {ReactNode} from 'react';
import tgt from '@/components/site/railTarget.module.css';
import styles from '@/app/(site)/site.module.css';
/** A two-column "key facts" / "what's here" table (SEO batch F, Nov 25 2026): a row header and its detail, in the site's shared
 *  .table look (phones scroll it inside .tableWrap). Used by the book pages (key facts) and the collection hubs (what's here). */
export type FactRow={label:string;value:ReactNode};
export function FactTable({id,title,label,intro,head,rows,note}:{id:string;title:string;label:string;intro?:ReactNode;head?:readonly [string,string];rows:readonly FactRow[];note?:ReactNode}){
 if(!rows.length)return null;
 return <section className={styles.section} aria-labelledby={id}>
  <h2 className={`${styles.h2} ${tgt.target}`} id={id}>{title}</h2>
  {intro&&<p>{intro}</p>}
  <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={label}><table className={styles.table}>
   {head&&<thead><tr><th scope="col">{head[0]}</th><th scope="col">{head[1]}</th></tr></thead>}
   <tbody>{rows.map(r=><tr key={r.label}><th scope="row">{r.label}</th><td>{r.value}</td></tr>)}</tbody>
  </table></div>
  {note&&<p className={styles.caption}>{note}</p>}
 </section>;
}
