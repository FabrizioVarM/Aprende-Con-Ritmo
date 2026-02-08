import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aprende Con Ritmo',
    short_name: 'AprendeRitmo',
    description: 'Plataforma de Gestión para Educación Musical',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff', // Fondo de la pantalla de carga (Splash Screen)
    theme_color: '#FF8B7A',      // Color de la barra superior del móvil
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
