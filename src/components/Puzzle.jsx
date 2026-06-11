import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'motion/react'
import Section, { SectionHeading } from './Section'

const GRID = 3

function PuzzlePiece({ image, index, inView }) {
  const row = Math.floor(index / GRID)
  const col = index % GRID

  const directions = [
    { x: -200, y: -150 },
    { x: 0, y: -200 },
    { x: 200, y: -150 },
    { x: -220, y: 0 },
    { x: 0, y: 0 },
    { x: 220, y: 0 },
    { x: -200, y: 150 },
    { x: 0, y: 200 },
    { x: 200, y: 150 },
  ]
  const from = directions[index] || { x: 0, y: 0 }

  return (
    <motion.div
      className="aspect-square w-full"
      style={{
        backgroundImage: `url(${image})`,
        backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
        backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
      }}
      initial={{ opacity: 0, x: from.x, y: from.y, rotate: from.x > 0 ? 25 : -25, scale: 0.6 }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
          : { opacity: 0, x: from.x, y: from.y, rotate: from.x > 0 ? 25 : -25, scale: 0.6 }
      }
      transition={{ duration: 0.8, delay: 0.4 + index * 0.08, type: 'spring', stiffness: 120, damping: 14 }}
    />
  )
}

function LoveMeter({ inView, label, revealText }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, 100, {
      duration: 2,
      delay: 1.2,
      ease: 'easeOut',
      onComplete: () => setDone(true),
    })
    const unsub = rounded.on('change', (v) => setDisplay(v))
    return () => {
      controls.stop()
      unsub()
    }
  }, [inView, count, rounded])

  return (
    <div className="mx-auto mt-10 max-w-md">
      {label && <p className="mb-2 text-sm font-semibold tracking-wide text-slate-500 uppercase">{label}</p>}
      <div className="h-5 w-full overflow-hidden rounded-full bg-rose-100 shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-rose-400 via-fuchsia-500 to-indigo-500"
          initial={{ width: '0%' }}
          animate={inView ? { width: '100%' } : { width: '0%' }}
          transition={{ duration: 2, delay: 1.2, ease: 'easeOut' }}
        />
      </div>
      <motion.p
        className="mt-3 font-display text-3xl font-extrabold text-rose-500"
        animate={done ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.6 }}
      >
        {done ? revealText : `${display}%`}
      </motion.p>
    </div>
  )
}

export default function Puzzle({ section }) {
  const { title, subtitle, image, meterLabel, revealText } = section
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <Section id={section.id} className="bg-white/40">
      <SectionHeading title={title} subtitle={subtitle} />
      <div ref={ref} className="mx-auto max-w-md">
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-2xl shadow-xl">
          {Array.from({ length: GRID * GRID }, (_, i) => (
            <PuzzlePiece key={i} image={image} index={i} inView={inView} />
          ))}
        </div>
        <LoveMeter inView={inView} label={meterLabel} revealText={revealText || '∞%'} />
      </div>
    </Section>
  )
}
