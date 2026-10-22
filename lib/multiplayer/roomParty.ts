// The party friend layer, shared by the island (townBridge.ts createPartyRuntime) and every room page (createRoomParty below):
// docs/multiplayer-rooms-design.md 3.2. One connection per page, the store, the interpolators, Hide / Mute and ONE remote avatar
// layer (createRemoteAvatars: one batch of 8, one instanced ring, labels <= 8, remoteCap 5/5/3/1/0, Battery saver 0) live in
// createFriendCore; the island adds its zones, view gate and ball fields, a room adds its room filter, wake rule and room pose.
// No analytics imports (tests/mp-isolation.cjs): counts leave through callbacks only. No timers or loops of its own: the room's
// frame loop calls update(), the connection's 5 s beat carries the pose while that loop sleeps.
import type * as THREE from 'three';
import { Mode, S, Zone, presenceOf, roomLocalY, roomOf, shielded, type Look, type MemberId, type PoseBody } from '../../multiplayer/protocol';
import { emoteSeconds } from '../town/emoteReact';
import { createRemoteAvatars, remoteCap, type RemoteAvatars } from '../graphics/remoteAvatars';
import { batterySaverOn } from '../graphics/heatTier';
import { loadCustomization } from '../town/customization';
import { multiplayerEnabled } from './config';
import { createPartyConnection, type PartyConnection } from './connection';
import { bindConnection, onPoses } from './index';
import { createInterp, type Interp, type RemotePose } from './interp';
import { lookToWire } from './look';
import { armEntryWarp, fillRoomBody, roomPoseState, type RoomLocal } from './presence';
import { displayName, partyStore } from './store';

// One connection per page, shared by the page's friend layer and its party UI (PartyHost on the island, RoomPartyChip in rooms).
let shared: PartyConnection | null = null;
let unbind: (() => void) | null = null;
export function partyConnection(): PartyConnection {
  if (!shared) { shared = createPartyConnection(); unbind = bindConnection(shared); }
  return shared;
}
// Local Hide / Mute choices from the party sheet (PartyHost) or the room roster. Module-level so a layer created later still applies them.
let hiddenIds: ReadonlySet<MemberId> = new Set();
let mutedIds: ReadonlySet<MemberId> = new Set();
const filterSubs = new Set<() => void>();
export function setHiddenFriends(ids: ReadonlySet<MemberId>): void { hiddenIds = ids; for (const f of Array.from(filterSubs)) f(); }
export function setMutedFriends(ids: ReadonlySet<MemberId>): void { mutedIds = ids; for (const f of Array.from(filterSubs)) f(); }
export function hiddenFriends(): ReadonlySet<MemberId> { return hiddenIds; }
export function mutedFriends(): ReadonlySet<MemberId> { return mutedIds; }
/** The local player's look on the wire (what PartyHost passes to join, and what a room page resumes with). */
export function partyLook(): Look { return lookToWire(loadCustomization()); }

/** The frame loop counts as asleep (Settings, map, a covered room) after this long without update(): the beat tick samples the pose then. */
export const SLEEP_SAMPLE_MS = 500;

