import type {NpcDefinition} from './npcDialogues';
import type {IslandNewsFeed} from './islandNews';
import {NEWS_LEAGUES,type NewsLeague} from './newsLeagues';
import {latestMatchStories,recentMatchStories} from './matchStory';
import {STADIUM,STADIUM_GATE,STADIUM_PLAZA,PARK_TRAILS,pathPoints,ringPoints,type P} from './westParkLayout';
import {SCREEN,STANDS,ROW_DEPTH,CONCOURSE_HEIGHT,rowHeight,standWorld,standYaw,standBack,stairEnd,type StandDef} from './stadiumSeats';
import {STADIUM_PITCH_Y} from './venues';

/**
 * DRIP FC Stadium islanders (Nov 13 2026, owner: "add more NPCs around the stadium ... every NPC must be tied to a football
 * concept"; then "a camera crew section" and "pitch-side photographers"). Built like lib/town/coralCayNpcs.ts: pushed into
 * NPC_DIALOGUES, so the shared townsfolk runtime (lib/graphics/islandNpcs.ts) draws, poses, culls and talks to them.
 *
 *  - Ground walkers follow STADIUM_NPC_ROUTES: authored waypoints on the plaza, the apron, the ring path and the park trails
 *    (tests/stadium-npcs.cjs checks every leg is on paving, off the pitch and clear of props).
 *  - Fans on the concourse, in the stand aisles, the gantry crew and the photographers stand at fixed spots on a `floor`
 *    (exact height, no wander, no snap to the ground). Aisle fans stand on an aisle tread, never in a seat, so they never take a
 *    seat a real player (or a friend's cleared seat, stadiumCrowd CLEAR_FRIENDS) could use.
 *  - Heat: `heatRank` orders them; stadiumNpcBudget(phone, tier) is how many show (desktop 20, phone 12 ... saver 3). The runtime
 *    treats the rest like thinned ambient townsfolk (not drawn, routined or talkable). Beyond the usual draw range (96 m desktop,
 *    72 m phone, tier 3's own limit) none is drawn, and off screen they step at 10 Hz like every islander.
 *  - Score fans reuse the island's match desks (matchStory, lib/town/newsClient.ts): the latest verified scores load only when a
 *    player opens the chat, through the same cached /api/island-news request every desk shares. Their bubbles peek at that cache
 *    (scoreFanBubble) and never fetch; with no cached data they say a fixed line, never a made-up score.
 *
 * Facts (kid-friendly, checked Nov 13 2026):
 *  - IFAB Laws of the Game, https://www.theifab.com/laws/latest/ : Law 1 (halfway line, centre circle 9.15 m, penalty area
 *    16.5 m, penalty mark 11 m, goal area 5.5 m, the penalty arc; the technical area), Law 11 (offside: in the opponents' half,
 *    nearer the goal line than the ball and the second-last opponent; only an offence when involved in play; no offside from a
 *    goal kick, throw-in or corner), Law 13 (opponents 9.15 m from a free kick; attackers at least 1 m from a wall of three or
 *    more defenders since 2019), Law 17 (opponents 9.15 m from a corner).
 *  - Wembley Stadium: 90,000 seats, its arch is 133 m high. https://en.wikipedia.org/wiki/Wembley_Stadium
 *  - Maracanã, 1950 World Cup deciding match: a crowd of nearly 200,000. https://en.wikipedia.org/wiki/Maracan%C3%A3_Stadium
 *  - Broadcast and photo work (main wide camera on the halfway line, cameras behind the goals, the director choosing the live
 *    shot, replays; long lenses, fast shutter speeds, photographers' bibs, no flash pitch-side, pictures sent during the match)
 *    are described in general terms, as working practice, not rules.
 * Coaching tips (pressing, width, switching play, keeper angles, calling) are phrased as advice, not rules.
 */
export type StadiumNpcGroup='mascot'|'bench'|'official'|'viewer'|'greeter'|'guide'|'walker'|'fan'|'score'|'coach'|'crew'|'photographer';
export type StadiumNpcInfo={group:StadiumNpcGroup;place:string;concept:string};
export type RoutePoint={x:number;z:number;pause?:number};

const S=STADIUM,G=STADIUM_GATE;
const stand=(id:string)=>STANDS.find(s=>s.id===id) as StandDef;
const EAST=stand('east'),WEST=stand('west'),NORTH=stand('north'),SOUTH=stand('south');
/** An aisle tread: the back half of row `row` in the aisle centred at `along` (never a seat). */
const aisle=(s:StandDef,along:number,row:number)=>({...standWorld(s,s.inner+row*ROW_DEPTH+ROW_DEPTH*.75,along),floor:rowHeight(row),yaw:standYaw(s)});
/** A spot on a stand's concourse (behind the top row), `depth` m out from its front edge. */
const concourse=(s:StandDef,along:number,depth=2)=>({...standWorld(s,standBack(s)-4+depth,along),floor:CONCOURSE_HEIGHT,yaw:standYaw(s)});

// ---- Broadcast gantry (the west concourse at the halfway line, facing the gate side) and the photographers' spots --------------
/** The gantry deck on the west concourse, centred on the halfway line (stand-local depth d0..d1, along a0..a1). */
export const GANTRY={stand:'west' as const,d0:standBack(WEST)-2.2,d1:standBack(WEST)-.15,a0:-4.2,a1:4.2,deck:.06,deskD:standBack(WEST)-2.05,deskW:2.8,deskDepth:.6,deskH:.9};
export const GANTRY_FLOOR=CONCOURSE_HEIGHT+GANTRY.deck;
/** Two broadcast cameras on tripods at the deck's ends; the head pans (lib/graphics/stadiumMedia.ts). */
export const GANTRY_CAMERAS=[-3.2,3.2].map(along=>({...standWorld(WEST,GANTRY.d0+.45,along),y:GANTRY_FLOOR+1.45,along}));
/** Pitch-side photographers: behind each goal line (beside the goal, outside the goal area) and along the west touchline. */
export const PHOTO_SPOTS=[
 {id:'stadium-photo-joon',x:S.x+9.5,z:S.z+S.pitchL/2+1.9,yaw:Math.PI},
 {id:'stadium-photo-esme',x:S.x-9.5,z:S.z-S.pitchL/2-1.9,yaw:0},
 {id:'stadium-photo-rafael',x:S.x+S.pitchW/2+1.9,z:S.z+16,yaw:-Math.PI/2},
] as const;
/** The lens tip (world) of a sitting photographer's long lens: where the shutter glint shows. */
export const photoLens=(p:{x:number;z:number;yaw:number})=>({x:p.x+Math.sin(p.yaw)*.95,y:STADIUM_PITCH_Y+.78,z:p.z+Math.cos(p.yaw)*.95});

// ---- The benches side (the west touchline, under the gantry): two dugouts against the stand front, behind the boards, and a
// painted technical area for each team between the touchline and the boards (IFAB Law 1: it reaches to 1 m from the touchline).
const HW=S.pitchW/2;
/** Stand-free strip on the west side: boards at x local -35.5, row 0 at -40. Dugouts sit against the stand front at z local ±20 (17..23: clear of the west aisles at ±13 and ±39 and the walk-up lanes). */
export const DUGOUTS=[-1,1].map(side=>({x:S.x-39.15,z:S.z+side*20,w:1.5,d:6,side}));
export const TECH_AREAS=[-1,1].map(side=>({x0:S.x-35.1,x1:S.x-HW-1,z0:S.z+side*16.5,z1:S.z+side*23.5,side}));
/** Shared, live: the stadium match's ball (world), written once a frame by lib/graphics/stadiumMedia.ts, read by the assistant
 *  referees' x-follow (lib/graphics/islandNpcs.ts). live false = no match: they walk back to their mark. */
