'use client';
/**
 * Comic HUD kit (Nov 10 2026): the arcade's house style as small React pieces. Styles and tokens: comic.module.css; how to adopt:
 * README.md. No state, no effects, no animation loops: these are static markup with CSS press feedback only.
 */
import {forwardRef,type ButtonHTMLAttributes,type CSSProperties,type HTMLAttributes,type ReactNode} from 'react';
import styles from './comic.module.css';

/** Class names for a game root: `comicRoot` = tokens + the shared overlays (pause card, boards, high-score entry) as a comic page. */
export const comicTokens=styles.comic,comicChrome=styles.chrome,comicRoot=`${styles.comic} ${styles.chrome}`;
export const comicLettering=styles.lettering,comicNumeral=styles.numeral;

type Data={[k:`data-${string}`]:unknown};
export type ComicButtonProps=ButtonHTMLAttributes<HTMLButtonElement>&Data&{variant?:'primary'|'paper'|'ink'|'teal';size?:'small'|'normal';wide?:boolean};
/** Inked paper button with a hard shadow that collapses when pressed. UI sans 800 (never IslandBrush), at least 44 px. */
export const ComicButton=forwardRef<HTMLButtonElement,ComicButtonProps>(function ComicButton({variant='paper',size='normal',wide,className,type='button',...rest},ref){
 return <button ref={ref} type={type} className={`${styles.button}${className?` ${className}`:''}`} data-variant={variant} data-size={size} data-wide={wide||undefined} {...rest}/>;
});

/** Caption box. `tilt` in degrees (dropped under reduced motion). */
export function ComicPanel({tone='paper',tilt=0,flat,className,style,...rest}:HTMLAttributes<HTMLDivElement>&Data&{tone?:'paper'|'dots'|'sun'|'red'|'teal'|'ink';tilt?:number;flat?:boolean}){
 return <div className={`${styles.panel}${className?` ${className}`:''}`} data-tone={tone} data-flat={flat||undefined} style={{...style,'--cm-tilt':`${tilt}deg`} as CSSProperties} {...rest}/>;
}

const BURST=(()=>{const n=14,p:string[]=[];for(let i=0;i<n*2;i++){const r=i%2?38:50,a=Math.PI*i/n+.1;p.push(`${(50+Math.cos(a)*r).toFixed(1)},${(50+Math.sin(a)*r*.98).toFixed(1)}`);}return p.join(' ');})();
/** Starburst word panel: one loud word on a cut star. `color` is the star, `fill` the letters. */
export function ComicBurst({word,color,fill,size=22,tilt=-3,className,...rest}:Omit<HTMLAttributes<HTMLSpanElement>,'children'>&Data&{word:ReactNode;color?:string;fill?:string;size?:number;tilt?:number}){
 return <span className={`${styles.burst}${className?` ${className}`:''}`} style={{'--cm-burst':color,'--cm-letter-fill':fill,'--cm-letter-size':`${size}px`,'--cm-tilt':`${tilt}deg`} as CSSProperties} {...rest}>
  <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon data-shadow points={BURST}/><polygon points={BURST}/></svg><span>{word}</span></span>;
}

/** Stat chip: a hand-cut numeral over one short word. */
export function ComicStat({value,label,tone,className,...rest}:Omit<HTMLAttributes<HTMLDivElement>,'children'>&Data&{value:ReactNode;label:string;tone?:'sun'|'teal'|'dots'}){
 return <div className={`${styles.stat}${className?` ${className}`:''}`} data-tone={tone} {...rest}><b>{value}</b><span>{label}</span></div>;
}

/** Start / results card on a Ben-Day scrim. `badge` top-left (tilted stamp), `best` top-right, `title` as lettering. */
export function ComicCard({title,badge,badgeTone,best,children,label,wrapProps,...rest}:HTMLAttributes<HTMLElement>&Data&{title?:ReactNode;badge?:ReactNode;badgeTone?:'red'|'teal'|'sun';best?:ReactNode;label:string;wrapProps?:HTMLAttributes<HTMLDivElement>&Data}){
 return <div className={styles.cardWrap} {...wrapProps}><section className={styles.card} role="dialog" aria-modal="false" aria-label={label} {...rest}>
  {(badge||best)&&<div className={styles.cardTop}>{badge?<span className={styles.badge} data-tone={badgeTone}>{badge}</span>:<span/>}{best&&<span className={styles.best}>{best}</span>}</div>}
  {title&&<h2 className={`${styles.lettering} ${styles.cardTitle}`}>{title}</h2>}
  {children}
 </section></div>;
}
