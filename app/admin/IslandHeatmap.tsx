'use client';
/**
 * Heat map of play time over the island (Oct 8 2026). A muted top-down silhouette drawn from the same shoreline, Coral Cay,
 * causeway, sandbar, jetty and pitch data as the travel map, with each 20 m cell (lib/analytics/islandIds.ts GRID) filled from
 * a one-hue sequential ramp in five stepped bins (validated with the dataviz validator against both card surfaces), the
 * coastline drawn back on top so geography stays readable, a stepped legend, and a hover/focus tooltip with the place name
 * and the time. Arrow keys walk the busiest cells. Totals only: there is no path or order in the data to draw.
 */
import {useMemo,useRef,useState,type CSSProperties,type KeyboardEvent,type PointerEvent} from 'react';
import {CELL_COUNT,GRID,PLACE_LABEL,cellCenter,cellOf} from '@/lib/analytics/islandIds';
import {placeAt} from '@/lib/analytics/islandPlaces';
import {ISLAND_SHORE} from '@/lib/town/shoreline';
import {CAY_SHORE,CAUSEWAY_PATH,SANDBARS} from '@/lib/town/coralCay';
import {VENUES} from '@/lib/town/venues';
import {EAST_PIER,JETTY_PATH} from '@/lib/town/eastPier';
import {Tip,fmtDuration,fmtPct,useWidth,type TipState} from './charts';
import styles from './admin.module.css';

type View='all'|'main'|'cay';
const VIEWS:{id:View;label:string;box:[number,number,number,number]}[]=[
 {id:'all',label:'Whole map',box:[GRID.x0,GRID.z0,GRID.cols*GRID.size,GRID.rows*GRID.size]},
 {id:'main',label:'Main island',box:[-130,-270,520,510]},
 {id:'cay',label:'Coral Cay',box:[220,-300,540,280]},
];
const pts=(list:{x:number;z:number}[],step=1)=>list.filter((_,i)=>i%step===0).map(p=>`${Math.round(p.x*10)/10},${Math.round(p.z*10)/10}`).join(' ');
// Static silhouette strings, built once.
const SHORE=pts(ISLAND_SHORE),CAY=pts(CAY_SHORE),CAUSEWAY=pts(CAUSEWAY_PATH,3),JETTY=pts(JETTY_PATH.filter(p=>p.x>=EAST_PIER.wallX),3);
const SANDBAR_PTS=SANDBARS.map(s=>pts(s.outline));
const LABELS=[{x:85,z:-35,text:'Island Square'},{x:600,z:-240,text:'Coral Cay'},{x:343,z:28,text:'East Jetty'},{x:380,z:-145,text:'Causeway'}];
export const HEAT_BINS=5;
/** Legend edges, rounded so the scale reads at a glance ("16 min", "1.1 h"); the tooltip keeps exact times. */
export function fmtEdge(seconds:number):string{
 if(seconds<60)return `${Math.max(1,Math.round(seconds))} s`;
 if(seconds<3600)return `${Math.round(seconds/60)} min`;
 const h=seconds/3600;return `${h<10?Math.round(h*10)/10:Math.round(h)} h`;
}

/** Stepped bins on a doubling scale from the busiest cell down (play time is heavy-tailed: a linear scale shows one dot). */
export function heatEdges(max:number):number[]{return [0,max/16,max/8,max/4,max/2,max];}
export function heatBin(v:number,max:number):number{if(v<=0||max<=0)return -1;const e=heatEdges(max);for(let i=1;i<e.length-1;i++)if(v<=e[i])return i-1;return HEAT_BINS-1;}

/** The named place for a cell: its centre, or the first land point inside it when the centre is in the water. */
export function cellPlace(i:number):string{
 const c=cellCenter(i);let p=placeAt(c.x,c.z);
 for(const [dx,dz] of [[-6,-6],[6,-6],[-6,6],[6,6],[0,-8],[0,8],[-8,0],[8,0]]){if(p!=='sea')break;p=placeAt(c.x+dx,c.z+dz);}
 return PLACE_LABEL[p]||p;
}

