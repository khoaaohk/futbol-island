/**
 * floodlights-1878 · the night-rig model (pure, tested by tests/museum-exp-floodlights-1878.cjs). Oct 14 2026 redo.
 *
 * A teaching model of a model stadium on a bench, not a lighting design tool. World units are model units: the pitch is
 * 105 × 68 m drawn at S units a metre. Four light towers stand at the corners, each with one lamp H units up that a knob swivels
 * (yaw). Electricity comes from a dynamo: turn its crank faster and the voltmeter rises; the lamps' power grows with the square
 * of the volts (power = volts² ÷ resistance), so half the speed gives a quarter of the light.
 *
 * The light on the grass under a spot from one lamp: a beam (brightest along its aim, fading off-axis) times the lamp's power,
 * falling with distance like a real lamp (H ÷ d³: the inverse square law, tilted onto the grass). The pitch is sampled as a
 * GX × GY grid; a cell is a dark spot when its light is under LIT.
 */
export const S=1.4;// model units per metre
export const PL=105*S,PW=68*S;// the pitch: x along its length, y across
export const H=50;// lamp height (model units)
export const TOWER_AT=[[-84,-58],[84,-58],[84,58],[-84,58]] as const;// corner towers (x, y)
export const TOWER_NAME=['Far left','Far right','Near right','Near left'] as const;
export const REACH=72;// where a lamp's beam centre lands on the grass, from its tower
export const SPREAD=22*Math.PI/180;// the beam's half width (gaussian sigma, radians)
export const GX=40,GY=26;
export const LIT=.62;// "enough light to play"
export const K_LIGHT=3.4e4;
export const DETENT=15;// knob detents, degrees
export const FULL_V=100;// the dynamo's full output (model volts)
export const OMEGA_FULL=3*Math.PI;// crank speed for full volts: 1.5 turns a second
export const COAST=1.4;// seconds: how fast the flywheel runs down when you let go
export const READY_V=90;// "full power" for the task

export type Rig={yaw:number[];/** dynamo speed, rad/s */omega:number;motor:boolean};
const deg=(d:number)=>d*Math.PI/180;
/** The yaw (degrees) that points tower i at the centre spot. */
export const yawToCentre=(i:number)=>Math.atan2(-TOWER_AT[i][1],-TOWER_AT[i][0])*180/Math.PI;
/** Start: every lamp points along its touchline, so the edges are lit and the middle and both ends are dark. */
export const START_YAW=[0,180,180,0];
export function snapYaw(d:number){const s=Math.round(d/DETENT)*DETENT;return ((s%360)+540)%360-180;}

export const volts=(omega:number)=>Math.min(FULL_V*1.1,Math.max(0,omega/OMEGA_FULL*FULL_V));
/** Lamp power, 0..~1.2: grows with the square of the volts. */
export const power=(v:number)=>(v/FULL_V)**2;

/** One lamp's light on the grass at (x, y): beam × power × H ÷ d³ (scaled so a centred pool reads about 3). */
export function lampAt(i:number,yawDeg:number,p:number,x:number,y:number){
 if(p<=0)return 0;
 const [tx,ty]=TOWER_AT[i],a=deg(yawDeg),ax=tx+Math.cos(a)*REACH-tx,ay=ty+Math.sin(a)*REACH-ty;
 // beam axis (from the lamp to its aim point on the grass) and the ray to (x, y)
 const al=Math.hypot(ax,ay,H),bx=x-tx,by=y-ty,bl=Math.hypot(bx,by,H);
 const cos=(ax*bx+ay*by+H*H)/(al*bl),ang=Math.acos(Math.max(-1,Math.min(1,cos)));
 return p*Math.exp(-((ang/SPREAD)**2))*H/bl**3*K_LIGHT;
}
/** `on` (optional): each lamp's share of the power (a tower that is taken apart is unplugged: 0). */
export type Lamps={yaw:readonly number[];on?:readonly number[]};
export function lightAt(r:Lamps,p:number,x:number,y:number){let e=0;for(let i=0;i<4;i++)e+=lampAt(i,r.yaw[i],p*(r.on?.[i]??1),x,y);return e;}
/** Each lamp's share when tower `apart` is taken apart by `e` (0..1): its cable is pulled, so its lamp goes out. */
export const onWhenApart=(e:number)=>[0,1,2,3].map(i=>i===APART_TOWER?Math.max(0,1-e*1.6):1);
/** The grid of cell centres, row by row (x from −PL/2, y from −PW/2). */
export const cellX=(c:number)=>-PL/2+(c+.5)*PL/GX,cellY=(r:number)=>-PW/2+(r+.5)*PW/GY;
export function grid(r:Lamps,p:number){const g=new Float32Array(GX*GY);for(let j=0;j<GY;j++)for(let i=0;i<GX;i++)g[j*GX+i]=lightAt(r,p,cellX(i),cellY(j));return g;}
export type Coverage={lit:number;dark:number;min:number;minAt:[number,number]};
export function coverage(g:Float32Array):Coverage{
 let dark=0,min=Infinity,mi=0;for(let k=0;k<g.length;k++){if(g[k]<LIT)dark++;if(g[k]<min){min=g[k];mi=k;}}
 return {lit:1-dark/g.length,dark,min,minAt:[cellX(mi%GX),cellY(Math.floor(mi/GX))]};
}
export const pct=(f:number)=>Math.round(f*100);
/** Match ready: full power and no dark spot anywhere. */
export const isReady=(c:Coverage,v:number)=>v>=READY_V&&c.dark===0;

