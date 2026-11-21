import KeepReading from './KeepReading';
import JsonLd from '@/components/seo/JsonLd';
import {COMPARISONS_UPDATED,comparisonBySlug} from '@/lib/site/comparisons';
import {guideCrumbs} from '@/lib/site/guides';
import {Bullets,DataTable,GuideEnd,GuideIntro,Section} from '@/lib/site/GuideParts';
import {articleLd,breadcrumbLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import RailNav from './shell/RailNav';
import {pageRail,sec} from '@/lib/site/railNavMore';
/** An "A vs B" guide page (lib/site/comparisons.ts, Nov 15 2026): the short answer, a side-by-side table from the two pages'
 *  own data, "which one fits", switching between them, and a related block: both pages, the hub and 2-3 guides. */
export function compareMeta(slug:string){const c=comparisonBySlug(slug)!;return pageMeta(c.title,c.desc,c.path,{whole:true,image:{url:c.images[0],alt:c.h1}});}
export default function ComparePage({slug}:{slug:string}){
 const c=comparisonBySlug(slug)!,crumbs=guideCrumbs(c.hub,{name:c.h1.replace(/:.*$/,''),path:c.path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:c.title,path:c.path,description:c.desc,published:COMPARISONS_UPDATED,modified:COMPARISONS_UPDATED>SITE_UPDATED.guides?COMPARISONS_UPDATED:SITE_UPDATED.guides,about:c.h1.replace(/:.*$/,''),teaches:c.answer,image:c.images[0]})}/>
  {/* side nav (owner, Nov 20 2026: "all internal pages need to have side navs"): Back to the positions or formations hub, Overview, the sections */}
  <GuideIntro top rail={<RailNav rail={pageRail('This comparison',{href:c.hub.path,name:c.hub.path.includes('positions')?'All soccer positions':'All soccer formations'},
   [sec('side-by-side','Side by side'),sec('fit','Which one fits'),sec('switching','Switching'),sec('keep-reading','Keep reading')])} current="#top"/>} crumbs={crumbs} h1={c.h1} lead={c.answer}/>
  <Section id="side-by-side" title="Side by side">
   <DataTable head={c.head} rows={c.rows} label={c.h1.replace(/:.*$/,'')}/>
  </Section>
  <Section id="fit" title="Which one fits?"><Bullets items={c.fit}/></Section>
  <Section id="switching" title="Switching between them"><Bullets items={c.switching}/></Section>
  <KeepReading title="Read each one, and more" groups={[{id:'related',links:c.links}]}/>
  <GuideEnd/>
 </>;
}
