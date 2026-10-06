// Island Strikers difficulty-curve lock (G1, Oct 4 2026). Deterministic probes per round, fast enough for npm test:
// - keeper: a fixed grid of placed shots; save rate may rise with the rounds but in small steps, and the final
//   still lets most well-placed shots in (the finishing lesson does not get harder than the round's idea);
// - press: how long a dribbler who never passes keeps the ball against one defender (rounds shorten it gently);
// - eased retry: every probe is easier after a loss.
// The full-match bot curve lives in the scratch sims (numbers in the iteration log).
const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict'),m={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/arcade/strikerMatch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,Math});
const {createStrikerMatch,strikerInput}=m.exports;
function saveRate(level,assist){let saved=0,total=0;
 for(const sx of [10,13,16])for(const sz of [-6,-2,2,6])for(const aim of [-.85,-.5,.5,.85])for(const power of [.55,.8]){
  const g=createStrikerMatch(),s=g.state,i=strikerInput();s.level=level;g.reset();if(assist){s.assist=true;s.assistLevel=level;}
  for(const p of s.players)if(!p.keeper)p.stun=99;Object.assign(s.players[7],{x:22.5,z:sz*.15});Object.assign(s.players[0],{x:sx,z:sz,stun:0});Object.assign(s.ball,{owner:0,x:sx+.8,z:sz,lock:0});s.selected=0;
  i.shoot=true;i.power=power;i.z=aim;g.step(1/60,i);i.shoot=false;i.z=0;let n=0;while(n++<150&&s.score[0]===0&&s.ball.owner!==7&&!(s.ball.lastTeam===1)&&Math.abs(s.ball.x)<24.95)g.step(1/60,i);
  if(s.score[0]===0&&(s.ball.owner===7||s.ball.lastTeam===1))saved++;total++;}
 return saved/total;}
function pressRate(level,assist){let lost=0,total=0;
 for(const sx of [-6,-5,-4,-3,-2])for(const sz of [-3,-1.5,0,1.5,3])for(const weave of [0,1]){const g=createStrikerMatch(),s=g.state,i=strikerInput();s.level=level;g.reset();if(assist){s.assist=true;s.assistLevel=level;}
  for(const p of s.players)if(p.id!==0&&p.id!==4)p.stun=999;Object.assign(s.players[0],{x:-10,z:0});Object.assign(s.players[4],{x:sx,z:sz});Object.assign(s.ball,{owner:0,x:-9.2,z:0,lock:0});s.selected=0;
  let t=0;while(t<3&&s.ball.owner===0){i.x=1;i.z=weave?Math.sin(t*2.4)*.7:0;g.step(1/60,i);t+=1/60;}if(s.ball.owner!==0)lost++;total++;}
 return lost/total;}
const save=[1,2,3,4].map(l=>saveRate(l,false)),press=[1,2,3,4].map(l=>pressRate(l,false));
console.log('keeper save rate',save.map(v=>v.toFixed(2)).join(' '),'| dribbler tackled within 3 s',press.map(v=>v.toFixed(2)).join(' '));
for(let i=1;i<4;i++){assert(save[i]>=save[i-1]-.02,'keeper never gets worse');assert(save[i]-save[i-1]<=.12,`keeper step ${i} too steep`);assert(press[i]>=press[i-1]-.02,'press never gets softer');assert(press[i]-press[i-1]<=.2,`press step ${i} too steep`);}
assert(save[3]<=.62,'the final keeper still lets most placed shots in');assert(save[0]>=.05,'round 1 keeper still saves some');
assert(press[3]<=.92,'the final press still lets some dribbles through');
const eased=[saveRate(4,true),pressRate(4,true)];console.log('final eased: save',eased[0].toFixed(2),'press',eased[1].toFixed(2));
assert(eased[0]<save[3],'eased keeper saves less');assert(eased[1]<press[3],'eased press wins the ball less often');
console.log('PASS Strikers curve lock: keeper and press ramp in small steps, final stays fair, eased retry is easier');
