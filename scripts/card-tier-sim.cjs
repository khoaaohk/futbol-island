// Card value tiers (docs/card-rewards.md "Value tiers"): a deterministic simulation of children playing through the four paths,
// using the real draw rules (lib/town/cardRewards.ts) and tiers (lib/town/cardTiers.json).
// usage: node scripts/card-tier-sim.cjs [children=500] [--json]
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const src=ts.transpileModule(fs.readFileSync(path.join(root,'lib/town/cardRewards.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const mod={exports:{}};vm.runInNewContext(src,{exports:mod.exports,module:mod,Math,Date});
const R=mod.exports;
const TIERS=JSON.parse(fs.readFileSync(path.join(root,'lib/town/cardTiers.json'),'utf8'));
const GROUPS=JSON.parse(fs.readFileSync(path.join(root,'lib/town/positionPlayers.json'),'utf8'));
const PATHS=JSON.parse(fs.readFileSync(path.join(root,'lib/paths/formatPaths.json'),'utf8'));
const seen=new Set(),CARDS=[];
for(const [role,g] of Object.entries(GROUPS))for(const name of [...g.current,...g.allTime])if(!seen.has(name)){seen.add(name);CARDS.push({name,role,tier:R.tierFromDemand(TIERS.cards[name]?.demand,TIERS.thresholds,TIERS.overrides[name])});}
const TIER=new Map(CARDS.map(c=>[c.name,c.tier]));

// A typical child (assumptions, all in one place): paths played one after another (futsal, 7v7, 9v9, 11v11), two lessons a
// session. Per lesson: the quiz pays when it is a clean first-try run (QUIZ_CLEAN); one Ball-hunt ball (41 balls in all);
// one NPC chat; and, every third lesson, a Journey stage (18 in all), a story (18) and an Explore item (15 that pay).
const QUIZ_CLEAN=.6,BALLS=41,JOURNEY_STAGES=18,STORIES=18,EXPLORE=15;
function child(seed){
 let s=seed;const rng=()=>(s=(s*16807)%2147483647)/2147483647;
 const owned=new Set();let offers=0;const log={firstElite:null,firstIcon:null,paths:[]};
 const counts=()=>{const c={icon:0,elite:0,regular:0};for(const n of owned)c[TIER.get(n)]++;return c;};
 let balls=0,journey=0,stories=0,explore=0,lessonNo=0,progress=0;
 const earn=(kind,theme)=>{
  const {cards}=R.drawThemedOffer(CARDS,owned,rng,{gate:R.tierGate(progress,kind),theme});if(!cards.length)return;
  offers++;const pick=cards[Math.floor(rng()*cards.length)];owned.add(pick); // a blind pick: any of the face-down three
  const tier=TIER.get(pick),at={lesson:lessonNo,offer:offers,progress:Math.round(progress*100)};
  if(tier==='elite'&&!log.firstElite)log.firstElite=at;if(tier==='icon'&&!log.firstIcon)log.firstIcon={...at,kind};
 };
 const done=PATHS.map(()=>0);
 PATHS.forEach((p,pi)=>{
  const core=p.chapters.flatMap(c=>c.lessons);
  core.forEach((lesson,li)=>{
   lessonNo++;
   if(balls<BALLS){balls++;earn('ball');}
   earn('npc');
   if(lessonNo%3===0){if(journey<JOURNEY_STAGES){journey++;earn('journey');}if(stories<STORIES){stories++;earn('story');}if(explore<EXPLORE){explore++;earn('explore');}}
   done[pi]=li+1;progress=Math.max(...done.map((d,i)=>d/PATHS[i].chapters.flatMap(c=>c.lessons).length));
   if(rng()<QUIZ_CLEAN)earn('quiz',p.format==='futsal'?R.themeFromText('',true):undefined);
  });
  earn('path');
  log.paths.push({format:p.format,lesson:lessonNo,offers,...counts()});
 });
 return log;
}
const n=Math.max(1,Number(process.argv[2])||500);
const runs=Array.from({length:n},(_,i)=>child(1+i*7919));
const median=list=>{const v=list.filter(x=>x!=null).sort((a,b)=>a-b);return v.length?v[Math.floor(v.length/2)]:null;};
const pct=(list,f)=>Math.round(100*list.filter(f).length/list.length);
const tiers={icon:0,elite:0,regular:0};for(const c of CARDS)tiers[c.tier]++;
const summary={children:n,cards:CARDS.length,tiers,unlock:R.TIER_UNLOCK,weights:R.TIER_WEIGHT,iconTriggers:R.ICON_TRIGGERS,
 firstElite:{medianLesson:median(runs.map(r=>r.firstElite?.lesson)),medianOffer:median(runs.map(r=>r.firstElite?.offer))},
 firstIcon:{medianLesson:median(runs.map(r=>r.firstIcon?.lesson)),medianOffer:median(runs.map(r=>r.firstIcon?.offer)),
  beforeFirstPathFinish:pct(runs,r=>r.firstIcon&&r.firstIcon.kind!=='path'&&r.firstIcon.lesson<=12),fromFirstPathFinish:pct(runs,r=>r.firstIcon?.kind==='path'&&r.firstIcon.lesson===12)},
 afterPath:runs[0].paths.map((p,i)=>({path:p.format,lesson:p.lesson,medianOffers:median(runs.map(r=>r.paths[i].offers)),medianCards:median(runs.map(r=>r.paths[i].icon+r.paths[i].elite+r.paths[i].regular)),medianIcons:median(runs.map(r=>r.paths[i].icon)),minIcons:Math.min(...runs.map(r=>r.paths[i].icon)),maxIcons:Math.max(...runs.map(r=>r.paths[i].icon)),medianElite:median(runs.map(r=>r.paths[i].elite))})),
 child1:runs[0]};
if(process.argv.includes('--json'))console.log(JSON.stringify(summary,null,1));
else{
 console.log(`${n} simulated children · ${CARDS.length} cards: ${tiers.icon} Icon, ${tiers.elite} Elite, ${tiers.regular} Regular`);
 console.log(`First Elite: median lesson ${summary.firstElite.medianLesson} (offer ${summary.firstElite.medianOffer})`);
 console.log(`First Icon: median lesson ${summary.firstIcon.medianLesson} (offer ${summary.firstIcon.medianOffer}); ${summary.firstIcon.fromFirstPathFinish}% at the first path finish, ${summary.firstIcon.beforeFirstPathFinish}% just before it`);
 for(const p of summary.afterPath)console.log(`After ${p.path} (lesson ${p.lesson}): ~${p.medianCards} cards from ${p.medianOffers} picks; Icons median ${p.medianIcons} (min ${p.minIcons}, max ${p.maxIcons}); Elite median ${p.medianElite}`);
}
