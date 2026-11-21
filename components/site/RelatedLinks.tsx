import type {ReactNode} from 'react';
import type {LinkGroup,Related,SiteLink} from '@/lib/site/related';
import KeepReading from './KeepReading';
import styles from '@/app/(site)/site.module.css';
import rt from './railTarget.module.css';
/**
 * "More like this" on a card, exhibit or fish page (SEO, Nov 10 2026): the groups and the reading links computed by
 * lib/site/related.ts, then a quiet previous / next line. Plain links, server-rendered.
 * Batch 3 (Nov 17 2026): the links are one "Keep reading" grid (./KeepReading.tsx) instead of stacked lists. With `renderGroup`
 * (batch 2: card and exhibit picture tiles) the groups keep their tiles under `heading` and the reading links get the grid under
 * `readHeading`; without it (fish) the groups and the reading links share one grid under `heading`. Every link is kept.
 */
const read=(l:readonly SiteLink[])=>l.map(x=>({path:x.path,name:x.name,line:x.meta}));
export default function RelatedLinks({related,heading,readHeading,renderGroup}:{related:Related;heading:string;readHeading:string;renderGroup?:(g:LinkGroup)=>ReactNode}){
 return <>
  {renderGroup
   ?<><section className={styles.section} aria-labelledby="more">
     <h2 className={`${styles.h2} ${rt.target}`} id="more">{heading}</h2>
     {related.groups.map(g=><div key={g.title} className={styles.section}>{renderGroup(g)}</div>)}
    </section>
    <KeepReading id="read" title={readHeading} groups={[{id:'read-links',links:read(related.read)}]}/></>
   :<KeepReading id="more" title={heading} groups={[...related.groups.map((g,i)=>({id:g.id??`group-${i}`,label:g.title,icon:g.links[0]?.path.startsWith('/fish')?'fish' as const:'book' as const,links:read(g.links)})),{id:'read-links',links:read(related.read)}]}/>}
  <nav className={styles.pager} aria-label="Previous and next">
   <a rel="prev" href={related.prev.path}><span className={styles.pagerWord}>Previous</span><span className={styles.pagerName}>{related.prev.name}</span></a>
   <a rel="next" href={related.next.path}><span className={styles.pagerWord}>Next</span><span className={styles.pagerName}>{related.next.name}</span></a>
  </nav>
 </>;
}
