// Multiplayer protocol (multiplayer/protocol): codes, names, parse/encode, limits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:id=>load(path.resolve(path.dirname(file),id+'.ts')),Date,Math,Number,Set,JSON,Array,Object,Error},{});return m.exports;}
const P=load(path.join(ROOT,'multiplayer/protocol/index.ts'));
const plain=x=>JSON.parse(JSON.stringify(x));
let n=0;const t=(name,fn)=>{fn();n++;};

t('constants',()=>{
  assert.equal(P.PROTOCOL_VERSION,1);assert.equal(P.PARTY_MAX,6);assert.equal(P.CODE_ALPHABET,'23456789BCDFGHJKMNPQRSTVWXYZ');
  assert.equal(P.CODE_ALPHABET.length,28);assert.equal(P.CODE_LENGTH,6);assert.equal(P.CODE_TTL_MS,7200000);assert.equal(P.PARTY_MAX_MS,14400000);
  assert.equal(P.RESUME_GRACE_MS,60000);assert.equal(P.HOST_GRACE_MS,30000);assert.equal(P.EMPTY_CLOSE_MS,120000);assert.equal(P.MAX_INBOUND_BYTES,512);assert.equal(P.LOOK_LEN,12);
  assert.equal(P.Mode.Idle,13);assert.equal(P.Mode.Swim,8);assert.equal(P.Zone.Indoors,4);assert.equal(P.Emote.WellPlayed,5);assert.equal(P.ErrorCode.Kicked,8);
  assert.equal(P.PoseFlag.Warp,1);assert.equal(P.PoseFlag.Hidden,2);assert.equal(P.C.Beat,9);assert.equal(P.S.Welcome,20);assert.equal(P.S.Beat,30);
  assert.deepEqual(plain(P.RATE),{pose:[8,12],emote:[0.5,2],ping:[0.33,2],control:[1,3],closeAbovePerSec:30,emotePerMin:10});
  assert.deepEqual(plain(P.WORLD_BOUNDS),{minX:-4000,maxX:10000,minZ:-6000,maxZ:6000,minY:-400,maxY:2000});
  const sp=P.MAX_SPEED_MS;assert.equal(sp[P.Mode.Scooter],14);assert.equal(sp[P.Mode.Bike],20);assert.equal(sp[P.Mode.Moped],28);assert.equal(sp[P.Mode.Jetpack],34);assert.equal(sp[P.Mode.Swim],3);assert.equal(sp[P.Mode.Idle],6);
  assert.ok(Math.abs(sp[P.Mode.Walk]-3.7*1.7)<1e-9);
});

t('generateCode: 10k codes valid, uniform, unblocked',()=>{
  const rand=k=>new Uint8Array(crypto.randomBytes(k));
  const counts=Array.from({length:6},()=>({}));
  for(let i=0;i<10000;i++){
    const c=P.generateCode(rand);
    assert.equal(c.length,6);assert.match(c,/^[23456789BCDFGHJKMNPQRSTVWXYZ]{6}$/);assert.doesNotMatch(c,/[AEIOU01IL]/);
    for(const b of P.CODE_BLOCKLIST)assert.ok(!c.includes(b),c);
    for(let p=0;p<6;p++)counts[p][c[p]]=(counts[p][c[p]]||0)+1;
  }
  const exp=10000/28;
  for(let p=0;p<6;p++){let chi=0;for(const ch of P.CODE_ALPHABET){const d=(counts[p][ch]||0)-exp;chi+=d*d/exp;}assert.ok(chi<80,'chi '+chi+' pos '+p);}
  // blocklist is honoured: feed bytes producing 'FCK...' first, then something clean
  const A=P.CODE_ALPHABET,ix=s=>[...s].map(ch=>A.indexOf(ch));
  const seqs=[ix('FCK234'),ix('23456B')];let call=0;
  const forced=()=>new Uint8Array(seqs[Math.min(call++,1)]);
  assert.equal(P.generateCode(forced),'23456B');
  // rejection sampling: bytes >= 252 skipped
  const rej=[255,254,252,0,1,2,3,4,5];let r=0;
  assert.equal(P.generateCode(()=>new Uint8Array([rej[r++%rej.length]])),'234567'.replace(/./g,(_,i)=>A[i]));
});

