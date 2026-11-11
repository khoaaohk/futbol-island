// Futbol Tennis endless play, Nov 10 2026 (owner: "We need to make it that the user can play as long as they want to increase their
// score. All these games should also increase in difficulty the further they play." One board per game: no new boards, no renames,
// no resets). Run: node tests/tennis-endless.cjs
//  1. the ramp table: match 1 is every court and tour as it was, every parameter moves one way, past the table it keeps climbing
//  2. match 1 equals today's parameters on every court and both tours (the sim reads the base court object itself)
//  3. a run ends ONLY when the balls run out: three matches won in a row play on; three lost end it; a win brings one ball back (capped)
//  4. the world moves on: the nine-stop order, the loop, the lap, the tours' own stops
//  5. the seam: skippable, never longer than a normal point, score and marks reset, the run's score carried
//  6. stars: the old conditions, judged per match, saved on a decided match under the same key
//  7. boards: same three ids, raised ceilings under the pending 9,000,000 table check, the rate check still the guard; result adapter
//  8. wiring: venue swap creates nothing, the readout, the cue, the test chain
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map(),localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const cache=new Map();function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,localStorage,Float32Array,Date,Map,
  require:id=>id.startsWith('@/')?load(path.resolve(ROOT,id.slice(2)+'.ts')):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts'),E=load('lib/arcade/tennisEndless.ts'),L=load('lib/arcade/leaderboard.ts'),R=load('lib/arcade/results/tennisResult.ts');
const C=t.TENNIS_COURTS,tick=(s,sec)=>{for(let i=0;i<Math.round(sec*100);i++)t.tickTennis(s,1/100);};
// A won point (the ball bounces twice past a rival left in the corner) and a lost one (your return dies in the net).
function winPt(s){Object.assign(s,{phase:'rally',aiReaction:99});Object.assign(s.rival,{x:4,y:-7,targetX:4,targetY:-7});Object.assign(s.ball,{x:-2,y:-3,z:.2,vx:0,vy:-.5,vz:-2,wx:0,wy:0,wz:0,last:'you',crossed:true,bounces:1,netHit:false});tick(s,.1);}
function losePt(s){Object.assign(s,{phase:'rally',aiReaction:99});Object.assign(s.ball,{x:0,y:2,z:.2,vx:0,vy:-.5,vz:-2,last:'you',crossed:false,bounces:0,netHit:true});tick(s,.1);}
const winMatch=s=>{const n=s.matchEvents;for(let i=0;i<40&&s.matchEvents===n;i++){if(i)tick(s,2);winPt(s);}assert.equal(s.matchEvents,n+1);assert.equal(s.matchWinner,'you');};
const loseMatch=s=>{const n=s.matchEvents;for(let i=0;i<40&&s.matchEvents===n;i++){if(i)tick(s,2);losePt(s);}assert.equal(s.matchEvents,n+1);assert.equal(s.matchWinner,'rival');};

