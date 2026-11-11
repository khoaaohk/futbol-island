import * as T from 'three';
import type {ArcadeStageLook} from '../looks/stageLook';

/** Base stage look of the comic house style: print colour (no tone mapping), a white sun and a neutral hemisphere fill, because the
 * comic bands decide colour and the lights only decide which band a surface is in (the default band thresholds in
 * createComicUniforms assume exactly these intensities). Heat rules built in: low-power context, pixel ratio 1.5 on phones, one
 * shadow-casting sun, no post pass. A game supplies its id, sky colour, fog, camera, sun position + shadow frustum (keep the sun LOW
 * for long shadows), ball colours and environment; anything else it passes overrides the base. */
export const COMIC_LOOK_BASE={
 renderer:{antialias:true,powerPreference:'low-power',pixelRatioCap:{mobile:1.5,desktop:2},shadows:true,shadowType:T.PCFSoftShadowMap,toneMapping:T.NoToneMapping,exposure:1},
 // Neutral fill: the comic bands decide colour (shadow tint, light tint), the lights only decide which band a surface is in.
 hemi:{sky:'#ffffff',ground:'#a79bb5',intensity:.55},
 sunLight:{color:'#ffffff',intensity:2.6},
 surface:{color:(color:string)=>color,emissive:()=>false,roughness:.9,emissiveIntensity:0},
 sparks:{color:'#fff1b0'},
} as const satisfies {renderer:ArcadeStageLook['renderer'];hemi:ArcadeStageLook['hemi'];sunLight:{color:string;intensity:number};surface:ArcadeStageLook['surface'];sparks:ArcadeStageLook['sparks']};
type SunPlacement=Omit<ArcadeStageLook['sun'],'color'|'intensity'>&Partial<Pick<ArcadeStageLook['sun'],'color'|'intensity'>>;
export type ComicLookInput=Pick<ArcadeStageLook,'id'|'background'|'fog'|'camera'|'ball'|'environment'>&{sun:SunPlacement}&Partial<Pick<ArcadeStageLook,'renderer'|'hemi'|'surface'|'sparks'>>;
export function comicLook(game:ComicLookInput):ArcadeStageLook{
 const b=COMIC_LOOK_BASE;
 return{id:game.id,renderer:game.renderer??{...b.renderer,pixelRatioCap:{...b.renderer.pixelRatioCap}},background:game.background,fog:game.fog,camera:game.camera,hemi:game.hemi??{...b.hemi},
  sun:{...b.sunLight,...game.sun},surface:game.surface??b.surface,ball:game.ball,sparks:game.sparks??{...b.sparks},environment:game.environment};
}
