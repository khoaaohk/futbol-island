// Multiplayer protocol (multiplayer/protocol): codes, names, parse/encode, limits.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const ROOT=path.join(__dirname,'..');
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:id=>load(path.resolve(path.dirname(file),id+'.ts')),Date,Math,Number,Set,JSON,Array,Object,Error},{});return m.exports;}
const P=load(path.join(ROOT,'multiplayer/protocol/index.ts'));
const plain=x=>JSON.parse(JSON.stringify(x));
let n=0;const t=(name,fn)=>{fn();n++;};

t('constants',()=>{
  assert.equal(P.PROTOCOL_VERSION,1);assert.equal(P.PARTY_MAX,20);assert.equal(P.MAX_MEMBER_ID,31);assert.equal(P.INTEREST_NEAR,12);assert.equal(P.BEACON_EVERY,5);assert.equal(P.CODE_ALPHABET,'23456789BCDFGHJKMNPQRSTVWXYZ');
  assert.equal(P.CODE_ALPHABET.length,28);assert.equal(P.CODE_LENGTH,6);assert.equal(P.CODE_TTL_MS,28800000);assert.equal(P.PARTY_MAX_MS,43200000);
  assert.equal(P.RESUME_GRACE_MS,60000);assert.equal(P.HOST_GRACE_MS,30000);assert.equal(P.EMPTY_CLOSE_MS,120000);assert.equal(P.MAX_INBOUND_BYTES,512);assert.equal(P.LOOK_LEN,12);
  assert.equal(P.Mode.Idle,13);assert.equal(P.Mode.Swim,8);assert.equal(P.Zone.Indoors,4);assert.equal(P.Emote.WellPlayed,5);assert.equal(P.ErrorCode.Kicked,8);
  assert.equal(P.PoseFlag.Warp,1);assert.equal(P.PoseFlag.Hidden,2);assert.equal(P.C.Beat,9);assert.equal(P.S.Welcome,20);assert.equal(P.S.Beat,30);
  assert.deepEqual(plain(P.RATE),{pose:[12,16],ball:[12,16],emote:[0.5,2],ping:[0.33,2],control:[1,3],closeAbovePerSec:30,emotePerMin:10});
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
  assert.equal(P.NAME_COLOURS.length,20);assert.equal(new Set(P.NAME_COLOURS).size,20);
  assert.equal(P.NAME_ANIMALS,undefined,'no animals any more');assert.equal(P.PICKER_ANIMALS,undefined);assert.equal(P.validAnimal,undefined);
  assert.equal(P.nameFor([0,0]),'Red');assert.equal(P.nameFor([0,31]),'Red','reserved slot ignored');assert.equal(P.nameFor([99,0]),'Friend');
  const taken=[];let seed=7;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<20;i++){const nm=P.pickName(taken,rnd);assert.ok(!taken.some(x=>x[0]===nm[0]),'colour dup at '+i);assert.equal(nm[1],0);taken.push(nm);}
  assert.equal(P.pickName(taken,rnd).length,2); // all 20 colours taken -> still returns a pair
  assert.deepEqual(plain(P.pickName([[0,0]],()=>0)),[P.COLOUR_ORDER[0],0]);
  // colour order: a permutation of 0..15; the order is unique per party
  assert.deepEqual([...P.COLOUR_ORDER].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i));
});

