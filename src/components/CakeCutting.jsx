import { useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { motion, useScroll, useTransform } from 'motion/react'
import * as THREE from 'three'
import { SectionHeading } from './Section'

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const phase = (p, a, b) => clamp01((p - a) / (b - a))
const easeInOut = (t) => t * t * (3 - 2 * t)

const SLICE_THETA = 0.7
const CONFETTI_COUNT = 70
const CONFETTI_COLORS = ['#fb7185', '#a855f7', '#facc15', '#34d399', '#60a5fa', '#f472b6']

const CONFETTI = Array.from({ length: CONFETTI_COUNT }, () => {
  const angle = Math.random() * Math.PI * 2
  const spread = 0.4 + Math.random() * 1.6
  return {
    dir: new THREE.Vector3(Math.cos(angle) * spread, 1.6 + Math.random() * 1.6, Math.sin(angle) * spread),
    rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    spin: 1 + Math.random() * 4,
    color: new THREE.Color(CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]),
  }
})

/* A cake tier sector (partial cylinder) with flat "cut" faces on both ends */
function CakeSector({ radius, height, thetaStart, thetaLength, color, innerColor = '#fde4c8' }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 48, 1, false, thetaStart, thetaLength]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[thetaStart, thetaStart + thetaLength].map((angle, i) => (
        <group key={i} rotation={[0, angle, 0]}>
          <mesh position={[0, 0, radius / 2]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[radius, height]} />
            <meshStandardMaterial color={innerColor} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* icing rim, laid flat and aligned with the sector's arc */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, thetaStart - Math.PI / 2]}>
        <torusGeometry args={[radius, 0.045, 12, 48, thetaLength]} />
        <meshStandardMaterial color="#fff7f0" />
      </mesh>
    </group>
  )
}

