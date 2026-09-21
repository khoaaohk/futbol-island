'use client';
import styles from './CharacterToggle.module.css';

export function CharacterToggle<T extends string>({value,onChange,options,label}:{value:T;onChange:(value:T)=>void;options:readonly [{value:T;label:string},{value:T;label:string}];label:string}){
 return <div className={styles.toggle} data-second={value===options[1].value} role="group" aria-label={label}>
  {options.map(option=><button key={option.value} type="button" aria-pressed={value===option.value} onClick={()=>onChange(option.value)}>{option.label}</button>)}
 </div>;
}
