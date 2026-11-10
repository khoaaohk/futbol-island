import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {RULES,RULES_HUB as HUB,ruleBySlug} from '@/lib/site/rules';
import {CHARTS} from '@/lib/site/sizes';
import {TERMS_HUB} from '@/lib/site/terms';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {Bullets,GuideEnd,GuideIntro,LessonList,LinkList,SceneDiagram,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,collectionLd,faqLd,firstSentence,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-rules: the rules hub (lib/site/rules.ts): the game in five lines, then every rule page by group. */
export const dynamic='force-static';
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:diagramUrl('offside-rule.png'),alt:'Diagram of the offside rule in soccer'}});
export default function RulesHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path}),offside=ruleBySlug('offside')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:RULES.map(r=>({name:r.h1,path:r.path}))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} more={HUB.more} cta/>
  <Section id="basics" title="The game in five lines"><Bullets items={HUB.basics}/></Section>
  {HUB.groups.map((g,i)=><Section key={g.title} id={`g${i}`} title={g.title}>
   <p>{g.line}</p>
   <LinkList links={g.rules.map(r=>({path:r.path,name:r.name,line:firstSentence(r.answer,130)}))}/>
  </Section>)}
  <Section id="picture" title="Every rule page has a diagram like this">
   <div className={styles.pair}>{offside.scenes.map((s,i)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><SceneDiagram id={`o${i}`} scene={s} small/></div>)}</div>
   <p>Gold dots are the team attacking up the picture and dark green dots are the other team. <a href={offside.path}>Read the offside rule</a>.</p>
  </Section>
  <Section id="lessons" title="Lessons that teach the rules"><LessonList lessons={HUB.lessons}/></Section>
  <QA id="faq" title="Questions about soccer rules" faq={HUB.faq}/>
  <Section id="related" title="Keep reading"><LinkList links={[...CHARTS.map(c=>({path:c.path,name:c.h1,line:c.blurb})),{path:TERMS_HUB.path,name:TERMS_HUB.h1,line:TERMS_HUB.blurb},
   {path:'/learn/football-rules-for-kids',name:'Football rules lessons for kids',line:'The lessons that teach the rules on a moving pitch'},{path:'/exhibits/laws-1863',name:'Museum: The first Laws',line:'How the game got its rules in 1863'}]}/></Section>
  <GuideEnd cta={false}/>
 </>;
}
