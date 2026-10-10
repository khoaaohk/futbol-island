// wwc-1991 full-screen experience ("A Sky of Firsts", Oct 5 2026): the case's facts are in it, every Women's World Cup star is
// accurate and sourced, the replay matches the real final (80 minutes, USA 2–1 Norway, both US goals by Akers), the banned-years
// data is right, Back is the shared ExperienceBack (no local NavigationButton Back), the header clears the Back zone, and every
// loop sleeps, pauses when hidden and is disposed.
// Oct 9 2026 restyle ("Cut from paper"): Chinese paper-cut in four beats (Shut out → China 1991 → the final + "Your turn" →
// every star since); checks the 1991 tournament facts, the Akers game's heat/keyboard/teaching contract, the paper-cut motifs,
// the self-hosted OFL fonts, and that beat changes use FLIP (no View Transitions).
// usage: node tests/museum-exp-wwc-1991.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/wwc-1991/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const D=require('../'+dir+'data.ts'),X=require('../lib/endgame/museum.ts');
const exp=read(dir+'Experience.tsx'),icons=read(dir+'icons.tsx'),fin=read(dir+'FinalReplay.tsx'),dark=read(dir+'DarkYears.tsx'),css=read(dir+'wwc.module.css');
const game=read(dir+'AkersGame.tsx'),china=read(dir+'China91.tsx'),cut=read(dir+'papercut.tsx'),spring=read(dir+'spring.ts');
const all=[exp,fin,dark,icons,game,china,cut,spring,read(dir+'data.ts')].join('\n');
const norm=s=>s.replace(/[’']/g,"'");

// 1. The case's own facts appear in the experience.
{const e=X.EXHIBITS.find(x=>x.id==='wwc-1991');const text=norm(all);
 assert.ok(text.includes(norm(e.facts[0])),'fact: first WWC in China 1991');
 assert.ok(text.includes('USA 2–1 Norway'),'fact: USA beat Norway 2–1');
 assert.ok(text.includes(norm(e.facts[2]).replace(/\.$/,'')),'fact: Akers scored both US goals');
 assert.equal(D.TAKE_IT,e.forYourGame,'take-it-to-your-game line is the case’s own');
 console.log('PASS case facts and take-it line are in the experience');}

// 2. The constellation: every edition, in order, with verified hosts, winners and finals.
{const want={1991:['China','USA','USA 2–1 Norway'],1995:['Sweden','Norway','Norway 2–0 Germany'],1999:['USA','USA','USA 0–0 China'],2003:['USA','Germany','Germany 2–1 Sweden'],
  2007:['China','Germany','Germany 2–0 Brazil'],2011:['Germany','Japan','Japan 2–2 USA'],2015:['Canada','USA','USA 5–2 Japan'],2019:['France','USA','USA 2–0 Netherlands'],2023:['Australia and New Zealand','Spain','Spain 1–0 England']};
 assert.deepEqual(D.EDITIONS.map(e=>e.year),[1991,1995,1999,2003,2007,2011,2015,2019,2023,2027]);
 for(const e of D.EDITIONS.filter(x=>!x.upcoming)){const [h,w,f]=want[e.year];assert.equal(e.host,h,e.year+' host');assert.equal(e.winner,w,e.year+' winner');assert.ok(e.final.startsWith(f),e.year+' final');}
 assert.deepEqual(D.EDITIONS.map(e=>e.teams),[12,12,16,16,16,16,24,24,32,32],'12 → 16 → 24 → 32 teams');
 const fut=D.EDITIONS.at(-1);assert.ok(fut.upcoming&&fut.host==='Brazil'&&fut.winner===null&&/24 June to 25 July 2027/.test(fut.final),'2027 Brazil is shown as not played yet');
 assert.deepEqual(D.titles(),[['USA',4],['Germany',2],['Norway',1],['Japan',1],['Spain',1]],'titles legend');
 assert.match(exp,/WIDE:\[number,number\]\[\]=\[(\[[\d.]+,[\d.]+\],?){10}\]/,'a star position for each edition (wide)');assert.match(exp,/TALL:\[number,number\]\[\]=\[(\[[\d.]+,[\d.]+\],?){10}\]/,'…and tall');
 console.log('PASS constellation: 10 stars, hosts/winners/finals/team counts verified, 2027 marked upcoming');}

// 3. The 1991 replay is the real final.
{const F=D.FINAL_1991;assert.equal(F.length,80,'80-minute matches in 1991');assert.equal(F.date,'30 November 1991');assert.match(F.place,/Tianhe Stadium, Guangzhou/);assert.equal(F.crowd,'63,000');
 assert.deepEqual(F.goals.map(g=>[g.min,g.team,g.who]),[[20,'USA','Michelle Akers'],[29,'Norway','Linda Medalen'],[78,'USA','Michelle Akers']]);
 assert.match(F.goals[0].how,/header.*Higgins/);assert.match(F.goals[2].how,/back pass/);
 for(const g of F.goals){const end=g.path.at(-1);assert.equal(end[0],g.team==='USA'?105:0,'each goal ends in the right goal');assert.ok(end[1]>30.34&&end[1]<37.66,'…between the posts');}
 assert.match(all,/spots on the map are drawn/,'the map says the spots are illustrative');
 console.log('PASS 1991 final: 80 minutes, Akers 20′, Medalen 29′, Akers 78′, illustrative spots labelled');}

// 4. Banned years.
{assert.deepEqual(D.BANS.map(b=>[b.country,b.from,b.to]),[['England',1921,1971],['Brazil',1941,1979],['West Germany',1955,1970]]);
 assert.match(norm(all),/53,000 fans watched Dick, Kerr Ladies/);assert.match(all,/Decree-law 3,199/);assert.match(all,/2 × 30 minutes/);
 assert.equal(D.DARK_FROM,1920);assert.equal(D.DARK_TO,1991);
 console.log('PASS banned years: England 1921–71, Brazil 1941–79, West Germany 1955–70');}

// 5. Sources: every claim area cited, with URLs, shown in the experience.
{const urls=D.SOURCES.map(s=>s.url);assert.ok(urls.every(u=>/^https:\/\//.test(u)),'every source has a URL');
 for(const k of ['china-1991','1991_FIFA_Women%27s_World_Cup_final','Michelle_Akers','List_of_FIFA_Women%27s_World_Cup_finals','golden-ball','2003_FIFA','Bans_of_women','Decree-law_3,199','germany','dick,-kerr','2027'])assert.ok(urls.some(u=>u.toLowerCase().includes(k.toLowerCase())),'source for '+k);
 assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/SOURCES\.map/);assert.match(exp,/not part of the island’s story/,'real history vs game fiction');
 console.log('PASS sources: '+urls.length+' cited links in a Sources list');}

// 6. Host contract: root, Back, keyboard.
{assert.match(exp,/data-museum-experience="wwc-1991"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(all),'no local NavigationButton Back');assert.equal((all.match(/label="Back"/g)||[]).length,0,'no second Back');
 assert.ok(!/immediate/.test(all),'never `immediate`');
 assert.match(css,/\.header\{[^}]*padding:20px 24px 4px 124px/,'desktop header starts right of the 100 px Back zone');assert.match(css,/\.header\{padding:16px 16px 4px 108px/,'phone header starts right of the 92 px Back zone');
 assert.ok(!/::view-transition/.test(css),'no global view-transition rules in the module');assert.match(exp,/e\.key==='Escape'[^}]*onClose\(\)/,'Escape closes');
 assert.match(css,/min-height:44px/);assert.match(css,/\.range\{[^}]*height:44px[^}]*touch-action:none/,'year slider: 44 px, touch drags don’t scroll');assert.match(css,/\.star\{[^}]*width:max\(48px,[^}]*height:max\(48px,/,'stars are at least 48 px targets');
 assert.match(css,/\.fan\{[^}]*touch-action:none/,'the paper fold owns its drag');assert.match(css,/\.game\{[^}]*touch-action:none/,'the Akers pitch owns its drag');
 assert.ok(!/startViewTransition/.test(all),'no View Transitions (they broke /museum before)');assert.ok(!/view-transition-name|viewTransitionName/.test(all+css),'no view-transition names');
 assert.match(exp,/flip\(p,from,\{scale:true/,'the beat rail’s tab slides by FLIP');assert.match(spring,/\.animate\(p\.map/,'FLIP keyframes are sampled from the spring');assert.match(css,/:active\{transform:scale/,'press-shrink');
 assert.match(css,/safe-area-inset-top/);assert.match(css,/prefers-reduced-motion:reduce/);
 console.log('PASS contract: fixed dialog root, shared Back (no immediate), Escape, 44 px targets, safe areas, reduced motion');}

// 7. Heat: no endless loops, everything stops and is cleaned up.
{assert.ok(!/setInterval/.test(all),'no polling');
 for(const [name,src] of [['replay',fin],['dark',dark]]){assert.match(src,/if\(!playing\)return;/,name+': loop only while playing');assert.match(src,/cancelAnimationFrame\(raf\)/,name+': cancelled on unmount');
  assert.match(src,/visibilitychange/,name+': pauses when hidden');assert.match(src,/setPlaying\(false\);return;/,name+': stops itself when finished');}
 assert.match(exp,/ro\.disconnect\(\)/,'resize observer disposed');assert.ok(!/requestAnimationFrame/.test(exp),'the shell has no loop');
 assert.ok(!/<canvas/.test(all),'no canvas: the paper is static SVG + CSS (no per-frame texture)');assert.ok(!/feTurbulence/.test(all),'no live SVG noise in the DOM; the grain is a CSS tile');
 assert.ok(!/infinite/.test(css),'no infinite CSS animation');assert.match(css,/nudge 1s 1\.4s ease-in-out 4/,'the try-it nudge is finite');assert.match(css,/ring 1\.3s ease-out \.6s 4/,'the try-it ring is finite');
 assert.match(exp,/removeEventListener\('keydown'/);
 for(const [name,src] of [['akers',game],['fold',china]]){assert.match(src,/if\(document\.hidden\)\{e\.last=0;return;\}/,name+': the frame stops when hidden');
  assert.match(src,/visibilitychange/,name+': listens for hiding');assert.match(src,/cancelAnimationFrame\(e\.raf\);e\.raf=0;\};\},\[/,name+': cancelled on unmount');assert.match(src,/stepSpring/,name+': spring-driven');assert.match(src,/rubber\(/,name+': rubber-banded at its bounds');}
 assert.match(game,/if\(moving\)e\.raf=requestAnimationFrame\(frame\);else e\.last=0;/,'akers: the loop only runs while something moves');
 assert.match(china,/if\(e\.drag\|\|!settled\)e\.raf=requestAnimationFrame\(frame\);else e\.last=0;/,'fold: the loop only runs while dragging or settling');
 assert.match(game,/setAttribute\('transform'/,'akers: positions written to SVG, no React render per frame');
 assert.match(game,/if\(reduced\.current\)\{e\.ax\.x=e\.t\.x/,'reduced motion: no spring on Akers');assert.match(game,/if\(reduced\.current\)\{\/\/ The finished moment, still/,'reduced motion: Show me jumps to the finished goal');
 assert.match(fin,/reduced\.current\)\{seek\(TOTAL\)/,'reduced motion jumps the replay to full time');
 assert.ok(!/AudioContext\(/.test(all),'no own AudioContext: sounds go through museumSfx (mute respected)');
 console.log('PASS heat: loops sleep, stop when hidden/finished/unmounted; no canvas; fold + Akers loops only while moving');}

// 8. Beat 2: China 1991, verified against Wikipedia (1991 FIFA Women's World Cup; 1988 Invitation Tournament).
{const C=D.CHINA_1991;assert.equal(C.dates,'16 to 30 November 1991');assert.deepEqual([...C.cities],['Guangzhou','Foshan','Jiangmen','Zhongshan']);
 assert.equal(C.officialName,'1st FIFA World Championship for Women’s Football for the M&M’s Cup');assert.match(C.opener,/China beat Norway 4–0.*Ma Li scored the first goal/);
 assert.match(C.trial,/1988/);assert.match(C.minutes,/80 minutes/);
 assert.deepEqual(D.TEAMS_1991.map(t=>t.name).sort(),['Brazil','China','Chinese Taipei','Denmark','Germany','Italy','Japan','New Zealand','Nigeria','Norway','Sweden','USA']);
 assert.equal(new Set(D.TEAMS_1991.map(t=>t.from)).size,6,'all six confederations');assert.ok(D.TEAMS_1991.find(t=>t.name==='China').host);
 assert.ok(D.SOURCES.some(s=>s.url.includes('1988_FIFA_Women%27s_Invitation_Tournament')),'the 1988 trial is sourced');
 assert.match(china,/role="slider"/);assert.match(china,/ArrowRight/);assert.match(china,/Unfold the paper/,'a button alternative to the drag');
 console.log('PASS China 1991: dates, 4 cities, official name, Ma Li’s first goal, 12 teams from 6 confederations, unfold has keys + button');}

// 9. Beat 3b: "Your turn: score Akers's winner" teaches pressing the back pass, with keyboard and button alternatives.
{const P=D.AKERS_PLAY;assert.deepEqual(P.posts,[30.34,37.66]);assert.ok(P.keeper[0]>P.defender[0]&&P.passTo[0]>P.defender[0],'the pass goes BACK toward the keeper');
 assert.match(game,/ArrowRight/);assert.match(game,/ev\.key===' '\|\|ev\.key==='Enter'/,'Space/Enter starts and shoots');
 assert.match(game,/>Shoot</);assert.match(game,/>Show me</);assert.match(game,/DRAG ME TO THE BALL/,'a try-it tag a 7-year-old understands');
 assert.match(game,/Keep pressing: a defender’s mistake can become your goal/,'the takeaway');assert.match(game,/role="status" aria-live="polite"/,'live feedback');
 for(const w of ['keeper','tackle','saved','wide','soft'])assert.match(game,new RegExp(w+":'"),'feedback for '+w);
 assert.match(fin,/data-try-akers/,'the final offers Your turn');assert.match(fin,/TAKE_IT/,'the case’s take-it line stays');
 console.log('PASS Your turn: back pass → win it → shoot; arrows/Space, Shoot and Show me; live feedback; pressing takeaway');}

// 10. The paper-cut style: real techniques, self-hosted OFL fonts.
{assert.match(cut,/export function sawRing/);assert.match(cut,/export function crescent/);assert.match(cut,/fillRule="evenodd"/,'shapes are one sheet with holes');
 assert.match(cut,/k<n;k\+\+/,'folded n-fold symmetry');
 const pub=path.join(root,'public/museum/experiences/wwc-1991/');for(const f of ['anton-latin.woff2','zcool-qingke-subset.woff2','FONTS-OFL.txt'])assert.ok(fs.existsSync(pub+f),'self-hosted: '+f);
 assert.match(fs.readFileSync(pub+'FONTS-OFL.txt','utf8'),/SIL Open Font License/);assert.match(css,/@font-face\{font-family:wwcPoster;src:url\('\/museum\/experiences\/wwc-1991\/anton-latin\.woff2'\)/);
 assert.match(css,/--poster:wwcPoster,Anton,Impact/,'with a fallback stack');
 console.log('PASS paper-cut: sawtooth, crescent, evenodd sheets, folded symmetry; fonts self-hosted under OFL with fallbacks');}

// 11. Oct 9 2026 (story pass): beat 5, "Cut your star", a quick check whose answers were all taught in beats 1–3.
{const quiz=read(dir+'Quiz.tsx');assert.equal(D.QUIZ.length,5,'five questions, five points of the star');
 for(const q of D.QUIZ){assert.ok(q.right>=0&&q.right<q.choices.length&&new Set(q.choices).size===q.choices.length,q.q);assert.ok(q.why.length>20);}
 assert.ok(new Set(D.QUIZ.map(q=>q.right)).size>1,'the right answer moves around');
 assert.equal(D.QUIZ[0].choices[D.QUIZ[0].right],'80 minutes');assert.equal(D.QUIZ[1].choices[D.QUIZ[1].right],'Michelle Akers');assert.equal(D.QUIZ[3].choices[D.QUIZ[3].right],'12');
 assert.match(exp,/\['quiz','5','Quiz'\]/);assert.match(exp,/<QuizStage q=\{quiz\}\/>/);assert.match(exp,/data-wwc-to-quiz/,'the stars beat leads on to the quiz');
 assert.ok(!/requestAnimationFrame/.test(quiz),'the quiz runs no loop (one-shot WAAPI pop only)');assert.match(quiz,/!q\.reduced\.current\)pop\(/,'reduced motion skips the pop');
 assert.match(quiz,/role="status" aria-live="polite"/,'live feedback');
 console.log('PASS Cut your star: five sourced questions, the answer moves, no loop, reduced motion, live feedback');}
