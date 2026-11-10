import {lessonById,type SiteLesson} from './lessons';
import type {Faq} from './safety';
import {grid,gridSize,type GridScene,type RawGrid} from './grid';
import {DRILLS_A} from './drillsA';
import {DRILLS_B} from './drillsB';
import {DRILLS_C} from './drillsC';
import {DRILLS_D} from './drillsD';
import {GUIDE_DRILLS} from './drillLinks';
/**
 * The DRILLS cluster (SEO cluster 3, Nov 10 2026): /learn/soccer-drills and one page per drill under it, for the volunteer
 * coaches and parents who search "u8 soccer drills", "sharks and minnows" or "first touch drills". All page words live in typed
 * data (this file is the types, the checks and the hub; the drills themselves are in drillsA-D.ts, the age and skill guides in
 * lib/site/drillGuides.ts, the practice plans in lib/site/plans.ts). US searchers say "soccer": pages lead with "soccer" and say
 * "football" once near the top (lib/site/guides.ts GUIDE_NAMES). These are common coaching games with no single owner; every
 * description and diagram here is written in our own words, nothing is copied from another site.
 *
 * PROJECT PRINCIPLE (AGENTS.md): every drill says which real-game moment it trains (`game`) and links to the lesson that
 * teaches the idea (`lessons`, checked against the catalog; a wrong id throws).
 *
 * SOURCES (all checked Nov 10 2026):
 *  - U.S. Soccer Grassroots Coach Education, "Play-Practice-Play (PPP) Model: An Evidence-Based Approach" (read in full from a
 *    state association's copy of the U.S. Soccer document; the page on ussoccer.com that used to describe it returned 404 on
 *    this date): children "have little desire to stand in lines, run laps, perform drills, or be lectured"; first play phase in
 *    2v2, 3v3, 4v4; practice phase with frequent repetitions in game-like activities; final game.
 *    https://www.soccermaine.com/wp-content/uploads/sites/230/2023/11/play-practice-play_model.pdf
 *  - U.S. Soccer, "Five things to know about the 4v4 online grassroots course" (4v4 for players aged 6, 7 and 8, no goalkeepers,
 *    no offside): https://www.ussoccer.com/stories/2018/02/five-things-to-know-about-the-4v4-online-grassroots-course
 *  - US Youth Soccer Coaching Education Department, "How to Write a Training Session Plan" (session length by age: U6 45 min,
 *    U8 45-60, U10 60-75, U12 75): https://www.louisvillesoccer.com/docs/How%20to%20Write%20a%20Training%20Session%20Plan.pdf
 *  - US Youth Soccer Player Development Model (U6: short attention span, one task at a time; U8: attention a bit longer; no
 *    goalkeepers in 3v3 and 4v4 through age 8; the goalkeeper is new at U10; U10: lengthened attention span). An older
 *    document: its advice on heading is superseded by the current rule below and is NOT used.
 *    https://www.playlouisianasoccer.org/wp-content/uploads/sites/205/2023/12/US_Youth_Soccer_Player_Development_Model.pdf
 *  - Heading: lib/site/rules.ts (heading-rules-for-kids; U.S. Soccer standards and US Youth Soccer Rule 305): no heading at age
 *    10 and under in games or practice, limits in practice at 11 and 12. This cluster therefore has NO heading drill at any
 *    age (the module throws if a drill tells players to head the ball), and high balls are controlled with thigh, chest or foot.
 *  - The FA, England Football Learning session library (1v1 and small-sided practices for 7-11s in small marked areas). Seen
 *    through a search summary only on this date, so nothing is quoted from it: https://learn.englandfootball.com/sessions
 *  - Field and ball sizes, game formats by age: lib/site/sizes.ts (U.S. Soccer small-sided standards).
 *  - The repo's own lessons (public/lessons/*.json) and concept list (lib/learning/conceptMap.ts) for all football wording.
 * NOT VERIFIED and therefore not stated: any statistic about touches or learning speed, what professional teams do, exact
 * U.S. Soccer minutes for each stage of a session. Grid sizes are sensible starting points written for these pages, and
 * every page tells the coach to change the size to fit the group. No named players, no invented numbers.
 * SAFETY RULES of this cluster: no player sits out for long (every "out" has a way back in), no laps or punishment running,
 * goalkeeper drills only from U10 with soft, underarm or rolled service, no heading.
 */
