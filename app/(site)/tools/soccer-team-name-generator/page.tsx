import NewToolPage from '@/components/site/tools/NewToolPage';
import {moreToolElement} from '@/components/site/tools/moreToolElement';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd} from '@/lib/site/GuideParts';
import {pageMeta} from '@/lib/site/seo';
import {toolCrumbs} from '@/lib/site/tools/registry';
import {newToolImage,newToolPath} from '@/lib/site/tools/newTools';
import {TEAM_NAMES_EN as P} from '@/lib/site/tools/moreTools';
/**
 * /tools/soccer-team-name-generator (Nov 22 2026, second batch). Words in lib/site/tools/moreTools.ts; the body is shared with the Spanish page
 * (components/site/tools/NewToolPage.tsx).
 */
export const dynamic='force-static';
const path=newToolPath(P.slug);
export const metadata=pageMeta(P.title,P.description,path,{whole:true,type:'website',image:{url:newToolImage(P.slug),alt:P.imageAlt}});
export default function TeamNamesPage(){
 const crumbs=toolCrumbs({name:P.crumb,path});
 return <NewToolPage p={P} path={path} crumbs={crumbs} lang="en" related={P.related}
  intro={<ToolIntro crumbs={crumbs} h1={P.h1} lead={P.lead}/>} tool={moreToolElement(P.slug,'en')}
  end={<GuideEnd sticky={false} path={path}/>}/>;
}