function Candle({ position, flameRef }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.18, 12]} />
        <meshStandardMaterial color="#c4b5fd" />
      </mesh>
      <mesh ref={flameRef} position={[0, 0.24, 0]}>
        <coneGeometry args={[0.035, 0.1, 10]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f97316" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

function Girl({ armRef, girlRef }) {
  const skin = '#f9c9a3'
  const hair = '#5b3a24'
  const dress = '#f472b6'
  return (
    <group ref={girlRef} position={[-1.05, 0, -1.35]} rotation={[0, 0.5, 0]}>
      {/* dress */}
      <mesh position={[0, 0.62, 0]}>
        <coneGeometry args={[0.58, 1.18, 24]} />
        <meshStandardMaterial color={dress} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.22, 0]}>
        <cylinderGeometry args={[0.18, 0.24, 0.42, 16]} />
        <meshStandardMaterial color={dress} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* hair cap + space buns */}
      <mesh position={[0, 1.7, -0.07]}>
        <sphereGeometry args={[0.34, 24, 24]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[-0.3, 1.94, -0.04]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      <mesh position={[0.3, 1.94, -0.04]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color={hair} />
      </mesh>
      {/* eyes + blush */}
      {[-0.11, 0.11].map((x) => (
        <mesh key={`eye${x}`} position={[x, 1.65, 0.28]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color="#2d1a12" />
        </mesh>
      ))}
      {[-0.19, 0.19].map((x) => (
        <mesh key={`blush${x}`} position={[x, 1.56, 0.26]}>
          <sphereGeometry args={[0.045, 10, 10]} />
          <meshStandardMaterial color="#fda4af" />
        </mesh>
      ))}
      {/* left arm, resting */}
      <group position={[-0.26, 1.36, 0]} rotation={[0, 0, 0.5]}>
        <mesh position={[0, -0.32, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.64, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      {/* right arm with knife — pivots at the shoulder */}
      <group ref={armRef} position={[0.26, 1.36, 0.05]} rotation={[-0.25, 0, -0.35]}>
        <mesh position={[0, -0.36, 0]}>
          <cylinderGeometry args={[0.06, 0.055, 0.72, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        {/* knife: handle + blade continuing past the hand */}
        <mesh position={[0, -0.88, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.22, 10]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0, -1.28, 0]}>
          <boxGeometry args={[0.035, 0.62, 0.13]} />
          <meshStandardMaterial color="#d7dde6" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>
    </group>
  )
}

function Scene({ progress }) {
  const groupRef = useRef()
  const girlRef = useRef()
  const armRef = useRef()
  const sliceRef = useRef()
  const confettiRef = useRef()
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
      groupRef.current.scale.setScalar(0.85 + 0.15 * appear)
      groupRef.current.position.y = -0.3 + 0.2 * appear
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.04
    }

    if (girlRef.current) {
      girlRef.current.position.y = Math.sin(t * 2) * 0.02
      girlRef.current.rotation.x = 0.18 * cut * (1 - slide)
    }

    // idle -> raised overhead -> swung down into the cake
    if (armRef.current) {
      armRef.current.rotation.x = -0.25 - 2.1 * raise + 1.15 * cut
      armRef.current.rotation.z = -0.35 + 0.35 * raise
    }

    // the slice glides out toward the little plate
    if (sliceRef.current) {
      sliceRef.current.position.z = 1.05 * slide
      sliceRef.current.position.x = 0.45 * slide
      sliceRef.current.rotation.y = -0.25 * slide
    }

    flamesRef.current.forEach((flame, i) => {
      if (!flame) return
      const flicker = 1 + Math.sin(t * 12 + i * 2.1) * 0.25
      flame.scale.set(flicker, 1 + Math.sin(t * 9 + i) * 0.3, flicker)
    })

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

  const half = SLICE_THETA / 2

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 6, 4]} intensity={1.3} />
      <pointLight position={[-3, 3, 3]} intensity={12} color="#fda4af" />

      <Girl armRef={armRef} girlRef={girlRef} />

      {/* table plate */}
      <mesh position={[0, -0.03, 0]}>
        <cylinderGeometry args={[1.7, 1.8, 0.08, 48]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* main cake, with a wedge-shaped gap facing the viewer */}
      <group>
        <group position={[0, 0.26, 0]}>
          <CakeSector radius={1.15} height={0.52} thetaStart={half} thetaLength={Math.PI * 2 - SLICE_THETA} color="#fca5c0" />
        </group>
        <group position={[0, 0.74, 0]}>
          <CakeSector radius={0.78} height={0.44} thetaStart={half} thetaLength={Math.PI * 2 - SLICE_THETA} color="#f9a8d4" />
        </group>
      </group>

      {/* the slice that gets cut free (slightly narrower to avoid z-fighting) */}
      <group ref={sliceRef}>
        <group position={[0, 0.26, 0]}>
          <CakeSector radius={1.15} height={0.52} thetaStart={-half + 0.015} thetaLength={SLICE_THETA - 0.03} color="#fca5c0" />
        </group>
        <group position={[0, 0.74, 0]}>
          <CakeSector radius={0.78} height={0.44} thetaStart={-half + 0.015} thetaLength={SLICE_THETA - 0.03} color="#f9a8d4" />
        </group>
      </group>

      {/* small dessert plate the slice slides toward */}
      <mesh position={[0.5, 0.02, 1.3]}>
        <cylinderGeometry args={[0.55, 0.6, 0.05, 32]} />
        <meshStandardMaterial color="#fdf2f8" />
      </mesh>

      {/* candles on top */}
      {[
        [-0.32, 0.96, -0.25],
        [0.3, 0.96, -0.3],
        [0, 0.96, -0.55],
      ].map((pos, i) => (
        <Candle key={i} position={pos} flameRef={(el) => (flamesRef.current[i] = el)} />
      ))}

      {/* cherries around the bottom tier */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = half + 0.35 + (i * (Math.PI * 2 - SLICE_THETA - 0.7)) / 7
        return (
          <mesh key={i} position={[Math.sin(a) * 0.95, 0.56, Math.cos(a) * 0.95]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#e11d48" />
          </mesh>
        )
      })}

      <instancedMesh ref={confettiRef} args={[undefined, undefined, CONFETTI_COUNT]} visible={false}>
        <boxGeometry args={[0.07, 0.07, 0.015]} />
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
            camera={{ position: [0, 2.5, 6.6], fov: 40 }}
            dpr={[1, 2]}
            onCreated={({ camera }) => camera.lookAt(0, 0.85, 0)}
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