export const STADIUM_BALL:{x:number;z:number;live:boolean}={x:S.x,z:S.z,live:false};
/** Assistant referees: each runs its own half of one touchline (z clamp), 1 m outside the line, side-stepping with the ball. */
export const AR_TRACKS:Record<string,{min:number;max:number}>={
 'stadium-ref-amara':{min:S.z-S.pitchL/2+2,max:S.z-1},
 'stadium-ref-oskar':{min:TECH_AREAS[1].z1+2,max:S.z+S.pitchL/2-2},
};
/** The mascot's lap: behind the advertising boards, in front of the stands (clear of the boards, the dugouts and the photographers). */
const MASCOT_X=37.3,MASCOT_Z=55.8;

// ---- Routes ----------------------------------------------------------------------------------------------------------------------
const loop=(pts:readonly P[],minGap:number):RoutePoint[]=>{const out:RoutePoint[]=[];for(const [x,z] of pts){const last=out[out.length-1];if(!last||Math.hypot(x-last.x,z-last.z)>=minGap)out.push({x,z});}return out;};
const there=(pts:RoutePoint[])=>[...pts,...pts.slice(1,-1).reverse().map(p=>({...p}))];
const trail=(id:string)=>PARK_TRAILS.find(t=>t.id===id)!.curve;
const pcz=(STADIUM_PLAZA.minZ+STADIUM_PLAZA.maxZ)/2;
/** Authored waypoints (pause = seconds standing there). y comes from the ground at runtime. */
export const STADIUM_NPC_ROUTES:Record<string,RoutePoint[]>={
 // Greeters pace a few steps either side of the gate mouth, pausing to welcome people.
 'stadium-greeter-anouk':[{x:G.x+3.2,z:G.z-4.6,pause:7},{x:G.x+5.2,z:G.z-5.6,pause:3}],
 'stadium-greeter-tomasz':[{x:G.x+3.2,z:G.z+4.6,pause:6},{x:G.x+5.2,z:G.z+5.6,pause:4}],
 // The plaza guide walks a long loop of the plaza, stopping at the gate end and the east end.
 'stadium-guide-omari':[{x:-128,z:pcz-9,pause:5},{x:-90,z:pcz-9},{x:-62,z:pcz-9,pause:4},{x:-62,z:pcz+9},{x:-90,z:pcz+9},{x:-128,z:pcz+9,pause:4}],
 // The safety guide walks the whole ring path round the bowl.
 'stadium-guide-beatrix':loop(ringPoints(),9).map((p,i)=>i%6===0?{...p,pause:3}:p),
 // The park walker goes from the plaza down the south-east trail to the pond walk and back.
 'stadium-walker-kwesi':there([...loop(pathPoints(trail('south-east'),40).slice(0,29),6),...loop(pathPoints(trail('pond'),12),5).slice(1)]).map((p,i,a)=>i===0||i===Math.floor(a.length/2)?{...p,pause:5}:p),
 // The stair kid hops between the foot of the east stand's north stair and the apron beside it.
 'stadium-fan-leon':[{x:S.x+stairEnd(EAST)+1.6,z:S.z+31,pause:6},{x:S.x+stairEnd(EAST)+3.2,z:S.z+28.5,pause:4}],
 // A score fan waits at the foot of the north stand's west stair.
 'stadium-score-ren':[{x:S.x-12,z:S.z-stairEnd(NORTH)-1.8,pause:8},{x:S.x-9.5,z:S.z-stairEnd(NORTH)-3,pause:5}],
 // The stadium guide paces under the big screen's back face, behind the south stand.
 // The Drip mascot laps the pitch-side ring behind the boards, pausing at the middle of each side to wave at the stands.
 'stadium-mascot-drip':(()=>{const out:RoutePoint[]=[];const c=[[MASCOT_X,MASCOT_Z],[-MASCOT_X,MASCOT_Z],[-MASCOT_X,-MASCOT_Z],[MASCOT_X,-MASCOT_Z]];
  for(let i=0;i<4;i++){const [ax,az]=c[i],[bx,bz]=c[(i+1)%4],len=Math.hypot(bx-ax,bz-az),k=Math.ceil(len/12);for(let j=0;j<k;j++)out.push({x:S.x+ax+(bx-ax)*j/k,z:S.z+az+(bz-az)*j/k,pause:j===Math.floor(k/2)?4:undefined});}
  return out;})(),
 'stadium-guide-iris':[{x:S.x-10.5,z:S.z+standBack(SOUTH)+4.2,pause:7},{x:S.x-8,z:S.z+standBack(SOUTH)+7,pause:7}],
 // Public viewing: Santi, Ingeborg and the watch-party crowd stand facing the big screen's back face (one waypoint: they stay put).
 'stadium-viewer-sol':[{x:S.x-1.6,z:S.z+SCREEN.z+.3+5.4}],
 'stadium-viewer-ingeborg':[{x:S.x+3.2,z:S.z+SCREEN.z+.3+7.6}],
};
/** The watch-party crowd's spots (dx, dz from the screen's back face): a loose group between the screen posts and the ring path, 1.8 m+
 *  apart, so the ring path (the walkway) and the gaps between them stay clear. Listed in heat order: the first ones stay on hot tiers. */
const CROWD_SPOTS:readonly (readonly [string,number,number])[]=[['stadium-viewer-kwabena',-4.3,5.0],['stadium-viewer-lumi',1.4,5.1],['stadium-viewer-rangi',-.2,6.9],
 ['stadium-viewer-zawadi',4.6,6.0],['stadium-viewer-arlo',-3.2,7.4],['stadium-viewer-elif',1.7,8.6]];
for(const [id,dx,dz] of CROWD_SPOTS)STADIUM_NPC_ROUTES[id]=[{x:S.x+dx,z:S.z+SCREEN.z+.3+dz}];

// ---- Fixed spots (stands, concourse, gantry, pitch-side) -------------------------------------------------------------------------
const CONC_A=concourse(EAST,-14),CONC_B=concourse(EAST,-46),AISLE_A=aisle(EAST,21,5),AISLE_B=aisle(EAST,-21,3),AISLE_K=aisle(SOUTH,0,2);
const crew=(along:number,depth:number)=>({...standWorld(WEST,depth,along),yaw:standYaw(WEST)});
const CREW_WIDE=crew(-3.2,GANTRY.d0+1.25),CREW_TIGHT=crew(3.2,GANTRY.d0+1.25),COM_A=crew(-.7,GANTRY.deskD+.85),COM_B=crew(.7,GANTRY.deskD+.85);
const fixed=(p:{floor:number})=>()=>p.floor;
const gantry=()=>GANTRY_FLOOR,pitchSide=()=>STADIUM_PITCH_Y;
const start=(id:string)=>STADIUM_NPC_ROUTES[id][0];

/** Score fans: one league each, slot 2 (the island desks use slots 0 and 1, so these tell a different recent match). */
const SCORE_FANS:Record<string,{league:NewsLeague;focus:string}>={
 'stadium-score-devika':{league:'eng.1',focus:'Look at the goal difference too: goals scored minus goals let in.'},
 'stadium-score-lucinda':{league:'esp.1',focus:'Watch how wide the wingers stay. Width stretches the defence.'},
 'stadium-score-ren':{league:'jpn.1',focus:'Look for a long switch of play that found the free side.'},
};
const score=(id:string)=>{const f=SCORE_FANS[id],label=NEWS_LEAGUES[f.league];return {matchStory:true,news:'scores' as const,newsLeague:f.league,newsSlot:2,newsFocus:f.focus,
 newsQuestion:`What is the latest in ${label}?`,newsIntro:`Here is my ${label} match desk. ${f.focus}`};};

