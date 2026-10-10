#!/usr/bin/env node
// Save codes (Oct 10 2026; docs/accounts-design.md, docs/save-codes.md). Covers: the word list and code generation (entropy,
// uniqueness, no rude pairs), forgiving parsing, the keyed hash (no raw code stored anywhere), the sync allowlist (no device,
// session or unknown keys, no coach-plan text), size caps, envelope versioning, conflicts, wallet compaction (balances exact),
// rate limits and identical answers, the grown-up email (address never stored, logged or echoed in an error), the UI staying
// hidden without the env vars or the migration, retention, the migration's self-check on a throwaway Postgres running ALL
// migrations in order (with Supabase-like default grants) and the SQL matching the TypeScript twin, a full two-device client
// flow, and that existing saves keep working.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript'),os=require('os'),cp=require('child_process'),zlib=require('zlib'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x));

/** A module loader with its own cache and globals (one per simulated device). */
function makeLoader(globals={}){
 const loaded=new Map();
 const resolve=(from,id)=>{const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
  for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;throw Error('cannot resolve '+id+' from '+from);};
 function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
  if(file.endsWith('.json')){const v={default:JSON.parse(read(file))};loaded.set(file,v);return v;}
  const m={exports:{}};loaded.set(file,m.exports);
  vm.runInNewContext(ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,
   {module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,TextEncoder,Date,Math,JSON,Promise,Blob,Response,CompressionStream,Event,setTimeout,clearTimeout,fetch:globalThis.fetch,
    process:{env:{}},console,...globals,require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):require(id)});
  loaded.set(file,m.exports);return m.exports;}
 return load;
}
const load=makeLoader();
const W=load('lib/saves/words.ts'),L=load('lib/saves/legacyWords.ts'),C=load('lib/saves/code.ts'),S=load('lib/saves/snapshot.ts'),WC=load('lib/saves/walletCompact.ts'),SUM=load('lib/saves/summary.ts');
const ST=load('lib/saves/store.ts'),SV=load('lib/saves/server.ts'),EM=load('lib/saves/email.ts'),AW=load('lib/arcade/arcadeWalletCore.ts'),IDP=load('lib/coaches/idp.ts');

let passed=0;const skipped=[];
const ok=(name,fn)=>Promise.resolve().then(fn).then(r=>{if(r==='skip')skipped.push(name);else passed++;},e=>{console.error('FAIL',name);throw e;});
const PEPPER='test-pepper-'+'x'.repeat(40);
const headersFor=(ip='203.0.113.7',extra={})=>{const m=new Map(Object.entries({host:'futbolisland.app','x-forwarded-for':ip,...extra}));return {get:k=>m.has(k.toLowerCase())?m.get(k.toLowerCase()):null};};
const call=(deps,route,body,{ip,gzip=false,raw}={})=>{const text=raw??JSON.stringify(body);const bytes=gzip?zlib.gzipSync(text):Buffer.from(text);
 return SV.handleSave(route,{bytes:new Uint8Array(bytes),contentType:gzip?'application/x-fi-save+gzip':'application/json',headers:headersFor(ip)},{minAnswerMs:0,...deps}).then(r=>({status:r.status,body:J(r.body)}));};
const memDeps=(extra={})=>({store:ST.createMemorySaveStore(),pepper:PEPPER,email:null,...extra});
const snap=(keys={})=>({format:1,game:'2026-10-10',keys});
const memStorage=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},get length(){return m.size;},key:i=>[...m.keys()][i]??null,clear:()=>m.clear(),_m:m};};
const DAY=864e5,NOW=Date.parse('2026-10-10T12:00:00Z');
const uuid=i=>`${(0x10000000+i).toString(16)}-aaaa-4bbb-8ccc-${(0x100000000000+i).toString(16)}`;

/** A realistic old save: a year of arcade runs and plays, daily coins, puzzles, learning coins, vending, packs, cards, IDP text. */
function bigSave(){
 const runs={},spends={},packs=[];
 for(let d=0;d<365;d+=5){const at=NOW-d*DAY;
  for(let k=0;k<4;k++){runs[uuid(d*10+k)]={game:['runner','pinball','tennis','live'][k],paid:3+k*2,reason:'Arcade run',at};spends['play:'+uuid(9000+d*10+k)]={cost:3,source:'arcade',reason:'arcade play',at};}
  runs[`daily-play:${new Date(at).toISOString().slice(0,10)}`]={game:'island',paid:30,reason:'Daily play · 30 seconds exploring',at};
  runs[`puzzle:att-${d}`]={game:'puzzle',paid:5,reason:'First puzzle solve',at};
  runs[`island-job:${d}:fish`]={game:'island',paid:8,reason:'Island job',at,raw:8};
 }
 for(let i=0;i<40;i++)runs[`learn:lesson:7v7:l${i}`]={game:'learn',paid:10,reason:'Learning · lesson',at:NOW-200*DAY};
 runs['island-starter-coins']={game:'island',paid:20,reason:'Welcome',at:NOW-364*DAY};
 spends['vending:ball:sunset']={cost:60,source:'vending',reason:'Sunset ball',at:NOW-300*DAY,itemId:'ball:sunset'};
 spends['vending:ride:scooter']={cost:120,source:'vending',reason:'Scooter',at:NOW-10*DAY,itemId:'ride:scooter'};
 packs.push({id:'pack-1',player:'Marta',cost:50,at:NOW-100*DAY});
 const attempts={};for(let d=0;d<365;d+=5)attempts[`att-${d}`]=true;
 return {version:1,spends,runs,best:{'lvl-1':3},attempts,visits:{},packs};
}
const IDP_RAW=JSON.stringify({version:1,plan:{goalId:'7-look',setAt:NOW-20*DAY,reviewAt:NOW+20*DAY,reviews:[NOW-5*DAY],
 notes:[{id:'player-1',kind:'player',at:NOW-9*DAY,text:'My name is Sam Smith and I go to Oak Hill School',tag:'tried'},{id:'coach-2',kind:'coach',at:NOW-8*DAY,text:'Sam did well'}],
 strength:{corner:'technical',text:'Sam is fast'}},history:[]});
function fullDevice(){
 return {
  'futbol-island-customization-v1':JSON.stringify({character:'female',kit:'home'}),'fi2-welcome-v1':'completed',
  'futbol-island-quiz-progress-v1':JSON.stringify(['7v7:learn7_receive:0','7v7:learn7_receive:1']),'futbol-island-quiz-growth-v1':'1',
  'futbol-island-quests-v1':JSON.stringify({steps:['7v7:a:0'],visits:['7v7']}),'fi2-player-cards-v1':JSON.stringify(['Marta','Pelé','Marta']),
  'fi2-arcade-wallet-v1':JSON.stringify(bigSave()),'fi2-idp-plan-v1':IDP_RAW,'fi2-fishbook-v1':JSON.stringify({version:1,species:{sardine:{count:3}}}),
  'fi2-arcade-record-runner-v1':'{"best":12}','fi.game.runner.best':'40',
  // device, session, dev and save-system keys: never synced
  'fi2-music-volume':'0.4','fi2-battery-saver':'1','fi2-last-visit-day-v1':'2026-10-09','fi2-parent-gate-lock-v1':'1','fi2-cards-dev-v1':'x','fi-visit':'abc',
  'fi2-save-code-v1':'striker-volley-corner-4271','fi2-save-sync-v1':'{"rev":1,"hash":"x","at":1}','fi2-new-feature-v1':'unknown key',
 };
}

