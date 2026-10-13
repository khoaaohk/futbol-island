// backpass-1992 · "The back-pass rule" (Oct 12 2026 anatomy Paper rebuild; user: only the penalty kick stays pixel, every other
// exhibit is an isometric technical illustration in the Paper theme that fills the screen and is a real mini-game). The rules stay
// the two pure models checked here (board.ts: Kill the Clock under the 1990 law; pressRules.ts: Beat the press under the 1992 law);
// model.ts moves the world; scene.ts draws the penalty-area bench with the anatomy kit. Checks: sourced content kept and shown;
// both laws taught; the match moment plays both rounds end to end (and turn-based under reduced motion); the bench draws, no
// pixel kit, the play area fills the screen; the shared contract and progress key; heat.
// usage: node tests/museum-exp-backpass-1992.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/backpass-1992/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),model=read(dir+'model.ts'),scene=read(dir+'scene.ts');
const paper=read('components/museum/experiences/anatomy/PaperStage.tsx'),pcss=read('components/museum/experiences/anatomy/PaperStage.module.css'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');
const X=require('../lib/endgame/museum.ts'),B=require('../'+dir+'board.ts'),C=require('../'+dir+'content.ts'),R=require('../'+dir+'pressRules.ts'),M=require('../'+dir+'model.ts'),SC=require('../'+dir+'scene.ts'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const ex=X.EXHIBITS.find(e=>e.id==='backpass-1992');

// 1. Content and sources.
{for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`case fact ${i} is shown`);assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);
 assert.equal(ex.facts[0],'Since 1992, a goalkeeper may not pick up the ball when a team-mate deliberately kicks it back to them.');
 const hist=C.HISTORY.map(h=>h.text).join(' ');
 for(const f of ['2.21 goals a game','Packie Bonner','almost six minutes','indirect free kick','1997','throw-in','eight seconds','corner kick','header'])assert.ok(hist.includes(f),`history mentions ${f}`);
 assert.match(hist,/is said to have held the ball for almost six minutes/,'the Bonner line keeps its hedge');assert.ok(C.EXTRA_SOURCES.some(s=>/balls\.ie/.test(s.url)));
 const urls=[...ex.sources,...C.EXTRA_SOURCES].map(s=>s.url);
 for(const u of ['https://en.wikipedia.org/wiki/Back-pass_rule','https://www.theifab.com/laws/latest/fouls-and-misconduct/','https://en.wikipedia.org/wiki/1990_FIFA_World_Cup','https://en.wikipedia.org/wiki/Packie_Bonner'])assert.ok(urls.includes(u),'cited: '+u);
 assert.ok(C.EXTRA_SOURCES.some(s=>/skysports\.com/.test(s.url)&&/eight-second/i.test(s.title)));
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/HISTORY\.map/);assert.match(exp,/HISTORY\[0\]\.text/);assert.match(exp,/HISTORY\[1\]\.text/);
 assert.match(C.FICTION_NOTE,/games we made/);assert.match(exp,/FICTION_NOTE/);
 assert.equal(C.CALLS.length,4);for(const c of C.CALLS)assert.ok(c.answer>=0&&c.answer<c.options.length&&c.why.length>20);assert.equal(C.CALLS[1].options[C.CALLS[1].answer],'Yes','a header may be caught');
 assert.match(exp,/CALLS\.map/,'every ref’s call is in the room’s story');
 console.log('PASS content: case facts, sourced history (Bonner hedged), the ref’s calls, fiction labelled');}

// 2. The laws (board.ts: 1990; pressRules.ts: 1992).
{const P=B.play;let g=B.newGame('1990');g=P(g,'kickBack');assert.equal(g.step,'held');for(let i=0;i<200&&g.step!=='fullTime';i++)g=B.hold(g,1);
 assert.equal(g.step,'fullTime');assert.ok(g.held>=100&&B.flowWord(g.crowd)==='stopped','1990: holding kills the clock and the football');
 let n=P(B.newGame('1992'),'kickBack');assert.equal(n.step,'feet');assert.equal(B.hold(n,30),n,'1992: no holding a kicked back-pass');assert.equal(P(n,'pickUp').step,'freeKick');
 for(const seed of [1,2,3,42,999]){const rs=R.rallies(seed);assert.equal(rs.length,R.BALLS);assert.equal(rs[0].kind,'kick');assert.notEqual(rs[0].marked,'both');
  assert.ok(rs.filter(r=>r.kind==='head').length>=2);assert.ok(rs.some(r=>r.kind==='head'&&r.marked==='both'));assert.ok(rs.some(r=>r.kind==='kick'&&r.marked==='both'));}
 const Kk={kind:'kick',marked:'L'},H={kind:'head',marked:'R'},KB={kind:'kick',marked:'both'};
 assert.equal(R.resolve(Kk,'R'),'pass');assert.equal(R.resolve(Kk,'L'),'intercepted');assert.equal(R.resolve(Kk,'hands'),'freeKick');assert.equal(R.resolve(H,'hands'),'catch');assert.equal(R.resolve(KB,'long'),'long');
 assert.equal(R.pointsFor('pass',0,0,3000),150);assert.equal(R.pointsFor('pass',0,null,3000),100,'turn-based: no speed bonus');assert.equal(R.pointsFor('freeKick',3,0,3000),-50);
 assert.match(R.BEST_KEY,/^fi2-museum-backpass-press-best$/,'the best-score progress key is unchanged');
 console.log('PASS laws: 1990 holding kills the clock; 1992 feet only, headers caught, free kick for hands; eight balls with every teaching case');}

