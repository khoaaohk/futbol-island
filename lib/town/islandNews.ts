export type IslandNewsKind='scores'|'transfers';
/** `url` is '' when the source has no public match page (football-data.org). */
export type IslandNewsItem={league?:string;match?:MatchReport;id:string;title:string;url:string;source:string;publishedAt:string;detail:string};
/** `lastResults`: when a league has no verified result in the past week, its most recent verified results (older, dated).
 * `season`: the source has no completed match in the lookback at all (between seasons); `nextMatchAt` when scheduled.
 * `lastUnavailable`: the past week has no result and every source failed for the last-result lookup.
 * `attribution`: credit line the score provider requires (football-data.org terms 7.1), shown with its scores. */
export type IslandNewsFeed={kind:IslandNewsKind;fetchedAt:string;items:IslandNewsItem[];unavailable:boolean;partial:boolean;lastResults?:IslandNewsItem[];season?:{between:true;nextMatchAt?:string};lastUnavailable?:true;attribution?:string};
export type MatchGoal={player:string;minute:string;team:string;ownGoal:boolean;penalty:boolean};
export type MatchReport={home:string;away:string;homeScore:string;awayScore:string;state:string;/** ESPN status.type.completed (false for postponed/abandoned games that are also in state post). */completed?:boolean;goals:MatchGoal[];goalsComplete:boolean};
