'use client';
/**
 * The Summit Isle painting easel's UI (Oct 14 2026): the world-anchored "Paint the view" prompt and, once seated, a slim painter's
 * tray. The paper is the easel's own 3D board ("the painting portion should be on the easel, not two separate"): a finger or the
 * mouse on the board paints on it (lib/graphics/paintEasel.ts maps the screen point to the paper through the board's plane and
 * shows the paper as the board's texture). The view stays the star: the tray is one compact row at the bottom of a phone, or a small
 * palette board beside the easel on a wide screen; "Just look" hides it and pulls the camera back to the full view. No score.
 *
 * Tools: a round brush, a soft watercolour wash, a fill bucket, an eraser, and "pick a colour" (from the painting, from the view
 * under bare paper, or from the view itself: the snapshots the runtime took when you sat down); three sizes; twelve colours from the
 * scene; undo, clear (tap twice), "trace" (the view faintly on the board), Save (the last few on this device only) and your
 * paintings. Done (top right) saves unsaved work and leaves; Escape does the same.
 *
 * Heat: drawing happens only on pointer events, coalesced into one requestAnimationFrame while a finger is down (none at rest), and
 * each drawn frame tells the runtime once (`painted`): the board uploads at most once per island frame. No timers, no polling.
 */
import {useCallback,useEffect,useRef,useState,useSyncExternalStore,type CSSProperties,type PointerEvent as RPointerEvent} from 'react';
import {DoneButton} from './DoneButton';
import {easelStore,easelActions,type EaselView} from '@/lib/town/paintEaselStore';
import {PAINT_W,PAINT_H,PAINT_PAPER,PAINT_PALETTE,PAINT_TOOLS,BRUSH,BRUSH_SIZES,brushRadius,stampsAlong,floodFill,hexToRgb,rgbToHex,createUndo,
 readPaintings,writePaintings,addPainting,newPaintingId,validPaintingImage,PAINT_BUDGET,type PaintTool,type Painting} from '@/lib/town/paintEasel';
import {paintSound} from '@/lib/audio/paintSound';
import {countEaselSave} from '@/lib/analytics/summitEvents';
import styles from './PaintEasel.module.css';

/** Unsaved work survives a lost session (the island remounting) for this visit: it is waiting on the board when you sit down again. */
let draft:ImageData|null=null;
const cue=(detail:string)=>{try{document.dispatchEvent(new CustomEvent('fi2-vending-cue',{detail}));}catch{/* no document */}};
const WIDE='(min-aspect-ratio: 1/1)';

export default function PaintEasel(){
 const v=useSyncExternalStore(easelStore.subscribe,easelStore.get,easelStore.server);
 return <>
  <button type="button" className="store-enter-prompt" data-easel-open aria-label="Paint the view" hidden onClick={()=>easelActions.open()}>Paint the view</button>
  {v.seated&&v.sheet&&<Studio v={v} sheet={v.sheet}/>}
 </>;
}

/** Encodes the painting small: WebP if the browser can, else JPEG, stepping the quality down until it fits the per-picture budget. */
function encode(canvas:HTMLCanvasElement){
 for(const q of [.8,.65,.5,.38]){for(const type of ['image/webp','image/jpeg']){let url='';try{url=canvas.toDataURL(type,q);}catch{continue;}
  if(!url.startsWith('data:'+type))continue;if(validPaintingImage(url))return url;}}
 return null;
}