// 3. The iso match moment plays both rounds end to end.
{// Round 1: kick it back, hold, the clock runs out; their 9 stands off (no tackle).
 const s=M.newBP('r1');assert.ok(M.kickBack(s));M.settle(s);assert.equal(s.game.step,'held');assert.ok(s.inHands,'the keeper picks it up');
 s.holding=true;for(let i=0;i<30*14&&s.game.step!=='fullTime';i++)M.stepBP(s,1/30);s.holding=false;
 assert.equal(s.game.step,'fullTime','about '+Math.round(B.CLOCK_END/B.HOLD_RATE)+' s of holding runs out the clock');assert.ok(M.SPOT.K.x+3<s.want.S.x||s.game.step==='fullTime');
 {const t=M.newBP('r1');M.kickBack(t);M.settle(t);M.stepBP(t,1/30);assert.ok(Math.hypot(t.want.S.x-t.pos.K.x,t.want.S.y-t.pos.K.y)>3,'1990: their 9 may not tackle the keeper');}
 {const t=M.newBP('r1');M.kickBack(t);M.settle(t);M.rollOut(t);M.settle(t);assert.equal(t.game.step,'start');assert.ok(M.kickBack(t),'roll it out and do it again');}
 // Round 2: eight balls; the right choice every time gets the best score; doing nothing lets their 9 steal it.
 const right=r=>r.kind==='head'?'hands':r.marked==='both'?'long':R.free(r);
 const p=M.newBP('r2',42);for(let n=0;n<8;n++){for(let i=0;i<200&&p.phase!=='decide'&&p.phase!=='over';i++)M.stepBP(p,1/30);if(p.phase==='over')break;
  const o=M.decide(p,right(R.current(p.press)));assert.ok(['pass','catch','long'].includes(o),'the right call works: '+o);for(let i=0;i<60&&p.phase==='outcome';i++)M.stepBP(p,1/30);}
 for(let i=0;i<200&&p.phase!=='over';i++)M.stepBP(p,1/30);assert.equal(p.phase,'over');assert.equal(p.press.log.length,8);assert.ok(p.press.score>=1500,'perfect, quick play: '+p.press.score);
 const slow=M.newBP('r2',42);for(let i=0;i<30*6&&slow.press.log.length<1;i++)M.stepBP(slow,1/30);assert.equal(slow.press.log[0].outcome,'stolen','too slow: their 9 takes it');
 {const w=M.newBP('r2',42);for(let i=0;i<60&&w.phase!=='decide';i++)M.stepBP(w,1/30);const r=R.current(w.press);if(r.kind==='kick')assert.equal(M.decide(w,'hands'),'freeKick','hands on a kicked one: free kick');}
 // Reduced motion: turn-based (no deadline, no speed bonus), each move lands at once.
 const q=M.newBP('r2',42,true);M.settle(q);assert.equal(q.phase,'decide');for(let i=0;i<100;i++)M.stepBP(q,1/30);assert.equal(q.phase,'decide','their 9 never arrives');
 M.decide(q,right(R.current(q.press)));M.settle(q);assert.equal(q.phase,'decide');assert.equal(q.press.log[0].ms,null);assert.equal(q.press.log[0].points,100);
 // Aim by drag: toward a team-mate picks them; up the pitch is long; a tiny drag is nothing.
 const a=M.newBP('r2',1);assert.equal(M.aimFrom(a,a.pos.L),'L');assert.equal(M.aimFrom(a,a.pos.R),'R');assert.equal(M.aimFrom(a,{x:12,y:M.MID+.6}),'long');assert.equal(M.aimFrom(a,{x:M.SPOT.K.x+.5,y:M.SPOT.K.y}),null);
 console.log('PASS match moment: 1990 hold runs out the clock (no tackle, roll out and repeat); 1992 eight balls end to end, too slow = stolen, hands = free kick; reduced = turn-based');}

