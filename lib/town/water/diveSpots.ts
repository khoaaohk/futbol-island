/**
 * Dive zones (water phase P2, Oct 16 2026; zones Oct 20 2026). User, Oct 16 2026: "For the diving spots, have some type of marker
 * on the top of the water, and also the water spot for the diving area should also be a different shade ... entering this will allow
 * the character to swim under water and interact with the different areas." Oct 20 2026 follow-ups: the patch is an irregular blob
 * and bigger; the room is larger with two depth levels (a shallow reef shelf and a deeper level); "build the diving zones in these
 * areas" (7 circles on the travel map); "for the bigger zones add ship wreck"; "make each spot different".
 *
 * Pure data and a few pure helpers (no three.js, no DOM; tests/water-dive.cjs). Each zone is ONE row of DIVE_SPOTS: where it floats
 * on the island sea (centre, base radius and blob seed of the lighter patch, the buoy), its THEME (layout, depth profile, water tint,
 * plants, signature creature or landmark, an optional wreck), its finds (room-local positions) and its football lines. Every zone is
 * built from the same kit (lib/graphics/diveRoom.ts) with these parameters, and only the zone you dive into is built (disposed on
 * surfacing), so the cost does not grow with the number of zones.
 *
 * Labels follow AGENTS.md: a **Real football fact** carries a plain-text credit (no links in kid UI), a *Coaching idea* is a
 * metaphor, and *Island story* is the game's own fiction.
 */

/** Room-local frame: x right, z toward the camera at the start, y up; the reef shelf's sand is around y 0, the surface at DIVE_SURFACE_Y. */
export const DIVE_SURFACE_Y=8.4;
/** How far the room reaches (m): the diver stays inside DIVE_ROOM_R; the rock ring and the fog wall sit beyond it. (15 before Oct 20.) */
export const DIVE_ROOM_R=24;
/** The diver keeps at least this much water under them and this much over their head (m). */
export const DIVE_FLOOR_GAP=.7,DIVE_CEILING_GAP=.9;
/** The ocean shader holds this many patch slots: the runtime writes the NEAREST zones into them on its 10 Hz tick, so the per-pixel
 *  cost stays two compares however many zones there are. */
export const DIVE_SLOTS=2;
/** The blob's widest reach over its base radius (the patch test's quick reject and the shader's). */
export const DIVE_BLOB_MAX=1.42;
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
 credit?:string;story?:string;
 /** Coins, once ever, through the Training meter (`dive:` wallet runs, lib/town/dailyMeter.ts). Never more than a hidden ball. */
 coins?:number;
};
/** The two depth levels: the seabed's profile. `deep` m below the shelf; the drop's shape and where it starts (room z). */
export type DiveFloorShape={kind:'wall'|'terrace'|'canyon'|'bowl';edge:number;deep:number;seed:number};
export type DiveSignature='garden'|'goal'|'kelp'|'rays'|'arch'|'crates'|'turtles';
export type DiveWreck={style:'galleon'|'trawler'|'cargo';x:number;z:number;yaw:number;
 /** The cargo it lost (the futbol tie-in, the relic find inside the hull). */
 cargo:'trophy'|'kitbag'|'balls'};
export type DiveTheme={
 /** Unique per zone (tests). */
 id:string;
 /** The fog / background colour and the fog's start and end (m). */
 water:string;fog:[number,number];
 sand:[string,string];rock:[string,string];
 coral:readonly string[];fan:readonly string[];anemone:readonly string[];kelp:readonly string[];
 /** The hemisphere light: sky colour, ground colour, intensity. */
 light:[string,string,number];
 /** How much of each plant kind (× the capped base counts in diveRoom.ts; ≤ 1.3 so the caps hold). */
 mix:{coral:number;fans:number;anemones:number;kelp:number;grass:number};
 /** The fish schools (diveRoom.ts SCHOOLS keys), the signature landmark / creature, an optional wreck. */
 fish:readonly string[];signature:DiveSignature;wreck?:DiveWreck;
 /** The short line shown on arrival with the zone's name. */
 tagline:string;
};
export type DiveSpot={
 id:string;name:string;
 /** Island position of the patch centre (the buoy floats here), its base radius (m) and the blob's seed (its outline). */
 x:number;z:number;radius:number;blob:number;
 tint:string;
 /** Which circle of the travel map it answers (1-7) and a nearby fishing spot for the clearance test. */
 area:number;near:string;
 surface:{x:number;z:number};
 theme:DiveTheme;floor:DiveFloorShape;
 finds:readonly DiveFind[];
 lesson:string;story:string;
};

