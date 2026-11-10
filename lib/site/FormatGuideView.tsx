import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationsIn,formatGuide,withKeeper,type FormatGuide} from './formations';
import {POSITIONS_HUB} from './positions';
import {formationImage,guideByPath,guideCrumbs} from './guides';
import {Bullets,Diagram,GuideEnd,GuideIntro,LessonList,LinkList,Section} from './GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from './seo';
import {SITE_UPDATED} from './updated';
import styles from '@/app/(site)/site.module.css';
/**
 * One format guide (/learn/7v7-soccer-formations, /learn/9v9-soccer-formations, /learn/11v11-soccer-formations): that format's
 * formations compared in one table, the "which one should my team use" answer, a small diagram of each, FAQ and lessons.
 */
export const formatGuideMeta=(format:FormatGuide['format'])=>{const g=formatGuide(format)!;
 return pageMeta(g.title,g.description,g.path,{whole:true,image:{url:guideByPath(g.path)!.image!,alt:`Diagram of a ${format} soccer formation`}});};
export default function FormatGuideView({format}:{format:FormatGuide['format']}){
 const g=formatGuide(format)!,list=formationsIn(format),crumbs=guideCrumbs({name:FORMATIONS_HUB.crumb,path:FORMATIONS_HUB.path},{name:g.crumb,path:g.path});
 const others=(['7v7','9v9','11v11'] as const).filter(f=>f!==format).map(f=>formatGuide(f)!);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:g.h1,path:g.path,description:g.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:list.map(f=>({name:`${f.name} formation`,path:f.path}))})}/>
  <JsonLd data={faqLd(g.faq)}/>
  <GuideIntro crumbs={crumbs} h1={g.h1} lead={g.lead} cta/>
  <Section id="compare" title={`${format} formations compared`}>
   <div className={styles.tableWrap}><table className={styles.table}>
    <thead><tr><th scope="col">Formation</th><th scope="col">With the goalkeeper</th><th scope="col">Best for</th><th scope="col">Watch out for</th></tr></thead>
    <tbody>{list.map(f=><tr key={f.slug}><th scope="row"><a href={f.path}>{f.shape}</a></th><td>{withKeeper(f)}</td><td>{f.best}</td><td>{f.watch}</td></tr>)}</tbody>
   </table></div>
   <p className={styles.caption}>U.S. Soccer writes youth formations with the goalkeeper first, so a {list[0].shape} in {format} is also written {withKeeper(list[0])}.</p>
  </Section>
  <Section id="pick" title={g.pickTitle}><Bullets items={g.pick}/></Section>
  <Section id="shapes" title={`Diagrams of each ${format} formation`}>
   <div className={styles.pair}>{list.map(f=><div key={f.slug}><h3 className={styles.h3}><a href={f.path}>{f.shape}</a></h3>
    <Diagram id={`d-${f.slug}`} format={f.format} lines={f.lines} what={`the ${f.name} formation`} small/><p className={styles.caption}>{f.lines.slice(1).map(l=>`${l.spots.length} ${l.name.toLowerCase()}`).join(', ')}. <a href={formationImage(f.slug)}>Picture</a></p></div>)}</div>
  </Section>
  <Section id="basics" title={`${format} soccer in short`}><Bullets items={g.basics}/></Section>
  <QA id="faq" title={`Questions about ${format} formations`} faq={g.faq}/>
  <Section id="lessons" title={`${format} lessons to start with`}><LessonList lessons={g.lessons}/></Section>
  <Section id="related" title="Keep reading"><LinkList links={[...others.map(o=>({path:o.path,name:o.h1,line:o.blurb})),{path:FORMATIONS_HUB.path,name:'All soccer formations',line:FORMATIONS_HUB.blurb},{path:POSITIONS_HUB.path,name:POSITIONS_HUB.h1,line:POSITIONS_HUB.blurb},{path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 lessons',line:'Every lesson by team size'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
