'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import ParentGate from '@/components/ParentGate';
import { Icon } from '@/components/Icon';
import { parentGatePassed } from '@/lib/parentGate';
import { multiplayerAllowed, subscribeMultiplayerAllowed } from '@/lib/multiplayerAllowed';
import { bindConnection, colourName, displayName, getNick, multiplayerEnabled, partyStore, usePartyState, type Member, type PartyConnection } from '@/lib/multiplayer';
import { PARTY_EVENT, checkParty, clearPendingParty, createParty, joinNote, readPendingParty } from '@/lib/multiplayer/invite';
import { toastLane, useToastLaneBusy } from '@/lib/ui/toastLane';
import { ErrorCode, Zone, type Look } from '../../multiplayer/protocol';
import JoinParty from './JoinParty';
import PartyChip, { Glyph } from './PartyChip';
import PartyInvite from './PartyInvite';
import AnimalPicker, { getAnimalChoice } from './AnimalPicker';
import NickField from './NickField';
import { DoneButton } from '@/components/DoneButton';
import pickerStyles from './animalPicker.module.css';
import styles from './party.module.css';

type Track = 'mp_party_created' | 'mp_party_joined' | 'mp_party_ended' | 'mp_join_failed';
type View = 'none' | 'menu' | 'gate' | 'invite' | 'join' | 'sheet';
type Pending = { kind: 'create' } | { kind: 'join'; code: string };
type Note = { kind: 'join'; names: string[] } | { kind: 'text'; text: string };

const ZONE_ICON: Record<number, string> = { [Zone.Main]: 'home', [Zone.Cay]: 'sun', [Zone.Summit]: 'up', [Zone.Sea]: 'globe', [Zone.Indoors]: 'book' };
const ZONE_LABEL: Record<number, string> = { [Zone.Main]: 'on the island', [Zone.Cay]: 'at Coral Cay', [Zone.Summit]: 'at the Summit', [Zone.Sea]: 'in the sea', [Zone.Indoors]: 'indoors' };
const ERROR_TEXT: Record<number, string> = {
  [ErrorCode.Full]: 'This party is full (6/6)', [ErrorCode.NotFound]: "We couldn't find that party", [ErrorCode.Expired]: 'That code has run out. Ask for a new one',
  [ErrorCode.Locked]: 'This party is closed', [ErrorCode.RateLimited]: 'Please wait a moment and try again', [ErrorCode.BadVersion]: 'Please reload the game',
};
const ERROR_BUCKET: Record<number, string> = { [ErrorCode.Full]: 'full', [ErrorCode.NotFound]: 'not_found', [ErrorCode.Expired]: 'expired', [ErrorCode.Locked]: 'locked' };

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

/** The card's scrolling body: edges fade softly (mask) only where more content waits, never a hard clip. Padding keeps button
 *  edges / focus rings from being cut at rest. */
function FadeScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const update = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.dataset.top = el.scrollTop > 2 ? '1' : '0';
    el.dataset.bottom = el.scrollHeight - el.clientHeight - el.scrollTop > 2 ? '1' : '0';
  }, []);
  useLayoutEffect(() => {
    update();
    const el = ref.current; if (!el) return;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el); if (el.firstElementChild) ro?.observe(el.firstElementChild);
    window.addEventListener('resize', update);
    return () => { ro?.disconnect(); window.removeEventListener('resize', update); };
  }, [update]);
  return <div ref={ref} className={styles.fadeScroll} data-party-scroll onScroll={update}><div>{children}</div></div>;
}

/**
 * Dialog shell: backdrop, Esc closes, focus moves in. Same cream card look as the other island cards.
 * With `grow`, the card grows out of the HUD button and shrinks back into it before unmounting: a clip-path reveal with a constant corner radius
 * (no scale, so no oval); content fades in after the shell has grown. Reduced motion: no morph, no fade-out.
 * `children` may be a function that receives the animated close (for the card's own Done button).
 */
