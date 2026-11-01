/**
 * Fresh NPC chat content (Nov 1 2026): new topics, quick challenges, openers and "welcome back" lines for every islander, plus
 * fallback pools per world area. Authored data only (types in ./npcFreshTypes); the shards in ./npcFresh/ hold the text, about
 * 20 NPCs each. tests/npc-fresh.cjs keeps every string unique and away from existing dialogue.
 */
import type {NpcFresh,NpcFreshBook} from './npcFreshTypes';
import {PART_1} from './npcFresh/part1';
import {PART_2} from './npcFresh/part2';
import {PART_3} from './npcFresh/part3';
import {PART_4} from './npcFresh/part4';
import {PART_5} from './npcFresh/part5';
import {PART_6} from './npcFresh/part6';
import {PART_7} from './npcFresh/part7';
import {PART_8} from './npcFresh/part8';
import {FRESH_AREA_POOLS} from './npcFresh/areas';

/** World area ids with a fallback pool: the five town areas (TownArea), Summit Isle, and the deep-sea boats. */
export const FRESH_AREAS=['square','beach','pier','cay','residential','summit','sea'] as const;
export type FreshAreaId=typeof FRESH_AREAS[number];

const byNpc:Record<string,NpcFresh>={...PART_1,...PART_2,...PART_3,...PART_4,...PART_5,...PART_6,...PART_7,...PART_8};
export const FRESH:NpcFreshBook={byNpc,byArea:FRESH_AREA_POOLS};
