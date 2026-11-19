// Futbol Tennis, arcade AAA pass (Nov 18 2026). Run: node tests/tennis-aaa.cjs
//  1. Gold Ring: only from a long rally, on six spots, never on the drill, never from the seeded RNG; a hit pays the chain, a point clears it
//  2. Scores stay in the old range: the placing bot of tests/tennis-endless.cjs posts what it posted before; a ring-chasing bot earns a
//     modest bonus and never beats the board's pace guard
//  3. The curve: a careful bot wins the opening match without losing a ball, later matches are harder, and a run always ends
//  4. The winner read (slow-motion only when the rival is beaten) and the line ball
//  5. Wiring: the cues, the won-match call, the score gain tag, the how-to line
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map(),localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const cache=new Map();function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,localStorage,Float32Array,Date,Map,
  require:id=>id.startsWith('@/')?load(path.resolve(ROOT,id.slice(2)+'.ts')):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts'),L=load('lib/arcade/leaderboard.ts'),C=load('lib/arcade/tennisCinema.ts'),B=t.TENNIS_BONUS;
const src=read('lib/games/soccerTennis.ts'),feel=read('lib/arcade/tennisFeel.ts'),audio=read('lib/arcade/tennisAudio.ts'),game=read('lib/arcade/games/tennisGame.ts'),card=read('components/games/TennisCard.tsx'),css=read('components/games/skins/tennis.module.css');
// The two bots. `placer` is the endless test's own bot; `ringer` also goes for the Gold Ring with the touch that reaches its depth.
const serve=s=>{if(s.phase==='serve'&&s.server==='you'&&s.phaseTime>.3)t.requestTennisKick(s,s.kickCount%2?.8:-.8);};
const drillKick=s=>{const sh=t.tennisTargetShot(s);t.requestTennisKick(s,Math.max(-1,Math.min(1,s.targetX/(3.7*(sh==='drop'?.7:1)))),sh);};
const bot=ring=>s=>{serve(s);if(s.phase==='rally'&&s.ball.last==='rival'&&!(s.incomingOut&&!s.ball.bounces)){const l=t.tennisSweetPoint(s);t.setTennisTarget(s,l.x,l.y+.15);if(t.canTennisKick(s,'you')&&!t.tennisShouldWait(s)){
 if(t.tennisCourtOf(s).style==='drill')drillKick(s);else if(ring&&s.bonusOn){const sh=t.tennisBonusShot(s);t.requestTennisKick(s,Math.max(-1,Math.min(1,s.bonusX/(3.7*(sh==='drop'?.7:1)))),sh);}else t.requestTennisKick(s,(t.tennisOpenSide(s)||t.tennisAimSide(s))*.8);}}};
const placer=bot(false),ringer=bot(true);

