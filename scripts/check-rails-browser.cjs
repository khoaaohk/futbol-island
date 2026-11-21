#!/usr/bin/env node
/* The side nav audit (owner, Nov 20 2026: "make sure to audit all the pages so they have the same pattern with the side nav, able to
   smooth scroll down to the content on that page. back btn on the side nav. all internal pages need to have side navs" and "fix all
   the internal pages to fill the page more and not leave empty space on the right side. also make sure it works responsively on all
   devices"). Opens one hub and two detail pages of every public page type (EN) and one hub + one detail per Spanish type, at
   390x844, 1440x900 and 2000x1100, and checks the rail pattern; then a wider set of widths for one detail page per template
   (geometry, sideways scroll, empty right-hand space only). Prints one row per page and width; exits 1 on any failure.
   Usage: FUTBOL_BASE_URL=http://localhost:9032 node scripts/check-rails-browser.cjs [--only=<substring>] [--quick]
   Needs a running dev or production server; opens one headless Chrome (muted) and closes it. */
const {chromium}=require('playwright');
const BASE=(process.env.FUTBOL_BASE_URL||'http://localhost:9032').replace(/\/$/,'');
const ONLY=(process.argv.find(a=>a.startsWith('--only='))||'').slice(7);
const QUICK=process.argv.includes('--quick');
/* --widths=390,1440 limits the main pass; --more=768,1024 limits the wider set (0: skip it) (Nov 20 2026) */
const ARG=k=>(process.argv.find(a=>a.startsWith(`--${k}=`))||'').slice(k.length+3);

