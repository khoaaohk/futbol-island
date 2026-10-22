'use client';
import { useId, useState } from 'react';
import { Icon } from '@/components/Icon';
import { NICK_MAX } from '../../multiplayer/protocol';
import { clearNick, filterNickInput, getNick, setNick } from '@/lib/multiplayer/nick';
import styles from './party.module.css';

/**
 * The one optional text box outside the code boxes: the kid's FIRST NAME (letters only, 2 to 12). Shown only in the grown-up
 * steps (Start a party card, Join card), never on the title screen. Held in memory for this page visit (lib/multiplayer/nick.ts),
 * shown only to the party, never stored, logged or sent to analytics. Invalid characters are dropped as the kid types.
 */
export default function NickField({ onChange }: { onChange?: (nick: string | null) => void }) {
  const [text, setText] = useState<string>(() => getNick() ?? '');
  const id = useId();
  const commit = (raw: string) => { const t = filterNickInput(raw); setText(t); setNick(t); onChange?.(getNick()); };
  return (
    <div className={styles.nick} data-nick-field>
      <label className={styles.nickLabel} htmlFor={id}>First name (optional)</label>
      <div className={styles.nickRow}>
        <input
          id={id} type="text" className={styles.nickInput} value={text} placeholder="Your first name" maxLength={NICK_MAX}
          inputMode="text" autoCapitalize="words" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
          aria-describedby={id + '-hint'} onChange={(e) => commit(e.target.value)}
        />
        {text && <button type="button" className={styles.mini} aria-label="Clear first name" onClick={() => { setText(''); clearNick(); onChange?.(null); }}><Icon name="close" size={20} /></button>}
      </div>
      <p className={styles.nickHint} id={id + '-hint'}>Letters only. First name only, no last names.</p>
    </div>
  );
}
