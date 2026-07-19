import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'

const pad = (n) => String(n).padStart(2, '0')

const FLOATERS = ['🎂', '💖', '🎁', '✨', '🎈', '💕', '🌟', '🎀']

export default function Countdown({ countdown, onFinish }) {
  const target = new Date(countdown.target).getTime()
  const [remaining, setRemaining] = useState(() => target - Date.now())
  // captured once on mount: was the target already in the past when the page loaded?
  const [alreadyPast] = useState(remaining <= 0)
  const finished = useRef(false)

  useEffect(() => {
    const id = setInterval(() => setRemaining(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  useEffect(() => {
    if (remaining > 0 || finished.current) return
    finished.current = true
    // visitor arrived after the big moment — reveal the site without fanfare
    if (alreadyPast) {
      onFinish()
      return
    }
    confetti({ particleCount: 180, spread: 110, origin: { y: 0.6 } })
    confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } })
    confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } })
    const t = setTimeout(onFinish, 1400)
    return () => clearTimeout(t)
  }, [remaining, alreadyPast, onFinish])

  if (alreadyPast) return null

  const total = Math.max(0, Math.floor(remaining / 1000))
  const units = [
    { label: 'Days', value: String(Math.floor(total / 86400)) },
    { label: 'Hours', value: pad(Math.floor((total % 86400) / 3600)) },
    { label: 'Minutes', value: pad(Math.floor((total % 3600) / 60)) },
    { label: 'Seconds', value: pad(total % 60) },
  ]

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-rose-100 via-fuchsia-100 to-indigo-100 px-6 text-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
    >
      {FLOATERS.map((emoji, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute text-3xl sm:text-4xl"
          style={{ left: `${(i * 12.5 + 6) % 100}%`, top: `${(i * 29 + 15) % 80}%` }}
          animate={{ y: [0, -18, 0], rotate: [0, i % 2 ? 12 : -12, 0] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        >
          {emoji}
        </motion.span>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.div
          className="mb-4 text-5xl sm:text-6xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          {countdown.emoji || '🎂'}
        </motion.div>
        <h1 className="font-display bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
          {countdown.title || 'Something magical unlocks in...'}
        </h1>
        {countdown.subtitle && (
          <p className="mx-auto mt-3 max-w-md text-base text-slate-500 sm:text-lg">
            {countdown.subtitle}
          </p>
        )}

        <div className="mt-10 flex items-stretch justify-center gap-3 sm:gap-5">
          {units.map((u) => (
            <div
              key={u.label}
              className="flex w-18 flex-col items-center rounded-2xl border border-white/60 bg-white/70 px-2 py-4 shadow-lg backdrop-blur sm:w-24 sm:py-5"
            >
              <motion.span
                key={u.value}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="font-display text-3xl font-bold text-rose-500 tabular-nums sm:text-5xl"
              >
                {u.value}
              </motion.span>
              <span className="mt-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase sm:text-xs">
                {u.label}
              </span>
            </div>
          ))}
        </div>

        {countdown.note && (
          <p className="mt-8 text-sm font-medium text-rose-400 sm:text-base">{countdown.note}</p>
        )}
      </motion.div>
    </motion.div>
  )
}
