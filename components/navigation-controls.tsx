'use client';

import { useLenis } from '@/app/providers';
import { useEffect, useState } from 'react';

export function NavigationControls() {
  const lenis = useLenis();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      setShowTop(window.scrollY > 720);
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollByViewport = (direction: 1 | -1) => {
    const targetY = Math.max(0, window.scrollY + (window.innerHeight * 0.9 * direction));
    if (lenis) {
      lenis.scrollTo(targetY, { duration: 0.9 });
      return;
    }
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.1 });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pointer-events-none fixed bottom-5 right-4 z-40 flex flex-col gap-2 md:bottom-8 md:right-8">
      <button
        type="button"
        onClick={() => scrollByViewport(1)}
        className="pointer-events-auto rounded-full border border-zinc-700/70 bg-zinc-900/85 px-4 py-2 text-xs font-medium text-zinc-100 shadow-lg shadow-black/20 backdrop-blur transition hover:border-zinc-500 hover:bg-zinc-800"
      >
        Bajar
      </button>

      {showTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="pointer-events-auto rounded-full border border-zinc-700/70 bg-zinc-900/90 px-4 py-2 text-xs font-medium text-zinc-100 shadow-lg shadow-black/20 backdrop-blur transition hover:border-zinc-500 hover:bg-zinc-800"
        >
          Subir
        </button>
      )}
    </div>
  );
}
