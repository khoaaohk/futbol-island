import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import LineupBuilder from '@/components/site/tools/LineupBuilder';
import RotationPlanner from '@/components/site/tools/RotationPlanner';
import {PrintStyle} from '@/components/site/tools/ToolParts';
import {abs} from '@/lib/site/seo';
import {DEFAULT_FORMATION} from '@/lib/site/tools/lineup';
import {EMBED_TOOLS,embedPath,embedTool,plannerSetup} from '@/lib/site/tools/embed';
import {PRIVACY_LINE} from '@/lib/site/tools/registry';
import {SHAPES} from '@/lib/site/tools/shapes';
import site from '../../(site)/site.module.css';
/**
 * /embed/<tool> (seo-extras, Nov 15 2026): the lineup builders and playing-time calculators for a club's own website. The tool,
 * one line of privacy text and ONE small "Made with Futbol Island" link (new tab, rel noopener) back to the tool page. noindex
 * (meta + X-Robots-Tag) with the canonical on the tool page, so search shows the real page, never the embed.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>EMBED_TOOLS.map(t=>({tool:t.slug}));
export function generateMetadata({params}:{params:{tool:string}}):Metadata{
 const t=embedTool(params.tool);if(!t)return {};
 return {title:`${t.h1[0].toUpperCase()+t.h1.slice(1)} | Futbol Island`,description:t.description,
  alternates:{canonical:abs(t.path)},robots:{index:false,follow:true},openGraph:null,twitter:null};
}
export default function EmbedPage({params}:{params:{tool:string}}){
 const t=embedTool(params.tool);if(!t)notFound();
 const name=t.h1[0].toUpperCase()+t.h1.slice(1);
 let tool:React.ReactNode;
 if(t.kind==='lineup'){const format=t.format??'7v7';tool=<LineupBuilder shapes={SHAPES} initial={DEFAULT_FORMATION[format]} lockFormat={t.format}/>;}
 else{const {presets,initial}=plannerSetup(t);tool=<RotationPlanner presets={presets} initial={initial} lockKey={t.format}/>;}
 return <>
  <PrintStyle/>
  <h1 className={site.h2} data-embed={embedPath(t.slug)}>{name}</h1>
  {tool}
  <p className={site.caption}>{PRIVACY_LINE} <a href={t.path} target="_blank" rel="noopener">Made with Futbol Island</a></p>
 </>;
}
