// cards-1970 "The Junction" (Oct 5 2026): the case's facts are quoted word for word, the new history is cited, the six
// practice calls cover all three lamps and are labelled made-up, the silhouette rig grounds every pose, the Back button is the
// shared ExperienceBack (never `immediate`), and the replay loop sleeps, pauses when hidden and is cancelled on unmount.
// usage: node tests/museum-exp-cards-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/cards-1970/',read=f=>fs.readFileSync(path.join(root,dir,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require('../'+dir+'content.ts'),R=require('../'+dir+'rig.ts');
const exp=read('Experience.tsx'),stage=read('Stage.tsx'),css=read('Experience.module.css');

// 1. Facts: the case's own lines, word for word, and shown.
{const e=X.EXHIBITS.find(x=>x.id==='cards-1970');
 for(const f of e.facts)assert.ok(Object.values(C.CASE_FACTS).includes(f),'case fact quoted: '+f);
 assert.equal(C.CASE_FACTS.forYourGame,e.forYourGame);
 for(const k of ['aston','mexico','language','forYourGame'])assert.ok(exp.includes('CASE_FACTS.'+k),k+' is shown');
 assert.ok(exp.includes('STORY_1966')&&exp.includes('FIRSTS')&&exp.includes('LADDER'),'story, firsts and the Law 12 ladder are shown');
 console.log('PASS facts: the case’s three facts and take-away are quoted and shown');}

// 2. Sources: every new claim cited, IFAB Law 12 included, the list is rendered.
{const urls=C.SOURCES.map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 assert.ok(urls.includes('https://www.theifab.com/laws/latest/fouls-and-misconduct/'),'IFAB Law 12');
 for(const host of ['inside.fifa.com','referee.com','topendsports.com','guinnessworldrecords.com'])assert.ok(urls.some(u=>u.includes(host)),host+' cited');
 assert.match(exp,/function Sources[\s\S]*SOURCES\.map/,'sources rendered');assert.match(exp,/made-up/,'practice calls labelled made-up');
 assert.ok(!/@gmail|khoa/i.test(exp+stage+JSON.stringify(C)),'no personal data');
 console.log('PASS sources: '+urls.length+' cited, practice calls labelled');}

// 3. The six calls: all three lamps used, every scene well formed, the rig grounds every pose.
{assert.equal(C.SCENES.length,6);assert.deepEqual([...new Set(C.SCENES.map(s=>s.answer))].sort(),['none','red','yellow']);
 assert.deepEqual(C.LADDER.map(l=>l.word),['Careless','Reckless','Excessive force'],'Law 12 ladder');
 for(const s of C.SCENES){assert.ok(s.moment>0&&s.moment<s.duration,s.id+' moment');assert.ok(s.figs.some(f=>f.num===s.watch),s.id+' watched player exists');
  assert.ok(/^Law 12/.test(s.law)&&s.why.length>40,s.id+' explains the Law');
  for(const f of [...s.figs.map(f=>f.keys),s.ball])for(let i=1;i<f.length;i++)assert.ok(f[i].t>f[i-1].t,s.id+' keys in time order');
  for(const f of s.figs)for(let t=0;t<=s.duration;t+=.05){const p=R.sample(f.keys,t),r=R.solve(p.pose,p.x,0,f.dir);
   const low=Math.max(r.hip[1],r.shoulder[1],r.head[1]+R.BODY.head,...['elbow','hand','knee','ankle','toe'].flatMap(k=>[r.far[k][1],r.near[k][1]]));
   assert.ok(Math.abs(low-(R.GROUND-R.BODY.sole))<1e-6,s.id+' grounded');}}
 assert.equal(R.solve(C.POSES.stand,100,30,1).hip[1],R.solve(C.POSES.stand,100,0,1).hip[1]-30,'lift raises the figure');
 console.log('PASS calls: 6 scenes, green/amber/red all used, every frame grounded');}

// 4. Contract, controls and heat.
{assert.match(exp,/data-museum-experience="cards-1970"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(exp+stage),'no local NavigationButton Back');assert.ok(!/immediate/.test(exp.replace(/\/\*[\s\S]*?\*\//g,'')),'Back never immediate');
 assert.match(css,/\.top\{[^}]*padding-left:96px/,'header clears the Back corner');
 assert.match(stage,/timeScale/,'bullet time around the key moment');assert.match(exp,/startViewTransition/,'phase changes use a View Transition');
 assert.match(exp,/if\(reduced\|\|typeof d\.startViewTransition!=='function'\)\{fn\(\);return;\}/,'reduced motion skips the transition');
 assert.match(exp,/e\.key==='Escape'[^\n]*onClose\(\)/,'Escape closes');assert.match(exp,/data-museum-own-cue/,'lamps carry their own sound cue');
 assert.match(css,/\.lamp:not\(:disabled\):active\{transform:scale/,'lamps shrink on press');assert.match(css,/\.btn:not\(:disabled\):active\{transform:scale/,'buttons shrink on press');
 assert.match(css,/min-height:44px/);assert.match(css,/safe-area-inset-bottom/);assert.match(css,/prefers-reduced-motion/);
 assert.match(stage,/if\(tt>=scene\.duration\)\{raf=0;end\.current\(\);return;\}/,'the loop stops when the replay ends');
 assert.match(stage,/visibilitychange/);assert.match(stage,/document\.hidden\)\{cancelAnimationFrame\(raf\)/,'pauses when hidden');
 assert.match(stage,/return \(\)=>\{cancelAnimationFrame\(raf\);raf=0;document\.removeEventListener/,'cancelled on unmount');
 assert.match(stage,/if\(reduced\)\{setT\(scene\.moment\)/,'reduced motion: a still, no playback');
 assert.match(stage,/ro\.disconnect\(\)/,'resize observer disconnected');
 assert.ok(!/setInterval|setTimeout/.test(exp+stage),'no timers or polling');assert.ok(!/AudioContext\(/.test(exp+stage),'sound goes through the museum’s shared, mute-aware context');
 assert.ok(!/https?:\/\/(?!www\.w3)/.test(stage+css),'no external assets');
 console.log('PASS contract: shared Back, Escape, 44px press-shrink controls, sleeping loop, reduced motion, no polling');}
