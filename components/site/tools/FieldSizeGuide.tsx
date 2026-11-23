'use client';
import {useMemo,useState} from 'react';
import {FORMATS,FT,buildOutAt,clampSize,conePlan,defaultSize,diagonal,show,showGoal,type ConeStep,type FieldFormat,type FormatId,type Unit} from '@/lib/site/tools/fieldSizes';
import {whoPlays} from '@/lib/site/tools/moreToolTables';
import s from './newTools.module.css';
import m from './moreTools.module.css';
/**
 * The youth soccer field size guide (Nov 22 2026; /tools/youth-soccer-field-size-guide and its Spanish twin). Every number is
 * from lib/site/tools/fieldSizes.ts (sourced there). The field is one inline SVG drawn to scale from the chosen length and
 * width, redrawn only when an input changes; no timers, no storage. Server-rendered with the 7v7 example.
 */
type Std='us'|'fa';
const W={
 en:{example:'Example',format:'Format',unit:'Units',yd:'Yards',m:'Metres',std:'Standard',us:'US',fa:'England',length:'Length',width:'Width',range:'Allowed range',goal:'Goal',goalMax:'largest allowed',goalRec:'recommended',
  ball:'Ball',size:(b:string)=>b==='futsal'?'Futsal ball, 62 to 64 cm round':`Size ${b}`,keepers:'Goalkeepers',yes:'Yes',no:'No (4v4 has no goalkeepers)',penalty:'Penalty area',goalArea:'Goal area',mark:'Penalty mark',circle:'Center circle radius',buildOut:'Build-out line',
  fromGoal:'from each goal line',deep:'deep',wide:'wide',noMarks:'No penalty or goal area is set for this format: play with cones for goals or small goals and no penalty kicks.',faMarks:'The FA’s table gives no markings for this size; use your league’s.',
  cones:'Mark it with cones',total:(n:number)=>`${n} cones in all, plus spares for the goals and the bench.`,show:'Show cones on the drawing',field:(l:string,w:string)=>`Field drawn to scale, ${l} long and ${w} wide`,
  ft:'ft',
  desc:(f:FieldFormat,fmt:(v:number)=>string,c:boolean)=>`A ${f.id} field seen from above with the halfway line${f.circle?' and center circle':''}${f.penaltyArea?`, penalty areas ${fmt(f.penaltyArea.depth)} deep and ${fmt(f.penaltyArea.width)} wide`:''}${f.buildOut?' and dashed build-out lines':''}, and a goal at each end.${c?' Orange triangles mark where the cones go.':''}`,
  step:(st:ConeStep,fmt:(v:number)=>string,goal:string):string=>{const a=st.a??0,b=st.b??0;switch(st.id){
   case 'corners':return `Put a cone on the first corner. Walk ${fmt(a)} along the touchline for the second; turn and walk ${fmt(b)} along the goal line for the third; then ${fmt(a)} back for the fourth.`;
   case 'square':return `Check the corners are square: both diagonals should measure ${fmt(diagonal(a,b))}. If one is longer, move a corner until they match.`;
   case 'halfway':return `Halfway line: a cone on each touchline ${fmt(a)} from the goal line, and one in the middle for the kick-off.`;
   case 'goals':return st.cones?`Goals: put small goals in the middle of each goal line, at most ${goal} wide, or two cones for each goal.`:`Goals: set a goal in the middle of each goal line (${goal} wide).`;
   case 'penalty':return `Penalty areas: on each goal line put a cone ${fmt(b)} in from each corner, then one ${fmt(a)} straight out from each of those.`;
   case 'goalArea':return `Goal areas: one cone at each corner of the box, ${fmt(a)} out from the goal line and ${fmt(b)} in from each touchline.`;
   case 'marks':return `Penalty marks: a flat cone ${fmt(a)} out from the middle of each goal${st.b?`, and a second mark ${fmt(b)} out`:''}.`;
   case 'buildOut':return `Build-out lines: a cone on each touchline ${fmt(a)} from each goal line, in a different colour.`;
   default:return `Center circle: four flat cones ${fmt(a)} from the center: in front, behind and to each side.`;}}},
 es:{example:'Ejemplo',format:'Modalidad',unit:'Unidades',yd:'Yardas',m:'Metros',std:'Norma',us:'EE. UU.',fa:'Inglaterra',length:'Largo',width:'Ancho',range:'Rango permitido',goal:'Arco',goalMax:'máximo',goalRec:'recomendado',
  ball:'Balón',size:(b:string)=>b==='futsal'?'Balón de futsal, de 62 a 64 cm':`Talla ${b}`,keepers:'Porteros',yes:'Sí',no:'No (el 4v4 no tiene porteros)',penalty:'Área penal',goalArea:'Área chica',mark:'Punto penal',circle:'Radio del círculo central',buildOut:'Línea de salida',
  fromGoal:'de cada línea de meta',deep:'de fondo',wide:'de ancho',noMarks:'Esta modalidad no tiene área penal ni de meta: se juega con arcos pequeños o conos y sin penales.',faMarks:'La tabla de The FA no da marcas para esta medida; usa las de tu liga.',
  cones:'Márcala con conos',total:(n:number)=>`${n} conos en total, más algunos de repuesto para los arcos y el banco.`,show:'Mostrar los conos en el dibujo',field:(l:string,w:string)=>`Cancha dibujada a escala, de ${l} de largo y ${w} de ancho`,
  ft:'pies',
  desc:(f:FieldFormat,fmt:(v:number)=>string,c:boolean)=>`Una cancha de ${f.id} vista desde arriba con la línea media${f.circle?' y el círculo central':''}${f.penaltyArea?`, áreas penales de ${fmt(f.penaltyArea.depth)} de fondo y ${fmt(f.penaltyArea.width)} de ancho`:''}${f.buildOut?' y líneas de salida discontinuas':''}, y un arco en cada extremo.${c?' Los triángulos naranjas marcan dónde van los conos.':''}`,
  step:(st:ConeStep,fmt:(v:number)=>string,goal:string):string=>{const a=st.a??0,b=st.b??0;switch(st.id){
   case 'corners':return `Pon un cono en la primera esquina. Camina ${fmt(a)} por la banda para el segundo; gira y camina ${fmt(b)} por la línea de meta para el tercero; y ${fmt(a)} de vuelta para el cuarto.`;
   case 'square':return `Comprueba que las esquinas son rectas: las dos diagonales deben medir ${fmt(diagonal(a,b))}. Si una es más larga, mueve una esquina hasta que coincidan.`;
   case 'halfway':return `Línea media: un cono en cada banda a ${fmt(a)} de la línea de meta y otro en el centro para el saque.`;
   case 'goals':return st.cones?`Arcos: pon arcos pequeños en el centro de cada línea de meta, de ${goal} de ancho como máximo, o dos conos por arco.`:`Arcos: coloca un arco en el centro de cada línea de meta (${goal} de ancho).`;
   case 'penalty':return `Áreas penales: en cada línea de meta pon un cono a ${fmt(b)} de cada esquina y otro a ${fmt(a)} hacia dentro desde cada uno.`;
   case 'goalArea':return `Áreas chicas: un cono en cada esquina del área, a ${fmt(a)} de la línea de meta y a ${fmt(b)} de cada banda.`;
   case 'marks':return `Puntos penales: un cono plano a ${fmt(a)} del centro de cada arco${st.b?`, y un segundo punto a ${fmt(b)}`:''}.`;
   case 'buildOut':return `Líneas de salida: un cono en cada banda a ${fmt(a)} de cada línea de meta, de otro color.`;
   default:return `Círculo central: cuatro conos planos a ${fmt(a)} del centro: delante, detrás y a cada lado.`;}}},
};
/** The format as the chosen standard defines it (England's sizes for 7v7 and 9v9 carry no markings). */
function asStd(f:FieldFormat,std:Std):FieldFormat{if(std!=='fa'||!f.alt)return f;const a=f.alt;
 return {id:f.id,unit:a.unit,ages:{en:a.ages},length:a.length,width:a.width,recommended:a.recommended,goal:a.goal,ball:a.ball,keepers:true,sources:['fa']};}
