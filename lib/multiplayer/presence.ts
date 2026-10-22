// Presence for the island (docs/multiplayer-design.md 4.4.1): what the local player is doing (Town flags -> Activity) and the
// kid-facing words / icon friends see over the force field and in the party list. Pure: no three.js, no React.
import { Activity, Mode, ROOM_ACTIVITIES, Zone, type Presence, type PoseBody } from '../../multiplayer/protocol';

/** The Town state that makes a player "busy". One object, reused: Town writes the fields, townActivity reads them (no allocation). */
export interface TownFlags {
  lesson: boolean; quiz: boolean; learning: boolean; settings: boolean; map: boolean; arcade: boolean; museum: boolean;
  shop: boolean; konbini: boolean; reef: boolean; fishing: boolean; vending: boolean; chat: boolean; wardrobe: boolean; other: boolean;
  /** The vending machine zoom (in the island loop; `vending` is its store sheet). */
  zoom: boolean;
}
export function townFlags(): TownFlags {
  return { lesson: false, quiz: false, learning: false, settings: false, map: false, arcade: false, museum: false, shop: false,
    konbini: false, reef: false, fishing: false, vending: false, chat: false, wardrobe: false, other: false, zoom: false };
}

/** NOT_BUSY: playing on the island. Otherwise the Activity code (Activity.None = busy in some other full-screen menu: "Busy"). */
export const NOT_BUSY = -1;
/** Priority: a room (the page is leaving) > quiz > lesson > the rest. `other` = any other full-screen menu (shown as plain "Busy"). */
export function townActivity(f: TownFlags): number {
  if (f.arcade) return Activity.Arcade;
  if (f.museum) return Activity.Museum;
  if (f.shop) return Activity.Shop;
  if (f.konbini) return Activity.Konbini;
  if (f.quiz) return Activity.Quiz;
  if (f.lesson || f.learning) return Activity.Lesson;
  if (f.reef) return Activity.Reef;
  if (f.fishing) return Activity.Fishing;
  if (f.settings) return Activity.Settings;
  if (f.map) return Activity.Map;
  if (f.wardrobe) return Activity.Wardrobe;
  if (f.chat) return Activity.Chat;
  if (f.vending || f.zoom) return Activity.Vending;
  return f.other ? Activity.None : NOT_BUSY;
}
export const isRoom = (a: number): boolean => ROOM_ACTIVITIES.indexOf(a) >= 0;
export const isBusy = (a: number): boolean => a >= 0;

const TEXT: Record<number, string> = {
  [Activity.None]: 'Busy', [Activity.Lesson]: 'Taking a lesson', [Activity.Quiz]: 'Quiz time', [Activity.Settings]: 'In Settings',
  [Activity.Map]: 'Looking at the map', [Activity.Arcade]: 'Playing arcade', [Activity.Museum]: 'In the museum', [Activity.Shop]: 'In the shop',
  [Activity.Konbini]: 'In the Konbini', [Activity.Reef]: 'Exploring the reef', [Activity.Fishing]: 'Fishing', [Activity.Vending]: 'Getting a drink',
  [Activity.Chat]: 'Chatting', [Activity.Wardrobe]: 'Changing clothes',
};
const ICON: Record<number, string> = {
  [Activity.None]: '⏳', [Activity.Lesson]: '\u{1F4D6}', [Activity.Quiz]: '❓', [Activity.Settings]: '⚙️',
  [Activity.Map]: '\u{1F5FA}️', [Activity.Arcade]: '\u{1F579}️', [Activity.Museum]: '\u{1F3DB}️', [Activity.Shop]: '\u{1F6CD}️',
  [Activity.Konbini]: '\u{1F3EA}', [Activity.Reef]: '\u{1F420}', [Activity.Fishing]: '\u{1F3A3}', [Activity.Vending]: '\u{1F964}',
  [Activity.Chat]: '\u{1F4AC}', [Activity.Wardrobe]: '\u{1F455}',
};
export const AWAY_TEXT = 'Away', AWAY_ICON = '\u{1F4A4}';

