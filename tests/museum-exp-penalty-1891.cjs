// penalty-1891 museum experience (Oct 5 2026 broadcast redesign): real-scale numbers, the shot model teaches what it claims
// (corners beat the keeper's reach, low shots can't go over, harder = more wobble, 1891 keeper 6 yards out), the case's facts and
// cited extra facts are shown, the shared ExperienceBack, the story as the shared slide-out drawer, the island's own bean rig
// (kicker = the visitor's saved look, keeper with the rig's own save types), and the three.js stage renders on demand and disposes.
// usage: node tests/museum-exp-penalty-1891.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/penalty-1891/',read=f=>fs.readFileSync(path.join(root,dir,f),'utf8');
const M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts'),X=require('../lib/endgame/museum.ts');
const exp=read('Experience.tsx'),scene=read('scene.ts'),css=read('Experience.module.css'),drawer=read('StoryDrawer.tsx'),drawerCss=read('StoryDrawer.module.css');

// 1. Real measurements.
{assert.equal(M.GOAL_W,7.32);assert.equal(M.GOAL_H,2.44);assert.equal(M.MARK,11);assert.equal(M.SIX_YARDS,5.5);
 assert.ok(Math.abs(M.GOAL_ANGLE_DEG-36.8)<.1,'the goal mouth is ~36.8° wide from the mark');
 assert.ok(Math.abs(M.flightTime('firm')-11/(80/3.6))<1e-9,'flight time = 11 m ÷ speed');
 assert.equal(M.keeperDepth('today'),0);assert.equal(M.keeperDepth('1891'),5.5);
 console.log('PASS scale: 7.32 × 2.44 m goal, 11 m mark, 6-yard 1891 keeper, flight time from speed');}

// 2. The model teaches what the captions say.
{const o=(era,p,x,y)=>M.odds(era,p,x,y);
 for(const p of ['soft','firm','blast']){const low=o('today',p,3.1,.3),mid=o('today',p,1.4,1.1);assert.ok(low.reach<mid.reach,`${p}: a low corner is further from the keeper than near him`);}
 assert.ok(o('today','firm',3.1,.3).goal>o('today','firm',1.6,.9).goal,'low corner beats a shot near the keeper');
 assert.ok(o('today','firm',3.1,2.1).onTarget<o('today','firm',3.1,.3).onTarget,'a top-corner aim misses more often than a low-corner aim');
 assert.ok(M.onTargetResult(0,M.BALL_R)===null&&M.landing(0,.2,'blast',[0,-5]).y>=M.BALL_R,'a low ball can’t go under the grass (or over the bar)');
 assert.ok(M.POWERS.soft.wobble<M.POWERS.firm.wobble&&M.POWERS.firm.wobble<M.POWERS.blast.wobble,'harder shots wobble more');
 assert.ok(M.reach(M.keeperTime('today','blast')).a<M.reach(M.keeperTime('today','soft')).a,'harder shots give the keeper less time');
 assert.equal(M.shotResult('today','firm','left',5,1),'wide');assert.equal(M.shotResult('today','firm','left',0,3),'over');
 assert.equal(M.shotResult('today','firm','left',-2,1),'saved');assert.equal(M.shotResult('today','firm','right',-2,1),'goal','a keeper who guesses wrong can’t save it');
 assert.equal(M.shotResult('today','firm','left',0,1),'goal','a diving keeper leaves the middle');assert.equal(M.shotResult('today','firm','stay',0,1),'saved');
 const g=M.toGoal('1891',1,1),k=M.atKeeper('1891',g.x,g.y);assert.ok(Math.abs(k.x-1)<1e-9&&Math.abs(k.y-1)<1e-9,'1891 shadow projection round-trips');
 assert.ok(Math.abs(M.DIVE_ODDS.left+M.DIVE_ODDS.right-.94)<1e-9,'keepers dive 94% of the time (Bar-Eli et al. 2007)');
 console.log('PASS model: corners out of reach, low shots stay under the bar, power trades time for wobble, keeper guesses');}

