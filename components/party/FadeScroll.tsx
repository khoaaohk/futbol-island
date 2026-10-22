'use client';
import { useCallback, useLayoutEffect, useRef, type ReactNode } from 'react';
import styles from './party.module.css';

/** The card's scrolling body: edges fade softly (mask) only where more content waits, never a hard clip. Padding keeps button
 *  edges / focus rings from being cut at rest. */
export default function FadeScroll({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const update = useCallback(() => {
    const el = ref.current; if (!el) return;
    el.dataset.top = el.scrollTop > 2 ? '1' : '0';
    el.dataset.bottom = el.scrollHeight - el.clientHeight - el.scrollTop > 2 ? '1' : '0';
  }, []);
  useLayoutEffect(() => {
    update();
    const el = ref.current; if (!el) return;
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el); if (el.firstElementChild) ro?.observe(el.firstElementChild);
    window.addEventListener('resize', update);
    return () => { ro?.disconnect(); window.removeEventListener('resize', update); };
  }, [update]);
  return <div ref={ref} className={styles.fadeScroll} data-party-scroll onScroll={update}><div>{children}</div></div>;
}
