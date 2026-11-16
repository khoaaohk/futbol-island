import {POSITIONS_HUB,positionBySlug,type Position} from './positions';
import {FORMATIONS_HUB,formationBySlug,formationsUsing,type Formation} from './formations';
import {formationImage,positionImage} from './guides';
/**
 * Comparison pages and tables (SEO, Nov 15 2026): one canonical page per "A vs B" search, never a copy of an existing page.
 *  - Pages: fullback vs wingback, striker vs winger (positions), 4-3-3 vs 4-4-2 (formations). Every table cell is copied from
 *    the two pages' own data (lib/site/positions.ts, formations.ts); only the short answer of striker vs winger and the "which
 *    one fits" and "switching between them" lines are written here (practical coaching notes, no new facts or numbers).
 *  - Tables on existing pages (no new page, the page already ranks for the topic): "Futsal vs soccer" on
 *    /learn/soccer-rules/futsal-rules (#futsal-vs-soccer), and "7v7 vs 9v9 vs 11v11" on /learn/7v7-9v9-11v11 (#compare).
 * SOURCES for the two tables (checked Nov 15 2026): the FIFA Futsal Laws of the Game 2025-26 (5 players, 2 x 20 minutes of
 * playing time, one timeout per team per period, kick-in, goal clearance, four seconds, no offside, accumulated fouls, 6 m and
 * 10 m marks, goal 3 m x 2 m, ball 62-64 cm); the IFAB Laws of the Game (11 players, 2 x 45 minutes, throw-in, goal kick,
 * offside, penalty mark 12 yd, goal 8 yd x 8 ft, ball 68-70 cm, keeper six seconds with the ball in hand); U.S. Soccer's
 * small-sided standards and US Youth Soccer's playing rules for the team sizes, the same sources as lib/site/sizes.ts and
 * lib/site/rules.ts (copied from those pages, so the numbers match).
 */
export type Comparison={slug:string;path:string;kind:'position'|'formation';hub:{name:string;path:string};a:string;b:string;title:string;h1:string;desc:string;
 answer:string;head:[string,string,string];rows:[string,string,string][];fit:string[];switching:string[];links:{path:string;name:string;line:string}[];images:string[]};
export const COMPARISONS_UPDATED='2026-11-15';
const pos=(slug:string):Position=>{const p=positionBySlug(slug);if(!p)throw new Error(`comparisons: position ${slug}`);return p;};
const form=(slug:string):Formation=>{const f=formationBySlug(slug);if(!f)throw new Error(`comparisons: formation ${slug}`);return f;};
const shapes=(p:Position)=>formationsUsing(p.slug).filter(f=>f.format==='11v11').map(f=>f.shape).join(', ')||'—';
const posRows=(a:Position,b:Position):[string,string,string][]=>[
 ['The job',a.job,b.job],['Where they stand',a.where,b.where],['With the ball',a.withBall[0],b.withBall[0]],['Without the ball',a.withoutBall[0],b.withoutBall[0]],
 ['Shirt numbers',a.numbers,b.numbers],['11v11 formations with one',shapes(a),shapes(b)],['It suits',a.suits,b.suits]];
const lines=(f:Formation)=>f.lines.filter(l=>!/goal/i.test(l.name)).map(l=>`${l.spots.length} ${l.name.toLowerCase()}`).join(', ');
const formRows=(a:Formation,b:Formation):[string,string,string][]=>[
 ['The lines',lines(a),lines(b)],['Best for',a.best,b.best],['Watch out for',a.watch,b.watch],['With the ball',a.attack,b.attack],['Without the ball',a.defend,b.defend],
 ['Main strength',a.strengths[0],b.strengths[0]],['Who it suits',a.suits,b.suits]];
