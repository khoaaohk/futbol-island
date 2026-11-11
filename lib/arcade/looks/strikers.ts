import * as T from 'three';
import type {ArcadeStageKit,ArcadeEnvironment,ArcadeStageLook} from './stageLook';

/** Island Strikers stage look, passed to createArcadeStage() by lib/arcade/strikerScene.ts. Owned by the Island Strikers builder.
 * Arcade AAA pass 1 (Nov 10 2026, docs/arcade-aaa/strikers-direction.md): a floodlit night match on live TV. Nothing is shared with
 * the neon cabinet any more. The stadium itself (turf, bowl, crowd, boards, towers) is built by lib/arcade/strikerStadium.ts, so the
 * environment here is an empty group. Heat: the shadow pass is OFF (`shadows:false`): floodlit bodies throw four soft shadows, which
 * the stadium draws as one instanced mesh, and every body is drawn once instead of twice. */
function nightEnvironment(kit:ArcadeStageKit):ArcadeEnvironment{const scenery=new T.Group();scenery.name='striker-night';kit.scene.add(scenery);return{scenery,dispose(){}};}
/** Kit and prop colours are used as written (no palette remap); nothing in the stage glows on its own. */
const plain=(color:string)=>color,never=()=>false;
export const strikersLook:ArcadeStageLook={
 id:'live',
 renderer:{antialias:true,powerPreference:'low-power',pixelRatioCap:{mobile:1.5,desktop:2},shadows:false,shadowType:T.PCFSoftShadowMap,toneMapping:T.ACESFilmicToneMapping,exposure:1.04},
 background:'#05070d',
 fog:{color:'#070b14',near:52,far:115},
 camera:{fov:38,near:.1,far:180},
 // Cool floodlight from above, green bounce off the grass from below.
 hemi:{sky:'#eef3ff',ground:'#2f6a3c',intensity:1.5},
 sun:{color:'#f4f7ff',intensity:1.85,position:[-5,30,16],shadowMapSize:{mobile:16,desktop:16},frustum:{left:-1,right:1,top:1,bottom:-1,near:1,far:2},normalBias:0,bias:0,radius:1},
 surface:{color:plain,emissive:never,roughness:.74,emissiveIntensity:0},
 ball:{base:'#fbfbf6',patch:'#14171c'},
 sparks:{color:'#fff3c2'},
 environment:nightEnvironment,
};
