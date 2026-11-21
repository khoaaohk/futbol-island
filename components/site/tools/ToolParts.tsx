import type {ReactNode} from 'react';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import SheetSvg from '@/lib/site/tools/SheetSvg';
import {fileUrl,type PrintFile} from '@/lib/site/tools/printables';
import {TOOL_NAMES} from '@/lib/site/tools/registry';
import {LICENCE} from '@/lib/site/tools/sheet';
import type {Crumb} from '@/lib/site/seo';
import type {GuideFormat} from '@/lib/site/pitch';
import LineupHeading from './LineupHeading';
import {QuickAnswer,type Fact} from '@/lib/site/GuideParts';
import site from '@/app/(site)/site.module.css';
import t from './tools.module.css';
/**
 * Server-rendered parts shared by the tool pages (app/(site)/tools): the page head, the print rule that drops the site footer
 * on these pages only (the header is already hidden in print by site.module.css), a sheet preview and its download links.
 */
/** headingFormat: a lineup format landing; its h1 follows the builder's format select (components/site/tools/LineupHeading.tsx). */
export function ToolIntro({crumbs,h1,lead,headingFormat,app,facts,first}:{crumbs:readonly Crumb[];h1:string;lead:string;headingFormat?:GuideFormat;app?:{href:string;label:string;line:string};facts?:readonly Fact[];/** shown right under the h1, before the lead (Nov 20 2026: what goes in, what comes out) */first?:ReactNode}){
 return <header className={`${site.intro} ${t.head}`} id="top">{/* #top: the rail's Overview (layout batch 3, Nov 20 2026) */}
  <Breadcrumbs crumbs={crumbs}/>
  {headingFormat?<LineupHeading format={headingFormat} className={site.title}/>:<h1 className={site.title}>{h1}</h1>}
  {first}
  <QuickAnswer lead={lead} facts={facts} answer={false}/>
  {app&&<AppLink {...app}/>}
  <p className={site.caption}>{TOOL_NAMES}</p>
 </header>;
}
/** Printing a tool page prints the sheet only: no site footer, no page margins wasted, white paper. */
export const PrintStyle=()=><style dangerouslySetInnerHTML={{__html:'@media print{[data-reading-page]>footer{display:none}[data-reading-page]{min-height:0!important;background:#fff!important}@page{margin:10mm}}'}}/>;
/** Everything that should not be printed goes in here (display: contents on screen, so the page grid is unchanged). */
export const Screen=({children}:{children:React.ReactNode})=><div className={t.screen}>{children}</div>;
export function Downloads({file}:{file:PrintFile}){
 return <div className={t.dl}><a className={t.dlBtn} href={fileUrl(file.name,'png')} download aria-label={`Download PNG: ${file.label}`}>Download PNG</a><a className={t.dlBtn} href={fileUrl(file.name,'svg')} download aria-label={`Download SVG: ${file.label}`}>Download SVG</a></div>;
}
export function SheetPreview({id,file}:{id:string;file:PrintFile}){
 return <div className={t.sheet}><SheetSvg id={id} sheet={file.sheet()}/></div>;
}
/** A small picture of a sheet: the .svg file itself (a real image URL for image search), loaded lazily. */
export function SheetThumb({file}:{file:PrintFile}){
 const s=file.sheet();
 /* a plain <img> on purpose: the picture is the static .svg file itself (a real image URL for image search); nothing to optimise */
 // eslint-disable-next-line @next/next/no-img-element
 return <div className={t.sheet}><img src={fileUrl(file.name,'svg')} alt={s.title} width={s.w} height={s.h} loading="lazy" decoding="async"/></div>;
}
export const Licence=()=><p className={site.caption} id="licence">{LICENCE}</p>;
/** "Open the app" on a tool page (the coach app at /coach, Nov 16 2026): the same tool as a phone app for game day. */
export function AppLink({href,label,line}:{href:string;label:string;line:string}){
 return <p className={t.appLink}><a className={t.appBtn} href={href} data-coach-app-link="">{label}</a><span className={site.caption}>{line}</span></p>;
}
