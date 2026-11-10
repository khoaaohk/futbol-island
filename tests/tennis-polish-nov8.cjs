// Futbol Tennis polish (Nov 8 2026): the two TOURS (Pro Tour, Legend Tour) with their own boards, server rules and SQL allow-list;
// the touch multiplier and combo, tour lives / ramp / scoring, tighter forgiveness, the named input buffer, the "why it ended" line,
// the result card wiring (tour best, confetti), reduced motion and the pooled tennis voices (new cues stay under the voice cap).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const store=new Map(),localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
let live=0,peak=0,made=0;const nodes=[];const drain=()=>{for(const n of nodes.splice(0))if(n.started&&n.onended){n.onended();live--;}};const node=()=>{const p={value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},cancelScheduledValues(){}};
 const n={frequency:p,gain:p,Q:p,type:'',buffer:null,started:false,connect(){},disconnect(){},start(){n.started=true;made++;live++;peak=Math.max(peak,live);},stop(){},onended:null};nodes.push(n);return n;};
const ctx={state:'running',currentTime:0,sampleRate:8000,destination:{},createOscillator:node,createGain:node,createBiquadFilter:node,createBufferSource:node,createBuffer:(c,n)=>({getChannelData:()=>new Float32Array(n)})};
const cache=new Map();function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,JSON,console,localStorage,Float32Array,Date,
  document:{hidden:false},navigator:{},performance:{now:()=>0},matchMedia:()=>({matches:false}),
  require:id=>id.startsWith('@/')?load(path.resolve(ROOT,id.slice(2)+'.ts')):id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts'),L=load('lib/arcade/leaderboard.ts'),W=load('lib/arcade/arcadeWalletCore.ts'),A=load('lib/arcade/tennisAudio.ts');
const C=t.TENNIS_COURTS,TO=t.TENNIS_TOURS,R=t.TENNIS_TOUR_RULES,tick=(s,sec)=>{for(let i=0;i<Math.round(sec*120);i++)t.tickTennis(s,1/120);};

// 1. Two tours, harder than the hardest ladder court, endless (never won by score), on the court's own meshes.
assert.equal(TO.length,2);assert.equal(R.length,2);
for(const c of TO){assert(c.hard&&c.tier===6&&c.to>=99,'hard, endless');assert(c.speed>=C[6].speed&&c.reaction<=C[6].reaction,'at least as quick as court 7');}
assert(TO[1].speed>TO[0].speed&&TO[1].reaction<TO[0].reaction&&TO[1].sharp>TO[0].sharp,'Legend Tour is harder than Pro Tour');
assert.equal(JSON.stringify(R.map(r=>r.lives)),'[3,2]');assert(R[1].scale>R[0].scale,'the harder tour scores more per touch');
assert.deepEqual(Object.keys(TO[0]).sort(),Object.keys(C[0]).sort(),'tour courts are court-shaped (every court rule reads them)');
// Unlock with the ladder: Pro at court 7, Legend at court 9.
assert(!t.tennisTourUnlocked(1,6)&&t.tennisTourUnlocked(1,7)&&!t.tennisTourUnlocked(2,8)&&t.tennisTourUnlocked(2,9));

// 2. Their own boards: new ids beside 'tennis' (never mixed, never reset), token pattern, inside the SQL ceiling, strict rates.
assert.equal(t.tennisBoardFor(0),'tennis');assert.equal(t.tennisBoardFor(1),'tenpro');assert.equal(t.tennisBoardFor(2),'tenlgnd');
const sqlCap=Number(/score between 1 and (\d+)/.exec(read('supabase/migrations/20261013_arcade_leaderboards.sql'))[1]);
for(const g of ['tenpro','tenlgnd']){assert(L.isBoardGame(g));assert(/^[a-z]{2,8}$/.test(g),'fits the session token pattern');const r=L.BOARD_RULES[g];
 assert(r.max<=sqlCap&&r.minSeconds>=20&&r.perSecond<=500,'inside the ceiling, strict rate and play time');
 assert.equal(L.scoreInBounds(g,r.max+1),false);assert.equal(L.scorePlausible(g,5000,60_000),'ok','a strong minute is fine');
 assert.equal(L.scorePlausible(g,100_000,60_000),'fast','an impossible pace is refused');assert.equal(L.scorePlausible(g,500,10_000),'short');}
assert.deepEqual({...L.BOARD_RULES.tennis},{name:'Futbol Tennis',unit:'touch rally',max:500,base:10,perSecond:2,minSeconds:15,learn:'A clean first touch keeps the rally alive.'},'the classic rally board is untouched');
// Server rate check covers a real tour: the best possible touch (golden × max combo × max ramp × scale) at one touch a second.
for(const n of [1,2]){const top=t.tennisTourGain(n,'touch',t.TENNIS_TOUCH_MULT.golden,t.TENNIS_COMBO.max,t.TENNIS_TOUR_RAMP_MAX);
 assert(top<L.BOARD_RULES[t.tennisBoardFor(n)].perSecond,`best touch (${top}) under the per-second rate`);}
