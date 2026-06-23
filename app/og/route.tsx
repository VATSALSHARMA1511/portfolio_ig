import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#080808',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: '#F5F5F0',
            lineHeight: 1.1,
            marginBottom: '24px',
          }}
        >
          Vatsal Sharma
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#F5F5F0',
            opacity: 0.6,
            fontStyle: 'italic',
          }}
        >
          I build for the version after the demo.
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
