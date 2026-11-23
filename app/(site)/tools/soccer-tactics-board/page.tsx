import BoardPage from '@/components/site/tools/BoardPage';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd} from '@/lib/site/GuideParts';
import {pageMeta} from '@/lib/site/seo';
import {TOOL_PAGES,toolCrumbs} from '@/lib/site/tools/registry';
import {BOARD_APP_PATH,BOARD_EN as P,BOARD_PATH,BOARD_RELATED} from '@/lib/site/tools/board';
/**
 * /tools/soccer-tactics-board (Nov 22 2026): the SEO front door of the tactics board (/board, the game's Coaches Board on the web).
 * Words in lib/site/tools/board.ts; the body is shared with the Spanish page (components/site/tools/BoardPage.tsx).
 */
export const dynamic='force-static';
const IMAGE=TOOL_PAGES.find(t=>t.path===BOARD_PATH)!.image!;
export const metadata=pageMeta(P.title,P.description,BOARD_PATH,{whole:true,type:'website',image:{url:IMAGE,alt:'An 11v11 soccer formation diagram, the kind of shape you set out on the tactics board'}});
export default function TacticsBoardFrontDoor(){
 const crumbs=toolCrumbs({name:P.crumb,path:BOARD_PATH});
 return <BoardPage p={P} path={BOARD_PATH} image={IMAGE} crumbs={crumbs} lang="en" related={BOARD_RELATED}
  intro={<ToolIntro crumbs={crumbs} h1={P.h1} lead={P.lead} app={{href:BOARD_APP_PATH,label:P.openLabel,line:P.openLine}}/>}
  end={<GuideEnd sticky={false} path={BOARD_PATH}/>}/>;
}
