import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import ReadNext from '@/components/site/ReadNext';
import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import PrintSheet from '@/components/site/PrintSheet';
import {QA} from '@/components/site/LessonHub';
import {FUTSAL_LAWS_URL,RULES,RULES_HUB,RULE_LEAGUE_LINE,RULE_SOURCE_LINE,ruleBySlug} from '@/lib/site/rules';
import {TERMS_HUB} from '@/lib/site/terms';
import {drillLinksFor} from '@/lib/site/drills';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,CoachNotesSection,DataTable,GuideEnd,GuideIntro,type Fact,SceneDiagram,Section} from '@/lib/site/GuideParts';
import GuideQuiz from '@/components/site/GuideQuiz';
import {ruleQuiz} from '@/lib/site/guideQuiz';
import {guideQuizPart} from '@/lib/site/learningLd';
import {ANIMATED_RULES} from '@/lib/site/sceneMotion';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {RULE_NOTES} from '@/lib/site/notesGuides';
import {checkNotes} from '@/lib/site/coachNotes';
import {FUTSAL_VS_SOCCER} from '@/lib/site/comparisons';
import {CardRulesGame,CardRulesPages,CardRulesSources,CardRulesTop} from '@/components/site/CardRulesSections';
import {CARD_RULES,cardDeckOf} from '@/lib/site/cardRules';
import {RulePlayDeck,RulePlayGame} from '@/components/site/RulePlaySections';
import {RULE_PLAY,isRulePlaySlug} from '@/lib/site/rulePlay';
import {longDate} from '@/lib/site/checked';
import {ruleCrossLinks} from '@/lib/site/crossLinks';
import styles from '../../../site.module.css';

