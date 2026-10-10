// futsal-1989 · a cordel folheto (Oct 9 2026; was "Count the touches", Oct 5). Five pamphlet beats in a Brazilian woodcut
// (xilogravura) style: the 1930 cover, the drop test you do by hand, the touches match, spinning the 1-2-1 diamond, and 1989.
// Checks: the case facts are shown (Ceriani/Montevideo 1930, the low-bounce ball, Brazil 1989), the new facts are cited, Back is
// the shared ExperienceBack, every loop sleeps at rest and stops, the drop-test physics match the Laws' bounce bands, the spin
// lands every player on every spot, and the match model gives more touches per minute on the court than on the grass pitch.
// usage: node tests/museum-exp-futsal-1989.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/futsal-1989/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),S=require('../'+dir+'sim.ts'),SP=require('../'+dir+'spring.ts');
const exp=read(dir+'Experience.tsx'),match=read(dir+'Match.tsx'),lab=read(dir+'BounceLab.tsx'),spin=read(dir+'Rotation.tsx'),wood=read(dir+'woodcut.tsx'),draw=read(dir+'draw.ts'),spring=read(dir+'spring.ts'),cssText=read(dir+'futsal.module.css');
const all=[exp,match,lab,spin,wood,draw,spring].join('\n');

// 1. The case's own facts, in the order the experience destructures them, and the new facts with their sources.
{const e=X.EXHIBITS.find(x=>x.id==='futsal-1989');assert.ok(e);
 assert.match(exp,/const \[ceriani,brazil,ball\]=exhibit\.facts;/);
 assert.match(e.facts[0],/Montevideo, Uruguay, in 1930.*Juan Carlos Ceriani/);assert.match(e.facts[1],/Netherlands in 1989, and Brazil won it/);assert.match(e.facts[2],/low-bounce ball/);
 for(const v of ['{ceriani}','{brazil}','{ball}','{exhibit.forYourGame}'])assert.ok(exp.includes(v),v+' is shown');
 for(const s of ['Brazil beat the hosts, the Netherlands, 2–1','Rotterdam','16 teams','between 50 and 65 cm','62–64 cm around','400–440 g','120–165 cm','38–42 m long and 20–25 m wide','100–110 m long and 64–75 m wide','basketball, handball and water polo','defender (fixo), two wingers (alas) and a forward (pivô)','switch positions at any time'])
  assert.ok(exp.includes(s),'new fact shown: '+s);
 for(const u of ['https://www.fifa.com/en/articles/brazil-netherlands-first-final-1989','https://inside.fifa.com/innovation/standards/footballs/fifa-quality-programme-for-footballs','https://www.theifab.com/laws/latest/the-field-of-play/'])assert.ok(exp.includes(u),'cited: '+u);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.NEW_SOURCES\]/,'the case sources are listed too');
 assert.ok(e.sources.some(s=>/Futsal-Laws-of-the-Game/.test(s.url)),'futsal Law 2 (ball) is a case source');
 assert.ok(e.sources.some(s=>/wiki\/Futsal$/.test(s.url)),'Wikipedia "Futsal" (positions) is a case source');
 assert.match(match,/game model, not a measurement of real matches/,'the match is labelled as a model');
 assert.match(exp,/Literatura_de_cordel/,'the style is credited');
 console.log('PASS facts: case facts shown, new facts cited, the model and the style credited');}