// 1. Gold Ring.
{assert.deepEqual({...B},{from:4,every:3,points:25,chainMax:3,radius:1});
 const s=t.createTennis(7919,2);t.beginTennis(s);assert.equal(s.bonusOn,false);assert.equal(s.bonusNext,B.from);
 const spots=new Set();let shows=0,early=0,hits=0,paid=0,be=0,cleared=true,chainMax=0;
 for(let i=0;i<60*1500&&s.phase!=='over';i++){const was=s.bonusShows,gain=s.tourScore,value=s.bonusOn?t.tennisBonusValue(s):0,chain=s.bonusChain;ringer(s);t.tickTennis(s,1/60);
  if(s.bonusShows!==was){shows++;if(s.rally<B.from)early++;spots.add(s.bonusX+','+s.bonusY);assert.equal(s.ball.last,'rival','a ring is painted as the rival strikes, so you choose with the ball coming');assert.notEqual(t.tennisBonusShot(s),'');assert(s.bonusY<0&&Math.abs(s.bonusX)<=3.7);}
  if(s.bonusEvents!==be){be=s.bonusEvents;hits++;paid+=s.bonusGain;assert.equal(s.bonusGain,value,'a hit pays what the ring showed');assert(s.tourScore-gain>=s.bonusGain);assert.equal(s.bonusChain,Math.min(B.chainMax,chain+1));assert.equal(s.bonusOn,false);assert(s.bonusNext===s.rally+B.every||s.bonusNext===s.rally-1+B.every,"the next ring waits a few touches");chainMax=Math.max(chainMax,s.bonusChain);}
  if(t.tennisCourtOf(s).style==='drill')assert.equal(s.bonusOn,false,'the drill keeps its own targets');
  if(s.phase==='point'||s.phase==='serve'){if(s.bonusOn)cleared=false;if(s.phase==='serve')assert.equal(s.bonusChain,0);}}
 assert(shows>=10,`rings appear in long rallies (${shows})`);assert.equal(early,0);assert(spots.size>=5,`the ring moves around the six spots (${spots.size})`);assert(hits>=3,`a bot that aims at it hits it (${hits}/${shows})`);assert(hits<shows,'and misses some: it is a real shot');assert(cleared,'a decided point clears the ring');assert(paid>0);
 assert.equal(s.bonusHits,hits);
 // The chain: the 2nd and 3rd ring of one rally pay 2x and 3x, capped.
 const v=t.createTennis(1,1);v.bonusChain=0;const one=t.tennisBonusValue(v);v.bonusChain=1;assert.equal(t.tennisBonusValue(v),one*2);v.bonusChain=2;assert.equal(t.tennisBonusValue(v),one*3);v.bonusChain=9;assert.equal(t.tennisBonusValue(v),one*3);assert(one>0&&one<=B.points,"court 1 pays its own tier scale");
 // Depth names the touch; the lit HUD button follows it.
 assert.equal(t.tennisBonusShot({bonusOn:true,bonusY:t.TENNIS_TARGET_DEPTHS[0]}),'drop');assert.equal(t.tennisBonusShot({bonusOn:true,bonusY:t.TENNIS_TARGET_DEPTHS[1]}),'auto');assert.equal(t.tennisBonusShot({bonusOn:true,bonusY:t.TENNIS_TARGET_DEPTHS[2]}),'lob');assert.equal(t.tennisBonusShot({bonusOn:false,bonusY:-2}),'');
 // The spot is a hash of counters: the rival's play (the seeded RNG) is exactly what it was.
 const spawn=src.split('\n').find(l=>l.includes('s.bonusShows++'));assert(spawn&&!spawn.includes('random('),'the ring never draws from the seeded RNG');
 const a=t.createTennis(42,4),b=t.createTennis(42,4);t.beginTennis(a);t.beginTennis(b);for(let i=0;i<60*240;i++){ringer(a);ringer(b);t.tickTennis(a,1/60);t.tickTennis(b,1/60);}assert.equal(a.tourScore,b.tourScore);assert.equal(a.seed,b.seed);assert.equal(a.bonusHits,b.bonusHits,'a seeded run repeats exactly');
 // Worst-case pace: a top-chain ring at the top combo every `every` rally touches (one and a half exchanges), on top of a golden touch
 // at the top combo every exchange, with an exchange as fast as 2.5 s: still under the board's per-second guard.
 const top=load('lib/arcade/tennisEndless.ts');const row=top.TENNIS_RAMP[top.TENNIS_RAMP_TOP-1].points,scale=top.tennisLadderScale(6);assert((B.points*B.chainMax*4/(B.every/2)+10*4*4)*scale*row/2.5<=L.BOARD_RULES.tennis.perSecond,'ring pace under the per-second guard');}

// 2. Score range (600 s, seeds as measured before the pass: 24913 / 28189 / 27497 on court 1).
{const run=(f,seed,level)=>{const s=t.createTennis(seed,level);t.beginTennis(s);let peak=0,bonus=0,be=0;for(let i=0;i<60*600&&s.phase!=='over';i++){f(s);t.tickTennis(s,1/60);if(s.bonusEvents!==be){be=s.bonusEvents;bonus+=s.bonusGain;}if(s.clock>20&&i%600===0){peak=Math.max(peak,s.tourScore/s.clock);assert.equal(L.scorePlausible('tennis',s.tourScore,s.clock*1000),'ok');}}return{score:s.tourScore,bonus,peak};};
 const before=[24913,28189,27497],seeds=[11,222,3333],now=seeds.map(seed=>run(placer,seed,1));
 now.forEach((r,i)=>assert(Math.abs(r.score-before[i])<=before[i]*.03,`the placing bot posts what it posted before (${r.score} vs ${before[i]})`));
 const chase=seeds.map(seed=>run(ringer,seed,4));
 for(const r of chase){assert(r.bonus>0);assert(r.bonus<r.score*.15,`rings are a bonus, not the score (${r.bonus} of ${r.score})`);assert(r.score>12000&&r.score<34000,`ring chaser in the same range (${r.score})`);assert(r.peak<L.BOARD_RULES.tennis.perSecond/2);}
 console.log(`  placer ${now.map(r=>r.score).join(' / ')} (before ${before.join(' / ')}); ring chaser on court 4 ${chase.map(r=>`${r.score} (+${r.bonus})`).join(' / ')}`);}

