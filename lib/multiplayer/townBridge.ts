// The only thing Town.tsx calls (docs/multiplayer-design.md 5.1, 5.2). Wires the party connection + store + interp to the remote
// avatars and sends the local pose. With the flag off createPartyRuntime returns null (Town does nothing); outside a party the
// per-frame cost is one boolean check; inside, update() allocates nothing (scratch objects below).
import type * as THREE from 'three';
import { Mode, Zone, presenceOf, shielded, type Look, type MemberId, type PoseBody } from '../../multiplayer/protocol';
import { bounceOffField, fieldHit, type FieldBall } from '../town/forceFieldBounce';
import { NOT_BUSY, fillLocalBody, localPoseState } from './presence';
import { createRemoteAvatars, remoteCap } from '../graphics/remoteAvatars';
import { batterySaverOn } from '../graphics/heatTier';
import { loadCustomization } from '../town/customization';
import { multiplayerEnabled } from './config';
import { createPartyConnection, type PartyConnection } from './connection';
import { bindConnection, onPoses } from './index';
import { createInterp, type RemotePose } from './interp';
import { lookToWire } from './look';
import { displayName, partyStore } from './store';

/** activity: NOT_BUSY (-1) while playing, else the Activity code (lib/multiplayer/presence.ts townActivity); optional for old callers. */
export type LocalPoseSource = () => { x: number; y: number; z: number; facing: number; speed: number; mode: Mode;
  zone: Zone; warp: boolean; hidden: boolean; activity?: number };
export interface PartyRuntime { update(dt: number, nowMs: number, camera: THREE.Camera): void; dispose(): void;
  /** The friends' latest interpolated poses (read-only, reused objects): the emote button looks for a friend flying nearby.
   *  Friends inside a force field (busy / away) and friends indoors are NOT listed: nothing can emote at them or pick them. */
  friends(): Iterable<RemotePose>;
  /** The island ball against busy friends' force fields: bounces it off (mutates `ball`) and shakes the dome. True on a hit. */
  ballVsFields(ball: FieldBall): boolean;
  /** True while the party draws the local player's colour ring (the island's own cream foot ring then stays hidden: one ring only). */
  readonly meRing: boolean }

// One connection per page, shared by Town (this bridge) and the React PartyHost (props.connection).
let shared: PartyConnection | null = null;
let unbind: (() => void) | null = null;
export function partyConnection(): PartyConnection {
  if (!shared) { shared = createPartyConnection(); unbind = bindConnection(shared); }
  return shared;
}
// Local Hide / Mute choices from the party sheet (PartyHost). Module-level so a runtime created later still applies them.
let hiddenIds: ReadonlySet<MemberId> = new Set();
let mutedIds: ReadonlySet<MemberId> = new Set();
const filterSubs = new Set<() => void>();
export function setHiddenFriends(ids: ReadonlySet<MemberId>): void { hiddenIds = ids; for (const f of Array.from(filterSubs)) f(); }
export function setMutedFriends(ids: ReadonlySet<MemberId>): void { mutedIds = ids; for (const f of Array.from(filterSubs)) f(); }
/** The local player's look on the wire (what PartyHost passes to join). */
export function partyLook(): Look { return lookToWire(loadCustomization()); }

