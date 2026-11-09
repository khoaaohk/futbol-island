// Quick phrases in live matches (Nov 7 2026; lib/town/quickPhrases.ts, lib/town/livePhraseHud.ts, lib/multiplayer/matchLink.ts):
// the fixed kid-safe set, the rate limit, the wire (a friend's In frame -> the owner -> one trailing Snap value) over the REAL relay
// RoomCore with no relay / protocol change, gating (same match only, the setting, joined only), the settings key registration,
// the pooled bubbles, the AI teammates' cosmetic answers and the feature-detected assist / tackle wind-up readers.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
// A tiny three stub for the HUD module (only Vector3.set / project are used): the "camera" maps world x / z straight to NDC.
class V3{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}copy(v){return this.set(v.x,v.y,v.z);}project(c){const x=(this.x-c.x)/c.span,y=(c.z-this.z)/c.span;this.x=x;this.y=y;this.z=0.5;return this;}}
const THREE={Vector3:V3};
const cache=new Map();
function resolve(base){for(const c of [base,base+'.ts',path.join(base,'index.ts')])if(c.endsWith('.ts')&&fs.existsSync(c)&&fs.statSync(c).isFile())return c;throw new Error('cannot resolve '+base);}
const G={innerWidth:390,innerHeight:844,performance:{now:()=>0}};
function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
    {module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,JSON,Array,Object,Float64Array,Float32Array,Uint8Array,Int32Array,Int16Array,Date,Error,String,get innerWidth(){return G.innerWidth;},get innerHeight(){return G.innerHeight;},performance:G.performance,
     require:id=>id==='three'?THREE:id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(resolve(path.resolve(path.dirname(file),id)))):require(id)});
  cache.set(file,m.exports);return m.exports;}
const Q=load('lib/town/quickPhrases.ts');
const H=load('lib/town/livePhraseHud.ts');
const P=load('multiplayer/protocol/index.ts');
const {RoomCore}=load('multiplayer/relay/src/roomCore.ts');
const N=load('lib/town/match/matchNet.ts');
const {MatchSim}=load('lib/town/match/matchSim.ts');
const L=load('lib/multiplayer/matchLink.ts');
const {C,S,Cap,CAPS_ALL,PROTOCOL_VERSION}=P;
let passed=0;const t=(name,fn)=>{try{fn();passed++;}catch(e){console.error('FAIL: '+name);throw e;}};
const j=a=>JSON.stringify(a);

// ---- 1. the set ----
t('set: eight fixed kid-safe phrases, ids 0..7, no free text anywhere',()=>{
  assert.deepEqual([...Q.PHRASES],['Pass!','Nice one!','Mine!','Over here!','Great goal!','Good game!','Sorry!','Let’s go!']);
  assert.ok(Q.PHRASES.length<=8,'3 wire bits');for(let i=0;i<8;i++)assert.ok(Q.isPhrase(i));assert.ok(!Q.isPhrase(8)&&!Q.isPhrase(-1)&&!Q.isPhrase(1.5));
  assert.deepEqual({...Q.AI_REPLIES},{nice:'Nice!',mine:'Mine!'});
  const hud=read('components/LiveJoinHud.tsx');assert.ok(!/<input|<textarea|contentEditable/i.test(hud),'no text entry in the live HUD');
  assert.ok(/PHRASES\.map/.test(hud)&&/data-join-phrase=\{i\}/.test(hud),'the tray is the fixed list');
});

// ---- 2. rate limit ----
t('rate limit: one per 1.5 s, at most 6 in any 10 s',()=>{
  const l=Q.createPhraseLimiter();assert.deepEqual({...Q.PHRASE_RATE},{gapMs:1500,windowMs:10000,max:6});
  assert.ok(l.take(0));assert.ok(!l.take(1000),'too soon');assert.ok(l.take(1500));
  for(let k=2;k<6;k++)assert.ok(l.take(k*1500),'#'+(k+1));
  assert.ok(!l.can(9000),'7th inside 10 s refused');assert.ok(!l.take(9999));assert.ok(l.take(10000),'the first one left the window');
});

