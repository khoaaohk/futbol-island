import type {Chapter} from '@/lib/paths/riso/story';

/** timing.json written by scripts/plays/kokoro-narrate.py (voice kokoro_af_bella). */
export type NarrationTiming={voice:string;speed:number;chapters:{label:string;text:string;src:string;seconds:number;words:{w:string;at:number}[]}[]};

const norm=(w:string)=>w.toLowerCase().replace(/[^a-z0-9]/g,'');
/**
 * Applies measured narration to a film's chapters: each chapter gets its audio clip and real length, and every
 * cue's `at` becomes the onset of its first word in the recording (matched in order, so repeated words stay put).
 * Chapters/cues without a match keep their authored values, so a script edit never breaks a film.
 */
export function withTiming(chapters:Chapter[],timing?:NarrationTiming|null):Chapter[]{
 if(!timing?.chapters?.length)return chapters;
 return chapters.map((chapter,i)=>{
  const t=timing.chapters[i];if(!t)return chapter;
  let from=0;
  const cues=chapter.cues.map(cue=>{
   const first=norm(cue.words.split(/\s+/)[0]??'');if(!first)return cue;
   // Kokoro splits contractions and dashed words ("Here’s" → Here + ’s, "one–nil" → one + nil), so a cue's first
   // word may span several recorded tokens: join consecutive tokens while they still spell its start.
   for(let k=from;k<t.words.length;k++){
    let acc=norm(t.words[k].w),j=k;if(!acc||!first.startsWith(acc))continue;
    while(acc!==first&&j+1<t.words.length&&first.startsWith(acc)){j++;acc+=norm(t.words[j].w);}
    if(acc===first){from=j+1;return {...cue,at:t.words[k].at};}
   }
   return cue;
  });
  return {...chapter,audio:t.src,seconds:t.seconds,cues};
 });
}
