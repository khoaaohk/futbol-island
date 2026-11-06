// Join a live game, multiplayer slice 2 (Nov 4 2026; docs/join-live-game-design.md "Multiplayer slice 2"): party friends play the SAME
// live match. Covers the relay v1.8 protocol (Cap.Match, C.Match / S.Match shapes, old clients and old relays untouched), the relay's
// field roster (one human per slot, the first joiner owns the field, In only to the owner, Snap only from the owner, owner migration on
// leave / disconnect, rate limits), the snapshot + input codec (lib/town/match/matchNet.ts: 9v9 and 11v11 fit the 512 B frame cap, a puppet
// sim mirrors the owner's within quantisation), and two / three simulated clients over the real RoomCore (lib/multiplayer/matchLink.ts):
// same or opposite sides, inputs drive the friend's slot on the owner's sim, the picker sees friends' slots with their names, a friend
// leaving hands the slot back to the AI, the owner leaving migrates the match, a taken slot is refused kindly, no Cap.Match = no frames.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
const cache=new Map();
function resolve(base){for(const c of [base,base+'.ts',path.join(base,'index.ts')])if(c.endsWith('.ts')&&fs.existsSync(c)&&fs.statSync(c).isFile())return c;throw new Error('cannot resolve '+base);}
function load(file){file=path.resolve(ROOT,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,
    {module:m,exports:m.exports,Math,Number,Set,Map,Infinity,NaN,console,JSON,Array,Object,Float64Array,Float32Array,Uint8Array,Date,Error,String,
     require:id=>id.startsWith('.')?(id.endsWith('.json')?require(path.resolve(path.dirname(file),id)):load(resolve(path.resolve(path.dirname(file),id)))):require(id)});
  cache.set(file,m.exports);return m.exports;}
const P=load('multiplayer/protocol/index.ts');
const {RoomCore}=load('multiplayer/relay/src/roomCore.ts');
const N=load('lib/town/match/matchNet.ts');
const {MatchSim}=load('lib/town/match/matchSim.ts');
const L=load('lib/multiplayer/matchLink.ts');
const J=load('lib/town/liveJoin.ts');
const {C,S,Cap,CAPS_ALL,MatchKind,MATCH_FIELDS,MATCH_BTN,PROTOCOL_VERSION}=P;
let passed=0;const t=(name,fn)=>{fn();passed++;};
const j=(a)=>JSON.stringify(a);

// ---- 1. protocol ----
t('protocol: Cap.Match 128, CAPS_ALL 255, one new client frame (19 < 20: client size cap) and one server frame (40)',()=>{
  assert.equal(Cap.Match,128);assert.equal(CAPS_ALL,255);assert.equal(C.Match,19);assert.equal(S.Match,40);assert.ok(C.Match<20,'client frames stay under the 512 B cap in encode()');
  assert.equal(N.NET.C_MATCH,C.Match);assert.equal(N.NET.S_MATCH,S.Match);assert.equal(N.NET.JOIN,MatchKind.Join);assert.equal(N.NET.LEAVE,MatchKind.Leave);assert.equal(N.NET.IN,MatchKind.In);assert.equal(N.NET.SNAP,MatchKind.Snap);
  assert.deepEqual([...N.NET_FIELDS],[...MATCH_FIELDS]);assert.deepEqual({...N.NET_BTN},{...MATCH_BTN});
  assert.ok(P.parseClient(j([C.Match,0,0,1,7])));assert.ok(P.parseClient(j([C.Match,1])));
  assert.ok(P.parseClient(j([C.Match,2,5,100,-100,3,0,70,0,-1000,-1000])));assert.ok(P.parseClient(j([C.Match,3,2,1,0,0,0,1350,2000,0,-1,0])));
  for(const bad of [[C.Match,0,9,0,1],[C.Match,0,0,2,1],[C.Match,0,0,0,40],[C.Match,1,0],[C.Match,2,1,2],[C.Match,2,1,0.5,0,0,0,0,0,0,0],[C.Match,4],[C.Match,3,0,'x'],[C.Match,3,0,1e9]])assert.equal(P.parseClient(j(bad)),null,j(bad));
  assert.ok(P.parseServer(j([S.Match,0,0,3,3,0,4,5,1,9])));assert.ok(P.parseServer(j([S.Match,0,2,-1])));
  assert.equal(P.parseServer(j([S.Match,0,0,3,3,0])),null,'roster triples');assert.ok(P.parseServer(j([S.Match,2,4,9,100,0,1,0,70,0,-1000,-1000])));
  assert.equal(P.parseServer(j([S.Match,0,0,3,3,2,4])),null,'team is a bit');
  assert.ok(P.parseClient(j([C.Caps,CAPS_ALL])),'C.Caps carries 255');
});

// ---- 2. relay roster ----
const LOOK=[1,2,3,4,5,6,7,8,9,10,11,12];
function room(){
  let seed=7;const random=(n)=>{const a=new Uint8Array(n);for(let i=0;i<n;i++){seed=(seed*1103515245+12345)&0x7fffffff;a[i]=(seed>>8)&255;}return a;};
  const clock={t:1_000_000,now(){return this.t;}};const r=new RoomCore({code:'K7MQ4R',createdAt:clock.t,clock,random});return {r,clock};
}
function peer(){const p={msgs:[],closed:null,send(x){p.msgs.push(JSON.parse(x));},close(c){p.closed=c;}};p.of=(op,kind)=>p.msgs.filter(m=>m[0]===op&&(kind===undefined||m[1]===kind));p.clear=()=>{p.msgs.length=0;};return p;}
function member(r,caps,hostKey=null){const p=peer();r.connect(p);r.message(p,j([C.Hello,PROTOCOL_VERSION,LOOK,null,hostKey,null,'Kid']));p.id=p.of(S.Welcome)[0][2];r.message(p,j([C.Caps,caps]));return p;}
const roster=(p)=>{const a=p.of(S.Match,0);return a[a.length-1];};
t('relay: first joiner owns the field; one human per slot; In only to the owner; Snap only from the owner; old clients never see S.Match',()=>{
  const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey),b=member(r,CAPS_ALL),old=member(r,127);
  [a,b,old].forEach(p=>p.clear());
  r.message(a,j([C.Match,0,0,0,3]));
  assert.deepEqual(roster(a),[S.Match,0,0,a.id,a.id,0,3]);assert.deepEqual(roster(b),roster(a));assert.equal(old.of(S.Match).length,0,'old client: nothing');
  b.clear();r.message(b,j([C.Match,0,0,1,3]));
  assert.deepEqual(roster(b),[S.Match,0,0,a.id,a.id,0,3],'a taken slot is refused: the joiner gets the roster without itself');
  clock.t+=3000;r.message(b,j([C.Match,0,0,1,10]));
  assert.deepEqual(roster(a),[S.Match,0,0,a.id,a.id,0,3,b.id,1,10],'same field, opposite side');
  a.clear();b.clear();
  r.message(b,j([C.Match,2,1,100,0,MATCH_BTN.pass,0,70,0,-1000,-1000]));
  assert.deepEqual(a.of(S.Match,2)[0],[S.Match,2,b.id,1,100,0,MATCH_BTN.pass,0,70,0,-1000,-1000]);assert.equal(b.of(S.Match,2).length,0);
  r.message(a,j([C.Match,2,1,0,0,0,0,0,0,-1000,-1000]));assert.equal(b.of(S.Match,2).length,0,'the owner sends no inputs');
  r.message(b,j([C.Match,3,0,1,0,0,0,10,10,0,-1,0]));assert.equal(a.of(S.Match,3).length,0,'only the owner snapshots');
  r.message(a,j([C.Match,3,0,1,0,0,0,10,10,0,-1,0]));assert.deepEqual(b.of(S.Match,3)[0],[S.Match,3,0,1,0,0,0,10,10,0,-1,0]);assert.equal(a.of(S.Match,3).length+old.of(S.Match).length,0);
  r.message(old,j([C.Match,0,0,0,5]));assert.equal(a.of(S.Match,0).length,0,'an old-caps client cannot join');assert.equal(old.closed,null);
  // a late Cap.Match client learns every live roster right after its C.Caps
  const late=member(r,CAPS_ALL);assert.deepEqual(roster(late),[S.Match,0,0,a.id,a.id,0,3,b.id,1,10]);
});
t('relay: owner migration (leave, disconnect), a friend leaving frees the slot, the last one out clears the field; rate limits drop silently',()=>{
  const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey),b=member(r,CAPS_ALL),c=member(r,CAPS_ALL);
  r.message(a,j([C.Match,0,2,0,1]));r.message(b,j([C.Match,0,2,1,12]));r.message(c,j([C.Match,0,2,0,4]));
  a.clear();r.message(a,j([C.Match,1]));
  assert.deepEqual(roster(b),[S.Match,0,2,b.id,b.id,1,12,c.id,0,4],'the earliest remaining joiner owns it');
  r.disconnect(b);assert.deepEqual(roster(c),[S.Match,0,2,c.id,c.id,0,4],'a dropped owner: at once (the party slot keeps its grace)');
  clock.t+=5000;r.message(c,j([C.Match,1]));assert.deepEqual(roster(c),[S.Match,0,2,-1],'nobody left');
  r.message(a,j([C.Match,0,0,0,2]));c.clear();
  for(let i=0;i<20;i++)r.message(a,j([C.Match,3,0,i,0,0,0,1,1,0,-1,0]));
  assert.equal(c.of(S.Match,3).length,0,'c is not on that field');assert.equal(a.closed,null,'never bad() for a match frame');
  const d=member(r,CAPS_ALL);r.message(d,j([C.Match,0,0,1,15]));d.clear();clock.t+=1100;
  for(let i=20;i<49;i++)r.message(a,j([C.Match,3,0,i,0,0,0,1,1,0,-1,0]));
  const got=d.of(S.Match,3).length;assert.ok(got>=1&&got<29,'MATCH_RATE drops a flood ('+got+')');
});