(async()=>{
// 1. The word list and code generation.
await ok('words and entropy',()=>{
 // The easy list (Oct 10 2026): short, common words for kids aged 6–12; the number has 4 digits to make up the entropy.
 const words=W.WORDS,NW=words.length;assert(NW>=768&&NW<=1024,`an easy list of 768–1,024 words (${NW})`);
 assert.equal(new Set(words).size,NW,'no duplicates');
 for(const w of words)assert.match(w,/^[a-z]{3,7}$/,'3–7 lowercase letters: '+w);
 for(const w of ['striker','volley','corner','goal','kick','ball','banana','kite','lion','buddy','frog','cake','star','boat','tiger','apple','robot'])assert(words.includes(w),'easy word kept: '+w);
 for(const w of ['haddock','caboose','fjord','quartz','lychee','mackerel','rosemary','meerkat','platypus'])assert(!words.includes(w),'hard word gone: '+w);
 assert.deepEqual(J(words.slice(0,3)),['goal','kick','ball'],'football words first');
 const pre=new Map();for(const w of words){const p=w.slice(0,4);assert(!pre.has(p),`unique first 4 letters: ${w} vs ${pre.get(p)}`);pre.set(p,w);}
 const BAD=/^(ass|butt|poo|pee|fart|sex|kill|dead|die|gun|bomb|blood|hell|damn|crap|dick|cock|tit|bum|nazi|drug|beer|wine|ghost|skull)$/;
 for(const w of words)assert(!BAD.test(w),'clean word '+w);
 for(const w of ['sea','see','pear','pair','bear','night','knight','flower','flour','tail','tale','red','read','blue','one','won','pea','reed','write','right','root','sun','son','bee','deer','hare','hair','rain','rose','plane','mail','meat','toe','nose','sail','bean','berry','pie','hour','ant','flea','ferry','fairy','tide'])assert(!words.includes(w),'no homophone-prone word: '+w);
 // Old words (legacy codes only): never in WORDS, never generated, each with an old picture.
 assert(L.LEGACY_WORDS.length>0);for(const w of L.LEGACY_WORDS)assert(!words.includes(w)&&!(w in W.PICTURES),'an old word is not in the new list: '+w);
 for(const w of L.LEGACY_WORDS)assert(typeof L.LEGACY_PICTURES[w]==='string','old word keeps a picture: '+w);
 // Pictures (Oct 9 2026): every word has one; one emoji each, Unicode/Emoji 13.0 or earlier, no flags / skin tones / gender / ZWJ.
 const pics=Object.entries(W.PICTURES);for(const [w] of pics)assert(words.includes(w),'picture for a list word '+w);
 for(const w of words)assert(typeof W.PICTURES[w]==='string'&&W.PICTURES[w].length>0,'every word has a picture: '+w);
 // Code points assigned after Emoji 13.0 (13.1–17 single code points), which older phones draw as a box.
 const AFTER13=cp=>(cp>=0x1F6D8&&cp<=0x1F6DF)||cp===0x1F7F0||cp===0x1F979||cp===0x1F9CC||(cp>=0x1FA70&&cp<=0x1FAFF&&!((cp>=0x1FA70&&cp<=0x1FA74)||
  (cp>=0x1FA78&&cp<=0x1FA7A)||(cp>=0x1FA80&&cp<=0x1FA86)||(cp>=0x1FA90&&cp<=0x1FAA8)||(cp>=0x1FAB0&&cp<=0x1FAB6)||(cp>=0x1FAC0&&cp<=0x1FAC2)||(cp>=0x1FAD0&&cp<=0x1FAD6)));
 for(const [w,p] of [...pics,['(number)',W.NUMBER_PICTURE]]){
  assert(/^\p{Extended_Pictographic}\uFE0F?$/u.test(p),`one emoji, nothing else: ${w} ${p}`);
  assert(/\p{Emoji_Presentation}/u.test(p)||p.endsWith('\uFE0F'),`a text-style symbol carries U+FE0F so it draws as emoji: ${w}`);
  for(const ch of p){const cp=ch.codePointAt(0);assert(!AFTER13(cp),`Emoji 13.0 or earlier: ${w} ${p}`);
   assert(cp!==0x200D&&!(cp>=0x1F3FB&&cp<=0x1F3FF)&&!(cp>=0x1F1E6&&cp<=0x1F1FF)&&cp!==0x2640&&cp!==0x2642,`no ZWJ, skin tone, flag or gender sign: ${w}`);}
  assert(!/[💀☠👻🧟🧛👹👺🔪🗡🔫💣⚰🪦🩸💊💉🍺🍷🍸🚬💩🖕⛪🕌🛕🕍✝☪🕉☸✡🔯🕎☯☦🛐📿🧿🪔👼😇🎄🎅🤡🕷]/u.test(p),`nothing scary, rude or religious: ${w} ${p}`);}
 // Unique where possible: a picture is shared only by close relatives (fish, birds, trees…), never by many words.
 const uses=new Map();for(const [,p] of pics)uses.set(p,(uses.get(p)??0)+1);
 assert(uses.size>=Math.ceil(pics.length*0.6),`mostly unique pictures (${uses.size} distinct for ${pics.length} words; at least 60%)`);
 assert(Math.max(...uses.values())<=16,'no picture is shared by more than 16 words');
 assert(!pics.some(([,p])=>p===W.NUMBER_PICTURE),'the number picture is the number tile\'s alone');
 // The picture is never part of the secret: the normal form, the hash input and parsing are words and digits only.
 const pc=C.generateCode(m=>crypto.randomInt(m));const pn=C.formatCode(pc);assert.match(pn,/^[a-z]+-[a-z]+-[a-z]+-\d{4}$/,'normal form has no pictures, and a new code has 4 digits');
 const line=C.pictureLine(pc);for(const w of pc.words)assert(line.includes(`${W.PICTURES[w]} ${w}`),'picture line shows each word with its picture');
 assert(line.endsWith(`${W.NUMBER_PICTURE} ${pc.number}`));
 assert.equal(C.normaliseCode(C.displayCode(pc)),pn,'the plain code parses back');
 assert(C.CODE_BITS>=41.5,`at least the old list's 39.8 bits, ≈42 (${C.CODE_BITS.toFixed(2)})`);
 const counts=new Map(),seen=new Set();const N=20000;
 for(let i=0;i<N;i++){const c=C.generateCode(m=>crypto.randomInt(m));const n=C.formatCode(c);
  assert.equal(new Set(c.words).size,3,'distinct words');assert(c.number>=1000&&c.number<=9999,'a new code has a 4-digit number');assert(!C.blockedPair(c.words));
  assert(C.isNormalCode(n),n);assert.equal(C.normaliseCode(n),n);assert.equal(C.normaliseCode(C.displayCode(c)),n,'the kid-facing form parses back');
  seen.add(n);for(const w of c.words)counts.set(w,(counts.get(w)??0)+1);}
 assert(seen.size>=N-2,'practically no repeats in 20k codes');
 for(const w of counts.keys())assert(words.includes(w)&&!L.LEGACY_WORDS.includes(w),'codes are made from new words only: '+w);
 const exp=N*3/NW,vals=[...counts.values()];assert.equal(counts.size,NW,'every word is used');
 assert(Math.min(...vals)>exp*0.35&&Math.max(...vals)<exp*1.9,`roughly uniform (${Math.min(...vals)}–${Math.max(...vals)}, expected ${exp.toFixed(1)})`);
 // A forced draw that hits a blocked pair is redrawn.
 const seq=[W.WORDS.indexOf('black'),W.WORDS.indexOf('monkey'),W.WORDS.indexOf('goal'),W.WORDS.indexOf('kite'),W.WORDS.indexOf('goal'),W.WORDS.indexOf('lion'),7];
 if(W.WORDS.includes('black')&&W.WORDS.includes('monkey')){let i=0;const c=C.generateCode(()=>seq[i++]);assert.deepEqual(J(c.words),['kite','goal','lion']);}
});

// 2. Forgiving input.
await ok('parsing',()=>{
 assert.equal(C.normaliseCode('Striker volley-CORNER 4271'),'striker-volley-corner-4271');
 assert.equal(C.normaliseCode(' striker · volley · corner · 4271 '),'striker-volley-corner-4271');
 assert.equal(C.normaliseCode('stri voll corn 4271'),'striker-volley-corner-4271','first 4 letters are enough');
 assert.equal(C.matchWord('strker'),'striker','a small typo snaps to the nearest word');
 assert.equal(C.matchWord('voley'),'volley');
 assert.equal(C.matchWord('zzzzzz'),null);
 assert.equal(C.normaliseCode('striker volley corner 99'),null);assert.equal(C.normaliseCode('striker volley corner 10000'),null);assert.equal(C.normaliseCode('striker volley 4271'),null);
 assert.equal(C.normaliseCode('striker volley corner 0999'),null,'no leading zero');
 assert.equal(C.normaliseCode({words:['STRIKER','volley','corner'],number:'4271'}),'striker-volley-corner-4271');
 assert.deepEqual(J(C.suggestWords('str')).slice(0,1),['striker']);assert.deepEqual(J(C.suggestWords('st')),[]);
 assert(C.suggestWords('ban').includes('banana'));
 assert.equal(C.isNormalCode('striker-volley-corner-4271'),true);assert.equal(C.isNormalCode('striker-volley-qqqq-4271'),false);assert.equal(C.isNormalCode('striker-volley-corner-0999'),false);
 assert.equal(C.isNormalCode('striker-volley-corner-427'),true,'an old 3-digit code is still a code');
 // Old codes (Oct 9 2026 list, 3-digit numbers) still parse to the same normal form, so they hash the same and restore.
 assert(C.isLegacyWord('haddock')&&!C.isWord('haddock'));
 assert.equal(C.normaliseCode('Haddock caboose fjord 427'),'haddock-caboose-fjord-427');
 assert.equal(C.isNormalCode('haddock-caboose-fjord-427'),true,'a code stored on a device with old words is accepted');
 assert.equal(C.pictureFor('haddock'),'🐡','old words keep their picture');
 assert.equal(C.normaliseCode('hadd cabo fjor 427'),'haddock-caboose-fjord-427','an old word by its first 4 letters when no new word starts so');
 // New words win ties: a prefix or typo that fits a new word means the new word, even when an old word fits too.
 assert(L.LEGACY_WORDS.includes('cross')&&L.LEGACY_WORDS.includes('kitten')===false);
 assert.equal(C.matchWord('pitc'),'pitch');assert.equal(C.matchWord('bana'),'banana');
 for(const w of L.LEGACY_WORDS)if(w.length>=5){const p=w.slice(0,4),n=W.WORDS.find(x=>x.startsWith(p));if(n)assert.equal(C.matchWord(p),n,`new word wins the prefix ${p}: ${n} over ${w}`);}
 for(const w of L.LEGACY_WORDS)assert.equal(C.matchWord(w),w,'an old word typed in full still matches: '+w);
 for(const n of W.WORDS)assert.equal(C.matchWord(n),n);
 assert.equal(C.suggestWords('cro')[0],'croc','new words come first in the autocomplete');
 // Typos: a near miss of a new word goes to it even if an old word is equally near.
 for(const n of W.WORDS){const t=n+'x';const m=C.matchWord(t);if(m!==null)assert(W.WORDS.includes(m),`a typo of ${n} (${t}) snaps to a new word, not ${m}`);}
});

// 3. Keyed hash: no raw code anywhere on the server side.
await ok('hmac',async()=>{
 const h=SV.codeHash(PEPPER,'striker-volley-corner-4271');assert.match(h,/^[0-9a-f]{64}$/);
 assert.equal(h,crypto.createHmac('sha256',PEPPER).update('v1:striker-volley-corner-4271').digest('hex'));
 assert.notEqual(h,SV.codeHash(PEPPER+'2','striker-volley-corner-4271'),'depends on the pepper');
 const deps=memDeps();const r=await call(deps,'create',{snapshot:snap({'fi2-welcome-v1':'completed'})});
 assert.equal(r.status,200);const code=r.body.code;assert(C.isNormalCode(code));
 const dump=JSON.stringify(deps.store.data);
 for(const w of code.split('-'))assert(!dump.includes(`"${w}"`)&&!dump.includes(code),'no code word stored');
 assert(deps.store.data.saves[SV.codeHash(PEPPER,code)],'stored under the HMAC');
 // A save made with an OLD code (pre-Oct 10 2026 words, 3-digit number) still restores, typed loosely, and still syncs.
 {const old='haddock-caboose-fjord-427',row=deps.store.data.saves[SV.codeHash(PEPPER,code)];
  deps.store.data.saves[SV.codeHash(PEPPER,old)]={...J(row),hash:SV.codeHash(PEPPER,old)};
  const rr=await call(deps,'restore',{code:'Haddock · caboose · fjord · 427'});assert.equal(rr.body.ok,true,'an old code restores');
  assert.equal((await call(deps,'check',{code:old})).body.ok,true,'an old stored code still checks');}
 assert.equal((await call({...deps,pepper:'short'},'check',{code})).status,503,'a weak pepper turns saving off');
 const route=read('app/api/save/[route]/route.ts'),server=read('lib/saves/server.ts'),client=read('lib/saves/client.ts');
 assert(!/console\./.test(route)&&!/console\./.test(server),'the routes never log');
 assert(/fetch\(`\/api\/save\/\$\{route\}`/.test(client)&&!/\?code=|\/api\/save\/[a-z]+\?/.test(client),'the code is only ever in a POST body');
});

// 4. The allowlist.
await ok('allowlist',()=>{
 // Table A of the design doc, key by key.
 const doc=read('docs/accounts-design.md'),a=doc.slice(doc.indexOf('**A. Progress: synced**'),doc.indexOf('**B. Device preferences'));
 const docKeys=[...a.matchAll(/`([a-z0-9.-]+)`/g)].map(m=>m[1]).filter(k=>/^(fi2-|fi-|fi\.|futbol-island)/.test(k)&&!k.includes('<'));
 assert.deepEqual([...new Set(docKeys)].sort(),[...S.SYNC_KEYS].sort(),'SYNC_KEYS = the doc table A');
 const b=doc.slice(doc.indexOf('**B. Device preferences'),doc.indexOf('**C. Never synced**'));
 assert.deepEqual([...b.matchAll(/`([a-z0-9.-]+)`/g)].map(m=>m[1]).sort(),[...S.DEVICE_KEYS].sort(),'DEVICE_KEYS = table B');
 for(const k of [...S.DEVICE_KEYS,...S.NEVER_KEYS,'fi2-new-feature-v1','__proto__','','fi2-arcade-record--v1','fi2-arcade-record-../x-v1'])assert.equal(S.isSyncKey(k),false,k);
 assert.equal(S.isSyncKey('fi2-arcade-record-runner-v1'),true);
 const UNLOCK=load('lib/dev/unlockAll.ts');for(const k of S.SYNC_KEYS)assert(UNLOCK.SAVE_KEY_PATTERN.test(k),'prefix rule '+k);
 // Every versioned storage key in the code is classified (a new store must be added to one list on purpose).
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):/\.tsx?$/.test(e.name)?[path.join(d,e.name)]:[]);
 const files=['lib','components','app'].flatMap(walk).flatMap(f=>[...read(f).matchAll(/['"`]((?:fi2-|fi-|fi\.|futbol-island)[A-Za-z0-9_.:-]*-v\d+)['"`]/g)].map(m=>m[1]));
 assert(files.length>40,'found the storage keys');
 const known=new Set([...S.SYNC_KEYS,...S.DEVICE_KEYS,...S.NEVER_KEYS]);
 for(const k of new Set(files))assert(known.has(k)||S.isSyncKey(k),'unclassified storage key '+k);
 // A snapshot of a full device holds only allowlisted keys, and no coach-plan text.
 const st=memStorage(fullDevice()),s=S.buildSnapshot(st,NOW);
 for(const k of Object.keys(s.keys))assert(S.isSyncKey(k),k);
 for(const k of ['fi2-music-volume','fi2-battery-saver','fi2-last-visit-day-v1','fi2-parent-gate-lock-v1','fi2-cards-dev-v1','fi-visit','fi2-save-code-v1','fi2-save-sync-v1','fi2-new-feature-v1'])assert(!(k in s.keys),'not synced: '+k);
 const text=JSON.stringify(s);for(const bad of ['Sam','Oak Hill','Smith','fast'])assert(!text.includes(bad),'no IDP free text: '+bad);
 const idp=IDP.sanitizeIdp(JSON.parse(s.keys['fi2-idp-plan-v1']));
 assert.equal(idp.plan.goalId,'7-look');assert.deepEqual(J(idp.plan.reviews),[NOW-5*DAY]);assert.equal(idp.plan.strength.corner,'technical');assert.equal(idp.plan.strength.text,'');
 assert.deepEqual(J(idp.plan.notes.map(n=>[n.id,n.tag,n.text])),[['player-1','tried','']],'the tag survives, the text and an untagged note stay home');
 // A brand-new device's starter kit (3 Backpack cards, the welcome coins) is not "an island too".
 const fresh={'fi2-backpack-v1':JSON.stringify({version:1,starter:{at:1,book:'island',cards:['Mary Earps','Martin Ødegaard','Ada Hegerberg']}}),
  'fi2-player-cards-v1':JSON.stringify(['Mary Earps','Martin Ødegaard','Ada Hegerberg']),'fi2-arcade-wallet-v1':JSON.stringify({version:1,spends:{},runs:{'island-starter-coins:0':{game:'island',paid:20},'island-starter-coins:1':{game:'island',paid:20},'daily-play:2026-10-09':{game:'island',paid:30}}})};
 assert.equal(S.hasProgress(fresh),false,'starter kit only');
 assert.equal(S.hasProgress({...fresh,'fi2-player-cards-v1':JSON.stringify(['Mary Earps','Marta'])}),true,'an earned card');
 assert.equal(S.hasProgress({...fresh,'futbol-island-quiz-progress-v1':'["7v7:a:0"]'}),true,'a quiz answer');
 assert.equal(S.hasProgress(fullDevice()),true);
 // Restoring onto the same device puts its own text back.
 const back=S.mergeIdpText(s.keys['fi2-idp-plan-v1'],IDP_RAW);assert(back.includes('Oak Hill School')&&back.includes('Sam did well')&&back.includes('Sam is fast'));
});

// 5. Size caps, versioning, conflicts.
await ok('caps, versions, conflicts',async()=>{
 const deps=memDeps();
 const big=snap({'fi2-player-books-v1':'x'.repeat(200*1024),'fi2-book-checks-v1':'y'.repeat(200*1024),'fi2-fishbook-v1':'z'.repeat(150*1024)});
 assert.equal((await call(deps,'create',{snapshot:big})).status,413,'> 512 KB');
 assert.equal((await call(deps,'create',{snapshot:snap({'fi2-player-books-v1':'x'.repeat(300*1024)})})).status,200,'a big key is dropped, the rest saved');
 const bomb=zlib.gzipSync(Buffer.alloc(3*1024*1024,32));
 assert.equal((await SV.handleSave('create',{bytes:new Uint8Array(bomb),contentType:'application/x-fi-save+gzip',headers:headersFor()},{...deps,minAnswerMs:0})).status,400,'a gzip bomb is refused');
 assert.equal((await call(deps,'create',{snapshot:{format:2,game:'',keys:{}}})).status,400,'a newer envelope is refused');
 assert.deepEqual(J(S.readSnapshot({format:2,keys:{}})),{ok:false,newer:true},'the client sees "newer" and never overwrites');
 const gz=await call(deps,'create',{snapshot:snap({'fi2-welcome-v1':'completed'})},{gzip:true});assert.equal(gz.status,200,'gzip upload');
 const code=gz.body.code;
 let r=await call(deps,'sync',{code,baseRev:1,snapshot:snap({'fi2-welcome-v1':'completed','fi2-new-v9':'drop me','fi2-save-code-v1':code,'fi2-idp-plan-v1':IDP_RAW})});
 assert.deepEqual(r.body,{ok:true,rev:2});
 const row=deps.store.data.saves[SV.codeHash(PEPPER,code)];
 assert.deepEqual(Object.keys(row.snapshot.keys).sort(),['fi2-idp-plan-v1','fi2-welcome-v1'],'the server re-checks the allowlist');
 assert(!JSON.stringify(row.snapshot).includes('Sam'),'and strips coach-plan text again');
 r=await call(deps,'sync',{code,baseRev:1,snapshot:snap({})});assert.deepEqual(r.body,{ok:false,conflict:true,rev:2},'an old base rev is a conflict');
 r=await call(deps,'sync',{code,baseRev:2,snapshot:snap({})});assert.deepEqual(r.body,{ok:true,rev:3});
 assert.equal((await call(deps,'sync',{code,baseRev:0,snapshot:snap({})})).status,400);
 // Wallet compaction: balances exact, ids that block double credit kept, much smaller, the real sanitiser agrees.
 const raw=JSON.stringify(bigSave()),out=WC.compactWallet(raw,NOW),w=JSON.parse(out);
 assert.equal(WC.walletBalance(out),WC.walletBalance(raw),'same balance');
 const valid=new Set(['Marta']);
 const san=s=>{const v=AW.sanitizeArcadeWallet(JSON.parse(s),valid);const by={};for(const r of Object.values(v.runs))by[r.game]=(by[r.game]??0)+r.paid;
  const earned=Object.values(v.runs).reduce((n,r)=>n+r.paid,0);return {by,balance:earned-v.packs.reduce((n,p)=>n+p.cost,0)-Object.values(v.spends).reduce((n,d)=>n+d.cost,0),packs:v.packs.length};};
 assert.deepEqual(san(out),san(raw),'sanitizeArcadeWallet sees the same coins per game, balance and packs');
 assert(out.length<raw.length*0.6,`much smaller (${raw.length} → ${out.length} bytes)`);
 for(const id of Object.keys(bigSave().runs).filter(i=>i.startsWith('learn:')||i.startsWith('island-job:')||i==='island-starter-coins'))assert(w.runs[id],'kept: '+id);
 assert(w.spends['vending:ball:sunset']&&w.spends['vending:ride:scooter'],'vending receipts kept (ownership)');
 for(const [id,r] of Object.entries(bigSave().runs))if(r.at>=NOW-90*DAY)assert(w.runs[id],'recent receipts kept: '+id);
 assert.equal(WC.compactWallet(out,NOW),out,'folding again changes nothing');
 assert.equal(WC.walletBalance(WC.compactWallet(out,NOW+400*DAY)),WC.walletBalance(raw),'a later fold keeps the balance');
 // The real wallet loads the compacted ledger with the same balance.
 const wallet=AW.createArcadeWallet({read:()=>JSON.parse(out),write:()=>{},lock:fn=>Promise.resolve().then(fn),valid,grant:()=>true,notify:()=>{},now:()=>NOW,id:()=>'id',random:()=>0.5});
 assert.equal(wallet.load().balance,WC.walletBalance(raw));
});

// 6. Rate limits and identical answers.
await ok('throttles and identical answers',async()=>{
 const deps=memDeps();const code=(await call(deps,'create',{snapshot:snap({'fi2-welcome-v1':'completed'})})).body.code;
 const wrong='banana-kite-lion-123';
 const a=await call(deps,'restore',{code:wrong},{ip:'1.1.1.1'}),b=await call(deps,'restore',{code:'not a code at all'},{ip:'1.1.1.1'}),c=await call(deps,'check',{code:wrong},{ip:'1.1.1.1'});
 assert.deepEqual([a,b,c].map(x=>[x.status,JSON.stringify(x.body)]),Array(3).fill([200,'{"ok":false}']),'wrong, malformed and unknown look the same');
 for(let i=0;i<7;i++)await call(deps,'restore',{code:wrong},{ip:'1.1.1.1'});
 const t=await call(deps,'restore',{code},{ip:'1.1.1.1'});
 assert.deepEqual([t.status,JSON.stringify(t.body)],[200,'{"ok":false}'],'after 10 misses even the right code gets the same "no"');
 assert.equal((await call(deps,'restore',{code},{ip:'2.2.2.2'})).body.ok,true,'another IP bucket is unaffected');
 const ok2=await call(deps,'restore',{code},{ip:'3.3.3.3'});for(let i=0;i<4;i++)await call(deps,'restore',{code:wrong},{ip:'3.3.3.3'});
 assert.equal((await call(deps,'restore',{code},{ip:'3.3.3.3'})).body.ok,true,'a success resets its bucket');assert(ok2.body.ok);
 // Global breaker: 500 failures in the hour → grown-up requests only; 600 → nothing.
 const d2=memDeps();const code2=(await call(d2,'create',{snapshot:snap({})})).body.code;
 for(let i=0;i<500;i++)await call(d2,'check',{code:wrong},{ip:`10.0.${i>>8}.${i&255}`});
 assert.equal((await call(d2,'restore',{code:code2},{ip:'9.9.9.9'})).body.ok,false,'breaker: a plain request is refused');
 assert.equal((await call(d2,'restore',{code:code2,grownup:true},{ip:'9.9.9.9'})).body.ok,true,'breaker: a grown-up request still works');
 for(let i=0;i<100;i++)await call(d2,'restore',{code:wrong,grownup:true},{ip:`10.1.${i>>8}.${i&255}`});// during the breaker only grown-up tries are looked up (and counted)
 assert.equal((await call(d2,'restore',{code:code2,grownup:true},{ip:'9.9.9.8'})).body.ok,false,'hard stop at 600');
 // delete never tells; email never tells either.
 const d3=memDeps();const code3=(await call(d3,'create',{snapshot:snap({})})).body.code;
 assert.deepEqual((await call(d3,'delete',{code:wrong})).body,{ok:true});
 assert.deepEqual((await call(d3,'delete',{code:code3})).body,{ok:true});
 assert.equal(Object.keys(d3.store.data.saves).length,0,'the right code deletes');
 assert.equal((await call(d3,'restore',{code:code3})).body.ok,false,'deleted for good');
 // Creation caps.
 const d4=memDeps();let busy=0;for(let i=0;i<62;i++){const r=await call(d4,'create',{snapshot:snap({})},{ip:'4.4.4.4'});if(r.status===429)busy++;}
 assert.equal(busy,2,'60 new saves per IP bucket per hour');
 // Timing: every code-bearing answer waits for the same minimum.
 const d5={...memDeps(),minAnswerMs:120};const code5=(await call(d5,'create',{snapshot:snap({})})).body.code;
 for(const [route,body] of [['restore',{code:wrong}],['restore',{code:code5}],['check',{code:wrong}],['delete',{code:wrong}],['sync',{code:wrong,baseRev:1,snapshot:snap({})}]]){
  const t0=Date.now();await call(d5,route,body);const ms=Date.now()-t0;assert(ms>=110&&ms<400,`${route} padded (${ms} ms)`);}
 // Origin check.
 assert.equal((await SV.handleSave('check',{bytes:new Uint8Array(Buffer.from('{}')),contentType:'application/json',headers:headersFor('1.2.3.4',{origin:'https://evil.example'})},memDeps())).status,403);
});

// 7. The grown-up email: sent once, never stored, logged or echoed.
await ok('email never kept',async()=>{
 const ADDR='parent.person+kid@example.org';
 const logs=[];const orig={log:console.log,error:console.error,warn:console.warn,info:console.info};
 for(const k of Object.keys(orig))console[k]=(...a)=>logs.push(a.join(' '));
 try{
  const sent=[];
  const fakeFetch=async(url,init)=>{sent.push({url,body:JSON.parse(init.body)});return new Response('{"id":"x"}',{status:200});};
  const deps=memDeps({email:EM.resendProvider('re_test','Futbol Island <codes@futbolisland.app>',fakeFetch)});
  const code=(await call(deps,'create',{snapshot:snap({})})).body.code;
  let r=await call(deps,'email',{code,email:ADDR});assert.deepEqual(r.body,{ok:true});
  assert.equal(sent.length,1);assert.equal(sent[0].url,'https://api.resend.com/emails');assert.deepEqual(sent[0].body.to,[ADDR]);
  const text=sent[0].body.text;assert(text.includes(C.displayCode(C.parseCode(code))),'the code is in the email');
  assert(text.includes(C.pictureLine(C.parseCode(code))),'with each word\'s picture on the line below');
  assert(!/https?:\/\//.test(text)&&!('html' in sent[0].body),'plain text, no links, no pixel');
  assert(!('secret' in sent[0].body),'the provider sends only from/to/subject/text');
  assert(/delete/i.test(text)&&text.split('\n').filter(Boolean).length<=6,'code, a line about it and how to delete');
  r=await call(deps,'email',{code:'banana-kite-lion-123',email:ADDR});assert.deepEqual(r.body,{ok:true},'an unknown code looks sent');assert.equal(sent.length,1,'but nothing is sent');
  assert.equal((await call(deps,'email',{code,email:'not an email'})).status,400);
  assert.equal((await call(deps,'email',{code,email:'a@b.co\r\nBcc: x@y.z'})).status,400,'no header injection');
  // Provider failures and throws: a generic answer only.
  const boom=memDeps({email:EM.resendProvider('k','f',async(u,init)=>{throw new Error('failed for '+JSON.parse(init.body).to[0]);})});
  const code2=(await call(boom,'create',{snapshot:snap({})})).body.code;
  r=await call(boom,'email',{code:code2,email:ADDR});assert.deepEqual(r.body,{ok:false,failed:true});
  const throwing=memDeps({email:{kind:'resend',send:async m=>{throw new Error('x '+m.to);}}});const code3=(await call(throwing,'create',{snapshot:snap({})})).body.code;
  r=await call(throwing,'email',{code:code3,email:ADDR});assert(!JSON.stringify(r).includes(ADDR),'no address in an error answer');
  // Per-IP email cap.
  let busy=0;for(let i=0;i<4;i++)if((await call(deps,'email',{code,email:ADDR},{ip:'7.7.7.7'})).status===429)busy++;assert.equal(busy,1,'3 emails per IP bucket per hour');
  // Log mode prints the email with the code masked and never the address.
  const printed=[];let code4='';
  const logDeps=memDeps({email:EM.logProvider(l=>printed.push(l))});
  code4=(await call(logDeps,'create',{snapshot:snap({})})).body.code;
  await call(logDeps,'email',{code:code4,email:ADDR});
  assert.equal(printed.length,1);assert(!printed[0].includes(ADDR)&&!printed[0].includes(C.displayCode(C.parseCode(code4)))&&printed[0].includes('«code»'),'log mode: no address, code masked');
  for(const w of C.parseCode(code4).words)assert(!printed[0].includes(w)&&!printed[0].includes(W.PICTURES[w]),'log mode masks the picture line too: '+w);
  // The default log provider (as the server wires it) masks the code too.
  const printed2=[];await EM.logProvider(l=>printed2.push(l)).send({to:ADDR,subject:'s',text:EM.emailText('kite · goal · lion · 123')});
  assert(!printed2[0].includes('kite · goal')&&printed2[0].includes('«code»')&&!printed2[0].includes(ADDR));
  for(const d of [deps,boom,throwing,logDeps])assert(!JSON.stringify(d.store.data).includes(ADDR)&&!JSON.stringify(d.store.data).includes('example.org'),'never stored');
 }finally{Object.assign(console,orig);}
 assert(!logs.some(l=>l.includes(ADDR)||l.includes('example.org')),'never logged: '+logs.join(' | '));
 // The client never keeps the address either.
 const client=read('lib/saves/client.ts'),ui=read('components/saves/SaveActions.tsx');
 assert(!/setItem\([^)]*email/i.test(client)&&!/localStorage|sessionStorage/.test(ui),'the address is never written to storage');
 assert(/we don’t store it, log it, share it or write again/.test(ui),'the notice is shown before sending');
});

// 8. Hidden without the env vars or the migration.
await ok('ui hidden without setup',async()=>{
 assert.deepEqual(J(await SV.saveStatus({store:null,pepper:PEPPER,email:null})),{saving:false,email:false});
 assert.deepEqual(J(await SV.saveStatus({store:ST.createMemorySaveStore(),pepper:undefined,email:null})),{saving:false,email:false});
 const noMigration={...ST.createMemorySaveStore(),schemaVersion:async()=>0};
 assert.deepEqual(J(await SV.saveStatus({store:noMigration,pepper:PEPPER,email:EM.logProvider(()=>{})})),{saving:false,email:false});
 assert.deepEqual(J(await SV.saveStatus({store:ST.createMemorySaveStore(),pepper:PEPPER,email:null})),{saving:true,email:false});
 assert.deepEqual(J(await SV.saveStatus({store:ST.createMemorySaveStore(),pepper:PEPPER,email:EM.logProvider(()=>{})})),{saving:true,email:true});
 // A store whose functions are missing (migration not run) answers 404 → schema 0.
 const missing=ST.createSupabaseSaveStore('https://x.supabase.co','k',async()=>new Response('{}',{status:404}));assert.equal(await missing.schemaVersion(),0);
 assert.equal((await call({store:missing,pepper:PEPPER},'restore',{code:'banana-kite-lion-123'})).status,503,'unavailable, not "wrong"');
 assert.equal((await call({store:null,pepper:undefined},'create',{snapshot:snap({})})).status,503);
 assert.equal(EM.emailProvider({}),null);assert.equal(EM.emailProvider({RESEND_API_KEY:'k'}),null);assert.equal(EM.emailProvider({SAVE_EMAIL_LOG:'1',VERCEL:'1'}),null,'no log mode on Vercel');
 assert.equal(EM.emailProvider({RESEND_API_KEY:'k',SAVE_EMAIL_FROM:'f'}).kind,'resend');assert.equal(EM.emailProvider({SAVE_EMAIL_LOG:'1'}).kind,'log');
 const onb=read('components/IslandOnboarding.tsx'),card=read('components/saves/SaveCodeCard.tsx'),create=read('components/saves/SaveCodeCreate.tsx'),restore=read('components/saves/SaveCodeRestore.tsx');
 assert(!/data-have-save-code onClick=\{\(\)=>\{setRestoreCode/.test(onb),'the welcome step has no "I have a save code" link (user, Oct 10 2026: the title screen has it)');
 assert(/const mustSave=\(\)=>saving&&!fallback&&codeRequired\(\)/.test(onb)&&/if\(step===0&&mustSave\(\)\)/.test(onb),'the save step only when saving is set up');
 for(const f of [card,create,restore])assert(/Saving isn’t ready yet — you can still play\./.test(f),'friendly unavailable state');
 assert(/avail\.email&&<button[^>]*data-email-code/.test(card),'the email option is hidden without a provider');
 // The title screen's sheet (Oct 9 2026): one footer row, Back · Print code · I saved it.
 assert(/onBack=\{onBack\}/.test(read('components/landing/saveCodeAdapter.tsx'))&&/<BackButton onBack=\{onBack\}\/>/.test(create)&&/>Print code<\/button>/.test(create)&&/data-saved-it onNavigate=\{onDone\}/.test(create),'create sheet footer');
 // What a save code is, said where codes are shown, made and typed.
 assert(/data-save-explainer>\{SAVE_CODE_WHAT\}/.test(card)&&/data-save-explainer>\{SAVE_CODE_NEW\}/.test(create)&&/data-save-explainer/.test(restore),'the save-code explainer');
 // Masked tiles hide the picture as well as the word (a picture would give the word away); the number tile shows 🔢.
 const tiles=read('components/saves/CodeTiles.tsx');
 assert(/<i data-tile-picture>\{hide\?'':pictureFor\(w\)/.test(tiles)&&/<i data-tile-picture>\{masked\?'':NUMBER_PICTURE\}/.test(tiles),'masked tiles show no picture');
 const PC=load('lib/saves/printCard.ts');const card1=PC.codeCardHtml('buddy-striker-goal-427',null);
 for(const w of ['buddy','striker','goal'])assert(card1.includes(`<div class="pic">${W.PICTURES[w]}</div><b>${w}</b>`),'print card picture: '+w);
 assert(card1.includes(`<div class="pic">${W.NUMBER_PICTURE}</div><b>427</b>`)&&/key to your island/.test(card1),'print card: number picture and what a code is');
 // Required code (user decision, Oct 9 2026): no way past the save step without a code, unless saving is down.
 assert(/if\(mustSave\(\)&&!getLocalCode\(\)\)\{if\(!save\)setSave\('offer'\);return;\}/.test(onb),'Skip / Escape lead to the code step, not past it');
 assert(/const noCodeYet=!!save&&saveStage!=='code'&&mustSave\(\)/.test(onb)&&/saveLocked\|\|noCodeYet\?<span aria-hidden="true"\/>:<NavigationButton className=\{styles\.skip\}/.test(onb)&&/save==='restore'\|\|noCodeYet\?<span/.test(onb),'no Skip and no Next on the save step until a code exists');
 assert(/if\(save\)\{if\(!noCodeYet\)leaveSave/.test(onb),'Next does nothing there either (keyboard)');
 assert(/onDone=\{code=>\{if\(!code\)setFallback\(true\);leaveSave\(true\);\}\}/.test(onb),'saving down: the kid plays (fallback), asked again later');
 assert(/\{showNotNow&&!required&&<button/.test(create)&&/Saving is taking a break — you can still play today\./.test(create),'required mode: no "Not now"; the outage message');
 assert(/required\?'Keep this one, get a new code':'Keep this one'/.test(restore),'required restore: keeping this island means a new code');
 const sync=read('components/saves/SaveSync.tsx');
 assert(/else if\(!shouldShowIslandOnboarding\(\)&&codeRequired\(\)\)void savingStatus\(\)\.then\(s=>\{if\(s\.saving&&codeRequired\(\)\)setDialog/.test(sync),'existing players without a code are asked on start, only when saving works');
 assert(/onCancel=\{e=>\{e\.preventDefault\(\);if\(dialog\.kind==='restore'\)close\(\);\}\}/.test(sync),'the required prompt cannot be dismissed with Escape');
 // Onboarding analytics ids are unchanged (the save screens are sub-screens of the welcome).
 assert.deepEqual([...onb.matchAll(/\{id:'([a-z]+)',eyebrow:/g)].map(m=>m[1]),['welcome','paths','balls','earn','learn']);
 for(const f of ['components/saves/SaveCodeCard.tsx','components/saves/SaveCodeCreate.tsx','components/saves/SaveCodeRestore.tsx','components/saves/SaveActions.tsx','components/saves/IslandChooser.tsx','components/saves/SaveSync.tsx','components/IslandOnboarding.tsx'])
  assert(!/(NavigationButton|BackButton|DoneButton)[^>]*\bimmediate\b/.test(read(f)),'nav buttons keep the shrink-to-icon animation: '+f);
});

// 9. Retention.
await ok('retention',async()=>{
 assert.equal(ST.monthsBefore('2026-10-10',12),'2025-10-10');assert.equal(ST.monthsBefore('2025-03-31',1),'2025-02-28');assert.equal(ST.monthsBefore('2024-03-31',1),'2024-02-29');
 const st=ST.createMemorySaveStore();await st.create('a'.repeat(64),snap({}),20);await st.create('b'.repeat(64),snap({}),20);await st.create('c'.repeat(64),snap({}),20);
 st.data.saves['a'.repeat(64)].lastUsedOn='2025-10-09';st.data.saves['b'.repeat(64)].lastUsedOn='2025-10-10';st.data.saves['c'.repeat(64)].lastUsedOn='2026-01-01';
 await st.hit('c:old',5,60,new Date(Date.now()-3*DAY));await st.salt('2020-01-01');
 const r=await st.purge(new Date('2026-10-10T03:00:00Z'));
 assert.deepEqual(Object.keys(st.data.saves).sort(),['b'.repeat(64),'c'.repeat(64)],'unused for more than 12 months: deleted');assert.equal(r.saves,1);
 assert(!Object.keys(st.data.throttle).some(k=>k.startsWith('c:old')),'old throttle rows go');assert(!st.data.salts['2020-01-01'],'old salts go');
 const lookupKeeps=ST.createMemorySaveStore();await lookupKeeps.create('d'.repeat(64),snap({}),20);lookupKeeps.data.saves['d'.repeat(64)].lastUsedOn='2025-01-01';
 await lookupKeeps.lookup('d'.repeat(64),'ip:x',false,false,new Date());assert.equal(lookupKeeps.data.saves['d'.repeat(64)].lastUsedOn,new Date().toISOString().slice(0,10),'using a save keeps it');
 const cron=read('app/api/cron/analytics/route.ts');assert(cron.indexOf('cronAuthorized(')<cron.indexOf('await purgeSaves()')&&/saves\.purge\(/.test(cron),'the nightly cron purges, after the secret check');
 const vercel=JSON.parse(read('vercel.json'));
 assert.deepEqual(vercel.crons,[{path:'/api/cron/analytics',schedule:'30 2 * * *'},{path:'/api/cron/scores',schedule:'*/5 * * * *'}],'crons unchanged');
 assert.equal(vercel.ignoreCommand,"git diff --quiet HEAD^ HEAD -- . ':(exclude)docs' ':(exclude)*.md'",'ignoreCommand unchanged');
});

// 10. A full two-device flow through the real client module, the real handler and the memory store.
await ok('client flow',async()=>{
 const deps=memDeps();
 function device(name,init={}){
  const ls=memStorage(init),listeners={},reloads=[];let requests=0;const ctl={drop:false};
  const win={addEventListener:(k,f)=>{(listeners[k]??=[]).push(f);},removeEventListener:(k,f)=>{listeners[k]=(listeners[k]||[]).filter(x=>x!==f);},dispatchEvent:e=>{for(const f of listeners[e.type]||[])f(e);return true;}};
  const fetchImpl=async(url,init={})=>{requests++;
   if(url==='/api/save/status')return new Response(JSON.stringify(await SV.saveStatus(deps)),{status:200});
   const route=url.split('/').pop(),body=init.body;const bytes=typeof body==='string'?Buffer.from(body):Buffer.from(body);
   const r=await SV.handleSave(route,{bytes:new Uint8Array(bytes),contentType:init.headers['Content-Type'],headers:headersFor('198.51.100.'+name.length)},{...deps,minAnswerMs:0});
   if(ctl.drop)throw new TypeError('the page closed before the answer');
   return new Response(JSON.stringify(r.body),{status:r.status});};
  const loc={hash:'',pathname:'/',search:'',reload:()=>reloads.push(1)};
  const L=makeLoader({localStorage:ls,fetch:fetchImpl,window:win,location:loc,history:{state:null,replaceState:()=>{}}});
  return {ls,client:L('lib/saves/client.ts'),reloads,listeners,get requests(){return requests;},win,ctl};
 }
 // Required codes: a fresh device needs one; a code (made or restored) satisfies it; a grown-up's delete is respected.
 {const R=device('R',{});assert.equal(R.client.codeRequired(),true);await R.client.createSave();assert.equal(R.client.codeRequired(),false);
  assert.equal(await R.client.deleteSave(),true);assert.equal(R.client.codeRequired(),false,'after a grown-up deletes the save, this device is not asked again');
  await R.client.createSave();assert.equal(R.ls.getItem('fi2-save-deleted-v1'),null,'making a code again clears that');}
 // A device without a code makes no requests at all.
 const idle=device('idle',fullDevice());idle.ls.removeItem('fi2-save-code-v1');idle.ls.removeItem('fi2-save-sync-v1');
 assert.equal(await idle.client.bootCheck(),'none');assert.equal(await idle.client.syncNow('hide'),'none');assert.equal(idle.requests,0,'no code, no network');
 // Device A makes a code from a full old save.
 const base=fullDevice();delete base['fi2-save-code-v1'];delete base['fi2-save-sync-v1'];
 const A=device('A',base);
 const made=await A.client.createSave();assert(made.ok&&C.isNormalCode(made.code));
 assert.equal(A.ls.getItem('fi2-save-code-v1'),made.code);assert.equal(await A.client.syncNow('hide'),'saved','nothing changed: nothing sent');
 const before=A.requests;assert.equal(await A.client.syncNow('milestone'),'saved');assert.equal(A.requests,before,'unchanged: no request');
 // A earns coins and finishes a lesson, then the tab hides: one save.
 const w=JSON.parse(A.ls.getItem('fi2-arcade-wallet-v1'));w.runs['learn:lesson:7v7:new']={game:'learn',paid:10,reason:'Learning',at:NOW};A.ls.setItem('fi2-arcade-wallet-v1',JSON.stringify(w));
 A.ls.setItem('futbol-island-quiz-progress-v1',JSON.stringify(['7v7:learn7_receive:0','7v7:learn7_receive:1','7v7:learn7_receive:2','7v7:learn7_receive:3','7v7:learn7_receive:4']));
 assert.equal(await A.client.syncNow('hide'),'saved');assert.equal(A.client.getSyncState().rev,2);
 // Device B restores with the code (typed sloppily) and gets the same island.
 const B=device('B',{'fi2-music-volume':'0.9'});
 const sloppy=made.code.split('-').map((p,i)=>i<3?p.toUpperCase().slice(0,5):p).join('  ');
 const got=await B.client.restoreSave(sloppy);assert(got.ok,'restored');
 const wantSummary=SUM.summarise(S.buildSnapshot(A.ls,NOW).keys);
 assert.deepEqual(J(got.summary),J(wantSummary));assert(got.summary.coins>1000&&got.summary.cards===2,'summary: coins and cards '+JSON.stringify(got.summary));
 B.client.applyRestoredSave(got);assert.equal(B.reloads.length,1,'Play reloads');
 for(const k of S.SYNC_KEYS.filter(k=>k!=='fi2-arcade-wallet-v1'&&k!=='fi2-idp-plan-v1'))assert.equal(B.ls.getItem(k),A.ls.getItem(k),'same '+k);
 assert.equal(WC.walletBalance(B.ls.getItem('fi2-arcade-wallet-v1')),WC.walletBalance(A.ls.getItem('fi2-arcade-wallet-v1')),'same coins');
 assert.equal(B.ls.getItem('fi2-music-volume'),'0.9','B keeps its own volume');assert.equal(B.ls.getItem('fi2-battery-saver'),null,'A\'s device settings stay on A');
 assert(!B.ls.getItem('fi2-idp-plan-v1').includes('Sam'),'the coach-plan text stayed on A');
 assert.equal(B.ls.getItem('fi2-save-code-v1'),made.code);
 // Existing sanitisers accept the restored data (existing saves keep working).
 const AWS=AW.sanitizeArcadeWallet(JSON.parse(B.ls.getItem('fi2-arcade-wallet-v1')),new Set(['Marta']));assert(Object.keys(AWS.runs).length>0);
 assert.equal(IDP.sanitizeIdp(JSON.parse(B.ls.getItem('fi2-idp-plan-v1'))).plan.goalId,'7-look');
 // Two devices both play: A saves first, B has its own changes → B is asked which island.
 const B2=device('B',Object.fromEntries(B.ls._m));
 assert.equal(await B2.client.bootCheck(),'same','a fresh boot after the restore is quiet');
 A.ls.setItem('fi2-player-cards-v1',JSON.stringify(['Marta','Pelé','Kerr','Bronze']));assert.equal(await A.client.syncNow('manual'),'saved');
 B2.ls.setItem('fi2-passport-v1',JSON.stringify({stamps:['coast']}));
 let conflicts=0;B2.win.addEventListener('fi2-save-conflict',()=>conflicts++);
 assert.equal(await B2.client.bootCheck(),'conflict');assert.equal(conflicts,1);
 const c=await B2.client.loadConflict();assert.equal(c.saved.cards,4);assert.equal(c.here.cards,2);
 assert.equal(await B2.client.keepThisIsland(c),true,'"Keep this one" saves over the other island');
 assert(B2.client.swapBackup(),'the other island is kept 7 days');assert.equal(JSON.parse(B2.client.swapBackup().keys['fi2-player-cards-v1']).length,4);
 // A had no new changes: its next boot takes B's island quietly (one reload).
 const A2=device('A',Object.fromEntries(A.ls._m));
 assert.equal(await A2.client.bootCheck(),'reloading');assert.equal(A2.reloads.length,1);
 assert.equal(A2.ls.getItem('fi2-passport-v1'),JSON.stringify({stamps:['coast']}),'A now has B\'s island');
 assert(A2.ls.getItem('fi2-idp-plan-v1').includes('Oak Hill School'),'A kept its own coach-plan text');
 // "Use the saved one" on a third device with local progress.
 const A3=device('A',Object.fromEntries(A2.ls._m));A3.ls.setItem('fi2-garden-v1','{"beds":1}');
 B2.ls.setItem('fi2-garden-v1','{"beds":7}');assert.equal(await B2.client.syncNow('manual'),'saved');
 assert.equal(await A3.client.bootCheck(),'conflict');const c3=await A3.client.loadConflict();A3.client.chooseSavedIsland(c3);
 assert.equal(A3.ls.getItem('fi2-garden-v1'),'{"beds":7}');assert.equal(JSON.parse(A3.client.swapBackup().keys['fi2-garden-v1']).beds,1,'the local island is the backup');
 // Wrong codes: friendly client limits on top of the server's.
 const K=device('K',{});
 for(let i=0;i<2;i++)assert.equal((await K.client.restoreSave('banana kite lion 123')).reason,'wrong');
 assert.equal((await K.client.restoreSave('banana kite lion 123')).reason,'grownup','3rd miss: ask a grown-up');
 assert.equal((await K.client.restoreSave('banana kite lion 123')).reason,'grownup');
 for(let i=0;i<3;i++)await K.client.restoreSave('banana kite lion 123',{grownup:true});
 assert.equal((await K.client.restoreSave(made.code,{grownup:true})).reason,'break','6 misses: take a break');
 // Delete: gone on the server, the code forgotten here, the island kept here.
 assert.equal(await A3.client.deleteSave(),true);assert.equal(A3.ls.getItem('fi2-save-code-v1'),null);assert.equal(A3.ls.getItem('fi2-garden-v1'),'{"beds":7}');
 assert.equal((await B2.client.bootCheck()),'failed','another device just sees "not saved yet"');
 // Email from the client: the address goes in the POST body once and nowhere else.
 const E=device('E',base);await E.client.createSave();
 assert.equal(await E.client.sendCodeToGrownup('x@example.org'),'unavailable','no provider configured in this test');
 assert(![...E.ls._m.values()].some(v=>v.includes('example.org')));
 // A page-hide save that lands but whose answer never arrives (the page closed): the next start adopts it, no chooser.
 const F=device('F',base);await F.client.createSave();F.ls.setItem('fi2-garden-v1','{"beds":3}');F.ctl.drop=true;
 assert.equal(await F.client.syncNow('hide'),'failed','the answer was lost');F.ctl.drop=false;
 const F2=device('F',Object.fromEntries(F.ls._m));let fc=0;F2.win.addEventListener('fi2-save-conflict',()=>fc++);
 assert.equal(await F2.client.bootCheck(),'same');assert.equal(fc,0,'no chooser for its own save');assert.equal(F2.client.getSyncState().rev,2);
 // Local "changes" that end up identical to the saved island: no chooser either.
 const F3=device('F',Object.fromEntries(F2.ls._m));F3.ls.setItem('fi2-save-sync-v1',JSON.stringify({rev:1,hash:'stale',at:1}));
 assert.equal(await F3.client.bootCheck(),'same');assert.equal(F3.client.getSyncState().rev,2);
 // But another device's newer save is never mistaken for ours, even right after our own page-hide save was lost.
 const G=device('G',Object.fromEntries(F2.ls._m)),H=device('H',Object.fromEntries(F2.ls._m));
 H.ls.setItem('fi2-garden-v1','{"beds":9}');assert.equal(await H.client.syncNow('manual'),'saved');
 G.ls.setItem('fi2-garden-v1','{"beds":4}');G.ctl.drop=true;await G.client.syncNow('hide');G.ctl.drop=false;
 const G2=device('G',Object.fromEntries(G.ls._m));assert.equal(await G2.client.bootCheck(),'conflict','two different islands: the player chooses');
 // Heat: no timers or loops in the always-mounted code.
 for(const f of ['lib/saves/client.ts','components/saves/SaveSync.tsx'])assert(!/setTimeout|setInterval|requestAnimationFrame/.test(read(f)),'no timers: '+f);
});

// 11. The SQL: all migrations in order on a throwaway Postgres, the self-check row, grants, and the SQL = the TypeScript twin.
await ok('sql',async()=>{
 const bin=n=>{for(const d of (process.env.PATH||'').split(':').concat(['/opt/homebrew/bin','/usr/local/bin','/usr/lib/postgresql/16/bin','/usr/lib/postgresql/15/bin','/usr/lib/postgresql/14/bin'])){const f=path.join(d,n);if(fs.existsSync(f))return f;}return null;};
 const initdb=bin('initdb'),pgctl=bin('pg_ctl'),psqlBin=bin('psql');
 if(process.env.SKIP_PG_TESTS||!initdb||!pgctl||!psqlBin){console.log('  SKIP sql: no local Postgres (initdb/pg_ctl/psql) found');return 'skip';}
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'fipgs-')),port=String(40000+(process.pid+29)%20000),quiet={stdio:['ignore','ignore','pipe']};
 try{
  cp.execFileSync(initdb,['-D',path.join(dir,'data'),'-U','postgres','--auth=trust','-E','UTF8','--locale=C'],quiet);
  cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-o',`-k ${dir} -p ${port} -c listen_addresses='' -c fsync=off -c TimeZone=UTC`,'-w','-l',path.join(dir,'log'),'start'],quiet);
  const args=['-h',dir,'-p',port,'-U','postgres','-d','postgres','-v','ON_ERROR_STOP=1','-qAt'];
  const psql=(sql,{role}={})=>cp.execFileSync(psqlBin,[...args,'-c',(role?`set role ${role}; `:'')+sql],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
  const fails=(sql,role)=>{const r=cp.spawnSync(psqlBin,[...args,'-c',`set role ${role}; ${sql}`],{encoding:'utf8'});return r.status!==0?r.stderr:'';};
  const runFile=f=>cp.execFileSync(psqlBin,[...args,'-f',f],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim().split('\n').pop();
  // Supabase-like roles and default grants (new tables and functions in public are granted to anon/authenticated).
  psql('create role anon; create role authenticated; create role service_role bypassrls;');
  psql('alter default privileges in schema public grant all on tables to anon, authenticated, service_role; alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;');
  const files=fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort();
  assert.equal(files[files.length-1],'20261010_game_saves.sql','the save migration is last');
  const results=files.map(f=>runFile(path.join('supabase/migrations',f)));
  assert.equal(results[results.length-1],'OK, game saves installed','self-check row');
  assert.equal(runFile('supabase/migrations/20261010_game_saves.sql'),'OK, game saves installed','idempotent');
  assert.equal(results[2],'OK, counts installed (analytics schema 3)','the earlier migrations still pass');
  const sql=read('supabase/migrations/20261010_game_saves.sql');
  assert(!/\bdrop\b|\btruncate\b|\brename\b|alter table [^;]* drop/i.test(sql.replace(/--.*$/gm,'')),'additive: nothing dropped or renamed');
  assert.match(sql.trim().split('\n').slice(-1)[0],/\) as missing\) x;$/,'the file ends with the self-check select');
  for(const role of ['anon','authenticated']){
   for(const t of ['game_saves','save_throttle','save_salts'])assert.match(fails(`select * from ${t}`,role),/permission denied/,`${role} ${t}`);
   for(const fn of [`save_lookup('${'a'.repeat(64)}','ip:x',true,true)`,'save_stats()','save_purge()',`save_create('${'a'.repeat(64)}','{}',2)`,'save_salt(current_date)'])assert.match(fails(`select ${fn}`,role),/permission denied/,`${role} ${fn}`);
  }
  assert.equal(psql(`select count(*) from pg_policies where tablename in ('game_saves','save_throttle','save_salts')`),'0','no policies');
  assert.equal(psql(`select string_agg(relname||':'||relrowsecurity,',' order by relname) from pg_class where relname in ('game_saves','save_throttle','save_salts')`),'game_saves:true,save_salts:true,save_throttle:true');
  assert.deepEqual(psql(`select column_name from information_schema.columns where table_name='game_saves' order by ordinal_position`).split('\n'),['id','code_hash','code_version','snapshot','snapshot_bytes','rev','created_on','last_used_on','guardian_id'],'guardian_id reserved');
  // A self-check that FAILS loudly when something is missing.
  psql('drop function public.save_put(text, integer, jsonb, integer, text)');
  assert.match(psql(sql.slice(sql.lastIndexOf('select case when missing'))),/^NOT INSTALLED: save_put$/);
  assert.equal(runFile('supabase/migrations/20261010_game_saves.sql'),'OK, game saves installed','re-running repairs it');
  // PostgREST stand-in: /rest/v1/rpc/<fn> with named JSON args → `select to_json(fn(p => …))` as service_role.
  const lit=v=>v===null?'null':typeof v==='boolean'||typeof v==='number'?String(v):'$q$'+(typeof v==='string'?v:JSON.stringify(v))+'$q$';
  const pgFetch=async(url,init)=>{const fn=url.split('/').pop(),a=JSON.parse(init.body);
   try{const out=psql(`select to_json(${fn}(${Object.entries(a).map(([k,v])=>`${k} => ${lit(v)}`).join(', ')}))`,{role:'service_role'});return new Response(out||'null',{status:200});}
   catch(e){return new Response('{}',{status:/does not exist/.test(String(e.stderr))?404:400});}};
  const pg=ST.createSupabaseSaveStore('http://pg.local','service-key',pgFetch);
  assert.equal(await pg.schemaVersion(),1);
  // The same scripted run on both stores gives the same answers.
  const mem=ST.createMemorySaveStore(),now=new Date();
  async function script(st){const out=[];const h1='1'.repeat(64),h2='2'.repeat(64),ip='ip:'+'e'.repeat(32);
   out.push(await st.create(h1,snap({'fi2-welcome-v1':'completed'}),40));out.push(await st.create(h1,snap({}),20));
   out.push(await st.lookup(h1,ip,false,true,now));out.push(await st.lookup(h2,ip,false,false,now));
   out.push(await st.put(h1,1,snap({'fi2-welcome-v1':'dismissed'}),40,ip,now));out.push(await st.put(h1,1,snap({}),20,ip,now));out.push(await st.put(h2,1,snap({}),20,ip,now));
   for(let i=0;i<8;i++)out.push(await st.lookup(h2,ip,false,false,now));
   out.push(await st.lookup(h1,ip,false,false,now));out.push(await st.lookup(h1,'ip:other',false,false,now));
   out.push(await st.hit('c:'+ip,2,60,now),await st.hit('c:'+ip,2,60,now),await st.hit('c:'+ip,2,60,now));
   await st.remove(h2,'ip:other',now);await st.remove(h1,'ip:other',now);out.push(await st.lookup(h1,'ip:third',false,false,now));
   out.push(await st.stats());return J(out);}
  assert.deepEqual(await script(pg),await script(mem),'SQL = memory twin');
  // Breaker numbers in SQL match LIMITS.
  for(const n of [ST.LIMITS.ipFailures,ST.LIMITS.breaker,ST.LIMITS.breakerIpFailures,ST.LIMITS.hardStop])assert(sql.includes(String(n)),'LIMITS in SQL: '+n);
  psql(`insert into save_throttle (bucket, win, failures) values ('f:global', save_window(60), 500) on conflict (bucket, win) do update set failures = 500`);
  await pg.create('3'.repeat(64),snap({}),20);
  assert.deepEqual(J(await pg.lookup('3'.repeat(64),'ip:z',false,false,now)),{ok:false},'SQL breaker: plain refused');
  assert.equal((await pg.lookup('3'.repeat(64),'ip:z',true,false,now)).ok,true,'SQL breaker: grown-up allowed');
  psql(`update save_throttle set failures=600 where bucket='f:global'`);
  assert.equal((await pg.lookup('3'.repeat(64),'ip:z',true,false,now)).ok,false,'SQL hard stop');
  // Retention in SQL.
  psql(`update game_saves set last_used_on = current_date - interval '12 months' - interval '1 day' where code_hash = decode('${'3'.repeat(64)}','hex')`);
  psql(`insert into save_throttle (bucket, win, failures) values ('c:old', now() - interval '3 days', 1); insert into save_salts values ('2020-01-01','x')`);
  const pr=await pg.purge(now);assert.equal(pr.saves,1);assert(pr.throttle>=1);
  assert.equal(psql(`select count(*) from save_salts where day < (now() at time zone 'utc')::date`),'0');
  // Through the real handler on SQL: no raw code in any table, and no email address.
  const deps={store:pg,pepper:PEPPER,email:{kind:'log',send:async()=>true}};
  const made=await call(deps,'create',{snapshot:snap({'fi2-idp-plan-v1':IDP_RAW,'fi2-welcome-v1':'completed'})});assert.equal(made.status,200);
  await call(deps,'email',{code:made.body.code,email:'grown.up@example.org'});
  const everything=psql(`select coalesce(string_agg(t::text, ' '), '') from (select to_jsonb(g)::text t from game_saves g union all select to_jsonb(s)::text from save_throttle s union all select to_jsonb(x)::text from save_salts x) z`);
  // A code word can also be ordinary snapshot data (e.g. kind:"coach"), so only words the snapshot itself doesn't contain count.
  const snapText=JSON.stringify(snap({'fi2-idp-plan-v1':IDP_RAW,'fi2-welcome-v1':'completed'}));
  assert(!everything.includes(made.body.code)&&!made.body.code.split('-').slice(0,3).filter(w=>!snapText.includes(w)).some(w=>everything.includes(`"${w}"`)),'no code in the database');
  assert(!everything.includes('example.org')&&!everything.includes('Oak Hill'),'no address, no coach-plan text in the database');
  assert(!everything.includes('203.0.113.7'),'no IP address in the database');
 }finally{
  try{cp.execFileSync(pgctl,['-D',path.join(dir,'data'),'-m','immediate','-w','stop'],quiet);}catch{}
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

// 12. Wiring.
await ok('wiring',()=>{
 assert(/node tests\/game-saves\.cjs/.test(read('package.json')),'part of npm test');
 // `/` renders the game through components/root/Game.tsx (the title screen comes first, Oct 9 2026).
 for(const f of ['components/root/Game.tsx','app/island-return/page.tsx'])assert(/<SaveSync\/>/.test(read(f))&&/from '@\/components\/saves\/LazySaveSync'/.test(read(f)),'boot check on '+f+', loaded after hydration');
 for(const f of ['app/arcade/page.tsx','app/konbini/page.tsx','app/museum/page.tsx'])assert(/<SaveSync boot=\{false\}\/>/.test(read(f)),'hide-save on '+f);
 assert(/SaveCodeCard/.test(read('components/IslandSettings.tsx'))&&/dynamicImport\(\(\)=>import\('\.\/saves\/SaveCodeCard'\)/.test(read('components/IslandSettings.tsx')),'Settings card, lazy');
 const g=read('components/GrownUps.tsx');assert(/Saving progress/.test(g)&&!/Vercel Web Analytics/.test(g),'grown-ups card; stale analytics wording gone');
 assert(/its own counter: no cookies and no personal identifiers/.test(g));
 assert(fs.existsSync('app/privacy/page.tsx')&&/PrivacyPolicy/.test(read('app/privacy/page.tsx'))&&/12 months/.test(read('components/privacy/PrivacyPolicy.tsx')),'/privacy (text in components/privacy/PrivacyPolicy.tsx)');
 assert(/saveAdminLine\(\)/.test(read('app/admin/page.tsx'))&&read('app/admin/page.tsx').indexOf('verifySession(')<read('app/admin/page.tsx').indexOf('saveAdminLine('),'admin line after the session check');
 assert(!/\/admin/.test(read('components/Town.tsx'))&&!/\/admin/.test(read('components/IslandSettings.tsx')));
 assert(!/console\./.test(read('lib/saves/admin.ts')));
 assert(/WAF/.test(read('docs/save-codes.md'))&&/SAVE_CODE_PEPPER/.test(read('docs/save-codes.md'))&&/RESEND_API_KEY/.test(read('docs/save-codes.md')),'setup doc');
});

console.log(`game-saves: ${passed} groups passed${skipped.length?`, skipped: ${skipped.join(', ')}`:''}`);
})().catch(e=>{console.error(e);process.exit(1);});
