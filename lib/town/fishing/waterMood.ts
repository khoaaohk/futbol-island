/**
 * The fishing water's mood (Oct 15 2026, docs/fishing-research.md B3 "night-water look" and C4 weather): SHADER PARAMETERS ONLY.
 * No new shader code, no new draws, no new passes: after a spot's reef theme sets the underwater tint and clarity uniforms
 * (underwater.ts applyReefWater, once per session), `applyWaterMood` scales those same uniforms once for the island's time of day
 * and the day's weather. Night: a darker, deeper blue and a little less clarity; sunset: a warm tint; cloudy / rain: greyer and
 * murkier; breezy: a touch less clear (stirred-up water).
 *
 * `moodParams` also gives Agent A's visuals two optional numbers (fishingVisuals.ts may read them): `floatGlow` (0..1, the float's
 * emissive glow after dark) and `sparkle` (0..1, how much sun sparkle the surface keeps). Both are plain uniforms/material values.
 */
import type {TimeOfDayKey} from './nightFish';
import {readTimeOfDay,readWeather,type Weather} from './weather';

export type WaterMood={shallow:[number,number,number];deep:[number,number,number];clear:number;floatGlow:number;sparkle:number};
const TIME:Record<TimeOfDayKey,WaterMood>={
 day:{shallow:[1,1,1],deep:[1,1,1],clear:1,floatGlow:0,sparkle:1},
 sunset:{shallow:[1.08,.96,.86],deep:[1.04,.95,.88],clear:.95,floatGlow:.25,sparkle:.85},
 night:{shallow:[.42,.5,.62],deep:[.35,.42,.58],clear:.78,floatGlow:1,sparkle:.25},
};
const WEATHER:Record<Weather,{grey:number;dim:number;clear:number;sparkle:number}>={
 clear:{grey:0,dim:1,clear:1,sparkle:1},
 breezy:{grey:.05,dim:.97,clear:.9,sparkle:1.1},
 overcast:{grey:.35,dim:.86,clear:.85,sparkle:.4},
 rain:{grey:.45,dim:.8,clear:.75,sparkle:.2},
};
export function moodParams(time:TimeOfDayKey,weather:Weather):WaterMood{
 const t=TIME[time],w=WEATHER[weather];
 return {shallow:[t.shallow[0]*w.dim,t.shallow[1]*w.dim,t.shallow[2]*w.dim],deep:[t.deep[0]*w.dim,t.deep[1]*w.dim,t.deep[2]*w.dim],clear:t.clear*w.clear,floatGlow:t.floatGlow,sparkle:Math.min(1,t.sparkle*w.sparkle)};
}
type V3={x:number;y:number;z:number;set(x:number,y:number,z:number):unknown};
/** Scale the reef theme's water uniforms (call right after applyReefWater; idempotent per call since the theme sets them fresh). */
export function applyWaterMood(u:{uUwShallow:{value:V3};uUwDeep:{value:V3};uUwClear:{value:number}},time:TimeOfDayKey,weather:Weather){
 const m=moodParams(time,weather),grey=WEATHER[weather].grey;
 const tint=(v:V3,k:[number,number,number])=>{const l=(v.x+v.y+v.z)/3;v.set((v.x+(l-v.x)*grey)*k[0],(v.y+(l-v.y)*grey)*k[1],(v.z+(l-v.z)*grey)*k[2]);};
 tint(u.uUwShallow.value,m.shallow);tint(u.uUwDeep.value,m.deep);u.uUwClear.value*=m.clear;
 return m;
}
/** Agent A's hook (fishingVisuals.ts, right after applyReefWater): the live time of day and today's weather. */
export const applyLiveWaterMood=(u:Parameters<typeof applyWaterMood>[0])=>applyWaterMood(u,readTimeOfDay(),readWeather());
