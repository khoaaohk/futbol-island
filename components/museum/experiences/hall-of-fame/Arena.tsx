'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type KeyboardEvent as RKeyboardEvent,type MouseEvent as RMouseEvent,type PointerEvent as RPointerEvent,type ReactElement} from 'react';
import {museumSfx} from '@/lib/museum/museumSound';
import {Line,Wire} from '../anatomy/draw';
import {iso,lineOnTop,planOutline,ring} from '../anatomy/iso-kit';
import StepCheck,{type CheckItem} from '../modern/StepCheck';
import Ending from '../modern/Ending';
import {BEST_KEY,FIN,GAME_OF,INT,OVER,STEP,THR,TRIES,act,actors,crossing,good,keeperReach,leanAt,moving,newAttempt,roundScore,sanitizeBests,sling,stars,step,title,toUV,uv,type Act,type Att,type Bests,type GameId,type Grade,type Phase,type Res,type V} from './arenaRules';
import {LEGENDS,POSITIONS,POSITION_NO,QUIZ} from './legends';
import {FRAME,GOAL,TOP,ballItems,boardItems,depthAt,fitBoard,floorAt,fromRender,goalBack,goalFront,growOf,kindOf,meRing,offset,piece,pieceShadow,toRender,type Item,type PieceKind,type Sorted} from './board';
import {coverScene,cupItems,positionScene} from './plinths';
import {useFrameLoop} from '../anatomy/paper-loop';
import {useSize} from '../anatomy/hooks';
import {useReduced} from '../modern/hooks';
import Draw,{Sized} from './Draw';
import s from './Experience.module.css';

/**
 * Hall of Fame · the Legends Arena (Oct 10 2026 game; Oct 12 2026 anatomy restyle: an isometric tabletop pitch in the Paper
 * theme, the ball the one accent). Six positions, each with a woman and a man from the game's cards; pick one and step onto the
 * model pitch as them. Every position is a skill game about its job (arenaRules.ts): the save, the overlap, the interception,
 * the through ball, the 1-v-1, the finish. Three tries each, scored and graded (perfect / great / good, or early / late / miss
 * with the reason), then the legend's plaque: the score and stars, the job, one sourced fact, the best score per legend (this
 * browser only). Play all six and the final whistle brings the quick check ("whose job is it?"); the shared Ending then marks
 * the visit complete (onDone, once).
 *
 * The stage fills the screen: the board grows to the stage's shape (board.ts fitBoard). Controls: taps (dive, step in), drags
 * (pull back and let go to pass or shoot; drag in to fake, out to burst) and press-and-hold (run, let go to cross); the dock
 * repeats every move as buttons, and the keys work too (arrows aim, Enter acts).
 * Heat: the board is built once per stage size; ONE frame loop (anatomy/paper-loop.ts useFrameLoop) runs only while a try is live or its ball still moves,
 * parks off-screen / in a hidden tab and is cancelled on unmount. Motion is transforms on the pieces. Reduced motion:
 * turn-based (time moves only on "Wait"; the deciding move resolves at once), no CSS motion.
 */
type View='intro'|'hall'|'play'|'round'|'check'|'final';
const sfx=(c:'click'|'kick'|'net'|'whistle'|'stamp'|'reveal'|'tick'|'look'|'crowd')=>{try{museumSfx[c]();}catch{/* sound is optional */}};
const readBests=():Bests=>{try{return sanitizeBests(JSON.parse(localStorage.getItem(BEST_KEY)??'{}'),LEGENDS.map(l=>l.id));}catch{return {};}};
const saveBests=(b:Bests)=>{try{localStorage.setItem(BEST_KEY,JSON.stringify(b));}catch{/* private mode */}};
const WORD:Record<Grade,string>={perfect:'Perfect',great:'Great',good:'Good',early:'Early',late:'Late',miss:'Miss'};

