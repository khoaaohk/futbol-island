import NewToolPage from '@/components/site/tools/NewToolPage';
import MatchTimer from '@/components/site/tools/MatchTimer';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd} from '@/lib/site/GuideParts';
import {pageMeta} from '@/lib/site/seo';
import {toolCrumbs} from '@/lib/site/tools/registry';
import {newToolImage,newToolPath,TIMER_EN as P} from '@/lib/site/tools/newTools';
import {timerPresets} from '@/lib/site/tools/newToolTables';
/**
 * /tools/soccer-match-timer (Nov 22 2026): the soccer match timer and scoreboard. Words in lib/site/tools/newTools.ts; the body is shared with the Spanish page
 * (components/site/tools/NewToolPage.tsx).
 */
export const dynamic='force-static';
const path=newToolPath(P.slug);
export const metadata=pageMeta(P.title,P.description,path,{whole:true,type:'website',image:{url:newToolImage(P.slug),alt:P.imageAlt}});
export default function MatchTimerPage(){
 const crumbs=toolCrumbs({name:P.crumb,path});
 return <NewToolPage p={P} path={path} crumbs={crumbs} lang="en" related={P.related}
  intro={<ToolIntro crumbs={crumbs} h1={P.h1} lead={P.lead}/>} tool={<MatchTimer presets={timerPresets('en')} initialPreset="7v7-2x25"/>}
  end={<GuideEnd sticky={false} path={path}/>}/>;
}
