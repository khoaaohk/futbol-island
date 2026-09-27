// Lane C (docs/bean-characters/CONTRACT.md): team kits, keeper kits, deterministic player + NPC looks.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.endsWith('.json')?require(path.resolve(path.dirname(file),n)):n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set});return m.exports;}
const L=load('lib/town/beanLooks.ts'),B=load('lib/graphics/beanLook.ts'),{MatchSim}=load('lib/town/match/matchSim.ts'),{classicShirtNumber}=load('lib/graphics/shirtNumbers.ts');
const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts'),{PRACTICE_NPCS}=load('lib/town/practiceNpcs.ts');
const HEX=/^#[0-9a-f]{6}$/i,KIT_KEYS=['shirt','shirt2','shorts','socks','socks2','boots'];
const kitOf=o=>JSON.stringify(KIT_KEYS.map(k=>o[k]));
// A team's full colour identity: identical kit AND identical body colour.
const teamOf=d=>kitOf(d.outfit)+'|'+d.look.body;
function validLook(look,where){
 assert.match(look.body,HEX,where+' body');assert.match(look.skin,HEX,where+' skin');
 assert.ok(B.BEAN_BUILDS.includes(look.build),where+' build');assert.ok(B.BEAN_EYES.includes(look.eyes),where+' eyes');assert.ok(B.BEAN_MOUTHS.includes(look.mouth),where+' mouth');
 assert.ok(look.hair&&B.BEAN_HAIR_STYLES.includes(look.hair.style),where+' hair');assert.match(look.hair.color,HEX,where+' hair colour');
 assert.ok(B.BEAN_HEADWEAR.includes(look.headwear??'none'),where+' headwear');
 if(look.headwear&&look.headwear!=='none')assert.match(look.headwearColor,HEX,where+' headwear colour');
}
function validOutfit(o,kind,where){assert.equal(o.kind,kind,where);for(const k of ['shirt','shirt2','shorts','socks','boots'])assert.match(o[k],HEX,where+' '+k);}

// ---- Palettes: every team pair either doesn't clash or is resolved to one that doesn't; keepers never clash.
{
 assert.equal(L.DEFAULT_MATCH_KITS.home.shirt,'#edb957');assert.equal(L.DEFAULT_MATCH_KITS.away.shirt,'#356478');
 assert.ok(L.colourDistance('#000000','#ffffff')>99&&L.colourDistance('#edb957','#edb957')===0);
 for(const a of L.TEAM_PALETTES)for(const b of L.TEAM_PALETTES){
  const k=L.matchKits(a.id,b.id),shirts=[k.home,k.away,k.homeKeeper,k.awayKeeper];
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert.ok(!L.kitsClash(shirts[i],shirts[j]),`${a.id} v ${b.id}: kits ${i}/${j} clash (ΔE ${L.colourDistance(shirts[i].shirt,shirts[j].shirt).toFixed(1)})`);
 }
}

// ---- Every format: one identical kit per team, keepers distinct from both teams, numbers from classicShirtNumber.
for(const format of ['11v11','9v9','7v7','futsal']){
 const sim=new MatchSim(1,format),byTeam={home:new Set(),away:new Set()},keepers={home:[],away:[]},looks=new Set();
 const expect={'11v11':11,'9v9':9,'7v7':7,futsal:5}[format];
 for(const id of sim.ids){
  const p=sim.players[id],side=p.team==='gold'?'home':'away',keeper=p.isGK;
  assert.equal(L.isKeeperSlot(id),keeper,`${format} ${id} keeper slot`);
  const number=classicShirtNumber(format,id),dress=L.matchPlayerDress(format+':'+id,side,keeper,number);
  validLook(dress.look,`${format} ${id}`);validOutfit(dress.outfit,'kit',`${format} ${id}`);
  assert.equal(dress.outfit.number,number);
  if(keeper){keepers[side].push(dress);assert.ok(dress.look.gloves,'keeper gloves');assert.ok(['none','keeper'].includes(dress.look.headwear),'keeper cap only');}
  else{byTeam[side].add(teamOf(dress));assert.equal(dress.look.headwear,'none',`${format} ${id}: no hats in matches`);assert.equal(dress.look.gloves,undefined);}
  looks.add(JSON.stringify(dress.look));
 }
 assert.equal(sim.ids.filter(id=>sim.players[id].team==='gold').length,expect,format+' squad size');
 assert.equal(byTeam.home.size,1,format+' home kit + body identical');assert.equal(byTeam.away.size,1,format+' away kit + body identical');
 assert.notEqual([...byTeam.home][0],[...byTeam.away][0]);
 assert.equal(keepers.home.length,1);assert.equal(keepers.away.length,1);
 const homeShirt=JSON.parse([...byTeam.home][0].split('|')[0])[0],awayShirt=JSON.parse([...byTeam.away][0].split('|')[0])[0],homeBody=[...byTeam.home][0].split('|')[1],awayBody=[...byTeam.away][0].split('|')[1];
 assert.ok(L.colourDistance(homeBody,awayBody)>=L.KIT_CLASH_MIN,format+' team bodies far apart');
 for(const k of [...keepers.home,...keepers.away])for(const body of [homeBody,awayBody])assert.ok(L.colourDistance(k.look.body,body)>=L.KIT_CLASH_MIN,`${format} keeper body reads as a team`);
 assert.ok(L.colourDistance(keepers.home[0].look.body,keepers.away[0].look.body)>=L.KIT_CLASH_MIN,format+' keeper bodies distinct');
 for(const k of [...keepers.home,...keepers.away])for(const shirt of [homeShirt,awayShirt])assert.ok(L.colourDistance(k.outfit.shirt,shirt)>=L.KIT_CLASH_MIN,`${format} keeper clashes`);
 assert.ok(L.colourDistance(keepers.home[0].outfit.shirt,keepers.away[0].outfit.shirt)>=L.KIT_CLASH_MIN,format+' keepers distinct from each other');
 assert.ok(looks.size>=expect*2-2,`${format}: players look different (${looks.size})`);
 const shapes=new Set(sim.ids.filter(id=>sim.players[id].team==='gold').map(id=>{const l=L.matchPlayerDress(format+':'+id,'home',sim.players[id].isGK).look;return l.build+l.hair.style+l.skin+l.eyes+l.mouth;}));assert.ok(shapes.size>=Math.min(expect,5)-1,`${format}: shapes still vary (${shapes.size})`);
}

