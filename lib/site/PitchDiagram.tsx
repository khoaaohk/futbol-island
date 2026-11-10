import {PITCH,type Arrow,type GuideFormat,type Placed} from './pitch';
/**
 * One pitch diagram as server-rendered inline SVG (Nov 10 2026): the field of that format in proportion, numbered player dots
 * with a short position label, optional movement arrows (a picture with arrows drops the labels under the dots, so they never collide). No client code, no canvas, no animation (AGENTS.md, phone heat).
 * It carries <title> and <desc>; the page prints the same description under it (the text alternative). Colours are the home
 * page's: its pitch green, white lines, dark ink and the gold of the Play button. `mark` paints one position gold and dims the rest.
 */
// Nov 10 2026: the home page's palette (learn.module.css .root): pitch green grass, white lines, gold players with dark ink numbers.
const INK='#14221d',PAPER='#ffffff',GOLD='#e9c16b',GRASS='#1d6b55';
/** Scene extras (rules and glossary pages, Nov 10 2026; lib/site/scenes.ts): a ball, a dashed line across the field with a short
 *  word on it (the offside line), a shaded zone, and solid arrows for the ball's path. A scene colours dots by team (gold = the
 *  team attacking up the picture, green ink = the other team) and never treats the first dot as a goalkeeper. */
