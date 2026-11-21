import ClipPlay from '@/components/site/ClipPlay';
import rt from './railTarget.module.css';
import {guideVideo} from '@/lib/site/guideVideos';
import {learnUrl} from '@/lib/site/learnMedia';
import {watchPathFor} from '@/lib/site/videos';
import site from '@/app/(site)/site.module.css';
/**
 * "See it in the game" (seo-extras, Nov 15 2026): a guide page's short game clip (lib/site/guideVideos.ts). Renders nothing for a
 * page without a clip, so templates can call it with one line. The poster is a plain lazy <img>; the <video> is only created when
 * the reader taps Play (ClipPlay), so nothing downloads and nothing plays on its own. Nov 18 2026: the clip's VideoObject lives on
 * its watch page (/videos/<slug>, lib/site/videos.ts), linked from the caption, so each video has one home for search.
 */
export default function GuideVideo({path}:{path:string}){
 const v=guideVideo(path);if(!v)return null;
 const id=`clip-${v.key}`,watch=watchPathFor(v.key);
 return <section className={site.section} aria-labelledby={id} data-guide-video={v.key}>
  <h2 className={`${site.h2} ${rt.target}`} id={id}>See it in the game</h2>
  <ClipPlay name={v.name} poster={learnUrl(v.poster)} webm={v.webm&&learnUrl(v.webm)} mp4={learnUrl(v.mp4!)} width={v.width} height={v.height} describedBy={`${id}-d`}/>
  <p className={site.caption} id={`${id}-d`}>{v.description} {v.seconds} seconds, no sound.{watch&&<> <a href={watch} data-watch-link="">Watch the full clip</a></>}</p>
 </section>;
}
