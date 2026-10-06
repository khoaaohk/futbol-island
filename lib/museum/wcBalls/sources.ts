import {ballDesign,ballDecals} from './designs';
import {BALL_MODELS} from './models';
import type {BallSource} from './ballViewer';
/** Everything the viewer needs for one ball: design, printed decals and (when licensed) its 3D model. */
export function ballSource(id:string):BallSource{return {id,glsl:ballDesign(id),decals:ballDecals(id),model:BALL_MODELS[id]};}
