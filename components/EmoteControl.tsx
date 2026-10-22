'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import EmoteWheel from '@/components/party/EmoteWheel';
import { Glyph } from '@/components/party/PartyChip';
import { emoteBus } from '@/lib/town/emoteReact';
import { emoteButtonState, emoteCtxStore } from '@/lib/town/emoteContexts';

/**
 * The island's Emote button (user, Oct 22 2026): ALWAYS in the 2x2 action grid (Fly top-left, Emote top-right), with or without
 * a party. Rendered as a direct child of `.travel-actions` (Town.tsx), so it hides with the other action buttons (lessons,
 * fishing, job camera). Pressing it opens a wheel of four round picture buttons upward; a pick goes to Town's handler through
 * `emoteBus` (plays on you, goes to friends when a party is live, and wakes the nearest townsperson).
 */
export default function EmoteControl({ ride = 'walk' }: { ride?: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLSpanElement>(null);
  const view = useSyncExternalStore(emoteCtxStore.subscribe, emoteCtxStore.get, emoteCtxStore.server);
  const state = emoteButtonState(view); // flying alone = disabled; flying with a friend / swimming = their own wheel (lib/town/emoteContexts.ts)
  const shown = open && !state.disabled;
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={box} className="emote-control">
      <button type="button" className="touch-emote" data-emote-btn data-emote-ctx={state.ctx} aria-label="Emotes" title={state.disabled ? state.why : 'Emotes'} aria-disabled={state.disabled || undefined} data-disabled={state.disabled ? '' : undefined} aria-expanded={open} aria-haspopup="true" onClick={() => { if (!state.disabled) setOpen((o) => !o); }}>
        <Glyph name="hand" size={32} />
      </button>
      {shown && <EmoteWheel ride={ride} ctx={state.ctx} onPick={(e) => { emoteBus.fire(e); }} onClose={() => setOpen(false)} />}
    </span>
  );
}
