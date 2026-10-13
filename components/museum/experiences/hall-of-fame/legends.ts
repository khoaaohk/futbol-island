/**
 * The Legends of the game (Oct 10 2026; Oct 12 2026 anatomy restyle). Twelve legends, one woman and one man per position, from
 * the game's own player cards (lib/town/positionPlayers.json). On the tabletop pitch every player is the same turned game piece
 * (a base, a body, a ball for a head), told apart by team tone and the move they play: never a likeness, no faces, no crests.
 * Each position has ONE signature move, played as a skill game in the arena (arenaRules.ts): the save, the overlap, the interception,
 * the through ball, the 1-v-1 and the finish. Both legends of a position play the same move.
 *
 * Facts: ONE line per legend, each checked against the linked page (sources below), kept word for word from the gallery version.
 * The jobs are the game's own position teaching (lib/town/positionReference.json, 11v11), rewritten for a 7v7 reader.
 * Pure data, so tests/museum-exp-hall-of-fame.cjs can check it without a browser.
 */
export type Game='women'|'men';
export type Legend={id:string;name:string;card:string;position:string;country:string;game:Game;
 job:string;fact:string;source:{title:string;url:string}};

const JOB={
 Goalkeeper:'The goalkeeper is the last line of defence: stop the shot, then start the attack with a calm pass.',
 'Right-back':'A full-back defends their side of the pitch, then runs past the winger down the line to help the attack.',
 'Centre-back':'A centre-back reads the danger early: step in front of the striker and win the ball.',
 Midfielder:'A midfielder links defence and attack: look up and find the pass that splits the defenders.',
 Winger:'A winger stays wide, beats the defender one against one, then crosses or cuts inside.',
 Striker:'A striker finishes chances: get free in the box and hit the target.',
} as const;
type Pos=keyof typeof JOB;
const L=(position:Pos,game:Game,l:Omit<Legend,'position'|'game'|'job'>):Legend=>({...l,position,game,job:JOB[position]});

