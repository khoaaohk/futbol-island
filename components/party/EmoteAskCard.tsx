'use client';
import { useSyncExternalStore } from 'react';
import { Glyph } from '@/components/party/PartyChip';
import { answerEmoteAsk, emoteAskStore } from '@/lib/multiplayer/emoteAsk';
import { EMOTE_ASK } from '@/multiplayer/protocol';
import styles from './party.module.css';

/**
 * A friend asks to play a ball emote together (relay v1.4, owner Oct 23 2026): "Sam wants to pass the ball" with Join and No thanks.
 * Nothing happens to my character until I tap Join. The card closes by itself after EMOTE_ASK.timeoutMs (a CSS bar shows the time left;
 * the close itself is the ask client's one timer), which counts as a No. Same card style as the party sheet's confirm step.
 */
export default function EmoteAskCard() {
  const ask = useSyncExternalStore(emoteAskStore.subscribe, emoteAskStore.get, emoteAskStore.server);
  if (!ask) return null;
  const juggle = ask.emote === 3;
  const line = juggle ? 'wants to juggle with you' : 'wants to pass the ball';
  return (
    <div key={ask.from + ':' + ask.until} className={styles.askCard} role="alertdialog" aria-live="polite" aria-label={`${ask.name} ${line}`} data-emote-ask={juggle ? 'juggle' : 'pass'}>
      <div className={styles.askRow}>
        <span className={styles.askIcon} aria-hidden="true"><Glyph name={juggle ? 'juggle-air' : 'pass'} size={28} /></span>
        <p><b>{ask.name}</b> {line}{juggle ? '!' : ' with you!'}</p>
      </div>
      <div className={styles.confirmActions}>
        <button type="button" className={styles.primary} data-emote-ask-join onClick={() => answerEmoteAsk(true)}>Join</button>
        <button type="button" className={styles.secondary} data-emote-ask-no onClick={() => answerEmoteAsk(false)}>No thanks</button>
      </div>
      <span className={styles.askTime} style={{ animationDuration: EMOTE_ASK.timeoutMs + 'ms' }} aria-hidden="true" />
    </div>
  );
}
