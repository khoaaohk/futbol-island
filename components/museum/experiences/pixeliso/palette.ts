/**
 * pixeliso · the museum's pixel palette (Oct 10 2026, user: "PIXEL-ART ISOMETRIC … a limited palette, chunky pixels").
 *
 * One palette for every pixel exhibit, taken from the penalty-1891 arcade cabinet (Cabinet.module.css + scene.ts): the Sega
 * Mega Drive's 9-bit colour. Every channel is one of 8 levels: 00 24 48 6c 90 b4 d8 fc. Nothing outside these levels is drawn
 * inside a stage (tests/museum-pixeliso-kit.cjs checks every hex here). Index 0 of the indexed buffer is "transparent".
 *
 * Ramps run dark → light: [0] outline-side shade, [1] right face (+x, away from the light), [2] left face (+y), [3] top / lit.
 */
export const MD_LEVELS=[0x00,0x24,0x48,0x6c,0x90,0xb4,0xd8,0xfc] as const;

/** UI colours shared with the penalty cabinet's HUD (same names as its CSS variables). */
export const UI={
 k:'#000000',ink:'#fcfcfc',soft:'#b4d8fc',win:'#000090',win2:'#00006c',bevel:'#2448d8',fill:'#000048',
 gold:'#fcd824',gold2:'#b49000',reach:'#48d8fc',goal:'#6cfc48',miss:'#fc6c48',goal2:'#24b424',miss2:'#b42400',
} as const;

/** Material ramps (4 tones, dark → light). */
export const RAMPS={
 grass:['#002400','#246c24','#489048','#6cb46c'],
 grassAlt:['#002400','#246c24','#48b448','#6cd86c'],
 line:['#6c906c','#b4d8b4','#d8fcd8','#fcfcfc'],
 white:['#6c6c90','#b4b4d8','#d8d8fc','#fcfcfc'],
 steel:['#242448','#48486c','#6c6c90','#9090b4'],
 wood:['#482400','#6c4824','#906c48','#b49048'],
 brick:['#480000','#6c2424','#904848','#b46c48'],
 stone:['#484848','#6c6c6c','#909090','#b4b4b4'],
 paper:['#906c48','#d8b490','#fcd8b4','#fcfcd8'],
 night:['#000024','#000048','#00006c','#000090'],
 red:['#6c0000','#b40000','#fc2424','#fc6c48'],
 blue:['#000048','#0024b4','#2448d8','#48b4fc'],
 gold:['#6c4800','#b49000','#fcd824','#fcfc6c'],
 green:['#004800','#009000','#24d824','#6cfc48'],
 sky:['#0024b4','#2448d8','#48b4fc','#b4d8fc'],
} as const;
export type Ramp=keyof typeof RAMPS;

/** Sprite and effect colours. */
export const SWATCH={
 skinLight:['#906c48','#d8b490','#fcd8b4'],skinMid:['#6c4824','#b46c48','#d8906c'],skinDark:['#482400','#6c4824','#904824'],
 hairBlack:'#242424',hairBrown:'#482400',hairBlond:'#d8b448',hairRed:'#b44824',
 boot:'#242424',net:'#d8d8fc',shadow:'#002400',
 lampCore:'#fcfcd8',lampGlow:'#fcd86c',screenBg:'#002400',led:'#fcb424',ledGreen:'#6cfc48',
} as const;

/** Team kits: shirt ramp (dark, mid, light), trim, shorts, socks. Football players read by team colour first. */
export type Kit={shirt:readonly [string,string,string];trim:string;shorts:readonly [string,string];socks:string;gloves?:string};
export const KITS={
 red:{shirt:['#6c0000','#b40000','#fc2424'],trim:'#fcfcfc',shorts:['#d8d8fc','#fcfcfc'],socks:'#b40000'},
 blue:{shirt:['#000048','#0024b4','#2448d8'],trim:'#fcfcfc',shorts:['#000048','#00006c'],socks:'#2448d8'},
 white:{shirt:['#6c6c90','#d8d8fc','#fcfcfc'],trim:'#000090',shorts:['#000048','#00006c'],socks:'#fcfcfc'},
 gold:{shirt:['#6c4800','#d8b424','#fcd824'],trim:'#004800',shorts:['#004800','#009000'],socks:'#fcd824'},
 green:{shirt:['#004800','#009000','#24d824'],trim:'#fcfcfc',shorts:['#fcfcfc','#fcfcfc'],socks:'#009000'},
 keeper:{shirt:['#6c4800','#d8b424','#fcfc6c'],trim:'#000000',shorts:['#242424','#484848'],socks:'#242424',gloves:'#fcfcfc'},
 keeperGreen:{shirt:['#004800','#24b424','#6cfc48'],trim:'#000000',shorts:['#242424','#484848'],socks:'#24b424',gloves:'#fcfcfc'},
 ref:{shirt:['#000000','#242424','#484848'],trim:'#fcfcfc',shorts:['#000000','#242424'],socks:'#000000'},
} satisfies Record<string,Kit>;
export type KitName=keyof typeof KITS;

/** Every hex the kit can draw, for the palette check. */
export function allColours():string[]{
 const out=new Set<string>();const add=(v:unknown)=>{if(typeof v==='string')out.add(v.toLowerCase());else if(Array.isArray(v))v.forEach(add);else if(v&&typeof v==='object')Object.values(v).forEach(add);};
 add(UI);add(RAMPS);add(SWATCH);add(KITS);return [...out];
}
/** True when every channel is one of the Mega Drive levels. */
export const isMegaDrive=(hex:string)=>{const m=/^#([0-9a-f]{6})$/i.exec(hex);if(!m)return false;const n=parseInt(m[1],16);
 return [n>>16,(n>>8)&255,n&255].every(c=>(MD_LEVELS as readonly number[]).includes(c));};
/** Snap any colour to the nearest Mega Drive colour (for colours that come from data, e.g. a historic kit). */
export function toMegaDrive(hex:string){const n=parseInt(hex.replace('#','').slice(0,6),16)||0;
 const snap=(c:number)=>MD_LEVELS.reduce((a,b)=>Math.abs(b-c)<Math.abs(a-c)?b:a,0);
 return '#'+[n>>16,(n>>8)&255,n&255].map(c=>snap(c).toString(16).padStart(2,'0')).join('');}

/**
 * The indexed palette a Pixmap draws with. Colours are registered on first use (index 1…255), so a scene can use any palette
 * colour by its hex. `rgba` is the little-endian Uint32 the ImageData blit writes.
 */
export class Palette{
 private index=new Map<string,number>();readonly rgba=new Uint32Array(256);size=1;
 id(hex:string){const key=hex.toLowerCase();let i=this.index.get(key);if(i!==undefined)return i;
  if(this.size>=256)throw new Error('pixeliso palette full');i=this.size++;this.index.set(key,i);
  const n=parseInt(key.slice(1),16);this.rgba[i]=(255<<24|(n&255)<<16|((n>>8)&255)<<8|(n>>16))>>>0;return i;}
 hexOf(i:number){for(const [k,v] of this.index)if(v===i)return k;return null;}
}
