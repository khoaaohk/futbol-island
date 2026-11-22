import KeepReading from '../KeepReading';
import RailNav from '@/components/site/shell/RailNav';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {PrintStyle,Screen} from './ToolParts';
import {DataTable,Section} from '@/lib/site/GuideParts';
import {newToolRail} from '@/lib/site/railNavCollections';
import {abs,breadcrumbLd,faqLd,type Crumb} from '@/lib/site/seo';
import {webAppLd} from '@/lib/site/tools/registry';
import {newToolImage,type NewToolWords} from '@/lib/site/tools/newTools';
import {filledTables} from '@/lib/site/tools/newToolTables';
import site from '@/app/(site)/site.module.css';
import rt from '@/components/site/railTarget.module.css';
/**
 * One body for the three game-day and practice tools in both languages (Nov 22 2026): the match timer, the tournament schedule
 * maker and the beep test. English pages at app/(site)/tools/<slug>, Spanish via components/es/pages/ToolsEs.tsx. Order: the
 * head (passed in), the tool itself (a client component, server-rendered with its example), how to use it, the page's own
 * sections (tables computed from the tool's code), the sources, the FAQ and related pages. Printing prints the tool only.
 */
export default function NewToolPage({p,path,crumbs,intro,tool,end,related,lang}:{p:NewToolWords;path:string;crumbs:readonly Crumb[];intro:React.ReactNode;tool:React.ReactNode;end:React.ReactNode;
 related:readonly {path:string;name:string;line:string}[];lang:'en'|'es'}){
 const es=lang==='es',tables=filledTables(p,lang);
 const app=webAppLd({name:p.h1,path,description:p.description,image:newToolImage(p.slug),features:[...p.features]});
 const howTo={'@context':'https://schema.org','@type':'HowTo',name:p.howTitle,inLanguage:lang,url:`${abs(path)}#how`,step:p.how.map((t,i)=>({'@type':'HowToStep',position:i+1,text:t,url:`${abs(path)}#how`}))};
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={es?{...app,inLanguage:'es',audience:{'@type':'Audience',audienceType:'Entrenadores de fútbol infantil, maestros y padres'}}:app}/>
  <JsonLd data={howTo}/>
  <JsonLd data={faqLd(p.faq)}/>
  <RailNav rail={newToolRail({tool:p.toolTitle,how:es?'Cómo se usa':'How to use it',sections:p.sections.map(x=>[x.id,x.title] as const)},es)} current="#top"/>
  <PrintStyle/>
  <Screen>{intro}</Screen>
  <section aria-labelledby="tool" className={site.section}><h2 className={`${site.h2} ${rt.target}`} id="tool">{p.toolTitle}</h2>{tool}</section>
  <Screen>
   <Section id="how" title={p.howTitle}><ol>{p.how.map(x=><li key={x}>{x}</li>)}</ol></Section>
   {p.sections.map(x=><Section key={x.id} id={x.id} title={x.title} fold={x.fold}>
    {x.paras?.slice(0,x.table?0:undefined).map(t=><p key={t}>{t}</p>)}
    {x.table&&<DataTable label={x.table.label} head={x.table.head} rows={tables[x.id].rows}/>}
    {x.table&&x.paras?.map(t=><p key={t}>{t}</p>)}
    {x.items&&(x.ordered?<ol>{x.items.map(t=><li key={t}>{t}</li>)}</ol>:<ul>{x.items.map(t=><li key={t}>{t}</li>)}</ul>)}
   </Section>)}
   <Section id="sources" title={p.sourcesTitle}>
    <p>{p.sourcesIntro}</p>
    <ul>{p.sources.map(x=><li key={x.url}><a href={x.url} rel="noopener">{x.name}</a>: {x.says}</li>)}</ul>
   </Section>
   <QA id="faq" title={p.faqTitle} faq={p.faq}/>
   <KeepReading title={p.relatedTitle} groups={[{id:'related',links:related}]} lang={lang}/>
   {end}
  </Screen>
 </>;
}
