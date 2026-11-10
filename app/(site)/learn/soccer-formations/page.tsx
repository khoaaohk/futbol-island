import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS,FORMATIONS_HUB as HUB,formationsIn,formatGuide} from '@/lib/site/formations';
import {POSITIONS_HUB} from '@/lib/site/positions';
import {formationImage,guideCrumbs} from '@/lib/site/guides';
import {Bullets,Diagram,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {GUIDE_FORMATS} from '@/lib/site/pitch';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-formations: the formations hub (lib/site/formations.ts): what a formation is, then every shape by format. */
export const dynamic='force-static';
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:formationImage('11v11-4-3-3'),alt:'Diagram of the 4-3-3 soccer formation'}});
const LABEL={'7v7':'7v7 soccer formations','9v9':'9v9 soccer formations','11v11':'11v11 soccer formations',futsal:'Futsal formations'} as const;
export default function FormationsHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:FORMATIONS.map(f=>({name:`${f.name} formation`,path:f.path}))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} cta/>
  <Section id="what" title="What is a formation?"><Bullets items={HUB.what}/></Section>
  {GUIDE_FORMATS.map(fmt=>{const list=formationsIn(fmt),first=list[0],guide=formatGuide(fmt);
   return <Section key={fmt} id={`f-${fmt}`} title={LABEL[fmt]}>
    <p>{HUB.groups[fmt]} {guide&&<a href={guide.path}>Compare all {list.length} in the {fmt} guide</a>}{guide&&'.'}</p>
    <div className={styles.pair}>
     <Diagram id={`d-${fmt}`} format={fmt} lines={first.lines} what={`the ${first.name} formation`} small/>
     <LinkList links={list.map(f=>({path:f.path,name:`${f.name} formation`,line:f.best}))}/>
    </div>
   </Section>;})}
  <Section id="lessons" title="Lessons that teach team shape"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about formations" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[{path:POSITIONS_HUB.path,name:POSITIONS_HUB.h1,line:POSITIONS_HUB.blurb},{path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 lessons',line:'Every lesson by team size'},{path:'/learn/futsal-for-kids',name:'Futsal lessons for kids',line:'Every futsal lesson, grouped by topic'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
