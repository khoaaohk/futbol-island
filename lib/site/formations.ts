import {lessonById,type SiteLesson} from './lessons';
import type {Faq} from './safety';
import {PLAYERS_PER_TEAM,type GuideFormat,type Line} from './pitch';
/**
 * The FORMATIONS cluster (SEO, Nov 10 2026): /learn/soccer-formations, one page per formation under it, and the three format
 * guides /learn/7v7-soccer-formations, /learn/9v9-soccer-formations and /learn/11v11-soccer-formations. All page words live
 * here as typed data; the routes under app/(site)/learn only render it. US searchers say "soccer", so these pages lead with
 * "soccer" (the rest of the site says "football (soccer)"; do not change that elsewhere).
 *
 * Where the facts come from:
 *  - The repo's own lessons first (public/lessons/*.json): learn7_roles and learn7_shape (2-3-1, "one-two-three-one including
 *    the keeper", a formation is a starting arrangement), learn9_shape (3-2-3, three units), nx9_twostrikers / nx9_midfieldjoins
 *    (3-3-2), next9_singleholder (3-1-3-1), nx9_twobackcover (two backs need a third protector), learn11_shape (4-3-3, "one-
 *    four-three-three includes them"), exp11_secondball (4-4-2), exp11_wingbackcue (wing-backs outside three center backs),
 *    learnf_roles31 (fixo, alas, pivot), learnf_shape22 (2-2), expf_diamondshift (diamond). Every lesson id below is checked
 *    against the catalog when this module loads (a wrong id throws at build time).
 *  - U.S. Soccer Player Development Initiatives, small-sided standards (7v7 at U9-U10, 9v9 at U11-U12, 11v11 from U13; the
 *    build-out line in 7v7: opponents wait behind it on a goal kick or when the keeper has the ball in hand, no offside between
 *    halfway and the build-out line, no punts or drop kicks): https://www.ussoccer.com/stories/2017/08/five-things-to-know-how-smallsided-standards-will-change-youth-soccer
 *    (checked Nov 10 2026). U.S. Soccer writes youth shapes with the goalkeeper first (1-2-3-1, 1-3-2-3, 1-4-3-3).
 *  - IFAB Laws of the Game, Law 3 (a match is played by two teams of at most eleven players, one the goalkeeper): https://www.theifab.com/laws/latest/the-players/
 *  - FIFA Futsal Laws of the Game (five players, one the goalkeeper), as already used by the futsal lessons and lib/town/match/formatAI.ts.
 *    Re-checked Nov 10 2026 against the 2025-26 edition (https://the-aiff.com/media/uploads/2025/09/Futsal-Laws-of-the-Game-2025-2026_EN.pdf):
 *    "a maximum of five players, one of whom must be the goalkeeper"; the ball is 62-64 cm round (a soccer ball is 68-70 cm, IFAB
 *    Law 2) and "must not bounce lower than 50cm or higher than 65cm" when dropped from 2 m, so "smaller, made to bounce low" is right.
 *  - Re-checked the same day: IFAB Law 3 (at most eleven players, one the goalkeeper; no game with fewer than seven) and the U.S.
 *    Soccer chart (4v4 at U6-U8, 7v7 at U9-U10, 9v9 at U11-U12; 11v11 from U13 follows US Youth Soccer Rule 303). Law 4 does not
 *    require a shirt number at all, which is why the 1-11 numbers are presented as a coaching custom. No correction was needed.
 *  - The numbers on the dots follow one common coaching custom (1 keeper, 2 and 3 fullbacks, 4 and 5 center backs, 6, 8 and 10
 *    in midfield, 7 and 11 wide, 9 striker). It is a custom, not a law, and it differs by country; the pages say so. Not found
 *    on a primary ussoccer.com page in this pass: treat the exact number-to-spot mapping as convention.
 * Local leagues change details (ages, build-out line), so the pages tell readers to check their own league's rules.
 * No statistics, no named players, no claims about what professional teams "always" do.
 */
export type Role={title:string;pos?:string;job:string};
export type Weak={spot:string;cover:string;lesson?:string};
export type Formation={slug:string;path:string;format:GuideFormat;shape:string;name:string;title:string;h1:string;desc:string;answer:string;best:string;watch:string;
 lines:Line[];roles:Role[];strengths:string[];weak:Weak[];attack:string;defend:string;suits:string;faq:Faq[];lessons:SiteLesson[]};
export const FORMATIONS_HUB_PATH='/learn/soccer-formations';
export const formationPath=(slug:string)=>`${FORMATIONS_HUB_PATH}/${slug}`;
export const formatGuidePath=(f:GuideFormat)=>f==='futsal'?'/learn/futsal-for-kids':`/learn/${f}-soccer-formations`;
const POS:Record<string,string>={GK:'goalkeeper',LB:'fullback',RB:'fullback',CB:'center-back',LCB:'center-back',RCB:'center-back',LWB:'wingback',RWB:'wingback',DM:'defensive-midfielder',LDM:'defensive-midfielder',RDM:'defensive-midfielder',
 CM:'central-midfielder',LCM:'central-midfielder',RCM:'central-midfielder',AM:'attacking-midfielder',LAM:'attacking-midfielder',RAM:'attacking-midfielder',LM:'winger',RM:'winger',LW:'winger',RW:'winger',ST:'striker',LS:'striker',RS:'striker'};
const rows=(rs:string[]):Line[]=>rs.map(r=>{const [name,toks]=r.split('|');return {name,spots:toks.split(' ').map(t=>{const [n,label,dy]=t.split(':');return {n,label,pos:POS[label],...(dy?{dy:Number(dy)}:{})};})};});
const pick=(ids:string[])=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`formation lesson ${id} is not in the lesson catalog`);return l;});
type Raw=Omit<Formation,'path'|'lines'|'lessons'|'title'|'h1'|'name'>&{rows:string[];lessonIds:string[];tag?:string};
const make=(r:Raw):Formation=>{
 const {rows:rs,lessonIds,tag,...rest}=r,lines=rows(rs),n=lines.reduce((a,l)=>a+l.spots.length,0),fs=r.format==='futsal';
 if(n!==PLAYERS_PER_TEAM[r.format])throw new Error(`${r.slug}: ${n} players drawn for ${r.format}`);
 const shape=tag?`${r.shape} ${tag}`:r.shape;
 return {...rest,lines,lessons:pick(lessonIds),path:formationPath(r.slug),name:fs?`${shape} (futsal)`:`${shape} (${r.format})`,
  title:fs?`${shape} Futsal Formation: Roles and Diagram`:`${shape} Soccer Formation for ${r.format}: Roles and Diagram`,
  h1:fs?`${shape} futsal formation`:`${shape} soccer formation (${r.format})`};
};
/** How U.S. Soccer writes the same shape: goalkeeper first. */
export const withKeeper=(f:{shape:string})=>`1-${f.shape}`;

