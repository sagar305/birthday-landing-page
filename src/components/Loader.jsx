import { motion } from 'motion/react'

export default function Loader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-indigo-50">
      <motion.span
        className="text-6xl"
        animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        🎂
      </motion.span>
      <p className="text-sm font-medium text-slate-400">Preparing your surprise...</p>
    </div>
  )
}
