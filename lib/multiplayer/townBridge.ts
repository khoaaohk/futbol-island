// The only thing Town.tsx calls (docs/multiplayer-design.md 5.1, 5.2). Wires the party connection + store + interp to the remote
// avatars and sends the local pose. With the flag off createPartyRuntime returns null (Town does nothing); outside a party the
// per-frame cost is one boolean check; inside, update() allocates nothing (scratch objects below).
import type * as THREE from 'three';
import { Activity, BallState, Cap, Mode, PoseFlag, RoomCode, S, Zone, presenceOf, roomOf, shielded, type MemberId, type PoseBody } from '../../multiplayer/protocol';
import { ballTouches, byteToDir, createKnockGate, dirToByte, fastBall, knockable } from '../town/ballKnock';
import { arcadeDoorHintText } from '../town/arcadeDoorHint';
import { bounceOffField, fieldHit, type FieldBall } from '../town/forceFieldBounce';
import { NOT_BUSY, armEntryWarp, entryWarp, entryWarpDue, fillLocalBody, islandJump, localPoseState, roomActivity, roomText } from './presence';
import { multiplayerEnabled } from './config';
import type { RemotePose } from './interp';
import type { LocalBump } from '../graphics/friendBump';
import { createFriendCore, SLEEP_SAMPLE_MS, hiddenFriends, mutedFriends, onFriendFilters } from './roomParty';
import { displayName, partyStore } from './store';
import * as T3 from 'three';

// The shared parts (one connection per page, Hide / Mute, the look, the friend core) live in roomParty.ts, used by rooms too.
export { partyConnection, setHiddenFriends, setMutedFriends, hiddenFriends, mutedFriends, partyLook } from './roomParty';

/** activity: NOT_BUSY (-1) while playing, else the Activity code (lib/multiplayer/presence.ts townActivity); optional for old callers. */
export type LocalPoseSource = () => { x: number; y: number; z: number; facing: number; speed: number; mode: Mode;
  zone: Zone; warp: boolean; hidden: boolean; activity?: number; pitch?: number };
export interface PartyRuntime { update(dt: number, nowMs: number, camera: THREE.Camera): void; dispose(): void;
  /** The friends' latest interpolated poses (read-only, reused objects): the emote button looks for a friend flying nearby.
   *  Friends inside a force field (busy / away) and friends indoors are NOT listed: nothing can emote at them or pick them. */
  friends(): Iterable<RemotePose>;
  /** The island ball against busy friends' force fields: bounces it off (mutates `ball`) and shakes the dome. True on a hit. */
  ballVsFields(ball: FieldBall): boolean;
  /** True while the party draws the local player's colour ring (the island's own cream foot ring then stays hidden: one ring only). */
  readonly meRing: boolean;
  /** Friend bumps: the local player's cosmetic overlay this frame (Town applies it around renderer.render only); null when not drawn. */
  readonly localBump: LocalBump | null;
  /** Heat checks: friends drawn as rigs last frame, and rigs alive (the demote / re-admit leak counter). */
  readonly shown: number; readonly rigs: number;
  /** Tests / headless checks only: friends' emote state (remoteAvatars.debugEmotes). */
  debugEmotes(): { id: MemberId; emote: number; age: number; x: number; z: number; yaw: number }[];
  /** Relay v1.4 two-ball duets: a friend's avatar plays its half with `partner` (-1 = me) as `role` (remoteAvatars.duet). */
  duet(id: MemberId, partner: number, role: number, emote: number, seed: number): boolean;
  endDuet(id: MemberId): void;
  /** A friend's interpolated pose this frame (reused object; null when not drawn / unknown). */
  friendPose(id: MemberId): RemotePose | null;
  /** The nearest friend I may ask for a ball emote: active (not busy / away / indoors), on foot, not hidden or muted, within `range` m
   *  (and 4 m in height) of x, y, z; -1 = none. */
  nearestAskable(x: number, y: number, z: number, range: number): MemberId;
  /** A friend's shown name (typed first name, else the colour name). */
  nameOf(id: MemberId): string;
  /** My member id in the live party (null when not in one). */
  readonly you: MemberId | null;
  /** Live feel: the local ball for friends (relay v1.2; visual only on their side). state = BallState; metres. Call every frame:
   *  the connection throttles (state changes, a moving Free ball at most 10 Hz). */
  ball(state: BallState, x: number, y: number, z: number): void;
  /** Relay v1.6 (Cap.Hit): MY kicked ball at x, y, z moving vx, vz against my friends' drawn bodies (on foot, outside the force field,
   *  not hidden). A touch fast enough sends C.Hit (the shooter decides; the tumble plays on every screen only when S.Hit comes back) and
   *  returns true so the ball bounces off them like off a townsperson. False on an old relay (friends are then never knocked over). */
  ballVsFriends(x: number, y: number, z: number, vx: number, vz: number): boolean;
  /** Friends' drawn balls moving fast enough to knock a townsperson over (each screen knocks its OWN townspeople with them).
   *  cb gets the ball spot and its estimated velocity (from the interpolated samples). No allocation. */
  eachFastFriendBall(cb: (x: number, y: number, z: number, vx: number, vz: number) => void): void;
  /** Friends tumbling right now after a ball knock-over (tests / headless checks). */
  readonly tumbling: number }
