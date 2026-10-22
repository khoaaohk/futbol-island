'use client';
import { useEffect, useRef, useState } from 'react';
import { expiryText, groupCode, partyLink, partyQr, sharePartyLink } from '@/lib/multiplayer/invite';
import { Icon } from '@/components/Icon';
import { Glyph } from './PartyChip';
import styles from './party.module.css';

/** The host's invite block at the top of the "Your party" card: big code XXX-XXX, Share / Copy link, a QR behind a toggle, expiry. */
export default function PartyInvite({ code, expiresAt, onNote, locked, onNewCode, onToggleLock }: { code: string; expiresAt: number; onNote: (text: string) => void; locked: boolean; onNewCode: () => void; onToggleLock: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!showQr) return; let live = true; partyQr(code).then((u) => { if (live) setQr(u); }); return () => { live = false; }; }, [code, showQr]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const [fresh, setFresh] = useState(false);
  const prevCode = useRef(code);
  useEffect(() => { // a new code glows briefly as it arrives (the old one already stopped working)
    if (prevCode.current === code) return;
    prevCode.current = code; setFresh(true); setShowQr(false); setQr(null);
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
      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
        <button type="button" className={styles.secondary} data-party-qr-toggle aria-expanded={showQr} onClick={() => setShowQr((v) => !v)}>{showQr ? 'Hide QR' : 'Show QR'}</button>
      </div>
      {locked && <p className={styles.badge} data-party-closed role="status">Closed to new friends</p>}
      {showQr && <div className={styles.qrBox}>
        {qr ? <img className={styles.qr} src={qr} width={120} height={120} alt={`QR code for ${partyLink(code)}`} /> : <span className={styles.qrWait} aria-hidden="true" />}
        <p className={styles.small}>Or scan with a camera.</p>
      </div>}
      <div className={`${styles.stack} ${styles.codeActions}`} data-party-code-actions>
        <button type="button" className={styles.primary} data-party-new-code onClick={onNewCode}><Icon name="rotate" size={20} /> New code</button>
        <p className={styles.small}>The old code stops working right away. People already here stay.</p>
        <button type="button" className={styles.secondary} data-party-lock aria-pressed={locked} onClick={onToggleLock}><Glyph name="lock" size={20} /> {locked ? 'Open to new friends' : 'Close to new friends'}</button>
        <p className={styles.small}>{locked ? 'Nobody new can join with any code until you open it again.' : 'Stops anyone new joining with any code until you open it again.'}</p>
      </div>
    </div>
  );
}
