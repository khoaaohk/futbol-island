import NewToolPage from '@/components/site/tools/NewToolPage';
import TournamentScheduler from '@/components/site/tools/TournamentScheduler';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd} from '@/lib/site/GuideParts';
import {pageMeta} from '@/lib/site/seo';
import {toolCrumbs} from '@/lib/site/tools/registry';
import {newToolImage,newToolPath,SCHEDULE_EN as P} from '@/lib/site/tools/newTools';
/**
 * /tools/soccer-tournament-schedule-maker (Nov 22 2026): the round-robin tournament schedule maker. Words in lib/site/tools/newTools.ts; the body is shared with the Spanish page
 * (components/site/tools/NewToolPage.tsx).
 */
export const dynamic='force-static';
const path=newToolPath(P.slug);
export const metadata=pageMeta(P.title,P.description,path,{whole:true,type:'website',image:{url:newToolImage(P.slug),alt:P.imageAlt}});
export default function SchedulePage(){
 const crumbs=toolCrumbs({name:P.crumb,path});
 return <NewToolPage p={P} path={path} crumbs={crumbs} lang="en" related={P.related}
  intro={<ToolIntro crumbs={crumbs} h1={P.h1} lead={P.lead}/>} tool={<TournamentScheduler/>}
  end={<GuideEnd sticky={false} path={path}/>}/>;
}
