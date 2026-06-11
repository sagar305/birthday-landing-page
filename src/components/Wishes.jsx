import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Section, { SectionHeading } from './Section'

const AUTOPLAY_MS = 4000

const variants = {
  enter: (direction) => ({ x: direction > 0 ? 120 : -120, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction) => ({ x: direction > 0 ? -120 : 120, opacity: 0, scale: 0.95 }),
}

export default function Wishes({ section }) {
  const { title, subtitle, items = [] } = section
  const [[index, direction], setIndex] = useState([0, 0])

  const paginate = (dir) => {
    setIndex(([prev]) => {
      const next = (prev + dir + items.length) % items.length
      return [next, dir]
    })
  }

  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setIndex(([prev]) => [(prev + 1) % items.length, 1])
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [items.length])

  if (items.length === 0) return null

  const item = items[index]

  return (
    <Section id={section.id} className="bg-white/40">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="relative mx-auto flex max-w-xl items-center justify-center gap-3 sm:gap-6">
        <button
          type="button"
          onClick={() => paginate(-1)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-rose-400 shadow-md transition hover:scale-110 hover:text-rose-500"
          aria-label="Previous wish"
        >
          ‹
        </button>

        <div className="relative h-56 w-full overflow-hidden sm:h-44">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={index}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="absolute inset-0 flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-md ring-1 ring-rose-50 sm:flex-row sm:items-center sm:gap-4 sm:text-left"
            >
              {item.avatar && (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="h-14 w-14 flex-shrink-0 rounded-full object-cover ring-2 ring-rose-200"
                />
              )}
              <div>
                <p className="font-semibold text-slate-800">{item.name}</p>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">{item.message}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => paginate(1)}
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white text-rose-400 shadow-md transition hover:scale-110 hover:text-rose-500"
          aria-label="Next wish"
        >
          ›
        </button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to wish ${i + 1}`}
            onClick={() => setIndex([i, i > index ? 1 : -1])}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? 'w-6 bg-rose-400' : 'w-2.5 bg-rose-200'
            }`}
          />
        ))}
      </div>
    </Section>
  )
}
