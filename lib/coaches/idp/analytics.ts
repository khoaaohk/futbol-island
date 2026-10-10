/**
 * IDP analytics (docs/idp/DESIGN.md §7): one fixed `ip:<event>` counter per moment, through the existing learning counter
 * channel (lib/analytics/tracker.ts count: a map increment, no request, no timer; a no-op whenever the tracker is off). Totals
 * per day only: never which goal, mission, sticker, feeling or note, and never anything that identifies a child.
 */
import {count} from '../../analytics/tracker';
import type {IDP_COUNT_EVENTS} from '../../analytics/countIds';
export type IdpEvent=typeof IDP_COUNT_EVENTS[number][0];
export const countIdp=(event:IdpEvent)=>{try{count('ip:'+event);}catch{}};
