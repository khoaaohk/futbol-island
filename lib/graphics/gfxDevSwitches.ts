import {AgXToneMapping,NeutralToneMapping} from 'three';
import type {WebGLRenderer} from 'three';
import {gfxFlag} from './gfxFlags';
import {installShadowKernel} from './shadowKernel';
/**
 * The island renderer's dev-only A/B switches (Nov 17 2026, plan T1 and T6), applied right after its normal settings by
 * configureIslandRenderer (lib/town/islandWarm.ts) and components/Town.tsx. Without a `?gfx=` flag on a development build this
 * does nothing: the live tone mapping (ACES Filmic) and the 16-tap soft shadow filter are untouched. In production gfxFlag() is
 * constant false. Only the renderer passed in is affected (the tone curve is per renderer; the shadow filter is scoped by
 * lib/graphics/shadowKernel.ts), never the shop, arcade or preview renderers.
 *  - tone-neutral: Khronos PBR Neutral (keeps authored colours; three's own curve, no custom shader)
 *  - tone-agx:     AgX (softer highlights, less saturated)
 *  - shadow4 / shadow5: the lighter soft-shadow filter
 */
export function applyGfxDevSwitches(renderer:WebGLRenderer){
 if(gfxFlag('tone-neutral'))renderer.toneMapping=NeutralToneMapping;else if(gfxFlag('tone-agx'))renderer.toneMapping=AgXToneMapping;
 if(gfxFlag('shadow4'))installShadowKernel(renderer,4);else if(gfxFlag('shadow5'))installShadowKernel(renderer,5);
}
