/**
 * Printed marks on a procedural ball (Oct 5 2026, user: "fully exact", logos included): each decal is a transparent image, lossless WebP since Oct 7 2026 (cropped
 * and cleaned from a licensed photo, or a logo file) projected onto the sphere around the unit direction `dir`, with `up`
 * pointing to the top of the image, `w`×`h` its half-size in sphere radii (≈ radians). Up to 8 per ball. A design file adds
 * them with `export const decals:Decal[]=[…]`. `credit` names the image's source and licence (the gallery's Credits list).
 */
export type Vec3=readonly [number,number,number];
export type Decal={src:string;dir:Vec3;up:Vec3;w:number;h:number;gloss?:number;credit?:string};
export const MAX_DECALS=8;