// ---- 3. codec ----
t('codec: a 9v9 snapshot with two humans fits the 512 B client frame; a puppet sim mirrors the owner within quantisation',()=>{
  const own=new MatchSim(270+2*41,'9v9'),pup=new MatchSim(270+2*41,'9v9');own.windupScale=pup.windupScale=.48;
  const gold=own.ids.filter(id=>own.players[id].team==='gold'&&!own.players[id].isGK),blue=own.ids.filter(id=>own.players[id].team==='blue'&&!own.players[id].isGK);
  own.lockHuman(gold[0]);own.lockHuman(blue[1]);pup.lockHuman(gold[0]);pup.lockHuman(blue[1]);pup.enterPuppet();
  const buf=N.createSnapBuffer(),out=[];let tMs=0,maxLen=0;
  for(let i=0;i<240;i++){own.humanInput(gold[0],{mx:.6,my:-.8,sprint:true});own.step(1/60*.32);tMs+=1000/60;
    if(i%5===0){N.encodeSnap(own,2,i,.4,out);maxLen=Math.max(maxLen,Buffer.byteLength(JSON.stringify([S.Match,...out.slice(1)])));assert.ok(P.parseClient(JSON.stringify(out)),'valid C.Match Snap');assert.ok(buf.push(out,3,tMs));}}
  assert.ok(maxLen<=P.MAX_INBOUND_BYTES,'9v9 snapshot '+maxLen+' B');
  assert.equal(buf.push(out,3,tMs),false,'a duplicate seq is ignored');
  assert.ok(buf.sample(pup,tMs+N.INTERP_MS+40,-1,.32/1000));
  for(const id of own.ids){if(own.ids.indexOf(id)>=0){/* the last snapshot (held) */}}
  const last=own.ids.map(id=>[Math.round(own.players[id].x*10)/10,Math.round(own.players[id].y*10)/10]);
  // the held frame is the last ENCODED one (i = 235): compare against it by re-encoding nothing — positions must be inside the pitch and the score / owner mirrored
  for(const id of pup.ids){const p=pup.players[id];assert.ok(p.x>=0&&p.x<=270&&p.y>=0&&p.y<=400,id);}
  assert.deepEqual(pup.score,own.score);assert.equal(Math.abs(pup.ball.x-out[7]/10)<1e-9,true);assert.equal(pup.ball.owner,out[10]>=0?own.ids[out[10]]:null);
  for(let k=0;k<pup.ids.length;k++){const p=pup.players[pup.ids[k]];assert.ok(Math.abs(p.x-out[12+k*3]/10)<1e-9&&Math.abs(p.y-out[13+k*3]/10)<1e-9,'held frame '+pup.ids[k]);}
  void last;
  // interpolation between two frames
  const b2=N.createSnapBuffer(),f1=[],f2=[];own.players[own.ids[3]].x=100;N.encodeSnap(own,2,1,0,f1);own.players[own.ids[3]].x=110;N.encodeSnap(own,2,2,0,f2);
  // frames are stamped on the owner's seq clock (seq x SNAP_GAP_MS, QA round 1): one gap apart, sampled half a gap after the first
  b2.push(f1,3,1000);b2.push(f2,3,1000+N.SNAP_GAP_MS);b2.sample(pup,1000+N.SNAP_GAP_MS/2+N.INTERP_MS,-1,.32/1000);assert.ok(Math.abs(pup.players[pup.ids[3]].x-105)<1e-6,'halfway between two snapshots');
  assert.ok(pup.players[pup.ids[3]].vx>0,'velocity from the two snapshots (the rig runs)');
  b2.sample(pup,1100+40,3,.32/1000);assert.ok(pup.players[pup.ids[3]].x>=110,'my own slot: the newest frame, led by its velocity (no interpolation delay)');
});
t('codec: an 11v11 snapshot (22 players + 2 humans) fits the 512 B client frame; a big party rotates the humans\' targets inside MATCH_SNAP_MAX',()=>{
  assert.equal(N.SNAP_MAX_LEN,P.MATCH_SNAP_MAX+3,'matchNet mirrors the protocol frame length');
  for(const nh of [2,8,22]){const own=new MatchSim(352,'11v11'),pup=new MatchSim(352,'11v11');own.windupScale=pup.windupScale=.32;
   const ids=own.ids.filter(id=>!own.players[id].isGK).concat(own.ids.filter(id=>own.players[id].isGK));for(let k=0;k<nh;k++){own.lockHuman(ids[k]);pup.lockHuman(ids[k]);}pup.enterPuppet();
   const out=[],buf=N.createSnapBuffer();let maxLen=0,tMs=0;const seen=new Set();
   for(let i=0;i<300;i++){own.step(1/60*.32);tMs+=1000/60;if(i%5===0){N.encodeSnap(own,3,i/5,.4,out);const raw=JSON.stringify(out);maxLen=Math.max(maxLen,Buffer.byteLength(raw));
    assert.ok(P.parseClient(raw),'11v11 '+nh+' humans: valid C.Match Snap ('+out.length+' numbers)');assert.ok(buf.push(out,3,tMs));
    const hAt=12+own.ids.length*3;for(let k=0;k<out[hAt];k++)seen.add(out[hAt+1+k*3]);}}
   assert.ok(maxLen<=P.MAX_INBOUND_BYTES,'11v11 snapshot '+maxLen+' B');assert.equal(seen.size,nh,'every human\'s targets go out (rotating when they do not all fit)');
   assert.ok(buf.sample(pup,tMs+N.INTERP_MS+40,-1,.32/1000));for(const id of pup.ids){const p=pup.players[id];assert.ok(p.x>=0&&p.x<=270&&p.y>=0&&p.y<=400,id);}
   assert.deepEqual(pup.score,own.score);if(nh===2)console.log('  11v11 snapshot, 22 players + 2 humans: '+maxLen+' B of '+P.MAX_INBOUND_BYTES);}
});
t('codec: controls round trip (stick, held + one-shot buttons, powers, aim) and a tap is never lost between sends',()=>{
  const a=N.createInAccum(),out=[],f={mx:0,my:0};
  N.accumulateIn(a,{mx:.5,my:-.25,pass:true,passPower:0,long:.6,sprint:true});N.accumulateIn(a,{mx:.7,my:-.1,sprint:true});
  assert.ok(a.urgent);N.encodeIn(a,4,out);assert.ok(P.parseClient(JSON.stringify(out)));
  N.decodeIn(out,2,f);assert.equal(f.mx,.7);assert.equal(f.my,-.1);assert.equal(f.pass,true);assert.equal(f.long,.6);assert.equal(f.sprint,true);assert.equal(f.shoot,false);assert.ok(Number.isNaN(f.aimX));
  N.encodeIn(a,5,out);N.decodeIn(out,2,f);assert.equal(f.pass,false,'one-shot cleared after a send');assert.equal(f.sprint,true,'held stays');
  N.accumulateIn(a,{mx:0,my:1,shoot:true,shootPower:.85,aimX:-.6,aimH:1});N.encodeIn(a,6,out);N.decodeIn(out,2,f);assert.equal(f.shoot,true);assert.equal(f.shootPower,.85);assert.equal(f.aimX,-.6);assert.equal(f.aimH,1);
});

// ---- 4. two / three clients over the real relay ----
function world(){
  const {r,clock}=room();const T={t:0};const clients=[];
  function client(name,caps=CAPS_ALL,hostKey=null){
    const p=peer();r.connect(p);r.message(p,j([C.Hello,PROTOCOL_VERSION,LOOK,null,hostKey,null,name]));const me=p.of(S.Welcome)[0][2];
    const subs=new Set();
    const conn={caps:caps&CAPS_ALL,status:'live',sent:[],sendMatch(m){if(!(this.caps&Cap.Match))return false;this.sent.push(m.slice());r.message(p,JSON.stringify(m));return true;},onMessage(fn){subs.add(fn);return()=>subs.delete(fn);}};
    r.message(p,j([C.Caps,conn.caps]));
    const sim=new MatchSim(270,'7v7');sim.windupScale=.32;const humans=new Map();let puppet=null;const acc=N.createInAccum();const log=[];
    const games={simOf:()=>sim,slotOf:(f,h)=>humans.get(h)??null,
      addFriend(f,h,team,slot,nm){if([...humans.values()].includes(slot)||sim.players[slot].team!==team)return null;sim.lockHuman(slot);humans.set(h,slot);log.push(['add',h,slot,nm]);return slot;},
      dropFriend(f,h){const s=humans.get(h);if(s){J.handBack(sim,s,null);humans.delete(h);log.push(['drop',h]);}},// in place, as fieldRuntime.dropFriend (bot fill, Nov 5 2026)
      setPuppet(f,on){if(on){puppet=N.createSnapBuffer();sim.enterPuppet();}else{puppet=null;sim.leavePuppet();}log.push(['puppet',on]);},
      isPuppet:()=>!!puppet,pushSnap:(f,d,from,tm)=>!!puppet&&puppet.push(d,from,tm),resetSnaps:()=>puppet?.clear(),encodeSnap:(f,field,seq,out)=>N.encodeSnap(sim,field,seq,0,out),
      friendInput:(f,h,fr)=>{const s=humans.get(h);if(s){sim.humanInput(s,fr);if(fr.tackle)log.push(['tackle',h]);}},netInput:()=>acc,awake:()=>c.awake!==false};
    const said=[];const join={joined:false,format:null,friends:null,friendsChanged(){},say(x){said.push(x);},press(b){if(b==='leave'){leaveMe();}}};
    function joinMe(slot){sim.lockHuman(slot);humans.set('me',slot);join.joined=true;join.format='7v7';}
    function leaveMe(){const s=humans.get('me');if(s){sim.releaseHuman(s);humans.delete('me');}join.joined=false;join.format=null;}
    const link=L.createMatchLink({conn,games,join,me:()=>me,nameOf:(id)=>clients.find(c=>c.me===id)?.name??'Friend',dressOf:()=>()=>({}),now:()=>T.t});
    const c={name,me,p,conn,sim,humans,log,said,join,link,joinMe,leaveMe,
      steer(fr){if(puppet){N.accumulateIn(acc,fr);}else{const s=humans.get('me');if(s)sim.humanInput(s,fr);}},
      frame(dt){// deliver relay output, then link.update, then the "field runtime" step
        for(const m of p.msgs.splice(0)){const parsed=P.parseServer(JSON.stringify(m));if(parsed)for(const f of subs)f(parsed);}
        link.update();
        if(puppet){puppet.sample(sim,T.t,sim.ids.indexOf(humans.get('me')),.32/1000);if(sim.humans.size)sim.updateCalls(dt*.32);}else sim.step(dt*.32);
      }};
    clients.push(c);return c;
  }
  const run=(n,dt=1/60,each)=>{for(let i=0;i<n;i++){T.t+=dt*1000;clock.t+=dt*1000;for(const c of clients)c.frame(dt);each?.(i);}};
  return {r,clock,T,client,run,clients};
}
const outfield=(sim,team)=>sim.ids.filter(id=>sim.players[id].team===team&&!sim.players[id].isGK);
t('two clients, opposite sides: owner runs it, the friend steers their slot over the network and sees the same match',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben');
  const ga=outfield(A.sim,'gold')[2],bb=outfield(B.sim,'blue')[1];
  B.awake=false;A.joinMe(ga);w.run(3);assert.deepEqual({...A.link.state},{joined:true,owner:true,friends:0,field:0,watching:-1,watched:0});
  assert.equal(A.conn.sent.filter(m=>m[1]===3).length,0,'alone on the field and nobody watching: no snapshots (heat)');
  B.awake=true;w.run(12);assert.equal(B.link.state.watching,0);assert.ok(A.conn.sent.filter(m=>m[1]===3).length>=1,'alone but watched (S.Match Watch): the owner snapshots');
  // Ben's picker sees Ana's slot, with her name, before he joins
  const fs=B.join.friends('7v7');assert.equal(fs.get(ga).name,'Ana');assert.equal(fs.get(ga).team,'gold');
  const opts=J.slotOptions(B.sim,'gold',fs),row=opts.find(o=>o.value===ga);assert.equal(row.disabled,true);assert.equal(row.note,'Ana');
  assert.deepEqual(J.sideCounts(B.sim,fs,{gold:0,blue:0}),{gold:1,blue:0});
  B.joinMe(bb);w.run(4);
  assert.equal(B.link.state.owner,false);assert.ok(B.log.some(e=>e[0]==='puppet'&&e[1]===true),'Ben’s sim is a puppet');
  assert.ok(A.sim.humans.has(bb),'Ana’s sim holds Ben’s slot');assert.ok(B.sim.humans.has(ga),'Ben sees Ana on her slot');
  assert.ok(A.log.some(e=>e[0]==='add'&&e[2]===bb&&e[3]==='Ben'));
  const y0=A.sim.players[bb].y;
  w.run(90,1/60,(i)=>B.steer({mx:Math.sin(i/6)*.3,my:1,sprint:true}));
  assert.ok(Math.abs(A.sim.humans.get(bb).moveY-1)<1e-9,'Ben’s stick reached the owner');assert.ok(A.sim.players[bb].y>y0+10,'…and moved his slot on the owner’s sim');
  const ins=B.conn.sent.filter(m=>m[1]===2).length;assert.ok(ins>=8&&ins<=20,'~12 Hz inputs while the stick moves ('+ins+' in 1.5 s)');
  {const before=B.conn.sent.length;w.run(60,1/60,()=>B.steer({mx:0,my:1,sprint:true}));assert.ok(B.conn.sent.length-before<=3,'a held stick: a 2 Hz keepalive only');}
  const snaps=A.conn.sent.filter(m=>m[1]===3).length;assert.ok(snaps>=27&&snaps<=36,'~12 Hz snapshots ('+snaps+' in 2.6 s)');
  for(const id of A.sim.ids){if(id===bb)continue;const a=A.sim.players[id],b=B.sim.players[id];assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<12,'Ben draws Ana’s match: '+id);}
  assert.deepEqual(B.sim.score,A.sim.score);
  // a tap is delivered (one-shot), not lost between sends
  B.steer({mx:0,my:1,tackle:true});w.run(2);assert.equal(A.log.filter(e=>e[0]==='tackle').length,1,'the tackle press arrived exactly once');
});
t('same side; a friend leaving hands the slot back to the AI; the owner leaving moves the match to the friend’s phone',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben');
  const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(2);B.joinMe(g[3]);w.run(3);
  assert.ok(A.sim.humans.has(g[3])&&B.sim.humans.has(g[0]));assert.equal(A.sim.humanOn.gold,2);
  B.leaveMe();w.run(3);
  assert.ok(!A.sim.humans.has(g[3]),'Ben’s slot is the AI’s again');assert.ok(A.said.some(x=>/Ben left the match/.test(x)));
  assert.ok(B.log.some(e=>e[0]==='puppet'&&e[1]===false),'Ben’s own slot is gone from the shared match');
  // Nov 5 2026: still in the room, not in the match: Ben now WATCHES Ana's real match (a puppet, Ana on her slot, no controls of his)
  assert.equal(B.link.state.watching,0,'Ben watches field 0');assert.equal(B.link.state.joined,false);assert.ok(B.sim.humans.has(g[0]),'…Ana on her slot');assert.equal(B.log.filter(e=>e[0]==='puppet').pop()[1],true);
  B.joinMe(g[3]);w.run(3);assert.equal(B.link.state.owner,false);
  A.leaveMe();w.run(3);
  assert.equal(B.link.state.owner,true,'ownership migrated');assert.ok(B.said.some(x=>/on your phone now/.test(x)));assert.ok(B.log.some(e=>e[0]==='puppet'&&e[1]===false));
  const before=B.sim.stats.time;w.run(30);assert.ok(B.sim.stats.time>before,'Ben’s sim steps again');
});
t('a slot a friend took first is refused kindly; a lost connection ends the shared match gracefully; no Cap.Match: no frames at all',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben'),O=w.client('Old',127);
  const g=outfield(A.sim,'gold');A.joinMe(g[1]);w.run(2);
  B.joinMe(g[1]);w.run(3);// raced into the same slot (his picker had not caught up)
  assert.equal(B.join.joined,false,'Ben steps off');assert.ok(B.said.some(x=>/Ana just took that spot/.test(x)));assert.ok(!A.sim.humans.has('x'));assert.equal(A.link.state.friends,0);
  B.joinMe(g[2]);w.run(3);assert.equal(A.link.state.friends,1);
  B.conn.status='reconnecting';w.run(2);
  assert.ok(B.said.some(x=>/plays on here/.test(x)),'friendly line');assert.equal(B.link.state.joined,false);assert.ok(!B.sim.humans.has(g[1]));assert.equal(B.log.filter(e=>e[0]==='puppet').pop()[1],false);
  O.joinMe(g[4]);w.run(5);assert.equal(O.conn.sent.length,0,'old relay / no Cap.Match: nothing sent');assert.equal(O.join.friends('7v7'),null);assert.equal(A.sim.humans.has(g[4]),false);
});

