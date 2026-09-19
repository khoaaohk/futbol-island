import { NextResponse } from "next/server";
import os from "os";

// Best-guess LAN IPv4 so the desktop can build a QR the phone can actually reach.
// (localhost/127.0.0.1 works for the desktop but a phone can't reach it.)
export const dynamic = "force-dynamic";

export function GET() {
  let ip = "localhost";
  const ifaces = os.networkInterfaces();
  const prefer = (name: string) => /en0|eth0|wlan0|Wi-Fi/i.test(name); // typical Wi-Fi/ethernet first
  const candidates: { name: string; addr: string }[] = [];
  for (const [name, addrs] of Object.entries(ifaces)) {
    for (const a of addrs || []) {
      if (a.family === "IPv4" && !a.internal) candidates.push({ name, addr: a.address });
    }
  }
  const pick = candidates.find((c) => prefer(c.name)) || candidates[0];
  if (pick) ip = pick.addr;
  return NextResponse.json({ ip });
}