/** One rule (lib/site/rules.ts): the two-sentence answer, the diagram, what the referee looks for, mix-ups, formats, FAQ, lessons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>RULES.map(r=>({slug:r.slug}));
checkNotes('rule',RULES.map(x=>x.slug),RULE_NOTES);/* every page has its own coach's notes (seo-boost, Nov 14 2026) */
export function generateMetadata({params}:{params:{slug:string}}){
 const r=ruleBySlug(params.slug);if(!r)return {};
 return pageMeta(r.title,r.desc,r.path,{whole:true,image:{url:diagramUrl(r.picture),alt:`Diagram: ${r.name.toLowerCase()} in soccer`}});
}
export default function RulePage({params}:{params:{slug:string}}){
 const r=ruleBySlug(params.slug);if(!r)notFound();
 const crumbs=guideCrumbs({name:RULES_HUB.crumb,path:RULES_HUB.path},{name:r.name,path:r.path});
 const quiz=ruleQuiz(r);
 const i=RULES.indexOf(r),next=[RULES[(i+1)%RULES.length],RULES[(i+2)%RULES.length]];
 /* Nov 20 2026 (SEO foundation): the rule's coach tool, its glossary terms and a sister rule come first (lib/site/crossLinks.ts) */
 const cross=ruleCrossLinks(r.slug);
 const related=[...cross,...[...r.exhibits,...r.links].filter(l=>!cross.some(x=>x.path===l.path)),...next.map(x=>({path:x.path,name:x.h1,line:`${x.law}, with a diagram`})),
  {path:RULES_HUB.path,name:'All soccer rules for kids',line:RULES_HUB.blurb},{path:TERMS_HUB.path,name:TERMS_HUB.h1,line:TERMS_HUB.blurb}];
 const cards=r.slug==='yellow-and-red-cards';/* Nov 16 2026: the cards page's deck, table, side questions and game (lib/site/cardRules.ts) */
 const play=isRulePlaySlug(r.slug)?RULE_PLAY[r.slug]:null;/* Nov 16 2026: the back-pass, throw-in, handball and fouls pages' deck and game (lib/site/rulePlay.ts) */
 const moving=(ANIMATED_RULES as readonly string[]).includes(r.slug),futsal=r.slug==='futsal-rules',pair=r.scenes.length>1,last=r.scenes.length-1;
 const deck=cards?{id:CARD_RULES.deck.id,n:cardDeckOf(CARD_RULES).slides.length}:play?{id:play.deck.id,n:play.slides.length}:null;
 /* visual pass Nov 17 2026: the key facts under the answer, all from this page's own data, three of them jump links */
 const facts:Fact[]=[{icon:'law',label:'Rule',value:r.law},{icon:'steps',label:'Common mix-ups',value:`${r.mixups.length} cleared up`,href:'#mixups'},
  deck?{icon:cards?'cards':'deck',label:'Flip cards',value:`${deck.n} to try`,href:`#${deck.id}`}:{icon:'diagram',label:'Diagram',value:moving?'A moving picture':'A pitch picture',href:'#diagram'},
  {icon:'quiz',label:'Quick quiz',value:`${quiz.length} questions`,href:'#quiz'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{...articleLd({headline:r.title,path:r.path,description:r.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${r.name} (soccer rule)`,teaches:r.answer,image:diagramUrl(r.picture)}),hasPart:guideQuizPart({path:r.path,name:`${r.name} quiz`,questions:quiz})}}/>
  <JsonLd data={faqLd(r.faq)}/>
  <GuideIntro crumbs={crumbs} h1={r.h1} lead={r.answer} more={cards?<CardRulesPages c={CARD_RULES}/>:undefined} facts={facts}/>
  <PrintSheet path={r.path} what={cards?'card rules sheet':'rule sheet'} has={cards?'all 14 card offenses and the yellow vs red table':undefined}/>
  {cards&&<CardRulesTop c={CARD_RULES}/>}
  {play&&<RulePlayDeck c={play}/>}
  <Section id="diagram" title={`${r.name}: diagram`}>
   {pair
    ?<div className={styles.pair}>{r.scenes.map((s,j)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><SceneDiagram id={`s${j}`} scene={s} small image={j===last?diagramUrl(r.picture):undefined} animate={moving?`${s.title.toLowerCase()} pass`:undefined}/></div>)}</div>
    :<SceneDiagram id="s0" scene={r.scenes[0]} image={diagramUrl(r.picture)} animate={moving?r.name.toLowerCase():undefined}/>}
  </Section>
  {cards&&<CardRulesGame c={CARD_RULES}/>}
  {play&&<RulePlayGame c={play}/>}
  <Section id="referee" title="What the referee looks for">
   <Bullets items={r.refs}/>
   <p className={styles.caption}>Rule: {r.law}. {futsal?<a href={FUTSAL_LAWS_URL} rel="noopener">FIFA Futsal Laws of the Game 2025-26</a>:<a href={r.lawUrl} rel="noopener">Read it in the Laws of the Game (The IFAB)</a>}.</p>
  </Section>
  <Section id="mixups" title="Common mix-ups">
   <ul className={styles.stack}>{r.mixups.map(m=><li key={m.said} className={styles.card}><h3 className={styles.h3}>{m.said}</h3><p>{m.truth}</p></li>)}</ul>
  </Section>
  <Section id="formats" title={futsal?'Futsal at a glance':'In 7v7, 9v9, 11v11 and futsal'} fold={!futsal}>
   <DataTable label={`${r.name} by game format`} head={[futsal?'Topic':'Game',futsal?'Futsal rule':'How the rule works']} rows={r.formats}/>
   <p className={styles.caption}>{RULE_LEAGUE_LINE} {RULE_SOURCE_LINE}</p>
  </Section>
  {/* Nov 15 2026 (seo-links): "futsal rules vs soccer rules" lands here, so the comparison is a section, not a second page. */}
  {futsal&&<Section id={FUTSAL_VS_SOCCER.id} title={FUTSAL_VS_SOCCER.title}>
   <DataTable label={FUTSAL_VS_SOCCER.title} head={FUTSAL_VS_SOCCER.head} rows={FUTSAL_VS_SOCCER.rows}/>
   <p className={styles.caption}>{FUTSAL_VS_SOCCER.note}</p>
  </Section>}
  {/* visual pass Nov 17 2026: one FAQ per page; the cards page's side questions join this list (not the FAQPage JSON-LD) */}
  <QA id="faq" title={`Questions about ${r.name.toLowerCase().replace('futsal rules','futsal rules')}`} faq={r.faq} more={cards?CARD_RULES.side.items:undefined}>
   {cards&&<CardRulesSources c={CARD_RULES} checked={`Checked on ${longDate(FAMILY_CHECKED.rules)}.`}/>}
  </QA>
  <CoachNotesSection name={r.name} notes={RULE_NOTES[r.slug]}/>
  <GuideQuiz id="quiz" name={r.name.toLowerCase()} questions={quiz}/>
  {/* batch 3, Nov 17 2026: lessons, drills (lib/site/drillLinks.ts GUIDE_DRILLS) and related pages as one "Keep reading" row */}
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(r.lessons)},{id:'drills',label:'Drill',icon:'cone',links:drillLinksFor(r.path)},{id:'related',links:related}]}/>
  <GuideEnd path={r.path} checked={FAMILY_CHECKED.rules} lesson={r.cta}/>
  <ReadNext path={r.path}/>
 </>;
}
