'use client';
/**
 * The dashboard rebuild's charts (Nov 6 2026), hand-rolled SVG in the same system as charts.tsx (dataviz method): one y-axis,
 * hairline grid, 2px lines, columns ≤ 24px with 4px rounded data ends on the baseline, 2px surface gaps between stacked
 * segments, a crosshair / per-mark tooltip (the island map tip), keyboard arrows, a Table twin on every card (ChartCard), and
 * honest gaps: a day that was not tracked is drawn as nothing (with a dashed baseline tick), never as 0; today (partial) is
 * drawn lighter and named in the tooltip. Colours: the admin tokens --s1…--s4 (validated with the dataviz validator against
 * both card surfaces, admin.module.css) and the island heat ramp --h0…--h4 (validated ordinal) for the heat strips.
 * No animation (nothing to reduce for prefers-reduced-motion beyond the shared tooltip, which already honours it).
 */
import {useState,type CSSProperties,type ReactNode} from 'react';
import {Tip,niceTicks,useWidth,type TipState} from './charts';
import {fmtDay} from '@/lib/analytics/dashboard';
import styles from './admin.module.css';
import d from './dash.module.css';

export type ChartSeries={key:string;label:string;color:string;kind:'bar'|'line';values:(number|null)[];format?:(v:number)=>string};
const fmt=(v:number)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:v%1?1:0}).format(v);

/** A line or tick label: "Nov 3", or "Week of Nov 2" for weekly buckets. */
export type XLabel={key:string;short:string;long:string;partial?:boolean};

