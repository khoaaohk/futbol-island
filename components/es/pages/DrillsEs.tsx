import KeepReading from '@/components/site/KeepReading';
import {AppLink} from '@/components/site/tools/ToolParts';
import {withMesh} from '@/lib/site/mesh';
import RailNav from '@/components/site/shell/RailNav';
import {onwardFor} from '@/lib/site/railNav';
import {anchor,drillGuideRail,guideRail,hubRail,planRail,plansHubRail} from '@/lib/site/railNavMore';
import rt from '@/components/site/railTarget.module.css';
import {railId} from '@/lib/site/railId';
import JsonLd from '@/components/seo/JsonLd';
import GridDiagram from '@/lib/site/GridDiagram';
import {AGES,SKILLS,drillsBySkill} from '@/lib/site/drills';
import {AGE_GUIDES,SKILL_GUIDES,guidesForDrill} from '@/lib/site/drillGuides';
import {plansForDrill,clock} from '@/lib/site/plans';
import type {GridScene} from '@/lib/site/grid';
import {diagramUrl} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {articleLd,breadcrumbLd,collectionLd,faqLd} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {AGE_YEARS_ES,DRILL_SAFETY_LINE_ES,PLAN_SAFETY_LINE_ES,PPP_LINE_ES,PRACTICE_RANGE_ES,SKILLS_ES,STAGE_ES,FIELD_ES} from '@/lib/i18n/es/drills';
import {ES_DRILL_HUBS,ES_DRILLS,ES_DRILL_GUIDES,esDrill,esDrillGuide,esDrillLinks,esDrillOrder,esPlan,esPlanOrder,esPlansForAge,drillLineEs,gridDescEs,gridKeyEs,type EsDrill,type EsDrillGuide,type EsPlan} from '@/lib/i18n/es/drillsRegistry';
import {ES_HUBS} from '@/lib/i18n/es/registry';
import {ES_UI} from '@/lib/i18n/es/ui';
import {Bullets,DataTable,EsCoachNotes,EsGuideEnd,EsIntro,EsPrintSheet,EsReadNext,LinkList,QA,Section,esCrumbs,esLibCrumbs} from '@/components/es/EsParts';
import {esLd} from './GuidesEs';
import {Checklist,Glance} from '@/components/site/PageParts';
import styles from '@/app/(site)/site.module.css';
/**
 * The Spanish drills hub, drill pages, age and skill guides, plans hub and plan pages (Spanish round C, Nov 16 2026): the
 * English pages' sections in the same order (app/(site)/learn/soccer-drills, soccer-practice-plans) with the Spanish words
 * (lib/i18n/es/drills*.ts, drillGuides.ts, plans.ts merged by drillsRegistry.ts). Lesson lists stay off until the lessons family
 * is translated (English lesson titles); the gold button still opens the page's lesson on the island.
 */
