/**
 * The kid-safe club embeds (seo-extras, Nov 15 2026; app/embed): /embed/<tool> pages that other sites frame. The root layout's
 * first-party counters (VisitTracker, ErrorBeacon) and the on-device Welcome tally skip these paths, so an embedded tool sends
 * no beacon and writes nothing beyond the tool's own saved lineup / plan.
 */
export const EMBED_PATH=/^\/embed(\/|$)/;
export const isEmbedPath=(p:string|null|undefined)=>!!p&&EMBED_PATH.test(p);
export const inEmbed=()=>typeof location!=='undefined'&&isEmbedPath(location.pathname);
