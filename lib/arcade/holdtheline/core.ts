/**
 * Hold the Line core (Nov 21 2026, docs/arcade-aaa/holdtheline-direction.md): you are the defence. Pure rules, seeded, fixed 1/60 s
 * steps, no DOM (tests/holdtheline-core.cjs and tests/holdtheline-bots.cjs run it in node). Drawing: view.ts. Shell:
 * components/games/HoldTheLineGame.tsx.
 *
 * One match = twelve attacks ("waves"). You move the back line as ONE unit (up / down the pitch, and across it) and may send one
 * defender to PRESS the player on the ball. Each wave the other team passes in midfield, then tries one of: a through ball for a
 * runner (STEP UP during the passer's wind-up and the runner is offside), a long ball over the top (DROP and it is swept up), a
 * ball out wide or a switch of play (SLIDE across or the winger is free), a heavy touch or a passer who waits (PRESS and win it).
 * Sit too deep and they shoot from distance; press at the wrong time and they pass into the gap.
 * Units: metres and seconds. y = distance from YOUR goal line (0) up the pitch; the halfway line is at 36. x: + is screen right.
 * "Beyond the line" (nearer your goal) means a SMALLER y.
 * Offside (IFAB Law 11, lib/site/rules.ts): judged at the moment the ball is PLAYED. An attacker is offside when he is in your half,
 * ahead of the ball, and nearer your goal line than the second-last defender (the keeper counts as a defender). Level = onside.
 * Fairness: outcomes that need luck (a shot, a one on one) come from one number fixed per wave by the seed, so a wave plays the
 * same for everyone; a correct read (step, drop, slide or press) always ends in a stop with no luck at all.
 * Teaches (AGENTS.md): the offside rule in action, stepping up together, staying compact, dropping, sliding to the ball side,
 * when to press and what it costs.
 */