const faqAnswer=(list:{q:string;a:string}[],re:RegExp,what:string)=>{const x=list.find(f=>re.test(f.q));if(!x)throw new Error(`comparisons: no FAQ answer for ${what}`);return x.a;};
const PH={name:POSITIONS_HUB.crumb,path:POSITIONS_HUB.path},FH={name:FORMATIONS_HUB.crumb,path:FORMATIONS_HUB.path};
const FB=pos('fullback'),WB=pos('wingback'),ST=pos('striker'),WG=pos('winger'),F433=form('11v11-4-3-3'),F442=form('11v11-4-4-2');
export const COMPARISONS:readonly Comparison[]=[
 {slug:'fullback-vs-wingback',path:`${POSITIONS_HUB.path}/fullback-vs-wingback`,kind:'position',hub:PH,a:FB.slug,b:WB.slug,
  title:'Fullback vs Wingback in Soccer: The Difference',h1:'Fullback vs wingback: what is the difference?',
  desc:'Fullback vs wingback in soccer, explained for kids and coaches: where each one stands, their jobs with and without the ball, and which formations use them.',
  answer:faqAnswer(WB.faq,/difference between a wingback and a fullback/i,'wingback'),head:['Topic',FB.name,WB.name],rows:posRows(FB,WB),
  fit:['A team with four defenders (a 4-3-3 or a 4-4-2) plays fullbacks. A team with three center backs (a 3-5-2) plays wingbacks.',
   'Both jobs need a lot of running. A wingback runs more, because nobody plays in front of them on that side.'],
  switching:['A fullback who loves to attack is already halfway to the wingback job: the overlapping run down the side is the same run, a wingback just makes it far more often.',
   'Going from wingback back to fullback means staying home more. When one fullback goes forward, the fullback on the other side usually stays back with the center backs.',
   'Try it in practice: play one half with four defenders and one half with three center backs, then ask the wide players how their running changed.',
   'Watch for tired legs. A wingback covers the whole side of the field, so give them a rest when you can, above all on hot days.'],
  links:[{path:FB.path,name:FB.h1,line:FB.short},{path:WB.path,name:WB.h1,line:WB.short},{path:form('11v11-3-5-2').path,name:'The 3-5-2 formation',line:'The shape with two wingbacks'},{path:F433.path,name:'The 4-3-3 formation',line:'The shape with two fullbacks'},{path:POSITIONS_HUB.path,name:'All soccer positions',line:'Every position by number, 1 to 11'}],
  images:[positionImage(FB.slug),positionImage(WB.slug)]},
 {slug:'striker-vs-winger',path:`${POSITIONS_HUB.path}/striker-vs-winger`,kind:'position',hub:PH,a:ST.slug,b:WG.slug,
  title:'Striker vs Winger in Soccer: The Difference',h1:'Striker vs winger: what is the difference?',
  desc:'Striker vs winger in soccer, explained for kids: where each forward plays, what they do with and without the ball, their shirt numbers and who each job suits.',
  answer:'Both are forwards. The striker plays in the middle, closest to the other team’s goal, and the main job is to score. A winger plays wide on the left or right, stretches the other team and makes chances from the side by dribbling, crossing or cutting inside to shoot.',
  head:['Topic',ST.name,WG.name],rows:posRows(ST,WG),
  fit:['If you love scoring, are brave in a crowded box and clever about when to run, try striker.','If you are quick, love to dribble at a defender and enjoy crossing, try winger.'],
  switching:['Many young forwards play both. A winger who cuts inside to shoot is already doing part of the striker’s job.',
   'A striker who drifts out wide pulls a defender away from the middle, and that opens a gap for a winger to run into.',
   'In small-sided games there are fewer forwards, so one player often does both jobs: scoring in the middle and helping out on the side.',
   'Try it in practice: let the striker and a winger swap places every few minutes, then talk about which one felt more natural.'],
  links:[{path:ST.path,name:ST.h1,line:ST.short},{path:WG.path,name:WG.h1,line:WG.short},{path:'/cards/strikers',name:'Famous strikers',line:'Player cards'},{path:'/cards/wingers',name:'Famous wingers',line:'Player cards'},{path:F433.path,name:'The 4-3-3 formation',line:'One striker with a winger on each side'},{path:POSITIONS_HUB.path,name:'All soccer positions',line:'Every position by number, 1 to 11'}],
  images:[positionImage(ST.slug),positionImage(WG.slug)]},
 {slug:'4-3-3-vs-4-4-2',path:`${FORMATIONS_HUB.path}/4-3-3-vs-4-4-2`,kind:'formation',hub:FH,a:F433.slug,b:F442.slug,
  title:'4-3-3 vs 4-4-2 Formation: The Difference',h1:'4-3-3 vs 4-4-2: which formation is better?',
  desc:'4-3-3 vs 4-4-2 soccer formations compared for kids and coaches: the lines, strengths, weak spots, how each one attacks and defends, and who each one suits.',
  answer:faqAnswer(F442.faq,/difference between 4-4-2 and 4-3-3/i,'4-4-2'),head:['Topic',F433.shape,F442.shape],rows:formRows(F433,F442),
  fit:['Neither is better for every team. Pick the shape that fits your players.',`The ${F433.shape} suits ${F433.best.toLowerCase().replace(/\.$/,'')}. The ${F442.shape} suits ${F442.best.toLowerCase().replace(/\.$/,'')}.`],
  switching:['Both shapes start with the same back four, so a team can switch between them without changing its defenders.',
   'To go from a 4-4-2 to a 4-3-3, one of the two forwards drops into the middle of midfield and the two wide midfielders push up to become wingers.',
   'Teams change shape during a game too: a 4-3-3 often looks like a 4-5-1 when it defends, with the wingers dropping back beside the midfielders.',
   'Try it in practice: play the first half in one shape and the second half in the other, then ask the players where they found more space.'],
  links:[{path:F433.path,name:F433.h1,line:F433.best},{path:F442.path,name:F442.h1,line:F442.best},{path:'/learn/11v11-soccer-formations',name:'11v11 soccer formations',line:'Every 11v11 shape compared'},{path:'/tools/11v11-lineup-builder',name:'11v11 lineup builder',line:'Put your players on the field and print it'},{path:FORMATIONS_HUB.path,name:'All soccer formations',line:'Every shape for 7v7, 9v9, 11v11 and futsal'}],
  images:[formationImage(F433.slug),formationImage(F442.slug)]},
];
export const comparisonBySlug=(slug:string)=>COMPARISONS.find(c=>c.slug===slug);
/** The comparison pages that involve a position or formation page (linked from that page). */
export const comparisonsFor=(path:string)=>COMPARISONS.filter(c=>c.links.slice(0,2).some(l=>l.path===path));