// 1. The ramp table.
{const rows=E.TENNIS_RAMP;assert.equal(rows.length,E.TENNIS_RAMP_TOP);assert(E.TENNIS_RAMP_TOP>=10);
 assert.deepEqual({...rows[0]},{match:1,rank:'',speed:1,reach:0,reaction:1,aim:1,sharp:0,variety:0,error:1,wind:0,gust:0,sweet:1,points:1,bonus:300,start:0},'match 1 changes nothing');
 const up=['speed','reach','aim','sharp','variety','wind','gust','points','bonus','start'],down=['reaction','error','sweet'];
 for(let m=2;m<=E.TENNIS_RAMP_END+5;m++){const a=E.tennisRampRow(m-1),b=E.tennisRampRow(m);
  for(const k of up)assert(b[k]>=a[k],`${k} never eases (match ${m})`);for(const k of down)assert(b[k]<=a[k],`${k} never eases (match ${m})`);
  if(m<=E.TENNIS_RAMP_END)assert(b.speed>a.speed&&b.reaction<a.reaction&&b.error<a.error&&b.reach>a.reach,`the rival is better every match up to ${E.TENNIS_RAMP_END} (match ${m})`);
  if(m<=E.TENNIS_RAMP_TOP){assert.equal(b.match,m);assert(b.rank,'a named rank from match 2');assert.equal(b.start,0,'no head start inside the table');}}
 assert.equal(E.tennisRampRow(E.TENNIS_RAMP_END+50),E.tennisRampRow(E.TENNIS_RAMP_END),'past the end: the last row, cached');assert.equal(E.tennisRampRow(NaN),rows[0]);assert.equal(E.tennisRampRow(-3),rows[0]);
 const top=rows[rows.length-1],end=E.tennisRampRow(E.TENNIS_RAMP_END);assert.equal(end.points,top.points,'the score rate stops at the table top (the boards guard it)');assert.equal(end.sweet,top.sweet);assert.equal(end.wind,top.wind);
 assert(end.reaction>.3&&end.error>.1&&end.start>=1&&end.start<=6);assert.equal(new Set(rows.map(r=>r.rank)).size,rows.length,'every rank has its own name');
 assert.equal(E.tennisMatchLabel(1,'STEADY'),'Match 1 · Steady');assert.equal(E.tennisMatchLabel(4,'NET RUSHER'),'Match 4 · Harbour Net Rusher');assert.equal(t.tennisMatchName(t.createTennis(1,2)),'Match 1 · Deep Defender');
 assert(E.TENNIS_MATCH_TIPS.length>=6);assert.notEqual(E.tennisMatchTip(1),E.tennisMatchTip(2),'the tip rotates per match');assert.equal(E.tennisMatchTip(1+E.TENNIS_MATCH_TIPS.length),E.tennisMatchTip(1));}

