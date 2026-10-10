'use client';
import {forwardRef,useId,useImperativeHandle,useLayoutEffect,useRef} from 'react';
import {END,LEGENDS,ballAt,handlePath,poseAt,scaleAt,stride,type Key,type Kit,type Legend} from './legends';
import styles from './Experience.module.css';

/**
 * One legend as an original woodblock-style print (ukiyo-e technique, built in SVG): a sumi key-block outline over flat colour
 * blocks, a bokashi sky (colour wiped into the paper), a mist band across the horizon, the name in a cartouche and a vermilion
 * seal. The colour blocks sit a hair off the key block (kentō registration), as on a real print. Layers carry data-block so the
 * host can "print" them one after another. The figures are the game's bean characters redrawn flat; opponents are plain
 * silhouettes. `apply(t)` moves everything along the legend's move (0…1 under the finger, then on to END by itself) by writing
 * attributes directly: no React render per frame.
 */
export type PrintHandle={apply:(t:number)=>void;svg:SVGSVGElement|null};
type BeanRefs={root:SVGGElement|null;legL:SVGGElement|null;legR:SVGGElement|null;armL:SVGGElement|null;armR:SVGGElement|null};
const OPP:Kit={shirt:'#2d4c86',trim:'#1b2f5a',shorts:'#1b2f5a',socks:'#2d4c86'},KEEPER:Kit={shirt:'#c8432f',trim:'#7e2318',shorts:'#1e1b1d',socks:'#c8432f',gloves:'#f1e4c4'};
/** Ichimonji bokashi: a deep band of colour across the top of the sky, wiped out into the paper; and a warm glow at the horizon. */
const SKY={ai:['#0f2a66','#3d64a8','#e9a45c'],beni:['#a91f36','#d9576a','#efb56a'],kihada:['#c8730e','#e3a531','#f0c983']} as const;
const PAPER='#f1e4c4',SUMI='#15110e';
/** Wood grain: long wavy lines cut into a flat colour block, the same every render (seeded). */
function grain(x0:number,y0:number,x1:number,y1:number,seed:number,gap=7){
 let a=seed*9301+49297,d='';const r=()=>((a=(a*9301+49297)%233280)/233280);
 for(let y=y0+gap*r();y<y1;y+=gap*(.7+r()*.6)){d+=`M${x0} ${y.toFixed(1)}`;for(let x=x0;x<x1;x+=24){const w=(r()-.5)*2.4;d+=`Q${(x+12).toFixed(0)} ${(y+w).toFixed(1)} ${Math.min(x1,x+24).toFixed(0)} ${(y+(r()-.5)*1.2).toFixed(1)}`;}}
 return d;
}

function place(b:BeanRefs,keys:readonly Key[],t:number,run:boolean){
 const p=poseAt(keys,t),s=scaleAt(p.y),st=run?stride(keys,Math.min(t,1)):0;
 b.root?.setAttribute('transform',`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${s.toFixed(3)}) rotate(${p.rot.toFixed(1)} 0 -44)`);
 b.legL?.setAttribute('transform',`rotate(${(st+p.leg).toFixed(1)} -8 -40)`);b.legR?.setAttribute('transform',`rotate(${(-st).toFixed(1)} 8 -40)`);
 b.armL?.setAttribute('transform',`rotate(${(p.arm-st*.6).toFixed(1)} -19 -82)`);b.armR?.setAttribute('transform',`rotate(${(-p.arm-st*.6).toFixed(1)} 19 -82)`);
}

