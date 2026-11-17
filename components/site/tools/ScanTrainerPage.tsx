import KeepReading from '../KeepReading';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import EmbedSnippet from '@/components/site/tools/EmbedSnippet';
import {GridFigure} from '@/lib/site/DrillParts';
import {DataTable,Section} from '@/lib/site/GuideParts';
import type {GridScene} from '@/lib/site/grid';
import {abs,breadcrumbLd,faqLd,type Crumb} from '@/lib/site/seo';
import {webAppLd} from '@/lib/site/tools/registry';
import {scanDrillScenes,SCAN_IMAGE,SCAN_SLUG,type ScanPage} from '@/lib/site/tools/scanTrainer';
import site from '@/app/(site)/site.module.css';
import s from './scanPreview.module.css';
/**
 * The Scan Trainer front door, one body for both languages (Nov 16 2026; docs/scan-trainer/HANDOFF.md): English at
 * app/(site)/tools/soccer-scanning-trainer, Spanish via components/es/pages/ToolsEs.tsx. Answer first (what scanning is), the
 * open-the-app button, how to use it with the interval-by-age table, six drills with grid diagrams, tips, the embed, the FAQ.
 * Server-rendered, no client code apart from the shared embed-copy button.
 */
export const SCAN_EMBED_PATH=`/embed/${SCAN_SLUG}`;
export const scanEmbedSnippet=(title:string)=>`<iframe src="${abs(SCAN_EMBED_PATH)}" title="${title} (Futbol Island)" width="100%" height="760" style="border:0;max-width:640px" loading="lazy" referrerpolicy="strict-origin" allow="screen-wake-lock"></iframe>`;
/** The four sample cues drawn as the phone shows them (a real fragment of the app's cue screen, in its own colours). */
function Preview({p,es}:{p:ScanPage;es:boolean}){
 return <figure className={s.preview}>
  <ul className={s.cues} aria-label={p.previewCaption}>
   <li className={`${s.cue} ${s.blue}`}><span className={s.word}>{es?'Azul':'Blue'}</span></li>
   <li className={s.cue}><span className={s.num}>7</span></li>
   <li className={s.cue}><svg viewBox="-50 -50 100 100" className={`${s.arrow} ${s.left}`} aria-hidden="true"><path d="M0 -44 L34 -6 L13 -6 L13 42 L-13 42 L-13 -6 L-34 -6 Z" fill="currentColor"/></svg></li>
   <li className={s.cue}><span className={s.pass}>{es?'Pásale al 3':'Pass to 3'}</span><span className={s.passRow}><span className={s.num}>3</span><svg viewBox="-50 -50 100 100" className={`${s.arrowSmall} ${s.right}`} aria-hidden="true"><path d="M0 -44 L34 -6 L13 -6 L13 42 L-13 42 L-13 -6 L-34 -6 Z" fill="currentColor"/></svg></span></li>
  </ul>
  <figcaption className={site.caption}>{p.previewCaption}</figcaption>
 </figure>;
}
/** `figure`: the Spanish page draws the diagrams with Spanish descriptions and key (components/es/pages/DrillsEs.tsx EsGridFigure). */
export default function ScanTrainerPage({p,path,crumbs,intro,end,related,lang,figure}:{p:ScanPage;path:string;crumbs:readonly Crumb[];intro:React.ReactNode;end:React.ReactNode;related:readonly {path:string;name:string;line:string}[];lang:'en'|'es';figure?:(id:string,scene:GridScene)=>React.ReactNode}){
 const scenes=scanDrillScenes(p);
 const howTo={'@context':'https://schema.org','@type':'HowTo',name:p.howTitle,description:p.ageIntro,inLanguage:lang,url:abs(path)+'#how',image:abs(SCAN_IMAGE),
  tool:[{'@type':'HowToTool',name:lang==='es'?'Un teléfono':'A phone'},{'@type':'HowToTool',name:lang==='es'?'Un cono alto o una botella de agua':'A tall cone or a water bottle'}],
  step:p.how.map((t,i)=>({'@type':'HowToStep',position:i+1,text:t,url:`${abs(path)}#how`}))};
 const app=webAppLd({name:p.h1,path,description:p.description,image:SCAN_IMAGE,features:[...p.features]});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={lang==='es'?{...app,inLanguage:'es',audience:{'@type':'Audience',audienceType:'Entrenadores de fútbol infantil, maestros y padres'}}:app}/>
  <JsonLd data={howTo}/>
  <JsonLd data={faqLd(p.faq)}/>
  {intro}
  <Section id="what" title={p.whatTitle}>{p.what.map(x=><p key={x}>{x}</p>)}<Preview p={p} es={lang==='es'}/></Section>
  <Section id="how" title={p.howTitle}><ol>{p.how.map(x=><li key={x}>{x}</li>)}</ol></Section>
  <Section id="speed" title={p.ageTitle}>
   <p>{p.ageIntro}</p>
   <DataTable label={p.ageTitle} head={p.ageHead} rows={p.ages.map(r=>[r.age,p.secWord(r.every),r.cue,r.session])}/>
  </Section>
  <Section id="settings" title={p.settingsTitle}><ul>{p.settings.map(x=><li key={x}>{x}</li>)}</ul><p className={site.caption}>{p.privacy}</p></Section>
  <Section id="drills" title={p.drillsTitle}>
   <p>{p.drillsIntro}</p>
   {p.drills.map((d,i)=><article key={d.id} className={s.drill} aria-labelledby={`drill-${d.id}`}>
    <h3 className={site.h3} id={`drill-${d.id}`}>{scenes[i].title}</h3>
    <p className={s.facts}><span><b>{p.labels.ages}:</b> {d.ages}</span><span><b>{p.labels.players}:</b> {d.players}</span><span><b>{p.labels.setting}:</b> {d.setting}</span></p>
    {figure?figure(`scan-${d.id}`,scenes[i]):<GridFigure id={`scan-${d.id}`} scene={scenes[i]} small/>}
    <ol>{d.steps.map(x=><li key={x}>{x}</li>)}</ol>
    <p><b>{p.labels.point}:</b> {d.point}</p>
   </article>)}
  </Section>
  <Section id="tips" title={p.tipsTitle}><ul>{p.tips.map(x=><li key={x}>{x}</li>)}</ul></Section>
  <EmbedSnippet snippet={scanEmbedSnippet(p.h1)} name={p.h1.toLowerCase()} lang={lang==='es'?'es':undefined}/>
  <QA id="faq" title={p.faqTitle} faq={p.faq}/>
  <KeepReading title={p.relatedTitle} groups={[{id:'related',links:related}]} lang={lang==='es'?'es':'en'}/>
  {end}
 </>;
}
