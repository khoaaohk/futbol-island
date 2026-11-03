import JsonLd from '@/components/seo/JsonLd';
import LearnMedia from '@/components/learn/LearnMedia';
import {learnAsset} from '@/lib/site/learnMedia';
import LearnEnhance from '@/components/learn/LearnEnhance';
import LearnReel from '@/components/learn/LearnReel';
import LearnMontage from '@/components/learn/LearnMontage';
import LearnSlides from '@/components/learn/LearnSlides';
import FriendSteps from '@/components/learn/FriendSteps';
import ShareLink from '@/components/learn/ShareLink';
import s from '@/components/learn/learn.module.css';
import {LEARN_FAQ,LEARN_FAQ_TOP,LEARN_FEATURES,LEARN_GROWNUP_LINE,LEARN_HERO,LEARN_HIGHLIGHTS,type LearnHighlight,type LearnHighlightId} from '@/lib/site/learnFeatures';
import {LESSONS_INDEX} from '@/lib/site/lessons';
import {abs,breadcrumbLd,pageMeta,siteLd,SITE_NAME} from '@/lib/site/seo';

/**
 * /learn (Nov 2 2026; Nov 3 restyle after apple.com/apple-vision-pro, owner). Full-viewport "chapters", one idea each, from
 * LEARN_HIGHLIGHTS in lib/site/learnFeatures.ts: hero, learn, explore, play with friends (the one pinned feature chapter),
 * safe + 5 FAQs, then a closing Play chapter. Right after the hero: a full-bleed montage film (LearnMontage), then "See it in
 * action", a horizontal clip carousel (LearnReel); between Play with friends and Safe: "Even more to explore", a light
 * auto-advancing slideshow (LearnSlides). The sticky sub-nav turns dark over dark chapters ([data-nav-dark] markers, LearnEnhance). Each chapter: a huge tight headline, one line, one large media card, its 3 chips as a
 * quiet caption. Chapters alternate soft off-white and near-black (deep pitch green); gold is the only accent. Anything without a
 * real shot is text only (no drawn art). All words are prerendered; LearnEnhance only adds the one motion language (fade + scale
 * in, gentle hero zoom-out, a slight settle on the pinned media) and the lazy clips (visible + next only, max 2 playing).
 * Type: the system sans (no download); IslandBrush only on the gold Play buttons (owner, Nov 3).
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

/** Wide (about square or wider) shots get the wide card; upright phone screens the tall one. */
const isWide=(k:string)=>{const im=learnAsset(k).image;return !!im&&im.width>im.height*.8;};
/** Landscape 16:9 screens (the desktop friend-step shots) keep their own 16:9 frame instead of the near-square crop. */
const frameOf=(k:string)=>{const im=learnAsset(k).image;return !im||im.width<=im.height*.8?s.frameTall:im.width>=im.height*1.5?s.frame169:s.frameWide;};

function Tags({tags,center}:{tags?:readonly string[];center?:boolean}){
 return tags?.length?<ul className={center?`${s.tags} ${s.tagsCenter}`:s.tags}>{tags.map(c=><li key={c}>{c}</li>)}</ul>:null;
}

/** The chapter's media: a real shot in a large rounded card (aspect-ratio box, object-fit: cover, so sharper captures drop in
 *  later), its chips as a quiet caption. No real shot = the caption alone. */
function Stage({k,label,eager,tags,hero}:{k:string;label:string;eager?:boolean;tags?:readonly string[];hero?:boolean}){
 const a=learnAsset(k);
 if(!a.image)return <Tags tags={tags} center/>;
 const wide=isWide(k);
 return <figure className={hero?`${s.stage} ${s.heroStage}`:s.stage} data-reveal={hero?undefined:''}>
  <div className={[s.frame,wide?s.frameWide:s.frameTall,hero&&s.heroFrame].filter(Boolean).join(' ')}><LearnMedia imageKey={k} label={label} eager={eager}/></div>
  {tags?.length?<figcaption><Tags tags={tags} center/></figcaption>:null}
 </figure>;
}

function Chapter({h,dark,children}:{h:LearnHighlight;dark?:boolean;children?:React.ReactNode}){
 return <section className={`${s.ch} ${dark?s.dark:s.light}`} id={h.id} aria-labelledby={`${h.id}-h`}>
  {dark&&<NavMark/>}
  <div className={s.head} data-reveal="">
   <h2 className={s.h2} id={`${h.id}-h`}>{h.title}</h2>
   <p className={s.sub}>{h.line}</p>
  </div>
  {children??<Stage k={h.shot} label={h.title} tags={h.chips}/>}
 </section>;
}

/** Covers a dark chapter's near-black middle; the sticky sub-nav turns dark while one is under it (LearnEnhance). */
const NavMark=()=><span className={s.navMark} data-nav-dark="" aria-hidden="true"/>;

const Chevron=()=><svg className={s.chev} viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M4 2.5 7.5 6 4 9.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;