// ---- the shared core -------------------------------------------------------------------------------------------------------
export interface FriendCore {
  readonly conn: PartyConnection;
  readonly avatars: RemoteAvatars;
  readonly interp: Interp;
  /** Sampled friends (preallocated poses), what avatars.update draws. */
  readonly poses: Map<MemberId, RemotePose>;
  /** Friends outside any force field (what friends() / friendsHere() list). */
  readonly active: Map<MemberId, RemotePose>;
  readonly ids: MemberId[];
  readonly live: boolean;
  readonly you: MemberId | null;
  /** My colour (hex) while in a party, '' otherwise. */
  readonly meHex: string;
  /** Samples every known friend's interpolator into its pose; `adapt` may rewrite a sampled pose (rooms: room-local y, speed). */
  sample(nowMs: number, adapt?: (id: MemberId, p: RemotePose) => void): void;
  dispose(): void;
}
export function createFriendCore(ctx: {
  scene: THREE.Scene; phone: boolean; fieldScale?: number;
  /** A friend's emote was shown (the page counts it; this file stays analytics-free, tests/mp-isolation.cjs). Never says which friend. */
  onEmoteSeen?: () => void;
  /** Any friend's emote arrived (rooms: wake when the sender is here). */
  onFriendEmote?: (id: MemberId) => void;
  /** Which poses reach the interpolators: the body to push (may be a rewritten scratch copy), or null to keep that friend roster-only. */
  admit: (id: MemberId, body: PoseBody, recvMs: number) => PoseBody | null;
  /** After every store sync (membership / status / emotes changed). `welcome` = the status just turned live (a Welcome). */
  onSync?: (live: boolean, welcome: boolean) => void;
}): FriendCore {
  const conn = partyConnection();
  const avatars = createRemoteAvatars(ctx.scene, { phone: ctx.phone, maxFor: (tier, phone) => remoteCap(tier, phone, batterySaverOn()), fieldScale: ctx.fieldScale });
  const interp = createInterp();
  const poses = new Map<MemberId, RemotePose>();
  const spare = new Map<MemberId, RemotePose>(); // one preallocated pose per known friend
  const active = new Map<MemberId, RemotePose>();
  const known = new Set<MemberId>();
  const ids: MemberId[] = [];
  let live = false, you: MemberId | null = null, meHex = '', lastEmoteAt = -1, wasLive = false;

  // Membership / status / emotes change rarely: sync here, never per frame.
  function sync() {
    const s = partyStore.get();
    you = s.you;
    live = s.status === 'live' || s.status === 'reconnecting';
    const welcome = s.status === 'live' && !wasLive;
    wasLive = s.status === 'live';
    const want = live ? s.members : [];
    known.clear();
    meHex = '';
    for (const m of want) {
      if (m.id === s.you) { meHex = m.colourHex; continue; } // the Welcome roster includes the local player
      known.add(m.id);
      if (!spare.has(m.id)) { spare.set(m.id, { x: 0, y: 0, z: 0, yaw: 0, speed: 0, mode: Mode.Idle, zone: Zone.Main, fade: 1 }); ids.push(m.id); }
      // Label: the typed first name if set, else the made-up colour name.
      avatars.upsert(m.id, m.look, displayName(m), { hex: m.colourHex });
    }
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];
      if (known.has(id)) continue;
      avatars.remove(id); interp.drop(id); poses.delete(id); active.delete(id); spare.delete(id); ids.splice(i, 1);
    }
    const e = s.lastEmote;
    if (e && e.at !== lastEmoteAt) { lastEmoteAt = e.at; if (e.id !== s.you && avatars.emote(e.id, e.emote)) ctx.onEmoteSeen?.(); if (e.id !== s.you) ctx.onFriendEmote?.(e.id); }
    ctx.onSync?.(live, welcome);
  }
  const applyFilters = () => { avatars.setHidden(hiddenIds); avatars.setMuted(mutedIds); };
  filterSubs.add(applyFilters);
  const offStore = partyStore.subscribe(sync);
  const offPoses = onPoses((id, b, recvMs) => {
    if (id === you || !known.has(id)) return;
    const body = ctx.admit(id, b, recvMs);
    if (body) interp.push(id, body, recvMs);
  });
  // A friend who stands still never sends a pose: the Welcome / Joined roster carries everyone's last pose, so seed the interpolators
  // from it (a still friend already in the room shows at once instead of on their first step).
  const offSeed = conn.onMessage((m) => {
    if (m[0] !== S.Welcome && m[0] !== S.Joined) return;
    const list = m[0] === S.Welcome ? m[7] : [m[1]], t = typeof performance !== 'undefined' ? performance.now() : Date.now();
    for (const info of list) {
      const pose = info[4];
      if (!pose || info[0] === you || !known.has(info[0])) continue;
      const b = ctx.admit(info[0], pose.slice() as PoseBody, t);
      if (b) interp.push(info[0], b, t);
    }
  });
  sync();
  applyFilters();

  return {
    conn, avatars, interp, poses, active, ids,
    get live() { return live; },
    get you() { return you; },
    get meHex() { return meHex; },
    sample(nowMs, adapt) {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], p = spare.get(id)!;
        if (interp.sample(id, nowMs, p)) {
          if (adapt) adapt(id, p);
          if (!poses.has(id)) poses.set(id, p);
          if (presenceOf(p.mode, p.zone, p.flags ?? 0) === 'active') { if (!active.has(id)) active.set(id, p); } else if (active.has(id)) active.delete(id);
        } else if (poses.has(id)) { poses.delete(id); active.delete(id); }
      }
    },
    dispose() {
      offStore(); offPoses(); offSeed(); filterSubs.delete(applyFilters); avatars.dispose(); poses.clear(); active.clear(); spare.clear(); ids.length = 0; known.clear();
      // The shared connection (and its binding) belongs to the page: it closes on unload and via leave().
      void unbind;
    },
  };
}

