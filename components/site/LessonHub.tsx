import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import {HUBS,SAFE_GUIDE,type Hub} from '@/lib/site/hubs';
import {GUIDE_HUBS} from '@/lib/site/guides';
import {TOOL_HUBS} from '@/lib/site/tools/registry';
import {LESSONS_INDEX,lessonPath} from '@/lib/site/lessons';
import {SAFE_TRUST_LINE} from '@/lib/site/safety';
import {breadcrumbLd,collectionLd,faqLd,PLAY_PATH} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '@/app/(site)/site.module.css';
/**
 * One topic hub (lib/site/hubs.ts): answer-first lead, the lesson groups as linked lists, short Q&A (mirrored exactly in the
 * FAQPage JSON-LD), related hubs and one gold Play link. Server-rendered, no client code, the reading pages' one stylesheet.
 */
export const hubCrumbs=(h:{crumb:string;path:string})=>[{name:'Home',path:'/'},{name:'Lessons',path:LESSONS_INDEX},{name:h.crumb,path:h.path}];

export function QA({id,title,faq}:{id:string;title:string;faq:readonly {q:string;a:string}[]}){
 return <section className={styles.section} aria-labelledby={id}><h2 className={styles.h2} id={id}>{title}</h2>
  <ul className={styles.stack}>{faq.map(f=><li key={f.q} className={styles.card}><h3 className={styles.h3}>{f.q}</h3><p>{f.a}</p></li>)}</ul>
 </section>;
}

export function MoreToLearn({except}:{except?:string}){
 const links=[...HUBS.filter(h=>h.path!==except).map(h=>({path:h.path,name:h.h1})),...GUIDE_HUBS.map(g=>({path:g.path,name:g.name[0].toUpperCase()+g.name.slice(1)})),/* guide clusters (lib/site/guides.ts) */...TOOL_HUBS.map(t=>({path:t.path,name:t.name[0].toUpperCase()+t.name.slice(1)})),/* coach tools (lib/site/tools/registry.ts) */{path:LESSONS_INDEX,name:'All football lessons'},{path:'/games',name:'Free soccer games for kids'},/* the arcade games' search pages (lib/site/games.ts) */{path:SAFE_GUIDE.path,name:'For parents: a safe football game'}].filter(l=>l.path!==except);
 return <section className={styles.section} aria-labelledby="more"><h2 className={styles.h2} id="more">More to learn</h2>
  <ul className={styles.list}>{links.map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span></a></li>)}</ul>
 </section>;
}

export default function LessonHub({hub}:{hub:Hub}){
 const crumbs=hubCrumbs(hub),items=hub.groups.flatMap(g=>g.lessons);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:hub.h1,path:hub.path,description:hub.description,published:SITE_UPDATED.hubs,modified:SITE_UPDATED.hubs,
   items:items.map(l=>({name:`${l.title} (${l.formatLabel})`,path:lessonPath(l.id)}))})}/>
  <JsonLd data={faqLd(hub.faq)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{hub.h1}</h1>
   <p className={styles.lead}>{hub.lead}</p>
   <p className={styles.caption}>{SAFE_TRUST_LINE} <a href={SAFE_GUIDE.path}>Read the parents’ guide</a>.</p>
   <a className={styles.cta} href={PLAY_PATH}>Play it on the island</a>
  </header>
  {hub.groups.map((g,i)=><section key={g.title} className={styles.section} aria-labelledby={`g-${i}`}>
   <h2 className={styles.h2} id={`g-${i}`}>{g.title} <span className={styles.count}>({g.lessons.length})</span></h2>
   {g.line&&<p>{g.line}</p>}
   <ul className={styles.list}>{g.lessons.map(l=><li key={l.id}><a href={hub.showQuestion?`${lessonPath(l.id)}#quiz`:lessonPath(l.id)}>
    <span className={styles.itemTitle}>{l.title}{hub.showQuestion?` (${l.formatLabel}, ${l.questions.length} questions)`:` (${l.formatLabel})`}</span>
    <span className={styles.itemMeta}>{hub.showQuestion?l.questions[0]?.q:l.concept}</span></a></li>)}</ul>
  </section>)}
  <QA id="faq" title="Questions and answers" faq={hub.faq}/>
  <MoreToLearn except={hub.path}/>
  <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play it on the island</a></p>
 </>;
}
