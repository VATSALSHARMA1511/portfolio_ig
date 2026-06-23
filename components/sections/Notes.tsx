'use client'

import { useState } from 'react'
import Link from 'next/link'

const NOTES = [
  {
    date: 'Jun 2026',
    slug: 'bkt-engine',
    // italic portion: "BKT engine"
    titleBefore: 'Why I wrote the ',
    titleItalic: 'BKT engine',
    titleAfter: ' from scratch',
    category: 'Essay',
  },
  {
    date: 'May 2026',
    slug: 'production-lessons',
    // italic portion: "staging never did"
    titleBefore: 'What production taught me that ',
    titleItalic: 'staging never did',
    titleAfter: '',
    category: 'Essay',
  },
]

export default function Notes() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null)

  return (
    <section
      id="notes"
      style={{
        padding: '15vh 10vw',
        minHeight: '60vh',
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
          opacity: 0.4,
          marginBottom: '2rem',
        }}
      >
        04 / Notes
      </p>

      <div>
        {NOTES.map((note) => {
          const isHovered = hoveredSlug === note.slug
          return (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div
                onMouseEnter={() => setHoveredSlug(note.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '6rem 1fr auto auto',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.25rem 0',
                  borderBottom: '1px solid rgba(245, 245, 240, 0.15)',
                }}
              >
                {/* Date */}
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '11px',
                    fontVariant: 'small-caps',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#F5F5F0',
                    opacity: 0.4,
                    flexShrink: 0,
                  }}
                >
                  {note.date}
                </span>

                {/* Title with italic key phrase */}
                <span
                  style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.4rem',
                    color: '#F5F5F0',
                    opacity: isHovered ? 1 : 0.7,
                    transition: 'opacity 200ms ease',
                    lineHeight: 1.3,
                  }}
                >
                  {note.titleBefore}
                  <em>{note.titleItalic}</em>
                  {note.titleAfter}
                </span>

                {/* Category */}
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '10px',
                    fontVariant: 'small-caps',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#F5F5F0',
                    opacity: 0.4,
                    flexShrink: 0,
                  }}
                >
                  {note.category}
                </span>

                {/* Arrow */}
                <span
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '14px',
                    color: '#F5F5F0',
                    opacity: 0.7,
                    transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                    transition: 'transform 200ms ease',
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
