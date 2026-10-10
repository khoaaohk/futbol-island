/**
 * The legends' prints (Oct 9 2026, user: "the museum is a playground for different styles … Japanese style"). Six original
 * ukiyo-e style woodblock prints, one legend per position, from the game's own player cards (lib/town/positionPlayers.json).
 * Each print shows that position's job as a move the visitor plays with a finger: drag the ball (or the player) along the brush
 * line and the move plays out. Pure data and maths, so tests/museum-exp-hall-of-fame.cjs can check it without a browser.
 *
 * Facts: ONE line per legend, each checked against the linked page (sources below). The jobs are the game's own position
 * teaching (lib/town/positionReference.json, 11v11), rewritten for a 7v7 reader. The pictures are original artwork in the style,
 * not copies of any print, and the figures are the game's bean characters redrawn in flat colour with a key-block outline.
 */
export type Pose={x:number;y:number;rot:number;arm:number;leg:number};
/** [t, x, y, rot°, arm°, kick°]: arm 0 = down, 90 = out, 170 = up; rot turns the body about the hips (a dive). t runs 0→1 under the
 *  finger; 1→END plays by itself once the move is done (the save, the cross, the shot). */
export type Key=[number,number,number,number,number,number];
export type BallKey=[number,number,number];
export type Scene='goal'|'wing'|'middle';
export type Kit={shirt:string;trim:string;shorts:string;socks:string;gloves?:string};
/** Which game the legend made their name in. Every position has one legend from each (Oct 9 2026: women and men, fairly). */
export type Game='women'|'men';
export type Legend={id:string;name:string;card:string;position:string;country:string;scene:Scene;game:Game;
 /** The position's move (two legends share each move): the id of the legend whose keyframes this print plays. */
 move:string;
 /** Which thing the finger drags along the brush line. */
 handle:'ball'|'player';
 sky:'ai'|'beni'|'kihada';kit:Kit;skin:string;hair:string;hairStyle:'short'|'buzz'|'medium'|'long'|'bun'|'bald';
 job:string;try:string;done:string;fact:string;source:{title:string;url:string};
 player:Key[];ball:BallKey[];others:{kind:'opp'|'mate'|'keeper';keys:Key[]}[]};
export const END=1.32;

const SUMI='#15110e',PAPER='#f6ecd4',AI='#1d3f86',KIHADA='#f0b81c',GREEN='#2f7d3f';
const BRAZIL:Kit={shirt:KIHADA,trim:GREEN,shorts:AI,socks:PAPER};
/** Skin and hair from the game's own appearance data for each player (lib/town/playerAppearance.json → PlayerArt's tones). */
const SKIN=['#f2c79b','#e8b381','#d99a6c','#c17a49','#9c5c33','#7a4726','#5a3620'],HAIR=['#111111','#2a1a0e','#4a2f18','#6b4423','#916a3d','#c79a4e','#e6cf94'];

