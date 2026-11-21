/**
 * "Share the game with your team" (Nov 20 2026; components/share/TeamShare.tsx, lib/share/teamShare.ts): the `ts:` count ids.
 * Kept in its own file so countIds.ts only gains one import and one spread line.
 *
 * Totals only, per surface: the block opened, the message copied, the device share sheet used, the QR code shown, the Team
 * homework sheet printed. Never a team name, a player, the message text, the lesson chosen or who it was sent to. The ids match
 * COUNT_KEY_RE (countIds.ts), which is also all the database checks, so no migration is needed.
 */
export const SHARE_SURFACES=[['coach','Coach app'],['lineup','Lineup builders'],['minutes','Playing-time calculator'],['practice','Practice plans']] as const;
export type ShareSurface=typeof SHARE_SURFACES[number][0];
export const SHARE_EVENTS=[['open','Team share opened'],['copy','Team share: message copied'],['sheet','Team share: share sheet used'],['qr','Team share: QR code shown'],['print','Team homework printed']] as const;
export type ShareEvent=typeof SHARE_EVENTS[number][0];
export const shareId=(event:ShareEvent,surface:ShareSurface)=>`ts:${event}_${surface}`;
/** [event_surface, label] rows, the shape lib/analytics/daily.ts addLabels takes with the 'ts:' prefix. */
export const SHARE_COUNT_EVENTS:readonly (readonly [string,string])[]=SHARE_EVENTS.flatMap(([e,l])=>SHARE_SURFACES.map(([s,n])=>[`${e}_${s}`,`${l} (${n})`] as const));
export const SHARE_COUNT_IDS:readonly string[]=SHARE_COUNT_EVENTS.map(([e])=>'ts:'+e);
