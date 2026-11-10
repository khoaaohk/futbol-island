'use client';
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {PITCH,GUIDE_FORMATS,type GuideFormat} from '@/lib/site/pitch';
import {cleanLineup,DEFAULT_FORMATION,emptyLineup,encodeLineup,lineupSheet,MAX_BENCH,MAX_NOTE,readHash,sameRef,shapeLabel,spotsOf,swap,withFormation,type Lineup,type Ref,type Shape} from '@/lib/site/tools/lineup';
import {fieldItems,GRASS,INK,toSvgString} from '@/lib/site/tools/sheet';
import SheetSvg,{SheetItem} from '@/lib/site/tools/SheetSvg';
import t from './tools.module.css';
/**
 * The lineup builder (Nov 10 2026; /tools/soccer-lineup-builder and its format landings). A client component, the allowed
 * exception to "no client JavaScript on reading pages" because it is a tool the coach drives. It stays cool (AGENTS.md, phone
 * heat): one SVG, pointer and key events, no canvas loop, no WebGL, no timers, no animation, no network. A canvas is used once,
 * on "Download picture", to turn the sheet SVG into a PNG in the browser.
 *  - Move players: tap one, then tap another to swap (one thumb); or drag; or Tab to a player, Enter to pick up, arrow keys to
 *    reach another spot, Enter to swap.
 *  - Privacy: state lives in this component, in localStorage (try/catch) and, only when the coach presses "Copy link", in the
 *    URL fragment, which is never sent to a server. No analytics event carries a name or a lineup.
 * The server renders the default formation with position labels, so the page has a real diagram without JavaScript.
 */
