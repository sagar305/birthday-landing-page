import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, textarea, .cursor-hover'

function isFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
}

export default function CustomCursor() {
  const [enabled] = useState(isFinePointer)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const dotX = useSpring(x, { damping: 30, stiffness: 600, mass: 0.3 })
  const dotY = useSpring(y, { damping: 30, stiffness: 600, mass: 0.3 })
  const ringX = useSpring(x, springConfig)
  const ringY = useSpring(y, springConfig)

  useEffect(() => {
    if (!enabled) return

    const move = (e) => {
      x.set(e.clientX)
      y.set(e.clientY)

      const target = e.target.closest?.(INTERACTIVE_SELECTOR)
      setHovering(Boolean(target))
    }
    const down = () => setClicking(true)
    const up = () => setClicking(false)

    window.addEventListener('mousemove', move)
    window.addEventListener('mousedown', down)
    window.addEventListener('mouseup', up)
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mousedown', down)
      window.removeEventListener('mouseup', up)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] h-2 w-2 rounded-full bg-rose-500"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: clicking ? 0.5 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border-2 border-rose-400/60 mix-blend-multiply"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
          opacity: hovering ? 1 : 0.6,
          backgroundColor: hovering ? 'rgba(244,63,94,0.08)' : 'rgba(0,0,0,0)',
          scale: clicking ? 0.85 : 1,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      />
    </>
  )
}
