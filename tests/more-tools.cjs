// The five coach and family tools of Nov 22 2026 (second batch), their pure logic (no browser):
//  1. Team names (lib/site/tools/teamNames.ts): only curated words, no unsafe words, same seed = same names, place cleaned.
//  2. Practice plan (lib/site/tools/practicePlan.ts + the site's drill catalog): minutes add up to the chosen length, only real
//     drill slugs that list the age group, no goalkeeping before U10, swaps change one block, the URL state round-trips.
//  3. Field sizes (lib/site/tools/fieldSizes.ts): every number matches the source table, conversions, the cone plan.
//  4. Juggling (lib/site/tools/juggling.ts): personal bests, levels, streaks, the weekly goal, no headers at 10 and under.
//  5. Stats tracker (lib/site/tools/statsTracker.ts): cleaning, season totals, badges, CSV quoting and formula safety.
//  6. Page words: the Spanish twins match the English in shape.
// usage: node tests/more-tools.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.join(__dirname,'..');
const tx=code=>ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
const load=rel=>{const code=fs.readFileSync(path.join(root,rel),'utf8');
 assert(!/^import /m.test(code),`${rel} is import-free`);
 assert(!/Math\.random|Date\.now|new Date|fetch\(|localStorage|window\./.test(code.replace(/\/\*[\s\S]*?\*\//g,'')),`${rel} is pure`);
 const m={};new Function('exports','require',tx(code))(m,require);return m;};
// a tiny loader for modules with @/ and relative imports (the drill catalog, the page words)
const mods=new Map();
const req=(id,from)=>{let f;if(id.startsWith('@/'))f=path.join(root,id.slice(2));else if(id.startsWith('.'))f=path.resolve(path.dirname(from),id);else return require(id);
 if(f.endsWith('.json'))return require(f);
 for(const ext of ['.ts','.tsx','/index.ts'])if(fs.existsSync(f+ext)){f+=ext;break;}
 if(mods.has(f))return mods.get(f);const m={};mods.set(f,m);new Function('exports','require',tx(fs.readFileSync(f,'utf8')))(m,x=>req(x,f));return m;};
const N=load('lib/site/tools/teamNames.ts'),P=load('lib/site/tools/practicePlan.ts'),F=load('lib/site/tools/fieldSizes.ts'),J=load('lib/site/tools/juggling.ts'),S=load('lib/site/tools/statsTracker.ts');

// ---- 1. team names ----------------------------------------------------------------------------------------------------------
{const BAD=/\b(kill|killer|killers|dead|death|gun|guns|bomb|bombers|drunk|beer|devil|devils|hell|damn|sexy|hate|slay|slayers|psycho|savage|savages|redskins|indians|braves|chiefs|warriors|squaws?|gypsy|gypsies|thugs|gangsters|nazi|stupid|idiots|losers|fat|ugly|crap|poop|butt|bitch|ass|asses)\b/i;
 for(const w of N.ALL_WORDS())assert(!BAD.test(w),`unsafe word ${w}`);
 for(const lang of ['en','es'])for(const age of N.AGE_BANDS)for(const style of N.STYLES)for(let seed=1;seed<=40;seed++){
  const a=N.generateNames({age,style,lang,place:'Oak Hill'},seed),b=N.generateNames({age,style,lang,place:'Oak Hill'},seed);
  assert.deepEqual(a,b,'same seed, same names');assert(a.length>=8,`${lang} ${age} ${style}: eight ideas`);assert.equal(new Set(a.map(x=>x.name)).size,a.length,'no repeats');
  for(const x of a){assert(!BAD.test(x.name),x.name);assert(x.note.length>40,`a note for ${x.name}`);assert(/^[\p{L} '’-]+$/u.test(x.name),`only letters: ${x.name}`);}}
 assert.notDeepEqual(N.generateNames({age:'u9-u12',style:'mix'},1).map(x=>x.name),N.generateNames({age:'u9-u12',style:'mix'},2).map(x=>x.name),'reshuffle changes the list');
 assert.equal(N.cleanPlace('  oak   hill <script>1234 '),'Oak Hill Script');assert.equal(N.cleanPlace('São-paulo'),'São-paulo');assert(N.cleanPlace('x'.repeat(50)).length<=24);
 assert(N.generateNames({age:'u6-u8',style:'animal',animal:'otters',colour:'blue'},3).some(x=>x.name==='Blue Otters'),'chosen colour and animal');
 assert(N.generateNames({age:'u6-u8',style:'animal',animal:'otters',colour:'blue',lang:'es'},3).some(x=>x.name==='Las Nutrias Azules'),'Spanish agreement');
 const ids=N.CLUB_WORDS.map(c=>c.id);for(const id of [...ids,'fire','animal','nature','colour'])for(const l of ['en','es'])assert(N.NOTES[l][id],`note ${l} ${id}`);}

// ---- 2. practice plan ---------------------------------------------------------------------------------------------------------
{const {PLAN_CATALOG,PLAN_CATALOG_ES}=req('@/lib/site/tools/practicePlanDrills',root+'/x');const {DRILLS}=req('@/lib/site/drills',root+'/x');
 const real=new Map(DRILLS.map(d=>[d.slug,d]));assert.equal(PLAN_CATALOG.length,DRILLS.length);assert.equal(PLAN_CATALOG_ES.length,DRILLS.length);
 assert.deepEqual(P.parseTime('8 to 10 minutes'),[8,10]);assert.deepEqual(P.parseTime('15 minutes, in games of four minutes'),[15,15]);
 for(const m of P.PLAN_LENGTHS){const t=P.timings(m);assert.equal(t.warm+t.d1+t.d2+t.game+t.cool+t.water*t.waterMin,m,`timings sum to ${m}`);assert(t.game>=t.d1,'the game is the longest part');}
 for(const age of P.PLAN_AGES)for(const minutes of P.PLAN_LENGTHS)for(const focus of P.FOCUSES)for(const players of [4,9,14,22])for(let seed=1;seed<=6;seed++){
  const swaps=[seed%3,seed%2,0,seed%4],p=P.makePlan(PLAN_CATALOG,{age,minutes,players,focus,seed,swaps}),w=`${age} ${minutes} ${focus} ${seed}`;
  assert.equal(p.blocks.reduce((a,b)=>a+b.minutes,0),minutes,`${w}: minutes add up`);assert.equal(p.total,minutes);
  p.blocks.forEach((b,i)=>{assert.equal(b.start,i?p.blocks[i-1].start+p.blocks[i-1].minutes:0,'blocks run back to back');assert(b.minutes>0);});
  const ds=p.blocks.filter(b=>b.slug);assert.equal(ds.length,4,`${w}: warm-up, two drills, game`);assert.equal(new Set(ds.map(b=>b.slug)).size,4,`${w}: no drill twice`);
  for(const b of ds){const d=real.get(b.slug);assert(d,`${w}: ${b.slug} is a real drill`);assert(d.ages.includes(age),`${w}: ${b.slug} lists ${age}`);if(age==='U6'||age==='U8')assert.notEqual(d.skill,'goalkeeper',`${w}: no keeper drills before U10`);}
  assert.equal(real.get(p.blocks.find(b=>b.kind==='game').slug).skill,'small-sided',`${w}: ends in a small-sided game`);
  assert.deepEqual(p.blocks.map(b=>b.kind),minutes>=75?['warm','drill','water','drill','water','game','cool']:['warm','drill','drill','water','game','cool']);
  if(focus==='goalkeeping'&&(age==='U10'||age==='U12'))assert.equal(real.get(ds[1].slug).skill,'goalkeeper');}
 const base={age:'U10',minutes:60,players:12,focus:'passing',seed:5,swaps:[0,0,0,0]},a=P.makePlan(PLAN_CATALOG,base),b=P.makePlan(PLAN_CATALOG,{...base,swaps:[0,1,0,0]});
 assert.deepEqual(P.makePlan(PLAN_CATALOG,base),a,'deterministic');assert.notEqual(a.blocks[1].slug,b.blocks[1].slug,'swap changes the drill');assert.equal(a.blocks[0].slug,b.blocks[0].slug,'swap keeps the warm-up');
 assert.equal(P.makePlan(PLAN_CATALOG,{...base,age:'U8',focus:'goalkeeping'}).gkFallback,true);
 assert.equal(P.makePlan(PLAN_CATALOG,{...base,age:'U6',minutes:90}).ageNote,'long');assert.equal(P.makePlan(PLAN_CATALOG,{...base,age:'U12',minutes:45}).ageNote,'short');assert.equal(a.ageNote,'ok');
 assert.deepEqual(P.decodePlan('?'+P.encodePlan({...base,swaps:[1,2,3,4]})),{...base,swaps:[1,2,3,4]},'URL round trip');
 assert.deepEqual(P.decodePlan('age=U99&min=13&p=x&focus=<b>&s=-1&w=a'),P.DEFAULT_PLAN,'broken URL falls back');
 const g=P.groups(10,'U8');assert.deepEqual([g.games,g.perSide,g.spare],[1,4,2],'U8: 4v4 at most');const g2=P.groups(14,'U8');assert.deepEqual([g2.games,g2.perSide,g2.spare],[2,3,2]);
 for(const a of P.PLAN_AGES)for(let n=4;n<=30;n++){const x=P.groups(n,a);assert(x.perSide<=P.MAX_SIDE[a]&&x.perSide>=2&&x.spare>=0&&x.perSide*2*x.games+x.spare===n,`${a} ${n}: groups`);}
 assert.equal(P.mmss(75),'1:15');}

// ---- 3. field sizes -------------------------------------------------------------------------------------------------------------
{const f=id=>F.formatById(id);
 const TABLE={'4v4':[[25,35],[15,25],[6,4]],'5v5':[[27,37],[18,27],[12,6]],'7v7':[[55,65],[35,45],[18.5,6.5]],'9v9':[[70,80],[45,55],[21,7]],'11v11':[[100,130],[50,100],[24,8]],futsal:[[25,42],[16,25],[3,2]]};
 assert.deepEqual(F.FORMATS.map(x=>x.id),Object.keys(TABLE));
 for(const [id,[l,w,g]] of Object.entries(TABLE)){const x=f(id);assert.deepEqual([...x.length],l,`${id} length`);assert.deepEqual([...x.width],w,`${id} width`);assert.deepEqual([x.goal.w,x.goal.h],g,`${id} goal`);}
 assert.deepEqual([f('7v7').goalRec.w,f('7v7').goalRec.h],[12,6.5]);assert.deepEqual([f('9v9').goalRec.w,f('9v9').goalRec.h],[18.5,6.5]);
 assert.deepEqual(f('7v7').penaltyArea,{depth:12,width:24});assert.deepEqual(f('7v7').goalArea,{depth:4,width:8});assert.equal(f('7v7').penaltyMark,10);assert.equal(f('7v7').circle,8);assert.equal(f('7v7').buildOut,true);
 assert.deepEqual(f('9v9').penaltyArea,{depth:14,width:36});assert.deepEqual(f('9v9').goalArea,{depth:5,width:12});
 assert.deepEqual(f('11v11').penaltyArea,{depth:18,width:8+2*18});assert.deepEqual(f('11v11').goalArea,{depth:6,width:8+2*6});assert.equal(f('11v11').penaltyMark,12);assert.equal(f('11v11').circle,10);
 assert.deepEqual(f('futsal').penaltyArea,{depth:6,width:15.16});assert.equal(f('futsal').penaltyMark,6);assert.equal(f('futsal').secondMark,10);assert.equal(f('futsal').circle,3);
 assert.deepEqual(F.FORMATS.map(x=>x.ball),['3','3','4','4','5','futsal']);assert.equal(f('4v4').keepers,false);assert(!f('4v4').penaltyArea&&!f('5v5').penaltyArea,'no markings without a source');
 assert.deepEqual(f('7v7').alt.recommended,{length:55,width:37});assert.deepEqual(f('9v9').alt.recommended,{length:73,width:46});assert.deepEqual(f('5v5').recommended,{length:37,width:27});
 assert.equal(F.show(100,'yd','m'),91.4);assert.equal(F.show(120,'m','yd'),131);assert.equal(F.show(30,'yd','yd'),30);assert.equal(F.showGoal(24,'ft','m'),7.32);assert.equal(F.showGoal(3,'m','yd'),10);
 assert.equal(F.buildOutAt(60,12),21);
 for(const x of F.FORMATS){const d=F.defaultSize(x);assert(d.length>=x.length[0]&&d.length<=x.length[1]&&d.width>=x.width[0]&&d.width<=x.width[1],`${x.id}: default size in range`);
  const c=F.conePlan(x,d.length,d.width);assert.equal(c.total,c.steps.reduce((a,s)=>a+s.cones,0));assert(c.total>=7);
  if(x.penaltyArea)assert(c.steps.find(s=>s.id==='penalty').b>0,`${x.id}: penalty area fits inside the width`);}
 assert.equal(F.conePlan(f('7v7'),60,40).total,4+3+8+4+2+4+4);assert.equal(F.conePlan(f('4v4'),30,20).total,4+3+4);
 assert.deepEqual(F.clampSize(f('7v7'),10,99),{length:55,width:45});assert.equal(F.diagonal(30,40),50);
 // the page states its sources: every source key of every format has a URL on the page
 const W=req('@/lib/site/tools/moreTools',root+'/x').FIELD_EN;for(const u of ['wiyouthsoccer.com','lijsoccer.com','futurefit.englandfootball.com','theifab.com/laws/latest/the-field-of-play','law-1---the-pitch','law-2---the-ball'])assert(W.sources.some(s=>s.url.includes(u)),`field guide cites ${u}`);}

// ---- 4. juggling --------------------------------------------------------------------------------------------------------------
{let s={...J.NEW_STATE,log:[]};const D=20000;
 let r=J.logAttempt(s,{day:D,v:'feet',n:7});assert(r.newBest);assert.equal(r.passed,5);s=r.state;
 r=J.logAttempt(s,{day:D,v:'feet',n:6});assert(!r.newBest);assert.equal(r.passed,null);s=r.state;
 r=J.logAttempt(s,{day:D+1,v:'feet',n:22});assert(r.newBest);assert.equal(r.passed,20,'jumping levels reports the highest passed');s=r.state;
 assert.equal(J.best(s,'feet'),22);assert.deepEqual(J.level('feet',22),{done:4,of:9,next:30});assert.deepEqual(J.level('feet',100),{done:9,of:9,next:null});
 assert.equal(J.logAttempt(s,{day:D,v:'head',n:3}).state,s,'no headers at 10 and under');assert(!J.variationsFor('10-under').includes('head'));assert(J.variationsFor('11-12').includes('head'));
 assert(J.logAttempt({...s,age:'11-12'},{day:D,v:'head',n:3}).newBest);
 assert.equal(J.logAttempt(s,{day:D,v:'feet',n:5000}).state.log.at(-1).n,J.MAX_TOUCHES,'capped');
 assert.equal(J.streak(s,D+1),2);assert.equal(J.streak(s,D+2),2,'not lost until a whole day is missed');assert.equal(J.streak(s,D+3),0);
 const mon=J.weekStart(D);assert.equal((mon+3)%7,0,'weeks start on Monday');assert.equal(J.weekStart(J.dayNumber(2026,11,22)),J.dayNumber(2026,11,16),'Sun Nov 22 2026 is in the week of Mon Nov 16');
 assert.equal(J.dayNumber(1970,1,1),0);
 const wk=J.week(s,D+1);assert.equal(wk.goal,3);assert(wk.days<=2);
 assert.deepEqual(J.undo(s).log.length,s.log.length-1);
 assert.deepEqual(J.readState({age:'x',weeklyGoal:99,log:[{day:1,v:'feet',n:3},{day:'x',v:'feet',n:3},{day:2,v:'hands',n:3},null]}),{age:'10-under',weeklyGoal:3,log:[{day:1,v:'feet',n:3}]});
 assert.deepEqual(J.readState(null),J.NEW_STATE);
 const ex=J.exampleState(D);assert.equal(J.best(ex,'feet'),23);assert(J.streak(ex,D)>=3);for(const v of J.VARIATIONS){const L=J.LEVELS[v];assert(L.every((x,i)=>i===0||x>L[i-1]),'levels go up');}
 assert.equal(Math.max(...J.LEVELS.feet),100);assert.equal(Math.min(...J.LEVELS.feet),5);}

// ---- 5. stats tracker --------------------------------------------------------------------------------------------------------
{const g=S.cleanGame({id:'a',date:'2026-10-01',opponent:'  Lions  ',goals:2.6,assists:-3,saves:'4',minutes:999,badges:['helped','nope','attitude'],note:'x\u0007y'});
 assert.deepEqual(g,{id:'a',date:'2026-10-01',opponent:'Lions',goals:3,assists:0,saves:4,minutes:180,badges:['helped','attitude'],note:'x y'});
 assert.equal(S.cleanGame({id:'b',date:'bad'}).date,'2026-01-01');
 const sm=S.summary(S.EXAMPLE_GAMES);assert.deepEqual([sm.games,sm.goals,sm.assists,sm.saves,sm.minutes],[5,3,4,3,165]);assert.deepEqual(sm.perGame,{goals:.6,assists:.8,minutes:33});
 assert.equal(sm.badges.helped,2);assert.equal(sm.badges['new-skill'],2);assert.equal(sm.topBadge,'new-skill');assert.equal(sm.bestGame.id,'ex4');
 assert.deepEqual(S.summary([]),{games:0,goals:0,assists:0,saves:0,minutes:0,perGame:{goals:0,assists:0,minutes:0},badges:Object.fromEntries(S.BADGES.map(b=>[b,0])),topBadge:null,bestGame:null});
 let se={player:'',games:[]};se=S.upsert(se,{...S.EXAMPLE_GAMES[1]});se=S.upsert(se,{...S.EXAMPLE_GAMES[0]});se=S.upsert(se,{...S.EXAMPLE_GAMES[0],goals:4});
 assert.equal(se.games.length,2);assert.equal(se.games[1].goals,4,'edit in place');assert.deepEqual(S.ordered(se.games).map(x=>x.id),['ex1','ex2'],'date order');assert.equal(S.remove(se,'ex1').games.length,1);
 assert.equal(S.csvField('=SUM(A1)'),"'=SUM(A1)");assert.equal(S.csvField('-1'),"'-1");assert.equal(S.csvField('a,"b"'),'"a,""b"""');assert.equal(S.csvField(3),'3');
 const csv=S.toCsv([{...S.EXAMPLE_GAMES[0],opponent:'@Lions, "A"'}],['Date','Opponent','Goals','Assists','Saves','Minutes','Badges','Note'],b=>b.toUpperCase());
 assert.equal(csv,'Date,Opponent,Goals,Assists,Saves,Minutes,Badges,Note\r\n2026-09-06,"\'@Lions, ""A""",0,1,0,30,HELPED; ATTITUDE,\r\n');
 assert.deepEqual(S.readSeason({player:'Kiki',games:[{id:'z',goals:1},{nope:1},'x']}).games.map(x=>x.id),['z']);assert.deepEqual(S.readSeason('x'),{player:'',games:[]});}

// ---- 6. page words: the Spanish twins match the English in shape --------------------------------------------------------------
{const EN=req('@/lib/site/tools/moreTools',root+'/x'),ES=req('@/lib/i18n/es/moreTools',root+'/x');
 assert.deepEqual(EN.MORE_TOOLS_EN.map(t=>t.slug),['soccer-team-name-generator','soccer-practice-plan-generator','youth-soccer-field-size-guide','soccer-juggling-challenge','youth-soccer-stats-tracker']);
 for(const e of EN.MORE_TOOLS_EN){const x=ES.MORE_TOOLS_ES[e.slug],w=e.slug;assert(x,`${w}: Spanish words`);
  assert.deepEqual(x.sections.map(z=>[z.id,!!z.table,(z.paras??[]).length,(z.items??[]).length]),e.sections.map(z=>[z.id,!!z.table,(z.paras??[]).length,(z.items??[]).length]),`${w}: same sections`);
  assert.equal(x.how.length,e.how.length,`${w}: same steps`);assert.equal(x.faq.length,e.faq.length,`${w}: same FAQ count`);assert(e.faq.length>=3&&e.faq.length<=5);
  assert.deepEqual(x.sources.map(z=>z.url),e.sources.map(z=>z.url),`${w}: same sources`);assert.deepEqual(x.related.map(z=>z.path),e.related.map(z=>z.path),`${w}: same related pages`);
  assert.equal(x.features.length,e.features.length,`${w}: same features`);
  for(const k of ['title','h1','description','lead','blurb','crumb','imageAlt'])assert.notEqual(x[k],e[k],`${w}: ${k} is translated`);
  assert(e.title.length>=30&&e.title.length<=60&&x.title.length<=66,`${w}: title lengths ${e.title.length}/${x.title.length}`);assert(e.description.length>=120&&e.description.length<=155&&x.description.length<=160,`${w}: description lengths ${e.description.length}/${x.description.length}`);
  for(const s of e.sources)assert(/^https:\/\//.test(s.url)&&s.says.length>40,`${w}: a real source`);
  assert(!/\bheaders? (drill|practice)\b/i.test(JSON.stringify(e)),`${w}: no heading practice`);}}
console.log('more-tools: ok');
