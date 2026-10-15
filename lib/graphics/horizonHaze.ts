import {Color, Fog, type Scene} from 'three';
/**
 * Horizon haze (Oct 14 2026, user: "when parachuting down from the mountain, the view of the edge to the world is odd").
 *
 * The follow camera looks down at a fixed ~32° and its far plane is 500 m (heat: no extra scenery drawn at height). Up to a
 * camera height of ~110 m the whole view reaches the ground inside that range; above it (the parachute blast takes the camera to
 * ~250 m) the sea and the coast were clipped by the far plane in a hard straight line against the flat sky colour.
 *
 * Fix: a linear fog whose colour IS the scene background Color (the same object, so the day / sunset / night lighting lerp moves
 * both together) and whose far distance is the camera's far plane. Fog is applied after tone mapping and colour conversion, in the
 * same unlit colour space as the clear colour, so whatever reaches the clip line has already become exactly the sky colour: the
 * sea fades into haze instead of ending. The near distance comes in with the camera height (hazeRange below), so the walk
 * view (nothing past ~100 m deep) and the 28 m jetpack cruise (~230 m) never reach it: their pictures are unchanged.
 *
 * Cost: no draw calls, no geometry; one varying and a mix per fragment. The fog is attached before the first shader compile
 * (lib/town/islandWarm.ts and components/Town.tsx), so no program is compiled twice.
 */
export const HAZE_MIN_NEAR_FRACTION=.68,HAZE_NEAR_REACH=1.25,HAZE_HEIGHT_SCALE=1.6,HAZE_BAND_MIN=60;
/** The haze range for a camera at height `cameraY` with far plane `far` (view-space depth, as three.js fog measures it). The band
 *  (near → far) is the minimum 60 m up to a ~75 m camera (the walk view on the 50 m summit sees ~330 m deep: untouched), and
 *  widens with height to ~160 m (0.68 of the far plane) by a ~180 m camera: wide enough to read as haze, narrow enough to keep the island clear below the parachute. */
export function hazeRange(cameraY:number,far:number){
 const near=Math.max(far*HAZE_MIN_NEAR_FRACTION,Math.min(far-HAZE_BAND_MIN,far*HAZE_NEAR_REACH-cameraY*HAZE_HEIGHT_SCALE));
 return {near,far};
}
/** Gives `scene` the haze, sharing its background Color. Returns the fog. */
export function attachHorizonHaze(scene:Scene,far=500){
 const sky=scene.background instanceof Color?scene.background:new Color('#e8b98b');
 const r=hazeRange(0,far),fog=new Fog(sky,r.near,r.far);fog.color=sky;scene.fog=fog;return fog;
}
/** Per frame: follow the camera's height and far plane (a view may raise it), and keep sharing the background Color. */
export function updateHorizonHaze(scene:Scene,camera:{position:{y:number};far:number}){
 const fog=scene.fog;if(!(fog instanceof Fog))return;
 if(scene.background instanceof Color&&fog.color!==scene.background)fog.color=scene.background;
 const r=hazeRange(camera.position.y,camera.far);fog.near=r.near;fog.far=r.far;
}