const look=[0,1,2,3,4,5,6,7,8,9,10,63];
const body=[100,0,-200,128,12,P.Mode.Walk,P.Zone.Main,0];
const tok='abcdefgh_ijklmnop-1234';
const name=[3,5];
const clientSamples=[
  [P.C.Hello,1,look,null,null],[P.C.Hello,1,look,tok,tok],[P.C.Hello,1,look,null,null,null],[P.C.Hello,1,look,null,null,0],[P.C.Hello,1,look,tok,null,31],[P.C.Pose,42,...body],[P.C.Emote,P.Emote.Cheer],[P.C.Ping,P.PingKind.MeetHere,1000,-500],
  [P.C.Hello,1,look,null,null,3,'Emma'],[P.C.Hello,1,look,null,null,null,null],[P.C.ResetName,4],[P.C.Kick,3],[P.C.Lock,1],[P.C.Rotate],[P.C.End],[P.C.Leave],[P.C.Beat,123456],
];
const member=[2,name,look,0,body];
const serverSamples=[
  [P.S.Welcome,1,0,tok,1760000000000,1760007200000,0,[[0,[1,2],look,1,null],member]],
  [P.S.Joined,member],[P.S.Left,2,P.LeaveReason.Timeout],[P.S.Poses,7,1,...body,2,...body],[P.S.Poses,8],[P.S.Emote,1,P.Emote.Wave],
  [P.S.Ping,1,P.PingKind.FollowMe,10,20],[P.S.Host,4],[P.S.Code,'K7MQ4R',1760000000000],[P.S.Ended,P.EndReason.Expired],
  [P.S.Error,P.ErrorCode.Full],[P.S.Beat,99],
  [P.S.Welcome,1,0,tok,1760000000000,1760007200000,0,[[0,[1,2],look,1,null,'Emma'],[...member,null]]],[P.S.Joined,[...member,'Élodie']],[P.S.Renamed,3,null],
];
t('round trip client',()=>{for(const m of clientSamples)assert.deepEqual(plain(P.parseClient(P.encode(m))),m,JSON.stringify(m));});
t('round trip server',()=>{for(const m of serverSamples)assert.deepEqual(plain(P.parseServer(P.encode(m))),m,JSON.stringify(m));});

t('Hello reserved animal slot: parsed for compatibility, ignored',()=>{
  const old=P.parseClient(JSON.stringify([0,1,look,null,null]));assert.ok(old&&old.length===5,'old 5-element Hello still parses');
  assert.deepEqual(plain(P.parseClient(JSON.stringify([0,1,look,null,null,7]))),[0,1,look,null,null,7]);
  assert.equal(P.PROTOCOL_VERSION,1,'no version bump');
  for(const bad of [32,-1,2.5,'1',[1],{},true])assert.equal(P.parseClient(JSON.stringify([0,1,look,null,null,bad])),null,JSON.stringify(bad));
  assert.equal(P.ErrorCode.BadName,9);
});

t('normalizeNick table',()=>{
  const ok={'Emma':'Emma','EMMA':'Emma','emma':'Emma','  emma  ':'Emma','élodie':'Élodie','ÉLODIE':'Élodie','Zoë':'Zoë','Ñandú':'Ñandú','Al':'Al','Abcdefghijkl':'Abcdefghijkl','øystein':'Øystein'};
  for(const [i,o] of Object.entries(ok))assert.equal(P.normalizeNick(i),o,i);
  for(const o of Object.values(ok))assert.equal(P.normalizeNick(o),o,'idempotent '+o);
  const bad=['a','','  ','Emma Lou','12345','Emma2','Mary-Ann',"O'Neil",'Abcdefghijklm','http://x.co','http.','.http','www.x.com','a.b','h.t.t.p','\u{1F600}','Em\u{1F600}','\u00D7ab','ab\u00F7','\u0152uvre','Emma\nLou','Em\u0301ma','<b>','ßß'.repeat(7),'x'.repeat(100),'Emma\u200B','ab\u0000'];
  for(const b of bad)assert.equal(P.normalizeNick(b),null,JSON.stringify(b));
  for(const b of [null,undefined,5,{},[],true,['Emma']])assert.equal(P.normalizeNick(b),null);
  assert.equal(P.normalizeNick('ÿo'),'ÿo','a letter whose capital is outside Latin-1 stays as typed');
  assert.equal(P.NICK_MAX,12);
});

t('Hello nick: normalised; bad nick parses as null (the relay then refuses it with BadName; 5 / 6-element Hellos stay colour-only)',()=>{
  const parse=x=>P.parseClient(JSON.stringify(x));
  assert.equal(parse([0,1,look,null,null,null,'EMMA'])[6],'Emma');
  assert.equal(parse([0,1,look,null,null,5,'élodie'])[6],'Élodie');
  for(const b of ['Emma Lou','12345','http://x.y','a','','x'.repeat(100),'\u{1F600}'])assert.equal(parse([0,1,look,null,null,null,b])[6],null,b);
  for(const b of [5,{},['Emma'],true])assert.equal(parse([0,1,look,null,null,null,b]),null,JSON.stringify(b));
  assert.equal(parse([0,1,look,null,null,null,'Emma',1]),null);
  assert.ok(parse([0,1,look,null,null]).length===5&&parse([0,1,look,null,null,3]).length===6);
  const biggest=[0,1,look,tok,tok,31,'ÀÀÀÀÀÀÀÀÀÀÀÀ'];assert.ok(P.encode(biggest).length<=512);
});

