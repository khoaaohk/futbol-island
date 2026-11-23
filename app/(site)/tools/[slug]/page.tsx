import {planRotation} from '@/lib/site/tools/rotation';
import KeepReading from '@/components/site/KeepReading';
import {lineupHeading} from '@/lib/site/tools/lineupHeading';
import {notFound} from 'next/navigation';
import RailNav from '@/components/site/shell/RailNav';
import {lineupRail,plannerRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import LineupBuilder from '@/components/site/tools/LineupBuilder';
import RotationPlanner,{type Preset} from '@/components/site/tools/RotationPlanner';
import {PrintStyle,Screen,ToolIntro} from '@/components/site/tools/ToolParts';
import {FORMATIONS,formationBySlug,formationsIn,formatGuidePath} from '@/lib/site/formations';
import {DataTable,GuideEnd,LinkList,Section,type Fact} from '@/lib/site/GuideParts';
import {GUIDE_FORMATS,PLAYERS_PER_TEAM,type GuideFormat} from '@/lib/site/pitch';
import {positionPath} from '@/lib/site/positions';
import {breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SIZES_CHECKED,SIZES_SEASON} from '@/lib/site/sizes';
import {DEFAULT_FORMATION} from '@/lib/site/tools/lineup';
import {cheatSheetPath,PRINTABLES_HUB_PATH} from '@/lib/site/tools/printables';
import {COACH_APP_PATH,gameLengths,LINEUP_PAGES,LINEUP_PATH,lineupPage,PLANNER_EXAMPLE,PLANNER_PAGES,PLANNER_PATH,PLANNER_SOURCES,plannerImage,plannerPage,PRINTABLES_HUB,TOOL_PAGES,toolCrumbs,webAppLd,type LineupPage,type PlannerPage} from '@/lib/site/tools/registry';
import {SHAPES} from '@/lib/site/tools/shapes';
import EmbedSnippet from '@/components/site/tools/EmbedSnippet';
import {embedSnippet} from '@/lib/site/tools/embed';
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
const APP_LINE=(crumb:string)=>`The ${crumb.replace(/^[A-Z](?![A-Z0-9])/,m=>m.toLowerCase())} as a phone app for game day: a live substitution clock, works offline, no account.`;
const FORMAT_WORD=(f:GuideFormat)=>f==='futsal'?'futsal':f;
/* seo-nov18: every lineup and playing-time page links the positions hub once */
const POSITIONS_LINK={path:'/learn/soccer-positions',name:'Soccer positions explained',line:'What each position does, and the numbers 1 to 11'};
function Lineup({p}:{p:LineupPage}){
 const format=p.format??'7v7',f=formationBySlug(DEFAULT_FORMATION[format]),crumbs=toolCrumbs({name:p.crumb,path:p.path});
 /* round 4D: 8v8 (fútbol 8) has no printables; round 4F: it has formation guides, so it links them first, then the field size guide */
 const eight=format==='8v8',shapes8=SHAPES.filter(x=>x.format==='8v8');
 const others=LINEUP_PAGES.filter(x=>x!==p).map(x=>({path:x.path,name:x.h1[0].toUpperCase()+x.h1.slice(1),line:x.blurb}));
 const related=eight?[...formationsIn('8v8').map(x=>({path:x.path,name:`${x.name} formation`,line:x.best})),{path:formatGuidePath('8v8'),name:'8v8 soccer formations',line:'The three fútbol 8 shapes compared, with the rules that shape them'},{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and ball sizes for every age group'},{path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 compared',line:'How the small-sided games grow into the full game'},{path:PLANNER_PATH,name:'Soccer playing time calculator',line:'A fair substitution plan for the same squad'},POSITIONS_LINK,...others]:[...(p.format?formationsIn(format).map(x=>({path:x.path,name:`${x.name} formation`,line:x.best})):[]),{path:p.format?formatGuidePath(format):'/learn/soccer-formations',name:!p.format?'Soccer formations explained':format==='futsal'?'Futsal lessons for kids':`${format} soccer formations`,line:'How to choose a shape, with a diagram of each'},
  p.format?{path:cheatSheetPath(format),name:`${format==='futsal'?'Futsal':format} formations cheat sheet`,line:'Every shape of this game on one printable page'}:{path:PRINTABLES_HUB_PATH,name:'Formation cheat sheets and blank fields',line:PRINTABLES_HUB.blurb},{path:PLANNER_PATH,name:'Soccer playing time calculator',line:'A fair substitution plan for the same squad'},POSITIONS_LINK,...others];
 /* visual pass Nov 17 2026: key facts under the lead, from the tool's own features (webAppLd below) */
 const facts:Fact[]=[{icon:format==='futsal'?'court':'lineup',label:'Games',value:p.format?FORMAT_WORD(format):'7v7, 9v9, 11v11, futsal'},
  {icon:'diagram',label:'Formations',value:`${eight?shapes8.length:p.format?formationsIn(format).length:FORMATIONS.length} to choose from`},{icon:'share',label:'Share it',value:'Print, picture or link'},{icon:'lock',label:'Account',value:'None, names stay on your device'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppLd({name:p.h1[0].toUpperCase()+p.h1.slice(1),path:p.path,description:p.description,image:TOOL_PAGES.find(t=>t.path===p.path)!.image,
   features:[eight?'Fútbol 8 lineups: 3-3-1, 3-2-2 and 2-3-2':'Lineups for 7v7, 9v9, 11v11 and futsal','Drag or tap to swap players and substitutes','One-page print','Picture download','Share by link','No account; names stay on the device']})}/>
  <JsonLd data={faqLd(p.faq)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={lineupRail(!!p.format,false,eight)} current="#top"/>
  <PrintStyle/>
  <Screen><ToolIntro crumbs={crumbs} h1={p.h1} lead={p.lead} headingFormat={p.format&&lineupHeading(p.format)===p.h1?p.format:undefined} app={{href:COACH_APP_PATH+'#tool=lineup'+(p.format?`&format=${p.format}`:''),label:'Open the coach app',line:APP_LINE(p.crumb)}} facts={facts}/></Screen>
  <LineupBuilder shapes={SHAPES} initial={DEFAULT_FORMATION[format]} lockFormat={p.format}/>
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
   {!p.format&&<Section id="shapes" title="Every formation you can build" fold>
    <p>{FORMATIONS.length} shapes across five games. Each one opens in the builder from its guide page, where you can read its roles, strengths and weak spots first.</p>
    <LinkList links={FORMATIONS.map(x=>({path:x.path,name:`${x.name} formation`,line:x.best}))}/>
   </Section>}
   {eight&&p.rules&&<Section id="rules" title="Fútbol 8 rules at a glance">
    <p>There is no single national rule book for fútbol 8: each regional federation in Spain writes its own, so check yours. These are the rules in the documents we read, with where each one comes from.</p>
    <DataTable label="Fútbol 8 rules and where they come from" head={['Rule','What the documents say']} rows={p.rules}/>
   </Section>}
   {p.sources&&<Section id="sources" title="Sources">
    <ul>{p.sources.map(x=><li key={x.url}><a href={x.url} rel="noopener">{x.name}</a>: {x.says}.</li>)}</ul>
   </Section>}
   {p.format&&f&&<Section id="roles" title={`Who plays where in a ${f.shape}`}>
    <p>The builder opens with the {f.name} formation. These are its jobs; <a href={f.path}>the {f.shape} guide</a> has the strengths, the weak spots and how the shape moves.</p>
    <ul>{f.roles.map(r=><li key={r.title}><b>{r.pos?<a href={positionPath(r.pos)}>{r.title}</a>:r.title}.</b> {r.job}</li>)}</ul>
   </Section>}
   <EmbedSnippet snippet={embedSnippet(p)} name={p.h1}/>
   <QA id="faq" title={`Questions about the ${p.h1}`} faq={p.faq}/>
   <KeepReading title="Formations and more tools" groups={[{id:'related',links:related}]}/>
   <GuideEnd sticky={false} path={p.path}/>
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
  {path:'/learn/soccer-age-groups',name:'Soccer age groups explained',line:'U6 to U19 and which game each one plays'},POSITIONS_LINK,{path:'/learn/lessons',name:'Soccer lessons for kids',line:'Short lessons and quizzes to use at practice'},{path:p.format?`/tools/${p.format}-lineup-builder`:LINEUP_PATH,name:p.format?`${p.format} lineup builder`:'Soccer lineup builder',line:'Put the starters on a field diagram'},
  ...PLANNER_PAGES.filter(x=>x!==p).map(x=>({path:x.path,name:x.h1[0].toUpperCase()+x.h1.slice(1),line:x.blurb})),{path:PRINTABLES_HUB_PATH,name:'Blank soccer field diagrams',line:PRINTABLES_HUB.blurb}];
 /* Nov 20 2026 (SEO foundation): the main calculator says what goes in and what comes out right under the h1, then the rule
    with numbers. The numbers come from planRotation() itself, so the page can never disagree with the tool. */
 const ex=planRotation(PLANNER_EXAMPLE),exMin=[...new Set(ex.minutes)].sort((a,b)=>b-a).map(m=>({m,n:ex.minutes.filter(x=>x===m).length}));
 const first=p.format?undefined:<div data-calc-rule="">
  <p><b>What goes in:</b> three numbers for your soccer (football) game: how many players came, how many play at once and how long the game is. <b>What comes out:</b> a substitution plan with equal minutes for every player.</p>
  <p><b>The rule:</b> minutes each = players on the field × game minutes ÷ players in the squad. With {ex.input.players} players, {ex.input.onField} on the field and a {ex.gameMin}-minute game, that is {ex.input.onField} × {ex.gameMin} ÷ {ex.input.players}, about {Math.round(ex.fairShare)} minutes each. Changing every {ex.input.subEvery} minutes, the plan gives {exMin.map((x,i)=>`${i>0?(i===exMin.length-1?' and ':', '):''}${x.n} players ${x.m} minutes`).join('')}.</p>
 </div>;
 /* visual pass Nov 17 2026: key facts under the lead, from the planner's own features (webAppLd below) */
 const facts:Fact[]=[{icon:'lineup',label:'Games',value:p.format??'7v7, 9v9, 11v11'},{icon:'clock',label:'Minutes',value:'Equal for every player'},
  {icon:'share',label:'Share it',value:'Print, text or link'},{icon:'lock',label:'Account',value:'None, names stay on your device'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={webAppLd({name:p.h1[0].toUpperCase()+p.h1.slice(1),path:p.path,description:p.description,image:plannerImage(p),
   features:['Equal playing time for any squad size','Goalkeeper fixed or rotating','Printable table','Copy as text for a team chat','Share by link','No account; names stay on the device']})}/>
  <JsonLd data={faqLd(p.faq)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back, Overview and this page's sections */}
  <RailNav rail={plannerRail(!!p.format)} current="#top"/>
  <PrintStyle/>
  <Screen><ToolIntro crumbs={crumbs} h1={p.h1} lead={p.lead} app={{href:COACH_APP_PATH+(p.format?'#tool=subs':'#tool=minutes')+(p.format?`&format=${p.format}`:''),label:'Open the coach app',line:APP_LINE(p.crumb)}} facts={facts} first={first}/></Screen>
  <RotationPlanner presets={presets} initial={initial} lockKey={p.format}/>
  <Screen>
   <Section id="about" title={p.format?`Sharing a ${p.format} game`:'Why plan the changes'}>{p.intro.map(x=><p key={x}>{x}</p>)}</Section>
   <Section id="why" title="Why equal playing time matters at these ages">
    <p>Children learn the game by playing it. A ten-year-old on the bench is not learning to receive a pass under pressure, and nobody can tell at that age who will be the best player at sixteen: children grow and learn at very different speeds.</p>
    <p>US youth soccer moved to small-sided games (7v7, then 9v9) so that every child touches the ball more often. Sharing the minutes fairly follows the same idea: more children, more touches, more football learned.{p.format?'':' Many recreational leagues also set a minimum share of the game for every player, so check your league’s rules.'}</p>
    <p>{KEEPER_NOTE}</p>
   </Section>
   <Section id="lengths" title="Typical US youth game lengths" fold>
    <DataTable label="Typical US youth game lengths by format" head={['Game','Players on the field','Game length','Total']} rows={rows}/>
    <p className={site.caption}>Typical US youth standards for the {SIZES_SEASON} season, from the Futbol Island <a href="/learn/soccer-age-groups">age group chart</a> (sources: U.S. Soccer and US Youth Soccer); your league may differ. Checked on {SIZES_CHECKED}.</p>
   </Section>
   <Section id="method" title="How the plan is made" fold>
    <ul>
     <li>Each period is cut into equal blocks, one for every change. A 25-minute half with changes every 5 minutes has five blocks.</li>
     <li>Every player gets the same number of blocks. When that does not divide evenly, some get one block more, never two.</li>
     <li>With one goalkeeper for the whole game, nobody sits out two blocks in a row while there are enough places to avoid it. With a goalkeeper who changes, the plan keeps such double waits to the few it cannot trade away.</li>
     <li>A rotating goalkeeper stays in goal for a whole period where that is a fair share, and for a shorter spell in a very large squad.</li>
     <li>The same numbers always give the same plan. Reorder the names to change who starts.</li>
    </ul>
   </Section>
   {!p.format&&<>
   <Section id="example" title="Substitution calculator: a worked example" fold>
    <p>Ten players turn up for a 7v7 game of two 25-minute halves, and you change players every 5 minutes. That is 10 blocks of 5 minutes with 7 places in each: 70 places to share.</p>
    <ul>
     <li><b>Goalkeeper changes each half:</b> 70 places for 10 players is 7 blocks each, so every child plays 35 minutes, and two of them each keep goal for one half.</li>
     <li><b>Same goalkeeper all game:</b> the keeper plays all 50 minutes. The other 9 share 60 outfield places: six play 35 minutes and three play 30.</li>
     <li><b>A player is hurt after 10 minutes:</b> the remaining 40 minutes are shared again among the 9 still available, so the minutes still come out as level as they can.</li>
    </ul>
    <p>That is the whole method: equal blocks, the same number of blocks for everyone, and nobody sitting out twice in a row while there is a way to avoid it.</p>
   </Section>
   <Section id="game-day" title="Equal playing time during the game">
    <p>A plan on paper is only half the job. The <a href="/coach">free coach app</a> runs it on your phone at the side line: one big card shows who goes off and who comes on, and when. Tap Done when the change is made. If a child is hurt, arrives late or leaves early, one tap re-balances the rest of the game. The clock keeps time through a locked screen, and your team never leaves your phone.</p>
   </Section>
   <Section id="uk" title="Equal game time: the same idea in the UK">
    <p>In the UK, coaches often say equal game time or even playing time. It means the same as equal playing time. The calculator works the same way for any match: type how many players you have, how many play at once and how long your match is.</p>
   </Section>
   <Section id="sources" title="Sources">
    <p>Many recreational leagues set a minimum share of the game for every player. These official pages say so in their own words:</p>
    <ul>{PLANNER_SOURCES.map(x=><li key={x.url}><a href={x.url} rel="noopener">{x.name}</a>: {x.says}</li>)}</ul>
    <p className={site.caption}>Your own league’s rules come first. Ask your league what it requires.</p>
   </Section>
   <Section id="excel" title="Playing time calculator in Excel or Google Sheets" fold>
    <p>Many coaches keep a season sheet of minutes. After each game the coach app downloads a CSV file: one row per player with minutes in each period, minutes in goal, total minutes and share of the game. Open it in Excel, Google Sheets or Numbers and paste it under last week’s game.</p>
   </Section>
   </>}
   {p.format&&<Section id="game-day" title={`Running ${p.format} substitutions on game day`}>
    <p>Open the plan in the <a href="/coach">free coach app</a> and choose {p.format}: it shows the next change as one big card, OFF and ON with the shirt numbers, and counts down to it. If a child is hurt or arrives late, one tap shares the rest of the {p.format==='9v9'?'60':'50'} minutes again. At the end it downloads every player’s minutes as a CSV for Excel or Google Sheets.</p>
   </Section>}
   <EmbedSnippet snippet={embedSnippet(p)} name={p.h1}/>
   <QA id="faq" title={`Questions about ${p.format?`${p.format} substitutions`:'playing time'}`} faq={p.faq}/>
   <KeepReading title="Rules, charts and more tools" groups={[{id:'related',links:related}]}/>
   <GuideEnd sticky={false} path={p.path}/>
  </Screen>
 </>;
}
export default function ToolPage({params}:{params:{slug:string}}){
 const l=lineupPage(params.slug);if(l)return <Lineup p={l}/>;
 const r=plannerPage(params.slug);if(r)return <Planner p={r}/>;
 notFound();
}
