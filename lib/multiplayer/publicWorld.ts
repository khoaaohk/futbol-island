// Public island (Nov 11 2026, docs/multiplayer-public-island-plan-2026-11-11.md; contract docs/multiplayer/WORLD-HANDOFF.md):
// drives the ONE connection from the presence mode (presenceMode.ts). Lazy: a world socket opens only once the island is
// interactive, the tutorial is done, the first input happened and ~3 s have passed (then an idle callback), so first paint and
// input never wait for it. Silent: any failure is Just me with no message; the connection retries 1/2/4/8/15 s itself, then this
// file retries at most every 2 min, ON THE NEXT INPUT (no timer runs for it). Hide / Report for strangers and the counters' events.
// Light on purpose (no three.js, no analytics, no storage): the island creates it (createPublicWorld), rooms only use the helpers.
import { REPORT_REASON_IDS, type Look, type MemberId } from '../../multiplayer/protocol';
import type { PartyConnection, WorldEvent } from './connection';
import { emitPresenceEvent, presence, type PresenceChoice } from './presenceMode';
import { hideStranger, unhideStranger, hiddenStrangers, isHiddenStranger, reportStranger, isReportedStranger } from './strangers';
import { inSharedMatch, onSharedMatch } from './sharedMatch';
import { hasPendingParty } from './invite';
import { partyStore } from './store';
import { publicWorldEnabled } from './publicFlag';
import { holdoutArm, holdoutReturning } from './holdout';

/** First input -> this long -> an idle callback -> connect. */
export const LAZY_CONNECT_MS = 3000;
/** After the fast backoff gave up, a closed / old / full relay: ask again no sooner than this (on the next input). */
export const SLOW_RETRY_MS = 120_000;
const REPORT_COUNT_IDS = ['following', 'inmyway', 'waves', 'other'] as const;

// ---- the connection the helpers act on (roomParty.partyConnection() attaches the page's one connection) ----
let conn: PartyConnection | null = null;
export function attachWorldConnection(c: PartyConnection): void { conn = c; }

/** In a public world right now (a world socket wanted or open): party-only UI (codes, host tools, pings, rename) must not show. */
export function isPublic(): boolean { return conn?.kind === 'world'; }
/** Others in my world (not me), or null. For the panel ("8 on now"); the lobby's n before the socket opens. */
export function publicCount(): number | null { return conn ? conn.worldCount : null; }
/** Someone else is within 40 m (S.Quiet near > 0): the input for publicFrame() (minutes with someone near). */
export function othersNear(): boolean { return !!conn && conn.kind === 'world' && conn.status === 'live' && conn.near > 0; }
export { inSharedMatch };

/** Hide a stranger for this page session (local only, nothing is sent). */
export function hideMember(id: MemberId): void {
  if (isHiddenStranger(id)) return;
  hideStranger(id);
  emitPresenceEvent({ type: 'hide' });
}
export function unhideMember(id: MemberId): void { unhideStranger(id); }
export function hidden(): ReadonlySet<MemberId> { return hiddenStrangers(); }
/** Reported this visit (hidden for good: never listed under Show again). */
export function reported(id: MemberId): boolean { return isReportedStranger(id); }
/** Report a stranger: C.Report [id, reason] (ReportReason 0..3), and hide them at once (even when the report could not be sent). */
export function reportMember(id: MemberId, reasonWire: number): boolean {
  const ok = Number.isInteger(reasonWire) && reasonWire >= 0 && reasonWire < REPORT_REASON_IDS.length;
  reportStranger(id);
  if (!ok) return false;
  const sent = !!conn && conn.report(id, reasonWire);
  emitPresenceEvent({ type: 'report', reason: REPORT_COUNT_IDS[reasonWire] });
  return sent;
}

/** Room pages (useRoomParty, arcadeRoomParty): resume the tab's party, or its world slot when `world` (presenceMode.worldResumeAllowed())
 *  is true; when it is false the world slot is forgotten (Leave if open). The lobby is asked with ?in=<shard>, so a page change never
 *  re-rolls the world unless it is gone or full, and the stored resume token keeps the slot and the generated name within the grace. */
export function resumeRoomConnection(c: Pick<PartyConnection, 'resume' | 'forgetWorld' | 'kind'>, look: Look, world: boolean): boolean {
  if (!world && c.kind !== 'party') c.forgetWorld();
  return c.resume({ look, world });
}

export interface PublicWorld {
  /** The island is interactive (first frame drawn, controls live). */
  islandReady(on: boolean): void;
  /** The island tutorial / onboarding is finished (new players see others only after it). */
  tutorialDone(on: boolean): void;
  /** A real input (tap, key, joystick start: NOT per frame). Cheap: a few comparisons unless something is waiting for it. */
  noteInput(): void;
  /** The people button: Just me / With other players. Switches without a reload (Leave / join). */
  setMode(m: PresenceChoice): void;
  /** Re-check (a party link appeared or was dismissed, the lock changed in this tab). */
  refresh(): void;
  dispose(): void;
}

let armed = false, seenOnce = false;
let current: PublicWorld | null = null;
/** The people button (PartyHost): Just me / With other players, through the island's driver when there is one (switches the socket at
 *  once), else only the stored choice (a room page: applied when the island is back). */
export function setMode(m: PresenceChoice): void { if (current) current.setMode(m); else presence.setChoice(m); }

