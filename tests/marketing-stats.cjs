#!/usr/bin/env node
// Marketing page stats (Nov 3 2026): the mk: ids are allowlisted and well formed; the page tracker (lib/analytics/marketingEvents.ts)
// maps taps, toggles, sections, carousel/slideshow/steps, time, scroll, media and Web Vitals to fixed ids only; a real tracker
// beacon carries them and the ingest keeps them (and drops anything else); the report maths (rates, median, average, small-number
// exact counts (no suppression), the Play → reached → played funnel, daily series) adds up; the admin "Marketing page" tab renders seeded data and its empty state; heat rules.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const ROOT=path.resolve(__dirname,'..');process.chdir(ROOT);
const loaded=new Map();
function resolve(from,id){
 const base=id.startsWith('@/')?path.join(ROOT,id.slice(2)):path.resolve(path.dirname(from),id);
 for(const f of [base,base+'.ts',base+'.tsx'])if(fs.existsSync(f)&&fs.statSync(f).isFile())return f;
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
const K=load('lib/analytics/countIds.ts'),MI=load('lib/analytics/marketingIds.ts'),ME=load('lib/analytics/marketingEvents.ts'),MR=load('lib/analytics/marketingReport.ts'),
 T=load('lib/analytics/tracker.ts'),C=load('lib/analytics/core.ts'),S=load('lib/analytics/store.ts'),I=load('lib/analytics/ingest.ts'),R=load('lib/analytics/report.ts');
const read=f=>fs.readFileSync(f,'utf8');
const J=x=>JSON.parse(JSON.stringify(x)),deq=(a,b,msg)=>assert.deepStrictEqual(J(a),J(b),msg);
let passed=0;const ok=(name,fn)=>Promise.resolve().then(fn).then(()=>{passed++;},e=>{console.error('FAIL',name);throw e;});

// ---- a tiny fake DOM: enough for closest / querySelectorAll / attributes / listeners ----
function el(tag,attrs={},kids=[]){
 const e={tagName:tag.toUpperCase(),attrs:{...attrs},parent:null,children:[],listeners:{},open:false,
  get id(){return this.attrs.id||'';},
  getAttribute(n){return n in this.attrs?String(this.attrs[n]):null;},hasAttribute(n){return n in this.attrs;},
  setAttribute(n,v){this.attrs[n]=v;},removeAttribute(n){delete this.attrs[n];},
  closest(sel){for(let x=this;x;x=x.parent)if(matches(x,sel))return x;return null;},
  querySelectorAll(sel){const out=[];const walk=n=>{for(const c of n.children){if(matches(c,sel))out.push(c);walk(c);}};walk(this);return out;},
  addEventListener(k,f,o){(this.listeners[k]??=[]).push({f,o});},removeEventListener(k,f){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x.f!==f);},
  get parentElement(){return this.parent;}};
 for(const k of kids){k.parent=e;e.children.push(k);}return e;
}
function matches(e,sel){return sel.split(',').some(one=>{const m=one.trim().match(/^([a-z]+)?(#[\w-]+)?((?:\[[^\]]+\])*)$/);if(!m)throw Error('selector '+one);
 if(m[1]&&e.tagName!==m[1].toUpperCase())return false;if(m[2]&&e.id!==m[2].slice(1))return false;
 for(const a of (m[3].match(/\[[^\]]+\]/g)||[])){const [,n,v]=a.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);if(!e.hasAttribute(n))return false;if(v!==undefined&&e.getAttribute(n)!==v)return false;}
 return true;});}
const fire=(target,type,ev={})=>{const path=[];for(let x=target;x;x=x.parent)path.unshift(x);for(const n of path)for(const {f,o} of [...(n.listeners[type]||[])])if(o?.capture)f({type,target,...ev});};