// The SQL: a separate, additive migration after the other Nov 8 tiers, carrying every board, with its OK row.
const files=fs.readdirSync(path.join(ROOT,'supabase/migrations')).sort(),f='20261108_tennis_tier_boards.sql';assert(files.includes(f));
assert(files.indexOf(f)>files.indexOf('20261108_strikers_league_boards.sql')&&files.indexOf(f)>files.indexOf('20261108_runner_tier_boards.sql'));
// Nov 8 2026: the Pass Puzzles cup boards came later in their own file (20261110_puzzle_tier_boards.sql, which now runs last).
const sql=read('supabase/migrations/'+f);for(const g of L.BOARD_GAMES.filter(g=>!['puzpro','puzlgnd','runwarm','runnight','runstorm','rundaily'].includes(g)))assert(sql.includes(`'${g}'`),'SQL allows '+g);
assert(/'OK, tennis tour boards installed'/.test(sql));assert(!/\bdrop\s+(table|function|column)|truncate|delete from|update\s+public/i.test(sql.replace(/--.*$/gm,'')),'additive');

// 3. Touch multiplier + combo (a scrappy touch never breaks it; only a lost point resets it).
assert.equal(t.tennisTouchMult('perfect',false,1),3);assert.equal(t.tennisTouchMult('good',false,.8),2);assert.equal(t.tennisTouchMult('heavy',false,.5),1);assert.equal(t.tennisTouchMult('',true,1),4);
assert.deepEqual([0,3,4,8,12,40].map(n=>t.tennisComboStep(n)),[1,1,2,3,4,4]);
assert.equal(t.tennisTourGain(1,'touch',3,1,0),30);assert.equal(t.tennisTourGain(2,'touch',3,1,0),45);assert.equal(t.tennisTourGain(1,'win',1,2,2),120);assert.equal(t.tennisTourGain(0,'touch',3,4,4),0);

// 4. Forgiveness tightens with the level: easy ladder > standard ladder > Pro Tour > Legend Tour.
const win=(level,tour=0)=>t.tennisPerfectWindow({level,tour});
assert(win(1).after>win(5).after&&win(5).after>win(1,1).after&&win(1,1).after>win(1,2).after,'perfect window');
assert(win(1).reach>win(5).reach&&win(5).reach>win(1,1).reach&&win(1,1).reach>win(1,2).reach,'perfect reach');
assert.deepEqual({...t.TENNIS_INPUT_BUFFER},{kick:.32,aerial:.48,trap:.36},'buffered presses (unchanged values, now named)');
{const s=t.createTennis(3,1);s.phase='rally';t.requestTennisKick(s,0,'header');assert.equal(s.queuedKick,t.TENNIS_INPUT_BUFFER.aerial);}

