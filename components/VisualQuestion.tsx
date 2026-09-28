'use client';
import {useEffect,useId,useLayoutEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as ReactPointerEvent,type ReactNode} from 'react';
import type {FieldLesson,Point} from '@/lib/town/formatLessons';
import {describeFrame,dropSlot,framePose,frameView,moveStep,orderAnswer,orderDisplay,pointOf,type FramePose,type QuizFrame,type QuizMark,type QuizTone,type VisualFieldQuestion} from '@/lib/town/visualQuiz';
import styles from './VisualQuestion.module.css';

/**
 * Static visual quiz questions (docs/quiz-design.md): an SVG mini pitch drawn once per answer state. No animation loop, no timers;
 * dragging re-renders only while a finger moves. Every choice is a real focusable control with a spoken label, and dragging
 * always has a tap alternative (tap the space). Result colours match the 3D quiz: green right, coral wrong, cream neutral.
 */
const LETTERS='ABCDE';
const TONE:Record<QuizTone,string>={gold:'#f7cb69',blue:'#8fc3dc',good:'#66e69e',bad:'#ff8c66',neutral:'#fff2b9'};
type Geometry={boxD:number;boxW:number;goalW:number;smallD?:number;smallW?:number;circle:number;round?:boolean};
const PITCH:Record<string,Geometry>={futsal:{boxD:60,boxW:205,goalW:40,circle:34,round:true},'7v7':{boxD:78,boxW:160,goalW:40,circle:40},'9v9':{boxD:70,boxW:190,goalW:38,smallD:26,smallW:90,circle:40},'11v11':{boxD:63,boxW:160,goalW:30,smallD:21,smallW:73,circle:36}};
const short=(label:string)=>{const w=label.split(/\s+/);return w.length>1?w.map(s=>s[0]).join('').slice(0,3):label.length<=4?label:label.slice(0,3);};
type State='idle'|'good'|'bad';

function Marks({marks,pose,unit,arrow}:{marks:QuizMark[];pose:FramePose;unit:number;arrow:string}){
 return <g pointerEvents="none">{marks.map((m,i)=>{const c=TONE[m.tone??'neutral'],a=pointOf(pose,m.from),b=pointOf(pose,m.to);
  if((m.kind==='pass'||m.kind==='run'||m.kind==='dribble')&&a&&b){const d=Math.hypot(b.x-a.x,b.y-a.y)||1,trim=unit*1.2,ex=b.x-(b.x-a.x)/d*trim,ey=b.y-(b.y-a.y)/d*trim;
   return <g key={i}><line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={c} strokeWidth={unit*(m.kind==='pass'?.34:.28)} strokeDasharray={m.kind==='pass'?undefined:m.kind==='run'?`${unit*.8} ${unit*.55}`:`${unit*.3} ${unit*.3}`} markerEnd={`url(#${arrow})`}/>{m.text&&<Chip x={(a.x+b.x)/2} y={(a.y+b.y)/2} text={m.text} unit={unit}/>}</g>;}
  if(m.kind==='zone'&&m.x!==undefined&&m.y!==undefined)return <g key={i}><rect x={m.x-(m.w??40)/2} y={m.y-(m.h??40)/2} width={m.w??40} height={m.h??40} rx={unit*.5} fill={c+'33'} stroke={c} strokeWidth={unit*.14} strokeDasharray={`${unit*.5} ${unit*.35}`}/>{m.text&&<Chip x={m.x-(m.w??40)/2+unit*1.1} y={m.y-(m.h??40)/2} text={m.text} unit={unit}/>}</g>;
  if(m.kind==='spot'&&m.x!==undefined&&m.y!==undefined)return <circle key={i} cx={m.x} cy={m.y} r={m.r??unit*1.4} fill={c+'33'} stroke={c} strokeWidth={unit*.14}/>;
  if(m.kind==='cross'&&(a??(m.x!==undefined?{x:m.x,y:m.y!}:undefined))){const p=a??{x:m.x!,y:m.y!},s=unit*.7;return <path key={i} d={`M${p.x-s} ${p.y-s}L${p.x+s} ${p.y+s}M${p.x+s} ${p.y-s}L${p.x-s} ${p.y+s}`} stroke={TONE.bad} strokeWidth={unit*.32} strokeLinecap="round"/>;}
  if(m.kind==='label'&&m.text){const p=a??(m.x!==undefined?{x:m.x,y:m.y!}:undefined);return p?<Chip key={i} x={p.x} y={p.y-unit*1.9} text={m.text} unit={unit}/>:null;}
  return null;})}</g>;
}
function Chip({x,y,text,unit}:{x:number;y:number;text:string;unit:number}){
 const f=unit*.78,w=text.length*f*.62+unit*.9;
 return <g transform={`translate(${x} ${y})`}><rect x={-w/2} y={-f*.85} width={w} height={f*1.6} rx={f*.5} fill="#294f43e6" stroke="#fff2b9" strokeWidth={unit*.06}/><text textAnchor="middle" y={f*.32} fontSize={f} fontWeight="800" fill="#fff2b9">{text}</text></g>;
}