/** What to do, per game (the hint corner and the dock's instruction). */
export const HOW:Record<GameId,{hint:string;say:string;verb:string}>={
 save:{hint:'Tap to kick off · then tap where the shot is going',say:'Wait for the strike, then tap the goal line where the ball is going. Go too soon and the striker picks the other corner!',verb:'Dive'},
 overlap:{hint:'Hold to run past your winger · let go to cross',say:'Hold to sprint up the line. Your winger passes when you go past. Let go to cross inside the marked zone: past the defender, before the byline.',verb:'Run'},
 intercept:{hint:'Tap to kick off · then tap the pass line to step in',say:'Watch the passer. As they wind up to pass, tap a spot on the line to the striker. Move too soon and they’ll see you!',verb:'Step in'},
 through:{hint:'Tap to kick off · drag back, let go to pass',say:'Your team-mate will sprint behind the defenders. Pull back from anywhere and let go to pass through the gap as the run starts.',verb:'Pass'},
 beat:{hint:'Drag in to fake · drag out to burst past',say:'Fake inside to make the defender lean, then burst down the line while he is leaning. One fake works; two don’t.',verb:'Burst'},
 finish:{hint:'Tap to kick off · drag back, let go to shoot',say:'Shoot before the keeper sets and the defender gets back. Aim for the corner away from the keeper; past 80% power it flies over.',verb:'Shoot'},
};
const BEATS=[
 {n:'01',head:'Every position has a job',text:'The keeper stops shots, full-backs overlap, centre-backs win the ball, midfielders find the pass, wingers beat their player, strikers score.'},
 {n:'02',head:'Every job has its heroes',text:'Twelve legends: one from the women’s game and one from the men’s for every position.'},
 {n:'03',head:'Play their move',text:'Step onto the model pitch as a legend. Three tries each: time it, aim it, and see if you can play it like them.'},
] as const;
const CHECKS:readonly CheckItem[]=QUIZ.map(q=>{const p=POSITIONS.find(x=>x.position===q.position)!;
 return {q:`“${p.job}” Whose job is this?`,options:q.choices,right:q.choices.indexOf(q.position),why:`That’s the ${q.position.toLowerCase()}’s job, like ${p.legends.map(l=>l.name).join(' and ')}.`};});
const litItems=(items:Item[])=>items.map(i=>i.k==='solid'?{...i,lit:true}:i.k==='ball'?{...i,cls:'head lit'}:i);

const coverBuild=(w:number,h:number)=>coverScene(w,h);
const posBuild=(w:number,h:number)=>positionScene(w,h,1.25);
const cupBuild=(w:number,h:number)=>{const sc=positionScene(w,h,1.1);return {P:sc.P,groups:[sc.groups[0],sc.groups[1],{key:3,items:cupItems(sc.P,0,0,1.1,true)}]};};

