'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNoteBySlug } from '@/lib/notes'

export default function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const note = getNoteBySlug(slug)
  if (!note) notFound()

  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return
      setScrollProgress((scrollY / docHeight) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const paragraphs = note.body
    ? note.body
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p, i) => !(i === 0 && p === note.title))
    : []

  return (
    <>
      {/* Scroll progress bar */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '2px',
          width: `${scrollProgress}%`,
          backgroundColor: '#F5F5F0',
          zIndex: 101,
          transition: 'width 50ms linear',
        }}
      />

      <main style={{ padding: '8rem 10vw 8rem' }}>
        {/* Back link */}
        <Link
          href="/#notes"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontVariant: 'small-caps',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.5,
            textDecoration: 'none',
            display: 'inline-block',
            marginBottom: '4rem',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
        >
          ← Notes
        </Link>

        <article style={{ maxWidth: '660px', margin: '0 auto' }}>
          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)',
              lineHeight: 1.1,
              color: '#F5F5F0',
              margin: 0,
              fontWeight: 700,
            }}
          >
            {note.titleParts.before}
            <em style={{ fontWeight: 400 }}>{note.titleParts.italic}</em>
            {note.titleParts.after}
          </h1>

          {/* Date + category */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              fontVariant: 'small-caps',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#F5F5F0',
              opacity: 0.4,
              marginTop: '1.25rem',
              marginBottom: 0,
            }}
          >
            {note.date}&nbsp;&nbsp;·&nbsp;&nbsp;{note.category}
          </p>

          {/* Divider */}
          <div style={{
            borderTop: '1px solid rgba(245,245,240,0.12)',
            marginTop: '3rem',
            marginBottom: '3rem',
          }} />

          {/* Body */}
          {paragraphs.length > 0 ? (
            paragraphs.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '17px',
                  lineHeight: 1.9,
                  color: '#F5F5F0',
                  opacity: 0.82,
                  marginBottom: '1.75rem',
                  fontWeight: 400,
                  letterSpacing: '0.012em',
                }}
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '16px',
              fontStyle: 'italic',
              color: '#F5F5F0',
              opacity: 0.3,
            }}>
              Essay content not yet written.
            </p>
          )}
        </article>
      </main>
    </>
  )
}
