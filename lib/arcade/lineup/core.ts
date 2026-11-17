/**
 * Line Up! (Nov 17 2026, docs/arcade-aaa/new-games-brief + lineup-direction.md): the block-fit cabinet. Pure rules, no DOM, seeded
 * (mulberry32) so a seed always plays the same pieces: the Daily Line-Up gives everybody the same tray order that day.
 * An 8 x 8 pitch. A tray of three shapes made of bean players (1-5 cells). Drag one onto the pitch; a full row or column is a
 * complete line of the team and clears. When the three are placed a new tray comes at once. The run ends when no tray piece fits.
 * Ramp (RAMP, by level; a level is LU.perLevel placements): bigger and odder shapes, fewer singles, fewer fair re-deals, and from
 * level 4 a referee who blocks one square for a few placements. tests/lineup-core.cjs proves the ramp with a bot.
 * Teaches (AGENTS.md): "Fill the line. Keep your shape." A team defends in lines; gaps in a line are where the other team gets through.
 */
export const LU={
 size:8,tray:3,perLevel:15,
 /** points: 1 a bean placed; lines with one piece: 100 x k(k+1)/2 (1:100, 2:300, 3:600, 4:1000 ...). */
 cellPts:1,linePts:100,cleanPts:500,
 /** streak: clearing placements in a row; one placement without a clear is forgiven, the second breaks it. x1.5, x2 ... up to x4. */
 streakStep:.5,streakMax:4,streakGrace:1,
 /** level bonus on line points: +10% a level, up to x3. */
 levelStep:.1,levelMax:3,
 medals:[1500,4000,10000] as readonly number[],
} as const;
export const MEDAL_NAMES=['Bronze','Silver','Gold'] as const;
export function medalFor(score:number){let m=0;for(const t of LU.medals)if(score>=t)m++;return m;}
export function nextMedalLine(score:number):{medal:number;next:string|null;gap:number}{const m=medalFor(score);return m>=LU.medals.length?{medal:m,next:null,gap:0}:{medal:m,next:MEDAL_NAMES[m],gap:LU.medals[m]-score};}
export const lineupCoins=(score:number)=>Math.floor(Math.max(0,score)/400);
export const levelFactor=(level:number)=>Math.min(LU.levelMax,1+LU.levelStep*(Math.max(1,level)-1));
export const streakFactor=(streak:number)=>Math.min(LU.streakMax,1+LU.streakStep*Math.max(0,streak-1));
export const linePoints=(k:number)=>k>0?LU.linePts*k*(k+1)/2:0;

/** Ramp by level (index = level - 1; the last row holds for every later level). tier: weights of shape tiers 0-3 (0 easy, 3 odd);
 *  dot: weight of the single bean inside tier 0 (the other easy shapes weigh 1); refs: most referees on the pitch at once;
 *  life: placements a referee stays; refChance: chance a new tray brings a referee; fair: re-deals tried so at least one piece fits
 *  (30 or more: so every piece fits). */
export const RAMP:readonly {tier:readonly [number,number,number,number];dot:number;refs:number;life:number;refChance:number;fair:number}[]=[
 {tier:[.60,.34,.06,0],dot:1,refs:0,life:0,refChance:0,fair:40},
 {tier:[.54,.36,.10,0],dot:.8,refs:0,life:0,refChance:0,fair:40},
 {tier:[.47,.37,.14,.02],dot:.6,refs:0,life:0,refChance:0,fair:30},
 {tier:[.41,.36,.18,.05],dot:.5,refs:1,life:3,refChance:.3,fair:20},
 {tier:[.36,.35,.21,.08],dot:.4,refs:1,life:4,refChance:.4,fair:12},
 {tier:[.32,.33,.24,.11],dot:.35,refs:1,life:4,refChance:.45,fair:8},
 {tier:[.28,.32,.26,.14],dot:.3,refs:2,life:5,refChance:.5,fair:5},
 {tier:[.25,.31,.27,.17],dot:.25,refs:2,life:5,refChance:.55,fair:3},
 {tier:[.22,.30,.28,.20],dot:.2,refs:2,life:6,refChance:.6,fair:2},
 {tier:[.20,.28,.29,.23],dot:.2,refs:2,life:6,refChance:.65,fair:1},
 {tier:[.17,.27,.30,.26],dot:.15,refs:3,life:6,refChance:.7,fair:1},
 {tier:[.14,.26,.32,.28],dot:.12,refs:3,life:7,refChance:.75,fair:0},
];
export const rampFor=(level:number)=>RAMP[Math.max(1,Math.min(RAMP.length,Math.floor(level)))-1];
export const levelForPlaced=(placed:number)=>1+Math.floor(Math.max(0,placed)/LU.perLevel);

