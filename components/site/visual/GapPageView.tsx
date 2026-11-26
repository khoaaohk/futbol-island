import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import KeepReading from '@/components/site/KeepReading';
import GuideQuiz from '@/components/site/GuideQuiz';
import RailNav from '@/components/site/shell/RailNav';
import {pageRail,sec} from '@/lib/site/railNavMore';
import {withMesh} from '@/lib/site/mesh';
import {guideCrumbs} from '@/lib/site/guides';
import {DataTable,GuideEnd,GuideIntro,type Fact} from '@/lib/site/GuideParts';
import {EsGuideEnd,EsIntro,esLibCrumbs} from '@/components/es/EsParts';
import {articleLd,breadcrumbLd,faqLd} from '@/lib/site/seo';
import {guideQuizPart} from '@/lib/site/learningLd';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {GAP_UPDATED,type GapBlock,type GapPage} from '@/lib/site/gapPages';
import {Callout,CourtInField,DrillCards,IconSteps,PositionPitch,TryIt,VSection} from './Visuals';
import site from '@/app/(site)/site.module.css';
/**
 * One gap page (lib/site/gapPages.ts, Spanish lib/i18n/es/gapPages.ts; Nov 26 2026): the direct answer and key facts, then the
 * page's blocks (the tappable pitch, drill cards with set-up drawings, tables, icon steps, callouts), Try it in the game, the
 * FAQ, a 3-question quiz and Keep reading. Server-rendered; the quiz is the shared client island (components/site/GuideQuiz).
 */
type Lang='en'|'es';
/** A link on a Spanish page goes to the Spanish page when there is one (lib/i18n/esPaths.ts), else to the English page. */
const L=(lang:Lang,path:string)=>{if(lang!=='es'||!path.startsWith('/'))return path;const [p,h]=path.split('#');return hasEs(p)?toEs(p)+(h?`#${h}`:''):path;};
/** A rail label: the title before any colon, cut at a word to 26 characters. */
// Side-menu labels (owner rule: whole, short labels; a title cut mid-phrase read "Tap a position to see its"): a short name per
// block id where the title is long; anything else falls back to the title before its colon, cut at a word.
const NAV:Record<string,[en:string,es:string]>={pitch:['Tap a position','Toca una posición'],'all-letters':['All the letters','Todas las letras'],spanish:['In Spanish','En español'],
 numbers:['Center back numbers','Dorsales del central'],drills:['The 9 drills','Los 9 ejercicios'],'by-age':['By age','Por edad'],'safe-spot':['A safe spot','Un sitio seguro'],
 'to-scale':['To scale','A escala'],differences:['Every difference','Las diferencias'],'what-it-teaches':['What futsal teaches','Qué enseña el futsal'],switching:['Switching','Cambiar de uno a otro'],
 moves:['Moves by type','Movimientos por tipo'],when:['Which type when','Cuál usar y cuándo'],'what-to-say':['What to say','Qué decir'],games:['3 possession games','3 juegos de posesión'],
 'try-at-practice':['Try it at practice','En el entrenamiento']};
const short=(t:string,id?:string,es=false)=>{const n=id?NAV[id]:undefined;if(n)return n[es?1:0];const s=t.replace(/:.*$/,'');if(s.length<=26)return s;const c=s.slice(0,26);return c.slice(0,c.lastIndexOf(' '));};
function Block({b,lang}:{b:GapBlock;lang:Lang}){
 const intro='intro' in b&&b.intro?<p>{b.intro}</p>:null;
 switch(b.k){
  case 'pitch':return <VSection id={b.id} title={b.title}>{intro}<PositionPitch spots={b.spots.map(s=>({...s,href:s.href&&L(lang,s.href)}))} title={b.pitchTitle} desc={b.pitchDesc} more={b.more} lang={lang}/></VSection>;
  case 'table':return <VSection id={b.id} title={b.title}>{intro}<DataTable label={b.title} head={b.head} rows={b.rows}/>{b.note&&<p className={site.caption}>{b.note}</p>}</VSection>;
  case 'drills':return <VSection id={b.id} title={b.title}>{intro}<DrillCards lang={lang} drills={b.drills.map(d=>({...d,setup:lang==='es'?{...d.setup,players:d.setup.players?.map(([x,y,l])=>[x,y,l==='You'?'Tú':l] as const)}:d.setup,link:d.link&&{...d.link,path:L(lang,d.link.path)}}))}/></VSection>;
  case 'steps':return <VSection id={b.id} title={b.title}>{intro}<IconSteps items={b.items}/></VSection>;
  case 'list':return <VSection id={b.id} title={b.title}>{intro}<ul>{b.items.map(t=><li key={t}>{t}</li>)}</ul></VSection>;
  case 'callout':return <Callout id={b.id} title={b.title} items={b.items} text={b.text} tone={b.tone}/>;
  case 'scale':return <VSection id={b.id} title={b.title}>{intro}<CourtInField caption={b.caption} lang={lang}/></VSection>;
 }
}
export default function GapPageView({p,lang='en'}:{p:GapPage;lang?:Lang}){
 const es=lang==='es',path=es?toEs(p.path):p.path;
 const crumbs=es?esLibCrumbs({name:p.hub.name,path:toEs(p.hub.path)},{name:p.crumb,path}):guideCrumbs({name:p.hub.name,path:p.hub.path},{name:p.crumb,path:p.path});
 const facts:Fact[]=p.facts.map(f=>({...f,href:f.href}));
 const quizName=p.quizName,quizTitle=es?'Pon a prueba lo que sabes':'Check yourself';
 const rail=pageRail(p.rail,{href:L(lang,p.hub.path),name:p.hub.name},[...p.blocks.filter(b=>b.k!=='callout'||b.tone==='tip').map(b=>sec(b.id,short(b.title,b.id,es))),
  sec('try-it',es?'Pruébalo':'Try it'),sec('faq',es?'Preguntas':'Questions'),sec('quiz','Quiz'),sec('keep-reading',es?'Sigue leyendo':'Keep reading')],es);
 const links=p.links.map(l=>({...l,path:L(lang,l.path)}));
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={{...articleLd({headline:p.title,path,description:p.desc,published:GAP_UPDATED,modified:GAP_UPDATED,about:p.about,teaches:p.answer,image:p.image}),...(es?{inLanguage:'es'}:{}),hasPart:guideQuizPart({path,name:`${quizTitle}: ${quizName}`,questions:p.quiz})}}/>
  <JsonLd data={faqLd(p.faq)}/>
  {es
   ?<EsIntro top rail={<RailNav rail={rail} current="#top"/>} crumbs={crumbs} h1={p.h1} lead={p.answer} facts={facts}/>
   :<GuideIntro top rail={<RailNav rail={rail} current="#top"/>} crumbs={crumbs} h1={p.h1} lead={p.answer} facts={facts}/>}
  {p.blocks.map(b=><Block key={b.id} b={b} lang={lang}/>)}
  <TryIt links={p.tryIt.map(t=>({...t,href:L(lang,t.href)}))} lang={lang}/>
  <QA id="faq" title={es?`Preguntas sobre ${quizName}`:`Questions about ${quizName}`} faq={p.faq}/>
  <GuideQuiz id="quiz" name={quizName} questions={p.quiz} lang={es?'es':undefined}/>
  <p className={site.caption} data-sources="">{p.sources}</p>
  <KeepReading lang={lang} groups={withMesh([{id:'related',links}],path,lang)}/>
  {es?<EsGuideEnd checked={GAP_UPDATED} lessonId={p.lessons?.[0]}/>:<GuideEnd path={p.path} checked={GAP_UPDATED}/>}
 </>;
}
