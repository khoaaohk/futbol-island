/**
 * first-international-1872 · the match analyser's clockwork (Oct 14 2026 redo). Pure, no React, so the test runs it in Node.
 *
 * The real line-ups (Wikipedia "1872 Scotland v England football match"): England 1 back, 1 half-back, 8 forwards (1-1-8);
 * Scotland, all Queen's Park players, 2 backs, 2 half-backs, 6 forwards (2-2-6). Board units are metres on a 100 × 64 pitch:
 * x from Scotland's goal line (0) to England's (100), y across (0..64). Scotland attack toward x = 100, England toward x = 0.
 *
 * The machine plays a MADE-UP move in each style (the real match ended 0-0), wound through by the crank:
 *  - DRIBBLE (England's way): one forward runs with the ball and the other forwards "back up" behind him; when he is tackled a
 *    backer picks up the loose ball and runs on, until a Scottish back clears it upfield.
 *  - PASS (Scotland's way): the ball goes from teammate to teammate. The pass-length knob is the longest pass a player will try:
 *    each pass goes to the most forward teammate in range whose lane is open (no England player within REACH of the line); a
 *    long kick of the heavy 1872 ball (over LONG m) is a 50-50, lost when an England player stands within LOOSE m of the
 *    receiver. Too short a knob and nobody is in range; too long and the hopeful long ball is cut out.
 * Speeds are round, illustrative numbers (a runner with the ball RUN m/s, a kicked pass KICK m/s), so the machine's dials compare
 * the two styles fairly; they are not measurements from 1872.
 */
export type Pt={x:number;y:number};
export type Style='dribble'|'pass';
export type Team='scotland'|'england';
export const L=100,W=64,MID=32;
export const RUN=5,KICK=14,REACH=2.6,LONG=26,LOOSE=9,SHOT_X=80;
/** The pass-length knob's detents (metres). */
export const PASS_LENGTHS=[10,20,30,40] as const;
export const STYLE_TEAM:Record<Style,Team>={dribble:'england',pass:'scotland'};
export const dist=(a:Pt,b:Pt)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function segDist(p:Pt,a:Pt,b:Pt){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1e-9,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/l2,0,1);
 return {d:Math.hypot(a.x+dx*t-p.x,a.y+dy*t-p.y),t};}
/** n players spread evenly across at depth x (spread 0..1 of the width; one player stands in the middle). */
export function line(n:number,x:number,spread:number):Pt[]{
 if(n===1)return [{x,y:MID}];const w=W*spread;return Array.from({length:n},(_,i)=>({x,y:MID-w/2+w*i/(n-1)}));
}
export type Role='gk'|'back'|'half'|'fwd';
export type Player={id:string;team:Team;role:Role;home:Pt};
const mk=(team:Team,role:Role,pts:Pt[],at:number):Player[]=>pts.map((p,i)=>({id:`${team[0]}${at+i}`,team,role,home:p}));
/** Both teams in their real 1872 shapes (players 0–10 Scotland, 11–21 England). */
export const PLAYERS:readonly Player[]=[
 ...mk('scotland','gk',[{x:3,y:MID}],0),...mk('scotland','back',line(2,15,.42),1),...mk('scotland','half',line(2,28,.5),3),...mk('scotland','fwd',line(6,43,.86),5),
 ...mk('england','gk',[{x:97,y:MID}],0),...mk('england','back',[{x:84,y:MID-4}],1),...mk('england','half',[{x:70,y:26}],2),...mk('england','fwd',line(8,55,.9),3),
];
export const LINES:Record<Team,{role:Role;n:number;name:string}[]>={
 scotland:[{role:'gk',n:1,name:'Goalkeeper'},{role:'back',n:2,name:'backs'},{role:'half',n:2,name:'half-backs'},{role:'fwd',n:6,name:'forwards'}],
 england:[{role:'gk',n:1,name:'Goalkeeper'},{role:'back',n:1,name:'back'},{role:'half',n:1,name:'half-back'},{role:'fwd',n:8,name:'forwards'}],
};
/** The shape a team's lines read as, from its own goal: England 1-1-8, Scotland 2-2-6. */
export const shapeOf=(team:Team)=>LINES[team].filter(l=>l.role!=='gk').map(l=>l.n).join('-');
const idx=(id:string)=>PLAYERS.findIndex(p=>p.id===id);
const teamOf=(i:number)=>PLAYERS[i].team;

/** One moment of the move: everyone's place, the ball, who has it, and what just happened. */
export type Snap={t:number;pos:Pt[];ball:Pt;owner:number;passes:number;say:string;event:'start'|'run'|'tackle'|'pickup'|'pass'|'cut'|'clear'|'chance'|'stuck'};
export type Outcome={kind:'chance'|'lost';gain:number;passes:number;seconds:number;why:string};
export type Play={style:Style;len:number;snaps:Snap[];T:number;outcome:Outcome};

