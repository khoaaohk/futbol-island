/**
 * Page-turn gesture maths for the card binder (pure, no imports, so tests/binder-turn.cjs can run it directly).
 *
 * A drag poses the turning sheet with p (0 = lying on its own side, 1 = turned over). These helpers decide when a press
 * becomes a page drag (so card taps are never stolen), where the sheet sits under the finger, how fast the finger was moving
 * when it lifted, whether that release turns the page or lets it fall back, how the sheet settles from there, and how far a
 * page "gives" when it is pulled past the first or last page (rubber band).
 */
export type DragSide='left'|'right'|'single';

/** Pixels a press must travel sideways before it is a page drag; below it, it is still a tap on a card. */
export const DRAG_SLOP=8;
/** Release speed (px/ms along the turn) that counts as a flick: it turns the page (or, the other way, cancels it). */
export const FLICK_SPEED=.35;
/** A flick must have moved the sheet at least this far (p), so a twitch while lifting a still finger never turns. */
export const FLICK_MIN_P=.04;
/** Velocity is measured over this window (ms) of the newest pointer samples; older samples are ignored. */
export const VELOCITY_WINDOW=100;
/** A finger that rested this long (ms) before lifting has no velocity (it stopped; not a flick). */
export const VELOCITY_STALE=120;

/** 'wait' until the press has moved DRAG_SLOP sideways; 'drag' once it is mostly horizontal; 'none' for a vertical move. */
export function dragIntent(dx:number,dy:number,slop=DRAG_SLOP):'wait'|'drag'|'none'{
 const ax=Math.abs(dx),ay=Math.abs(dy);
 if(ax<slop&&ay<slop*1.5)return 'wait';
 return ax>=slop&&ax>=ay?'drag':ay>ax?'none':'wait';
}

/**
 * The sheet's pose p (0–1) for a pointer at `x`, given where the hinge is (`hinge`, px) and where the sheet was grabbed.
 * Forward (and a spread's back turn): the grabbed point stays under the pointer as the sheet swings round the hinge
 * (p = acos(distance from hinge / grab reach) / π). A phone's single page turning BACK comes in from the left edge, so it
 * simply follows the drag distance over the page width.
 */
export function followPose(o:{side:DragSide;back:boolean;x:number;x0:number;hinge:number;grab:number;pageW:number}):number{
 if(o.side==='single'&&o.back)return clamp01((o.x-o.x0)/(o.pageW*.95));
 const reach=Math.max(o.pageW*.35,Math.abs(o.grab-o.hinge));
 const along=o.side==='left'?o.hinge-o.x:o.x-o.hinge;
 return Math.acos(Math.max(-1,Math.min(1,along/reach)))/Math.PI;
}

/** A short history of pointer x samples (time ms, x px), newest last; capped so it never grows during a long drag. */
export type Samples={t:number;x:number}[];
export function addSample(samples:Samples,t:number,x:number,max=8){samples.push({t,x});if(samples.length>max)samples.shift();return samples;}
/**
 * Pointer velocity (px/ms) at `now`: a least-squares slope over the samples in the last VELOCITY_WINDOW ms, so one jittery
 * final event can't fake (or kill) a flick. 0 when the finger had stopped (newest sample older than VELOCITY_STALE).
 */
export function velocity(samples:Samples,now:number):number{
 const last=samples[samples.length-1];if(!last||now-last.t>VELOCITY_STALE)return 0;
 const win=samples.filter(s=>last.t-s.t<=VELOCITY_WINDOW);if(win.length<2)return 0;
 const mt=win.reduce((a,s)=>a+s.t,0)/win.length,mx=win.reduce((a,s)=>a+s.x,0)/win.length;
 let num=0,den=0;for(const s of win){num+=(s.t-mt)*(s.x-mx);den+=(s.t-mt)*(s.t-mt);}
 return den>0?num/den:0;
}

/**
 * Does a release complete the turn? `p` is how far the sheet has turned (0–1) and `speed` the finger's speed along the
 * turn (px/ms, positive = turning further). A flick forward completes it, a flick back cancels it (even past halfway);
 * otherwise it completes past `threshold`.
 */
export function releaseCompletes(p:number,speed:number,threshold=.5):boolean{
 if(speed>=FLICK_SPEED&&p>=FLICK_MIN_P)return true;
 if(speed<=-FLICK_SPEED)return false;
 return p>threshold;
}

/**
 * How the released sheet settles from `from` to `to` (p), keeping the finger's speed: `v` is the sheet's speed at release
 * (p per ms). Returns the duration (ms) and the pose at q (0–1 through it): a cubic Hermite curve that leaves at the
 * release speed and lands with zero speed. The start slope is capped so it never overshoots, and a speed against the
 * motion is dropped (the sheet then eases out of rest).
 */
export function settleCurve(from:number,to:number,v:number){
 const span=to-from,dist=Math.abs(span);
 // Long way to go: up to ~440 ms; a short hop: ~180 ms. A fast flick shortens it (it already moves quickly).
 let duration=Math.max(180,Math.min(460,150+380*dist));
 const speed=Math.sign(span)===Math.sign(v)?Math.abs(v):0;
 if(speed>0&&dist>0)duration=Math.max(180,Math.min(duration,2.6*dist/speed));
 // Hermite start tangent in p over the whole duration; ≤ 3 × span keeps the curve monotone (no overshoot).
 const m=Math.sign(span)*Math.min(speed*duration,2.7*dist);
 const at=(q:number)=>{const u=clamp01(q),u2=u*u,u3=u2*u;
  return (2*u3-3*u2+1)*from+(u3-2*u2+u)*m+(-2*u3+3*u2)*to;};
 return {duration:Math.round(duration),at};
}

/**
 * Rubber band: a pull of `x` px past the end gives way less and less, approaching `dim` (the iOS overscroll curve,
 * d·(1 − 1/(c·x/d + 1))). Sign follows x.
 */
export function rubberBand(x:number,dim:number,c=.55):number{
 if(!dim)return 0;const a=Math.abs(x);return Math.sign(x)*dim*(1-1/(c*a/dim+1));
}
/**
 * The resting page's give when pulled past the first or last page: a small lift about its hinge (degrees, up to ~12°) when
 * pulled away from the hinge side, or a short slide (px) when there is no hinge to lift from (a phone's first page pulled
 * right). `pull` is the drag distance in px (positive), `pageW` the page width.
 */
export function edgeGive(pull:number,pageW:number){
 const give=rubberBand(Math.max(0,pull),pageW*.5);
 return {deg:Math.min(12,Math.atan2(give,pageW)*180/Math.PI*1.6),px:give*.45};
}

export const clamp01=(v:number)=>v<0?0:v>1?1:v;
