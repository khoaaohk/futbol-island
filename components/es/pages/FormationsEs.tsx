import JsonLd from '@/components/seo/JsonLd';
import PitchDiagram from '@/lib/site/PitchDiagram';
import {arrows,place,PLAYERS_PER_TEAM,GUIDE_FORMATS,type GuideFormat,type Line} from '@/lib/site/pitch';
import {formationImage,positionImage} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {withKeeper} from '@/lib/site/formations';
import {lineupLinkFor} from '@/lib/site/tools/registry';
import {articleLd,breadcrumbLd,collectionLd,faqLd} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {toEs} from '@/lib/i18n/esPaths';
import {ES_COMPARISONS,ES_FORMATIONS,ES_HUBS,ES_POSITIONS,describeEs,esFormatGuide,esFormationsIn,esLines,type EsComparison,type EsFormation} from '@/lib/i18n/es/registry';
import {Bullets,DataTable,EsCoachNotes,EsGuideEnd,EsIntro,EsReadNext,EsLessonList,LinkList,QA,Section,esCrumbs} from '@/components/es/EsParts';
import {esLesson} from '@/lib/i18n/es/lessons';
import {esLd} from './GuidesEs';
import styles from '@/app/(site)/site.module.css';
/**
 * The Spanish formations hub, the 21 formation pages, the three format guides and the three comparison pages (Spanish round 2,
 * Nov 16 2026): the English pages' sections in the same order (app/(site)/learn/soccer-formations, lib/site/FormatGuideView.tsx,
 * components/site/ComparePage.tsx) with the Spanish words. Lesson lists stay off until the lessons family is translated; the
 * lineup builder and cheat sheets are English tools, linked with “(en inglés)”.
 */
type Fmt=GuideFormat;
const posEs=(slug?:string)=>slug?ES_POSITIONS().find(p=>p.slug===slug):undefined;
const lineWords=(f:{lines:readonly Line[]})=>esLines(f.lines).filter(l=>!/^Portero$/.test(l.name)).map(l=>`${l.spots.length} ${l.name.toLowerCase()}`).join(', ');
export function FormationDiagram({id,format,lines,what,image,small,mode}:{id:string;format:Fmt;lines:readonly Line[];what:string;image?:string;small?:boolean;mode?:'base'|'attack'|'defend'}){
 const es=esLines(lines),desc=describeEs({format,what,lines:es,mode});
 return <figure className={styles.figure}>
  <div className={styles.art}><PitchDiagram id={id} format={format} spots={place(es,mode??'base')} arrows={arrows(es,mode??'base')} title={what[0].toUpperCase()+what.slice(1)} desc={desc} small={small}/></div>
  {!small&&<figcaption className={styles.caption}>{desc}{image&&<> <a href={image}>Abre este diagrama como imagen</a>.</>}</figcaption>}
 </figure>;
}
const firstSentence=(s:string)=>s.split('. ')[0].replace(/\.$/,'')+'.';
const hubLink=()=>({path:ES_HUBS.formations.path,name:'Todas las formaciones de fútbol',line:ES_HUBS.formations.blurb});
const posHubLink=()=>({path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1,line:ES_HUBS.positions.blurb});
const LABEL:Record<Fmt,string>={'7v7':'Formaciones de fútbol 7v7','9v9':'Formaciones de fútbol 9v9','11v11':'Formaciones de fútbol 11v11',futsal:'Formaciones de futsal'};

