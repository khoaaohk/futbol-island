// var-2018 · "You are the VAR" full-screen experience: the case facts appear word for word, the practice moment's truth is
// right (onside by the foot with only the arm ahead; the ball's deepest point leaves part of it on the line, so no goal), Back
// is the shared ExperienceBack (never `immediate`), drawing is on demand and playback sleeps/stops/disposes, and new facts are
// cited. usage: node tests/museum-exp-var-2018.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/var-2018',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require(`../${dir}/content.ts`),S=require(`../${dir}/scene.ts`);
const src=read(`${dir}/Experience.tsx`),css=read(`${dir}/var.module.css`);

// 1. Facts: the case's own facts, word for word, and every one is shown.
{const e=X.EXHIBITS.find(x=>x.id==='var-2018');
 assert.deepEqual(Object.values(C.CASE_FACTS).sort(),[...e.facts].sort(),'CASE_FACTS are the case facts, word for word');
 assert.equal(C.FOR_YOUR_GAME,e.forYourGame);
 for(const k of Object.keys(C.CASE_FACTS))assert.ok(src.includes(`CASE_FACTS.${k}`),`fact "${k}" is shown`);
 assert.ok(src.includes('{FOR_YOUR_GAME}'),'take it to your game is shown');
 assert.match(C.PRACTICE_NOTE,/practice/i);assert.ok(src.includes('PRACTICE REPLAY')&&src.includes('PRACTICE_NOTE'),'the replay is labelled as practice');
 assert.match(C.IFAB_QUOTE,/final decision is always taken by the referee/);
 assert.equal(C.CHECKS.filter(c=>c.yes).length,4,'four things VAR can check');
 console.log('PASS facts: the four case facts, the game line, the practice label and the IFAB quote');}

// 2. Sources: every new claim's source is listed with a URL, including the case's own sources.
{const urls=C.SOURCES.map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 for(const s of X.EXHIBITS.find(x=>x.id==='var-2018').sources)assert.ok(urls.includes(s.url),'case source listed: '+s.url);
 for(const re of [/var-protocol/,/offside/,/si\.com.*griezmann/,/euronews.*griezmann/,/gulfnews.*var/])assert.ok(urls.some(u=>re.test(u)),'cited: '+re);
 assert.ok(src.includes('SOURCES.map')&&/<summary>Sources<\/summary>/.test(src),'a Sources list is shown');
 assert.ok(!/@gmail|khoa/i.test(src+JSON.stringify(C)),'no personal data');
 console.log('PASS sources: IFAB VAR protocol, Laws 10 and 11, the 2018 reports, all with URLs');}

// 3. The practice moment tells the truth it teaches.
{const T=S.TRUTH;
 assert.equal(T.defenderPart,'foot');assert.equal(T.attackerPart,'foot');
 assert.ok(T.onsideCm>=5&&T.onsideCm<=20,`onside by a close margin (${T.onsideCm} cm)`);
 assert.ok(T.attackerArm<T.defender-.05,'only the attacker’s ARM is ahead of the defender');
 assert.equal(S.deepestFrame(),S.DEEP,'the ball is deepest on frame DEEP');
 assert.equal(T.wholeBallOver,false,'the whole ball did not cross the whole line');
 const b=S.ballAt(S.DEEP);assert.ok(b.z<0&&b.z+S.BALL_R>-S.LINE_W,'part of the ball over, part still on the line');
 assert.equal(T.ballOnLineCm,6);
 assert.equal(S.snapLine('att',T.attackerArm+.03).target.id,'arm','the arm is a (wrong) target');assert.equal(S.snapLine('def',T.defender+.1).target.id,'def');
 assert.equal(S.snapLine('att',30).target,null);
 const kick=S.ballAt(S.KICK),before=S.ballAt(S.KICK-1),after=S.ballAt(S.KICK+1);assert.deepEqual(kick,before,'ball still until the kick');assert.ok(Math.hypot(after.x-kick.x,after.z-kick.z)>.5,'and gone the frame after');
 // groundZAt inverts the camera: the screen point of a ground spot maps back to its z.
 for(const cam of ['wide','offside','behind']){const p=S.screenOf(cam,1600,900,{x:0,y:0,z:16.4});const z=S.groundZAt(cam,1600,900,p.x,p.y);assert.ok(Math.abs(z-16.4)<1e-6,cam+' unprojects');}
 console.log(`PASS replay: onside by ${T.onsideCm} cm (arm ${T.armAheadCm} cm ahead), ${T.ballOnLineCm} cm of ball on the line at frame ${S.DEEP}`);}

