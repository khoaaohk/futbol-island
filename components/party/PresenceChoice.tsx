'use client';
// Public island (Agent C, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md "UX wording"): "Who's on your island?",
// PartyHost's first view when the build flag is on and the island tour is done. Three big choices (Just me / With other players · N on
// now / With friends), the current one marked; one tap switches with no reload and the card closes at once so the child sees the
// others fade in or out on the island (the drawing layer fades them). "With friends" goes on into today's flow (name, grown-up check,
// code) unchanged. When public cannot be on, one calm line says why (never an error). In a shared live match a switch asks first.
// In "With other players" the roster below lists who is near (generated names only, nearest first, at most 8) with Hide and Report;
// hidden ones below with Show again. Never party things here: no code, invite, QR, host tools, name lock or first-name field.
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePartyState, type Member, type PresenceState } from '@/lib/multiplayer';
import { hidden as hiddenSet, hideMember, reported, setMode, unhideMember } from '@/lib/multiplayer/publicWorld';
import { onHiddenStrangers } from '@/lib/multiplayer/strangers';
import { PRESENCE_CHOICES, PUBLIC_HIDE, PUBLIC_MATCH_LEAVE, PUBLIC_PANEL_TITLE, PUBLIC_REASON_LINE, PUBLIC_REPORT, PUBLIC_ROSTER, publicChoiceLabel, publicCountLabel, type PresenceChoiceId } from '@/lib/multiplayer/publicCopy';
import { Icon } from '@/components/Icon';
import { DoneButton } from '@/components/DoneButton';
import FadeScroll from './FadeScroll';
import ReportSheet from './ReportSheet';
import { nearestFirst, publicNear } from './publicNear';
import styles from './party.module.css';

export const ROSTER_MAX = 8;
/** QA Nov 12 2026: a tap on the choice already marked pulses its check, then closes the panel (no silent tap). */
export const SAME_CHOICE_CLOSE_MS = 360;
const ICON: Record<PresenceChoiceId, string> = { solo: 'home', public: 'globe', friends: 'people' };

/** Which choice is marked: a party is "With friends"; a grown-up lock shows "Just me"; otherwise the player's own choice. */
export function markedChoice(ps: Pick<PresenceState, 'mode' | 'choice' | 'reason'>): PresenceChoiceId {
  if (ps.mode === 'party') return 'friends';
  if (ps.reason === 'locked-friends' || ps.reason === 'locked-off' || ps.reason === 'flag') return 'solo';
  return ps.choice;
}
/** The calm line under the choices (null = nothing to explain). Only when the player wants public and it is not on. */
export function reasonLine(ps: Pick<PresenceState, 'mode' | 'choice' | 'reason'>): string | null {
  const r = ps.reason;
  if (r === 'locked-friends' || r === 'locked-off') return PUBLIC_REASON_LINE[r];
  if (ps.choice !== 'public' || ps.mode === 'public') return null;
  return r === 'tutorial' || r === 'closed' || r === 'unavailable' ? PUBLIC_REASON_LINE[r] : null;
}