// 2. Match 1 equals today's parameters: the sim reads the untouched base court, the old perfect windows, no extra reach, no head start.
{for(let level=1;level<=C.length;level++){const s=t.createTennis(5,level);assert.equal(s.match,1);assert.equal(t.tennisCourt(s),C[level-1],`court ${level}: match 1 is the base court itself`);assert.equal(t.tennisRampedCourt({level,match:1,lap:1}),C[level-1]);
  assert.deepEqual({...t.tennisPerfectWindow(s)},C[level-1].tier<=2?{after:.32,reach:.9}:{after:.26,reach:.8});assert.equal(t.tennisHeadStart(s),0);}
 for(const tour of [1,2]){const s=t.createTennis(5,4,tour);assert.equal(t.tennisCourt(s),t.TENNIS_TOURS[tour-1]);const r=t.TENNIS_TOUR_RULES[tour-1];assert.deepEqual({...t.tennisPerfectWindow(s)},{after:r.perfectAfter,reach:r.perfectReach});assert.equal(s.tourLives,r.lives);
  for(const mult of [1,2,3,4])for(const combo of [1,2,4])for(const heat of [0,3,8]){s.comboStep=combo;s.tourHeat=heat;assert.equal(t.tennisRunGain(s,'touch',mult),t.tennisTourGain(tour,'touch',mult,combo,heat),'a tour scores at match 1 what it always paid');assert.equal(t.tennisRunGain(s,'win',1),t.tennisTourGain(tour,'win',1,combo,heat));}}
 // The rival's contact reach: 1.3 m at match 1, wider later (your own reach never moves).
 const reach=(match,d,side='rival')=>{const s=t.createTennis(5,4);s.phase='rally';s.match=match;Object.assign(s.ball,side==='rival'?{x:0,y:-5.3+d,z:.4,last:'you',crossed:true}:{x:0,y:5.3-d,z:.4,last:'rival',crossed:true});return t.canTennisKick(s,side);};
 assert.equal(reach(1,1.29),true);assert.equal(reach(1,1.31),false);assert.equal(reach(10,1.45),true);assert.equal(reach(10,1.31,'you'),false,'your reach is not ramped');
 // The ramp is really read by the sim: speed, reaction, error, placement, quality cap, wind, the perfect window, the head start.
 const c5=C[4],r5=E.tennisRampRow(5),m5=t.tennisRampedCourt({level:5,match:5,lap:1});assert.notEqual(m5,c5);assert.equal(m5.speed,c5.speed*r5.speed);assert.equal(m5.reaction,c5.reaction*r5.reaction);assert.equal(m5.error,c5.error*r5.error);assert.equal(m5.aim,c5.aim*r5.aim);assert.equal(m5.sharp,Math.min(E.TENNIS_SHARP_MAX,c5.sharp+r5.sharp));assert.equal(m5.wind,c5.wind+r5.wind);
 assert.equal(m5.name,c5.name);assert.equal(m5.style,c5.style);assert.equal(m5.touches,c5.touches);assert.equal(m5.to,c5.to,'rules, style and surface never ramp');assert.equal(t.tennisRampedCourt({level:5,match:5,lap:1}),m5,'cached: no allocation in play');
 assert.equal(t.tennisPerfectWindow({level:5,tour:0,match:5}).after,.26*r5.sweet);assert(t.tennisPerfectWindow({level:1,tour:2,match:99}).after>=E.TENNIS_SWEET_FLOOR);
 assert.equal(t.tennisHeadStart({level:1,tour:0,match:99}),Math.min(C[0].to-1,E.tennisRampRow(99).start));assert(t.tennisHeadStart({level:1,tour:0,match:99})<C[0].to);assert.equal(t.tennisHeadStart({level:3,tour:0,match:99}),0,'the drill has no rival score');assert.equal(t.tennisHeadStart({level:1,tour:1,match:99}),0);
 // Along a real run from court 1 the rival never gets easier, the loop included (from lap 2 every rival has at least the Legend Cup's feet).
 let prev=null;for(let won=0;won<45;won++){const level=E.tennisRunStop(1,won),lap=E.tennisRunLap(1,won),c=t.tennisRampedCourt({level,match:won+1,lap});if(c.style==='drill')continue;
  if(prev){assert(c.speed>=prev.speed-1e-9,`speed after ${won} wins`);assert(c.reaction<=prev.reaction+1e-9,`reaction after ${won} wins`);assert(c.error<=prev.error+1e-9,`error after ${won} wins`);}prev=c;}
 const loop=t.tennisRampedCourt({level:1,match:10,lap:2});assert.equal(loop.style,'steady');assert.equal(loop.aerial,false);assert(loop.speed>=C[8].speed&&loop.reaction<=C[8].reaction,'a looped court keeps its style and plays with the Legend Cup feet');}