// ---- Deterministic by id; body colours never mimic a kit on the pitch.
{
 const a=L.matchPlayerDress('11v11:rw','home',false,7),b=L.matchPlayerDress('11v11:rw','home',false,7);
 assert.deepEqual(a,b);assert.deepEqual(L.npcDress({id:'rosa',role:'Futsal coach'}),L.npcDress({id:'rosa',role:'Futsal coach'}));
 const k=L.DEFAULT_MATCH_KITS;
 // Every team context shares one body colour per team (a tint of its shirt), and the four bodies never clash for any pairing.
 for(const a of L.TEAM_PALETTES)for(const b of L.TEAM_PALETTES){const m=L.matchKits(a.id,b.id),bodies=[m.home,m.away,m.homeKeeper,m.awayKeeper].map(L.teamBodyColour);
  for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert.ok(L.colourDistance(bodies[i],bodies[j])>=L.KIT_CLASH_MIN,`${a.id} v ${b.id}: bodies ${i}/${j} too close`);
  for(const [side,kit] of [['home',m.home],['away',m.away]])assert.ok(L.colourDistance(L.teamBodyColour(kit),kit.shirt)<L.KIT_CLASH_MIN,`${side} body reads as its own shirt colour`);}
 const ctx={home:new Set(),away:new Set()};
 for(let i=0;i<60;i++){const side=i%2?'home':'away';ctx[side].add(teamOf(L.matchPlayerDress('p'+i,side,false)));ctx[side].add(teamOf(L.sideGameDress('side'+i,side,i%3?null:8)));}
 for(const side of ['home','away'])assert.equal(new Set([...ctx[side]].map(x=>x.split('|')[1])).size,1,side+': one body colour across every team context');
 const builds=new Set(),hair=new Set(),skins=new Set();for(let i=0;i<60;i++){const d=L.matchPlayerDress('v'+i,'home',false);builds.add(d.look.build);hair.add(d.look.hair.style);skins.add(d.look.skin);}
 assert.ok(builds.size>=3&&hair.size>=5&&skins.size>=4,'players vary in build, hair and face tone');
 // The player's own character in a team game keeps their shape and face but wears the team colours.
 const own={body:'#ff7a6b',skin:'#5c3a28',build:'wide',eyes:'happy',mouth:'grin',hair:{style:'bun',color:'#b04a2a'},headwear:'beanie',headwearColor:'#ffffff'},team=L.matchPlayerDress('striker-0','home',false),you=L.teamedLook(own,team,10);
 assert.equal(you.look.body,team.look.body);assert.equal(you.look.build,'wide');assert.deepEqual(you.look.hair,own.hair);assert.equal(you.look.skin,own.skin);assert.equal(you.look.headwear,'none');assert.equal(kitOf(you.outfit),kitOf(team.outfit));assert.equal(you.outfit.number,10);
}

