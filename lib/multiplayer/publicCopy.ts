/**
 * Every word the public island's UI shows (phase 1, docs/multiplayer-public-island-plan-2026-11-11.md "UX wording"). The UI agent
 * imports these; nothing here is shown unless publicWorldEnabled() (lib/multiplayer/publicFlag.ts) is true.
 *
 * Voice: child-facing lines use words a 7-year-old reads; the grown-up lock speaks plainly to a parent. No ranking and no scary
 * words. Never promise what the system cannot do: it never says "safe". It says only what is true: nobody can chat, names
 * are made up by the game, you can hide or report someone, and a grown-up can switch it off. tests/mp-public-copy.cjs checks
 * every string against lib/site/safety.ts BANNED_CLAIMS.
 *
 * SILENT FALLBACK HAS NO TEXT, on purpose: when the public service is unreachable, full or switched off by the owner, the game
 * quietly plays as "Just me" and retries later. No error, no banner, no count (the panel shows the "Nobody else right now"
 * count form only when a world answered).
 */

/** The three presence choices, in panel order (ids match lib/multiplayer/presenceMode.ts modes). */
export type PresenceChoiceId='solo'|'public'|'friends';
/* Nov 11 2026 (owner): shortened so the panel title fits on one line on a phone. */
export const PUBLIC_PANEL_TITLE='Who’s here?';
export const PRESENCE_CHOICES:readonly {id:PresenceChoiceId;label:string;line:string}[]=[
 {id:'solo',label:'Just me',line:'Only you and the islanders.'},
 {id:'public',label:'With other players',line:'Kids playing right now. Wave, cheer and play matches. Nobody can chat.'},
 {id:'friends',label:'With friends',line:'Friends you know join with a code.'},
];

/** Above this many other players the count reads "lots" (the world's hard cap, WORLD_HARD 30). */
export const PUBLIC_COUNT_LOTS_ABOVE=30;
/** The count beside "With other players": others in your world, never you. 0 → "Nobody else right now". */
export function publicCountLabel(others:number):string{
 const n=Number.isFinite(others)?Math.max(0,Math.floor(others)):0;
 if(n===0)return 'Nobody else right now';
 return n>PUBLIC_COUNT_LOTS_ABOVE?'lots on now':`${n} on now`;
}
/** "With other players · 8 on now" (the choice's label with its count). */
export const publicChoiceLabel=(others:number)=>`With other players · ${publicCountLabel(others)}`;

/** Shown once per device, when another player first comes within 25 m (device key fi2-public-hint-v1). */
export const PUBLIC_FIRST_CARD={
 title:'Other kids are here!',
 body:'These are other kids playing right now. You can wave, cheer and play matches together. Nobody can chat, and the game makes up their names.',
 solo:'To play on your own, tap the people button.',
 ok:'OK!',
} as const;

/** Phase 2 (Nov 12 2026): a player who had an island before the public island arrived, shown once beside the people button
 *  (PeopleButton.tsx) until a tap on it or on the button. It names the way back to playing alone. Owner Nov 12 2026: styled like the
 *  daily-coins note (title + line, no OK button). */
export const PUBLIC_EXISTING_HINT={
 line:'Other kids can be on your island now.',
 solo:'To play on your own, tap the people button and pick Just me.',
} as const;

/** Switching mode while in a shared live match is an implicit leave: one line, then Switch / Stay. */
export const PUBLIC_MATCH_LEAVE={line:'You’ll leave this match.',go:'Switch',stay:'Stay'} as const;

/** Hide (local, this visit only) and its undo. */
export const PUBLIC_HIDE={
 hide:'Hide',
 hidden:'Hidden. You won’t see them again this visit.',
 unhide:'Show again',
} as const;

/**
 * Report reasons, in the protocol's order. `wire` is multiplayer/protocol/types.ts ReportReason (the int C.Report sends); `id` is
 * the analytics bucket (lib/analytics/publicEvents.ts countPublicReport(id) -> mp:pub_report_<id>).
 */
export type ReportReasonId='following'|'inmyway'|'waves'|'other';
export const REPORT_REASONS:readonly {id:ReportReasonId;wire:0|1|2|3;label:string}[]=[
 {id:'following',wire:0,label:'They keep following me'},
 {id:'inmyway',wire:1,label:'They keep getting in my way'},
 {id:'waves',wire:2,label:'Too many waves or cheers'},
 {id:'other',wire:3,label:'Something else'},
];
/** The report sheet. Reporting also hides that player at once, for this visit. */
export const PUBLIC_REPORT={
 button:'Report',
 title:'What’s wrong?',
 cancel:'Back',
 final:'A report can’t be undone. Hide can.',
 thanks:'Thanks for telling us. You won’t see them again this visit.',
 grownUp:'If something upset you, tell a grown-up.',
 done:'OK',
} as const;

/**
 * The grown-up lock (Settings, behind the grown-up check; device key fi2-multiplayer-allowed-v1: all / friends / off).
 * Addressed to the parent. "all" is the default.
 */
export type PlayLockId='all'|'friends'|'off';
export const PLAY_LOCK_TITLE='Playing with others';
export const PLAY_LOCK_SETTINGS:readonly {id:PlayLockId;label:string;line:string}[]=[
 {id:'all',label:'Other players and friends',line:'Your child can see other kids who are playing now, and play with friends who join with a code. Nobody can chat; names are made up by the game.'},
 {id:'friends',label:'Friends only',line:'Only friends who join with a code. Other players are never shown.'},
 {id:'off',label:'Off',line:'Your child plays on their own. No other players and no friends.'},
];

