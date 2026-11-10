import {formationBySlug,formationsIn} from '../formations';
import {POSITIONS} from '../positions';
import {GUIDE_FORMATS,PITCH,place,PLAYERS_PER_TEAM,type GuideFormat} from '../pitch';
import {CREDIT,dotItems,fieldItems,INK,LETTER,LICENCE,wrapText,type Item,type Sheet} from './sheet';
/**
 * The printables (Nov 10 2026, /tools/soccer-field-diagrams): blank field templates for 7v7, 9v9, 11v11 and futsal (upright and
 * on their side; plain, with thirds, with zones, and 7v7 with or without build-out lines), one formation cheat sheet per
 * format and a positions-and-numbers sheet. Every sheet is data (lib/site/tools/sheet.ts), so its page preview, its .svg and
 * its .png are the same drawing. Black on white for printers, with the licence line and a small futbolisland.app credit on the
 * sheet itself, so a copy passed around a club still points back.
 * Facts: field proportions and markings from lib/site/pitch.ts; ages per format, build-out lines and the futsal court from the
 * sources listed in lib/site/formations.ts and lib/site/rules.ts (U.S. Soccer small-sided standards, IFAB, FIFA Futsal Laws).
 * Nothing new was researched here; the pages repeat only what those modules already state.
 */
export const PRINTABLES_HUB_PATH='/tools/soccer-field-diagrams';
export const FILES_DIR=`${PRINTABLES_HUB_PATH}/files`;
export const fileUrl=(name:string,ext:'svg'|'png')=>`${FILES_DIR}/${name}.${ext}`;
export type Variant='blank'|'no-build-out-lines'|'thirds'|'zones';
export type PrintFile={name:string;label:string;note:string;sheet:()=>Sheet};
export type Printable={slug:string;path:string;kind:'template'|'cheat-sheet'|'positions';format?:GuideFormat;crumb:string;title:string;h1:string;description:string;lead:string;blurb:string;
 use:string[];files:PrintFile[];links:{path:string;name:string;line:string}[]};
const fieldName=(f:GuideFormat)=>f==='futsal'?'futsal court':`${f} soccer field`;
const base=(f:GuideFormat)=>f==='futsal'?'futsal-court':`${f}-soccer-field`;
const footer=(w:number,h:number):Item[]=>[{t:'text',x:40,y:h-30,text:LICENCE,size:11,fill:INK.soft},{t:'text',x:w-40,y:h-30,text:CREDIT,size:13,fill:INK.ink,weight:700,anchor:'end'}];
const VARIANT_WORD:Record<Variant,string>={blank:'blank','no-build-out-lines':'without build-out lines',thirds:'with thirds',zones:'with zones'};
export function templateSheet(format:GuideFormat,variant:Variant,landscape:boolean):Sheet{
 const {w,h}=landscape?LETTER.landscape:LETTER.portrait,name=fieldName(format);
 const field=fieldItems(format,{x:40,y:64,w:w-80,h:h-128},{landscape,theme:INK,sw:2.5,thirds:variant==='thirds',zones:variant==='zones',buildOut:variant!=='no-build-out-lines'});
 const marks=variant==='thirds'?' Two dashed lines split it into a defending, a middle and an attacking third.':variant==='zones'?' Dashed lines split it into thirds and into channels along its length.'
  :PITCH[format].buildOut&&variant==='blank'?' The two dashed lines are the build-out lines.':'';
 return {w,h,bg:INK.page,title:`Blank ${name} template, ${VARIANT_WORD[variant]}`,
  desc:`An empty ${name} seen from above, ${landscape?'drawn on its side with the goals left and right':'drawn upright with a goal at the top and the bottom'}, with its penalty areas, halfway line and center circle.${marks}`,
  items:[{t:'text',x:40,y:42,text:`${name[0].toUpperCase()+name.slice(1)}${variant==='blank'?'':` · ${VARIANT_WORD[variant].replace('with ','')}`}`,size:16,fill:INK.soft,weight:700},...field.items,...footer(w,h)]};
}
const VARIANTS=(f:GuideFormat):Variant[]=>PITCH[f].buildOut?['blank','no-build-out-lines','thirds','zones']:['blank','thirds','zones'];
const VARIANT_LABEL:Record<Variant,string>={blank:'Blank','no-build-out-lines':'No build-out lines',thirds:'Thirds',zones:'Zones'};
const templateFiles=(f:GuideFormat):PrintFile[]=>VARIANTS(f).flatMap(v=>[false,true].map(landscape=>({name:`${base(f)}-${v}-${landscape?'landscape':'portrait'}`,
 label:`${VARIANT_LABEL[v]}, ${landscape?'landscape':'portrait'}`,note:v==='blank'?(PITCH[f].buildOut?'Official markings with both build-out lines':'Official markings only'):v==='thirds'?'Defending, middle and attacking thirds':v==='zones'?'Thirds and channels for teaching space':'For leagues that play 7v7 without them',
 sheet:()=>templateSheet(f,v,landscape)})));