t('normalizeCode / formatCode',()=>{
  assert.equal(P.normalizeCode('k7m-q4r '),'K7MQ4R');
  for(const bad of ['K7MQ4','K7MQ4O','K7MQ4RR','','K7M Q4 R!','0K7MQ4','AEIOUY','K7MQ4I','K7MQ4L','K7MQ41'])assert.equal(P.normalizeCode(bad),null,bad);
  assert.equal(P.normalizeCode(' k 7 m - q 4 r'),'K7MQ4R');assert.equal(P.normalizeCode(null),null);
  assert.equal(P.formatCode('K7MQ4R'),'K7M-Q4R');
});

t('names',()=>{
  assert.equal(P.NAME_COLOURS.length,16);assert.equal(P.NAME_ANIMALS.length,32);
  assert.equal(new Set(P.NAME_ANIMALS).size,32);assert.equal(new Set(P.NAME_COLOURS).size,16);
  for(const bad of ['Rat','Pig','Donkey','Snake','Slug','Worm','Weasel'])assert.ok(!P.NAME_ANIMALS.includes(bad));
  assert.equal(P.nameFor([0,0]),'Red Zebra');assert.equal(P.nameFor([99,0]),'Friend');
  const taken=[];let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<512;i++){const nm=P.pickName(taken,rnd);assert.ok(!taken.some(x=>x[0]===nm[0]&&x[1]===nm[1]),'dup at '+i);taken.push(nm);}
  assert.equal(P.pickName(taken,rnd).length,2); // all taken -> still returns a pair
  assert.deepEqual(plain(P.pickName([[0,0]],()=>0)),[0,1]);
});

const look=[0,1,2,3,4,5,6,7,8,9,10,63];
const body=[100,0,-200,128,12,P.Mode.Walk,P.Zone.Main,0];
const tok='abcdefgh_ijklmnop-1234';
const name=[3,5];
const clientSamples=[
  [P.C.Hello,1,look,null,null],[P.C.Hello,1,look,tok,tok],[P.C.Pose,42,...body],[P.C.Emote,P.Emote.Cheer],[P.C.Ping,P.PingKind.MeetHere,1000,-500],
  [P.C.Kick,3],[P.C.Lock,1],[P.C.Rotate],[P.C.End],[P.C.Leave],[P.C.Beat,123456],
];
const member=[2,name,look,0,body];
const serverSamples=[
  [P.S.Welcome,1,0,tok,1760000000000,1760007200000,0,[[0,[1,2],look,1,null],member]],
  [P.S.Joined,member],[P.S.Left,2,P.LeaveReason.Timeout],[P.S.Poses,7,1,...body,2,...body],[P.S.Poses,8],[P.S.Emote,1,P.Emote.Wave],
  [P.S.Ping,1,P.PingKind.FollowMe,10,20],[P.S.Host,4],[P.S.Code,'K7MQ4R',1760000000000],[P.S.Ended,P.EndReason.Expired],
  [P.S.Error,P.ErrorCode.Full],[P.S.Beat,99],
];
t('round trip client',()=>{for(const m of clientSamples)assert.deepEqual(plain(P.parseClient(P.encode(m))),m,JSON.stringify(m));});
t('round trip server',()=>{for(const m of serverSamples)assert.deepEqual(plain(P.parseServer(P.encode(m))),m,JSON.stringify(m));});