export default function PresenceChoice({ ps, onFriends, onClose }: { ps: PresenceState; onFriends: () => void; onClose: () => void }) {
  const party = usePartyState();
  const hid = useSyncExternalStore(onHiddenStrangers, hiddenSet, hiddenSet);
  const [ask, setAsk] = useState<PresenceChoiceId | null>(null); // the "You'll leave this match" step
  const [report, setReport] = useState<Member | null>(null);
  const stay = useRef<HTMLButtonElement>(null);
  const [pulse, setPulse] = useState<PresenceChoiceId | null>(null);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (pulseTimer.current) clearTimeout(pulseTimer.current); }, []);
  const close = () => { publicNear.panelAction(null); onClose(); };
  useEffect(() => { if (ask) stay.current?.focus({ preventScroll: true }); }, [ask]);
  const marked = markedChoice(ps);
  const locked = ps.lock !== 'all';
  const world = party.kind === 'world' && ps.mode === 'public';
  const others = world ? party.members.filter((m) => m.id !== party.you) : [];
  const near = nearestFirst(others.filter((m) => !hid.has(m.id)), ROSTER_MAX);
  const hiddenHere = others.filter((m) => hid.has(m.id) && !reported(m.id)); // a report cannot be undone: never under Show again
  const count = ps.count;
  const further = count !== null && count > near.length + others.filter((m) => hid.has(m.id)).length; // the count is the whole world, the list only who is near
  const go = (id: PresenceChoiceId) => {
    setAsk(null);
    if (id === 'friends') { onFriends(); return; }
    setMode(id);
    publicNear.panelAction(id); // the first-time card waits (Just me: not this visit)
    onClose(); // close at once: the others fade in / out on the island behind the shrinking card
  };
  const pick = (id: PresenceChoiceId) => {
    // Already marked does nothing, except "With other players" while it is not on (closed / unavailable): a tap retries at once
    // (publicWorld.setMode clears the 2-min slow retry). Verify pass, Nov 11 2026: the early return made that retry unreachable.
    // QA Nov 12 2026: it is no longer silent: the check pulses, then the panel closes as any choice does.
    if (id === marked && id !== 'friends' && !(id === 'public' && ps.mode !== 'public' && (ps.reason === 'closed' || ps.reason === 'unavailable'))) {
      if (pulse) return;
      setPulse(id);
      const ms = matchMedia('(prefers-reduced-motion: reduce)').matches ? 120 : SAME_CHOICE_CLOSE_MS;
      pulseTimer.current = setTimeout(() => { publicNear.panelAction(id); onClose(); }, ms);
      return;
    }
    if (ps.sharedMatch && id !== marked) { setAsk(id); return; }
    go(id);
  };
  const why = reasonLine(ps);

  if (report) return (
    <section className={`${styles.card} ${styles.menuCard}`} data-presence-panel data-presence-report aria-labelledby="presence-title">
      <header className={styles.menuHeader}><span aria-hidden="true" /><h2 id="presence-title">{PUBLIC_REPORT.button}</h2><DoneButton onDone={onClose} /></header>
      <ReportSheet id={report.id} name={report.name} hex={report.colourHex} onDone={() => setReport(null)} />
    </section>
  );

  return (
    <section className={`${styles.card} ${styles.menuCard}`} data-presence-panel aria-labelledby="presence-title">
      <header className={styles.menuHeader}>
        <span aria-hidden="true" />
        <h2 id="presence-title">{PUBLIC_PANEL_TITLE}</h2>
        <DoneButton onDone={close} />
      </header>
      {/* Nov 11 2026 (owner): the choices and the "Near you" heading stay put; only the list of players scrolls under the heading. */}
      <div className={styles.presenceFixed}>
        <div className={styles.choices} role="group" aria-labelledby="presence-title" data-presence-choices>
          {PRESENCE_CHOICES.map((c) => {
            const on = marked === c.id;
            const off = c.id === 'public' && locked;
            // Locked (Friends only): no count on the greyed-out option. The count rides in a no-wrap span after a no-break space so a
            // phone never starts a line with "·" (QA Nov 12 2026).
            const label = c.id === 'public' && !off && count !== null && (ps.connected || ps.relay === 'open') ? publicChoiceLabel(count) : c.label;
            const [head, tail] = label.split(' · ');
            return (
              <button key={c.id} type="button" className={styles.choice} data-presence-choice={c.id} aria-pressed={c.id === 'friends' ? undefined : on}
                aria-current={on ? 'true' : undefined} data-pulse={pulse === c.id ? '' : undefined} disabled={off} onClick={() => pick(c.id)}>
                <span className={styles.choiceIcon} aria-hidden="true"><Icon name={ICON[c.id]} size={22} /></span>
                <span className={styles.choiceText}>
                  <strong>{head}{tail && <>{'\u00a0'}<span className={styles.choiceCount}>· {tail}</span></>}</strong>
                  <small>{c.line}</small>
                </span>
                <span className={styles.choiceMark} aria-hidden="true">{on ? <Icon name="check" size={20} /> : c.id === 'friends' ? <Icon name="arrow" size={18} /> : null}</span>
                {on && <span className={styles.srOnly}>, {PUBLIC_ROSTER.chosen}</span>}
              </button>
            );
          })}
        </div>
        {why && <p className={styles.small} role="status" data-presence-reason>{why}</p>}
        {/* The island-goal count line was removed from this panel (owner, Nov 13 2026); the goal's done toast still shows. */}
        {ask && (
          <div className={styles.confirm} role="group" aria-label={PUBLIC_MATCH_LEAVE.line} data-presence-match-leave>
            <p>{PUBLIC_MATCH_LEAVE.line}</p>
            <div className={styles.confirmActions}>
              <button type="button" className={styles.primary} data-presence-switch onClick={() => go(ask)}>{PUBLIC_MATCH_LEAVE.go}</button>
              <button type="button" ref={stay} className={styles.secondary} data-presence-stay onClick={() => setAsk(null)}>{PUBLIC_MATCH_LEAVE.stay}</button>
            </div>
          </div>
        )}
      </div>
      {world && (
          <div className={`${styles.roster} ${styles.rosterScroll}`} data-public-roster>
            <h3 className={styles.rosterTitle}>{PUBLIC_ROSTER.title}<span className={styles.srOnly}>, {publicCountLabel(count ?? others.length)}</span></h3>
            <FadeScroll>
            <ul className={styles.members}>
              {near.map((m) => (
                <li key={m.id} className={styles.member} data-acts="1" data-public-member={m.id}>
                  <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
                  <span className={styles.mname}>{m.name}</span>
                  <span className={styles.rowActions} data-row-actions>
                    <button type="button" className={styles.act} data-act="public-hide" aria-label={`${PUBLIC_HIDE.hide}, ${m.name}`} onClick={() => hideMember(m.id)}>{PUBLIC_HIDE.hide}</button>
                    <button type="button" className={styles.act} data-act="public-report" aria-label={`${PUBLIC_REPORT.button}, ${m.name}`} onClick={() => setReport(m)}>{PUBLIC_REPORT.button}</button>
                  </span>
                </li>
              ))}
              {!near.length && <li className={styles.small}>{PUBLIC_ROSTER.empty}</li>}
            </ul>
            {further && <p className={styles.small} data-public-further>{PUBLIC_ROSTER.further}</p>}
            {hiddenHere.length > 0 && <>
              <h3 className={styles.rosterTitle}>{PUBLIC_ROSTER.hiddenTitle}</h3>
              <ul className={styles.members} data-public-hidden>
                {hiddenHere.map((m) => (
                  <li key={m.id} className={styles.member} data-acts="1" data-away="1">
                    <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" />
                    <span className={styles.mname}>{m.name}</span>
                    <span className={styles.rowActions}><button type="button" className={styles.act} data-act="public-unhide" aria-label={`${PUBLIC_HIDE.unhide}, ${m.name}`} onClick={() => unhideMember(m.id)}>{PUBLIC_HIDE.unhide}</button></span>
                  </li>
                ))}
              </ul>
            </>}
            </FadeScroll>
          </div>
      )}
    </section>
  );
}