export function EsGridFigure({id,scene,small,image}:{id:string;scene:GridScene;small?:boolean;image?:string}){
 return <figure className={styles.figure}>
  <div className={styles.art}><GridDiagram id={id} scene={scene} small={small} desc={gridDescEs(scene)}/></div>
  <figcaption className={styles.caption}>{scene.caption} {gridKeyEs(scene)}{image&&<> <a href={image}>{ES_UI.openPicture}</a>.</>}</figcaption>
 </figure>;
}
const Steps=({items}:{items:readonly string[]})=><ol>{items.map(t=><li key={t}>{t}</li>)}</ol>;
function EsDrillList({items,ids}:{items:readonly {drill:EsDrill;line:string}[];ids?:string}){
 return <ul className={styles.list}>{items.map(({drill:d,line})=><li key={d.slug} id={ids?railId(ids,d.esPath):undefined} className={ids?rt.target:undefined}><a href={d.esPath}><span className={styles.itemTitle}>{d.name}</span><span className={styles.itemMeta}>{line} {d.agesText.replace(/ \(.*$/,'')}.</span></a></li>)}</ul>;
}
const H=()=>ES_DRILL_HUBS.drills,P=()=>ES_DRILL_HUBS.plans;
const guideLink=(g:EsDrillGuide)=>({path:g.esPath,name:g.h1,line:g.blurb});
const allDrills=()=>({path:H().path,name:'Todos los ejercicios de fútbol para niños',line:H().blurb});

// ---- hub -------------------------------------------------------------------------------------------------------------------
export function DrillsHubEsPage(){
 const h=H(),crumbs=esLibCrumbs({name:h.crumb,path:h.path}),guides=ES_DRILL_GUIDES(),drills=ES_DRILLS(),sharks=esDrill('sharks-and-minnows')!,picture=diagramUrl('sharks-and-minnows-drill.png');
 const ages=guides.filter(g=>g.kind==='age'),skills=guides.filter(g=>g.kind==='skill'),bySkill=(id:string)=>drills.filter(d=>d.skill===id);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:h.h1,path:h.path,description:h.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:[...ages,...skills].map(g=>({name:g.h1,path:g.esPath})).concat(drills.map(d=>({name:d.h1,path:d.esPath})))}))}/>
  <JsonLd data={faqLd(h.faq)}/>
  <EsIntro top rail={<RailNav rail={hubRail('Ejercicios en esta página',[{title:'Por edad',items:ages.map(g=>anchor('age',g.esPath,g.h1))},...SKILLS.map(s=>({title:SKILLS_ES[s.id].name,items:bySkill(s.id).map(d=>anchor('drill',d.esPath,d.name))}))],true)} current="#top"/>} crumbs={crumbs} h1={h.h1} lead={h.lead} more={h.more} cta/>
  <Section id="by-age" title="Ejercicios de fútbol por edad">
   <p>Cada página por edad es una guía corta: qué pueden hacer los jugadores, cómo agruparlos, los mejores ejercicios y qué evitar.</p>
   <LinkList ids="age" links={ages.map(guideLink)}/>
  </Section>
  <Section id="by-skill" title="Ejercicios de fútbol por habilidad">
   <p>Salta a una habilidad en esta página.</p>
   <LinkList links={SKILLS.map(s=>({path:`#${s.id}`,name:SKILLS_ES[s.id].name,line:`${drillsBySkill(s.id).length} ejercicios. ${SKILLS_ES[s.id].line}`}))}/>
  </Section>
  {SKILLS.map(s=><Section key={s.id} id={s.id} title={SKILLS_ES[s.id].name}>
   <p>{SKILLS_ES[s.id].line}</p>
   <EsDrillList ids="drill" items={bySkill(s.id).map(d=>({drill:d,line:drillLineEs(d)}))}/>
  </Section>)}
  <Section id="picture" title="Cada ejercicio tiene un diagrama como este">
   <EsGridFigure id="hub" scene={sharks.scene} image={picture}/>
   <p>El área está dibujada a escala, con su tamaño en yardas y metros. <a href={sharks.esPath}>Mira cómo se juega a Tiburones y pececitos</a>.</p>
  </Section>
  <Section id="how" title="Cómo usar estos ejercicios">
   <Bullets items={h.how}/>
   <p className={styles.caption}>{DRILL_SAFETY_LINE_ES}</p>
  </Section>
  <Section id="guides" title="Guías por habilidad y planes de entrenamiento">
   <LinkList links={[...skills.map(guideLink),{path:P().path,name:P().h1,line:P().blurb}]}/>
  </Section>
  <QA id="faq" title="Preguntas sobre los ejercicios de fútbol" faq={h.faq}/>
  <KeepReading lang="es" groups={[{id:'related',links:[{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:'Cada regla con un diagrama'},{path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1,line:'Qué hace cada jugador'},
   ...esDrillLinks([{path:'/learn/soccer-age-groups',name:''}]),{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1,line:'Las palabras que usan los entrenadores, explicadas'}]}]}/>
  <EsGuideEnd cta={false}/>
 </>;
}

