'use client';
import { useId, useState } from 'react';
import { Icon } from '@/components/Icon';
import { NICK_MAX, normalizeNick } from '../../multiplayer/protocol';
import { NICK_HINT, clearNick, filterNickInput, getNick, setNick } from '@/lib/multiplayer/nick';
import styles from './party.module.css';

/**
 * The one text box outside the code boxes: the kid's FIRST NAME, REQUIRED to start or join a party (letters only, 2 to 12). Shown only in the grown-up
 * steps (Start a party card, Join card), never on the title screen. Held in memory for this page visit (lib/multiplayer/nick.ts),
 * shown only to the party, never stored, logged or sent to analytics. Invalid characters are dropped as the kid types.
 */
/** `onRejected` (Oct 22 2026): a typed character was dropped by the filter. It carries nothing (PartyHost counts it as mp:name_bad). */
export default function NickField({ onChange, onRejected }: { onChange?: (nick: string | null) => void; onRejected?: () => void }) {
  const [text, setText] = useState<string>(() => getNick() ?? '');
  const id = useId();
  const valid = normalizeNick(text) !== null;
  const commit = (raw: string) => { const t = filterNickInput(raw); if (t !== raw.slice(0, NICK_MAX)) onRejected?.(); setText(t); setNick(t); onChange?.(getNick()); };
  return (
    <div className={styles.nick} data-nick-field>
      <div className={styles.nickRow}>
        <input
          id={id} aria-label="First name" type="text" className={styles.nickInput} value={text} placeholder="Your first name" maxLength={NICK_MAX}
          inputMode="text" autoCapitalize="words" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
          aria-required="true" aria-invalid={!valid && text.length > 0 ? true : undefined} aria-describedby={id + '-hint'} onChange={(e) => commit(e.target.value)}
        />
        {text && <button type="button" className={styles.mini} aria-label="Clear first name" onClick={() => { setText(''); clearNick(); onChange?.(null); }}><Icon name="close" size={20} /></button>}
      </div>
      <p className={styles.nickHint} id={id + '-hint'} data-nick-hint>{valid ? 'Letters only. First name only, no last names.' : NICK_HINT}</p>
    </div>
  );
}
