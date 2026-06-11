import { motion } from 'motion/react'

export default function Footer({ footer }) {
  if (!footer) return null

  return (
    <footer className="relative px-6 py-10 text-center">
      <motion.p
        className="text-sm text-slate-400"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        {footer.text}
      </motion.p>
    </footer>
  )
}
