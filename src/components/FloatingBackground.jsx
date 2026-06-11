import { motion } from 'motion/react'
import { useMemo } from 'react'

const EMOJIS = ['🎈', '🎉', '✨', '💖', '🎂', '🌸', '💫', '🎊']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export default function FloatingBackground({ count = 18 }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        left: randomBetween(0, 100),
        size: randomBetween(20, 48),
        duration: randomBetween(14, 28),
        delay: randomBetween(0, 10),
        drift: randomBetween(-60, 60),
      })),
    [count]
  )

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((item) => (
        <motion.span
          key={item.id}
          className="absolute select-none opacity-70"
          style={{
            left: `${item.left}%`,
            fontSize: item.size,
            bottom: '-10%',
          }}
          initial={{ y: '10vh', opacity: 0 }}
          animate={{
            y: '-120vh',
            x: [0, item.drift, 0],
            opacity: [0, 1, 1, 0],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {item.emoji}
        </motion.span>
      ))}
    </div>
  )
}
