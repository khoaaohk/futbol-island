'use client';
import { useEffect, useState } from 'react';
import { expiryText, groupCode, partyLink, partyQr, sharePartyLink } from '@/lib/multiplayer/invite';
import { Glyph } from './PartyChip';
import { DoneButton } from '@/components/DoneButton';
import FadeScroll from './FadeScroll';
import styles from './party.module.css';

/** The host's invite card body: big code XXX-XXX, Share / Copy link, QR, a line for grown-ups, expiry. Rendered inside a dialog. */
export default function PartyInvite({ code, expiresAt, onNote, onClose }: { code: string; expiresAt: number; onNote: (text: string) => void; onClose: () => void }) {
  const [qr, setQr] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { let live = true; partyQr(code).then((u) => { if (live) setQr(u); }); return () => { live = false; }; }, [code]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  const left = expiryText(expiresAt, now);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const share = async () => {
    const r = await sharePartyLink(code);
    if (r === 'copied') onNote('Link copied');
    else if (r === 'failed') onNote("Couldn't share. Read the code out instead");
  };
  return (
    <section className={`${styles.card} ${styles.menuCard}`} data-party-invite aria-labelledby="party-invite-title">
      <header className={styles.menuHeader}>
        <span aria-hidden="true" />
        <h2 id="party-invite-title">Invite friends</h2>
        <DoneButton onDone={onClose} />
      </header>
      <FadeScroll>
      <p className={styles.codeLabel}>Your party code</p>
      <p className={styles.bigCode} data-party-code aria-label={`Party code ${code.split('').join(' ')}`}>{groupCode(code)}</p>
      <div className={styles.row}>
        <button type="button" className={styles.primary} onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
      </div>
      <div className={styles.qrBox}>
        {qr ? <img className={styles.qr} src={qr} width={160} height={160} alt={`QR code for ${partyLink(code)}`} /> : <span className={styles.qrWait} aria-hidden="true" />}
        <p className={styles.small}>Or scan with a camera.</p>
      </div>
      <p className={styles.grownup}>Share only with friends you know.<br />{left ? `Works for ${left} more. After that, tap New code.` : expiresAt > 0 ? 'This code stopped working. Tap New code.' : 'Works for 8 hours. After that, tap New code.'}</p>
      </FadeScroll>
    </section>
  );
}