// ---- 3. the wire codec (no protocol change: every frame passes today's validators) ----
t('wire: a phrase rides a real In frame inside the relay check and is stripped before decodeIn',()=>{
  const a=N.createInAccum(),out=[],f={mx:0,my:0},f0={mx:0,my:0};
  N.accumulateIn(a,{mx:.3,my:-.2,shoot:true,shootPower:1,long:1,aimX:.5,aimH:.2});N.encodeIn(a,9,out);const plain=out.slice();N.decodeIn(plain,2,f0);
  for(let id=0;id<8;id++)for(const s of [1,4,7]){const o=plain.slice();Q.packInPhrase(o,id,s);assert.ok(P.parseClient(j(o)),'C.Match In valid id '+id+' serial '+s);
    const srv=[S.Match,2,3,...o.slice(2)];assert.ok(P.parseServer(j(srv)),'S.Match In valid');
    const pv=Q.readInPhrase(srv,3);assert.equal(pv&7,id);assert.equal(pv>>3,s);N.decodeIn(srv,3,f);assert.equal(f.shootPower,f0.shootPower);assert.equal(f.long,f0.long);assert.equal(f.shoot,f0.shoot);}
  const none=[S.Match,2,3,...plain.slice(2)];assert.equal(Q.readInPhrase(none,3),-1,'no phrase in a plain frame');
});
t('wire: the owner\'s trailing Snap value fits the 512 B / 123-number caps and never reads from a plain snapshot',()=>{
  assert.equal(N.SNAP_MAX_BYTES,512);assert.equal(N.SNAP_MAX_LEN,P.MATCH_SNAP_MAX+3);
  for(const [fmt,nh] of [['7v7',2],['9v9',4],['11v11',2],['11v11',22]]){const sim=new MatchSim(41,fmt);sim.windupScale=.32;for(let k=0;k<nh;k++)sim.lockHuman(sim.ids[k]);
    const out=[],box={slot:0,id:0,serial:0};let appended=0;
    for(let i=0;i<240;i++){sim.step(1/60*.32);if(i%5)continue;N.encodeSnap(sim,1,i,.3,out);assert.equal(Q.readSnapPhrase(out,box),null,'plain snapshot: no phrase');
      const v=Q.packSnapPhrase(nh-1,5,3);if(Q.appendSnapPhrase(out,v,N.SNAP_MAX_LEN,N.SNAP_MAX_BYTES)){appended++;const raw=j(out);assert.ok(Buffer.byteLength(raw)<=512,fmt+' '+raw.length);assert.ok(P.parseClient(raw),fmt+' snap valid');
        assert.deepEqual({...Q.readSnapPhrase(out,box)},{slot:nh-1,id:5,serial:3});const b=N.createSnapBuffer();assert.ok(b.push(out,3,0),'the snap buffer takes it');}}
    if(nh<=4)assert.ok(appended>0,fmt+': the phrase fits');}
  const big=new Array(120).fill(99999);assert.equal(Q.appendSnapPhrase(big,Q.packSnapPhrase(1,1,1),123,512),false,'a full frame is never grown');
});

// ---- 4. end to end over the real relay: same match only, no echo, the owner relays ----
function room(){let seed=7;const random=n=>{const a=new Uint8Array(n);for(let i=0;i<n;i++){seed=(seed*1103515245+12345)&0x7fffffff;a[i]=(seed>>8)&255;}return a;};
  const clock={t:1_000_000,now(){return this.t;}};return {r:new RoomCore({code:'K7MQ4R',createdAt:clock.t,clock,random}),clock};}
