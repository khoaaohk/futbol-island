// hall-of-fame · Your Hall of Fame (Oct 5 2026; Oct 10 2026 Legends Arena game; Oct 12 2026 anatomy restyle: an isometric
// tabletop pitch in the Paper theme from the shared kit in components/museum/experiences/anatomy, one accent; no pixel art).
// Checks: the host contract (shared ExperienceBack, Escape after the certificate, certificates via the host, onComplete once at
// the real end through the shared Ending), the case's facts word for word and every legend's sourced fact, the six games played
// in Node (each can be won perfectly, and each fails early / late for the reason it teaches), the boards (every game's pieces
// on its board, the board fills the stage at desktop and phone sizes, the screen → floor inverse), no pixeliso anywhere, the
// fill-screen first screen, heat (one sleeping loop, cancelled on unmount; no rAF elsewhere), reduced motion, CSS rules.
// usage: node tests/museum-exp-hall-of-fame.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const Module=require('node:module'),root=path.join(__dirname,'..'),dir='components/museum/experiences/hall-of-fame/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const resolve=Module._resolveFilename;Module._resolveFilename=function(req,...a){return resolve.call(this,req.startsWith('@/')?path.join(root,req.slice(2)):req,...a);};
const files=fs.readdirSync(path.join(root,dir)),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const exp=src['Experience.tsx'],arenaUi=src['Arena.tsx'],yours=src['YourHall.tsx'],css=src['Experience.module.css'],rulesSrc=src['arenaRules.ts'],loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');
const L=require('../'+dir+'legends.ts'),A=require('../'+dir+'arenaRules.ts'),B=require('../'+dir+'board.ts'),PL=require('../'+dir+'plinths.ts'),H=require('../'+dir+'hallData.ts');
const K=require('../components/museum/experiences/anatomy/iso-kit.ts'),X=require('../lib/endgame/museum.ts'),paths=require('../lib/paths/formatPaths.json'),M=require('../lib/endgame/graduationModel.ts');
const ex=X.EXHIBITS.find(e=>e.id==='hall-of-fame');
const all=Object.entries(src).filter(([f])=>/\.(tsx?|css)$/.test(f)).map(([,s])=>s).join('\n');

