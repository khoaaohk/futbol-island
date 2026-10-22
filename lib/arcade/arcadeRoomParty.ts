// The Arcade hub's party layer (docs/multiplayer-rooms-design.md Phase 3). Friends in the Arcade walk about the hub with you and
// replace the crowd NPCs one for one; a friend inside a running game is drawn in a green force field AT that cabinet with
// "Playing <game>" (games stay single player). One layer per PAGE, not per hub: a game replaces the hub (ArcadeRoom.tsx), so the hub
// is disposed and re-created around every game, while this layer (connection, interpolators, avatar rigs) lives on. Its avatar
// group moves into each new hub scene (attach) and out of it before the hub disposes its meshes (attach(null)). While a game runs
// nothing renders and the connection's 5 s beat (plus sendNow on every busy flip) carries "Busy at the cabinet".
// Zero cost without a party: createArcadeParty returns null and the hub's hooks stay no-ops.
import * as T from 'three';
import { createRoomParty, type RoomParty } from '../multiplayer/roomParty';
import { RoomCode } from '../multiplayer/roomPos';
import { setStationText, type RoomLocal } from '../multiplayer/presence';
import { Emote } from '../../multiplayer/protocol';
import { arcadeHubCabinets, type ArcadeCabinetId } from './arcadeCatalog';
import { arcadeRoomHooks, type ArcadeBusyFlags, type ArcadeHubPose, type ArcadeRoomHost, type ArcadeRoomLayer } from './arcadeRoomHooks';
import { ARCADE_GAME_LABEL, ARCADE_ROOM, arcadeBusyCabinet, arcadeBusyPose, createArcadeBusyPose, pickArcadeSpawn } from '../multiplayer/rooms/arcade';

/** Local station codes (presence.ts, never on the wire): 120 = high scores / choosing a game, 121+ = the hub cabinets in catalog order. */
export const ARCADE_STATION_SCORES = 120;
const CABINET_IDS = arcadeHubCabinets().map((c) => c.id as ArcadeCabinetId);
export const arcadeStationCode = (id: ArcadeCabinetId | null): number => (id ? 121 + CABINET_IDS.indexOf(id) : ARCADE_STATION_SCORES);
/** Room-local station kind for a busy friend at x/z (receiver side): the cabinet whose stand spot they occupy, else high scores. */
export function arcadeStationAt(x: number, z: number): number { return arcadeStationCode(arcadeBusyCabinet(x, z)); }
let stationsSet = false;
function registerStations() {
  if (stationsSet) return;
  stationsSet = true;
  setStationText(ARCADE_STATION_SCORES, 'Looking at high scores', '\u{1F3C6}');
  for (const id of CABINET_IDS) setStationText(arcadeStationCode(id), ARCADE_GAME_LABEL[id], '\u{1F579}️');
}

export interface ArcadeParty {
  readonly layer: ArcadeRoomLayer;
  readonly party: RoomParty;
  /** An emote from the chip's wheel: sent to the party, played on your rig (a high five turns you to the nearest friend). */
  emote(kind: number): void;
  dispose(): void;
}

const SPAWN = ARCADE_ROOM.spawn;
const SPAWN_WINDOW_MS = 4000;

