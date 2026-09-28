const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,f);
const {createDailyPlay,localPlayDay,DAILY_PLAY_COINS,LEGACY_DAILY_PLAY_MAX}=require('../lib/town/dailyPlay.ts'),{createArcadeWallet,ARCADE_COIN_CAPS}=require('../lib/arcade/arcadeWalletCore.ts');
(async()=>{
 let now=new Date(2026,8,27,12).getTime(),saved=null,fail=false,queue=Promise.resolve(),strict=0;
 const ports={read:()=>structuredClone(saved),write:v=>{if(fail)throw Error('disk full');saved=structuredClone(v);},lock:(fn,purchase)=>{if(purchase)strict++;const result=queue.then(fn);queue=result.catch(()=>{});return result;},valid:new Set(),grant:()=>true,notify:()=>{},now:()=>now,id:()=>'',random:()=>0};
 const wallet=createArcadeWallet(ports);assert.equal(wallet.load().balance,0,'loading never grants');let notified=0;
 const tracker=()=>createDailyPlay({now:()=>now,claim:day=>wallet.grantDailyPlayCoins(day),earned:n=>notified+=n});
 const tick=(t,seconds,active=true,visible=true)=>{for(let i=0;i<seconds*20;i++){now+=50;t.step(.05,active,visible);}};
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 let t=tracker();tick(t,60,false);tick(t,60,true,false);await settle();assert.equal(wallet.load().balance,0,'idle and hidden never qualify');
 tick(t,29);await settle();assert.equal(wallet.load().balance,0);t.step(100,true);await settle();assert.equal(wallet.load().balance,0,'suspended frame cannot manufacture active time');tick(t,1);await settle();assert.equal(wallet.load().balance,30);assert.equal(notified,30);assert(strict>0,'daily credit uses strict shared lock');
 tick(t,90);await settle();assert.equal(wallet.load().balance,30);
 const reload=createArcadeWallet(ports);assert.equal(reload.load().balance,30);t=tracker();tick(t,30);await settle();assert.equal(wallet.load().balance,30,'same-day reload does not repay');assert.equal(notified,30,'no duplicate toast');
 now=new Date(2026,8,28,0,0,1).getTime();tick(t,29);await settle();assert.equal(wallet.load().balance,30,'midnight resets progress');tick(t,1);await settle();assert.equal(wallet.load().balance,60);
 const date=localPlayDay(now+86400000);now+=86400000;const other=createArcadeWallet(ports);const both=await Promise.all([wallet.grantDailyPlayCoins(date),other.grantDailyPlayCoins(date)]);assert.equal(both.reduce((n,r)=>n+r.amount,0),30,'two tabs pay only once');assert.equal(createArcadeWallet(ports).load().balance,90);
 now+=86400000;fail=true;assert.equal((await wallet.grantDailyPlayCoins(localPlayDay(now))).ok,false);assert.equal(wallet.load().balance,90,'failed storage never creates memory-only money');fail=false;assert.equal((await wallet.grantDailyPlayCoins(localPlayDay(now))).amount,30,'storage retry can succeed');assert.equal((await wallet.grantDailyPlayCoins('2026-01-01')).ok,false,'cannot claim arbitrary prior days');
 assert.equal(await wallet.creditRun('daily-play:2099-01-01','island',40,'Wrong route'),0,'ordinary credits cannot reserve daily receipt IDs');
 assert.equal(ARCADE_COIN_CAPS.island,20);assert.equal(await wallet.creditRun('normal','island',100,'Normal play'),20);
 // Economy pass (28 Sep 2026): the bonus is 30 now, and 40-coin receipts saved before the change stay whole (no balance shrinks).
 assert.equal(DAILY_PLAY_COINS,30);assert.equal(LEGACY_DAILY_PLAY_MAX,40);
 {let old={version:1,runs:{'daily-play:2026-09-20':{game:'island',paid:40,reason:'Daily play',at:1},'daily-play:2026-09-21':{game:'island',paid:999,reason:'Tampered',at:2}},packs:[]};
  const legacy=createArcadeWallet({...ports,read:()=>structuredClone(old),write:v=>{old=structuredClone(v);}});assert.equal(legacy.load().balance,80,'old 40-coin receipts keep 40; tampered ones clamp to 40');}
 console.log('PASS daily active-play qualification, idle/hidden/long-frame exclusion, midnight, reload, concurrent tabs, strict lock, storage failure and ordinary caps');
})().catch(e=>{console.error(e);process.exit(1)});
