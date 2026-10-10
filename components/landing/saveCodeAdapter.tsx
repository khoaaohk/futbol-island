'use client';
import type {ComponentProps} from 'react';
import RealCreate from '@/components/saves/SaveCodeCreate';
import RealRestore from '@/components/saves/SaveCodeRestore';
import {markReloadHandoff} from './handoffMotion';
import {HANDOFF_ENABLED} from './PlayButton';

/**
 * The ONE place the title screen (`/`) gets save codes from (Oct 9 2026). It uses the save-code agent's real API
 * (lib/saves/client.ts and components/saves/*, docs/accounts-design.md) in its REQUIRED mode (a code is needed to play) and holds
 * no save logic of its own. Loaded on demand by TitleActions.
 *  - <SaveCodeCreate>: makes the code at once (autoStart: the title screen's Start was the tap), shows it with the photo / print
 *    prompts and the "Which word comes first?" check, then "I saved it" → onDone(code). Saving down → onDone(null) / phase.
 *  - <SaveCodeRestore>: word boxes → "Welcome back!" → its Play applies the save and reloads THIS page (`/`). The reload lands in
 *    the game (WaterPill marks the tab as in the game first, lib/rootView.ts). The address is reset to a bare `/` before it
 *    (history.replaceState), so a ?coffee=thanks is not counted again.
 */
export {isSavingAvailable,getLocalCode} from '@/lib/saves/client';
import {startCreatePhase,startRestorePhase,trackStart} from '@/lib/analytics/startEvents';
type CreateProps=ComponentProps<typeof RealCreate>;type RestoreProps=ComponentProps<typeof RealRestore>;
/** onBack (Oct 9 2026): the code's footer row carries Back (bottom left), "Print code" and "I saved it". */
export function SaveCodeCreate({onDone,onPhase,onHaveCode,onBack}:Pick<CreateProps,'onDone'|'onPhase'|'onHaveCode'|'onBack'>){
 return <RealCreate required autoStart onBack={onBack} onDone={c=>{if(c)trackStart('st:saved');onDone(c);}} onPhase={p=>{startCreatePhase(p);onPhase?.(p);}} onHaveCode={onHaveCode}/>;
}
/** onPlay (Oct 9 2026): the restore's Play hands `apply` to the title screen, which runs the water loader first; apply() then
 *  applies the save, whose reload lands in the game. Counted first, then the address is reset to `/`. Without onPlay: the old
 *  immediate reload. */
export function SaveCodeRestore({onDone,onPhase,onCancel,onPlay}:Pick<RestoreProps,'onDone'|'onPhase'|'onCancel'|'onPlay'>){
 return <RealRestore required onPhase={p=>{startRestorePhase(p);onPhase?.(p);}} onCancel={onCancel}
  onPlay={onPlay}
  onDone={restored=>{if(restored)trackStart('st:play_restored');if(restored){window.history.replaceState(window.history.state,'','/');if(HANDOFF_ENABLED)markReloadHandoff();}onDone(restored);}}/>;
}