// 1. Contract: fixed dialog, shared Back, Escape after the host's certificate, certificates via the host, onComplete once.
{assert.match(exp,/export default function Experience/);assert.match(exp,/data-museum-experience="hall-of-fame"/);assert.match(exp,/role="dialog" aria-modal="true"/);
 assert.match(css,/\.root\{position:fixed;inset:0;z-index:20/);
 assert.match(exp,/import ExperienceBack from '\.\.\/ExperienceBack'/);assert.match(exp,/<ExperienceBack onClose=\{onClose\}\/>/);assert.doesNotMatch(all,/NavigationButton|immediate/);
 assert.match(exp,/e\.key!=='Escape'/);assert.match(exp,/dialog\[open\]/,'Escape lets the host certificate close first');assert.match(exp,/removeEventListener\('keydown'/);
 assert.match(yours,/openCert\(`grad:\$\{p\.format\}`\)/,'plinths open the host certificates');assert.match(yours,/openCert\('diploma'\)/,'the champion opens the Island Diploma');
 assert.match(exp,/const complete=useCallback\(\(\)=>\{if\(completed\.current\)return;completed\.current=true;onComplete\?\.\(\);\}/,'onComplete fires once');
 assert.match(exp,/<Arena onDone=\{complete\}\/>/);
 assert.match(arenaUi,/<Ending reached onComplete=\{onDone\}/,'the shared Ending, mounted only at the real end, marks the visit');
 assert.doesNotMatch(arenaUi.replace(/\/\*[\s\S]*?\*\//g,''),/onDone\(\)/,'onDone is never called directly: only the Ending fires it');
 assert.match(arenaUi,/view==='final'&&<div/,'the Ending lives in the final view, after the quick check');assert.match(arenaUi,/onDone=\{sc=>\{setFirstRight\(sc\);setView\('final'\)/);
 assert.match(arenaUi,/import StepCheck,\{type CheckItem\} from '\.\.\/modern\/StepCheck'/);assert.match(exp,/import WallLabel from '\.\.\/modern\/WallLabel'/);
 for(const h of ['data-hof-arena','data-hof-game','data-hof-legend','data-hof-phase','data-hof-result','data-hof-score','data-hof-menu','data-hof-next','data-hof-partner','data-hof-final','data-hof-kickoff','data-hof-wait','data-hof-check-done','data-hof-stage','data-hof-readout','data-hof-start'])assert.ok(arenaUi.includes(h),'hook '+h);
 for(const h of ['data-hof-yours','data-hof-plinth','data-hof-cert','data-hof-idea','data-hof-ferry'])assert.ok(yours.includes(h),'hook '+h);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/hall-of-fame/page.tsx')),'the museum-lab preview route');
 for(const gone of ['scene.ts','trophy.ts','Print.tsx','Challenge.tsx'])assert.ok(!files.includes(gone),'old file removed: '+gone);
 console.log('PASS contract: fixed dialog, shared Back, Escape after certificates, host certificates, onComplete once via the Ending after the quick check, hooks, lab route');}

// 2. Content: the case's words, sourced counts, real lessons, the legends' sourced facts.
{assert.equal(H.COPY.fact1,ex.facts[0]);assert.equal(H.COPY.fact2,ex.facts[1]);assert.equal(H.COPY.takeaway,ex.forYourGame);
 assert.match(exp,/\{COPY\.fact1\}/);assert.match(yours,/\{COPY\.fact2\}/);assert.match(yours,/\{COPY\.takeaway\}/);assert.match(exp,/\{COPY\.gameNote\}/);
 assert.deepEqual(H.PLINTHS.map(p=>p.format),[...M.GRADUATION_FORMATS]);assert.deepEqual(H.PLINTHS.map(p=>p.aSide),[5,7,9,11]);
 const starter=Object.fromEntries(paths.map(p=>[p.format,new Set(p.chapters.flatMap(c=>c.lessons.map(l=>l.id)))]));
 for(const i of H.IDEAS)for(const f of M.GRADUATION_FORMATS)assert.ok(starter[f].has(i.lessons[f]),`${i.id}: ${f} lesson is a starter lesson`);
 assert.ok(H.SOURCES.map(s=>s.url).includes('https://www.theifab.com/laws/latest/the-players/'));assert.match(exp,/\[\.\.\.SOURCES,\.\.\.LEGEND_SOURCES\]\.map/);assert.match(exp,/<summary>Sources/);
 assert.equal(H.ferryLine(1),'1 of 4 paths graduated. Graduate 3 more to board the Matchday Ferry.');
 const players=require('../lib/town/positionPlayers.json'),roleOf={Goalkeeper:'goalkeeper','Right-back':'fullback','Centre-back':'centerback',Midfielder:'midfielder',Winger:'winger',Striker:'striker'};
 assert.equal(L.LEGENDS.length,12);assert.equal(L.POSITIONS.length,6);
 for(const p of L.POSITIONS){assert.equal(p.legends.length,2);assert.deepEqual(p.legends.map(l=>l.game).sort(),['men','women'],p.position+': a woman and a man');assert.ok(A.GAME_OF[p.position],p.position+' has a game');}
 assert.deepEqual(L.POSITIONS.map(p=>p.legends[0].game),['men','women','men','women','men','women'],'pairs alternate which game comes first');
 for(const l of L.LEGENDS){assert.ok([...players[roleOf[l.position]].allTime,...players[roleOf[l.position]].current].includes(l.card),l.name+' is a card in the game');
  assert.match(l.source.url,/^https:\/\/en\.wikipedia\.org\/wiki\//);assert.ok(l.fact.length<120&&/\d{4}|\d+ goals/.test(l.fact),l.name+' fact is one dated line');
  assert.ok(!('kit' in l)&&!('skin' in l)&&!('hair' in l),l.name+': no pixel kit, skin or hair');}
 assert.match(src['legends.ts'],/Lev Yashin is still the only goalkeeper to win the Ballon d’Or, in 1963/);assert.match(src['legends.ts'],/1994, 1998 and 2002/);assert.match(src['legends.ts'],/17 goals at Women’s World Cups/);
 assert.match(arenaUi,/\{legend\.fact\} <a className=\{s\.src\} href=\{legend\.source\.url\}/,'each plaque shows the fact with its source');
 assert.ok(L.QUIZ.length===4&&new Set(L.QUIZ.map(q=>q.choices.indexOf(q.position))).size>1,'quick check rounds, the answer moves');
 assert.match(L.STYLE_NOTES,/not a claim about what that legend wore/);assert.match(L.STYLE_NOTES,/Nobody is drawn as a likeness/);assert.doesNotMatch(L.STYLE_NOTES,/pixel/i);
 console.log('PASS content: case facts word for word, real lessons, 12 sourced legends (a woman and a man per position), no likenesses');}

// 3. The games: every position's job, played in Node. Perfect when timed/aimed right; early/late/miss with the reason.
{const play=(game,seed,script)=>{const a=A.newAttempt(game,seed);A.act(a,game==='overlap'?{kind:'press'}:game==='beat'?{kind:'fake'}:{kind:'tap',p:{x:0,y:0}});assert.equal(a.phase,'live',game+' starts');
  for(let i=0;i<900&&A.moving(a);i++){script(a);A.step(a,1/30);}assert.ok(a.res,game+' resolves');assert.equal(a.phase,'done');return a.res;};
 const aimFrom=(from,to,p)=>{const d={x:to.x-from.x,y:to.y-from.y},L2=Math.hypot(d.x,d.y),P=.3+p*3.6;return {x:-d.x/L2*P,y:-d.y/L2*P};};
 const g=(r)=>r.grade;
 for(const s of [1,2,3,4])assert.equal(g(play('save',s,a=>{if(a.t>a.g.strikeAt+.05&&!a.g.dive)A.act(a,{kind:'tap',p:{x:0,y:a.g.ty}});})),'perfect','save seed '+s);
 const early=play('save',1,a=>{if(a.t>.2&&!a.g.dive)A.act(a,{kind:'tap',p:{x:0,y:a.g.ty}});});assert.equal(early.grade,'early');assert.match(early.why,/other corner/);
 assert.equal(g(play('save',1,a=>{if(a.t>a.g.strikeAt+.8&&!a.g.dive)A.act(a,{kind:'tap',p:{x:0,y:a.g.ty}});})),'late');
 assert.equal(g(play('save',2,()=>{})),'late','no dive: the goal goes in');
 const over=x=>play('overlap',1,a=>{if(a.g.got&&a.g.x<x)A.act(a,{kind:'release'});});
 assert.equal(g(over(5)),'perfect');assert.equal(g(over(10)),'early');assert.equal(g(over(-1)),'late');assert.ok(A.good(g(over(7.5))));
 assert.equal(g(play('overlap',1,a=>{if(a.t>.3)A.act(a,{kind:'release'});})),'early','stopping before the pass');
 const lane=A.uv(9,1);
 assert.equal(g(play('intercept',1,a=>{if(a.g.movedAt==null&&a.t>a.g.passAt-.3)A.act(a,{kind:'tap',p:lane});})),'perfect');
 const ie=play('intercept',1,a=>{if(a.g.movedAt==null&&a.t>.3)A.act(a,{kind:'tap',p:lane});});assert.equal(ie.grade,'early');assert.match(ie.why,/saw you/);
 assert.equal(g(play('intercept',1,a=>{if(a.g.movedAt==null&&a.t>a.g.passAt+.6)A.act(a,{kind:'tap',p:lane});})),'late');
 const thr=off=>play('through',1,a=>{if(a.g.passAt==null&&a.t>a.g.runAt+off)A.act(a,{kind:'fling',pull:aimFrom(A.uv(4.7,.3),A.uv(17,2.5),(Math.hypot(...Object.values(A.uv(17-4.7,2.5-.3)))-7)/15)});});
 assert.equal(g(thr(0)),'perfect');assert.equal(g(thr(1.2)),'late');assert.equal(g(play('through',1,()=>{})),'late','no pass: the run is over');
 const beat=t=>play('beat',1,a=>{if(a.t>t&&a.g.burstAt==null)A.act(a,{kind:'burst'});});
 assert.equal(g(beat(.55)),'perfect');assert.equal(g(beat(.1)),'early');assert.equal(g(beat(1.2)),'late');
 assert.ok(A.leanAt([0,.8],1.35)<=.5,'a second fake gets half the lean');assert.equal(A.leanAt([0],.6),1);assert.equal(A.leanAt([0],1.4),0);
 const fin=(ty,p,at)=>play('finish',1,a=>{if(!a.g.shot&&a.t>at)A.act(a,{kind:'fling',pull:aimFrom(A.FIN.ball,{x:0,y:ty},p)});});
 assert.equal(g(fin(3,.5,.3)),'perfect');assert.match(fin(3,.95,.3).why,/Over/);assert.match(fin(5,.5,.3).why,/Wide/);assert.match(fin(3,.5,3).why,/Tackled/);assert.match(fin(-.3,.3,2).why,/Saved/);
 assert.ok(A.keeperReach(1.4,0)>A.keeperReach(0,0)&&A.keeperReach(1.4,1)<A.keeperReach(1.4,0));assert.ok(A.shotHeight(.82)>2.44-.11&&A.shotHeight(.75)<2.33);
 assert.equal(A.POINTS.perfect,100);assert.equal(A.roundScore([{points:100},{points:70},{points:0}]),170);assert.equal(A.stars(250),3);assert.equal(A.stars(170),2);assert.equal(A.stars(0),0);
 assert.deepEqual(A.sanitizeBests({yashin:180,pele:'x',nope:5,cafu:999},L.LEGENDS.map(l=>l.id)),{yashin:180,cafu:300},'bests: known legends, numbers, capped');
 assert.equal(A.BEST_KEY,'fi2-museum-hof-arena-v1');assert.match(arenaUi,/try\{localStorage\.setItem\(BEST_KEY/);
 assert.deepEqual(A.newAttempt('save',7).g,A.newAttempt('save',7).g);
 console.log('PASS games: save, overlap, intercept, through ball, 1-v-1 and finish each play perfect on time, and fail early/late/miss with the reason');}

// 4. Anatomy style and fill-screen: the shared kit, no pixel kit, boards fill the stage, pieces on their boards, taps invert.
{assert.doesNotMatch(all,/pixeliso|PixelStage|Pixmap|PK Press Start|PK Pixelify|#000048|#000024/i,'no pixel kit, pixel fonts or dark pixel grounds');
 assert.doesNotMatch(all,/components\/bits|from '\.\.\/\.\.\/bits/,'no React Bits');
 assert.match(src['board.ts'],/from '\.\.\/anatomy\/iso-kit'/);assert.match(src['Draw.tsx'],/from '\.\.\/anatomy\/draw'/);assert.match(exp,/<style dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}\/>/);
 assert.match(css,/--anatomy-paper:#f7f7f3/);assert.match(css,/--card:#e0e0db/);assert.match(css,/--accent:#e4322b/,'one accent: red');
 // the first screen is the game: 100dvh, the card flexes to fill it
 assert.match(css,/\.screen\{[^}]*height:100dvh/);assert.match(css,/\.card\{position:relative;flex:1 1 auto;min-height:0/);assert.match(css,/\.stage\{position:absolute;inset:0\}/);
 assert.match(arenaUi,/viewBox=\{`0 0 \$\{size\.w\} \$\{size\.h\}`\}/,'the pitch SVG is the stage, pixel for pixel');
 const games=['save','overlap','intercept','through','beat','finish'];
 for(const [w,h] of [[1400,690],[1805,900],[366,520],[740,700]])for(const game of games){const {plan,P}=B.fitBoard(game,w,h);
  const corners=K.boxCorners(plan,-B.PLATE-B.FOOT,0).map(p=>K.iso(p,P)),xs=corners.map(p=>p[0]),ys=corners.map(p=>p[1]);
  const bw=Math.max(...xs)-Math.min(...xs),bh=Math.max(...ys)-Math.min(...ys);
  assert.ok(bw>=w*.6||bh>=h*.75,`${game} ${w}×${h}: the board fills the stage (${Math.round(bw)}×${Math.round(bh)})`);
  const a=A.newAttempt(game,3);for(const p of B.gamePoints(a)){const [X,Y]=B.toRender(game,p);
   assert.ok(X>plan.x&&X<plan.x+plan.w&&Y>plan.y&&Y<plan.y+plan.d,`${game}: ${JSON.stringify(p)} is on the board`);
   const [sx,sy]=K.iso([X,Y,B.TOP],P);if(w<h)continue;assert.ok(sx>0&&sx<w&&sy>0&&sy<h,`${game} ${w}×${h}: piece in view`);
   const back=B.fromRender(game,...B.floorAt(P,sx,sy));assert.ok(Math.hypot(back.x-p.x,back.y-p.y)<1e-6,`${game}: a tap maps back to the floor`);}}
 // on a phone the action area is framed: the pieces stay big
 {const {P}=B.fitBoard('save',366,520),k=K.cameraOf(P).k;assert.ok(k>=18,'phone: at least 18 px a metre on the pitch ('+k.toFixed(1)+')');}
 for(const game of games){const {plan,P}=B.fitBoard(game,1400,690);const items=B.boardItems(game,plan,P);assert.ok(items.filter(i=>i.k==='solid').length>=12,game+': a detailed model (feet, plate, ruler, label plate…)');}
 assert.ok(B.goalFront(B.fitBoard('save',1400,690).P).length>=6,'posts and crossbar segments sort with the pieces');
 const runs=B.clipRuns([[-100,0],[100,0]],{x:-5,y:-5,w:10,d:10,r:0});assert.equal(runs.length,1);assert.deepEqual(runs[0].map(p=>Math.round(p[0]*1e4)/1e4),[-5,5],'engraved lines end exactly on the surface edge');
 for(const k of ['stand','diveL','diveR'])assert.ok(B.piece(B.fitBoard('save',800,600).P,k).length>=2,'piece '+k);
 assert.ok(PL.coverScene(800,500).groups.length>=13&&PL.hallScene(800,400,[true,false,true,false],0).groups.length>=7,'the cover and Your Hall are built from plinths, pieces and cups');
 assert.match(arenaUi,/hof-\$\{ac\.team\}/);assert.match(css,/:global\(\.hof-opp\)/,'the other team is graphite');
 console.log('PASS anatomy and fill-screen: shared kit, no pixel art, every board fills the stage at desktop and phone sizes, pieces on their boards, taps invert');}

// 5. Heat, input and reduced motion.
{assert.ok(!/requestAnimationFrame|setInterval/.test(all),'no rAF or polling in the exhibit: the shared Paper loop only');
 assert.match(arenaUi,/import \{useFrameLoop\} from '\.\.\/anatomy\/paper-loop'/,'the one shared loop (anatomy/paper-loop.ts)');
 assert.match(loopSrc,/else\{wanted=false;last=0;\}/,'the loop stops when nothing moves');assert.match(loopSrc,/IntersectionObserver/,'parks off-screen');assert.match(loopSrc,/visibilitychange/);
 assert.match(loopSrc,/l\.dispose\(\)/,'cancelled on unmount');assert.match(loopSrc,/reduced\|\|!raf/,'reduced motion: runs to rest at once');
 assert.match(arenaUi,/useFrameLoop\(dt=>\{const a=att\.current,had=!!a\.res;step\(a,dt\);if\(!had&&a\.res\)resolved\(\);redraw\(\);return moving\(a\);\},stageRef,reduced\)/);
 assert.ok(!/useFrameLoop/.test(yours),'Your Hall has no loop');
 assert.match(rulesSrc,/export const moving=\(a:Att\)=>a\.phase==='live'\|\|\(a\.phase==='done'&&a\.t<a\.tDone\+SETTLE\)/);
 {const a=A.newAttempt('save',1);assert.equal(A.moving(a),false,'a try at the ready line needs no frames');A.step(a,1);assert.equal(a.t,0);}
 assert.match(arenaUi,/const wait=\(\)=>\{const a=att\.current;if\(a\.phase!=='live'\)return;/);assert.match(arenaUi,/\{reduced&&live&&<button type="button" className=\{s\.ghost\} data-hof-wait onClick=\{wait\}>Wait<\/button>\}/);
 assert.match(arenaUi,/if\(!reduced\|\|decided\|\|a\.res\)loop\.wake\(\)/);
 assert.match(arenaUi,/setPointerCapture/);for(const h of ['data-hof-dive="left"','data-hof-fake','data-hof-burst','data-hof-step','data-hof-fling','data-hof-run'])assert.ok(arenaUi.includes(h),h);
 assert.match(arenaUi,/<button key="next"/,'the button after a hold is a new element (the hold\'s click can\'t skip a try)');
 const cssNo=css.replace(/\/\*[\s\S]*?\*\//g,'');assert.doesNotMatch(cssNo,/infinite/);assert.match(cssNo,/prefers-reduced-motion:reduce/);
 assert.match(cssNo,/\.btn,\.ghost,\.holdBtn,\.chargeBtn\{min-height:48px/);assert.match(cssNo,/\.chip\{min-height:44px/);assert.match(cssNo,/\.legendBtn\{[^}]*min-height:48px/);
 for(const sel of cssNo.replace(/@(media|supports|keyframes)[^{]*\{/g,'').match(/(^|\})\s*[^@{}][^{}]*\{/g)??[])for(const part of sel.replace(/^\}?\s*/,'').replace(/\{$/,'').split(','))
  if(!/^(from|to|\d+%)$/.test(part.trim()))assert.match(part,/\.[a-zA-Z]/,'every CSS module selector has a local class: '+part.trim());
 console.log('PASS heat and input: one sleeping loop (none in Your Hall), nothing moves at rest, turn-based reduced motion, buttons for every move, CSS rules');}