// ---- rooms ---------------------------------------------------------------------------------------------------------------
/** Room-only: how long the loop keeps running after the last same-room pose CHANGE (the interpolators render 250 ms in the past). */
export const ROOM_SETTLE_MS = 250 + 300;
/** Seconds a friend's emote keeps a room awake (the longest wire emote, Pass it). */
export const ROOM_EMOTE_AWAKE_S = Math.max(emoteSeconds(6), 4.5);
/** Force field obstacle radius (m) around a busy friend in a room (design 3.4): walking into it nudges you out. */
export const ROOM_FIELD_R = 0.6;
/** Rooms draw the dome at ~0.8 m instead of the island's 1.15 m (small rooms, aisles). */
export const ROOM_FIELD_SCALE = 0.8 / 1.15;
/** Walk-cycle speed by mode (the speed byte is the room code in a room pose, design 2.2). */
const MODE_SPEED: Partial<Record<number, number>> = { [Mode.Walk]: 2, [Mode.Run]: 4.2 };

export interface RoomParty {
  /** Call once per room frame (dt s, nowMs = performance.now(), the room camera). `hideFriends`: the room's own camera is zoomed onto a
   *  shelf / exhibit (the local player is hidden there too). Returns true while friends still move / fade / emote: keep frames. */
  update(dt: number, nowMs: number, camera: THREE.Camera, hideFriends?: boolean): boolean;
  /** Friends in THIS room outside a force field (friend-pair emotes pick from these only). Reused objects. */
  friendsHere(): Iterable<RemotePose>;
  /** The nearest friend here within `maxM` (a high five turns to face them), or null. */
  nearestFriend(x: number, z: number, maxM: number): RemotePose | null;
  /** Busy friends' force fields as obstacles: pushes `p` (room-local) out of every field (+ radius r). True when it moved. */
  pushOut(p: { x: number; z: number }, r: number): boolean;
  /** Sends an emote to the party (rate limits as on the island); false when not sent (not live, away, too soon). */
  sendEmote(e: number): boolean;
  /** True while the party draws the local player's colour ring (the room's own foot disc then hides: one ring only). */
  readonly meRing: boolean;
  readonly room: number;
  dispose(): void;
}

export interface RoomPartyCtx {
  scene: THREE.Scene;
  /** The room code (RoomCode.*; the two Konbinis are different codes). */
  room: number;
  /** The local player, room-local metres (read once per frame and from the beat while the loop sleeps). */
  local: () => RoomLocal;
  phone: boolean;
  reducedMotion: () => boolean;
  /** The room's own wake (remote-only: phones cap those frames at 20 fps). Called when a SAME-ROOM friend's pose changed. */
  wake: () => void;
  /** The busy kind at a room-local spot for a busy friend there (STATION.* code), or 0 = plain "Busy". */
  station?: (x: number, z: number) => number;
  onEmoteSeen?: () => void;
}

