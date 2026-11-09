import s from '@/components/marketing/marketing.module.css';
import {CONTACT_EMAIL,GROWN_UPS as G,NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LEARN_FAQ,LEARN_FEATURES,LEARN_GROUPS,LEARN_GROWNUP_LINE,LEARN_HERO,LEARN_HIGHLIGHTS,LEARN_TOGETHER_NOT,LEARN_TOGETHER_TRUST,type LearnFeature,type LearnGroupId} from '@/lib/site/learnFeatures';
import {learnAsset,learnMontage,learnSlideAsset,learnWideAsset,LEARN_THEME,type LearnImage} from '@/lib/site/learnMedia';
import {hiddenMeta,LOGO_COLOURS,MARKETING_OVERVIEW_PATH} from '@/lib/site/marketing';

/**
 * /marketing/overview (Nov 4 2026, owner): the print page behind the investor overview PDF (scripts/build-marketing-pdf.cjs renders
 * it to public/marketing/futbol-island-overview.pdf). Unlisted and noindex like /marketing (lib/site/marketing.ts).
 * Words: ONLY copy already on the site or in lib/site (learnFeatures.ts, aboutCopy.ts): no new claims, stats or numbers (the
 * figures on the summary page are the `counts` that tests/learn-content.cjs recomputes from the game's data).
 *
 * Redesign (Nov 4 2026, owner: "too generic"): a 16:9 landscape deck (1280 x 720 CSS px = 13.33 x 7.5 in, the standard slide
 * size) instead of 49 A4 portrait pages. Investors read it on a laptop screen, the tour's best pictures are 16:9 posters, and
 * the 4:5 and phone stills sit beside their words instead of under them. One slide = one idea:
 *  cover · what it is · why we built it · per group: a chapter opener in the group's own island colour (LEARN_THEME) with one
 *  large picture, then a tidy grid of its features (picture left, words right; a feature with no still shows its description
 *  on a tint field instead of drawn art) · Play together's three steps · questions · about · contact.
 * Every one of LEARN_FEATURES appears once (data-feature; the build script checks the count).
 */
export const dynamic='force-static';
export const metadata=hiddenMeta('Overview','Futbol Island overview for investors and partners (print version of the marketing PDF).',MARKETING_OVERVIEW_PATH);

type Pic={img:LearnImage;alt:string;focus?:string};
const fromAsset=(a:{image?:LearnImage;alt?:string;focus?:string}|null,alt:string,focus?:string):Pic|null=>a?.image?{img:a.image,alt:a.alt??alt,focus:focus??a.focus}:null;
const still=(k:string,focus?:string)=>fromAsset(learnAsset(k),k,focus);
const wide=(k:string,focus?:string)=>fromAsset(learnWideAsset(k),k,focus);
const slide=(k:string,focus?:string)=>fromAsset(learnSlideAsset(k),k,focus);

/** Each feature's one picture, chosen by eye so no picture repeats in the deck (null = the description on a tint field). */
const FEATURE_PIC:Record<string,()=>Pic|null>={
 'lesson-quiz':()=>slide('stories'),'path-stories':()=>still('stories_chapter','50% 40%'),
 'reef-balls':()=>wide('diving'),'ball-hunt':()=>still('ball_hunt','50% 30%'),'swim-dive':()=>still('animal_ride','50% 55%'),'fishing':()=>wide('fishing'),
 'bug-squad':()=>wide('bugs'),'history-museum':()=>wide('museum'),'konbini':()=>still('fuel_konbini'),'islanders':()=>wide('npc'),
 'quick-challenges':()=>still('npc_chat','50% 52%'),'bubbles-banter':()=>still('npc_bubble','50% 45%'),
 'arcade':()=>wide('arcade'),'pass-puzzles':()=>still('pass_puzzles','50% 45%'),'beach-match':()=>slide('beachmatch'),'keep-ups':()=>still('emotes','50% 50%'),'island-jobs':()=>wide('jobs'),
 'friends-kits':()=>still('mp_meet','50% 50%'),'friends-emotes':()=>still('mp_emotes','50% 50%'),'friends-ball':()=>still('mp_ball','50% 50%'),'friends-ride':()=>still('mp_ride','50% 50%'),
 'player-cards':()=>still('player_cards','50% 40%'),'pop-up-books':()=>wide('books'),'vending':()=>wide('vending'),
 'kit-shop':()=>still('kit_shop','50% 30%'),'rides':()=>still('scooter_bike','50% 50%'),
};
/** The chapter opener's large picture for each group. */
const GROUP_PIC:Record<LearnGroupId,()=>Pic|null>={
 learn:()=>still('lesson_field'),explore:()=>still('explore'),play:()=>slide('arcade'),together:()=>slide('party'),
 collect:()=>slide('collection'),yours:()=>slide('kit'),safe:()=>still('save_code'),
};
/** The figures on the summary page: each one is a feature's own `counts` value, worded as its `proof` line words it. */
const FACTS:{id:string;key:string;label:string}[]=[
 {id:'learning-paths',key:'lessons',label:'lessons'},{id:'learning-paths',key:'quizQuestions',label:'quiz questions'},
 {id:'path-stories',key:'stories',label:'narrated story films'},{id:'ball-hunt',key:'hiddenBalls',label:'hidden balls, each a mini lesson'},
 {id:'fishing',key:'fish',label:'sea animals to catch'},{id:'islanders',key:'npcs',label:'islanders to meet'},
 {id:'player-cards',key:'cards',label:'player cards'},{id:'pop-up-books',key:'books',label:'narrated pop-up books'},
];

