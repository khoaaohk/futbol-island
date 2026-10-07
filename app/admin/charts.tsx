'use client';
/**
 * Hand-built charts for the admin dashboard, following the dataviz method: thin marks (2px lines, ≤24px bars with 4px
 * rounded data ends), hairline solid grid, one axis, a legend for 2+ series plus sparse end labels, a hover/focus tooltip
 * (the game's dark see-through map tip), and a table-view twin on every card. Labels go in via React text, never HTML.
 */
import {useEffect,useMemo,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import tipStyles from '@/components/IslandTravelMap.module.css';
import styles from './admin.module.css';

export const fmtInt=(n:number)=>n>=100_000?new Intl.NumberFormat('en',{notation:'compact',maximumFractionDigits:1}).format(n):new Intl.NumberFormat('en').format(Math.round(n));
export function fmtDuration(ms:number):string{
 const s=Math.round(ms/1000);if(s<60)return `${s} s`;
 const m=Math.floor(s/60),r=s%60;if(m<60)return r?`${m} min ${r} s`:`${m} min`;
 const h=Math.floor(m/60),mm=m%60;return `${h} h ${String(mm).padStart(2,'0')} min`;
}
export const fmtPct=(x:number)=>`${Math.round(x*100)}%`;

export type TipState={x:number;y:number;below?:boolean;content:ReactNode}|null;
/** The island map's tooltip (IslandTravelMap.module.css .tip), positioned inside a relative container and kept on-screen. */
export function Tip({tip,width}:{tip:TipState;width:number}){
 if(!tip)return null;
 const half=Math.min(130,width/2),clamped=Math.max(half,Math.min(width-half,tip.x));
 return <div role="tooltip" className={tipStyles.tip} data-below={tip.below||undefined} style={{left:tip.x,'--tip-top':`${tip.y}px`,'--tip-bottom':`${tip.y}px`,'--tip-shift':`${clamped-tip.x}px`} as CSSProperties}>{tip.content}</div>;
}

export function useWidth<T extends HTMLElement>(){
 const ref=useRef<T>(null);const [w,setW]=useState(0);
 useEffect(()=>{const el=ref.current;if(!el)return;setW(el.clientWidth);const ro=new ResizeObserver(([e])=>setW(Math.round(e.contentRect.width)));ro.observe(el);return()=>ro.disconnect();},[]);
 return [ref,w] as const;
}

function niceStep(raw:number){if(raw<=0)return 1;const p=10**Math.floor(Math.log10(raw)),f=raw/p;return (f<=1?1:f<=2?2:f<=2.5?2.5:f<=5?5:10)*p;}
export function niceTicks(max:number,count=4):number[]{const step=Math.max(1,niceStep(max/count));const top=Math.max(step,Math.ceil(max/step)*step);const out:number[]=[];for(let v=0;v<=top+1e-9;v+=step)out.push(Math.round(v));return out;}

export type Series={key:string;label:string;color:string};
/** Multi-series line chart, one y-axis (all three measures are counts). Crosshair snaps to the nearest x. */
export function LineChart({labels,series,values,ariaLabel}:{labels:string[];series:Series[];values:Record<string,number[]>;ariaLabel:string}){
 const [wrap,width]=useWidth<HTMLDivElement>();
 const [idx,setIdx]=useState<number|null>(null);
 const n=labels.length,H=240,top=14,bottom=28,left=44,right=width>=520?92:14;
 const plotW=Math.max(1,width-left-right),plotH=H-top-bottom;
 const max=Math.max(1,...series.flatMap(s=>values[s.key]||[]));
 const ticks=niceTicks(max),yMax=ticks[ticks.length-1];
 const x=(i:number)=>left+(n<=1?plotW/2:i*plotW/(n-1)),y=(v:number)=>top+plotH-(v/yMax)*plotH;
 const every=Math.max(1,Math.ceil(n/(width<480?4:7)));
 const pick=(clientX:number,el:Element)=>{const r=el.getBoundingClientRect();const i=Math.round(((clientX-r.left-left)/plotW)*(n-1));setIdx(Math.max(0,Math.min(n-1,i)));};
 const ends=series.map(s=>({s,v:(values[s.key]||[])[n-1]??0})).sort((a,b)=>b.v-a.v);
 // End labels only where they don't collide (≥14px apart); otherwise the legend and tooltip carry them.
 const placed:number[]=[];const endLabels=right>14?ends.filter(e=>{const yy=y(e.v);if(placed.some(p=>Math.abs(p-yy)<14))return false;placed.push(yy);return true;}):[];
 const tip:TipState=idx===null||!n?null:{x:x(idx),y:Math.max(top+8,y(Math.max(...series.map(s=>(values[s.key]||[])[idx]??0)))),content:<>
  <strong style={{display:'block',marginBottom:4}}>{labels[idx]}</strong>
  {series.map(s=><span key={s.key} style={{display:'flex',alignItems:'center',gap:6,justifyContent:'flex-start',fontWeight:400}}><i style={{width:12,height:2,background:s.color,display:'inline-block',borderRadius:1}}/><b style={{fontWeight:700}}>{fmtInt((values[s.key]||[])[idx]??0)}</b> {s.label.toLowerCase()}</span>)}
 </>};
 return <div className={styles.plot} ref={wrap}>
  {width>0&&<svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-label={ariaLabel} tabIndex={0}
   onPointerMove={e=>pick(e.clientX,e.currentTarget)} onPointerDown={e=>pick(e.clientX,e.currentTarget)} onPointerLeave={()=>setIdx(null)}
   onFocus={()=>setIdx(n-1)} onBlur={()=>setIdx(null)}
   onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();setIdx(i=>Math.max(0,(i??n-1)-1));}else if(e.key==='ArrowRight'){e.preventDefault();setIdx(i=>Math.min(n-1,(i??0)+1));}else if(e.key==='Escape')setIdx(null);}}>
   {ticks.map(t=><g key={t}><line x1={left} x2={left+plotW} y1={y(t)} y2={y(t)} stroke={t===0?'var(--a-axis)':'var(--a-grid)'} strokeWidth={1} shapeRendering="crispEdges"/><text className={styles.axisText} x={left-8} y={y(t)+4} textAnchor="end">{fmtInt(t)}</text></g>)}
   {labels.map((l,i)=>i%every===0||i===n-1?<text key={i} className={styles.axisText} x={x(i)} y={H-8} textAnchor={i===0?'start':i===n-1?'end':'middle'}>{(i===n-1||(n-1-i)>=every*0.6)?l:''}</text>:null)}
   {idx!==null&&<line x1={x(idx)} x2={x(idx)} y1={top} y2={top+plotH} stroke="var(--a-axis)" strokeWidth={1}/>}
   {series.map(s=>{const v=values[s.key]||[];return <g key={s.key}>
    <polyline fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={v.map((d,i)=>`${x(i)},${y(d)}`).join(' ')}/>
    {n>0&&<circle cx={x(n-1)} cy={y(v[n-1]??0)} r={4} fill={s.color} stroke="var(--a-surface)" strokeWidth={2}/>}
    {idx!==null&&<circle cx={x(idx)} cy={y(v[idx]??0)} r={5} fill={s.color} stroke="var(--a-surface)" strokeWidth={2}/>}
   </g>;})}
   {endLabels.map(e=><text key={e.s.key} className={styles.endLabel} x={left+plotW+10} y={y(e.v)+4}>{fmtInt(e.v)} {e.s.label.toLowerCase()}</text>)}
  </svg>}
  <Tip tip={tip} width={width}/>
 </div>;
}

