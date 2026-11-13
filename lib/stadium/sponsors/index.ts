/**
 * Stadium sponsors: the lazy entry the stadium imports (Nov 12 2026). This file pulls in no three.js, no canvas and no network:
 * the surfaces module (and its one fetch of /api/stadium-sponsors) loads the first time the player comes within
 * SPONSOR_LOAD_RADIUS of the stadium, once per page.
 *
 *   // in the stadium's existing proximity check (no new loop):
 *   if(dist<SPONSOR_LOAD_RADIUS)ensureStadiumSponsors(stadiumGroup).then(s=>{ ... s.setScreenSponsor(!matchOn) ... });
 *
 * See surfaces.ts for the cost model and layout.ts for the layout format.
 */
import type {SponsorLayout} from './layout';
import type {SponsorSurfaces,SurfaceOptions} from './surfaces';

/** Start loading when the player is this close to the stadium centre (metres): before the boards are big on screen. */
export const SPONSOR_LOAD_RADIUS=220;

export const loadSponsorModule=()=>import('./surfaces');
let pending:Promise<SponsorSurfaces>|null=null;
/** Build the sponsor surfaces once (later calls get the same promise). A failure clears it so a later approach can retry. */
export function ensureStadiumSponsors(parent:import('three').Object3D,layout?:SponsorLayout,opt?:SurfaceOptions):Promise<SponsorSurfaces>{
 pending??=loadSponsorModule().then(m=>m.createSponsorSurfaces(parent,layout,opt)).catch(e=>{pending=null;throw e;});
 return pending;
}
/** Remove and free everything (the stadium is unloaded); the next approach builds again. */
export async function disposeStadiumSponsors(){const p=pending;pending=null;if(p)try{(await p).dispose();}catch{/* never built */}}
export type {SponsorLayout,SponsorQuad} from './layout';
export type {SponsorSurfaces} from './surfaces';
export {defaultStadiumLayout} from './layout';
export {SPONSOR_SLOTS,SLOT_SPECS,type SponsorSlot} from './slots';
