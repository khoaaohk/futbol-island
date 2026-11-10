/* Knockout arena button labels, one step of Town's frame loop (moved out of animate(), Nov 10 2026 split; same code, same
   place in the frame). Every frame: one cached lookup and one attribute check; it writes (and allocates) only when the arena
   state flips. The context is one long-lived object Town builds once. */
export type KnockoutLabelsFrame={
  uiElement:<E extends HTMLElement>(selector:string)=>E|null|undefined;liveKnockout:{readonly joined:boolean};
};

export function syncKnockoutLabels(c:KnockoutLabelsFrame){
  const {uiElement,liveKnockout}=c;
  {const actions=uiElement<HTMLElement>('.travel-actions'),arena=liveKnockout.joined;if(actions&&actions.hasAttribute('data-knockout')!==arena){actions.toggleAttribute('data-knockout',arena);const kick=actions.querySelector<HTMLElement>('.touch-shoot'),dodge=actions.querySelector<HTMLElement>('.touch-juggle');for(const [el,label,tip] of [[kick,'Kick','Kick · Space'],[dodge,'Dodge','Dodge sideways · J']] as const){if(!el)continue;if(arena){el.dataset.koLabel=el.getAttribute('aria-label')??'';el.dataset.koTitle=el.getAttribute('title')??'';el.setAttribute('aria-label',label);el.setAttribute('title',tip);}else if(el.dataset.koLabel!==undefined){el.setAttribute('aria-label',el.dataset.koLabel);el.setAttribute('title',el.dataset.koTitle??'');delete el.dataset.koLabel;delete el.dataset.koTitle;}}}}
}
