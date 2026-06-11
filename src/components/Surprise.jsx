import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import Section, { SectionHeading } from './Section'

function fireConfetti() {
  const duration = 2.5 * 1000
  const end = Date.now() + duration

  const colors = ['#fb7185', '#a855f7', '#facc15', '#38bdf8']

  ;(function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()

  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors,
  })
}

export default function Surprise({ section }) {
  const [revealed, setRevealed] = useState(false)
  const { title, subtitle, buttonText, revealHeading, revealMessage, revealImage } = section

  const handleClick = () => {
    setRevealed(true)
    fireConfetti()
  }

  return (
    <Section id={section.id}>
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="button"
              onClick={handleClick}
              className="rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-10 py-5 text-lg font-bold text-white shadow-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: [1, 1.05, 1],
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{
                scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
                opacity: { duration: 0.4 },
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {buttonText}
            </motion.button>
          ) : (
            <motion.div
              key="reveal"
              className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white/90 p-8 text-center shadow-2xl backdrop-blur"
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 140, damping: 14 }}
            >
              <motion.h3
                className="font-display mb-4 text-2xl font-bold text-rose-500 sm:text-3xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                {revealHeading}
              </motion.h3>

              {revealImage && (
                <motion.img
                  src={revealImage}
                  alt={revealHeading}
                  className="mx-auto mb-4 h-48 w-full rounded-2xl object-cover"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.5 }}
                />
              )}

              <motion.p
                className="text-base leading-relaxed text-slate-600 sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {revealMessage}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}