// 5. A tour run: lives, a perfect touch scores 10 × 3, won points ramp the rival, lost points cost a ball, the end.
const s=t.createTennis(47,4,1);t.beginTennis(s);assert.equal(s.tour,1);assert.equal(s.tourLives,3);assert.equal(t.tennisCourt(s).name,'Pro Tour');
assert(/PRO TOUR/.test(s.message));
Object.assign(s,{phase:'rally',rally:3,aiReaction:99,bounceAge:.1});Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0,moveX:0,moveY:0,direct:false,kick:0});
Object.assign(s.ball,{x:.15,y:5.0,z:.32,vx:0,vy:1,vz:1.5,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:1});
t.requestTennisKick(s,0);for(let i=0;i<60&&s.ball.last!=='you';i++)t.tickTennis(s,1/120);
assert.equal(s.ball.last,'you');assert.equal(s.touchGrade,'perfect');assert.equal(s.touchMult,3);assert.equal(s.tourScore,30);assert.equal(s.tourEvents,1);
function lose(st){Object.assign(st,{phase:'rally',aiReaction:99});Object.assign(st.ball,{x:0,y:2,z:.2,vx:0,vy:-.5,vz:-2,last:'you',crossed:false,bounces:0,netHit:true});tick(st,.1);}
function winPt(st){Object.assign(st,{phase:'rally',aiReaction:99});Object.assign(st.rival,{x:4,y:-7,targetX:4,targetY:-7});Object.assign(st.ball,{x:-2,y:-3,z:.2,vx:0,vy:-.5,vz:-2,wx:0,wy:0,wz:0,last:'you',crossed:true,bounces:1,netHit:false});tick(st,.1);}
s.tourClean=5;s.comboStep=2;winPt(s);assert.equal(s.pointWinner,'you');assert.equal(s.tourScore,30+100,'a won point: 50 × combo 2');assert.equal(s.tourHeat,0);
winPt(s);assert.equal(s.tourHeat,1,'two won points: the rival steps up');assert.equal(t.tennisTourRamp(s),1);assert(/LEVEL UP/.test(s.message));
lose(s);assert.equal(s.pointWinner,'rival');assert.equal(s.tourLives,2);assert.equal(s.comboStep,1,'a lost point resets the combo');assert.equal(s.lossKinds.net,1);assert.equal(s.phase,'point');
lose(s);lose(s);assert.equal(s.phase,'over');assert.equal(s.winner,'rival');assert.equal(s.stars,0);assert(/PRO TOUR OVER/.test(s.message));
assert.equal(t.tennisLossLine(s),t.TENNIS_LOSS_LINES.net);assert.equal(t.tennisLossLine(t.createTennis()),'');
// Retry keeps the tour (and never advances the ladder); picking the courts again leaves the tour.
const level=s.level;t.resetTennis(s);assert.equal(s.tour,1);assert.equal(s.level,level);assert.equal(s.tourLives,3);assert.equal(s.tourScore,0);
t.setTennisTour(s,2);assert.equal(s.tourLives,2);assert.equal(t.tennisCourt(s).name,'Legend Tour');t.setTennisTour(s,0);assert.equal(s.tour,0);assert.equal(t.tennisCourt(s).name,C[level-1].name);
// Ladder courts are unchanged by the tours: winning still advances, no lives, tour score stays 0.
{const c=t.createTennis(5,2);c.score.you=6;winPt(c);assert.equal(c.phase,'over');assert.equal(c.winner,'you');assert.equal(c.tourScore,0);t.resetTennis(c);assert.equal(c.level,3);}
// Adaptive help on a tour is capped low (Legend: none).
{const l=t.createTennis(5,1,2);t.beginTennis(l);for(let i=0;i<2;i++)lose(l);assert.equal(l.assist,0,'Legend Tour gives no hidden help');}

// 6. Economy: tour coins use the same per-game cap.
assert(W.arcadeCoinTarget('tennis',{cleanReturns:9999,points:9999,won:false})<=W.ARCADE_COIN_CAPS.tennis);

// 7. Sound: the new cues play through the pooled voices and never exceed the cap, even in a burst.
assert.equal(A.TENNIS_MAX_VOICES,14);assert.equal(A.TENNIS_COMBO_NOTES.length,t.TENNIS_COMBO.max);
for(const cue of ['tennis:mult:3:4','tennis:rampup:2','tennis:life:1','tennis:best','tennis:ui']){const before=made;A.tennisSound(ctx,cue);assert(made>before,cue+' plays');drain();}
peak=0;
for(let i=0;i<60;i++)A.tennisSound(ctx,i%2?'tennis:best':'tennis:mult:4:4');assert(peak<=A.TENNIS_MAX_VOICES,`voice cap holds (${peak})`);

// 8. Wiring + reduced motion + CSS modules: the result card, HUD, impact ring and confetti.
const game=read('components/games/ArcadeGame3D.tsx'),card=read('components/games/TennisCard.tsx'),css=read('components/games/TennisCourtPicker.module.css'),ag=read('lib/arcade/arcadeGames.ts');
assert(/tennisBoardFor\(game\.current\?\.state\.tennis\.tour\?\?0\)/.test(game)&&/tennis-pro/.test(game)&&/record:tour\?null:/.test(read('lib/arcade/results/tennisResult.ts'))&&/beforeRecord:\(\)=>\{if\(kind==='tennis'\)tennisOver\(/.test(game),'tour board + own best; classic record untouched by a tour');
assert(/data-tennis-tour=\{n\}/.test(card)&&/data-tennis-why/.test(card)&&/styles\.confetti/.test(card),'tour chips, why line, confetti');
assert(/perfRing/.test(ag)&&/tennisImpact\.visible=!stage\.reduced&&/.test(ag),'perfect ripple reuses the pooled ring, off for reduced motion');
assert(/prefers-reduced-motion:reduce\)\{\.confetti\{display:none\}/.test(css),'no confetti for reduced motion');
const block=css.slice(css.indexOf('/* Nov 8 2026'));for(const line of block.split('\n').filter(l=>l&&!l.startsWith('/*')&&!l.startsWith('@keyframes')&&!/^\d|^\s*\d|^@media/.test(l)))assert(/^\.[a-zA-Z]/.test(line),'every new selector starts with a local class: '+line.slice(0,40));
console.log('tennis polish Nov 8: tours, boards, multiplier, ramp, forgiveness, why line, sounds, wiring OK');