/** Null when multiplayer is off or this tab holds no party (a room without a party costs nothing). */
export function createRoomParty(ctx: RoomPartyCtx): RoomParty | null {
  if (!multiplayerEnabled()) return null;
  const conn0 = partyConnection();
  if (!conn0.hasSession() && conn0.status !== 'live' && conn0.status !== 'reconnecting') return null;
  const room = ctx.room;
  const last = new Map<MemberId, number[]>(); // the last same-room body per friend (change detection: wake only on a change)
  const gone = new Set<MemberId>(); // left this room (or went to the island): fade out at their last room spot
  const fieldX: number[] = [], fieldZ: number[] = [];
  let lastChangeAt = -1e12, emoteUntil = -1e12, meRingOn = false, drawnLast = false, lastUpdateAt = -1e12;
  const st = roomPoseState();
  const body: PoseBody = [0, 0, 0, 0, 0, Mode.Idle, Zone.Indoors, 0];
  const ring = { x: 0, y: 0, z: 0, hex: '', mode: 0, pitch: 0, yaw: 0 };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const wake = () => { if (!batterySaverOn()) ctx.wake(); }; // Battery saver: no remote wake at all (the roster still updates)
  let coreIds: MemberId[] | null = null;

  const core = createFriendCore({
    scene: ctx.scene, phone: ctx.phone, fieldScale: ROOM_FIELD_SCALE, onEmoteSeen: ctx.onEmoteSeen,
    onFriendEmote(id) { if (last.has(id) && !gone.has(id)) { emoteUntil = now() + ROOM_EMOTE_AWAKE_S * 1000; wake(); } },
    admit(id, b, recvMs) {
      if (roomOf(b) !== room) {
        // Somewhere else (the island, the other Konbini, another room): roster only. A friend who was HERE fades out at their spot.
        if (last.has(id) && !gone.has(id)) { gone.add(id); lastChangeAt = recvMs; wake(); }
        return null;
      }
      const prev = last.get(id);
      let changed = !prev || gone.has(id);
      if (prev) { for (let k = 0; k < 8; k++) if (prev[k] !== b[k]) { changed = true; prev[k] = b[k]; } } else last.set(id, b.slice());
      gone.delete(id);
      if (changed) { lastChangeAt = recvMs; wake(); }
      return b;
    },
    onSync(live, welcome) {
      if (welcome) { armEntryWarp(st.warp); wake(); } // the first pose after every Welcome is a Warp (+ one retry 5.5 s later)
      if (!live) meRingOn = false;
      if (coreIds) for (const id of Array.from(last.keys())) if (coreIds.indexOf(id) < 0) { last.delete(id); gone.delete(id); }
    },
  });
  const { conn, avatars, poses, active, ids } = core;
  coreIds = ids;

  // A sampled room pose -> what the avatar layer draws: room-local height, a walk speed from the mode, no door fade while here (zone
  // Main = "standing in this room"), the busy kind from this room's own layout. A friend who left keeps zone Indoors: the door fade.
  function adapt(id: MemberId, p: RemotePose) {
    p.y = roomLocalY(p.y * 10);
    if (gone.has(id)) { p.zone = Zone.Indoors; return; }
    p.zone = Zone.Main;
    const busy = p.mode === Mode.Busy;
    p.speed = busy ? 0 : MODE_SPEED[p.mode] ?? 0;
    p.activity = busy ? ctx.station?.(p.x, p.z) ?? 0 : 0;
  }
  function sendLocal(nowMs: number) {
    if (conn.status !== 'live') return;
    conn.sendPose(fillRoomBody(st, ctx.local(), room, body, nowMs), nowMs);
  }
  // A covered room (overlay, reveal, the cashier) stops its loop: the connection's own 5 s beat sends the Busy room pose (no new timer).
  conn.onBeforeBeat(() => { if (core.live && now() - lastUpdateAt > SLEEP_SAMPLE_MS) sendLocal(now()); });

  return {
    room,
    get meRing() { return meRingOn; },
    friendsHere: () => active.values(),
    nearestFriend(x, z, maxM) {
      let best: RemotePose | null = null, bd = maxM * maxM;
      for (const p of active.values()) { const d = (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z); if (d < bd) { bd = d; best = p; } }
      return best;
    },
    pushOut(p, r) {
      let moved = false;
      for (let i = 0; i < fieldX.length; i++) {
        const dx = p.x - fieldX[i], dz = p.z - fieldZ[i], d = Math.hypot(dx, dz), min = ROOM_FIELD_R + r;
        if (d < min) { const k = d > 1e-4 ? min / d : 0; p.x = d > 1e-4 ? fieldX[i] + dx * k : fieldX[i] + min; p.z = d > 1e-4 ? fieldZ[i] + dz * k : p.z; moved = true; }
      }
      return moved;
    },
    sendEmote(e) { return conn.status === 'live' && conn.sendEmote(e as Parameters<PartyConnection['sendEmote']>[0]); },
    update(dt, nowMs, camera, hideFriends = false) {
      lastUpdateAt = nowMs;
      const live = core.live;
      if (!live) {
        if (drawnLast) { drawnLast = false; avatars.root.visible = true; avatars.update(dt, poses, camera, ctx.reducedMotion(), null); }
        fieldX.length = fieldZ.length = 0; meRingOn = false;
        return false;
      }
      drawnLast = true;
      core.sample(nowMs, adapt);
      // Busy friends here: their fields are obstacles (and no emotes to / from them: remoteAvatars already ignores those).
      fieldX.length = fieldZ.length = 0;
      let fading = false;
      for (let i = 0; i < ids.length; i++) {
        const p = poses.get(ids[i]);
        if (!p) continue;
        if (p.fade < 1 || gone.has(ids[i])) fading = true;
        if (!gone.has(ids[i]) && shielded(presenceOf(p.mode, p.zone, p.flags ?? 0))) { fieldX.push(p.x); fieldZ.push(p.z); }
      }
      const l = ctx.local();
      avatars.root.visible = !hideFriends;
      const showRing = conn.status === 'live' && core.meHex !== '' && !l.hidden && !l.busy && !hideFriends;
      meRingOn = showRing;
      if (showRing) { ring.x = l.x; ring.y = l.y; ring.z = l.z; ring.hex = core.meHex; ring.mode = Mode.Walk; ring.pitch = 0; ring.yaw = l.facing; }
      if (!hideFriends) avatars.update(dt, poses, camera, ctx.reducedMotion(), showRing ? ring : null);
      if (conn.status === 'live') conn.sendPose(fillRoomBody(st, l, room, body, nowMs), nowMs);
      if (batterySaverOn()) return false;
      return nowMs - lastChangeAt < ROOM_SETTLE_MS || nowMs < emoteUntil || (fading && nowMs - lastChangeAt < ROOM_SETTLE_MS + 700);
    },
    dispose() {
      core.dispose(); conn.onBeforeBeat(null); last.clear(); gone.clear();
      // The connection is NOT closed (party persistence): the next page resumes the slot. Only Leave / End / the grown-up switch close it.
    },
  };
}
