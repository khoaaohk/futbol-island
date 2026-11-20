/**
 * GET /api/build-id (Nov 20 2026): the live release's build id, so a tab left open on an older release can tell that a new one
 * is out before it asks for a chunk that no longer exists (lib/buildUpdate.ts). Tiny, never cached, no data about anyone.
 */
export const dynamic='force-dynamic';
export function GET(){
 return Response.json({id:process.env.NEXT_PUBLIC_BUILD_ID||''},{headers:{'Cache-Control':'no-store'}});
}
