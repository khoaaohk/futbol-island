import LessonHub from '@/components/site/LessonHub';
import {hubBySlug} from '@/lib/site/hubs';
import {pageMeta} from '@/lib/site/seo';
import {collectionBySlug} from '@/lib/site/collections';
import {LinkList,Section} from '@/lib/site/GuideParts';
/** Topic hub /learn/futsal-for-kids (SEO, Nov 8 2026): built from the lesson catalog only (lib/site/hubs.ts). */
export const dynamic='force-static';
const hub=hubBySlug('futsal-for-kids')!;
export const metadata=pageMeta(hub.title,hub.description,hub.path);
const stars=collectionBySlug('cards','futsal')!;
/* Nov 15 2026 (seo-links): the futsal rules comparison and the futsal stars' cards, one click from the futsal hub. */
export default function Page(){return <LessonHub hub={hub}>
 <Section id="futsal-more" title="Futsal rules and futsal stars">
  <LinkList links={[{path:'/learn/soccer-rules/futsal-rules#futsal-vs-soccer',name:'Futsal vs soccer: the rules side by side',line:'Kick-ins, four seconds, no offside and team fouls'},
   {path:stars.path,name:stars.h1.replace(/: player cards$/,''),line:stars.blurb},{path:'/learn/soccer-formations/futsal-2-2',name:'Futsal formations',line:'The 2-2, the diamond and the 3-1'}]}/>
 </Section>
</LessonHub>;}