// Town helper: assembles the local pose from values Town already has, into one reused object (no allocation per call).
const SUMMIT = { x: 640, z: 130, r: 150 }, CAY = { x: 612, z: -160, r: 120 };
const localOut = { x: 0, y: 0, z: 0, facing: 0, speed: 0, mode: Mode.Idle as Mode, zone: Zone.Main as Zone, warp: false, hidden: false, activity: NOT_BUSY };
export function partyLocal(
  loc: { x: number; z: number }, root: { position: { y: number }; rotation: { y: number } }, vel: { x: number; z: number },
  ride: string, swimming: boolean, diving: boolean, hidden: boolean, activity = NOT_BUSY,
) {
  const o = localOut, speed = Math.hypot(vel.x, vel.z);
  o.x = loc.x; o.y = root.position.y; o.z = loc.z; o.facing = root.rotation.y; o.speed = speed; o.hidden = hidden;
  o.mode = diving ? Mode.Dive : swimming ? Mode.Swim : ride === 'scooter' ? Mode.Scooter : ride === 'bike' ? Mode.Bike
    : ride === 'moped' ? Mode.Moped : ride === 'jetpack' ? Mode.Jetpack : speed > 2.6 ? Mode.Run : speed > 0.15 ? Mode.Walk : Mode.Idle;
  const sx = loc.x - SUMMIT.x, sz = loc.z - SUMMIT.z, cx = loc.x - CAY.x, cz = loc.z - CAY.z;
  o.zone = swimming || diving ? Zone.Sea : sx * sx + sz * sz < SUMMIT.r * SUMMIT.r ? Zone.Summit : cx * cx + cz * cz < CAY.r * CAY.r ? Zone.Cay : Zone.Main;
  o.warp = false; o.activity = activity;
  return o;
}


/** The frame loop counts as asleep (Settings, map, a waiting quiz) after this long without update(): the beat tick samples the pose then. */
export const SLEEP_SAMPLE_MS = 500;

