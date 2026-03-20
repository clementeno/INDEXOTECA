'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1
          }
        }
      })
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 0.18 : 0.1,
      smoothWheel: !prefersReducedMotion,
      syncTouch: false,
      infinite: false
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    const start = () => {
      if (rafId !== 0) return;
      rafId = requestAnimationFrame(raf);
    };

    const stop = () => {
      if (rafId === 0) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stop();
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <LenisContext.Provider value={lenisInstance}>{children}</LenisContext.Provider>
    </QueryClientProvider>
  );
}
