import type {CSSProperties} from 'react';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import LearnMedia,{Glyph,castStill} from '@/components/learn/LearnMedia';
import LearnEnhance from '@/components/learn/LearnEnhance';
import FeatureFinder from '@/components/learn/FeatureFinder';
import FriendStepper from '@/components/learn/FriendStepper';
import ShareLink from '@/components/learn/ShareLink';
import s from '@/components/learn/learn.module.css';
import {LEARN_FAQ,LEARN_FEATURES,LEARN_GROUPS,LEARN_HERO,LEARN_TOGETHER_NOT,LEARN_TOGETHER_TRUST,type LearnFeature,type LearnGroupId} from '@/lib/site/learnFeatures';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {abs,breadcrumbLd,pageMeta,siteLd,SITE_NAME} from '@/lib/site/seo';

/**
 * /learn (Nov 2 2026): the feature tour for parents, coaches and kids. Every word comes from lib/site/learnFeatures.ts and is
 * prerendered (crawlers and no-JS readers get all of it); motion, clips and filters are enhancements from three small client
 * islands in components/learn (LearnEnhance, FeatureFinder, FriendStepper) plus a share button. Motion plan and heat rules:
 * components/learn/learn.module.css. The lesson index this route used to hold is now /learn/lessons.
 */
export const dynamic='force-static';
const DESC='Everything inside Futbol Island, the free football learning game for kids aged 7 to 12: lessons, exploring, games, playing with friends, collecting and the grown-up tools, and the football idea each one teaches.';
export const metadata=pageMeta('What’s inside the game',DESC,'/learn');
const CRUMBS=[{name:'Home',path:'/'},{name:'What’s inside',path:'/learn'}];
const ROOT_ID='learn-root';
const PLAY_URL='https://futbolisland.app/';

const byGroup=(g:LearnGroupId)=>LEARN_FEATURES.filter(f=>f.group===g);
const group=(g:LearnGroupId)=>LEARN_GROUPS.find(x=>x.id===g)!;
const feature=(id:string)=>LEARN_FEATURES.find(f=>f.id===id)!;
const count=(id:string,k:keyof NonNullable<LearnFeature['counts']>)=>feature(id).counts?.[k]??0;
const STATS=[
 {n:count('learning-paths','lessons'),label:'short lessons'},
 {n:count('learning-paths','quizQuestions'),label:'quiz questions'},
 {n:count('ball-hunt','hiddenBalls'),label:'hidden balls to find'},
 {n:count('fishing','fish'),label:'sea animals to catch'},
 {n:count('player-cards','cards'),label:'cards to collect'},
];
const NAV:[string,string][]=[['learn','Learn'],['explore','Explore'],['play','Play'],['together','Play together'],['collect','Collect'],['yours','Make it yours'],['safe','Safe'],['faq','FAQ']];
const BG:Record<string,string>={sea:'#3d6bf0',find:'#fff8e7',learn:'#e7f2e8',explore:'#e5edfb',play:'#fff0d9',together:'#153f43',collect:'#f0e9fa',yours:'#fdeae6',safe:'#e3f2ee',faq:'#fff8e7'};

