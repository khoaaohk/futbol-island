export type IslandNewsKind='scores'|'transfers';
export type IslandNewsItem={league?:string;match?:MatchReport;id:string;title:string;url:string;source:string;publishedAt:string;detail:string};
export type IslandNewsFeed={kind:IslandNewsKind;fetchedAt:string;items:IslandNewsItem[];unavailable:boolean;partial:boolean};
export type MatchGoal={player:string;minute:string;team:string;ownGoal:boolean;penalty:boolean};
export type MatchReport={home:string;away:string;homeScore:string;awayScore:string;state:string;goals:MatchGoal[];goalsComplete:boolean};
