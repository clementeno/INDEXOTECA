import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Infinite Bento Gallery',
  description: 'Galería infinita ultra-suave estilo public.work'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-zinc-100 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900"
        >
          Saltar al contenido
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
