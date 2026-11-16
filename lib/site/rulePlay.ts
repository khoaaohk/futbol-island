import type {CallGame,CallGameWords,CallLevel} from './refCall';
import type {DeckSlide,DeckWords} from './ruleDeck';
/**
 * The swipeable deck and the "make the call" game for four rule pages (Nov 16 2026, after the yellow and red cards page,
 * lib/site/cardRules.ts): /learn/soccer-rules/back-pass-rule, throw-in, handball and fouls-and-free-kicks. Same components
 * (components/site/CardDeck.tsx, RefCallGame.tsx) through components/site/RulePlaySections.tsx. The Spanish words are
 * lib/i18n/es/rulePlay.ts: same shape, same ids, order and answers. Tests: tests/rules-games.cjs.
 *
 * SOURCES (checked Nov 16 2026 on theifab.com /laws/latest/, the menu offering 2026/27 and 2025/26):
 *  - Law 12 https://www.theifab.com/laws/latest/fouls-and-misconduct/ . Handling: "the upper boundary of the arm is in line with
 *    the bottom of the armpit"; "Not every touch of a player's hand/arm with the ball is an offence"; offences: deliberately
 *    touches (e.g. moving the hand/arm towards the ball), touches when the hand/arm "has made their body unnaturally bigger"
 *    (position "not a consequence of, or justifiable by, the player's body movement"), scores "directly from their hand/arm,
 *    even if accidental, including by the goalkeeper" or "immediately after the ball has touched their hand/arm, even if
 *    accidental". Only the scorer's own touch stops a goal (the 2021/22 change: a team-mate's accidental handball before a
 *    goal is no longer an offence). Goalkeeper: same restrictions as any player outside the penalty area. Direct free kick:
 *    charges, jumps at, kicks, pushes, strikes, tackles or challenges, trips (careless, reckless or excessive force); holds;
 *    impedes with contact; bites or spits; throws an object at the ball, an opponent or a match official; handball.
 *    Indirect free kick: dangerous manner; impedes without contact; dissent and verbal offences; prevents the goalkeeper
 *    releasing the ball; goalkeeper in own area touching the ball with the hand/arm after releasing it before another player
 *    touches it, or when "deliberately kicked to the goalkeeper by a team-mate", or "directly from a throw-in taken by a
 *    team-mate"; "initiates a deliberate trick for the ball to be passed (including from a free kick or goal kick) to the
 *    goalkeeper ... whether or not the goalkeeper touches the ball with the hands" = indirect free kick and a caution (12.4).
 *    Eight seconds in the keeper's hands = corner kick (12.3).
 *  - Law 13 https://www.theifab.com/laws/latest/free-kicks/ : an indirect free kick for the attackers inside the goal area is
 *    taken from the goal area line nearest the offence; the kicker may not touch the ball again before another player
 *    (indirect free kick); opponents 9.15 m unless on their own goal line between the posts.
 *  - Law 15 https://www.theifab.com/laws/latest/the-throw-in/ : face the field, part of each foot on the touchline or on the
 *    ground outside it, both hands, from behind and over the head, from where the ball left the field; incorrect throw =
 *    retaken by the opponents; opponents 2 m, and unfairly distracting or impeding the thrower = caution (and an indirect free
 *    kick if the throw was taken); no goal directly (goal kick, or a corner kick into the thrower's own goal); no offside
 *    from a throw-in; the thrower touching again = indirect free kick (handling = direct free kick); throwing the ball at an
 *    opponent to play it again is allowed unless careless, reckless or with excessive force.
 *  - Law 11 (offside): the restart is an indirect free kick.
 * The fouls game's situations all happen away from the penalty areas, so "direct" never becomes a penalty kick.
 */
export type RulePlayContent={
 deck:{id:string;title:string;intro:string;words:DeckWords};
 slides:readonly DeckSlide[];
 game:CallGame;
};
export const RULE_PLAY_SLUGS=['back-pass-rule','throw-in','handball','fouls-and-free-kicks'] as const;
export type RulePlaySlug=typeof RULE_PLAY_SLUGS[number];
const deckWords=(label:string,kinds:DeckWords['kinds']):DeckWords=>({label,kinds,flip:'Flip',flipBack:'Flip back',prev:'Previous card',next:'Next card',
 position:'Card {n} of {total}',example:'Example',then:'What happens',how:'Swipe, or use the arrows. Tap a card to flip it.'});
