/** Offline voice replacements retain the authored visual timeline.
 * Character/caption anchors include offline tempo adjustment and map media time to art. */
import {chapterStarts,resolveFrame,type RisoFrame,type RisoStory,type HeadlineSpec} from './story';
export type TimeMap=number[][]; // [authored seconds, replacement seconds]
type Clip={audio:string;seconds:number;map:TimeMap};
export type NarrationOverride={mode:'chapters';clips:Clip[]}|{mode:'track';src:string;duration:number;map:TimeMap};

export function mapNarrationTime(time:number,points:TimeMap,inverse=false){
 const x=inverse?1:0,y=inverse?0:1;
 if(time<=points[0][x])return points[0][y];
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(time<=b[x])return a[y]+(b[y]-a[y])*(time-a[x])/(b[x]-a[x]);}
 return points[points.length-1][y];
}
function headline(h:HeadlineSpec|undefined,at:(t:number)=>number):HeadlineSpec|undefined{
 return h&&typeof h!=='string'?{...h,at:at(h.at??0)}:h;
}
export function withNarration(story:RisoStory,override?:NarrationOverride):RisoStory{
 if(!override||override.mode!==story.audio.mode)return story;
 let result:RisoStory;
 let toOriginal:(frame:RisoFrame)=>RisoFrame;
 if(override.mode==='chapters'){
  if(override.clips.length!==story.chapters.length)return story;
  const starts=chapterStarts(story);
  result={...story,chapters:story.chapters.map((ch,i)=>{const clip=override.clips[i],at=(t:number)=>mapNarrationTime(t,clip.map);return{...ch,audio:clip.audio,seconds:clip.seconds,cues:ch.cues.map(c=>({...c,at:at(c.at)})),headline:headline(ch.headline,at)};})};
  toOriginal=f=>{const t=starts[f.chapter]+mapNarrationTime(f.chapterTime,override.clips[f.chapter].map,true);return{...f,time:t,...resolveFrame(story,t,f.chapter)};};
 }else{
  const at=(t:number)=>mapNarrationTime(t,override.map),starts=chapterStarts(story);
  result={...story,audio:{mode:'track',src:override.src,duration:override.duration},chapters:story.chapters.map((ch,i)=>{const start=starts[i],mapped=at(start),relative=(t:number)=>at(start+t)-mapped;return{...ch,start:mapped,seconds:at(starts[i+1]??(story.audio.mode==='track'?story.audio.duration:0))-mapped,cues:ch.cues.map(c=>({...c,at:relative(c.at)})),headline:headline(ch.headline,relative)};}),visualChapters:story.visualChapters?.map(ch=>{const start=at(ch.start),relative=(t:number)=>at(ch.start+t)-start;return{...ch,start,cues:ch.cues?.map(c=>({...c,at:relative(c.at)})),headline:headline(ch.headline,relative)};})};
  toOriginal=f=>{const t=mapNarrationTime(f.time,override.map,true);return{...f,time:t,...resolveFrame(story,t,f.chapter)};};
 }
 result.draw=f=>story.draw(toOriginal(f));
 if(story.touch)result.touch=(s,x,y,age,seed,f)=>story.touch!(s,x,y,age,seed,f?toOriginal(f):undefined);
 return result;
}