/** Time chart: columns (one series) and/or lines (up to three) on ONE count axis, release markers, crosshair tooltip. */
export function TrendChart({x,series,ariaLabel,markers=[],height=260}:{x:XLabel[];series:ChartSeries[];ariaLabel:string;markers?:{index:number;label:string}[];height?:number}){
 const [wrap,width]=useWidth<HTMLDivElement>();const [idx,setIdx]=useState<number|null>(null);
 const phone=width>0&&width<520,H=phone?Math.min(height,210):height,n=x.length;
 const labelRow=markers.length&&!phone?18:0,top=12+labelRow,bottom=26,left=40,right=phone?8:16,plotW=Math.max(1,width-left-right),plotH=H-top-bottom;
 const max=Math.max(1,...series.flatMap(s=>s.values.map(v=>v??0)));
 const ticks=niceTicks(max,4),yMax=ticks[ticks.length-1];
 const slot=plotW/Math.max(1,n),cx=(i:number)=>left+slot*i+slot/2,y=(v:number)=>top+plotH-(v/yMax)*plotH;
 const bars=series.filter(s=>s.kind==='bar'),lines=series.filter(s=>s.kind==='line');
 const bw=Math.max(2,Math.min(24,(slot-2)/Math.max(1,bars.length)));
 const every=Math.max(1,Math.ceil(n/(phone?4:8)));
 const pick=(clientX:number,el:Element)=>{const r=el.getBoundingClientRect();const i=Math.floor((clientX-r.left-left)/slot);setIdx(i>=0&&i<n?i:null);};
 const tip:TipState=idx===null?null:{x:cx(idx),y:Math.max(top+6,y(Math.max(0,...series.map(s=>s.values[idx]??0)))),content:<>
  <strong style={{display:'block',marginBottom:4}}>{x[idx].long}{x[idx].partial?' (so far)':''}</strong>
  {series.map(s=>{const v=s.values[idx];return <span key={s.key} className={d.tipRow}><i style={{background:s.color,height:s.kind==='line'?2:10}}/><b>{v===null||v===undefined?'not tracked':(s.format??fmt)(v)}</b> {s.label.toLowerCase()}</span>;})}
  {markers.filter(m=>m.index===idx).map(m=><span key={m.label} className={d.tipRow}>Started: {m.label}</span>)}
 </>};
 const placed:number[]=[];
 return <div className={styles.plot} ref={wrap}>
  {width>0&&<svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-label={ariaLabel} tabIndex={0}
   onPointerMove={e=>pick(e.clientX,e.currentTarget)} onPointerDown={e=>pick(e.clientX,e.currentTarget)} onPointerLeave={()=>setIdx(null)}
   onFocus={()=>setIdx(n-1)} onBlur={()=>setIdx(null)}
   onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();setIdx(i=>Math.max(0,(i??n)-1));}else if(e.key==='ArrowRight'){e.preventDefault();setIdx(i=>Math.min(n-1,(i??-1)+1));}else if(e.key==='Escape')setIdx(null);}}>
   {ticks.map(t=><g key={t}><line x1={left} x2={left+plotW} y1={y(t)} y2={y(t)} stroke={t===0?'var(--a-axis)':'var(--a-grid)'} strokeWidth={1} shapeRendering="crispEdges"/>
    <text className={styles.axisText} x={left-6} y={y(t)+4} textAnchor="end">{fmt(t)}</text></g>)}
   {idx!==null&&<rect x={left+slot*idx} y={top} width={slot} height={plotH} fill="var(--a-ring)"/>}
   {markers.map(m=>{const mx=cx(m.index),show=labelRow>0&&!placed.some(p=>Math.abs(p-mx)<110)&&mx<left+plotW-40;if(show)placed.push(mx);
    return <g key={m.label+m.index}><line x1={mx} x2={mx} y1={top} y2={top+plotH} stroke="var(--a-muted)" strokeWidth={1} strokeDasharray="3 3"/>
     {show&&<text className={d.markerText} x={mx+4} y={top-6}>{m.label}</text>}</g>;})}
   {bars.map((s,bi)=>s.values.map((v,i)=>{const x0=left+slot*i+(slot-bw*bars.length)/2+bi*bw;
    if(v===null||v===undefined)return <line key={s.key+i} x1={x0+1} x2={x0+bw-1} y1={top+plotH-1.5} y2={top+plotH-1.5} stroke="var(--a-other)" strokeWidth={2} strokeDasharray="2 2"/>;
    if(!v)return null;const h=(v/yMax)*plotH,r=Math.min(4,h,bw/2),w=bw-2;
    return <path key={s.key+i} d={`M${x0+1},${top+plotH}V${top+plotH-h+r}q0,-${r} ${r},-${r}H${x0+1+w-r}q${r},0 ${r},${r}V${top+plotH}Z`} fill={s.color} opacity={x[i].partial?0.45:1}/>;}))}
   {lines.map(s=>{const segs:string[][]=[];let cur:string[]=[];
    // A partial day (today so far) is not joined to the line, so a half-day never reads as a fall: a hollow dot instead.
    s.values.forEach((v,i)=>{if(v===null||v===undefined||x[i].partial){if(cur.length)segs.push(cur);cur=[];}else cur.push(`${cx(i)},${y(v)}`);});if(cur.length)segs.push(cur);

    return <g key={s.key}>{segs.map((p,j)=>p.length>1?<polyline key={j} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" points={p.join(' ')}/>
     :<circle key={j} cx={Number(p[0].split(',')[0])} cy={Number(p[0].split(',')[1])} r={3} fill={s.color}/>)}
     {x.map((l,i)=>l.partial&&s.values[i]!=null?<circle key={'p'+i} cx={cx(i)} cy={y(s.values[i] as number)} r={3.5} fill="var(--a-surface)" stroke={s.color} strokeWidth={2}/>:null)}
     {idx!==null&&s.values[idx]!=null&&<circle cx={cx(idx)} cy={y(s.values[idx] as number)} r={5} fill={s.color} stroke="var(--a-surface)" strokeWidth={2}/>}</g>;})}
   {x.map((l,i)=>i%every===0||i===n-1?<text key={'x'+l.key} className={styles.axisText} x={cx(i)} y={H-8} textAnchor={n>1&&i===0?'start':n>1&&i===n-1?'end':'middle'}>{(i===n-1||(n-1-i)*slot>=52)?l.short:''}</text>:null)}
  </svg>}
  <Tip tip={tip} width={width}/>
 </div>;
}

