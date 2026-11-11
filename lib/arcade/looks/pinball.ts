import * as T from 'three';
import type {ArcadeStageKit,ArcadeEnvironment,ArcadeStageLook} from './stageLook';
import {COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {comicLook} from '../comic/look';
import {COMIC_COAST} from '../comic/backdrop';

/** Futbol Pinball stage look, passed to createArcadeStage() by lib/arcade/games/pinballGame.ts.
 * Owned by the Futbol Pinball builder. Direction (docs/arcade-aaa/pinball-direction.md): "The Beach Board", a pinball pitch-board on
 * the Breakaway coast at golden hour, printed like a comic page (the arcade house style, lib/arcade/comic/README.md). Colours are
 * flat print colours: the comic shading pass in the scene's materials cuts them into a warm light band and a violet shadow band, so
 * nothing is tone mapped, nothing is emissive and no light is ever dimmed (the page's beats tint the two bands instead). */

/** Lit print colours: a lit insert is one of these as flat colour with a Ben-Day ring (soccerPinballCabinet.ts printLampMaterial).
 * amber = left foot, blue = right foot, red = the box / danger (the teaching read colours). */
export const PINBALL_BULBS={white:'#fff1b0',amber:'#ffc83a',red:'#f0452e',green:'#3fcf7a',blue:'#4aa3e8'} as const;
export const PINBALL_INK={
 ink:COMIC_INK,paper:COMIC_PAPER,
 // The pitch print: two mown bands, the halftone shade, paper lines.
 turf:'#57b56a',turfMown:'#49a660',turfShade:'#3b8f55',line:COMIC_PAPER,
 // The board round it: sand deck, red-and-white kerb, rails and posts in paper, rubbers in tackle red.
 deck:'#f4d08c',deckShade:'#e7c27e',kerbRed:'#f0452e',kerbWhite:'#fff3d6',rail:'#fff3d6',post:'#ff8a3c',rubber:'#f0452e',wood:'#b5834f',
 sun:'#ffc83a',orange:'#ff8a3c',red:'#f0452e',teal:'#19b5a5',blue:'#2f6fb0',violet:'#8f78b8',
 // The coast (Breakaway's): sand, foam, sea.
 sand:'#f4d08c',sandShade:'#e7c27e',foam:'#fffaf0',seaNear:COMIC_COAST.seaNear,seaFar:COMIC_COAST.seaFar,palm:'#2f8a5a',palmLight:'#3f9f5f',trunk:'#b5834f',whitewash:'#fff0dc',terracotta:'#d9623b',
} as const;

/** The scene builds the whole world (board, beach, sea, painted horizon: lib/games/soccerPinballCabinet.ts) because every material
 * shares the game's one comic uniform set; the look's environment is only the scenery group the stage expects. */
function pinballCoast(kit:ArcadeStageKit):ArcadeEnvironment{const scenery=new T.Group();scenery.name='pinball-coast';kit.scene.add(scenery);return{scenery,dispose(){}};}

/** The comic base (print renderer with powerPreference:'low-power', pixel ratio cap 1.5 on phones, no tone mapping, a white sun and
 * a neutral fill: lib/arcade/comic/look.ts) plus this game's lens and sun. The sun is 22 degrees up, beyond the goal and to the
 * left, so every post, bumper and figure throws a long violet shadow down the pitch toward the flippers. */
export const pinballLook:ArcadeStageLook=comicLook({
 id:'pinball',
 background:COMIC_COAST.top,
 // No haze: print colour stays flat to the horizon.
 fog:{color:COMIC_COAST.haze,near:400,far:900},
 camera:{fov:38,near:.1,far:260},
 sun:{position:[-13,8.4,-16],shadowMapSize:{mobile:1024,desktop:2048},frustum:{left:-13,right:13,top:15,bottom:-15,near:1,far:70},normalBias:.03,bias:-.0004,radius:1.6},
 ball:{base:'#fffaf0',patch:COMIC_INK},
 environment:pinballCoast,
});
