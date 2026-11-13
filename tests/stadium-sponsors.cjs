#!/usr/bin/env node
// Stadium sponsor slots (Nov 12 2026, phase 4 of the west stadium; lib/stadium/sponsors).
//  1. The slot model: specs, upload checks, picks (active, ordered, capped, placeholder fallback), rotation, feed sanitising.
//  2. Atlas packing: power of two, at most 1024² on phones, no overlaps, gutters inside the sheet; shrinks rather than grows.
//  3. The surfaces on real three.js: two meshes, one material, one texture; LED scroll and rotation only when drawn AND near;
//     faces point the way the layout says; reach counted once, only for real sponsors.
//  4. Picture sniffing (PNG / WebP / JPEG sizes from bytes) and the admin upload rules.
//  5. The read API falls back to placeholders (no database, no table, an error) and caches at the CDN.
//  6. The migration: RLS on, public read of active rows only, no write policy, public bucket, self-check row.
//  7. The admin route: session first on every method, same origin on writes; 401 without a session.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const {createLoader}=require('./summit-harness.cjs');
const read=f=>fs.readFileSync(f,'utf8');
let passed=0;const ok=async(name,fn)=>{try{await fn();passed++;}catch(e){console.error('FAIL',name);throw e;}};

/** A 2D context that accepts every call (records drawImage). */
function fakeCanvas(size){
 const calls={drawImage:0};
 const ctx=new Proxy({},{get:(t,k)=>k==='measureText'?(s=>({width:String(s).length*7})):k==='drawImage'?(()=>{calls.drawImage++;}):k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true;}});
 return {width:size,height:size,getContext:()=>ctx,calls};
}

