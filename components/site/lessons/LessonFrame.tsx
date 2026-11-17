import {PITCH,type GuideFormat} from '../../../lib/site/pitch';
import {FIELD,type LessonFrameData} from '../../../lib/site/lessonFrames';
/**
 * One lesson frame as server-rendered inline SVG (visual pass, Nov 17 2026): the lesson's own positions at the end of a chapter
 * (lib/site/lessonFrames.ts), drawn in the game's 270x400 lesson space and cropped top-to-bottom to where the play happens.
 * Same palette as lib/site/PitchDiagram.tsx (pitch green, white lines, gold team, dark-ink other team). Gold attacks up the
 * picture. Dashed arrows = runs during the chapter, solid arrows = the ball's path, a white ring = a player the coach points at.
 * No client code, no animation. role="img" with an aria-label; the numbered steps beside it stay the source of truth.
 */
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55';
/** Short text for the dot: "RIGHT FRONT" -> "RF", "PIVOT" -> "PIV"; the aria-label keeps the full name. */
export const dotLabel=(s:string)=>{const w=s.trim().split(/\s+/);return w.length>1?w.map(x=>x[0]).join('').slice(0,3):s.length>3?s.slice(0,3):s;};
export default function LessonFrame({id,format,frame,label}:{id:string;format:GuideFormat;frame:LessonFrameData;label:string}){
 const p=PITCH[format],kx=(FIELD.x1-FIELD.x0)/p.w,ky=(FIELD.y1-FIELD.y0)/p.l,cx=FIELD.w/2,cy=(FIELD.y0+FIELD.y1)/2;
 const {y0,y1}=frame.view,H=y1-y0,r=11;
 const line={fill:'none',stroke:PAPER,strokeWidth:1.6,strokeOpacity:.8} as const;
 const end=(gy:number,dir:1|-1)=><g key={gy}>
  {p.box&&<rect {...line} x={cx-p.box[0]*kx/2} y={dir===1?gy:gy-p.box[1]*ky} width={p.box[0]*kx} height={p.box[1]*ky}/>}
  {p.six&&<rect {...line} x={cx-p.six[0]*kx/2} y={dir===1?gy:gy-p.six[1]*ky} width={p.six[0]*kx} height={p.six[1]*ky}/>}
  {p.arc&&<path {...line} d={`M${cx-(p.goal/2+p.arc)*kx} ${gy}A${p.arc*kx} ${p.arc*ky} 0 0 ${dir===1?0:1} ${cx-p.goal/2*kx} ${gy+dir*p.arc*ky}H${cx+p.goal/2*kx}A${p.arc*kx} ${p.arc*ky} 0 0 ${dir===1?0:1} ${cx+(p.goal/2+p.arc)*kx} ${gy}`}/>}
  <circle cx={cx} cy={gy+dir*p.spot*ky} r={2} fill={PAPER}/>
  {p.spot2&&<circle cx={cx} cy={gy+dir*p.spot2*ky} r={2} fill={PAPER}/>}
  {p.buildOut&&<line {...line} strokeDasharray="6 5" x1={FIELD.x0} x2={FIELD.x1} y1={gy+dir*p.buildOut*ky} y2={gy+dir*p.buildOut*ky}/>}
  <rect x={cx-p.goal*kx/2} y={dir===1?gy-5:gy} width={p.goal*kx} height={5} fill={PAPER}/>
 </g>;
 const cut=(a:{x:number;y:number},b:{x:number;y:number},by:number)=>{const d=Math.hypot(b.x-a.x,b.y-a.y)||1,u=Math.max(0,(d-by)/d);return {x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u};};
 const n=(v:number)=>Math.round(v*10)/10;
 /* a ball at a player's feet sits beside the dot, not under it */
 const held=frame.players.some(s=>Math.hypot(s.x-frame.ball.x,s.y-frame.ball.y)<12);
 return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label={label} viewBox={`0 ${y0} ${FIELD.w} ${H}`} width={FIELD.w} height={H} data-lesson-frame={frame.step} fontFamily="Arial,Helvetica,sans-serif">
  <defs>
   <marker id={`${id}-w`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={PAPER}/></marker>
   <marker id={`${id}-k`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={INK}/></marker>
  </defs>
  <rect x={0} y={y0} width={FIELD.w} height={H} fill={GRASS}/>
  <rect {...line} x={FIELD.x0} y={FIELD.y0} width={FIELD.x1-FIELD.x0} height={FIELD.y1-FIELD.y0}/>
  <line {...line} x1={FIELD.x0} x2={FIELD.x1} y1={cy} y2={cy}/>
  <ellipse {...line} cx={cx} cy={cy} rx={p.circle*kx} ry={p.circle*ky}/>
  {end(FIELD.y0,1)}{end(FIELD.y1,-1)}
  {frame.runs.map((a,i)=>{const t=cut(a.from,a.to,r+3),opp=a.team==='opp';
   return <line key={`r${i}`} data-run="" x1={n(a.from.x)} y1={n(a.from.y)} x2={n(t.x)} y2={n(t.y)} stroke={opp?INK:PAPER} strokeOpacity={opp?.7:.85} strokeWidth={2} strokeDasharray="5 4" markerEnd={`url(#${id}-${opp?'k':'w'})`}/>;})}
  {frame.ballPath.slice(1).map((q,i)=>{const a=frame.ballPath[i],t=cut(a,q,7);
   return <line key={`b${i}`} data-pass="" x1={n(a.x)} y1={n(a.y)} x2={n(t.x)} y2={n(t.y)} stroke={PAPER} strokeWidth={2.6} markerEnd={`url(#${id}-w)`}/>;})}
  {frame.players.map(s=>{const opp=s.team==='opp',t=dotLabel(s.label);
   return <g key={s.id} data-player={s.label}>
    {s.focus&&<circle cx={n(s.x)} cy={n(s.y)} r={r+4} fill="none" stroke={PAPER} strokeWidth={2.4} data-focus=""/>}
    <circle cx={n(s.x)} cy={n(s.y)} r={r} fill={opp?INK:GOLD} stroke={opp?PAPER:INK} strokeWidth={1.6}/>
    <text x={n(s.x)} y={n(s.y)+3.6} textAnchor="middle" fontSize={t.length>2?7.5:9.5} fontWeight={700} fill={opp?PAPER:INK}>{t}</text>
   </g>;})}
  <circle data-ball="" cx={n(frame.ball.x+(held?8:0))} cy={n(frame.ball.y-(held?9:0))} r={4.5} fill={PAPER} stroke={INK} strokeWidth={1.6}/>
 </svg>;
}
