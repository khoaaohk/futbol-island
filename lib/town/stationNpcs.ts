import type {NpcDefinition} from './npcDialogues';
/**
 * Island Line station islanders (train Phase 4, Nov 23 2026, owner: "1–2 NPCs per station ... facts tying trains / travelling to
 * football"). Two per station: one standing in front of the departure board (looking up at it), one on the platform bench. They
 * use the standard NPC slide-out conversation and the shared townsfolk runtime (lib/graphics/islandNpcs.ts: drawn, posed and
 * routined only when near and on screen; past the NPC distance they are hidden like every islander). `floor` keeps each on its
 * exact spot at the platform's height (no wander route, no snap to the ground below the platform).
 * Spots are the stations' own frame (lib/town/trainLayout.ts stationSpot): stand = (u -6.2, v 3.3) facing the board, bench =
 * (u -9, v 3.6) facing the line; written out here so this data module needs no track maths at load (tests/train-station-npcs.cjs
 * checks them against stationSpot). Every spot is more than 3 m from the rail centre.
 * Town (components/Town.tsx) turns them toward an arriving train (islandNpcs.reactToTruck) and lets the BOARDERS step onto a
 * train with open doors and off a later one (islandNpcs.setAway: local only, no presence, nothing drawn while away).
 *
 * Facts checked Nov 23 2026 (kid words; only what the sources say):
 *  - Kashima Soccer Stadium Station (JR Kashima Line) is only served on match days: JR East timetable notes; Wikipedia
 *    "Kashima Soccer Stadium Station" ("trains stop at the station only when matches are held").
 *  - Pointing and calling (shisa kanko) by Japanese rail staff: Railway Technical Research Institute study (1994) found it cut
 *    errors by up to about 85 % (reported by Atlas Obscura 2017, "Pointing and calling"; Japan Times 2017).
 *  - Football specials: British Rail and earlier railway companies ran special trains for fans to away matches (Wikipedia
 *    "Football special"; National Railway Museum notes).
 *  - Wembley has three nearby stations: Wembley Park (Underground), Wembley Central and Wembley Stadium (National Rail)
 *    (wembleystadium.com "Getting here").
 *  - "Away day" / "away end": the trip to an away match; away fans sit together in a section of the ground (common English usage).
 *  - German clubs and fan groups charter special trains (Sonderzüge) to away matches (Deutsche Bahn charter service; DFB fan reports).
 *  - Manchester United began in 1878 as Newton Heath LYR F.C., the team of the Lancashire and Yorkshire Railway's carriage and
 *    wagon works at Newton Heath; they played in green and gold, and became Manchester United in 1902 (manutd.com club history).
 *  - Crewe Alexandra are nicknamed "The Railwaymen": Crewe grew as a railway town (crewealexfc.co.uk; Wikipedia "Crewe Alexandra F.C.").
 *  - Ekiben: boxed lunches sold at Japanese stations to eat on the train (JNTO "Ekiben"). Rice before playing: carbohydrate fuel
 *    (already the island's line: vendingCatalog caykonbini / stadium lessons).
 *  - 1930 World Cup: France, Belgium and Romania sailed to Uruguay on the SS Conte Verde, about two weeks at sea, with Jules Rimet
 *    and the trophy on board (FIFA.com "1930 FIFA World Cup Uruguay"; Wikipedia "SS Conte Verde").
 *  - The Tokaido Shinkansen opened on 1 October 1964, just before the Tokyo Olympics, where football was played (Hungary won gold)
 *    (JR Central; olympics.com "Tokyo 1964 football").
 *  - Shinkansen punctuality: JR Central reports an average delay per train of under one minute in normal years (JR Central
 *    "Safety and punctuality" annual figures, about 0.9 min incl. weather).
 *  - Many teams travel the day before an away game to rest, sleep and recover from the journey; long trips can cause "travel
 *    fatigue" (Fowler, Duffield, Vaile 2015, "Effects of domestic air travel on technical and tactical performance and recovery in
 *    soccer", IJSPP; Reilly et al. 2007 travel fatigue review).
 *  - The Gotthard Base Tunnel (Switzerland, opened 2016) is the world's longest railway tunnel, about 57 km (SBB; alptransit.ch).
 *  - Lokomotiv Moscow was founded as a railway workers' club and is owned by the national railway company (fclm.ru club history).
 *  - PSV Eindhoven was founded in 1913 by workers of the Philips company (psv.nl "History"): a works team, like the railway teams.
 *  - Tactile paving (the yellow bumpy tiles) was invented in Japan by Seiichi Miyake in 1965; first laid in Okayama in 1967
 *    (Google Doodle 2016; Japan Times). Blind football: the ball has bells inside; a Paralympic sport since Athens 2004 (IBSA).
 *  - J.League's first season was 1993 with 10 clubs; today 60 clubs play in J1, J2 and J3 (jleague.jp). Beach soccer: three
 *    periods of 12 minutes (BSWW / FIFA Beach Soccer Laws of the Game).
 */
