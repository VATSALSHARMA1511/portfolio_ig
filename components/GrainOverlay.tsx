'use client'

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: "url('/grain.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 200px',
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: 0.04,
      }}
    />
  )
}
