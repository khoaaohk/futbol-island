'use client';
import {forwardRef,useEffect,useRef,useState,type ButtonHTMLAttributes} from 'react';
import {Icon} from './Icon';
import styles from './DoneButton.module.css';
type NavigationProps=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'onClick'> & {onNavigate:()=>void;back?:boolean;label?:string};
/** Collapse the label before changing views; keep focus refs and native keyboard activation. */
export const NavigationButton=forwardRef<HTMLButtonElement,NavigationProps>(function NavigationButton({onNavigate,back=false,label,className='',disabled,...props},ref){
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
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){onNavigate();busy.current=false;return;}
  setClosing(true);
  timer.current=setTimeout(()=>{setDeparting(true);onNavigate();},240);
 };
 return <button {...props} ref={node=>{button.current=node;if(typeof ref==='function')ref(node);else if(ref)ref.current=node;}} type="button" className={`${className} ${styles.button}`} data-navigation={back?'back':'done'} data-closing={closing} data-departing={departing} disabled={disabled} aria-label={label??(back?'Back':'Done')} aria-disabled={closing||disabled} onClick={navigate}>
  <span className={styles.label} aria-hidden="true">{label??(back?'Back':'Done')}</span>
  <span className={styles.icon} aria-hidden="true"><Icon name={back?'back':'check'} size={22}/></span>
 </button>;
});
export const DoneButton=forwardRef<HTMLButtonElement,Omit<NavigationProps,'onNavigate'|'back'> & {onDone:()=>void}>(function DoneButton({onDone,...props},ref){return <NavigationButton {...props} ref={ref} onNavigate={onDone}/>;});
