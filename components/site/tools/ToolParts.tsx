import Breadcrumbs from '@/components/site/Breadcrumbs';
import SheetSvg from '@/lib/site/tools/SheetSvg';
import {fileUrl,type PrintFile} from '@/lib/site/tools/printables';
import {TOOL_NAMES} from '@/lib/site/tools/registry';
import {LICENCE} from '@/lib/site/tools/sheet';
import type {Crumb} from '@/lib/site/seo';
import site from '@/app/(site)/site.module.css';
import t from './tools.module.css';
/**
 * Server-rendered parts shared by the tool pages (app/(site)/tools): the page head, the print rule that drops the site footer
 * on these pages only (the header is already hidden in print by site.module.css), a sheet preview and its download links.
 */
export function ToolIntro({crumbs,h1,lead}:{crumbs:readonly Crumb[];h1:string;lead:string}){
 return <header className={site.intro}>
  <Breadcrumbs crumbs={crumbs}/>
  <h1 className={site.title}>{h1}</h1>
  <p className={site.lead}>{lead}</p>
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
