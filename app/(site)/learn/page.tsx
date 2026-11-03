import JsonLd from '@/components/seo/JsonLd';
import LearnMedia from '@/components/learn/LearnMedia';
import {learnAsset} from '@/lib/site/learnMedia';
import LearnEnhance from '@/components/learn/LearnEnhance';
import FriendStepper from '@/components/learn/FriendStepper';
import ShareLink from '@/components/learn/ShareLink';
import s from '@/components/learn/learn.module.css';
import {LEARN_FAQ,LEARN_FAQ_TOP,LEARN_FEATURES,LEARN_GROWNUP_LINE,LEARN_HERO,LEARN_HIGHLIGHTS,type LearnHighlight,type LearnHighlightId} from '@/lib/site/learnFeatures';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {abs,breadcrumbLd,pageMeta,siteLd,SITE_NAME} from '@/lib/site/seo';

/**
 * /learn (Nov 2 2026, simplified the same day: owner "needs to be simpler, there's too much going on"). Five calm sections from
 * LEARN_HIGHLIGHTS in lib/site/learnFeatures.ts: hero, learn, explore, play with friends, safe + 5 FAQs. Each section is one
 * headline, one short line, one real shot and up to 3 chips; anything without a real shot is text only (no drawn art). All words
 * are prerendered; LearnEnhance only adds the one motion (soft fade-up, light hero parallax) and the lazy clips (max 2 playing).
 * The full feature list (LEARN_FEATURES) stays as data; the lesson index lives at /learn/lessons.
 */
export const dynamic='force-static';
const DESC='Futbol Island is a free football learning game for kids aged 7 to 12: short lessons, an island to explore, private play with friends, and no ads, chat or accounts.';
export const metadata=pageMeta('What’s inside the game',DESC,'/learn');
const CRUMBS=[{name:'Home',path:'/'},{name:'What’s inside',path:'/learn'}];
const ROOT_ID='learn-root';
// Same-origin '/' like /about: an absolute URL counts as leaving the site on www / preview hosts and hits the grown-up link gate.
const PLAY_URL='/';

const hl=(id:LearnHighlightId)=>LEARN_HIGHLIGHTS.find(h=>h.id===id)!;
const FAQ=LEARN_FAQ_TOP.map(q=>LEARN_FAQ.find(x=>x.q===q)!);
const NAV:[string,string][]=[['learn','Learn'],['explore','Explore'],['together','Friends'],['safe','Safety']];

/** A real shot or nothing: tall phone screens get a phone frame, wide shots a rounded card. */
function Shot({k,label,eager}:{k:string;label:string;eager?:boolean}){
 const a=learnAsset(k);if(!a.image)return null;
 const tall=a.image.height>a.image.width*1.4;
 return <div className={tall?s.phone:s.wide}><LearnMedia imageKey={k} label={label} eager={eager}/></div>;
}

function Chips({h}:{h:LearnHighlight}){
 return h.chips.length?<ul className={s.chips}>{h.chips.map(c=><li key={c}>{c}</li>)}</ul>:null;
}

function Section({h,children,alt}:{h:LearnHighlight;children?:React.ReactNode;alt?:boolean}){
 return <section className={[s.sec,alt&&s.secAlt].filter(Boolean).join(' ')} id={h.id} aria-labelledby={`${h.id}-h`}>
  <div className={`${s.wrap} ${s.split}`} data-reveal="">
   <div className={s.text}>
    <h2 className={s.h2} id={`${h.id}-h`}>{h.title}</h2>
    <p className={s.line}>{h.line}</p>
    <Chips h={h}/>
   </div>
   <div className={s.visual}><Shot k={h.shot} label={h.title}/></div>
  </div>
  {children}
 </section>;
}

export default function LearnHub(){
 const top=hl('top'),party=LEARN_FEATURES.find(f=>f.id==='party-start')!;
 const steps=party.steps??[];
 return <div id={ROOT_ID} className={s.root}>
  <JsonLd data={siteLd()}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(q=>({'@type':'Question',name:q.q,acceptedAnswer:{'@type':'Answer',text:q.a}}))}}/>
  <LearnEnhance rootId={ROOT_ID}/>

  {/* ---- tiny sticky nav: 4 anchors + Play ---- */}
  <nav className={s.minnav} aria-label="On this page">
   <div className={`${s.wrap} ${s.minnavInner}`}>
    <ul className={s.minnavTrack}>{NAV.map(([id,label])=><li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
    <a className={s.playFree} href={PLAY_URL}>Play</a>
   </div>
  </nav>

  {/* ---- 1. hero ---- */}
  <section className={`${s.sec} ${s.hero}`} id="top" data-par="hero" aria-labelledby="learn-title">
   <div className={`${s.wrap} ${s.split}`}>
    <div className={s.text}>
     <p className={s.eyebrow}>What’s inside {SITE_NAME}</p>
     <h1 className={s.h1} id="learn-title">{top.title}</h1>
     <p className={s.line}>{top.line}</p>
     <a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a>
    </div>
    <div className={`${s.visual} ${s.heroVisual}`}><Shot k={top.shot} label="Futbol Island from the air" eager/></div>
   </div>
  </section>

  {/* ---- 2-3. learn, explore ---- */}
  <Section h={hl('learn')} alt/>
  <Section h={hl('explore')}/>

  {/* ---- 4. play with friends: one clip + the 3 steps + one grown-up line ---- */}
  <Section h={hl('together')} alt>
   <div className={`${s.wrap} ${s.after}`} data-reveal="">
    <h3 className={s.subH} id="friend-steps">Play with a friend in 3 steps</h3>
    <FriendStepper steps={steps.map(x=>x.line)} panels={steps.map((x,i)=><Shot key={x.imageKey} k={x.imageKey} label={`Step ${i+1}: ${x.line}`}/>)}/>
    <p className={s.note}>{LEARN_GROWNUP_LINE}</p>
   </div>
  </Section>

  {/* ---- 5. safe + FAQ ---- */}
  <Section h={hl('safe')}>
   <div className={`${s.wrap} ${s.after} ${s.faqWrap}`} id="faq" data-reveal="">
    <h3 className={s.subH} id="faq-h">Questions grown-ups ask</h3>
    <div className={s.faqList}>{FAQ.map(q=><details key={q.q} className={s.faq}><summary>{q.q}<span className={s.plus} aria-hidden="true">+</span></summary><p>{q.a}</p></details>)}</div>
   </div>
  </Section>

  {/* ---- the end ---- */}
  <section className={s.end} aria-labelledby="end-h">
   <div className={`${s.wrap} ${s.endInner}`} data-reveal="">
    <h2 className={s.h2} id="end-h">Ready for the island?</h2>
    <a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a>
    <p className={s.endLinks}><a href="/about">About</a><a href={LESSONS_INDEX}>Every lesson</a><a href="/privacy">Privacy</a></p>
    <ShareLink url={abs('/learn')} title={`What’s inside ${SITE_NAME}`}/>
   </div>
  </section>
 </div>;
}
