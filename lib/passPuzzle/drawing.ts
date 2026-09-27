import type {StrokePoint} from './types';
/** Keep a long gesture bounded without ever freezing its live endpoint. */
export function appendStroke(points:StrokePoint[],point:StrokePoint){
 if(points.length>=128){let write=1;for(let read=2;read<points.length-1;read+=2)points[write++]=points[read];points[write++]=points[points.length-1];points.length=write;}
 points.push(point);
}
