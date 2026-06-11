import { useState } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import FloatingBackground from './FloatingBackground'

function fireHeartBurst() {
  const heart = confetti.shapeFromText({ text: '💖', scalar: 3 })
  const sparkle = confetti.shapeFromText({ text: '✨', scalar: 2.5 })

  confetti({
    particleCount: 40,
    spread: 100,
    startVelocity: 35,
    gravity: 0.6,
    scalar: 1,
    shapes: [heart, sparkle],
    origin: { y: 0.55 },
  })
}

export default function HeartGate({ heartGate, onUnlock }) {
  const [stage, setStage] = useState('idle')

  const handleClick = () => {
    if (stage !== 'idle') return
    setStage('opening')
    fireHeartBurst()

    setTimeout(() => setStage('open'), 700)
    setTimeout(() => onUnlock(), 1900)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center px-6"
      style={{
        background:
          heartGate.background || 'linear-gradient(135deg, #fff1f2 0%, #fdf2ff 45%, #eef2ff 100%)',
      }}
      animate={{ opacity: stage === 'open' ? 0 : 1 }}
      transition={{ duration: 0.8, delay: stage === 'open' ? 1 : 0, ease: 'easeInOut' }}
    >
      <FloatingBackground count={12} />

      <div className="relative flex flex-col items-center text-center">
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Unlock the surprise"
          className="cursor-hover relative flex h-32 w-32 items-center justify-center text-7xl sm:h-40 sm:w-40 sm:text-8xl"
          animate={
            stage === 'idle'
              ? { scale: [1, 1.12, 1] }
              : stage === 'opening'
                ? { scale: [1, 1.5, 1.3], rotate: [0, -10, 10, 0] }
                : { scale: 1.3, opacity: 0 }
          }
          transition={
            stage === 'idle'
              ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
              : { duration: 0.7, ease: 'easeOut' }
          }
        >
          💗
          <motion.span
            className="absolute -right-2 -bottom-2 text-3xl sm:text-4xl"
            animate={
              stage === 'idle'
                ? { rotate: [0, -8, 8, 0] }
                : { y: -60, x: 40, rotate: 45, opacity: 0 }
            }
            transition={
              stage === 'idle'
                ? { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.6, ease: 'easeOut' }
            }
          >
            🔒
          </motion.span>
        </motion.button>

        <motion.h2
          className="font-display mt-6 max-w-sm bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: stage === 'open' ? 0 : 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {stage === 'idle'
            ? heartGate.title || "There's something locked just for you..."
            : heartGate.unlockedMessage || 'Now scroll down and let it melt your heart 💕'}
        </motion.h2>

        {stage === 'idle' && heartGate.subtitle && (
          <motion.p
            className="mt-3 text-sm text-slate-500 sm:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {heartGate.subtitle}
          </motion.p>
        )}

        {stage === 'open' && (
          <motion.span
            className="mt-4 text-3xl"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 0.3, duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        )}
      </div>
    </motion.div>
  )
}
