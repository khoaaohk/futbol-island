'use client';
import {memo,useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState,type CSSProperties,type KeyboardEvent as RKE,type PointerEvent as RPE,type ReactNode} from 'react';
import {pitchMarkup} from '@/lib/coaches/board/art';
import {EXAMPLE_PLAYS} from '@/lib/coaches/board/examples';
import {commit,redo as redoH,startHistory,undo as undoH,type History} from '@/lib/coaches/board/history';
import {FORMAT_LABEL,PITCHES,formationSlots,formationsFor,mirror,viewRect,zoneName} from '@/lib/coaches/board/pitch';
import {addArrow,addChip,addInk,addStep,clearMarks,fitBend,loadFormation,moveChips,movesBetween,newPlay,removeChips,removeMarks,moveStep,removeStep,
 setFormat,toM,toV,uid,updateArrow,updateChip,type M} from '@/lib/coaches/board/play';
import {distToPolyline,pointInPolygon,sampleQuad,simplify,smoothPath,type P} from '@/lib/coaches/board/render';
import {copyOf,deletePlay,duplicatePlay,emptyLibrary,loadLibrary,saveLibrary,upsertPlay,type Library} from '@/lib/coaches/board/storage';
import {decodePlay,encodePlay,readShareHash,shareUrl} from '@/lib/coaches/board/share';
import {FORMATS,INKS,INK_NAMES,MAX_LABEL,ZOOM_VIEWS,type Arrow,type ArrowKind,type Chip,type End,type Format,type InkKind,type Play,type Team,type ZoomView} from '@/lib/coaches/board/types';
import {bestView,deltaToModel,toScreen} from '@/lib/coaches/board/view';
import {Stage,arrowScreen,type Scene} from './stage';
import {PENDING_PLAY_EVENT,takePendingPlay} from '@/lib/coaches/board/link';
import {BoardIcon} from './icons';
import s from './TacticsBoard.module.css';

/**
 * Coaches Board → Tactics board (Oct 9 2026). A magnetic board: drag the counters, draw passes (solid), runs (dashed) and
 * dribbles (wavy) with the marker, add steps and press Play to watch the move happen. Everything teaches a real idea:
 * the built-in examples carry a coaching point, and every counter's label names where it stands ("right wing, attacking
 * third"). Heat: React draws the structure; ./stage.ts moves chips and arrows and runs frames only while something moves.
 */
type Tool='move'|'arrow'|'marker'|'erase'|'add';
type Sheet=null|'plays'|'share'|'options'|'shapes';
type Mode={kind:'edit'}|{kind:'view';source:'example'|'shared';play:Play};
type Opts={speed:number;loop:boolean;trails:boolean;next:boolean;snap:'off'|'grid'|'shape'};
type Gesture=
 |{k:'chip';ids:string[];hit:string;start:P;moved:boolean;toggle:boolean}
 |{k:'lasso';pts:P[]}
 |{k:'arrow';from:End;startM:M;pts:M[];startPx:P;hit:string|null}
 |{k:'ink';pts:P[]}
 |{k:'erase';gone:Set<string>}
 |{k:'bend';id:string;base:Play}
 |{k:'add';team:Team;gk:boolean;start:P};
