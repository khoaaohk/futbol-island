// Skill moves in the watchable plays and their quiz replays (docs/player-moves/MOVES.md § F): a lesson step may name a
// move one actor performs (FieldStep.skill), which lib/town/teachingMotion.ts plays on the rig (pose, facing and the
// ball on the move's authored path) and lib/town/fieldRuntime.ts renders. Run: node tests/lesson-skills.cjs
// Covers: the authored plays (each step's own line describes the action), timing (a keeper lets go on the lesson's
// release, a defender blocks the pass as it arrives, a turn meets the ball at its own tempo), facing (a carrier ends the
// move facing his path), ball hand-back, determinism, every catalog skill being a real move with a real actor, and the
// on-pitch quiz questions whose "Show me" replay plays a move.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Float64Array,Float32Array,URLSearchParams});return m.exports;}
const {teachingMotion,TEACHING_RELEASE,TEACHING_ARRIVAL}=load('lib/town/teachingMotion.ts'),{venueById}=load('lib/town/venues.ts'),{lessonVisualFrame}=load('lib/town/formatLessons.ts'),{SKILL_MOVES,SKILL_TYPES}=load('lib/graphics/skillMoves.ts');
const catalog=Object.fromEntries(['7v7','9v9','11v11','futsal'].map(f=>[f,JSON.parse(fs.readFileSync(`public/lessons/${f}.json`,'utf8'))]));
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));

// The plays (format, lesson, step, move, and the words in the step's own line that describe the action).
const PLAYS=[
 ['7v7','next7_dribbleroom',4,'insideCut',/changes direction/],
 ['7v7','learn7_receive',3,'cruyffTurn',/Turn with the ball close/],
 ['7v7','gap7_lostball',1,'blockTackle',/cuts out the pass/],
 ['9v9','next9_shortcornerbudget',11,'keeperRoll',/keeper releases/],
 ['11v11','trn_11_recover',6,'cruyffTurn',/moved beyond you/],
 ['futsal','f_pivot',3,'dragBack',/Turn into that room/],
 ['futsal','bld_f_splitcb',2,'keeperRoll',/goalkeeper releases/],
 ['futsal','bld_f_passtofeet',7,'shield',/Protect the ball/],
];
const RELEASE={keeperThrow:.5,keeperRoll:.46,keeperPunt:.42};
for(const [fmt,id,step,type,words] of PLAYS){
 const tag=`${fmt} ${id} S${step} ${type}`,lesson=catalog[fmt].find(l=>l.id===id);assert(lesson,tag+': lesson');
 const st=lesson.steps[step],sk=st.skill;assert(sk&&sk.type===type,tag+': authored');assert(words.test(st.say??st.desc),tag+': the step\'s own line describes the action');
 assert([...lesson.offense,...lesson.defense].some(a=>a.id===sk.id),tag+': a real actor');
 const v=venueById(fmt),spec=SKILL_MOVES[type],N=400,frames=[];
 for(let i=0;i<=N;i++){const pr=i/N,t=teachingMotion(lesson,v,step,pr);frames.push({pr,t,m:t.motions.get(sk.id)});}
 const on=frames.filter(f=>f.m.skill);assert(on.length>10,tag+': the move plays');
 for(let i=1;i<on.length;i++)assert(on[i].m.skill.progress>=on[i-1].m.skill.progress-1e-9,tag+': progress runs forward');
 assert(on.every(f=>Math.abs(f.m.skill.side)===1&&f.m.skill.type===type&&f.m.turnSmoothing===30&&f.m.kick===undefined),tag+': the move owns the body');
 assert(on[on.length-1].m.skill.progress>.9,tag+': it finishes inside the step');
 const pc=RELEASE[type]??(spec.contacts.length?spec.contacts[spec.contacts.length-1].p:spec.phases[0]);
 const at=frames.find(f=>f.m.skill&&f.m.skill.progress>=pc);assert(at,tag+': reaches its contact');
 const t0=frames[0].t;
 if(type in RELEASE){
  // The keeper lets go on the lesson's own release (the pass flight starts from his hand, above the grass).
  const rel=lessonVisualFrame(lesson,step,0).start+TEACHING_RELEASE*(lessonVisualFrame(lesson,step,0).end-lessonVisualFrame(lesson,step,0).start);
  assert(Math.abs(at.pr-rel)<.01,tag+`: released on the lesson's release (${at.pr.toFixed(3)} vs ${rel.toFixed(3)})`);
  assert(t0.skill.release&&t0.skill.release.y>.25,tag+': the pass leaves from the hand');
  assert(frames.filter(f=>f.t.skill&&f.t.skill.progress>.08&&f.t.skill.progress<pc).every(f=>f.t.skill.weight>.99&&f.t.skill.ball),tag+': the ball stays in the hands until then');
  const to=Math.atan2(t0.to.x-t0.poses.get(sk.id).x,t0.to.z-t0.poses.get(sk.id).z);assert(Math.abs(wrap(at.m.facing-to))<.3,tag+': he faces the team-mate he rolls it to');
 }else if(t0.pass&&t0.receiver===sk.id){
  // A defender reading the pass blocks it as it arrives (the lesson's pass brings the ball to his boot).
  const vf=lessonVisualFrame(lesson,step,0),arr=vf.start+TEACHING_ARRIVAL*(vf.end-vf.start);
  assert(Math.abs(at.pr-arr)<.01,tag+`: the block meets the pass as it arrives (${at.pr.toFixed(3)} vs ${arr.toFixed(3)})`);
  assert(on.every(f=>f.t.skill.weight===0),tag+': the lesson\'s pass owns the ball');
 }else{
  // A carrier: the ball rides the move's path through the action and hands back to the lesson's ball after it.
  assert(frames.filter(f=>f.t.skill&&f.t.skill.progress>.08&&f.t.skill.progress<spec.phases[2]).every(f=>f.t.skill.weight>.99&&f.t.skill.ball),tag+': the ball follows the move');
  assert(on[on.length-1].t.skill.weight<.2,tag+': then hands back');
  const a=frames[0].t.poses.get(sk.id),b=frames[N].t.poses.get(sk.id);
  if(Math.hypot(b.x-a.x,b.z-a.z)>.3){const travel=Math.atan2(b.x-a.x,b.z-a.z),end=on[on.length-1].m.facing;assert(Math.abs(wrap(end-travel))<.35,tag+`: he ends the move facing his path (${wrap(end-travel).toFixed(2)})`);}
 }
 // Deterministic (seek, pause and replay use the same clock).
 for(const pr of [.05,.3,.7])assert.equal(JSON.stringify(teachingMotion(lesson,v,step,pr).skill),JSON.stringify(teachingMotion(lesson,v,step,pr).skill),tag+': deterministic');
}
// Beats: the shield holds the ball before the pass to support (two labelled beats).
{const st=catalog.futsal.find(l=>l.id==='bld_f_passtofeet').steps[7];assert.equal(st.beats.map(b=>b.label).join(),'Protect the ball,Pass to support');}

