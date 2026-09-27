import type {Chapter} from '@/lib/paths/riso/story';

/** timing.json written by scripts/plays/kokoro-narrate.py (voice kokoro_af_bella). */
export type NarrationTiming={voice:string;speed:number;chapters:{label:string;text:string;src:string;seconds:number;words:{w:string;at:number}[]}[]};

/** Case, accents (é → e), apostrophes, hyphens and punctuation never decide a match: "Güler’s" → "gulers". */
const norm=(w:string)=>w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9]/g,'');
/**
 * Applies measured narration to a film's chapters: each chapter gets its audio clip and real length, and every
 * cue's `at` becomes the onset of its first word in the recording (matched in order, so repeated words stay put).
 * The whole cue phrase is matched where possible, so a cue starting with a common word ("the keeper", "He runs")
 * lands on its own occurrence, not an earlier "the"/"he"; a cue whose phrase is not found falls back to its first
 * word alone. Chapters/cues without a match keep their authored values, so a script edit never breaks a film.
 */
export function withTiming(chapters:Chapter[],timing?:NarrationTiming|null):Chapter[]{
 if(!timing?.chapters?.length)return chapters;
 return chapters.map((chapter,i)=>{
  const t=timing.chapters[i];if(!t)return chapter;
  const toks=t.words.map(w=>norm(w.w));
  let from=0;
  // Kokoro splits contractions and dashed words ("Here’s" → Here + ’s, "one–nil" → one + nil), so a cue's first
  // word may span several recorded tokens: join consecutive tokens while they still spell it. Returns the index
  // after the first word's last token, or -1.
  const firstAt=(k:number,first:string)=>{
   let acc=toks[k],j=k;if(!acc||!first.startsWith(acc))return -1;
   while(acc!==first&&j+1<toks.length&&first.startsWith(acc)){j++;acc+=toks[j];}
   return acc===first?j+1:-1;
  };
  // the rest of the cue must follow on: the recorded tokens from k spell the whole phrase (its last word may be
  // the start of a longer token, e.g. cue "A throw" on "A throw-in").
  const phraseAt=(k:number,phrase:string)=>{let acc='';for(let j=k;j<toks.length&&acc.length<phrase.length;j++)acc+=toks[j];return acc.startsWith(phrase);};
  const cues=chapter.cues.map(cue=>{
   const parts=cue.words.split(/\s+/).map(norm).filter(Boolean),first=parts[0]??'';if(!first)return cue;
   const phrase=parts.join('');
   for(const whole of phrase!==first?[true,false]:[false])for(let k=from;k<toks.length;k++){
    const end=firstAt(k,first);if(end<0||(whole&&!phraseAt(k,phrase)))continue;
    from=end;return {...cue,at:t.words[k].at};
   }
   return cue;
  });
  return {...chapter,audio:t.src,seconds:t.seconds,cues};
 });
}