const sm=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
/** The patch outline: the base radius bent by three seeded sines (a blob, never a circle). Same formula in the ocean shader. */
export function diveBlobParams(seed:number):[number,number,number,number]{
 const f=(k:number)=>{const s=Math.sin(seed*12.9898+k*78.233)*43758.5453;return s-Math.floor(s);};
 return [.12+.1*f(1),.07+.07*f(2),.03+.04*f(3),f(4)*6.2832];
}
export function diveBlobR(s:Pick<DiveSpot,'radius'|'blob'>,angle:number){
 const [a2,a3,a5,p]=diveBlobParams(s.blob);
 return s.radius*(1+a2*Math.sin(2*angle+p)+a3*Math.sin(3*angle+1.7*p+1)+a5*Math.sin(5*angle+2.3*p+2));
}
/** Inside the zone's blob (island x, z)? */
export function inDiveBlob(s:Pick<DiveSpot,'x'|'z'|'radius'|'blob'>,x:number,z:number){
 const dx=x-s.x,dz=z-s.z,d2=dx*dx+dz*dz,rm=s.radius*DIVE_BLOB_MAX;if(d2>rm*rm)return false;
 return Math.sqrt(d2)<=diveBlobR(s,Math.atan2(dz,dx));
}

/** How deep (0 shelf .. 1 deep level) the floor is at a room point. */
export function diveDeepMask(x:number,z:number,f:DiveFloorShape){
 if(f.kind==='wall')return sm(f.edge+1.6,f.edge-1.6,z);
 if(f.kind==='terrace')return .5*sm(f.edge+1,f.edge-1,z)+.5*sm(f.edge-8,f.edge-10,z);
 if(f.kind==='canyon'){const c=f.edge-7+2.5*Math.sin(x*.18+f.seed);return sm(6.5,3.2,Math.abs(z-c));}
 const d=Math.hypot(x*.85,z-(f.edge-9));return sm(11,7.5,d);// bowl
}
/** 0 = the reef shelf, 1 = the deep level. */
export const diveLevelAt=(x:number,z:number,f:DiveFloorShape)=>diveDeepMask(x,z,f)>.5?1:0;
/** The sand's height in the room (m, room-local): the shelf's gentle mounds and ripples, the drop to the deep level, the rim wall.
 *  Shared by the room builder (the seabed mesh) and the swim step (the diver's floor), so both always agree. */
export function diveFloor(x:number,z:number,f:DiveFloorShape=DEFAULT_FLOOR){
 const r=Math.hypot(x,z),s=f.seed;
 return .35*Math.sin(x*.21+1.3+s)*Math.cos(z*.17-.4+s*.7)+.8*Math.exp(-((x-7)**2+(z-6)**2)/30)+.6*Math.exp(-((x+8)**2+(z-3)**2)/22)
  -f.deep*diveDeepMask(x,z,f)+3.6*Math.max(0,(r-DIVE_ROOM_R+3)/6)**2;
}
/** The diver's height range at a room point: over the sand there (each level has its own floor) and under the surface. */
export function diveDepthRange(x:number,z:number,f:DiveFloorShape,out:{min:number;max:number}={min:0,max:0}){
 out.min=diveFloor(x,z,f)+DIVE_FLOOR_GAP;out.max=DIVE_SURFACE_Y-DIVE_CEILING_GAP;return out;
}
/** A find's 3D room point (its y measured over the sand at its x, z). */
export function diveFindPoint(fd:Pick<DiveFind,'x'|'y'|'z'>,out:{x:number;y:number;z:number}={x:0,y:0,z:0},f:DiveFloorShape=DEFAULT_FLOOR){out.x=fd.x;out.y=diveFloor(fd.x,fd.z,f)+fd.y;out.z=fd.z;return out;}
/** The ripple lines on the sand (paint only), 0..1. */
export const diveRipple=(x:number,z:number)=>.5+.5*Math.sin(x*2.1+Math.sin(z*.6)*1.8+z*.5);
const DEFAULT_FLOOR:DiveFloorShape={kind:'wall',edge:2,deep:6,seed:0};

