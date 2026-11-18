import {ShaderChunk} from 'three';
import type {WebGLRenderer} from 'three';
/**
 * A lighter soft-shadow filter, DEV-ONLY and OFF by default (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md T1).
 *
 * With PCFSoftShadowMap three r169 compares the shadow map 16 times for every pixel of every lit material (count: tests/
 * ground-shader-cost.cjs). This swaps that block for
 *  - 4 taps (`?gfx=shadow4`): one bilinear lookup of the 2x2 texels round the sample (an edge one texel wide), or
 *  - 5 taps (`?gfx=shadow5`): a centre-weighted cross one texel out (six shades across the edge).
 * It is not switched on for players: fewer taps can make thin casters (goal nets, poles, the zipline) and the moving shadow box
 * shimmer while walking, and that only shows on a real phone in motion, never in a still.
 *
 * Scope. three keeps its shader chunks in ONE global table that every renderer on the page compiles from (the shop, arcade room
 * and preview renderers too), so the table is NOT edited for good. installShadowKernel() wraps this one renderer's render /
 * compile / compileAsync: the lighter chunk is in the table only while THIS renderer is inside one of those calls (programs are
 * built synchronously inside them) and the original text is put back before the call returns. Any other renderer compiles the
 * stock filter, flag or no flag. Without the flag nothing is wrapped at all.
 */
export type ShadowTaps=4|5;
const START='#elif defined( SHADOWMAP_TYPE_PCF_SOFT )',END='#elif defined( SHADOWMAP_TYPE_VSM )';
const BODY:Record<ShadowTaps,string>={
 4:`
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = mix(
				mix( texture2DCompare( shadowMap, uv, shadowCoord.z ), texture2DCompare( shadowMap, uv + vec2( texelSize.x, 0.0 ), shadowCoord.z ), f.x ),
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, texelSize.y ), shadowCoord.z ), texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ), f.x ),
				f.y );
`,
 5:`
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) * 2.0 +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( texelSize.x, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy - vec2( texelSize.x, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, texelSize.y ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy - vec2( 0.0, texelSize.y ), shadowCoord.z )
			) * ( 1.0 / 6.0 );
`};
/** three's shadowmap_pars_fragment with the PCF-soft block replaced; null when the chunk no longer has the expected markers. */
export function liteShadowChunk(chunk:string,taps:ShadowTaps):string|null{
 const a=chunk.indexOf(START),b=chunk.indexOf(END,a);if(a<0||b<0)return null;
 return chunk.slice(0,a+START.length)+BODY[taps]+'\t\t'+chunk.slice(b);
}
const installed=new WeakSet<WebGLRenderer>();
/** Scope the lighter filter to one renderer (see above). Returns false when it could not be applied (nothing is changed then). */
export function installShadowKernel(renderer:WebGLRenderer,taps:ShadowTaps):boolean{
 if(installed.has(renderer))return true;
 const table=ShaderChunk as Record<string,string>;
 if(!liteShadowChunk(table.shadowmap_pars_fragment,taps))return false;
 installed.add(renderer);
 const scoped=<A extends unknown[],R>(fn:(...a:A)=>R)=>(...a:A):R=>{
  // read at call time: the island's shadow-edge fade (shadowEdgeFade.ts) patches the same chunk at import
  const keep=table.shadowmap_pars_fragment,lite=liteShadowChunk(keep,taps);if(!lite)return fn(...a);
  table.shadowmap_pars_fragment=lite;try{return fn(...a);}finally{table.shadowmap_pars_fragment=keep;}
 };
 renderer.render=scoped(renderer.render.bind(renderer));
 renderer.compile=scoped(renderer.compile.bind(renderer));
 renderer.compileAsync=scoped(renderer.compileAsync.bind(renderer));
 return true;
}