function peer(){const p={msgs:[],send(x){p.msgs.push(JSON.parse(x));},close(){}};p.of=(op)=>p.msgs.filter(m=>m[0]===op);return p;}
function world(){
  const {r,clock}=room(),T={t:0},clients=[];
  function client(name,hostKey=null){
    const p=peer();r.connect(p);r.message(p,j([C.Hello,PROTOCOL_VERSION,[1,2,3,4,5,6,7,8,9,10,11,12],null,hostKey,null,name]));const me=p.of(S.Welcome)[0][2];
    const subs=new Set(),conn={caps:CAPS_ALL,status:'live',sendMatch(m){r.message(p,JSON.stringify(m));return true;},onMessage(fn){subs.add(fn);return()=>subs.delete(fn);}};
    r.message(p,j([C.Caps,CAPS_ALL]));
    const sim=new MatchSim(270,'7v7');sim.windupScale=.32;const humans=new Map();let puppet=null;const acc=N.createInAccum(),inputs=[];
    const games={simOf:()=>sim,slotOf:(f,h)=>humans.get(h)??null,addFriend(f,h,team,slot){if(sim.players[slot].team!==team)return null;sim.lockHuman(slot);humans.set(h,slot);return slot;},
      dropFriend(f,h){humans.delete(h);},setPuppet(f,on){if(on){puppet=N.createSnapBuffer();sim.enterPuppet();}else{puppet=null;sim.leavePuppet();}},isPuppet:()=>!!puppet,
      pushSnap:(f,d,from,tm)=>!!puppet&&puppet.push(d,from,tm),resetSnaps:()=>puppet?.clear(),encodeSnap:(f,field,seq,out)=>N.encodeSnap(sim,field,seq,0,out),
      friendInput:(f,h,fr)=>{inputs.push({sp:fr.shootPower,long:fr.long});const s=humans.get(h);if(s)sim.humanInput(s,fr);},netInput:()=>acc};
    const shown=[],bus={out:{id:0,serial:0,at:-1e12},show(slot,id){shown.push([slot,id]);}};
    const join={joined:false,format:null,friends:null,friendsChanged(){},say(){},press(){},phrases:bus};
    const link=L.createMatchLink({conn,games,join,me:()=>me,nameOf:()=>'Friend',dressOf:()=>()=>({}),now:()=>T.t});
    let serial=0;
    const c={name,me,sim,humans,shown,inputs,join,link,
      joinMe(slot){sim.lockHuman(slot);humans.set('me',slot);join.joined=true;join.format='7v7';},
      say(id){serial=serial%7+1;bus.out.id=id;bus.out.serial=serial;bus.out.at=T.t;},
      frame(dt){for(const m of p.msgs.splice(0)){const parsed=P.parseServer(JSON.stringify(m));if(parsed)for(const f of subs)f(parsed);}link.update();
        if(puppet)puppet.sample(sim,T.t,sim.ids.indexOf(humans.get('me')),.32/1000);else sim.step(dt*.32);}};
    clients.push(c);return c;}
  const run=(n,dt=1/60)=>{for(let i=0;i<n;i++){T.t+=dt*1000;clock.t+=dt*1000;for(const c of clients)c.frame(dt);}};
  return {r,client,run,T};
}
t('sync: a friend\'s phrase reaches the owner (In) and the other friend (the owner\'s Snap); the owner\'s reaches both; watchers and solo kids see nothing',()=>{
  const w=world(),A=w.client('Ana',w.r.hostKey),B=w.client('Ben'),Cc=w.client('Cai'),D=w.client('Dot');
  const g=A.sim.ids.filter(id=>!A.sim.players[id].isGK&&A.sim.players[id].team==='gold');
  A.joinMe(g[0]);w.run(3);B.joinMe(g[1]);w.run(3);Cc.joinMe(g[2]);w.run(30);
  assert.equal(A.link.state.owner,true);assert.equal(B.link.state.joined,true);assert.equal(Cc.link.state.joined,true);
  const ib=A.sim.ids.indexOf(g[1]),ia=A.sim.ids.indexOf(g[0]);
  B.say(3);w.run(30);
  assert.deepEqual(A.shown,[[ib,3]],'the owner shows Ben\'s "Over here!" once');assert.deepEqual(Cc.shown,[[ib,3]],'Cai sees it once (owner relay)');
  assert.deepEqual(B.shown,[],'no echo of my own');assert.deepEqual(D.shown,[],'not in the match: nothing');
  assert.ok(A.inputs.every(x=>x.sp<=1&&x.long<=1),'the owner\'s sim never sees the phrase bits');
  A.say(1);w.run(30);assert.deepEqual(B.shown,[[ia,1]]);assert.deepEqual(Cc.shown,[[ib,3],[ia,1]]);assert.equal(A.shown.length,1,'the owner never echoes its own');
  B.say(3);w.run(30);assert.equal(Cc.shown.length,3,'the same phrase again (a new serial) shows again');
  w.run(120);assert.equal(Cc.shown.length,3,'and only once');
});
t('no relay / protocol change: nothing in multiplayer/ knows about phrases; frame caps unchanged',()=>{
  const walk=d=>fs.readdirSync(path.join(ROOT,d),{withFileTypes:true}).flatMap(e=>e.name==='node_modules'?[]:e.isDirectory()?walk(path.join(d,e.name)):/\.(ts|js|mjs|cjs)$/.test(e.name)?[path.join(d,e.name)]:[]);
  for(const f of walk('multiplayer'))assert.ok(!/phrase/i.test(read(f)),f);
  assert.equal(P.MATCH_SNAP_MAX,120);assert.equal(P.MAX_INBOUND_BYTES,512);
  assert.ok(!/quickPhrases/.test(read('lib/town/match/matchNet.ts')),'matchNet untouched by phrases');
});

