import KeepReading,{lessonLinks} from '@/components/site/KeepReading';
import RailNav from '@/components/site/shell/RailNav';
import {chartRail} from '@/lib/site/railNavCollections';
import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {chartBySlug,type ChartPage} from '@/lib/site/sizes';
import {diagramUrl,guideCrumbs} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {Bullets,DataTable,GuideEnd,GuideIntro,SceneDiagram,Section} from '@/lib/site/GuideParts';
import {scene} from '@/lib/site/scenes';
import {articleLd,breadcrumbLd,faqLd,pageMeta} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import styles from '../site.module.css';

/**
 * A size chart page (lib/site/sizes.ts): /learn/soccer-ball-size-by-age, /learn/soccer-field-size-by-age and
 * /learn/soccer-age-groups. The answer first, then real tables (header cells, a source column, the season under each one),
 * short lists, FAQ and lessons. The three route files only pick the chart.
 */
export const chartMeta=(slug:string)=>{const c=chartBySlug(slug)!;return pageMeta(c.title,c.description,c.path,{whole:true,image:{url:diagramUrl(c.picture),alt:c.pictureTitle}});};
const FIELDS=[scene({format:'7v7',title:'A 7v7 field',who:'',caption:'An empty 7v7 field: 55 to 65 yards long. The dashed lines are the two build-out lines.'}),
 scene({format:'11v11',title:'A full-size 11v11 field',who:'',caption:'An empty full-size field: 100 to 130 yards long, with the penalty area, goal area, center circle and penalty marks.'})];
export default function ChartView({slug}:{slug:string}){
 const c:ChartPage=chartBySlug(slug)!,crumbs=guideCrumbs({name:c.crumb,path:c.path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={articleLd({headline:c.title,path:c.path,description:c.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:c.h1,teaches:c.lead,image:diagramUrl(c.picture)})}/>
  <JsonLd data={faqLd(c.faq)}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back to the Library, Overview, the page's sections */}
  <GuideIntro crumbs={crumbs} h1={c.h1} lead={c.lead} more={c.more} top rail={<RailNav rail={chartRail({tables:c.tables,fields:c.fields?'A 7v7 field next to a full-size field':undefined,sections:c.sections})} current="#top"/>}/>
  {c.tables.map(t=><Section key={t.id} id={t.id} title={t.title}>
   {t.intro&&<p>{t.intro}</p>}
   <DataTable label={t.title} head={t.head} rows={t.rows}/>
   <p className={styles.caption}>{t.note}</p>
  </Section>)}
  {c.fields&&<Section id="fields" title="A 7v7 field next to a full-size field">
   <div className={styles.pair}>{FIELDS.map((f,i)=><div key={f.title}><h3 className={styles.h3}>{f.title}</h3><SceneDiagram id={`f${i}`} scene={f} small/></div>)}</div>
  </Section>}
  {c.sections.map(s=><Section key={s.id} id={s.id} title={s.title}><Bullets items={s.items}/></Section>)}
  <QA id="faq" title={`Questions about ${c.crumb.toLowerCase()}`} faq={c.faq}/>
  <KeepReading groups={[{id:'lessons',label:'Free lesson',icon:'steps',links:lessonLinks(c.lessons)},{id:'related',links:[...c.links,{path:'/tools/soccer-playing-time-calculator',name:'Soccer playing time calculator',line:'Share the game fairly: a substitution plan for any squad',tag:'Coach tool'}]}]}/>
  <GuideEnd path={c.path} checked={FAMILY_CHECKED.sizes}/>
 </>;
}
