// Coach cards (user request, Sep 28 2026: "add more cards, add top 25 current and all time coaches"): 25 current + 25 all-time
// coaches under the "coach" role, numbered after every player, with their own binder section, and the same data players have
// (blurb + strengths, appearance, career, tier) plus the coaching idea each card teaches.
// usage: node tests/coach-cards.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..');
const loaded=new Map();function load(file){file=path.resolve(root,file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?(n.endsWith('.json')?require(path.resolve(path.dirname(file),n)):load(path.resolve(path.dirname(file),n+'.ts'))):require(n),console,Math,Map,WeakMap,Set,Date});return m.exports;}
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const json=f=>JSON.parse(fs.readFileSync(path.join(root,'lib/town',f),'utf8'));
const GROUPS=json('positionPlayers.json'),ROSTER=json('cardRoster.json').players,PROFILES=json('playerProfiles.json'),IDEAS=json('coachIdeas.json');
const CAREERS=json('playerCareers.json'),LOOKS=json('playerAppearance.json'),TIERS=json('cardTiers.json'),PHOTOS=json('playerPhotos.coaches.json');
const C=load('lib/town/cardCollection.ts'),B=load('components/binder.ts'),R=load('lib/town/cardRewards.ts');

// The lists: 25 + 25, no duplicates, nobody on both lists, and no coach key that is also a player card.
const {current,allTime}=GROUPS.coach;
assert.equal(current.length,25,'25 current coaches');assert.equal(allTime.length,25,'25 all-time coaches');
const coaches=[...current,...allTime];assert.equal(new Set(coaches).size,50,'no coach twice');
const players=new Set(Object.entries(GROUPS).filter(([role])=>role!=='coach').flatMap(([,g])=>[...g.current,...g.allTime]));
for(const n of coaches)assert.ok(!players.has(n),`${n} is not also a player card (use "<Name> (coach)")`);
for(const n of ['Johan Cruyff','Zinedine Zidane','Vincent Kompany'])assert.ok(players.has(n)&&coaches.includes(`${n} (coach)`),`${n} has a player card and a separate coach card`);

// Numbering: every player keeps the number the roster gave them; coaches are appended as 401–450 (saved collections stay valid).
assert.ok(ROSTER.slice(0,400).every(n=>players.has(n)),'the first 400 roster numbers are still players');
same(ROSTER.slice(400,450),coaches,'coaches are numbered 401–450, current first');
for(const n of coaches)assert.ok(C.cardNumber(n)>400,`${n} is numbered after the players`);
for(const [i,n] of ROSTER.slice(0,400).entries())assert.equal(C.cardNumber(n),i+1,`${n} keeps No. ${i+1}`);
assert.equal(C.ALL_PLAYERS.length,450);

// Entries, role and era.
const entries=C.CARD_ENTRIES.filter(e=>e.role==='coach');
assert.equal(entries.length,50);assert.ok(entries.every(e=>e.roleLabel==='Head coach'&&!e.futsal));
same(entries.filter(e=>e.era==='current').map(e=>e.name),current);same(entries.filter(e=>e.era==='allTime').map(e=>e.name),allTime);
assert.ok(coaches.every(C.isCoachCard)&&!C.isCoachCard('Lionel Messi'));
assert.equal(C.cardDisplayName('Johan Cruyff (coach)'),'Johan Cruyff');assert.equal(C.cardDisplayName('Pep Guardiola'),'Pep Guardiola');

