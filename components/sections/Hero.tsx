'use client'

// ─────────────────────────────────────────────────────────────────────────────
// HERO — RECURSIVE FRAME SYSTEM v4: PLEXUS ENGINE
//
// Visual target: nested rotated app-window frames (title bar + chrome),
// each containing a dense, saturated, constantly-mutating polygon mass —
// triangular shards of magenta / cyan / yellow / green / red filling and
// unfilling — laced with a white proximity-graph scaffold underneath.
// Structures briefly cohere into a recognizable form, then dissolve back
// into chaos. Nothing loops; everything is generated from live state.
//
// CHANGES FROM v3:
//  - Killed the metallic gold tensegrity look entirely. Frames are now
//    flat dark "OS window" chrome (title bar + icon + thin border), not
//    machined metal beams.
//  - Faces are now the dominant visual signal: many more of them, larger,
//    filled with saturated hue-cycled color (magenta/cyan/yellow/green/
//    red/blue), high enough opacity to read as solid colored shards.
//  - Edge scaffold demoted to a thin white support structure underneath
//    the color, exactly like the reference (white wire mesh inside the
//    colored polygon mass).
//  - 6 nested frames instead of 4, more conflicting independent rotation
//    axes/periods, deeper z-stacking, more visual recursion.
//  - Node/edge/face density increased substantially — chaotic mass, not
//    sparse geometry.
//  - Crystallization events now hold recognizable polyhedra (tetra/
//    octa/ring/star) with color fills, exactly the "briefly organizes
//    then collapses" reference behaviour.
//  - No PBR/metalness anywhere — flat color, capped opacity, fully
//    comfortable to stare at (no strobing, no bloom).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import * as THREE from 'three'

// ── Frame spec — 6 nested windows, deliberately conflicting rotations ──────
const FRAME_SPECS = [
  { w: 7.0,  h: 5.05, t: 0.045, periods: [38, 97, 0  ] },
  { w: 5.6,  h: 4.04, t: 0.040, periods: [29, 0,  61 ] },
  { w: 4.4,  h: 3.18, t: 0.036, periods: [22, 53, 0  ] },
  { w: 3.3,  h: 2.38, t: 0.032, periods: [17, 0,  41 ] },
  { w: 2.4,  h: 1.73, t: 0.028, periods: [13, 31, 0  ] },
  { w: 1.65, h: 1.19, t: 0.024, periods: [9,  0,  23 ] },
]
const FRAME_PHASES = [0, 1.1, 2.3, 3.6, 4.9, 6.2]

// ── Density ───────────────────────────────────────────────────────────────
const NODE_COUNT = 46
const MAX_EDGES = 90
const MAX_FACES = 28

// Saturated palette pulled straight from the Plexus references
const PALETTE = [
  0xff2d8a, // magenta
  0x00e5ff, // cyan
  0xffe600, // yellow
  0x22e06a, // green
  0xff3b3b, // red
  0x3b5bff, // blue
  0xff7a1a, // orange
]

function seededRand(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export default function Hero() {
  const line1Ref    = useRef<HTMLSpanElement>(null)
  const line2Ref    = useRef<HTMLSpanElement>(null)
  const punchRef    = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const bottomLRef  = useRef<HTMLSpanElement>(null)
  const bottomRRef  = useRef<HTMLSpanElement>(null)
  const badgeRef    = useRef<HTMLDivElement>(null)
  const canvasRef   = useRef<HTMLCanvasElement>(null)
  const sectionRef  = useRef<HTMLElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)

  // Raw normalized cursor position within the section, used for both the
  // ambient "look toward cursor" drift AND proximity detection.
  const mouseRef = useRef({ x: 0, y: 0, inside: false, px: 0, py: 0 })

  // ── Drag-rotation state (suspended-object feel, no OrbitControls) ───────
  // dragRef holds live pointer-drag state; velocityRef holds the angular
  // velocity that persists after release and is damped each frame.
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 })
  const velocityRef = useRef({ vx: 0, vy: 0 }) // angular velocity, rad/frame-ish

  // ── Node disturbance state ───────────────────────────────────────────────
  // Updated on pointer move via raycasting against the live node mesh
  // positions; consumed inside the animation loop to locally perturb nodes.
  const disturbRef = useRef({ active: false, x: 0, y: 0, ndcX: 0, ndcY: 0 })

  const handlePointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const nx =  ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const ny = -((e.clientY - rect.top)  / rect.height - 0.5) * 2
    mouseRef.current.x = nx
    mouseRef.current.y = ny
    mouseRef.current.inside = true
    mouseRef.current.px = e.clientX - rect.left
    mouseRef.current.py = e.clientY - rect.top
    disturbRef.current.ndcX = nx
    disturbRef.current.ndcY = ny
    disturbRef.current.active = true

    if (dragRef.current.dragging) {
      const dx = e.clientX - dragRef.current.lastX
      const dy = e.clientY - dragRef.current.lastY
      dragRef.current.lastX = e.clientX
      dragRef.current.lastY = e.clientY
      // Feed drag delta directly into angular velocity — this IS the
      // rotation input; momentum/damping happens in the render loop.
      velocityRef.current.vy += dx * 0.0016
      velocityRef.current.vx += dy * 0.0016
    }
  }

  const handlePointerLeave = () => {
  mouseRef.current.inside = false
  disturbRef.current.active = false
  dragRef.current.dragging = false

  document.body.style.userSelect = ''
}

  const handlePointerDown = (e: React.MouseEvent<HTMLElement>) => {
  e.preventDefault()

  dragRef.current.dragging = true
  dragRef.current.lastX = e.clientX
  dragRef.current.lastY = e.clientY

  document.body.style.userSelect = 'none'
}

  const handlePointerUp = () => {
  dragRef.current.dragging = false
  document.body.style.userSelect = ''
}

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    renderer.setClearColor(0x000000, 0)

    // ── Scene + Camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 500)
    
    





