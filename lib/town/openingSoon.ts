/**
 * Destinations that are not ready yet (G-01 part, Sep 30 2026): a neutral label instead of "Coming soon", which read as a dead end.
 * Lane 2 (endgame) switches each destination on by replacing its notice; until then it keeps its place on the map and points the
 * child back at the learning. Used by the Museum, the Matchday Ferry and the Coaches Board card; the in-world sign at the Coaches
 * Centre (lib/town/world.ts) reads OPENING SOON.
 */
export const OPENING_SOON_LABEL='Opening soon · finish your paths!';
export const OPENING_SOON_SIGN='OPENING SOON';