/** Stacked columns over time (a true split: the parts add up to the column). 2px surface seams between segments. */
export function StackedColumns({x,series,ariaLabel,unit,height=220}:{x:XLabel[];series:{key:string;label:string;color:string;values:(number|null)[]}[];ariaLabel:string;unit:string;height?:number}){
 const [wrap,width]=useWidth<HTMLDivElement>();const [idx,setIdx]=useState<number|null>(null);
 const phone=width>0&&width<520,H=phone?Math.min(height,200):height,n=x.length,top=12,bottom=26,left=40,right=8,plotW=Math.max(1,width-left-right),plotH=H-top-bottom;
 const totals=x.map((_,i)=>series.reduce((a,s)=>a+(s.values[i]??0),0)),ticks=niceTicks(Math.max(1,...totals),4),yMax=ticks[ticks.length-1];
 const slot=plotW/Math.max(1,n),bw=Math.max(3,Math.min(24,slot-2)),every=Math.max(1,Math.ceil(n/(phone?4:8)));
 const tip:TipState=idx===null?null:{x:left+slot*idx+slot/2,y:top+plotH-(totals[idx]/yMax)*plotH,content:<>
  <strong style={{display:'block',marginBottom:4}}>{x[idx].long}{x[idx].partial?' (so far)':''}: {fmt(Math.round(totals[idx]))} {unit}</strong>
  {[...series].reverse().map(s=><span key={s.key} className={d.tipRow}><i style={{background:s.color,height:10}}/><b>{s.values[idx]===null?'not tracked':fmt(Math.round(s.values[idx] as number))}</b> {s.label.toLowerCase()}</span>)}</>};
 return <div className={styles.plot} ref={wrap}>
  {width>0&&<svg width={width} height={H} viewBox={`0 0 ${width} ${H}`} role="img" aria-label={ariaLabel} tabIndex={0}
   onPointerMove={e=>{const b=e.currentTarget.getBoundingClientRect(),i=Math.floor((e.clientX-b.left-left)/slot);setIdx(i>=0&&i<n?i:null);}} onPointerLeave={()=>setIdx(null)}
   onFocus={()=>setIdx(n-1)} onBlur={()=>setIdx(null)}
   onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();setIdx(i=>Math.max(0,(i??n)-1));}else if(e.key==='ArrowRight'){e.preventDefault();setIdx(i=>Math.min(n-1,(i??-1)+1));}else if(e.key==='Escape')setIdx(null);}}>
   {ticks.map(t=><g key={t}><line x1={left} x2={left+plotW} y1={top+plotH-(t/yMax)*plotH} y2={top+plotH-(t/yMax)*plotH} stroke={t===0?'var(--a-axis)':'var(--a-grid)'} strokeWidth={1} shapeRendering="crispEdges"/>
    <text className={styles.axisText} x={left-6} y={top+plotH-(t/yMax)*plotH+4} textAnchor="end">{fmt(t)}</text></g>)}
   {idx!==null&&<rect x={left+slot*idx} y={top} width={slot} height={plotH} fill="var(--a-ring)"/>}
   {x.map((l,i)=>{let base=top+plotH;const x0=left+slot*i+(slot-bw)/2;const segs=series.map(s=>({s,v:s.values[i]??0})).filter(q=>q.v>0);
    return <g key={l.key} opacity={l.partial?0.45:1}>{segs.map((q,j)=>{const h=(q.v/yMax)*plotH,last=j===segs.length-1,gap=j>0?2:0,y0=base-h;base=y0;
     const hh=Math.max(0,h-gap),r=last?Math.min(4,hh,bw/2):0;
     return <path key={q.s.key} d={`M${x0},${y0+h-gap}V${y0+r}${r?`q0,-${r} ${r},-${r}H${x0+bw-r}q${r},0 ${r},${r}`:`H${x0+bw}`}V${y0+h-gap}Z`} fill={q.s.color}/>;})}</g>;})}
   {x.map((l,i)=>i%every===0||i===n-1?<text key={'x'+l.key} className={styles.axisText} x={left+slot*i+slot/2} y={H-8} textAnchor={n>1&&i===0?'start':n>1&&i===n-1?'end':'middle'}>{(i===n-1||(n-1-i)*slot>=52)?l.short:''}</text>:null)}
  </svg>}
  <Tip tip={tip} width={width}/>
 </div>;
}

