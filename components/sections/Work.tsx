'use client'

import { useRef, useState } from 'react'

interface Project {
  id: string
  number: string
  name: string
  year: string
  inProgress?: boolean
  hook: string
  stack?: string
  productionNote?: string
  liveUrl?: string
  githubUrl?: string
}

const PROJECTS: Project[] = [
  {
    id: 'opspilot',
    number: '01',
    name: 'OPSPILOT',
    year: '2025',
    hook: 'The ticket workflow enforces itself server-side.\nNo frontend can bypass the state machine.',
    stack: 'FastAPI · Python 3.11 · PostgreSQL · pgvector · Redis · SQLAlchemy · Groq · React · Vite · Tailwind · Docker · Render · Vercel',
    productionNote:
      'The Groq model was deprecated mid-deployment. Caught it in silent production logs. Fixed same day.',
    liveUrl: 'https://opspilot-sand.vercel.app',
    githubUrl: 'https://github.com/VATSALSHARMA1511/opspilot',
  },
  {
    id: 'vertex',
    number: '02',
    name: 'VERTEX DSA AI',
    year: '2025',
    hook: 'The mastery engine runs pure math.\nNo library does time-decay per concept with prerequisite gating.',
    stack:
      'FastAPI · SQLModel · SQLite · sentence-transformers · ChromaDB · Groq · React · Vite · Railway · Vercel',
    liveUrl: 'https://vertex-dsa-ai.vercel.app',
    githubUrl: 'https://github.com/VATSALSHARMA1511/Vertex-DSA-AI',
  },
  {
    id: 'deadzone',
    number: '03',
    name: 'DEADZONE',
    year: '2025',
    hook: 'The AI director has memory.\nIt learns your playstyle through a RAG pipeline, not hardcoded difficulty rules.',
    stack:
      'Python · Pygame 2.6 · FastAPI · PostgreSQL · ChromaDB · sentence-transformers · Groq · JWT · bcrypt · matplotlib · Railway',
    productionNote:
      'Buffered logs on Railway hid every error for three days. PYTHONUNBUFFERED=1 fixed it.',
    liveUrl: 'https://deadzone-production-4446.up.railway.app',
    githubUrl: 'https://github.com/VATSALSHARMA1511/dead_Zone',
  },
  {
    id: 'f1',
    number: '04',
    name: 'F1 ANALYTICS PLATFORM',
    year: 'IN PROGRESS',
    inProgress: true,
    hook: 'Real-time race telemetry demands a different architecture than REST.\nStill designing what that looks like.',
  },
]

function ProjectRow({
  project,
  isHovered,
  anyHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  project: Project
  isHovered: boolean
  anyHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  // Fix 1: measure actual content height instead of using max-height: 200px
  const detailRef = useRef<HTMLDivElement>(null)

  const opacity = anyHovered ? (isHovered ? 1 : 0.25) : 1
  const hasDetail =
    !project.inProgress && (project.stack || project.productionNote || project.liveUrl)

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        borderBottom: '1px solid rgba(245, 245, 240, 0.15)',
        padding: isHovered ? '1.5rem 0' : '1rem 0',
        transition: 'padding 300ms ease, opacity 300ms ease',
        opacity,
      }}
    >
      {/* Row header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3rem 1fr auto',
          alignItems: 'baseline',
          gap: '1rem',
        }}
      >
        {/* Number */}
        <span
          style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontVariant: 'small-caps',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#F5F5F0',
            opacity: 0.4,
          }}
        >
          {project.number}
        </span>

        {/* Name + hook */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(2rem, 4vw, 4.5rem)',
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#F5F5F0',
                lineHeight: 1.1,
              }}
            >
              {project.name}
            </span>
            {project.inProgress && (
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '11px',
                  fontVariant: 'small-caps',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#F5F5F0',
                  opacity: 0.4,
                }}
              >
                [In Progress]
              </span>
            )}
          </div>

          {/* Hook — always visible */}
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '15px',
              color: '#F5F5F0',
              opacity: 0.7,
              marginTop: '0.4rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-line',
            }}
          >
            {project.hook}
          </p>

          {/* Detail block — Fix 1: height driven by actual content ref */}
          {hasDetail && (
            <div
              ref={detailRef}
              style={{
                overflow: 'hidden',
                maxHeight: isHovered
                  ? `${detailRef.current?.scrollHeight ?? 300}px`
                  : '0px',
                transition: 'max-height 400ms ease',
              }}
            >
              <div style={{ paddingTop: '1rem' }}>
                {project.stack && (
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '11px',
                      fontVariant: 'small-caps',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#F5F5F0',
                      opacity: 0.4,
                      marginBottom: '0.5rem',
                    }}
                  >
                    {project.stack}
                  </p>
                )}
                {project.productionNote && (
                  <p
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: '#F5F5F0',
                      opacity: 0.6,
                      marginBottom: '0.75rem',
                    }}
                  >
                    {project.productionNote}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '2rem' }}>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: '11px',
                        fontVariant: 'small-caps',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#F5F5F0',
                        textDecoration: 'none',
                        opacity: 0.7,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = 'underline')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = 'none')
                      }
                    >
                      ↗ Live Site
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontSize: '11px',
                        fontVariant: 'small-caps',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#F5F5F0',
                        textDecoration: 'none',
                        opacity: 0.7,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.textDecoration = 'underline')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.textDecoration = 'none')
                      }
                    >
                      ↗ GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Year + arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            alignSelf: 'flex-start',
            paddingTop: '0.6rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              fontVariant: 'small-caps',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#F5F5F0',
              opacity: 0.4,
            }}
          >
            {project.year}
          </span>
          {!project.inProgress && (project.liveUrl || project.githubUrl) && (
            <a
              href={project.liveUrl ?? project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${project.name}`}
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '12px',
                color: '#F5F5F0',
                textDecoration: 'none',
                opacity: 0.7,
              }}
            >
              →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Work() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <section
      id="work"
      style={{
        padding: '15vh 10vw',
        minHeight: '100vh',
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
          paddingBottom: '2rem',
        }}
      >
        02 / Work
      </p>

      {/* Border-top */}
      <div
        style={{
          borderTop: '1px solid rgba(245, 245, 240, 0.15)',
        }}
      />

      {PROJECTS.map((project) => (
        <ProjectRow
          key={project.id}
          project={project}
          isHovered={hoveredId === project.id}
          anyHovered={hoveredId !== null}
          onMouseEnter={() => setHoveredId(project.id)}
          onMouseLeave={() => setHoveredId(null)}
        />
      ))}
    </section>
  )
}
