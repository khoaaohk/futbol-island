'use client';
import { useEffect, useRef, useState } from 'react';
import { expiryText, groupCode, sharePartyLink } from '@/lib/multiplayer/invite';
import { Icon } from '@/components/Icon';
import { Glyph } from './PartyChip';
import styles from './party.module.css';

/** The host's invite block at the top of the "Your party" card: big code XXX-XXX, Share / Copy link and the expiry (the code and link only: no scan-code picture, owner decision Oct 22 2026). */
export default function PartyInvite({ code, expiresAt, onNote, locked, onNewCode, onToggleLock }: { code: string; expiresAt: number; onNote: (text: string) => void; locked: boolean; onNewCode: () => void; onToggleLock: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const [fresh, setFresh] = useState(false);
  const prevCode = useRef(code);
  useEffect(() => { // a new code glows briefly as it arrives (the old one already stopped working)
    if (prevCode.current === code) return;
    prevCode.current = code; setFresh(true);
    const t = setTimeout(() => setFresh(false), 1400); return () => clearTimeout(t);
  }, [code]);
  const left = expiryText(expiresAt, now);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const share = async () => {
    const r = await sharePartyLink(code);
    if (r === 'copied') onNote('Link copied');
    else if (r === 'failed') onNote("Couldn't share. Read the code out instead");
  };
  return (
    <div className={styles.inviteBlock} data-party-invite>
      <p className={styles.codeLabel}>Your party code</p>
      <p key={code} className={`${styles.bigCode}${fresh ? ' ' + styles.codeFresh : ''}`} data-party-code data-fresh={fresh ? '1' : undefined} aria-label={`Party code ${code.split('').join(' ')}`}>{groupCode(code)}</p>
      <p className={styles.small}>Share only with friends you know.<br />{left ? `Works for ${left} more.` : expiresAt > 0 ? 'This code stopped working. Tap New code.' : 'Works for 8 hours.'}</p>
      <div className={styles.pairRow} data-party-code-pair>
        <button type="button" className={styles.primary} data-party-share onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
        <button type="button" className={styles.secondary} data-party-new-code onClick={onNewCode}><Icon name="rotate" size={20} /> New code</button>
      </div>
      <p className={styles.small}>The old code stops working right away. People already here stay.</p>
      {locked && <p className={styles.badge} data-party-closed role="status">Closed to new friends</p>}
      <div className={`${styles.stack} ${styles.codeActions}`} data-party-code-actions>
        <button type="button" className={styles.secondary} data-party-lock aria-pressed={locked} onClick={onToggleLock}><Glyph name="lock" size={20} /> {locked ? 'Open to new friends' : 'Close to new friends'}</button>
        <p className={styles.small}>{locked ? 'Nobody new can join with any code until you open it again.' : 'Stops anyone new joining with any code until you open it again.'}</p>
      </div>
    </div>
  );
}
