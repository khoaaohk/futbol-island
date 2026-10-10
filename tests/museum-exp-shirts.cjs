// Museum experience · shirts (1928, "Numbers and colours"): the Kit Room. The formation loom puts the classic 1–11 on the
// 1928 2-3-5 line-up, the colour-clash tester runs the three Law 4 checks, and the scan drill always has exactly one free
// team-mate. Facts appear in the experience and are cited; there is no
// animation loop to leak (drag is event-driven, CSS animations are finite, the FLIP flights are one-shot Web Animations) and
// every timer is cleared on unmount. Back is the shared ExperienceBack.
// usage: node tests/museum-exp-shirts.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/shirts',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),D=require(`../${dir}/data.ts`);
const exp=read(`${dir}/Experience.tsx`),css=read(`${dir}/shirts.module.css`),data=read(`${dir}/data.ts`);
const all=fs.readdirSync(path.join(root,dir)).map(f=>read(`${dir}/${f}`)).join('\n');

// 1. Contract and Back: the shared ExperienceBack (fixed, same corner in every exhibit), no local NavigationButton Back.
{assert.match(exp,/export default function Experience\(/);
 assert.match(exp,/data-museum-experience="shirts"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/,'root is fixed full screen at z 20');
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);
 const back=exp.match(/<ExperienceBack[^>]*\/>/g);assert.equal(back.length,1,'exactly one Back');assert.match(back[0],/onClose=\{onClose\}/);
 assert.doesNotMatch(all,/NavigationButton/,'no local NavigationButton Back');
 assert.doesNotMatch(all,/immediate/,'never `immediate`');
 assert.match(exp,/key!=='Escape'/,'Escape leaves');
 // the header keeps the fixed Back's corner clear (desktop 100 x 64, phones 92 x 60)
 assert.match(css,/\.top\{[^}]*padding:0 0 12px 88px/,'header content starts right of the Back');
 console.log('PASS contract: full-screen dialog, shared ExperienceBack, no local Back, Escape');}

// 2. Facts: the case's own facts are shown word for word (from the exhibit prop), the new ones are true and cited.
{const e=X.EXHIBITS.find(x=>x.id==='shirts');
 assert.match(exp,/facts\[0\]/);assert.match(exp,/facts\[1\]/);assert.match(exp,/facts\[2\]/);assert.match(exp,/exhibit\.forYourGame/);
 assert.match(e.facts[1],/1 the goalkeeper, 9 the striker, 10 the playmaker/);
 assert.equal(D.spotOf(1).role,'Goalkeeper');assert.match(D.spotOf(9).role,/striker/i);assert.match(D.spotOf(10).role,/playmaker/i);
 for(const k of ['firstDay','shape','cupFinal'])assert.ok(exp.includes(`EXTRA_FACTS.${k}`),`${k} is shown`);
 assert.match(D.EXTRA_FACTS.firstDay,/25 August 1928, Arsenal and Chelsea/);assert.match(D.EXTRA_FACTS.cupFinal,/1933 FA Cup final, Everton wore 1 to 11 and Manchester City wore 12 to 22/);
 const urls=D.SOURCES.map(s=>s.url);
 for(const u of ['https://en.wikipedia.org/wiki/Squad_number_(association_football)','https://www.theifab.com/laws/latest/the-players-equipment/','https://en.wikipedia.org/wiki/1933_FA_Cup_final','https://www.arsenal.com/feature/27.-gunners-wear-numbered-shirts-aX7y25h6rQhY'])assert.ok(urls.includes(u),'cites '+u);
 for(const s of e.sources)assert.ok(urls.includes(s.url),'keeps the case source '+s.url);
 assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/practice game/,'the scan test is labelled as practice');
 assert.doesNotMatch(all,/@gmail|wikimedia\.org|upload\.wikimedia/,'no email, no Wikimedia hotlinks');
 console.log('PASS facts: case facts word for word, 1928 / 2-3-5 / 1933 added with sources');}

