import {lessonById,type SiteLesson} from './lessons';
import type {Faq} from './safety';
import {NUMBERS,POSITIONS_HUB_PATH,positionPath} from './positions';
/**
 * /learn/soccer-positions/numbers (SEO CTR round, Nov 16 2026): "soccer positions by number" and the letters on team sheets
 * (CB, CDM, LCM, DF …). Search Console (28 days to Nov 14 2026) showed the site for "soccer positions by number", "center back
 * numbers", "cb numbers soccer", "football position numbers", "df soccer position", "cdm in soccer", "lcm soccer position" and
 * "what are the 11 positions in soccer", all landing on the hub at positions 40-75. One page that answers exactly that.
 *
 * SOURCES (checked Nov 16 2026): the numbers are the same coaching custom as NUMBERS in lib/site/positions.ts (1 keeper, 2 right
 * back, 3 left back, 4 and 5 center backs, 6 defensive midfielder, 7 right winger, 8 central midfielder, 9 striker, 10
 * attacking midfielder, 11 left winger), which differs by country and is fixed by no law. IFAB Law 3 (a team has at most
 * eleven players, one of them the goalkeeper);
 * the Laws do not link shirt numbers to positions): https://www.theifab.com/laws/latest/ . The abbreviations are
 * the labels the site's own formation diagrams use (lib/site/formations.ts rows: GK, LB, LCB, RCB, RB, DM, LCM, RCM, LW, ST,
 * RW …) plus the common team-sheet letters for the same jobs (CDM, CAM, CF, DF, MF, FW). No statistics and no named players.
 */