type Spot={x:number;z:number;yaw:number};
const PLATFORM_Y={north:.55,west:.55,south:.55,summit:1.45,cay:.55} as const;
const STAND:Record<keyof typeof PLATFORM_Y,Spot>={north:{x:176.34,z:-201.85,yaw:6.2},west:{x:-302.03,z:-36.68,yaw:1.58},south:{x:154.29,z:219.9,yaw:3.14},summit:{x:501.53,z:199.56,yaw:3.8},cay:{x:594.34,z:-76.67,yaw:3.03}};
const BENCH:Record<keyof typeof PLATFORM_Y,Spot>={north:{x:179.11,z:-201.32,yaw:3.06},west:{x:-301.75,z:-39.48,yaw:-1.56},south:{x:151.49,z:219.59,yaw:0},summit:{x:499.12,z:201.03,yaw:.65},cay:{x:597.15,z:-76.66,yaw:-.11}};
export const STATION_NPC_SPOTS={stand:STAND,bench:BENCH,platformY:PLATFORM_Y};
type St=keyof typeof PLATFORM_Y;
type Talk=[question:string,answer:string,followQuestion:string,followAnswer:string];
const at=(st:St,kind:'stand'|'bench')=>{const p=(kind==='stand'?STAND:BENCH)[st],y=PLATFORM_Y[st];
 return {x:p.x,z:p.z,workYaw:p.yaw,floor:()=>y,...(kind==='bench'?{pose:'bench' as const}:{watch:true})};};
const topics=(...t:Talk[])=>t.map((x,i)=>({id:'t'+i,question:x[0],answer:x[1],followUp:{question:x[2],answer:x[3]}}));

