import type {CallGame} from './refCall';
/**
 * The extra parts of /learn/soccer-rules/yellow-and-red-cards (cards page, Nov 16 2026): the 7 yellow and 7 red card
 * offences (the swipeable deck, components/site/CardDeck.tsx, which enhances a server-rendered list), what happens next, the
 * yellow vs red table, side questions and the "Yellow, red or nothing?" game (components/site/RefCallGame.tsx). The Spanish
 * words are lib/i18n/es/cardRules.ts, same shape, same ids, same order. Rendered by components/site/CardRulesSections.tsx.
 *
 * SOURCES (checked Nov 16 2026; nothing written from memory):
 *  - IFAB Laws of the Game, Law 12 section 4 "Disciplinary action" (the edition at /laws/latest/ that day; menu offers 2026/27
 *    and 2025/26): https://www.theifab.com/laws/latest/fouls-and-misconduct/ . Cautionable offences: delaying the restart;
 *    dissent by word or action; entering, re-entering or deliberately leaving without permission (split here into two cards);
 *    failing to respect the distance at a dropped ball, corner, free kick or throw-in; persistent offences ("no specific number
 *    or pattern"); unsporting behaviour (reckless direct free kick offence, simulation, stopping a promising attack, handling to
 *    score...). The two VAR-only cautions (entering the referee review area, excessive "TV screen" signal) are named in a
 *    caption, not as cards. Sending-off offences: DOGSO by deliberate handball (not a goalkeeper in their own area) or
 *    non-deliberate handball outside the offender's own area; DOGSO by an offence against an opponent moving towards goal;
 *    serious foul play ("endangers the safety of an opponent or uses excessive force or brutality"); biting or spitting;
 *    violent conduct (excessive force when not challenging for the ball, against anyone); offensive, insulting or abusive
 *    language and/or action(s); a second caution in the same match. VOR entry and the competition-option protest offences are
 *    in the same caption. DOGSO in the penalty area with "an attempt to play the ball or a challenge for the ball" = penalty
 *    and caution; holding, pulling, pushing = red. "Only a player, substitute, substituted player or team official may be
 *    shown the red or yellow card"; if an offender in the technical area cannot be identified "the senior team coach present"
 *    is sanctioned. A sent-off player must leave the vicinity of the field and the technical area.
 *  - IFAB Law 3 https://www.theifab.com/laws/latest/the-players/ : no fewer than 7 players, a sent-off player cannot be
 *    replaced once play has started; a named substitute who is sent off cannot be replaced.
 *  - IFAB "Guidelines for temporary dismissals (sin bins)": https://www.theifab.com/laws/latest/guidelines-for-temporary-dismissals/
 *    (youth, veterans, disability and grassroots competitions, with the approval of the national FA, confederation or FIFA;
 *    for all cautions (System A) or some (System B); yellow card then both arms to the temporary dismissal area; 10-15% of the
 *    playing time, e.g. 10 minutes in a 90-minute match; replaceable only after the period ends).
 *  - Team officials' cards: in the Laws since the 2019/20 edition (IFAB Law changes 2019/20), and in the current Law 12 lists.
 *  - Portugal's white card ("fair play card", Portuguese Football Federation; first shown in a top-level match on 21 January
 *    2023, Sporting v Benfica, women's cup, to both teams' medical staff who helped an ill fan):
 *    https://www.euronews.com/2023/01/25/referee-shows-a-white-card-for-the-first-time-in-football-history-but-why . It is not
 *    in the Laws of the Game. NOT a green card: no source ties a green card to Portugal, so the page says nothing about one.
 * NOT VERIFIED and therefore said only as "check your league": how many games a red card costs (competitions decide; the Laws
 * do not), whether young recreational leagues show cards, yellow-card accumulation bans.
 */
export type CardColor='yellow'|'red';
export type CardIcon='mask'|'talk'|'repeat'|'clock'|'distance'|'enter'|'leave'|'studs'|'fist'|'spit'|'hand'|'goal'|'mouth'|'twoCards';
export type CardOffence={id:string;color:CardColor;icon:CardIcon;name:string;explain:string;example:string;next:string};
export type CardDeckWords={label:string;yellow:string;red:string;flip:string;flipBack:string;prev:string;next:string;
 /** "Card {n} of {total}" */position:string;example:string;then:string;how:string};