export type BarRow={key:string;label:string;value:number;detail?:string};
/** Horizontal bars, one series in slot 1. Value at the bar tip; the row is the hover/focus target. */
/** `share` adds "· 12%" of the column total to the tooltip (off for averages, where a share means nothing). */
export function BarList({rows,format=fmtInt,unit,limit=10,share=true}:{rows:BarRow[];format?:(n:number)=>string;unit:string;limit?:number;share?:boolean}){
 const [wrap,width]=useWidth<HTMLDivElement>();const [tip,setTip]=useState<TipState>(null);
 const shown=rows.slice(0,limit),max=Math.max(1,...shown.map(r=>r.value)),total=rows.reduce((a,r)=>a+r.value,0);
 const show=(el:HTMLElement,r:BarRow)=>{const box=wrap.current!.getBoundingClientRect(),b=el.getBoundingClientRect();
  setTip({x:b.left-box.left+b.width/2,y:b.top-box.top,content:<><strong>{format(r.value)}</strong> {unit}{share?` · ${total?fmtPct(r.value/total):'0%'}`:''}<br/><span>{r.label}{r.detail?` · ${r.detail}`:''}</span></>});};
 return <div className={styles.plot} ref={wrap}>
  <ul className={styles.bars}>
   {shown.map(r=><li key={r.key} className={styles.bar} tabIndex={0} aria-label={`${r.label}: ${format(r.value)} ${unit}`}
    onPointerEnter={e=>show(e.currentTarget,r)} onPointerLeave={()=>setTip(null)} onFocus={e=>show(e.currentTarget,r)} onBlur={()=>setTip(null)}>
    <span className={styles.barLabel}>{r.label}</span>
    <span className={styles.barTrack}><span className={styles.barFill} style={{width:`calc((100% - 64px) * ${r.value/max})`}}/><span className={styles.barValue}>{format(r.value)}</span></span>
   </li>)}
  </ul>
  {rows.length>limit&&<p className={styles.note}>Top {limit} of {rows.length}. The table shows all.</p>}
  <Tip tip={tip} width={width}/>
 </div>;
}

