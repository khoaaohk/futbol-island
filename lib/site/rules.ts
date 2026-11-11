import {lessonById,type SiteLesson} from './lessons';
import {exhibitById,exhibitPath} from './exhibits';
import type {Faq} from './safety';
import {gameLink} from './games';
import {scene,type RawScene,type Scene} from './scenes';
/**
 * The RULES cluster (SEO cluster 2, Nov 10 2026): /learn/soccer-rules and one page per rule under it. All page words live here
 * as typed data; the routes under app/(site)/learn/soccer-rules only render it. US searchers say "soccer", so these pages lead
 * with "soccer" and say "football" once near the top (lib/site/guides.ts GUIDE_NAMES). The older lesson hub
 * /learn/football-rules-for-kids stays as it is and is linked from here.
 *
 * SOURCES (all checked Nov 10 2026; nothing here is written from memory):
 *  - IFAB Laws of the Game, the edition served at /laws/latest/ on that day (the site's menu offered 2026/27 and 2025/26):
 *    Law 3 https://www.theifab.com/laws/latest/the-players/ · Law 5 (advantage, VAR) https://www.theifab.com/laws/latest/the-referee/
 *    Law 7 https://www.theifab.com/laws/latest/the-duration-of-the-match/ · Law 8 (kick-off, dropped ball) https://www.theifab.com/laws/latest/the-start-and-restart-of-play/
 *    Law 11 https://www.theifab.com/laws/latest/offside/ · Law 12 (fouls, handball, cards, goalkeeper) https://www.theifab.com/laws/latest/fouls-and-misconduct/
 *    Law 13 https://www.theifab.com/laws/latest/free-kicks/ · Law 14 https://www.theifab.com/laws/latest/the-penalty-kick/
 *    Law 15 https://www.theifab.com/laws/latest/the-throw-in/ · Law 16 https://www.theifab.com/laws/latest/the-goal-kick/
 *    Law 17 https://www.theifab.com/laws/latest/the-corner-kick/ · modifications for youth football https://www.theifab.com/laws/latest/general-modifications/
 *  - U.S. Soccer, Player Development Initiatives (September 2016 document; small-sided standards mandated from August 2017):
 *    4v4 at U6-U8, 7v7 at U9-U10, 9v9 at U11-U12, game times 4x10, 2x25, 2x30, the build-out line, no punts in 7v7, no deliberate
 *    heading in 4v4, 7v7 and U11 games. Read from a state association's copy of the U.S. Soccer document:
 *    https://www.wiyouthsoccer.com/wp-content/uploads/sites/168/2023/06/pdi_final_september_2016.pdf and
 *    https://www.ussoccer.com/stories/2017/08/five-things-to-know-how-smallsided-standards-will-change-youth-soccer
 *  - US Youth Soccer, Policy on Players and Playing Rules, as of December 5 2025 (Rule 302 substitutions, Rule 303 length of
 *    games and ball sizes, Rule 305 heading): https://www.usyouthsoccer.org/wp-content/uploads/sites/160/2025/12/Policy-on-Players-and-Playing-Rules-_APP-12.05.2025.pdf
 *  - FIFA Futsal Laws of the Game 2025-26 (five players, no offside, kick-in, four seconds, accumulated fouls, 10 m mark, the
 *    ball, unlimited substitutions, two periods of 20 minutes): https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf
 *  - England: The FA's Future Fit formats (3v3 at U7, 5v5 at U8-U9, 7v7 at U10-U11, 9v9 at U12-U13):
 *    https://futurefit.englandfootball.com/futurefit/faqs/what-are-pitch-and-goal-sizes-for-the-different-age-groups/index.html
 *  - IFAB Law 9 (ball touching a match official) https://www.theifab.com/laws/latest/the-ball-in-and-out-of-play/ and Law 10
 *    (penalty shoot-out, extra time) https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/
 *  - The repo's own lessons first (public/lessons/*.json), never contradicted: learn7_buildout and next7_offsideboundary (AYSO
 *    build-out examples), bld_7_usekeeper (the keeper plays a pass back with the feet), gap11_runoncue (Law 11), exp11_shortfreekick
 *    (Law 13, ten yards), set_f_throwin / expf_kickinthird / expf_cornercutback (kick-in and the four-second count),
 *    next7_dribblein (the FA's pass-in or dribble-in).
 * NOT VERIFIED and therefore not stated: the referee's arm signals (the Laws show them as pictures), the exact distances for
 * restarts on small-sided fields (leagues set them), futsal's rule for replacing a sent-off player.
 * Local leagues change details, so every page tells readers to check their own league's rules. No statistics, no named players.
 */
export type Mixup={said:string;truth:string};
export type RuleLink={path:string;name:string;line?:string};
export type Rule={slug:string;path:string;name:string;title:string;h1:string;desc:string;answer:string;law:string;lawUrl:string;scenes:Scene[];picture:string;
 refs:string[];mixups:Mixup[];formats:[string,string][];faq:Faq[];lessons:SiteLesson[];cta?:SiteLesson;exhibits:RuleLink[];links:RuleLink[]};
