import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import VideoThumbs from '@/components/site/videos/VideoThumbs';
import {allWatchVideos,isPortrait,VIDEO_GROUPS,VIDEOS_PATH,VIDEOS_UPDATED,videoCrumbs} from '@/lib/site/videos';
import {NumberWord} from '@/lib/numberWord';
import {breadcrumbLd,collectionLd,pageMeta} from '@/lib/site/seo';
import site from '../site.module.css';
import tgt from '@/components/site/railTarget.module.css';
import RailNav from '@/components/site/shell/RailNav';
import {FactTable,type FactRow} from '@/components/site/FactTable';
import {videosHubRail} from '@/lib/site/railNavCollections';

/** /videos (lib/site/videos.ts, Nov 18 2026): every clip on the site, each linked to its own watch page. Static, no script. */
export const dynamic='force-static';
const VIDEOS_TITLE='Soccer Game Videos for Kids: Gameplay Clips';
const DESC='Short gameplay clips from Futbol Island, a free football game for kids: the arcade games, the 3D island, and the lessons and quizzes.';
export const metadata=pageMeta(VIDEOS_TITLE,DESC,VIDEOS_PATH,{type:'website'});
/** SEO batch F (Nov 25 2026, owner: hubs get a clear "what's here" table): each group, how many clips, and where they lead. */
function whatsHere(all:ReturnType<typeof allWatchVideos>):FactRow[]{
 return [...VIDEO_GROUPS.filter(g=>all.some(v=>v.group===g.id)).map(g=>{const n=all.filter(v=>v.group===g.id).length;
   return {label:g.title,value:<><a href={`#g-${g.id}`}>{n} {n===1?'clip':'clips'}</a>: {g.line.replace(/\.$/,'')}</>};}),
  {label:'Every clip',value:'Its own watch page: a short clip with no sound, what it shows, and the game or lesson it comes from'},
  {label:'Play what you watch',value:<><a href="/games">The free soccer games</a>, the <a href="/learn/lessons">lessons</a> and <a href="/play">the island</a>, all in the browser</>}];
}
export default function VideosHub(){
 const all=allWatchVideos(),crumbs=videoCrumbs();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:'Futbol Island videos',path:VIDEOS_PATH,description:DESC,published:VIDEOS_UPDATED,modified:VIDEOS_UPDATED,items:all.map(v=>({name:v.title,path:v.path}))})}/>
  {/* layout batch 3 (Nov 20 2026; owner: "it should list what's on that page to smooth scroll down"): Back to the Library, Overview
      and the three groups */}
  <RailNav rail={videosHubRail()} current="#top"/>
  <header className={site.intro} id="top">
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={site.title}>Futbol Island videos</h1>
   <p className={site.lead}>{NumberWord(all.length)} short clips of real play: the arcade games, the island and the football lessons. Each one has its own page.</p>
   <p><a className={site.cta} href="/play">Play Futbol Island</a></p>
  </header>
  <FactTable id="whats-here" title="What’s in the videos" label="What is in the Futbol Island videos" head={['Videos','What you find']} rows={whatsHere(all)}/>
  {VIDEO_GROUPS.map(g=>{const vs=all.filter(v=>v.group===g.id);return vs.length?<section key={g.id} className={site.section} aria-labelledby={`g-${g.id}`}>
   <h2 className={`${site.h2} ${tgt.target}`} id={`g-${g.id}`}>{g.title}</h2>
   <p>{g.line}</p>
   {/* tall phone clips and wide island clips in their own rows, so every picture in a row has the same shape */}
   <VideoThumbs videos={vs.filter(v=>!isPortrait(v))}/>
   <VideoThumbs videos={vs.filter(isPortrait)}/>
  </section>:null;})}
 </>;
}