export type Age='U6'|'U8'|'U10'|'U12';
export const AGES:readonly Age[]=['U6','U8','U10','U12'];
export const AGE_YEARS:Record<Age,string>={U6:'ages 5 and 6',U8:'ages 7 and 8',U10:'ages 9 and 10',U12:'ages 11 and 12'};
export type SkillId='dribbling'|'first-touch'|'passing'|'shooting'|'attacking-1v1'|'defending-1v1'|'scanning'|'small-sided'|'goalkeeper'|'warm-up';
export const SKILLS:readonly {id:SkillId;name:string;line:string}[]=[
 {id:'dribbling',name:'Dribbling and ball mastery',line:'One ball each: lots of touches, turns and changes of speed.'},
 {id:'first-touch',name:'First touch',line:'Receiving the ball so the next action is easy.'},
 {id:'passing',name:'Passing and receiving',line:'Passing to a teammate, then moving to help again.'},
 {id:'shooting',name:'Shooting and finishing',line:'Striking at goal, and what to do after the shot.'},
 {id:'attacking-1v1',name:'1v1 attacking',line:'Taking on one defender with a change of speed or direction.'},
 {id:'defending-1v1',name:'1v1 defending',line:'Staying goal-side, slowing the attacker and winning the ball.'},
 {id:'scanning',name:'Scanning and awareness',line:'Looking around before the ball arrives.'},
 {id:'small-sided',name:'Small-sided games',line:'Real games with few players, so everyone is on the ball.'},
 {id:'goalkeeper',name:'Goalkeeping basics',line:'Footwork, safe hands and starting the attack. From U10, with soft service.'},
 {id:'warm-up',name:'Warm-ups and fun games',line:'Games that start practice with a ball and a smile.'},
];
export type DrillLink={path:string;name:string;line?:string};
export type RawDrill={slug:string;name:string;h1?:string;skill:SkillId;ages:Age[];title:string;desc:string;answer:string;players:string;equipment:string;time:string;spaceNote?:string;scene:RawGrid;
 steps:string[];cues:string[];easier:string;harder:string;mistakes:string[];game:string;home?:string;lessons:string[];links?:DrillLink[];related:string[];faq:Faq[];heading?:true};
export type Drill=Omit<RawDrill,'scene'|'lessons'|'links'>&{path:string;h1:string;scene:GridScene;picture:string;space:string;agesText:string;lessons:SiteLesson[];cta:SiteLesson;links:DrillLink[]};
export const DRILLS_HUB_PATH='/learn/soccer-drills';
export const drillPath=(slug:string)=>`${DRILLS_HUB_PATH}/${slug}`;
export const drillPicture=(slug:string)=>`${slug}-drill.png`;
export const pickLessons=(ids:string[],where:string)=>ids.map(id=>{const l=lessonById(id);if(!l)throw new Error(`${where}: lesson ${id} is not in the lesson catalog`);return l;});
export const agesText=(a:readonly Age[])=>a.length===1?`${a[0]} (${AGE_YEARS[a[0]]})`:`${a[0]} to ${a[a.length-1]} (ages ${AGE_YEARS[a[0]].replace(/^ages (\d+).*$/,'$1')} to ${AGE_YEARS[a[a.length-1]].replace(/^.* (\d+)$/,'$1')})`;
const sentences=(s:string)=>(s.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[]).length;
const HEAD_IT=/\bhead (?:it|the ball)\b|\bheaders?\b|\bheading (?:drill|practice)\b/i;
function build(r:RawDrill):Drill{
 const w=`drill ${r.slug}`;
 if(sentences(r.answer)!==2)throw new Error(`${w}: the answer must be exactly two sentences`);
 if(!r.ages.length||r.ages.some((a,i)=>!AGES.includes(a)||(i>0&&AGES.indexOf(a)!==AGES.indexOf(r.ages[i-1])+1)))throw new Error(`${w}: ages must be a run of U6, U8, U10, U12`);
 if(r.skill==='goalkeeper'&&(r.ages.includes('U6')||r.ages.includes('U8')))throw new Error(`${w}: no goalkeeper drills before U10 (no goalkeepers in 4v4)`);
 const all=[r.answer,...r.steps,...r.cues,r.easier,r.harder,...r.mistakes,r.game,r.home??''].join(' ');
 if(r.heading||HEAD_IT.test(all))throw new Error(`${w}: this cluster has no heading drills (lib/site/rules.ts, heading-rules-for-kids)`);
 if(r.steps.length<4||r.cues.length<3||r.cues.length>4||r.mistakes.length<3||r.faq.length<3||r.faq.length>5||r.lessons.length<2)throw new Error(`${w}: steps, cues, mistakes, faq or lessons are short`);
 const scene=grid(r.scene),lessons=pickLessons(r.lessons,w);
 return {...r,path:drillPath(r.slug),h1:r.h1??`${r.name} soccer drill`,scene,picture:drillPicture(r.slug),space:gridSize(scene)+(r.spaceNote?`. ${r.spaceNote}`:''),agesText:agesText(r.ages),lessons,cta:lessons[0],links:r.links??[]};
}
export const DRILLS:readonly Drill[]=[...DRILLS_A,...DRILLS_B,...DRILLS_C,...DRILLS_D].map(build);
export const drillBySlug=(slug:string)=>DRILLS.find(d=>d.slug===slug);
for(const d of DRILLS){
 if(DRILLS.filter(x=>x.slug===d.slug).length>1)throw new Error(`drill ${d.slug} is listed twice`);
 if(d.related.length<3)throw new Error(`drill ${d.slug}: at least three related drills`);
 for(const r of d.related)if(r===d.slug||!drillBySlug(r))throw new Error(`drill ${d.slug}: related drill ${r} has no page`);
}
export const drillsBySkill=(id:SkillId)=>DRILLS.filter(d=>d.skill===id);
export const drillsForAge=(a:Age)=>DRILLS.filter(d=>d.ages.includes(a));
export const drill=(slug:string):Drill=>{const d=drillBySlug(slug);if(!d)throw new Error(`no drill ${slug}`);return d;};
/** One line for lists: what the drill trains (the second sentence of its answer). */
export const drillLine=(d:Drill)=>(d.answer.match(/[^.!?]+[.!?]+(?=\s|$)/g)||[d.answer])[1].trim();
export const DRILL_SAFETY_LINE='Change the size of the area to fit your group: bigger makes it easier for the player with the ball, smaller makes it harder. Everyone who goes out comes straight back in, and nobody runs laps.';

