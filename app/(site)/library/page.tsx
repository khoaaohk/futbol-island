import * as ReactDOM from 'react-dom';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import LibraryPage from '@/components/site/LibraryPage';
import {LIBRARY_EN as W,LIBRARY_HERO,LIBRARY_PATH,LIBRARY_PUBLISHED,librarySections} from '@/lib/site/library';
import {SITE_UPDATED} from '@/lib/site/updated';
import {breadcrumbLd,collectionLd,pageMeta} from '@/lib/site/seo';
/**
 * /library (owner, Nov 20 2026): the Library, one page that houses every item of the footer's link row as a section
 * (in-page anchors in the menu; Nov 20 2026 night) (lib/site/library.ts; the list itself is lib/site/footerHubs.ts). Static, no client code. The header's "Library"
 * link and the redirect from plain /learn lead here (next.config.mjs); /learn?q= is still the guide search.
 */
export const dynamic='force-static';
export const metadata=pageMeta(W.title,W.description,LIBRARY_PATH,{whole:true,type:'website'});
const CRUMBS=[{name:'Home',path:'/'},{name:W.crumb,path:LIBRARY_PATH}];
export default function Library(){
 const sections=librarySections();
 if(typeof ReactDOM.preload==='function')ReactDOM.preload(LIBRARY_HERO.main.src,{as:'image',fetchPriority:'high'});
 return <>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={collectionLd({name:W.h1,path:LIBRARY_PATH,description:W.description,published:LIBRARY_PUBLISHED,modified:SITE_UPDATED.library,items:sections.map(c=>({name:c.name,path:c.href}))})}/>
  <LibraryPage crumbs={<Breadcrumbs crumbs={CRUMBS}/>} h1={W.h1} lead={W.lead} play={W.play} playTitle={W.playTitle} playLine={W.playLine}
   hero={{...LIBRARY_HERO,mainAlt:W.heroAlt,insetAlt:W.insetAlt}} sections={sections}/>
 </>;
}
