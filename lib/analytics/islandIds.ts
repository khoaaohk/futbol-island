/**
 * "Where on the island" analytics (Oct 8 2026): the ONLY ids a beat may carry for places, activities and heat-map cells.
 * Tiny and dependency-free on purpose: core.ts (server validation), tracker.ts (every page) and the dashboard import it, while
 * the geometry that maps x/z onto these ids lives in islandPlaces.ts (loaded with the island only).
 *
 * Privacy: these are totals per fixed bucket. Nothing here (or anywhere) stores a path, an order of visits or a time per
 * position; a heat-map cell is a 20 m square of seconds added up over everyone that day.
 */

/** Named places, in the dashboard's map order. `sea` is open water and sky (off land), the catch-all off the coast. */
export const PLACES=[
 ['island_square','Island Square'],['arcade','Arcade (outside)'],['konbini','Konbini (outside)'],['coaches','Coaches Centre'],
 ['library_square','Library Square'],['community_park','Community Park'],['old_town','Old Town'],['field_7v7','Old Town Ground (7v7)'],
 ['field_futsal','Palm Coast Rooftop (futsal)'],['palm_coast','Palm Coast Beach'],['west_side','West Market & Beach Kitchen'],
 ['field_9v9','Club Grounds pitch (9v9)'],['club_grounds','Club Grounds homes'],['community_hall','Kit Shop (outside)'],
 ['community_garden','Community Garden & Greenhouse'],['farmers_market','Farmers Market & Rosa’s'],['east_jetty','East Jetty'],
 ['field_11v11','Eleven Park (11v11)'],['school','Island High School'],['museum','History Museum (outside)'],
 ['south_pier','South Pier & cafés'],['ferry_dock','Ferry dock & Fishing Station'],['north_beach','North Beach'],['town','Other streets (main island)'],
 ['causeway','Causeway'],['sandbars','Sandbars (Starfish & Turtle)'],['deep_sea_boat','Deep-sea boat'],
 ['cay_town','Coral Cay town & plaza'],['cay_konbini','Coral Cay Konbini (outside)'],['hostel','Coral Cay Hostel & homes'],
 ['farm','Coral Cay Farm'],['beach_court','Beach soccer court'],['sharks_beach','Sharks Beach'],['coral_cay','Coral Cay (elsewhere)'],
 // Summit Isle (Oct 15 2026): the mountain island reached by its sandbar from Coral Cay (lib/town/summitIsle.ts). Needs
 // supabase/migrations/20261015_analytics_summit_kit.sql (place_ms allowlist) before time here is counted; see that file.
 ['summit_sandbar','Summit Sandbar'],['summit_pitch','Summit 5s (5v5 pitch)'],['summit_isle','Summit Isle (elsewhere)'],
 ['sea','Open sea & sky'],
] as const;
export type PlaceId=typeof PLACES[number][0];
export const PLACE_IDS=PLACES.map(p=>p[0]) as readonly PlaceId[];
export const PLACE_LABEL:Record<string,string>=Object.fromEntries(PLACES);

/**
 * Activities. On the island the base comes from Town's frame (walk / ride / fly / quiz / lesson / watch) and overlays from the
 * component that is open (enterActivity). Off the island it follows the page (arcade game, museum exhibit, konbini, controller).
 * `idle` is visible time with no input for a while (ACTIVITY_IDLE_MS): it is reported, but never counted as play in places
 * or cells.
 */
// Oct 14 2026: the west wing's ten history cases (the Your Collection pieces were never exhibits, so nothing is retired here).
export const MUSEUM_EXHIBITS=['timeline','laws-1863','penalty-1891','stadiums','boots','var-2018','worldcup-1930','wwc-1991','futsal-1989','laced-leather','telstar-1970','shirts','hall-of-fame',
 'first-international-1872','offside-rules','formations-history','floodlights-1878','copa-america-1916','keeper-hands-1912','ballon-dor','free-kick-wall','ball-curve','throw-in'] as const;
