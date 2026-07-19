import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'motion/react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { SectionHeading } from './Section'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const phase = (p, a, b) => clamp01((p - a) / (b - a))
const easeInOut = (t) => t * t * (3 - 2 * t)
// deterministic pseudo-random so render output is stable
const hash = (n) => Math.abs((Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1)

const SLICE_THETA = 0.7
const HALF = SLICE_THETA / 2
const CONFETTI_COUNT = 90
const CONFETTI_COLORS = ['#fb7185', '#a855f7', '#facc15', '#34d399', '#60a5fa', '#f472b6']

const CONFETTI = Array.from({ length: CONFETTI_COUNT }, () => {
  const angle = Math.random() * Math.PI * 2
  const spread = 0.4 + Math.random() * 1.8
  return {
    dir: new THREE.Vector3(Math.cos(angle) * spread, 1.6 + Math.random() * 1.8, Math.sin(angle) * spread),
    rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    spin: 1 + Math.random() * 4,
    color: new THREE.Color(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]),
  }
})

/* Layered sponge-and-cream texture for the cut faces of the cake */
function makeSpongeTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#f0d3a4'
  ctx.fillRect(0, 0, 256, 256)
  const bands = [
    [58, 20, '#fdf4e3'],
    [122, 22, '#f7c8d8'],
    [188, 20, '#fdf4e3'],
  ]
  for (const [y, h, color] of bands) {
    ctx.fillStyle = color
    ctx.fillRect(0, y, 256, h)
  }
  for (let i = 0; i < 1600; i++) {
    ctx.fillStyle = Math.random() < 0.5 ? 'rgba(140,100,50,0.12)' : 'rgba(255,255,255,0.12)'
    const x = Math.random() * 256
    const y = Math.random() * 256
    const r = Math.random() * 1.8 + 0.4
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 7)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}
const SPONGE_TEX = typeof document !== 'undefined' ? makeSpongeTexture() : null

function IcingMaterial({ color }) {
  return <meshPhysicalMaterial color={color} roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.4} />
}

/* A cake tier sector (partial cylinder) with layered-sponge cut faces */
function CakeSector({ radius, height, thetaStart, thetaLength, color }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 64, 1, false, thetaStart, thetaLength]} />
        <IcingMaterial color={color} />
      </mesh>
      {[thetaStart, thetaStart + thetaLength].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0, 0, radius / 2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[radius, height]} />
            <meshStandardMaterial map={SPONGE_TEX} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* icing rim, laid flat and aligned with the sector's arc */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, thetaStart - Math.PI / 2]}>
        <torusGeometry args={[radius, 0.05, 14, 64, thetaLength]} />
        <IcingMaterial color="#fffaf4" />
      </mesh>
      {/* icing drips running down the side */}
      {Array.from({ length: Math.max(6, Math.round(thetaLength * 8)) }, (_, i) => {
        const n = Math.max(6, Math.round(thetaLength * 8))
        const a = thetaStart + ((i + 0.5) / n) * thetaLength
        const len = 0.12 + hash(i + radius * 31) * 0.16
        return (
          <mesh
            key={i}
            position={[Math.sin(a) * radius, height / 2 - len / 2, Math.cos(a) * radius]}
            scale={[1, len / 0.09, 1]}
          >
            <sphereGeometry args={[0.045, 10, 10]} />
            <IcingMaterial color="#fffaf4" />
          </mesh>
        )
      })}
    </group>
  )
}

function Candle({ position, flameRef, tint }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.032, 0.2, 12]} />
        <meshPhysicalMaterial color={tint} roughness={0.3} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 0.215, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.03, 6]} />
        <meshStandardMaterial color="#3f2d1d" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.032, 12, 12]} />
        <meshStandardMaterial
          color="#ffd27a"
          emissive="#ff8c1a"
          emissiveIntensity={4}
          transparent
          opacity={0.95}
        />
      </mesh>
    </group>
  )
}