// The page, as app/(site)/page.tsx and components/learn/* render it (only the hooks the tracker reads).
function page(){
 const subnav=el('nav',{'data-subnav':''},[el('a',{href:'/'}),el('ul',{'data-sublinks':''},['learn','explore','together','safe'].map(id=>el('li',{},[el('a',{href:'#'+id})]))),
  el('details',{'data-menu':''},[el('summary'),el('div',{},[el('a',{href:'#learn'}),el('a',{href:'#safe'})])]),el('button',{type:'button'},[el('span')])]);
 const hero=el('section',{id:'top'},[el('a',{href:'/play'}),el('a',{href:'#in-action'}),el('img',{src:'/a.jpg'})]);
 const film=el('section',{id:'film','data-montage':''},[el('button',{'data-mv-btn':''})]);
 const cards=[0,1,2].map(i=>el('div',{'data-reel-card':'',...(i===0?{'data-active':''}:{})},[el('button',{'data-rv-btn':''})]));
 const reel=el('section',{id:'in-action','data-reel':''},[el('div',{'data-reel-row':''},cards),el('button',{'data-reel-prev':''}),el('button',{'data-reel-next':''})]);
 const steps=[0,1,2].map(i=>el('li',{'data-step':i,...(i===0?{'data-on':''}:{})}));
 const together=el('section',{id:'together'},[el('ol',{},steps)]);
 const slides=[0,1].map(i=>el('div',{'data-slide':'',...(i===0?{'data-active':''}:{})},[el('button',{'data-sv-btn':''})]));
 const more=el('section',{id:'more','data-slides':''},[el('div',{'data-slide-row':''},slides),el('button',{'data-dot':''}),el('button',{'data-slides-toggle':''})]);
 const faqs=[0,1,2].map(()=>el('details',{},[el('summary')]));
 const safe=el('section',{id:'safe'},[el('div',{id:'faq'},[el('div',{'data-faq-list':''},faqs)])]);
 const end=el('section',{'aria-labelledby':'end-h'},[el('a',{href:'/play'})]);
 const odd=el('section',{id:'not-a-chapter'});
 const root=el('div',{id:'learn-root'},[subnav,hero,film,reel,el('section',{id:'learn'},[el('div',{'data-lv-btn':''})]),together,more,safe,end,odd,
  el('a',{href:'https://apps.apple.com/app/x'}),el('a',{href:'https://example.org/'}),el('a',{href:'/privacy'}),el('a',{href:'/learn/lessons'}),el('a',{href:'/grownups'}),el('button',{'data-track':'mk:c_share'})]);
 return {root,subnav,hero,film,cards,reel,steps,together,slides,more,faqs,safe,end,odd};
}
const ORIGIN='https://futbolisland.app';

