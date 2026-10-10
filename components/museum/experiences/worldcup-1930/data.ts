/**
 * worldcup-1930 content (Oct 5 2026). Every line below is real history, checked against the sources at the bottom (FIFA,
 * Wikipedia, Guinness, IFAB, The Daily Star). The case's own three facts (lib/endgame/museum.ts) are quoted word for word.
 * The chart's coastlines are hand-drawn and simplified; the ship's line is a drawn course between the real ports of call, not
 * a logged track.
 */
export type Src={title:string;url:string};

/** The case's facts, quoted exactly (tests/museum-exp-worldcup-1930.cjs checks this). */
export const CASE_FACTS={
 host:'The first FIFA World Cup was played in Uruguay in 1930.',
 final:'Uruguay, the hosts, won it, beating Argentina 4–2 in the final in Montevideo.',
 teams:'Only 13 teams took part.',
} as const;

/** [lon, lat]. */
export type LonLat=readonly [number,number];

/** A port of call: where the ship is when the scroll card for it sits in the middle of the screen. */
export type Port={id:string;name:string;at:LonLat;p:number;date?:string;who:string;text:string};
export const PORTS:Port[]=[
 {id:'genoa',name:'Genoa, Italy',at:[8.93,44.41],p:.03,date:'21 June 1930',who:'Romania',
  text:'The Italian liner Conte Verde leaves Genoa. Romania’s team is on board.'},
 {id:'villefranche',name:'Villefranche-sur-Mer, France',at:[7.31,43.70],p:.11,who:'France + Jules Rimet',
  text:'France’s team climbs aboard, with FIFA’s president Jules Rimet. The new World Cup trophy is in his suitcase.'},
 {id:'barcelona',name:'Barcelona, Spain',at:[2.17,41.38],p:.2,who:'Belgium',
  text:'Belgium’s team joins. Three European referees are on the ship too, including John Langenus, who will referee the final.'},
 {id:'rio',name:'Rio de Janeiro, Brazil',at:[-43.17,-22.9],p:.76,date:'29 June 1930',who:'Brazil',
  text:'After crossing the Atlantic, the ship picks up Brazil’s team. Four teams are now sailing together.'},
 {id:'montevideo',name:'Montevideo, Uruguay',at:[-56.2,-34.9],p:.95,date:'4 July 1930',who:'Land ho!',
  text:'The Conte Verde reaches Montevideo, about two weeks after leaving Genoa. The first World Cup starts nine days later.'},
];
/** Open-sea cards between the ports. */
export const SEA_NOTES=[
 {id:'why',p:.3,title:'Why a ship?',text:'In 1930 there were no passenger planes across the ocean. Most European teams said no to the trip, so only four came from Europe.'},
 {id:'deck',p:.44,title:'Training at sea',text:'Teams kept fit on the ship’s decks every day, with running and fitness drills. Romania’s coach, Costel Rădulescu, drilled his players on deck.'},
 {id:'equator',p:.58,title:'Crossing the Equator',text:'Into the southern half of the world. In Uruguay it is winter in July.'},
] as const;

/** The ship's course, through the real ports, around Spain and down the Atlantic. Keyframes carry their scroll position. */
export const COURSE:{at:LonLat;p:number}[]=[
 {at:[8.93,44.41],p:.03},{at:[8.2,43.9],p:.07},{at:[7.31,43.70],p:.11},{at:[5,42.6],p:.15},{at:[2.17,41.38],p:.2},
 {at:[0.2,38.2],p:.235},{at:[-5.6,35.95],p:.27},{at:[-11,33],p:.31},{at:[-18,24],p:.38},{at:[-22,13],p:.46},
 {at:[-28,2],p:.53},{at:[-32,-6],p:.6},{at:[-36,-13],p:.66},{at:[-40,-20],p:.72},{at:[-43.17,-22.9],p:.76},
 {at:[-46,-26.5],p:.81},{at:[-50,-31],p:.86},{at:[-53.5,-34.6],p:.91},{at:[-56.2,-34.9],p:.95},
];
/** The two dates we can pin (Genoa → Rio → Montevideo); the date label is interpolated between them by scroll. */
export const DATES:{p:number;day:number}[]=[{p:.03,day:21},{p:.76,day:29},{p:.95,day:34}];// 34 = 4 July (30 days in June)

