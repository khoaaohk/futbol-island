// Multiplayer slice 2 (Nov 4 2026; docs/join-live-game-design.md "Multiplayer slice 2"): party friends play the SAME live match.
// The glue between the party connection (relay v1.8, Cap.Match: C.Match / S.Match, multiplayer/protocol/types.ts MatchKind), the live
// join flow (lib/town/liveJoinRuntime.ts) and the field runtime (lib/town/fieldRuntime.ts addFriend / setPuppet / pushSnap ...).
//  - The relay keeps one roster per field: who plays which slot, and the OWNER (the first joiner) whose phone runs the only MatchSim.
//  - I join locally first (the picker's Start, exactly as solo), then tell the relay my slot. If a friend took it a moment before me,
//    the relay leaves me out: I step off with a friendly line and pick again.
//  - Owner: friends' slots are locked to them in my sim (their own look + the bib, their name tag) and driven by their C.Match In;
//    every SNAP_GAP_MS I send a snapshot while a friend is on the field. Not the owner: my sim becomes a puppet of the owner's
//    snapshots and my controls go to the owner. A friend leaving: their slot goes back to the AI. The owner leaving: the relay hands
//    the field to the earliest remaining joiner, whose phone plays on from the last snapshot (a dropped ball).
//  - No relay (solo), an old relay (no Cap.Match) or a lost connection: nothing is sent and every kid plays their own local match.
// Kids first: no scores, coins or stats are counted for anyone; friends only ever see party nicknames.
// Heat: idle (no party, or not on a shared field) this costs one caps check per frame. No timers: Town calls update() per frame.
import { Cap, C, S, MatchKind, MATCH_FIELDS, type ServerMsg } from '../../multiplayer/protocol';
import { SNAP_GAP_MS, IN_GAP_MS, SNAP_MAX_LEN, SNAP_MAX_BYTES, encodeIn, decodeIn, type InAccum } from '../town/match/matchNet';
import { PHRASE_WIRE, packInPhrase, readInPhrase, packSnapPhrase, readSnapPhrase, appendSnapPhrase, type PhraseBus } from '../town/quickPhrases';
import type { HumanFrame, HumanTeam } from '../town/match/humanInputs';
import type { FriendSlots } from '../town/liveJoin';
import type { BeanDress, MatchKits } from '../town/beanLooks';
import type { LiveFormat } from '../town/venues';