const TOOLS:{id:Tool;label:string;icon:string}[]=[{id:'move',label:'Move',icon:'move'},{id:'arrow',label:'Arrows',icon:'arrow'},{id:'marker',label:'Marker',icon:'marker'},{id:'erase',label:'Eraser',icon:'erase'},{id:'add',label:'Add',icon:'add'}];
const KIND_LABEL:Record<ArrowKind,string>={pass:'Pass',run:'Run',dribble:'Dribble'};
const KIND_HINT:Record<ArrowKind,string>={pass:'solid line: the ball travels',run:'dashed line: a player runs without the ball',dribble:'wavy line: a player runs with the ball'};
const ZOOM_LABEL:Record<ZoomView,string>={full:'Whole pitch',half:'Attacking half',box:'Penalty box'};
const SPEEDS=[.5,1,2];
const chipName=(c:Chip)=>c.team==='ball'?'Ball':`${c.team==='home'?'Home':'Away'} ${c.gk?'keeper ':''}${c.label||'player'}`;
const isTyping=(t:EventTarget|null)=>t instanceof HTMLElement&&(t.tagName==='INPUT'||t.tagName==='SELECT'||t.tagName==='TEXTAREA'||t.isContentEditable);
function storeOk(){try{const k='__cb';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch{return false;}}

export default function TacticsBoard({tabs}:{tabs?:ReactNode}){
 const [lib,setLib]=useState<Library>(emptyLibrary);
 const [hist,setHist]=useState<History>(()=>startHistory(loadFormation(newPlay('7v7','My play'),'7v7-231','both')));
 const [mode,setMode]=useState<Mode>({kind:'edit'});
 const [step,setStep]=useState(0);
 const [tool,setToolState]=useState<Tool>('move');
 const [arrowKind,setArrowKind]=useState<ArrowKind>('pass');
 const [inkKind,setInkKind]=useState<InkKind>('line');
 const [ink,setInk]=useState(0);
 const [sel,setSel]=useState<{chips:string[];mark:string|null}>({chips:[],mark:null});
 const [multi,setMulti]=useState(false);
 const [opts,setOpts]=useState<Opts>({speed:1,loop:false,trails:false,next:true,snap:'off'});
 const [playing,setPlaying]=useState(false);
 const [sheet,setSheet]=useState<Sheet>(null);
 const [stepMenu,setStepMenu]=useState(false);
 const [renaming,setRenaming]=useState(false);
 const [announce,setAnnounce]=useState('');
 const [toast,setToast]=useState<string|null>(null);
 const [fresh,setFresh]=useState<string[]>([]);
 const [box,setBox]=useState<{w:number;h:number}|null>(null);
 const [ready,setReady]=useState(false);
 const root=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),arrowLayer=useRef<SVGGElement>(null),inkLayer=useRef<SVGSVGElement>(null);
 const live=useRef<SVGPathElement>(null),liveHead=useRef<SVGPathElement>(null),knob=useRef<HTMLDivElement>(null),ghostEl=useRef<HTMLDivElement>(null);
 const gesture=useRef<Gesture|null>(null),rect=useRef<DOMRect|null>(null),pointer=useRef<number|null>(null);
 const stageRef=useRef<Stage|null>(null);if(!stageRef.current)stageRef.current=new Stage();const stage=stageRef.current;
 const viewing=mode.kind==='view';
 const play=viewing?mode.play:hist.now;
 const spec=PITCHES[play.format];
 const zoom:ZoomView=play.view??'full';
 const cur=Math.min(step,play.steps.length-1),curStep=play.steps[cur];
 const saved=!viewing&&lib.plays.some(p=>p.id===play.id);

 // ── load: the library, then a shared link (#play=…) or where the coach left off ──
 useEffect(()=>{
  const l=loadLibrary();setLib(l);
  const open=l.plays.find(p=>p.id===l.open)??l.draft;if(open)setHist(startHistory(open));
  const code=readShareHash(location.hash);
  if(code){history.replaceState(null,'',location.pathname+location.search);
   decodePlay(code).then(p=>{if(p){setMode({kind:'view',source:'shared',play:p});setStep(0);setAnnounce(`Shared play opened: ${p.name}`);}else setToast('That share link could not be opened.');});}
  setReady(true);
  return ()=>stage.destroy();
 },[stage]);
 // ── a development-plan goal asked for a play (docs/idp/BOARD-LINK.md): an example, a saved play, or the list ──
 useEffect(()=>{if(!ready)return;const take=()=>{const id=takePendingPlay();if(!id)return;const ex=EXAMPLE_PLAYS.find(p=>p.id===id),own=loadLibrary().plays.find(p=>p.id===id);
   if(ex)watchRef.current(ex,'example');else if(own)openRef.current(own);else{setSheet('plays');setToast('That play is on your coach’s board. Here are the plays on this one.');}};
  take();window.addEventListener(PENDING_PLAY_EVENT,take);return ()=>window.removeEventListener(PENDING_PLAY_EVENT,take);},[ready]);
 // ── save: saved plays update in place; an unsaved board is kept as the draft (debounced, no timers at rest) ──
 useEffect(()=>{if(!ready||viewing)return;const t=window.setTimeout(()=>{setLib(l=>{
  const inLib=l.plays.some(p=>p.id===hist.now.id),next:Library=inLib?{...upsertPlayKeep(l,hist.now),open:hist.now.id}:{...l,draft:hist.now,open:null};
  saveLibrary(next);return next;});},350);return ()=>window.clearTimeout(t);},[hist.now,ready,viewing]);

 // ── layout: the board fits the space it has; portrait boxes stand the pitch up ──
 useLayoutEffect(()=>{
  const el=root.current;if(!el)return;let scroller:HTMLElement|null=el.parentElement;
  while(scroller&&!/(auto|scroll)/.test(getComputedStyle(scroller).overflowY))scroller=scroller.parentElement;
  const measure=()=>{const w=el.clientWidth,ch=scroller?scroller.clientHeight:window.innerHeight,top=scroller?parseFloat(getComputedStyle(scroller).paddingTop)+parseFloat(getComputedStyle(scroller).paddingBottom):0;
   const h=Math.max(300,Math.min(ch-top,window.innerHeight));setBox(b=>b&&b.w===w&&b.h===h?b:{w,h});};
  measure();const ro=new ResizeObserver(measure);ro.observe(el);if(scroller)ro.observe(scroller);window.addEventListener('resize',measure);
  return ()=>{ro.disconnect();window.removeEventListener('resize',measure);};
 },[]);
 const layout=useMemo(()=>{
  if(!box)return null;
  // Two arrangements: board above the trays (portrait), or board beside a tray column (landscape). Pick the bigger pitch.
  const fit=(side:boolean)=>{const panel=side?Math.round(Math.max(330,Math.min(370,box.w*.34))):0;
   const bw=side?box.w-panel-14:box.w,bh=side?box.h-30:box.h-(viewing?246:276);
   const pad=bw<460?8:14,pw=bw-pad*2,ph=Math.max(160,bh-pad*2-22-14);
   return {side,panel,pad,view:bestView(viewRect(spec,zoom),pw,ph),whole:bestView(viewRect(spec,'full'),pw,ph)};};
  const st=fit(false),sd=box.w>=600?fit(true):null,pick=sd&&sd.view.s>st.view.s*1.04?sd:st,view=pick.view;
  // Counters are sized from the whole pitch; zooming in makes them bigger (up to 1.6×), like leaning in to the board.
  const k=spec.format==='futsal'?1.3:spec.format==='7v7'?1.14:spec.format==='9v9'?1.06:1,zk=Math.min(1.6,Math.max(1,view.s/pick.whole.s));
  const r=Math.round(Math.max(9.5,Math.min(26,Math.min(pick.whole.w,pick.whole.h)*.034*k*zk))*2)/2;
  return {...pick,r,ballR:Math.round(r*.62*2)/2};
 },[box,spec,zoom,viewing]);
 const view=layout?.view??null;
 const slots=useMemo(()=>{const f=formationsFor(play.format)[0];return f?formationSlots(f).flatMap(x=>[toM(spec,x.at),toM(spec,mirror(x.at))]):[];},[play.format,spec]);
 const scene=useMemo<Scene|null>(()=>layout?{play,step:cur,spec,view:layout.view,r:layout.r,ballR:layout.ballR,snap:opts.snap,slots}:null,[play,cur,spec,layout,opts.snap,slots]);
 const lastScene=useRef<Scene|null>(null);
 useLayoutEffect(()=>{if(!scene)return;const first=!lastScene.current||lastScene.current.play.id!==scene.play.id&&!viewing;lastScene.current=scene;stage.setArrowLayer(arrowLayer.current);stage.sync(scene,first);},[scene,stage,viewing]);
 useEffect(()=>{stage.setHooks({
  onStep:i=>{setStep(i);setAnnounce(`Step ${i+1} of ${play.steps.length}`);},
  onPlayEnd:()=>{setPlaying(false);setStep(play.steps.length-1);setAnnounce(`Step ${play.steps.length} of ${play.steps.length}. Finished.`);},
  onFrame:t=>{if(knob.current)knob.current.style.transform=`translateX(${(play.steps.length>1?t/(play.steps.length-1):0)*100}%)`;},
 });},[stage,play.steps.length]);
 // Headless measurement hook (tests/coaches-board.cjs, docs/performance-guide.md): frames counted by the stage loop.
 useEffect(()=>{(window as unknown as {__coachBoard?:unknown}).__coachBoard={get frames(){return stage.frames;},get busy(){return stage.busy;}};},[stage]);

 // ── edits ──
 const edit=useCallback((f:(p:Play)=>Play,key?:string)=>{if(viewing)return;setHist(h=>commit(h,f(h.now),key));},[viewing]);
 const flash=(msg:string)=>{setToast(msg);};
 useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(null),2600);return ()=>window.clearTimeout(t);},[toast]);
 useEffect(()=>{if(!fresh.length)return;const t=window.setTimeout(()=>setFresh([]),520);return ()=>window.clearTimeout(t);},[fresh]);
 const stopPlaying=useCallback((toStep?:number)=>{
  const t=stage.playTime;stage.stopPlay();setPlaying(false);
  const i=toStep??Math.max(0,Math.min(play.steps.length-1,Math.round(t??cur)));setStep(i);stage.resync(i);
 },[stage,play.steps.length,cur]);
 const setTool=(t:Tool)=>{setToolState(t);setSel({chips:[],mark:null});setStepMenu(false);if(t!=='move')setMulti(false);};
 const undo=()=>{if(playing)stopPlaying();setHist(h=>undoH(h));setSel({chips:[],mark:null});};
 const redo=()=>{if(playing)stopPlaying();setHist(h=>redoH(h));setSel({chips:[],mark:null});};
 useEffect(()=>{if(cur!==step)setStep(cur);},[cur,step]);
 const deleteSelection=()=>{
  if(sel.mark){const id=sel.mark;edit(p=>removeMarks(p,cur,[id]));setSel({chips:[],mark:null});setAnnounce('Deleted');return;}
  if(sel.chips.length){const ids=sel.chips;if(document.activeElement instanceof HTMLElement&&document.activeElement.dataset.chip)root.current?.focus({preventScroll:true});edit(p=>removeChips(p,ids));setSel({chips:[],mark:null});setAnnounce(ids.length>1?`${ids.length} counters removed`:'Counter removed');}
 };
 const addAt=(team:Team,gk:boolean,at?:M)=>{
  if(viewing)return;let id:string|null=null;
  setHist(h=>{const r=addChip(h.now,team,at?toV(spec,at):undefined,{gk,step:cur});id=r.id;if(!r.id){return h;}return commit(h,r.play);});
  queueMicrotask(()=>{if(id){setFresh([id]);setSel({chips:team==='ball'?[]:[id],mark:null});setAnnounce(`${team==='ball'?'Ball':team==='home'?'Home player':'Away player'} added`);}else flash('The board is full (30 counters).');});
 };

 // ── hit testing (screen px) ──
 const chipAt=(p:P):string|null=>{
  if(!view||!layout)return null;const hitR=Math.max(22,layout.r+6);let best:string|null=null,bd=hitR;
  for(const c of play.chips){const m=stage.at(c.id);if(!m)continue;const [x,y]=toScreen(view,m),d=Math.hypot(x-p[0],y-p[1]);
   if(c.team==='ball'&&d<=layout.ballR+7)return c.id;if(c.team!=='ball'&&d<bd){bd=d;best=c.id;}}
  return best;
 };
 const markAt=(p:P,reach=12):string|null=>{
  if(!scene||!view)return null;const pos=stage.positions();
  for(const a of [...curStep.arrows].reverse()){const s0='c' in a.a?pos[a.a.c]:toM(spec,a.a.p),s1='c' in a.b?pos[a.b.c]:toM(spec,a.b.p);if(!s0||!s1)continue;
   const d=arrowScreen(a,s0,s1,scene);if(d&&distToPolyline(p,sampleQuad(d.q[0],d.q[1],d.q[2],24))<reach)return a.id;}
  for(const k of [...curStep.ink].reverse()){const pts=k.pts.map(v=>toScreen(view,toM(spec,v)) as P);
   if(distToPolyline(p,k.kind==='zone'?[...pts,pts[0]]:pts)<reach||(k.kind==='zone'&&pointInPolygon(p,pts)))return k.id;}
  return null;
 };
 const local=(e:{clientX:number;clientY:number}):P=>{const r=rect.current??surface.current!.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
 const showLive=(d:string,head='',dash:string|null=null,color=INKS[ink],fill=false)=>{const l=live.current,h=liveHead.current;if(!l||!h)return;
  l.setAttribute('d',d);l.setAttribute('stroke',color);l.setAttribute('fill',fill?color:'none');l.setAttribute('fill-opacity',fill?'.2':'0');
  if(dash)l.setAttribute('stroke-dasharray',dash);else l.removeAttribute('stroke-dasharray');h.setAttribute('d',head);h.setAttribute('stroke',color);};
 const hideMark=(id:string,hidden:boolean)=>{inkLayer.current?.querySelectorAll(`[data-mark="${id}"]`).forEach(el=>{(el as SVGElement).style.display=hidden?'none':'';});};
 const previewArrow=(g:Extract<Gesture,{k:'arrow'}>,endM:M,receiver:string|null)=>{
  if(!scene)return;const startM='c' in g.from?stage.at(g.from.c)??g.startM:g.startM;
  const a:Arrow={id:'preview',kind:arrowKind,a:g.from,b:receiver?{c:receiver}:{p:toV(spec,endM)},bend:fitBend([startM,...g.pts.slice(1)]),ink};
  const d=arrowScreen(a,startM,receiver?stage.at(receiver)??endM:endM,scene);
  if(d)showLive(d.body,d.head,d.dash);else showLive('');
 };

 // ── pointer gestures on the board ──
 const onDown=(e:RPE<HTMLDivElement>)=>{
  if(!view||!scene||pointer.current!==null||e.button>0)return;
  rect.current=surface.current!.getBoundingClientRect();const p=local(e),m=stage.toModel(p),now=e.timeStamp;
  if(playing||stage.playing)stopPlaying();
  setStepMenu(false);if(sheet)setSheet(null);
  pointer.current=e.pointerId;surface.current!.setPointerCapture(e.pointerId);
  if(viewing){gesture.current=null;return;}
  const chip=chipAt(p);
  if(tool==='move'||tool==='add'){
   if(sel.mark&&sel.mark===markAt(p,18)&&!chip){gesture.current={k:'bend',id:sel.mark,base:play};return;}
   if(chip){
    const inSel=sel.chips.includes(chip),ids=multi?(inSel?sel.chips:[...sel.chips,chip]):(inSel&&sel.chips.length>1?sel.chips:[chip]);
    if(!multi&&!inSel)setSel({chips:[chip],mark:null});else if(multi&&!inSel)setSel({chips:ids,mark:null});
    gesture.current={k:'chip',ids,hit:chip,start:p,moved:false,toggle:multi&&inSel};stage.dragStart(ids,m,now);return;}
   const mark=markAt(p);if(mark){setSel({chips:[],mark});gesture.current=null;return;}
   if(tool==='add'){gesture.current={k:'add',team:'home',gk:false,start:p};return;}
   gesture.current={k:'lasso',pts:[p]};return;
  }
  if(tool==='arrow'){const from:End=chip?{c:chip}:{p:toV(spec,m)};gesture.current={k:'arrow',from,startM:chip?stage.at(chip)!:m,pts:[chip?stage.at(chip)!:m],startPx:p,hit:chip};return;}
  if(tool==='marker'){gesture.current={k:'ink',pts:[p]};showLive(`M${p[0]} ${p[1]}`);return;}
  if(tool==='erase'){const g:Gesture={k:'erase',gone:new Set()};gesture.current=g;const hit=markAt(p,14);if(hit){g.gone.add(hit);hideMark(hit,true);}}
 };
 const onMove=(e:RPE<HTMLDivElement>)=>{
  const g=gesture.current;
  if(!g||pointer.current!==e.pointerId){if(e.pointerType==='mouse'&&!g&&surface.current&&!viewing&&(tool==='move'||tool==='add')){rect.current=null;const p=local(e);surface.current.style.cursor=chipAt(p)?'grab':'';}return;}
  const events=typeof e.nativeEvent.getCoalescedEvents==='function'?e.nativeEvent.getCoalescedEvents():[];const list=events.length?events:[e.nativeEvent];
  const p=local(e),m=stage.toModel(p);
  if(g.k==='chip'){if(!g.moved&&Math.hypot(p[0]-g.start[0],p[1]-g.start[1])<3)return;g.moved=true;stage.dragMove(m,e.timeStamp);if(surface.current)surface.current.style.cursor='grabbing';return;}
  if(g.k==='lasso'){for(const ev of list)g.pts.push(local(ev));showLive(smoothPath(simplify(g.pts,1)),'','5 6','#fff7d6');return;}
  if(g.k==='arrow'){for(const ev of list)g.pts.push(stage.toModel(local(ev)));const target=arrowKind==='pass'?chipAt(p):null;previewArrow(g,m,target&&target!==g.hit?target:null);return;}
  if(g.k==='ink'){for(const ev of list)g.pts.push(local(ev));const pts=simplify(g.pts,.6);showLive(smoothPath(pts,inkKind==='zone'),'',inkKind==='zone'?'7 6':null,INKS[ink],inkKind==='zone');return;}
  if(g.k==='erase'){for(const ev of list){const hit=markAt(local(ev),14);if(hit&&!g.gone.has(hit)){g.gone.add(hit);hideMark(hit,true);}}return;}
  if(g.k==='bend'&&scene){const a=g.base.steps[cur].arrows.find(x=>x.id===g.id);if(!a)return;const pos=stage.positions();
   const s0='c' in a.a?pos[a.a.c]:toM(spec,a.a.p),s1='c' in a.b?pos[a.b.c]:toM(spec,a.b.p);if(!s0||!s1)return;
   const P0=toScreen(view!,s0),P2=toScreen(view!,s1),dx=P2[0]-P0[0],dy=P2[1]-P0[1],l2=dx*dx+dy*dy||1,cx=2*p[0]-(P0[0]+P2[0])/2,cy=2*p[1]-(P0[1]+P2[1])/2;
   const bend=Math.max(-.8,Math.min(.8,((cx-(P0[0]+P2[0])/2)*-dy+(cy-(P0[1]+P2[1])/2)*dx)/l2));
   stage.scene={...scene,play:updateArrow(g.base,cur,g.id,{bend:Math.round(bend*100)/100})};stage.paintArrow(g.id);return;}
  if(g.k==='add'&&Math.hypot(p[0]-g.start[0],p[1]-g.start[1])>8){gesture.current={k:'lasso',pts:[g.start,p]};}
 };
 const onUp=(e:RPE<HTMLDivElement>)=>{
  if(pointer.current!==e.pointerId)return;pointer.current=null;const g=gesture.current;gesture.current=null;
  try{surface.current?.releasePointerCapture(e.pointerId);}catch{/* already released */}
  if(surface.current)surface.current.style.cursor='';
  const cancel=e.type==='pointercancel';if(!g||!view||!scene){showLive('');return;}
  const p=local(e);
  if(g.k==='chip'){const targets=stage.dragEnd(e.timeStamp,cancel);
   if(targets){const moves=Object.fromEntries(Object.entries(targets).map(([id,m])=>[id,toV(spec,m)]));edit(pl=>moveChips(pl,cur,moves));
    const c=play.chips.find(x=>x.id===g.hit);if(c&&g.ids.length===1)setAnnounce(`${chipName(c)}: ${zoneName(moves[c.id],c.team)}`);}
   else if(g.toggle)setSel(sv=>({chips:sv.chips.filter(x=>x!==g.hit),mark:null}));
   return;}
  showLive('');
  if(g.k==='lasso'){if(g.pts.length<4||Math.hypot(p[0]-g.pts[0][0],p[1]-g.pts[0][1])<6&&g.pts.length<8){if(!multi)setSel({chips:[],mark:null});return;}
   const ids=play.chips.filter(c=>{const m=stage.at(c.id);return m&&pointInPolygon(toScreen(view,m),g.pts);}).map(c=>c.id);
   setSel({chips:multi?[...new Set([...sel.chips,...ids])]:ids,mark:null});if(ids.length)setAnnounce(`${ids.length} selected`);return;}
  if(g.k==='add'){addAt('home',false,stage.toModel(p));return;}
  if(g.k==='arrow'){if(cancel)return;const endM=stage.toModel(p),startM='c' in g.from?stage.at(g.from.c)??g.startM:g.startM;
   const len=Math.hypot(...(toScreen(view,endM).map((v,i)=>v-toScreen(view,startM)[i]) as [number,number]));
   if(len<16){if(g.hit){setSel({chips:[g.hit],mark:null});}return;}
   const recv=arrowKind==='pass'?chipAt(p):null,to=recv&&recv!==g.hit?recv:null;g.pts.push(endM);
   const a:Arrow={id:uid('a'),kind:arrowKind,a:g.from,b:to?{c:to}:{p:toV(spec,endM)},bend:fitBend([startM,...g.pts.slice(1)]),ink};
   edit(pl=>addArrow(pl,cur,a));setAnnounce(`${KIND_LABEL[arrowKind]} drawn`);return;}
  if(g.k==='ink'){if(cancel||g.pts.length<3)return;const pts=simplify(g.pts,1.1).map(q=>toV(spec,stage.toModel(q)));
   if(pts.length<2||(inkKind==='zone'&&pts.length<3))return;edit(pl=>addInk(pl,cur,{id:uid('k'),kind:inkKind,pts,ink}));setAnnounce(inkKind==='zone'?'Zone shaded':'Note drawn');return;}
  if(g.k==='erase'){const ids=[...g.gone];if(cancel||!ids.length){ids.forEach(id=>hideMark(id,false));return;}edit(pl=>removeMarks(pl,cur,ids));setAnnounce(ids.length>1?`${ids.length} marks rubbed out`:'Rubbed out');return;}
  if(g.k==='bend'){const next=stage.scene?.play;if(next&&next!==g.base){const a=next.steps[cur].arrows.find(x=>x.id===g.id);if(a)edit(pl=>updateArrow(pl,cur,g.id,{bend:a.bend}));}}
 };

 // ── tray: tap to add, or drag a counter onto the pitch ──
 const trayDown=(team:Team,gk:boolean)=>(e:RPE<HTMLButtonElement>)=>{
  if(viewing||e.button>0)return;const el=e.currentTarget,start:P=[e.clientX,e.clientY];el.setPointerCapture(e.pointerId);let dragging=false;
  const ghost=ghostEl.current,rootR=root.current!.getBoundingClientRect();
  const move=(ev:PointerEvent)=>{if(!dragging&&Math.hypot(ev.clientX-start[0],ev.clientY-start[1])>6){dragging=true;if(ghost){ghost.dataset.team=team==='ball'?'ball':team+(gk?'Gk':'');ghost.hidden=false;}}
   if(dragging&&ghost)ghost.style.transform=`translate3d(${ev.clientX-rootR.left-20}px,${ev.clientY-rootR.top-34}px,0)`;};
  const up=(ev:PointerEvent)=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);if(ghost)ghost.hidden=true;
   if(ev.type==='pointercancel')return;
   if(!dragging){addAt(team,gk);return;}
   const r=surface.current?.getBoundingClientRect();if(!r||!view)return;const x=ev.clientX-r.left,y=ev.clientY-r.top-14;
   if(x<-10||y<-10||x>r.width+10||y>r.height+10){setAnnounce('Dropped off the board');return;}
   addAt(team,gk,stage.toModel([Math.max(0,Math.min(r.width,x)),Math.max(0,Math.min(r.height,y))]));};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 };

 // ── keyboard ──
 const onRootKey=(e:RKE<HTMLDivElement>)=>{
  if(isTyping(e.target))return;const k=e.key.toLowerCase(),mod=e.metaKey||e.ctrlKey;
  if(mod&&k==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return;}
  if(mod&&k==='y'){e.preventDefault();redo();return;}
  if((k==='delete'||k==='backspace')&&(sel.chips.length||sel.mark)&&!viewing){e.preventDefault();deleteSelection();return;}
  if(k==='escape'&&(sheet||sel.chips.length||sel.mark||stepMenu||renaming)){e.preventDefault();e.stopPropagation();setSheet(null);setStepMenu(false);setSel({chips:[],mark:null});}
 };
 const onChipKey=(c:Chip)=>(e:RKE<HTMLButtonElement>)=>{
  const dirs:Record<string,[number,number]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};const d=dirs[e.key];
  if(!d||viewing||!view)return;e.preventDefault();const px=(e.shiftKey?5:1)*view.s,[mx,my]=deltaToModel(view,d[0]*px,d[1]*px);
  const t=stage.nudge(c.id,mx,my);if(!t)return;const v=toV(spec,t);edit(pl=>moveChips(pl,cur,{[c.id]:v}),`key:${c.id}`);setAnnounce(`${chipName(c)}: ${zoneName(v,c.team)}`);
 };

 // ── playback ──
 const n=play.steps.length;
 const startPlay=()=>{
  if(n<2){flash('Add a step first: + Step, then move the players.');return;}
  const from=cur>=n-1?0:cur;setSel({chips:[],mark:null});setStepMenu(false);setStep(from);
  requestAnimationFrame(()=>{stage.playFrom(from,opts.speed,opts.loop);setPlaying(true);setAnnounce(`Playing from step ${from+1} of ${n}`);});
 };
 useEffect(()=>{stage.setPlayOptions(opts.speed,opts.loop);},[opts.speed,opts.loop,stage]);
 const goStep=(i:number)=>{if(playing||stage.playing)stopPlaying(i);else setStep(i);setSel({chips:[],mark:null});setAnnounce(`Step ${i+1} of ${n}`);};
 const plusStep=()=>{if(viewing)return;if(playing)stopPlaying();if(n>=12){flash('12 steps is the most a play can hold.');return;}
  let idx=cur;setHist(h=>{const r=addStep(h.now,cur);idx=r.index;return commit(h,r.play);});
  queueMicrotask(()=>{setStep(idx);setSel({chips:[],mark:null});setAnnounce(`Step ${idx+1} added. Move the players to where they go next.`);});};
 const scrubbed=useRef(false);
 /** Dragging along the track scrubs through the play; a tap on a step number goes to that step (its click). */
 const scrub=(e:RPE<HTMLDivElement>)=>{
  if(n<2||e.button>0)return;const el=e.currentTarget,r=el.getBoundingClientRect(),x0=e.clientX;el.setPointerCapture(e.pointerId);
  const onDot=(e.target as HTMLElement).closest('[data-cb^="step-"]');let moving=false;scrubbed.current=false;
  const at=(x:number)=>Math.max(0,Math.min(n-1,(x-r.left)/r.width*(n-1)));let t=at(x0);
  const show=()=>{stage.seek(t);if(knob.current)knob.current.style.transform=`translateX(${t/(n-1)*100}%)`;};
  const move=(ev:PointerEvent)=>{if(!moving&&Math.abs(ev.clientX-x0)<5)return;if(!moving){moving=true;if(playing)setPlaying(false);setStepMenu(false);}t=at(ev.clientX);show();};
  const up=()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);
   if(moving){scrubbed.current=true;stopPlaying(Math.round(t));setAnnounce(`Step ${Math.round(t)+1} of ${n}`);}else if(!onDot)goStep(Math.round(t));};
  el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
 };

 // ── library ──
 const openPlay=(p:Play)=>{if(playing)stopPlaying(0);setMode({kind:'edit'});setHist(startHistory(p));setStep(0);setSel({chips:[],mark:null});setSheet(null);
  setLib(l=>{const next={...l,open:l.plays.some(x=>x.id===p.id)?p.id:null,draft:l.plays.some(x=>x.id===p.id)?l.draft:p};saveLibrary(next);return next;});setAnnounce(`${p.name} on the board`);};
 const saveCurrent=()=>{const ok=storeOk();setLib(l=>{const next={...upsertPlay(l,hist.now),open:hist.now.id,draft:null};if(!saveLibrary(next)){flash('Could not save: storage is full or blocked.');return l;}return next;});if(ok)flash('Saved to your plays');};
 const saveCopy=()=>{if(mode.kind!=='view')return;const p=copyOf(mode.play);setMode({kind:'edit'});setHist(startHistory(p));setStep(0);
  setLib(l=>{const next={...upsertPlay(l,p),open:p.id};saveLibrary(next);return next;});flash(mode.source==='shared'?'Saved a copy to your plays':'Copied to your plays: make it yours');};
 const watch=(p:Play,source:'example'|'shared')=>{if(playing)stopPlaying(0);setMode({kind:'view',source,play:p});setStep(0);setSheet(null);setSel({chips:[],mark:null});setAnnounce(`${p.name}. ${p.note??''}`);};
 const watchRef=useRef(watch),openRef=useRef(openPlay);watchRef.current=watch;openRef.current=openPlay;
 const newBoard=(f:Format)=>{const sh=formationsFor(f)[0];openPlay(loadFormation(newPlay(f,'My play'),sh.id,'both'));};

 // ── share ──
 const [link,setLink]=useState('');
 useEffect(()=>{if(sheet!=='share')return;let live=true;setLink('');encodePlay(play).then(code=>{if(live)setLink(shareUrl(code,location.origin+location.pathname));});return ()=>{live=false;};},[sheet,play]);
 const copyLink=async()=>{try{await navigator.clipboard.writeText(link);flash('Link copied');}catch{flash('Select the link and copy it');}};
 const nativeShare=async()=>{try{await navigator.share({title:play.name,text:`${play.name} — a play on the Futbol Island Coaches Board`,url:link});}catch{/* dismissed */}};
 const savePicture=async()=>{if(!scene)return;try{const {boardPng}=await import('./exportPng');const blob=await boardPng(scene,{title:play.name,caption:play.note??''});
  const file=new File([blob],`${play.name.replace(/[^\w-]+/g,'-').toLowerCase()||'play'}-step-${cur+1}.png`,{type:'image/png'});
  if(navigator.canShare?.({files:[file]})&&matchMedia('(pointer:coarse)').matches){try{await navigator.share({files:[file],title:play.name});return;}catch{/* fall back */}}
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);flash('Picture saved');}
  catch{flash('Could not make the picture');}};

 // ── derived drawing data ──
 const selChip=sel.chips.length===1?play.chips.find(c=>c.id===sel.chips[0])??null:null;
 const selArrow=sel.mark?curStep.arrows.find(a=>a.id===sel.mark)??null:null;
 const selInk=sel.mark&&!selArrow?curStep.ink.find(k=>k.id===sel.mark)??null:null;
 const ghosts=useMemo(()=>{
  if(!view||!layout)return [];const out:{id:string;d:string;head:string;kind:'next'|'trail';ring?:P}[]=[];
  const draw=(i:number,kind:'next'|'trail')=>{const mv=movesBetween(play,i),own=new Set(play.steps[i].arrows.flatMap(a=>'c' in a.a?[a.a.c]:[]));
   for(const [id,m] of Object.entries(mv)){if(kind==='next'&&own.has(id))continue;const c=play.chips.find(x=>x.id===id);if(!c)continue;
    const a:Arrow={id:'g'+id,kind:c.team==='ball'?'pass':'run',a:{p:toV(spec,m.from)},b:{p:toV(spec,m.to)},bend:m.bend,ink:3};
    const d=arrowScreen(a,m.from,m.to,{...scene!,r:0,ballR:0});if(!d)continue;
    out.push({id,d:d.body,head:kind==='next'?d.head:'',kind,ring:kind==='trail'?toScreen(view,m.from) as P:undefined});}};
  if(opts.next&&cur<n-1&&!playing)draw(cur,'next');
  if(opts.trails&&cur>0)draw(cur-1,'trail');
  return out;
 },[view,layout,play,cur,n,opts.next,opts.trails,playing,spec,scene]);
 const handle=useMemo(()=>{if(!selArrow||!scene||!view)return null;const pos=curStep.pos,s0=('c' in selArrow.a?pos[selArrow.a.c]:selArrow.a.p),s1=('c' in selArrow.b?pos[selArrow.b.c]:selArrow.b.p);if(!s0||!s1)return null;
  const P0=toScreen(view,toM(spec,s0)),P2=toScreen(view,toM(spec,s1)),dx=P2[0]-P0[0],dy=P2[1]-P0[1],c=[(P0[0]+P2[0])/2-dy*selArrow.bend,(P0[1]+P2[1])/2+dx*selArrow.bend];
  return [(P0[0]+2*c[0]+P2[0])/4,(P0[1]+2*c[1]+P2[1])/4] as P;},[selArrow,scene,view,curStep,spec]);
 const pitchHtml=useMemo(()=>view?{__html:pitchMarkup(spec,view)}:null,[spec,view]);
 const markerW=layout?Math.max(2.4,Math.min(4,layout.r*.24)):3;

 // ── UI pieces ──
 const tb=(label:string,icon:string,on:()=>void,o:{pressed?:boolean;disabled?:boolean;text?:boolean;cls?:string;data?:string}={})=>
  <button key={label} type="button" className={`${s.tool} ${o.text?s.withText:''} ${o.cls??''}`} aria-label={label} title={label} aria-pressed={o.pressed} disabled={o.disabled} onClick={on} data-cb={o.data}><BoardIcon name={icon}/>{o.text&&<span>{label}</span>}</button>;
 const chipBtn=(label:string,on:boolean,click:()=>void,data?:string)=><button key={data??label} type="button" className={s.pill} aria-pressed={on} onClick={click} data-cb={data}>{label}</button>;
 const swatches=<div className={s.swatches} role="group" aria-label="Marker colour">{INKS.map((c,i)=><button key={c} type="button" className={s.swatch} style={{'--ink':c} as CSSProperties} aria-label={`${INK_NAMES[i]} marker`} aria-pressed={ink===i} onClick={()=>{setInk(i);if(selArrow)edit(p=>updateArrow(p,cur,selArrow.id,{ink:i}));}}/>)}</div>;

 const context=(()=>{
  if(viewing)return <p className={`${s.hint} ${s.note}`}>{mode.play.note??'Press play to watch the move.'}</p>;
  if(stepMenu)return <div className={s.ctx}><b className={s.ctxTitle}>Step {cur+1}</b>
   {tb('Move step earlier','left',()=>{edit(p=>moveStep(p,cur,cur-1));setStep(cur-1);},{disabled:cur===0})}
   {tb('Move step later','right',()=>{edit(p=>moveStep(p,cur,cur+1));setStep(cur+1);},{disabled:cur>=n-1})}
   {tb('Delete step','trash',()=>{edit(p=>removeStep(p,cur));setStep(Math.max(0,cur-1));setStepMenu(false);setAnnounce(`Step ${cur+1} deleted`);},{disabled:n<2,text:true,data:'step-delete'})}
   {tb('Done','close',()=>setStepMenu(false))}</div>;
  if(sel.chips.length>1)return <div className={s.ctx}><b className={s.ctxTitle}>{sel.chips.length} selected</b>
   {chipBtn('Home',false,()=>sel.chips.forEach(id=>edit(p=>updateChip(p,id,{team:'home'}))))}{chipBtn('Away',false,()=>sel.chips.forEach(id=>edit(p=>updateChip(p,id,{team:'away'}))))}
   {tb('Delete selected','trash',deleteSelection)}{tb('Clear selection','close',()=>setSel({chips:[],mark:null}))}</div>;
  if(selChip)return <div className={s.ctx} data-cb="chip-edit">
   {selChip.team==='ball'?<b className={s.ctxTitle}>Ball</b>:<>
    <label className={s.numField}><span aria-hidden="true">#</span><input value={selChip.label} maxLength={MAX_LABEL} inputMode="text" aria-label="Shirt number or label" onChange={e=>edit(p=>updateChip(p,selChip.id,{label:e.target.value}),`label:${selChip.id}`)}/></label>
    {chipBtn('Home',selChip.team==='home',()=>edit(p=>updateChip(p,selChip.id,{team:'home'})),'team-home')}
    {chipBtn('Away',selChip.team==='away',()=>edit(p=>updateChip(p,selChip.id,{team:'away'})),'team-away')}
    {chipBtn('Keeper',!!selChip.gk,()=>edit(p=>updateChip(p,selChip.id,{gk:!selChip.gk})),'gk')}</>}
   {tb(`Delete ${chipName(selChip)}`,'trash',deleteSelection,{data:'chip-delete'})}</div>;
  if(selArrow)return <div className={s.ctx} data-cb="arrow-edit">{ARROW_KINDS_UI.map(k=>chipBtn(KIND_LABEL[k],selArrow.kind===k,()=>edit(p=>updateArrow(p,cur,selArrow.id,{kind:k})),'kind-'+k))}
   {swatches}{tb('Straighten','arrow',()=>edit(p=>updateArrow(p,cur,selArrow.id,{bend:0})))}{tb('Delete arrow','trash',deleteSelection,{data:'arrow-delete'})}</div>;
  if(selInk)return <div className={s.ctx}><b className={s.ctxTitle}>{selInk.kind==='zone'?'Zone':'Marker note'}</b>{tb('Delete','trash',deleteSelection,{text:true})}</div>;
  if(tool==='arrow')return <div className={s.ctx}>{ARROW_KINDS_UI.map(k=><button key={k} type="button" className={`${s.pill} ${s.kindPill}`} aria-pressed={arrowKind===k} onClick={()=>setArrowKind(k)} title={KIND_HINT[k]} data-cb={'pen-'+k}><svg viewBox="0 0 36 12" aria-hidden="true" width="30" height="10"><path d={k==='dribble'?'M2 6q2.5-5 5 0t5 0 5 0 5 0 5 0M28 6h5m-4-4 4 4-4 4':'M2 6h30m-4-4 4 4-4 4'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray={k==='run'?'4 4':undefined}/></svg>{KIND_LABEL[k]}</button>)}{swatches}</div>;
  if(tool==='marker')return <div className={s.ctx}>{chipBtn('Line',inkKind==='line',()=>setInkKind('line'),'ink-line')}{chipBtn('Zone',inkKind==='zone',()=>setInkKind('zone'),'ink-zone')}{swatches}</div>;
  if(tool==='erase')return <div className={s.ctx}><p className={s.hint}>Tap or rub out arrows and notes.</p>{tb('Clear this step','trash',()=>edit(p=>clearMarks(p,cur)),{text:true,disabled:!curStep.arrows.length&&!curStep.ink.length})}</div>;
  if(tool==='add')return <div className={s.ctx} data-cb="tray">
   {([['home',false,'Home'],['away',false,'Away'],['home',true,'Keeper'],['ball',false,'Ball']] as [Team,boolean,string][]).map(([t,gk,label])=>
    <button key={label} type="button" className={s.trayChip} onPointerDown={trayDown(t,gk)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();addAt(t,gk);}}} aria-label={`Add ${label.toLowerCase()}${t==='ball'?'':' player'} (tap, or drag onto the pitch)`} data-cb={'tray-'+label.toLowerCase()}>
     <span className={s.chipFace} data-team={t==='ball'?'ball':t+(gk?'Gk':'')}>{t==='ball'?'':'+'}</span><small>{label}</small></button>)}
   {tb('Team shapes','steps',()=>setSheet('shapes'),{text:true,data:'shapes'})}</div>;
  return <div className={s.ctx}><p className={s.hint}>{multi?'Tap counters to pick them, then drag one to move them all.':'Drag a counter · tap to edit it · draw round several'}</p>
   {chipBtn('Select several',multi,()=>{setMulti(m=>!m);setSel({chips:[],mark:null});},'multi')}</div>;
 })();

 const zoomNext=()=>{const v=ZOOM_VIEWS[(ZOOM_VIEWS.indexOf(zoom)+1)%ZOOM_VIEWS.length];if(viewing)setMode({...mode,play:{...mode.play,view:v}});else edit(p=>({...p,view:v}),'view');setAnnounce(ZOOM_LABEL[v]);};
 const board=layout&&view?<div className={s.frame} style={{'--pad':`${layout.pad}px`,'--r':`${layout.r}px`,'--br':`${layout.ballR}px`,'--mw':`${markerW}px`} as CSSProperties}>
  <div className={s.deco} aria-hidden="true"><svg className={s.cord} viewBox="0 0 200 22" preserveAspectRatio="none"><path d="M40 22 Q100 -6 160 22" fill="none" stroke="#6f5a3e" strokeWidth="1.6"/></svg><i className={s.clip} style={{left:'20%'}}/><i className={s.clip} style={{right:'20%'}}/></div>
  <div className={s.tapes}>
   <div className={s.tapeGroup}>
    {renaming&&!viewing?<input className={`${s.tape} ${s.nameInput}`} autoFocus defaultValue={play.name} maxLength={32} aria-label="Play name"
      onBlur={e=>{const v=e.target.value.trim();if(v&&v!==play.name)edit(p=>({...p,name:v.slice(0,32)}));setRenaming(false);}} onKeyDown={e=>{if(e.key==='Enter')(e.target as HTMLInputElement).blur();if(e.key==='Escape'){e.stopPropagation();e.preventDefault();setRenaming(false);}}}/>
     :<button type="button" className={s.tape} onClick={()=>!viewing&&setRenaming(true)} aria-label={viewing?play.name:`Play name: ${play.name}. Rename`} data-cb="name">{play.name}</button>}
    {!viewing&&!saved&&!renaming&&<button type="button" className={s.sticker} onClick={saveCurrent} data-cb="save">Save</button>}
   </div>
   <div className={s.tapeGroup}>
    <button type="button" className={`${s.tape} ${s.zoomTape}`} onClick={zoomNext} aria-label={`Zoom: ${ZOOM_LABEL[zoom]}. Change`} data-cb="zoom"><BoardIcon name="zoom" size={15}/><span className={s.zoomWord}>{zoom==='full'?'Full':zoom==='half'?'Half':'Box'}</span></button>
    <label className={`${s.tape} ${s.formatTape}`}><span className={s.sr}>Pitch format</span>
     <select value={play.format} disabled={viewing} onChange={e=>edit(p=>setFormat(p,e.target.value as Format))} data-cb="format">{FORMATS.map(f=><option key={f} value={f}>{FORMAT_LABEL[f]}</option>)}</select></label>
   </div>
  </div>
  <div ref={surface} className={s.surface} data-tool={viewing?'view':tool} data-cb="surface" style={{width:view.w,height:view.h}} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onContextMenu={e=>e.preventDefault()}>
   {pitchHtml&&<svg className={s.pitch} width={view.w} height={view.h} aria-hidden="true" dangerouslySetInnerHTML={pitchHtml}/>}
   <svg ref={inkLayer} className={s.ink} width={view.w} height={view.h} aria-hidden="true">
    <defs>{INKS.map((c,i)=><pattern key={c} id={`cb-hatch-${i}`} patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(35)"><rect width="9" height="9" fill={c} fillOpacity=".14"/><path d="M0 0V9" stroke={c} strokeWidth="3.2" strokeOpacity=".32"/></pattern>)}</defs>
    {curStep.ink.map(k=>{const pts=k.pts.map(v=>toScreen(view,toM(spec,v)) as P);return k.kind==='zone'
     ?<path key={k.id} data-mark={k.id} d={smoothPath(pts,true)} fill={`url(#cb-hatch-${k.ink})`} stroke={INKS[k.ink]} strokeWidth="2" strokeDasharray="7 6" strokeLinecap="round" className={sel.mark===k.id?s.picked:undefined}/>
     :<path key={k.id} data-mark={k.id} d={smoothPath(pts)} fill="none" stroke={INKS[k.ink]} strokeWidth={markerW} strokeLinecap="round" strokeLinejoin="round" className={sel.mark===k.id?s.picked:undefined}/>;})}
    <g className={s.ghosts}>{ghosts.map(g=><g key={g.kind+g.id} data-ghost={g.kind}>{g.ring&&<circle cx={g.ring[0]} cy={g.ring[1]} r={layout.r*.8} className={s.ring}/>}<path d={g.d} className={g.kind==='next'?s.ghostNext:s.ghostTrail}/>{g.head&&<path d={g.head} className={s.ghostNext}/>}</g>)}</g>
    <g ref={arrowLayer} className={s.arrows}>{curStep.arrows.map(a=><g key={a.id} data-mark={a.id} data-kind={a.kind} className={sel.mark===a.id?s.picked:undefined} stroke={INKS[a.ink]}>
     <path ref={stage.arrowRef(a.id,'hit')} className={s.hit}/>
     <path ref={stage.arrowRef(a.id,'under')} className={s.under} strokeWidth={markerW*.5} strokeDasharray={a.kind==='run'?`${markerW*3.2} ${markerW*2.6}`:undefined}/>
     <path ref={stage.arrowRef(a.id,'body')} className={s.body} strokeWidth={markerW} strokeDasharray={a.kind==='run'?`${markerW*3.2} ${markerW*2.6}`:undefined}/>
     <path ref={stage.arrowRef(a.id,'head')} className={s.body} strokeWidth={markerW}/></g>)}</g>
    <path ref={live} className={s.live} strokeWidth={markerW}/><path ref={liveHead} className={s.live} strokeWidth={markerW}/>
    {handle&&!playing&&<circle cx={handle[0]} cy={handle[1]} r="9" className={s.handle}/>}
   </svg>
   <div className={s.chips} data-playing={playing||undefined}>
    {play.chips.map(c=>{const at=curStep.pos[c.id];return <button key={c.id} ref={stage.chipRef(c.id)} type="button" className={s.chip} data-chip={c.id} data-team={c.team==='ball'?'ball':c.team+(c.gk?'Gk':'')}
     data-selected={sel.chips.includes(c.id)||undefined} data-fresh={fresh.includes(c.id)||undefined} tabIndex={viewing?-1:0}
     aria-label={`${chipName(c)}, ${at?zoneName(at,c.team):''}. Arrow keys move it${viewing?'':'; Delete removes it'}.`} aria-pressed={sel.chips.includes(c.id)}
     onFocus={()=>{if(!viewing&&!sel.chips.includes(c.id)&&pointer.current===null)setSel({chips:[c.id],mark:null});}} onKeyDown={onChipKey(c)} onClick={e=>e.preventDefault()}>
     <span className={s.chipFace}>{c.team==='ball'?null:c.label}</span></button>;})}
   </div>
  </div>
 </div>:<div className={s.frame} style={{minHeight:240}}/>;

 const pct=n>1?cur/(n-1)*100:0;
 const timeline=<div className={s.timeline} data-cb="timeline">
  <button type="button" className={`${s.tool} ${s.playBtn}`} aria-label={playing?'Pause':'Play the steps'} onClick={()=>playing?stopPlaying():startPlay()} data-cb="play"><BoardIcon name={playing?'pause':'play'}/></button>
  <div className={s.track} onPointerDown={scrub} role="group" aria-label={`Steps: step ${cur+1} of ${n}`} data-cb="track">
   <div className={s.rail}/>{n>1&&<div ref={knob} className={s.knobRail} style={{transform:`translateX(${pct}%)`}} aria-hidden="true"><i className={s.knob}/></div>}
   {play.steps.map((_,i)=><button key={i} type="button" className={s.dot} style={{left:n>1?`${i/(n-1)*100}%`:'50%'}} aria-label={`Step ${i+1}${i===cur?' (showing)':''}`} aria-current={i===cur?'step':undefined}
    onClick={()=>{if(scrubbed.current){scrubbed.current=false;return;}if(i===cur&&!viewing)setStepMenu(m=>!m);else{setStepMenu(false);goStep(i);}}} data-cb={`step-${i+1}`}>{i+1}</button>)}
  </div>
  {!viewing&&<button type="button" className={`${s.tool} ${s.withText} ${s.addStep}`} onClick={plusStep} aria-label="Add step" data-cb="add-step"><BoardIcon name="add"/><span>Step</span></button>}
  {tb('Playback options','gear',()=>setSheet(sheet==='options'?null:'options'),{pressed:sheet==='options',data:'options'})}
 </div>;

 const top=<div className={s.top}>
  {tabs}
  <div className={s.topActions}>
   {tb('Plays: yours, examples and new','plays',()=>setSheet(sheet==='plays'?null:'plays'),{pressed:sheet==='plays',data:'plays'})}
   {tb('Share','share',()=>setSheet(sheet==='share'?null:'share'),{pressed:sheet==='share',data:'share'})}
  </div>
 </div>;
 const banner=viewing&&<div className={s.banner} data-cb="viewer"><div><b>{mode.source==='example'?'Example':'Shared play'}: {mode.play.name}</b></div>
  <button type="button" className={s.save} onClick={saveCopy} data-cb="save-copy">{mode.source==='example'?'Edit a copy':'Save a copy'}</button>
  <button type="button" className={s.pill} onClick={()=>{setMode({kind:'edit'});setStep(0);}} data-cb="close-viewer">My board</button></div>;
 const tools=!viewing&&<div className={s.tools} role="toolbar" aria-label="Board tools">
  {TOOLS.map(t=><button key={t.id} type="button" className={`${s.tool} ${s.toolTab}`} aria-pressed={tool===t.id} onClick={()=>setTool(t.id)} data-cb={'tool-'+t.id}><BoardIcon name={t.icon}/><span>{t.label}</span></button>)}
  <span className={s.sep}/>
  {tb('Undo','undo',undo,{disabled:!hist.past.length,data:'undo'})}{tb('Redo','redo',redo,{disabled:!hist.future.length,data:'redo'})}
 </div>;

 const sheetEl=sheet&&<div className={s.sheet} role="dialog" aria-label={sheet==='plays'?'Plays':sheet==='share'?'Share':sheet==='options'?'Playback options':'Team shapes'} data-cb={'sheet-'+sheet}>
  <div className={s.sheetHead}><h3>{sheet==='plays'?'Plays':sheet==='share'?'Share this play':sheet==='options'?'Playback':'Team shapes'}</h3><button type="button" className={s.tool} aria-label="Close" onClick={()=>setSheet(null)}><BoardIcon name="close"/></button></div>
  {sheet==='options'&&<div className={s.sheetBody}>
   <div className={s.row}><span>Speed</span>{SPEEDS.map(v=>chipBtn(v===.5?'½×':`${v}×`,opts.speed===v,()=>setOpts(o=>({...o,speed:v})),'speed-'+v))}</div>
   <div className={s.row}><span>Loop</span>{chipBtn(opts.loop?'On':'Off',opts.loop,()=>setOpts(o=>({...o,loop:!o.loop})),'loop')}</div>
   <div className={s.row}><span>Show next moves</span>{chipBtn(opts.next?'On':'Off',opts.next,()=>setOpts(o=>({...o,next:!o.next})),'next')}</div>
   <div className={s.row}><span>Show trails</span>{chipBtn(opts.trails?'On':'Off',opts.trails,()=>setOpts(o=>({...o,trails:!o.trails})),'trails')}</div>
   <div className={s.row}><span>Snap counters</span>{(['off','grid','shape'] as const).map(v=>chipBtn(v==='off'?'Off':v==='grid'?'Grid':'Shape',opts.snap===v,()=>setOpts(o=>({...o,snap:v})),'snap-'+v))}</div>
   <p className={s.small}>Next moves are the faint arrows to where each player goes in the next step. Trails show where they came from.</p></div>}
  {sheet==='shapes'&&<div className={s.sheetBody}>{formationsFor(play.format).map(f=><div key={f.id} className={s.shape}><div><b>{f.name}</b><small>{f.why}</small></div>
   <div className={s.shapeBtns}>{chipBtn('Home',false,()=>{edit(p=>loadFormation(p,f.id,'home'));setSheet(null);setAnnounce(`${f.name} loaded`);},`shape-${f.id}-home`)}{chipBtn('Away',false,()=>{edit(p=>loadFormation(p,f.id,'away'));setSheet(null);},`shape-${f.id}-away`)}{chipBtn('Both',false,()=>{edit(p=>loadFormation(p,f.id,'both'));setSheet(null);setAnnounce(`${f.name} loaded for both teams`);},`shape-${f.id}-both`)}</div></div>)}
   <button type="button" className={s.pill} onClick={()=>{edit(p=>removeChips(p,p.chips.map(c=>c.id)));setSheet(null);}} data-cb="clear-board">Clear the board</button></div>}
  {sheet==='share'&&<div className={s.sheetBody}>
   <p className={s.small}>The link holds the whole play, so nothing is uploaded. Whoever opens it sees it read-only and can save a copy.</p>
   <input className={s.linkBox} readOnly value={link||'Making the link…'} aria-label="Share link" onFocus={e=>e.target.select()} data-cb="link"/>
   <div className={s.row}><button type="button" className={s.save} disabled={!link} onClick={copyLink} data-cb="copy-link"><BoardIcon name="link" size={18}/> Copy link</button>
    {typeof navigator!=='undefined'&&'share' in navigator&&<button type="button" className={s.pill} disabled={!link} onClick={nativeShare}>Share…</button>}
    <button type="button" className={s.pill} onClick={savePicture} data-cb="png"><BoardIcon name="image" size={18}/> Save picture</button></div></div>}
  {sheet==='plays'&&<div className={s.sheetBody}>
   <div className={s.row}><span>New play</span>{FORMATS.map(f=>chipBtn(FORMAT_LABEL[f],false,()=>newBoard(f),'new-'+f))}</div>
   <h4>Your plays</h4>
   {lib.plays.length?<ul className={s.list}>{lib.plays.map(p=><PlayRow key={p.id} p={p} on={!viewing&&p.id===hist.now.id} onOpen={()=>openPlay(p)}
     onCopy={()=>setLib(l=>{const r=duplicatePlay(l,p.id);saveLibrary(r.lib);return r.lib;})}
     onDelete={()=>setLib(l=>{const next=deletePlay(l,p.id);saveLibrary(next);if(p.id===hist.now.id)setHist(h=>({...h,now:{...h.now,id:uid('p')}}));return next;})}/>)}</ul>
    :<p className={s.small}>Nothing saved yet. Press Save on a board to keep it here.</p>}
   <h4>Examples to learn from</h4>
   <ul className={s.list}>{EXAMPLE_PLAYS.map(p=><li key={p.id} className={s.item}><div><b>{p.name}</b><small>{FORMAT_LABEL[p.format]} · {p.steps.length} steps · {p.note}</small></div>
    <button type="button" className={s.save} onClick={()=>watch(p,'example')} data-cb={'example-'+p.id}>Watch</button></li>)}</ul></div>}
 </div>;

 return <div ref={root} className={s.root} data-layout={layout?.side?'side':'stack'} data-cb="board-root" tabIndex={-1} onKeyDown={onRootKey}>
  {layout?.side?<>
   <div className={s.boardCol}>{board}</div>
   <div className={s.panel} style={{width:layout.panel}}>{top}{banner}{timeline}<div className={s.ctxWrap}>{context}</div>{tools}{sheetEl}</div>
  </>:<>{top}{banner}<div className={s.boardCol}>{board}</div><div className={s.ctxWrap}>{context}</div>{timeline}{tools}{sheetEl}</>}
  <div ref={ghostEl} className={s.dragGhost} hidden aria-hidden="true"><span className={s.chipFace}/></div>
  {toast&&<div className={s.toast} role="status">{toast}</div>}
  <p className={s.sr} aria-live="polite" data-cb="live">{announce}</p>
 </div>;
}
const ARROW_KINDS_UI:ArrowKind[]=['pass','run','dribble'];
/** Updates a saved play in place, keeping its spot in the list (upsertPlay moves it first: only on an explicit save). */
function upsertPlayKeep(l:Library,p:Play):Library{return {...l,plays:l.plays.map(x=>x.id===p.id?p:x)};}
const ago=(t:number)=>{const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?`${m} min ago`:m<1440?`${Math.round(m/60)} h ago`:`${Math.round(m/1440)} d ago`;};
const PlayRow=memo(function PlayRow({p,on,onOpen,onCopy,onDelete}:{p:Play;on:boolean;onOpen:()=>void;onCopy:()=>void;onDelete:()=>void}){
 const [sure,setSure]=useState(false);
 return <li className={s.item} data-cb="play-row"><div><b>{p.name}{on&&<em> · on the board</em>}</b><small>{FORMAT_LABEL[p.format]} · {p.steps.length} step{p.steps.length>1?'s':''} · edited {ago(p.updated)}</small></div>
  <div className={s.shapeBtns}>{sure?<><button type="button" className={s.pill} onClick={onDelete} data-cb="confirm-delete">Delete</button><button type="button" className={s.pill} onClick={()=>setSure(false)}>Keep</button></>
   :<><button type="button" className={s.save} onClick={onOpen} data-cb="open-play">Open</button><button type="button" className={s.pill} onClick={onCopy} aria-label={`Duplicate ${p.name}`} data-cb="dup-play">Copy</button>
    <button type="button" className={s.pill} onClick={()=>setSure(true)} aria-label={`Delete ${p.name}`} data-cb="delete-play"><BoardIcon name="trash" size={18}/></button></>}</div></li>;
});
