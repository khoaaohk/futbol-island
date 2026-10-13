'use client';
import {useCallback,useRef,useState} from 'react';
import PixelStage,{type StageApi,type StageSize} from '../Stage';
import type {Pixmap} from '../raster';
import {ActionButton,Banner,Cabinet,Note,Pips,PixelButton,QuickCheck,Row,Say,ScoreScreen,Stats,StoryIntro,type Check} from '../Cabinet';
import {useDrag,useKeys,usePlayLoop,useReadout,useReduced} from '../hooks';
import {toWorld} from '../iso';
import {UI} from '../palette';
import {BALL0,ROUND,aimOf,buildScene,cameraFor,flightAt,flightSeconds,heightOf,outcome,type DemoState,type Result} from './model';

/**
 * pixeliso · the kit demo (Oct 10 2026, /museum-lab/pixeliso, dev only). A pitch corner in pixel isometric: the goal and its
 * net, a keeper and a striker, the ball, a corner flag, a floodlight and a scoreboard; the cabinet card with its HUD.
 * Play: drag back from anywhere on the pitch (a slingshot: the ball goes the other way, further = harder), let go to kick.
 * Or aim with the arrow keys and HOLD the Kick button to charge. Five kicks, then the score screen and a quick check.
 * Heat: the stage draws on change; the loop runs only while the ball flies, sleeps off-screen, and is disposed on unmount.
 */
const BEATS=[
 {when:'The kit',head:'One pixel grid',text:'Every exhibit is drawn on the same 2:1 isometric grid: one metre of floor is a 16 × 8 tile.'},
 {when:'The rule',head:'Play, not read',text:'Each exhibit is a game: you aim, drag, time, build or operate the thing it is about.'},
] as const;
const CHECK:Check={q:'Why does a harder kick beat the keeper more often?',options:['He has less time to reach it','The ball gets smaller','The goal gets wider'],right:0,why:'A faster ball reaches the line sooner, so the keeper covers less of the goal before it arrives.'};
const WORD:Record<Result,{kind:'good'|'ok'|'bad';big:string;line:string}>={
 goal:{kind:'good',big:'GOAL!',line:'Past the keeper’s reach.'},saved:{kind:'ok',big:'SAVED',line:'Inside his reach: kick harder or wider.'},
 wide:{kind:'bad',big:'WIDE',line:'Outside the posts.'},over:{kind:'bad',big:'OVER',line:'Too hard: it cleared the bar.'}};