export const ME = 'me';
export const friendKey = (id: number) => 'mp:' + id;
type DressFor = (home: boolean, kits: MatchKits | undefined, keeper?: boolean) => BeanDress;
type SimLike = { ids: readonly string[]; players: Record<string, { team: HumanTeam }> };
/** The field runtime calls matchLink needs (fieldRuntime.ts implements them; tests/join-live-mp.cjs fakes them over a real MatchSim). */
export interface MatchGames {
  simOf(f: LiveFormat): SimLike | null;
  slotOf(f: LiveFormat, humanId: string): string | null;
  addFriend(f: LiveFormat, humanId: string, team: HumanTeam, slot: string, name: string, dressFor: DressFor): string | null;
  dropFriend(f: LiveFormat, humanId: string): void;
  setPuppet(f: LiveFormat, on: boolean): void;
  isPuppet(f: LiveFormat): boolean;
  pushSnap(f: LiveFormat, data: readonly number[], from: number, tMs: number): boolean;
  encodeSnap(f: LiveFormat, field: number, seq: number, out: number[]): number[] | null;
  friendInput(f: LiveFormat, humanId: string, frame: HumanFrame): void;
  netInput(): InAccum;
  /** The field is awake (on screen or near me; fieldRuntime's dormant test). Watching a friends' match only while it is (absent: always). */
  awake?(f: LiveFormat): boolean;
  /** Forget the snapshots buffered so far (QA round 1, Nov 5 2026): a new owner's stream has its own seq and serials. */
  resetSnaps?(f: LiveFormat): void;
}
/** The live join flow (liveJoinRuntime's api). */
export interface MatchJoin {
  readonly joined: boolean; readonly format: LiveFormat | null;
  friends: ((f: LiveFormat) => FriendSlots | null) | null;
  friendsChanged(): void; say(text: string, seconds?: number): void; press(b: 'leave', down: boolean): void;
  /** Quick phrases (lib/town/quickPhrases.ts, Nov 7 2026): my latest phrase out, friends' phrases in. Absent: no phrases on the wire. */
  readonly phrases?: PhraseBus | null;
}
export interface MatchConn { readonly caps: number; readonly status: string; sendMatch(msg: number[]): boolean; onMessage(fn: (m: ServerMsg) => void): () => void }
export type MatchLinkDeps = {
  conn: MatchConn; games: MatchGames; join: MatchJoin;
  /** My party member id (-1 before a Welcome). */
  me(): number;
  /** A friend's party nickname / colour name, and their dress for a slot (own look + the bib: Town's ownKitLook path). */
  nameOf(id: number): string; dressOf(id: number): DressFor;
  /** Friends whose island avatar should hide (they are on my match: drawn on their slot rig). */
  setMatchFriends?(ids: ReadonlySet<number>): void;
  now?(): number;
};
type Roster = { owner: number; slots: Map<number, { team: HumanTeam; idx: number }> };
/** How long a sent Join may go unanswered before it is sent again (ms). */
const JOIN_RETRY_MS = 3000;
/** Watching (Nov 5 2026): a friends' match I am not in keeps being watched this long after its field fell asleep (ms), so panning the
 *  camera never flaps the C.Match Watch frame (the relay's Join / Leave / Watch bucket is 0.5/s, burst 4). */
const WATCH_HOLD_MS = 8000;
/** How long "watch nothing" must hold before the relay is told (ms). */
const WATCH_STOP_MS = 2000;
/** QA round 1 (Nov 5 2026): never send In faster than the relay's MATCH_RATE refill (16/s): a kid mashing Tackle while steering sent
 *  ~20/s and the relay silently dropped ~1 tap in 6 (taps wait OR-ed, so a press is at most this much later, never lost). */
const IN_MIN_GAP_MS = 64;
/** Owner: a friend's In stream silent this long (a stalled socket: 2 missed keepalives + jitter) lets go of their stick, so their
 *  player stops instead of running on with the last stick for the whole stall (5 s: ~100 u across the pitch). */
const IN_STALE_MS = 1200;
/** QA round 2 (Nov 5 2026): a friend whose owner's snapshots stop this long (a locked / backgrounded phone, a stalled socket) sees
 *  "Waiting for <owner>…" in the tip spot under the score bar until they resume (re-said each frame for STALL_TIP_S: it fades
 *  that long after the next snapshot; one string per stall, no per-frame allocation). */
export const STALL_HINT_MS = 2000;
const STALL_TIP_S = 0.25;

