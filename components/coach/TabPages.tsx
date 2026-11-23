'use client';
import type {ReactNode} from 'react';
import GridDiagram from '@/lib/site/GridDiagram';
import type {Words} from '@/lib/coach/words';
import type {Lang,Store} from '@/lib/coach/store';
import type {Age} from '@/lib/coach/route';
import {planOfDay,usePlans,boardHref,scanHref} from './PlansTool';
import c from './coach.module.css';
import t from './tabs.module.css';
import {BoardIcon,BookIcon,ChartIcon,ClockIcon,EyeIcon,PitchIcon,RulerIcon,ShirtIcon,SwapIcon} from './GameIcons';
/** a light tinted pill with a game-style icon and a bold figure (the game's top-bar pills) */
const Pill=({icon,children,tone}:{icon:ReactNode;children:ReactNode;tone:string})=><span className={t.pill} data-tone={tone}>{icon}<b>{children}</b></span>;
/**
 * The coach app's two tab pages (round 4A, Nov 22 2026; owner: "like the iPhone App Store"): a big feature card on top, then large
 * picture tiles (drawn here in the brand's flat colours, no icons in squares), and on Training a row of cards that scrolls sideways.
 * Game Day is the bold, match-focused one (ink and gold); Training is the bright, playful one (pitch green, sky, gold).
 * Pictures are inline SVG: no image requests, no animation loops (AGENTS.md, phone heat).
 */
type Tile={key:string;name:string;line:string;art:ReactNode;icon:ReactNode;on?:()=>void;href?:string;wide?:boolean};
function Tiles({tiles,cls,intro,from=0}:{tiles:Tile[];cls:string;intro:boolean;from?:number}){
 return <ul className={`${t.tiles} ${cls}`}>{tiles.map((x,i)=>{const body=<><span className={t.art} aria-hidden="true">{x.art}</span><span className={t.tText}><span className={t.tHead}>{x.icon}<b>{x.name}</b></span><small>{x.line}</small></span></>;
  return <li key={x.key} data-wide={x.wide?'':undefined} className={intro?'fi-in':undefined} style={intro?{'--i':from+i} as React.CSSProperties:undefined}>
   {x.href?<a className={t.tile} data-tool={x.key} href={x.href} onClick={rememberY}>{body}</a>:<button type="button" className={t.tile} data-tool={x.key} onClick={x.on}>{body}</button>}</li>;})}</ul>;
}
/** The tab page's scroll when a tile leaves for another page (/board, /scan, the field diagrams), restored on the way back. */
export const HOME_Y='fi-coach-home-y';
const rememberY=()=>{try{window.sessionStorage.setItem(HOME_Y,String(window.scrollY));}catch{/* optional */}};
/* ------------------------------------------------------------ the drawings (viewBox 160 x 100) ------------------------------
   One style for every tile (owner, Nov 22 2026: "the images are not great", "don't use dark colors", "remove the borders", "colors are
   blending too much"): a light panel in its own tint, the subject in strong brand colours on it (a fresh mid green pitch, gold,
   coral, sky, green), no outlines, a soft shadow under the key objects. Text inside a shape is ink: 4.6:1 or more on every fill
   (gold 9.0, coral 5.4, sky 4.6, green 4.6, pitch 6.8). */
