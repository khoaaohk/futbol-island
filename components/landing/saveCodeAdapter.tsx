'use client';
import type {ComponentProps} from 'react';
import RealCreate from '@/components/saves/SaveCodeCreate';
import RealRestore from '@/components/saves/SaveCodeRestore';
import {markReloadHandoff} from './handoffMotion';
import {HANDOFF_ENABLED} from './PlayButton';

/**
 * The ONE place the /start title screen gets save codes from (Oct 9 2026). It uses the save-code agent's real API
 * (lib/saves/client.ts and components/saves/*, docs/accounts-design.md) in its REQUIRED mode (a code is needed to play) and holds
 * no save logic of its own. Loaded on demand by TitleActions.
 *  - <SaveCodeCreate>: makes the code at once (autoStart: the title screen's Start was the tap), shows it with the photo / print
 *    prompts and the "Which word comes first?" check, then "I saved it" → onDone(code). Saving down → onDone(null) / phase.
 *  - <SaveCodeRestore>: word boxes → "Welcome back!" → its Play applies the save and reloads THIS page. On /start that reload must
 *    land in the game, so the address is moved to `/` first (history.replaceState); the reload then loads the restored island, and
 *    the game's loader starts settled (markReloadHandoff → IslandLoading). The restore's Play reloads at once, so the animated
 *    hand-off (handoffMotion.ts) cannot run first; that needs a deferred-play option on SaveCodeRestore (asked of the save agent).
 */
export {isSavingAvailable,getLocalCode} from '@/lib/saves/client';
import {startCreatePhase,startRestorePhase,trackStart} from '@/lib/analytics/startEvents';
type CreateProps=ComponentProps<typeof RealCreate>;type RestoreProps=ComponentProps<typeof RealRestore>;
export function SaveCodeCreate({onDone,onPhase,onHaveCode}:Pick<CreateProps,'onDone'|'onPhase'|'onHaveCode'>){
 return <RealCreate required autoStart onDone={c=>{if(c)trackStart('st:saved');onDone(c);}} onPhase={p=>{startCreatePhase(p);onPhase?.(p);}} onHaveCode={onHaveCode}/>;
}
/** onPlay (Oct 9 2026): the restore's Play hands `apply` to the title screen, which runs the water loader first; apply() then
 *  applies the save, whose reload lands in the game (the address already moved to `/` on Play). Without onPlay: the old immediate
 *  reload. */
export function SaveCodeRestore({onDone,onPhase,onCancel,onPlay}:Pick<RestoreProps,'onDone'|'onPhase'|'onCancel'|'onPlay'>){
 return <RealRestore required onPhase={p=>{startRestorePhase(p);onPhase?.(p);}} onCancel={onCancel}
  onPlay={onPlay}
  onDone={restored=>{if(restored)trackStart('st:play_restored');if(restored){window.history.replaceState(window.history.state,'','/');if(HANDOFF_ENABLED)markReloadHandoff();}onDone(restored);}}/>;
}