/* page types: [type, hub, back of the hub (null: none), [details], back of a detail] */
const T=[
 ['library','/library',null,[],null],
 ['games','/games',null,['/games/soccer-pinball','/games/soccer-snake-game'],'/games'],
 ['videos','/videos','/library',['/videos/beach-football-match','/videos/futbol-island-match-formats'],'/videos'],
 ['rules','/learn/soccer-rules','/library',['/learn/soccer-rules/offside','/learn/soccer-rules/yellow-and-red-cards'],'/learn/soccer-rules'],
 ['terms','/learn/soccer-terms','/library',['/learn/soccer-terms/give-and-go','/learn/soccer-terms/third-man-run'],'/learn/soccer-terms'],
 ['drills','/learn/soccer-drills','/library',['/learn/soccer-drills/rondo-3v1','/learn/soccer-drills/u8','/learn/soccer-drills/passing'],'/learn/soccer-drills'],
 ['positions','/learn/soccer-positions','/library',['/learn/soccer-positions/goalkeeper','/learn/soccer-positions/numbers'],'/learn/soccer-positions'],
 ['formations','/learn/soccer-formations','/library',['/learn/soccer-formations/7v7-2-3-1','/learn/soccer-formations/9v9-3-1-3-1'],'/learn/soccer-formations'],
 ['lessons','/learn/lessons','/library',['/learn/lessons/learn7_roles','/learn/lessons/learn7_shape'],'/learn/lessons'],
 ['plans','/learn/soccer-practice-plans','/library',['/learn/soccer-practice-plans/u6-first-practice','/learn/soccer-practice-plans/u6-dribbling-practice-plan'],'/learn/soccer-practice-plans'],
 ['tools','/tools','/library',['/tools/7v7-lineup-builder','/tools/soccer-playing-time-calculator'],'/tools'],
 ['field-diagrams','/tools/soccer-field-diagrams','/tools',['/tools/soccer-field-diagrams/blank-7v7-soccer-field'],'/tools/soccer-field-diagrams'],
 ['age-groups','/learn/soccer-age-groups','/library',['/learn/soccer-ball-size-by-age','/learn/soccer-field-size-by-age'],'/learn/soccer-age-groups'],
 ['guides','/learn',null,['/learn/7v7-9v9-11v11','/learn/futsal-for-kids','/learn/football-rules-for-kids','/learn/passing-and-support','/learn/soccer-quiz-for-kids'],'/library'],
 ['format-guides',null,null,['/learn/7v7-soccer-formations','/learn/11v11-soccer-formations'],'/learn/soccer-formations'],
 ['compare-positions',null,null,['/learn/soccer-positions/fullback-vs-wingback'],'/learn/soccer-positions'],
 ['compare-formations',null,null,['/learn/soccer-formations/4-3-3-vs-4-4-2'],'/learn/soccer-formations'],
 ['es-compare',null,null,['/es/learn/soccer-positions/fullback-vs-wingback'],'/es/learn/soccer-positions'],
 ['es-topics',null,null,['/es/learn/soccer-quiz-for-kids','/es/learn/7v7-9v9-11v11'],'/es/library'],
 ['es-format-guides',null,null,['/es/learn/7v7-soccer-formations'],'/es/learn/soccer-formations'],
 ['books','/books','/library',['/books/messi','/books/marta'],'/books'],
 ['cards','/cards','/library',['/cards/strikers','/cards/10'],'/cards'],
 ['fish','/fish','/library',['/fish/sharks','/fish/cod'],'/fish'],
 ['exhibits','/exhibits','/library',['/exhibits/ball-curve','/exhibits/var-2018'],'/exhibits'],
 ['es-library','/es/library',null,[],null],
 ['es-rules','/es/learn/soccer-rules','/es/library',['/es/learn/soccer-rules/offside'],'/es/learn/soccer-rules'],
 ['es-terms','/es/learn/soccer-terms','/es/library',['/es/learn/soccer-terms/give-and-go'],'/es/learn/soccer-terms'],
 ['es-drills','/es/learn/soccer-drills','/es/library',['/es/learn/soccer-drills/u8'],'/es/learn/soccer-drills'],
 ['es-positions','/es/learn/soccer-positions','/es/library',['/es/learn/soccer-positions/goalkeeper'],'/es/learn/soccer-positions'],
 ['es-formations','/es/learn/soccer-formations','/es/library',['/es/learn/soccer-formations/7v7-2-3-1'],'/es/learn/soccer-formations'],
 ['es-lessons','/es/learn/lessons','/es/library',['/es/learn/lessons/learn7_roles'],'/es/learn/lessons'],
 ['es-plans','/es/learn/soccer-practice-plans','/es/library',['/es/learn/soccer-practice-plans/u6-first-practice'],'/es/learn/soccer-practice-plans'],
 ['es-tools','/es/tools','/es/library',['/es/tools/7v7-lineup-builder'],'/es/tools'],
 ['es-age-groups','/es/learn/soccer-age-groups','/es/library',['/es/learn/soccer-ball-size-by-age'],'/es/learn/soccer-age-groups'],
];
const WIDTHS=[[390,844],[1440,900],[2000,1100]];
const MORE=[[360,780],[430,932],[600,900],[768,1024],[820,1180],[1024,768],[1024,600],[1180,820],[1280,800],[1366,768],[1536,864],[1728,1117],[1920,1080],[2560,1440]];
if(ARG('widths'))WIDTHS.splice(0,WIDTHS.length,...WIDTHS.filter(([w])=>ARG('widths').split(',').map(Number).includes(w)));
if(ARG('more'))MORE.splice(0,MORE.length,...ARG('more').split(',').map(Number).filter(Boolean).map(w=>MORE.find(m=>m[0]===w)||[w,900]));
const CRUMB_X={390:16,1440:296,2000:364};

const pages=[];
for(const [type,hub,hubBack,details,back] of T){
 if(hub)pages.push({type,url:hub,back:hubBack,hub:true});
 for(const d of details)pages.push({type,url:d,back,hub:false});
}

async function load(p,url){
 if(p.__url===url){await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(500);return;}// same page, new width: no reload
 for(let i=0;i<3;i++){try{const r=await p.goto(BASE+url,{waitUntil:'domcontentloaded',timeout:180000});if(r&&r.status()<400)break;}catch(e){if(i===2)throw e;}await p.waitForTimeout(2000);}
 await p.waitForLoadState('load',{timeout:15000}).catch(()=>{});
 p.__url=url;
 await p.waitForTimeout(400);
 // scroll the whole page once so lazy content is in place, then back to the top
 await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}window.scrollTo(0,0);});
 await p.waitForTimeout(500);
}
const settle=async p=>{let last=-1;for(let i=0;i<40;i++){const y=await p.evaluate(()=>scrollY);if(y===last)return;last=y;await p.waitForTimeout(80);}};

