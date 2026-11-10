import type {Faq} from '../safety';
import {formationBySlug} from '../formations';
import {chartBySlug} from '../sizes';
import {abs,PUBLISHER,SITE_NAME,SITE_URL} from '../seo';
import {PLAYERS_PER_TEAM,type GuideFormat} from '../pitch';
import {DEFAULT_FORMATION} from './lineup';
import {fileUrl,PRINTABLES,PRINTABLES_HUB_PATH,PRINT_FILES,type Printable} from './printables';
/**
 * The free coach tools (Nov 10 2026): /tools, the lineup builder and its format landings, the playing-time planner and its
 * landings, and the printables (lib/site/tools/printables.ts). TOOL_PAGES is the registry, parallel to lib/site/guides.ts: it
 * feeds the sitemap (lib/site/paths.ts), llms.txt and llms-full.txt, and the hubs' "More to learn" list (TOOL_HUBS). Like the
 * guide clusters these pages are NOT linked from the home page; they are reached from the guides, the hubs and each other.
 * All page words live here as typed data. US searchers say "soccer": titles and H1s lead with it, "football" appears once
 * near the top. Privacy: the tools send nothing anywhere (docs/accounts-design.md); the pages say so.
 * Facts: game lengths come from lib/site/sizes.ts (already sourced: U.S. Soccer and US Youth Soccer); nothing is re-researched.
 */