// ---- one drill -----------------------------------------------------------------------------------------------------------------
export function DrillEsPage({d}:{d:EsDrill}){
 const h=H(),crumbs=esLibCrumbs({name:h.crumb,path:h.path},{name:d.name,path:d.esPath});
 const skillGuide=SKILL_GUIDES.find(g=>g.picks.some(p=>p.drill.slug===d.slug));
 const related=[...d.related.map(s=>esDrill(s)!).map(x=>({path:x.esPath,name:`${x.name} (ejercicio)`,line:drillLineEs(x)})),...esDrillLinks(d.links),
  ...guidesForDrill(d).map(g=>guideLink(esDrillGuide(g.slug)!)),...(skillGuide?[guideLink(esDrillGuide(skillGuide.slug)!)]:[]),
  ...plansForDrill(d.slug).slice(0,2).map(p=>esPlan(p.slug)!).map(p=>({path:p.esPath,name:p.h1,line:`Un plan de ${p.minutes} minutos que usa este ejercicio`})),
  {path:`${h.path}#${d.skill}`,name:`Todos los ejercicios: ${d.skillName.toLowerCase()}`,line:d.skillLine}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:d.title,path:d.esPath,description:d.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${d.name} (ejercicio de fútbol)`,teaches:d.answer,image:diagramUrl(d.picture)}))}/>
  <JsonLd data={faqLd(d.faq)}/>
  <EsIntro top rail={<RailNav rail={guideRail('drills',d.home?['home']:[],true)} current="#top"/>} onward={onwardFor(d.cta,true)} crumbs={crumbs} h1={d.h1} lead={d.answer}/>
  <EsPrintSheet path={d.esPath} what="hoja del ejercicio"/>
  <Section id="diagram" title={`${d.name}: diagrama del montaje`}><EsGridFigure id="s0" scene={d.scene} image={diagramUrl(d.picture)}/></Section>
  <Section id="facts" title="De un vistazo">
   <Glance label={`${d.name}: edades, jugadores, espacio, material y tiempo`} items={[{icon:'kid',label:'Edades',value:d.agesText},{icon:'court',label:'Espacio',value:d.space},{icon:'people',label:'Jugadores',value:d.players},{icon:'clock',label:'Tiempo',value:d.time},{icon:'ball',label:'Habilidad',value:d.skillName},{icon:'cone',label:'Material',value:d.equipment}]}/>
   <p className={styles.caption}>{DRILL_SAFETY_LINE_ES}</p>
  </Section>
  <Section id="steps" title="Cómo hacerlo"><Steps items={d.steps}/></Section>
  <Section id="cues" title="Puntos clave para decir en voz alta"><Checklist items={d.cues}/></Section>
  <Section id="versions" title="Hazlo más fácil o más difícil">
   <ul className={styles.stack}><li className={styles.card}><h3 className={styles.h3}>Más fácil</h3><p>{d.easier}</p></li><li className={styles.card}><h3 className={styles.h3}>Más difícil</h3><p>{d.harder}</p></li></ul>
  </Section>
  <Section id="mistakes" title={ES_UI.mistakes}><Bullets items={d.mistakes}/></Section>
  <Section id="game" title="Por qué importa en un partido"><p>{d.game}</p></Section>
  <EsCoachNotes name={d.name} notes={{coach:'',match:'',ages:d.ageNotes}}/>
  {d.home&&<Section id="home" title="Hazlo en casa"><p>{d.home}</p></Section>}
  <QA id="faq" title={`Preguntas sobre: ${d.name}`} faq={d.faq}/>
  <KeepReading lang="es" groups={withMesh([{id:'related',links:related}],d.path,'es')}/>
  <EsGuideEnd checked={FAMILY_CHECKED.drills} lessonId={d.cta.id}/>
  <EsReadNext order={esDrillOrder()} path={d.esPath}/>
 </>;
}

// ---- age and skill guides ------------------------------------------------------------------------------------------------------
export function DrillGuideEsPage({g}:{g:EsDrillGuide}){
 const h=H(),crumbs=esLibCrumbs({name:h.crumb,path:h.path},{name:g.name,path:g.esPath}),featured=esDrill(g.featured)!;
 const others=ES_DRILL_GUIDES().filter(x=>x.slug!==g.slug&&x.kind===g.kind).map(guideLink);
 const plans=g.age?esPlansForAge(g.age).map(p=>({path:p.esPath,name:p.h1,line:`${p.minutes} minutos, con tabla de tiempos`})):[];
 const sections=(list:EsDrillGuide['before'])=>list.map(s=><Section key={s.id} id={s.id} title={s.title}><Bullets items={s.items}/></Section>);
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:g.title,path:g.esPath,description:g.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${g.name} (guía para entrenadores de fútbol)`,teaches:g.lead,image:diagramUrl(g.picture)}))}/>
  <JsonLd data={faqLd(g.faq)}/>
  <EsIntro top rail={<RailNav rail={drillGuideRail(g,plans.length>0,true)} current="#top"/>} crumbs={crumbs} h1={g.h1} lead={g.lead} more={g.more}/>
  {g.facts&&<Section id="facts" title={g.facts.label}>
   <DataTable label={g.facts.label} head={['Dato',g.age??'Valor']} rows={g.facts.rows}/>
   <p className={styles.caption}>{g.facts.note}</p>
  </Section>}
  {sections(g.before)}
  <Section id="drills" title={g.picksTitle}><EsDrillList items={g.picks}/></Section>
  <Section id="diagram" title={`Ejemplo: ${featured.name}`}>
   <EsGridFigure id="s0" scene={featured.scene} image={diagramUrl(featured.picture)}/>
   <p>{featured.answer} <a href={featured.esPath}>Mira el ejercicio completo</a>.</p>
  </Section>
  {sections(g.after)}
  {plans.length>0&&<Section id="plans" title={`Planes de entrenamiento ${g.age}`}><LinkList links={plans}/></Section>}
  <QA id="faq" title={`Preguntas sobre: ${g.name.toLowerCase()}`} faq={g.faq}/>
  <KeepReading lang="es" groups={withMesh([{id:'related',links:[...others,...esDrillLinks(g.links),allDrills(),{path:P().path,name:P().h1,line:P().blurb}]}],g.path,'es')}/>
  <EsGuideEnd checked={FAMILY_CHECKED.drills} lessonId={g.lessons[0]?.id}/>
  <EsReadNext order={esDrillOrder()} path={g.esPath}/>
 </>;
}

