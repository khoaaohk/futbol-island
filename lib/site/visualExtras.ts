import type {TryLink,TopicGroup} from '@/components/site/visual/Visuals';
import {playLessonHref} from './playLinks';
import {toEs} from '../i18n/esPaths';
/**
 * SEO lift + visual pass (Nov 26 2026): the extra teaching visuals and "Try it in the game" links of the existing pages that
 * rank badly for searches they should own (GSC 28 days to Nov 25 2026). EN and ES side by side, same keys.
 *
 * SOURCES (checked Nov 26 2026; nothing from memory that is not listed here):
 *  - Card meanings: IFAB Laws of the Game, Law 12 s.4 and Law 3 (already the sources of lib/site/cardRules.ts).
 *  - Card history: Wikipedia "Penalty card" (English referee Ken Aston; after the 1966 World Cup England v Argentina match,
 *    newspapers reported cautions the referee had not made clear during the game; a colour code "on the same principle as
 *    traffic lights"; first used at the 1970 FIFA World Cup in Mexico). https://en.wikipedia.org/wiki/Penalty_card
 *  - Hat-tricks in finals: FIFA match records. 1966 World Cup final, England 4-2 West Germany after extra time, Geoff Hurst 3;
 *    2015 Women's World Cup final, USA 5-2 Japan, Carli Lloyd 3 in the first 16 minutes; 2022 World Cup final, Argentina 3-3
 *    France, Argentina won the shoot-out, Kylian Mbappé 3 (the second hat-trick in a men's World Cup final).
 */
export type ExtraTable={id:string;title:string;intro?:string;head:readonly string[];rows:readonly (readonly string[])[];note?:string};
export type TermVisual={visual:'cards-yellow'|'cards-red'|'goals';table?:ExtraTable;tryIt:readonly TryLink[]};
const QUIZ_CARDS='/learn/quizzes/fouls-and-cards-quiz',CARDS_RULE='/learn/soccer-rules/yellow-and-red-cards';

const CARD_TRY_EN:readonly TryLink[]=[
 {href:CARDS_RULE,name:'Yellow, red or nothing?',line:'Be the referee in the card game on the cards rules page'},
 {href:QUIZ_CARDS,name:'Fouls and cards quiz',line:'Check yourself with questions and answers'},
 {href:playLessonHref('def_7_goalside'),name:'Defend without a foul',line:'The island lesson: stay goal-side instead of diving in'}];
const CARD_TRY_ES:readonly TryLink[]=[
 {href:toEs(CARDS_RULE),name:'¿Amarilla, roja o nada?',line:'Haz de árbitro en el juego de la página de las tarjetas'},
 {href:toEs(QUIZ_CARDS),name:'Quiz de faltas y tarjetas',line:'Ponte a prueba con preguntas y respuestas'},
 {href:playLessonHref('def_7_goalside'),name:'Defender sin falta',line:'La lección de la isla: quédate entre el balón y el arco'}];

const HAT_TABLE_EN:ExtraTable={id:'famous-hat-tricks',title:'Famous hat-tricks in World Cup finals',
 intro:'Only three players have scored a hat-trick in a World Cup final.',
 head:['Final','Player','What happened'],rows:[
  ['1966 World Cup final','Geoff Hurst (England)','Three goals in England’s 4-2 win over West Germany after extra time, at Wembley. The first hat-trick in a World Cup final.'],
  ['2015 Women’s World Cup final','Carli Lloyd (USA)','Three goals in the first 16 minutes of a 5-2 win over Japan, in Vancouver.'],
  ['2022 World Cup final','Kylian Mbappé (France)','Three goals in a 3-3 draw with Argentina. Argentina won the penalty shoot-out, so a hat-trick does not always win the cup.']],
 note:'Source: FIFA match records.'};
const HAT_TABLE_ES:ExtraTable={id:'famous-hat-tricks',title:'Tripletes famosos en finales del Mundial',
 intro:'Solo tres jugadores han marcado un triplete en una final del Mundial.',
 head:['Final','Jugador','Qué pasó'],rows:[
  ['Final del Mundial 1966','Geoff Hurst (Inglaterra)','Tres goles en el 4-2 de Inglaterra a Alemania Occidental en la prórroga, en Wembley. El primer triplete en una final del Mundial.'],
  ['Final del Mundial femenino 2015','Carli Lloyd (EE. UU.)','Tres goles en los primeros 16 minutos del 5-2 a Japón, en Vancouver.'],
  ['Final del Mundial 2022','Kylian Mbappé (Francia)','Tres goles en el 3-3 con Argentina. Argentina ganó la tanda de penales: un triplete no siempre gana la copa.']],
 note:'Fuente: registros de partidos de la FIFA.'};