function Bean({kit,skin,hair,style,plain,refs,pat}:{kit:Kit;skin:string;hair?:string;style?:Legend['hairStyle'];plain?:boolean;refs:BeanRefs;pat?:string}){
 const hand=kit.gloves??skin,leg=(side:number)=><><rect x={side*8-5.5} y={-40} width="11" height="34" rx="5" fill={kit.socks}/><path className={styles.nf} d={`M${side*8-5.5} -16h11`} stroke={kit.trim} strokeWidth="3"/><ellipse cx={side*8+side*2} cy={-4} rx="8.5" ry="5" fill={SUMI}/></>;
 const arm=<><rect x="-5.5" y="-2" width="11" height="27" rx="5.5" fill={kit.shirt}/>{pat&&<rect x="-5.5" y="-2" width="11" height="27" rx="5.5" fill={`url(#${pat})`} stroke="none"/>}<circle cx="0" cy="28" r="6" fill={hand}/></>;
 return <g ref={el=>{refs.root=el;}} className={styles.bean}>
  <g ref={el=>{refs.legL=el;}}>{leg(-1)}</g><g ref={el=>{refs.legR=el;}}>{leg(1)}</g>
  <rect x="-18" y="-54" width="36" height="20" rx="7" fill={kit.shorts}/>
  <ellipse cx="0" cy="-70" rx="23" ry="24" fill={kit.shirt}/>
  {pat&&<ellipse cx="0" cy="-70" rx="23" ry="24" fill={`url(#${pat})`} stroke="none"/>}
  <path className={styles.nf} d="M-11 -93q11 8 22 0" stroke={kit.trim} strokeWidth="4"/>
  <g ref={el=>{refs.armL=el;}}><g transform="translate(-19 -82)">{arm}</g></g>
  <g ref={el=>{refs.armR=el;}}><g transform="translate(19 -82)">{arm}</g></g>
  <circle cx="0" cy="-112" r="23" fill={skin}/>
  {!plain&&hair&&style!=='bald'&&<path d={HAIR[style??'short']} fill={hair}/>}
  {!plain&&<g className={styles.face}><ellipse cx="-8" cy="-110" rx="2.6" ry="3.4"/><ellipse cx="8" cy="-110" rx="2.6" ry="3.4"/><path className={styles.nf} d="M-4.5 -100q4.5 3.4 9 0"/><path d="M-17 -104q3-2 6 0M11 -104q3-2 6 0" className={styles.cheek}/></g>}
 </g>;
}
const HAIR={
 short:'M-23 -112c0-16 10-24 23-24s23 8 23 24c-6-7-12-9-23-9s-17 2-23 9z',
 buzz:'M-22 -116c2-12 11-19 22-19s20 7 22 19c-6-4-13-6-22-6s-16 2-22 6z',
 medium:'M-25 -106c-2-20 9-31 25-31s27 11 25 31c-3-9-8-14-14-15-6 4-17 5-25 1-5 3-9 8-11 14z',
 long:'M-26 -90c-4-30 6-47 26-47s30 17 26 47c-3-4-5-10-5-18-3-7-9-11-15-12-7 4-16 5-24 2-4 3-6 8-6 14-1 7-3 12-2 14z',
 /** Hair pulled back into a bun on top. */
 bun:'M-23 -110c0-17 10-25 23-25s23 8 23 25c-6-8-12-10-23-10s-17 2-23 10zM-9 -138a9 8 0 1 0 18 0a9 8 0 1 0-18 0z',
 bald:'',
};