const Word=({text}:{text:string})=><>{[...text].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</>;
const Img=({p,className}:{p:Pic;className?:string})=>
 // eslint-disable-next-line @next/next/no-img-element
 <img className={className} src={p.img.src} width={p.img.width} height={p.img.height} alt={p.alt} style={p.focus?{objectPosition:p.focus}:undefined} loading="eager" decoding="sync"/>;
const isWide=(p:Pic)=>p.img.width/p.img.height>1.2;

/** One 16:9 slide with its running footer (section name left, page number right). */
function Slide({children,className,folio,dark,style}:{children:React.ReactNode;className?:string;folio:string;dark?:boolean;style?:React.CSSProperties}){
 return <section className={`${s.slide} ${className??''}`} style={style}>
  {children}
  <footer className={`${s.folio} ${dark?s.folioDark:''}`}><span>Futbol Island · {folio}</span><span className={s.pn}/></footer>
 </section>;
}

function Tile({f}:{f:LearnFeature}){
 const p=FEATURE_PIC[f.id]?.()??null;
 return <article className={s.tile} data-feature={f.id}>
  {p?<Img p={p} className={s.tileImg}/>:<div className={s.tileNote}><p>{f.description}</p></div>}
  <div className={s.tileText}>
   <h3>{f.title}</h3>
   <p className={s.tileHook}>{f.hook}</p>
   <p className={s.tileTie}>{f.footballTie}</p>
  </div>
 </article>;
}

export default function Overview(){
 const top=LEARN_HIGHLIGHTS.find(h=>h.id==='top')!;
 const party=LEARN_FEATURES.find(f=>f.id==='party-start')!;
 const montage=learnMontage()?.sizes.reduce<LearnImage|null>((a,x)=>!a||x.image.width>a.width?x.image:a,null)??null;
 const cover:Pic|null=montage?{img:montage,alt:'One afternoon on Futbol Island',focus:'40% 50%'}:still('town_overview');
 const count=(id:string,k:string)=>(LEARN_FEATURES.find(f=>f.id===id)?.counts as Record<string,number>|undefined)?.[k];
 const facts=FACTS.map(x=>({...x,n:count(x.id,x.key)})).filter(x=>typeof x.n==='number');
 const faqA=(q:string)=>LEARN_FAQ.find(x=>x.q===q)!.a.replace(/^No\.\s*/,'');
 const stepPics=[still('friend_step1'),still('friend_step2'),still('mp_join')];
 const summaryPic=still('town_overview'),whyPic=still('quiz_question','50% 50%');
 return <div className={s.doc} data-marketing-doc="" data-features-total={LEARN_FEATURES.length}>
  {/* ---- cover ---- */}
  <Slide className={s.cover} folio="Overview">
   <div className={s.coverText}>
    <div className={s.coverLogo}><Word text="Futbol Island"/></div>
    <h1 className={s.coverTitle}>{LEARN_HERO.headline.split(/(?<=\.)\s+/).map((x,i)=><span key={i}>{x}</span>)}</h1>
    <p className={s.coverLine}>{top.line}</p>
    <p className={s.coverFoot}>Overview for investors and partners<br/>futbolisland.app</p>
   </div>
   {cover&&<Img p={cover} className={s.coverImg}/>}
  </Slide>

  {/* ---- what it is: the statement and the island in figures ---- */}
  <Slide className={s.split} folio="What it is">
   <div className={s.splitText}>
    <h2 className={s.h2}>What Futbol Island is</h2>
    <p className={s.statement}>{LEARN_HERO.subhead}</p>
    <ul className={s.trust}>{LEARN_HERO.trust.map(t=><li key={t}>{t}.</li>)}</ul>
    <dl className={s.facts}>{facts.map(x=><div key={x.key}><dt>{x.n}</dt><dd>{x.label}</dd></div>)}</dl>
   </div>
   {summaryPic&&<Img p={summaryPic} className={s.splitImg}/>}
  </Slide>

  {/* ---- why we built it ---- */}
  <Slide className={`${s.split} ${s.splitFlip}`} folio="Why we built it">
   {whyPic&&<Img p={whyPic} className={s.splitImg}/>}
   <div className={s.splitText}>
    <h2 className={s.h2}>{G.whyTitle}</h2>
    <p className={s.body}>{G.why}</p>
    <h3 className={s.h3}>{G.learnsTitle}</h3>
    <p className={s.body}>{G.learns}</p>
    <div className={s.pillars}>
     <div><b>{G.free}</b><p>{G.freeWhy}</p></div>
     <div><b>No ads</b><p>{faqA('Are there ads?')}</p></div>
     <div><b>No open chat</b><p>{faqA('Can my child chat with other people?')}</p></div>
    </div>
   </div>
  </Slide>

  {/* ---- every feature, by group: an opener in the group's colour, then its grid ---- */}
  {LEARN_GROUPS.map(g=>{
   const t=LEARN_THEME[g.id],fs=LEARN_FEATURES.filter(f=>f.group===g.id),hero=GROUP_PIC[g.id]();
   const grid=g.id==='together'?fs.filter(f=>f.id!=='party-start'):fs;
   const pages:LearnFeature[][]=[];for(let i=0;i<grid.length;i+=6)pages.push(grid.slice(i,i+6));
   return <div key={g.id} className={s.group}>
    <Slide className={s.opener} folio={g.title} dark style={{background:t.c1}}>
     <div className={s.openerText}>
      <h2 className={s.openerTitle}>{g.title}</h2>
      <p className={s.openerBlurb}>{g.blurb}</p>
      <ul className={s.openerList}>{fs.map(f=><li key={f.id}>{f.title}</li>)}</ul>
     </div>
     {hero&&<Img p={hero} className={`${s.openerImg} ${isWide(hero)?s.openerWide:s.openerTall}`}/>}
    </Slide>

    {g.id==='together'?<Slide className={s.steps} folio={g.title}>
     <div className={s.pageHead}><h2 className={s.h2} style={{color:t.c1}}>{party.title}</h2><p className={s.headLine}>{party.description}</p></div>
     <ol className={s.stepRow} data-feature={party.id}>{party.steps!.map((x,i)=><li key={x.line}>{stepPics[i]&&<Img p={stepPics[i]!} className={s.stepImg}/>}<p>{x.line}</p></li>)}</ol>
     <div className={s.stepLists}>
      <div><h3 className={s.h3}>What it deliberately leaves out</h3><ul className={s.dots}>{LEARN_TOGETHER_NOT.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div><h3 className={s.h3}>Trust points</h3><ul className={s.dots}>{LEARN_TOGETHER_TRUST.map(x=><li key={x}>{x}</li>)}</ul><p className={s.note}>{LEARN_GROWNUP_LINE}</p></div>
     </div>
    </Slide>:null}

    {g.id==='safe'?<Slide className={s.safe} folio={g.title}>
     <div className={s.pageHead}><h2 className={s.h2} style={{color:t.c1}}>{g.title}</h2></div>
     <div className={s.safeBody}>
      <div className={s.safeList}>{fs.map(f=><article key={f.id} data-feature={f.id}><h3>{f.title}</h3><p className={s.tileHook}>{f.hook}</p><p>{f.description}</p></article>)}</div>
      <aside className={s.privacy}><h3 className={s.h3}>{G.privacyTitle}</h3><p>{G.privacy}</p></aside>
     </div>
    </Slide>:pages.map((fsx,i)=><Slide key={i} className={s.gridPage} folio={g.title}>
     <div className={s.pageHead}><h2 className={s.h2} style={{color:t.c1}}>{g.title}</h2></div>
     <div className={`${s.grid} ${fsx.length<=3?s.grid3:fsx.length<=4?s.grid4:''}`}>{fsx.map(f=><Tile key={f.id} f={f}/>)}</div>
    </Slide>)}
   </div>;
  })}

  {/* ---- questions grown-ups ask ---- */}
  <Slide className={s.faqPage} folio="Questions">
   <div className={s.pageHead}><h2 className={s.h2}>Questions grown-ups ask</h2></div>
   <div className={s.faqCols}>{LEARN_FAQ.map(q=><div key={q.q} className={s.faq}><h3>{q.q}</h3><p>{q.a}</p></div>)}</div>
  </Slide>

  {/* ---- about ---- */}
  <Slide className={s.about} folio="About">
   <div className={s.aboutMain}>
    <h2 className={s.h2}>{G.partnerTitle} {G.partnerName}</h2>
    <p className={s.statement}>{G.partnerLead}{G.partnerName}{G.partnerRest}</p>
   </div>
   <div className={s.aboutSide}>
    <h3 className={s.h3}>{G.nonprofitsTitle}</h3>
    <p className={s.body}>{G.nonprofitsLead}</p>
    <ul className={s.rows}>{NONPROFITS.map(n=><li key={n.name}>{n.name}</li>)}</ul>
   </div>
  </Slide>

  {/* ---- contact ---- */}
  <Slide className={s.contact} folio="Contact">
   <div className={s.contactLogo}><Word text="Futbol Island"/></div>
   <h2 className={s.h2}>Contact</h2>
   <ul className={s.rows}>
    <li><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></li>
    <li><a href={WSV_LINKS[0].href}>{WSV_LINKS[0].label}</a></li>
    <li><a href={WSV_LINKS[1].href}>{WSV_LINKS[1].label}</a></li>
   </ul>
   <p className={s.note}>Open futbolisland.app in any modern browser.</p>
  </Slide>
 </div>;
}
