import type {Finish,StudFinish,UpperMaterial} from './boots';

/**
 * Natural materials for the boot studio (Oct 13 2026; user: "all the boots look plastic and shiny, they need to look more
 * natural"). Pure numbers, no three.js, so tests/shop-boots.cjs checks them without a browser.
 *
 * NATURAL_ROUGHNESS is the base roughness per material class. The bake (bootBake.ts) writes it per texel into the normal map's
 * alpha (leather a little smoother on the toe, rubber pads and thread rougher, the lining rough fabric); the material multiplies
 * it by the finish's roughK. The default finish ("matte") is the natural look: soft matte leather with a wide soft highlight and a
 * faint fibre sheen, satin synthetic, matte knit with a fibre sheen and no specular hotspot, matte rubber, satin plates.
 * "Glossy" is a thin clear coat over that (a premium coated boot, not wet plastic); "metallic" and "iridescent" are the effects.
 */
export const NATURAL_ROUGHNESS={leather:.64,synthetic:.5,knit:.9,rubber:.88,lining:.95,plate:.52,rubberSole:.8,gum:.78,lace:.88,stud:.6,metalTip:.32} as const;
/** The upper material's class roughness (what the bake writes for the plain upper). */
export const upperRoughness=(u:UpperMaterial)=>NATURAL_ROUGHNESS[u];

export type SurfaceParams={roughK:number;metalness:number;clearcoat:number;clearcoatRoughness:number;sheen:number;sheenRoughness:number;specularIntensity:number};
/** The upper: roughness = texel roughness × roughK. Knit has a fibre sheen and little specular; leather a faint sheen. */
export function upperFinish(finish:Finish,upper:UpperMaterial):SurfaceParams{
 const knit=upper==='knit',leather=upper==='leather';
 const sheen=knit?1:leather?.35:0,sheenRoughness=knit?.5:.75,spec=knit?.3:leather?.55:.8;
 switch(finish){
  case 'glossy':return {roughK:knit?.9:.8,metalness:0,clearcoat:knit?.15:.5,clearcoatRoughness:.14,sheen:sheen*.6,sheenRoughness,specularIntensity:spec};
  case 'metallic':return {roughK:knit?.62:.55,metalness:knit?.55:.78,clearcoat:knit?0:.25,clearcoatRoughness:.2,sheen:sheen*.3,sheenRoughness,specularIntensity:1};
  case 'iridescent':return {roughK:knit?.75:.7,metalness:0,clearcoat:knit?.2:.45,clearcoatRoughness:.16,sheen:sheen*.4,sheenRoughness,specularIntensity:spec};
  default:return {roughK:1,metalness:0,clearcoat:0,clearcoatRoughness:.3,sheen,sheenRoughness,specularIntensity:spec};
 }
}
/** The soleplate: satin TPU/nylon by default, matte rubber or gum on the classics and indoor soles. */
export function plateFinish(finish:Finish,rubber:boolean):SurfaceParams{
 const base={roughK:1,metalness:0,clearcoat:0,clearcoatRoughness:.3,sheen:0,sheenRoughness:.8,specularIntensity:rubber?.45:.7};
 if(finish==='glossy')return {...base,roughK:rubber?.9:.7,clearcoat:rubber?0:.3,clearcoatRoughness:.16};
 if(finish==='metallic')return {...base,roughK:.7,metalness:rubber?0:.55,specularIntensity:1};
 if(finish==='iridescent')return {...base,roughK:.8,clearcoat:rubber?0:.25};
 return base;
}
/** Studs: moulded plastic is satin, "glossy" a light satin coat (fix pass Oct 13 2026, user: studs "matte or satin, not glossy":
 *  no wet clear-coat hotspot on the little studs); SG tips are real metal. */
export function studFinishParams(f:StudFinish):{roughness:number;metalness:number;clearcoat:number}{
 switch(f){
  case 'matte':return {roughness:.8,metalness:0,clearcoat:0};
  case 'glossy':return {roughness:.48,metalness:0,clearcoat:.1};
  case 'translucent':return {roughness:.18,metalness:0,clearcoat:.6};
  case 'chrome':return {roughness:.18,metalness:1,clearcoat:0};
  default:return {roughness:NATURAL_ROUGHNESS.stud,metalness:0,clearcoat:0};
 }
}