export function createPublicWorld(deps: {
  conn: PartyConnection; look: () => Look;
  now?: () => number; setTimeout?: (fn: () => void, ms: number) => unknown; clearTimeout?: (h: unknown) => void;
  /** Runs fn when the main thread is idle (requestIdleCallback with a 2 s timeout by default). */
  idle?: (fn: () => void) => void;
  /** A party invitation waiting (invite.ts hasPendingParty by default). */
  pendingParty?: () => boolean;
}): PublicWorld {
  const c = deps.conn;
  attachWorldConnection(c);
  const now = deps.now ?? (() => Date.now());
  const st = deps.setTimeout ?? ((fn: () => void, ms: number) => setTimeout(fn, ms));
  const ct = deps.clearTimeout ?? ((h: unknown) => clearTimeout(h as ReturnType<typeof setTimeout>));
  const idle = deps.idle ?? defaultIdle;
  const pending = deps.pendingParty ?? hasPendingParty;
  let ready = false, inputSeen = false, gatePassed = false, gateTimer: unknown = null, idleWait = false, slowAt = 0, disposed = false, applying = false;

  if (publicWorldEnabled() && !armed) { armed = true; const arm = holdoutArm(); emitPresenceEvent({ type: 'arm', arm, back: holdoutReturning() }); }

  const partyNow = () => c.kind === 'party' || (c.storedParty() !== null && !c.lapsed) || c.tab === 'elsewhere' || pending();
  const cancelGate = () => { if (gateTimer !== null) { ct(gateTimer); gateTimer = null; } };

  function apply() {
    if (disposed || applying) return;
    applying = true;
    try {
      presence.setParty(partyNow());
      const s = presence.get(), k = c.kind;
      if (s.mode !== 'public') {
        // Leave only for a real reason (the player's choice, a lock, a party, the flag); a tutorial flag that is still settling, or a
        // relay state already handled by the connection, never closes a live world.
        if (k === 'world' && s.reason !== 'tutorial' && s.reason !== 'closed' && s.reason !== 'unavailable') { c.leave(); presence.setLive(false, c.worldCount); }
        cancelGate();
        return;
      }
      if (k !== null || idleWait || !ready || !inputSeen) return;
      if (!gatePassed) {
        if (gateTimer === null) gateTimer = st(() => { gateTimer = null; idle(() => { if (disposed) return; gatePassed = true; apply(); }); }, LAZY_CONNECT_MS);
        return;
      }
      if (now() < slowAt) return;
      c.joinWorld({ look: deps.look() });
    } finally { applying = false; }
  }

  const offWorld = c.onWorld((e: WorldEvent) => {
    if (e.type === 'live') { presence.setRelay('open'); presence.setLive(true, c.worldCount); emitPresenceEvent({ type: 'connect' }); return; }
    if (e.type === 'count') { presence.setLive(c.kind === 'world' && c.status === 'live', e.n); return; }
    if (e.type !== 'fallback') return;
    // Decide first, then publish (each presence change re-runs apply()).
    if (e.why === 'idle' || e.why === 'replaced') { idleWait = true; presence.setLive(false, c.worldCount); return; } // back on the next real input (?in= the same world)
    slowAt = now() + SLOW_RETRY_MS;
    presence.setRelay(e.why === 'closed' ? 'closed' : 'unavailable');
    presence.setLive(false, c.worldCount);
    emitPresenceEvent({ type: 'fallback', why: e.why === 'full' ? 'full' : 'unreachable' });
  });
  const offStatus = c.onStatus(() => apply()); // a party ended / was left: back to the remembered choice
  const offLocal = typeof c.onLocal === 'function' ? c.onLocal(() => apply()) : () => {};
  const offPresence = presence.subscribe(() => apply());
  const offStore = partyStore.subscribe(() => {
    if (seenOnce || c.kind !== 'world') return;
    const s = partyStore.get();
    if (s.status === 'live' && s.members.some((m) => m.id !== s.you)) { seenOnce = true; emitPresenceEvent({ type: 'seen' }); }
  });
  const offMatch = onSharedMatch((on) => { if (on && c.kind === 'world') emitPresenceEvent({ type: 'match_join' }); });
  apply();

  const self: PublicWorld = {
    islandReady(on) { if (on !== ready) { ready = on; apply(); } },
    tutorialDone(on) { presence.setTutorialDone(on); },
    noteInput() {
      if (disposed) return;
      if (!inputSeen) { inputSeen = true; apply(); return; }
      if (idleWait) { idleWait = false; apply(); return; }
      const s = presence.get();
      if ((s.relay === 'closed' || s.relay === 'unavailable') && now() >= slowAt) { presence.setRelay('unknown'); return; } // the subscription applies
      if (s.party && c.kind !== 'party') apply(); // a pending link that was dismissed
    },
    setMode(m) {
      idleWait = false;
      if (m === 'public' && presence.get().relay !== 'open') { slowAt = 0; presence.setRelay('unknown'); } // a tap retries at once
      presence.setChoice(m);
      apply();
    },
    refresh() { presence.refresh(); apply(); },
    dispose() {
      // The socket stays open (a room page or the next island mount takes it over); only the driver goes.
      disposed = true; cancelGate();
      offWorld(); offStatus(); offLocal(); offPresence(); offStore(); offMatch();
      if (current === self) current = null;
    },
  };
  current = self;
  return self;
}

function defaultIdle(fn: () => void): void {
  const ric = (globalThis as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => unknown }).requestIdleCallback;
  if (typeof ric === 'function') ric(fn, { timeout: 2000 }); else fn();
}
