'use client';
import { Emote } from '../../multiplayer/protocol';
import { Glyph } from './PartyChip';
import styles from './party.module.css';

/** The six preset emotes (no free text anywhere). Order matches the protocol. */
export const EMOTES: { emote: Emote; icon: string; label: string }[] = [
  { emote: Emote.Wave, icon: 'hand', label: 'Wave' },
  { emote: Emote.Cheer, icon: 'star', label: 'Cheer' },
  { emote: Emote.HighFive, icon: 'handshake', label: 'High five' },
  { emote: Emote.PassToMe, icon: 'ball', label: 'Pass to me' },
  { emote: Emote.Space, icon: 'move', label: 'Space' },
  { emote: Emote.WellPlayed, icon: 'heart', label: 'Well played' },
];

/** A row of six big picture buttons. Closes itself on a pick. */
export default function EmoteWheel({ onPick, onClose }: { onPick: (e: Emote) => void; onClose: () => void }) {
  return (
    <div className={styles.emotes} role="group" aria-label="Emotes" data-emote-wheel>
      {EMOTES.map((x) => (
        <button key={x.emote} type="button" className={styles.round} aria-label={x.label} title={x.label} onClick={() => { onPick(x.emote); onClose(); }}>
          <Glyph name={x.icon} size={24} />
        </button>
      ))}
    </div>
  );
}
