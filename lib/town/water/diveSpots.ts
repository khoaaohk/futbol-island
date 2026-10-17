/**
 * Diving spots (water phase P2, Oct 16 2026; docs/swimming-research.md §2.4 and "P2 implemented: one spot"). User, Oct 16 2026:
 * "For the diving spots, have some type of marker on the top of the water, and also the water spot for the diving area should
 * also be a different shade to let the user know they can dive and explore that area. entering this will allow the character to
 * swim under water and interact with the different areas. build one to test first to see how it works, then we can add more
 * diving spots throughout the maps." and "make sure the under water scene is robust with coral and fish swimming around."
 *
 * Pure data and a few pure helpers (no three.js, no DOM; tests/water-dive.cjs). Each spot is ONE row of DIVE_SPOTS: where it
 * floats on the island sea (centre and radius of the lighter patch, the buoy), the underwater room's theme, its finds (room-local
 * positions) and its one Real football fact. Adding the next spot is a new row (the ocean shader has DIVE_SLOTS patch slots, the
 * buoys are one instanced draw, the room is built from the theme) plus a fact that is verified before it ships.
 *
 * Labels follow AGENTS.md: a **Real football fact** carries a plain-text credit (no links in kid UI), a *Coaching idea* is a
 * metaphor, and *Island story* is the game's own fiction. Paul the Octopus is real football culture (the fact); the octopus that
 * lives under the old goal here is island fiction (the story), and says so.
 */

/** Room-local frame: x right, z toward the camera at the start, y up; the sand is around y 0 and the surface at DIVE_SURFACE_Y. */
export const DIVE_SURFACE_Y=8.4;
/** How far the room reaches (m): the diver stays inside DIVE_ROOM_R; the rock ring and the fog wall sit beyond it. */
export const DIVE_ROOM_R=15;
/** The diver keeps at least this much water under them and this much over their head (m). */
export const DIVE_FLOOR_GAP=.7,DIVE_CEILING_GAP=.9;
/** The ocean shader holds this many patch slots (WATER_UNIFORMS.uDiveSpots); a slot with strength 0 costs one compare. */
export const DIVE_SLOTS=4;
/** The floating prompts' words. */
export const DIVE_PROMPT='Dive',DIVE_PROMPT_LABEL='Dive here: swim under the water and explore';
export const DIVE_REST_PROMPT='Catch your breath';
/** Underwater, a find's prompt shows within this distance of it (m, 3D). */
export const DIVE_FIND_RANGE=2.6;

export type DiveFindKind='relic'|'burst'|'clam'|'treasure';
export type DiveLabel='Real football fact'|'Coaching idea'|'Island story';
export type DiveFind={
 id:string;kind:DiveFindKind;
 /** The floating prompt's word and its accessible label. */
 prompt:string;aria:string;
 /** Room-local position of the thing: x and z, and y its middle's height over the sand there (diveFindPoint gives the 3D point). */
 x:number;y:number;z:number;
 /** The card shown when it is used: title, the line and what kind of line it is. */
 title:string;text:string;label:DiveLabel;
 /** A Real football fact's plain-text source (no link). */
 credit?:string;
 /** Island fiction shown under the line, labelled Island story. */
 story?:string;
 /** Coins, once ever, through the Training meter (`dive:` wallet runs, lib/town/dailyMeter.ts). Never more than a hidden ball. */
 coins?:number;
};
export type DiveTheme={
 /** The fog / background colour and the fog's start and end (m). */
 water:string;fog:[number,number];
 /** The sand's two tones (ripple troughs and crests) and the rocks'. */
 sand:[string,string];rock:[string,string];
 /** Coral colours in the island's palette (each piece picks one). */
 coral:readonly string[];
 /** Sea fans, anemones and kelp (the swaying mesh). */
 fan:readonly string[];anemone:readonly string[];kelp:readonly string[];
 /** The hemisphere light: sky colour (from the surface), ground colour (bounced off the sand), intensity. */
 light:[string,string,number];
};
export type DiveSpot={
 id:string;name:string;
 /** Island position of the patch centre (the buoy floats here) and its radius (m). */
 x:number;z:number;radius:number;
 /** The patch's colour (lighter, turquoise) on the ocean. */
 tint:string;
 /** Fishing float / stand nearby, for the clearance test (tests/water-dive.cjs). */
 near:string;
 /** Where you come out of the water when you surface (island, beside the buoy, inside the patch). */
 surface:{x:number;z:number};
 theme:DiveTheme;
 finds:readonly DiveFind[];
 /** The spot's one Real football fact (shown on the relic) and its plain-text credit. */
 fact:{text:string;credit:string};
 /** The football idea the whole dive teaches (the breath meter's lesson is shared: DIVE_LESSON in diveSession.ts). */
 lesson:string;
 /** One line of island fiction about the place. */
 story:string;
};

/** The island palette's reef colours (lib/town/fishing/underwater.ts REEF_THEMES, coralCayWorld.ts): coral pinks and oranges, a
 *  lilac, a sunny yellow and a teal, never neon. */
