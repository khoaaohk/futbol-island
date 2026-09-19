import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { relayClient, relayChannel } from "./relayClient";
import { remoteInput, resetRemoteInput } from "./remoteInput";
import { createInputWatchdog } from "./inputSafety";

// unambiguous alphabet (no O/0/I/1/L) so a 4-char room code is easy to read off a screen
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const clamp1 = (v: number) => (Number.isFinite(v) ? Math.max(-1, Math.min(1, v)) : 0);
function genCode() { let s = ""; for (const value of crypto.getRandomValues(new Uint32Array(6))) s += CODE_CHARS[value % CODE_CHARS.length]; return s; }
type Presence = { role?: string };

// Desktop side of the phone controller: joins the room channel as "host" and streams the phone's
// input into the shared `remoteInput` singleton (which BabylonStage reads each frame).
export function usePhoneController(enabled: boolean) {
  const [code] = useState(genCode);
  const [available,setAvailable]=useState(false);
  const [relayStatus,setRelayStatus]=useState<'connecting'|'ready'|'error'>('connecting');
  const [connected, setConnected] = useState(false);
  const [lanIp, setLanIp] = useState<string | null>(null);
  const chRef = useRef<RealtimeChannel | null>(null);
  // host → controller (e.g. the live score); sent on the "state" broadcast event
  const send = useRef((obj: Record<string, unknown>) => { chRef.current?.send({ type: "broadcast", event: "state", payload: obj }); }).current;

  useEffect(() => {
    fetch("/api/lan").then((r) => r.json()).then((d) => setLanIp(d.ip)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const sb = relayClient();
    setAvailable(!!sb);
    if (!sb) return; // Supabase env not configured — controller simply stays unavailable
    const ch = sb.channel(relayChannel(code), { config: { broadcast: { self: false }, presence: { key: "host" } } });
    chRef.current = ch;
    const watchdog = createInputWatchdog(resetRemoteInput);
    const watchdogTimer = window.setInterval(() => watchdog.check(), 100);
    const releaseInput = () => watchdog.reset();
    const visibilityInput = () => { if (document.hidden) releaseInput(); };
    window.addEventListener("blur", releaseInput);
    document.addEventListener("visibilitychange", visibilityInput);

    const apply = (event: string, payload: { mx?: number; my?: number; power?: number; on?: boolean }) => {
      if (document.hidden || !remoteInput.connected) return;
      watchdog.touch();
      switch (event) {
        case "release": watchdog.reset(); break;
        case "input":
          remoteInput.mx = clamp1(payload.mx as number); remoteInput.my = clamp1(payload.my as number);
          remoteInput.active = Math.hypot(remoteInput.mx, remoteInput.my) > 0.08; break;
        case "pass": remoteInput.passEdge = true; break;
        case "shoot": remoteInput.shootEdge = true; remoteInput.shootPower = Number.isFinite(payload.power) ? Math.max(0, Math.min(1, payload.power!)) : 1; break;
        case "through": remoteInput.throughEdge = true; break;
        case "switch": remoteInput.switchEdge = true; break;
        case "sprint": remoteInput.sprint = !!payload.on; break;
        case "jockey": remoteInput.jockey = !!payload.on; break;
      }
    };
    for (const ev of ["input", "release", "pass", "shoot", "through", "switch", "sprint", "jockey"]) {
      ch.on("broadcast", { event: ev }, ({ payload }) => apply(ev, payload ?? {}));
    }

    // presence tells us when a phone is paired (a controller joined the room)
    const sync = () => {
      const state = ch.presenceState<Presence>();
      const on = Object.values(state).some((arr) => arr.some((p) => p.role === "controller"));
      setConnected(on);
      remoteInput.connected = on;
      if (!on) watchdog.reset();
    };
    ch.on("presence", { event: "sync" }, sync);
    ch.subscribe((status) => {
      if (status === "SUBSCRIBED") {setRelayStatus('ready');ch.track({ role: "host" });}
      else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        setRelayStatus('error');watchdog.reset(); remoteInput.connected = false; setConnected(false);
      }
    });

    return () => {
      clearInterval(watchdogTimer);
      window.removeEventListener("blur", releaseInput);
      document.removeEventListener("visibilitychange", visibilityInput);
      chRef.current = null;
      setConnected(false);
      remoteInput.connected = false;
      resetRemoteInput();
      sb.removeChannel(ch);
    };
  }, [enabled, code]);

  // QR target: locally the phone is a *different device*, so it needs the desktop's LAN IP; in
  // production it just loads the same public origin (https://futbolisland.app/controller?...).
  let base = "";
  if (typeof window !== "undefined") {
    const h = window.location.hostname;
    const port = window.location.port || "8090";
    const isLocal = h === "localhost" || h === "127.0.0.1" || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h);
    base = isLocal ? `http://${lanIp || h}:${port}` : window.location.origin;
  }
  const url = `${base}/controller?room=${code}`;
  return { code, connected, available, relayStatus, url, lanIp, send };
}
export type PhoneController = ReturnType<typeof usePhoneController>;