export const RULES_HUB_PATH='/learn/soccer-rules';
export const rulePath=(slug:string)=>`${RULES_HUB_PATH}/${slug}`;
const pick=(ids:string[])=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`rule lesson ${id} is not in the lesson catalog`);return l;});
const exhibit=(id:string):RuleLink=>{const e=exhibitById(id);if(!e)throw new Error(`rule exhibit ${id} is not in the museum`);return {path:exhibitPath(id),name:`Museum: ${e.title}`,line:`The history, in the History Museum (${e.year})`};};
const IFAB='https://www.theifab.com/laws/latest/';
const P='/learn/soccer-positions/',F='/learn/soccer-formations/';
const L={
 gk:{path:P+'goalkeeper',name:'Goalkeeper in soccer',line:'The one player who may use their hands'},
 st:{path:P+'striker',name:'Striker in soccer',line:'The player who times runs behind the defense'},
 cb:{path:P+'center-back',name:'Center back in soccer',line:'The defender in the middle of the back line'},
 fb:{path:P+'fullback',name:'Fullback in soccer',line:'The defender on the side, who often takes throw-ins'},
 wg:{path:P+'winger',name:'Winger in soccer',line:'The wide attacker who wins and takes many corners'},
 dm:{path:P+'defensive-midfielder',name:'Defensive midfielder in soccer',line:'The player who protects the middle'},
 cm:{path:P+'central-midfielder',name:'Central midfielder in soccer',line:'The link player in the middle of the field'},
 f7:{path:'/learn/7v7-soccer-formations',name:'7v7 soccer formations',line:'The shapes for U9 and U10 teams'},
 f9:{path:'/learn/9v9-soccer-formations',name:'9v9 soccer formations',line:'The shapes for U11 and U12 teams'},
 f11:{path:'/learn/11v11-soccer-formations',name:'11v11 soccer formations',line:'The full game'},
 f231:{path:F+'7v7-2-3-1',name:'2-3-1 formation (7v7)',line:'How a 7v7 team sets up on a goal kick'},
 f433:{path:F+'11v11-4-3-3',name:'4-3-3 formation (11v11)',line:'A back four that holds one line'},
 fs:{path:'/learn/futsal-for-kids',name:'Futsal lessons for kids',line:'Every futsal lesson, grouped by topic'},
 fs22:{path:F+'futsal-2-2',name:'2-2 futsal formation',line:'The first futsal shape'},
 field:{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and penalty area sizes for each age group'},
 ages:{path:'/learn/soccer-age-groups',name:'Soccer age groups',line:'U6 to U19 and which game each one plays'},
 ball:{path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5 for each age group'},
 terms:{path:'/learn/soccer-terms',name:'Soccer terms for kids',line:'Every word on this page, in plain English'},
 old:{path:'/learn/football-rules-for-kids',name:'Football rules lessons for kids',line:'The lessons that teach the rules on a moving pitch'},
} as const;
type Raw=Omit<Rule,'path'|'scenes'|'lessons'|'cta'|'exhibits'|'lawUrl'|'picture'>&{lawPage:string;scenes:RawScene[];lessonIds:string[];cta?:string;exhibitIds?:string[]};
const make=({scenes,lessonIds,cta,exhibitIds=[],lawPage,...r}:Raw):Rule=>{
 if(!/^[^.!?]+[.!?] [^.!?]+[.!?]$/.test(r.answer.replace(/U\.S\./g,'US').replace(/(\d)\.(\d)/g,'$1$2')))throw new Error(`${r.slug}: the answer must be exactly two sentences`);
 return {...r,path:rulePath(r.slug),lawUrl:IFAB+lawPage,scenes:scenes.map(scene),picture:`${r.slug}-rule.png`,lessons:pick(lessonIds),cta:cta?pick([cta])[0]:undefined,exhibits:exhibitIds.map(exhibit)};
};
const LEAGUE='These are the Laws of the Game and typical US youth standards. Your league may differ, so check its rules.';

export const RULES:readonly Rule[]=([
 // ---- offside ------------------------------------------------------------------------------------------------------------
 {slug:'offside',name:'Offside',law:'Law 11',lawPage:'offside/',
  title:'Offside Rule in Soccer, Explained for Kids',h1:'Offside in soccer, explained for kids',
  desc:'The offside rule in soccer in plain words for kids and parents: an onside and offside diagram, what the referee looks for, common mix-ups and a short FAQ.',
  answer:'In soccer, a player is in an offside position when they are in the other team’s half and closer to the goal line than both the ball and the second-last opponent at the moment a teammate plays the ball. It is only an offence if that player then gets involved in the play.',
  scenes:[
   {title:'Onside',who:'8@42,58 9@60,73 7@85,66 !4@38,74 !5@66,70 !3@14,68 !G@50,97',ball:[44,60],lineY:74,lineWord:'offside line',passes:['44,60>60,86'],runs:['60,73>61,86'],
    caption:'Number 8 passes forward. At that moment number 9 is level with the second-last opponent, a defender marked 4, so number 9 is onside and may run on to the ball. The dashed line shows the second-last opponent. The goalkeeper is the last opponent.'},
   {title:'Offside',who:'8@42,58 9@60,81 7@85,66 !4@38,74 !5@66,70 !3@14,68 !G@50,97',ball:[44,60],lineY:74,lineWord:'offside line',passes:['44,60>60,88'],
    caption:'The same pass, but number 9 has gone early. When number 8 plays the ball, number 9 is past the dashed line, with only the goalkeeper between them and the goal line. If number 9 plays the ball, the referee gives offside.'}],
  refs:['Where the attacker is at the moment the teammate plays the ball, not where they are when they receive it.',
   'The second-last opponent. The goalkeeper is usually the last one, so the line is usually the deepest defender.',
   'Head, body and feet. Hands and arms do not count, for attackers or defenders.',
   'Whether the player gets involved: plays the ball, blocks an opponent’s view or challenge, or gains an advantage from being there.',
   'Being level is onside. A player in their own half is always onside.'],
  mixups:[
   {said:'“They were offside when they got the ball.”',truth:'The position is judged when the pass is played. A player who starts onside and runs past the defenders after the pass is fine.'},
   {said:'“Standing in an offside position is a foul.”',truth:'It is not. The referee waits to see if the player gets involved in the play.'},
   {said:'“The line is the last defender.”',truth:'It is the second-last opponent. If the goalkeeper has come out, the line can be a defender and the keeper, or two defenders.'},
   {said:'“You can be offside from a throw-in.”',truth:'No. There is no offside if you receive the ball straight from a throw-in, a goal kick or a corner kick.'}],
  formats:[['7v7','In the U.S. Soccer standards offside counts in 7v7, but not between the halfway line and the build-out line. Offside can only be given between the build-out line and the goal line.'],
   ['4v4 (U6 to U8)','No offside in the U.S. Soccer standards.'],['9v9','Offside as in the full game: it starts at the halfway line.'],['11v11','Law 11 in full.'],['Futsal','There is no offside in futsal.']],
  faq:[{q:'Can you be offside from a throw-in?',a:'No. Law 11 says there is no offside offence if a player receives the ball directly from a throw-in. The same is true for a goal kick and a corner kick.'},
   {q:'Can you be offside in your own half?',a:'No. A player has to be in the other team’s half to be in an offside position. The halfway line itself counts as your own half.'},
   {q:'Is it offside if you are level with the last defender?',a:'No. Level with the second-last opponent is onside. Arms and hands are not counted when the referee compares positions.'},
   {q:'What does the referee give for offside?',a:'An indirect free kick to the other team, taken from where the offside player got involved in the play.'},
   {q:'Is there offside in 7v7 soccer?',a:'In the U.S. Soccer standards, yes, but only between the build-out line and the goal line. Your league may differ, so check its rules.'}],
  lessonIds:['gap11_runoncue','next7_offsideboundary','bld_11_throughlines','nx9_twostrikers'],cta:'gap11_runoncue',exhibitIds:['offside-rules'],links:[L.st,L.cb,L.f433,gameLink('puzzle')]},
 // ---- throw-in -----------------------------------------------------------------------------------------------------------
 {slug:'throw-in',name:'Throw-in',law:'Law 15',lawPage:'the-throw-in/',
  title:'Soccer Throw-In Rules for Kids: How to Take One',h1:'Soccer throw-in rules for kids',
  desc:'Soccer throw-in rules in plain words: both hands, from behind and over the head, feet on or behind the line. With a diagram, common mistakes and an FAQ.',
  answer:'In soccer, a throw-in restarts the game when the whole ball crosses the touchline, and it goes to the team that did not touch the ball last. The thrower faces the field, keeps part of each foot on or behind the line, and throws with both hands from behind and over the head.',
  scenes:[{title:'A throw-in',who:'2@0,62 7@16,74 8@22,58 4@14,48 !11@9,66 !6@26,66',ball:[1,63],zone:[0,58,6,66],passes:['2,62>20,58'],
   caption:'Number 2 takes the throw-in from the touchline, at the place where the ball went out. Three teammates offer a throw up the line, inside and back. The nearest opponent, number 11, stands at least 2 yards from the thrower.'}],
  refs:['The place: the throw is taken where the ball left the field.','Feet: part of each foot is on the touchline or on the ground outside it when the ball is released.',
   'Hands: both hands, and the ball comes from behind and over the head.','Opponents: at least 2 m (2 yards) from the place of the throw.','A second touch: the thrower may not touch the ball again until another player has touched it.'],
  mixups:[
   {said:'“Both feet must stay flat on the ground.”',truth:'The Law asks for part of each foot on the touchline or on the ground outside it at the moment of the throw. It does not say the feet must be flat.'},
   {said:'“You can score straight from a throw-in.”',truth:'You cannot. If the ball goes straight into the other team’s goal, it is a goal kick.'},
   {said:'“A bad throw is taken again.”',truth:'If the ball came on to the field, a wrongly taken throw-in goes to the other team. Your league may let the youngest players try again.'},
   {said:'“The ball has to spin the right way.”',truth:'Spin is not in the Law. The referee looks at the feet, the hands and the path of the ball over the head.'}],
  formats:[['7v7 and 9v9','Throw-ins as in the full game in the U.S. Soccer standards. Your league may add its own rule for the youngest players.'],['11v11','Law 15 in full.'],
   ['Futsal','No throw-ins. The ball is kicked in from the touchline within four seconds, with opponents 5 m away.'],
   ['England','The FA lets under-10s and under-11s pass the ball in or dribble it in, as our lesson Start with Your Feet shows.']],
  faq:[{q:'Can you be offside from a throw-in?',a:'No. A player who receives the ball directly from a throw-in cannot be offside.'},
   {q:'Can the goalkeeper pick up a throw-in?',a:'Not from a teammate. If a teammate throws the ball straight to their own goalkeeper, the keeper must play it with the feet. Picking it up gives the other team an indirect free kick.'},
   {q:'Can you jump or do a flip throw?',a:'Yes, if part of each foot is on or behind the line when the ball leaves the hands, and the ball is thrown with both hands from behind and over the head.'},
   {q:'How far away must defenders stand at a throw-in?',a:'At least 2 metres, which is about 2 yards, from the place where the throw is taken.'}],
  lessonIds:['next9_restartreturn','next7_dribblein','set_f_throwin','expf_kickinthird'],cta:'next9_restartreturn',exhibitIds:['throw-in'],links:[L.fb,L.wg,L.f9]},
 // ---- goal kick ----------------------------------------------------------------------------------------------------------
 {slug:'goal-kick',name:'Goal kick',law:'Law 16',lawPage:'the-goal-kick/',
  title:'Soccer Goal Kick Rules for Kids, With a Diagram',h1:'Soccer goal kick rules for kids',
  desc:'Soccer goal kick rules in plain words for kids and parents: when it is given, where the ball goes, where the other team waits, and how 7v7 changes it.',
  answer:'In soccer, a goal kick is given when the attacking team touches the ball last before the whole ball crosses the goal line and no goal is scored. A defender or the goalkeeper kicks it from anywhere inside the goal area, and the other team waits outside the penalty area until the ball is kicked.',
  scenes:[{title:'A goal kick',who:'G@44,3 4@24,8 5@76,8 6@50,24 !9@50,19 !7@22,22 !11@78,22',ball:[44,4],zone:[20.4,0,79.6,15.7],passes:['44,4>26,8'],
   caption:'The goalkeeper takes the goal kick from inside the goal area. Two defenders stand wide inside the penalty area to receive a short pass. The three opponents wait outside the shaded penalty area until the ball is kicked and clearly moves.'}],
  refs:['Who touched it last: an attacker, so it is a goal kick and not a corner.','The ball is still, and inside the goal area (the small box).',
   'Opponents are outside the penalty area until the ball is in play.','The ball is in play as soon as it is kicked and clearly moves. It does not have to leave the penalty area.',
   'The kicker does not touch it twice before someone else does.'],
  mixups:[
   {said:'“The ball has to leave the penalty area.”',truth:'Not any more. Teammates may receive a goal kick inside their own penalty area, which is why defenders stand next to the goal.'},
   {said:'“Only the goalkeeper can take it.”',truth:'Any player on the defending team may take a goal kick.'},
   {said:'“You can be offside from a goal kick.”',truth:'No. There is no offside when you receive the ball straight from a goal kick.'}],
  formats:[['7v7','In the U.S. Soccer standards the other team must drop behind the build-out line until the goal kick is taken. The goalkeeper may not punt or drop-kick in open play either.'],
   ['9v9','As in the full game. There is no build-out line.'],['11v11','Law 16 in full.'],['Futsal','No goal kick. The goalkeeper throws or releases the ball from the penalty area within four seconds. This is called a goal clearance, and it cannot score a goal directly.']],
  faq:[{q:'Can you score from a goal kick?',a:'Yes, against the other team. If the ball somehow goes straight into the kicker’s own goal, the other team gets a corner kick instead.'},
   {q:'Where do you place the ball for a goal kick?',a:'Anywhere inside the goal area, the small box in front of the goal. It does not have to be on the line or on the side where the ball went out.'},
   {q:'Can a defender stand in the box on a goal kick?',a:'Teammates of the kicker can. Opponents have to stay outside the penalty area until the ball is in play.'},
   {q:'What is the build-out line on a goal kick?',a:'A line used in US 7v7 games for under-9s and under-10s. The other team waits behind it until the goal kick is taken, so the kicking team can pass short.'}],
  lessonIds:['learn7_buildout','learn9_restart','learn11_restart','nx9_keeperthird'],cta:'learn7_buildout',links:[L.gk,L.f231,L.cb]},
 // ---- corner kick --------------------------------------------------------------------------------------------------------
 {slug:'corner-kick',name:'Corner kick',law:'Law 17',lawPage:'the-corner-kick/',
  title:'Soccer Corner Kick Rules for Kids, With a Diagram',h1:'Soccer corner kick rules for kids',
  desc:'Soccer corner kick rules in plain words for kids and parents: when a corner is given, where the ball goes, how far defenders stand, and short corners.',
  answer:'In soccer, a corner kick is given when the defending team touches the ball last before the whole ball crosses its own goal line and no goal is scored. The attacking team kicks from the corner nearest to where the ball went out, and defenders stay 10 yards from the corner until it is kicked.',
  scenes:[{title:'A corner kick',who:'7@99,99 9@46,92 10@60,86 5@52,82 8@80,88 !G@50,98 !4@44,94 !5@56,92 !3@88,96 !6@60,90',ball:[98,99],zone:[88,88,100,100],passes:['98,99>52,91'],
   caption:'Number 7 takes the corner from the corner area on the right. Attackers wait in front of the goal, and number 8 offers a short pass. The nearest defender, number 3, is outside the shaded space: at least 10 yards from the corner.'}],
  refs:['Who touched it last: a defender, so it is a corner and not a goal kick.','The ball is still, inside the corner area nearest to where it went out.',
   'Opponents are at least 9.15 m (10 yards) from the corner arc until the ball is in play.','The corner flag stays where it is. It may not be moved.',
   'Pushing and holding in front of the goal as the kick comes in.'],
  mixups:[
   {said:'“You can be offside from a corner.”',truth:'Not from the kick itself. Offside can count again on the next pass, for example after a short corner.'},
   {said:'“The ball must leave the corner area.”',truth:'It is in play as soon as it is kicked and clearly moves.'},
   {said:'“A corner cannot go straight in.”',truth:'It can. A goal may be scored directly from a corner kick against the other team.'}],
  formats:[['7v7 and 9v9','The same rule on a smaller field. The Law says 10 yards; a small-sided league may set a shorter distance in its own rules.'],['11v11','Law 17 in full.'],
   ['Futsal','The kick must be taken within four seconds and opponents stand 5 m from the corner arc. If the team takes too long, the other team gets a goal clearance.']],
  faq:[{q:'Can you score directly from a corner kick?',a:'Yes. Law 17 allows a goal to be scored directly from a corner kick, but only against the other team.'},
   {q:'Can you be offside from a corner kick?',a:'No. There is no offside when a player receives the ball directly from a corner kick.'},
   {q:'What is a short corner?',a:'A corner passed to a teammate close by instead of crossed toward the goal. It pulls a defender out and changes the angle of the next pass.'},
   {q:'Why did the referee give a corner when the goalkeeper held the ball?',a:'In the current Laws, a goalkeeper who holds the ball in the hands for more than eight seconds gives away a corner kick. The referee counts down the last five seconds with a raised hand.'}],
  lessonIds:['next9_shortcornerbudget','expf_cornercutback','expf_defendcorner','learn11_cutback'],cta:'next9_shortcornerbudget',links:[L.wg,L.cb,L.gk]},
 // ---- handball -----------------------------------------------------------------------------------------------------------
 {slug:'handball',name:'Handball',law:'Law 12',lawPage:'fouls-and-misconduct/',
  title:'Handball Rule in Soccer, Explained for Kids',h1:'Handball in soccer, explained for kids',
  desc:'The handball rule in soccer in plain words for kids and parents: what counts as a handball, what does not, where the arm starts and what the referee gives.',
  answer:'In soccer, handball is an offence when a player touches the ball with a hand or arm on purpose, or with an arm that makes the body unnaturally bigger. Not every touch of the ball on an arm is a handball, and a goalkeeper may use the hands inside their own penalty area.',
  scenes:[{title:'Where the goalkeeper may use hands',who:'G@50,8 4@34,20 5@66,20 !9@50,30 !7@80,34',ball:[50,24],zone:[20.4,0,79.6,15.7],
   caption:'The shaded penalty area is the only place where the gold goalkeeper may handle the ball. Outside it, the goalkeeper is like any other player. Everyone else may never use a hand or arm on purpose, anywhere on the field.'}],
  refs:['Did the hand or arm move toward the ball on purpose?','Was the arm in a place that made the body unnaturally bigger for what the player was doing?',
   'Where the ball touched. The arm starts at the bottom of the armpit, so the shoulder is not handball.','Did the ball go into the goal off an attacker’s hand or arm, or right after it? That goal does not count, even by accident.',
   'Where it happened: a handball by a defender inside their own penalty area is a penalty kick.'],
  mixups:[
   {said:'“It hit their hand, so it is a handball.”',truth:'The Law says not every touch is an offence. A ball that hits an arm held close to the body is usually not a handball.'},
   {said:'“The shoulder counts.”',truth:'It does not. The top of the arm is level with the bottom of the armpit.'},
   {said:'“Goalkeepers can always use their hands.”',truth:'Only inside their own penalty area, and not after a teammate deliberately kicks the ball to them or throws it to them from a throw-in.'},
   {said:'“A handball in the box is always a penalty.”',truth:'Only when a defender commits it. A handball by an attacker gives the defending team a direct free kick.'}],
  formats:[['7v7 and 9v9','The same rule. With young players, referees and coaches usually explain rather than punish an accident.'],['11v11','Law 12 in full.'],
   ['Futsal','The same handball rule. The goalkeeper may use the hands only inside the penalty area, and not after a teammate deliberately kicks the ball to them, even from a kick-in.']],
  faq:[{q:'Is it a handball if it is an accident?',a:'Usually not. The two big exceptions: if the arm made the body unnaturally bigger, and if an attacker scores with the hand or arm, or straight after the ball touched it.'},
   {q:'Is the shoulder a handball in soccer?',a:'No. The Laws put the top of the arm in line with the bottom of the armpit, so a ball played with the shoulder is fine.'},
   {q:'What does the referee give for a handball?',a:'A direct free kick, or a penalty kick if a defender handles the ball inside their own penalty area.'},
   {q:'Can a goalkeeper get a handball?',a:'Yes, outside their own penalty area. Inside it, a keeper who handles the ball when not allowed, such as a pass back from a teammate’s foot, gives away an indirect free kick.'}],
  lessonIds:['bld_7_usekeeper','bld_9_usekeeper','expf_keeperposition'],cta:'bld_7_usekeeper',exhibitIds:['keeper-hands-1912'],links:[L.gk,L.cb,L.dm]},
 // ---- fouls and free kicks -----------------------------------------------------------------------------------------------
 {slug:'fouls-and-free-kicks',name:'Fouls and free kicks',law:'Laws 12 and 13',lawPage:'free-kicks/',
  title:'Soccer Fouls and Free Kicks: Direct vs Indirect',h1:'Soccer fouls and free kicks: direct vs indirect',
  desc:'Soccer fouls and free kicks in plain words for kids: which fouls give a direct or an indirect free kick, the 10-yard rule, the wall, and a clear diagram.',
  answer:'In soccer, a foul gives the other team a free kick from the place where it happened. A direct free kick can be shot straight into the goal, and an indirect free kick has to touch another player before a goal can count.',
  scenes:[{title:'A direct free kick and the wall',who:'10@50,72 8@38,70 9@64,88 !2@44,82 !4@48,82.5 !5@52,82.5 !6@56,82 !G@56,97 !3@70,90',ball:[50,73],zone:[38,73,62,82],passes:['50,73>40,99'],
   caption:'Number 10 takes a direct free kick outside the penalty area. Four defenders make a wall 10 yards from the ball, and the shaded space between the ball and the wall stays empty. Attackers must stay at least 1 yard from a wall of three or more defenders.'}],
  refs:['Was the challenge careless, reckless or made with too much force? Careless is a foul, reckless is also a yellow card, too much force is a red card.',
   'The kind of foul. Kicking, tripping, pushing, charging, jumping at, striking, holding and handball give a direct free kick.',
   'Dangerous play with no contact, blocking an opponent’s way with no contact and stopping the goalkeeper from releasing the ball give an indirect free kick.',
   'The ball is still, and opponents are 9.15 m (10 yards) away until it is kicked.','For an indirect free kick the referee keeps one arm straight up until the ball touches another player.'],
  mixups:[
   {said:'“They got the ball, so it is not a foul.”',truth:'Touching the ball first does not make a careless or reckless challenge fair. The referee judges how the challenge was made.'},
   {said:'“Indirect means you cannot shoot.”',truth:'You can shoot, but a goal only counts if the ball touched another player from either team on the way.'},
   {said:'“You must wait for the whistle.”',truth:'A team may take a quick free kick. If the kicking team asks for the 10 yards, the referee makes everyone wait for a signal.'},
   {said:'“A high foot is always a foul.”',truth:'It is an indirect free kick only when it is dangerous to someone nearby. Contact with an opponent makes it a direct free kick.'}],
  formats:[['7v7','In the U.S. Soccer standards a deliberate header and a goalkeeper’s punt each give the other team an indirect free kick. Your league may add its own changes.'],
   ['9v9 and 11v11','Laws 12 and 13 in full. A direct free kick foul by a defender inside their own penalty area is a penalty kick.'],
   ['Futsal','Direct free kick fouls are counted for each team in each period. From a team’s sixth, the other team shoots from the 10 m mark with no wall. Free kicks are taken within four seconds, with opponents 5 m away.']],
  faq:[{q:'What is the difference between a direct and an indirect free kick?',a:'A direct free kick can score without anyone else touching the ball. An indirect free kick must touch a second player first. If it goes straight in, the other team gets a goal kick.'},
   {q:'How do I know a free kick is indirect?',a:'The referee raises one arm straight up and keeps it there until the kick has been taken and the ball touches another player or goes out of play.'},
   {q:'How far back does the wall have to be?',a:'At least 9.15 metres, which is 10 yards, from the ball. In futsal the distance is 5 metres.'},
   {q:'Is a slide tackle a foul?',a:'Not by itself in the Laws of the Game. It is a foul if it is careless, reckless or uses too much force. Youth leagues can add their own rule about slide tackles, so check yours.'}],
  lessonIds:['exp11_shortfreekick','expf_freekickbalance','trn_11_recover','def_7_goalside'],cta:'exp11_shortfreekick',exhibitIds:['free-kick-wall'],links:[L.cb,L.dm,L.gk]},
 // ---- penalty kick -------------------------------------------------------------------------------------------------------
 {slug:'penalty-kick',name:'Penalty kick',law:'Law 14',lawPage:'the-penalty-kick/',
  title:'Soccer Penalty Kick Rules for Kids, With a Diagram',h1:'Soccer penalty kick rules for kids',
  desc:'Soccer penalty kick rules in plain words: when a penalty is given, where everyone stands, what the goalkeeper may do and what happens after a save.',
  answer:'In soccer, a penalty kick is given when a defender commits a direct free kick foul, such as a trip, a push or a handball, inside their own penalty area. One attacker shoots from the penalty mark, 12 yards from the goal, with only the goalkeeper to beat.',
  scenes:[{title:'A penalty kick',who:'9@50,88 10@40,76 7@64,77 8@28,80 !G@50,99.5 !4@46,76 !5@58,76 !3@72,80',ball:[50,89.5],zone:[20.4,84.3,79.6,100],passes:['50,89.5>42,100'],
   caption:'Number 9 takes the penalty from the penalty mark. The goalkeeper is on the goal line between the posts. Every other player waits outside the shaded penalty area, behind the ball and at least 10 yards from the mark, until the ball is kicked.'}],
  refs:['The goalkeeper has at least part of one foot on, in line with or behind the goal line when the ball is kicked.','Everyone else is outside the penalty area, outside the arc and behind the penalty mark.',
   'The ball is kicked forward.','The kicker does not stop at the end of the run-up to fake the kick. Changing speed during the run-up is allowed.',
   'The kicker does not touch the ball a second time before another player touches it.'],
  mixups:[
   {said:'“Any foul in the box is a penalty.”',truth:'Only a direct free kick foul by the defending team. An indirect free kick offence, such as a goalkeeper picking up a pass back, stays an indirect free kick.'},
   {said:'“The kicker can score the rebound off the post.”',truth:'Not without another player touching the ball first. A rebound from the goalkeeper is different: the kicker may play it.'},
   {said:'“The keeper cannot move before the kick.”',truth:'The keeper may move along the goal line. One foot has to be on or level with the line at the moment of the kick.'},
   {said:'“A penalty kick and a penalty shoot-out are the same.”',truth:'A penalty kick happens during the game, and play goes on after a save. A shoot-out is a separate way to decide a tied cup game: five kicks each, taken in turns.'}],
  formats:[['7v7 and 9v9','The same rule on a smaller field, with a smaller penalty area and the mark closer to the goal. The exact distance is in your league’s field rules.'],
   ['11v11','The mark is 11 m (12 yards) from the goal line.'],['Futsal','The penalty mark is 6 m from the goal. A second mark at 10 m is used for the free kick after a team’s sixth foul in a period.']],
  faq:[{q:'How far is a penalty kick in soccer?',a:'On a full-size field the penalty mark is 11 metres from the goal line, which is 12 yards. Smaller youth fields put it closer.'},
   {q:'Can the goalkeeper come off the line on a penalty?',a:'When the ball is kicked, at least part of one foot must be touching the goal line, in line with it or behind it. After the kick the keeper is free to move.'},
   {q:'Can you pass a penalty kick?',a:'Yes. The ball has to be kicked forward, and a teammate who started outside the penalty area may run on to it. The kicker cannot touch it again first.'},
   {q:'What happens if the penalty hits the post?',a:'Play goes on. Anyone may play the ball except the kicker, who has to wait until another player has touched it.'},
   {q:'Who invented the penalty kick?',a:'The penalty kick joined the Laws in 1891. Our History Museum exhibit tells the story.'}],
  lessonIds:['next7_shotreaction','expf_keeperposition','def_7_goalside'],cta:'next7_shotreaction',exhibitIds:['penalty-1891'],links:[L.gk,L.st,L.cb]},
 // ---- yellow and red cards -----------------------------------------------------------------------------------------------
 {slug:'yellow-and-red-cards',name:'Yellow and red cards',law:'Law 12',lawPage:'fouls-and-misconduct/',
  title:'Yellow and Red Cards in Soccer, Explained for Kids',h1:'Yellow and red cards in soccer, explained for kids',
  desc:'What yellow and red cards mean in soccer, in plain words for kids and parents: what earns each card, what happens next and how youth leagues handle them.',
  answer:'In soccer, a yellow card is a warning and a red card sends a player off for the rest of the game. Two yellow cards for the same player in one game make a red card, and the team plays on with one player fewer.',
  scenes:[{title:'Stopping a clear chance to score',who:'9@52,74 7@80,66 8@40,58 !4@50,71 !5@28,72 !G@50,96',ball:[53,76],zone:[30,76,70,100],runs:['52,74>52,90'],
   caption:'Number 9 is through with only the goalkeeper ahead, and defender number 4 pulls number 9 back from behind. Stopping an obvious chance to score with a foul like this is a red card. The shaded space shows the open route to goal.'}],
  refs:['Yellow: a reckless foul, stopping a promising attack with a foul, arguing with the referee, delaying a restart, not giving the distance at a free kick, pretending to be fouled.',
   'Yellow: fouls that keep happening from the same player.','Red: a foul with far too much force (serious foul play), violent conduct, spitting or biting, insulting or abusive language.',
   'Red: stopping a goal or an obvious chance to score with a handball or a foul.','A second yellow card in the same game.'],
  mixups:[
   {said:'“A yellow card means you sit out.”',truth:'In the Laws of the Game the player stays on the field. Some youth leagues use short time-outs called sin bins, which the Laws allow for grassroots soccer.'},
   {said:'“The last defender always gets a red.”',truth:'There is no last-defender rule. The referee asks whether an obvious chance to score was stopped. Inside the penalty area, a real try for the ball that gives away a penalty is a yellow card.'},
   {said:'“A red card player can be replaced.”',truth:'No. The team plays with one player fewer for the rest of the game.'},
   {said:'“Cards are only for fouls.”',truth:'Cards are also for behavior: arguing, wasting time and unsporting acts.'}],
  formats:[['7v7 and 9v9','The same cards exist, but referees of young players usually talk first. Ask your league what happens after a card, such as missing the next game.'],
   ['11v11','Law 12 in full.'],['Futsal','Yellow and red cards are used in futsal too, and direct free kick fouls also count toward the team’s foul total.']],
  faq:[{q:'How many yellow cards make a red card?',a:'Two in the same game. The referee shows the second yellow card and then the red card.'},
   {q:'Can a goalkeeper get a red card?',a:'Yes. A goalkeeper can be sent off like any other player. Every team must have a goalkeeper, so another player goes in goal and the team plays one short.'},
   {q:'Does the referee stop the game to show a card?',a:'Not always. If the fouled team has a good attack, the referee can play advantage and show the card at the next stop.'},
   {q:'Can VAR change a card?',a:'Where video assistant referees are used, they can check straight red cards and a card shown to the wrong player. An ordinary yellow card is not one of the things they review.'}],
  lessonIds:['trn_11_recover','def_7_goalside','def_11_pressurecover'],cta:'trn_11_recover',exhibitIds:['var-2018','laws-1863'],links:[L.cb,L.dm,L.gk]},
 // ---- back-pass rule -----------------------------------------------------------------------------------------------------
 {slug:'back-pass-rule',name:'Back-pass rule',law:'Law 12',lawPage:'fouls-and-misconduct/',
  title:'The Back-Pass Rule in Soccer, Explained for Kids',h1:'The back-pass rule in soccer, explained for kids',
  desc:'The back-pass rule in soccer in plain words for kids and parents: when the goalkeeper may not pick the ball up and what is still allowed.',
  answer:'In soccer, the goalkeeper may not touch the ball with the hands when a teammate deliberately kicks it to them or throws it to them from a throw-in. The goalkeeper has to play that ball with the feet, and picking it up gives the other team an indirect free kick.',
  scenes:[{title:'A pass back to the goalkeeper',who:'G@50,7 4@32,26 5@66,24 6@46,40 !9@40,32 !7@72,34',ball:[33,24],zone:[20.4,0,79.6,15.7],passes:['33,24>48,9','52,8>66,22'],
   caption:'Defender number 4 is under pressure and passes back with the foot. The goalkeeper may not pick this ball up, even inside the shaded penalty area, so the goalkeeper plays it with the feet to the free defender, number 5.'}],
  refs:['Was the ball kicked with the foot? The rule is about a kick, and about a throw-in.','Was it deliberate, and was it meant for the goalkeeper? A miskick or a deflection is not a back-pass.',
   'Did the goalkeeper then touch it with a hand or arm inside the penalty area?','How long the goalkeeper holds the ball: more than eight seconds in the hands gives the other team a corner kick.',
   'Tricks to get around the rule, such as flicking the ball up to head it back, are not allowed.'],
  mixups:[
   {said:'“You cannot pass back to the keeper.”',truth:'You can, and good teams do it all the time. The keeper just has to use the feet.'},
   {said:'“A header back is a back-pass.”',truth:'No. A teammate may head, chest or knee the ball to the goalkeeper, and the keeper may pick it up.'},
   {said:'“It is a penalty if the keeper picks it up.”',truth:'It is an indirect free kick from where the keeper handled the ball. Inside the goal area it is taken from the goal area line.'},
   {said:'“The keeper can hold the ball as long as they like.”',truth:'The current Laws give eight seconds. After that the other team gets a corner kick.'}],
  formats:[['7v7','The same rule. In the U.S. Soccer standards the 7v7 goalkeeper also may not punt or drop-kick, so passing with the feet starts early.'],['9v9 and 11v11','Law 12 in full.'],
   ['Futsal','Stricter. After playing the ball, the goalkeeper may not touch it again in their own half from a teammate’s deliberate pass until an opponent has touched it. The keeper also has only four seconds on the ball in their own half.']],
  faq:[{q:'Can a goalkeeper pick up a back-pass?',a:'Not when a teammate deliberately kicks it to them. The keeper may pick up a ball that a teammate heads or chests back, or one that comes off a teammate by accident.'},
   {q:'Can the goalkeeper pick up a throw-in?',a:'Not a throw-in taken by a teammate and thrown straight to them. The keeper has to use the feet.'},
   {q:'What does the referee give for a back-pass?',a:'An indirect free kick to the other team, from the place where the goalkeeper touched the ball with the hands.'},
   {q:'Why does the back-pass rule exist?',a:'It keeps the game moving: a goalkeeper cannot simply pick the ball up every time a teammate passes back. It also means goalkeepers learn to pass, which our lessons practise.'}],
  lessonIds:['bld_7_usekeeper','bld_9_usekeeper','expf_keeperoverload','nx9_keeperthird'],cta:'bld_7_usekeeper',exhibitIds:['keeper-hands-1912'],links:[L.gk,L.cb,L.f231]},
 // ---- build-out line -----------------------------------------------------------------------------------------------------
 {slug:'build-out-line',name:'Build-out line',law:'U.S. Soccer 7v7 standards',lawPage:'general-modifications/',
  title:'The Build-Out Line in 7v7 Soccer, Explained',h1:'The build-out line in 7v7 soccer, explained',
  desc:'The build-out line in 7v7 soccer in plain words for kids and parents: where it is, who waits behind it, when they may cross and how offside uses it.',
  answer:'The build-out line is a line across a 7v7 soccer field, halfway between the penalty area and the halfway line, used for under-9 and under-10 games in the United States. When the goalkeeper has the ball in the hands or the team has a goal kick, the other team waits behind it until the ball is put into play.',
  scenes:[{format:'7v7',title:'The build-out line on a goal kick',who:'G@50,5 3@20,14 2@80,14 8@50,27 11@16,47 7@84,47 9@56,60 !9@50,40 !7@32,41 !11@68,41 !8@40,53 !G@50,96',ball:[50,6],lineY:35.6,lineWord:'build-out line',zone:[0,0,100,35.6],passes:['50,6>22,14'],
   caption:'Gold has a goal kick. The whole of the other team has moved back behind the dashed build-out line, so the shaded space is free. The goalkeeper passes short to a defender, and the other team may cross the line as soon as the ball is in play.'}],
  refs:['Every opponent is behind the build-out line before the goal kick is taken or the goalkeeper lets go of the ball.','The goalkeeper passes, throws or rolls the ball. Punts and drop kicks are not allowed in 7v7.',
   'Once the ball is put into play, the other team may cross the line and play goes on as normal.','Offside: a player cannot be offside between the halfway line and the build-out line.',
   'A goalkeeper who punts gives the other team an indirect free kick.'],
  mixups:[
   {said:'“The other team has to wait until a defender touches the ball.”',truth:'No. They may cross when the ball is in play: on a goal kick, when it is kicked and clearly moves; from the hands, when the keeper releases it.'},
   {said:'“The goalkeeper has to wait for everyone to drop back.”',truth:'The keeper may play quickly if they want to. Then the other team may challenge straight away.'},
   {said:'“It is used in every youth game.”',truth:'It belongs to 7v7 for U9 and U10 in the U.S. Soccer standards. 9v9 and 11v11 do not use it, and other countries have their own rules.'},
   {said:'“The line is always in the same place.”',truth:'U.S. Soccer puts it halfway between the penalty area and the halfway line. Fields differ in size, so the distance from the goal differs too.'}],
  formats:[['7v7','Used in the U.S. Soccer standards for U9 and U10, and by AYSO. Our lessons use AYSO’s build-out rules as the example.'],['9v9 and 11v11','No build-out line. Opponents only have to leave the penalty area on a goal kick.'],
   ['Futsal','No build-out line. Opponents leave the penalty area for a goal clearance.'],['England','The FA’s youth formats are different and do not use this U.S. Soccer line. Check The FA’s rules for your age group.']],
  faq:[{q:'What is the build-out line in soccer?',a:'A line across each half of a 7v7 field, between the penalty area and the halfway line. It gives the team with the ball room to pass out from its goal.'},
   {q:'When can the other team cross the build-out line?',a:'As soon as the ball is put into play. On a goal kick that is when the ball is kicked and clearly moves.'},
   {q:'Can you be offside behind the build-out line?',a:'A player cannot be penalized for offside between the halfway line and the build-out line. Between the build-out line and the goal line, offside counts.'},
   {q:'Why can’t the goalkeeper punt in 7v7?',a:'The U.S. Soccer standards want young teams to learn to pass out from the back, so punts and drop kicks are not allowed at U9 and U10.'},
   {q:'What age uses the build-out line?',a:'Under-9 and under-10 teams playing 7v7 in the United States. From under-11, in 9v9, it is gone.'}],
  lessonIds:['learn7_buildout','next7_offsideboundary','bld_7_usekeeper','learn7_roles'],cta:'learn7_buildout',links:[L.f7,L.f231,L.gk,L.field]},
 // ---- kick-off -----------------------------------------------------------------------------------------------------------
 {slug:'kick-off',name:'Kick-off',law:'Law 8',lawPage:'the-start-and-restart-of-play/',
  title:'Soccer Kick-Off Rules for Kids, With a Diagram',h1:'Soccer kick-off rules for kids',
  desc:'Soccer kick-off rules in plain words for kids and parents: who kicks off, where everyone stands, which way the ball may go and if you can score.',
  answer:'In soccer, a kick-off starts each half and restarts the game after every goal, from the center mark. Every player except the kicker starts in their own half, and the other team stays outside the center circle until the ball is kicked.',
  scenes:[{title:'A kick-off',who:'9@50,49 10@42,47 8@50,38 7@86,46 11@14,46 4@38,22 5@62,22 !9@50,61 !8@38,62 !10@62,62 !7@84,56 !11@16,56',ball:[50,50],zone:[41.3,44.2,58.7,55.8],passes:['50,50>49,40'],
   caption:'Number 9 kicks off from the center mark and passes back to number 8. Both teams are in their own halves. The other team stays out of the shaded center circle, 10 yards from the ball, until it is kicked.'}],
  refs:['The ball is still, on the center mark.','All players except the kicker are in their own half.','Opponents are at least 9.15 m (10 yards) away, which is the center circle.',
   'The referee has given the signal.','The kicker does not touch the ball twice before another player touches it.'],
  mixups:[
   {said:'“The ball has to go forward.”',truth:'It can go in any direction. Most teams pass it back to keep the ball.'},
   {said:'“Two players must stand over the ball.”',truth:'One kicker is enough. The kicker may even stand in the other half to take it.'},
   {said:'“You cannot score from a kick-off.”',truth:'You can score directly against the other team. A kick-off that goes straight into your own goal is a corner kick to the other team.'},
   {said:'“The team that scored kicks off again.”',truth:'After a goal, the kick-off is taken by the other team. For the second half the teams change ends.'}],
  formats:[['7v7 and 9v9','The same rule. The center circle is smaller, so check how far back your league asks opponents to stand.'],['11v11','Law 8 in full.'],
   ['Futsal','As in soccer, every player except the kicker starts in their own half.']],
  faq:[{q:'Who gets the kick-off in soccer?',a:'The referee tosses a coin. The team that wins chooses which goal to attack or to take the first kick-off. The team that chose a goal to attack takes the kick-off that starts the second half.'},
   {q:'Can you score straight from a kick-off?',a:'Yes, the Laws allow a goal to be scored directly from the kick-off against the other team.'},
   {q:'Can the kick-off go backward?',a:'Yes. The ball is in play when it is kicked and clearly moves, in any direction.'},
   {q:'Can you be offside at a kick-off?',a:'Everyone starts in their own half, and a player in their own half cannot be in an offside position. After the kick-off, the normal offside rule applies.'}],
  lessonIds:['learn7_shape','learn9_shape','learn11_shape','prn_7_spread'],cta:'learn7_shape',exhibitIds:['laws-1863'],links:[L.st,L.cm,{path:'/learn/soccer-formations',name:'Soccer formations for kids',line:'Where each player lines up for the kick-off'}]},
 // ---- drop ball ----------------------------------------------------------------------------------------------------------
 {slug:'drop-ball',name:'Drop ball',law:'Law 8',lawPage:'the-start-and-restart-of-play/',
  title:'The Drop Ball in Soccer, Explained for Kids',h1:'The drop ball in soccer, explained for kids',
  desc:'The drop ball in soccer in plain words for kids and parents: when the referee uses it, who gets the ball, where the others stand and if you can score.',
  answer:'In soccer, a drop ball restarts the game when the referee has stopped play for something that is not a foul, such as an injury or the ball hitting the referee. The referee drops the ball for one player of the team that had it, and everyone else stands at least 4.5 yards away.',
  scenes:[{title:'A drop ball',who:'8@46,54 6@40,38 10@60,60 7@82,58 !6@55,66 !8@36,64 !R@50,56',ball:[48,55],zone:[41,48.5,55,59.5],
   caption:'Play stopped while gold had the ball. The referee, marked R, drops it for one gold player, number 8. Every other player from both teams stays out of the shaded space, at least 4.5 yards from the ball, until it touches the ground.'}],
  refs:['Which team had the ball, or would have had it, when play stopped. That team gets the drop.','Where the ball was. Inside a penalty area it is always dropped for that team’s goalkeeper.',
   'Everyone else, teammates too, is at least 4 m (4.5 yards) away.','The ball touches the ground before anyone plays it.','A goal only counts after the ball has touched at least two players.'],
  mixups:[
   {said:'“Two players fight for a drop ball.”',truth:'Not any more. The ball is dropped for one player, and nobody may challenge until it hits the ground.'},
   {said:'“You have to give the ball back.”',truth:'Giving the ball back was a kind habit under the old rule. Now the team that had the ball simply keeps it.'},
   {said:'“The ball hit the referee, so play on.”',truth:'Not always. If the ball touches the referee, stays on the field and then goes into the goal, changes which team has it or starts a promising attack, play restarts with a drop ball.'}],
  formats:[['7v7, 9v9 and 11v11','The same rule in every size of game. On a small field the 4.5 yards is a big part of the field, so players need to back away quickly.']],
  faq:[{q:'When is there a drop ball in soccer?',a:'When the referee stops play and the Laws give no other restart: for example a serious injury, a burst ball, or the ball hitting the referee in a way that changes the game.'},
   {q:'Who gets the drop ball?',a:'One player of the team that had the ball or would have had it. If nobody can tell, it goes to the team that touched it last. In a penalty area it goes to the defending goalkeeper.'},
   {q:'Can you score from a drop ball?',a:'Only after the ball has touched at least two players. If it goes straight into the other team’s goal, it is a goal kick.'},
   {q:'How far away do you stand at a drop ball?',a:'At least 4 metres, which is about 4.5 yards, until the ball touches the ground.'}],
  lessonIds:['learn11_restart','set_f_throwin','trn_9_firstpass'],cta:'learn11_restart',exhibitIds:['laws-1863'],links:[L.gk,L.cm,L.old]},
 // ---- advantage ----------------------------------------------------------------------------------------------------------
 {slug:'advantage',name:'Advantage',law:'Law 5',lawPage:'the-referee/',
  title:'The Advantage Rule in Soccer, Explained for Kids',h1:'The advantage rule in soccer, explained for kids',
  desc:'The advantage rule in soccer in plain words for kids and parents: why the referee lets play go on after a foul, how long they wait and what about cards.',
  answer:'In soccer, the referee plays advantage when a team is fouled but would be better off if the game kept going, for example because it still has the ball and a clear attack. If that benefit does not come within a few seconds, the referee stops play and gives the free kick after all.',
  scenes:[{title:'Playing advantage',who:'8@40,52 10@56,62 9@62,76 7@86,70 !6@38,50 !4@44,78 !5@66,80 !G@50,96',ball:[55,63],zone:[48,62,96,90],passes:['42,53>55,62'],runs:['62,76>70,88'],
   caption:'Number 8 is tripped by an opponent while passing, but the pass reaches number 10, who has space ahead in the shaded area and a striker running. The referee lets play go on. Stopping for the free kick would help the team that fouled.'}],
  refs:['Does the fouled team still have the ball, or get it straight away?','Is the chance better than a free kick would be? Close to the other goal the answer is often yes.',
   'How bad the foul was. For serious foul play the referee normally stops the game unless there is a clear chance to score.','The next few seconds: if the advantage disappears, the referee goes back to the free kick.',
   'A card that is still owed. It is shown the next time play stops.'],
  mixups:[
   {said:'“The referee missed that foul.”',truth:'Often the referee saw it and chose to let play go on, because stopping would have helped the team that fouled.'},
   {said:'“If you play advantage, the foul is forgotten.”',truth:'A yellow or red card can still be shown at the next stop in play.'},
   {said:'“You get the advantage and then the free kick too.”',truth:'The referee only goes back if the advantage does not happen within a few seconds. A bad pass later on does not bring the free kick back.'}],
  formats:[['All formats','The same idea in 7v7, 9v9 and 11v11. With the youngest players, referees stop more often to explain and to keep everyone safe.'],
   ['Futsal','Advantage is played in futsal too. A direct free kick foul still counts toward the team’s fouls for that period when the referee lets play go on.']],
  faq:[{q:'What does “play on” mean in soccer?',a:'It means the referee saw a foul and is letting the game continue, because stopping would hurt the team that was fouled.'},
   {q:'How long does advantage last?',a:'The Laws say the referee can go back to the foul if the benefit does not come “at that time or within a few seconds”.'},
   {q:'Can you get a card after advantage?',a:'Yes. If the foul deserved a yellow or red card, the referee shows it when the ball next goes out of play.'},
   {q:'Should young players stop when they are fouled?',a:'No. Keep playing until you hear the whistle. Our lessons teach the same habit after winning the ball: look forward first.'}],
  lessonIds:['trn_9_firstpass','trn_f_firstpass','trn_11_recover'],cta:'trn_9_firstpass',exhibitIds:['laws-1863'],links:[L.st,L.cm,L.old]},
 // ---- substitutions and game length --------------------------------------------------------------------------------------
 {slug:'substitutions-and-game-length',name:'Substitutions and game length',law:'Laws 3 and 7',lawPage:'the-players/',
  title:'Soccer Substitutions and Game Length by Age',h1:'Soccer substitutions and game length by age',
  desc:'How long a soccer game lasts at each age and how substitutions work, in plain words for kids and parents: game times from U6 to U19 and the pro rules.',
  answer:'A full soccer game is two halves of 45 minutes, and in top competitions a team may use up to five substitutes who cannot come back on. Youth soccer plays shorter games and usually lets players go off and come back as often as the coach likes.',
  scenes:[{title:'A substitution',who:'7@98,62 14@103,50 9@50,70 8@44,52 4@40,24 !3@86,66 !6@52,58',ball:[101,36],zone:[94,47,106,53],runs:['103,50>94,50','98,62>103,62'],
   caption:'The ball is out of play. Number 7 leaves the field at the nearest point on the boundary line. The substitute, number 14, waits by the halfway line in the shaded space and comes on there, after number 7 is off and the referee has signalled.'}],
  refs:['Play has stopped, and the referee has been told about the change.','The player going off leaves at the nearest point on the boundary line, unless the referee says otherwise.',
   'The substitute comes on at the halfway line, after the other player has left and after the referee’s signal.','A change of goalkeeper also needs a stop in play, and the referee must be told.',
   'Time lost to substitutions, injuries and goal celebrations, which is added at the end of each half.'],
  mixups:[
   {said:'“A game is 90 minutes for everyone.”',truth:'In US Youth Soccer rules, only from under-17. Younger age groups play shorter halves, and the youngest play four short quarters.'},
   {said:'“A player who comes off cannot go back on.”',truth:'True in the adult game. The Laws let youth and grassroots soccer use return substitutions, and most US youth leagues do.'},
   {said:'“You can sub at any time.”',truth:'In most youth leagues only when play has stopped and the referee agrees. Futsal is the exception: changes are made while the game goes on.'},
   {said:'“The clock stops when the ball goes out.”',truth:'In soccer the clock keeps running and the referee adds time at the end of the half.'}],
  formats:[['4v4 (U6 to U8)','U.S. Soccer standards: four quarters of 10 minutes, unlimited substitutions at any time. US Youth Soccer lists four 12-minute quarters at under-8 and four 6-minute quarters at under-6.'],
   ['7v7 (U9, U10)','Two halves of 25 minutes. Unlimited substitutions at any stop in play (U.S. Soccer standards; US Youth Soccer Rule 303).'],
   ['9v9 (U11, U12)','Two halves of 30 minutes. Unlimited substitutions at any stop in play.'],
   ['11v11 (U13 to U19)','US Youth Soccer: two halves of 35 minutes at U13 and U14, 40 minutes at U15 and U16, 45 minutes at U17 to U19.'],
   ['Futsal','Two periods of 20 minutes of playing time. Unlimited substitutions, made at any time through the team’s substitution zone, even while the ball is in play.']],
  faq:[{q:'How long is a youth soccer game?',a:'In typical US youth standards: four 10-minute quarters at U6 to U8, two 25-minute halves at U9 and U10, two 30-minute halves at U11 and U12, then 35, 40 and 45-minute halves as players get older. Your league may differ.'},
   {q:'How many substitutions are allowed in soccer?',a:'In official competitions, up to five per team, and a player who comes off cannot return. Youth leagues usually allow unlimited substitutions with players coming back on.'},
   {q:'How long is half-time in soccer?',a:'No more than 15 minutes in the Laws of the Game. Youth games usually take a shorter break.'},
   {q:'What is stoppage time?',a:'Time the referee adds at the end of a half for substitutions, injuries, time-wasting and other delays. The number shown on the board is the least that will be played.'},
   {q:'How many players does a team need to play?',a:'In the 11-a-side Laws a game cannot start or go on if a team has fewer than seven players. Small-sided leagues set their own minimum.'}],
  lessonIds:['learn7_roles','learn9_shape','learn11_shape','learnf_roles31'],cta:'learn7_roles',links:[L.ages,L.field,L.ball,L.fs]},
 // ---- heading ------------------------------------------------------------------------------------------------------------
 {slug:'heading-rules-for-kids',name:'Heading rules for kids',law:'U.S. Soccer and US Youth Soccer rules',lawPage:'general-modifications/',
  title:'Soccer Heading Rules for Kids in the US, by Age',h1:'Soccer heading rules for kids in the US',
  desc:'At what age kids can head the ball in US youth soccer, in plain words for parents: no heading at 10 and under, and limits in practice at 11 and 12.',
  answer:'In US youth soccer, players aged 10 and under do not head the ball, in games or in practice. From age 11 heading is allowed in games, with limits on how much players aged 11 and 12 head the ball in practice.',
  scenes:[{format:'7v7',title:'After a deliberate header in a 7v7 game',who:'8@44,56 9@50,74 7@82,62 3@24,34 !6@52,60 !4@40,76 !5@62,78 !G@50,96',ball:[45,58],zone:[38,58,52,70],
   caption:'An under-10 player deliberately heads the ball in midfield. The referee stops play and gives the other team an indirect free kick from that spot. Here gold number 8 takes it, and the opponents give space in front of the ball.'}],
  refs:['Was the header deliberate? A ball that hits a child on the head by accident is not an offence.','The age group of the game, not the height or skill of the player.',
   'The spot. The indirect free kick is taken where the header happened.','Near the goal: U.S. Soccer moves a kick from inside the goal area to the goal area line; US Youth Soccer moves a kick from inside the penalty area to outside it.',
   'Any sign of a head injury. The player comes off to be checked, and a substitute may come on.'],
  mixups:[
   {said:'“Heading is banned until high school.”',truth:'No. The limit is age 10 and under. US Youth Soccer allows heading in games from age 11.'},
   {said:'“It is a US law.”',truth:'It is a rule of soccer organizations, not a law of the country. U.S. Soccer introduced it with its concussion initiative, and US Youth Soccer has its own written rule.'},
   {said:'“An accidental header is a foul.”',truth:'The rule is about deliberate headers. Play goes on after an accident, unless the referee stops to check the player.'},
   {said:'“My 10-year-old plays U12, so heading is fine.”',truth:'US Youth Soccer’s rule goes by the player’s age: a player aged 10 or younger does not head the ball. Ask your league how it handles players who play up.'}],
  formats:[['4v4 and 7v7 (U6 to U10)','U.S. Soccer standards: deliberate heading is not allowed in games. The other team gets an indirect free kick.'],
   ['9v9 (U11, U12)','U.S. Soccer’s 2016 standards: no deliberate heading in U11 games, allowed at U12. US Youth Soccer (2025): ages 11 and 12 may head in games, with no more than 25 headers a week for any player in practice.'],
   ['11v11 (U13 and up)','Heading is allowed in games and practice (US Youth Soccer Rule 305).'],
   ['Futsal','Ask your futsal league which heading rule it follows.'],
   ['England','The FA has its own heading guidance for children, which is different from the US rules.']],
  faq:[{q:'At what age can kids head the ball in soccer?',a:'In US youth soccer, from age 11 in games. Players aged 10 and under do not head the ball at all. Players aged 11 and 12 have limits in practice.'},
   {q:'What happens if a 9-year-old heads the ball in a game?',a:'If it was deliberate, the referee stops play and the other team gets an indirect free kick from that spot. No card is shown.'},
   {q:'Why is heading limited for kids?',a:'U.S. Soccer introduced the limits as part of its concussion initiative, on the advice of its medical committee.'},
   {q:'How can young players control a high ball without heading?',a:'With the chest, the thigh or the foot, or by letting it bounce. Our lessons teach looking early and choosing a first touch into space.'}],
  lessonIds:['learn7_receive','learn9_receive','next7_shotreaction'],cta:'learn7_receive',links:[L.ages,L.f7,L.ball]},
 // ---- futsal rules -------------------------------------------------------------------------------------------------------
 {slug:'futsal-rules',name:'Futsal rules',law:'FIFA Futsal Laws of the Game',lawPage:'general-modifications/',
  title:'Futsal Rules vs Soccer: Kick-In, 4 Seconds, Fouls',h1:'Futsal rules that are different from soccer',
  desc:'How futsal rules differ from soccer, in plain words for kids and parents: the kick-in, the four-second rule, accumulated fouls, no offside and subs.',
  answer:'Futsal is five-a-side soccer on a hard court, and it has its own Laws from FIFA. The biggest differences are a kick-in instead of a throw-in, four seconds to take every restart, no offside, and a count of each team’s fouls.',
  scenes:[{format:'futsal',title:'A futsal kick-in',who:'A@0,58 P@30,78 F@40,30 A@82,60 G@50,5 !A@14,66 !F@42,70 !A@70,52 !G@50,95',ball:[1,59],zone:[0,49,24,69],passes:['2,58>38,32'],
   caption:'A gold ala takes a kick-in from the touchline, with the ball still and on the line. Opponents stay out of the shaded space, 5 m from the ball. The kick has to be taken within four seconds, and here it goes back to the fixo, marked F.'}],
  refs:['Kick-in: the ball is still, on the touchline where it went out, and opponents are 5 m away.','Four seconds: kick-ins, corner kicks, free kicks and goal clearances are taken within four seconds of the team being ready.',
   'The goalkeeper: no more than four seconds on the ball in their own half, with hands or feet.','Accumulated fouls: every direct free kick foul is counted for each team in each period.',
   'From a team’s sixth foul in a period: a direct free kick from the 10 m mark, with no wall.'],
  mixups:[
   {said:'“Futsal is just indoor soccer.”',truth:'Futsal is its own game with its own Laws: touchlines instead of walls, five players a side and a smaller ball made to bounce low.'},
   {said:'“You can score from a kick-in.”',truth:'Not directly. If a kick-in goes straight into the other goal, the other team gets a goal clearance.'},
   {said:'“The keeper takes goal kicks.”',truth:'There are none. The goalkeeper throws or releases the ball from the penalty area. That is a goal clearance.'},
   {said:'“Four seconds starts when the ball goes out.”',truth:'It starts when the team is ready to restart, or when the referee signals that it is.'}],
  formats:[['Players','Five a side, one of them the goalkeeper. Unlimited substitutions at any time, through the substitution zone.'],['Time','Two periods of 20 minutes of playing time. Youth leagues often shorten this.'],
   ['Ball','62 to 64 cm around and 400 to 440 g. Dropped from 2 m, it must not bounce higher than 65 cm.'],['Offside','None.'],
   ['Penalty marks','6 m for a penalty kick, 10 m for the free kick after a sixth foul.'],['Youth leagues','The Futsal Laws let a competition shorten the periods, and youth leagues often do. Check your league’s rules.']],
  faq:[{q:'What is the four-second rule in futsal?',a:'A team has four seconds to take a kick-in, corner kick, free kick or goal clearance once it is ready. The goalkeeper also has only four seconds on the ball in their own half.'},
   {q:'What are accumulated fouls in futsal?',a:'Each direct free kick foul is added to the team’s count for that period. From the sixth, the other team gets a direct free kick with no wall, usually from the 10 m mark.'},
   {q:'Is there offside in futsal?',a:'No. The Futsal Laws say there is no offside.'},
   {q:'Is a futsal ball smaller than a soccer ball?',a:'Yes. A futsal ball is 62 to 64 cm around. A full-size soccer ball is 68 to 70 cm. The futsal ball is also made to bounce less.'},
   {q:'Can a futsal goalkeeper score by throwing the ball?',a:'Not by throwing. If the goalkeeper throws the ball straight into the other goal, the other team gets a goal clearance.'}],
  lessonIds:['set_f_throwin','expf_kickinthird','expf_cornercutback','expf_freekickbalance','expf_keeperrelease'],cta:'set_f_throwin',exhibitIds:['futsal-1989'],links:[L.fs,L.fs22,L.gk]},
] as Raw[]).map(make);
export const ruleBySlug=(slug:string)=>RULES.find(r=>r.slug===slug);
export const RULE_SOURCE_LINE='Sources: IFAB Laws of the Game (current edition), U.S. Soccer small-sided standards, US Youth Soccer playing rules (December 2025) and the FIFA Futsal Laws of the Game 2025-26. Checked on November 10, 2026.';
export const RULE_LEAGUE_LINE=LEAGUE;
/** The futsal law source for the futsal page (the other pages cite their IFAB Law). */
export const FUTSAL_LAWS_URL='https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf';

const GROUPS:[string,string,string[]][]=[
 ['Restarts','How the game starts again when the ball goes out or play stops.',['kick-off','throw-in','goal-kick','corner-kick','drop-ball']],
 ['Fouls and the referee','What is not allowed, and what the referee does about it.',['fouls-and-free-kicks','handball','penalty-kick','yellow-and-red-cards','advantage']],
 ['Offside and the goalkeeper','The two rules that change how teams attack and build from the back.',['offside','back-pass-rule']],
 ['Youth soccer and futsal','Rules made for young players in the United States, and the rules of futsal.',['build-out-line','heading-rules-for-kids','substitutions-and-game-length','futsal-rules']],
];
export const RULES_HUB={path:RULES_HUB_PATH,crumb:'Soccer rules',blurb:`${RULES.length} rules explained for kids, each with a diagram: offside, handball, throw-ins and more`,
 title:'Soccer Rules for Kids: Every Rule, With Diagrams',
 description:`${RULES.length} soccer rules explained for kids and parents in plain words, each with a pitch diagram: offside, handball, throw-ins, free kicks, cards and more.`,
 h1:'Soccer rules for kids',
 lead:'Soccer has 17 Laws of the Game, and a young player needs only a handful of them to enjoy a match. This guide explains each rule kids meet first in two plain sentences, with a diagram of where everyone stands.',
 more:'Each page gives the short answer, what the referee looks for, the mix-ups we hear most from kids and parents, and how the rule changes in 7v7, 9v9, 11v11 and futsal.',
 groups:GROUPS.map(([title,line,slugs])=>({title,line,rules:slugs.map(s=>{const r=RULES.find(x=>x.slug===s);if(!r)throw new Error(`rules hub: ${s}`);return r;})})),
 basics:['Two teams try to put the ball in the other team’s goal. The whole ball has to cross the whole line.','Only the goalkeeper may use hands or arms, and only inside their own penalty area.',
  'When the ball goes out over the side, it comes back with a throw-in. Over the end line, it is a goal kick or a corner kick.','A foul gives the other team a free kick. A foul by a defender in their own penalty area can be a penalty kick.',
  'The referee’s decision is final. Players shake hands at the end, whatever the score.'],
 faq:[{q:'How many rules does soccer have?',a:'The Laws of the Game have 17 Laws, kept by The IFAB. Youth leagues change some details, such as field size, game length and heading, to fit young players.'},
  {q:'What is the hardest soccer rule to understand?',a:'Most people say offside. The short version: when a teammate passes forward, do not be past the second-last opponent in their half. Our offside page shows it with two diagrams.'},
  {q:'Are the rules the same for kids and adults?',a:'The main rules are. Youth soccer uses smaller fields and balls, shorter games, return substitutions and, in the United States, a build-out line at 7v7 and no heading at age 10 and under.'},
  {q:'What is the difference between soccer rules and futsal rules?',a:'Futsal has five players a side, no offside, a kick-in instead of a throw-in, four seconds for restarts and a count of team fouls.'},
  {q:'Where can my child practise the rules?',a:'Every rule page links to a free Futbol Island lesson that shows the rule on a pitch with moving players, then asks a few quiz questions.'}] as Faq[],
 lessons:pick(['learn7_buildout','next7_offsideboundary','gap11_runoncue','bld_7_usekeeper','exp11_shortfreekick','set_f_throwin'])};
if(RULES_HUB.groups.reduce((n,g)=>n+g.rules.length,0)!==RULES.length)throw new Error('rules hub: every rule belongs to one group');