export default function IslandHeatmap({cells}:{cells:[number,number][]}){
 const [wrap,width]=useWidth<HTMLDivElement>();
 const svg=useRef<SVGSVGElement>(null);
 const [chosen,setView]=useState<View|null>(null);
 // Phones open on the main island (the whole map is ~0.3 px per metre there); wider screens on the whole map.
 const view:View=chosen??(width>0&&width<520?'main':'all');
 const [active,setActive]=useState<number|null>(null);
 const valid=useMemo(()=>cells.filter(([i,s])=>i>=0&&i<CELL_COUNT&&s>0),[cells]);
 const byCell=useMemo(()=>new Map(valid),[valid]);
 const ranked=useMemo(()=>[...valid].sort((a,b)=>b[1]-a[1]),[valid]);
 const total=useMemo(()=>valid.reduce((n,[,s])=>n+s,0),[valid]);
 const max=ranked[0]?.[1]??0,edges=heatEdges(max);
 const box=VIEWS.find(v=>v.id===view)!.box,scale=width>0?width/box[2]:1;
 const font=12/scale;// 12 px labels whatever the zoom
 const tipFor=(i:number):TipState=>{
  const el=svg.current,host=wrap.current;if(!el||!host)return null;const m=el.getScreenCTM();if(!m)return null;
  const c=cellCenter(i),r=host.getBoundingClientRect(),pt=el.createSVGPoint();pt.x=c.x;pt.y=c.z-GRID.size/2;const s=pt.matrixTransform(m);
  const secs=byCell.get(i)||0;
  return {x:s.x-r.left,y:s.y-r.top,content:<><strong>{fmtDuration(secs*1000)}</strong> · {total?fmtPct(secs/total):'0%'} of mapped time<br/><span>{cellPlace(i)}</span></>};
 };
 const pick=(e:PointerEvent<SVGSVGElement>)=>{
  const el=e.currentTarget,m=el.getScreenCTM();if(!m)return;const pt=el.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const w=pt.matrixTransform(m.inverse());
  const i=cellOf(w.x,w.y);setActive(i>=0&&byCell.has(i)?i:null);
 };
 const key=(e:KeyboardEvent<SVGSVGElement>)=>{
  if(!ranked.length)return;const at=active===null?-1:ranked.findIndex(([i])=>i===active);
  if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();setActive(ranked[Math.min(ranked.length-1,at+1)][0]);}
  else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();setActive(ranked[Math.max(0,at-1)][0]);}
  else if(e.key==='Escape')setActive(null);
 };
 const tip=active!==null?tipFor(active):null;
 const busiest=ranked[0]?cellPlace(ranked[0][0]):'';
 return <div className={styles.heat}>
  <div className={styles.viewRow} role="group" aria-label="Map view">
   {VIEWS.map(v=><button key={v.id} type="button" className={styles.tableToggle} aria-pressed={view===v.id} onClick={()=>{setView(v.id);setActive(null);}}>{v.label}</button>)}
  </div>
  <div className={styles.plot} ref={wrap}>
   <svg ref={svg} className={styles.heatSvg} viewBox={box.join(' ')} style={{aspectRatio:`${box[2]} / ${box[3]}`}} role="img" tabIndex={0}
    aria-label={`Heat map of play time on the island. ${valid.length} squares with time; busiest: ${busiest}. Use the arrow keys to step through the busiest squares.`}
    onPointerMove={pick} onPointerDown={pick} onPointerLeave={()=>setActive(null)} onFocus={()=>{if(ranked.length)setActive(ranked[0][0]);}} onBlur={()=>setActive(null)} onKeyDown={key}>
    <rect x={box[0]} y={box[1]} width={box[2]} height={box[3]} className={styles.heatSea}/>
    <g className={styles.heatLand}>
     <polygon points={SHORE}/><polygon points={CAY}/>{SANDBAR_PTS.map((p,i)=><polygon key={i} points={p}/>)}
     <polyline points={CAUSEWAY} fill="none" strokeWidth={10} strokeLinejoin="round"/>
     <polyline points={JETTY} fill="none" strokeWidth={6} strokeLinejoin="round"/>
     <circle cx={EAST_PIER.cx} cy={EAST_PIER.cz} r={EAST_PIER.plazaEdge}/>
    </g>
    <g className={styles.heatPitch}>{VENUES.map(v=><rect key={v.id} x={v.x-v.width/2} y={v.z-v.length/2} width={v.width} height={v.length}/>)}</g>
    <g>{valid.map(([i,s])=>{const c=cellCenter(i),b=heatBin(s,max);return <rect key={i} x={c.x-GRID.size/2+.8} y={c.z-GRID.size/2+.8} width={GRID.size-1.6} height={GRID.size-1.6} rx={2}
     style={{fill:`var(--h${b})`}}/>;})}</g>
    <g className={styles.heatCoast} fill="none"><polygon points={SHORE}/><polygon points={CAY}/></g>
    {active!==null&&(()=>{const c=cellCenter(active);return <rect x={c.x-GRID.size/2} y={c.z-GRID.size/2} width={GRID.size} height={GRID.size} className={styles.heatFocus}/>;})()}
    <g className={styles.heatLabels} style={{fontSize:font}}>{LABELS.filter(l=>{const half=l.text.length*font*.32;return l.x-half>=box[0]&&l.x+half<=box[0]+box[2]&&l.z-font>=box[1]&&l.z<=box[1]+box[3];}).map(l=><text key={l.text} x={l.x} y={l.z} textAnchor="middle" strokeWidth={3/scale}>{l.text}</text>)}</g>
   </svg>
   <Tip tip={tip} width={width}/>
  </div>
  <ul className={styles.heatLegend} aria-label="Colour scale: time per 20 m square">
   {Array.from({length:HEAT_BINS},(_,b)=><li key={b}><i style={{'--key':`var(--h${b})`} as CSSProperties}/>{b===0?`up to ${fmtEdge(edges[1])}`:b===HEAT_BINS-1?`over ${fmtEdge(edges[b])}`:`${fmtEdge(edges[b])}–${fmtEdge(edges[b+1])}`}</li>)}
  </ul>
 </div>;
}
