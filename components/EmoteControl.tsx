'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import EmoteWheel from '@/components/party/EmoteWheel';
import { Glyph } from '@/components/party/PartyChip';
import { emoteBus } from '@/lib/town/emoteReact';
import { emoteButtonState, emoteCtxStore } from '@/lib/town/emoteContexts';
import { countEmoteUi } from '@/lib/analytics/emoteEvents';

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
  const hidden = state.hidden; // nobody to emote with: the cell stays reserved, the button just fades out (lib/town/emoteContexts.ts)
  const shown = open && !hidden;
  useEffect(() => { if (hidden) setOpen(false); }, [hidden]); // the last candidate left while the wheel was open
  // Analytics (docs/analytics-multiplayer-plan.md §5): the button seen (once per visit), the wheel opened, closed with no pick.
  useEffect(() => { if (!hidden) countEmoteUi('btn'); }, [hidden]);
  const picked = useRef(false);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (shown && !wasOpen.current) { picked.current = false; countEmoteUi('wheel'); }
    if (!shown && wasOpen.current && !picked.current) countEmoteUi('wheel_close');
    wasOpen.current = shown;
  }, [shown]);
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={box} className="emote-control">
      <button type="button" className="touch-emote" data-emote-btn data-emote-ctx={state.ctx} aria-label="Emotes" title="Emotes" aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : undefined} data-hidden={hidden ? '' : undefined} aria-expanded={open} aria-haspopup="true" onClick={() => { if (!hidden) setOpen((o) => !o); }}>
        <Glyph name="hand" size={32} />
      </button>
      {shown && <EmoteWheel ride={ride} ctx={state.ctx} npcKind={view.npcKind} askBlocked={!!view.askBlocked} onPick={(e) => { picked.current = true; emoteBus.fire(e); }} onClose={() => setOpen(false)} />}
    </span>
  );
}
