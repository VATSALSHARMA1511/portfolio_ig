import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Splits an element's text into words, wraps each in overflow:hidden outer span
 * + translateY(100%) inner span, then animates in via GSAP ScrollTrigger.
 *
 * Fix: preserves original text content in aria-label on the parent element
 * so screen readers get the full unsplit text.
 */
export function animateSplitText(el: HTMLElement): () => void {
  // Respect prefers-reduced-motion — render final state immediately
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches
  if (prefersReduced) {
    el.style.opacity = '1'
    return () => {}
  }

  const originalText = el.innerText

  // Set aria-label so screen readers get clean text, not span soup
  if (!el.getAttribute('aria-label')) {
    el.setAttribute('aria-label', originalText)
  }

  // Split into words
  const words = originalText.split(' ')
  el.innerHTML = words
    .map(
      (word) =>
        `<span style="overflow:hidden;display:inline-block;vertical-align:bottom;margin-right:0.3em">` +
        `<span class="split-word-inner" style="display:inline-block;transform:translateY(100%)">${word}</span>` +
        `</span>`
    )
    .join('')

  const innerSpans = el.querySelectorAll<HTMLElement>('.split-word-inner')

  const trigger = ScrollTrigger.create({
    trigger: el,
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.to(innerSpans, {
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.05,
      })
    },
  })

  // Return cleanup function
  return () => {
    trigger.kill()
    // Restore original text to avoid orphaned DOM on component unmount
    el.innerHTML = originalText
  }
}
