import JsonLd from '@/components/seo/JsonLd';
import {withMesh} from '@/lib/site/mesh';
import RailNav from '@/components/site/shell/RailNav';
import {onwardFor} from '@/lib/site/railNav';
import {anchor,guideRail,hubRail,sec} from '@/lib/site/railNavMore';
import GuideQuiz from '@/components/site/GuideQuiz';
import PitchDiagram from '@/lib/site/PitchDiagram';
import {place} from '@/lib/site/pitch';
import {FUTSAL_LAWS_URL,RULES_HUB} from '@/lib/site/rules';
import {GLOSSARY} from '@/lib/site/terms';
import {NUMBERS} from '@/lib/site/positions';
import {formationBySlug} from '@/lib/site/formations';
import {diagramUrl,formationImage,positionImage} from '@/lib/site/guides';
import {FAMILY_CHECKED} from '@/lib/site/checked';
import {ANIMATED_RULES,ANIMATED_TERMS} from '@/lib/site/sceneMotion';
import {guideQuizPart} from '@/lib/site/learningLd';
import {abs,articleLd,breadcrumbLd,collectionLd,faqLd,firstSentence} from '@/lib/site/seo';
import {SITE_UPDATED} from '@/lib/site/updated';
import {hasEs,toEs} from '@/lib/i18n/esPaths';
import {longDateEs} from '@/lib/i18n/es/ui';
import {esDrillLinksFor} from '@/lib/i18n/es/drillsRegistry';
import {esRuleCrossLinks,esTermCrossLinks} from '@/lib/i18n/es/crossLinks';
import {positionTermSlugs} from '@/lib/site/crossLinks';
import {ES_COMPARISONS,ES_FORMATIONS,esFormatGuide,ES_HUBS,ES_POSITIONS,ES_RULES,ES_TERMS,describeEs,esLines,esOrder,type EsPosition,type EsRule,type EsTerm} from '@/lib/i18n/es/registry';
import {positionQuizEs,ruleQuizEs,termQuizEs} from '@/lib/i18n/es/quiz';
import {type Fact,Bullets,DataTable,EsCoachNotes,EsGuideEnd,EsIntro,EsPrintSheet,EsReadNext,EsSceneDiagram,LinkList,QA,Section,esCrumbs,esLibCrumbs,esLessonLinks,sceneDescEs} from '@/components/es/EsParts';
import KeepReading from '@/components/site/KeepReading';
import {Band,CardGrid,IconRows,shirtBadge} from '@/components/site/HubParts';
import type {FactIconKind} from '@/components/site/FactIcons';
import {CardRulesGame,CardRulesPages,CardRulesSources,CardRulesTop} from '@/components/site/CardRulesSections';
import {CARD_RULES_ES} from '@/lib/i18n/es/cardRules';
import {cardDeckOf} from '@/lib/site/cardRules';
import {RulePlayDeck,RulePlayGame} from '@/components/site/RulePlaySections';
import {RULE_PLAY_ES} from '@/lib/i18n/es/rulePlay';
import {isRulePlaySlug} from '@/lib/site/rulePlay';
import styles from '@/app/(site)/site.module.css';
/** the rules hub's five lines' icons, as English (app/(site)/learn/soccer-rules/page.tsx) */
const BASIC_ICONS:readonly FactIconKind[]=['goal','glove','flag','cards','whistle'];
/**
 * The Spanish rules, terms and positions pages (Spanish round 1, Nov 15 2026): the English pages' sections in the same order,
 * with the Spanish words (lib/i18n/es/*.ts merged by registry.ts). Sections that only list English-only pages (lessons,
 * player cards, museum, arcade games, formations) are left out until those families are translated (docs/i18n/HANDOFF.md).
 */
