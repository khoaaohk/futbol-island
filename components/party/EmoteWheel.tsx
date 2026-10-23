'use client';
import { useRef } from 'react';
import { LOCAL_EMOTES, wheelEmotesFor } from '@/lib/town/emoteReact';
import { ctxWheelFor, type EmoteContext } from '@/lib/town/emoteContexts';
import { npcWheelFor, type NpcSetKind } from '@/lib/town/npcEmoteSets';
import { moveWheel } from '@/lib/town/moveEmotes';
import { Glyph } from './PartyChip';

/** The ten preset emotes (no free text anywhere). Order matches the wheel; the first five show, the rest scroll in. Closes itself on a pick. */
export const EMOTES = LOCAL_EMOTES;

/** A row of five big round picture buttons beside the Emote button, with arrows (and swipe / wheel) to scroll through the rest
 * (styles: app/globals.css `.emote-wheel`). */
/** Pass it (6) and Juggle with me (3) on the ground wheel: greyed while the nearest friend said No twice in a row (relay v1.4 asks). */
const ASK_IDS = new Set([3, 6]);
export default function EmoteWheel({ onPick, onClose, ride = 'walk', ctx = 'ground', npcKind = '', askBlocked = false }: { onPick: (e: number) => void; onClose: () => void; ride?: string; ctx?: EmoteContext; npcKind?: NpcSetKind | ''; askBlocked?: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  const page = (dir: 1 | -1) => { const s = strip.current; if (s) s.scrollBy({ left: dir * s.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  return (
    <div className="emote-wheel" role="group" aria-label="Emotes" data-emote-wheel data-emote-ctx={ctx} data-emote-npc={npcKind || undefined}>
      <button type="button" className="emote-wheel-arrow" aria-label="Earlier emotes" onClick={() => page(-1)}>‹</button>
      <div className="emote-wheel-strip" ref={strip}>
        {(ctx === 'move' ? moveWheel() : ctx !== 'ground' ? ctxWheelFor(ctx) : npcKind ? npcWheelFor(npcKind) : wheelEmotesFor(ride)).map((x) => { const off = askBlocked && ctx === 'ground' && !npcKind && ASK_IDS.has(x.emote); return (
          <button key={x.emote} type="button" className="emote-wheel-btn" aria-label={x.label} title={off ? 'Try again in a bit' : x.label} aria-disabled={off || undefined}
            disabled={off} data-ask-blocked={off ? '' : undefined} style={off ? { opacity: .42, filter: 'grayscale(1)' } : undefined} onClick={() => { if (off) return; onPick(x.emote); onClose(); }}>
            <Glyph name={x.icon} size={26} />
          </button>); })}
      </div>
      <button type="button" className="emote-wheel-arrow" aria-label="More emotes" onClick={() => page(1)}>›</button>
    </div>
  );
}
