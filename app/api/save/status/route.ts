import {saveStatus} from '@/lib/saves/server';
import {saveDeps} from '@/lib/saves/deps';

/**
 * GET /api/save/status → {saving, email}: whether save codes are set up (Supabase + SAVE_CODE_PEPPER + the 20261010 migration)
 * and whether "Send my code to a grown-up" is (RESEND_API_KEY + SAVE_EMAIL_FROM). The game asks once, when a save screen is
 * about to show; until both are true it hides the option or says "Saving isn't ready yet" and play goes on.
 * Cached for a minute at the edge: it is the same for everyone.
 */
export const dynamic='force-dynamic';
export const runtime='nodejs';
export async function GET(){
 const s=await saveStatus(saveDeps());
 return Response.json(s,{headers:{'Cache-Control':'public, max-age=0, s-maxage=60','X-Robots-Tag':'noindex'}});
}
