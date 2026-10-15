'use client';
/**
 * Stagger. Adapted from React Bits "Animated List" by David Haz (https://reactbits.dev/components/animated-list,
 * https://github.com/DavidHDev/react-bits). MIT + Commons Clause, Copyright (c) 2026 David Haz: see
 * components/bits/LICENSE-react-bits.md and docs/third-party.md.
 *
 * Futbol Island adaptation (Oct 10 2026): no motion/react, no scroll-driven gradients, no selection state. The container's
 * direct children rise in once, one after another (a CSS animation with a per-child delay), when the list mounts; re-renders
 * do not replay it. Only the first `max` children are delayed, so a long list never waits. Reduced motion: no animation.
 * Renders the element you ask for (`as`), so <ul>/<li> semantics and the host's grid stay as they were.
 */
import {Children,cloneElement,isValidElement,type CSSProperties,type ElementType,type HTMLAttributes,type ReactElement,type ReactNode} from 'react';
import styles from './Stagger.module.css';

export type StaggerProps=HTMLAttributes<HTMLElement>&{as?:ElementType;children:ReactNode;/** ms between children */step?:number;/** children after this many share the last delay */max?:number;
 /** 'rise' (default) or 'pop' (a small scale-in, for reward tiles). */variant?:'rise'|'pop'};

export default function Stagger({as:Tag='div',children,step=45,max=10,variant='rise',className='',style,...rest}:StaggerProps){
 let n=0;
 const items=Children.map(children,child=>{
  if(!isValidElement(child))return child;
  const el=child as ReactElement<{style?:CSSProperties}>;
  return cloneElement(el,{style:{...el.props.style,'--bits-i':Math.min(n++,max)} as CSSProperties});
 });
 return <Tag {...rest} className={`${styles.stagger} ${className}`} data-stagger={variant} style={{...style,'--bits-step':`${step}ms`} as CSSProperties}>{items}</Tag>;
}
