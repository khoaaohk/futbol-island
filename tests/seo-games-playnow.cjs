#!/usr/bin/env node
// Play now (Nov 22 2026; lib/site/gamePlay.ts, lib/analytics/gamePlayIds.ts, gamePlayReport.ts): every game page has a short
// how-to-play and play posters that exist at their stated size; the gp: analytics ids are fixed, well formed, allowlisted and match
// the game pages; a game page view counts once, its Play tap once per view (only for its own game), a hub tap once per game; the
// report and the daily CSV labels read them; VisitTracker wires the watcher; nothing personal in an id.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx',base+'.json'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
 throw Error('cannot resolve '+id+' from '+from);
}
const builtin=id=>{const r=require(id);return require('module').isBuiltin(id)?{...r,default:r}:r;};
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);
 if(file.endsWith('.json')){const v=JSON.parse(fs.readFileSync(file,'utf8'));const m={default:v};loaded.set(file,m);return m;}
 if(file.endsWith('.css')){const p=new Proxy({},{get:(_,k)=>k==='__esModule'?false:String(k)});const m={default:p};loaded.set(file,m);return m;}
 const m={exports:{}};loaded.set(file,m.exports);
 const ctx={module:m,exports:m.exports,Buffer,URL,URLSearchParams,TextDecoder,TextEncoder,Date,Math,JSON,Intl,process:{env:{},cwd:()=>ROOT},console,setTimeout,clearTimeout,
  require:id=>id.startsWith('.')||id.startsWith('@/')?load(resolve(file,id)):builtin(id)};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,ctx);
 loaded.set(file,m.exports);return m.exports;}
const P=load('lib/site/gamePlay.ts'),G=load('lib/site/games.ts'),GP=load('lib/analytics/gamePlayIds.ts'),GR=load('lib/analytics/gamePlayReport.ts'),
 K=load('lib/analytics/countIds.ts'),D=load('lib/analytics/daily.ts');
const read=f=>fs.readFileSync(f,'utf8'),J=x=>JSON.parse(JSON.stringify(x));
function webpSize(file){const b=fs.readFileSync(file);assert.equal(b.toString('ascii',0,4),'RIFF');const kind=b.toString('ascii',12,16);
 if(kind==='VP8X')return {w:1+b.readUIntLE(24,3),h:1+b.readUIntLE(27,3)};if(kind==='VP8 ')return {w:b.readUInt16LE(26)&0x3fff,h:b.readUInt16LE(28)&0x3fff};
 if(kind==='VP8L'){const n=b.readUInt32LE(21);return {w:1+(n&0x3fff),h:1+((n>>14)&0x3fff)};}throw Error('webp '+kind);}
