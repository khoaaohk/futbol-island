'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LOCAL_EMOTES, wheelEmotesFor } from '@/lib/town/emoteReact';
import { ctxWheelFor, type EmoteContext } from '@/lib/town/emoteContexts';
import type { NpcSetKind } from '@/lib/town/npcEmoteSets';
import { moveWheel } from '@/lib/town/moveEmotes';
import { arrowState, arrowTarget, emotePages, type ArrowState } from '@/lib/town/emoteBar';
import { Glyph } from './PartyChip';

/** The ten preset emotes (no free text anywhere). Order matches the wheel; the first five show, the rest scroll in. Closes itself on a pick. */
export const EMOTES = LOCAL_EMOTES;

/** A bar of big round picture buttons beside the Emote button, FIVE per page (owner, Oct 23 2026): swipe / scroll the strip or tap the
 * arrows (one page = five, snapping to pages); the left arrow is disabled at the start, the right one at the end; five or fewer = no arrows.
 * Every townsperson (skaters, scooter riders, jugglers included) gets the standard ten here: their answers live in lib/town/npcEmoteSets.ts.
 * (styles: app/globals.css `.emote-wheel`; paging maths: lib/town/emoteBar.ts). */
/** Pass it (6) and Juggle with me (3) on the ground wheel: greyed while the nearest friend said No twice in a row (relay v1.4 asks). */
const ASK_IDS = new Set([3, 6]);
const SAME = (a: ArrowState, b: ArrowState) => a.single === b.single && a.left === b.left && a.right === b.right && a.page === b.page && a.pages === b.pages;
export default function EmoteWheel({ onPick, onClose, ride = 'walk', ctx = 'ground', npcKind = '', askBlocked = false }: { onPick: (e: number) => void; onClose: () => void; ride?: string; ctx?: EmoteContext; npcKind?: NpcSetKind | ''; askBlocked?: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  const list = ctx === 'move' ? moveWheel() : ctx !== 'ground' ? ctxWheelFor(ctx) : wheelEmotesFor(ride);
  const pages = emotePages(list);
  const [arrows, setArrows] = useState<ArrowState>(() => ({ single: pages.length <= 1, left: false, right: pages.length > 1, page: 0, pages: pages.length }));
  const sync = useCallback(() => { const s = strip.current; if (!s) return; const next = arrowState(s, list.length); setArrows((a) => (SAME(a, next) ? a : next)); }, [list.length]);
  useEffect(() => {
    const s = strip.current; if (!s) return;
    sync();
    const onResize = () => { const el = strip.current; if (el) el.scrollLeft = arrowState(el, list.length).page * el.clientWidth; sync(); }; // keep the page in view after a rotation
    s.addEventListener('scroll', sync, { passive: true }); window.addEventListener('resize', onResize); window.addEventListener('orientationchange', onResize);
    return () => { s.removeEventListener('scroll', sync); window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); };
  }, [sync, list.length, ctx, ride]);
  const page = (dir: 1 | -1) => {
    const s = strip.current; if (!s) return;
    if (dir < 0 ? !arrows.left : !arrows.right) return; // a disabled arrow does nothing
    s.scrollTo({ left: arrowTarget(s, dir), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <div className="emote-wheel" role="group" aria-label="Emotes" data-emote-wheel data-emote-ctx={ctx} data-emote-npc={npcKind || undefined} data-emote-pages={pages.length} data-emote-page={arrows.page} data-emote-single={arrows.single ? '' : undefined}>
      {!arrows.single && <button type="button" className="emote-wheel-arrow" aria-label="Earlier emotes" aria-disabled={!arrows.left} data-off={arrows.left ? undefined : ''} tabIndex={arrows.left ? undefined : -1} onClick={() => page(-1)}>‹</button>}
      <div className="emote-wheel-strip" ref={strip}>
        {pages.map((pg, i) => (
          <div key={i} className="emote-wheel-page" role="presentation">
            {pg.map((x) => { const off = askBlocked && ctx === 'ground' && !npcKind && ASK_IDS.has(x.emote); return (
              <button key={x.emote} type="button" className="emote-wheel-btn" aria-label={x.label} title={off ? 'Try again in a bit' : x.label} aria-disabled={off || undefined}
                disabled={off} data-ask-blocked={off ? '' : undefined} style={off ? { opacity: .42, filter: 'grayscale(1)' } : undefined} onClick={() => { if (off) return; onPick(x.emote); onClose(); }}>
                <Glyph name={x.icon} size={26} />
              </button>); })}
          </div>
        ))}
      </div>
      {!arrows.single && <button type="button" className="emote-wheel-arrow" aria-label="More emotes" aria-disabled={!arrows.right} data-off={arrows.right ? undefined : ''} tabIndex={arrows.right ? undefined : -1} onClick={() => page(1)}>›</button>}
    </div>
  );
}
