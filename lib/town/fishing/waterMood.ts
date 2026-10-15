/**
 * The fishing water's mood (Oct 15 2026, docs/fishing-research.md B3 "night-water look"): SHADER PARAMETERS ONLY.
 * No new shader code, no new draws, no new passes: after a spot's reef theme sets the underwater tint and clarity uniforms
 * (underwater.ts applyReefWater, once per session), `applyWaterMood` scales those same uniforms once for the island's time of day.
 * Night: a darker, deeper blue and a little less clarity; sunset: a warm tint. (The weather half was removed on 15 Oct 2026 with
 * the weather feature itself: user decision, "too complicated".)
 *
 * `moodParams` also gives the visuals two optional numbers (fishingVisuals.ts): `floatGlow` (0..1, the float's emissive glow after
 * dark) and `sparkle` (0..1, how much sun sparkle the surface keeps). Both are plain uniforms/material values.
 */
import type {TimeOfDayKey} from './nightFish';
import {readTimeOfDay} from './timeOfDay';

export type WaterMood={shallow:[number,number,number];deep:[number,number,number];clear:number;floatGlow:number;sparkle:number};
const TIME:Record<TimeOfDayKey,WaterMood>={
 day:{shallow:[1,1,1],deep:[1,1,1],clear:1,floatGlow:0,sparkle:1},
 sunset:{shallow:[1.08,.96,.86],deep:[1.04,.95,.88],clear:.95,floatGlow:.25,sparkle:.85},
 night:{shallow:[.42,.5,.62],deep:[.35,.42,.58],clear:.78,floatGlow:1,sparkle:.25},
};
export function moodParams(time:TimeOfDayKey):WaterMood{const t=TIME[time];return {shallow:[...t.shallow],deep:[...t.deep],clear:t.clear,floatGlow:t.floatGlow,sparkle:t.sparkle};}
type V3={x:number;y:number;z:number;set(x:number,y:number,z:number):unknown};
/** Scale the reef theme's water uniforms (call right after applyReefWater; idempotent per call since the theme sets them fresh). */
export function applyWaterMood(u:{uUwShallow:{value:V3};uUwDeep:{value:V3};uUwClear:{value:number}},time:TimeOfDayKey){
 const m=moodParams(time);
 const tint=(v:V3,k:[number,number,number])=>v.set(v.x*k[0],v.y*k[1],v.z*k[2]);
 tint(u.uUwShallow.value,m.shallow);tint(u.uUwDeep.value,m.deep);u.uUwClear.value*=m.clear;
 return m;
}
/** The visuals' hook (fishingVisuals.ts, right after applyReefWater): the live time of day. */
export const applyLiveWaterMood=(u:Parameters<typeof applyWaterMood>[0])=>applyWaterMood(u,readTimeOfDay());
