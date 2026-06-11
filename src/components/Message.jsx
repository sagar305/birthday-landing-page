import { motion } from 'motion/react'
import Section, { SectionHeading } from './Section'

export default function Message({ section }) {
  const { title, body, signature } = section
  const paragraphs = (body || '').split('\n').filter(Boolean)

  return (
    <Section id={section.id}>
      <SectionHeading title={title} />
      <motion.div
        className="relative mx-auto max-w-2xl rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-xl backdrop-blur sm:p-12"
        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.span
          className="absolute -top-6 -left-2 text-6xl text-rose-200"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          “
        </motion.span>

        {paragraphs.map((p, i) => (
          <motion.p
            key={i}
            className="mb-4 text-left text-base leading-relaxed whitespace-pre-line text-slate-600 last:mb-0 sm:text-lg"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
          >
            {p}
          </motion.p>
        ))}

        {signature && (
          <motion.p
            className="font-script mt-6 text-right text-2xl text-rose-500"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + paragraphs.length * 0.15, duration: 0.6 }}
          >
            {signature}
          </motion.p>
        )}
      </motion.div>
    </Section>
  )
}
