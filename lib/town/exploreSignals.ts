/**
 * Explore checklist signals (G-13, Sep 30 2026). Dependency-free on purpose: the fishing, jobs and market stores fire these
 * without importing the checklist store (lib/town/exploreActivity.ts listens and saves once per item). No window, no-op.
 */
export const EXPLORE_SIGNAL='fi2-explore-signal';
export type ExploreSignal='fish'|'job'|'sold'|'cay'|'jetty'|'konbini';
export function signalExplore(kind:ExploreSignal){
 try{if(typeof window!=='undefined'&&typeof window.dispatchEvent==='function'&&typeof CustomEvent!=='undefined')window.dispatchEvent(new CustomEvent(EXPLORE_SIGNAL,{detail:kind}));}catch{}
}