(async()=>{
const load=createLoader();
const S=load('lib/stadium/sponsors/slots.ts'),A=load('lib/stadium/sponsors/atlas.ts'),L=load('lib/stadium/sponsors/layout.ts'),P=load('lib/stadium/sponsors/placeholders.ts');

await ok('slot model: specs, checks, picks, rotation, feed',()=>{
 assert.deepEqual([...S.SPONSOR_SLOTS],['board','screen','gate','fascia','flag','centre']);
 for(const id of S.SPONSOR_SLOTS){const sp=S.SLOT_SPECS[id];assert(Math.abs(sp.cell[0]/sp.cell[1]/sp.aspect-1)<.01,id+' cell ratio');assert(sp.maxSponsors>=1&&sp.label);}
 assert.equal(S.SLOT_SPECS.board.rotateMs>0&&S.SLOT_SPECS.screen.rotateMs>0,true);assert.equal(S.SLOT_SPECS.gate.rotateMs,null);
 assert.deepEqual(S.checkSponsorImage('board','image/png',200_000,1600,200),{ok:true});
 assert.equal(S.checkSponsorImage('board','image/png',200_000,1600,206).ok,true,'within 6%');
 assert.equal(S.checkSponsorImage('board','image/png',200_000,1600,400).error,'aspect');
 assert.equal(S.checkSponsorImage('board','image/gif',200_000,1600,200).error,'type');
 assert.equal(S.checkSponsorImage('board','image/svg+xml',200_000,1600,200).error,'type','no SVG (scripts)');
 assert.equal(S.checkSponsorImage('board','image/png',1_000_001,1600,200).error,'size');
 assert.equal(S.checkSponsorImage('board','image/png',0,1600,200).error,'empty');
 assert.equal(S.checkSponsorImage('board','image/png',1000,400,50).error,'small');
 assert.equal(S.checkSponsorImage('screen','image/jpeg',1000,1280,720).ok,true);assert.equal(S.checkSponsorImage('flag','image/webp',1000,400,600).ok,true);
 assert.equal(S.checkSponsorImage('centre','image/webp',1000,512,512).ok,true);
 assert(S.isActiveOn({starts_on:'2026-11-01',ends_on:null},'2026-11-12')&&S.isActiveOn({starts_on:'2026-11-12',ends_on:'2026-11-12'},'2026-11-12'));
 assert(!S.isActiveOn({starts_on:'2026-11-13',ends_on:null},'2026-11-12')&&!S.isActiveOn({starts_on:'2026-11-01',ends_on:'2026-11-11'},'2026-11-12'));
 const e=(id,slot,position=0)=>({id,slot,label:id,image:'/x.png',position});
 const picks=S.pickSlots([e('b2','board',2),e('b1','board',1),e('g1','gate'),e('g2','gate')],s=>P.PLACEHOLDER_COUNT[s]);
 assert.deepEqual(picks.board.map(p=>p.sponsor.id),['b1','b2'],'ordered by position');
 assert.deepEqual(picks.gate.map(p=>p.sponsor.id),['g1'],'gate holds one');
 assert.equal(picks.screen.length,P.PLACEHOLDER_COUNT.screen);assert(picks.screen.every(p=>!p.sponsor&&p.placeholder!==null),'placeholders fill empty slots');
 const nine=S.pickSlots(Array.from({length:9},(_,i)=>e('b'+i,'board',i)),()=>1);assert.equal(nine.board.length,S.SLOT_SPECS.board.maxSponsors);
 for(let i=0;i<16;i++)assert.notEqual(S.boardPick(i,3,2),S.boardPick(i+1,3,2),'neighbours differ');
 assert.equal(S.boardPick(5,0,1),0);assert.equal(S.rotationStep('board',S.SLOT_SPECS.board.rotateMs*3+1),3);assert.equal(S.rotationStep('gate',1e9),0);
 const f=S.parseFeed({entries:[{id:'a',slot:'board',image:'https://abc.supabase.co/storage/v1/object/public/stadium-sponsors/board/x.png',label:'A',position:0},
  {id:'b',slot:'board',image:'javascript:alert(1)'},{id:'c',slot:'nope',image:'/a.png'},{id:'d',slot:'gate',image:'https://evil.example/x.png'}]});
 assert.deepEqual(f.entries.map(x=>x.id),['a']);assert.equal(f.placeholder,false);
 assert.equal(S.parseFeed(null).placeholder,true);assert.equal(S.parseFeed({entries:'x'}).entries.length,0);
});

await ok('atlas: power of two, ≤1024 on phones, no overlap, shrinks',()=>{
 const full={};for(const s of S.SPONSOR_SLOTS)full[s]=Array.from({length:S.SLOT_SPECS[s].maxSponsors},(_,i)=>({slot:s,sponsor:{id:s+i},placeholder:null}));
 for(const picks of [full,S.pickSlots([],s=>P.PLACEHOLDER_COUNT[s])]){
  const items=A.atlasItems(picks),plan=A.packAtlas(items,A.PHONE_ATLAS_MAX);
  assert(plan.size<=1024&&(plan.size&(plan.size-1))===0,'pow2 '+plan.size);
  const rs=Object.values(plan.rects);assert.equal(rs.length,items.length);
  for(const r of rs)assert(r.x-plan.pad>=0&&r.y-plan.pad>=0&&r.x+r.w+plan.pad<=plan.size&&r.y+r.h+plan.pad<=plan.size,'inside with gutter');
  for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];
   assert(a.x+a.w+plan.pad<=b.x-plan.pad||b.x+b.w+plan.pad<=a.x-plan.pad||a.y+a.h+plan.pad<=b.y-plan.pad||b.y+b.h+plan.pad<=a.y-plan.pad,'no overlap');}
  const uv=A.uvOf(rs[0],plan.size);assert(uv.u>=0&&uv.v>=0&&uv.u+uv.w<=1&&uv.v+uv.h<=1);
 }
 const placeholdersOnly=A.packAtlas(A.atlasItems(S.pickSlots([],s=>P.PLACEHOLDER_COUNT[s])));assert.equal(placeholdersOnly.scale,1,'placeholders at full scale');
 const big=A.packAtlas(Array.from({length:40},(_,i)=>({key:'k'+i,w:512,h:256})),1024);assert(big.size===1024&&big.scale<1,'shrinks instead of growing past the cap');
 assert.throws(()=>A.packAtlas([{key:'x',w:1e6,h:1e6}],64));
});