// 4. Contract: root, Back, keyboard, labels.
{assert.match(src,/data-museum-experience="var-2018"/);assert.match(src,/role="dialog" aria-modal="true"/);
 assert.match(src,/import ExperienceBack from '\.\.\/ExperienceBack';/,'uses the shared ExperienceBack');assert.match(src,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.equal((src.match(/<ExperienceBack /g)||[]).length,1,'exactly one Back');
 assert.ok(!/NavigationButton/.test(src)&&!/@\/components\/DoneButton/.test(src),'no local NavigationButton Back');
 assert.ok(!/immediate/.test(src.replace(/\/\*[\s\S]*?\*\//g,'')),'Back never passes immediate');
 // The header keeps clear of the fixed Back corner (100×64 desktop, 92×60 phones).
 assert.match(css,/\.top\{[^}]*--clear:calc\(env\(safe-area-inset-left,0px\) \+ 108px/);assert.match(css,/--clear:calc\(env\(safe-area-inset-left,0px\) \+ 100px/);assert.match(css,/padding-left:var\(--clear\)/);
 assert.match(src,/e\.key==='Escape'[^;]*;onClose\(\)/,'Escape leaves');
 assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/,'full screen at z 20');
 assert.match(css,/safe-area-inset-top/);assert.match(css,/prefers-reduced-motion/);
 for(const cls of ['tbtn','cam','chip','primary','call'])assert.match(css,new RegExp(`\\.${cls}[^{]*:active\\{transform:scale`),cls+' shrinks on press');
 assert.match(css,/\.tbtn\{[^}]*min-width:44px;height:44px/);
 // CSS module purity: every selector has a local class.
 for(const sel of css.replace(/\/\*[\s\S]*?\*\//g,'').replace(/@keyframes[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g,'').replace(/@media[^{]*\{/g,'}').match(/(^|\})\s*([^@{}][^{}]*)\{/g)??[])
  {const s=sel.replace(/^\}?\s*/,'').replace(/\{$/,'').trim();if(!s||/^(from|to|\d+%)$/.test(s))continue;for(const part of s.split(','))assert.ok(/\.[a-zA-Z]/.test(part),'local class in selector: '+part);}
 console.log('PASS contract: fixed root, shared ExperienceBack (no local NavigationButton), header clear of the Back corner, Escape, 44 px controls that shrink, safe areas');}

// 4b. Motion (Oct 9 2026): the camera switch is a FLIP (no View Transitions anywhere), the lines and the scrub use the spring kit,
// and the spring kit itself behaves (settles, rubber-bands, projects flicks, produces a linear() easing ending at 1).
{const M=require(`../${dir}/motion.ts`);
 assert.ok(!/startViewTransition|viewTransitionName|::view-transition/.test(src+css),'no View Transitions: the camera switch is a FLIP');
 assert.match(src,/getBoundingClientRect\(\)[^]*flushSync\(\(\)=>setCam\(id\)\)[^]*mon\.animate\(\[\{transformOrigin:'0 0',transform:`translate/,'FLIP: first rect, update, invert, play');
 assert.match(src,/springEasing\(FLIP_SPRING\)/);assert.match(src,/if\(!mon\|\|reduced\(\)\|\|typeof mon\.animate!=='function'\)/,'reduced motion: a cut, no FLIP');
 assert.match(src,/stepSpring\(l\.s,l\.to,dt,SNAP_SPRING\)/,'lines settle on a spring');assert.match(src,/project\(z,v,/,'a flicked line keeps its momentum');
 assert.match(src,/rubberClamp\(raw,Z_MIN,Z_MAX/,'lines rubber-band at the ends');assert.match(src,/coast\(c,dt\)/,'a flicked scrub coasts');
 assert.match(src,/rubber\(over,70\)/,'over-scrub stretches the picture');assert.match(src,/stepSpring\(e,0,dt,EDGE_SPRING\)/,'and springs back');
 assert.match(src,/data-tried/,'the try-it hint goes once tried');assert.match(css,/\.hand\{[^}]*animation:handSlide[^}]* 3 both/,'the hand hint is finite');
 // the spring kit
 const s={x:0,v:0};let t=0;while(!M.atRest(s,1)&&t<3){M.stepSpring(s,1,1/60,M.SNAP_SPRING);t+=1/60;}assert.ok(t<1,'snap spring settles under a second ('+t.toFixed(2)+' s)');
 const o={x:0,v:0};let peak=0;for(let i=0;i<60;i++){M.stepSpring(o,1,1/60,M.SNAP_SPRING);peak=Math.max(peak,o.x);}assert.ok(peak>1&&peak<1.1,'one small overshoot');
 const fast={x:0,v:30};M.stepSpring(fast,0,1/60,M.SNAP_SPRING);assert.ok(fast.x>0,'velocity-aware: a moving start keeps going first');
 assert.equal(M.rubberClamp(10,8,26,1.2),10);assert.ok(M.rubberClamp(40,8,26,1.2)<26+1.2&&M.rubberClamp(40,8,26,1.2)>26,'rubber band: past the end, never more than dim');
 assert.ok(M.rubber(1,1)<M.rubber(2,1)&&M.rubber(2,1)<1,'resistance grows');
 assert.ok(M.project(0,10)>M.project(0,5)&&M.project(0,0)===0,'flick projection');
 const c={x:0,v:50};for(let i=0;i<120;i++)M.coast(c,1/60);assert.ok(Math.abs(c.v)<1&&c.x>10&&c.x<20,'coast decelerates and stops');
 assert.equal(M.velocity([{t:0,x:0},{t:50,x:1},{t:100,x:2}]),20);
 const e=M.springEasing(M.FLIP_SPRING);assert.match(e.easing,/^linear\(0,.*,1\)$/);assert.ok(e.duration>200&&e.duration<=900);
 // the blueprint overlay: grid + dimension callout + handles exist in the renderer and only on the offside beat
 const sc=read(`${dir}/scene.ts`);assert.match(sc,/if\(o\.grid\)/);assert.match(sc,/Dimension callout between the two lines/);assert.match(sc,/if\(o\.handles\)/);
 assert.match(src,/handles:s\.step==='lines',grid:s\.step==='lines'/);
 assert.match(css,/@keyframes stamp\{/);assert.match(css,/\.stamp\{[^}]*forwards/,'stamp animation is finite');
 assert.match(css,/prefers-reduced-motion:reduce\)\{[^]*\.stamp,\.done li/);
 console.log('PASS motion: FLIP camera grow, spring-settled flickable lines with rubber bands, coasting scrub with an edge bounce, finite hints');}

// 5. Heat: no loop unless playing; playback stops at the end, on pause, on hide, on unmount; resize by observer; capped DPR.
{assert.match(src,/requestDraw=useCallback\(\(\)=>\{if\(raf\.current\)return;raf\.current=requestAnimationFrame/,'draws once per change');
 assert.match(src,/if\(!playing\)return;/,'no loop unless playing');
 assert.match(src,/if\(moving&&!document\.hidden\)\{loop\.current=requestAnimationFrame\(tick\);\}/,'the motion loop runs only while something moves');
 assert.match(src,/if\(document\.hidden&&loop\.current\)\{cancelAnimationFrame\(loop\.current\);loop\.current=0;settleAll\(\);\}/,'hidden tab: settle, stop');
 assert.match(src,/cancelAnimationFrame\(loop\.current\);loop\.current=0;flip\.current\?\.cancel\(\);/,'unmount: loop and FLIP cancelled');assert.match(src,/if\(n>=LAST\)done=true/,'stops at the last frame');
 assert.match(src,/visibilitychange/);assert.match(src,/return\(\)=>\{cancelAnimationFrame\(id\);document\.removeEventListener\('visibilitychange'/,'loop cancelled on unmount');
 assert.match(src,/new ResizeObserver/);assert.match(src,/ro\.disconnect\(\);cancelAnimationFrame\(raf\.current\)/,'observer and pending draw disposed');
 assert.match(src,/coarse\?1\.5:2/,'pixel ratio capped');assert.ok(!/setInterval|three|WebGLRenderer|new AudioContext/.test(src),'no polling, WebGL or own audio context');
 assert.ok(!/requestAnimationFrame/.test(read(`${dir}/scene.ts`)),'the renderer is pure');
 console.log('PASS heat: on-demand drawing, playback loop sleeps and is disposed, ResizeObserver, DPR cap');}

// 6. The ending (Oct 9 2026): the real case unfolds a line at a time, then a four-question quick check stamps "VAR CERTIFIED".
{const quiz=read(`${dir}/Quiz.tsx`);
 assert.equal(C.REAL_CASE.slates.length,C.REAL_CASE.story.length,'one slate word per story line');
 assert.match(src,/REAL_CASE\.story\.slice\(0,caseBeat\+1\)/);assert.match(src,/What happened next\?/);assert.match(src,/<Quiz onDone=\{onQuizDone\}\/>/);
 assert.equal(C.QUIZ.length,4);for(const q of C.QUIZ)assert.ok(q.answer<q.options.length&&q.hint&&q.why,q.q);
 assert.match(C.QUIZ[0].options[C.QUIZ[0].answer],/referee/);assert.equal(C.QUIZ[2].options[C.QUIZ[2].answer],'No goal');assert.equal(C.QUIZ[3].options[C.QUIZ[3].answer],'The arm');
 assert.ok(!/requestAnimationFrame|setInterval|setTimeout/.test(quiz),'no loop in the quiz');assert.match(css,/prefers-reduced-motion:reduce\)\{\.unfoldLine,\.slateBeat,\.quizOpt\{animation:none/);
 console.log('PASS ending: the 2018 case unfolds beat by beat, four-question quick check, VAR CERTIFIED stamp, no loop');}
