/**
 * The quiz pages' questions (Nov 23 2026, owner approved "go ahead and build the quiz pages and hubs"): ten quizzes at
 * /learn/quizzes/<slug>, played in place (components/site/quiz/QuizPlay.tsx) with the answer key written out under them.
 * Every answer is taken from a page the site already checked, and each question links to that page ("learn more"):
 *  - rules: lib/site/rules.ts (IFAB Laws of the Game, U.S. Soccer and US Youth Soccer, FIFA Futsal Laws; sources listed there);
 *  - positions and numbers: lib/site/positions.ts, lib/site/positionNumbers.ts; formations: lib/site/formations.ts;
 *  - terms: lib/site/terms.ts (each term's short meaning); ball sizes and game lengths: lib/site/sizes.ts;
 *  - history: the History Museum exhibits (lib/site/exhibits.ts), each with its own sources.
 * The Spanish twin is lib/i18n/es/quizBank.ts: same slugs, same order, same right answers (tests/quizzes.cjs checks parity).
 * Pure data, no imports beyond the shared types.
 */
import type {BankSpot} from './quizPitch';
import {MORE_QUESTIONS,NEW_QUIZZES} from './quizBank2';
/** Nov 23 2026 (owner: "build more interactive quizzes"): 'spot' = tap the right place on a pitch drawing (lib/site/quizPitch.ts;
 *  the options list is the keyboard way in), 'order' = tap the steps first to last (options written in their right order). */
export type QuizKind='choice'|'truefalse'|'ref'|'picture'|'spot'|'order';
export type BankQuestion={kind:QuizKind;q:string;options:string[];correct:number;explain:string;/** the page that teaches it */more:string;
 /** a "Did you know?" line shown after the answer */fact?:string;/** a diagram the site already draws (/learn/diagrams/…) */pic?:{src:string;alt:string};
 /** kind 'spot': one target per option, in the options' order */spot?:BankSpot};
export type QuizTopic='rules'|'positions'|'tactics'|'terms'|'history';
export type BankQuiz={slug:string;topic:QuizTopic;name:string;title:string;desc:string;h1:string;intro:string;
 sources:{name:string;url:string}[];faq:{q:string;a:string}[];questions:BankQuestion[]};

const R=(s:string)=>`/learn/soccer-rules/${s}`,T=(s:string)=>`/learn/soccer-terms/${s}`,P=(s:string)=>`/learn/soccer-positions/${s}`,X=(s:string)=>`/exhibits/${s}`;
const D=(f:string)=>`/learn/diagrams/${f}`;
const IFAB='https://www.theifab.com/laws/latest/';
const law=(n:string,page:string)=>({name:`IFAB Laws of the Game: ${n}`,url:IFAB+page});
const c=(q:string,options:string[],correct:number,explain:string,more:string,o:{fact?:string;pic?:{src:string;alt:string}}={}):BankQuestion=>({kind:o.pic?'picture':'choice',q,options,correct,explain,more,...o});
const tf=(q:string,yes:boolean,explain:string,more:string,fact?:string):BankQuestion=>({kind:'truefalse',q,options:['True','False'],correct:yes?0:1,explain,more,...(fact?{fact}:{})});
const ref=(q:string,options:[string,string],correct:0|1,explain:string,more:string):BankQuestion=>({kind:'ref',q,options,correct,explain,more});