await ok('surfaces: one material, two draw calls, sleeping animation, faces, reach',async()=>{
 const T=await import('three');
 const seen=[];const ld=createLoader({'three':T,'analytics/sponsorEvents':{countStadiumSeen:b=>seen.push(b)}});
 const SU=ld('lib/stadium/sponsors/surfaces.ts'),SL=ld('lib/stadium/sponsors/slots.ts'),PL=ld('lib/stadium/sponsors/placeholders.ts');
 globalThis.performance??=require('perf_hooks').performance;
 const build=(entries,now)=>{
  const images=new Map(entries.map(e=>[e.id,{width:8,height:8}]));
  const scene=new T.Scene(),c=[];
  const s=SU.buildSponsorSurfaces(scene,L.defaultStadiumLayout(),{picks:SL.pickSlots(entries,x=>PL.PLACEHOLDER_COUNT[x]),images,feed:{placeholder:!entries.length,generatedAt:'',entries}},
   {maxAtlas:1024,now,canvas:n=>{const k=fakeCanvas(n);c.push(k);return k;}});
  return {s,scene,canvas:c[0]};
 };
 let t=0;const {s,scene,canvas}=build([],()=>t);
 assert.equal(scene.children.length,1);assert.equal(s.group.children.length,2);assert.equal(s.ring.material,s.still.material);assert.equal(s.material.map,s.texture);
 assert.equal(s.stats.drawCalls,2);assert(s.stats.atlasSize<=1024);assert.equal(s.texture.generateMipmaps,true);assert.equal(s.texture.minFilter,T.LinearMipmapLinearFilter);
 assert.equal(s.ring.geometry.getAttribute('position').count,(16+1)*4,'16 boards + screen');
 const lay=L.defaultStadiumLayout();assert.equal(s.still.geometry.getAttribute('position').count,4+lay.fascia.length*4+lay.flags.length*8+34,'gate, fascia, flags both faces, disc');
 assert.equal(canvas.calls.drawImage,0,'placeholders only: no pictures drawn');
 // Faces point along yaw: the first board (west side) faces east, the screen faces north, the centre disc faces up.
 const pos=s.ring.geometry.getAttribute('position'),n=(g,i0)=>{const p=k=>new T.Vector3().fromBufferAttribute(g.getAttribute('position'),g.index.array[k]);
  const a=p(i0),b=p(i0+1),c=p(i0+2);return b.sub(a).cross(c.sub(a)).normalize();};
 assert(n(s.ring.geometry,0).x>.99,'west board faces east');assert(n(s.ring.geometry,16*6).z<-.99,'screen faces north');
 assert(n(s.still.geometry,0).x>.99,'gate faces east (the plaza)');
 const stillIdx=s.still.geometry.index.count;assert(n(s.still.geometry,stillIdx-3).y>.99,'centre disc faces up');
 assert(pos.count>0);
 // Shader hooks exist and compile-time text has the grads + LED.
 const sh={uniforms:{},vertexShader:'#include <common>\n#include <uv_vertex>',fragmentShader:'#include <common>\n#include <map_fragment>'};
 s.material.onBeforeCompile(sh);assert(/textureGrad/.test(sh.fragmentShader)&&/uScroll/.test(sh.fragmentShader)&&/aCell/.test(sh.vertexShader));
 const uScroll=sh.uniforms.uScroll;
 // Far camera: nothing moves. Near: the shared uniform moves. No sponsors: no reach counted.
 const far=new T.PerspectiveCamera();far.position.set(500,50,0);far.updateMatrixWorld();
 const near=new T.PerspectiveCamera();near.position.set(0,30,80);near.updateMatrixWorld();
 s.group.updateMatrixWorld();t=5000;s.ring.onBeforeRender(null,scene,far);assert.equal(uScroll.value,0,'asleep when far');
 s.ring.onBeforeRender(null,scene,near);assert(uScroll.value>0,'scrolls when near');assert.deepEqual(seen,[],'placeholders are not sponsor reach');
 assert(!/requestAnimationFrame|setInterval|setTimeout/.test(read('lib/stadium/sponsors/surfaces.ts').replace(/setTimeout\(r,1500\)/,'')),'no loop or timer of its own');
 // With two board sponsors: rotation rewrites cells only at a new step; screen goes dark and back.
 const e=(id,slot)=>({id,slot,label:id,image:'/x.png',position:0});
 t=0;const R=build([e('a','board'),e('b','board'),e('s','screen')],()=>t);R.s.group.updateMatrixWorld();
 const cell=R.s.ring.geometry.getAttribute('aCell'),first=cell.getX(0);
 t=SL.SLOT_SPECS.board.rotateMs+1;R.s.ring.onBeforeRender(null,R.scene,near);assert.notEqual(cell.getX(0),first,'board rotated');
 assert.deepEqual(seen,['boards_seen','screen_card']);
 const scr=R.s.uvRect('screen');R.s.setScreenSponsor(false);assert.notDeepEqual(R.s.uvRect('screen'),scr,'screen dark for the match');R.s.setScreenSponsor(true);assert.deepEqual(R.s.uvRect('screen'),scr);
 assert(R.canvas.calls.drawImage>=6,'pictures drawn with their gutters');
 const g=new T.PlaneGeometry(2,1);R.s.applyTo(g,'gate');assert.equal(g.getAttribute('aCell').count,g.getAttribute('position').count);
 R.s.dispose();assert.equal(R.scene.children.length,0);
 assert.throws(()=>SU.buildSponsorSurfaces(new T.Scene(),{...L.defaultStadiumLayout(),screen:{x:NaN,y:0,z:0,w:1,h:1,yaw:0}},{picks:SL.pickSlots([],()=>1),images:new Map(),feed:{}},{canvas:fakeCanvas}),/layout/);
 // The lazy entry imports no three.js / canvas code at module load.
 const idx=read('lib/stadium/sponsors/index.ts');assert(/import\('\.\/surfaces'\)/.test(idx)&&!/^import [^t].*from '\.\/surfaces'/m.test(idx)&&!/from 'three'/.test(idx));
 assert.equal(L.repeatsFor({w:22,h:.92},8),3);assert.equal(L.repeatsFor({w:2,h:1},8),1);
});