const shapeName=(shape:string)=>shape==='1-2-1'?'1-2-1 diamond':shape;
export function cheatSheet(format:GuideFormat):Sheet{
 const {w,h}=LETTER.portrait,list=formationsIn(format),cols=list.length===4?2:3,rows=Math.ceil(list.length/cols),futsal=format==='futsal';
 const head=futsal?'Futsal formations':`${format} soccer formations`,items:Item[]=[{t:'text',x:40,y:70,text:head,size:36,fill:INK.ink,weight:700},
  {t:'text',x:40,y:100,text:futsal?'Five players: the numbers count the four court players from the back. The goalkeeper is extra.':`${PLAYERS_PER_TEAM[format]} players: the numbers count the outfield players from the defense forward. The goalkeeper is extra.`,size:15,fill:INK.soft}];
 const gx=40,gy=126,gw=w-80,gh=h-gy-60,cw=gw/cols,ch=Math.min(gh/rows,rows===1?520:999);
 list.forEach((f,i)=>{const x=gx+(i%cols)*cw,y=gy+Math.floor(i/cols)*ch,field=fieldItems(format,{x:x+12,y:y+44,w:cw-24,h:ch-104},{theme:INK,sw:1.8});
  const r=Math.max(9,Math.min(15,field.w/15));
  items.push({t:'text',x:x+cw/2,y:y+30,text:shapeName(f.shape),size:24,fill:INK.ink,weight:700,anchor:'middle'},...field.items);
  place(f.lines).forEach((s,n)=>{const [px,py]=field.at(s.x,s.y);items.push(...dotItems(px,py,{n:s.n,keeper:n===0,r,theme:INK}));});
  wrapText(f.best,Math.floor(cw/7.2),2).forEach((ln,n)=>items.push({t:'text',x:x+cw/2,y:y+ch-40+n*16,text:ln,size:13,fill:INK.soft,anchor:'middle'}));});
 items.push(...footer(w,h));
 return {w,h,bg:INK.page,title:`${head} cheat sheet`,desc:`${list.length} ${futsal?'futsal':format} formations on one page, each drawn on a small ${fieldName(format)} seen from above: ${list.map(f=>shapeName(f.shape)).join(', ')}.`,items};
}
export function positionsSheet():Sheet{
 const {w,h}=LETTER.portrait,f=formationBySlug('11v11-4-3-3')!,spots=place(f.lines),items:Item[]=[{t:'text',x:40,y:70,text:'Soccer positions and numbers',size:36,fill:INK.ink,weight:700},
  {t:'text',x:40,y:100,text:'The eleven positions of a 4-3-3 with the numbers 1 to 11 that coaches use for them.',size:15,fill:INK.soft}];
 const field=fieldItems('11v11',{x:40,y:130,w:470,h:h-200},{theme:INK,sw:2.2});items.push(...field.items);
 spots.forEach((s,n)=>{const [x,y]=field.at(s.x,s.y);items.push(...dotItems(x,y,{n:s.n,label:s.label,keeper:n===0,r:19,theme:INK,size:13}));});
 const name=(slug?:string)=>POSITIONS.find(p=>p.slug===slug)?.name??'';
 const side=(l:string)=>/^L/.test(l)&&l!=='LCB'&&l!=='LCM'?'Left ':/^R/.test(l)&&l!=='RCB'&&l!=='RCM'?'Right ':'';
 let y=160;const x=540;items.push({t:'text',x,y,text:'Number, short name, position',size:15,fill:INK.soft,weight:700});
 for(const s of [...spots].sort((a,b)=>Number(a.n)-Number(b.n))){y+=42;const full=side(s.label)+name(s.pos);
  items.push({t:'circle',cx:x+16,cy:y-6,r:16,fill:s.n==='1'?INK.keeper:INK.dot,stroke:INK.ink,sw:2},{t:'text',x:x+16,y:y,text:s.n,size:16,fill:INK.ink,weight:700,anchor:'middle'},
   {t:'text',x:x+44,y,text:s.label,size:17,fill:INK.ink,weight:700},{t:'text',x:x+100,y,text:full[0].toUpperCase()+full.slice(1).toLowerCase(),size:17,fill:INK.ink});}
 y+=54;for(const ln of wrapText('The numbers are a common coaching custom, not a rule. Players can wear any shirt number, and the custom changes from country to country.',36)){items.push({t:'text',x,y,text:ln,size:14,fill:INK.soft});y+=19;}
 items.push(...footer(w,h));
 return {w,h,bg:INK.page,title:'Soccer positions and numbers sheet',desc:`An 11v11 soccer field seen from above with a 4-3-3 formation. Each player dot carries its number and short name: ${spots.map(s=>`${s.n} ${s.label}`).join(', ')}. A list beside the field gives the full position name for each number.`,items};
}
const AGES:Record<GuideFormat,string>={'7v7':'U9 and U10','9v9':'U11 and U12','11v11':'U13 and older',futsal:'every age'};
const FORMATION_LINK=(f:GuideFormat)=>f==='futsal'?{path:'/learn/futsal-for-kids',name:'Futsal lessons for kids',line:'Every futsal lesson, grouped by topic'}:{path:`/learn/${f}-soccer-formations`,name:`${f} soccer formations`,line:`Shapes for ${AGES[f]} teams, each with a diagram`};
const BUILDER=(f:GuideFormat)=>({path:`/tools/${f}-lineup-builder`,name:`${f==='futsal'?'Futsal':f} lineup builder`,line:'Put your players’ names on this field'});
const TEMPLATE_USE:Record<GuideFormat,string[]>={
 '7v7':['A 7v7 field is the small-sided field US teams play on at U9 and U10. It is not a shrunken full-size field: it has its own penalty area and two dashed build-out lines, one in each half. Print the blank sheet and draw on it with a pen at practice, or slide it into a plastic sleeve and use a dry-erase marker so it lasts the season.',
  'Use the portrait sheet when you talk about your own team: you attack up the page, the way the players see it from their goal. Use the landscape sheet for the whole game seen from the side line, with both teams. The thirds sheet helps to explain where to dribble and where to pass safely. The zones sheet marks the wide channels, so a wide player can see “my lane” at a glance.',
  'Some leagues play 7v7 without build-out lines, so there is a sheet with no dashed lines too. Check your league’s rules before you teach the line.'],
 '9v9':['A 9v9 field is the bridge between the small-sided game and the full game, played at U11 and U12 in the US. Offside is called from the halfway line here, so a clean diagram matters: players need to see the line they must stay level with. Print a stack before the season and keep them in the kit bag with a pencil.',
  'The blank sheet is for lineups, set pieces and anything you draw live. Draw corner kicks on the portrait sheet, with your goal at the bottom. The thirds sheet is the one for talking about when to play out from the back and when to press. The zones sheet marks the wide channels beside the penalty area, which helps wide players in a 3-2-3 hold their width.',
  'Hand a copy to each line of the team at half-time and ask them to mark where they were standing. Children remember a picture they drew themselves.'],
 '11v11':['This is the full-size field, with the penalty area, goal area, penalty arc, center circle and corner arcs in proportion. US teams move to 11v11 at U13. Coaches print it for team talks, for set-piece plans and for players’ notebooks; teachers use it for physical education worksheets.',
  'The portrait sheet suits one team’s shape, attacking up the page. The landscape sheet suits a whole-game picture or a broadcast-style view. The thirds sheet splits the field into defending, middle and attacking thirds. The zones sheet adds five channels along the field: two wide channels, two inside channels in line with the edge of the goal area, and the center. Those five channels are a common coaching way to talk about space, not a marking on a real field.',
  'Laminate one copy and it becomes a pocket tactics board for the bench.'],
 futsal:['A futsal court is not a small soccer field. The penalty area is a rounded shape drawn six meters from the goal, there are two penalty marks in each half, and the lines are close enough that every player is always near the ball. This template keeps those markings in proportion, so a rotation drawn on paper looks the way it does on the floor.',
  'Use the portrait sheet for your own four court players and goalkeeper, attacking up the page. Use the landscape sheet when you draw both teams, or a kick-in routine from the touchline. The thirds sheet is helpful for pressing rules (“we press in their third”). The zones sheet cuts the court into nine boxes, which is a simple way to teach the ala, fixo and pivot where their area starts and ends.',
  'Futsal moves fast, so draw one idea per sheet and let the players hold it.'],
};
const templates:Printable[]=GUIDE_FORMATS.map(f=>{const name=fieldName(f),cap=name[0].toUpperCase()+name.slice(1),slug=`blank-${base(f)}`;return {slug,path:`${PRINTABLES_HUB_PATH}/${slug}`,kind:'template',format:f,
 crumb:`Blank ${f==='futsal'?'futsal court':`${f} field`}`,title:f==='futsal'?'Blank Futsal Court Template: Free Printable Diagram':`Blank ${f} Soccer Field Template: Free Printable`,
 h1:`Blank ${name} template`,
 description:f==='futsal'?'A blank futsal court diagram to print: portrait or landscape, plain, with thirds or with zones. Free SVG and PNG downloads for coaches and teachers.'
  :`A blank ${f} soccer field diagram to print: portrait or landscape, plain, with thirds or with zones. Free SVG and PNG downloads for coaches and teachers.`,
 lead:`${cap} templates you can print, draw on and share: ${VARIANTS(f).length*2} sheets, each as a page-sized PNG and a sharp SVG.`,
 blurb:`${VARIANTS(f).length*2} blank ${name} sheets: plain, thirds and zones`,use:TEMPLATE_USE[f],files:templateFiles(f),
 links:[BUILDER(f),FORMATION_LINK(f),{path:`${PRINTABLES_HUB_PATH}/${f==='futsal'?'futsal':`${f}-soccer`}-formations-cheat-sheet`,name:`${f==='futsal'?'Futsal':f} formations cheat sheet`,line:'Every shape of this game on one page'},{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'}]};});
const CHEAT_USE:Record<GuideFormat,string[]>={
 '7v7':['Four 7v7 shapes on one page: 2-3-1, 3-2-1, 2-2-2 and 3-1-2. Each small field shows where the seven players start, with the goalkeeper in the lighter dot. Tape it inside your clipboard, or give one to every family at the first practice so parents know what “two-three-one” means when they hear it from the side line.',
  'A formation is only where players start. At U9 and U10 the shape matters less than the habits inside it: spread out when your team has the ball and squeeze together when it does not. Use the sheet to pick one shape, stay with it for a few weeks, and let every child try every line. The line under each shape says who it suits.'],
 '9v9':['Five 9v9 shapes on one page: 3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 and 4-3-1. Nine players leave room for three real lines, so this is the age when children first learn to play as a back line, a midfield and an attack. The sheet lets you compare the shapes side by side before you choose.',
  'Coaches use it in two ways. Before the season, to pick a shape that fits the squad: do you have two natural strikers, or wide players who love to run? During the season, to show the team how the next opponent may line up. Print one for your assistant too, so you both use the same words on match day.'],
 '11v11':['Four full-game shapes on one page: 4-3-3, 4-4-2, 4-2-3-1 and 3-5-2, each on a small full-size field with the customary numbers on the dots. It is a quick answer for a player who asks “where does the 6 play?” and a handy page for a team that has just moved up from 9v9 at U13.',
  'Put it in the players’ notebooks and ask them to circle their position in each shape. They will see that a fullback, a center mid and a striker exist in every one, and that only a few jobs change. That makes it easier to switch shape in the middle of a season without starting again.'],
 futsal:['Three futsal shapes on one page: the 2-2 box, the 1-2-1 diamond and the 3-1. A futsal team has four court players and a goalkeeper, and the court players rotate all the time, so a shape in futsal is a starting picture and a set of passing lanes more than a fixed set of positions.',
  'Coaches print it for the first session of a winter futsal season, when outdoor players meet the fixo, the alas and the pivot for the first time. Start with the 2-2, which is the simplest to explain, then show the diamond when the players can pass and move. The line under each shape says who it suits.'],
};
const cheats:Printable[]=GUIDE_FORMATS.map(f=>{const fut=f==='futsal',n=formationsIn(f).length,slug=`${fut?'futsal':`${f}-soccer`}-formations-cheat-sheet`,word=fut?'Futsal':`${f} soccer`;return {slug,path:`${PRINTABLES_HUB_PATH}/${slug}`,kind:'cheat-sheet',format:f,
 crumb:`${fut?'Futsal':f} cheat sheet`,title:`${fut?'Futsal':`${f} Soccer`} Formations Cheat Sheet (Printable)`,h1:`${word} formations cheat sheet`,
 description:`All ${n} ${fut?'futsal':f} ${fut?'':'soccer '}formations on one printable page, each drawn on a small ${fut?'court':'field'} with player numbers. A free PNG and SVG for coaches and parents.`,
 lead:`Every ${fut?'futsal':`${f} soccer`} formation on Futbol Island, drawn on one page you can print: ${formationsIn(f).map(x=>shapeName(x.shape)).join(', ')}.${fut?' Futsal is the five-a-side indoor game.':''}`,
 blurb:`${n} ${fut?'futsal':f} shapes on one page`,use:CHEAT_USE[f],
 files:[{name:slug,label:'Cheat sheet, portrait',note:'US Letter; also prints well on A4 with “fit to page”',sheet:()=>cheatSheet(f)}],
 links:[...formationsIn(f).map(x=>({path:x.path,name:`${x.name} formation`,line:x.best})),FORMATION_LINK(f),BUILDER(f)]};});
const positions:Printable={slug:'soccer-positions-and-numbers',path:`${PRINTABLES_HUB_PATH}/soccer-positions-and-numbers`,kind:'positions',format:'11v11',crumb:'Positions and numbers',
 title:'Soccer Positions and Numbers: Printable Chart (1-11)',h1:'Soccer positions and numbers chart',
 description:'A printable chart of soccer positions and their numbers, 1 to 11, on a field: goalkeeper, backs, midfielders, wingers and striker. Free PNG and SVG.',
 lead:'The eleven soccer positions on one page, each with the number coaches use for it, from the goalkeeper (1) to the left winger (11).',
 blurb:'The numbers 1 to 11 on a field, with every position name',
 use:['When a coach says “play it to the six” or “our nine drops in”, they are using numbers as names for positions. This sheet shows the custom most coaches follow: 1 for the goalkeeper, 2 and 3 for the fullbacks, 4 and 5 for the center backs, 6, 8 and 10 in midfield, 7 and 11 on the wings and 9 for the striker. It is drawn in a 4-3-3, the shape where every number has an obvious home.',
  'Print it for players who are moving up to 11v11, for parents who are new to the game, or for a classroom wall. Ask players to find their own number, then the number of the teammate they pass to most. The numbers are a coaching custom, not a rule: a player can wear any shirt number, and some countries use the numbers differently. That is why the sheet says so in the corner.'],
 files:[{name:'soccer-positions-and-numbers',label:'Positions chart, portrait',note:'US Letter; also prints well on A4 with “fit to page”',sheet:positionsSheet}],
 links:[{path:'/learn/soccer-positions',name:'Soccer positions explained',line:'Every position, what it does and how to play it'},...POSITIONS.slice(0,4).map(p=>({path:p.path,name:p.name,line:'What this position does'})),{path:'/learn/soccer-formations/11v11-4-3-3',name:'4-3-3 (11v11) formation',line:'The shape on this sheet'},BUILDER('11v11')]};
export const PRINTABLES:readonly Printable[]=[...templates,...cheats,positions];
export const printableBySlug=(slug:string)=>PRINTABLES.find(p=>p.slug===slug);
export const cheatSheetPath=(f:GuideFormat)=>cheats.find(c=>c.format===f)!.path;
/** Every downloadable file name (no extension); each exists as .svg and .png under FILES_DIR. */
export const PRINT_FILES:readonly PrintFile[]=PRINTABLES.flatMap(p=>p.files);
export const printFile=(name:string)=>PRINT_FILES.find(f=>f.name===name);
export const PRINT_FILE_NAMES:readonly string[]=PRINT_FILES.flatMap(f=>[`${f.name}.svg`,`${f.name}.png`]);