// 3. A run ends only when the balls run out.
{const s=t.createTennis(47,4);t.beginTennis(s);assert.equal(s.tourLives,E.TENNIS_RUN.lives);assert.equal(t.tennisRunLives(s),3);let score=0;
 for(let n=1;n<=3;n++){winMatch(s);assert.equal(s.phase,'point',`match ${n} won: the run plays on`);assert.equal(s.winner,null);assert.equal(s.seam,1);assert.equal(s.matchesWon,n);assert.equal(s.matchLevel,3+n);
  assert.equal(s.matchBonus,Math.round(E.tennisRampRow(n).bonus*t.tennisRunScale({level:3+n,tour:0})),'the win bonus banks');assert(s.tourScore>=score+s.matchBonus);score=s.tourScore;assert.equal(s.tourLives,3,'never more balls than the run holds');assert.equal(s.lifeBack,false);
  tick(s,2);assert.equal(s.phase,'serve');assert.equal(s.level,4+n,'the next court walks on');assert.equal(s.match,n+1);assert.equal(s.venueStop,4+n);assert.deepEqual({...s.score},{you:0,rival:0});assert.equal(s.tourScore,score,'the score is carried on');assert.match(s.message,new RegExp(`^MATCH ${n+1} · ${C[3+n].name} vs `));}
 assert.equal(s.topLevel,7);assert.equal(s.courtsWon,3);
 // Losing: one ball a match, the same court again, over only on the last one.
 loseMatch(s);assert.equal(s.phase,'point');assert.equal(s.tourLives,2);assert.equal(s.seam,2);assert.match(s.message,/2 balls left/);tick(s,2);assert.equal(s.level,7,'the same court again');assert.equal(s.match,4);assert.deepEqual({...s.score},{you:0,rival:0});
 winMatch(s);assert.equal(s.tourLives,3,'a win brings one ball back');assert.equal(s.lifeBack,true);assert.match(s.message,/a ball back/);tick(s,2);assert.equal(s.level,8);
 loseMatch(s);tick(s,2);loseMatch(s);assert.equal(s.tourLives,1);assert.equal(s.phase,'point');tick(s,2);const before=s.tourScore;loseMatch(s);
 assert.equal(s.phase,'over','the last ball lost ends the run');assert.equal(s.winner,'rival');assert.equal(s.tourLives,0);assert.match(s.message,/RUN OVER · Match 5 · /);assert.equal(s.tourScore,before);assert.equal(t.tennisNeedsFrames(s),false);
 const pts=s.pointsPlayed;tick(s,3);assert.equal(s.pointsPlayed,pts);t.resetTennis(s);assert.equal(s.phase,'ready');assert.equal(s.level,8,'the next run starts on the court the last one ended on');assert.equal(s.match,1);assert.equal(s.tourLives,3);assert.equal(s.tourScore,0);assert.equal(s.matchesWon,0);
 // Courts score like the tours now (touch × combo), scaled by tier; a lost point resets the combo.
 assert.equal(E.tennisLadderScale(1),.6);assert.equal(E.tennisLadderScale(6),1.1);const g=t.createTennis(5,1);g.comboStep=2;assert.equal(t.tennisRunGain(g,'touch',3),Math.round(10*3*2*.6));g.match=10;assert.equal(t.tennisRunGain(g,'touch',3),Math.round(10*3*2*.6*2));
 const cmb=t.createTennis(5,2);t.beginTennis(cmb);cmb.tourClean=9;cmb.comboStep=3;winPt(cmb);assert.equal(cmb.tourScore,Math.round(50*3*.7));assert.equal(cmb.pointsWon,1);tick(cmb,2);losePt(cmb);assert.equal(cmb.comboStep,1);assert.equal(cmb.tourLives,3,'a lost POINT costs no ball on a court');
 // Tours: a ball per lost point as before; every TENNIS_RUN.tourMatch won points is a match (bonus, a ball back, the next stop).
 for(const tour of [1,2]){const r=t.TENNIS_TOUR_RULES[tour-1],u=t.createTennis(9,4,tour);t.beginTennis(u);assert.equal(u.venueStop,E.TENNIS_RUN.tourStops[tour-1]);losePt(u);assert.equal(u.tourLives,r.lives-1);tick(u,2);
  for(let i=0;i<E.TENNIS_RUN.tourMatch;i++){if(i)tick(u,2);assert.equal(u.matchEvents,0);winPt(u);}assert.equal(u.matchEvents,1);assert.equal(u.phase,'point');assert.equal(u.tourLives,r.lives,'the ball comes back');assert.equal(u.matchBonus,Math.round(300*r.scale));
  tick(u,2);assert.equal(u.match,2);assert.equal(u.level,4,'a tour keeps its court rules');assert.equal(u.venueStop,E.tennisNextStop(E.TENNIS_RUN.tourStops[tour-1]),'and the world moves on');assert.equal(t.tennisCourt(u).name,r.name);
  for(let i=0;i<r.lives;i++){assert.notEqual(u.phase,'over');losePt(u);tick(u,2);}assert.equal(u.phase,'over');assert.equal(u.winner,'rival');assert.equal(u.stars,0);}}

