import { InfiniteBentoGallery } from '@/components/infinite-bento-gallery';
import { getImagesPage } from '@/lib/images';

export default async function Page() {
  const initialPage = await getImagesPage(1);

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="px-4 pb-2 pt-8 md:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">Referencioteca</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 md:text-4xl">Bento Infinite Gallery</h1>
      </header>

      <InfiniteBentoGallery initialPage={initialPage} />
    </main>
  );
}
