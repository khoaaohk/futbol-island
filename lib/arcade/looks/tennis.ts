import type {ArcadeStageLook,ArcadeStageKit,ArcadeEnvironment} from './stageLook';
import {comicLook} from '../comic/look';
import {createTennisWorld} from '../tennisWorld';

/** Futbol Tennis stage look ("Club Marea, printed", Nov 10 2026; docs/arcade-aaa/tennis-direction.md): the beach club in the
 * arcade's comic house style. Passed to createArcadeStage() by lib/arcade/games/tennisGame.ts. The world itself (sky panel, banded
 * sea, sand, court sheet, net, club, wind) is lib/arcade/tennisWorld.ts; each tour stop moves the sun and swaps the panel's
 * palette from lib/arcade/tennisVenues.ts. The comic base (lib/arcade/comic/look.ts) supplies the print renderer (no tone mapping),
 * the white sun, the neutral fill and the heat rules: low-power context, 1.5 mobile pixel-ratio cap, one shadow-casting sun, no
 * postprocessing. */
function tennisEnvironment(kit:ArcadeStageKit):ArcadeEnvironment{
 const world=createTennisWorld(kit);world.group.userData.tennisWorld=world;
 return{scenery:world.group,dispose(){world.dispose();}};
}
export const tennisLook:ArcadeStageLook=comicLook({
 id:'tennis',
 background:'#ffe9b8',
 // The printed horizon replaces depth haze: the fog is parked beyond the far plane.
 fog:{color:'#ffe9b8',near:400,far:500},
 camera:{fov:38,near:.5,far:220},
 // A low sun ahead of the camera (the venue re-aims it); a tight frustum around the court and its near surroundings.
 sun:{position:[-16,11,-22],shadowMapSize:{mobile:1024,desktop:2048},frustum:{left:-17,right:17,top:19,bottom:-19,near:1,far:90},normalBias:.03,bias:-.0004,radius:1.6},
 ball:{base:'#fff3d6',patch:'#231a2e'},
 environment:tennisEnvironment,
});