// 3. Facts: the case's own facts and takeaway are rendered; extra facts are cited.
{const e=X.EXHIBITS.find(x=>x.id==='penalty-1891');assert.match(drawer,/exhibit\.facts,\.\.\.HISTORY/);assert.match(exp,/exhibit\.facts\[0\]/);assert.match(exp,/exhibit\.forYourGame/);assert.match(drawer,/exhibit\.sources,\.\.\.SOURCES/);
 assert.ok(e.facts[1].includes('11 metres'));
 const all=[...C.HISTORY,...C.RESEARCH].join(' ');
 for(const s of ['Milford','1890','12 yards','6 yards','18 yards','1902','1905','14 September 1891','286','311','94%'])assert.ok(all.includes(s),'fact: '+s);
 const urls=C.SOURCES.map(s=>s.url).join(' ');
 for(const u of ['football-pitch-markings','William_McCrum','nature.com/articles/s41598-022-21508-6','263266318','mprapa/4477','wolves.co.uk','the-field-of-play'])assert.ok(urls.includes(u),'source: '+u);
 assert.ok(C.SOURCES.every(s=>/^https:\/\//.test(s.url)));assert.match(drawer,/<summary>Sources<\/summary>/);assert.match(drawer,/MODEL_NOTE/,'the practice-model note is in the story');assert.match(exp,/practice model/);
 assert.match(C.MODEL_NOTE,/simple model/);assert.match(C.MODEL_NOTE,/not measured/,'the keeper model is labelled as made up');
 assert.ok(!/@gmail|khoa/i.test(exp+scene+drawer+JSON.stringify(C)),'no personal data');
 console.log('PASS facts: case facts + takeaway rendered, 8 extra facts with 9 cited sources, the model labelled as a model');}

// 4. Contract: dialog root, Back, controls ≥ 44 px, keyboard.
{assert.match(exp,/data-museum-experience="penalty-1891"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{[^}]*position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack';/,'uses the shared ExperienceBack');assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.equal((exp.match(/<ExperienceBack/g)||[]).length,1,'exactly one Back');
 assert.ok(!/NavigationButton/.test(exp),'no local NavigationButton Back');assert.ok(!/immediate/.test(exp),'Back never immediate');
 assert.ok(!/\.header[^{]*\{[^}]*grid-template-columns:auto/.test(css),'the header keeps its first column free for the fixed Back');
 assert.match(exp,/e\.key==='Escape'/);assert.match(exp,/ArrowLeft/);assert.match(exp,/if\(story\)return;/,'Escape closes the story drawer first (the dialog handles it), then the exhibit');
 for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(+m[1]>=44,'controls ≥ 44 px');
 assert.match(css,/button:active:not\(:disabled\)\{transform:scale\(\.94\)\}/,'press-shrink');assert.match(css,/prefers-reduced-motion/);assert.match(css,/safe-area-inset-bottom/);
 for(const sel of (css+drawerCss).replace(/@keyframes[^{]*\{([^{}]*\{[^}]*\})*\s*\}/g,'').replace(/\{[^{}]*\}/g,'\n').split(/\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith('@')&&!s.startsWith('/*')&&!s.startsWith('*')&&s!=='}'))
  for(const part of sel.split(','))assert.ok(/\./.test(part),'CSS module selector has a local class: '+part);
 console.log('PASS contract: fixed dialog, shared ExperienceBack (animated), 44 px controls, keyboard, reduced motion, safe areas');}

// 4b. The redesign: the story is the shared slide-out; the stage uses the island's own bean rig and keeper saves; the goal is
// centred in the free stage; broadcast graphics on the goal plane; 1891 markings; era balls; round card; reduced motion.
{assert.match(drawer,/import slide from '@\/components\/DrawerSlide\.module\.css'/);assert.match(drawer,/showDrawer\(dialog\.current,done\.current\)/);
 assert.match(drawer,/<dialog ref=\{dialog\}/);assert.match(drawer,/onCancel=\{e=>\{e\.preventDefault\(\);close\(\);\}\}/,'Escape slides it closed');assert.match(drawer,/e\.target===e\.currentTarget\)close\(\)/,'tap outside closes');
 assert.match(drawer,/<DoneButton/);assert.match(drawerCss,/@media\(max-width:600px\)\{\.dialog \.panel\{width:100%/,'full width on phones');
 assert.match(scene,/import \{createPlayer,DIVE_KINDS[^}]*\} from '@\/lib\/graphics\/player'/,'the island character rig');
 assert.match(scene,/kicker\.setAppearance\(custom\);kicker\.setBeanLook\(beanLookFor\(custom\),playerOutfit\(custom\)\)/,'the visitor\'s own saved look, as CharacterPreview sets it');
 assert.match(scene,/loadCustomization\(progress\.completed,progress\.total\)/);assert.match(scene,/matchPlayerDress\('museum-penalty-keeper','away',true,1\)/,'a match keeper (kit + gloves)');
 assert.match(scene,/headwear:'cap'/,'the 1891 keeper wears a cap');
 for(const k of ['tip','collapse','spring','side','stand'])assert.ok(scene.includes(`'${k}'`),'keeper save type '+k);
 assert.match(scene,/keeperM\.dive=\{progress:p,dir:r\.dir,height:r\.height,kind:r\.kind,outcome:r\.outcome\}/,'the rig performs the dive; the host only moves the root');
 assert.match(scene,/keeper\.root\.position\.y=lift/,'high dives lift the whole body');assert.match(scene,/hold:saved\?0:/,'a beaten keeper stays down a beat');
 assert.match(scene,/applyCelebrationArms\(kicker\.root/);assert.match(scene,/kickerM\.reaction='dejected'/);assert.match(scene,/kickerM\.kick=kp;kickerM\.actionKind='shot'/,'a real kicking leg');
 assert.match(scene,/function fitFor\(/);assert.match(scene,/makePerspective\(/,'an off-centre frustum puts the goal in the middle of the free stage');assert.match(exp,/s\.setInsets\(\{/);
 assert.match(scene,/createBallMaterial\(TRIONDA_GLSL\)/);assert.match(scene,/leatherStrips\(p,hex\(0x8a5a2f\),3\.,true\)/,'1891 laced leather');
 assert.match(scene,/ln\(p\.y-10\.97,W\)/,'1891: the 12-yard line across the pitch');assert.match(scene,/length\(vec2\(ax,p\.y\)\)-5\.49/,'1891: 6-yard arcs from each post');
 assert.match(scene,/KEEPER REACH/);assert.match(scene,/for\(const w of WOBBLE\)/,'the spray is the model\'s own wobble samples');assert.match(scene,/uAmp\.value=\.42\*Math\.exp/,'the net bulges');
 assert.match(exp,/ROUND=5/);assert.match(exp,/Take five more/);assert.match(exp,/Step up to the spot/);assert.match(scene,/HOLD_MS=80/,'hit-stop');
 assert.match(css,/--spring:linear\(/);assert.match(css,/@supports not \(transition-timing-function:linear\(0,1\)\)/,'linear() fallback');
 const rm=css.slice(css.indexOf('@media (prefers-reduced-motion:reduce)'));for(const c of ['.result','.summary','.scrim','.hint','.dock','.thumb'])assert.ok(rm.includes(c),'reduced motion covers '+c);
 assert.match(scene,/if\(opts\.reducedMotion\|\|document\.hidden\)\{\/\/ jump to the end/,'reduced motion jumps to the end of a shot');
 console.log('PASS redesign: shared story drawer, island bean rig (own look) + rig save types, centred goal, era balls + 1891 markings, broadcast graphics');}

// 5. Heat: lazy stage, render on demand, no idle loop, sleeps when hidden, disposes, DPR cap.
{assert.match(exp,/import\('\.\/scene'\)/,'stage lazy-loaded');assert.ok(!/from '\.\/scene'/.test(exp.replace(/import type[^;]*;/g,'')),'only a type import is static');
 assert.ok(!/from 'three'|lib\/graphics/.test(exp),'three and the rig load only with the stage');
 assert.match(exp,/scene\.current\?\.dispose\(\)/);
 assert.ok(!/setInterval|setAnimationLoop/.test(exp+scene),'no polling, no free-running loop');
 assert.match(scene,/if\(busy\(\)\)raf=requestAnimationFrame\(frame\);else last=0;/,'the loop stops once nothing moves');
 assert.match(scene,/const busy=\(\)=>!!run&&!run\.done\|\|camT<1\|\|settle>0/,'busy only while a shot, camera move or settle runs');
 assert.match(scene,/visibilitychange/);assert.match(scene,/if\(document\.hidden\)\{cancelAnimationFrame\(raf\);raf=0;/,'hidden tab stops the loop');
 assert.match(scene,/dispose\(\)\{disposed=true;cancelAnimationFrame\(raf\);raf=0;ro\.disconnect\(\);document\.removeEventListener/);
 assert.match(scene,/kicker\.dispose\(\);keeper\.dispose\(\);disposables\.forEach\(d=>d\.dispose\(\)\);sun\.shadow\.map\?\.dispose\(\);renderer\.dispose\(\);renderer\.forceContextLoss\(\);/);
 assert.match(scene,/opts\.coarse\?1\.5:2/,'pixel ratio ≤ 1.5 on touch');assert.match(scene,/mapSize\.set\(1024,1024\)/,'one small shadow map');
 assert.match(scene,/process\.env\.NODE_ENV!=='production'/,'the dev hook is stripped from production');
 assert.ok(!/AudioContext\(/.test(exp+scene),'sound only through the museum one-shots (mute respected)');assert.match(exp,/museumSfx\./);
 console.log('PASS heat: lazy three.js stage, on-demand frames, stops when idle/hidden/unmounted, DPR ≤1.5 on touch, muted-aware one-shots');}
