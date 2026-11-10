import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import LineupBuilder from '@/components/site/tools/LineupBuilder';
import RotationPlanner,{type Preset} from '@/components/site/tools/RotationPlanner';
import {PrintStyle,Screen,ToolIntro} from '@/components/site/tools/ToolParts';
import {FORMATIONS,formationBySlug,formationsIn,formatGuidePath} from '@/lib/site/formations';
import {DataTable,GuideEnd,LinkList,Section} from '@/lib/site/GuideParts';
import {GUIDE_FORMATS,PLAYERS_PER_TEAM,type GuideFormat} from '@/lib/site/pitch';
import {positionPath} from '@/lib/site/positions';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SIZES_CHECKED,SIZES_SEASON} from '@/lib/site/sizes';
import {DEFAULT_FORMATION} from '@/lib/site/tools/lineup';
import {cheatSheetPath,PRINTABLES_HUB_PATH} from '@/lib/site/tools/printables';
import {gameLengths,LINEUP_PAGES,LINEUP_PATH,lineupPage,PLANNER_PAGES,PLANNER_PATH,plannerImage,plannerPage,PRINTABLES_HUB,TOOL_PAGES,toolCrumbs,webAppLd,type LineupPage,type PlannerPage} from '@/lib/site/tools/registry';
import {SHAPES} from '@/lib/site/tools/shapes';
import site from '../../site.module.css';

/**
 * The tool pages (lib/site/tools/registry.ts): the lineup builder and its 7v7 / 9v9 / 11v11 / futsal landings, and the
 * playing-time planner and its 7v7 / 9v9 landings. Static pages: the words, the default diagram or table, the roles and the FAQ
 * are prerendered; the tool itself is one client component per page type, loaded only here.
 */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>[...LINEUP_PAGES,...PLANNER_PAGES].map(p=>({slug:p.slug}));
