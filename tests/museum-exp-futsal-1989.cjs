// futsal-1989 "Count the touches" (Oct 5 2026): the case facts are shown (Ceriani/Montevideo 1930, the low-bounce ball, Brazil
// 1989), the new facts are cited, Back is the shared ExperienceBack (no local NavigationButton Back), the loop sleeps/stops/disposes, and
// the match model really gives more touches per minute on the futsal court than on the grass pitch.
// usage: node tests/museum-exp-futsal-1989.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/futsal-1989/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),S=require('../'+dir+'sim.ts');
const exp=read(dir+'Experience.tsx'),drop=read(dir+'DropTest.tsx'),draw=read(dir+'draw.ts'),cssText=read(dir+'futsal.module.css');

// 1. The case's own facts, in the order the experience destructures them, and the new facts with their sources.
{const e=X.EXHIBITS.find(x=>x.id==='futsal-1989');assert.ok(e);
 assert.match(exp,/const \[ceriani,brazil,ball\]=exhibit\.facts;/);
 assert.match(e.facts[0],/Montevideo, Uruguay, in 1930.*Juan Carlos Ceriani/);assert.match(e.facts[1],/Netherlands in 1989, and Brazil won it/);assert.match(e.facts[2],/low-bounce ball/);
 for(const v of ['{ceriani}','{brazil}','{ball}','{exhibit.forYourGame}'])assert.ok(exp.includes(v),v+' is shown');
 for(const s of ['Brazil beat the Netherlands 2–1','Rotterdam','16 teams','between 50 and 65 cm','62–64 cm around','400–440 g','120–165 cm','38–42 m long and 20–25 m wide','100–110 m long and 64–75 m wide','basketball, handball and water polo'])
  assert.ok(exp.includes(s),'new fact shown: '+s);
 for(const u of ['https://www.fifa.com/en/articles/brazil-netherlands-first-final-1989','https://inside.fifa.com/innovation/standards/footballs/fifa-quality-programme-for-footballs','https://www.theifab.com/laws/latest/the-field-of-play/'])assert.ok(exp.includes(u),'cited: '+u);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.NEW_SOURCES\]/,'the case sources are listed too');
 assert.ok(e.sources.some(s=>/Futsal-Laws-of-the-Game/.test(s.url)),'futsal Law 2 (ball) is a case source');
 assert.match(exp,/game model, not a measurement of real matches/,'the match is labelled as a model');
 assert.match(drop,/lo=\{?50|50,65/);assert.match(drop,/120,165/);
 console.log('PASS facts: case facts shown, new facts cited, the model labelled');}

// 2. Contract: root, Back, buttons.
{assert.match(exp,/data-museum-experience="futsal-1989"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack';/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(exp+drop),'no local NavigationButton Back');assert.ok(!/immediate/.test(exp.replace(/\/\*[\s\S]*?\*\//g,'')),'never `immediate`');
 assert.match(cssText,/\.root\{[\s\S]*?position:fixed;inset:0;z-index:20/);assert.match(cssText,/min-height:48px;min-width:44px/);assert.match(cssText,/:active\{transform:scale\(\.92\)\}/,'buttons shrink on press');
 assert.match(cssText,/prefers-reduced-motion/);assert.match(cssText,/safe-area-inset-bottom/);
 assert.match(exp,/e\.key==='Escape'/);
 {const bare=cssText.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\{(?:[^{}]*\{[^}]*\})*\s*\}/g,'');
  for(const m of bare.matchAll(/([^{};]+)\{/g)){const sel=m[1].trim();if(sel.startsWith('@'))continue;for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,'every CSS-module selector has a local class: '+part);}}
 console.log('PASS contract: fixed dialog root, shared ExperienceBack, 44px+ pressable buttons, Escape');}

// 3. Heat: the loop only runs in a round or the zoom, stops on end/notes/hidden/unmount; DPR capped on touch.
{assert.match(exp,/coarse\?1\.5:2/);assert.match(exp,/if\(notesRef\.current\|\|document\.hidden\)return;/);assert.match(exp,/if\(!playing\(p\)\)return;/);
 assert.match(exp,/visibilitychange/);assert.match(exp,/return\(\)=>\{ro\.disconnect\(\);document\.removeEventListener\('visibilitychange',vis\);stopLoop\(\);bg\.current=null;\}/);
 assert.match(exp,/if\(s\.t>=ROUND\)\{endRound\(\);return;\}/);assert.match(exp,/if\(notes\)stopLoop\(\);/);
 assert.ok(!/setInterval/.test(exp+draw+drop),'no polling');
 assert.match(exp,/isSoundEnabled\(\)/,'sound respects mute');
 console.log('PASS heat: sleeping loop, stops on round end, notes, hidden tab and unmount; DPR ≤ 1.5 on coarse pointers');}

// 4. The lesson holds in the model: an idle visitor (autopilot plays your spot) gets far more touches on the court.
{let court=0,pitch=0;const N=12;for(let seed=1;seed<=N;seed++){court+=S.idleRate('court',seed);pitch+=S.idleRate('pitch',seed);}court/=N;pitch/=N;
 assert.ok(court>pitch*2,`court ${court.toFixed(1)}/min vs pitch ${pitch.toFixed(1)}/min`);
 assert.deepEqual([S.FIELDS.court.L,S.FIELDS.court.W,S.FIELDS.court.perSide],[40,20,5]);assert.deepEqual([S.FIELDS.pitch.L,S.FIELDS.pitch.W,S.FIELDS.pitch.perSide],[105,68,11]);
 assert.equal(S.FIELDS.court.shape.length,5);assert.equal(S.FIELDS.pitch.shape.length,11);
 console.log(`PASS model: idle visitor ${court.toFixed(1)} touches/min on the court vs ${pitch.toFixed(1)} on grass`);}