export default function FieldSizeGuide({lang}:{lang?:'es'}){
 const L=lang==='es'?'es':'en',w=W[L];
 const [id,setId]=useState<FormatId>('7v7'),[std,setStd]=useState<Std>('us'),[unit,setUnit]=useState<Unit>('yd'),[cones,setCones]=useState(true);
 const base=FORMATS.find(x=>x.id===id)!,f=asStd(base,std);
 const [size,setSize]=useState(()=>defaultSize(f)),[touched,setTouched]=useState(false);
 const pick=(nid:FormatId,nstd:Std=std)=>{const nf=asStd(FORMATS.find(x=>x.id===nid)!,nstd);setId(nid);setStd(nstd);setSize(defaultSize(nf));setUnit(nf.unit);setTouched(true);};
 const {length:Lx,width:Wx}=clampSize(f,size.length,size.width);
 const fu=f.unit,num=(v:number)=>{const x=show(v,fu,unit);return L==='es'?String(x).replace('.',','):String(x);},fmt=(v:number)=>`${num(v)} ${unit}`;
 const goalW=showGoal(f.goalRec?.w??f.goal.w,f.goal.u,unit),goalH=showGoal(f.goalRec?.h??f.goal.h,f.goal.u,unit),gU=unit==='yd'?w.ft:'m';
 const nf=(v:number)=>L==='es'?String(v).replace('.',','):String(v),goalTxt=`${nf(goalW)} x ${nf(goalH)} ${gU}`;
 const plan=useMemo(()=>conePlan(f,Lx,Wx),[f,Lx,Wx]);
 // drawing: length along x. Goal width in the field's unit.
 const gw0=f.goalRec?.w??f.goal.w,gw=f.goal.u==='m'?gw0:f.unit==='yd'?gw0/3:gw0*FT;
 const VW=1000,pad=58,sc=(VW-pad*2)/Lx,VH=Math.round(Wx*sc+pad*2),X=(v:number)=>pad+v*sc,Y=(v:number)=>pad+v*sc,cy=Wx/2;
 const pts:[number,number][]=[];if(cones){pts.push([0,0],[Lx,0],[0,Wx],[Lx,Wx],[Lx/2,0],[Lx/2,Wx],[Lx/2,cy]);
  if(f.penaltyArea){const p=f.penaltyArea,b=(Wx-p.width)/2;for(const x of [0,Lx]){const d=x?Lx-p.depth:p.depth;pts.push([x,b],[x,Wx-b],[d,b],[d,Wx-b]);}}
  if(f.goalArea){const g=f.goalArea,b=(Wx-g.width)/2;pts.push([g.depth,b],[g.depth,Wx-b],[Lx-g.depth,b],[Lx-g.depth,Wx-b]);}
  if(f.penaltyMark){pts.push([f.penaltyMark,cy],[Lx-f.penaltyMark,cy]);if(f.secondMark)pts.push([f.secondMark,cy],[Lx-f.secondMark,cy]);}
  if(f.buildOut&&f.penaltyArea){const b=buildOutAt(Lx,f.penaltyArea.depth);pts.push([b,0],[b,Wx],[Lx-b,0],[Lx-b,Wx]);}
  if(f.circle)pts.push([Lx/2-f.circle,cy],[Lx/2+f.circle,cy],[Lx/2,cy-f.circle],[Lx/2,cy+f.circle]);
  if(f.id==='4v4'||f.id==='5v5')pts.push([0,cy-gw/2],[0,cy+gw/2],[Lx,cy-gw/2],[Lx,cy+gw/2]);}
 const line={fill:'none',stroke:'#fbf7ee',strokeWidth:3};
 const futsalArea=(end:0|1)=>{const p=f.penaltyArea!,r=p.depth,half=(p.width-2*r)/2,x0=end?X(Lx):X(0),dir=end?-1:1,ya=Y(cy-half),yb=Y(cy+half),R=r*sc;
  return `M${x0} ${ya-R} A${R} ${R} 0 0 ${end?0:1} ${x0+dir*R} ${ya} L${x0+dir*R} ${yb} A${R} ${R} 0 0 ${end?0:1} ${x0} ${yb+R}`;};
 const fieldLabel=w.field(fmt(Lx),fmt(Wx));
 return <div className={s.tool} data-tool="">
  <div className={m.fieldLayout}>
  <div className={`${s.panel} ${s.noPrint}`}>
   <div className={m.field}><span className={s.label} id="fs-format">{w.format}</span>
    <div className={m.chipSet} role="group" aria-labelledby="fs-format">{FORMATS.map(x=><button key={x.id} type="button" aria-pressed={id===x.id} onClick={()=>pick(x.id,x.alt?std:'us')}>{x.id==='futsal'?'Futsal':x.id}</button>)}</div>
    <p className={s.hint}>{whoPlays(f,L)}</p></div>
   <div className={s.grid}>
    {base.alt&&<div className={m.field}><span className={s.label} id="fs-std">{w.std}</span><div className={s.seg} role="group" aria-labelledby="fs-std">{(['us','fa'] as const).map(x=><button key={x} type="button" aria-pressed={std===x} onClick={()=>pick(id,x)}>{w[x]}</button>)}</div></div>}
    <div className={`${m.field} ${base.alt?'':s.wide}`}><span className={s.label} id="fs-unit">{w.unit}</span><div className={s.seg} role="group" aria-labelledby="fs-unit">{(['yd','m'] as const).map(x=><button key={x} type="button" aria-pressed={unit===x} onClick={()=>setUnit(x)}>{w[x]}</button>)}</div></div>
   </div>
   <label className={s.label}>{w.length}: {fmt(Lx)}<input className={m.range} type="range" min={f.length[0]} max={f.length[1]} step={1} value={Lx} onChange={e=>{setSize({length:Number(e.target.value),width:Wx});setTouched(true);}}/></label>
   <label className={s.label}>{w.width}: {fmt(Wx)}<input className={m.range} type="range" min={f.width[0]} max={f.width[1]} step={1} value={Wx} onChange={e=>{setSize({length:Lx,width:Number(e.target.value)});setTouched(true);}}/></label>
  </div>
  <figure className={m.pitchWrap}>
   {!touched&&<span className={`${s.example} ${m.pitchTag}`}>{w.example}</span>}
   <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-labelledby="fs-t fs-d" className={m.pitch}>
    <title id="fs-t">{fieldLabel}</title><desc id="fs-d">{w.desc(f,fmt,cones)}</desc>
    <rect x="0" y="0" width={VW} height={VH} fill="#2f7d4a" rx="18"/>
    <rect x={X(0)} y={Y(0)} width={Lx*sc} height={Wx*sc} {...line}/>
    <line x1={X(Lx/2)} y1={Y(0)} x2={X(Lx/2)} y2={Y(Wx)} {...line}/>
    {f.circle&&<circle cx={X(Lx/2)} cy={Y(cy)} r={f.circle*sc} {...line}/>}
    {f.penaltyArea&&(f.id==='futsal'?<><path d={futsalArea(0)} {...line}/><path d={futsalArea(1)} {...line}/></>:<>
     <rect x={X(0)} y={Y((Wx-f.penaltyArea.width)/2)} width={f.penaltyArea.depth*sc} height={f.penaltyArea.width*sc} {...line}/>
     <rect x={X(Lx-f.penaltyArea.depth)} y={Y((Wx-f.penaltyArea.width)/2)} width={f.penaltyArea.depth*sc} height={f.penaltyArea.width*sc} {...line}/></>)}
    {f.goalArea&&<><rect x={X(0)} y={Y((Wx-f.goalArea.width)/2)} width={f.goalArea.depth*sc} height={f.goalArea.width*sc} {...line}/>
     <rect x={X(Lx-f.goalArea.depth)} y={Y((Wx-f.goalArea.width)/2)} width={f.goalArea.depth*sc} height={f.goalArea.width*sc} {...line}/></>}
    {f.penaltyMark&&<><circle cx={X(f.penaltyMark)} cy={Y(cy)} r="4" fill="#fbf7ee"/><circle cx={X(Lx-f.penaltyMark)} cy={Y(cy)} r="4" fill="#fbf7ee"/></>}
    {f.buildOut&&f.penaltyArea&&[buildOutAt(Lx,f.penaltyArea.depth),Lx-buildOutAt(Lx,f.penaltyArea.depth)].map(x=><line key={x} x1={X(x)} y1={Y(0)} x2={X(x)} y2={Y(Wx)} stroke="#ffd451" strokeWidth="3" strokeDasharray="12 10"/>)}
    {[0,Lx].map(x=><rect key={x} x={x?X(Lx):X(0)-Math.max(10,1.5*sc)} y={Y(cy-gw/2)} width={Math.max(10,1.5*sc)} height={gw*sc} fill="#fbf7ee" opacity=".9"/>)}
    {pts.map(([x,y],i)=><path key={i} d={`M${X(x)} ${Y(y)-9}l8 14h-16z`} fill="#ff7a1a" stroke="#14221d" strokeWidth="1.5"/>)}
    <text x={VW/2} y={VH-12} textAnchor="middle" fill="#fbf7ee" fontSize="26" fontWeight="800">{fmt(Lx)}</text>
    <text x={VW-18} y={VH/2} textAnchor="middle" dominantBaseline="middle" fill="#fbf7ee" fontSize="24" fontWeight="800" transform={`rotate(90 ${VW-18} ${VH/2})`}>{fmt(Wx)}</text>
   </svg>
   <label className={`${s.check} ${s.noPrint}`}><input type="checkbox" checked={cones} onChange={e=>setCones(e.target.checked)}/>{w.show}</label>
  </figure>
  </div>
  <dl className={m.specs}>
   <div><dt>{w.range}</dt><dd>{num(f.length[0])}-{num(f.length[1])} x {num(f.width[0])}-{num(f.width[1])} {unit}</dd></div>
   <div><dt>{w.goal}</dt><dd>{goalTxt}{f.goalRec?` (${w.goalRec}; ${w.goalMax} ${nf(showGoal(f.goal.w,f.goal.u,unit))} x ${nf(showGoal(f.goal.h,f.goal.u,unit))} ${gU})`:''}</dd></div>
   <div><dt>{w.ball}</dt><dd>{w.size(f.ball)}</dd></div>
   <div><dt>{w.keepers}</dt><dd>{f.keepers?w.yes:w.no}</dd></div>
   {f.penaltyArea&&<div><dt>{w.penalty}</dt><dd>{fmt(f.penaltyArea.depth)} {w.deep}, {fmt(f.penaltyArea.width)} {w.wide}</dd></div>}
   {f.goalArea&&<div><dt>{w.goalArea}</dt><dd>{fmt(f.goalArea.depth)} {w.deep}, {fmt(f.goalArea.width)} {w.wide}</dd></div>}
   {f.penaltyMark&&<div><dt>{w.mark}</dt><dd>{fmt(f.penaltyMark)}{f.secondMark?` · ${fmt(f.secondMark)}`:''}</dd></div>}
   {f.circle&&<div><dt>{w.circle}</dt><dd>{fmt(f.circle)}</dd></div>}
   {f.buildOut&&f.penaltyArea&&<div><dt>{w.buildOut}</dt><dd>{fmt(buildOutAt(Lx,f.penaltyArea.depth))} {w.fromGoal}</dd></div>}
  </dl>
  {!f.penaltyArea&&<p className={s.hint}>{std==='fa'?w.faMarks:w.noMarks}</p>}
  <div className={s.panel}>
   <h3>{w.cones}</h3>
   <ol className={m.steps}>{plan.steps.map(st=><li key={st.id}>{w.step(st,fmt,`${nf(goalW)} ${gU}`)}</li>)}</ol>
   <p className={s.summaryLine}>{w.total(plan.total)}</p>
  </div>
 </div>;
}
