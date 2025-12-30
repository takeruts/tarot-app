import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'AIタロット占い - あなたの内面を整理する神託'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0a0a20 0%, #1a1a3e 50%, #2a2a5e 100%)',
          position: 'relative',
        }}
      >
        {/* Background stars effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 30%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* Crystal ball icon */}
          <div
            style={{
              fontSize: 180,
              marginBottom: 30,
              filter: 'drop-shadow(0 0 30px rgba(102, 126, 234, 0.6))',
            }}
          >
            🔮
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              background: 'linear-gradient(to bottom, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.05em',
              marginBottom: 20,
              textAlign: 'center',
              fontFamily: 'sans-serif',
            }}
          >
            AIタロット占い
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: '#a5b4fc',
              fontWeight: 600,
              letterSpacing: '0.1em',
              textAlign: 'center',
              opacity: 0.9,
              fontFamily: 'sans-serif',
            }}
          >
            あなたの内面を整理する神託
          </div>

          {/* Decorative line */}
          <div
            style={{
              marginTop: 40,
              width: 300,
              height: 2,
              background: 'linear-gradient(to right, transparent 0%, #667eea 50%, transparent 100%)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
