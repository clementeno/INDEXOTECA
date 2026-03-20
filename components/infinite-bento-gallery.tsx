'use client';

import { useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { motion, useReducedMotion } from 'framer-motion';
import type { ImagesPage } from '@/lib/images';

type Props = {
  initialPage: ImagesPage;
};

function getBentoSpanClasses(index: number) {
  if (index % 7 === 0) return 'sm:col-span-2 sm:row-span-2';
  if (index % 5 === 2) return 'sm:col-span-2';
  if (index % 4 === 1) return 'sm:row-span-2';
  return '';
}

async function fetchImagesPage(pageParam: number): Promise<ImagesPage> {
  const res = await fetch(`/api/images?page=${pageParam}`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error('No fue posible cargar las imágenes.');
  }

  return res.json();
}

export function InfiniteBentoGallery({ initialPage }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const { ref, inView } = useInView({
    rootMargin: '800px 0px 800px 0px',
    threshold: 0
  });

  const {
    data,
    error,
    isFetching,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['images'],
    queryFn: ({ pageParam }) => fetchImagesPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: {
      pages: [initialPage],
      pageParams: [1]
    }
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetching, fetchNextPage]);

  const images = useMemo(() => {
    const uniqueById = new Map<string, ImagesPage['images'][number]>();
    const pages = data?.pages ?? [];
    for (const page of pages) {
      for (const image of page.images) {
        if (!uniqueById.has(image.id)) uniqueById.set(image.id, image);
      }
    }
    return Array.from(uniqueById.values());
  }, [data?.pages]);

  if (error) {
    return (
      <section className="px-4 py-10 md:px-8">
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6 text-red-100">
          <p className="text-base font-medium">Error cargando la galería</p>
          <p className="mt-2 text-sm text-red-200/90">{(error as Error).message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-xl border border-red-200/40 px-4 py-2 text-sm hover:bg-red-200/10"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:gap-6 md:p-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="h-[260px] animate-pulse rounded-2xl bg-zinc-800/80 md:rounded-3xl"
          />
        ))}
      </section>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-1 auto-rows-[minmax(200px,1fr)] gap-4 p-4 sm:grid-cols-2 md:gap-6 md:p-8 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {images.map((image, index) => (
          <motion.article
            key={image.id}
            initial={!shouldReduceMotion && index < 80 ? { opacity: 0, y: 20, scale: 0.98 } : false}
            animate={!shouldReduceMotion && index < 80 ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={
              !shouldReduceMotion && index < 80
                ? { duration: 0.55, ease: 'easeOut', delay: Math.min(index * 0.025, 0.35) }
                : undefined
            }
            className={`group overflow-hidden rounded-2xl bg-zinc-900 md:rounded-3xl ${getBentoSpanClasses(index)}`}
            style={{ contentVisibility: 'auto', containIntrinsicSize: '300px 260px' }}
          >
            <img
              src={image.url}
              alt={image.alt || ''}
              loading="lazy"
              decoding="async"
              fetchPriority={index < 6 ? 'high' : 'low'}
              draggable={false}
              className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
            />
          </motion.article>
        ))}

        {isFetchingNextPage &&
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`page-skeleton-${index}`}
              className="h-[240px] animate-pulse rounded-2xl bg-zinc-800/70 md:rounded-3xl"
            />
          ))}

        <div ref={ref} className="col-span-full h-20" />
      </div>

      <div aria-live="polite" className="px-4 pb-10 md:px-8">
        {isFetching && !isFetchingNextPage && (
          <p className="text-sm text-zinc-400">Actualizando resultados...</p>
        )}
        {isFetchingNextPage && <p className="text-sm text-zinc-300">Cargando más imágenes...</p>}
        {!hasNextPage && images.length > 0 && (
          <p className="text-sm text-zinc-500">No more results.</p>
        )}
      </div>
    </section>
  );
}
