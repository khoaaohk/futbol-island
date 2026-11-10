import JsonLd from '@/components/seo/JsonLd';
import {QA} from '@/components/site/LessonHub';
import {Licence,SheetThumb,ToolIntro} from '@/components/site/tools/ToolParts';
import {GuideEnd,LinkList,Section} from '@/lib/site/GuideParts';
import {breadcrumbLd,collectionLd,faqLd,pageMeta} from '@/lib/site/seo';
import {PRINTABLES} from '@/lib/site/tools/printables';
import {LINEUP_PATH,PLANNER_PATH,PRINTABLES_HUB,TOOL_PAGES,TOOLS_UPDATED,toolCrumbs} from '@/lib/site/tools/registry';
import site from '../../site.module.css';
import t from '@/components/site/tools/tools.module.css';

/** The printables hub (lib/site/tools/printables.ts): every sheet with a preview and a link to its own page. Static, no client code. */
export const dynamic='force-static';
const H=PRINTABLES_HUB;
export const metadata=pageMeta(H.title,H.description,H.path,{whole:true,type:'website',image:{url:TOOL_PAGES.find(p=>p.path===H.path)!.image!,alt:'A blank 11v11 soccer field diagram'}});
const GROUPS=[{id:'fields',title:'Blank field templates',kind:'template',line:'One page for each game. Every page has portrait and landscape sheets, plain, with thirds and with zones.'},
 {id:'cheat-sheets',title:'Formation cheat sheets',kind:'cheat-sheet',line:'All the shapes of one game on a single page, with the player numbers on the dots.'},
 {id:'positions',title:'Positions and numbers',kind:'positions',line:'The numbers 1 to 11 and the position each one stands for.'}] as const;
export default function PrintablesHub(){
 const crumbs=toolCrumbs({name:H.crumb,path:H.path});
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:H.h1,path:H.path,description:H.description,published:TOOLS_UPDATED,modified:TOOLS_UPDATED,items:PRINTABLES.map(p=>({name:p.h1,path:p.path}))})}/>
  <JsonLd data={faqLd(H.faq)}/>
  <ToolIntro crumbs={crumbs} h1={H.h1} lead={H.lead}/>
  {GROUPS.map(g=><Section key={g.id} id={g.id} title={g.title}>
   <p>{g.line}</p>
   <ul className={t.thumbs}>{PRINTABLES.filter(p=>p.kind===g.kind).map(p=><li key={p.slug}><a href={p.path} aria-label={p.h1}><SheetThumb file={p.files[0]}/></a><b><a href={p.path}>{p.crumb}</a></b><span className={site.caption}>{p.blurb}</span></li>)}</ul>
  </Section>)}
  <Section id="terms" title="Free to print and share"><Licence/><p>Each sheet is drawn in black on white to save ink and carries a small futbolisland.app credit. Print as many copies as your team needs, post them on a club page or hand them out at a coaching course.</p></Section>
  <QA id="faq" title="Questions about the field diagrams" faq={H.faq}/>
  <Section id="related" title="Tools that use the same fields"><LinkList links={[{path:LINEUP_PATH,name:'Soccer lineup builder',line:'Put your players’ names on a field and print it'},{path:PLANNER_PATH,name:'Soccer playing time calculator',line:'A fair substitution plan with equal minutes'},
   {path:'/learn/soccer-formations',name:'Soccer formations',line:'Every formation explained, with a diagram'},{path:'/learn/soccer-field-size-by-age',name:'Soccer field size by age',line:'Field, goal and game length for each age group'}]}/></Section>
  <GuideEnd/>
 </>;
}