/** The static board: pitch, trails, marks, players and ball. Children draw the answer targets on top. */
function MiniPitch({lesson,frame,extra=[],include=[],label,thumb,targets,after,svgRef}:{lesson:FieldLesson;frame:QuizFrame;extra?:Point[];include?:string[];label?:string;thumb?:boolean;targets?:(pose:FramePose,unit:number)=>ReactNode;after?:(pose:FramePose,unit:number)=>ReactNode;svgRef?:(el:SVGSVGElement|null)=>void}){
 const arrow=useId().replace(/:/g,'');
 const pose=useMemo(()=>framePose(lesson,frame),[lesson,frame]);
 const view=useMemo(()=>frameView(lesson,frame,pose,extra,include),[lesson,frame,pose,extra,include]);
 const g=PITCH[lesson.fmt]??PITCH['11v11'],unit=Math.max(view.w,view.h*1.1)*(thumb?.055:.036),focus=new Set(frame.focus??[]);
 const box=(top:boolean)=>{const y=top?4:396,s=top?1:-1,x0=135-g.boxW/2,x1=135+g.boxW/2,d=g.boxD;
  return g.round?`M${x0} ${y}Q${x0} ${y+s*d} ${135-g.goalW/2} ${y+s*d}H${135+g.goalW/2}Q${x1} ${y+s*d} ${x1} ${y}`:`M${x0} ${y}V${y+s*d}H${x1}V${y}`+(g.smallD?`M${135-g.smallW!/2} ${y}V${y+s*g.smallD}H${135+g.smallW!/2}V${y}`:'');};
 const desc=label??describeFrame(lesson,frame,pose);
 return <svg ref={svgRef} className={thumb?styles.thumb:styles.board} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} role={targets||after?'group':'img'} aria-label={desc} preserveAspectRatio="xMidYMid meet">
  <defs><marker id={arrow} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" fill="context-stroke"/></marker></defs>
  <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="#3f6a50"/>
  {[0,1,2,3,4,5,6,7].map(n=><rect key={n} x={-10} y={n*50} width={290} height={25} fill="#ffffff08"/>)}
  <g fill="none" stroke="#e4ecd599" strokeWidth={unit*.12}><rect x={4} y={4} width={262} height={392}/><path d="M4 200H266"/><circle cx={135} cy={200} r={g.circle}/><path d={box(true)+box(false)}/></g>
  <g fill="#fff9e5"><rect x={135-g.goalW/2} y={-2} width={g.goalW} height={6} rx={2}/><rect x={135-g.goalW/2} y={396} width={g.goalW} height={6} rx={2}/></g>
  {[...pose.trails].map(([id,from])=>{const to=pose.positions.get(id)!;return <g key={'t'+id} pointerEvents="none"><circle cx={from.x} cy={from.y} r={unit*.75} fill="none" stroke="#fff9e599" strokeWidth={unit*.1} strokeDasharray={`${unit*.25} ${unit*.2}`}/><line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#fff9e5aa" strokeWidth={unit*.16} strokeDasharray={`${unit*.5} ${unit*.4}`}/></g>;})}
  <Marks marks={frame.marks??[]} pose={pose} unit={unit} arrow={arrow}/>
  {targets?.(pose,unit)}
  <g pointerEvents="none">{[...pose.positions].map(([id,p])=>{const a=[...lesson.offense,...lesson.defense].find(x=>x.id===id);if(!a)return null;const gold=lesson.offense.some(x=>x.id===id),code=short(a.label);
   return <g key={id} transform={`translate(${p.x} ${p.y})`}>{focus.has(id)&&<circle r={unit*1.45} fill="none" stroke="#fff2b9" strokeWidth={unit*.22}/>}<circle r={unit} fill={gold?'#f7cb69':'#4f7f98'} stroke="#fff9e5" strokeWidth={unit*.13}/><text textAnchor="middle" y={unit*.3} fontSize={unit*(code.length>2?.72:.9)} fontWeight="800" fill={gold?'#243f36':'#fff'}>{code}</text>{focus.has(id)&&!thumb&&<Chip x={0} y={-unit*2.35} text={a.label} unit={unit}/>}</g>;})}
   {(()=>{const near=[...pose.positions.values()].some(p=>Math.hypot(p.x-pose.ball.x,p.y-pose.ball.y)<unit*1.2),b=near?{x:pose.ball.x+unit*.95,y:pose.ball.y+unit*.75}:pose.ball;return <circle cx={b.x} cy={b.y} r={unit*.48} fill="#fff" stroke="#243f36" strokeWidth={unit*.14}/>;})()}</g>
  {after?.(pose,unit)}
 </svg>;
}

/** Pixels per viewBox unit, measured on layout and resize (no polling), so hit areas stay ≥ 48px on any screen. */
function useUnitsPerPixel(){
 const [el,setEl]=useState<SVGSVGElement|null>(null),[upp,setUpp]=useState(1);
 useLayoutEffect(()=>{if(!el)return;const measure=()=>{const r=el.getBoundingClientRect(),vb=el.viewBox.baseVal;if(r.width&&vb.width)setUpp(Math.max(vb.width/r.width,vb.height/r.height));};measure();const ro=new ResizeObserver(measure);ro.observe(el);return()=>ro.disconnect();},[el]);
 return [setEl,upp] as const;
}
const keyActivate=(fn:()=>void)=>(e:KeyboardEvent)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}};
function Target({state,label,disabled,onPick,children}:{state:State;label:string;disabled:boolean;onPick:()=>void;children:ReactNode}){
 return <g role="button" tabIndex={disabled?-1:0} aria-label={label+(state==='good'?', correct':state==='bad'?', not this one':'')} aria-disabled={disabled} className={`${styles.target} ${styles[state]}`} onClick={()=>{if(!disabled)onPick();}} onKeyDown={keyActivate(()=>{if(!disabled)onPick();})}>{children}</g>;
}
const stroke=(s:State)=>s==='good'?TONE.good:s==='bad'?TONE.bad:'#fff2b9';

