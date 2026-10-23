'use client';
import { useEffect, useRef } from 'react';
import styles from './party.module.css';

/** The red confirm button ignores taps for this long after the step opens, so a double tap never confirms by accident. */
export const CONFIRM_ARM_MS = 450;

/**
 * The one confirm step for destructive party actions (owner, Oct 23 2026): Remove a friend, Leave party, End party for everyone.
 * A question, the red action (the End party red, --party-danger) and Cancel. Cancel is focused (the default) and sits on the right,
 * under the finger that tapped the action, so neither one tap nor a double tap can act. `as` = 'li' inside the member list.
 */
export default function ConfirmStep({ question, yes, onYes, onCancel, as = 'div', kind }: {
  question: string; yes: string; onYes: () => void; onCancel: () => void; as?: 'div' | 'li'; kind: string;
}) {
  const openedAt = useRef(0);
  const cancel = useRef<HTMLButtonElement | null>(null);
  useEffect(() => { openedAt.current = performance.now(); cancel.current?.focus({ preventScroll: true }); }, []);
  const Tag = as;
  return (
    <Tag className={styles.confirm} data-confirm={kind} role="group" aria-label={question}>
      <p>{question}</p>
      <div className={styles.confirmActions}>
        <button type="button" className={`${styles.primary} ${styles.danger}`} data-confirm-yes
          onClick={() => { if (performance.now() - openedAt.current < CONFIRM_ARM_MS) return; onYes(); }}>{yes}</button>
        <button type="button" ref={cancel} className={styles.secondary} data-confirm-cancel onClick={onCancel}>Cancel</button>
      </div>
    </Tag>
  );
}