// 4. The world moves on: the nine stops in order, the loop, the lap.
{assert.equal(E.TENNIS_RUN.stops,C.length);const order=[];let stop=7;for(let i=0;i<10;i++){order.push(stop);stop=E.tennisNextStop(stop);}assert.deepEqual(order,[7,8,9,1,2,3,4,5,6,7]);
 assert.equal(E.tennisRunStop(7,3),1);assert.equal(E.tennisRunLap(7,2),1);assert.equal(E.tennisRunLap(7,3),2);assert.equal(E.tennisRunLap(1,8),1);assert.equal(E.tennisRunLap(1,18),3);
 const s=t.createTennis(3,9);t.beginTennis(s);winMatch(s);tick(s,2);assert.equal(s.level,1,'court 9 loops to court 1');assert.equal(s.lap,2);assert.equal(s.topLevel,9,'a looped run has reached every court');assert.equal(s.startLevel,9);
 assert(t.tennisCourt(s).speed>=C[8].speed,'the loop is harder than the first lap');assert.match(s.message,/^MATCH 2 · First Touch vs Club Steady · /);
 const V=load('lib/arcade/tennisVenues.ts');assert.equal(V.TENNIS_VENUES.length,9);assert.equal(new Set(V.TENNIS_VENUES.map(v=>v.id)).size,9,'nine different panels');}

// 5. The seam: skippable, no longer than a normal point, and a press never skips an ordinary point.
{assert(E.TENNIS_RUN.seamBeat<=E.TENNIS_RUN.pointBeat,'no extra wait at the seam');assert(E.TENNIS_RUN.seamSkip<=.5);
 const s=t.createTennis(47,4);t.beginTennis(s);winMatch(s);tick(s,E.TENNIS_RUN.seamSkip-.1);t.requestTennisKick(s);assert.equal(s.phase,'point','too early: the starburst gets its moment');
 tick(s,.15);t.requestTennisKick(s);assert.equal(s.phase,'serve','a press brings the next opponent on');assert.equal(s.level,5);assert(s.phaseTime<.05);
 winPt(s);tick(s,.8);t.requestTennisKick(s);assert.equal(s.phase,'point','an ordinary point is not skipped');tick(s,1);assert.equal(s.phase,'serve');
 const u=t.createTennis(47,4);t.beginTennis(u);winMatch(u);tick(u,E.TENNIS_RUN.seamBeat+.05);assert.equal(u.phase,'serve','unpressed, the seam is one normal point long');}

// 6. Stars: the old conditions, judged on the match just won; nobody loses a star, new players can still earn them.
{const a=t.createTennis(5,1);t.beginTennis(a);a.perfectTouches=4;a.bestRally=a.matchRally=8;winMatch(a);assert.equal(a.matchStars,3,'court 1: win + 4 perfect + an 8-touch rally');assert.equal(a.stars,3);
 tick(a,2);assert.equal(a.level,2);a.habitWins=0;winMatch(a);assert.equal(a.matchStars,1,'the next match starts its own count (4 perfect touches and the rally of match 1 do not carry)');
 const b=t.createTennis(5,2);t.beginTennis(b);loseMatch(b);assert.equal(b.matchStars,0);tick(b,2);b.perfectTouches+=4;b.habitWins+=2;winMatch(b);assert.equal(b.matchStars,3,'a replayed court can still earn all three');
 const legacy=t.createTennis(1,7);legacy.winner='you';legacy.bestRally=10;assert.equal(t.tennisStars(legacy),2,'the pure rule is the old rule');
 const feel=read('lib/arcade/tennisFeel.ts');assert.match(feel,/TENNIS_STARS_KEY='fi2-tennis-stars-v1'/);assert.match(feel,/over=runOver\|\|s\.matchEvents!==endSeen/);assert.match(feel,/best=over&&!s\.tour\?saveTennisStars\(s\.level,s\.stars\):0/,'stars are saved when a match is decided (best kept: saveTennisStars takes the max)');
 assert.match(feel,/const all=readTennisStars\(\),best=Math\.max\(all\[level-1\]\?\?0,stars\)/);}