// ---- hub ----
export function FormationsHubEsPage(){
 const H=ES_HUBS.formations,crumbs=esCrumbs({name:H.crumb,path:H.path}),all=ES_FORMATIONS();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:H.h1,path:H.path,description:H.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:all.map(f=>({name:`Formación ${f.name}`,path:f.esPath}))}))}/>
  <JsonLd data={faqLd(H.faq)}/>
  <EsIntro crumbs={crumbs} h1={H.h1} lead={H.lead} cta/>
  <Section id="what" title="¿Qué es una formación?"><Bullets items={H.what}/></Section>
  {GUIDE_FORMATS.map(fmt=>{const list=esFormationsIn(fmt),first=list[0],guide=fmt==='futsal'?null:esFormatGuide(fmt);
   return <Section key={fmt} id={`f-${fmt}`} title={LABEL[fmt]}>
    <p>{H.groups[fmt]} {guide&&<><a href={guide.esPath}>Compara las {list.length} en la guía de {fmt}</a>.</>}</p>
    <div className={styles.pair}>
     <FormationDiagram id={`d-${fmt}`} format={fmt} lines={first.lines} what={`la formación ${first.name}`} small/>
     <LinkList links={list.map(f=>({path:f.esPath,name:`Formación ${f.name}`,line:f.best}))}/>
    </div>
   </Section>;})}
  <QA id="faq" title="Preguntas sobre las formaciones" faq={H.faq}/>
  <Section id="compare" title="Formaciones comparadas"><LinkList links={ES_COMPARISONS().filter(c=>c.kind==='formation').map(c=>({path:c.esPath,name:c.h1,line:firstSentence(c.answer)}))}/></Section>
  <Section id="related" title="Sigue leyendo"><LinkList links={[posHubLink(),{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:ES_HUBS.rules.blurb},{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1,line:ES_HUBS.terms.blurb}]}/></Section>
  <EsGuideEnd cta={false}/>
 </>;
}

// ---- one formation ----
export function FormationEsPage({f}:{f:EsFormation}){
 const H=ES_HUBS.formations,futsal=f.format==='futsal',what=`la formación ${f.name}`;
 const crumbs=esCrumbs({name:H.crumb,path:H.path},{name:f.name,path:f.esPath});
 const guide=futsal?null:esFormatGuide(f.format as '7v7'|'9v9'|'11v11');
 const compare=ES_COMPARISONS().filter(c=>c.links.slice(0,2).some(l=>l.path===f.path));
 const related=[...(guide?[{path:guide.esPath,name:guide.h1,line:guide.blurb}]:[]),
  ...esFormationsIn(f.format).filter(x=>x.slug!==f.slug).map(x=>({path:x.esPath,name:`Formación ${x.name}`,line:x.best})),posHubLink(),hubLink()];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:f.title,path:f.esPath,description:f.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`Formación ${f.name} de fútbol`,teaches:f.answer,image:formationImage(f.slug)}))}/>
  <JsonLd data={faqLd(f.faq)}/>
  <EsIntro crumbs={crumbs} h1={f.h1} lead={f.answer}/>
  <Section id="diagram" title={`Diagrama del ${f.shapeEs}`}>
   <FormationDiagram id="base" format={f.format} lines={f.lines} what={what} image={formationImage(f.slug)}/>
   <p><a href={lineupLinkFor(f.slug)}>Arma esta alineación</a> (en inglés): pon los nombres de tus jugadores en el {f.shapeEs} con el creador de alineaciones gratis, y luego imprímelo o comparte un enlace.</p>
   {futsal
    ?<p>El {f.shape} cuenta a los cuatro jugadores de campo de atrás hacia adelante. Al portero se le cuenta aparte, así que un equipo de futsal tiene {PLAYERS_PER_TEAM.futsal} jugadores en la cancha.</p>
    :<p>Los entrenadores escriben esta forma de dos maneras. <b>{f.shape}</b> cuenta a los {PLAYERS_PER_TEAM[f.format]-1} jugadores de campo, desde la defensa hacia adelante. U.S. Soccer cuenta primero al portero y escribe <b>{withKeeper(f)}</b>. Las dos quieren decir la misma formación. Los números de los puntos son una costumbre común de los entrenadores, no una regla: los jugadores pueden usar cualquier número de camiseta.</p>}
  </Section>
  <Section id="roles" title="Quién juega dónde">
   <ul>{f.roles.map(r=>{const p=posEs(r.pos);return <li key={r.title}><b>{p?<a href={p.esPath}>{r.title}</a>:r.title}.</b> {r.job}</li>;})}</ul>
  </Section>
  <Section id="strengths" title={`Fortalezas del ${f.shapeEs}`}><Bullets items={f.strengths}/></Section>
  <Section id="weak" title="Puntos débiles y cómo cubrirlos">
   <ul className={styles.stack}>{f.weak.map(w=><li key={w.spot} className={styles.card}><h3 className={styles.h3}>{w.spot}</h3><p><b>Cómo cubrirlo:</b> {w.cover}{w.lesson&&esLesson(w.lesson)&&<> Lección: <a href={esLesson(w.lesson)!.esPath}>{esLesson(w.lesson)!.title}</a>.</>}</p></li>)}</ul>
  </Section>
  <Section id="moves" title={`Cómo se mueve el ${f.shapeEs}`}>
   <div className={styles.pair}>
    <div><h3 className={styles.h3}>Cuando tu equipo tiene el balón</h3><FormationDiagram id="attack" format={f.format} lines={f.lines} what={`${what} en ataque`} mode="attack" small/><p>{f.attack}</p></div>
    <div><h3 className={styles.h3}>Cuando el otro equipo tiene el balón</h3><FormationDiagram id="defend" format={f.format} lines={f.lines} what={`${what} en defensa`} mode="defend" small/><p>{f.defend}</p></div>
   </div>
  </Section>
  <Section id="suits" title="A quién le sirve"><p>{f.suits}</p></Section>
  <QA id="faq" title={`Preguntas sobre el ${f.shapeEs}`} faq={f.faq}/>
  <EsCoachNotes name={f.name} notes={f.notes}/>
  {compare.length>0&&<Section id="compare" title="Compárala"><LinkList links={compare.map(c=>({path:c.esPath,name:c.h1,line:firstSentence(c.answer)}))}/></Section>}
  {f.lessons.length>0&&<Section id="lessons" title="Lecciones que enseñan esta formación"><EsLessonList lessons={f.lessons}/></Section>}
  <Section id="related" title="Sigue leyendo"><LinkList links={related}/></Section>
  <EsGuideEnd checked={FAMILY_CHECKED.formations} lessonId={f.lessons[0]?.id}/>
  <EsReadNext order={[{path:H.path,name:H.h1},...ES_FORMATIONS().map(x=>({path:x.esPath,name:x.h1}))]} path={f.esPath}/>
 </>;
}

