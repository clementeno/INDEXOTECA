import fs from 'node:fs/promises';
import path from 'node:path';

export type GalleryImage = {
  id: string;
  url: string;
  alt?: string;
};

export type ImagesPage = {
  images: GalleryImage[];
  nextPage: number | null;
};

const PAGE_SIZE = 20;
const IMAGE_EXT = /\.(avif|jpe?g|png|webp|gif)$/i;

let cachedImages: GalleryImage[] | null = null;

async function getAllImages(): Promise<GalleryImage[]> {
  if (cachedImages) return cachedImages;

  const imagesDir = path.join(process.cwd(), 'public', 'images');
  const files = await fs.readdir(imagesDir);

  cachedImages = files
    .filter((file) => IMAGE_EXT.test(file))
    .sort((a, b) => a.localeCompare(b, 'es'))
    .map((file, index) => {
      const cleanName = file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      return {
        id: `${index}-${file}`,
        url: `/images/${encodeURIComponent(file)}`,
        alt: cleanName || `Imagen ${index + 1}`
      };
    });

  return cachedImages;
}

export async function getImagesPage(page: number): Promise<ImagesPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const allImages = await getAllImages();

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const images = allImages.slice(start, end);
  const nextPage = end < allImages.length ? safePage + 1 : null;

  return { images, nextPage };
}
