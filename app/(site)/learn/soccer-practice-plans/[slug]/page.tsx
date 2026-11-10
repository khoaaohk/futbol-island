import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {AGE_YEARS,DRILLS_HUB,drillLine} from '@/lib/site/drills';
import {ageGuide} from '@/lib/site/drillGuides';
import {PLANS,PLANS_HUB,PLAN_SAFETY_LINE,PPP_LINE,PRACTICE_RANGE,clock,planBySlug,plansForAge} from '@/lib/site/plans';
import {GUIDE_FOOT,diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,DataTable,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {DrillList,GridFigure} from '@/lib/site/DrillParts';
import {PLAY_PATH,articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../../site.module.css';

/**
 * /learn/soccer-practice-plans/<slug>: one practice plan (lib/site/plans.ts): the clock table (each activity links to its
 * drill page), equipment, coach notes and a swap. The part inside `printPage` prints on one page; the rest is `noPrint`
 * (print rules at the end of site.module.css). No script: the reader prints with the browser's own Print command.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>PLANS.map(p=>({slug:p.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const p=planBySlug(params.slug);if(!p)return {};
 return pageMeta(p.title,p.desc,p.path,{whole:true,image:{url:diagramUrl(p.picture),alt:`Setup diagram of a drill from the ${p.h1}`}});
}
export default function PlanPage({params}:{params:{slug:string}}){
 const p=planBySlug(params.slug);if(!p)notFound();
 const crumbs=guideCrumbs({name:PLANS_HUB.crumb,path:PLANS_HUB.path},{name:p.name,path:p.path}),guide=ageGuide(p.age),shown=p.drills.find(d=>d.picture===p.picture)!;
 const related=[...plansForAge(p.age).filter(x=>x!==p).map(x=>({path:x.path,name:x.h1,line:`${x.minutes} minutes: ${x.goal.toLowerCase()}`})),{path:guide.path,name:guide.h1,line:guide.blurb},...p.links,
  {path:PLANS_HUB.path,name:'All soccer practice plans',line:PLANS_HUB.blurb},{path:DRILLS_HUB.path,name:'All soccer drills for kids',line:DRILLS_HUB.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:p.title,path:p.path,description:p.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${p.h1} (youth soccer coaching)`,teaches:p.goal,image:diagramUrl(p.picture)})}/>
  <JsonLd data={faqLd(p.faq)}/>
  <div className={styles.printPage}>
   <GuideIntro crumbs={crumbs} h1={p.h1} lead={p.lead}/>
   <Section id="facts" title="At a glance">
    <DataTable label={`${p.h1}: at a glance`} head={['Detail','This plan']} rows={[['Age group',`${p.age} (${AGE_YEARS[p.age]})`],['Length',`${p.minutes} minutes (guidance for ${p.age}: ${PRACTICE_RANGE[p.age]})`],['Players',p.players],['Goal for the day',p.goal],['Final game',p.field]]}/>
   </Section>
   <Section id="clock" title={`The ${p.minutes}-minute plan`}>
    <DataTable label={`${p.h1}: clock table`} head={['Time','Activity','Stage','What it is for']}
     rows={p.rows.map(r=>[`${clock(r.start)} to ${clock(r.end)}`,r.drill?<a key="a" href={r.drill.path}>{r.activity}</a>:r.activity,r.stage,r.purpose])}/>
    <p className={styles.caption}>Times are minutes from the start of practice. Tap an activity for its setup diagram and coaching points.</p>
   </Section>
   <div className={styles.printCols}>
    <Section id="equipment" title="Equipment"><Bullets items={p.equipment}/></Section>
    <Section id="notes" title="Coach notes"><Bullets items={p.notes}/></Section>
   </div>
   <Section id="swap" title="If it is going badly">
    <ul className={styles.stack}><li className={styles.card}><h3 className={styles.h3}>{p.swap.sign}</h3><p>{p.swap.instead}</p></li></ul>
    <p className={styles.caption}>{PLAN_SAFETY_LINE}</p>
   </Section>
  </div>
  <div className={styles.noPrint}>
   <Section id="structure" title="How this plan is built"><p>{PPP_LINE}</p><p>To print this plan on one page, use your browser’s Print command.</p></Section>
   <Section id="drills" title="Drills in this plan">
    <GridFigure id="s0" scene={shown.scene} image={diagramUrl(shown.picture)}/>
    <DrillList items={p.drills.map(d=>({drill:d,line:drillLine(d)}))}/>
   </Section>
   <QA id="faq" title={`Questions about this ${p.age} practice`} faq={p.faq}/>
   <Section id="lessons" title="Lessons to share with your players"><LessonList lessons={p.lessons}/></Section>
   <Section id="related" title="Keep reading"><LinkList links={related}/></Section>
   <p className={styles.caption}>{GUIDE_FOOT}</p>
   <p className={styles.end}><a className={styles.cta} href={PLAY_PATH}>Play it on the island</a></p>
  </div>
 </>;
}
