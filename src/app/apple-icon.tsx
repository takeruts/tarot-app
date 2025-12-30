import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            marginBottom: 8,
          }}
        >
          🔮
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            letterSpacing: '0.05em',
          }}
        >
          TAROT
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
