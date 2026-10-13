'use client';
import {forwardRef,useCallback,useLayoutEffect,useRef,useState,type ButtonHTMLAttributes,type CSSProperties,type KeyboardEventHandler,type ReactNode,type Ref} from 'react';
import styles from './pixeliso.module.css';
import {useHold} from './hooks';

/**
 * pixeliso · the cabinet card and its HUD (Oct 10 2026). One frame for every pixel exhibit: the penalty cabinet's bezel and
 * console windows, with the anatomy card's grammar: Fig + title on top, the screen, the hint bottom-left and the live readout
 * bottom-right; then the control deck (stats, round pips, a toggle, the big action button), and full-face covers for the story
 * intro and the score screen. Pieces are small and composable; exhibits arrange them.
 */
export const css=styles;

export type CabinetProps={
 /** Anatomy's "Fig n": the exhibit's year or number (short). */
 fig:ReactNode;title:ReactNode;
 /** One line: what to do ("Drag the ball back, let go to kick"). */
 hint?:ReactNode;
 /** Live readout (bottom-right); for per-frame text pass readoutRef and write it with useReadout().say. */
 readout?:ReactNode;readoutRef?:Ref<HTMLParagraphElement>;
 /** The stage (PixelStage) goes here. */
 children:ReactNode;
 /** Things on the screen over the stage (Banner, labels). */
 overlay?:ReactNode;
 /** The control deck under the screen. */
 dock?:ReactNode;
 /** Covers the whole face (StoryIntro, ScoreScreen). */
 cover?:ReactNode;
 className?:string;style?:CSSProperties;
 onKeyDown?:KeyboardEventHandler<HTMLElement>;
}&Record<`data-${string}`,string|number|boolean|undefined>;

export const Cabinet=forwardRef<HTMLElement,CabinetProps>(function Cabinet({fig,title,hint,readout,readoutRef,children,overlay,dock,cover,className,style,onKeyDown,...data},ref){
 const own=useRef<HTMLElement|null>(null);
 const setRef=useCallback((el:HTMLElement|null)=>{own.current=el;if(typeof ref==='function')ref(el);else if(ref)ref.current=el;},[ref]);
 // Oct 12 2026 polish: a cover (score screen, a rule card) that opens while the page is scrolled can start under the room's
 // fixed Back button or below the fold. When one opens, bring the cabinet's top into view (its scroll-margin clears Back).
 // Only when it is out of place, so the intro on a fresh page never moves anything.
 const covered=!!cover,first=useRef(true);
 useLayoutEffect(()=>{if(first.current){first.current=false;return;}const el=own.current;if(!covered||!el)return;
  const top=el.getBoundingClientRect().top,vh=window.innerHeight||800;
  if(top<72||top>vh*.45){const still=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;el.scrollIntoView({block:'start',behavior:still?'auto':'smooth'});}},[covered]);
 return <section ref={setRef} className={`${styles.cab} ${className??''}`} style={style} data-pixel-cabinet onKeyDown={onKeyDown} {...data}>
  <div className={styles.body}>
   <header className={styles.top}><span className={styles.fig}>{fig}</span><h2 className={styles.title}>{title}</h2></header>
   <div className={styles.screen} data-pixel-screen>
    {children}
    <span className={styles.scan} aria-hidden="true"/>
    {overlay&&<div className={styles.overlay}>{overlay}</div>}
   </div>
   <footer className={styles.foot}>
    {hint?<p className={styles.hint}><span className={styles.hintDot} aria-hidden="true"/>{hint}</p>:<span/>}
    <p ref={readoutRef} className={styles.readout} aria-live="polite" data-pixel-readout>{readout}</p>
   </footer>
   {dock&&<div className={styles.dock} data-pixel-dock>{dock}</div>}
   {cover&&<div className={styles.cover} data-pixel-cover>{cover}</div>}
  </div>
 </section>;
});

