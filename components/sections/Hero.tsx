'use client'

// ─────────────────────────────────────────────────────────────────────────────
// HERO — COMPOSITION V3
//
// Design intent:
//   The previous version used a single dark sphere on a dark background.
//   Low contrast, no colour temperature, nothing to discover. This version
//   builds a *scene* — a cluster of forms at different depths, a particle
//   field as atmosphere, bloom so the geometry glows, and warm-vs-cool
//   lighting to create cinematic drama.
//
// Key decisions:
//   1. COLOUR TEMPERATURE CONTRAST
//      Key light: warm amber (#ffaa44). Fill: cool blue-white (#aaccff).
//      Back: deep violet (#4422aa). This split is what makes Yuvraaj's
//      gold objects read as "lit" rather than "rendered". Monochrome
//      lighting (all white) = Blender default. Split colour = cinema.
//
//   2. BLOOM via EffectComposer + UnrealBloomPass
//      Threshold 0.75 so only bright specular highlights bloom — the hot
//      spots on the icosahedron edges glow. Low strength (0.9) keeps it
//      cinematic not garish. This is what makes the scene feel alive.
//
//   3. PARTICLE FIELD
//      ~800 points at random depths [-6, 6]. They move at a fixed world
//      position (not in the scene group), so when the cursor tilts the
//      geometry group, particles appear to be at a different depth layer.
//      This creates genuine parallax without any shader work.
//
//   4. SCENE GROUP ROTATION (not camera)
//      Cursor rotates sceneGroup (all geometry), not the camera. Particles
//      are added to scene directly so they don't rotate with the group.
//      Result: geometry and particles drift apart on mouse move = depth.
//
//   5. OBJECT OVERLAP WITH TEXT
//      The torus is positioned at x: -0.8 — it overlaps the left text
//      column at large viewports. This integrates scene and typography.
//      The eye moves between text and 3D rather than treating them as
//      separate layers.
//
//   6. PARTIAL CROP
//      The main icosahedron at scale 2.4 with the canvas full-bleed means
//      the bottom of the form exits the viewport. Implies a world larger
//      than the screen. Critical for "sense of scale".
//
//   7. ENTRANCE
//      Overlay → text → scene → particles in sequence. Nothing pops in.
//      Canvas opacity starts at 0, fades in 1.0s after text is established.
//
//   PERFORMANCE NOTES:
//   - EffectComposer adds ~1ms per frame on modern hardware. Acceptable.
//   - Particle geometry is BufferGeometry with Float32Array — efficient.
//   - All geometries/materials disposed on unmount.
//   - pixelRatio capped at 2.
//   - Scroll read inside rAF (no listener).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default function Hero() {
  // ── Text refs ──────────────────────────────────────────────────────────────
  const line1Ref    = useRef<HTMLSpanElement>(null)
  const line2Ref    = useRef<HTMLSpanElement>(null)
  const punchRef    = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const bottomLRef  = useRef<HTMLSpanElement>(null)
  const bottomRRef  = useRef<HTMLSpanElement>(null)
  const badgeRef    = useRef<HTMLDivElement>(null)

  // ── Scene refs ─────────────────────────────────────────────────────────────
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const sectionRef  = useRef<HTMLElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)

  // Hot-path: no state, no re-renders
  const mouseRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    sectionRef.current?.style.setProperty('--sx', `${x}px`)
    sectionRef.current?.style.setProperty('--sy', `${y}px`)
    mouseRef.current.x =  ((x / rect.width)  - 0.5) * 2
    mouseRef.current.y = -((y / rect.height) - 0.5) * 2
  }

  // ── Three.js scene ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.5  // higher exposure = vibrancy through tonemapper
    renderer.setClearColor(0x000000, 0)

    // ── Scene + Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    scene.fog    = new THREE.FogExp2(0x000000, 0.045)

    const camera = new THREE.PerspectiveCamera(
      52, canvas.clientWidth / canvas.clientHeight, 0.1, 100,
    )
    camera.position.set(0, 0, 9)

    // ── Effect Composer — Bloom ───────────────────────────────────────────────
    // UnrealBloomPass: strength 0.9 keeps it cinematic.
    // Threshold 0.75 = only bright specular highlights glow.
    // Radius 0.6 = tight bloom, not the washed-out HDR look.
    const composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      1.1,   // strength  — higher now that source is emissive (constant), not specular (flickery)
      0.4,   // radius    — tight: glow hugs the surface, no cloud bleed
      0.55,  // threshold — lower: emissive value of 0.18 * exposure 1.5 = ~0.27 in linear,
             //             needs threshold below that to catch it. Specular spikes still bloom
             //             but emissive provides the stable baseline underneath.
    )
    composer.addPass(bloomPass)

    // ── Scene group — everything geometric goes here ───────────────────────────
    // Cursor rotates this group. Particles are added to scene directly so
    // they stay fixed in world space — that's what creates the depth parallax.
    const sceneGroup = new THREE.Group()
    scene.add(sceneGroup)

    // ── Materials ─────────────────────────────────────────────────────────────
    // Core insight: emissive is the correct tool for stable glow.
    //
    // Specular highlights (what we had before) depend on the angle between
    // the light, surface normal, and camera. As the mesh rotates, that angle
    // changes every frame → brightness jumps → perceived as flicker.
    //
    // Emissive is a constant additive term. It doesn't care about light angle.
    // It's always the same brightness regardless of rotation.
    // Result: the mesh has a warm amber glow baked in permanently.
    // The key light then adds specular *on top of* that glow, not instead of it.
    // Bloom catches the emissive value (constant) → stable halo around the form.
    // Specular spikes from rotation are now additive and minor, not the main source.

    // Primary: warm gold emissive (#b85c00 at 0.22 intensity) + high metalness.
    // emissiveIntensity 0.22 through toneMappingExposure 1.5 = ~0.33 pre-bloom.
    // Bloom threshold 0.55 catches this cleanly. The glow is warm, rich, constant.
    const primaryMat = new THREE.MeshPhysicalMaterial({
      color: '#D4A96A',           // warm gold base — visible in shadow areas
      emissive: '#7A3800',        // deep amber self-emission
      emissiveIntensity: 0.22,    // strong enough to bloom, subtle enough not to wash out
      roughness: 0.12,
      metalness: 0.82,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      reflectivity: 1.0,
    })

    // Secondary: cooler, silver-grey with a faint blue emissive.
    // Contrasts with the warm primary — makes the scene feel lit by two sources
    // even when static. The blue emission echoes the rim light colour.
    const secondaryMat = new THREE.MeshPhysicalMaterial({
      color: '#B8C4D0',
      emissive: '#0a1520',        // very dark blue — barely visible but shifts the shadow tone
      emissiveIntensity: 0.15,
      roughness: 0.20,
      metalness: 0.70,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
    })

    // Ghost: near-black with a hint of violet emissive.
    // In the fog they'll read as dark forms with a faint atmospheric tint.
    // No attempt to make these visible — they're depth cues, not features.
    const ghostMat = new THREE.MeshPhysicalMaterial({
      color: '#2A2530',
      emissive: '#1a0a2a',
      emissiveIntensity: 0.08,
      roughness: 0.35,
      metalness: 0.40,
    })

    // ── Primary form: large icosahedron ───────────────────────────────────────
    // detail=3 gives a smooth, dense silhouette — reads as intentional form.
    // Scale 2.4 means it's partially cropped at the bottom at most viewports.
    // Positioned right-of-centre, slightly up — text reads left-clear.
    const icoGeo = new THREE.IcosahedronGeometry(2.4, 3)
    const ico    = new THREE.Mesh(icoGeo, primaryMat)
    ico.position.set(2.0, 0.3, 0.0)
    sceneGroup.add(ico)

    // ── Torus — integrates with text zone ─────────────────────────────────────
    // At x: -0.8 it overlaps the left column on wide viewports.
    // This is intentional: the 3D bleeds into the text, binding them together.
    // Tilted so the inner ring is visible — creates the lens-like shape
    // that Yuvraaj's torus has.
    const torGeo = new THREE.TorusGeometry(1.1, 0.3, 48, 120)
    const tor    = new THREE.Mesh(torGeo, secondaryMat)
    tor.position.set(-0.8, -1.0, 1.2)
    tor.rotation.x = Math.PI * 0.48
    tor.rotation.z = Math.PI * 0.12
    sceneGroup.add(tor)

    // ── Octahedron — upper-right accent ──────────────────────────────────────
    // Gives the eye a second destination after the ico.
    // Small enough to read as satellite, not competitor.
    const octGeo = new THREE.OctahedronGeometry(0.55, 0)
    const oct    = new THREE.Mesh(octGeo, primaryMat)
    oct.position.set(4.2, 2.1, 0.8)
    sceneGroup.add(oct)

    // ── Tiny sphere — tertiary accent ─────────────────────────────────────────
    // Creates the cluster feeling of Yuvraaj's upper-right grouping.
    const sphGeo = new THREE.SphereGeometry(0.28, 32, 32)
    const sph    = new THREE.Mesh(sphGeo, secondaryMat)
    sph.position.set(4.9, 1.2, 1.4)
    sceneGroup.add(sph)

    // ── Deep background forms — fog depth ─────────────────────────────────────
    // These sit 10–16 units back. FogExp2 density 0.045 dissolves them to
    // ~30% opacity. Visible when eye adjusts, invisible at first glance.
    // That's the "discovery" element.
    const deepIcoGeo = new THREE.IcosahedronGeometry(1.2, 1)
    const deepIco    = new THREE.Mesh(deepIcoGeo, ghostMat)
    deepIco.position.set(-4.0, 2.8, -12)
    sceneGroup.add(deepIco)

    const deepTorGeo = new THREE.TorusGeometry(0.9, 0.22, 24, 60)
    const deepTor    = new THREE.Mesh(deepTorGeo, ghostMat)
    deepTor.position.set(5.5, -2.5, -16)
    deepTor.rotation.x = Math.PI * 0.3
    sceneGroup.add(deepTor)

    // ── Particle field ────────────────────────────────────────────────────────
    // 800 points distributed in a volume: x[-8,8], y[-6,6], z[-8,4].
    // z range biased toward negative (behind camera) so particles feel like
    // depth, not foreground clutter.
    // Added to SCENE (not sceneGroup) so they don't rotate with cursor.
    // This is the key to the parallax depth effect.
    const PARTICLE_COUNT = 800
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const sizes     = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 16    // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 12    // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2 // z (biased back)
      sizes[i] = Math.random() * 0.8 + 0.2
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1))

    // Custom shader material so we can control per-particle size and opacity
    // without a texture atlas. The gl_PointSize trick gives soft circular points.
    const particleMat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 0.035,
      sizeAttenuation: true,    // smaller when far away = depth cue
      transparent: true,
      opacity: 0.55,
      depthWrite: false,        // particles don't occlude each other
    })

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)   // scene, not sceneGroup

    // ── Lighting ──────────────────────────────────────────────────────────────
    // The colour temperature split is the single most important decision here.
    // Warm key + cool rim + violet back = the cinematic look.
    // Without colour contrast, all the bloom in the world looks like a smudge.

    // Key: warm amber, top-right. Now plays a supporting role — the emissive
    // provides the base glow, the key light adds the sharp specular highlight
    // and brightens the lit face. Reduced to 160 (was 220) because we no longer
    // need it to be the sole source of brightness.
    const key = new THREE.PointLight('#ffb347', 160, 45)
    key.position.set(6, 10, 7)
    sceneGroup.add(key)

    // Rim: cool blue-white from lower-left. Kept strong — it separates the
    // form from the dark background and echoes the secondary material's
    // blue emissive tint. Creates the dual-temperature read.
    const rim = new THREE.PointLight('#99bbff', 100, 35)
    rim.position.set(-7, -3, 5)
    sceneGroup.add(rim)

    // Back: violet from behind. Catches the torus inner edge and the
    // icosahedron's back faces. Subtle source-of-mystery light.
    const back = new THREE.PointLight('#5522aa', 70, 30)
    back.position.set(1, -5, -6)
    sceneGroup.add(back)

    // Ambient: very slightly raised (0.06 vs 0.04) since emissive materials
    // already handle the deep-shadow look — the ambient just lifts the
    // absolute black floor fractionally so shadow areas read as dark gold,
    // not dead void.
    const ambient = new THREE.AmbientLight('#221810', 0.06)
    scene.add(ambient)

    // ── Animation state ───────────────────────────────────────────────────────
    const groupTarget = { rx: 0, ry: 0 }
    const MAX_RX = 0.18
    const MAX_RY = 0.14
    const LERP   = 0.032

    // ── Breath constants ──────────────────────────────────────────────────────
    // The emissive materials provide the stable glow baseline.
    // Key light breath: ±1.5% at 0.05 rad/s = ~125-second full cycle.
    // This is the only light that animates. Amplitude is low enough that
    // no viewer consciously perceives the change — it simply prevents the
    // scene from feeling frozen.
    //
    // The scene's sense of life comes from slow per-mesh self-rotation
    // (revealing material facets) and particle drift — not from light flicker.
    //
    // NOTE: The idle sinusoidal drift previously applied to the group rotation
    // targets has been removed. It was rocking the sceneGroup by ±0.03–0.04 rad
    // at 0.15–0.20 rad/s, which on the primary material (roughness 0.12,
    // metalness 0.82) produced sharp specular angle changes every frame.
    // That was the flicker source.
    const KEY_BASE = 160

    const clock = new THREE.Clock()
    let frameId: number

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // ── Scroll exit ──────────────────────────────────────────────────────
      const scrollProgress = window.scrollY / (window.innerHeight * 0.8)
      camera.position.z = 9 + scrollProgress * 4   // world recedes

      // ── Cursor: smooth lerp to mouse ──────────────────────────────────────
      // No idle sinusoid here — adding sine waves to rotation targets causes
      // the sceneGroup to rock continuously, which changes the PointLight-to-
      // normal angle on the high-metalness/low-roughness primary material every
      // frame. That angle change = sharp specular spikes = perceived flicker.
      // The scene feels alive through slow mesh self-rotation, not group rocking.
      const targetRX = mouseRef.current.y * MAX_RX
      const targetRY = mouseRef.current.x * MAX_RY

      groupTarget.rx += (targetRX - groupTarget.rx) * LERP
      groupTarget.ry += (targetRY - groupTarget.ry) * LERP

      sceneGroup.rotation.x = groupTarget.rx
      sceneGroup.rotation.y = groupTarget.ry

      // ── Individual mesh self-rotation ────────────────────────────────────
      // Very slow — they're revealing the material, not performing.
      ico.rotation.y     = t * 0.05
      ico.rotation.x     = t * 0.022
      tor.rotation.z    += 0.004
      oct.rotation.y    += 0.008
      oct.rotation.x    += 0.005
      sph.rotation.y    += 0.01
      deepIco.rotation.y = t * 0.04
      deepTor.rotation.z = t * 0.03

      // ── Particles: slow world-drift ───────────────────────────────────────
      particles.rotation.y = -t * 0.008
      particles.rotation.x =  t * 0.004

      // ── Key light breath — ±1.5% at 0.05 rad/s = ~125 second full cycle ───
      // Amplitude reduced from 4% → 1.5%: imperceptible as animation,
      // only registers as "the scene isn't frozen". The primary flicker fix
      // is removing the idle rotation sinusoids above — this is just insurance.
      key.intensity = KEY_BASE * (1 + 0.015 * Math.sin(t * 0.05))

      // ── Render via composer (bloom) ───────────────────────────────────────
      composer.render()
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      renderer.setSize(w, h, false)
      composer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      composer.dispose()
      renderer.dispose()
      primaryMat.dispose()
      secondaryMat.dispose()
      ghostMat.dispose()
      particleMat.dispose()
      ;[icoGeo, torGeo, octGeo, sphGeo, deepIcoGeo, deepTorGeo, particleGeo].forEach(g => g.dispose())
    }
  }, [])

  // ── Entrance sequence ──────────────────────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      if (overlayRef.current) overlayRef.current.style.opacity = '0'
      if (canvasRef.current)  canvasRef.current.style.opacity  = '1'
      return
    }

    const textEls = [
      line1Ref.current, line2Ref.current, punchRef.current,
      subtitleRef.current, badgeRef.current,
      bottomLRef.current, bottomRRef.current,
    ].filter(Boolean)

    gsap.set(textEls, { opacity: 0, y: 20 })
    gsap.set(canvasRef.current, { opacity: 0 })

    const tl = gsap.timeline({ delay: 0.1 })

    // 1. Black overlay out
    tl.to(overlayRef.current, {
      opacity: 0, duration: 0.9, ease: 'power2.inOut',
      onComplete: () => { if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none' },
    })

    // 2. Text stagger
    tl.to(line1Ref.current,    { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.35')
    tl.to(line2Ref.current,    { y: 0, opacity: 1, duration: 0.80, ease: 'power3.out' }, '-=0.55')
    tl.to(punchRef.current,    { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, '-=0.40')
    tl.to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.40, ease: 'power3.out' }, '+=0.05')

    // 3. Scene materialises — canvas fades in as text settles
    tl.to(canvasRef.current, { opacity: 1, duration: 1.4, ease: 'power2.inOut' }, '-=0.15')

    // 4. Secondary UI
    tl.to(
      [badgeRef.current, bottomLRef.current, bottomRRef.current],
      { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', stagger: 0.1 },
      '-=0.8',
    )

    return () => { tl.kill() }
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 10vw',
        overflow: 'hidden',
        // No background here — the Three.js canvas provides all atmosphere.
        // A CSS spotlight on the section container was creating a visible
        // amber blob that competed with the 3D lighting. Removed.
      }}
    >
      {/* Black entrance overlay */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: '#000000',
          zIndex: 10, pointerEvents: 'auto',
        }}
      />

      {/* Three.js canvas — full-bleed, behind everything */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Left-side text readability gradient — not a vignette, a composition tool.
          The 3D scene bleeds into the text zone intentionally, but text needs
          to remain legible. A left-edge fade rather than full vignette keeps
          the composition open while protecting the type. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,0.28) 0%, transparent 38%)',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Badge */}
      <div
        ref={badgeRef}
        aria-hidden="true"
        style={{
          position: 'absolute', top: '6rem', right: '2rem',
          fontFamily: 'var(--font-inter)', fontSize: '10px',
          fontVariant: 'small-caps', letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#F5F5F0',
          border: '1px solid rgba(245,245,240,0.18)',
          padding: '6px 12px', zIndex: 4,
        }}
      >
        Let&apos;s build together
      </div>

      {/* Typography */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        <h1 aria-label="Hey, I'm Vatsal." style={{ margin: 0, lineHeight: 1.0 }}>
          <span
            ref={line1Ref}
            aria-hidden="true"
            style={{
              display: 'block',
              fontFamily: 'var(--font-playfair)',
              fontSize: 'clamp(3rem, 7vw, 7.5rem)',
              fontWeight: 700,
              color: '#F5F5F0',
              lineHeight: 1.05,
            }}
          >
            Hey, I&apos;m
          </span>
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
              marginLeft: '-0.04em',
              letterSpacing: '-0.02em',
            }}
          >
            Vatsal.
          </span>
        </h1>

        <p
          ref={punchRef}
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

      {/* Bottom labels */}
      <span
        ref={bottomLRef}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '2rem', left: '2rem',
          fontFamily: 'var(--font-inter)', fontSize: '10px',
          fontVariant: 'small-caps', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#F5F5F0',
          opacity: 0.4, zIndex: 3,
        }}
      >
        Scroll — or don&apos;t
      </span>

      <span
        ref={bottomRRef}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '2rem', right: '2rem',
          fontFamily: 'var(--font-inter)', fontSize: '10px',
          fontVariant: 'small-caps', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: '#F5F5F0',
          opacity: 0.4, zIndex: 3,
        }}
      >
        [ Est. 2006 ]
      </span>
    </section>
  )
}