t('malformed inputs rejected (client)',()=>{
  const j=JSON.stringify,pose=(...o)=>j([1,1,...o]);
  const bodyWith=(i,v)=>{const b=[...body];b[i]=v;return b;};
  const bad=[
    '', 'null', '{}', '[]', '1', '"x"', 'not json', '[1', '{"0":1}', 'undefined',
    j([99]), j([-1]), j(['0']), j([0.5]), j([0,1,look,null]), j([0,1,look,null,null,null]),
    j([0,1.5,look,null,null]), j([0,1,look.slice(1),null,null]), j([0,1,[...look.slice(0,11),64],null,null]), j([0,1,[...look.slice(0,11),-1],null,null]),
    j([0,1,[...look.slice(0,11),1.5],null,null]), j([0,1,look,'short',null]), j([0,1,look,'has space 123456789012',null]), j([0,1,look,tok+tok,null]), j([0,1,look,null,5]),
    j([0,1,look,{a:1},null]),
    j([1,1,...body.slice(0,7)]), j([1,1,...body,0]), pose(...bodyWith(0,'100')), pose(...bodyWith(0,1.5)), pose(...bodyWith(0,10001)), pose(...bodyWith(2,-6001)),
    pose(...bodyWith(1,2001)), pose(...bodyWith(3,256)), pose(...bodyWith(3,-1)), pose(...bodyWith(4,256)), pose(...bodyWith(5,14)), pose(...bodyWith(6,5)), pose(...bodyWith(7,4)),
    pose(...bodyWith(0,{x:1})), pose(...bodyWith(0,[1])), pose(...bodyWith(0,null)), '[1,1,100,0,-200,128,12,0,0,NaN]', j([1,-1,...body]), j([1,'1',...body]),
    j([2,6]), j([2,-1]), j([2]), j([2,1,1]), j([3,2,0,0]), j([3,0,10001,0]), j([3,0,0,6001]), j([3,0,0.5,0]), j([4]), j([4,16]), j([4,'1']), j([5,2]), j([5]), j([6,1]), j([7,0]), j([8,0]),
    j([9]), j([9,-1]), j([9,1.5]), j([9,'x']),
    '['+'1,'.repeat(300)+'1]', j([0,1,look,null,null,'x'.repeat(600)]), j([2,{emote:1}]), j([20,1]), j([23,1]), j([1,1,...body]).replace('1,1','1e0,1.0e0').replace(/\]$/,',0]'),
  ];
  assert.ok(bad.length>=30);
  for(const b of bad)assert.equal(P.parseClient(b),null,b.slice(0,80));
  assert.equal(P.parseClient(j([0,1,look,null,null,'x'.repeat(520)])),null);
  const big='["'+ 'a'.repeat(600) +'"]';assert.equal(P.parseClient(big),null);
  assert.equal(P.parseClient(null),null);assert.equal(P.parseClient(undefined),null);assert.equal(P.parseClient(5),null);
});

t('malformed inputs rejected (server)',()=>{
  const j=JSON.stringify;
  const bad=['','{}','[]','[99]','[20]',j([20,1,0,tok,1,2,0]),j([20,1,0,'bad',1,2,0,[]]),j([20,1,16,tok,1,2,0,[]]),j([20,1,0,tok,1,2,2,[]]),
    j([20,1,0,tok,1,2,0,new Array(7).fill(member)]),j([20,1,0,tok,1,2,0,[[0,[16,0],look,0,null]]]),j([20,1,0,tok,1,2,0,[[0,[0,32],look,0,null]]]),
    j([20,1,0,tok,1,2,0,[[0,[0,0],look,2,null]]]),j([20,1,0,tok,1,2,0,[[0,[0,0],look,0,[1,2]]]]),j([20,1,0,tok,1.5,2,0,[]]),
    j([21]),j([21,[1]]),j([22,1,4]),j([22,16,0]),j([23]),j([23,1,2]),j([23,1,2,...body.slice(1)]),j([23,1,16,...body]),j([23,1.5]),
    j([24,1,6]),j([25,1,2,0,0]),j([25,1,0,99999,0]),j([26]),j([26,16]),j([27,'k7mq4r',1]),j([27,'K7MQ4O',1]),j([27,'K7M-Q4R',1]),j([27,5,1]),j([28,3]),j([29,9]),j([29,-1]),j([30]),j([30,1.5]),
    'x'.repeat(5000),j([24,1,1,1])];
  assert.ok(bad.length>=30);
  for(const b of bad)assert.equal(P.parseServer(b),null,b.slice(0,80));
});

t('encode asserts size',()=>{
  assert.throws(()=>P.encode([P.C.Hello,1,look,'a'.repeat(600),null]));
  assert.throws(()=>P.encode([P.S.Poses,1,...new Array(5000).fill(1)]));
});

t('clampPose',()=>{
  assert.deepEqual(plain(P.clampPose(body)),body);assert.notEqual(P.clampPose(body),body);
  const mut=(i,v)=>{const b=[...body];b[i]=v;return P.clampPose(b);};
  assert.equal(mut(0,-4001),null);assert.equal(mut(0,10001),null);assert.equal(mut(2,6001),null);assert.equal(mut(1,-401),null);assert.equal(mut(1,2001),null);
  assert.ok(mut(0,-4000)&&mut(0,10000)&&mut(2,-6000)&&mut(1,2000));
  assert.equal(mut(3,256),null);assert.equal(mut(3,-1),null);assert.equal(mut(4,256),null);assert.equal(mut(5,14),null);assert.equal(mut(6,5),null);assert.equal(mut(7,4),null);
  assert.equal(mut(0,1.5),null);assert.equal(mut(0,NaN),null);assert.equal(mut(0,Infinity),null);assert.equal(mut(0,'5'),null);
  assert.equal(P.clampPose([1,2,3]),null);assert.ok(mut(7,3));
});

