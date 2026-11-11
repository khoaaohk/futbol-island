import * as T from 'three';
import type {ArcadeEnvironment,ArcadeStageKit,ArcadeStageLook} from './stageLook';
import {COMIC_INK,COMIC_PAPER} from '../comic/shading';
import {comicLook} from '../comic/look';

/** Breakaway Run stage look (docs/arcade-aaa/runner-direction.md): a golden-hour coast road printed like a comic page.
 * Owned by the Breakaway Run builder. Nothing here comes from the neon cabinet: the route (lib/arcade/runnerTrack.ts) builds the
 * whole world (one terrain + sea mesh, one sky dome, instanced props), so the environment is only the empty scenery group the
 * stage scrolls. Heat rules kept: low-power context, pixel ratio 1.5 on phones, one shadow-casting sun, no post pass.
 * No tone mapping: the comic shading pass in runnerTrack quantises light into flat print colours, so nothing may wash out. */
export const RUNNER_INK=COMIC_INK,RUNNER_PAPER=COMIC_PAPER;
function coastEnvironment(kit:ArcadeStageKit):ArcadeEnvironment{const scenery=new T.Group();scenery.name='runner-coast-scenery';kit.scene.add(scenery);return{scenery,dispose(){}};}
/** The comic base (lib/arcade/comic/look.ts: print renderer with no tone mapping, white sun, neutral fill, flat surfaces) plus the coast road's own sky, lens, sun placement and ball. */
export const runnerLook:ArcadeStageLook=comicLook({
 id:'runner',
 background:'#ffcf7a',
 fog:{color:'#ffcf7a',near:60,far:150},
 camera:{fov:38,near:.1,far:320},
 // Low sun ahead-left; runnerWeather re-aims it every frame as the route turns. The frustum is a long strip down the road.
 sun:{position:[-13,9,-56],shadowMapSize:{mobile:1024,desktop:2048},frustum:{left:-22,right:22,top:20,bottom:-16,near:1,far:150},normalBias:.03,bias:-.0004,radius:2.2},
 // Ball colours are unique to the ball on purpose: runnerTrack marks these two materials for the rim-and-ink treatment.
 ball:{base:'#fffaf0',patch:'#2b2036'},
 environment:coastEnvironment,
});
