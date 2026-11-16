import LessonHub from '@/components/site/LessonHub';
import {hubBySlug} from '@/lib/site/hubs';
import {pageMeta} from '@/lib/site/seo';
import {TEAM_SIZES} from '@/lib/site/comparisons';
import {DataTable,LinkList,Section} from '@/lib/site/GuideParts';
import styles from '../../site.module.css';
/** Topic hub /learn/7v7-9v9-11v11 (SEO, Nov 8 2026): built from the lesson catalog only (lib/site/hubs.ts). */
export const dynamic='force-static';
const hub=hubBySlug('7v7-9v9-11v11')!;
export const metadata=pageMeta(hub.title,hub.description,hub.path);
/* Nov 15 2026 (seo-links): the "7v7 vs 9v9 vs 11v11" comparison table lives here (lib/site/comparisons.ts TEAM_SIZES), the one
   canonical page for the topic. */
export default function Page(){return <LessonHub hub={hub}>
 <Section id={TEAM_SIZES.id} title={TEAM_SIZES.title}>
  <DataTable label={TEAM_SIZES.title} head={TEAM_SIZES.head} rows={TEAM_SIZES.rows}/>
  <p className={styles.caption}>{TEAM_SIZES.note}</p>
  <LinkList links={TEAM_SIZES.links}/>
 </Section>
</LessonHub>;}
