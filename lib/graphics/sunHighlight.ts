/**
 * The sun highlight three's physical shader gives a surface, as one block for a LAMBERT program (Nov 17 2026,
 * docs/graphics/island-graphics-plan-nov17.md T2 / W1). The island's ground and ocean are flat, non-metal (the ocean 2 %) and there
 * is no environment map, so of three's whole PBR light loop only the Lambert diffuse and this direct GGX lobe reach the picture.
 * A program built from three's lambert source plus this block draws the same picture without the rest of the loop (the
 * roughness-from-derivatives clamp, the PhysicalMaterial set-up, the indirect specular / multiscatter maths on a zero environment).
 * Same formulas as three r169 (BRDF_GGX: D_GGX, V_GGX_SmithCorrelated, F_Schlick with f90 = 1), for the ONE sun: `directLight`
 * holds it, already shadowed, after <lights_fragment_begin>. Goes right after `#include <lights_fragment_end>`.
 * @param a2 GLSL float: GGX alpha squared = roughness^4 (see ggxA2)
 * @param f0 GLSL float or vec3: reflectance at normal incidence (.04 for a non-metal)
 */
export const sunHighlightGlsl=(a2:string,f0:string)=>/* glsl */`
#if ( NUM_DIR_LIGHTS > 0 )
{vec3 gH=normalize(directLight.direction+geometryViewDir);
 float gNL=saturate(dot(geometryNormal,directLight.direction)),gNV=saturate(dot(geometryNormal,geometryViewDir)),gNH=saturate(dot(geometryNormal,gH)),gVH=saturate(dot(geometryViewDir,gH));
 float gFr=exp2((-5.55473*gVH-6.98316)*gVH),gD=gNH*gNH*(${a2}-1.)+1.;
 float gV=.5/max(gNL*sqrt(${a2}+(1.-${a2})*gNV*gNV)+gNV*sqrt(${a2}+(1.-${a2})*gNL*gNL),EPSILON);
 reflectedLight.directDiffuse+=directLight.color*(${f0}*(1.-gFr)+gFr)*(gNL*gV*${a2}*RECIPROCAL_PI/(gD*gD));}
#endif
`;
/** three's GGX alpha squared for a material roughness (physical shader: roughness clamped at .0525, alpha = roughness squared). */
export const ggxA2=(roughness:number)=>Math.max(roughness,.0525)**4;