export type CardRulesContent={
 deck:{id:string;title:string;intro:string;words:CardDeckWords;extra:string};
 offences:readonly CardOffence[];
 next:{id:string;title:string;yellow:{title:string;points:readonly string[]};red:{title:string;points:readonly string[]}};
 compare:{id:string;title:string;head:readonly string[];rows:readonly (readonly string[])[]};
 side:{id:string;title:string;items:readonly {q:string;a:string}[]};
 sources:{line:string;links:readonly {name:string;url:string}[]};
 game:CallGame;
};
const IFAB='https://www.theifab.com/laws/latest/';
const Y_NEXT='The player stays on and keeps playing. A second yellow card in the same game means a red card.';
const R_NEXT='The player leaves the field for the rest of the game, and the team plays one player short. No one can replace them.';
export const CARD_RULES:CardRulesContent={
 deck:{id:'card-rules',title:'The 7 yellow card and 7 red card offenses',
  intro:'These are the reasons a referee can show a card to a player, from Law 12 of the Laws of the Game. Flip a card to see what it means, an example and what happens next.',
  words:{label:'Card offenses',yellow:'Yellow card',red:'Red card',flip:'Flip',flipBack:'Flip back',prev:'Previous card',next:'Next card',position:'Card {n} of {total}',
   example:'Example',then:'What happens next',how:'Swipe, or use the arrows. Tap a card to flip it.'},
  extra:'The Laws also list a few offenses that only come up in top games with video referees (going into the referee review area, too many “TV screen” signals, going into the video room), plus some that a competition may choose to add.'},
 offences:[
  {id:'unsporting',color:'yellow',icon:'mask',name:'Unsporting behavior',
   explain:'Playing unfairly or trying to cheat. This includes a reckless foul (done without caring if the other player gets hurt), a foul or handball that stops a promising attack, diving and handling the ball to try to score.',
   example:'A player falls over in the penalty area, hoping for a penalty, but no one touched them.',next:Y_NEXT},
  {id:'dissent',color:'yellow',icon:'talk',name:'Dissent',
   explain:'Arguing against the referee’s decision, with words or with actions.',
   example:'A player shouts at the referee and keeps arguing after a free kick is given to the other team.',next:Y_NEXT},
  {id:'persistent',color:'yellow',icon:'repeat',name:'Breaking the rules again and again',
   explain:'Fouling or breaking the rules over and over. The Laws call it persistent offenses and give no set number: the referee decides when it is too many.',
   example:'A defender trips the same winger for the third time in the half.',next:Y_NEXT},
  {id:'delaying',color:'yellow',icon:'clock',name:'Delaying the restart',
   explain:'Wasting time when the game should start again: kicking or carrying the ball away after the whistle, or taking a free kick from the wrong place on purpose so it has to be taken again.',
   example:'The referee gives a free kick to the other team, and a player picks up the ball and walks away with it.',next:Y_NEXT},
  {id:'distance',color:'yellow',icon:'distance',name:'Not backing up at a restart',
   explain:'Standing too close when the other team restarts with a free kick, corner kick, throw-in or dropped ball. At a free kick or corner, opponents must be 10 yards (9.15 m) away.',
   example:'A player stands right in front of the ball at the other team’s free kick and will not move back.',next:Y_NEXT},
  {id:'entering',color:'yellow',icon:'enter',name:'Coming on without permission',
   explain:'Going onto the field, or back onto it, without the referee saying yes. A player who stepped off to fix a boot waits for the referee’s signal.',
   example:'A player who went off to change a boot runs straight back into the game without waiting for the referee.',next:Y_NEXT},
  {id:'leaving',color:'yellow',icon:'leave',name:'Leaving without permission',
   explain:'Walking off the field on purpose without the referee’s permission. Running over the line while playing the ball is fine.',
   example:'During play, a player walks off to the bench to get a drink without asking the referee.',next:Y_NEXT},
  {id:'serious-foul',color:'red',icon:'studs',name:'Serious foul play',
   explain:'A tackle or challenge for the ball that puts an opponent’s safety in danger or uses far too much force.',
   example:'A player slides in late with studs up and hits an opponent’s ankle.',next:R_NEXT},
  {id:'violent',color:'red',icon:'fist',name:'Violent conduct',
   explain:'Using, or trying to use, far too much force against someone when not going for the ball. It counts against an opponent, a teammate, the referee or anyone else.',
   example:'After the whistle, a player kicks out at an opponent who is nowhere near the ball.',next:R_NEXT},
  {id:'spitting',color:'red',icon:'spit',name:'Biting or spitting',
   explain:'Biting someone or spitting at someone, on or off the field.',
   example:'During an argument, a player spits at an opponent.',next:R_NEXT},
  {id:'handball-goal',color:'red',icon:'hand',name:'Handball to stop a goal',
   explain:'Stopping a goal or an obvious chance to score with a handball. A handball on purpose counts anywhere. The only exception is the goalkeeper inside their own penalty area.',
   example:'A defender on the goal line stops a shot with their hand.',next:`${R_NEXT} The other team gets a free kick or a penalty kick.`},
  {id:'foul-chance',color:'red',icon:'goal',name:'Foul to stop a clear chance to score',
   explain:'Fouling an attacker who has an obvious chance to score and is heading toward goal. Inside the penalty area, a real try to win the ball gives a penalty and a yellow card instead. Holding, pulling or pushing is still red.',
   example:'An attacker is through alone on goal, and a defender pulls them down by the shirt.',next:`${R_NEXT} The other team gets a free kick or a penalty kick.`},
  {id:'language',color:'red',icon:'mouth',name:'Offensive language or gestures',
   explain:'Using offensive, insulting or abusive words or actions toward anyone.',
   example:'A player swears at the referee and makes a rude gesture.',next:R_NEXT},
  {id:'second-yellow',color:'red',icon:'twoCards',name:'A second yellow card',
   explain:'Getting a second caution in the same game. The referee shows the yellow card again and then the red card.',
   example:'A player already shown a yellow card for arguing trips an opponent recklessly in the second half.',next:R_NEXT}],
 next:{id:'what-happens-next',title:'What happens after a yellow or red card',
  yellow:{title:'After a yellow card',points:['The player keeps playing. A yellow card is a warning, also called a caution or a booking.',
   'A second yellow card in the same game turns into a red card, and the player is sent off.',
   'If the card was for a foul, the other team also gets the free kick or penalty kick for that foul.',
   'Some competitions ban players who collect several yellow cards over a season. Check your league’s rules.']},
  red:{title:'After a red card',points:['The player leaves the field and the area around it, including the team’s bench area, and does not come back in that game.',
   'The team plays one player short for the rest of the game. No substitute can take the player’s place.',
   'If a goalkeeper is sent off, a teammate goes in goal (or a substitute comes on for a field player), and the team still plays one short.',
   'The player usually misses at least the next game. How many games is decided by the league or tournament, not by the Laws, so rules vary.',
   'In 11v11, a game cannot go on if a team has fewer than seven players.']}},
 compare:{id:'yellow-vs-red',title:'Yellow card vs red card',head:['Topic','Yellow card','Red card'],
  rows:[['What it means','A warning (a caution)','Sent off (a sending-off)'],
   ['Does the player stay on?','Yes, and keeps playing','No, leaves the field for the rest of the game'],
   ['Can the team replace the player?','No need: the player stays on','No. The team plays one short'],
   ['Two in one game','A second yellow means a red card','The game is over for that player'],
   ['Next game','Usually no effect, but some leagues ban players after several yellows','Usually a ban of at least one game; the league decides'],
   ['Who can be shown one','Players, substitutes, substituted players and team officials','Players, substitutes, substituted players and team officials'],
   ['Examples','Dissent, wasting time, a reckless foul, diving','Serious foul play, violent conduct, stopping an obvious goal with a handball']]},
 side:{id:'card-questions',title:'More questions about soccer cards',items:[
  {q:'Second yellow card vs straight red card',a:'Both send the player off, and the team plays one short either way. A second yellow is two warnings in one game; a straight red is shown for one serious offense. The ban that follows is set by the competition, and some treat a straight red more strictly than two yellows.'},
  {q:'Can coaches and substitutes get cards?',a:'Yes. Since the 2019/20 Laws of the Game, referees show yellow and red cards to coaches and other team officials, for things like arguing or leaving the bench area to protest. If the referee cannot tell who did it, the senior coach there gets the card. Substitutes, and players who have already been substituted, can be shown cards too. A substitute sent off cannot play, but the team does not lose a player on the field.'},
  {q:'Do young kids get cards in US youth and rec soccer?',a:'It depends on the league. Some leagues for young children ask referees to explain and warn instead of showing cards, and referees of young players usually talk first. Check your league’s rules for your child’s age group.'},
  {q:'How many games do you miss for a red card?',a:'The Laws of the Game do not say. Each league, tournament or association sets its own rules. Missing at least the next game is common, and a serious offense can mean a longer ban.'},
  {q:'What is a sin bin in soccer?',a:'A sin bin, or temporary dismissal, is a short time out instead of a warning. The Laws allow it only in youth, veterans, disability and grassroots competitions, and only when the national association approves. The referee shows a yellow card and points to the sin bin with both arms. The player sits out for 10 to 15 percent of the game (10 minutes in a 90-minute game), and the team plays short until they come back. Some competitions use it for every yellow card, others only for some, such as dissent.'},
  {q:'What is Portugal’s white card?',a:'The Portuguese Football Federation uses a white card to praise fair play, such as helping someone who is hurt. It was first shown in a top-level game in January 2023, to the medical staff of both teams after they helped a fan who fell ill. It is a fair-play idea, not part of the Laws of the Game, and it does not punish anyone.'}]},
 sources:{line:'Sources: IFAB Laws of the Game, Law 12 (fouls and misconduct) and Law 3 (the players), and the IFAB guidelines for temporary dismissals.',
  links:[{name:'Law 12: fouls and misconduct (The IFAB)',url:`${IFAB}fouls-and-misconduct/`},{name:'Law 3: the players (The IFAB)',url:`${IFAB}the-players/`},
   {name:'Guidelines for temporary dismissals (The IFAB)',url:`${IFAB}guidelines-for-temporary-dismissals/`},
   {name:'Portugal’s white card (Euronews)',url:'https://www.euronews.com/2023/01/25/referee-shows-a-white-card-for-the-first-time-in-football-history-but-why'}]},
 game:{id:'card-game',
  choices:[{id:'none',label:'No card',swipe:'left'},{id:'yellow',label:'Yellow',swipe:'up'},{id:'red',label:'Red',swipe:'right'}],
  scenarios:[
   {id:'studs',text:'A defender slides in late with studs up and crashes into an opponent’s ankle.',answer:'red',why:'That endangers the opponent’s safety: serious foul play.'},
   {id:'accident-trip',text:'Two players chase the ball, and one trips the other by accident.',answer:'none',why:'A careless foul gives a free kick, but no card.'},
   {id:'argue',text:'A player shouts at the referee and keeps arguing about a throw-in.',answer:'yellow',why:'Arguing with the referee is dissent, a yellow card.'},
   {id:'pull-back',text:'An attacker is through alone on goal, and a defender pulls them down from behind outside the penalty area.',answer:'red',why:'A foul that stops an obvious chance to score is a red card.'},
   {id:'dive',text:'A player falls over to pretend they were fouled, but no one touched them.',answer:'yellow',why:'Trying to trick the referee is unsporting behavior.'},
   {id:'goal-line-hand',text:'A defender on the goal line stops a shot with their hand.',answer:'red',why:'Stopping a goal with a handball is a red card, plus a penalty kick.'},
   {id:'keeper-catch',text:'The goalkeeper catches the ball inside their own penalty area.',answer:'none',why:'That is the goalkeeper’s job. No foul at all.'},
   {id:'kick-away',text:'The referee gives the other team a free kick, and a player kicks the ball far away.',answer:'yellow',why:'Kicking the ball away delays the restart, a yellow card.'},
   {id:'second-argue',text:'A player who already has a yellow card argues with the referee again.',answer:'red',why:'A second yellow card in the same game means a red card.'},
   {id:'wall',text:'At the other team’s free kick, a player stands right in front of the ball and will not back up.',answer:'yellow',why:'Not giving the distance at a restart is a yellow card.'},
   {id:'heads',text:'Two players jump for a header and bump heads by accident.',answer:'none',why:'An accident while both go for the ball is not a foul.'},
   {id:'spit',text:'During an argument, a player spits at an opponent.',answer:'red',why:'Spitting at someone is always a red card.'},
   {id:'help-up',text:'A player fouls an opponent by mistake, says sorry and helps them up.',answer:'none',why:'A careless foul gives a free kick, and being kind earns no card.'},
   {id:'walk-off',text:'During play, a player walks off the field to get a drink without asking the referee.',answer:'yellow',why:'Leaving the field on purpose without permission is a yellow card.'},
   {id:'kick-out',text:'After the whistle, a player kicks out at an opponent who is nowhere near the ball.',answer:'red',why:'Using force when not going for the ball is violent conduct.'}],
  levels:[{min:0,name:'Trainee referee',line:'Every referee starts here. Read the cards above and try again.'},
   {min:.5,name:'Youth league referee',line:'Good calls. A few more and you are ready for bigger games.'},
   {min:.8,name:'Cup final referee',line:'Sharp eyes. You know your cards.'},
   {min:1,name:'World Cup final referee',line:'Every call right. The players would trust you with the whistle.'}],
  words:{title:'Yellow, red or nothing?',intro:'You are the referee. Read what happened and make the call: yellow card, red card or no card.',start:'Start the game',again:'Play again',next:'Next',finish:'See my score',
   progress:'Scenario {n} of {total}',how:'Swipe up for yellow, right for red, left for no card. Or tap a button.',right:'Right call!',wrong:'Not quite.',
   answerIs:'The right call: {call}.',score:'You got {score} of {total} right.',levelIs:'Your referee level:',privacy:'Nothing you pick is saved or sent.',
   noScript:'This game needs JavaScript. The 14 card offenses above have every answer.'}},
};