export function createArcadeParty(opts: { phone: boolean; reduced: boolean }): ArcadeParty | null {
  registerStations();
  // The avatar layer's own container: it lives as long as the page and is moved between hub scenes.
  const group = new T.Group();
  group.name = 'arcade-party';
  let host: ArcadeRoomHost | null = null;
  const flags: ArcadeBusyFlags = { game: null, list: false, hall: false };
  const hp: ArcadeHubPose = { x: SPAWN.x, z: SPAWN.z, yaw: SPAWN.yaw, moving: false, speed: 0 };
  const bp = createArcadeBusyPose();
  const out: RoomLocal = { x: 0, y: 0, z: 0, facing: 0, speed: 0, busy: false, hidden: false };
  const party = createRoomParty({
    scene: group as unknown as T.Scene, room: RoomCode.Arcade, phone: opts.phone, reducedMotion: () => opts.reduced,
    wake: () => arcadeRoomHooks.wake(),
    local: () => {
      const h = arcadeRoomHooks.pose(hp); // the live hub pose, or the last one before a game replaced the hub (null: ?game= deep link)
      const b = arcadeBusyPose(flags, h, bp);
      out.x = b.x; out.z = b.z; out.facing = b.busy ? b.yaw : h ? h.yaw : SPAWN.yaw; out.speed = b.busy || !h ? 0 : h.speed;
      out.busy = b.busy; out.hidden = typeof document !== 'undefined' && document.hidden;
      return out;
    },
    station: arcadeStationAt,
  });
  if (!party) return null;
  let slots = -1, spawnUntil = 0;
  const flat = new Float32Array(16);
  const layer: ArcadeRoomLayer & { debug(): unknown; measure(n?: number): { update: number } | null } = {
    attach(h) {
      if (h) {
        host = h;
        (h.scene as T.Scene).add(group);
        slots = -1;
        // Entry spawn: a fresh hub at the default door spot looks for a free slot once friends are known (they arrive after Welcome).
        h.pose(hp);
        spawnUntil = Math.abs(hp.x - SPAWN.x) < 0.05 && Math.abs(hp.z - SPAWN.z) < 0.05 ? performance.now() + SPAWN_WINDOW_MS : 0;
        if (flags.game === null) party.warpNext(); // back from a game: the cabinet -> the hub spot is a jump
        h.wakeRemote();
      } else {
        // The hub is going (a game started, or the page is leaving): take the avatars out BEFORE it disposes its scene's meshes.
        group.removeFromParent();
        host = null;
        spawnUntil = 0;
        party.sendNow();
      }
    },
    frame(dt, nowMs) {
      if (!host) return false;
      const keep = party.update(dt, nowMs, host.camera as T.Camera);
      const n = party.shown;
      if (n !== slots) { slots = n; host.setFriendSlots(n); } // friends replace NPCs; 0 brings the crowd back
      if (spawnUntil) {
        host.pose(hp);
        if (nowMs > spawnUntil || hp.moving || Math.abs(hp.x - SPAWN.x) > 0.05 || Math.abs(hp.z - SPAWN.z) > 0.05) spawnUntil = 0;
        else {
          let c = 0;
          for (const p of party.friendsHere()) { if (c >= 8) break; flat[c * 2] = p.x; flat[c * 2 + 1] = p.z; c++; }
          if (c) {
            spawnUntil = 0;
            const s = pickArcadeSpawn(flat, c, { x: 0, z: 0 });
            if (Math.abs(s.x - SPAWN.x) > 0.01 || Math.abs(s.z - SPAWN.z) > 0.01) host.place?.(s.x, s.z);
          }
        }
      }
      return keep;
    },
    busy(state) {
      if (flags.game === state.game && flags.list === state.list && flags.hall === state.hall) return;
      const jump = flags.game !== state.game; // a game starts / ends: the pose moves to / from that cabinet's stand spot
      flags.game = state.game; flags.list = state.list; flags.hall = state.hall;
      if (jump) party.warpNext();
      party.sendNow();
    },
    pushOut: (p, r) => party.pushOut(p, r),
    debug() { return { shown: party.shown, slots, meRing: party.meRing, attached: !!host, flags: { ...flags }, friends: party.debugFriends() }; },
    measure(n = 60) {
      if (!host) return null;
      const cam = host.camera as T.Camera, t = performance.now();
      for (let i = 0; i < n; i++) party.update(1 / 60, performance.now(), cam, false);
      return { update: (performance.now() - t) / n };
    },
  };
  return {
    layer, party,
    emote(kind) {
      party.sendEmote(kind);
      if (!host) return;
      host.pose(hp);
      host.emote?.(kind, kind === Emote.HighFive ? party.nearestFriend(hp.x, hp.z, 3) : null);
    },
    dispose() { group.removeFromParent(); party.dispose(); host = null; },
  };
}