export const HL={
 step:1/60,/** half the pitch's width, the halfway line, the far edge of what is drawn */hw:14,half:36,top:46,goalHalf:3.66,
 /** the line's limits up and down the pitch, and how far it slides either way */minY:8,maxY:37,maxX:5,
 /** line speeds (m/s): stepping up, dropping, sliding; a presser's sprint and his jog back */upV:6.5,downV:6,slideV:6.5,pressV:9,backV:6.5,
 /** within this of the second-last defender is "level" = onside (m) */level:.15,
 /** a line at or below this lets the passer shoot from distance; at or below sweep a long ball over the top is swept up */shotLine:18,sweepLine:17,
 /** a winger is covered when the nearest defender is within this across the pitch (m; a back three gets 1.5 more); where the wingers stand */cover:2.5,wingX:12,
 /** midfield stands this far in front of the line */midGap:7.5,
 /** the passer waits to shape until the line has stopped stepping up for this long (s): step too early and the runner holds his run */still:.22,
 waves:12,gapSecs:1.1,scoreMax:8000,
 medals:[1400,2400,3400] as readonly number[],
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export const medalFor=(score:number)=>{let m=0;for(const v of HL.medals)if(score>=v)m++;return m;};

/* ---- offside: the pure judge ---- */
export type OffsideReason='offside'|'level'|'onside'|'ownhalf'|'behindball';
export type OffsideCall={offside:boolean;reason:OffsideReason;/** y of the second-last defender (Infinity with fewer than two) */line:number};
/** Law 11 at the moment the ball is played. `defendersY` is EVERY defending player, the keeper included: the line is the second
 *  nearest to the goal line, whoever that is. On the halfway line = own half. Level with the ball or with the line = onside. */
export function judgeOffside(o:{attackerY:number;ballY:number;defendersY:readonly number[];half?:number}):OffsideCall{
 const ys=[...o.defendersY].sort((a,b)=>a-b),line=ys.length>=2?ys[1]:Infinity,half=o.half??HL.half;
 if(o.attackerY>=half)return {offside:false,reason:'ownhalf',line};
 if(o.attackerY>=o.ballY-HL.level)return {offside:false,reason:'behindball',line};
 if(o.attackerY>=line+HL.level)return {offside:false,reason:'onside',line};
 if(o.attackerY>=line-HL.level)return {offside:false,reason:'level',line};
 return {offside:true,reason:'offside',line};
}
/** How often the keeper saves a shot from this far out (m). */
export const saveChance=(d:number)=>Math.max(.3,Math.min(.97,.35+(d-12)*.045));

/* ---- teams, leagues, tuning ---- */
export type WaveKind='thru'|'decoy'|'deep'|'long'|'wide'|'switch'|'heavy'|'bend'|'double';
export const KIND_NAME:Record<WaveKind,string>={thru:'Through ball',decoy:'Decoy run',deep:'Runner from deep',long:'Long ball',wide:'Ball out wide',switch:'Switch of play',heavy:'Heavy touch',bend:'Bent run',double:'One-two'};
export type Team={id:string;name:string;style:string;kit:string;trim:string;back:3|4;passes:readonly [number,number];startY:number;deck:readonly WaveKind[];lesson:string;tip:string};
/** Ten teams, each a different problem. `deck` is nine of a match's twelve waves (shuffled by the seed; three more are dealt from it again). */
export const TEAMS:readonly Team[]=[
 {id:'coconut',name:'Coconut Rovers',style:'Straight runners',kit:'#f0452e',trim:'#fff3d6',back:3,passes:[2,3],startY:22,deck:['thru','thru','thru','thru','thru','thru','thru','decoy','decoy'],
  lesson:'Step up together',tip:'Watch the passer. When the leg goes back, drag UP. The runner is left behind your line: offside!'},
 {id:'sandy',name:'Sandy Bay Wanderers',style:'Out wide',kit:'#ff8a3c',trim:'#231a2e',back:3,passes:[2,3],startY:22,deck:['wide','wide','wide','wide','switch','switch','thru','thru','thru'],
  lesson:'Slide to the ball side',tip:'When the ball goes wide, drag ACROSS so your line is near it. A winger with nobody near is free to shoot.'},
 {id:'lighthouse',name:'Lighthouse Athletic',style:'Long ball',kit:'#fffaf0',trim:'#f0452e',back:4,passes:[1,2],startY:23,deck:['long','long','long','long','long','thru','thru','deep','deep'],
  lesson:'Drop for the long ball',tip:'A passer far back in his own half hits it long. His runner starts in his own half, so he cannot be offside. Drag DOWN and sweep it up.'},
 {id:'tide',name:'Tiki-Taka Tide',style:'Short passes',kit:'#8f78b8',trim:'#fff3d6',back:4,passes:[5,7],startY:22,deck:['double','double','double','thru','thru','wide','wide','decoy','decoy'],
  lesson:'Stay compact. Be patient.',tip:'Lots of short passes to pull you apart. Keep the line together, slide with the ball, and only step when the leg goes back.'},
 {id:'mango',name:'Mango Counter',style:'Counter-attack',kit:'#ffc83a',trim:'#231a2e',back:4,passes:[1,2],startY:29,deck:['deep','deep','deep','deep','long','long','long','thru','thru'],
  lesson:'Mind the space behind you',tip:'You start high up the pitch and they break fast. A runner from deep is still offside if you step. A long ball needs a quick drop.'},
 {id:'palm',name:'Palm Wing FC',style:'Wing play',kit:'#4fb85c',trim:'#fff3d6',back:4,passes:[2,4],startY:22,deck:['switch','switch','switch','switch','switch','wide','wide','thru','thru'],
  lesson:'Slide across together',tip:'They pass on one side, then switch to the far wing. The moment the long pass is hit, drag ACROSS to the other side.'},
 {id:'coral',name:'Captain Coral’s XI',style:'The clever striker',kit:'#ff6f91',trim:'#231a2e',back:4,passes:[2,3],startY:22,deck:['bend','bend','bend','bend','heavy','heavy','thru','thru','decoy'],
  lesson:'Press the passer who waits',tip:'The captain bends her run along your line and stays level. Level is onside! When the passer waits with a foot on the ball, TAP a defender to press.'},
 {id:'harbour',name:'Harbour Hawks',style:'Direct and rough',kit:'#3a7bd5',trim:'#fff3d6',back:4,passes:[1,3],startY:24,deck:['heavy','heavy','heavy','long','long','deep','deep','switch','switch'],
  lesson:'When to press',tip:'Press only when the ball runs away from the passer’s feet. Press at the wrong time and they pass into the gap you left.'},
 {id:'reef',name:'Reef Rondo',style:'Pass and move',kit:'#19b5a5',trim:'#231a2e',back:4,passes:[4,6],startY:22,deck:['double','double','double','bend','bend','switch','switch','decoy','decoy'],
  lesson:'Two balls in behind',tip:'A pass to feet, then a quick ball in behind. Step, stop, and step again on the second wind-up.'},
 {id:'allstars',name:'Island All-Stars',style:'Everything',kit:'#231a2e',trim:'#ffc83a',back:4,passes:[2,5],startY:22,deck:['thru','decoy','deep','long','wide','switch','heavy','bend','double'],
  lesson:'Read it, then choose',tip:'Step, hold, drop, slide or press. Every attack has one right answer. Watch the passer and the runner.'},
];
export const DAILY_TEAM:Team={id:'motd',name:'Match of the Day XI',style:'Today’s pattern',kit:'#f0452e',trim:'#ffc83a',back:4,passes:[2,4],startY:22,deck:['thru','decoy','deep','long','wide','switch','heavy','bend','double'],
 lesson:'Match of the Day',tip:'Twelve attacks, the same for everyone today. Read each one: step, drop, slide or press.'};
export const LEAGUES=[
 {id:'coast',name:'Coast League',venue:0},
 {id:'premier',name:'Island Premier',venue:1},
] as const;
/** wind-up of the through ball (the tell), time of a pass, base hold on the ball, flight of a switch + the winger's first touch,
 *  how long a heavy touch / a waiting passer lasts, how far onside a runner times his run, helper (2 line always + freeze,
 *  1 freeze on the decision, 0 line only when the flag goes up), goals you may let in and still win. */
export type Tuning={W:number;fly:number;hold:number;sw:number;ctrl:number;dwell:number;margin:number;aid:0|1|2;limit:number};
export function tuning(league:number,match:number,daily=false):Tuning{
 if(daily)return {W:.8,fly:.6,hold:.6,sw:1.15,ctrl:.4,dwell:1.35,margin:.4,aid:1,limit:2};
 const m=Math.max(0,Math.min(9,match))/9;
 return league<=0?{W:1.05-.37*m,fly:.75-.15*m,hold:.8-.2*m,sw:1.35-.25*m,ctrl:.45,dwell:1.6-.3*m,margin:.4,aid:match<3?2:match<6?1:0,limit:match<3?3:2}
  :{W:.72-.16*m,fly:.55-.1*m,hold:.55-.15*m,sw:1.05-.15*m,ctrl:.38,dwell:1.25-.25*m,margin:.3,aid:0,limit:1};
}

/* ---- the trap book: feats, exported for a future cross-arcade weekly card ---- */
export const HL_FEATS=[
 {id:'first',name:'First flag',how:'Catch a runner offside.',color:'#ffc83a'},
 {id:'three',name:'Flag hat-trick',how:'Three offsides in one match.',color:'#ff8a3c'},
 {id:'slide',name:'Perfect slide',how:'Slide across and shut out a switch of play.',color:'#19b5a5'},
 {id:'tackle',name:'Clean tackle',how:'Press a heavy touch and win the ball.',color:'#4fb85c'},
 {id:'block',name:'Brave block',how:'Press a long shot and block it.',color:'#3a7bd5'},
 {id:'sweep',name:'Swept up',how:'Drop and sweep up a long ball over the top.',color:'#8f78b8'},
 {id:'double',name:'Twice bitten',how:'Step again and catch the second ball of a one-two.',color:'#ff6f91'},
 {id:'five',name:'Brick wall',how:'Five stops in a row.',color:'#f0452e'},
 {id:'clean',name:'Clean sheet',how:'Win a match without letting a goal in.',color:'#fffaf0'},
 {id:'counter',name:'No way through',how:'A clean sheet against Mango Counter.',color:'#ffc83a'},
 {id:'motd3',name:'Three stars',how:'Three stars on the Match of the Day.',color:'#19b5a5'},
 {id:'promo',name:'Promotion',how:'Win all ten matches of the Coast League.',color:'#f0452e'},
] as const;
export type FeatId=typeof HL_FEATS[number]['id'];
export const HL_FEAT_IDS:readonly FeatId[]=HL_FEATS.map(f=>f.id);

/* ---- a wave's plan ---- */
/** One step of an attack: the ball goes `to` an attacker (0-2 midfield left / centre / right, 3-4 wingers left / right, 5-6
 *  runners), who holds it. pass: then the next step. wide: the line must be near the winger. feet: a wind-up, then a pass to a
 *  runner's feet. thru / long / bend / heavy: the wave's key moment. */
export type Beat={k:'pass'|'wide'|'feet'|'thru'|'long'|'bend'|'heavy';to:number;fly:number;hold:number;W:number;sw:boolean;decoy:boolean;deep:boolean};
export type WavePlan={kind:WaveKind;side:-1|1;beats:Beat[];startY:number;/** the wave's one lucky number */u:number};
const clamp=(v:number,a:number,b:number)=>v<a?a:v>b?b:v,mix=(a:number,b:number,u:number)=>a+(b-a)*u;
function mulberry(seed:number){let a=seed>>>0||1;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/** The arcade's daily seed (FNV-1a of `holdtheline:<local day>`): the same Match of the Day for everyone that day. */
export function holdthelineDailySeed(day:string){let h=0x811c9dc5;const s='holdtheline:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}

function makeWave(r:()=>number,team:Team,tn:Tuning,kind:WaveKind):WavePlan{
 const side:-1|1=r()<.5?-1:1,nb=team.passes[0]+Math.floor(r()*(team.passes[1]-team.passes[0]+1)),beats:Beat[]=[];
 const hold=()=>tn.hold*(.8+r()*.5),sideMid=(s:number)=>s<0?0:2,other=(c:number)=>c===1?(r()<.5?0:2):1;
 const add=(k:Beat['k'],to:number,o:Partial<Beat>={})=>{beats.push({k,to,fly:tn.fly,hold:hold(),W:0,sw:false,decoy:false,deep:false,...o});cur=to;};
 let cur=1;add('pass',sideMid(side));for(let i=1;i<nb;i++)add('pass',other(cur));
 switch(kind){
  case 'thru':add('thru',other(cur),{W:tn.W});break;
  case 'decoy':add('thru',other(cur),{W:tn.W,decoy:true});break;
  case 'deep':add('thru',other(cur),{W:tn.W,deep:true});break;
  case 'long':add('long',1,{W:tn.W*1.2,hold:hold()+.2});break;
  case 'wide':if(cur!==sideMid(side))add('pass',sideMid(side));add('wide',side<0?3:4,{fly:tn.fly*.9,hold:tn.ctrl});break;
  case 'switch':if(cur!==sideMid(side))add('pass',sideMid(side));add('pass',sideMid(side)===cur?1:sideMid(side));if(cur!==sideMid(side))add('pass',sideMid(side));add('wide',side<0?4:3,{fly:tn.sw,hold:tn.ctrl,sw:true});break;
  case 'heavy':add('heavy',other(cur),{W:tn.W*.85,hold:tn.dwell});break;
  case 'bend':add('bend',other(cur),{W:tn.W,hold:tn.dwell});break;
  case 'double':add('feet',other(cur),{W:tn.W});add('thru',other(cur),{W:tn.W*.8,fly:.4,hold:.3});break;
 }
 return {kind,side,beats,startY:team.startY,u:r()};
}
/** The twelve waves of a match: the team's deck shuffled by the seed, then three more dealt from a second shuffle. `intro`: the first wave is a plain through ball. */
export function matchPlans(seed:number,team:Team,tn:Tuning,intro=false):WavePlan[]{
 const r=mulberry(seed),shuffle=()=>{const d=[...team.deck];for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;},deck=[...shuffle(),...shuffle()].slice(0,HL.waves);
 if(intro){const i=deck.indexOf('thru');if(i>0)[deck[0],deck[i]]=[deck[i],deck[0]];}
 return deck.map(k=>makeWave(r,team,tn,k));
}

/* ---- the match ---- */
export type StopKind='offside'|'tackle'|'block'|'swept'|'slide'|'save';
export const STOP_KINDS:readonly StopKind[]=['offside','tackle','block','swept','slide','save'];
const PTS:Record<StopKind,number>={offside:150,tackle:120,block:120,swept:90,slide:100,save:40};
/** why a goal went in: held = the line never stepped; late = it stepped after the ball was played; ownhalf = the line was so high
 *  the runner started in his own half; long = no drop for a long ball; deep = sat deep and they shot; gap = a press left a gap;
 *  wide = no slide; bend = the runner stayed level. */
export type GoalWhy='held'|'late'|'ownhalf'|'long'|'deep'|'gap'|'wide'|'bend';
export const GOAL_WHYS:readonly GoalWhy[]=['held','late','ownhalf','long','deep','gap','wide','bend'];
export type Stage='fly'|'hold'|'tell'|'air';
export type Phase='tip'|'play'|'res'|'gap'|'over';
export type TellKind='thru'|'feet'|'long'|'shot';
export type HlEvent={type:'wave'|'pass'|'tell'|'kick'|'stop'|'cover'|'goal'|'press'|'shot'|'feat'|'over';a:number;b:number;word:string;points:number};
export type HlStats={offsides:number;tackles:number;blocks:number;swept:number;slides:number;saves:number;covers:number;goals:number;presses:number;bestRow:number;lastWhy:GoalWhy|''};
type P={x:number;y:number};
type Key=[number,number,number];
type Res={kind:'offside'|'through'|'shot'|'swept'|'tackle'|'block'|'gap'|'slide'|'free';goal:boolean;stop:StopKind;why:GoalWhy;t:number;at:number;dur:number;done:boolean;ball:Key[];who:number;run:Key[];line0:number};
export type Snap={t:number;line:number;ry:number;rx:number;offside:boolean;reason:OffsideReason};
export type HlState={t:number;phase:Phase;pt:number;daily:boolean;league:number;match:number;wave:number;goals:number;stops:number;score:number;streak:number;over:boolean;won:boolean;stars:number;bonus:number;
 lineY:number;lineX:number;wantY:number;wantX:number;still:number;defs:P[];keeper:P;atk:P[];ball:P&{h:number};holder:number;bi:number;stage:Stage;bt:number;
 tell:{kind:TellKind;W:number;line0:number;rx0:number;ry0:number;dy0:number}|null;press:{i:number;to:number;st:'go'|'back'}|null;res:Res|null;snap:Snap|null;flag:number;log:string;stats:HlStats;feats:FeatId[]};
const at=(k:Key[],t:number):P=>{if(t<=k[0][0])return {x:k[0][1],y:k[0][2]};for(let i=1;i<k.length;i++)if(t<=k[i][0]){const u=(t-k[i-1][0])/Math.max(1e-6,k[i][0]-k[i-1][0]);return {x:mix(k[i-1][1],k[i][1],u),y:mix(k[i-1][2],k[i][2],u)};}const l=k[k.length-1];return {x:l[1],y:l[2]};};

export type HoldTheLine=ReturnType<typeof createHoldTheLine>;
export function createHoldTheLine(opts:{seed:number;league?:number;match?:number;daily?:boolean;/** the first-ever match: wave one is a plain through ball (the guided step) */intro?:boolean}){
 const daily=!!opts.daily,league=daily?0:clamp(Math.floor(opts.league??0),0,LEAGUES.length-1),match=daily?0:clamp(Math.floor(opts.match??0),0,TEAMS.length-1);
 const team=daily?DAILY_TEAM:TEAMS[match],tn=tuning(league,match,daily),n=team.back,sp=n===4?5.5:6.5,cover=HL.cover+(n===3?1.5:0),lm=daily?1.1:1+.25*league;
 const plans=matchPlans(opts.seed,team,tn,!!opts.intro),events:HlEvent[]=[];
 const emit=(type:HlEvent['type'],a=0,b=0,word='',points=0)=>{events.push({type,a,b,word,points});};
 const s:HlState={t:0,phase:'tip',pt:0,daily,league,match,wave:0,goals:0,stops:0,score:0,streak:0,over:false,won:false,stars:0,bonus:0,
  lineY:team.startY,lineX:0,wantY:team.startY,wantX:0,still:9,defs:Array.from({length:n},()=>({x:0,y:0})),keeper:{x:0,y:1.5},atk:Array.from({length:7},()=>({x:0,y:0})),ball:{x:0,y:0,h:0},holder:1,bi:0,stage:'fly',bt:0,
  tell:null,press:null,res:null,snap:null,flag:-9,log:'',stats:{offsides:0,tackles:0,blocks:0,swept:0,slides:0,saves:0,covers:0,goals:0,presses:0,bestRow:0,lastWhy:''},feats:[]};
 let acc=0,from:P={x:0,y:0};
 const plan=()=>plans[Math.min(s.wave,plans.length-1)],beat=()=>plan().beats[Math.min(s.bi,plan().beats.length-1)],key=()=>plan().beats[plan().beats.length-1];
 const slotX=(i:number)=>(i-(n-1)/2)*sp+s.lineX;
 const defYs=()=>{const ys=s.defs.map(d=>d.y);ys.push(s.keeper.y);return ys;};
 const secondLast=()=>defYs().sort((a,b)=>a-b)[1];
 const feat=(id:FeatId)=>{if(!s.feats.includes(id)){s.feats.push(id);emit('feat',0,0,id);}};
 /** where each attacker wants to stand while the ball is passed around */
 function targets():[number,number][]{const pl=plan(),k=key(),my=clamp(s.lineY+HL.midGap,14,43),long=k.k==='long',off=k.deep?.4+7*k.W:1.4;
  return [[-8,my],[0,long?Math.max(my+2.5,39.5):my+2.5],[8,my],[-HL.wingX,s.lineY+2.5],[HL.wingX,s.lineY+2.5],[pl.side*3.2,long?37.6:s.lineY+off],[-pl.side*4.2,s.lineY+2.2]];}
 function place(){const tg=targets();for(let i=0;i<7;i++){s.atk[i].x=tg[i][0];s.atk[i].y=tg[i][1];}for(let i=0;i<n;i++){s.defs[i].x=slotX(i);s.defs[i].y=s.lineY;}}
 function startWave(){const pl=plan();s.lineY=s.wantY=pl.startY;s.lineX=s.wantX=0;s.still=9;s.press=null;s.res=null;s.tell=null;s.snap=null;s.bi=0;s.stage='fly';s.bt=0;s.holder=1;place();
  from={x:s.atk[1].x,y:s.atk[1].y};s.ball.x=from.x;s.ball.y=from.y;s.ball.h=0;s.phase='play';emit('wave',s.wave,0,pl.kind);}
 place();s.ball.x=s.atk[1].x;s.ball.y=s.atk[1].y;

 function startRes(kind:Res['kind'],o:{goal?:boolean;stop?:StopKind;why?:GoalWhy;at?:number;dur:number;ball:Key[];who?:number;run?:Key[]}){
  s.res={kind,goal:!!o.goal,stop:o.stop??'save',why:o.why??'held',t:0,at:o.at??0,dur:o.dur,done:false,ball:o.ball,who:o.who??-1,run:o.run??[],line0:s.lineY};s.phase='res';s.tell=null;if(s.press)s.press.st='back';if((o.at??0)<=0)settle();}
 function settle(){const r=s.res;if(!r||r.done)return;r.done=true;const st=s.stats;
  if(r.goal){if(r.why==='held'&&s.lineY-r.line0>.5)r.why='late';s.goals++;s.streak=0;st.goals++;st.lastWhy=r.why;s.log+='0';emit('goal',GOAL_WHYS.indexOf(r.why),s.goals,r.why);return;}
  const k=r.stop,pts=Math.round(PTS[k]*lm*(1+.1*Math.min(5,s.streak)));s.score+=pts;s.stops++;s.streak++;st.bestRow=Math.max(st.bestRow,s.streak);s.log+='1';
  if(k==='offside'){st.offsides++;feat('first');if(st.offsides>=3)feat('three');if(plan().kind==='double')feat('double');}
  else if(k==='tackle'){st.tackles++;feat('tackle');}else if(k==='block'){st.blocks++;feat('block');}else if(k==='swept'){st.swept++;feat('sweep');}
  else if(k==='slide'){st.slides++;if(plan().kind==='switch')feat('slide');}else st.saves++;
  if(s.streak>=5)feat('five');emit('stop',STOP_KINDS.indexOf(k),s.streak,k,pts);}
 /** the runner is through: he runs on to the ball and shoots */
 function through(why:GoalWhy,chance:number){const r=s.atk[5],T=Math.max(.5,(r.y-9.5)/8.5),gx=r.x*.45,goal=plan().u<chance,tx=goal?(r.x>=0?-2.6:2.6):s.keeper.x;
  startRes('through',{goal,stop:'save',why,at:T+.3,dur:T+1,who:5,run:[[0,r.x,r.y],[T,gx,9.5]],ball:[[0,s.ball.x,s.ball.y],[T*.55,mix(r.x,gx,.6),mix(r.y,9.5,.6)-1.5],[T,gx,8.8],[T+.3,tx,goal?.2:2]]});}
 function nextBeat(){from={x:s.ball.x,y:s.ball.y};s.bi++;s.stage='fly';s.bt=0;s.tell=null;}
 function startTell(){const b=beat(),r=s.atk[5],d=s.atk[6],kind:TellKind=b.k==='feet'?'feet':b.k==='long'?'long':s.lineY<=HL.shotLine?'shot':'thru';
  s.tell={kind,W:kind==='shot'?Math.max(.8,b.W):b.W,line0:secondLast(),rx0:r.x,ry0:r.y,dy0:d.y};s.stage='tell';s.bt=0;emit('tell',TELLS.indexOf(kind),s.holder,kind);}
 function kick(){const b=beat(),c=s.atk[s.holder],r=s.atk[5],T=s.tell!;
  if(T.kind==='shot'){const p=s.press,d=p?Math.hypot(s.defs[p.i].x-c.x,s.defs[p.i].y-c.y):99;emit('kick',0,0,'shot');
   if(p&&p.st==='go'&&d<2.5){startRes('block',{stop:'block',dur:1,ball:[[0,c.x,c.y],[.3,s.defs[p.i].x,s.defs[p.i].y-1]]});return;}
   const goal=!(plan().u<saveChance(c.y)),tx=goal?(plan().u*7%1<.5?-2.7:2.7):s.keeper.x;startRes('shot',{goal,stop:'save',why:'deep',at:.6,dur:1.4,ball:[[0,c.x,c.y],[.6,tx,goal?.2:2]]});return;}
  if(T.kind==='feet'){emit('kick',0,0,'feet');from={x:c.x,y:c.y};s.stage='air';s.bt=0;return;}
  const call=judgeOffside({attackerY:r.y,ballY:c.y,defendersY:defYs()});s.snap={t:s.t,line:call.line,ry:r.y,rx:r.x,offside:call.offside,reason:call.reason};emit('kick',call.offside?1:0,OFFSIDE_REASONS.indexOf(call.reason),T.kind);
  if(T.kind==='long'){from={x:c.x,y:c.y};s.stage='air';s.bt=0;return;}
  if(call.offside){s.flag=s.t;startRes('offside',{stop:'offside',dur:1.5,ball:[[0,c.x,c.y],[.5,mix(c.x,r.x,.7),mix(c.y,r.y,.7)]]});return;}
  through(b.k==='bend'?'bend':call.reason==='ownhalf'?'ownhalf':'held',.78);}
 function wideCheck(){const b=beat(),w=s.atk[b.to],side=w.x<0?-1:1,last=s.bi>=plan().beats.length-1;let near=99;for(let i=0;i<n;i++)if(!(s.press&&s.press.i===i))near=Math.min(near,Math.abs(w.x-s.defs[i].x));
  if(near<=cover){if(last){startRes('slide',{stop:'slide',dur:1,ball:[[0,w.x,w.y],[.35,w.x-side*1.5,w.y-2],[.8,side*(HL.hw+2),w.y-1]]});return;}
   s.stats.covers++;const pts=Math.round(40*lm);s.score+=pts;emit('cover',side,0,'',pts);nextBeat();return;}
  const goal=!(plan().u<.38),tx=goal?-side*2.6:s.keeper.x;startRes('free',{goal,stop:'save',why:'wide',at:1.5,dur:2.2,who:b.to,run:[[0,w.x,w.y],[1.1,side*5.5,11]],ball:[[0,w.x,w.y],[1.1,side*5.2,10.4],[1.5,tx,goal?.2:2]]});}
 function pressTick(h:number){const p=s.press;if(!p)return;const d=s.defs[p.i];
  if(p.st==='go'&&s.phase==='play'){const T=s.atk[p.to],dx=T.x-d.x,dy=T.y-d.y,dist=Math.hypot(dx,dy)||1,mv=Math.min(dist,HL.pressV*h),b=beat();d.x+=dx/dist*mv;d.y+=dy/dist*mv;
   const has=s.holder===p.to&&(s.stage==='hold'||s.stage==='tell');
   if(has){const win=s.stage==='tell'||b.k==='heavy'||b.k==='bend',c=s.atk[s.holder];
    if(win&&dist-mv<1.3&&!(s.tell&&s.tell.kind==='shot')){startRes('tackle',{stop:'tackle',dur:1,ball:[[0,s.ball.x,s.ball.y],[.25,d.x,d.y-.6]]});return;}
    if(!win&&dist-mv<3.5&&s.bt>=.2){const gx=slotX(p.i),gy=s.lineY+1.2,goal=!(plan().u<saveChance(gy)*.75),tx=goal?(gx>=0?-2.6:2.6):s.keeper.x;
     startRes('gap',{goal,stop:'save',why:'gap',at:1.25,dur:1.9,who:6,run:[[0,s.atk[6].x,s.atk[6].y],[.45,gx,gy]],ball:[[0,c.x,c.y],[.45,gx,gy-.5],[.8,gx,gy-.8],[1.25,tx,goal?.2:2]]});return;}}
   else if(!(s.stage==='fly'&&b.to===p.to))p.st='back';}
  else{p.st='back';const tx=slotX(p.i),dx=tx-d.x,dy=s.lineY-d.y,dist=Math.hypot(dx,dy);if(dist<.3){s.press=null;return;}const mv=Math.min(dist,HL.backV*h);d.x+=dx/dist*mv;d.y+=dy/dist*mv;}}
 function endWave(){const lost=s.goals>tn.limit;
  if(lost||s.wave+1>=HL.waves){s.over=true;s.won=!lost;s.phase='over';s.stars=lost?0:s.goals===0?3:s.goals===1?2:1;s.bonus=lost?0:Math.round((300+(s.goals===0?500:s.goals===1?150:0))*lm);s.score=Math.min(HL.scoreMax,s.score+s.bonus);
   if(s.won&&s.goals===0){feat('clean');if(team.id==='mango')feat('counter');}if(daily&&s.stars===3)feat('motd3');emit('over',s.won?1:0,s.stars,'',s.bonus);return;}
  s.phase='gap';s.pt=0;}

 function tick(){const h=HL.step;s.t+=h;if(s.phase==='tip'||s.phase==='over')return;
  // the line: one unit
  const y0=s.lineY;s.lineY+=clamp(s.wantY-s.lineY,-HL.downV*h,HL.upV*h);s.lineX+=clamp(s.wantX-s.lineX,-HL.slideV*h,HL.slideV*h);s.still=s.lineY-y0>1e-4?0:s.still+h;
  for(let i=0;i<n;i++)if(!(s.press&&s.press.i===i)){s.defs[i].x=slotX(i);s.defs[i].y=s.lineY;}
  s.keeper.x+=clamp(clamp(s.ball.x*.22,-2.4,2.4)-s.keeper.x,-4*h,4*h);
  if(s.phase==='gap'){s.pt+=h;pressTick(h);if(s.pt>=HL.gapSecs){s.wave++;startWave();}return;}
  const A=s.atk,tg=targets(),T=s.tell,scripted=s.phase==='play'&&(s.stage==='tell'||s.stage==='air');
  if(s.phase==='play')for(let i=0;i<7;i++){if(scripted&&(i===5||i===6))continue;A[i].x+=clamp(tg[i][0]-A[i].x,-8*h,8*h);A[i].y+=clamp(tg[i][1]-A[i].y,-8*h,8*h);}
  if(s.phase==='res'){const r=s.res!;r.t+=h;const b=at(r.ball,r.t);s.ball.x=b.x;s.ball.y=b.y;s.ball.h=0;if(r.who>=0){const m=at(r.run,r.t);A[r.who].x=m.x;A[r.who].y=m.y;}
   if(r.kind==='through'||r.kind==='free'||r.kind==='gap')s.keeper.y+=clamp(3.2-s.keeper.y,-3*h,3*h);
   if(!r.done&&r.t>=r.at){emit('shot',r.goal?1:0);settle();}pressTick(h);if(r.t>=r.dur){s.keeper.y=1.5;endWave();}return;}
  const b=beat(),c=A[b.to];s.bt+=h;
  if(s.stage==='fly'){const u=Math.min(1,s.bt/b.fly);s.ball.x=mix(from.x,c.x,u);s.ball.y=mix(from.y,c.y,u);s.ball.h=b.sw?Math.sin(u*Math.PI)*3:0;if(u>=1){s.stage='hold';s.bt=0;s.holder=b.to;s.ball.h=0;emit('pass',b.to,b.k==='heavy'?1:0,b.k);}}
  else if(s.stage==='hold'){const loose=b.k==='heavy'?2.4*(1-s.bt/b.hold):0;s.ball.x=c.x;s.ball.y=c.y-.7-loose;
   if(s.bt>=b.hold){if(b.k==='wide'){wideCheck();}else if(b.k==='pass')nextBeat();
    else if(b.k==='long'||s.lineY<=HL.shotLine||s.still>=HL.still||s.lineY>=HL.maxY-.01)startTell();}}
  else if(s.stage==='tell'&&T){const u=Math.min(1,s.bt/T.W),r=A[5],pl=plan();s.ball.x=c.x;s.ball.y=c.y-.7;
   if(T.kind==='thru'){if(b.k==='bend'){r.y=secondLast()+.1;r.x=T.rx0-pl.side*4.5*u;}else{r.y=mix(T.ry0,T.line0+tn.margin,u);r.x=T.rx0+pl.side*.8*u;}if(b.decoy)A[6].y=mix(T.dy0,T.line0+5.5,u);}
   else if(T.kind==='feet')r.y=mix(T.ry0,T.line0+3.8,u);else if(T.kind==='long')r.y=mix(T.ry0,36.5,u);
   else{r.x+=clamp(tg[5][0]-r.x,-8*h,8*h);r.y+=clamp(tg[5][1]-r.y,-8*h,8*h);A[6].x+=clamp(tg[6][0]-A[6].x,-8*h,8*h);A[6].y+=clamp(tg[6][1]-A[6].y,-8*h,8*h);}
   if(s.bt>=T.W)kick();}
  else if(s.stage==='air'){const r=A[5];
   if(b.k==='feet'){const u=Math.min(1,s.bt/.4);s.ball.x=mix(from.x,r.x,u);s.ball.y=mix(from.y,r.y+.6,u);if(u>=1){s.holder=5;nextBeat();}}
   else{const dur=tn.sw*1.15,u=Math.min(1,s.bt/dur),lx=r.x*.6,ly=12;r.y=Math.max(ly+1,r.y-9.5*h);s.ball.x=mix(from.x,lx,u);s.ball.y=mix(from.y,ly,u);s.ball.h=Math.sin(u*Math.PI)*6;
    if(u>=1){s.ball.h=0;if(s.lineY<=HL.sweepLine)startRes('swept',{stop:'swept',dur:1.1,ball:[[0,lx,ly],[.25,s.keeper.x,5],[.9,-plan().side*10,26]]});else through('long',.8);}}}
  if(s.phase==='play')pressTick(h);}

 const api={
  state:s,team,tn,plans:plans as readonly WavePlan[],backs:n,
  advance(dt:number){acc+=Math.min(.25,Math.max(0,dt));while(acc>=HL.step){acc-=HL.step;tick();}},
  drain(cb:(e:HlEvent)=>void){while(events.length)cb(events.shift()!);},
  /** the team card is read: kick off */
  ack(){if(s.phase!=='tip')return false;startWave();return true;},
  /** where the line should go (it follows at its own speed) */
  move(y:number,x:number){s.wantY=clamp(y,HL.minY,HL.maxY);s.wantX=clamp(x,-HL.maxX,HL.maxX);},
  nudge(dy:number,dx:number){api.move(s.wantY+dy,s.wantX+dx);},
  /** send defender i to press the player on the ball (only midfielders can be pressed; one presser at a time) */
  press(i:number){if(s.phase!=='play'||s.press||i<0||i>=n||s.stage==='air')return false;const to=s.stage==='fly'?beat().to:s.holder;if(to>2)return false;s.press={i,to,st:'go'};s.stats.presses++;emit('press',i,to);return true;},
  /** the defender nearest the ball (the one a key press or a bot sends) */
  nearest(){let b=0,bd=1e9;for(let i=0;i<n;i++){const d=Math.hypot(s.defs[i].x-s.ball.x,s.defs[i].y-s.ball.y);if(d<bd){bd=d;b=i;}}return b;},
  secondLast,
  /** what a player can SEE right now (the bots use only this) */
  look(){const b=beat(),play=s.phase==='play',hold=play&&s.stage==='hold';return {play,stage:s.stage,tell:play&&s.tell?{kind:s.tell.kind,t:s.bt,W:s.tell.W}:null,
   /** the ball has run away from the passer's feet */heavy:hold&&b.k==='heavy',/** the passer waits with a foot on the ball for the bent run */waiting:hold&&b.k==='bend',
   /** the ball is on its way to a winger, or at his feet: which side */wide:play&&b.k==='wide'&&(s.stage==='fly'||hold)?(s.atk[b.to].x<0?-1:1):0,
   /** the passer far back in his own half with the ball coming to him or at his feet: a long ball is on */deepPasser:play&&b.k==='long',
   ballX:s.ball.x,carrier:play&&s.stage!=='air'?(s.stage==='fly'?b.to:s.holder):-1};},
 };
 return api;
}
export const TELLS:readonly TellKind[]=['thru','feet','long','shot'];
export const OFFSIDE_REASONS:readonly OffsideReason[]=['offside','level','onside','ownhalf','behindball'];
/** Coins: 1 per 400 points of a match. */
export const holdthelineCoins=(score:number)=>Math.floor(Math.max(0,score)/400);