// ---- 4c. Bot fill (owner Nov 5 2026): a friend takes a bot's slot and gives it back cleanly; races; the owner leaving with friends on ----
const giveBall=(sim,id)=>{const p=sim.players[id];sim.restart=null;sim.goalHold=0;sim.windup=null;Object.assign(sim.ball,{owner:id,target:null,intBy:null,x:p.x,y:p.y,vx:0,vy:0,height:0,lofted:false});sim.possession=p.team;};
t('bot fill: a friend takes the slot of the bot on the ball (ball + spot kept on the owner), and leaving gives it back to a bot in place with the ball',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben');
  const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(3);
  giveBall(A.sim,g[2]);const q=A.sim.players[g[2]],at={x:q.x,y:q.y,role:q.role};
  B.joinMe(g[2]);// Ben's Join reaches the relay; Ana's link adds him a frame or two later (the bot keeps the ball meanwhile)
  for(let i=0;i<8&&!A.sim.humans.has(g[2]);i++){giveBall(A.sim,g[2]);q.x=at.x;q.y=at.y;w.run(1);}
  assert(A.sim.humans.has(g[2]),'Ben holds the slot on Ana’s sim');assert.equal(A.sim.ball.owner,g[2],'the bot’s ball is Ben’s now');
  assert(Math.hypot(q.x-at.x,q.y-at.y)<6&&q.role===at.role,'no teleport: Ben starts where the bot stood, in its role');
  // the picker on a third phone: Ana and Ben by name, every other slot a bot
  const C=w.client('Cy');w.run(3);const opts=J.slotOptions(C.sim,'gold',C.join.friends('7v7'),'7v7');
  assert.equal(opts.find(o=>o.value===g[0]).note,'Ana');assert.equal(opts.find(o=>o.value===g[2]).note,'Ben');assert(opts.find(o=>o.value===g[2]).disabled);
  assert.equal(opts.filter(o=>o.note===J.SLOT_BOT_NOTE).length,opts.length-2,'the rest read Bot');
  w.run(4,1/60,()=>B.steer({mx:0,my:0}));giveBall(A.sim,g[2]);const bx=q.x,by=q.y;
  B.leaveMe();w.run(3);
  assert(!A.sim.humans.has(g[2]),'the bot has the slot back');assert.equal(A.sim.ball.owner,g[2],'…and the ball: no dropped ball');assert(Math.hypot(q.x-bx,q.y-by)<8,'…from where Ben stood');
  // Ben comes back to the same slot
  B.joinMe(g[2]);w.run(4);assert(A.sim.humans.has(g[2]),'re-join the same slot');assert.equal(A.link.state.friends,1);
});
t('bot fill: two friends pick the same bot slot in the same frame: the relay keeps the first, the other is told kindly and the slot is never doubled',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben'),C=w.client('Cy');
  const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(3);
  B.joinMe(g[3]);C.joinMe(g[3]);w.run(4);
  const inB=B.join.joined,inC=C.join.joined;assert.equal(inB+inC,1,'exactly one of them keeps it');
  const loser=inB?C:B,winner=inB?B:C;assert(loser.said.some(x=>new RegExp(winner.name+' just took that spot').test(x)),'the other is told who took it');
  assert(A.sim.humans.has(g[3])&&A.link.state.friends===1,'one human on that slot on the owner');
  loser.joinMe(g[4]);w.run(4);assert.equal(A.link.state.friends,2,'they pick another slot and play');
});
t('the owner leaves while two friends play: the earliest friend runs it, the other stays on, the owner’s slot goes to a bot in place',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben'),C=w.client('Cy');
  const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue');A.joinMe(g[0]);w.run(2);B.joinMe(g[1]);w.run(2);C.joinMe(bl[1]);w.run(4);
  assert.equal(A.link.state.friends,2);
  A.leaveMe();w.run(4);
  assert.equal(B.link.state.owner,true,'Ben (the earliest remaining) runs the match');assert.equal(C.link.state.owner,false,'Cy stays a friend');
  assert(!B.sim.humans.has(g[0]),'Ana’s slot is a bot on Ben’s phone');assert(B.sim.humans.has(bl[1]),'Cy is still on her slot');
  const before=C.sim.players[bl[1]].y;w.run(60,1/60,()=>C.steer({mx:0,my:-1,sprint:true}));
  assert(B.sim.players[bl[1]].y<before-5,'Cy’s controls drive her slot on Ben’s sim');assert(Math.abs(C.sim.ball.x-B.sim.ball.x)<14,'Cy sees Ben’s match');
});
t('calls on every screen + twin owners: a friend on the ball sees teammates call on his puppet; the owner’s snapshot bytes are deterministic',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben');
  const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(2);B.joinMe(g[2]);w.run(4);
  let pupCalls=0,ownCalls=0;w.run(240,1/60,()=>{if(A.sim.ball.owner!==g[2])giveBall(A.sim,g[2]);B.steer({mx:0,my:0});pupCalls+=B.sim.teamCallers.size>0;ownCalls+=A.sim.teamCallers.size>0;});
  assert(ownCalls>30,'the owner’s sim: teammates call for Ben ('+ownCalls+')');assert(pupCalls>30,'Ben’s puppet shows the calls too, from positions alone ('+pupCalls+')');
  const twin=()=>{const s=new MatchSim(270,'7v7');s.windupScale=.32;s.lockHuman(g[0]);s.lockHuman(g[2]);return s;},a=twin(),b=twin(),oa=[],ob=[];
  for(let i=0;i<360;i++){const fr={mx:Math.sin(i/9),my:-1,pass:i%50===0,passPower:.3};for(const s of [a,b]){s.humanInput(g[0],fr);s.humanInput(g[2],{mx:0,my:-.5});s.step(1/60*.32);}
    if(i%5===0){assert.deepEqual(N.encodeSnap(a,0,i,0,oa),N.encodeSnap(b,0,i,0,ob),'twin owners: identical snapshot '+i);}}
  assert(a.stats.passes>0);
});

// ---- 4b. Nov 5 2026: friends WATCH the shared match; the owner's popups and the keeper's hands reach every screen ----
t('protocol + relay: C.Match Watch [19,4,field|-1]; a watcher gets that field\'s Snaps (no roster change, no controls), -1 stops them',()=>{
  assert.equal(MatchKind.Watch,4);assert.equal(N.NET.WATCH,MatchKind.Watch);
  assert.ok(P.parseClient(j([C.Match,4,0])));assert.ok(P.parseClient(j([C.Match,4,-1])));
  for(const bad of [[C.Match,4],[C.Match,4,9],[C.Match,4,0,1],[C.Match,4,-2]])assert.equal(P.parseClient(j(bad)),null,j(bad));
  const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey),b=member(r,CAPS_ALL),w=member(r,CAPS_ALL),far=member(r,CAPS_ALL);
  r.message(a,j([C.Match,0,0,0,3]));r.message(b,j([C.Match,0,0,1,10]));a.clear();r.message(w,j([C.Match,4,0]));
  assert.deepEqual(a.of(S.Match,4).pop(),[S.Match,4,0,1],'the owner learns one friend watches');assert.equal(b.of(S.Match,4).length,0,'only the owner');assert.ok(P.parseServer(j([S.Match,4,0,1])));assert.equal(P.parseServer(j([S.Match,4,0])),null);
  [a,b,w,far].forEach(p=>p.clear());
  r.message(a,j([C.Match,3,0,1,0,0,0,10,10,0,-1,0]));
  assert.equal(b.of(S.Match,3).length,1,'the player still gets it');assert.equal(w.of(S.Match,3).length,1,'the watcher gets it');assert.equal(far.of(S.Match,3).length+a.of(S.Match,3).length,0,'nobody else (and not the owner)');
  assert.equal(w.of(S.Match,0).length,0,'watching changes no roster');
  clock.t+=3000;r.message(w,j([C.Match,4,-1]));assert.deepEqual(a.of(S.Match,4).pop(),[S.Match,4,0,0],'…and when nobody does');w.clear();clock.t+=100;r.message(a,j([C.Match,3,0,2,0,0,0,10,10,0,-1,0]));assert.equal(w.of(S.Match,3).length,0,'stopped');
  clock.t+=3000;r.message(w,j([C.Match,4,0]));r.message(w,j([C.Caps,CAPS_ALL]));w.clear();clock.t+=100;r.message(a,j([C.Match,3,0,3,0,0,0,10,10,0,-1,0]));assert.equal(w.of(S.Match,3).length,0,'a (re)connect (C.Caps) forgets the watch: the client sends it again');
});
t('codec: the owner\'s trick / power shot / slip ride the snapshot (one packed value per human) and bump the puppet\'s serials once',()=>{
  const own=new MatchSim(270,'7v7'),pup=new MatchSim(270,'7v7');own.windupScale=pup.windupScale=.32;
  const g=outfield(own,'gold');own.lockHuman(g[0]);own.lockHuman(g[1]);pup.lockHuman(g[0]);pup.lockHuman(g[1]);pup.enterPuppet();
  const buf=N.createSnapBuffer(),out=[];let seq=0,tMs=0;const send=()=>{N.encodeSnap(own,0,seq++,0,out);assert.ok(P.parseClient(JSON.stringify(out)));tMs+=83;buf.push(out,3,tMs);buf.sample(pup,tMs+N.INTERP_MS,-1,.32/1000);};
  const h0=own.humans.get(g[0]),h1=own.humans.get(g[1]),p0=pup.humans.get(g[0]),p1=pup.humans.get(g[1]);
  h0.trickSerial=5;h0.shotSerial=2;send();assert.equal(p0.trickSerial,0,'the first frame only remembers (an old trick never pops late)');assert.equal(p0.shotSerial,0);
  h0.trickSerial++;h0.trickKind='dragBack';h0.trickSide=-1;send();assert.equal(p0.trickSerial,1,'one trick');assert.equal(p0.trickKind,'dragBack');assert.equal(p0.trickSide,-1);
  send();assert.equal(p0.trickSerial,1,'the same frame values bump nothing');
  h1.shotSerial++;h1.shotPw=1;h1.shotAimed=true;send();assert.equal(p1.shotSerial,1);assert.ok(p1.shotPw>=.95&&p1.shotAimed,'power (POWER_SHOT.full) + aimed');
  h1.shotSerial++;h1.shotPw=.4;h1.shotAimed=false;h0.slipSerial+=2;send();assert.equal(p1.shotSerial,2);assert.ok(p1.shotPw<.95&&!p1.shotAimed,'a soft shot');assert.equal(p0.slipSerial,2,'two slips between frames');
  // backward compatible: a frame without the values (an older owner) still samples and bumps nothing; the hands flag rides the header
  h0.trickSerial++;N.encodeSnap(own,0,seq++,0,out);const H=out[12+own.ids.length*3];out.length=12+own.ids.length*3+1+H*3;tMs+=83;assert.ok(buf.push(out,3,tMs));assert.ok(buf.sample(pup,tMs+N.INTERP_MS,-1,.32/1000));assert.equal(p0.trickSerial,1);
  assert.equal(buf.hands,(out[4]&N.SNAP_FLAG.hands)!==0,'the keeper\'s hands flag');
  const fr=fs.readFileSync(path.join(ROOT,'lib/town/fieldRuntime.ts'),'utf8');
  assert.equal((fr.match(/\(e\.puppet\?e\.puppet\.hands:e\.sim\.keeperHands\)/g)||[]).length,2,'the keeper\'s hands pose (reach + ball in his hands) follows the owner\'s flag on a friend\'s screen');
  const rt=fs.readFileSync(path.join(ROOT,'lib/town/liveJoinRuntime.ts'),'utf8');assert.match(rt,/get timeScale\(\)\{return format&&games\.shared\(format\)\?1:sideways\?\.matches&&state\.phase==='joined'\?0:timeScale;\}/,'slow motion stays off on a shared field');
});
t('a party friend NOT in the match watches the real one (puppet, friends on their slots, no controls); back to their own match when it ends',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben'),Cc=w.client('Cai'),D=w.client('Dee');D.awake=false;
  const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue');A.joinMe(g[0]);B.joinMe(bl[1]);w.run(6);
  assert.equal(Cc.link.state.watching,0,'Cai watches field 0');assert.equal(Cc.link.state.joined,false);
  assert.ok(Cc.sim.humans.has(g[0])&&Cc.sim.humans.has(bl[1]),'Ana and Ben on their slots');assert.ok(Cc.log.some(e=>e[0]==='puppet'&&e[1]===true),'a puppet');
  assert.equal(D.link.state.watching,-1,'Dee is far (field asleep): her own match, nothing sent');assert.equal(D.conn.sent.length,0);
  w.run(90,1/60,(i)=>B.steer({mx:.3,my:1,sprint:true}));
  for(const id of A.sim.ids){const a=A.sim.players[id],c=Cc.sim.players[id];assert.ok(Math.hypot(a.x-c.x,a.y-c.y)<12,'Cai sees Ana\'s match: '+id);}
  assert.deepEqual(Cc.sim.score,A.sim.score);assert.equal(Cc.conn.sent.filter(m=>m[1]===MatchKind.In).length,0,'a watcher sends no controls');
  assert.equal(Cc.conn.sent.filter(m=>m[1]===MatchKind.Watch).length,1,'one Watch frame, not one per frame');
  // a trick of Ana's pops on Cai's screen too (the serial the field runtime and HUD read)
  {const before=Cc.sim.humans.get(g[0]).trickSerial;A.sim.humans.get(g[0]).trickSerial+=1;w.run(12);assert.equal(Cc.sim.humans.get(g[0]).trickSerial,before+1,'the trick reached the watcher');}
  // Cai joins the match he watched: he plays (puppet of Ana's), no extra stop frame spends the Join's rate token
  Cc.joinMe(g[2]);w.run(6);assert.equal(Cc.link.state.joined,true);assert.equal(Cc.link.state.watching,-1);assert.ok(A.sim.humans.has(g[2]),'Cai\'s slot on the owner\'s sim');
  Cc.leaveMe();w.run(6);assert.equal(Cc.link.state.watching,0,'back to watching after Leave');
  A.leaveMe();B.leaveMe();w.run(160);
  assert.equal(Cc.link.state.watching,-1,'the match ended: Cai stops watching');assert.equal(Cc.log.filter(e=>e[0]==='puppet').pop()[1],false,'his own match runs again');
  assert.ok(!Cc.sim.humans.has(g[0])&&!Cc.sim.humans.has(bl[1]),'friends off the slots');
  assert.equal(Cc.conn.sent.filter(m=>m[1]===MatchKind.Watch).pop()[2],-1,'the relay is told (after the 2 s debounce)');
});