function Check({className}:{className?:string}){return <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M4 10.5l4 4 8-9"/></svg>;}
function Cross(){return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M5 5l10 10M15 5L5 15"/></svg>;}
function Plus(){return <svg className={s.plus} viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M11 4v14M4 11h14"/></svg>;}

/** A soft curve from one section colour into the next; the curve slides sideways as it scrolls past (decorative). */
function Wave({a,b,flip}:{a:string;b:string;flip?:boolean}){
 const d=flip?'M0 30 C120 60 240 0 360 30 S600 60 720 30 S960 0 1080 30 S1320 60 1440 30 V80 H0Z':'M0 40 C120 10 240 70 360 40 S600 10 720 40 S960 70 1080 40 S1320 10 1440 40 V80 H0Z';
 return <div className={s.wave} style={{'--wa':BG[a],'--wb':BG[b]} as CSSProperties} aria-hidden="true">
  <svg className={s.waveSvg} viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 24 C180 54 360 0 540 24 S900 54 1080 24 S1260 0 1440 24 V80 H0Z"/><path d={d}/></svg>
 </div>;
}

function SecHead({g,id,className}:{g:LearnGroupId;id:string;className?:string}){
 const x=group(g),n=byGroup(g).length;
 return <header className={[s.secHead,className].filter(Boolean).join(' ')}>
  <p className={s.eyebrow}>{n} {n===1?'feature':'features'}</p>
  <h2 className={s.h2} id={id}>{x.title}</h2>
  <p>{x.blurb}</p>
 </header>;
}

/** One feature: picture, title, hook and proof always visible; the full description, football idea and where to find it expand. */
function FeatureCard({f,media=true,cast,top}:{f:LearnFeature;media?:boolean;cast?:string;top?:React.ReactNode}){
 return <article className={s.card} id={`f-${f.id}`} aria-labelledby={`f-${f.id}-t`}>
  {top}
  {media&&<LearnMedia className={s.cardMedia} imageKey={f.imageKey} group={f.group} label={f.title} cast={cast}/>}
  <div className={s.cardBody}>
   <h3 className={s.cardT} id={`f-${f.id}-t`}>{f.title}</h3>
   <p className={s.hook}>{f.hook}</p>
   <p className={s.proof}><Check/>{f.proof}</p>
   <details className={s.more}>
    <summary>How it teaches football<Plus/></summary>
    <dl className={s.moreBody}>
     <div><dt>What it is</dt><dd>{f.description}</dd></div>
     <div><dt>The football idea</dt><dd>{f.footballTie}</dd></div>
     <div><dt>Where to find it</dt><dd>{f.where}</dd></div>
    </dl>
   </details>
  </div>
 </article>;
}

function IslandArt(){
 return <svg viewBox="0 0 600 300" aria-hidden="true" focusable="false">
  <ellipse cx="300" cy="250" rx="300" ry="44" fill="#2a4fd8" opacity=".55"/>
  <path d="M40 232c40-70 140-104 260-104s222 34 262 104c-60 30-160 44-262 44S98 262 40 232z" fill="#f3d9a0"/>
  <path d="M86 216c40-56 120-80 214-80s176 24 214 80c-54 22-130 32-214 32s-162-10-214-32z" fill="#5fae5a"/>
  <path d="M120 206c36-36 100-52 180-52s146 16 182 52c-46 14-110 20-182 20s-134-6-180-20z" fill="#79c46a"/>
  <g transform="translate(300 186)"><rect x="-92" y="-26" width="184" height="52" rx="4" fill="#4c9e4c" stroke="#fff8e7" strokeWidth="3"/>
   <path d="M0-26V26" stroke="#fff8e7" strokeWidth="3"/><circle r="11" fill="none" stroke="#fff8e7" strokeWidth="3"/>
   <path d="M-92-12h16v24h-16M92-12H76v24h16" fill="none" stroke="#fff8e7" strokeWidth="3"/></g>
  <g fill="#7a5a1e"><rect x="96" y="150" width="7" height="62" rx="3" transform="rotate(-8 99 180)"/><rect x="498" y="146" width="7" height="64" rx="3" transform="rotate(7 501 178)"/></g>
  <g fill="#2f8f4f"><path d="M100 152c-30-4-46 8-54 22 18-10 36-12 54-10zM100 152c22-20 44-20 60-10-22 0-42 6-60 18zM100 152c-6-22 4-38 18-46-6 16-8 32-6 50z"/>
   <path d="M502 148c30-6 48 4 58 18-20-8-38-8-58-4zM502 148c-22-18-46-18-60-6 22 0 42 4 60 14zM502 148c4-22-6-38-20-44 8 16 10 30 8 48z"/></g>
  <path d="M0 262c40 8 80 8 120 0s80-8 120 0 80 8 120 0 80-8 120 0 80 8 120 0V300H0z" fill="#3d6bf0"/>
 </svg>;
}

const KITS=[{a:'#c8394f',b:'#fff8e7',p:'plain'},{a:'#2b53e5',b:'#ffd451',p:'bars'},{a:'#1d6b55',b:'#fff8e7',p:'hoops'},{a:'#e9c16b',b:'#153f43',p:'sash'}] as const;
function Jersey({a,b,p,i}:{a:string;b:string;p:string;i:number}){
 const SHIRT='M70 20 30 40l14 34 16-8v106h80V66l16 8 14-34-40-20c-4 12-16 20-30 20s-26-8-30-20z';
 return <svg className={s.jersey} viewBox="0 0 200 200" style={{'--d':`${-((12-i*3)%12)}s`} as CSSProperties} aria-hidden="true" focusable="false">
  <defs><clipPath id={`kit-${i}`}><path d={SHIRT}/></clipPath></defs>
  <path d={SHIRT} fill={a}/>
  <g clipPath={`url(#kit-${i})`} fill={b} opacity=".9">
   {p==='bars'&&[0,1,2,3].map(k=><rect key={k} x={62+k*22} y="0" width="10" height="200"/>)}
   {p==='hoops'&&[0,1,2].map(k=><rect key={k} x="0" y={70+k*34} width="200" height="14"/>)}
   {p==='sash'&&<path d="M40 40 70 20 170 160 150 190z"/>}
  </g>
  <path d={SHIRT} fill="none" stroke="#153f43" strokeWidth="4" strokeLinejoin="round"/>
  <text x="100" y="138" textAnchor="middle" fontFamily="IslandBrush,Arial,sans-serif" fontSize="58" fill={b} stroke="#153f43" strokeWidth="2">10</text>
 </svg>;
}

export default function LearnHub(){
 const learn=byGroup('learn'),explore=byGroup('explore'),play=byGroup('play'),together=byGroup('together'),collect=byGroup('collect'),yours=byGroup('yours'),safe=byGroup('safe');
 const party=feature('party-start');
 const words=LEARN_HERO.headline.split(' ');
 const kick=castStill('hero-kick'),cheer=castStill('hero-cheer');
 const faqParents=LEARN_FAQ.filter(q=>q.group==='parents'),faqTogether=LEARN_FAQ.filter(q=>q.group==='together');
 return <div id={ROOT_ID} className={s.root}>
  <JsonLd data={siteLd()}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:LEARN_FAQ.map(q=>({'@type':'Question',name:q.q,acceptedAnswer:{'@type':'Answer',text:q.a}}))}}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'ItemList',name:`What’s inside ${SITE_NAME}`,url:abs('/learn'),numberOfItems:LEARN_FEATURES.length,
   itemListElement:LEARN_FEATURES.map((f,i)=>({'@type':'ListItem',position:i+1,name:f.title,description:f.hook,url:abs(`/learn#f-${f.id}`)}))}}/>
  <LearnEnhance rootId={ROOT_ID}/>

  {/* ---- hero ---- */}
  <section className={s.hero} id="top" data-par="hero" aria-labelledby="learn-title">
   <div className={s.heroSky} aria-hidden="true"><span className={s.sun}/><span className={s.cloud}/><span className={s.cloud}/></div>
   <div className={`${s.wrap} ${s.heroGrid}`}>
    <div className={s.heroText}>
     <div className={s.heroCrumbs}><Breadcrumbs crumbs={CRUMBS}/></div>
     <p className={s.eyebrow} style={{color:'#ffd451'}}>What’s inside Futbol Island</p>
     <h1 className={s.h1} id="learn-title">{words.map((w,i)=><span key={i}><span className={s.word} style={{'--w':i} as CSSProperties}>{w}</span>{i<words.length-1?' ':''}</span>)}</h1>
     <p className={s.lead}>{LEARN_HERO.subhead}</p>
     <div className={s.ctaRow}><a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a><a className={s.ghostLink} href="#together">Play with a friend</a></div>
     <ul className={s.trust}>{LEARN_HERO.trust.map(t=><li key={t}><Check className={s.check}/>{t}</li>)}</ul>
    </div>
    <div className={s.heroArt} aria-hidden="true">
     <div className={s.heroIsland}><IslandArt/></div>
     <div className={s.heroCast}>
      {kick&&<img src={kick.src} srcSet={`${kick.src} 1x, ${kick.src2x} 2x`} width={kick.width} height={kick.height} alt="" fetchPriority="high"/>}
      {cheer&&<img src={cheer.src} srcSet={`${cheer.src} 1x, ${cheer.src2x} 2x`} width={cheer.width} height={cheer.height} alt=""/>}
     </div>
    </div>
   </div>
   <dl className={s.stats}>{STATS.map(x=><div key={x.label} className={s.stat}><dt>{x.label}</dt><dd><span data-count={x.n}>{x.n}</span></dd></div>)}</dl>
  </section>
  <Wave a="sea" b="find"/>

  {/* ---- sticky mini-nav (in-page anchors only; the site header stays brand-only) ---- */}
  <nav className={s.minnav} data-minnav="" aria-label="On this page">
   <div className={`${s.wrap} ${s.minnavInner}`}>
    <ul className={s.minnavTrack}>{NAV.map(([id,label])=><li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
    <a className={s.playFree} href={PLAY_URL}>Play free</a>
   </div>
  </nav>

  {/* ---- find a feature ---- */}
  <section className={`${s.sec} ${s.secFind}`} id="find" aria-labelledby="find-h">
   <div className={s.wrap}>
    <header className={s.secHead}><p className={s.eyebrow}>{LEARN_FEATURES.length} features, {LEARN_GROUPS.length} groups</p><h2 className={s.h2} id="find-h">Find a feature</h2>
     <p>Pick a group to narrow the list, then tap a feature to jump to it.</p></header>
    <FeatureFinder groups={LEARN_GROUPS.map(g=>({id:g.id,title:g.title,count:byGroup(g.id).length}))} items={LEARN_FEATURES.map(f=>({id:f.id,title:f.title,hook:f.hook,group:f.group}))}/>
   </div>
  </section>
  <Wave a="find" b="learn" flip/>

  {/* ---- learn: sticky stage ---- */}
  <section className={`${s.sec} ${s.secLearn}`} id="learn" data-sec="" data-pin="" aria-labelledby="learn-h">
   <div className={s.wrap}>
    <SecHead g="learn" id="learn-h"/>
    <div className={s.pin}>
     <div className={s.stage} role="group" aria-label="Lesson preview">
      {learn.map((f,i)=><figure key={f.id} className={s.stageItem} data-stage-i={i} data-on={i===0?'':undefined}>
       <LearnMedia className={s.stageMedia} imageKey={f.imageKey} group={f.group} label={f.title}/>
       <figcaption className={s.stageCap} aria-hidden="true"><b>The football idea</b>{f.footballTie}</figcaption>
      </figure>)}
     </div>
     <ol className={s.pinList}>{learn.map((f,i)=><li key={f.id} data-pin-i={i}><FeatureCard f={f}/></li>)}</ol>
    </div>
   </div>
  </section>
  <Wave a="learn" b="explore"/>

  {/* ---- explore: drifting rail ---- */}
  <section className={`${s.sec} ${s.secExplore}`} id="explore" data-sec="" data-par="" aria-labelledby="explore-h">
   <div className={s.wrap}><SecHead g="explore" id="explore-h"/></div>
   <div className={s.rail} role="region" aria-label={`${group('explore').title}: ${explore.length} features, scroll sideways`} tabIndex={0}>
    <ul className={s.track}>{explore.map(f=><li key={f.id}><FeatureCard f={f}/></li>)}</ul>
   </div>
   <div className={s.wrap}><p className={s.railHint} aria-hidden="true"><svg viewBox="0 0 28 14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7h23M19 2l6 5-6 5"/></svg>Swipe or scroll sideways for all {explore.length}</p></div>
  </section>
  <Wave a="explore" b="play" flip/>

  {/* ---- play: cabinets rise ---- */}
  <section className={`${s.sec} ${s.secPlay}`} id="play" data-sec="" aria-labelledby="play-h">
   <div className={s.wrap}>
    <SecHead g="play" id="play-h"/>
    <ul className={s.cabinets}>{play.map((f,i)=><li key={f.id} className={s.cab} data-reveal="" style={{'--i':i%3} as CSSProperties}>
     <FeatureCard f={f} top={<div className={s.marquee} aria-hidden="true"><Glyph name="ball"/>{f.id==='arcade'||f.id==='pass-puzzles'?'Arcade':'On the island'}</div>}/>
    </li>)}</ul>
   </div>
  </section>
  <Wave a="play" b="together"/>

  {/* ---- play together (the big one) ---- */}
  <section className={`${s.sec} ${s.secTogether}`} id="together" data-sec="" aria-labelledby="together-h">
   <div className={s.wrap}>
    <SecHead g="together" id="together-h" className={s.togetherHead}/>
    <div className={s.duo} data-reveal="">
     <div className={`${s.phone} ${s.phoneL}`}><LearnMedia imageKey={party.imageKey} group="together" label="A friend’s island in a party" cast="hero-kick"/></div>
     <div className={s.meet} aria-hidden="true">
      <svg className={s.spark} viewBox="0 0 64 64" fill="currentColor"><path d="M32 2l6 18 18-8-9 17 17 6-18 6 8 18-17-9-5 18-5-18-17 9 8-18-18-6 17-6-9-17 18 8z"/></svg>
      <span className={s.meetLabel}>Same island</span>
     </div>
     <div className={`${s.phone} ${s.phoneR}`}><LearnMedia imageKey={feature('friends-emotes').imageKey} group="together" label="Two friends doing a high five" cast="hero-cheer"/></div>
    </div>
    <p className={s.duoCap}>{party.description}</p>

    <h3 className={s.subH} id="friend-steps">Play with a friend in 3 steps</h3>
    <FriendStepper steps={(party.steps??[]).map(x=>x.line)} panels={(party.steps??[]).map((x,i)=><div key={x.imageKey} className={s.phone}>
     <LearnMedia imageKey={x.imageKey} group="together" label={`Step ${i+1}: ${x.line}`} cast={i===1?'hero-cheer':'hero-kick'}/></div>)}/>

    <div className={s.lists}>
     <div className={`${s.listBox} ${s.yes}`}><h3>Grown-ups stay in charge</h3><ul>{LEARN_TOGETHER_TRUST.map(t=><li key={t}><Check/>{t}</li>)}</ul></div>
     <div className={`${s.listBox} ${s.no}`}><h3>Deliberately not there</h3><ul>{LEARN_TOGETHER_NOT.map(t=><li key={t}><Cross/>{t}</li>)}</ul></div>
    </div>
    <ul className={`${s.grid} ${s.stacked}`}>{together.map(f=><li key={f.id} data-reveal=""><FeatureCard f={f} cast={f.id==='friends-emotes'?'hero-cheer':undefined}/></li>)}</ul>
   </div>
  </section>
  <Wave a="together" b="collect" flip/>

  {/* ---- collect: fan ---- */}
  <section className={`${s.sec} ${s.secCollect}`} id="collect" data-sec="" aria-labelledby="collect-h">
   <div className={s.wrap}>
    <SecHead g="collect" id="collect-h"/>
    <ul className={s.fan} data-reveal="">{collect.map(f=><li key={f.id}><FeatureCard f={f}/></li>)}</ul>
   </div>
  </section>
  <Wave a="collect" b="yours"/>

  {/* ---- make it yours: kit colours ---- */}
  <section className={`${s.sec} ${s.secYours}`} id="yours" data-sec="" aria-labelledby="yours-h">
   <div className={s.wrap}>
    <SecHead g="yours" id="yours-h"/>
    <div className={s.yoursGrid}>
     <div className={s.kit} data-live-watch="" aria-hidden="true">
      <div className={s.kitStack}>{KITS.map((k,i)=><Jersey key={i} {...k} i={i}/>)}</div>
      <p className={s.kitCap}>Your colours, your number</p>
      <p className={s.kitSub}>Ball, boots and jersey studios in the Kit Shop</p>
     </div>
     <ul className={s.grid}>{yours.map(f=><li key={f.id}><FeatureCard f={f}/></li>)}</ul>
    </div>
   </div>
  </section>
  <Wave a="yours" b="safe" flip/>

  {/* ---- safe and simple: gentle stack ---- */}
  <section className={`${s.sec} ${s.secSafe}`} id="safe" data-sec="" aria-labelledby="safe-h">
   <div className={s.wrap}>
    <SecHead g="safe" id="safe-h"/>
    <ul className={s.badges}>{['Free','No ads','No chat','No accounts','Nothing to download'].map(b=><li key={b} className={s.badge}><Check/>{b}</li>)}</ul>
    <ul className={`${s.grid} ${s.stacked}`}>{safe.map(f=><li key={f.id} data-reveal=""><FeatureCard f={f}/></li>)}</ul>
   </div>
  </section>
  <Wave a="safe" b="faq"/>

  {/* ---- FAQ ---- */}
  <section className={`${s.sec} ${s.secFaq}`} id="faq" data-sec="" aria-labelledby="faq-h">
   <div className={s.wrap}>
    <header className={s.secHead}><p className={s.eyebrow}>For parents and coaches</p><h2 className={s.h2} id="faq-h">Questions grown-ups ask</h2></header>
    <div className={s.faqCols}>
     {([['About the game',faqParents],['About playing with friends',faqTogether]] as const).map(([h,list])=><div key={h}>
      <h3 className={s.faqH}>{h}</h3>
      <div className={s.faqList}>{list.map(q=><details key={q.q} className={s.faq}><summary>{q.q}<Plus/></summary><p>{q.a}</p></details>)}</div>
     </div>)}
    </div>
   </div>
  </section>

  {/* ---- the end ---- */}
  <section className={s.end} aria-labelledby="end-h">
   <div className={`${s.wrap} ${s.endInner}`}>
    <h2 className={s.h2} id="end-h">Ready for the island?</h2>
    <p>Free in the web browser on phones, tablets and computers.</p>
    <a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a>
    <p className={s.endLinks}><a href="/about">About Futbol Island</a><a href={LESSONS_INDEX}>Read every lesson</a><a href="/privacy">Privacy</a></p>
    <ShareLink url={abs('/learn')} title={`What’s inside ${SITE_NAME}`}/>
   </div>
  </section>
 </div>;
}
