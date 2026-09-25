// Defensive / goalkeeper iconic-play templates: shape, physics sanity, contacts and determinism.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n),console,Math,Map,WeakMap,Set,Error});return m.exports;}
const {DEFENCE_TEMPLATES:T}=load(path.join(__dirname,'../lib/town/iconicPlay/defence.ts'));

const IDS=['save','penalty_save','sweeper_keeper','last_ditch_tackle','aerial_clearance'];
const FIELD={pitch:{hw:340,len:900,mouth:75,boxD:165},court:{hw:200,len:560,mouth:50,boxD:120}};
const LEEWAY=40,MAX_BALL=2500,CROSSBAR=40;
const lerp=(keys,t)=>{if(t<=keys[0][0])return keys[0].slice(1);const n=keys.length;if(t>=keys[n-1][0])return keys[n-1].slice(1);let i=1;while(keys[i][0]<t)i++;const a=keys[i-1],b=keys[i],u=(t-a[0])/(b[0]-a[0]);return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const sorted=(keys,dur,what)=>{let prev=-1;for(const k of keys){assert(k.every(Number.isFinite),what+' finite');assert(k[0]>prev,`${what}: keys strictly ascending (${k[0]} after ${prev})`);assert(k[0]>=0&&k[0]<=dur+1e-9,`${what}: t ${k[0]} within [0,${dur}]`);prev=k[0];}};

assert.deepEqual(Object.keys(T).sort(),IDS.slice().sort(),'exports exactly the five defensive templates');
const SEEDS=[0,1,7,42,1234,99999,2166136261,0xdeadbeef];
const PARAMS=[{},{dive:'left'},{dive:'right'},{side:'left',dive:'left'},{side:'right',dive:'right'},{side:'center',dive:'left'},{side:'left',dive:'right',distance:'long'},{side:'right',distance:'box'}];
let count=0;const durations=[];
for(const id of IDS)for(const field of['pitch','court'])for(const seed of SEEDS)for(const params of PARAMS){
 const F=FIELD[field],tag=`${id}/${field}/${seed}/${JSON.stringify(params)}`,play=T[id](params,seed,field);count++;
 assert.equal(play.field,field,tag);
 assert(play.duration>=5.5&&play.duration<=8,`${tag}: duration ${play.duration}`);durations.push(play.duration);
 assert.deepEqual(play,T[id]({...params},seed,field),tag+': deterministic');
 // Keyframes and bounds.
 const inside=(x,y,what)=>assert(Math.abs(x)<=F.hw+LEEWAY&&y>=-LEEWAY&&y<=F.len+LEEWAY,`${tag}: ${what} (${x.toFixed(1)},${y.toFixed(1)}) inside ${field}`);
 const stars=play.actors.filter(a=>a.role==='star');assert.equal(stars.length,1,tag+': one star');const star=stars[0];
 assert.equal(new Set(play.actors.map(a=>a.id)).size,play.actors.length,tag+': unique ids');
 for(const a of play.actors){sorted(a.track,play.duration,`${tag} ${a.id} track`);for(const [,x,y] of a.track)inside(x,y,a.id);
  let pt=-1;for(const p of a.poses??[]){assert(p.t>=pt&&p.t>=0&&p.t<=play.duration,`${tag}: ${a.id} poses sorted in range`);pt=p.t;}
  // Players move at human(ish) speed: nobody teleports.
  for(let i=1;i<a.track.length;i++){const v=dist(a.track[i].slice(1),a.track[i-1].slice(1))/(a.track[i][0]-a.track[i-1][0]);assert(v<=260,`${tag}: ${a.id} speed ${v.toFixed(0)} u/s`);}}
 sorted(play.ball,play.duration,tag+' ball');
 assert.equal(play.ball[0][0],0,tag+': ball starts at t=0');assert.equal(play.ball[play.ball.length-1][0],play.duration,tag+': ball keyed to the end');
 for(const [,x,y,h] of play.ball){inside(x,y,'ball');assert(h>=0&&h<=200,`${tag}: ball height ${h}`);}
 for(const e of play.events){assert(e.t>=0&&e.t<=play.duration,tag+': event in range');inside(e.x,e.y,'event '+e.kind);}
 let pe=-1;for(const e of play.events){assert(e.t>=pe,tag+': events sorted');pe=e.t;}
 // Ball physics: continuous and never faster than a thunderbolt.
 for(let i=1;i<play.ball.length;i++){const a=play.ball[i-1],b=play.ball[i],v=Math.hypot(b[1]-a[1],b[2]-a[2],b[3]-a[3])/(b[0]-a[0]);assert(v<=MAX_BALL,`${tag}: ball speed ${v.toFixed(0)} u/s`);}
 // No goal: no 'net' event, and the ball never crosses the line inside the mouth under the bar.
 assert(!play.events.some(e=>e.kind==='net'),tag+': no net event');
 for(let t=0;t<=play.duration;t+=1/120){const [x,y,h]=lerp(play.ball,t);assert(!(y<=0&&Math.abs(x)<F.mouth+2&&h<CROSSBAR+4),`${tag}: ball in the goal mouth at t=${t.toFixed(2)} (${x.toFixed(1)},${y.toFixed(1)},${h.toFixed(1)})`);}
 const [bx,by]=play.ball[play.ball.length-1].slice(1);assert(!(by<=4&&Math.abs(bx)<F.mouth),tag+': ball does not finish in the goal mouth');
 // ~1 s closing hold: the star and ball are still for the last 0.9 s and the star celebrates.
 const tHold=play.duration-.9;assert(dist(lerp(star.track,tHold),lerp(star.track,play.duration))<.01,tag+': star still in the closing hold');
 assert(dist(lerp(play.ball,tHold),lerp(play.ball,play.duration))<.01,tag+': ball still in the closing hold');
 const cel=(star.poses??[]).find(p=>p.pose==='celebrate');assert(cel&&cel.t<=play.duration-1+1e-9&&cel.t+cel.hold>=play.duration-1e-6,tag+': star celebrates through the end');
 const bursts=play.events.filter(e=>e.kind==='burst');assert.equal(bursts.length,1,tag+': one burst (the defining contact)');const burst=bursts[0];
 // The burst is where the ball is and within reach of the star at that moment.
 assert(dist(lerp(play.ball,burst.t),[burst.x,burst.y])<3,`${tag}: burst on the ball`);
 const reach=dist(lerp(star.track,burst.t),[burst.x,burst.y]);assert(reach<=25,`${tag}: burst ${reach.toFixed(1)} u from the star`);
 // The ball is struck at speed before the defining contact (shot/pass/cross), from a player's feet.
 const sp=play.events.find(e=>e.kind==='speed'&&e.t<burst.t&&dist(lerp(play.ball,e.t),[e.x,e.y])<3);
 if(id!=='last_ditch_tackle'){assert(sp,tag+': speed event on the strike');assert(play.actors.some(a=>a.role==='opp'&&(a.poses??[]).some(p=>p.pose==='kick'&&Math.abs(p.t-sp.t)<.1)&&dist(lerp(a.track,sp.t),[sp.x,sp.y])<14),tag+': a kicking opponent is at the ball when it is struck');}
 const pose=(name)=>(star.poses??[]).find(p=>p.pose===name);
 if(id==='save'||id==='penalty_save'){
  const d=(star.poses??[]).find(p=>p.pose==='dive-left'||p.pose==='dive-right');assert(d,tag+': the star dives');
  if(params.dive)assert.equal(d.pose,'dive-'+params.dive,tag+': dive honours params.dive');
  assert(d.t<=burst.t&&d.t+d.hold>=burst.t,tag+': the dive pose covers the save');
  assert(lerp(star.track,0)[1]<=12,tag+': the keeper starts in goal');
  assert(Math.sign(burst.x)===(d.pose==='dive-left'?-1:1),tag+': the save is on the dive side');
  const hand=dist(lerp(star.track,d.t),[burst.x,burst.y]);assert(hand>reach,tag+': the keeper actually moves to the ball');
  const [ex]=play.ball[play.ball.length-1].slice(1);assert(Math.abs(ex)>F.mouth,tag+': parried wide of the post');
 }
 if(id==='penalty_save'){assert(play.events.some(e=>e.kind==='whistle'),tag+': whistle');const spot=field==='pitch'?110:90;assert(dist(play.ball[0].slice(1),[0,spot])<1&&play.ball[1][1]===play.ball[0][1]&&play.ball[1][2]===play.ball[0][2],tag+': ball waits on the penalty spot');}
 if(id==='sweeper_keeper'){assert(burst.y>F.boxD,`${tag}: keeper wins it outside the box (${burst.y.toFixed(0)})`);assert(lerp(star.track,0)[1]<F.boxD*.5,tag+': keeper starts near goal');
  const striker=play.actors.find(a=>a.id==='striker');assert(dist(lerp(striker.track,burst.t),[burst.x,burst.y])>12,tag+': keeper gets there first');
  assert(pose('kick')||pose('slide'),tag+': clears with a kick or slide');}
 if(id==='last_ditch_tackle'){const sl=pose('slide');assert(sl&&sl.t<burst.t&&sl.t+sl.hold>=burst.t,tag+': the slide pose covers the tackle');
  const striker=play.actors.find(a=>a.id==='striker');assert((striker.poses??[]).some(p=>p.pose==='fall'&&p.t>=burst.t-.1),tag+': the striker stumbles');
  assert(dist(lerp(star.track,0),lerp(play.ball,0))>60,tag+': the star starts behind the play');
  const [ex,ey]=play.ball[play.ball.length-1].slice(1);assert(ey>burst.y+20,tag+': the ball squirts away from goal');}
 if(id==='aerial_clearance'){const hd=pose('head'),jp=pose('jump');assert(hd&&jp&&jp.t<hd.t,tag+': jump then head');
  const [x,y,h]=lerp(play.ball,hd.t+.03),at=lerp(star.track,hd.t+.03);assert(dist(at,[x,y])<=10,`${tag}: header where the ball is (${dist(at,[x,y]).toFixed(1)})`);assert(h>=30,tag+': headed in the air');
  assert(Math.abs(hd.t+.03-burst.t)<.06,tag+': burst at the header');
  assert(play.lane&&play.lane.from>=burst.t-.01&&play.lane.to>play.lane.from&&play.lane.to<=play.duration,tag+': lane marks the clearance');
  const peak=Math.max(...play.ball.filter(k=>k[0]>burst.t).map(k=>k[3]));assert(peak>=80,tag+': headed high');
  const [,ey]=play.ball[play.ball.length-1].slice(1);assert(ey>burst.y+150,tag+': headed away upfield');}
}
// Variation per seed, but side honoured.
for(const id of IDS){const a=JSON.stringify(T[id]({},1,'pitch')),b=JSON.stringify(T[id]({},2,'pitch'));assert.notEqual(a,b,id+': seeds vary the play');}
for(const s of[-1,1]){const side=s<0?'left':'right';
 const sv=T.save({side},5,'pitch');assert(Math.sign(sv.actors.find(a=>a.role==='opp').track[0][1])===s,'save: shooter comes from params.side');
 const lt=T.last_ditch_tackle({side},5,'pitch');assert(Math.sign(lt.actors.find(a=>a.id==='striker').track[0][1])===s,'tackle: striker on params.side');
 const ac=T.aerial_clearance({side},5,'pitch');assert(Math.sign(ac.actors.find(a=>a.id==='crosser').track[0][1])===s,'clearance: cross from params.side');}
console.log('ICONIC_PLAY_DEFENCE_PASS',count,'plays; durations',Math.min(...durations).toFixed(2),'-',Math.max(...durations).toFixed(2));
