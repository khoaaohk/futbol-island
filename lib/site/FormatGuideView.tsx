import KeepReading,{lessonLinks} from '../../components/site/KeepReading';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {FORMATIONS_HUB,formationsIn,formatGuide,withKeeper,type FormatGuide} from './formations';
import {POSITIONS_HUB} from './positions';
import {formationImage,guideByPath,guideCrumbs} from './guides';
import {Bullets,Diagram,GuideEnd,GuideIntro,Section} from './GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from './seo';
import {SITE_UPDATED} from './updated';
import {cheatSheetPath} from './tools/printables';
import {GUIDE_FORMATS} from './pitch';
import {AppLink} from '@/components/site/tools/ToolParts';
import styles from '@/app/(site)/site.module.css';
import RailNav from '@/components/site/shell/RailNav';
import {pageRail,sec} from './railNavMore';
/**
 * One format guide (/learn/7v7-soccer-formations, /learn/9v9-soccer-formations, /learn/11v11-soccer-formations): that format's
 * formations compared in one table, the "which one should my team use" answer, a small diagram of each, FAQ and lessons.
 */
export const formatGuideMeta=(format:FormatGuide['format'])=>{const g=formatGuide(format)!;
 return pageMeta(g.title,g.description,g.path,{whole:true,image:{url:guideByPath(g.path)!.image!,alt:`Diagram of a ${format} soccer formation`}});};
export default function FormatGuideView({format}:{format:FormatGuide['format']}){
 const g=formatGuide(format)!,list=formationsIn(format),crumbs=guideCrumbs({name:FORMATIONS_HUB.crumb,path:FORMATIONS_HUB.path},{name:g.crumb,path:g.path});
 const others=(['7v7','8v8','9v9','11v11'] as const).filter(f=>f!==format).map(f=>formatGuide(f)!);
 /* round 4F: 8v8 has no printables (not in GUIDE_FORMATS), so no cheat sheet link; it cites its rule documents instead */
 const printable=(GUIDE_FORMATS as readonly string[]).includes(format);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:g.h1,path:g.path,description:g.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:list.map(f=>({name:`${f.name} formation`,path:f.path}))})}/>
  <JsonLd data={faqLd(g.faq)}/>
  {/* the side nav (owner, Nov 20 2026: "all internal pages need to have side navs"): Back to the formations hub (the breadcrumb's
      parent), Overview, then this guide's sections */}
  <GuideIntro top rail={<RailNav rail={pageRail(`${format} formations on this page`,{href:FORMATIONS_HUB.path,name:'All soccer formations'},[sec('compare','Compared'),
   sec('pick','Which one'),sec('shapes','Diagrams'),sec('basics','In short'),sec('faq','Questions'),...(g.sources?[sec('sources','Sources')]:[]),sec('keep-reading','Keep reading')])} current="#top"/>} crumbs={crumbs} h1={g.h1} lead={g.lead} cta/>
  <Section id="compare" title={`${format} formations compared`}>
   <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`${format} formations compared`}><table className={styles.table}>
    <thead><tr><th scope="col">Formation</th><th scope="col">With the goalkeeper</th><th scope="col">Best for</th><th scope="col">Watch out for</th></tr></thead>
    <tbody>{list.map(f=><tr key={f.slug}><th scope="row"><a href={f.path}>{f.shape}</a></th><td>{withKeeper(f)}</td><td>{f.best}</td><td>{f.watch}</td></tr>)}</tbody>
   </table></div>
   <p className={styles.caption}>U.S. Soccer writes youth formations with the goalkeeper first, so a {list[0].shape} in {format} is also written {withKeeper(list[0])}.</p>
  </Section>
  <Section id="pick" title={g.pickTitle}><Bullets items={g.pick}/></Section>
  <Section id="shapes" title={`Diagrams of each ${format} formation`}>
   <div className={styles.pair}>{list.map(f=><div key={f.slug}><h3 className={styles.h3}><a href={f.path}>{f.shape}</a></h3>
    <Diagram id={`d-${f.slug}`} format={f.format} lines={f.lines} what={`the ${f.name} formation`} small/><p className={styles.caption}>{f.lines.slice(1).map(l=>`${l.spots.length} ${l.name.toLowerCase()}`).join(', ')}. <a href={formationImage(f.slug)}>Picture</a></p></div>)}</div>
  </Section>
  <Section id="basics" title={`${format} soccer in short`}><Bullets items={g.basics}/>
   {format==='8v8'&&<AppLink href="/coach#tool=lineup&format=8v8" label="Open the coach app" line="Fútbol 8 on your phone at the side line: pick a 3-3-1, 3-2-2 or 2-3-2, put the names on it and let the app plan the rolling changes."/>}</Section>
  <QA id="faq" title={`Questions about ${format} formations`} faq={g.faq}/>
  {g.sources&&<Section id="sources" title="Sources">
   <ul>{g.sources.map(x=><li key={x.url}><a href={x.url} rel="noopener">{x.name}</a>: {x.says}.</li>)}</ul>
   <p className={styles.caption}>Fútbol 8 rules are set region by region in Spain, so check the rules of your own federation or league.</p>
  </Section>}
  <KeepReading groups={[{id:'lessons',label:'Lesson',icon:'steps',links:lessonLinks(g.lessons)},{id:'related',links:[...others.map(o=>({path:o.path,name:o.h1,line:o.blurb})),...(printable?[{path:cheatSheetPath(g.format),name:`${g.format} formations cheat sheet`,line:'Every shape on one printable page'}]:[]),{path:`/tools/${g.format}-lineup-builder`,name:`${g.format} lineup builder`,line:'Put your players’ names on the field and print it'},
   /* Nov 23 2026 (seo-unindexed): the format's blank field and rotation had 3-4 inlinks ('Discovered, not indexed') */...(printable?[{path:`/tools/soccer-field-diagrams/blank-${g.format}-soccer-field`,name:`Blank ${g.format} soccer field`,line:'A printable field to draw plays and drills'}]:[]),...(g.format==='11v11'||g.format==='8v8'?[]:[{path:`/tools/${g.format}-substitution-rotation`,name:`${g.format} substitution rotation`,line:'Equal minutes for the whole squad'}]),{path:FORMATIONS_HUB.path,name:'All soccer formations',line:FORMATIONS_HUB.blurb},{path:POSITIONS_HUB.path,name:POSITIONS_HUB.h1,line:POSITIONS_HUB.blurb},{path:'/learn/7v7-9v9-11v11',name:'7v7, 9v9 and 11v11 lessons',line:'Every lesson by team size'}]}]}/>
  <GuideEnd cta={false}/>
 </>;
}