type Pop=null|'tools'|'colours';
function Studio({v,sheet}:{v:EaselView;sheet:HTMLCanvasElement}){
 const look=v.mode==='look';
 const [tool,setTool]=useState<PaintTool>('brush'),[size,setSize]=useState(1),[colour,setColour]=useState(PAINT_PALETTE[2].hex);
 const [wide,setWide]=useState(false),[traceOn,setTraceOn]=useState(false),[confirmClear,setConfirmClear]=useState(false),[pop,setPop]=useState<Pop>(null);
 const [saved,setSaved]=useState<Painting[]>(()=>readPaintings().items),[status,setStatus]=useState<'clean'|'dirty'|'saved'>('clean'),[canUndo,setCanUndo]=useState(false);
 const lastBrush=useRef<PaintTool>('brush'),statusRef=useRef(status);statusRef.current=status;
 const undo=useRef(createUndo<ImageData>());
 const stroke=useRef<{id:number;last:{x:number;y:number};pending:{x:number;y:number}[];carry:number;raf:number;stamp:HTMLCanvasElement|null}|null>(null);
 const ctx=useCallback(()=>sheet.getContext('2d',{willReadFrequently:true}),[sheet]);

 // ---- the island steps aside: its HUD hides (app/globals.css keys off html[data-easel]), its keys wait, the sea washes softly.
 useEffect(()=>{const el=document.documentElement;el.dataset.easel='on';paintSound.seaStart();
  return()=>{delete el.dataset.easel;delete el.dataset.easelLook;paintSound.seaStop();};},[]);
 useEffect(()=>{const el=document.documentElement;if(look)el.dataset.easelLook='on';else delete el.dataset.easelLook;setPop(null);},[look]);
 // ---- phone row or palette board: follows the screen's shape (a media-query change event, no polling).
 useEffect(()=>{const mq=window.matchMedia(WIDE),set=()=>setWide(mq.matches);set();mq.addEventListener('change',set);return()=>mq.removeEventListener('change',set);},[]);

 // ---- the paper: a fresh sheet (or the draft), and keep the draft if the studio goes away with unsaved work.
 useEffect(()=>{const g=ctx();if(!g)return;g.clearRect(0,0,PAINT_W,PAINT_H);if(draft){g.putImageData(draft,0,0);setStatus('dirty');}easelActions.painted();
  return()=>{const s=stroke.current;if(s?.raf)cancelAnimationFrame(s.raf);stroke.current=null;
   if(statusRef.current==='dirty')draft=g.getImageData(0,0,PAINT_W,PAINT_H);else draft=null;};
 },[ctx]);

 const changed=()=>{setStatus('dirty');setConfirmClear(false);};
 const snapshot=()=>{const g=ctx();if(!g)return;undo.current.push(g.getImageData(0,0,PAINT_W,PAINT_H));setCanUndo(true);};

 /** A soft round stamp in the current colour (watercolour), drawn once per stroke. */
 const softStamp=(r:number)=>{const c=document.createElement('canvas'),d=Math.ceil(r*2);c.width=c.height=d;const g=c.getContext('2d')!;const {r:R,g:G,b:B}=hexToRgb(colour);
  const grad=g.createRadialGradient(d/2,d/2,0,d/2,d/2,d/2);grad.addColorStop(0,`rgba(${R},${G},${B},1)`);grad.addColorStop(.55,`rgba(${R},${G},${B},.7)`);grad.addColorStop(1,`rgba(${R},${G},${B},0)`);
  g.fillStyle=grad;g.fillRect(0,0,d,d);return c;};
 /** Draws everything queued since the last frame (one rAF per frame, only while a finger is down), then the board uploads once. */
 const flush=()=>{const s=stroke.current,g=ctx();if(!s||!g)return;s.raf=0;if(!s.pending.length)return;
  const r=brushRadius(tool,size);
  if(tool==='water'&&s.stamp){g.globalCompositeOperation='source-over';g.globalAlpha=BRUSH.water.alpha;
   for(const p of s.pending){const st=stampsAlong(s.last,p,Math.max(1,r*BRUSH.water.spacing*2),s.carry);s.carry=st.carry;for(const q of st.points)g.drawImage(s.stamp,q.x-r,q.y-r);s.last=p;}
   g.globalAlpha=1;}
  else{g.globalCompositeOperation=tool==='eraser'?'destination-out':'source-over';g.globalAlpha=1;g.strokeStyle=colour;g.lineWidth=r*2;g.lineCap='round';g.lineJoin='round';
   g.beginPath();g.moveTo(s.last.x,s.last.y);for(const p of s.pending){g.lineTo(p.x,p.y);s.last=p;}g.stroke();g.globalCompositeOperation='source-over';}
  s.pending.length=0;easelActions.painted();};

 const pickFrom=(canvas:HTMLCanvasElement|null|undefined,x:number,y:number)=>{const g=canvas?.getContext('2d',{willReadFrequently:true});if(!canvas||!g)return false;
  const px=Math.max(0,Math.min(canvas.width-1,Math.floor(x))),py=Math.max(0,Math.min(canvas.height-1,Math.floor(y)));
  const d=g.getImageData(px,py,1,1).data;if(d[3]<16)return false;setColour(rgbToHex(d[0],d[1],d[2]));setTool(lastBrush.current);cue('select');return true;};

 // ---- one surface over the island: a finger on the board paints (the runtime maps it through the board's plane); elsewhere it
 // does nothing (no NPC chats or doors from here), except "pick a colour", which reads the view there.
 const down=(e:RPointerEvent<HTMLDivElement>)=>{if(stroke.current)return;setPop(null);setConfirmClear(false);
  const h=easelActions.hit(e.clientX,e.clientY),g=ctx();
  if(tool==='pick'){e.preventDefault();
   if(h&&h.inside){const view=v.capture?.view;// the painting's colour there, or the view's (as traced) on bare paper
    if(!pickFrom(sheet,h.x,h.y)&&view)pickFrom(view,h.x/PAINT_W*view.width,h.y/PAINT_H*view.height);return;}
   const cap=v.capture;if(!cap)return;const fx=(e.clientX-cap.rect.left)/cap.rect.width,fy=(e.clientY-cap.rect.top)/cap.rect.height;
   if(fx>=0&&fy>=0&&fx<=1&&fy<=1)pickFrom(cap.canvas,fx*cap.canvas.width,fy*cap.canvas.height);return;}
  if(!h||!h.inside||!g)return;e.preventDefault();
  if(tool==='fill'){snapshot();const img=g.getImageData(0,0,PAINT_W,PAINT_H),{r,g:G,b}=hexToRgb(colour);
   if(floodFill(img.data,PAINT_W,PAINT_H,h.x,h.y,[r,G,b,255])>0){g.putImageData(img,0,0);easelActions.painted();changed();paintSound.brush(true);}else{undo.current.pop();setCanUndo(undo.current.size>0);}
   return;}
  snapshot();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{/* fine */}
  stroke.current={id:e.pointerId,last:h,pending:[{x:h.x+.01,y:h.y}],carry:0,raf:0,stamp:tool==='water'?softStamp(brushRadius('water',size)):null};
  flush();changed();paintSound.brush(tool==='water');};
 const move=(e:RPointerEvent<HTMLDivElement>)=>{const s=stroke.current;if(!s||s.id!==e.pointerId)return;
  const list=typeof e.nativeEvent.getCoalescedEvents==='function'?e.nativeEvent.getCoalescedEvents():[];
  for(const q of list.length?list:[e.nativeEvent]){const h=easelActions.hit(q.clientX,q.clientY);if(h)s.pending.push(h);}// a stroke may run off the board's edge
  if(!s.raf)s.raf=requestAnimationFrame(flush);};
 const up=(e:RPointerEvent<HTMLDivElement>)=>{const s=stroke.current;if(!s||s.id!==e.pointerId)return;if(s.raf)cancelAnimationFrame(s.raf);flush();stroke.current=null;};

 const doUndo=()=>{const prev=undo.current.pop(),g=ctx();if(prev&&g){g.putImageData(prev,0,0);easelActions.painted();changed();cue('previous');}setCanUndo(undo.current.size>0);};
 const doClear=()=>{if(!confirmClear){setConfirmClear(true);return;}const g=ctx();if(!g)return;snapshot();g.clearRect(0,0,PAINT_W,PAINT_H);easelActions.painted();
  setConfirmClear(false);setStatus('clean');statusRef.current='clean';draft=null;cue('previous');};
 const doSave=useCallback(()=>{const out=document.createElement('canvas');out.width=PAINT_W;out.height=PAINT_H;const g=out.getContext('2d');if(!g)return false;
  g.fillStyle=PAINT_PAPER;g.fillRect(0,0,PAINT_W,PAINT_H);g.drawImage(sheet,0,0);const img=encode(out);if(!img)return false;
  const r=addPainting(readPaintings(),{id:newPaintingId(Date.now(),Math.random()),at:Date.now(),img});if(!r.added)return false;
  const stored=writePaintings(r.save);if(!stored)return false;setSaved(stored.items);setStatus('saved');statusRef.current='saved';draft=null;easelActions.saved(img);countEaselSave();cue('confirm');return true;},[sheet]);
 const loadPainting=(p:Painting)=>{const g=ctx();if(!g)return;const pic=new Image();pic.onload=()=>{snapshot();g.clearRect(0,0,PAINT_W,PAINT_H);g.drawImage(pic,0,0,PAINT_W,PAINT_H);easelActions.painted();
  setStatus('saved');statusRef.current='saved';setPop(null);cue('select');};pic.src=p.img;};
 /** Done (and Escape): unsaved work is saved, then you stand up. */
 const done=useCallback(()=>{if(statusRef.current==='dirty')doSave();easelActions.exit();},[doSave]);
 const chooseTool=(t:PaintTool)=>{setConfirmClear(false);if(t!=='pick')lastBrush.current=t;setTool(t);setPop(null);cue('select');};
 const chooseColour=(hex:string)=>{setColour(hex);if(tool==='eraser'||tool==='pick')setTool(lastBrush.current==='eraser'?'brush':lastBrush.current);setPop(null);cue('select');};
 const toggleTrace=()=>{const on=!traceOn;setTraceOn(on);easelActions.trace(on);cue('select');};

 // ---- keys: Escape saves and leaves; the island's own keys wait while you paint.
 useEffect(()=>{const key=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();
   if(k==='escape'){e.preventDefault();e.stopPropagation();done();return;}
   if(k!=='tab'&&k!=='enter'&&k!==' ')e.stopPropagation();};
  window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[done]);

 if(look)return <button type="button" className={styles.lookCatcher} data-easel-ui data-easel-look-back aria-label="Return to painting" onClick={()=>easelActions.setMode('paint')}>
  <span className={styles.lookHint}>Tap to paint again</span></button>;

 const sizeR=BRUSH_SIZES[size],current=PAINT_TOOLS.find(t=>t.id===tool)!;
 const tools=PAINT_TOOLS.map(t=><button key={t.id} type="button" className={styles.tool} data-easel-tool={t.id} aria-pressed={tool===t.id} aria-label={t.name} title={t.name} onClick={()=>chooseTool(t.id)}><ToolIcon id={t.id}/></button>);
 const swatches=<>{PAINT_PALETTE.map(c=><button key={c.id} type="button" role="radio" className={styles.swatch} data-easel-colour={c.id} aria-checked={colour===c.hex} aria-label={c.name} style={{['--swatch' as string]:c.hex}} onClick={()=>chooseColour(c.hex)}/>)}
  {!PAINT_PALETTE.some(c=>c.hex===colour)&&<span className={styles.swatch} data-easel-picked aria-label="Picked colour" role="img" style={{['--swatch' as string]:colour}}/>}</>;
 const gallery=saved.length>0&&<div className={styles.gallery} data-easel-gallery aria-label="Your paintings">
  {saved.map((p,i)=><button key={p.id} type="button" className={styles.thumb} aria-label={`Keep painting picture ${i+1}`} onClick={()=>loadPainting(p)}><img src={p.img} alt=""/></button>)}
  <span className={styles.small}>{`Your last ${PAINT_BUDGET.max} paintings stay on this device.`}</span></div>;
 const actions=<>
  <button type="button" className={styles.act} data-easel-size aria-label={`Brush size: ${['small','medium','large'][size]}`} onClick={()=>{setSize((size+1)%BRUSH_SIZES.length);cue('select');}}>
   <i className={styles.dot} style={{width:4+sizeR*1.1,height:4+sizeR*1.1,background:tool==='eraser'?'transparent':colour}}/></button>
  <button type="button" className={styles.act} data-easel-undo disabled={!canUndo} aria-label="Undo" onClick={doUndo}><Glyph d="M9 14 4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3"/></button>
  <button type="button" className={styles.act} data-easel-trace aria-pressed={traceOn} disabled={!v.capture?.view} aria-label="Trace the view" title="Trace the view" onClick={toggleTrace}><Glyph d="M3 18 9 9l4 6 3-4 5 7zM16 6a2 2 0 1 0 0 .1"/></button>
  <button type="button" className={styles.act} data-easel-clear data-confirm={confirmClear||undefined} aria-label={confirmClear?'Tap again to clear the painting':'Clear the painting'} onClick={doClear}>{confirmClear?<span className={styles.sure}>Clear?</span>:<Glyph d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>}</button>
 </>;
 const save=<button type="button" className={styles.save} data-easel-save disabled={status!=='dirty'} onClick={()=>{if(!doSave())setStatus('dirty');}}>{status==='saved'?'Saved':'Save'}</button>;
 // Wide screens: the palette board stands beside the easel's board (where the runtime says it is on screen).
 const br=v.boardRect,trayStyle:CSSProperties|undefined=wide&&br?{['--board-right' as string]:`${Math.round(br.right)}px`,['--board-bottom' as string]:`${Math.round(br.bottom)}px`}:undefined;

 return <div className={styles.studio} data-easel-ui data-easel-studio data-tool={tool}>
  <div className={styles.surface} data-easel-surface onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up}
   role="img" aria-label="The easel's board: paint on it with your finger or the mouse."/>
  <div className={styles.top}>
   <button type="button" className={styles.look} data-easel-just-look onClick={()=>easelActions.setMode('look')}>Just look</button>
   <DoneButton className={styles.done} aria-label={status==='dirty'?'Save and leave the easel':'Leave the easel'} onDone={done}/>
  </div>
  {tool==='pick'&&<p className={styles.hint} role="status">Tap the view or your painting to pick its colour.</p>}
  {v.arrived&&(wide?br&&<div className={styles.board} style={trayStyle} data-easel-tray="board" aria-label="Paints">
    <div className={styles.toolRow} role="toolbar" aria-label="Brushes">{tools}</div>
    <div className={styles.colours} role="radiogroup" aria-label="Colours">{swatches}</div>
    <div className={styles.actRow}>{actions}</div>
    {gallery}
    {save}
   </div>
   :<div className={styles.row} data-easel-tray="row" aria-label="Paints">
    {pop==='tools'&&<div className={styles.pop} data-easel-pop="tools"><div className={styles.toolRow} role="toolbar" aria-label="Brushes">{tools}</div>{gallery}</div>}
    {pop==='colours'&&<div className={styles.pop} data-easel-pop="colours"><div className={styles.colours} role="radiogroup" aria-label="Colours">{swatches}</div></div>}
    <button type="button" className={styles.tool} data-easel-tools aria-expanded={pop==='tools'} aria-label={`${current.name}: choose a brush`} onClick={()=>{setPop(pop==='tools'?null:'tools');cue('select');}}><ToolIcon id={tool}/></button>
    <button type="button" className={styles.swatch} data-easel-colours aria-expanded={pop==='colours'} aria-label="Choose a colour" style={{['--swatch' as string]:colour}} onClick={()=>{setPop(pop==='colours'?null:'colours');cue('select');}}/>
    {actions}
    {save}
   </div>)}
 </div>;
}

function Glyph({d}:{d:string}){return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function ToolIcon({id}:{id:PaintTool}){
 if(id==='brush')return <Glyph d="M14 4l6 6-8 8H6v-6zM6 18l-2 2"/>;
 if(id==='water')return <Glyph d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/>;
 if(id==='fill')return <Glyph d="M5 11 12 4l7 7-7 7zM19 15c1 1.6 1.5 2.6 1.5 3.3a1.5 1.5 0 0 1-3 0c0-.7.5-1.7 1.5-3.3z"/>;
 if(id==='eraser')return <Glyph d="M4 15l8-8 6 6-6 6H8zM13 19h7"/>;
 return <Glyph d="M14 4l6 6-2 2-6-6zM12 8l-7 7v4h4l7-7"/>;
}