// 4. The bench draws: the clock box shows the match time, the fans nod off, the keeper's ring is the law, a tap finds the keeper.
{for(const [w,h] of [[1392,734],[358,616]]){const P=SC.cameraFor(w,h);
  const s=M.newBP('r1');M.kickBack(s);M.settle(s);const t=M.newBP('r2',3);for(let i=0;i<40&&t.phase!=='decide';i++)M.stepBP(t,1/30);
  for(const st of [s,t]){const parts=SC.benchParts(st,P);assert.ok(parts.filter(p=>p.kind==='solid').length>=20,'a detailed bench');
   const a=SC.actorItems(st,P,st.mode==='r2'?{x:6,y:1}:null);assert.ok(a.items.length>60);
   const K0=a.figs.find(f=>f.id==='K'),c=K.iso([K0.x,K0.y,90],P);assert.equal(SC.figureAt(a.figs,P,c[0],c[1],30),'K','the keeper is tappable (hands)');assert.ok(c[0]>0&&c[0]<w&&c[1]>0&&c[1]<h,'keeper on the card');
   const f=SC.floorAt(P,...K.iso([700,400,0],P));assert.ok(Math.abs(f.x-7)<1e-6&&Math.abs(f.y-4)<1e-6,'a drag maps back to the floor (m)');}
  const r=SC.actorItems(t,P,null).ring;assert.ok(r,'the law ring under the keeper');assert.equal(r.ok,M.newBP('r2',3)&&require('../'+dir+'pressRules.ts').current(t.press).kind==='head');
  s.game={...s.game,clock:B.CLOCK_END};assert.ok(SC.benchParts(s,P).some(p=>p.kind==='text'&&p.text==='90:00'&&p.ink==='accent'),'the stadium clock shows 90:00 in the accent at full time');
  const awake=SC.benchParts(M.newBP('r1'),P),z={...M.newBP('r1')};z.game={...z.game,crowd:0};const asleep=SC.benchParts(z,P);
  assert.notDeepEqual(JSON.stringify(awake.find(p=>p.kind==='items')),JSON.stringify(asleep.find(p=>p.kind==='items')),'the fans nod off as the football stops');}
 console.log('PASS bench: anatomy kit at desktop and phone sizes; the clock, the sleepy stand, the law ring; tap and drag map to the world');}

// 5. Style, fill-screen layout and contract.
{const all=exp+css+model+scene;assert.doesNotMatch(all,/pixeliso|PixelStage|Press Start|Pixelify|#000048|Mega ?Drive|--arcade/i,'no pixel kit, fonts or dark cabinet');assert.match(scene,/from '\.\.\/anatomy\/iso-kit'/);
 assert.match(pcss,/\.screen\{[^}]*height:100dvh[^}]*grid-template-rows:auto minmax\(0,1fr\) auto/,'play screen = 100dvh');assert.match(exp,/viewBox=\{`0 0 \$\{box\.w\} \$\{box\.h\}`\}/,'viewBox = the card size');
 assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<Room id="backpass-1992"/);assert.match(paper,/data-museum-experience=\{id\}/);assert.match(paper,/role="dialog" aria-modal="true"/);
 assert.match(paper,/<ExperienceBack onClose=\{onClose\}\/>/);assert.match(paper,/e\.key==='Escape'/);
 for(const h of ["'data-phase'","'data-step'","'data-score'","'data-clock'","'data-result'","'data-kind'","'data-marked'",'data-bp-kickback','data-bp-hold','data-bp-rollout','data-bp-to-rule','data-bp-start-press','data-bp-choice','data-museum-own-cue'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/<StepCheck items=\{\[CHECK\]\}/);assert.match(exp,/<Ending reached onComplete=\{finish\}/);
 assert.equal((exp.match(/onComplete\?\.\(\)/g)||[]).length,1);assert.match(exp,/if\(!completed\.current\)\{completed\.current=true;onComplete\?\.\(\);\}/);
 assert.match(exp,/localStorage\.getItem\(BEST_KEY\)/);assert.match(exp,/try\{localStorage\.setItem/);
 assert.match(css,/\.hold\{[^}]*min-height:58px[^}]*-webkit-touch-callout:none/,'the HOLD button owns its long press');
 assert.match(exp,/if\(e\.detail!==0&&!armed\.current\)return;/,'the finger still on Hold at full time does not skip the next step');
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/backpass-1992/page.tsx')));
 console.log('PASS style + contract: anatomy Paper, no pixel kit, fills 100dvh, Back/Escape, data hooks, onComplete once after the check, best-score key');}

// 6. Heat.
{assert.doesNotMatch(exp+model+scene,/requestAnimationFrame|setInterval/);assert.match(exp,/useFrames\(/);assert.match(paper,/export \{useFrames\} from '\.\/paper-loop'/);assert.match(loopSrc,/IntersectionObserver/);
 const s=M.newBP('r1');assert.equal(M.stepBP(s,1/30),false,'nothing moves at rest');M.kickBack(s);M.settle(s);assert.equal(M.stepBP(s,1/30),false,'the keeper holding (no finger) is still');
 assert.match(exp,/const go=\(\)=>\{if\(reduced\)\{settle\(st\.current\)/,'reduced motion: every move lands at once');assert.match(exp,/holdFor\(st\.current,STEP_HOLD\/10\)/,'reduced motion: a Hold tap = 15 match seconds');
 console.log('PASS heat: one sleeping loop, nothing moves at rest; reduced motion resolves at once');}
