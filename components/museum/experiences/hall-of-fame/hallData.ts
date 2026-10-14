import type {GradFormat} from '@/lib/endgame/graduationModel';

/**
 * Trophy room · your own shelf's data (Oct 5 2026 Hall of Fame; Oct 12 2026 the room became the Trophy room, and the player's
 * certificates and cups stand on their own shelf of the cabinet). Pure, so tests/museum-exp-hall-of-fame.cjs can read it.
 *
 * One spot per path (futsal → 7v7 → 9v9 → 11v11, the spaces grow) and one for the Island Diploma: an earned spot holds a cup
 * and its framed certificate; an empty one keeps its label and says what to do next.
 * "Same idea, different space" lights up the lesson where each big idea comes back in every path. Those links are the game's
 * own lesson list (lib/paths/formatPaths.json), not real-world history. The only real-world facts are the player counts.
 */
export type Plinth={format:GradFormat;name:string;aSide:number;place:string};
export const PLINTHS:readonly Plinth[]=[
 {format:'futsal',name:'Futsal',aSide:5,place:'Palm Coast rooftop court'},
 {format:'7v7',name:'7v7',aSide:7,place:'Old Town Ground'},
 {format:'9v9',name:'9v9',aSide:9,place:'Club Grounds'},
 {format:'11v11',name:'11v11',aSide:11,place:'Eleven Park'},
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
 title:'Trophy room',
 /** The registry still calls the case 'Your Hall of Fame' (lib/endgame/museum.ts); the room's own wall label says this. */
 /** The case's own facts and takeaway (lib/endgame/museum.ts), word for word. */
 fact1:'Every path you graduate hangs its certificate here.',
 fact2:'Graduate all four paths to board the Matchday Ferry for your Matchday final.',
 takeaway:'Learning football is a journey: futsal, 7v7, 9v9 and 11v11 all teach the same big ideas in different spaces.',
 ideasTitle:'Same idea, different space',
 ideasHint:'Pick a big idea to see where it comes back in every path.',
 ferryOpen:'All four paths graduated. The Matchday Ferry is open for your Matchday final!',
 champion:'Matchday Champion! You graduated every path and won the Matchday Ferry final.',
 gameNote:'The paths, certificates, your cups and the Matchday Ferry are part of the Futbol Island game. The player counts are real football rules.',
 trophyNote:'The eight trophies are drawn by us from their real shapes and sizes, turned on a lathe in centimetres; small details are left off. Every height, weight and story comes from the sources below. The Africa Cup of Nations trophy has no published height or weight, so we never measure or weigh it.',
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
