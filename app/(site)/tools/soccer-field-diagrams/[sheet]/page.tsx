import KeepReading from '@/components/site/KeepReading';
import {notFound} from 'next/navigation';
import RailNav from '@/components/site/shell/RailNav';
import {printableRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {Downloads,Licence,PrintStyle,Screen,SheetPreview,SheetThumb,ToolIntro} from '@/components/site/tools/ToolParts';
import {DataTable,GuideEnd,Section} from '@/lib/site/GuideParts';
import {formationsIn} from '@/lib/site/formations';
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
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={printableRail({versions:rest.length>0,compare:p.kind==='cheat-sheet'&&!!p.format})} current="#top"/>
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
   {p.kind==='cheat-sheet'&&p.format&&<Section id="compare" title="The formations on this sheet, compared">{/* Nov 15 2026 (SEO thin pages): the sheet as a table */}
    <p>{p.format==='futsal'?'Futsal shapes count the four court players in front of the goalkeeper, from the back to the front: the first number is the fixo or the back players, the last is the pivot or the front players.':`A ${p.format} team has ${{'7v7':6,'9v9':8,'11v11':10}[p.format as '7v7'|'9v9'|'11v11']} field players in front of the goalkeeper, so every ${p.format} shape adds up to ${{'7v7':6,'9v9':8,'11v11':10}[p.format as '7v7'|'9v9'|'11v11']}. Read it from the back: the first number is the defenders, the last the forwards, the rest the midfield.`}</p>
    <DataTable label={`${p.format} formations compared`} head={['Formation','At the back','In midfield','Up front','Best for','Watch out for']}
     rows={formationsIn(p.format).map(f=>{const n=f.shape.split('-').map(Number),mid=n.slice(1,-1).reduce((a,b)=>a+b,0);
      return [<a key={f.slug} href={f.path}>{f.shape}</a>,String(n[0]),n.length>2?String(mid):'none',String(n[n.length-1]),f.best,f.watch];})}/>
   </Section>}
   <Section id="use" title="How coaches use it">{p.use.map(x=><p key={x}>{x}</p>)}</Section>
   <KeepReading title="Go further" groups={[{id:'related',links:[...p.links,{path:PRINTABLES_HUB.path,name:'All printable field diagrams',line:PRINTABLES_HUB.blurb}]}]}/>
   <GuideEnd sticky={false}/>
  </Screen>
 </>;
}