export default function VisualQuestion({lesson,q,answer,onAnswer}:{lesson:FieldLesson;q:VisualFieldQuestion;answer:number|null;onAnswer:(index:number)=>void}){
 const v=q.visual,answered=answer!==null,done=answer===q.correct;
 // Only the child's own pick is coloured; a wrong pick never reveals the right one, so the retry is still a real retrieval.
 const state=(i:number):State=>answer===i?(i===q.correct?'good':'bad'):'idle';
 // After any answer the board is locked until "Try again" (which clears the answer) or "Next question".
 const locked=(_i:number)=>answered;
 const [setSvg,upp]=useUnitsPerPixel();const hit=24*upp;
 const pick=(i:number)=>{if(!answered)onAnswer(i);};
 const frame=v.frame;

 if(v.kind==='tapSpot'&&frame){const spots=v.spots??[];
  return <div className={styles.visual}><MiniPitch lesson={lesson} frame={frame} extra={spots} svgRef={setSvg} targets={(_,unit)=>spots.map((s,i)=>{const r=s.r??unit*1.6,st=state(i);return <Target key={i} state={st} label={`${LETTERS[i]}: ${q.options[i]}`} disabled={locked(i)} onPick={()=>pick(i)}>
   <circle cx={s.x} cy={s.y} r={Math.max(r,hit)} fill="transparent"/><circle className={styles.ring} cx={s.x} cy={s.y} r={r} fill={st==='idle'?'#fff2b926':stroke(st)+'55'} stroke={stroke(st)} strokeWidth={unit*.18} strokeDasharray={st==='idle'?`${unit*.5} ${unit*.35}`:undefined}/><Chip x={s.x} y={s.y} text={LETTERS[i]} unit={unit}/></Target>;})}/></div>;}

 if(v.kind==='bestPass'&&frame){
  return <div className={styles.visual}><MiniPitch lesson={lesson} frame={frame} include={[v.from!,...(v.to??[]).filter((t):t is string=>typeof t==='string')]} extra={(v.to??[]).filter((t):t is Point=>typeof t!=='string')} svgRef={setSvg} targets={(pose,unit)=>{const from=pose.positions.get(v.from!);if(!from)return null;return (v.to??[]).map((t,i)=>{const to=pointOf(pose,t);if(!to)return null;const st=state(i),d=Math.hypot(to.x-from.x,to.y-from.y)||1,ux=(to.x-from.x)/d,uy=(to.y-from.y)/d,a={x:from.x+ux*unit*1.3,y:from.y+uy*unit*1.3},b={x:to.x-ux*unit*1.5,y:to.y-uy*unit*1.5},mid={x:a.x+(b.x-a.x)*.58,y:a.y+(b.y-a.y)*.58};
   return <Target key={i} state={st} label={`${LETTERS[i]}: ${q.options[i]}`} disabled={locked(i)} onPick={()=>pick(i)}>
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth={hit*1.6} strokeLinecap="round"/><line className={styles.ring} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke(st)} strokeWidth={unit*(st==='idle'?.3:.42)} strokeDasharray={st==='idle'?`${unit*.9} ${unit*.5}`:undefined}/><path d={`M${b.x} ${b.y}l${(-ux*1.1+uy*.7)*unit} ${(-uy*1.1-ux*.7)*unit}M${b.x} ${b.y}l${(-ux*1.1-uy*.7)*unit} ${(-uy*1.1+ux*.7)*unit}`} stroke={stroke(st)} strokeWidth={unit*.3} strokeLinecap="round"/>
    <circle cx={mid.x} cy={mid.y} r={Math.max(unit*1.05,hit*.8)} fill="transparent"/><Chip x={mid.x} y={mid.y} text={LETTERS[i]} unit={unit*1.15}/></Target>;});}}/></div>;}

 if(v.kind==='dragToZone'&&frame)return <DragQuestion lesson={lesson} q={q} frame={frame} answer={answer} onAnswer={pick} state={state} locked={locked}/>;

 if(v.kind==='trueFalse'&&frame){
  return <div className={styles.visual}><MiniPitch lesson={lesson} frame={frame}/><div className={`${styles.choices} ${styles.pair}`} role="group" aria-label="True or false">{[0,1].map(i=>{const st=state(i);return <button key={i} type="button" className={`${styles.choice} ${styles.tf} ${styles[st]}`} aria-pressed={answer===i} disabled={locked(i)&&answer!==i} onClick={()=>pick(i)}><span aria-hidden="true">{i===0?'✓':'✗'}</span>{q.options[i]}</button>;})}</div></div>;}

 if(v.kind==='pickPicture'||v.kind==='whatNext'&&v.pictures){const pics=v.pictures!;
  return <div className={styles.visual}>{v.kind==='whatNext'&&frame&&<Freeze lesson={lesson} frame={frame}/>}<div className={`${styles.pictures} ${pics.length>2?styles.four:''}`} role="group" aria-label="Pictures to choose from">{pics.map((p,i)=>{const st=state(i);return <button key={i} type="button" className={`${styles.picture} ${styles[st]}`} aria-label={`${LETTERS[i]}: ${q.options[i]}${st==='good'?', correct':st==='bad'?', not this one':''}`} disabled={locked(i)&&answer!==i} onClick={()=>pick(i)}><MiniPitch lesson={lesson} frame={p} thumb label=""/><span><b>{LETTERS[i]}</b> {q.options[i]}</span></button>;})}</div></div>;}

 if(v.kind==='whatNext'&&frame){
  return <div className={styles.visual}><Freeze lesson={lesson} frame={frame}/><div className={styles.choices} role="group" aria-label="What happens next">{q.options.map((o,i)=>{const st=state(i);return <button key={i} type="button" className={`${styles.choice} ${styles[st]}`} disabled={locked(i)&&answer!==i} onClick={()=>pick(i)}><b>{LETTERS[i]}</b>{o}</button>;})}</div></div>;}

 if(v.kind==='order')return <OrderQuestion lesson={lesson} q={q} answer={answer} onAnswer={pick}/>;
 return null;
}

