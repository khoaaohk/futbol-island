'use client';
// Public island (Agent C, Nov 11 2026): the grown-up lock in Settings while the build flag is on (IslandSettings renders today's
// Allowed / Off toggle, unchanged, when it is off). Three settings (lib/multiplayer/publicCopy.ts PLAY_LOCK_SETTINGS: Other players and
// friends / Friends only / Off), each with its one-line explanation, behind the grown-up check (skipped once passed this visit, as the
// old toggle did). A change takes effect at once: the presence store re-reads the lock and the island's driver leaves a public world
// on Friends only / Off; Off also leaves a party (PartyHost's Allowed). Same key: fi2-multiplayer-allowed-v1.
import { useState, useSyncExternalStore } from 'react';
import ParentGate from '@/components/ParentGate';
import { Icon } from '@/components/Icon';
import { parentGatePassed } from '@/lib/parentGate';
import { multiplayerLock, setMultiplayerLock, subscribeMultiplayerAllowed, type MultiplayerLock } from '@/lib/multiplayerAllowed';
import { PLAY_LOCK_GATE, PLAY_LOCK_SETTINGS, PLAY_LOCK_TITLE } from '@/lib/multiplayer/publicCopy';
import styles from '../IslandSettings.module.css';

export default function PlayLock() {
  const lock = useSyncExternalStore(subscribeMultiplayerAllowed, multiplayerLock, () => 'all' as MultiplayerLock);
  const [gateFor, setGateFor] = useState<MultiplayerLock | null>(null);
  const pick = (v: MultiplayerLock) => { if (v === lock) return; if (parentGatePassed()) setMultiplayerLock(v); else setGateFor(v); };
  return (
    <section className={styles.preferenceCard} aria-labelledby="play-lock-title" data-play-lock>
      <h3 id="play-lock-title">{PLAY_LOCK_TITLE}</h3>
      <div role="group" aria-labelledby="play-lock-title">
        {PLAY_LOCK_SETTINGS.map((s) => (
          <button key={s.id} type="button" className={styles.toggle} aria-pressed={lock === s.id} data-play-lock-option={s.id} onClick={() => pick(s.id)}>
            <span><strong>{s.label}</strong><small>{s.line}</small></span>
            <span className={styles.switch} aria-hidden="true">{lock === s.id ? <Icon name="check" size={16} /> : null}</span>
          </button>
        ))}
      </div>
      {gateFor && <div role="dialog" aria-label="For grown-ups"><ParentGate reason={PLAY_LOCK_GATE} onCancel={() => setGateFor(null)} onPass={() => { const v = gateFor; setGateFor(null); setMultiplayerLock(v); }} /></div>}
    </section>
  );
}