export const STADIUM_NPC_INFO:Record<string,StadiumNpcInfo>={
 'stadium-greeter-anouk':{group:'greeter',place:'gate',concept:'fair play and respect for both teams'},
 'stadium-guide-iris':{group:'guide',place:'big screen',concept:'the parts of a stadium'},
 'stadium-mascot-drip':{group:'mascot',place:'pitch-side ring',concept:'what a mascot does on match day'},
 'stadium-score-devika':{group:'score',place:'east concourse',concept:'reading a result: points and goal difference'},
 'stadium-coach-mireille':{group:'coach',place:'east stand aisle',concept:'offside'},
 'stadium-crew-freya':{group:'crew',place:'broadcast gantry',concept:'how the main wide camera follows the ball'},
 'stadium-photo-joon':{group:'photographer',place:'behind the south goal',concept:'why photographers sit behind the goals'},
 'stadium-viewer-sol':{group:'viewer',place:'public viewing by the big screen',concept:'watching on the big screen: public viewing'},
 'stadium-bench-hollis':{group:'bench',place:'technical area (gold)',concept:'the technical area, instructions and encouragement'},
 'stadium-greeter-tomasz':{group:'greeter',place:'gate',concept:'match-day routine: the walk-out and the kick-off'},
 'stadium-crew-callum':{group:'crew',place:'commentary desk',concept:'commentators describe the play'},
 'stadium-ref-wanjiru':{group:'official',place:'between the technical areas',concept:'the fourth official: substitutions, the board and added time'},
 'stadium-guide-omari':{group:'guide',place:'plaza',concept:'pitch markings'},
 'stadium-fan-leon':{group:'fan',place:'east stand stairs',concept:'communication on the pitch'},
 'stadium-coach-gustavo':{group:'coach',place:'south stand aisle',concept:'a goalkeeper\'s angles'},
 'stadium-ref-amara':{group:'official',place:'east touchline (north half)',concept:'the assistant referee\'s flag: offside and throw-ins'},
 'stadium-score-lucinda':{group:'score',place:'east concourse',concept:'width'},
 'stadium-photo-esme':{group:'photographer',place:'behind the north goal',concept:'long lenses and a fast shutter'},
 'stadium-crew-adaeze':{group:'crew',place:'commentary desk',concept:'the director picks the shot, and replays'},
 'stadium-bench-sakura':{group:'bench',place:'technical area (blue)',concept:'formations, changing shape and half-time talks'},
 'stadium-crew-mateus':{group:'crew',place:'broadcast gantry',concept:'close-ups and the cameras behind each goal'},
 'stadium-guide-beatrix':{group:'guide',place:'ring path',concept:'roofs, floodlights, capacity and safety'},
 'stadium-viewer-ingeborg':{group:'viewer',place:'public viewing by the big screen',concept:'explaining the match as it happens'},
 'stadium-coach-nkechi':{group:'coach',place:'east stand aisle',concept:'set pieces'},
 'stadium-ref-oskar':{group:'official',place:'west touchline (south half)',concept:'the referee\'s signals and respecting officials'},
 'stadium-bench-teodor':{group:'bench',place:'technical area (gold)',concept:'substitutions, from the assistant coach'},
 'stadium-bench-yasmin':{group:'bench',place:'technical area (blue)',concept:'encouraging players and giving one clear instruction'},
 'stadium-photo-rafael':{group:'photographer',place:'east touchline',concept:'sending photos during the match, and the bib'},
 'stadium-score-ren':{group:'score',place:'north stand stairs',concept:'switching play'},
 'stadium-walker-kwesi':{group:'walker',place:'park trail',concept:'pressing'},
 // The watch-party crowd (lighter cast: one topic each). Ranks from VIEWING_CROWD_RANK0 follow viewingCrowd(), not the main budget.
 'stadium-viewer-kwabena':{group:'viewer',place:'public viewing by the big screen',concept:'cheering together and clapping both teams'},
 'stadium-viewer-lumi':{group:'viewer',place:'public viewing by the big screen',concept:'a near miss: shots off target and big saves'},
 'stadium-viewer-rangi':{group:'viewer',place:'public viewing by the big screen',concept:'kick-off and half-time'},
 'stadium-viewer-zawadi':{group:'viewer',place:'public viewing by the big screen',concept:'replays and slow motion'},
 'stadium-viewer-arlo':{group:'viewer',place:'public viewing by the big screen',concept:'the score and the match clock on screen'},
 'stadium-viewer-elif':{group:'viewer',place:'public viewing by the big screen',concept:'watching the players without the ball'},
};

/** How many stadium islanders show for this device and heat tier (lib/graphics/heatTier: 0 default … 4 Battery saver). */
export function stadiumNpcBudget(phone:boolean,tier:number){
 if(tier>=4)return 4;if(tier>=3)return 6;if(tier>=2)return phone?9:16;if(tier>=1)return phone?12:24;return phone?16:30;
}
// ---- Public viewing in front of the big screen's back face (the outward face, behind the south stand) ---------------------------
/** The screen's back face (world z) and the viewing patch: on the apron between the screen posts and the ring path, which stays clear. */
export const SCREEN_BACK_Z=S.z+SCREEN.z+.3;
export const VIEWING={x:S.x,z0:SCREEN_BACK_Z+4.6,z1:SCREEN_BACK_Z+9.4,halfW:5.6} as const;
/** The watch-party crowd: real townsfolk rigs (the shared runtime, lib/graphics/islandNpcs.ts) ranked after the main cast. They show
 *  by their own count, viewingCrowd(phone, tier), on top of stadiumNpcBudget: desktop 6 / phone 4 at tier 0 ... none on Battery saver. */
export const VIEWING_CROWD:readonly string[]=CROWD_SPOTS.map(c=>c[0]);
export const VIEWING_CROWD_RANK0=Object.keys(STADIUM_NPC_INFO).indexOf(VIEWING_CROWD[0]);
export function viewingCrowd(phone:boolean,tier:number){if(tier>=4)return 0;if(tier>=3)return phone?1:2;if(tier>=2)return phone?2:4;if(tier>=1)return phone?3:6;return phone?4:6;}
/** Whether a stadium islander of this heatRank shows, given the main budget (stadiumNpcBudget) and the crowd count (viewingCrowd). */
export const stadiumNpcShown=(rank:number,cap:number,crowd:number)=>rank<VIEWING_CROWD_RANK0?rank<cap:rank-VIEWING_CROWD_RANK0<crowd;

type Look={character:'male'|'female';face:'warm'|'deep'|'light';clothing:'classic'|'coast'|'sunset';body?:'balanced'|'strong'|'slim';age?:'kid'|'teen'|'adult'|'elder'};
type Talk=[q:string,a:string,fq:string,fa:string];
function npc(id:string,name:string,role:string,pursuit:string,at:{x:number;z:number},look:Look,persona:string,greeting:string,lines:string[],talks:Talk[],extra:Partial<NpcDefinition>={}):NpcDefinition{
 return {id,name,role,pursuit,x:at.x,z:at.z,...look,persona,greeting,lines,heatRank:Object.keys(STADIUM_NPC_INFO).indexOf(id),
  topics:talks.map(([question,answer,fq,fa],i)=>({id:`${id.replace('stadium-','')}-${i}`,question,answer,followUp:{question:fq,answer:fa}})),...extra};
}

