import s from '@/components/marketing/marketing.module.css';
import {CONTACT_EMAIL,GROWN_UPS as G,NONPROFITS,WSV_LINKS} from '@/lib/site/aboutCopy';
import {LEARN_CAROUSEL,LEARN_FAQ,LEARN_FEATURES,LEARN_GROUPS,LEARN_GROWNUP_LINE,LEARN_HERO,LEARN_HIGHLIGHTS,LEARN_MONTAGE,LEARN_SLIDES,LEARN_TOGETHER_NOT,LEARN_TOGETHER_TRUST,type LearnFeature} from '@/lib/site/learnFeatures';
import {learnAsset,learnMontage,learnSlideAsset,learnWideAsset,type LearnImage} from '@/lib/site/learnMedia';
import {hiddenMeta,LOGO_COLOURS,MARKETING_OVERVIEW_PATH} from '@/lib/site/marketing';

/**
 * /marketing/overview (Nov 4 2026, owner): the print page behind the investor overview PDF (scripts/build-marketing-pdf.cjs renders
 * it to public/marketing/futbol-island-overview.pdf, A4 portrait). Unlisted and noindex like /marketing (lib/site/marketing.ts).
 * Words: ONLY copy already on the site or in lib/site (learnFeatures.ts, aboutCopy.ts): no new claims, stats or numbers.
 * Pictures (owner, Nov 4: "investors need to see them clearly"): one LARGE real still per chapter and feature, the tour's own
 * posters at their full resolution (public/learn via learnMedia), never video; words sit smaller beneath or beside each picture.
 */
export const dynamic='force-static';
export const metadata=hiddenMeta('Overview','Futbol Island overview for investors and partners (print version of the marketing PDF).',MARKETING_OVERVIEW_PATH);

type Pic={img:LearnImage;alt:string};
/** The largest real still for an image key (the 1080x1350 4:5 re-capture when there is one). The PDF script re-encodes each one
 *  as a JPEG at 2x its printed size. */
const still=(k:string):LearnImage|null=>learnAsset(k).image??null;
const altOf=(k:string,fallback:string)=>learnAsset(k).alt??fallback;
/** A feature's picture: its 1920px "See it in action" poster when one names it, else its own still, else the shot of a chapter
 *  that covers only it (Fuel up = the Konbini); none = words only (no drawn art). */
function featureStill(f:LearnFeature):Pic|null{
 const c=LEARN_CAROUSEL.find(x=>x.feature===f.id),w=c?learnWideAsset(c.key):null;
 if(w?.image)return {img:w.image,alt:w.alt??c!.title};
 const own=still(f.imageKey);if(own)return {img:own,alt:altOf(f.imageKey,f.title)};
 const h=LEARN_HIGHLIGHTS.find(x=>x.features.length===1&&x.features[0]===f.id),hs=h?still(h.shot):null;
 return hs&&h?{img:hs,alt:altOf(h.shot,h.title)}:null;
}

const Word=({text}:{text:string})=><>{[...text].map((ch,i)=>ch===' '?' ':<span key={i} style={{color:LOGO_COLOURS[i%LOGO_COLOURS.length]}}>{ch}</span>)}</>;
const Img=({im,alt,className}:{im:LearnImage;alt:string;className?:string})=>
 // eslint-disable-next-line @next/next/no-img-element
 <img className={className} src={im.src} width={im.width} height={im.height} alt={alt} loading="eager" decoding="sync"/>;

/** One large picture with its words smaller beneath (16:9 full width, 4:5 at 150mm) or beside it (upright phone screens). */
function Fig({m,children}:{m:Pic|null;children:React.ReactNode}){
 if(!m)return <article className={`${s.fig} ${s.figNone}`}><div className={s.text}>{children}</div></article>;
 const r=m.img.width/m.img.height,kind=r>1.2?s.figWide:r>=.7?s.figMid:s.figTall;
 return <article className={`${s.fig} ${kind}`}><Img im={m.img} alt={m.alt}/><div className={s.text}>{children}</div></article>;
}
const FeatureText=({f}:{f:LearnFeature})=><>
 <h3>{f.title}</h3>
 <p className={s.hook}>{f.hook}</p>
 <p>{f.description}</p>
 <div><p className={s.small}><b>Football idea:</b> {f.footballTie}</p><p className={s.small}><b>In the game:</b> {f.proof}</p></div>
</>;

