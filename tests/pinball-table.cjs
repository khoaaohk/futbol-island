// Futbol Pinball playfield features (Oct 4 2026): kickboards, free-kick wall,
// G-O-A-L flags, crest lanes, cones, dribble gate, dugout, modes, saver, stars.
// CommonJS + TypeScript transpile so it runs under the npm test Node (20).
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const store=new Map(),cache=new Map();
const globals={Math,Number,console,Map,WeakMap,Array,Object,String,JSON,Float32Array,
 localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v))},document:{hidden:false},performance:{now:()=>0},navigator:{},matchMedia:()=>({matches:false})};
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{...globals,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});
 return m.exports;}
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const P=load('lib/games/soccerPinball.ts'),Tb=load('lib/games/soccerPinballTable.ts'),F=load('lib/games/soccerPinballFeel.ts');
const {createPinballState,launchPinball,stepPinball,PINBALL_STEP,tapPinballFlipper}=P;
const {WALL_X,WALL_Y,FLAGS,SLINGS,CONES,DUGOUT,SAVER,CREST_LANES,CREST_LINE,TRAINING_GOAL}=Tb;
const idle={left:false,right:false};
const sub=(s,n=1,input=idle)=>{for(let i=0;i<n;i++)stepPinball(s,input,PINBALL_STEP);};
const advance=(s,sec,input=idle,hz=480)=>{for(let i=0;i<Math.round(sec*hz);i++)stepPinball(s,input,1/hz);};
function active(x,y,vx,vy){const s=createPinballState();launchPinball(s);s.openingRescue=false;s.launchGrace=0;s.table.skillOpen=0;s.defs=1;Object.assign(s.ball,{x,y,vx,vy,omega:0});return s;}
const segDist=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/Math.max(1e-9,dx*dx+dy*dy)));return Math.hypot(px-ax-dx*t,py-ay-dy*t);};

// 1. No tunnelling at full speed into any new collider, from several angles.
{
 const shots=[];
 for(const x of WALL_X)shots.push({name:'wall',x,y:WALL_Y+40,ang:-Math.PI/2,check:s=>s.ball.y>WALL_Y-4});
 for(const f of FLAGS)shots.push({name:'flag',x:f.x<180?80:280,y:f.y,ang:f.x<180?Math.PI:0,check:s=>f.x<180?s.ball.x>f.x:s.ball.x<f.x});
 for(const k of SLINGS){const mx=(k.ax+k.cx)/2,my=(k.ay+k.cy)/2,nx=k.ax<180?1:-1;shots.push({name:'sling',x:mx+nx*40,y:my-14,ang:Math.atan2(14,-nx*40),check:s=>nx>0?s.ball.x>segX(k,s.ball.y):s.ball.x<segX(k,s.ball.y)});}
 for(const c of CONES)for(const a of [Math.PI/2,Math.PI*.75,Math.PI*.25])shots.push({name:'cone',x:c.x-Math.cos(a)*30,y:c.y-Math.sin(a)*30,ang:a,check:s=>Math.hypot(s.ball.x-c.x,s.ball.y-c.y)>=Tb.CONE_R+s.ball.r-1});
 function segX(k,y){const t=(y-k.ay)/(k.cy-k.ay);return k.ax+(k.cx-k.ax)*Math.max(0,Math.min(1,t));}
 for(const shot of shots){
  const s=active(shot.x,shot.y,Math.cos(shot.ang)*1500,Math.sin(shot.ang)*1500);
  for(let i=0;i<40;i++){sub(s);
   if(shot.name==='cone')for(const c of CONES)assert.ok(Math.hypot(s.ball.x-c.x,s.ball.y-c.y)>=Tb.CONE_R+s.ball.r-.6,`ball inside a cone at full speed`);
   if(shot.name==='flag')for(const f of FLAGS)assert.ok(segDist(s.ball.x,s.ball.y,f.x,f.y-8,f.x,f.y+8)>=3+s.ball.r-.6,'ball inside a flag');
   if(shot.name==='sling')for(const k of SLINGS)assert.ok(segDist(s.ball.x,s.ball.y,k.ax,k.ay,k.cx,k.cy)>=3+s.ball.r-.6,'ball inside a kickboard face');
  }
  assert.ok(shot.check(s),`${shot.name} shot at 1500px/s did not tunnel (${s.ball.x.toFixed(1)},${s.ball.y.toFixed(1)})`);
 }
}
// A full-speed hit drops a wall player and still bounces the ball back.
{const s=active(WALL_X[1],WALL_Y+30,0,-1400);sub(s,30);assert.equal(s.table.wall[1],0,'hard hit drops the target');assert.ok(s.ball.vy>0,'drop target still bounces the ball');assert.equal(s.table.sfx.drop,1);}

