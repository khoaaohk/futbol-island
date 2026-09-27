/**
 * Bean character look + outfit (docs/bean-characters/CONTRACT.md). Lane A owns this file; lanes B/C/D import it.
 * Pure data: no three.js, safe to import anywhere (tests, customization saves, look generators).
 */
export type BeanBuild = 'tall'|'regular'|'short'|'wide';
export type BeanEyes = 'dots'|'ticks'|'ovals'|'sleepy'|'happy';
export type BeanMouth = 'smile'|'grin'|'smirk'|'o';
export type BeanHairStyle = 'none'|'crop'|'tuft'|'puffs'|'bun'|'ponytail'|'curls'|'long';
export type BeanHeadwear = 'none'|'cap'|'beanie'|'headband'|'bucket'|'visor'|'keeper';

export type BeanLook = {
  body: string;            // signature body colour (hex)
  skin: string;            // face-panel tone (hex)
  build: BeanBuild;
  eyes: BeanEyes;
  mouth: BeanMouth;
  blush?: string;
  hair?: { style: BeanHairStyle; color: string };
  headwear?: BeanHeadwear;
  headwearColor?: string; headwearColor2?: string;
  gloves?: string;         // keepers
};
export type Outfit = { kind: 'kit'|'casual'; shirt: string; shirt2: string; shorts: string; socks: string; socks2?: string; boots: string; number?: number|null };

export type BeanExpression = 'neutral'|'calling'|'determined'|'beaten'|'happy'|'surprised'|'focused';

export const BEAN_BUILDS: readonly BeanBuild[] = ['tall','regular','short','wide'];
export const BEAN_EYES: readonly BeanEyes[] = ['dots','ticks','ovals','sleepy','happy'];
export const BEAN_MOUTHS: readonly BeanMouth[] = ['smile','grin','smirk','o'];
export const BEAN_HAIR_STYLES: readonly BeanHairStyle[] = ['none','crop','tuft','puffs','bun','ponytail','curls','long'];
export const BEAN_HEADWEAR: readonly BeanHeadwear[] = ['none','cap','beanie','headband','bucket','visor','keeper'];
export const BEAN_EXPRESSIONS: readonly BeanExpression[] = ['neutral','calling','determined','beaten','happy','surprised','focused'];

/** Main male character default (the builder's male preset starts here). */
export const DEFAULT_BEAN_LOOK_MALE: BeanLook = {
  body: '#ff7a6b', skin: '#f3c9a1', build: 'regular', eyes: 'dots', mouth: 'smile', blush: '#ff8f8f',
  hair: { style: 'crop', color: '#3a2518' }, headwear: 'none',
};
/** Main female character default (every option stays open to both). */
export const DEFAULT_BEAN_LOOK_FEMALE: BeanLook = {
  body: '#5fb8f2', skin: '#e9b98f', build: 'regular', eyes: 'ovals', mouth: 'smile', blush: '#ff8fae',
  hair: { style: 'ponytail', color: '#3a2217' }, headwear: 'none',
};
export const DEFAULT_BEAN_LOOK: BeanLook = DEFAULT_BEAN_LOOK_MALE;

/** Home/away defaults, mirroring the classic rig's team colours (gold vs sea blue). */
export const DEFAULT_HOME_KIT: Outfit = { kind: 'kit', shirt: '#edb957', shirt2: '#fff4cd', shorts: '#26453e', socks: '#edb957', socks2: '#26453e', boots: '#27342f', number: null };
export const DEFAULT_AWAY_KIT: Outfit = { kind: 'kit', shirt: '#356478', shirt2: '#bcd9d3', shorts: '#f2eee2', socks: '#356478', socks2: '#f2eee2', boots: '#f2eee2', number: null };
/** A keeper kit that contrasts with both outfield kits (Law 4). */
export const DEFAULT_KEEPER_KIT: Outfit = { kind: 'kit', shirt: '#3d8f5a', shirt2: '#e8f04a', shorts: '#2c3b33', socks: '#3d8f5a', socks2: '#e8f04a', boots: '#1f2724', number: 1 };
export const DEFAULT_CASUAL_OUTFIT: Outfit = { kind: 'casual', shirt: '#f2eee2', shirt2: '#e2578a', shorts: '#35507a', socks: '#f7f1e6', boots: '#6a4a3a', number: null };

export function defaultOutfitForTeam(team: string): Outfit {
  return team === 'home' ? DEFAULT_HOME_KIT : team === 'away' ? DEFAULT_AWAY_KIT : DEFAULT_CASUAL_OUTFIT;
}

const BODY_COLOURS = ['#ff7a6b','#6fcfb4','#b99af0','#e2578a','#5fb8f2','#9ad04a','#ffa24c','#f06fb0','#4fc3c7','#c9a0ff','#7fd67a','#ff9e8a'];
const SKIN_TONES = ['#fff3e4','#fde6d2','#f6d2b0','#e9b98f','#c98f63','#a86f48','#7a4b31','#5c3a28'];
const HAIR_COLOURS = ['#1a1210','#2a1c16','#3a2518','#5a3a22','#8a5a2b','#c98a3a','#e3c07a','#b04a2a'];

/** Deterministic look from an id (fallback when no one supplied a look). Hair only, no hats. */
export function defaultBeanLookFor(id: string): BeanLook {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
  const pick = <V>(list: readonly V[], salt: number) => list[((h ^ Math.imul(salt, 0x9e3779b1)) >>> 0) % list.length];
  return {
    body: pick(BODY_COLOURS, 1), skin: pick(SKIN_TONES, 2), build: pick(BEAN_BUILDS, 3),
    eyes: pick(BEAN_EYES, 4), mouth: pick(BEAN_MOUTHS, 5),
    hair: { style: pick(['crop','tuft','puffs','bun','ponytail','curls','none'] as const, 6), color: pick(HAIR_COLOURS, 7) },
    headwear: 'none',
  };
}
