import KeepReading from '../KeepReading';
import RailNav from '@/components/site/shell/RailNav';
import {boardFrontRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {Section} from '@/lib/site/GuideParts';
import {abs,breadcrumbLd,faqLd,type Crumb} from '@/lib/site/seo';
import {webAppLd} from '@/lib/site/tools/registry';
import type {BoardPage as Words} from '@/lib/site/tools/board';
/**
 * The tactics board's front door, one body for both languages (Nov 22 2026; lib/site/tools/board.ts): English at
 * app/(site)/tools/soccer-tactics-board, Spanish via components/es/pages/ToolsEs.tsx. Answer first, the Open the board button
 * (in `intro`), how to draw a play, what is on the board, ways to use it, the FAQ. Server-rendered, no client code.
 */
export default function BoardPage({p,path,image,crumbs,intro,end,related,lang}:{p:Words;path:string;image:string;crumbs:readonly Crumb[];intro:React.ReactNode;end:React.ReactNode;related:readonly {path:string;name:string;line:string}[];lang:'en'|'es'}){
 const app=webAppLd({name:p.h1,path,description:p.description,image,features:[...p.appFeatures]});
 const howTo={'@context':'https://schema.org','@type':'HowTo',name:p.howTitle,inLanguage:lang,url:abs(path)+'#how',step:p.how.map((t,i)=>({'@type':'HowToStep',position:i+1,text:t,url:`${abs(path)}#how`}))};
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={lang==='es'?{...app,inLanguage:'es',audience:{'@type':'Audience',audienceType:'Entrenadores de fútbol infantil, maestros y padres'}}:app}/>
  <JsonLd data={howTo}/>
  <JsonLd data={faqLd(p.faq)}/>
  <RailNav rail={boardFrontRail(lang==='es')} current="#top"/>
  {intro}
  <Section id="what" title={p.whatTitle}>{p.what.map(x=><p key={x}>{x}</p>)}</Section>
  <Section id="how" title={p.howTitle}><ol>{p.how.map(x=><li key={x}>{x}</li>)}</ol></Section>
  <Section id="features" title={p.featuresTitle}><ul>{p.features.map(x=><li key={x}>{x}</li>)}</ul></Section>
  <Section id="uses" title={p.usesTitle}><ul>{p.uses.map(x=><li key={x}>{x}</li>)}</ul></Section>
  <QA id="faq" title={p.faqTitle} faq={p.faq}/>
  <KeepReading title={p.relatedTitle} groups={[{id:'related',links:related}]} lang={lang}/>
  {end}
 </>;
}
