import type { MetadataRoute } from 'next';

/** Hace que la web se instale como app en el móvil (icono propio, pantalla completa). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Routine Schemer',
    short_name: 'Schemer',
    description: 'Planifica tus ciclos de entrenamiento.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#2e1065',
    lang: 'es',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