/* everything measured in the page */
const probe=()=>{
 const nav=document.querySelector('nav[data-rail]');
 const hdr=document.querySelector('header[class*="header"], body > div header, header');
 const H=[...document.querySelectorAll('header')].find(h=>getComputedStyle(h).position==='fixed'||getComputedStyle(h).position==='sticky');
 const hb=H?H.getBoundingClientRect().bottom:0;
 if(!nav)return {rail:false,hb};
 const r=nav.getBoundingClientRect(),ul=nav.querySelector('ul');
 const links=[...nav.querySelectorAll('ul a')];
 const back=nav.querySelector('[data-rail-back] a');
 const lit=links.filter(a=>a.hasAttribute('data-on')||a.getAttribute('aria-current')==='page');
 return {rail:true,hb,nav:{l:r.left,t:r.top,b:r.bottom,w:r.width,h:r.height},
  links:links.map(a=>({href:a.getAttribute('href'),text:a.textContent.trim(),ok:a.getAttribute('href').startsWith('#')&&!!document.getElementById(a.getAttribute('href').slice(1))})),
  back:back?{href:back.getAttribute('href'),x:Math.round(back.getBoundingClientRect().left),y:Math.round(back.getBoundingClientRect().top)}:null,
  lit:lit.map(a=>a.getAttribute('href')),
  rows:ul?new Set(links.map(a=>Math.round(a.getBoundingClientRect().top))).size:0};
};