t('speedOk',()=>{
  const at=(x,mode=P.Mode.Walk,flags=0)=>[x,0,0,0,0,mode,0,flags];
  // walk: 6.29*1.5*1s + 2 = 11.4 m = 114 dm
  assert.ok(P.speedOk(at(0),at(110),1000));assert.ok(!P.speedOk(at(0),at(120),1000));
  assert.ok(P.speedOk(at(0),at(20),0));assert.ok(!P.speedOk(at(0),at(21),0)); // 2 m slack
  assert.ok(P.speedOk(at(0,P.Mode.Moped),at(400,P.Mode.Moped),1000)); // 40 m <= 28*1.5+2 = 44
  assert.ok(!P.speedOk(at(0,P.Mode.Moped),at(500,P.Mode.Moped),1000));
  assert.ok(P.speedOk(at(0),at(9000,P.Mode.Walk,P.PoseFlag.Warp),10)); // Warp bypass
  assert.ok(!P.speedOk(at(0),at(9000,P.Mode.Walk,P.PoseFlag.Hidden),10));
});

t('TokenBucket',()=>{
  const b=new P.TokenBucket(2,3);
  assert.ok(b.take(1000)&&b.take(1000)&&b.take(1000));assert.ok(!b.take(1000));
  assert.ok(!b.take(1400));assert.ok(b.take(1500)); // 0.5 s -> 1 token
  assert.ok(!b.take(1500));
  assert.ok(b.take(60000)&&b.take(60000)&&b.take(60000)&&!b.take(60000)); // refill caps at burst
  const c=new P.TokenBucket(8,12);let ok=0;for(let i=0;i<30;i++)if(c.take(0))ok++;assert.equal(ok,12);
});

t('WORLD_BOUNDS contains island, Cay, Summit with 100 m margin',()=>{
  const src=fs.readFileSync(path.join(ROOT,'lib/town/simulation.ts'),'utf8');
  const m=src.match(/ISLAND_BOUNDS\s*=\s*\{minX:\s*(-?\d+),\s*maxX:\s*(-?\d+),\s*minZ:\s*(-?\d+),\s*maxZ:\s*(-?\d+)\}/);
  assert.ok(m,'ISLAND_BOUNDS not found');
  const [minX,maxX,minZ,maxZ]=m.slice(1).map(Number),B=P.WORLD_BOUNDS,M=100;
  assert.ok(B.minX<=(minX-M)*10&&B.maxX>=(maxX+M)*10&&B.minZ<=(minZ-M)*10&&B.maxZ>=(maxZ+M)*10);
  for(const [x,z] of [[612,-160],[640,130]])assert.ok(B.minX<=(x-M)*10&&B.maxX>=(x+M)*10&&B.minZ<=(z-M)*10&&B.maxZ>=(z+M)*10,x+','+z);
});

t('types.ts has no free string fields except tokens/code',()=>{
  const src=fs.readFileSync(path.join(ROOT,'multiplayer/protocol/types.ts'),'utf8').split('\n');
  const hits=src.filter(l=>!/^\s*\/\//.test(l)&&/\bstring\b/.test(l.replace(/\/\/.*$/,'')));
  assert.ok(hits.length>0);
  for(const l of hits)assert.match(l,/resumeToken|hostKey|code: string/,l);
});

t('purity: protocol imports only sibling files, no DOM/Node APIs',()=>{
  const dir=path.join(ROOT,'multiplayer/protocol');
  for(const f of fs.readdirSync(dir)){
    const s=fs.readFileSync(path.join(dir,f),'utf8');
    for(const m of s.matchAll(/(?:from|require\()\s*['"]([^'"]+)['"]/g))assert.match(m[1],/^\.\/[a-z0-9]+$/,f+' imports '+m[1]);
    assert.doesNotMatch(s,/\b(window|document|process|Buffer|TextEncoder|crypto)\b\s*[.(]/,f);
  }
});

t('sha256Hex matches node crypto (host key digest, review #14)',()=>{
  for(const x of ['','abc','h\u00e9llo \u{1F600}','x'.repeat(100),'y'.repeat(55),'z'.repeat(56),'q'.repeat(64)])assert.equal(P.sha256Hex(x),crypto.createHash('sha256').update(x).digest('hex'));
});

console.log('mp-protocol: '+n+' groups passed');
