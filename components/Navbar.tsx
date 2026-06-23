'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: '01 HEY', sectionId: 'hero' },
  { label: '02 WORK', sectionId: 'work' },
  { label: '03 NOTES', sectionId: 'notes' },
  { label: '04 REACH OUT', sectionId: 'reach-out' },
] as const

function useKolkataTime() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      setTime(`${t} — KOLKATA`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return time
}

function useActiveSection() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const sectionIds = ['hero', 'work', 'about', 'notes', 'reach-out']
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[]

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}

export default function Navbar() {
  const time = useKolkataTime()
  const activeSection = useActiveSection()
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const scrollToSection = useCallback((sectionId: string) => {
    setMenuOpen(false)
    if (pathname !== '/') {
      router.push(`/#${sectionId}`)
      return
    }
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }, [pathname, router])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 2.5rem',
          backgroundColor: 'rgba(8, 8, 8, 0.75)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Name */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault()
            scrollToSection('hero')
          }}
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '14px',
            fontWeight: 400,
            color: '#F5F5F0',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
        >
          VATSAL SHARMA
        </a>

        {/* Center: Nav links — hidden on mobile */}
        <div
          className="hidden md:flex"
          style={{ gap: '2rem', alignItems: 'center' }}
        >
          {NAV_ITEMS.map(({ label, sectionId }) => {
            const isActive =
              activeSection === sectionId ||
              (sectionId === 'hero' && activeSection === 'hero')
            return (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection(sectionId)
                }}
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  textDecoration: 'none',
                  opacity: isActive ? 1 : 0.4,
                  borderBottom: isActive ? '1px solid #F5F5F0' : '1px solid transparent',
                  paddingBottom: '2px',
                  transition: 'opacity 200ms ease',
                }}
              >
                {label}
              </a>
            )
          })}
        </div>

        {/* Right: Live clock — hidden on mobile */}
        <div
          className="hidden md:block"
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: '#F5F5F0',
            opacity: 0.4,
            letterSpacing: '0.05em',
          }}
          aria-label="Current time in Kolkata"
        >
          {time}
        </div>

        {/* Mobile: Hamburger */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {menuOpen ? (
            // × close icon
            <span
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '20px',
                color: '#F5F5F0',
                lineHeight: 1,
              }}
            >
              ×
            </span>
          ) : (
            // 3 lines
            <>
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '1px',
                  backgroundColor: '#F5F5F0',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '1px',
                  backgroundColor: '#F5F5F0',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '1px',
                  backgroundColor: '#F5F5F0',
                }}
              />
            </>
          )}
        </button>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#080808',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '2.5rem',
              background: 'none',
              border: 'none',
              color: '#F5F5F0',
              fontSize: '28px',
              lineHeight: 1,
              cursor: 'none',
              padding: '4px',
              opacity: 0.7,
            }}
          >
            ×
          </button>

          {NAV_ITEMS.map(({ label, sectionId }) => (
            <a
              key={sectionId}
              href={`#${sectionId}`}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(sectionId)
              }}
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                color: '#F5F5F0',
                textDecoration: 'none',
                opacity: 0.9,
              }}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}