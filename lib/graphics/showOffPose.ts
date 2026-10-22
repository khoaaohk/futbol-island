// Show off (user, Oct 22 2026), the emote that replaced "Space": you and a friend play a football-skill mime from the shuffled bag
// (lib/town/emoteShowOff.ts); a townsperson watching reacts (gasp, cheer-clap, a wobbly copy, a bow) from its own bag. Same whole-body
// writer as the dances (lib/graphics/dancePose.ts). Call right after `rig.update`. No allocation per frame.
import type * as T from 'three';
import {createMoveBag} from '../town/emoteDance';
import {REACTION_COUNT, SHOW_OFFS, SHOW_OFF_COUNT, SHOW_OFF_REACTIONS} from '../town/emoteShowOff';
import {applyBodyMove, bodyJoints, pickMove} from './dancePose';

const showBag = createMoveBag(SHOW_OFF_COUNT), reactBag = createMoveBag(REACTION_COUNT);
export function applyShowOff(root: T.Object3D, kind: number, age: number, dur: number) {
  const npc = bodyJoints(root)?.npc === true;
  applyBodyMove(root, npc ? SHOW_OFF_REACTIONS[pickMove(root, kind, age, reactBag, 'react')] : SHOW_OFFS[pickMove(root, kind, age, showBag, 'show')], age, dur);
}