/** Every JSON-LD node on a Spanish page says inLanguage "es" (the English helpers write "en"). */
export const esLd=<T,>(x:T):T=>JSON.parse(JSON.stringify(x),(k,v)=>k==='inLanguage'?'es':v);
const POS_FORMATS:readonly string[]=['7v7-2-3-1','9v9-3-2-3','11v11-4-3-3'];/* lib/site/positions.ts POSITIONS_HUB.formats */
const SUITS_OPEN=/^Es ideal para\s+/;
const posName=(slug:string)=>ES_POSITIONS().find(p=>p.slug===slug);
/** A link from a Spanish page: the Spanish counterpart and its Spanish name when it exists, else nothing. */
function esLink(path:string,line?:string){
 if(!hasEs(path))return null;
 const pos=ES_POSITIONS().find(p=>p.path===path);if(pos)return {path:pos.esPath,name:pos.name,line:line??pos.job};
 const r=ES_RULES().find(x=>x.path===path);if(r)return {path:r.esPath,name:r.h1,line:line??`${r.law}, con diagrama`};
 const t=ES_TERMS().find(x=>x.path===path);if(t)return {path:t.esPath,name:t.name,line:line??t.short};
 return null;
}
const links=(xs:readonly {path:string}[])=>xs.map(x=>esLink(x.path)).filter((x):x is NonNullable<typeof x>=>!!x);

