import {MOTION_REFERENCE} from './motionReference';
const rowIndex=(n:number,loop:boolean)=>loop?((n%24)+24)%24:Math.max(0,Math.min(24,n));
/** Compact offline-retargeted upper-body accents. Contact/feet remain procedural.
 * Cubic interpolation keeps velocity continuous between the 25 stored samples.
 */
export function sampleMotionReference(kind:'run'|'shot',phase:number,out:Float64Array,offset=0){
 const rows=MOTION_REFERENCE[kind],loop=kind==='run',p=(loop?((phase%1)+1)%1:Math.max(0,Math.min(1,phase)))*24,i=Math.floor(p),t=p-i;
 const a=rows[rowIndex(i-1,loop)],b=rows[rowIndex(i,loop)],c=rows[rowIndex(i+1,loop)],d=rows[rowIndex(i+2,loop)];
 for(let j=0;j<6;j++)out[offset+j]=.5*((2*b[j])+(-a[j]+c[j])*t+(2*a[j]-5*b[j]+4*c[j]-d[j])*t*t+(-a[j]+3*b[j]-3*c[j]+d[j])*t*t*t);
}
