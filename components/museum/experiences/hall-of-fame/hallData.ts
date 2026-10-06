import type {GradFormat} from '@/lib/endgame/graduationModel';

/**
 * Hall of Fame experience data (Oct 5 2026). Pure, so tests/museum-exp-hall-of-fame.cjs can read it without a browser.
 *
 * The room is about the PLAYER: four plinths, one per path, stepping up like stairs (futsal → 7v7 → 9v9 → 11v11, the
 * spaces grow). An earned plinth glows and holds its certificate; an unearned one is dim and says what to do next.
 * "Same idea, different space" lights up the lesson where each big idea comes back in every path. Those links are the game's
 * own lesson list (lib/paths/formatPaths.json), not real-world history. The only real-world facts are the player counts.
 */
export type Plinth={format:GradFormat;name:string;aSide:number;place:string;
 /** The light that falls on an earned plinth (a bright partner of the format's cap colour). */
 glow:string;
 /** One team's dots on the little pitch: [x,y] in a 100×64 box, own goal on the left. Illustrative shapes, not to scale. */
 dots:[number,number][];shape:string;scale:number};
export const PLINTHS:readonly Plinth[]=[
 {format:'futsal',glow:'#f7cb69',name:'Futsal',aSide:5,place:'Palm Coast rooftop court',shape:'3-1 (with the goalkeeper)',scale:.62,
  dots:[[8,32],[30,32],[46,14],[46,50],[66,32]]},
 {format:'7v7',glow:'#fff2b9',name:'7v7',aSide:7,place:'Old Town Ground',shape:'2-3-1 (with the goalkeeper)',scale:.74,
  dots:[[7,32],[26,20],[26,44],[48,10],[48,32],[48,54],[70,32]]},
 {format:'9v9',glow:'#ffc27a',name:'9v9',aSide:9,place:'Club Grounds',shape:'3-2-3 (with the goalkeeper)',scale:.87,
  dots:[[6,32],[22,14],[22,32],[22,50],[42,22],[42,42],[66,12],[70,32],[66,52]]},
 {format:'11v11',glow:'#f7cb69',name:'11v11',aSide:11,place:'Eleven Park',shape:'4-3-3 (with the goalkeeper)',scale:1,
  dots:[[5,32],[20,8],[18,24],[18,40],[20,56],[40,16],[38,32],[40,48],[66,10],[72,32],[66,54]]},
];

/** Big ideas that come back in every path, by starter lesson id (tests check each id is a starter lesson of that format). */
export type Idea={id:string;label:string;why:string;lessons:Record<GradFormat,string>};
export const IDEAS:readonly Idea[]=[
 {id:'look',label:'Look before it arrives',why:'Check over your shoulder, then turn, pass back or keep it.',
  lessons:{futsal:'bld_f_passtofeet','7v7':'learn7_receive','9v9':'learn9_receive','11v11':'bld_11_throughlines'}},
 {id:'open',label:'Get open for a pass',why:'Step out of the defender’s shadow so the ball can reach you.',
  lessons:{futsal:'prn_f_support','7v7':'prn_7_support','9v9':'prn_9_support','11v11':'bld_11_whenlong'}},
 {id:'wall',label:'Pass and move',why:'Give the ball and move: a quick one-two, or the next teammate, beats a defender.',
  lessons:{futsal:'f_pared','7v7':'s_onetwo','9v9':'learn9_wall','11v11':'e_thirdman'}},
 {id:'cover',label:'One presses, one covers',why:'One player goes to the ball, a teammate stays behind to help.',
  lessons:{futsal:'def_f_goalside','7v7':'def_7_goalside','9v9':'learn9_cover','11v11':'def_11_pressurecover'}},
 {id:'lose',label:'Lost it? React fast',why:'The moment the ball changes teams, press it or run back.',
  lessons:{futsal:'trn_f_winitback','7v7':'gap7_lostball','9v9':'trn_9_recover','11v11':'trn_11_recover'}},
 {id:'restart',label:'Restarts need two options',why:'At a goal kick or kick-in, give the taker more than one pass.',
  lessons:{futsal:'set_f_throwin','7v7':'learn7_buildout','9v9':'learn9_restart','11v11':'learn11_restart'}},
];

export const COPY={
 kicker:'Today · the last room in the museum',
 title:'Your Hall of Fame',
 /** The case's own facts and takeaway (lib/endgame/museum.ts), word for word. */
 fact1:'Every path you graduate hangs its certificate here.',
 fact2:'Graduate all four paths to board the Matchday Ferry for your Matchday final.',
 takeaway:'Learning football is a journey: futsal, 7v7, 9v9 and 11v11 all teach the same big ideas in different spaces.',
 ideasTitle:'Same idea, different space',
 ideasHint:'Pick a big idea to see where it comes back in every path.',
 ferryOpen:'All four paths graduated. The Matchday Ferry is open for your Matchday final!',
 champion:'Matchday Champion! You graduated every path and won the Matchday Ferry final.',
 gameNote:'The paths, pitches, certificates and the Matchday Ferry are part of the Futbol Island game. The player counts are real football rules.',
};
export const ferryLine=(have:number)=>have>=4?COPY.ferryOpen:`${have} of 4 paths graduated. Graduate ${4-have} more to board the Matchday Ferry.`;
export const nextStep=(name:string,done:number,total:number)=>done>=total
 ?`All ${total} lessons done! Your ${name} certificate is on its way.`
 :done>0?`Next: finish ${total-done} more of its ${total} starter lessons on the Paths screen.`
 :`Next: start the ${name} path on the Paths screen. It has ${total} starter lessons.`;

export const SOURCES=[
 {title:'IFAB Laws of the Game, Law 3: The Players (eleven players a side, one is the goalkeeper)',url:'https://www.theifab.com/laws/latest/the-players/'},
 {title:'The FA, Futsal Laws of the Game, Law 3: The Number of Players (five players a side, one is the goalkeeper)',url:'https://www.thefa.com/football-rules-governance/lawsandrules/laws/futsal/law-3---the-number-of-players'},
];