export type SceneExtras={ball?:readonly [number,number];lineY?:number;lineWord?:string;zone?:readonly [number,number,number,number];passes?:readonly Arrow[]};
export default function PitchDiagram({id,format,spots,title,desc,arrows=[],mark,small,scene}:{id:string;format:GuideFormat;spots:readonly Placed[];title:string;desc:string;arrows?:readonly Arrow[];mark?:string;small?:boolean;scene?:SceneExtras}){
 const p=PITCH[format],M=12,W=p.px,k=W/p.w,H=Math.round(p.l*k),cx=M+W/2,top=M,bot=M+H;
 const X=(x:number)=>M+x/100*W,Y=(y:number)=>bot-y/100*H,r=small?13:14;
 const line={fill:'none',stroke:PAPER,strokeWidth:2,strokeOpacity:.85} as const;
 const end=(goalY:number,dir:1|-1)=><g key={goalY}>
  {p.box&&<rect {...line} x={cx-p.box[0]*k/2} y={dir===1?goalY:goalY-p.box[1]*k} width={p.box[0]*k} height={p.box[1]*k}/>}
  {p.six&&<rect {...line} x={cx-p.six[0]*k/2} y={dir===1?goalY:goalY-p.six[1]*k} width={p.six[0]*k} height={p.six[1]*k}/>}
  {p.arc&&<path {...line} d={`M${cx-(p.goal/2+p.arc)*k} ${goalY}A${p.arc*k} ${p.arc*k} 0 0 ${dir===1?0:1} ${cx-p.goal/2*k} ${goalY+dir*p.arc*k}H${cx+p.goal/2*k}A${p.arc*k} ${p.arc*k} 0 0 ${dir===1?0:1} ${cx+(p.goal/2+p.arc)*k} ${goalY}`}/>}
  <circle cx={cx} cy={goalY+dir*p.spot*k} r={2.5} fill={PAPER}/>
  {p.spot2&&<circle cx={cx} cy={goalY+dir*p.spot2*k} r={2.5} fill={PAPER}/>}
  {p.buildOut&&<line {...line} strokeDasharray="7 6" x1={M} x2={M+W} y1={goalY+dir*p.buildOut*k} y2={goalY+dir*p.buildOut*k}/>}
  <rect x={cx-p.goal*k/2} y={dir===1?goalY-6:goalY} width={p.goal*k} height={6} fill={PAPER}/>
 </g>;
 return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${W+2*M} ${H+2*M}`} width={W+2*M} height={H+2*M} data-diagram={format} fontFamily="Arial,Helvetica,sans-serif">
  <title id={`${id}-t`}>{title}</title>
  <desc id={`${id}-d`}>{desc}</desc>
  <defs><marker id={`${id}-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill={PAPER}/></marker></defs>
  <rect x={0} y={0} width={W+2*M} height={H+2*M} rx={14} fill={GRASS}/>
  <rect {...line} x={M} y={top} width={W} height={H}/>
  <line {...line} x1={M} x2={M+W} y1={top+H/2} y2={top+H/2}/>
  <circle {...line} cx={cx} cy={top+H/2} r={p.circle*k}/>
  {end(top,1)}{end(bot,-1)}
  {scene?.zone&&<rect x={X(scene.zone[0])} y={Y(scene.zone[3])} width={X(scene.zone[2])-X(scene.zone[0])} height={Y(scene.zone[1])-Y(scene.zone[3])} fill={GOLD} fillOpacity={.34} data-zone=""/>}
  {scene?.lineY!==undefined&&<g data-line=""><line x1={M} x2={M+W} y1={Y(scene.lineY)} y2={Y(scene.lineY)} stroke={GOLD} strokeWidth={2.5} strokeDasharray="9 6"/>
   {scene.lineWord&&<text x={M+6} y={Y(scene.lineY)-6} fontSize={11} fontWeight={700} fill={GOLD}>{scene.lineWord}</text>}</g>}
  {scene?.passes?.map((a,i)=>{const x1=X(a.from[0]),y1=Y(a.from[1]),x2=X(a.to[0]),y2=Y(a.to[1]),d=Math.hypot(x2-x1,y2-y1)||1,u=(d-8)/d;
   return <line key={`p${i}`} data-pass="" x1={x1} y1={y1} x2={x1+(x2-x1)*u} y2={y1+(y2-y1)*u} stroke={PAPER} strokeWidth={2.5} markerEnd={`url(#${id}-a)`}/>;})}
  {arrows.filter(a=>Math.hypot(a.to[0]-a.from[0],a.to[1]-a.from[1])>3).map((a,i)=>{
   const x1=X(a.from[0]),y1=Y(a.from[1]),x2=X(a.to[0]),y2=Y(a.to[1]),d=Math.hypot(x2-x1,y2-y1),u=(d-r-4)/d;
   return <line key={i} x1={x1} y1={y1} x2={x1+(x2-x1)*u} y2={y1+(y2-y1)*u} stroke={PAPER} strokeWidth={2} strokeOpacity={.7} strokeDasharray="5 4" markerEnd={`url(#${id}-a)`}/>;})}
  {spots.map((s,i)=>{const on=!mark||s.pos===mark,keeper=i===0;
   const opp=s.team==='opp',fill=scene?(opp?INK:GOLD):mark?(on?GOLD:PAPER):keeper?PAPER:GOLD;
   return <g key={i} data-player={s.label} opacity={on?1:.5}>
    <circle cx={X(s.x)} cy={Y(s.y)} r={r} fill={fill} stroke={scene&&opp?PAPER:INK} strokeWidth={2}/>
    <text x={X(s.x)} y={Y(s.y)+4.5} textAnchor="middle" fontSize={s.n.length>2?9:13} fontWeight={700} fill={scene&&opp?PAPER:INK}>{s.n}</text>
    {s.n!==s.label&&arrows.length===0&&!scene&&(s.label==='GK'
     /* The keeper stands on the goal line: a label under the dot lands on the white goal box, so it sits beside the dot. */
     ?<text x={X(s.x)+r+5} y={Y(s.y)+4} textAnchor="start" fontSize={11} fontWeight={700} fill={PAPER}>{s.label}</text>
     :<text x={X(s.x)} y={Y(s.y)+r+12} textAnchor="middle" fontSize={11} fontWeight={700} fill={PAPER}>{s.label}</text>)}
   </g>;})}
  {scene?.ball&&<circle data-ball="" cx={X(scene.ball[0])} cy={Y(scene.ball[1])} r={6} fill={PAPER} stroke={INK} strokeWidth={2}/>}
 </svg>;
}