async function checkPage(p,pg,W,Hh,full){const T0=Date.now();const lap=s=>process.env.PROF&&console.error(pg.url,W,s,Date.now()-T0);
 const errs=[],note=[];
 await load(p,pg.url);lap('load');
 const d=await p.evaluate(probe);
 const isPhone=W<1280;
 if(!d.rail){errs.push('no rail');return {errs,note};}
 // Back
 if(pg.back===null){if(d.back)errs.push(`Back present (${d.back.href}), expected none`);}
 else if(!d.back)errs.push(`no Back (expected ${pg.back})`);
 else if(d.back.href!==pg.back)errs.push(`Back ${d.back.href} != ${pg.back}`);
 // the rail's first row (Back, or Overview where there is no Back) is centred on the breadcrumb's text line (|delta| <= 1 px)
 if(!isPhone){const c=await p.evaluate(()=>{const n=document.querySelector('nav[data-rail]');const a=n.querySelector('[data-rail-back] a')||n.querySelector('ul a');
   const cr=[...document.querySelectorAll('main nav')].find(x=>x!==n&&/crumb/i.test(x.className+' '+(x.getAttribute('aria-label')||'')));const t=cr&&(cr.querySelector('a,li,span')||cr);
   const ra=a.getBoundingClientRect(),rt=t?t.getBoundingClientRect():null;return {x:Math.round(ra.left),a:ra.top+ra.height/2,c:rt?rt.top+rt.height/2:null};});
  if(c.x!==12)errs.push(`first rail row at x${c.x} (want 12)`);
  if(c.c!=null&&Math.abs(c.a-c.c)>1)errs.push(`first rail row centre ${c.a.toFixed(1)} vs breadcrumb centre ${c.c.toFixed(1)}`);}
 // entries
 const L=d.links;
 if(!L.length)errs.push('empty list');
 else{
  if(L[0].href!=='#top'||!/^(Overview|Resumen)$/.test(L[0].text))errs.push(`first entry ${L[0].href} "${L[0].text}"`);
  const bad=L.filter(x=>!x.href.startsWith('#'));if(bad.length)errs.push(`${bad.length} page links (${bad[0].href})`);
  const miss=L.filter(x=>x.href.startsWith('#')&&!x.ok);if(miss.length)errs.push(`targets missing: ${miss.map(x=>x.href).join(' ')}`);
  if(L.length<2)errs.push('only 1 entry');
  if(d.lit.length!==1||d.lit[0]!=='#top')errs.push(`lit at load: [${d.lit.join(',')}]`);
 }
 const long=L.filter(x=>x.text.length>28);if(long.length)note.push(`long labels: ${long.map(x=>'"'+x.text+'"').join(', ')}`);
 // geometry
 if(!isPhone){
  if(Math.abs(d.nav.l)>1||Math.abs(d.nav.t-d.hb)>1.5||Math.abs(d.nav.b-Hh)>1.5)errs.push(`rail box l${d.nav.l|0} t${d.nav.t|0} b${d.nav.b|0} (hdr ${d.hb|0}, win ${Hh})`);
 }else{
  if(Math.abs(d.nav.t-d.hb)>1.5)errs.push(`chip bar top ${d.nav.t|0} != header ${d.hb|0}`);
  if(d.rows!==1)errs.push(`chip bar ${d.rows} rows`);
  if(pg.back&&d.back){const x0=d.back.x;const x1=await p.evaluate(()=>{const n=document.querySelector('nav[data-rail]'),u=n.querySelector('ul');u.scrollLeft=200;return Math.round(n.querySelector('[data-rail-back] a').getBoundingClientRect().left);});
   await p.evaluate(()=>{document.querySelector('nav[data-rail] ul').scrollLeft=0;});if(x0!==x1)errs.push(`Back moves with chips (${x0}->${x1})`);
   if(d.back.x>24)errs.push(`phone Back at x${d.back.x}`);}
 }
 const lay=await p.evaluate(()=>{
  const toc=[...document.querySelectorAll('[data-toc]')].some(t=>{const r=t.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(t).visibility!=='hidden';});
  const nav=document.querySelector('nav[data-rail]');const m=nav.closest('main')||document.querySelector('main');
  const cr=[...document.querySelectorAll('main nav')].find(n=>n!==nav&&!nav.contains(n)&&/crumb/i.test(n.className+' '+(n.getAttribute('aria-label')||'')));
  const ms=getComputedStyle(m),mr=m.getBoundingClientRect();
  const cl=mr.left+parseFloat(ms.paddingLeft),crt=mr.right-parseFloat(ms.paddingRight);
  let maxR=0;for(const e of m.querySelectorAll('*')){if(nav.contains(e))continue;const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0||r.top>document.documentElement.scrollHeight)continue;const st=getComputedStyle(e);if(st.position==='fixed')continue;if(r.right>maxR&&r.right<=innerWidth+1)maxR=r.right;}
  // full-width blocks: the same left and right edge as the content area (owner: Previous/Next, the FAQ and the footer columns too)
  const edges=[];const chk=(sel,L,R)=>{for(const e of document.querySelectorAll(sel)){const r=e.getBoundingClientRect();if(r.width<=0||r.height<=0)continue;if(Math.abs(r.left-L)>2||Math.abs(r.right-R)>2)edges.push(`${sel.split(' ').pop()} ${Math.round(r.left)}-${Math.round(r.right)}`);}};
  if(innerWidth>=1024){chk('main>[class*=pager]',cl,crt);for(const e of document.querySelectorAll('main [class*=faqList]')){const band=e.closest('section[data-tone]');if(!band){continue;}const bs=getComputedStyle(band),br=band.getBoundingClientRect(),r=e.getBoundingClientRect();if(r.width>0&&(Math.abs(r.left-br.left-parseFloat(bs.paddingLeft))>2||Math.abs(br.right-parseFloat(bs.paddingRight)-r.right)>2))edges.push(`faqList in its band ${Math.round(r.left)}-${Math.round(r.right)}`);}chk('main [class*=faqList]:not(section[data-tone] *)',cl,crt);/* a FAQ inside a tinted band (the games hub, Nov 20 2026) fills the band's inner width */chk('main>[data-keep-reading]',cl,crt);chk('main>section[class*=panel]',cl,crt);{const mr=m.getBoundingClientRect();{const pair=innerWidth>=1280&&m.querySelector(':scope>section[aria-labelledby=diagram]+section[aria-labelledby=facts]');if(pair){const a=pair.previousElementSibling.getBoundingClientRect(),b=pair.getBoundingClientRect();if(Math.abs(a.left-cl)>2||Math.abs(b.right-crt)>2||Math.abs(a.top-b.top)>2)edges.push(`drill diagram + At a glance pair ${Math.round(a.left)}-${Math.round(b.right)}`);}
   chk(pair?'main>section:not([data-band]):not([aria-labelledby=diagram]):not([aria-labelledby=facts])':'main>section:not([data-band])',cl,crt);/* from 1280 px a drill's diagram sits beside At a glance (Nov 20 2026): the pair spans the edges */}chk('main>section[data-band]',mr.left,mr.right);/* a hub band bleeds to the main column's box, its words on the content edges (Nov 20 2026) */}
   const f=document.querySelector('footer'),fh=f&&f.querySelector('[class*=footHubs]');if(fh){const fs=getComputedStyle(f),fr=f.getBoundingClientRect();const fl=fr.left+parseFloat(fs.paddingLeft),frr=fr.right-parseFloat(fs.paddingRight);
    const r=fh.getBoundingClientRect();if(Math.abs(r.left-cl)>2||(frr-r.right)>Math.max(24,(frr-fl)*.04))edges.push(`footer columns ${Math.round(r.left)}-${Math.round(r.right)} (footer ${Math.round(fl)}-${Math.round(frr)})`);}}
  const h1=document.querySelector('main h1');
  return {toc,crumb:cr?{x:Math.round(cr.getBoundingClientRect().left),y:Math.round(cr.getBoundingClientRect().top+scrollY)}:null,h1:h1?{x:Math.round(h1.getBoundingClientRect().left),y:Math.round(h1.getBoundingClientRect().top+scrollY)}:null,
   edges:[...new Set(edges)].slice(0,4),cl:Math.round(cl),cr:Math.round(crt),maxR:Math.round(maxR),sw:document.documentElement.scrollWidth,iw:innerWidth,
   h2:[...m.querySelectorAll('h2')].filter(h=>!nav.contains(h)&&h.getBoundingClientRect().height>0&&!h.closest('footer,[data-toc],details:not([open])')).map(h=>{const ids=[];for(let e=h;e&&e!==m;e=e.parentElement)if(e.id)ids.push(e.id);return {id:h.id,ids,t:h.textContent.trim().slice(0,40)};})};
 });
 if(lay.toc)errs.push('"On this page" visible');
 if(lay.edges.length)errs.push(`blocks off the content edges: ${lay.edges.join(', ')}`);
 if(lay.sw>lay.iw)errs.push(`sideways scroll ${lay.sw}>${lay.iw}`);
 if(!lay.crumb)errs.push('no breadcrumb');
 else{if(CRUMB_X[W]!=null&&Math.abs(lay.crumb.x-CRUMB_X[W])>2)errs.push(`crumb x${lay.crumb.x} (want ${CRUMB_X[W]})`);
  if(!isPhone&&Math.abs(lay.crumb.y-108)>3)errs.push(`crumb y${lay.crumb.y} (want 108)`);
  if(lay.h1&&lay.h1.y<lay.crumb.y)errs.push('H1 above the breadcrumb');}
 if(W>=1280){const empty=(lay.cr-lay.maxR)/Math.max(1,lay.cr-lay.cl);if(empty>.12)errs.push(`right side ${Math.round(empty*100)}% empty (content ${lay.cl}-${lay.maxR} of ${lay.cr})`);}
 if(!pg.hub&&full){const ids=new Set(L.map(x=>x.href.slice(1)));const miss=lay.h2.filter(h=>!h.ids.some(x=>ids.has(x)));if(miss.length)errs.push(`H2 not in rail: ${miss.map(h=>(h.id||'no-id')+':"'+h.t+'"').join('; ')}`);}
 lap('layout');
 if(!full||!L.length)return {errs,note,n:L.length};
 /* step scroll: exactly one lit entry, and the expected one */
 const hand=async y=>{await p.mouse.move(W/2,Hh/2);await p.mouse.wheel(0,0);await p.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);};
 const maxY=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
 const want=()=>{const nav=document.querySelector('nav[data-rail]');const links=[...nav.querySelectorAll('ul a[href^="#"]')];
  const last=document.getElementById(links[links.length-1].hash.slice(1));const line=Math.max(68,parseFloat(getComputedStyle(last).scrollMarginTop)||0)+24;
  const f=document.querySelector('footer');if(f&&f.getBoundingClientRect().bottom<=innerHeight+2)return [links[links.length-1].getAttribute('href')];
  let w=links[0].getAttribute('href'),near=[];for(const a of links){const t=document.getElementById(a.hash.slice(1));if(!t)continue;const top=t.getBoundingClientRect().top;if(top<=line)w=a.getAttribute('href');if(Math.abs(top-line)<6)near.push(a.getAttribute('href'));}
  const lit=links.filter(a=>a.hasAttribute('data-on')).map(a=>a.getAttribute('href'));return [w,lit,near];};
 let bad=0,first='';
 const steps=QUICK?Math.min(12,Math.ceil(maxY/300)):Math.ceil(maxY/300);
 for(let i=0;i<=steps;i++){const y=QUICK?Math.round(maxY*i/steps):Math.min(maxY,i*300);await hand(y);await p.waitForTimeout(140);
  const [w,lit,near]=await p.evaluate(want);if(!lit)continue;
  if(lit.length!==1||(lit[0]!==w&&!near.includes(lit[0])&&!near.includes(w))){bad++;if(!first)first=`y${y}: lit [${lit.join(',')}] want ${w}`;}}
 lap('steps');
 if(bad)errs.push(`scroll: ${bad} bad steps (${first})`);
 /* clicks: 2nd, middle, last */
 const idx=[...new Set([1,Math.floor(L.length/2),L.length-1])].filter(i=>i>0&&i<L.length);
 await hand(0);await p.waitForTimeout(200);
 for(const i of idx){const href=L[i].href;
  const vis=await p.evaluate(h=>{const a=[...document.querySelectorAll('nav[data-rail] ul a')].find(x=>x.getAttribute('href')===h);a.scrollIntoView({block:'nearest',inline:'center',behavior:'instant'});const r=a.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};},href);
  await p.mouse.click(vis.x,vis.y);await p.waitForTimeout(300);await settle(p);await p.waitForTimeout(250);
  const r=await p.evaluate(h=>{const nav=document.querySelector('nav[data-rail]');const t=document.getElementById(h.slice(1));const nb=innerWidth<1280?nav.getBoundingClientRect().bottom:0;
   const H=[...document.querySelectorAll('header')].find(x=>['fixed','sticky'].includes(getComputedStyle(x).position));const line=Math.max(nb,H?H.getBoundingClientRect().bottom:0);
   const lit=[...nav.querySelectorAll('ul a[data-on]')].map(a=>a.getAttribute('href'));
   return {top:Math.round(t.getBoundingClientRect().top),line:Math.round(line),lit,atEnd:Math.abs(scrollY-(document.documentElement.scrollHeight-innerHeight))<3};},href);
  if(!(r.lit.length===1&&r.lit[0]===href))errs.push(`click ${href}: lit [${r.lit.join(',')}]`);
  if(!r.atEnd&&(r.top<r.line-2||r.top>r.line+64))errs.push(`click ${href}: lands at ${r.top} (line ${r.line})`);
  if(r.top<r.line-2&&r.atEnd)errs.push(`click ${href}: under the header at the end (${r.top}<${r.line})`);
 }
 lap('clicks');
 /* rail still full height at the page end (beside the footer) */
 if(!isPhone){await hand(maxY);await p.waitForTimeout(200);const e=await p.evaluate(probe);if(Math.abs(e.nav.t-e.hb)>1.5||Math.abs(e.nav.b-Hh)>1.5)errs.push(`rail at end t${e.nav.t|0} b${e.nav.b|0}`);}
 return {errs,note,n:L.length};
}