const REEF:DiveTheme={
 water:'#2a8a9c',fog:[10,32],
 sand:['#c9b48a','#ead9b0'],rock:['#6f7a78','#94a09a'],
 coral:['#ff7a6b','#ff9f5a','#f2c14e','#e86a9a','#b88be0','#ff5a7a','#ffb4a2','#4fc7b0'],
 fan:['#c4407a','#8f5bd6','#e8604c','#f29a3a'],anemone:['#f6d36b','#ff9fb4','#9de0c8','#ffb36b'],kelp:['#3f8f4a','#5aa652','#7aa83a'],
 light:['#c8f6ff','#e6d2a6',2.9],
};

/**
 * Paul's Grotto (docs/swimming-research.md §2.4 candidate 6): off North Beach Rocks on the main island, the tide-pool rocks where
 * "Octopuses hide in the cracks" (lib/town/fishing/fishCatalog.ts north-rocks). The patch sits 29 m off the rocks, 24 m east of the
 * North Beach Rocks fishing float (60, −266.9) so a cast never lands in it, and ≥ 170 m from every shark, manta and whale-shark loop.
 * Its fact is the one already verified in the repo (fishCatalog.ts octopus → Paul the Octopus, Wikipedia).
 */
export const DIVE_SPOTS:readonly DiveSpot[]=[
 {id:'pauls-grotto',name:'Paul’s Grotto',x:84,z:-272,radius:9,tint:'#5fe3d6',near:'north-rocks',surface:{x:84,z:-269.4},theme:REEF,
  fact:{text:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
   credit:'Wikipedia, “Paul the Octopus”'},
  lesson:'Reading the game: good players guess what happens next from what they see. Paul’s 8 out of 8 was luck; reading the game is skill.',
  story:'An octopus lives under the old goal and likes to tip over the two flag boxes, the way Paul did. Nobody knows who left the goal here.',
  finds:[
   {id:'relic',kind:'relic',prompt:'Look',aria:'Look at the old sunken goal',x:-1.2,y:1.3,z:-9.2,
    title:'The sunken goal',label:'Real football fact',
    text:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
    credit:'Wikipedia, “Paul the Octopus”',
    story:'Island story: the octopus under this goal tips over the flag boxes too. A good guess is luck; reading the game is a skill you can practise.'},
   {id:'coral',kind:'burst',prompt:'Touch',aria:'Touch the coral',x:7.4,y:1.1,z:-3.6,
    title:'Everyone moves together',label:'Coaching idea',
    text:'The whole shoal darts out at once. When your team loses the ball, press together straight away: one player alone is easy to beat.'},
   {id:'clam',kind:'clam',prompt:'Open',aria:'Open the giant clam',x:-7.2,y:.55,z:-2.4,
    title:'Wait for your moment',label:'Coaching idea',
    text:'A clam only opens when the water is calm. A good striker waits for the right moment too, then strikes.'},
   {id:'treasure',kind:'treasure',prompt:'Take',aria:'Take the old matchday coin',x:4.6,y:.5,z:6.2,
    title:'An old matchday coin',label:'Island story',coins:3,
    text:'A coin from the island’s very first beach match, lost overboard on the boat home.',
    story:'Island story. Put into your coins once, on the Training meter.'},
  ]},
];

export const diveSpotById=(id:string)=>DIVE_SPOTS.find(s=>s.id===id);
/** The spot whose patch (x, z) is inside, or null: what the 10 Hz prompt test asks (a few compares per spot). */
export function diveSpotAt(x:number,z:number,spots:readonly DiveSpot[]=DIVE_SPOTS):DiveSpot|null{
 for(const s of spots){const dx=x-s.x,dz=z-s.z;if(dx*dx+dz*dz<=s.radius*s.radius)return s;}return null;
}

/** The sand's height in the room (m, room-local): a gentle bowl deepening away from the start, two sandy mounds, low ripples.
 *  Shared by the room builder (the seabed mesh) and the swim step (the diver's auto-level), so both always agree. */
export function diveFloor(x:number,z:number){
 const r=Math.hypot(x,z);
 return .35*Math.sin(x*.21+1.3)*Math.cos(z*.17-.4)+.9*Math.exp(-((x-6)**2+(z+5)**2)/30)+.7*Math.exp(-((x+7)**2+(z+3)**2)/22)
  +.6*Math.max(0,(r-12)/6)**2*6;
}
/** A find's 3D room point (its y measured over the sand at its x, z). */
export function diveFindPoint(f:Pick<DiveFind,'x'|'y'|'z'>,out:{x:number;y:number;z:number}={x:0,y:0,z:0}){out.x=f.x;out.y=diveFloor(f.x,f.z)+f.y;out.z=f.z;return out;}
/** The ripple lines on the sand (paint only: the mesh is too coarse to carry them as height), 0..1. */
export const diveRipple=(x:number,z:number)=>.5+.5*Math.sin(x*2.1+Math.sin(z*.6)*1.8+z*.5);
