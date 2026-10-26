// Island Strikers Oct 25 2026 upgrade (docs/ARCADE_STRIKERS_UPGRADE_OCT25.md): portrait play, goal call-outs, celebration
// choreography, full-time outro, arena dressing and the new sound layers.
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict');
const load=file=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math,require:()=>({})});return m.exports;};
const C=load('lib/arcade/strikerCelebrate.ts'),M=load('lib/arcade/strikerMatch.ts');
const read=f=>fs.readFileSync(f,'utf8'),scene=read('lib/arcade/strikerScene.ts'),ui=read('components/LiveArcadeMatch.tsx'),css=read('components/LiveArcadeMatch.module.css'),audio=read('lib/arcade/strikerAudio.ts');

// Goal celebration roles.
{const P=M.STRIKER_GOAL_PAUSE,c=C.strikerCelebration;
 assert.equal(c('scorer',.4,true,0,P).type,'airplane');
 assert.equal(c('scorer',1.2,true,0,P).type,'thankPasser','assisted goal: the scorer thanks the passer');
 assert.equal(c('scorer',1.2,false,0,P).type,'kneeSlide','solo goal keeps the knee slide');
 assert.equal(c('assister',.5,true,1,P),null);assert.equal(c('assister',1,true,1,P).type,'highFive');
 assert.equal(c('mate',.8,true,2,P),null,'mates are staggered');assert.equal(c('mate',1.3,true,2,P).type,'fistBump');
 for(const t of [0,.5,1,1.5,P]){const r=c('scorer',t,true,0,P);assert(r.progress>=0&&r.progress<=1);}
 assert.equal(c('scorer',.1,true,0,P),c('mate',1.5,true,0,P),'one reused result object (no per-frame allocation)');}

// Full-time outro.
{const o=C.strikerOutroPose;
 assert.equal(o(1,false,false,0,1,0).reaction,'dejected','losers drop their heads');
 assert.equal(o(0,false,true,0,.5,0).skill,'airplane');assert.equal(o(0,false,true,0,2,0).skill,'kneeSlide');
 assert.equal(o(0,true,false,0,1,3).skill,'','winning keeper just celebrates');assert(o(0,true,false,0,1,3).celebrate>0);
 assert.equal(o(0,false,false,0,1.4,1).skill,'highFive');
 assert.equal(o(1,false,false,-1,1.2,1).skill,'fistBump','a draw ends in fist bumps');
 const players=[0,1,2,3,4,5,6,7].map(id=>({id,team:id<4?0:1,keeper:id%4===3}));
 assert.equal(C.strikerOutroStar(players,[0,2,1,0,0,0,0,0],0),1,'top scorer is the star');
 assert.equal(C.strikerOutroStar(players,[0,0,0,0,0,0,0,0],1),4);assert.equal(C.strikerOutroStar(players,[],-1),-1);
 assert(C.STRIKER_OUTRO>=2&&C.STRIKER_OUTRO<=3,'outro stays short (heat)');}

// Goal call-outs.
{const h=M.strikerGoalHeadline;
 assert.equal(h({team:0,score:[2,0],scorerGoals:2,left:90}),'brace');
 assert.equal(h({team:0,score:[3,1],scorerGoals:3,left:90}),'hattrick');
 assert.equal(h({team:0,score:[1,1],scorerGoals:1,left:90}),'equaliser');
 assert.equal(h({team:0,score:[2,1],scorerGoals:1,left:30}),'goahead');assert.equal(h({team:0,score:[2,1],scorerGoals:1,left:100}),'');
 assert.equal(h({team:0,score:[1,0],scorerGoals:1,left:5,golden:true}),'golden');
 for(const k of ['brace','hattrick','equaliser','goahead','golden'])assert(M.STRIKER_HEADLINES[k].title&&M.STRIKER_HEADLINES[k].sub);}

// Sim integration: assister latched, per-player tally, brace on the second goal by the same player.
{const game=M.createStrikerMatch(),s=game.state,input=M.strikerInput();
 const shoot=()=>{const b=s.ball;b.owner=-1;b.lock=0;s.lastKicker=0;s.assister=1;b.x=24.6;b.z=0;b.y=.5;b.vx=14;b.vz=0;b.vy=0;b.lastTeam=0;s.players[7].z=8;s.players[7].x=20;for(let i=0;i<30&&s.goalPause<=0;i++)game.step(1/60,input);};
 shoot();assert.equal(s.score[0],1,'goal scored');assert.equal(s.scorer,0);assert.equal(s.assister,1,'assist latched');assert.equal(s.goalsBy[0],1);
 for(let i=0;i<200&&s.goalPause>0;i++)game.step(1/60,input);
 shoot();assert.equal(s.score[0],2);assert.equal(s.headline,'brace','second goal by the same player is a brace');
 game.reset(true);assert.equal(s.goalsBy[0],0,'tally resets with the match');assert.equal(s.headline,'');}

// Wiring.
assert(!/Turn sideways/.test(ui)&&!/setRotate/.test(ui),'no landscape gate: phones are portrait-only app-wide (RotateLock)');
assert(/@media\(pointer:coarse\) and \(orientation:portrait\)\{/.test(css),'portrait phone layout');
assert(/followOn=follow&&motion;/.test(scene)&&/FOLLOW_ZOOM_PORTRAIT/.test(scene),'portrait follow cam');
assert(/startOutro:/.test(scene)&&/visual\.startOutro\(winner\)/.test(ui)&&/!outroOn&&<div className=\{styles\.overlay\}>/.test(ui),'outro plays before the result card');
assert(/phaseRef\.current==='playing'\|\|visual\.outroing\)frame=requestAnimationFrame/.test(ui),'loop sleeps once the outro ends');
assert(/if\(stage\.reduced\)return 0;/.test(scene),'no outro under reduced motion');
assert(/STRIKER_HEADLINES\[s\.headline\]/.test(ui),'call-out banner');
for(const cue of ['ole','cheer','win','lose','draw'])assert(new RegExp(`case '${cue}':`).test(audio),'audio cue '+cue);
assert(/function groove\(/.test(audio)&&/if\(music\)\{/.test(audio),'groove only with music on');
assert(/STRIKER_PENALTY_X/.test(scene)&&/flags\.push\(flag\)/.test(scene),'arena: penalty spots, corner flags');
console.log('striker-celebrate: ok');