export const DRILLS_HUB={path:DRILLS_HUB_PATH,crumb:'Soccer drills',blurb:`${DRILLS.length} soccer drills and practice games for U6 to U12, each with a setup diagram, coaching points and the lesson it trains`,
 title:'Soccer Drills for Kids: Fun Games by Age and Skill',h1:'Soccer drills for kids',
 description:'Fun soccer drills and practice games for kids aged 5 to 12, sorted by skill and by age. Each one has a setup diagram, steps, coaching points and FAQs.',
 lead:`Here are ${DRILLS.length} soccer drills and practice games for players aged 5 to 12. Each one has a setup diagram with sizes in yards, numbered steps, short coaching points you can say out loud, and the moment of a real game it prepares players for.`,
 more:'Pick by skill or by age below. Every drill keeps every child moving with a ball: no lines, no laps and no long talks. Each one also links to a free Futbol Island lesson that teaches the same idea on a moving pitch.',
 how:['Each child has a ball whenever the drill allows it.','Play the game first, then stop for one coaching point, then play again.','If a child is “out”, give them a quick job that brings them back in.','Finish every practice with a small game, such as 3v3 or 4v4.','Give water breaks often, and more often in the heat.'],
 faq:[{q:'What are the best soccer drills for beginners?',a:'Games where every child has a ball: Sharks and Minnows, Red Light Green Light, gates dribbling and Pirates and Treasure. They teach dribbling and stopping the ball without anyone standing in a line.'},
  {q:'How many drills should I use in one practice?',a:'Two or three, plus a game at the end. Young players need time to get good at a game, so it is better to repeat a favorite than to explain a new one every ten minutes.'},
  {q:'What soccer drills can kids do at home?',a:'Toe taps, a cone weave, wall passing and turn-and-go all work alone in a small space. Our at-home page lists the drills that need one player or one parent.'},
  {q:'Should young kids practice heading?',a:'No. In US youth soccer, players aged 10 and under do not head the ball in games or practice, and practice heading is limited at 11 and 12. None of the drills here use heading.'},
  {q:'How long should a soccer practice be?',a:'US Youth Soccer’s coaching guidance suggests about 45 minutes at U6, 45 to 60 at U8, 60 to 75 at U10 and 75 at U12. Our practice plans are built to those lengths.'}] as Faq[],
 lessons:pickLessons(['learn7_carry','learn7_receive','prn_7_support','def_7_goalside'],'drills hub')};
/** Drill links for an existing guide page (position, rule, glossary term): lib/site/drillLinks.ts GUIDE_DRILLS. */
export const drillLinksFor=(guidePath:string):DrillLink[]=>(GUIDE_DRILLS[guidePath]??[]).map(s=>{const d=drill(s);return {path:d.path,name:`${d.name} (soccer drill)`,line:drillLine(d)};});
for(const list of Object.values(GUIDE_DRILLS))for(const s of list)drill(s);