/** The words over a friend's field / under their name in the party list ('' when they are just playing). */
export function presenceText(p: Presence, activity: number): string {
  if (p === 'away') return AWAY_TEXT;
  if (p === 'busy' || p === 'indoors') return TEXT[activity] ?? TEXT[Activity.None];
  return '';
}
export function presenceIcon(p: Presence, activity: number): string {
  if (p === 'away') return AWAY_ICON;
  if (p === 'busy' || p === 'indoors') return ICON[activity] ?? ICON[Activity.None];
  return '';
}

// ---- the local pose on the wire ----
const WARP_M = 25, TAU = Math.PI * 2;
/** Coming back from an activity this far (m) from where they went busy: the first pose is a warp (friends cut, no slide). */
export const BACK_WARP_M = 1;

/**
 * The pose the local player sends (pure; the runtime keeps one `st` per page). Busy (design 4.4.1): mode Busy, the Activity in the
 * speed byte, the position frozen at the last outdoor pose (scripted lesson motion and teleports are never sent); a room on another
 * page is Zone.Indoors at that spot (the door). Back from busy far from the anchor: warp once.
 */
export type LocalPoseState = { busy: boolean; ax: number; ay: number; az: number; afacing: number; azone: number; has: boolean;
  px: number; py: number; pz: number; pfacing: number; pzone: number; lastX: number; lastZ: number };
export function localPoseState(): LocalPoseState {
  return { busy: false, ax: 0, ay: 0, az: 0, afacing: 0, azone: 0, has: false, px: 0, py: 0, pz: 0, pfacing: 0, pzone: 0, lastX: NaN, lastZ: NaN };
}
export type LocalPose = { x: number; y: number; z: number; facing: number; speed: number; mode: number; zone: number; warp: boolean; hidden: boolean; activity?: number };
export function fillLocalBody(st: LocalPoseState, l: LocalPose, body: PoseBody): PoseBody {
  const act = l.activity ?? NOT_BUSY, busy = act >= 0;
  let x = l.x, y = l.y, z = l.z, facing = l.facing, speedQ = Math.min(255, Math.round(l.speed * 4)), mode: number = l.mode, zone: number = l.zone, warp = l.warp;
  if (busy) {
    if (!st.busy) { // freeze at the last real outdoor pose (the frame before), not where a lesson may already have moved them
      st.busy = true;
      if (st.has) { st.ax = st.px; st.ay = st.py; st.az = st.pz; st.afacing = st.pfacing; st.azone = st.pzone; }
      else { st.ax = l.x; st.ay = l.y; st.az = l.z; st.afacing = l.facing; st.azone = l.zone; }
    }
    x = st.ax; y = st.ay; z = st.az; facing = st.afacing; mode = Mode.Busy; speedQ = act; zone = isRoom(act) ? Zone.Indoors : st.azone; warp = false;
  } else {
    if (st.busy) { st.busy = false; if (Math.hypot(l.x - st.ax, l.z - st.az) > BACK_WARP_M) warp = true; }
    st.px = l.x; st.py = l.y; st.pz = l.z; st.pfacing = l.facing; st.pzone = l.zone; st.has = true;
  }
  warp = warp || (st.lastX === st.lastX && Math.hypot(x - st.lastX, z - st.lastZ) > WARP_M);
  st.lastX = x; st.lastZ = z;
  body[0] = Math.round(x * 10); body[1] = Math.round(y * 10); body[2] = Math.round(z * 10);
  body[3] = Math.round(((facing % TAU) + TAU) % TAU / TAU * 256) & 255;
  body[4] = speedQ; body[5] = mode as Mode; body[6] = zone as Zone;
  body[7] = (warp ? 1 : 0) | (l.hidden ? 2 : 0);
  return body;
}