// 2. Contract: root, Back, buttons, the beats.
{assert.match(exp,/data-museum-experience="futsal-1989"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack';/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(all),'no local NavigationButton Back');assert.ok(!/immediate/.test(all.replace(/\/\*[\s\S]*?\*\//g,'')),'never `immediate`');
 assert.ok(!/startViewTransition/.test(all),'no View Transitions (FLIP / one-shot WAAPI instead)');assert.ok(!/::view-transition/.test(cssText),'no global view-transition rules');
 assert.match(cssText,/\.root\{[\s\S]*?position:fixed;inset:0;z-index:20/);assert.match(cssText,/min-height:48px;min-width:44px/);assert.match(cssText,/\.btn:active,\.ghost:active\{transform:scale\(\.92\)/,'buttons shrink on press');
 assert.match(cssText,/prefers-reduced-motion/);assert.match(cssText,/safe-area-inset-bottom/);
 assert.match(exp,/e\.key!=='Escape'/);
 assert.equal((exp.match(/\{key:'\w+',tab:/g)||[]).length,5,'five pamphlet beats');
 assert.match(exp,/role="tablist"/);assert.match(exp,/aria-selected=\{beat===i\}/);
 {const bare=cssText.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes\s+\w+\{(?:[^{}]*\{[^}]*\})*\s*\}/g,'').replace(/@font-face\{[^}]*\}/g,'');
  for(const m of bare.matchAll(/([^{};]+)\{/g)){const sel=m[1].trim();if(sel.startsWith('@'))continue;for(const part of sel.split(','))assert.match(part,/\.[a-zA-Z]/,'every CSS-module selector has a local class: '+part);}}
 // the self-hosted slab font and its licence
 assert.match(cssText,/@font-face\{font-family:"Futsal Cordel Slab";src:url\('\/museum\/experiences\/futsal-1989\/alfa-slab-one-latin\.woff2'\)/);
 for(const f of ['alfa-slab-one-latin.woff2','OFL-AlfaSlabOne.txt'])assert.ok(fs.existsSync(path.join(root,'public/museum/experiences/futsal-1989',f)),f+' is in public/');
 assert.ok(!/https?:\/\/fonts\./.test(all+cssText),'no font CDN');
 console.log('PASS contract: fixed dialog root, shared ExperienceBack, five beats, no View Transitions, local font');}

// 3. Heat: loops only while something moves; the match loop stops on end/notes/hidden/unmount; DPR capped on touch.
{assert.match(match,/coarse\?1\.5:2/);assert.match(match,/if\(pausedRef\.current\|\|document\.hidden\)return;/);assert.match(match,/if\(!playing\(p\)\)return;/);
 assert.match(match,/visibilitychange/);assert.match(match,/return\(\)=>\{ro\.disconnect\(\);document\.removeEventListener\('visibilitychange',vis\);stopLoop\(\);/);
 assert.match(match,/if\(s\.t>=ROUND\)\{endRound\(\);return;\}/);assert.match(match,/if\(paused\)stopLoop\(\);/);
 assert.ok(!/setInterval/.test(all),'no polling');
 assert.match(all,/isSoundEnabled\(\)/,'sound respects mute');
 // the labs use the sleepy loop: it stops itself the first frame nothing moves, on hidden tabs, and on unmount
 assert.match(spring,/if\(tick\(dt\)\)raf=requestAnimationFrame\(frame\)/);assert.match(spring,/document\.hidden\)return;/);
 for(const [n,src] of [['BounceLab',lab],['Rotation',spin]]){assert.match(src,/sleepyLoop\(tick\)/,n+' uses the sleepy loop');assert.match(src,/loop\.current\?\.stop\(\)/,n+' stops it on unmount');
  assert.match(src,/prefersReduced\(\)/,n+' has a reduced-motion path');assert.ok(!/requestAnimationFrame\(/.test(src.replace(/requestAnimationFrame\(\(\)=>take/g,'')),n+' has no loop of its own');}
 // a loop that is told nothing moves stops after one frame
 {let calls=0,cb=null;global.requestAnimationFrame=f=>{calls++;cb=f;return calls;};global.cancelAnimationFrame=()=>{};global.performance=global.performance||{now:()=>0};
  const L=SP.sleepyLoop(()=>false);L.kick();assert.equal(calls,1);cb(16);assert.equal(calls,1,'no second frame at rest');assert.equal(L.running(),false);
  let n=0;const M=SP.sleepyLoop(()=>++n<5);M.kick();while(M.running())cb(16*n);assert.equal(n,5,'runs exactly until settled');}
 assert.ok(!/@keyframes[^{]*\{[^}]*infinite/.test(cssText)&&!/infinite/.test(cssText),'no infinite CSS animation at rest');
 console.log('PASS heat: sleepy loops in the labs, match loop stops on round end, notes, hidden tab and unmount; DPR ≤ 1.5 on touch');}

// 4. The drop test obeys the Laws: a 2 m drop rebounds inside each ball's band.
{const fut=Math.sqrt(57.5/200),gr=Math.sqrt(142.5/200);assert.match(lab,/e:Math\.sqrt\(57\.5\/200\)/);assert.match(lab,/e:Math\.sqrt\(142\.5\/200\)/);
 assert.match(lab,/lo:50,hi:65/);assert.match(lab,/lo:120,hi:165/);assert.match(lab,/GRAV=981/);
 // integrate a 2 m drop exactly as the lab does (4 sub-steps a frame at 60 Hz) and read the first rebound's peak
 const peak=e=>{let h=200,v=0,b=0,top=0;for(let f=0;f<600;f++){const n=4,dt=1/60/n;for(let i=0;i<n;i++){v-=981*dt;h+=v*dt;if(b>=1){top=Math.max(top,h);if(v<0)return top;}if(h<=0&&v<0){h=0;v=-v*e;b++;}}}return top;};
 const pf=peak(fut),pg=peak(gr);assert.ok(pf>=50&&pf<=65,`futsal rebound ${pf.toFixed(1)} cm in 50–65`);assert.ok(pg>=120&&pg<=165,`grass rebound ${pg.toFixed(1)} cm in 120–165`);
 assert.ok(SP.rubber(260,0,200,.5,22)<222&&SP.rubber(260,0,200,.5,22)>200,'drag past 2 m rubber-bands');assert.equal(SP.rubber(120,0,200),120);
 assert.match(lab,/role="slider"/);assert.match(lab,/ArrowUp/);assert.match(lab,/Drop both from 2 m/);assert.match(lab,/aria-live="polite"/);
 console.log(`PASS drop test: 2 m drop → futsal ${pf.toFixed(0)} cm, grass ${pg.toFixed(0)} cm (inside the Law bands), rubber-band past 2 m, keyboard + live result`);}

// 5. The spin: four quarter-turn positions; after three turns every outfield player has been fixo, ala and pivô.
{assert.match(spin,/const SPOT_AT=/);assert.match(spin,/'fixo'/);assert.match(spin,/'pivô'/);
 const at=k=>['fixo','ala','pivô','ala'][((k%4)+4)%4];
 for(const dir of [1,-1]){const played=[0,1,2,3].map(i=>new Set([at(i)]));for(let t=1;t<=3;t++)played.forEach((s,i)=>s.add(at(i+dir*t)));assert.ok(played.every(s=>s.size===3),'three turns either way covers every spot');}
 assert.match(spin,/role="slider"/);assert.match(spin,/ArrowRight/);assert.match(spin,/Turn one spot clockwise/);assert.match(spin,/velocityTracker/);assert.match(spin,/s\.to=k\*Q;s\.v=w/,'release keeps the spin, then a spring lands it');
 console.log('PASS spin: quarter turns land every player on every spot; drag with momentum, buttons and arrow keys');}

// 6. The lesson holds in the model: an idle visitor (autopilot plays your spot) gets far more touches on the court.
{let court=0,pitch=0;const N=12;for(let seed=1;seed<=N;seed++){court+=S.idleRate('court',seed);pitch+=S.idleRate('pitch',seed);}court/=N;pitch/=N;
 assert.ok(court>pitch*2,`court ${court.toFixed(1)}/min vs pitch ${pitch.toFixed(1)}/min`);
 assert.deepEqual([S.FIELDS.court.L,S.FIELDS.court.W,S.FIELDS.court.perSide],[40,20,5]);assert.deepEqual([S.FIELDS.pitch.L,S.FIELDS.pitch.W,S.FIELDS.pitch.perSide],[105,68,11]);
 assert.equal(S.FIELDS.court.shape.length,5);assert.equal(S.FIELDS.pitch.shape.length,11);
 console.log(`PASS model: idle visitor ${court.toFixed(1)} touches/min on the court vs ${pitch.toFixed(1)} on grass`);}

// 7. Quick check (Oct 9 2026): the last pamphlet ends on four questions about the WHY of each lab, then a pressed FIM stamp.
{const quiz=read(dir+'Quiz.tsx');assert.match(exp,/<Quiz onDone=\{markFinal\}\/>/,'the quiz is on the final beat');
 const qs=[...quiz.matchAll(/\{q:'([^']+)',options:\[([^\]]+)\],answer:(\d)/g)];assert.equal(qs.length,4,'four questions');
 for(const [,q,opts,a] of qs){const n=opts.split("','").length;assert.ok(+a<n,'answer index in range: '+q);}
 assert.match(quiz,/Brazil beat the hosts, the Netherlands, 2–1/);assert.match(quiz,/FIM/);assert.match(quiz,/hint:/,'a wrong answer gets a hint');
 assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(quiz),'the quiz never loops (WAAPI one-shots only)');assert.match(quiz,/prefersReduced\(\)/,'reduced motion: no movement');
 console.log('PASS quick check: four WHY questions with hints, FIM payoff, no loop, reduced motion respected');}