const BASE:readonly Omit<Legend,'game'|'move'>[]=[
 {id:'yashin',name:'Lev Yashin',card:'Lev Yashin',position:'Goalkeeper',country:'Soviet Union',scene:'goal',handle:'player',sky:'ai',
  kit:{shirt:'#1e1b1d',trim:'#6d6a72',shorts:'#1e1b1d',socks:'#1e1b1d',gloves:'#f1e4c4'},skin:SKIN[0],hair:HAIR[2],hairStyle:'short',
  job:'The goalkeeper is the last line of defence: stop the shot, then start the attack with a calm pass.',
  try:'A shot flies at the top corner. Drag the keeper to dive and save it!',done:'Saved! Push off towards the ball, not after it.',
  fact:'Lev Yashin is still the only goalkeeper to win the Ballon d’Or, in 1963.',
  source:{title:'Wikipedia · Lev Yashin',url:'https://en.wikipedia.org/wiki/Lev_Yashin'},
  player:[[0,150,252,0,10,0],[.55,178,246,30,90,0],[1,204,238,72,165,10],[END,214,246,88,170,0]],
  ball:[[0,116,398],[.5,172,286],[1,226,176],[END,296,112]],others:[]},
 {id:'cafu',name:'Cafu',card:'Cafu',position:'Right-back',country:'Brazil',scene:'wing',handle:'ball',sky:'beni',
  kit:BRAZIL,skin:SKIN[4],hair:HAIR[0],hairStyle:'buzz',
  job:'A full-back defends their side of the pitch, then runs past the winger down the line to help the attack.',
  try:'Drag the ball up the touchline, past the defender, then let go to cross!',done:'Overlap and cross! Your run gives the team width.',
  fact:'Cafu played in three World Cup finals in a row: 1994, 1998 and 2002.',
  source:{title:'Wikipedia · Cafu',url:'https://en.wikipedia.org/wiki/Cafu'},
  player:[[0,196,404,0,20,0],[.5,226,330,0,30,0],[1,240,262,0,30,0],[1.08,242,258,-8,50,55],[END,240,256,0,30,0]],
  ball:[[0,210,404],[.5,238,328],[1,252,266],[END,108,214]],
  others:[{kind:'opp',keys:[[0,226,300,0,20,0],[.5,222,306,-12,40,0],[1,214,318,-20,30,0],[END,212,320,-20,30,0]]},
   {kind:'mate',keys:[[0,120,262,0,20,0],[1,112,234,0,30,0],[END,104,220,0,150,0]]}]},
 {id:'beckenbauer',name:'Franz Beckenbauer',card:'Franz Beckenbauer',position:'Centre-back',country:'West Germany',scene:'middle',handle:'player',sky:'ai',
  kit:{shirt:PAPER,trim:SUMI,shorts:SUMI,socks:PAPER},skin:SKIN[0],hair:HAIR[3],hairStyle:'medium',
  job:'A centre-back reads the danger early: step in front of the striker and win the ball.',
  try:'A pass is going to their striker. Drag the defender to step in and cut it out!',done:'Intercepted! Read the pass before it is played.',
  fact:'Franz Beckenbauer won the World Cup as West Germany’s captain in 1974 and as their coach in 1990.',
  source:{title:'Wikipedia · Franz Beckenbauer',url:'https://en.wikipedia.org/wiki/Franz_Beckenbauer'},
  player:[[0,182,360,0,20,0],[.6,166,318,0,40,0],[1,152,292,0,40,20],[END,162,338,0,25,0]],
  ball:[[0,86,300],[1,146,290],[END,160,344]],
  others:[{kind:'opp',keys:[[0,72,306,0,30,40],[.2,74,306,0,30,0],[END,80,300,0,40,0]]},
   {kind:'opp',keys:[[0,234,262,0,90,0],[1,226,266,0,120,0],[END,224,270,0,40,0]]}]},
 {id:'sawa',name:'Homare Sawa',card:'Homare Sawa',position:'Midfielder',country:'Japan',scene:'middle',handle:'ball',sky:'kihada',
  kit:{shirt:AI,trim:PAPER,shorts:PAPER,socks:AI},skin:SKIN[1],hair:HAIR[1],hairStyle:'medium',
  job:'A midfielder links defence and attack: look up and find the pass that splits the defenders.',
  try:'Drag the ball through the gap between the two defenders to your teammate!',done:'Through! One pass took two defenders out of the game.',
  fact:'Homare Sawa captained Japan to win the 2011 Women’s World Cup.',
  source:{title:'Wikipedia · Homare Sawa',url:'https://en.wikipedia.org/wiki/Homare_Sawa'},
  player:[[0,80,400,0,20,0],[.12,86,396,0,40,50],[.35,90,392,0,30,0],[1,94,384,0,60,0],[END,94,380,0,120,0]],
  ball:[[0,102,392],[.45,151,288],[1,174,228],[END,176,222]],
  others:[{kind:'opp',keys:[[0,116,288,0,20,0],[1,126,286,-10,40,0],[END,128,284,-10,40,0]]},
   {kind:'opp',keys:[[0,186,288,0,20,0],[1,178,286,10,40,0],[END,176,284,10,40,0]]},
   {kind:'mate',keys:[[0,236,282,0,30,0],[1,178,232,0,30,0],[END,176,226,0,30,30]]}]},
 {id:'garrincha',name:'Garrincha',card:'Garrincha',position:'Winger',country:'Brazil',scene:'wing',handle:'ball',sky:'beni',
  kit:BRAZIL,skin:SKIN[3],hair:HAIR[0],hairStyle:'short',
  job:'A winger stays wide, beats the defender one against one, then crosses or cuts inside.',
  try:'Drag the ball: fake one way, then burst past the defender down the line!',done:'Beaten! Sell the fake, then go the other way.',
  fact:'Garrincha won the World Cup with Brazil in 1958 and 1962.',
  source:{title:'Wikipedia · Garrincha',url:'https://en.wikipedia.org/wiki/Garrincha'},
  player:[[0,220,404,0,20,0],[.35,204,350,-10,40,0],[.65,236,318,12,40,0],[1,244,262,0,30,0],[1.08,246,258,-8,50,55],[END,244,256,0,30,0]],
  ball:[[0,230,396],[.35,212,344],[.65,248,312],[1,254,264],[END,110,214]],
  others:[{kind:'opp',keys:[[0,232,314,0,20,0],[.35,218,318,-22,50,0],[.65,214,322,-30,40,0],[END,216,326,-30,30,0]]},
   {kind:'mate',keys:[[0,118,262,0,20,0],[END,104,222,0,150,0]]}]},
 {id:'marta',name:'Marta',card:'Marta',position:'Striker',country:'Brazil',scene:'goal',handle:'ball',sky:'ai',
  kit:BRAZIL,skin:SKIN[3],hair:HAIR[0],hairStyle:'long',
  job:'A striker finishes chances: get free in the box and hit the target.',
  try:'Drag the ball into the top corner, away from the goalkeeper!',done:'Goal! Aim for the corner the keeper can’t reach.',
  fact:'Marta has scored 17 goals at Women’s World Cups, more than any other player.',
  source:{title:'Wikipedia · Marta (footballer)',url:'https://en.wikipedia.org/wiki/Marta_(footballer)'},
  player:[[0,126,378,0,20,0],[.12,140,352,0,40,55],[.3,144,346,0,40,10],[1,146,344,0,60,0],[END,146,340,0,165,0]],
  ball:[[0,152,350],[.5,104,250],[1,66,170],[END,74,196]],
  others:[{kind:'keeper',keys:[[0,150,252,0,30,0],[.6,160,250,20,90,0],[1,182,244,60,160,0],[END,196,250,84,170,0]]}]},
];