// 7. Boards: the same three, ceilings raised under the pending table check, the rate check still the guard.
{assert.equal(t.tennisBoardFor(0),'tennis');assert.equal(t.tennisBoardFor(1),'tenpro');assert.equal(t.tennisBoardFor(2),'tenlgnd');assert.deepEqual([...L.BOARD_TIER_TABS.tennis],['tenpro','tenlgnd']);
 const sql=read('docs/arcade-aaa/endless-supabase.sql'),cap=Math.max(...[...sql.matchAll(/score between 1 and (\d+)/g)].map(m=>Number(m[1])));assert.equal(cap,9000000);
 for(const g of ['tennis','tenpro','tenlgnd']){const r=L.BOARD_RULES[g];assert(L.isBoardGame(g));assert(sql.includes(`'${g}'`),'the pending SQL keeps this board id');assert(r.max>400000&&r.max<=cap,`${g}: a long run posts, inside the table check`);assert(r.minSeconds>=15);
  assert.equal(L.scoreInBounds(g,r.max),true);assert.equal(L.scoreInBounds(g,r.max+1),false);assert.equal(L.scorePlausible(g,r.max,60_000),'fast','the rate check still refuses an impossible pace');assert.equal(L.scorePlausible(g,500,5_000),'short');}
 // The best touch a second is the rate (as the tours always derived it): 10 × 4 golden × 4 combo × ramp bonus × scale × the top row's points.
 const top=E.TENNIS_RAMP[E.TENNIS_RAMP_TOP-1].points;assert(L.BOARD_RULES.tennis.perSecond>=10*4*4*E.tennisLadderScale(6)*top);assert(L.BOARD_RULES.tenpro.perSecond>=10*4*4*1.8*1*top);assert(L.BOARD_RULES.tenlgnd.perSecond>=10*4*4*1.8*1.5*top);
 // A seeded bot's honest long run posts: it never beats the rate, and the result adapter sends the run score to the court board.
 const s=t.createTennis(7919,1);t.beginTennis(s);let peak=0;
 for(let i=0;i<60*900&&s.phase!=='over';i++){if(s.phase==='serve'&&s.server==='you'&&s.phaseTime>.3)t.requestTennisKick(s,s.kickCount%2?.8:-.8);
  if(s.phase==='rally'&&s.ball.last==='rival'&&!(s.incomingOut&&!s.ball.bounces)){const l=t.tennisSweetPoint(s);t.setTennisTarget(s,l.x,l.y+.15);if(t.canTennisKick(s,'you')&&!t.tennisShouldWait(s)){if(t.tennisCourtOf(s).style==='drill'){const sh=t.tennisTargetShot(s);t.requestTennisKick(s,Math.max(-1,Math.min(1,s.targetX/(3.7*(sh==='drop'?.7:1)))),sh);}else t.requestTennisKick(s,(t.tennisOpenSide(s)||t.tennisAimSide(s))*.8);}}
  t.tickTennis(s,1/60);if(s.clock>20&&i%600===0){peak=Math.max(peak,s.tourScore/s.clock);assert.equal(L.scorePlausible('tennis',s.tourScore,s.clock*1000),'ok',`an honest run is never "fast" (${s.tourScore} in ${Math.round(s.clock)}s)`);}}
 assert(s.matchesWon>=3,`the placing bot wins at least three matches in a row (${s.matchesWon})`);assert(s.tourScore>2000);assert(peak<L.BOARD_RULES.tennis.perSecond/2,`its pace (${peak.toFixed(0)}/s) sits well under the guard`);
 s.phase='over';s.winner='rival';const res=R.tennisResult(s);assert.equal(res.board,'tennis');assert.equal(res.score,s.tourScore);assert.equal(res.record.best,s.bestRally,'the device record stays the best rally');assert.equal(res.record.unlocked,Math.min(9,s.topLevel),'every court passed is unlocked');assert.equal(res.today.won,true);assert.equal(res.today.court,1);
 const tour=t.createTennis(1,3,2);tour.tourScore=4321;const tr=R.tennisResult(tour);assert.equal(tr.board,'tenlgnd');assert.equal(tr.score,4321);assert.equal(tr.record,null);
 const lb=read('lib/arcade/leaderboard.ts');for(const id of ["'tennis'","'tenpro'","'tenlgnd'"])assert(lb.includes(id));assert.equal(L.BOARD_RULES.tennis.name,'Futbol Tennis');assert.equal(L.BOARD_RULES.tenpro.name,'Tennis Pro Tour');assert.equal(L.BOARD_RULES.tenlgnd.name,'Tennis Legend Tour');}

