'use client'

import { useState } from 'react'

export default function ReachOut() {
  const [emailHover, setEmailHover] = useState(false)
  const [githubHover, setGithubHover] = useState(false)
  const [linkedinHover, setLinkedinHover] = useState(false)

  return (
    <section
      id="reach-out"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10vw',
        position: 'relative',
      }}
    >
      {/* Headline */}
      <h2 style={{ lineHeight: 1.05, margin: 0 }}>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(4rem, 9vw, 9rem)',
            fontWeight: 700,
            fontStyle: 'normal',
            color: '#F5F5F0',
          }}
        >
          Let&apos;s
        </span>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(5rem, 11vw, 11rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#F5F5F0',
            marginLeft: '3vw',
          }}
        >
          talk.
        </span>
      </h2>

      {/* Invitation */}
      <p
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '22px',
          color: '#F5F5F0',
          opacity: 0.7,
          maxWidth: '480px',
          marginTop: '2rem',
          lineHeight: 1.7,
        }}
      >
        If you're building something real, let's talk.
      </p>

      {/* Links */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: '4rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(245,245,240,0.1)',
        }}
      >
        <a
          href="mailto:vatsalsharma1511@gmail.com"
          onMouseEnter={() => setEmailHover(true)}
          onMouseLeave={() => setEmailHover(false)}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '15px',
            fontVariant: 'small-caps',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            textDecoration: emailHover ? 'underline' : 'none',
            opacity: emailHover ? 1 : 0.5,
            transition: 'opacity 200ms ease',
          }}
        >
          vatsalsharma1511@gmail.com
        </a>
        <a
          href="https://github.com/VATSALSHARMA1511"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setGithubHover(true)}
          onMouseLeave={() => setGithubHover(false)}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '15px',
            fontVariant: 'small-caps',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            textDecoration: githubHover ? 'underline' : 'none',
            opacity: githubHover ? 1 : 0.5,
            transition: 'opacity 200ms ease',
          }}
        >
          github.com/VATSALSHARMA1511
        </a>
        <a
          href="https://linkedin.com/in/sharmavatsal"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setLinkedinHover(true)}
          onMouseLeave={() => setLinkedinHover(false)}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '15px',
            fontVariant: 'small-caps',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            textDecoration: linkedinHover ? 'underline' : 'none',
            opacity: linkedinHover ? 1 : 0.5,
            transition: 'opacity 200ms ease',
          }}
        >
          linkedin.com/in/sharmavatsal
        </a>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '10vw',
          right: '10vw',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '2rem 0',
          borderTop: '1px solid rgba(245, 245, 240, 0.1)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '10px',
            fontVariant: 'small-caps',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.3,
          }}
        >
          © 2026 Vatsal Sharma
        </span>
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '10px',
            fontVariant: 'small-caps',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.3,
          }}
        >
          
        </span>
      </div>
    </section>
  )
}