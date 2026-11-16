// Reading-page design + engagement pass (Nov 15 2026, branch seo-design).
//  1. Tokens: the reading templates use site.module.css tokens, not one-off values (no inline styles on reading pages, radii from
//     --r-* in the shared sheets, the shared parts defined once).
//  2. Quiz: every rules, terms and positions page renders the end-of-guide quiz; each has 3 questions with distinct options and a
//     valid answer; the view uses real buttons, a labelled group and aria-live feedback; nothing is sent.
//  3. Animated diagrams: the named scenes produce keyframes; reduced motion and print show the still picture; the figure keeps its
//     caption and the SVG its title/desc; the toggle has an accessible name and pauses off screen.
//  4. Deep links: /play?go= accepts only real lessons and shore fishing spots and ignores everything else; every guide lesson
//     button resolves in the game; Town reads it once after boot.
//  5. Sticky "Play free" bar: hidden from 768 px, safe-area aware, pads the page while shown, dismissible for the visit.
// usage: node tests/seo-design.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {load}=(()=>{const ts=require('typescript'),vm=require('node:vm'),cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const mod={exports:{}};cache.set(file,mod);
  const out=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,resolveJsonModule:true,jsx:ts.JsxEmit.React}}).outputText;
  vm.runInNewContext(out,{Math,JSON,Set,Map,Object,Array,Number,String,Symbol,Promise,Error,RegExp,Date,Boolean,Infinity,NaN,isFinite,console,URL,URLSearchParams,Intl,
   process:{env:{NODE_ENV:'production'},cwd:()=>root},exports:mod.exports,module:mod,require:id=>{
   if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
   const base=id.startsWith('@/')?path.join(root,id.slice(2)):path.resolve(path.dirname(file),id);
   for(const f of [base,base+'.ts',base+'.tsx',base+'.json',path.join(base,'index.ts')])if(fs.existsSync(f)&&fs.statSync(f).isFile())return load(f);
   throw new Error('Cannot resolve '+id+' from '+file);}});
  return mod.exports;
 }
 return {load};})();
const L=f=>load(path.join(root,f));
let n=0;const ok=(c,m)=>{assert.ok(c,m);n++;};