t('codec: quick goal reset (Nov 5 2026): the faded ball + its landing on the centre spot reach the friend (flag bits, no extra number)',()=>{
  const own=new MatchSim(311,'7v7'),pup=new MatchSim(311,'7v7');own.windupScale=pup.windupScale=.32;
  const me=outfield(own,'gold')[0];own.lockHuman(me);pup.lockHuman(me);pup.enterPuppet();
  const gk=own.ids.find(id=>own.players[id].team==='blue'&&own.players[id].isGK);own.restart=null;Object.assign(own.ball,{owner:null,target:null,intBy:null,x:135,y:40,vx:0,vy:-250,height:0});
  const buf=N.createSnapBuffer(),out=[];let seq=0,tMs=0,len0=-1,sawHidden=false,landedAt=-1,slid=false;
  for(let i=0;i<60*6;i++){if(own.goalHold<=0&&own.score.gold===0)own.placePlayer(gk,40,20);own.step(1/60*.32);tMs+=1000/60;
    if(i%5===0){N.encodeSnap(own,0,seq++,0,out);if(len0<0)len0=out.length;assert.equal(out.length,len0,'same frame length');assert.ok(P.parseClient(JSON.stringify(out)));buf.push(out,3,tMs);}
    const was=pup.goalReset.serial;buf.sample(pup,tMs,-1,.32/1000);
    if(pup.goalReset.hidden)sawHidden=true;
    if(pup.goalReset.serial!==was){assert.equal(landedAt,-1,'one landing');landedAt=i;}
    if(landedAt>=0&&i-landedAt<20&&(Math.abs(pup.ball.x-135)>.5||Math.abs(pup.ball.y-200)>.5)&&own.isRestart)slid=true;}
  assert.equal(own.score.gold,1,'the owner\'s goal');assert.equal(own.goalReset.serial,1);assert.ok(sawHidden,'the friend fades the ball');assert.ok(landedAt>0,'…and plays the arrival');
  assert.equal(pup.goalReset.serial,1);assert.ok(!slid,'it lands ON the spot (no slide from the net across the pitch)');assert.equal(pup.goalReset.hidden,false);
  // an older reader: the period still decodes (bits 4-6), the reset bits sit above it
  const fl=N.SNAP_FLAG.ballHidden|(3<<N.SNAP_RESET_SHIFT)|(2<<4);assert.equal((fl>>4)&7,2,'period intact');assert.equal(N.SNAP_FLAG.ballHidden,128);
});

t('goal replays (Nov 5 2026, lib/town/goalReplay.ts): the owner and a friend each replay the goal locally, the match never stalls, the snapshots are byte-identical to a phone without replays',()=>{
  const GR=load('lib/town/goalReplay.ts'),Cg=GR.GOAL_REPLAY;
  const own=new MatchSim(311,'7v7'),twin=new MatchSim(311,'7v7'),pup=new MatchSim(311,'7v7');for(const s of [own,twin,pup])s.windupScale=.32;
  const me=outfield(own,'gold')[0];for(const s of [own,twin,pup])s.lockHuman(me);pup.enterPuppet();
  const gk=own.ids.find(id=>own.players[id].team==='blue'&&own.players[id].isGK),ro=GR.createGoalReplay(own.ids.length),rp=GR.createGoalReplay(pup.ids.length);
  const buf=N.createSnapBuffer(),out=[],out2=[],real=1/60;let seq=0,tMs=0,shot=false,kick=-1,rpEnd=-1,roOn=0,rpOn=0;
  for(let i=0;i<60*8;i++){
    if(i===150){for(const s of [own,twin]){s.restart=null;Object.assign(s.ball,{owner:null,target:null,intBy:null,x:135,y:40,vx:0,vy:-250,height:0});}shot=true;}
    if(shot&&own.score.gold===0){own.placePlayer(gk,40,20);twin.placePlayer(gk,40,20);}
    // the owner's frame (shared: never held): replay step, sim step, record + watch, the draw (apply → restore)
    ro.step(real,true,false,own.goalHold,own.isRestart);own.step(real*.32);twin.step(real*.32);ro.record(own,real,own.ball.height,0);ro.watch(own,true,real);
    if(ro.active){roOn++;assert.ok(ro.apply(own));ro.restore(own);}
    tMs+=1000/60;
    if(i%5===0){N.encodeSnap(own,0,seq,0,out);N.encodeSnap(twin,0,seq,0,out2);seq++;assert.deepEqual(out,out2,'the snapshot a friend gets is unchanged by the owner\'s replay');buf.push(out,3,tMs);}
    if(kick<0&&own.score.gold===1&&own.goalReset.serial===1&&!own.isRestart)kick=i;
    // the friend's frame: replay step, sample the snapshots (the puppet is never stepped), record + watch, the draw
    const was=rp.active;rp.step(real,true,false,pup.goalHold,buf.restart);buf.sample(pup,tMs,-1,.32/1000);rp.record(pup,real,buf.ballH,0);rp.watch(pup,true,real);
    if(rp.active){rpOn++;rp.apply(pup);rp.restore(pup);}else if(was&&rpEnd<0)rpEnd=i;
  }
  assert.equal(own.score.gold,1,'the goal');assert.equal(ro.serial,1,'the owner replays it');assert.equal(rp.serial,1,'…and so does the friend (recorded from the snapshots)');
  assert.ok(roOn>20&&rpOn>20,'both play ('+roOn+', '+rpOn+' frames)');assert.ok(rp.dur<=Cg.sharedMax+1e-9&&ro.dur<=Cg.sharedMax+1e-9,'shared: fits the reset beat');
  assert.ok(kick>0,'the owner\'s kick-off is taken on schedule');assert.ok(rpEnd>0&&rpEnd<=kick+30,'the friend\'s replay is over by the live kick-off ('+rpEnd+' vs '+kick+')');
  assert.equal(pup.goalReset.serial,1,'the friend still gets the landing on the spot');
});

