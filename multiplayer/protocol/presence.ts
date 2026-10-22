// Presence on the wire (docs/multiplayer-design.md 4.4.1): busy / indoors / away are carried by values the pose body already has,
// so old clients and the old relay keep parsing every frame. No new fields:
//  - Mode.Busy   = the player is in a lesson, quiz, menu or minigame; their position is frozen at the last outdoor spot.
//                  While mode is Busy the speed byte (body[4]) carries the Activity code below (a Busy friend never moves).
//  - Zone.Indoors = a room on another page (Arcade, Museum, Shop, Konbini): mode Busy, the door as the pose, the room as the Activity.
//  - PoseFlag.Hidden = away: the tab is in the background, or the relay heard nothing for AWAY_SILENCE_MS (it sets the flag itself).
import { Mode, PoseFlag, Zone } from './types';

export const Activity = {
  None: 0, Lesson: 1, Quiz: 2, Settings: 3, Map: 4, Arcade: 5, Museum: 6, Shop: 7, Konbini: 8, Reef: 9, Fishing: 10,
  Vending: 11, Chat: 12, Wardrobe: 13,
} as const;
export type Activity = (typeof Activity)[keyof typeof Activity];
export const ACTIVITY_MAX = 13;
/** Activities that are a different page (the island unloads): sent as Zone.Indoors. */
export const ROOM_ACTIVITIES: readonly number[] = [Activity.Arcade, Activity.Museum, Activity.Shop, Activity.Konbini];
/** The relay marks a connected or dropped member away (sets PoseFlag.Hidden) after this much silence. A live client sends something at
 *  least every 5 s now, but clients before Oct 22 2026 re-armed the beat from its own timer, so their worst gap was just under 10 s:
 *  12 s never flags a live old client (the brief asked for 8 s; 8 s made idle clients flicker Away in the headless check). */
export const AWAY_SILENCE_MS = 12000;

export type Presence = 'active' | 'busy' | 'indoors' | 'away';

/** What a friend's pose says about them. Indoors wins (they left the island), then away, then busy. */
export function presenceOf(mode: number, zone: number, flags: number): Presence {
  if (zone === Zone.Indoors) return 'indoors';
  if ((flags & PoseFlag.Hidden) !== 0) return 'away';
  return mode === Mode.Busy ? 'busy' : 'active';
}

/** The Activity a Busy / Indoors pose carries in its speed byte (0 = none / not busy; unknown codes read as None). */
export function activityOf(mode: number, speedQ: number): Activity {
  if (mode !== Mode.Busy) return Activity.None;
  const a = Math.round(speedQ);
  return (a >= 0 && a <= ACTIVITY_MAX ? a : 0) as Activity;
}

/** True when a friend is inside the force field (busy or away): no emotes to or from them, the ball bounces off. */
export function shielded(p: Presence): boolean { return p === 'busy' || p === 'away'; }