// 1. Tokens
const css=read('app/(site)/site.module.css');
for(const t of ['--r-lg','--r-md','--r-sm','--r-pill','--pad-box','--tap','--t-h2','--t-h3','--t-body','--t-cap','--t-label','--s1','--s5'])ok(new RegExp(`${t}:`).test(css),`token ${t} defined`);
for(const c of ['.endNote','.panel','.pager','.pagerWord','.pagerName','.quiz','.quizOption','.anim','.animBtn','.playBar','.tableWrap','.list','.crumbs','.card'])ok(new RegExp(`(^|\\n|\\})${c.replace('.','\\.')}\\{`).test(css),`${c} styled`);
const radii=[...css.replace(/@media print\{[\s\S]*?\n\}/,'').matchAll(/border-radius:(\d+)px/g)].filter(m=>+m[1]>4).map(m=>m[0]);
ok(radii.length===0,`site.module.css radii use --r-* tokens (found ${radii.join(', ')})`);
for(const f of ['components/site/tools/tools.module.css','components/site/games/games.module.css'])ok(!/border-radius:\d+px/.test(read(f)),`${f}: radii from tokens`);
const walk=d=>fs.readdirSync(path.join(root,d),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
const templates=[...walk('app/(site)').filter(f=>f.endsWith('.tsx')&&!f.includes('marketing')&&f!==path.join('app/(site)','page.tsx')),...walk('components/site').filter(f=>f.endsWith('.tsx'))];
const inline=templates.filter(f=>!/SiteNav\.tsx$/.test(f)&&/style=\{\{/.test(read(f)));
ok(inline.length===0,`no inline style one-offs in reading templates: ${inline.join(', ')}`);
ok(/\.lead\[data-answer\]\{color:var\(--ink\)/.test(css),'the answer lead is full ink');
ok(/Coach’s notes: \$\{name\}`\} panel>/.test(read('lib/site/GuideParts.tsx')),"coach's notes use the one panel style");
ok(/pagerWord/.test(read('components/site/ReadNext.tsx'))&&/rel="next"/.test(read('components/site/ReadNext.tsx'))&&/rel="prev"/.test(read('components/site/ReadNext.tsx')),'Read next keeps rel=next/prev and the shared pager style');

// 2. Quiz
const {ruleQuiz,termQuiz,positionQuiz}=L('lib/site/guideQuiz.ts');
const {RULES}=L('lib/site/rules.ts'),{TERM_PAGES}=L('lib/site/terms.ts'),{POSITIONS}=L('lib/site/positions.ts');
const checkQuiz=(qs,who)=>{ok(qs.length===3,`${who}: 3 questions`);for(const q of qs){ok(q.options.length>=2&&new Set(q.options).size===q.options.length,`${who}: distinct options for "${q.q}"`);
 ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<q.options.length,`${who}: valid answer`);ok(q.options.every(o=>o.trim().length>0)&&q.explain.length>0,`${who}: words present`);}};
RULES.forEach(r=>checkQuiz(ruleQuiz(r),`rule ${r.slug}`));
TERM_PAGES.forEach(t=>checkQuiz(termQuiz(t,TERM_PAGES),`term ${t.slug}`));
POSITIONS.forEach(p=>checkQuiz(positionQuiz(p,POSITIONS),`position ${p.slug}`));
const firsts=[...RULES.map(r=>ruleQuiz(r)),...TERM_PAGES.map(t=>termQuiz(t,TERM_PAGES))].flat().map(q=>q.correct);
ok(new Set(firsts).size>1,'the right answer is not always in the same place');
for(const [f,fn] of [['app/(site)/learn/soccer-rules/[slug]/page.tsx','ruleQuiz'],['app/(site)/learn/soccer-terms/[slug]/page.tsx','termQuiz'],['app/(site)/learn/soccer-positions/[slug]/page.tsx','positionQuiz']]){
 const s=read(f);ok(s.includes('<GuideQuiz')&&s.includes(fn+'('),`${f} renders the quiz`);}
const quiz=read('components/site/GuideQuiz.tsx');
ok(/type="button"/.test(quiz)&&/role="group"/.test(quiz)&&/aria-labelledby/.test(quiz),'quiz: real buttons in a labelled group');
ok((quiz.match(/aria-live="polite"/g)||[]).length>=2,'quiz: feedback and score are live regions');
ok(/aria-pressed/.test(quiz)&&/Try again/.test(quiz)&&/\$\{score\}\/\$\{total\}!/.test(quiz),'quiz: pressed state, "3/3!" score and try again');
ok(!/fetch\(|sendBeacon|localStorage|analytics/.test(quiz),'quiz: nothing stored or sent');

// 3. Animated diagrams
const {sceneMotion,ANIMATED_TERMS,ANIMATED_RULES}=L('lib/site/sceneMotion.ts');
for(const slug of ANIMATED_TERMS){const t=TERM_PAGES.find(x=>x.slug===slug);ok(t,`animated term ${slug} exists`);
 const m=sceneMotion(t.scene,'s0-anim');ok(m&&m.tracks.length>=2&&/@keyframes s0-anim-m0\{/.test(m.css),`${slug}: keyframes for at least two movers`);
 ok(m.tracks.every(tr=>!/NaN/.test(JSON.stringify(tr))),`${slug}: finite offsets`);}
for(const slug of ANIMATED_RULES){const r=RULES.find(x=>x.slug===slug);ok(r,`animated rule ${slug} exists`);r.scenes.forEach((s,j)=>ok(sceneMotion(s,`s${j}-anim`),`${slug} scene ${j} moves`));}
ok(/@media\(prefers-reduced-motion:reduce\)\{\.anim svg \*\{animation:none!important\}\.animBtn\{display:none\}\}/.test(css),'reduced motion: still picture, no toggle');
ok(/\.anim\[data-paused\] svg \*,\.anim\[data-away\] svg \*\{animation-play-state:paused/.test(css),'paused and off-screen diagrams stop');
const parts=read('lib/site/GuideParts.tsx'),toggle=read('components/site/MotionToggle.tsx');
ok(/<figcaption className=\{styles\.caption\}>\{scene\.caption\}/.test(parts),'animated scenes keep their figure caption');
ok(/<title id=\{`\$\{id\}-t`\}>/.test(read('lib/site/PitchDiagram.tsx'))&&/<desc id=/.test(read('lib/site/PitchDiagram.tsx')),'the SVG keeps its title and description (alt text)');
ok(/aria-label=\{`\$\{paused\?'Play':'Pause'\} the \$\{name\} animation`\}/.test(toggle)&&/IntersectionObserver/.test(toggle),'toggle: accessible name, pauses off screen');
ok(/animate=\{\(ANIMATED_TERMS/.test(read('app/(site)/learn/soccer-terms/[slug]/page.tsx'))&&/ANIMATED_RULES/.test(read('app/(site)/learn/soccer-rules/[slug]/page.tsx')),'terms and rules pages animate the named scenes');
ok(/rules, terms/.test(read('lib/site/tools/imageSitemap.ts')),'the diagrams\' still PNGs are in the image sitemap');

// 4. Deep links
const {parseGo,lessonFormat,GO_PARAM}=L('lib/play/deepLink.ts');
const {GO_FISHING_SPOTS}=L('lib/town/fishing/fishingReach.ts');
const lessonIds=[...new Set([...TERM_PAGES.map(t=>t.cta?.id),...RULES.map(r=>r.cta?.id),...POSITIONS.map(p=>p.lessons[0]?.id)].filter(Boolean))];
const unknown=lessonIds.filter(id=>!lessonFormat(id));
ok(unknown.length===0,`every guide lesson button opens a lesson the game has: ${unknown.join(', ')}`);
const g=parseGo('lesson:'+lessonIds[0]);ok(g&&g.to==='lesson'&&g.lessonId===lessonIds[0]&&typeof g.format==='string','a real lesson resolves');
const spot=GO_FISHING_SPOTS[0].id;ok(JSON.stringify(parseGo('fish:'+spot))===JSON.stringify({to:'fish',spots:[spot]}),'a shore spot resolves');
ok(JSON.stringify(parseGo('fish'))===JSON.stringify({to:'fish'}),'go=fish alone goes to the nearest spot');
for(const bad of [null,undefined,'','lesson','lesson:','lesson:nope-not-a-lesson','fish:not-a-spot','arcade:kitrush','shop','lesson:../../x','lesson:a b','javascript:alert(1)','lesson:'+lessonIds[0]+'&x=1','fish:'+'a'.repeat(90),'LESSON:'+lessonIds[0]])
 ok(parseGo(bad)===null,`ignored: ${String(bad).slice(0,40)}`);
const town=read('components/Town.tsx');
ok(GO_PARAM==='go'&&/parseGo\(url\.searchParams\.get\(GO_PARAM\)\)/.test(town)&&/if\(!ready\|\|failed\)return;const url=new URL\(window\.location\.href\);if\(!url\.searchParams\.has\(GO_PARAM\)\)/.test(town),'Town reads go= once the island is ready');
ok(/url\.searchParams\.delete\(GO_PARAM\)/.test(town),'the param leaves the address bar');
const links=read('lib/site/playLinks.ts');ok(/\?go=lesson:\$\{encodeURIComponent/.test(links)&&/\?store=packs/.test(links),'site links are encoded; cards use the existing pack shop param');
ok(/playFishHref\(spot\.id\)/.test(read('app/(site)/fish/[id]/page.tsx'))&&/Catch it at/.test(read('app/(site)/fish/[id]/page.tsx')),'fish pages: "Catch it at <spot>"');
for(const f of ['app/(site)/learn/soccer-terms/[slug]/page.tsx','app/(site)/learn/soccer-rules/[slug]/page.tsx','app/(site)/learn/soccer-positions/[slug]/page.tsx','app/(site)/learn/soccer-formations/[slug]/page.tsx'])
 ok(/<GuideEnd [^>]*lesson=\{/.test(read(f)),`${f}: Play button deep-links to its lesson`);

// 5. Sticky bar
const bar=read('components/site/PlayBar.tsx');
ok(/@media\(min-width:768px\)\{\.playBar\{display:none!important\}\}/.test(css),'bar hidden from 768 px');
ok(/env\(safe-area-inset-bottom/.test(css.slice(css.indexOf('.playBar{')))&&/\.page\[data-playbar\]\{padding-bottom:/.test(css),'bar is safe-area aware and pads the page');
ok(/data-play-cta/.test(bar)&&/IntersectionObserver/.test(bar)&&!/addEventListener\('scroll'/.test(bar),'bar hides while an in-page Play button shows, no scroll listener');
ok(/sessionStorage\.setItem/.test(bar)&&/try\{/.test(bar)&&/aria-label="Hide the Play bar"/.test(bar),'bar is dismissible for the visit, with a named button');
ok(/data-play-cta=""/.test(parts)&&/<PlayBar /.test(parts),'PlayEnd pairs the in-page button with the bar');
console.log(`seo-design: ${n} checks passed`);
