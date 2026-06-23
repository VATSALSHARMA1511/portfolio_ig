'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function About() {
  const headlineRef = useRef<HTMLParagraphElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      ;[headlineRef.current, leftRef.current, rightRef.current].forEach((el) => {
        if (el) el.style.opacity = '1'
      })
      return
    }

    const triggers: ScrollTrigger[] = []

    if (headlineRef.current) {
      gsap.set(headlineRef.current, { opacity: 0, y: 24 })
      triggers.push(
        ScrollTrigger.create({
          trigger: headlineRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(headlineRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
          },
        })
      )
    }

    if (leftRef.current) {
      gsap.set(leftRef.current, { opacity: 0, y: 30 })
      triggers.push(
        ScrollTrigger.create({
          trigger: leftRef.current,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(leftRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 })
          },
        })
      )
    }

    if (rightRef.current) {
      gsap.set(rightRef.current, { opacity: 0, y: 30 })
      triggers.push(
        ScrollTrigger.create({
          trigger: rightRef.current,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(rightRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.22 })
          },
        })
      )
    }

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      id="about"
      style={{
        padding: '18vh 0',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 8vw',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Section label */}
        <p
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontVariant: 'small-caps',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.35,
            marginBottom: '2.5rem',
          }}
        >
          About
        </p>

        {/* Headline — full width */}
        <p
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2.2rem, 4.5vw, 4rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#F5F5F0',
            lineHeight: 1.2,
            marginBottom: '4rem',
            maxWidth: '820px',
            opacity: 0,
          }}
        >
          
            I don't stop at{' '}
            <br />
            <span style={{ fontWeight: 700, fontStyle: 'normal' }}>"it works locally."</span>
            </p>

        {/* Two-column body */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12rem',
            alignItems: 'start',
          }}
          className="about-grid"
        >
          {/* Left — paragraph */}
          <div ref={leftRef} style={{ opacity: 0 }}>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                fontWeight: 400,
                color: '#F5F5F0',
                opacity: 0.75,
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              I&apos;m a third-year CS student at VIT Vellore who builds before reading the
              manual. Most of what I know came from shipping something that half-worked, then
              figuring out why. That&apos;s how OPSPILOT started — a logging gap in production
              turned into a full observability platform. That&apos;s how I picked up ML, systems
              design, and enough DevOps to make deployments stop breaking at 2&nbsp;AM.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: 'clamp(1rem, 1.2vw, 1.15rem)',
                fontWeight: 400,
                color: '#F5F5F0',
                opacity: 0.75,
                lineHeight: 1.8,
                margin: '1.5rem 0 0',
              }}
            >
              I care about the craft — the part where code meets the screen and either feels right
              or doesn&apos;t. I'd rather ship something hard than finish something easy.
            </p>
          </div>

          {/* Right — facts */}
          <div ref={rightRef} style={{ opacity: 0, display: 'flex', flexDirection: 'column', gap: '2.8rem' }}>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  opacity: 0.35,
                  margin: '0 0 0.5rem',
                }}
              >
                Education
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.95rem',
                  color: '#F5F5F0',
                  opacity: 0.8,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                B.Tech Computer Science
                <br />
                VIT Vellore · 2024–2028
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  opacity: 0.35,
                  margin: '0 0 0.5rem',
                }}
              >
                Focus
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.95rem',
                  color: '#F5F5F0',
                  opacity: 0.8,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Backend systems · LLM integration
                <br />
                Full-stack · Built to deploy
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  opacity: 0.35,
                  margin: '0 0 0.5rem',
                }}
              >
                Currently
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.95rem',
                  color: '#F5F5F0',
                  opacity: 0.8,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                Open to internships · Remote · Offline
              </p>
            </div>

            <div>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  opacity: 0.35,
                  margin: '0 0 0.5rem',
                }}
              >
                Based in
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '0.95rem',
                  color: '#F5F5F0',
                  opacity: 0.8,
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                India · BLR · DEL · KOL
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 720px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
        }
      `}</style>
    </section>
  )
}