const BASE:readonly BankQuiz[]=[
 {slug:'soccer-rules-quiz',topic:'rules',name:'Soccer rules quiz',title:'Soccer Rules Quiz for Kids: Questions With Answers',
  desc:'A free soccer rules quiz for kids 7 to 12: throw-ins, goal kicks, corners, kick-offs and handball, with an answer and a short reason for every question.',
  h1:'Soccer rules quiz for kids',intro:'Ten quick questions on the basic rules of soccer (football): how long a game lasts, which restart comes next, and when the goalkeeper may use their hands.',
  sources:[law('Laws 3 and 7','the-players/'),law('Law 8','the-start-and-restart-of-play/'),law('Law 12','fouls-and-misconduct/'),law('Law 15','the-throw-in/'),law('Law 16','the-goal-kick/'),law('Law 17','the-corner-kick/')],
  faq:[{q:'Who is this soccer rules quiz for?',a:'Kids aged 7 to 12 and anyone new to the game. Every answer comes with one short reason and a link to the full rule.'},
   {q:'Where do the answers come from?',a:'From the IFAB Laws of the Game, the rules every soccer match follows. Each question links to our rule page, which names the Law.'},
   {q:'Is my score saved anywhere?',a:'Only your best score, on this device, so you can try to beat it. Nothing is sent anywhere and there is no account.'}],
  questions:[
   c('How long is a full adult soccer game?',['90 minutes, in two halves of 45','60 minutes, in two halves of 30','100 minutes, in four quarters'],0,'Two halves of 45 minutes, plus any time the referee adds. Youth games are shorter.',R('substitutions-and-game-length')),
   c('The whole ball rolls over the sideline. How does play restart?',['A throw-in','A corner kick','A goal kick','A kick-off'],0,'A throw-in, taken by the team that did not touch the ball last.',R('throw-in')),
   tf('You can score straight from a throw-in.',false,'A throw straight into the other goal is a goal kick. Another player must touch it first.',R('throw-in')),
   c('An attacker touches the ball last before it crosses the goal line, and no goal is scored. What happens next?',['A goal kick','A corner kick','A throw-in','A penalty kick'],0,'A goal kick for the defending team, from anywhere in its goal area.',R('goal-kick')),
   c('Where may the goalkeeper pick the ball up with their hands?',['Only inside their own penalty area','Anywhere in their own half','Anywhere on the field'],0,'Only inside their own penalty area, and not after a teammate kicks it to them on purpose.',R('handball'),{fact:'Before 1912, a goalkeeper could handle the ball anywhere in their own half.'}),
   ref('Ref’s call: the ball hits a defender’s arm, held close to the body. Handball or no handball?',['Handball','No handball'],1,'Usually no handball. An arm close to the body does not make the body bigger.',R('handball')),
   c('A team has just let in a goal. Who takes the kick-off?',['The team that let the goal in','The team that scored','The referee picks a team'],0,'The team that conceded kicks off, from the center mark.',R('kick-off')),
   tf('The kick-off may be passed backward.',true,'It can go in any direction. Most teams pass it back to keep the ball.',R('kick-off')),
   c('Can a goal be scored straight from a corner kick?',['Yes, against the other team','No, someone else must touch it first'],0,'Yes. Law 17 allows a goal straight from a corner kick, against the other team.',R('corner-kick')),
   c('How many players does each team have on the field in an 11v11 game?',['11, including the goalkeeper','11, plus a goalkeeper','10, including the goalkeeper'],0,'Eleven, and one of them is the goalkeeper.',P('goalkeeper'),{fact:'A game cannot start or go on if a team has fewer than seven players.'}),
  ]},
 {slug:'offside-quiz',topic:'rules',name:'Offside quiz',title:'Offside Quiz: Offside Rule Questions for Kids',
  desc:'Test the offside rule with a free quiz for kids: when offside is judged, who counts as the second-last defender, and when you can never be offside.',
  h1:'Offside quiz',intro:'Offside is the rule people ask about most. These questions check the key moments, one at a time, with a reason for every answer.',
  sources:[law('Law 11 (Offside)','offside/'),{name:'U.S. Soccer small-sided standards (7v7 offside)',url:'https://www.ussoccer.com/stories/2017/08/five-things-to-know-how-smallsided-standards-will-change-youth-soccer'}],
  faq:[{q:'What is the easiest way to explain offside?',a:'When a teammate passes the ball forward to you, two players from the other team, usually the goalkeeper and one defender, must be level with you or nearer their own goal line.'},
   {q:'Is being offside a foul?',a:'No. It is an offence only when the player in an offside position gets involved in the play. The other team gets an indirect free kick.'},
   {q:'Where does this quiz get its answers?',a:'From Law 11 of the IFAB Laws of the Game, through our offside rule page, which explains each point with a diagram.'}],
  questions:[
   c('When does the referee judge if you are in an offside position?',['The moment a teammate plays the ball','The moment you receive the ball','The moment you shoot'],0,'At the moment of the pass. Running past the defenders after the pass is fine.',R('offside')),
   tf('You can be offside in your own half.',false,'You must be in the other team’s half. The halfway line counts as your own half.',R('offside')),
   c('To be onside, how many opponents must be level with you or nearer their goal line?',['Two, usually the keeper and one defender','One','Three'],0,'Two. The offside line is the second-last opponent, not the last.',R('offside'),{pic:{src:D('offside-rule.png'),alt:'Diagram of the offside rule on a soccer field'}}),
   ref('Ref’s call: you are level with the second-last defender when the pass is played. Offside or onside?',['Offside','Onside'],1,'Onside. Level counts as onside.',R('offside')),
   tf('You can be offside straight from a throw-in.',false,'There is no offside straight from a throw-in, a goal kick or a corner kick.',R('throw-in')),
   tf('Standing in an offside position is always an offence.',false,'It is not. The referee waits to see if you get involved in the play.',R('offside')),
   ref('Ref’s call: you start onside, then sprint past the defenders after the pass. Offside or onside?',['Offside','Onside'],1,'Onside. Your position is judged when the ball is passed, not later.',R('offside')),
   c('Which body parts does the referee NOT count when comparing positions?',['Arms and hands','Feet','Head'],0,'Arms and hands are not counted, so a goalkeeper cannot be beaten by an arm.',R('offside')),
   c('You are behind the ball when your teammate passes it. Are you offside?',['No, you are onside','Yes, always'],0,'Behind the ball, you are always onside.',R('offside')),
   c('In US 7v7 games, where can offside be called?',['Only between the build-out line and the goal line','Anywhere on the field','Nowhere: 7v7 has no offside'],0,'Only between the build-out line and the goal line, in the U.S. Soccer standards.',R('build-out-line'),{fact:'Offside was already in the first written Laws of 1863.'}),
  ]},
 {slug:'fouls-and-cards-quiz',topic:'rules',name:'Fouls and cards quiz',title:'Fouls and Cards Quiz: Yellow and Red Card Questions',
  desc:'A yellow card and red card quiz for kids: what each card means, direct and indirect free kicks, the wall and penalty fouls, with short answers.',
  h1:'Fouls and cards quiz',intro:'What does a yellow card mean, and how far back does the wall stand? Ten questions on fouls, free kicks and cards.',
  sources:[law('Law 12 (Fouls and misconduct)','fouls-and-misconduct/'),law('Law 13 (Free kicks)','free-kicks/'),law('Law 14 (The penalty kick)','the-penalty-kick/')],
  faq:[{q:'What is the difference between a yellow and a red card?',a:'A yellow card is a warning and the player keeps playing. A red card sends the player off for the rest of the game, and nobody can replace them.'},
   {q:'Do youth games use cards?',a:'Yes, in most leagues. Some youth leagues also use short time-outs called sin bins, which the Laws allow for grassroots soccer.'},
   {q:'Where do the answers come from?',a:'From Laws 12, 13 and 14 of the IFAB Laws of the Game, through our rule pages on fouls, free kicks, penalties and cards.'}],
  questions:[
   c('What does a yellow card mean?',['A warning: the player keeps playing','The player sits out for ten minutes','The player is sent off'],0,'A warning. A second yellow in the same game becomes a red.',R('yellow-and-red-cards')),
   c('How many yellow cards in one game make a red card?',['Two','Three','Four'],0,'Two. The referee shows the second yellow, then the red.',R('yellow-and-red-cards')),
   tf('A player shown a red card can be replaced by a substitute.',false,'No. The team plays one player short for the rest of the game.',R('yellow-and-red-cards')),
   c('A defender trips an attacker inside their own penalty area. What does the attacking team get?',['A penalty kick','A corner kick','An indirect free kick'],0,'A penalty kick: a trip is a direct free kick foul, and it happened in the defender’s own penalty area.',R('penalty-kick')),
   c('What is special about an indirect free kick?',['A goal counts only if another player touched the ball','You are not allowed to shoot','It is taken from the corner'],0,'You may shoot, but the ball must touch another player for a goal to count.',R('fouls-and-free-kicks')),
   c('How far from the ball must the wall stand?',['At least 10 yards (9.15 metres)','At least 5 yards','At least 20 yards'],0,'At least 10 yards, which is 9.15 metres.',R('fouls-and-free-kicks'),{fact:'In futsal, the wall stands 5 metres away.'}),
   ref('Ref’s call: a player touches the ball first, then crashes recklessly through the opponent. Foul or no foul?',['Foul','No foul'],0,'Foul. Touching the ball first does not make a reckless challenge fair.',R('fouls-and-free-kicks')),
   tf('Cards are only for fouls.',false,'Cards are also for behavior, like arguing with the referee or wasting time.',T('yellow-card')),
   c('How does the referee show an indirect free kick?',['One arm raised straight up','Two blows of the whistle','Pointing at the corner flag'],0,'One arm straight up, until the ball touches another player or goes out.',R('fouls-and-free-kicks')),
   c('Which of these is a red card offence?',['Spitting at someone','Taking a throw-in the wrong way','Standing in an offside position'],0,'Spitting is a sending-off offence. The other two just give the ball to the other team.',T('red-card')),
  ]},
 {slug:'soccer-positions-quiz',topic:'positions',name:'Soccer positions quiz',title:'Soccer Positions Quiz for Kids: Who Plays Where?',
  desc:'A soccer positions quiz for kids: goalkeeper, center back, fullback, wingback, midfielders, winger and striker: where each plays and its other names.',
  h1:'Soccer positions quiz',intro:'Where does a winger stand? What is a holding midfielder? Twenty questions on the positions of an 11-a-side team, five of them tapped on the pitch.',
  sources:[{name:'Futbol Island: soccer positions (lib/site/positions.ts, checked against our position guides)',url:'https://futbolisland.app/learn/soccer-positions'},law('Law 3 (The players)','the-players/'),law('Law 12 (goalkeeper handling)','fouls-and-misconduct/')],
  faq:[{q:'How many positions are there in soccer?',a:'Our guide explains nine: goalkeeper, center back, fullback, wingback, defensive, central and attacking midfielder, winger and striker. Teams mix them in different formations.'},
   {q:'Which position is best for my child?',a:'Young players learn most by trying several. Each position page says who that position suits.'},
   {q:'Is this quiz for 11v11 only?',a:'The names come from 11-a-side soccer, but the same ideas work in 7v7 and 9v9 with fewer players in each line.'}],
  questions:[
   c('Which player may use their hands inside their own penalty area?',['The goalkeeper','The center back','The striker'],0,'Only the goalkeeper, and only inside their own penalty area.',P('goalkeeper')),
   c('Where does a winger play?',['High and wide, near the sideline','In front of the center backs','In goal'],0,'High and wide, on the left or the right of the forward line.',P('winger')),
   c('Who plays at the front, in the middle, near the other team’s center backs?',['The striker','The fullback','The defensive midfielder'],0,'The striker, also called the center forward or the number 9.',P('striker')),
   c('Where does a fullback stand?',['On the outside of a back four, near the sideline','In the middle of the defense','Just behind the striker'],0,'On the outside of a back four, with a center back inside and a winger in front.',P('fullback'),{pic:{src:D('fullback-position.png'),alt:'Diagram of where the fullback plays'}}),
   c('What else do coaches call the defensive midfielder?',['The holding midfielder','The playmaker','The sweeper'],0,'The holding midfielder, or the holder.',P('defensive-midfielder')),
   c('What is another name for the attacking midfielder?',['The playmaker, or the number 10','The number 1','The fullback'],0,'The playmaker, or the number 10.',P('attacking-midfielder')),
   c('A wingback plays wide, outside how many center backs?',['Three','One','Five'],0,'Three. With the ball the wingback goes high; without it, back to defend.',P('wingback')),
   tf('A back four has two center backs side by side.',true,'Yes: two center backs in the middle and a fullback on each side.',P('center-back')),
   c('What does ST mean on a team sheet?',['Striker','Stopper','Sweeper'],0,'ST is short for striker.',P('striker')),
   c('A team plays a 4-3-3. What do the three numbers count, from the back?',['Defenders, midfielders, forwards','Forwards, midfielders, defenders','Goals, passes, shots'],0,'From the back: four defenders, three midfielders, three forwards. The goalkeeper is not counted.',`/learn/soccer-formations/11v11-4-3-3`,{pic:{src:D('11v11-4-3-3-formation.png'),alt:'Diagram of the 4-3-3 soccer formation'}}),
  ]},
 {slug:'soccer-positions-by-number-quiz',topic:'positions',name:'Positions by number quiz',title:'Soccer Positions by Number Quiz: Shirts 1 to 11',
  desc:'Which position is number 9? A soccer numbers quiz for kids on the classic shirt numbers 1 to 11, from the goalkeeper to the left winger.',
  h1:'Soccer positions by number quiz',intro:'In classic soccer, each shirt number stood for a position. Match the numbers 1 to 11 to the players who wear them, then read the team sheet: CB, CDM, CAM and more.',
  sources:[{name:'Futbol Island: soccer positions by number',url:'https://futbolisland.app/learn/soccer-positions/numbers'},law('Law 4 (The players’ equipment)','the-players-equipment/')],
  faq:[{q:'Do players have to wear these numbers?',a:'No. The Laws only ask for different colours. The classic numbers are a custom, and many players today wear any number.'},
   {q:'Why is the number 10 special?',a:'It was the classic shirt of the playmaker, the attacking midfielder who creates chances.'},
   {q:'When did numbers start?',a:'In England, numbered shirts were first worn in league games in 1928 and became compulsory in 1939. Our museum tells the story.'}],
  questions:[
   c('Which number does the goalkeeper usually wear?',['1','9','5'],0,'Number 1: the goalkeeper, the only player who may use their hands.',`/learn/soccer-positions/numbers`),
   c('The classic number 9 is the…',['Striker','Goalkeeper','Left back'],0,'The striker, at the front in the middle.',P('striker')),
   c('Who wears the classic number 10?',['The attacking midfielder','The center back','The goalkeeper'],0,'The attacking midfielder, the playmaker.',P('attacking-midfielder')),
   c('Which position is the classic number 2?',['Right back','Left winger','Striker'],0,'Number 2 is the right back.',P('fullback')),
   c('Which position is the classic number 3?',['Left back','Right winger','Goalkeeper'],0,'Number 3 is the left back.',P('fullback')),
   c('Numbers 4 and 5 are usually the…',['Center backs','Wingers','Strikers'],0,'The two center backs, in the middle of the defense.',P('center-back')),
   c('Which position is the classic number 6?',['Defensive midfielder','Striker','Right back'],0,'The defensive midfielder, just in front of the center backs.',P('defensive-midfielder')),
   c('Which position is the classic number 7?',['Right winger','Left back','Goalkeeper'],0,'Number 7 is the right winger.',P('winger')),
   c('Which position is the classic number 11?',['Left winger','Center back','Defensive midfielder'],0,'Number 11 is the left winger.',P('winger')),
   tf('The Laws of the Game say the striker must wear number 9.',false,'No Law says so. Numbers are a custom; the Laws only ask for different colours.',`/learn/soccer-positions/numbers`),
   c('When were numbered shirts first worn in English league games?',['1928','1863','1991'],0,'In 1928. They became compulsory in 1939.',X('shirts')),
  ]},
 {slug:'penalty-kick-quiz',topic:'rules',name:'Penalty kick quiz',title:'Penalty Kick Quiz: Penalties and Shoot-Outs for Kids',
  desc:'A penalty kick quiz for kids: how far the penalty mark is, what the goalkeeper may do, rebounds, and how a penalty shoot-out works.',
  h1:'Penalty kick and shoot-out quiz',intro:'Penalties decide big games. Ten questions on the penalty kick, the goalkeeper’s line and the penalty shoot-out.',
  sources:[law('Law 14 (The penalty kick)','the-penalty-kick/'),law('Law 10 (Determining the outcome of a match)','determining-the-outcome-of-a-match/'),{name:'Futbol Island Museum: The penalty kick (1891)',url:'https://futbolisland.app/exhibits/penalty-1891'}],
  faq:[{q:'Is a penalty kick the same as a penalty shoot-out?',a:'No. A penalty kick happens during the game after a foul in the box, and play goes on after it. A shoot-out decides a tied cup game after the game is over.'},
   {q:'How far is the penalty spot?',a:'12 yards, which is 11 metres, from the goal line on a full-size field. Smaller youth fields put it closer.'},
   {q:'Where do the answers come from?',a:'From Laws 10 and 14 of the IFAB Laws of the Game, through our penalty kick rule page and the penalty shoot-out term page.'}],
  questions:[
   c('How far is the penalty mark from the goal line on a full-size field?',['12 yards (11 metres)','6 yards','18 yards'],0,'12 yards, which is 11 metres. Smaller youth fields put it closer.',R('penalty-kick'),{pic:{src:D('penalty-kick-rule.png'),alt:'Diagram of a penalty kick'}}),
   c('When does the referee give a penalty kick?',['A defender commits a direct free kick foul in their own penalty area','Any foul anywhere on the field','The ball goes out for a corner'],0,'Only a direct free kick foul by a defender, inside their own penalty area.',R('penalty-kick')),
   tf('The goalkeeper may move along the goal line before the kick.',true,'Yes, but one foot must be on or level with the line when the ball is kicked.',R('penalty-kick')),
   c('The penalty hits the post and bounces back to the kicker. Can the kicker score from it?',['No, another player must touch it first','Yes, straight away'],0,'No. The kicker must wait until another player touches the ball.',R('penalty-kick')),
   c('The goalkeeper saves, and the ball comes back to the kicker. What now?',['The kicker may play it','Nobody may touch it','The kick is taken again'],0,'A rebound from the goalkeeper is different: the kicker may play it.',R('penalty-kick')),
   tf('A penalty kick and a penalty shoot-out are the same thing.',false,'A penalty kick happens during the game. A shoot-out decides a tied cup game.',T('penalty-shoot-out')),
   c('In a penalty shoot-out, how many kicks does each team take at first?',['Five','Three','Ten'],0,'Five each, in turns, and more one by one if it is still tied.',T('penalty-shoot-out')),
   c('When is a penalty shoot-out used?',['To decide a tied cup game','At half-time','After every foul in the box'],0,'To find a winner when a cup game is still tied.',T('penalty-shoot-out')),
   c('In which year did the penalty kick join the Laws?',['1891','1930','1970'],0,'In 1891. The idea came from William McCrum, a goalkeeper from Ireland.',X('penalty-1891')),
   tf('A penalty kick can be passed to a teammate.',true,'Yes. The ball must go forward, and a teammate who started outside the area may run on to it.',R('penalty-kick')),
  ]},
 {slug:'soccer-terms-quiz',topic:'terms',name:'Soccer terms quiz',title:'Soccer Terms Quiz: Nutmeg, Hat-Trick, 2v1 and More',
  desc:'A soccer words quiz for kids: nutmeg, hat-trick, brace, clean sheet, 2v1, through ball, give-and-go and more, each with a one-line meaning.',
  h1:'Soccer terms quiz',intro:'Football has its own words. Can you tell a brace from a hat-trick, or a through ball from an overlap? Twenty quick questions.',
  sources:[{name:'Futbol Island: soccer terms A to Z',url:'https://futbolisland.app/learn/soccer-terms'}],
  faq:[{q:'What is the most famous soccer word?',a:'Maybe the nutmeg: playing the ball between an opponent’s legs and getting it on the other side.'},
   {q:'Are these words the same everywhere?',a:'Mostly. Some change by country: a clean sheet is also called a shutout in the United States, and extra time is often called overtime.'},
   {q:'Where can I learn more words?',a:'Our soccer terms page explains every word with a diagram, how to do it and the common mistakes.'}],
  questions:[
   c('What is a nutmeg?',['Playing the ball between an opponent’s legs and getting it on the other side','A pass to the far post','A shot that hits the crossbar'],0,'Through the legs, and collect it on the other side.',T('nutmeg')),
   c('What is a hat-trick?',['Three goals by one player in one game','Three passes in a row','Three corners in a row'],0,'Three goals scored by one player in one game.',T('hat-trick')),
   c('What is a brace?',['Two goals by one player in one game','A tackle from behind','A save with both hands'],0,'Two goals scored by one player in one game.',T('brace')),
   c('What is a clean sheet?',['A game where a team lets in no goals','A new kit for the team','A game with no fouls'],0,'A game with no goals let in. In the US it is also called a shutout.',T('clean-sheet')),
   c('What does 2v1 mean?',['Two attackers against one defender','Two goals to one','Two halves, one break'],0,'Two attackers against one defender: dribble at them, then pass if they come.',T('two-v-one')),
   c('What is a through ball?',['A pass between or behind the defenders, into space','A pass back to the goalkeeper','A long throw-in'],0,'A pass into space for a teammate to run on to.',T('through-ball')),
   c('What is another name for a give-and-go?',['A one-two, or a wall pass','A nutmeg','A volley'],0,'A one-two or a wall pass: pass, run, get it straight back.',T('give-and-go')),
   c('What is an assist?',['The last pass before a teammate scores','A pass back to the goalkeeper','A foul that stops a goal'],0,'The last pass to a teammate who then scores.',T('assist')),
   c('A player scores by accident in their own team’s goal. Who gets the goal?',['The other team','Nobody: it does not count','The player’s own team'],0,'An own goal counts for the other team.',T('own-goal')),
   c('What is an overlap?',['A run around the outside of the teammate with the ball','A goal scored with a header','Two players marking one attacker'],0,'A run around the outside, to make two against one on the side of the field.',T('overlap')),
   c('A teammate shouts “Man on!”. What does it mean?',['An opponent is coming from behind','Go up for a header','The game is over'],0,'An opponent is coming: protect the ball or pass quickly.',T('man-on')),
  ]},
 {slug:'futsal-rules-quiz',topic:'rules',name:'Futsal rules quiz',title:'Futsal Rules Quiz for Kids: Kick-Ins, Fouls and More',
  desc:'A futsal rules quiz for kids: five a side, kick-ins, the four-second rule, no offside, accumulated fouls and the futsal ball, with short answers.',
  h1:'Futsal rules quiz',intro:'Futsal is five-a-side soccer on a hard court, with its own Laws. Eleven questions on what makes it different.',
  sources:[{name:'FIFA Futsal Laws of the Game 2025-26',url:'https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf'},{name:'Futbol Island Museum: Futsal’s World Cup (1989)',url:'https://futbolisland.app/exhibits/futsal-1989'}],
  faq:[{q:'Is futsal the same as indoor soccer?',a:'No. Futsal has its own Laws: touchlines instead of walls, five players a side and a smaller ball made to bounce low.'},
   {q:'Why do coaches like futsal for kids?',a:'The small court and low-bounce ball mean many touches and quick decisions, which helps close control.'},
   {q:'Where do the answers come from?',a:'From the FIFA Futsal Laws of the Game, through our futsal rules page.'}],
  questions:[
   c('How many players does each futsal team have on the court, including the goalkeeper?',['Five','Seven','Eleven'],0,'Five a side, one of them the goalkeeper.',R('futsal-rules')),
   c('The ball goes over the touchline. How does play restart?',['With a kick-in','With a throw-in','With a goal clearance'],0,'A kick-in: futsal kicks the ball back in instead of throwing it.',R('futsal-rules'),{pic:{src:D('futsal-rules-rule.png'),alt:'Diagram of futsal rules on a court'}}),
   c('How long does a team have to take a restart once it is ready?',['Four seconds','Ten seconds','Six seconds'],0,'Four seconds for kick-ins, corners, free kicks and goal clearances.',R('futsal-rules')),
   tf('Futsal has an offside rule.',false,'There is no offside in futsal.',R('futsal-rules')),
   c('Futsal has no goal kicks. What does the goalkeeper do instead?',['Throws or releases the ball from the penalty area','Kicks it from the goal area','Drop-kicks it from the halfway line'],0,'A goal clearance: the keeper throws or releases the ball from the penalty area.',R('futsal-rules')),
   c('How many substitutions may a futsal team make?',['As many as it likes, on the fly','Five','Three'],0,'Unlimited, made while the game goes on.',R('futsal-rules')),
   c('How is a futsal ball different from a soccer ball?',['Smaller, and it bounces less','Bigger, and it bounces more','It is exactly the same'],0,'Smaller (62 to 64 cm around) and made to bounce less.',R('futsal-rules')),
   c('From which team foul in a period does the other team get a free kick with no wall?',['The sixth','The third','The tenth'],0,'From the sixth accumulated foul, usually from the 10 m mark.',R('futsal-rules')),
   tf('You can score straight from a kick-in.',false,'If a kick-in goes straight into the goal, the other team gets a goal clearance.',R('futsal-rules')),
   c('How far must the wall stand from a futsal free kick?',['5 metres','10 yards','1 metre'],0,'5 metres in futsal; 10 yards in soccer.',R('fouls-and-free-kicks')),
   c('Where did futsal begin?',['Montevideo, Uruguay, in 1930','London, in 1863','The Netherlands, in 1989'],0,'In Montevideo, in 1930, made up by Juan Carlos Ceriani.',X('futsal-1989'),{fact:'The first FIFA Futsal World Cup was played in the Netherlands in 1989, and Brazil won it.'}),
  ]},
 {slug:'7v7-soccer-rules-quiz',topic:'rules',name:'7v7 rules quiz',title:'7v7 Soccer Rules Quiz: Build-Out Line, Heading and More',
  desc:'A 7v7 soccer rules quiz for U9 and U10 players and parents: the build-out line, no punts, offside, heading, ball size and game length.',
  h1:'7v7 soccer rules quiz',intro:'7v7 is the game U9 and U10 teams play in the United States, with a few rules of its own. Eleven questions for players and parents.',
  sources:[{name:'U.S. Soccer: small-sided standards',url:'https://www.ussoccer.com/stories/2017/08/five-things-to-know-how-smallsided-standards-will-change-youth-soccer'},{name:'U.S. Soccer: Recognize to Recover (heading)',url:'https://www.ussoccer.com/stories/2015/12/us-soccer-announces-recognize-to-recover-player-health-and-safety-program'},law('modifications for youth football','general-modifications/')],
  faq:[{q:'Do all leagues use these 7v7 rules?',a:'They are the U.S. Soccer standards. Your league or country may differ, so check its rules.'},
   {q:'Why is there a build-out line?',a:'It gives the team with the ball room to pass out from the back instead of kicking it long.'},
   {q:'What comes after 7v7?',a:'From U11, teams play 9v9, and the build-out line is gone.'}],
  questions:[
   c('In US youth soccer, which age groups play 7v7?',['U9 and U10','U6 to U8','U13 and older'],0,'U9 and U10. U6 to U8 play 4v4, and U11 and U12 play 9v9.',`/learn/soccer-age-groups`),
   c('How many players does each team have on the field in 7v7?',['Seven, including the goalkeeper','Seven, plus a goalkeeper','Six'],0,'Seven, and one of them is the goalkeeper.',`/learn/soccer-field-size-by-age`),
   c('Where is the build-out line?',['Halfway between the penalty area and the halfway line','On the goal line','On the halfway line'],0,'Halfway between the penalty area and the halfway line.',R('build-out-line'),{pic:{src:D('build-out-line-rule.png'),alt:'Diagram of the build-out line on a 7v7 field'}}),
   c('Your goalkeeper has a goal kick. Where does the other team wait?',['Behind the build-out line','Inside the penalty area','On the goal line'],0,'Behind the build-out line, until the ball is in play.',R('build-out-line')),
   c('When may the other team cross the build-out line?',['As soon as the ball is put into play','When a defender touches the ball','After ten seconds'],0,'On a goal kick, once the ball is kicked and clearly moves.',R('build-out-line')),
   tf('The goalkeeper may punt the ball in U9 and U10 7v7 games.',false,'No punts or drop kicks, so young teams learn to pass out from the back.',R('build-out-line')),
   tf('Players aged 10 and under may head the ball in games.',false,'In US youth soccer, players aged 10 and under do not head the ball.',R('heading-rules-for-kids')),
   c('A 9-year-old heads the ball on purpose in a game. What does the referee give?',['An indirect free kick to the other team','A penalty kick','A yellow card'],0,'An indirect free kick to the other team, from that spot.',R('heading-rules-for-kids')),
   c('Which ball size do U9 and U10 teams use?',['Size 4','Size 3','Size 5'],0,'Size 4, for ages 9 to 12.',`/learn/soccer-ball-size-by-age`),
   c('How long is a U9 or U10 7v7 game?',['Two halves of 25 minutes','Two halves of 45 minutes','Four quarters of 10 minutes'],0,'Two halves of 25 minutes, in the U.S. Soccer standards.',`/learn/soccer-field-size-by-age`),
   tf('9v9 games use the build-out line too.',false,'It belongs to 7v7 for U9 and U10. 9v9 and 11v11 do not use it.',R('build-out-line')),
  ]},
 {slug:'world-cup-quiz',topic:'history',name:'World Cup and history quiz',title:'World Cup Quiz for Kids: Football History Questions',
  desc:'A World Cup and football history quiz for kids: the first World Cup, the first Women’s World Cup, the Telstar ball, VAR and the first Laws.',
  h1:'World Cup and football history quiz',intro:'From the first Laws in 1863 to VAR in 2018: twenty questions on football history, each from an exhibit in our History Museum.',
  sources:[{name:'Wikipedia: 1930 FIFA World Cup',url:'https://en.wikipedia.org/wiki/1930_FIFA_World_Cup'},{name:'Wikipedia: 1991 FIFA Women’s World Cup',url:'https://en.wikipedia.org/wiki/1991_FIFA_Women%27s_World_Cup'},{name:'Wikipedia: Adidas Telstar',url:'https://en.wikipedia.org/wiki/Adidas_Telstar'},{name:'Wikipedia: Video assistant referee',url:'https://en.wikipedia.org/wiki/Video_assistant_referee'},{name:'Wikipedia: 1872 Scotland v England football match',url:'https://en.wikipedia.org/wiki/1872_Scotland_v_England_football_match'},{name:'Wikipedia: The Football Association',url:'https://en.wikipedia.org/wiki/The_Football_Association'},{name:'Wikipedia: 1916 South American Championship',url:'https://en.wikipedia.org/wiki/1916_South_American_Championship'}],
  faq:[{q:'Where do these history answers come from?',a:'From the exhibits in our History Museum. Each exhibit page lists its own sources.'},
   {q:'Which country won the first World Cup?',a:'Uruguay, the hosts, in 1930. They beat Argentina 4–2 in the final in Montevideo.'},
   {q:'Can I see these moments in the game?',a:'Yes. The History Museum on Futbol Island has an exhibit for each one, and every exhibit has its own page.'}],
  questions:[
   c('Where was the first FIFA World Cup played?',['Uruguay, in 1930','England, in 1966','Brazil, in 1950'],0,'In Uruguay, in 1930.',X('worldcup-1930'),{fact:'Only 13 teams took part in the first World Cup.'}),
   c('Who won the first World Cup?',['Uruguay','Argentina','Brazil'],0,'Uruguay, the hosts, beat Argentina 4–2 in the final.',X('worldcup-1930')),
   c('Where was the first FIFA Women’s World Cup played?',['China, in 1991','The USA, in 1999','Sweden, in 1995'],0,'In China, in 1991.',X('wwc-1991')),
   c('Who won the first Women’s World Cup?',['The USA','Norway','China'],0,'The USA beat Norway 2–1 in the final.',X('wwc-1991'),{fact:'Michelle Akers scored both US goals in that final.'}),
   c('Why was the 1970 World Cup ball, the Telstar, black and white?',['So it stood out on black-and-white TV','Those were Mexico’s colours','Black paint was cheaper'],0,'So it stood out on black-and-white television.',X('telstar-1970')),
   c('When was VAR first used at a men’s World Cup?',['2018, in Russia','1998, in France','2010, in South Africa'],0,'In 2018, in Russia.',X('var-2018')),
   tf('With VAR, the video referee makes the final decision.',false,'The referee on the pitch still makes the final decision.',X('var-2018')),
   c('Which teams played the first official international match, in 1872?',['Scotland and England','Brazil and Argentina','France and Spain'],0,'Scotland and England, in Glasgow. It finished 0–0.',X('first-international-1872')),
   c('In which year did the Football Association write down the first Laws?',['1863','1930','1891'],0,'In 1863, in London, so different clubs could play each other.',X('laws-1863')),
   c('Who won the first South American Championship, now called the Copa América, in 1916?',['Uruguay','Brazil','Argentina'],0,'Uruguay, with two wins and a draw.',X('copa-america-1916'),{fact:'It is the oldest continental tournament for national teams that is still played.'}),
  ]},
];
/** Nov 23 2026 (owner: "add more to history, terms and tactics, and positions quizzes too"): the grown quizzes take their extra
 *  questions from quizBank2, and the new quizzes follow, in the hub's topic order. */
export const QUIZ_BANK:readonly BankQuiz[]=[...BASE.map(q=>({...q,questions:[...q.questions,...(MORE_QUESTIONS[q.slug]??[])]})),...NEW_QUIZZES];