/** Simplified coastlines, [lon, lat], for a hand-drawn chart. */
export const LAND:LonLat[][]=[
 // Europe and the Near East, from the Atlantic coast round the north of the Mediterranean, closed along the top of the chart.
 [[-10,62],[-10,43.5],[-9.3,43],[-8.9,41],[-9.5,38.7],[-8.9,37],[-7.4,37.2],[-6.3,36.6],[-5.6,36],[-4.4,36.7],[-2.1,36.7],[-0.5,38.3],[0.2,38.8],[-0.3,39.5],
  [0.9,41],[2.2,41.4],[3.2,42],[3.1,43.1],[4.2,43.5],[5.4,43.2],[6.6,43.2],[7.3,43.7],[8.2,43.9],[8.9,44.4],[9.8,44.1],[10.5,43.2],[11.2,42.4],
  [12.5,41.7],[14.2,40.8],[15.6,40],[15.7,38.2],[16.1,38],[17.1,39],[16.6,40.4],[18.5,40.1],[17,41.1],[15.2,41.9],[13.6,43.5],[12.3,44.9],[12.4,45.5],
  [13.7,45.7],[15.2,44.3],[17.4,43],[19.4,41.8],[19.4,40.4],[21.1,38.3],[22.3,36.5],[23.2,38],[24,38.2],[22.9,40.5],[24.4,40.9],[26.2,40.7],[26.8,40.5],
  [29,41],[31,41.1],[36,41.7],[41.5,41.5],[40,40.8],[36,36.8],[35.9,35],[34.6,32.5],[34.3,31.3],[45,31],[45,62]],
 // Africa.
 [[-5.9,35.8],[-2.2,35.1],[1,36.5],[3,36.8],[7.8,36.9],[10.3,37.2],[11.1,36.4],[10.2,34.3],[11.5,33.1],[15.2,32.3],[19.9,30.9],[20.1,32.2],[23,32.7],
  [25,31.6],[29.9,31.2],[32.3,31.3],[34.3,31.3],[34.6,27.9],[38,22],[39.4,15.8],[43.3,12.6],[51.2,11.8],[51,10.4],[48.5,5],[42,-0.6],[39.3,-5],[40.5,-10.5],
  [40.7,-15],[35.5,-21.5],[35.5,-24.2],[32.9,-26],[32.4,-28.8],[30,-31.3],[25.6,-34],[20,-34.8],[18.4,-34],[17.9,-31.5],[15.2,-27],[14.5,-22.9],[11.8,-17],
  [13.6,-12],[12.3,-6],[11.8,-3.7],[9.4,-0.8],[9.8,2.6],[8.5,4.5],[5.9,4.3],[4.5,6.3],[1.2,6.1],[-2,4.8],[-4,5.2],[-7.5,4.4],[-11,6.9],[-13.3,8.7],
  [-15,10.9],[-16.8,13],[-17.5,14.7],[-16.5,16.2],[-16.1,19.5],[-17.1,21],[-16.6,22.2],[-14.5,26.2],[-13.2,27.6],[-11.6,28.2],[-9.8,29.9],[-9.6,32.6],
  [-8.5,33.3],[-6.8,34.1],[-5.9,35.8]],
 // South America.
 [[-77.5,8.5],[-75.5,10.5],[-72,12],[-68,10.5],[-62,10.7],[-60,8.5],[-57,6],[-52,5],[-50,1.8],[-48.5,-1],[-44.5,-2.4],[-40,-2.8],[-37,-4.7],[-35.2,-5.4],
  [-34.8,-7.5],[-35.3,-9.4],[-37.1,-11.3],[-38.6,-13],[-39,-17.7],[-40.3,-20.3],[-41,-22],[-42.1,-22.9],[-43.2,-23],[-44.7,-23.3],[-46.3,-24],
  [-48.5,-25.9],[-48.6,-28.5],[-50.2,-30.5],[-51.5,-31.9],[-53.4,-33.7],[-54.9,-34.9],[-56.2,-34.9],[-57.8,-34.5],[-58.4,-34.6],[-57.4,-35.9],
  [-57.5,-38],[-62.3,-38.8],[-62.2,-40.6],[-65,-41],[-64.5,-42.4],[-65.6,-45],[-67.6,-46.5],[-65.8,-47.8],[-68.4,-50.1],[-69,-52],[-68.6,-53.5],
  [-66,-55.1],[-68.6,-55.6],[-71.5,-54],[-74.5,-52.5],[-75.5,-48.5],[-74,-43.5],[-73.6,-39],[-73.2,-37],[-71.6,-33],[-71.4,-28.5],[-70.3,-23],[-70.2,-18.4],
  [-72.8,-16.7],[-76.3,-13.5],[-79.5,-7.5],[-81.2,-5.6],[-80.3,-3.4],[-80.1,-1],[-80.3,0.5],[-79,1.5],[-77.6,3.8],[-77.3,7],[-77.5,8.5]],
 // Central America and the Caribbean edge (top-left corner of the chart).
 [[-77.5,8.5],[-79.5,9.4],[-81.5,8.8],[-83.5,10.5],[-83.8,15],[-87.5,15.9],[-88.5,21.5],[-91,18.6],[-96,19.5],[-97.5,25],[-97.3,28],[-94,29.7],[-89,30.3],
  [-84,30],[-82.7,27.7],[-80.1,25.8],[-81.2,30.2],[-81.5,31.5],[-75.5,35.3],[-76,38],[-74,40.6],[-70,41.7],[-70.6,43],[-66,44.8],[-64,46],[-60,46.2],
  [-55.5,47.5],[-55,52],[-60,55.5],[-62,62],[-110,62],[-110,8.5],[-77.5,8.5]],
 // Great Britain and Ireland (just for the look of the chart).
 [[-5.7,50],[1.4,51.2],[1.7,52.7],[0.3,53.4],[-0.1,54.5],[-1.6,55.6],[-2.1,57.7],[-3.1,58.6],[-5.1,58.6],[-6.2,56.6],[-5,55.6],[-3,54.8],[-3.3,53.4],
  [-4.6,53.3],[-4.3,52.3],[-5.3,51.7],[-3.3,51.4],[-5.7,50]],
 [[-6,52.2],[-6.2,53.9],[-5.6,54.6],[-7.3,55.3],[-8.5,54.3],[-10,53.5],[-9.6,52],[-10.3,51.6],[-8.2,51.6],[-6,52.2]],
];
export const LAND_LABELS:{t:string;at:LonLat;size:number}[]=[
 {t:'EUROPE',at:[16,48.5],size:1},{t:'AFRICA',at:[18,8],size:1.2},{t:'SOUTH AMERICA',at:[-62,-12],size:1.1},{t:'ATLANTIC OCEAN',at:[-32,22],size:1.15},
 {t:'Mediterranean Sea',at:[16,35.6],size:.7},{t:'Strait of Gibraltar',at:[-5.6,34.4],size:.6},
];

