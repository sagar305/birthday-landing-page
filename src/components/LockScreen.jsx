import { useState } from 'react'
import { motion } from 'motion/react'
import FloatingBackground from './FloatingBackground'

export default function LockScreen({ lock, onUnlock }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const answers = (lock.answers || []).map((a) => a.trim().toLowerCase())

  const handleSubmit = (e) => {
    e.preventDefault()
    const guess = value.trim().toLowerCase()

    if (answers.includes(guess)) {
      onUnlock()
      return
    }

    setShake(true)
    setShowHint(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      style={{ background: lock.background || 'linear-gradient(135deg, #fff1f2 0%, #fdf2ff 45%, #eef2ff 100%)' }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <FloatingBackground count={12} />

      <motion.form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white/85 p-8 text-center shadow-2xl backdrop-blur"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          x: shake ? [0, -10, 10, -10, 10, 0] : 0,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.span
          className="mb-4 inline-block text-5xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          {lock.emoji || '💌'}
        </motion.span>

        <h1 className="font-display mb-2 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
          {lock.question || 'What do you call me? 💕'}
        </h1>

        {lock.subtitle && (
          <p className="mb-6 text-sm text-slate-500 sm:text-base">{lock.subtitle}</p>
        )}

        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={lock.placeholder || 'Type your answer...'}
          autoFocus
          className="w-full rounded-full border border-rose-200 bg-white px-5 py-3 text-center text-slate-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
        />

        <motion.button
          type="submit"
          className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 px-6 py-3 font-semibold text-white shadow-lg"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {lock.buttonText || 'Unlock'}
        </motion.button>

        {showHint && lock.hint && (
          <motion.p
            className="mt-4 text-sm text-rose-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {lock.hint}
          </motion.p>
        )}
      </motion.form>
    </motion.div>
  )
}