export default function Overview(){
 const top=LEARN_HIGHLIGHTS.find(h=>h.id==='top')!;
 const chapters=LEARN_HIGHLIGHTS.filter(h=>h.id!=='top');
 const party=LEARN_FEATURES.find(f=>f.id==='party-start');
 const montage=learnMontage()?.sizes.reduce<LearnImage|null>((a,x)=>!a||x.image.width>a.width?x.image:a,null)??null;
 const coverImg=montage??still(top.shot);
 const slides=LEARN_SLIDES.map(x=>({x,a:learnSlideAsset(x.key)})).filter(y=>y.a?.image);
 const title=(id:string)=>LEARN_FEATURES.find(f=>f.id===id)?.title;
 return <div className={s.doc} data-marketing-doc="">
  {/* ---- cover: the wordmark centred, in the bar logo's bright letters (static in print) ---- */}
  <section className={`${s.page} ${s.cover}`}>
   <div className={s.coverLogo}><Word text="Futbol Island"/></div>
   <h1 className={s.coverTitle}>{LEARN_HERO.headline.split(/(?<=\.)\s+/).map((x,i)=><span key={i} style={{display:"block"}}>{x}</span>)}</h1>
   <p className={s.coverLine}>{top.line}</p>
   {coverImg&&<Img className={s.coverImg} im={coverImg} alt={LEARN_MONTAGE.title}/>}
   <div className={s.coverFoot}><span>Overview for investors and partners</span><span>futbolisland.app</span></div>
  </section>

  {/* ---- what it is ---- */}
  <section className={`${s.page} ${s.break}`}>
   <h2 className={s.dh2}>What Futbol Island is</h2>
   <p className={s.lead}>{LEARN_HERO.subhead}</p>
   <div className={s.trio}>
    <div className={s.pillar}><b>{G.free}</b>{G.freeWhy}</div>
    <div className={s.pillar}><b>No ads</b>{LEARN_FAQ.find(q=>q.q==='Are there ads?')!.a.replace(/^No\.\s*/,'')}</div>
    <div className={s.pillar}><b>No chat</b>{LEARN_FAQ.find(q=>q.q==='Can my child chat with other people?')!.a.replace(/^No\.\s*/,'')}</div>
   </div>
   <ul className={s.points}>{LEARN_HERO.trust.map(t=><li key={t}>{t}.</li>)}</ul>
   <h3 className={s.dh3}>{G.whyTitle}</h3>
   <p className={s.para}>{G.why}</p>
   <h3 className={s.dh3}>{G.learnsTitle}</h3>
   <p className={s.para}>{G.learns}</p>
   <h3 className={s.dh3}>{G.privacyTitle}</h3>
   <p className={s.para}>{G.privacy}</p>
  </section>

  {/* ---- the tour's chapters, one large shot each ---- */}
  <section className={`${s.page} ${s.break}`}>
   <div className={s.groupHead}><h2 className={s.dh2}>The island, chapter by chapter</h2><p className={s.lead} style={{marginBottom:0}}>The chapters of futbolisland.app, each one idea, with the features it covers.</p></div>
   {chapters.map(h=>{const im=still(h.shot);return <Fig key={h.id} m={im?{img:im,alt:altOf(h.shot,h.title)}:null}>
    <h3>{h.title}</h3>
    <p className={s.hook}>{h.line}</p>
    <ul className={s.tags}>{h.chips.map(c=><li key={c}>{c}</li>)}</ul>
    {h.features.length?<p className={s.small}><b>Features:</b> {h.features.map(title).filter(Boolean).join(' · ')}</p>:null}
   </Fig>;})}
  </section>

  {/* ---- even more to explore: the tour's slideshow stills ---- */}
  {slides.length?<section className={`${s.page} ${s.break}`}>
   <div className={s.groupHead}><h2 className={s.dh2}>Even more to explore</h2></div>
   {slides.map(({x,a})=><Fig key={x.key} m={{img:a!.image!,alt:a!.alt??x.title}}><h3>{x.title}</h3><p className={s.hook}>{x.caption}</p></Fig>)}
  </section>:null}

  {/* ---- every feature, by group ---- */}
  {LEARN_GROUPS.map(g=>{const fs=LEARN_FEATURES.filter(f=>f.group===g.id);return <section key={g.id} className={`${s.page} ${s.group}`}>
   <div className={s.groupHead}><h2 className={s.dh2}>{g.title}</h2><p className={s.lead} style={{marginBottom:0}}>{g.blurb}</p></div>
   {g.id==='together'&&party?.steps?<div className={s.two} style={{marginBottom:'8mm'}}>
    <div><h3 className={s.dh3}>How a party starts</h3><ol className={s.steps}>{party.steps.map(x=><li key={x.line}>{x.line}</li>)}</ol><p className={s.small}>{LEARN_GROWNUP_LINE}</p></div>
    <div><h3 className={s.dh3}>What it deliberately leaves out</h3><ul className={s.points}>{LEARN_TOGETHER_NOT.map(x=><li key={x}>{x}</li>)}</ul></div>
   </div>:null}
   {fs.map(f=><Fig key={f.id} m={featureStill(f)}><FeatureText f={f}/></Fig>)}
   {g.id==='together'?<div style={{marginTop:'6mm',breakInside:'avoid'}}><h3 className={s.dh3}>Trust points</h3><ul className={s.points}>{LEARN_TOGETHER_TRUST.map(x=><li key={x}>{x}</li>)}</ul></div>:null}
  </section>;})}

  {/* ---- questions grown-ups ask ---- */}
  <section className={`${s.page} ${s.break}`}>
   <h2 className={s.dh2}>Questions grown-ups ask</h2>
   {LEARN_FAQ.map(q=><div key={q.q} className={s.faq}><b>{q.q}</b><p>{q.a}</p></div>)}
  </section>

  {/* ---- about and contact ---- */}
  <section className={`${s.page} ${s.break}`}>
   <h2 className={s.dh2}>About</h2>
   <p className={s.lead}>{G.partnerLead}{G.partnerName}{G.partnerRest}</p>
   <h3 className={s.dh3}>{G.nonprofitsTitle}</h3>
   <p className={s.para}>{G.nonprofitsLead}{NONPROFITS.map(n=>n.name).join(', ')}.</p>
   <div className={s.contact}>
    <h3 className={s.dh3}>Contact</h3>
    <p className={s.para} style={{marginTop:'2mm'}}><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br/><a href={WSV_LINKS[0].href}>{WSV_LINKS[0].label}</a><br/><a href={WSV_LINKS[1].href}>{WSV_LINKS[1].label}</a></p>
    <p className={s.small}>Open futbolisland.app in any modern browser.</p>
   </div>
  </section>
 </div>;
}
