/** Display vocabulary only: never apply to IDs, URLs, storage keys, or events. */
export const pathText=(text:string)=>text.replace(/\b(?:soccer|football)\b/gi,'futbo');
