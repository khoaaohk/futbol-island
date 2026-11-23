import RailNav from '@/components/site/shell/RailNav';
import {BOARD_EN,BOARD_PATH} from '@/lib/site/tools/board';
import {toolsHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {ToolCards} from '@/components/site/tools/ToolCards';
import {CoachAppBand} from '@/components/site/tools/CoachAppBand';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd,LinkList,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {PRINTABLES} from '@/lib/site/tools/printables';
import {LINEUP_PAGES,PLANNER_PAGES,PRINTABLES_HUB,PRIVACY_LINE,TOOL_PAGES,TOOLS_HUB,TOOLS_UPDATED,toolCrumbs} from '@/lib/site/tools/registry';
import {SCAN_EN,SCAN_PATH} from '@/lib/site/tools/scanTrainer';

/** /tools (lib/site/tools/registry.ts): every free coach tool and printable, in four groups of cards (components/site/tools/ToolCards.tsx). Static, no client code. */
export const dynamic='force-static';
const H=TOOLS_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:TOOL_PAGES[0].image!,alt:'A 9v9 soccer formation diagram'}});
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
export default function ToolsHub(){
 const crumbs=toolCrumbs();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:H.h1,path:H.path,description:H.description,published:TOOLS_UPDATED,modified:TOOLS_UPDATED,items:TOOL_PAGES.filter(p=>p.path!==H.path).map(p=>({name:cap(p.name),path:p.path}))})}/>
  <JsonLd data={faqLd(H.faq)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={toolsHubRail()} current="#top"/>
  <ToolIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  {/* Nov 22 2026 (owner): the Coach app called out at the top, before the groups of tools */}
  <CoachAppBand/>
  <Section id="lineups" title="Lineup builders">
   <p>Put names on a field diagram, swap players with a tap, then print the sheet, save a picture or share a link. {PRIVACY_LINE}</p>
   <ToolCards links={LINEUP_PAGES.map(p=>({path:p.path,name:cap(p.h1),line:p.blurb}))} tint="lineups"/>
  </Section>
  <Section id="playing-time" title="Playing time and substitutions">
   <p>Enter how many players came and how long the game is. The planner shares the minutes equally and tells you who comes on at each change.</p>
   <ToolCards links={PLANNER_PAGES.map(p=>({path:p.path,name:cap(p.h1),line:p.blurb}))} tint="time"/>
  </Section>
  <Section id="practice" title="Apps for practice and match day">
   <p>A tactics board to draw a play and run it step by step, a scanning trainer that flashes colors, numbers, arrows and passes so players look over the shoulder, and a coach app with the lineup and a live substitution clock.</p>
   <ToolCards links={[{path:BOARD_PATH,name:cap(BOARD_EN.h1),line:BOARD_EN.blurb},{path:SCAN_PATH,name:cap(SCAN_EN.h1),line:SCAN_EN.blurb},{path:'/coach',name:'Coach app for match day',line:'Lineup and a live substitution clock on your phone; works offline, no account'}]} tint="practice"/>
  </Section>
  <Section id="printables" title="Printable field diagrams and cheat sheets">
   <p>Blank fields to draw on, every formation of a game on one page, and the positions with their numbers. Free to print and share for teams, clubs and schools.</p>
   <ToolCards links={[{path:PRINTABLES_HUB.path,name:cap(PRINTABLES_HUB.h1),line:PRINTABLES_HUB.blurb},...PRINTABLES.map(p=>({path:p.path,name:cap(p.h1),line:p.blurb}))]} tint="print"/>
  </Section>
  <QA id="faq" title="Questions about the tools" faq={H.faq}/>
  <Section id="guides" title="Guides that go with the tools"><LinkList links={[{path:'/learn/soccer-formations',name:'Soccer formations',line:'Every formation for 7v7, 8v8, 9v9, 11v11 and futsal, with a diagram'},{path:'/learn/8v8-soccer-formations',name:'8v8 soccer formations (fútbol 8)',line:'The 3-3-1, 3-2-2 and 2-3-2 compared, with the regional rules'},{path:'/learn/soccer-positions',name:'Soccer positions',line:'What each position does and the numbers 1 to 11'},
   {path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'},{path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'},{path:'/learn/lessons',name:'All football lessons',line:'Short animated lessons with a quiz'}]}/></Section>
  <GuideEnd sticky={false}/>
 </>;
}
