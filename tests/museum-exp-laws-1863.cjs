// laws-1863 "The Living Rulebook": facts, the year-by-year rule threads, the word diff, Back, heat and sources.
// usage: node tests/museum-exp-laws-1863.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/laws-1863/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),L=require('../'+dir+'laws.ts');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css');

// 1. The case's own facts, take-it-to-your-game line and sources are all shown.
{const e=X.EXHIBITS.find(x=>x.id==='laws-1863');assert.ok(e);
 assert.match(exp,/exhibit\.facts\.join/,'the three case facts are printed in the standfirst');
 assert.match(exp,/exhibit\.forYourGame/,'take it to your game');
 assert.match(exp,/exhibit\.sources/,'the case sources are listed');
 assert.ok(e.facts.some(f=>/1886/.test(f))&&/1886/.test(exp),'IFAB 1886 shown on the masthead');
 console.log('PASS case facts, your-game line and case sources');}

// 2. The threads: true, dated, in order, ending with today's Laws; the key history is there.
{const {THREADS,MILESTONES,TODAY}=L;assert.equal(THREADS.length,6);
 for(const t of THREADS){assert.equal(t.versions[0].year,1863,t.id+' starts in 1863');assert.ok(t.versions[0].old);assert.equal(t.versions.at(-1).year,TODAY,t.id+' ends today');
  for(let i=1;i<t.versions.length;i++)assert.ok(t.versions[i].year>t.versions[i-1].year,t.id+' in date order');
  for(const v of t.versions){assert.ok(v.text.length>20&&v.why.length>20);assert.ok(MILESTONES.some(m=>m.year===v.year),`${t.id} ${v.year} is a stop on the year rule`);}}
 const at=(id,y)=>{const t=THREADS.find(x=>x.id===id);return t.versions[L.versionIndexAt(t,y)];};
 assert.match(at('goal',1863).text,/without any tape or bar/);assert.match(at('goal',1866).text,/tape/);assert.match(at('goal',1882).text,/crossbar/);
 assert.match(at('goal',TODAY).text,/7\.32 metres.*2\.44 metres.*whole ball crosses the whole goal line/);
 assert.match(at('offside',1863).text,/nearer to the opponent’s goal line is out of play/);assert.match(at('offside',1866).text,/three/);assert.match(at('offside',1925).text,/two/);assert.match(at('offside',1990).text,/Level/);
 assert.match(at('hands',1863).text,/fair catch/);assert.match(at('hands',1871).text,/goalkeeper/);assert.match(at('hands',1912).text,/penalty area/);
 assert.match(at('hands',1992).why,/Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them/,'quotes the back-pass case');
 assert.match(at('players',1863).text,/say nothing of how many players/);assert.match(at('players',1897).text,/eleven/);assert.match(at('players',TODAY).text,/fewer than seven/);
 assert.match(at('throw',1863).text,/first player who touches it/);assert.match(at('throw',1882).text,/both hands/);
 assert.match(at('fair',1863).text,/Neither tripping nor hacking/);assert.match(at('fair',1891).why,/William McCrum/);assert.match(at('fair',1970).why,/1970 World Cup in Mexico/);assert.match(at('fair',2018).why,/2018, in Russia/);
 assert.equal(L.milestoneAt(1924).year,1912);assert.equal(L.yearLabel(TODAY),'Today');assert.equal(L.eraOf(1863),'letterpress');assert.equal(L.eraOf(1925),'book');assert.equal(L.eraOf(1990),'modern');
 console.log('PASS six rules, 1863 to today, dated and true');}

// 3. The word morph keeps unchanged words and only rewrites the rest.
{const d=L.diffWords('at least three of his opponents','at least two of his opponents');
 assert.deepEqual(d.map(t=>t.kind),['same','same','del','add','same','same','same']);
 assert.equal(d.filter(t=>t.kind!=='del').map(t=>t.w).join(' '),'at least two of his opponents');
 for(const t of L.THREADS)for(let i=1;i<t.versions.length;i++){const d=L.diffWords(t.versions[i-1].text,t.versions[i].text);assert.equal(d.filter(x=>x.kind!=='del').map(x=>x.w).join(' '),t.versions[i].text.split(/\s+/).join(' '));}
 console.log('PASS word diff rebuilds every new rule exactly');}

// 4. Contract: root, Back, keyboard, sound.
{assert.match(exp,/data-museum-experience="laws-1863"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(exp),'no local NavigationButton Back');assert.ok(!/\.back\{/.test(css),'no local Back wrapper/positioning');
 assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1,'exactly one Back');
 assert.match(exp,/key==='Escape'/);assert.match(exp,/type="range"/);assert.match(exp,/aria-valuetext/);
 assert.match(exp,/museumSfx\.stamp\(\)/,'sound goes through museumSfx (respects mute)');assert.ok(!/new AudioContext/.test(exp));
 assert.ok(/min-width:44px;min-height:44px/.test(css)&&/\.step\{[^}]*width:48px;height:48px/.test(css),'controls ≥ 44 px');
 assert.ok(!/(^|\})\s*(button|input|a|p|span)[\s:{]/m.test(css),'every CSS-module selector carries a local class');
 assert.match(css,/\.ruler\{[^}]*touch-action:none/,'the year rule owns its drag on touch');assert.match(exp,/setPointerCapture/,'pointer-captured drag');
 assert.match(css,/\.pageBtn\{width:44px;height:44px/,'deck dots are 44 px targets');assert.match(css,/@media \(hover:hover\)/,'hover styles only where hover exists');
 console.log('PASS contract: fixed dialog root, shared ExperienceBack, Escape, accessible slider, touch drag, 44 px targets, muted-aware sound');}

// 5. Heat: no animation loop, no polling, timers cleared, reduced motion honoured, sources cited.
{assert.ok(!/requestAnimationFrame|setInterval/.test(exp),'no render loop or polling: only one-shot CSS animations');
 assert.ok((exp.match(/return\(\)=>clearTimeout\(t\)/g)||[]).length>=1,'the morph clean-up timer is cleared');
 assert.match(exp,/removeEventListener\('keydown'/);assert.match(exp,/removeEventListener\('change'/);
 assert.ok(!/infinite/.test(css),'no infinite CSS animation');assert.match(css,/prefers-reduced-motion:reduce/);assert.match(exp,/prefers-reduced-motion: reduce/);
 assert.ok(L.LAW_SOURCES.length>=12&&L.LAW_SOURCES.every(s=>/^https:\/\//.test(s.url)));
 for(const u of ['wikisource.org/wiki/Laws_of_the_Game_(1863)','theifab.com/laws/latest/offside/','theifab.com/laws/latest/the-players/'])assert.ok(L.LAW_SOURCES.some(s=>s.url.includes(u)),u+' cited');
 assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS heat: no loop, no polling, timers and listeners cleaned up; sources cited');}