// 1. content: every game page has controls, a one-line how to play, and posters on disk at their stated size
for(const g of G.ALL_GAME_PAGES){
 const c=P.GAME_CONTROLS[g.id];assert(c&&c[0].length>=8&&c[1].length>=8,`${g.id}: controls`);
 const line=P.howToPlay(g);assert(line.length<=120&&/^How to play: .+ on a phone, or .+ on a computer\.$/.test(line),`${g.id}: ${line}`);
 const shots=P.stageShots(g);assert(shots.length>=1&&shots.length<=3,`${g.id}: stage pictures`);
 for(const s of [...shots,P.cardShot(g)]){const f=path.join(ROOT,'public',s.src);assert(fs.existsSync(f),`${s.src} exists (node scripts/gen-play-posters.cjs)`);
  assert.deepEqual(J(webpSize(f)),{w:s.w,h:s.h},`${s.src} is ${s.w}x${s.h}`);assert(fs.statSync(f).size<=40*1024,`${s.src} stays small`);}
}
assert.equal(Object.keys(P.GAME_CONTROLS).length,G.ALL_GAME_PAGES.length,'no controls for a game that does not exist');
assert(!/IslandBrush/.test(read('components/site/games/games.module.css').split('Play now (Nov 22 2026')[1]),'the play buttons use the UI sans (AGENTS.md)');
// 2. ids: the fixed list matches the game pages, ids are well formed, allowlisted and unique
assert.deepEqual(J(GP.GP_GAMES),J(G.ALL_GAME_PAGES.map(g=>[g.id,g.slug,g.name])),'GP_GAMES matches lib/site/games.ts ALL_GAME_PAGES');
assert.equal(new Set(GP.GAME_PLAY_COUNT_IDS).size,GP.GAME_PLAY_COUNT_IDS.length);
for(const id of GP.GAME_PLAY_COUNT_IDS){assert(K.COUNT_KEY_RE.test(id),`${id} shape`);assert(K.FIXED_COUNT_IDS.includes(id),`${id} allowlisted`);assert(D.counterLabel(id)!==id,`${id} has a CSV label`);}
// 3. paths and links
assert.equal(GP.gamePageOf('/games'),'hub');assert.equal(GP.gamePageOf('/games/soccer-tennis-game'),'tennis');assert.equal(GP.gamePageOf('/games/soccer-tennis-game?x=1#faq'),'tennis');
for(const p of ['/','/play','/games/nope','/games/a/b','/learn',null,42])assert.equal(GP.gamePageOf(p),null,String(p));
const O='https://futbolisland.app';
assert.equal(GP.arcadeGameOf('/arcade?game=tennis',O),'tennis');assert.equal(GP.arcadeGameOf('/arcade?game=evil',O),null);assert.equal(GP.arcadeGameOf('https://x.example/arcade?game=tennis',O),null);assert.equal(GP.arcadeGameOf('/play',O),null);
// 4. the watcher
function env(){const fns=[],counts=[];return {counts,fire:href=>fns.forEach(f=>f({target:{closest:()=>href===null?null:{getAttribute:()=>href}}})),
 e:{origin:O,count:id=>counts.push(id),document:{addEventListener:(t,f)=>fns.push(f),removeEventListener:(t,f)=>fns.splice(fns.indexOf(f),1)}}};}
{const x=env();const stop=GP.watchGamePlays('/games/soccer-tennis-game',x.e);
 x.fire('/arcade?game=tennis');x.fire('/arcade?game=tennis');x.fire('/arcade?game=pinball');x.fire('/play');x.fire(null);
 assert.deepEqual(J(x.counts),['gp:v_tennis','gp:p_tennis'],'a game page: one view, one Play tap for its own game');stop();x.fire('/arcade?game=tennis');assert.equal(x.counts.length,2,'cleanup');}
{const x=env();GP.watchGamePlays('/games',x.e);x.fire('/arcade?game=tennis');x.fire('/arcade?game=snake');x.fire('/arcade?game=tennis');x.fire('/play');
 assert.deepEqual(J(x.counts),['gp:h_tennis','gp:h_snake'],'the hub: no view id, one tap per game');}
{const x=env();assert.equal(GP.watchGamePlays('/learn/soccer-rules',x.e),null);assert.equal(x.counts.length,0,'other pages cost nothing');}
// 5. the report
{const r=GR.buildGamePlays({counts:{'gp:v_tennis':10,'gp:p_tennis':4,'gp:h_tennis':3,'en:game_tennis':9,'gp:v_snake':2}});
 assert(r.hasData);assert.equal(r.rows.length,GP.GP_GAMES.length);assert.equal(r.rows[0].id,'tennis');assert.equal(r.rows[0].tapRate,.4);assert.equal(r.rows[0].launches,9);
 assert.equal(r.total.views,12);assert.equal(r.total.hubTaps,3);assert.equal(r.rows.find(x=>x.id==='kitrush').tapRate,null);
 assert(!GR.buildGamePlays({counts:{}}).hasData);}
// 6. wiring
assert(/watchGamePlays\(pathname,/.test(read('components/VisitTracker.tsx')),'VisitTracker watches game pages');
assert(/report\.gamePlays=buildGamePlays\(merged\)/.test(read('lib/analytics/report.ts')),'the report builds it');
assert(/<GamePlaysCard g=\{report\.gamePlays\}/.test(read('app/admin/SiteFunnelSection.tsx')),'the admin shows it');
assert(/data-play=\{game\.id\} data-play-now=""/.test(read('components/site/games/GameParts.tsx')),'the Play now button is marked');
console.log(`seo-games-playnow: ${G.ALL_GAME_PAGES.length} games, ${GP.GAME_PLAY_COUNT_IDS.length} ids ok`);
