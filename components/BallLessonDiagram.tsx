'use client';
import {useLayoutEffect,useRef} from 'react';
import {motionPoint,pitchMap,type DiagramFrame} from '@/lib/town/ballHuntLessons';
import styles from './BallHuntLesson.module.css';

/**
 * One Ball Hunt scene step (lib/town/ballLessonScenes.ts). Static SVG; when the child plays the next step, the players
 * and the ball travel along their runs/passes for about a second (one bounded requestAnimationFrame burst) and the
 * teaching marks (open space, lanes, lines, "now!" pulse, time clock) fade or grow in once. Nothing loops afterwards;
 * a hidden page or reduced motion jumps straight to the end state (AGENTS.md mobile heat).
 */
const ease=(k:number)=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2,easeBall=(k:number)=>1-(1-k)*(1-k);
const place=(el:SVGGElement,[x,y]:[number,number])=>el.setAttribute('transform',`translate(${Math.round(x*10)/10} ${Math.round(y*10)/10})`);
const CLOCK=2*Math.PI*19;
type Box=[number,number,number,number];
const hit=(a:Box,b:Box)=>a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];
/** Zone label spot: the usual one (top of a tall zone, middle of a short one) unless a player or their name sits there. */
function zoneLabel(z:DiagramFrame['zones'][number],nodes:DiagramFrame['nodes'],flip:number):[number,number]{
 const cx=z.x+z.w/2,half=z.label.length*2.9+3,top=z.y+12,mid=z.y+z.h/2+3,bottom=z.y+z.h-5;
 const spots:[number,number][]=(z.tone==='band'||z.h>=44?[top,bottom,mid]:[mid,top,bottom]).map(y=>[cx,y]);
 if(z.w>half*2.6)spots.push([z.x+half+6,top],[z.x+z.w-half-6,top],[z.x+half+6,bottom],[z.x+z.w-half-6,bottom]);
 const taken:Box[]=nodes.flatMap(n=>{const r=n.role==='ball'?8:14,out:Box[]=[[n.x-r,n.y-r,n.x+r,n.y+r]];if(n.label){const w=n.label.length*3.3+2,y=n.y>flip?n.y-29:n.y+15;out.push([n.x-w,y,n.x+w,y+14]);}return out;});
 return spots.find(([x,y])=>!taken.some(t=>hit([x-half,y-9,x+half,y+2],t)))??spots[0];
}