// ---- plans -----------------------------------------------------------------------------------------------------------------
export function PlansHubEsPage(){
 const h=P(),crumbs=esLibCrumbs({name:h.crumb,path:h.path}),game=esDrill('three-v-three-game')!,picture=diagramUrl('three-v-three-game-drill.png');
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:h.h1,path:h.path,description:h.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:esPlanOrder().slice(1).map(p=>({name:p.name,path:p.path}))}))}/>
  <JsonLd data={faqLd(h.faq)}/>
  <EsIntro top rail={<RailNav rail={plansHubRail(true)} current="#top"/>} crumbs={crumbs} h1={h.h1} lead={h.lead} more={h.more} cta/>
  {AGES.map(a=><Section key={a} id={a.toLowerCase()} title={`Planes de entrenamiento de fútbol ${a} (${AGE_YEARS_ES[a]})`}>
   <LinkList links={esPlansForAge(a).map(p=>({path:p.esPath,name:p.h1,line:`${p.minutes} minutos. ${p.goal}.`}))}/>
  </Section>)}
  <Section id="structure" title="Cómo está hecho cada plan: jugar, practicar, jugar">
   <p>{PPP_LINE_ES}</p>
   <DataTable label="Las tres partes de una sesión Jugar-Practicar-Jugar" head={['Parte','Qué pasa']} rows={h.stages}/>
  </Section>
  <Section id="length" title="¿Cuánto debe durar el entrenamiento?">
   <DataTable label="Duración del entrenamiento de fútbol por edad" head={['Edad','Duración','Partido','Balón']} rows={h.lengths}/>
   <p className={styles.caption}>{h.lengthsNote} {PLAN_SAFETY_LINE_ES}</p>
  </Section>
  <Section id="picture" title="Cada plan termina con un partido como este">
   <EsGridFigure id="hub" scene={game.scene} image={picture}/>
   <p>Un partido pequeño le da el balón a todos los jugadores. <a href={game.esPath}>Mira cómo se monta el 3v3</a>.</p>
  </Section>
  <QA id="faq" title="Preguntas sobre los planes de entrenamiento de fútbol" faq={h.faq}/>
  <KeepReading lang="es" groups={[{id:'drills',links:[...AGE_GUIDES.map(g=>guideLink(esDrillGuide(g.slug)!)),allDrills()]},{id:'related',links:[...esDrillLinks([{path:'/learn/soccer-field-size-by-age',name:''},{path:'/learn/soccer-ball-size-by-age',name:''}]),
   {path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:'Cada regla con un diagrama'},{path:ES_HUBS.formations.path,name:ES_HUBS.formations.h1,line:'Sistemas para 7v7, 9v9 y 11v11'},
   /* Nov 23 2026 (seo-unindexed): tools a coach uses with a plan */{path:'/es/tools/soccer-playing-time-calculator',name:'Calculadora de minutos de juego',line:'Cambios justos para cada partido'},{path:'/es/tools/soccer-field-diagrams',name:'Diagramas de cancha en blanco para imprimir',line:'Dibuja los ejercicios del plan'}]}]}/>
  <EsGuideEnd cta={false}/>
 </>;
}
export function PlanEsPage({p}:{p:EsPlan}){
 const h=P(),crumbs=esLibCrumbs({name:h.crumb,path:h.path},{name:p.name,path:p.esPath}),guide=esDrillGuide(p.age.toLowerCase())!,shown=p.drills.find(d=>d.picture===p.picture)!;
 const related=[...esPlansForAge(p.age).filter(x=>x.slug!==p.slug).map(x=>({path:x.esPath,name:x.h1,line:`${x.minutes} minutos: ${x.goal[0].toLowerCase()+x.goal.slice(1)}`})),guideLink(guide),...esDrillLinks(p.links),
  {path:h.path,name:'Todos los planes de entrenamiento de fútbol',line:h.blurb},allDrills()];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(articleLd({headline:p.title,path:p.esPath,description:p.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${p.h1} (entrenamiento de fútbol infantil)`,teaches:p.goal,image:diagramUrl(p.picture)}))}/>
  <JsonLd data={faqLd(p.faq)}/>
  <RailNav rail={planRail(true)} current="#top"/>
  <div className={styles.printPage}>
   <EsIntro top crumbs={crumbs} h1={p.h1} lead={p.lead}/>
   <div className={styles.noPrint}><AppLink href={`/coach?lang=es#tool=plans&plan=${p.slug}`} label="Abrir en la app del entrenador" line="El mismo plan en la app gratuita del entrenador: un temporizador para cada parte y cada ejercicio con su diagrama. Funciona sin conexión."/></div>
   <Section id="facts" title="De un vistazo">
    <Glance label={`${p.h1}: de un vistazo`} items={[{icon:'kid',label:'Edad',value:`${p.age} (${AGE_YEARS_ES[p.age]})`},{icon:'clock',label:'Duración',value:`${p.minutes} minutos (guía para ${p.age}: ${PRACTICE_RANGE_ES[p.age]})`},{icon:'people',label:'Jugadores',value:p.players},{icon:'flag',label:'Objetivo del día',value:p.goal},{icon:'court',label:'Partido final',value:FIELD_ES[p.age]}]}/>
   </Section>
   <Section id="clock" title={`El plan de ${p.minutes} minutos`}>
    <DataTable label={`${p.h1}: tabla de tiempos`} head={['Tiempo','Actividad','Parte','Para qué sirve']}
     rows={p.rows.map(r=>[`${clock(r.start)} a ${clock(r.end)}`,r.drill?<a key="a" href={esDrill(r.drill.slug)!.esPath}>{r.activity}</a>:r.activity,STAGE_ES[r.stage],r.purpose])}/>
    <p className={styles.caption}>Los tiempos son minutos desde el inicio del entrenamiento. Toca una actividad para ver su diagrama y sus puntos clave.</p>
   </Section>
   <div className={styles.printCols}>
    <Section id="equipment" title="Material"><Bullets items={p.equipment}/></Section>
    <Section id="notes" title="Notas para el entrenador"><Checklist items={p.notes}/></Section>
   </div>
   <Section id="swap" title="Si las cosas salen mal">
    <ul className={styles.stack}><li className={styles.card}><h3 className={styles.h3}>{p.swap.sign}</h3><p>{p.swap.instead}</p></li></ul>
    <p className={styles.caption}>{PLAN_SAFETY_LINE_ES}</p>
   </Section>
  </div>
  <div className={styles.noPrint}>
   <Section id="structure" title="Cómo está hecho este plan"><p>{PPP_LINE_ES}</p><p>Para imprimir este plan en una página, usa la opción Imprimir de tu navegador.</p></Section>
   <Section id="drills" title="Ejercicios de este plan">
    <EsGridFigure id="s0" scene={shown.scene} image={diagramUrl(shown.picture)}/>
    <EsDrillList items={p.drills.map(d=>({drill:d,line:drillLineEs(d)}))}/>
   </Section>
   <QA id="faq" title={`Preguntas sobre este entrenamiento ${p.age}`} faq={p.faq}/>
  <KeepReading lang="es" groups={withMesh([{id:'related',links:related}],p.path,'es')}/>
   <EsGuideEnd checked={FAMILY_CHECKED.plans} lessonId={p.lessons[0]?.id}/>
  </div>
  <EsReadNext order={esPlanOrder()} path={p.esPath}/>
 </>;
}