// ---- The palettes (island colours, never neon) and the themes.
const CORAL_WARM=['#ff7a6b','#ff9f5a','#f2c14e','#e86a9a','#b88be0','#ff5a7a','#ffb4a2','#4fc7b0'];
const BASE={sand:['#c9b48a','#ead9b0'] as [string,string],rock:['#6f7a78','#94a09a'] as [string,string],
 fan:['#c4407a','#8f5bd6','#e8604c','#f29a3a'],anemone:['#f6d36b','#ff9fb4','#9de0c8','#ffb36b'],kelp:['#3f8f4a','#5aa652','#7aa83a']};
const find=(id:string,kind:DiveFindKind,x:number,y:number,z:number,o:Omit<DiveFind,'id'|'kind'|'x'|'y'|'z'>):DiveFind=>({id,kind,x,y,z,...o});
const burst=(x:number,z:number,title:string,text:string)=>find('coral','burst',x,1.1,z,{prompt:'Touch',aria:'Touch the coral',title,label:'Coaching idea',text});
const clam=(x:number,z:number,title:string,text:string)=>find('clam','clam',x,.55,z,{prompt:'Open',aria:'Open the giant clam',title,label:'Coaching idea',text});
const coin=(x:number,z:number,title:string,text:string)=>find('treasure','treasure',x,.5,z,{prompt:'Take',aria:'Take the old matchday coin',title,label:'Island story',coins:3,text,story:'Island story. Put into your coins once, on the Training meter.'});

/**
 * The seven zones (Oct 20 2026, the user's circles on the travel map, converted with IslandTravelMap's projection and checked
 * clear of land, fishing floats / stands and the zipline: tests/water-dive.cjs). The three biggest (base radius 19) carry wrecks.
 */
