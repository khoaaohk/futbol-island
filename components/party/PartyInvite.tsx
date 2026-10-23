'use client';
import { useEffect, useRef, useState } from 'react';
import { expiryText, groupCode, sharePartyLink } from '@/lib/multiplayer/invite';
import { Icon } from '@/components/Icon';
import { Glyph } from './PartyChip';
import styles from './party.module.css';

/** The host's invite block at the top of the "Your party" card: big code XXX-XXX, Share / Copy link and the expiry (the code and link only: no scan-code picture, owner decision Oct 22 2026). */
/** `onShared` (analytics, Oct 22 2026): the tap and its result as a fixed name; PartyHost passes it on to Town (never the code or link). */
export type ShareEvent = 'share_tap' | 'share_ok' | 'copy_ok' | 'share_fail';
/** `host` false (a guest, owner decision Oct 22 2026 "guest can see the code to help others"): the same code, expiry line and Share /
 *  Copy link, read-only. New code and Close to new friends stay with the host (a note says so). */
export default function PartyInvite({ code, expiresAt, onNote, locked, onNewCode, onToggleLock, onShared, host = true }: { code: string; expiresAt: number; onNote: (text: string) => void; locked: boolean; onNewCode?: () => void; onToggleLock?: () => void; onShared?: (e: ShareEvent) => void; host?: boolean }) {
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
    onShared?.('share_tap');
    const r = await sharePartyLink(code);
    onShared?.(r === 'shared' ? 'share_ok' : r === 'copied' ? 'copy_ok' : 'share_fail');
    if (r === 'copied') onNote('Link copied');
    else if (r === 'failed') onNote("Couldn't share. Read the code out instead");
  };
  return (
    <div className={styles.inviteBlock} data-party-invite data-guest={host ? undefined : '1'}>
      <p className={styles.codeLabel}>{host ? 'Your party code' : 'Party code'}</p>
      <p key={code} className={`${styles.bigCode}${fresh ? ' ' + styles.codeFresh : ''}`} data-party-code data-fresh={fresh ? '1' : undefined} aria-label={`Party code ${code.split('').join(' ')}`}>{groupCode(code)}</p>
      <p className={styles.small}>Share only with friends you know.<br />{left ? `Works for ${left} more.` : expiresAt > 0 ? (host ? 'This code stopped working. Tap New code.' : 'This code stopped working. Ask the host for a new one.') : 'Works for 8 hours.'}</p>
      {host ? <>
        <div className={styles.pairRow} data-party-code-pair>
          <button type="button" className={styles.primary} data-party-share onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
          <button type="button" className={styles.secondary} data-party-new-code onClick={onNewCode}><Icon name="rotate" size={20} /> New code</button>
        </div>
        <p className={styles.small}>The old code stops working right away. People already here stay.</p>
      </> : <>
        <div className={styles.stack} data-party-guest-share>
          <button type="button" className={styles.primary} data-party-share onClick={share}><Glyph name="link" size={20} /> {canShare ? 'Share link' : 'Copy link'}</button>
        </div>
        <p className={styles.small} data-party-host-only>Only the host can make a new code.</p>
      </>}
      {locked && <p className={styles.badge} data-party-closed role="status">Closed to new friends</p>}
      {host && <div className={`${styles.stack} ${styles.codeActions}`} data-party-code-actions>
        <button type="button" className={styles.secondary} data-party-lock aria-pressed={locked} onClick={onToggleLock}><Glyph name="lock" size={20} /> {locked ? 'Open to new friends' : 'Close to new friends'}</button>
        <p className={styles.small}>{locked ? 'Nobody new can join with any code until you open it again.' : 'Stops anyone new joining with any code until you open it again.'}</p>
      </div>}
    </div>
  );
}
