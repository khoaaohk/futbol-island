import type {StickerId} from './boots';

/**
 * The boot studio's own sticker set (Oct 12 2026), drawn for Futbol Island: no traced or third-party art, no brand marks.
 * Each sticker is a 256×256 SVG with a die-cut white border (the `cut` outline drawn first, wider, in cream), so on the boot
 * it reads like a real vinyl sticker. The studio rasterises the SVG into its decal atlas (bootScene.ts) only when a sticker is
 * added; the picker shows the same SVG as an <img>.
 */
const INK='#203a33';
/** Die-cut edge + art. `shape` is the silhouette (drawn as the white border, then filled). */
const sticker=(shape:string,art:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">`+
 `<g stroke-linejoin="round" stroke-linecap="round"><g fill="#fffaf0" stroke="#fffaf0" stroke-width="22">${shape}</g>${art}</g></svg>`;

const STAR='M128 22l29 62 67 8-50 46 13 67-59-33-59 33 13-67-50-46 67-8z';
const HEART='M128 222C66 178 26 140 26 92c0-32 24-56 54-56 21 0 38 11 48 28 10-17 27-28 48-28 30 0 54 24 54 56 0 48-40 86-102 130z';
const BOLT='M150 18L58 140h56l-18 98 102-136h-58z';
const FLAME='M128 238c-50 0-82-34-82-78 0-40 26-62 40-96 6 22 18 34 30 40-2-40 18-70 48-86-8 34 6 56 24 78 14 18 22 38 22 62 0 46-34 80-82 80z';
const CROWN='M34 196l-10-118 58 46 46-82 46 82 58-46-10 118z';
const SHIELD='M128 20l92 30v64c0 62-40 104-92 124-52-20-92-62-92-124V50z';
const PAW_SHAPE='<ellipse cx="128" cy="170" rx="58" ry="50"/><ellipse cx="62" cy="108" rx="24" ry="32"/><ellipse cx="102" cy="64" rx="24" ry="32"/><ellipse cx="154" cy="64" rx="24" ry="32"/><ellipse cx="194" cy="108" rx="24" ry="32"/>';

/** A football: white ball, dark pentagons, curved seams. */
const ball=(r=96)=>`<circle cx="128" cy="128" r="${r}" fill="#fbfbf7" stroke="${INK}" stroke-width="7"/>`+
 `<path d="M128 92l34 25-13 40h-42l-13-40z" fill="${INK}"/>`+
 `<path d="M128 92V40M162 117l46-17M149 157l28 40M107 157l-28 40M94 117l-46-17" stroke="${INK}" stroke-width="6" fill="none"/>`+
 `<path d="M104 36l24 6 24-6M210 104l-2 26 14 20M188 204l-24 4-14 18M68 204l24 4 14 18M46 104l2 26-14 20" stroke="${INK}" stroke-width="6" fill="none"/>`+
 `<path d="M70 70a82 82 0 0 1 40-30" stroke="#ffffff" stroke-width="10" fill="none" opacity=".8"/>`;

const badge=(n:number,face:string,ring:string)=>sticker(`<circle cx="128" cy="128" r="104"/>`,
 `<circle cx="128" cy="128" r="104" fill="${ring}"/><circle cx="128" cy="128" r="84" fill="${face}"/>`+
 `<circle cx="128" cy="128" r="84" fill="none" stroke="#fffaf0" stroke-width="4" stroke-dasharray="10 9" opacity=".75"/>`+
 `<text x="128" y="${n>9?156:160}" text-anchor="middle" font-family="Arial Black,Arial,Helvetica,sans-serif" font-weight="900" font-size="${n>9?96:112}" fill="#fffaf0" stroke="${INK}" stroke-width="5" paint-order="stroke">${n}</text>`);

export const STICKERS:Record<StickerId,{label:string;svg:string}>={
 star:{label:'Star',svg:sticker(`<path d="${STAR}"/>`,`<path d="${STAR}" fill="#ffd23f" stroke="${INK}" stroke-width="7"/><path d="M128 58l17 38 40 5" fill="none" stroke="#fff6c2" stroke-width="9"/>`)},
 stars:{label:'Three stars',svg:sticker(`<path d="M70 70l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z"/><path d="M186 70l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z"/><path d="M128 118l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z"/>`,
  `<g fill="#ffd23f" stroke="${INK}" stroke-width="6"><path d="M70 70l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z"/><path d="M186 70l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z"/><path d="M128 118l14 30 33 4-24 22 6 33-29-16-29 16 6-33-24-22 33-4z" fill="#ff9a3c"/></g>`)},
 ball:{label:'Ball',svg:sticker(`<circle cx="128" cy="128" r="100"/>`,ball())},
 bolt:{label:'Lightning',svg:sticker(`<path d="${BOLT}"/>`,`<path d="${BOLT}" fill="#ffe14a" stroke="${INK}" stroke-width="7"/><path d="M140 40l-60 82" stroke="#fff8c9" stroke-width="9" fill="none"/>`)},
 heart:{label:'Heart',svg:sticker(`<path d="${HEART}"/>`,`<path d="${HEART}" fill="#ff4f7a" stroke="${INK}" stroke-width="7"/><path d="M62 74c8-14 24-20 36-14" stroke="#ffd0dc" stroke-width="10" fill="none"/>`)},
 crown:{label:'Crown',svg:sticker(`<path d="${CROWN}"/><rect x="34" y="190" width="188" height="34" rx="8"/>`,
  `<path d="${CROWN}" fill="#ffc53a" stroke="${INK}" stroke-width="7"/><rect x="34" y="190" width="188" height="34" rx="8" fill="#e59a1c" stroke="${INK}" stroke-width="7"/>`+
  `<circle cx="128" cy="150" r="14" fill="#ff4f7a" stroke="${INK}" stroke-width="5"/><circle cx="76" cy="160" r="9" fill="#53b8f2" stroke="${INK}" stroke-width="4"/><circle cx="180" cy="160" r="9" fill="#53b8f2" stroke="${INK}" stroke-width="4"/>`)},
 flame:{label:'Flame',svg:sticker(`<path d="${FLAME}"/>`,`<path d="${FLAME}" fill="#ff6a2a" stroke="${INK}" stroke-width="7"/><path d="M128 226c-26 0-42-18-42-40 0-22 16-34 26-52 4 16 12 22 20 26 0-22 10-38 24-46-2 20 6 30 14 44 6 10 10 20 10 30 0 22-22 38-52 38z" fill="#ffd23f"/>`)},
 palm:{label:'Palm tree',svg:sticker(`<path d="M30 230h196c-10-30-50-36-70-34l-8-82c34-6 62 6 78 24 0-34-36-56-70-52 22-14 52-10 68 0-10-28-52-38-80-18 0-22-24-38-48-34 16 10 24 22 26 36-30-8-60 8-70 34 22-10 46-8 60 4-30 6-50 30-50 56 20-24 48-32 70-26l-4 76c-22 0-56 6-74 36z"/>`,
  `<path d="M30 230h196c-10-30-48-38-98-38s-88 8-98 38z" fill="#ffd98a" stroke="${INK}" stroke-width="6"/>`+
  `<path d="M124 196c2-40 4-70 14-106" stroke="#8a5a2b" stroke-width="16" fill="none"/><path d="M124 196c2-40 4-70 14-106" stroke="${INK}" stroke-width="3" fill="none" stroke-dasharray="4 14"/>`+
  `<path d="M138 92c30-14 64-6 82 16-28-6-52-2-82-16zM136 90c20-24 54-30 78-18-26 2-52 8-78 18zM134 92c-6-30-30-46-56-44 22 10 38 24 56 44zM136 94c-32-6-58 8-72 30 24-10 46-14 72-30zM138 92c10 26 4 52-14 72 6-26 8-46 14-72z" fill="#2fa65a" stroke="${INK}" stroke-width="5"/>`+
  `<circle cx="140" cy="100" r="9" fill="#8a5a2b"/><circle cx="128" cy="98" r="8" fill="#8a5a2b"/>`)},
 wave:{label:'Wave',svg:sticker(`<path d="M24 188c0-80 54-140 128-140 50 0 82 34 82 70 0 28-22 46-44 46-18 0-30-12-30-26 0-10 6-18 16-20-22-8-60 6-60 52 0 10 2 18 6 26H32z"/>`,
  `<path d="M24 188c0-80 54-140 128-140 50 0 82 34 82 70 0 28-22 46-44 46-18 0-30-12-30-26 0-10 6-18 16-20-22-8-60 6-60 52 0 10 2 18 6 26H32z" fill="#2f8fe0" stroke="${INK}" stroke-width="7"/>`+
  `<path d="M60 150c14-48 50-80 96-82" stroke="#bfe6ff" stroke-width="10" fill="none"/><path d="M30 214h196" stroke="#53b8f2" stroke-width="16"/><path d="M30 214h196" stroke="${INK}" stroke-width="4" stroke-dasharray="20 12"/>`)},
 paw:{label:'Paw',svg:sticker(PAW_SHAPE,`<g fill="#ff9a3c" stroke="${INK}" stroke-width="7">${PAW_SHAPE}</g><ellipse cx="112" cy="160" rx="16" ry="10" fill="#ffd2a8"/>`)},
 wings:{label:'Wings',svg:sticker(`<path d="M128 150C90 90 40 70 14 74c10 22 22 34 40 40-16 2-28 10-34 20 22 6 40 4 54-2-10 10-14 22-12 32 28-6 48-20 66-14zM128 150c38-60 88-80 114-76-10 22-22 34-40 40 16 2 28 10 34 20-22 6-40 4-54-2 10 10 14 22 12 32-28-6-48-20-66-14z"/>`,
  `<path d="M128 150C90 90 40 70 14 74c10 22 22 34 40 40-16 2-28 10-34 20 22 6 40 4 54-2-10 10-14 22-12 32 28-6 48-20 66-14zM128 150c38-60 88-80 114-76-10 22-22 34-40 40 16 2 28 10 34 20-22 6-40 4-54-2 10 10 14 22 12 32-28-6-48-20-66-14z" fill="#fdfcf6" stroke="${INK}" stroke-width="7"/>`+
  `<path d="M100 120c-20-12-40-18-58-18M98 136c-18-4-34-2-48 6M156 120c20-12 40-18 58-18M158 136c18-4 34-2 48 6" stroke="#9fb6c8" stroke-width="5" fill="none"/><circle cx="128" cy="150" r="16" fill="#ffd23f" stroke="${INK}" stroke-width="6"/>`)},
 rocket:{label:'Rocket',svg:sticker(`<path d="M128 18c40 30 54 78 44 128l26 30-8 40-34-22h-56l-34 22-8-40 26-30c-10-50 4-98 44-128z"/><path d="M104 196h48l-24 48z"/>`,
  `<path d="M104 196h48l-24 44z" fill="#ffb02e" stroke="${INK}" stroke-width="6"/><path d="M84 146l-26 30 8 40 34-22zM172 146l26 30-8 40-34-22z" fill="#ff4f5a" stroke="${INK}" stroke-width="6"/>`+
  `<path d="M128 18c40 30 54 78 44 128l-10 48H94l-10-48c-10-50 4-98 44-128z" fill="#f3f1ea" stroke="${INK}" stroke-width="7"/><circle cx="128" cy="100" r="22" fill="#53b8f2" stroke="${INK}" stroke-width="7"/><path d="M118 92a12 12 0 0 1 12-6" stroke="#e6f6ff" stroke-width="6" fill="none"/>`)},
 shield:{label:'Shield',svg:sticker(`<path d="${SHIELD}"/>`,`<path d="${SHIELD}" fill="#2253d6" stroke="${INK}" stroke-width="7"/><path d="M128 20v218" stroke="#ffd23f" stroke-width="26"/><path d="M128 20l92 30v64c0 62-40 104-92 124" fill="none" stroke="${INK}" stroke-width="7"/>`+
  `<path d="${STAR}" transform="translate(84 76) scale(.34)" fill="#fffaf0" stroke="${INK}" stroke-width="14"/>`)},
 'badge-7':{label:'Number 7',svg:badge(7,'#d7262e','#ffd23f')},
 'badge-9':{label:'Number 9',svg:badge(9,'#2253d6','#ffd23f')},
 'badge-10':{label:'Number 10',svg:badge(10,'#18191d','#ffd23f')},
 'badge-11':{label:'Number 11',svg:badge(11,'#2fa65a','#fffaf0')},
};
export const stickerDataUrl=(id:StickerId)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(STICKERS[id].svg);