// ---- Islander NPCs: valid casual outfits, varied headwear, role-suited, stable.
{
 const all=[...NPC_DIALOGUES,...PRACTICE_NPCS],headwear=new Set(),shirts=new Set();
 for(const npc of all){const d=L.npcDress(npc);validLook(d.look,npc.id);validOutfit(d.outfit,'casual',npc.id);assert.equal(d.outfit.number,null);headwear.add(d.look.headwear);shirts.add(d.outfit.shirt);
  assert.ok(L.roleHeadwear(npc.role).includes(d.look.headwear),npc.id+' headwear suits role');}
 assert.ok(headwear.size>=4,'NPC headwear varies: '+[...headwear]);assert.ok(new Set(all.map(n=>L.npcDress(n).look.body)).size>=6,'NPC bodies stay colourful');assert.ok(shirts.size>=5,'NPC shirts vary');
 assert.ok(L.roleHeadwear('Futsal coach').every(h=>['cap','visor','none'].includes(h)));
 assert.ok(L.roleHeadwear('Beach football regular').includes('bucket'));
}
// ---- Plays + quizzes on the island pitches (fieldRuntime teaching mode): offense one kit, defense the other, keepers distinct.
for(const format of ['futsal','7v7','9v9','11v11']){
 const lessons=JSON.parse(fs.readFileSync(`public/lessons/${format}.json`,'utf8'));
 for(const lesson of lessons){
  const kits={home:new Set(),away:new Set()};let keepers=0;
  for(const [list,home] of [[lesson.offense,true],[lesson.defense,false]])for(const a of list){
   const d=L.fieldTokenDress(format,{...a,home},classicShirtNumber(format,a.id));validLook(d.look,`${lesson.id} ${a.id}`);
   const keeper=a.label==='GK'||L.isKeeperSlot(a.id);
   if(keeper){keepers++;for(const k of [L.DEFAULT_MATCH_KITS.home,L.DEFAULT_MATCH_KITS.away])assert.ok(!L.kitsClash(d.outfit,k),`${lesson.id} keeper kit`);}
   else{kits[home?'home':'away'].add(teamOf(d));assert.equal(d.look.headwear,'none');}
  }
  assert.ok(kits.home.size<=1&&kits.away.size<=1,`${format} ${lesson.id}: one kit per side`);
  if(kits.home.size&&kits.away.size)assert.notEqual([...kits.home][0],[...kits.away][0]);
 }
}

// ---- Island Strikers (arcade): 4v4 with keepers, dressed exactly as strikerScene does.
{
 const {createStrikerMatch}=load('lib/arcade/strikerMatch.ts'),match=createStrikerMatch(),kits={0:new Set(),1:new Set()},keeperShirts=[];
 for(const p of match.state.players){const d=L.matchPlayerDress('striker-'+p.id,p.team===0?'home':'away',p.keeper);if(p.keeper)keeperShirts.push(d.outfit.shirt+d.look.body);else kits[p.team].add(teamOf(d));}
 assert.equal(kits[0].size,1);assert.equal(kits[1].size,1);assert.equal(keeperShirts.length,2);assert.notEqual(keeperShirts[0],keeperShirts[1]);
}

// ---- Every createPlayer call site dresses its rig (or is intentionally left, with a reason).
{
 const LEFT={'components/MotionLab.tsx':'dev motion study','components/CostumePreviews.tsx':'costumes render the classic body (contract)','components/CharacterPreview.tsx':'lane D builder preview','lib/graphics/player.ts':'definition'};
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
 const sites=[...walk('components'),...walk('lib'),...(fs.existsSync('app')?walk('app'):[])].filter(f=>/createPlayer\(/.test(fs.readFileSync(f,'utf8')));
 for(const file of sites){if(LEFT[file])continue;const src=fs.readFileSync(file,'utf8');assert.ok(/setBeanLook\(/.test(src),`${file} creates a player rig without setBeanLook`);}
 assert.ok(sites.length>=12,'call-site scan found '+sites.length);
 assert.match(fs.readFileSync('lib/arcade/strikerScene.ts','utf8'),/matchPlayerDress\(/,'strikers dress team kits');
 assert.match(fs.readFileSync('lib/town/fieldRuntime.ts','utf8'),/fieldTokenDress\(/,'live + taught pitches dress team kits');
}
// ---- Main player in Town: team colours during the draw-the-pass lesson / rooftop knockout, own look after.
{
 const own={body:'#5fb8f2',skin:'#e9b98f',build:'short',eyes:'ovals',mouth:'smile',hair:{style:'ponytail',color:'#3a2217'},headwear:'cap',headwearColor:'#23315e'},ownOutfit={...B.DEFAULT_CASUAL_OUTFIT,number:10};
 const team=L.mainPlayerDress(own,ownOutfit,true,10),home=L.sideGameDress('x','home');
 assert.equal(team.look.body,home.look.body);assert.equal(kitOf(team.outfit),kitOf(home.outfit));assert.equal(team.outfit.number,10);
 assert.equal(team.look.build,'short');assert.deepEqual(team.look.hair,own.hair);assert.equal(team.look.headwear,'none');
 const back=L.mainPlayerDress(own,ownOutfit,false,10);assert.ok(back.look===own&&back.outfit===ownOutfit,"own look restored untouched");
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/lessonRef\.current\)\|\|liveKnockout\.joined[^\n]*mainPlayerDress\(/,'Town switches the main player into team colours for the lesson/knockout');
}
console.log('bean-looks: ok');