export const TERM_VISUALS:Readonly<Record<string,{en:TermVisual;es:TermVisual}>>={
 'yellow-card':{en:{visual:'cards-yellow',tryIt:CARD_TRY_EN},es:{visual:'cards-yellow',tryIt:CARD_TRY_ES}},
 'red-card':{en:{visual:'cards-red',tryIt:CARD_TRY_EN},es:{visual:'cards-red',tryIt:CARD_TRY_ES}},
 'hat-trick':{en:{visual:'goals',table:HAT_TABLE_EN,tryIt:[
   {href:'/games/soccer-shooting-game',name:'Ball Blaster',line:'The shooting game: aim for the corners and go for three'},
   {href:playLessonHref('next7_shotreaction'),name:'Watch what happens after the shot',line:'The island lesson: rebounds are where second and third goals come from'},
   {href:'/learn/soccer-drills/shooting',name:'Shooting drills',line:'Practise finishing with a ball and a goal'}]},
  es:{visual:'goals',table:HAT_TABLE_ES,tryIt:[
   {href:toEs('/games/soccer-shooting-game'),name:'Ball Blaster',line:'El juego de tiros: apunta a las esquinas y ve a por tres'},
   {href:playLessonHref('next7_shotreaction'),name:'Mira qué pasa después del tiro',line:'La lección de la isla: de los rechaces salen el segundo y el tercer gol'},
   {href:toEs('/learn/soccer-drills/shooting'),name:'Ejercicios de tiro',line:'Practica la definición con un balón y un arco'}]}},
};

/** The cards rule page: where the cards came from (both languages) and its Try it row. */
export const CARD_HISTORY={
 en:{id:'card-history',title:'Where the yellow and red cards came from',points:[
  'At the 1966 World Cup, in England’s game against Argentina, the referee’s cautions and a sending-off were not clear to everyone during the game: some were only confirmed in the newspapers afterwards.',
  'English referee Ken Aston, who looked after the referees at that World Cup, saw that a colour code would work in any language, on the same idea as traffic lights: yellow for take care, red for stop.',
  'Yellow and red cards were used for the first time at the 1970 World Cup in Mexico. Today they are in Law 12 of the Laws of the Game.'],
  note:'Source: “Penalty card”, Wikipedia (Ken Aston, 1966, 1970 World Cup); IFAB Laws of the Game, Law 12.',tryIt:[{...CARD_TRY_EN[0],href:'#card-game',line:'Be the referee: make the call on real match moments'},...CARD_TRY_EN.slice(1)]},
 es:{id:'card-history',title:'De dónde vienen las tarjetas amarilla y roja',points:[
  'En el Mundial de 1966, en el Inglaterra-Argentina, las amonestaciones y una expulsión del árbitro no quedaron claras para todos durante el partido: algunas solo se confirmaron después en los periódicos.',
  'El árbitro inglés Ken Aston, que se ocupaba de los árbitros de aquel Mundial, vio que un código de colores se entendería en cualquier idioma, con la idea de un semáforo: amarillo para cuidado, rojo para parar.',
  'Las tarjetas amarilla y roja se usaron por primera vez en el Mundial de 1970, en México. Hoy están en la Regla 12 de las Reglas de Juego.'],
  note:'Fuente: “Penalty card”, Wikipedia (Ken Aston, 1966, Mundial de 1970); Reglas de Juego de la IFAB, Regla 12.',tryIt:[{...CARD_TRY_ES[0],href:'#card-game',line:'Haz de árbitro: decide en jugadas de partido'},...CARD_TRY_ES.slice(1)]},
} as const;

/** The terms hub (/learn/soccer-terms): the terms with a page, by topic, so "soccer words" searchers start where they need. */
const T='/learn/soccer-terms/';
const g=(icon:TopicGroup['icon'],title:string,slugs:readonly [string,string][])=>({icon,title,links:slugs.map(([s,n])=>({path:T+s,name:n}))});
export const TERM_TOPICS:readonly TopicGroup[]=[
 g('whistle','Referee and rules words',[['yellow-card','Yellow card'],['red-card','Red card'],['offside-trap','Offside trap'],['stoppage-time','Stoppage time'],['extra-time','Extra time'],['penalty-shoot-out','Penalty shoot-out'],['set-piece','Set piece']]),
 g('goal','Scoring and results',[['hat-trick','Hat-trick'],['brace','Brace'],['assist','Assist'],['clean-sheet','Clean sheet'],['own-goal','Own goal'],['tap-in','Tap-in']]),
 g('ball','Moves with the ball',[['types-of-dribbling','Types of dribbling'],['dribble','Dribble'],['nutmeg','Nutmeg'],['step-over','Step-over'],['chip','Chip'],['volley','Volley'],['first-touch','First touch'],['shielding','Shielding']]),
 g('arrow','Passing and attacking',[['give-and-go','Give-and-go'],['through-ball','Through ball'],['overlap','Overlap'],['cutback','Cutback'],['cross','Cross'],['switching-play','Switch of play'],['two-v-one','2v1']]),
 g('shield','Defending',[['marking','Marking'],['goal-side','Goal-side'],['tackle','Tackle'],['jockeying','Jockeying'],['pressing','Pressing'],['clearance','Clearance'],['low-block','Low block']]),
 g('pennant','Areas and roles',[['penalty-area','Penalty area'],['goal-area','Goal area'],['far-post','Far post'],['false-nine','False 9'],['box-to-box','Box-to-box'],['sweeper-keeper','Sweeper keeper'],['pivot','Pivot']]),
];
export const TERM_TOPICS_TITLE='Soccer words by topic';
export const TERM_HUB_TRY:readonly TryLink[]=[
 {href:'/learn/quizzes',name:'Soccer quizzes for kids',line:'Test the words: rules, positions and moves'},
 {href:'/play',name:'Play Futbol Island',line:'Hear the words in the island’s lessons and games'}];