export const NUMBERS_PATH=`${POSITIONS_HUB_PATH}/numbers`;
export const NUMBERS_UPDATED='2026-11-16';
const pick=(ids:string[]):SiteLesson[]=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`numbers page lesson ${id} is not in the lesson catalog`);return l;});
export type Abbrev={abbr:string;name:string;slug?:string;line:string};
export const ABBREVIATIONS:readonly Abbrev[]=[
 {abbr:'GK',name:'Goalkeeper',slug:'goalkeeper',line:'The only player who may handle the ball, inside their own penalty area.'},
 {abbr:'CB',name:'Center back',slug:'center-back',line:'A defender in the middle. LCB and RCB are the left and right one of a pair.'},
 {abbr:'LB / RB',name:'Left back / right back',slug:'fullback',line:'The fullbacks: defenders on the left and right side.'},
 {abbr:'LWB / RWB',name:'Left / right wingback',slug:'wingback',line:'A wide player who defends and attacks the whole side, usually next to three center backs.'},
 {abbr:'DF or D',name:'Defender',line:'Any defender: a center back, a fullback or a wingback. Team sheets use it when they do not say which one.'},
 {abbr:'CDM or DM',name:'Central defensive midfielder',slug:'defensive-midfielder',line:'The holder in front of the defenders, often called the 6.'},
 {abbr:'CM',name:'Central midfielder',slug:'central-midfielder',line:'The middle player who links defense and attack, often called the 8.'},
 {abbr:'LCM / RCM',name:'Left / right central midfielder',slug:'central-midfielder',line:'The central midfielder on the left or right side of a two or a three in the middle.'},
 {abbr:'CAM or AM',name:'Central attacking midfielder',slug:'attacking-midfielder',line:'The playmaker just behind the striker, often called the 10.'},
 {abbr:'LM / RM',name:'Left / right midfielder',slug:'winger',line:'A wide midfielder, as in a 4-4-2. Higher up the field the same job is a winger.'},
 {abbr:'LW / RW',name:'Left / right winger',slug:'winger',line:'A wide attacker close to the touchline, often 11 on the left and 7 on the right.'},
 {abbr:'ST or CF',name:'Striker / center forward',slug:'striker',line:'The attacker closest to goal, often called the 9.'},
 {abbr:'MF / FW',name:'Midfielder / forward',line:'The general words for any midfielder or any attacker.'},
];
export const NUMBERS_PAGE={path:NUMBERS_PATH,crumb:'Positions by number',
 title:'Soccer Positions by Number: 1 to 11, CB, CDM and LCM',
 desc:'Soccer positions by number for kids: what 1 to 11 mean, center back numbers (4 and 5), and what CB, CDM, LCM, DF and ST stand for, with a field diagram.',
 h1:'Soccer positions by number: 1 to 11 and the letters',
 answer:'Soccer positions by number use the shirt numbers 1 to 11 as short names for places on the field: 1 is the goalkeeper, 2 to 5 are defenders, 6, 8 and 10 are midfielders, and 7, 9 and 11 are forwards. It is a custom, not a rule, so a team or a country can number its players differently.',
 more:'The letters on a team sheet, such as CB, CDM or LCM, are a second set of short names for the same jobs. This page explains both, with the 4-3-3 drawn on a field so you can see where each number stands.',
 eleven:['One goalkeeper (1).','Four defenders: right back (2), left back (3) and two center backs (4 and 5).','Three midfielders: a defensive midfielder (6), a central midfielder (8) and an attacking midfielder (10).','Three forwards: a right winger (7), a striker (9) and a left winger (11).'],
 elevenNote:'That is the eleven of a 4-3-3. In a 4-4-2 the 7 and 11 drop back to be wide midfielders and the 10 becomes a second striker, but the numbers keep the same jobs.',
 centerBack:['Center backs usually wear 4 and 5. In some countries the pair is 5 and 6, and in others the 4 is a midfielder.','With three center backs there is no single custom. The fullbacks usually move up to be wingbacks, and the coach names the three.','In a lineup the two are often written LCB and RCB: the left and the right center back.'],
 why:['Long ago the eleven starters wore 1 to 11, counted from the goalkeeper toward the front, so each number went with one place on the field.','Coaches still use the numbers as quick names: “play as a 6” means hold in front of the defenders, and “a 9” means a striker who stays near goal.','Today players can usually choose any number their team allows, so a striker may wear 21. The job, not the shirt, decides the position.'],
 small:['There is no fixed numbering for 7v7 or 9v9. Many coaches keep the 11v11 numbers as names for the jobs: in a 7v7 2-3-1, for example, the 9 is the forward and the 7 and 11 are the wide midfielders.','In futsal the positions have their own names: the fixo at the back, two alas on the sides and the pivot at the front.'],
 faq:[
  {q:'What number is a center back in soccer?',a:'Usually 4 and 5, one for each center back in a pair. Some countries use 5 and 6. It is a custom, not a rule, so a team can number its players any way it likes.'},
  {q:'What is a CDM in soccer?',a:'CDM stands for central defensive midfielder. It is the player who holds in front of the defenders, blocks passes through the middle and moves the ball on, often called the number 6.'},
  {q:'What does LCM mean in soccer?',a:'LCM means left central midfielder: the central midfielder on the left side when a team plays two or three in the middle. RCM is the one on the right.'},
  {q:'What does DF mean in soccer?',a:'DF, or sometimes D, simply means defender. A team sheet uses it for any defender, whether that player is a center back, a fullback or a wingback.'},
  {q:'What are the 11 positions in soccer?',a:'In a 4-3-3: goalkeeper, right back, left back, two center backs, a defensive, a central and an attacking midfielder, a right winger, a striker and a left winger.'}] as Faq[],
 lessons:pick(['learn11_shape','learn9_shape','learn7_roles']),
};
/** The 1-11 table with the letters each number usually carries in the site's 4-3-3 diagram. */
export const NUMBER_ROWS=NUMBERS.map(n=>({...n,path:positionPath(n.slug),abbr:({1:'GK',2:'RB',3:'LB',4:'CB (RCB)',5:'CB (LCB)',6:'CDM / DM',7:'RW',8:'CM (LCM)',9:'ST / CF',10:'CAM (or RCM)',11:'LW'} as Record<number,string>)[n.n]}));
