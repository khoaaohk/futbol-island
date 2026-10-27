/** Display vocabulary only: never apply to IDs, URLs, storage keys, or events. */
export const pathText=(text:string)=>text.replace(/\b(?:soccer|football)\b/gi,'futbo');
/** The full stop an accessible label needs after a title, unless the title already ends a sentence ("Carry or Pass?", "…unfair."). */
export const endStop=(title:string)=>/[.!?]$/.test(title.trim())?'':'.';
