import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {Downloads,Licence,PrintStyle,Screen,SheetPreview,SheetThumb,ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd,LinkList,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,pageMeta} from '@/lib/site/seo';
import {PRINTABLES,printableBySlug} from '@/lib/site/tools/printables';
import {printableImage,printableLd,PRINTABLES_HUB,toolCrumbs} from '@/lib/site/tools/registry';
import site from '../../../site.module.css';
import t from '@/components/site/tools/tools.module.css';

/**
 * One printable (lib/site/tools/printables.ts): a blank field template, a formation cheat sheet or the positions chart. The
 * sheet is on the page as inline SVG; printing the page prints that sheet alone (black on white, one page). Every version is
 * also a .png and an .svg file (the static route under ./files). Server-rendered, no client JavaScript.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>PRINTABLES.map(p=>({sheet:p.slug}));
export function generateMetadata({params}:{params:{sheet:string}}){
 const p=printableBySlug(params.sheet);if(!p)return {};
 const s=p.files[0].sheet(),url=printableImage(p),m=pageMeta(p.title,p.description,p.path,{whole:true,image:{url,alt:s.title}});
 return {...m,openGraph:{...m.openGraph,images:[{url,width:s.w*1.5,height:s.h*1.5,alt:s.title}]}};
}
export default function PrintablePage({params}:{params:{sheet:string}}){
 const p=printableBySlug(params.sheet);if(!p)notFound();
 const crumbs=toolCrumbs({name:PRINTABLES_HUB.crumb,path:PRINTABLES_HUB.path},{name:p.crumb,path:p.path}),main=p.files[0],rest=p.files.slice(1);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={printableLd(p)}/>
  <PrintStyle/>
  <Screen><ToolIntro crumbs={crumbs} h1={p.h1} lead={p.lead}/></Screen>
  <figure className={site.figure}>
   <SheetPreview id="main" file={main}/>
   <figcaption className={`${site.caption} ${t.noPrint}`}>{main.sheet().desc}</figcaption>
  </figure>
  <Screen>
   <Section id="download" title="Print or download">
    <p>To print, use your browser’s print command on this page: only the sheet prints, in black on white, on one page. Or download it as a picture (PNG) or as a drawing that stays sharp at any size (SVG).</p>
    <Downloads file={main}/>
    <Licence/>
   </Section>
   {rest.length>0&&<Section id="versions" title="Every version of this template">
    <ul className={t.thumbs}>{p.files.map(f=><li key={f.name}><SheetThumb file={f}/><b>{f.label}</b><span className={site.caption}>{f.note}</span><Downloads file={f}/></li>)}</ul>
   </Section>}
   <Section id="use" title="How coaches use it">{p.use.map(x=><p key={x}>{x}</p>)}</Section>
   <Section id="related" title="Go further"><LinkList links={[...p.links,{path:PRINTABLES_HUB.path,name:'All printable field diagrams',line:PRINTABLES_HUB.blurb}]}/></Section>
   <GuideEnd/>
  </Screen>
 </>;
}
