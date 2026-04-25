import { useEffect, useRef, useState } from 'react';

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useCountUp(target: number, duration = 700): number {
  const [displayed, setDisplayed] = useState(reducedMotion ? target : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // ease-out-quart: fast start, graceful deceleration
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplayed(Math.round(eased * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return displayed;
}
