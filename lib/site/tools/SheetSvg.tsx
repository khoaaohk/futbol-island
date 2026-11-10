import type {Item,Sheet} from './sheet';
/**
 * A sheet (lib/site/tools/sheet.ts) as inline SVG. No hooks and no effects, so it renders on the server for the printable
 * pages and inside the client tools alike. `<title>` and `<desc>` are the text alternative.
 */
export function SheetItem({i}:{i:Item}){
 if(i.t==='rect')return <rect x={i.x} y={i.y} width={i.w} height={i.h} rx={i.rx} fill={i.fill??'none'} stroke={i.stroke} strokeWidth={i.stroke?i.sw:undefined} strokeDasharray={i.dash} opacity={i.op}/>;
 if(i.t==='line')return <line x1={i.x1} y1={i.y1} x2={i.x2} y2={i.y2} stroke={i.stroke} strokeWidth={i.sw} strokeDasharray={i.dash}/>;
 if(i.t==='circle')return <circle cx={i.cx} cy={i.cy} r={i.r} fill={i.fill??'none'} stroke={i.stroke} strokeWidth={i.stroke?i.sw:undefined}/>;
 if(i.t==='poly')return <polyline points={i.pts.map(p=>p.join(',')).join(' ')} fill="none" stroke={i.stroke} strokeWidth={i.sw}/>;
 return <text x={i.x} y={i.y} fontSize={i.size} fontWeight={i.weight} fill={i.fill} textAnchor={i.anchor}>{i.text}</text>;
}
export default function SheetSvg({id,sheet,className}:{id:string;sheet:Sheet;className?:string}){
 return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby={`${id}-t ${id}-d`} viewBox={`0 0 ${sheet.w} ${sheet.h}`} width={sheet.w} height={sheet.h} className={className} data-sheet="" fontFamily="Arial,Helvetica,sans-serif">
  <title id={`${id}-t`}>{sheet.title}</title>
  <desc id={`${id}-d`}>{sheet.desc}</desc>
  <rect width={sheet.w} height={sheet.h} fill={sheet.bg}/>
  {sheet.items.map((i,n)=><SheetItem key={n} i={i}/>)}
 </svg>;
}
