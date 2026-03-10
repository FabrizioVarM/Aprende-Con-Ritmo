import { ImageResponse } from 'next/og'

// Aumentamos el tamaño base para que sirva tanto para favicon como para icono de app
export const size = {
  width: 512,
  height: 512,
}
export const contentType = 'image/png'

// Generación del icono (Favicon y App Icon)
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 300,
          background: '#FF8B7A',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '120px',
          fontWeight: 'bold',
        }}
      >
        <svg
          width="350"
          height="350"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
