/**
 * SERVER ONLY (lib/analytics/report.ts): names for the emote-variant ids (Phase B, countIds.ts EMOTE_VARIANT_COUNTS). The beat only
 * carries `em:<family>_<index>`; the words come from the real tables here, like emoteLabels.ts. Never imported by the tracker or
 * the client bundle (the tables pull in the emote animation code).
 */
import type {EmoteVariantFamily} from './countIds';
import {DANCES} from '../town/emoteDance';
import {SHOW_OFFS,SHOW_OFF_REACTIONS} from '../town/emoteShowOff';
import {HANDSHAKES} from '../town/emoteHandshakes';
import {BODY_VARIANTS} from '../town/emoteBody';
import {JUGGLE_ROUTINES,JUGGLE_SOLO_ROUTINES,PASS_ROUTINES} from '../town/emoteBallPlay';
import {MOVE_SCRIPTS} from '../town/moveEmotes';

export function emoteVariantLabels():Record<EmoteVariantFamily,string[]>{
 return {
  dance:DANCES.map(m=>m.name),show:SHOW_OFFS.map(m=>m.name),react:SHOW_OFF_REACTIONS.map(m=>m.name),hf:HANDSHAKES.map(h=>h.name),
  wave:BODY_VARIANTS[0].map(v=>v.name),cheer:BODY_VARIANTS[1].map(v=>v.name),laugh:BODY_VARIANTS[7].map(v=>v.name),
  pass:PASS_ROUTINES.map(r=>r.label),juggle:JUGGLE_ROUTINES.map(r=>r.label),keepup:JUGGLE_SOLO_ROUTINES.map(r=>r.label),
  move:MOVE_SCRIPTS.flatMap(s=>s.variants.map(v=>`${s.label}: ${v.name}`)),
 };
}