const RAW:Raw[]=[
 // ---- 7v7 ----------------------------------------------------------------------------------------------------------------
 {slug:'7v7-2-3-1',format:'7v7',shape:'2-3-1',best:'Most teams. A balanced first shape.',watch:'Only two defenders on a fast break.',
  desc:'The 2-3-1 formation for 7v7 soccer, explained for kids, parents and coaches: a clear diagram, every role, strengths, weak spots and free lessons.',
  answer:'The 2-3-1 is a 7v7 soccer formation with two defenders, three midfielders and one forward in front of the goalkeeper. It suits most teams aged 9 and 10, because every player has a clear job and the team learns to use the whole width of the field.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 2:RB','Midfielders|11:LM 8:CM 7:RM','Forward|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Stops shots and starts attacks. In 7v7 the keeper rolls, throws or passes to a nearby teammate.'},
   {title:'Two defenders (2 and 3)',pos:'fullback',job:'Protect the route to your goal. With the ball they move apart, so the keeper has a pass on each side.'},
   {title:'Wide midfielders (7 and 11)',pos:'winger',job:'Stay wide to stretch the other team. They go up to help the forward and back to help the defenders.'},
   {title:'Middle midfielder (8)',pos:'central-midfielder',job:'Links everyone. Moves to give the player with the ball one more passing angle.'},
   {title:'Forward (9)',pos:'striker',job:'Gives the team a target up the field. First to chase when the ball is lost.'}],
  strengths:['Triangles all over the field: the player with the ball usually has two passes.','Three midfielders can help the defenders and the forward.','The jobs carry over to bigger games: wide players, a link player in the middle and one forward.'],
  weak:[
   {spot:'There are only two defenders, so a fast break through the middle can outnumber them.',cover:'When the ball is lost, the middle midfielder runs back to protect the middle first.',lesson:'gap7_lostball'},
   {spot:'The forward is alone if the midfield stays deep.',cover:'The forward comes close enough to help, and a wide midfielder runs up to join.',lesson:'next7_reachableforward'},
   {spot:'The wide midfielders run a lot and get tired.',cover:'Swap players often. Every child should try the wide job.'}],
  attack:'With the ball, the two defenders move apart and the wide midfielders step up near the sideline. The forward stays high. The middle midfielder goes where the passer needs help.',
  defend:'Without the ball, the wide midfielders come inside, level with the middle midfielder. The team is narrow, so passes through the middle are hard.',
  suits:'Players aged 9 and 10 (U9 and U10) and any team new to 7v7. It is the shape the Futbol Island 7v7 lessons start with.',
  faq:[
   {q:'Is 2-3-1 the best formation for 7v7?',a:'There is no single best shape. The 2-3-1 is a common place to start because it is balanced: two players behind, three across the middle and one ahead. Pick a shape that fits your players, then teach the jobs.'},
   {q:'Who should play in the middle of a 2-3-1?',a:'A player who likes being near the ball and looks around a lot. The middle midfielder helps the defenders, the wide players and the forward. At this age every child should still try every spot.'},
   {q:'What does a 2-3-1 do on a goal kick?',a:'The two defenders move wide, one on each side of the penalty area. In U.S. Soccer 7v7 rules the other team waits behind the build-out line until the ball is played, so the keeper has time to pass short. Check your own league’s rules.'},
   {q:'How do I teach the 2-3-1 to nine-year-olds?',a:'Name three lines: defenders, midfielders, forward. Walk through one idea at a time: spread out with the ball, squeeze in without it. Then let them play. A formation is a starting arrangement, and players may leave their spot when the game needs it.'}],
  lessonIds:['learn7_roles','learn7_shape','learn7_buildout','prn_7_spread','gap7_lostball','next7_reachableforward']},
 {slug:'7v7-3-2-1',format:'7v7',shape:'3-2-1',best:'Teams that let in a lot of goals.',watch:'No wide midfielders. Outside backs must go forward.',
  desc:'The 3-2-1 formation for 7v7 soccer in plain words: three defenders, two midfielders, one forward. Diagram, roles, weak spots and free lessons for kids.',
  answer:'The 3-2-1 is a 7v7 soccer formation with three defenders, two midfielders and one forward. It suits teams that need more safety at the back, such as new teams or teams playing a stronger opponent.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 4:CB 2:RB','Midfielders|6:LCM 8:RCM','Forward|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Guards the goal and is always a safe pass behind the three defenders.'},
   {title:'Center back (4)',pos:'center-back',job:'Stays in the middle of the back three and covers behind the other two.'},
   {title:'Outside backs (2 and 3)',pos:'fullback',job:'Defend the sides. With the ball they make the outside route, because nobody else starts wide.'},
   {title:'Two midfielders (6 and 8)',pos:'central-midfielder',job:'Work as a pair. One goes to the ball, the other stays close behind to help.'},
   {title:'Forward (9)',pos:'striker',job:'Stays high to stretch the field and holds the ball until help arrives.'}],
  strengths:['Three defenders cover the width of the field, so it is hard to get behind them.','The center back can cover while an outside back steps out to the ball.','Simple jobs for new players at the back.'],
  weak:[
   {spot:'Nobody starts wide in midfield, so attacks can get stuck in the middle.',cover:'An outside back moves up the side to give the wide pass, and the center back covers behind.',lesson:'next7_outsideback'},
   {spot:'Two midfielders can be outnumbered by three.',cover:'The forward drops in to help, or an outside back steps into midfield.'},
   {spot:'The forward has little help near goal.',cover:'One midfielder runs past the forward when the ball goes up. The other stays.'}],
  attack:'With the ball, the outside backs go wide and one of them moves up. The two midfielders stand at different heights, one near the defenders and one near the forward.',
  defend:'Without the ball, the three defenders stay close together and the two midfielders sit just in front of them. The forward blocks the pass back through the middle.',
  suits:'New 7v7 teams, teams that give away many chances, and games against a faster opponent. As players grow in confidence, the outside backs can attack more.',
  faq:[
   {q:'Is 3-2-1 too defensive for kids?',a:'Not if the outside backs join the attack. With three at the back there is always cover, so one outside back can go forward safely. If all three stay back, the team has too few players ahead of the ball.'},
   {q:'What is the difference between 3-2-1 and 2-3-1?',a:'Where the wide players start. In a 3-2-1 the wide players are defenders who move up. In a 2-3-1 they are midfielders who drop back. The 3-2-1 starts safer. The 2-3-1 starts with more players in midfield.'},
   {q:'Who gives width in a 3-2-1?',a:'The outside backs. When your team has the ball, the outside back on that side moves up along the sideline to offer a pass. The other two defenders slide across to cover.'}],
  lessonIds:['next7_outsideback','learn7_shape','def_7_goalside','bld_7_usekeeper']},
 {slug:'7v7-2-2-2',format:'7v7',shape:'2-2-2',best:'New players. Pairs are easy to understand.',watch:'Nobody starts wide, so the team bunches up.',
  desc:'The 2-2-2 formation for 7v7 soccer: three pairs that are easy for kids to learn. See the diagram, each role, the weak spots and how to cover them.',
  answer:'The 2-2-2 is a 7v7 soccer formation made of three pairs: two defenders, two midfielders and two forwards. It suits beginners, because each player has a partner next to them and the jobs are simple.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 2:RB','Midfielders|6:LCM 8:RCM','Forwards|10:LS 9:RS'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and gives the two defenders a pass behind them.'},
   {title:'Two defenders (2 and 3)',pos:'fullback',job:'One goes to the ball, the other covers behind. They swap jobs when the ball changes side.'},
   {title:'Two midfielders (6 and 8)',pos:'central-midfielder',job:'Connect the back pair to the front pair. One helps the attack while the other stays ready to defend.'},
   {title:'Two forwards (9 and 10)',pos:'striker',job:'Stay at different heights: one comes toward the ball, the other runs behind the defenders.'}],
  strengths:['Easy to explain: find your partner and stay connected.','Two forwards mean there is nearly always someone to pass to near goal.','Each pair practises one going and one covering, which is a key defending idea.'],
  weak:[
   {spot:'There is no player who starts wide, so everyone drifts to the middle.',cover:'Ask each pair to stand apart, one left and one right, when your team has the ball.',lesson:'prn_7_spread'},
   {spot:'Two defenders are on their own if both midfielders go forward.',cover:'Only one midfielder joins the attack at a time. The other stays in front of the defenders.'},
   {spot:'Three lines of two leave big gaps between the lines.',cover:'Keep the team short: when the ball moves up, the defenders move up too.'}],
  attack:'With the ball, each pair spreads to the left and right. One midfielder joins the forwards, so three players attack and three stay ready behind.',
  defend:'Without the ball, the nearest player goes to the ball and the partner covers behind. The forwards come back to the halfway line to help.',
  suits:'Children in their first 7v7 season, and coaches who want to teach pressing and covering in pairs before adding wide players.',
  faq:[
   {q:'Why do some coaches avoid the 2-2-2?',a:'Because it has no wide players and no single player in the middle. Teams can end up in one crowd around the ball. It works when each pair spreads out with the ball.'},
   {q:'Is the 2-2-2 good for beginners?',a:'Yes, as a first step. Pairs are simple: one goes to the ball, one covers. When players are comfortable, many coaches move to a 2-3-1 to add width.'},
   {q:'How do the two forwards work together?',a:'They take different jobs. One shows for the ball at the feet. The other stays higher to keep a defender busy. Then they swap.'}],
  lessonIds:['prn_7_spread','prn_7_support','def_7_goalside','learn7_shape']},
 {slug:'7v7-3-1-2',format:'7v7',shape:'3-1-2',best:'Teams with two strong forwards.',watch:'One midfielder has a lot of ground to cover.',
  desc:'The 3-1-2 formation for 7v7 soccer: three defenders, one midfielder and two forwards. A clear diagram, the roles, strengths, weak spots and free lessons.',
  answer:'The 3-1-2 is a 7v7 soccer formation with three defenders, one midfielder and two forwards. It suits teams that have two keen forwards and want three defenders behind them for safety.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 4:CB 2:RB','Midfielder|8:CM','Forwards|10:LS 9:RS'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and helps the back three move the ball from side to side.'},
   {title:'Center back (4)',pos:'center-back',job:'The middle of the back three. Covers behind and talks to the two outside backs.'},
   {title:'Outside backs (2 and 3)',pos:'fullback',job:'Defend the sides, then run up the side to help the lone midfielder.'},
   {title:'Midfielder (8)',pos:'central-midfielder',job:'The only link between defenders and forwards. Always moving to be open for a pass.'},
   {title:'Two forwards (9 and 10)',pos:'striker',job:'Share the front. One comes short for the ball and the other runs behind.'}],
  strengths:['Two forwards keep the other team’s defenders busy.','Three defenders give cover across the whole width.','A quick pass forward can find two targets, not one.'],
  weak:[
   {spot:'One midfielder cannot cover the whole middle.',cover:'An outside back steps up next to the midfielder with the ball. A forward drops back without it.'},
   {spot:'There is no wide player ahead of the defenders.',cover:'The outside backs make the outside route, one at a time.',lesson:'next7_outsideback'},
   {spot:'Long gaps can open between the defenders and the forwards.',cover:'The forwards come back toward the ball so the pass is short enough to reach them.',lesson:'next7_reachableforward'}],
  attack:'With the ball, one outside back moves up beside the midfielder. One forward comes short and the other stays high, so the passer has a near choice and a far choice.',
  defend:'Without the ball, one forward drops next to the midfielder to make a pair. The three defenders stay close together in front of the goal.',
  suits:'Teams with players who love to score and a midfielder with lots of energy. It asks a lot of that one midfielder, so rotate the job.',
  faq:[
   {q:'Is 3-1-2 a good 7v7 formation?',a:'It can be, when the lone midfielder gets help. The outside backs must step up with the ball and a forward must drop back without it. Without that help the middle is empty.'},
   {q:'What does the single midfielder do in a 3-1-2?',a:'Connects the team. With the ball, this player shows for a pass from the defenders, then finds a forward. Without the ball, this player slows the attack down until teammates get back.'},
   {q:'Should both forwards stay up the field?',a:'No. If both stay high, the pass to them is too long. One comes toward the ball and one keeps the height. They take turns.'}],
  lessonIds:['next7_outsideback','next7_reachableforward','learn7_shape','prn_7_support']},
 // ---- 9v9 ----------------------------------------------------------------------------------------------------------------
 {slug:'9v9-3-2-3',format:'9v9',shape:'3-2-3',best:'Most teams. Wide forwards and a clear back three.',watch:'Two midfielders can face three.',
  desc:'The 3-2-3 formation for 9v9 soccer, explained for kids, parents and coaches: diagram, the three units, strengths, weak spots and free lessons.',
  answer:'The 3-2-3 is a 9v9 soccer formation with three defenders, two midfielders and three forwards. It suits most teams aged 11 and 12, because it has width at the back and at the front, and it leads straight into the 4-3-3 used in 11v11.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 4:CB 2:RB','Midfielders|6:LCM 8:RCM','Forwards|11:LW 9:ST 7:RW'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and joins the passing when the back three are pressed.'},
   {title:'Center back (4)',pos:'center-back',job:'Protects the middle. When an outside back goes forward, the center back slides across behind the ball.'},
   {title:'Outside backs (2 and 3)',pos:'fullback',job:'Defend the sides and carry the ball forward when there is room.'},
   {title:'Two midfielders (6 and 8)',pos:'central-midfielder',job:'Connect the back three block to the front three block.'},
   {title:'Wide forwards (7 and 11)',pos:'winger',job:'Stretch the field near the sidelines. One comes inside to help the midfield when it is outnumbered.'},
   {title:'Center forward (9)',pos:'striker',job:'Stays high in the middle and gives the team a target near goal.'}],
  strengths:['Three clear units that children can name: defenders, midfielders, forwards.','Wide forwards keep the other team’s defenders spread out.','Three at the back means one can step out and two still cover.'],
  weak:[
   {spot:'Two midfielders can be outnumbered by three in the middle.',cover:'A wide forward comes inside to help, and the outside back gives the width.',lesson:'nx9_midfieldhelper'},
   {spot:'A gap can open between the back three and the front three.',cover:'The two midfielders stand at different heights so each block has a link.',lesson:'nx9_twoblocks'},
   {spot:'When an outside back goes forward, three attackers can face two defenders.',cover:'A wide forward runs back with the extra runner.',lesson:'nx9_fourthrunner'}],
  attack:'With the ball, the outside backs go wide and one may carry forward. The wide forwards stay near the sidelines and the center forward stays high. The two midfielders show for passes between the blocks.',
  defend:'Without the ball, the wide forwards drop level with the midfielders, so five players block the middle of the field in front of the back three.',
  suits:'Players aged 11 and 12 (U11 and U12). It is the shape the Futbol Island 9v9 lessons start with.',
  faq:[
   {q:'Is 3-2-3 the best 9v9 formation?',a:'No shape is best for every team. The 3-2-3 is popular because it is balanced and close to the 4-3-3 that many clubs use in 11v11. It needs two midfielders who work hard.'},
   {q:'How does a 3-2-3 defend with only two midfielders?',a:'The wide forwards help. When the other team has the ball, they drop back beside the midfielders. That makes a line of four or five across the middle.'},
   {q:'Who covers when an outside back goes forward?',a:'The center back slides toward that side and stays behind the ball. The other outside back comes inside a little. The formation gives starting jobs, and support changes as the ball moves.'},
   {q:'How does the 3-2-3 turn into a 4-3-3?',a:'Add one defender and one midfielder. The back three becomes a back four and the midfield pair becomes a three. The wide forwards and the center forward keep the same jobs.'}],
  lessonIds:['learn9_shape','nx9_twoblocks','nx9_midfieldhelper','nx9_fourthrunner','bld_9_usekeeper']},
 {slug:'9v9-3-3-2',format:'9v9',shape:'3-3-2',best:'Teams with two forwards who work as a pair.',watch:'No wide forwards. Wide midfielders must run.',
  desc:'The 3-3-2 formation for 9v9 soccer: three defenders, three midfielders, two strikers. Diagram, roles, strengths, weak spots and free lessons for kids.',
  answer:'The 3-3-2 is a 9v9 soccer formation with three defenders, three midfielders and two strikers. It suits teams that want a strong middle of the field and two players near goal.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 4:CB 2:RB','Midfielders|11:LM 8:CM 7:RM','Strikers|10:LS 9:RS'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and starts attacks with a pass to the back three.'},
   {title:'Three defenders (2, 3 and 4)',pos:'center-back',job:'Cover the width of the field together. The middle one covers behind the other two.'},
   {title:'Central midfielder (8)',pos:'central-midfielder',job:'Stays in the middle to link passes and to protect the space in front of the defenders.'},
   {title:'Wide midfielders (7 and 11)',pos:'winger',job:'Give the width outside the two strikers, then run back to make a line of three.'},
   {title:'Two strikers (9 and 10)',pos:'striker',job:'Split the jobs. One shows for the ball, the other stays high to keep a defender busy.'}],
  strengths:['Three midfielders match up well against most 9v9 midfields.','Two strikers can combine close to goal.','Three lines of three and two are easy to keep tidy.'],
  weak:[
   {spot:'The front two have no width of their own.',cover:'The wide midfielders run outside them, one at a time.',lesson:'nx9_twostrikers'},
   {spot:'If a wide midfielder joins the attack, the midfield is one short.',cover:'The other two midfielders slide across, and the three is rebuilt as soon as the ball is lost.',lesson:'nx9_midfieldjoins'},
   {spot:'Two strikers pressing three defenders can be passed around.',cover:'A wide midfielder joins the press only when the others protect behind.',lesson:'next9_frontpairpress'}],
  attack:'With the ball, the wide midfielders move up outside the strikers. One striker comes short to link with the midfield and the other stays on the last defender.',
  defend:'Without the ball, the three midfielders stay in one line in front of the three defenders. The two strikers stand between the other team’s defenders and midfielders.',
  suits:'Teams with two forwards who enjoy playing together, and wide midfielders who can run up and back. Good for players aged 11 and 12.',
  faq:[
   {q:'What is the difference between 3-3-2 and 3-2-3?',a:'One player. The 3-3-2 has an extra midfielder and two strikers in the middle. The 3-2-3 has an extra forward and two of the forwards start wide. The 3-3-2 is stronger in the middle. The 3-2-3 is wider up front.'},
   {q:'How should two strikers move in a 3-3-2?',a:'At different depths. One shows toward the ball to connect with the midfield. The other keeps depth, staying high so a defender has to stay back too.'},
   {q:'Who gives width in a 3-3-2?',a:'The wide midfielders. They supply the width that the front line is missing, so they need energy to go forward and come back.'}],
  lessonIds:['nx9_twostrikers','nx9_midfieldjoins','next9_frontpairpress','next9_spareback']},
 {slug:'9v9-2-3-2-1',format:'9v9',shape:'2-3-2-1',best:'Teams that keep the ball well.',watch:'Only two at the back. The middle needs a protector.',
  desc:'The 2-3-2-1 formation for 9v9 soccer in plain words: two defenders and four lines of passing. Diagram, roles, weak spots and how kids can cover them.',
  answer:'The 2-3-2-1 is a 9v9 soccer formation with two defenders, three midfielders, two attacking midfielders and one striker. It suits teams that pass well, because it puts many players in the middle of the field at different heights.',
  rows:['Goalkeeper|1:GK','Defenders|5:LCB 4:RCB','Midfielders|3:LM 6:CM 2:RM','Attacking midfielders|10:LAM 8:RAM','Striker|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Acts as an extra passer behind the two defenders, and stays alert for balls played over them.'},
   {title:'Two center backs (4 and 5)',pos:'center-back',job:'Defend the middle together and move apart with the ball so the team can pass out.'},
   {title:'Central midfielder (6)',pos:'defensive-midfielder',job:'Sits in front of the two defenders. Becomes the third protector when the other team attacks.'},
   {title:'Wide midfielders (2 and 3)',pos:'winger',job:'Give all the width. They attack along the sideline and get back to defend it.'},
   {title:'Two attacking midfielders (8 and 10)',pos:'attacking-midfielder',job:'Stand between the other team’s lines to receive, turn and pass to the striker.'},
   {title:'Striker (9)',pos:'striker',job:'Stays high, holds the ball and finishes chances.'}],
  strengths:['Four lines give the passer short choices at many heights.','Lots of players close together in the middle make it easy to win the ball back.','Players learn to receive between the other team’s lines.'],
  weak:[
   {spot:'Two defenders can face three forwards.',cover:'The central midfielder drops into the middle as the third protector.',lesson:'nx9_twobackcover'},
   {spot:'Only two players are wide, one on each side.',cover:'The wide midfielders stay wide, and a center back covers the far side if they are caught up the field.',lesson:'next9_backtwoflanks'},
   {spot:'It is a hard shape to remember.',cover:'Teach it as a triangle of three at the back (two defenders and the 6) and a triangle of three at the front.'}],
  attack:'With the ball, the two center backs move apart and the central midfielder shows between them. The wide midfielders go high and wide. The two attacking midfielders look for space behind the other team’s midfield.',
  defend:'Without the ball, the central midfielder drops close to the two defenders and the wide midfielders run back beside them. The attacking midfielders block passes through the middle.',
  suits:'Teams in their second 9v9 season with confident passers. It is harder to learn than a 3-2-3, so it is not a first shape.',
  faq:[
   {q:'Why is the 2-3-2-1 called a Christmas tree?',a:'Because of how it looks from above. The lines get narrower toward the front: three, then two, then one, like the top of a tree.'},
   {q:'Is two at the back safe in 9v9?',a:'Only with help. When the other team keeps three forwards high, the central midfielder must become the third protector in the middle while the two defenders handle the wide forwards.'},
   {q:'Who plays wide in a 2-3-2-1?',a:'The two wide midfielders. Nobody else starts near the sideline, so they need to be fit and to enjoy both attacking and defending.'}],
  lessonIds:['nx9_twobackcover','next9_backtwoflanks','learn9_receive','bld_9_usekeeper']},
 {slug:'9v9-3-1-3-1',format:'9v9',shape:'3-1-3-1',best:'Teams with a calm holding midfielder.',watch:'The holder is alone when the ball is lost.',
  desc:'The 3-1-3-1 formation for 9v9 soccer: three defenders, one holding midfielder, three attacking midfielders, one striker. Diagram, roles and lessons.',
  answer:'The 3-1-3-1 is a 9v9 soccer formation with three defenders, one holding midfielder, three attacking midfielders and one striker. It suits teams that want to attack with many players and have one calm player to hold the middle.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 4:CB 2:RB','Holding midfielder|6:DM','Attacking midfielders|11:LM 10:AM:4 7:RM','Striker|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and gives the back three a safe pass backward.'},
   {title:'Three defenders (2, 3 and 4)',pos:'center-back',job:'Each can have a forward to mark, so they stay close together and talk a lot.'},
   {title:'Holding midfielder (6)',pos:'defensive-midfielder',job:'The holder stays in front of the defenders. Takes the ball from them and passes it forward.'},
   {title:'Wide attacking midfielders (7 and 11)',pos:'winger',job:'Attack along the sides and cross or cut inside. Run back to help when the ball is lost.'},
   {title:'Central attacking midfielder (10)',pos:'attacking-midfielder',job:'Plays just behind the striker. Drops back to help the holder when the other team has the ball.'},
   {title:'Striker (9)',pos:'striker',job:'The highest player. Gives depth and finishes attacks.'}],
  strengths:['Four attackers arrive near the other goal.','The holder gives the defenders an easy pass in the middle.','Players learn the 6, 10 and 9 jobs they will meet in 11v11.'],
  weak:[
   {spot:'The single holder can be outnumbered right after the ball is lost.',cover:'The central attacking midfielder runs back to share the job.',lesson:'next9_singleholder'},
   {spot:'If the wide midfielders stay high, the outside backs face two attackers.',cover:'The wide midfielder on the ball side tracks back. The far one can stay a little higher.'},
   {spot:'There is a lot of space either side of the holder.',cover:'The three defenders step up to keep the team short.'}],
  attack:'With the ball, the holder shows for the first pass and the three attacking midfielders spread across the field behind the striker. One of them runs past the striker when the ball goes wide.',
  defend:'Without the ball, the central attacking midfielder drops beside the holder and the wide midfielders come back level with them. That makes a line of four in front of the back three.',
  suits:'Teams aged 11 and 12 that like to attack and have one player who is happy to stay behind the ball.',
  faq:[
   {q:'What does the holding midfielder do in a 3-1-3-1?',a:'The holder stays between the defenders and the attackers. With the ball, the holder is the link. Without it, the holder slows the other team down in the middle until help arrives.'},
   {q:'Is 3-1-3-1 an attacking formation?',a:'Yes. It starts with four players ahead of the holder. The price is that those players must run back when the ball is lost, starting with the central attacking midfielder.'},
   {q:'What is the difference between 3-1-3-1 and 3-2-3?',a:'In a 3-1-3-1 one midfielder holds and one plays high behind the striker. In a 3-2-3 the two midfielders play side by side. The wide players and the back three are much the same.'}],
  lessonIds:['next9_singleholder','learn9_shape','trn_9_recover','learn9_cover']},
 {slug:'9v9-4-3-1',format:'9v9',shape:'4-3-1',best:'Getting ready for a back four in 11v11.',watch:'One striker alone. Fullbacks must join in.',
  desc:'The 4-3-1 formation for 9v9 soccer: a back four, three midfielders and one striker. Diagram, each role, weak spots and how young players cover them.',
  answer:'The 4-3-1 is a 9v9 soccer formation with four defenders, three midfielders and one striker. It suits teams that want to learn a back four before moving to 11v11, and teams that need to be hard to score against.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 5:LCB 4:RCB 2:RB','Midfielders|11:LM 8:CM 7:RM','Striker|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and uses the two center backs to start attacks.'},
   {title:'Two center backs (4 and 5)',pos:'center-back',job:'Protect the middle. One goes to the ball, the other covers.'},
   {title:'Two fullbacks (2 and 3)',pos:'fullback',job:'Defend the sides and run forward along the sideline to support attacks.'},
   {title:'Central midfielder (8)',pos:'central-midfielder',job:'Links the defenders to the striker and helps protect the middle.'},
   {title:'Wide midfielders (7 and 11)',pos:'winger',job:'Attack along the sides and get close to the striker when the ball goes forward.'},
   {title:'Striker (9)',pos:'striker',job:'Holds the ball up until the midfielders arrive, then looks to score.'}],
  strengths:['Four defenders cover the whole width, so there is always cover.','Fullbacks learn to defend and to attack, a job they keep in 11v11.','The three midfielders and four defenders are hard to play through.'],
  weak:[
   {spot:'One striker has little help.',cover:'The wide midfielders run forward as soon as the striker has the ball.'},
   {spot:'Four defenders can all stay back, leaving too few players ahead of the ball.',cover:'One fullback goes forward at a time. The other three slide across.',lesson:'learn9_cover'},
   {spot:'The team can sit too deep and invite pressure.',cover:'The back four moves up together when the ball moves up.'}],
  attack:'With the ball, the center backs move apart and one fullback goes forward. The wide midfielders move inside a little to get close to the striker.',
  defend:'Without the ball, four defenders and three midfielders make two lines close together. The striker waits near the halfway line for a pass after the ball is won.',
  suits:'Teams in their last 9v9 season before 11v11, and teams playing a strong attacking opponent.',
  faq:[
   {q:'Is four at the back too many in 9v9?',a:'It can be, if nobody goes forward. A back four works in 9v9 when a fullback joins each attack. Then the team attacks with five or six players and still has three behind the ball.'},
   {q:'How does a 4-3-1 get ready for 11v11?',a:'It teaches the back four: two center backs and two fullbacks who share the space. In 11v11, the 4-3-3 keeps that back four and the three midfielders and adds two wide forwards.'},
   {q:'How does the lone striker get help?',a:'From the wide midfielders. When the ball is played up, they run close to the striker so there is a short pass. One fullback follows to keep the width.'}],
  lessonIds:['learn9_cover','bld_9_usekeeper','learn9_switch','gap9_runnerhandoff']},
 // ---- 11v11 --------------------------------------------------------------------------------------------------------------
 {slug:'11v11-4-3-3',format:'11v11',shape:'4-3-3',best:'Teams with wingers who like to attack.',watch:'Space behind the fullbacks when they go forward.',
  desc:'The 4-3-3 soccer formation explained for kids, parents and coaches: diagram, all eleven roles, strengths, weak spots, and free lessons to practise it.',
  answer:'The 4-3-3 is an 11v11 soccer formation with four defenders, three midfielders and three forwards. It suits teams with quick wingers and midfielders who pass well, and many youth clubs teach it first when players move to the full-size game.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 5:LCB 4:RCB 2:RB','Midfielders|8:LCM 6:DM:-9 10:RCM','Forwards|11:LW 9:ST 7:RW'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and supports passes behind the defense.'},
   {title:'Two center backs (4 and 5)',pos:'center-back',job:'Protect the middle. They share the space instead of guarding fixed spots.'},
   {title:'Two fullbacks (2 and 3)',pos:'fullback',job:'Defend the sides and support attacks. They go outside or inside, wherever the lane is empty.'},
   {title:'Deeper midfielder (6)',pos:'defensive-midfielder',job:'Starts in front of the center backs. Offers a pass back and covers behind a fullback who goes forward.'},
   {title:'Two midfielders ahead (8 and 10)',pos:'central-midfielder',job:'Offer passing angles ahead of the 6. One can come short to get free when the fullbacks are blocked.'},
   {title:'Two wingers (7 and 11)',pos:'winger',job:'Give the team width. They take on the fullback, cross, or cut inside to shoot.'},
   {title:'Center forward (9)',pos:'striker',job:'Gives the team height. Finishes chances and helps defend from the front.'}],
  strengths:['Width from the wingers and the fullbacks on both sides.','A midfield triangle gives the passer short choices.','Three forwards can press the other team’s defenders high up the field.'],
  weak:[
   {spot:'When a fullback goes forward, there is space behind.',cover:'The deeper midfielder moves across to cover, and the center backs stay in the middle.',lesson:'learn11_shape'},
   {spot:'Winger and fullback can end up in the same lane.',cover:'Fill the lane nobody holds: if the winger is wide, the fullback moves inside, and the other way round.',lesson:'exp11_insidefullback'},
   {spot:'The center forward can be alone against two center backs.',cover:'A midfielder runs forward to join, and the wingers come inside near goal.'}],
  attack:'With the ball, the center backs move apart and the fullbacks step up. The wingers stay wide and high, the center forward pins the center backs and the three midfielders make a triangle around the ball.',
  defend:'Without the ball, the wingers drop back beside the midfielders, so the team defends with a line of four and a line of five. The center forward blocks the pass between the other team’s center backs.',
  suits:'Players aged 13 and up who have played 3-2-3 in 9v9: the wide forwards, the center forward and the midfield link already feel familiar.',
  faq:[
   {q:'Why do so many youth teams play 4-3-3?',a:'It covers the whole field with clear lines, and it teaches every kind of job: center back, fullback, three different midfielders, winger and center forward. It also follows on from the 3-2-3 used in 9v9.'},
   {q:'What do the three midfielders do in a 4-3-3?',a:'They connect the lines. In the shape our lessons use, one starts deeper and two offer angles ahead. Without the ball, all three help protect the middle.'},
   {q:'What is 1-4-3-3?',a:'The same formation with the goalkeeper counted. 4-3-3 leaves out the keeper. 1-4-3-3 includes them, which is how U.S. Soccer writes it.'},
   {q:'Should the fullback overlap in a 4-3-3?',a:'Sometimes. The rule in our lesson is to fill the lane nobody holds. With the winger wide, the fullback moves inside. With the winger inside, the fullback goes wide.'}],
  lessonIds:['learn11_shape','exp11_insidefullback','exp11_checking8','exp11_droppingnine','def_11_shift']},
 {slug:'11v11-4-4-2',format:'11v11',shape:'4-4-2',best:'Teams that want simple lines and two strikers.',watch:'Two central midfielders can be outnumbered.',
  desc:'The 4-4-2 soccer formation explained simply: two lines of four and two strikers. See the diagram, each role, strengths, weak spots and free lessons.',
  answer:'The 4-4-2 is an 11v11 soccer formation with four defenders, four midfielders and two strikers. It suits teams that want simple, tidy lines and two players close to goal.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 5:LCB 4:RCB 2:RB','Midfielders|11:LM 6:LCM 8:RCM 7:RM','Strikers|10:LS 9:RS'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and organises the back four.'},
   {title:'Two center backs (4 and 5)',pos:'center-back',job:'Mark the other team’s forwards and cover each other.'},
   {title:'Two fullbacks (2 and 3)',pos:'fullback',job:'Defend the sides and support the wide midfielder in front of them.'},
   {title:'Two central midfielders (6 and 8)',pos:'central-midfielder',job:'One goes toward the ball, the other stays deeper. They swap all game.'},
   {title:'Two wide midfielders (7 and 11)',pos:'winger',job:'Give width, cross the ball, and come back to make the line of four.'},
   {title:'Two strikers (9 and 10)',pos:'striker',job:'Play at two depths. One goes for the first ball, the other waits for what comes next.'}],
  strengths:['Two lines of four are easy to see and easy to keep in shape.','Two strikers can win the ball and the loose ball after it.','Each wide area has two players: a fullback and a wide midfielder.'],
  weak:[
   {spot:'Two central midfielders can face three.',cover:'One striker drops back to help, or a wide midfielder comes inside.'},
   {spot:'Flat lines leave room between them for the other team to receive.',cover:'Keep the lines close: when the midfield steps up, the defense steps up too.',lesson:'def_11_shift'},
   {spot:'A long ball to the strikers can be lost at once.',cover:'Strikers stand at two depths and a midfielder arrives underneath for the loose ball.',lesson:'exp11_secondball'}],
  attack:'With the ball, the wide midfielders stay near the sidelines and the fullbacks move up behind them. The two strikers stand at different depths so one can receive and one can run.',
  defend:'Without the ball, the two lines of four slide across the field together toward the ball. The strikers block passes into the other team’s midfield.',
  suits:'Teams new to 11v11 that need a clear shape without the ball, and teams with two forwards who play well together.',
  faq:[
   {q:'Is the 4-4-2 old-fashioned?',a:'It is one of the oldest shapes still in use, and it still works. Its two lines of four are a simple way to learn how a team slides across the field together.'},
   {q:'What do the two strikers do in a 4-4-2?',a:'They occupy different depths around the first pass. They should not both go for the ball at the same point. One challenges, and the other reads where the ball will drop.'},
   {q:'What is the difference between 4-4-2 and 4-3-3?',a:'The 4-4-2 has two strikers and four across midfield. The 4-3-3 has one center forward, two wingers higher up and three central midfielders. The 4-3-3 has one more player in the middle.'}],
  lessonIds:['exp11_secondball','def_11_shift','def_11_pressurecover','learn11_shape']},
 {slug:'11v11-4-2-3-1',format:'11v11',shape:'4-2-3-1',best:'Teams with a creative attacking midfielder.',watch:'The striker is alone if the three behind stay away.',
  desc:'The 4-2-3-1 soccer formation in plain words: a back four, two holding midfielders, three attackers and one striker. Diagram, roles, weak spots, lessons.',
  answer:'The 4-2-3-1 is an 11v11 soccer formation with four defenders, two holding midfielders, three attacking midfielders and one striker. It suits teams that want two players guarding the middle and a creative player behind the striker.',
  rows:['Goalkeeper|1:GK','Defenders|3:LB 5:LCB 4:RCB 2:RB','Holding midfielders|6:LDM 8:RDM','Attacking midfielders|11:LW 10:AM 7:RW','Striker|9:ST'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and starts attacks through the center backs or the two holders.'},
   {title:'Two center backs (4 and 5)',pos:'center-back',job:'Protect the middle, with two midfielders in front to help them.'},
   {title:'Two fullbacks (2 and 3)',pos:'fullback',job:'Defend the sides. They can go forward more freely, because two holders cover.'},
   {title:'Two holding midfielders (6 and 8)',pos:'defensive-midfielder',job:'Guard the space in front of the defense. One may join the attack while the other stays.'},
   {title:'Attacking midfielder (10)',pos:'attacking-midfielder',job:'Plays between the other team’s midfield and defense. Looks for the pass that makes a chance.'},
   {title:'Two wide attackers (7 and 11)',pos:'winger',job:'Start wide, then run inside toward goal or stay out to cross.'},
   {title:'Striker (9)',pos:'striker',job:'Stays highest. Holds the ball for the three behind and finishes chances.'}],
  strengths:['Two holders make the middle hard to attack through.','Four attackers at different heights are hard to mark.','Fullbacks can attack with cover behind them.'],
  weak:[
   {spot:'The striker is alone if the attacking midfielders stay far away.',cover:'The 10 stays close to the striker, and the wide attackers run inside when the ball goes up.'},
   {spot:'Both holders can stay too deep, so the team is split in two.',cover:'One holder steps forward to link, the other stays. They do not go together.',lesson:'trn_11_restdefense'},
   {spot:'A striker who drops deep can pull a center back out.',cover:'A holder picks up the dropping forward, so the center back can stay in line.',lesson:'exp11_droppingnine'}],
  attack:'With the ball, the fullbacks go forward and the wide attackers come inside. The 10 finds space behind the other team’s midfield. One holder steps up to link and one stays back.',
  defend:'Without the ball, the wide attackers drop beside the two holders, making a line of four. The 10 and the striker block the passes into the middle.',
  suits:'Players aged 13 and up with some 11v11 experience. It has more lines to learn than a 4-4-2 or a 4-3-3.',
  faq:[
   {q:'What is the difference between 4-2-3-1 and 4-3-3?',a:'Where the midfield triangle points. In a 4-2-3-1, two midfielders sit deep and one plays high behind the striker. In the 4-3-3 our lessons use, one sits deep and two play ahead.'},
   {q:'What is a double pivot?',a:'A name for the two holding midfielders in a 4-2-3-1. Pivot means a point that play turns around. The two of them take the ball from the defenders and turn the play forward.'},
   {q:'What does the number 10 do in a 4-2-3-1?',a:'The 10 is the attacking midfielder in the middle of the line of three. This player receives between the lines, turns if there is room, and links the midfield to the striker.'}],
  lessonIds:['bld_11_throughlines','exp11_droppingnine','trn_11_restdefense','learn11_cutback']},
 {slug:'11v11-3-5-2',format:'11v11',shape:'3-5-2',best:'Teams with two fit wing-backs.',watch:'Space behind the wing-backs.',
  desc:'The 3-5-2 soccer formation explained for young players: three center backs, two wing-backs, three midfielders and two strikers. Diagram, roles, lessons.',
  answer:'The 3-5-2 is an 11v11 soccer formation with three center backs, five midfielders (two of them wing-backs) and two strikers. It suits teams with two fit wide players who can attack and defend the whole sideline.',
  rows:['Goalkeeper|1:GK','Center backs|5:LCB 4:CB 6:RCB','Midfielders|3:LWB 8:LCM 7:CM 10:RCM 2:RWB','Strikers|11:LS 9:RS'],
  roles:[
   {title:'Goalkeeper (1)',pos:'goalkeeper',job:'Protects the goal and gives the three center backs a pass behind them.'},
   {title:'Three center backs (4, 5 and 6)',pos:'center-back',job:'The middle one covers. The outer two step out to the sides when a wing-back is beaten.'},
   {title:'Two wing-backs (2 and 3)',pos:'wingback',job:'Own the whole side. They attack like wingers and defend like fullbacks.'},
   {title:'Three central midfielders (7, 8 and 10)',pos:'central-midfielder',job:'Protect the inside routes and keep the ball moving from side to side.'},
   {title:'Two strikers (9 and 11)',pos:'striker',job:'Work as a pair. One comes short, one runs behind.'}],
  strengths:['Three center backs and three central midfielders make the middle very strong.','Two strikers keep the other team’s center backs busy.','Wing-backs give width without using a forward.'],
  weak:[
   {spot:'There is space behind a wing-back who has gone forward.',cover:'The outer center back on that side slides across, and the other two shift over.',lesson:'def_11_shift'},
   {spot:'A wing-back who presses at the wrong time leaves a winger free.',cover:'The wing-back goes only when the touch is slow and a center back covers the winger behind.',lesson:'exp11_wingbackcue'},
   {spot:'Only one player is wide on each side.',cover:'A central midfielder or a striker moves out to help make two against one.'}],
  attack:'With the ball, the wing-backs move up level with the midfield or higher, so the team attacks in a 3-3-4 or 3-2-5 picture. The three center backs spread across the width.',
  defend:'Without the ball, the wing-backs drop beside the three center backs to make a back five. The three midfielders stay close together in front.',
  suits:'Older, fitter players, usually 14 and up. The wing-back job is the hardest running job on the team, so the squad needs more than two players who can do it.',
  faq:[
   {q:'Is 3-5-2 the same as 5-3-2?',a:'They are the same players in different moments. With the ball, the wing-backs are high and it looks like 3-5-2. Without the ball, they drop beside the center backs and it looks like 5-3-2.'},
   {q:'What is the difference between a wing-back and a fullback?',a:'A fullback starts in a back four and has a winger in front. A wing-back starts higher, outside three center backs, and has the whole side alone.'},
   {q:'Is 3-5-2 good for youth teams?',a:'It can be for older players. Younger teams often find a back four simpler, because the fullback and winger share the side. Three at the back asks the outer center backs to defend wide spaces.'}],
  lessonIds:['exp11_wingbackcue','exp11_checking8','def_11_shift','exp11_safetyfive']},
 // ---- futsal -------------------------------------------------------------------------------------------------------------
 {slug:'futsal-2-2',format:'futsal',shape:'2-2',best:'Beginners. Two pairs are easy to learn.',watch:'A big gap between the two pairs.',
  desc:'The 2-2 futsal formation for kids, also called the box or square: two players behind, two ahead. Diagram, roles, weak spots and free futsal lessons.',
  answer:'The 2-2 is a futsal formation with two players behind and two ahead, plus the goalkeeper. In soccer terms it is two defenders and two forwards. It suits beginners, because the pairs are easy to see and every player has a partner.',
  rows:['Goalkeeper|1:GK','Rear pair|B:BACK B:BACK','Front pair|F:FRONT F:FRONT'],
  roles:[
   {title:'Goalkeeper',pos:'goalkeeper',job:'Protects the goal and starts play with a throw or a pass to the rear pair.'},
   {title:'Rear pair',job:'Connect play and protect behind. When one carries the ball forward, the other moves inside and stays behind the ball.'},
   {title:'Front pair',job:'Stretch the court. They give the passes forward and are the first to defend when the ball is lost.'}],
  strengths:['Two pairs give width and depth with a very simple picture.','There is always a partner close by for a pass.','It teaches the most useful futsal habit: one goes, one supports behind.'],
  weak:[
   {spot:'A gap opens between the rear pair and the front pair.',cover:'A front player comes back toward the ball to make a short pass possible.',lesson:'prn_f_support'},
   {spot:'If both rear players go forward, nobody protects the goal.',cover:'When one rear player advances, the other stays behind the ball.',lesson:'learnf_shape22'},
   {spot:'Four players in a square are easy to mark.',cover:'Move. Players change places with a pass and a run, so the square never stands still.'}],
  attack:'With the ball, the front pair goes wide and high. One rear player carries forward and the other moves inside as the deeper support.',
  defend:'Without the ball, the front pair drops to the halfway line and the four players make a small box in front of their goal.',
  suits:'Children new to futsal, and outdoor teams playing futsal in winter. Two-two is a starting relationship, and players move with the game.',
  faq:[
   {q:'What is the box formation in futsal?',a:'Another name for the 2-2. From above, the four outfield players stand like the corners of a box or square.'},
   {q:'Is 2-2 a good futsal formation for kids?',a:'Yes, to start with. Two pairs are easy to explain. Once players can keep a supporting angle behind the ball, many coaches add the 3-1 with a pivot.'},
   {q:'Do futsal players stay in their positions?',a:'No. Futsal players change places all the time. The formation is a starting relationship. Players move with the game, rather than staying in four fixed squares.'}],
  lessonIds:['learnf_shape22','prn_f_support','def_f_goalside','f_pared']},
 {slug:'futsal-1-2-1-diamond',format:'futsal',shape:'1-2-1',tag:'Diamond',best:'Teams that pass and move well.',watch:'The middle opens if one ala is slow to tuck in.',
  desc:'The 1-2-1 diamond futsal formation for kids: one fixo, two alas, one pivot. See the diagram, the roles, how the diamond moves and free futsal lessons.',
  answer:'The 1-2-1 diamond is a futsal formation with one player at the back (the fixo), two on the sides (the alas) and one at the front (the pivot). In soccer terms that is a defender, two wingers and a striker. It suits teams that pass and move, because the diamond gives the ball carrier a choice in three directions.',
  rows:['Goalkeeper|1:GK','Fixo|F:FIXO','Alas|A:ALA A:ALA','Pivot|P:PIVOT'],
  roles:[
   {title:'Goalkeeper',pos:'goalkeeper',job:'Protects the goal and can act as an extra passer behind the fixo.'},
   {title:'Fixo',job:'The deepest outfield player. Supports behind the ball and guards the other team’s most forward player.'},
   {title:'Two alas',job:'Ala means wing. They form the sides of the diamond, give width with the ball and close the middle without it.'},
   {title:'Pivot',job:'The front point. Receives with a defender close, then turns or lays the ball off to a teammate.'}],
  strengths:['Triangles everywhere: fixo, ala and pivot are always at different heights.','The pivot gives a pass forward and the fixo gives a pass back.','The same diamond works for defending.'],
  weak:[
   {spot:'When the ball goes to one side, the middle can open.',cover:'The far ala moves into the gap, and the block shifts toward the ball together.',lesson:'expf_diamondshift'},
   {spot:'A marked pivot cannot turn.',cover:'A teammate supports from a different line than the passer, as the third player.',lesson:'expf_thirdplayer'},
   {spot:'If the pivot comes short, nobody is high.',cover:'An ala runs into the space behind, if the marker has followed the pivot.',lesson:'expf_replacepivot'}],
  attack:'With the ball, the alas go wide and the pivot stays high to stretch the court. The fixo stays behind the ball as the safe pass.',
  defend:'Without the ball, the diamond shrinks and shifts toward the ball. One ala presses, the other closes the middle, and the fixo stays with the central attacker.',
  suits:'Players who know the 2-2 and are ready for different jobs. Many coaches use the names diamond and 3-1 for nearly the same shape: in the diamond the alas start a little higher.',
  faq:[
   {q:'What is a diamond formation in futsal?',a:'Four outfield players standing as the points of a diamond: one at the back, one on each side and one at the front. It is written 1-2-1.'},
   {q:'What are the futsal positions called?',a:'Goalkeeper, fixo, ala and pivot. The fixo supports behind the ball. The two alas, or wings, offer width on either side. The pivot provides depth ahead, toward the goal the team attacks.'},
   {q:'How does a diamond defend?',a:'As a unit. It shifts toward the ball without opening the passing lane through the middle. When one side presses, the other ala helps close the middle.'}],
  lessonIds:['expf_diamondshift','expf_thirdplayer','expf_replacepivot','f_pivot']},
 {slug:'futsal-3-1',format:'futsal',shape:'3-1',best:'Teams with a strong pivot.',watch:'The pivot can be cut off from the other three.',
  desc:'The 3-1 futsal formation for kids: a fixo, two alas and a pivot. See the diagram, each court role, strengths, weak spots and free futsal lessons.',
  answer:'The 3-1 is a futsal formation with three players behind the ball (a fixo and two alas) and one pivot ahead. In soccer terms the pivot is the striker. It suits teams with a player who can hold the ball with a defender close, and it is the shape the Futbol Island futsal lessons start with.',
  rows:['Goalkeeper|1:GK','Back three|A:ALA F:FIXO:-9 A:ALA','Pivot|P:PIVOT'],
  roles:[
   {title:'Goalkeeper',pos:'goalkeeper',job:'Protects the goal. The keeper is counted separately from the 3-1.'},
   {title:'Fixo',job:'Supports behind the ball in the middle. The safe pass when the way forward is blocked.'},
   {title:'Two alas',job:'The wings. They offer width on either side and run forward to join the pivot.'},
   {title:'Pivot',job:'Provides depth ahead, toward the goal. Holds the ball, turns, or lays it off.'}],
  strengths:['Three players behind the ball make it safe to keep possession.','The pivot is a clear target for a pass forward.','The roles are easy to name, so players learn to read each other.'],
  weak:[
   {spot:'An opponent can stand in the lane to the pivot.',cover:'Use the fixo to keep the ball, move it to the other side, then look again.',lesson:'learnf_roles31'},
   {spot:'The pivot can be alone and marked.',cover:'An ala runs past as the third player when the pivot lays the ball off.',lesson:'expf_thirdplayer'},
   {spot:'Three players in a line at the back are easy to press.',cover:'The alas stand at different heights, and the keeper helps as a spare player.',lesson:'expf_keeperoverload'}],
  attack:'With the ball, the alas widen and the pivot stays high or checks short. When the pivot gets the ball, an ala runs forward to support.',
  defend:'Without the ball, the pivot drops toward the halfway line and the three behind form a triangle in front of the goal.',
  suits:'Teams that have learned the 2-2 and have a player who likes to play with their back to goal. These are changing jobs: everyone learns to attack, defend and help teammates.',
  faq:[
   {q:'What does 3-1 mean in futsal?',a:'Three-one counts the four outfield players: three behind and one ahead. The goalkeeper is separate. Futsal has five players per team, one goalkeeper and four outfield players.'},
   {q:'What does the pivot do in futsal?',a:'The pivot provides depth ahead. The pivot reads the marker and chooses: turn toward goal if there is room, or lay the ball off to a teammate.'},
   {q:'What is the difference between 3-1 and the diamond?',a:'Very little. Both have a fixo, two alas and a pivot. In a 3-1 the alas start deeper, close to the fixo. In a 1-2-1 diamond they start a little higher. Many coaches use both names for one shape.'}],
  lessonIds:['learnf_roles31','f_pivot','expf_replacepivot','expf_denypivot']},
];
export const FORMATIONS:readonly Formation[]=RAW.map(make);
export const formationBySlug=(slug:string)=>FORMATIONS.find(f=>f.slug===slug);
export const formationsIn=(format:GuideFormat)=>FORMATIONS.filter(f=>f.format===format);
/** Formations whose diagram includes a position (lib/site/positions.ts slugs). */
export const formationsUsing=(pos:string)=>FORMATIONS.filter(f=>f.lines.some(l=>l.spots.some(s=>s.pos===pos)));