t('ResetName / Renamed shapes',()=>{
  assert.equal(P.C.ResetName,10);assert.equal(P.S.Renamed,31);
  for(const b of [[10],[10,32],[10,'1'],[10,1,2],[10,-1]])assert.equal(P.parseClient(JSON.stringify(b)),null,JSON.stringify(b));
  for(const b of [[31],[31,1],[31,1,'Emma'],[31,32,null],[31,1,null,0]])assert.equal(P.parseServer(JSON.stringify(b)),null,JSON.stringify(b));
  const w=[20,1,0,tok,1,2,0,[[0,[1,2],look,1,null,'Emma Lou']]];assert.equal(P.parseServer(JSON.stringify(w)),null,'roster nick must be valid');
  const w2=[20,1,0,tok,1,2,0,[[0,[1,2],look,1,null,'emma']]];assert.equal(P.parseServer(JSON.stringify(w2)),null,'roster nick must be normalised');
  const w3=[20,1,0,tok,1,2,0,[[0,[1,2],look,1,null]]];assert.ok(P.parseServer(JSON.stringify(w3)),'5-element member still fine');
  const full=[20,1,0,tok,1,2,0,new Array(20).fill([31,[19,31],look,0,body,'Abcdefghijkl'])];assert.ok(P.encode(full).length<8192,'a full 20-member Welcome fits the 8 KB server cap');assert.ok(P.parseServer(P.encode(full)),'and parses (ids to 31, 20 members)');
});

t('NameLock shapes (relay v1.5; ResetName stays reserved)',()=>{
  assert.equal(P.C.NameLock,16);assert.equal(P.S.NameLock,37);assert.equal(P.Cap.NameLock,16);assert.equal(P.CAPS_ALL,31);
  assert.ok(P.parseClient(JSON.stringify([16,0,1])));assert.ok(P.parseClient(JSON.stringify([16,31,0])));assert.ok(P.parseClient(JSON.stringify([10,3])),'ResetName still parses (ignored by the relay)');
  for(const b of [[16],[16,1],[16,1,2],[16,32,1],[16,1,1,0],[16,'1',1]])assert.equal(P.parseClient(JSON.stringify(b)),null,JSON.stringify(b));
  for(const b of [[37],[37,1],[37,1,null],[37,32,1],[37,1,0,0]])assert.equal(P.parseServer(JSON.stringify(b)),null,JSON.stringify(b));
  assert.ok(P.parseServer(JSON.stringify([37,4,1])));
});