// 3. The curve.
{for(const seed of [11,44444]){const s=t.createTennis(seed,1);t.beginTennis(s);let m=1,pp=0,w=0,n=0;const rate=[],lives1=[];
  for(let i=0;i<60*9000&&s.phase!=='over';i++){placer(s);t.tickTennis(s,1/60);if(s.pointsPlayed!==pp){pp=s.pointsPlayed;n++;if(s.pointWinner==='you')w++;}if(s.match!==m){if(m===1)lives1.push(s.tourLives);if(t.tennisCourtOf({level:s.level,tour:0}).style!=='drill'||true)rate[m]=w/Math.max(1,n);m=s.match;w=n=0;}}
  assert.equal(s.phase,'over',`a run always ends (seed ${seed}, ${Math.round(s.clock)} s)`);assert.equal(lives1[0],3,'a careful bot wins the opening match with every ball');assert(s.matchesWon>=8,`and goes deep (${s.matchesWon})`);
  const avg=(a,b)=>{let x=0,k=0;for(let i=a;i<=b;i++)if(rate[i]!==undefined){x+=rate[i];k++;}return x/k;};assert(avg(1,4)>avg(5,9)+.08,`later is harder: ${avg(1,4).toFixed(2)} of points won in matches 1-4, ${avg(5,9).toFixed(2)} in 5-9`);assert(avg(1,2)>=.95,'the first two matches are gentle');}}

// 4. Winner read and line ball.
{const s=t.createTennis(5,1);t.beginTennis(s);Object.assign(s,{phase:'rally'});Object.assign(s.ball,{x:3.6,y:-5,z:.9,vx:.4,vy:-3,vz:1,wx:0,wy:0,wz:0,last:'you',crossed:true,bounces:1});
 Object.assign(s.rival,{x:-4,y:-2});assert.equal(C.tennisWinnerRead(s),true,'beaten: the rival is across the court');
 Object.assign(s.rival,{x:3.2,y:-6});assert.equal(C.tennisWinnerRead(s),false,'in reach: no slow motion over a retrieval');
 Object.assign(s.rival,{x:-4,y:-2});s.ball.bounces=0;assert.equal(C.tennisWinnerRead(s),false,'not before the bounce');s.ball.bounces=1;s.ball.last='rival';assert.equal(C.tennisWinnerRead(s),false,'never on the rival\'s ball');
 assert(C.TENNIS_WINNER.rally>=5&&C.TENNIS_WINNER.strength<=.6);assert.match(game,/tennis\.rally>=TENNIS_WINNER\.rally\|\|tennisBigPoint\(tennis\)\)&&tennisWinnerRead\(tennis\)/);assert.match(game,/tennisBeat\.strike\(TENNIS_WINNER\.strength\)\)onSound\(false,'tennis:winner'\)/);
 const line=feel.match(/export const tennisLineBall=\(x:number,y:number\)=>([^;]+);/);assert(line);const lineBall=new Function('x','y','TENNIS_LINE_BALL','return '+line[1]);
 assert.equal(lineBall(4.8,-3,.3),true);assert.equal(lineBall(0,-7.9,.3),true);assert.equal(lineBall(2,-4,.3),false);assert.equal(lineBall(5.2,-4,.3),false,'out is not on the line');}