const homes=()=>PLAYERS.map(p=>({...p.home}));
const toward=(a:Pt,b:Pt,by:number):Pt=>{const d=dist(a,b);if(d<=by||d<1e-9)return {...b};return {x:a.x+(b.x-a.x)*by/d,y:a.y+(b.y-a.y)*by/d};};

/** England's way, scripted from the real idea of "backing up": run, tackled, a backer picks it up, tackled again, cleared. */
export function dribblePlay():Play{
 const s:Snap[]=[];let pos=homes(),t=0;
 const carrier=idx('e7'),backer=idx('e8'),backer2=idx('e6'),half=idx('s3'),half2=idx('s4'),back=idx('s1'),back2=idx('s2'),fwdS=idx('s7');
 pos[carrier]={x:52,y:MID-2};
 const push=(dt:number,ball:Pt,owner:number,event:Snap['event'],say:string,passes=0)=>{t+=dt;s.push({t,pos:pos.map(p=>({...p})),ball:{...ball},owner,passes,say,event});};
 push(0,{x:51,y:MID-2},carrier,'start','England kick off. One forward takes the ball and runs.');
 // 1. the run: 18 m at running pace; the backers follow 4 m behind; the half-back steps in.
 let a={x:34,y:MID-1};const run1=dist(pos[carrier],a)/RUN;
 pos=pos.map((p,i)=>i===carrier?a:i===backer?{x:a.x+4,y:a.y+4}:i===backer2?{x:a.x+5,y:a.y-5}:PLAYERS[i].team==='england'&&PLAYERS[i].role==='fwd'?{x:p.x-12,y:p.y}:i===half?{x:a.x-1.6,y:a.y-1}:i===half2?{x:p.x+2,y:p.y-4}:p);
 push(run1,{x:a.x-1.2,y:a.y},carrier,'run','He runs with the ball. Seven forwards follow him, ready to “back up”.');
 // 2. tackled: the ball pops loose to the backer.
 const loose={x:a.x+2.5,y:a.y+3};push(.6,loose,-1,'tackle','Tackled by a Scottish half-back! The ball runs loose.');
 pos[backer]={x:loose.x+.6,y:loose.y+.6};push(.5,loose,backer,'pickup','A teammate backing up picks up the loose ball and runs on.');
 // 3. the second run, into the backs.
 a={x:20,y:MID+3};const run2=dist(pos[backer],a)/RUN;
 pos=pos.map((p,i)=>i===backer?a:i===carrier?{x:a.x+6,y:a.y-6}:i===backer2?{x:a.x+7,y:a.y+6}:PLAYERS[i].team==='england'&&PLAYERS[i].role==='fwd'?{x:Math.max(26,p.x-10),y:p.y}:i===back?{x:a.x-1.8,y:a.y-1}:i===back2?{x:p.x+1,y:p.y-3}:p);
 push(run2,{x:a.x-1.2,y:a.y},backer,'run','Into the Scottish backs, with the whole pack behind him.');
 push(.6,{x:a.x-2.4,y:a.y-.6},back,'tackle','Tackled again, this time by a back.');
 // 4. cleared upfield to a Scottish forward: England have lost the ball.
 const to={x:pos[fwdS].x+4,y:pos[fwdS].y};pos[fwdS]=to;const kick=dist(s[s.length-1].ball,to)/KICK;
 push(kick,to,fwdS,'clear','The back kicks it clear, upfield to a Scottish forward. England have lost the ball.');
 const gain=Math.round(51-20);
 return {style:'dribble',len:0,snaps:s,T:t,outcome:{kind:'lost',gain,passes:0,seconds:Math.round(t*10)/10,why:`${gain} m of running, then a Scottish back cleared it. Lots of players chasing one ball leaves space empty.`}};
}

/** The England outfield players (no keeper). */
const englandOut=()=>PLAYERS.map((p,i)=>i).filter(i=>teamOf(i)==='england'&&PLAYERS[i].role!=='gk');
/** Is the lane from a to b open: no England player within REACH of the line (or standing on the receiver)? */
export function laneOpen(pos:Pt[],a:Pt,b:Pt){for(const i of englandOut()){const {d,t}=segDist(pos[i],a,b);if(d<REACH&&t>.04)return {ok:false,by:i};}return {ok:true,by:-1};}
/**
 * Scotland's forwards' runs, like the cams of the clockwork: where each of the six forwards stands after 0, 1, 2 … passes. They
 * run into the gaps in England's line of eight (y 3, 11, 20, 28, 36, 44, 53, 61 at x = 55) and only go past it once the ball has.
 */
