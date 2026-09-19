// Creates the Stripe Checkout Session for a chosen donation tier and redirects to Stripe.
// Reached from the /coffee picker page as /coffee/checkout?amount=<cents>. Only the known tier
// amounts are accepted (never trust a client-supplied price). Keys live in .env.local /
// Vercel env (STRIPE_SECRET_KEY). Tips are passed on to the local youth-soccer non-profits.

import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS = new Set([500, 1000, 1500, 2500]); // $5 / $10 / $15 / $25 (cents)

export async function GET(req: Request) {
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
