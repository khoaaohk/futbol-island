import * as T from 'three';
import type {ArcadeStageKit,ArcadeEnvironment,ArcadeStageLook} from './stageLook';
import {COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {comicLook} from '../comic/look';
import {COMIC_COAST} from '../comic/backdrop';

/** Pass Puzzles stage look, passed to createArcadeStage() by lib/arcade/passPuzzleScene.ts.
 * Owned by the Pass Puzzles builder. Direction (docs/arcade-aaa/puzzle-direction.md): "The Tactics Pitch", a comic-print training
 * pitch on the Breakaway coast at golden hour (the arcade house style, lib/arcade/comic/README.md). Colours are flat print colours:
 * the comic shading pass in the scene's materials cuts them into a light band and a violet shadow band, so nothing here is lit
 * "realistically" and nothing is tone mapped. 1 world unit is 1 m of pitch; the players are drawn big, like counters. */
export const PITCH={
 ink:COMIC_INK,card:COMIC_PAPER,
 // Ground: the mown pitch (two printed bands), the verge round it, the beach, the surf and the sea (Breakaway's coast colours).
 turf:'#57b56a',turfMown:'#49a660',turfWet:'#2f9a86',turfWetMown:'#278a7a',verge:'#86c867',vergeWet:'#5fb08a',line:COMIC_PAPER,
 sand:'#f4d08c',sandShade:'#e7c27e',foam:'#fffaf0',seaNear:COMIC_COAST.seaNear,seaFar:COMIC_COAST.seaFar,glitter:COMIC_COAST.glitter,
 // Teams: attack is the sun yellow, defence the shutter blue, the keeper the tackle red (signals read by shape first, colour second).
 attack:'#ffc83a',attackDark:'#e0721e',defend:'#2f6fb0',defendDark:'#1d3f78',keeper:'#f0452e',keeperDark:'#8f2a3a',skin:'#f4b98c',hair:'#4a2f3a',
 // Ink marks on the pitch (the atlas keeps the dark ink edge; these tint the brush core).
 mark:COMIC_PAPER,markClear:'#d6ffd0',markTight:'#ffc83a',markBlocked:'#ff5a3c',markRun:'#8fe4ff',markGold:'#ffd45c',markViolet:'#d9bcff',
 red:'#f0452e',teal:'#19b5a5',sun:'#ffc83a',orange:'#ff8a3c',blue:'#2f6fb0',whitewash:'#fff0dc',terracotta:'#d9623b',palm:'#2f8a5a',palmLight:'#3f9f5f',palmShade:'#27765a',trunk:'#b5834f',trunkLight:'#c79763',
} as const;

/** The ground (sand, surf, sea) is drawn this far under the pitch lines. */
export const GROUND_Y=-.06;
/** Deterministic noise for every painted canvas and prop layout of this game (no Math.random: the same pitch every visit). */
export function pitchRandom(seed:number){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>{s=s*16807%2147483647;return(s-1)/2147483646;};}

/** The scene builds the whole world per level (one merged pitch-side mesh: lib/arcade/puzzleComic.ts), so the look's environment is
 * only the empty scenery group the stage expects. */
function pitchEnvironment(kit:ArcadeStageKit):ArcadeEnvironment{const scenery=new T.Group();scenery.name='puzzle-pitch-scenery';kit.scene.add(scenery);return{scenery,dispose(){}};}

/** The comic base (print renderer with no tone mapping, white sun, neutral fill) plus this game's lens and sun. The scene re-aims
 * the sun per board so it always sits low, far and to the left of the view: every player throws a long shadow toward the coach. */
export const PUZZLE_SUN={/** Elevation above the pitch (radians): low, for long golden-hour shadows. */elevation:.42,/** How far left of straight ahead (radians). */azimuth:.62,distance:120};
export const puzzleLook:ArcadeStageLook=comicLook({
 id:'puzzle',
 background:COMIC_COAST.top,
 // No haze: print colour stays flat to the horizon (the scene pushes the fog range past everything it draws).
 fog:{color:COMIC_COAST.haze,near:600,far:1400},
 camera:{fov:34,near:.5,far:520},
 sun:{position:[80,48,56],shadowMapSize:{mobile:1024,desktop:2048},frustum:{left:-52,right:52,top:56,bottom:-56,near:10,far:300},normalBias:.05,bias:-.0004,radius:2.2},
 ball:{base:'#fffaf0',patch:'#2b2036'},
 environment:pitchEnvironment,
});