/** A room door on the island (docs/multiplayer-rooms-design.md, owner decision 1): a small "3 in the Konbini" hint over it while party
 *  friends are in THAT room. Client-only, from the roster. */
export type RoomDoorHint = { room: number; x: number; y: number; z: number };

// Town helper: assembles the local pose from values Town already has, into one reused object (no allocation per call).
const SUMMIT = { x: 640, z: 130, r: 150 }, CAY = { x: 612, z: -160, r: 120 };
const localOut = { x: 0, y: 0, z: 0, facing: 0, speed: 0, mode: Mode.Idle as Mode, zone: Zone.Main as Zone, warp: false, hidden: false, activity: NOT_BUSY, pitch: 0 };
export function partyLocal(
  loc: { x: number; z: number }, root: { position: { y: number }; rotation: { y: number } }, vel: { x: number; z: number },
  ride: string, swimming: boolean, diving: boolean, hidden: boolean, activity = NOT_BUSY, pitch = 0,
) {
  const o = localOut, speed = Math.hypot(vel.x, vel.z);
  o.x = loc.x; o.y = root.position.y; o.z = loc.z; o.facing = root.rotation.y; o.speed = speed; o.hidden = hidden;
  o.mode = diving ? Mode.Dive : swimming ? Mode.Swim : ride === 'scooter' ? Mode.Scooter : ride === 'bike' ? Mode.Bike
    : ride === 'moped' ? Mode.Moped : ride === 'jetpack' ? Mode.Jetpack : speed > 2.6 ? Mode.Run : speed > 0.15 ? Mode.Walk : Mode.Idle;
  const sx = loc.x - SUMMIT.x, sz = loc.z - SUMMIT.z, cx = loc.x - CAY.x, cz = loc.z - CAY.z;
  o.zone = swimming || diving ? Zone.Sea : sx * sx + sz * sz < SUMMIT.r * SUMMIT.r ? Zone.Summit : cx * cx + cz * cz < CAY.r * CAY.r ? Zone.Cay : Zone.Main;
  o.warp = false; o.activity = activity; o.pitch = pitch;
  return o;
}