(async()=>{
await ok('ids: well formed, allowlisted, in FIXED_COUNT_IDS, no duplicates',()=>{
 assert(MI.MARKETING_COUNT_IDS.length>100);
 for(const id of MI.MARKETING_COUNT_IDS){assert(K.COUNT_KEY_RE.test(id),id);assert(K.isCountId(id),id);assert(K.FIXED_COUNT_IDS.includes(id),id);}
 assert.equal(new Set(K.FIXED_COUNT_IDS).size,K.FIXED_COUNT_IDS.length);
 assert(!K.isCountId('mk:bogus')&&!MI.isMarketingId('mk:c_nav_x'));
 // the sections are the page's real chapter ids
 const src=read('app/(site)/page.tsx')+read('components/learn/LearnReel.tsx')+read('components/learn/LearnSlides.tsx')+read('components/learn/LearnMontage.tsx')+read('lib/site/learnFeatures.ts');
 for(const [id] of MI.MK_SECTIONS)if(id!=='end')assert(src.includes(`id="${id.replace('_','-')}"`)||src.includes(`id:'${id}'`),'section '+id);
});

await ok('classifiers: referrer, device, time band, vital band',()=>{
 const c=(r,s='')=>MI.classifyReferrer(r,'futbolisland.app',s);
 deq(c(''),{src:'direct',ref:null});
 deq(c('https://www.google.com/search?q=kids'),{src:'search',ref:'google'});
 deq(c('https://www.google.co.uk/'),{src:'search',ref:'google'});
 deq(c('https://gemini.google.com/app'),{src:'ai',ref:'gemini'});
 deq(c('https://chatgpt.com/'),{src:'ai',ref:'chatgpt'});
 deq(c('https://l.facebook.com/l.php'),{src:'social',ref:'facebook'});
 deq(c('https://t.co/abc'),{src:'social',ref:'x'});
 deq(c('https://someblog.example/post'),{src:'referral',ref:'other'});
 deq(c('https://futbolisland.app/about'),{src:'internal',ref:null});
 deq(c('','?utm_source=flyer'),{src:'campaign',ref:null});
 deq(c('','?from=flyer'),{src:'campaign',ref:null});
 assert.equal(MI.deviceOf(true,390),'phone');assert.equal(MI.deviceOf(true,820),'tablet');assert.equal(MI.deviceOf(false,390),'desktop');
 assert.equal(MI.timeBand(3000),'0_10');assert.equal(MI.timeBand(10_000),'10_30');assert.equal(MI.timeBand(45_000),'30_60');assert.equal(MI.timeBand(3_600_000),'600');
 assert.equal(MI.vitalBand('lcp',2400),'good');assert.equal(MI.vitalBand('lcp',3000),'ni');assert.equal(MI.vitalBand('cls',0.3),'poor');assert.equal(MI.vitalBand('inp',150),'good');
 for(const r of [c('https://www.google.com/'),c('https://x.example/')])for(const v of Object.values(r))if(v)assert(MI.isMarketingId('mk:src_'+v)||MI.isMarketingId('mk:ref_'+v));
});

await ok('clickId: every control on the page maps to one fixed id (and plain text maps to nothing)',()=>{
 const p=page(),q=s=>p.root.querySelectorAll(s),id=t=>ME.clickId(t,ORIGIN);
 assert.equal(id(p.hero.children[0]),'mk:c_play_hero');assert.equal(id(p.end.children[0]),'mk:c_play_end');
 assert.equal(id(p.subnav.children[3].children[0]),'mk:c_play_nav');// the bar's Play is a button; a tap on its label span
 assert.equal(id(p.hero.children[1]),'mk:c_watch');assert.equal(id(p.subnav.children[0]),'mk:c_logo');
 deq(q('[data-sublinks]')[0].querySelectorAll('a').map(id),['mk:c_nav_learn','mk:c_nav_explore','mk:c_nav_together','mk:c_nav_safe']);
 deq(q('[data-menu]')[0].querySelectorAll('a').map(id),['mk:c_menu_learn','mk:c_menu_safe']);
 assert.equal(id(q('[data-menu]')[0].querySelectorAll('summary')[0]),null);assert.equal(id(p.faqs[0].children[0]),null);// counted on toggle
 assert.equal(id(q('[data-reel-prev]')[0]),'mk:c_reel_prev');assert.equal(id(q('[data-reel-next]')[0]),'mk:c_reel_next');
 const rv=q('[data-rv-btn]')[0];assert.equal(id(rv),'mk:c_reel_play');rv.setAttribute('data-playing','');assert.equal(id(rv),'mk:c_reel_pause');
 assert.equal(id(q('[data-mv-btn]')[0]),'mk:c_film_play');assert.equal(id(q('[data-sv-btn]')[0]),'mk:c_slide_play');
 assert.equal(id(q('[data-dot]')[0]),'mk:c_slide_dot');
 const tg=q('[data-slides-toggle]')[0];assert.equal(id(tg),'mk:c_slide_pause');tg.setAttribute('data-paused','');assert.equal(id(tg),'mk:c_slide_resume');
 const links=p.root.children.filter(x=>x.tagName==='A');
 deq(links.map(id),['mk:c_store','mk:c_external','mk:c_privacy','mk:c_lessons','mk:c_grownups']);
 assert.equal(id(p.root.children.find(x=>x.hasAttribute('data-track'))),'mk:c_share');
 assert.equal(id(el('p')),null);assert.equal(id(null),null);assert.equal(id({}),null);
 const bad=el('button',{'data-track':'mk:c_whatever'});assert.equal(id(bad),null);// not allowlisted
});

// Fake browser for watchMarketing: manual clock, capture listeners first (as browsers do at the target).
function browser({referrer='https://www.google.com/',coarse=true}={}){
 let t=0;const counts={},hooks=new Set();const doc=el('#document');doc.visibilityState='visible';doc.referrer=referrer;doc.documentElement={scrollHeight:4000};
 const io=[],mo=[],po=[];
 class IO{constructor(cb){this.cb=cb;this.els=[];io.push(this);}observe(e){this.els.push(e);}disconnect(){this.off=true;}}
 class MO{constructor(cb){this.cb=cb;mo.push(this);}observe(r,o){this.o=o;}disconnect(){this.off=true;}}
 class PO{constructor(cb){this.cb=cb;}observe(o){po.push({type:o.type,cb:this.cb,o});}disconnect(){}}
 const w={innerHeight:800,scrollY:0,location:{hostname:'futbolisland.app',origin:ORIGIN,search:''},matchMedia:()=>({matches:coarse}),screen:{width:390,height:844},addEventListener(){},removeEventListener(){}};
 const session=new Map();
 const p=page();p.root.parent=doc;doc.children.push(p.root);
 const env={window:w,document:doc,root:p.root,now:()=>t,count:(id,n=1)=>{assert(K.isCountId(id),'unknown id '+id);counts[id]=(counts[id]||0)+n;},
  session:{getItem:k=>session.get(k)??null,setItem:(k,v)=>session.set(k,v),removeItem:k=>session.delete(k)},local:{getItem:()=>null},IO,MO,PO,onPageHide:f=>{hooks.add(f);return()=>hooks.delete(f);}};
 return {p,doc,w,env,counts,io,mo,po,session,advance:ms=>{t+=ms;},hide(){doc.visibilityState='hidden';fire(doc,'visibilitychange');},show(){doc.visibilityState='visible';fire(doc,'visibilitychange');},pagehide:()=>{for(const f of hooks)f();}};
}
const see=(b,target,h=600,full=900)=>b.io[0].cb([{isIntersecting:true,target,intersectionRect:{height:h},boundingClientRect:{height:full}}]);

await ok('watchMarketing: view, device, source, sections, carousel/slides/steps, FAQ, menu, taps, Play flag',()=>{
 const b=browser(),stop=ME.watchMarketing(b.env),c=b.counts;
 assert.equal(c['mk:view'],1);assert.equal(c['mk:d_phone'],1);assert.equal(c['mk:src_search'],1);assert.equal(c['mk:ref_google'],1);assert.equal(c['mk:ret_no'],1);
 // only the real chapters are observed (not an unknown section)
 assert(b.io[0].els.includes(b.p.hero)&&b.io[0].els.includes(b.p.end)&&!b.io[0].els.includes(b.p.odd));
 see(b,b.p.hero);assert.equal(c['mk:v_top'],1);see(b,b.p.hero);assert.equal(c['mk:v_top'],1,'once per view');
 see(b,b.p.learn??b.p.root.children[4],100,900);assert.equal(c['mk:v_learn'],undefined,'a sliver is not a view');
 // a tall section counts when it fills half the screen
 see(b,b.p.together,420,3000);assert.equal(c['mk:v_together'],1);assert.equal(c['mk:fs_1'],1);
 b.p.steps[0].removeAttribute('data-on');b.p.steps[2].setAttribute('data-on','');b.mo[0].cb([{target:b.p.steps[2],attributeName:'data-on'},{target:b.p.steps[0],attributeName:'data-on'}]);
 assert.equal(c['mk:fs_3'],1);assert.equal(c['mk:fs_2'],undefined);
 // the carousel: card 2 becomes active BEFORE the section is seen → not counted until seen
 b.p.cards[0].removeAttribute('data-active');b.p.cards[1].setAttribute('data-active','');b.mo[0].cb([{target:b.p.cards[1],attributeName:'data-active'}]);
 assert.equal(c['mk:rc_2'],undefined);see(b,b.p.reel);assert.equal(c['mk:v_in_action'],1);assert.equal(c['mk:rc_2'],1);
 b.p.slides[0].removeAttribute('data-active');b.p.slides[1].setAttribute('data-active','');see(b,b.p.more);assert.equal(c['mk:sl_2'],1);
 // FAQ (n-th question, once) and the phone menu, from toggle
 b.p.faqs[1].open=true;fire(b.p.faqs[1],'toggle');fire(b.p.faqs[1],'toggle');assert.equal(c['mk:faq_2'],1);
 const menu=b.p.root.querySelectorAll('[data-menu]')[0];menu.open=true;fire(menu,'toggle');assert.equal(c['mk:c_menu_open'],1);
 // taps through the one document listener
 fire(b.p.hero.children[0],'click');assert.equal(c['mk:c_play_hero'],1);assert.equal(c['mk:play'],1);assert(Number(b.session.get('fi-mk-play'))>0,'Play sets the per-tab flag');
 fire(b.p.end.children[0],'click');assert.equal(c['mk:play'],1,'mk:play once per view');assert.equal(c['mk:engaged'],1);
 fire(b.p.hero,'click');// a tap on nothing tracked
 // scroll depth, read on section callbacks
 b.w.scrollY=3200;see(b,b.p.end);assert.equal(c['mk:s25'],1);assert.equal(c['mk:s100'],1);
 // media
 fire(b.p.film,'playing');fire(b.p.film,'playing');assert.equal(c['mk:vid_ok'],1);
 fire(b.p.hero.children[2],'error');assert.equal(c['mk:err_img'],1);
 stop();assert(b.io[0].off&&b.mo[0].off,'observers disconnected on stop');
 for(const k of Object.keys(c))assert(k.startsWith('mk:'),k);
});

await ok('watchMarketing: time on page, bounce, first-stint band, Web Vitals; nothing at rest',()=>{
 const b=browser({referrer:'',coarse:false}),c=b.counts;const stop=ME.watchMarketing(b.env);
 assert.equal(c['mk:d_desktop'],1);assert.equal(c['mk:src_direct'],1);
 // vitals arrive on the buffered observers
 const obs=t=>b.po.find(x=>x.type===t);assert(obs('largest-contentful-paint')&&obs('layout-shift')&&obs('event'));assert.equal(obs('event').o.durationThreshold,40);
 obs('largest-contentful-paint').cb({getEntries:()=>[{startTime:1800},{startTime:2900}]});
 obs('layout-shift').cb({getEntries:()=>[{startTime:100,value:0.05,hadRecentInput:false},{startTime:400,value:0.04,hadRecentInput:false},{startTime:500,value:0.5,hadRecentInput:true}]});
 obs('event').cb({getEntries:()=>[{interactionId:1,duration:120},{interactionId:0,duration:900},{interactionId:2,duration:240}]});
 b.advance(4000);b.hide();
 assert.equal(c['mk:t_0_10'],1);assert.equal(c['mk:engaged'],undefined,'4 s and no tap = a bounce');assert.equal(c['mk:sec10'],undefined);assert.equal(c['mk:sec1'],4,'whole seconds, exact');
 assert.equal(c['mk:lcp_ni'],1);assert.equal(c['mk:cls_good'],1);assert.equal(c['mk:inp_ni'],1);
 b.advance(60_000);// hidden time never counts
 b.show();b.advance(14_000);b.pagehide();
 assert.equal(c['mk:sec10']*10+c['mk:sec1'],18,'4 s + 14 s = 18 s exactly');assert.equal(c['mk:sec10'],1);assert.equal(c['mk:engaged'],1);assert.equal(c['mk:t_0_10'],1,'the band is the first stint only');assert.equal(c['mk:t_10_30'],undefined);
 b.advance(1e9);stop();assert.equal(c['mk:sec10'],1,'stop after leaving adds nothing');assert.equal(c['mk:sec1'],8);
 const b2=browser();const s2=ME.watchMarketing(b2.env);b2.advance(3_600_000);s2();assert.equal(b2.counts['mk:sec10'],MI.MAX_SEC10,'capped');assert.equal(b2.counts['mk:sec1'],undefined);
});

await ok('mk:reached: only after a fresh Play tap in this tab, once',()=>{
 const got=[];const st=new Map([['fi-mk-play',String(1000)]]);const ss={getItem:k=>st.get(k)??null,removeItem:k=>st.delete(k)};
 MI.countPlayArrival(ss,5000,id=>got.push(id));MI.countPlayArrival(ss,6000,id=>got.push(id));deq(got,['mk:reached']);
 st.set('fi-mk-play',String(1000));MI.countPlayArrival(ss,1000+11*60_000,id=>got.push(id));deq(got,['mk:reached'],'stale flag ignored');
 MI.countPlayArrival(null,1,id=>got.push(id));
 {const vt=read('components/VisitTracker.tsx').replace(/\s+/g,'');assert(vt.includes("pathname==='/play'&&tracker.current)countPlayArrival(")&&vt.includes('Date.now(),count)'),'VisitTracker counts the arrival on /play');}
});

await ok('mk:played: only a tab that came from a marketing Play tap, reached /play and entered the game; once per tab; fresh only',()=>{
 const mk=()=>{const st=new Map();return {st,ss:{getItem:k=>st.get(k)??null,removeItem:k=>st.delete(k),setItem:(k,v)=>st.set(k,String(v))}};};
 const got=[],cnt=id=>got.push(id);
 {const {st,ss}=mk();MI.countPlayStart(ss,5000,cnt);deq(got,[],'no marketing tap, no reach → nothing');
  st.set(MI.MK_PLAY_KEY,'1000');MI.countPlayStart(ss,2000,cnt);deq(got,[],'a tap alone (not yet on /play) is not playing');
  MI.countPlayArrival(ss,3000,cnt);deq(got,['mk:reached']);assert.equal(st.get(MI.MK_REACHED_KEY),'r3000');
  MI.countPlayStart(ss,3000+60_000,cnt);deq(got,['mk:reached','mk:played']);assert(!st.has(MI.MK_REACHED_KEY));
  MI.countPlayStart(ss,3000+70_000,cnt);deq(got,['mk:reached','mk:played'],'once');
  st.set(MI.MK_PLAY_KEY,'200000');MI.countPlayArrival(ss,201000,cnt);MI.countPlayStart(ss,202000,cnt);
  deq(got,['mk:reached','mk:played','mk:reached'],'a second tap in the same tab can reach again but plays once per tab');}
 got.length=0;
 {const {st,ss}=mk();st.set(MI.MK_PLAY_KEY,'1000');MI.countPlayArrival(ss,2000,cnt);MI.countPlayStart(ss,2000+MI.PLAY_FRESH_MS+1,cnt);deq(got,['mk:reached'],'stale arrival ignored');}
 MI.countPlayStart(null,1,cnt);
 assert(MI.isMarketingId('mk:played')&&MI.isMarketingId('mk:sec1')&&K.isCountId('mk:played')&&K.isCountId('mk:sec1'),'allowlisted');
 const vt=read('components/VisitTracker.tsx').replace(/\s+/g,'');
 assert(vt.includes("pathname==='/play'&&view==='game'&&tracker.current)countPlayStart("),'VisitTracker counts mk:played when /play switches to the game');
});

// ---- the real pipeline: tracker beacon → ingest → memory store → report ----
let seed=0;
function trackerEnv(){
 const L={};let t=0;const sent=[],store={};
 const add=(k,f,o)=>{(L[k]??=[]).push({f,o});},rm=(k,f)=>{L[k]=(L[k]||[]).filter(x=>x.f!==f);};
 const w={location:{hostname:'futbolisland.app',origin:ORIGIN,pathname:'/',search:''},addEventListener:add,removeEventListener:rm,setTimeout:()=>1,clearTimeout:()=>{},innerHeight:800,scrollY:0,matchMedia:()=>({matches:true}),screen:{width:390,height:844}};
 const d={visibilityState:'visible',referrer:'https://chatgpt.com/',addEventListener:add,removeEventListener:rm,documentElement:{scrollHeight:3000}};
 const n={sendBeacon:(u,b)=>{sent.push(JSON.parse(b));return true;},maxTouchPoints:5};
 return {w,d,sent,now:()=>t,advance:ms=>{t+=ms;},
  e:{window:w,document:d,navigator:n,storage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v;}},now:()=>t,random:k=>{seed++;return new Uint8Array(k).map((_,i)=>(i*7+seed*53+(i===0?seed:0))&255);}},
  // capture listeners first, as at the target in a browser
  fire(k){const ls=[...(L[k]||[])];for(const x of ls.filter(x=>x.o?.capture))x.f({type:k});for(const x of ls.filter(x=>!x.o?.capture))x.f({type:k});}};
}
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
function hdr(extra={}){const m=new Map(Object.entries({host:'futbolisland.app','user-agent':UA,'x-forwarded-for':'203.0.113.7',origin:ORIGIN,...extra}));return {get:k=>m.get(k.toLowerCase())??null};}
const ingest=(store,body,now,h=hdr())=>I.handleIngest({body:JSON.stringify(body),headers:h,store,limiter:I.createLimiter({capacity:1e6}),now,vercelEnv:'production'});