// 3. The loom: the classic numbering of the 2-3-5, counted from the back and right to left in each line.
{assert.deepEqual(D.SPOTS.map(s=>s.n),[1,2,3,4,5,6,7,8,9,10,11]);
 const lines={goal:[1],backs:[2,3],halves:[4,5,6],forwards:[7,8,9,10,11]};
 for(const [line,ns] of Object.entries(lines)){const ss=ns.map(D.spotOf);ss.forEach(s=>assert.equal(s.line,line));for(let i=1;i<ss.length;i++)assert.ok(ss[i].x<ss[i-1].x,`${line}: right to left`);}
 const ys=l=>lines[l].map(n=>D.spotOf(n).y);assert.ok(Math.min(...ys('goal'))>Math.max(...ys('backs'))&&Math.min(...ys('backs'))>Math.max(...ys('halves'))&&Math.min(...ys('halves'))>Math.max(...ys('forwards')),'lines go from back to front');
 for(const a of D.SPOTS)for(const b of D.SPOTS)if(a!==b)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=14.5,'spots far enough apart for 44px targets on a 202px pitch');
 for(const s of D.SPOTS)assert.equal(D.nearestSpot(s.x+2,s.y-2).n,s.n);assert.equal(D.nearestSpot(34,5),null);
 assert.match(D.hintFor(9,D.spotOf(2)),/further forward/);assert.match(D.hintFor(2,D.spotOf(9)),/further back/);assert.match(D.hintFor(2,D.spotOf(3)),/more to the right/);
 console.log('PASS loom: 1–11 on the 2-3-5, back to front and right to left, nudging hints');}

// 4. Colours: the three Law 4 checks.
{assert.ok(D.lawChecks(D.DEFAULT_KITS).every(c=>c.ok),'default kits pass');
 const ck=k=>Object.fromEntries(D.lawChecks({...D.DEFAULT_KITS,...k}).map(c=>[c.id,c.ok]));
 assert.equal(ck({away:'orange'}).teams,false,'red v orange clash');assert.equal(ck({away:'red'}).teams,false,'same colour clashes');
 assert.equal(ck({home:'navy'}).referee,false,'navy v a black referee clash');assert.equal(ck({homeGk:'white'}).keepers,false,'keeper in the other team colour');
 assert.equal(ck({homeGk:'yellow'}).keepers,false,'two keepers alike');assert.ok(D.clash('yellow','amber')&&D.clash('navy','royal')&&!D.clash('red','white'));
 assert.match(exp,/colourGap\(kits\.home,kits\.away\)/,'the colour-gap meter uses the same maths as the checks');
 console.log('PASS colours: teams, referee and keepers checks');}

// 5. The scan drill: always exactly one free team-mate, the others marked.
{let seed=7;const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<300;i++){const s=D.scanScene(rng);assert.ok(D.sceneValid(s),'scene '+i);assert.equal(s.players.filter(p=>p.free).length,1);}
 console.log('PASS scan: 300 scenes, one free team-mate each');}

