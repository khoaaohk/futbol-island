// Security headers (Nov 8 2026): next.config.mjs headers() sends nosniff, SAMEORIGIN framing, a referrer policy, a
// Permissions-Policy and a REPORT-ONLY CSP on every path, as the FIRST rule, so the cache / X-Robots-Tag rules after it
// still apply (Next sends the headers of every matching rule; a later rule wins only on the same key).
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'next.config.mjs'),'utf8');
(async()=>{
 const mod=await import(path.join(ROOT,'next.config.mjs'));
 for(const phase of ['phase-production-build','phase-development-server']){
  const rules=await mod.default(phase).headers(),dev=phase==='phase-development-server';
  const [first,...rest]=rules;
  assert.equal(first.source,'/:path*','the security rule is first and covers every path');
  const h=Object.fromEntries(first.headers.map(x=>[x.key,x.value]));
  assert.equal(h['X-Content-Type-Options'],'nosniff');
  // Nov 15 2026 (seo-extras): X-Frame-Options moved to its own rule (second) so the club embeds at /embed/* can be framed.
  assert.equal(h['X-Frame-Options'],undefined,'framing has its own rule');
  const xfo=rest[0];assert.equal(xfo.source,'/:path((?!embed(?:/|$)).*)');assert.deepEqual(xfo.headers,[{key:'X-Frame-Options',value:'SAMEORIGIN'}]);
  {const {pathToRegexp}=require('next/dist/compiled/path-to-regexp');for(const strict of [true,false]){const re=pathToRegexp(xfo.source,[],{strict,delimiter:'/'});
   for(const p of ['/','/play','/tools/soccer-lineup-builder','/embedded','/learn/lessons'])assert(re.test(p),`SAMEORIGIN on ${p}`);
   for(const p of ['/embed','/embed/','/embed/soccer-lineup-builder'])assert(!re.test(p),`no X-Frame-Options on ${p}`);}}
  const emb=rest[1];assert.equal(emb.source,'/embed/:path*');
  const eh=Object.fromEntries(emb.headers.map(x=>[x.key,x.value]));
  assert(eh['Content-Security-Policy-Report-Only'].includes('frame-ancestors *')&&!eh['Content-Security-Policy-Report-Only'].includes("frame-ancestors 'self'"),'embeds: frame-ancestors *');
  assert.equal(eh['X-Robots-Tag'],'noindex','embeds are noindex');
  for(const r of rules)if(r!==emb)for(const x of r.headers)assert(!/frame-ancestors \*/.test(x.value),'frame-ancestors * only on /embed/*');
  assert.equal(h['Referrer-Policy'],'strict-origin-when-cross-origin');
  const pp=h['Permissions-Policy'];
  for(const f of ['camera=()','microphone=()','geolocation=()','payment=()','accelerometer=(self)','gyroscope=(self)'])assert(pp.includes(f),`Permissions-Policy ${f}`);
  assert.match(pp,/fullscreen=\(self "https:\/\/www\.youtube\.com" "https:\/\/www\.youtube-nocookie\.com"\)/,'fullscreen: us + the YouTube player');
  const csp=h['Content-Security-Policy-Report-Only'];assert(csp,'CSP is sent report-only');
  for(const r of rules)for(const x of r.headers)assert.notEqual(x.key.toLowerCase(),'content-security-policy','no ENFORCING CSP anywhere');
  for(const d of ["default-src 'self'","object-src 'none'","frame-ancestors 'self'","base-uri 'self'",'wss://*.supabase.co','https://*.supabase.co','wss://party.futbolisland.app','https://futbol-media.khoa0aohk.workers.dev','https://www.youtube-nocookie.com','https://i.ytimg.com',"worker-src 'self' blob:"])assert(csp.includes(d),`CSP has ${d}`);
  assert.equal(/'unsafe-eval'/.test(csp),dev,"'unsafe-eval' only in dev (React refresh)");
  for(const x of first.headers)assert(!/^(cache-control|x-robots-tag)$/i.test(x.key),'the broad rule never sets a key the specific rules own');
  // the cache / robots rules are all still there, after the security rule
  const by=s=>rest.find(r=>r.source===s);
  assert.equal(by('/admin').headers.find(x=>x.key==='Cache-Control').value,'no-store');
  assert.equal(by('/admin').headers.find(x=>x.key==='X-Robots-Tag').value,'noindex, nofollow');
  assert(by('/marketing/:path+').headers.some(x=>x.key==='X-Robots-Tag'));
  assert(by('/players/:path*').headers.some(x=>x.key==='Cache-Control'));
  assert(rest.some(r=>/^\/:dir\(/.test(r.source)),'asset cache rules kept');
 }
 assert.match(src,/async headers\(\) \{ return \[securityHeaders\(phase === 'phase-development-server'\), ...frameHeaders\(phase === 'phase-development-server'\), \.\.\.cacheStatic\]; \}/,'security rule wired first');
 console.log('security-headers: ok');
})().catch(e=>{console.error(e);process.exit(1);});
