import {createTennisGame} from './games/tennisGame';
import {createPinballGame} from './games/pinballGame';
import {createRunnerGame3d} from './games/runnerGame3d';
import type {ArcadeKind} from './arcadeGameTypes';
export type {ArcadeKind,ArcadeInput,ArcadeHUD} from './arcadeGameTypes';

/** The three cabinet games behind one API (COORDINATOR FILE). Each game is its own factory in lib/arcade/games/ with its own
 * stage look in lib/arcade/looks/; this file only dispatches. Before Nov 10 2026 all three were interleaved here. */
export function createArcadeGame(canvas:HTMLCanvasElement,kind:ArcadeKind,onSound:(goal:boolean,cue?:string)=>void,audioContext:()=>AudioContext|null=()=>null){
 return kind==='tennis'?createTennisGame(canvas,onSound,audioContext):kind==='pinball'?createPinballGame(canvas,onSound,audioContext):createRunnerGame3d(canvas,onSound,audioContext);
}