/** UI agent (C), Nov 11 2026: the lines the panel, the people button, the rooms and the lock need beyond the ones above. */
/** The people button's screen-reader label: in a world with others, the count ("lots" above 30); otherwise the panel's question. */
export function peopleButtonLabel(others:number|null):string{
 if(others===null||!Number.isFinite(others)||others<=0)return 'Who’s on your island?';
 return `Players on your island, ${others>PUBLIC_COUNT_LOTS_ABOVE?'lots':Math.floor(others)}`;
}
/** The live count under the people button (phase 2): "8 on now", "lots on now" above 30; null at 0 (nothing shown; the panel
 *  says "Nobody else right now"). Fed only by counts already on the socket (presence.count): no timer, no poll. */
export const peopleBadge=(others:number):string|null=>Number.isFinite(others)&&others>=1?publicCountLabel(others):null;
/** One calm line under the choices when "With other players" cannot be on (presenceMode.ts PresenceReason). Never an error. */
export const PUBLIC_REASON_LINE={
 'locked-friends':'A grown-up chose Friends only. A grown-up can change this in Settings.',
 'locked-off':'A grown-up switched playing with others off.',
 tutorial:'Finish the island tour first. Then other players can come.',
 closed:'Other players aren’t here right now. You’re playing on your own.',
 unavailable:'Other players aren’t here right now. You’re playing on your own.',
} as const;
/** The panel's roster (only in "With other players"): who is near you, nearest first, and who you hid. */
export const PUBLIC_ROSTER={
 title:'Near you',
 empty:'Nobody near you right now.',
 further:'Others are further away.',
 hiddenTitle:'Hidden this visit',
 chosen:'Chosen',
} as const;
/** Rooms (Arcade, Shop, Museum, Konbini): the small chip and its roster. "Just me" is the presence choice, never a party control. */
export const publicRoomChip=(here:number)=>`${here} ${here===1?'player':'players'} here`;
export const PUBLIC_ROOM={title:'Players here',empty:'No other players in here right now.',solo:'Just me'} as const;
/** Mid-match lines (lib/multiplayer/matchLink.ts says them for friends; in a world these neutral ones are shown instead). */
export const PUBLIC_MATCH_LINES={
 lost:'The other players left the match: the game plays on here.',
 ownerLeft:'A player left: the match is on your device now. Play on!',
} as const;
/** The grown-up check before the lock changes. */
export const PLAY_LOCK_GATE='Change who your child can play with. Nobody can chat.';
/** Tap on a player (phase 1, Nov 11 2026): the small card beside another player. Wave / Hide / Report (Report for other players only). */
export const PUBLIC_PLAYER_CARD={
 wave:'Wave',
 waved:'You waved!',
 stranger:'another player',
 friend:'your friend',
} as const;
/** The card's screen-reader name: "Teal Giraffe, another player". */
export const playerCardLabel=(name:string,friend:boolean)=>`${name}, ${friend?PUBLIC_PLAYER_CARD.friend:PUBLIC_PLAYER_CARD.stranger}`;

/** Every string above, flattened (tests/mp-public-copy.cjs scans these for banned claims). */
/** Phase 3 (Nov 12 2026): Match o'clock, the island goal (lib/multiplayer/islandLife.ts). Short, for kids; one football tip per hour. */
export const MATCH_OCLOCK={title:'It’s Match o’clock!',body:(pitch:string)=>`Kids are meeting at ${pitch}. Follow the gold light and join the match.`} as const;
export const MATCH_OCLOCK_TIPS:readonly string[]=[
 'Tip: find space, then call for the ball.',
 'Tip: pass to a teammate who is free.',
 'Tip: keepers, come off your line to stop a shot.',
 'Tip: after you pass, move into a new space.',
];
export const ISLAND_GOAL_COPY={
 line:(n:number,target:number)=>`Island goal today: ${Math.min(n,target)} of ${target} goals`,
 doneTitle:'Island goal done!',
 doneBody:(target:number)=>`Kids on this island scored ${target} goals today. Great teamwork!`,
} as const;
export function allPublicCopy():string[]{
 return [PUBLIC_PANEL_TITLE,...PRESENCE_CHOICES.flatMap(c=>[c.label,c.line]),publicCountLabel(0),publicCountLabel(8),publicCountLabel(99),publicChoiceLabel(8),
  ...Object.values(PUBLIC_FIRST_CARD),...Object.values(PUBLIC_EXISTING_HINT),...Object.values(PUBLIC_MATCH_LEAVE),...Object.values(PUBLIC_HIDE),
  ...REPORT_REASONS.map(r=>r.label),...Object.values(PUBLIC_REPORT),PLAY_LOCK_TITLE,...PLAY_LOCK_SETTINGS.flatMap(s=>[s.label,s.line]),
  peopleButtonLabel(null),peopleButtonLabel(8),peopleButtonLabel(99),...Object.values(PUBLIC_REASON_LINE),...Object.values(PUBLIC_ROSTER),
  publicRoomChip(1),publicRoomChip(3),...Object.values(PUBLIC_ROOM),...Object.values(PUBLIC_MATCH_LINES),PLAY_LOCK_GATE,...Object.values(PUBLIC_PLAYER_CARD),playerCardLabel('Teal Giraffe',false),
  MATCH_OCLOCK.title,MATCH_OCLOCK.body('Sharks Beach Court'),...MATCH_OCLOCK_TIPS,ISLAND_GOAL_COPY.line(23,50),ISLAND_GOAL_COPY.doneTitle,ISLAND_GOAL_COPY.doneBody(50)];
}
