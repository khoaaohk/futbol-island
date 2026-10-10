// cards-1970 "The Junction" (Oct 5 2026; manga style + motion pass Oct 9 2026): the case's facts are quoted word for word, the new history is cited, the six
// practice calls cover all three lamps and are labelled made-up, the silhouette rig grounds every pose, the Back button is the
// shared ExperienceBack (never `immediate`), and the replay loop sleeps, pauses when hidden and is cancelled on unmount.
// usage: node tests/museum-exp-cards-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/cards-1970/',read=f=>fs.readFileSync(path.join(root,dir,f),'utf8');
const X=require('../lib/endgame/museum.ts'),C=require('../'+dir+'content.ts'),R=require('../'+dir+'rig.ts');
const exp=read('Experience.tsx'),stage=read('Stage.tsx'),clipSrc=read('Clip.tsx'),css=read('Experience.module.css');
const M=require('../'+dir+'motion.ts');

// 1. Facts: the case's own lines, word for word, and shown.
{const e=X.EXHIBITS.find(x=>x.id==='cards-1970');
 for(const f of e.facts)assert.ok(Object.values(C.CASE_FACTS).includes(f),'case fact quoted: '+f);
 assert.equal(C.CASE_FACTS.forYourGame,e.forYourGame);
 for(const k of ['aston','mexico','language','forYourGame'])assert.ok(exp.includes('CASE_FACTS.'+k),k+' is shown');
 assert.ok(exp.includes('STORY_1966')&&exp.includes('FIRSTS')&&exp.includes('LADDER'),'story, firsts and the Law 12 ladder are shown');
 console.log('PASS facts: the case’s three facts and take-away are quoted and shown');}

// 2. Sources: every new claim cited, IFAB Law 12 included, the list is rendered.
{const urls=C.SOURCES.map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 assert.ok(urls.includes('https://www.theifab.com/laws/latest/fouls-and-misconduct/'),'IFAB Law 12');
 for(const host of ['inside.fifa.com','referee.com','topendsports.com','guinnessworldrecords.com'])assert.ok(urls.some(u=>u.includes(host)),host+' cited');
 assert.match(exp,/function Sources[\s\S]*SOURCES\.map/,'sources rendered');assert.match(exp,/made-up/,'practice calls labelled made-up');
 assert.ok(!/@gmail|khoa/i.test(exp+stage+JSON.stringify(C)),'no personal data');
 console.log('PASS sources: '+urls.length+' cited, practice calls labelled');}

// 3. The six calls: all three lamps used, every scene well formed, the rig grounds every pose.
{assert.equal(C.SCENES.length,6);assert.deepEqual([...new Set(C.SCENES.map(s=>s.answer))].sort(),['none','red','yellow']);
 assert.deepEqual(C.LADDER.map(l=>l.word),['Careless','Reckless','Excessive force'],'Law 12 ladder');
 for(const s of C.SCENES){assert.ok(s.moment>0&&s.moment<s.duration,s.id+' moment');assert.ok(s.figs.some(f=>f.num===s.watch),s.id+' watched player exists');
  assert.ok(/^Law 12/.test(s.law)&&s.why.length>40,s.id+' explains the Law');
  for(const f of [...s.figs.map(f=>f.keys),s.ball])for(let i=1;i<f.length;i++)assert.ok(f[i].t>f[i-1].t,s.id+' keys in time order');
  for(const f of s.figs)for(let t=0;t<=s.duration;t+=.05){const p=R.sample(f.keys,t),r=R.solve(p.pose,p.x,0,f.dir);
   const low=Math.max(r.hip[1],r.shoulder[1],r.head[1]+R.BODY.head,...['elbow','hand','knee','ankle','toe'].flatMap(k=>[r.far[k][1],r.near[k][1]]));
   assert.ok(Math.abs(low-(R.GROUND-R.BODY.sole))<1e-6,s.id+' grounded');}}
 assert.equal(R.solve(C.POSES.stand,100,30,1).hip[1],R.solve(C.POSES.stand,100,0,1).hip[1]-30,'lift raises the figure');
 // Spot it: every scene says what to freeze on, and its sound effects are katakana (with an English gloss) inside the clip.
 for(const s of C.SCENES){assert.ok(/^the moment /.test(s.spot),s.id+' spot prompt');assert.ok(s.sfx.length>=1,s.id+' has a sound effect');
  for(const f of s.sfx){assert.match(f.ja,/^[\u30A0-\u30FF]+$/,s.id+' sfx is katakana');assert.match(f.en,/^[A-Z]+$/);assert.ok(f.t>0&&f.t<s.duration);}}
 assert.match(C.WHISTLE_SFX.ja,/^[\u30A0-\u30FF]+$/);
 console.log('PASS calls: 6 scenes, green/amber/red all used, every frame grounded');}

