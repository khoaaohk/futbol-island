'use client';
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { CODE_LENGTH } from '../../multiplayer/protocol';
import { acceptCodeChar, filterCodeText } from '@/lib/multiplayer/invite';
import styles from './party.module.css';

const SLOTS = Array.from({ length: CODE_LENGTH }, (_, i) => i);

/**
 * The six single-character code boxes (the only free typing in multiplayer). Only the code alphabet is accepted (upper-cased);
 * any other character raises `onChange(code, true)` so the caller can show the gentle hint. Never guesses (no O -> 0).
 * Shared by JoinParty (in the game) and the title screen's Join friends card.
 */
export default function CodeBoxes({ initial = '', onChange, onEnter }: { initial?: string; onChange: (code: string, rejected: boolean) => void; onEnter?: (code: string) => void }) {
  const [chars, setChars] = useState<string[]>(() => SLOTS.map((i) => initial[i] ?? ''));
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => { refs.current[Math.min(initial.length, CODE_LENGTH - 1)]?.focus(); }, [initial]);
  const focus = (i: number) => refs.current[Math.max(0, Math.min(CODE_LENGTH - 1, i))]?.focus();
  const commit = (next: string[], rejected: boolean) => { setChars(next); onChange(next.join(''), rejected); };
  const fill = (from: number, text: string) => {
    const { chars: add, rejected } = filterCodeText(text);
    if (!add) { onChange(chars.join(''), rejected); return; }
    const next = chars.slice();
    for (let k = 0; k < add.length && from + k < CODE_LENGTH; k++) next[from + k] = add[k];
    commit(next, rejected);
    focus(from + add.length);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = chars.slice();
      if (next[i]) next[i] = ''; else if (i > 0) { next[i - 1] = ''; focus(i - 1); }
      commit(next, false);
    } else if (e.key === 'ArrowLeft') focus(i - 1);
    else if (e.key === 'ArrowRight') focus(i + 1);
    else if (e.key === 'Enter' && chars.join('').length === CODE_LENGTH) onEnter?.(chars.join(''));
  };
  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); };
  return (
    <div className={styles.boxes} role="group" aria-label="Party code">
      {SLOTS.map((i) => (
        <span key={i} className={styles.boxWrap}>
          {i === 3 && <span className={styles.dash} aria-hidden="true">-</span>}
          <input
            ref={(el) => { refs.current[i] = el; }} className={styles.box} type="text" maxLength={1} value={chars[i]} data-code-box
            inputMode="text" autoCapitalize="characters" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" aria-label={`Code character ${i + 1} of ${CODE_LENGTH}`}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) { const next = chars.slice(); next[i] = ''; commit(next, false); return; }
              const c = acceptCodeChar(v.slice(-1));
              if (c === null) { onChange(chars.join(''), true); return; }
              const next = chars.slice(); next[i] = c; commit(next, false); focus(i + 1);
            }}
            onKeyDown={(e) => onKey(i, e)} onPaste={(e) => onPaste(i, e)} onFocus={(e) => e.currentTarget.select()}
          />
        </span>
      ))}
    </div>
  );
}
