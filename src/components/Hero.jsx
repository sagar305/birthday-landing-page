import { motion } from 'motion/react'

export default function Hero({ hero }) {
  if (!hero) return null

  const letters = hero.heading.split('')

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <motion.div
        className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-rose-300/40 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {hero.image && (
        <motion.img
          src={hero.image}
          alt={hero.heading}
          className="mb-8 h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl sm:h-44 sm:w-44"
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 12, delay: 0.2 }}
        />
      )}

      <motion.p
        className="mb-2 text-sm font-semibold tracking-[0.3em] text-rose-500 uppercase"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {hero.eyebrow}
      </motion.p>

      <h1 className="font-display flex flex-wrap justify-center text-4xl font-extrabold text-slate-800 sm:text-6xl md:text-7xl">
        {letters.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40, rotate: 10 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.5 + i * 0.04, type: 'spring', stiffness: 200, damping: 14 }}
            className="bg-gradient-to-br from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent"
          >
            {char === ' ' ? ' ' : char}
          </motion.span>
        ))}
      </h1>

      <motion.p
        className="mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7 }}
      >
        {hero.subheading}
      </motion.p>

      {hero.ctaText && (
        <motion.div
          className="mt-12 flex flex-col items-center gap-2 text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.6 }}
        >
          <span className="text-sm font-medium">{hero.ctaText}</span>
          <motion.span
            className="text-2xl"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ↓
          </motion.span>
        </motion.div>
      )}
    </section>
  )
}
