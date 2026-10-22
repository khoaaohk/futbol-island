'use client';
import { useEffect, useState } from 'react';
import { expiryText, groupCode, partyLink, partyQr, sharePartyLink } from '@/lib/multiplayer/invite';
import { Glyph } from './PartyChip';
import styles from './party.module.css';

/** The host's invite block at the top of the "Your party" card: big code XXX-XXX, Share / Copy link, a QR behind a toggle, expiry. */
export default function PartyInvite({ code, expiresAt, onNote }: { code: string; expiresAt: number; onNote: (text: string) => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!showQr) return; let live = true; partyQr(code).then((u) => { if (live) setQr(u); }); return () => { live = false; }; }, [code, showQr]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
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
      <p className={styles.bigCode} data-party-code aria-label={`Party code ${code.split('').join(' ')}`}>{groupCode(code)}</p>
      <p className={styles.small}>Share only with friends you know.<br />{left ? `Works for ${left} more. After that, tap New code.` : expiresAt > 0 ? 'This code stopped working. Tap New code.' : 'Works for 8 hours. After that, tap New code.'}</p>
      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
        <button type="button" className={styles.secondary} data-party-qr-toggle aria-expanded={showQr} onClick={() => setShowQr((v) => !v)}>{showQr ? 'Hide QR' : 'Show QR'}</button>
      </div>
      {showQr && <div className={styles.qrBox}>
        {qr ? <img className={styles.qr} src={qr} width={120} height={120} alt={`QR code for ${partyLink(code)}`} /> : <span className={styles.qrWait} aria-hidden="true" />}
        <p className={styles.small}>Or scan with a camera.</p>
      </div>}
    </div>
  );
}