const gameWords=(w:Pick<CallGameWords,'title'|'intro'|'how'|'noScript'>):CallGameWords=>({...w,start:'Start the game',again:'Play again',next:'Next',finish:'See my score',
 progress:'Scenario {n} of {total}',right:'Correct!',wrong:'Not quite.',answerIs:'The right call: {call}.',score:'You got {score} of {total} right.',
 levelIs:'Your referee level:',privacy:'Nothing you pick is saved or sent.'});
const levels=(top:string):CallLevel[]=>[{min:0,name:'Trainee referee',line:'Every referee starts here. Flip through the cards above and try again.'},
 {min:.5,name:'Youth league referee',line:'Good calls. A few more and you are ready for bigger games.'},
 {min:.8,name:'Cup final referee',line:'Sharp eyes. You know this rule.'},
 {min:1,name:'World Cup final referee',line:top}];

export const RULE_PLAY:Record<RulePlaySlug,RulePlayContent>={
 // ---- back-pass ----------------------------------------------------------------------------------------------------------
 'back-pass-rule':{
  deck:{id:'back-pass-cards',title:'The back-pass rule, card by card',
   intro:'When may the goalkeeper pick up a pass from a teammate, and when not? Flip each card to see what it means, an example and what happens.',
   words:deckWords('Back-pass rule cards',{red:'Hands not allowed',pitch:'Hands allowed',yellow:'Yellow card',gold:'The free kick'})},
  slides:[
   {id:'kick',tone:'red',icon:'studs',name:'A kick back on purpose',
    explain:'When a teammate deliberately kicks the ball to the goalkeeper, the keeper may not pick it up or touch it with a hand or arm.',
    example:'A defender under pressure passes back to the keeper with the inside of the foot.',next:'The keeper plays it with the feet: a pass, a dribble or a clearance.'},
   {id:'throw-in',tone:'red',icon:'throw',name:'A throw-in to the keeper',
    explain:'When a teammate takes a throw-in straight to their own goalkeeper, the keeper may not handle it either.',
    example:'A right back throws the ball in to the keeper, who is standing in the penalty area.',next:'The keeper controls it with the feet, a thigh or the chest.'},
   {id:'head',tone:'pitch',icon:'head',name:'Header, chest or knee back',
    explain:'The rule is only about kicks and throw-ins. The keeper may pick up a ball that a teammate heads, chests or knees back.',
    example:'A defender heads a high ball back, and the keeper catches it.',next:'Play goes on. The catch is fine.'},
   {id:'miskick',tone:'pitch',icon:'deflect',name:'A miskick or a deflection',
    explain:'The kick has to be on purpose and meant for the keeper. A ball that flies off a teammate’s foot by mistake may be picked up.',
    example:'A defender tries to clear the ball, slices it, and it rolls to the keeper.',next:'The keeper may pick it up.'},
   {id:'trick',tone:'yellow',icon:'trick',name:'A trick to get around it',
    explain:'Flicking the ball up to head or knee it back to the keeper, just to dodge the rule, is not allowed. That counts at a free kick or goal kick too.',
    example:'A defender flicks the ball up with a foot and heads it back to the keeper.',
    next:'A yellow card for the player who started the trick, and an indirect free kick to the other team, even if the keeper never touches the ball.'},
   {id:'free-kick',tone:'gold',icon:'whistle',name:'The indirect free kick',
    explain:'If the keeper does handle a back-pass, the other team gets an indirect free kick from the place where the keeper touched the ball. It is not a penalty kick.',
    example:'The keeper picks up a back-pass inside the small goal area, six yards from goal.',
    next:'The kick moves out to the goal area line. Defenders stand 10 yards away, or on their own goal line between the posts.'}],
  game:{id:'back-pass-game',
   choices:[{id:'no',label:'No, feet only',swipe:'left',tone:'red'},{id:'yes',label:'Yes, pick it up',swipe:'right',tone:'pitch'}],
   scenarios:[
    {id:'foot-pass',text:'A defender passes the ball back to the keeper with the inside of the foot.',answer:'no',why:'A kick to the keeper on purpose: feet only, or the other team gets an indirect free kick.'},
    {id:'header',text:'A defender heads a high ball back to the keeper.',answer:'yes',why:'Headers are not part of the back-pass rule.'},
    {id:'chest',text:'A midfielder chests the ball down, and it drops gently to the keeper.',answer:'yes',why:'The chest is fine. Only kicks and throw-ins count.'},
    {id:'throw-in',text:'A teammate takes a throw-in straight to the keeper.',answer:'no',why:'A throw-in from a teammate works like a back-pass: feet only.'},
    {id:'slice',text:'A defender tries to clear the ball, slices it by mistake, and it rolls to the keeper.',answer:'yes',why:'It was not kicked to the keeper on purpose.'},
    {id:'shot',text:'An attacker shoots, and the keeper catches the ball in the penalty area.',answer:'yes',why:'A ball from the other team can be caught inside the box.'},
    {id:'flick',text:'A defender flicks the ball up with a foot, then heads it back to the keeper.',answer:'no',why:'That is a trick to get around the rule: a yellow card and an indirect free kick.'},
    {id:'outside',text:'The keeper runs out of the penalty area and picks up a loose ball.',answer:'no',why:'Outside the box the keeper may never use the hands: that is a handball and a direct free kick.'},
    {id:'free-kick',text:'A defender takes a free kick and passes it to the keeper.',answer:'no',why:'A free kick is a kick too, so the keeper must use the feet.'},
    {id:'foot-first',text:'A teammate kicks the ball back. The keeper stops it with a foot, then picks it up.',answer:'no',why:'Stopping it with a foot first changes nothing: it still came from a teammate’s kick.'},
    {id:'corner',text:'The other team takes a corner kick, and the keeper jumps to catch the cross.',answer:'yes',why:'A cross from the other team can be caught in the box.'},
    {id:'tackle',text:'A defender tackles an attacker, and the ball squirts back to the keeper by accident.',answer:'yes',why:'It was not a pass to the keeper, so the hands are allowed.'},
    {id:'long',text:'A defender kicks a long pass back from near the halfway line, and it bounces to the keeper.',answer:'no',why:'Any distance, any kind of kick: a deliberate kick to the keeper means feet only.'}],
   levels:levels('Every call right. You could teach the back-pass rule to the whole team.'),
   words:gameWords({title:'Can the keeper pick it up?',intro:'You are the referee. A ball comes back to the goalkeeper inside their own penalty area (unless the card says otherwise). Can the keeper pick it up, or is it feet only?',
    how:'Swipe right for yes, left for no. Or tap a button.',noScript:'This game needs JavaScript. The cards above have every answer.'})}},
 // ---- throw-in -----------------------------------------------------------------------------------------------------------
 'throw-in':{
  deck:{id:'throw-in-cards',title:'How to take a throw-in, card by card',
   intro:'What makes a good throw-in, what makes a foul throw, and a few rules people forget. Flip each card to see what it means, an example and what happens.',
   words:deckWords('Throw-in rule cards',{pitch:'Good throw',red:'Foul throw',gold:'Good to know'})},
  slides:[
   {id:'hands',tone:'pitch',icon:'throw',name:'Both hands, behind and over the head',
    explain:'The ball goes back behind the head and comes over the top, thrown with both hands.',
    example:'A player holds the ball in both hands, takes it back behind the head and throws it up the line.',next:'A good throw, and play goes on.'},
   {id:'feet',tone:'pitch',icon:'feet',name:'Part of each foot on or behind the line',
    explain:'When the ball leaves the hands, part of each foot must be on the touchline or on the ground outside it. The feet do not have to be flat.',
    example:'A thrower drags the toe of the back foot along the ground while throwing.',next:'Fine, as long as part of each foot stays down on or behind the line.'},
   {id:'spot',tone:'pitch',icon:'spot',name:'Face the field, from the right spot',
    explain:'The thrower faces the field and takes the throw from the place where the ball went out.',
    example:'The ball went out near the corner flag, so the throw is taken there, not 15 yards up the line.',next:'A throw from the wrong place is taken wrong, so it goes to the other team.'},
   {id:'foul',tone:'red',icon:'cross',name:'A foul throw',
    explain:'One hand, a throw from beside the head, both feet off the ground, or a foot fully inside the field: each one is a foul throw.',
    example:'A player jumps while throwing, and both feet are in the air when the ball leaves the hands.',
    next:'The other team takes the throw-in from the same place. Some leagues let the youngest players try again.'},
   {id:'twice',tone:'red',icon:'repeat',name:'No second touch',
    explain:'After the throw, the thrower may not touch the ball again until another player has touched it.',
    example:'A player throws the ball to the ground in front of them and runs on to kick it.',next:'An indirect free kick to the other team. Touching it with a hand gives a direct free kick.'},
   {id:'distance',tone:'gold',icon:'distance',name:'Opponents 2 yards back',
    explain:'Opponents must stand at least 2 meters, about 2 yards, from the place where the throw is taken.',
    example:'A defender stands right in front of the thrower and jumps about to put them off.',
    next:'A yellow card for the defender. If the throw was already taken, the thrower’s team also gets an indirect free kick.'},
   {id:'no-goal',tone:'gold',icon:'goal',name:'No goal straight from a throw',
    explain:'A goal cannot be scored directly from a throw-in. Someone else has to touch the ball first.',
    example:'A long throw flies over everyone and drops straight into the other team’s goal.',next:'No goal: it is a goal kick. Straight into your own goal, it is a corner kick.'},
   {id:'offside',tone:'gold',icon:'flag',name:'No offside from a throw-in',
    explain:'A player who gets the ball straight from a throw-in cannot be offside, wherever they stand.',
    example:'An attacker stands behind the last defender and receives a throw-in.',next:'Play goes on. The receiver is not offside.'}],
  game:{id:'throw-in-game',
   choices:[{id:'foul',label:'Foul throw',swipe:'left',tone:'red'},{id:'good',label:'Good throw',swipe:'right',tone:'pitch'}],
   scenarios:[
    {id:'textbook',text:'A player throws with both hands from behind the head, with both feet behind the line.',answer:'good',why:'Two hands, over the head, feet behind the line: a good throw.'},
    {id:'one-hand',text:'A player throws the ball in with one hand, like a baseball.',answer:'foul',why:'A throw-in needs both hands. The other team gets the throw.'},
    {id:'jump',text:'A player jumps, and both feet are in the air when the ball leaves the hands.',answer:'foul',why:'Part of each foot must be on the ground. The other team gets the throw.'},
    {id:'on-line',text:'The thrower stands with both heels on the touchline.',answer:'good',why:'The line counts: standing on it is fine.'},
    {id:'step-in',text:'The thrower steps forward, and both feet are fully inside the field when they let go.',answer:'foul',why:'Part of each foot must stay on the line or behind it. The other team gets the throw.'},
    {id:'toe-drag',text:'The thrower drags the toe of the back foot along the ground while throwing.',answer:'good',why:'The toe stays on the ground behind the line, so it is fine.'},
    {id:'side',text:'The ball comes from beside the thrower’s ear, not over the head.',answer:'foul',why:'The ball must come from behind and over the head. The other team gets the throw.'},
    {id:'run-up',text:'The thrower runs up and stops with part of each foot on the ground behind the line, then throws.',answer:'good',why:'A run-up is allowed. What counts is the feet when the ball leaves the hands.'},
    {id:'wrong-spot',text:'The ball went out by the corner flag, but the throw is taken 15 yards further up the line.',answer:'foul',why:'A throw is taken where the ball went out. The other team gets it.'},
    {id:'flip',text:'A player does a front flip, lands with both feet behind the line and throws with both hands over the head.',answer:'good',why:'A flip throw is fine if the feet and the hands follow the rule.'},
    {id:'backwards',text:'The thrower turns to face the crowd, with their back to the field, and throws over their head.',answer:'foul',why:'The thrower must face the field. The other team gets the throw.'},
    {id:'spin',text:'The ball spins sideways as it flies, but it was thrown with both hands from behind the head.',answer:'good',why:'Spin is not in the rules. The hands and the feet are what count.'},
    {id:'bounce',text:'The thrower throws the ball gently off an opponent’s back on purpose and plays it again.',answer:'good',why:'Allowed, as long as it is not careless or thrown too hard.'}],
   levels:levels('Every call right. You could be the assistant referee with the flag.'),
   words:gameWords({title:'Good throw or foul throw?',intro:'You are the referee. Read how the throw-in was taken and make the call. A foul throw gives the throw to the other team.',
    how:'Swipe right for a good throw, left for a foul throw. Or tap a button.',noScript:'This game needs JavaScript. The cards above have every answer.'})}},
 // ---- handball -----------------------------------------------------------------------------------------------------------
 handball:{
  deck:{id:'handball-cards',title:'What counts as handball, card by card',
   intro:'Not every touch on a hand or arm is a handball. Flip each card to see what the Laws of the Game say, an example and what happens.',
   words:deckWords('Handball rule cards',{red:'Handball',pitch:'Not handball',gold:'Good to know'})},
  slides:[
   {id:'on-purpose',tone:'red',icon:'hand',name:'Touching it on purpose',
    explain:'Moving a hand or arm to the ball, or using it to stop, catch or control the ball on purpose.',
    example:'A defender reaches out and pushes the ball away with a hand.',next:'A direct free kick to the other team, or a penalty kick in the defender’s own penalty area.'},
   {id:'bigger',tone:'red',icon:'bigger',name:'Making the body bigger',
    explain:'An arm held away from the body, in a way the player’s movement does not explain, makes the body unnaturally bigger. If the ball hits it, it is handball, even by accident.',
    example:'In the wall, a player stretches both arms out wide, and the free kick hits an arm.',next:'A direct free kick, or a penalty kick in the defender’s own penalty area.'},
   {id:'scorer',tone:'red',icon:'goal',name:'Scoring off your hand or arm',
    explain:'A goal does not count if the scorer’s own hand or arm sent the ball in, or touched it just before, even by accident. That goes for the goalkeeper too.',
    example:'The ball bounces off an attacker’s arm, and the same attacker shoots it straight in.',next:'No goal. The other team gets a direct free kick.'},
   {id:'teammate',tone:'pitch',icon:'pass',name:'An accident, then a teammate scores',
    explain:'Since 2021, only the scorer’s own hand or arm stops a goal. If the ball hits an attacker’s arm by accident and a teammate then scores, the goal counts.',
    example:'A shot hits an attacker’s arm, held by their side, and drops to a teammate, who scores.',next:'Goal, unless the arm had made the body bigger.'},
   {id:'shoulder',tone:'pitch',icon:'shoulder',name:'The shoulder is not the arm',
    explain:'The arm starts at the bottom of the armpit. Above that line, the shoulder is allowed, just like the chest.',
    example:'A cross hits a player on the top of the shoulder and drops to their feet.',next:'Play on.'},
   {id:'close',tone:'pitch',icon:'close',name:'Arm close to the body',
    explain:'A ball that hits an arm held close to the body, or an arm moving naturally as the player runs, jumps or falls, is usually not handball. The referee decides.',
    example:'A shot from close range hits a defender’s arm, which is down by their side.',next:'Usually play on.'},
   {id:'keeper',tone:'gold',icon:'gloves',name:'Goalkeepers in their own penalty area',
    explain:'The goalkeeper may handle the ball inside their own penalty area, except a teammate’s deliberate kick or throw-in to them. Outside it, the keeper is like any other player.',
    example:'The keeper dives and catches a shot inside their own penalty area.',
    next:'Fine inside the box. Handling a back-pass gives an indirect free kick; handling outside the box gives a direct free kick.'}],
  game:{id:'handball-game',
   choices:[{id:'not',label:'Not handball',swipe:'left',tone:'pitch'},{id:'handball',label:'Handball',swipe:'right',tone:'red'}],
   scenarios:[
    {id:'slap',text:'A defender reaches up and slaps the ball away with a hand.',answer:'handball',why:'Moving the hand to the ball on purpose is handball.'},
    {id:'by-side',text:'A shot hits a defender’s arm, which is down by their side.',answer:'not',why:'The arm is close to the body and did not make it bigger.'},
    {id:'wall',text:'In the wall, a player stretches both arms out wide, and the free kick hits an arm.',answer:'handball',why:'Arms out wide make the body unnaturally bigger.'},
    {id:'shoulder',text:'A cross hits a player on the shoulder, just above the armpit.',answer:'not',why:'The arm starts at the bottom of the armpit, so the shoulder is fine.'},
    {id:'goal-off-hand',text:'The ball bounces off an attacker’s hand and goes straight into the goal.',answer:'handball',why:'A goal straight off the scorer’s hand never counts, even by accident.'},
    {id:'teammate-scores',text:'The ball hits an attacker’s arm (held by their side) by accident and drops to a teammate, who scores.',answer:'not',why:'Since 2021, a teammate’s goal after an accidental touch counts.'},
    {id:'keeper-box',text:'The goalkeeper dives and catches a shot inside their own penalty area.',answer:'not',why:'Inside their own box, the keeper may use the hands.'},
    {id:'keeper-out',text:'The goalkeeper catches the ball just outside their penalty area.',answer:'handball',why:'Outside the box the keeper is like any other player: a direct free kick.'},
    {id:'fall',text:'A player slips, and the ball hits the hand they put down to break the fall.',answer:'not',why:'A hand put down to land on is part of falling, so it is usually not handball.'},
    {id:'arms-up',text:'A defender jumps to block a cross with both arms high above the head, and the ball hits a hand.',answer:'handball',why:'Arms up high are not part of a normal jump, so the body was made bigger.'},
    {id:'whistle',text:'A player hears a whistle from the next field, thinks play has stopped and catches the ball.',answer:'handball',why:'Catching the ball is a touch on purpose. Play only stops for the game’s own referee.'},
    {id:'chest',text:'The ball hits a player on the chest and bounces away.',answer:'not',why:'The chest is not the arm.'},
    {id:'arm-then-shot',text:'The ball hits an attacker’s arm, and the same attacker shoots it in right away.',answer:'handball',why:'If the scorer touched it with the arm just before, the goal does not count.'}],
   levels:levels('Every call right. Even the video referee would agree with you.'),
   words:gameWords({title:'Handball or not?',intro:'You are the referee. Read what happened and decide: handball, or not handball?',
    how:'Swipe right for handball, left for not handball. Or tap a button.',noScript:'This game needs JavaScript. The cards above have every answer.'})}},
 // ---- fouls and free kicks -----------------------------------------------------------------------------------------------
 'fouls-and-free-kicks':{
  deck:{id:'free-kick-cards',title:'Direct or indirect: the fouls, card by card',
   intro:'Which fouls give a direct free kick, which give an indirect one, and when the referee lets play go on. Flip each card to see what it means, an example and what happens.',
   words:deckWords('Foul and free kick cards',{red:'Direct free kick',gold:'Indirect free kick',pitch:'Play on'})},
  slides:[
   {id:'contact',tone:'red',icon:'trip',name:'Kicks, trips, pushes and charges',
    explain:'Kicking, tripping, pushing, charging, jumping at, striking or tackling an opponent in a careless or reckless way, or with too much force.',
    example:'A defender trips an attacker who is dribbling past.',next:'A direct free kick: it may be shot straight into the goal. In the defender’s own penalty area, it is a penalty kick.'},
   {id:'hold',tone:'red',icon:'hold',name:'Holding, and blocking with contact',
    explain:'Holding an opponent’s shirt or arm, or getting in their way with body contact.',
    example:'A defender grabs an attacker’s shirt to slow them down.',next:'A direct free kick.'},
   {id:'hand',tone:'red',icon:'hand',name:'Handball, spitting and throwing things',
    explain:'A handball, biting or spitting at someone, or throwing an object at the ball or at a person.',
    example:'A midfielder stops a pass with a hand.',next:'A direct free kick, and a red card for biting or spitting.'},
   {id:'danger',tone:'gold',icon:'highFoot',name:'Dangerous play',
    explain:'Playing in a way that could hurt someone, such as a high kick near a head, without touching them.',
    example:'A player kicks high near an opponent’s head and misses them.',next:'An indirect free kick. If the foot hits the opponent, it becomes a direct free kick.'},
   {id:'impede',tone:'gold',icon:'block',name:'Blocking without contact',
    explain:'Stepping into an opponent’s path to slow them down, with no contact, when neither player is playing the ball.',
    example:'A defender stands in an attacker’s way while the ball is far away.',next:'An indirect free kick.'},
   {id:'keeper',tone:'gold',icon:'gloves',name:'Goalkeeper handling mistakes',
    explain:'In their own penalty area, the keeper handles a teammate’s deliberate kick or throw-in, or handles the ball again after letting go of it before anyone else touched it.',
    example:'The keeper picks up a teammate’s pass back with the foot.',next:'An indirect free kick from where the keeper touched the ball.'},
   {id:'offside',tone:'gold',icon:'flag',name:'Offside, and kicking twice',
    explain:'An offside offense, or a player who takes a free kick and touches the ball again before anyone else does.',
    example:'An attacker in an offside position runs to the ball and plays it.',next:'An indirect free kick to the other team.'},
   {id:'play-on',tone:'pitch',icon:'shoulder',name:'Fair challenges and advantage',
    explain:'A fair shoulder-to-shoulder challenge, a clean tackle, or a bump while both players go for the ball is not a foul. And if a fouled team still has a good chance, the referee lets play go on: that is advantage.',
    example:'An attacker is fouled, but a teammate picks up the ball and runs through on goal.',next:'Play on. A card for the foul can still come at the next stop.'}],
  game:{id:'free-kick-game',
   choices:[{id:'play-on',label:'Play on',swipe:'left',tone:'pitch'},{id:'indirect',label:'Indirect',swipe:'up',tone:'gold'},{id:'direct',label:'Direct',swipe:'right',tone:'red'}],
   scenarios:[
    {id:'trip',text:'A defender trips an attacker who is dribbling past.',answer:'direct',why:'Tripping an opponent is a direct free kick foul.'},
    {id:'shirt',text:'A player pulls an opponent’s shirt to slow them down.',answer:'direct',why:'Holding an opponent is a direct free kick.'},
    {id:'high-foot',text:'A player kicks high near an opponent’s head but does not touch them.',answer:'indirect',why:'Dangerous play with no contact gives an indirect free kick.'},
    {id:'shoulder',text:'Two players run for the ball and lean shoulder to shoulder, with no elbows.',answer:'play-on',why:'A fair shoulder challenge for the ball is allowed.'},
    {id:'block',text:'A defender steps into an attacker’s path, with no contact, while the ball is far away.',answer:'indirect',why:'Blocking with no contact is impeding: an indirect free kick.'},
    {id:'hand',text:'A midfielder stops a pass with a hand.',answer:'direct',why:'Handball is a direct free kick.'},
    {id:'offside',text:'An attacker in an offside position runs to the ball and plays it.',answer:'indirect',why:'Offside always restarts with an indirect free kick.'},
    {id:'heads',text:'Two players jump for a header and bump heads by accident.',answer:'play-on',why:'No foul. If someone is hurt, the referee stops play and restarts with a drop ball.'},
    {id:'advantage',text:'A player is fouled, but a teammate gets the ball and runs through on goal.',answer:'play-on',why:'The referee plays advantage, so the team keeps its chance.'},
    {id:'clean-tackle',text:'A defender slides in, wins the ball cleanly and never touches the attacker.',answer:'play-on',why:'A clean tackle that wins the ball is not a foul.'},
    {id:'back-pass',text:'Inside their own penalty area, the goalkeeper picks up a teammate’s pass back with the foot.',answer:'indirect',why:'Handling a back-pass gives an indirect free kick.'},
    {id:'spit',text:'During an argument, a player spits at an opponent.',answer:'direct',why:'Spitting is a direct free kick, and a red card.'},
    {id:'shin-guard',text:'A player throws a shin guard at the ball to stop a pass.',answer:'direct',why:'Throwing an object at the ball is a direct free kick.'},
    {id:'twice',text:'A player takes a free kick and touches the ball again before anyone else does.',answer:'indirect',why:'The kicker may not touch it twice in a row: an indirect free kick.'}],
   levels:levels('Every call right. You know your direct from your indirect.'),
   words:gameWords({title:'Direct, indirect or play on?',intro:'You are the referee. Everything happens in midfield, away from the penalty areas, unless the card says otherwise. Is it a direct free kick, an indirect free kick, or play on?',
    how:'Swipe right for direct, up for indirect, left for play on. Or tap a button.',noScript:'This game needs JavaScript. The cards above have every answer.'})}},
};
export const isRulePlaySlug=(slug:string):slug is RulePlaySlug=>(RULE_PLAY_SLUGS as readonly string[]).includes(slug);