const RUNS:readonly (readonly [number,number])[][]=[
 [[40,3],[44,4],[52,6],[66,10],[86,22]],
 [[36,8],[46,12],[56,16],[77,30]],
 [[42,24],[42,24],[52,28],[60,30],[68,32]],
 [[47,42],[49,40],[49,40],[58,44],[66,46]],
 [[47,52],[50,52],[65,40],[65,40],[70,42]],
 [[43,60],[46,60],[52,58],[62,58],[70,56]],
];
/** Scotland's way: the knob's pass length decides which passes the players try. */
export function passPlay(len:number):Play{
 const s:Snap[]=[];let pos=homes(),t=0,passes=0;const fwd=PLAYERS.map((p,i)=>i).filter(i=>teamOf(i)==='scotland'&&PLAYERS[i].role==='fwd');
 const place=(k:number)=>fwd.forEach((i,n)=>{const r=RUNS[n][Math.min(k,RUNS[n].length-1)];pos[i]={x:r[0],y:r[1]};});
 let owner=idx('s3');place(0);const start=pos[owner].x;
 const push=(dt:number,ball:Pt,own:number,event:Snap['event'],say:string)=>{t+=dt;s.push({t,pos:pos.map(p=>({...p})),ball:{...ball},owner:own,passes,say,event});};
 push(0,{x:pos[owner].x+1.2,y:pos[owner].y},owner,'start','A Scottish half-back has the ball. Two England forwards rush at him. Who is free?');
 let outcome:Outcome|null=null;
 for(let step=0;step<9&&!outcome;step++){
  const a=pos[owner];
  const options=PLAYERS.map((p,i)=>i).filter(i=>teamOf(i)==='scotland'&&i!==owner&&PLAYERS[i].role!=='gk'&&pos[i].x>a.x+2&&dist(pos[i],a)<=len+1e-9)
   .sort((i,j)=>pos[j].x-pos[i].x||Math.abs(pos[i].y-MID)-Math.abs(pos[j].y-MID));
  const open=options.filter(i=>laneOpen(pos,a,pos[i]).ok);
  if(!open.length){
   const near=englandOut().sort((i,j)=>dist(pos[i],a)-dist(pos[j],a))[0];pos[near]={x:a.x+1.4,y:a.y+.8};
   const why=options.length?'Every teammate in range has an England player in the lane.':`No teammate is within ${len} m. A pass that short can’t reach anyone.`;
   push(1.2,{x:a.x+.8,y:a.y+.4},near,'stuck',`Stuck! ${why} An England forward runs in and takes the ball.`);
   outcome={kind:'lost',gain:Math.max(0,Math.round(a.x-start)),passes,seconds:0,why};break;}
  const to=open[0],b=pos[to],d=dist(a,b);
  // a long kick of the heavy ball is a 50-50: lost when an England player stands near where it lands.
  const near=englandOut().map(i=>({i,d:dist(pos[i],b)})).sort((p,q)=>p.d-q.d)[0];
  if(d>LONG&&near.d<LOOSE){const at=toward(b,pos[near.i],1.6);pos[near.i]=toward(pos[near.i],b,Math.max(0,near.d-2.2));
   push(d/KICK+.4,at,near.i,'cut',`A long ${Math.round(d)} m kick of the heavy ball. An England player gets there first: cut out!`);
   outcome={kind:'lost',gain:Math.max(0,Math.round(a.x-start)),passes,seconds:0,why:`A long ${Math.round(d)} m kick was a 50-50, and England won it.`};break;}
  passes++;owner=to;
  // England chase the ball where it WAS (too late); the forwards make their next runs; the half-backs follow up.
  const chase=englandOut().map(i=>({i,d:dist(pos[i],a)})).sort((p,q)=>p.d-q.d).slice(0,2).map(x=>x.i);
  for(const i of chase)pos[i]=toward(pos[i],a,Math.min(7,Math.max(0,dist(pos[i],a)-2.4)));
  const keep={...pos[to]};place(passes);pos[to]=keep;
  for(const i of PLAYERS.map((q,k)=>k).filter(k=>teamOf(k)==='scotland'&&PLAYERS[k].role==='half'&&k!==to))pos[i]={x:Math.min(b.x-10,pos[i].x+5),y:pos[i].y};
  const ballAt={x:b.x+1.2,y:b.y};
  if(b.x>=SHOT_X){push(d/KICK,ballAt,to,'chance',`Pass ${passes}: ${Math.round(d)} m. A Scot is through on goal: a chance to shoot!`);
   outcome={kind:'chance',gain:Math.round(b.x-start),passes,seconds:0,why:`${passes} passes went round England’s eight forwards to a chance at goal.`};break;}
  push(d/KICK,ballAt,to,'pass',`Pass ${passes}: ${Math.round(d)} m to a teammate in space. The ball moves faster than any runner.`);
 }
 if(!outcome){const a=pos[owner];outcome={kind:'lost',gain:Math.round(a.x-start),passes,seconds:0,why:'Too many passes: the move ran out of time.'};}
 outcome.seconds=Math.round(t*10)/10;
 return {style:'pass',len,snaps:s,T:t,outcome};
}
export const playOf=(style:Style,len:number)=>style==='dribble'?dribblePlay():passPlay(len);