export default function LearnHub(){
 const top=hl('top'),together=hl('together'),safe=hl('safe'),party=LEARN_FEATURES.find(f=>f.id==='party-start')!;
 const steps=party.steps??[];
 // The pinned friends media: the chapter's own shot, plus each step's real shot where one exists (no shot = the chapter's shot).
 const panelKeys=[together.shot];
 const panelOf=steps.map(x=>{if(!learnAsset(x.imageKey).image)return 0;if(!panelKeys.includes(x.imageKey))panelKeys.push(x.imageKey);return panelKeys.indexOf(x.imageKey);});
 const panelLabel=(i:number)=>{const st=panelOf.indexOf(i);return i&&st>=0?`Step ${st+1}: ${steps[st].line}`:together.title;};
 return <div id={ROOT_ID} className={s.root}>
  {/* the page has its own sticky bar with the logo, so the shared site header is hidden here (learn.module.css, not an inline
      <style>: React escapes its ">" and the hydration text check failed, re-rendering the whole document) */}
  <JsonLd data={siteLd()}/>
  <JsonLd data={breadcrumbLd(CRUMBS)}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'FAQPage',mainEntity:FAQ.map(q=>({'@type':'Question',name:q.q,acceptedAnswer:{'@type':'Answer',text:q.a}}))}}/>
  <LearnEnhance rootId={ROOT_ID}/>

  {/* ---- sticky sub-nav: page name, 4 anchors, Play pill ---- */}
  <nav className={s.subnav} aria-label="On this page" data-subnav="">
   <span className={s.navDark} aria-hidden="true"/>
   <div className={s.subnavIn}>
    <a className={s.logo} href={PLAY_URL} aria-label="Futbol Island home">Futbol Island</a>
    <ul className={s.subLinks}>{NAV.map(([id,label])=><li key={id}><a href={`#${id}`}>{label}</a></li>)}</ul>
    <a className={s.pill} href={PLAY_URL}>Play free</a>
   </div>
  </nav>

  {/* ---- 1. hero ---- */}
  <section className={`${s.ch} ${s.light} ${s.hero}`} id="top" data-par="hero" aria-labelledby="learn-title">
   <div className={s.head}>
    <p className={s.kicker}>{SITE_NAME}</p>
    <h1 className={s.h1} id="learn-title">{top.title}</h1>
    <p className={s.sub}>{top.line}</p>
    <div className={s.ctaRow}>
     <a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a>
     <a className={s.more} href="#learn">See what’s inside<Chevron/></a>
    </div>
   </div>
   <Stage k={top.shot} label="Futbol Island from the air" eager hero/>
  </section>

  {/* ---- 1a. the full-bleed montage film (renders nothing until its clip and poster exist) ---- */}
  <LearnMontage/>

  {/* ---- 1b. See it in action: the horizontal clip carousel (renders nothing until its wide clips exist) ---- */}
  <LearnReel/>

  {/* ---- 2-3. learn, explore ---- */}
  <Chapter h={hl('learn')} dark/>
  <Chapter h={hl('explore')}/>

  {/* ---- 4. play with friends: pinned media, the 3 steps scroll past, one grown-up line ---- */}
  <Chapter h={together} dark>
   <FriendSteps steps={steps.map(x=>x.line)} panelOf={panelOf} note={LEARN_GROWNUP_LINE}
    panels={panelKeys.map((k,i)=><div key={k} className={`${s.frame} ${frameOf(k)}`}><LearnMedia imageKey={k} label={panelLabel(i)} sizes="(min-width: 900px) 400px, 80vw"/></div>)}/>
   <Tags tags={together.chips} center/>
  </Chapter>

  {/* ---- 4b. Even more to explore: the light slideshow (renders nothing until its slides exist) ---- */}
  <LearnSlides/>

  {/* ---- 5. safe + FAQ ---- */}
  <Chapter h={safe}>
   <Stage k={safe.shot} label={safe.title} tags={safe.chips}/>
   <div className={s.faqWrap} id="faq" data-reveal="">
    <h3 className={s.faqTitle} id="faq-h">Questions grown-ups ask</h3>
    <div className={s.faqList}>{FAQ.map(q=><details key={q.q} className={s.faq}><summary>{q.q}<span className={s.plus} aria-hidden="true"/></summary><p>{q.a}</p></details>)}</div>
   </div>
  </Chapter>

  {/* ---- the end: one big Play ---- */}
  <section className={`${s.ch} ${s.dark} ${s.end}`} aria-labelledby="end-h">
   <NavMark/>
   <div className={s.head} data-reveal="">
    <h2 className={s.h2} id="end-h">Ready for the island?</h2>
    <p className={s.sub}>Free, with no ads and no chat.</p>
    <div className={s.ctaRow}><a className={s.cta} href={PLAY_URL}>{LEARN_HERO.cta}</a></div>
    <p className={s.endLinks}><a href="/about">About</a><a href={LESSONS_INDEX}>Every lesson</a><a href="/privacy">Privacy</a></p>
    <ShareLink url={abs('/learn')} title={`What’s inside ${SITE_NAME}`}/>
   </div>
  </section>
 </div>;
}