export function createMatchLink(d: MatchLinkDeps) {
  const now = d.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const rosters = new Map<number, Roster>();
  /** Friends added to my games on my field: member id -> slot. */
  const applied = new Map<number, string>();
  const frame: HumanFrame = { mx: 0, my: 0 }, snapOut: number[] = [], inOut: number[] = [], joinOut = [C.Match, MatchKind.Join, 0, 0, 0], leaveOut = [C.Match, MatchKind.Leave];
  let mine: { format: LiveFormat; field: number; idx: number; sentAt: number; confirmed: boolean } | null = null;
  let owner = false, seq = 0, inSeq = 0, lastSnap = -1e12, lastIn = -1e12, dirtyFriends = true;
  /** Friend: when the owner's last snapshot arrived (or the stream began); the stall line, built once per owner. Owner: I handed my
   *  field on (going to the background) and should hear who runs it when I am back. */
  let snapAt = -1e12, stallFor = -1, stallText = '', stalled = false, handedOff = false, away = false, welcomeBack = false;
  const matchIds = new Set<number>();
  // Watching (Nov 5 2026): a party friend who is NOT in a shared match sees the real one (a puppet of the owner's snapshots, friends on
  // their slots, no controls) instead of their own local match. One watched field at a time; back to the local sim when it ends.
  let watch: { format: LiveFormat; field: number; awakeAt: number; dirty: boolean } | null = null, watchSent = -1, stopAt = -1;
  const watchApplied = new Map<number, string>(), watchOut = [C.Match, MatchKind.Watch, -1];
  /** Fields I own: how many friends watch them (S.Match Watch). Alone on my field, I snapshot only while someone watches. */
  const watchers = new Map<number, number>();
  /** Owner: when each friend's last In arrived (-1: released after a stall, until the next one). */
  const inAt = new Map<number, number>();
  const still: HumanFrame = { mx: 0, my: 0 };
  // Quick phrases (Nov 7 2026; lib/town/quickPhrases.ts PHRASE_WIRE): a friend's phrase rides their In frame to the owner, the owner
  // re-broadcasts it (and its own) as one optional trailing Snap value. No relay / protocol change. Owner: the last phrase seen per
  // member and a tiny relay ring; friend: the last one seen per slot; both: my last serial sent. Fixed objects, no per-frame allocation.
  const inPhraseSeen = new Map<number, number>(), snapPhraseSeen = new Int16Array(32).fill(-1), phraseIn = { slot: 0, id: 0, serial: 0 };
  const relayQ = Array.from({ length: 4 }, () => ({ value: 0, at: -1e12 })); let relayHead = 0, myPhraseSent = 0;
  const queueRelay = (slot: number, id: number, serial: number, t: number) => { const q = relayQ[relayHead]; relayHead = (relayHead + 1) % relayQ.length; q.value = packSnapPhrase(slot, id, serial); q.at = t; };
  const phraseReset = () => { inPhraseSeen.clear(); snapPhraseSeen.fill(-1); for (const q of relayQ) q.at = -1e12; };
  const active = () => d.conn.status === 'live' && (d.conn.caps & Cap.Match) !== 0;
  const fieldOf = (f: LiveFormat) => (MATCH_FIELDS as readonly string[]).indexOf(f);

  const off = d.conn.onMessage((m) => {
    if (m[0] !== S.Match) return;
    const a = m as unknown as number[];
    if (a[1] === MatchKind.Join) { // the roster (MATCH_ROSTER)
      const field = a[2], r: Roster = { owner: a[3], slots: new Map() };
      for (let i = 4; i + 2 < a.length; i += 3) r.slots.set(a[i], { team: a[i + 1] ? 'blue' : 'gold', idx: a[i + 2] });
      // A new owner (migration): its snapshots are a new stream (own seq, own popup serials). Without this a friend dropped every frame
      // until the new owner's seq passed the old one's (a frozen match for as long as the old owner had played; QA round 1, Nov 5 2026).
      const was = rosters.get(field);
      if (was && was.owner !== r.owner) { const f = MATCH_FIELDS[field] as LiveFormat | undefined; if (f && d.games.isPuppet(f)) d.games.resetSnaps?.(f); if (mine && mine.field === field) snapAt = now(); }
      if (r.slots.size) rosters.set(field, r); else rosters.delete(field);
      dirtyFriends = true; if (watch && watch.field === field) watch.dirty = true; d.join.friendsChanged();
      return;
    }
    if (a[1] === MatchKind.Snap && watch && a[2] === watch.field) { d.games.pushSnap(watch.format, a, 3, now()); return; }
    if (a[1] === MatchKind.Watch) { if (a[3] > 0) watchers.set(a[2], a[3]); else watchers.delete(a[2]); return; } // I own it: friends watch
    if (!mine || !mine.confirmed) return;
    if (a[1] === MatchKind.In && owner) {
      inAt.set(a[2], now());
      const pv = readInPhrase(a, 3); // always stripped first: the sim never sees the phrase bits
      if (pv >= 0 && inPhraseSeen.get(a[2]) !== pv) { inPhraseSeen.set(a[2], pv); const v = rosters.get(mine.field)?.slots.get(a[2]); if (v) { d.join.phrases?.show(v.idx, pv & 7); queueRelay(v.idx, pv & 7, pv >> 3, now()); } }
      d.games.friendInput(mine.format, friendKey(a[2]), decodeIn(a, 3, frame));
    }
    else if (a[1] === MatchKind.Snap && !owner && a[2] === mine.field) {
      snapAt = now(); d.games.pushSnap(mine.format, a, 3, now());
      const p = readSnapPhrase(a, phraseIn);
      if (p && p.slot !== mine.idx) { const k = p.id | (p.serial << 3); if (snapPhraseSeen[p.slot] !== k) { snapPhraseSeen[p.slot] = k; d.join.phrases?.show(p.slot, p.id); } }
    }
  });

  // The page going to the background (visibilitychange hidden, pagehide: also a locked phone) hands my field on (api.handOff).
  const onVis = () => { if (typeof document !== 'undefined' && document.visibilityState === 'hidden') api.handOff(); }, onHide = () => { api.handOff(); };
  if (typeof document !== 'undefined' && typeof window !== 'undefined') { document.addEventListener('visibilitychange', onVis); window.addEventListener('pagehide', onHide); }
  const offVis = () => { if (typeof document !== 'undefined' && typeof window !== 'undefined') { document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', onHide); } };

  d.join.friends = (f) => {
    if (!active()) return null;
    const r = rosters.get(fieldOf(f)), sim = d.games.simOf(f);
    if (!r || !sim) return null;
    const out = new Map<string, { name: string; team: HumanTeam }>(), me = d.me();
    r.slots.forEach((v, id) => { const slot = sim.ids[v.idx]; if (id !== me && slot) out.set(slot, { name: d.nameOf(id), team: v.team }); });
    return out;
  };

  function syncMatchIds() {
    let same = matchIds.size === applied.size + watchApplied.size;
    if (same) applied.forEach((_s, id) => { if (!matchIds.has(id)) same = false; });
    if (same) watchApplied.forEach((_s, id) => { if (!matchIds.has(id)) same = false; });
    if (same) return;
    matchIds.clear(); applied.forEach((_s, id) => matchIds.add(id)); watchApplied.forEach((_s, id) => matchIds.add(id));
    d.setMatchFriends?.(new Set(matchIds));
  }
  /** Stop watching: the friends' slots go back to the AI and my local sim runs again from the last snapshot. */
  function unwatch() {
    if (!watch) return;
    const f = watch.format; watch = null;
    watchApplied.forEach((_s, id) => d.games.dropFriend(f, friendKey(id))); watchApplied.clear();
    if (d.games.isPuppet(f)) d.games.setPuppet(f, false);
    syncMatchIds();
  }
  /** Per frame: pick / keep / drop the friends' match I watch, keep its friends on their slots, tell the relay (on change only). */
  function watchUpdate(t: number, joined: LiveFormat | null) {
    const me = d.me();
    if (watch) {
      const r = rosters.get(watch.field);
      if (!r || r.slots.has(me) || joined === watch.format) unwatch();
      else if (d.games.awake?.(watch.format) ?? true) watch.awakeAt = t;
      else if (t - watch.awakeAt > WATCH_HOLD_MS) unwatch();
    }
    if (!watch && rosters.size) {
      for (const [field, r] of rosters) {
        const f = MATCH_FIELDS[field] as LiveFormat | undefined;
        if (!f || r.slots.has(me) || f === joined || f === mine?.format || !d.games.simOf(f) || !(d.games.awake?.(f) ?? true)) continue;
        watch = { format: f, field, awakeAt: t, dirty: true }; d.games.setPuppet(f, true); break;
      }
    }
    if (watch?.dirty) {
      const r = rosters.get(watch.field), sim = d.games.simOf(watch.format), f = watch.format;
      watch.dirty = false;
      if (r && sim) {
        watchApplied.forEach((slot, id) => { const v = r.slots.get(id); if (v && sim.ids[v.idx] === slot) return; d.games.dropFriend(f, friendKey(id)); watchApplied.delete(id); });
        r.slots.forEach((v, id) => {
          if (id === me || watchApplied.has(id)) return;
          const slot = sim.ids[v.idx]; if (!slot) return;
          const got = d.games.addFriend(f, friendKey(id), v.team, slot, d.nameOf(id), d.dressOf(id));
          if (got) watchApplied.set(id, got);
        });
        syncMatchIds();
      }
    }
    // Joining the field I watched: the relay may keep me as its watcher (I get its Snaps as a member anyway), so no "stop" frame
    // spends the Join's rate token; the stop goes out when I neither watch nor play there.
    // A stop waits WATCH_STOP_MS (a Leave is often followed by watching the same field a frame later, when the roster arrives).
    const want = watch ? watch.field : joined !== null && watchSent >= 0 && MATCH_FIELDS[watchSent] === joined ? watchSent : -1;
    if (want === watchSent) { stopAt = -1; return; }
    if (want < 0) { if (stopAt < 0) stopAt = t; if (t - stopAt < WATCH_STOP_MS) return; }
    watchOut[2] = want; if (d.conn.sendMatch(watchOut)) { watchSent = want; stopAt = -1; }
  }
  /** Back to my own local match: friends' slots to the AI, my sim runs again. */
  function teardown(format: LiveFormat | null, why: string | null) {
    if (format) {
      applied.forEach((_s, id) => d.games.dropFriend(format, friendKey(id)));
      if (d.games.isPuppet(format)) d.games.setPuppet(format, false);
    }
    applied.clear(); inAt.clear(); phraseReset(); syncMatchIds(); owner = false; lastSnap = lastIn = -1e12; handedOff = stalled = away = welcomeBack = false;
    if (why) d.join.say(why);
  }

  const api = {
    /** Per frame from Town, after liveJoin.update (which joins / leaves the local slot). */
    update() {
      const t = now(), joined = d.join.joined && d.join.format !== null ? d.join.format : null;
      if (!active()) {
        unwatch(); watchSent = -1; stopAt = -1; // the relay forgets watchers on a reconnect (C.Caps): sent again once live
        if (mine) { const lost = mine.confirmed && (applied.size > 0 || d.games.isPuppet(mine.format)); teardown(mine.format, lost ? 'Lost your friends’ match: the game plays on here' : null); mine = null; }
        if (rosters.size) { rosters.clear(); d.join.friendsChanged(); }
        watchers.clear();
        return;
      }
      // Left, or (QA round 2 chaos) left and joined another slot before this ran: the relay must hear the old slot go first.
      if (mine && (joined !== mine.format || d.games.slotOf(mine.format, ME) !== d.games.simOf(mine.format)?.ids[mine.idx])) { d.conn.sendMatch(leaveOut); teardown(mine.format, null); mine = null; }
      watchUpdate(t, joined);
      if (joined && !mine) {
        const slot = d.games.slotOf(joined, ME), sim = d.games.simOf(joined), field = fieldOf(joined);
        if (!slot || !sim || field < 0) return;
        mine = { format: joined, field, idx: sim.ids.indexOf(slot), sentAt: -1e12, confirmed: false };
      }
      if (!mine) return;
      const sim = d.games.simOf(mine.format);
      if (!sim) return;
      const me = d.me(), r = rosters.get(mine.field), inRoster = !!r && r.slots.has(me);
      if (!mine.confirmed) {
        if (inRoster) { mine.confirmed = true; dirtyFriends = true; welcomeBack = handedOff; handedOff = false; }
        else {
          // Handed on (handOff): no Join while the page is hidden (a hidden phone must never be made the owner again when the others
          // leave); back on screen, Join my slot at once (the last joiner: a friend of the new owner, or the owner if all left).
          if (away) { if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return; away = false; mine.sentAt = -1e12; }
          let takenBy = -1;
          r?.slots.forEach((v, id) => { if (v.idx === mine!.idx && id !== me) takenBy = id; });
          if (takenBy >= 0 && t - mine.sentAt < JOIN_RETRY_MS * 2) { // refused: a friend got that spot first
            d.join.say(`${d.nameOf(takenBy)} just took that spot. Tap Play to pick another!`);
            // QA round 2: back to my own match cleanly (after a hand-off I still had the old owner flag and my friends on their slots)
            teardown(mine.format, null); mine = null; d.join.press('leave', true); return;
          }
          if (t - mine.sentAt >= JOIN_RETRY_MS) {
            const myTeam = sim.players[sim.ids[mine.idx]]?.team === 'blue' ? 1 : 0;
            joinOut[2] = mine.field; joinOut[3] = myTeam; joinOut[4] = mine.idx;
            if (d.conn.sendMatch(joinOut)) mine.sentAt = t;
          }
          return;
        }
      } else if (!inRoster) { // the relay no longer has me (a reconnect): join again, my slot stays mine locally
        // Nov 5 2026: an OWNER the relay took off the field (silent-owner promotion on a new relay: my phone slept without handing on;
        // or my socket dropped on any relay) is treated like my own hand-off: no Join while hidden, then "X kept the match going".
        if (owner) handedOff = away = true;
        mine.confirmed = false; mine.sentAt = -1e12; return;
      }
      // ---- confirmed: owner or puppet, friends on their slots ----
      const isOwner = r!.owner === me, format = mine.format;
      if (isOwner !== owner || d.games.isPuppet(format) === isOwner) {
        const was = d.games.isPuppet(format);
        d.games.setPuppet(format, !isOwner);
        if (isOwner && was) d.join.say('Your friend left: the match is on your phone now. Play on!');
        else if (!isOwner && welcomeBack) d.join.say(`${d.nameOf(r!.owner)} kept the match going while you were away. Play on!`);
        if (!isOwner) snapAt = t;
        owner = isOwner; dirtyFriends = true;
      }
      welcomeBack = false;
      if (dirtyFriends) {
        dirtyFriends = false;
        applied.forEach((slot, id) => {
          const v = r!.slots.get(id);
          if (v && sim.ids[v.idx] === slot) return;
          d.games.dropFriend(format, friendKey(id)); applied.delete(id); inAt.delete(id);
          if (!v) d.join.say(`${d.nameOf(id)} left the match. A teammate takes their place.`);
        });
        r!.slots.forEach((v, id) => {
          if (id === me || applied.has(id)) return;
          const slot = sim.ids[v.idx];
          if (!slot) return;
          const got = d.games.addFriend(format, friendKey(id), v.team, slot, d.nameOf(id), d.dressOf(id));
          if (got) applied.set(id, got);
        });
        syncMatchIds();
      }
      if (owner) {
        applied.forEach((_s, id) => { const at = inAt.get(id); if (at === undefined) inAt.set(id, t); else if (at >= 0 && t - at > IN_STALE_MS) { inAt.set(id, -1); d.games.friendInput(format, friendKey(id), still); } });
        if ((r!.slots.size > 1 || (watchers.get(mine.field) ?? 0) > 0) && t - lastSnap >= SNAP_GAP_MS) {
          // A fixed schedule (not "83 ms after the last send", which at 30-45 fps on a hot phone sent every 100 ms), and the seq counts
          // the gaps skipped by a stall: seq × SNAP_GAP_MS is my clock, which friends stamp frames with (matchNet JITTER).
          const gap = t - lastSnap;
          if (gap >= SNAP_GAP_MS * 2) { if (gap < 60000) seq += Math.floor(gap / SNAP_GAP_MS) - 1; lastSnap = t; } else lastSnap += SNAP_GAP_MS;
          const ph = d.join.phrases?.out;
          if (ph && ph.serial && ph.serial !== myPhraseSent && t - ph.at < PHRASE_WIRE.holdMs) { myPhraseSent = ph.serial; queueRelay(mine.idx, ph.id, ph.serial, t); }
          const out = d.games.encodeSnap(format, mine.field, seq, snapOut);
          // one live phrase per frame (rotating by seq), only while the frame still fits (the 512 B cap stays)
          if (out) for (let i = 0; i < relayQ.length; i++) { const q = relayQ[(seq + i) % relayQ.length]; if (t - q.at < PHRASE_WIRE.holdMs) { appendSnapPhrase(out, q.value, SNAP_MAX_LEN, SNAP_MAX_BYTES); break; } }
          seq++;
          if (out) d.conn.sendMatch(out);
        }
      } else {
        // QA round 2: the owner's snapshots stopped (a locked phone that did not hand over, a stalled socket): say whom we wait for.
        stalled = t - snapAt > STALL_HINT_MS;
        if (stalled) { if (stallFor !== r!.owner) { stallFor = r!.owner; stallText = `Waiting for ${d.nameOf(r!.owner)}…`; } d.join.say(stallText, STALL_TIP_S); }
        const acc = d.games.netInput();
        const ph = d.join.phrases?.out, say = !!ph && ph.serial > 0 && t - ph.at < PHRASE_WIRE.holdMs, fresh = say && ph!.serial !== myPhraseSent;
        if ((acc.urgent || acc.dirty || fresh || t - lastIn >= 500) && t - lastIn >= (acc.urgent || fresh ? IN_MIN_GAP_MS : IN_GAP_MS)) {
          encodeIn(acc, inSeq++, inOut); if (say) packInPhrase(inOut, ph!.id, ph!.serial); // repeated while fresh (a dropped In never loses it)
          if (d.conn.sendMatch(inOut)) { lastIn = t; if (say) myPhraseSent = ph!.serial; }
        }
      }
    },
    /** QA round 2 (Nov 5 2026): my phone goes to the background / locks / leaves the page while I run a shared match: friends would see
     *  it frozen until the hidden socket closes (HIDDEN_CLOSE_MS 15 s). Hand it on now through the existing frames, no relay change: my
     *  last snapshot (nothing I played since the last one is lost), then Leave: the relay gives the field to the earliest remaining
     *  joiner at once (as for any owner leaving) and a bot plays my slot while I am away. I do NOT re-join while hidden (a sleeping
     *  phone back on the roster would be made the owner again when the others leave: frozen friends); back on screen I Join my slot
     *  again as the last joiner, a friend of the new owner (the relay only ever has one owner: no split brain). If a friend took my
     *  slot meanwhile, I am told kindly and pick again. Only with a friend on the field (alone, or only watched, nobody would take
     *  over). A Leave dropped by the relay's Join / Leave bucket keeps me the owner (the old 15 s path). Returns true when sent. */
    handOff() {
      if (!mine?.confirmed || !owner || !active()) return false;
      const r = rosters.get(mine.field), v = r?.slots.get(d.me());
      if (!r || !v || r.slots.size < 2) return false;
      const out = d.games.encodeSnap(mine.format, mine.field, seq++, snapOut); if (out) d.conn.sendMatch(out);
      if (!d.conn.sendMatch(leaveOut)) return false;
      r.slots.delete(d.me()); // my copy of the roster as the relay will have it (a stale copy would confirm me again on my return)
      mine.confirmed = false; mine.sentAt = now(); handedOff = away = true;
      return true;
    },
    /** Headless checks: my match state. */
    get state() { return { joined: !!mine?.confirmed, owner, friends: applied.size, field: mine?.field ?? -1, watching: watch ? watch.field : -1, watched: watchApplied.size }; },
    /** Headless checks: the "Waiting for …" line is up (a friend, no snapshot for STALL_HINT_MS). */
    get stalled() { return stalled && !owner && !!mine?.confirmed; },
    dispose() { off(); offVis(); unwatch(); if (mine) teardown(mine.format, null); mine = null; d.join.friends = null; rosters.clear(); },
  };
  return api;
}
