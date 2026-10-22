'use client';
import { useRef } from 'react';
import { LOCAL_EMOTES, type LocalEmote } from '@/lib/town/emoteReact';
import { Glyph } from './PartyChip';

/** The ten preset emotes (no free text anywhere). Order matches the wheel; the first five show, the rest scroll in. Closes itself on a pick. */
export const EMOTES = LOCAL_EMOTES;

/** A row of five big round picture buttons beside the Emote button, with arrows (and swipe / wheel) to scroll through the rest
 * (styles: app/globals.css `.emote-wheel`). */
export default function EmoteWheel({ onPick, onClose }: { onPick: (e: LocalEmote) => void; onClose: () => void }) {
  const strip = useRef<HTMLDivElement>(null);
  const page = (dir: 1 | -1) => { const s = strip.current; if (s) s.scrollBy({ left: dir * s.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
  return (
    <div className="emote-wheel" role="group" aria-label="Emotes" data-emote-wheel>
      <button type="button" className="emote-wheel-arrow" aria-label="Earlier emotes" onClick={() => page(-1)}>‹</button>
      <div className="emote-wheel-strip" ref={strip}>
        {EMOTES.map((x) => (
          <button key={x.emote} type="button" className="emote-wheel-btn" aria-label={x.label} title={x.label} onClick={() => { onPick(x.emote); onClose(); }}>
            <Glyph name={x.icon} size={26} />
          </button>
        ))}
      </div>
      <button type="button" className="emote-wheel-arrow" aria-label="More emotes" onClick={() => page(1)}>›</button>
    </div>
  );
}
