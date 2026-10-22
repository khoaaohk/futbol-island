'use client';
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { CODE_LENGTH } from '../../multiplayer/protocol';
import { NOT_IN_CODES_HINT, acceptCodeChar, filterCodeText } from '@/lib/multiplayer/invite';
import AnimalPicker from './AnimalPicker';
import styles from './party.module.css';

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => i);

/**
 * Join with a code: six single-character boxes, nothing else is typed. Only the code alphabet is accepted (upper-cased);
 * any other character shows a gentle hint and is never guessed at (no O -> 0).
 */
export default function JoinParty({ initial = '', message, busy, onJoin, onClose }: { initial?: string; message?: string | null; busy?: boolean; onJoin: (code: string) => void; onClose: () => void }) {
  const [chars, setChars] = useState<string[]>(() => SLOTS.map((i) => initial[i] ?? ''));
  const [hint, setHint] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[Math.min(initial.length, CODE_LENGTH - 1)]?.focus(); }, [initial]);
  const code = chars.join('');
  const complete = code.length === CODE_LENGTH;
  const focus = (i: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();
  const fill = (from: number, text: string) => {
    const { chars: add, rejected } = filterCodeText(text);
    setHint(rejected);
    if (!add) return;
    const next = chars.slice();
    for (let k = 0; k < add.length && from + k < CODE_LENGTH; k++) next[from + k] = add[k];
    setChars(next);
    focus(from + add.length);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = chars.slice();
      if (next[i]) next[i] = ''; else if (i > 0) { next[i - 1] = ''; focus(i - 1); }
      setChars(next); setHint(false);
    } else if (e.key === 'ArrowLeft') focus(i - 1);
    else if (e.key === 'ArrowRight') focus(i + 1);
    else if (e.key === 'Enter' && complete && !busy) onJoin(code);
  };
  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); };
  return (
    <section className={styles.card} data-party-join aria-labelledby="party-join-title">
      <h3 id="party-join-title">Join with a code</h3>
      <div className={styles.boxes} role="group" aria-label="Party code">
        {SLOTS.map((i) => (
          <span key={i} className={styles.boxWrap}>
            {i === 3 && <span className={styles.dash} aria-hidden="true">-</span>}
            <input
              ref={(el) => { refs.current[i] = el; }} className={styles.box} type="text" maxLength={1} value={chars[i]} data-code-box
              inputMode="text" autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" aria-label={`Code character ${i + 1} of ${CODE_LENGTH}`}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) { const next = chars.slice(); next[i] = ''; setChars(next); return; }
                const c = acceptCodeChar(v.slice(-1));
                setHint(c === null);
                if (c === null) return;
                const next = chars.slice(); next[i] = c; setChars(next); focus(i + 1);
              }}
              onKeyDown={(e) => onKey(i, e)} onPaste={(e) => onPaste(i, e)} onFocus={(e) => e.currentTarget.select()}
            />
          </span>
        ))}
      </div>
      <AnimalPicker />
      <p className={styles.status} role="status" aria-live="polite">{hint ? NOT_IN_CODES_HINT : message ?? 'Ask your friend for their code.'}</p>
      <div className={styles.row}>
        <button type="button" className={styles.primary} disabled={!complete || busy} onClick={() => onJoin(code)}>{busy ? 'Checking' : 'Join'}</button>
      </div>
      <button type="button" className={styles.ghost} onClick={onClose}>Go back</button>
    </section>
  );
}
