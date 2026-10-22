// CharacterCustomization <-> wire Look (12 ints, each an index into CUSTOMIZATION_OPTIONS). Unknown -> 0 / default.
import { LOOK_LEN, type Look } from '../../multiplayer/protocol';
import { CUSTOMIZATION_OPTIONS, DEFAULT_CUSTOMIZATION, applyCustomization, type CharacterCustomization, type CustomizationKey } from '../town/customization';

/** Wire order. `costume` is always 0 in v1 (costumes are not shown to friends). */
export const LOOK_KEYS: readonly CustomizationKey[] = [
  'bodyColor', 'skinTone', 'eyes', 'mouth', 'hair', 'hairColor', 'build', 'headwear', 'headwearColor', 'clothing', 'character', 'costume',
];

export function lookToWire(c: CharacterCustomization): Look {
  const out: number[] = [];
  for (let i = 0; i < LOOK_LEN; i++) {
    const key = LOOK_KEYS[i];
    if (key === 'costume') { out.push(0); continue; }
    const idx = CUSTOMIZATION_OPTIONS[key].findIndex((o) => o.id === (c as Record<string, unknown>)[key]);
    out.push(idx >= 0 && idx < 64 ? idx : 0);
  }
  return out;
}

export function wireToLook(l: Look): CharacterCustomization {
  let v: CharacterCustomization = DEFAULT_CUSTOMIZATION;
  if (!Array.isArray(l)) return v;
  // character first: selecting it resets some bean fields, which the explicit indexes then overwrite.
  const order = [10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (const i of order) {
    const key = LOOK_KEYS[i];
    const opt = Number.isInteger(l[i]) ? CUSTOMIZATION_OPTIONS[key][l[i]] : undefined;
    if (opt) v = applyCustomization(v, key, opt.id);
  }
  return v;
}
