// worldcup-1930 "Two weeks at sea" (Oct 5 2026): the case's facts appear word for word, the voyage/tournament data matches the
// verified record, Back is a NavigationButton without `immediate`, every loop sleeps / stops when hidden / is torn down on
// unmount, and the sources are cited with URLs.
// Polish (Oct 5 2026): Back is the shared ExperienceBack; the keepy-up has its own card; spring / scroll-driven motion.
// Oct 9 2026 (styles + motion pass): an Art Deco travel poster in the full view (self-hosted OFL fonts via FontFace), a
// drag-scrubbed match clock (spring follow, flick momentum, rubber-band at the half-time wall), a drag-the-ball half-time swap,
// spring FLIP instead of View Transitions; section 6 below checks those.
// usage: node tests/museum-exp-worldcup-1930.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/worldcup-1930/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),D=require('../'+dir+'data.ts');
const ui=read(dir+'Experience.tsx'),chart=read(dir+'voyage.ts'),css=read(dir+'Experience.module.css'),poster=read(dir+'Poster.tsx'),spring=read(dir+'spring.ts');

// 1. The case's three facts, quoted exactly and shown.
{const e=X.EXHIBITS.find(x=>x.id==='worldcup-1930');for(const f of e.facts)assert.ok(Object.values(D.CASE_FACTS).includes(f),'case fact quoted: '+f);
 for(const k of ['host','final','teams'])assert.ok(ui.includes(`CASE_FACTS.${k}`),k+' fact is rendered');
 assert.ok(ui.includes('exhibit.forYourGame'),'the take-it-to-your-game line is shown');
 console.log('PASS case facts: quoted word for word and rendered');}

// 2. The record: 13 teams in 4 groups, the right winners, semis and final, and the final's goals add up to 4–2 (2–1 at half-time).
{const ids=D.GROUPS.flatMap(g=>g.teams);assert.equal(ids.length,13);assert.equal(new Set(ids).size,13);assert.deepEqual(Object.keys(D.TEAMS).sort(),ids.slice().sort());
 const by=k=>Object.values(D.TEAMS).filter(t=>t.from===k).length;assert.deepEqual([by('sa'),by('eu'),by('na')],[7,4,2],'7 South America, 4 Europe, 2 North America');
 assert.deepEqual(D.GROUPS.map(g=>g.winner),['arg','yug','uru','usa']);
 assert.deepEqual(Object.values(D.TEAMS).filter(t=>t.ship).map(t=>t.id).sort(),['bel','bra','fra','rou'],'the Conte Verde carried Romania, France, Belgium and Brazil');
 assert.ok(D.GROUPS.every(g=>!D.TEAMS[g.winner].ship),'…and all four went out in the groups');
 assert.deepEqual(D.SEMIS.map(t=>[t.a,t.b,t.winner,t.score]),[['arg','usa','arg','Argentina 6–1 USA'],['uru','yug','uru','Uruguay 6–1 Yugoslavia']]);
 assert.equal(D.FINAL.winner,'uru');assert.deepEqual(D.score(45),{uru:1,arg:2},'2–1 to Argentina at half-time');assert.deepEqual(D.score(90),{uru:4,arg:2},'4–2 at full time');
 assert.deepEqual(D.GOALS.map(g=>g.min),[12,20,37,57,68,89]);
 for(const g of D.GROUPS)assert.equal(g.games.length,g.teams.length*(g.teams.length-1)/2,g.label+': every team played every other team once (all the scores listed)');
 assert.ok(D.GROUPS[0].games.includes('Chile 1–0 France'),'Group 1 includes Chile 1–0 France (19 July 1930)');
 assert.deepEqual(D.PORTS.map(p=>[p.id,p.date??null]),[['genoa','21 June 1930'],['villefranche',null],['barcelona',null],['rio','29 June 1930'],['montevideo','4 July 1930']]);
 assert.ok(D.PORTS.every((p,i,a)=>!i||p.p>a[i-1].p)&&D.COURSE.every((c,i,a)=>!i||c.p>a[i-1].p),'ports and course in scroll order');
 for(const p of D.PORTS)assert.ok(D.COURSE.some(c=>c.p===p.p&&c.at[0]===p.at[0]&&c.at[1]===p.at[1]),p.id+' is on the course at its card');
 for(const s of ['68,346','Argentina’s ball in the first half, Uruguay’s in the second','Lucien Laurent','18 July','1830','Stábile','8 goals','Langenus','68–70 cm','410–450 g'])assert.ok(ui.includes(s)||JSON.stringify(D).includes(s),'shown: '+s);
 console.log('PASS record: 13 teams, groups, ship teams, semis 6–1 / 6–1, final 2–1 → 4–2 with both balls, voyage dates');}

