import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {DRILLS,DRILLS_HUB as HUB,DRILL_SAFETY_LINE,SKILLS,drill,drillLine,drillsBySkill} from '@/lib/site/drills';
import {AGE_GUIDES,SKILL_GUIDES} from '@/lib/site/drillGuides';
import {PLANS_HUB} from '@/lib/site/plans';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,GuideEnd,GuideIntro,LessonList,LinkList,Section} from '@/lib/site/GuideParts';
import {DrillList,GridFigure} from '@/lib/site/DrillParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-drills: the drills hub (lib/site/drills.ts). No filters and no script: sections by age and by skill, with anchor links. */
export const dynamic='force-static';
const PICTURE=diagramUrl('sharks-and-minnows-drill.png');
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:PICTURE,alt:'Setup diagram of the Sharks and Minnows soccer drill'}});
export default function DrillsHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path}),sharks=drill('sharks-and-minnows');
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:[...AGE_GUIDES,...SKILL_GUIDES].map(g=>({name:g.h1,path:g.path})).concat(DRILLS.map(d=>({name:d.h1,path:d.path})))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} more={HUB.more} cta/>
  <Section id="by-age" title="Soccer drills by age">
   <p>Each age page is a short guide: what players can do, how to group them, the best drills and what to avoid.</p>
   <LinkList links={AGE_GUIDES.map(g=>({path:g.path,name:g.h1,line:g.blurb}))}/>
  </Section>
  <Section id="by-skill" title="Soccer drills by skill">
   <p>Jump to a skill on this page.</p>
   <LinkList links={SKILLS.map(s=>({path:`#${s.id}`,name:s.name,line:`${drillsBySkill(s.id).length} drills. ${s.line}`}))}/>
  </Section>
  {SKILLS.map(s=><Section key={s.id} id={s.id} title={s.name}>
   <p>{s.line}</p>
   <DrillList items={drillsBySkill(s.id).map(d=>({drill:d,line:drillLine(d)}))}/>
  </Section>)}
  <Section id="picture" title="Every drill has a setup diagram like this">
   <GridFigure id="hub" scene={sharks.scene} image={PICTURE}/>
   <p>The area is drawn in proportion with its size in yards and metres. <a href={sharks.path}>See how to play Sharks and Minnows</a>.</p>
  </Section>
  <Section id="how" title="How to use these drills">
   <Bullets items={HUB.how}/>
   <p className={styles.caption}>{DRILL_SAFETY_LINE}</p>
  </Section>
  <Section id="guides" title="Guides by skill and practice plans">
   <LinkList links={[...SKILL_GUIDES.map(g=>({path:g.path,name:g.h1,line:g.blurb})),{path:PLANS_HUB.path,name:PLANS_HUB.h1,line:PLANS_HUB.blurb}]}/>
  </Section>
  <Section id="lessons" title="Lessons that teach the ideas behind the drills"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about soccer drills" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[{path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'},{path:'/learn/soccer-positions',name:'Soccer positions for kids',line:'What each player does'},
   {path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'What U6, U8, U10 and U12 mean'},{path:'/learn/soccer-terms',name:'Soccer terms for kids',line:'The words coaches use, explained'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