export const TOOLS_PATH='/tools';
export const TOOLS_UPDATED='2026-11-10';
export const LINEUP_PATH='/tools/soccer-lineup-builder';
export const PLANNER_PATH='/tools/soccer-playing-time-calculator';
export const PRIVACY_LINE='Names stay on your device. Nothing you type is sent to Futbol Island or stored on a server.';
export const TOOL_NAMES='Soccer is called football in most of the world. These tools are free, with no account and no ads, from Futbol Island, a football learning game for kids aged 7 to 12.';
/** A deep link that opens the builder with one formation chosen (the formation pages' "Build this lineup"). */
export const lineupLinkFor=(formationSlug:string)=>{const f=formationBySlug(formationSlug);return `${f?`/tools/${f.format}-lineup-builder`:LINEUP_PATH}#f=${formationSlug}`;};
export type LineupPage={kind:'lineup';slug:string;path:string;format?:GuideFormat;crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;intro:string[];faq:Faq[]};
const formationImg=(slug:string)=>`/learn/diagrams/${slug}-formation.png`;
export const LINEUP_PAGES:readonly LineupPage[]=[
 {kind:'lineup',slug:'soccer-lineup-builder',path:LINEUP_PATH,crumb:'Lineup builder',title:'Soccer Lineup Builder: Free, Printable, No Sign-Up',h1:'Soccer lineup builder',
  description:'Free soccer lineup builder for 7v7, 9v9, 11v11 and futsal. Pick a formation, type names, drag players, then print it, save a picture or share a link.',
  lead:'Build your starting lineup on a real field diagram. Pick the game and the formation, type first names, move players between positions and the bench, then print it, save it as a picture or copy a link for the team chat.',
  blurb:'Names on a field diagram for 7v7, 9v9, 11v11 or futsal: print, picture or link',
  intro:['A lineup on paper settles the questions children ask in the car park: “Where am I playing?” and “Am I starting?” This builder draws the answer on the same field diagrams the Futbol Island lessons use, so the shape on the sheet is the shape the players have already seen.',
   'It works for every game US youth teams play: 7v7 at U9 and U10, 9v9 at U11 and U12, 11v11 from U13, and futsal indoors. Change the formation at any time and the names stay with you.'],
  faq:[{q:'Is the soccer lineup builder really free?',a:'Yes. There is no account, no trial and no advert. You can build, print, download and share as many lineups as you like.'},
   {q:'Where are my players’ names stored?',a:'Only in your own browser, so the lineup is still there when you come back on the same device. Nothing is sent to a server. A link you copy holds the lineup inside the link itself, so only people you send it to can open it.'},
   {q:'Can I use it on my phone at the field?',a:'Yes. It is made for one thumb: tap a player, then tap the spot or the substitute to swap with. On a computer you can drag instead, or use the Tab, arrow and Enter keys.'},
   {q:'How do I share a lineup with parents?',a:'Use “Download picture” and post the picture in your team chat, or use “Copy link” and paste the link. Use first names or nicknames only when you share a lineup of children.'}]},
 {kind:'lineup',slug:'7v7-lineup-builder',path:'/tools/7v7-lineup-builder',format:'7v7',crumb:'7v7 lineup builder',title:'7v7 Lineup Builder: Free Printable Soccer Lineup',h1:'7v7 soccer lineup builder',
  description:'Build a 7v7 soccer lineup in a 2-3-1, 3-2-1, 2-2-2 or 3-1-2. Type names, drag players and subs, then print it or share a link. Free, no sign-up.',
  lead:'Set out your seven starters and your substitutes on a 7v7 field with build-out lines. Choose a 2-3-1, 3-2-1, 2-2-2 or 3-1-2, type first names and move players until it looks right.',
  blurb:'Seven starters and the bench on a 7v7 field',
  intro:['7v7 is the game US teams play at U9 and U10: a goalkeeper and six outfield players on a small field. Most squads have ten to twelve children, so the bench matters as much as the starting seven. Put every child on the sheet, starters and substitutes, before you leave the house.',
   'At this age nobody should own a position. Save a lineup, then swap two players for the second half and print both. A child who plays in defense one week and up front the next learns the whole game.'],
  faq:[{q:'What is the best 7v7 formation to start with?',a:'Most coaches start with a 2-3-1: two defenders, three midfielders and one forward in front of the goalkeeper. It gives width in the middle and is easy for young players to understand.'},
   {q:'How many substitutes should a 7v7 team have?',a:'Three to five is common, which makes a squad of ten to twelve. With more than that it becomes hard to give every child a fair share of the game.'},
   {q:'Does the 7v7 field in the builder have build-out lines?',a:'Yes. The two dashed lines are the build-out lines used in US 7v7. The other team waits behind the line while your goalkeeper restarts play, so show your defenders where to stand to receive the ball.'}]},
 {kind:'lineup',slug:'9v9-lineup-builder',path:'/tools/9v9-lineup-builder',format:'9v9',crumb:'9v9 lineup builder',title:'9v9 Lineup Builder: Free Printable Soccer Lineup',h1:'9v9 soccer lineup builder',
  description:'Build a 9v9 soccer lineup in a 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 or 4-3-1. Type names, drag players and subs, then print or share it. Free, no sign-up.',
  lead:'Place your nine starters on a 9v9 field in a 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 or 4-3-1, add the substitutes, and hand every player a clear picture of where they begin.',
  blurb:'Nine starters and the bench on a 9v9 field',
  intro:['9v9 is played at U11 and U12 in the US. With eight outfield players there are three real lines for the first time, and offside is called from the halfway line, so players need to know who is beside them and who is behind them. A drawn lineup shows that in one look.',
   'Try the same squad in two shapes. Build it in a 3-2-3, copy the link, then switch to a 3-3-2 and compare: the names move with the shape, so you can see at once which players change jobs.'],
  faq:[{q:'What is the most common 9v9 formation?',a:'The 3-2-3 is the usual first choice: three defenders, two central midfielders and three forwards. It prepares players for the 4-3-3 they will meet in 11v11.'},
   {q:'Can I move a player from the bench into the lineup?',a:'Yes. Tap the substitute, then tap the player on the field. They swap places. On a computer you can drag one onto the other.'},
   {q:'Can I print the 9v9 lineup?',a:'Yes. “Print” makes a one-page sheet in black on white with the field, the names, the bench and your match note, ready for a clipboard.'}]},
 {kind:'lineup',slug:'11v11-lineup-builder',path:'/tools/11v11-lineup-builder',format:'11v11',crumb:'11v11 lineup builder',title:'11v11 Lineup Builder: Free Soccer Lineup Maker',h1:'11v11 soccer lineup builder',
  description:'Make an 11v11 soccer lineup in a 4-3-3, 4-4-2, 4-2-3-1 or 3-5-2 on a full-size field. Type names, drag players, then print or share it. Free, no sign-up.',
  lead:'Draw your starting eleven on a full-size field in a 4-3-3, 4-4-2, 4-2-3-1 or 3-5-2, with the customary numbers on the dots and your substitutes listed beside it.',
  blurb:'A starting eleven on a full-size field',
  intro:['11v11 is the full game, played from U13 in the US and by adults everywhere. Eleven names are a lot to read out before kick-off; a sheet on the bench or a picture in the group chat the night before saves the talk for what matters.',
   'The dots carry the numbers coaches use as position names (6 for the holding midfielder, 9 for the striker). They are a custom, not a rule, so the sheet shows the player’s name under each one and you can ignore the numbers if your team does not use them.'],
  faq:[{q:'Which 11v11 formations can I build?',a:'The 4-3-3, 4-4-2, 4-2-3-1 and 3-5-2. Each one links to a guide page with roles, strengths and weak spots.'},
   {q:'Do the numbers on the dots have to match shirt numbers?',a:'No. The numbers 1 to 11 are a coaching custom for naming positions. Players can wear any shirt number.'},
   {q:'Can adult and school teams use it?',a:'Yes. It is free for any team, club or school. The picture and the printed sheet carry a small futbolisland.app credit.'}]},
 {kind:'lineup',slug:'futsal-lineup-builder',path:'/tools/futsal-lineup-builder',format:'futsal',crumb:'Futsal lineup builder',title:'Futsal Lineup Builder: Free Printable Lineup Sheet',h1:'Futsal lineup builder',
  description:'Build a futsal lineup in a 2-2, a 1-2-1 diamond or a 3-1 on a real futsal court. Type names, swap players and subs, then print or share it. Free.',
  lead:'Set your goalkeeper and four court players on a futsal court in a 2-2, a 1-2-1 diamond or a 3-1, and list the rest of the squad as rolling substitutes.',
  blurb:'Five starters and rolling subs on a futsal court',
  intro:['Futsal is the five-a-side indoor form of football (soccer): a goalkeeper and four court players, a smaller ball that stays on the floor, and changes on the fly. Because players rotate so often, the lineup is really a list of who starts and who comes on first.',
   'Use the bench as your order of substitutes: the first name is the first one on. Build one lineup for each half and keep both links.'],
  faq:[{q:'What do fixo, ala and pivot mean?',a:'They are the futsal positions. The fixo is the last court player in front of the goalkeeper, the two alas play wide and the pivot plays highest, with their back to goal.'},
   {q:'Which futsal formation is easiest for beginners?',a:'The 2-2: two players at the back and two in front. Move to the 1-2-1 diamond when the players can pass and move.'},
   {q:'How many substitutes can a futsal team use?',a:'Futsal uses rolling substitutions, so players go off and come back many times. The size of the squad is set by your league; check its rules.'}]},
];
export type GameLength={label:string;ages:string;periods:number;periodMin:number};
/** Typical US youth game lengths, read from the age-group chart in lib/site/sizes.ts (the one sourced table; never retyped). */
export function gameLengths(format:GuideFormat):GameLength[]{
 const t=chartBySlug('soccer-age-groups')?.tables[0],out:GameLength[]=[];if(!t)return out;
 const game=t.head.indexOf('Game'),len=t.head.indexOf('Game length');
 for(const r of t.rows){if(r[game]!==format)continue;const m=/^(\d+) (halves|quarters) of (\d+) min$/.exec(r[len]);if(!m)continue;
  const last=out[out.length-1];if(last&&last.label===r[len])last.ages=`${last.ages.split(' to ')[0]} to ${r[0]}`;else out.push({label:r[len],ages:r[0],periods:Number(m[1]),periodMin:Number(m[3])});}
 return out;
}
export type PlannerPage={kind:'planner';slug:string;path:string;format?:Exclude<GuideFormat,'futsal'>;crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;intro:string[];faq:Faq[]};
export const PLANNER_PAGES:readonly PlannerPage[]=[
 {kind:'planner',slug:'soccer-playing-time-calculator',path:PLANNER_PATH,crumb:'Playing time calculator',title:'Soccer Playing Time Calculator: Fair Sub Rotation',h1:'Soccer playing time calculator',
  description:'Free soccer playing time calculator. Enter your players and game length and get a fair substitution rotation with equal minutes to print or paste in chat.',
  lead:'Tell it how many players came, how many play at once and how long the game is. It gives you a substitution plan in which every player gets the same share of the game, to within one change.',
  blurb:'A fair substitution plan with equal minutes for every player',
  intro:['Sharing minutes fairly in your head, with a game going on in front of you, is hard. Nine children, seven places, two halves: who has sat out twice? This planner does the arithmetic before the match, so on the side line you only read the next line of the table.',
   'It works for any game: choose 7v7, 9v9, 11v11 or futsal, or type your own numbers for a tournament with short games.'],
  faq:[{q:'How does the calculator keep playing time equal?',a:'It cuts the game into equal blocks, one for each change, and gives every player the same number of blocks. When the numbers do not divide evenly, some players get one block more than others, never two.'},
   {q:'What if a player does not turn up?',a:'Change the number of players and the plan is made again at once. It takes a few seconds on a phone at the field.'},
   {q:'Should the goalkeeper rotate too?',a:'With young players, yes if you can: it lets every child try the position and keeps the minutes equal. Choose “a new goalkeeper each period” and the keeper changes at the breaks. If one child stays in goal, they play the whole game and the others share the rest.'},
   {q:'Are the names I type saved anywhere?',a:'Only in your own browser. Nothing is sent to a server. Names are optional: the plan works with “Player 1, Player 2” as well.'}]},
 {kind:'planner',slug:'7v7-substitution-rotation',path:'/tools/7v7-substitution-rotation',format:'7v7',crumb:'7v7 substitution rotation',title:'7v7 Soccer Substitution Rotation: Equal-Time Planner',h1:'7v7 soccer substitution rotation',
  description:'A 7v7 soccer substitution rotation for 8 to 14 players. Enter who came and get a fair plan with equal playing time, ready to print or paste in a team chat.',
  lead:'Seven on the field and a bench of excited eight- and nine-year-olds. Enter how many players you have and get a 7v7 substitution rotation in which everyone plays the same amount, to within one change.',
  blurb:'Equal playing time for a 7v7 squad of any size',
  intro:['7v7 is played at U9 and U10 in the US, usually as two halves of 25 minutes. With changes every five minutes that is ten blocks of play to share out. A squad of ten gets seven blocks each; a squad of fourteen gets five each, which is exactly half the game.',
   'The plan starts with those numbers already filled in. Change the game length if your league or tournament plays shorter games.'],
  faq:[{q:'How often should I substitute in 7v7?',a:'Every five to eight minutes suits most U9 and U10 teams. Shorter turns keep children fresh and waiting times short; longer turns give them time to settle into the game.'},
   {q:'How do I rotate ten players in 7v7?',a:'Three players sit out in each block. In a ten-block game every player is on for seven blocks and off for three, and nobody sits out twice in a row.'},
   {q:'When am I allowed to make the changes?',a:'Most youth leagues allow changes only when play has stopped, and some only at certain stoppages. Treat the times as targets and change at the next stoppage your league allows.'}]},
 {kind:'planner',slug:'9v9-substitution-rotation',path:'/tools/9v9-substitution-rotation',format:'9v9',crumb:'9v9 substitution rotation',title:'9v9 Soccer Substitution Rotation: Equal-Time Planner',h1:'9v9 soccer substitution rotation',
  description:'A 9v9 soccer substitution rotation for 10 to 18 players. Enter who came and get a fair plan with equal playing time, ready to print or paste in a chat.',
  lead:'Nine on the field, and a squad that may be twelve one week and fifteen the next. Enter the number that came and get a 9v9 substitution rotation that shares the game equally.',
  blurb:'Equal playing time for a 9v9 squad of any size',
  intro:['9v9 is played at U11 and U12 in the US, usually as two halves of 30 minutes. Players at this age can hold a position for longer, so many coaches change every seven or ten minutes instead of every five. The planner cuts each half into equal blocks from the interval you choose.',
   'Eleven- and twelve-year-olds notice who plays more. A printed plan, shown to the team before kick-off, ends most of the arguments before they begin.'],
  faq:[{q:'How often should I substitute in 9v9?',a:'Every seven to ten minutes is common at U11 and U12. That gives three or four blocks in a 30-minute half.'},
   {q:'How do I share time between twelve players in 9v9?',a:'Three players sit out in each block. Over a game of six ten-minute blocks, some players are on for four blocks and some for five. The planner picks who gets the extra block; swap the names next week so it evens out over the season.'},
   {q:'Does the plan keep the same goalkeeper?',a:'You choose. One goalkeeper for the whole game, or a new goalkeeper each period so that more players learn the position.'}]},
];
export const TOOLS_HUB={path:TOOLS_PATH,crumb:'Coach tools',title:'Free Soccer Coaching Tools: Lineups, Subs, Printables',h1:'Free soccer coaching tools',
 description:'Free tools for youth soccer coaches: a lineup builder, a fair playing time calculator, blank field diagrams and formation cheat sheets. No sign-up, no ads.',
 lead:'A lineup builder, a fair playing-time planner and printable field diagrams for volunteer coaches of 7v7, 9v9, 11v11 and futsal teams. Free, with no account and nothing to install.',
 blurb:'A lineup builder, a fair playing-time planner and printable field diagrams for coaches',
 faq:[{q:'Who are these soccer coaching tools for?',a:'Volunteer and youth coaches, physical education teachers and parents who help a team of children aged about 7 to 12. Adult teams can use them too.'},
  {q:'Do the tools collect any information?',a:'No. Player names and lineups stay in your own browser. Nothing you type is sent to Futbol Island, and there is no account to create.'},
  {q:'Can I share the printables with my club?',a:'Yes. They are free to print and share for teams, clubs and schools. Each sheet carries a small futbolisland.app credit; please leave it on.'},
  {q:'Do the tools work on a phone?',a:'Yes. They are built for a phone held in one hand at the side of a field, and they also work on tablets and computers.'}] as Faq[]};