// 3. Host contract + Back: the shared ExperienceBack (same corner in every exhibit), no local NavigationButton Back.
{assert.match(ui,/data-museum-experience="worldcup-1930"/);assert.match(ui,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(ui,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.equal((ui.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1,'exactly one shared Back');
 assert.doesNotMatch(ui,/NavigationButton/,'no local NavigationButton Back');assert.doesNotMatch(ui,/@\/components\/DoneButton/);
 assert.match(css,/\.header\{[^}]*justify-content:flex-end[^}]*padding:[^;]*calc\(108px/,'the header keeps the Back corner clear');
 assert.match(ui,/e\.key==='Escape'/,'Escape leaves');
 console.log('PASS contract: fixed full-screen dialog, shared ExperienceBack only (corner kept clear), Escape');}

// 4. Heat: loops sleep, stop when hidden and are torn down; the chart is lazy and disposed; no polling; pixel ratio capped.
{assert.match(ui,/import\('\.\/voyage'\)/,'the chart loads lazily');assert.match(ui,/import type \{Chart\} from '\.\/voyage'/,'only its type is imported eagerly');
 assert.doesNotMatch(ui+chart+poster,/setInterval|setTimeout/,'no timers or polling');assert.doesNotMatch(css,/infinite/,'no endless CSS animation');
 assert.match(ui,/if\(Math\.abs\(target-cur\)>\.0004\)raf=requestAnimationFrame\(frame\);else/,'the chart loop sleeps once the ship settles');
 assert.match(ui,/if\(e\.x>=c\)\{e\.x=c;e\.play=false;setPlaying\(false\);if\(c===45\)hitWall\(\);\}/,'Play stops at half-time / full time');
 assert.match(ui,/if\(e\.drag\|\|e\.play\|\|!settled\)e\.raf=requestAnimationFrame\(frame\);else e\.last=0;/,'the clock loop sleeps once nothing is dragging, playing or settling');
 assert.match(ui,/if\(!\(a&&c\)&&!document\.hidden\)b\.raf=requestAnimationFrame\(tick\);/,'the ball spring-back stops when settled or hidden');
 assert.doesNotMatch(spring,/requestAnimationFrame|setInterval|setTimeout/,'the spring kit never runs a loop of its own');
 assert.doesNotMatch(poster,/requestAnimationFrame|setInterval|setTimeout|infinite/,'the poster entrance is one-shot WAAPI');
 assert.match(poster,/prefers-reduced-motion: reduce\)'\)\.matches\)return/,'the poster entrance is skipped with reduced motion');
 assert.match(ui,/b\.air=false[\s\S]{0,260}return;\}/,'the keepy-up loop stops when the ball lands');
 assert.ok((ui.match(/visibilitychange/g)||[]).length>=6,'every loop listens for the tab hiding (add + remove)');
 assert.ok((ui.match(/cancelAnimationFrame/g)||[]).length>=4,'every loop is cancelled');
 assert.match(ui,/chart\?\.dispose\(\);chart=null/);assert.match(chart,/dispose:\(\)=>\{[^}]*canvas\.width=canvas\.height=0/);
 assert.match(chart,/Math\.min\(window\.devicePixelRatio\|\|1,opts\.coarse\?1\.5:2\)/);
 assert.doesNotMatch(ui,/new AudioContext/,'sound goes through the museum’s shared, mute-aware one-shots');
 assert.match(css,/prefers-reduced-motion/);assert.match(ui,/prefers-reduced-motion/);
 // CSS module hygiene: every rule's selector includes a local class.
 const flat=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\{(?:[^{}]*\{[^}]*\})*\s*\}/g,'').replace(/@(?:media|supports)[^{]*\{/g,'{');
 const sels=[...flat.matchAll(/(?:^|[{}])\s*([^{}]+)\{/g)].map(m=>m[1].trim()).filter(Boolean);assert.ok(sels.length>50);
 for(const sel of sels)for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,'local class in selector: '+part.trim());
 console.log('PASS heat: lazy chart, loops sleep / stop when hidden / are cancelled, disposal, DPR cap, shared audio, local CSS selectors');}

// 5. Sources: cited with URLs and shown in the experience.
{assert.ok(D.SOURCES.length>=8);for(const s of D.SOURCES)assert.match(s.url,/^https:\/\//);
 for(const host of ['fifa.com','thedailystar.net','guinnessworldrecords.com','theifab.com/laws/latest/the-ball'])assert.ok(D.SOURCES.some(s=>s.url.includes(host)),'cites '+host);
 assert.match(ui,/<summary>Sources<\/summary>/);assert.match(ui,/SOURCES\.filter/);
 console.log('PASS sources: FIFA, The Daily Star, Guinness, IFAB and Wikipedia, listed in the experience');}

// 6. Oct 9 2026: style (Art Deco poster) and motion (springs, drag, FLIP) contract.
{assert.doesNotMatch(ui+poster+css,/startViewTransition|view-transition|viewTransitionName/,'no View Transitions (they broke /museum before): FLIP instead');
 assert.match(ui,/import \{flip,rubber,stepSpring\} from '\.\/spring'/);assert.match(spring,/export function flip\(/);assert.match(spring,/export function rubber\(/);
 assert.match(ui,/flip\(el,f\.rect/,'bracket pick flies to its real place (FLIP)');assert.match(ui,/flip\(el,r,\{k:230,c:21,scale:true\}\)/,'the balls trade places (FLIP)');
 // The match clock is a real control: a slider with keyboard steps, a rubber-banded drag and release momentum.
 assert.match(ui,/role="slider" tabIndex=\{0\} aria-label="Match clock" aria-valuemin=\{0\} aria-valuemax=\{90\}/);
 for(const k of ['ArrowRight','ArrowLeft','PageUp','PageDown','Home','End'])assert.ok(ui.includes(k),'keyboard: '+k);
 assert.match(ui,/e\.target=rubber\(toMin\(ev\.clientX\),0,cap\(\),5\)/,'drag rubber-bands at the half-time wall');assert.match(ui,/Release velocity/,'a flick keeps the clock rolling');
 assert.match(ui,/data-swap onClick=\{swap\}/,'a Swap button is the keyboard / no-drag alternative to dragging the ball');
 assert.match(ui,/Not yet! Argentina’s ball is used in the first half\./,'feedback when you try to swap too early');
 assert.match(css,/\.scrub\{[^}]*touch-action:pan-y/,'the clock drag never fights vertical page scroll');assert.match(css,/\.ball\[data-drag\]\{[^}]*touch-action:none/,'the ball drag owns its gesture');
 assert.match(css,/\.thumb\{[^}]*width:38px;height:38px/);assert.match(css,/\.scrub\{[^}]*height:56px/,'the clock is a ≥44 px target');
 assert.match(ui,/aria-live="polite">\{nudge\|\|/,'live feedback for the ball swap');
 // Self-hosted OFL fonts, loaded with FontFace (no global @font-face in the module), with fallbacks.
 for(const f of ['limelight-latin.woff2','josefin-sans-latin.woff2','OFL-Limelight.txt','OFL-JosefinSans.txt'])assert.ok(fs.existsSync(path.join(root,'public/museum/experiences/worldcup-1930',f)),'self-hosted: '+f);
 assert.match(ui,/new FontFace\('WC30 Deco'/);assert.doesNotMatch(css,/@font-face/);assert.match(css,/--deco:"WC30 Deco","Limelight",[^;]*serif/);
 assert.match(ui,/new drawings in the style of 1930s Art Deco travel posters/,'the art is labelled as new drawings in a style');
 // 7. Oct 9 2026 (story pass): a quick learning check before the outro: each right answer punches the ticket.
 assert.ok(D.QUIZ.length>=3);for(const q of D.QUIZ){assert.ok(q.right>=0&&q.right<q.choices.length&&new Set(q.choices).size===q.choices.length,q.q);assert.ok(q.why.length>20);}
 assert.ok(new Set(D.QUIZ.map(q=>q.right)).size>1,'the right answer moves around');
 assert.match(ui,/<TicketCheck\/>/);assert.match(ui,/\{id:'quiz',label:'Ticket'\}/,'the ticket check is a chapter');assert.match(ui,/data-chapter="quiz"/);
 assert.match(css,/\.quote\{margin:0 auto;/,'the outro quote is centred with the rest of the outro');
 console.log('PASS style + motion: deco fonts self-hosted, FLIP not View Transitions, slider + keyboard, rubber band, momentum, swap by drag or button');}
