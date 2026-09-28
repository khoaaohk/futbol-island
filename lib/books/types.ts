/** Shared shape for every player pop-up book. Facts are attributed; coaching prompts are ours, not quotations. */
export type BookPage={id:string;year:string;title:string;text:string;lesson:string;prompt:string;response:string;
 /** Taps needed to complete the page's paper action (default 1). */
 steps?:number;source:number|null};
export type BookData={title:string;subtitle:string;itemId:string;player:string;sources:readonly {label:string;url:string}[];pages:readonly BookPage[]};
