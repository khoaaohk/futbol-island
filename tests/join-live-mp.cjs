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
  b2.push(f1,3,1000);b2.push(f2,3,1100);b2.sample(pup,1100+N.INTERP_MS-50,-1,.32/1000);assert.ok(Math.abs(pup.players[pup.ids[3]].x-105)<1e-6,'halfway between two snapshots');
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
      dropFriend(f,h){const s=humans.get(h);if(s){sim.releaseHuman(s);humans.delete(h);log.push(['drop',h]);}},
      setPuppet(f,on){if(on){puppet=N.createSnapBuffer();sim.enterPuppet();}else{puppet=null;sim.leavePuppet();}log.push(['puppet',on]);},
      isPuppet:()=>!!puppet,pushSnap:(f,d,from,tm)=>!!puppet&&puppet.push(d,from,tm),encodeSnap:(f,field,seq,out)=>N.encodeSnap(sim,field,seq,0,out),
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
        if(puppet)puppet.sample(sim,T.t,sim.ids.indexOf(humans.get('me')),.32/1000);else sim.step(dt*.32);
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
  const rt=fs.readFileSync(path.join(ROOT,'lib/town/liveJoinRuntime.ts'),'utf8');assert.match(rt,/get timeScale\(\)\{return format&&games\.shared\(format\)\?1:timeScale;\}/,'slow motion stays off on a shared field');
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

// ---- 5. solo and AI-only untouched ----
t('AI-only: a sim that never meets a friend steps exactly as before (enterPuppet / leavePuppet are never called)',()=>{
  const a=new MatchSim(270,'7v7'),b=new MatchSim(270,'7v7');for(let i=0;i<600;i++){a.step(1/60*.32);b.step(1/60*.32);}
  assert.deepEqual(a.score,b.score);assert.equal(a.ball.x,b.ball.x);assert.equal(a.stats.passes,b.stats.passes);
});
console.log('join-live-mp: '+passed+' checks passed');
