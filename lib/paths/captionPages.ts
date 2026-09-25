export type CaptionPage={text:string;start:number;end:number};
/** Two measured lines per page; timing follows each page's share of the paragraph. */
export function captionPages(text:string,width:number,measure:(text:string)=>number):CaptionPage[]{
 const words=text.trim().split(/\s+/).filter(Boolean),lines:string[]=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(line&&measure(next)>width){lines.push(line);line=word;}else line=next;}
 if(line)lines.push(line);
 const total=words.reduce((n,w)=>n+w.length+1,0)||1,pages:CaptionPage[]=[];let used=0;
 for(let i=0;i<lines.length;i+=2){const text=lines.slice(i,i+2).join('\n'),start=used/total;used+=text.replace('\n',' ').length+1;pages.push({text,start,end:Math.min(1,used/total)});}
 return pages;
}
