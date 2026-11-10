#!/usr/bin/env node
// Privacy audit, Nov 10 2026: no raw save code leaves the client for analytics (a SHA-256 made on the device), the server's
// player id rotates every 90 days, an old page's raw `pc` is dropped, and the privacy policy says what the code does.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader({regions:{regionName:(c,r)=>r}});
const read=f=>fs.readFileSync(f,'utf8');
const H=load('lib/analytics/playerHash.ts'),P=load('lib/analytics/playerId.ts'),C=load('lib/analytics/core.ts'),F=load('lib/analytics/deviceMarks.ts'),T=load('lib/analytics/tracker.ts');
const CODE='striker-volley-corner-4271',HASH=crypto.createHash('sha256').update('futbol-island analytics player v1|'+CODE).digest('hex');
let n=0;const ok=(name,fn)=>{try{fn();n++;}catch(e){console.error('FAIL',name);throw e;}};

ok('sha256Hex equals node crypto (block boundaries, unicode)',()=>{
 for(const s of ['','a','abc','x'.repeat(55),'x'.repeat(56),'x'.repeat(63),'x'.repeat(64),'x'.repeat(1000),'ñandú ⚽ 足球',CODE])
  assert.equal(H.sha256Hex(s),crypto.createHash('sha256').update(s,'utf8').digest('hex'),JSON.stringify(s.slice(0,12)));
 assert.equal(H.playerHash(CODE),HASH);
});
ok('the device sends the hash, never the code',()=>{
 const mem={'fi2-save-code-v1':CODE},st={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};
 const k=F.readPlayerKey(st,n=>new Uint8Array(n));assert.deepEqual(k,{ph:HASH});
 const sent=[],w={location:{hostname:'futbolisland.app',pathname:'/',search:''},addEventListener(){},removeEventListener(){},setTimeout:()=>1,clearTimeout(){}};
 const d={visibilityState:'visible',referrer:'',addEventListener(){},removeEventListener(){}};
 const nav={sendBeacon:(u,b)=>{sent.push(String(b));return true;},maxTouchPoints:0};
 T.startTracker({window:w,document:d,navigator:nav,storage:st,now:()=>0,random:k=>new Uint8Array(k).map((_,i)=>i),player:()=>F.readPlayerKey(st,n=>new Uint8Array(n))}).pageview('/');
 assert(sent.length&&sent.every(b=>!b.includes(CODE)&&!/"pc"/.test(b)),'no raw code in any beacon');
 assert(sent.some(b=>b.includes(HASH)),'the hash rides the start');
 assert(C.validateEvent(sent.find(b=>b.includes('"start"'))).ok);
 assert.match(read('components/VisitTracker.tsx'),/readPlayerKey\(window\.localStorage/);
});
ok('the server drops a raw code and refuses code-shaped values',()=>{
 const base={v:1,t:'start',s:'privNov10A0000000001',p:'/'};
 const v=C.validateEvent(JSON.stringify({...base,pc:CODE}));assert(v.ok&&!('pc' in v.event),'pc dropped unread');
 assert.equal(P.derivePlayerId({pc:CODE},{salt:'s'.repeat(20)}),null,'a raw code never becomes an id');
 for(const bad of [{p:'/play/'+CODE},{r:'example.com/'+CODE},{u:{source:CODE}},{ph:CODE},{ph:'g'.repeat(64)}])
  assert.equal(C.validateEvent(JSON.stringify({...base,...bad})).ok,false,JSON.stringify(bad));
});
ok('player ids rotate every 90 days and are stable inside a period',()=>{
 const sec={salt:'salt-for-analytics-0123456789'},DAY=864e5,start=P.periodIndex(Date.UTC(2026,10,10))*90*DAY;
 assert.equal(P.PERIOD_DAYS,90);assert.equal(P.periodStart(Date.UTC(2026,10,10)).toISOString().slice(0,10),'2026-09-04');
 const a=P.derivePlayerId({ph:HASH},sec,start),b=P.derivePlayerId({ph:HASH},sec,start+90*DAY-1),c=P.derivePlayerId({ph:HASH},sec,start+90*DAY);
 assert.match(a,/^[0-9a-f]{32}$/);assert.equal(a,b,'same id across the whole period');assert.notEqual(a,c,'a new id the next period');
 const i1=P.derivePlayerId({pi:'0123456789abcdef0123456789abcdef'},sec,start),i2=P.derivePlayerId({pi:'0123456789abcdef0123456789abcdef'},sec,start+90*DAY);
 assert.notEqual(i1,i2,'install ids rotate too');
 // Unlinkable without the salt: the next id is HMAC(new period key, same input), not a function of the old id.
 const pk=q=>crypto.createHmac('sha256',sec.salt).update('player id period '+q).digest();
 assert.equal(c,crypto.createHmac('sha256',pk(P.periodIndex(start)+1)).update('h:'+HASH).digest('hex').slice(0,32));
 assert.match(read('docs/security/analytics-player-ids.md'),/restart/i);
});
ok('the privacy policy matches the code',()=>{
 const src=read('components/privacy/PrivacyPolicy.tsx'),text=src.replace(/^[\s\S]*?export default function/,'').replace(/\{\/\*[\s\S]*?\*\/\}/g,'').replace(/<[^>]+>/g,' ');
 assert.match(src,/POLICY_UPDATED='November 10, 2026'/);
 assert(!/small groups|too small to stay anonymous|identify anyone|order of a visitor’s actions/i.test(text),'old wording gone');
 assert(/exact combined/i.test(text)&&/never anything about one child/i.test(text),'sponsors: exact combined totals');
 assert(/every 90 days/.test(text)&&/right on the device/.test(text)&&/order of the screens/.test(text),'player number: on the device, 90 days, screen order');
 assert(/search engine or an AI assistant/.test(text)&&/Never the search words/.test(text),'search arrivals');
 assert(/contact details are being added/.test(text),'contact placeholder');
 assert((src.match(/\[LAWYER\] Nov 10 2026/g)||[]).length>=8,'[LAWYER] on each changed paragraph');
 assert(/export const OPERATOR:\{name:string;address:string\|null\}=\{name:'Futbol Island',address:null\}/.test(src)&&/PRIVACY_CONTACT:string\|null=null/.test(src));
});
console.log(`privacy-nov10: ${n} groups passed`);
