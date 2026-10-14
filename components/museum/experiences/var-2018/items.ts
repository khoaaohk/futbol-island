import {depthOf,iso,type Flat,type LineTone,type Point3,type Projection,type SolidPaths,type Tone as KTone} from '../anatomy/iso-kit';

/**
 * var-2018 · the drawable things the shared Paper painter (anatomy/PaperStage.tsx `Parts` / `Items`) takes, for an exhibit with
 * no people on it (Oct 12 2026 rebuild): the ball, its floor shadow, a dotted trace, and the bench parts. These are the same
 * shapes PaperStage paints, declared here so this exhibit needs nothing from the shared paper mannequins.
 */
export type Item=
 |{kind:'ball';depth:number;c:Flat;r:number;tone:'ball'|'accent';spin?:number;id?:string}
 |{kind:'poly';depth:number;pts:Flat[];tone:'accent'|'yellow'|'red'|'green';id?:string}
 |{kind:'dots';depth:number;pts:Flat[];r:number};
export type Part=
 |{kind:'solid';paths:SolidPaths;tone?:KTone;crease?:KTone|'none';lit?:boolean;halo?:boolean;inner?:string;key?:string}
 |{kind:'line';d:string;tone?:LineTone;free?:boolean}
 |{kind:'dots';pts:Flat[];size?:number;tone?:KTone}
 |{kind:'lens';d:string;on:'red'|'yellow'|'green'|null;colour:'red'|'yellow'|'green';glow:Flat;r:number}
 |{kind:'text';transform:string;text:string;size:number;ink?:'hi'|'accent'}
 |{kind:'halo';d:string};

/** Screen px per world cm (along the screen) for a projection. */
export const pxPerCm=(P:Projection)=>{const a=iso([0,0,0],P),b=iso([0,0,100],P);return Math.hypot(b[0]-a[0],b[1]-a[1])/100/Math.cos((P.elevation??30)*Math.PI/180);};
/** The match ball (22 cm) at a centre point. */
export function ballItem(c:Point3,P:Projection,spin=0,tone:'ball'|'accent'='ball'):Item{return {kind:'ball',depth:depthOf(c,P)+.2,c:iso(c,P),r:11*pxPerCm(P),tone,spin,id:'ball'};}
/** A soft floor shadow under a point (screen ellipse, world radius r). */
export function shadowAt(x:number,y:number,r:number,P:Projection){const c=iso([x,y,0],P),a=iso([x+r,y,0],P),b=iso([x,y+r,0],P);
 return {cx:c[0],cy:c[1],rx:Math.max(Math.abs(a[0]-c[0]),Math.abs(b[0]-c[0])),ry:Math.max(Math.abs(a[1]-c[1]),Math.abs(b[1]-c[1]))};}
export const byDepth=(items:Item[])=>[...items].sort((a,b)=>a.depth-b.depth);