function Freeze({lesson,frame}:{lesson:FieldLesson;frame:QuizFrame}){
 const f=useMemo(()=>({...frame,trails:frame.trails??true}),[frame]);
 return <div className={styles.freeze}><MiniPitch lesson={lesson} frame={f}/><span className={styles.freezeTag} aria-hidden="true">❚❚ Freeze-frame</span></div>;
}

function DragQuestion({lesson,q,frame,answer,onAnswer,state,locked}:{lesson:FieldLesson;q:VisualFieldQuestion;frame:QuizFrame;answer:number|null;onAnswer:(i:number)=>void;state:(i:number)=>State;locked:(i:number)=>boolean}){
 const v=q.visual,zones=v.zones??[],id=v.drag!;
 const svg=useRef<SVGSVGElement|null>(null),[setSvg,upp]=useUnitsPerPixel();
 const [drag,setDrag]=useState<{x:number;y:number}|null>(null),pointer=useRef<number|null>(null);
 const [hover,setHover]=useState<number|null>(null);
 // The dragged player is drawn by this layer (hidden from the board) so it can move under the finger.
 const board=useMemo(()=>({...frame,hide:[...frame.hide??[],id],focus:frame.focus??[id]}),[frame,id]);
 const start=useMemo(()=>framePose(lesson,frame).positions.get(id)??{x:135,y:200},[lesson,frame,id]);
 const actor=[...lesson.offense,...lesson.defense].find(a=>a.id===id),gold=lesson.offense.some(a=>a.id===id);
 useEffect(()=>{if(answer===null){setDrag(null);setHover(null);}},[answer]);
 const toSvg=(e:ReactPointerEvent)=>{const el=svg.current;if(!el)return null;const m=el.getScreenCTM();if(!m)return null;const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());return {x:p.x,y:p.y};};
 const zoneAt=(p:{x:number;y:number})=>zones.findIndex(z=>Math.abs(p.x-z.x)<=z.w/2+6&&Math.abs(p.y-z.y)<=z.h/2+6);
 const placed=answer!==null?{x:zones[answer].x,y:zones[answer].y}:null,at=drag??placed??start;
 return <div className={styles.visual}><MiniPitch lesson={lesson} frame={board} extra={[start,...zones.flatMap(z=>[{x:z.x-z.w/2,y:z.y-z.h/2},{x:z.x+z.w/2,y:z.y+z.h/2}])]} svgRef={el=>{svg.current=el;setSvg(el);}} label={`Mini pitch. Move the ${actor?.label??'player'} into the best space. ${describeFrame(lesson,frame,framePose(lesson,frame))}`} after={(_,unit)=><>
  {zones.map((z,i)=>{const st=state(i),lit=hover===i&&st==='idle';return <Target key={i} state={st} label={`Move the ${actor?.label??'player'} to space ${LETTERS[i]}: ${q.options[i]}`} disabled={locked(i)} onPick={()=>onAnswer(i)}>
   <rect className={styles.ring} x={z.x-z.w/2} y={z.y-z.h/2} width={z.w} height={z.h} rx={unit*.5} fill={st==='idle'?(lit?'#fff2b955':'#fff2b91f'):stroke(st)+'44'} stroke={stroke(st)} strokeWidth={unit*(lit?.3:.18)} strokeDasharray={st==='idle'?`${unit*.5} ${unit*.35}`:undefined}/><Chip x={z.x} y={z.y-z.h/2+unit*.9} text={LETTERS[i]} unit={unit}/></Target>;})}
  <line x1={start.x} y1={start.y} x2={at.x} y2={at.y} stroke="#fff9e5aa" strokeWidth={unit*.16} strokeDasharray={`${unit*.5} ${unit*.4}`} pointerEvents="none"/>
  <g className={`${styles.token} ${drag?styles.dragging:''}`} transform={`translate(${at.x} ${at.y})`} aria-hidden="true"
   onPointerDown={e=>{if(answer!==null)return;pointer.current=e.pointerId;(e.currentTarget as Element).setPointerCapture(e.pointerId);const p=toSvg(e);if(p)setDrag(p);}}
   onPointerMove={e=>{if(pointer.current!==e.pointerId)return;const p=toSvg(e);if(p){setDrag(p);const z=zoneAt(p);setHover(z<0?null:z);}}}
   onPointerUp={e=>{if(pointer.current!==e.pointerId)return;pointer.current=null;const p=toSvg(e),z=p?zoneAt(p):-1;setHover(null);setDrag(null);if(z>=0)onAnswer(z);}}
   onPointerCancel={()=>{pointer.current=null;setDrag(null);setHover(null);}}>
   <circle r={Math.max(24*upp,unit*1.6)} fill="transparent"/><circle r={unit*1.55} fill="none" stroke="#fff2b9" strokeWidth={unit*.22} className={styles.handle}/><circle r={unit*1.12} fill={gold?'#f7cb69':'#4f7f98'} stroke="#fff9e5" strokeWidth={unit*.14}/><text textAnchor="middle" y={unit*.32} fontSize={unit*.8} fontWeight="800" fill={gold?'#243f36':'#fff'}>{short(actor?.label??'')}</text>
  </g></>}/></div>;
}

