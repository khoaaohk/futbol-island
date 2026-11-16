// IndexNow (seo-extras, Nov 15 2026; scripts/indexnow-ping.mjs, docs/indexnow.md, .github/workflows/indexnow.yml):
//  1. The key file in public/ exists and holds its own name; the script finds it and builds keyLocation on futbolisland.app.
//  2. Change detection (new or re-dated paths only), absolute URLs, batches of at most 10,000.
//  3. A dry run (no --send) never calls fetch and says so; the GitHub Action is manual only (workflow_dispatch, no push trigger).
// usage: node tests/seo-indexnow.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..');
(async()=>{
 const m=await import(path.join(root,'scripts/indexnow-ping.mjs'));
 const keyFile=fs.readdirSync(path.join(root,'public')).filter(f=>/^[0-9a-f]{32}\.txt$/.test(f));
 assert.equal(keyFile.length,1,'one IndexNow key file in public/');
 assert.equal(fs.readFileSync(path.join(root,'public',keyFile[0]),'utf8').trim(),keyFile[0].slice(0,-4),'the key file holds its own name');
 const k=m.findKey();assert.equal(k.key,keyFile[0].slice(0,-4));assert.equal(k.keyLocation,`https://futbolisland.app/${keyFile[0]}`);
 assert.deepEqual(m.changedPaths({'/a':'2026-11-01','/b':'2026-11-02','/gone':'2026-11-01'},{'/a':'2026-11-01','/b':'2026-11-15','/c':'2026-11-15'}),['/b','/c'],'new and re-dated only');
 assert.deepEqual(m.toUrls(['/','/learn/lessons']),['https://futbolisland.app/','https://futbolisland.app/learn/lessons']);
 const many=Array.from({length:25001},(_,i)=>`https://futbolisland.app/p${i}`),b=m.batches(many,k);
 assert.deepEqual(b.map(x=>x.urlList.length),[10000,10000,5001],'batches of at most 10,000');
 assert(b.every(x=>x.host==='futbolisland.app'&&x.key===k.key&&x.keyLocation===k.keyLocation),'every body has host, key, keyLocation');
 assert.equal(m.ENDPOINT,'https://api.indexnow.org/indexnow');
 // dry run: fetch must not be touched
 const realFetch=globalThis.fetch;let calls=0;globalThis.fetch=()=>{calls++;throw new Error('network in a dry run');};
 const lines=[];const r=await m.main(['--all'],x=>lines.push(x));globalThis.fetch=realFetch;
 assert.equal(calls,0,'a dry run sends nothing');assert.equal(r.sent,0);
 assert(r.urls.length>100&&r.urls.every(u=>u.startsWith('https://futbolisland.app/')),'--all lists every sitemap path');
 assert(/dry run: nothing sent/.test(lines[0]),'the dry run says so');
 const wf=fs.readFileSync(path.join(root,'.github/workflows/indexnow.yml'),'utf8');
 assert(/^on:\n  workflow_dispatch:/m.test(wf)&&!/^\s*push:/m.test(wf)&&!/schedule:/.test(wf),'the Action runs only by hand');
 assert(fs.existsSync(path.join(root,'docs/indexnow.md')),'docs/indexnow.md');
 console.log(`seo-indexnow: ok (dry run listed ${r.urls.length} URLs in ${r.bodies.length} batch(es), nothing sent)`);
})().catch(e=>{console.error(e);process.exit(1);});