// Every skill in the catalog is a real move on a real actor (catches typos and actors renamed later).
let authored=0;
for(const [fmt,lessons] of Object.entries(catalog))for(const l of lessons)for(const [i,st] of l.steps.entries())if(st.skill){authored++;
 assert(SKILL_TYPES.includes(st.skill.type),`${fmt} ${l.id} S${i}: ${st.skill.type} is a skill move`);
 assert([...l.offense,...l.defense].some(a=>a.id===st.skill.id),`${fmt} ${l.id} S${i}: actor ${st.skill.id}`);}
assert.equal(authored,PLAYS.length,'every authored skill is covered here');

// Quiz usage: on-pitch questions whose "Show me" replay (outcomeStep) plays a move.
const REPLAYS=[['7v7','learn7_receive',0],['futsal','f_pivot',0],['futsal','bld_f_splitcb',0],['futsal','bld_f_passtofeet',1]];
for(const [fmt,id,qi] of REPLAYS){const l=catalog[fmt].find(x=>x.id===id),q=l.questions[qi];
 assert(q&&!q.visual&&q.outcomeStep===q.step+1,`${id} Q${qi}: an on-pitch question with a replay`);
 assert(l.steps[q.outcomeStep].skill,`${id} Q${qi}: its replay plays ${l.steps[q.outcomeStep].skill?.type}`);}
console.log(`lesson-skills: ${PLAYS.length} plays (timing, facing, ball, determinism), ${REPLAYS.length} quiz replays — all passed`);
