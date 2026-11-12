'use client';
// Public island (Agent C, Nov 11 2026): "What's wrong?" for a stranger. Four large reason buttons, then the thanks line. No typing
// anywhere (tests/mp-public-ui.cjs and tests/mp-isolation.cjs check there is no text field). Reporting hides the player at once and sends C.Report when
// the relay offered it (publicWorld.reportMember). Every word is from lib/multiplayer/publicCopy.ts.
import { useEffect, useRef, useState } from 'react';
import { reportMember } from '@/lib/multiplayer/publicWorld';
import { PUBLIC_REPORT, REPORT_REASONS } from '@/lib/multiplayer/publicCopy';
import styles from './party.module.css';

export default function ReportSheet({ id, name, hex, onDone }: { id: number; name: string; hex?: string; onDone: () => void }) {
  const [sent, setSent] = useState(false);
  const first = useRef<HTMLButtonElement>(null), ok = useRef<HTMLButtonElement>(null);
  useEffect(() => { (sent ? ok : first).current?.focus({ preventScroll: true }); }, [sent]);
  if (sent) return (
    <div className={styles.reportSheet} data-report-sheet data-report-done role="status">
      <p className={styles.reportThanks}>{PUBLIC_REPORT.thanks}</p>
      <p className={styles.small}>{PUBLIC_REPORT.grownUp}</p>
      <button ref={ok} type="button" className={styles.primary} data-report-ok onClick={onDone}>{PUBLIC_REPORT.done}</button>
    </div>
  );
  return (
    <div className={styles.reportSheet} data-report-sheet role="group" aria-labelledby="report-title">
      <h3 id="report-title" className={styles.reportTitle}>{PUBLIC_REPORT.title}</h3>
      <p className={styles.small} aria-hidden="true"><span className={styles.dot} data-report-name style={{ display: 'inline-block', verticalAlign: '-2px', marginRight: 6, background: hex ?? '#fff' }} />{name}</p>
      <p className={styles.small} data-report-final>{PUBLIC_REPORT.final}</p>
      <div className={styles.reportReasons}>
        {REPORT_REASONS.map((r, i) => (
          <button key={r.id} ref={i === 0 ? first : undefined} type="button" className={styles.secondary} data-report-reason={r.id}
            aria-label={`${r.label}, ${name}`} onClick={() => { reportMember(id, r.wire); setSent(true); }}>{r.label}</button>
        ))}
      </div>
      <button type="button" className={styles.ghost} data-report-back onClick={onDone}>{PUBLIC_REPORT.cancel}</button>
    </div>
  );
}
