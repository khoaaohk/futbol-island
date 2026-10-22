/**
 * Which move a multi-move emote picked (Oct 22 2026, Phase B of docs/analytics-multiplayer-plan.md §5). The graphics pick the move
 * lazily, on the emote's first pose frame (lib/graphics/dancePose.ts pickMove, bodyEmotePose.ts), so they report it here and
 * Town.tsx, the only listener, turns the local player's picks into em: counts. This module imports nothing (the graphics stay
 * free of analytics): one function slot, called once per emote start, never per frame.
 */
export type EmoteVariantPick='dance'|'show'|'react'|'wave'|'cheer'|'laugh';
type Listener=(family:EmoteVariantPick,index:number,root:unknown)=>void;
let listener:Listener|null=null;
/** Town sets this while the island is mounted (null clears it). */
export function onEmoteVariant(fn:Listener|null){listener=fn;}
/** A new move started on `root` (the actor's root object; the listener keeps only the local player's). */
export function emitEmoteVariant(family:EmoteVariantPick,index:number,root:unknown){if(listener)listener(family,index,root);}
/** The body emotes with variants (lib/town/emoteBody.ts BODY_VARIANTS keys: wave 0, cheer 1, laugh 7). */
export const BODY_VARIANT_FAMILY:Readonly<Record<number,EmoteVariantPick>>={0:'wave',1:'cheer',7:'laugh'};