// ---- The tournament -------------------------------------------------------------------------------------------------------
export type Team={id:string;name:string;from:'sa'|'eu'|'na';ship?:boolean;color:string};
export const TEAMS:Record<string,Team>={
 arg:{id:'arg',name:'Argentina',from:'sa',color:'repeating-linear-gradient(90deg,#7fb4e0 0 3px,#f4efe3 3px 6px)'},chi:{id:'chi',name:'Chile',from:'sa',color:'#c8443b'},
 fra:{id:'fra',name:'France',from:'eu',ship:true,color:'#2f4fa2'},mex:{id:'mex',name:'Mexico',from:'na',color:'#2f7d4f'},
 yug:{id:'yug',name:'Yugoslavia',from:'eu',color:'#3a5ea8'},bra:{id:'bra',name:'Brazil',from:'sa',ship:true,color:'#e4c33b'},
 bol:{id:'bol',name:'Bolivia',from:'sa',color:'#3f8a4c'},uru:{id:'uru',name:'Uruguay',from:'sa',color:'#5fa8dc'},
 rou:{id:'rou',name:'Romania',from:'eu',ship:true,color:'#e0b93a'},per:{id:'per',name:'Peru',from:'sa',color:'#c93b3b'},
 usa:{id:'usa',name:'USA',from:'na',color:'#2c3e75'},par:{id:'par',name:'Paraguay',from:'sa',color:'#c6423a'},
 bel:{id:'bel',name:'Belgium',from:'eu',ship:true,color:'#c9382f'},
};
export type Group={id:string;label:string;teams:string[];winner:string;line:string;games:string[]};
export const GROUPS:Group[]=[
 {id:'g1',label:'Group 1',teams:['arg','chi','fra','mex'],winner:'arg',line:'Argentina won all three games.',
  games:['France 4–1 Mexico','Argentina 1–0 France','Chile 3–0 Mexico','Chile 1–0 France','Argentina 6–3 Mexico','Argentina 3–1 Chile']},
 {id:'g2',label:'Group 2',teams:['yug','bra','bol'],winner:'yug',line:'Yugoslavia beat Brazil and Bolivia.',
  games:['Yugoslavia 2–1 Brazil','Yugoslavia 4–0 Bolivia','Brazil 4–0 Bolivia']},
 {id:'g3',label:'Group 3',teams:['uru','rou','per'],winner:'uru',line:'Uruguay, the hosts, won both games.',
  games:['Romania 3–1 Peru','Uruguay 1–0 Peru','Uruguay 4–0 Romania']},
 {id:'g4',label:'Group 4',teams:['usa','par','bel'],winner:'usa',line:'The USA won both games 3–0.',
  games:['USA 3–0 Belgium','USA 3–0 Paraguay','Paraguay 1–0 Belgium']},
];
export type Tie={id:string;a:string;b:string;winner:string;score:string;date:string};
export const SEMIS:Tie[]=[
 {id:'s1',a:'arg',b:'usa',winner:'arg',score:'Argentina 6–1 USA',date:'26 July'},
 {id:'s2',a:'uru',b:'yug',winner:'uru',score:'Uruguay 6–1 Yugoslavia',date:'27 July'},
];
export const FINAL:Tie={id:'f',a:'uru',b:'arg',winner:'uru',score:'Uruguay 4–2 Argentina',date:'30 July'};