export const STADIUM_NPCS:NpcDefinition[]=[
 // ---- Greeters at the gate
 npc('stadium-greeter-anouk','Anouk','Stadium greeter','WELCOMING FANS',start('stadium-greeter-anouk'),{character:'female',face:'warm',clothing:'sunset'},
  'A cheerful match-day greeter who has welcomed fans at the gate for years.',
  'Welcome to DRIP FC Stadium! Come on in, cheer loud and enjoy the match.',
  ['Hello, and welcome to DRIP FC Stadium! First time here?','Welcome! Head through the gate, the stands are open.','Big smiles at the gate today. Welcome in!'],
  [['How should fans behave at a match?','Cheer for your team, clap good play from both sides and never boo a player for a mistake. Respect makes the stadium fun for everyone.','Why clap the other team?','Because football is better with good opponents. Clapping a great save or a fair tackle is part of fair play.'],
   ['Where can I sit?','Walk through the gate and up into any stand. Find a free seat, sit down and watch the big screen for the score.','Can I sit with my friends?','Yes! Seats next to your friends stay free for them, so you can watch the match together.']]),
 npc('stadium-greeter-tomasz','Tomasz','Stadium greeter','HOLDING THE GATE',start('stadium-greeter-tomasz'),{character:'male',face:'light',clothing:'classic',body:'strong'},
  'A friendly gate greeter who loves the build-up before kick-off.',
  'Welcome to DRIP FC Stadium! You are just in time for the build-up.',
  ['Welcome, welcome! The pitch looks perfect today.','Hello! Have you seen the big screen yet?','Welcome to DRIP FC Stadium! Enjoy the match.'],
  [['What happens before kick-off?','The teams warm up, go back to the dressing rooms, then walk out together. They line up, shake hands, and the captains meet the referee for the coin toss.','What is the coin toss for?','The winning captain chooses which goal to attack in the first half, or to take the kick-off. The other team gets the other choice.'],
   ['How does a match start?','With a kick-off from the centre mark. Every player starts in their own half, and the ball must clearly move before anyone else touches it.','Can you score from a kick-off?','Yes, a goal can be scored straight from a kick-off, against the other team. It almost never happens, but it is allowed.']]),
 // ---- Guides
 npc('stadium-guide-iris','Iris','Stadium guide','UNDER THE BIG SCREEN',start('stadium-guide-iris'),{character:'female',face:'deep',clothing:'coast'},
  'A stadium tour guide who knows the name of every part of a football ground.',
  'Hi! I run the stadium tours. Want to learn what every part of a stadium is called?',
  ['Stands, concourse, dugouts: I can name them all!','The big screen shows the score to every stand.','Every stadium has its own story. Ask me!'],
  [['What are the parts of a stadium?','The stands are where fans sit. The concourse is the walkway behind them. Players walk out of the tunnel, and coaches and substitutes sit in the dugouts.','What is the technical area?','A marked box beside the dugout. The coach may stand there to give instructions, but must stay inside it during play.'],
   ['What are terraces?','Terraces are wide steps where fans stood to watch. Many big stadiums are all-seater now, and some have safe standing areas with a rail for each row.','Which stadiums are famous?','Wembley in London has 90,000 seats and a giant 133 metre arch. At the Maracanã in Brazil, nearly 200,000 people watched the 1950 World Cup decider.']]),
 npc('stadium-guide-omari','Omari','Plaza tour guide','SHOWING THE PLAZA',start('stadium-guide-omari'),{character:'male',face:'deep',clothing:'sunset',body:'slim'},
  'A plaza guide who draws pitch markings in the air while he talks.',
  'Welcome to the Plaza! Before you go in, do you know what all the lines on a pitch mean?',
  ['Every line on a pitch has a job. Ask me!','The halfway line splits the pitch in two.','Nine point one five metres: remember that number!'],
  [['What do the pitch lines mean?','The halfway line splits the pitch in two, and the centre circle around the centre mark has a radius of 9.15 metres. The lines on the edge are touchlines and goal lines.','Why is there a circle in the middle?','At kick-off, the other team must stay outside the centre circle until the ball is in play. It gives the kicking team room to start.'],
   ['What is the big box by the goal?','The penalty area. It stretches 16.5 metres out from the goal line. A foul by the defenders in there can give a penalty, taken from the spot 11 metres out.','And the small box?','The goal area, 5.5 metres out. Goal kicks are taken from anywhere inside it. The curved line on the big box is the penalty arc.']]),
 npc('stadium-guide-beatrix','Beatrix','Stadium safety guide','WALKING THE RING',start('stadium-guide-beatrix'),{character:'female',face:'light',clothing:'coast',age:'elder'},
  'A retired steward who walks the ring path and explains how stadiums keep everyone safe.',
  'Hello! I walk the ring path every day. Want to know why stadiums have roofs and giant lights?',
  ['Floodlights let us play long after sunset.','A good roof keeps fans dry and the noise in.','Know your nearest exit. That is rule one!'],
  [['Why do stadiums have roofs and floodlights?','Roofs keep rain and sun off the fans and hold in the noise. Tall floodlights light the pitch evenly, so teams can play in the evening and on dark winter days.','Why are floodlights so tall?','From high up, the light spreads across the whole pitch with fewer shadows, so players, fans and cameras can see the ball everywhere.'],
   ['How do stadiums keep fans safe?','Every stadium has a capacity: the most people it can hold and still let everyone leave safely. Stewards help, and signs show the way to the exits.','What should I do at a big match?','Stay with your grown-up, keep the stairs and gangways clear, and if you get lost, ask a steward. They are there to help.']]),
 // ---- Walkers and fans
 npc('stadium-walker-kwesi','Kwesi','Park runner','LAPS OF STADIUM PARK',start('stadium-walker-kwesi'),{character:'male',face:'deep',clothing:'classic',body:'slim',age:'teen'},
  'A teenage midfielder who walks the park trails to train for pressing.',
  'Hi! I walk these trails to build my legs. Pressing takes a lot of running!',
  ['Press together, win it back together!','Every lap helps me press for longer.','Ready to press? Me too, after this lap.'],
  [['What is pressing?','Pressing means closing down the player with the ball quickly to win it back. It works best when the whole team presses together, so the passes nearby are covered too.','When should my team press?','A good moment is a bad touch, a back pass or a player facing their own goal. Your coach will often say a signal, like when the ball goes wide.'],
   ['Why walk in the park?','Steady walks and jogs build stamina, so I can keep pressing late in a match. Footballers mix easy running with short sprints.','Do I need to rest too?','Yes! Rest and sleep help your body get stronger. Training is best with drinks of water and good food too.']]),
 npc('stadium-fan-leon','Leon','Young fan','WAITING BY THE STAIRS',start('stadium-fan-leon'),{character:'male',face:'warm',clothing:'sunset',age:'kid'},
  'An eight-year-old fan who practises his loudest football calls by the stand stairs.',
  'Man on! Oh, hi! I am practising my calls for my team on Saturday.',
  ['Man on! Time! Keeper’s! Just practising.','A good shout helps a teammate decide fast.','I have the loudest voice on my team!'],
  [['What do football calls mean?','"Man on" means a player is close behind you. "Time" means you are free, take a touch. "Keeper’s" is the goalkeeper saying they will catch it.','Why are the calls so short?','The ball moves fast, so a call must be quick and clear. One or two words can tell a teammate exactly what to do.'],
   ['How can I talk more on the pitch?','Say your teammate’s name before the call, so they know it is for them. Then give one clear message, like "Jo, turn!"','What about cheering my team?','Do it! "Great pass!" or "Well done!" after a good move helps a team feel brave.']]),
 // ---- Score fans (the island's news pipeline, see the header)
 npc('stadium-score-devika','Devika','Score fan · English Premier League','CHECKING THE SCORES',CONC_A,{character:'female',face:'warm',clothing:'classic'},
  'A super fan on the concourse who keeps up with results from around the world.',
  'Hi! I always check the latest results before the match. Want the newest Premier League score?',
  ['Ask me for the latest Premier League score!','Three points for a win, one for a draw.','A good fan checks the result AND the story.'],
  [['How do league points work?','In most leagues a win gives three points and a draw gives one. The team with the most points at the end of the season wins the league.','What if two teams have the same points?','Many leagues then look at goal difference: goals scored minus goals let in. Some leagues check other things first, like the results between the two teams.']],
  {...score('stadium-score-devika'),floor:fixed(CONC_A),workYaw:CONC_A.yaw}),
 npc('stadium-score-lucinda','Lucinda','Score fan · La Liga','FOLLOWING LA LIGA',CONC_B,{character:'female',face:'deep',clothing:'sunset',age:'elder'},
  'A grandmother who follows La Liga and loves wingers who stay wide.',
  'Hello, dear! I follow La Liga every week. Shall we look at the latest result together?',
  ['Ask me about the latest La Liga match!','Wide wingers make the pitch feel huge.','I love a winger who hugs the touchline.'],
  [['What does playing with width mean?','Width means some players stay near the touchlines. The defence has to spread out to mark them, which opens gaps in the middle.','Who gives a team width?','Usually wingers and full-backs. When one goes forward on the outside, another teammate often covers the space behind.']],
  {...score('stadium-score-lucinda'),floor:fixed(CONC_B),workYaw:CONC_B.yaw}),
 npc('stadium-score-ren','Takumi','Score fan · J1 League','WAITING BY THE NORTH STAIRS',start('stadium-score-ren'),{character:'male',face:'light',clothing:'coast',age:'teen'},
  'A teenager who follows the J1 League and draws passing maps in his notebook.',
  'Hi! I follow the J1 League in Japan. Want to hear the latest result?',
  ['Ask me for the latest J1 League result!','A switch of play finds the free side.','My notebook is full of passing maps.'],
  [['What is switching play?','Moving the ball quickly from one side of the pitch to the other. The defence has crowded one side, so the far side is often free.','How do you switch play?','With one long pass or a few quick short ones across the back. Before you get the ball, look up to see if the far side is free.']],
  score('stadium-score-ren')),
 // ---- Coaches in the stands
 npc('stadium-coach-mireille','Coach Mireille','Youth coach in the stands','WATCHING THE BACK LINE',AISLE_A,{character:'female',face:'light',clothing:'classic',body:'strong'},
  'A youth coach who sits in the stands to watch where the defenders stand.',
  'Hi! I watch the back line from up here. From the stands, offside is much easier to see!',
  ['Watch the last defender, not just the ball.','Time your run with the pass. Not too early!','From up here, you can see the whole shape.'],
  [['What is offside?','You are offside if, when a teammate plays the ball to you, you are in the other team’s half and nearer their goal line than both the ball and the second-last defender.','Is being offside always a foul?','No. It only counts if you then join in the play. And you cannot be offside from a throw-in, a corner or a goal kick.'],
   ['How do strikers stay onside?','They wait level with the last defender, then sprint as the pass is played. Curving the run along the line helps them stay level.','What do defenders do?','They keep a straight line and step up together. That can catch a striker who starts too early.']],
  {floor:fixed(AISLE_A),workYaw:AISLE_A.yaw}),
 npc('stadium-coach-gustavo','Coach Gustavo','Goalkeeper coach in the stands','BEHIND THE GOAL',AISLE_K,{character:'male',face:'warm',clothing:'coast',age:'elder'},
  'A goalkeeper coach who always sits behind the goal to study the keeper.',
  'Hello! I always watch from behind the goal. It is the best place to see a keeper’s angles.',
  ['Small steps make a big goal look small.','Keepers, stay on the line between ball and goal.','Set your feet before the shot comes.'],
  [['What are a keeper’s angles?','Picture a line from the ball to the middle of the goal. A keeper who stands on that line and steps out a little covers more of the goal.','Should the keeper always come out?','Not too far! Step out too far and a striker can chip over you. Good keepers keep adjusting with small steps as the ball moves.'],
   ['Why do keepers shout so much?','From the goal they can see the whole pitch. They tell defenders where to stand and call "Keeper’s!" when they will catch the ball.','What else helps keepers?','Being set, on your toes with knees soft, as the shot comes. Then you can push off quickly either way.']],
  {floor:fixed(AISLE_K),workYaw:AISLE_K.yaw}),
 npc('stadium-coach-nkechi','Coach Nkechi','Set-piece coach in the stands','STUDYING THE CORNERS',AISLE_B,{character:'female',face:'deep',clothing:'coast'},
  'A set-piece coach who keeps a notebook of every corner and free kick she sees.',
  'Hi! I study corners and free kicks. A good set piece is a little plan everyone knows.',
  ['Corners, free kicks, throw-ins: plans!','Nine point one five metres for the wall.','A quick free kick can catch a team napping.'],
  [['What are set pieces?','Restarts from a still ball, like corners, free kicks and throw-ins. Teams practise them, so everyone knows where to run.','How far away must the wall be?','At a free kick, opponents must be 9.15 metres from the ball. And attackers have to stay at least 1 metre from a wall of three or more defenders.'],
   ['How do teams score from corners?','Players start their runs late and attack the space, not the ball. Someone also stays back in case the other team breaks away.','What does the defending team do?','They mark players or guard zones, and attack the ball first. The keeper calls out if they are coming to catch it.']],
  {floor:fixed(AISLE_B),workYaw:AISLE_B.yaw}),
 // ---- The broadcast gantry: two camera operators and two commentators
 npc('stadium-crew-freya','Freya','Main camera operator','FOLLOWING THE BALL',CREW_WIDE,{character:'female',face:'light',clothing:'classic'},
  'The main camera operator on the broadcast gantry, high on the halfway line.',
  'Hi! I run the main camera, high up on the halfway line. My job is to follow the ball all match.',
  ['Wide shot, follow the ball, keep it smooth.','From up here I can see all twenty-two players.','My camera pans with every pass.'],
  [['How is a match filmed?','The main camera sits high on the halfway line and shows a wide picture, so you see the ball and the players around it. Most of the match you watch comes from this one.','Why so high and so central?','From the middle you can see both halves. From high up, the shape of both teams shows, so viewers can follow the tactics.'],
   ['Where does the big screen picture come from?','From cameras like mine! The live picture goes to the director, and the big screen can show the score, the action and the replays.','Do you ever stop filming?','Never while the ball is in play. Even at a throw-in I keep the shot steady and ready.']],
  {floor:gantry,workYaw:CREW_WIDE.yaw}),
 npc('stadium-crew-mateus','Mateus','Close-up camera operator','ZOOMING IN',CREW_TIGHT,{character:'male',face:'warm',clothing:'sunset',body:'strong'},
  'The close-up camera operator who zooms in on players, coaches and celebrations.',
  'Hello! I do the close-ups. When someone scores, I find their face for the celebration.',
  ['Zoom in, find the face, hold the shot.','Big moments need a close-up.','There are cameras behind each goal too.'],
  [['What does a close-up camera do?','It zooms in tight on one person: a player before a free kick, a coach in the technical area or a goal celebration. It shows the feelings of the match.','How many cameras film a big match?','Lots! Big matches use many cameras, including ones behind each goal and low ones along the touchline. Each shows a different view.'],
   ['Why are there cameras behind the goals?','They show if the ball crossed the line and how a goal was scored. That view is great for replays.','What is a replay?','A goal or a big moment shown again, often in slow motion and from a different camera. It helps everyone see what really happened.']],
  {floor:gantry,workYaw:CREW_TIGHT.yaw}),
 npc('stadium-crew-callum','Callum','Match commentator','ON COMMENTARY',COM_A,{character:'male',face:'light',clothing:'coast',age:'elder'},
  'A match commentator with a headset who describes every pass to listeners at home.',
  'And here comes a new visitor to the commentary box! Hello! I describe the match for people at home.',
  ['And he plays it wide... lovely ball!','Describe the play, never shout over it.','Headset on, notes ready, here we go!'],
  [['What does a commentator do?','Commentators describe the play, so viewers know who has the ball and what is happening. They share facts about the players and the teams too.','How do you know all the names?','Lots of homework! Before the match we learn every player’s name, number and position. We keep notes on the desk.'],
   ['Why wear a headset?','The microphone keeps my voice clear over the crowd, and the earphones let me hear the director and my co-commentator.','Is it hard to talk all match?','You have to listen as well as talk. When the picture already tells the story, a good commentator stays quiet.']],
  {floor:gantry,workYaw:COM_A.yaw}),
 npc('stadium-crew-adaeze','Adaeze','Co-commentator','EXPLAINING THE TACTICS',COM_B,{character:'female',face:'deep',clothing:'sunset'},
  'A former player who explains the tactics in the commentary box.',
  'Hi! I am the co-commentator. My job is to explain why things happen on the pitch.',
  ['Watch the pressing on that side, look!','A replay shows the run before the pass.','The director chooses which camera we see.'],
  [['Who chooses which camera you see?','The director. They watch every camera at once on lots of screens and pick the best shot to show, moment by moment.','How does the director pick?','Mostly the wide shot to follow the play. Then a close-up for a big moment, and a replay from a camera behind the goal when the ball stops.'],
   ['What does a co-commentator do?','I explain the tactics, like why a team is pressing or switching play. The main commentator describes what happens; I explain why.','How can I watch like a commentator?','Watch the players without the ball. Ask yourself why they moved there, and what the next pass might be.']],
  {floor:gantry,workYaw:COM_B.yaw}),
 // ---- Public viewing behind the south stand (Santi and Ingeborg, then the lighter watch-party crowd below)
 npc('stadium-viewer-sol','Santi','Public viewing fan','WATCHING THE BIG SCREEN',start('stadium-viewer-sol'),{character:'male',face:'warm',clothing:'coast',age:'teen'},
  'A teenager who loves watching matches on the big screen with a crowd outside the stand.',
  'Hi! Come and watch with us. The big screen shows the match out here too!',
  ['Watching together is the best way to watch!','When the screen shows a goal, we all jump!','Public viewing feels like being in the stand.'],
  [['What is public viewing?','A big screen outside, so lots of fans can watch a match together. Towns put them up in squares and parks for big tournaments.','Where does the picture come from?','From the TV cameras inside the stadium. The director picks the shot, and it shows on this screen a moment later.'],
   ['Why watch with other fans?','Cheering together is fun! You share the nervous moments, the near misses and the goals.','How do I behave at public viewing?','Like in the stand: cheer, clap good play from both teams, keep paths clear and stay with your grown-up.']],
  {workYaw:Math.PI,watch:true}),
 npc('stadium-viewer-ingeborg','Ingeborg','Public viewing fan','EXPLAINING THE MATCH',start('stadium-viewer-ingeborg'),{character:'female',face:'light',clothing:'sunset',age:'elder'},
  'A grandmother who explains every move on the big screen to whoever stands next to her.',
  'Ooh, did you see that run? Stand with me, dear, and I will tell you what is happening.',
  ['Ooh, so close! Did you see that chance?','Watch the player without the ball, dear.','Score in the corner of the screen: keep an eye!'],
  [['What should I watch on the screen?','Watch where the space is. The team with the ball tries to spread out, and the other team tries to squeeze the space and win it back.','How do I read the score on the screen?','The two team names, their goals and the minute. The home team is usually shown first.'],
   ['Why did everyone say "ooh"?','That was a near miss: a shot just past the post or a big save. Fans say "ooh" when a goal nearly happens.','Do replays show it again?','Yes! After a big chance, the screen often shows a replay from another camera, sometimes in slow motion.']],
  {workYaw:Math.PI,watch:true}),
 // ---- The watch-party crowd (Nov 13 2026, owner: real islanders, not beans): short chats, one topic each; random looks from the id
 // (beanLooks npcDress), a few in DRIP FC green and gold shirts. They watch the screen, cheer goals and clap a near miss (Town).
 npc('stadium-viewer-kwabena','Kwabena','Watch-party fan','CHEERING AT THE SCREEN',start('stadium-viewer-kwabena'),{character:'male',face:'deep',clothing:'coast',age:'adult'},
  'A dad who never misses a big match on the screen and claps good play from both teams.',
  'Hello! Grab a spot, the match is on the big screen!',
  ['Come on, keep it going!','Great pass! Clap for that one.','Both teams are playing well today.'],
  [['Can I cheer for the other team\'s good play?','Yes! Clapping a great save or pass from either team is good sport. Real fans enjoy good football.','What if my team is losing?','Keep cheering for your team. Encouragement helps, and a match can change in a minute.']],
  {workYaw:Math.PI,watch:true,look:{top:'#2f9a5a'}}),
 npc('stadium-viewer-lumi','Lumi','Watch-party fan','HOLDING HER BREATH',start('stadium-viewer-lumi'),{character:'female',face:'light',clothing:'sunset',age:'kid'},
  'A kid who gasps at every near miss on the big screen.',
  'Ooh! That shot on the screen nearly went in!',
  ['Ooh, off the post!','What a save by the keeper!','So close, nearly a goal!'],
  [['What is a near miss?','A chance that nearly becomes a goal: a shot just wide, off the post or the bar, or a big save by the keeper.','Why does everyone say ooh?','Because a goal nearly happened! The whole crowd feels it at the same moment.']],
  {workYaw:Math.PI,watch:true,look:{top:'#f2c230'}}),
 npc('stadium-viewer-rangi','Rangi','Watch-party fan','WAITING FOR KICK-OFF',start('stadium-viewer-rangi'),{character:'male',face:'warm',clothing:'classic',age:'teen'},
  'A teenager who comes early to watch the teams line up on the big screen.',
  'Hi! I come early to see the teams walk out on the screen.',
  ['The second half starts soon!','I love the walk-out before kick-off.','Half-time: time for a stretch!'],
  [['How long is a match?','A full match is two halves of 45 minutes, with a short break called half-time. Younger players play shorter halves.','What happens at half-time?','Players rest, drink water and the coach gives a few tips. Then the teams swap ends.']],
  {workYaw:Math.PI,watch:true}),
 npc('stadium-viewer-zawadi','Zawadi','Watch-party fan','WAITING FOR THE REPLAY',start('stadium-viewer-zawadi'),{character:'female',face:'deep',clothing:'coast',age:'adult'},
  'A mum who loves the slow-motion replays on the big screen.',
  'Wait for the replay on the screen, it shows the whole move!',
  ['Here comes the replay!','Slow motion shows the clever touch.','Watch the run before the goal!'],
  [['Why do replays help?','A replay shows a moment again, often from another camera, so you can see how the chance was made.','What should I watch in a replay?','Watch the pass and the run before the shot. That is where the goal really starts.']],
  {workYaw:Math.PI,watch:true,look:{top:'#2f9a5a'}}),
 npc('stadium-viewer-arlo','Arlo','Watch-party fan','CHECKING THE SCORE',start('stadium-viewer-arlo'),{character:'male',face:'light',clothing:'sunset',age:'kid'},
  'A kid who always keeps one eye on the score and the clock in the corner of the screen.',
  'Look at the score in the corner of the screen!',
  ['How many minutes are left?','The clock is ticking!','Check the score in the corner.'],
  [['What does the screen corner show?','The two teams, their goals and the match clock. It counts up from 0 to 45 in each half.','What is added time?','Extra minutes at the end of a half for time lost to injuries and changes. The fourth official shows it on a board.']],
  {workYaw:Math.PI,watch:true}),
 npc('stadium-viewer-elif','Elif','Watch-party fan','WATCHING OFF THE BALL',start('stadium-viewer-elif'),{character:'female',face:'warm',clothing:'classic',age:'elder'},
  'A grandmother who watches the players without the ball, not just the ball.',
  'Watch the players without the ball on the screen, dear!',
  ['See who is making space?','A good run makes room for others.','Watch the back line move together.'],
  [['Why watch players without the ball?','Most of the time a player does not have the ball. Their runs and positions decide where the next pass can go.','What can I copy from them?','Keep moving into space where a teammate can see you, and look around before the ball arrives.']],
  {workYaw:Math.PI,watch:true,look:{top:'#f2c230'}}),
 // ---- The Drip: the club mascot (an original water-drop costume, lib/graphics/dripMascot.ts)
 npc('stadium-mascot-drip','Drip','DRIP FC mascot','LAPPING THE PITCH',start('stadium-mascot-drip'),{character:'male',face:'warm',clothing:'coast',body:'strong'},
  'Drip, the big friendly water-drop mascot of DRIP FC, who laps the pitch and cheers up the crowd.',
  'Splash! I am Drip, the DRIP FC mascot! High five? Then let me tell you what mascots do.',
  ['Splish splash, cheer for your team!','Wave to the stands with me!','Goal? Time for my splash dance!'],
  [['What is a mascot?','A mascot is a club’s friendly character. Mascots cheer up the crowd, wave to fans and make match day fun, especially for young fans.','Is there a person inside you?','Shh! Yes, someone wears the costume. It gets hot in here, so mascots take breaks and drink lots of water to stay cool.'],
   ['Do mascots walk out with the players?','Sometimes! And many clubs choose kids as matchday mascots: they hold a player’s hand and walk out of the tunnel before kick-off.','Do mascots race?','At some grounds, mascots run fun races at half-time. Nobody minds who wins, and we always shake hands with the other team’s mascot. Being kind is the rule!']],
  {costume:'drip'}),
 // ---- The benches: a head coach and an assistant for each team in their technical areas
 ...([['stadium-bench-hollis','Coach Hollis','Head coach · Gold team',-1,21.7,{character:'male',face:'deep',clothing:'classic',body:'strong',age:'elder'},
   'A calm head coach who gives one clear instruction at a time from the technical area.','Hello! This painted box is my technical area. I coach from here during the match.',
   ['One clear message, then let them play.','Stay compact, gold team! Good!','Head up, keep going! Great effort!'],
   [['What is the technical area?','The painted box beside the dugout. During the match, the coach may stand in it to give instructions, but only one person at a time and they must stay inside.','How do you give instructions?','Short and clear, like "Stay wide!" or "Press now!" Players are busy, so one message at a time works best.'],
    ['How do you encourage players?','I praise effort and good decisions, not only goals. After a mistake I say "Next one!" so the player stays brave.','Do you shout a lot?','Not much. Calm coaches help players think. Clapping a good pass says a lot too.']]],
  ['stadium-bench-teodor','Teodor','Assistant coach · Gold team',-1,17.8,{character:'male',face:'light',clothing:'sunset'},
   'An assistant coach who warms up the substitutes and prepares the substitution board.','Hi! I am the assistant coach. I get the substitutes warmed up and ready to come on.',
   ['Subs, keep warm! You could be next.','Fresh legs can change a match.','Number seven, get ready!'],
   [['How do substitutions work?','The coach tells the fourth official, who holds up a board with the number going off and the number coming on. The new player waits on the halfway line until the first one has left.','How many substitutes can a team use?','It depends on the competition’s rules. Many top competitions now allow five changes in a match.'],
    ['Why warm up the substitutes?','Cold muscles are slow and can get hurt. A good warm-up means a sub is ready to sprint straight away.','What should a sub do when they come on?','Listen to the coach’s one instruction, find their position and get a first easy touch.']]],
  ['stadium-bench-sakura','Coach Sakura','Head coach · Blue team',1,21.7,{character:'female',face:'light',clothing:'coast',body:'strong'},
   'A tactics-loving head coach who changes her team’s shape when the game changes.','Hi! I coach the blue team. Want to know how a team changes its shape?',
   ['From 4-4-2 to 4-3-3, just like that!','Change shape, change the game.','Half-time talk: three points, no more.'],
   [['What is a formation?','It is how players line up, counted from the back, like 4-4-2: four defenders, four midfielders and two strikers. The goalkeeper is not counted.','Can a team change its shape?','Yes! A coach might add a midfielder to win the ball more, or another striker when the team needs a goal.'],
    ['What happens at half-time?','The team rests, drinks water and listens to the coach. A good half-time talk is short: one or two things to fix and lots of encouragement.','What do you tell your team?','What is working, one thing to change and that I believe in them.']]],
  ['stadium-bench-yasmin','Yasmin','Assistant coach · Blue team',1,17.8,{character:'female',face:'deep',clothing:'sunset'},
   'An assistant coach who watches from the bench and cheers every good decision.','Hello! I am the blue team’s assistant coach. My favourite job is encouraging the players.',
   ['Great pass! Do it again!','Well done for tracking back!','Clap clap! Brave play, blue!'],
   [['How do you encourage a player?','Say exactly what they did well, like "Great check over your shoulder!" Specific praise helps them do it again.','What if they make a mistake?','Say "Next one!" and give one simple idea. Everyone makes mistakes, even the best players.'],
    ['What does an assistant coach do?','Watches things the head coach can’t see, helps with substitutions, takes notes and helps run training.','Do you talk to the players during the match?','A little, from the bench. Only one coach at a time may give instructions from the technical area.']]]
 ] as const).map(([id,name,role,side,dz,look,persona,greeting,lines,talks])=>{const t=TECH_AREAS[side<0?0:1],at={x:S.x-HW-2.1,z:S.z+side*dz};void t;
  return npc(id,name,role,`ON THE ${role.split(' · ')[1].toUpperCase()} BENCH${role.startsWith('Head')?'':' (ASSISTANT)'}`,at,look as Look,persona,greeting,[...lines],talks.map(x=>[...x] as Talk),{floor:pitchSide,workYaw:Math.PI/2,emotes:true});}),
 // ---- Match officials at the edge of the pitch (the simulated match has no referee rig; the on-pitch referee stays out)
 npc('stadium-ref-wanjiru','Wanjiru','Fourth official','BETWEEN THE BENCHES',{x:S.x-HW-2,z:S.z},{character:'female',face:'deep',clothing:'classic'},
  'The fourth official, who stands between the two technical areas with the substitution board.',
  'Hello! I am the fourth official. I look after the benches and hold up the board.',
  ['Substitution! Number on, number off.','Added time: the board shows the minutes.','Coaches, stay in your area, please!'],
  [['What does the fourth official do?','I help the referee from the side of the pitch. I check substitutions, keep the technical areas calm and hold up the electronic board.','What does the board show?','The numbers of the players going off and coming on, and near the end of each half, the minutes of added time.'],
   ['What is added time?','Time added on for stoppages like injuries, substitutions and goal celebrations. The referee decides, and I show the minimum on the board.','Can the match go on longer than the board says?','Yes. The board shows the least time that will be added; the referee can add a little more.']],
  {floor:pitchSide,workYaw:Math.PI/2,emotes:true}),
 npc('stadium-ref-amara','Adwoa','Assistant referee','RUNNING THE EAST LINE',{x:S.x+HW+1,z:(AR_TRACKS['stadium-ref-amara'].min+AR_TRACKS['stadium-ref-amara'].max)/2},{character:'female',face:'warm',clothing:'classic',body:'slim'},
  'An assistant referee who runs the east touchline with her flag, level with the second-last defender.',
  'Hi! I am an assistant referee. I run this touchline and help the referee with my flag.',
  ['Stay level with the last defender!','Flag up: offside! Flag sideways: throw-in.','Side-steps keep my eyes on the line.'],
  [['What does your flag mean?','I raise it straight up when I see an offside, then point it to show where. For a throw-in, I point the flag the way the team with the throw will attack.','How do you see offside?','I stay level with the second-last defender, side-stepping so I can see along the line when the pass is played.'],
   ['Why do you run sideways?','Side-steps keep my body facing the pitch, so I never lose sight of the line or the ball.','Who has the final say?','The referee. I help with my flag, but the referee makes the decision.']],
  {floor:pitchSide,workYaw:-Math.PI/2}),
 npc('stadium-ref-oskar','Oskar','Assistant referee','RUNNING THE WEST LINE',{x:S.x-HW-1,z:(AR_TRACKS['stadium-ref-oskar'].min+AR_TRACKS['stadium-ref-oskar'].max)/2},{character:'male',face:'light',clothing:'classic',body:'slim'},
  'An assistant referee and a referee coach who explains the signals and why respect matters.',
  'Hello! I run this line today, and I referee on other days. Want to learn the referee’s signals?',
  ['Play on! Advantage!','Respect the officials, even on a hard call.','Two arms forward means advantage.'],
  [['What are the referee’s signals?','Two arms swept forward: advantage, play on. One arm pointing: a direct free kick. Pointing to the penalty mark: a penalty.','What is advantage?','If a team is fouled but still has a good attack, the referee lets play go on so the foul does not help the team that did it.'],
   ['Why should we respect referees?','Without referees there is no match. They make quick decisions, and everyone makes mistakes sometimes, players too.','How can players show respect?','Accept the decision, let the captain ask calm questions and shake the officials’ hands at the end.']],
  {floor:pitchSide,workYaw:Math.PI/2}),
 // ---- Pitch-side photographers (sitting on the turf, a long lens in front, outside the pitch markings)
 npc('stadium-photo-joon','Joon','Pitch-side photographer','BEHIND THE SOUTH GOAL',PHOTO_SPOTS[0],{character:'male',face:'light',clothing:'classic'},
  'A sports photographer who sits behind the goal line waiting for the big moment.',
  'Shh, I am waiting for a goal! Hi! I take match photos from behind the goal.',
  ['Waiting for the big moment...','Behind the goal is the best seat for a photo.','One click at the perfect moment!'],
  [['Why do photographers sit behind the goals?','Most big moments happen near the goals: shots, saves and celebrations. From behind the goal line you see the players running toward you.','Can you sit anywhere you like?','No. There are marked areas for photographers, away from the play, so we never get in the way of players or the officials.'],
   ['What makes a great football photo?','The big moment: the ball leaving the boot, the keeper at full stretch or a happy celebration. It has to be sharp and show a feeling.','Do you take lots of photos?','Lots! I take quick bursts of photos and choose the best one later.']],
  {floor:pitchSide,pose:'sit',workYaw:PHOTO_SPOTS[0].yaw}),
 npc('stadium-photo-esme','Esme','Pitch-side photographer','BEHIND THE NORTH GOAL',PHOTO_SPOTS[1],{character:'female',face:'warm',clothing:'coast'},
  'A photographer with a giant lens who explains how to freeze a flying ball.',
  'Hi! Mind my big lens. I can photograph a ball at the far end of the pitch with it!',
  ['This lens can see the far goal!','Fast shutter, frozen ball. Perfect!','No flash pitch-side. The lights do the work.'],
  [['Why is your lens so long?','A long lens works like a telescope. It lets me take a close-up picture of players far away without walking onto the pitch.','Is it heavy?','Very! That is why I rest it on a single leg, called a monopod.'],
   ['How do you freeze the ball in a photo?','I use a very fast shutter. It opens for a tiny fraction of a second, so even a flying ball looks still and sharp.','Do you use a flash?','No. A flash could dazzle the players. The floodlights give enough light, and the glint you see is the sun on my lens.']],
  {floor:pitchSide,pose:'sit',workYaw:PHOTO_SPOTS[1].yaw}),
 npc('stadium-photo-rafael','Rafael','Touchline photographer','ON THE TOUCHLINE',PHOTO_SPOTS[2],{character:'male',face:'deep',clothing:'sunset'},
  'A photographer on the touchline who sends pictures to newspapers while the match is still on.',
  'Hello! My photos go to newspapers and websites while the match is still on. Fast, right?',
  ['Photo taken, photo sent. Next!','My bib says I am allowed pitch-side.','The fans at home will see this in minutes.'],
  [['How do photos get to the news so fast?','My camera connects to a laptop or the internet. I pick the best pictures and send them during the match, so websites can show them in minutes.','Who picks which photo they use?','An editor at the newspaper or website. They choose the photo that tells the story of the match best.'],
   ['Why do you wear a bib?','The bib shows the stewards and officials that I am allowed beside the pitch. It also makes sure players know I am a photographer.','Can anyone be a pitch-side photographer?','You need permission from the club or the competition first. Many start by photographing local and youth matches.']],
  {floor:pitchSide,pose:'sit',workYaw:PHOTO_SPOTS[2].yaw}),
];

