const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,require:id=>id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(path.resolve(path.dirname(file),id+'.ts'))});return m.exports;}
const idp=load('lib/coaches/idp.ts'),paths=require('../lib/paths/formatPaths.json');
const {IDP_GOALS,IDP_KEY,IDP_REVIEW_DAYS,IDP_NOTE_MAX,emptyIdp,sanitizeIdp,chooseGoal,addNote,removeNote,reviewPlan,endPlan,reviewDue,loadIdp,saveIdp,goalsFor}=idp;

// Every goal links only to lessons that exist in its own format's path, and every format offers a choice.
for(const g of IDP_GOALS){const p=paths.find(p=>p.format===g.format),ids=[...p.chapters.flatMap(c=>c.lessons),...p.depth].map(l=>l.id);
 assert.ok(g.lessons.length>0,g.id);for(const l of g.lessons)assert.ok(ids.includes(l),`${g.id} → ${l} missing from ${g.format}`);
 for(const k of ['title','why','tryIt','parentCue'])assert.ok(g[k].length>8,`${g.id}.${k}`);}
assert.equal(new Set(IDP_GOALS.map(g=>g.id)).size,IDP_GOALS.length,'unique goal ids');
for(const f of ['futsal','7v7','9v9','11v11'])assert.ok(goalsFor(f).length>=3,`${f} has choices`);
// 7v7 goals stay the simplest to read.
const words=f=>{const g=goalsFor(f);return g.reduce((n,x)=>n+x.title.split(' ').length,0)/g.length;};
assert.ok(words('7v7')<=words('11v11'),'7v7 wording no longer than 11v11');

// One active focus; switching archives; re-choosing keeps notes.
let s=chooseGoal(emptyIdp(),'7-look',1000);
assert.equal(s.plan.goalId,'7-look');assert.equal(s.plan.reviewAt,1000+IDP_REVIEW_DAYS*864e5);
s=addNote(s,'player','  I   looked twice  ',2000);assert.equal(s.plan.notes[0].text,'I looked twice');
s=addNote(s,'coach','Saw you check your shoulder on the goal kick. Next: turn when free.',3000);
assert.equal(addNote(s,'player','   ',4000),s,'blank notes are ignored');
assert.equal(chooseGoal(s,'7-look',5000),s,'same focus keeps its notes');
assert.equal(chooseGoal(s,'nope',5000),s,'unknown goal ignored');
assert.equal(addNote(s,'player','x'.repeat(500),6000).plan.notes.at(-1).text.length,IDP_NOTE_MAX);
const switched=chooseGoal(s,'7-open',7000);
assert.equal(switched.plan.notes.length,0);assert.deepEqual(Array.from(switched.history.map(h=>h.goalId)),['7-look']);
assert.equal(removeNote(s,'player-2000').plan.notes.length,1);

// Review window.
assert.equal(reviewDue(s.plan,s.plan.reviewAt-1),false);assert.equal(reviewDue(s.plan,s.plan.reviewAt),true);
assert.equal(reviewPlan(s,9e12).plan.reviewAt,9e12+IDP_REVIEW_DAYS*864e5);
const ended=endPlan(s,8000);assert.equal(ended.plan,null);assert.equal(ended.history.at(-1).closedAt,8000);

// Sanitising and storage.
for(const bad of [null,42,'x',{},{plan:{goalId:'nope',setAt:1,reviewAt:2}},{plan:{goalId:'7-look',setAt:-1,reviewAt:2}}])assert.equal(sanitizeIdp(bad).plan,null);
const dirty=sanitizeIdp({plan:{goalId:'9-scan',setAt:1,reviewAt:2,notes:[{id:'a',kind:'parent',at:1,text:'no'},{id:'b',kind:'coach',at:1,text:' ok '},null]},history:[{goalId:'x',setAt:1,closedAt:2},{goalId:'9-cover',setAt:1,closedAt:2}]});
assert.deepEqual(Array.from(dirty.plan.notes.map(n=>n.text)),['ok'],'only player/coach notes survive');assert.deepEqual(Array.from(dirty.history.map(h=>h.goalId)),['9-cover']);
const values=new Map(),storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};
for(const raw of ['{broken','null','42'])values.set(IDP_KEY,raw),assert.equal(loadIdp(storage).plan,null);
saveIdp(s,storage);assert.equal(JSON.stringify(loadIdp(storage)),JSON.stringify(s),'restores after reopening');
const blocked={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};
assert.equal(loadIdp(blocked).plan,null);saveIdp(s,blocked);
assert.deepEqual([...values.keys()],[IDP_KEY],'IDP writes only its own key');

