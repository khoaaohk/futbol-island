import {readNext} from '@/lib/site/readNext';
import styles from '@/app/(site)/site.module.css';
/** "Read next" (lib/site/readNext.ts, Nov 15 2026): the next guide in this topic's reading order, and the one before it. Plain,
 *  semantic markup (a nav with rel=next / rel=prev links); the design pass styles it. */
export default function ReadNext({path}:{path:string}){
 const r=readNext(path);if(!r)return null;
 return <nav className={styles.pager} aria-label="Read next" data-read-next="">
  <a rel="prev" href={r.prev.path}>{r.prevIsHub?'‹ Back to ':'‹ Previous: '}{r.prev.name}</a>
  <a rel="next" href={r.next.path}>{r.nextIsHub?'Back to ':'Read next: '}{r.next.name} ›</a>
 </nav>;
}