/** A row of cells on the island heat ramp (five stepped bins). null = no data for that cell (dashed), shown as "—". */
export function HeatStrip({cells,ariaLabel,unit,columns}:{cells:{key:string;label:string;value:number|null;detail?:string}[];ariaLabel:string;unit:string;columns?:number}){
 const [tip,setTip]=useState<TipState>(null);const [wrap,width]=useWidth<HTMLDivElement>();
 const vals=cells.map(c=>c.value).filter((v):v is number=>v!==null),max=Math.max(0,...vals);
 const min=Math.min(...vals,max),span=max-min;
 /* Five bins over the strip's own min–max (the printed numbers carry the size; the ramp shows the shape). */
 const bin=(v:number)=>span<=0?(max>0?2:0):Math.min(4,Math.floor(((v-min)/span)*4.999));
 const show=(el:HTMLElement,c:typeof cells[number])=>{const box=wrap.current!.getBoundingClientRect(),b=el.getBoundingClientRect();
  setTip({x:b.left-box.left+b.width/2,y:b.top-box.top,content:<><strong>{c.value===null?'no data':fmt(Math.round(c.value*10)/10)}</strong> {c.value===null?'':unit}<br/><span>{c.label}{c.detail?` · ${c.detail}`:''}</span></>});};
 return <div className={styles.plot} ref={wrap}>
  <ul className={d.heat} style={{'--cols':columns??cells.length} as CSSProperties} aria-label={ariaLabel}>
   {cells.map(c=><li key={c.key} tabIndex={0} data-bin={c.value===null?undefined:bin(c.value)} data-none={c.value===null||undefined}
    style={c.value===null?undefined:{'--cell':`var(--h${bin(c.value)})`} as CSSProperties} aria-label={`${c.label}: ${c.value===null?'no data':fmt(Math.round(c.value*10)/10)+' '+unit}`}
    onPointerEnter={e=>show(e.currentTarget,c)} onPointerLeave={()=>setTip(null)} onFocus={e=>show(e.currentTarget,c)} onBlur={()=>setTip(null)}>
    <span>{c.label}</span><b>{c.value===null?'—':fmt(Math.round(c.value))}</b></li>)}
  </ul>
  <Tip tip={tip} width={width}/>
 </div>;
}

/** Funnel bars: each step scaled to the first, the share kept from the step before beside it. */
export function FunnelBars({steps,ariaLabel}:{steps:{key:string;label:string;value:number|null;unit:string;fromPrev:number|null}[];ariaLabel:string}){
 const first=steps[0]?.value??0;
 return <ol className={d.funnel} aria-label={ariaLabel}>
  {steps.map((s,i)=><li key={s.key} data-metric-step={s.key}>
   <span className={d.fLabel}>{s.label}</span>
   <span className={d.fTrack}><span className={d.fFill} style={{width:`${first&&s.value?Math.max(1,Math.min(100,s.value/first*100)):0}%`}}/></span>
   <span className={d.fValue}><b>{s.value===null?'—':fmt(s.value)}</b> {s.unit}</span>
   <span className={d.fDrop}>{i===0?'':s.fromPrev===null?'—':`${Math.round(s.fromPrev*1000)/10}% of the step before`}</span>
  </li>)}
 </ol>;
}

/** A sparkline with honest gaps (null days break the line), for tiles. */
export function GapSpark({values,label,color='var(--s1)'}:{values:(number|null)[];label:string;color?:string}){
 const vs=values.filter((v):v is number=>v!==null);if(values.length<2||vs.length<1)return <span className={d.sparkNone} aria-hidden="true"/>;
 const W=120,H=28,max=Math.max(1,...vs),x=(i:number)=>2+i*(W-4)/(values.length-1),y=(v:number)=>H-3-(v/max)*(H-6);
 const segs:string[][]=[];let cur:string[]=[];values.forEach((v,i)=>{if(v===null){if(cur.length)segs.push(cur);cur=[];}else cur.push(`${x(i)},${y(v)}`);});if(cur.length)segs.push(cur);
 return <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
  {segs.map((p,j)=>p.length>1?<polyline key={j} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" points={p.join(' ')}/>
   :<circle key={j} cx={Number(p[0].split(',')[0])} cy={Number(p[0].split(',')[1])} r={2} fill={color}/>)}
 </svg>;
}

export const dayX=(days:string[],today:string):XLabel[]=>days.map(k=>({key:k,short:fmtDay(k),long:new Date(k+'T12:00:00Z').toLocaleDateString('en-US',{timeZone:'UTC',weekday:'short',month:'short',day:'numeric'}),partial:k===today||undefined}));
export function Legend({items}:{items:{label:string;color:string;box?:boolean}[]}){
 return <ul className={styles.legend}>{items.map(i=><li key={i.label}><i className={i.box?styles.box:undefined} style={{'--key':i.color} as CSSProperties}/>{i.label}</li>)}</ul>;
}
export const Note=({children}:{children:ReactNode})=><p className={styles.note}>{children}</p>;
