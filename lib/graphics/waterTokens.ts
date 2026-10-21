/**
 * Water tokens (Oct 20 2026, the water audit §2, first slice): the ONE water line and the dive shoal / reef room colours, so the dive
 * files stop repeating literals. Pure data (no three.js objects). Colours are sRGB hex unless named *_LIN (linear RGB, as the shaders
 * and the vertex colours use them). The non-dive water files keep their own copies for now (tests/dive-layout.cjs pins
 * WATER_Y === waterDepth.ts WATER_LEVEL and UNDER_SURFACE_Y === fishing/underwater.ts UW_SURFACE).
 */
/** The island's water line (m). */
export const WATER_Y=-.43;
/** Just under the water line: the under-water pieces' surface (the clear window / shoal seabed reference). */
export const UNDER_SURFACE_Y=-.42;

/** The shoal's heart reads as water this far off a beach (m; waterSurface.ts DIVE_SHOAL.heart, diveShoreD). */
export const SHOAL_HEART_D=2.5;
/** Where the seabed preview is OFF (heat tiers 3-4, Battery saver, past the preview range, the opaque program) the heart reads as this
 *  shore distance instead: a flat muted turquoise a little lighter than the sea, never the pale sandy shallows (which read as a khaki
 *  sandbar with nothing under them; water audit #10). */
export const SHOAL_OPAQUE_D=8;

/** The preview's sand shelf: the shore bed's teal past ~1.5 m of shore distance and its deep teal (linear RGB). */
export const SHOAL_TEAL_LIN=[.2,.5,.52] as const,SHOAL_DEEP_LIN=[.08,.36,.42] as const;
/** The preview's sand on the crest / the lanes (linear RGB, a little paler than the shelf). */
export const SHOAL_LANE_LIN=[.86,.82,.66] as const;
/** The preview's muted reef props: browns and rust, olive, mauve (tinted DIVE_TELL_TINT toward each cluster's own coral hue). */
export const SHOAL_MUTED=['#6f5640','#7b5a43','#66683f','#6e5f68','#5b6248'] as const;
export const SHOAL_ROCK=['#3f4746','#4a514c','#3a3f3d'] as const;
export const SHOAL_GRASS=['#3f6b45','#4d7a48','#5b7d3e'] as const;
export const SHOAL_KELP_TOP='#2e4a2a',SHOAL_PITCH='#f4efe0',SHOAL_RAY='#1d3a46';
/** Paul's Grotto: the algae turf over the old pitch (the room's sand and the preview's shelf both use it). */
export const PITCH_TURF='#6f9a58';
/** How far a muted preview coral moves toward its cluster's own theme colour (the audit: "the surface promises what the room delivers"). */
export const DIVE_TELL_TINT=.35;
/** The far shoal decal (zones past the two full-detail slots): its heart, its coral patches, its lanes, its grass, the peak alpha. */
export const SHOAL_DECAL={heart:'#5aa89c',patch:'#2f716c',lane:'#86c2b2',grass:'#3a6f63',alpha:.6} as const;

/** The reef room's bright surface overhead (seen from below). */
export const ROOM_CEILING='#bfeef5';

/** Explore v2 (Oct 21 2026; user: "the room's background is still a fixed colour"): the room's water is no longer one flat colour. The
 *  fog and the background are mixed each frame from the zone's deep tint (theme.water) toward ROOM_SHALLOW by how high the camera is in
 *  the water column (just under the surface over the crest: clear turquoise like the shore shoal; low over the rim: the zone's tint).
 *  ROOM_SHALLOW_MIX is the turquoise share at the top / at the bottom of the column. */
export const ROOM_SHALLOW='#5cc7c4',ROOM_SHALLOW_MIX=[.62,.18] as const;
/** The surface seen from below: the bright window overhead (Snell's window; a clear aqua, not the old near-white band) and the caustic
 *  shimmer lines across it; far off it fades into the fog colour (no flat pale band on a phone's tall view). */
export const ROOM_WINDOW='#8fdcdc',ROOM_SHIMMER='#d8fbf6';
/** The light lines on the sand (the shore's sun-net, moving): colour and peak strength (0 at heat tier 2+ / Battery saver: static). */
export const ROOM_CAUSTIC='#bff3e6',ROOM_CAUSTIC_K=.34;