export function createPartyRuntime(ctx: { scene: THREE.Scene; viewGate: { addUnitRoots(r: THREE.Object3D[]): void };
  local: LocalPoseSource; phone: boolean; reducedMotion: () => boolean }): PartyRuntime | null {
  if (!multiplayerEnabled()) return null;
  const conn = partyConnection();
  const avatars = createRemoteAvatars(ctx.scene, { phone: ctx.phone, maxFor: (tier, phone) => remoteCap(tier, phone, batterySaverOn()) });
  // The labels are the only units the view gate can measure: register the LABEL group (each sprite sits at its friend). Registering the
  // whole root made the batch, the rings and the force fields units at the world origin, so the gate hid every friend whenever the
  // origin was off screen (found Oct 22 2026 with the presence check); the remote layer already culls itself per friend.
  ctx.viewGate.addUnitRoots([avatars.labels]);
  const interp = createInterp();
  const poses = new Map<MemberId, RemotePose>();
  const spare = new Map<MemberId, RemotePose>(); // one preallocated pose per known friend
  const known = new Set<MemberId>();
  const ids: MemberId[] = [];
  const body: PoseBody = [0, 0, 0, 0, 0, Mode.Idle, Zone.Main, 0];
  const ring = { x: 0, y: 0, z: 0, hex: '', mode: 0 };
  let meHex = '';
  let meRingOn = false; // the party draws my colour ring (the island's cream foot ring then stays hidden)
  const active = new Map<MemberId, RemotePose>(); // friends outside any force field (what friends() lists)
  const st = localPoseState();
  let live = false, you: MemberId | null = null, lastEmoteAt = -1, lastUpdateAt = -1e12;

  // Membership / status / emotes change rarely: sync here, never per frame.
  function sync() {
    const s = partyStore.get();
    you = s.you;
    live = s.status === 'live' || s.status === 'reconnecting';
    const want = live ? s.members : [];
    known.clear();
    meHex = '';
    for (const m of want) {
      if (m.id === s.you) { meHex = m.colourHex; continue; } // the Welcome roster includes the local player
      known.add(m.id);
      if (!spare.has(m.id)) { spare.set(m.id, { x: 0, y: 0, z: 0, yaw: 0, speed: 0, mode: Mode.Idle, zone: Zone.Main, fade: 1 }); ids.push(m.id); }
      // Label: the typed first name if set (the made-up name goes small under it), else the made-up name.
      avatars.upsert(m.id, m.look, displayName(m), { hex: m.colourHex });
    }
    for (let i = ids.length - 1; i >= 0; i--) {
      const id = ids[i];
      if (known.has(id)) continue;
      avatars.remove(id); interp.drop(id); poses.delete(id); active.delete(id); spare.delete(id); ids.splice(i, 1);
    }
    const e = s.lastEmote;
    if (e && e.at !== lastEmoteAt) { lastEmoteAt = e.at; if (e.id !== s.you) avatars.emote(e.id, e.emote); }
    if (!live) { st.lastX = st.lastZ = NaN; meRingOn = false; }
  }
  const applyFilters = () => { avatars.setHidden(hiddenIds); avatars.setMuted(mutedIds); };
  filterSubs.add(applyFilters);
  const offStore = partyStore.subscribe(sync);
  const offPoses = onPoses((id, b, recvMs) => { if (id !== you && known.has(id)) interp.push(id, b, recvMs); });
  sync();
  applyFilters();
  // Me while the island loop sleeps (Settings, map, a waiting quiz) or the page is leaving for a room: the frame loop is not running,
  // so the connection's own 5 s beat tick (no new timer) and pagehide send the Busy / Indoors pose. The connection's delta check sends
  // nothing when it did not change, and then the beat itself keeps the slot alive. (The loop also runs one frame after a menu opens.)
  function sendLocal(nowMs: number) {
    if (conn.status !== 'live') return;
    conn.sendPose(fillLocalBody(st, ctx.local(), body), nowMs);
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  conn.onBeforeBeat(() => { if (live && now() - lastUpdateAt > SLEEP_SAMPLE_MS) sendLocal(now()); });
  const onPageHide = () => { if (live) sendLocal(now()); };
  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide);

  return {
    get meRing() { return meRingOn; },
    friends: () => active.values(),
    ballVsFields(ball) {
      if (!live) return false;
      let hit = false;
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], p = poses.get(id);
        if (!p || p.zone === Zone.Indoors || hiddenIds.has(id) || !shielded(presenceOf(p.mode, p.zone, p.flags ?? 0))) continue;
        if (bounceOffField(ball, p.x, p.y + 1.0, p.z)) { avatars.bumpField(id, fieldHit.nx, fieldHit.ny, fieldHit.nz); hit = true; }
      }
      return hit;
    },
    update(dt, nowMs, camera) {
      if (!live) return;
      // Friends: sample the interpolators into preallocated poses.
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], p = spare.get(id)!;
        if (interp.sample(id, nowMs, p)) {
          if (!poses.has(id)) poses.set(id, p);
          if (presenceOf(p.mode, p.zone, p.flags ?? 0) === 'active') { if (!active.has(id)) active.set(id, p); } else if (active.has(id)) active.delete(id);
        } else if (poses.has(id)) { poses.delete(id); active.delete(id); }
      }
      // Me: my own colour ring only while the party is live (a kid sees which colour they are).
      const l = ctx.local();
      // While I am busy (a lesson's learning view, a quiz, a menu) the island's people are hidden (islandNpcs does the same): so are my
      // friends and my own ring; the friend layer skips its whole update (no posing work behind the lesson).
      const busyMe = (l.activity ?? NOT_BUSY) >= 0;
      avatars.root.visible = !busyMe;
      if (busyMe) meRingOn = false;
      if (!busyMe) {
        const showRing = conn.status === 'live' && meHex !== '' && !l.hidden && l.zone !== Zone.Indoors;
        meRingOn = showRing;
        if (showRing) { ring.x = l.x; ring.y = l.y; ring.z = l.z; ring.hex = meHex; ring.mode = l.mode; }
        avatars.update(dt, poses, camera, ctx.reducedMotion(), showRing ? ring : null);
      }
      // Me: one pose per frame into the connection, which applies the 5 Hz / 1 Hz throttle and delta suppression.
      lastUpdateAt = nowMs;
      if (conn.status === 'live') conn.sendPose(fillLocalBody(st, l, body), nowMs);
    },
    dispose() {
      offStore(); offPoses(); filterSubs.delete(applyFilters); avatars.dispose(); poses.clear(); active.clear(); spare.clear(); ids.length = 0; known.clear();
      conn.onBeforeBeat(null); if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
      // The shared connection (and its binding) belongs to the page / PartyHost: it closes on unload and via leave().
      void unbind;
    },
  };
}