// ---- rules ------------------------------------------------------------------------------------------------------------------
export function RulesHubEsPage(){
 const H=ES_HUBS.rules,crumbs=esLibCrumbs({name:H.crumb,path:H.path}),rules=ES_RULES(),offside=rules.find(r=>r.slug==='offside')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:H.h1,path:H.path,description:H.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:rules.map(r=>({name:r.h1,path:r.esPath}))}))}/>
  <JsonLd data={faqLd(H.faq)}/>
  <EsIntro top rail={<RailNav rail={hubRail('Reglas en esta página',RULES_HUB.groups.map((g,i)=>({title:H.groups[i].title,items:g.rules.slice(0,6).map(x=>rules.find(r=>r.slug===x.slug)!).map(r=>anchor('rule',r.esPath,r.name))})),true)} current="#top"/>} crumbs={crumbs} h1={H.h1} lead={H.lead} more={H.more} cta/>
  {/* batch 3, Nov 17 2026: as English (app/(site)/learn/soccer-rules/page.tsx): the diagram first, icon rows, chapter bands */}
  <Section id="picture" title="Cada regla tiene un diagrama como este">
   <div className={styles.pair}>{offside.scenes.map((s,i)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><EsSceneDiagram id={`o${i}`} scene={s} small/></div>)}</div>
   <p>Los puntos dorados son el equipo que ataca hacia arriba y los verde oscuro son el otro equipo. <a href={offside.esPath}>Lee la regla del fuera de juego</a>.</p>
  </Section>
  <Section id="basics" title="El juego en cinco líneas"><IconRows items={H.basics.map((t,i)=>({icon:BASIC_ICONS[i]??'ball',text:t}))}/></Section>
  {RULES_HUB.groups.map((g,i)=>{const list=g.rules.map(x=>rules.find(r=>r.slug===x.slug)!),sc=list[0].scenes[0];return <Band key={g.title} id={`g${i}`} title={H.groups[i].title} line={H.groups[i].line} tone={i%2?'paper':'tint'} count={`${list.length} ${list.length===1?'regla':'reglas'}`}
   art={<PitchDiagram id={`band${i}`} format={sc.format} spots={sc.spots} arrows={sc.runs} title={sc.title} desc={sceneDescEs(sc)} small scene={{ball:sc.ball,lineY:sc.lineY,lineWord:sc.lineWord,zone:sc.zone,passes:sc.passes}}/>}>
   <CardGrid lang="es" ids="rule" cards={list.map(r=>({path:r.esPath,name:r.name,icon:'law' as const,line:firstSentence(r.answer,130)}))}/>
  </Band>;})}
  <QA id="faq" title="Preguntas sobre las reglas del fútbol" faq={H.faq}/>
  <KeepReading lang="es" groups={[{id:'related',links:[{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1,line:ES_HUBS.terms.blurb},{path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1,line:ES_HUBS.positions.blurb}]}]}/>
  <EsGuideEnd cta={false}/>
 </>;
}
export function RuleEsPage({r}:{r:EsRule}){
 const H=ES_HUBS.rules,crumbs=esLibCrumbs({name:H.crumb,path:H.path},{name:r.name,path:r.esPath}),all=ES_RULES(),quiz=ruleQuizEs(r);
 const i=all.findIndex(x=>x.slug===r.slug),next=[all[(i+1)%all.length],all[(i+2)%all.length]];
 /* Nov 20 2026 (SEO leftovers): the rule's coach tool, its terms and a sister rule come first, as in English (lib/i18n/es/crossLinks.ts) */
 const cross=esRuleCrossLinks(r.slug),fresh=(l:{path:string})=>!cross.some(x=>x.path===l.path);
 const related=[...cross,...links(r.links).filter(fresh),...next.filter(x=>fresh({path:x.esPath})).map(x=>({path:x.esPath,name:x.h1,line:`${x.law}, con diagrama`})),{path:H.path,name:'Todas las reglas del fútbol para niños',line:H.blurb},{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1,line:ES_HUBS.terms.blurb}];
 const cards=r.slug==='yellow-and-red-cards';/* Nov 16 2026: lib/i18n/es/cardRules.ts */
 const play=isRulePlaySlug(r.slug)?RULE_PLAY_ES[r.slug]:null;/* Nov 16 2026: lib/i18n/es/rulePlay.ts */
 const moving=(ANIMATED_RULES as readonly string[]).includes(r.slug),futsal=r.slug==='futsal-rules',pair=r.scenes.length>1,last=r.scenes.length-1,F=H.futsalVsSoccer;
 const deck=cards?{id:CARD_RULES_ES.deck.id,n:cardDeckOf(CARD_RULES_ES).slides.length}:play?{id:play.deck.id,n:play.slides.length}:null;
 /* visual pass Nov 17 2026: the same key facts as the English page (app/(site)/learn/soccer-rules/[slug]/page.tsx) */
 const facts:Fact[]=[{icon:'law',label:'Regla',value:r.law},{icon:'steps',label:'Confusiones comunes',value:`${r.mixups.length} aclaradas`,href:'#mixups'},
  deck?{icon:cards?'cards':'deck',label:'Tarjetas para voltear',value:`${deck.n} para probar`,href:`#${deck.id}`}:{icon:'diagram',label:'Diagrama',value:moving?'Un dibujo que se mueve':'Un dibujo de la cancha',href:'#diagram'},
  {icon:'quiz',label:'Prueba rápida',value:`${quiz.length} preguntas`,href:'#quiz'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd({...articleLd({headline:r.title,path:r.esPath,description:r.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${r.name} (regla de fútbol)`,teaches:r.answer,image:diagramUrl(r.picture)}),hasPart:guideQuizPart({path:r.esPath,name:`Prueba: ${r.name}`,questions:quiz})})}/>
  <JsonLd data={faqLd(r.faq)}/>
  <EsIntro top rail={<RailNav rail={guideRail('rules',[...(cards?['cards']:[]),...(futsal?['futsal-vs-soccer']:[])],true,play)} current="#top"/>} onward={onwardFor(r.cta,true)} crumbs={crumbs} h1={r.h1} lead={r.answer} more={cards?<CardRulesPages c={CARD_RULES_ES}/>:undefined} facts={facts}/>
  <EsPrintSheet path={r.esPath} what={cards?'hoja de las tarjetas':'hoja de la regla'} has={cards?'las 14 faltas de tarjeta y la tabla de amarilla o roja':undefined}/>
  {cards&&<CardRulesTop c={CARD_RULES_ES}/>}
  {play&&<RulePlayDeck c={play}/>}
  <Section id="diagram" title={`${r.name}: diagrama`}>
   {pair
    ?<div className={styles.pair}>{r.scenes.map((s,j)=><div key={s.title}><h3 className={styles.h3}>{s.title}</h3><EsSceneDiagram id={`s${j}`} scene={s} small image={j===last?diagramUrl(r.picture):undefined} animate={moving?`pase: ${s.title.toLowerCase()}`:undefined}/></div>)}</div>
    :<EsSceneDiagram id="s0" scene={r.scenes[0]} image={diagramUrl(r.picture)} animate={moving?r.name.toLowerCase():undefined}/>}
  </Section>
  {cards&&<CardRulesGame c={CARD_RULES_ES} lang="es"/>}
  {play&&<RulePlayGame c={play} lang="es"/>}
  <Section id="referee" title="Lo que mira el árbitro">
   <Bullets items={r.refs}/>
   <p className={styles.caption}>Regla: {r.law}. {futsal?<a href={FUTSAL_LAWS_URL} rel="noopener">Reglas de Juego de Futsal de la FIFA 2025-26 (en inglés)</a>:<a href={r.lawUrl} rel="noopener">Léela en las Reglas de Juego (IFAB, en inglés)</a>}.</p>
  </Section>
  <Section id="mixups" title="Confusiones comunes">
   <ul className={styles.stack}>{r.mixups.map(m=><li key={m.said} className={styles.card}><h3 className={styles.h3}>{m.said}</h3><p>{m.truth}</p></li>)}</ul>
  </Section>
  <Section id="formats" title={futsal?'El futsal de un vistazo':'En 7v7, 9v9, 11v11 y futsal'} fold={!futsal}>
   <DataTable label={`${r.name} según el tipo de partido`} head={[futsal?'Tema':'Partido',futsal?'Regla de futsal':'Cómo funciona la regla']} rows={r.formats}/>
   <p className={styles.caption}>{H.leagueLine} {H.sourceLine.replace('{date}',longDateEs(FAMILY_CHECKED.rules))}</p>
  </Section>
  {futsal&&<Section id="futsal-vs-soccer" title={F.title}>
   <DataTable label={F.title} head={F.head} rows={F.rows}/>
   <p className={styles.caption}>{F.note}</p>
  </Section>}
  <QA id="faq" title={`Preguntas sobre: ${r.name.toLowerCase()}`} faq={r.faq} more={cards?CARD_RULES_ES.side.items:undefined}>
   {cards&&<CardRulesSources c={CARD_RULES_ES} checked={`Revisado el ${longDateEs(FAMILY_CHECKED.rules)}.`}/>}
  </QA>
  <EsCoachNotes name={r.name} notes={r.notes}/>
  <GuideQuiz id="quiz" name={r.name.toLowerCase()} questions={quiz} lang="es"/>
  <KeepReading lang="es" groups={withMesh([{id:'lessons',label:'Lección',icon:'steps',links:esLessonLinks(r.lessons)},{id:'drills',label:'Ejercicio',icon:'cone',links:esDrillLinksFor(r.path)},{id:'related',links:related}],r.path,'es')}/>
  <EsGuideEnd checked={FAMILY_CHECKED.rules} lessonId={r.cta?.id}/>
  <EsReadNext order={esOrder('rules')} path={r.esPath}/>
 </>;
}

// ---- terms ------------------------------------------------------------------------------------------------------------------
export function TermsHubEsPage(){
 const H=ES_HUBS.terms,crumbs=esLibCrumbs({name:H.crumb,path:H.path}),terms=ES_TERMS();
 const entries=GLOSSARY.map(g=>{const e=H.glossary[g.id];if(!e)throw new Error(`Spanish glossary entry ${g.id} is missing`);
  const to=g.to?(hasEs(g.to)?toEs(g.to):null):null;return {id:g.id,term:e.term,def:e.def,to};})
  .sort((a,b)=>a.term.localeCompare(b.term,'es'));
 const letterOf=(t:string)=>t.normalize('NFD')[0].toUpperCase();
 const letters=[...new Set(entries.map(e=>letterOf(e.term)))].sort((a,b)=>a.localeCompare(b,'es')).map(letter=>({letter,terms:entries.filter(e=>letterOf(e.term)===letter)}));
 const setLd={'@context':'https://schema.org','@type':'DefinedTermSet','@id':abs(H.path)+'#terms',name:H.h1,description:H.description,url:abs(H.path),inLanguage:'es',
  hasDefinedTerm:entries.map(g=>({'@type':'DefinedTerm',name:g.term,description:g.def,url:abs(g.to&&g.to.startsWith(H.path+'/')?g.to:`${H.path}#${g.id}`),inDefinedTermSet:abs(H.path)+'#terms'}))};
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={setLd}/>
  <JsonLd data={faqLd(H.faq)}/>
  <EsIntro top rail={<RailNav rail={hubRail('Términos en esta página',[{items:letters.map(l=>({href:`#letra-${l.letter.toLowerCase()}`,name:l.letter}))},{items:[sec('pages','Términos con diagrama')]}],true)} current="#top"/>} crumbs={crumbs} h1={H.h1} lead={H.lead} more={H.more} cta/>
  <Section id="az" title="Salta a una letra">
   <p>{letters.map((l,i)=><span key={l.letter}>{i>0&&' · '}<a href={`#letra-${l.letter.toLowerCase()}`}>{l.letter}</a></span>)}</p>
  </Section>
  {letters.map(l=><Section key={l.letter} id={`letra-${l.letter.toLowerCase()}`} title={l.letter}>
   <ul>{l.terms.map(g=><li key={g.id} id={g.id}><b>{g.term}.</b> {g.def}{g.to&&<> <a href={g.to}>Ver la página</a>.</>}</li>)}</ul>
  </Section>)}
  <Section id="pages" title="Términos con diagrama"><LinkList ids="term" links={terms.map(t=>({path:t.esPath,name:t.name,line:t.short}))}/></Section>
  <QA id="faq" title="Preguntas sobre las palabras del fútbol" faq={H.faq}/>
  <KeepReading lang="es" groups={[{id:'related',links:[{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:ES_HUBS.rules.blurb},{path:ES_HUBS.positions.path,name:ES_HUBS.positions.h1,line:ES_HUBS.positions.blurb}]}]}/>
  <EsGuideEnd cta={false}/>
 </>;
}
export function TermEsPage({t}:{t:EsTerm}){
 const H=ES_HUBS.terms,all=ES_TERMS(),crumbs=esLibCrumbs({name:H.crumb,path:H.path},{name:t.name,path:t.esPath}),quiz=termQuizEs(t,all);
 /* Nov 20 2026 (SEO leftovers): the term's rule and coach tool come first, as in English (lib/i18n/es/crossLinks.ts) */
 const cross=esTermCrossLinks(t.slug);
 const related=[...cross,...links(t.links??[]).filter(l=>!cross.some(x=>x.path===l.path)),...t.related.map(s=>all.find(x=>x.slug===s)!).map(x=>({path:x.esPath,name:x.name,line:x.short})),
  {path:H.path,name:'Todos los términos del fútbol, de la A a la Z',line:H.blurb},{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:ES_HUBS.rules.blurb}];
 const rel=t.related.map(s=>all.find(x=>x.slug===s)).find(Boolean);
 const facts:Fact[]=[t.also?{icon:'tag',label:'Otros nombres',value:t.also}:{icon:'diagram',label:'Diagrama',value:'Un dibujo de la cancha',href:'#diagram'},
  t.howFact?{icon:'steps',label:t.howFact.label,value:t.howFact.value,href:'#how'}:{icon:'steps',label:'Cómo funciona',value:`${t.how.length} pasos`,href:'#how'},
  ...(rel?[{icon:'link' as const,label:'Término relacionado',value:rel.name,href:rel.esPath}]:[]),{icon:'quiz',label:'Prueba rápida',value:`${quiz.length} preguntas`,href:'#quiz'}];
 const see=t.links?[...links(t.links),...(rel?[{path:rel.esPath,name:rel.h1}]:[])]:[];/* card pages (Nov 18 2026), as in English */
 const more=see.length?<>Lee también: {see.map((l,i)=><span key={l.path}>{i>0?' · ':''}<a href={l.path}>{l.name}</a></span>)}</>:undefined;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd({...articleLd({headline:t.title,path:t.esPath,description:t.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${t.name} (término de fútbol)`,teaches:t.answer,image:diagramUrl(t.picture)}),hasPart:guideQuizPart({path:t.esPath,name:`Prueba: ${t.name}`,questions:quiz})})}/>
  <JsonLd data={{'@context':'https://schema.org','@type':'DefinedTerm',name:t.name,description:t.short,url:abs(t.esPath),inLanguage:'es',inDefinedTermSet:abs(H.path)+'#terms',...(t.also?{alternateName:t.also.split(', ')}:{})}}/>
  <JsonLd data={faqLd(t.faq)}/>
  <EsIntro top rail={<RailNav rail={guideRail('terms',[],true)} current="#top"/>} onward={onwardFor(t.cta,true)} crumbs={crumbs} h1={t.h1} lead={t.answer} more={more} facts={facts}/>
  <Section id="diagram" title={`${t.name}: diagrama`}><EsSceneDiagram id="s0" scene={t.scene} image={diagramUrl(t.picture)} animate={(ANIMATED_TERMS as readonly string[]).includes(t.slug)?t.name.toLowerCase():undefined}/></Section>
  <Section id="how" title={t.howTitle}><ol>{t.how.map(h=><li key={h}>{h}</li>)}</ol></Section>
  <Section id="mistakes" title="Errores comunes"><Bullets items={t.mistakes}/></Section>
  <Section id="formats" title="En 7v7, 9v9, 11v11 y futsal" fold><p>{t.formats}</p></Section>
  <QA id="faq" title={`Preguntas sobre: ${t.name.toLowerCase()}`} faq={t.faq}/>
  <EsCoachNotes name={t.name} notes={t.notes}/>
  <GuideQuiz id="quiz" name={t.name.toLowerCase()} questions={quiz} lang="es"/>
  <KeepReading lang="es" groups={withMesh([{id:'lessons',label:'Lección',icon:'steps',links:esLessonLinks(t.lessons)},{id:'drills',label:'Ejercicio',icon:'cone',links:esDrillLinksFor(t.path)},{id:'related',links:related}],t.path,'es')}/>
  <EsGuideEnd checked={FAMILY_CHECKED.terms} lessonId={t.cta?.id}/>
  <EsReadNext order={esOrder('terms')} path={t.esPath}/>
 </>;
}

// ---- positions --------------------------------------------------------------------------------------------------------------
function EsDiagram({id,format,lines,what,mark,markName,image}:{id:string;format:'7v7'|'9v9'|'11v11'|'futsal';lines:Parameters<typeof esLines>[0];what:string;mark?:string;markName?:string;image?:string}){
 const es=esLines(lines),desc=describeEs({format,what,lines:es,highlight:markName});
 return <figure className={styles.figure}>
  <div className={styles.art}><PitchDiagram id={id} format={format} spots={place(es,'base')} arrows={[]} title={what[0].toUpperCase()+what.slice(1)} desc={desc} mark={mark}/></div>
  <figcaption className={styles.caption}>{desc}{image&&<> <a href={image}>Abre este diagrama como imagen</a>.</>}</figcaption>
 </figure>;
}
export function PositionsHubEsPage(){
 const H=ES_HUBS.positions,crumbs=esLibCrumbs({name:H.crumb,path:H.path}),all=ES_POSITIONS(),full=formationBySlug('11v11-4-3-3')!;
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd(collectionLd({name:H.h1,path:H.path,description:H.description,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,items:all.map(p=>({name:p.name,path:p.esPath}))}))}/>
  <JsonLd data={faqLd(H.faq)}/>
  <EsIntro top rail={<RailNav rail={hubRail('Posiciones en esta página',[{title:'Cada posición',items:all.map(p=>anchor('position',p.esPath,p.name))}],true)} current="#top"/>} crumbs={crumbs} h1={H.h1} lead={H.lead} cta/>
  <Section id="pitch" title="Las once posiciones en una cancha">
   <EsDiagram id="all" format="11v11" lines={full.lines} what="las once posiciones del fútbol en una formación 4-3-3" image={formationImage(full.slug)}/>
   <ul>{H.lines.map(l=><li key={l.name}><b>{l.name}.</b> {l.text}</li>)}</ul>
  </Section>
  <Band id="each" title="Cada posición explicada" tone="tint" icon="shirt" count={`${all.length} posiciones`}>
   <CardGrid lang="es" ids="position" show={all.length} cards={all.map(p=>({path:p.esPath,name:`${p.name} (${p.short})`,line:p.job,icon:'shirt' as const,badge:shirtBadge(p.numbers)}))}/>
  </Band>
  <Section id="numbers" title="Los números de las posiciones, del 1 al 11">
   <Bullets items={H.numbers}/>
   <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Números de las posiciones"><table className={styles.table}>
    <thead><tr><th scope="col">Número</th><th scope="col">Posición</th><th scope="col">Tarea</th></tr></thead>
    <tbody>{NUMBERS.map((n,i)=><tr key={n.n} data-number={n.n}><th scope="row">{n.n}</th><td><a href={posName(n.slug)?.esPath??toEs(`/learn/soccer-positions/${n.slug}`)}>{H.numberRows[i].name}</a></td><td>{H.numberRows[i].line}</td></tr>)}</tbody>
   </table></div>
  </Section>
  <Section id="formats" title="Cómo cambian las posiciones en 7v7, 9v9 y 11v11">
   <ul className={styles.stack}>{(['7v7','9v9','11v11'] as const).map((f,i)=>{const fm=ES_FORMATIONS().find(x=>x.slug===POS_FORMATS[i])!,g=esFormatGuide(f);return <li key={f} className={styles.card}><h3 className={styles.h3}>{f}</h3><p>{H.formats[i].text}</p>
    <p><a href={fm.esPath}>Mira la formación {fm.name}</a> o <a href={g.esPath}>compara las formaciones de {f}</a>.</p></li>;})}</ul>
   <p>{H.futsal} <a href={toEs('/learn/soccer-formations/futsal-3-1')}>Mira el 3-1 de futsal</a>.</p>
  </Section>
  <QA id="faq" title="Preguntas sobre las posiciones" faq={H.faq}/>
  <KeepReading lang="es" groups={[{id:'compare',links:ES_COMPARISONS().filter(c=>c.kind==='position').map(c=>({path:c.esPath,name:c.h1,line:c.answer.split('. ')[0]+'.'}))},{id:'related',links:[{path:ES_HUBS.formations.path,name:ES_HUBS.formations.h1,line:ES_HUBS.formations.blurb},{path:ES_HUBS.rules.path,name:ES_HUBS.rules.h1,line:ES_HUBS.rules.blurb},{path:ES_HUBS.terms.path,name:ES_HUBS.terms.h1,line:ES_HUBS.terms.blurb}]}]}/>
  <EsGuideEnd cta={false}/>
 </>;
}
export function PositionEsPage({p}:{p:EsPosition}){
 const H=ES_HUBS.positions,all=ES_POSITIONS(),f=formationBySlug(p.diagram)!,lower=p.name.toLowerCase();
 const crumbs=esLibCrumbs({name:H.crumb,path:H.path},{name:p.name,path:p.esPath}),quiz=positionQuizEs(p,all,SUITS_OPEN);
 const used=ES_FORMATIONS().filter(x=>x.lines.some(l=>l.spots.some(s=>s.pos===p.slug))),compare=ES_COMPARISONS().filter(c=>c.links.slice(0,2).some(l=>l.path===p.path));
 const facts:Fact[]=[{icon:'shirt',label:'Número de camiseta',value:p.numbers,href:'#number'},{icon:'tag',label:'Nombre corto',value:p.short},
  {icon:'lineup',label:'Dónde',value:`Diagrama ${f.shape}`,href:'#where'},{icon:'quiz',label:'Prueba rápida',value:`${quiz.length} preguntas`,href:'#quiz'}];
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={esLd({...articleLd({headline:p.title,path:p.esPath,description:p.desc,published:SITE_UPDATED.guides,modified:SITE_UPDATED.guides,about:`${p.name} (posición de fútbol)`,teaches:p.job,image:positionImage(p.slug)}),hasPart:guideQuizPart({path:p.esPath,name:`Prueba: ${p.name}`,questions:quiz})})}/>
  <JsonLd data={faqLd(p.faq)}/>
  <EsIntro top rail={<RailNav rail={guideRail('positions',[],true)} current="#top"/>} onward={onwardFor(p.lessons[0],true)} crumbs={crumbs} h1={p.h1} lead={p.answer} more={p.suits} facts={facts}/>
  <Section id="where" title={`Dónde se coloca: ${lower}`}>
   <EsDiagram id="where-d" format={f.format} lines={f.lines} what={`la posición de ${lower} en una formación ${f.shape}`} mark={p.slug} markName={lower} image={positionImage(p.slug)}/>
   <p>{p.where}</p>
  </Section>
  <Section id="with" title="Con el balón"><Bullets items={p.withBall}/></Section>
  <Section id="without" title="Sin el balón"><Bullets items={p.withoutBall}/></Section>
  <Section id="habits" title="Tres hábitos para practicar">
   <ol className={styles.stack}>{p.habits.map(h=><li key={h.name} className={styles.card}><h3 className={styles.h3}>{h.name}</h3><p>{h.how}</p></li>)}</ol>
  </Section>
  <Section id="number" title={`Número de camiseta: ${p.numbers}`}>
   <p>{p.numberLine} Los números son una costumbre de cuando los titulares usaban del 1 al 11. Hoy los jugadores pueden usar cualquier número.</p>
  </Section>
  <Section id="small" title="En 7v7, 9v9 y futsal" fold><p>{p.small}</p></Section>
  <QA id="faq" title={`Preguntas sobre: ${lower}`} faq={p.faq}/>
  <EsCoachNotes name={p.name} notes={p.notes}/>
  <GuideQuiz id="quiz" name={lower} questions={quiz} lang="es"/>
  {/* batch 3, Nov 17 2026: as English, one "Sigue leyendo" grid (every link kept) */}
  <KeepReading lang="es" groups={withMesh([{id:'lessons',label:'Lección',icon:'steps',links:esLessonLinks(p.lessons)},
   {id:'formations',label:'Formación',icon:'lineup',links:used.length>0?[...used.map(x=>({path:x.esPath,name:`Formación ${x.name}`,line:x.roles.find(r=>r.pos===p.slug)?.title??x.best})),{path:ES_HUBS.formations.path,name:'Todas las formaciones de fútbol',line:ES_HUBS.formations.blurb}]:[]},
   {id:'drills',label:'Ejercicio',icon:'cone',links:esDrillLinksFor(p.path)},
   {id:'terms',links:positionTermSlugs(p.slug).map(s=>ES_TERMS().find(x=>x.slug===s)!).map(x=>({path:x.esPath,name:`${x.name} (término)`,line:x.short}))},/* Nov 22 2026, as in English */
   {id:'compare',label:'Comparar',icon:'swap',links:compare.map(c=>({path:c.esPath,name:c.h1,line:c.answer.split('. ')[0]+'.'}))},
   {id:'related',label:'Posición',icon:'shirt',links:[...all.filter(x=>x.slug!==p.slug).map(x=>({path:x.esPath,name:x.name,line:`Número ${x.numbers}`})),{path:H.path,name:'Todas las posiciones del fútbol',line:H.blurb}]}],p.path,'es')}/>
  <EsGuideEnd checked={FAMILY_CHECKED.positions} lessonId={p.lessons[0]?.id}/>
  <EsReadNext order={esOrder('positions')} path={p.esPath}/>
 </>;
}