await ok('picture sniffing and admin upload rules',async()=>{
 const I=load('lib/stadium/sponsors/imageSize.ts');
 const png=new Uint8Array(33);png.set([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a,0,0,0,13,0x49,0x48,0x44,0x52]);new DataView(png.buffer).setUint32(16,1600);new DataView(png.buffer).setUint32(20,200);
 assert.deepEqual(I.imageInfo(png),{type:'image/png',width:1600,height:200});
 const webp=new Uint8Array(30);webp.set([...Buffer.from('RIFF'),0,0,0,0,...Buffer.from('WEBPVP8X')]);webp.set([0x3f,0x06,0],24);webp.set([0x67,0x04,0],27);
 assert.deepEqual(I.imageInfo(webp),{type:'image/webp',width:1600,height:1128});
 const jpg=new Uint8Array([0xff,0xd8,0xff,0xe0,0,16,...new Array(14).fill(0),0xff,0xc0,0,17,8,0x02,0xd0,0x05,0x00,3,0,0,0,0,0,0,0,0,0]);
 assert.deepEqual(I.imageInfo(jpg),{type:'image/jpeg',width:1280,height:720});
 assert.equal(I.imageInfo(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')),null);assert.equal(I.imageInfo(new Uint8Array([0x89,0x50])),null);
 const AD=load('lib/stadium/sponsors/admin.ts');
 assert.equal(AD.cleanLabel('  Island   Juice Co '),'Island Juice Co');for(const bad of ['','x'.repeat(61),'visit https://a.b','www.shop','juice.com',7])assert.equal(AD.cleanLabel(bad),null,String(bad));
 const log=[];const store={publicUrl:p=>'https://x.supabase.co/storage/v1/object/public/stadium-sponsors/'+p,
  upload:async(p)=>{log.push('up '+p);return true;},removeObject:async p=>{log.push('rm '+p);return true;},
  insert:async r=>({id:'11111111-2222-3333-4444-555555555555',...r}),remove:async id=>({id,slot:'board',image_path:'board/x.png'}),listAll:async()=>({status:'ok',rows:[]}),readActive:async()=>({status:'ok',rows:[]})};
 const file=(bytes,type='image/png')=>({type,size:bytes.length,bytes});
 const base={slot:'board',label:'Island Juice',starts_on:'2026-11-12',ends_on:'',position:'0',file:file(png)};
 const NOW=Date.parse('2026-11-12T20:00:00Z');
 const good=await AD.adminUpload(store,base,NOW);assert.equal(good.status,200,JSON.stringify(good.body));assert.equal(good.body.row.active,true);assert(/^up board\/[0-9a-f-]{36}\.png$/.test(log[0]));
 assert.equal((await AD.adminUpload(store,{...base,slot:'centre'},NOW)).body.error,'aspect');
 assert.equal((await AD.adminUpload(store,{...base,file:file(png,'image/jpeg')},NOW)).body.error,'type','declared type must match the bytes');
 assert.equal((await AD.adminUpload(store,{...base,file:file(Buffer.from('<svg/>'),'image/png')},NOW)).body.error,'type');
 assert.equal((await AD.adminUpload(store,{...base,ends_on:'2026-11-01'},NOW)).body.error,'dates');
 assert.equal((await AD.adminUpload(store,{...base,starts_on:'2026-13-45'},NOW)).body.error,'dates');
 assert.equal((await AD.adminUpload(store,{...base,label:'go to juice.com'},NOW)).body.error,'label');
 assert.equal((await AD.adminUpload(store,{...base,slot:'roof'},NOW)).body.error,'slot');
 assert.equal((await AD.adminUpload(store,{...base,position:'100'},NOW)).body.error,'position');
 assert.equal((await AD.adminUpload(store,{...base,file:{type:'image/png',size:2_000_000,bytes:png}},NOW)).status,413);
 assert.equal((await AD.adminUpload(null,base,NOW)).status,503);
 log.length=0;const failing={...store,insert:async()=>null};const f=await AD.adminUpload(failing,base,NOW);assert.equal(f.status,502);assert(log[1].startsWith('rm '),'stored file removed when the row fails');
 assert.equal((await AD.adminRemove(store,'not-a-uuid')).status,400);assert.equal((await AD.adminRemove(store,'11111111-2222-3333-4444-555555555555')).status,200);
 assert.equal((await AD.adminList(null)).body.status,'unconfigured');
});

await ok('read API: placeholder fallback, RLS read with the anon key, CDN cache',async()=>{
 const run=async(env,fetchImpl)=>{
  const saved={...process.env},savedFetch=globalThis.fetch;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;delete process.env.SUPABASE_SERVICE_ROLE_KEY;Object.assign(process.env,env);
  if(fetchImpl)globalThis.fetch=fetchImpl;
  try{const R=createLoader()('app/api/stadium-sponsors/route.ts');const res=await R.GET();return {res,body:await res.json()};}
  finally{process.env=saved;globalThis.fetch=savedFetch;}
 };
 const env={NEXT_PUBLIC_SUPABASE_URL:'https://abc.supabase.co',NEXT_PUBLIC_SUPABASE_ANON_KEY:'anon',SUPABASE_SERVICE_ROLE_KEY:'service'};
 const none=await run({});assert.equal(none.body.placeholder,true);assert.deepEqual(none.body.entries,[]);assert(/s-maxage=\d+/.test(none.res.headers.get('cache-control')));
 const missing=await run(env,async()=>new Response(JSON.stringify({code:'PGRST205'}),{status:404}));assert.equal(missing.body.placeholder,true);
 const broken=await run(env,async()=>{throw new Error('down');});assert.equal(broken.body.placeholder,true);
 const empty=await run(env,async()=>new Response('[]',{status:200}));assert.equal(empty.body.placeholder,true);
 let sentKey='';const today=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles'}).format(new Date());
 const live=await run(env,async(url,init)=>{sentKey=init.headers.apikey;return new Response(JSON.stringify([
  {id:'a',slot:'board',label:'A',image_path:'board/a.png',starts_on:'2026-01-01',ends_on:null,position:0},
  {id:'b',slot:'board',label:'B',image_path:'board/b.png',starts_on:'2026-01-01',ends_on:'2026-01-02',position:0}]),{status:200});});
 assert.equal(sentKey,'anon','the public read uses the anon key (RLS decides)');
 assert.deepEqual(live.body.entries.map(e=>e.id),['a'],'ended rows dropped again');
 assert.equal(live.body.entries[0].image,'https://abc.supabase.co/storage/v1/object/public/stadium-sponsors/board/a.png');
 const cc=live.res.headers.get('cache-control');assert(/public/.test(cc)&&Number(/s-maxage=(\d+)/.exec(cc)[1])>=3600,'long CDN cache: '+cc);
 assert(today.length===10);
 const src=read('app/api/stadium-sponsors/route.ts');assert(!/cookies\(|headers\(\)|searchParams/.test(src),'reads nothing about the caller');
});

await ok('migration: RLS, active-only public read, no write policy, public bucket',()=>{
 const files=fs.readdirSync('supabase/migrations').sort();const mine='20261118_stadium_sponsors.sql';
 assert(files.includes(mine));assert(files.indexOf(mine)>files.findIndex(f=>f.startsWith('20261117_')),'after 20261117_*');
 const sql=read('supabase/migrations/'+mine).replace(/--[^\n]*/g,'');
 assert(/create table if not exists public\.stadium_sponsors/.test(sql));
 assert(/alter table public\.stadium_sponsors enable row level security/.test(sql));
 assert(/revoke all on public\.stadium_sponsors from public, anon, authenticated/.test(sql));
 assert(/grant select on public\.stadium_sponsors to anon, authenticated/.test(sql));
 assert(!/grant (insert|update|delete|all)[^;]*to (anon|authenticated)/i.test(sql),'no write grant for the public');
 const policies=[...sql.matchAll(/create policy (\w+) on public\.stadium_sponsors\s+for (\w+) to ([\w, ]+)\s+using \(([\s\S]*?)\);/g)];
 assert.equal(policies.length,1,'exactly one policy');assert.equal(policies[0][2],'select');
 assert(/starts_on <=/.test(policies[0][4])&&/ends_on is null or ends_on >=/.test(policies[0][4]),'active rows only');
 assert(!/on storage\.objects/.test(sql),'no storage write policy: service role only');
 assert(/insert into storage\.buckets[\s\S]*'stadium-sponsors', 'stadium-sponsors', true, 1000000/.test(sql),'public bucket, 1 MB');
 assert(/'image\/png', 'image\/webp', 'image\/jpeg'/.test(sql));
 assert(/check \(slot in \('board', 'screen', 'gate', 'fascia', 'flag', 'centre'\)\)/.test(sql),'slots match the model');
 assert(!/\b(link|href|click|url)\b/i.test(sql.replace(/image_path/g,'')),'no link column');
 assert(/'OK, stadium sponsors installed'/.test(sql));
});

await ok('admin route: session first, same origin on writes, 401 without a session',async()=>{
 const src=read('app/api/admin/stadium-sponsors/route.ts');
 for(const m of ['GET','POST','DELETE']){
  const body=new RegExp(`export async function ${m}\\([^)]*\\)\\{([\\s\\S]*?)\\n\\}`).exec(src)[1];
  const auth=body.indexOf('await authed()'),work=body.search(/admin(List|Upload|Remove)|formData/);
  assert(auth>=0&&auth<work,m+': session checked before any work');
  if(m!=='GET')assert(body.indexOf('sameOrigin(')>=0&&body.indexOf('sameOrigin(')<auth,m+': same origin first');
 }
 assert(/loadSessionEpoch\(\)/.test(src)&&/verifySession\(cookies\(\)\.get\(ADMIN_COOKIE\)/.test(src),'the admin session, like every /api/admin route');
 assert(/'Cache-Control':'no-store'/.test(src));
 const R=createLoader({'next/headers':{cookies:()=>({get:()=>undefined})},'analytics/adminSession':{loadSessionEpoch:async()=>{}}})('app/api/admin/stadium-sponsors/route.ts');
 assert.equal((await R.GET()).status,401);
 assert.equal((await R.POST(new Request('https://f.test/api/admin/stadium-sponsors',{method:'POST',headers:{origin:'https://evil.test',host:'f.test'}}))).status,403);
 assert.equal((await R.POST(new Request('https://f.test/api/admin/stadium-sponsors',{method:'POST',headers:{origin:'https://f.test',host:'f.test'}}))).status,401);
 assert.equal((await R.DELETE(new Request('https://f.test/api/admin/stadium-sponsors?id=x',{method:'DELETE',headers:{origin:'https://f.test',host:'f.test'}}))).status,401);
 // The admin section lives on the Island and games tab and fetches pictures as blobs (CSP), with no polling.
 const dash=read('app/admin/AnalyticsDashboard.tsx'),sec=read('app/admin/StadiumSponsorsSection.tsx');
 assert(/<StadiumSponsorsSection\/>/.test(dash));assert(/createObjectURL/.test(sec)&&!/setInterval/.test(sec));
 assert(!/from '@\/lib\/stadium\/sponsors\/(store|admin|imageSize)'/.test(sec),'no server modules in the client');
});

await ok('reach counters: allowlisted, once per session',()=>{
 const K=load('lib/analytics/countIds.ts');
 for(const [e] of K.ENGAGE_STADIUM_EVENTS){assert(K.isCountId('en:'+e),e);assert(K.COUNT_KEY_RE.test('en:'+e));}
 assert(!K.isCountId('en:stadium_sponsor_acme'),'never a sponsor name');
 const got=[];const E=createLoader({'./tracker':{count:id=>got.push(id)}})('lib/analytics/sponsorEvents.ts');
 E.countStadiumVisit();E.countStadiumVisit();E.countStadiumSeen('boards_seen');E.countStadiumSeen('boards_seen');
 assert.deepEqual(got,['en:stadium_visit','en:stadium_boards_seen']);
 const doc=read('docs/admin-sponsor-insights.md');assert(/en:stadium_visit/.test(doc),'documented');
});

console.log(`stadium sponsors: ${passed} groups passed`);
})().catch(e=>{console.error(e);process.exit(1);});
