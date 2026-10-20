/**
 * Wild bugs on Summit Isle (Oct 20 2026; rules and caps: wildBugsCore.ts). Since the Bug flight pass the wild bugs ARE the bug
 * swarm (lib/graphics/bugSwarm.ts): the 20 species of lib/town/jobs/bugSpecies.ts at their island homes by Day / Sunset, the
 * eight firefly calls at Night, each with its own model (bugModels.ts) and movement (bugFlight.ts). Run past one and it flits
 * away (counted with countWildFlutter(), the first time in a visit IslandJobs shows where bugs are caught); sneak up slowly and
 * common bugs let you get close. Town drives update() every frame and hides it while a bug job runs (`busy`) until the job
 * catches from the swarm itself (query / startle / catch / position, see bugSwarm.ts).
 */
import * as T from 'three';
import {fieldSurfaceHeight} from '../town/venues';
import {createBugSwarm,type SwarmFrame} from './bugSwarm';

export type WildBugFrame=SwarmFrame;
export function createWildBugs(scene:T.Scene,floor:(x:number,z:number)=>number=fieldSurfaceHeight,seed?:number){
 return createBugSwarm(scene,{floor,seed});
}
export type WildBugs=ReturnType<typeof createWildBugs>;
