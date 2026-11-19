// Futbol Pinball, Arcade AAA pass (Nov 18 2026). Run: node -r ./scripts/test-ts-cache.cjs tests/pinball-aaa-nov18.cjs
//  1. the kick-off rule: a ball straight off the plunger cannot score (plunger-only play used to farm goals), a kicked ball can
//  2. the Golden Pot: bumper hits fill it (capped), a goal wins it times the goals on this ball, a lost ball empties it
//  3. sound: the plunger voice fires on a launch and reads the launch's power; a new ball clicks; the pot's coin run waits for the fanfare
//  4. the curve: later levels are harder for the same bot, a run always ends, a careful bot survives the opening; runs are deterministic
//  5. the evening comes on with the level; the status tab shows the pot
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {ROOT,createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const load=createLoader(),P=load('lib/games/soccerPinball.ts'),F=load('lib/games/soccerPinballFeel.ts'),SP=load('lib/games/soccerPinballScorePanel.ts');
const idle={left:false,right:false,charge:false};
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
/** A flipper bot at 30 fps: `skill` is the chance it reacts in a frame; `from` starts the run at that endless level. */
function bot(seed,skill,seconds,from=1){const r=rng(seed),s=P.createPinballState();P.beginPinballRun(s,{level:1});s.match=from;const hold=[0,0],dt=1/30;let t=0,wait=0,first=0;
 while(t<seconds&&s.phase!=='over'){const b=s.ball,inp={left:false,right:false,charge:false};
  if(s.phase==='ready'){wait+=dt;if(wait>.3){P.launchPinball(s,.68);wait=0;}}
  if(s.phase==='playing')for(let i=0;i<2;i++){if(hold[i]>0)hold[i]-=dt;else if((i?b.x>180:b.x<=180)&&b.x<341&&b.y>498+r()*18&&b.y<560&&b.vy>-50&&r()<skill)hold[i]=.14;}
  inp.left=hold[0]>0;inp.right=hold[1]>0;const balls=s.balls;P.stepPinball(s,inp,dt);t+=dt;if(!first&&s.balls<balls)first=t;}
 return{s,t,first};}
ok('kick-off rule: the plunger alone never scores; a kicked ball does',()=>{
 for(const power of [.5,.55,.68,.8,.9]){const s=P.createPinballState();P.beginPinballRun(s,{level:1});let t=0,wait=0,direct=0,goals=0,at=0;
  while(t<90&&s.phase!=='over'){if(s.phase==='ready'){wait+=1/60;if(wait>.4){P.launchPinball(s,power);wait=0;at=t;goals=s.goals;}}P.stepPinball(s,idle,1/60);t+=1/60;if(s.goals>goals&&t-at<2.5){direct++;goals=s.goals;}}
  assert.equal(direct,0,`power ${power}: goals straight off the plunger`);assert(s.level<=2,`power ${power}: plunger-only play stays in the first divisions (got ${s.level})`);}
 // the closed goal line is called once, with a sound
 {const k=P.createPinballState(),f=F.createPinballFeel(),cues=[];P.launchPinball(k,.5);F.stepPinballFeel(f,k,1/60,()=>{});for(let i=0;i<240&&k.sfx.kickoff===0;i++){P.stepPinball(k,idle,1/60);F.stepPinballFeel(f,k,1/60,(g,c)=>cues.push(c));}
  assert(k.sfx.kickoff>0,'a half-power launch meets the closed goal line');assert(cues.includes('block'));assert.equal(F.pinballFeelMessage(f,k),'KICK IT FIRST! A goal needs a flipper kick.');assert.equal(SP.scoreCall(F.pinballFeelMessage(f,k)).title,'KICK IT FIRST!');}
 const s=P.createPinballState();P.launchPinball(s);assert.equal(s.kickoff,true);
 // the same ball, kicked once (the flipper counter moved): the goal counts
 s.sfx.flipper++;Object.assign(s.ball,{x:s.keeper<180?235:125,y:60,vx:0,vy:-300});for(let i=0;i<30&&s.phase==='playing';i++)P.stepPinball(s,idle,1/60);assert.equal(s.phase,'goal');assert.equal(s.kickoff,false);
 // down past the kick-off line without a kick: the rule is over too
 const d=P.createPinballState();P.launchPinball(d,.3);for(let i=0;i<600&&d.kickoff&&d.phase==='playing';i++)P.stepPinball(d,idle,1/60);assert(d.phase!=='playing'||!d.kickoff,'the rule ends once the ball is in play');
});
ok('Golden Pot: hits fill it, a goal wins it times the goals on this ball, a drain empties it',()=>{
 assert.equal(P.PINBALL_POT_STEP,10);assert.equal(P.PINBALL_POT_MAX,1000);assert.equal(P.PINBALL_POT_GOALS,3);
 const s=P.createPinballState();P.launchPinball(s);s.kickoff=false;
 const fill=n=>{s.pot=Math.min(P.PINBALL_POT_MAX,s.pot+n*P.PINBALL_POT_STEP);};
 // a real hit: the ball into a cone scores into the pot through the step itself
 {const c=P.createPinballState();P.launchPinball(c);c.kickoff=false;const before=c.table.sfx.cone+c.sfx.bumper+c.table.sfx.sling;let t=0;while(t<20&&c.phase==='playing'&&c.table.sfx.cone+c.sfx.bumper+c.table.sfx.sling===before){P.stepPinball(c,idle,1/60);t+=1/60;}
  if(c.phase==='playing'){const hits=c.table.sfx.cone+c.sfx.bumper+c.table.sfx.sling-before;assert(hits>0);assert.equal(c.pot,hits*P.PINBALL_POT_STEP,'each bumper, cone or slingshot hit adds one step');}}
 const score=()=>{const k=s.keeper;Object.assign(s.ball,{x:k<180?238:122,y:55,vx:0,vy:-300});const before=s.score;for(let i=0;i<30&&s.phase==='playing';i++)P.stepPinball(s,idle,1/60);assert.equal(s.phase,'goal');return s.score-before;};
 const relaunch=()=>{for(let i=0;i<200&&s.phase==='goal';i++)P.stepPinball(s,idle,1/60);assert.equal(s.phase,'ready');P.launchPinball(s);s.kickoff=false;};
 fill(20);
 const g1=score();assert.equal(s.lastPot,200);assert.equal(s.lastPotX,1);assert.equal(s.pot,0);assert.equal(P.pinballPotLabel(s),'');
 relaunch();fill(20);assert.equal(P.pinballPotLabel(s),'POT 200 ×2');score();assert.equal(s.lastPot,400,'a brace pays the pot twice');
 relaunch();fill(20);score();assert.equal(s.lastPot,600,'a hat-trick pays it three times');assert.equal(F.pinballCommentary(s),'A HAT-TRICK!');
 relaunch();fill(20);score();assert.equal(s.lastPot,600,'three times is the cap');
 relaunch();fill(500);assert.equal(s.pot,P.PINBALL_POT_MAX,'capped');
 // a real drain empties the pot and the goal count
 s.openingRescue=false;s.launchGrace=0;s.table.saver=false;const balls=s.balls;Object.assign(s.ball,{x:180,y:625,vx:0,vy:400});for(let i=0;i<120&&s.balls===balls;i++)P.stepPinball(s,idle,1/60);
 if(s.balls<balls){assert.equal(s.pot,0);assert.equal(s.potGoals,0);}else assert.fail('the fixture ball did not drain');
 assert(g1>=700,'the pot is part of the goal points: '+g1);
 assert.deepEqual(SP.scoreCall('HAT-TRICK! +1750 · x'),{kind:'goal',title:'HAT-TRICK!',sub:'+1750',life:2.3});assert.equal(SP.scoreCall('BRACE! +900 · x').title,'BRACE!');assert.equal(SP.scoreCall('GOAL! +500 · x').title,'GOAL!');
 assert.equal(SP.scoreCall('GOLDEN POT 250! Score a goal to win it.').kind,'mode');assert.equal(SP.scoreCall('POT FULL! Score a goal to win it.').title,'POT FULL!');
});
ok('sound: launch fires with its own power, a new ball clicks, the coin run waits for the fanfare, the near miss is heard',()=>{
 const f=F.createPinballFeel(),s=P.createPinballState(),cues=[];const emit=(g,c)=>cues.push(c);
 F.stepPinballFeel(f,s,1/30,emit);P.launchPinball(s,.9);assert.equal(s.launchPower,.9);assert.equal(s.plunger,0);F.stepPinballFeel(f,s,1/30,emit);assert.deepEqual(cues,['launch']);
 const audio=read('lib/games/soccerPinballAudio.ts');assert.match(audio,/const power=s\?\(s\.launchPower>0\?s\.launchPower:plungerPull\(s\.plunger\)\):\.68;/);
 for(const cue of ['pb-pot','pb-potUp','pb-ball','pb-tip','pb-saveOff'])assert.match(audio,new RegExp(`case '${cue}':`),cue+' has a voice');
 assert.match(audio,/case 'left':case 'right':\{const p=\(cue==='left'\?\.95:1\.06\)\*jitter\(\.025\);/,'no two flipper knocks are the same');
 // the pot is won in the goal frame; its cue comes .7 s later
 cues.length=0;s.kickoff=false;s.pot=300;F.stepPinballFeel(f,s,1/30,emit);Object.assign(s.ball,{x:s.keeper<180?238:122,y:55,vx:0,vy:-300});for(let i=0;i<30&&s.phase==='playing';i++)P.stepPinball(s,idle,1/60);assert.equal(s.phase,'goal');
 F.stepPinballFeel(f,s,1/30,emit);assert(!cues.includes('pb-pot'),'not in the fanfare frame');assert.equal(F.pinballFeelActive(f),true);for(let i=0;i<24;i++)F.stepPinballFeel(f,s,1/30,emit);assert.equal(cues.filter(c=>c==='pb-pot').length,1);
 // milestone call
 const g=F.createPinballFeel(),m=P.createPinballState();P.launchPinball(m);F.stepPinballFeel(g,m,1/30,()=>{});const got=[];m.pot=260;F.stepPinballFeel(g,m,1/30,(x,c)=>got.push(c));assert.deepEqual(got,['pb-potUp']);assert.match(F.pinballFeelMessage(g,m),/^GOLDEN POT 260! Score a goal to win it\.$/);
 // every fifth of the pot rings (one box lamp), and the end of the ball save is heard
 {const q=F.createPinballFeel(),z=P.createPinballState(),c=[];P.launchPinball(z);F.stepPinballFeel(q,z,1/30,()=>{});for(const pot of [190,210,390,410,600])z.pot=pot,F.stepPinballFeel(q,z,1/30,(x,cue)=>c.push(cue+pot));assert.deepEqual(c,['pb-potUp210','pb-potUp410','pb-potUp600']);
  c.length=0;z.openingRescue=true;z.launchGrace=1;F.stepPinballFeel(q,z,1/30,(x,cue)=>c.push(cue));z.launchGrace=0;F.stepPinballFeel(q,z,1/30,(x,cue)=>c.push(cue));assert.deepEqual(c,['pb-saveOff']);
  // in the real sim the save runs out by itself (and a used save is a rescue, not this cue)
  const r=P.createPinballState(),g=F.createPinballFeel(),h=[];P.beginPinballRun(r,{level:1});P.launchPinball(r,.68);assert(r.launchGrace>0);for(let i=0;i<60*12&&r.phase==='playing'&&!h.includes('pb-saveOff');i++){if(r.ball.y>470&&r.ball.x<341)Object.assign(r.ball,{x:180,y:300,vx:40,vy:-200});P.stepPinball(r,idle,1/60);F.stepPinballFeel(g,r,1/60,(x,cue)=>h.push(cue));}assert(h.includes('pb-saveOff'),'the save ran out and was heard');}
 // a new ball on the plunger
 const h=F.createPinballFeel(),n=P.createPinballState(),heard=[];P.launchPinball(n);F.stepPinballFeel(h,n,1/30,()=>{});n.phase='ready';F.stepPinballFeel(h,n,1/30,(x,c)=>heard.push(c));assert.deepEqual(heard,['pb-ball']);
 n.phase='playing';F.stepPinballFeel(h,n,1/30,()=>{});heard.length=0;n.sfx.tip++;F.stepPinballFeel(h,n,1/30,(x,c)=>heard.push(c));assert(heard.includes('pb-tip'));
});
ok('the curve: later levels are harder, runs end, a careful bot survives the opening, runs are deterministic',()=>{
 const seeds=[3,17,29,41,53,67];let early=0,late=0;
 for(const seed of seeds){early+=bot(seed,.7,400,1).first||400;late+=bot(seed,.7,400,9).first||400;}
 assert(late<early,`the first ball lasts less at level 9 than at level 1 (${late.toFixed(0)} s < ${early.toFixed(0)} s over ${seeds.length} seeds)`);
 for(const seed of seeds){const r=bot(seed,.9,45,1);assert(r.s.phase!=='over',`seed ${seed}: a careful bot is still playing after 45 s`);}
 for(const seed of [5,9]){const r=bot(seed,.12,1500,1);assert.equal(r.s.phase,'over',`seed ${seed}: a careless run ends`);}
 const a=bot(77,.7,240,1),b=bot(77,.7,240,1);assert.equal(a.s.score,b.s.score);assert.equal(a.s.pot,b.s.pot);assert.equal(a.s.goals,b.s.goals);
});
ok('the evening comes on with the level; the status tab shows the pot',()=>{
 const game=read('lib/arcade/games/pinballGame.ts'),panel=read('components/games/PinballScorePanel.tsx'),css=read('components/games/skins/pinball.module.css');
 assert.match(game,/export const PINBALL_EVENING:readonly \(readonly \[number,number,number\]\)\[\]=\[\[1,1,1\],/,'level 1 is the golden hour as it was');
 assert.match(game,/const eve=pinball\.tier\?0:Math\.min\(PINBALL_EVENING\.length-1,Math\.max\(0,pinball\.match-1\)\);/);
 assert.match(game,/const potLamp=i>=insertN-5&&pinball\.phase==='playing'&&pinball\.pot>=\(i-\(insertN-6\)\)\*\(PINBALL_POT_MAX\/5\)\?\.82:0;/,'the box lamps are the pot meter');
 assert.match(game,/function hud\(\):ArcadeHUD\{return\{pinballPot:pinballPotLabel\(pinball\),/);
 assert.match(game,/pinball\.potGoals===3\?'HAT-TRICK':pinball\.potGoals===2\?'BRACE':/);
 assert.match(panel,/\{hud\.pinballPot&&<span data-pb-pot /);assert.match(css,/\.skin \[data-pinball-dmd\] \[data-pb-pot\]\{[^}]*background:var\(--cm-ink\);color:var\(--cm-sun\)/);
 assert.doesNotMatch(css,/data-pb-pot[^}]*animation/,'flat print, no motion');
 // the surf bed: one voice built once, never stopped, fed only while a ball is in play (so the menu, a waiting plunger and pause are silent)
 const audio=read('lib/games/soccerPinballAudio.ts');assert.match(audio,/export function pinballSeaSound\(ctx:AudioContext\|null\)\{/);assert.match(audio,/export const PINBALL_SEA_LEVEL=\.011;/);
 assert.equal((audio.split('export function pinballSeaSound')[1].match(/\.stop\(/g)||[]).length,0,'no stop() calls (WebKit)');
 assert.match(game,/if\(pinball\.phase==='playing'\|\|pinball\.phase==='goal'\)pinballSeaSound\(audioContext\(\)\);/);
});
console.log(failed?'FAILED '+failed:'pinball AAA pass ok');process.exit(failed?1:0);
