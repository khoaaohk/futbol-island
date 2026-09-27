'use client';
import {useCallback,useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';
import {createPortal} from 'react-dom';
import styles from './IslandSelect.module.css';

/** One choice in an IslandSelect. `note` is a second line (e.g. an unlock label); `dot` shows a colour. */
export type IslandSelectOption={value:string;label:string;dot?:string;disabled?:boolean;note?:string};
type Props={
 /** Visible label; the trigger's aria-label is "<label>: <chosen value>". */
 label:string;
 value:string;
 options:readonly IslandSelectOption[];
 onChange:(value:string)=>void;
 disabled?:boolean;
 /** Shown in the trigger when `value` matches no option (e.g. "Your own mix"). */
 placeholder?:string;
 className?:string;
 labelClassName?:string;
 /** Extra attributes for hooks/tests, e.g. {'data-field':'hair'}. */
 dataAttrs?:Record<string,string>;
};
const LIST_MAX=320,GAP=6,EDGE=8;

/**
 * The island's own dropdown (user, Sep 26 2026: "build our own instead of using the native, so designs all look the same").
 * ARIA: a button (aria-haspopup=listbox, aria-expanded) opens a role=listbox of role=option rows with aria-selected and
 * aria-activedescendant. Keyboard: Enter/Space/ArrowUp/ArrowDown open; in the list ArrowUp/Down, Home/End, type-ahead,
 * Enter/Space pick, Escape/Tab close; focus returns to the trigger. The list portals into the nearest <dialog> (or body)
 * with fixed positioning, so a scrolling/clipped panel never cuts it off, and opens upward when there is no room below.
 * Listeners exist only while open (no background work).
 */
export function IslandSelect({label,value,options,onChange,disabled,placeholder='Choose',className,labelClassName,dataAttrs}:Props){
 const uid=useId().replace(/:/g,'');
 const labelId=`${uid}-label`,valueId=`${uid}-value`,listId=`${uid}-list`,optId=(i:number)=>`${uid}-opt-${i}`;
 const trigger=useRef<HTMLButtonElement>(null),list=useRef<HTMLUListElement>(null);
 const [open,setOpen]=useState(false);
 const [active,setActive]=useState(-1);
 const [pos,setPos]=useState<{left:number;width:number;top?:number;bottom?:number;maxHeight:number}|null>(null);
 const [host,setHost]=useState<HTMLElement|null>(null);
 const typed=useRef({text:'',at:0});
 const selectedIndex=options.findIndex(option=>option.value===value);
 const selected=selectedIndex>=0?options[selectedIndex]:undefined;
 const enabled=(i:number)=>i>=0&&i<options.length&&!options[i].disabled;
 const step=(from:number,dir:1|-1)=>{for(let i=from+dir;i>=0&&i<options.length;i+=dir)if(enabled(i))return i;return from;};
 const first=()=>step(-1,1),last=()=>step(options.length,-1);

 const place=useCallback(()=>{const el=trigger.current;if(!el)return;const r=el.getBoundingClientRect(),vw=window.innerWidth,vh=window.innerHeight;
  const width=Math.min(Math.max(r.width,220),vw-EDGE*2),left=Math.min(Math.max(r.left,EDGE),vw-EDGE-width);
  const below=vh-r.bottom-GAP-EDGE,above=r.top-GAP-EDGE,want=Math.min(LIST_MAX,options.length*48+12);
  setPos(below>=want||below>=above?{left,width,top:r.bottom+GAP,maxHeight:Math.max(120,Math.min(LIST_MAX,below))}:{left,width,bottom:vh-r.top+GAP,maxHeight:Math.max(120,Math.min(LIST_MAX,above))});},[options.length]);

 const openList=(at?:number)=>{if(disabled)return;setHost(trigger.current?.closest('dialog')??document.body);place();setActive(at??(enabled(selectedIndex)?selectedIndex:first()));setOpen(true);};
 const close=(refocus=true)=>{setOpen(false);if(refocus)trigger.current?.focus({preventScroll:true});};
 const pick=(i:number)=>{if(!enabled(i))return;if(options[i].value!==value)onChange(options[i].value);close();};

 // Focus the list once it is in the DOM; keep the active row in view.
 useEffect(()=>{if(open)list.current?.focus({preventScroll:true});},[open]);
 useEffect(()=>{if(!open||active<0)return;document.getElementById(optId(active))?.scrollIntoView({block:'nearest'});},[open,active]);// eslint-disable-line react-hooks/exhaustive-deps
 // Outside press closes; scroll/resize re-anchors. Only while open.
 useEffect(()=>{if(!open)return;
  const down=(e:PointerEvent)=>{const t=e.target as Node;if(!trigger.current?.contains(t)&&!list.current?.contains(t))close(false);};
  const move=(e:Event)=>{if(list.current?.contains(e.target as Node))return;place();};
  document.addEventListener('pointerdown',down,true);window.addEventListener('scroll',move,true);window.addEventListener('resize',move);
  return()=>{document.removeEventListener('pointerdown',down,true);window.removeEventListener('scroll',move,true);window.removeEventListener('resize',move);};},[open,place]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{if(disabled&&open)setOpen(false);},[disabled,open]);

 const typeAhead=(key:string)=>{const now=Date.now(),t=typed.current;t.text=(now-t.at>600?'':t.text)+key.toLowerCase();t.at=now;
  const start=t.text.length===1?active+1:active;for(let n=0;n<options.length;n++){const i=(start+n+options.length)%options.length;if(enabled(i)&&options[i].label.toLowerCase().startsWith(t.text))return i;}return -1;};

 const onTriggerKey=(e:KeyboardEvent<HTMLButtonElement>)=>{
  if(e.key==='ArrowDown'||e.key==='ArrowUp'||e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();openList(e.key==='ArrowUp'&&!enabled(selectedIndex)?last():undefined);}
  else if(e.key==='Home'||e.key==='End'){e.preventDefault();openList(e.key==='Home'?first():last());}
  else if(e.key.length===1&&/\S/.test(e.key)){const i=typeAhead(e.key);if(i>=0&&options[i].value!==value)onChange(options[i].value);}
 };
 const onListKey=(e:KeyboardEvent<HTMLUListElement>)=>{
  // Keep keys inside the list: the enclosing dialog closes on Escape and the game listens for arrows.
  e.stopPropagation();
  switch(e.key){
   case 'ArrowDown':e.preventDefault();setActive(a=>step(a,1));break;
   case 'ArrowUp':e.preventDefault();setActive(a=>step(a,-1));break;
   case 'Home':e.preventDefault();setActive(first());break;
   case 'End':e.preventDefault();setActive(last());break;
   case 'Enter':case ' ':e.preventDefault();pick(active);break;
   case 'Escape':e.preventDefault();close();break;
   case 'Tab':e.preventDefault();close();break;
   default:if(e.key.length===1&&/\S/.test(e.key)){const i=typeAhead(e.key);if(i>=0)setActive(i);}
  }
 };

 const shown=selected??null;
 return <div className={`${styles.field}${className?` ${className}`:''}`} {...dataAttrs}>
  <span id={labelId} className={labelClassName??styles.label}>{label}</span>
  <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?listId:undefined} aria-label={`${label}: ${shown?.label??placeholder}`} disabled={disabled} data-open={open||undefined}
   onClick={()=>open?close():openList()} onKeyDown={onTriggerKey}>
   {shown?.dot&&<span className={styles.dot} style={{background:shown.dot}} aria-hidden="true"/>}
   <span id={valueId} className={`${styles.value}${shown?'':` ${styles.placeholder}`}`}>{shown?.label??placeholder}</span>
   <span className={styles.chevron} aria-hidden="true"/>
  </button>
  {open&&host&&pos&&createPortal(<ul ref={list} id={listId} role="listbox" tabIndex={-1} aria-labelledby={labelId} aria-activedescendant={active>=0?optId(active):undefined} className={styles.list} data-up={pos.bottom!==undefined||undefined}
   style={{left:pos.left,width:pos.width,top:pos.top,bottom:pos.bottom,maxHeight:pos.maxHeight}} onKeyDown={onListKey} onKeyUp={e=>e.stopPropagation()}
   onBlur={e=>{const next=e.relatedTarget as Node|null;if(next&&!list.current?.contains(next)&&next!==trigger.current)close(false);}}>
   {options.map((option,i)=><li key={option.value} id={optId(i)} role="option" aria-selected={i===selectedIndex} aria-disabled={option.disabled||undefined} className={styles.option} data-active={i===active||undefined}
    onPointerMove={()=>{if(enabled(i)&&active!==i)setActive(i);}} onMouseDown={e=>e.preventDefault()} onClick={()=>pick(i)}>
    {option.dot&&<span className={styles.dot} style={{background:option.dot}} aria-hidden="true"/>}
    <span className={styles.optionText}><span>{option.label}</span>{option.note&&<small>{option.note}</small>}</span>
    {i===selectedIndex&&<span className={styles.check} aria-hidden="true"/>}
   </li>)}
  </ul>,host)}
 </div>;
}
export default IslandSelect;