const HINT_W = 320, HINT_H = 64, HINT_SCREEN = .16, HINT_RANGE = 120;
function hintTexture(text: string): T3.CanvasTexture {
  const canvas = document.createElement('canvas'); canvas.width = HINT_W; canvas.height = HINT_H; const g = canvas.getContext('2d');
  if (g) {
    g.font = '700 26px system-ui, "Apple Color Emoji", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    const w = Math.min(HINT_W - 8, g.measureText(text).width + 32), x0 = HINT_W / 2 - w / 2;
    g.fillStyle = 'rgba(20,34,46,.78)'; g.beginPath(); if (g.roundRect) g.roundRect(x0, 8, w, HINT_H - 16, 22); else g.rect(x0, 8, w, HINT_H - 16); g.fill();
    g.fillStyle = '#ffffff'; g.fillText(text, HINT_W / 2, 33, HINT_W - 24);
  }
  const t = new T3.CanvasTexture(canvas); t.colorSpace = T3.SRGBColorSpace; return t;
}
/** The door hint's words: "3 in the Konbini" (pure, exported for tests). */
export function doorHintText(n: number, room: number): string {
  if (room === RoomCode.Arcade) return arcadeDoorHintText(n); // "2 in the Arcade" (the building's sign name)
  return n > 0 ? `${n} ${DOOR_WORDS[room] ?? roomText(room).replace(/^In /, 'in ')}` : '';
}
/** Door hints that name the building as its sign does ("2 in the Museum"; the party list keeps "In the museum"). */
const DOOR_WORDS: Partial<Record<number, string>> = { [RoomCode.Museum]: 'in the Museum' };
/** Is this member counted at room `room`'s door? Their room pose says so, or (Arcade only) a LEGACY door pose: an old client in the
 *  Arcade sends Busy + Indoors + Activity.Arcade at the island door (lib/town/arcadeDoorHint.ts). */
export function atRoomDoor(m: { room: number; presence: string; activity: number }, room: number): boolean {
  return m.room === room || (room === RoomCode.Arcade && m.room < 0 && m.presence === 'indoors' && m.activity === Activity.Arcade);
}


