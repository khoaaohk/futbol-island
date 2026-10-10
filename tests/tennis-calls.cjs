// Futbol Tennis clarity + rally endings: the "which touch now" call, the open-space read, the court touch guide,
// and the early-court rival that tires in long rallies so a ball placed into space finishes the point.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math,Number,console,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}
const t=load('lib/games/soccerTennis.ts');
function fixture(level,ball,extra={}){const s=t.createTennis(47,level);s.phase='rally';s.rally=3;s.aiReaction=99;Object.assign(s,extra);Object.assign(s.you,{x:0,y:5.3,targetX:0,targetY:5.3,vx:0,vy:0});Object.assign(s.ball,{vx:0,vy:0,vz:0,wx:0,wy:0,wz:0,last:'rival',crossed:true,bounces:1},ball);return s;}

// 1. One call per moment, and the button it lights.
const perfect=fixture(1,{x:.1,y:5.2,z:.3,vz:2},{bounceAge:.12});
assert.equal(t.tennisTouchCall(perfect),'perfect');assert.equal(t.tennisCallButton('perfect'),'kick');
const trap=fixture(4,{x:.2,y:5.1,z:.95,vz:-.2,bounces:0},{bounceAge:9});
assert.equal(t.tennisTouchCall(trap),'trap','a waist-high ball on a two-touch court asks for the trap');assert.equal(t.tennisCallButton('trap'),'trap');
const oneTouch=fixture(1,{x:.2,y:5.1,z:.95,vz:-.2,bounces:0},{bounceAge:9});
assert.notEqual(t.tennisTouchCall(oneTouch),'trap','one-touch courts never ask for a trap');
const header=fixture(2,{x:.2,y:5.1,z:1.8,vz:-.2,bounces:0},{bounceAge:9});
assert.equal(t.tennisTouchCall(header),'header');assert.equal(t.tennisCallButton('header'),'header');
const flat=fixture(1,{x:.2,y:5.1,z:1.8,vz:-.2,bounces:0},{bounceAge:9});
assert(['volley','drop'].includes(t.tennisTouchCall(flat)),'court 1 has no header button, so a high ball is a volley (or let it drop)');
const golden=fixture(2,{x:.2,y:5.1,z:1.8,vz:-.2,bounces:0},{bounceAge:9,goldReady:true,gold:t.TENNIS_GOLD});
assert.equal(t.tennisTouchCall(golden),'bicycle');assert.equal(t.tennisCallButton('bicycle'),'scissor');
const flying=fixture(1,{x:.3,y:-2,z:1.4,vy:4,vz:.5,bounces:0,crossed:false},{bounceAge:9});
assert.equal(t.tennisTouchCall(flying),'move','a ball still on its way: get to the bounce spot');assert.equal(t.tennisCallButton('move'),'');
flying.incomingOut=true;assert.equal(t.tennisTouchCall(flying),'letgo');assert.match(t.tennisCallDetail(flying),/let it go/);
const theirs=fixture(1,{x:0,y:-3,last:'you'});assert.equal(t.tennisTouchCall(theirs),'','no call while the rival plays');
const serve=t.createTennis(47,1);t.beginTennis(serve);assert.equal(t.tennisTouchCall(serve),'');

// 2. Open space: the side the rival has left, named in screen terms in the cue.
const left=fixture(1,{x:.1,y:5.2,z:.3,vz:2},{bounceAge:.12});left.rival.x=1.6;
assert.equal(t.tennisOpenSide(left),-1);assert.match(t.tennisCallDetail(left),/PERFECT WINDOW.*aim ◀ into space/);
left.rival.x=-1.6;assert.equal(t.tennisOpenSide(left),1);assert.match(t.tennisCallDetail(left),/aim ▶/);
left.rival.x=.2;assert.equal(t.tennisOpenSide(left),0);assert.doesNotMatch(t.tennisCallDetail(left),/aim/,'a central rival leaves no single open side');