/** Kit colours a piece can wear (house comic palette): red, teal, sun, orange, sky, violet. KIT_DARK is the shaded side. */
export const KIT=['#f0452e','#19b5a5','#ffc83a','#ff8a3c','#4a9fe0','#8f78b8'] as const;
export const KIT_DARK=['#b02a3a','#0f7f86','#d98a1c','#c95f1e','#2c6fb0','#62508f'] as const;

/** Shape groups: rows of '#' (a bean) and '.' (empty). Every rotation and mirror is generated. tier 0 easy ... 3 odd. */
export const SHAPE_GROUPS:readonly {id:string;tier:number;rows:readonly string[]}[]=[
 {id:'dot',tier:0,rows:['#']},
 {id:'pair',tier:0,rows:['##']},
 {id:'three',tier:0,rows:['###']},
 {id:'corner',tier:0,rows:['#.','##']},
 {id:'box',tier:1,rows:['##','##']},
 {id:'four',tier:1,rows:['####']},
 {id:'ell',tier:1,rows:['#.','#.','##']},
 {id:'tee',tier:1,rows:['###','.#.']},
 {id:'zig',tier:2,rows:['.##','##.']},
 {id:'five',tier:2,rows:['#####']},
 {id:'wide',tier:2,rows:['#..','#..','###']},
 {id:'onetwo',tier:2,rows:['#.','.#']},
 {id:'cup',tier:3,rows:['#.#','###']},
 {id:'cross',tier:3,rows:['.#.','###','.#.']},
 {id:'stairs',tier:3,rows:['#..','##.','.##']},
 {id:'long',tier:3,rows:['#.','#.','#.','##']},
 {id:'flag',tier:3,rows:['##','##','#.']},
 {id:'diagonal',tier:3,rows:['#..','.#.','..#']},
];
export type ShapeDef={group:number;tier:number;cells:readonly (readonly [number,number])[];w:number;h:number;n:number};
function orient(rows:readonly string[]){
 const base:[number,number][]=[];rows.forEach((r,y)=>{for(let x=0;x<r.length;x++)if(r[x]==='#')base.push([x,y]);});
 const seen=new Set<string>(),out:[number,number][][]=[];let cur=base;
 for(let m=0;m<2;m++){for(let r=0;r<4;r++){
  const minX=Math.min(...cur.map(c=>c[0])),minY=Math.min(...cur.map(c=>c[1]));const norm=cur.map(([x,y])=>[x-minX,y-minY] as [number,number]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);
  const key=norm.map(c=>c.join(',')).join(';');if(!seen.has(key)){seen.add(key);out.push(norm);}cur=cur.map(([x,y])=>[-y,x]);}
  cur=base.map(([x,y])=>[-x,y]);}
 return out;
}
/** Every orientation of every group, flat. */
export const SHAPES:readonly ShapeDef[]=SHAPE_GROUPS.flatMap((g,gi)=>orient(g.rows).map(cells=>({group:gi,tier:g.tier,cells,w:1+Math.max(...cells.map(c=>c[0])),h:1+Math.max(...cells.map(c=>c[1])),n:cells.length})));

export function lineupDailySeed(day:string){let h=0x811c9dc5;const s='lineup:'+day;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return 1+h%2_000_000_000;}
function mulberry(seed:number){let a=seed>>>0;return()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}

export type LinePiece={id:number;shape:number;kit:number};
export type LineEventType='place'|'clear'|'clean'|'deal'|'refOn'|'refOff'|'level'|'streakLost'|'over';
/** cells: board indices (y*8+x). rows/cols: the lines cleared. points: what this event scored. a: lines (clear) / level / slot. b: streak. */
export type LineEvent={type:LineEventType;cells:number[];rows:number[];cols:number[];points:number;a:number;b:number;kit:number;
 /** clear: the kit of each cleared cell (same order as cells; -1 never). */kits:number[]};
