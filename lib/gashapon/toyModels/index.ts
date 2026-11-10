/**
 * The toy model registry (round 3A, Nov 8 2026). One file per machine, `lib/gashapon/toyModels/<machine-id>.ts`, default-
 * exporting a `ToyModelSet` (toy id → builder, lib/gashapon/toyKit.ts). A toy with no builder gets the generic capsule figure
 * (./generic.ts), so all 84 always open. To add a machine: write its file and add one line to MODELS below.
 */
import {createToyKit,type ToyBuilder,type ToyModelSet,type ToyRig} from '../toyKit';
import {gashaponToy,type GashaponToy} from '../toys';
import type {GashaponMachineId} from '../machines';
import {genericToy} from './generic';
import squareSnacks from './gs-square-snacks';
import squareLucky from './gs-square-lucky';
import caySweets from './gs-cay-sweets';import cayBento from './gs-cay-bento';import arcadeHeroes from './gs-arcade-heroes';
import eleven from './gs-eleven';import oldtown from './gs-oldtown';import jetty from './gs-jetty';
import arcadePixel from './gs-arcade-pixel';import westbeach from './gs-westbeach';import northbeach from './gs-northbeach';
import cayplaza from './gs-cayplaza';import sharks from './gs-sharks';import summit from './gs-summit';

const MODELS:Partial<Record<GashaponMachineId,ToyModelSet>>={
 'gs-square-snacks':squareSnacks,
 'gs-square-lucky':squareLucky,
 'gs-cay-sweets':caySweets,'gs-cay-bento':cayBento,'gs-arcade-heroes':arcadeHeroes,
 'gs-eleven':eleven,'gs-oldtown':oldtown,'gs-jetty':jetty,// Nov 8 2026: Boots & Kits, Trophies & Legends, Rides & Rollers
 'gs-arcade-pixel':arcadePixel,'gs-westbeach':westbeach,'gs-northbeach':northbeach,// Nov 8 2026: Pixel Pitch, Beach Day, Shell Seekers
 'gs-cayplaza':cayplaza,'gs-sharks':sharks,'gs-summit':summit,// Nov 8 2026: Bug Squad, Reef Friends, Summit Orchard (the last three: all 84 built)
};
/**
 * Machines rebuilt with the round 3B HD kit (physical finishes, more segments, shadows, soft body and toy kinds; Nov 9 2026).
 * The rollout adds a machine here when its file is rebuilt (lib/gashapon/toyKinds.ts KIND_LIVE lists the same machines).
 */
export const HD_MACHINES:ReadonlySet<GashaponMachineId>=new Set<GashaponMachineId>(['gs-square-snacks','gs-cay-sweets','gs-cay-bento','gs-summit','gs-eleven','gs-oldtown','gs-jetty','gs-square-lucky','gs-northbeach','gs-sharks','gs-cayplaza','gs-arcade-heroes','gs-arcade-pixel','gs-westbeach']);
/** The builder for a toy, and whether it is the generic fallback. */
export function toyBuilder(toy:GashaponToy):{build:ToyBuilder;generic:boolean}{const own=MODELS[toy.machine]?.[toy.id];return own?{build:own,generic:false}:{build:genericToy,generic:true};}
export const builtToyIds=():string[]=>Object.values(MODELS).flatMap(set=>Object.keys(set??{}));
/** Build a toy's rig (meshes, parts, behaviour). The caller owns it: `rig.dispose()`. Null for an unknown id. */
export function buildToy(id:string):ToyRig|null{
 const toy=gashaponToy(id);if(!toy)return null;const {build,generic}=toyBuilder(toy),k=createToyKit(toy,{hd:!generic&&HD_MACHINES.has(toy.machine)});
 let behaviour;try{behaviour=build(k);}catch(err){console.warn('toy builder failed, using the generic figure',id,err);const g=createToyKit(toy);return g.finish(genericToy(g));}
 return k.finish(behaviour);
}
