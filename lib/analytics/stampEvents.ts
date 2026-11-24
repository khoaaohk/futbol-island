/**
 * Island stamp book call sites (Nov 23 2026, lib/town/islandStamps.ts): one count at the moment it happens (the book opens, a stamp
 * is collected for the first time, the book is completed). Totals only (`is:` family, countIds.ts STAMP_COUNT_EVENTS).
 */
import {count} from './tracker';
import type {StampId} from '../town/islandStamps';

export const countStampBookOpen=()=>count('is:open');
export function countStampCollected(id:StampId,completed:boolean){count('is:stamp');count('is:stamp_'+id);if(completed)count('is:complete');}