// ---- the three format guides (head terms: "7v7 soccer formations" …) ------------------------------------------------------------
export type FormatGuide={format:Exclude<GuideFormat,'futsal'>;path:string;crumb:string;title:string;description:string;h1:string;lead:string;blurb:string;
 basics:string[];pickTitle:string;pick:string[];faq:Faq[];lessons:SiteLesson[]};
const LEAGUE='Leagues can set their own details, so check your league’s rules.';
export const FORMAT_GUIDES:readonly FormatGuide[]=[
 {format:'7v7',path:formatGuidePath('7v7'),crumb:'7v7 formations',blurb:'2-3-1, 3-2-1, 2-2-2 and 3-1-2 compared, with diagrams',
  title:'7v7 Soccer Formations: 2-3-1, 3-2-1 and More, for Kids',
  description:'The four common 7v7 soccer formations (2-3-1, 3-2-1, 2-2-2, 3-1-2) compared in one table, with diagrams and a plain answer on which one to use.',
  h1:'7v7 soccer formations',
  lead:'In 7v7 soccer each team has a goalkeeper and six outfield players. The four common formations are the 2-3-1, the 3-2-1, the 2-2-2 and the 3-1-2. For most teams of nine and ten-year-olds, the 2-3-1 is the best place to start.',
  basics:['Seven players: one goalkeeper and six outfield players.','In the United States, 7v7 is the game for players under 9 and under 10 (U9 and U10) in the U.S. Soccer standards.','Those standards add a build-out line. On a goal kick, or when the keeper holds the ball, the other team waits behind it until the ball is played.',
   'The keeper may not punt or drop-kick the ball, so the team learns to pass out from the back.','Offside is only called between the build-out line and the goal line, not between halfway and the build-out line.',LEAGUE],
  pickTitle:'Which 7v7 formation should my team use?',
  pick:['Start with the 2-3-1 if you are not sure. It has two defenders, wide players and a link player in the middle, so children meet every kind of job.',
   'Choose the 3-2-1 if your team lets in many goals or is new to the game. Three defenders give more cover, and the outside backs can still attack.',
   'Choose the 2-2-2 for a first season if pairs are easier for your players to understand. Move on once they can spread out.',
   'Choose the 3-1-2 if you have two forwards who work well together and one midfielder with a lot of energy.',
   'Whatever you pick, a formation is a starting arrangement. Players can leave their starting spot when the game needs it, and every child should try every position.'],
  faq:[
   {q:'What is the best formation for 7v7 soccer?',a:'There is no single best one. The 2-3-1 is the most common starting point because it is balanced and teaches width. The best formation for your team is the one your players understand.'},
   {q:'What does 1-2-3-1 mean?',a:'It is the 2-3-1 with the goalkeeper counted first: one keeper, two defenders, three midfielders, one forward. U.S. Soccer writes youth formations this way.'},
   {q:'Should 7v7 players stay in one position all season?',a:'No. At nine and ten, children learn most by trying every job: defending, playing wide, playing in the middle and scoring. Rotate positions from game to game.'},
   {q:'How many defenders should a 7v7 team have?',a:'Two or three. Two defenders leave more players for midfield. Three defenders are safer but need the outside backs to go forward, or the team has too few attackers.'}],
  lessons:pick(['learn7_roles','learn7_shape','learn7_buildout','next7_offsideboundary','bld_7_usekeeper','prn_7_spread'])},
 {format:'9v9',path:formatGuidePath('9v9'),crumb:'9v9 formations',blurb:'3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1 and 4-3-1 compared, with diagrams',
  title:'9v9 Soccer Formations: 3-2-3, 3-3-2 and More, for Kids',
  description:'Five 9v9 soccer formations (3-2-3, 3-3-2, 2-3-2-1, 3-1-3-1, 4-3-1) compared in one table, with diagrams and a clear answer on which to choose.',
  h1:'9v9 soccer formations',
  lead:'In 9v9 soccer each team has a goalkeeper and eight outfield players. Common formations are the 3-2-3, the 3-3-2, the 2-3-2-1, the 3-1-3-1 and the 4-3-1. For most teams of eleven and twelve-year-olds, the 3-2-3 is a good first choice.',
  basics:['Nine players: one goalkeeper and eight outfield players.','In the United States, 9v9 is the game for players under 11 and under 12 (U11 and U12) in the U.S. Soccer standards.','The field is bigger than a 7v7 field and smaller than a full-size one, so there is more running and more passing.',
   'Offside counts in the other team’s half, as in the full game.','Throw-ins are taken with both hands, from behind and over the head, with both feet on the ground.',LEAGUE],
  pickTitle:'Which 9v9 formation should my team use?',
  pick:['Start with the 3-2-3 if you are not sure. It has three clear units, wide forwards and a back three, and it grows into the 4-3-3 at 11v11.',
   'Choose the 3-3-2 if you have two strikers who play well as a pair and wide midfielders who can run.',
   'Choose the 3-1-3-1 if you have one calm player to hold the middle and you want four attackers ahead.',
   'Choose the 4-3-1 in the last season before 11v11, to learn the back four, or against a much stronger opponent.',
   'Keep the 2-3-2-1 for teams that already pass well. It has more lines to remember and only two defenders.'],
  faq:[
   {q:'What is the best formation for 9v9 soccer?',a:'The 3-2-3 is the most common starting point, because it is balanced and prepares players for the 4-3-3. But the best shape is the one that fits your players and that they understand.'},
   {q:'What does 1-3-2-3 mean?',a:'It is the 3-2-3 with the goalkeeper counted first: one keeper, three defenders, two midfielders and three forwards.'},
   {q:'How do 7v7 formations turn into 9v9 formations?',a:'Add one defender and one forward. The 7v7 2-3-1 becomes a 3-2-3 when a center back joins the two defenders and the wide midfielders move up to play as wide forwards beside the striker.'},
   {q:'Should a 9v9 team play with two or three defenders?',a:'Three is simpler: one can go to the ball and two still cover. Two defenders work only if a midfielder drops in as the third protector when the other team attacks.'}],
  lessons:pick(['learn9_shape','nx9_twoblocks','nx9_twostrikers','next9_singleholder','nx9_twobackcover','bld_9_usekeeper'])},
 {format:'11v11',path:formatGuidePath('11v11'),crumb:'11v11 formations',blurb:'4-3-3, 4-4-2, 4-2-3-1 and 3-5-2 compared, with diagrams',
  title:'11v11 Soccer Formations: 4-3-3, 4-4-2 and More, for Kids',
  description:'The main 11v11 soccer formations (4-3-3, 4-4-2, 4-2-3-1, 3-5-2) compared in one table, with diagrams and a plain answer on which suits a youth team.',
  h1:'11v11 soccer formations',
  lead:'In 11v11 soccer each team has a goalkeeper and ten outfield players. Four formations cover most of what young players meet: the 4-3-3, the 4-4-2, the 4-2-3-1 and the 3-5-2. Teams moving up from 9v9 usually find the 4-3-3 the easiest step.',
  basics:['Eleven players: one goalkeeper and ten outfield players. That is the most the Laws of the Game allow.','In the United States, players move to 11v11 at under 13 (U13) in the U.S. Soccer standards.','The field and the goals are full size, so teams need to stay close together to cover the space.',
   'A formation is written from the back: 4-3-3 means four defenders, three midfielders and three forwards.','With the goalkeeper counted it becomes 1-4-3-3.',LEAGUE],
  pickTitle:'Which 11v11 formation should my team use?',
  pick:['Start with the 4-3-3 if your players come from a 9v9 3-2-3. The back line gets one more defender, the midfield gets one more player, and the three forwards keep their jobs.',
   'Choose the 4-4-2 if your team needs a simple shape without the ball. Two lines of four are easy to see and to coach.',
   'Choose the 4-2-3-1 if you want two midfielders guarding the middle and you have a creative player to put behind the striker.',
   'Choose the 3-5-2 only with older, fit players. The two wing-backs must cover the whole side of the field.',
   'The numbers describe where players start. Everyone still moves to help with the ball and to defend without it.'],
  faq:[
   {q:'What is the best formation for a youth 11v11 team?',a:'Many youth teams start with the 4-3-3, because it follows on from 9v9 and covers the field evenly. A 4-4-2 is simpler without the ball. The best one is the shape your players understand.'},
   {q:'What do the numbers in a soccer formation mean?',a:'They count the outfield players in each line, from the defense forward. A 4-4-2 has four defenders, four midfielders and two strikers. The goalkeeper is left out unless the shape is written 1-4-4-2.'},
   {q:'What is the most attacking formation?',a:'A shape does not attack by itself. Players do. A 4-3-3 starts with three forwards, but a 4-4-2 with fullbacks who go forward can attack with just as many players.'},
   {q:'When do kids start playing 11v11?',a:'In the U.S. Soccer standards, at under 13. Before that, children play 7v7 at U9 and U10 and 9v9 at U11 and U12. Some leagues differ.'}],
  lessons:pick(['learn11_shape','exp11_insidefullback','exp11_secondball','exp11_wingbackcue','def_11_shift','bld_11_throughlines'])},
];
export const formatGuide=(f:GuideFormat)=>FORMAT_GUIDES.find(g=>g.format===f);