// ---- 5. the setting ----
t('setting: fi2-match-phrases-v1 registered (snapshot + accounts doc) and the toggle sits in Live matches after Vibration',()=>{
  assert.equal(Q.PHRASE_KEY,'fi2-match-phrases-v1');
  const snap=read('lib/saves/snapshot.ts');assert.ok(/DEVICE_KEYS[^\n]*'fi2-match-phrases-v1'/.test(snap),'device key (never synced: a per-device choice)');
  assert.ok(read('docs/accounts-design.md').includes('`fi2-match-phrases-v1`'));
  const s=read('components/IslandSettings.tsx'),live=s.indexOf('aria-label="Live matches"'),vib=s.indexOf('data-match-haptics'),ph=s.indexOf('data-match-phrases'),fish=s.indexOf('aria-label="Fishing"');
  assert.ok(live>0&&vib>live&&ph>vib&&ph<fish,'Quick phrases inside Live matches, after Vibration');
});

// ---- 6. the HUD: gating, pooled bubbles, AI answers, assist + tackle cue ----
function fakeDom(){const els=new Map(),made=[];
  const mk=sel=>{const a=new Map();const e={sel,hidden:false,style:{},textContent:'',offsetWidth:0,firstElementChild:{textContent:''},isConnected:true,
    setAttribute(k,v){a.set(k,String(v));},removeAttribute(k){a.delete(k);},hasAttribute(k){return a.has(k);},getAttribute(k){return a.has(k)?a.get(k):null;}};made.push(e);return e;};
  const el=sel=>{if(!els.has(sel))els.set(sel,mk(sel));return els.get(sel);};
  const set=(e,k,v)=>{if(!e)return;if(v===null)e.removeAttribute(k);else e.setAttribute(k,v);};
  return {el,set,made,els};}
function hudWorld(rand=()=>1){
  const dom=fakeDom(),clock={t:100000},sounds=[];const hud=H.createPhraseHud({el:dom.el,set:dom.set,sound:g=>sounds.push(g),now:()=>clock.t,random:rand});
  const sim=new MatchSim(5,'7v7');const g=sim.ids.filter(id=>!sim.players[id].isGK&&sim.players[id].team==='gold');sim.lockHuman(g[0]);
  const venue={x:0,z:0,width:30,length:45,yaw:0},cam={x:0,z:0,span:40};
  const frame=(dt=1/60,on=true)=>hud.frame(dt,on,sim,'7v7',g[0],venue,0,cam,false,false);
  return {dom,clock,sounds,hud,sim,g,frame};}
