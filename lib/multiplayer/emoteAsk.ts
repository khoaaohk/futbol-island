// Shared ball emotes as REQUEST + ACCEPT (owner, Oct 23 2026; relay v1.4, Cap.EmoteAsk). Pass it / Juggle with me near a party friend no
// longer just plays at them: the friend gets a small card ("Sam wants to pass the ball", Join / No thanks, gone after 8 s) and nothing happens
// to their character until they tap Join; then both play it together, each with their own ball (lib/town/emoteDuet.ts). A No, no answer or
// an old relay: the asker's emote plays alone. Anti-spam (EMOTE_ASK, enforced by the relay too): one open ask per friend, a 20 s cooldown
// per friend, and after 2 Nos in a row that friend cannot be asked for 2 min (the wheel greys the two buttons: "Try again in a bit").
// No analytics imports (tests/mp-isolation.cjs); no loops: one timer only while a card or an ask is open.
import { AskReply, Cap, EMOTE_ASK, S, type Emote, type MemberId, type ServerMsg } from '../../multiplayer/protocol';
import type { PartyConnection } from './connection';

export type AskState = 'ok' | 'pending' | 'cooldown' | 'blocked';
interface Pair { lastAskAt: number; prevAskAt: number; declines: number; blockedUntil: number; pendingUntil: number }
/** The asker's own copy of the relay's pair rules (by friend id). */
export interface AskGate { pairs: Map<MemberId, Pair> }
export const createAskGate = (): AskGate => ({ pairs: new Map() });
const pairOf = (g: AskGate, to: MemberId): Pair => {
  let p = g.pairs.get(to);
  if (!p) { p = { lastAskAt: -1e12, prevAskAt: -1e12, declines: 0, blockedUntil: 0, pendingUntil: 0 }; g.pairs.set(to, p); }
  return p;
};
/** May I ask friend `to` now? */
export function askState(g: AskGate, to: MemberId, now: number): AskState {
  const p = g.pairs.get(to);
  if (!p) return 'ok';
  if (p.pendingUntil > now) return 'pending';
  if (now < p.blockedUntil) return 'blocked';
  if (now - p.lastAskAt < EMOTE_ASK.cooldownMs) return 'cooldown';
  return 'ok';
}
export function noteAsk(g: AskGate, to: MemberId, now: number): void {
  const p = pairOf(g, to); p.prevAskAt = p.lastAskAt; p.lastAskAt = now; p.pendingUntil = now + EMOTE_ASK.timeoutMs + EMOTE_ASK.graceMs;
}
/** The answer (or the local timeout, as a No). Unavailable = the relay never asked: the cooldown does not start. */
export function noteReply(g: AskGate, to: MemberId, reply: AskReply, now: number): void {
  const p = pairOf(g, to); p.pendingUntil = 0;
  if (reply === AskReply.Yes) p.declines = 0;
  else if (reply === AskReply.Unavailable) p.lastAskAt = p.prevAskAt;
  else if (++p.declines >= EMOTE_ASK.declinesToBlock) { p.declines = 0; p.blockedUntil = now + EMOTE_ASK.blockMs; }
}

/** The card on the asked friend's screen (one at a time). */
export interface IncomingAsk { from: MemberId; name: string; emote: Emote; until: number }
let incoming: IncomingAsk | null = null;
const subs = new Set<() => void>();
const setIncoming = (v: IncomingAsk | null) => { if (v === incoming) return; incoming = v; for (const f of Array.from(subs)) f(); };
/** React reads the open card through this (useSyncExternalStore). */
export const emoteAskStore = {
  get: (): IncomingAsk | null => incoming, server: (): IncomingAsk | null => null,
  subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; },
};
let answerFn: ((yes: boolean) => void) | null = null;
/** The card's buttons (and its timeout) answer through this. */
export function answerEmoteAsk(yes: boolean): void { answerFn?.(yes); }

