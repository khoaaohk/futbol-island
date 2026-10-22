'use client';
import { LOCAL_EMOTES, type LocalEmote } from '@/lib/town/emoteReact';
import { Glyph } from './PartyChip';

/** The four preset emotes (no free text anywhere; Wave, High five, Cheer, Well played). Order matches the wheel. Closes itself on a pick. */
export const EMOTES = LOCAL_EMOTES;

/** A small row of four big round picture buttons that opens upward from the Emote button (styles: app/globals.css `.emote-wheel`). */
export default function EmoteWheel({ onPick, onClose }: { onPick: (e: LocalEmote) => void; onClose: () => void }) {
  return (
    <div className="emote-wheel" role="group" aria-label="Emotes" data-emote-wheel>
      {EMOTES.map((x) => (
        <button key={x.emote} type="button" className="emote-wheel-btn" aria-label={x.label} title={x.label} onClick={() => { onPick(x.emote); onClose(); }}>
          <Glyph name={x.icon} size={26} />
        </button>
      ))}
    </div>
  );
}