/** Grouped by position (goal to goal); within each pair the order alternates (men's game first, then women's, and so on). */
export const LEGENDS:readonly Legend[]=[
 L('Goalkeeper','men',{id:'yashin',name:'Lev Yashin',card:'Lev Yashin',country:'Soviet Union',
  fact:'Lev Yashin is still the only goalkeeper to win the Ballon d’Or, in 1963.',
  source:{title:'Wikipedia · Lev Yashin',url:'https://en.wikipedia.org/wiki/Lev_Yashin'}}),
 L('Goalkeeper','women',{id:'angerer',name:'Nadine Angerer',card:'Nadine Angerer',country:'Germany',
  fact:'At the 2007 Women’s World Cup, Nadine Angerer did not let in a single goal, and Germany won it.',
  source:{title:'Wikipedia · Nadine Angerer',url:'https://en.wikipedia.org/wiki/Nadine_Angerer'}}),
 L('Right-back','women',{id:'bronze',name:'Lucy Bronze',card:'Lucy Bronze',country:'England',
  fact:'Lucy Bronze won The Best FIFA Women’s Player award in 2020, as a defender.',
  source:{title:'Wikipedia · Lucy Bronze',url:'https://en.wikipedia.org/wiki/Lucy_Bronze'}}),
 L('Right-back','men',{id:'cafu',name:'Cafu',card:'Cafu',country:'Brazil',
  fact:'Cafu played in three World Cup finals in a row: 1994, 1998 and 2002.',
  source:{title:'Wikipedia · Cafu',url:'https://en.wikipedia.org/wiki/Cafu'}}),
 L('Centre-back','men',{id:'beckenbauer',name:'Franz Beckenbauer',card:'Franz Beckenbauer',country:'West Germany',
  fact:'Franz Beckenbauer won the World Cup as West Germany’s captain in 1974 and as their coach in 1990.',
  source:{title:'Wikipedia · Franz Beckenbauer',url:'https://en.wikipedia.org/wiki/Franz_Beckenbauer'}}),
 L('Centre-back','women',{id:'renard',name:'Wendie Renard',card:'Wendie Renard',country:'France',
  fact:'Wendie Renard won the Women’s Champions League eight times with Lyon, from 2011 to 2022.',
  source:{title:'Wikipedia · Wendie Renard',url:'https://en.wikipedia.org/wiki/Wendie_Renard'}}),
 L('Midfielder','women',{id:'sawa',name:'Homare Sawa',card:'Homare Sawa',country:'Japan',
  fact:'Homare Sawa captained Japan to win the 2011 Women’s World Cup.',
  source:{title:'Wikipedia · Homare Sawa',url:'https://en.wikipedia.org/wiki/Homare_Sawa'}}),
 L('Midfielder','men',{id:'iniesta',name:'Andrés Iniesta',card:'Andrés Iniesta',country:'Spain',
  fact:'Andrés Iniesta scored the goal that won the 2010 World Cup final for Spain.',
  source:{title:'Wikipedia · Andrés Iniesta',url:'https://en.wikipedia.org/wiki/Andr%C3%A9s_Iniesta'}}),
 L('Winger','men',{id:'garrincha',name:'Garrincha',card:'Garrincha',country:'Brazil',
  fact:'Garrincha won the World Cup with Brazil in 1958 and 1962.',
  source:{title:'Wikipedia · Garrincha',url:'https://en.wikipedia.org/wiki/Garrincha'}}),
 L('Winger','women',{id:'martens',name:'Lieke Martens',card:'Lieke Martens',country:'Netherlands',
  fact:'Lieke Martens was named The Best FIFA Women’s Player in 2017, after the Netherlands won Euro 2017.',
  source:{title:'Wikipedia · Lieke Martens',url:'https://en.wikipedia.org/wiki/Lieke_Martens'}}),
 L('Striker','women',{id:'marta',name:'Marta',card:'Marta',country:'Brazil',
  fact:'Marta has scored 17 goals at Women’s World Cups, more than any other player.',
  source:{title:'Wikipedia · Marta (footballer)',url:'https://en.wikipedia.org/wiki/Marta_(footballer)'}}),
 L('Striker','men',{id:'pele',name:'Pelé',card:'Pelé',country:'Brazil',
  fact:'Pelé won the World Cup three times, in 1958, 1962 and 1970: more than any other player.',
  source:{title:'Wikipedia · Pelé',url:'https://en.wikipedia.org/wiki/Pel%C3%A9'}}),
];
/** The six positions, goal to goal, each with its two legends. */
export const POSITIONS:readonly {position:string;job:string;legends:readonly Legend[]}[]=
 [...new Set(LEGENDS.map(l=>l.position))].map(position=>{const ls=LEGENDS.filter(l=>l.position===position);return {position,job:ls[0].job,legends:ls};});

/** Quick check: "Whose job is it?" Each round reads one position's job; you pick the position. Fixed order, three choices each,
 *  the right answer in a different slot every time. */
export const QUIZ:readonly {position:string;choices:readonly string[]}[]=[
 {position:'Centre-back',choices:['Striker','Centre-back','Winger']},
 {position:'Winger',choices:['Winger','Goalkeeper','Midfielder']},
 {position:'Goalkeeper',choices:['Right-back','Midfielder','Goalkeeper']},
 {position:'Midfielder',choices:['Midfielder','Centre-back','Striker']},
];
export const LEGEND_SOURCES=[...LEGENDS.map(l=>l.source),{title:'Wikipedia · Ballon d’Or (the only goalkeeper winner)',url:'https://en.wikipedia.org/wiki/Ballon_d%27Or'}];
/** The shirt number traditionally linked with each position (a picture of the job, not what each legend wore). */
export const POSITION_NO:Record<string,number>={Goalkeeper:1,'Right-back':2,'Centre-back':5,Midfielder:10,Winger:7,Striker:9};
/** How the legends are drawn (shown under Sources). */
export const STYLE_NOTES='Style: an original isometric tabletop pitch, drawn as a model on a base plate. Every legend is the same plain turned game piece, told apart only by position and the move they play. Nobody is drawn as a likeness and no club or brand marks are used. The shirt number on each plaque is the number traditionally linked with the position, not a claim about what that legend wore. The moves are games about each position’s job, not replays of real matches.';
