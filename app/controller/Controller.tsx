"use client";

import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { relayClient, relayChannel } from "@/lib/relayClient";
import { createInputHeartbeat } from "@/lib/inputSafety";

const R = 56; // joystick throw radius in px
type Presence = { role?: string };

type Status = "unavailable" | "connecting" | "paired" | "no-host" | "full" | "lost" | "no-room";

type Doc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => Promise<void>; msExitFullscreen?: () => Promise<void> };
type El = HTMLElement & { webkitRequestFullscreen?: () => Promise<void>; msRequestFullscreen?: () => Promise<void> };
const fsSupported = () => typeof document !== "undefined" && !!((document.documentElement as El).requestFullscreen || (document.documentElement as El).webkitRequestFullscreen);
const isFsOn = () => { const d = document as Doc; return !!(d.fullscreenElement || d.webkitFullscreenElement); };
// call these SYNCHRONOUSLY inside a click handler so the browser keeps the user-gesture
const goFs = () => {
  const el = document.documentElement as El;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (req) { try { (req.call(el) as Promise<void> | undefined)?.catch?.(() => {}); } catch {} }
  try { (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.("landscape")?.catch?.(() => {}); } catch {}
};
const leaveFs = () => {
  const d = document as Doc;
  const ex = d.exitFullscreen || d.webkitExitFullscreen || d.msExitFullscreen;
  if (ex) { try { (ex.call(d) as Promise<void> | undefined)?.catch?.(() => {}); } catch {} }
};

export default function Controller() {
  const [mounted, setMounted] = useState(false);
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("connecting");
  const [started, setStarted] = useState(false);
  const pairedRef=useRef(false);pairedRef.current=status==='paired';
  const [score, setScore] = useState<{ gold: number; blue: number } | null>(null);
  const [knob, setKnob] = useState({ kx: 0, ky: 0, active: false });
  const [portrait, setPortrait] = useState(false);
  const [fs, setFs] = useState(false);
  const [fsAvail, setFsAvail] = useState(false); // Fullscreen API present (NOT on iPhone — WebKit blocks it)
  const [sprinting, setSprinting] = useState(false);
  const [jockeying, setJockeying] = useState(false);
  const [charge, setCharge] = useState(0); // shot charge 0..1
  const chRef = useRef<RealtimeChannel | null>(null);
  const stick = useRef({ mx: 0, my: 0 });
  const joyId = useRef<number | null>(null);
  const baseRef = useRef<HTMLDivElement | null>(null);
  const wakeRef = useRef<{ release: () => void } | null>(null);
  const hapticRef = useRef<HTMLLabelElement | null>(null); // iOS 17.4+ switch-input haptic trick

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("room");
    setRoom(r ? r.toUpperCase() : null);
    if (!r) setStatus("no-room");
  }, []);

  useEffect(() => setFsAvail(fsSupported()), []);
  // give the hidden checkbox the `switch` attribute so toggling it ticks the Taptic engine
  // (runs once the gamepad — and its haptic label — is actually on screen)
  useEffect(() => { if (started) hapticRef.current?.querySelector("input")?.setAttribute("switch", ""); }, [started]);

  useEffect(() => {
    const checkO = () => setPortrait(window.innerHeight > window.innerWidth);
    const onFs = () => setFs(isFsOn());
    checkO();
    window.addEventListener("resize", checkO);
    window.addEventListener("orientationchange", checkO);
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => { window.removeEventListener("resize", checkO); window.removeEventListener("orientationchange", checkO); document.removeEventListener("fullscreenchange", onFs); document.removeEventListener("webkitfullscreenchange", onFs); };
  }, []);

  useEffect(() => {
    const b = document.body.style as CSSStyleDeclaration & { overscrollBehavior?: string };
    const h = document.documentElement.style as CSSStyleDeclaration & { overscrollBehavior?: string };
    const prev = { bo: b.overflow, bt: b.touchAction, ho: h.overscrollBehavior, bg: b.background, hbg: h.background, hbc: h.backgroundColor };
    b.overflow = "hidden"; b.touchAction = "none"; h.overscrollBehavior = "none";
    // ONE background: paint the whole-screen root <html> with the controller's gradient (it
    // covers the landscape safe-area strips edge to edge); everything above is transparent,
    // so there's no seam between the pad and the side strips.
    h.background = "radial-gradient(130% 115% at 50% 0%, #1b2740 0%, #0b111c 72%)";
    // iOS fills the landscape safe-area insets (beside the notch / home bar) with the ROOT's
    // background-COLOR, not the gradient image — without this they render white. Match the
    // gradient's edge colour so the strips blend in.
    h.backgroundColor = "#0b111c";
    b.background = "transparent";
    return () => { b.overflow = prev.bo ?? ""; b.touchAction = prev.bt ?? ""; h.overscrollBehavior = prev.ho ?? ""; b.background = prev.bg ?? ""; h.background = prev.hbg ?? ""; h.backgroundColor = prev.hbc ?? ""; };
  }, []);

  useEffect(() => {
    if (!room) return;
    let cancelled = false;
    setStatus("connecting");
    const sb = relayClient();
    if (!sb) { setStatus("unavailable"); return; }
    const ch = sb.channel(relayChannel(room), { config: { broadcast: { self: false }, presence: { key: "controller" } } });
    chRef.current = ch;
    let tracked = false;

    // host → controller: live score
    ch.on("broadcast", { event: "state" }, ({ payload }) => { const m = (payload ?? {}) as { gold?: number; blue?: number }; setScore({ gold: m.gold ?? 0, blue: m.blue ?? 0 }); });

    // figure out pairing from presence: once a host is in the room, join it as the controller
    const evaluate = () => {
      if (cancelled) return;
      const members = Object.values(ch.presenceState<Presence>()).flat();
      const hasHost = members.some((p) => p.role === "host");
      if (!hasHost) { setStatus(tracked ? "lost" : "no-host"); return; }
      if (!tracked && members.some((p) => p.role === "controller")) { setStatus("full"); return; }
      if (!tracked) { tracked = true; ch.track({ role: "controller" }); }
      setStatus("paired");
    };
    ch.on("presence", { event: "sync" }, evaluate);
    ch.subscribe((status) => { if (status === "SUBSCRIBED") evaluate(); else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setStatus("lost"); });

    return () => {
      cancelled = true;
      chRef.current = null;
      sb.removeChannel(ch);
    };
  }, [room]);

  useEffect(() => {
    const heartbeat = createInputHeartbeat((axes) => send({ type: "input", ...axes }));
    const id = setInterval(() => {
      if (!document.hidden) heartbeat(stick.current);
    }, 33);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState === "visible" && started) {
        try { wakeRef.current = (await (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release: () => void }> } }).wakeLock?.request("screen")) ?? null; } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [started]);

  const send = (obj: { type: string } & Record<string, unknown>) => { if(pairedRef.current)chRef.current?.send({ type: "broadcast", event: obj.type, payload: obj }); };
  const buzz = (n: number) => {
    try { (navigator as Navigator & { vibrate?: (n: number) => void }).vibrate?.(n); } catch {} // Android
    try { hapticRef.current?.click(); } catch {} // iOS 17.4+ (Vibration API is unsupported on WebKit)
  };
  const tap = (type: string) => { send({ type }); buzz(type === "shoot" ? 26 : 15); };
  const sprintOn = (e: React.PointerEvent) => { e.preventDefault(); send({ type: "sprint", on: true }); setSprinting(true); buzz(12); };
  const sprintOff = () => { send({ type: "sprint", on: false }); setSprinting(false); };
  const jockeyOn = (e: React.PointerEvent) => { e.preventDefault(); send({ type: "jockey", on: true }); setJockeying(true); buzz(10); };
  const jockeyOff = () => { send({ type: "jockey", on: false }); setJockeying(false); };

  // SHOOT is hold-to-charge: tap = placed shot, hold = rocket. A ring around the button fills.
  const CHARGE_MS = 480;
  const chargeStart = useRef(0);
  const chargeRaf = useRef(0);
  useEffect(()=>{if(status!=='paired'){stick.current={mx:0,my:0};joyId.current=null;chargeStart.current=0;cancelAnimationFrame(chargeRaf.current);setKnob({kx:0,ky:0,active:false});setCharge(0);setSprinting(false);setJockeying(false);}},[status]);
  useEffect(() => {
    const release = () => {
      stick.current.mx = stick.current.my = 0;
      joyId.current = null;
      chargeStart.current = 0;
      cancelAnimationFrame(chargeRaf.current);
      setKnob({ kx: 0, ky: 0, active: false });
      setCharge(0); setSprinting(false); setJockeying(false);
      send({ type: "release" });
    };
    const hidden = () => { if (document.hidden) release(); };
    window.addEventListener("blur", release);
    window.addEventListener("pagehide", release);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", release);
      window.removeEventListener("pagehide", release);
      document.removeEventListener("visibilitychange", hidden);
      cancelAnimationFrame(chargeRaf.current);
    };
    // send reads the current channel ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const shootDown = (e: React.PointerEvent) => {
    e.preventDefault();
    chargeStart.current = performance.now();
    buzz(10);
    const loop = () => { if (!chargeStart.current) return; setCharge(Math.min(1, (performance.now() - chargeStart.current) / CHARGE_MS)); chargeRaf.current = requestAnimationFrame(loop); };
    chargeRaf.current = requestAnimationFrame(loop);
  };
  const shootUp = () => {
    if (!chargeStart.current) return;
    const held = performance.now() - chargeStart.current;
    chargeStart.current = 0; cancelAnimationFrame(chargeRaf.current);
    const power = Math.max(0.2, Math.min(1, held / CHARGE_MS));
    send({ type: "shoot", power });
    buzz(20 + Math.round(power * 14));
    setCharge(0);
  };

  // fixed visible joystick — drag from anywhere in the left zone; knob tracks from base centre
  const applyStick = (cx: number, cy: number) => {
    const b = baseRef.current?.getBoundingClientRect();
    if (!b) return;
    const bx = b.left + b.width / 2, by = b.top + b.height / 2;
    let dx = cx - bx, dy = cy - by;
    const d = Math.hypot(dx, dy);
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
    stick.current.mx = dx / R; stick.current.my = -dy / R;
    setKnob({ kx: dx, ky: dy, active: true });
  };
  const joyDown = (e: React.PointerEvent) => { if (joyId.current !== null) return; joyId.current = e.pointerId; try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {} applyStick(e.clientX, e.clientY); };
  const joyMove = (e: React.PointerEvent) => { if (e.pointerId === joyId.current) applyStick(e.clientX, e.clientY); };
  const joyUp = (e: React.PointerEvent) => { if (e.pointerId !== joyId.current) return; joyId.current = null; stick.current.mx = 0; stick.current.my = 0; setKnob({ kx: 0, ky: 0, active: false }); };

  const start = () => { setStarted(true); goFs(); (navigator as Navigator & { wakeLock?: { request: (t: string) => Promise<{ release: () => void }> } }).wakeLock?.request("screen").then((w) => { wakeRef.current = w; }).catch(() => {}); };
  const toggleFs = () => { if (isFsOn()) leaveFs(); else goFs(); };

  const statusText: Record<Status, string> = {
    unavailable: "Phone pairing is not configured on this island yet", connecting: "Connecting…", paired: "Connected", "no-host": "No game found — scan the QR again", full: "Controller already connected", lost: "Reconnecting…", "no-room": "Scan the QR on your computer",
  };
  const ok = status === "paired";

  if (!mounted) return <div className="ctrl-root" />;

  if (!started) {
    return (
      <div className="ctrl-root">
        <div className="ctrl-gate">
          <div className="ctrl-logo">⚽</div>
          <div className="ctrl-badge">Futbol Island · Controller</div>
          <div className={`ctrl-status ${ok ? "ok" : status === "connecting" ? "wait" : "bad"}`}><span className={`dot ${ok ? "ok" : status === "connecting" ? "wait" : "bad"}`} />{statusText[status]}</div>
          {room && <div className="ctrl-room">ROOM {room}</div>}
          <button className="ctrl-start" onClick={start} disabled={!ok}>▶ Start Controller</button>
          <div className="ctrl-hint">Turn your phone sideways 📱 and hold with two thumbs</div>
        </div>
      </div>
    );
  }

  if (portrait) {
    return (
      <div className="ctrl-root">
        <div className="ctrl-rotate">
          <div className="rot-phone">📱</div>
          <div className="rot-text">Rotate your phone sideways</div>
          <div className="rot-sub">The controller uses the full width in landscape</div>
        </div>
      </div>
    );
  }

  const FS = fs
    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>;

  return (
    <div className="ctrl-root">
      {/* off-screen switch toggled on every action → a haptic tick on iOS (Android uses navigator.vibrate) */}
      <label ref={hapticRef} className="ios-haptic" aria-hidden="true"><input type="checkbox" tabIndex={-1} /></label>
      <div className="gp">
        {/* shoulder buttons */}
        <button className="sh lb" onPointerDown={(e) => { e.preventDefault(); tap("switch"); }}>LB<small>switch</small></button>
        <button className={`sh lt ${jockeying ? "on" : ""}`} onPointerDown={jockeyOn} onPointerUp={jockeyOff} onPointerLeave={jockeyOff} onPointerCancel={jockeyOff}>LT<small>jockey</small></button>
        <button className={`sh rb ${sprinting ? "on" : ""}`} onPointerDown={sprintOn} onPointerUp={sprintOff} onPointerLeave={sprintOff} onPointerCancel={sprintOff}>RB<small>sprint</small></button>
        <button className="sh rt soon">RT<small>soon</small></button>

        {/* top bar */}
        <div className="gp-top">
          <div className={`ctrl-chip ${ok ? "ok" : "bad"}`}><span className={`dot ${ok ? "ok" : "bad"}`} />{ok ? "Connected" : statusText[status]}</div>
          <div className="ctrl-score">{score ? <><b className="g">{score.gold}</b><span>–</span><b className="b">{score.blue}</b></> : "⚽"}</div>
          {fsAvail ? <button className="ctrl-fs" onClick={toggleFs} aria-label="Full screen">{FS}</button> : <div className="ctrl-fs-spacer" />}
        </div>

        {/* LEFT — analog stick */}
        <div className="stick-zone" onPointerDown={joyDown} onPointerMove={joyMove} onPointerUp={joyUp} onPointerCancel={joyUp}>
          <div className={`joy-base ${knob.active ? "on" : ""}`} ref={baseRef}>
            <span className="ar up">▲</span><span className="ar dn">▼</span><span className="ar lf">◀</span><span className="ar rt">▶</span>
            <div className="joy-knob" style={{ transform: `translate(${knob.kx}px, ${knob.ky}px)` }} />
          </div>
          <div className="joy-label">MOVE</div>
        </div>

        {/* RIGHT — face-button diamond */}
        <div className="face">
          <button className="fb y" onPointerDown={(e) => { e.preventDefault(); tap("switch"); }}><span className="lt2">Y</span><small>switch</small></button>
          <button className="fb x" onPointerDown={(e) => { e.preventDefault(); tap("through"); }}><span className="lt2">X</span><small>through</small></button>
          <button className={`fb b ${charge > 0 ? "charging" : ""}`} onPointerDown={shootDown} onPointerUp={shootUp} onPointerLeave={shootUp} onPointerCancel={shootUp}>
            {charge > 0 && <span className="charge-ring" style={{ background: `conic-gradient(#fff ${charge * 360}deg, rgba(255,255,255,0.15) 0)` }} />}
            <span className="lt2">B</span><small>shoot</small>
          </button>
          <button className="fb a" onPointerDown={(e) => { e.preventDefault(); tap("pass"); }}><span className="lt2">A</span><small>pass</small></button>
        </div>
      </div>
    </div>
  );
}
