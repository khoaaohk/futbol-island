import {FORMATIONS} from '../formations';
import type {Shape} from './lineup';
import {SHAPES_8V8} from './shapes8';
export {SHAPES_8V8};
/** Every formation as the light shape the lineup builder needs (server side; passed to the client component as a prop, so the
 *  browser never loads the formation pages' words or the lesson catalog). */
/*  Round 4F: the 8v8 shapes have guide pages now (FORMATIONS), but the builder and the coach app keep shapes8.ts as their source,
 *  so their data is unchanged; tests/seo-tools.cjs checks both lists draw the same spots and labels. */
export const SHAPES:readonly Shape[]=[...FORMATIONS.filter(f=>f.format!=='8v8').map(f=>({slug:f.slug,format:f.format,shape:f.shape,lines:f.lines})),...SHAPES_8V8];
export const shapeBySlug=(slug:string)=>SHAPES.find(s=>s.slug===slug);