export interface EmoteAskHooks {
  now(): number;
  /** May this friend's ask be shown now? (not muted / hidden, I am on foot and free: no lesson, menu, ride, water...). Else it is ignored. */
  canShow(from: MemberId): boolean;
  nameOf(id: MemberId): string;
  /** My ask's outcome: No / Unavailable / Yes (a Yes is followed by onDuet), or No after the local timeout. */
  onReply(by: MemberId, emote: Emote, reply: AskReply): void;
  /** Two players start a duet now (me included or not). */
  onDuet(a: MemberId, b: MemberId, emote: Emote, seed: number): void;
}
export interface EmoteAskClient {
  /** The relay speaks v1.4 (else: today's instant one-way emote). */
  readonly supported: boolean;
  /** Sends the ask (false: not supported / not allowed now / not sent). */
  ask(to: MemberId, emote: Emote): boolean;
  state(to: MemberId): AskState;
  /** My open ask, or null. */
  readonly pending: { to: MemberId; emote: Emote } | null;
  dispose(): void;
}
type Timers = { set(fn: () => void, ms: number): unknown; clear(h: unknown): void };
const realTimers: Timers = { set: (fn, ms) => setTimeout(fn, ms), clear: (h) => clearTimeout(h as ReturnType<typeof setTimeout>) };

export function createEmoteAskClient(conn: Pick<PartyConnection, 'caps' | 'onMessage' | 'sendEmoteAsk' | 'sendEmoteAnswer'>, h: EmoteAskHooks, timers: Timers = realTimers): EmoteAskClient {
  const gate = createAskGate();
  let pending: { to: MemberId; emote: Emote } | null = null, pendingTimer: unknown = null, cardTimer: unknown = null;
  const closeCard = () => { if (cardTimer !== null) { timers.clear(cardTimer); cardTimer = null; } setIncoming(null); };
  const settle = (by: MemberId, emote: Emote, reply: AskReply) => {
    if (!pending || pending.to !== by) return;
    pending = null; if (pendingTimer !== null) { timers.clear(pendingTimer); pendingTimer = null; }
    noteReply(gate, by, reply, h.now()); h.onReply(by, emote, reply);
  };
  answerFn = (yes) => {
    const c = incoming; if (!c) return;
    closeCard(); conn.sendEmoteAnswer(c.from, yes);
  };
  const off = conn.onMessage((m: ServerMsg) => {
    if (m[0] === S.EmoteAsk) {
      const from = m[1];
      if (incoming || !h.canShow(from)) return; // one card at a time; muted / hidden / busy: ignored (the asker's own card times out)
      setIncoming({ from, name: h.nameOf(from), emote: m[2], until: h.now() + EMOTE_ASK.timeoutMs });
      cardTimer = timers.set(() => { cardTimer = null; answerEmoteAsk(false); }, EMOTE_ASK.timeoutMs);
    } else if (m[0] === S.EmoteAnswer) settle(m[1], m[2], m[3]);
    else if (m[0] === S.Duet) { if (incoming && (incoming.from === m[1] || incoming.from === m[2])) closeCard(); h.onDuet(m[1], m[2], m[3], m[4]); }
    else if (m[0] === S.Left) { if (incoming && incoming.from === m[1]) closeCard(); if (pending && pending.to === m[1]) settle(m[1], pending.emote, AskReply.Unavailable); }
    else if (m[0] === S.Ended) { closeCard(); if (pending) settle(pending.to, pending.emote, AskReply.Unavailable); }
  });
  return {
    get supported() { return (conn.caps & Cap.EmoteAsk) !== 0; },
    get pending() { return pending; },
    state: (to) => askState(gate, to, h.now()),
    ask(to, emote) {
      if (!((conn.caps & Cap.EmoteAsk) !== 0) || pending || askState(gate, to, h.now()) !== 'ok') return false;
      if (!conn.sendEmoteAsk(to, emote)) return false;
      noteAsk(gate, to, h.now()); pending = { to, emote };
      pendingTimer = timers.set(() => { pendingTimer = null; if (pending) settle(pending.to, pending.emote, AskReply.No); }, EMOTE_ASK.timeoutMs + EMOTE_ASK.graceMs);
      return true;
    },
    dispose() {
      off(); closeCard(); if (pendingTimer !== null) timers.clear(pendingTimer); pending = null; answerFn = null;
    },
  };
}
