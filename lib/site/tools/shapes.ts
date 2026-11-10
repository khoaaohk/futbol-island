import {FORMATIONS} from '../formations';
import type {Shape} from './lineup';
/** Every formation as the light shape the lineup builder needs (server side; passed to the client component as a prop, so the
 *  browser never loads the formation pages' words or the lesson catalog). */
export const SHAPES:readonly Shape[]=FORMATIONS.map(f=>({slug:f.slug,format:f.format,shape:f.shape,lines:f.lines}));
export const shapeBySlug=(slug:string)=>SHAPES.find(s=>s.slug===slug);
