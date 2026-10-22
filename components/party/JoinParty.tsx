'use client';
import { useState } from 'react';
import { CODE_LENGTH } from '../../multiplayer/protocol';
import { NOT_IN_CODES_HINT } from '@/lib/multiplayer/invite';
import CodeBoxes from './CodeBoxes';
import AnimalPicker from './AnimalPicker';
import NickField from './NickField';
import styles from './party.module.css';

/**
 * Join with a code: six single-character boxes (CodeBoxes), nothing else is typed. Only the code alphabet is accepted (upper-cased);
 * any other character shows a gentle hint and is never guessed at (no O -> 0).
 */
export default function JoinParty({ initial = '', message, busy, onJoin, onClose }: { initial?: string; message?: string | null; busy?: boolean; onJoin: (code: string) => void; onClose: () => void }) {
  const [code, setCode] = useState(initial);
  const [hint, setHint] = useState(false);
  const complete = code.length === CODE_LENGTH;
  return (
    <section className={styles.card} data-party-join aria-labelledby="party-join-title">
      <h3 id="party-join-title">Join with a code</h3>
      <CodeBoxes initial={initial} onChange={(c, rejected) => { setCode(c); setHint(rejected); }} onEnter={(c) => { if (!busy) onJoin(c); }} />
      <AnimalPicker />
      <NickField />
      <p className={styles.status} role="status" aria-live="polite">{hint ? NOT_IN_CODES_HINT : message ?? 'Ask your friend for their code.'}</p>
      <div className={styles.row}>
        <button type="button" className={styles.primary} disabled={!complete || busy} onClick={() => onJoin(code)}>{busy ? 'Checking' : 'Join'}</button>
      </div>
      <button type="button" className={styles.ghost} onClick={onClose}>Go back</button>
    </section>
  );
}
