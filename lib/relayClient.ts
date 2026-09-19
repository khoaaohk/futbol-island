"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// One shared Supabase realtime connection for the whole tab. The phone controller and the desktop
// game each open one and meet on a per-room Broadcast channel — this replaces the local-only
// relay.js WebSocket, so pairing works over the public internet on Vercel with no server of our
// own to run. Broadcast + Presence are ephemeral (no database tables), and the anon key is
// designed to be shipped to the browser, so there's nothing server-side to host and no cost
// beyond Supabase's free tier. Realtime traffic never touches a Vercel function.
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

// null when the env vars aren't set yet — callers should treat that as "controller unavailable"
export function relayClient(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  if (!client) {
    client = createClient(URL, ANON, {
      auth: { persistSession: false },
      // the joystick streams ~30 msgs/sec; lift the default rate limit so none are dropped
      realtime: { params: { eventsPerSecond: 40 } },
    });
  }
  return client;
}

// unambiguous, case-insensitive room code → channel name
export const relayChannel = (room: string) => `ctrl:${room.toUpperCase()}`;