// ── The dynamo: a crank you turn by hand, a flywheel that coasts, a motor that can take over ────────────────────────────
/** One step with nobody cranking: the motor holds full speed; otherwise the flywheel runs down. Returns the new speed. */
export function coast(omega:number,motor:boolean,dt:number){
 if(motor){const n=omega+(OMEGA_FULL-omega)*(1-Math.exp(-dt/.5));return Math.abs(OMEGA_FULL-n)<.02?OMEGA_FULL:n;}
 const n=omega*Math.exp(-dt/COAST);return n<.08?0:n;
}
/** While cranking: the speed follows how fast the handle went round (angle step ÷ time), smoothed. Either way round counts. */
export function crankSpeed(omega:number,dAngle:number,dt:number){
 if(dt<=0)return omega;const inst=Math.abs(dAngle)/dt,k=1-Math.exp(-dt/.18);return Math.min(OMEGA_FULL*1.25,omega+(inst-omega)*k);
}
/** Smallest signed angle step (radians), so going past 180° doesn't jump. */
export const angleStep=(a:number,b:number)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d;};

// ── Shadows: one per lit lamp, pointing away from it; dark when the other lamps can't fill it in ─────────────────────────
export const PLAYER_H=8;
export type Shadow={i:number;dx:number;dy:number;len:number;dark:number};
export function shadowsAt(r:Lamps,p:number,x:number,y:number):Shadow[]{
 const parts=[0,1,2,3].map(i=>lampAt(i,r.yaw[i],p*(r.on?.[i]??1),x,y)),total=parts.reduce((a,b)=>a+b,0);
 if(total<.05)return [];
 return parts.flatMap((e,i)=>{if(e/total<.04)return [];const [tx,ty]=TOWER_AT[i],d=Math.hypot(x-tx,y-ty)||1;
  return [{i,dx:(x-tx)/d,dy:(y-ty)/d,len:PLAYER_H*d/(H-PLAYER_H),dark:Math.min(1,e/total)*Math.min(1,total/LIT)}];});
}
/** The players on the model pitch (two teams picked by the Sheffield FA). */
export const PLAYERS:readonly [number,number,0|1][]=[[-48,-14,0],[-22,20,0],[-6,-26,0],[30,4,1],[50,-20,1],[14,30,1],[-60,30,1],[64,26,0]];

// ── The tower's parts, for the take-apart view ──────────────────────────────────────────────────────────────────────────
export type PartId='footing'|'mast'|'platform'|'lamp'|'reflector'|'cable';
export const PARTS:readonly {id:PartId;name:string;line:string}[]=[
 {id:'footing',name:'Footing',line:'A heavy block in the ground, so the tall mast can’t blow over.'},
 {id:'mast',name:'Mast',line:'A tall frame lifts the lamp high, so its light spreads wide and shadows stay short.'},
 {id:'platform',name:'Platform',line:'A deck and a ladder, so someone can climb up and look after the lamp.'},
 {id:'lamp',name:'Arc lamp',line:'Electricity jumps across a gap between two carbon rods and makes a very bright light.'},
 {id:'reflector',name:'Reflector',line:'A shiny dish behind the light bounces it forward, down onto the pitch.'},
 {id:'cable',name:'Cable',line:'Carries the electricity from the dynamo up to the lamp.'},
];
/** How far each part lifts (model units) when the tower is fully apart. */
export const LIFT:Record<PartId,number>={footing:0,mast:10,platform:24,lamp:40,reflector:52,cable:0};
/** The cable slides out sideways instead of up. */
export const CABLE_OUT=26;
/** Which tower comes apart (the far right one: it has open space round it at every size). */
export const APART_TOWER=1;

// ── Tasks and what the readout says ─────────────────────────────────────────────────────────────────────────────────────
export type Task='power'|'aim'|'apart'|'probe';
export function verdict(c:Coverage,v:number):{kind:'good'|'ok'|'bad'|'info';big:string;line:string}{
 if(v<5)return {kind:'info',big:'Lights off',line:'Turn the crank on the dynamo. Faster turning makes more volts.'};
 if(v<READY_V&&c.dark>0)return {kind:'bad',big:`${Math.round(v)} volts`,line:'Not enough power: the lamps glow dim. Turn faster, or throw the motor lever.'};
 if(c.dark>0)return {kind:'bad',big:`${pct(c.lit)}% lit`,line:`${c.dark} dark ${c.dark===1?'spot':'spots'} left. Drag a tower’s lamp to swing its light onto the dark part.`};
 if(v<READY_V)return {kind:'ok',big:'Almost',line:'Every spot is lit, but the dynamo is slowing. Keep it at full power.'};
 return {kind:'good',big:'Match ready',line:'Full power, and light from all four corners: no dark spots, and every shadow is soft.'};
}
/** The lux probe's reading as a share of its dial (0..1; LIT sits at 1/3 of the way round). */
export const probeDial=(e:number)=>Math.min(1,e/(LIT*3));