export default function Arena({onDone}:{onDone:()=>void}){
 const reduced=useReduced();
 const stageRef=useRef<HTMLDivElement>(null),svgRef=useRef<SVGSVGElement>(null);
 const size=useSize(stageRef);
 const [view,setView]=useState<View>('intro');
 const [legendId,setLegendId]=useState(LEGENDS[0].id);
 const legend=LEGENDS.find(l=>l.id===legendId)??LEGENDS[0],game=GAME_OF[legend.position],partner=POSITIONS.find(p=>p.position===legend.position)!.legends.find(l=>l.id!==legend.id)!;
 const seed=useRef(Date.now()%100000),tryNo=useRef(0);
 const att=useRef<Att>(newAttempt(game,seed.current));
 const [phase,setPhase]=useState<Phase>('ready'),[tries,setTries]=useState<Res[]>([]),[last,setLast]=useState<Res|null>(null);
 const [bests,setBests]=useState<Bests>({}),[newBest,setNewBest]=useState(false),[rounds,setRounds]=useState<Record<string,number>>({});
 const [firstRight,setFirstRight]=useState(0);
 const [,setFrame]=useState(0);const redraw=useCallback(()=>setFrame(f=>(f+1)%1e6),[]);
 const kb=useRef<{y:number;p:V;ang:number}>({y:0,p:uv(9,1),ang:0});
 useEffect(()=>{setBests(readBests());},[]);
 const played=useMemo(()=>new Set(Object.keys(rounds)),[rounds]);
 const total=Object.values(rounds).reduce((a,b)=>a+b,0);

 // ---- the board: built once per game and stage size ----
 const geo=useMemo(()=>size.w>40&&size.h>40?fitBoard(game,size.w,size.h):null,[game,size.w,size.h]);
 const P=geo?.P;
 const board=useMemo(()=>geo?<Draw items={[...boardItems(game,geo.plan,geo.P),...(FRAME[game]==='goal'&&game!=='overlap'?goalBack(geo.P):[])]}/>:null,[geo,game]);
 const pieces=useMemo(()=>{if(!P)return null;const g=growOf(P);return {stand:piece(P,'stand',g),diveL:piece(P,'diveL',g),diveR:piece(P,'diveR',g),litStand:litItems(piece(P,'stand',g)),litDiveL:litItems(piece(P,'diveL',g)),litDiveR:litItems(piece(P,'diveR',g)),ring:meRing(P,g),shadow:pieceShadow(P,g)};},[P]);
 const posts=useMemo(()=>P&&FRAME[game]==='goal'&&game!=='overlap'?goalFront(P):[],[P,game]);

 const resolved=useCallback(()=>{const a=att.current,r=a.res;if(!r)return;setPhase('done');setLast(r);setTries(t=>[...t,r]);
  sfx(r.grade==='perfect'?'stamp':good(r.grade)?(a.g.kind==='finish'?'net':'reveal'):'whistle');},[]);
 const loop=useFrameLoop(dt=>{const a=att.current,had=!!a.res;step(a,dt);if(!had&&a.res)resolved();redraw();return moving(a);},stageRef,reduced);

 /** One move from the player (stage, dock or keys). */
 const doAct=useCallback((x:Act)=>{const a=att.current;if(view!=='play'||a.phase==='done')return;const was=a.phase,had=!!a.res;const decided=act(a,x);
  if(was==='ready'&&a.phase!=='ready'){setPhase('live');sfx('tick');}
  if(x.kind==='fling'||x.kind==='burst'||(x.kind==='release'&&decided))sfx('kick');
  if(!had&&a.res)resolved();
  redraw();
  if(!reduced||decided||a.res)loop.wake();},[view,reduced,resolved,redraw,loop]);
 /** Reduced motion: the next moment (STEP seconds), turn by turn. */
 const wait=()=>{const a=att.current;if(a.phase!=='live')return;const had=!!a.res;for(let i=0;i<8;i++)step(a,STEP/8);if(!had&&a.res){resolved();loop.wake();}sfx('tick');redraw();};

 const begin=(id:string)=>{const l=LEGENDS.find(x=>x.id===id)!;setLegendId(id);tryNo.current=0;att.current=newAttempt(GAME_OF[l.position],seed.current+LEGENDS.indexOf(l)*31);
  setTries([]);setLast(null);setPhase('ready');setNewBest(false);setView('play');sfx('look');kb.current={y:0,p:uv(9,1),ang:0};loop.stop();
  setTimeout(()=>svgRef.current?.focus({preventScroll:true}),0);};
 const nextTry=()=>{sfx('click');
  if(tries.length>=TRIES){const sc=roundScore(tries),b=bests[legend.id]??0;if(sc>b){const nb={...bests,[legend.id]:sc};setBests(nb);saveBests(nb);setNewBest(true);}
   setRounds(r=>({...r,[legend.position]:sc}));setView('round');sfx('crowd');return;}
  tryNo.current=tries.length;att.current=newAttempt(game,seed.current+LEGENDS.indexOf(legend)*31+tries.length*7+1);setLast(null);setPhase('ready');redraw();};
 const nextPosition=()=>{const order=POSITIONS.map(p=>p.position),i=order.indexOf(legend.position);
  const nxt=order.find((p,k)=>k>i&&!played.has(p))??order.find(p=>!played.has(p));
  if(!nxt){sfx('click');setView('check');return;}
  const pos=POSITIONS.find(p=>p.position===nxt)!;begin((pos.legends.find(l=>l.game===legend.game)??pos.legends[0]).id);};

 // ---- the stage: taps, drags, holds (stage px → the board's floor → the game's frame) ----
 const world=(e:{clientX:number;clientY:number}):V=>{const el=svgRef.current;if(!el||!P)return {x:0,y:0};const r=el.getBoundingClientRect();const [X,Y]=floorAt(P,e.clientX-r.left,e.clientY-r.top);return fromRender(game,X,Y);};
 const from=useRef<{w:V;x:number;y:number;id:number}|null>(null);
 const canDrag=view==='play'&&phase!=='done';
 const down=(e:RPointerEvent<SVGSVGElement>)=>{if(!canDrag||e.button>0||from.current)return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  from.current={w:world(e),x:e.clientX,y:e.clientY,id:e.pointerId};if(game==='overlap'&&!reduced)doAct({kind:'press'});};
 const move=(e:RPointerEvent<SVGSVGElement>)=>{const f=from.current,a=att.current;if(!f||f.id!==e.pointerId)return;
  if((game==='through'||game==='finish')&&a.phase==='live'){const w=world(e);a.pull={x:w.x-f.w.x,y:w.y-f.w.y};redraw();}};
 const up=(e:RPointerEvent<SVGSVGElement>,cancelled=false)=>{const f=from.current,a=att.current;if(!f||f.id!==e.pointerId)return;from.current=null;
  if(cancelled){a.pull=null;if(game==='overlap'&&!reduced)doAct({kind:'release'});redraw();return;}
  const moved=Math.hypot(e.clientX-f.x,e.clientY-f.y)>6,w=world(e);
  if(game==='overlap'){if(reduced)primary();else doAct({kind:'release'});return;}
  if(a.phase==='ready'&&game!=='beat'){a.pull=null;doAct({kind:'tap',p:w});return;}
  if(game==='save'||game==='intercept'){doAct({kind:'tap',p:w});return;}
  if(game==='through'||game==='finish'){const pull=a.pull;a.pull=null;if(moved&&pull)doAct({kind:'fling',pull});else redraw();return;}
  if(game==='beat'){const d=toUV({x:w.x-f.w.x,y:w.y-f.w.y});if(!moved){if(a.phase==='ready')doAct({kind:'fake'});return;}
   doAct(d.v<-.25&&Math.abs(d.v)>=Math.abs(d.u)*.7?{kind:'fake'}:{kind:'burst'});}};

 // ---- keys and dock buttons ----
 const aimMark=()=>{const a=att.current;if(game==='save')a.aim={x:0,y:kb.current.y};if(game==='intercept')a.aim=kb.current.p;
  if(game==='through'||game==='finish'){const b=a.ball,base=game==='finish'?Math.atan2(0-FIN.ball.y,0-FIN.ball.x):Math.atan2(uv(17,1).y-b.y,uv(17,1).x-b.x),an=base+kb.current.ang;a.pull={x:-Math.cos(an)*1.9,y:-Math.sin(an)*1.9};}
  redraw();};
 const fling=(c:number)=>{const a=att.current;if(a.phase==='ready'){doAct({kind:'tap',p:{x:0,y:0}});return;}aimMark();const pull=a.pull;if(!pull)return;const L=Math.hypot(pull.x,pull.y),Pw=.3+c*3.6;a.pull=null;doAct({kind:'fling',pull:{x:pull.x/L*Pw,y:pull.y/L*Pw}});};
 const primary=()=>{const a=att.current;
  if(a.phase==='done'){nextTry();return;}
  switch(game){
   case 'save':if(a.phase==='ready')doAct({kind:'tap',p:{x:0,y:0}});else doAct({kind:'tap',p:{x:0,y:kb.current.y}});break;
   case 'intercept':if(a.phase==='ready')doAct({kind:'tap',p:{x:0,y:0}});else doAct({kind:'tap',p:kb.current.p});break;
   case 'overlap':if(a.g.kind==='overlap'&&a.g.holding)doAct({kind:'release'});else doAct({kind:'press'});break;
   case 'beat':doAct({kind:'burst'});break;
   default:fling(.45);
  }};
 const nudge=(dx:number,dy:number)=>{if(view!=='play'||att.current.phase==='done')return;const k=kb.current;
  if(game==='save')k.y=Math.max(-3.6,Math.min(3.6,k.y+dx*.6));
  else if(game==='intercept'){const c=toUV(k.p);k.p=uv(Math.max(1,Math.min(21,c.u+dy*.8)),Math.max(-8,Math.min(7,c.v+dx*.8)));}
  else if(game==='through'||game==='finish')k.ang+=dx*.05;
  else if(game==='beat'){if(dx<0)doAct({kind:'fake'});else doAct({kind:'burst'});return;}
  aimMark();};
 const onKey=(e:RKeyboardEvent)=>{const m:Record<string,()=>void>={ArrowLeft:()=>nudge(-1,0),ArrowRight:()=>nudge(1,0),ArrowUp:()=>nudge(0,-1),ArrowDown:()=>nudge(0,1),Enter:()=>{if(view==='play')primary();},' ':()=>{if(view==='play')primary();}};
  const f=m[e.key];if(f&&view==='play'){e.preventDefault();f();}};
 // The run button: press and hold (pointer), or Enter to start and Enter again to cross. Reduced motion: a toggle (tap to run,
 // Wait moves time on, tap again to cross), since one finger can't hold Run and tap Wait at once.
 const hold=reduced?{onClick:()=>primary()}:{onPointerDown:(e:RPointerEvent<HTMLButtonElement>)=>{if(e.button>0)return;try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}doAct({kind:'press'});},
  onPointerUp:()=>doAct({kind:'release'}),onPointerCancel:()=>doAct({kind:'release'}),onClick:(e:RMouseEvent)=>{if(e.detail===0)primary();},onContextMenu:(e:RMouseEvent)=>e.preventDefault()};
 // The charge button (pass / shoot): hold to charge (a CSS bar fills over 1.2 s), let go to play it; a quick tap plays 45%.
 const charge=useRef<{t:number;id:number}|null>(null);
 const chargeBtn={onPointerDown:(e:RPointerEvent<HTMLButtonElement>)=>{if(e.button>0)return;if(att.current.phase==='ready'){primary();return;}try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}charge.current={t:performance.now(),id:e.pointerId};e.currentTarget.dataset.charging='';aimMark();},
  onPointerUp:(e:RPointerEvent<HTMLButtonElement>)=>{const c=charge.current;delete e.currentTarget.dataset.charging;if(!c||c.id!==e.pointerId)return;charge.current=null;const ms=performance.now()-c.t;fling(ms<180?.45:Math.min(1,ms/1200));},
  onPointerCancel:(e:RPointerEvent<HTMLButtonElement>)=>{delete e.currentTarget.dataset.charging;charge.current=null;},
  onClick:(e:RMouseEvent)=>{if(e.detail===0)primary();},onContextMenu:(e:RMouseEvent)=>e.preventDefault()};

 const a=att.current,live=view==='play'&&phase==='live',ready=view==='play'&&phase==='ready',done=view==='play'&&phase==='done';
 const pos=POSITIONS.find(p=>p.position===legend.position)!;
 const rs=roundScore(tries),st=stars(rs),best=bests[legend.id]??0;

 // ---- the live readout: real numbers from the model ----
 const readout=(()=>{const g=a.g;
  if(a.phase==='ready')return `Try ${Math.min(TRIES,tries.length+1)}/${TRIES} · ready`;
  if(a.res)return `${WORD[a.res.grade]} +${a.res.points}`;
  switch(g.kind){
   case 'save':return a.t<g.strikeAt?'Wait for the strike…':`Ball in the air · ${Math.max(0,(g.strikeAt+1.05-a.t)).toFixed(1)} s`;
   case 'overlap':return `${g.v.toFixed(1)} m/s · ${Math.max(0,g.x).toFixed(1)} m to the byline`;
   case 'intercept':return a.t<g.passAt-.35?'Watch the passer…':a.t<g.passAt?'Wind-up!':'The pass is on';
   case 'through':{const p=a.pull?sling(a.pull):null;return p?`Pass ${Math.round(p.power*100)}% · ${(7+p.power*15).toFixed(0)} m`:a.t<g.runAt?'Wait for the run…':a.t<g.runAt+THR.closeAfter?'The run is on: pass!':'The gap is closing';}
   case 'beat':return `Defender lean ${Math.round(leanAt(g.fakes,a.t)*100)}%`;
   case 'finish':{const p=a.pull?sling(a.pull):null;return `Keeper reach ${keeperReach(a.t,p?.power??0).toFixed(1)} m${p?` · power ${Math.round(p.power*100)}%`:''}`;}
  }})();
 const lean=a.g.kind==='beat'?leanAt(a.g.fakes,a.t):0;

 // ---- the moving layer: aim marks on the floor, then pieces, ball and goal frame sorted back to front ----
 const dyn=(()=>{if(!P||!pieces||view!=='play')return null;const floor:ReactElement[]=[],sorted:(Sorted&{el?:ReactElement})[]=[...posts];
  const R=(p:V)=>toRender(game,p);
  if(game==='intercept'){const [px,py]=R(INT.passer);for(const t of [INT.a,INT.b]){const [tx,ty]=R(t);floor.push(<Line key={'lane'+tx} d={lineOnTop([px,py],[tx,ty],TOP+.06,P)} tone="faint"/>);}}
  if(game==='overlap'){const zone=OVER.zone;floor.push(<Line key="zone" d={planOutline({x:zone[0],y:OVER.lane-.75,w:zone[1]-zone[0],d:1.5,r:.3},TOP+.06,P,6)} tone="lit" className="accentLine"/>);}
  if(a.aim&&(game==='save'||game==='intercept')){const [X,Y]=R(a.aim);
   floor.push(game==='save'?<Line key="aim" d={lineOnTop([.25,Y-.7],[.25,Y+.7],TOP+.06,P)} tone="lit" className="accentLine aimBar"/>:<g key="aim"><Line d={ring(X,Y,.6,TOP+.06,P,32)} tone="lit" className="accentLine"/><Line d={ring(X,Y,.18,TOP+.06,P,16)} tone="lit" className="accentLine"/></g>);}
  if(a.pull&&(game==='through'||game==='finish')){const sl=sling(a.pull);if(sl){const b=a.ball,len=game==='through'?7+sl.power*15:3+sl.power*6;
   const [bx,by]=R({x:b.x,y:b.y}),[tx,ty]=R({x:b.x+sl.dir.x*len,y:b.y+sl.dir.y*len});
   floor.push(<Wire key="pull" from={iso([bx,by,TOP+.06],P)} to={iso([tx,ty,TOP+.06],P)} tone="lit" ends="to" size={3}/>);
   if(game==='finish'){const cy=crossing(FIN.ball,sl.dir);if(cy!=null&&Math.abs(cy)<6)floor.push(<Line key="cross" d={ring(0,cy,.35,TOP+.06,P,20)} tone="lit" className="accentLine"/>);}}}
  for(const ac of actors(a)){const [X,Y]=R({x:ac.x,y:ac.y}),kind:PieceKind=kindOf(ac),me=ac.team==='me';
   const items=me?(kind==='stand'?pieces.litStand:kind==='diveL'?pieces.litDiveL:pieces.litDiveR):pieces[kind];
   const [dx,dy]=offset(P,X,Y,ac.z);
   sorted.push({key:depthAt(P,X,Y),items:[],el:<g key={"p-"+ac.id} transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`} className={`hof-piece hof-${ac.team}`} data-piece={ac.id}>
    <Draw items={[pieces.shadow,...(me?pieces.ring:[]),...items]}/></g>});}
  const [bX,bY]=R({x:a.ball.x,y:a.ball.y}),bi=ballItems(P,bX,bY,a.ball.z);
  floor.push(<Draw key="bshadow" items={[bi.shadow]}/>);
  sorted.push({key:depthAt(P,bX,bY)+.02,items:[bi.ball]});
  sorted.sort((p,q)=>p.key-q.key);
  return <>{floor}{sorted.map((x,i)=>x.el??<Draw key={'s'+i} items={x.items}/>)}</>;})();

 const label=`${legend.name} as the ${legend.position.toLowerCase()} on a model pitch. ${HOW[game].say}`;
 const result=done&&last?<div className={s.result} data-kind={good(last.grade)?'good':'bad'} role="status" key={tries.length}>
  <b>{WORD[last.grade]}</b>{last.points?<span>+{last.points}</span>:null}</div>:null;

 return <div className={s.arena} data-hof-arena={view} data-hof-game={view==='play'?game:undefined} data-hof-legend={view==='play'?legend.id:undefined} data-hof-phase={view==='play'?phase:undefined} data-hof-result={last?.grade} data-reduced={reduced||undefined}>
  <div className={s.card} data-view={view}>
   {/* ---- the cover ---- */}
   {view==='intro'&&<div className={s.cover}>
    <Sized className={s.coverArt} label="Six plinths on a long plate, one game piece on each, one for every position from goal to goal." build={coverBuild}/>
    <div className={s.coverText}>
     <p className={s.kicker}>Hall of Fame · Legends of the game</p>
     <h2 className={s.display}>Play like a legend.</h2>
     <p className={s.lead}>Six positions, twelve legends, six moves. Pick a legend and step onto the pitch.</p>
     <ol className={s.beats}>{BEATS.map(b=><li key={b.n}><span>{b.n}</span><div><b>{b.head}</b><p>{b.text}</p></div></li>)}</ol>
     <div className={s.row}><button type="button" className={s.btn} data-museum-own-cue data-hof-start onClick={()=>{sfx('click');setView('hall');}}>To the legends</button></div>
    </div>
   </div>}

   {/* ---- the legends: pick who you play as ---- */}
   {view==='hall'&&<div className={s.picker}>
    <div className={s.pickHead}><p className={s.kicker}>Legends of the game · pick who you play as</p><h2 className={s.h2}>Six jobs, twelve legends</h2>
     <p className={s.muted}>{played.size}/6 positions played{played.size>=POSITIONS.length?'.':'. Play all six for the final whistle.'}</p></div>
    <ol className={s.menu} data-hof-menu>{POSITIONS.map(p=><li key={p.position} className={s.menuCard} data-done={played.has(p.position)||undefined}>
     <Sized className={s.menuArt} label="" build={posBuild}/>
     <div className={s.menuBody}>
      <p className={s.menuNo} aria-hidden="true">{POSITION_NO[p.position]}</p>
      <p className={s.menuPos}><b>{p.position}</b><span>{HOW[GAME_OF[p.position]].verb}{played.has(p.position)?` · ${rounds[p.position]} pts`:''}</span></p>
      <span className={s.menuPair}>{p.legends.map(l=><button key={l.id} type="button" className={s.legendBtn} data-legend={l.id} data-game={l.game} onClick={()=>begin(l.id)}
       aria-label={`Play as ${l.name}, ${l.position}, ${l.country}${bests[l.id]!=null?`. Best ${bests[l.id]} points`:''}`}><b>{l.name}</b><small>{l.country}{bests[l.id]!=null?` · best ${bests[l.id]}`:''}</small></button>)}</span>
     </div>
    </li>)}</ol>
    {played.size>=POSITIONS.length&&<div className={s.row}><button type="button" className={s.btn} data-museum-own-cue data-hof-final onClick={()=>{sfx('click');setView('check');}}>Final whistle: quick check</button></div>}
   </div>}

   {/* ---- the pitch ---- */}
   <div ref={stageRef} className={s.stage} hidden={view!=='play'}>
    {P&&view==='play'&&<svg ref={svgRef} className={`iso-svg ${s.pitch}`} width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} role="img" aria-label={label} tabIndex={0}
     data-hof-stage onKeyDown={onKey} onPointerDown={down} onPointerMove={move} onPointerUp={e=>up(e)} onPointerCancel={e=>up(e,true)} onLostPointerCapture={e=>{if(from.current)up(e,true);}}>
     {board}{dyn}</svg>}
    {view==='play'&&<div className={s.corners} aria-hidden="true">
     <span data-corner="fig">No. {POSITION_NO[legend.position]} · {legend.position}</span>
     <span data-corner="title">{legend.name} · {legend.country}</span>
     <span data-corner="hint">{reduced?(game==='overlap'?'Tap Run · Wait moves time on · tap again to cross':`${HOW[game].hint} · Wait moves time on`):HOW[game].hint}</span>
     <span data-corner="readout" data-hof-readout>{readout}</span>
    </div>}
    {view==='play'&&game==='beat'&&<div className={s.lean} aria-hidden="true"><i style={{transform:`scaleX(${lean.toFixed(3)})`}}/><span>Lean</span></div>}
    {result}
   </div>

   {/* ---- the plaque ---- */}
   {view==='round'&&<div className={s.plaque}>
    <Sized className={s.plaqueArt} label={`${legend.name}'s plinth${st>=2?' with a cup':''}.`} build={st>=2?cupBuild:posBuild}/>
    <div className={s.plaqueText}>
     <p className={s.kicker}>{legend.position} · {legend.name}</p>
     <p className={s.score}><b data-hof-score={rs}>{rs}</b><span>of {TRIES*100} points</span></p>
     <p className={s.stars} role="img" aria-label={`${st} of 3 stars`}>{[0,1,2].map(i=><i key={i} data-on={i<st||undefined}/>)}</p>
     <p className={s.body}>{newBest?<b>New best for {legend.name}! </b>:<>Best for {legend.name}: <b>{best}</b>. </>}{tries.map(r=>WORD[r.grade]).join(' · ')}</p>
     <p className={s.body}><b>The job: </b>{legend.job}</p>
     <p className={s.body}><b>Hall of fame: </b>{legend.fact} <a className={s.src} href={legend.source.url} target="_blank" rel="noreferrer">Source</a></p>
     <div className={s.row}>
      <button type="button" className={s.btn} data-museum-own-cue data-hof-next onClick={nextPosition}>{played.size>=POSITIONS.length?'Final whistle':'Next position'}</button>
      <button type="button" className={s.ghost} data-hof-partner onClick={()=>begin(partner.id)}>Play as {partner.name}</button>
      <button type="button" className={s.ghost} data-hof-again onClick={()=>begin(legend.id)}>Try again</button>
      <button type="button" className={s.ghost} data-hof-hall onClick={()=>{sfx('click');setView('hall');}}>All legends</button>
     </div>
    </div>
   </div>}

   {/* ---- the final whistle ---- */}
   {view==='check'&&<div className={s.check}>
    <p className={s.kicker}>Final whistle · quick check</p><h2 className={s.h2}>Whose job is it?</h2>
    <StepCheck items={CHECKS} kicker={(i,n)=>`Job ${i+1} of ${n}`} nextLabel="Next job" doneLabel="See your hall"
     onPick={ok=>sfx(ok?'stamp':'look')} onDone={sc=>{setFirstRight(sc);setView('final');sfx('reveal');}}/>
   </div>}
   {view==='final'&&<div className={s.final} data-hof-check-done>
    <p className={s.kicker}>Full time · six positions</p>
    <p className={s.score}><b data-hof-total={total}>{total}</b><span>of {POSITIONS.length*TRIES*100} points · {title(total)}</span></p>
    <p className={s.body}><b>{firstRight} of {CHECKS.length}</b> jobs right first time. Every job on the pitch is about the moment and the aim: the keeper’s dive, the full-back’s run, the defender’s step, the midfielder’s pass. Know your job, and your team-mates’ jobs too.</p>
    <Ending reached onComplete={onDone} art={<Sized className={s.endArt} label="A trophy cup on a plinth." build={cupBuild}/>}
     seen="You’ve played all six positions, like the legends of the game."
     take="Before every game, know your job, and know your team-mates’ jobs too."/>
    <div className={s.row}><button type="button" className={s.ghost} onClick={()=>{sfx('click');setView('hall');}}>Back to the legends</button></div>
   </div>}
  </div>

  {/* ---- the dock: tries, score and every move as a button ---- */}
  {view==='play'&&<div className={s.dock}>
   <div className={s.tally}>
    <p className={s.pips} role="img" aria-label={`Try ${Math.min(TRIES,tries.length+1)} of ${TRIES}`}>{Array.from({length:TRIES},(_,i)=><i key={i} data-r={tries[i]?(good(tries[i].grade)?'good':'miss'):undefined}/>)}</p>
    <p className={s.stat}><b>{rs}</b><span>Score</span></p><p className={s.stat}><b>{best}</b><span>Best</span></p>
   </div>
   <p className={s.say} aria-live="polite">{done&&last?last.why:HOW[game].say}</p>
   <div className={s.buttons}>
    {ready&&tries.length===0&&<span className={s.toggle} role="group" aria-label="Play as">{pos.legends.map(l=><button key={l.id} type="button" aria-pressed={l.id===legend.id} onClick={()=>begin(l.id)} aria-label={`Play as ${l.name}`}>{l.name.split(' ').slice(-1)[0]}</button>)}</span>}
    {done?<button key="next" type="button" className={s.btn} data-museum-own-cue data-hof-next-try onClick={nextTry}>{tries.length>=TRIES?'See the score':'Next try'}</button>
     :game==='overlap'?<button key="run" type="button" className={s.holdBtn} data-hof-run {...hold}>{a.g.kind==='overlap'&&a.g.holding?(reduced?'Tap: cross!':'Let go: cross!'):(reduced?'Tap: run':'Hold: run')}</button>
     :ready&&game!=='beat'?<button key="kick" type="button" className={s.btn} data-hof-kickoff onClick={()=>primary()}>Kick off</button>
     :game==='save'?<><button type="button" className={s.btn} data-hof-dive="left" onClick={()=>doAct({kind:'tap',p:{x:0,y:-2.4}})}>◂ Dive</button><button type="button" className={s.btn} data-hof-dive="right" onClick={()=>doAct({kind:'tap',p:{x:0,y:2.4}})}>Dive ▸</button></>
     :game==='beat'?<><button type="button" className={s.btn} data-hof-fake onClick={()=>doAct({kind:'fake'})}>◂ Fake</button><button type="button" className={s.btn} data-hof-burst onClick={()=>doAct({kind:'burst'})}>Burst ▸</button></>
     :game==='intercept'?<button key="step" type="button" className={s.btn} data-hof-step onClick={()=>primary()}>Step in</button>
     :<button key="fling" type="button" className={s.chargeBtn} data-hof-fling {...chargeBtn}><i aria-hidden="true"/><span>Hold: {HOW[game].verb.toLowerCase()}</span></button>}
    {reduced&&live&&<button type="button" className={s.ghost} data-hof-wait onClick={wait}>Wait</button>}
    <button type="button" className={s.ghost} data-hof-menu-open onClick={()=>{sfx('click');loop.stop();setView('hall');}}>Legends</button>
   </div>
  </div>}
 </div>;
}
