'use client';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import ParentGate from '@/components/ParentGate';
import { Icon } from '@/components/Icon';
import { parentGatePassed } from '@/lib/parentGate';
import { multiplayerAllowed, subscribeMultiplayerAllowed } from '@/lib/multiplayerAllowed';
import { SESSION_KEY, bindConnection, colourName, displayName, getNick, hasValidNick, multiplayerEnabled, partyStore, setNick, usePartyState, type Member, type PartyConnection } from '@/lib/multiplayer';
import { PARTY_EVENT, checkParty, clearPendingParty, createJoinBuffer, createParty, joinNote, readPendingParty } from '@/lib/multiplayer/invite';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';
import { ErrorCode, PARTY_MAX, S, Zone, normalizeCode, type Look } from '../../multiplayer/protocol';
import JoinParty from './JoinParty';
import PartyChip, { Glyph } from './PartyChip';
import PartyInvite from './PartyInvite';
import FadeScroll from './FadeScroll';
import { presenceIcon, presenceText } from '@/lib/multiplayer/presence';
import NickField from './NickField';
import OwnNameRow from './OwnNameRow';
import ConfirmStep from './ConfirmStep';
import { DoneButton } from '@/components/DoneButton';
import HudSlot from '@/components/HudStack';
import styles from './party.module.css';

/** Analytics event names (Oct 22 2026, docs/analytics-multiplayer-plan.md §3). This file never imports analytics: Town.tsx passes
 *  `onTrack`, which maps a name to an `mp:` count (partyEvents.ts PARTY_TRACK_EVENTS in the analytics folder; a test keeps the two lists equal).
 *  The bucket is a fixed string (a fail reason, 'link' / 'typed', or the member count): never a code, a name or a member id. */
type Track = 'open' | 'sheet' | 'open_link' | 'gate_show' | 'gate_skip' | 'gate_ok' | 'gate_back' | 'gate_wrong' | 'name_ok'
  | 'create_tap' | 'created' | 'join_tap' | 'live_host' | 'live_guest' | 'members' | 'share_tap' | 'share_ok' | 'copy_ok' | 'share_fail' | 'new_code' | 'lock' | 'unlock'
  | 'kick' | 'name_reset' | 'hide' | 'mute' | 'tab_code' | 'tab_list' | 'end_tap' | 'end' | 'leave' | 'ended' | 'kicked' | 'fail' | 'fail_create' | 'name_bad'
  | 'rtt' | 'reconnect';
/** Phase C (§7 RTT): the party's median heartbeat round trip as a fixed band, passed once at the party's end (never the number). */
export const rttBand = (ms: number): string => (ms < 80 ? 'rtt_lt80' : ms < 150 ? 'rtt_80_150' : ms < 300 ? 'rtt_150_300' : 'rtt_300p');
type View = 'none' | 'menu' | 'gate' | 'join' | 'sheet';
type Pending = { kind: 'create' } | { kind: 'join'; code: string };
type Note = { kind: 'join'; names: string[] } | { kind: 'text'; text: string };

const ZONE_ICON: Record<number, string> = { [Zone.Main]: 'home', [Zone.Cay]: 'sun', [Zone.Summit]: 'up', [Zone.Sea]: 'globe', [Zone.Indoors]: 'book' };
/** The small line under a friend's name in the Party tab: what they are doing ('Taking a lesson', 'In the museum', 'Away'); '' when playing. */
export function memberActivityLine(m: Pick<Member, 'presence' | 'activity'>): string {
  const t = presenceText(m.presence, m.activity);
  return t ? `${presenceIcon(m.presence, m.activity)} ${t}` : '';
}
const ZONE_LABEL: Record<number, string> = { [Zone.Main]: 'on the island', [Zone.Cay]: 'at Coral Cay', [Zone.Summit]: 'at the Summit', [Zone.Sea]: 'in the sea', [Zone.Indoors]: 'indoors' };
const ERROR_TEXT: Record<number, string> = {
  [ErrorCode.Full]: 'This party is full (20/20)', [ErrorCode.NotFound]: "We couldn't find that party", [ErrorCode.Expired]: 'That code has run out. Ask for a new one',
  [ErrorCode.Locked]: 'This party is closed', [ErrorCode.RateLimited]: 'Please wait a moment and try again', [ErrorCode.BadVersion]: 'Please reload the game', [ErrorCode.BadName]: 'Type your first name to play',
};
const ERROR_BUCKET: Record<number, string> = { [ErrorCode.Full]: 'full', [ErrorCode.NotFound]: 'not_found', [ErrorCode.Expired]: 'expired', [ErrorCode.Locked]: 'locked', [ErrorCode.BadName]: 'bad_name', [ErrorCode.RateLimited]: 'rate', [ErrorCode.BadVersion]: 'version' };

// React 18 has no typed `inert`; an empty attribute makes the hidden panel unfocusable and unclickable.
const inertIf = (on: boolean): Record<string, string> => (on ? { inert: '' } : {});
const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** The Play with friends HUD button the card grows out of (and shrinks back into). */
const openerRect = () => document.querySelector<HTMLElement>('[data-party-open]')?.getBoundingClientRect() ?? null;