camera.position.set(0, 0, 14)
    // ── Scene group ───────────────────────────────────────────────────────
    const sceneGroup = new THREE.Group()
    sceneGroup.position.set(2.8, 0, 0)
    sceneGroup.scale.setScalar(0.82)
    scene.add(sceneGroup)

    // No PBR lighting needed — everything is flat/basic material now.
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))

    // ── Materials ─────────────────────────────────────────────────────────
    const matFrameBorder = new THREE.LineBasicMaterial({ color: 0x8a8f98, transparent: true, opacity: 0.55, depthWrite: false })
    const matFrameTitle  = new THREE.LineBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: 0.4,  depthWrite: false })
    const matConnector   = new THREE.LineBasicMaterial({ color: 0xeaeaea, transparent: true, opacity: 0.16, depthWrite: false })

    const matNodeBlue = new THREE.MeshBasicMaterial({ color: 0x4d7dff })
    const matNodeRed  = new THREE.MeshBasicMaterial({ color: 0xff4d4d })

    const makeEdgeMat = (op: number) => new THREE.LineBasicMaterial({ color: 0xf2f2f2, transparent: true, opacity: op, depthWrite: false })
    const edgeMats = [makeEdgeMat(0.65), makeEdgeMat(0.46), makeEdgeMat(0.28), makeEdgeMat(0.14)]

    // ── BUILD FRAMES (flat window chrome, not metal beams) ─────────────────
    const frameGroups: THREE.Group[] = []
    const allFrameGeos: THREE.BufferGeometry[] = []

    FRAME_SPECS.forEach((spec, fi) => {
      const group = new THREE.Group()
      group.position.z = fi * -0.16
      sceneGroup.add(group)
      frameGroups.push(group)

      const { w, h } = spec
      const hw = w / 2, hh = h / 2

      const borderPts = [
        new THREE.Vector3(-hw,  hh, 0), new THREE.Vector3(hw,  hh, 0),
        new THREE.Vector3( hw,  hh, 0), new THREE.Vector3(hw, -hh, 0),
        new THREE.Vector3( hw, -hh, 0), new THREE.Vector3(-hw, -hh, 0),
        new THREE.Vector3(-hw, -hh, 0), new THREE.Vector3(-hw, hh, 0),
      ]
      const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts)
      allFrameGeos.push(borderGeo)
      group.add(new THREE.LineSegments(borderGeo, matFrameBorder))

      const titleY = hh - h * 0.085
      const titleGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-hw, titleY, 0.001), new THREE.Vector3(hw, titleY, 0.001),
      ])
      allFrameGeos.push(titleGeo)
      group.add(new THREE.Line(titleGeo, matFrameTitle))

      const iconSize = h * 0.05
      const iconGeo = new THREE.PlaneGeometry(iconSize, iconSize)
      allFrameGeos.push(iconGeo)
      const iconMesh = new THREE.Mesh(iconGeo, new THREE.MeshBasicMaterial({ color: 0x6fa8ff, transparent: true, opacity: 0.5 }))
      iconMesh.position.set(-hw + iconSize * 1.2, titleY + iconSize * 0.7, 0.001)
      group.add(iconMesh)

      const cGeo = new THREE.SphereGeometry(fi < 2 ? 0.045 : 0.032, 8, 6)
      allFrameGeos.push(cGeo)
      ;[[hw, hh], [-hw, hh], [hw, -hh], [-hw, -hh]].forEach(([x, y], ci) => {
        const m = new THREE.Mesh(cGeo, ci % 2 === 0 ? matNodeBlue : matNodeRed)
        m.position.set(x, y, 0)
        group.add(m)
      })
    })

    const connectorLines: THREE.Line[] = []
    const connectPair = (a: number, b: number) => {
      const sA = FRAME_SPECS[a], sB = FRAME_SPECS[b]
      ;[
        [[-sA.w/2, sA.h/2, -a*0.16], [-sB.w/2, sB.h/2, -b*0.16]],
        [[ sA.w/2, sA.h/2, -a*0.16], [ sB.w/2, sB.h/2, -b*0.16]],
        [[ sA.w/2,-sA.h/2, -a*0.16], [ sB.w/2,-sB.h/2, -b*0.16]],
        [[-sA.w/2,-sA.h/2, -a*0.16], [-sB.w/2,-sB.h/2, -b*0.16]],
      ].forEach(([p1, p2]) => {
        const geo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...(p1 as [number,number,number])),
          new THREE.Vector3(...(p2 as [number,number,number])),
        ])
        const line = new THREE.Line(geo, (matConnector as THREE.LineBasicMaterial).clone())
        sceneGroup.add(line); connectorLines.push(line)
      })
    }
    for (let i = 0; i < FRAME_SPECS.length - 1; i++) connectPair(i, i + 1)

    // ── LIVE GEOMETRY ENGINE ────────────────────────────────────────────────
    const rng = seededRand(42)

    interface NodeDef {
      cx: number; cy: number; cz: number
      fx: number; fy: number; fz: number
      ax: number; ay: number; az: number
      px: number; py: number; pz: number
    }

    const nodeDefs: NodeDef[] = Array.from({ length: NODE_COUNT }, () => {
      const spread = 2.6
      return {
        cx: (rng() - 0.5) * spread * 2,
        cy: (rng() - 0.5) * spread * 1.5,
        cz: (rng() - 0.5) * spread * 0.9,
        fx: 0.09 + rng() * 0.30,
        fy: 0.07 + rng() * 0.24,
        fz: 0.05 + rng() * 0.20,
        ax: 0.35 + rng() * 1.3,
        ay: 0.35 + rng() * 1.1,
        az: 0.25 + rng() * 0.9,
        px: rng() * Math.PI * 2,
        py: rng() * Math.PI * 2,
        pz: rng() * Math.PI * 2,
      }
    })

    const nodePos: THREE.Vector3[] = nodeDefs.map(() => new THREE.Vector3())

    const nodeMeshes: THREE.Mesh[] = nodeDefs.map((_def, i) => {
      const geo = new THREE.SphereGeometry(0.028, 6, 5)
      const mat = new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x4d7dff : 0xf2f2f2 })
      const m = new THREE.Mesh(geo, mat)
      sceneGroup.add(m)
      return m
    })

    // ── EDGE POOL (white scaffold) ──────────────────────────────────────────
    interface EdgeState {
      active: boolean; nodeA: number; nodeB: number
      maxLife: number; age: number
      line: THREE.Line; posAttr: THREE.BufferAttribute
    }
    const edgePool: EdgeState[] = Array.from({ length: MAX_EDGES }, () => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3))
      const line = new THREE.Line(geo, edgeMats[3].clone())
      line.visible = false
      sceneGroup.add(line)
      return { active: false, nodeA: 0, nodeB: 0, maxLife: 120, age: 0, line, posAttr: geo.getAttribute('position') as THREE.BufferAttribute }
    })

    // ── FACE POOL (saturated colored polygon shards) ────────────────────────
    interface FaceState {
      active: boolean; n0: number; n1: number; n2: number
      age: number; maxAge: number
      mesh: THREE.Mesh; posAttr: THREE.BufferAttribute
      baseOpacity: number
    }
    const facePool: FaceState[] = Array.from({ length: MAX_FACES }, () => {
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(9), 3))
      const colorHex = PALETTE[Math.floor(Math.random() * PALETTE.length)]
      const mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.visible = false
      sceneGroup.add(mesh)
      return { active: false, n0: 0, n1: 0, n2: 0, age: 0, maxAge: 140, mesh, posAttr: geo.getAttribute('position') as THREE.BufferAttribute, baseOpacity: 0.5 + Math.random() * 0.25 }
    })

    const activeEdgePairs = new Set<number>()
    const pairKey = (a: number, b: number) => Math.min(a,b) * NODE_COUNT + Math.max(a,b)

    // ── EMERGENCE STATE ──────────────────────────────────────────────────────
    let attractorActive = false
    const attractorPos = new THREE.Vector3()
    let attractorStrength = 0
    let nextAttractorTime = 6 + Math.random() * 6

    let crystallizeActive = false
    let crystallizePhase  = 0
    let crystallizeTimer  = 0
    let crystallizeTargets: THREE.Vector3[] = []
    let nextCrystallizeTime = 14 + Math.random() * 14

    // ── ATMOSPHERIC STAR FIELD ────────────────────────────────────────────────
    const golden = Math.PI * (3 - Math.sqrt(5))
    const deepCount = 2200
    const deepPos = new Float32Array(deepCount * 3)
    for (let i = 0; i < deepCount; i++) {
      const y = 1 - (i/(deepCount-1))*2, r = Math.sqrt(Math.max(0,1-y*y)), th = golden*i
      const rad = 140 + ((i*2.618)%1)*60
      deepPos[i*3]=Math.cos(th)*r*rad; deepPos[i*3+1]=y*rad; deepPos[i*3+2]=Math.sin(th)*r*rad
    }
    const deepGeo = new THREE.BufferGeometry()
    deepGeo.setAttribute('position', new THREE.Float32BufferAttribute(deepPos, 3))
    const deepMat = new THREE.PointsMaterial({ color: 0xdde8f5, size: 0.09, sizeAttenuation: true, transparent: true, opacity: 0.20, depthWrite: false })
    scene.add(new THREE.Points(deepGeo, deepMat))

    const midCount = 600
    const midPos = new Float32Array(midCount * 3)
    const rng2 = seededRand(99)
    for (let i = 0; i < midCount; i++) {
      const y = (rng2()-0.5)*2, th = rng2()*Math.PI*2
      const r = Math.sqrt(Math.max(0,1-y*y))
      const rad = 80 + rng2()*50
      midPos[i*3]=Math.cos(th)*r*rad; midPos[i*3+1]=y*rad; midPos[i*3+2]=Math.sin(th)*r*rad
    }
    const midGeo = new THREE.BufferGeometry()
    midGeo.setAttribute('position', new THREE.Float32BufferAttribute(midPos, 3))
    const midMat = new THREE.PointsMaterial({ color: 0x4a6080, size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.30, depthWrite: false })
    scene.add(new THREE.Points(midGeo, midMat))

    const atmCount = 2000
    const atmPos  = new Float32Array(atmCount * 3)
    const atmCol  = new Float32Array(atmCount * 3)
    const rng3 = seededRand(17)
    for (let i = 0; i < atmCount; i++) {
      const y = (rng3()-0.5)*2, th = rng3()*Math.PI*2
      const r = Math.sqrt(Math.max(0,1-y*y))
      const rad = 55 + rng3()*35
      atmPos[i*3]=Math.cos(th)*r*rad; atmPos[i*3+1]=y*rad; atmPos[i*3+2]=Math.sin(th)*r*rad
      if (rng3() > 0.45) { atmCol[i*3]=0.12; atmCol[i*3+1]=0.28; atmCol[i*3+2]=0.30 }
      else { atmCol[i*3]=0.18; atmCol[i*3+1]=0.10; atmCol[i*3+2]=0.32 }
    }
    const atmGeo = new THREE.BufferGeometry()
    atmGeo.setAttribute('position', new THREE.Float32BufferAttribute(atmPos, 3))
    atmGeo.setAttribute('color',    new THREE.Float32BufferAttribute(atmCol, 3))
    const atmMat = new THREE.PointsMaterial({ vertexColors: true, size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0.025, depthWrite: false })
    scene.add(new THREE.Points(atmGeo, atmMat))

    // ── ANIMATE ───────────────────────────────────────────────────────────────
    const groupRotation = { rx: 0, ry: 0 }
    const clock = new THREE.Clock()
    let frameId: number
    let frameCount = 0
    const _tmp = new THREE.Vector3()
    const _tmp2 = new THREE.Vector3()
    const _projected = new THREE.Vector3()

    // Smoothed proximity factor: 0 = cursor far / outside, 1 = cursor at
    // the artifact's screen-space center. Drives global "liveliness" —
    // animation speed, edge/face churn rate — without any sudden jumps,
    // since it's lerped toward its target every frame.
    let proximity = 0

    // Smoothed disturbance influence per node, so the local perturbation
    // fades in/out rather than snapping. Index-aligned with nodeDefs.
    const nodeDisturb = new Float32Array(NODE_COUNT)

    // Internal "simulation time" — advances at 1x at baseline and speeds
    // up smoothly with proximity. Everything that should feel like it's
    // "running faster" (frame spin, node drift, threshold breathing) reads
    // from this instead of wall-clock time, so proximity response is felt
    // throughout the whole piece at once rather than in just one layer.
    let simTime = 0
    let lastWallT = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t  = clock.getElapsedTime()
      frameCount++

      // Scroll exit
      const sp = Math.min(window.scrollY / (window.innerHeight * 0.8), 1)
      camera.position.z = 14 + sp * 5

      // ── Drag rotation — suspended-object feel, no OrbitControls ───────────
      // While dragging, velocity is fed directly by pointer deltas (see
      // handlePointerMove). At all times — dragging or not — velocity is
      // applied to rotation, then damped. This gives: immediate response
      // while dragging, momentum on release, and a natural slow settle.
      const v = velocityRef.current
      groupRotation.rx += v.vx
      groupRotation.ry += v.vy
      // Gentle clamp so the artifact can't be spun past a comfortable tilt
      groupRotation.rx = Math.max(-0.9, Math.min(0.9, groupRotation.rx))
      const damping = dragRef.current.dragging ? 0.72 : 0.945
      v.vx *= damping
      v.vy *= damping
      // Tiny ambient drift toward the cursor when idle (not dragging, not
      // actively flicking) so the piece still feels alive when still —
      // strength is small enough to never compete with drag/momentum.
      if (!dragRef.current.dragging && Math.abs(v.vx) < 0.0006 && Math.abs(v.vy) < 0.0006) {
        const idleTargetX = mouseRef.current.inside ? mouseRef.current.y * 0.12 : 0
        const idleTargetY = mouseRef.current.inside ? mouseRef.current.x * 0.14 : 0
        groupRotation.rx += (idleTargetX - groupRotation.rx) * 0.01
        groupRotation.ry += (idleTargetY - groupRotation.ry) * 0.01
      }
      sceneGroup.rotation.x = groupRotation.rx
      sceneGroup.rotation.y = groupRotation.ry

      // ── Proximity response ─────────────────────────────────────────────
      // Distance from cursor to the artifact's projected screen center,
      // normalized 0 (far) → 1 (right on top of it). Smoothed (lerped) so
      // speed/density changes are never abrupt.
      _projected.setFromMatrixPosition(sceneGroup.matrixWorld)
      _projected.project(camera)
      let proximityTarget = 0
      if (mouseRef.current.inside) {
        const ddx = mouseRef.current.x - _projected.x
        const ddy = mouseRef.current.y - _projected.y
        const dist = Math.sqrt(ddx * ddx + ddy * ddy)
        proximityTarget = Math.max(0, 1 - dist / 1.1)
      }
      proximity += (proximityTarget - proximity) * 0.05

      // Liveliness multiplier — at proximity 0 this is 1 (baseline),
      // rising smoothly toward ~2.4x at proximity 1. Drives sim speed,
      // edge scan rate, and face spawn rate uniformly so everything
      // accelerates together rather than one layer outrunning another.
      const liveliness = 0.65 + proximity * 0.75

      // Advance internal sim clock by real dt scaled by liveliness. Using
      // an accumulator (rather than multiplying t directly) means speed
      // changes are smooth and never cause a visible jump in phase.
      const dt = Math.max(0, t - lastWallT)
      lastWallT = t
      simTime += dt * liveliness

      // Frame rotations — independent conflicting axes per frame
      FRAME_SPECS.forEach((spec, fi) => {
        const g = frameGroups[fi], ph = FRAME_PHASES[fi]
        const [p0, p1, p2] = spec.periods
        const ry = p0 > 0 ? (simTime/p0)*Math.PI*2+ph : 0
        const rx = p1 > 0 ? Math.sin(simTime/p1*Math.PI*2+ph*0.7)*0.6 : 0
        const rz = p2 > 0 ? Math.sin(simTime/p2*Math.PI*2+ph*1.3)*0.4 : 0
        g.rotation.set(rx, ry, rz)
      })

      // Global threshold wave
      const globalThreshold = 2.1 + 1.3 * Math.sin(simTime * 0.11) + 0.55 * Math.sin(simTime * 0.07 + 1.3)

      // Emergence: attractor
      if (!attractorActive && t > nextAttractorTime) {
        attractorActive = true
        attractorPos.set((Math.random()-0.5)*2, (Math.random()-0.5)*1.5, (Math.random()-0.5)*1.0)
        attractorStrength = 0
        setTimeout(() => { attractorActive = false; attractorStrength = 0; nextAttractorTime = t + 6 + Math.random()*8 }, 3200)
      }
      if (attractorActive) attractorStrength = Math.min(attractorStrength + 0.018, 0.3)

      // Crystallization event — briefly organizes into a recognizable form
      if (!crystallizeActive && t > nextCrystallizeTime) {
        crystallizeActive = true
        crystallizePhase  = 0
        crystallizeTimer  = 0
        const patternType = Math.floor(Math.random() * 4)
        const sc = 1.7
        if (patternType === 0) {
          crystallizeTargets = [
            new THREE.Vector3( sc,  sc,  sc), new THREE.Vector3(-sc, -sc,  sc),
            new THREE.Vector3(-sc,  sc, -sc), new THREE.Vector3( sc, -sc, -sc),
          ]
        } else if (patternType === 1) {
          crystallizeTargets = Array.from({length:6}, (_,i)=>{
            const a = (i/6)*Math.PI*2
            return new THREE.Vector3(Math.cos(a)*sc*1.3, Math.sin(a)*sc*1.3, (i%2===0?0.4:-0.4))
          })
        } else if (patternType === 2) {
          crystallizeTargets = [
            new THREE.Vector3( sc, 0, 0), new THREE.Vector3(-sc, 0, 0),
            new THREE.Vector3(0,  sc, 0), new THREE.Vector3(0, -sc, 0),
            new THREE.Vector3(0, 0,  sc), new THREE.Vector3(0, 0, -sc),
          ]
        } else {
          crystallizeTargets = Array.from({length:8}, (_,i)=>{
            const a = (i/8)*Math.PI*2
            const r = i % 2 === 0 ? sc*1.4 : sc*0.6
            return new THREE.Vector3(Math.cos(a)*r, Math.sin(a)*r, Math.sin(a*2)*0.5)
          })
        }
        nextCrystallizeTime = t + 16 + Math.random()*14
      }

      let crystallizeStrength = 0
      if (crystallizeActive) {
        crystallizeTimer += 1/60
        if (crystallizePhase === 0) {
          crystallizeStrength = Math.min(crystallizeTimer / 1.4, 1.0) * 0.72
          if (crystallizeTimer > 1.4) { crystallizePhase = 1; crystallizeTimer = 0 }
        } else if (crystallizePhase === 1) {
          crystallizeStrength = 0.72
          if (crystallizeTimer > 1.6) { crystallizePhase = 2; crystallizeTimer = 0 }
        } else {
          crystallizeStrength = (1 - crystallizeTimer/1.1) * 0.72
          if (crystallizeTimer > 1.1) { crystallizeActive = false; crystallizeStrength = 0 }
        }
      }

      for (let ni = 0; ni < NODE_COUNT; ni++) {
        const d = nodeDefs[ni]
        let x = d.cx + Math.sin(simTime * d.fx + d.px) * d.ax
        let y = d.cy + Math.sin(simTime * d.fy + d.py) * d.ay
        let z = d.cz + Math.sin(simTime * d.fz + d.pz) * d.az

        if (attractorActive && attractorStrength > 0) {
          x += (attractorPos.x - x) * attractorStrength * 0.15
          y += (attractorPos.y - y) * attractorStrength * 0.15
          z += (attractorPos.z - z) * attractorStrength * 0.15
        }
        if (crystallizeActive && crystallizeStrength > 0 && crystallizeTargets.length > 0) {
          const tgt = crystallizeTargets[ni % crystallizeTargets.length]
          x += (tgt.x - x) * crystallizeStrength * 0.32
          y += (tgt.y - y) * crystallizeStrength * 0.32
          z += (tgt.z - z) * crystallizeStrength * 0.32
        }

        // ── Node disturbance ─────────────────────────────────────────────
        // Project this node's last-known world position to NDC and compare
        // against the cursor. Influence falls off smoothly with distance
        // (no hard cutoff) and is itself smoothed frame-to-frame via
        // nodeDisturb[], so neighbours ease in/out rather than snapping.
        let disturbTarget = 0
        if (disturbRef.current.active) {
          _tmp.copy(nodePos[ni])
          sceneGroup.localToWorld(_tmp)
          _tmp.project(camera)
          const ddx = disturbRef.current.ndcX - _tmp.x
          const ddy = disturbRef.current.ndcY - _tmp.y
          const screenDist = Math.sqrt(ddx * ddx + ddy * ddy)
          // Falloff radius in NDC space — strongest within ~0.18, fading
          // smoothly to zero by ~0.5. Soft cosine falloff, no hard edge.
          const radius = 0.5
          if (screenDist < radius) {
            const f = screenDist / radius
            disturbTarget = 0.5 * (1 + Math.cos(f * Math.PI)) // 1 at center → 0 at edge, smooth
          }
        }
        nodeDisturb[ni] += (disturbTarget - nodeDisturb[ni]) * 0.12

        if (nodeDisturb[ni] > 0.001) {
          // Push the node outward from its baseline position along its own
          // per-node phase-driven direction — gives each disturbed node a
          // slightly different jitter direction rather than uniform push,
          // while staying smooth and bounded (max displacement ~0.55).
          const pushX = Math.sin(d.px * 3.1 + simTime * 0.6) * nodeDisturb[ni] * 0.55
          const pushY = Math.cos(d.py * 2.7 + simTime * 0.5) * nodeDisturb[ni] * 0.55
          const pushZ = Math.sin(d.pz * 2.3 + simTime * 0.4) * nodeDisturb[ni] * 0.4
          x += pushX; y += pushY; z += pushZ
        }

        nodePos[ni].set(x, y, z)
        nodeMeshes[ni].position.set(x, y, z)
      }

      // ── DYNAMIC EDGE SYSTEM (white scaffold) ──────────────────────────────
      // Scan rate and how often we run the scan both scale with liveliness,
      // so proximity speeds up both how fast new edges form AND (via
      // shorter maxLife below) how fast old ones get retired — connections
      // visibly "rewire" faster rather than just accumulating.
      const edgeScanInterval = Math.max(1, Math.round(2 / Math.sqrt(liveliness)))
      if (frameCount % edgeScanInterval === 0) {
        let activeCount = 0
        for (const e of edgePool) if (e.active) activeCount++
        const scansPerFrame = Math.round(50 * liveliness)
        for (let s = 0; s < scansPerFrame && activeCount < MAX_EDGES - 4; s++) {
          const ni = Math.floor(Math.random() * NODE_COUNT)
          const nj = Math.floor(Math.random() * NODE_COUNT)
          if (ni === nj) continue
          const key = pairKey(ni, nj)
          if (activeEdgePairs.has(key)) continue
          const dist = nodePos[ni].distanceTo(nodePos[nj])
          const localThresh = globalThreshold * (0.7 + 0.4 * Math.sin(ni * 7.3 + nj * 3.1 + simTime * 0.05))
          if (dist < localThresh) {
            for (const e of edgePool) {
              if (!e.active) {
                e.active = true; e.nodeA = ni; e.nodeB = nj; e.age = 0
                // Lifetime shortens with proximity — edges churn faster
                e.maxLife = Math.round((50 + Math.random() * 180) / liveliness)
                e.line.visible = true
                activeEdgePairs.add(key); activeCount++
                break
              }
            }
          }
        }
      }

      for (const e of edgePool) {
        if (!e.active) continue
        e.age += liveliness
        const fadeIn  = Math.min(e.age / 16, 1)
        const fadeOut = Math.min((e.maxLife - e.age) / 22, 1)
        const alpha   = Math.min(fadeIn, fadeOut)
        if (e.age >= e.maxLife) {
          e.active = false; e.line.visible = false
          activeEdgePairs.delete(pairKey(e.nodeA, e.nodeB))
          continue
        }
        const dist = nodePos[e.nodeA].distanceTo(nodePos[e.nodeB])
        if (dist > globalThreshold * 1.5) {
          e.active = false; e.line.visible = false
          activeEdgePairs.delete(pairKey(e.nodeA, e.nodeB))
          continue
        }
        const p = e.posAttr
        p.setXYZ(0, nodePos[e.nodeA].x, nodePos[e.nodeA].y, nodePos[e.nodeA].z)
        p.setXYZ(1, nodePos[e.nodeB].x, nodePos[e.nodeB].y, nodePos[e.nodeB].z)
        p.needsUpdate = true
        const bucket = alpha < 0.18 ? 3 : alpha < 0.45 ? 2 : alpha < 0.72 ? 1 : 0
        ;(e.line.material as THREE.LineBasicMaterial).opacity = edgeMats[bucket].opacity * alpha
      }

      // ── DYNAMIC FACE SYSTEM (saturated colored shards) ────────────────────
      // Same treatment: more frequent spawn checks and shorter lifetimes
      // near the cursor, so polygon emergence visibly accelerates.
      const faceScanInterval = Math.max(1, Math.round(3 / Math.sqrt(liveliness)))
      if (frameCount % faceScanInterval === 0) {
        let activeFaceCount = 0
        for (const f of facePool) if (f.active) activeFaceCount++
        if (activeFaceCount < MAX_FACES - 2) {
          const attempts = Math.round(10 * liveliness)
          for (let attempt = 0; attempt < attempts; attempt++) {
            const a = Math.floor(Math.random() * NODE_COUNT)
            const b = Math.floor(Math.random() * NODE_COUNT)
            const c = Math.floor(Math.random() * NODE_COUNT)
            if (a===b || b===c || a===c) continue

            const ab = nodePos[a].distanceTo(nodePos[b])
            const bc = nodePos[b].distanceTo(nodePos[c])
            const ac = nodePos[a].distanceTo(nodePos[c])

            const FACE_MIN = 0.35, FACE_MAX = globalThreshold * 1.15
            if (ab > FACE_MAX || bc > FACE_MAX || ac > FACE_MAX) continue
            if (ab < FACE_MIN || bc < FACE_MIN || ac < FACE_MIN) continue

            _tmp.copy(nodePos[b]).sub(nodePos[a])
            _tmp2.copy(nodePos[c]).sub(nodePos[a])
            const area = _tmp.cross(_tmp2).length() * 0.5
            if (area < 0.12) continue

            for (const f of facePool) {
              if (!f.active) {
                f.active = true; f.n0 = a; f.n1 = b; f.n2 = c
                f.age = 0; f.maxAge = Math.round((100 + Math.random() * 140) / liveliness)
                f.mesh.visible = true
                const newColor = PALETTE[Math.floor(Math.random() * PALETTE.length)]
                ;(f.mesh.material as THREE.MeshBasicMaterial).color.setHex(newColor)
                f.baseOpacity = 0.5 + Math.random() * 0.28
                activeFaceCount++
                break
              }
            }
          }
        }
      }

      for (const f of facePool) {
        if (!f.active) continue
        f.age += liveliness
        const fadeIn  = Math.min(f.age / 22, 1)
        const fadeOut = Math.min((f.maxAge - f.age) / 26, 1)
        const alpha   = Math.min(fadeIn, fadeOut)
        if (f.age >= f.maxAge) { f.active = false; f.mesh.visible = false; continue }

        const p = f.posAttr
        p.setXYZ(0, nodePos[f.n0].x, nodePos[f.n0].y, nodePos[f.n0].z)
        p.setXYZ(1, nodePos[f.n1].x, nodePos[f.n1].y, nodePos[f.n1].z)
        p.setXYZ(2, nodePos[f.n2].x, nodePos[f.n2].y, nodePos[f.n2].z)
        p.needsUpdate = true

        const mat = f.mesh.material as THREE.MeshBasicMaterial
        const crystallizeBoost = crystallizeActive && crystallizePhase === 1 ? 1.15 : 1.0
        mat.opacity = Math.min(f.baseOpacity * alpha * crystallizeBoost, 0.82)
      }

      // Connector scaffold breathing pulse — slow, smooth, no flicker
      const connPulse = 0.13 + 0.05 * Math.sin(simTime * 0.35)
      connectorLines.forEach((line, li) => {
        ;(line.material as THREE.LineBasicMaterial).opacity = connPulse + 0.025 * Math.sin(simTime * 0.27 + li * 0.4)
      })

      renderer.render(scene, camera)
    }
    animate()

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      renderer.setSize(w, h, false); camera.aspect = w/h; camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      ;[matFrameBorder, matFrameTitle, matConnector, matNodeBlue, matNodeRed, deepMat, midMat, atmMat, ...edgeMats].forEach(m => m.dispose())
      allFrameGeos.forEach(g => g.dispose())
      edgePool.forEach(e => (e.line.geometry as THREE.BufferGeometry).dispose())
      facePool.forEach(f => {
        (f.mesh.geometry as THREE.BufferGeometry).dispose()
        ;(f.mesh.material as THREE.MeshBasicMaterial).dispose()
      })
      nodeMeshes.forEach(m => {
        (m.geometry as THREE.BufferGeometry).dispose()
        ;(m.material as THREE.MeshBasicMaterial).dispose()
      })
      deepGeo.dispose(); midGeo.dispose(); atmGeo.dispose(); renderer.dispose()
    }
  }, [])

  // ── Entrance animation ──────────────────────────────────────────────────────
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      if (overlayRef.current) overlayRef.current.style.opacity = '0'
      if (canvasRef.current)  canvasRef.current.style.opacity  = '1'
      return
    }
    const textEls = [line1Ref, line2Ref, punchRef, subtitleRef, badgeRef, bottomLRef, bottomRRef].map(r=>r.current).filter(Boolean)
    gsap.set(textEls, { opacity: 0, y: 20 })
    gsap.set(canvasRef.current, { opacity: 0 })
    const tl = gsap.timeline({ delay: 0.15 })
    tl.to(overlayRef.current, { opacity: 0, duration: 1.0, ease: 'power2.inOut', onComplete: () => { if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none' } })
    tl.to(line1Ref.current,    { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' }, '-=0.4')
    tl.to(line2Ref.current,    { y: 0, opacity: 1, duration: 0.80, ease: 'power3.out' }, '-=0.55')
    tl.to(punchRef.current,    { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }, '-=0.45')
    tl.to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.40, ease: 'power3.out' }, '+=0.05')
    tl.to(canvasRef.current,   { opacity: 1, duration: 2.2, ease: 'power2.inOut' }, '-=0.2')
    tl.to([badgeRef.current, bottomLRef.current, bottomRRef.current], { y: 0, opacity: 1, duration: 0.35, ease: 'power3.out', stagger: 0.1 }, '-=1.2')
    return () => { tl.kill() }
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handlePointerMove}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '0 10vw', overflow: 'hidden', background: '#07080c' }}
    >
      <div ref={overlayRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: '#07080c', zIndex: 10 }} />
      <video
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  style={{
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    opacity: 0.45,
    pointerEvents: 'none',
    filter: 'brightness(0.45) contrast(1.15)'
  }}