/** The six legends above made the moves; six more share them, so every position has a woman and a man (sources below). Each
 *  print is the same move in the legend's own colours. Living players: facts are their honours, nothing else. */
type Twin=Pick<Legend,'id'|'name'|'card'|'country'|'sky'|'kit'|'skin'|'hair'|'hairStyle'|'fact'|'source'>;
const twin=(of:string,t:Twin):Legend=>{const b=BASE.find(x=>x.id===of)!;return {...b,...t,game:WOMEN.has(t.id)?'women':'men',move:of};};
const WOMEN=new Set(['angerer','bronze','renard','sawa','martens','marta']);
const own=(b:Omit<Legend,'game'|'move'>):Legend=>({...b,game:WOMEN.has(b.id)?'women':'men',move:b.id});
const B=(id:string)=>own(BASE.find(x=>x.id===id)!);
/** Grouped by position (goal to goal); within each pair the order alternates, so neither game always comes first. */
export const LEGENDS:readonly Legend[]=[
 B('yashin'),
 twin('yashin',{id:'angerer',name:'Nadine Angerer',card:'Nadine Angerer',country:'Germany',sky:'kihada',
  kit:{shirt:'#3f7d4e',trim:'#15110e',shorts:'#15110e',socks:'#3f7d4e',gloves:'#f1e4c4'},skin:SKIN[0],hair:HAIR[5],hairStyle:'short',
  fact:'At the 2007 Women’s World Cup, Nadine Angerer did not let in a single goal, and Germany won it.',
  source:{title:'Wikipedia · Nadine Angerer',url:'https://en.wikipedia.org/wiki/Nadine_Angerer'}}),
 twin('cafu',{id:'bronze',name:'Lucy Bronze',card:'Lucy Bronze',country:'England',sky:'ai',
  kit:{shirt:PAPER,trim:AI,shorts:AI,socks:PAPER},skin:SKIN[1],hair:HAIR[1],hairStyle:'bun',
  fact:'Lucy Bronze won The Best FIFA Women’s Player award in 2020, as a defender.',
  source:{title:'Wikipedia · Lucy Bronze',url:'https://en.wikipedia.org/wiki/Lucy_Bronze'}}),
 B('cafu'),
 B('beckenbauer'),
 twin('beckenbauer',{id:'renard',name:'Wendie Renard',card:'Wendie Renard',country:'France',sky:'beni',
  kit:{shirt:AI,trim:PAPER,shorts:PAPER,socks:'#c8432f'},skin:SKIN[6],hair:HAIR[0],hairStyle:'long',
  fact:'Wendie Renard won the Women’s Champions League eight times with Lyon, from 2011 to 2022.',
  source:{title:'Wikipedia · Wendie Renard',url:'https://en.wikipedia.org/wiki/Wendie_Renard'}}),
 B('sawa'),
 twin('sawa',{id:'iniesta',name:'Andrés Iniesta',card:'Andrés Iniesta',country:'Spain',sky:'ai',
  kit:{shirt:'#c8102e',trim:KIHADA,shorts:AI,socks:AI},skin:SKIN[0],hair:HAIR[3],hairStyle:'bald',
  fact:'Andrés Iniesta scored the goal that won the 2010 World Cup final for Spain.',
  source:{title:'Wikipedia · Andrés Iniesta',url:'https://en.wikipedia.org/wiki/Andr%C3%A9s_Iniesta'}}),
 B('garrincha'),
 twin('garrincha',{id:'martens',name:'Lieke Martens',card:'Lieke Martens',country:'Netherlands',sky:'ai',
  kit:{shirt:'#ec7a1c',trim:PAPER,shorts:PAPER,socks:'#ec7a1c'},skin:SKIN[0],hair:HAIR[6],hairStyle:'long',
  fact:'Lieke Martens was named The Best FIFA Women’s Player in 2017, after the Netherlands won Euro 2017.',
  source:{title:'Wikipedia · Lieke Martens',url:'https://en.wikipedia.org/wiki/Lieke_Martens'}}),
 twin('marta',{id:'pele',name:'Pelé',card:'Pelé',country:'Brazil',sky:'kihada',
  kit:BRAZIL,skin:SKIN[5],hair:HAIR[0],hairStyle:'buzz',
  fact:'Pelé won the World Cup three times, in 1958, 1962 and 1970: more than any other player.',
  source:{title:'Wikipedia · Pelé',url:'https://en.wikipedia.org/wiki/Pel%C3%A9'}}),
 B('marta'),
];
/** The six positions, in gallery order, each with its two legends. */
export const POSITIONS:readonly {position:string;job:string;legends:readonly Legend[]}[]=
 [...new Set(LEGENDS.map(l=>l.position))].map(position=>{const ls=LEGENDS.filter(l=>l.position===position);return {position,job:ls[0].job,legends:ls};});

