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
{assert.doesNotMatch(all,/requestAnimationFrame|setInterval|new AudioContext|<video|<audio/,'no loop, no polling, no own audio graph');
 assert.match(exp,/timers\.current\.forEach\(clearTimeout\)/,'pending timers cleared on unmount');
 assert.match(exp,/removeEventListener\('keydown'/);
 assert.doesNotMatch(css,/infinite/,'every CSS animation ends by itself');
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(exp,/const reduced=\(\)=>/,'JS motion (FLIP flights, view transition) checks reduced motion');
 assert.match(exp,/if\(reduced\(\)\)return;/,'no flight under reduced motion');assert.match(exp,/startViewTransition&&!reduced\(\)/,'no view transition under reduced motion');
 assert.doesNotMatch(exp,/iterations:\s*Infinity/,'Web Animations are one-shot');
 assert.doesNotMatch(css,/::view-transition|:root\b/,'no global view-transition rules');assert.match(css,/env\(safe-area-inset-top\)/);
 {let c=css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\s*\{(?:[^{}]*\{[^}]*\})*\s*\}/g,'');
  for(const m of c.matchAll(/([^{}]+)\{/g)){const sel=m[1].trim();if(!sel||sel.startsWith('@'))continue;for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,`CSS selector "${part.trim()}" has a local class`);}}
 assert.doesNotMatch(all,/https?:\/\/(?!en\.wikipedia\.org|www\.theifab\.com|www\.arsenal\.com)[^'"\s]+/,'no external requests besides cited links');
 console.log('PASS heat: event-driven drag, no loops, finite animations, timers cleared');}