const ease=(u:number)=>u<.5?2*u*u:1-(-2*u+2)**2/2;
/** The move at fraction f (0..1) of its length: everyone's place, the ball, the snapshot it has passed, and the gain so far. */
export function frameAt(p:Play,f:number){
 const time=clamp(f,0,1)*p.T,S=p.snaps;let i=0;while(i<S.length-1&&S[i+1].t<=time)i++;
 const a=S[i],b=S[Math.min(i+1,S.length-1)],span=b.t-a.t,raw=span>1e-9?clamp((time-a.t)/span,0,1):0,u=ease(raw);
 const kicked=b!==a&&(b.event==='pass'||b.event==='cut'||b.event==='chance'||b.event==='clear');
 const air=kicked?4*raw*(1-raw)*Math.min(5,dist(a.ball,b.ball)*.12):0;
 const lerp=(m:Pt,n:Pt):Pt=>({x:m.x+(n.x-m.x)*u,y:m.y+(n.y-m.y)*u});
 const team=STYLE_TEAM[p.style],dir=team==='scotland'?1:-1,x0=S[0].ball.x;
 const ball=kicked?{x:a.ball.x+(b.ball.x-a.ball.x)*raw,y:a.ball.y+(b.ball.y-a.ball.y)*raw}:lerp(a.ball,b.ball);
 // the gain counts only while the attacking team has the ball (a clearance gives nothing back)
 const owned=i<S.length-1?(b.owner<0||teamOf(b.owner)===team||teamOf(a.owner)===team):teamOf(a.owner)===team;
 const best=Math.max(0,...S.slice(0,i+1).filter(x=>x.owner<0||teamOf(x.owner)===team).map(x=>(x.ball.x-x0)*dir),owned?(ball.x-x0)*dir:0);
 return {pos:a.pos.map((q,k)=>lerp(q,b.pos[k])),ball,air,owner:raw>=1?b.owner:a.owner,snap:raw>=1?b:a,i,time,gain:Math.max(0,best),done:f>=1};
}
/** The crank: TURNS full turns wind the whole move through. Detents every quarter turn. */
export const TURNS=3;
export const fracOfCrank=(deg:number)=>clamp(deg/(360*TURNS),0,1);
export const snapCrank=(deg:number)=>clamp(Math.round(deg/90)*90,0,360*TURNS);
/** The knob's detents as angles (degrees, 0 = pointing up the deck). */
export const KNOB_ANGLES=[-105,-35,35,105];
export function knobIndex(deg:number){let best=0;KNOB_ANGLES.forEach((a,i)=>{if(Math.abs(a-deg)<Math.abs(KNOB_ANGLES[best]-deg))best=i;});return best;}
/** The lever: two notches. Pulled toward you = dribble (England), pushed away = pass (Scotland). */
export const LEVER_ANGLES:Record<Style,number>={dribble:-34,pass:34};
export const styleOfLever=(deg:number):Style=>deg<0?'dribble':'pass';
/** The dials: GAIN reads 0–60 m in one turn, TIME 0–20 s in one turn. */
export const GAIN_FULL=60,TIME_FULL=20;
/** Lift the lines: each line rides up to its own height (fraction of LIFT_H), goalkeeper lowest, forwards highest. */
export const LIFT_LEVEL:Record<Role,number>={gk:.25,back:.5,half:.75,fwd:1};
/** Lift the lines: each line slides to its own rack row as it rises, read from the near end like a formation: keeper, backs, half-backs, forwards (both teams on the same rack, so they compare). */
export const RACK_X:Record<Team,Record<Role,number>>={scotland:{gk:8,back:30,half:52,fwd:76},england:{gk:8,back:30,half:52,fwd:76}};
export const rackOf=(i:number):Pt=>{const p=PLAYERS[i];return {x:RACK_X[p.team][p.role],y:p.home.y};};
/** The tasks that open the quick check. */
export const TASKS=[
 {id:'dribble',ask:'Pull the lever to DRIBBLE and turn the crank: watch England’s way.'},
 {id:'pass',ask:'Push the lever to PASS, set the pass-length knob, and crank Scotland’s move all the way to a chance.'},
 {id:'lines',ask:'Slide “Lift the lines” to take each team apart into its lines.'},
 {id:'score',ask:'Tap the scoreboard to flip it to the real result.'},
] as const;
export type TaskId=typeof TASKS[number]['id'];