/** Ordered columns (session-length buckets), one series. */
export function Columns({rows,unit}:{rows:{label:string;value:number}[];unit:string}){
 const [wrap,width]=useWidth<HTMLDivElement>();const [tip,setTip]=useState<TipState>(null);
 const max=Math.max(1,...rows.map(r=>r.value)),total=rows.reduce((a,r)=>a+r.value,0);
 const show=(el:HTMLElement,r:{label:string;value:number})=>{const box=wrap.current!.getBoundingClientRect(),b=el.getBoundingClientRect();
  setTip({x:b.left-box.left+b.width/2,y:b.top-box.top+18,content:<><strong>{fmtInt(r.value)}</strong> {unit} · {total?fmtPct(r.value/total):'0%'}<br/><span>{r.label}</span></>});};
 const style={'--n':rows.length} as CSSProperties;
 return <div className={styles.plot} ref={wrap}>
  <div className={styles.cols} style={style}>
   {rows.map(r=><div key={r.label} className={styles.col} tabIndex={0} aria-label={`${r.label}: ${fmtInt(r.value)} ${unit}`}
    onPointerEnter={e=>show(e.currentTarget,r)} onPointerLeave={()=>setTip(null)} onFocus={e=>show(e.currentTarget,r)} onBlur={()=>setTip(null)}>
    {r.value>0&&<span className={styles.colValue}>{fmtInt(r.value)}</span>}
    <span className={styles.colFill} style={{height:`calc((100% - 22px) * ${r.value/max})`}}/>
   </div>)}
  </div>
  <div className={styles.colLabels} style={style}>{rows.map(r=><span key={r.label}>{r.label}</span>)}</div>
  <Tip tip={tip} width={width}/>
 </div>;
}

export type TableSpec={columns:string[];rows:(string|number)[][]};
/** A chart card: title, subtitle, Table toggle (chip family, pink when on) and the chart or its table twin. */
export function ChartCard({title,subtitle,table,children,wide=false,empty=false,emptyText='No visits in this range yet.'}:{title:string;subtitle?:string;table:TableSpec;children:ReactNode;wide?:boolean;empty?:boolean;emptyText?:string}){
 const [asTable,setAsTable]=useState(false);
 const body=useMemo(()=>empty?<p className={styles.empty}>{emptyText}</p>:asTable?<div className={styles.tableScroll}><table className={styles.table}>
  <thead><tr>{table.columns.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead>
  <tbody>{table.rows.map((r,i)=><tr key={i}>{r.map((c,j)=>j===0?<th key={j} scope="row" style={{fontWeight:400,fontSize:14,color:'inherit'}}>{c}</th>:<td key={j}>{typeof c==='number'?fmtInt(c):c}</td>)}</tr>)}</tbody>
 </table></div>:children,[asTable,children,empty,table,emptyText]);
 return <section className={`${styles.card} ${wide?styles.wide:''}`} aria-label={title}>
  <div className={styles.cardHead}>
   <div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>
   {!empty&&<button type="button" className={styles.tableToggle} aria-pressed={asTable} onClick={()=>setAsTable(v=>!v)}>Table</button>}
  </div>
  {body}
 </section>;
}