// 6. Heat: no animation loop, no polling, timers cleared, CSS animations finite, reduced motion honoured.
{const spring=read(`${dir}/spring.ts`),kit=read(`${dir}/KitThroughTime.tsx`),dcss=read(`${dir}/decades.module.css`);
 // the only rAF is spring.ts's sleepy loop: it stops itself when nothing moves, when the tab is hidden, and on stop()
 for(const f of fs.readdirSync(path.join(root,dir)))if(f!=='spring.ts')assert.doesNotMatch(read(`${dir}/${f}`),/requestAnimationFrame/,`${f}: no rAF of its own (only the sleepy loop)`);
 assert.match(spring,/if\(tick\(dt\)\)raf=requestAnimationFrame\(frame\)/,'the loop only re-arms while tick says something still moves');
 assert.match(spring,/document\.hidden\)return;/,'the loop sleeps in a hidden tab');assert.match(spring,/cancelAnimationFrame/);
 assert.match(kit,/sleepyLoop\(tick\)/);assert.match(kit,/return\(\)=>\{loop\.current\?\.stop\(\);/,'the loop stops on unmount');assert.match(kit,/return moving;/,'tick reports when everything has settled');
 assert.match(kit,/visibilitychange/,'the loop resumes only when the tab is visible again');
 assert.match(kit,/rm\.current=prefersReduced\(\)/,'reduced motion: springs jump to their end, no loop');
 assert.doesNotMatch(all,/setInterval|new AudioContext|<video|<audio/,'no polling, no own audio graph');
 assert.doesNotMatch(dcss,/infinite/,'every decades CSS animation ends by itself');assert.match(dcss,/prefers-reduced-motion:reduce/);
 assert.match(dcss,/touch-action:none/,'drag surfaces own their gestures');
 assert.match(exp,/timers\.current\.forEach\(clearTimeout\)/,'pending timers cleared on unmount');
 assert.match(exp,/removeEventListener\('keydown'/);
 assert.doesNotMatch(css,/infinite/,'every CSS animation ends by itself');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(exp,/const reduced=\(\)=>/,'JS motion (FLIP flights, view transition) checks reduced motion');
 assert.match(exp,/if\(reduced\(\)\)return;/,'no flight under reduced motion');
 assert.doesNotMatch(all,/startViewTransition/,'beats switch with FLIP, not View Transitions');assert.match(exp,/data-tab-ink/,'FLIP tab ink');assert.match(exp,/inkFrom\.current=reduced\(\)\?null/,'no FLIP under reduced motion');
 assert.doesNotMatch(exp,/iterations:\s*Infinity/,'Web Animations are one-shot');
 for(const c of [css,read(`${dir}/decades.module.css`)])assert.doesNotMatch(c,/::view-transition|:root\b/,'no global view-transition rules');assert.match(css,/env\(safe-area-inset-top\)/);
 for(const cssText of [css,read(`${dir}/decades.module.css`)]){let c=cssText.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\s*\{(?:[^{}]*\{[^}]*\})*\s*\}/g,'');
  for(const m of c.matchAll(/([^{}]+)\{/g)){const sel=m[1].trim();if(!sel||sel.startsWith('@'))continue;for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,`CSS selector "${part.trim()}" has a local class`);}}
 assert.doesNotMatch(all,/https?:\/\/(?!en\.wikipedia\.org|www\.theifab\.com|www\.arsenal\.com|www\.compoundchem\.com|historicalkits\.co\.uk)[^'"\s]+/,'no external requests besides cited links');
 console.log('PASS heat: event-driven drag, one sleepy loop that stops when settled, finite animations, timers cleared');}

// 7. Beat 1, "Decades": the paper-doll kit builder. Every part has a sourced arrival year; too-early parts fall off; the rain
//    test uses only the cited 7% / 0.4% figures; the collage font is self-hosted with its licence.
{const E=require(`../${dir}/eras.ts`),kit=read(`${dir}/KitThroughTime.tsx`),dcss=read(`${dir}/decades.module.css`);
 assert.match(exp,/mode==='decades'\?<Decades/,'Decades is a beat');assert.match(exp,/useState<Mode>\('decades'\)/,'and it comes first');
 const arr=Object.fromEntries(E.PARTS.map(p=>[p.id,p.arrives]));assert.deepEqual(arr,{number:1928,vneck:1950,synthetic:1953,sponsor:1973,name:1993});
 assert.equal(E.tooEarly('number',1927),1928);assert.equal(E.tooEarly('number',1928),null);assert.equal(E.tooEarly('name',1992),1993);assert.equal(E.tooEarly('name',2026),null);
 assert.deepEqual(E.fallsOff(new Set(['number','name','sponsor']),1950),['sponsor','name']);assert.deepEqual(E.fallsOff(new Set(['number']),1880),['number']);
 const ys=E.MILESTONES.map(m=>m.year);assert.deepEqual(ys,[...ys].sort((a,b)=>a-b),'milestones in order');assert.equal(ys[0],E.YEAR_MIN);assert.equal(ys.at(-1),E.YEAR_MAX);
 for(const m of E.MILESTONES)assert.ok(E.DECADE_SOURCES[m.src],`milestone ${m.year} names a source`);
 const txt=E.MILESTONES.map(m=>m.text).join(' ');
 for(const f of ['25 August 1928','1939–40','1953 FA Cup final','1954 World Cup','Eintracht Braunschweig','Kettering Town','1976','1993–94 Premier League','polyester mesh','thick cotton'])assert.ok(txt.includes(f),'milestone fact: '+f);
 assert.match(E.partOf('sponsor').why,/1973 Eintracht Braunschweig.*Kettering Town were first, in 1976/);
 assert.deepEqual({...E.WATER_PER_100G},{cotton:7,polyester:.4},'only the cited figures (Compound Interest)');assert.equal(E.waterHeld('cotton',.5),3.5);assert.equal(E.waterHeld('polyester',2),.4);
 assert.equal(E.flickTarget(1990,0).year,1993);assert.equal(E.flickTarget(1880,-500).year,1880);assert.equal(E.flickTarget(1900,400).year,1993,'a flick carries the year forward (1900 + 88 lands on 1993)');assert.equal(E.flickTarget(1900,0).year,1880);
 const urls=E.DECADE_SOURCES.map(s=>s.url);for(const u of ['https://en.wikipedia.org/wiki/Kit_(association_football)','https://www.compoundchem.com/2022/12/15/football-shirt-2022/','https://historicalkits.co.uk/Articles/History/part-8.html','https://en.wikipedia.org/wiki/Squad_number_(association_football)'])assert.ok(urls.includes(u),'cites '+u);
 assert.match(kit,/DECADE_SOURCES\.map/,'sources listed in the beat');assert.match(kit,/made up for the museum/,'the doll and sponsor are labelled as made up');
 // interaction contract: drag or press a part, keyboard slider for the year, live region, a takeaway once built
 assert.match(kit,/role="slider"/);for(const k of ['ArrowRight','ArrowLeft','Home','End'])assert.ok(kit.includes(`'${k}'`),'slider key '+k);
 assert.match(kit,/aria-live="polite">\{say\}/);assert.match(kit,/Every part has a birthday/);assert.match(kit,/Try it! Drag the Number/);
 assert.match(kit,/Too early! Arrived in/);assert.match(kit,/onKeyDown=\{e=>\{if\(\(e\.key===' '\|\|e\.key==='Enter'\)/,'rain test works from the keyboard');
 assert.match(kit,/className=\{styles\.fx\}/,'falling paper lives in a fixed clipped layer');assert.match(dcss,/\.fx\{position:fixed;inset:0;z-index:44;overflow:hidden/);
 // the collage face: self-hosted Abril Fatface with its OFL licence and a fallback stack
 assert.match(dcss,/@font-face\{font-family:'Kit Room Abril';src:url\('\/museum\/experiences\/shirts\/abril-fatface-latin\.woff2'\)/);assert.match(dcss,/'Kit Room Abril',Didot,'Bodoni 72'/);
 const pub=path.join(root,'public/museum/experiences/shirts');assert.ok(fs.statSync(path.join(pub,'abril-fatface-latin.woff2')).size<40000,'small font file');
 assert.match(fs.readFileSync(path.join(pub,'OFL-AbrilFatface.txt'),'utf8'),/SIL Open Font License/);
 for(const m of dcss.matchAll(/min-height:(\d+)px/g))assert.ok(+m[1]>=44,'targets at least 44px: '+m[0]);
 console.log('PASS decades: sourced arrival years, fall-off rule, cited rain figures, self-hosted collage font');}

// 8. Story pass (Oct 9 2026): the Kit Room ends. Beat 4 "Full time" is a three-question kit quiz (one question from each beat,
//    a why after every answer) and a magazine-cover payoff; the scan test leads into it. The rain test says "into the fibres"
//    (Compound Interest's 7% / 0.4% is what the fibres absorb), never "soaked through".
{const ft=read(`${dir}/FullTime.tsx`),kit=read(`${dir}/KitThroughTime.tsx`);
 assert.match(exp,/type Mode='decades'\|'numbers'\|'colours'\|'fulltime'/);assert.match(exp,/\{id:'fulltime',label:'Full time'\}/);
 assert.match(exp,/mode==='fulltime'\?<FullTime key="fulltime" forYourGame=\{exhibit\.forYourGame\}/);assert.match(exp,/Full time: kit quiz →/,'the scan test leads to the ending');
 assert.equal((ft.match(/\{beat:'/g)||[]).length,3,'three questions');for(const b of ['Numbers','Decades','Colours'])assert.ok(ft.includes(`beat:'${b}'`),'a question from '+b);
 assert.match(ft,/right:0,/);assert.match(ft,/right:1,/);assert.match(ft,/right:2,/,'right answers move about');
 assert.match(ft,/Numbers came in 1928, sponsors in 1973 and names in the Premier League in 1993/);assert.match(ft,/Law 4/);
 assert.match(ft,/className=\{styles\.cover\}/,'the payoff cover');assert.doesNotMatch(ft,/setTimeout|setInterval|requestAnimationFrame/);
 assert.match(css,/\.finale,\.quizCard,\.quizOpt,\.quizWhy,\.cover,\.cover>\*,\.coverLines li\{animation:none\}/,'reduced motion: the cover is simply there');
 assert.doesNotMatch(kit,/Soaked through/);assert.match(kit,/Cotton fibres drink in about/);
 console.log('PASS full time: kit quiz from all three beats, magazine-cover payoff, rain figures worded as fibre absorption');}