function Card({ children, onClose, label, grow, from }: { children: ReactNode | ((close: () => void) => ReactNode); onClose: () => void; label: string; grow?: boolean; from?: DOMRect | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const closeRef = useRef(onClose); closeRef.current = onClose;
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
    ref.current?.querySelector<HTMLElement>('input,button')?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); requestClose(); } };
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
  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [hidden, setHidden] = useState<ReadonlySet<number>>(new Set());
  const [muted, setMuted] = useState<ReadonlySet<number>>(new Set());
  const [queue, setQueue] = useState<Note[]>([]);
  const [shown, setShown] = useState<string | null>(null);
  const [kickPrompt, setKickPrompt] = useState(false);
  const everLive = useRef(false);
  const track = useRef(onTrack); track.current = onTrack;
  const joining = useRef<'host' | 'guest' | null>(null);
  const prevIds = useRef<Set<number> | null>(null);
  const prevStatus = useRef(state.status);
  const live = state.status === 'live' || state.status === 'reconnecting';

  useEffect(() => bindConnection(connection), [connection]);
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
    if (added.length) note({ kind: 'join', names: added });
  }, [state.members, state.status, state.you, note]);
  useEffect(() => {
    const was = prevStatus.current;
    prevStatus.current = state.status;
    if (state.status === was) return;
    if (state.status === 'reconnecting') text('Reconnecting');
    if (state.status === 'live' && joining.current) {
      if (joining.current === 'guest') track.current?.('mp_party_joined', String(state.members.length));
      joining.current = null; setBusy(false); setJoinMsg(null);
      setView((v) => (v === 'join' ? 'none' : v));
    }
    if (state.status === 'ended' || (state.status === 'idle' && (was === 'live' || was === 'reconnecting'))) {
      if (was === 'live' || was === 'reconnecting') { track.current?.('mp_party_ended'); text(state.error === ErrorCode.Kicked ? 'You left the party' : 'The party ended'); }
      prevIds.current = null; setView('none'); setConfirmEnd(false);
    }
  }, [state.status, state.error, state.members.length, text]);
  useEffect(() => {
    if (live) everLive.current = true;
    if (!live) setKickPrompt(false);
  }, [live]);
  useEffect(() => {
    // Kicked: the connection ends in status 'error' (not 'ended'), so the "left" note is raised here (review #16).
    if (state.error !== ErrorCode.Kicked || !everLive.current) return;
    everLive.current = false;
    track.current?.('mp_party_ended'); text('You left the party');
    prevIds.current = null; setView('none'); setConfirmEnd(false);
  }, [state.error, text]);
  useEffect(() => {
    if (state.error === null || state.error === ErrorCode.Kicked) return;
    if (!joining.current) return;
    const msg = ERROR_TEXT[state.error] ?? "Couldn't join that party";
    track.current?.('mp_join_failed', ERROR_BUCKET[state.error] ?? 'other');
    joining.current = null; setBusy(false); setJoinMsg(msg); connection.leave();
  }, [state.error, connection]);

  // ---- open from the HUD, and from a pending link ----
  const openMenu = useCallback(() => { setPending(null); setFrom(openerRect()); setView('menu'); }, []);
  useEffect(() => { window.addEventListener(PARTY_EVENT, openMenu); return () => window.removeEventListener(PARTY_EVENT, openMenu); }, [openMenu]);
  // Take ?party= out of the URL as soon as the island mounts (the code waits in sessionStorage for the intro to finish).
  useEffect(() => { readPendingParty(); }, []);
  const linkChecked = useRef(false);
  useEffect(() => {
    if (!islandReady || !introDone || linkChecked.current || live) return;
    linkChecked.current = true;
    const code = readPendingParty();
    if (code) { setJoinCode(code); setJoinMsg(null); setView('join'); }
  }, [islandReady, introDone, live]);

  // ---- gate, then create / join ----
  const afterGate = (p: Pending) => { if (parentGatePassed()) run(p); else { setPending(p); setView('gate'); } };
  const run = (p: Pending) => { setPending(null); if (p.kind === 'create') void startCreate(); else void startJoin(p.code); };
  async function startCreate() {
    setBusy(true); setView('menu'); setJoinMsg(null);
    const r = await createParty();
    setBusy(false);
    if ('error' in r) { text(r.error === 'rate' ? 'Too many parties. Try again later' : "Can't reach the party service"); track.current?.('mp_join_failed', r.error); return; }
    joining.current = 'host';
    connection.join(r.code, { look: look(), hostKey: r.hostKey, animal: getAnimalChoice(), nick: getNick() });
    track.current?.('mp_party_created');
    setView('invite');
  }
  async function startJoin(code: string) {
    setBusy(true); setJoinCode(code); setJoinMsg(null); setView('join');
    const info = await checkParty(code);
    if (!info) { setBusy(false); setJoinMsg("We couldn't find that party"); track.current?.('mp_join_failed', 'not_found'); return; }
    if (info.full) { setBusy(false); setJoinMsg('This party is full (6/6)'); track.current?.('mp_join_failed', 'full'); return; }
    if (!info.open) { setBusy(false); setJoinMsg('That party is closed or the code has run out'); track.current?.('mp_join_failed', 'closed'); return; }
    clearPendingParty();
    joining.current = 'guest';
    connection.join(code, { look: look(), animal: getAnimalChoice(), nick: getNick() });
  }

  const close = useCallback(() => { setView('none'); setPending(null); setConfirmEnd(false); }, []);
  const closeJoin = useCallback(() => { clearPendingParty(); setBusy(false); setView('none'); }, []);
  const toggle = (set: ReadonlySet<number>, id: number, cb?: (s: ReadonlySet<number>) => void, apply?: (s: ReadonlySet<number>) => void) => {
    const next = new Set(set); if (!next.delete(id)) next.add(id); apply?.(next); cb?.(next);
  };
  const friends: Member[] = state.members.filter((m) => m.id !== state.you);
  const me = state.members.find((m) => m.id === state.you);
  const leave = () => { connection.leave(); setView('none'); text('You left the party'); };

  return (
    <>
      {live && (
        <div className={styles.corner} data-party-corner>
          <PartyChip count={state.members.length} reconnecting={state.status === 'reconnecting'} open={view === 'sheet'} onClick={() => setView(view === 'sheet' ? 'none' : 'sheet')} />
        </div>
      )}
      {shown && <p className={styles.toast} role="status" data-party-toast>{shown}</p>}

      {view === 'menu' && (
        <Card label="Play with friends" onClose={close} grow from={from}>
          {(requestClose) => <section className={`${styles.card} ${styles.menuCard}`} data-party-menu aria-labelledby="party-menu-title">
            <header className={styles.menuHeader}>
              <span aria-hidden="true" />
              <h2 id="party-menu-title">Play with friends</h2>
              <DoneButton onDone={requestClose} />
            </header>
            <FadeScroll>
            <p className={styles.small}>Friends join your island with a code. Nobody can chat.</p>
            <AnimalPicker />
            <NickField />
            <div className={styles.stack}>
              <button type="button" className={styles.primary} disabled={busy} onClick={() => afterGate({ kind: 'create' })}><Icon name="people" size={20} /> {busy ? 'Starting' : 'Start a party'}</button>
              <button type="button" className={styles.secondary} disabled={busy} onClick={() => { setJoinCode(''); setJoinMsg(null); setView('join'); }}>Join with a code</button>
            </div>
            </FadeScroll>
          </section>}
        </Card>
      )}
      {view === 'gate' && pending && (
        <Card label="For grown-ups" onClose={close}>
          <ParentGate reason={pending.kind === 'create' ? 'Invite friends to play on your island. Nobody can chat.' : 'Join a friend’s party. Nobody can chat.'} onCancel={close} onPass={() => run(pending)} />
        </Card>
      )}
      {view === 'join' && (
        <Card label="Join with a code" onClose={closeJoin}>
          <JoinParty initial={joinCode} message={joinMsg} busy={busy} onClose={closeJoin} onJoin={(c) => afterGate({ kind: 'join', code: c })} />
        </Card>
      )}
      {view === 'invite' && state.code && (
        <Card label="Invite friends" onClose={close}>
          <PartyInvite code={state.code} expiresAt={state.codeExpiresAt} onNote={text} onClose={close} />
        </Card>
      )}
      {view === 'sheet' && live && (
        <Card label="Party" onClose={close}>
          <section className={styles.card} data-party-sheet aria-labelledby="party-sheet-title">
            <h3 id="party-sheet-title">Your party</h3>
            <ul className={styles.members}>
              {me && <li className={styles.member} aria-label={`You, ${displayName(me)}, ${colourName(me.colourIdx).toLowerCase()}`}><span className={pickerStyles.dot} style={{ background: me.colourHex }} aria-hidden="true" /><span className={styles.mname}><span aria-hidden="true">{me.animalGlyph} </span>You ({displayName(me)}){me.nick && <small>{me.name}</small>}</span>{me.isHost && <span className={styles.badge}>Host</span>}</li>}
              {friends.map((m) => (
                <li key={m.id} className={styles.member} data-away={m.away ? '1' : undefined} aria-label={`${displayName(m)}, ${colourName(m.colourIdx).toLowerCase()}`}>
                  <span className={styles.zone} role="img" aria-label={ZONE_LABEL[m.zone] ?? 'on the island'}><Icon name={ZONE_ICON[m.zone] ?? 'home'} size={18} /></span>
                  <span className={pickerStyles.dot} style={{ background: m.colourHex }} aria-hidden="true" /><span className={styles.mname}><span aria-hidden="true">{m.animalGlyph} </span>{displayName(m)}{m.nick && <small>{m.name}</small>}</span>
                  {m.isHost && <span className={styles.badge}>Host</span>}
                  <button type="button" className={styles.mini} aria-pressed={hidden.has(m.id)} aria-label={`${hidden.has(m.id) ? 'Show' : 'Hide'} ${displayName(m)}`} onClick={() => toggle(hidden, m.id, onHiddenChange, setHidden)}><Glyph name="eyeoff" size={20} /></button>
                  <button type="button" className={styles.mini} aria-pressed={muted.has(m.id)} aria-label={`${muted.has(m.id) ? 'Unmute' : 'Mute'} emotes from ${displayName(m)}`} onClick={() => toggle(muted, m.id, onMutedChange, setMuted)}><Glyph name="mute" size={20} /></button>
                  {state.isHost && m.nick && <button type="button" className={styles.mini} data-reset-name aria-label={`Reset name to ${m.name}`} onClick={() => { connection.host.resetName(m.id); text('Name reset'); }}><Icon name="rotate" size={20} /></button>}
                  {state.isHost && <button type="button" className={styles.mini} aria-label={`Remove ${displayName(m)}`} onClick={() => { connection.host.kick(m.id); setKickPrompt(true); }}><Icon name="close" size={20} /></button>}
                </li>
              ))}
              {!friends.length && <li className={styles.small}>Waiting for friends to join.</li>}
            </ul>
            {kickPrompt && state.isHost && (
              <div className={styles.stack} data-party-kick-prompt>
                <p className={styles.small}>Friend removed. Keep others out?</p>
                <button type="button" className={styles.secondary} onClick={() => { connection.host.rotate(); text('New code'); setKickPrompt(false); }}><Icon name="rotate" size={20} /> New code</button>
                <button type="button" className={styles.secondary} onClick={() => { connection.host.lock(true); partyStore.setLocked(true); setKickPrompt(false); }}><Glyph name="lock" size={20} /> Lock party</button>
                <button type="button" className={styles.ghost} onClick={() => setKickPrompt(false)}>Not now</button>
              </div>
            )}
            <div className={styles.stack}>
              {state.isHost && state.code && <button type="button" className={styles.primary} onClick={() => setView('invite')}><Glyph name="link" size={20} /> Invite</button>}
              {state.isHost && <button type="button" className={styles.secondary} aria-pressed={state.locked} onClick={() => { connection.host.lock(!state.locked); partyStore.setLocked(!state.locked); }}><Glyph name="lock" size={20} /> {state.locked ? 'Party is locked' : 'Lock party'}</button>}
              {state.isHost && <button type="button" className={styles.secondary} onClick={() => { connection.host.rotate(); text('New code'); }}><Icon name="rotate" size={20} /> New code</button>}
              {state.isHost && (confirmEnd
                ? <button type="button" className={styles.secondary} onClick={() => { connection.host.end(); setConfirmEnd(false); }}>Tap again to end for everyone</button>
                : <button type="button" className={styles.secondary} onClick={() => setConfirmEnd(true)}>End party for everyone</button>)}
              <button type="button" className={styles.ghost} onClick={leave}>Leave party</button>
            </div>
            <button type="button" className={styles.ghost} onClick={close}>Close</button>
          </section>
        </Card>
      )}
    </>
  );
}