/** Drag-to-reorder: a vertical stack of step cards (shuffled), a fixed 1..n slot rail, and "Check order". Touch drags start on the
 *  grip only (touch-action:none there), so a finger on the card text still scrolls the quiz panel; a mouse can grab the whole card.
 *  Up/down buttons and arrow keys on the grip do the same move. Cards slide with CSS transform transitions (FLIP on drop), no loop. */
type OrderDrag={i:number;from:number;to:number;dy:number};
function OrderQuestion({lesson,q,answer,onAnswer}:{lesson:FieldLesson;q:VisualFieldQuestion;answer:number|null;onAnswer:(i:number)=>void}){
 const n=q.options.length,display=useMemo(()=>orderDisplay(n,lesson.id+q.q),[n,lesson.id,q.q]);
 // A retry keeps the child's arrangement: they fix it instead of starting over (the flagged card is the one to rethink).
 const [order,setOrder]=useState<number[]>(display);
 const [drag,setDrag]=useState<OrderDrag|null>(null),[said,setSaid]=useState('');
 const done=answer===q.correct,wrong=answer!==null&&!done,locked=answer!==null;
 const list=useRef<HTMLOListElement|null>(null),cards=useRef(new Map<number,HTMLDivElement>());
 const g=useRef<{pointer:number;startY:number;rects:DOMRect[];scroller:HTMLElement|null;scroll0:number}|null>(null);
 const before=useRef<Map<number,number>|null>(null),refocus=useRef<{i:number;act:string}|null>(null);
 const frames=q.visual.frames;
 const scrollTop=(el:HTMLElement|null)=>el?el.scrollTop:window.scrollY;
 // Card tops (relative to the list, transforms included) just before a reorder, so the new layout can slide from them.
 const snapshot=()=>{const top=list.current?.getBoundingClientRect().top??0,m=new Map<number,number>();cards.current.forEach((el,i)=>m.set(i,el.getBoundingClientRect().top-top));before.current=m;};
 useLayoutEffect(()=>{
  const from=before.current;before.current=null;
  if(from&&list.current&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){const top=list.current.getBoundingClientRect().top;
   cards.current.forEach((el,i)=>{const was=from.get(i);if(was===undefined)return;const d=was-(el.getBoundingClientRect().top-top);if(Math.abs(d)<1)return;
    el.style.transition='none';el.style.transform=`translateY(${d}px)`;void el.offsetHeight;el.style.transition='';el.style.transform='';});}
  const f=refocus.current;refocus.current=null;
  if(f){const row=list.current?.querySelector(`[data-step="${f.i}"]`);const b=row?.querySelector<HTMLButtonElement>(`[data-act="${f.act}"]`);(b&&!b.disabled?b:row?.querySelector<HTMLButtonElement>('[data-act="grip"]'))?.focus();}
 },[order]);
 const move=(from:number,to:number,act?:string)=>{if(locked||to<0||to>=n||to===from)return;const i=order[from];snapshot();if(act)refocus.current={i,act};setOrder(moveStep(order,from,to));setSaid(`Moved "${q.options[i]}" to place ${to+1} of ${n}.`);};
 const scrollerOf=(el:HTMLElement)=>{for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p).overflowY;if((s==='auto'||s==='scroll')&&p.scrollHeight>p.clientHeight)return p;}return null;};
 const down=(e:ReactPointerEvent<HTMLDivElement>,i:number)=>{
  const t=e.target as Element;if(locked||g.current||e.button!==0||t.closest('[data-act="up"],[data-act="down"]'))return;
  if(e.pointerType==='touch'&&!t.closest('[data-act="grip"]'))return;// finger on the text scrolls; the grip drags
  const from=order.indexOf(i),el=e.currentTarget,scroller=scrollerOf(el);
  e.preventDefault();el.setPointerCapture(e.pointerId);
  g.current={pointer:e.pointerId,startY:e.clientY,rects:order.map(k=>cards.current.get(k)!.getBoundingClientRect()),scroller,scroll0:scrollTop(scroller)};
  setDrag({i,from,to:from,dy:0});
 };
 const dragMove=(e:ReactPointerEvent)=>{const s=g.current;if(!s||s.pointer!==e.pointerId||!drag)return;
  // Past the scroll box's edge, nudge it (on move only; nothing loops).
  if(s.scroller){const r=s.scroller.getBoundingClientRect();if(e.clientY<r.top+20)s.scroller.scrollTop-=Math.min(24,r.top+20-e.clientY);else if(e.clientY>r.bottom-20)s.scroller.scrollTop+=Math.min(24,e.clientY-r.bottom+20);}
  setDrag({...drag,...landing(s,drag.from,e.clientY)});
 };
 const landing=(s:NonNullable<typeof g.current>,from:number,clientY:number)=>{const dy=clientY-s.startY+scrollTop(s.scroller)-s.scroll0,r=s.rects[from];return {dy,to:dropSlot(s.rects.map(x=>x.top+x.height/2),from,r.top+r.height/2+dy)};};
 // Recompute the slot from the release point itself: touch moves are coalesced, so the last pointermove can trail the finger.
 const up=(e:ReactPointerEvent)=>{const s=g.current;if(!s||s.pointer!==e.pointerId)return;g.current=null;const d=drag&&{...drag,...landing(s,drag.from,e.clientY)};if(d&&d.to!==d.from){snapshot();setOrder(moveStep(order,d.from,d.to));setSaid(`Moved "${q.options[d.i]}" to place ${d.to+1} of ${n}.`);}setDrag(null);};
 const cancel=()=>{g.current=null;setDrag(null);};
 const shift=(k:number)=>{if(!drag||!g.current)return 0;const r=g.current.rects,{from,to}=drag,h=r[from].height+(n>1?Math.abs((r[1].top-r[0].bottom))||8:8);
  if(k===from)return drag.dy;if(from<to&&k>from&&k<=to)return -h;if(to<from&&k>=to&&k<from)return h;return 0;};
 const firstWrong=wrong?order.indexOf(answer!):-1;
 return <div className={styles.visual}>
  <ol ref={list} className={styles.orderList} aria-label="Steps to put in order">{order.map((i,k)=>{const st:State=done?'good':wrong&&answer===i?'bad':'idle',lift=drag?.i===i;
   return <li key={i} data-step={i} className={styles.orderRow}><span className={styles.slot} aria-hidden="true">{k+1}</span>
    <div ref={el=>{if(el)cards.current.set(i,el);else cards.current.delete(i);}} className={`${styles.orderCard} ${styles[st]} ${lift?styles.lifted:''} ${locked?'':styles.movable}`} style={drag&&g.current?{transform:`translateY(${shift(k)}px)`}:undefined}
     onPointerDown={e=>down(e,i)} onPointerMove={dragMove} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={e=>{if(g.current?.pointer===e.pointerId)up(e);}}>
     <button type="button" data-act="grip" className={styles.grip} disabled={locked} aria-label={`Place ${k+1} of ${n}: ${q.options[i]}${st==='bad'?', not in the right place':st==='good'?', correct':''}. Use the up and down arrow keys to move it.`}
      onKeyDown={e=>{if(e.key==='ArrowUp'){e.preventDefault();move(k,k-1,'grip');}else if(e.key==='ArrowDown'){e.preventDefault();move(k,k+1,'grip');}}}>
      {st==='idle'?<svg viewBox="0 0 12 20" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="4" r="1.6"/><circle cx="9" cy="4" r="1.6"/><circle cx="3" cy="10" r="1.6"/><circle cx="9" cy="10" r="1.6"/><circle cx="3" cy="16" r="1.6"/><circle cx="9" cy="16" r="1.6"/></g></svg>:<b className={styles.badge} aria-hidden="true">{st==='good'?'✓':'✗'}</b>}
     </button>
     {frames?.[i]&&<MiniPitch lesson={lesson} frame={frames[i]} thumb label=""/>}
     <span className={styles.orderText}>{q.options[i]}</span>
     {!locked&&<><button type="button" data-act="up" className={styles.move} disabled={k===0} aria-label={`Move up: ${q.options[i]}`} onClick={()=>move(k,k-1,'up')}>▲</button>
     <button type="button" data-act="down" className={styles.move} disabled={k===n-1} aria-label={`Move down: ${q.options[i]}`} onClick={()=>move(k,k+1,'down')}>▼</button></>}
    </div></li>;})}</ol>
  <p className={styles.orderStatus} aria-live="polite">{done?'All in order.':wrong?`Place ${firstWrong+1} is not right yet.`:said}</p>
  {!locked&&<button type="button" className={styles.check} disabled={!!drag} onClick={()=>onAnswer(orderAnswer(order,q.correct))}>Check order</button>}
 </div>;
}