const INK='#14221d',GR='#5cb87f',GR2='#67c189',GOLD='#f2b630',CORAL='#ef6c4d',SKY='#3d8bd6',GREEN='#2f9a5b',WHITE='#ffffff';
const LIFT={filter:'drop-shadow(0 2px 2.5px rgb(20 34 29 / .22))'};
const PANEL={lineup:'#fdf3dc',minutes:'#fde9b8',subs:'#dbe9fb',match:'#fde3d8',summary:'#e4f3e8',plans:'#fde6cf',scan:'#dbe9fb',board:'#fff4dc',fields:'#e4f3e8'};
/* the whole drawing always fits its tile (meet), on a field of its own colour */
const Svg=({bg,children,bleed}:{bg:string;children:ReactNode;bleed?:boolean})=><svg viewBox="0 0 160 100" preserveAspectRatio={bleed?'xMidYMid slice':'xMidYMid meet'} style={{background:bleed?GR:bg}}><rect width="160" height="100" fill={bg}/>{children}</svg>;
/* a scene fills its tile edge to edge (owner: "fill the entire space with the green"): Field() with no box is the whole image */
const Field=({x=0,y=0,w=160,h=100}:{x?:number;y?:number;w?:number;h?:number})=><g>
 <rect x={x} y={y} width={w} height={h} rx={x?6:0} fill={GR} style={x?LIFT:undefined}/>{[1,3,5].map(i=><rect key={i} x={x+w/6*i} y={y} width={w/6} height={h} fill={GR2}/>)}
 <g fill="none" stroke={WHITE} strokeWidth="1.8" strokeOpacity=".9"><rect x={x+(x?4:10)} y={y+(x?4:18)} width={w-(x?8:20)} height={h-(x?8:36)} rx="2"/><path d={`M${x+w/2} ${y+4}v${h-8}`}/><circle cx={x+w/2} cy={y+h/2} r={h/6}/><rect x={x+(x?4:10)} y={y+h*.33} width={w*.1} height={h*.34}/><rect x={x+w*.9-(x?4:10)} y={y+h*.33} width={w*.1} height={h*.34}/></g></g>;
