import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import GuideVideo from '@/components/site/GuideVideo';
import {HUBS,SAFE_GUIDE,type Hub} from '@/lib/site/hubs';
import {GUIDE_HUBS} from '@/lib/site/guides';
import {TOOL_HUBS} from '@/lib/site/tools/registry';
import {LESSONS_INDEX,lessonPath} from '@/lib/site/lessons';
import {SAFE_TRUST_LINE} from '@/lib/site/safety';
import {breadcrumbLd,collectionLd,faqLd,PLAY_PATH} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import FaqEnhance from '@/components/learn/FaqEnhance';
import styles from '@/app/(site)/site.module.css';
/**
 * One topic hub (lib/site/hubs.ts): answer-first lead, the lesson groups as linked lists, short Q&A (mirrored exactly in the
 * FAQPage JSON-LD), related hubs and one gold Play link. Server-rendered, no client code, the reading pages' one stylesheet.
 */
export const hubCrumbs=(h:{crumb:string;path:string})=>[{name:'Home',path:'/'},{name:'Lessons',path:LESSONS_INDEX},{name:h.crumb,path:h.path}];

/** The questions (visual pass, Nov 17 2026): one list of plain rows like the home page's FAQ, each a native <details> whose
 *  <summary> holds the question as an h3; the answer text is in the HTML whether open or closed, so the FAQPage JSON-LD (faq only)
 *  still matches what the page shows. The first one starts open. `more`: extra questions shown in the same list but not in the
 *  JSON-LD (the cards page's side questions, merged so a page has one FAQ). `children`: a caption under the list.
 *  components/learn/FaqEnhance.tsx animates open / close; without JS the plain <details> works. */
export function QA({id,title,faq,more=[],children}:{id:string;title:string;faq:readonly {q:string;a:string}[];more?:readonly {q:string;a:string}[];children?:React.ReactNode}){
 const seen=new Set<string>(),items=[...faq,...more].filter(f=>!seen.has(f.q)&&!!seen.add(f.q));
 return <section className={styles.section} aria-labelledby={id}><h2 className={styles.h2} id={id}>{title}</h2>
  <div className={styles.faqList} data-faq={id}>{items.map((f,i)=><details key={f.q} className={styles.faqItem} open={i===0||undefined} data-x={i===0?'':undefined}>
   <summary className={styles.faqSum}><h3 className={styles.faqQ}>{f.q}</h3><span className={styles.plus} aria-hidden="true"/></summary>
   <div className={styles.faqBody}><div className={styles.faqIn}><p>{f.a}</p></div></div></details>)}</div>
  {children}
  <FaqEnhance selector={`[data-faq="${id}"]`}/>
 </section>;
}

export function MoreToLearn({except}:{except?:string}){
 const links=[...HUBS.filter(h=>h.path!==except).map(h=>({path:h.path,name:h.h1})),...GUIDE_HUBS.map(g=>({path:g.path,name:g.name[0].toUpperCase()+g.name.slice(1)})),/* guide clusters (lib/site/guides.ts) */...TOOL_HUBS.map(t=>({path:t.path,name:t.name[0].toUpperCase()+t.name.slice(1)})),/* coach tools (lib/site/tools/registry.ts) */{path:LESSONS_INDEX,name:'All football lessons'},{path:'/games',name:'Free soccer games for kids'},/* the arcade games' search pages (lib/site/games.ts) */{path:SAFE_GUIDE.path,name:'For parents: a safe football game'}].filter(l=>l.path!==except);
 return <section className={styles.section} aria-labelledby="more"><h2 className={styles.h2} id="more">More to learn</h2>
  <ul className={styles.list}>{links.map(l=><li key={l.path}><a href={l.path}><span className={styles.itemTitle}>{l.name}</span></a></li>)}</ul>
 </section>;
}

export default function LessonHub({hub,children}:{hub:Hub;children?:React.ReactNode}){
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
  <GuideVideo path={hub.path}/>
  {children}{/* page-specific sections before the lesson groups (Nov 15 2026: the 7v7 vs 9v9 vs 11v11 table) */}
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