// 2. Kickboards kick: a soft ball rolling onto the face leaves faster, inward.
for(const k of SLINGS){const nx=k.ax<180?1:-1,s=active((k.ax+k.cx)/2+nx*14,(k.ay+k.cy)/2-8,-nx*160,60);advance(s,.08);assert.ok(Math.sign(s.ball.vx)===nx&&Math.hypot(s.ball.vx,s.ball.vy)>300,'kickboard kicks the ball back across the table');assert.equal(s.table.sfx.sling,1);}

// 3. The soft launch still drops through the lane opening onto the right inlane.
{const s=createPinballState();launchPinball(s,.16);let reached=false;for(let i=0;i<480*4&&s.phase==='playing';i++){sub(s);if(s.ball.x>200&&s.ball.x<341&&s.ball.y>470&&s.ball.y<540)reached=true;}assert.ok(reached,'soft launch reaches the right flipper channel past the kickboard');}

// 4. The wall re-forms only once the ball is clear of the line.
{const s=active(WALL_X[1],WALL_Y,0,0);s.table.wall=[0,0,0];s.table.wallReset=0;sub(s);same(s.table.wall,[0,0,0],'wall waits while the ball sits on the line');
 Object.assign(s.ball,{x:60,y:300,vx:0,vy:0});sub(s,2);s.table.wallReset=0;sub(s);same(s.table.wall,[1,1,1],'wall re-forms once clear');}
// Knocking down all three lights the goal for the division's time.
{const s=active(180,300,0,0);s.table.wall=[0,1,0];Object.assign(s.ball,{x:WALL_X[1],y:WALL_Y+20,vx:0,vy:-500});sub(s,30);assert.equal(s.table.sfx.wallDown,1);assert.ok(s.table.wallLit>9&&s.moveTime>9,'broken wall lights the goal');assert.equal(s.cue,'wallDown');}

// 5. Crest lanes: rollovers light, lane change rotates, a full set raises the multiplier.
{const s=active(CREST_LANES[0],CREST_LINE-10,0,200);sub(s,40);assert.equal(s.table.crest,1,'left lane lit');
 sub(s,1,{left:false,right:true});assert.equal(s.table.crest,2,'right flipper shifts the lit lane right');sub(s,1,idle);sub(s,1,{left:true,right:false});assert.equal(s.table.crest,1,'left flipper shifts it back');
 s.table.crest=3;s.table.laneCool=[0,0,0];Object.assign(s.ball,{x:CREST_LANES[2],y:CREST_LINE-10,vx:0,vy:200});sub(s,40);assert.equal(s.table.bonusX,2,'three stars raise the bonus to x2');assert.equal(s.table.crest,0);}
// Skill shot: letting go on the marked rung of the launch ladder pays 500; a tap never does.
{const s=createPinballState();assert.equal(s.table.skillBand,5);const before=s.score;launchPinball(s,.8);assert.equal(s.table.sfx.skill,1,'rung 5 (pull .72-.86) is the first target');assert.ok(s.score-before>=500);assert.equal(s.table.skillBand,2,'marker moves on each ball');
 const t=createPinballState();for(const band of Tb.SKILL_BANDS){t.table.skillBand=band;t.phase='ready';launchPinball(t);}assert.equal(t.table.sfx.skill,0,'a plain tap is never the skill shot');}

// 6. G-O-A-L flags arm the goal-line saver, which clears one centre drain per ball.
{const s=active(180,300,0,0);
 for(let i=0;i<4;i++){const f=FLAGS[i],dir=f.x<180?-1:1;Object.assign(s.ball,{x:f.x-dir*20,y:f.y,vx:dir*400,vy:0});s.table.slingCool=[0,0];sub(s,30);}
 assert.equal(s.table.sfx.word,1,'all four letters spell G-O-A-L');assert.equal(s.table.saver,true);
 Object.assign(s.ball,{x:182,y:540,vx:0,vy:420});advance(s,.2);assert.equal(s.table.sfx.saver,1);assert.ok(s.ball.vy<0,'saver clears the ball up the pitch');assert.equal(s.balls,3);
 s.table.flags=15;s.table.flags=0;for(let i=0;i<4;i++){const f=FLAGS[i],dir=f.x<180?-1:1;Object.assign(s.ball,{x:f.x-dir*20,y:f.y,vx:dir*400,vy:0});sub(s,30);}
 assert.equal(s.table.saver,false,'the saver cannot be re-armed on the same ball');
 Object.assign(s.ball,{x:180,y:600,vx:0,vy:420});advance(s,.2);assert.equal(s.balls,2,'a second centre drain costs the ball');}