// 5. Wiring.
{for(const cue of ["kind==='ringup'","kind==='ring'","kind==='line'","kind==='winner'"])assert(audio.includes(cue),'audio answers '+cue);
 assert(audio.includes("if(kind==='ring')haptic("),'a ring buzzes even when sound is off');
 assert(feel.includes("emit('tennis:ringup:'")&&feel.includes("emit('tennis:ring:'")&&feel.includes("emit('tennis:line')")&&feel.includes("emit('tennis:ringmiss')")&&audio.includes("kind==='ringmiss'"));
 assert(card.includes("GAIN_WORD[tennis.touchGrade]")&&/heavy:'HEAVY ',early:'EARLY ',late:'LATE '/.test(card),'a poor touch is named in one word on the score tag');
 assert(card.includes('data-tick=')&&css.includes('.sbRally b[data-tick]{animation:none}'),'the rally numeral ticks, still under reduced motion');
 assert(feel.includes("runOver||over&&won?'match':'point'"),'a won match gets the match call');
 assert(feel.includes("bonus.name='tennis-gold-ring'")&&feel.includes('TENNIS_ATLAS.bounce')&&feel.includes('bonus.geometry.dispose()'),'one pooled bullseye, disposed');
 assert(feel.includes("bonus.visible=tennis.bonusOn&&tennis.phase==='rally'"),'+1 draw only while a ring is up');
 assert(card.includes('data-tennis-gain')&&card.includes('data-tennis-rings')&&css.includes('.sbGain{')&&/prefers-reduced-motion:reduce\)\{\.sbGain\{animation:tnGainFade/.test(css),'score gain tag, reduced motion kept');
 assert(read('components/games/TennisCourtPicker.tsx').includes('data-tennis-ring-how'));
 assert(!/—/.test(card.match(/Gold rings hit[^<]*/)[0]));}
// 6. Fix round (Nov 18 2026): mashing Kick is not a plan against the stronger rivals, one press a touch is untouched, and the second lap
//    does not open far easier than the first lap ended.
{const M=t.TENNIS_MASH;let tick=0;
 // The masher: runs to where the ball will land and presses Kick six times a second. No aim, no waiting, no shot choice.
 const masher=s=>{tick++;const press=tick%10===0;if(s.phase==='serve'&&s.server==='you'&&s.phaseTime>.3&&press)t.requestTennisKick(s);if(s.phase==='rally'){if(s.ball.last==='rival'){const l=t.tennisReceivingPoint(s);t.setTennisTarget(s,l.x,l.y);}if(press)t.requestTennisKick(s);}};
 const share=(f,level)=>{let you=0,all=0,mashed=0;for(const seed of [11,23,37,41,59,67,73,89]){tick=0;const s=t.createTennis(seed,level);t.beginTennis(s);for(let i=0;i<60*150&&s.phase!=='over';i++){f(s);const a=s.pointsPlayed;t.tickTennis(s,1/60);mashed=Math.max(mashed,s.mash);if(s.pointsPlayed!==a){all++;if(s.pointWinner==='you')you++;}}}return {share:you/Math.max(1,all),mashed};};
 const out=[];for(const level of [4,5,6]){const m=share(masher,level),p=share(placer,level);out.push(`court ${level}: masher ${(m.share*100).toFixed(0)}%, placer ${(p.share*100).toFixed(0)}%`);
  assert(m.share<.36,`mashing Kick loses clearly on court ${level} (${(m.share*100).toFixed(0)}% of points)`);assert(m.mashed>=M.touches,'the masher is seen');assert.equal(p.mashed,0,'a bot that presses once a touch never trips the rule');assert(p.share>.8,`placing still wins on court ${level} (${(p.share*100).toFixed(0)}%)`);}
 // courts 1 to 3 never use it; one clean single-press touch steps the count back down
 assert.equal(t.tennisMashing({mash:4,level:1}),false);assert.equal(t.tennisMashing({mash:4,level:2}),false);assert.equal(t.tennisMashing({mash:M.touches,level:4}),true);assert.equal(t.tennisMashing({mash:M.touches-1,level:6}),false);
 {const s=t.createTennis(5,4);s.mash=M.touches;assert.equal(t.tennisAssist(s),0,'no timing help for a masher');s.mash=0;assert(t.tennisAssist(s)>0);}
 // the second lap: match 10 (court 1 again) plays at tier 3 or more with no tiring rival
 {const c9=t.tennisRampedCourt({level:9,match:9,lap:1}),c10=t.tennisRampedCourt({level:1,match:10,lap:2});assert(c10.tier>=3,'a looped first court is not a beginner court');assert(c10.speed>=c9.speed&&c10.reaction<=c9.reaction+1e-9&&c10.error<=c9.error+1e-9,'and keeps the Legend feet under the later ramp row');
  assert.equal(t.tennisRampedCourt({level:1,match:1,lap:1}),t.TENNIS_COURTS[0],'match 1 is the base court itself');assert.equal(t.tennisRivalTire({rally:40,level:1,lap:2}),0);assert(t.tennisRivalTire({rally:40,level:1,lap:1})>0,'the first lap rival still tires');}
 console.log('  '+out.join('; '));}
// 7. The score tag sits inside the score panel (the clean-court ruling): no rule places it below the panel.
assert(/\.sbGain\{position:absolute;z-index:1;right:5px;bottom:3px;/.test(css)&&!/\.sbGain\{[^}]*top:calc\(100%/.test(css),'the gain tag is inside the panel');
console.log('tennis-aaa: ok');
