import {place,type GuideFormat,type Line} from '../pitch';
import {base64url,cleanName} from './rotation';
import {CREDIT,dotItems,fieldItems,GRASS,LETTER,wrapText,type Item,type Sheet,type Theme} from './sheet';
/**
 * The lineup builder's state and its link code (Nov 10 2026, /tools/soccer-lineup-builder). Pure data, shared by the client
 * component (components/site/tools/LineupBuilder.tsx) and tests/seo-tools.cjs. It must stay light: it never imports
 * lib/site/formations.ts (that module reads the lesson catalog from disk); the page passes the shapes in as a prop
 * (lib/site/tools/shapes.ts).
 * Privacy: a lineup lives in the browser only. "Copy link" writes it into the URL FRAGMENT (#l=...), which browsers never send
 * to a server, so names reach nobody but the people the coach gives the link to. Nothing here calls the network.
 */
export type Shape={slug:string;format:GuideFormat;shape:string;lines:Line[]};
export type Lineup={f:string;team:string;note:string;on:string[];bench:string[]};
export const MAX_BENCH=14,MAX_NOTE=280;
export const DEFAULT_FORMATION:Record<GuideFormat,string>={'7v7':'7v7-2-3-1','9v9':'9v9-3-2-3','11v11':'11v11-4-3-3',futsal:'futsal-1-2-1-diamond'};
export const shapeLabel=(s:Shape)=>s.shape==='1-2-1'?'1-2-1 diamond':s.shape;
export const spotsOf=(s:Shape)=>place(s.lines);
const find=(shapes:readonly Shape[],slug:unknown)=>shapes.find(s=>s.slug===slug);
const text=(s:unknown,max:number)=>String(s??'').replace(/[\u0000-\u0009\u000b-\u001f\u007f<>]/g,' ').trim().slice(0,max);
export const emptyLineup=(s:Shape):Lineup=>({f:s.slug,team:'',note:'',on:spotsOf(s).map(()=>''),bench:[]});
/** Make any object a valid lineup (shared links and localStorage are untrusted input). */
export function cleanLineup(l:Partial<Lineup>|null|undefined,shapes:readonly Shape[]):Lineup|null{
 const s=l?find(shapes,l.f):undefined;if(!l||!s)return null;
 const n=spotsOf(s).length,on=Array.isArray(l.on)?l.on.slice(0,n).map(cleanName):[];while(on.length<n)on.push('');
 return {f:s.slug,team:cleanName(l.team),note:text(l.note,MAX_NOTE),on,bench:Array.isArray(l.bench)?l.bench.slice(0,MAX_BENCH).map(cleanName):[]};
}
export const encodeLineup=(l:Lineup)=>base64url.encode(JSON.stringify([1,l.f,l.team,l.note,l.on,l.bench]));
export function decodeLineup(code:string,shapes:readonly Shape[]):Lineup|null{
 try{const a=JSON.parse(base64url.decode(code));if(!Array.isArray(a)||a[0]!==1)return null;return cleanLineup({f:a[1],team:a[2],note:a[3],on:a[4],bench:a[5]},shapes);}catch{return null;}
}
/** What a page link can carry after `#`: a whole lineup (`l=`) or just a formation to start from (`f=`). */
export function readHash(hash:string,shapes:readonly Shape[]):Lineup|null{
 const m=/(?:^|[#&])(l|f)=([^&]+)/.exec(hash);if(!m)return null;
 if(m[1]==='l')return decodeLineup(m[2],shapes);
 const s=find(shapes,m[2]);return s?emptyLineup(s):null;
}
/** Change the shape and keep the squad: names fill the new spots in order, the rest wait on the bench. */
export function withFormation(l:Lineup,s:Shape):Lineup{
 const n=spotsOf(s).length,all=[...l.on,...l.bench],on=all.slice(0,n);while(on.length<n)on.push('');
 return {...l,f:s.slug,on,bench:all.slice(n).filter(Boolean).slice(0,MAX_BENCH)};
}
export type Ref={k:'on'|'bench';i:number};
export const sameRef=(a:Ref|null,b:Ref|null)=>!!a&&!!b&&a.k===b.k&&a.i===b.i;
/** Swap two players (two spots, two bench places, or one of each). A bench place left empty by the swap is removed. */
export function swap(l:Lineup,a:Ref,b:Ref):Lineup{
 const on=[...l.on],bench=[...l.bench],get=(r:Ref)=>(r.k==='on'?on:bench)[r.i]??'',set=(r:Ref,v:string)=>{(r.k==='on'?on:bench)[r.i]=v;};
 const x=get(a),y=get(b);set(a,y);set(b,x);
 return {...l,on,bench:Array.from(bench,v=>v??'').filter(Boolean).slice(0,MAX_BENCH)};
}
export const lineupTitle=(l:Lineup,s:Shape)=>`${l.team||'Lineup'}: ${shapeLabel(s)} (${s.format})`;
/**
 * The lineup as one US Letter sheet: the pitch with a name under every dot, the bench, the match note and a small credit.
 * `theme` GRASS is the picture a coach downloads; INK is the black-on-white print.
 */
export function lineupSheet(l:Lineup,s:Shape,theme:Theme=GRASS):Sheet{
 const {w,h}=LETTER.portrait,T=theme,items:Item[]=[],spots=spotsOf(s);
 const fmt=s.format==='futsal'?'Futsal':`${s.format} soccer`;
 items.push({t:'text',x:50,y:78,text:(l.team||'Our lineup').slice(0,30),size:40,fill:T.ink,weight:700},
  {t:'text',x:50,y:112,text:`${fmt} · ${shapeLabel(s)} formation`,size:20,fill:T.soft});
 const field=fieldItems(s.format,{x:50,y:140,w:520,h:860},{theme:T,sw:2.5});
 items.push(...field.items);
 const r=s.format==='11v11'?22:25;
 spots.forEach((p,i)=>{const [x,y]=field.at(p.x,p.y);items.push(...dotItems(x,y,{n:p.n,label:(l.on[i]||p.label).slice(0,14),keeper:i===0,r,theme:T,size:16}));});
 const cx=610;let y=168;
 items.push({t:'text',x:cx,y,text:'Bench',size:22,fill:T.ink,weight:700});y+=14;
 const bench=l.bench.filter(Boolean);
 if(!bench.length){y+=22;items.push({t:'text',x:cx,y,text:'No substitutes listed',size:16,fill:T.soft});}
 for(const b of bench){y+=26;items.push({t:'text',x:cx,y,text:b,size:18,fill:T.ink});}
 y+=50;items.push({t:'text',x:cx,y,text:'Match notes',size:22,fill:T.ink,weight:700});y+=10;
 const lines=wrapText(l.note,24,Math.max(2,Math.floor((960-y)/24)));
 if(lines.length)for(const ln of lines){y+=24;items.push({t:'text',x:cx,y,text:ln,size:16,fill:T.ink});}
 else for(let i=0;i<5;i++){y+=34;items.push({t:'line',x1:cx,y1:y,x2:w-50,y2:y,stroke:T.soft,sw:1});}
 items.push({t:'text',x:w-50,y:h-48,text:`Made with ${CREDIT}`,size:14,fill:T.soft,weight:700,anchor:'end'});
 const who=spots.map((p,i)=>`${p.label}: ${l.on[i]||'not named'}`).join(', ');
 return {w,h,bg:T.page,title:lineupTitle(l,s),desc:`${fmt} lineup in a ${shapeLabel(s)} formation. ${who}.${bench.length?` Bench: ${bench.join(', ')}.`:''}`,items};
}