export const DIVE_SPOTS:readonly DiveSpot[]=[
 {id:'captains-cup',name:'Captain’s Cup Wreck',area:1,x:342,z:-282,radius:19,blob:11,tint:'#63e6d4',near:'causeway-channel',surface:{x:342,z:-279},
  floor:{kind:'wall',edge:2,deep:6.5,seed:.4},
  theme:{id:'coral-garden-galleon',water:'#2a8a9c',fog:[12,40],...BASE,coral:CORAL_WARM,light:['#c8f6ff','#e6d2a6',2.9],
   mix:{coral:.75,fans:1,anemones:1,kelp:.5,grass:.6},fish:['anchovy','blue-tang','yellow-tang','snapper','anthias','trevally','grouper'],signature:'garden',
   wreck:{style:'galleon',x:-2,z:-12,yaw:.5,cargo:'trophy'},tagline:'A coral garden and an old sailing ship down the drop.'},
  lesson:'Never give up on a lost cause: a lost trophy was found by a dog called Pickles.',
  story:'Island story: the old ship carried the island’s first cup. It sank in a storm, and the coral grew all over it.',
  finds:[
   find('relic','relic',-1,1,-12.5,{prompt:'Look',aria:'Look at the cup in the old ship',title:'The lost cup',label:'Real football fact',
    text:'In 1966 the World Cup trophy was stolen in London. A dog called Pickles sniffed it out under a hedge a week later!',credit:'Wikipedia, “Pickles (dog)”',
    story:'Island story: this cup is the island’s own, lost with the old ship. Keep looking, like Pickles did.'}),
   burst(8,6,'Everyone moves together','The whole shoal darts out at once. When your team loses the ball, press together straight away.'),
   clam(-8,8,'Wait for your moment','A clam only opens when the water is calm. A good striker waits for the right moment too, then strikes.'),
   coin(6,-15,'A captain’s coin','A coin from the old ship’s captain, who tossed it before every match.'),
  ]},
 {id:'pauls-grotto',name:'Paul’s Grotto',area:2,x:594,z:-289,radius:12.5,blob:23,tint:'#5fe3d6',near:'coral-garden',surface:{x:594,z:-286.5},
  floor:{kind:'terrace',edge:4,deep:5,seed:1.3},
  theme:{id:'sunken-pitch',water:'#2b8fa6',fog:[11,36],...BASE,sand:['#d4c095','#f0e2bc'],coral:['#ff9f5a','#f2c14e','#4fc7b0','#ffb4a2','#e86a9a'],light:['#d2f8ff','#efdcae',3],
   mix:{coral:.6,fans:.7,anemones:1.2,kelp:.3,grass:.4},fish:['anthias','yellow-tang','bigeye','octopus','parrotfish'],signature:'goal',
   tagline:'An old pitch on the sand, with a goal and an octopus.'},
  lesson:'Reading the game: good players guess what happens next from what they see. Paul’s 8 out of 8 was luck; reading the game is skill.',
  story:'An octopus lives under the old goal and likes to tip over the two flag boxes, the way Paul did. Nobody knows who left the goal here.',
  finds:[
   find('relic','relic',-1.2,1.3,-1,{prompt:'Look',aria:'Look at the old sunken goal',title:'The sunken goal',label:'Real football fact',
    text:'At the 2010 World Cup, Paul the Octopus from Sea Life Oberhausen picked the winner of all seven Germany matches and the final: 8 out of 8!',
    credit:'Wikipedia, “Paul the Octopus”',story:'Island story: the octopus under this goal tips over the flag boxes too. A good guess is luck; reading the game is a skill you can practise.'}),
   burst(9,4,'Close the space','The little fish shut every gap at once. Defenders do that too: step up together and the space is gone.'),
   clam(-9,6,'Patience on the ball','A clam opens slowly. Keep the ball calmly and wait for a gap to open.'),
   coin(4,-10,'An old matchday coin','A coin from the island’s very first beach match, lost overboard on the boat home.'),
  ]},
 {id:'kelp-trawler',name:'Kelp Forest Wreck',area:3,x:812,z:-255,radius:19,blob:37,tint:'#6fe0c0',near:'sharks-beach',surface:{x:812,z:-252},
  floor:{kind:'canyon',edge:0,deep:7,seed:2.1},
  theme:{id:'kelp-forest-trawler',water:'#1f7f86',fog:[9,34],...BASE,sand:['#b9a87e','#d9c99f'],rock:['#5d6a63','#7f8d84'],coral:['#f29a3a','#e8604c','#f2c14e','#9de0c8'],
   kelp:['#4f8f3a','#6aa543','#8bb04a','#3f7f3a'],light:['#c8f0dc','#c9c49a',2.7],
   mix:{coral:.45,fans:.5,anemones:.7,kelp:1.3,grass:.5},fish:['anchovy','snapper','trevally','bigeye','seahorse'],signature:'kelp',
   wreck:{style:'trawler',x:2,z:-7,yaw:1.57,cargo:'kitbag'},tagline:'Tall kelp on the shelf, a fishing boat in the canyon.'},
  lesson:'Stay in your lane: a kelp forest only works because every plant keeps its own space. So does a good team shape.',
  story:'Island story: the old trawler was taking the team’s kit to an away match when it ran onto the rocks.',
  finds:[
   find('relic','relic',3,1,-7,{prompt:'Look',aria:'Look at the kit bag in the boat',title:'The away kit',label:'Coaching idea',
    text:'Away teams bring a second kit so both teams look different. The referee and your teammates must see who is who in a flash.'}),
   burst(-9,7,'Spread out','The fish fan out to fill the water. In attack, spread wide and make the pitch big.'),
   clam(9,9,'Shield the ball','The clam keeps its pearl safe behind its shell. Keep your body between the ball and the defender.'),
   coin(-6,-16,'A lucky net float','A float from the trawler’s nets. The crew said it brought them a goal every Saturday.'),
  ]},
 {id:'ray-meadow',name:'Ray Meadow',area:4,x:733,z:-72,radius:12.5,blob:41,tint:'#7ee8c8',near:'farm-beach',surface:{x:733,z:-69.5},
  floor:{kind:'bowl',edge:0,deep:4.5,seed:3.3},
  theme:{id:'seagrass-rays',water:'#3299a0',fog:[12,42],...BASE,sand:['#d8c79a','#f4e8c4'],coral:['#ffb4a2','#f2c14e','#b88be0'],kelp:['#5aa652','#7aa83a','#8fbf5a'],
   light:['#d9fbff','#f2e2b6',3.1],mix:{coral:.35,fans:.4,anemones:.5,kelp:.2,grass:1.3},fish:['yellow-tang','anthias','ray','eagle-ray','ray-small'],signature:'rays',
   tagline:'A sandy seagrass meadow where the rays glide.'},
  lesson:'Glide into space: rays never rush, they glide to where the space is. Move into space before the pass comes.',
  story:'Island story: the rays here like to follow the shadow of the ferry, the way a winger follows the ball.',
  finds:[
   find('relic','relic',0,.4,-9,{prompt:'Look',aria:'Look at the referee’s whistle in the sand',title:'The referee’s whistle',label:'Coaching idea',
    text:'Play to the whistle: keep going until the referee blows it, then stop at once. Good players always listen for it.'}),
   burst(-8,6,'First touch','The fish turn at the same instant. A clean first touch turns you away from trouble just as fast.'),
   clam(8,7,'Wait for your moment','A clam only opens when the water is calm. A striker waits for the right moment too.'),
   coin(5,-14,'A ferry token','A ticket token dropped from the ferry by a fan on the way to a match.'),
  ]},
 {id:'moon-arch',name:'Moon Arch',area:5,x:835,z:-14,radius:13,blob:53,tint:'#8fdcf0',near:'summit-palm',surface:{x:835,z:-11.5},
  floor:{kind:'canyon',edge:3,deep:6,seed:4.7},
  theme:{id:'rock-arch-jellies',water:'#2a6f98',fog:[9,34],...BASE,sand:['#b7ab8f','#d6cbb0'],rock:['#6a6f82','#9096a8'],coral:['#b88be0','#8f5bd6','#9de0c8','#ffb4a2'],
   fan:['#8f5bd6','#6f7bd8','#c4407a'],anemone:['#c8b8ff','#9de0c8','#ffb4d0'],light:['#c8dcff','#c8c0d8',2.6],
   mix:{coral:.6,fans:1.2,anemones:1,kelp:.3,grass:.3},fish:['blue-tang','bigeye','jelly','anthias'],signature:'arch',
   tagline:'A rock arch to swim through, and soft glowing moon jellies.'},
  lesson:'Through the gap: a pass through a gap between two defenders is like swimming through the arch. Look for the gap.',
  story:'Island story: the jellies glow a little brighter when someone swims through the arch, like a crowd cheering a nutmeg.',
  finds:[
   find('relic','relic',0,.6,-4,{prompt:'Look',aria:'Look at the old boot under the arch',title:'The arch boot',label:'Coaching idea',
    text:'A football boot has studs to grip the grass. Short studs for hard ground, longer ones for soft, muddy pitches.'}),
   burst(-9,8,'Everyone moves together','The shoal darts out at once. Press together when your team loses the ball.'),
   clam(9,8,'Calm under pressure','The clam stays shut until it is safe. Stay calm with the ball, even with players around you.'),
   coin(-7,-12,'A glowing pebble','A smooth pebble the jellies light up. Island kids rub it before a penalty.'),
  ]},
 {id:'ball-crate',name:'Ball Crate Reef',area:6,x:349,z:222,radius:19,blob:67,tint:'#68e2dc',near:'deep-sea-boat-west',surface:{x:349,z:225},
  floor:{kind:'wall',edge:-2,deep:8,seed:5.9},
  theme:{id:'ball-crate-cargo',water:'#23809e',fog:[11,40],...BASE,coral:['#ff7a6b','#f2c14e','#4fc7b0','#ff9f5a','#e86a9a','#ffffff'],light:['#c8f2ff','#e2d6b0',2.8],
   mix:{coral:.9,fans:.8,anemones:.9,kelp:.4,grass:.5},fish:['anchovy','yellow-tang','snapper','trevally','grouper','eel'],signature:'crates',
   wreck:{style:'cargo',x:3,z:-14,yaw:-.35,cargo:'balls'},tagline:'Crates of footballs spilled from a cargo ship, now a reef.'},
  lesson:'Two balls, one final: the first World Cup final used a different ball in each half.',
  story:'Island story: the cargo ship was bringing new balls for the island league. The crates broke open and coral grew on every ball.',
  finds:[
   find('relic','relic',2,1,-13,{prompt:'Look',aria:'Look at the match ball in the crate',title:'The two-ball final',label:'Real football fact',
    text:'At the first World Cup final in 1930, Argentina and Uruguay each wanted their own ball, so they used one in each half!',credit:'Wikipedia, “1930 FIFA World Cup final”',
    story:'Island story: these crates held the island league’s new balls.'}),
   burst(-9,6,'Close the space','The fish shut every gap at once. Step up together and the space is gone.'),
   clam(9,8,'Patience on the ball','A clam opens slowly. Keep the ball and wait for a gap.'),
   coin(-8,-16,'A shipping tag','A brass tag from a ball crate: “Island League, handle with care”.'),
  ]},
 {id:'turtle-pool',name:'Turtle Pool',area:7,x:812,z:204,radius:12.5,blob:79,tint:'#7fe6d8',near:'summit-ledge',surface:{x:812,z:206.5},
  floor:{kind:'bowl',edge:2,deep:5.5,seed:7.1},
  theme:{id:'sea-turtle-pool',water:'#2b93a2',fog:[11,38],...BASE,sand:['#e0d0a6','#f6ecc8'],coral:['#4fc7b0','#9de0c8','#f2c14e','#ff9f5a'],light:['#d2fbff','#f0e0b0',3.1],
   mix:{coral:.7,fans:.6,anemones:.8,kelp:.4,grass:.9},fish:['turtle','yellow-tang','anthias','parrotfish'],signature:'turtles',
   tagline:'A calm sandy pool where sea turtles swim laps.'},
  lesson:'Pace yourself: turtles swim far by never rushing. Save your energy for when the game needs it.',
  story:'Island story: the turtles here swim laps of the pool every morning, like a team’s warm-up.',
  finds:[
   find('relic','relic',0,.5,-7,{prompt:'Look',aria:'Look at the captain’s armband on the sand',title:'The captain’s armband',label:'Coaching idea',
    text:'The captain wears an armband. A good captain talks to the team, stays calm and helps everyone play together.'}),
   burst(-8,6,'Everyone moves together','The shoal darts out at once. Press together when your team loses the ball.'),
   clam(8,7,'Wait for your moment','A clam opens when the water is calm. Wait for the right moment, then strike.'),
   coin(6,-13,'A turtle-shell token','A token a fan made after watching the turtles: “slow and steady wins the league”.'),
  ]},
];

export const diveSpotById=(id:string)=>DIVE_SPOTS.find(s=>s.id===id);
/** The zone whose blob (x, z) is inside, or null: what the 10 Hz prompt test asks (a distance reject, then one atan for a near zone). */
export function diveSpotAt(x:number,z:number,spots:readonly DiveSpot[]=DIVE_SPOTS):DiveSpot|null{
 for(const s of spots)if(inDiveBlob(s,x,z))return s;return null;
}
/** The zones nearest (x, z), nearest first (the shader's DIVE_SLOTS); no allocation: fills `out`. */
export function nearestDiveSpots(x:number,z:number,out:DiveSpot[],spots:readonly DiveSpot[]=DIVE_SPOTS,n=DIVE_SLOTS){
 out.length=0;for(const s of spots){const d=(s.x-x)**2+(s.z-z)**2;let i=out.length;while(i>0&&(out[i-1].x-x)**2+(out[i-1].z-z)**2>d)i--;if(i<n){out.splice(i,0,s);if(out.length>n)out.length=n;}}
 return out;
}
