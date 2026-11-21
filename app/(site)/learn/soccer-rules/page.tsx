import JsonLd from '@/components/seo/JsonLd';
import RailNav from '@/components/site/shell/RailNav';
import {anchor,hubRail} from '@/lib/site/railNavMore';
import {QA} from '@/components/site/LessonHub';
import {RULES,RULES_HUB as HUB,ruleBySlug} from '@/lib/site/rules';
import {CHARTS} from '@/lib/site/sizes';
import {TERMS_HUB} from '@/lib/site/terms';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {GuideEnd,GuideIntro,SceneDiagram,Section} from '@/lib/site/GuideParts';
import PitchDiagram from '@/lib/site/PitchDiagram';
import {sceneDesc} from '@/lib/site/scenes';
import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import {Band,CardGrid,IconRows} from '@/components/site/HubParts';
import type {FactIconKind} from '@/components/site/FactIcons';
import {breadcrumbLd,collectionLd,faqLd,firstSentence,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../../site.module.css';

/** /learn/soccer-rules: the rules hub (lib/site/rules.ts): the game in five lines, then every rule page by group. */
export const dynamic='force-static';
/** the five lines' icons: the goal, the keeper's glove, the corner flag (ball out), the cards (fouls), the whistle (the referee) */
const BASIC_ICONS:readonly FactIconKind[]=['goal','glove','flag','cards','whistle'];
export const metadata=pageMeta(HUB.title,HUB.description,HUB.path,{whole:true,image:{url:diagramUrl('offside-rule.png'),alt:'Diagram of the offside rule in soccer'}});
export default function RulesHub(){
 const crumbs=guideCrumbs({name:HUB.crumb,path:HUB.path}),offside=ruleBySlug('offside')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:HUB.h1,path:HUB.path,description:HUB.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:RULES.map(r=>({name:r.h1,path:r.path}))})}/>
  <JsonLd data={faqLd(HUB.faq)}/>
  <GuideIntro top rail={<RailNav rail={hubRail('Soccer rules on this page',HUB.groups.map(g=>({title:g.title,items:g.rules.slice(0,6).map(r=>anchor('rule',r.path,r.name))})))} current="#top"/>} crumbs={crumbs} h1={HUB.h1} lead={HUB.lead} more={HUB.more} cta/>
  {/* batch 3, Nov 17 2026 (audit rank 9): the diagram first, the five lines as icon rows, each rule group a chapter band with the
      first rule's own diagram, six rule cards and "Show all N"; lessons and related pages as one "Keep reading" grid */}
  <Section id="picture" title="Every rule page has a diagram like this">
   <div className={styles.pair}>{offside.scenes.map((s,i)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><SceneDiagram id={`o${i}`} scene={s} small/></div>)}</div>
   <p>Gold dots are the team attacking up the picture and dark green dots are the other team. <a href={offside.path}>Read the offside rule</a>.</p>
  </Section>
  <Section id="basics" title="The game in five lines"><IconRows items={HUB.basics.map((t,i)=>({icon:BASIC_ICONS[i]??'ball',text:t}))}/></Section>
  {HUB.groups.map((g,i)=>{const sc=g.rules[0].scenes[0];return <Band key={g.title} id={`g${i}`} title={g.title} line={g.line} tone={i%2?'paper':'tint'} count={`${g.rules.length} ${g.rules.length===1?'rule':'rules'}`}
   art={<PitchDiagram id={`band${i}`} format={sc.format} spots={sc.spots} arrows={sc.runs} title={sc.title} desc={sceneDesc(sc)} small scene={{ball:sc.ball,lineY:sc.lineY,lineWord:sc.lineWord,zone:sc.zone,passes:sc.passes}}/>}>
   <CardGrid ids="rule" cards={g.rules.map(r=>({path:r.path,name:r.name,icon:'law' as const,line:firstSentence(r.answer,130)}))}/>
  </Band>;})}
  <QA id="faq" title="Questions about soccer rules" faq={HUB.faq}/>
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(HUB.lessons)},{id:'related',links:[...CHARTS.map(c=>({path:c.path,name:c.h1,line:c.blurb})),{path:TERMS_HUB.path,name:TERMS_HUB.h1,line:TERMS_HUB.blurb},
   {path:'/learn/football-rules-for-kids',name:'Football rules lessons for kids',line:'The lessons that teach the rules on a moving pitch'},{path:'/exhibits/laws-1863',name:'Museum: The first Laws',line:'How the game got its rules in 1863'}]}]}/>
  <GuideEnd cta={false}/>
 </>;
}
