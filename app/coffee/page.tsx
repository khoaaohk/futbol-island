import {Icon} from '@/components/Icon';
// "Support Futbol Island" donation picker — opened from the About-modal "Buy us a coffee" button.
// Presents preset tiers ($5/$10/$15/$25); each link hands the amount to /coffee/checkout, which
// creates the Stripe Checkout Session. Standalone page, styled to match the warm coastal palette.

import Link from "next/link";

export const metadata = {
  title: "Support Futbol Island",
  description: "The app is free — tips go to local youth-soccer non-profits.",
};

const TIERS = [
  { label: "$5", cents: 500 },
  { label: "$10", cents: 1000 },
  { label: "$15", cents: 1500 },
  { label: "$25", cents: 2500 },
];

export default function CoffeePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "linear-gradient(180deg, #f4ddba 0%, #efd2a8 55%, #e8caa2 100%)",
        fontFamily: 'Arial, "Segoe UI", system-ui, sans-serif',
        color: "#294a3e",
      }}
    >
      <div
        style={{
          width: "min(460px, 100%)",
          background: "#efe4c4",
          border: "1px solid #ffefd0",
          borderRadius: "24px",
          boxShadow: "0 12px 36px #172d2530",
          padding: "30px 28px 26px",
          textAlign: "center",
        }}
      >
        <Link href="/?panel=about" style={{color:"#294a3e",display:"block",textAlign:"left",marginBottom:20}}><Icon name="back"/> Back to donations</Link>
        <h1 style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "0.5px", margin: "10px 0 6px" }}>
          Support Futbol Island
        </h1>
        <p style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: "15px", lineHeight: 1.6, color: "#52634e", margin: "0 0 22px" }}>
          The app is free. Every tip goes straight to local youth-soccer non-profits — <a href="https://www.instagram.com/fc_yap/" target="_blank" rel="noopener noreferrer" style={{ color: "#8a582b", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "2px" }}>FC YAP</a>,{" "}
          <a href="https://www.instagram.com/streetsoccersd/" target="_blank" rel="noopener noreferrer" style={{ color: "#8a582b", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "2px" }}>Street Soccer San Diego</a> &amp; <a href="https://www.instagram.com/roninfutsal/" target="_blank" rel="noopener noreferrer" style={{ color: "#8a582b", fontWeight: 800, textDecoration: "underline", textUnderlineOffset: "2px" }}>Ronin Futsal</a>.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
          {TIERS.map((t) => (
            <Link
              key={t.cents}
              href={`/coffee/checkout?amount=${t.cents}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                padding: "18px 0",
                fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
                fontSize: "24px",
                fontWeight: 800,
                color: "#fff3d1",
                background: "#2f5d4a",
                border: "2px solid #23423480",
                borderRadius: "16px",
                boxShadow: "inset 0 0 0 2px #f3e6bc40, 3px 3px 0 #1c3a2e66",
                textDecoration: "none",
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
        <p style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif', fontSize: "12.5px", color: "#52634e", margin: "18px 0 0" }}>
          Pick an amount — you can bump the quantity on the next screen. Secure by Stripe.
        </p>
      </div>
    </main>
  );
}
