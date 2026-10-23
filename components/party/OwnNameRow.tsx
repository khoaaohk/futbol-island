'use client';
import { useEffect, useRef, useState } from 'react';
import { normalizeNick } from '../../multiplayer/protocol';
import { colourName, displayName, type Member } from '@/lib/multiplayer';
import { Glyph } from './PartyChip';
import { NickInput } from './NickField';
import styles from './party.module.css';

/**
 * Your party > List: the local player's own row. A plain 'Change name' button opens an inline first-name editor with the join form's rules
 * (the NickField box itself, NickInput: letters only, 2 to 12, filterNickInput while typing; normalizeNick on Save). Save / Cancel; Enter saves.
 * `locked`: the host locked this player's name (relay v1.5): the button shows 'Name locked' (disabled, lock mark) until the host unlocks it.
 * `onSave` gets the normalised name; the name stays in memory only (lib/multiplayer/nick.ts), never stored.
 */
export default function OwnNameRow({ me, locked, onSave, onRejected }: { me: Member; locked: boolean; onSave: (nick: string) => void; onRejected?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const input = useRef<HTMLInputElement | null>(null);
  const pencil = useRef<HTMLButtonElement | null>(null);
  const wasEditing = useRef(false);
  useEffect(() => {
    if (editing) input.current?.focus({ preventScroll: true }); // opens the soft keyboard on phones (the tap is the user gesture)
    else if (wasEditing.current) pencil.current?.focus({ preventScroll: true });
    wasEditing.current = editing;
  }, [editing]);
  useEffect(() => { if (locked) setEditing(false); }, [locked]);
  const name = displayName(me);
  const valid = normalizeNick(text);
  const canSave = valid !== null && valid !== me.nick;
  const save = () => { if (!canSave) return; onSave(valid); setEditing(false); };
  const row = (
    <li className={styles.member} data-party-self data-acts={!editing ? '1' : undefined} aria-label={`You, ${name}, ${colourName(me.colourIdx).toLowerCase()}`}>
      <span className={styles.dot} style={{ background: me.colourHex }} aria-hidden="true" />
      <span className={styles.mname}>You ({name})</span>
      {me.isHost && <span className={styles.badge}>Host</span>}
      {!editing && (
        <span className={styles.rowActions}>
          {locked
            ? <button type="button" className={styles.act} data-name-locked disabled aria-label="Name locked by the host"><Glyph name="lock" size={16} />Name locked</button>
            : <button ref={pencil} type="button" className={styles.act} data-rename-open
                onClick={() => { setText(me.nick ?? ''); setEditing(true); }}>Change name</button>}
        </span>
      )}
    </li>
  );
  if (!editing) return row;
  return (
    <>
      {row}
      <li className={styles.renameForm} data-rename-form>
        <form className={styles.nick} onSubmit={(e) => { e.preventDefault(); save(); }}>
          <NickInput value={text} onText={setText} onRejected={onRejected} label="New first name" inputRef={input} />
          <div className={styles.renameActions}>
            <button type="button" className={styles.secondary} data-rename-cancel onClick={() => setEditing(false)}>Cancel</button>
            <button type="submit" className={styles.primary} data-rename-save disabled={!canSave}>Save</button>
          </div>
        </form>
      </li>
    </>
  );
}