/* Chef-knife blade outline, extruded */
function makeBladeGeometry() {
  const s = new THREE.Shape()
  s.moveTo(0, 0.06)
  s.lineTo(0.52, 0.06)
  s.quadraticCurveTo(0.66, 0.05, 0.6, -0.01)
  s.quadraticCurveTo(0.3, -0.07, 0, -0.05)
  s.closePath()
  return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004 })
}
const BLADE_GEOMETRY = makeBladeGeometry()

const SKIN = '#eeb98e'
const HAIR = '#4a2c17'
const DRESS = '#e75f8f'

function Girl({ shoulderRef, elbowRef, girlRef }) {
  const dressPoints = useMemo(
    () =>
      [
        [0.05, 1.34],
        [0.17, 1.32],
        [0.19, 1.18],
        [0.21, 1.05],
        [0.27, 0.88],
        [0.38, 0.65],
        [0.5, 0.42],
        [0.58, 0.24],
        [0.6, 0.18],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
    [],
  )

  return (
    <group ref={girlRef} position={[-1.1, 0, -1.3]} rotation={[0, 0.5, 0]}>
      {/* legs + shoes */}
      {[-0.13, 0.13].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.05, 0.3, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          <mesh position={[x, 0.035, 0.04]} castShadow scale={[1, 0.55, 1.5]}>
            <sphereGeometry args={[0.075, 14, 14]} />
            <meshPhysicalMaterial color="#b03052" roughness={0.25} clearcoat={0.8} />
          </mesh>
        </group>
      ))}
      {/* A-line dress */}
      <mesh castShadow>
        <latheGeometry args={[dressPoints, 40]} />
        <meshStandardMaterial color={DRESS} roughness={0.75} side={THREE.DoubleSide} />
      </mesh>
      {/* waist sash */}
      <mesh position={[0, 1.16, 0]}>
        <cylinderGeometry args={[0.215, 0.225, 0.07, 24]} />
        <meshPhysicalMaterial color="#fbd0e0" roughness={0.4} clearcoat={0.4} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <capsuleGeometry args={[0.17, 0.22, 6, 16]} />
        <meshStandardMaterial color={DRESS} roughness={0.75} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.14, 12]} />
        <meshStandardMaterial color={SKIN} roughness={0.6} />
      </mesh>
      {/* head */}
      <group position={[0, 1.75, 0]}>
        <mesh castShadow scale={[1, 1.08, 1]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        {/* back hair */}
        <mesh position={[0, 0.06, -0.06]} scale={[1.12, 1.12, 1.08]} castShadow>
          <sphereGeometry args={[0.3, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color={HAIR} roughness={0.45} />
        </mesh>
        {/* long hair falling behind the shoulders */}
        <mesh position={[0, -0.18, -0.17]} scale={[1, 1.7, 0.7]} castShadow>
          <sphereGeometry args={[0.24, 20, 20]} />
          <meshStandardMaterial color={HAIR} roughness={0.45} />
        </mesh>
        {/* side-swept bangs hugging the forehead */}
        {[
          [-0.16, 0.17, 0.21, 0.55],
          [-0.02, 0.2, 0.23, 0.1],
          [0.13, 0.18, 0.21, -0.45],
        ].map(([x, y, z, rz], i) => (
          <mesh key={i} position={[x, y, z]} rotation={[0.65, 0, rz]} scale={[0.65, 0.85, 0.35]}>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshStandardMaterial color={HAIR} roughness={0.45} />
          </mesh>
        ))}
        {/* space buns */}
        {[-0.26, 0.26].map((x) => (
          <mesh key={x} position={[x, 0.28, -0.02]} castShadow>
            <sphereGeometry args={[0.12, 18, 18]} />
            <meshStandardMaterial color={HAIR} roughness={0.45} />
          </mesh>
        ))}
        {/* eyes: sclera + iris + highlight */}
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 0.03, 0.26]}>
            <mesh scale={[1, 1.25, 0.6]}>
              <sphereGeometry args={[0.045, 14, 14]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.024]} scale={[1, 1.2, 0.5]}>
              <sphereGeometry args={[0.028, 12, 12]} />
              <meshStandardMaterial color="#3d2314" roughness={0.15} />
            </mesh>
            <mesh position={[0.012, 0.018, 0.04]}>
              <sphereGeometry args={[0.011, 8, 8]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* brows, gently raised */}
        {[-0.1, 0.1].map((x) => (
          <mesh key={x} position={[x, 0.13, 0.265]} rotation={[0.25, 0, x > 0 ? 0.05 : -0.05]}>
            <boxGeometry args={[0.06, 0.011, 0.014]} />
            <meshStandardMaterial color={HAIR} />
          </mesh>
        ))}
        {/* nose + smile + blush */}
        <mesh position={[0, -0.04, 0.3]} scale={[1, 1.2, 0.7]}>
          <sphereGeometry args={[0.022, 10, 10]} />
          <meshStandardMaterial color="#e6a97e" roughness={0.6} />
        </mesh>
        {/* big open smile: dark mouth + rosy lower lip */}
        <group position={[0, -0.1, 0.296]} rotation={[0.3, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI]}>
            <circleGeometry args={[0.055, 20, 0, Math.PI]} />
            <meshStandardMaterial color="#8c3a30" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.002, 0.001]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.055, 0.011, 8, 20, Math.PI]} />
            <meshStandardMaterial color="#d96a5c" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.014, 0.002]} scale={[1, 0.55, 0.4]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial color="#ef8d8d" roughness={0.5} />
          </mesh>
        </group>
        {[-0.18, 0.18].map((x) => (
          <mesh key={x} position={[x, -0.06, 0.24]} scale={[1, 0.7, 0.4]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshStandardMaterial color="#f4a3a3" roughness={0.8} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      {/* left arm, gently bent and resting */}
      <group position={[-0.22, 1.42, 0]} rotation={[0.15, 0, 0.55]}>
        <mesh position={[0, -0.19, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.28, 4, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <group position={[0, -0.38, 0]} rotation={[-0.6, 0, -0.2]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.24, 4, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.32, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
        </group>
      </group>
      {/* right arm: shoulder + elbow joints, holds the knife */}
      <group ref={shoulderRef} position={[0.22, 1.42, 0.04]} rotation={[-0.35, 0, -0.3]}>
        <mesh position={[0, -0.19, 0]} castShadow>
          <capsuleGeometry args={[0.05, 0.28, 4, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.6} />
        </mesh>
        <group ref={elbowRef} position={[0, -0.38, 0]} rotation={[-0.6, 0, 0]}>
          <mesh position={[0, -0.16, 0]} castShadow>
            <capsuleGeometry args={[0.045, 0.24, 4, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* hand */}
          <mesh position={[0, -0.33, 0]} castShadow>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color={SKIN} roughness={0.6} />
          </mesh>
          {/* knife: wooden handle + steel blade pointing down past the hand */}
          <group position={[0, -0.33, 0]}>
            <mesh position={[0, -0.02, 0]} castShadow>
              <capsuleGeometry args={[0.028, 0.18, 4, 10]} />
              <meshPhysicalMaterial color="#5d3a1a" roughness={0.5} clearcoat={0.3} />
            </mesh>
            <mesh
              geometry={BLADE_GEOMETRY}
              position={[0.035, -0.14, -0.006]}
              rotation={[0, 0, -Math.PI / 2]}
              castShadow
            >
              <meshPhysicalMaterial color="#cdd3da" metalness={1} roughness={0.18} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

function Scene({ progress }) {
  const groupRef = useRef()
  const girlRef = useRef()
  const shoulderRef = useRef()
  const elbowRef = useRef()
  const sliceRef = useRef()
  const confettiRef = useRef()
  const candleLightRef = useRef()
  const flamesRef = useRef([])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!confettiRef.current) return
    CONFETTI.forEach((c, i) => confettiRef.current.setColorAt(i, c.color))
    confettiRef.current.instanceColor.needsUpdate = true
  }, [])

  useFrame(({ clock }) => {
    const p = progress.get()
    const t = clock.elapsedTime

    const appear = easeInOut(phase(p, 0, 0.15))
    const raise = easeInOut(phase(p, 0.2, 0.45))
    const cut = easeInOut(phase(p, 0.5, 0.62))
    const slide = easeInOut(phase(p, 0.68, 0.88))
    const burst = phase(p, 0.62, 1)

    if (groupRef.current) {
      groupRef.current.scale.setScalar(0.9 + 0.1 * appear)
      groupRef.current.position.y = -0.3 + 0.15 * appear
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.03
    }

    if (girlRef.current) {
      girlRef.current.position.y = Math.sin(t * 2) * 0.015
      girlRef.current.rotation.x = 0.14 * cut * (1 - slide)
    }

    // shoulder swings the arm overhead, elbow cocks then extends through the cut
    if (shoulderRef.current) {
      shoulderRef.current.rotation.x = -0.35 - 1.85 * raise + 1.5 * cut
      shoulderRef.current.rotation.z = -0.3 + 0.3 * raise
    }
    if (elbowRef.current) {
      elbowRef.current.rotation.x = -0.6 - 0.5 * raise + 0.95 * cut
    }

    // the freed slice glides out toward the dessert plate
    if (sliceRef.current) {
      sliceRef.current.position.z = 1.05 * slide
      sliceRef.current.position.x = 0.45 * slide
      sliceRef.current.rotation.y = -0.25 * slide
    }

    flamesRef.current.forEach((flame, i) => {
      if (!flame) return
      const flicker = 1 + Math.sin(t * 12 + i * 2.1) * 0.2
      flame.scale.set(flicker, (1 + Math.sin(t * 9 + i) * 0.35) * 1.6, flicker)
    })
    if (candleLightRef.current) {
      candleLightRef.current.intensity = 1.6 + Math.sin(t * 11) * 0.4 + Math.sin(t * 23) * 0.2
    }

    if (confettiRef.current) {
      confettiRef.current.visible = burst > 0
      const travel = Math.sqrt(burst)
      CONFETTI.forEach((c, i) => {
        dummy.position.set(
          c.dir.x * travel * 1.6,
          1.1 + c.dir.y * travel - 3.2 * burst * burst,
          c.dir.z * travel * 1.6,
        )
        dummy.rotation.set(c.rot.x + t * c.spin, c.rot.y + t * c.spin, c.rot.z)
        dummy.updateMatrix()
        confettiRef.current.setMatrixAt(i, dummy.matrix)
      })
      confettiRef.current.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <group ref={groupRef}>
      <hemisphereLight args={['#fff5f7', '#d9c2cf', 0.5]} />
      <directionalLight
        position={[3.5, 6, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#c7d6ff" />
      <pointLight ref={candleLightRef} position={[0, 1.6, 0]} color="#ffb35c" intensity={1.6} distance={4} />

      <Girl shoulderRef={shoulderRef} elbowRef={elbowRef} girlRef={girlRef} />

      {/* soft contact shadow on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.059, 0]} receiveShadow>
        <circleGeometry args={[7, 48]} />
        <shadowMaterial opacity={0.22} />
      </mesh>

      {/* ceramic cake plate */}
      <mesh position={[0, -0.02, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.55, 1.62, 0.07, 64]} />
        <meshPhysicalMaterial color="#f7f2ee" roughness={0.15} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.02, 10, 64]} />
        <meshPhysicalMaterial color="#e9dfd8" roughness={0.2} clearcoat={0.8} />
      </mesh>

      {/* main cake, with a wedge-shaped gap facing the viewer */}
      <group position={[0, 0.28, 0]}>
        <CakeSector radius={1.15} height={0.52} thetaStart={HALF} thetaLength={Math.PI * 2 - SLICE_THETA} color="#f293b8" />
      </group>
      <group position={[0, 0.76, 0]}>
        <CakeSector radius={0.78} height={0.44} thetaStart={HALF} thetaLength={Math.PI * 2 - SLICE_THETA} color="#f4a7c6" />
      </group>

      {/* the slice that gets cut free (slightly narrower to avoid z-fighting) */}
      <group ref={sliceRef}>
        <group position={[0, 0.28, 0]}>
          <CakeSector radius={1.15} height={0.52} thetaStart={-HALF + 0.015} thetaLength={SLICE_THETA - 0.03} color="#f293b8" />
        </group>
        <group position={[0, 0.76, 0]}>
          <CakeSector radius={0.78} height={0.44} thetaStart={-HALF + 0.015} thetaLength={SLICE_THETA - 0.03} color="#f4a7c6" />
        </group>
      </group>

      {/* small dessert plate the slice slides toward */}
      <mesh position={[0.5, 0.02, 1.3]} receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.05, 48]} />
        <meshPhysicalMaterial color="#fdf5f8" roughness={0.15} clearcoat={0.9} clearcoatRoughness={0.1} />
      </mesh>

      {/* candles on top */}
      {[
        [-0.32, 0.98, -0.25, '#c4b5fd'],
        [0.3, 0.98, -0.3, '#f9a8d4'],
        [0, 0.98, -0.52, '#93c5fd'],
      ].map(([x, y, z, tint], i) => (
        <Candle key={i} position={[x, y, z]} tint={tint} flameRef={(el) => (flamesRef.current[i] = el)} />
      ))}

      {/* glossy cherries around the bottom tier */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = HALF + 0.35 + (i * (Math.PI * 2 - SLICE_THETA - 0.7)) / 7
        return (
          <mesh key={i} position={[Math.sin(a) * 0.95, 0.58, Math.cos(a) * 0.95]} castShadow>
            <sphereGeometry args={[0.07, 16, 16]} />
            <meshPhysicalMaterial color="#c21836" roughness={0.1} clearcoat={1} clearcoatRoughness={0.05} />
          </mesh>
        )
      })}

      <instancedMesh ref={confettiRef} args={[undefined, undefined, CONFETTI_COUNT]} visible={false}>
        <boxGeometry args={[0.06, 0.06, 0.012]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  )
}

function Caption({ progress, range, children }) {
  const [a, b] = range
  const opacity = useTransform(progress, [a, a + 0.04, b - 0.04, b], [0, 1, 1, 0])
  const y = useTransform(progress, [a, a + 0.04], [16, 0])
  return (
    <motion.p
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-10 text-center text-lg font-medium text-rose-500 sm:text-xl"
    >
      {children}
    </motion.p>
  )
}

export default function CakeCutting({ section }) {
  const wrapRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ['start start', 'end end'],
  })

  const captions = section.captions ?? [
    { text: 'She has been waiting for this moment... 🎀', range: [0.03, 0.22] },
    { text: 'Make a wish, birthday girl ✨', range: [0.26, 0.48] },
    { text: 'And... cut! 🔪🎂', range: [0.52, 0.68] },
    { text: 'The first slice is yours 💕', range: [0.74, 0.98] },
  ]

  return (
    <section id={section.id} ref={wrapRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="px-6 pt-14">
          <SectionHeading title={section.title} subtitle={section.subtitle} />
        </div>
        <div className="relative flex-1">
          <Canvas
            shadows
            camera={{ position: [0, 2.5, 6.6], fov: 40 }}
            dpr={[1, 2]}
            gl={{ antialias: true }}
            onCreated={({ gl, scene, camera }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 0.9
              camera.lookAt(0, 0.85, 0)
              const pmrem = new THREE.PMREMGenerator(gl)
              scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
              scene.environmentIntensity = 0.55
            }}
          >
            <Scene progress={scrollYProgress} />
          </Canvas>
          {captions.map((c, i) => (
            <Caption key={i} progress={scrollYProgress} range={c.range}>
              {c.text}
            </Caption>
          ))}
        </div>
      </div>
    </section>
  )
}
