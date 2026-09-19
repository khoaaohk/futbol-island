/**
 * Child-facing video publication gate. An official channel is not a content review.
 * Add an entry only after a reviewer watches the entire video, including audio,
 * title and thumbnail. Never auto-approve from views, keywords or publisher status.
 * Reviewed clips must contain recent, non-graphic futbol highlights or reporting;
 * exclude violence/injury closeups, abuse, sexual content, profanity, gambling
 * promotions, dangerous imitation challenges and unrelated advertising segments.
 * YouTube's own ads/recommendations remain outside this app's editorial control.
 */
export type ApprovedIslandClip={
 id:string;channelId:string;reviewedAt:string;expiresAt:string;
 reviewNote:string;
 // Optional curated topic metadata; reviewer verifies concept and any latest-final claim.
 title?:string;publishedAt?:string;topics?:string[];
};
// Fail closed until individual videos have been reviewed. No invented approvals.
export const APPROVED_ISLAND_CLIPS:readonly ApprovedIslandClip[]=[];
