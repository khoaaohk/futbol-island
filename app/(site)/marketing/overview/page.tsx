import s from '@/components/marketing/marketing.module.css';
import {CONTACT_EMAIL,GROWN_UPS as G,NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LEARN_FAQ,LEARN_FEATURES,LEARN_GROUPS,LEARN_GROWNUP_LINE,LEARN_HERO,LEARN_HIGHLIGHTS,LEARN_TOGETHER_NOT,LEARN_TOGETHER_TRUST,type LearnFeature,type LearnGroupId} from '@/lib/site/learnFeatures';
import {learnAsset,learnMontage,learnSlideAsset,learnWideAsset,LEARN_THEME,type LearnImage} from '@/lib/site/learnMedia';
import {hiddenMeta,LOGO_COLOURS,MARKETING_OVERVIEW_PATH} from '@/lib/site/marketing';
import {DECK_PACKAGES,DECK_SLOTS,slotShare,slotSize,STADIUM_FAMILY_RULES,STADIUM_GREEN,STADIUM_NEXT,STADIUM_PITCH,type DeckSlot} from '@/lib/site/stadiumDeck';

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
 *  on a tint field instead of drawn art) · Play together's three steps · the DRIP FC Stadium sponsor chapter (Nov 13 2026, owner:
 *  opener, an overhead plan with every sponsor spot numbered, each slot with its in-game screenshot, the packages, the family rules;
 *  copy and numbers in lib/site/stadiumDeck.ts) · questions · about · contact.
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

/** DRIP FC Stadium screenshots (public/marketing/stadium, 1280 x 720 WebP, shot at 1600 x 900 from a production build: tests/marketing-page.cjs). */
const shot=(k:string,alt:string,focus?:string):Pic=>({img:{src:`/marketing/stadium/${k}.webp`,width:1280,height:720} as LearnImage,alt,focus});
const Pin=({n}:{n:number})=><span className={s.pin}>{n}</span>;

/** The overhead plan: stadium-local metres (x east, z south; lib/town/stadiumSeats.ts stadiumSponsorLayout), north up. */
function StadiumPlan(){
 const G='#e9c16b',stand='#c8cdbf',roof='#97a596',ink='#14221d';
 const pins:[number,number,number][]=[[1,-35.5,-25],[2,-15,80],[7,13,80],[3,71,-9],[8,71,10],[4,-63,-30],[4,63,-34],[5,108,-33],[6,9,-9]];
 const flagX=[76,85,94,106,117,128,139];
 return <svg className={s.plan} viewBox="-72 -90 232 180" role="img" aria-label="Overhead plan of DRIP FC Stadium with every sponsor spot numbered">
  <rect x="-72" y="-90" width="232" height="180" rx="8" fill="#dfe6cf"/>
  <rect x="62" y="-22" width="94" height="44" rx="3" fill="#efe6cf"/>
  <rect x="-40" y="-55" width="80" height="110" fill="#e6dcc4"/>
  {/* stands: west, east (split by the gate), north, south; the long stands' roofs darker */}
  <rect x="-57" y="-52" width="17" height="104" fill={roof}/>
  <rect x="40" y="-52" width="17" height="45" fill={roof}/><rect x="40" y="7" width="17" height="45" fill={roof}/>
  <rect x="-36" y="-74.5" width="72" height="17" fill={stand}/><rect x="-36" y="57.5" width="72" height="17" fill={stand}/>
  <rect x="-31.5" y="-50" width="63" height="100" fill="#7fae86"/>
  <g fill="none" stroke="#f4f1e6" strokeWidth=".6"><rect x="-31.5" y="-50" width="63" height="100"/><path d="M-31.5 0H31.5"/><circle r="9.15"/><rect x="-20.2" y="-50" width="40.3" height="16.5"/><rect x="-20.2" y="33.5" width="40.3" height="16.5"/></g>
  {/* the sponsor spots, in gold */}
  <g fill={G}>
   {[-37.5,-12.5,12.5,37.5].map(z=><g key={z}><rect x="-36.2" y={z-11} width="1.4" height="22"/><rect x="34.8" y={z-11} width="1.4" height="22"/></g>)}
   {[-22.5,-7.5,7.5,22.5].map(x=><g key={x}><rect x={x-7} y="53.3" width="14" height="1.4"/><rect x={x-7} y="-55.4" width="14" height="1.4"/></g>)}
   <rect x="-8" y="75" width="16" height="2.6"/>
   <rect x="59.6" y="-6" width="2.4" height="12"/>
   <rect x="-59.2" y="-50" width="2.2" height="100"/><rect x="57" y="-50" width="2.2" height="100"/>
   {flagX.flatMap(x=>[-22.8,22.8].map(z=><rect key={x+'/'+z} x={x-1} y={z-1.4} width="2" height="2.8"/>))}
   <circle r="4.6"/>
  </g>
  {[[-51,-67],[51,-67],[-51,67],[51,67]].map(([x,z])=><circle key={x+'/'+z} cx={x} cy={z} r="1.6" fill={ink}/>)}
  <g fill={ink} fontSize="5.2" fontWeight="600"><text x="109" y="2" textAnchor="middle">Stadium Plaza</text><text x="-66" y="-80">Park</text><text x="64" y="-48">East stand</text><text x="0" y="-78" textAnchor="middle">North stand</text><text x="24" y="86">South stand, big screen</text></g>
  {pins.map(([n,x,z],i)=><g key={i}><circle cx={x} cy={z} r="5.2" fill={ink}/><text x={x} y={z+1.9} textAnchor="middle" fontSize="5.6" fontWeight="700" fill="#fff">{n}</text></g>)}
 </svg>;
}