await ok('beacon shape → ingest → report: the mk ids ride the existing beat; nothing else is added; DNT stores nothing',async()=>{
 const store=S.createMemoryStore(),now=new Date();
 for(let v=0;v<6;v++){
  const x=trackerEnv(),tr=T.startTracker(x.e);tr.pageview('/');
  const p=page();const stop=ME.watchMarketing({window:x.w,document:x.d,root:p.root,now:x.now,local:null,session:null,IO:class{constructor(cb){this.cb=cb;}observe(){}disconnect(){}},MO:class{observe(){}disconnect(){}}});
  x.advance(25_000+v*1000);if(v<4)T.count('mk:c_play_hero');if(v<4)T.count('mk:play');
  x.d.visibilityState='hidden';x.fire('visibilitychange');stop();tr.stop();
  const beat=x.sent.find(b=>b.t==='beat'&&b.k);assert(beat,'the hide beat carries the counters');
  assert.equal(x.sent.filter(b=>b.t==='start').length,1,'no extra request: one start, beats only');
  for(const k of Object.keys(beat.k))assert(K.isCountId(k));assert(beat.k['mk:view']===1&&beat.k['mk:src_ai']===1&&beat.k['mk:ref_chatgpt']===1&&beat.k['mk:sec10']>=2);
  assert(!/chatgpt\.com|futbolisland|href|#/.test(JSON.stringify(beat.k)),'no hosts or URLs in counters');
  for(const b of x.sent){const h=hdr({'x-forwarded-for':'203.0.113.'+(10+v)});assert.equal((await ingest(store,b,now,h)).reason,'ok');}
 }
 // the ingest drops ids that are not allowlisted, and refuses malformed ones
 const x=trackerEnv();const tr=T.startTracker(x.e);tr.pageview('/');const start=x.sent[0];
 assert.equal((await ingest(store,{v:1,t:'beat',s:start.s,p:'/',e:1000,k:{'mk:bogus':3}},now)).reason,'ok');
 assert.equal((await ingest(store,{v:1,t:'beat',s:start.s,p:'/',e:1000,k:{'mk:http://x':1}},now)).status,400);
 assert.equal((await ingest(store,{v:1,t:'beat',s:start.s,p:'/',e:1000,k:{'mk:view':1}},now,hdr({dnt:'1'}))).reason,'dnt');
 tr.stop();
 const day=C.dayIn('pacific',now),rep=await R.buildReport(store,{from:day,to:day},now),m=rep.marketing;
 assert(m&&m.hasData);assert.equal(m.views,6);assert.equal(m.sessions,6);assert.equal(m.visitors,6,'unique visitors = sessions that entered on /');
 assert.equal(m.play.sessions,4,'exact, no small-number suppression');assert.equal(m.play.ctr,4/6);assert.equal(m.play.taps,4);
 assert.equal(m.sources.find(r=>r.id==='mk:src_ai').count,6);assert.equal(m.devices.find(r=>r.id==='mk:d_phone').count,6);
 assert.equal(m.engagedRate,1);assert.equal(m.bounceRate,0);assert.equal(m.medianBand,'10–30 s');
 assert.equal(m.avgSeconds,28,'exact: (25+26+…+30)/6 = 27.5 s → 28 s');assert.equal(m.avgMs,28_000);
 assert.equal(m.daily.length,1);assert.equal(m.daily[0].views,6);
 const stored=JSON.stringify(store.data.beats.map(b=>b.counts));assert(!stored.includes('bogus'));
});

await ok('report maths: rates, funnel, median, suppression, daily series',()=>{
 const counts={'mk:view':200,'mk:engaged':150,'mk:sec10':900,'mk:sec1':123,'mk:play':40,'mk:reached':30,'mk:played':24,'mk:c_play_hero':30,'mk:c_play_nav':14,'mk:s25':160,'mk:s50':120,'mk:s75':80,'mk:s100':50,
  'mk:t_0_10':50,'mk:t_10_30':40,'mk:t_30_60':30,'mk:t_60_180':50,'mk:t_180_600':20,'mk:t_600':10,'mk:v_top':190,'mk:faq_2':3,'mk:rc_1':60,'mk:d_phone':120,'mk:d_desktop':80,
  'mk:lcp_good':150,'mk:lcp_ni':40,'mk:lcp_poor':10,'mk:inp_good':2};
 const sessions={...counts,'mk:view':180,'mk:c_play_hero':28,'mk:sec10':170};
 const m=MR.buildMarketing({counts,countSessions:sessions},[
  {day:'2026-11-03',counts:{'mk:view':120,'mk:c_play_hero':20,'mk:c_play_end':7},countSessions:{'mk:view':110,'mk:play':25,'mk:reached':20,'mk:played':17},dims:{entry:{'/':{s:100,v:90,pv:120}}}},
  {day:'2026-11-02',counts:{},countSessions:{},dims:{entry:{'/':{s:40,v:35,pv:40}}}}],{reel:['Fishing'],slides:[],faq:['Is it free?','Are there ads?'],steps:[]});
 assert.equal(m.views,200);assert.equal(m.sessions,180);
 assert.equal(m.visitors,90,'a day without page views (the old title screen at /) adds no visitors');
 assert.equal(m.avgSeconds,46,'(900·10 + 123) / 200 = 45.6 s → 46 s');assert.equal(m.avgMs,46_000);assert.equal(m.engagedRate,0.75);assert.equal(m.bounceRate,0.25);
 assert.equal(m.medianBand,'30 s – 1 min');// 200 first stints: 50+40=90 < 100, +30 = 120 ≥ 100
 assert.equal(m.play.ctr,40/180);assert.equal(m.play.reachRate,30/40);assert.equal(m.play.overall,30/180);
 assert.equal(m.play.played,24);assert.equal(m.play.playRate,24/30);assert.equal(m.play.playedOverall,24/180);assert.equal(m.play.taps,44,'every Play tap, totalled');
 deq(m.scroll.map(r=>r.sessions),[160,120,80,50]);assert.equal(m.scroll[3].rate,50/180);
 assert.equal(m.faq.length,2);assert.equal(m.faq[1].sessions,3,'exact under 5');assert.equal(m.faq[1].label,'Are there ads?');assert.equal(m.faq[0].sessions,0);
 assert.equal(m.reel[0].label,'Fishing');assert.equal(m.reel[0].rate,60/180);
 const hero=m.clicks.find(r=>r.id==='mk:c_play_hero');assert.equal(hero.sessions,28);assert.equal(hero.count,30);assert.equal(hero.group,'Play');
 assert.equal(m.devices.find(r=>r.id==='mk:d_phone').rate,0.6,'device share is of views');
 const lcp=m.vitals.find(v=>v.id==='lcp');assert.equal(lcp.goodShare,0.75);assert.equal(lcp.measured,200);
 const inp=m.vitals.find(v=>v.id==='inp');assert.equal(inp.goodShare,1);assert.equal(inp.bands.good,2);assert.equal(inp.measured,2);
 assert(!('hidden' in m)&&!('min' in m),'no suppression fields');
 for(const k of ['scroll','sections','clicks','faq','reel','sources','devices','time'])for(const r of m[k]){assert.notEqual(r.sessions,null,k);assert.notEqual(r.count,null,k);}
 deq(m.daily.map(d=>[d.views,d.visitors,d.play,d.playTaps,d.reached,d.played]),[[120,90,25,27,20,17],[0,0,0,0,0,0]]);
 const ML=load('lib/analytics/marketingLabels.ts'),names=ML.marketingLabels();
 assert.equal(names.faq.length,5);assert(names.steps.length>=3);
 const named=MR.buildMarketing({counts,countSessions:sessions},[],null);assert.equal(named.reel.length,MI.MK_MAX.rc);assert.equal(named.reel[0].label,'#1');
 MR.nameMarketing(named,names);assert.equal(named.faq.length,5);assert.equal(named.faq[1].label,names.faq[1]);assert.equal(named.reel.length,names.reel.length||MI.MK_MAX.rc);
 const empty=MR.buildMarketing({counts:{},countSessions:{}},[],{reel:[],slides:[],faq:[],steps:[]});
 assert.equal(empty.hasData,false);assert.equal(empty.avgMs,null);assert.equal(empty.play.ctr,null);
});

await ok('admin tab: renders seeded data and the empty state; wired into the tabs',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const Sec=load('app/admin/MarketingSection.tsx').default;
 const counts={'mk:view':200,'mk:engaged':150,'mk:sec10':900,'mk:play':40,'mk:reached':30,'mk:played':12,'mk:c_play_hero':30,'mk:s25':160,'mk:v_top':190,'mk:t_30_60':200,'mk:d_phone':120,'mk:src_search':90,'mk:ref_google':90,'mk:lcp_good':150};
 const marketing=MR.buildMarketing({counts,countSessions:counts},[{day:'2026-11-03',counts:{'mk:view':200},countSessions:{'mk:view':200,'mk:play':40},dims:{entry:{'/':{s:150,v:140,pv:200}}}}],{reel:[],slides:[],faq:[],steps:[]});
 const html=renderToStaticMarkup(React.createElement(Sec,{report:{marketing},rangeText:'Nov 3',dayLabel:d=>d}));
 for(const s of ['Marketing page','Visits','Unique visitors','Average time on page','Bounce rate','Play click-through','Reached the game','Visits by day','Scroll depth','Sections seen','What they tap','Core Web Vitals','Where visits come from','Devices'])assert(html.includes(s),s);
 for(const s of ['Tapped Play','Reached /play','Actually played','Play taps'])assert(html.includes(s),s);assert(!html.includes('&lt;5'),'no <5 anywhere');
 assert(/data-k="played">12</.test(html),'actually played, exact');assert(/data-k="tapped">40</.test(html));
 assert(html.includes('20%'),'Play CTR 40/200');assert(html.includes('75%'),'reach rate 30/40');assert(html.includes('140'),'unique visitors');
 const none=renderToStaticMarkup(React.createElement(Sec,{report:{},rangeText:'Nov 3',dayLabel:d=>d}));
 assert(none.includes('No marketing-page visits in this range yet'));
 const dash=read('app/admin/AnalyticsDashboard.tsx');assert(/\['marketing','Marketing page'\]/.test(dash)&&/tab==='marketing'&&<MarketingSection/.test(dash));
 assert(/report\.marketing=buildMarketing\(/.test(read('lib/analytics/report.ts')));
});

await ok('heat + mount: one mount, passive listeners, no timers/polling/scroll listener in the page tracker',()=>{
 const pg=read('app/(site)/page.tsx');assert.equal((pg.match(/<PageStats /g)||[]).length,1);
 const ev=read('lib/analytics/marketingEvents.ts').replace(/\/\*[\s\S]*?\*\//g,'');
 assert(!/setInterval|setTimeout|requestAnimationFrame|addEventListener\('scroll'|addEventListener\("scroll"|fetch\(|sendBeacon|localStorage\.setItem|document\.cookie/.test(ev));
 for(const m of ev.matchAll(/addEventListener\('(click|toggle|playing|error)'[^)]*\)/g))assert(/passive:true/.test(m[0]),m[0]);
 const ps=read('components/learn/PageStats.tsx');assert(!/setInterval|requestAnimationFrame/.test(ps));
 // the game's bundle (VisitTracker) imports only the tiny ids module, not the page tracker
 assert(!/marketingEvents/.test(read('components/VisitTracker.tsx')));
});

console.log(`marketing-stats: ${passed} passed`);
})().catch(e=>{console.error(e);process.exit(1);});
