import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aprende con Ritmo',
    short_name: 'Ritmo App',
    description: 'Plataforma de Gestión para Educación Musical',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#FF8B7A',
    categories: ['education', 'music', 'productivity'],
    id: 'com.ritmo.app',
    dir: 'ltr',
    lang: 'es',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
