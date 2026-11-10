import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationBySlug,formationsUsing} from '@/lib/site/formations';
import {POSITIONS,POSITIONS_HUB,positionBySlug} from '@/lib/site/positions';
import {guideCrumbs,positionImage} from '@/lib/site/guides';
import {Bullets,Diagram,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {drillLinksFor} from '@/lib/site/drills';
import {SITE_CARDS,cardPath} from '@/lib/site/cards';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../../site.module.css';

/** One position (lib/site/positions.ts): the job in one sentence, where they stand, with and without the ball, habits, numbers, formations, FAQ, lessons, cards. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>POSITIONS.map(p=>({slug:p.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const p=positionBySlug(params.slug);if(!p)return {};
 return pageMeta(p.title,p.desc,p.path,{whole:true,image:{url:positionImage(p.slug),alt:`Diagram showing where the ${p.name.toLowerCase()} plays`}});
}
export default function PositionPage({params}:{params:{slug:string}}){
 const p=positionBySlug(params.slug);if(!p)notFound();
 const f=formationBySlug(p.diagram)!,lower=p.name.toLowerCase(),used=formationsUsing(p.slug);
 const crumbs=guideCrumbs({name:POSITIONS_HUB.crumb,path:POSITIONS_HUB.path},{name:p.name,path:p.path});
 const cards=SITE_CARDS.filter(c=>c.role===p.cardRole&&!c.coach).slice(p.cardSkip,p.cardSkip+6);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:p.title,path:p.path,description:p.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${p.name} (soccer position)`,teaches:p.job,image:positionImage(p.slug)})}/>
  <JsonLd data={faqLd(p.faq)}/>
  <GuideIntro crumbs={crumbs} h1={p.h1} lead={p.job} more={p.suits}/>
  <Section id="where" title={`Where the ${lower} stands`}>
   <Diagram id="where-d" format={f.format} lines={f.lines} what={`the ${lower} position in a ${f.shape} formation`} mark={p.slug} markName={lower} image={positionImage(p.slug)}/>
   <p>{p.where}</p>
  </Section>
  <Section id="with" title="With the ball"><Bullets items={p.withBall}/></Section>
  <Section id="without" title="Without the ball"><Bullets items={p.withoutBall}/></Section>
  <Section id="habits" title="Three habits to practise">
   <ol className={styles.stack}>{p.habits.map(h=><li key={h.name} className={styles.card}><h3 className={styles.h3}>{h.name}</h3><p>{h.how}</p></li>)}</ol>
  </Section>
  <Section id="number" title={`Shirt number: ${p.numbers}`}>
   <p>{p.numberLine} The numbers are a coaching custom from the days when starters wore 1 to 11. Players today can wear any number.</p>
  </Section>
  <Section id="small" title="In 7v7, 9v9 and futsal"><p>{p.small}</p></Section>
  {used.length>0&&<Section id="formations" title={`Formations with a ${lower}`}>
   <LinkList links={[...used.map(x=>({path:x.path,name:`${x.name} formation`,line:x.roles.find(r=>r.pos===p.slug)?.title??x.best})),{path:FORMATIONS_HUB.path,name:'All soccer formations',line:FORMATIONS_HUB.blurb}]}/>
  </Section>}
  <QA id="faq" title={`Questions about the ${lower}`} faq={p.faq}/>
  <Section id="lessons" title="Lessons for this position"><LessonList lessons={p.lessons}/></Section>
  {cards.length>0&&<Section id="cards" title="Player cards">
   <p className={styles.caption}>{p.cardNote}</p>
   <LinkList links={cards.map(c=>({path:cardPath(c.number),name:c.displayName,line:[c.roleLabel,c.country].filter(Boolean).join(' · ')}))}/>
  </Section>}
  {/* Nov 10 2026: drills that train this (lib/site/drillLinks.ts GUIDE_DRILLS) */}
  {drillLinksFor(p.path).length>0&&<Section id="drills" title="Soccer drills to practice this"><LinkList links={drillLinksFor(p.path)}/></Section>}
  <Section id="related" title="Other positions"><LinkList links={[...POSITIONS.filter(x=>x!==p).map(x=>({path:x.path,name:x.name,line:`Number ${x.numbers}`})),{path:POSITIONS_HUB.path,name:'All soccer positions',line:POSITIONS_HUB.blurb}]}/></Section>
  <GuideEnd/>
 </>;
}
