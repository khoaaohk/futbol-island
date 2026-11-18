/**
 * Dev-only graphics A/B switches (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md, batch B): `?gfx=name,name` on a
 * DEVELOPMENT build. A production build never reads the URL: gfxFlag() is constant false there, so nothing here can reach a player.
 * Read once per page (the first call), because the switches pick shader source and renderer state that are fixed at compile time.
 *  - pbr-ground   the ground materials keep three's full PBR lighting (the look before the Lambert swap), for side-by-side shots
 *  - pbr-ocean    the same for the ocean plane
 *  - tone-neutral / tone-agx   the island renderer's tone curve (default ACES Filmic stays untouched without a flag)
 *  - shadow5 / shadow4         the lighter soft-shadow filter (lib/graphics/shadowKernel.ts), island materials only
 */
export type GfxFlag='pbr-ground'|'pbr-ocean'|'tone-neutral'|'tone-agx'|'shadow5'|'shadow4';
let cached:ReadonlySet<string>|null=null;
const NONE:ReadonlySet<string>=new Set();
function read():ReadonlySet<string>{
 try{return new Set((new URLSearchParams(window.location.search).get('gfx')??'').split(',').map(s=>s.trim()).filter(Boolean));}catch{return NONE;}
}
export function gfxFlag(name:GfxFlag):boolean{
 if(typeof process==='undefined'||process.env.NODE_ENV==='production'||typeof window==='undefined')return false;
 return (cached??=read()).has(name);
}