/** Quick check: "Whose job is it?" Each round reads one position's job; you pick the position. Fixed order (no randomness at
 *  render), three choices each, the right answer in a different slot every time. */
export const QUIZ:readonly {position:string;choices:readonly string[]}[]=[
 {position:'Centre-back',choices:['Striker','Centre-back','Winger']},
 {position:'Winger',choices:['Winger','Goalkeeper','Midfielder']},
 {position:'Goalkeeper',choices:['Right-back','Midfielder','Goalkeeper']},
 {position:'Midfielder',choices:['Midfielder','Centre-back','Striker']},
];

// ---- sampling: smooth positions (Catmull-Rom through the keys), eased angles ----
const seg=(ts:readonly number[],t:number)=>{let i=0;while(i<ts.length-2&&t>ts[i+1])i++;return i;};
const cr=(p0:number,p1:number,p2:number,p3:number,u:number)=>.5*(2*p1+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);
const ease=(u:number)=>u*u*(3-2*u);
function along<K extends readonly number[]>(keys:readonly K[],t:number,cols:readonly number[],smooth:readonly number[]):number[]{
 const ts=keys.map(k=>k[0]),c=Math.max(ts[0],Math.min(ts[ts.length-1],t)),i=seg(ts,c),a=keys[i],b=keys[Math.min(i+1,keys.length-1)];
 const span=b[0]-a[0],u=span>0?(c-a[0])/span:0;
 return cols.map(col=>{if(smooth.includes(col)){const p0=keys[Math.max(0,i-1)][col],p3=keys[Math.min(keys.length-1,i+2)][col];return cr(p0,a[col],b[col],p3,u);}return a[col]+(b[col]-a[col])*ease(u);});
}
export function poseAt(keys:readonly Key[],t:number):Pose{const [x,y,rot,arm,leg]=along(keys,t,[1,2,3,4,5],[1,2]);return {x,y,rot,arm,leg};}
export function ballAt(keys:readonly BallKey[],t:number):[number,number]{const [x,y]=along(keys,t,[1,2],[1,2]);return [x,y];}
/** Perspective: things further up the pitch are smaller. */
export const scaleAt=(y:number)=>.54+(y-200)*.0027;
/** The brush line the finger follows (the handle's path from t 0 to 1), sampled. */
export function handlePath(l:Legend,n=48):[number,number][]{
 const out:[number,number][]=[];for(let k=0;k<=n;k++){const t=k/n;if(l.handle==='ball')out.push(ballAt(l.ball,t));else{const p=poseAt(l.player,t);out.push([p.x,p.y-60*scaleAt(p.y)]);}}return out;
}
/** Where a finger at (x,y) sits along the brush line, 0…1. Only nearby progress counts (a jump of more than `reach` is held back),
 *  so the move can't skip ahead by tapping the end. */
