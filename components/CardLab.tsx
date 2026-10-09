'use client';
/**
 * Card lab (dev only, /card-lab; lib/dev/labRoutes.ts): compares the current CSS foil with the WebGL holo foil on the real large
 * PlayerCard, previews the cheap CSS foil on binder MiniCards, and shows the holo's frame and timing readout.
 * Query: ?player=<name>&tier=auto|regular|elite|icon&pattern=auto|net|shield|lanes|burst&intensity=0..1.5&view=both|current|holo&wobble=1
 * Scripts: window.__cardLab.pose(rx, ry) / release() / glint() / stats() / restCheck().
 * Heat: one WebGL2 context (the holo card only). The lab's own loop is the auto-wobble, and only while that switch is on.
 */
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import type React from 'react';
import {useRouter} from 'next/navigation';
import PlayerCard,{type CardTiltHandle} from './PlayerCard';
import cardStyles from './PlayerCard.module.css';
import MiniCard from './MiniCard';
import {BackButton} from './BackButton';
import type {HoloStats} from './HoloFoil';
import styles from './CardLab.module.css';
import {CARD_ENTRIES,ROLE_LABELS,ROLE_ORDER,cardDisplayName} from '@/lib/town/cardCollection';
import {cardTier} from '@/lib/town/cardTiers';
import profilesJson from '@/lib/town/playerProfiles.json';
import {HOLO_PATTERNS,HOLO_TIERS,PATTERN_INFO,PATTERN_INTENSITY,TIER_LOOK,patternForRole,type HoloPattern,type HoloTier} from '@/lib/graphics/holoFoil/patterns';

const PROFILES=profilesJson as Record<string,{blurb?:string;strengths?:string[]}>;
/** One card per position, plus an Icon and a Regular. */
export const LAB_PRESETS:{name:string;label:string}[]=[
 {name:'Alisson',label:'Goalkeeper'},{name:'Virgil van Dijk',label:'Defender'},{name:'Pedri',label:'Midfielder'},
 {name:'Julián Álvarez',label:'Forward'},{name:'Lionel Messi',label:'Icon'},{name:'William Saliba',label:'Regular'},
];
/** The binder preview: three cards per position, mixed tiers. */
const BINDER=['Alisson','Gianluigi Buffon','Diogo Costa','Virgil van Dijk','Paolo Maldini','William Saliba','Pedri','Zinedine Zidane','Vitinha','Kylian Mbappé','Julián Álvarez','Alexander Isak'];
type View='both'|'current'|'holo';
const byName=new Map(CARD_ENTRIES.map(e=>[e.name,e]));