const Disc=({x,y,n,fill=GOLD,r=7.5}:{x:number;y:number;n?:string|number;fill?:string;r?:number})=><g style={LIFT}><circle cx={x} cy={y} r={r} fill={fill}/>{n!=null&&n!==''&&<text x={x} y={y+r*.42} textAnchor="middle" fontSize={r*1.2} fontWeight="800" fill={INK} fontFamily="system-ui,sans-serif">{n}</text>}</g>;
const Arrow=({d,dash,color=INK}:{d:string;dash?:boolean;color?:string})=><path d={d} fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash?'5 5':undefined}/>;
const Cone=({x,y,c=CORAL}:{x:number;y:number;c?:string})=><path d={`M${x} ${y-8}l6.5 12h-13z`} fill={c} style={LIFT}/>;
const Card=({x,y,w,h,r=10}:{x:number;y:number;w:number;h:number;r?:number})=><rect x={x} y={y} width={w} height={h} rx={r} fill={WHITE} style={LIFT}/>;
export const ART={
 lineup:<Svg bg={PANEL.lineup} bleed><Field/>{[[26,50,1],[50,30,2],[50,70,3],[76,50,6],[104,28,7],[104,72,8],[128,50,9]].map(([x,y,n])=><Disc key={n} x={x} y={y} n={n}/>)}</Svg>,
 minutes:<Svg bg={PANEL.minutes}><Card x={22} y={12} w={116} h={76}/>
  {[0,1,2,3].map(i=><g key={i}><Disc x={38} y={27+i*16} r={6.2} n={[4,7,9,11][i]} fill={[GOLD,SKY,CORAL,GREEN][i]}/><rect x="50" y={23+i*16} width="76" height="8" rx="4" fill="#f1ead8"/><rect x="50" y={23+i*16} width={[60,56,62,54][i]} height="8" rx="4" fill={[GOLD,SKY,CORAL,GREEN][i]}/></g>)}</Svg>,
 subs:<Svg bg={PANEL.subs}><Card x={42} y={14} w={76} h={60}/><rect x="74" y="74" width="12" height="16" rx="2" fill={WHITE}/>
  <rect x="48" y="20" width="30" height="48" rx="6" fill="#d9f0e1"/><rect x="82" y="20" width="30" height="48" rx="6" fill="#fde0d8"/>
  <text x="63" y="58" textAnchor="middle" fontSize="24" fontWeight="800" fill="#1f7a45" fontFamily="system-ui,sans-serif">7</text><text x="97" y="58" textAnchor="middle" fontSize="24" fontWeight="800" fill="#b8442a" fontFamily="system-ui,sans-serif">11</text>
  <Arrow d="M63 36v-9m-4.5 4.5 4.5-4.5 4.5 4.5" color="#1f7a45"/><Arrow d="M97 27v9m-4.5-4.5 4.5 4.5 4.5-4.5" color="#b8442a"/></Svg>,
 match:<Svg bg={PANEL.match}><circle cx="80" cy="54" r="34" fill={WHITE} style={LIFT}/><rect x="72" y="11" width="16" height="9" rx="3" fill={CORAL}/>
  <path d="M80 54 L80 22 A32 32 0 0 1 107.7 38 Z" fill={GOLD}/><path d="M80 54V30M80 54l14 8" stroke={INK} strokeWidth={3.2} strokeLinecap="round"/><circle cx="80" cy="54" r="3.5" fill={INK}/>
  <circle cx="126" cy="24" r="7" fill={CORAL} style={LIFT}/></Svg>,
 summary:<Svg bg={PANEL.summary}><Card x={30} y={12} w={100} h={76}/>{[30,40,36,46,38].map((h,i)=><rect key={i} x={44+i*15} y={78-h} width="10" height={h} rx="3" fill={i===3?GREEN:i%2?GOLD:SKY}/>)}<path d="M40 80h80" stroke="#e3dfd0" strokeWidth={2}/></Svg>,
 plans:<Svg bg={PANEL.plans}><Card x={38} y={12} w={66} h={80} r={8}/><rect x="56" y="7" width="30" height="11" rx="4" fill={GOLD} style={LIFT}/>
  {[0,1,2].map(i=><g key={i}><circle cx="52" cy={34+i*16} r="4.5" fill={[GREEN,GOLD,SKY][i]}/><rect x="62" y={31+i*16} width={[30,24,32][i]} height="6" rx="3" fill="#cfc6ae"/></g>)}
  <circle cx="124" cy="40" r="15" fill={WHITE} style={LIFT}/><path d="M124 40v-8M124 40l6 4" stroke={INK} strokeWidth={2.6} strokeLinecap="round"/><Cone x={116} y={82}/><Cone x={134} y={82} c={GOLD}/></Svg>,
 scan:<Svg bg={PANEL.scan}><path d="M80 52 L34 22 A56 56 0 0 1 60 10 Z" fill={SKY} fillOpacity=".55"/><path d="M80 52 L126 22 A56 56 0 0 0 100 10 Z" fill={GOLD} fillOpacity=".6"/>
  <g style={LIFT}><circle cx="80" cy="62" r="15" fill={SKY}/><circle cx="80" cy="47" r="8" fill="#e9a77c"/></g><Arrow d="M69 37q-8-6-15-4"/><Arrow d="M91 37q8-6 15-4"/>
  <rect x="14" y="60" width="24" height="24" rx="6" fill={CORAL} style={LIFT}/><rect x="122" y="60" width="24" height="24" rx="6" fill={GREEN} style={LIFT}/>
  <text x="134" y="77" textAnchor="middle" fontSize="14" fontWeight="800" fill={INK} fontFamily="system-ui,sans-serif">3</text><Arrow d="M20 72h11m-4.5-4.5 4.5 4.5-4.5 4.5"/></Svg>,
 board:<Svg bg={PANEL.board} bleed><Field/><Disc x={38} y={66} n={4}/><Disc x={78} y={30} n={8}/><Disc x={118} y={60} n={9}/><Disc x={98} y={76} fill={CORAL} n=""/><Disc x={60} y={46} fill={CORAL} n=""/>
  <Arrow d="M44 61 70 37" color={WHITE}/><path d="m63.5 36.5 7.5-.5-1 7.5" fill="none" stroke={WHITE} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/><Arrow d="M86 32q28 2 30 20" dash color={INK}/></Svg>,
 fields:<Svg bg={PANEL.fields}><Field x={22} y={10} w={116} h={68}/><path d="M22 88h116M22 84v8M138 84v8" stroke={GREEN} strokeWidth={2.4} strokeLinecap="round"/><rect x="64" y="82" width="32" height="12" rx="4" fill={WHITE} style={LIFT}/></Svg>,
};
/* ------------------------------------------------------------ Game Day ------------------------------------------------------ */
type GD={w:Words;store:Store;place:number;fmt:string;coming:number;onField:number;intro:boolean;live:{period:string;clock:string;change:string;team:string}|null;gameDone:boolean;
 onMatch:()=>void;onTool:(k:'team'|'lineup'|'minutes'|'subs'|'summary')=>void;onExample:()=>void};