// 4. Contract, controls and heat.
{assert.match(exp,/data-museum-experience="cards-1970"/);assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.ok(!/NavigationButton/.test(exp+stage),'no local NavigationButton Back');assert.ok(!/immediate/.test(exp.replace(/\/\*[\s\S]*?\*\//g,'')),'Back never immediate');
 assert.match(css,/\.top\{[^}]*padding-left:96px/,'header clears the Back corner');
 assert.match(clipSrc,/timeScale/,'bullet time around the key moment');
 assert.ok(!/startViewTransition|view-transition/.test(exp+stage+clipSrc+css),'no View Transitions (FLIP and WAAPI instead)');
 assert.match(exp,/e\.key==='Escape'[^\n]*onClose\(\)/,'Escape closes');assert.match(exp,/data-museum-own-cue/,'lamps carry their own sound cue');
 assert.match(css,/\.lamp:not\(:disabled\):active\{transform:scale/,'lamps shrink on press');assert.match(css,/\.btn:not\(:disabled\):active\{transform:scale/,'buttons shrink on press');
 assert.match(css,/min-height:44px/);assert.match(css,/safe-area-inset-bottom/);assert.match(css,/prefers-reduced-motion/);
 assert.match(stage,/ro\.disconnect\(\)/,'resize observer disconnected');
 assert.ok(!/setInterval|setTimeout/.test(exp+stage+clipSrc),'no timers or polling');assert.ok(!/AudioContext\(/.test(exp+stage+clipSrc),'sound goes through the museum’s shared, mute-aware context');
 assert.ok(!/https?:\/\/(?!www\.w3)/.test(stage+css),'no external assets');
 console.log('PASS contract: shared Back, Escape, 44px press-shrink controls, no View Transitions, reduced motion, no polling');}

// 5. The clip clock: one loop that runs only while playing, coasting or springing, then sleeps; hidden tab and unmount stop it.
{assert.match(clipSrc,/if\(st\.mode!=='idle'&&!document\.hidden\)st\.raf=requestAnimationFrame\(tick\)/,'the loop sleeps when idle');
 assert.match(clipSrc,/if\(st\.x>=duration\)\{st\.x=duration;st\.mode='idle'/,'playback stops at the end');
 assert.match(clipSrc,/if\(document\.hidden\)\{cancelAnimationFrame\(st\.raf\);st\.raf=0;\}/,'pauses when hidden');
 assert.match(clipSrc,/return \(\)=>\{cancelAnimationFrame\(s\.current\.raf\);s\.current\.raf=0;document\.removeEventListener/,'cancelled on unmount');
 assert.match(clipSrc,/if\(reduced\)\{st\.x=moment;setRaw\(moment\);end\.current\(\);return;\}/,'reduced motion: the key still, no playback');
 assert.match(clipSrc,/role="slider"/,'the film strip is a keyboard slider');assert.match(clipSrc,/ArrowRight/);
 assert.match(css,/\.film\{[^}]*touch-action:pan-y/,'the strip leaves vertical page gestures to the browser');assert.match(css,/\.svg\[data-scrub\]\{touch-action:pan-y/);
 assert.match(exp,/SPOT_WINDOW=\.3/);assert.match(exp,/if\(m>=3\)/,'after three misses the film shows the moment');
 console.log('PASS clip: sleeping loop, end/hidden/unmount stops, reduced still, keyboard slider, spot window and help');}

// 6. Motion maths: springs settle, the rubber band is bounded, WAAPI keyframes come from the spring.
{let x=0,v=0,n=0;while(!M.settled(x,v,1)&&n<600){[x,v]=M.springStep(x,v,1,M.SPRING.snap,1/60);n++;}assert.ok(n<90,'snap spring settles in under 1.5 s ('+n+' frames)');
 let peak=0;x=0;v=0;for(let i=0;i<200;i++){[x,v]=M.springStep(x,v,1,M.SPRING.flip,1/60);peak=Math.max(peak,x);}assert.ok(peak>1.05&&peak<1.6,'the flip overshoots a little ('+peak.toFixed(2)+')');
 for(const o of [0,.1,1,10,1000])assert.ok(M.rubber(o,.35)<.35&&M.rubber(o,.35)>=0,'rubber band bounded');assert.ok(M.rubber(1,.35)>M.rubber(.1,.35),'and monotonic');
 let c=0,cv=3;for(let i=0;i<120;i++)[c,cv]=M.coastStep(c,cv,1/60);assert.ok(Math.abs(cv)<.1&&c>.6&&c<.8,'a flick coasts and slows');
 const k=M.springKeyframes(M.SPRING.fly,u=>({opacity:u}));assert.equal(k.keyframes.at(-1).opacity,1);assert.equal(k.keyframes[0].offset,0);assert.equal(k.keyframes.at(-1).offset,1);assert.ok(k.duration>200&&k.duration<2500);
 assert.match(exp,/springKeyframes\(SPRING\.fly/,'the card flies in on a spring (FLIP)');assert.match(exp,/rotateY/,'and flips over');assert.match(exp,/getBoundingClientRect/,'FLIP measures both boxes');
 assert.match(exp,/if\(!f\|\|!p\|\|reduced\|\|typeof f\.animate!=='function'\)return;/,'reduced motion: no flight, no flip');
 console.log('PASS motion: '+n+'-frame snap, flip overshoot '+peak.toFixed(2)+', bounded rubber band, spring-sampled WAAPI card flight');}

// 7. Manga style: self-hosted OFL fonts with their licence, screentones as patterns, only the cards in colour.
{const pub=path.join(root,'public/museum/experiences/cards-1970');
 for(const f of ['bangers-latin.woff2','dela-gothic-one-kana.woff2']){assert.ok(fs.statSync(path.join(pub,f)).size<40000,f+' is a small subset');assert.ok(css.includes('/museum/experiences/cards-1970/'+f),f+' is used');}
 const lic=fs.readFileSync(path.join(pub,'FONTS-LICENSE.txt'),'utf8');assert.match(lic,/Open Font License/);assert.match(lic,/Bangers/);assert.match(lic,/Dela Gothic/);
 assert.match(stage,/patternTransform="rotate\(45\)"/,'screentone dots at a 45° screen');assert.match(stage,/focusLines/,'focus lines');assert.match(stage,/SPEED/,'speed lines');
 assert.match(css,/font-display:swap/);
 console.log('PASS style: OFL fonts self-hosted (subset), screentone patterns, focus and speed lines');}

// 8. Story pass (Oct 9 2026): the 1966 story turns one manga panel at a time (a narration box per beat, the street a pale
//    flashback until the drive home), and Full time adds a three-question history check with quiz-show sound effects.
{const chk=read('Check.tsx');
 assert.equal(C.STORY_TAGS.length,C.STORY_1966.length,'one narration box per story beat');
 assert.match(exp,/const \[beat,setBeat\]=useState\(0\)/);assert.match(exp,/Next panel ▶/);assert.match(exp,/data-flashback=\{phase==='intro'&&!storyDone\|\|undefined\}/);
 assert.match(exp,/phase==='intro'&&storyDone\?/,'the lamps invite only once the story is told');
 assert.equal(C.CHECK.length,3);assert.deepEqual(C.CHECK.map(q=>q.right).sort(),[0,1,2],'right answers move about');
 assert.match(C.CHECK[0].options[C.CHECK[0].right],/traffic lights/);assert.match(C.CHECK[1].options[C.CHECK[1].right],/whatever language/);assert.match(C.CHECK[2].options[C.CHECK[2].right],/red card/);
 for(const k of ['right','wrong']){assert.match(C.CHECK_SFX[k].ja,/^[゠-ヿ]+$/);assert.match(C.CHECK_SFX[k].en,/^[A-Z]+$/);}
 assert.match(exp,/<QuickCheck reduced=\{reduced\}\/>/);assert.ok(!/setTimeout|setInterval|requestAnimationFrame/.test(chk),'no timers or loops');
 assert.match(css,/\.narration,\.beatBox,\.turnPage span,\.checkQ,\.checkOpt,\.checkSfx,\.checkWhy\{animation:none!important\}/,'reduced motion');
 console.log('PASS story: 4 manga beats with narration boxes, flashback street, 3-question history check with katakana quiz SFX');}