export const ARCADE_GAMES=['live','runner','tennis','pinball','puzzle'] as const;
export const ACTIVITIES=[
 ['walk','Walking'],['ride','Riding (scooter, bike, moped, truck)'],['fly','Flying (jetpack, parachute)'],['boat','On a boat'],['swim','In the sea (wading, swimming)'],
 ['fishing','Fishing'],['job','Island jobs'],['lesson','Watching a lesson'],['watch','Watching a match or play'],['quiz','Quiz'],
 ['book','Pop-up book'],['cards','Cards & binder'],['films','Card films & clips'],['vending','Vending machine'],['talk','Talking to islanders'],
 ['coaches','Coaches Centre'],['paths','Paths'],['menu','Menus & settings'],
 ['arcade_lobby','Arcade (walking around)'],['arcade_live','Arcade: Island Strikers'],['arcade_runner','Arcade: Breakaway Run'],
 ['arcade_tennis','Arcade: Futbol Tennis'],['arcade_pinball','Arcade: Futbol Pinball'],['arcade_puzzle','Arcade: Pass Puzzles'],
 ['museum_hall','Museum (walking around)'],
 ['exhibit_timeline','Exhibit: Timeline'],['exhibit_laws-1863','Exhibit: Laws of 1863'],['exhibit_penalty-1891','Exhibit: First penalty, 1891'],
 ['exhibit_stadiums','Exhibit: Stadiums of the World'],['exhibit_boots','Exhibit: Boots through time'],['exhibit_var-2018','Exhibit: VAR, 2018'],
 ['exhibit_worldcup-1930','Exhibit: World Cup 1930'],['exhibit_wwc-1991','Exhibit: Women’s World Cup 1991'],['exhibit_futsal-1989','Exhibit: Futsal, 1989'],
 ['exhibit_laced-leather','Exhibit: Laced leather ball'],['exhibit_telstar-1970','Exhibit: Telstar, 1970'],['exhibit_shirts','Exhibit: Shirts'],
 ['exhibit_hall-of-fame','Exhibit: Trophy room (Legends)'],
 ['exhibit_first-international-1872','Exhibit: First international, 1872'],['exhibit_floodlights-1878','Exhibit: Floodlights, 1878'],['exhibit_copa-america-1916','Exhibit: Copa América, 1916'],
 ['exhibit_offside-rules','Exhibit: Offside through time'],['exhibit_formations-history','Exhibit: Formations through time'],['exhibit_keeper-hands-1912','Exhibit: The goalkeeper’s hands, 1912'],
 ['exhibit_free-kick-wall','Exhibit: Free kicks and the wall'],['exhibit_ball-curve','Exhibit: How a ball curves'],['exhibit_throw-in','Exhibit: The throw-in'],['exhibit_ballon-dor','Exhibit: Ballon d’Or'],
 ['konbini_shop','Inside the Konbini'],
 // Oct 16 2026: the Kit Shop's own page (/shop) had no activity of its own and was booked as "Other / loading". Needs
 // supabase/migrations/20261016_analytics_kit_shop_activity.sql (activity_ms allowlist) before time here is counted.
 ['kit_shop','Kit Shop (walking around)'],['kit_studio','Kit Shop: designing in a studio'],
 ['controller','Phone controller'],['other','Other / loading'],['idle','Idle (no input)'],
] as const;
export type ActivityId=typeof ACTIVITIES[number][0];
export const ACTIVITY_IDS=ACTIVITIES.map(a=>a[0]) as readonly ActivityId[];
export const ACTIVITY_LABEL:Record<string,string>=Object.fromEntries(ACTIVITIES);
/** Activities that are engaged even without touches (watching, reading, thinking): the short idle cut does not apply. */
export const PASSIVE_ACTIVITIES:readonly ActivityId[]=['lesson','watch','quiz','book','films','museum_hall',...MUSEUM_EXHIBITS.map(e=>`exhibit_${e}` as ActivityId)];
/** No pointer/key input and no movement for this long → the time is "idle". */
export const ACTIVITY_IDLE_MS=60_000;

/**
 * Heat-map grid: 20 m squares over the whole flyable world (FLIGHT_BOUNDS x −152…864, z −318…300, which takes in Coral Cay
 * and its corridor), so x0/z0 are rounded out to the grid. Cell index = row * COLS + col.
 */
export const GRID={x0:-160,z0:-320,size:20,cols:52,rows:31} as const;
export const CELL_COUNT=GRID.cols*GRID.rows;
export function cellOf(x:number,z:number):number{
 if(!Number.isFinite(x)||!Number.isFinite(z))return -1;
 const c=Math.floor((x-GRID.x0)/GRID.size),r=Math.floor((z-GRID.z0)/GRID.size);
 return c<0||r<0||c>=GRID.cols||r>=GRID.rows?-1:r*GRID.cols+c;
}
export const cellCenter=(i:number)=>({x:GRID.x0+(i%GRID.cols+.5)*GRID.size,z:GRID.z0+(Math.floor(i/GRID.cols)+.5)*GRID.size});

/** Per-beat caps (also enforced in SQL): at most this many cells, and a cell never holds more than a beat can. */
export const MAX_BEAT_CELLS=64;
/** How often the island samples the player's x/z for the heat map (and re-checks the place). */
export const SAMPLE_MS=5_000;
/** One sample stands for at most this much time, so a sleeping frame loop (menus) never inflates a cell. */
export const SAMPLE_MAX_MS=7_500;
