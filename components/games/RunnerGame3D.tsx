'use client';
// Nov 11 2026 (slow-connection loading, docs/qa/arcade-load-after.md): the runner cabinet's own entry, so its chunk carries only its own
// scene factory; the shared shell (cards, HUD, input) is ArcadeGame3D. Loaded by components/ArcadeRoom.tsx with next/dynamic.
import ArcadeGame3D from './ArcadeGame3D';
import {createRunnerGame3d} from '@/lib/arcade/games/runnerGame3d';
export default function RunnerGame3D({onExit}:{kind?:string;onExit:()=>void}){return <ArcadeGame3D kind="runner" create={createRunnerGame3d} onExit={onExit}/>;}
