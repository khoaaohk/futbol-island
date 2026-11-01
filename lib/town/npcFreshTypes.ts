/**
 * Contract for fresh NPC chat content (Nov 1 2026). Authored data only: no network, nothing server-side, so cost never grows with players.
 * `lib/town/npcFresh.ts` (content) exports FRESH; the chat mechanism (lib/town/npcFreshPicker.ts + components/NpcConversation.tsx) consumes it.
 */
/** An extra "ask me" topic, shown a few at a time and never repeated until the whole pool has been seen. Same shape as NpcTopic. */
export type FreshTopic={id:string;question:string;answer:string;followUp?:{question:string;answer:string}};
/** A one-tap mini challenge the NPC poses: three options, one correct, a short kid-friendly reason for each outcome. */
export type NpcChallenge={id:string;prompt:string;options:[string,string,string];correct:0|1|2;right:string;wrong:string};
export type NpcFresh={
  topics:FreshTopic[];
  challenges:NpcChallenge[];
  /** Extra openers (greetings) to rotate in beside the existing ones; never repeat the same one back to back. */
  openers:string[];
  /** Said when the player comes back and has already seen several of this NPC's topics. {topic} is replaced by the question text of one already asked. */
  returning:string[];
};
export type NpcFreshBook={byNpc:Record<string,NpcFresh>;
  /** Fallback pools keyed by area id for NPCs with no pool. */
  byArea:Record<string,NpcFresh>};
