/**
 * Fishing delight pass (Nov 7 2026, docs/fishing.md "Delight pass"): the pure rules behind the little joys of fishing.
 * Cosmetic only. Nothing here reads or writes the odds, the basket, a price or the fight: tests/fishing-delight.cjs checks that this
 * file, its browser binding (fishingDelightStore.ts) and the economy / odds files never import each other.
 *
 * - The catch celebration by rarity tier (common, good, rare, legend, golden): glow, shimmer, sparkles and one sound flourish each.
 * - A tiny family of synthesized animal cues by animal group (no per-species recordings, no audio files).
 * - The gate: reduced motion drops all travel and sparkles (the stamps still appear), heat tier 2+ / Battery saver ("light") keeps
 *   the HUD glow but drops the 3D extras (sparkles round the catch, fireflies, the far whale), sound off sends nothing at all.
 * - Ambient timing (the gull's call, the rare far whale, the golden glint) as pure functions of a random number.
 * - The two secrets (a message in a bottle, casting at the golden glint): a stamp each, once per save (fi2-fishing-secrets-v1).
 */
export type DelightTier='common'|'good'|'rare'|'legend'|'golden';
export type DelightRarity='common'|'uncommon'|'rare'|'legendary';
export type DelightGate={motion:boolean;rich:boolean;sound:boolean};

/** `reduced` prefers-reduced-motion, `tier` the heat tier (0 cool … 4 Battery saver), `soundOn` the island's Sound effects switch. */
export function delightGate(reduced:boolean,tier:number,soundOn:boolean):DelightGate{
 return {motion:!reduced,rich:delightRich(reduced,tier),sound:soundOn};
}
/** The 3D extras' gate without an object (read once per fishing frame: no allocation). */
export const delightRich=(reduced:boolean,tier:number)=>!reduced&&tier<2;

/** The celebration tier: golden beats everything but a legend (legends are never golden). */
export function celebrationTier(rarity:DelightRarity,o:{golden?:boolean;legend?:boolean}={}):DelightTier{
 if(o.legend||rarity==='legendary')return 'legend';
 if(o.golden)return 'golden';
 return rarity==='rare'?'rare':rarity==='uncommon'?'good':'common';
}

/** Per tier: the sound flourish (a 'fi2-job-cue' detail in lib/audio/islandSound.ts), how many HUD sparkles, the 3D sparkle
 *  count round the held-up catch (0 = none), and whether the card's shimmer sweep plays. */
export const CELEBRATION:Record<DelightTier,{cue:string;sparkles:number;orbit:number;shimmer:boolean}>={
 common:{cue:'fish-common',sparkles:0,orbit:0,shimmer:false},
 good:{cue:'fish-good',sparkles:4,orbit:0,shimmer:false},
 rare:{cue:'fish-rare',sparkles:6,orbit:5,shimmer:true},
 legend:{cue:'fish-legend',sparkles:10,orbit:8,shimmer:true},
 golden:{cue:'fish-golden',sparkles:10,orbit:8,shimmer:true},
};
/** The 3D glow level for a rarity (fishingVisuals' CatchLook.glow): 0 none … 3 legend. */
export const RARITY_GLOW:Record<DelightRarity,number>={common:0,uncommon:0,rare:2,legendary:3};

export type AnimalCue='bloop'|'sting'|'glide'|'wiggle'|'clack'|'clam'|'squish'|'tink'|'whale';
/** One short synthesized cue per animal group (islandSound.ts 'animal-<cue>'): sharks keep the island's "da-dum" sting. */
const GROUP_CUE:Record<string,AnimalCue>={fish:'bloop',shark:'sting',ray:'glide',eel:'wiggle',crab:'clack',lobster:'clack',shellfish:'clam',octopus:'squish',squid:'squish',seahorse:'tink'};
export function animalCue(f:{id:string;group:string}|undefined|null):AnimalCue|null{
 if(!f)return null;if(f.id==='whale-shark')return 'whale';
 return GROUP_CUE[f.group]??'bloop';
}
/** The document event + detail for a cue (the island sound kit rate-limits and respects the mute / volume / idle fade). */
export const animalCueDetail=(c:AnimalCue)=>c==='sting'?'sting':`animal-${c}`;

/** Islanders nearby cheer for a big moment: a legend, a golden one, any rare animal or a huge / giant one. Never for a common. */
export function shouldCheer(c:{rarity:DelightRarity;shadow:string;golden?:boolean;legend?:boolean}):boolean{
 return !!c.legend||!!c.golden||c.rarity==='rare'||c.rarity==='legendary'||c.shadow==='huge'||c.shadow==='giant';
}

/** Ambient timings while waiting at the spot (seconds), from a 0..1 random number. All cosmetic, all rare. */
export const AMBIENT={
 /** The idle gull's call: every 25-55 s while waiting. */
 gullWait:(r:number)=>25+r*30,
 /** The far whale or manta: very rare, 3-7 minutes of fishing between passes. */
 whaleWait:(r:number)=>180+r*240,
 whaleSeconds:22,
 /** The golden glint on the water (day and sunset): every 2-5 minutes; it shows for glintSeconds. */
 glintWait:(r:number)=>120+r*180,
 glintSeconds:7,
 /** Fireflies / lantern glows over the shallows at night (and a few at sunset). */
 fireflies:(time:string)=>time==='night'?6:time==='sunset'?3:0,
} as const;

/** The far pass: a whale (2 in 3) or a manta (1 in 3), from the side `dir` (-1 left, 1 right). */
export function pickPasser(r:number):{kind:'whale'|'manta';dir:-1|1}{return {kind:r<.66?'whale':'manta',dir:(Math.floor(r*1000)%2?1:-1) as -1|1};}

// ---- Secrets (once per save, stamps only) ----
export const FISHING_SECRETS_KEY='fi2-fishing-secrets-v1';
export type SecretsSave={version:1;bottle:boolean;glint:boolean};
export const emptySecrets=():SecretsSave=>({version:1,bottle:false,glint:false});
export function sanitizeSecrets(v:unknown):SecretsSave{const o=v&&typeof v==='object'?v as Record<string,unknown>:{};return {version:1,bottle:o.bottle===true,glint:o.glint===true};}
/** Merge keeps a find from either device (nothing is ever lost). */
export const mergeSecrets=(a:SecretsSave,b:SecretsSave):SecretsSave=>({version:1,bottle:a.bottle||b.bottle,glint:a.glint||b.glint});
/** A message in a bottle comes up with a catch: 1 in BOTTLE_ONE_IN catches until it is found (its own random number, never the catch roll). */
export const BOTTLE_ONE_IN=40;
export const rollBottle=(save:SecretsSave,r:number)=>!save.bottle&&Number.isFinite(r)&&r>=0&&r<1/BOTTLE_ONE_IN;
/** Casting while the golden glint shows (it lasts AMBIENT.glintSeconds) finds the glint secret. */
export const glintCaught=(save:SecretsSave,glintAt:number,castAt:number)=>!save.glint&&glintAt>0&&castAt>=glintAt&&castAt-glintAt<=AMBIENT.glintSeconds*1000;
export const SECRET_TEXT={
 bottle:{stamp:'Message in a bottle!',note:'A note inside says: "Whoever finds this: the best teams pass the ball, and the best friends pass it on." It goes in your Fishbook.'},
 glint:{stamp:'Golden glint!',note:'You cast right where the sea sparkled gold. A lucky glint for your Fishbook.'},
} as const;