export default function BallLessonDiagram({frame,step,id,title,desc}:{frame:DiagramFrame;step:number;id:string;title:string;desc:string}){
 const tokens=useRef(new Map<string,SVGGElement>()),shown=useRef(step);
 useLayoutEffect(()=>{
  const previous=shown.current;shown.current=step;
  if(step!==previous+1||!frame.motions.length||document.hidden||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  const moving=frame.motions.map(m=>({m,el:tokens.current.get(m.id)})).filter((x):x is {m:typeof x.m;el:SVGGElement}=>!!x.el);
  for(const {m,el} of moving)place(el,m.pts[0]);
  let raf=0;const start=performance.now();
  const finish=()=>{cancelAnimationFrame(raf);for(const {m,el} of moving)place(el,motionPoint(m,1));};
  const tick=(now:number)=>{const t=(now-start)/1000;let busy=false;
   for(const {m,el} of moving){const k=Math.max(0,Math.min(1,(t-m.delay)/m.dur));if(k<1)busy=true;place(el,motionPoint(m,m.id==='ball'?easeBall(k):ease(k)));}
   if(busy&&!document.hidden)raf=requestAnimationFrame(tick);else finish();};
  raf=requestAnimationFrame(tick);
  return finish;
 },[frame,step]);
 const settle={['--d' as string]:`${frame.settle}s`},half={['--d' as string]:`${frame.reset?0:frame.settle*.55}s`};
 const marker=`${id}-arrow`,markerRun=`${id}-run`,markerEnemy=`${id}-enemy`;
 // Pitch markings and label clamps follow the frame's layout (landscape, or the taller upright-phone pitch).
 const {w:W,h:H}=frame.layout,m=pitchMap(frame.layout),{X,Y}=m,P=(x:number,y:number)=>`${X(x)} ${Y(y)}`,R=Math.min(m.sx,m.sy),arc=30*m.sx;
 return <svg viewBox={`0 0 ${W} ${H}`} data-layout={W===330&&H===248?'landscape':'portrait'} role="img" aria-labelledby={`${id}-graphic-title ${id}-graphic-desc`} className={styles.field}>
  <title id={`${id}-graphic-title`}>{title}: step {step+1}</title><desc id={`${id}-graphic-desc`}>{desc} Solid arrows show the ball. Dashed arrows show runs. Gold areas are open space.</desc>
  <defs>
   <marker id={marker} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#315f4d"/></marker>
   <marker id={markerRun} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#638263"/></marker>
   <marker id={markerEnemy} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#c67664"/></marker>
  </defs>
  <g className={styles.pitchLines}>
   <rect x={m.x0} y={m.y0} width={m.x1-m.x0} height={m.y1-m.y0} rx="8"/>
   {frame.pitch==='full'&&<><path d={`M${P(14,128)}H${X(316)}`}/><circle cx={X(165)} cy={Y(128)} r={30*R}/></>}
   {frame.pitch==='attack'&&<><path d={`M${P(80,22)}V${Y(84)}H${X(250)}V${Y(22)}M${P(120,22)}V${Y(42)}H${X(210)}V${Y(22)}M${P(140,84)}A${arc} ${arc} 0 0 0 ${P(190,84)}`}/><circle cx={X(165)} cy={Y(66)} r="1.6"/><rect x={X(145)} y={m.y0-5} width={X(185)-X(145)} height="5" className={styles.goal}/></>}
   {frame.pitch==='defend'&&<><path d={`M${P(80,234)}V${Y(172)}H${X(250)}V${Y(234)}M${P(120,234)}V${Y(214)}H${X(210)}V${Y(234)}M${P(140,172)}A${arc} ${arc} 0 0 1 ${P(190,172)}`}/><circle cx={X(165)} cy={Y(190)} r="1.6"/><rect x={X(145)} y={m.y1} width={X(185)-X(145)} height="7" className={styles.goal}/></>}
   {frame.overlay==='thirds'&&<g className={styles.overlay}><path d={`M${P(14,92.7)}H${X(316)}M${P(14,163.3)}H${X(316)}`}/><text x={m.x1-6} y={Y(22)+12} textAnchor="end">Attacking third</text><text x={m.x1-6} y={Y(92.7)+12} textAnchor="end">Middle third</text><text x={m.x1-6} y={Y(163.3)+12} textAnchor="end">Defending third</text></g>}
   {frame.overlay==='lanes'&&<g className={styles.overlay}><path d={[74.4,134.8,195.2,255.6].map(x=>`M${P(x,22)}V${Y(234)}`).join('')}/></g>}
  </g>
  <g key={frame.reset?`reset-${step}`:'scene'} className={frame.reset?styles.resetScene:undefined}>
   {frame.zones.map(z=><g key={`${z.x},${z.y},${z.w},${z.h},${z.tone},${z.label}`} className={`${styles.zone} ${styles[`zone_${z.tone}`]}`} style={step&&z.tone!=='band'?half:undefined}>
    <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={z.tone==='band'?4:12}/>{z.label&&(([x,y])=><text x={x} y={y} textAnchor="middle">{z.label}</text>)(zoneLabel(z,frame.nodes,m.y1-26))}
   </g>)}
   {frame.cone&&<polygon points={frame.cone} className={`${styles.cone} ${styles.appear}`}/>}
   {frame.shadows.map(s=><polygon key={s} points={s} className={`${styles.shadow} ${styles.appear}`} style={settle}/>)}
   {frame.views.map(v=><path key={v} d={v} className={`${styles.view} ${styles.appear}`} style={settle}/>)}
   {frame.links.map(l=><polygon key={l} points={l} className={`${styles.link} ${styles.appear}`} style={settle}/>)}
   {frame.lines.map(l=>{const d='M'+l.pts.map(p=>p.join(' ')).join('L');return <path key={d+l.team+l.broken} d={d} className={`${styles.line} ${l.team?styles.row:''} ${l.broken?styles.broken:''} ${styles.appear}`} style={settle}/>;})}
   {frame.hints.map(h=><path key={h} d={h} className={styles.hint}/>)}
   <g className={styles.routes}>
    {frame.ghosts.map((a,i)=><path key={`g${i}${a.d}`} d={a.d} className={`${styles[a.kind]} ${styles.ghost}`}/>)}
    {frame.lanes.map(l=><g key={l.d+l.open} className={`${styles.lane} ${l.open?(l.danger?styles.laneDanger:styles.laneOpen):styles.laneBlocked} ${styles.appear}`} style={settle}>
     <path d={l.d}/>{l.open?<circle cx={l.mark[0]} cy={l.mark[1]} r="3.2"/>:<path className={styles.cross} d={`M${l.mark[0]-5} ${l.mark[1]-5}l10 10m0-10l-10 10`}/>}
    </g>)}
    {frame.arrows.map(a=><path key={`${step}${a.d}`} d={a.d} markerEnd={`url(#${a.kind==='pass'?marker:a.kind==='enemy'?markerEnemy:markerRun})`} className={`${styles[a.kind]} ${styles.draw}`} style={{['--d' as string]:`${a.delay}s`}}/>)}
   </g>
   {frame.nodes.map(node=>node.role==='ball'
    ?<g key="ball" ref={el=>{if(el)tokens.current.set('ball',el);else tokens.current.delete('ball');}} className={`${styles.token} ${styles.ball}`} transform={`translate(${node.x} ${node.y})`}><circle r="7"/><path d="M-2-3L3-2L4 2L0 5L-4 1Z"/></g>
    :<g key={node.id} ref={el=>{if(el)tokens.current.set(node.id,el);else tokens.current.delete(node.id);}} className={`${styles.token} ${styles[node.role]}`} data-dim={node.dim||undefined} transform={`translate(${node.x} ${node.y})`}>
     {node.reach&&<circle r="23" className={styles.reach}/>}
     {frame.clock?.id===node.id&&<g className={styles.clock} data-low={frame.clock.t<.35||undefined}><circle r="19" className={styles.clockTrack}/><circle r="19" className={styles.clockFill} style={{strokeDasharray:CLOCK,strokeDashoffset:CLOCK*(1-frame.clock.t)}}/></g>}
     <circle r="12"/>
     {node.role==='team'&&<path d="M0-11L4.5-2.5Q0-4.5-4.5-2.5Z" className={styles.facing} style={{transform:`rotate(${node.angle??0}deg)`}}/>}
     {node.label&&<text y={node.y>m.y1-26?-17:27} textAnchor="middle">{node.label}</text>}
    </g>)}
   {frame.clock&&(()=>{const c=frame.clock,x=Math.min(c.x+20,W-12-c.text.length*5.2);return <g key={`clock${c.text}${c.x},${c.y}`} className={`${styles.tag} ${styles.clockTag} ${styles.appear}`} data-low={c.t<.35||undefined} style={settle} transform={`translate(${x} ${Math.max(m.y0+6,c.y-21)})`}><rect x="-3" y="-8" width={c.text.length*5.2+12} height="14" rx="7"/><text x={c.text.length*2.6+3} y="2.5" textAnchor="middle">◷ {c.text}</text></g>;})()}
   {frame.tags.map(t=>{const w=t.text.length*5.3+12,x=Math.max(m.x0+2+w/2,Math.min(m.x1-2-w/2,t.x)),y=Math.max(m.y0+8,Math.min(m.y1-6,t.y));return <g key={`${t.text}${t.x},${t.y}`} className={`${styles.tag} ${styles.appear}`} style={settle} transform={`translate(${x} ${y})`}><rect x={-w/2} y="-8" width={w} height="14" rx="7"/><text y="2.5" textAnchor="middle">{t.text}</text></g>;})}
   {frame.pulse&&(()=>{const p=frame.pulse,w=p.text.length*6+14,beside=frame.clock&&Math.abs(frame.clock.x-p.x)<4&&Math.abs(frame.clock.y-p.y)<4,x=Math.max(m.x0+2+w/2,Math.min(m.x1-2-w/2,beside?p.x-w/2-4:p.x)),y=p.y<m.y0+22?p.y+30:p.y-26;return <g key={`pulse${step}`} className={styles.pulse} style={{['--d' as string]:`${p.delay}s`}}>
    <circle cx={p.x} cy={p.y} r="12" className={styles.pulseRing}/><g transform={`translate(${x} ${y})`}><g className={styles.pulseTag}><rect x={-w/2} y="-9" width={w} height="17" rx="8.5"/><text y="3.5" textAnchor="middle">{p.text}</text></g></g>
   </g>;})()}
  </g>
  <text className={styles.note} x={W/2} y="11" textAnchor="middle">{frame.note}</text>
 </svg>;
}
