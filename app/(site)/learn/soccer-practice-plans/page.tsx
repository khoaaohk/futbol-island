import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {AGES,AGE_YEARS,DRILLS_HUB,drill} from '@/lib/site/drills';
import {AGE_GUIDES} from '@/lib/site/drillGuides';
import {PLANS,PLANS_HUB as HUB,PLAN_SAFETY_LINE,PPP_LINE,plansForAge} from '@/lib/site/plans';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {DataTable,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {GridFigure} from '@/lib/site/DrillParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-practice-plans: the practice plans hub (lib/site/plans.ts): the plans by age, the play-practice-play structure, lengths by age. */
export const dynamic='force-static';
const PICTURE=diagramUrl('three-v-three-game-drill.png');
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:PICTURE,alt:'Setup diagram of a 3v3 small-sided soccer game'}});
export default function PlansHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path}),game=drill('three-v-three-game');
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:PLANS.map(p=>({name:p.h1,path:p.path}))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} more={HUB.more} cta/>
  {AGES.map(a=><Section key={a} id={a.toLowerCase()} title={`${a} soccer practice plans (${AGE_YEARS[a]})`}>
   <LinkList links={plansForAge(a).map(p=>({path:p.path,name:p.h1,line:`${p.minutes} minutes. ${p.goal}.`}))}/>
  </Section>)}
  <Section id="structure" title="How every plan is built: play, practice, play">
   <p>{PPP_LINE}</p>
   <DataTable label="The three stages of a play-practice-play session" head={['Stage','What happens']} rows={HUB.stages}/>
  </Section>
  <Section id="length" title="How long should practice be?">
   <DataTable label="Soccer practice length by age group" head={['Age group','Practice length','Game','Ball']} rows={HUB.lengths}/>
   <p className={styles.caption}>{HUB.lengthsNote} {PLAN_SAFETY_LINE}</p>
  </Section>
  <Section id="picture" title="Every plan ends with a game like this">
   <GridFigure id="hub" scene={game.scene} image={PICTURE}/>
   <p>A small game gives every player the ball. <a href={game.path}>See how to set up 3v3</a>.</p>
  </Section>
  <Section id="drills" title="Drills by age"><LinkList links={[...AGE_GUIDES.map(g=>({path:g.path,name:g.h1,line:g.blurb})),{path:DRILLS_HUB.path,name:'All soccer drills for kids',line:DRILLS_HUB.blurb}]}/></Section>
  <Section id="lessons" title="Lessons to share with your players"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about soccer practice plans" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'},{path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5'},
   {path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'},{path:'/learn/soccer-formations',name:'Soccer formations for kids',line:'Shapes for 7v7, 9v9 and 11v11'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