/** The final, minute by minute. */
export type Goal={min:number;team:'uru'|'arg';who:string};
export const GOALS:Goal[]=[
 {min:12,team:'uru',who:'Pablo Dorado'},{min:20,team:'arg',who:'Carlos Peucelle'},{min:37,team:'arg',who:'Guillermo Stábile'},
 {min:57,team:'uru',who:'Pedro Cea'},{min:68,team:'uru',who:'Santos Iriarte'},{min:89,team:'uru',who:'Héctor Castro'},
];
export const score=(min:number)=>GOALS.reduce((s,g)=>g.min<=min?{...s,[g.team]:s[g.team]+1}:s,{uru:0,arg:0});

/** Ticket check (the quick learning check before the outro): each answer was taught on the way. Right answers punch the ticket. */
export type Q={q:string;choices:readonly string[];right:number;why:string};
export const QUIZ:readonly Q[]=[
 {q:'How did the European teams get to Uruguay?',choices:['By plane','By ship','By train'],right:1,
  why:'On the Conte Verde: about two weeks at sea. There were no passenger planes across the ocean.'},
 {q:'How many teams played at the first World Cup?',choices:['13','16','32'],right:0,
  why:'Only 13, and they were invited. Seven came from South America.'},
 {q:'Why were there two balls in the final?',choices:['One ball burst','The rules said so','The teams could not agree whose ball to use'],right:2,
  why:'So Argentina’s ball was used in the first half and Uruguay’s in the second.'},
 {q:'Who won the first World Cup?',choices:['Argentina','Uruguay','Yugoslavia'],right:1,
  why:'Uruguay, the hosts, came back from 2–1 down at half-time to win 4–2.'},
];

export const SOURCES:Src[]=[
 {title:'FIFA · King Carol II takes Romania to the 1930 FIFA World Cup (Genoa, 21 June; Rimet and the trophy; training on deck)',url:'https://www.fifa.com/en/tournaments/mens/worldcup/articles/romania-king-carol-second-1930-uruguay'},
 {title:'FIFA · Better to travel hopefully than to arrive?',url:'https://inside.fifa.com/tournaments/mens/worldcup/1930uruguay/news/better-to-travel-hopefully-than-to-arrive-2771098'},
 {title:'The Daily Star · Conte Verde: the ship that carried the first World Cup (Rio, 29 June; Montevideo, 4 July)',url:'https://www.thedailystar.net/sports/sports-special/fifa-world-cup-2026/news/conte-verde-the-ship-carried-the-first-world-cup-4175861'},
 {title:'Wikipedia · 1930 FIFA World Cup (13 teams, groups, results)',url:'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup'},
 {title:'Wikipedia · 1930 FIFA World Cup final (two balls, goals, 68,346 fans)',url:'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_final'},
 {title:'Wikipedia · 1930 FIFA World Cup knockout stage',url:'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup_knockout_stage'},
 {title:'Wikipedia · Estadio Centenario',url:'https://en.wikipedia.org/wiki/Estadio_Centenario'},
 {title:'Wikipedia · John Langenus (sailed on the Conte Verde)',url:'https://en.wikipedia.org/wiki/John_Langenus'},
 {title:'Guinness World Records · First FIFA World Cup goal (Lucien Laurent)',url:'https://www.guinnessworldrecords.com/world-records/first-football-(soccer)-fifa-world-cup-goal'},
 {title:'IFAB Laws of the Game · Law 2 The Ball',url:'https://www.theifab.com/laws/latest/the-ball/'},
];