// ---- format guides ----
export function FormatGuideEsPage({format}:{format:'7v7'|'9v9'|'11v11'}){
 const H=ES_HUBS.formations,g=esFormatGuide(format),list=esFormationsIn(format),crumbs=esCrumbs({name:H.crumb,path:H.path},{name:g.crumb,path:g.esPath});
 const others=(['7v7','9v9','11v11'] as const).filter(x=>x!==format).map(esFormatGuide);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:g.h1,path:g.esPath,description:g.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:list.map(f=>({name:`Formación ${f.name}`,path:f.esPath}))}))}/>
  <JsonLd data={faqLd(g.faq)}/>
  <EsIntro crumbs={crumbs} h1={g.h1} lead={g.lead} cta/>
  <Section id="compare" title={`Formaciones de ${format} comparadas`}>
   <div className={styles.tableWrap} tabIndex={0} role="region" aria-label={`Formaciones de ${format} comparadas`}><table className={styles.table}>
    <thead><tr><th scope="col">Formación</th><th scope="col">Con el portero</th><th scope="col">Ideal para</th><th scope="col">Cuidado con</th></tr></thead>
    <tbody>{list.map(f=><tr key={f.slug}><th scope="row"><a href={f.esPath}>{f.shape}</a></th><td>{withKeeper(f)}</td><td>{f.best}</td><td>{f.watch}</td></tr>)}</tbody>
   </table></div>
   <p className={styles.caption}>U.S. Soccer escribe las formaciones juveniles con el portero primero, así que un {list[0].shape} en {format} también se escribe {withKeeper(list[0])}.</p>
  </Section>
  <Section id="pick" title={g.pickTitle}><Bullets items={g.pick}/></Section>
  <Section id="shapes" title={`Diagramas de cada formación de ${format}`}>
   <div className={styles.pair}>{list.map(f=><div key={f.slug}><h3 className={styles.h3}><a href={f.esPath}>{f.shape}</a></h3>
    <FormationDiagram id={`d-${f.slug}`} format={f.format} lines={f.lines} what={`la formación ${f.name}`} small/><p className={styles.caption}>{lineWords(f)}. <a href={formationImage(f.slug)}>Imagen</a></p></div>)}</div>
  </Section>
  <Section id="basics" title={`El fútbol ${format} en breve`}><Bullets items={g.basics}/></Section>
  <QA id="faq" title={`Preguntas sobre las formaciones de ${format}`} faq={g.faq}/>
  <Section id="related" title="Sigue leyendo"><LinkList links={[...others.map(o=>({path:o.esPath,name:o.h1,line:o.blurb})),hubLink(),posHubLink()]}/></Section>
  <EsGuideEnd cta={false}/>
 </>;
}

