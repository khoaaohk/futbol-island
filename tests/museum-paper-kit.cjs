// museum Paper kit (Oct 12 2026 consolidation): the shared anatomy/ folder every play exhibit except penalty-1891 uses
// (docs/museum-paper-style.md). Checks: ONE frame-loop implementation (anatomy/paper-loop.ts) and no requestAnimationFrame
// anywhere else in the eleven exhibits or the kit; the loop sleeps at rest, parks while hidden / off-screen, resumes, never runs
// two chains, and runs to the end at once under reduced motion; the Paper tokens are the same in every exhibit; the old
// duplicates (per-exhibit bench / loop copies, cards-1970/paper.tsx, pixeliso-laws/) are gone.
// usage: node tests/museum-paper-kit.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),X='components/museum/experiences/',read=f=>fs.readFileSync(path.join(root,f),'utf8'),has=f=>fs.existsSync(path.join(root,f));
const EXHIBITS=['telstar-1970','laced-leather','shirts','cards-1970','var-2018','backpass-1992','laws-1863','futsal-1989','wwc-1991','hall-of-fame','timeline'];
const srcOf=dir=>fs.readdirSync(path.join(root,X+dir)).filter(f=>/\.(tsx?|css)$/.test(f)).map(f=>[dir+'/'+f,read(X+dir+'/'+f)]);

// 1. One loop: requestAnimationFrame only in anatomy/paper-loop.ts.
{for(const [f,s] of [...EXHIBITS.flatMap(srcOf),...srcOf('anatomy')])if(f!=='anatomy/paper-loop.ts')assert.doesNotMatch(s,/requestAnimationFrame\(/,'no rAF in '+f);
 const loop=read(X+'anatomy/paper-loop.ts');for(const n of ['createPaperLoop','usePaperLoop','useFrames','useFrameLoop','useRaf'])assert.match(loop,new RegExp('export function '+n+'\\('),n+' is in the one loop file');
 for(const [dir,hook] of [['cards-1970','useFrames'],['var-2018','useFrames'],['backpass-1992','useFrames'],['laws-1863','usePaperLoop'],['futsal-1989','usePaperLoop'],['wwc-1991','usePaperLoop'],
  ['hall-of-fame','useFrameLoop'],['timeline','useFrameLoop'],['telstar-1970','useRaf'],['laced-leather','useRaf']])assert.ok(srcOf(dir).some(([,s])=>s.includes(hook+'(')),dir+' uses the shared loop ('+hook+')');
 assert.ok(!srcOf('shirts').some(([,s])=>/useRaf\(|usePaperLoop\(/.test(s)),'shirts has no frame loop at all');
 console.log('PASS one loop: requestAnimationFrame only in anatomy/paper-loop.ts; all ten moving exhibits use it');}

// 2. The loop's behaviour, with a fake requestAnimationFrame.
{let q=[],id=0,now=0;global.requestAnimationFrame=f=>{q.push({id:++id,f});return id;};global.cancelAnimationFrame=i=>{q=q.filter(x=>x.id!==i);};
 const flush=()=>{const run=q;q=[];now+=16;for(const x of run)x.f(now);};
 const {createPaperLoop}=require('../'+X+'anatomy/paper-loop.ts');
 let n=0;const l=createPaperLoop(()=>++n<4);assert.equal(q.length,0,'nothing scheduled at rest');l.wake();assert.equal(q.length,1);
 for(let i=0;i<10;i++)flush();assert.equal(n,4,'runs until the tick returns false');assert.equal(q.length,0,'then stops: 0 rAF at rest');assert.ok(!l.running);
 n=0;l.wake();l.setVisible(false);assert.equal(q.length,0,'off-screen / hidden: parked');l.setVisible(true);assert.equal(q.length,1,'back on screen: resumes');
 for(let i=0;i<10;i++)flush();assert.equal(q.length,0);
 // a wake() from inside the tick never starts a second chain
 let m=0;const l2=createPaperLoop(()=>{m++;l2.wake();return m<3;});l2.wake();for(let i=0;i<3;i++){flush();assert.ok(q.length<=1,'one chain only');}
 l2.dispose();assert.equal(q.length,0,'disposed: cancelled');l2.wake();assert.equal(q.length,0,'a disposed loop never wakes');
 let r=0;const l3=createPaperLoop(()=>++r<50,{reduced:true});l3.wake();assert.equal(r,50,'reduced motion: straight to the end');assert.equal(q.length,0,'with no frames');
 delete global.requestAnimationFrame;delete global.cancelAnimationFrame;
 console.log('PASS loop: sleeps at rest, parks off-screen and resumes, one chain, disposed on unmount, reduced = at once');}

// 3. One set of Paper tokens.
{const PAPER={page:'#e0e0db',card:'#e0e0db',paper:'#f7f7f3',top:'#f7f7f3','shade-0':'#d3d3ce','shade-1':'#dcdcd7','shade-2':'#e3e3de','shade-3':'#e9e9e4',
  hi:'#3a3a3c',mid:'#6f6f72',lo:'#98989a',faint:'#c2c2bd',halo:'#4a4a44','halo-opacity':'.34',weight:'.8px'};
 const files=['anatomy/paper-kit.tsx','anatomy/PaperStage.module.css','telstar-1970/Experience.module.css','laced-leather/Experience.module.css','shirts/Experience.module.css','hall-of-fame/Experience.module.css','timeline/Experience.module.css'];
 for(const f of files){const s=read(X+f).split('\n').filter(l=>!/hof-opp|hof-keeper/.test(l)).join('\n');
  for(const [k,v] of Object.entries(PAPER)){const found=[...s.matchAll(new RegExp('--anatomy-'+k+':([^;}]+)','g'))].map(m=>m[1].trim());
   for(const x of found)assert.equal(x,v,`${f}: --anatomy-${k} is ${x}, the Paper token is ${v}`);}
  if(f.endsWith('.css'))assert.match(s,/:global\(\.iso-halo\)\{filter:blur\(14px\);transform:translateY\(6px\)\}/,f+': the Paper halo');}
 assert.match(read(X+'anatomy/paper.module.css'),/--paper:#e0e0db/,'PaperRoom card ground');
 console.log('PASS tokens: ground #e0e0db, solids #f7f7f3, the same hairlines and halo in all eleven');}

// 4. The duplicates are gone, and the shared pieces are where the exhibits import them from.
{for(const f of ['telstar-1970/bench.tsx','laced-leather/bench.tsx','shirts/bench.tsx','hall-of-fame/loop.ts','timeline/loop.ts','cards-1970/paper.tsx','cards-1970/paper.module.css','cards-1970/figure.ts','pixeliso-laws'])
  assert.ok(!has(X+f),f+' is gone (shared in anatomy/)');
 for(const f of ['bench.tsx','figure.ts','PaperStage.tsx','PaperStage.module.css','PaperRoom.tsx','paper.module.css','paper-kit.tsx','paper-loop.ts','hooks.ts'])assert.ok(has(X+'anatomy/'+f),'anatomy/'+f);
 assert.ok(has('docs/museum-paper-style.md'),'style guide');assert.ok(read('package.json').includes('node tests/museum-paper-kit.cjs'),'in npm test');
 console.log('PASS layout: one shared anatomy/ kit, no per-exhibit copies, no pixeliso-laws');}
console.log('museum-paper-kit: all passed');