export const PRINTABLES_HUB={path:PRINTABLES_HUB_PATH,crumb:'Field diagrams',title:'Blank Soccer Field Diagrams: Free Printable Templates',h1:'Blank soccer field diagrams to print',
 description:'Free printable soccer field diagrams: blank 7v7, 9v9, 11v11 and futsal templates in portrait and landscape, formation cheat sheets and a positions chart.',
 lead:`Blank soccer field templates for 7v7, 9v9, 11v11 and futsal, formation cheat sheets and a positions chart: ${PRINT_FILES.length} sheets, each as a PNG and an SVG, free to print.`,
 blurb:`${PRINT_FILES.length} printable sheets: blank fields, formation cheat sheets and a positions chart`,
 faq:[{q:'Are the soccer field templates free to use?',a:'Yes. They are free to print and share for teams, clubs and schools. Please keep the small futbolisland.app credit on the sheet.'},
  {q:'Should I download the PNG or the SVG?',a:'Take the PNG to print at home or to drop into a document or a slide. Take the SVG if you want to edit the diagram in a drawing program or print it very large: it stays sharp at any size.'},
  {q:'Will the sheets print on A4 paper?',a:'Yes. They are drawn for US Letter; choose “fit to page” in the print window and they fill an A4 page with a slightly wider margin.'},
  {q:'Why is a 7v7 field drawn differently from a full-size field?',a:'Because it is a different field, not a smaller copy. In the US a 7v7 field has build-out lines and its own penalty area size. Each template here keeps the markings of its own game.'}] as Faq[]};