// 3. The court guide names exactly the touches each court allows, and when to use them.
const guide=l=>t.tennisCourtTouches(l).map(g=>g.touch).join();
assert.equal(guide(1),'kick,aim');assert.equal(guide(2),'kick,header,drop');assert.equal(guide(4),'kick,trap,header,lob');
assert.equal(guide(3),'kick,trap,aim');assert.match(t.tennisCourtTouches(3).at(-1).when,/gold ring/);
for(let l=1;l<=t.TENNIS_COURTS.length;l++){const c=t.TENNIS_COURTS[l-1],g=guide(l).split(',');assert.equal(g.includes('trap'),c.touches>1);assert.equal(g.includes('header'),c.aerial&&c.style!=='drill');for(const x of t.tennisCourtTouches(l))assert(x.when.length>10&&x.when.length<60,'kid-sized line: '+x.when);}

// 4. Early-court rivals tire in long rallies; later courts never do.
assert.equal(t.tennisRivalTire({rally:t.TENNIS_TIRE_RALLY,level:1}),0);assert(t.tennisRivalTire({rally:t.TENNIS_TIRE_RALLY+2,level:1})>0);
assert.equal(t.tennisRivalTire({rally:40,level:2}),1);
for(const l of [3,4,5,6])assert.equal(t.tennisRivalTire({rally:40,level:l}),0,'court '+l+' ends rallies its own way');
function recovery(rally){const s=t.createTennis(5,1);s.phase='rally';s.rally=rally;s.rival.x=2.4;s.rival.targetX=2.4;Object.assign(s.ball,{x:.5,y:3,z:2,vx:0,vy:0,vz:0,last:'rival',crossed:true});t.tickTennis(s,1/120);return s.rival.targetX;}
assert(recovery(3)<1.5,'a fresh rival recovers to the middle');assert(recovery(30)>1.8,'a tired rival lingers out wide, leaving space');
function errors(level,rally){let n=0;for(let seed=1;seed<=150;seed++){const s=t.createTennis(seed*7919,level);s.phase='rally';s.rally=rally;s.aiReaction=0;s.aiSlam=false;s.aiHeader=false;
 Object.assign(s.rival,{x:0,y:-5,targetX:0,targetY:-5});Object.assign(s.ball,{x:.1,y:-5,z:.35,vx:0,vy:0,vz:-.5,wx:0,wy:0,wz:0,last:'you',crossed:true,bounces:1});s.bounceAge=.2;
 const k=s.kickCount;for(let i=0;i<20&&s.kickCount===k;i++)t.tickTennis(s,1/120);if(s.kickCount===k)continue;for(let i=0;i<600&&s.phase==='rally'&&s.ball.bounces===0;i++)t.tickTennis(s,1/120);
 if(s.phase==='point'&&s.pointWinner==='you')n++;}return n;}
const fresh=errors(1,3),tired=errors(1,30);assert(tired>=fresh+8,`a tired rival makes more unforced errors (${fresh} → ${tired} of 150)`);
assert.equal(errors(6,30),errors(6,30),'deterministic');

// 5. Rallies end: a bot that reads the bounce and aims into the open space finishes court 1 in a few minutes.
for(const hz of [30,60]){
 const s=t.createTennis(7919,1);t.beginTennis(s);const rallies=[];let seen=-1;
 for(let i=0;i<hz*600&&s.phase!=='over';i++){
  if(s.phase==='serve'&&s.server==='you'&&s.phaseTime>.5)t.requestTennisKick(s);
  if(s.phase==='rally'&&s.ball.last==='rival'){const l=t.tennisLanding(s);t.setTennisTarget(s,s.ball.bounces?s.ball.x:l.x,(s.ball.bounces?s.ball.y:l.y)+.35);
   if(t.canTennisKick(s,'you')&&seen!==s.kickCount){seen=s.kickCount;const side=t.tennisOpenSide(s)||(s.kickCount%2?1:-1);t.requestTennisKick(s,side*.75);}}
  const before=s.score.you+s.score.rival,rally=s.rally;t.tickTennis(s,1/hz);if(s.score.you+s.score.rival!==before)rallies.push(rally);
 }
 assert.equal(s.phase,'over',`court 1 finishes at ${hz}Hz`);rallies.sort((a,b)=>a-b);
 assert(rallies[rallies.length>>1]<=16,`median rally stays kid-sized at ${hz}Hz: ${rallies}`);assert(s.clock<360,`a court-1 match fits in six minutes (${Math.round(s.clock)}s)`);
}
console.log('PASS tennis calls: one touch call per moment + its button, open-space cue, court touch guide, tiring early rivals, rallies that end');