// ---- Score fan bubbles: from the island news cache only (never a fetch, never an invented score) --------------------------------
/** A short bubble (max 48 characters) with a real, verified result for this league from an already-loaded feed, or null. */
export function scoreFanBubble(feed:IslandNewsFeed|null|undefined,league:NewsLeague,slot=0,now=Date.now()):string|null{
 if(!feed||feed.unavailable)return null;
 const mine=(feed.items??[]).filter(item=>item.league===league);let list=recentMatchStories(mine,now);
 if(!list.length)list=latestMatchStories((feed.lastResults??[]).filter(item=>item.league===league),now);
 const item=list[slot%Math.max(1,Math.min(list.length,12))],m=item?.match;if(!m)return null;
 for(const text of [`Full time: ${m.home} ${m.homeScore}-${m.awayScore} ${m.away}!`,`${m.home} ${m.homeScore}-${m.awayScore} ${m.away}!`])if(text.length<=48)return text;
 return null;
}
/** Bubble when no score is cached yet (or the league has no verified result). */
export const SCORE_FAN_FALLBACK='Ask me, and we can check the latest scores!';
export const SCORE_FAN_LEAGUE:Record<string,NewsLeague>=Object.fromEntries(Object.entries(SCORE_FANS).map(([id,f])=>[id,f.league]));

/** Town's match cues (lib/graphics/stadiumMedia.ts update): the mascot dances on a goal; the bench and the fourth official clap,
 *  point (Well played) or wave now and then, one at a time, through the shared emote answers (islandNpcs.react). */
export const STADIUM_MASCOT_ID='stadium-mascot-drip';
export const STADIUM_GESTURERS:readonly string[]=STADIUM_NPCS.filter(n=>n.emotes).map(n=>n.id);
/** The public-viewing fans (Santi, Ingeborg and the crowd): on a goal they cheer or dance, on a near miss they clap ("ooh, so close!"). */
export const STADIUM_VIEWERS:readonly string[]=STADIUM_NPCS.filter(n=>n.watch).map(n=>n.id);
/** EMOTE.Cheer (clap + hop), EMOTE.WellPlayed, EMOTE.Wave (lib/town/emoteReact.ts), as numbers to keep this file pure data. */
export const STADIUM_GESTURES:readonly number[]=[1,5,0];