export const STATION_NPCS:(NpcDefinition&{station:St;boards?:boolean})[]=[
 // ---- 1 North (Kit Shop)
 {id:'stn-hana',station:'north',name:'Hana',role:'Station attendant',pursuit:'KEEPING THE NORTH STATION RUNNING',...at('north','stand'),character:'female',face:'light',clothing:'classic',
  look:{skin:1,hair:'bun',headwear:'cap',headwearColor:'#2f4a7a'},persona:'A cheerful station attendant who checks every train in and out.',boards:false,
  greeting:'Welcome to North station! I check every train in and out. Trains and football have more in common than you think. Ask me anything!',
  lines:['Mind the gap, and stay behind the yellow line!','The next train is on the board. Want a train fact while you wait?'],
  topics:topics(
   ['Is there a station just for football?','Yes! In Japan, Kashima Soccer Stadium Station on the Kashima Line only has trains stopping on match days. On other days, the trains go straight past.','Why only on match days?','Thousands of fans arrive at once for a game, so the extra stop helps them get there together. The rest of the week, hardly anyone needs it.'],
   ['Why do you point at the signals?','Japanese rail staff point and call out what they check. A study found it cuts mistakes by up to about 85 %, because your eyes, arm and voice all agree.','Do footballers do that?','Goalkeepers do something similar: they point and shout to set up the wall, so every defender knows the plan.'])},
 {id:'stn-ted',station:'north',name:'Ted',role:'Travelling fan',pursuit:'WAITING FOR THE TRAIN TO THE MATCH',...at('north','bench'),character:'male',face:'warm',clothing:'sunset',age:'elder',
  look:{skin:3,hair:'none',headwear:'beanie',headwearColor:'#b0332b'},persona:'A lifelong fan who has followed his team by train for fifty years.',boards:false,
  greeting:'Off to the match! I have followed my team by train since I was your age. Fancy hearing how fans used to travel?',
  lines:['Scarf on, flask packed, ticket ready.','Every away trip starts at a station like this one.'],
  topics:topics(
   ['How did fans travel to away games?','In England, railways ran "football specials": extra trains full of fans going to the same match. Whole stations filled with scarves and songs.','Do football specials still run?','Some do, but most fans now take normal trains, coaches or cars. The idea is the same: travelling together is half the fun.'],
   ['Which stadium has the most stations?','Wembley in London has three nearby: Wembley Park, Wembley Central and Wembley Stadium station. On a big day, tens of thousands of fans arrive by train.','Why build stadiums by stations?','So lots of people can arrive and leave quickly without traffic jams. Trains carry far more people than cars on the same day.'])},
 // ---- 2 West Beach (Drip FC Stadium)
 {id:'stn-ines',station:'west',name:'Inês',role:'Away fan',pursuit:'READING THE DEPARTURE BOARD',...at('west','stand'),character:'female',face:'warm',clothing:'coast',
  look:{skin:3,hair:'ponytail',headwear:'none'},persona:'An away fan who has come by train to watch DRIP FC play.',boards:true,
  greeting:'Is this the stop for the stadium? I came all the way by train to cheer for my team today. Have you ever been on an away day?',
  lines:['Next train: one minute. Perfect!','Away day! I love the trip as much as the game.'],
  topics:topics(
   ['What is an away day?','An away day is the trip to watch your team play at the other team\'s ground. Away fans sit together in their own part of the stadium, called the away end.','Is it hard to cheer when you are away?','You are fewer, so you sing louder! Players often say they can hear their away fans and it gives them a lift.'],
   ['Do fans really share trains?','Yes. In Germany, clubs and fan groups sometimes book a whole special train for an away game, so hundreds of fans ride together.','Is that just in Germany?','No: fans in Japan, England and many other countries travel to games together by train too.'])},
 {id:'stn-kofi',station:'west',name:'Kofi',role:'Kid with a ball',pursuit:'WAITING WITH HIS BALL',...at('west','bench'),character:'male',face:'deep',clothing:'sunset',age:'kid',
  look:{skin:6,hair:'crop'},persona:'A young fan who knows the history of railway clubs.',boards:false,
  greeting:'I am not kicking my ball on the platform, promise! Did you know some big clubs were started by railway workers?',
  lines:['I keep my ball in my hands near the trains.','Railway clubs are the best clubs!'],
  topics:topics(
   ['Which club started on the railway?','Manchester United! In 1878 they began as Newton Heath LYR, the team of a railway company\'s carriage and wagon works. They played in green and gold.','When did they become Manchester United?','In 1902 they got a new name, Manchester United, and later changed to red shirts.'],
   ['Are there other railway clubs?','Crewe Alexandra in England are nicknamed "The Railwaymen", because Crewe grew up as a railway town.','Why do nicknames matter?','A nickname tells a club\'s story. Fans sing it, so the history lives on every match day.'])},
 // ---- 3 South (Museum)
 {id:'stn-ren',station:'south',name:'Grandpa Ren',role:'Grandparent with a bento',pursuit:'EATING A STATION BENTO',...at('south','bench'),character:'male',face:'light',clothing:'classic',age:'elder',
  look:{skin:1,hair:'none',headwear:'bucket'},persona:'A grandparent who always buys a station bento before a trip.',boards:false,
  greeting:'Ah, hello! Would you like to hear about my lunch? In Japan, stations sell special boxed lunches for the train.',
  lines:['Rice, fish and pickles. A perfect train lunch.','I always eat before a long trip, just like a player before a match.'],
  topics:topics(
   ['What is a station bento?','It is called an ekiben: a boxed lunch you buy at the station and eat on the train. Many stations have their own special one.','Is it good food before football?','Rice gives your legs energy. Lots of players eat a rice ball or a banana an hour or two before they play.'],
   ['How did teams travel long ago?','At the first World Cup in 1930, teams from Europe sailed to Uruguay by ship. France, Belgium and Romania spent about two weeks at sea, with the trophy on board!','Did they train on the ship?','They did exercises on deck to stay fit. Today a flight takes about a day, but back then the journey was part of the adventure.'])},
 {id:'stn-mo',station:'south',name:'Mo',role:'Trainspotter',pursuit:'NOTING DOWN EVERY TRAIN',...at('south','stand'),character:'female',face:'deep',clothing:'coast',age:'teen',
  look:{skin:5,hair:'puffs',headwear:'visor'},persona:'A trainspotter with a notebook full of times and train names.',boards:true,
  greeting:'Shh, I am timing the next train! I write down every train that comes in. Want to hear my favourite train facts?',
  lines:['That one was 0 minutes late. Nice!','Notebook, pencil, timetable. Ready.'],
  topics:topics(
   ['What is the most famous train?','Maybe Japan\'s Shinkansen, the bullet train. The first line opened on 1 October 1964, just before the Tokyo Olympics, where football was one of the sports.','Who won the football at those Olympics?','Hungary won the gold medal at Tokyo 1964.'],
   ['Are trains ever on time?','The Shinkansen is famous for it: on average its trains are less than a minute late, even counting bad weather.','Why does being on time matter in football?','A match kicks off at a set time, and teams plan their whole day around it: travel, food, warm-up. Being late is not an option!'])},
 // ---- 4 Summit Isle
 {id:'stn-lena',station:'summit',name:'Coach Lena',role:'Travelling coach',pursuit:'TAKING HER TEAM TO AN AWAY GAME',...at('summit','stand'),character:'female',face:'light',clothing:'sunset',
  look:{skin:0,hair:'long',headwear:'none'},persona:'A youth coach taking her team to an away match.',boards:true,
  greeting:'My team plays an away game tomorrow, so we travel today. Want to know why teams leave early?',
  lines:['Everyone has their boots? Good.','We always arrive the day before.'],
  topics:topics(
   ['Why travel the day before?','Long journeys can make you tired and stiff, which scientists call travel fatigue. Arriving early means time to sleep well, eat properly and stretch before the game.','What do players do after a trip?','A short walk or light training helps the legs wake up after sitting still for a long time.'],
   ['What is the longest train tunnel?','The Gotthard Base Tunnel in Switzerland: about 57 km under the mountains. Our tunnel here is a lot shorter!','Why build tunnels through mountains?','A tunnel keeps the line flat and straight, so trains go faster than climbing over the top.'])},
 {id:'stn-pip',station:'summit',name:'Pip',role:'Young trainspotter',pursuit:'WATCHING THE TUNNEL',...at('summit','bench'),character:'female',face:'warm',clothing:'coast',age:'kid',
  look:{skin:4,hair:'curls'},persona:'A kid who loves trains coming out of tunnels.',boards:false,
  greeting:'Watch the tunnel! The train comes out with a whoosh. Did you know some clubs belong to railways?',
  lines:['Here it comes... whoosh!','I count the cars every time.'],
  topics:topics(
   ['Do railways own football clubs?','Some do! Lokomotiv Moscow was started as a club for railway workers, and it still belongs to the country\'s railway company.','Why "Lokomotiv"?','It means locomotive, the engine that pulls the train. Lots of railway clubs have names like that.'],
   ['Did other workers start clubs too?','Yes. PSV Eindhoven in the Netherlands was started in 1913 by people who worked for the Philips company. It was a works team, like the railway teams.','Are works teams still around?','Many big clubs today began as a team for workers at a factory, a railway or a shipyard.'])},
 // ---- 5 Coral Cay
 {id:'stn-kai',station:'cay',name:'Kai',role:'Station attendant',pursuit:'WATCHING THE PLATFORM',...at('cay','stand'),character:'male',face:'warm',clothing:'coast',
  look:{skin:4,hair:'crop',headwear:'cap',headwearColor:'#2f4a7a'},persona:'The Coral Cay station attendant, keen on platform safety.',boards:false,
  greeting:'Welcome to Coral Cay! Please wait behind the yellow line. Do you know what those bumpy yellow tiles are for?',
  lines:['Behind the yellow line, please!','Beach soccer players get off here.'],
  topics:topics(
   ['What are the bumpy yellow tiles?','Tactile paving. They help blind and partially sighted people feel where the platform edge is. A Japanese inventor, Seiichi Miyake, made them in 1965.','Can blind people play football?','Yes! In blind football the ball has bells inside, so players hear where it is. It has been a Paralympic sport since 2004.'],
   ['Why stay back from the edge?','A train is very heavy, so it needs a long way to stop. Staying behind the line keeps you safe while it pulls in.','Is that like football?','A bit: defenders keep a safe distance at a free kick too. At least 9.15 metres, the rules say.'])},
 {id:'stn-bea',station:'cay',name:'Bea',role:'Beach soccer fan',pursuit:'GOING TO THE BEACH SOCCER',...at('cay','bench'),character:'female',face:'deep',clothing:'sunset',
  look:{skin:6,hair:'long',headwear:'headband'},persona:'A fan who takes the train to Coral Cay every week for beach soccer.',boards:true,
  greeting:'I take the train here every week to watch beach soccer. Want to know how a beach game works?',
  lines:['Sand, sun and bicycle kicks!','The train gets me here right on time.'],
  topics:topics(
   ['How long is a beach soccer game?','Three periods of 12 minutes each. It is fast: five a side, barefoot, with lots of overhead kicks.','Why is it barefoot?','Bare feet grip the soft sand better, and it is safer when players jump and land close together.'],
   ['When did Japan get a big league?','The J.League kicked off in 1993 with 10 clubs. Today 60 clubs play in its three divisions, and fans ride trains all over Japan to follow them.','How do fans get to games there?','Mostly by train! Many stadiums in Japan are a short walk from a station.'])},
];
/** The station islanders who step onto a train with open doors and off a later one (local only). */
export const STATION_BOARDERS=STATION_NPCS.filter(n=>n.boards).map(n=>({id:n.id,station:n.station}));