export function generateMetadata({params}:{params:{slug:string}}){
 const p=lineupPage(params.slug)??plannerPage(params.slug);if(!p)return {};
 const image=TOOL_PAGES.find(t=>t.path===p.path)!.image!;
 return pageMeta(p.title,p.description,p.path,{whole:true,type:'website',image:{url:image,alt:p.kind==='lineup'?`A formation diagram from the ${p.h1}`:'A soccer formation diagram'}});
}
const FORMAT_WORD=(f:GuideFormat)=>f==='futsal'?'futsal':f;
function Lineup({p}:{p:LineupPage}){
 const format=p.format??'7v7',f=formationBySlug(DEFAULT_FORMATION[format])!,crumbs=toolCrumbs({name:p.crumb,path:p.path});
 const others=LINEUP_PAGES.filter(x=>x!==p).map(x=>({path:x.path,name:x.h1[0].toUpperCase()+x.h1.slice(1),line:x.blurb}));
 const related=[...(p.format?formationsIn(format).map(x=>({path:x.path,name:`${x.name} formation`,line:x.best})):[]),{path:p.format?formatGuidePath(format):'/learn/soccer-formations',name:!p.format?'Soccer formations explained':format==='futsal'?'Futsal lessons for kids':`${format} soccer formations`,line:'How to choose a shape, with a diagram of each'},
  p.format?{path:cheatSheetPath(format),name:`${format==='futsal'?'Futsal':format} formations cheat sheet`,line:'Every shape of this game on one printable page'}:{path:PRINTABLES_HUB_PATH,name:'Formation cheat sheets and blank fields',line:PRINTABLES_HUB.blurb},{path:PLANNER_PATH,name:'Soccer playing time calculator',line:'A fair substitution plan for the same squad'},...others];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppLd({name:p.h1[0].toUpperCase()+p.h1.slice(1),path:p.path,description:p.description,image:TOOL_PAGES.find(t=>t.path===p.path)!.image,
   features:['Lineups for 7v7, 9v9, 11v11 and futsal','Drag or tap to swap players and substitutes','One-page print','Picture download','Share by link','No account; names stay on the device']})}/>
  <JsonLd data={faqLd(p.faq)}/>
  <PrintStyle/>
  <Screen><ToolIntro crumbs={crumbs} h1={p.h1} lead={p.lead}/></Screen>
  <LineupBuilder shapes={SHAPES} initial={f.slug} lockFormat={p.format}/>
  <Screen>
   <Section id="how" title="How to build your lineup">
    <ol>
     <li>Choose the game and the formation. The field and the dots change to match.</li>
     <li>Type a first name or nickname for each position, and add your substitutes.</li>
     <li>Tap a player, then tap another player or a substitute to swap them. On a computer you can drag, or use Tab, the arrow keys and Enter.</li>
     <li>Add your team name and a match note such as the kick-off time.</li>
     <li>Press Print for a one-page sheet, Download picture for a PNG, or Copy link to send the lineup to someone.</li>
    </ol>
   </Section>
   <Section id="about" title={p.format?`About ${FORMAT_WORD(format)} lineups`:'Why draw the lineup'}>{p.intro.map(x=><p key={x}>{x}</p>)}</Section>
   {!p.format&&<Section id="shapes" title="Every formation you can build">
    <p>{FORMATIONS.length} shapes across four games. Each one opens in the builder from its guide page, where you can read its roles, strengths and weak spots first.</p>
    <LinkList links={FORMATIONS.map(x=>({path:x.path,name:`${x.name} formation`,line:x.best}))}/>
   </Section>}
   {p.format&&<Section id="roles" title={`Who plays where in a ${f.shape}`}>
    <p>The builder opens with the {f.name} formation. These are its jobs; <a href={f.path}>the {f.shape} guide</a> has the strengths, the weak spots and how the shape moves.</p>
    <ul>{f.roles.map(r=><li key={r.title}><b>{r.pos?<a href={positionPath(r.pos)}>{r.title}</a>:r.title}.</b> {r.job}</li>)}</ul>
   </Section>}
   <QA id="faq" title={`Questions about the ${p.h1}`} faq={p.faq}/>
   <Section id="related" title="Formations and more tools"><LinkList links={related}/></Section>
   <GuideEnd/>
  </Screen>
 </>;
}
const KEEPER_NOTE='A plan is a starting point. If a child is hurt, upset or simply flying, change it: the aim is a fair share over the season, not a perfect table every week.';
function Planner({p}:{p:PlannerPage}){
 const crumbs=toolCrumbs({name:p.crumb,path:p.path}),format=p.format??'7v7';
 const presets:Preset[]=GUIDE_FORMATS.filter(f=>f!=='futsal').flatMap(f=>gameLengths(f).map(g=>({id:`${f}-${g.periods}x${g.periodMin}`,label:`${f} · ${g.ages} · ${g.label}`,onField:PLAYERS_PER_TEAM[f],periods:g.periods,periodMin:g.periodMin})));
 const g=gameLengths(format)[0],initial={players:!p.format?11:format==='9v9'?12:10,onField:PLAYERS_PER_TEAM[format],periods:g?.periods??2,periodMin:g?.periodMin??25,subEvery:format==='9v9'?10:5,keeperRotates:true,names:[] as string[],team:''};
 const rows=GUIDE_FORMATS.filter(f=>f!=='futsal').flatMap(f=>gameLengths(f).map(x=>[`${f} (${x.ages})`,`${PLAYERS_PER_TEAM[f]}`,x.label,`${x.periods*x.periodMin} min`]));
 const related=[{path:'/learn/soccer-rules/substitutions-and-game-length',name:'Substitutions and game length by age',line:'How long games last and how changes work'},{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'},
  {path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'},{path:p.format?`/tools/${p.format}-lineup-builder`:LINEUP_PATH,name:p.format?`${p.format} lineup builder`:'Soccer lineup builder',line:'Put the starters on a field diagram'},
  ...PLANNER_PAGES.filter(x=>x!==p).map(x=>({path:x.path,name:x.h1[0].toUpperCase()+x.h1.slice(1),line:x.blurb})),{path:PRINTABLES_HUB_PATH,name:'Blank soccer field diagrams',line:PRINTABLES_HUB.blurb}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppLd({name:p.h1[0].toUpperCase()+p.h1.slice(1),path:p.path,description:p.description,image:plannerImage(p),
   features:['Equal playing time for any squad size','Goalkeeper fixed or rotating','Printable table','Copy as text for a team chat','Share by link','No account; names stay on the device']})}/>
  <JsonLd data={faqLd(p.faq)}/>
  <PrintStyle/>
  <Screen><ToolIntro crumbs={crumbs} h1={p.h1} lead={p.lead}/></Screen>
  <RotationPlanner presets={presets} initial={initial} lockKey={p.format}/>
  <Screen>
   <Section id="about" title={p.format?`Sharing a ${p.format} game`:'Why plan the changes'}>{p.intro.map(x=><p key={x}>{x}</p>)}</Section>
   <Section id="why" title="Why equal playing time matters at these ages">
    <p>Children learn the game by playing it. A ten-year-old on the bench is not learning to receive a pass under pressure, and nobody can tell at that age who will be the best player at sixteen: children grow and learn at very different speeds.</p>
    <p>US youth soccer moved to small-sided games (7v7, then 9v9) so that every child touches the ball more often. Sharing the minutes fairly follows the same idea: more children, more touches, more football learned.{p.format?'':' Many recreational leagues also set a minimum share of the game for every player, so check your league’s rules.'}</p>
    <p>{KEEPER_NOTE}</p>
   </Section>
   <Section id="lengths" title="Typical US youth game lengths">
    <DataTable label="Typical US youth game lengths by format" head={['Game','Players on the field','Game length','Total']} rows={rows}/>
    <p className={site.caption}>Typical US youth standards for the {SIZES_SEASON} season, from the Futbol Island <a href="/learn/soccer-age-groups">age group chart</a> (sources: U.S. Soccer and US Youth Soccer); your league may differ. Checked on {SIZES_CHECKED}.</p>
   </Section>
   <Section id="method" title="How the plan is made">
    <ul>
     <li>Each period is cut into equal blocks, one for every change. A 25-minute half with changes every 5 minutes has five blocks.</li>
     <li>Every player gets the same number of blocks. When that does not divide evenly, some get one block more, never two.</li>
     <li>With one goalkeeper for the whole game, nobody sits out two blocks in a row while there are enough places to avoid it. With a goalkeeper who changes, the plan keeps such double waits to the few it cannot trade away.</li>
     <li>A rotating goalkeeper stays in goal for a whole period where that is a fair share, and for a shorter spell in a very large squad.</li>
     <li>The same numbers always give the same plan. Reorder the names to change who starts.</li>
    </ul>
   </Section>
   <QA id="faq" title={`Questions about ${p.format?`${p.format} substitutions`:'playing time'}`} faq={p.faq}/>
   <Section id="related" title="Rules, charts and more tools"><LinkList links={related}/></Section>
   <GuideEnd/>
  </Screen>
 </>;
}
export default function ToolPage({params}:{params:{slug:string}}){
 const l=lineupPage(params.slug);if(l)return <Lineup p={l}/>;
 const r=plannerPage(params.slug);if(r)return <Planner p={r}/>;
 notFound();
}
