'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

export default function Hero() {
  const line1Ref = useRef<HTMLSpanElement>(null)
  const line2Ref = useRef<HTMLSpanElement>(null)
  const punchlineRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const bottomLeftRef = useRef<HTMLSpanElement>(null)
  const bottomRightRef = useRef<HTMLSpanElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 })
  const [spotlightActive, setSpotlightActive] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setSpotlightActive(true)
    if (prefersReduced) return

    const els = [
      line1Ref.current,
      line2Ref.current,
      punchlineRef.current,
      subtitleRef.current,
      badgeRef.current,
      bottomLeftRef.current,
      bottomRightRef.current,
    ].filter(Boolean)

    gsap.set(els, { opacity: 0, y: 30 })

    const tl = gsap.timeline({ delay: 0.1 })

    tl.to(line1Ref.current, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
      .to(line2Ref.current, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.45')
      .to(punchlineRef.current, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, '+=0.05')
      .to(badgeRef.current, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' }, '<')
      .to(
        [bottomLeftRef.current, bottomRightRef.current],
        { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out', stagger: 0.1 },
        '+=0.1'
      )

    return () => { tl.kill() }
  }, [])

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10vw',
        overflow: 'hidden',
        background: spotlightActive
          ? `radial-gradient(600px circle at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.04), transparent 80%)`
          : 'transparent',
      }}
    >
      {/* Availability badge */}
      <div
        ref={badgeRef}
        style={{
          position: 'absolute',
          top: '6rem',
          right: '2rem',
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontVariant: 'small-caps',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#F5F5F0',
          border: '1px solid rgba(245,245,240,0.3)',
          padding: '6px 12px',
        }}
        aria-label="Availability status"
      >
        LET'S BUILD TOGETHER
      </div>

      {/* Main headline */}
      <div>
        <h1
          aria-label="Hey, I'm Vatsal. I build for the version after the demo."
          style={{ margin: 0, lineHeight: 1.0 }}
        >
          {/* Hey, I'm */}
          <span
            ref={line1Ref}
            aria-hidden="true"
            style={{
              display: 'block',
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(3rem, 7vw, 7.5rem)',
              fontWeight: 700,
              fontStyle: 'normal',
              color: '#F5F5F0',
              lineHeight: 1.05,
            }}
          >
            Hey, I&apos;m
          </span>

          {/* VATSAL */}
          <span
            ref={line2Ref}
            aria-hidden="true"
            style={{
              display: 'block',
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(5rem, 13vw, 14rem)',
              fontWeight: 700,
              fontStyle: 'italic',
              color: '#F5F5F0',
              lineHeight: 0.9,
              marginLeft: '-0.04em', // optical alignment
              letterSpacing: '-0.02em',
            }}
          >
            Vatsal.
          </span>
        </h1>

        {/* Punchline */}
        <p
          ref={punchlineRef}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: 'clamp(1rem, 1.8vw, 1.4rem)',
            color: '#F5F5F0',
            opacity: 0.65,
            marginTop: '1.5rem',
            lineHeight: 1.6,
            maxWidth: '520px',
            fontWeight: 400,
          }}
        >
          I build for the version{' '}
          <em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', opacity: 1 }}>
            after the demo.
          </em>{' '}
          The code that runs when no one&apos;s watching.
        </p>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontVariant: 'small-caps',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.4,
            marginTop: '2rem',
          }}
        >
          Builder&nbsp;&nbsp;·&nbsp;&nbsp;Engineer&nbsp;&nbsp;·&nbsp;&nbsp;Systems Thinker
        </p>
      </div>

      {/* Bottom left */}
      <span
        ref={bottomLeftRef}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontVariant: 'small-caps',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#F5F5F0',
          opacity: 0.4,
        }}
        aria-hidden="true"
      >
        Scroll — or don&apos;t
      </span>

      {/* Bottom right */}
      <span
        ref={bottomRightRef}
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          fontVariant: 'small-caps',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#F5F5F0',
          opacity: 0.4,
        }}
        aria-hidden="true"
      >
        [ Est. 2006 ]
      </span>
    </section>
  )
}