export function progressAt(path:readonly [number,number][],x:number,y:number,cur:number,reach=.28){
 let best=cur,bd=Infinity;const n=path.length-1;
 for(let k=0;k<n;k++){const [ax,ay]=path[k],[bx,by]=path[k+1],dx=bx-ax,dy=by-ay,L=dx*dx+dy*dy||1,u=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/L));
  const px=ax+dx*u,py=ay+dy*u,d=(x-px)**2+(y-py)**2,t=(k+u)/n;if(Math.abs(t-cur)<=reach&&d<bd){bd=d;best=t;}}
 return best;
}
/** Running legs: the stride follows the distance travelled, so a slow drag walks and a fast one sprints. */
export function stride(keys:readonly Key[],t:number){let d=0,prev=poseAt(keys,0);for(let k=1;k<=24;k++){const p=poseAt(keys,t*k/24);d+=Math.hypot(p.x-prev.x,p.y-prev.y);prev=p;}return Math.sin(d*.16)*24;}

export const LEGEND_SOURCES=[...LEGENDS.map(l=>l.source),{title:'Wikipedia · Ballon d’Or (the only goalkeeper winner)',url:'https://en.wikipedia.org/wiki/Ballon_d%27Or'}];
/** Ukiyo-e references studied for the style (technique only; nothing here copies a print). */
export const STYLE_NOTES='Style: woodblock-print technique (a black key block, flat colour blocks, bokashi gradients, a name cartouche and a seal), studied from the Art Institute of Chicago’s ukiyo-e collection and the British Museum’s guide to Japanese woodblock printing. The pictures are original.';
