import {ShaderChunk} from 'three';
/**
 * Soft shadow edge (Oct 14 2026, user report on Summit Isle: "weird shading that cuts off").
 *
 * three.js leaves everything outside the sun's shadow box fully lit, so a shadow that crosses the box edge ends in a long, perfectly
 * straight line (the box edge seen on the ground). The island fit (islandShadows.ts) now covers what the camera sees, but when it
 * has to stop (the far end of a downhill view from the summit, the reach cap), shadows fade out over the last SHADOW_EDGE_FADE of
 * the shadow map on each side instead of being cut. The fit adds that band OUTSIDE the visible ground, so normal views never show it.
 *
 * Cost: one min/smoothstep per shadowed fragment, no extra draws or textures. Patched into three's shared chunk at import, before any
 * program compiles (imported by lib/town/islandWarm.ts and lib/graphics/islandShadows.ts), so no shader compiles twice.
 */
export const SHADOW_EDGE_FADE=.025;
const MARK='/* fi-shadow-edge-fade */';
export function installShadowEdgeFade(){
 const chunk=ShaderChunk.shadowmap_pars_fragment;if(chunk.includes(MARK))return true;
 // The first `return mix(...)` closes getShadow (directional/spot); the point-light version keeps its own (cube maps have no edge).
 const find='return mix( 1.0, shadow, shadowIntensity );';const at=chunk.indexOf(find);if(at<0)return false;
 const fade=`${MARK}
		float shadowEdge = min( min( shadowCoord.x, 1.0 - shadowCoord.x ), min( shadowCoord.y, 1.0 - shadowCoord.y ) );
		return mix( 1.0, shadow, shadowIntensity * smoothstep( 0.0, ${SHADOW_EDGE_FADE.toFixed(3)}, shadowEdge ) );`;
 (ShaderChunk as Record<string,string>).shadowmap_pars_fragment=chunk.slice(0,at)+fade+chunk.slice(at+find.length);
 return true;
}
installShadowEdgeFade();