// ---- tables on existing pages ----------------------------------------------------------------------------------------------------
export const FUTSAL_VS_SOCCER={id:'futsal-vs-soccer',title:'Futsal vs soccer: the rules side by side',head:['Rule','Futsal','Soccer (11v11)'],rows:[
 ['Players','5 a side, including the goalkeeper','11 a side, including the goalkeeper'],
 ['Game length','2 periods of 20 minutes of playing time (the clock stops)','2 halves of 45 minutes'],
 ['Substitutions','Unlimited, at any time, through the substitution zone','A set number in the Laws; youth leagues often allow more'],
 ['Ball','Size 4, 62 to 64 cm around, made to bounce low','Size 5, 68 to 70 cm around'],
 ['Goal','3 m wide and 2 m high','8 yards wide and 8 feet high'],
 ['Ball over the sideline','Kick-in from the line','Throw-in with both hands'],
 ['Ball over the end line (attackers last)','Goal clearance: the keeper throws or releases it','Goal kick'],
 ['Time to restart','4 seconds','No fixed time'],
 ['Offside','None','Yes'],
 ['Team fouls','Counted; from the 6th foul in a period, a direct free kick from 10 m with no wall','Not counted'],
 ['Penalty mark','6 m','12 yards (11 m)'],
 ['Timeouts','One per team in each period','None']] as [string,string,string][],
 note:'Sources: FIFA Futsal Laws of the Game 2025-26 and the IFAB Laws of the Game. Youth leagues change some details, such as game length.'};
/** 7v7 vs 9v9 vs 11v11 (U.S. Soccer small-sided standards and US Youth Soccer rules, as on the size charts and rule pages). */
export const TEAM_SIZES={id:'compare',title:'7v7 vs 9v9 vs 11v11 compared',head:['Topic','7v7','9v9','11v11'],rows:[
 ['Players on the field','7, including the goalkeeper','9, including the goalkeeper','11, including the goalkeeper'],
 ['Age groups (US)','U9 and U10','U11 and U12','U13 and older'],
 ['Field size','55 to 65 yd long, 35 to 45 yd wide','70 to 80 yd long, 45 to 55 yd wide','100 to 130 yd long, 50 to 100 yd wide (the Laws)'],
 ['Ball','Size 4','Size 4','Size 5'],
 ['Game length','2 halves of 25 minutes','2 halves of 30 minutes','2 x 35 minutes at 13U and 14U, up to 2 x 45 at 17U to 19U'],
 ['Build-out line','Yes','No','No'],
 ['Offside','Only between the build-out line and the goal line','From the halfway line, as in the full game','Law 11 in full'],
 ['Heading','No heading at 10 and under','Allowed in games from age 11 in US Youth Soccer, with practice limits; check your league','Allowed'],
 ['Goalkeeper punts','Not allowed','Allowed','Allowed']] as [string,string,string,string][],
 note:'Typical US youth standards (U.S. Soccer small-sided standards and US Youth Soccer playing rules); your league may differ.',
 links:[{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'},{path:'/learn/soccer-ball-size-by-age',name:'Soccer ball size by age',line:'Size 3, 4 or 5 for each age group'},
  {path:'/learn/7v7-soccer-formations',name:'7v7 soccer formations',line:'Shapes for U9 and U10 teams'},{path:'/learn/9v9-soccer-formations',name:'9v9 soccer formations',line:'Shapes for U11 and U12 teams'},
  {path:'/learn/11v11-soccer-formations',name:'11v11 soccer formations',line:'Shapes for the full game'}]};