// Lane 4 (Sep 30 2026): linked island homework tracks itself from the path saves (THE path complete rule).
const {homeworkStatus,goalLessons,setStrength,cornerLabel,idpCopy,showsFourCorners,REFLECTION_TAGS}=idp;
const plain=x=>JSON.parse(JSON.stringify(x));
for(const g of IDP_GOALS)assert.equal(goalLessons(g).length,g.lessons.length,`${g.id} homework resolves`);
const look=IDP_GOALS.find(g=>g.id==='7-look'),lesson=goalLessons(look)[0];
let answers=new Set(),steps=new Set();
assert.deepEqual(plain({done:homeworkStatus(look,steps,answers).done,total:homeworkStatus(look,steps,answers).total}),{done:0,total:1});
for(let i=0;i<lesson.questions-1;i++)answers.add(`7v7:${lesson.id}:${i}`);
assert.equal(homeworkStatus(look,steps,answers).done,0,'not done until every question is right');
assert.equal(homeworkStatus(look,steps,answers).lessons[0].correct,lesson.questions-1);
answers.add(`7v7:${lesson.id}:${lesson.questions-1}`);
assert.equal(homeworkStatus(look,steps,answers).done,1,'completing the linked lesson ticks the homework');
assert.equal(homeworkStatus(look,steps,new Set([...answers].map(k=>k.replace('7v7:','9v9:')))).done,0,'other formats do not count');
// Strength (four corners), reflection tags, review log; strength survives a focus change; history keeps a homework snapshot.
let t=chooseGoal(emptyIdp(),'11-turn',1000);
t=setStrength(t,{corner:'social',text:'  I   talk a lot  '});assert.deepEqual(plain(t.plan.strength),{corner:'social',text:'I talk a lot'});
assert.equal(setStrength(t,{corner:'nope',text:''}).plan.strength,undefined,'bad corner clears');
t=addNote(t,'player','',2000,'no-chance');assert.equal(t.plan.notes[0].tag,'no-chance','a quick tag alone is a reflection');
assert.equal(addNote(t,'coach','',2100,'tried'),t,'coach notes need words; tags are player-only');
t=addNote(t,'coach','Scanned twice before the goal kick.',2200);
assert.equal(t.plan.notes.filter(n=>n.kind==='player').length,1);assert.equal(t.plan.notes.filter(n=>n.kind==='coach').length,1);
t=reviewPlan(t,5000);assert.deepEqual(plain(t.plan.reviews),[5000]);
const moved=chooseGoal(t,'11-third',6000,{done:1,total:1});
assert.equal(moved.plan.strength.corner,'social');assert.deepEqual(plain(moved.history.at(-1).homework),{done:1,total:1});
const round=sanitizeIdp(JSON.parse(JSON.stringify(t)));assert.equal(JSON.stringify(round),JSON.stringify(t),'new fields persist');
assert.equal(sanitizeIdp({plan:{goalId:'7-look',setAt:1,reviewAt:2,notes:[{id:'x',kind:'player',at:1,text:'',tag:'hack'}]}}).plan.notes.length,0,'unknown tags dropped');
saveIdp(moved,storage);assert.equal(JSON.stringify(loadIdp(storage)),JSON.stringify(moved),'IDP persists with strength, reviews and homework history');
// Language scales by format.
assert.equal(cornerLabel('7v7','technical'),'Ball skills');assert.equal(cornerLabel('11v11','social'),'Psychological & social');assert.match(cornerLabel('9v9','tactical'),/Game smarts · Tactical/);
assert.equal(showsFourCorners('7v7'),false);assert.equal(showsFourCorners('11v11'),true);
assert.ok(idpCopy('7v7').lead.length<idpCopy('11v11').lead.length,'7v7 lead is the simplest');assert.match(idpCopy('11v11').lead,/four corners/);
assert.equal(Object.keys(REFLECTION_TAGS).length,3);
// Printable plan: player and coach notes under separate headings; no name unless typed; no scripts or links.
const {idpPlanHtml}=load('lib/coaches/idpPrint.ts');
const doc=idpPlanHtml(t,{printedAt:9e11,homework:[{name:lesson.name,done:true,detail:'done'}]});
assert.match(doc,/My development plan/);assert.match(doc,/Player reflection[\s\S]*Didn’t get a chance[\s\S]*Coach’s observations[\s\S]*Scanned twice/);
assert.match(doc,/Four corners/);assert.doesNotMatch(doc,/<script|https?:\/\//i);
assert.match(idpPlanHtml(t,{firstName:'Sam',printedAt:9e11,homework:[]}),/Sam’s development plan/);
console.log(`PASS ${IDP_GOALS.length} IDP goals link to real lessons; one focus, notes, review window, sanitising and denied storage; homework auto-tracks, strength/tags/reviews persist, format-scaled wording, printable plan`);
