import { motion } from 'motion/react'

export default function Section({ id, className = '', children }) {
  return (
    <section id={id} className={`relative px-6 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}

export function SectionHeading({ title, subtitle }) {
  return (
    <motion.div
      className="mb-12 text-center"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <h2 className="font-display bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 sm:text-lg">{subtitle}</p>
      )}
    </motion.div>
  )
}