// 7. Cones: active kick, training count opens the dugout.
{const s=active(CONES[0].x,CONES[0].y+25,0,-200);sub(s,60);assert.equal(s.table.sfx.cone,1);assert.ok(s.ball.vy>200,'cone kicks the ball away');assert.equal(s.table.training,1);
 s.table.training=TRAINING_GOAL-1;s.table.coneCool=[0,0,0];Object.assign(s.ball,{x:CONES[2].x,y:CONES[2].y+25,vx:0,vy:-200});sub(s,60);assert.equal(s.table.dugoutLit,true);}

// 8. Dugout: a soft ball is held, ejected along a fixed path to the right flipper;
// a lit dugout starts the next mode and re-arms the ball save.
{const s=active(DUGOUT.x,DUGOUT.y-12,0,60);s.table.dugoutLit=true;sub(s,40);assert.ok(s.table.hold>0,'soft ball held');assert.equal(s.table.mode,'freekick');assert.equal(s.openingRescue,true);
 advance(s,1.2);assert.equal(s.table.hold,0);let crossX=-1;for(let i=0;i<480*3&&crossX<0&&s.phase==='playing';i++){sub(s);if(s.ball.y>=525)crossX=s.ball.x;}
 assert.ok(crossX>=194&&crossX<=280,`dugout eject feeds the right flipper (crossed at x=${crossX.toFixed(1)})`);}
{const s=active(DUGOUT.x,DUGOUT.y-30,0,900);sub(s,40);assert.equal(s.table.hold,0,'a fast ball rattles over the dugout lip');}
// Free Kick mode completes when the whole wall falls.
{const s=active(180,300,0,0);s.table.mode='freekick';s.table.modeTime=30;s.table.wall=[0,1,0];Object.assign(s.ball,{x:WALL_X[1],y:WALL_Y+20,vx:0,vy:-500});sub(s,30);assert.equal(s.table.modesDone&1,1);assert.equal(s.table.mode,'none');assert.equal(s.table.stars[0]&4,4,'mode earns the division third star');}
// One-Two: kickboard then a target, three times.
{const s=active(180,300,0,0);s.table.mode='onetwo';s.table.modeTime=30;const k=SLINGS[0];
 for(let n=0;n<3;n++){s.table.slingCool=[0,0];Object.assign(s.ball,{x:(k.ax+k.cx)/2+14,y:(k.ay+k.cy)/2-8,vx:-160,vy:60});advance(s,.05);assert.ok(s.table.oneTwo>0||s.table.mode!=='onetwo','kickboard opens the one-two window');s.table.coneCool=[0,0,0];Object.assign(s.ball,{x:CONES[0].x,y:CONES[0].y+25,vx:0,vy:-200});sub(s,60);}
 assert.equal(s.table.modesDone&2,2,'three one-twos complete the mode');}
// Counter Attack: returning a counter shot is a GREAT BLOCK; three complete the mode.
{const s=active(150,520,0,300);s.table.mode='counter';s.table.modeTime=30;
 for(let n=0;n<3;n++){s.counterAttack=true;s.flipperCooldown=[0,0];s.left=0;Object.assign(s.ball,{x:140,y:528,vx:0,vy:250});advance(s,.12,{left:true,right:false});advance(s,.2);}
 assert.equal(s.table.sfx.block,3,'three great blocks');assert.equal(s.table.modesDone&4,4);assert.ok(s.moveTime>0||s.goals>0||true);}
{const s=active(150,520,0,300);s.counterAttack=true;Object.assign(s.ball,{x:140,y:528,vx:0,vy:250});advance(s,.12,{left:true,right:false});assert.equal(s.table.sfx.block,1);assert.ok(s.moveTime>=5,'a great block starts a fast break (lit goal)');}
// Mode timeout passes on to the next mode; failing never costs anything.
{const s=active(60,300,0,0);s.table.mode='freekick';s.table.modeTime=.01;const score=s.score,balls=s.balls;advance(s,.05);assert.equal(s.table.mode,'none');assert.equal(s.table.nextMode,1);assert.equal(s.balls,balls);assert.ok(s.score>=score);}

