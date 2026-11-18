import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import VideoThumbs from '@/components/site/videos/VideoThumbs';
import {allWatchVideos,isPortrait,VIDEO_GROUPS,VIDEOS_PATH,VIDEOS_UPDATED,videoCrumbs} from '@/lib/site/videos';
import {NumberWord} from '@/lib/numberWord';
import {breadcrumbLd,collectionLd,pageMeta} from '@/lib/site/seo';
import site from '../site.module.css';

/** /videos (lib/site/videos.ts, Nov 18 2026): every clip on the site, each linked to its own watch page. Static, no script. */
export const dynamic='force-static';
const VIDEOS_TITLE='Soccer Game Videos for Kids: Gameplay Clips';
const DESC='Short gameplay clips from Futbol Island, a free football game for kids: the arcade games, the 3D island, and the lessons and quizzes.';
export const metadata=pageMeta(VIDEOS_TITLE,DESC,VIDEOS_PATH,{type:'website'});
export default function VideosHub(){
 const all=allWatchVideos(),crumbs=videoCrumbs();
 return <>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <JsonLd data={collectionLd({name:'Futbol Island videos',path:VIDEOS_PATH,description:DESC,published:VIDEOS_UPDATED,modified:VIDEOS_UPDATED,items:all.map(v=>({name:v.title,path:v.path}))})}/>
  <header className={site.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={site.title}>Futbol Island videos</h1>
   <p className={site.lead}>{NumberWord(all.length)} short clips of real play: the arcade games, the island and the football lessons. Each one has its own page.</p>
   <p><a className={site.cta} href="/play">Play Futbol Island</a></p>
  </header>
  {VIDEO_GROUPS.map(g=>{const vs=all.filter(v=>v.group===g.id);return vs.length?<section key={g.id} className={site.section} aria-labelledby={`g-${g.id}`}>
   <h2 className={site.h2} id={`g-${g.id}`}>{g.title}</h2>
   <p>{g.line}</p>
   {/* tall phone clips and wide island clips in their own rows, so every picture in a row has the same shape */}
   <VideoThumbs videos={vs.filter(v=>!isPortrait(v))}/>
   <VideoThumbs videos={vs.filter(isPortrait)}/>
  </section>:null;})}
 </>;
}
