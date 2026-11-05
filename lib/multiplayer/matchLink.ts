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
import { SNAP_GAP_MS, IN_GAP_MS, encodeIn, decodeIn, type InAccum } from '../town/match/matchNet';
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
}
/** The live join flow (liveJoinRuntime's api). */
export interface MatchJoin {
  readonly joined: boolean; readonly format: LiveFormat | null;
  friends: ((f: LiveFormat) => FriendSlots | null) | null;
  friendsChanged(): void; say(text: string, seconds?: number): void; press(b: 'leave', down: boolean): void;
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

export function createMatchLink(d: MatchLinkDeps) {
  const now = d.now ?? (() => (typeof performance !== 'undefined' ? performance.now() : Date.now()));
  const rosters = new Map<number, Roster>();
  /** Friends added to my games on my field: member id -> slot. */
  const applied = new Map<number, string>();
  const frame: HumanFrame = { mx: 0, my: 0 }, snapOut: number[] = [], inOut: number[] = [], joinOut = [C.Match, MatchKind.Join, 0, 0, 0], leaveOut = [C.Match, MatchKind.Leave];
  let mine: { format: LiveFormat; field: number; idx: number; sentAt: number; confirmed: boolean } | null = null;
  let owner = false, seq = 0, inSeq = 0, lastSnap = -1e12, lastIn = -1e12, dirtyFriends = true;
  const matchIds = new Set<number>();
  // Watching (Nov 5 2026): a party friend who is NOT in a shared match sees the real one (a puppet of the owner's snapshots, friends on
  // their slots, no controls) instead of their own local match. One watched field at a time; back to the local sim when it ends.
  let watch: { format: LiveFormat; field: number; awakeAt: number; dirty: boolean } | null = null, watchSent = -1, stopAt = -1;
  const watchApplied = new Map<number, string>(), watchOut = [C.Match, MatchKind.Watch, -1];
  /** Fields I own: how many friends watch them (S.Match Watch). Alone on my field, I snapshot only while someone watches. */
  const watchers = new Map<number, number>();
  const active = () => d.conn.status === 'live' && (d.conn.caps & Cap.Match) !== 0;
  const fieldOf = (f: LiveFormat) => (MATCH_FIELDS as readonly string[]).indexOf(f);

  const off = d.conn.onMessage((m) => {
    if (m[0] !== S.Match) return;
    const a = m as unknown as number[];
    if (a[1] === MatchKind.Join) { // the roster (MATCH_ROSTER)
      const field = a[2], r: Roster = { owner: a[3], slots: new Map() };
      for (let i = 4; i + 2 < a.length; i += 3) r.slots.set(a[i], { team: a[i + 1] ? 'blue' : 'gold', idx: a[i + 2] });
      if (r.slots.size) rosters.set(field, r); else rosters.delete(field);
      dirtyFriends = true; if (watch && watch.field === field) watch.dirty = true; d.join.friendsChanged();
      return;
    }
    if (a[1] === MatchKind.Snap && watch && a[2] === watch.field) { d.games.pushSnap(watch.format, a, 3, now()); return; }
    if (a[1] === MatchKind.Watch) { if (a[3] > 0) watchers.set(a[2], a[3]); else watchers.delete(a[2]); return; } // I own it: friends watch
    if (!mine || !mine.confirmed) return;
    if (a[1] === MatchKind.In && owner) d.games.friendInput(mine.format, friendKey(a[2]), decodeIn(a, 3, frame));
    else if (a[1] === MatchKind.Snap && !owner && a[2] === mine.field) d.games.pushSnap(mine.format, a, 3, now());
  });

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
    applied.clear(); syncMatchIds(); owner = false; lastSnap = lastIn = -1e12;
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
      if (mine && joined !== mine.format) { d.conn.sendMatch(leaveOut); teardown(mine.format, null); mine = null; }
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
        if (inRoster) { mine.confirmed = true; dirtyFriends = true; }
        else {
          let takenBy = -1;
          r?.slots.forEach((v, id) => { if (v.idx === mine!.idx && id !== me) takenBy = id; });
          if (takenBy >= 0 && t - mine.sentAt < JOIN_RETRY_MS * 2) { // refused: a friend got that spot first
            d.join.say(`${d.nameOf(takenBy)} just took that spot. Tap Play to pick another!`);
            mine = null; d.join.press('leave', true); return;
          }
          if (t - mine.sentAt >= JOIN_RETRY_MS) {
            const myTeam = sim.players[sim.ids[mine.idx]]?.team === 'blue' ? 1 : 0;
            joinOut[2] = mine.field; joinOut[3] = myTeam; joinOut[4] = mine.idx;
            if (d.conn.sendMatch(joinOut)) mine.sentAt = t;
          }
          return;
        }
      } else if (!inRoster) { // the relay no longer has me (a reconnect): join again, my slot stays mine locally
        mine.confirmed = false; mine.sentAt = -1e12; return;
      }
      // ---- confirmed: owner or puppet, friends on their slots ----
      const isOwner = r!.owner === me, format = mine.format;
      if (isOwner !== owner || d.games.isPuppet(format) === isOwner) {
        const was = d.games.isPuppet(format);
        d.games.setPuppet(format, !isOwner);
        if (isOwner && was) d.join.say('Your friend left: the match is on your phone now. Play on!');
        owner = isOwner; dirtyFriends = true;
      }
      if (dirtyFriends) {
        dirtyFriends = false;
        applied.forEach((slot, id) => {
          const v = r!.slots.get(id);
          if (v && sim.ids[v.idx] === slot) return;
          d.games.dropFriend(format, friendKey(id)); applied.delete(id);
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
        if ((r!.slots.size > 1 || (watchers.get(mine.field) ?? 0) > 0) && t - lastSnap >= SNAP_GAP_MS) {
          const out = d.games.encodeSnap(format, mine.field, seq++, snapOut);
          if (out) { d.conn.sendMatch(out); lastSnap = t; }
        }
      } else {
        const acc = d.games.netInput();
        if (acc.urgent || (acc.dirty || t - lastIn >= 500) && t - lastIn >= IN_GAP_MS) { if (d.conn.sendMatch(encodeIn(acc, inSeq++, inOut))) lastIn = t; }
      }
    },
    /** Headless checks: my match state. */
    get state() { return { joined: !!mine?.confirmed, owner, friends: applied.size, field: mine?.field ?? -1, watching: watch ? watch.field : -1, watched: watchApplied.size }; },
    dispose() { off(); unwatch(); if (mine) teardown(mine.format, null); mine = null; d.join.friends = null; rosters.clear(); },
  };
  return api;
}
