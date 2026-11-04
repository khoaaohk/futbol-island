'use client';
import {forwardRef,useEffect,useRef,useState,type ButtonHTMLAttributes} from 'react';
import {Icon} from './Icon';
import styles from './DoneButton.module.css';
/** `icon` overrides the collapsed glyph: 'forward' is a right arrow (e.g. "Get my code", the mirror of Back). */
type NavigationProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> & {onNavigate:()=>void;href?:string;back?:boolean;label?:string;immediate?:boolean;icon?:'forward'};
/** Collapse the label before changing views; keep focus refs and native keyboard activation. */
export const NavigationButton=forwardRef<HTMLButtonElement,NavigationProps>(function NavigationButton({onNavigate,href,back=false,label,className='',disabled,immediate=false,icon,...props},ref){
 const [closing,setClosing]=useState(false),[departing,setDeparting]=useState(false);
 const button=useRef<HTMLButtonElement|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>>();
 const busy=useRef(false);
 useEffect(()=>{
  const keyboard=(event:KeyboardEvent)=>{if(event.key==='Tab')button.current?.setAttribute('data-keyboard-focus','true');};
  const pointer=()=>button.current?.removeAttribute('data-keyboard-focus');
  document.addEventListener('keydown',keyboard,true);document.addEventListener('pointerdown',pointer,true);
  return()=>{document.removeEventListener('keydown',keyboard,true);document.removeEventListener('pointerdown',pointer,true);};
 },[]);
 useEffect(()=>()=>clearTimeout(timer.current),[]);
 useEffect(()=>{const dialog=button.current?.closest('dialog');if(!dialog)return;const observer=new MutationObserver(()=>{if(!dialog.open){busy.current=false;setClosing(false);setDeparting(false);}});observer.observe(dialog,{attributes:true,attributeFilter:['open']});return()=>observer.disconnect();},[]);
 const navigate=()=>{
  if(busy.current||disabled)return;
  busy.current=true;
  if(immediate||window.matchMedia('(prefers-reduced-motion: reduce)').matches){onNavigate();busy.current=false;return;}
  setClosing(true);
  timer.current=setTimeout(()=>{setDeparting(true);onNavigate();},240);
 };
 // With an href (the tour page's Play) it renders a real link: it works before hydration and with JS off, opens in a new tab on
 // Cmd/Ctrl/middle click, and crawlers see /play; a plain click still folds the label into the arrow and then goes there.
 if(href)return <a href={href} className={`${className} ${styles.button}`} data-navigation={back?'back':'done'} data-closing={closing} data-departing={departing} aria-label={label??(back?'Back':'Done')} ref={node=>{button.current=node as unknown as HTMLButtonElement|null;}}
  onClick={event=>{if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();navigate();}}>
  <span className={styles.label} aria-hidden="true">{label??(back?'Back':'Done')}</span>
  <span className={styles.icon} aria-hidden="true"><Icon name={icon==='forward'?'arrow':back?'back':'check'} size={22}/></span>
 </a>;
 return <button {...props} ref={node=>{button.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} type="button" className={`${className} ${styles.button}`} data-navigation={back?'back':'done'} data-closing={closing} data-departing={departing} disabled={disabled} aria-label={label??(back?'Back':'Done')} aria-disabled={closing||disabled} onClick={navigate}>
  <span className={styles.label} aria-hidden="true">{label??(back?'Back':'Done')}</span>
  <span className={styles.icon} aria-hidden="true"><Icon name={icon==='forward'?'arrow':back?'back':'check'} size={22}/></span>
 </button>;
});
export const DoneButton=forwardRef<HTMLButtonElement,Omit<NavigationProps,'onNavigate'|'back'> & {onDone:()=>void}>(function DoneButton({onDone,...props},ref){return <NavigationButton {...props} ref={ref} onNavigate={onDone}/>;});
