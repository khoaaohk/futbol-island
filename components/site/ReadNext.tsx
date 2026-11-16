import {readNext} from '@/lib/site/readNext';
import styles from '@/app/(site)/site.module.css';
/** "Read next" (lib/site/readNext.ts, Nov 15 2026): the next guide in this topic's reading order, and the one before it. Plain,
 *  semantic markup (a nav with rel=next / rel=prev links). Nov 15 2026 design pass: two tap blocks, a small word over the title. */
export default function ReadNext({path}:{path:string}){
 const r=readNext(path);if(!r)return null;
 return <nav className={styles.pager} aria-label="Read next" data-read-next="">
  <a rel="prev" href={r.prev.path}><span className={styles.pagerWord}>{r.prevIsHub?'Back to':'Previous'}</span><span className={styles.pagerName}>{r.prev.name}</span></a>
  <a rel="next" href={r.next.path}><span className={styles.pagerWord}>{r.nextIsHub?'Back to':'Read next'}</span><span className={styles.pagerName}>{r.next.name}</span></a>
 </nav>;
}
