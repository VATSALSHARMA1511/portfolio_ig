'use client'

import { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [isTouch, setIsTouch] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Fix 3: pointer-coarse check runs only on client after mount
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    if (isCoarse) {
      setIsTouch(true)
      return
    }

    const cursor = cursorRef.current
    if (!cursor) return

    let rafId: number
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY

      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (cursor) {
          cursor.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`
        }
      })
    }

    const onMouseEnterInteractive = () => setIsExpanded(true)
    const onMouseLeaveInteractive = () => setIsExpanded(false)

    const attachListeners = () => {
      document
        .querySelectorAll('a, button, [data-cursor-expand]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onMouseEnterInteractive)
          el.addEventListener('mouseleave', onMouseLeaveInteractive)
        })
    }

    window.addEventListener('mousemove', onMouseMove)
    attachListeners()

    // Re-attach on DOM mutations (new interactive elements added dynamically)
    const observer = new MutationObserver(attachListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [])

  if (isTouch) return null

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: isExpanded ? '48px' : '12px',
        height: isExpanded ? '48px' : '12px',
        backgroundColor: '#F5F5F0',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9998,
        mixBlendMode: 'difference',
        transition:
          'width 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94), height 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        willChange: 'transform',
      }}
    />
  )
}