t('gating: phrases only while joined and with the setting on; others\' bubbles hidden with it off',()=>{
  const w=hudWorld();assert.equal(w.hud.say(0),false,'not joined yet');
  w.frame();assert.equal(w.hud.say(0),true,'joined');assert.equal(w.hud.bus.out.id,0);assert.equal(w.hud.bus.out.serial,1);
  assert.equal(w.hud.say(2),false,'rate-limited');w.clock.t+=1600;assert.equal(w.hud.say(2),true);assert.equal(w.hud.bus.out.serial,2);
  w.hud.toggleTray();assert.equal(w.dom.el('[data-join-phrases]').hasAttribute('data-open'),true,'tray opens');w.clock.t+=1600;w.hud.say(4);assert.equal(w.hud.trayOpen,false,'a pick closes it');
  const ib=w.sim.ids.indexOf(w.g[2]);w.hud.bus.show(ib,6);assert.equal(w.hud.pool.items.filter(b=>b.live&&b.key===w.g[2]).length,1,'a friend\'s bubble');
  Q.setPhrasesEnabled(false);w.frame();assert.equal(w.dom.el('[data-join-phrases]').hidden,true,'button hidden with the setting off');assert.equal(w.hud.pool.active,0,'bubbles cleared');
  w.hud.bus.show(ib,6);assert.equal(w.hud.pool.active,0,'others\' phrases hidden');w.clock.t+=5000;assert.equal(w.hud.say(1),false,'no sending either');
  Q.setPhrasesEnabled(true);w.frame();assert.equal(w.dom.el('[data-join-phrases]').hidden,true,'Nov 8 2026: no phrase button at all');
  let rk='kickoff';Object.defineProperty(w.sim,'restartKind',{get:()=>rk,configurable:true});w.frame();assert.equal(w.dom.el('[data-join-phrases]').hidden,true,'button stays hidden even on a dead ball');
  w.frame(0,false);w.hud.bus.show(ib,6);assert.equal(w.hud.pool.active,0,'left the match: nothing shows');
});
t('bubbles: a fixed pool of 4, one per speaker, ~2 s, pop restarted per phrase, fade at the end, transform only',()=>{
  const p=Q.createBubblePool(4);for(const k of ['a','b','c','d'])p.add(k,'x');p.step(.1);p.add('a','y');assert.equal(p.active,4,'same speaker reuses');
  p.add('e','z');assert.equal(p.active,4);assert.ok(!p.items.some(b=>b.key==='b'),'the oldest went');p.step(2.1);assert.equal(p.active,0,'gone after showS');
  const w=hudWorld();w.frame();w.hud.say(3);w.frame();
  const before=w.dom.made.length;for(let i=0;i<40;i++){w.clock.t+=1600;w.hud.limiter.reset();w.hud.bus.show(w.sim.ids.indexOf(w.g[1+i%3]),i%8);w.hud.say(i%8);w.frame();}
  const bubbles=[...w.dom.els.keys()].filter(k=>k.startsWith('[data-join-bubble='));assert.equal(bubbles.length,Q.BUBBLE.pool,'only the pooled elements are ever touched');
  assert.ok(w.dom.made.length-before<=4,'no new elements per phrase');
  const e=w.dom.el('[data-join-bubble="0"]');assert.ok(/^translate\(\d+px,\d+px\)$/.test(e.style.transform),'spot as a transform');assert.ok(e.hasAttribute('data-show'));
  for(let i=0;i<120;i++)w.frame();assert.equal(w.hud.pool.active,0);assert.ok(!e.hasAttribute('data-show'),'hidden after ~2 s');
  const css=read('components/LiveJoinHud.module.css');const blk=css.slice(css.indexOf('.bubbles{'));
  assert.ok(/prefers-reduced-motion[^}]*bubble/.test(blk)&&/\.bubbles\[data-calm\] \.bubble>span\{animation:none\}/.test(blk),'no pop with reduced motion or Match effects Light');
  assert.ok(!/\.bubble[^{]*\{[^}]*(left|top|width|height):[^}]*transition/.test(blk.replace(/left:0;top:0/,'')),'no layout transitions');
  assert.ok(/data-join-bubble=\{i\}/.test(read('components/LiveJoinHud.tsx'))&&/length:BUBBLE\.pool/.test(read('components/LiveJoinHud.tsx')),'static pooled markup');
});
t('AI teammates: "Nice!" after a cheer (cosmetic, local), "Mine!" now and then as a teammate near me takes it',()=>{
  const w=hudWorld(()=>0);w.frame();const me=w.sim.players[w.g[0]];
  for(const id of w.sim.ids){const p=w.sim.players[id];if(id!==w.g[0]){p.x=p.team==='gold'?me.x+200:me.x-200;p.y=me.y;}}w.sim.players[w.g[1]].x=me.x+10;
  w.hud.say(1);for(let i=0;i<60;i++)w.frame();assert.ok(w.hud.pool.items.some(b=>b.live&&b.key===w.g[1]&&b.text==='Nice!'),'nearest AI teammate answers');
  w.sim.ball.owner=w.g[0];w.frame();w.sim.ball.owner=w.g[1];w.frame();assert.ok(w.hud.pool.items.some(b=>b.live&&b.key===w.g[1]&&b.text==='Mine!'),'"Mine!" as he takes it');
  const none=hudWorld(()=>1);none.frame();none.hud.say(1);for(let i=0;i<60;i++)none.frame();assert.equal(none.hud.pool.active,1,'only my bubble when the dice say no');
});
t('sim features (feature-detected): assist caption from a goal event, tackle wind-up cue; nothing when the sim lacks them',()=>{
  assert.equal(Q.goalAssist({ids:['g1','g2']}),null);assert.equal(Q.goalAssist({ids:['g1','g2'],lastGoal:{assistSlot:'g2'}}),'g2');assert.equal(Q.goalAssist({ids:['g1','g2'],lastGoal:{assistSlot:1}}),'g2');assert.equal(Q.goalAssist({ids:['g1'],lastGoal:{assistSlot:null}}),null);
  const pl={me:{x:0,y:0,team:'gold'},f:{x:10,y:0,team:'blue'}};
  assert.equal(Q.tackleTelegraph({players:pl},'me',true),false,'no field: no cue');
  assert.equal(Q.tackleTelegraph({players:pl,tackleWindup:{on:'me',t:.2}},'me',false),true);assert.equal(Q.tackleTelegraph({players:pl,tackleWindup:new Map([['f',{target:'me'}]])},'me',false),true);
  assert.equal(Q.tackleTelegraph({players:{me:{...pl.me,tackleWindup:0},f:{...pl.f,tackleWindup:.3}}},'me',true),true,'per-player wind-up near me on the ball');
  const w=hudWorld();w.frame();w.sim.lastGoal={assistSlot:w.g[1]};w.hud.goal();const cap=w.dom.el('[data-join-assist]');assert.ok(cap.hasAttribute('data-show'));assert.ok(/^Assist: /.test(cap.textContent));
  w.sim.lastGoal={assistSlot:w.g[0]};w.hud.goal();assert.equal(cap.textContent,'Assist: you!');for(let i=0;i<200;i++)w.frame();assert.ok(!cap.hasAttribute('data-show'),'caption goes');delete w.sim.lastGoal;
  w.sim.tackleWindup={on:w.g[0]};w.frame();assert.ok(w.dom.el('[data-join-telegraph]').hasAttribute('data-show'));delete w.sim.tackleWindup;for(let i=0;i<60;i++)w.frame();assert.ok(!w.dom.el('[data-join-telegraph]').hasAttribute('data-show'));
});
console.log('live-phrases: '+passed+' checks passed');
