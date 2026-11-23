/**
 * The two groups of the tools hub (Nov 22 2026, owner: "reorganize the tools: two types, regular training tools and game day
 * tools"), as tool paths in card order. /tools and /es/tools both read this; every path must be a tool page (the hub throws).
 * The format lineup builders sit in a sub-row under Game day; the single printables in a sub-row under Training.
 * TODO(tools-wt merge): '/tools/soccer-tactics-board' joins `training` (after the scanning trainer) when that route lands.
 */
export const TOOL_GROUPS={
 training:['/tools/soccer-practice-plan-generator','/tools/soccer-scanning-trainer','/tools/soccer-field-diagrams','/tools/soccer-beep-test','/tools/soccer-juggling-challenge','/tools/soccer-team-name-generator'],
 gameDay:['/tools/soccer-playing-time-calculator','/tools/7v7-substitution-rotation','/tools/9v9-substitution-rotation','/tools/soccer-match-timer','/tools/soccer-tournament-schedule-maker','/tools/youth-soccer-field-size-guide','/tools/youth-soccer-stats-tracker'],
} as const;