export function GameDayTab({w,store,place,fmt,coming,onField,intro,live,gameDone,onMatch,onTool,onExample}:GD){
 const s=store.settings,team=store.team,has=team.players.length>0,name=team.name||w.teamN(place);
 return <div className={t.gameday} data-tab-page="gameday">
  <h1 className={c.srOnly}>{w.navGameDay}</h1>
  <section className={`${t.feature} ${t.featureGame} ${intro?'fi-in':''}`} aria-labelledby="gd-feature" data-live={live?'':undefined}>
   <div className={t.fArt} aria-hidden="true">{ART.match}</div>
   <div className={t.fBody}>
   <p className={t.fKicker} id="gd-feature">{live?w.gameOn:`${w.matchDay} · ${w.nextGame}`}</p>
   <p className={t.fTitle}>{name}</p>
   {live?<p className={t.fLive}><span className={t.liveDot} aria-hidden="true"/>{live.period}{live.clock&&<> · <b>{live.clock}</b></>}{live.change&&<> · {live.change}</>}</p>
    :<p className={t.pills}><Pill tone="green" icon={<PitchIcon size={22}/>}>{fmt}</Pill><Pill tone="gold" icon={<ClockIcon size={22}/>}>{s.periods} × {s.periodMin} {w.min}</Pill>{has&&<><Pill tone="peach" icon={<ShirtIcon size={22}/>}>{w.comingN(coming)}</Pill><Pill tone="sky" icon={<PitchIcon size={22}/>}>{w.onFieldN(onField)}</Pill></>}</p>}
   {has||live?<div className={t.fBtns}>
     <button type="button" className={`${c.btn} ${c.btnGold}`} onClick={onMatch} data-coach-match="">{live?w.backToGame:w.startMatch}</button>
     {!live&&<button type="button" className={`${c.btn} ${t.fOutline}`} onClick={()=>onTool('team')}>{w.editSquad}</button>}
    </div>
    :<><p className={t.fMeta}>{w.homeEmpty}</p><div className={t.fBtns}><button type="button" className={`${c.btn} ${c.btnGold}`} onClick={()=>onTool('team')}>{w.setupTeam}</button>
     <button type="button" className={`${c.btn} ${t.fOutline}`} onClick={onExample}>{w.tryExample}</button></div></>}
   {gameDone&&!live&&<button type="button" className={t.fLink} onClick={()=>onTool('summary')}>{w.gameDone} · {w.seeSummary}</button>}
   </div>
  </section>
  <h2 className={t.h2}>{w.gdMore}</h2>
  <Tiles intro={intro} from={1} cls={t.tilesGame} tiles={[
   {key:'lineup',name:w.titleLineup,line:w.lineLineup,art:ART.lineup,icon:<PitchIcon size={28}/>,on:()=>onTool('lineup'),wide:true},
   {key:'minutes',name:w.titleMinutes,line:w.lineMinutes,art:ART.minutes,icon:<ClockIcon size={28}/>,on:()=>onTool('minutes')},
   {key:'subs',name:w.titleSubs,line:w.lineSubs,art:ART.subs,icon:<SwapIcon size={28}/>,on:()=>onTool('subs')},
   {key:'summary',name:w.titleSummary,line:w.lineSummary,art:ART.summary,icon:<ChartIcon size={28}/>,on:()=>onTool('summary'),wide:true}]}/>
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </div>;
}
/* ------------------------------------------------------------ Training ------------------------------------------------------ */
/* owner, Nov 22 2026: Scanning trainer and Tactics board first (the hero and the next big tile), then tonight's plan, practice plans
   and the field diagrams */
