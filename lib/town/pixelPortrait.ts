// Decorative retro avatars reused from the original island.
const GRID = 24;

const SKINS = ["#f2c79b", "#e8b381", "#d99a6c", "#c17a49", "#9c5c33", "#7a4726", "#5a3620"];
const HAIRS = ["#111111", "#2a1a0e", "#4a2f18", "#6b4423", "#916a3d", "#c79a4e", "#e6cf94", "#8a8f96", "#b0342a"];
const EYES = ["#3a2a1a", "#2b2b2b", "#3f6ea5", "#3f7a4a"];
// retro two-tone backgrounds
const BGS: [string, string][] = [
  ["#2b3a67", "#1c2647"], ["#3a2b5e", "#241a3d"], ["#1f5c53", "#123832"],
  ["#5e3a2b", "#3d241a"], ["#4a4f57", "#2c3037"], ["#5c5326", "#3a3417"], ["#2f4a5c", "#1c2e3a"],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * f)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * f)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * f)));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export function drawPixelPortrait(ctx: CanvasRenderingContext2D, size: number, name: string) {
  const h = hash(name);
  const bit = (shift: number, mask: number) => (h >> shift) & mask;
  const skin = SKINS[bit(0, 7) % SKINS.length];
  const skinSh = shade(skin, 0.82);
  const hair = HAIRS[bit(3, 15) % HAIRS.length];
  const hairSh = shade(hair, 0.75);
  const eye = EYES[bit(7, 3) % EYES.length];
  const style = bit(9, 7) % 6;      // 0 short 1 buzz 2 curly/afro 3 medium 4 bald 5 long
  const facial = bit(12, 3);        // 0 none 1 stubble 2 mustache 3 beard
  const [bg1, bg2] = BGS[bit(14, 7) % BGS.length];

  const S = size / GRID;
  ctx.clearRect(0, 0, size, size);
  const px = (x: number, y: number, c: string, w = 1, ht = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x * S), Math.round(y * S), Math.ceil(w * S), Math.ceil(ht * S)); };

  // background (vertical two-tone)
  px(0, 0, bg1, GRID, 13);
  px(0, 13, bg2, GRID, GRID - 13);

  // shoulders / jersey hint
  const jersey = shade(bg1, 1.35);
  px(3, 21, jersey, 18, 4);
  px(5, 20, jersey, 14, 2);

  // neck
  px(10, 17, skinSh, 4, 3);

  // head (rounded box via stepped corners)
  px(8, 6, skin, 8, 12);
  px(7, 8, skin, 10, 8);
  px(9, 5, skin, 6, 1);
  // cheek shading (right side)
  px(15, 8, skinSh, 1, 9);
  px(14, 16, skinSh, 2, 1);
  // ears
  px(6, 11, skin, 1, 3); px(17, 11, skin, 1, 3);

  // hair
  if (style !== 4) {
    if (style === 2) { // curly / afro — big rounded
      px(6, 2, hair, 12, 5); px(5, 4, hair, 14, 4); px(6, 7, hair, 2, 3); px(16, 7, hair, 2, 3);
    } else if (style === 5) { // long
      px(7, 3, hair, 10, 5); px(6, 5, hair, 2, 11); px(16, 5, hair, 2, 11); px(8, 4, hairSh, 8, 1);
    } else if (style === 1) { // buzz
      px(8, 5, hairSh, 8, 2); px(8, 4, hair, 8, 1);
    } else if (style === 3) { // medium
      px(7, 4, hair, 10, 4); px(7, 6, hair, 1, 3); px(16, 6, hair, 1, 3); px(8, 3, hair, 8, 1);
    } else { // short
      px(8, 4, hair, 8, 3); px(8, 3, hair, 8, 1); px(7, 6, hair, 1, 1); px(16, 6, hair, 1, 1);
    }
    px(8, 4, shade(hair, 1.25), 3, 1); // highlight
  }

  // eyebrows
  px(9, 10, hairSh, 2, 1); px(13, 10, hairSh, 2, 1);
  // eyes (white + coloured pupil)
  px(9, 11, "#f4f4f4", 2, 2); px(13, 11, "#f4f4f4", 2, 2);
  px(10, 12, eye, 1, 1); px(13, 12, eye, 1, 1);
  // nose
  px(12, 13, skinSh, 1, 2);
  // mouth
  px(10, 16, shade(skin, 0.6), 4, 1);

  // facial hair
  if (facial === 1) { px(9, 15, hairSh, 6, 2); ctx.globalAlpha = 0.45; px(9, 15, hair, 6, 2); ctx.globalAlpha = 1; } // stubble
  else if (facial === 2) { px(10, 15, hair, 4, 1); } // mustache
  else if (facial === 3) { px(8, 15, hair, 8, 3); px(9, 18, hair, 6, 1); px(10, 15, skin, 4, 1); } // beard (leave mouth)
}