>
  <source src="/video.mp4" type="video/mp4" />
</video>
<div
  aria-hidden="true"
  style={{
    position: 'absolute',
    inset: 0,
    zIndex: 0,
    pointerEvents: 'none',
    background:
    'linear-gradient(to right,rgba(7,8,12,0.55) 0%,rgba(7,8,12,0.25) 30%,rgba(7,8,12,0.08) 55%,rgba(7,8,12,0) 100%)'
  }}
/>

      

      <canvas ref={canvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />


      <div ref={badgeRef} aria-hidden="true" style={{ position: 'absolute', top: '6rem', right: '2rem', fontFamily: 'var(--font-inter)', fontSize: '10px', fontVariant: 'small-caps', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5F5F0', border: '1px solid rgba(245,245,240,0.18)', padding: '6px 12px', zIndex: 4 }}>
        Let&apos;s build together
      </div>

      <div style={{ position: 'relative', zIndex: 3 }}>
        <h1 aria-label="Hey, I'm Vatsal." style={{ margin: 0, lineHeight: 1.0 }}>
          <span ref={line1Ref} aria-hidden="true" style={{ display: 'block', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(3rem, 7vw, 7.5rem)', fontWeight: 700, color: '#F5F5F0', lineHeight: 1.05 }}>Hey, I&apos;m</span>
          <span ref={line2Ref} aria-hidden="true" style={{ display: 'block', fontFamily: 'var(--font-playfair)', fontSize: 'clamp(5rem, 13vw, 14rem)', fontWeight: 700, fontStyle: 'italic', color: '#F5F5F0', lineHeight: 0.9, marginLeft: '-0.04em', letterSpacing: '-0.02em' }}>Vatsal.</span>
        </h1>
        <p ref={punchRef} style={{ fontFamily: 'var(--font-inter)', fontSize: 'clamp(1rem, 1.8vw, 1.4rem)', color: '#F5F5F0', opacity: 0.65, marginTop: '1.5rem', lineHeight: 1.6, maxWidth: '520px', fontWeight: 400 }}>
          I build for the version{' '}<em style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', opacity: 1 }}>after the demo.</em>{' '}The code that runs when no one&apos;s watching.
        </p>
        <p ref={subtitleRef} style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', fontVariant: 'small-caps', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5F5F0', opacity: 0.4, marginTop: '2rem' }}>
          Builder&nbsp;&nbsp;·&nbsp;&nbsp;Engineer&nbsp;&nbsp;·&nbsp;&nbsp;Systems Thinker
        </p>
      </div>

      <span ref={bottomLRef} aria-hidden="true" style={{ position: 'absolute', bottom: '2rem', left: '2rem', fontFamily: 'var(--font-inter)', fontSize: '10px', fontVariant: 'small-caps', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5F5F0', opacity: 0.4, zIndex: 3 }}>Scroll — or don&apos;t</span>
      <span ref={bottomRRef} aria-hidden="true" style={{ position: 'absolute', bottom: '2rem', right: '2rem', fontFamily: 'var(--font-inter)', fontSize: '10px', fontVariant: 'small-caps', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#F5F5F0', opacity: 0.4, zIndex: 3 }}>[ Est. 2006 ]</span>
    </section>
  )
}