// ---- comparisons ----
const ROWS_POS=['La tarea','Dónde se coloca','Con el balón','Sin el balón','Números de camiseta','Formaciones de 11v11 que lo usan','Es ideal para'];
const ROWS_FORM=['Las líneas','Ideal para','Cuidado con','Con el balón','Sin el balón','Fortaleza principal','A quién le sirve'];
function compareRows(c:EsComparison):string[][]{
 if(c.kind==='position'){const a=posEs(c.a)!,b=posEs(c.b)!;
  const shapes=(slug:string)=>ES_FORMATIONS().filter(f=>f.format==='11v11'&&f.lines.some(l=>l.spots.some(s=>s.pos===slug))).map(f=>f.shape).join(', ')||'—';
  const cells=(p:typeof a)=>[p.job,p.where,p.withBall[0],p.withoutBall[0],p.numbers,shapes(p.slug),p.suits];
  const A=cells(a),B=cells(b);return ROWS_POS.map((r,i)=>[r,A[i],B[i]]);}
 const a=ES_FORMATIONS().find(f=>f.slug===c.a)!,b=ES_FORMATIONS().find(f=>f.slug===c.b)!;
 const cells=(f:EsFormation)=>[lineWords(f),f.best,f.watch,f.attack,f.defend,f.strengths[0],f.suits];
 const A=cells(a),B=cells(b);return ROWS_FORM.map((r,i)=>[r,A[i],B[i]]);
}
export function CompareEsPage({c}:{c:EsComparison}){
 const pos=c.kind==='position',hub=pos?ES_HUBS.positions:ES_HUBS.formations,crumbs=esCrumbs({name:hub.crumb,path:hub.path},{name:c.h1.replace(/:.*$/,''),path:c.esPath});
 const A=pos?posEs(c.a)!:ES_FORMATIONS().find(f=>f.slug===c.a)!,B=pos?posEs(c.b)!:ES_FORMATIONS().find(f=>f.slug===c.b)!;
 const nameOf=(x:typeof A)=>'job' in x?x.name:x.shape;
 const links=pos?[A,B].map(p=>({path:(p as {esPath:string}).esPath,name:(p as {h1:string}).h1,line:(p as {job:string}).job}))
  :[A,B].map(f=>({path:(f as EsFormation).esPath,name:(f as EsFormation).h1,line:(f as EsFormation).best}));
 const extra=pos?[...(c.slug==='fullback-vs-wingback'?ES_FORMATIONS().filter(f=>['11v11-3-5-2','11v11-4-3-3'].includes(f.slug)).map(f=>({path:f.esPath,name:`La formación ${f.shape}`,line:f.slug==='11v11-3-5-2'?'La forma con dos carrileros':'La forma con dos laterales'}))
   :ES_FORMATIONS().filter(f=>f.slug==='11v11-4-3-3').map(f=>({path:f.esPath,name:`La formación ${f.shape}`,line:'Un delantero centro con un extremo a cada lado'}))),posHubLink()]
  :[esFormatGuide('11v11')].map(g=>({path:g.esPath,name:g.h1,line:'Todas las formas de 11v11 comparadas'})).concat([hubLink()]);
 const img=pos?[positionImage(c.a),positionImage(c.b)]:[formationImage(c.a),formationImage(c.b)];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:c.title,path:c.esPath,description:c.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:c.h1,teaches:c.answer,image:img[0]}))}/>
  <EsIntro crumbs={crumbs} h1={c.h1} lead={c.answer}/>
  <Section id="side-by-side" title="Lado a lado">
   <DataTable label={c.h1.replace(/:.*$/,'')} head={['Tema',nameOf(A),nameOf(B)]} rows={compareRows(c)}/>
  </Section>
  <Section id="fit" title="¿Cuál le queda a tu equipo?"><Bullets items={c.fit}/></Section>
  <Section id="switching" title="Cómo pasar de una a otra"><Bullets items={c.switching}/></Section>
  <Section id="related" title="Lee cada una, y más"><LinkList links={[...links,...extra]}/></Section>
  <EsGuideEnd checked={pos?FAMILY_CHECKED.positions:FAMILY_CHECKED.formations}/>
 </>;
}
export const esCompareIn=(kind:'position'|'formation')=>ES_COMPARISONS().filter(c=>c.kind===kind);
export {toEs};