// 8. Wiring.
{const world=read('lib/arcade/tennisWorld.ts'),apply=world.slice(world.indexOf(' function applyVenue('),world.indexOf(' /** Before each render in which the camera moved'));
 assert(apply.length>400&&!/new T\.|createElement|\.clone\(\)/.test(apply),'the venue swap creates no geometry, texture, material or canvas');assert.match(apply,/paintCourt\(courtCanvas,v,ppm,CW,CL\);courtTex\.needsUpdate=true;/,'one repaint of the one court sheet');
 assert.match(world,/export const TENNIS_CLUB_CROWD=false;/,'owner Nov 11 2026: "remove crowd"');
 const game=read('lib/arcade/games/tennisGame.ts');assert.match(game,/tickTennis\(tennis,tennisStep\);if\(tennis\.match!==venueMatch\)seamVenue\(\);/);assert.match(game,/function applyRunVenue\(force=false\)\{return tennis\.tour&&tennis\.matchesWon%9!==0\?world\.applyVenue\(tennis\.venueStop,0,lights,force\):world\.applyVenue\(tennis\.level,tennis\.tour,lights,force\);\}/);assert.match(game,/tennisSeam\(\)\{return seamStat;\}/);
 const card=read('components/games/TennisCard.tsx');assert.match(card,/data-tennis-match=\{tennis\.match\}/);assert.match(card,/data-tennis-balls=\{tennis\.tourLives\}/);assert.match(card,/data-tennis-run-score/);assert.match(card,/data-tennis-reached>You reached \{tennisMatchName\(t\)\}/);assert.match(card,/data-tennis-tip/);
 const css=read('components/games/skins/tennis.module.css');assert.match(css,/\.sbMatch\{/);assert.match(css,/\.sbBalls i\[data-on\]/);
 const audio=read('lib/arcade/tennisAudio.ts');assert.doesNotMatch(audio,/rally%5===0\)applause/,'no members, so no mid-rally clap ripple (Nov 11 2026)');assert.match(audio,/if\(kind==='next'\)\{drum\(/);assert.equal(audio.split('createDynamicsCompressor()').length-1,1,'one limiter, wired once');assert.match(read('lib/arcade/tennisFeel.ts'),/emit\('tennis:next'\)/);
 assert.match(read('lib/games/soccerTennis.ts'),/import \{TENNIS_RUN,[^}]*\} from '\.\.\/arcade\/tennisEndless';/);assert(!/^import /m.test(read('lib/arcade/tennisEndless.ts')),'the table has no imports');
 assert(read('package.json').includes('node tests/tennis-endless.cjs'),'in the npm test chain');
 assert(fs.existsSync(path.join(ROOT,'scripts/check-tennis-endless.cjs')),'the long-play browser check exists');}
console.log('tennis endless: ramp table, match 1 = today, run ends only on the last ball, stops and loop, skippable seam, stars per match, boards and caps, wiring OK');