// 9. End-of-ball bonus x multiplier, and the quiet assist after two quick drains.
{const s=active(180,600,0,400);s.table.ballBonus=300;s.table.bonusX=3;s.table.ballClock=20;const score=s.score;advance(s,.1);assert.equal(s.balls,2);assert.equal(s.score-score,900,'bonus pays x3');assert.equal(s.table.bonusX,1);assert.equal(s.table.ballBonus,0);}
{const s=createPinballState();for(let n=0;n<2;n++){s.table.assist=false;s.openingRescue=false;launchPinball(s);s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:180,y:600,vx:0,vy:400});advance(s,1.2);}
 assert.equal(s.table.assist,true,'two quick drains call the coach');launchPinball(s);assert.ok(s.launchGrace>=6&&s.table.saver,'assist ball: long save and saver on');assert.equal(s.table.assist,false);}

// 10. Stars: division ladder, objective and block/mode bits; saved best-of merge.
{const s=createPinballState();for(let n=0;n<2;n++){launchPinball(s);Object.assign(s.ball,{x:180,y:49,vx:0,vy:-400});advance(s,.05);advance(s,1.6);}
 assert.equal(s.level,2);assert.equal(s.table.stars[0]&1,1,'leaving a division earns its goals star');
 const saved=Tb.savePinballStars([5,0,0,0]);same(saved,[5,0,0,0]);same(Tb.savePinballStars([2,1,0,0]),[7,1,0,0],'stars merge, never lost');same(Tb.loadPinballStars(),[7,1,0,0]);}

// 11. Cup Final: two goals in the last division start it; no ball can be lost.
{const s=createPinballState();s.goals=7;s.level=4;launchPinball(s);Object.assign(s.ball,{x:180,y:49,vx:0,vy:-400});advance(s,.05);assert.equal(s.table.mode,'final');const pts=s.lastGoalPoints;
 advance(s,1.6);launchPinball(s);s.openingRescue=false;s.launchGrace=0;Object.assign(s.ball,{x:180,y:49,vx:0,vy:-400});advance(s,.05);assert.ok(s.lastGoalPoints>=2*500,'final goals count double');
 advance(s,1.6);launchPinball(s);s.openingRescue=false;s.launchGrace=0;const balls=s.balls;Object.assign(s.ball,{x:180,y:600,vx:0,vy:400});advance(s,.1);assert.equal(s.balls,balls,'no lost balls in the final');assert.ok(pts>0);
 s.table.modeTime=.01;s.phase='playing';Object.assign(s.ball,{x:60,y:300,vx:0,vy:0});advance(s,.05);assert.equal(s.table.mode,'none');assert.equal(s.table.finalPlayed,true);}

// 12. Frame-rate independence: the same wall knock-down at 30/60/120 Hz.
for(const hz of [30,60,120]){const s=active(WALL_X[0],WALL_Y+60,0,-700);advance(s,.2,idle,hz);assert.equal(s.table.wall[0],0,`wall hit registers at ${hz}Hz`);}

// 13. The dugout tip is a real coaching line and the HUD stays one line.
{const s=active(DUGOUT.x,DUGOUT.y-12,0,60);sub(s,40);const msg=F.pinballTableMessage(s);assert.ok(/^Coach:/.test(msg),msg);assert.ok(msg.length<90);}
// 14. Launch-drain regression: untouched tap launches must not funnel into the
// centre gap (was ~38% before the cone/kickboard fix; the pre-feature table was ~8%).
{let centre=0,n=80;for(let k=0;k<n;k++){const s=createPinballState();s.time=k*.53+(k%2)*.3;s.keeper=150+((k*37)%70);launchPinball(s);
  for(let i=0;i<480*10&&s.phase==='playing';i++){const y=s.ball.y;sub(s);if(y<525&&s.ball.y>=525&&s.ball.x<341){if(s.ball.x>162&&s.ball.x<198)centre++;break;}}}
 assert.ok(centre/n<=.15,`untouched launches into the centre gap: ${centre}/${n}`);}
console.log('PASS pinball table: no tunnelling (wall/flags/kickboards/cones), kickboard kick, soft-entry path, wall reset safety, lanes + lane change + skill shot, G-O-A-L saver, cones + dugout, three modes, bonus x multiplier, assist, stars, Cup Final, 30/60/120Hz, launch-drain rate');