const KEY='fi-lineup-v1';
const FORMAT_LABEL:Record<GuideFormat,string>={'7v7':'7v7','9v9':'9v9','11v11':'11v11',futsal:'Futsal'};
const refId=(r:Ref)=>`${r.k}:${r.i}`;
const parseRef=(s:string|null|undefined):Ref|null=>{const m=/^(on|bench):(\d+)$/.exec(s??'');return m?{k:m[1] as Ref['k'],i:Number(m[2])}:null;};
export default function LineupBuilder({shapes,initial,lockFormat}:{shapes:readonly Shape[];initial:string;lockFormat?:GuideFormat}){
 const first=shapes.find(s=>s.slug===initial)??shapes[0];
 const [l,setL]=useState<Lineup>(()=>emptyLineup(first));
 const [sel,setSel]=useState<Ref|null>(null);
 const [drag,setDrag]=useState<{ref:Ref;dx:number;dy:number}|null>(null);
 const [status,setStatus]=useState('');
 const [link,setLink]=useState('');
 const loaded=useRef(false),svgRef=useRef<SVGSVGElement>(null),press=useRef<{ref:Ref;x:number;y:number;moved:boolean}|null>(null);
 const shape=shapes.find(s=>s.slug===l.f)??first,spots=useMemo(()=>spotsOf(shape),[shape]);
 /* load once: a link wins, then this device's saved lineup (on a format landing only if it is that format) */
 useEffect(()=>{
  const fromHash=()=>{const h=readHash(window.location.hash,shapes);if(h){setL(h);setSel(null);}return !!h;};
  if(!fromHash()){try{const saved=cleanLineup(JSON.parse(window.localStorage.getItem(KEY)??'null'),shapes);
   if(saved&&(!lockFormat||shapes.find(s=>s.slug===saved.f)?.format===lockFormat))setL(saved);}catch{/* private mode or a broken value: start fresh */}}
  loaded.current=true;
  window.addEventListener('hashchange',fromHash);return ()=>window.removeEventListener('hashchange',fromHash);
 },[shapes,lockFormat]);
 useEffect(()=>{if(!loaded.current)return;try{window.localStorage.setItem(KEY,JSON.stringify(l));}catch{/* storage is optional */}},[l]);
 const nameOf=useCallback((r:Ref)=>r.k==='on'?(l.on[r.i]||spots[r.i]?.label||'Empty spot'):(l.bench[r.i]||'New substitute'),[l,spots]);
 const act=useCallback((r:Ref)=>{
  if(!sel){setSel(r);setStatus(`${nameOf(r)} picked. Now choose who to swap with.`);return;}
  if(sameRef(sel,r)){setSel(null);setStatus('');return;}
  setStatus(`${nameOf(sel)} and ${nameOf(r)} swapped.`);setL(x=>swap(x,sel,r));setSel(null);
 },[sel,nameOf]);
 const drop=useCallback((from:Ref,to:Ref)=>{if(sameRef(from,to))return;setStatus(`${nameOf(from)} and ${nameOf(to)} swapped.`);setL(x=>swap(x,from,to));setSel(null);},[nameOf]);
 /* pointer: a press that moves more than a few pixels is a drag; otherwise it is a tap */
 const down=(r:Ref)=>(e:React.PointerEvent)=>{if(e.button)return;press.current={ref:r,x:e.clientX,y:e.clientY,moved:false};(e.currentTarget as Element).setPointerCapture?.(e.pointerId);};
 const move=(e:React.PointerEvent)=>{const p=press.current;if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(!p.moved&&Math.hypot(dx,dy)<8)return;p.moved=true;
  const box=svgRef.current?.getBoundingClientRect(),k=p.ref.k==='on'&&box?VW/box.width:1;setDrag({ref:p.ref,dx:dx*k,dy:dy*k});};
 const up=(e:React.PointerEvent)=>{const p=press.current;press.current=null;setDrag(null);if(!p)return;
  if(!p.moved){act(p.ref);return;}
  const el=(e.currentTarget as HTMLElement|SVGElement),old=el.style.pointerEvents;el.style.pointerEvents='none';
  const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-ref]');el.style.pointerEvents=old;
  const to=parseRef(hit?.getAttribute('data-ref'));if(to)drop(p.ref,to);};
 const cancel=()=>{press.current=null;setDrag(null);};
 const focusRef=(r:Ref)=>{(document.querySelector(`[data-ref="${refId(r)}"]`) as HTMLElement|null)?.focus();};
 const key=(r:Ref)=>(e:React.KeyboardEvent)=>{
  /* a bench chip is a real button: Enter and Space reach it as a click (detail 0), handled in onClick */
  if((e.key==='Enter'||e.key===' ')&&r.k==='on'){e.preventDefault();act(r);return;}
  if(e.key==='Escape'){setSel(null);setStatus('');return;}
  const d=({ArrowUp:[0,1],ArrowDown:[0,-1],ArrowLeft:[-1,0],ArrowRight:[1,0]} as Record<string,number[]>)[e.key];if(!d)return;
  e.preventDefault();
  if(r.k==='bench'){if(d[1]>0)focusRef({k:'on',i:0});else if(d[0])focusRef({k:'bench',i:Math.max(0,Math.min(l.bench.length,r.i+d[0]))});return;}
  const me=spots[r.i];let best=-1,score=1e9;
  spots.forEach((s,i)=>{if(i===r.i)return;const ax=(s.x-me.x)*d[0]+(s.y-me.y)*d[1],off=Math.abs((s.x-me.x)*d[1])+Math.abs((s.y-me.y)*d[0]);
   if(ax<=1)return;const sc=ax+off*1.6;if(sc<score){score=sc;best=i;}});
  if(best>=0)focusRef({k:'on',i:best});else if(d[1]<0)focusRef({k:'bench',i:0});
 };
 const setFormat=(f:GuideFormat)=>{const s=shapes.find(x=>x.slug===DEFAULT_FORMATION[f]);if(s){setL(x=>withFormation(x,s));setSel(null);}};
 const setShape=(slug:string)=>{const s=shapes.find(x=>x.slug===slug);if(s){setL(x=>withFormation(x,s));setSel(null);}};
 const setOn=(i:number,v:string)=>setL(x=>({...x,on:x.on.map((n,j)=>j===i?v.slice(0,24):n)}));
 const setBench=(i:number,v:string)=>setL(x=>({...x,bench:x.bench.map((n,j)=>j===i?v.slice(0,24):n)}));
 const print=()=>{setLink('');window.print();};
 const download=()=>{
  try{const sheet=lineupSheet(l,shape,GRASS),url=URL.createObjectURL(new Blob([toSvgString(sheet,2)],{type:'image/svg+xml'})),img=new Image();
   img.onload=()=>{const c=document.createElement('canvas');c.width=sheet.w*2;c.height=sheet.h*2;c.getContext('2d')?.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    c.toBlob(b=>{if(!b){setStatus('This browser could not make the picture. Try Print instead.');return;}
     const a=document.createElement('a'),href=URL.createObjectURL(b);a.href=href;a.download=`${(l.team||'soccer-lineup').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'soccer-lineup'}.png`;
     document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(href);setStatus('Picture saved to your downloads.');},'image/png');};
   img.onerror=()=>{URL.revokeObjectURL(url);setStatus('This browser could not make the picture. Try Print instead.');};
   img.src=url;}catch{setStatus('This browser could not make the picture. Try Print instead.');}
 };
 const copy=()=>{const url=`${window.location.origin}${window.location.pathname}#l=${encodeLineup(l)}`;
  try{window.history.replaceState(null,'',url);}catch{/* the link is still shown below */}
  setLink(url);
  const done=()=>setStatus('Link copied. Anyone who opens it sees this lineup.'),manual=()=>setStatus('Copy the link below.');
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(url).then(done,manual);else manual();};
 /* the on-screen pitch */
 const VW=shape.format==='futsal'?280:340,spec=PITCH[shape.format],VH=Math.round((VW-24)*spec.l/spec.w)+24;
 const field=useMemo(()=>fieldItems(shape.format,{x:0,y:0,w:VW,h:VH},{theme:GRASS,pad:12}),[shape.format,VW,VH]);
 const R=15,format=shape.format;
 return <div className={t.tool} data-tool="lineup">
  <div className={`${t.panel} ${t.noPrint}`}>
   <div className={t.grid}>
    <label className={t.fieldLabel}>Game
     <select className={t.input} value={format} onChange={e=>setFormat(e.target.value as GuideFormat)}>{GUIDE_FORMATS.map(f=><option key={f} value={f}>{FORMAT_LABEL[f]}</option>)}</select></label>
    <label className={t.fieldLabel}>Formation
     <select className={t.input} value={shape.slug} onChange={e=>setShape(e.target.value)}>{shapes.filter(s=>s.format===format).map(s=><option key={s.slug} value={s.slug}>{shapeLabel(s)}</option>)}</select></label>
    <label className={`${t.fieldLabel} ${t.wide}`}>Team name
     <input className={t.input} value={l.team} maxLength={24} autoComplete="off" placeholder="Blue Sharks U10" onChange={e=>setL(x=>({...x,team:e.target.value}))}/></label>
   </div>
  </div>
  <div className={`${t.pitch} ${t.noPrint}`}>
   <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} role="group" aria-label={`${FORMAT_LABEL[format]} field, ${shapeLabel(shape)} formation. ${spots.length} players.`} data-diagram={format} fontFamily="Arial,Helvetica,sans-serif">
    {field.items.map((i,n)=><SheetItem key={n} i={i}/>)}
    {spots.map((s,i)=>{const r:Ref={k:'on',i},[x,y]=field.at(s.x,s.y),on=sameRef(sel,r),d=drag&&sameRef(drag.ref,r)?drag:null,name=l.on[i];
     return <g key={i} role="button" tabIndex={0} data-ref={refId(r)} data-player={s.label} aria-pressed={on} aria-label={`${s.label}: ${name||'no name yet'}${i===0?', goalkeeper':''}`}
      className={`${t.slot}${d?` ${t.dragging}`:''}`} transform={d?`translate(${d.dx} ${d.dy})`:undefined}
      onPointerDown={down(r)} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onKeyDown={key(r)}>
      <circle cx={x} cy={y} r={24} fill="transparent"/>
      <circle className={t.ring} cx={x} cy={y} r={R+5} fill="none" strokeWidth={3}/>
      <circle cx={x} cy={y} r={R} fill={i===0?GRASS.keeper:GRASS.dot} stroke={GRASS.ink} strokeWidth={2}/>
      <text x={x} y={y+4.5} textAnchor="middle" fontSize={s.n.length>2?9:13} fontWeight={700} fill={GRASS.ink}>{s.n}</text>
      <text x={i===0?x+R+6:x} y={i===0?y+4:y+R+13} textAnchor={i===0?'start':'middle'} fontSize={12} fontWeight={700} fill="#fff" stroke={GRASS.grass??undefined} strokeWidth={3} paintOrder="stroke">{(name||s.label).slice(0,12)}</text>
     </g>;})}
   </svg>
  </div>
  <div className={`${t.panel} ${t.noPrint}`}>
   <p className={t.status} role="status" aria-live="polite">{status}</p>
   <div className={t.benchRow} role="group" aria-label="Bench">
    <span className={t.pos}>Bench</span>
    {l.bench.map((b,i)=>{const r:Ref={k:'bench',i},d=drag&&sameRef(drag.ref,r)?drag:null;
     return <button key={i} type="button" className={`${t.chip}${d?` ${t.dragging}`:''}`} style={d?{transform:`translate(${d.dx}px,${d.dy}px)`}:undefined} data-ref={refId(r)} aria-pressed={sameRef(sel,r)}
      onPointerDown={down(r)} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onKeyDown={key(r)} onClick={e=>{if(e.detail===0)act(r);}}>{b||'Sub'}</button>;})}
    {l.bench.length<MAX_BENCH&&<button type="button" className={`${t.chip} ${t.chipAdd}`} data-ref={refId({k:'bench',i:l.bench.length})} aria-label={sel?.k==='on'?'Move the picked player to the bench':'Add a substitute'}
      onClick={()=>{if(sel?.k==='on')act({k:'bench',i:l.bench.length});else{setL(x=>({...x,bench:[...x.bench,'']}));setSel(null);}}}>{sel?.k==='on'?'To bench':'+ Sub'}</button>}
   </div>
   <p className={t.hint}>Tap a player, then tap another player or a substitute to swap them. You can also drag. The white dot is the goalkeeper: swap any player onto it to change keeper.</p>
   <div className={t.actions}>
    <button type="button" className={t.btn} onClick={print}>Print</button>
    <button type="button" className={t.btn} onClick={download}>Download picture</button>
    <button type="button" className={t.btn} onClick={copy}>Copy link</button>
    {sel&&!(sel.k==='on'&&sel.i===0)&&<button type="button" className={`${t.btn} ${t.btnQuiet}`} onClick={()=>act({k:'on',i:0})}>Make keeper</button>}
    <button type="button" className={`${t.btn} ${t.btnQuiet}`} onClick={()=>{setL(emptyLineup(shape));setSel(null);setLink('');setStatus('Lineup cleared.');}}>Clear</button>
   </div>
   {link&&<label className={t.fieldLabel}>Link to this lineup<input className={`${t.input} ${t.link}`} readOnly value={link} onFocus={e=>e.currentTarget.select()}/></label>}
   <p className={t.hint}>Names stay on your device. Nothing you type is sent to Futbol Island or stored on a server. A copied link holds the lineup inside the link itself, so use first names or nicknames.</p>
  </div>
  <details className={`${t.panel} ${t.noPrint}`} open>
   <summary className={t.summary}>Player names and match note</summary>
   <div className={t.names}>
    {spots.map((s,i)=><label key={i} className={t.row}><span className={t.pos}>{s.label}</span>
     <input className={t.input} value={l.on[i]??''} maxLength={24} autoComplete="off" enterKeyHint="next" aria-label={`Name of the ${s.label}`} placeholder="First name" onChange={e=>setOn(i,e.target.value)}/></label>)}
    {l.bench.map((b,i)=><div key={`b${i}`} className={`${t.row} ${t.rowBench}`}><span className={t.pos}>Sub {i+1}</span>
     <input className={t.input} value={b} maxLength={24} autoComplete="off" enterKeyHint="next" aria-label={`Name of substitute ${i+1}`} placeholder="First name" onChange={e=>setBench(i,e.target.value)}/>
     <button type="button" className={`${t.btn} ${t.btnQuiet} ${t.icon}`} aria-label={`Remove substitute ${i+1}`} onClick={()=>setL(x=>({...x,bench:x.bench.filter((_,j)=>j!==i)}))}>×</button></div>)}
    {l.bench.length<MAX_BENCH&&<button type="button" className={`${t.btn} ${t.btnQuiet}`} onClick={()=>setL(x=>({...x,bench:[...x.bench,'']}))}>Add a substitute</button>}
    <label className={t.fieldLabel}>Match note
     <textarea className={t.input} value={l.note} maxLength={MAX_NOTE} placeholder="Kick-off 9:30, field 4. White shirts." onChange={e=>setL(x=>({...x,note:e.target.value}))}/></label>
   </div>
  </details>
  <div className={t.printOnly} aria-hidden="true"><SheetSvg id="lineup-print" sheet={lineupSheet(l,shape,INK)}/></div>
 </div>;
}
