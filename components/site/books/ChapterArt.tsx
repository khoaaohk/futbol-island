import type {ReactNode} from 'react';
import type {Motif} from '@/lib/site/books';
import s from './books.module.css';
/**
 * One flat paper picture per chapter (books pages and the web reader, Nov 17 2026). Original drawings in the island books'
 * riso colours: flat fills, one dark key line, no gradients, no people's faces, no crests. No hooks and no script, so the
 * server page and the lazy reader share it. `amount` / `steps` is the reader's paper action (the page shows it done): each
 * motif moves one or two parts with a CSS transform (books.module.css .move, which reduced motion turns off).
 * A new book adds motifs here, one per chapter idea, and names them in lib/site/books.ts.
 */
const K='#22302a',SKY='#cfe5e4',GRASS='#79ad6c',PITCH='#2f7a5c',GOLD='#f2b632',RED='#d9573f',WHITE='#fffaf0',WALL='#e6c79a',ROOF='#c8664a',BLUE='#3d6aa6',WOOD='#b07a45';
const line={stroke:K,strokeWidth:3,strokeLinejoin:'round' as const,strokeLinecap:'round' as const};
function Ball({x,y,r=11}:{x:number;y:number;r?:number}){
 return <g><circle cx={x} cy={y} r={r} fill={WHITE} {...line}/><path d={`M${x} ${y-r*.45}l${r*.43} ${r*.31}-${r*.16} ${r*.5}h-${r*.54}l-${r*.16}-${r*.5}Z`} fill={K}/></g>;
}
const DRAW:Record<Motif,(done:boolean,amount:number)=>ReactNode>={
 /* Jardim Irene: a street of small houses, a ball that rolls down it */
 street:done=><>
  <rect x={0} y={0} width={240} height={160} fill={SKY}/>
  <circle cx={200} cy={34} r={16} fill={GOLD} {...line}/>
  {[[18,62,52,'#e9a35b'],[82,50,60,WALL],[150,66,56,'#9cc3d6']].map(([x,y,w,c])=><g key={x as number}>
   <rect x={x as number} y={y as number} width={w as number} height={124-(y as number)} fill={c as string} {...line}/>
   <path d={`M${(x as number)-6} ${y} L${(x as number)+(w as number)/2} ${(y as number)-22} L${(x as number)+(w as number)+6} ${y}Z`} fill={ROOF} {...line}/>
   <rect x={(x as number)+(w as number)/2-8} y={98} width={16} height={26} fill={K}/>
   <rect x={(x as number)+8} y={(y as number)+12} width={12} height={12} fill={WHITE} {...line}/></g>)}
  <rect x={0} y={124} width={240} height={36} fill={'#c9b48e'}/>
  <path d="M0 124h240" {...line}/>
  <g className={`${s.move} ${s.mvBall}`}><Ball x={30} y={136}/></g>
 </>,
 /* five trials, five cards that each say NO */
 cards:(_done,amount)=><>
  <rect x={0} y={0} width={240} height={160} fill={'#f4dcc4'}/>
  {[0,1,2,3,4].map(i=>{const flipped=amount>i,x=18+i*42,rot=(i-2)*5;
   return <g key={i} transform={`rotate(${rot} ${x+20} 110)`}><g className={`${s.move} ${s.mvCard}`} data-on={flipped||undefined}>
    <rect x={x} y={44} width={40} height={60} rx={5} fill={flipped?WHITE:BLUE} {...line}/>
    {flipped?<text x={x+20} y={83} textAnchor="middle" fontSize={20} fontWeight={800} fill={RED} fontFamily="system-ui,sans-serif">NO</text>
     :<circle cx={x+20} cy={74} r={9} fill={GOLD} {...line}/>}
   </g></g>;})}
  <path d="M30 136h180" stroke={K} strokeWidth={6} strokeLinecap="round"/>
 </>,
 /* the club gate that finally opens on a pitch */
 gate:done=><>
  <rect x={0} y={0} width={240} height={160} fill={SKY}/>
  <rect x={60} y={40} width={120} height={98} fill={PITCH}/>
  <path d="M120 40v98M60 96h120" stroke={WHITE} strokeWidth={3}/>
  <circle cx={120} cy={96} r={14} fill="none" stroke={WHITE} strokeWidth={3}/>
  <rect x={0} y={30} width={60} height={130} fill={WALL} {...line}/><rect x={180} y={30} width={60} height={130} fill={WALL} {...line}/>
  <rect x={50} y={18} width={140} height={20} rx={4} fill={RED} {...line}/>
  {[[60,'left'],[120,'right']].map(([x,side])=><g key={side as string} className={`${s.move} ${side==='left'?s.mvGateL:s.mvGateR}`}>
   <rect x={x as number} y={40} width={60} height={98} fill="none" {...line}/>
   {[0,1,2,3].map(j=><path key={j} d={`M${(x as number)+8+j*15} 40v98`} {...line}/>)}
   <path d={`M${x} 64h60M${x} 116h60`} {...line}/></g>)}
  <rect x={0} y={138} width={240} height={22} fill={GRASS}/>
 </>,
 /* right-back: run outside the winger, on the overlap */
 overlap:done=><>
  <rect x={0} y={0} width={240} height={160} fill={PITCH}/>
  <path d="M8 8h224v144H8ZM120 8v144" fill="none" stroke={WHITE} strokeWidth={3} opacity={.85}/>
  <circle cx={120} cy={80} r={22} fill="none" stroke={WHITE} strokeWidth={3} opacity={.85}/>
  <path d="M60 128 C100 150 160 150 196 120" fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray="10 8" strokeLinecap="round"/>
  <path d="M196 120l-14 2 8 10Z" fill={GOLD}/>
  <g><circle cx={150} cy={104} r={11} fill={WHITE} {...line}/><path d="M139 104h22" stroke={RED} strokeWidth={4}/></g>
  <Ball x={164} y={88} r={7}/>
  <g className={`${s.move} ${s.mvRun}`}><circle cx={60} cy={128} r={11} fill={GOLD} {...line}/></g>
 </>,
 /* the final: a substitute comes on from the bench */
 swap:done=><>
  <rect x={0} y={0} width={240} height={160} fill={SKY}/>
  <rect x={0} y={96} width={240} height={64} fill={GRASS}/>
  <path d="M0 96h240" stroke={WHITE} strokeWidth={4}/>
  <rect x={20} y={60} width={90} height={36} rx={6} fill={'#9cc3d6'} {...line}/>
  <rect x={28} y={82} width={74} height={10} fill={WOOD} {...line}/>
  <g transform="translate(150 22)"><rect x={0} y={0} width={66} height={44} rx={6} fill={K}/>
   <path d="M18 30V12m-8 8 8-8 8 8" stroke={GRASS} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
   <path d="M48 12v18m-8-8 8 8 8-8" stroke={RED} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
   <path d="M33 44v22" {...line}/></g>
  <g className={`${s.move} ${s.mvSub}`}><circle cx={64} cy={70} r={12} fill={'#f6d34a'} {...line}/><path d="M52 70h24" stroke={'#2c8a4f'} strokeWidth={4}/></g>
 </>,
 /* the captain lifts the trophy */
 trophy:done=><>
  <rect x={0} y={0} width={240} height={160} fill={'#28407a'}/>
  {[[34,30],[200,40],[62,96],[184,104],[120,18]].map(([x,y],i)=><path key={i} className={`${s.move} ${s.mvStar}`}
   d={`M${x} ${y-8}l2.4 5.6 6 .6-4.6 4 1.4 6-5.2-3.2-5.2 3.2 1.4-6-4.6-4 6-.6Z`} fill={GOLD}/>)}
  <rect x={70} y={128} width={100} height={32} fill={'#f6d34a'} {...line}/>
  <rect x={70} y={128} width={100} height={10} fill={'#2c8a4f'}/>
  <g className={`${s.move} ${s.mvLift}`}>
   <path d="M98 50h44v16c0 14-10 24-22 24s-22-10-22-24Z" fill={GOLD} {...line}/>
   <path d="M98 56h-10c0 12 6 18 12 18M142 56h10c0 12-6 18-12 18" fill="none" {...line}/>
   <path d="M114 90h12v16h10v12h-32v-12h10Z" fill={GOLD} {...line}/>
  </g>
 </>,
};
export default function ChapterArt({motif,amount,steps=1,label}:{motif?:Motif;amount?:number;steps?:number;label?:string}){
 if(!motif)return null;
 const n=amount??steps,done=n>=steps;
 return <svg className={s.artSvg} viewBox="0 0 240 160" role={label?'img':undefined} aria-label={label} aria-hidden={label?undefined:true} focusable="false" data-motif={motif} data-done={done||undefined}>
  {DRAW[motif](done,n)}
 </svg>;
}