// ---- the hub -------------------------------------------------------------------------------------------------------------------
export const FORMATIONS_HUB={path:FORMATIONS_HUB_PATH,crumb:'Soccer formations',blurb:`${FORMATIONS.length} formations for 7v7, 9v9, 11v11 and futsal, each with a diagram`,
 title:'Soccer Formations for Kids: 7v7, 9v9, 11v11, Futsal',
 description:`${FORMATIONS.length} soccer formations explained for kids, parents and coaches, with a diagram for each: 7v7, 9v9, 11v11 and futsal shapes, roles and free lessons.`,
 h1:'Soccer formations for kids',
 lessons:pick(['learn7_shape','learn9_shape','learn11_shape','learnf_roles31','learnf_shape22']),
 lead:'A soccer formation is the way a team lines up at the start: how many defenders, midfielders and forwards stand in front of the goalkeeper. This guide explains the common formations for 7v7, 9v9, 11v11 and futsal, each with a diagram and the job of every player.',
 what:['A formation is a starting arrangement. It gives every player a first job and a place to return to.','It is written as numbers from the back to the front. A 2-3-1 has two defenders, three midfielders and one forward.',
  'The goalkeeper is usually left out of the numbers. U.S. Soccer counts the keeper first, so the same shape is written 1-2-3-1.','Players do not stay on their spots. They move to help the teammate with the ball, and to protect the goal without it.',
  'The numbers on our diagrams follow a common coaching custom, such as 1 for the goalkeeper and 9 for the striker. Players can wear any shirt number.'],
 groups:{'7v7':'Seven players a side. In the U.S. Soccer standards, the game for under-9s and under-10s.','9v9':'Nine players a side. In the U.S. Soccer standards, the game for under-11s and under-12s.',
  '11v11':'The full game, played from under-13 upward.',futsal:'Five players a side on a hard court, with a smaller ball made to bounce low.'} as Record<GuideFormat,string>,
 faq:[
  {q:'What is a formation in soccer?',a:'The starting arrangement of a team: how many players are in defense, midfield and attack. It gives players starting jobs. They still move as the game changes.'},
  {q:'How do you read formation numbers?',a:'From the back to the front, leaving out the goalkeeper. A 4-3-3 is four defenders, three midfielders and three forwards. Add a 1 at the start to count the goalkeeper: 1-4-3-3.'},
  {q:'What formation should a kids’ team play?',a:'One the players can understand. Common first choices are the 2-3-1 in 7v7, the 3-2-3 in 9v9 and the 4-3-3 in 11v11, because each one leads into the next.'},
  {q:'Does the formation matter for young players?',a:'A little. Learning the jobs matters more: spread out with the ball, squeeze together without it, and help the teammate who has the ball. A good formation makes those jobs easy to see.'}] as Faq[]};