export function createPartyRuntime(ctx: { scene: THREE.Scene; viewGate: { addUnitRoots(r: THREE.Object3D[]): void };
  local: LocalPoseSource; phone: boolean; reducedMotion: () => boolean;
  /** The ground height under x, z (flying friends' plumes settle on it). */
  groundAt?: (x: number, z: number) => number;
  /** A friend's emote was shown (Town counts it; this file stays analytics-free, tests/mp-isolation.cjs). Never says which friend. */
  onEmoteSeen?: () => void;
  /** Any friend's emote arrived (my character glances at a friend who waves nearby). */
  onFriendEmote?: (id: MemberId) => void;
  /** Room doors for the "3 in the Konbini" hint (none = no hint). */
  doors?: readonly RoomDoorHint[];
  /** Relay v1.6: someone was knocked over by a friend's ball (S.Hit), already checked here: victim -1 = ME (Town plays the local tumble
   *  overlay; it still checks rides / Battery saver), else that friend (their avatar already tumbles). dir = the wire byte; x, y, z = the spot. */
  onKnock?: (victim: number, dir: number, x: number, y: number, z: number) => void }): PartyRuntime | null {
  if (!multiplayerEnabled()) return null;
  // The island keeps a friend's last ISLAND spot: a room pose (room-local x / z, design 2.2) is drawn as "indoors at their last island
  // spot", so they fade out where they went in (at the door) as today; a friend first heard inside a room stays roster-only here.
  const lastIsland = new Map<MemberId, number[]>(), door: PoseBody = [0, 0, 0, 0, 0, Mode.Busy, Zone.Indoors, 0];
  const ew = entryWarp(); // the first pose after a Welcome (back from a room page) warps, + one retry (design 2.2)
  const st = localPoseState();
  let meRingOn = false; // the party draws my colour ring (the island's cream foot ring then stays hidden)
  const hints: { d: RoomDoorHint; sprite: T3.Sprite; n: number }[] = [];
  let ready = false; // the core's first sync runs inside createFriendCore (before `avatars` below exists)
  const core = createFriendCore({ scene: ctx.scene, phone: ctx.phone, onEmoteSeen: ctx.onEmoteSeen, onFriendEmote: ctx.onFriendEmote, groundAt: ctx.groundAt,
    admit(id, b) {
      const room = roomOf(b);
      if (room < 0) { const k = lastIsland.get(id); if (k) for (let i = 0; i < 8; i++) k[i] = b[i]; else lastIsland.set(id, b.slice()); return b; }
      const k = lastIsland.get(id);
      if (!k) return null;
      door[0] = k[0]; door[1] = k[1]; door[2] = k[2]; door[3] = k[3]; door[4] = roomActivity(room); door[5] = Mode.Busy; door[6] = Zone.Indoors; door[7] = b[7] & 2;
      return door;
    },
    onSync(live, welcome) {
      if (welcome) armEntryWarp(ew);
      if (!live) { st.lastX = st.lastZ = NaN; meRingOn = false; lastIsland.clear(); }
      // Bug sweep Oct 22: forget the island spot of a friend who left (ids are reused: a newcomer first heard in a room must not
      // fade in at the old friend's door).
      else if (ready) for (const id of Array.from(lastIsland.keys())) if (core.ids.indexOf(id) < 0) lastIsland.delete(id);
      syncHints();
    } });
  const { conn, avatars, poses, active, ids } = core;
  // The labels are the only units the view gate can measure: register the LABEL group (each sprite sits at its friend). Registering the
  // whole root made the batch, the rings and the force fields units at the world origin, so the gate hid every friend whenever the
  // origin was off screen (found Oct 22 2026 with the presence check); the remote layer already culls itself per friend.
  ctx.viewGate.addUnitRoots([avatars.labels]);
  const body: PoseBody = [0, 0, 0, 0, 0, Mode.Idle, Zone.Main, 0];
  const ring = { x: 0, y: 0, z: 0, hex: '', mode: 0, pitch: 0, yaw: 0 };
  let drawnLast = false; // the friend layer drew something last frame
  let jumpX = NaN, jumpZ = NaN; // the local spot last frame: a teleport sends Warp (presence.ts islandJump)
  let lastUpdateAt = -1e12;
  // Door hints: one screen-sized sprite per door, its texture redrawn only when that room's count changes (store emits on room flips).
  function syncHints() {
    if (!ready || !ctx.doors?.length) return;
    const s = partyStore.get(), live = s.status === 'live' || s.status === 'reconnecting', hid = hiddenFriends();
    for (let i = 0; i < ctx.doors.length; i++) {
      const d = ctx.doors[i];
      let h = hints[i];
      if (!h) { const sp = new T3.Sprite(new T3.SpriteMaterial({ transparent: true, depthWrite: false, depthTest: false, sizeAttenuation: false })); sp.renderOrder = 4; sp.scale.set(HINT_SCREEN, HINT_SCREEN * HINT_H / HINT_W, 1); sp.position.set(d.x, d.y, d.z); sp.visible = false; sp.raycast = () => {}; sp.name = 'party-door-hint'; avatars.root.add(sp); h = hints[i] = { d, sprite: sp, n: 0 }; }
      let n = 0;
      if (live) for (const m of s.members) if (m.id !== s.you && atRoomDoor(m, d.room) && !hid.has(m.id)) n++;
      if (n !== h.n) {
        h.n = n; const mat = h.sprite.material as T3.SpriteMaterial; mat.map?.dispose(); mat.map = n > 0 ? hintTexture(doorHintText(n, d.room)) : null; mat.needsUpdate = true;
        h.sprite.userData.text = doorHintText(n, d.room);
      }
      h.sprite.visible = n > 0;
    }
  }
  ready = true;
  syncHints();

  // Ball knock-overs (relay v1.6, Cap.Hit; lib/town/ballKnock.ts). The shooter's gate mirrors the relay's cooldowns; friends' balls are
  // tracked (last sample -> velocity) so every screen can knock its own townspeople with them.
  const gate = createKnockGate();
  type BallTrack = { x: number; y: number; z: number; vx: number; vz: number; ok: boolean; fast: boolean };
  const tracks = new Map<MemberId, BallTrack>();
  let trackDt = 0;
  const track = (b: { state: number; x: number; y: number; z: number }, id: MemberId) => {
    let q = tracks.get(id);
    if (!q) { q = { x: 0, y: 0, z: 0, vx: 0, vz: 0, ok: false, fast: false }; tracks.set(id, q); }
    if (b.state !== BallState.Free || hiddenFriends().has(id)) { q.ok = false; q.fast = false; return; }
    if (q.ok && trackDt > 0) { q.vx = (b.x - q.x) / trackDt; q.vz = (b.z - q.z) / trackDt; q.fast = fastBall(q.vx, q.vz); } else q.fast = false;
    q.x = b.x; q.y = b.y; q.z = b.z; q.ok = true;
  };
  const offHit = conn.onMessage((m) => {
    if (m[0] !== S.Hit || !core.live) return;
    const victim = m[2], d = m[3];
    if (victim === core.you) {
      const l = ctx.local();
      if ((l.activity ?? NOT_BUSY) >= 0 || !knockable(l.mode, l.zone, l.hidden ? PoseFlag.Hidden : 0)) return; // busy / riding / swimming now
      ctx.onKnock?.(-1, d, l.x, l.y, l.z); return;
    }
    const p = poses.get(victim);
    if (!p || hiddenFriends().has(victim) || shielded(presenceOf(p.mode, p.zone, p.flags ?? 0)) || !knockable(p.mode, p.zone, p.flags ?? 0)) return;
    if (avatars.tumble(victim, byteToDir(d), ctx.reducedMotion())) ctx.onKnock?.(victim, d, p.x, p.y, p.z);
  });
  const offFilters = onFriendFilters(syncHints);

  // Me while the island loop sleeps (Settings, map, a waiting quiz) or the page is leaving for a room: the frame loop is not running,
  // so the connection's own 5 s beat tick (no new timer) and pagehide send the Busy / Indoors pose. The connection's delta check sends
  // nothing when it did not change, and then the beat itself keeps the slot alive. (The loop also runs one frame after a menu opens.)
  function fill(nowMs: number, l: ReturnType<LocalPoseSource>): PoseBody {
    fillLocalBody(st, l, body);
    if (entryWarpDue(ew, nowMs)) body[7] |= 1;
    return body;
  }
  function sendLocal(nowMs: number) {
    if (conn.status !== 'live') return;
    conn.sendPose(fill(nowMs, ctx.local()), nowMs);
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  conn.onBeforeBeat(() => { if (core.live && now() - lastUpdateAt > SLEEP_SAMPLE_MS) sendLocal(now()); });
  const onPageHide = () => { if (core.live) sendLocal(now()); };
  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide);

  return {
    get meRing() { return meRingOn; },
    get localBump() { return core.live && meRingOn ? avatars.localBump : null; },
    get shown() { return avatars.shown; },
    get rigs() { return avatars.rigs; },
    get tumbling() { return avatars.tumbling; },
    debugEmotes: () => avatars.debugEmotes(),
    duet: (id, partner, role, emote, seed) => avatars.duet(id, partner, role, emote, seed),
    endDuet: (id) => avatars.endDuet(id),
    friendPose: (id) => poses.get(id) ?? null,
    get you() { return core.you; },
    nearestAskable(x, y, z, range) {
      let best = -1, bd = range * range;
      const hid = hiddenFriends(), mut = mutedFriends();
      active.forEach((p, id) => {
        if (hid.has(id) || mut.has(id) || !(p.mode === Mode.Walk || p.mode === Mode.Run || p.mode === Mode.Idle) || Math.abs(p.y - y) > 4) return;
        const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z);
        if (d <= bd) { bd = d; best = id; }
      });
      return best;
    },
    nameOf(id) { const m = partyStore.get().members.find((q) => q.id === id); return m ? displayName(m) : 'Your friend'; },
    friends: () => active.values(),
    ball(state, x, y, z) {
      if (!core.live || conn.status !== 'live') return;
      conn.sendBall(state, x, y, z, now());
    },
    ballVsFriends(x, y, z, vx, vz) {
      if (!core.live || conn.status !== 'live' || !(conn.caps & Cap.Hit) || !fastBall(vx, vz)) return false;
      const hid = hiddenFriends(), t = now();
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], p = poses.get(id);
        if (!p || p.fade < .99 || hid.has(id) || !knockable(p.mode, p.zone, p.flags ?? 0) || !ballTouches(x, y, z, p.x, p.y, p.z)) continue;
        if (!gate.allow(id, t)) return true; // just knocked over: the ball still bounces off them, nothing is sent
        if (!conn.sendHit(id, dirToByte(vx, vz))) return false;
        gate.note(id, t); return true;
      }
      return false;
    },
    eachFastFriendBall(cb) {
      if (!core.live) return;
      tracks.forEach((q) => { if (q.fast) cb(q.x, q.y, q.z, q.vx, q.vz); });
    },
    ballVsFields(ball) {
      if (!core.live) return false;
      let hit = false;
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], p = poses.get(id);
        if (!p || p.zone === Zone.Indoors || hiddenFriends().has(id) || !shielded(presenceOf(p.mode, p.zone, p.flags ?? 0))) continue;
        if (bounceOffField(ball, p.x, p.y + 1.0, p.z)) { avatars.bumpField(id, fieldHit.nx, fieldHit.ny, fieldHit.nz); hit = true; }
      }
      return hit;
    },
    update(dt, nowMs, camera) {
      const live = core.live, meHex = core.meHex;
      // The party is over (or never started): draw one last EMPTY frame so the colour ring and every friend layer disappear at once,
      // then sleep (the instanced ring mesh keeps its last count until it is told to draw nothing).
      if (!live) { if (drawnLast) { drawnLast = false; avatars.root.visible = true; avatars.update(dt, poses, camera, ctx.reducedMotion(), null); } return; }
      drawnLast = true;
      // Friends: sample the interpolators into preallocated poses (friends() lists the 'active' ones).
      core.sample(nowMs);
      if (core.balls.size) { trackDt = dt; core.balls.forEach(track); }
      // Me: my own colour ring only while the party is live (a kid sees which colour they are).
      const l = ctx.local();
      if (jumpX === jumpX && islandJump(jumpX, jumpZ, l.x, l.z, dt)) armEntryWarp(ew);
      jumpX = l.x; jumpZ = l.z;
      // While I am busy (a lesson's learning view, a quiz, a menu) the island's people are hidden (islandNpcs does the same): so are my
      // friends and my own ring; the friend layer skips its whole update (no posing work behind the lesson).
      const busyMe = (l.activity ?? NOT_BUSY) >= 0;
      avatars.root.visible = !busyMe;
      if (busyMe) meRingOn = false;
      if (!busyMe) {
        const showRing = conn.status === 'live' && meHex !== '' && !l.hidden && l.zone !== Zone.Indoors;
        meRingOn = showRing;
        if (showRing) { ring.x = l.x; ring.y = l.y; ring.z = l.z; ring.hex = meHex; ring.mode = l.mode; ring.pitch = l.pitch ?? 0; ring.yaw = l.facing; }
        avatars.update(dt, poses, camera, ctx.reducedMotion(), showRing ? ring : null, core.balls);
        if (hints.length) for (const h of hints) if (h.n > 0) { const dx = h.d.x - camera.position.x, dz = h.d.z - camera.position.z; h.sprite.visible = dx * dx + dz * dz < HINT_RANGE * HINT_RANGE; }
      }
      // Me: one pose per frame into the connection, which applies the 5 Hz / 1 Hz throttle and delta suppression.
      lastUpdateAt = nowMs;
      if (conn.status === 'live') conn.sendPose(fill(nowMs, l), nowMs);
    },
    dispose() {
      for (const h of hints) { const m = h.sprite.material as T3.SpriteMaterial; m.map?.dispose(); m.dispose(); }
      offFilters(); offHit(); core.dispose(); lastIsland.clear(); tracks.clear();
      conn.onBeforeBeat(null); if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
    },
  };
}