/** Grow timing: card reveals out of the HUD button in ~300 ms, content fades in over the last 60%; shrink back in ~200 ms. */
const GROW_IN_MS = 300;
const GROW_OUT_MS = 200;
/** One grow keyframe: the card is clipped to a button-sized rounded box (constant corner radius, never stretched) and moved so that
 *  box sits over the HUD button; `box` null is the resting card. Translate + clip only: nothing is scaled, so no oval. */
function growFrame(box: DOMRect | null, el: HTMLElement): Keyframe {
  const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 24;
  if (!box) return { transform: 'none', clipPath: `inset(0px round ${r}px)` };
  const c = el.getBoundingClientRect();
  const ix = Math.max(0, (c.width - box.width) / 2), iy = Math.max(0, (c.height - box.height) / 2);
  const dx = box.left + box.width / 2 - (c.left + c.width / 2), dy = box.top + box.height / 2 - (c.top + c.height / 2);
  return { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`, clipPath: `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${Math.min(r, box.width / 2)}px)` };
}


/**
 * Dialog shell: backdrop, Esc closes, focus moves in. Same cream card look as the other island cards.
 * With `grow`, the card grows out of the HUD button and shrinks back into it before unmounting: a clip-path reveal with a constant corner radius
 * (no scale, so no oval); content fades in after the shell has grown. Reduced motion: no morph, no fade-out.
 * `children` may be a function that receives the animated close (for the card's own Done button).
 */
function Card({ children, onClose, label, grow, from, onEscape }: { children: ReactNode | ((close: () => void) => ReactNode); onClose: () => void; label: string; grow?: boolean; from?: DOMRect | null; onEscape?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const escRef = useRef(onEscape); escRef.current = onEscape;
  const requestClose = useCallback(() => {
    if (closing.current) return;
    const el = ref.current; const target = openerRect();
    if (!grow || !el || !target || reducedMotion()) { closeRef.current(); return; }
    closing.current = true;
    back.current?.animate([{ backgroundColor: '#193f3766' }, { backgroundColor: '#193f3700' }], { duration: GROW_OUT_MS, fill: 'forwards' });
    for (const c of Array.from(el.firstElementChild?.children ?? [])) c.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, fill: 'forwards' });
    const a = el.animate([growFrame(null, el), growFrame(target, el)], { duration: GROW_OUT_MS, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
    const done = () => closeRef.current();
    a.finished.then(done, done);
  }, [grow]);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!grow || !el || !from || reducedMotion()) return;
    el.animate([growFrame(from, el), growFrame(null, el)], { duration: GROW_IN_MS, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    for (const c of Array.from(el.firstElementChild?.children ?? [])) c.animate([{ opacity: 0 }, { opacity: 1 }], { duration: Math.round(GROW_IN_MS * 0.6), delay: Math.round(GROW_IN_MS * 0.4), easing: 'ease-out', fill: 'backwards' });
    back.current?.animate([{ backgroundColor: '#193f3700' }, { backgroundColor: '#193f3766' }], { duration: GROW_IN_MS, fill: 'backwards' });
  }, [grow, from]);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('[data-parent-gate-answer],input,button')?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); if (escRef.current) escRef.current(); else requestClose(); } };
    window.addEventListener('keydown', key, true);
    return () => { window.removeEventListener('keydown', key, true); prev?.focus?.(); };
  }, [requestClose]);
  return <div ref={back} className={styles.backdrop} onPointerDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}><div ref={ref} className={`${styles.dialog}${grow ? ' ' + styles.dialogWide : ''}`} role="dialog" aria-modal="true" aria-label={label}>{typeof children === 'function' ? children(requestClose) : children}</div></div>;
}

/**
 * Town mounts this once, behind the flag. Owns: the Play with friends card (create / join), the parent gates, the invite card,
 * the party chip + sheet, and the join / leave notes (toastLane, note priority). Open the card from anywhere with
 * `openPartyMenu()` (lib/multiplayer/invite.ts). Returns null when the flag is off.
 */
export default function PartyHost(props: {
  islandReady: boolean; introDone: boolean; connection: PartyConnection; look: () => Look; onTrack?: (event: Track, bucket?: string) => void;
  /** Local-only choices, so the avatar layer can hide a friend / skip their emotes. */
  onHiddenChange?: (hidden: ReadonlySet<number>) => void; onMutedChange?: (muted: ReadonlySet<number>) => void;
}) {
  if (!multiplayerEnabled()) return null;
  return <Allowed {...props} />;
}

/** The grown-up switch (Settings > Play with friends: Allowed / Off). Off: nothing renders and any live party is left. */
function Allowed(props: Parameters<typeof PartyHost>[0]) {
  const allowed = useSyncExternalStore(subscribeMultiplayerAllowed, multiplayerAllowed, () => true);
  const conn = props.connection;
  useEffect(() => { if (!allowed) conn.leave(); }, [allowed, conn]);
  if (!allowed) return null;
  return <Host {...props} />;
}

function Host({ islandReady, introDone, connection, look, onTrack, onHiddenChange, onMutedChange }: Parameters<typeof PartyHost>[0]) {
  const state = usePartyState();
  const [view, setView] = useState<View>('none');
  const [pending, setPending] = useState<Pending | null>(null);
  const [from, setFrom] = useState<DOMRect | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [named, setNamed] = useState(hasValidNick);
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [muted, setMuted] = useState<ReadonlySet<number>>(new Set());
  const [queue, setQueue] = useState<Note[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const [kickPrompt, setKickPrompt] = useState(false);
  // Remove asks first: the member being confirmed (null = none), when the confirm opened (the red Remove arms after KICK_ARM_MS).
  const [confirmKick, setConfirmKick] = useState<number | null>(null);
  const askKick = (id: number) => { setConfirmLeave(false); setConfirmEnd(false); setConfirmKick(id); };
  const cancelKick = (id: number) => {
    setConfirmKick(null);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-remove-open][data-member="${id}"]`)?.focus({ preventScroll: true }));
  };
  const [confirmLeave, setConfirmLeave] = useState(false); // Leave party asks first too (ConfirmStep)
  const askEnd = () => { setConfirmKick(null); setConfirmEnd(true); };
  const [tab, setTab] = useState<'code' | 'party'>('code'); // remembered while this party lives; a new party starts on Code
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const everLive = useRef(false);
  const track = useRef(onTrack); track.current = onTrack;
  // Connection health at the party's end (once per party): an RTT band and the drops recovered, from the party store.
  const healthSent = useRef(false);
  const trackHealth = () => {
    if (healthSent.current) return; healthSent.current = true;
    const h = partyStore.health();
    if (h.rttMs !== null) track.current?.('rtt', rttBand(h.rttMs));
    if (h.reconnects > 0) track.current?.('reconnect', String(h.reconnects));
  };
  const joining = useRef<'host' | 'guest' | null>(null);
  const selfLeft = useRef(false); // this player tapped Leave party: the status change that follows says "You left the party", not "The party ended"
  const joinVia = useRef<'link' | 'typed'>('typed'); // how the code being joined arrived (analytics: a link / the title screen vs typed)
  const prevIds = useRef<Set<number> | null>(null);
  const prevStatus = useRef(state.status);
  const joinBuf = useRef<ReturnType<typeof createJoinBuffer> | null>(null);
  const live = state.status === 'live' || state.status === 'reconnecting';

  useEffect(() => bindConnection(connection), [connection]);
  // Party persistence (docs/multiplayer-design.md "Party persistence"): a party this tab was in comes back by itself on every island
  // mount (a reload, a room page round trip, back / forward, a remount). Same slot and colour, no grown-up gate, no name prompt;
  // the stored session is cleared only by End / Leave / Kicked / the party ending or expiring. Unmounting never leaves.
  const resumed = useRef(false);
  useEffect(() => { if (connection.resume({ look: look() })) resumed.current = true; }, [connection]); // eslint-disable-line react-hooks/exhaustive-deps
  // Party rejoin (Oct 22 2026, docs/multiplayer-design.md "Party rejoin"): the session is kept on this device (every tab), so the menu
  // offers 'Rejoin your party' when the auto-resume failed or the slot lapsed, and 'Use it here' when another tab has the party.
  const rejoinTap = useRef(false);
  const [rejoining, setRejoining] = useState(false);
  const [, bumpStored] = useState(0); // another tab started / ended a party: re-read the stored party (an event, never a poll)
  useEffect(() => {
    const on = (e: StorageEvent) => { if (e.key === SESSION_KEY || e.key === null) bumpStored((n) => n + 1); };
    window.addEventListener('storage', on); return () => window.removeEventListener('storage', on);
  }, []);
  // Member slots are reused: a friend who left must not leave their Hide / Mute behind for the next face in that slot.
  useEffect(() => {
    const ids = new Set(state.members.map((m) => m.id));
    const prune = (cur: ReadonlySet<number>, cb?: (s: ReadonlySet<number>) => void, apply?: (s: ReadonlySet<number>) => void) => {
      if (!Array.from(cur).some((id) => !ids.has(id))) return;
      const next = new Set(Array.from(cur).filter((id) => ids.has(id))); apply?.(next); cb?.(next);
    };
    prune(hidden, onHiddenChange, setHidden); prune(muted, onMutedChange, setMuted);
  }, [state.members, hidden, muted, onHiddenChange, onMutedChange]);
  const note = useCallback((n: Note) => setQueue((q) => {
    const last = q[q.length - 1];
    if (n.kind === 'join' && last?.kind === 'join') return [...q.slice(0, -1), { kind: 'join', names: [...last.names, ...n.names] }];
    return q.length >= 3 ? q : [...q, n];
  }), []);
  const text = useCallback((t: string) => note({ kind: 'text', text: t }), [note]);
  useEffect(() => {
    if (state.status === 'live') {
      resumed.current = false;
      if (rejoinTap.current) { rejoinTap.current = false; setRejoining(false); setView((v) => (v === 'menu' ? 'none' : v)); text('You are back in your party'); }
      return;
    }
    // The party ended or expired while this player was away (a room page, a reload): say so once, never a join error.
    // A lapsed slot is not an ending (the effect below offers Join with the code).
    if (state.status !== 'error' || !resumed.current || state.error === ErrorCode.Kicked || state.lapsed) return;
    const manual = rejoinTap.current; rejoinTap.current = false; setRejoining(false);
    resumed.current = false; text(manual ? 'That party ended' : 'The party ended'); prevIds.current = null; setView('none'); setConfirmEnd(false);
  }, [state.status, state.error, state.lapsed, text]);
  // The relay no longer has this player's slot (60 s, or 10 min indoors, ran out) but the party may still run: if it does, Join with the
  // code filled in (a new slot; the first name is asked again: it is never stored), else 'That party ended' and the session goes.
  const lapsedFallback = useCallback((code: string) => {
    setRejoining(true);
    void checkParty(code).then((info) => {
      setRejoining(false);
      if (!info) { connection.forget(); bumpStored((n) => n + 1); text('That party ended'); return; }
      setJoinCode(code); setJoinMsg('Your spot timed out. Type your first name to join again.'); joinVia.current = 'typed'; setView('join');
    });
  }, [connection, text]);
  useEffect(() => {
    if (!state.lapsed) return;
    resumed.current = false;
    const manual = rejoinTap.current; rejoinTap.current = false; setRejoining(false);
    const s = connection.storedParty();
    if (manual && s) lapsedFallback(s.code); // on a page load it stays quiet: the menu shows Rejoin your party
  }, [state.lapsed, connection, lapsedFallback]);
  useEffect(() => { if (state.tab === 'elsewhere' && rejoinTap.current) { rejoinTap.current = false; setRejoining(false); } }, [state.tab]);

  // ---- one message at a time, through the shared lane (note priority) ----
  const busyLane = useToastLaneBusy('party');
  useEffect(() => {
    if (shown || !queue.length) return;
    toastLane.want('party');
    if (!toastLane.request('party')) return;
    const n = queue[0];
    setShown(n.kind === 'join' ? joinNote(n.names) : n.text);
    setQueue((q) => q.slice(1));
  }, [queue, shown, busyLane]);
  useEffect(() => {
    if (!shown) return;
    const t = setTimeout(() => { toastLane.release('party'); setShown(null); }, 3200);
    return () => clearTimeout(t);
  }, [shown]);
  useEffect(() => () => { toastLane.release('party'); toastLane.cancel('party'); }, []);

  // ---- join / leave / status notes ----
  useEffect(() => {
    if (state.status !== 'live') return;
    const ids = new Set(state.members.map((m) => m.id));
    const before = prevIds.current;
    prevIds.current = ids;
    if (!before) return; // the first roster is not news
    const added = state.members.filter((m) => !before.has(m.id) && m.id !== state.you).map((m) => displayName(m));
    // Big parties: joins within 1.5 s become ONE note ('3 friends joined'), never a stream of toasts.
    if (added.length) (joinBuf.current ??= createJoinBuffer((names) => note({ kind: 'join', names }))).add(added);
  }, [state.members, state.status, state.you, note]);
  useEffect(() => () => joinBuf.current?.cancel(), []);
  // A friend changed their first name (relay v1.3 C.Rename, re-announced as Joined for the same id): one short note.
  const prevNicks = useRef<Map<number, string | null> | null>(null);
  useEffect(() => {
    if (state.status !== 'live') { if (state.status === 'idle') prevNicks.current = null; return; }
    const before = prevNicks.current, next = new Map<number, string | null>();
    for (const m of state.members) {
      next.set(m.id, m.nick);
      const was = before?.get(m.id);
      if (before && before.has(m.id) && m.id !== state.you && m.nick && was !== m.nick) text(`${was || m.name} is now ${m.nick}`);
    }
    prevNicks.current = next;
  }, [state.members, state.status, state.you, text]);
  // Relay v1.5 name lock: one note to the locked player when the host locks (or unlocks) their name. lockSeen survives a resume, so the
  // lock list the relay re-sends after every Welcome is not news again.
  const lockSeen = useRef(false);
  useEffect(() => connection.onMessage((m) => {
    if (m[0] !== S.NameLock || m[1] !== partyStore.get().you) return;
    if (m[2] === 1 && !lockSeen.current) { lockSeen.current = true; text('The host locked your name'); }
    else if (m[2] === 0 && lockSeen.current) { lockSeen.current = false; text('The host unlocked your name'); }
  }), [connection, text]);
  useEffect(() => { if (state.status === 'idle') lockSeen.current = false; }, [state.status]);
  // Self rename (Your party > List): the join form's rules; memory only (nick.ts + the connection, so every reconnect and a later
  // rejoin use it). An old relay (no Cap.Rename) cannot pass it on: only this device shows it, and the note says so.
  const renameSelf = useCallback((n: string) => {
    const r = connection.rename(n);
    if (!r) { text('Could not change your name'); return; }
    setNick(n); setNamed(true); partyStore.setOwnNick(n);
    text(r === 'sent' ? `You are now ${n}` : `You are now ${n} on this device. Friends see it after the next update.`);
  }, [connection, text]);
  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = state.status;
    if (state.status === was) return;
    if (state.status === 'reconnecting') text('Reconnecting');
    if (state.status === 'live') selfLeft.current = false;
    if (state.status === 'live' && joining.current) {
      track.current?.(joining.current === 'host' ? 'live_host' : 'live_guest', joining.current === 'guest' ? joinVia.current : undefined);
      healthSent.current = false;
      joining.current = null; setBusy(false); setJoinMsg(null);
      setView((v) => (v === 'join' ? 'none' : v));
    }
    if (state.status === 'idle' && state.tab === 'moved' && (was === 'live' || was === 'reconnecting')) {
      // Another tab of this browser took the party over (Use it here): this one goes quiet; the party goes on there.
      text('Your party moved to another tab'); prevIds.current = null; setView('none'); setConfirmEnd(false);
    } else if (state.status === 'ended' || (state.status === 'idle' && (was === 'live' || was === 'reconnecting'))) {
      if ((was === 'live' || was === 'reconnecting') && selfLeft.current) text('You left the party'); // a guest's own Leave (E2E finding Oct 22 2026: it read 'The party ended')
      else if (was === 'live' || was === 'reconnecting') { track.current?.('ended'); trackHealth(); text(state.error === ErrorCode.Kicked ? 'You left the party' : 'The party ended'); }
      selfLeft.current = false;
      prevIds.current = null; setView('none'); setConfirmEnd(false);
    }
  }, [state.status, state.error, state.tab, state.members.length, text]);
  // Analytics: the member count while live (the host's peak and first-friend bands; only a number, never who).
  useEffect(() => { if (state.status === 'live') track.current?.('members', String(state.members.length)); }, [state.status, state.members.length]);
  useEffect(() => {
    if (live) everLive.current = true;
    if (!live) { setKickPrompt(false); setTab('code'); }
  }, [live]);
  useEffect(() => {
    // Kicked: the connection ends in status 'error' (not 'ended'), so the "left" note is raised here (review #16).
    if (state.error !== ErrorCode.Kicked || !everLive.current) return;
    everLive.current = false;
    track.current?.('kicked'); trackHealth(); text('You left the party');
    prevIds.current = null; setView('none'); setConfirmEnd(false);
  }, [state.error, text]);
  useEffect(() => {
    if (state.error === null || state.error === ErrorCode.Kicked) return;
    if (!joining.current) return;
    const msg = ERROR_TEXT[state.error] ?? "Couldn't join that party";
    track.current?.('fail', ERROR_BUCKET[state.error] ?? 'other');
    joining.current = null; setBusy(false); setJoinMsg(msg); connection.leave();
  }, [state.error, connection]);

  // ---- open from the HUD, and from a pending link ----
  // In a party the HUD button opens the party sheet (members, Invite, Lock, New code, End / Leave), never the Start menu again.
  const liveRef = useRef(live); liveRef.current = live;
  const openMenu = useCallback(() => { track.current?.(liveRef.current ? 'sheet' : 'open'); setPending(null); setFrom(openerRect()); setView(liveRef.current ? 'sheet' : 'menu'); }, []);
  useEffect(() => { window.addEventListener(PARTY_EVENT, openMenu); return () => window.removeEventListener(PARTY_EVENT, openMenu); }, [openMenu]);
  // Take ?party= out of the URL as soon as the island mounts (the code waits in sessionStorage for the intro to finish).
  useEffect(() => { readPendingParty(); }, []);
  const linkChecked = useRef(false);
  useEffect(() => {
    if (!islandReady || !introDone || linkChecked.current || live) return;
    linkChecked.current = true;
    const code = readPendingParty();
    if (code) { setJoinCode(code); setJoinMsg(null); setView('join'); joinVia.current = 'link'; track.current?.('open_link'); }
  }, [islandReady, introDone, live]);

  // ---- gate, then create / join ----
  const afterGate = (p: Pending) => { track.current?.(parentGatePassed() ? 'gate_skip' : 'gate_show'); if (parentGatePassed()) run(p); else { setPending(p); setView('gate'); } };
  const run = (p: Pending) => { setPending(null); if (p.kind === 'create') void startCreate(); else void startJoin(p.code); };
  async function startCreate() {
    if (!getNick()) { setView('menu'); return; } // the first name is required
    setBusy(true); setView('sheet'); setJoinMsg(null); // the same dialog never disappears: the party card shows 'Making your code' until the code arrives
    const r = await createParty();
    if ('error' in r) { setBusy(false); setView('menu'); text(r.error === 'rate' ? 'Too many parties. Try again later' : "Can't reach the party service"); track.current?.('fail_create', r.error); return; }
    joining.current = 'host';
    connection.join(r.code, { look: look(), hostKey: r.hostKey, nick: getNick() });
    track.current?.('created');
    setView('sheet'); setBusy(false);
  }
  async function startJoin(code: string) {
    if (!getNick()) { setJoinCode(code); setView('join'); return; } // the first name is required
    setBusy(true); setJoinCode(code); setJoinMsg(null); setView('join');
    const info = await checkParty(code);
    if (!info) { setBusy(false); setJoinMsg("We couldn't find that party"); track.current?.('fail', 'not_found'); return; }
    if (info.full) { setBusy(false); setJoinMsg('This party is full (20/20)'); track.current?.('fail', 'full'); return; }
    // A host coming back to their own party (its host key is on this device) may pass a closed party, as the relay allows.
    const own = connection.storedParty();
    if (!info.open && !(own && own.host && own.code === normalizeCode(code))) { setBusy(false); setJoinMsg('That party is closed or the code has run out'); track.current?.('fail', 'closed'); return; }
    clearPendingParty();
    joining.current = 'guest';
    connection.join(code, { look: look(), nick: getNick() });
  }

  // A create that ended without a live party (connection dropped first) goes back to the menu rather than leaving an empty card.
  useEffect(() => { if (view === 'sheet' && !busy && !live && state.status !== 'connecting') setView('menu'); }, [view, busy, live, state.status]);
  const manageHint = useRef(false);
  useEffect(() => { if (!live) manageHint.current = false; }, [live]);
  const close = useCallback(() => { setView('none'); setPending(null); setConfirmEnd(false); }, []);
  const closeJoin = useCallback(() => { clearPendingParty(); setBusy(false); setView('none'); }, []);
  const toggle = (set: ReadonlySet<number>, id: number, cb?: (s: ReadonlySet<number>) => void, apply?: (s: ReadonlySet<number>) => void) => {
    const next = new Set(set); if (!next.delete(id)) next.add(id); apply?.(next); cb?.(next);
  };
  const friends: Member[] = state.members.filter((m) => m.id !== state.you);
  // A confirm for someone who already left, or after losing host, or once the card closes, goes away by itself.
  useEffect(() => { if (view !== 'sheet' || state.isHost) setConfirmLeave(false); }, [view, state.isHost]);
  useEffect(() => {
    if (confirmKick !== null && (!state.isHost || view !== 'sheet' || !state.members.some((m) => m.id === confirmKick))) setConfirmKick(null);
  }, [confirmKick, state.isHost, state.members, view]);
  const me = state.members.find((m) => m.id === state.you);
  const kickBlock = (
    <div className={styles.stack} data-party-kick-prompt>
      <p className={styles.small}>Friend removed. Keep others out?</p>
      <button type="button" className={styles.secondary} onClick={() => { connection.host.rotate(); text('New code ready'); setKickPrompt(false); track.current?.('new_code'); }}><Icon name="rotate" size={20} /> New code</button>
      <button type="button" className={styles.secondary} onClick={() => { connection.host.lock(true); partyStore.setLocked(true); setKickPrompt(false); track.current?.('lock'); }}><Glyph name="lock" size={20} /> Close to new friends</button>
      <button type="button" className={styles.ghost} onClick={() => setKickPrompt(false)}>Not now</button>
    </div>
  );
  const activeTab = tab; // Code + List for everyone (guests see the code read-only, Oct 22 2026)
  const onTabKey = (e: ReactKeyboardEvent) => {
    const order = ['code', 'party'] as const; const i = order.indexOf(activeTab);
    let n = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % 2; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + 1) % 2; else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = 1;
    if (n < 0) return;
    e.preventDefault(); setTab(order[n]); tabRefs.current[order[n]]?.focus();
  };
  useEffect(() => { if (confirmEnd) track.current?.('end_tap'); }, [confirmEnd]); // analytics: the first End tap (asks to confirm)
  const stored = view === 'menu' && !live ? connection.storedParty() : null;
  const rejoin = () => {
    const s = connection.storedParty();
    if (!s) { bumpStored((n) => n + 1); text('That party ended'); return; }
    if (state.lapsed) { lapsedFallback(s.code); return; } // the relay already said the slot is gone: straight to the code
    rejoinTap.current = true; resumed.current = true; setRejoining(true);
    if (!connection.resume({ look: look() })) { rejoinTap.current = false; resumed.current = false; lapsedFallback(s.code); }
  };
  const useHere = () => {
    rejoinTap.current = true; resumed.current = true; setRejoining(true);
    if (!connection.takeOver({ look: look() })) { rejoinTap.current = false; resumed.current = false; setRejoining(false); bumpStored((n) => n + 1); text('That party ended'); }
  };
  const rejoinBlock = !stored ? null : state.tab === 'elsewhere' || state.tab === 'moved' ? (
    <div className={styles.stack} data-party-elsewhere>
      <p className={styles.small} role="status">{state.tab === 'moved' ? 'Your party moved to another tab.' : 'Your party is open in another tab.'}</p>
      <button type="button" className={styles.primary} data-party-use-here disabled={rejoining} onClick={useHere}><Icon name="people" size={20} /> {rejoining ? 'Moving here' : 'Use it here'}</button>
    </div>
  ) : (
    <div className={styles.stack} data-party-rejoin>
      <button type="button" className={styles.primary} data-party-rejoin-btn disabled={rejoining || busy} onClick={rejoin}><Icon name="people" size={20} /> {rejoining ? 'Rejoining' : 'Rejoin your party'}</button>
      <p className={styles.small}>Go back to the party you were in.</p>
    </div>
  );
  const leave = () => { selfLeft.current = true; track.current?.('leave'); trackHealth(); connection.leave(); setView('none'); text('You left the party'); };

  return (
    <>
      {/* The live-party chip is the HUD Play with friends button (IslandSettings badge); it opens the sheet while a party runs. */}
      {shown && <HudSlot><p className={styles.toast} role="status" data-hud-slot="toast" data-party-toast>{shown}</p></HudSlot>}

      {(view === 'menu' || (view === 'gate' && pending)) && (
        <Card label={view === 'gate' ? 'For grown-ups' : 'Play with friends'} onClose={close} grow from={view === 'gate' && pending?.kind === 'join' ? null : from} onEscape={view === 'gate' ? () => setView(pending?.kind === 'join' ? 'join' : 'menu') : undefined}>
          {(requestClose) => view === 'gate' && pending ? (
            <ParentGate shell reason={pending.kind === 'create' ? 'Invite friends to play on your island. Nobody can chat.' : 'Join a friend’s party. Nobody can chat.'} onCancel={() => { track.current?.('gate_back'); setView(pending.kind === 'join' ? 'join' : 'menu'); }} onPass={() => { track.current?.('gate_ok'); run(pending); }} onWrong={() => track.current?.('gate_wrong')} />
          ) : <section className={`${styles.card} ${styles.menuCard}`} data-party-menu aria-labelledby="party-menu-title">
            <header className={styles.menuHeader}>
              <span aria-hidden="true" />
              <h2 id="party-menu-title">Play with friends</h2>
              <DoneButton onDone={requestClose} />
            </header>
            <FadeScroll>
            {rejoinBlock}
            <p className={styles.small}>Friends join your island with a code. Nobody can chat.</p>
            <NickField onChange={(n) => { setNamed(n !== null); if (n !== null) track.current?.('name_ok'); }} onRejected={() => track.current?.('name_bad')} />
            <div className={styles.stack}>
              <button type="button" className={styles.primary} disabled={busy || !named} onClick={() => { track.current?.('create_tap'); afterGate({ kind: 'create' }); }}><Icon name="people" size={20} /> {busy ? 'Starting' : 'Start a party'}</button>
              <button type="button" className={styles.secondary} disabled={busy || !named} onClick={() => { setJoinCode(''); setJoinMsg(null); setView('join'); joinVia.current = 'typed'; }}>Join with a code</button>
            </div>
            </FadeScroll>
          </section>}
        </Card>
      )}
      {view === 'join' && (
        <Card label="Join with a code" onClose={closeJoin} grow from={null}>
          {(requestClose) => <JoinParty initial={joinCode} message={joinMsg} busy={busy} onClose={requestClose} onJoin={(c) => { track.current?.('join_tap'); afterGate({ kind: 'join', code: c }); }} onNameRejected={() => track.current?.('name_bad')} />}
        </Card>
      )}
      {view === 'sheet' && (live || busy || state.status === 'connecting') && (
        <Card label="Your party" onClose={() => { close(); if (live && state.isHost && !manageHint.current) { manageHint.current = true; text('Tap the friends button to manage your party'); } }} grow from={null}>
          {(requestClose) => !live ? (
            <section className={`${styles.card} ${styles.menuCard}`} data-party-sheet data-party-creating aria-busy="true">
              <header className={styles.menuHeader}><span aria-hidden="true" /><h2>Your party</h2><DoneButton onDone={requestClose} /></header>
              <p className={styles.small} role="status">Making your code...</p>
            </section>
          ) : <section className={`${styles.card} ${styles.menuCard}`} data-party-sheet aria-labelledby="party-sheet-title">
            <header className={styles.menuHeader}>
              <span className={styles.hdrCount} role="img" aria-label={`Friends here: ${state.members.length} of ${PARTY_MAX}`} data-party-count><Icon name="people" size={18} /><span aria-hidden="true">{state.members.length} of {PARTY_MAX}</span></span>
              <h2 id="party-sheet-title">Your party</h2>
              <DoneButton onDone={requestClose} />
            </header>
            {/* One body: the toggle floats pinned on top, both lists scroll underneath it (and above the pinned footer). */}
            <div className={styles.body} data-party-body data-tabs="1">
              <div className={styles.tabs} role="tablist" aria-label="Party view" data-party-tabs data-active={activeTab} onKeyDown={onTabKey}>
                <span className={styles.pill} aria-hidden="true" data-party-pill />
                {(['code', 'party'] as const).map((t) => (
                  <button key={t} ref={(el) => { tabRefs.current[t] = el; }} type="button" role="tab" id={`party-tab-${t}`} aria-controls={`party-panel-${t}`} aria-selected={activeTab === t} tabIndex={activeTab === t ? 0 : -1} data-party-tab={t} className={styles.tab} onClick={() => { setTab(t); track.current?.(t === 'code' ? 'tab_code' : 'tab_list'); }}>
                    {t === 'code' ? 'Code' : <>List <span key={state.members.length} className={styles.tabCount} data-party-tab-count>({state.members.length})</span></>}
                  </button>
                ))}
              </div>
            {/* One stage: both panels share a grid cell, so the card is always as tall as the taller one and never jumps. */}
            <div className={styles.stage} data-party-stage>
              <div role="tabpanel" id="party-panel-code" aria-labelledby="party-tab-code" aria-hidden={activeTab !== 'code'} {...inertIf(activeTab !== 'code')} data-active={activeTab === 'code'} className={styles.panel} data-party-panel="code">
                <FadeScroll>
                  {state.code
                    ? <PartyInvite code={state.code} expiresAt={state.codeExpiresAt} onNote={text} locked={state.locked} host={state.isHost}
                        onNewCode={state.isHost ? () => { connection.host.rotate(); text('New code ready'); setKickPrompt(false); track.current?.('new_code'); } : undefined}
                        onToggleLock={state.isHost ? () => { track.current?.(state.locked ? 'unlock' : 'lock'); connection.host.lock(!state.locked); partyStore.setLocked(!state.locked); } : undefined}
                        onShared={(r) => track.current?.(r)} />
                    : <p className={styles.small} role="status">{state.isHost ? 'Making your code...' : 'Getting the code...'}</p>}
                  {kickPrompt && state.isHost && kickBlock}
                </FadeScroll>
              </div>
            <div role="tabpanel" id="party-panel-party" aria-labelledby="party-tab-party" aria-hidden={activeTab !== 'party'} {...inertIf(activeTab !== 'party')} data-active={activeTab === 'party'} className={styles.panel} data-party-panel="party">
              <FadeScroll>
            <ul className={styles.members}>
              {me && <OwnNameRow me={me} locked={state.nameLocks.includes(me.id) || connection.nameLocked} onSave={renameSelf} onRejected={() => track.current?.('name_bad')} />}
              {friends.map((m) => (<Fragment key={m.id}>
                <li className={styles.member} data-acts="1" data-away={m.away ? '1' : undefined} data-presence={m.presence} aria-label={`${displayName(m)}, ${colourName(m.colourIdx).toLowerCase()}${memberActivityLine(m) ? ', ' + presenceText(m.presence, m.activity).toLowerCase() : ''}`}>
                  <span className={styles.zone} role="img" aria-label={ZONE_LABEL[m.zone] ?? 'on the island'}><Icon name={ZONE_ICON[m.zone] ?? 'home'} size={18} /></span>
                  <span className={styles.dot} style={{ background: m.colourHex }} aria-hidden="true" /><span className={styles.mname}>{displayName(m)}{memberActivityLine(m) && <small className={styles.activity} data-party-activity aria-hidden="true">{memberActivityLine(m)}</small>}</span>
                  {m.isHost && <span className={styles.badge}>Host</span>}
                  {/* Plain words, no icons (owner, Oct 23 2026: 'keep it simple'): each label says what the tap does, or the state it is in. */}
                  <span className={styles.rowActions} data-row-actions>
                    <button type="button" className={styles.act} data-act="mute" aria-pressed={muted.has(m.id)} aria-label={`${muted.has(m.id) ? 'Emotes muted' : 'Mute emotes'}, ${displayName(m)}`} onClick={() => toggle(muted, m.id, onMutedChange, setMuted)}>{muted.has(m.id) ? 'Emotes muted' : 'Mute emotes'}</button>
                    <button type="button" className={styles.act} data-act="hide" aria-pressed={hidden.has(m.id)} aria-label={`${hidden.has(m.id) ? 'Friend hidden' : 'Hide friend'}, ${displayName(m)}`} onClick={() => toggle(hidden, m.id, onHiddenChange, setHidden)}>{hidden.has(m.id) ? 'Friend hidden' : 'Hide friend'}</button>
                    {state.isHost && state.canLockNames && (() => {
                      const nl = state.nameLocks.includes(m.id);
                      return <button type="button" className={styles.act} data-act="name-lock" data-name-lock aria-pressed={nl} aria-label={`${nl ? 'Unlock name' : 'Lock name'}, ${displayName(m)}`}
                        onClick={() => { connection.host.nameLock(m.id, !nl); text(nl ? `${displayName(m)} can change their name` : `${displayName(m)}'s name is locked`); if (!nl) track.current?.('name_reset'); }}>{nl ? 'Unlock name' : 'Lock name'}</button>;
                    })()}
                    {state.isHost && <button type="button" className={styles.act} data-danger data-remove-open data-member={m.id} aria-label={`Remove ${displayName(m)} from party`} aria-expanded={confirmKick === m.id} onClick={() => askKick(m.id)}>Remove from party</button>}
                  </span>
                </li>
                {/* Remove asks first (owner, Oct 23 2026): never a single tap (ConfirmStep: Cancel focused, armed red button). */}
                {state.isHost && confirmKick === m.id && (
                  <ConfirmStep as="li" kind="remove" question={`Remove ${displayName(m)} from the party?`} yes="Remove"
                    onYes={() => { setConfirmKick(null); connection.host.kick(m.id); setKickPrompt(true); track.current?.('kick'); }}
                    onCancel={() => cancelKick(m.id)} />
                )}
              </Fragment>))}
              {!friends.length && <li className={styles.small}>Waiting for friends to join.</li>}
            </ul>
            {friends.length > 0 && <p className={styles.small} data-party-help>Mute = no emotes from them. Hide = hide them from your screen.</p>}
            {kickPrompt && state.isHost && kickBlock}
              </FadeScroll>
              {/* Pinned footer: outside the scrolling area, so End / Leave is always in view while the list scrolls under it. */}
              <div className={styles.panelFoot} data-party-foot>
              {/* End (host) and Leave (guest) share the destructive red (.endLink) and both ask first (ConfirmStep). */}
              {state.isHost && (confirmEnd
                ? <ConfirmStep kind="end" question="End the party for everyone?" yes="End party"
                    onYes={() => { track.current?.('end'); trackHealth(); connection.host.end(); setConfirmEnd(false); }}
                    onCancel={() => setConfirmEnd(false)} />
                : <button type="button" className={styles.endLink} data-party-end onClick={askEnd}>End party for everyone</button>)}
              {!state.isHost && (confirmLeave
                ? <ConfirmStep kind="leave" question="Leave the party?" yes="Leave" onYes={() => { setConfirmLeave(false); leave(); }} onCancel={() => setConfirmLeave(false)} />
                : <button type="button" className={styles.endLink} data-party-leave onClick={() => setConfirmLeave(true)}>Leave party</button>)}
              </div>
            </div>
            </div>
            </div>
          </section>}
        </Card>
      )}
    </>
  );
}