/** Live numbers with a bar each (penalty's On target / Keeper / Goal). tone = a CSS colour var or hex. */
export function Stats({items,label}:{label?:string;items:readonly {k:string;label:ReactNode;value:ReactNode;frac?:number;tone?:string}[]}){
 return <dl className={styles.stats} style={{'--n':items.length} as CSSProperties} aria-label={label}>{items.map(s=>
  <div key={s.k} className={styles.stat} data-k={s.k} style={{'--tone':s.tone,'--f':s.frac==null?0:Math.max(0,Math.min(1,s.frac))} as CSSProperties}>
   <dt>{s.label}</dt><dd>{s.value}</dd>{s.frac!=null&&<i aria-hidden="true"/>}</div>)}</dl>;
}

/** Round pips: one square per attempt; result 'goal'|'good' green, 'saved'|'ok' cyan, anything else red, undefined = to play. */
export function Pips({results,total,label}:{results:readonly (string|undefined)[];total:number;label?:string}){
 return <ol className={styles.pips} aria-label={label??`${results.filter(Boolean).length} of ${total} done`}>{Array.from({length:total},(_,i)=><li key={i} data-result={results[i]}/>)}</ol>;
}

/** A segmented switch (penalty's era / power control). */
export function Toggle<T extends string>({options,value,onChange,label,disabled}:{options:readonly {v:T;label:ReactNode;aria?:string}[];value:T;onChange:(v:T)=>void;label:string;disabled?:boolean}){
 const i=Math.max(0,options.findIndex(o=>o.v===value));
 return <div className={styles.toggle} role="group" aria-label={label} style={{'--n':options.length,'--i':i} as CSSProperties}>
  <span className={styles.thumb} aria-hidden="true"/>
  {options.map(o=><button key={o.v} type="button" aria-pressed={o.v===value} aria-label={o.aria} disabled={disabled} onClick={()=>onChange(o.v)}>{o.label}</button>)}
 </div>;
}

/**
 * The big yellow arcade button. With onRelease it is hold-to-charge (useHold: tap < 170 ms, else the 12-segment gauge fills
 * over 1.15 s; reduced motion = tap only); without it, a plain button (onClick).
 */
export function ActionButton({label,onRelease,onCharge,disabled,onClick,...rest}:{label:ReactNode;onRelease?:(charge:number,tap:boolean)=>void;onCharge?:(c:number)=>void;disabled?:boolean}&Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onPointerDown'|'onPointerUp'|'onPointerCancel'>){
 const [c,setC]=useState(0);
 const hold=useHold({onRelease:onRelease??(()=>{}),onCharge:v=>{setC(v);onCharge?.(v);},disabled});
 const handlers=onRelease?hold:{};
 return <button type="button" className={styles.action} data-charging={c>0||undefined} disabled={disabled} onClick={onRelease?hold.onClick:onClick} {...handlers} {...rest}>
  <span className={styles.actionLabel}>{label}</span>
  {onRelease&&<span className={styles.gauge} style={{'--c':c.toFixed(3)} as CSSProperties} aria-hidden="true">{Array.from({length:12},(_,i)=><i key={i} style={{'--k':i/12} as CSSProperties}/>)}</span>}
 </button>;
}

export function PixelButton({variant='primary',className,...p}:{variant?:'primary'|'ghost'}&ButtonHTMLAttributes<HTMLButtonElement>){
 return <button type="button" className={`${variant==='primary'?styles.primary:styles.ghost} ${className??''}`} {...p}/>;
}

/** The result banner (kind: good = green, ok = cyan, bad = red, info = gold). Put it in Cabinet's overlay. */
export function Banner({kind,big,line}:{kind:'good'|'ok'|'bad'|'info';big:ReactNode;line?:ReactNode}){
 return <div className={styles.banner} data-kind={kind} role="status"><b>{big}</b>{line&&<span>{line}</span>}</div>;
}

