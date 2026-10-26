/** Arcade game guard (owner, Oct 26 2026): holding a game button on a phone must never open the browser's "Copy / Search with Google"
 *  bar, the text-selection handles or the magnifier, and a stray pinch or double-tap must never zoom the page. The CSS side is
 *  `html[data-game-guard]` in app/globals.css (no select, no callout, no pinch/double-tap zoom); this adds the event side that CSS
 *  cannot cover: the long-press context menu, selection starts, iOS gesture zoom and two-finger touch moves. Name fields keep working. */
const editable=(t:EventTarget|null)=>t instanceof HTMLElement&&(t.isContentEditable||t.tagName==='INPUT'||t.tagName==='TEXTAREA');

export function installGameGuard(doc:Document=document):()=>void{
 const root=doc.documentElement;root.setAttribute('data-game-guard','');
 const stop=(e:Event)=>{if(!editable(e.target))e.preventDefault();};
 const multi=(e:Event)=>{if((e as TouchEvent).touches&&(e as TouchEvent).touches.length>1)e.preventDefault();};
 const opt={passive:false} as AddEventListenerOptions;
 doc.addEventListener('contextmenu',stop);doc.addEventListener('selectstart',stop);
 doc.addEventListener('gesturestart',stop);doc.addEventListener('gesturechange',stop);
 doc.addEventListener('touchmove',multi,opt);
 return()=>{root.removeAttribute('data-game-guard');
  doc.removeEventListener('contextmenu',stop);doc.removeEventListener('selectstart',stop);
  doc.removeEventListener('gesturestart',stop);doc.removeEventListener('gesturechange',stop);
  doc.removeEventListener('touchmove',multi,opt);};
}