export default function CardLab(){
 const router=useRouter();
 const [name,setName]=useState(LAB_PRESETS[0].name),[tierPick,setTierPick]=useState<HoloTier|'auto'>('auto'),[patternPick,setPatternPick]=useState<HoloPattern|'auto'>('auto');
 const [intensityPick,setIntensity]=useState<number|null>(null),[view,setView]=useState<View>('both'),[wobble,setWobble]=useState(false),[glintKey,setGlintKey]=useState(0);
 const [stats,setStats]=useState<HoloStats|null>(null),[rest,setRest]=useState<{raf:number;frames:number;ms:number}|null>(null);
 // Deep links for screenshots.
 useEffect(()=>{const q=new URLSearchParams(location.search),p=q.get('player'),t=q.get('tier'),pt=q.get('pattern'),i=Number(q.get('intensity')),v=q.get('view');
  if(p&&byName.has(p))setName(p);if(t&&(HOLO_TIERS as readonly string[]).includes(t))setTierPick(t as HoloTier);if(pt&&(HOLO_PATTERNS as readonly string[]).includes(pt))setPatternPick(pt as HoloPattern);
  if(q.get('intensity')&&Number.isFinite(i)&&i>0)setIntensity(Math.min(1.5,i));if(v==='current'||v==='holo'||v==='both')setView(v);if(q.get('wobble')==='1')setWobble(true);},[]);
 const entry=byName.get(name)??CARD_ENTRIES[0];
 const tier:HoloTier=tierPick==='auto'?cardTier(name):tierPick,pattern:HoloPattern=patternPick==='auto'?patternForRole(entry.role):patternPick;
 // The current foil is picked by era (Legend: rainbow overlay; Star: gold glare): an Icon override shows the Legend card.
 const era=tierPick==='auto'?entry.era:tierPick==='icon'?'allTime':'current';
 // The slider starts at the game's setting for the pattern (PATTERN_INTENSITY: shield 0.70, the rest 1.00).
 const intensity=intensityPick??PATTERN_INTENSITY[pattern];
 const holo=useMemo(()=>({pattern,tier,intensity}),[pattern,tier,intensity]);
 const profile=PROFILES[name];
 const cardProps={name,role:entry.roleLabel.replace('Futsal ',''),era,team:'gold' as const,format:entry.futsal?'futsal':'11v11',firstName:cardDisplayName(name).split(' ')[0],
  blurb:profile?.blurb??`${cardDisplayName(name)} is one of the players to learn from as a ${entry.roleLabel.toLowerCase()}.`,strengths:profile?.strengths??[],compact:true};
 const currentTilt=useRef<CardTiltHandle|null>(null),holoTilt=useRef<CardTiltHandle|null>(null);
 const pose=useCallback((rx:number,ry:number)=>{currentTilt.current?.pose(rx,ry);holoTilt.current?.pose(rx,ry);},[]);
 const release=useCallback(()=>{currentTilt.current?.release();holoTilt.current?.release();},[]);
 // Auto-wobble (screenshots): the lab's only loop, and only while the switch is on.
 useEffect(()=>{if(!wobble)return;let raf=0;const t0=performance.now();
  const tick=(now:number)=>{const t=(now-t0)/1000;pose(11*Math.sin(t*1.7),16*Math.sin(t*1.1+.6));raf=requestAnimationFrame(tick);};
  raf=requestAnimationFrame(tick);return ()=>{cancelAnimationFrame(raf);release();};},[wobble,pose,release]);
 // Rest check: counts every requestAnimationFrame request on the page (the lab wraps it) and the holo's frames over 2 s.
 const rafCalls=useRef(0),statsNow=useRef<HoloStats|null>(null),restTimer=useRef<ReturnType<typeof setTimeout>>();
 useEffect(()=>{const orig=window.requestAnimationFrame;window.requestAnimationFrame=cb=>{rafCalls.current++;return orig.call(window,cb);};
  return ()=>{window.requestAnimationFrame=orig;clearTimeout(restTimer.current);};},[]);
 const restCheck=useCallback((ms=2000)=>new Promise<{raf:number;frames:number;ms:number}>(resolve=>{clearTimeout(restTimer.current);
  const r0=rafCalls.current,f0=statsNow.current?.frames??0;setRest(null);
  restTimer.current=setTimeout(()=>{const out={raf:rafCalls.current-r0,frames:(statsNow.current?.frames??0)-f0,ms};setRest(out);resolve(out);},ms);}),[]);
 const onStats=useCallback((s:HoloStats)=>{statsNow.current=s;setStats(s);
  // An interaction just ended (or the glint): confirm the page goes quiet, once, 1.5 s later.
  if(!s.looping&&s.currentFrames===0&&s.frames>0&&!wobbleRef.current)void restCheck(1500);},[restCheck]);
 const wobbleRef=useRef(wobble);wobbleRef.current=wobble;
 useEffect(()=>{(window as unknown as {__cardLab:unknown}).__cardLab={pose,release,glint:()=>setGlintKey(k=>k+1),stats:()=>statsNow.current,restCheck};
  return ()=>{delete (window as unknown as {__cardLab?:unknown}).__cardLab;};},[pose,release,restCheck]);

 const info=PATTERN_INFO[pattern];
 const groups=useMemo(()=>ROLE_ORDER.map(role=>({role,label:ROLE_LABELS[role]??role,names:CARD_ENTRIES.filter(e=>e.role===role).map(e=>e.name)})),[]);
 // PlayerCard pins its Flip/Play bar to the bottom of the screen; in the lab each card keeps its bar under it.
 const pinFix=`.${styles.slot} .${cardStyles.controls}{position:relative!important;left:auto!important;bottom:auto!important;transform:none!important;margin-top:12px}`;
 const fmt=(n:number|null|undefined,d=2)=>n==null?'–':n.toFixed(d);
 return <main className={styles.lab}>
  <style>{pinFix}</style>
  <header className={styles.header}>
   <BackButton onBack={()=>router.push('/')}/>
   <div><h1>Card lab: holo foil</h1><p>Each position has its own foil, so the shine teaches the job. Dev only.</p></div>
  </header>
  <div className={styles.layout}>
   <section className={styles.panel} aria-label="Controls">
    <div className={styles.presets} role="group" aria-label="Players">
     {LAB_PRESETS.map(p=><button key={p.name} type="button" aria-pressed={name===p.name} onClick={()=>setName(p.name)}><b>{p.label}</b><span>{cardDisplayName(p.name)}</span></button>)}
    </div>
    <label className={styles.field}><span>Player</span>
     <select value={name} onChange={e=>setName(e.target.value)}>{groups.map(g=><optgroup key={g.role} label={g.label}>{g.names.map(n=><option key={n} value={n}>{cardDisplayName(n)}</option>)}</optgroup>)}</select></label>
    <label className={styles.field}><span>Tier</span>
     <select value={tierPick} onChange={e=>setTierPick(e.target.value as HoloTier|'auto')}><option value="auto">Auto ({TIER_LOOK[cardTier(name)].label})</option>{HOLO_TIERS.map(t=><option key={t} value={t}>{TIER_LOOK[t].label}</option>)}</select></label>
    <label className={styles.field}><span>Pattern</span>
     <select value={patternPick} onChange={e=>setPatternPick(e.target.value as HoloPattern|'auto')}><option value="auto">Auto ({PATTERN_INFO[patternForRole(entry.role)].name})</option>{HOLO_PATTERNS.map(p=><option key={p} value={p}>{PATTERN_INFO[p].chip}</option>)}</select></label>
    <label className={styles.field}><span>Intensity {intensity.toFixed(2)}{intensityPick==null?' (game setting)':''}</span><input type="range" min={0} max={1.5} step={.05} value={intensity} onChange={e=>setIntensity(Number(e.target.value))}/></label>
    <div className={styles.segment} role="group" aria-label="Show">
     {(['both','current','holo'] as View[]).map(v=><button key={v} type="button" aria-pressed={view===v} onClick={()=>setView(v)}>{v==='both'?'Side by side':v==='current'?'Current foil':'New holo'}</button>)}
    </div>
    <div className={styles.row}>
     <button type="button" role="switch" aria-checked={wobble} className={styles.switch} onClick={()=>setWobble(w=>!w)}><i aria-hidden="true"/>Auto-wobble</button>
     <button type="button" className={styles.pill} onClick={()=>setGlintKey(k=>k+1)}>Replay glint</button>
     <button type="button" className={styles.pill} onClick={()=>void restCheck()} disabled={wobble}>Check rest</button>
    </div>
    <dl className={styles.readout} aria-label="Holo performance" data-holo-mode={stats?.mode??''} data-holo-frames={stats?.frames??0} data-holo-looping={stats?.looping?'1':'0'} data-rest-raf={rest?.raf??''}>
     <div><dt>Foil</dt><dd>{stats?(stats.mode==='webgl2'?'WebGL2':`CSS fallback (${stats.reason})`):'–'}</dd></div>
     <div><dt>Canvas</dt><dd>{stats?.mode==='webgl2'?`${stats.canvasPx[0]}×${stats.canvasPx[1]} px @ DPR ${stats.dpr}`:'–'}</dd></div>
     <div><dt>Frames / interaction</dt><dd>{stats?`${stats.lastInteractionFrames} last · ${stats.currentFrames} now · ${stats.frames} total (${stats.interactions})`:'–'}</dd></div>
     <div><dt>Arrival glint</dt><dd>{stats?`${stats.lastGlintFrames} frames, then stops`:'–'}</dd></div>
     <div><dt>ms / frame</dt><dd>{stats?(stats.gpuMs!=null?`${fmt(stats.gpuMs,3)} GPU (timer query) · ${fmt(stats.cpuMs,3)} CPU`:`${fmt(stats.cpuMs,3)} CPU submit${stats.gpuTimer?' · GPU pending':' · no GPU timer'}`):'–'}</dd></div>
     <div><dt>Loop</dt><dd>{stats?.looping?'Running (arrival glint)':wobble?'Driven by auto-wobble':stats&&stats.currentFrames>0?'Driven by the tilt spring':'Idle, nothing scheduled'}</dd></div>
     <div><dt>At rest</dt><dd>{rest?`${rest.raf} rAF requests · ${rest.frames} holo frames in ${rest.ms/1000} s${rest.raf===0&&rest.frames===0?' ✓ idle':''}`:'checking after each interaction…'}</dd></div>
    </dl>
   </section>
   <section className={styles.stage} data-view={view} aria-label="Cards">
    {view!=='holo'&&<figure className={styles.slot}>
     <figcaption><b>Current foil</b><span>{era==='allTime'?'Legend: rainbow overlay':'Star: gold glare'}</span></figcaption>
     <PlayerCard {...cardProps} tiltRef={currentTilt}/>
    </figure>}
    {view!=='current'&&<figure className={styles.slot}>
     <figcaption><b>New holo</b><span className={styles.chip} data-pattern={pattern}>{info.chip} · {TIER_LOOK[tier].label}</span></figcaption>
     <PlayerCard key={glintKey} {...cardProps} holo={holo} onHoloStats={onStats} tiltRef={holoTilt}/>
    </figure>}
   </section>
  </div>
  <section className={styles.binder} aria-label="Binder preview">
   <h2>Binder preview <small>CSS only: a static pattern per position; colours shift on hover or press</small></h2>
   <ul>{BINDER.map(n=>{const e=byName.get(n);if(!e)return null;const p=patternForRole(e.role),t=cardTier(n);
    return <li key={n}><button type="button" className={styles.mini} onClick={()=>setName(n)} aria-label={`${cardDisplayName(n)}: ${PATTERN_INFO[p].chip}, ${TIER_LOOK[t].label}`}>
     <MiniCard name={n} number={e.number} era={e.era} got foil={{pattern:p,tier:t}}/>
     <span>{PATTERN_INFO[p].name} · {TIER_LOOK[t].label}</span></button></li>;})}</ul>
  </section>
 </main>;
}