function SlotCard({x}:{x:DeckSlot}){
 return <article className={s.slotCard} data-stadium-slot={x.id}>
  <figure><Img p={shot(x.shot,`${x.name} in DRIP FC Stadium`)} className={s.slotImg}/><figcaption>{x.example}</figcaption></figure>
  <h3><Pin n={x.pin}/>{x.name}</h3>
  <p className={s.slotLine}>{x.line}</p>
  <dl className={s.slotSpec}><div><dt>Picture</dt><dd>{slotSize(x.id)}</dd></div><div><dt>Shared by</dt><dd>{slotShare(x.id)}</dd></div><div><dt>Today</dt><dd>{x.today}</dd></div></dl>
 </article>;
}

/** The DRIP FC Stadium sponsor chapter (lib/site/stadiumDeck.ts). */
function StadiumChapter(){
 const folio=STADIUM_PITCH.title;
 return <div className={s.group} data-stadium-chapter="">
  <Slide className={s.stadiumOpener} folio={folio} dark style={{background:STADIUM_GREEN}}>
   <div className={s.openerText}>
    <h2 className={s.openerTitle}>{STADIUM_PITCH.title}</h2>
    <p className={s.openerBlurb}>{STADIUM_PITCH.blurb}</p>
    <ul className={s.openerList}>{STADIUM_PITCH.points.map(x=><li key={x}>{x}</li>)}</ul>
   </div>
   <Img p={shot('hero','DRIP FC Stadium from the air, the plaza and the park around it','46% 50%')} className={s.stadiumHero}/>
  </Slide>

  <Slide className={s.planPage} folio={folio}>
   <div className={s.pageHead}><h2 className={s.h2} style={{color:STADIUM_GREEN}}>Every spot your brand can go</h2></div>
   <div className={s.planBody}>
    <StadiumPlan/>
    <ol className={s.planList}>
     {DECK_SLOTS.map(x=><li key={x.id}><Pin n={x.pin}/><div><b>{x.name}</b><span>{slotSize(x.id).replace(' picture, at least',', from')} · {slotShare(x.id).replace(', taking turns','')}</span></div></li>)}
     {DECK_PACKAGES.map(x=><li key={x.id} data-stadium-package={x.id}><Pin n={x.pin}/><div><b>{x.name}</b><span>A package, set up with the team · today {x.today}</span></div></li>)}
    </ol>
   </div>
  </Slide>

  {[DECK_SLOTS.slice(0,3),DECK_SLOTS.slice(3)].map((row,i)=><Slide key={i} className={s.slotPage} folio={folio}>
   <div className={s.pageHead}><h2 className={s.h2} style={{color:STADIUM_GREEN}}>{i?'Above the stands and on the walk in':'Round the pitch and at the gate'}</h2></div>
   <div className={s.slotRow}>{row.map(x=><SlotCard key={x.id} x={x}/>)}</div>
  </Slide>)}

  <Slide className={s.slotPage} folio={folio}>
   <div className={s.pageHead}><h2 className={s.h2} style={{color:STADIUM_GREEN}}>Packages: the name and the broadcast</h2></div>
   <div className={s.packRow}>{DECK_PACKAGES.map(x=><article key={x.id} className={s.packCard} data-stadium-package={x.id}>
    <figure><Img p={shot(x.shot,x.id==='feed'?'The live broadcast feed on the back of the big screen, DRIP FC logo top right':'DRIP FC Stadium floodlit at night')} className={s.packImg}/><figcaption>{x.id==='feed'?'The back of the big screen during a match':'The stadium at night'}</figcaption></figure>
    <h3><Pin n={x.pin}/>{x.name}</h3>
    <p className={s.slotLine}>{x.line}</p>
    <p className={s.packToday}>Today: {x.today}</p>
   </article>)}</div>
  </Slide>

  <Slide className={s.familyPage} folio={folio}>
   <div className={s.pageHead}><h2 className={s.h2} style={{color:STADIUM_GREEN}}>How it works for families</h2></div>
   <div className={s.familyBody}>
    <div className={s.familyRules}>{STADIUM_FAMILY_RULES.map(r=><div key={r.title}><h3>{r.title}</h3><p>{r.text}</p></div>)}</div>
    <aside className={s.familyNext}>
     <Img p={shot('stands','Inside DRIP FC Stadium: the pitch, the boards and the west stand','50% 55%')} className={s.familyImg}/>
     <h3 className={s.h3}>{STADIUM_NEXT.title}</h3>
     <p>{STADIUM_NEXT.line} <a href={`mailto:${STADIUM_NEXT.email}`}>{STADIUM_NEXT.email}</a>.</p>
    </aside>
   </div>
  </Slide>
 </div>;
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
     <div><b>No pop-up or tracking ads</b><p>No pop-up, video or tracking ads. The stadium’s sponsor boards are pictures only: no links, no tracking, nothing to buy.</p></div>{/* short on the slide (the full FAQ answer runs past it) */}
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

  {/* ---- DRIP FC Stadium: the sponsor chapter ---- */}
  <StadiumChapter/>

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
