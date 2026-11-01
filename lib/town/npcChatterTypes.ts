/**
 * Shared shape for ambient NPC thoughts and banter (Nov 1 2026). Pure authored data, zero network: nothing here costs more as
 * players grow, and bubbles are local to each player's screen (never sent over the relay).
 * `lib/town/npcThoughts.ts` (content) exports THOUGHTS; `lib/town/npcChatter.ts` (engine) consumes it.
 */
/** Where a thought can be said. `near` = a player passes slowly close by; `idle` = said alone now and then; `area` = fits anywhere in a zone. */
export type ThoughtKind='near'|'idle';
export type NpcThoughts={
  /** One short, kid-safe line per entry (max ~48 chars, no emoji needed). Tied to this character's job, mood or interests. */
  near:string[];
  idle:string[];
};
/** A two-to-four line exchange between two named NPCs who are near each other. Lines alternate a,b,a,b. */
export type NpcBanter={
  id:string;
  /** NPC ids that may speak it; the engine picks any social pair that both appear in (a speaks first). */
  a:string;b:string;
  lines:string[];
};
export type NpcThoughtBook={
  /** Per-NPC pools, keyed by NPC id (see lib/town/npcDialogues.ts and the *Npcs.ts cast files). */
  byNpc:Record<string,NpcThoughts>;
  /** Fallback pools by area id, used for NPCs with no pool and as extra variety. */
  byArea:Record<string,NpcThoughts>;
  banter:NpcBanter[];
};