t('malformed inputs rejected (client)',()=>{
  const j=JSON.stringify,pose=(...o)=>j([1,1,...o]);
  const bodyWith=(i,v)=>{const b=[...body];b[i]=v;return b;};
  const bad=[
    '', 'null', '{}', '[]', '1', '"x"', 'not json', '[1', '{"0":1}', 'undefined',
    j([99]), j([-1]), j(['0']), j([0.5]), j([0,1,look,null]), j([0,1,look,null,null,32]), j([0,1,look,null,null,-1]), j([0,1,look,null,null,1.5]), j([0,1,look,null,null,'3']), j([0,1,look,null,null,3,0]), j([0,1,look,null,null,[3]]), j([0,1,look,null,null,true]),
    j([0,1.5,look,null,null]), j([0,1,look.slice(1),null,null]), j([0,1,[...look.slice(0,11),64],null,null]), j([0,1,[...look.slice(0,11),-1],null,null]),
    j([0,1,[...look.slice(0,11),1.5],null,null]), j([0,1,look,'short',null]), j([0,1,look,'has space 123456789012',null]), j([0,1,look,tok+tok,null]), j([0,1,look,null,5]),
    j([0,1,look,{a:1},null]),
    j([1,1,...body.slice(0,7)]), j([1,1,...body,0]), pose(...bodyWith(0,'100')), pose(...bodyWith(0,1.5)), pose(...bodyWith(0,10001)), pose(...bodyWith(2,-6001)),
    pose(...bodyWith(1,2001)), pose(...bodyWith(3,256)), pose(...bodyWith(3,-1)), pose(...bodyWith(4,256)), pose(...bodyWith(5,14)), pose(...bodyWith(6,5)), pose(...bodyWith(7,4)),
    pose(...bodyWith(0,{x:1})), pose(...bodyWith(0,[1])), pose(...bodyWith(0,null)), '[1,1,100,0,-200,128,12,0,0,NaN]', j([1,-1,...body]), j([1,'1',...body]),
    j([2,10]), j([2,-1]), j([2]), j([2,1,1]), j([3,2,0,0]), j([3,0,10001,0]), j([3,0,0,6001]), j([3,0,0.5,0]), j([4]), j([4,32]), j([4,'1']), j([5,2]), j([5]), j([6,1]), j([7,0]), j([8,0]),
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
  const bad=['','{}','[]','[99]','[20]',j([20,1,0,tok,1,2,0]),j([20,1,0,'bad',1,2,0,[]]),j([20,1,32,tok,1,2,0,[]]),j([20,1,0,tok,1,2,2,[]]),
    j([20,1,0,tok,1,2,0,new Array(21).fill(member)]),j([20,1,0,tok,1,2,0,[[0,[20,0],look,0,null]]]),j([20,1,0,tok,1,2,0,[[0,[0,32],look,0,null]]]),
    j([20,1,0,tok,1,2,0,[[0,[0,0],look,2,null]]]),j([20,1,0,tok,1,2,0,[[0,[0,0],look,0,[1,2]]]]),j([20,1,0,tok,1.5,2,0,[]]),
    j([21]),j([21,[1]]),j([22,1,4]),j([22,32,0]),j([23]),j([23,1,2]),j([23,1,2,...body.slice(1)]),j([23,1,32,...body]),j([23,1.5]),
    j([24,1,10]),j([25,1,2,0,0]),j([25,1,0,99999,0]),j([26]),j([26,32]),j([27,'k7mq4r',1]),j([27,'K7MQ4O',1]),j([27,'K7M-Q4R',1]),j([27,5,1]),j([28,3]),j([29,10]),j([29,-1]),j([30]),j([30,1.5]),
    'x'.repeat(5000),j([24,1,1,1])];
  assert.ok(bad.length>=30);
  for(const b of bad)assert.equal(P.parseServer(b),null,b.slice(0,80));
  // Party rejoin (Oct 22 2026): BadName (9) reaches the client (a lapsed slot on a resume is refused with it).
  assert.deepEqual(P.parseServer(j([29,9])),[29,9]);
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

t('types.ts has no free string fields except tokens/code and the one typed first name (nick)',()=>{
  const src=fs.readFileSync(path.join(ROOT,'multiplayer/protocol/types.ts'),'utf8').split('\n');
  const hits=src.filter(l=>!/^\s*\/\//.test(l)&&/\bstring\b/.test(l.replace(/\/\/.*$/,'')));
  assert.ok(hits.length>0);
  for(const l of hits)assert.match(l,/resumeToken|hostKey|code: string|nick\??: string \| null|C\.Rename, nick: string\]/,l); // CRename: the same typed first name (normalizeNick)
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


t('20 players: ids to 31, a 19-friend Poses frame parses and fits, a 21st roster entry does not',()=>{
  const j=JSON.stringify;
  for(const id of [0,19,31])assert.ok(P.parseServer(j([22,id,0])),'Left id '+id);
  assert.equal(P.parseServer(j([22,32,0])),null);
  assert.ok(P.parseClient(j([4,31])),'Kick 31');assert.ok(P.parseClient(j([10,19])),'ResetName 19');assert.equal(P.parseClient(j([4,32])),null);
  const flat=[];for(let id=1;id<=19;id++)flat.push(id,1000+id*37,0,500,id*5,12,8,0,0);
  const frame=[23,77,...flat];const text=P.encode(frame);
  assert.ok(text.length<1100,'19 poses ~ '+text.length+' B');assert.ok(P.parseServer(text),'19-friend Poses parses');
  const over=[23,1,...new Array(21).fill(0).flatMap((_,i)=>[i,1000,0,500,0,12,8,0,0])];assert.equal(P.parseServer(j(over)),null,'21 entries are refused');
  const hello=j([0,1,[1,2,3,4,5,6,7,8,9,10,11,12],null,null,null,'Abcdefghijkl']);assert.ok(hello.length<=P.MAX_INBOUND_BYTES);
  const poseMsg=j([1,2147483647,-4000,-400,-6000,255,255,13,4,3]);assert.ok(poseMsg.length<=80,'client frames stay far below 512 B');
  assert.equal(P.NAME_COLOURS.length,P.PARTY_MAX,'a unique colour name for every seat');
  for(const n of ['Red','Teal','Brown','Maroon','White','Black'])assert.ok(P.NAME_COLOURS.includes(n),n);
});
t('presence on the wire (design 4.4.1): Busy / Indoors / Hidden, the activity in the speed byte',()=>{
  const {Mode,Zone,PoseFlag,Activity}=P;
  assert.equal(P.AWAY_SILENCE_MS,12000);assert.equal(Activity.Lesson,1);assert.equal(Activity.Quiz,2);assert.equal(Activity.Settings,3);assert.equal(P.ACTIVITY_MAX,13);
  assert.deepEqual(plain(P.ROOM_ACTIVITIES),[Activity.Arcade,Activity.Museum,Activity.Shop,Activity.Konbini]);
  assert.equal(P.presenceOf(Mode.Walk,Zone.Main,0),'active');assert.equal(P.presenceOf(Mode.Busy,Zone.Main,0),'busy');
  assert.equal(P.presenceOf(Mode.Busy,Zone.Indoors,PoseFlag.Hidden),'indoors','indoors wins');assert.equal(P.presenceOf(Mode.Busy,Zone.Sea,PoseFlag.Hidden),'away','away beats busy');
  assert.equal(P.activityOf(Mode.Busy,Activity.Quiz),Activity.Quiz);assert.equal(P.activityOf(Mode.Walk,Activity.Quiz),0,'only a Busy pose carries one');assert.equal(P.activityOf(Mode.Busy,200),0,'unknown code -> none');
  assert.equal(P.shielded('busy'),true);assert.equal(P.shielded('away'),true);assert.equal(P.shielded('active'),false);assert.equal(P.shielded('indoors'),false);
  const busy=[1,7,300,0,300,64,Activity.Lesson,Mode.Busy,Zone.Main,0];
  assert.deepEqual(P.parseClient(JSON.stringify(busy)),busy,'a Busy pose parses (old relay too: same 8 numbers)');
  assert.ok(P.parseClient(JSON.stringify([1,8,300,0,300,64,Activity.Museum,Mode.Busy,Zone.Indoors,PoseFlag.Hidden])),'indoors + hidden parses');
  const b=busy.slice(2);assert.equal(P.speedOk(b,b,60000),true,'a frozen position is never a speed cheat, however long');
  assert.ok(P.parseServer(JSON.stringify([23,5,3,...b])),'a Poses batch with a Busy friend parses');
});
t('relay v1.1 (rooms design 2.3): wire unchanged; room bounds are a relay check, not a parse rule',()=>{
  assert.equal(P.PROTOCOL_VERSION,1,'no version bump for relay v1.1');
  const far=[1,0,110*1,-350,0,0,P.RoomCode.Konbini,P.Mode.Walk,P.Zone.Indoors,0];far[2]=200; // Konbini x 20 m: out of the room
  assert.ok(P.parseClient(JSON.stringify(far)),'an out-of-room pose still PARSES (the relay drops it; no bad frame, no kick)');
  assert.ok(P.clampPose(far.slice(2)),'and clampPose accepts it (WORLD_BOUNDS)');
  assert.equal(P.roomBoundsOk(far.slice(2)),false,'roomBoundsOk is the v1.1 drop');
  assert.equal(P.roomBoundsOk(body),true,'island bodies always pass');
  assert.equal(P.RELAY_ROOM_BOUNDS[P.RoomCode.Konbini].hx,11);assert.equal(P.RELAY_ROOM_BOUNDS[P.RoomCode.Museum].hx,25);assert.equal(P.RELAY_ROOM_BOUNDS[P.RoomCode.Reef+1].hz,28);
});
console.log('mp-protocol: '+n+' groups passed');
