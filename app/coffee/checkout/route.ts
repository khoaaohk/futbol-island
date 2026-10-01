// Creates the Stripe Checkout Session for a chosen donation tier and redirects to Stripe.
// Reached from the /coffee picker page as /coffee/checkout?amount=<cents>. Only the known tier
// amounts are accepted (never trust a client-supplied price). Keys live in .env.local /
// Vercel env (STRIPE_SECRET_KEY). Tips are passed on to the local youth-soccer non-profits.

import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS = new Set([500, 1000, 1500, 2500]); // $5 / $10 / $15 / $25 (cents)

/**
 * QA11 (production gating): the grown-up check is client-side, so a typed or pasted /coffee/checkout URL (or one opened from
 * outside the site) must not jump straight to Stripe. Only a navigation started by one of our own pages, i.e. the gated tier
 * links after a pass (ExternalLinkGate opens them), goes on; anything else is sent to /coffee, which asks the grown-up question
 * first. `Sec-Fetch-Site` is set by the browser (not by page script); browsers without it fall back to the same-origin Referer.
 */
function startedOnSite(req: Request, origin: string) {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const referer = req.headers.get("referer");
  try { return !!referer && new URL(referer).origin === origin; } catch { return false; }
}

export async function GET(req: Request) {
  const here = new URL(req.url);
  if (!startedOnSite(req, here.origin)) return NextResponse.redirect(new URL("/coffee", here.origin), 303);
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Donations aren't configured yet." }, { status: 503 });

  const url = new URL(req.url);
  let amount = parseInt(url.searchParams.get("amount") || "500", 10);
  if (!Number.isFinite(amount) || !TIERS.has(amount)) amount = 500; // clamp to a known tier

  const stripe = new Stripe(secret);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Support Futbol Island",
              description:
                "The app is free. Tips go to local youth-soccer non-profits: FC YAP, Street Soccer San Diego & Ronin Futsal.",
            },
            unit_amount: amount,
          },
          quantity: 1,
          adjustable_quantity: { enabled: true, minimum: 1, maximum: 999 }, // bump / multiply at checkout
        },
      ],
      success_url: `${url.origin}/?panel=about&coffee=thanks`,
      cancel_url: `${url.origin}${url.searchParams.get('return')==='about'?'/?panel=about':'/coffee'}`,
    });

    if (!session.url) throw new Error("no session url");
    return NextResponse.redirect(session.url, 303);
  } catch {
    return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
  }
}