const Print=forwardRef<PrintHandle,{legend:Legend;t?:number;guide?:boolean;className?:string;label?:string}>(function Print({legend:l,t=.55,guide=false,className,label},ref){
 const id=useId().replace(/:/g,''),svg=useRef<SVGSVGElement>(null),ball=useRef<SVGGElement>(null),ringRef=useRef<SVGCircleElement>(null);
 const me=useRef<BeanRefs>({root:null,legL:null,legR:null,armL:null,armR:null}).current;
 const others=useRef<BeanRefs[]>(l.others.map(()=>({root:null,legL:null,legR:null,armL:null,armR:null}))).current;
 const depth=useRef<SVGGElement>(null),order=useRef('');
 const apply=(tt:number)=>{place(me,l.player,tt,true);l.others.forEach((o,i)=>place(others[i],o.keys,tt,o.kind!=='keeper'));
  const [bx,by]=ballAt(l.ball,tt),s=scaleAt(by);ball.current?.setAttribute('transform',`translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${s.toFixed(3)}) rotate(${(tt*540).toFixed(0)})`);
  const r=ringRef.current;if(r){const tc=Math.min(tt,1),h=l.handle==='ball'?ballAt(l.ball,tc):(()=>{const p=poseAt(l.player,tc);return [p.x,p.y-60*scaleAt(p.y)] as const;})();
   r.setAttribute('cx',h[0].toFixed(1));r.setAttribute('cy',h[1].toFixed(1));r.style.opacity=tt>=1?'0':'1';const tg=r.previousElementSibling as SVGElement|null;if(tg)tg.style.opacity=tt>=1?'0':'1';}
  // Painter's order: whatever is nearer the viewer (lower on the print) is drawn on top, the ball included.
  const g=depth.current;if(g){const items:[Element,number][]=[[ball.current!,by-4],[me.root!,poseAt(l.player,tt).y],...l.others.map((o,i):[Element,number]=>[others[i].root!,poseAt(o.keys,tt).y])];
   items.sort((a,b)=>a[1]-b[1]);const key=items.map(x=>[...g.children].indexOf(x[0])).join();if(key!==order.current){items.forEach(x=>g.appendChild(x[0]));order.current=items.map(x=>[...g.children].indexOf(x[0])).join();}}};
 useImperativeHandle(ref,()=>({apply,get svg(){return svg.current;}}));
 useLayoutEffect(()=>{apply(t);},[t,l]);// eslint-disable-line react-hooks/exhaustive-deps
 const [sky0,sky1,glow]=SKY[l.sky],path=guide?handlePath(l):[],end=path[path.length-1];
 const words=l.name.split(' '),flagRight=l.move==='sawa',seed=l.id.length*7+l.name.charCodeAt(0);
 const reg='translate(1.6 1.2)';/* kentō: the colour blocks land a little off the key block */
 return <svg ref={svg} className={`${styles.print} ${className??''}`} viewBox="0 0 300 420" role="img" aria-label={label??`${l.name}, ${l.position}: a woodblock-style print`}>
  <defs>
   <linearGradient id={id+'s'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky0}/><stop offset=".16" stopColor={sky0}/><stop offset=".34" stopColor={sky1} stopOpacity=".8"/><stop offset=".55" stopColor={PAPER} stopOpacity="0"/><stop offset=".8" stopColor={glow} stopOpacity=".0"/><stop offset="1" stopColor={glow} stopOpacity=".85"/></linearGradient>
   <linearGradient id={id+'g'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5f9a3e"/><stop offset=".5" stopColor="#3f7f35"/><stop offset="1" stopColor="#1f4a26"/></linearGradient>
   <linearGradient id={id+'m'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#13306b"/><stop offset="1" stopColor="#4a74b4"/></linearGradient>
   <pattern id={id+'p'} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="2.2" height="6" fill={l.kit.trim} opacity=".55"/></pattern>
   <clipPath id={id+'c'}><rect x="8" y="8" width="284" height="404"/></clipPath>
   <pattern id={id+'q'} width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="2" fill="#0d1a38" opacity=".5"/></pattern>
  </defs>
  <rect width="300" height="420" fill={PAPER}/>
  {/* colour blocks: bokashi sky, an original snow-capped peak, clouds, mist bands, the pitch; each with its wood grain */}
  <g data-block="sky" transform={reg}>
   <rect x="8" y="8" width="284" height="196" fill={`url(#${id}s)`}/>
   <path d={grain(8,10,292,120,seed)} className={styles.grain}/>
   <path d="M70 200L150 126Q170 112 190 126L274 200Z" fill={`url(#${id}m)`}/>
   <path d="M136 138Q170 108 204 138L194 146L184 138L172 150L160 139L148 148Z" fill={PAPER}/>
   <path d="M18 64q10-14 26-8q8-12 24-6q14-4 18 8q12 2 10 12H20q-8-2-2-6z" fill={PAPER}/>
   <path d="M196 120q8-10 20-6q8-9 20-3q12 0 12 9H198z" fill={PAPER}/>
   <path d="M8 182h96a8 8 0 0 1 0 16H8zM200 176h92v14h-92a7 7 0 0 1 0-14z" fill={l.sky==='ai'?'#e9a45c':'#f1d184'}/>
  </g>
  <g data-block="ground" transform={reg}>
   <path d="M8 200Q150 186 292 200V412H8Z" fill={`url(#${id}g)`}/>
   <path d={grain(8,210,292,410,seed+3,9)} className={styles.grainDark}/>
  </g>
  {/* key block: carved black outlines over everything, and the pitch markings cut white with a black edge */}
  <g data-block="key" className={styles.key} clipPath={`url(#${id}c)`}>
   <path className={styles.k2} d="M70 200L150 126Q170 112 190 126L274 200"/>
   <path className={styles.k1} d="M136 138Q170 108 204 138L194 146L184 138L172 150L160 139L148 148Z"/>
   <path className={styles.k1} d="M18 64q10-14 26-8q8-12 24-6q14-4 18 8q12 2 10 12H20q-8-2-2-6zM196 120q8-10 20-6q8-9 20-3q12 0 12 9H198z"/>
   <path className={styles.k1} d="M8 182h96a8 8 0 0 1 0 16H8M292 176h-92a7 7 0 0 0 0 14h92"/>
   <path className={styles.k3} d="M8 200Q150 186 292 200"/>
   <Lines scene={l.scene}/>
  </g>
  <g data-block="figures" ref={depth}>
   {l.others.map((o,i)=><Bean key={i} kit={o.kind==='keeper'?KEEPER:o.kind==='mate'?l.kit:OPP} skin={o.kind==='opp'?OPP.shirt:o.kind==='keeper'?KEEPER.shirt:'#d6a676'} plain pat={o.kind==='opp'?id+'q':undefined} refs={others[i]}/>)}
   <Bean kit={l.kit} skin={l.skin} hair={l.hair} style={l.hairStyle} pat={id+'p'} refs={me}/>
   <g ref={ball} className={styles.ball}><circle r="7.5" fill="#fbf4e2"/><path d="M0 -3.2l3 2.2-1.1 3.4h-3.8l-1.1-3.4z" fill={SUMI} stroke="none"/></g>
  </g>
  {/* a cropped foreground: the corner flag cutting in on a diagonal, for depth */}
  <g clipPath={`url(#${id}c)`}><g data-block="fore" className={styles.fore} transform={flagRight?'translate(300 0) scale(-1 1)':undefined}>
   <path d="M-6 430L44 292" className={styles.pole}/><path d="M44 292L84 300L52 322Z" fill="#c8432f"/><path d="M44 292L84 300L52 322Z" className={styles.k1}/>
  </g></g>
  {guide&&<g data-block="guide" className={styles.guide} aria-hidden="true">
   <path className={styles.brush} d={'M'+path.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}/>
   <circle className={styles.target} cx={end[0]} cy={end[1]} r="9"/>
   <circle ref={ringRef} className={styles.ring} r="16"/>
  </g>}
  {/* a tall name cartouche at the top right, as on actor and landscape prints; then the round "kiwame" (approved) seal */}
  <g data-block="cartouche">
   <rect x="226" y="16" width="62" height={34+words.length*20} fill="#f4dc8e" transform={reg}/>
   <rect x="226" y="16" width="62" height="12" fill="#c8432f" transform={reg}/>
   <rect x="226" y="16" width="62" height={34+words.length*20} className={styles.k1}/>
   <path d="M226 28H288" className={styles.k1}/>
   {words.map((w,i)=><text key={i} x="257" y={46+i*20} textAnchor="middle" className={styles.cartName} fontSize="15.5" textLength={w.length>6?52:undefined} lengthAdjust="spacingAndGlyphs">{w}</text>)}
   <text x="257" y={44+words.length*20} textAnchor="middle" className={styles.cartPos} textLength={l.position.length>9?52:undefined} lengthAdjust="spacingAndGlyphs">{l.position}</text>
  </g>
  <g data-block="seal">
   <circle cx="210" cy="30" r="11" fill="#c23a26"/><circle cx="210" cy="30" r="8.6" fill="none" stroke="#f6d9cf" strokeWidth="1"/>
   <text x="210" y="34.4" textAnchor="middle" className={styles.kiwame}>極</text>
   <rect x="18" y="374" width="28" height="30" rx="2" fill="#c23a26"/><rect x="21" y="377" width="22" height="24" fill="none" stroke="#f6d9cf" strokeWidth="1"/>
   <text x="32" y="394" textAnchor="middle" className={styles.sealNo} style={LEGEND_NO(l.id).length>1?{fontSize:12}:undefined}>{LEGEND_NO(l.id)}</text>
  </g>
  <rect x="8" y="8" width="284" height="404" className={styles.frame}/>
 </svg>;
});
export default Print;
/** The print's number in the series, from its place in the gallery. */
const LEGEND_NO=(id:string)=>String(LEGENDS.findIndex(x=>x.id===id)+1);
export {END};

/** Pitch markings, cut white with a carved black edge; the goal frame in bold key-block line. */
function Lines({scene}:{scene:Legend['scene']}){
 const chalk=(d:string)=><><path className={styles.chalkEdge} d={d}/><path className={styles.chalk} d={d}/></>;
 if(scene==='goal')return <g>
  <path className={styles.net} d="M52 156L60 236M86 156L90 236M118 156L120 236M150 156V236M182 156L180 236M214 156L210 236M248 156L240 236M48 172H252M48 192H252M48 212H252"/>
  {chalk('M28 238H272M48 238L22 300H278L252 238M98 238L88 262H212L202 238')}
  <path className={styles.postEdge} d="M40 238V146H260V238"/><path className={styles.post} d="M40 238V146H260V238"/>
 </g>;
 if(scene==='wing')return <g>{chalk('M262 200L296 412M8 236H150L156 200M8 272H110')}</g>;
 return <g>{chalk('M8 300H292')}<ellipse className={styles.chalkEdge} cx="150" cy="300" rx="74" ry="20"/><ellipse className={styles.chalk} cx="150" cy="300" rx="74" ry="20"/></g>;
}
