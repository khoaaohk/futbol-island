import RailNav from '@/components/site/shell/RailNav';
import {toolsHubRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {ToolCards,ToolSubLinks} from '@/components/site/tools/ToolCards';
import {ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd,LinkList,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {PRINTABLES} from '@/lib/site/tools/printables';
import {LINEUP_PAGES,PRIVACY_LINE,TOOL_PAGES,TOOLS_HUB,TOOLS_UPDATED,toolCrumbs} from '@/lib/site/tools/registry';
import {TOOL_GROUPS} from '@/lib/site/tools/toolGroups';

/** /tools (lib/site/tools/registry.ts): every free coach tool and printable, in two groups of cards (training, game day) (components/site/tools/ToolCards.tsx). Static, no client code. */
export const dynamic='force-static';
const H=TOOLS_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:TOOL_PAGES[0].image!,alt:'A 9v9 soccer formation diagram'}});
const cap=(s:string)=>s[0].toUpperCase()+s.slice(1);
const byPath=new Map(TOOL_PAGES.map(p=>[p.path,p]));
const link=(path:string)=>{const p=byPath.get(path);if(!p)throw new Error(`tools hub: ${path} is not a tool page`);return {path,name:cap(p.name),line:p.blurb};};
const {training:TRAINING,gameDay:GAME_DAY}=TOOL_GROUPS;
export default function ToolsHub(){
 const crumbs=toolCrumbs();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:H.h1,path:H.path,description:H.description,published:TOOLS_UPDATED,modified:TOOLS_UPDATED,items:TOOL_PAGES.filter(p=>p.path!==H.path).map(p=>({name:cap(p.name),path:p.path}))})}/>
  <JsonLd data={faqLd(H.faq)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={toolsHubRail()} current="#top"/>
  <ToolIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  {/* Nov 22 2026 (owner: "reorganize the tools: two types, regular training tools and game day tools"). The coach-app feature
     band from the coach branch goes above these two groups. */}
  <Section id="training" title="Training tools">
   <p>For practice nights: a timed practice plan from our drills, a scanning trainer, field diagrams to draw on, a beep test and a juggling challenge for the players, and a name for a new team. Each works in your browser, and what you type stays on your device.</p>
   {/* TODO(tools-wt merge): add the tactics board card (/tools/soccer-tactics-board) here once that route lands from the coach branch. */}
   <ToolCards links={TRAINING.map(link)} tint="practice"/>
   <ToolSubLinks label="Printables" links={PRINTABLES.map(p=>({path:p.path,name:cap(p.h1)}))}/>
  </Section>
  <Section id="game-day" title="Game day tools">
   <p>For match day at the field: lineups on a field diagram, equal playing time and substitution rotations, a match timer and scoreboard, a tournament schedule maker, the field size for your format and a stats tracker for parents. {PRIVACY_LINE}</p>
   <ToolCards links={[{path:LINEUP_PAGES[0].path,name:cap(LINEUP_PAGES[0].h1),line:LINEUP_PAGES[0].blurb},...GAME_DAY.map(link)]} tint="gameday"/>
   <ToolSubLinks label="Lineup builders by format" links={LINEUP_PAGES.slice(1).map(p=>({path:p.path,name:cap(p.h1)}))}/>
  </Section>
  <QA id="faq" title="Questions about the tools" faq={H.faq}/>
  <Section id="guides" title="Guides that go with the tools"><LinkList links={[{path:'/learn/soccer-formations',name:'Soccer formations',line:'Every formation for 7v7, 9v9, 11v11 and futsal, with a diagram'},{path:'/learn/soccer-positions',name:'Soccer positions',line:'What each position does and the numbers 1 to 11'},
   {path:'/learn/soccer-rules',name:'Soccer rules for kids',line:'Every rule with a diagram'},{path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'},{path:'/learn/lessons',name:'All football lessons',line:'Short animated lessons with a quiz'}]}/></Section>
  <GuideEnd sticky={false}/>
 </>;
}