// ---- 5. solo and AI-only untouched ----
t('AI-only: a sim that never meets a friend steps exactly as before (enterPuppet / leavePuppet are never called)',()=>{
  const a=new MatchSim(270,'7v7'),b=new MatchSim(270,'7v7');for(let i=0;i<600;i++){a.step(1/60*.32);b.step(1/60*.32);}
  assert.deepEqual(a.score,b.score);assert.equal(a.ball.x,b.ball.x);assert.equal(a.stats.passes,b.stats.passes);
});
// ---- Kick effects on friends' screens (Nov 5 2026, lib/town/match/puppetTouches.ts + lib/town/kickFx.ts) ----
t('kick effects: a friend\'s puppet gets kicks / receives / tackles / goals from the snapshots alone, and the owner\'s snapshot bytes are unchanged',()=>{
  const PT=load('lib/town/match/puppetTouches.ts'),KF=load('lib/town/kickFx.ts'),BE=load('lib/graphics/ballEffects.ts'),V=load('lib/town/venues.ts'),T=require('three');
  const line=[];for(const f of ['7v7','futsal','9v9','11v11','beach']){
    const own=new MatchSim(311,f),twin=new MatchSim(311,f),pup=new MatchSim(311,f);pup.enterPuppet();
    const venue=V.LIVE_VENUES.find(v=>v.id===f),root=new T.Group(),fxOwn=KF.createKickFx(root,venue,BE.createBallEffects()),fxPup=KF.createKickFx(new T.Group(),venue,BE.createBallEffects());
    const buf=N.createSnapBuffer(),pt=PT.createPuppetTouches(),out=[],o2=[],ball=new T.Vector3(),at=(id,o)=>{const p=pup.players[id];if(!p)return false;o.set(p.x/10,0,p.y/10);return true;};
    let tMs=1000,kicksOwn=0,seenOwn=-1;const kinds={};
    for(let i=0;i<60*60;i++){own.step(1/60*.32);twin.step(1/60*.32);tMs+=1000/60;
      fxOwn.consume(own,true,false);ball.set(own.ball.x/10,.3,own.ball.y/10);fxOwn.draw(own,ball,1/60,!own.ball.owner,null);// the owner draws its effects…
      if(i%5===0){N.encodeSnap(own,3,i/5,.4,out);N.encodeSnap(twin,3,i/5,.4,o2);assert.deepEqual(out,o2,f+': effects never touch the owner\'s sim (snapshot bytes = a twin without effects)');buf.push(out,3,tMs);}
      if(buf.sample(pup,tMs,-1,.32/1000)){pt.step(pup,1/60);fxPup.consume(pup,true,false);ball.set(pup.ball.x/10,.3,pup.ball.y/10);fxPup.draw(pup,ball,1/60,!pup.ball.owner,at);}}
    for(let s=Math.max(1,pup.touchSerial-7);s<=pup.touchSerial;s++)kinds[pup.touches[(s-1)%8].kind]=1;
    const so=fxOwn.stats,sp=fxPup.stats;
    assert.ok(sp.kicks>=so.kicks*.6&&sp.kicks>0,f+': the friend sees the kicks ('+sp.kicks+' of '+so.kicks+')');
    assert.ok(sp.receives>0,f+': and the receptions ("got it" rings)');assert.ok(fxPup.rings.stats.spawned>0,f+': rings spawn on the friend\'s screen');
    assert.ok(fxPup.rings.mesh.count<=12&&fxPup.rings.stats.maxLive<=12&&fxPup.rings.mesh.instanceMatrix.count===12,f+': the ring pool never grows');
    assert.equal(own.score.gold+own.score.blue>0?sp.goals>0:true,true,f+': a goal on the owner is a goal touch on the friend');
    line.push(f+' kicks '+sp.kicks+'/'+so.kicks+' recv '+sp.receives+'/'+so.receives+' tackles '+sp.tackles+'/'+so.tackles+' goals '+sp.goals+'/'+(own.score.gold+own.score.blue));
  }
  console.log('  kick effects, friend/owner: '+line.join('; '));
});
t('keeper feel + body moves (Nov 5 2026): a friend sees the owner\'s dives, saves, moves, beaten defenders, shoulders and shield (SNAP_BODY, one more value per human, no protocol change)',()=>{
  const line=[];
  for(const F of ['7v7','9v9','11v11']){const own=new MatchSim(311,F),pup=new MatchSim(311,F);
   const gk=own.ids.find(id=>own.players[id].team==='gold'&&own.players[id].isGK),me=own.ids.find(id=>own.players[id].team==='blue'&&own.players[id].role==='mid');
   for(const s of [own,pup]){s.lockHuman(gk);s.lockHuman(me);}pup.enterPuppet();const buf=N.createSnapBuffer(),out=[];let seq=0,tMs=0,maxLen=0;
   const send=()=>{N.encodeSnap(own,2,seq++,0,out);const raw=JSON.stringify(out);maxLen=Math.max(maxLen,Buffer.byteLength(raw));assert.ok(P.parseClient(raw),F+': valid C.Match Snap');tMs+=83;buf.push(out,3,tMs);buf.sample(pup,tMs+N.INTERP_MS,-1,own.windupScale/1000);};
   const ho=own.humans.get(me),hk=own.humans.get(gk),po=pup.humans.get(me),pk=pup.humans.get(gk);let kinds=new Set(),beats=0,pbeats=0;
   for(let i=0;i<60*30;i++){// one real minute: the keeper dives at every shot, the friend's carrier tricks with the stick every 1.5 s
    const sh=own.shotActive&&own.possession==='blue';own.humanInput(gk,{mx:0,my:0,save:sh&&i%3===0});
    if(i%45===5&&!own.restart&&own.goalHold<=0){const q=own.players[me];Object.assign(own.ball,{owner:me,x:q.x,y:q.y,vx:0,vy:0,target:null,intBy:null,height:0,lofted:false});own.possession='blue';own.ballIsShot=false;ho.guard=0;}// the ball at his feet: a trick to play
    if(i%90===70&&!own.restart&&own.goalHold<=0){const ax=135+((i/90|0)%2?-15:15);Object.assign(own.ball,{owner:null,target:null,intBy:null,x:140,y:330,height:0,lofted:false});const L=Math.hypot(ax-140,62);own.ball.vx=(ax-140)/L*330;own.ball.vy=62/L*330;Object.assign(own,{ballIsShot:true,shotIsGoal:false,ballFlight:0,lastFrom:me,possession:'blue'});own.lastKick.shotHeight=0;}// a shot at the human keeper
    const k=Math.floor(i/45)%4,stick=[[0,1],[1,0],[0,-1],[0,-1]][k];own.humanInput(me,{mx:stick[0],my:stick[1],sprint:k===3,trick:i%45===10,jockey:own.ball.owner!==me});
    const tb=ho.trickSerial;own.step(1/30*own.windupScale);if(ho.trickSerial!==tb){kinds.add(ho.trickKind);if(ho.trickBeat)beats++;}
    if(i%3===0){const pt=po.trickSerial;send();if(po.trickSerial!==pt&&po.trickBeat)pbeats++;}}
   send();
   assert.ok(hk.diveSerial>=5&&hk.saveSerial>=3,F+': the keeper dives and saves ('+hk.diveSerial+', '+hk.saveSerial+')');   assert.equal(pk.diveSerial,hk.diveSerial,F+': every dive reaches the friend');assert.equal(pk.saveSerial,hk.saveSerial,F+': every save');
assert.ok(Math.abs(po.trickSerial-ho.trickSerial)<=1,F+': the friend\'s tricks follow the owner ('+po.trickSerial+'/'+ho.trickSerial+')');
   assert.equal(po.shoulderSerial,ho.shoulderSerial,F+': shoulder challenges');assert.ok(ho.trickSerial>=20&&kinds.size>=3,F+': the scripted carrier plays moves ('+ho.trickSerial+', '+[...kinds]+')');assert.ok(pbeats>=beats-1,F+': beaten defenders stumble on the friend\'s screen too ('+pbeats+'/'+beats+')');
   assert.ok(maxLen<=P.MAX_INBOUND_BYTES,F+': '+maxLen+' B');line.push(F+' dives '+pk.diveSerial+'/'+hk.diveSerial+' saves '+pk.saveSerial+'/'+hk.saveSerial+' tricks '+po.trickSerial+'/'+ho.trickSerial+' ['+[...kinds].join(',')+'] beats '+pbeats+'/'+beats+' shoulders '+po.shoulderSerial+'/'+ho.shoulderSerial);}
  // a friend's kind = the first value's bits 9-10 | the body value's high bit: the flick-up (4) and the spin (3) arrive as themselves
  {const own=new MatchSim(270,'7v7'),pup=new MatchSim(270,'7v7');const g=outfield(own,'gold');own.lockHuman(g[0]);pup.lockHuman(g[0]);pup.enterPuppet();const buf=N.createSnapBuffer(),out=[];let seq=0,tMs=0;
   const send=(trunc)=>{N.encodeSnap(own,0,seq++,0,out);if(trunc)out.length-=own.humans.size;tMs+=83;buf.push(out,3,tMs);buf.sample(pup,tMs+N.INTERP_MS,-1,.32/1000);};const h=own.humans.get(g[0]),p=pup.humans.get(g[0]);
   send();for(const kind of ['roulette','flick','stepover']){h.trickSerial++;h.trickKind=kind;send();assert.equal(p.trickKind,kind,'friend: '+kind);}
   h.trickSerial++;h.trickKind='flick';send(true);assert.equal(p.trickKind,'stepover','an older owner (no body value) reads the old two bits: a flick shows as a step-over, nothing breaks');}
  console.log('  keeper + body moves, friend/owner: '+line.join('; '));
});
// ---- QA round 1 (multiplayer, Nov 5 2026; docs/join-live-game-design.md "QA round 1 (multiplayer)") ----
t('QA1 owner migration after a long match: the friend who stays follows the new owner at once (a new stream: seq + serials reset), no phantom quick-reset',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),C=w.client('Cy'),B=w.client('Ben');B.awake=C.awake=false;
  const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue'),gk=A.sim.ids.find(id=>A.sim.players[id].team==='blue'&&A.sim.players[id].isGK);A.joinMe(g[0]);w.run(2);
  for(let i=0;i<900&&A.sim.goalReset.serial===0;i++){A.sim.placePlayer(gk,40,20);if(i===2){A.sim.restart=null;Object.assign(A.sim.ball,{owner:null,target:null,intBy:null,x:135,y:40,vx:0,vy:-250,height:0});}w.run(1);}
  assert.equal(A.sim.goalReset.serial,1,'Ana scored alone (her reset serial 1; a later joiner\'s puppet keeps its own count)');w.run(200);
  B.awake=C.awake=true;C.joinMe(bl[1]);w.run(4);B.joinMe(g[1]);w.run(4);w.run(60*20);// 20 s: Ana's seq ~240 (Cy's own seq starts at 0)
  const sc=JSON.stringify(B.sim.score),rs=B.sim.goalReset.serial;
  A.leaveMe();w.run(4);assert.equal(C.link.state.owner,true,'Cy (the earliest remaining) runs it');assert.equal(B.link.state.owner,false);
  let far=0;for(let i=0;i<60;i++){w.run(1);if(i>20&&Math.hypot(C.sim.ball.x-B.sim.ball.x,C.sim.ball.y-B.sim.ball.y)>40)far++;}
  assert.equal(far,0,'Ben draws Cy\'s match within interpolation (before: frozen until Cy\'s seq passed Ana\'s)');
  if(JSON.stringify(C.sim.score)===sc)assert.equal(B.sim.goalReset.serial,rs,'no phantom quick-reset arrival at the migration');
  assert.deepEqual(B.sim.score,C.sim.score,'score kept');
  const fr=fs.readFileSync(path.join(ROOT,'lib/town/fieldRuntime.ts'),'utf8');assert.match(fr,/resetSnaps\(format:LiveFormat\)\{entryOf\(format\)\?\.puppet\?\.clear\(\);\}/,'the field runtime implements resetSnaps');
});
t('QA1 jitter: frames are stamped on the owner\'s seq clock (adaptive delay): under 150-250 ms in-order jitter the friend\'s ball no longer steps 2x; a steady link keeps INTERP_MS',()=>{
  const line=[];
  for(const [F,lo,hi] of [['7v7',150,250],['9v9',150,250],['futsal',150,300],['9v9',300,300]]){
    const own=new MatchSim(41,F),pup=new MatchSim(41,F),ws=own.windupScale;pup.windupScale=ws;const g=outfield(own,'gold')[1],b=outfield(own,'blue')[1];for(const s of [own,pup]){s.lockHuman(g);s.lockHuman(b);}pup.enterPuppet();
    let rng=7;const rnd=()=>((rng=(rng*9301+49297)%233280)/233280);const buf=N.createSnapBuffer(),q=[],fr=[];let t=0,last=-1e12,seq=0,lastAt=0,maxOwn=0,jumps=0,ox=own.ball.x,oy=own.ball.y,px=null,py=null,maxDelay=0,jk=0,jo=0,nj=0,ps=0,pos=0;
    for(let i=0;i<60*40;i++){t+=1000/60;
      for(const [id,gy] of [[g,8],[b,392]]){const p=own.players[id],ba=own.ball,dx=ba.x-p.x,dy=ba.y-p.y,d=Math.hypot(dx,dy)||1;const f={mx:dx/d,my:dy/d,sprint:d>30};if(own.ball.owner===id){f.mx=(135-p.x)/200;f.my=(gy-p.y)/200;if(Math.abs(gy-p.y)<90){f.shoot=true;f.shootPower=.9;}}own.humanInput(id,f);}
      own.step(1/60*ws);const os=Math.hypot(own.ball.x-ox,own.ball.y-oy);ox=own.ball.x;oy=own.ball.y;if(!own.goalReset.hidden&&os<60)maxOwn=Math.max(maxOwn,os);
      if(t-last>=N.SNAP_GAP_MS){if(t-last>=2*N.SNAP_GAP_MS)last=t;else last+=N.SNAP_GAP_MS;N.encodeSnap(own,0,seq++,0,fr);lastAt=Math.max(lastAt,t+lo+(hi-lo)*rnd());q.push({at:lastAt,d:fr.slice()});}// matchLink's schedule; WebSocket: in order
      while(q.length&&q[0].at<=t)buf.push(q.shift().d,3,t);
      buf.sample(pup,t,-1,ws/1000);maxDelay=Math.max(maxDelay,buf.delay);
      if(px!==null&&!pup.goalReset.hidden&&!buf.restart&&!own.isRestart&&i>120){const s2=Math.hypot(pup.ball.x-px,pup.ball.y-py);if(s2<60&&s2>maxOwn*1.6+1)jumps++;if(s2<60&&os<60){jk+=Math.abs(s2-ps);jo+=Math.abs(os-pos);nj++;ps=s2;pos=os;}}px=pup.ball.x;py=pup.ball.y;}// a restart's placement slides over a frame gap: not counted
    const jr=(jk/nj)/(jo/nj);line.push(F+' '+lo+'-'+hi+' ms: '+jumps+' steps > 1.6x the owner\'s, step change '+jr.toFixed(2)+'x the owner\'s, delay ≤ '+maxDelay.toFixed(0)+' ms');
    if(lo===hi)assert.ok(maxDelay<=N.INTERP_MS+34&&jr<1.2,F+': a steady link keeps about the old delay (INTERP_MS + the frame grids: '+maxDelay.toFixed(0)+' ms) and a smooth ball');
    else{assert.ok(jumps<=2&&jr<1.6,F+' '+lo+'-'+hi+' ms: smooth ball ('+jumps+' big steps, step change '+jr.toFixed(2)+'x the owner\'s; arrival stamps: 3.3-7x)');assert.ok(maxDelay<=N.INTERP_MS+N.JITTER.maxLateMs,F+': bounded delay');}
  }
  console.log('  jitter: '+line.join('; '));
});
t('QA1 frame size: every format with every slot human, worst values (every slot >= 100 u from the line, kicks, all serial bits): <= 512 B and <= MATCH_SNAP_MAX',()=>{
  assert.equal(N.SNAP_MAX_BYTES,P.MAX_INBOUND_BYTES);const line=[];
  for(const F of ['7v7','futsal','9v9','11v11','beach'])for(const nh of [2,8,11,99]){const s=new MatchSim(311,F);for(let k=0;k<Math.min(nh,s.ids.length);k++)s.lockHuman(s.ids[k]);
    for(const h of s.humans.values())Object.assign(h,{trickSerial:7,shotSerial:7,slipSerial:7,trickKind:'flick',trickSide:-1,shotPw:1,shotAimed:true,trickBeat:'x',diveSerial:3,diveSide:-1,saveSerial:3,saveKind:2,saveBig:true,shoulderSerial:3,shield:true});
    s.ids.forEach((id,i)=>{const p=s.players[id];p.x=100+(i*7)%170;p.y=100+(i*13)%299;p.kick=1;});Object.assign(s.ball,{x:250,y:390});s.score.gold=19;s.score.blue=19;s.goalHold=1;
    for(const t2 of s.humanTargets.values()){t2.pass.id=s.ids[s.ids.length-1];t2.forward.id=s.ids[s.ids.length-2];}
    let mx=0;const seen=new Set();for(let q=0;q<40;q++){const out=[];N.encodeSnap(s,4,99960+q,9.99,out);const raw=JSON.stringify(out);mx=Math.max(mx,Buffer.byteLength(raw));assert.ok(P.parseClient(raw),F+' '+nh+': the relay accepts it');P.encode(out);
      const hAt=12+s.ids.length*3;for(let k=0;k<out[hAt];k++)seen.add(out[hAt+1+k*3]);}
    assert.ok(mx<=512,F+' '+nh+' humans: '+mx+' B');assert.equal(seen.size,s.humans.size,F+' '+nh+': every human still rotates through');if(nh===99)line.push(F+' '+mx+' B');}
  console.log('  worst frames, every slot human: '+line.join(', '));
});
t('QA1 controls: a kid mashing Tackle while steering never outruns the relay (MATCH_RATE) so no tap is lost; a stalled friend\'s stick is let go by the owner',()=>{
  const w=world(),A=w.client('Ana',CAPS_ALL,w.r.hostKey),B=w.client('Ben');const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(2);B.joinMe(g[3]);w.run(5);
  const n0=B.conn.sent.length;A.log.length=0;let taps=0;
  w.run(600,1/60,(i)=>{const p=i%6===0;taps+=p;B.steer({mx:Math.sin(i/5),my:Math.cos(i/7),sprint:true,tackle:p});});
  const sent=B.conn.sent.length-n0;assert.ok(sent/10<=P.MATCH_RATE[0],'In frames '+(sent/10).toFixed(1)+'/s <= '+P.MATCH_RATE[0]+'/s');assert.equal(A.log.filter(e=>e[0]==='tackle').length,taps,'every tap arrived ('+taps+')');
  w.run(30,1/60,()=>B.steer({mx:1,my:0,sprint:true}));const fr=B.frame;B.frame=()=>{};// Ben's socket stalls 5 s (nothing in or out)
  w.run(300);assert.equal(A.sim.humans.get(g[3]).moveX,0,'the owner let go of Ben\'s stick');const q=A.sim.players[g[3]],x0=q.x;w.run(60);assert.ok(Math.abs(q.x-x0)<8,'…so his player stops (no 5 s run across the pitch)');
  B.frame=fr;w.run(60,1/60,()=>B.steer({mx:-1,my:0}));assert.equal(A.sim.humans.get(g[3]).moveX,-1,'his controls come back with the next In');
});
t('QA1 walking up to / joining a friends\' match: its score is not a goal on my screen (no GOAL! card, no replay of my old match)',()=>{
  const me=fs.readFileSync(path.join(ROOT,'lib/town/matchEffects.ts'),'utf8'),fr=fs.readFileSync(path.join(ROOT,'lib/town/fieldRuntime.ts'),'utf8');
  assert.match(me,/const syncScore=\(sim:MatchSim\)=>\{lastGold=sim\.score\.gold;lastBlue=sim\.score\.blue;\};/);
  assert.match(fr,/if\(e\.puppet\.sample\([^;]+\)&&e\.puppetFresh\)\{[^}]*e\.puppetFresh=false;e\.effects\.syncScore\(e\.sim\);e\.replay\?\.cancel\(\);\}/,'the first snapshot syncs the GOAL! card\'s score and drops my old match\'s replay history');
  assert.match(fr,/e\.puppet=createSnapBuffer\(\);e\.puppetFresh=true;/);
});
// ---- QA round 2 (multiplayer, Nov 5 2026; docs/join-live-game-design.md "QA round 2 (multiplayer)") ----
// A world with any format, in-order delivery with 0-`jit` ms jitter each way and `loss` of Snap / In frames (roster, Join, Leave and
// Watch frames are never lost: the relay's own rate limits still drop them), a hidden page (no frames at all) and a stalled socket.
const M=load('lib/town/match/matchSim.ts');
function world2(F,seed,{jit=0,loss=0}={}){
  const {r,clock}=room();const T={t:0};const clients=[];let rs=seed>>>0||1;const rnd=()=>((rs=(Math.imul(rs,1103515245)+12345)>>>0)%1000003)/1000003;
  const ws=F==='futsal'||F==='beach'?.48:.32,field=MATCH_FIELDS.indexOf(F),sizes={max:0,maxNums:0,frames:0};
  const lossy=(m,code)=>m[0]===code&&(m[1]===MatchKind.Snap||m[1]===MatchKind.In)&&rnd()<loss;
  function client(name,hostKey=null){
    let p=peer();r.connect(p);r.message(p,j([C.Hello,PROTOCOL_VERSION,LOOK,null,hostKey,null,name]));const me=p.of(S.Welcome)[0][2],token=p.of(S.Welcome)[0][3];
    const subs=new Set(),up=[],down=[];let upAt=0,downAt=0;
    const c={name,me,p,hidden:false,stallUntil:-1,snapIn:-1,awake:true,reAt:-1,closes:0};
    const conn={caps:CAPS_ALL,status:'live',sent:[],sendMatch(m){const raw=JSON.stringify(m);sizes.frames++;sizes.max=Math.max(sizes.max,Buffer.byteLength(raw));if(m[1]===MatchKind.Snap)sizes.maxNums=Math.max(sizes.maxNums,m.length-3);
      assert.ok(Buffer.byteLength(raw)<=512,name+': a '+Buffer.byteLength(raw)+' B frame');if(m[1]===MatchKind.Snap)assert.ok(m.length-3<=P.MATCH_SNAP_MAX,name+': '+(m.length-3)+' numbers');
      assert.ok(P.parseClient(raw),name+': the relay accepts it');this.sent.push(m[1]);if(lossy(m,C.Match))return true;upAt=Math.max(upAt,T.t+rnd()*jit,c.stallUntil);up.push({at:upAt,raw});return true;},onMessage(fn){subs.add(fn);return()=>subs.delete(fn);}};
    r.message(p,j([C.Caps,conn.caps]));
    const sim=new MatchSim(seed+clients.length*17,F);sim.windupScale=ws;const humans=new Map();let puppet=null;const acc=N.createInAccum();const log=[];
    const games={simOf:()=>sim,slotOf:(f,h)=>humans.get(h)??null,
      addFriend(f,h,team,slot,nm){if([...humans.values()].includes(slot)||sim.players[slot].team!==team)return null;sim.lockHuman(slot);humans.set(h,slot);return slot;},
      dropFriend(f,h){const s=humans.get(h);if(s){J.handBack(sim,s,null);humans.delete(h);}},
      setPuppet(f,on){if(on){puppet=N.createSnapBuffer();sim.enterPuppet();}else{puppet=null;sim.leavePuppet();}log.push(['puppet',on,T.t]);},
      isPuppet:()=>!!puppet,pushSnap:(f,d,from,tm)=>{c.snapIn=T.t;return !!puppet&&puppet.push(d,from,tm);},resetSnaps:()=>puppet?.clear(),encodeSnap:(f,fd,seq,out)=>N.encodeSnap(sim,fd,seq,0,out),
      friendInput:(f,h,fr)=>{const s=humans.get(h);if(s)sim.humanInput(s,fr);},netInput:()=>acc,awake:()=>c.awake!==false};
    const said=[];const join={joined:false,format:null,friends:null,friendsChanged(){},say(x,sec){said.push([x,T.t]);},press(b){if(b==='leave')c.leaveMe();}};
    const link=L.createMatchLink({conn,games,join,me:()=>me,nameOf:(id)=>clients.find(q=>q.me===id)?.name??'Friend',dressOf:()=>()=>({}),now:()=>T.t});
    Object.defineProperty(c,'puppet',{get:()=>puppet});Object.assign(c,{conn,sim,humans,log,said,join,link,
      joinMe(slot){if(sim.humans.has(slot))slot=sim.ids.find(id=>sim.players[id].team===sim.players[slot].team&&!sim.humans.has(id));if(!slot)return;/* fieldRuntime.joinMatch never takes a slot held on my sim: the next free one */sim.lockHuman(slot);humans.set('me',slot);join.joined=true;join.format=F;},
      leaveMe(){const s=humans.get('me');if(s){sim.releaseHuman(s);humans.delete('me');}join.joined=false;join.format=null;},
      flushUp(){while(up.length&&up[0].at<=T.t&&p.closed===null)r.message(p,up.shift().raw);
        // the relay closed my socket (its flood guard: > RATE.closeAbovePerSec frames in one second, e.g. a stalled link's burst): the
        // connection reconnects ~1 s later and resumes the member (connection.ts), as on a phone
        if(p.closed!==null&&conn.status==='live'){conn.status='reconnecting';c.closes++;c.reAt=T.t+1000;up.length=down.length=0;}
        if(conn.status==='reconnecting'&&T.t>=c.reAt&&!c.hidden){p=peer();c.p=p;r.connect(p);r.message(p,j([C.Hello,PROTOCOL_VERSION,LOOK,token,null,null,name]));r.message(p,j([C.Caps,conn.caps]));conn.status='live';}},
      frame(dt){
        if(conn.status!=='live')p.msgs.length=0;for(const m of p.msgs.splice(0)){if(lossy(m,S.Match))continue;downAt=Math.max(downAt,T.t+rnd()*jit,c.stallUntil);down.push({at:downAt,m});}
        while(down.length&&down[0].at<=T.t){const parsed=P.parseServer(JSON.stringify(down.shift().m));if(parsed)for(const fn of subs)fn(parsed);}
        link.update();
        if(puppet){puppet.sample(sim,T.t,sim.ids.indexOf(humans.get('me')),ws/1000);}else sim.step(dt*ws);
      }});
    clients.push(c);return c;
  }
  let tickAt=0;// the relay's 5 Hz tick (Nov 5 2026: silent-owner promotion runs there)
  const run=(n,dt=1/30,each)=>{for(let i=0;i<n;i++){T.t+=dt*1000;clock.t+=dt*1000;for(const c of clients)c.flushUp();/* bytes already sent still travel while the page sleeps */if(T.t-tickAt>=200){tickAt=T.t;r.tick();}for(const c of clients)if(!c.hidden)c.frame(dt);each?.(i);}};
  const relayField=()=>r.fields.get(field);
  const promo={n:0};{const pso=r.promoteSilentOwners;if(pso)r.promoteSilentOwners=function(now){const o=r.fields.get(field)?.owner;pso.call(r,now);if(o!==undefined&&r.fields.get(field)?.owner!==o)promo.n++;};}// silent-owner promotions (new relay)
  return {r,clock,T,client,run,clients,F,field,rnd,sizes,relayField,ws,promo};
}
const LIVE_FORMATS=['7v7','futsal','9v9','11v11','beach'];
t('QA2 owner backgrounds / locks his phone: the match is handed on at once (last snapshot + Leave, no relay change), a bot plays his slot; back on screen he re-joins as a friend of the new owner, never a second owner',()=>{
  for(const F of LIVE_FORMATS){
    const w=world2(F,901,{jit:120}),A=w.client('Ana',w.r.hostKey),B=w.client('Ben'),Cy=w.client('Cy');
    const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue');A.joinMe(g[0]);w.run(6);B.joinMe(g[1]);w.run(6);Cy.joinMe(bl[0]);w.run(30);
    assert.equal(A.link.state.owner,true);assert.equal(A.link.state.friends,2);
    const before=A.sim.score.gold+A.sim.score.blue;
    assert.equal(A.link.handOff(),true,F+': handed on');A.hidden=true;// the phone locks: no frames at all from here
    let gapB=0,last=w.T.t;w.run(30*8,1/30,()=>{if(B.snapIn>last)last=B.snapIn;if(Cy.snapIn>=0&&!Cy.link.state.owner)gapB=Math.max(gapB,w.T.t-Cy.snapIn);});
    assert.equal(w.relayField().owner,B.me,F+': the earliest remaining joiner runs it');assert.equal(B.link.state.owner,true);assert.equal(Cy.link.state.owner,false);
    assert.ok(gapB<L.STALL_HINT_MS,F+': Cy never waits for the hint ('+gapB.toFixed(0)+' ms between frames)');assert.equal(Cy.link.stalled,false);
    assert.ok(![...w.relayField().slots.keys()].includes(A.me),F+': a sleeping phone is off the roster (never made the owner again)');
    assert.ok(!B.sim.humans.has(g[0]),F+': a bot plays Ana\'s slot while she is away');
    Cy.leaveMe();w.run(30*2);assert.equal(B.link.state.owner,true,F+': Cy leaving does not hand the field back to the sleeping phone');assert.ok(B.sim.score.gold+B.sim.score.blue>=before,'score kept');
    A.hidden=false;w.run(30*3);
    assert.equal(A.link.state.owner,false,F+': back on screen Ana is a friend');assert.deepEqual([...w.relayField().slots.keys()],[B.me,A.me],F+': re-joined as the last joiner');assert.ok(B.sim.humans.has(g[0]),F+': on her own slot again');assert.equal(A.link.state.joined,true);assert.ok(A.puppet,'her sim follows Ben\'s snapshots');
    assert.ok(A.said.some(x=>/Ben kept the match going while you were away/.test(x[0])),F+': told who runs it '+j(A.said));
    assert.equal(w.clients.filter(c=>c.link.state.owner).length,1,F+': exactly one owner');assert.equal(A.link.handOff(),false,'a friend has nothing to hand on');
    Cy.joinMe(bl[0]);w.run(30*2);assert.deepEqual(A.sim.score,B.sim.score);{let far=0;w.run(60,1/30,()=>{if(Math.hypot(A.sim.ball.x-Cy.sim.ball.x,A.sim.ball.y-Cy.sim.ball.y)>40)far++;});assert.ok(far<=3,F+': Ana draws Ben\'s match as Cy does ('+far+' frames apart)');}
    // away again; a friend takes her slot meanwhile: back on screen she is told kindly, and is back on her own match cleanly
    {const D=w.client('Dee');w.run(10);assert.equal(B.link.state.owner,true);
     // Ana hands on only as the owner: make her one again (Ben leaves, she runs it), then Ben back
     B.leaveMe();w.run(30*2);assert.equal(A.link.state.owner,true);B.joinMe(g[1]);w.run(30*2);
     assert.equal(A.link.handOff(),true);A.hidden=true;w.run(30*2);D.joinMe(g[0]);w.run(30*2);assert.ok(B.sim.humans.has(g[0]),'Dee holds Ana\'s old slot');
     A.hidden=false;w.run(30*4);assert.ok(A.said.some(x=>/Dee just took that spot/.test(x[0])),F+': told who took her spot');
     assert.equal(A.link.state.owner,false,F+': no stale owner flag after the refusal');assert.equal(A.link.state.friends,0);assert.equal(A.join.joined,false);
     assert.equal(w.clients.filter(c=>c.link.state.owner&&c.link.state.joined).length,1);}
    // alone on the field: nothing to hand on (the 15 s path stays)
    const w2=world2(F,5),S1=w2.client('Solo',w2.r.hostKey);S1.joinMe(outfield(S1.sim,'gold')[0]);w2.run(10);assert.equal(S1.link.handOff(),false);assert.equal(w2.relayField().owner,S1.me);
  }
});
t('QA2 an owner whose phone froze without handing on (the page got no visibilitychange / pagehide in time): friends see "Waiting for Ana…" after 2 s, gone once frames resume; one string per stall',()=>{
  const w=world2('9v9',77,{jit:60}),A=w.client('Ana',w.r.hostKey),B=w.client('Ben');const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(6);B.joinMe(g[2]);w.run(30);
  assert.equal(B.link.stalled,false);A.hidden=true;const at=w.T.t;
  let first=-1;w.run(30*5,1/30,()=>{if(B.link.stalled&&first<0)first=w.T.t;});A.hidden=false;assert.ok(first>=at+L.STALL_HINT_MS&&first<=at+L.STALL_HINT_MS+400,'the hint after ~2 s ('+(first-at).toFixed(0)+' ms)');
  const lines=B.said.filter(x=>x[0]==='Waiting for Ana…');assert.ok(lines.length>10,'re-said each frame while stalled');assert.equal(new Set(lines.map(x=>x[0])).size,1);
  w.run(30);assert.equal(B.link.stalled,false,'frames resumed: the hint fades (0.25 s)');assert.equal(A.link.state.owner,true,'no hand-off from a friend (no relay change: it could not be made safe)');
  const src=fs.readFileSync(path.join(ROOT,'lib/multiplayer/matchLink.ts'),'utf8');assert.match(src,/stallText = `Waiting for \$\{d\.nameOf\(r!\.owner\)\}…`/);assert.match(src,/if \(stallFor !== r!\.owner\)/,'built once per owner, not per frame');
});
// ---- Relay: burst guard + silent-owner promotion (Nov 5 2026, NOT deployed) ----
t('relay burst guard: a token bucket (30/s sustained, FLOOD_BURST 120): a stalled phone\'s flushed backlog passes, a sustained or hostile flood is still closed',()=>{
  assert.equal(P.RATE.closeAbovePerSec,30,'sustained rate unchanged');assert.equal(P.FLOOD_BURST,120);assert.equal(P.MATCH_OWNER_SILENT_MS,6000);
  {const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey);clock.t+=5000;a.clear();
   for(let i=0;i<100;i++){r.message(a,j([C.Beat,i]));clock.t+=10;}assert.equal(a.closed,null,'100 frames in 1 s from a legit client');assert.equal(a.of(S.Beat).length,100,'all answered');
   clock.t+=5000;a.clear();for(let i=0;i<100;i++)r.message(a,j([C.Beat,i]));assert.equal(a.closed,null,'100 frames at one instant (a flushed backlog)');
   // normal play after it (25 frames/s) for 20 s: the bucket refills, never closed
   for(let i=0;i<500;i++){r.message(a,j([C.Beat,i]));clock.t+=40;}assert.equal(a.closed,null,'25/s after the burst');}
  {const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey);clock.t+=5000;const t0=clock.t;let closedAt=-1;
   for(let i=0;i<400&&a.closed===null;i++){r.message(a,j([C.Beat,i]));if(a.closed!==null)closedAt=clock.t;clock.t+=5;}// 200 frames/s
   assert.ok(closedAt>=0,'200/s is closed');assert.ok(closedAt-t0<=1000,'within ~1 s ('+(closedAt-t0)+' ms)');assert.ok(a.msgs.some(m=>m[0]===S.Error&&m[1]===P.ErrorCode.RateLimited));}
  {const {r}=room();const h=member(r,CAPS_ALL,r.hostKey),a=member(r,CAPS_ALL);a.clear();
   for(let i=0;i<5000&&a.closed===null;i++)r.message(a,j([C.Beat,i]));// thousands at one instant
   assert.ok(a.of(S.Beat).length<=P.FLOOD_BURST,'closed after at most the burst ('+a.of(S.Beat).length+' answered)');assert.equal(h.closed,null,'others untouched');}
  // the per-kind buckets still apply inside the burst: 60 Snaps at once forward at most MATCH_RATE's burst
  {const {r}=room();const a=member(r,CAPS_ALL,r.hostKey),b=member(r,CAPS_ALL);r.message(a,j([C.Match,0,0,0,2]));r.message(b,j([C.Match,0,0,1,12]));b.clear();
   for(let i=0;i<60;i++)r.message(a,j([C.Match,3,0,i,0,0,0,1,1,0,-1,0]));assert.equal(a.closed,null);assert.ok(b.of(S.Match,3).length<=P.MATCH_RATE[1]+1,'MATCH_RATE still drops ('+b.of(S.Match,3).length+')');}
});
t('relay silent-owner promotion: an owner silent 6 s with a live friend hands the field on (a bot plays his slot); his later frames are ignored until he Joins as a friend; never alone, never with a silent friend',()=>{
  const snap=(i)=>j([C.Match,3,0,i,0,0,0,1,1,0,-1,0]),inp=j([C.Match,2,1,100,0,0,0,70,0,-1000,-1000]);
  {const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey),b=member(r,CAPS_ALL),c=member(r,CAPS_ALL),old=member(r,127);
   r.message(a,j([C.Match,0,0,0,2]));r.message(b,j([C.Match,0,0,1,12]));r.message(c,j([C.Match,0,0,0,4]));
   const step=(ms,aSnaps)=>{for(let e=0;e<ms;e+=100){clock.t+=100;if(aSnaps)r.message(a,snap(e));r.message(b,inp);r.message(c,inp);if(e%200===0)r.tick();}};
   step(30000,true);assert.equal(r.fields.get(0).owner,a.id,'an owner who snapshots is never moved (30 s)');
   step(5800,false);assert.equal(r.fields.get(0).owner,a.id,'5.8 s silent: still the owner');
   [a,b,c,old].forEach(p=>p.clear());step(600,false);
   assert.deepEqual(roster(b),[S.Match,0,0,b.id,b.id,1,12,c.id,0,4],'6 s silent: the earliest remaining joiner owns it, the silent owner is off (a bot plays his slot)');
   assert.deepEqual(roster(a),roster(b),'the silent owner gets the roster too (his phone becomes a friend when it wakes)');assert.equal(old.of(S.Match).length,0,'old clients: nothing');
   assert.equal(a.closed,null,'his socket stays open');
   b.clear();c.clear();r.message(a,snap(999));r.message(a,inp);assert.equal(b.of(S.Match,3).length+c.of(S.Match,3).length+b.of(S.Match,2).length,0,'his late frames are ignored (no split brain)');
   clock.t+=3000;r.message(a,j([C.Match,0,0,0,2]));assert.deepEqual(roster(b),[S.Match,0,0,b.id,b.id,1,12,c.id,0,4,a.id,0,2],'re-joins as the last joiner, a friend');
   r.message(b,snap(1));assert.equal(a.of(S.Match,3).length,1,'he gets the new owner\'s snapshots');
   step(10000,false);assert.equal(r.fields.get(0).owner,b.id,'the new owner keeps it while heard (any C.Match frame counts)');}
  {const {r,clock}=room();const a=member(r,CAPS_ALL,r.hostKey);r.message(a,j([C.Match,0,0,0,2]));
   for(let i=0;i<100;i++){clock.t+=200;r.tick();}assert.equal(r.fields.get(0).owner,a.id,'alone and silent 20 s: nothing to hand on');
   const b=member(r,CAPS_ALL);r.message(b,j([C.Match,0,0,1,12]));clock.t+=200;r.tick();assert.equal(r.fields.get(0).owner,a.id,'a first friend joining an owner who was alone (no Snaps) gives him 6 s to start');
   for(let i=0;i<60;i++){clock.t+=200;r.tick();}assert.equal(r.fields.get(0).owner,a.id,'both silent (the friend too): left alone, nobody live to hand it to');
   for(let i=0;i<40;i++){clock.t+=200;r.message(b,inp);r.tick();}assert.equal(r.fields.get(0).owner,b.id,'the friend is heard again: promoted');}
});
t('client + relay: an owner whose phone froze without handing on is moved by the NEW relay after 6 s (friends play on, he returns as a friend: "Ben kept the match going"); the OLD relay keeps him the owner (the 15 s path), both safe',()=>{
  for(const F of ['7v7','11v11']){
    const w=world2(F,4242,{jit:120}),A=w.client('Ana',w.r.hostKey),B=w.client('Ben'),Cy=w.client('Cy');const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue');
    A.joinMe(g[0]);w.run(6);B.joinMe(g[1]);w.run(6);Cy.joinMe(bl[0]);w.run(60);assert.equal(A.link.state.owner,true);
    A.hidden=true;let hint=false;w.run(30*5,1/30,()=>{if(Cy.link.stalled)hint=true;});assert.ok(hint,F+': "Waiting for Ana…" while she is silent');assert.equal(w.relayField().owner,A.me,F+': 5 s: still Ana');
    w.run(30*2);assert.equal(w.relayField().owner,B.me,F+': ~6 s: the relay hands the field to Ben');w.run(30);
    assert.equal(B.link.state.owner,true);assert.equal(Cy.link.state.owner,false);assert.ok(!B.sim.humans.has(g[0]),F+': a bot plays Ana\'s slot');
    assert.ok(B.said.some(x=>/the match is on your phone now/.test(x[0])),F+': Ben told');w.run(30);assert.equal(Cy.link.stalled,false,F+': Cy plays on (hint gone)');
    A.hidden=false;w.run(30*3);
    assert.equal(A.link.state.owner,false,F+': back, Ana is a friend');assert.equal(A.link.state.joined,true);assert.ok(A.puppet);assert.deepEqual([...w.relayField().slots.keys()],[B.me,Cy.me,A.me]);
    assert.ok(A.said.some(x=>/Ben kept the match going while you were away/.test(x[0])),F+': told who runs it '+j(A.said.slice(-3)));
    assert.equal(w.clients.filter(c=>c.link.state.owner&&c.link.state.joined).length,1,F+': exactly one owner');w.run(30*2);assert.deepEqual(A.sim.score,B.sim.score);
    // the OLD relay (no promotion): the same freeze keeps Ana the owner; she resumes as the owner, friends follow her again
    const o=world2(F,4243,{jit:120});o.r.promoteSilentOwners=()=>{};const A2=o.client('Ana',o.r.hostKey),B2=o.client('Ben');A2.joinMe(g[0]);o.run(6);B2.joinMe(g[1]);o.run(60);
    A2.hidden=true;o.run(30*8);assert.equal(o.relayField().owner,A2.me,F+': old relay: still Ana');assert.equal(B2.link.stalled,true);
    A2.hidden=false;o.run(30*2);assert.equal(A2.link.state.owner,true);assert.equal(B2.link.stalled,false,F+': old relay: frames resume');assert.ok(!A2.said.some(x=>/kept the match going/.test(x[0])));
  }
});
t('QA2 beach toasts on a friend: my kick-in note and the full-time / shoot-out lines are derived from the snapshots, once each, as the owner\'s sim has them',()=>{
  const w=world2('beach',41),A=w.client('Ana',w.r.hostKey),B=w.client('Ben');const g=outfield(A.sim,'gold'),bl=outfield(A.sim,'blue');A.joinMe(g[0]);w.run(6);B.joinMe(bl[1]);w.run(40);
  const n0=B.sim.humanNote.serial,a0=A.sim.humanNote.serial;
  // the ball goes out over the touchline off a gold player next to Ben: a blue kick-in, Ben (nearest) takes it
  let took=false;for(let k=0;k<400&&!took;k++){if(k===0){for(const id of bl)A.sim.placePlayer(id,id===bl[1]?34:200,id===bl[1]?200:120+bl.indexOf(id)*20);A.sim.restart=null;A.sim.goalHold=0;A.sim.possession='gold';Object.assign(A.sim.ball,{owner:null,target:null,intBy:null,x:4,y:200,vx:-80,vy:0,height:0});}
    w.run(1);took=A.sim.humanNote.serial!==a0;}
  assert.ok(took,'Ben took the kick-in on Ana\'s sim');assert.equal(A.sim.humanNote.id,bl[1]);assert.equal(A.sim.humanNote.text,M.BEACH_HUMAN_NOTES.kickin);
  w.run(20);assert.equal(B.sim.humanNote.serial,n0+1,'one note on Ben\'s screen');assert.equal(B.sim.humanNote.id,bl[1]);assert.equal(B.sim.humanNote.text,M.BEACH_HUMAN_NOTES.kickin);
  w.run(60);assert.equal(B.sim.humanNote.serial,n0+1,'…once');
  // full time: Ana's sim ends the game (3rd period up) 2-1
  const r0=B.sim.results.length;A.sim.period=3;A.sim.periodEnd=A.sim.clock+.3;A.sim.score.gold=2;A.sim.score.blue=1;w.run(60);
  assert.equal(A.sim.results.length,1);assert.equal(B.sim.results.length,r0+1,'Ben\'s screen has the full time');assert.deepEqual({g:B.sim.results.at(-1).gold,b:B.sim.results.at(-1).blue,p:B.sim.results.at(-1).pens},{g:2,b:1,p:undefined});
  w.run(30*5);assert.equal(B.sim.results.length,r0+1,'…once (the next game\'s kick-off is not another)');assert.equal(B.sim.period,1);
  // level after extra time: a shoot-out (its score is Ana\'s only: the line says a shoot-out decided it)
  A.sim.period=4;A.sim.periodEnd=A.sim.clock+.3;A.sim.score.gold=1;A.sim.score.blue=1;w.run(60);
  assert.ok(A.sim.results.at(-1).pens);const rb=B.sim.results.at(-1);assert.equal(B.sim.results.length,r0+2);assert.equal(j(rb.pens),j({gold:0,blue:0}),'level: the shoot-out marker');assert.equal(rb.extra,true);
  const hud=fs.readFileSync(path.join(ROOT,'lib/town/liveJoinRuntime.ts'),'utf8');assert.match(hud,/s\.gold===s\.blue\?'Penalties! Level after extra time/,'the HUD has the friend\'s shoot-out line');
  // a watcher who walks up mid-game sees nothing old pop
  const Cw=w.client('Cy');w.run(60);assert.equal(Cw.sim.results.length,0);
});
t('QA2 chaos find: left and joined another slot before the link ran (one frame): the relay moves me to the new slot',()=>{
  const w=world2('7v7',12),A=w.client('Ana',w.r.hostKey),B=w.client('Ben');const g=outfield(A.sim,'gold');A.joinMe(g[0]);w.run(6);B.joinMe(g[2]);w.run(10);
  B.leaveMe();B.joinMe(g[3]);w.run(10);
  assert.equal(j([...w.relayField().slots.values()].map(v=>A.sim.ids[v[1]])),j([g[0],g[3]]),'the relay has Ben on his new slot');assert.ok(A.sim.humans.has(g[3])&&!A.sim.humans.has(g[2]),'…and so does the owner\'s sim');
});
t('QA2 chaos: 5 formats x 200 s of random joins / leaves / slot swaps / owner leaves / backgrounds / stalls, jitter 0-300 ms, 5 % Snap / In loss: one owner, no doubled slot, one stepping sim, monotonic shared score, frames <= 512 B / 120 numbers, no friend frozen past the hint, watchers never joined',()=>{
  const line=[];
  for(const [F,seed] of [['7v7',3301],['futsal',4409],['9v9',5521],['11v11',6637],['beach',7741]]){
    const w=world2(F,seed,{jit:300,loss:.05}),names=['Ana','Ben','Cy','Dee','Eli'],cs=names.map((n,i)=>w.client(n,i===0?w.r.hostKey:null)),Wt=w.client('Wat');
    const rnd=w.rnd,pick=a=>a[Math.floor(rnd()*a.length)%a.length];let lastEv=0,events=0,settles=0,hints=0,maxGap=0,migr=0,refused=0;const counts={};const deliberate=new Map();
    const track=new Map();// client -> {g,b,period} of the shared match it shows
    const slotsFree=(c)=>{const fs2=c.join.friends(F);return c.sim.ids.filter(id=>!fs2?.has(id));};
    const ownerC=()=>{const f=w.relayField();return f?w.clients.find(c=>c.me===f.owner):null;};
    let ownerWrong=new Map(),scoreAt=-1e9,lastSc='',lastOwner=-1,ownerAt=0;
    const settle=()=>{settles++;const f=w.relayField();const joined=w.clients.filter(c=>c.link.state.joined);
      if(!f){assert.equal(joined.length,0,F+': no roster, nobody joined');return;}
      const ids=[...f.slots.keys()],idx=[...f.slots.values()].map(v=>v[1]);assert.equal(new Set(idx).size,idx.length,F+': one human per slot (relay)');
      assert.ok(!ids.includes(Wt.me),F+': the watcher never joined');
      const owners=w.clients.filter(c=>c.link.state.owner&&c.link.state.joined);assert.equal(owners.length,1,F+': exactly one owner ('+owners.map(c=>c.name)+') at '+w.T.t.toFixed(0)+' relay '+j([...f.slots].map(([id,v])=>[w.clients.find(c=>c.me===id).name,v[1]]))+' owner '+w.clients.find(c=>c.me===f.owner)?.name+' states '+j(w.clients.map(c=>[c.name,c.link.state,c.join.joined,c.humans.get('me')]))+' events '+j(evLog.slice(-8)));assert.equal(owners[0].me,f.owner);
      assert.equal(joined.filter(c=>!c.puppet).length,1,F+': one stepping sim (one ball) on the shared field');
      for(const c of w.clients)assert.equal(c.link.state.joined,ids.includes(c.me),F+': '+c.name+' joined = on the roster');
      const O=owners[0];assert.equal(O.link.state.friends,ids.length-1,F+': the owner counts players only (not watchers)');
      const hv=[...O.humans.values()];assert.equal(new Set(hv).size,hv.length,F+': no slot twice on the owner');
      for(const [id,v] of f.slots){const s=O.sim.ids[v[1]];assert.ok(O.sim.humans.has(s),F+': roster slot '+s+' is human on the owner '+O.name+' '+j([...O.humans])+' relay '+j([...f.slots].map(([id,v])=>[w.clients.find(c=>c.me===id).name,O.sim.ids[v[1]],v[0]]))+' '+j(evLog.slice(-6))+' '+j(w.clients.map(q=>[q.name,q.link.state,q.join.joined,q.humans.get('me'),q.closes])));}
      assert.equal(O.sim.humans.size,f.slots.size,F+': no stale human on the owner '+O.name+' '+j([...O.humans])+' sim '+j([...O.sim.humans.keys()])+' relay '+j([...f.slots].map(([id,v])=>[w.clients.find(c=>c.me===id).name,O.sim.ids[v[1]]]))+' '+j(evLog.slice(-6))+' '+j(w.clients.map(q=>[q.name,q.link.state.owner,q.link.state.joined,q.join.joined,q.humans.get('me'),q.closes])));
      const fresh=w.T.t-scoreAt<1500;for(const c of joined)if(c!==O&&!fresh)assert.deepEqual(c.sim.score,O.sim.score,F+': '+c.name+' shows the owner\'s score');
      if(Wt.link.state.watching===w.field&&!fresh)assert.deepEqual(Wt.sim.score,O.sim.score,F+': the watcher too');
    };
    const ev=()=>{events++;const T=w.T.t,oc=ownerC(),inC=cs.filter(c=>c.join.joined&&!c.hidden),out=cs.filter(c=>!c.join.joined&&!c.hidden&&!c.busy);const r=rnd();let kind;
      if(r<.3&&out.length){kind='join';const c=pick(out),fr=slotsFree(c);if(!fr.length)return;const s=rnd()<.15&&inC.length?c.sim.ids[[...w.relayField()?.slots.values()??[]][0]?.[1]??0]:pick(fr);c.joinMe(s);}// 15 %: a slot a friend holds (a stale picker)
      else if(r<.45&&inC.length){kind='leave';pick(inC.filter(c=>c!==oc).length?inC.filter(c=>c!==oc):inC).leaveMe();}
      else if(r<.58&&inC.length){kind='swap';const c=pick(inC);c.leaveMe();c.busy=true;const d=200+rnd()*1500;deliberate.set(c,0);setTimeout2(T+d,()=>{c.busy=false;const fr=slotsFree(c);if(!c.join.joined&&!c.hidden&&fr.length)c.joinMe(pick(fr));});}
      else if(r<.68&&oc&&!oc.hidden){kind='ownerLeave';oc.leaveMe();migr++;}
      else if(r<.8&&oc&&!oc.hidden&&oc.join.joined){kind='background';const d=1000+rnd()*9000;if(!oc.link.handOff()){counts.noHandOff=(counts.noHandOff||0)+1;stallWin.push([T,T+d+700]);}oc.hidden=true;oc.busy=true;setTimeout2(T+d,()=>{oc.hidden=false;oc.busy=false;oc.reAt=w.T.t;});migr++;}
      else if(r<.84&&oc&&!oc.hidden){kind='ownerFreeze';const d=1500+rnd()*6000;oc.hidden=true;oc.busy=true;stallWin.push([T,T+d+700]);setTimeout2(T+d,()=>{oc.hidden=false;oc.busy=false;oc.reAt=w.T.t;/* settle after the queued roster (a silent-owner promotion) reached the phone */});}// no visibilitychange in time: no hand-off
      else if(r<.9&&oc&&!oc.hidden){kind='ownerStall';oc.stallUntil=T+2500+rnd()*2000;stallWin.push([T,oc.stallUntil+700]);}
      else if(r<.95&&inC.length){kind='friendStall';const c=pick(inC);c.stallUntil=T+500+rnd()*2500;if(c===oc)stallWin.push([T,c.stallUntil+700]);}
      else{kind='idle';}
      counts[kind]=(counts[kind]||0)+1;lastEv=T;evLog.push([Math.round(T),kind,oc?.name]);};const evLog=[];
    const timers=[];const setTimeout2=(at,fn)=>timers.push({at,fn});const stallWin=[];
    cs[0].joinMe(outfield(cs[0].sim,'gold')[0]);w.run(10);
    let nextEv=1000;const END=200000;
    while(w.T.t<END){
      for(let i=timers.length-1;i>=0;i--)if(timers[i].at<=w.T.t){const tm=timers.splice(i,1)[0];tm.fn();}// before the frame: a phone back on screen runs it
      w.run(1,1/30);const T=w.T.t;
      // per frame: score monotonic on every shared screen; no friend frozen past the hint (outside a deliberate owner stall)
      for(const c of w.clients){if(c.hidden)continue;const shared=(c.link.state.joined||c.link.state.watching===w.field)&&(!c.puppet||c.puppet.frames>0);/* a puppet shows the shared score from its first snapshot */if(!shared){track.delete(c);continue;}
        const s=c.sim.score,pv=track.get(c);let ft=!!pv?.ft||c.sim.period===5;
        if(pv&&!(s.gold>=pv.g&&s.blue>=pv.b)){if(F==='beach'&&s.gold===0&&s.blue===0&&ft)ft=false;else assert.fail(F+' '+c.name+': score went back '+pv.g+'-'+pv.b+' -> '+s.gold+'-'+s.blue+' at '+T.toFixed(0)+' owner '+ownerC()?.name+' '+j(evLog.slice(-5))+' '+j(w.clients.map(q=>[q.name,q.link.state.owner,q.link.state.joined,q.link.state.watching,!!q.puppet,q.hidden,q.closes,q.sim.score.gold+'-'+q.sim.score.blue]))+' '+j(c.log.slice(-3)));}
        track.set(c,{g:s.gold,b:s.blue,ft});
        if(c.link.state.joined&&!c.link.state.owner&&c.puppet&&c.stallUntil<T){const since=Math.max(c.snapIn,c.log.filter(e=>e[0]==='puppet'&&e[1]).at(-1)?.[2]??0,ownerAt+340);/* a new owner's stream: the link's grace starts at the roster */const gap=T-since;
          if(gap>L.STALL_HINT_MS+100){hints++;assert.ok(c.link.stalled,F+': '+c.name+' frozen '+gap.toFixed(0)+' ms without the hint at '+T.toFixed(0)+' owner '+ownerC()?.name+' '+j(evLog.slice(-5))+' '+j(w.clients.map(q=>[q.name,q.link.state.owner,q.link.state.joined,q.hidden,q.closes,q.conn.status]))+' '+j(c.said.slice(-3)));
            if(!stallWin.some(([a,b])=>T>=a&&T<=b+L.STALL_HINT_MS))assert.fail(F+': '+c.name+' frozen '+gap.toFixed(0)+' ms at '+T.toFixed(0)+' with no owner stall (owner '+ownerC()?.name+') '+j(evLog.slice(-5))+' '+j(w.clients.map(q=>[q.name,q.link.state.owner,q.link.state.joined,q.conn.status,q.closes,q.hidden])));}
          else maxGap=Math.max(maxGap,gap);}}
      {const fo=w.relayField()?.owner??-1;if(fo!==lastOwner){lastOwner=fo;ownerAt=T;}}
      {const O=ownerC(),sc=O?O.sim.score.gold+'-'+O.sim.score.blue:'';if(sc!==lastSc){lastSc=sc;scoreAt=T;}}
      // no client runs the field as owner for long while the relay says another does
      for(const c of w.clients){const wrong=c.link.state.owner&&c.link.state.joined&&w.relayField()?.owner!==c.me&&!c.hidden&&c.stallUntil<T-1500&&c.conn.status==='live';const at=ownerWrong.get(c);if(!wrong)ownerWrong.delete(c);else if(at===undefined)ownerWrong.set(c,T);else assert.ok(T-at<1500,F+': '+c.name+' thinks it owns the field '+(T-at).toFixed(0)+' ms after the relay moved it');}
      if(T>=nextEv){if(T-lastEv>=2500&&!w.clients.some(c=>c.hidden||c.busy||c.stallUntil>T-1500||c.conn.status!=='live'||c.reAt>T-1500)&&!timers.length)settle();ev();nextEv=T+1000+rnd()*3000;
        if(!cs.some(c=>c.join.joined)&&rnd()<.7)pick(cs.filter(c=>!c.hidden)).joinMe(outfield(cs[0].sim,'blue')[1]);}
      refused=w.clients.reduce((n,c)=>n+c.said.filter(x=>/just took that spot/.test(x[0])).length,0);
    }
    // settle at the end: everyone back on screen, no stalls
    for(const c of w.clients){c.hidden=false;c.busy=false;c.stallUntil=-1;}timers.length=0;w.run(30*4);settle();
    assert.ok(settles>=15,F+': settled checks '+settles);
    line.push(F+': '+events+' events '+JSON.stringify(counts)+', '+settles+' settles, '+migr+' hand-offs, '+refused+' refused, hint '+hints+' frames, friend gap <= '+maxGap.toFixed(0)+' ms, frames <= '+w.sizes.max+' B / '+w.sizes.maxNums+' numbers, '+w.clients.reduce((n,c)=>n+c.closes,0)+' flood closes, '+w.promo.n+' silent-owner promotions');
  }
  console.log('  chaos #2:\n    '+line.join('\n    '));
});
console.log('join-live-mp: '+passed+' checks passed');
