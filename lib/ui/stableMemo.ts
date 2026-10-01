import {createElement,memo,useRef,type ComponentType,type FunctionComponent} from 'react';

/**
 * Heat (overnight audit F4, Sep 30 2026): `memo` for a dialog host whose parent passes fresh inline callbacks on every render.
 *
 * Town re-renders on its HUD tick (2–3 times a second while walking). Each render rebuilt every closed dialog (settings, customizer,
 * museum, ferry, coaches, conversation, onboarding, position guide) because their `on…` props were new arrow functions. This wrapper
 * hands the host one stable wrapper per callback prop, which always calls the latest function, so the host re-renders only
 * when a data prop changes (open, value, voice, time of day…). Function props must be event callbacks, not render functions: a
 * callback whose identity alone changes does not re-render the host.
 */
export function stableMemo<P extends object>(Component:ComponentType<P>):FunctionComponent<P>{
 const Inner=memo(Component) as unknown as ComponentType<Record<string,unknown>>;
 function StableMemo(props:P){
  const latest=useRef(props);latest.current=props;
  const wrappers=useRef(new Map<string,(...args:unknown[])=>unknown>());
  const next:Record<string,unknown>={};
  for(const [key,value] of Object.entries(props)){
   if(typeof value!=='function'){next[key]=value;continue;}
   let wrapper=wrappers.current.get(key);
   if(!wrapper){wrapper=(...args:unknown[])=>{const fn=(latest.current as Record<string,unknown>)[key];return typeof fn==='function'?fn(...args):undefined;};wrappers.current.set(key,wrapper);}
   next[key]=wrapper;
  }
  return createElement(Inner,next);
 }
 StableMemo.displayName=`StableMemo(${Component.displayName||Component.name||'Component'})`;
 return StableMemo;
}