(async()=>{
 let b;try{b=await chromium.launch({args:['--mute-audio']});}catch{b=await chromium.launch({channel:'chrome',args:['--mute-audio']});}
 const rows=[],fails=[];
 const run=async(pg,W,Hh,full,shared)=>{const ctx=shared?null:await b.newContext({viewport:{width:W,height:Hh},hasTouch:W<1024});const p=shared||await ctx.newPage();
  let res;try{res=await checkPage(p,pg,W,Hh,full);}catch(e){res={errs:['error: '+String(e.message||e).split('\n')[0].slice(0,120)],note:[]};}
  if(ctx)await ctx.close();
  const ok=!res.errs.length;const row=`| ${pg.type} | ${pg.url} | ${W}x${Hh} | ${res.n??'-'} | ${ok?'PASS':'FAIL'} | ${[...res.errs,...res.note.map(n=>'note: '+n)].join('; ').replace(/\|/g,'/')} |`;
  console.log(row);rows.push(row);if(!ok)fails.push(row);};
 console.log('| type | url | viewport | entries | result | detail |\n|---|---|---|---|---|---|');
 // one browser context per width, kept across pages so the dev server's script chunks come from the cache
 for(const [W,H] of WIDTHS){const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:W<1024});const p=await ctx.newPage();
  for(const pg of pages){if(ONLY&&!pg.url.includes(ONLY)&&pg.type!==ONLY)continue;await run(pg,W,H,true,p);}
  await ctx.close();}
 // the wider set of widths: one detail page per template, layout only
 const seen=new Set();
 if(MORE.length)for(const pg of pages){if(pg.hub||seen.has(pg.type)||pg.type.startsWith('es-'))continue;if(ONLY&&!pg.url.includes(ONLY)&&pg.type!==ONLY)continue;seen.add(pg.type);
  const ctx=await b.newContext({viewport:{width:MORE[0][0],height:MORE[0][1]}});const p=await ctx.newPage();
  for(const [W,H] of MORE){await p.setViewportSize({width:W,height:H});await p.waitForTimeout(400);await run(pg,W,H,false,p);}
  await ctx.close();}
 await b.close();
 console.log(`\n${rows.length-fails.length}/${rows.length} PASS`);
 process.exit(fails.length?1:0);
})();
