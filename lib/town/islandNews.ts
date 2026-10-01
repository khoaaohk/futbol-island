export type IslandNewsKind='scores'|'transfers';
export type IslandNewsItem={league?:string;match?:MatchReport;id:string;title:string;url:string;source:string;publishedAt:string;detail:string};
/** `lastResults`: when a league has no verified result in the past week, its most recent verified results (older, dated).
 * `season`: the source has no completed match in the lookback at all (between seasons); `nextMatchAt` when scheduled. */
export type IslandNewsFeed={kind:IslandNewsKind;fetchedAt:string;items:IslandNewsItem[];unavailable:boolean;partial:boolean;lastResults?:IslandNewsItem[];season?:{between:true;nextMatchAt?:string}};
export type MatchGoal={player:string;minute:string;team:string;ownGoal:boolean;penalty:boolean};
export type MatchReport={home:string;away:string;homeScore:string;awayScore:string;state:string;/** ESPN status.type.completed (false for postponed/abandoned games that are also in state post). */completed?:boolean;goals:MatchGoal[];goalsComplete:boolean};