/** A console window (winbox): the intro, the score screen, any card inside the cabinet. */
export function Window({children,label,role}:{children:ReactNode;label?:string;role?:string}){
 return <div className={styles.window} role={role} aria-label={label}>{children}</div>;
}
export const Kicker=({children}:{children:ReactNode})=><p className={styles.kicker}>{children}</p>;

export type Beat={when:string;head:string;text:string};
/**
 * The short story intro: a title card, then the beats one by one ("Next ▸"), "Skip" any time, then the start button.
 * Use as Cabinet's cover until the game starts.
 */
export function StoryIntro({kicker,title,deck,beats,onStart,startLabel='Play ▸'}:{kicker:ReactNode;title:ReactNode;deck:ReactNode;beats:readonly Beat[];onStart:()=>void;startLabel?:ReactNode}){
 const [b,setB]=useState(0);const beat=b>0?beats[b-1]:null;
 return <Window label="Story">
  {!beat?<div key="t" className={styles.beat}><Kicker>{kicker}</Kicker><h3 className={styles.headline}>{title}</h3><p className={styles.deck}>{deck}</p></div>
   :<div key={b} className={styles.beat} aria-live="polite"><Kicker>{beat.when}</Kicker><h3 className={styles.beatHead}><span className={styles.beatIcon} aria-hidden="true">{b}</span>{beat.head}</h3><p className={styles.deck}>{beat.text}</p></div>}
  <ol className={styles.storyPips} aria-label={`Story ${b} of ${beats.length}`}>{beats.map((_,i)=><li key={i} data-on={i<b||undefined}/>)}</ol>
  <div className={styles.buttons}>
   {b<beats.length?<><PixelButton data-museum-own-cue data-pixel-next onClick={()=>setB(b+1)}>{b===0?'How it happened ▸':'Next ▸'}</PixelButton><PixelButton variant="ghost" data-pixel-skip onClick={onStart}>Skip: play</PixelButton></>
    :<PixelButton data-museum-own-cue data-pixel-start onClick={onStart}>{startLabel}</PixelButton>}
  </div>
 </Window>;
}

export type Check={q:string;options:readonly string[];right:number;why:string};
/** A one-question quick check in console style. onPick fires once (the first answer). */
export function QuickCheck({check,picked,onPick,label='Quick check'}:{check:Check;picked:number|null;onPick:(i:number,right:boolean)=>void;label?:string}){
 return <div className={styles.check} role="group" aria-label={`${label}: ${check.q}`} data-pixel-check>
  <p className={styles.checkQ}><b>{label}</b>{check.q}</p>
  <div className={styles.checkOpts}>{check.options.map((o,j)=><button key={j} type="button" className={styles.checkOpt} disabled={picked!=null}
   data-state={picked==null?undefined:j===check.right?'right':j===picked?'wrong':'off'} onClick={()=>onPick(j,j===check.right)}>{o}</button>)}</div>
  {picked!=null&&<p className={styles.checkWhy} role="status"><b>{picked===check.right?'Right!':'Not quite.'}</b> {check.why}</p>}
 </div>;
}

/** The score screen: a big score, notes, the quick check, buttons. Use as Cabinet's cover. */
export function ScoreScreen({kicker,score,of,unit,children,buttons}:{kicker:ReactNode;score:ReactNode;of?:ReactNode;unit?:ReactNode;children?:ReactNode;buttons?:ReactNode}){
 return <Window role="dialog" label="Score">
  <Kicker>{kicker}</Kicker>
  <h3 className={styles.scoreHead} data-pixel-score>{score}{of!=null&&<span>/{of}</span>} {unit&&<em>{unit}</em>}</h3>
  {children}
  {buttons&&<div className={styles.buttons}>{buttons}</div>}
 </Window>;
}
export const Note=({children}:{children:ReactNode})=><p className={styles.note}>{children}</p>;
export const Say=({children,live}:{children:ReactNode;live?:boolean})=><p className={styles.say} aria-live={live?'polite':undefined}>{children}</p>;
export const Row=({children}:{children:ReactNode})=><div className={styles.dockRow}>{children}</div>;