export type LineStats={placed:number;beans:number;lines:number;clears:number;bestCombo:number;bestStreak:number;cleanSheets:number;refs:number;deals:number;bigShapes:number};
export type LineState={
 seed:number;daily:boolean;
 /** 0 empty, else kit + 1. */grid:Uint8Array;
 /** referee placements left on a square (0 = none). */ref:Uint8Array;
 tray:(LinePiece|null)[];score:number;level:number;streak:number;miss:number;over:boolean;
 /** placements done; ids for pieces. */nextId:number;stats:LineStats;
};
const emptyStats=():LineStats=>({placed:0,beans:0,lines:0,clears:0,bestCombo:0,bestStreak:0,cleanSheets:0,refs:0,deals:0,bigShapes:0});

export type LineUp=ReturnType<typeof createLineUp>;
/** fixLevel: tests only (hold the ramp at one level to measure it). */
export function createLineUp(opts:{seed:number;daily?:boolean;fixLevel?:number}){
 const N=LU.size,rnd=mulberry(opts.seed);
 const s:LineState={seed:opts.seed,daily:!!opts.daily,grid:new Uint8Array(N*N),ref:new Uint8Array(N*N),tray:[null,null,null],score:0,level:1,streak:0,miss:0,over:false,nextId:1,stats:emptyStats()};
 const events:LineEvent[]=[];if(opts.fixLevel)s.level=opts.fixLevel;
 const emit=(type:LineEventType,o:Partial<LineEvent>={})=>{events.push({type,cells:o.cells??[],rows:o.rows??[],cols:o.cols??[],points:o.points??0,a:o.a??0,b:o.b??0,kit:o.kit??0,kits:o.kits??[]});};
 const free=(i:number)=>s.grid[i]===0&&s.ref[i]===0;
 function fits(shape:number,x:number,y:number){const d=SHAPES[shape];if(!d||x<0||y<0||x+d.w>N||y+d.h>N)return false;for(const [cx,cy] of d.cells)if(!free((y+cy)*N+x+cx))return false;return true;}
 function fitsAnywhere(shape:number){const d=SHAPES[shape];for(let y=0;y+d.h<=N;y++)for(let x=0;x+d.w<=N;x++)if(fits(shape,x,y))return true;return false;}
 /** Lines a placement would complete (for the ghost's highlight and for scoring). */
 function linesIf(shape:number,x:number,y:number){
  const d=SHAPES[shape],add=new Set(d.cells.map(([cx,cy])=>(y+cy)*N+x+cx)),rows:number[]=[],cols:number[]=[];
  const full=(i:number)=>s.grid[i]!==0||add.has(i);
  for(let r=0;r<N;r++){let ok=true;for(let c=0;c<N;c++)if(!full(r*N+c)){ok=false;break;}if(ok)rows.push(r);}
  for(let c=0;c<N;c++){let ok=true;for(let r=0;r<N;r++)if(!full(r*N+c)){ok=false;break;}if(ok)cols.push(c);}
  return {rows,cols};
 }
 function pickShape(level:number){
  const R=rampFor(level);let t=rnd()*R.tier.reduce((a,b)=>a+b,0),tier=0;for(;tier<3;tier++){t-=R.tier[tier];if(t<0)break;}
  const groups=SHAPE_GROUPS.map((g,i)=>({g,i})).filter(o=>o.g.tier===tier),w=groups.map(o=>o.g.id==='dot'?R.dot:1);
  let u=rnd()*w.reduce((a,b)=>a+b,0),gi=groups[0].i;for(let k=0;k<groups.length;k++){u-=w[k];if(u<0){gi=groups[k].i;break;}}
  const opts=SHAPES.map((d,i)=>({d,i})).filter(o=>o.d.group===gi);return opts[Math.floor(rnd()*opts.length)].i;
 }
 function deal(){
  const R=rampFor(s.level);let shapes:number[]=[];
  // fair deal: levels 1-3 (fair>=30) re-deal until every piece fits somewhere; later only until one does, with fewer tries
  for(let attempt=0;attempt<=R.fair;attempt++){shapes=[pickShape(s.level),pickShape(s.level),pickShape(s.level)];if(R.fair>=30?shapes.every(fitsAnywhere):shapes.some(fitsAnywhere))break;}
  s.tray=shapes.map(shape=>({id:s.nextId++,shape,kit:Math.floor(rnd()*KIT.length)}));s.stats.deals++;emit('deal');
  // a referee walks on with the tray (never onto the last free squares of a nearly full pitch)
  const onPitch=s.ref.reduce((a,v)=>a+(v>0?1:0),0);
  if(R.refs>onPitch&&rnd()<R.refChance){const open:number[]=[];for(let i=0;i<N*N;i++)if(free(i))open.push(i);
   if(open.length>12){const i=open[Math.floor(rnd()*open.length)];s.ref[i]=R.life;s.stats.refs++;emit('refOn',{cells:[i],a:R.life});}}
 }
 function checkOver(){if(s.over)return;if(!s.tray.some(p=>p&&fitsAnywhere(p.shape))){s.over=true;emit('over');}}
 /** Places tray slot `slot` with its top-left cell at x,y. Returns false (and changes nothing) when it does not fit. */
 function place(slot:number,x:number,y:number){
  const p=s.tray[slot];if(s.over||!p||!fits(p.shape,x,y))return false;const d=SHAPES[p.shape];
  const cells=d.cells.map(([cx,cy])=>(y+cy)*N+x+cx);for(const i of cells)s.grid[i]=p.kit+1;s.tray[slot]=null;
  const placePts=d.n*LU.cellPts;s.score+=placePts;s.stats.placed++;s.stats.beans+=d.n;if(d.n>=5)s.stats.bigShapes++;
  emit('place',{cells,points:placePts,a:slot,kit:p.kit});
  // lines
  const {rows,cols}=linesIf(p.shape,x,y),k=rows.length+cols.length;
  if(k>0){
   s.streak=s.miss<=LU.streakGrace&&s.streak>0?s.streak+1:1;s.miss=0;
   const pts=Math.round(linePoints(k)*streakFactor(s.streak)*levelFactor(s.level)),gone=new Set<number>();
   for(const r of rows)for(let c=0;c<N;c++)gone.add(r*N+c);for(const c of cols)for(let r=0;r<N;r++)gone.add(r*N+c);
   const cleared=[...gone],kits=cleared.map(i=>s.grid[i]-1);for(const i of gone)s.grid[i]=0;
   s.score+=pts;s.stats.lines+=k;s.stats.clears++;s.stats.bestCombo=Math.max(s.stats.bestCombo,k);s.stats.bestStreak=Math.max(s.stats.bestStreak,s.streak);
   emit('clear',{cells:cleared,kits,rows,cols,points:pts,a:k,b:s.streak,kit:p.kit});
   if(s.grid.every(v=>v===0)){const bonus=Math.round(LU.cleanPts*levelFactor(s.level));s.score+=bonus;s.stats.cleanSheets++;emit('clean',{points:bonus});}
  }else if(s.streak>0){s.miss++;if(s.miss>LU.streakGrace){emit('streakLost',{b:s.streak});s.streak=0;s.miss=0;}}
  // referees count down
  const off:number[]=[];for(let i=0;i<N*N;i++)if(s.ref[i]>0){s.ref[i]--;if(s.ref[i]===0)off.push(i);}if(off.length)emit('refOff',{cells:off});
  const lv=opts.fixLevel??levelForPlaced(s.stats.placed);if(lv!==s.level){s.level=lv;emit('level',{a:lv});}
  if(s.tray.every(t=>t===null))deal();
  checkOver();return true;
 }
 deal();checkOver();
 return {
  state:s,fits,fitsAnywhere,linesIf,place,
  /** Ghost preview for a tray slot at a cell. */
  preview(slot:number,x:number,y:number){const p=s.tray[slot];if(!p)return {ok:false,rows:[] as number[],cols:[] as number[]};const ok=fits(p.shape,x,y);return ok?{ok,...linesIf(p.shape,x,y)}:{ok,rows:[] as number[],cols:[] as number[]};},
  drain(fn:(e:LineEvent)=>void){const list=events.splice(0);for(const e of list)fn(e);},
 };
}
