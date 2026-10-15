/**
 * How much small motion the fishing view may show (Oct 14 2026 polish pass: "subtle animations and improve water, coral, and fish"
 * while heat stays the top concern). One pure gate, read once per rendered fishing frame (no listeners, no timers):
 * - `sway`: coral fans, anemones, soft coral, sea grass and kelp sway in the vertex shader (uUwSway);
 * - `life`: the extra reef life (tiny darting reef fish, rising bubbles);
 * - `particles`: splash drops, the drip from the held catch, the float's resting ripples.
 * Heat tiers 0-1 (cool / warm) show everything on desktop AND phones; tier 2+ (hot, hotter, Battery saver) drops all three, as do
 * reduced motion and the still-water path (water detail 0: governor slow / static ambience). Gameplay feedback (the splash rings on
 * the cast, nibble, bite and hook) is never gated: it is part of reading the bite.
 */
export type FishingLife={sway:boolean;life:boolean;particles:boolean};
export const LIFE_OFF:FishingLife={sway:false,life:false,particles:false};
export const LIFE_ON:FishingLife={sway:true,life:true,particles:true};
export function fishingLife(tier:number,reduced:boolean,waterDetail:number):FishingLife{
 if(reduced||waterDetail<.5||tier>=2)return LIFE_OFF;
 return LIFE_ON;
}