// Binder: the Futbol binder has a Coaches section after the goalkeepers, holding every coach (and nothing else); Futsal has none.
const football=B.buildBinder(C.CARD_ENTRIES,C.ROLE_ORDER.filter(r=>!C.FUTSAL_ROLES.has(r))),sections=B.sectionsOf(football.pages);
const order=sections.map(s=>s.role);assert.equal(order[order.indexOf('goalkeeper')+1],'coach','Coaches come right after the goalkeepers');
const coachSection=sections.find(s=>s.role==='coach');assert.equal(coachSection.cards.length,50);assert.equal(coachSection.pages,6,'50 coaches on 6 pages of 9');
same(coachSection.cards,[...coaches].sort((a,b)=>C.cardNumber(a)-C.cardNumber(b)));
const futsal=B.buildBinder(C.CARD_ENTRIES,C.ROLE_ORDER.filter(r=>C.FUTSAL_ROLES.has(r)));assert.ok(!futsal.pages.some(p=>p.role==='coach'));

// Data completeness: the same fields players have, plus the coaching idea.
const words=s=>s.trim().split(/\s+/).length;
for(const n of coaches){
 const p=PROFILES[n];assert.ok(p&&p.blurb.length>=60&&p.blurb.length<=200,`${n} blurb 60–200 chars`);
 assert.ok(Array.isArray(p.strengths)&&p.strengths.length===3&&p.strengths.every(s=>words(s)>=1&&words(s)<=5),`${n} has 3 short strengths`);
 const i=IDEAS[n];assert.ok(i,`${n} has a coaching idea`);
 assert.ok(i.idea.length>2&&i.idea.length<=40,`${n} idea title`);assert.ok(i.lesson.length>=60&&i.lesson.length<=240,`${n} lesson 60–240 chars (${i.lesson.length})`);
 assert.ok(!/["“”]\s*[A-Z][^"“”]{20,}["“”]/.test(i.lesson),`${n} lesson has no quoted speech`);
 assert.ok(i.highlights.length>=2&&i.highlights.length<=4,`${n} 2–4 highlights`);
 assert.ok(i.sources.length>=1&&i.sources.every(s=>/^https:\/\//.test(s.url)&&s.title),`${n} sources`);
 const c=CAREERS[n];assert.ok(c&&c.role==='coach'&&c.clubs.length>=1,`${n} has teams coached`);
 assert.ok(c.clubs.every(s=>Number.isInteger(s.from)&&(s.to===null||s.to>=s.from)),`${n} career years`);
 if(current.includes(n))assert.ok(c.clubs.some(s=>s.to===null),`${n} (current) is in a job now`);
 assert.ok(LOOKS[n]&&LOOKS[n].country,`${n} appearance + country`);
 const t=TIERS.cards[n];assert.ok(t&&Number.isInteger(t.demand)&&t.why.length>10,`${n} tier entry`);
 if(PHOTOS[n]){const ph=PHOTOS[n];assert.ok(/^CC0|^CC BY|^Public domain|^Attribution/i.test(ph.license),`${n} photo licence ${ph.license}`);assert.ok(ph.file.startsWith('https://commons.wikimedia.org/'),`${n} photo is on Commons`);
  for(const layer of ['ink','tone'])assert.ok(fs.existsSync(path.join(root,'public/players',`${ph.slug}-${layer}.webp`)),`${n} ${layer} mask`);}
}
assert.ok(allTime.filter(n=>CAREERS[n].clubs.every(s=>s.to!==null)).length>=20,'most all-time greats have finished coaching');
for(const n of ['Sarina Wiegman','Emma Hayes'])assert.ok(current.includes(n),`${n} is a current coach`);
for(const n of ['Pia Sundhage','Jill Ellis','Silvia Neid'])assert.ok(allTime.includes(n),`${n} is an all-time great`);

// Rewards: tactics lessons theme a coach card; futsal lessons keep their futsal cards.
same([...R.themeFromText('Team Systems 3-2: Hold the Shape').roles],['coach']);
same([...R.themeFromText('Team Systems',true).roles],['goleiro','fixo','ala','pivot']);
same([...R.themeFromText('Goalkeeper & Restarts').roles],['goalkeeper']);
console.log(`Coach cards: 25 current + 25 all-time, numbered 401–450 (players unchanged), Coaches binder section, full data (${Object.keys(PHOTOS).length} licensed portraits) and tactics theme passed.`);
