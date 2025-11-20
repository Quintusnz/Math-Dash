import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Math Dash',
    short_name: 'Math Dash',
    description: 'High-performance, offline-first educational math game.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3056D3',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