export default function Demo(){
 const stage=useRef<StageApi>(null),screen=useRef<HTMLDivElement>(null),reduced=useReduced();
 const st=useRef<DemoState>({pull:null,shot:null,t:0,flagFrame:0,goals:0});
 const [phase,setPhase]=useState<'intro'|'aim'|'flying'|'result'|'score'>('intro');
 const [results,setResults]=useState<Result[]>([]),[last,setLast]=useState<Result|null>(null),[picked,setPicked]=useState<number|null>(null),[power,setPower]=useState(0);
 const {ref:readRef,say}=useReadout<HTMLParagraphElement>();
 const keyAim=useRef(7.6);

 const render=useCallback((pm:Pixmap,size:StageSize)=>{buildScene(st.current).paint(pm,cameraFor(size.w,size.h));},[]);
 const sayAim=(ty:number|null,p:number)=>say(ty==null?'AIM: PULL BACK':`AIM ${ty.toFixed(1)} M · POWER ${Math.round(p*100)}%`);

 // The flight: one loop, alive only while the ball moves.
 const loop=usePlayLoop((dt)=>{const s=st.current;if(!s.shot)return false;s.t+=dt;s.flagFrame=Math.floor(s.t*4)%2;
  const end=flightSeconds(s.shot.power)+.9;stage.current?.draw();
  if(s.t>=end||flightAt(s.shot,s.t).done&&s.t>=end){finish();return false;}return true;},{el:screen,fps:30});
 const finish=()=>{const s=st.current;if(!s.shot)return;const r=s.shot.result;if(r==='goal')s.goals++;
  setLast(r);setPhase('result');setResults(list=>{const next=[...list,r];if(next.length>=ROUND)setTimeout(()=>setPhase('score'),reduced?0:1200);return next;});stage.current?.invalidate();};

 const kick=(ty:number,p:number)=>{if(phase!=='aim'&&phase!=='result')return;if(results.length>=ROUND)return;
  const o=outcome(ty,p);st.current={...st.current,pull:null,shot:{ty,h:heightOf(p),power:p,...o},t:0};
  setPhase('flying');setLast(null);say(`KICK ${Math.round(p*100)}%`);loop.wake();};

 // Drag anywhere: the pull is measured on the floor, in metres.
 const start=useRef<{x:number;y:number}|null>(null);
 const drag=useDrag(stage,{disabled:phase!=='aim'&&phase!=='result',
  onStart:p=>{const sz=stage.current?.size;if(!sz)return false;const w=toWorld(cameraFor(sz.w,sz.h),p.x,p.y);start.current=w;if(phase==='result'){setPhase('aim');setLast(null);}},
  onMove:p=>{const sz=stage.current?.size,a=start.current;if(!sz||!a)return;const w=toWorld(cameraFor(sz.w,sz.h),p.x,p.y);st.current.pull={x:w.x-a.x,y:w.y-a.y};
   const aim=aimOf(st.current.pull);sayAim(aim?.ty??null,aim?.power??0);setPower(aim?.power??0);stage.current?.invalidate();},
  onEnd:(_,cancelled)=>{const pull=st.current.pull;st.current.pull=null;start.current=null;const aim=pull&&aimOf(pull);
   if(!cancelled&&aim){keyAim.current=aim.ty;kick(aim.ty,aim.power);}else stage.current?.invalidate();}});
 const nudge=(d:number)=>{if(phase!=='aim'&&phase!=='result')return;if(phase==='result'){setPhase('aim');setLast(null);}
  keyAim.current=Math.max(1.5,Math.min(13,keyAim.current+d));const pull={x:BALL0.x/3,y:-(keyAim.current-BALL0.y)/3};st.current.pull=pull;sayAim(keyAim.current,.4);stage.current?.invalidate();};
 const onKey=useKeys({left:(_,f)=>nudge(f?-.1:-.4),right:(_,f)=>nudge(f?.1:.4),action:()=>kick(keyAim.current,.4)});

 const again=()=>{setResults([]);setPicked(null);setLast(null);st.current={pull:null,shot:null,t:0,flagFrame:0,goals:0};setPhase('aim');stage.current?.invalidate();};
 const goals=results.filter(r=>r==='goal').length;
 const word=last?WORD[last]:null;

 return <main style={{minHeight:'100vh',background:'#f3f1ea',padding:'24px 12px 48px',display:'grid',justifyItems:'center',alignContent:'start',gap:16,overflowX:'hidden'}} data-pixeliso-demo data-phase={phase} data-reduced={reduced||undefined}>
  <Cabinet fig="KIT" title="Pixel iso · pitch corner" onKeyDown={onKey}
   hint={reduced?'Drag back, let go: the kick lands at once':'Drag back from the ball · let go to kick'}
   readout="AIM: PULL BACK" readoutRef={readRef}
   overlay={word&&phase==='result'?<Banner kind={word.kind} big={word.big} line={word.line}/>:null}
   dock={<>
    <Row><Pips results={[...results,...Array<undefined>(ROUND-results.length)].map(r=>r==='goal'?'goal':r==='saved'?'saved':r?'miss':undefined)} total={ROUND} label={`${results.length} of ${ROUND} kicks, ${goals} goals`}/>
     <div style={{flex:'1 1 200px',minWidth:0}}><Say live>{phase==='flying'?'…':last?WORD[last].line:'Pull back further for a harder kick. Too hard and it flies over the bar.'}</Say></div></Row>
    <Row><div style={{flex:'1 1 220px',minWidth:0}}><Stats items={[
      {k:'power',label:'Power',value:`${Math.round(power*100)}%`,frac:power,tone:UI.gold},
      {k:'goals',label:'Goals',value:`${goals}/${results.length}`,frac:results.length?goals/results.length:0,tone:UI.goal},
      {k:'left',label:'Kicks left',value:ROUND-results.length,frac:(ROUND-results.length)/ROUND,tone:UI.reach}]}/></div>
     <ActionButton label="Kick" disabled={phase==='flying'||phase==='intro'||phase==='score'} data-pixel-kick onCharge={c=>{if(c>0){setPower(c);sayAim(keyAim.current,c);}}} onRelease={(c,tap)=>kick(keyAim.current,tap?.4:c)}/></Row>
   </>}
   cover={phase==='intro'?<StoryIntro kicker="Museum kit · demo" title={<>Kick in <em>pixels</em>.</>} deck="A pitch corner built from the shared pixel-iso kit. Five kicks." beats={BEATS} onStart={()=>{setPhase('aim');stage.current?.invalidate();}} startLabel="Step up ▸"/>
    :phase==='score'?<ScoreScreen kicker="Full time · five kicks" score={goals} of={ROUND} unit="scored"
      buttons={<><PixelButton data-museum-own-cue onClick={again}>Five more</PixelButton><PixelButton variant="ghost" onClick={()=>setPhase('result')}>Look at the pitch</PixelButton></>}>
      <Note><b>Harder is not always better:</b> past about 80% power the ball clears the bar.</Note>
      <QuickCheck check={CHECK} picked={picked} onPick={i=>setPicked(i)}/></ScoreScreen>:null}>
   <div ref={screen} style={{width:'100%'}}>
    <PixelStage ref={stage} min={[160,160]} max={[304,184]} render={render} bg="#000048" tabIndex={0}
     label={`A pitch corner in pixel art: a goal 7.32 metres wide, the keeper, the striker and the ball. ${goals} goals from ${results.length} kicks.`} {...drag}/>
   </div>
  </Cabinet>
 </main>;
}