export type ToolPage={path:string;name:string;title:string;description:string;blurb:string;hub?:boolean;image?:string;kind:'hub'|'lineup'|'planner'|'printables'|'printable'};
const lineupImage=(p:LineupPage)=>formationImg(DEFAULT_FORMATION[p.format??'7v7']);
const PLANNER_IMAGE:Record<string,string>={'7v7':formationImg('7v7-3-2-1'),'9v9':formationImg('9v9-3-3-2')};
export const plannerImage=(p:PlannerPage)=>PLANNER_IMAGE[p.format??'']??formationImg('7v7-2-2-2');
export const printableImage=(p:Printable)=>fileUrl(p.files[0].name,'png');
export const TOOL_PAGES:readonly ToolPage[]=[
 {path:TOOLS_HUB.path,name:TOOLS_HUB.h1,title:TOOLS_HUB.title,description:TOOLS_HUB.description,blurb:TOOLS_HUB.blurb,hub:true,kind:'hub',image:formationImg('9v9-3-2-3')},
 ...LINEUP_PAGES.map((p,i)=>({path:p.path,name:p.h1,title:p.title,description:p.description,blurb:p.blurb,hub:i===0,kind:'lineup' as const,image:lineupImage(p)})),
 ...PLANNER_PAGES.map((p,i)=>({path:p.path,name:p.h1,title:p.title,description:p.description,blurb:p.blurb,hub:i===0,kind:'planner' as const,image:plannerImage(p)})),
 {path:PRINTABLES_HUB.path,name:PRINTABLES_HUB.h1,title:PRINTABLES_HUB.title,description:PRINTABLES_HUB.description,blurb:PRINTABLES_HUB.blurb,hub:true,kind:'printables',image:fileUrl('11v11-soccer-field-blank-landscape','png')},
 ...PRINTABLES.map(p=>({path:p.path,name:p.h1,title:p.title,description:p.description,blurb:p.blurb,kind:'printable' as const,image:printableImage(p)})),
];
/** The pages the lesson hubs' "More to learn" list and llms.txt name (the tools hub and the three main tools). */
export const TOOL_HUBS=TOOL_PAGES.filter(t=>t.hub);
export const toolCrumbs=(...tail:{name:string;path:string}[])=>[{name:'Home',path:'/'},{name:TOOLS_HUB.crumb,path:TOOLS_HUB.path},...tail];
export const lineupPage=(slug:string)=>LINEUP_PAGES.find(p=>p.slug===slug);
export const plannerPage=(slug:string)=>PLANNER_PAGES.find(p=>p.slug===slug);
export const onFieldFor=(f:GuideFormat)=>PLAYERS_PER_TEAM[f];
/* ---- JSON-LD ---- */
/** A free browser tool. No ratings or reviews: none exist, and none are invented. */
export const webAppLd=(o:{name:string;path:string;description:string;image?:string;features:string[]})=>({'@context':'https://schema.org','@type':'WebApplication',name:o.name,url:abs(o.path),description:o.description,
 applicationCategory:'SportsApplication',operatingSystem:'Any (web browser)',browserRequirements:'Requires JavaScript',inLanguage:'en',isAccessibleForFree:true,
 offers:{'@type':'Offer',price:0,priceCurrency:'USD'},featureList:o.features,...(o.image?{image:abs(o.image),screenshot:abs(o.image)}:{}),
 audience:{'@type':'Audience',audienceType:'Youth soccer coaches, teachers and parents'},publisher:PUBLISHER,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'}});
const LICENCE_URL=`${PRINTABLES_HUB_PATH}#licence`;
export const imageLd=(o:{name:string;file:string;description:string;width:number;height:number})=>({'@type':'ImageObject',name:o.name,contentUrl:abs(fileUrl(o.file,'png')),encodingFormat:'image/png',width:o.width,height:o.height,
 description:o.description,license:abs(LICENCE_URL),acquireLicensePage:abs(LICENCE_URL),creditText:SITE_NAME,copyrightNotice:SITE_NAME,creator:PUBLISHER});
/** A printable: a free CreativeWork whose pictures are ImageObjects with the licence and the credit. */
export const printableLd=(p:Printable)=>({'@context':'https://schema.org','@type':'CreativeWork',name:p.h1,url:abs(p.path),description:p.description,inLanguage:'en',isAccessibleForFree:true,
 learningResourceType:'Printable worksheet',datePublished:TOOLS_UPDATED,dateModified:TOOLS_UPDATED,license:abs(LICENCE_URL),creator:PUBLISHER,publisher:PUBLISHER,isPartOf:{'@type':'WebSite',name:SITE_NAME,url:SITE_URL+'/'},
 image:p.files.map(f=>{const s=f.sheet();return imageLd({name:s.title,file:f.name,description:s.desc,width:s.w*1.5,height:s.h*1.5});})});