type TR={w:Words;lang:Lang;version:string;age:Age;intro:boolean;onPlans:(plan?:string,run?:boolean)=>void};
export function TrainingTab({w,lang,version,age,intro,onPlans}:TR){
 const {data}=usePlans(lang,version);
 const plans=data&&data!=='fail'?data:null,day=Math.floor(Date.now()/864e5),plan=plans?planOfDay(plans.plans,age,day):null;
 const fields=lang==='es'?'/es/tools/soccer-field-diagrams':'/tools/soccer-field-diagrams';
 return <div className={t.training} data-tab-page="training">
  <h1 className={c.srOnly}>{w.navTraining}</h1>
  <a className={`${t.feature} ${t.featureTrain} ${intro?'fi-in':''}`} href={scanHref(lang)} onClick={rememberY} data-tool="scan">
   <span className={t.fArt} aria-hidden="true">{ART.scan}</span>
   <span className={t.fBody}><span className={t.tHead}><EyeIcon size={34}/><span className={t.fTitle}>{w.scanName}</span></span><span className={t.fMeta}>{w.lineScan}</span>
    <span className={t.fBtns}><span className={`${c.btn} ${c.btnGold}`}>{w.openTool}</span></span></span>
  </a>
  <div className={t.gap}/>
  <Tiles intro={intro} from={1} cls={t.tilesTrain} tiles={[{key:'board',name:w.boardName,line:w.lineBoard,art:ART.board,icon:<BoardIcon size={28}/>,href:boardHref(lang),wide:true}]}/>
  <h2 className={t.h2}>{w.tonight} · {age}</h2>
  <section className={t.tonight} aria-label={w.tonight}>
   <p className={t.tTitle}>{plan?plan.name:w.plansTitle}</p>
   {plan?<><p className={t.fMeta}>{plan.goal}</p><p className={t.pills}><Pill tone="gold" icon={<ClockIcon size={22}/>}>{w.minutesN(plan.minutes)}</Pill><Pill tone="peach" icon={<ShirtIcon size={22}/>}>{plan.players}</Pill></p></>:<p className={t.fMeta}>{data==='fail'?w.plansFail:w.loadingPlans}</p>}
   <div className={t.fBtns}>
    <button type="button" className={`${c.btn} ${c.btnGold}`} disabled={!plan} onClick={()=>plan&&onPlans(plan.slug,true)}>{w.startSession}</button>
    <button type="button" className={`${c.btn} ${t.fOutline}`} disabled={!plan} onClick={()=>plan&&onPlans(plan.slug)} data-tonight-open="">{w.openPlan}</button>
   </div>
  </section>
  {plan&&plans&&<ul className={t.rail} aria-label={w.inTonight}>{plan.drills.map(slug=>{const d=plans.drills[slug];return d?<li key={slug}><button type="button" className={t.railCard} onClick={()=>onPlans(plan.slug)}>
    <span className={t.railArt} aria-hidden="true"><GridDiagram id={`rail-${slug}`} scene={d.scene} small light/></span><b>{d.name}</b></button></li>:null;})}</ul>}
  <h2 className={t.h2}>{w.trMore}</h2>
  <Tiles intro={intro} from={2} cls={t.tilesTrain} tiles={[
   {key:'plans',name:w.plansTitle,line:w.lineDrills,art:ART.plans,icon:<BookIcon size={28}/>,on:()=>onPlans()},
   {key:'fields',name:w.fieldDiagrams,line:w.lineFieldDiagrams,art:ART.fields,icon:<RulerIcon size={28}/>,href:fields}]}/>
  <p className={`${c.note} ${c.foot}`}>{w.privacy}</p>
 </div>;
}
